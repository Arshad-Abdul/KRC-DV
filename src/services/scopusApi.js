// Scopus API Service for IIT Hyderabad Research Dashboard
// API Documentation: https://dev.elsevier.com/documentation/ScopusSearchAPI.wadl
// Affiliation ID for IIT Hyderabad: 60103917
// IITH Campus IP-based Subscription: Direct API access available on campus network

const SCOPUS_API_KEY = '45ffcd08728def3545ed81fd42148ba3';
const SCOPUS_BASE_URL = 'https://api.elsevier.com/content';
const IITH_AFFILIATION_ID = '60103917';

// API rate limits: 10,000 requests per week, 9 requests per second
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ScopusApiService {
  constructor() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }

  // Rate limiting to respect API limits
  async makeRequest(url, headers = {}) {
    // Ensure we don't exceed 9 requests per second
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 120) { // 120ms between requests (roughly 8 req/sec)
      await delay(120 - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;

    const defaultHeaders = {
      'X-ELS-APIKey': SCOPUS_API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers
    };

    console.log(`Making Scopus API request ${this.requestCount}: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Scopus API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Scopus API Request Failed:', error);
      
      // Handle CORS issues specifically
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        throw new Error('Network Error: Unable to connect to Scopus API. Campus network should provide direct access.');
      }
      
      throw error;
    }
  }

  // Search for publications by author Scopus IDs within date range
  async searchPublications(scopusIds, startMonth, endMonth, year = new Date().getFullYear()) {
    if (!scopusIds || scopusIds.length === 0) {
      throw new Error('No Scopus IDs provided');
    }

    // Format date range for Scopus API (YYYY format for year range)
    const startDate = `${year}${startMonth.toString().padStart(2, '0')}01`;
    const endDate = `${year}${endMonth.toString().padStart(2, '0')}31`;

    // Scopus API limit: Maximum ~10-15 author IDs per query to avoid "exceeds maximum allowed" error
    const BATCH_SIZE = 10;
    const allEntries = [];
    let totalResults = 0;

    console.log(`Processing ${scopusIds.length} faculty members in batches of ${BATCH_SIZE}`);

    // Process Scopus IDs in batches to avoid API limits
    for (let i = 0; i < scopusIds.length; i += BATCH_SIZE) {
      const batch = scopusIds.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(scopusIds.length/BATCH_SIZE)}: ${batch.length} authors`);

      try {
        // Build author query for this batch
        const authorQuery = batch.map(id => `AU-ID(${id})`).join(' OR ');
        
        // Build complete search query
        const searchQuery = `(${authorQuery}) AND AFFILORG(${IITH_AFFILIATION_ID}) AND PUBYEAR = ${year} AND PUBDATETXT(${startDate}-${endDate})`;
        
        const encodedQuery = encodeURIComponent(searchQuery);
        // Reduced field list to avoid query complexity limits
        const url = `${SCOPUS_BASE_URL}/search/scopus?query=${encodedQuery}&count=200&sort=citedby-count&field=dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,citedby-count,openaccess&view=STANDARD`;

        const data = await this.makeRequest(url);
        
        const batchResults = parseInt(data['search-results']['opensearch:totalResults']) || 0;
        const batchEntries = data['search-results']['entry'] || [];
        
        console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} results: ${batchResults} publications`);
        
        totalResults += batchResults;
        allEntries.push(...batchEntries);

        // Add delay between batches to respect rate limits
        if (i + BATCH_SIZE < scopusIds.length) {
          await delay(200); // 200ms delay between batches
        }

      } catch (error) {
        console.warn(`Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, error.message);
        // Continue with other batches even if one fails
      }
    }

    console.log(`Total results across all batches: ${totalResults} publications`);
    
    return {
      totalResults,
      entries: allEntries
    };
  }

  // Get author details including H-index
  async getAuthorDetails(scopusId) {
    const url = `${SCOPUS_BASE_URL}/author/author_id/${scopusId}?field=h-index,document-count,cited-by-count,given-name,surname,affiliation-current`;
    
    try {
      const data = await this.makeRequest(url);
      return data['author-retrieval-response'][0];
    } catch (error) {
      console.warn(`Failed to get details for author ${scopusId}:`, error.message);
      return null;
    }
  }

  // Get multiple authors' details with rate limiting
  async getMultipleAuthorsDetails(scopusIds) {
    const authors = [];
    
    for (const scopusId of scopusIds) {
      try {
        const authorData = await this.getAuthorDetails(scopusId);
        if (authorData) {
          authors.push({
            scopusId,
            hIndex: parseInt(authorData['h-index']) || 0,
            documentCount: parseInt(authorData['coredata']['document-count']) || 0,
            citedByCount: parseInt(authorData['coredata']['cited-by-count']) || 0,
            name: `${authorData['preferred-name']['given-name']} ${authorData['preferred-name']['surname']}`
          });
        }
      } catch (error) {
        console.warn(`Skipping author ${scopusId} due to error:`, error.message);
      }
    }
    
    return authors;
  }

  // Process publication entries to extract useful information
  processPublications(entries) {
    return entries.map((entry, index) => {
      // Extract authors
      const authors = entry['dc:creator'] ? 
        (Array.isArray(entry['dc:creator']) ? entry['dc:creator'] : [entry['dc:creator']])
          .map(creator => typeof creator === 'string' ? creator : creator['$'])
          .join(', ') : 'Unknown Authors';

      // Extract publication date
      const coverDate = entry['prism:coverDate'] || '';
      const year = coverDate ? new Date(coverDate).getFullYear() : new Date().getFullYear();
      const month = coverDate ? new Date(coverDate).getMonth() + 1 : 1;

      // Check if open access
      const isOpenAccess = entry['openaccess'] === '1' || entry['openaccess'] === 1;

      // Extract DOI and create URL
      const doi = entry['prism:doi'] || '';
      const scopusId = entry['dc:identifier'] ? entry['dc:identifier'].replace('SCOPUS_ID:', '') : '';
      const url = doi ? `https://doi.org/${doi}` : `https://www.scopus.com/record/display.uri?eid=2-s2.0-${scopusId}`;

      return {
        id: index + 1,
        title: entry['dc:title'] || 'Untitled',
        authors: authors,
        journal: entry['prism:publicationName'] || 'Unknown Journal',
        year: year,
        month: month,
        isOpenAccess: isOpenAccess,
        doi: doi,
        url: url,
        citedByCount: parseInt(entry['citedby-count']) || 0,
        scopusId: scopusId,
        keywords: entry['authkeywords'] || '',
        abstract: entry['dc:description'] ? entry['dc:description'].substring(0, 200) + '...' : ''
      };
    });
  }

  // Calculate journal statistics
  calculateJournalStats(publications) {
    const journalCounts = {};
    
    publications.forEach(pub => {
      const journal = pub.journal;
      if (journal && journal !== 'Unknown Journal') {
        journalCounts[journal] = (journalCounts[journal] || 0) + 1;
      }
    });

    return Object.entries(journalCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 journals
  }

  // Calculate open access statistics
  calculateOpenAccessStats(publications) {
    const total = publications.length;
    const openAccessCount = publications.filter(pub => pub.isOpenAccess).length;
    const percentage = total > 0 ? Math.round((openAccessCount / total) * 100) : 0;

    return {
      total: total,
      count: openAccessCount,
      percentage: percentage
    };
  }

  // Calculate average H-index for department
  calculateAverageHIndex(authors) {
    if (authors.length === 0) return 0;
    
    const totalHIndex = authors.reduce((sum, author) => sum + author.hIndex, 0);
    return Math.round(totalHIndex / authors.length);
  }

  // Main method to get department research data
  async getDepartmentResearchData(scopusIds, startMonth, endMonth, year = new Date().getFullYear()) {
    try {
      console.log(`Fetching research data for ${scopusIds.length} faculty members`);
      console.log(`Date range: ${year}-${startMonth.toString().padStart(2, '0')} to ${year}-${endMonth.toString().padStart(2, '0')}`);

      // Get publications
      const publicationsData = await this.searchPublications(scopusIds, startMonth, endMonth, year);
      const processedPublications = this.processPublications(publicationsData.entries);

      // Get author details for H-index calculation (limit to first 10 to avoid too many API calls)
      const limitedScopusIds = scopusIds.slice(0, 10);
      const authorsData = await this.getMultipleAuthorsDetails(limitedScopusIds);

      // Calculate statistics
      const journalStats = this.calculateJournalStats(processedPublications);
      const openAccessStats = this.calculateOpenAccessStats(processedPublications);
      const averageHIndex = this.calculateAverageHIndex(authorsData);

      return {
        publications: {
          count: publicationsData.totalResults,
          details: `${publicationsData.totalResults} publications found`,
          articles: processedPublications
        },
        journalStats: {
          topJournals: journalStats
        },
        hIndex: {
          value: averageHIndex,
          basedOnAuthors: authorsData.length
        },
        openAccessStats: openAccessStats,
        authorsData: authorsData
      };

    } catch (error) {
      console.error('Error fetching department research data:', error);
      throw new Error(`Failed to fetch research data: ${error.message}`);
    }
  }
}

export default new ScopusApiService();
