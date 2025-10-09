/**
 * Environment configuration for NeuroFi application
 * Centralizes all environment variables and provides defaults
 */

// Helper function to get environment variable with fallback
const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Helper function to get boolean environment variable
const getBooleanEnvVar = (key, defaultValue = false) => {
  const value = getEnvVar(key, defaultValue.toString());
  return value === 'true' || value === true;
};

// Helper function to get number environment variable
const getNumberEnvVar = (key, defaultValue = 0) => {
  const value = getEnvVar(key, defaultValue.toString());
  return parseInt(value, 10) || defaultValue;
};

/**
 * Application configuration
 */
export const APP_CONFIG = {
  name: getEnvVar('VITE_APP_NAME', 'NeuroFi'),
  version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  description: getEnvVar('VITE_APP_DESCRIPTION', 'AI-Powered Crypto Trading Platform'),
  environment: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
  debugMode: getBooleanEnvVar('VITE_DEBUG_MODE', false)
};

/**
 * API configuration
 */
export const API_CONFIG = {
  ai: {
    baseUrl: getEnvVar('VITE_AI_API_URL', 'http://localhost:5000/api'),
    timeout: getNumberEnvVar('VITE_AI_API_TIMEOUT', 30000)
  },
  sentiment: {
    baseUrl: getEnvVar('VITE_SENTIMENT_API_URL', 'http://localhost:5001/api'),
    timeout: getNumberEnvVar('VITE_SENTIMENT_API_TIMEOUT', 15000)
  },
  binance: {
    baseUrl: getEnvVar('VITE_BINANCE_API_URL', 'https://api.binance.com/api/v3'),
    apiKey: getEnvVar('VITE_BINANCE_API_KEY'),
    secretKey: getEnvVar('VITE_BINANCE_SECRET_KEY'),
    timeout: getNumberEnvVar('VITE_BINANCE_API_TIMEOUT', 10000)
  },
  twitter: {
    bearerToken: getEnvVar('VITE_TWITTER_BEARER_TOKEN'),
    apiKey: getEnvVar('VITE_TWITTER_API_KEY'),
    apiSecret: getEnvVar('VITE_TWITTER_API_SECRET')
  },
  rateLimit: getNumberEnvVar('VITE_API_RATE_LIMIT', 100),
  retryAttempts: getNumberEnvVar('VITE_API_RETRY_ATTEMPTS', 3),
  retryDelay: getNumberEnvVar('VITE_API_RETRY_DELAY', 1000),
  cacheDuration: getNumberEnvVar('VITE_CACHE_DURATION', 300000), // 5 minutes
  mockApi: getBooleanEnvVar('VITE_MOCK_API', true)
};

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  jwtSecret: getEnvVar('VITE_JWT_SECRET', 'neurofi-secret-key'),
  cookieName: getEnvVar('VITE_AUTH_COOKIE_NAME', 'neurofi_auth'),
  sessionTimeout: getNumberEnvVar('VITE_SESSION_TIMEOUT', 3600000), // 1 hour
  refreshTokenThreshold: getNumberEnvVar('VITE_REFRESH_TOKEN_THRESHOLD', 300000), // 5 minutes
  maxLoginAttempts: getNumberEnvVar('VITE_MAX_LOGIN_ATTEMPTS', 5),
  lockoutDuration: getNumberEnvVar('VITE_LOCKOUT_DURATION', 900000) // 15 minutes
};

/**
 * Feature flags configuration
 */
export const FEATURES = {
  aiRecommendations: getBooleanEnvVar('VITE_ENABLE_AI_RECOMMENDATIONS', true),
  sentimentAnalysis: getBooleanEnvVar('VITE_ENABLE_SENTIMENT_ANALYSIS', true),
  riskManagement: getBooleanEnvVar('VITE_ENABLE_RISK_MANAGEMENT', true),
  socialTrading: getBooleanEnvVar('VITE_ENABLE_SOCIAL_TRADING', false),
  advancedCharts: getBooleanEnvVar('VITE_ENABLE_ADVANCED_CHARTS', true),
  mobileApp: getBooleanEnvVar('VITE_ENABLE_MOBILE_APP', false),
  apiTrading: getBooleanEnvVar('VITE_ENABLE_API_TRADING', false),
  darkMode: getBooleanEnvVar('VITE_ENABLE_DARK_MODE', true),
  notifications: getBooleanEnvVar('VITE_ENABLE_NOTIFICATIONS', true),
  analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', true)
};

/**
 * Analytics and monitoring configuration
 */
export const ANALYTICS_CONFIG = {
  googleAnalytics: {
    id: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    enabled: Boolean(getEnvVar('VITE_GOOGLE_ANALYTICS_ID'))
  },
  sentry: {
    dsn: getEnvVar('VITE_SENTRY_DSN'),
    enabled: Boolean(getEnvVar('VITE_SENTRY_DSN')),
    environment: APP_CONFIG.environment,
    tracesSampleRate: getNumberEnvVar('VITE_SENTRY_TRACES_SAMPLE_RATE', 0.1)
  },
  hotjar: {
    id: getEnvVar('VITE_HOTJAR_ID'),
    enabled: Boolean(getEnvVar('VITE_HOTJAR_ID'))
  },
  logLevel: getEnvVar('VITE_LOG_LEVEL', 'info')
};

/**
 * CDN and assets configuration
 */
