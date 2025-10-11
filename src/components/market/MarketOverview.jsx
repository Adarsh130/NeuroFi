import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  DollarSign,
  Volume2,
  Clock,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import binanceService from '../../services/binanceService';
import { useRealTimeMarketData, useMultipleRealTimeData } from '../../hooks/useRealTimeMarketData';

/**
 * Market Overview component showing top cryptocurrencies
 */
const MarketOverview = ({ className = '' }) => {
  const [topPairs, setTopPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Popular trading pairs to track
  const popularSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 
    'SOLUSDT', 'XRPUSDT', 'DOTUSDT', 'LINKUSDT'
  ];

  // Real-time data for popular symbols
  const { 
    data: realTimeData, 
    isConnected,
    connect: connectRealTime,
    disconnect: disconnectRealTime 
  } = useMultipleRealTimeData(popularSymbols);

  // Fetch initial market data
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [topPairsData, popularPairsData] = await Promise.all([
        binanceService.getTopPairs(20),
        binanceService.getMultipleMarketData(popularSymbols)
      ]);

      // Combine and deduplicate data
      const combinedData = [...popularPairsData];
      
      // Add top pairs that aren't already in popular symbols
      topPairsData.forEach(pair => {
        if (!popularSymbols.includes(pair.symbol)) {
          combinedData.push(pair);
        }
      });

      setTopPairs(combinedData.slice(0, 20));
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Merge real-time data with static data
  const mergedData = topPairs.map(pair => {
    const realTimeUpdate = realTimeData[pair.symbol];
    if (realTimeUpdate) {
      return {
        ...pair,
        price: realTimeUpdate.price || pair.price || 0,
        change: realTimeUpdate.change || pair.change || 0,
        changePercent: realTimeUpdate.changePercent || pair.changePercent || 0,
        volume: realTimeUpdate.volume || pair.volume || 0,
        quoteVolume: realTimeUpdate.quoteVolume || pair.quoteVolume || pair.volume || 0,
        isRealTime: true
      };
    }
    return { 
      ...pair, 
      price: pair.price || 0,
      change: pair.change || 0,
      changePercent: pair.changePercent || 0,
      volume: pair.volume || 0,
      quoteVolume: pair.quoteVolume || pair.volume || 0,
      isRealTime: false 
    };
  });

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price) || price === null || price === undefined) {
      return '0.00';
    }
    if (price >= 1) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    return price.toFixed(6);
  };

  const formatVolume = (volume) => {
    if (typeof volume !== 'number' || isNaN(volume) || volume === null || volume === undefined) {
      return '0';
    }
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(0);
  };

  const formatMarketCap = (price, volume) => {
    if (typeof price !== 'number' || typeof volume !== 'number' || 
        isNaN(price) || isNaN(volume) || 
        price === null || price === undefined || 
        volume === null || volume === undefined) {
      return '0';
    }
    const estimatedMarketCap = price * volume;
    return formatVolume(estimatedMarketCap);
  };

  if (loading) {
    return (
      <div className={clsx('bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-slate-700 rounded w-16"></div>
                <div className="h-4 bg-slate-700 rounded w-24"></div>
                <div className="h-4 bg-slate-700 rounded w-20"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-6', className)}>
        <div className="text-center">
          <div className="text-red-400 mb-2">Failed to load market data</div>
          <div className="text-sm text-gray-400 mb-4">{error}</div>
          <button
            onClick={fetchMarketData}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-white">Market Overview</h2>
              <p className="text-sm text-gray-400">Top cryptocurrencies by volume</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Real-time status */}
            <div className="flex items-center space-x-2">
              <div className={clsx(
                'h-2 w-2 rounded-full',
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              )}></div>
              <span className="text-xs text-gray-400">
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            
            {/* Last update */}
            {lastUpdate && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{lastUpdate.toLocaleTimeString()}</span>
              </div>
            )}
            
            {/* Refresh button */}
            <button
              onClick={fetchMarketData}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 bg-slate-700/30 border-b border-slate-700">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-2">Symbol</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h Change</div>
          <div className="col-span-2 text-right">Volume</div>
          <div className="col-span-2 text-right">Market Cap</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-96 overflow-y-auto">
        {mergedData.map((pair, index) => {
          const changePercent = pair.changePercent || 0;
          const isPositive = changePercent >= 0;
          const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
          const changeBg = isPositive ? 'bg-green-400/10' : 'bg-red-400/10';
          
          return (
            <motion.div
              key={pair.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-4 border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Rank */}
                <div className="col-span-1 text-sm text-gray-400">
                  {index + 1}
                </div>
                
                {/* Symbol */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {pair.symbol.replace('USDT', '')}
                    </span>
                    <span className="text-xs text-gray-400">
                      /USDT
                    </span>
                  </div>
                </div>
                
                {/* Price */}
                <div className="col-span-2 text-right">
                  <motion.span
                    key={pair.price || 0}
                    initial={pair.isRealTime ? { scale: 1.1, color: isPositive ? '#10b981' : '#ef4444' } : {}}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.3 }}
                    className="font-medium text-white"
                  >
                    ${formatPrice(pair.price || 0)}
                  </motion.span>
                </div>
                
                {/* 24h Change */}
                <div className="col-span-2 text-right">
                  <div className={clsx('inline-flex items-center space-x-1 px-2 py-1 rounded', changeBg)}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className={clsx('text-sm font-medium', changeColor)}>
                      {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                {/* Volume */}
                <div className="col-span-2 text-right">
                  <div className="text-sm text-gray-300">
                    ${formatVolume(pair.quoteVolume || pair.volume || 0)}
                  </div>
                </div>
                
                {/* Market Cap (estimated) */}
                <div className="col-span-2 text-right">
                  <div className="text-sm text-gray-300">
                    ${formatMarketCap(pair.price || 0, pair.volume || 0)}
                  </div>
                </div>
                
                {/* Status */}
                <div className="col-span-1 text-center">
                  {pair.isRealTime ? (
                    <Activity className="h-4 w-4 text-green-400 animate-pulse mx-auto" />
                  ) : (
                    <div className="h-2 w-2 bg-gray-400 rounded-full mx-auto"></div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-700/30 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Showing {mergedData.length} trading pairs</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 text-green-400" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <span>Static</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketOverview;