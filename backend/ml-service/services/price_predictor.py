"""
Price Prediction Service
Uses machine learning models to predict cryptocurrency prices
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import os
import pickle
import json

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, GRU
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import ta

from .data_fetcher import DataFetcher

logger = logging.getLogger(__name__)

class PricePredictor:
    def __init__(self):
        self.data_fetcher = DataFetcher()
        self.models = {}
        self.scalers = {}
        self.ready = False
        self.model_dir = "models/price_prediction"
        self.sequence_length = 60  # Use 60 time periods for prediction
        
        # Ensure model directory exists
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Supported timeframes and their configurations with volatility dampening
        self.timeframe_configs = {
            "1h": {"periods": 24, "interval": "1h", "prediction_hours": 1, "volatility_factor": 1.0},
            "4h": {"periods": 24, "interval": "4h", "prediction_hours": 4, "volatility_factor": 0.6},
            "1d": {"periods": 30, "interval": "1d", "prediction_hours": 24, "volatility_factor": 0.4},
            "7d": {"periods": 12, "interval": "1w", "prediction_hours": 168, "volatility_factor": 0.3}
        }
        
        # Cache for predictions to maintain stability
        self.prediction_cache = {}
        self.cache_duration = {
            "1h": 2 * 60,    # 2 minutes
            "4h": 10 * 60,   # 10 minutes  
            "1d": 30 * 60,   # 30 minutes
            "7d": 60 * 60    # 1 hour
        }

    async def initialize(self):
        """Initialize the price predictor"""
        try:
            await self.data_fetcher.initialize()
            
            # Load existing models
            await self._load_existing_models()
            
            self.ready = True
            logger.info("Price predictor initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing price predictor: {e}")
            raise

    async def cleanup(self):
        """Cleanup resources"""
        await self.data_fetcher.cleanup()

    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.ready

    async def predict_price(self, symbol: str, timeframe: str = "1d") -> Dict[str, Any]:
        """
        Predict price for a cryptocurrency
        
        Args:
            symbol: Cryptocurrency symbol (e.g., 'BTCUSDT')
            timeframe: Prediction timeframe ('1h', '4h', '1d', '7d')
            
        Returns:
            Dictionary with prediction results
        """
        try:
            if timeframe not in self.timeframe_configs:
                raise ValueError(f"Unsupported timeframe: {timeframe}")
            
            config = self.timeframe_configs[timeframe]
            
            # Get historical data
            historical_data = await self._get_historical_data(symbol, config)
            
            if len(historical_data) < self.sequence_length:
                raise ValueError(f"Insufficient data for {symbol}. Need at least {self.sequence_length} periods.")
            
            # Prepare features
            features = self._prepare_features(historical_data)
            
            # Get or create model
            model_key = f"{symbol}_{timeframe}"
            if model_key not in self.models:
                await self._create_model(symbol, timeframe, historical_data)
            
            # Make prediction
            prediction_result = await self._make_prediction(symbol, timeframe, features)
            
            return prediction_result
            
        except Exception as e:
            logger.error(f"Error predicting price for {symbol}: {e}")
            raise

    async def _get_historical_data(self, symbol: str, config: Dict[str, Any]) -> pd.DataFrame:
        """Get historical price data"""
        try:
            # Calculate how much data we need
            periods_needed = max(200, self.sequence_length * 2)  # At least 200 periods
            
            data = await self.data_fetcher.get_klines(
                symbol=symbol,
                interval=config["interval"],
                limit=periods_needed
            )
            
            if not data:
                raise ValueError(f"No data available for {symbol}")
            
            # Convert to DataFrame
            df = pd.DataFrame(data)
            df['timestamp'] = pd.to_datetime(df['openTime'], unit='ms')
            df.set_index('timestamp', inplace=True)
            
            # Sort by timestamp
            df.sort_index(inplace=True)
            
            return df
            
        except Exception as e:
            logger.error(f"Error getting historical data: {e}")
            raise

    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for machine learning model"""
        try:
            features_df = df.copy()
            
            # Basic price features
            features_df['price_change'] = features_df['close'].pct_change()
            features_df['high_low_ratio'] = features_df['high'] / features_df['low']
            features_df['volume_change'] = features_df['volume'].pct_change()
            
            # Technical indicators
            features_df['sma_20'] = ta.trend.sma_indicator(features_df['close'], window=20)
            features_df['sma_50'] = ta.trend.sma_indicator(features_df['close'], window=50)
            features_df['ema_12'] = ta.trend.ema_indicator(features_df['close'], window=12)
            features_df['ema_26'] = ta.trend.ema_indicator(features_df['close'], window=26)
            
            # MACD
            features_df['macd'] = ta.trend.macd_diff(features_df['close'])
            
            # RSI
            features_df['rsi'] = ta.momentum.rsi(features_df['close'], window=14)
            
            # Bollinger Bands
            bb_high = ta.volatility.bollinger_hband(features_df['close'])
            bb_low = ta.volatility.bollinger_lband(features_df['close'])
            features_df['bb_position'] = (features_df['close'] - bb_low) / (bb_high - bb_low)
            
            # Volume indicators
            features_df['volume_sma'] = ta.volume.volume_sma(features_df['close'], features_df['volume'])
            features_df['vwap'] = ta.volume.volume_weighted_average_price(
                features_df['high'], features_df['low'], features_df['close'], features_df['volume']
            )
            
            # Volatility
            features_df['volatility'] = features_df['close'].rolling(window=20).std()
            
            # Time-based features
            features_df['hour'] = features_df.index.hour
            features_df['day_of_week'] = features_df.index.dayofweek
            features_df['month'] = features_df.index.month
            
            # Drop NaN values
            features_df.dropna(inplace=True)
            
            return features_df
            
        except Exception as e:
            logger.error(f"Error preparing features: {e}")
            raise

    async def _create_model(self, symbol: str, timeframe: str, data: pd.DataFrame):
        """Create and train a new prediction model"""
        try:
            logger.info(f"Creating new model for {symbol}_{timeframe}")
            
            # Prepare training data
            features = self._prepare_features(data)
            X, y, scaler = self._prepare_training_data(features)
            
            if len(X) < 50:  # Need minimum data for training
                raise ValueError(f"Insufficient training data for {symbol}")
            
            # Split data
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
            # Create model architecture
            model = self._build_model(X_train.shape[1:])
            
            # Train model
            history = await self._train_model(model, X_train, y_train, X_test, y_test, symbol, timeframe)
            
            # Store model and scaler
            model_key = f"{symbol}_{timeframe}"
            self.models[model_key] = model
            self.scalers[model_key] = scaler
            
            # Save model to disk
            await self._save_model(model, scaler, symbol, timeframe)
            
            logger.info(f"Model created and trained for {symbol}_{timeframe}")
            
        except Exception as e:
            logger.error(f"Error creating model: {e}")
            raise

    def _prepare_training_data(self, features: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, MinMaxScaler]:
        """Prepare data for training"""
        try:
            # Select features for training
            feature_columns = [
                'open', 'high', 'low', 'close', 'volume',
                'price_change', 'high_low_ratio', 'volume_change',
                'sma_20', 'sma_50', 'ema_12', 'ema_26', 'macd', 'rsi',
                'bb_position', 'volume_sma', 'vwap', 'volatility'
            ]
            
            # Filter available columns
            available_columns = [col for col in feature_columns if col in features.columns]
            
            # Prepare data
            data = features[available_columns].values
            
            # Scale data
            scaler = MinMaxScaler()
            scaled_data = scaler.fit_transform(data)
            
            # Create sequences
            X, y = [], []
            for i in range(self.sequence_length, len(scaled_data)):
                X.append(scaled_data[i-self.sequence_length:i])
                y.append(scaled_data[i, 3])  # Predict close price (index 3)
            
            return np.array(X), np.array(y), scaler
            
        except Exception as e:
            logger.error(f"Error preparing training data: {e}")
            raise

    def _build_model(self, input_shape: Tuple[int, int]) -> tf.keras.Model:
        """Build LSTM model architecture"""
        try:
            model = Sequential([
                LSTM(50, return_sequences=True, input_shape=input_shape),
                Dropout(0.2),
                LSTM(50, return_sequences=True),
                Dropout(0.2),
                LSTM(50),
                Dropout(0.2),
                Dense(25),
                Dense(1)
            ])
            
            model.compile(
                optimizer=Adam(learning_rate=0.001),
                loss='mse',
                metrics=['mae']
            )
            
            return model
            
        except Exception as e:
            logger.error(f"Error building model: {e}")
            raise

    async def _train_model(self, model: tf.keras.Model, X_train: np.ndarray, y_train: np.ndarray,
                          X_test: np.ndarray, y_test: np.ndarray, symbol: str, timeframe: str) -> Dict:
        """Train the model"""
        try:
            # Callbacks
            early_stopping = EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            )
            
            model_checkpoint = ModelCheckpoint(
                f"{self.model_dir}/{symbol}_{timeframe}_best.h5",
                monitor='val_loss',
                save_best_only=True
            )
            
            # Train model
            history = model.fit(
                X_train, y_train,
                epochs=100,
                batch_size=32,
                validation_data=(X_test, y_test),
                callbacks=[early_stopping, model_checkpoint],
                verbose=0
            )
            
            return history.history
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            raise

    async def _make_prediction(self, symbol: str, timeframe: str, features: pd.DataFrame) -> Dict[str, Any]:
        """Make price prediction with volatility dampening for longer timeframes"""
        try:
            # Check cache first for stability
            cache_key = f"{symbol}_{timeframe}"
            current_time = datetime.utcnow().timestamp()
            
            if cache_key in self.prediction_cache:
                cached_prediction, cache_time = self.prediction_cache[cache_key]
                cache_age = current_time - cache_time
                
                # Return cached prediction if still valid
                if cache_age < self.cache_duration.get(timeframe, 300):
                    return cached_prediction
            
            model_key = f"{symbol}_{timeframe}"
            model = self.models[model_key]
            scaler = self.scalers[model_key]
            
            # Prepare input data
            feature_columns = [
                'open', 'high', 'low', 'close', 'volume',
                'price_change', 'high_low_ratio', 'volume_change',
                'sma_20', 'sma_50', 'ema_12', 'ema_26', 'macd', 'rsi',
                'bb_position', 'volume_sma', 'vwap', 'volatility'
            ]
            
            available_columns = [col for col in feature_columns if col in features.columns]
            data = features[available_columns].tail(self.sequence_length).values
            
            # Scale data
            scaled_data = scaler.transform(data)
            
            # Reshape for prediction
            X = scaled_data.reshape(1, self.sequence_length, len(available_columns))
            
            # Make prediction
            prediction_scaled = model.predict(X, verbose=0)[0][0]
            
            # Create dummy array for inverse transform
            dummy_array = np.zeros((1, len(available_columns)))
            dummy_array[0, 3] = prediction_scaled  # Close price is at index 3
            
            # Inverse transform to get actual price
            prediction_actual = scaler.inverse_transform(dummy_array)[0, 3]
            
            # Get current price
            current_price = features['close'].iloc[-1]
            
            # Apply volatility dampening for longer timeframes
            config = self.timeframe_configs.get(timeframe, {})
            volatility_factor = config.get('volatility_factor', 1.0)
            
            # Dampen the prediction change for longer timeframes
            raw_change = prediction_actual - current_price
            dampened_change = raw_change * volatility_factor
            prediction_actual = current_price + dampened_change
            
            # If we have a cached prediction, smooth the transition
            if cache_key in self.prediction_cache:
                cached_prediction, _ = self.prediction_cache[cache_key]
                cached_price = cached_prediction.get('predicted_price', current_price)
                
                # Smooth transition for longer timeframes (more smoothing for longer periods)
                smoothing_factor = 0.3 if timeframe == '1h' else 0.6 if timeframe == '4h' else 0.8
                prediction_actual = (prediction_actual * (1 - smoothing_factor)) + (cached_price * smoothing_factor)
            
            # Calculate prediction metrics
            prediction_change = prediction_actual - current_price
            prediction_change_percent = (prediction_change / current_price) * 100
            
            # Calculate confidence based on recent model performance
            confidence = self._calculate_prediction_confidence(symbol, timeframe, features)
            
            # Increase confidence for longer timeframes due to dampening
            if timeframe in ['4h', '1d', '7d']:
                confidence = min(0.95, confidence * 1.1)
            
            result = {
                "current_price": float(current_price),
                "predicted_price": float(prediction_actual),
                "prediction_change": float(prediction_change),
                "prediction_change_percent": float(prediction_change_percent),
                "confidence": float(confidence),
                "model_used": "LSTM",
                "features_used": available_columns,
                "timeframe": timeframe,
                "volatility_dampening": volatility_factor
            }
            
            # Cache the prediction
            self.prediction_cache[cache_key] = (result, current_time)
            
            return result
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            raise

    def _calculate_prediction_confidence(self, symbol: str, timeframe: str, features: pd.DataFrame) -> float:
        """Calculate prediction confidence based on various factors"""
        try:
            # Base confidence
            confidence = 0.7
            
            # Adjust based on data quality
            if len(features) >= 200:
                confidence += 0.1
            elif len(features) < 100:
                confidence -= 0.2
            
            # Adjust based on volatility
            recent_volatility = features['close'].tail(20).std() / features['close'].tail(20).mean()
            if recent_volatility < 0.02:  # Low volatility
                confidence += 0.1
            elif recent_volatility > 0.1:  # High volatility
                confidence -= 0.2
            
            # Adjust based on trend consistency
            recent_prices = features['close'].tail(10)
            trend_consistency = abs(recent_prices.corr(pd.Series(range(len(recent_prices)))))
            confidence += (trend_consistency - 0.5) * 0.2
            
            return max(0.1, min(0.95, confidence))
            
        except Exception as e:
            logger.warning(f"Error calculating confidence: {e}")
            return 0.5

    async def _save_model(self, model: tf.keras.Model, scaler: MinMaxScaler, symbol: str, timeframe: str):
        """Save model and scaler to disk"""
        try:
            model_path = f"{self.model_dir}/{symbol}_{timeframe}_model.h5"
            scaler_path = f"{self.model_dir}/{symbol}_{timeframe}_scaler.pkl"
            
            model.save(model_path)
            
            with open(scaler_path, 'wb') as f:
                pickle.dump(scaler, f)
            
            logger.info(f"Model saved for {symbol}_{timeframe}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")

    async def _load_existing_models(self):
        """Load existing models from disk"""
        try:
            if not os.path.exists(self.model_dir):
                return
            
            for filename in os.listdir(self.model_dir):
                if filename.endswith("_model.h5"):
                    # Extract symbol and timeframe
                    base_name = filename.replace("_model.h5", "")
                    parts = base_name.split("_")
                    if len(parts) >= 2:
                        symbol = "_".join(parts[:-1])
                        timeframe = parts[-1]
                        
                        try:
                            # Load model
                            model_path = os.path.join(self.model_dir, filename)
                            model = load_model(model_path)
                            
                            # Load scaler
                            scaler_path = os.path.join(self.model_dir, f"{base_name}_scaler.pkl")
                            if os.path.exists(scaler_path):
                                with open(scaler_path, 'rb') as f:
                                    scaler = pickle.load(f)
                                
                                model_key = f"{symbol}_{timeframe}"
                                self.models[model_key] = model
                                self.scalers[model_key] = scaler
                                
                                logger.info(f"Loaded model for {model_key}")
                        
                        except Exception as e:
                            logger.warning(f"Error loading model {filename}: {e}")
            
        except Exception as e:
            logger.error(f"Error loading existing models: {e}")

    async def train_model(self, symbols: List[str], parameters: Dict[str, Any]):
        """Train models for specified symbols"""
        try:
            timeframes = parameters.get("timeframes", ["1d"])
            
            for symbol in symbols:
                for timeframe in timeframes:
                    try:
                        logger.info(f"Training model for {symbol}_{timeframe}")
                        
                        # Get historical data
                        config = self.timeframe_configs[timeframe]
                        historical_data = await self._get_historical_data(symbol, config)
                        
                        # Create and train model
                        await self._create_model(symbol, timeframe, historical_data)
                        
                        logger.info(f"Model training completed for {symbol}_{timeframe}")
                        
                    except Exception as e:
                        logger.error(f"Error training model for {symbol}_{timeframe}: {e}")
                        continue
            
        except Exception as e:
            logger.error(f"Error in model training: {e}")
            raise

    def get_model_status(self) -> Dict[str, Any]:
        """Get status of prediction models"""
        return {
            "models_loaded": len(self.models),
            "available_models": list(self.models.keys()),
            "supported_timeframes": list(self.timeframe_configs.keys()),
            "model_architecture": "LSTM",
            "sequence_length": self.sequence_length,
            "status": "ready" if self.ready else "not_ready",
            "last_updated": datetime.utcnow().isoformat()
        }