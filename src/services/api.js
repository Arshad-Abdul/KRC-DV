// OpenAlex API Service for IIT Hyderabad Research Data
const INSTITUTION_ID = "i65181880"; // IIT Hyderabad OpenAlex ID

// IIT Hyderabad Faculty List
const IITH_FACULTY_LIST = [
  "Ganesh Sambhaji Ghalme", "Konda Reddy Mopuri", "Rekha Raja", "Karthik P. N.",
  "Renu John", "Harikrishnan Narayanan Unni", "Subha Narayan Rath", "Jyotsnendu Giri",
  "Mohan Raghavan", "Aravind Kumar Rengan", "Falguni Pati", "Kousik Sarathy Sridharan",
  "Mohd Suhail Rizvi", "Avinash Eranki", "Nagarajan Ganapathy", "Jaladhar Neelavalli",
  "Basant Kumar Patel", "Anindya Roy", "Raghavendra Nidhanapati K", "Thenmalarchelvi Rathinavelan",
  "Rajakumara Eerappa", "Anamika Bhargava", "Ashish Misra", "Sandipan Ray",
  "Gunjan Mehta", "Rahul Kumar", "Himanshu Joshi", "Althuri Avanthi",
  "Gaurav Sharma", "Abhishek Subramanian", "Indranil Malik", "G. Narahari Sastry",
  "Savita Devi", "Jalihal Chetankumar Adappa", "Anamitra Saha", "B. Umashankar",
  "S. Sireesh", "Amirtham Rajagopal", "K V L Subramaniam", "T Shashidhar",
  "K B V N Phanindra", "Suriya Prakash", "Mahendrakumar Madhavan", "Debraj Bhattacharyya",
  "Asif Qureshi", "B Munwar Basha", "Anil Agarwal", "Surendra Nadh Somala",
  "Digvijay S Pawar", "Satish Kumar Regonda", "Seetha N", "Pritha Chatterjee",
  "S K Zeeshan Ali", "Ambika S", "Mullapudi Ramya Sri", "Shwetabh Yadav",
  "M. Roshan Khan", "Maheswaran Rathinasamy", "Biswarup Bhattacharyya", "Meenakshi Sharma",
  "Shruti Upadhyaya", "Sourav Das", "Prasanna R", "Doranadula Venkata Sai Praneeth",
  "Kirti Chandra Sahu", "Sunil Kumar Maity", "Parag D. Pawar", "Vinod M Janardhanan",
  "Saptarshi Majumdar", "Anand Mohan", "M Narasimha", "Chandrasekhar Sharma",
  "Phanindra Varma Jampana", "Debaprasad Shee", "Kishalay Mitra", "Lopamudra Giri",
  "Devarai Santhosh Kumar", "Balaji Iyer Vaidyanathan Shantha", "Satyavrata Samavedi", "Suhanya Duraiswamy",
  "Shelaka Gupta", "Alan Ranjit Jacob", "Ramkarn Patne", "Mahesh Ganesan",
  "Ranajit Mondal", "Giridhar Madras", "Gande Vamsi Vikram", "G. Satyanarayana",
  "M.Deepa", "Ch.Subrahmanyam", "Tarun Kanti Panda", "Faiz Ahmed Khan",
  "G. Prabusankar", "Bhabani Shankar Mallik", "Surendra Kumar Martha", "Somnath Maji",
  "Surajit Maity", "Jai Prakash", "Ashutosh Kumar Mishra", "Venkat Rao Kotagiri",
  "Krishna Gavvala", "Saurabh Kumar Singh", "Narendra Kurra", "Koyel Banerjee Ghosh",
  "Natte Kishore", "Sudarsanam Putla", "Abhijit Sau", "Arup Mahata",
  "Priyadarshi Chakraborty", "Sivakumar Vaidyanathan", "Debasish Koner", "M. Annadhasan",
  "C Malla Reddy", "Tarali Devi", "Anup Bhunia", "M. V. Panduranga Rao",
  "C. Krishna Mohan", "Ch. Sobhan Babu", "Bheemarjuna Reddy Tamma", "Subrahmanyam Kalyanasundaram",
  "Kotaro Kataoka", "N R Aravind", "Vineeth N Balasubramanian", "Upadrasta Ramakrishna",
  "Sathya Peri", "Manish Singh", "Antony Franklin", "Maunendra Sankar Desarkar",
  "Srijith P K", "Sakethanath Jagarlapudi", "Maria Francis", "Rakesh Venkat",
  "Rogers Mathew", "Praveen Tammana", "Jyothi Vedurada", "Rajesh Kedia",
  "Nitin Saurabh", "Rameshwar Pratap", "Shirshendu Das", "Ashish Mishra",
  "Saurabh Kumar", "Prasad S Onkar", "Deepak John Mathew", "Neelakantan P K",
  "Delwyn Jude Remedios", "Shiva Ji", "Seema Krishnakumar", "Ankita Roy",
  "Mohammad Shahid", "Srikar", "Saurav Khuttiya Deori", "Anusmita Das",
  "Sonali Srivastav", "Md Haseen Akhtar", "Sri Rama Murty Kodukula", "P. Rajalakshmi",
  "Ashudeb Dutta", "Mohammed Zafar Ali Khan", "Vaskar Sarkar", "Shiv Govind Singh",
  "Ketan P Detroja", "Soumya Jana", "K Siva Kumar", "G V V Sharma",
  "Kiran Kumar Kuchi", "Amit Acharyya", "Sumohana S Channappayya", "Siva Rama Krishna Vanjari",
  "Ravikumar Bhimasingu", "Yemula Pradeep Kumar", "Sushmee Badhulika", "Abhinav Kumar",
  "Kaushik Nayak", "Shishir Kumar", "Lakshmi Prasad Natarajan", "Ch Gajendranath Chaudhury",
  "V Seshadri Sravan Kumar", "Emani Naresh Kumar", "Aditya T Siripuram", "Rupesh Ganpatrao Wandhare",
  "Abhishek Kumar", "Shashank Vatedka", "Oves Mohamed Hussein Badami", "Sundaram Vanka",
  "Shubhadeep Bhattacharjee", "Jose Titus", "Kapil Jainwal", "Vishal Sawant",
  "Vajha Myna", "Pechetti Sasi Vinay", "Aneesh Sobhanan", "Anjana A M",
  "Nakul Parameswar", "Lohithaksha Maniraj Maiyar", "RanaPratap Maradana", "Jayshree Patnaik",
  "Rajesh Ittamalla", "Indira Jalli", "Prabheesh, K. P.", "Badri Narayan Rath",
  "Amrita Deb", "Srirupa Chatterjee", "Mahati Chittem", "Shubha Ranganathan",
  "Haripriya Narasimhan", "Prakash Chandra Mondal", "M P Ganesh", "Anindita Majumdar",
  "Aalok Dinakar Khandekar", "Chandan Bose", "Shuhita Bhattacharjee", "Amrita Datta",
  "Neeraj Kumar", "Gaurav Dhamija", "Aardra Surendran", "Dinabandhu Sethi",
  "Rashmi Singh", "Anandita Pan", "Raja Banerjee", "R.Prasanth Kumar",
  "M.Ramji", "K. Venkatasubbaiah", "Ashok Kumar Pandey", "S. Surya Kumar",
  "Venkatesham Balide", "Chandrika Prakash Vyasarayani", "N Venkata Reddy", "Viswanath R R S R Chinthapenta",
  "Harish Nagaraj Dixit", "Nishanth Dongari", "Karri Badarinath", "Pankaj Sharadchandra Kolhe",
  "Saravanan Balusamy", "Syed Nizamuddin Khaderi", "R Gangadharan", "Mahesh M S",
  "Sayak Banerjee", "Muvvala Gopinath", "Niranjan Shrinivas Ghaisas", "Lakshmana Dora Chandrala",
  "Safvan Palathingal", "Ranabir Dey", "Sai Sidhardh", "Prakhar Gupta",
  "Vishnu R Unni", "Anurup Datta", "Sachidananda Behera", "Prabhat Kumar",
  "K. Gnanaprakash", "Anirban Naskar", "Chandra Prakash J", "S. K. Karthick",
  "G Thulsiram", "Ankush Kumar Jaiswal", "Allaka Himabindu", "Neetu Tiwari",
  "Balasubramaniam Jayaram", "Challa Subrahmanya Sastry", "P A Lakshmi Narayana", "G Ramesh",
  "Tanmoy Paul", "D Sukumar", "Venku Naidu Dogga", "Venkata Ganapathi Narasimha Cheraku",
  "Pradipto Banerjee", "Bhakti Bhusan Manna", "Amit Tripathi", "Sameen Naqvi",
  "Mrinmoy Datta", "Arunabha Majumdar", "Jyotirmoy Rana", "Sayantee Jana",
  "Vikas Krishnamurthy", "Dhriti Sundar Patra", "Aiyappan S", "Rajesh Kannan M",
  "Deepak Kumar Pradhan", "Pinaki Prasad Bhattacharjee", "Suhash Ranjan Dey", "Ramadurai Ranjith",
  "Atul Suresh Deshpande", "Bharat Bhoosan Panigrahi", "Saswata Bhattacharya", "Mudrika Khandelwal",
  "Subhradeep Chatterjee", "Rajesh Korla", "Sai Rama Krishna Malladi", "Shourya Dutta Gupta",
  "Chandrasekhar Murapaka", "B S Murty", "Gabbita Durga Janaki Ram", "Mayur Vaidya",
  "Deepu J. Babu", "Suresh Kumar Garlapati", "Ashok Kamaraj", "Anuj Goyal",
  "Suresh Perumal", "Anjan Kumar Giri", "V.Kanchana", "Saket Asthana",
  "Prem Pal", "Manish Kumar Niranjan", "Narendra Sahu", "Vandana Sharma",
  "Suryanarayana Jammalamadaka", "Jyoti Ranjan Mohanty", "Raghavendra Srikanth Hundi", "Sai Santosh Kumar Raavi",
  "Bhuvanesh Ramakrishna", "Anurag Tripathi", "Shubho Ranjan Roy", "Shantanu Desai",
  "Priyotosh Bandyopadhyay", "Arabinda Haldar", "Anupam Gupta", "Saurabh Sandilya",
  "Kiritkumar Makwana", "Mayukh Pahari", "Nithyanandan K", "Mahesh Peddigari",
  "Satish Laxman Shinde", "Saranya Ghosh", "Alok Kumar Pan", "Yogesh Kumar",
  "Archak Purkayastha", "Atanu Rajak", "Srabani Kar", "Divya Sachdeva",
  "Manisha Thakurathi", "Hemam Rachna Devi", "Sangkha Borah"
];

