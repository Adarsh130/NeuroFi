/**
 * Utility functions for formatting data display
 */

/**
 * Format currency values
 * @param {number} value - The numeric value to format
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD', decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    // Fallback formatting
    return `$${Number(value).toFixed(decimals)}`;
  }
};

/**
 * Format cryptocurrency prices with appropriate decimal places
 * @param {number} price - The price to format
 * @param {string} symbol - Trading pair symbol
 * @returns {string} Formatted price string
 */
export const formatCryptoPrice = (price, symbol = '') => {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0.00';
  }

  const numPrice = Number(price);
  
  // Different decimal places based on price range
  if (numPrice >= 1000) {
    return formatCurrency(numPrice, 'USD', 0);
  } else if (numPrice >= 100) {
    return formatCurrency(numPrice, 'USD', 2);
  } else if (numPrice >= 1) {
    return formatCurrency(numPrice, 'USD', 3);
  } else if (numPrice >= 0.01) {
    return formatCurrency(numPrice, 'USD', 4);
  } else {
    return formatCurrency(numPrice, 'USD', 6);
  }
};

/**
 * Format percentage values
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @param {boolean} showSign - Whether to show + sign for positive values
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2, showSign = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }

  const numValue = Number(value);
  const sign = showSign && numValue > 0 ? '+' : '';
  
  return `${sign}${numValue.toFixed(decimals)}%`;
};

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const numValue = Math.abs(Number(value));
  const sign = Number(value) < 0 ? '-' : '';

  if (numValue >= 1e12) {
    return `${sign}${(numValue / 1e12).toFixed(decimals)}T`;
  } else if (numValue >= 1e9) {
    return `${sign}${(numValue / 1e9).toFixed(decimals)}B`;
  } else if (numValue >= 1e6) {
    return `${sign}${(numValue / 1e6).toFixed(decimals)}M`;
  } else if (numValue >= 1e3) {
    return `${sign}${(numValue / 1e3).toFixed(decimals)}K`;
  } else {
    return `${sign}${numValue.toFixed(decimals)}`;
  }
};

/**
 * Format volume with appropriate suffixes
 * @param {number} volume - The volume to format
 * @returns {string} Formatted volume string
 */
export const formatVolume = (volume) => {
  return formatLargeNumber(volume, 2);
};

/**
 * Format market cap
 * @param {number} marketCap - The market cap to format
 * @returns {string} Formatted market cap string
 */
export const formatMarketCap = (marketCap) => {
  return formatLargeNumber(marketCap, 2);
};

/**
 * Format date and time
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return '';

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    return dateObj.toLocaleString();
  }
};

/**
 * Format date only
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return formatDateTime(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time only
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  return formatDateTime(date, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

/**
 * Format trading pair symbol for display
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @returns {string} Formatted symbol (e.g., 'BTC/USDT')
 */
export const formatTradingPair = (symbol) => {
  if (!symbol) return '';

  // Common quote currencies
  const quoteCurrencies = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];
  
  for (const quote of quoteCurrencies) {
    if (symbol.endsWith(quote)) {
      const base = symbol.slice(0, -quote.length);
      return `${base}/${quote}`;
    }
  }
  
  // Fallback: just return the original symbol
  return symbol;
};

/**
 * Format confidence score
 * @param {number} confidence - Confidence value (0-100)
 * @returns {string} Formatted confidence string
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined || isNaN(confidence)) {
    return '0%';
  }

  return `${Math.round(Number(confidence))}%`;
};

/**
 * Format risk level
 * @param {string|number} risk - Risk level
 * @returns {string} Formatted risk level
 */
export const formatRiskLevel = (risk) => {
  if (typeof risk === 'number') {
    if (risk <= 30) return 'Low';
    if (risk <= 70) return 'Medium';
    return 'High';
  }
  
  return String(risk).charAt(0).toUpperCase() + String(risk).slice(1).toLowerCase();
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format US phone numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if not a standard format
  return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format address (crypto wallet address)
 * @param {string} address - Wallet address
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format sentiment score with color class
 * @param {number} sentiment - Sentiment score (0-100)
 * @returns {Object} Object with formatted value and color class
 */
export const formatSentiment = (sentiment) => {
  const score = Number(sentiment);
  
  let colorClass = 'text-gray-400';
  let label = 'Neutral';
  
  if (score >= 70) {
    colorClass = 'text-green-400';
    label = 'Positive';
  } else if (score >= 50) {
    colorClass = 'text-yellow-400';
    label = 'Neutral';
  } else {
    colorClass = 'text-red-400';
    label = 'Negative';
  }
  
  return {
    value: `${Math.round(score)}%`,
    label,
    colorClass
  };
};

export default {
  formatCurrency,
  formatCryptoPrice,
  formatPercentage,
  formatLargeNumber,
  formatVolume,
  formatMarketCap,
  formatDateTime,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatTradingPair,
  formatConfidence,
  formatRiskLevel,
  formatFileSize,
  formatPhoneNumber,
  truncateText,
  formatAddress,
  formatSentiment
};