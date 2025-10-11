import { useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useMarketStore } from '../../store/marketStore';
import { useMultipleRealTimeData } from '../../hooks/useRealTimeMarketData';
import { motion } from 'framer-motion';

const MarketOverview = () => {
  const { marketData, isLoading, fetchMarketData, updateWithCurrentPrices } = useMarketStore();
  
  // Real-time market data
  const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'BNBUSDT'];
  const { getAllPrices } = useMultipleRealTimeData(symbols);
  const currentPrices = getAllPrices();

  useEffect(() => {
    // Fetch market data with current prices
    fetchMarketData(currentPrices);
  }, [fetchMarketData]);
  
  // Update market data when prices change
  useEffect(() => {
    if (Object.keys(currentPrices).length > 0) {
      updateWithCurrentPrices(currentPrices);
    }
  }, [currentPrices, updateWithCurrentPrices]);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty or undefined marketData
  if (!marketData || marketData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Market Overview
          </h3>
          <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Live Data</span>
        </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">No market data available</p>
          <button 
            onClick={() => fetchMarketData(currentPrices)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry with Live Data
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
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Market Overview
        </h3>
        <span className="text-sm text-gray-400">Live</span>
      </div>

      <div className="space-y-4">
        {marketData.slice(0, 3).map((crypto, index) => {
          // Safely handle changePercent - provide fallback values
          const changePercent = crypto.changePercent || '0%';
          const isPositive = changePercent.toString().startsWith('+');
          
          return (
            <motion.div
              key={crypto.symbol || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{crypto.symbol || 'Unknown'}</h4>
                  <p className="text-sm text-gray-400">Vol: {crypto.volume || '0'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-white">${crypto.price || '0'}</p>
                <div className={`flex items-center text-sm ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {changePercent}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-600">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">24h High</p>
            <p className="font-semibold text-green-400">${marketData[0]?.high || '0'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">24h Low</p>
            <p className="font-semibold text-red-400">${marketData[0]?.low || '0'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketOverview;