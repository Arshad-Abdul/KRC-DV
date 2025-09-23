import React, { createContext, useContext, useState, useCallback } from 'react';

const DashboardCacheContext = createContext();

export const useDashboardCache = () => {
  const context = useContext(DashboardCacheContext);
  if (!context) {
    throw new Error('useDashboardCache must be used within a DashboardCacheProvider');
  }
  return context;
};

export const DashboardCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    openAlex: {
      data: null,
      timestamp: null,
      loading: false,
      error: null
    },
    scopus: {
      data: null,
      timestamp: null,
      loading: false,
      error: null,
      searchParams: null // Store last search parameters
    }
  });

  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheValid = (timestamp) => {
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const setCacheData = useCallback((dashboardType, data, searchParams = null) => {
    setCache(prev => ({
      ...prev,
      [dashboardType]: {
        ...prev[dashboardType],
        data,
        timestamp: Date.now(),
        loading: false,
        error: null,
        searchParams
      }
    }));
  }, []);

  const setCacheLoading = useCallback((dashboardType, loading) => {
    setCache(prev => ({
      ...prev,
      [dashboardType]: {
        ...prev[dashboardType],
        loading
      }
    }));
  }, []);

  const setCacheError = useCallback((dashboardType, error) => {
    setCache(prev => ({
      ...prev,
      [dashboardType]: {
        ...prev[dashboardType],
        error,
        loading: false
      }
    }));
  }, []);

  const getCachedData = useCallback((dashboardType, searchParams = null) => {
    const cached = cache[dashboardType];
    
    // Return early if no cached data exists
    if (!cached || !cached.data) {
      return { data: null, isValid: false, loading: false, error: null };
    }
    
    // For Scopus, also check if search parameters match
    if (dashboardType === 'scopus' && searchParams) {
      const paramsMatch = cached.searchParams && 
        JSON.stringify(cached.searchParams) === JSON.stringify(searchParams);
      if (!paramsMatch) {
        return { data: null, isValid: false, loading: false, error: null };
      }
    }

    return {
      data: cached.data,
      isValid: isCacheValid(cached.timestamp),
      loading: cached.loading || false,
      error: cached.error || null
    };
  }, [cache]);

  const clearCache = useCallback((dashboardType = null) => {
    if (dashboardType) {
      setCache(prev => ({
        ...prev,
        [dashboardType]: {
          data: null,
          timestamp: null,
          loading: false,
          error: null,
          searchParams: null
        }
      }));
    } else {
      // Clear all cache
      setCache({
        openAlex: { data: null, timestamp: null, loading: false, error: null },
        scopus: { data: null, timestamp: null, loading: false, error: null, searchParams: null }
      });
    }
  }, []);

  return (
    <DashboardCacheContext.Provider value={{
      getCachedData,
      setCacheData,
      setCacheLoading,
      setCacheError,
      clearCache,
      isCacheValid: (dashboardType) => {
        const cached = cache[dashboardType];
        return isCacheValid(cached?.timestamp);
      }
    }}>
      {children}
    </DashboardCacheContext.Provider>
  );
};