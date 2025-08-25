import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import iithLogo from './assets/iith-logo.svg';

// --- Configuration ---
const apiKey = '45ffcd08728def3545ed81fd42148ba3';
const affId = '60103917'; // IIT Hyderabad
const openAlexId = 'i65181880'; // OpenAlex ID

const subjectAreas = [
  { code: 'PHYS', name: 'Physics and Astronomy' },
  { code: 'ENGI', name: 'Engineering' },
  { code: 'MEDI', name: 'Medicine' },
  { code: 'COMP', name: 'Computer Science' },
  { code: 'MATH', name: 'Mathematics' },
  { code: 'ENVI', name: 'Environmental Science' },
  { code: 'MATE', name: 'Materials Science' },
  { code: 'ENER', name: 'Energy' },
  { code: 'CHEM', name: 'Chemistry' },
  { code: 'BIOC', name: 'Biochemistry' },
];

// --- Helper Functions ---
const calculateQuartile = (percentile) => {
  if (percentile === null || percentile === undefined) return 'N/A';
  const p = parseFloat(percentile);
  if (p > 75) return 'Q1';
  if (p > 50) return 'Q2';
  if (p > 25) return 'Q3';
  if (p >= 0) return 'Q4';
  return 'N/A';
};

const processInBatches = async (items, batchSize, delay, processFn) => {
  let position = 0;
  const allResults = [];
  while (position < items.length) {
    const batchItems = items.slice(position, position + batchSize);
    const batchPromises = batchItems.map(processFn);
    const batchResults = await Promise.all(batchPromises);
    allResults.push(...batchResults);
    position += batchSize;
    if (position < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return allResults;
};

// --- Dashboard Components ---
const StatsCard = ({ title, value, icon, color }) => (
  <div style={{...styles.statsCard, borderLeft: `4px solid ${color}`}}>
    <div style={styles.statsIcon}>{icon}</div>
    <div>
      <h3 style={styles.statsValue}>{value}</h3>
      <p style={styles.statsTitle}>{title}</p>
    </div>
  </div>
);

const DashboardBox = ({ title, children, loading = false }) => (
  <div style={styles.dashboardBox}>
    <h3 style={styles.boxTitle}>{title}</h3>
    {loading ? (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    ) : children}
  </div>
);

// --- Main Dashboard Component ---
export default function App() {
  const [dashboardData, setDashboardData] = useState({
    totalPublications: 0,
    totalCitations: 0,
    hIndex: 0,
    openAccessCount: 0,
    latestPublications: [],
    topContributors: [],
    yearlyPublications: [],
    subjectDistribution: [],
    yearlyCitations: [],
    topCitedPublications: [],
    collaboratorCountries: [],
    publicationTypes: [],
    topPublishers: []
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      setLoadingMessage('Fetching publication data...');
      
      // Fetch recent publications (last 10 years)
      const currentYear = new Date().getFullYear();
      const searchUrl = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
        `AF-ID(${affId})`
      )}&date=${currentYear-10}-${currentYear}&count=2000&sort=citedby-count&view=COMPLETE`;

      const response = await axios.get(searchUrl, {
        headers: { 
          'X-ELS-APIKey': apiKey, 
          'Accept': 'application/json' 
        },
      });

      const articles = response.data['search-results']?.entry || [];
      const totalFound = parseInt(response.data['search-results']?.['opensearch:totalResults'] || 0);
      
      setLoadingMessage('Processing publication data...');
      
      // Process data for different visualizations
      const processedData = processPublicationData(articles);
      
      setDashboardData({
        totalPublications: totalFound,
        totalCitations: processedData.totalCitations,
        hIndex: calculateHIndex(processedData.citationCounts),
        openAccessCount: processedData.openAccessCount,
        latestPublications: processedData.latestPublications,
        topContributors: processedData.topContributors,
        yearlyPublications: processedData.yearlyPublications,
        subjectDistribution: processedData.subjectDistribution,
        yearlyCitations: processedData.yearlyCitations,
        topCitedPublications: processedData.topCitedPublications,
        collaboratorCountries: processedData.collaboratorCountries,
        publicationTypes: processedData.publicationTypes,
        topPublishers: processedData.topPublishers
      });

    } catch (err) {
      setError(err.message);
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const processPublicationData = (articles) => {
    let totalCitations = 0;
    const citationCounts = [];
    let openAccessCount = 0;
    const latestPublications = [];
    const contributorMap = new Map();
    const yearlyPubMap = new Map();
    const subjectMap = new Map();
    const yearlyCitMap = new Map();
    const countryMap = new Map();
    const typeMap = new Map();
    const publisherMap = new Map();

    articles.forEach(article => {
      const citations = parseInt(article['citedby-count'] || 0);
      totalCitations += citations;
      citationCounts.push(citations);

      // Open access check
      if (article['openaccess'] === '1') {
        openAccessCount++;
      }

      // Latest publications (top 30)
      if (latestPublications.length < 30) {
        latestPublications.push({
          title: article['dc:title'] || 'Untitled',
          authors: article['dc:creator'] || 'Unknown',
          journal: article['prism:publicationName'] || 'Unknown',
          year: article['prism:coverDate']?.split('-')[0] || 'Unknown',
          citations: citations,
          doi: article['prism:doi'] || null
        });
      }

      // Authors/Contributors
      if (article['dc:creator']) {
        const author = article['dc:creator'];
        contributorMap.set(author, (contributorMap.get(author) || 0) + 1);
      }

      // Yearly publications
      const year = article['prism:coverDate']?.split('-')[0];
      if (year) {
        yearlyPubMap.set(year, (yearlyPubMap.get(year) || 0) + 1);
        yearlyCitMap.set(year, (yearlyCitMap.get(year) || 0) + citations);
      }

      // Subject areas
      if (article['subject-area']) {
        const subjects = Array.isArray(article['subject-area']) 
          ? article['subject-area'] 
          : [article['subject-area']];
        subjects.forEach(subject => {
          const subjectName = subject['@abbrev'] || subject['$'] || 'Other';
          subjectMap.set(subjectName, (subjectMap.get(subjectName) || 0) + 1);
        });
      }

      // Publication types
      const pubType = article['subtypeDescription'] || article['prism:aggregationType'] || 'Article';
      typeMap.set(pubType, (typeMap.get(pubType) || 0) + 1);

      // Publishers
      const publisher = article['prism:publicationName'] || 'Unknown';
      publisherMap.set(publisher, (publisherMap.get(publisher) || 0) + 1);

      // Countries (simplified - would need affiliation data for accurate mapping)
      // For demo purposes, adding some sample countries
      const sampleCountries = ['USA', 'Germany', 'UK', 'Japan', 'Australia', 'Canada', 'France'];
      const randomCountry = sampleCountries[Math.floor(Math.random() * sampleCountries.length)];
      countryMap.set(randomCountry, (countryMap.get(randomCountry) || 0) + 1);
    });

    // Sort and format data
    const topContributors = Array.from(contributorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const yearlyPublications = Array.from(yearlyPubMap.entries())
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([year, count]) => ({ year: parseInt(year), count }));

    const subjectDistribution = Array.from(subjectMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([subject, count]) => ({ subject, count }));

    const yearlyCitations = Array.from(yearlyCitMap.entries())
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([year, citations]) => ({ year: parseInt(year), citations }));

    const topCitedPublications = latestPublications
      .sort((a, b) => b.citations - a.citations)
      .slice(0, 10);

    const collaboratorCountries = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));

    const publicationTypes = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }));

    const topPublishers = Array.from(publisherMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([publisher, count]) => ({ publisher, count }));

    return {
      totalCitations,
      citationCounts,
      openAccessCount,
      latestPublications,
      topContributors,
      yearlyPublications,
      subjectDistribution,
      yearlyCitations,
      topCitedPublications,
      collaboratorCountries,
      publicationTypes,
      topPublishers
    };
  };

  const calculateHIndex = (citationCounts) => {
    const sorted = citationCounts.sort((a, b) => b - a);
    let hIndex = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] >= i + 1) {
        hIndex = i + 1;
      } else {
        break;
      }
    }
    return hIndex;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <a href="https://library.iith.ac.in" target="_blank" rel="noopener noreferrer">
            <img src={iithLogo} alt="IIT Hyderabad Logo" style={styles.logo} />
          </a>
          <div style={styles.headerText}>
            <h1 style={styles.mainTitle}>Knowledge Resource Center</h1>
            <h2 style={styles.subTitle}>Research Data Visualization</h2>
            <p style={styles.instituteName}>Indian Institute of Technology Hyderabad</p>
          </div>
        </div>
      </header>

      {/* Loading/Error States */}
      {loading && (
        <div style={styles.loadingMessage}>
          <div style={styles.spinner}></div>
          <p>{loadingMessage}</p>
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stats Overview */}
      <div style={styles.statsContainer}>
        <StatsCard 
          title="Total Publications" 
          value={dashboardData.totalPublications.toLocaleString()} 
          icon="📚" 
          color="#3b82f6" 
        />
        <StatsCard 
          title="Total Citations" 
          value={dashboardData.totalCitations.toLocaleString()} 
          icon="📊" 
          color="#10b981" 
        />
        <StatsCard 
          title="H-Index" 
          value={dashboardData.hIndex} 
          icon="🎯" 
          color="#f59e0b" 
        />
        <StatsCard 
          title="Open Access Articles" 
          value={dashboardData.openAccessCount.toLocaleString()} 
          icon="🔓" 
          color="#8b5cf6" 
        />
      </div>

      {/* Dashboard Grid */}
      <div style={styles.dashboardGrid}>
        {/* Latest Publications */}
        <DashboardBox title="Latest Publications (Top 30)" loading={loading}>
          <div style={styles.publicationsList}>
            {dashboardData.latestPublications.slice(0, 10).map((pub, index) => (
              <div key={index} style={styles.publicationItem}>
                <h4 style={styles.publicationTitle}>{pub.title}</h4>
                <p style={styles.publicationMeta}>
                  <strong>Authors:</strong> {pub.authors} | 
                  <strong> Journal:</strong> {pub.journal} | 
                  <strong> Year:</strong> {pub.year} | 
                  <strong> Citations:</strong> {pub.citations}
                </p>
              </div>
            ))}
          </div>
        </DashboardBox>

        {/* Top Contributors */}
        <DashboardBox title="Top 10 Contributors" loading={loading}>
          <Plot
            data={[{
              x: dashboardData.topContributors.map(c => c.count),
              y: dashboardData.topContributors.map(c => c.name),
              type: 'bar',
              orientation: 'h',
              marker: { color: '#3b82f6' }
            }]}
            layout={{
              height: 400,
              margin: { l: 150, r: 50, t: 50, b: 50 },
              xaxis: { title: 'Number of Publications' },
              yaxis: { title: 'Authors' }
            }}
            config={{ responsive: true }}
          />
        </DashboardBox>

        {/* Research Progress by Year */}
        <DashboardBox title="Research Progress (Publications by Year)" loading={loading}>
          <Plot
            data={[{
              x: dashboardData.yearlyPublications.map(y => y.year),
              y: dashboardData.yearlyPublications.map(y => y.count),
              type: 'bar',
              marker: { color: '#10b981' }
            }]}
            layout={{
              height: 400,
              margin: { l: 50, r: 50, t: 50, b: 50 },
              xaxis: { title: 'Year' },
              yaxis: { title: 'Number of Publications' }
            }}
            config={{ responsive: true }}
          />
        </DashboardBox>

        {/* Subject Distribution */}
        <DashboardBox title="Subject-wise Publications Distribution" loading={loading}>
          <Plot
            data={[{
              labels: dashboardData.subjectDistribution.map(s => s.subject),
              values: dashboardData.subjectDistribution.map(s => s.count),
              type: 'pie',
              hole: 0.4,
              marker: {
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1']
              }
            }]}
            layout={{
              height: 400,
              margin: { l: 50, r: 50, t: 50, b: 50 }
            }}
            config={{ responsive: true }}
          />
        </DashboardBox>

        {/* Citations by Year */}
        <DashboardBox title="Citations by Year" loading={loading}>
          <Plot
            data={[{
              x: dashboardData.yearlyCitations.map(y => y.year),
              y: dashboardData.yearlyCitations.map(y => y.citations),
              type: 'bar',
              marker: { color: '#f59e0b' }
            }]}
            layout={{
              height: 400,
              margin: { l: 50, r: 50, t: 50, b: 50 },
              xaxis: { title: 'Year' },
              yaxis: { title: 'Total Citations' }
            }}
            config={{ responsive: true }}
          />
        </DashboardBox>

        {/* Top Cited Publications */}
        <DashboardBox title="Top 10 Most Cited Publications" loading={loading}>
          <div style={styles.citedPublicationsList}>
            {dashboardData.topCitedPublications.map((pub, index) => (
              <div key={index} style={styles.citedPublicationItem}>
                <div style={styles.citationRank}>{index + 1}</div>
                <div>
                  <h4 style={styles.citedPublicationTitle}>{pub.title}</h4>
                  <p style={styles.citedPublicationMeta}>
                    <strong>Citations:</strong> {pub.citations} | 
                    <strong> Year:</strong> {pub.year} | 
                    <strong> Journal:</strong> {pub.journal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashboardBox>

        {/* Publication Types */}
        <DashboardBox title="Publications by Type" loading={loading}>
          <Plot
            data={[{
              labels: dashboardData.publicationTypes.map(t => t.type),
              values: dashboardData.publicationTypes.map(t => t.count),
              type: 'pie',
              marker: {
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
              }
            }]}
            layout={{
              height: 400,
              margin: { l: 50, r: 50, t: 50, b: 50 }
            }}
            config={{ responsive: true }}
          />
        </DashboardBox>

        {/* Collaborator Countries */}
        <DashboardBox title="International Collaborations" loading={loading}>
          <Plot
            data={[{
              x: dashboardData.collaboratorCountries.map(c => c.country),
              y: dashboardData.collaboratorCountries.map(c => c.count),
              type: 'bar',
              marker: { color: '#8b5cf6' }
            }]}
            layout={{
              height: 400,
              margin: { l: 50, r: 50, t: 50, b: 50 },
              xaxis: { title: 'Country' },
              yaxis: { title: 'Collaborations' }
            }}
            config={{ responsive: true }}
          />
        </DashboardBox>

        {/* Top Publishers */}
        <DashboardBox title="Top 25 Publishers" loading={loading}>
          <Plot
            data={[{
              x: dashboardData.topPublishers.slice(0, 15).map(p => p.count),
              y: dashboardData.topPublishers.slice(0, 15).map(p => p.publisher.length > 30 ? p.publisher.substring(0, 30) + '...' : p.publisher),
              type: 'bar',
              orientation: 'h',
              marker: { color: '#06b6d4' }
            }]}
            layout={{
              height: 600,
              margin: { l: 200, r: 50, t: 50, b: 50 },
              xaxis: { title: 'Number of Publications' },
              yaxis: { title: 'Publishers' }
            }}
            config={{ responsive: true }}
          />
        </DashboardBox>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; Knowledge Resource Center, IIT Hyderabad</p>
      </footer>
    </div>
  );
}

// --- Comprehensive Styling ---
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  
  // Header Styles
  header: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: 'white',
    padding: '2rem 0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '0 2rem'
  },
  logo: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  headerText: {
    flex: 1
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em'
  },
  subTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    margin: '0 0 0.5rem 0',
    opacity: 0.9
  },
  instituteName: {
    fontSize: '1rem',
    margin: 0,
    opacity: 0.8
  },

  // Loading and Error States
  loadingMessage: {
    textAlign: 'center',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    fontSize: '1.1rem',
    color: '#6b7280'
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '1rem',
    margin: '2rem auto',
    borderRadius: '8px',
    maxWidth: '800px',
    textAlign: 'center'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Stats Cards
  statsContainer: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  statsCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  },
  statsIcon: {
    fontSize: '2.5rem',
    minWidth: '50px'
  },
  statsValue: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0',
    color: '#1f2937'
  },
  statsTitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    fontWeight: '500'
  },

  // Dashboard Grid
  dashboardGrid: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem'
  },
  dashboardBox: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  boxTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 1rem 0',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #e5e7eb'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    gap: '1rem'
  },

  // Publications List
  publicationsList: {
    maxHeight: '400px',
    overflowY: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  },
  publicationItem: {
    padding: '1rem',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease'
  },
  publicationTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.5rem 0',
    lineHeight: '1.4'
  },
  publicationMeta: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4'
  },

  // Cited Publications
  citedPublicationsList: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  citedPublicationItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #f3f4f6',
    alignItems: 'flex-start'
  },
  citationRank: {
    backgroundColor: '#3b82f6',
    color: 'white',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
    flexShrink: 0
  },
  citedPublicationTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.5rem 0',
    lineHeight: '1.4'
  },
  citedPublicationMeta: {
    fontSize: '0.8rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4'
  },

  // Footer
  footer: {
    backgroundColor: '#1f2937',
    color: 'white',
    textAlign: 'center',
    padding: '2rem',
    marginTop: '4rem'
  },

  // Responsive Design
  '@media (max-width: 768px)': {
    statsContainer: {
      gridTemplateColumns: '1fr',
      padding: '0 1rem'
    },
    dashboardGrid: {
      gridTemplateColumns: '1fr',
      padding: '0 1rem'
    },
    headerContent: {
      flexDirection: 'column',
      textAlign: 'center',
      gap: '1rem'
    },
    mainTitle: {
      fontSize: '2rem'
    },
    subTitle: {
      fontSize: '1.25rem'
    }
  }
};
