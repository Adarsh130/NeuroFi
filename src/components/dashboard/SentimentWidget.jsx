import { useEffect } from 'react';
import { MessageSquare, TrendingUp, Users } from 'lucide-react';
import { useSentimentStore } from '../../store/sentimentStore';
import { motion } from 'framer-motion';
import { PieChart } from '../charts';

const SentimentWidget = () => {
  const { sentimentData, trendingTopics, isLoading, fetchSentimentData } = useSentimentStore();

  useEffect(() => {
    fetchSentimentData();
  }, [fetchSentimentData]);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="h-32 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Safely handle sentiment data with fallbacks
  const safeSentimentData = {
    overall: sentimentData?.overall || 0,
    positive: sentimentData?.positive || 0,
    neutral: sentimentData?.neutral || 0,
    negative: sentimentData?.negative || 0
  };

  const chartData = [
    { name: 'Positive', value: safeSentimentData.positive, color: '#10B981' },
    { name: 'Neutral', value: safeSentimentData.neutral, color: '#6B7280' },
    { name: 'Negative', value: safeSentimentData.negative, color: '#EF4444' }
  ];

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 70) return 'text-green-400';
    if (sentiment >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          Social Sentiment
        </h3>
        <div className={`text-2xl font-bold ${getSentimentColor(safeSentimentData.overall)}`}>
          {safeSentimentData.overall}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sentiment Chart */}
        <div className="h-32 flex items-center justify-center">
          <PieChart 
            data={chartData} 
            size={120} 
            innerRadius={30}
          />
        </div>

        {/* Sentiment Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Positive</span>
            <span className="text-green-400 font-medium">{safeSentimentData.positive}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Neutral</span>
            <span className="text-gray-400 font-medium">{safeSentimentData.neutral}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Negative</span>
            <span className="text-red-400 font-medium">{safeSentimentData.negative}%</span>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="mt-6 pt-4 border-t border-slate-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          Trending Topics
        </h4>
        <div className="space-y-2">
          {(trendingTopics || []).slice(0, 3).map((topic, index) => (
            <motion.div
              key={topic?.topic || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-accent font-medium">{topic?.topic || 'Unknown'}</span>
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-gray-400" />
                <span className="text-gray-400">{(topic?.mentions || 0).toLocaleString()}</span>
                <span className={getSentimentColor(topic?.sentiment || 0)}>
                  {topic?.sentiment || 0}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentWidget;