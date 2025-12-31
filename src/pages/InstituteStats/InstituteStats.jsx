import { useState, useEffect } from 'react';
import scopusApiService from '../../services/scopusApi';
import Navigation from '../../components/Navigation/Navigation';
import './InstituteStats.css';

const InstituteStats = () => {
  const [instituteData, setInstituteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const departments = [
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Computer Science and Engineering',
    'Materials Science and Metallurgical Engineering',
    'Biomedical Engineering',
    'Mathematics'
  ];

  useEffect(() => {
    fetchInstituteWideData();
  }, []);

  const fetchInstituteWideData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch overall data for IIT Hyderabad across all years
      const results = await scopusApiService.getInstituteResearchData(
        null,  // No month filtering for overall
        null,  // No month filtering for overall
        null   // No year filtering for overall (fetch all years)
      );
      
      if (results && results.articles && results.articles.length > 0) {
        const stats = calculateInstituteStats(results.articles);
        setInstituteData(stats);
      } else {
        setError('No publications found for IIT Hyderabad');
      }
    } catch (err) {
      console.error('Error fetching institute data:', err);
      setError(err.message || 'Failed to fetch institute statistics');
    } finally {
      setLoading(false);
    }
  };

  const calculateInstituteStats = (articles) => {
    if (!articles || articles.length === 0) {
      return null;
    }

    // Calculate basic statistics
    const totalPublications = articles.length;
    const totalCitations = articles.reduce((sum, article) => sum + (article.citedByCount || 0), 0);
    const avgCitations = totalPublications > 0 ? (totalCitations / totalPublications).toFixed(2) : 0;
    
    // Calculate H-Index: h papers with at least h citations each
    let hIndex = 0;
    const citationCounts = articles
      .map(article => article.citedByCount || 0)
      .sort((a, b) => b - a);
    
    for (let h = citationCounts.length; h > 0; h--) {
      if (citationCounts[h - 1] >= h) {
        hIndex = h;
        break;
      }
    }

    // Department-wise statistics
    const deptStats = {};
    articles.forEach(article => {
      // Extract department from author affiliations if available
      const dept = article.department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = {
          publications: 0,
          citations: 0,
          articles: []
        };
      }
      deptStats[dept].publications += 1;
      deptStats[dept].citations += article.citedByCount || 0;
      deptStats[dept].articles.push(article);
    });

    // Convert to array and sort
    const deptArray = Object.entries(deptStats).map(([name, data]) => ({
      name,
      publications: data.publications,
      citations: data.citations,
      avgCitations: (data.citations / data.publications).toFixed(2),
      percentage: ((data.publications / totalPublications) * 100).toFixed(1)
    })).sort((a, b) => b.publications - a.publications);

    // Year-wise statistics
    const yearStats = {};
    articles.forEach(article => {
      const year = article.year || 'Unknown';
      if (!yearStats[year]) {
        yearStats[year] = {
          publications: 0,
          citations: 0
        };
      }
      yearStats[year].publications += 1;
      yearStats[year].citations += article.citedByCount || 0;
    });

    const yearArray = Object.entries(yearStats)
      .map(([year, data]) => ({
        year: parseInt(year),
        publications: data.publications,
        citations: data.citations,
        avgCitations: (data.citations / data.publications).toFixed(2)
      }))
      .filter(item => !isNaN(item.year))
      .sort((a, b) => b.year - a.year)
      .slice(0, 10); // Last 10 years

    return {
      totalPublications,
      totalCitations,
      hIndex,
      avgCitations,
      departmentStats: deptArray,
      yearStats: yearArray,
      topArticles: articles
        .sort((a, b) => (b.citedByCount || 0) - (a.citedByCount || 0))
        .slice(0, 10)
    };
  };

  const exportToCSV = () => {
    if (!instituteData) return;

    const csvContent = [
      ['IIT Hyderabad - Institute-Wide Research Statistics'],
      [''],
      ['Key Metrics'],
      ['Total Publications', instituteData.totalPublications],
      ['Total Citations', instituteData.totalCitations],
      ['H-Index', instituteData.hIndex],
      ['Average Citations per Publication', instituteData.avgCitations],
      [''],
      ['Department-wise Breakdown'],
      ['Department', 'Publications', 'Citations', 'Avg Citations', 'Percentage'],
      ...instituteData.departmentStats.map(dept => [
        dept.name,
        dept.publications,
        dept.citations,
        dept.avgCitations,
        dept.percentage + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'IIT_Hyderabad_Institute_Statistics.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="institute-stats-page">
      <div className="nav-container">
        <Navigation />
      </div>

      <div className="institute-stats-container">
        <div className="page-header">
          <h1>🏫 IIT Hyderabad - Research Statistics</h1>
          <p>Overall publications, citations, and research metrics for the entire institute</p>
        </div>

        {error && (
          <div className="error-message">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={fetchInstituteWideData} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Fetching institute-wide research data...</p>
              <p className="loading-subtitle">Calculating statistics from Scopus...</p>
            </div>
          </div>
        )}

        {instituteData && !loading && (
          <>
            {/* Main Statistics Cards */}
            <div className="main-stats-grid">
              <div className="stats-card large-card publications-card">
                <div className="card-icon">📊</div>
                <h2>Total Publications</h2>
                <div className="card-value">{instituteData.totalPublications}</div>
                <p className="card-subtitle">Research papers published</p>
              </div>

              <div className="stats-card large-card citations-card">
                <div className="card-icon">📈</div>
                <h2>Total Citations</h2>
                <div className="card-value">{instituteData.totalCitations}</div>
                <p className="card-subtitle">Research impact & citations</p>
              </div>

              <div className="stats-card large-card h-index-card">
                <div className="card-icon">🏆</div>
                <h2>H-Index</h2>
                <div className="card-value">{instituteData.hIndex}</div>
                <p className="card-subtitle">Research quality indicator</p>
              </div>

              <div className="stats-card large-card average-card">
                <div className="card-icon">📐</div>
                <h2>Avg Citations/Paper</h2>
                <div className="card-value">{instituteData.avgCitations}</div>
                <p className="card-subtitle">Average research impact</p>
              </div>
            </div>

            {/* Export Button */}
            <div className="action-buttons">
              <button onClick={fetchInstituteWideData} className="refresh-button">
                🔄 Refresh Data
              </button>
              <button onClick={exportToCSV} className="export-button">
                📥 Export to CSV
              </button>
            </div>

            {/* Department Statistics */}
            {instituteData.departmentStats && instituteData.departmentStats.length > 0 && (
              <div className="section-container">
                <h2 className="section-title">📋 Department-wise Breakdown</h2>
                <div className="department-table-wrapper">
                  <table className="department-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Publications</th>
                        <th>Citations</th>
                        <th>Avg Citations</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instituteData.departmentStats.map((dept, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                          <td className="dept-name">{dept.name}</td>
                          <td className="numeric"><span className="badge publications">{dept.publications}</span></td>
                          <td className="numeric"><span className="badge citations">{dept.citations}</span></td>
                          <td className="numeric">{dept.avgCitations}</td>
                          <td className="numeric">
                            <div className="percentage-bar">
                              <div 
                                className="percentage-fill" 
                                style={{ width: `${dept.percentage}%` }}
                              ></div>
                              <span className="percentage-text">{dept.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Year-wise Statistics */}
            {instituteData.yearStats && instituteData.yearStats.length > 0 && (
              <div className="section-container">
                <h2 className="section-title">📅 Year-wise Publication Trends (Last 10 Years)</h2>
                <div className="year-table-wrapper">
                  <table className="year-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Publications</th>
                        <th>Citations</th>
                        <th>Avg Citations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instituteData.yearStats.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                          <td className="year-value">{item.year}</td>
                          <td className="numeric">{item.publications}</td>
                          <td className="numeric">{item.citations}</td>
                          <td className="numeric">{item.avgCitations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Publications */}
            {instituteData.topArticles && instituteData.topArticles.length > 0 && (
              <div className="section-container">
                <h2 className="section-title">⭐ Top 10 Most Cited Publications</h2>
                <div className="articles-list">
                  {instituteData.topArticles.map((article, index) => (
                    <div key={index} className="article-card">
                      <div className="article-rank">#{index + 1}</div>
                      <div className="article-content">
                        <h4 className="article-title">
                          {article.url ? (
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              {article.title}
                            </a>
                          ) : (
                            article.title
                          )}
                        </h4>
                        <p className="article-meta">
                          <strong>Authors:</strong> {article.authors}
                        </p>
                        <p className="article-meta">
                          <strong>Journal:</strong> {article.journal}
                        </p>
                        <p className="article-meta">
                          <strong>Year:</strong> {article.year} | <strong>Citations:</strong>{' '}
                          <span className="citation-count">{article.citedByCount || 0}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !instituteData && !error && (
          <div className="no-data-state">
            <h3>No data loaded</h3>
            <p>Click the refresh button to load institute statistics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteStats;
