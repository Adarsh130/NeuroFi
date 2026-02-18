import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np

from .sentiment_analyzer import SentimentAnalyzer
from .price_predictor import PricePredictor
from .technical_analyzer import TechnicalAnalyzer
from .data_fetcher import DataFetcher

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.sentiment_analyzer = SentimentAnalyzer()
        self.price_predictor = PricePredictor()
        self.technical_analyzer = TechnicalAnalyzer()
        self.data_fetcher = DataFetcher()
        self.ready = False
        
        # Risk level configurations
        self.risk_configs = {
            "low": {
                "min_confidence": 0.8,
                "max_position_size": 0.1,
                "stop_loss_percent": 0.05,
                "take_profit_percent": 0.1,
                "sentiment_weight": 0.2,
                "technical_weight": 0.5,
                "prediction_weight": 0.3
            },
            "medium": {
                "min_confidence": 0.6,
                "max_position_size": 0.2,
                "stop_loss_percent": 0.08,
                "take_profit_percent": 0.15,
                "sentiment_weight": 0.3,
                "technical_weight": 0.4,
                "prediction_weight": 0.3
            },
            "high": {
                "min_confidence": 0.4,
                "max_position_size": 0.3,
                "stop_loss_percent": 0.12,
                "take_profit_percent": 0.25,
                "sentiment_weight": 0.4,
                "technical_weight": 0.3,
                "prediction_weight": 0.3
            }
        }

    async def initialize(self):
        """Initialize the recommendation engine"""
        try:
            await self.sentiment_analyzer.initialize()
            await self.price_predictor.initialize()
            await self.technical_analyzer.initialize()
            await self.data_fetcher.initialize()
            
            self.ready = True
            logger.info("Recommendation engine initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing recommendation engine: {e}")
            raise

    async def cleanup(self):
        """Cleanup resources"""
        await self.sentiment_analyzer.cleanup()
        await self.price_predictor.cleanup()
        await self.technical_analyzer.cleanup()
        await self.data_fetcher.cleanup()

    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.ready

    async def generate_recommendation(self, symbol: str, risk_level: str = "medium") -> Dict[str, Any]:
        """
        Generate AI-powered trading recommendation
        
        Args:
            symbol: Cryptocurrency symbol
            risk_level: Risk level (low, medium, high)
            
        Returns:
            Dictionary with recommendation details
        """
        try:
            if risk_level not in self.risk_configs:
                raise ValueError(f"Invalid risk level: {risk_level}")
            
            config = self.risk_configs[risk_level]
            
            # Gather all analysis data
            analysis_data = await self._gather_analysis_data(symbol)
            
            # Calculate recommendation scores
            scores = self._calculate_recommendation_scores(analysis_data, config)
            
            # Generate final recommendation
            recommendation = self._generate_final_recommendation(
                symbol, analysis_data, scores, config
            )
            
            return recommendation
            
        except Exception as e:
            logger.error(f"Error generating recommendation for {symbol}: {e}")
            raise

    async def _gather_analysis_data(self, symbol: str) -> Dict[str, Any]:
        """Gather data from all analysis services"""
        try:
            # Run all analyses concurrently
            tasks = [
                self.sentiment_analyzer.analyze_sentiment(symbol),
                self.price_predictor.predict_price(symbol, "1d"),
                self.technical_analyzer.analyze(symbol, "1h", "7d"),
                self.data_fetcher.get_current_price(symbol),
                self.data_fetcher.get_ticker_24hr(symbol)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            sentiment_data = results[0] if not isinstance(results[0], Exception) else None
            prediction_data = results[1] if not isinstance(results[1], Exception) else None
            technical_data = results[2] if not isinstance(results[2], Exception) else None
            price_data = results[3] if not isinstance(results[3], Exception) else None
            ticker_data = results[4] if not isinstance(results[4], Exception) else None
            
            return {
                "sentiment": sentiment_data,
                "prediction": prediction_data,
                "technical": technical_data,
                "price": price_data,
                "ticker": ticker_data[0] if ticker_data else None
            }
            
        except Exception as e:
            logger.error(f"Error gathering analysis data: {e}")
            raise

    def _calculate_recommendation_scores(self, analysis_data: Dict[str, Any], 
                                       config: Dict[str, Any]) -> Dict[str, float]:
        """Calculate recommendation scores from analysis data"""
        try:
            scores = {
                "sentiment_score": 0.0,
                "technical_score": 0.0,
                "prediction_score": 0.0,
                "overall_score": 0.0
            }
            
            # Sentiment score
            sentiment_data = analysis_data.get("sentiment")
            if sentiment_data:
                sentiment_score = sentiment_data.get("sentiment_score", 0.0)
                confidence = sentiment_data.get("confidence", 0.0)
                scores["sentiment_score"] = sentiment_score * confidence
            
            # Technical analysis score
            technical_data = analysis_data.get("technical")
            if technical_data:
                scores["technical_score"] = self._calculate_technical_score(technical_data)
            
            # Price prediction score
            prediction_data = analysis_data.get("prediction")
            if prediction_data:
                scores["prediction_score"] = self._calculate_prediction_score(prediction_data)
            
            # Calculate overall score
            scores["overall_score"] = (
                scores["sentiment_score"] * config["sentiment_weight"] +
                scores["technical_score"] * config["technical_weight"] +
                scores["prediction_score"] * config["prediction_weight"]
            )
            
            return scores
            
        except Exception as e:
            logger.error(f"Error calculating recommendation scores: {e}")
            return {"sentiment_score": 0.0, "technical_score": 0.0, "prediction_score": 0.0, "overall_score": 0.0}

    def _calculate_technical_score(self, technical_data: Dict[str, Any]) -> float:
        """Calculate technical analysis score"""
        try:
            signals = technical_data.get("signals", {})
            indicators = technical_data.get("indicators", {})
            
            score = 0.0
            factors = 0
            
            # RSI signal
            rsi_signal = signals.get("rsi", "neutral")
            if rsi_signal == "oversold":
                score += 0.3
            elif rsi_signal == "overbought":
                score -= 0.3
            factors += 1
            
            # MACD signal
            macd_signal = signals.get("macd", "neutral")
            if macd_signal == "bullish":
                score += 0.2
            elif macd_signal == "bearish":
                score -= 0.2
            factors += 1
            
            # Moving average trend
            ma_trend = signals.get("ma_trend", "neutral")
            if ma_trend == "strong_bullish":
                score += 0.4
            elif ma_trend == "weak_bullish":
                score += 0.2
            elif ma_trend == "weak_bearish":
                score -= 0.2
            elif ma_trend == "strong_bearish":
                score -= 0.4
            factors += 1
            
            # Bollinger Bands
            bb_signal = signals.get("bollinger", "neutral")
            if bb_signal == "oversold":
                score += 0.2
            elif bb_signal == "overbought":
                score -= 0.2
            factors += 1
            
            # Trend strength
            trend_strength = signals.get("trend_strength", "weak")
            trend = technical_data.get("trend", "sideways")
            
            if trend == "bullish" and trend_strength in ["strong", "very_strong"]:
                score += 0.3
            elif trend == "bearish" and trend_strength in ["strong", "very_strong"]:
                score -= 0.3
            factors += 1
            
            # Volume confirmation
            volume_signal = signals.get("volume", "normal")
            if volume_signal == "high" and score > 0:
                score += 0.1
            elif volume_signal == "low" and score > 0:
                score -= 0.1
            
            return score / factors if factors > 0 else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating technical score: {e}")
            return 0.0

    def _calculate_prediction_score(self, prediction_data: Dict[str, Any]) -> float:
        """Calculate price prediction score"""
        try:
            change_percent = prediction_data.get("prediction_change_percent", 0.0)
            confidence = prediction_data.get("confidence", 0.0)
            
            # Normalize change percent to -1 to 1 range
            normalized_change = np.tanh(change_percent / 10.0)  # 10% change = ~0.76 score
            
            return normalized_change * confidence
            
        except Exception as e:
            logger.error(f"Error calculating prediction score: {e}")
            return 0.0

    def _generate_final_recommendation(self, symbol: str, analysis_data: Dict[str, Any],
                                     scores: Dict[str, float], config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final recommendation based on all scores"""
        try:
            overall_score = scores["overall_score"]
            
            # Determine action
            if overall_score > 0.3:
                action = "buy"
            elif overall_score < -0.3:
                action = "sell"
            else:
                action = "hold"
            
            # Calculate confidence
            confidence = min(0.95, abs(overall_score) + 0.1)
            
            # Check minimum confidence threshold
            if confidence < config["min_confidence"]:
                action = "hold"
                confidence = 0.5
            
            # Get current price
            current_price = None
            price_data = analysis_data.get("price")
            if price_data:
                current_price = price_data.get("price")
            
            # Calculate target price and stop loss
            target_price = None
            stop_loss = None
            
            if action == "buy" and current_price:
                target_price = current_price * (1 + config["take_profit_percent"])
                stop_loss = current_price * (1 - config["stop_loss_percent"])
            elif action == "sell" and current_price:
                target_price = current_price * (1 - config["take_profit_percent"])
                stop_loss = current_price * (1 + config["stop_loss_percent"])
            
            # Generate reasoning
            reasoning = self._generate_reasoning(analysis_data, scores, action)
            
            # Determine time horizon
            time_horizon = self._determine_time_horizon(analysis_data, action)
            
            return {
                "action": action,
                "confidence": confidence,
                "target_price": target_price,
                "stop_loss": stop_loss,
                "reasoning": reasoning,
                "time_horizon": time_horizon,
                "scores": scores,
                "risk_reward_ratio": self._calculate_risk_reward_ratio(
                    current_price, target_price, stop_loss
                ) if current_price and target_price and stop_loss else None
            }
            
        except Exception as e:
            logger.error(f"Error generating final recommendation: {e}")
            return {
                "action": "hold",
                "confidence": 0.0,
                "target_price": None,
                "stop_loss": None,
                "reasoning": "Error in analysis",
                "time_horizon": "unknown"
            }

    def _generate_reasoning(self, analysis_data: Dict[str, Any], scores: Dict[str, float], action: str) -> str:
        """Generate human-readable reasoning for the recommendation"""
        try:
            reasoning_parts = []
            
            # Sentiment reasoning
            sentiment_data = analysis_data.get("sentiment")
            if sentiment_data:
                sentiment_label = sentiment_data.get("sentiment_label", "neutral")
                sentiment_score = sentiment_data.get("sentiment_score", 0.0)
                
                if sentiment_label == "positive":
                    reasoning_parts.append(f"Market sentiment is positive ({sentiment_score:.2f})")
                elif sentiment_label == "negative":
                    reasoning_parts.append(f"Market sentiment is negative ({sentiment_score:.2f})")
                else:
                    reasoning_parts.append("Market sentiment is neutral")
            
            # Technical reasoning
            technical_data = analysis_data.get("technical")
            if technical_data:
                trend = technical_data.get("trend", "sideways")
                signals = technical_data.get("signals", {})
                
                reasoning_parts.append(f"Technical trend is {trend}")
                
                # Add specific technical signals
                if signals.get("rsi") == "oversold":
                    reasoning_parts.append("RSI indicates oversold conditions")
                elif signals.get("rsi") == "overbought":
                    reasoning_parts.append("RSI indicates overbought conditions")
                
                if signals.get("macd") == "bullish":
                    reasoning_parts.append("MACD shows bullish momentum")
                elif signals.get("macd") == "bearish":
                    reasoning_parts.append("MACD shows bearish momentum")
            
            # Prediction reasoning
            prediction_data = analysis_data.get("prediction")
            if prediction_data:
                change_percent = prediction_data.get("prediction_change_percent", 0.0)
                if abs(change_percent) > 2:
                    direction = "upward" if change_percent > 0 else "downward"
                    reasoning_parts.append(f"Price prediction suggests {direction} movement ({change_percent:.1f}%)")
            
            # Overall reasoning
            overall_score = scores.get("overall_score", 0.0)
            if action == "buy":
                reasoning_parts.append(f"Overall analysis suggests buying opportunity (score: {overall_score:.2f})")
            elif action == "sell":
                reasoning_parts.append(f"Overall analysis suggests selling opportunity (score: {overall_score:.2f})")
            else:
                reasoning_parts.append(f"Analysis suggests holding position (score: {overall_score:.2f})")
            
            return ". ".join(reasoning_parts) + "."
            
        except Exception as e:
            logger.error(f"Error generating reasoning: {e}")
            return "Analysis completed with mixed signals."

    def _determine_time_horizon(self, analysis_data: Dict[str, Any], action: str) -> str:
        """Determine appropriate time horizon for the recommendation"""
        try:
            # Default to short-term
            time_horizon = "short-term"
            
            technical_data = analysis_data.get("technical")
            if technical_data:
                trend_strength = technical_data.get("signals", {}).get("trend_strength", "weak")
                trend = technical_data.get("trend", "sideways")
                
                if trend_strength in ["strong", "very_strong"] and trend != "sideways":
                    time_horizon = "medium-term"
                
                # Check for strong technical signals
                signals = technical_data.get("signals", {})
                strong_signals = sum(1 for signal in signals.values() 
                                   if signal in ["strong_bullish", "strong_bearish", "very_strong"])
                
                if strong_signals >= 2:
                    time_horizon = "medium-term"
            
            # Sentiment can extend time horizon
            sentiment_data = analysis_data.get("sentiment")
            if sentiment_data:
                confidence = sentiment_data.get("confidence", 0.0)
                if confidence > 0.8:
                    time_horizon = "medium-term"
            
            return time_horizon
            
        except Exception as e:
            logger.error(f"Error determining time horizon: {e}")
            return "short-term"

    def _calculate_risk_reward_ratio(self, current_price: float, target_price: float, stop_loss: float) -> float:
        """Calculate risk-reward ratio"""
        try:
            if not all([current_price, target_price, stop_loss]):
                return None
            
            potential_reward = abs(target_price - current_price)
            potential_risk = abs(current_price - stop_loss)
            
            if potential_risk == 0:
                return None
            
            return potential_reward / potential_risk
            
        except Exception as e:
            logger.error(f"Error calculating risk-reward ratio: {e}")
            return None

    async def train_model(self, symbols: List[str], parameters: Dict[str, Any]):
        """Train recommendation model (placeholder)"""
        logger.info(f"Training recommendation model for symbols: {symbols}")
        
        # This is a placeholder for custom model training
        # In a real implementation, you would:
        # 1. Collect historical recommendations and outcomes
        # 2. Train a model to optimize recommendation accuracy
        # 3. Update the scoring weights and thresholds
        
        await asyncio.sleep(5)  # Simulate training time
        logger.info("Recommendation model training completed")

    def get_model_status(self) -> Dict[str, Any]:
        """Get status of the recommendation model"""
        return {
            "model_type": "Multi-factor Recommendation Engine",
            "status": "ready" if self.ready else "not_ready",
            "components": {
                "sentiment_analyzer": self.sentiment_analyzer.is_ready(),
                "price_predictor": self.price_predictor.is_ready(),
                "technical_analyzer": self.technical_analyzer.is_ready()
            },
            "risk_levels_supported": list(self.risk_configs.keys()),
            "actions_generated": ["buy", "sell", "hold"],
            "last_updated": datetime.utcnow().isoformat()
        }