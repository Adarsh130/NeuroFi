import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  RefreshCw,
  Settings,
  Maximize2,
  Clock,
  DollarSign,
  Volume2
} from 'lucide-react';
import clsx from 'clsx';

// Import components
import { CandlestickChart } from '../components/charts';
import { PriceTicker, MarketOverview } from '../components/market';

// Import hooks and services
import { useRealTimeMarketData } from '../hooks/useRealTimeMarketData';
import binanceService from '../services/binanceService';

const MarketAnalysis = () => {
  // State for selected symbol and chart settings
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [chartInterval, setChartInterval] = useState('1h');
  const [chartHeight, setChartHeight] = useState(500);
  const [showVolume, setShowVolume] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [error, setError] = useState(null);

  // Popular trading pairs
  const popularSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT',
    'SOLUSDT', 'XRPUSDT', 'DOTUSDT', 'LINKUSDT'
  ];

  // Chart intervals
  const intervals = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' },
    { value: '1w', label: '1w' }
  ];

  // Real-time data for selected symbol
  const {
    tickerData,
    klineData,
    connectionStatus,
    isConnected,
    error: wsError,
    connect,
    disconnect,
    clearData
  } = useRealTimeMarketData(selectedSymbol, {
    enableTicker: true,
    enableKline: true,
    klineInterval: chartInterval,
    maxDataPoints: 200
  });

  // Fetch historical data
  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoadingHistorical(true);
      setError(null);
      
      const data = await binanceService.getKlines(selectedSymbol, chartInterval, 200);
      setHistoricalData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistorical(false);
    }
  }, [selectedSymbol, chartInterval]);

  // Initial data fetch
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  // Combine historical and real-time data
  const chartData = React.useMemo(() => {
    if (klineData.length > 0) {
      // Use real-time data if available
      return klineData;
    }
    return historicalData;
  }, [klineData, historicalData]);

  // Handle symbol change
  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
    clearData();
  };

  // Handle interval change
  const handleIntervalChange = (interval) => {
    setChartInterval(interval);
    clearData();
  };

  // Crosshair move handler for chart
  const handleCrosshairMove = useCallback((param) => {
    // Handle crosshair move events if needed
    // console.log('Crosshair move:', param);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Market Analysis</h1>
          <p className="text-gray-400 mt-1">Real-time cryptocurrency market data and insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className={clsx(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            )}></div>
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchHistoricalData}
            disabled={loadingHistorical}
            className="p-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={clsx('h-5 w-5 text-gray-400', loadingHistorical && 'animate-spin')} />
          </button>
        </div>
      </motion.div>

      {/* Error Display */}
      {(error || wsError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <div className="text-red-400 text-sm">
            {error || wsError?.message || 'Connection error'}
          </div>
        </motion.div>
      )}

      {/* Symbol Selection and Price Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Symbol Selection */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select Trading Pair</h3>
            <div className="grid grid-cols-4 gap-3">
              {popularSymbols.map(symbol => (
                <button
                  key={symbol}
                  onClick={() => handleSymbolChange(symbol)}
                  className={clsx(
                    'px-4 py-3 rounded-lg border transition-all text-sm font-medium',
                    selectedSymbol === symbol
                      ? 'bg-primary border-primary text-white'
                      : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50'
                  )}
                >
                  {symbol.replace('USDT', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Price Ticker */}
        <div>
          <PriceTicker
            symbol={selectedSymbol}
            data={tickerData}
            size="lg"
            showVolume={true}
            className="h-full"
          />
        </div>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
      >
        {/* Chart Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedSymbol} Price Chart
                </h3>
                <p className="text-sm text-gray-400">
                  Real-time candlestick chart with volume
                </p>
              </div>
            </div>
            
            {/* Chart Controls */}
            <div className="flex items-center space-x-4">
              {/* Interval Selection */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Interval:</span>
                <div className="flex space-x-1">
                  {intervals.map(interval => (
                    <button
                      key={interval.value}
                      onClick={() => handleIntervalChange(interval.value)}
                      className={clsx(
                        'px-3 py-1 rounded text-xs font-medium transition-colors',
                        chartInterval === interval.value
                          ? 'bg-primary text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      )}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart Settings */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowVolume(!showVolume)}
                  className={clsx(
                    'p-2 rounded transition-colors',
                    showVolume
                      ? 'bg-primary text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  )}
                  title="Toggle volume"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setChartHeight(chartHeight === 500 ? 700 : 500)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-gray-400 rounded transition-colors"
                  title="Toggle chart height"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {loadingHistorical && chartData.length === 0 ? (
            <div className="flex items-center justify-center h-96 bg-slate-700/20 rounded-lg">
              <div className="flex items-center space-x-3 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span>Loading chart data...</span>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <CandlestickChart
              data={chartData}
              width={800}
              height={chartHeight}
              showVolume={showVolume}
              onCrosshairMove={handleCrosshairMove}
              autoScale={true}
            />
          ) : (
            <div className="flex items-center justify-center h-96 bg-slate-700/20 rounded-lg">
              <div className="text-center text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No chart data available</p>
                <p className="text-sm mt-1">Try refreshing or selecting a different symbol</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Market Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MarketOverview />
      </motion.div>

      {/* Market Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* 24h Volume */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">24h Volume</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {tickerData?.volume ? `${(tickerData.volume / 1e6).toFixed(2)}M` : '--'}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Quote Volume: {tickerData?.quoteVolume ? `$${(tickerData.quoteVolume / 1e6).toFixed(2)}M` : '--'}
          </div>
        </div>

        {/* 24h High/Low */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">24h Range</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">High:</span>
              <span className="text-green-400 font-medium">
                ${tickerData?.high ? tickerData.high.toFixed(2) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Low:</span>
              <span className="text-red-400 font-medium">
                ${tickerData?.low ? tickerData.low.toFixed(2) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-white">Market Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 font-medium">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Data:</span>
              <span className={clsx(
                'font-medium',
                isConnected ? 'text-green-400' : 'text-yellow-400'
              )}>
                {isConnected ? 'Real-time' : 'Delayed'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MarketAnalysis;