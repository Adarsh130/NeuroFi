import axios from 'axios';

// Dynamic API base URL detection
const detectApiBaseUrl = () => {
  // Try different ports in order
  const possiblePorts = [5000, 5001, 5002, 5003, 5004];
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (baseUrl) {
    return baseUrl;
  }
  
  // Default to port 5000, backend will handle port conflicts
  return 'http://localhost:5000/api';
};

const API_BASE_URL = detectApiBaseUrl();

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neurofi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🔗 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('neurofi_token');
      localStorage.removeItem('neurofi_user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('🔥 Server error detected');
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏰ Request timeout - server might be starting up');
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check if backend is running');
    }
    
    return Promise.reject(error);
  }
);

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 5000
    });
    
    console.log('✅ Backend health check passed:', response.data);
    return {
      success: true,
      data: response.data,
      mode: response.data.mode || 'PRODUCTION'
    };
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return {
      success: false,
      error: error.message,
      mode: 'OFFLINE'
    };
  }
};

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    profile: '/auth/profile',
    password: '/auth/password',
    preferences: '/auth/preferences',
    watchlist: '/auth/watchlist',
  },
  
  // Market data
  market: {
    overview: '/market/overview',
    crypto: (symbol) => `/market/crypto/${symbol}`,
    chart: (symbol) => `/market/crypto/${symbol}/chart`,
    top: '/market/top',
    trending: '/market/trending',
    search: '/market/search',
    orderbook: (symbol) => `/market/crypto/${symbol}/orderbook`,
  },
  
  // Wallet
  wallet: {
    overview: '/wallet',
    buy: '/wallet/buy',
    sell: '/wallet/sell',
    transactions: '/wallet/transactions',
    stats: '/wallet/stats',
    addFunds: '/wallet/add-funds',
    withdraw: '/wallet/withdraw',
  },
  
  // ML Predictions
  ml: {
    predictions: '/ml/predictions',
    prediction: (symbol) => `/ml/predictions/${symbol}`,
    recommendations: '/ml/recommendations',
    generate: (symbol) => `/ml/predictions/${symbol}/generate`,
    history: (symbol) => `/ml/predictions/${symbol}/history`,
  },
  
  // Health
  health: '/health',
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.errors) {
    return error.response.data.errors.map(err => err.message).join(', ');
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const isNetworkError = (error) => {
  return error.code === 'ERR_NETWORK' || 
         error.code === 'ECONNABORTED' || 
         error.message.includes('timeout') ||
         error.message.includes('Network Error');
};

export default apiClient;