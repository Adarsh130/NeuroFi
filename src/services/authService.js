import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearStorage();
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      
      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Signup user (alias for register)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async signup(userData) {
    return this.register(userData);
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearStorage();
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  async getCurrentUser() {
    try {
      const response = await this.api.get('/auth/me');
      
      if (response.data.success) {
        this.setUser(response.data.user);
        return response.data.user;
      }
      
      throw new Error('Failed to get profile');
    } catch (error) {
      console.error('Get profile error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile (alias)
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    return this.getCurrentUser();
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        this.setUser(response.data.user);
        return response.data.user;
      }
      
      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('Update profile error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.put('/auth/password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Forgot password
   * @param {string} email - User email
   * @returns {Promise<Object>} Response
   */
  async forgotPassword(email) {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<Object>} Response
   */
  async resetPassword(token, password, confirmPassword) {
    try {
      const response = await this.api.put(`/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });
      
      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await this.api.put('/auth/preferences', preferences);
      
      if (response.data.success) {
        // Update local user data
        const currentUser = this.getUser();
        if (currentUser) {
          currentUser.preferences = response.data.preferences;
          this.setUser(currentUser);
        }
        return response.data.preferences;
      }
      
      throw new Error('Failed to update preferences');
    } catch (error) {
      console.error('Update preferences error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add symbol to watchlist
   * @param {string} symbol - Cryptocurrency symbol
   * @returns {Promise<Array>} Updated watchlist
   */
  async addToWatchlist(symbol) {
    try {
      const response = await this.api.post('/auth/watchlist', { symbol });
      
      if (response.data.success) {
        // Update local user data
        const currentUser = this.getUser();
        if (currentUser) {
          currentUser.preferences.watchlist = response.data.watchlist;
          this.setUser(currentUser);
        }
        return response.data.watchlist;
      }
      
      throw new Error('Failed to add to watchlist');
    } catch (error) {
      console.error('Add to watchlist error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove symbol from watchlist
   * @param {string} symbol - Cryptocurrency symbol
   * @returns {Promise<Array>} Updated watchlist
   */
  async removeFromWatchlist(symbol) {
    try {
      const response = await this.api.delete(`/auth/watchlist/${symbol}`);
      
      if (response.data.success) {
        // Update local user data
        const currentUser = this.getUser();
        if (currentUser) {
          currentUser.preferences.watchlist = response.data.watchlist;
          this.setUser(currentUser);
        }
        return response.data.watchlist;
      }
      
      throw new Error('Failed to remove from watchlist');
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Get stored authentication token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem('neurofi_token');
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem('neurofi_token', token);
  }

  /**
   * Remove authentication token
   */
  removeToken() {
    localStorage.removeItem('neurofi_token');
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getUser() {
    const userData = localStorage.getItem('neurofi_user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Set user data
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem('neurofi_user', JSON.stringify(user));
  }

  /**
   * Remove user data
   */
  removeUser() {
    localStorage.removeItem('neurofi_user');
  }

  /**
   * Clear all stored authentication data
   */
  clearStorage() {
    this.removeToken();
    this.removeUser();
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors.map(err => err.message).join(', ');
      return new Error(errorMessages);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;