export const ASSETS_CONFIG = {
  cdnUrl: getEnvVar('VITE_CDN_URL', ''),
  imageOptimization: getBooleanEnvVar('VITE_IMAGE_OPTIMIZATION', true),
  lazyLoading: getBooleanEnvVar('VITE_LAZY_LOADING', true)
};

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  twitter: getEnvVar('VITE_TWITTER_URL', 'https://twitter.com/NeuroFiApp'),
  discord: getEnvVar('VITE_DISCORD_URL', 'https://discord.gg/neurofi'),
  telegram: getEnvVar('VITE_TELEGRAM_URL', 'https://t.me/neurofi'),
  github: getEnvVar('VITE_GITHUB_URL', 'https://github.com/neurofi/neurofi'),
  linkedin: getEnvVar('VITE_LINKEDIN_URL', 'https://linkedin.com/company/neurofi'),
  youtube: getEnvVar('VITE_YOUTUBE_URL', 'https://youtube.com/@neurofi')
};

/**
 * Support and documentation links
 */
export const SUPPORT_CONFIG = {
  email: getEnvVar('VITE_SUPPORT_EMAIL', 'support@neurofi.com'),
  docsUrl: getEnvVar('VITE_DOCS_URL', 'https://docs.neurofi.com'),
  statusPageUrl: getEnvVar('VITE_STATUS_PAGE_URL', 'https://status.neurofi.com'),
  helpCenterUrl: getEnvVar('VITE_HELP_CENTER_URL', 'https://help.neurofi.com'),
  communityUrl: getEnvVar('VITE_COMMUNITY_URL', 'https://community.neurofi.com')
};

/**
 * Trading configuration
 */
export const TRADING_CONFIG = {
  defaultCurrency: getEnvVar('VITE_DEFAULT_CURRENCY', 'USD'),
  defaultTimeframe: getEnvVar('VITE_DEFAULT_TIMEFRAME', '1h'),
  maxWatchlistItems: getNumberEnvVar('VITE_MAX_WATCHLIST_ITEMS', 50),
  maxPortfolioItems: getNumberEnvVar('VITE_MAX_PORTFOLIO_ITEMS', 100),
  priceUpdateInterval: getNumberEnvVar('VITE_PRICE_UPDATE_INTERVAL', 5000), // 5 seconds
  chartUpdateInterval: getNumberEnvVar('VITE_CHART_UPDATE_INTERVAL', 30000), // 30 seconds
  sentimentUpdateInterval: getNumberEnvVar('VITE_SENTIMENT_UPDATE_INTERVAL', 60000) // 1 minute
};

/**
 * UI configuration
 */
export const UI_CONFIG = {
  theme: {
    defaultTheme: getEnvVar('VITE_DEFAULT_THEME', 'dark'),
    allowThemeSwitch: getBooleanEnvVar('VITE_ALLOW_THEME_SWITCH', true)
  },
  animations: {
    enabled: getBooleanEnvVar('VITE_ANIMATIONS_ENABLED', true),
    duration: getNumberEnvVar('VITE_ANIMATION_DURATION', 300),
    reducedMotion: getBooleanEnvVar('VITE_REDUCED_MOTION', false)
  },
  notifications: {
    position: getEnvVar('VITE_NOTIFICATION_POSITION', 'top-right'),
    duration: getNumberEnvVar('VITE_NOTIFICATION_DURATION', 5000),
    maxNotifications: getNumberEnvVar('VITE_MAX_NOTIFICATIONS', 5)
  }
};

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  contentSecurityPolicy: getBooleanEnvVar('VITE_CSP_ENABLED', true),
  httpsOnly: getBooleanEnvVar('VITE_HTTPS_ONLY', APP_CONFIG.isProduction),
  apiKeyEncryption: getBooleanEnvVar('VITE_API_KEY_ENCRYPTION', true),
  sessionEncryption: getBooleanEnvVar('VITE_SESSION_ENCRYPTION', true)
};

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
  enableServiceWorker: getBooleanEnvVar('VITE_ENABLE_SERVICE_WORKER', APP_CONFIG.isProduction),
  enableCodeSplitting: getBooleanEnvVar('VITE_ENABLE_CODE_SPLITTING', true),
  enableCompression: getBooleanEnvVar('VITE_ENABLE_COMPRESSION', APP_CONFIG.isProduction),
  bundleAnalyzer: getBooleanEnvVar('VITE_BUNDLE_ANALYZER', false)
};

// Validate required environment variables
const validateEnvironment = () => {
  const requiredVars = [];
  
  if (APP_CONFIG.isProduction) {
    // Add required production environment variables
    if (!API_CONFIG.binance.apiKey) requiredVars.push('VITE_BINANCE_API_KEY');
    if (!API_CONFIG.twitter.bearerToken) requiredVars.push('VITE_TWITTER_BEARER_TOKEN');
  }
  
  if (requiredVars.length > 0) {
    console.error('Missing required environment variables:', requiredVars);
    if (APP_CONFIG.isProduction) {
      throw new Error(`Missing required environment variables: ${requiredVars.join(', ')}`);
    }
  }
};

// Validate environment on module load
validateEnvironment();

// Export all configurations
export default {
  APP_CONFIG,
  API_CONFIG,
  AUTH_CONFIG,
  FEATURES,
  ANALYTICS_CONFIG,
  ASSETS_CONFIG,
  SOCIAL_LINKS,
  SUPPORT_CONFIG,
  TRADING_CONFIG,
  UI_CONFIG,
  SECURITY_CONFIG,
  PERFORMANCE_CONFIG
};