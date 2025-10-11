import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simple initialization without API calls
    try {
      const savedUser = localStorage.getItem('neurofi_user');
      const token = localStorage.getItem('neurofi_token');
      
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.warn('Error loading saved user:', error);
      localStorage.removeItem('neurofi_user');
      localStorage.removeItem('neurofi_token');
    }
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock login for now - replace with actual API call later
      const mockUser = {
        id: 1,
        email,
        name: 'Demo User',
        preferences: {
          watchlist: ['BTC', 'ETH']
        }
      };
      
      setUser(mockUser);
      localStorage.setItem('neurofi_user', JSON.stringify(mockUser));
      localStorage.setItem('neurofi_token', 'mock-token');
      
      return mockUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setError(null);
      localStorage.removeItem('neurofi_user');
      localStorage.removeItem('neurofi_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    error,
    clearError: () => setError(null),
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};