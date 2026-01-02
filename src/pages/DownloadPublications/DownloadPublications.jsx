import { useState } from 'react';
import scopusApiService from '../../services/scopusApi';
import Navigation from '../../components/Navigation/Navigation';
import './DownloadPublications.css';

const DownloadPublications = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [publicationsData, setPublicationsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2007 }, (_, i) => currentYear - i);

  const fetchPublicationsForYear = async () => {
    setLoading(true);
    setError(null);
    setPublicationsData(null);

    try {
      const year = parseInt(selectedYear);
      console.log(`Fetching publications for year ${year}...`);

      const results = await scopusApiService.getInstituteResearchData(
        1,   // Start month (January)
        12,  // End month (December)
        year // Selected year
      );

      if (results && results.articles && results.articles.length > 0) {
        setPublicationsData({
          year: year,
          articles: results.articles,
          totalCount: results.articles.length,
          totalCitations: results.articles.reduce((sum, article) => sum + (article.citedByCount || 0), 0)
        });
      } else {
        setError(`No publications found for IIT Hyderabad in ${year}`);
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError(err.message || 'Failed to fetch publications');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!publicationsData || publicationsData.articles.length === 0) {
      alert('No publications to export');
      return;
    }

    const articles = publicationsData.articles;
    
    // CSV Headers - Comprehensive list of all available fields
    const headers = [
      'Citation Information',
      'Author(s)',
      'Document Title',
      'Year',
      'Month',
      'EID',
      'Source Title',
      'Abbreviated Source Title',
      'Volume',
      'Issue',
      'Pages',
      'Citation Count',
      'Source & Document Type',
      'Publication Stage',
      'DOI',
      'Open Access',
      'Author Keywords',
      'Indexed Keywords',
      'Abstract',
      'ISSN',
      'Scopus URL',
      'Document Type'
    ];

    // Prepare CSV rows
    const rows = articles.map(article => {
      // Helper function to safely escape CSV values
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Extract and format each field in the correct order
      const citationInfo = `Cited by ${article.citedByCount || 0} publications`;
      const authors = article.authors || 'N/A';
      const title = article.title || 'N/A';
      const year = article.year || '';
      const month = article.month || '';
      const eid = article.scopusId || 'N/A';
      const sourceTitle = article.journal || 'N/A';
      const abbrevSourceTitle = article.journal ? article.journal.substring(0, 50) : 'N/A';
      const volume = article.volume || '';
      const issue = article.issue || '';
      const pageRange = article.pageRange || '';
      const citationCount = article.citedByCount || 0;
      const docType = `${article.journal || 'Unknown'} - ${article.documentType || 'Journal Article'}`;
      const pubStage = 'Published';
      const doi = article.doi || 'N/A';
      const openAccess = article.isOpenAccess ? 'Yes' : 'No';
      const authorKeywords = article.keywords || 'N/A';
      const indexedKeywords = article.keywords || 'N/A';
      const abstract = article.abstract || 'N/A';
      const issn = article.issn || 'N/A';
      const scopusUrl = article.url || 'N/A';
      const documentType = article.documentType || 'Article';

      // Return properly formatted CSV row with all values escaped
      return [
        escapeCSV(citationInfo),
        escapeCSV(authors),
        escapeCSV(title),
        escapeCSV(year),
        escapeCSV(month),
        escapeCSV(eid),
        escapeCSV(sourceTitle),
        escapeCSV(abbrevSourceTitle),
        escapeCSV(volume),
        escapeCSV(issue),
        escapeCSV(pageRange),
        escapeCSV(citationCount),
        escapeCSV(docType),
        escapeCSV(pubStage),
        escapeCSV(doi),
        escapeCSV(openAccess),
        escapeCSV(authorKeywords),
        escapeCSV(indexedKeywords),
        escapeCSV(abstract),
        escapeCSV(issn),
        escapeCSV(scopusUrl),
        escapeCSV(documentType)
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `IIT_Hyderabad_Publications_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="download-publications-page">
      <div className="nav-container">
        <Navigation />
      </div>

      <div className="download-container">
        <div className="page-header">
          <h1>📥 Download IIT Hyderabad Publications</h1>
          <p>Export publications for a specific year with complete bibliographic information</p>
        </div>

        <div className="controls-section">
          <div className="control-group">
            <label htmlFor="year-select">Select Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="year-select"
            >
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchPublicationsForYear}
            disabled={loading}
            className="fetch-button"
          >
            {loading ? '⏳ Fetching...' : '🔍 Fetch Publications'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={fetchPublicationsForYear} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Fetching publications for {selectedYear}...</p>
              <p className="loading-subtitle">This may take a moment as we retrieve all publications from Scopus</p>
            </div>
          </div>
        )}

        {publicationsData && !loading && (
          <>
            <div className="results-summary">
              <div className="summary-card">
                <div className="summary-icon">📄</div>
                <div className="summary-content">
                  <h3>Total Publications</h3>
                  <p className="summary-value">{publicationsData.totalCount}</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">📈</div>
                <div className="summary-content">
                  <h3>Total Citations</h3>
                  <p className="summary-value">{publicationsData.totalCitations}</p>
                </div>
              </div>
            </div>

            <div className="export-section">
              <h2>📋 Publication Details</h2>
              <p className="info-text">
                Ready to export <strong>{publicationsData.totalCount}</strong> publications from {selectedYear} with complete bibliographic information
              </p>
              
            <div className="field-info">
                <h3>Fields included in export:</h3>
                <div className="fields-grid">
                  <div className="field-item">✓ Citation Information</div>
                  <div className="field-item">✓ Author(s)</div>
                  <div className="field-item">✓ Document Title</div>
                  <div className="field-item">✓ Year</div>
                  <div className="field-item">✓ Month</div>
                  <div className="field-item">✓ EID (Scopus ID)</div>
                  <div className="field-item">✓ Source Title</div>
                  <div className="field-item">✓ Abbreviated Source Title</div>
                  <div className="field-item">✓ Volume</div>
                  <div className="field-item">✓ Issue</div>
                  <div className="field-item">✓ Pages</div>
                  <div className="field-item">✓ Citation Count</div>
                  <div className="field-item">✓ Source & Document Type</div>
                  <div className="field-item">✓ Publication Stage</div>
                  <div className="field-item">✓ DOI</div>
                  <div className="field-item">✓ Open Access</div>
                  <div className="field-item">✓ Author Keywords</div>
                  <div className="field-item">✓ Indexed Keywords</div>
                  <div className="field-item">✓ Abstract</div>
                  <div className="field-item">✓ ISSN</div>
                  <div className="field-item">✓ Scopus URL</div>
                  <div className="field-item">✓ Document Type</div>
                </div>
              </div>

              <button
                onClick={exportToCSV}
                className="export-button"
              >
                📥 Export as CSV
              </button>
            </div>

            {/* Preview of first few publications */}
            <div className="preview-section">
              <h2>📑 Preview (First 5 Publications)</h2>
              <div className="publications-preview">
                {publicationsData.articles.slice(0, 5).map((article, index) => (
                  <div key={index} className="publication-item">
                    <div className="pub-index">{index + 1}</div>
                    <div className="pub-details">
                      <h4>{article.title}</h4>
                      <p><strong>Authors:</strong> {article.authors}</p>
                      <p><strong>Journal:</strong> {article.journal}</p>
                      <p><strong>Year:</strong> {article.year} | <strong>Citations:</strong> {article.citedByCount || 0} | <strong>Type:</strong> {article.documentType || 'Article'}</p>
                      {article.doi && <p><strong>DOI:</strong> {article.doi}</p>}
                      <p><strong>Open Access:</strong> {article.isOpenAccess ? '✓ Yes' : '✗ No'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && !publicationsData && !error && (
          <div className="no-data-state">
            <div className="no-data-icon">📋</div>
            <h3>Select a year and fetch publications</h3>
            <p>Choose a year from the dropdown above and click "Fetch Publications" to see and download IIT Hyderabad's publications for that year</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadPublications;