// Function to check if author name matches any faculty member (case-insensitive partial matching)
const isIITHFaculty = (authorName) => {
  if (!authorName) return false;
  const cleanAuthorName = authorName.toLowerCase().trim();
  
  return IITH_FACULTY_LIST.some(facultyName => {
    const cleanFacultyName = facultyName.toLowerCase().trim();
    // Check for exact match or if faculty name is contained in author name or vice versa
    return cleanAuthorName.includes(cleanFacultyName) || 
           cleanFacultyName.includes(cleanAuthorName) ||
           // Also check for last name matching (for cases like "Kumar, A." vs "Abhishek Kumar")
           cleanAuthorName.split(' ').some(part => cleanFacultyName.includes(part) && part.length > 2) ||
           cleanFacultyName.split(' ').some(part => cleanAuthorName.includes(part) && part.length > 2);
  });
};

// API URLs Configuration
const API_URLS = {
 institute_profile: `https://api.openalex.org/institutions/${INSTITUTION_ID}?data-version=2`,
    
    // Open Access Status (Filter by Institution ID and group by OA status)
    open_access: `https://api.openalex.org/works?group_by=open_access.is_oa&per_page=200&filter=authorships.institutions.id:${INSTITUTION_ID}&data-version=2`,
    
    // Top Authors (Filter authors by affiliation institution ID)
    top_authors: `https://api.openalex.org/authors?filter=affiliations.institution.id:${INSTITUTION_ID}&sort=works_count:desc&per_page=200&data-version=2`,
    
    // Top Citations (Uses institutions.id for current affiliations, keeping 'cited_by_count' filter)
    top_citations: `https://api.openalex.org/works?page=1&filter=authorships.institutions.id:${INSTITUTION_ID},publication_year:2008-,cited_by_count:10-10000&sort=cited_by_count:desc&per_page=50&data-version=2`,
    
    // Primary Topics (Group by the top-level 'concept.field.id' (Level 0) or simple 'concept.id')
    // We'll use the main concept ID filter and group for simplicity
    primary_topics: `https://api.openalex.org/works?group_by=concepts.id&per_page=200&filter=authorships.institutions.id:${INSTITUTION_ID}&data-version=2`,
    
    // Yearly Citations (Use the direct 'counts_by_year' from the institution profile)
    yearly_citations: `https://api.openalex.org/institutions/${INSTITUTION_ID}?select=id,counts_by_year&data-version=2`,
    
    // Yearly Works (Also available in 'counts_by_year' on the institution profile)
    yearly_data: `https://api.openalex.org/institutions/${INSTITUTION_ID}?select=id,counts_by_year&data-version=2`,
    
    // Collaborator Countries (Filter by the institution's works and group by country code)
    collaborator_countries: `https://api.openalex.org/works?group_by=authorships.countries&per_page=200&filter=authorships.institutions.id:${INSTITUTION_ID}&data-version=2`,
    
    // Collaborator Institutions (Group by institution ID, filter out the target institution for a cleaner collaborator list)
    collaborator_institutions: `https://api.openalex.org/works?group_by=authorships.institutions.id&per_page=200&filter=authorships.institutions.id:${INSTITUTION_ID}&data-version=2`,
    
    // Source Types (Group by where the work is published/hosted)
    source_types: `https://api.openalex.org/works?group_by=primary_location.source.type&per_page=200&filter=authorships.institutions.id:${INSTITUTION_ID}&data-version=2`,
    
    // Work Types (Group by the type of scholarly work)
    work_types: `https://api.openalex.org/works?group_by=type&per_page=200&filter=authorships.institutions.id:${INSTITUTION_ID}&data-version=2`,
    
    // Latest Publications (Sort by publication year)
    latest_publications: `https://api.openalex.org/works?filter=authorships.institutions.id:${INSTITUTION_ID}&sort=publication_year:desc&per_page=100&data-version=2`,
    
    // Publishers (Get works to manually group by publisher)
    publishers: `https://api.openalex.org/works?filter=authorships.institutions.id:${INSTITUTION_ID}&per_page=200&sort=publication_year:desc&data-version=2`,
    
    // Funding Agencies (Get works to manually extract and group by funder)
    funding_agencies: `https://api.openalex.org/works?filter=authorships.institutions.id:${INSTITUTION_ID}&per_page=200&sort=publication_year:desc&data-version=2`
};

