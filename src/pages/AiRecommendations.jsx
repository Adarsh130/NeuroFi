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
  RefreshCw
} from 'lucide-react';
import { useAiStore } from '../store/aiStore';

const AiRecommendations = () => {
  const {
    recommendations,
    predictions,
    confidence,
    isLoading,
    fetchRecommendations
  } = useAiStore();

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true;
    return rec.action.toLowerCase() === filter.toLowerCase();
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      case 'risk':
        const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      default:
        return 0;
    }
  });

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
          onClick={fetchRecommendations}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </motion.div>

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
                Current prediction accuracy based on historical performance
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getConfidenceColor(confidence)}`}>
              {confidence}%
            </div>
            <div className="text-gray-400 mt-1">
              {confidence >= 80 ? 'High Confidence' :
               confidence >= 60 ? 'Medium Confidence' : 'Low Confidence'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Recommendations</option>
              <option value="buy">Buy Signals</option>
              <option value="sell">Sell Signals</option>
              <option value="hold">Hold Signals</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="confidence">Sort by Confidence</option>
              <option value="symbol">Sort by Symbol</option>
              <option value="risk">Sort by Risk</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-400">
            {sortedRecommendations.length} recommendations found
          </div>
        </div>
      </motion.div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {rec.symbol.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {rec.symbol}
                  </h3>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(rec.action)}`}>
                    {getActionIcon(rec.action)}
                    <span>{rec.action}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400">Confidence</div>
                <div className={`text-2xl font-bold ${getConfidenceColor(rec.confidence)}`}>
                  {rec.confidence}%
                </div>
              </div>
            </div>

            {/* Price Targets */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                  <Target className="h-4 w-4" />
                  <span>Target Price</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                  ${rec.targetPrice}
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                  <Shield className="h-4 w-4" />
                  <span>Stop Loss</span>
                </div>
                <div className="text-lg font-bold text-red-400">
                  ${rec.stopLoss}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Timeframe:</span>
                <div className="flex items-center space-x-1 text-white">
                  <Clock className="h-4 w-4" />
                  <span>{rec.timeframe}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Risk Level:</span>
                <span className={`font-medium ${getRiskColor(rec.riskLevel)}`}>
                  {rec.riskLevel}
                </span>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-slate-700/20 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                AI Analysis:
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {rec.reasoning}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Accept</span>
              </button>
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Dismiss</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Market Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Short-term Price Predictions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(predictions).map(([symbol, pred]) => (
            <div
              key={symbol}
              className="bg-slate-700/30 border border-slate-600 rounded-lg p-4"
            >
              <h4 className="font-bold text-white mb-3">{symbol}</h4>
              
              <div className="space-y-2">
                {Object.entries(pred).map(([timeframe, data]) => (
                  <div key={timeframe} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{timeframe}:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        ${data.price}
                      </span>
                      <div className={`flex items-center space-x-1 ${
                        data.direction === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {data.direction === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.round(data.probability * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
              AI recommendations are based on historical data and market analysis. 
              They should not be considered as financial advice. Always conduct your own research 
              and consider your risk tolerance before making any trading decisions. 
              Cryptocurrency trading involves substantial risk of loss.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AiRecommendations;