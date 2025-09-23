import { useState, useEffect } from 'react';
import { useDashboardCache } from '../contexts/DashboardCacheContext';
import apiService from '../services/api.js';

export const useOpenAlexData = () => {
  const { getCachedData, setCacheData } = useDashboardCache();
  
  const [dashboardData, setDashboardData] = useState({
    totalPublications: 0,
    totalCitations: 0,
    hIndex: 0,
    openAccessCount: 0,
    latestPublications: [],
    topContributors: [],
    yearlyPublications: [],
    yearlyCitations: [],
    subjectDistribution: [],
    topCitedPublications: [],
    collaboratorCountries: [],
    publicationTypes: [],
    topPublishers: [],
    fundingAgencies: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const fetchData = async () => {
      try {
        // Check cache first
        const cached = getCachedData('openAlex');
        
        if (cached.isValid && cached.data && isMounted) {
          // Use cached data
          setDashboardData(cached.data);
          setLoading(false);
          setError(null);
          console.log('📋 Using cached OpenAlex data');
          return;
        }

        if (!isMounted) return; // Exit early if component unmounted

        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching fresh OpenAlex data...');
        const data = await apiService.getAllDashboardData();
        
        if (isMounted) {
          setDashboardData(data);
          setCacheData('openAlex', data);
          console.log('✅ OpenAlex data fetched and cached');
        }
      } catch (err) {
        console.error('Dashboard Error:', err);
        if (isMounted) {
          const errorMsg = 'Failed to load dashboard data. Please try again later.';
          setError(errorMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []); // Keep empty dependency array to prevent infinite loops

  const retryFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Retrying OpenAlex data fetch...');
      const data = await apiService.getAllDashboardData();
      setDashboardData(data);
      setCacheData('openAlex', data);
      
      console.log('✅ OpenAlex data retry successful');
    } catch (err) {
      console.error('Retry Error:', err);
      const errorMsg = 'Failed to load dashboard data. Please try again later.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    loading,
    error,
    retryFetch
  };
};