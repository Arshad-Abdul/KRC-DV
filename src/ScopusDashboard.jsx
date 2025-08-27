import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { departments, getFacultyByScopeIds, getScopusIdsByDept } from './scopusFacultyData';
import scopusApiService from './services/scopusApi';
import './ScopusDashboard.css';

const ScopusDashboard = () => {
  const currentYear = new Date().getFullYear();
  const [selectedDept, setSelectedDept] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [publications, setPublications] = useState(null);
  const [articlesData, setArticlesData] = useState(null);
  const [journalStats, setJournalStats] = useState(null);
  const [hIndex, setHIndex] = useState(null);
  const [openAccessStats, setOpenAccessStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const handleFetchData = async () => {
    if (!selectedDept || !startMonth || !endMonth) {
      setError('Please select department and both start/end months');
      return;
    }

    if (parseInt(startMonth) > parseInt(endMonth)) {
      setError('Start month cannot be later than end month');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get Scopus IDs for the selected department
      const scopusIds = getScopusIdsByDept(selectedDept);
      const faculty = getFacultyByScopeIds(selectedDept);
      
      console.log(`Fetching real Scopus data for ${selectedDept} department`);
      console.log(`Period: ${months.find(m => m.value === startMonth)?.label} to ${months.find(m => m.value === endMonth)?.label} ${currentYear}`);
      console.log(`Faculty count: ${faculty.length}`);
      console.log(`Scopus IDs: ${scopusIds.length}`);

      if (scopusIds.length === 0) {
        throw new Error(`No Scopus IDs found for ${selectedDept} department. Please check faculty data.`);
      }

      // Fetch real data from Scopus API
      const researchData = await scopusApiService.getDepartmentResearchData(
        scopusIds, 
        parseInt(startMonth), 
        parseInt(endMonth), 
        currentYear
      );

      // Update state with real data
      setPublications({
        count: researchData.publications.count,
        details: `${researchData.publications.count} publications from ${months.find(m => m.value === startMonth)?.label} to ${months.find(m => m.value === endMonth)?.label} ${currentYear}`
      });

      setArticlesData({
        articles: researchData.publications.articles,
        totalCount: researchData.publications.count
      });
      
      setHIndex({
        value: researchData.hIndex.value,
        department: selectedDept,
        basedOnAuthors: researchData.hIndex.basedOnAuthors
      });
      
      setOpenAccessStats(researchData.openAccessStats);
      setJournalStats(researchData.journalStats);

      console.log(`Successfully fetched ${researchData.publications.count} publications`);
      console.log(`Open Access: ${researchData.openAccessStats.count}/${researchData.openAccessStats.total} (${researchData.openAccessStats.percentage}%)`);
      console.log(`Average H-Index: ${researchData.hIndex.value} (based on ${researchData.hIndex.basedOnAuthors} authors)`);

    } catch (err) {
      console.error('Scopus API Error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = err.message;
      
      if (err.message.includes('CORS')) {
        errorMessage = '🌐 Network Error: Unable to connect to Scopus API. Please ensure you are connected to the campus network.';
      } else if (err.message.includes('fetch') || err.message.includes('network')) {
        errorMessage = '🌐 Network Error: Unable to connect to Scopus API. Please check your internet connection and try again.';
      } else if (err.message.includes('Exceeds the maximum number allowed')) {
        errorMessage = '📊 Processing Large Department: The system is now optimized to handle large departments by splitting queries into smaller batches. Please try again.';
      } else if (err.message.includes('429')) {
        errorMessage = '⏱️ Rate Limit: Too many requests. Please wait a moment and try again.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage = '🔐 Authentication Error: Invalid API key or insufficient permissions.';
      } else if (err.message.includes('404')) {
        errorMessage = '❌ No Data Found: No publications found for the selected criteria.';
      } else if (err.message.includes('500')) {
        errorMessage = '🔧 Server Error: Scopus API is temporarily unavailable. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scopus-dashboard">
      <div className="scopus-header">
        <h1>🎓 IIT Hyderabad Scopus Analytics</h1>
        <p>Department-wise Research Publications Dashboard - {currentYear} Data</p>
        <nav className="dashboard-nav">
          <Link to="/" className="nav-link">OpenAlex Dashboard</Link>
          <Link to="/scopus-dashboard" className="nav-link active">Scopus Dashboard</Link>
        </nav>
      </div>

      <div className="controls-section">
        <div className="controls-row">
          <div className="control-group">
            <label htmlFor="department">Select Department:</label>
            <select 
              id="department"
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">Choose Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="startMonth">From Month:</label>
            <select 
              id="startMonth"
              value={startMonth} 
              onChange={(e) => setStartMonth(e.target.value)}
            >
              <option value="">Start Month</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="endMonth">To Month:</label>
            <select 
              id="endMonth"
              value={endMonth} 
              onChange={(e) => setEndMonth(e.target.value)}
            >
              <option value="">End Month</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          <button 
            className="fetch-button" 
            onClick={handleFetchData}
            disabled={loading || !selectedDept || !startMonth || !endMonth}
          >
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
        
        {(startMonth && endMonth && selectedDept) && (
          <div className="date-range-info">
            📅 Fetching data for <strong>{selectedDept}</strong> department from{' '}
            <strong>{months.find(m => m.value === startMonth)?.label}</strong> to{' '}
            <strong>{months.find(m => m.value === endMonth)?.label} {currentYear}</strong>
            <br />
            <small>ℹ️ Using Scopus API with rate limiting for accurate research data</small>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="loading-text">
              <p>� Fetching research data from Scopus API...</p>
              <p className="loading-subtitle">This may take a moment due to API rate limits</p>
            </div>
          </div>
        </div>
      )}

      {!loading && (publications || hIndex || openAccessStats) && (
        <>
          <div className="stats-grid">
            {publications && (
              <div className="stat-card">
                <h3>📄 Publications</h3>
                <div className="stat-value publications-count">
                  {publications.count}
                </div>
                <p>Publications in selected month</p>
              </div>
            )}

            {hIndex && (
              <div className="stat-card">
                <h3>📈 Average H-Index</h3>
                <div className="stat-value h-index-value">
                  {hIndex.value}
                </div>
                <p>Based on {hIndex.basedOnAuthors || 'N/A'} faculty members</p>
              </div>
            )}

            {openAccessStats && (
              <div className="stat-card">
                <h3>🔓 Open Access</h3>
                <div className="stat-value open-access-percentage">
                  {openAccessStats.percentage}%
                </div>
                <p>{openAccessStats.count} of {openAccessStats.total} publications</p>
              </div>
            )}
          </div>

          {journalStats && (
            <div className="chart-container">
              <h3>📚 Top Journals</h3>
              <div style={{ padding: '20px' }}>
                {journalStats.topJournals.map((journal, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '10px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <span>{journal.name}</span>
                    <strong>{journal.count} publications</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {articlesData && (
            <div className="chart-container">
              <h3>📄 Published Articles ({articlesData.totalCount})</h3>
              <div className="articles-list">
                {articlesData.articles.map((article, index) => (
                  <div key={article.id} className="article-item">
                    <div className="article-header">
                      <span className="article-number">#{index + 1}</span>
                      <div className="article-badges">
                        {article.isOpenAccess && <span className="open-access-badge">🔓 Open Access</span>}
                        {article.citedByCount > 0 && <span className="citation-badge">📊 {article.citedByCount} citations</span>}
                      </div>
                    </div>
                    <h4 className="article-title">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </h4>
                    <div className="article-meta">
                      <p><strong>Authors:</strong> {article.authors}</p>
                      <p><strong>Journal:</strong> {article.journal}</p>
                      <p><strong>Published:</strong> {months.find(m => m.value === article.month.toString())?.label} {article.year}</p>
                      {article.doi && <p><strong>DOI:</strong> <a href={article.url} target="_blank" rel="noopener noreferrer">{article.doi}</a></p>}
                      {article.keywords && <p><strong>Keywords:</strong> {article.keywords}</p>}
                      {article.abstract && <p className="article-abstract"><strong>Abstract:</strong> {article.abstract}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !publications && !error && (
        <div className="no-data">
          <h3>Select a department and month range to view research analytics</h3>
          <div className="api-info">
            <h4>🏫 Campus Network Access:</h4>
            <p>This dashboard uses the real Scopus API with IIT Hyderabad's campus subscription:</p>
            <ul>
              <li>Direct API access through campus IP-based subscription</li>
              <li>No additional configuration required on campus network</li>
              <li>Optimized for campus WiFi and infrastructure</li>
            </ul>
            <p><strong>API Configuration:</strong></p>
            <p>• API Key: 45ffcd08728def3545ed81fd42148ba3</p>
            <p>• Affiliation ID: 60103917 (IIT Hyderabad)</p>
            <p>• Rate Limit: 9 requests/second, 10K requests/week</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScopusDashboard;
