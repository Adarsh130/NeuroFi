import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Theme toggle component for switching between light and dark modes
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size of the toggle button (sm, md, lg)
 * @param {boolean} props.showLabel - Whether to show text label
 * @param {string} props.variant - Button variant (default, minimal, pill)
 * @returns {JSX.Element} ThemeToggle component
 */
const ThemeToggle = ({ 
  className = '', 
  size = 'md', 
  showLabel = false,
  variant = 'default'
}) => {
  const { theme, toggleTheme, isLoading } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getVariantClasses = () => {
    const baseClasses = 'relative flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50';
    
    switch (variant) {
      case 'minimal':
        return `${baseClasses} rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700`;
      case 'pill':
        return `${baseClasses} rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600`;
      default:
        return `${baseClasses} rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm hover:shadow-md`;
    }
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${getVariantClasses()} ${className}`}>
        <div className="animate-pulse">
          <div className={`${iconSizeClasses[size]} bg-slate-300 dark:bg-slate-600 rounded`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={showLabel ? 'flex items-center space-x-2' : ''}>
      <motion.button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          ${getVariantClasses()}
          group
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
            className="flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className={`${iconSizeClasses[size]} text-yellow-500 group-hover:text-yellow-400 transition-colors`} />
            ) : (
              <Moon className={`${iconSizeClasses[size]} text-slate-600 group-hover:text-slate-700 transition-colors`} />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
        </div>
      </motion.button>
      
      {showLabel && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {theme === 'dark' ? 'Dark' : 'Light'} Mode
        </motion.span>
      )}
    </div>
  );
};

/**
 * Compact theme toggle for use in navigation bars
 */
export const CompactThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};

/**
 * Theme toggle with sliding animation
 */
export const SlidingThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        theme === 'dark' 
          ? 'bg-slate-700' 
          : 'bg-slate-200'
      } ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{
          x: theme === 'dark' ? 28 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? (
              <Moon className="h-3 w-3 text-slate-600" />
            ) : (
              <Sun className="h-3 w-3 text-yellow-500" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;