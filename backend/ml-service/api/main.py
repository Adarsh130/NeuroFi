"""
NeuroFi ML Service API
Provides sentiment analysis and price prediction services
"""

import os
import sys
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import asyncio
import logging

# Add the parent directory to the path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

from services.sentiment_analyzer import SentimentAnalyzer
from services.price_predictor import PricePredictor
from services.technical_analyzer import TechnicalAnalyzer
from services.data_fetcher import DataFetcher
from services.recommendation_engine import RecommendationEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NeuroFi ML Service",
    description="AI-powered cryptocurrency analysis and prediction service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
sentiment_analyzer = SentimentAnalyzer()
price_predictor = PricePredictor()
technical_analyzer = TechnicalAnalyzer()
data_fetcher = DataFetcher()
recommendation_engine = RecommendationEngine()

# Pydantic models
class SentimentResponse(BaseModel):
    symbol: str
    sentiment_score: float = Field(..., ge=-1, le=1, description="Sentiment score between -1 and 1")
    sentiment_label: str = Field(..., description="Sentiment label: positive, negative, or neutral")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    sources_analyzed: int = Field(..., description="Number of sources analyzed")
    last_updated: datetime

class PredictionResponse(BaseModel):
    symbol: str
    current_price: float
    predicted_price: float
    prediction_change: float
    prediction_change_percent: float
    confidence: float = Field(..., ge=0, le=1)
    timeframe: str
    model_used: str
    features_used: List[str]
    last_updated: datetime

class TechnicalAnalysisResponse(BaseModel):
    symbol: str
    indicators: Dict[str, Any]
    signals: Dict[str, str]
    support_levels: List[float]
    resistance_levels: List[float]
    trend: str
    strength: float
    last_updated: datetime

class RecommendationResponse(BaseModel):
    symbol: str
    action: str = Field(..., description="buy, sell, or hold")
    confidence: float = Field(..., ge=0, le=1)
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    reasoning: str
    risk_level: str
    time_horizon: str
    last_updated: datetime

class TrainingRequest(BaseModel):
    model_type: str = Field(..., description="Type of model to train")
    symbols: List[str] = Field(..., description="Symbols to train on")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Training parameters")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "sentiment_analyzer": sentiment_analyzer.is_ready(),
            "price_predictor": price_predictor.is_ready(),
            "technical_analyzer": technical_analyzer.is_ready(),
            "data_fetcher": data_fetcher.is_ready()
        }
    }

