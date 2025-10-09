import { useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Target, Shield } from 'lucide-react';
import { useAiStore } from '../../store/aiStore';
import { motion } from 'framer-motion';

const AiRecommendations = () => {
  const { recommendations, confidence, isLoading, fetchRecommendations } = useAiStore();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
        return 'text-green-400 bg-green-400/10';
      case 'SELL':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
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

  // Handle empty recommendations
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            AI Recommendations
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Confidence:</span>
            <span className="text-primary font-semibold">{confidence || 0}%</span>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">No AI recommendations available</p>
          <button 
            onClick={fetchRecommendations}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Generate Recommendations
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          AI Recommendations
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Confidence:</span>
          <span className="text-primary font-semibold">{confidence || 0}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.slice(0, 2).map((rec, index) => (
          <motion.div
            key={rec?.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-white">{rec?.symbol || 'Unknown'}</span>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  getActionColor(rec?.action)
                }`}>
                  {getActionIcon(rec?.action)}
                  <span>{rec?.action || 'HOLD'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Confidence</div>
                <div className="font-semibold text-primary">{rec?.confidence || 0}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                  <Target className="h-3 w-3" />
                  <span>Target</span>
                </div>
                <div className="text-sm font-medium text-white">${rec?.targetPrice || '0'}</div>
              </div>
              <div>
                <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                  <Shield className="h-3 w-3" />
                  <span>Stop Loss</span>
                </div>
                <div className="text-sm font-medium text-white">${rec?.stopLoss || '0'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{rec?.timeframe || 'Unknown'}</span>
              <span className={`font-medium ${getRiskColor(rec?.riskLevel)}`}>
                {rec?.riskLevel || 'Unknown'} Risk
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-2 line-clamp-2">
              {rec?.reasoning || 'No reasoning provided'}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-600">
        <button className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
          View All Recommendations
        </button>
      </div>
    </motion.div>
  );
};

export default AiRecommendations;