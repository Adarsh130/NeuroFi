import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const SimpleThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(false);

  // Simple theme initialization
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('neurofi-theme') || 'dark';
      setTheme(savedTheme);
      
      // Apply theme class to document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(savedTheme);
    } catch (error) {
      console.warn('Error initializing theme:', error);
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    try {
      localStorage.setItem('neurofi-theme', newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    } catch (error) {
      console.warn('Error saving theme:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: (newTheme) => {
      setTheme(newTheme);
      try {
        localStorage.setItem('neurofi-theme', newTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      } catch (error) {
        console.warn('Error setting theme:', error);
      }
    },
    isLoading,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};