# Sentiment Analysis Endpoints
@app.get("/sentiment", response_model=List[SentimentResponse])
async def get_sentiment_analysis(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    sources: Optional[str] = Query("news,social", description="Data sources to analyze")
):
    """Get sentiment analysis for cryptocurrencies"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        source_list = [s.strip() for s in sources.split(",")]
        
        results = []
        for symbol in symbol_list:
            try:
                sentiment_data = await sentiment_analyzer.analyze_sentiment(symbol, source_list)
                results.append(SentimentResponse(
                    symbol=symbol,
                    sentiment_score=sentiment_data["sentiment_score"],
                    sentiment_label=sentiment_data["sentiment_label"],
                    confidence=sentiment_data["confidence"],
                    sources_analyzed=sentiment_data["sources_analyzed"],
                    last_updated=datetime.utcnow()
                ))
            except Exception as e:
                logger.error(f"Error analyzing sentiment for {symbol}: {e}")
                # Return neutral sentiment if analysis fails
                results.append(SentimentResponse(
                    symbol=symbol,
                    sentiment_score=0.0,
                    sentiment_label="neutral",
                    confidence=0.0,
                    sources_analyzed=0,
                    last_updated=datetime.utcnow()
                ))
        
        return results
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Price Prediction Endpoints
@app.get("/predictions", response_model=List[PredictionResponse])
async def get_price_predictions(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    timeframe: str = Query("1d", description="Prediction timeframe (1h, 4h, 1d, 7d)")
):
    """Get price predictions for cryptocurrencies"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        results = []
        for symbol in symbol_list:
            try:
                prediction_data = await price_predictor.predict_price(symbol, timeframe)
                results.append(PredictionResponse(
                    symbol=symbol,
                    current_price=prediction_data["current_price"],
                    predicted_price=prediction_data["predicted_price"],
                    prediction_change=prediction_data["prediction_change"],
                    prediction_change_percent=prediction_data["prediction_change_percent"],
                    confidence=prediction_data["confidence"],
                    timeframe=timeframe,
                    model_used=prediction_data["model_used"],
                    features_used=prediction_data["features_used"],
                    last_updated=datetime.utcnow()
                ))
            except Exception as e:
                logger.error(f"Error predicting price for {symbol}: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to predict price for {symbol}")
        
        return results
    except Exception as e:
        logger.error(f"Error in price prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Technical Analysis Endpoints
@app.get("/technical-analysis/{symbol}", response_model=TechnicalAnalysisResponse)
async def get_technical_analysis(
    symbol: str,
    interval: str = Query("1h", description="Data interval"),
    period: str = Query("30d", description="Analysis period")
):
    """Get technical analysis for a cryptocurrency"""
    try:
        symbol = symbol.upper()
        analysis_data = await technical_analyzer.analyze(symbol, interval, period)
        
        return TechnicalAnalysisResponse(
            symbol=symbol,
            indicators=analysis_data["indicators"],
            signals=analysis_data["signals"],
            support_levels=analysis_data["support_levels"],
            resistance_levels=analysis_data["resistance_levels"],
            trend=analysis_data["trend"],
            strength=analysis_data["strength"],
            last_updated=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error in technical analysis for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# AI Recommendations Endpoints
@app.get("/recommendations", response_model=List[RecommendationResponse])
async def get_ai_recommendations(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    risk_level: str = Query("medium", description="Risk level: low, medium, high")
):
    """Get AI-powered trading recommendations"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        results = []
        for symbol in symbol_list:
            try:
                recommendation_data = await recommendation_engine.generate_recommendation(
                    symbol, risk_level
                )
                results.append(RecommendationResponse(
                    symbol=symbol,
                    action=recommendation_data["action"],
                    confidence=recommendation_data["confidence"],
                    target_price=recommendation_data.get("target_price"),
                    stop_loss=recommendation_data.get("stop_loss"),
                    reasoning=recommendation_data["reasoning"],
                    risk_level=risk_level,
                    time_horizon=recommendation_data["time_horizon"],
                    last_updated=datetime.utcnow()
                ))
            except Exception as e:
                logger.error(f"Error generating recommendation for {symbol}: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to generate recommendation for {symbol}")
        
        return results
    except Exception as e:
        logger.error(f"Error in AI recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model Training Endpoints
@app.post("/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Start model training (background task)"""
    try:
        # Add training task to background
        background_tasks.add_task(
            _train_model_background,
            request.model_type,
            request.symbols,
            request.parameters
        )
        
        return {
            "message": "Model training started",
            "model_type": request.model_type,
            "symbols": request.symbols,
            "status": "training_started"
        }
    except Exception as e:
        logger.error(f"Error starting model training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-status")
async def get_model_status():
    """Get status of all models"""
    try:
        return {
            "sentiment_model": sentiment_analyzer.get_model_status(),
            "price_prediction_model": price_predictor.get_model_status(),
            "technical_analysis_model": technical_analyzer.get_model_status(),
            "recommendation_model": recommendation_engine.get_model_status()
        }
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task for model training
async def _train_model_background(model_type: str, symbols: List[str], parameters: Dict[str, Any]):
    """Background task for model training"""
    try:
        logger.info(f"Starting training for {model_type} model with symbols: {symbols}")
        
        if model_type == "sentiment":
            await sentiment_analyzer.train_model(symbols, parameters)
        elif model_type == "price_prediction":
            await price_predictor.train_model(symbols, parameters)
        elif model_type == "technical_analysis":
            await technical_analyzer.train_model(symbols, parameters)
        elif model_type == "recommendation":
            await recommendation_engine.train_model(symbols, parameters)
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        logger.info(f"Training completed for {model_type} model")
    except Exception as e:
        logger.error(f"Error in background training: {e}")

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting NeuroFi ML Service...")
    
    try:
        # Initialize all services
        await sentiment_analyzer.initialize()
        await price_predictor.initialize()
        await technical_analyzer.initialize()
        await data_fetcher.initialize()
        await recommendation_engine.initialize()
        
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down NeuroFi ML Service...")
    
    try:
        # Cleanup services
        await sentiment_analyzer.cleanup()
        await price_predictor.cleanup()
        await technical_analyzer.cleanup()
        await data_fetcher.cleanup()
        await recommendation_engine.cleanup()
        
        logger.info("Cleanup completed")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )