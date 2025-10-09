import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { LineChart } from '../charts';

/**
 * Performance chart component showing portfolio and asset performance
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data
 * @param {string} props.timeframe - Selected timeframe
 * @param {Function} props.onTimeframeChange - Timeframe change handler
 * @returns {JSX.Element} PerformanceChart component
 */
const PerformanceChart = ({ 
  data = [], 
  timeframe = '7d',
  onTimeframeChange = () => {}
}) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const timeframes = [
    { value: '1d', label: '1D' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' }
  ];

  useEffect(() => {
    // Generate mock performance data
    const generateMockData = () => {
      const days = timeframe === '1d' ? 24 : 
                   timeframe === '7d' ? 7 : 
                   timeframe === '30d' ? 30 : 
                   timeframe === '90d' ? 90 : 365;
      
      const interval = timeframe === '1d' ? 'hour' : 'day';
      
      return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        if (interval === 'hour') {
          date.setHours(date.getHours() - (days - 1 - i));
        } else {
          date.setDate(date.getDate() - (days - 1 - i));
        }
        
        const basePortfolio = 100;
        const portfolioChange = (Math.random() - 0.5) * 10;
        const btcChange = (Math.random() - 0.5) * 15;
        const ethChange = (Math.random() - 0.5) * 12;
        
        return {
          date: interval === 'hour' 
            ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timestamp: date.getTime(),
          portfolio: basePortfolio + portfolioChange * (i + 1),
          bitcoin: 100 + btcChange * (i + 1),
          ethereum: 100 + ethChange * (i + 1),
          portfolioChange: portfolioChange * (i + 1),
          bitcoinChange: btcChange * (i + 1),
          ethereumChange: ethChange * (i + 1)
        };
      });
    };

    setIsLoading(true);
    setTimeout(() => {
      setChartData(generateMockData());
      setIsLoading(false);
    }, 500);
  }, [timeframe]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Performance Comparison
        </h3>
        
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="flex bg-slate-700 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange(tf.value)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  timeframe === tf.value
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { 
            label: 'Portfolio', 
            value: chartData[chartData.length - 1]?.portfolioChange || 0,
            color: 'text-primary'
          },
          { 
            label: 'Bitcoin', 
            value: chartData[chartData.length - 1]?.bitcoinChange || 0,
            color: 'text-orange-400'
          },
          { 
            label: 'Ethereum', 
            value: chartData[chartData.length - 1]?.ethereumChange || 0,
            color: 'text-blue-400'
          }
        ].map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <div className={`text-lg font-bold flex items-center justify-center ${
              stat.value >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${
                stat.value < 0 ? 'rotate-180' : ''
              }`} />
              {stat.value >= 0 ? '+' : ''}{stat.value.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <LineChart
          data={chartData}
          xKey="date"
          yKey="portfolioChange"
          width={400}
          height={200}
          color="#5C6BF3"
          showGrid={true}
          showDots={false}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-sm text-gray-400">Portfolio</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span className="text-sm text-gray-400">Bitcoin</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-gray-400">Ethereum</span>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-slate-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Showing {timeframe} performance comparison
          </span>
          <span className="text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;