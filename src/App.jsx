import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/routes';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/common/NotificationSystem';
import './App.css';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-accent animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">NeuroFi</h2>
      <p className="text-lg text-gray-300 mb-2">Loading your AI trading platform...</p>
      <p className="text-sm text-gray-400">Initializing neural networks and market data</p>
      <div className="mt-4 flex justify-center space-x-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

/**
 * Main App component with providers and routing
 * Enhanced with proper error handling and loading states
 * @returns {JSX.Element} App component
 */
function App() {
  console.log('🚀 NeuroFi App starting...');
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient transition-all duration-300">
                <RouterProvider router={router} />
              </div>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;