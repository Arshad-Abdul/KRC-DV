// OpenAlex API Service for IIT Hyderabad Research Data
const INSTITUTION_ID = "i65181880"; // IIT Hyderabad OpenAlex ID

// API URLs Configuration
const API_URLS = {
  institute_profile: `https://api.openalex.org/institutions/${INSTITUTION_ID}`,
  open_access: `https://api.openalex.org/works?group_by=open_access.is_oa&per_page=200&filter=authorships.institutions.lineage:${INSTITUTION_ID}`,
  top_authors: `https://api.openalex.org/authors?filter=affiliations.institution.id:${INSTITUTION_ID}&sort=works_count:desc&per_page=200`,
  top_citations: `https://api.openalex.org/works?page=1&filter=authorships.institutions.lineage:${INSTITUTION_ID},cited_by_count:500-10000&per_page=10`,
  primary_topics: `https://api.openalex.org/works?group_by=primary_topic.field.id&per_page=200&filter=authorships.institutions.lineage:${INSTITUTION_ID}`,
  yearly_citations: `https://api.openalex.org/institutions/${INSTITUTION_ID}`,
  yearly_data: `https://api.openalex.org/institutions/${INSTITUTION_ID}`,
  collaborator_countries: `https://api.openalex.org/works?group_by=authorships.countries&per_page=200&filter=authorships.countries:countries/in,authorships.institutions.lineage:${INSTITUTION_ID}`,
  collaborator_institutions: `https://api.openalex.org/works?group_by=authorships.institutions.lineage&per_page=200&filter=authorships.institutions.lineage:${INSTITUTION_ID}`,
  source_types: `https://api.openalex.org/works?group_by=primary_location.source.type&per_page=200&filter=authorships.institutions.lineage:${INSTITUTION_ID}`,
  work_types: `https://api.openalex.org/works?group_by=type&per_page=200&filter=authorships.institutions.lineage:${INSTITUTION_ID}`,
  latest_publications: `https://api.openalex.org/works?filter=institutions.id:${INSTITUTION_ID}&sort=publication_year:desc&per-page=30`,
  publishers: `https://api.openalex.org/works?group_by=primary_location.source.publisher_lineage&per_page=25&filter=authorships.institutions.lineage:${INSTITUTION_ID}`,
  funding_agencies: `https://api.openalex.org/works?group_by=grants.funder&per_page=200&filter=authorships.institutions.lineage:${INSTITUTION_ID}`
};

