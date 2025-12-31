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
  async searchPublications(scopusIds, startMonth, endMonth, year = new Date().getFullYear(), searchMode = 'department') {
    if (!scopusIds || scopusIds.length === 0) {
      throw new Error('No Scopus IDs provided');
    }

    // Format date range for Scopus API (YYYY format for year range)
    const startDate = `${year}${startMonth.toString().padStart(2, '0')}01`;
    const endDate = `${year}${endMonth.toString().padStart(2, '0')}31`;

    console.log(`🔍 Date filtering: ${startMonth}/${year} to ${endMonth}/${year}`);
    console.log(`📅 Formatted dates: ${startDate} to ${endDate}`);
    console.log(`🎯 Search mode: ${searchMode}`);
    
    // Determine filtering strategy based on date range
    const isFullYear = (startMonth === 1 && endMonth === 12);
    const useMonthFiltering = !isFullYear; // Use month filtering for both individual and department when not full year
    
    console.log(`📊 Full year query: ${isFullYear}`);
    console.log(`🗓️ Using month filtering: ${useMonthFiltering}`);

    // Scopus API limit: Maximum ~10-15 author IDs per query to avoid "exceeds maximum allowed" error
    const BATCH_SIZE = 10;
    const allEntries = [];
    let totalResults = 0;
    let useMonthFilteringGlobal = useMonthFiltering; // Track filtering strategy across all batches

    console.log(`Processing ${scopusIds.length} faculty members in batches of ${BATCH_SIZE}`);

    // Process Scopus IDs in batches to avoid API limits
    for (let i = 0; i < scopusIds.length; i += BATCH_SIZE) {
      const batch = scopusIds.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(scopusIds.length/BATCH_SIZE)}: ${batch.length} authors`);

      try {
        // Build author query for this batch
        const authorQuery = batch.map(id => `AU-ID(${id})`).join(' OR ');
        
        // Build search query with date filtering
        let searchQuery;
        if (useMonthFilteringGlobal) {
          // Use PUBDATETXT for month-range filtering (both individual and department)
          searchQuery = `${authorQuery} AND PUBDATETXT AFT ${startDate} AND PUBDATETXT BEF ${endDate}`;
          console.log(`📅 ${searchMode} mode - using month filtering (${startMonth}/${year} to ${endMonth}/${year}):`, searchQuery);
        } else {
          // Use PUBYEAR for full year queries (both individual and department)
          searchQuery = `${authorQuery} AND PUBYEAR = ${year}`;
          console.log(`📊 ${searchMode} mode - using year filtering (${year}):`, searchQuery);
        }
        
        const encodedQuery = encodeURIComponent(searchQuery);
        // Include DOI and document type fields - using correct Scopus field names
        const url = `${SCOPUS_BASE_URL}/search/scopus?query=${encodedQuery}&count=200&sort=citedby-count&field=dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,citedby-count,openaccess,prism:doi,subtypeDescription,prism:aggregationType,authkeywords,dc:description&view=STANDARD`;

        const data = await this.makeRequest(url);
        
        console.log('Raw Scopus API response:', data);
        console.log('Search results structure:', data['search-results']);
        console.log('Total results:', data['search-results']['opensearch:totalResults']);
        
        const batchResults = parseInt(data['search-results']['opensearch:totalResults']) || 0;
        let batchEntries = data['search-results']['entry'] || [];
        
        console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} results: ${batchResults} publications`);
        
        // If month filtering returned 0 results on first batch, switch to year-only for ALL batches
        if (useMonthFilteringGlobal && batchResults === 0 && i === 0) {
          console.log('⚠️ Month filtering returned 0 results on first batch, switching to year-only for ALL remaining batches...');
          const fallbackQuery = `${authorQuery} AND PUBYEAR = ${year}`;
          console.log('🔄 Fallback query for first batch:', fallbackQuery);
          
          const fallbackUrl = `${SCOPUS_BASE_URL}/search/scopus?query=${encodeURIComponent(fallbackQuery)}&count=200&sort=citedby-count&field=dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,citedby-count,openaccess,prism:doi,subtypeDescription,prism:aggregationType,authkeywords,dc:description&view=STANDARD`;
          const fallbackData = await this.makeRequest(fallbackUrl);
          
          const fallbackResults = parseInt(fallbackData['search-results']['opensearch:totalResults']) || 0;
          const fallbackEntries = fallbackData['search-results']['entry'] || [];
          
          console.log(`📊 Year-only fallback results for first batch: ${fallbackResults} publications`);
          
          if (fallbackResults > 0) {
            console.log('✅ Year-only query works! Switching to year-only for ALL remaining batches and will filter by month client-side');
            batchEntries = fallbackEntries;
            totalResults += fallbackResults;
            useMonthFilteringGlobal = false; // Switch to year-only for all remaining batches
          } else {
            console.log('❌ Even year-only query returned 0 results for first batch');
            totalResults += batchResults;
          }
        } else {
          totalResults += batchResults;
        }
        
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
  processPublications(entries, filterYear = null, startMonth = null, endMonth = null) {
    if (!entries || entries.length === 0) {
      return [];
    }
    
    console.log(`🔧 Processing ${entries.length} publications with filters: year=${filterYear}, months=${startMonth}-${endMonth}`);
    
    return entries
      .filter(entry => entry && entry['dc:title']) // Filter out empty/invalid entries
      .map((entry, index) => {
        // Debug: Log the first entry to see available fields
        if (index === 0) {
          console.log('🔍 Sample entry fields:', Object.keys(entry));
          console.log('🔍 Sample entry data:', entry);
        }
        
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

      // Extract document type - try different possible field names
      const documentType = entry['subtypeDescription'] || entry['subtype'] || entry['prism:aggregationType'] || 'Article';

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
        abstract: entry['dc:description'] ? entry['dc:description'].substring(0, 200) + '...' : '',
        documentType: documentType
      };
    })
    .filter(pub => {
      // Additional year filtering to ensure we only show publications from the selected year
      if (filterYear && pub.year !== filterYear) {
        console.log(`Filtering out publication from ${pub.year}, expected ${filterYear}: ${pub.title.substring(0, 50)}...`);
        return false;
      }
      
      // Additional month filtering (client-side) if specified
      if (startMonth && endMonth && filterYear) {
        const pubMonth = pub.month;
        const start = parseInt(startMonth);
        const end = parseInt(endMonth);
        
        // Handle cases where end month might be less than start month (e.g., academic year)
        let isInRange;
        if (start <= end) {
          // Normal range (e.g., March to June)
          isInRange = pubMonth >= start && pubMonth <= end;
        } else {
          // Cross-year range (e.g., August to July - academic year)
          isInRange = pubMonth >= start || pubMonth <= end;
        }
        
        if (!isInRange) {
          console.log(`Filtering out publication from month ${pubMonth}, expected ${start}-${end}: ${pub.title.substring(0, 50)}...`);
          return false;
        }
      }
      
      return true;
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
      .sort((a, b) => b.count - a.count); // Return all journals, sorted by count
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
  async getDepartmentResearchData(scopusIds, startMonth, endMonth, year = new Date().getFullYear(), searchMode = 'department') {
    try {
      console.log(`Fetching research data for ${scopusIds.length} faculty members`);
      console.log(`Date range: ${year}-${startMonth.toString().padStart(2, '0')} to ${year}-${endMonth.toString().padStart(2, '0')}`);
      console.log(`Search mode: ${searchMode}`);

      // Get publications with mode-specific filtering
      const publicationsData = await this.searchPublications(scopusIds, startMonth, endMonth, year, searchMode);
      console.log(`Raw publications data:`, publicationsData);
      console.log(`Total results found: ${publicationsData.totalResults}`);
      console.log(`Entries found: ${publicationsData.entries?.length || 0}`);
      
      const processedPublications = this.processPublications(publicationsData.entries, year, startMonth, endMonth);
      console.log(`Processed publications: ${processedPublications.length}`);
      console.log('Sample processed publication:', processedPublications[0]);
      console.log('All processed publications:', processedPublications);

      // Get author details for H-index calculation only for individual faculty searches
      let authorsData = [];
      let averageHIndex = 0;
      
      if (searchMode === 'individual') {
        console.log('🔍 Individual faculty search - calculating H-index');
        const limitedScopusIds = scopusIds.slice(0, 10);
        authorsData = await this.getMultipleAuthorsDetails(limitedScopusIds);
        averageHIndex = this.calculateAverageHIndex(authorsData);
      } else {
        console.log('🏢 Department search - skipping H-index calculation for performance');
      }

      // Calculate statistics
      const journalStats = this.calculateJournalStats(processedPublications);
      const openAccessStats = this.calculateOpenAccessStats(processedPublications);

      const result = {
        publications: {
          count: processedPublications.length, // Use actual processed count instead of totalResults
          details: `${processedPublications.length} publications found`,
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

      console.log(`Final result structure:`, result);
      return result;

    } catch (error) {
      console.error('Error fetching department research data:', error);
      throw new Error(`Failed to fetch research data: ${error.message}`);
    }
  }

  // Method to get institute-wide research data by affiliation
  async getInstituteResearchData(startMonth = null, endMonth = null, year = null) {
    try {
      console.log(`🏫 Fetching institute-wide research data for IIT Hyderabad`);
      
      // Determine if fetching overall (all years) or specific year
      const isOverall = (year === null || year === undefined);
      
      if (isOverall) {
        console.log(`📊 Fetching OVERALL data across ALL YEARS`);
      } else {
        console.log(`Date range: ${year}-${startMonth.toString().padStart(2, '0')} to ${year}-${endMonth.toString().padStart(2, '0')}`);
      }

      let allEntries = [];
      
      if (isOverall) {
        // For overall data, fetch year by year to avoid exceeding result limits
        const currentYear = new Date().getFullYear();
        const startYear = 2008; // IIT Hyderabad was established in 2008
        
        console.log(`📅 Fetching data year by year from ${startYear} to ${currentYear}`);
        
        for (let y = startYear; y <= currentYear; y++) {
          console.log(`\n📅 Fetching data for year ${y}...`);
          
          try {
            const yearQuery = `AF-ID("60103917") AND PUBYEAR = ${y}`;
            const encodedQuery = encodeURIComponent(yearQuery);
            
            let yearEntries = [];
            let totalResults = 0;
            
            // First request for this year
            const firstUrl = `${SCOPUS_BASE_URL}/search/scopus?query=${encodedQuery}&count=200&sort=citedby-count&start=0&field=dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,citedby-count,openaccess,prism:doi,subtypeDescription,prism:aggregationType,authkeywords,dc:description&view=STANDARD`;
            
            const firstData = await this.makeRequest(firstUrl);
            totalResults = parseInt(firstData['search-results']['opensearch:totalResults']) || 0;
            const firstEntries = firstData['search-results']['entry'] || [];
            yearEntries = yearEntries.concat(firstEntries);
            
            console.log(`   Year ${y}: Found ${totalResults} publications (batch 1: ${firstEntries.length})`);
            
            // Fetch additional pages for this year if needed
            if (totalResults > 200) {
              const pageCount = Math.ceil(totalResults / 200);
              console.log(`   📄 Total pages for ${y}: ${pageCount}`);
              
              for (let page = 1; page < pageCount; page++) {
                const start = page * 200;
                const pageUrl = `${SCOPUS_BASE_URL}/search/scopus?query=${encodedQuery}&count=200&sort=citedby-count&start=${start}&field=dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,citedby-count,openaccess,prism:doi,subtypeDescription,prism:aggregationType,authkeywords,dc:description&view=STANDARD`;
                
                const pageData = await this.makeRequest(pageUrl);
                const pageEntries = pageData['search-results']['entry'] || [];
                console.log(`   📄 Page ${page + 1} for ${y}: ${pageEntries.length} entries`);
                
                yearEntries = yearEntries.concat(pageEntries);
                
                if (pageEntries.length < 200) {
                  break;
                }
              }
            }
            
            allEntries = allEntries.concat(yearEntries);
            console.log(`   ✅ Year ${y} complete: ${yearEntries.length} total entries collected`);
            
          } catch (yearError) {
            console.warn(`⚠️ Error fetching data for year ${y}:`, yearError.message);
            // Continue with next year if one year fails
            continue;
          }
        }
      } else {
        // For specific year/date range
        const startDate = `${year}${startMonth.toString().padStart(2, '0')}01`;
        const endDate = `${year}${endMonth.toString().padStart(2, '0')}31`;
        
        const isFullYear = (startMonth === 1 && endMonth === 12);
        let searchQuery;
        
        if (isFullYear) {
          searchQuery = `AF-ID("60103917") AND PUBYEAR = ${year}`;
          console.log(`📊 Using year filtering: ${searchQuery}`);
        } else {
          searchQuery = `AF-ID("60103917") AND PUBDATETXT AFT ${startDate} AND PUBDATETXT BEF ${endDate}`;
          console.log(`📅 Using date range filtering: ${searchQuery}`);
        }
        
        const encodedQuery = encodeURIComponent(searchQuery);
        const firstUrl = `${SCOPUS_BASE_URL}/search/scopus?query=${encodedQuery}&count=200&sort=citedby-count&start=0&field=dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,citedby-count,openaccess,prism:doi,subtypeDescription,prism:aggregationType,authkeywords,dc:description&view=STANDARD`;
        
        const firstData = await this.makeRequest(firstUrl);
        const totalResults = parseInt(firstData['search-results']['opensearch:totalResults']) || 0;
        const firstEntries = firstData['search-results']['entry'] || [];
        allEntries = allEntries.concat(firstEntries);
        
        console.log(`Results for year/period - Total: ${totalResults}, First batch: ${firstEntries.length}`);
        
        // Fetch additional pages if needed
        if (totalResults > 200) {
          const pageCount = Math.ceil(totalResults / 200);
          
          for (let page = 1; page < pageCount; page++) {
            const start = page * 200;
            const pageUrl = `${SCOPUS_BASE_URL}/search/scopus?query=${encodedQuery}&count=200&sort=citedby-count&start=${start}&field=dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,citedby-count,openaccess,prism:doi,subtypeDescription,prism:aggregationType,authkeywords,dc:description&view=STANDARD`;
            
            const pageData = await this.makeRequest(pageUrl);
            const pageEntries = pageData['search-results']['entry'] || [];
            allEntries = allEntries.concat(pageEntries);
            
            if (pageEntries.length < 200) {
              break;
            }
          }
        }
      }
      
      console.log(`📦 Total entries collected: ${allEntries.length}`);

      // Process the publications
      const processedPublications = this.processPublications(allEntries, isOverall ? null : year, isOverall ? null : startMonth, isOverall ? null : endMonth);
      console.log(`✅ Processed institute publications: ${processedPublications.length}`);

      // Calculate statistics for the institute
      const journalStats = this.calculateJournalStats(processedPublications);
      const openAccessStats = this.calculateOpenAccessStats(processedPublications);

      const result = {
        articles: processedPublications,
        totalCount: processedPublications.length,
        journalStats: journalStats,
        openAccessStats: openAccessStats
      };

      console.log(`Institute-wide result:`, result);
      return result;

    } catch (error) {
      console.error('Error fetching institute research data:', error);
      throw new Error(`Failed to fetch institute research data: ${error.message}`);
    }
  }
}

export default new ScopusApiService();
