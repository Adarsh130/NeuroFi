import { useState, useEffect, useCallback, useRef } from 'react';
import binanceWebSocketService from '../services/binanceWebSocketService';

/**
 * Custom hook for real-time market data from Binance WebSocket
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @param {Object} options - Configuration options
 * @returns {Object} Real-time market data and utilities
 */
export const useRealTimeMarketData = (symbol, options = {}) => {
  const {
    enableTicker = true,
    enableKline = false,
    enableTrade = false,
    enableDepth = false,
    klineInterval = '1m',
    depthLevel = '@depth10',
    autoConnect = true,
    maxDataPoints = 100
  } = options;

  const [tickerData, setTickerData] = useState(null);
  const [klineData, setKlineData] = useState([]);
  const [tradeData, setTradeData] = useState([]);
  const [depthData, setDepthData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  const subscriptionsRef = useRef({});
  const isConnectedRef = useRef(false);

  // Ticker data handler
  const handleTickerData = useCallback((data) => {
    if (data.type === 'ticker') {
      setTickerData(data);
      setError(null);
    }
  }, []);

  // Kline data handler
  const handleKlineData = useCallback((data) => {
    if (data.type === 'kline') {
      setKlineData(prev => {
        const newData = [...prev];
        
        // Find existing kline with same openTime
        const existingIndex = newData.findIndex(
          item => item.openTime === data.openTime
        );
        
        if (existingIndex >= 0) {
          // Update existing kline
          newData[existingIndex] = data;
        } else {
          // Add new kline
          newData.push(data);
          
          // Keep only maxDataPoints
          if (newData.length > maxDataPoints) {
            newData.shift();
          }
        }
        
        // Sort by openTime
        return newData.sort((a, b) => a.openTime - b.openTime);
      });
      setError(null);
    }
  }, [maxDataPoints]);

  // Trade data handler
  const handleTradeData = useCallback((data) => {
    if (data.type === 'trade') {
      setTradeData(prev => {
        const newData = [data, ...prev];
        
        // Keep only maxDataPoints
        if (newData.length > maxDataPoints) {
          return newData.slice(0, maxDataPoints);
        }
        
        return newData;
      });
      setError(null);
    }
  }, [maxDataPoints]);

  // Depth data handler
  const handleDepthData = useCallback((data) => {
    if (data.type === 'depth') {
      setDepthData(data);
      setError(null);
    }
  }, []);

  // Connect to WebSocket streams
  const connect = useCallback(() => {
    if (!symbol || isConnectedRef.current) return;

    try {
      setConnectionStatus('connecting');
      setError(null);

      // Subscribe to ticker data
      if (enableTicker) {
        const tickerSub = binanceWebSocketService.subscribeTicker(
          symbol,
          handleTickerData
        );
        subscriptionsRef.current.ticker = tickerSub;
      }

      // Subscribe to kline data
      if (enableKline) {
        const klineSub = binanceWebSocketService.subscribeKline(
          symbol,
          klineInterval,
          handleKlineData
        );
        subscriptionsRef.current.kline = klineSub;
      }

      // Subscribe to trade data
      if (enableTrade) {
        const tradeSub = binanceWebSocketService.subscribeTrade(
          symbol,
          handleTradeData
        );
        subscriptionsRef.current.trade = tradeSub;
      }

      // Subscribe to depth data
      if (enableDepth) {
        const depthSub = binanceWebSocketService.subscribeDepth(
          symbol,
          depthLevel,
          handleDepthData
        );
        subscriptionsRef.current.depth = depthSub;
      }

      isConnectedRef.current = true;
      setConnectionStatus('connected');

    } catch (err) {
      setError(err);
      setConnectionStatus('error');
    }
  }, [
    symbol,
    enableTicker,
    enableKline,
    enableTrade,
    enableDepth,
    klineInterval,
    depthLevel,
    handleTickerData,
    handleKlineData,
    handleTradeData,
    handleDepthData
  ]);

  // Disconnect from WebSocket streams
  const disconnect = useCallback(() => {
    Object.values(subscriptionsRef.current).forEach(subscriptionId => {
      binanceWebSocketService.unsubscribe(subscriptionId);
    });
    
    subscriptionsRef.current = {};
    isConnectedRef.current = false;
    setConnectionStatus('disconnected');
  }, []);

  // Reconnect to WebSocket streams
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Clear all data
  const clearData = useCallback(() => {
    setTickerData(null);
    setKlineData([]);
    setTradeData([]);
    setDepthData(null);
    setError(null);
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && symbol) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, symbol, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Data
    tickerData,
    klineData,
    tradeData,
    depthData,
    
    // Status
    connectionStatus,
    error,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    hasError: error !== null,
    
    // Actions
    connect,
    disconnect,
    reconnect,
    clearData,
    
    // Utilities
    getLastPrice: () => tickerData?.price || null,
    getPriceChange: () => tickerData?.change || 0,
    getPriceChangePercent: () => tickerData?.changePercent || 0,
    getVolume: () => tickerData?.volume || 0,
    getLatestKline: () => klineData[klineData.length - 1] || null,
    getLatestTrade: () => tradeData[0] || null,
    getBestBid: () => depthData?.bids[0]?.price || null,
    getBestAsk: () => depthData?.asks[0]?.price || null,
    getSpread: () => {
      const bid = depthData?.bids[0]?.price;
      const ask = depthData?.asks[0]?.price;
      return bid && ask ? ask - bid : null;
    }
  };
};

/**
 * Hook for multiple symbols real-time data
 * @param {Array<string>} symbols - Array of trading pair symbols
 * @param {Object} options - Configuration options
 * @returns {Object} Multiple symbols data and utilities
 */
export const useMultipleRealTimeData = (symbols = [], options = {}) => {
  const [data, setData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [errors, setErrors] = useState({});

  const subscriptionsRef = useRef({});

  const handleData = useCallback((symbol) => (tickerData) => {
    if (tickerData.type === 'ticker') {
      setData(prev => ({
        ...prev,
        [symbol]: tickerData
      }));
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[symbol];
        return newErrors;
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (symbols.length === 0) return;

    setConnectionStatus('connecting');
    
    symbols.forEach(symbol => {
      try {
        const subscription = binanceWebSocketService.subscribeTicker(
          symbol,
          handleData(symbol)
        );
        subscriptionsRef.current[symbol] = subscription;
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [symbol]: error
        }));
      }
    });

    setConnectionStatus('connected');
  }, [symbols, handleData]);

  const disconnect = useCallback(() => {
    Object.values(subscriptionsRef.current).forEach(subscriptionId => {
      binanceWebSocketService.unsubscribe(subscriptionId);
    });
    
    subscriptionsRef.current = {};
    setConnectionStatus('disconnected');
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    data,
    connectionStatus,
    errors,
    connect,
    disconnect,
    isConnected: connectionStatus === 'connected',
    hasErrors: Object.keys(errors).length > 0,
    getSymbolData: (symbol) => data[symbol] || null,
    getAllPrices: () => Object.entries(data).reduce((acc, [symbol, symbolData]) => {
      acc[symbol] = symbolData.price;
      return acc;
    }, {})
  };
};

export default useRealTimeMarketData;