// Utility function to make API calls with error handling
async function fetchFromAPI(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add delay between requests to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return data;
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// Main API functions
export const apiService = {
  // Get institution profile and basic stats
  async getInstitutionProfile() {
    const data = await fetchFromAPI(API_URLS.institute_profile);
    return {
      name: data.display_name,
      works_count: data.works_count,
      cited_by_count: data.cited_by_count,
      h_index: data.summary_stats?.h_index || 0,
      i10_index: data.summary_stats?.i10_index || 0,
      counts_by_year: data.counts_by_year || []
    };
  },

  // Get open access statistics
  async getOpenAccessStats() {
    const data = await fetchFromAPI(API_URLS.open_access);
    const groups = data.group_by || [];
    const openAccessGroup = groups.find(g => g.key === 'true');
    return openAccessGroup ? openAccessGroup.count : 0;
  },

  // Get latest publications
  async getLatestPublications() {
    const data = await fetchFromAPI(API_URLS.latest_publications);
    return (data.results || []).map(work => ({
      id: work.id,
      title: work.title || 'Untitled',
      authors: work.authorships?.slice(0, 3).map(a => a.author?.display_name || 'Unknown').join(', ') || 'Unknown authors',
      journal: work.primary_location?.source?.display_name || 'Unknown journal',
      year: work.publication_year || new Date().getFullYear(),
      citations: work.cited_by_count || 0,
      doi: work.doi || null,
      open_access: work.open_access?.is_oa || false,
      type: work.type || 'article'
    }));
  },

  // Get top contributors
  async getTopContributors() {
    const data = await fetchFromAPI(API_URLS.top_authors);
    const authors = data.results || [];
    
    // Filter and process authors affiliated with IIT Hyderabad
    const iithAuthors = authors.filter(author => {
      return author.affiliations?.some(affiliation => 
        affiliation.institution?.id === `https://openalex.org/${INSTITUTION_ID}` ||
        affiliation.institution?.display_name?.toLowerCase().includes('indian institute of technology hyderabad') ||
        affiliation.institution?.display_name?.toLowerCase().includes('iit hyderabad')
      );
    });
    
    // Sort contributors by works count in increasing order (like Python reference)
    const sortedContributors = iithAuthors.sort((a, b) => a.works_count - b.works_count);
    
    // Take only the top 10 contributors (last 10 from sorted list)
    const topContributors = sortedContributors.slice(-10);
    
    return topContributors.map(author => ({
      name: author.display_name || 'Unknown',
      count: author.works_count || 0,
      h_index: author.summary_stats?.h_index || 0,
      affiliation: 'IIT Hyderabad'
    }));
  },

  // Get yearly publication data
  async getYearlyPublications() {
    const data = await fetchFromAPI(API_URLS.yearly_data);
    const yearlyData = data.counts_by_year || [];
    
    // Get last 10 years of data
    const currentYear = new Date().getFullYear();
    const last10Years = [];
    
    for (let i = 9; i >= 0; i--) {
      const year = currentYear - i;
      const yearData = yearlyData.find(y => y.year === year);
      last10Years.push({
        year,
        count: yearData ? yearData.works_count : 0
      });
    }
    
    return last10Years;
  },

  // Get yearly citation data
  async getYearlyCitations() {
    const data = await fetchFromAPI(API_URLS.yearly_citations);
    const yearlyData = data.counts_by_year || [];
    
    // Get last 10 years of citation data
    const currentYear = new Date().getFullYear();
    const last10Years = [];
    
    for (let i = 9; i >= 0; i--) {
      const year = currentYear - i;
      const yearData = yearlyData.find(y => y.year === year);
      last10Years.push({
        year,
        citations: yearData ? yearData.cited_by_count : 0
      });
    }
    
    return last10Years;
  },

  // Get subject-wise distribution for current year
  async getSubjectDistribution() {
    const currentYear = new Date().getFullYear();
    const url = `https://api.openalex.org/works?group_by=primary_topic.field.id&per_page=200&filter=authorships.institutions.lineage:${INSTITUTION_ID},publication_year:${currentYear}`;
    
    const data = await fetchFromAPI(url);
    const groups = data.group_by || [];
    
    return groups.slice(0, 10).map(group => ({
      subject: group.key_display_name || 'Unknown',
      count: group.count
    }));
  },

  // Get top cited publications
  async getTopCitedPublications() {
    const data = await fetchFromAPI(API_URLS.top_citations);
    return (data.results || []).slice(0, 10).map(work => ({
      title: work.title || 'Untitled',
      authors: work.authorships?.slice(0, 2).map(a => a.author?.display_name || 'Unknown').join(', ') || 'Unknown',
      journal: work.primary_location?.source?.display_name || 'Unknown',
      year: work.publication_year || 'Unknown',
      citations: work.cited_by_count || 0,
      doi: work.doi || null
    }));
  },

  // Get collaborator countries
  async getCollaboratorCountries() {
    const data = await fetchFromAPI(API_URLS.collaborator_countries);
    const groups = data.group_by || [];
    
    return groups.slice(0, 10).map(group => ({
      country: group.key_display_name || 'Unknown',
      count: group.count
    }));
  },

  // Get publication types
  async getPublicationTypes() {
    const data = await fetchFromAPI(API_URLS.work_types);
    const groups = data.group_by || [];
    
    return groups.map(group => ({
      type: group.key_display_name || group.key || 'Unknown',
      count: group.count
    }));
  },

  // Get top publishers
  async getTopPublishers() {
    const data = await fetchFromAPI(API_URLS.publishers);
    const groups = data.group_by || [];
    
    // Get publisher details
    const publishersWithDetails = await Promise.all(
      groups.slice(0, 25).map(async (group) => {
        try {
          if (group.key && group.key !== 'null') {
            const publisherId = group.key.replace('https://openalex.org/', '');
            const publisherData = await fetchFromAPI(`https://api.openalex.org/publishers/${publisherId}`);
            return {
              publisher: publisherData.display_name || 'Unknown Publisher',
              count: group.count
            };
          } else {
            return {
              publisher: 'Unknown Publisher',
              count: group.count
            };
          }
        } catch (error) {
          return {
            publisher: group.key_display_name || 'Unknown Publisher',
            count: group.count
          };
        }
      })
    );
    
    return publishersWithDetails;
  },

  // Get top funding agencies
  async getFundingAgencies() {
    const data = await fetchFromAPI(API_URLS.funding_agencies);
    const groups = data.group_by || [];
    
    // Process funding agencies data
    const fundingAgencies = groups.slice(0, 10).map(group => ({
      name: group.key_display_name || 'Unknown Agency',
      count: group.count || 0
    }));
    
    return fundingAgencies;
  },

  // Get all dashboard data
  async getAllDashboardData() {
    try {
      console.log('Fetching all dashboard data...');
      
      const [
        profile,
        openAccessCount,
        latestPublications,
        topContributors,
        yearlyPublications,
        yearlyCitations,
        subjectDistribution,
        topCitedPublications,
        collaboratorCountries,
        publicationTypes,
        topPublishers,
        fundingAgencies
      ] = await Promise.all([
        this.getInstitutionProfile(),
        this.getOpenAccessStats(),
        this.getLatestPublications(),
        this.getTopContributors(),
        this.getYearlyPublications(),
        this.getYearlyCitations(),
        this.getSubjectDistribution(),
        this.getTopCitedPublications(),
        this.getCollaboratorCountries(),
        this.getPublicationTypes(),
        this.getTopPublishers(),
        this.getFundingAgencies()
      ]);

      return {
        // Summary stats
        totalPublications: profile.works_count,
        totalCitations: profile.cited_by_count,
        hIndex: profile.h_index,
        openAccessCount,
        
        // Detailed data
        latestPublications,
        topContributors,
        yearlyPublications,
        yearlyCitations,
        subjectDistribution,
        topCitedPublications,
        collaboratorCountries,
        publicationTypes,
        topPublishers,
        fundingAgencies
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

export default apiService;