// Utility function to make API calls with error handling and better rate limiting
async function fetchFromAPI(url, retries = 3) {
  // Persistent localStorage cache with expiration
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  const cacheKey = `openalex_cache_${btoa(url)}`;
  
  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`📋 Using cached data for: ${url}`);
        return data;
      }
    }
  } catch (e) {
    // Ignore cache errors
  }

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Fetching (attempt ${i + 1}): ${url}`);
      
      // Add longer initial delay to respect rate limits
      if (i === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'KRC-Dashboard/1.0 (https://iith.ac.in)'
        }
      });
      
      if (response.status === 429) {
        // Rate limited - wait longer before retry
        const waitTime = Math.min(10000 * Math.pow(2, i), 60000); // Max 60s
        console.warn(`⚠️ Rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache successful response
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (e) {
        // Ignore cache storage errors
      }
      
      // Longer delay between successful requests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return data;
    } catch (error) {
      console.warn(`❌ Attempt ${i + 1} failed for ${url}:`, error.message);
      if (i === retries - 1) throw error;
      
      // Exponential backoff with jitter
      const baseDelay = 5000 * Math.pow(2, i);
      const jitter = Math.random() * 2000;
      const delay = baseDelay + jitter;
      
      await new Promise(resolve => setTimeout(resolve, delay));
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
    
    console.log('Open access API response:', groups);
    
    // Try different variations of true/open access keys
    const openAccessGroup = groups.find(g => 
      g.key === 'true' || 
      g.key === true || 
      g.key === 'True' || 
      g.key === 'TRUE' ||
      g.key_display_name?.toLowerCase().includes('open') ||
      g.key_display_name?.toLowerCase().includes('true')
    );
    
    console.log('Found open access group:', openAccessGroup);
    
    const count = openAccessGroup ? openAccessGroup.count : 0;
    console.log('Open access count:', count);
    
    return count;
  },

  // Get latest publications
  async getLatestPublications() {
    const data = await fetchFromAPI(API_URLS.latest_publications);
    
    // Filter publications to only include those by IITH faculty
    const facultyPublications = (data.results || []).filter(work => {
      // Check if any author in the publication is an IITH faculty member
      return work.authorships?.some(authorship => {
        const authorName = authorship.author?.display_name;
        return isIITHFaculty(authorName);
      });
    });
    
    return facultyPublications.map(work => ({
      id: work.id,
      title: work.title || 'Untitled',
      authors: work.authorships?.slice(0, 3).map(a => a.author?.display_name || 'Unknown').join(', ') || 'Unknown authors',
      journal: work.primary_location?.source?.display_name || 'Unknown journal',
      year: work.publication_year || new Date().getFullYear(),
      citations: work.cited_by_count || 0,
      doi: work.doi || null,
      url: work.doi ? `https://doi.org/${work.doi}` : (work.primary_location?.landing_page_url || null),
      open_access: work.open_access?.is_oa || false,
      type: work.type || 'article'
    }));
  },

  // Get top contributors
  async getTopContributors() {
    const data = await fetchFromAPI(API_URLS.top_authors);
    const authors = data.results || [];
    
    // Filter authors by IIT Hyderabad affiliation AND faculty list
    const iithFacultyAuthors = authors.filter(author => {
      // First check IIT Hyderabad affiliation
      const hasIITHAffiliation = author.affiliations?.some(affiliation => 
        affiliation.institution?.id === `https://openalex.org/${INSTITUTION_ID}` ||
        affiliation.institution?.display_name?.toLowerCase().includes('indian institute of technology hyderabad') ||
        affiliation.institution?.display_name?.toLowerCase().includes('iit hyderabad')
      );
      
      // Then check if author is in the faculty list
      const isFaculty = isIITHFaculty(author.display_name);
      
      return hasIITHAffiliation && isFaculty;
    });
    
    // Sort contributors by works count in descending order (highest first)
    const sortedContributors = iithFacultyAuthors.sort((a, b) => b.works_count - a.works_count);
    
    // Take only the top 10 contributors
    const topContributors = sortedContributors.slice(0, 10);
    
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
    
    // Get data from 2008 (IIT Hyderabad founding year) to current year
    const currentYear = new Date().getFullYear();
    const startYear = 2008; // IIT Hyderabad founding year
    const allYears = [];
    
    for (let year = startYear; year <= currentYear; year++) {
      const yearData = yearlyData.find(y => y.year === year);
      allYears.push({
        year,
        count: yearData ? yearData.works_count : 0,
        citations: yearData ? yearData.cited_by_count : 0
      });
    }
    
    return allYears;
  },

  // Get yearly citation data
  async getYearlyCitations() {
    const data = await fetchFromAPI(API_URLS.yearly_citations);
    const yearlyData = data.counts_by_year || [];
    
    // Get data from 2008 (IIT Hyderabad founding year) to current year
    const currentYear = new Date().getFullYear();
    const startYear = 2008; // IIT Hyderabad founding year
    const allYears = [];
    
    for (let year = startYear; year <= currentYear; year++) {
      const yearData = yearlyData.find(y => y.year === year);
      allYears.push({
        year,
        citations: yearData ? yearData.cited_by_count : 0
      });
    }
    
    return allYears;
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
    const works = data.results || [];
    
    // Filter publications by year (2008+) and faculty authors
    const filteredWorks = works.filter(work => {
      // Check if publication year is 2008 or later
      const year = work.publication_year;
      if (!year || year < 2008) return false;
      
      // Check if at least one author is from the faculty list
      const authors = work.authorships || [];
      const hasFacultyAuthor = authors.some(authorship => {
        const authorName = authorship.author?.display_name;
        return isIITHFaculty(authorName);
      });
      
      return hasFacultyAuthor;
    });
    
    // Sort by citation count and take top 10
    const sortedWorks = filteredWorks
      .sort((a, b) => (b.cited_by_count || 0) - (a.cited_by_count || 0))
      .slice(0, 10);
    
    return sortedWorks.map(work => ({
      title: work.title || 'Untitled',
      authors: work.authorships?.slice(0, 2).map(a => a.author?.display_name || 'Unknown').join(', ') || 'Unknown',
      journal: work.primary_location?.source?.display_name || 'Unknown',
      year: work.publication_year || 'Unknown',
      citations: work.cited_by_count || 0,
      doi: work.doi || null,
      url: work.doi ? `https://doi.org/${work.doi}` : (work.primary_location?.landing_page_url || null)
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
    
    console.log('All publication types from OpenAlex:', groups.map(g => ({ key: g.key, display: g.key_display_name, count: g.count })));
    
    // More flexible filtering for relevant publication types for ranking frameworks
    const allowedTypes = [
      'article', 'journal-article',
      'conference-paper', 'proceedings-article', 
      'book-chapter', 'book-section',
      'book','review', 'review-article'
    ];
    
    const filtered = groups.filter(group => {
      const key = group.key?.toLowerCase();
      const displayName = group.key_display_name?.toLowerCase();
      
      // Check if key or display name matches any allowed type
      return allowedTypes.some(allowedType => 
        key?.includes(allowedType) || 
        displayName?.includes(allowedType) ||
        key === allowedType ||
        displayName === allowedType
      );
    });
    
    console.log('Filtered publication types:', filtered);
    
    // If no filtered results, return top 5 types to avoid empty display
    const resultTypes = filtered.length > 0 ? filtered : groups.slice(0, 5);
    
    return resultTypes
      .map(group => ({
        type: group.key_display_name || group.key || 'Unknown',
        count: group.count
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  },

  // Get top publishers
  async getTopPublishers() {
    try {
      const data = await fetchFromAPI(API_URLS.publishers);
      console.log('📊 Publishers API response works count:', data.results?.length);
      
      if (!data.results || data.results.length === 0) {
        console.warn('⚠️ No works found for publisher grouping');
        return [];
      }
      
      // Manually group by publisher
      const publisherMap = {};
      
      data.results.forEach(work => {
        try {
          const publisherName = work.primary_location?.source?.display_name || 'Unknown Publisher';
          const publisherId = work.primary_location?.source?.id;
          
          if (publisherName && publisherName !== 'Unknown Publisher') {
            if (!publisherMap[publisherName]) {
              publisherMap[publisherName] = {
                publisher: publisherName,
                count: 0,
                id: publisherId
              };
            }
            publisherMap[publisherName].count++;
          }
        } catch (error) {
          console.warn('⚠️ Error processing work for publisher:', error);
        }
      });
      
      // Convert to array and sort by count
      const publishers = Object.values(publisherMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      console.log('📊 Top publishers extracted:', publishers);
      
      return publishers;
    } catch (error) {
      console.error('❌ Error in getTopPublishers:', error);
      return [];
    }
  },

  // Get top funding agencies
  async getFundingAgencies() {
    try {
      const data = await fetchFromAPI(API_URLS.funding_agencies);
      console.log('💰 Funding agencies API response works count:', data.results?.length);
      
      if (!data.results || data.results.length === 0) {
        console.warn('⚠️ No works found for funding grouping');
        return [];
      }
      
      // Manually group by funder
      const funderMap = {};
      
      data.results.forEach(work => {
        try {
          const grants = work.grants || [];
          grants.forEach(grant => {
            if (grant.funder && grant.funder.display_name) {
              const funderName = grant.funder.display_name;
              
              if (!funderMap[funderName]) {
                funderMap[funderName] = {
                  name: funderName,
                  count: 0,
                  id: grant.funder.id
                };
              }
              funderMap[funderName].count++;
            }
          });
        } catch (error) {
          console.warn('⚠️ Error processing work for funding:', error);
        }
      });
      
      // Function to add acronyms to funding agency names
      const addAcronym = (name) => {
        if (!name) return 'Unknown Agency';
        
        const acronymMap = {
          'Department of Science and Technology': 'DST',
          'Ministry of Education': 'MoE',
          'Council of Scientific and Industrial Research': 'CSIR',
          'Department of Energy': 'DoE',
          'National Science Foundation': 'NSF',
          'Department of Biotechnology': 'DBT',
          'Indian Council of Medical Research': 'ICMR',
          'University Grants Commission': 'UGC',
          'Defence Research and Development Organisation': 'DRDO',
          'Indian Space Research Organisation': 'ISRO',
          'All India Council for Technical Education': 'AICTE',
          'Science and Engineering Research Board': 'SERB',
          'Technology Development Board': 'TDB',
          'Indian Council of Agricultural Research': 'ICAR',
          'Ministry of Electronics and Information Technology': 'MeitY',
          'Department of Atomic Energy': 'DAE',
          'Indian Institute of Technology': 'IIT',
          'National Institutes of Health': 'NIH',
          'European Commission': 'EC',
          'Department of Health and Human Services': 'HHS',
          'Ministry of Human Resource Development': 'MHRD',
          'Indian National Science Academy': 'INSA',
          'Bhabha Atomic Research Centre': 'BARC',
          'Indian Statistical Institute': 'ISI',
          'Indian Institute of Science': 'IISc'
        };
        
        // Check for partial matches and add acronyms
        for (const [fullName, acronym] of Object.entries(acronymMap)) {
          if (name.toLowerCase().includes(fullName.toLowerCase())) {
            return `${name} (${acronym})`;
          }
        }
        
        // If no match found, try to extract common patterns
        const words = name.split(' ').filter(word => word.length > 2);
        if (words.length >= 2 && words.length <= 4) {
          const potentialAcronym = words.map(word => word.charAt(0).toUpperCase()).join('');
          if (potentialAcronym.length >= 2 && potentialAcronym.length <= 5) {
            return `${name} (${potentialAcronym})`;
          }
        }
        
        return name;
      };
      
      // Convert to array, sort by count, and take top 10
      const fundingAgencies = Object.values(funderMap)
        .map(funder => ({
          name: addAcronym(funder.name),
          count: funder.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      console.log('💰 Top funding agencies extracted:', fundingAgencies);
      
      return fundingAgencies;
    } catch (error) {
      console.error('❌ Error in getFundingAgencies:', error);
      return [];
    }
  },

  // Get all dashboard data
  async getAllDashboardData() {
    const startTime = Date.now();
    console.log('🚀 Starting dashboard data fetch...');
    
    // Fallback data structure
    const fallbackData = {
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
    };

    // Helper to safely fetch data with fallback
    const safeFetch = async (fetchFunction, fallbackValue, name) => {
      try {
        console.log(`📊 Fetching ${name}...`);
        const result = await fetchFunction();
        console.log(`✅ ${name} completed`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${name}:`, error.message);
        return fallbackValue;
      }
    };

    // Helper to delay between requests
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Fetch core data first (most important)
      const profile = await safeFetch(
        () => this.getInstitutionProfile(),
        { name: 'IIT Hyderabad', works_count: 0, cited_by_count: 0, h_index: 0 },
        'Institution Profile'
      );

      await delay(3000);

      // Fetch other data with longer delays
      const [
        openAccessCount,
        latestPublications,
        topContributors,
        yearlyPublications
      ] = await Promise.all([
        safeFetch(() => this.getOpenAccessStats(), 0, 'Open Access Stats'),
        safeFetch(() => this.getLatestPublications(), [], 'Latest Publications'),
        safeFetch(() => this.getTopContributors(), [], 'Top Contributors'),
        safeFetch(() => this.getYearlyPublications(), [], 'Yearly Publications')
      ]);

      await delay(5000);

      const [
        yearlyCitations,
        subjectDistribution,
        topCitedPublications,
        collaboratorCountries
      ] = await Promise.all([
        safeFetch(() => this.getYearlyCitations(), [], 'Yearly Citations'),
        safeFetch(() => this.getSubjectDistribution(), [], 'Subject Distribution'),
        safeFetch(() => this.getTopCitedPublications(), [], 'Top Cited Publications'),
        safeFetch(() => this.getCollaboratorCountries(), [], 'Collaborator Countries')
      ]);

      await delay(5000);

      const [
        publicationTypes,
        topPublishers,
        fundingAgencies
      ] = await Promise.all([
        safeFetch(() => this.getPublicationTypes(), [], 'Publication Types'),
        safeFetch(() => this.getTopPublishers(), [], 'Top Publishers'),
        safeFetch(() => this.getFundingAgencies(), [], 'Funding Agencies')
      ]);

      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`🎉 Dashboard data fetch completed in ${elapsedTime}s`);

      return {
        // Summary stats
        totalPublications: profile.works_count || 0,
        totalCitations: profile.cited_by_count || 0,
        hIndex: profile.h_index || 0,
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
      console.error('💥 Critical error in getAllDashboardData:', error);
      // Return fallback data instead of throwing
      console.log('🔄 Returning fallback data...');
      return fallbackData;
    }
  }
};

export default apiService;
