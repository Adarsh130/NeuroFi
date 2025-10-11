import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { CompactThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const { user, backendConnected } = useAuth();

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">NeuroFi</span>
            {/* Connection Status Indicator */}
            <div className="hidden sm:flex items-center ml-2">
              {backendConnected ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-medium">Demo</span>
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              {user ? (
                <Link
                  to="/app/dashboard"
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/auth/login"
                    className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Theme Toggle & Mobile menu button */}
          <div className="flex items-center space-x-2">
            {/* Mobile Connection Status */}
            <div className="sm:hidden">
              {backendConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-yellow-400" />
              )}
            </div>
            
            <CompactThemeToggle />
            
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            {/* Mobile Connection Status */}
            <div className="px-3 py-2 text-sm">
              <div className="flex items-center space-x-2">
                {backendConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">Backend Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Demo Mode</span>
                  </>
                )}
              </div>
            </div>
            
            <Link
              to="/"
              className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            {user ? (
              <Link
                to="/app/dashboard"
                className="bg-primary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/90 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-primary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/90 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;