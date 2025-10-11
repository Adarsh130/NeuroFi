import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Users,
  Hash,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { PieChart, LineChart } from '../components/charts';
import { useSentimentStore } from '../store/sentimentStore';

const SentimentAnalysis = () => {
  const {
    sentimentData,
    trendingTopics,
    sentimentHistory,
    isLoading,
    fetchSentimentData
  } = useSentimentStore();

  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  useEffect(() => {
    fetchSentimentData();
  }, [fetchSentimentData]);

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 70) return 'text-green-400';
    if (sentiment >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentBgColor = (sentiment) => {
    if (sentiment >= 70) return 'bg-green-400/10 border-green-400/20';
    if (sentiment >= 50) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  const chartData = [
    { name: 'Positive', value: sentimentData.positive, color: '#10B981' },
    { name: 'Neutral', value: sentimentData.neutral, color: '#6B7280' },
    { name: 'Negative', value: sentimentData.negative, color: '#EF4444' }
  ];

  // Prepare sentiment history data for line chart
  const sentimentChartData = sentimentHistory.map((item) => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    sentiment: item.sentiment,
    volume: item.volume
  }));

  const timeframes = ['1h', '4h', '24h', '7d', '30d'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-700 rounded-xl"></div>
            <div className="h-64 bg-slate-700 rounded-xl"></div>
            <div className="h-64 bg-slate-700 rounded-xl"></div>
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
            Sentiment Analysis
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time social media sentiment tracking and analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe} value={timeframe}>
                {timeframe}
              </option>
            ))}
          </select>
          
          <button
            onClick={fetchSentimentData}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Overall Sentiment Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-8 border ${getSentimentBgColor(sentimentData.overall)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Overall Market Sentiment
            </h2>
            <p className="text-gray-400">
              Based on {sentimentHistory.length} data points from social media
            </p>
          </div>
          <div className="text-right">
            <div className={`text-6xl font-bold ${getSentimentColor(sentimentData.overall)}`}>
              {sentimentData.overall}%
            </div>
            <div className="text-gray-400 mt-2">
              {sentimentData.overall >= 70 ? 'Very Positive' :
               sentimentData.overall >= 50 ? 'Neutral' : 'Negative'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Sentiment Distribution
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 flex items-center justify-center">
              <PieChart 
                data={chartData} 
                size={160} 
                innerRadius={40}
              />
            </div>
            
            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sentiment Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Sentiment Trend ({selectedTimeframe})
          </h3>
          
          <div className="h-48">
            <LineChart
              data={sentimentChartData}
              xKey="time"
              yKey="sentiment"
              width={400}
              height={180}
              color="#5C6BF3"
              showGrid={true}
              showDots={true}
            />
          </div>
        </motion.div>
      </div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Hash className="h-5 w-5 mr-2 text-primary" />
          Trending Topics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-accent font-semibold text-lg">
                  {topic.topic}
                </span>
                <div className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                  {topic.sentiment}%
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{topic.mentions.toLocaleString()} mentions</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {topic.sentiment >= 60 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sentiment Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          Key Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">
                Positive Indicators
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Strong bullish sentiment on Bitcoin</li>
                <li>• Increased institutional adoption mentions</li>
                <li>• Positive regulatory news coverage</li>
              </ul>
            </div>
            
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">
                Neutral Factors
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Mixed opinions on altcoin performance</li>
                <li>• Uncertainty around market direction</li>
                <li>• Balanced discussion on DeFi projects</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">
                Risk Factors
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Concerns about market volatility</li>
                <li>• Regulatory uncertainty discussions</li>
                <li>• Fear of potential market correction</li>
              </ul>
            </div>
            
            <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">
                Recommendations
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Monitor sentiment shifts closely</li>
                <li>• Consider sentiment in trading decisions</li>
                <li>• Watch for sentiment divergence signals</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SentimentAnalysis;