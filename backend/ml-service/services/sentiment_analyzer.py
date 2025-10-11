"""
Sentiment Analysis Service
Analyzes sentiment from news, social media, and other sources
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import re
import json

import aiohttp
import pandas as pd
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.session = None
        self.ready = False
        
        # News API configuration (you'll need to get API keys)
        self.news_sources = {
            "newsapi": {
                "url": "https://newsapi.org/v2/everything",
                "api_key": None,  # Set from environment
                "params": {
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 50
                }
            },
            "cryptonews": {
                "url": "https://cryptonews-api.com/api/v1/category",
                "api_key": None,  # Set from environment
                "params": {
                    "section": "general",
                    "items": 50,
                    "page": 1
                }
            }
        }
        
        # Social media sources (Twitter, Reddit, etc.)
        self.social_sources = {
            "reddit": {
                "url": "https://www.reddit.com/r/cryptocurrency/hot.json",
                "params": {"limit": 50}
            }
        }
        
        # Cryptocurrency keywords mapping
        self.crypto_keywords = {
            "BTC": ["bitcoin", "btc", "₿"],
            "ETH": ["ethereum", "eth", "ether"],
            "BNB": ["binance coin", "bnb", "binance"],
            "ADA": ["cardano", "ada"],
            "SOL": ["solana", "sol"],
            "XRP": ["ripple", "xrp"],
            "DOT": ["polkadot", "dot"],
            "LINK": ["chainlink", "link"],
            "MATIC": ["polygon", "matic"],
            "AVAX": ["avalanche", "avax"]
        }

    async def initialize(self):
        """Initialize the sentiment analyzer"""
        try:
            self.session = aiohttp.ClientSession()
            
            # Load API keys from environment
            import os
            self.news_sources["newsapi"]["api_key"] = os.getenv("NEWS_API_KEY")
            self.news_sources["cryptonews"]["api_key"] = os.getenv("CRYPTO_NEWS_API_KEY")
            
            self.ready = True
            logger.info("Sentiment analyzer initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing sentiment analyzer: {e}")
            raise

    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()

    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.ready

    async def analyze_sentiment(self, symbol: str, sources: List[str] = None) -> Dict[str, Any]:
        """
        Analyze sentiment for a cryptocurrency symbol
        
        Args:
            symbol: Cryptocurrency symbol (e.g., 'BTC', 'ETH')
            sources: List of sources to analyze ['news', 'social']
            
        Returns:
            Dictionary with sentiment analysis results
        """
        if sources is None:
            sources = ["news", "social"]
        
        try:
            all_texts = []
            source_counts = {"news": 0, "social": 0}
            
            # Fetch data from different sources
            if "news" in sources:
                news_texts = await self._fetch_news_data(symbol)
                all_texts.extend(news_texts)
                source_counts["news"] = len(news_texts)
            
            if "social" in sources:
                social_texts = await self._fetch_social_data(symbol)
                all_texts.extend(social_texts)
                source_counts["social"] = len(social_texts)
            
            if not all_texts:
                # Return neutral sentiment if no data found
                return {
                    "sentiment_score": 0.0,
                    "sentiment_label": "neutral",
                    "confidence": 0.0,
                    "sources_analyzed": 0,
                    "source_breakdown": source_counts,
                    "analysis_details": {
                        "positive_count": 0,
                        "negative_count": 0,
                        "neutral_count": 0
                    }
                }
            
            # Analyze sentiment of all texts
            sentiment_results = []
            for text in all_texts:
                sentiment = self._analyze_text_sentiment(text)
                sentiment_results.append(sentiment)
            
            # Aggregate results
            aggregated_sentiment = self._aggregate_sentiment_results(sentiment_results)
            aggregated_sentiment["sources_analyzed"] = len(all_texts)
            aggregated_sentiment["source_breakdown"] = source_counts
            
            return aggregated_sentiment
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment for {symbol}: {e}")
            raise

    async def _fetch_news_data(self, symbol: str) -> List[str]:
        """Fetch news data for a cryptocurrency"""
        texts = []
        
        try:
            # Get keywords for the symbol
            keywords = self.crypto_keywords.get(symbol, [symbol.lower()])
            
            for source_name, source_config in self.news_sources.items():
                if not source_config.get("api_key"):
                    continue
                
                try:
                    # Prepare search query
                    query = " OR ".join(keywords)
                    
                    params = source_config["params"].copy()
                    params["q"] = query
                    
                    if source_name == "newsapi":
                        params["apiKey"] = source_config["api_key"]
                        params["from"] = (datetime.now() - timedelta(days=7)).isoformat()
                    
                    # Fetch data
                    async with self.session.get(source_config["url"], params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            if source_name == "newsapi":
                                articles = data.get("articles", [])
                                for article in articles:
                                    title = article.get("title", "")
                                    description = article.get("description", "")
                                    content = article.get("content", "")
                                    
                                    # Combine title, description, and content
                                    full_text = f"{title} {description} {content}"
                                    if self._is_relevant_text(full_text, keywords):
                                        texts.append(full_text)
                            
                            elif source_name == "cryptonews":
                                articles = data.get("data", [])
                                for article in articles:
                                    title = article.get("title", "")
                                    text = article.get("text", "")
                                    
                                    full_text = f"{title} {text}"
                                    if self._is_relevant_text(full_text, keywords):
                                        texts.append(full_text)
                        
                except Exception as e:
                    logger.warning(f"Error fetching from {source_name}: {e}")
                    continue
            
        except Exception as e:
            logger.error(f"Error fetching news data: {e}")
        
        return texts[:100]  # Limit to 100 texts

    async def _fetch_social_data(self, symbol: str) -> List[str]:
        """Fetch social media data for a cryptocurrency"""
        texts = []
        
        try:
            keywords = self.crypto_keywords.get(symbol, [symbol.lower()])
            
            # Fetch Reddit data
            try:
                async with self.session.get(
                    self.social_sources["reddit"]["url"],
                    params=self.social_sources["reddit"]["params"]
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        posts = data.get("data", {}).get("children", [])
                        
                        for post in posts:
                            post_data = post.get("data", {})
                            title = post_data.get("title", "")
                            selftext = post_data.get("selftext", "")
                            
                            full_text = f"{title} {selftext}"
                            if self._is_relevant_text(full_text, keywords):
                                texts.append(full_text)
            
            except Exception as e:
                logger.warning(f"Error fetching Reddit data: {e}")
            
            # Add more social media sources here (Twitter, Telegram, etc.)
            # Note: You'll need appropriate API keys and permissions
            
        except Exception as e:
            logger.error(f"Error fetching social data: {e}")
        
        return texts[:50]  # Limit to 50 texts

    def _is_relevant_text(self, text: str, keywords: List[str]) -> bool:
        """Check if text is relevant to the cryptocurrency"""
        text_lower = text.lower()
        return any(keyword.lower() in text_lower for keyword in keywords)

    def _analyze_text_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment of a single text using multiple methods"""
        # Clean text
        cleaned_text = self._clean_text(text)
        
        if not cleaned_text:
            return {"compound": 0.0, "positive": 0.0, "negative": 0.0, "neutral": 1.0}
        
        # VADER sentiment analysis
        vader_scores = self.vader_analyzer.polarity_scores(cleaned_text)
        
        # TextBlob sentiment analysis
        try:
            blob = TextBlob(cleaned_text)
            textblob_polarity = blob.sentiment.polarity
            textblob_subjectivity = blob.sentiment.subjectivity
        except:
            textblob_polarity = 0.0
            textblob_subjectivity = 0.0
        
        # Combine scores (weighted average)
        combined_score = (vader_scores["compound"] * 0.7) + (textblob_polarity * 0.3)
        
        return {
            "compound": combined_score,
            "positive": vader_scores["pos"],
            "negative": vader_scores["neg"],
            "neutral": vader_scores["neu"],
            "textblob_polarity": textblob_polarity,
            "textblob_subjectivity": textblob_subjectivity
        }

    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text"""
        if not text:
            return ""
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text.strip()

    def _aggregate_sentiment_results(self, sentiment_results: List[Dict[str, float]]) -> Dict[str, Any]:
        """Aggregate multiple sentiment results"""
        if not sentiment_results:
            return {
                "sentiment_score": 0.0,
                "sentiment_label": "neutral",
                "confidence": 0.0,
                "analysis_details": {
                    "positive_count": 0,
                    "negative_count": 0,
                    "neutral_count": 0
                }
            }
        
        # Calculate average sentiment score
        compound_scores = [result["compound"] for result in sentiment_results]
        avg_sentiment = np.mean(compound_scores)
        
        # Calculate confidence based on consistency
        std_sentiment = np.std(compound_scores)
        confidence = max(0.0, 1.0 - (std_sentiment / 2.0))  # Higher std = lower confidence
        
        # Determine sentiment label
        if avg_sentiment >= 0.05:
            sentiment_label = "positive"
        elif avg_sentiment <= -0.05:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
        
        # Count sentiment categories
        positive_count = sum(1 for score in compound_scores if score >= 0.05)
        negative_count = sum(1 for score in compound_scores if score <= -0.05)
        neutral_count = len(compound_scores) - positive_count - negative_count
        
        return {
            "sentiment_score": float(avg_sentiment),
            "sentiment_label": sentiment_label,
            "confidence": float(confidence),
            "analysis_details": {
                "positive_count": positive_count,
                "negative_count": negative_count,
                "neutral_count": neutral_count,
                "total_analyzed": len(sentiment_results),
                "average_score": float(avg_sentiment),
                "score_std": float(std_sentiment)
            }
        }

    async def train_model(self, symbols: List[str], parameters: Dict[str, Any]):
        """Train sentiment analysis model (placeholder for custom model training)"""
        logger.info(f"Training sentiment model for symbols: {symbols}")
        
        # This is a placeholder for custom model training
        # In a real implementation, you would:
        # 1. Collect labeled training data
        # 2. Train a custom sentiment model
        # 3. Save the trained model
        # 4. Update the analyzer to use the new model
        
        await asyncio.sleep(5)  # Simulate training time
        logger.info("Sentiment model training completed")

    def get_model_status(self) -> Dict[str, Any]:
        """Get status of the sentiment analysis model"""
        return {
            "model_type": "VADER + TextBlob Ensemble",
            "status": "ready" if self.ready else "not_ready",
            "last_updated": datetime.utcnow().isoformat(),
            "supported_languages": ["en"],
            "sources_configured": {
                "news": bool(self.news_sources["newsapi"]["api_key"]),
                "social": True
            }
        }