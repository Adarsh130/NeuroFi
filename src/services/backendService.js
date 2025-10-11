import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const HEALTH_CHECK_URL = `${API_BASE_URL}/../health`;

class BackendService {
  constructor() {
    this.isConnected = false;
    this.lastHealthCheck = null;
    this.healthCheckInterval = null;
    
    // Create axios instance
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('neurofi_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('neurofi_token');
          localStorage.removeItem('neurofi_user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Check if backend is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(HEALTH_CHECK_URL, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        this.lastHealthCheck = new Date();
        console.log('✅ Backend health check passed:', data);
        return { success: true, data };
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      this.isConnected = false;
      this.lastHealthCheck = new Date();
      console.warn('⚠️ Backend health check failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start periodic health monitoring
   */
  startHealthMonitoring() {
    // Initial health check
    this.checkHealth();

    // Check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth();
    }, 30000);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      lastHealthCheck: this.lastHealthCheck,
      apiBaseUrl: API_BASE_URL
    };
  }

  /**
   * Test API endpoints
   */
  async testEndpoints() {
    const endpoints = [
      { name: 'Health', url: HEALTH_CHECK_URL, method: 'GET' },
      { name: 'Auth Me', url: `${API_BASE_URL}/auth/me`, method: 'GET' },
      { name: 'Market Data', url: `${API_BASE_URL}/market/overview`, method: 'GET' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        
        if (endpoint.method === 'GET') {
          const response = await this.api.get(endpoint.url.replace(API_BASE_URL, ''));
          const endTime = Date.now();
          
          results.push({
            name: endpoint.name,
            status: 'success',
            responseTime: endTime - startTime,
            statusCode: response.status
          });
        }
      } catch (error) {
        results.push({
          name: endpoint.name,
          status: 'error',
          error: error.message,
          statusCode: error.response?.status || 'N/A'
        });
      }
    }

    return results;
  }

  /**
   * Initialize backend connection
   */
  async initialize() {
    console.log('🚀 Initializing backend connection...');
    
    const healthResult = await this.checkHealth();
    
    if (healthResult.success) {
      console.log('✅ Backend connection established');
      
      // Test key endpoints
      const endpointTests = await this.testEndpoints();
      console.log('📊 Endpoint test results:', endpointTests);
      
      return {
        success: true,
        message: 'Backend connection established',
        health: healthResult.data,
        endpoints: endpointTests
      };
    } else {
      console.log('❌ Backend connection failed, running in offline mode');
      
      return {
        success: false,
        message: 'Backend unavailable - running in demo mode',
        error: healthResult.error
      };
    }
  }

  /**
   * Get backend information
   */
  async getBackendInfo() {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get backend info: ${error.message}`);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopHealthMonitoring();
  }
}

// Create singleton instance
const backendService = new BackendService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  backendService.cleanup();
});

export default backendService;