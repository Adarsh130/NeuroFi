/**
 * Utility functions for market data formatting and calculations
 */

/**
 * Format price with appropriate decimal places
 * @param {number} price - Price value
 * @param {number} minDecimals - Minimum decimal places
 * @param {number} maxDecimals - Maximum decimal places
 * @returns {string} Formatted price
 */
export const formatPrice = (price, minDecimals = 2, maxDecimals = 8) => {
  if (!price || isNaN(price)) return '0.00';
  
  const numPrice = parseFloat(price);
  
  if (numPrice >= 1) {
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: Math.min(maxDecimals, 4)
    });
  }
  
  // For prices less than 1, show more decimal places
  return numPrice.toFixed(Math.min(maxDecimals, 8));
};

/**
 * Format volume with K, M, B suffixes
 * @param {number} volume - Volume value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted volume
 */
export const formatVolume = (volume, decimals = 2) => {
  if (!volume || isNaN(volume)) return '0';
  
  const numVolume = parseFloat(volume);
  
  if (numVolume >= 1e12) {
    return `${(numVolume / 1e12).toFixed(decimals)}T`;
  }
  if (numVolume >= 1e9) {
    return `${(numVolume / 1e9).toFixed(decimals)}B`;
  }
  if (numVolume >= 1e6) {
    return `${(numVolume / 1e6).toFixed(decimals)}M`;
  }
  if (numVolume >= 1e3) {
    return `${(numVolume / 1e3).toFixed(decimals)}K`;
  }
  
  return numVolume.toFixed(decimals);
};

/**
 * Format percentage change
 * @param {number} change - Percentage change
 * @param {boolean} showSign - Whether to show + sign for positive values
 * @returns {string} Formatted percentage
 */
export const formatPercent = (change, showSign = true) => {
  if (!change || isNaN(change)) return '0.00%';
  
  const numChange = parseFloat(change);
  const sign = showSign && numChange > 0 ? '+' : '';
  
  return `${sign}${numChange.toFixed(2)}%`;
};

/**
 * Format currency with dollar sign
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = '$') => {
  if (!amount || isNaN(amount)) return `${currency}0.00`;
  
  const numAmount = parseFloat(amount);
  
  if (numAmount >= 1e12) {
    return `${currency}${(numAmount / 1e12).toFixed(2)}T`;
  }
  if (numAmount >= 1e9) {
    return `${currency}${(numAmount / 1e9).toFixed(2)}B`;
  }
  if (numAmount >= 1e6) {
    return `${currency}${(numAmount / 1e6).toFixed(2)}M`;
  }
  if (numAmount >= 1e3) {
    return `${currency}${(numAmount / 1e3).toFixed(2)}K`;
  }
  
  return `${currency}${numAmount.toFixed(2)}`;
};

/**
 * Calculate price change
 * @param {number} currentPrice - Current price
 * @param {number} previousPrice - Previous price
 * @returns {Object} Price change data
 */
export const calculatePriceChange = (currentPrice, previousPrice) => {
  if (!currentPrice || !previousPrice || isNaN(currentPrice) || isNaN(previousPrice)) {
    return {
      change: 0,
      changePercent: 0,
      isPositive: false
    };
  }
  
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;
  
  return {
    change,
    changePercent,
    isPositive: change >= 0
  };
};

/**
 * Get color class based on price change
 * @param {number} change - Price change value
 * @param {string} positiveColor - CSS class for positive change
 * @param {string} negativeColor - CSS class for negative change
 * @returns {string} CSS class
 */
export const getChangeColor = (change, positiveColor = 'text-green-400', negativeColor = 'text-red-400') => {
  if (!change || isNaN(change)) return 'text-gray-400';
  return parseFloat(change) >= 0 ? positiveColor : negativeColor;
};

/**
 * Get background color class based on price change
 * @param {number} change - Price change value
 * @param {string} positiveBg - CSS class for positive background
 * @param {string} negativeBg - CSS class for negative background
 * @returns {string} CSS class
 */
