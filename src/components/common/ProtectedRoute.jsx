import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/**
 * Protected route component that requires authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.redirectTo - Path to redirect to if not authenticated
 * @param {Array<string>} props.requiredRoles - Required user roles for access
 * @returns {JSX.Element} ProtectedRoute component
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/auth/login',
  requiredRoles = []
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <Loader fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if user has required roles
  if (requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location }} 
          replace 
        />
      );
    }
  }

  // Render children if authenticated and authorized
  return children;
};

/**
 * Public route component that redirects authenticated users
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @param {string} props.redirectTo - Path to redirect to if authenticated
 * @returns {JSX.Element} PublicRoute component
 */
export const PublicRoute = ({ 
  children, 
  redirectTo = '/app/dashboard' 
}) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if not authenticated
  return children;
};

/**
 * Role-based route component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Array<string>} props.allowedRoles - Allowed user roles
 * @param {React.ReactNode} props.fallback - Fallback component if unauthorized
 * @returns {JSX.Element} RoleBasedRoute component
 */
export const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  fallback = null 
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback || <Navigate to="/auth/login" replace />;
  }

  const userRoles = user.roles || [];
  const hasAllowedRole = allowedRoles.some(role => 
    userRoles.includes(role)
  );

  if (!hasAllowedRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;