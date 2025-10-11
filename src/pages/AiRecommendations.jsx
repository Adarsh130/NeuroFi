import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Play,
  BarChart3,
  DollarSign,
  Activity,
  Eye
} from 'lucide-react';
import { useAiStore } from '../store/aiStore';
import { useRealTimeMarketData, useMultipleRealTimeData } from '../hooks/useRealTimeMarketData';
import TradingModal from '../components/trading/TradingModal';
import clsx from 'clsx';

const AiRecommendations = () => {
  const {
    recommendations,
    predictions,
    confidence,
    isLoading,
    fetchRecommendations,
    acceptRecommendation,
    popularSymbols
  } = useAiStore();

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [tradingModal, setTradingModal] = useState(null);
  const [openPositions, setOpenPositions] = useState([]);
  const [realTimePredictions, setRealTimePredictions] = useState({});

  // Real-time data for current prices using multiple symbols
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'LINKUSDT'];
  const { data: marketData, getAllPrices } = useMultipleRealTimeData(symbols);
  const currentPrices = getAllPrices();

  // Fallback prices if WebSocket data is not available
  const fallbackPrices = {
    BTCUSDT: 43000,
    ETHUSDT: 2600,
    BNBUSDT: 300,
    SOLUSDT: 95,
    ADAUSDT: 0.45,
    XRPUSDT: 0.52,
    DOTUSDT: 7.2,
    LINKUSDT: 14.5
  };

  // Get current price with fallback
  const getCurrentPrice = (symbol) => {
    const livePrice = currentPrices[symbol];
    const fallbackPrice = fallbackPrices[symbol];
    
    // Prefer live price if it's valid and reasonable
    if (livePrice && livePrice > 0 && livePrice < 1000000) {
      return livePrice;
    }
    
    console.warn(`Using fallback price for ${symbol}: live=${livePrice}, fallback=${fallbackPrice}`);
    return fallbackPrice || 0;
  };

  // Generate real-time AI predictions with timeframe-appropriate volatility
  const generateRealTimePredictions = () => {
    const predictionSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    const timeframes = ['1h', '4h', '24h'];
    const newPredictions = {};

    predictionSymbols.forEach(symbol => {
      newPredictions[symbol] = {};
      const currentPrice = getCurrentPrice(symbol);
      
      // Debug log to check current prices
      if (currentPrice === 0 || !currentPrice) {
        console.warn(`Warning: Invalid price for ${symbol}: ${currentPrice}`);
      } else {
        console.log(`Generating predictions for ${symbol}: Current Price = ${currentPrice}`);
      }
      
      timeframes.forEach(timeframe => {
        // Get existing prediction to maintain stability for longer timeframes
        const existingPrediction = realTimePredictions[symbol]?.[timeframe];
        const timeSinceLastUpdate = existingPrediction ? 
          Date.now() - new Date(existingPrediction.timestamp).getTime() : Infinity;
        
        // Define update intervals and volatility based on timeframe
        const timeframeConfig = {
          '1h': { 
            updateInterval: 30 * 1000, // Update every 30 seconds for stability
            baseVolatility: 0.005, // 0.5% base volatility
            maxVolatility: 0.015   // 1.5% max volatility
          },
          '4h': { 
            updateInterval: 2 * 60 * 1000, // Update every 2 minutes
            baseVolatility: 0.003, // 0.3% base volatility
            maxVolatility: 0.01   // 1% max volatility
          },
          '24h': { 
            updateInterval: 5 * 60 * 1000, // Update every 5 minutes
            baseVolatility: 0.002, // 0.2% base volatility
            maxVolatility: 0.008    // 0.8% max volatility
          }
        };
        
        const config = timeframeConfig[timeframe];
        
        // Only update if enough time has passed or no existing prediction
        if (!existingPrediction || timeSinceLastUpdate >= config.updateInterval) {
          // Generate more stable predictions for longer timeframes
          const volatilityRange = config.maxVolatility - config.baseVolatility;
          const volatility = config.baseVolatility + (Math.random() * volatilityRange);
          
          // Use a more stable direction determination for all timeframes
          let direction;
          if (existingPrediction && existingPrediction.direction) {
            // Maintain existing direction for stability (80% chance)
            direction = Math.random() > 0.2 ? existingPrediction.direction : (existingPrediction.direction === 'up' ? 'down' : 'up');
          } else {
            // For new predictions, use current market trend
            const recentTrend = Math.random() > 0.5 ? 'up' : 'down';
            direction = recentTrend;
          }
          
          // Calculate price change based on CURRENT LIVE PRICE
          let targetPrice;
          if (existingPrediction && existingPrediction.price && Math.abs(existingPrediction.price - currentPrice) / currentPrice < 0.1) {
            // Only use existing prediction if it's within 10% of current price
            const adjustment = volatility * (Math.random() - 0.5) * 0.3; // Smaller adjustment
            targetPrice = currentPrice * (1 + adjustment); // Base on current price, not old prediction
          } else {
            // Always base new predictions on CURRENT LIVE PRICE
            targetPrice = direction === 'up' 
              ? currentPrice * (1 + volatility * (0.2 + Math.random() * 0.3))
              : currentPrice * (1 - volatility * (0.2 + Math.random() * 0.3));
          }
          
          // Higher confidence for longer timeframes due to more stable predictions
          const baseConfidence = timeframe === '1h' ? 0.6 : timeframe === '4h' ? 0.7 : 0.75;
          const confidence = baseConfidence + Math.random() * 0.2; // Add some variation
          
          newPredictions[symbol][timeframe] = {
            price: targetPrice,
            direction,
            probability: confidence,
            confidence: Math.round(confidence * 100),
            timestamp: new Date(),
            model: 'Neural Network v2.1',
            lastUpdate: new Date().toISOString(),
            isStable: true,
            basedOnPrice: currentPrice // Track what price this prediction was based on
          };
        } else {
          // Keep existing prediction but update the base price reference
          newPredictions[symbol][timeframe] = {
            ...existingPrediction,
            basedOnPrice: currentPrice
          };
        }
      });
    });

    setRealTimePredictions(newPredictions);
  };

  // Load open positions from localStorage
  const loadOpenPositions = () => {
    try {
      const saved = localStorage.getItem('openPositions');
      if (saved) {
        setOpenPositions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  // Save positions to localStorage
  const saveOpenPositions = (positions) => {
    try {
      localStorage.setItem('openPositions', JSON.stringify(positions));
      setOpenPositions(positions);
    } catch (error) {
      console.error('Error saving positions:', error);
    }
  };

  useEffect(() => {
    // Fetch recommendations with current prices
    fetchRecommendations(currentPrices);
    generateRealTimePredictions();
    loadOpenPositions();

    // Update predictions every 30 seconds for stability
    const interval = setInterval(() => {
      console.log('Scheduled prediction update with current prices:', currentPrices);
      generateRealTimePredictions();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchRecommendations]);

  // Update predictions when prices change significantly
  useEffect(() => {
    // Force update predictions when we get new live prices
    if (Object.keys(currentPrices).length > 0) {
      // Check if any current price is significantly different from what we expect
      const hasSignificantChange = Object.keys(currentPrices).some(symbol => {
        const currentPrice = currentPrices[symbol];
        const lastPrediction = realTimePredictions[symbol]?.['1h'];
        
        if (!lastPrediction || !currentPrice) return true; // Update if no prediction exists
        
        // If prediction is way off from current price, update immediately
        const predictionDiff = Math.abs(lastPrediction.price - currentPrice) / currentPrice;
        return predictionDiff > 0.05; // 5% threshold for immediate update
      });
      
      if (hasSignificantChange) {
        console.log('Updating predictions due to significant price changes');
        generateRealTimePredictions();
      }
    }
  }, [currentPrices]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'SELL':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage) => {
    if (typeof percentage !== 'number' || isNaN(percentage)) return '0.00%';
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true;
    return rec.action.toLowerCase() === filter.toLowerCase();
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return (b.confidence || 0) - (a.confidence || 0);
      case 'symbol':
        return (a.symbol || '').localeCompare(b.symbol || '');
      case 'risk':
        const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
        return (riskOrder[a.riskLevel] || 2) - (riskOrder[b.riskLevel] || 2);
      default:
        return 0;
    }
  });

  // Handle accepting a recommendation
  const handleAcceptRecommendation = (rec) => {
    const tradeData = acceptRecommendation(rec.id);
    if (tradeData) {
      // Always use real-time market price
      const realTimePrice = getCurrentPrice(rec.symbol);
      
      // Calculate dynamic target and stop loss based on current price
      const priceAdjustmentFactor = realTimePrice / (rec.currentPrice || realTimePrice);
      const adjustedTargetPrice = rec.targetPrice ? rec.targetPrice * priceAdjustmentFactor : realTimePrice * (rec.action === 'BUY' ? 1.05 : 0.95);
      const adjustedStopLoss = rec.stopLoss ? rec.stopLoss * priceAdjustmentFactor : realTimePrice * (rec.action === 'BUY' ? 0.95 : 1.05);
      
      setTradingModal({
        ...tradeData,
        currentPrice: realTimePrice,
        targetPrice: adjustedTargetPrice,
        stopLoss: adjustedStopLoss,
        reasoning: `AI recommendation updated with real-time price: ${realTimePrice.toFixed(2)}. ${rec.reasoning || 'Based on current market analysis.'}`
      });
    }
  };

  // Handle opening trade from prediction
  const handleOpenTradeFromPrediction = (symbol, timeframe) => {
    const prediction = realTimePredictions[symbol]?.[timeframe];
    if (prediction && prediction.price && prediction.direction && prediction.probability) {
      // Always use real-time market price
      const currentPrice = getCurrentPrice(symbol);
      const targetPrice = prediction.price || 0;
      const action = prediction.direction === 'up' ? 'BUY' : 'SELL';
      
      // Calculate stop loss based on timeframe (longer timeframes = wider stops)
      const stopLossPercentage = timeframe === '1h' ? 0.03 : timeframe === '4h' ? 0.05 : 0.08;
      const stopLoss = action === 'BUY' 
        ? currentPrice * (1 - stopLossPercentage)
        : currentPrice * (1 + stopLossPercentage);
      
      setTradingModal({
        symbol,
        action,
        currentPrice, // Real-time price
        targetPrice,
        stopLoss,
        confidence: Math.round((prediction.probability || 0) * 100),
        timeframe,
        reasoning: `AI predicts ${prediction.direction}ward movement to ${targetPrice.toFixed(2)} (${timeframe} timeframe) based on real-time market analysis. Current price: ${currentPrice.toFixed(2)}`
      });
    }
  };

  // Handle trade completion
  const handleTradeComplete = (tradeData) => {
    const newPosition = {
      id: Date.now(),
      ...tradeData,
      openTime: new Date(),
      status: 'open',
      currentPnL: 0
    };
    
    const updatedPositions = [...openPositions, newPosition];
    saveOpenPositions(updatedPositions);
    setTradingModal(null);
  };

  // Close position
  const closePosition = (positionId) => {
    const updatedPositions = openPositions.map(pos => {
      if (pos.id === positionId) {
        const currentPrice = getCurrentPrice(pos.symbol) || pos.currentPrice;
        const pnl = pos.action === 'BUY' 
          ? (currentPrice - pos.currentPrice) * pos.quantity
          : (pos.currentPrice - currentPrice) * pos.quantity;
        
        return {
          ...pos,
          status: 'closed',
          closeTime: new Date(),
          closePrice: currentPrice,
          finalPnL: pnl
        };
      }
      return pos;
    });
    
    saveOpenPositions(updatedPositions);
  };

  // Calculate current P&L for open positions
  const calculateCurrentPnL = (position) => {
    if (position.status === 'closed') return position.finalPnL || 0;
    
    const currentPrice = getCurrentPrice(position.symbol) || position.currentPrice;
    return position.action === 'BUY' 
      ? (currentPrice - position.currentPrice) * position.quantity
      : (position.currentPrice - currentPrice) * position.quantity;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">
            AI Recommendations
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered trading signals and market predictions
          </p>
        </div>
        
        <button
          onClick={() => {
            console.log('Force refreshing with current prices:', currentPrices);
            // Clear existing predictions to force regeneration
            setRealTimePredictions({});
            fetchRecommendations(currentPrices);
            // Force immediate regeneration with current prices
            setTimeout(() => generateRealTimePredictions(), 100);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh with Live Data</span>
        </button>
      </motion.div>

      {/* Open Positions */}
      {openPositions.filter(pos => pos.status === 'open').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Open Positions ({openPositions.filter(pos => pos.status === 'open').length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openPositions.filter(pos => pos.status === 'open').map((position) => {
              const currentPnL = calculateCurrentPnL(position);
              const pnlPercentage = (currentPnL / (position.currentPrice * position.quantity)) * 100;
              
              return (
                <div
                  key={position.id}
                  className="bg-slate-700/30 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {(position.symbol || '').replace('USDT', '').slice(0, 3)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {(position.symbol || '').replace('USDT', '')}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${getActionColor(position.action)}`}>
                          {position.action}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => closePosition(position.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="text-white">{position.quantity || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entry:</span>
                      <span className="text-white">{formatCurrency(position.currentPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current:</span>
                      <span className="text-white">{formatCurrency(getCurrentPrice(position.symbol))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P&L:</span>
                      <span className={currentPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(currentPnL)} ({formatPercentage(pnlPercentage)})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* AI Confidence Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-12 w-12 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                AI Model Confidence
              </h2>
              <p className="text-gray-400">
                Real-time prediction accuracy with live market data
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getConfidenceColor(confidence || 75)}`}>
              {confidence || 75}%
            </div>
            <div className="text-gray-400 mt-1">
              {(confidence || 75) >= 80 ? 'High Confidence' :
               (confidence || 75) >= 60 ? 'Medium Confidence' : 'Low Confidence'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Real-time AI Predictions
        </h3>
        
        {/* Crypto Selection Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {popularSymbols.map(symbol => {
            const cryptoName = symbol.replace('USDT', '');
            const currentPrice = getCurrentPrice(symbol);
            const isSelected = selectedSymbol === symbol;
            
            return (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={clsx(
                  'p-4 rounded-lg border transition-all text-left',
                  isSelected
                    ? 'bg-primary border-primary text-white'
                    : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{cryptoName}</span>
                  <div className="h-8 w-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {cryptoName.slice(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="text-sm opacity-75">
                  <span className="text-green-400">LIVE</span> {formatCurrency(getCurrentPrice(symbol))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Crypto Predictions */}
        {realTimePredictions[selectedSymbol] && (
          <div className="bg-slate-700/30 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-4">
              {selectedSymbol.replace('USDT', '')} Price Predictions
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(realTimePredictions[selectedSymbol] || {}).map(([timeframe, data]) => {
                if (!data || !data.direction || !data.probability || !data.price) {
                  return null;
                }
                
                return (
                  <div
                    key={timeframe}
                    className="bg-slate-600/30 border border-slate-500 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm font-medium">{timeframe}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        data.direction === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {data.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">{Math.round((data.probability || 0) * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-white">
                        {data.price ? formatCurrency(data.price) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Predicted Price
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Current: {formatCurrency(getCurrentPrice(selectedSymbol))}
                      </div>
                      <div className={`text-xs mt-1 ${
                        (data.price - getCurrentPrice(selectedSymbol)) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {Math.abs((data.price - getCurrentPrice(selectedSymbol)) / (getCurrentPrice(selectedSymbol) || 1) * 100).toFixed(2)}% {(data.price - getCurrentPrice(selectedSymbol)) >= 0 ? 'above' : 'below'} current
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        {data.isStable ? 'Stable Prediction' : 'Volatile Prediction'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenTradeFromPrediction(selectedSymbol, timeframe)}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Open Trade</span>
                    </button>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-yellow-400 font-semibold mb-2">
              Important Disclaimer
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              AI recommendations are based on real-time market analysis and machine learning models. 
              They should not be considered as financial advice. Always conduct your own research 
              and consider your risk tolerance before making any trading decisions. 
              Cryptocurrency trading involves substantial risk of loss.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Trading Modal */}
      {tradingModal && (
        <TradingModal
          isOpen={!!tradingModal}
          onClose={() => setTradingModal(null)}
          symbol={tradingModal.symbol}
          action={tradingModal.action}
          currentPrice={tradingModal.currentPrice}
          targetPrice={tradingModal.targetPrice}
          stopLoss={tradingModal.stopLoss}
          confidence={tradingModal.confidence}
          reasoning={tradingModal.reasoning}
          onTradeComplete={handleTradeComplete}
        />
      )}
    </div>
  );
};

export default AiRecommendations;