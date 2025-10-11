// API Configuration
export const API_CONFIG = {
  BINANCE_BASE_URL: 'https://api.binance.com/api/v3',
  AI_BASE_URL: process.env.REACT_APP_AI_API_URL || 'http://localhost:5000/api',
  SENTIMENT_BASE_URL: process.env.REACT_APP_SENTIMENT_API_URL || 'http://localhost:5001/api',
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Trading Pairs
export const TRADING_PAIRS = {
  MAJOR: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT'],
  POPULAR: [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT',
    'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT'
  ],
  STABLECOINS: ['USDCUSDT', 'BUSDUSDT', 'DAIUSDT', 'TUSDUSDT'],
  DEFI: ['UNIUSDT', 'LINKUSDT', 'AAVEUSDT', 'COMPUSDT', 'SUSHIUSDT']
};

// Chart Intervals
export const CHART_INTERVALS = {
  '1m': '1 Minute',
  '3m': '3 Minutes',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '30m': '30 Minutes',
  '1h': '1 Hour',
  '2h': '2 Hours',
  '4h': '4 Hours',
  '6h': '6 Hours',
  '8h': '8 Hours',
  '12h': '12 Hours',
  '1d': '1 Day',
  '3d': '3 Days',
  '1w': '1 Week',
  '1M': '1 Month'
};

// Time Ranges
export const TIME_RANGES = {
  '1h': 'Last Hour',
  '4h': 'Last 4 Hours',
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 3 Months',
  '1y': 'Last Year'
};

// Risk Levels
export const RISK_LEVELS = {
  LOW: {
    value: 'low',
    label: 'Conservative',
    color: 'green',
    description: 'Low risk, stable returns'
  },
  MEDIUM: {
    value: 'medium',
    label: 'Moderate',
    color: 'yellow',
    description: 'Balanced risk and reward'
  },
  HIGH: {
    value: 'high',
    label: 'Aggressive',
    color: 'red',
    description: 'High risk, high potential returns'
  }
};

// AI Recommendation Actions
export const AI_ACTIONS = {
  BUY: {
    value: 'BUY',
    label: 'Buy',
    color: 'green',
    icon: 'TrendingUp'
  },
  SELL: {
    value: 'SELL',
    label: 'Sell',
    color: 'red',
    icon: 'TrendingDown'
  },
  HOLD: {
    value: 'HOLD',
    label: 'Hold',
    color: 'yellow',
    icon: 'Minus'
  }
};

// Sentiment Classifications
export const SENTIMENT_LEVELS = {
  VERY_POSITIVE: { min: 80, max: 100, label: 'Very Positive', color: 'green' },
  POSITIVE: { min: 60, max: 79, label: 'Positive', color: 'green' },
  NEUTRAL: { min: 40, max: 59, label: 'Neutral', color: 'gray' },
  NEGATIVE: { min: 20, max: 39, label: 'Negative', color: 'red' },
  VERY_NEGATIVE: { min: 0, max: 19, label: 'Very Negative', color: 'red' }
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'neurofi-user',
  TOKEN: 'neurofi-token',
  THEME: 'neurofi-theme',
  SETTINGS: 'neurofi-settings',
  WATCHLIST: 'neurofi-watchlist',
  PORTFOLIO: 'neurofi-portfolio'
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#5C6BF3',
  ACCENT: '#00D4FF',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  GRAY: '#6B7280',
  BACKGROUND: '#1F2937',
  GRID: '#374151'
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Feature Flags
export const FEATURES = {
  AI_RECOMMENDATIONS: true,
  SENTIMENT_ANALYSIS: true,
  RISK_MANAGEMENT: true,
  SOCIAL_TRADING: false,
  ADVANCED_CHARTS: true,
  MOBILE_APP: false,
  API_TRADING: false
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'API error. Please try again later.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!'
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PHONE: /^\+?[\d\s\-\(\)]+$/
};

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: 'dark',
  language: 'en',
  currency: 'USD',
  timezone: 'UTC',
  notifications: {
    email: true,
    push: true,
    trading: true,
    news: false
  },
  trading: {
    defaultOrderType: 'market',
    riskLevel: 'medium',
    autoStopLoss: true,
    stopLossPercentage: 5
  },
  ai: {
    recommendations: true,
    confidenceThreshold: 70,
    autoExecute: false
  }
};

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  REDDIT: 'reddit',
  TELEGRAM: 'telegram',
  DISCORD: 'discord',
  YOUTUBE: 'youtube'
};

// News Sources
export const NEWS_SOURCES = {
  COINDESK: 'coindesk',
  COINTELEGRAPH: 'cointelegraph',
  DECRYPT: 'decrypt',
  COINBASE: 'coinbase',
  BINANCE: 'binance'
};

export default {
  API_CONFIG,
  TRADING_PAIRS,
  CHART_INTERVALS,
  TIME_RANGES,
  RISK_LEVELS,
  AI_ACTIONS,
  SENTIMENT_LEVELS,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  CHART_COLORS,
  ANIMATION_DURATION,
  BREAKPOINTS,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  DEFAULT_SETTINGS,
  SOCIAL_PLATFORMS,
  NEWS_SOURCES
};