import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
import ta

from .data_fetcher import DataFetcher

logger = logging.getLogger(__name__)

class TechnicalAnalyzer:
    def __init__(self):
        self.data_fetcher = DataFetcher()
        self.ready = False

    async def initialize(self):
        """Initialize the technical analyzer"""
        try:
            await self.data_fetcher.initialize()
            self.ready = True
            logger.info("Technical analyzer initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing technical analyzer: {e}")
            raise

    async def cleanup(self):
        """Cleanup resources"""
        await self.data_fetcher.cleanup()

    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.ready

    async def analyze(self, symbol: str, interval: str = "1h", period: str = "30d") -> Dict[str, Any]:
        """
        Perform comprehensive technical analysis
        
        Args:
            symbol: Cryptocurrency symbol
            interval: Data interval
            period: Analysis period
            
        Returns:
            Dictionary with technical analysis results
        """
        try:
            # Get historical data
            data = await self._get_historical_data(symbol, interval, period)
            
            if len(data) < 50:  # Need minimum data for analysis
                raise ValueError(f"Insufficient data for technical analysis of {symbol}")
            
            # Calculate all indicators
            indicators = self._calculate_indicators(data)
            
            # Generate signals
            signals = self._generate_signals(data, indicators)
            
            # Find support and resistance levels
            support_levels, resistance_levels = self._find_support_resistance(data)
            
            # Determine overall trend
            trend, strength = self._determine_trend(data, indicators)
            
            return {
                "indicators": indicators,
                "signals": signals,
                "support_levels": support_levels,
                "resistance_levels": resistance_levels,
                "trend": trend,
                "strength": strength
            }
            
        except Exception as e:
            logger.error(f"Error in technical analysis for {symbol}: {e}")
            raise

    async def _get_historical_data(self, symbol: str, interval: str, period: str) -> pd.DataFrame:
        """Get historical data for analysis"""
        try:
            # Parse period
            if period.endswith('d'):
                days = int(period[:-1])
            elif period.endswith('w'):
                days = int(period[:-1]) * 7
            elif period.endswith('m'):
                days = int(period[:-1]) * 30
            else:
                days = 30  # Default
            
            # Calculate required data points
            if interval in ['1m', '3m', '5m']:
                limit = min(1000, days * 24 * 60 // int(interval[:-1]))
            elif interval in ['15m', '30m']:
                limit = min(1000, days * 24 * 60 // int(interval[:-1]))
            elif interval in ['1h', '2h', '4h', '6h', '8h', '12h']:
                limit = min(1000, days * 24 // int(interval[:-1]))
            elif interval == '1d':
                limit = min(1000, days)
            else:
                limit = 200
            
            # Fetch data
            klines = await self.data_fetcher.get_klines(symbol, interval, limit)
            
            # Convert to DataFrame
            df = pd.DataFrame(klines)
            df['timestamp'] = pd.to_datetime(df['openTime'], unit='ms')
            df.set_index('timestamp', inplace=True)
            df.sort_index(inplace=True)
            
            return df
            
        except Exception as e:
            logger.error(f"Error getting historical data: {e}")
            raise

    def _calculate_indicators(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate technical indicators"""
        try:
            indicators = {}
            
            # Price-based indicators
            indicators['sma_20'] = ta.trend.sma_indicator(df['close'], window=20).iloc[-1]
            indicators['sma_50'] = ta.trend.sma_indicator(df['close'], window=50).iloc[-1]
            indicators['sma_200'] = ta.trend.sma_indicator(df['close'], window=200).iloc[-1] if len(df) >= 200 else None
            
            indicators['ema_12'] = ta.trend.ema_indicator(df['close'], window=12).iloc[-1]
            indicators['ema_26'] = ta.trend.ema_indicator(df['close'], window=26).iloc[-1]
            
            # MACD
            macd_line = ta.trend.macd_diff(df['close'])
            macd_signal = ta.trend.macd_signal(df['close'])
            indicators['macd'] = macd_line.iloc[-1]
            indicators['macd_signal'] = macd_signal.iloc[-1]
            indicators['macd_histogram'] = (macd_line - macd_signal).iloc[-1]
            
            # RSI
            indicators['rsi'] = ta.momentum.rsi(df['close'], window=14).iloc[-1]
            
            # Stochastic
            stoch_k = ta.momentum.stoch(df['high'], df['low'], df['close'])
            stoch_d = ta.momentum.stoch_signal(df['high'], df['low'], df['close'])
            indicators['stoch_k'] = stoch_k.iloc[-1]
            indicators['stoch_d'] = stoch_d.iloc[-1]
            
            # Bollinger Bands
            bb_high = ta.volatility.bollinger_hband(df['close'])
            bb_low = ta.volatility.bollinger_lband(df['close'])
            bb_mid = ta.volatility.bollinger_mavg(df['close'])
            indicators['bb_upper'] = bb_high.iloc[-1]
            indicators['bb_lower'] = bb_low.iloc[-1]
            indicators['bb_middle'] = bb_mid.iloc[-1]
            indicators['bb_width'] = (bb_high.iloc[-1] - bb_low.iloc[-1]) / bb_mid.iloc[-1] * 100
            
            # Volume indicators
            indicators['volume_sma'] = ta.volume.volume_sma(df['close'], df['volume'], window=20).iloc[-1]
            indicators['vwap'] = ta.volume.volume_weighted_average_price(
                df['high'], df['low'], df['close'], df['volume']
            ).iloc[-1]
            
            # ADX (Average Directional Index)
            indicators['adx'] = ta.trend.adx(df['high'], df['low'], df['close']).iloc[-1]
            indicators['adx_pos'] = ta.trend.adx_pos(df['high'], df['low'], df['close']).iloc[-1]
            indicators['adx_neg'] = ta.trend.adx_neg(df['high'], df['low'], df['close']).iloc[-1]
            
            # Williams %R
            indicators['williams_r'] = ta.momentum.williams_r(df['high'], df['low'], df['close']).iloc[-1]
            
            # Commodity Channel Index
            indicators['cci'] = ta.trend.cci(df['high'], df['low'], df['close']).iloc[-1]
            
            # Average True Range
            indicators['atr'] = ta.volatility.average_true_range(df['high'], df['low'], df['close']).iloc[-1]
            
            # On Balance Volume
            indicators['obv'] = ta.volume.on_balance_volume(df['close'], df['volume']).iloc[-1]
            
            # Current price
            indicators['current_price'] = df['close'].iloc[-1]
            
            return indicators
            
        except Exception as e:
            logger.error(f"Error calculating indicators: {e}")
            return {}

    def _generate_signals(self, df: pd.DataFrame, indicators: Dict[str, Any]) -> Dict[str, str]:
        """Generate trading signals based on indicators"""
        try:
            signals = {}
            current_price = df['close'].iloc[-1]
            
            # RSI signals
            rsi = indicators.get('rsi', 50)
            if rsi > 70:
                signals['rsi'] = 'overbought'
            elif rsi < 30:
                signals['rsi'] = 'oversold'
            else:
                signals['rsi'] = 'neutral'
            
            # MACD signals
            macd = indicators.get('macd', 0)
            macd_signal = indicators.get('macd_signal', 0)
            if macd > macd_signal:
                signals['macd'] = 'bullish'
            else:
                signals['macd'] = 'bearish'
            
            # Moving Average signals
            sma_20 = indicators.get('sma_20')
            sma_50 = indicators.get('sma_50')
            
            if sma_20 and sma_50:
                if current_price > sma_20 > sma_50:
                    signals['ma_trend'] = 'strong_bullish'
                elif current_price > sma_20 and sma_20 < sma_50:
                    signals['ma_trend'] = 'weak_bullish'
                elif current_price < sma_20 < sma_50:
                    signals['ma_trend'] = 'strong_bearish'
                else:
                    signals['ma_trend'] = 'weak_bearish'
            
            # Bollinger Bands signals
            bb_upper = indicators.get('bb_upper')
            bb_lower = indicators.get('bb_lower')
            
            if bb_upper and bb_lower:
                if current_price > bb_upper:
                    signals['bollinger'] = 'overbought'
                elif current_price < bb_lower:
                    signals['bollinger'] = 'oversold'
                else:
                    signals['bollinger'] = 'neutral'
            
            # Stochastic signals
            stoch_k = indicators.get('stoch_k', 50)
            stoch_d = indicators.get('stoch_d', 50)
            
            if stoch_k > 80 and stoch_d > 80:
                signals['stochastic'] = 'overbought'
            elif stoch_k < 20 and stoch_d < 20:
                signals['stochastic'] = 'oversold'
            else:
                signals['stochastic'] = 'neutral'
            
            # ADX signals (trend strength)
            adx = indicators.get('adx', 25)
            if adx > 50:
                signals['trend_strength'] = 'very_strong'
            elif adx > 25:
                signals['trend_strength'] = 'strong'
            else:
                signals['trend_strength'] = 'weak'
            
            # Volume signals
            volume_sma = indicators.get('volume_sma')
            current_volume = df['volume'].iloc[-1]
            
            if volume_sma and current_volume > volume_sma * 1.5:
                signals['volume'] = 'high'
            elif volume_sma and current_volume < volume_sma * 0.5:
                signals['volume'] = 'low'
            else:
                signals['volume'] = 'normal'
            
            return signals
            
        except Exception as e:
            logger.error(f"Error generating signals: {e}")
            return {}

    def _find_support_resistance(self, df: pd.DataFrame, window: int = 20) -> tuple:
        """Find support and resistance levels"""
        try:
            highs = df['high'].rolling(window=window, center=True).max()
            lows = df['low'].rolling(window=window, center=True).min()
            
            # Find local maxima (resistance) and minima (support)
            resistance_levels = []
            support_levels = []
            
            for i in range(window, len(df) - window):
                if df['high'].iloc[i] == highs.iloc[i]:
                    resistance_levels.append(df['high'].iloc[i])
                
                if df['low'].iloc[i] == lows.iloc[i]:
                    support_levels.append(df['low'].iloc[i])
            
            # Remove duplicates and sort
            resistance_levels = sorted(list(set(resistance_levels)), reverse=True)[:5]
            support_levels = sorted(list(set(support_levels)))[:5]
            
            return support_levels, resistance_levels
            
        except Exception as e:
            logger.error(f"Error finding support/resistance: {e}")
            return [], []

    def _determine_trend(self, df: pd.DataFrame, indicators: Dict[str, Any]) -> tuple:
        """Determine overall trend and strength"""
        try:
            current_price = df['close'].iloc[-1]
            
            # Calculate trend based on multiple factors
            trend_score = 0
            factors = 0
            
            # Moving averages
            sma_20 = indicators.get('sma_20')
            sma_50 = indicators.get('sma_50')
            
            if sma_20 and sma_50:
                if current_price > sma_20:
                    trend_score += 1
                else:
                    trend_score -= 1
                factors += 1
                
                if sma_20 > sma_50:
                    trend_score += 1
                else:
                    trend_score -= 1
                factors += 1
            
            # MACD
            macd = indicators.get('macd', 0)
            macd_signal = indicators.get('macd_signal', 0)
            
            if macd > macd_signal:
                trend_score += 1
            else:
                trend_score -= 1
            factors += 1
            
            # ADX direction
            adx_pos = indicators.get('adx_pos', 25)
            adx_neg = indicators.get('adx_neg', 25)
            
            if adx_pos > adx_neg:
                trend_score += 1
            else:
                trend_score -= 1
            factors += 1
            
            # Price momentum (last 10 periods)
            if len(df) >= 10:
                price_change = (current_price - df['close'].iloc[-10]) / df['close'].iloc[-10]
                if price_change > 0.02:  # 2% increase
                    trend_score += 1
                elif price_change < -0.02:  # 2% decrease
                    trend_score -= 1
                factors += 1
            
            # Calculate final trend
            if factors > 0:
                trend_ratio = trend_score / factors
                
                if trend_ratio > 0.6:
                    trend = "bullish"
                elif trend_ratio < -0.6:
                    trend = "bearish"
                else:
                    trend = "sideways"
                
                strength = abs(trend_ratio)
            else:
                trend = "unknown"
                strength = 0.0
            
            return trend, strength
            
        except Exception as e:
            logger.error(f"Error determining trend: {e}")
            return "unknown", 0.0

    async def train_model(self, symbols: List[str], parameters: Dict[str, Any]):
        """Train technical analysis model (placeholder)"""
        logger.info(f"Training technical analysis model for symbols: {symbols}")
        
        # This is a placeholder for custom model training
        # Technical analysis typically uses rule-based systems
        # but could be enhanced with ML for pattern recognition
        
        await asyncio.sleep(3)  # Simulate training time
        logger.info("Technical analysis model training completed")

    def get_model_status(self) -> Dict[str, Any]:
        """Get status of the technical analysis model"""
        return {
            "model_type": "Rule-based Technical Analysis",
            "status": "ready" if self.ready else "not_ready",
            "indicators_supported": [
                "SMA", "EMA", "MACD", "RSI", "Stochastic", "Bollinger Bands",
                "ADX", "Williams %R", "CCI", "ATR", "OBV", "VWAP"
            ],
            "signals_generated": [
                "RSI", "MACD", "Moving Average", "Bollinger Bands",
                "Stochastic", "Trend Strength", "Volume"
            ],
            "last_updated": datetime.utcnow().isoformat()
        }