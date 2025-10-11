import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import backendService from '../services/backendService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    initializeAuth();
    checkBackendConnection();
    
    // Check backend connection every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendConnection = async () => {
    try {
      const status = await backendService.checkHealth();
      setBackendConnected(status.success);
    } catch (error) {
      setBackendConnected(false);
    }
  };

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is already logged in
      const token = authService.getToken();
      const savedUser = authService.getUser();
      
      if (token && savedUser) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          console.log('✅ User session restored');
        } catch (error) {
          console.warn('⚠️ Session expired, clearing stored data');
          authService.clearStorage();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authService.clearStorage();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      setUser(response.user);
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      console.error('Login failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.signup(userData);
      setUser(response.user);
      console.log('✅ Signup successful');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      setError(errorMessage);
      console.error('Signup failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if backend call fails
      authService.clearStorage();
      setUser(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      console.log('✅ Profile updated');
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      setError(errorMessage);
      console.error('Profile update failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.changePassword(currentPassword, newPassword);
      console.log('✅ Password changed');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      setError(errorMessage);
      console.error('Password change failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (user) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        console.log('✅ User data refreshed');
        return currentUser;
      }
      return user;
    } catch (error) {
      console.error('User refresh failed:', error);
      return user;
    }
  };

  const isAuthenticated = () => {
    return !!user && !!authService.getToken();
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || user?.role === 'admin';
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isLoading,
    error,
    clearError,
    isAuthenticated,
    hasRole,
    hasPermission,
    backendConnected,
    checkBackendConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};