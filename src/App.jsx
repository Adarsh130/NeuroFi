import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/routes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { NotificationProvider } from './components/common/NotificationSystem';
import './App.css';

/**
 * Main App component with providers and routing
 * @returns {JSX.Element} App component
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient transition-all duration-300">
              <RouterProvider router={router} />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;