import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    database: 'checking',
    api: 'checking',
    lastCheck: null
  });

  const checkSystemStatus = async () => {
    const newStatus = {
      backend: 'checking',
      database: 'checking', 
      api: 'checking',
      lastCheck: new Date()
    };

    try {
      // Check backend health
      const healthResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/../health`, {
        method: 'GET',
        timeout: 5000
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        newStatus.backend = 'online';
        
        // If backend is online, check API endpoints
        try {
          const apiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('neurofi_token') || 'test'}`
            }
          });
          
          // Even if unauthorized, it means API is responding
          if (apiResponse.status === 401 || apiResponse.status === 200) {
            newStatus.api = 'online';
          } else {
            newStatus.api = 'error';
          }
        } catch (apiError) {
          newStatus.api = 'offline';
        }

        // Database status is usually included in health check
        if (healthData.status === 'OK') {
          newStatus.database = 'online';
        } else {
          newStatus.database = 'error';
        }
      } else {
        newStatus.backend = 'error';
        newStatus.database = 'unknown';
        newStatus.api = 'offline';
      }
    } catch (error) {
      console.warn('Backend health check failed:', error.message);
      newStatus.backend = 'offline';
      newStatus.database = 'unknown';
      newStatus.api = 'offline';
    }

    setStatus(newStatus);
  };

  useEffect(() => {
    checkSystemStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'checking':
        return <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (statusValue) => {
    switch (statusValue) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
      case 'error':
        return 'text-yellow-400';
      case 'checking':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const overallStatus = status.backend === 'online' && status.api === 'online' ? 'online' : 
                      status.backend === 'offline' ? 'offline' : 'partial';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          {overallStatus === 'online' ? (
            <Wifi className="h-5 w-5 text-green-400 mr-2" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-400 mr-2" />
          )}
          System Status
        </h3>
        <button
          onClick={checkSystemStatus}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Backend Server</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.backend)}
            <span className={`text-sm ${getStatusColor(status.backend)}`}>
              {getStatusText(status.backend)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">API Endpoints</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.api)}
            <span className={`text-sm ${getStatusColor(status.api)}`}>
              {getStatusText(status.api)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Database</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.database)}
            <span className={`text-sm ${getStatusColor(status.database)}`}>
              {getStatusText(status.database)}
            </span>
          </div>
        </div>
      </div>

      {status.lastCheck && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-xs text-gray-500">
            Last checked: {status.lastCheck.toLocaleTimeString()}
          </p>
        </div>
      )}

      {overallStatus === 'offline' && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">
            Backend services are offline. The app is running in demo mode with limited functionality.
          </p>
        </div>
      )}

      {overallStatus === 'partial' && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            Some services are experiencing issues. Functionality may be limited.
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;