import { useState } from 'react';
import { useDashboardCache } from '../contexts/DashboardCacheContext';
import scopusApiService from '../services/scopusApi';

export const useScopusData = () => {
  const { getCachedData, setCacheData } = useDashboardCache();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPublications = async (searchParams) => {
    const { scopusIds, startMonth, endMonth, year, searchMode, selectedDept, facultyInfo } = searchParams;
    
    // Check cache first using 'scopus' as dashboard type and search params as parameters
    const cachedResult = getCachedData('scopus', searchParams);
    
    if (cachedResult.isValid && cachedResult.data) {
      console.log('📋 Using cached Scopus data for:', searchParams);
      return cachedResult.data;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching fresh Scopus data for:', searchParams);
      console.log(`About to call API with: scopusIds=${scopusIds.length}, startMonth=${startMonth}, endMonth=${endMonth}, year=${year}, searchMode=${searchMode}`);
      
      // Call the API method with search mode information
      const researchData = await scopusApiService.getDepartmentResearchData(
        scopusIds, 
        startMonth, 
        endMonth, 
        year,
        searchMode
      );

      console.log('Received research data:', researchData);
      
      // Cache the complete result with search parameters
      setCacheData('scopus', researchData, searchParams);
      
      console.log('✅ Scopus data fetched and cached');
      return researchData;
      
    } catch (err) {
      console.error('Scopus API Error:', err);
      const errorMsg = err.message || 'Failed to fetch data';
      setError(errorMsg);
      throw err; // Re-throw so the component can handle it
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchPublications
  };
};