export const getChangeBgColor = (change, positiveBg = 'bg-green-400/10', negativeBg = 'bg-red-400/10') => {
  if (!change || isNaN(change)) return 'bg-gray-400/10';
  return parseFloat(change) >= 0 ? positiveBg : negativeBg;
};

/**
 * Format timestamp to readable time
 * @param {number} timestamp - Unix timestamp
 * @param {boolean} includeDate - Whether to include date
 * @returns {string} Formatted time
 */
export const formatTime = (timestamp, includeDate = false) => {
  if (!timestamp) return '--';
  
  const date = new Date(timestamp);
  
  if (includeDate) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Calculate market cap (estimated)
 * @param {number} price - Current price
 * @param {number} volume - Trading volume
 * @returns {number} Estimated market cap
 */
export const calculateMarketCap = (price, volume) => {
  if (!price || !volume || isNaN(price) || isNaN(volume)) return 0;
  return parseFloat(price) * parseFloat(volume);
};

/**
 * Calculate VWAP (Volume Weighted Average Price)
 * @param {Array} klineData - Array of kline data
 * @returns {number} VWAP value
 */
export const calculateVWAP = (klineData) => {
  if (!klineData || klineData.length === 0) return 0;
  
  let totalVolume = 0;
  let totalVolumePrice = 0;
  
  klineData.forEach(kline => {
    const typicalPrice = (kline.high + kline.low + kline.close) / 3;
    const volume = kline.volume;
    
    totalVolumePrice += typicalPrice * volume;
    totalVolume += volume;
  });
  
  return totalVolume > 0 ? totalVolumePrice / totalVolume : 0;
};

/**
 * Calculate simple moving average
 * @param {Array} data - Array of price data
 * @param {number} period - Period for moving average
 * @returns {Array} Moving average data
 */
export const calculateSMA = (data, period) => {
  if (!data || data.length < period) return [];
  
  const sma = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  
  return sma;
};

/**
 * Calculate RSI (Relative Strength Index)
 * @param {Array} prices - Array of closing prices
 * @param {number} period - RSI period (default 14)
 * @returns {Array} RSI values
 */
export const calculateRSI = (prices, period = 14) => {
  if (!prices || prices.length < period + 1) return [];
  
  const gains = [];
  const losses = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  const rsi = [];
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
  
  // Calculate RSI
  for (let i = period; i < gains.length; i++) {
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    // Update averages for next iteration
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
  }
  
  return rsi;
};

/**
 * Validate trading symbol format
 * @param {string} symbol - Trading symbol
 * @returns {boolean} Whether symbol is valid
 */
export const isValidSymbol = (symbol) => {
  if (!symbol || typeof symbol !== 'string') return false;
  
  // Basic validation for Binance symbols
  const symbolRegex = /^[A-Z]{2,10}USDT?$/;
  return symbolRegex.test(symbol.toUpperCase());
};

/**
 * Extract base and quote currencies from symbol
 * @param {string} symbol - Trading symbol (e.g., 'BTCUSDT')
 * @returns {Object} Base and quote currencies
 */
export const parseSymbol = (symbol) => {
  if (!symbol || typeof symbol !== 'string') {
    return { base: '', quote: '' };
  }
  
  const upperSymbol = symbol.toUpperCase();
  
  if (upperSymbol.endsWith('USDT')) {
    return {
      base: upperSymbol.slice(0, -4),
      quote: 'USDT'
    };
  }
  
  if (upperSymbol.endsWith('BTC')) {
    return {
      base: upperSymbol.slice(0, -3),
      quote: 'BTC'
    };
  }
  
  if (upperSymbol.endsWith('ETH')) {
    return {
      base: upperSymbol.slice(0, -3),
      quote: 'ETH'
    };
  }
  
  // Default fallback
  return {
    base: upperSymbol.slice(0, -4),
    quote: upperSymbol.slice(-4)
  };
};

/**
 * Debounce function for API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default {
  formatPrice,
  formatVolume,
  formatPercent,
  formatCurrency,
  formatTime,
  calculatePriceChange,
  calculateMarketCap,
  calculateVWAP,
  calculateSMA,
  calculateRSI,
  getChangeColor,
  getChangeBgColor,
  isValidSymbol,
  parseSymbol,
  debounce
};