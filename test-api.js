// Simple test script to check Scopus API direct connection
// This will help us see the exact error without the React wrapper

const SCOPUS_API_KEY = '45ffcd08728def3545ed81fd42148ba3';
const SCOPUS_BASE_URL = 'https://api.elsevier.com/content';

async function testScopusConnection() {
  console.log('Testing direct Scopus API connection...');
  console.log('API Key:', SCOPUS_API_KEY);
  console.log('Base URL:', SCOPUS_BASE_URL);
  
  // Simple test query - search for any IIT Hyderabad publications
  const testQuery = 'AFFILORG(60103917) AND PUBYEAR = 2024';
  const encodedQuery = encodeURIComponent(testQuery);
  const url = `${SCOPUS_BASE_URL}/search/scopus?query=${encodedQuery}&count=1`;
  
  console.log('Test URL:', url);
  
  try {
    console.log('\n--- Making fetch request ---');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ELS-APIKey': SCOPUS_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Scopus API Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('\n--- Success! ---');
    console.log('Total results found:', data['search-results']['opensearch:totalResults']);
    console.log('First result title:', data['search-results']['entry']?.[0]?.[`dc:title`]);
    
    return data;
    
  } catch (error) {
    console.error('\n--- Error Details ---');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Check for specific error types
    if (error.message.includes('CORS')) {
      console.error('\n🔴 CORS Error: Browser is blocking cross-origin request');
      console.error('This means the campus IP subscription may not bypass browser CORS restrictions');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('\n🔴 Network Error: Cannot reach Scopus API');
      console.error('This could be due to network connectivity or firewall restrictions');
    } else if (error.message.includes('401')) {
      console.error('\n🔴 Authentication Error: API key invalid or expired');
    } else if (error.message.includes('403')) {
      console.error('\n🔴 Authorization Error: API key valid but insufficient permissions');
    }
    
    throw error;
  }
}

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  testScopusConnection()
    .then(() => console.log('\n✅ API connection test completed successfully'))
    .catch(() => console.log('\n❌ API connection test failed'));
} else {
  // Node.js environment
  console.log('This script should be run in a browser environment to test CORS behavior');
}
