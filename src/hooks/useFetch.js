import { useState, useEffect, useCallback, useRef } from 'react';
import { retryWithBackoff } from '../utils/helpers';

/**
 * Custom hook for data fetching with loading states, error handling, and caching
 * @param {string|Function} url - URL to fetch or function that returns URL
 * @param {Object} options - Fetch options
 * @returns {Object} Fetch state and utilities
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  
  const {
    method = 'GET',
    headers = {},
    body = null,
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retry = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
    dependencies = [],
    immediate = true,
    ...fetchOptions
  } = options;

  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = {}) => {
    // Handle function URLs
    const resolvedUrl = typeof fetchUrl === 'function' ? fetchUrl() : fetchUrl;
    
    if (!resolvedUrl) {
      setError(new Error('URL is required'));
      return;
    }

    // Check cache first
    const cacheKey = `${resolvedUrl}-${JSON.stringify(fetchOptions)}`;
    if (cache && cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      const isExpired = Date.now() - cachedData.timestamp > cacheTime;
      
      if (!isExpired) {
        setData(cachedData.data);
        setError(null);
        setLastFetch(cachedData.timestamp);
        return cachedData.data;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
      signal: abortControllerRef.current.signal,
      ...fetchOptions,
      ...fetchOptions
    };

    const performFetch = async () => {
      const response = await fetch(resolvedUrl, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      return responseData;
    };

    try {
      let result;
      
      if (retry) {
        result = await retryWithBackoff(performFetch, retryAttempts, retryDelay);
      } else {
        result = await performFetch();
      }
      
      const timestamp = Date.now();
      
      // Cache the result
      if (cache) {
        cacheRef.current.set(cacheKey, {
          data: result,
          timestamp
        });
      }
      
      setData(result);
      setLastFetch(timestamp);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
      
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }
      
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    url,
    method,
    JSON.stringify(headers),
    JSON.stringify(body),
    cache,
    cacheTime,
    retry,
    retryAttempts,
    retryDelay,
    onSuccess,
    onError,
    ...dependencies
  ]);

  // Refetch function
  const refetch = useCallback((newUrl, newOptions) => {
    return fetchData(newUrl, newOptions);
  }, [fetchData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Effect to fetch data on mount and dependency changes
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, immediate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch,
    clearCache,
    cancel,
    // Utility functions
    isStale: lastFetch ? Date.now() - lastFetch > cacheTime : true,
    isEmpty: !loading && !error && !data,
    hasData: !loading && !error && data !== null,
    hasError: !loading && error !== null
  };
};

/**
 * Hook for GET requests
 */
export const useGet = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'GET' });
};

/**
 * Hook for POST requests
 */
export const usePost = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'POST', immediate: false });
};

/**
 * Hook for PUT requests
 */
export const usePut = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'PUT', immediate: false });
};

/**
 * Hook for DELETE requests
 */
export const useDelete = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'DELETE', immediate: false });
};

/**
 * Hook for multiple parallel requests
 */
export const useMultipleFetch = (requests = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
  const fetchAll = useCallback(async () => {
    if (requests.length === 0) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      const promises = requests.map(async (request, index) => {
        try {
          const response = await fetch(request.url, request.options || {});
          if (!response.ok) {
            throw new Error(`Request ${index} failed: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          setErrors(prev => [...prev, { index, error }]);
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      setData(results);
    } catch (error) {
      setErrors(prev => [...prev, { index: -1, error }]);
    } finally {
      setLoading(false);
    }
  }, [requests]);
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  
  return {
    data,
    loading,
    errors,
    refetch: fetchAll,
    hasErrors: errors.length > 0,
    successCount: data.filter(item => item !== null).length
  };
};

export default useFetch;