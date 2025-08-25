import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import apiService from './services/api.js';
import iithLogo from  "./assets/krc.png";
import './Dashboard.css';

// Dashboard Components
const StatsCard = ({ title, value, icon, color, loading }) => (
  <div className={`stats-card ${loading ? 'loading' : ''}`} style={{ borderLeftColor: color }}>
    <div className="stats-icon" style={{ color }}>{icon}</div>
    <div className="stats-content">
      <h3 className="stats-value">{loading ? '...' : value?.toLocaleString() || '0'}</h3>
      <p className="stats-title">{title}</p>
    </div>
  </div>
);

const DashboardBox = ({ title, children, loading = false, className = '' }) => (
  <div className={`dashboard-box ${className} ${loading ? 'loading' : ''}`}>
    <h3 className="box-title">{title}</h3>
    {loading ? (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    ) : children}
  </div>
);

const PublicationItem = ({ publication, index }) => (
  <div className="publication-item">
    <div className="publication-rank">{index + 1}</div>
    <div className="publication-content">
      <h4 className="publication-title">{publication.title}</h4>
      <p className="publication-meta">
        <span><strong>Authors:</strong> {publication.authors}</span> •
        <span><strong>Journal:</strong> {publication.journal}</span> •
        <span><strong>Year:</strong> {publication.year}</span> •
        <span><strong>Citations:</strong> {publication.citations}</span>
        {publication.open_access && <span className="open-access-badge">Open Access</span>}
      </p>
    </div>
  </div>
);

// Main Dashboard Component
export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
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
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getAllDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Dashboard Error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const retryFetch = () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getAllDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <a href="https://library.iith.ac.in" target="_blank" rel="noopener noreferrer">
            <img src={iithLogo} alt="IIT Hyderabad Logo" className="logo" />
          </a>
          <div className="header-text">
            <h1 className="main-title">Knowledge Resource Center</h1>
            <h2 className="sub-title">Research Data Visualization</h2>
            <p className="institute-name">Indian Institute of Technology Hyderabad</p>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={retryFetch} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="stats-container">
        <StatsCard 
          title="Total Publications" 
          value={dashboardData.totalPublications} 
          icon="📚" 
          color="#3b82f6" 
          loading={loading}
        />
        <StatsCard 
          title="Total Citations" 
          value={dashboardData.totalCitations} 
          icon="📊" 
          color="#10b981" 
          loading={loading}
        />
        <StatsCard 
          title="H-Index" 
          value={dashboardData.hIndex} 
          icon="🎯" 
          color="#f59e0b" 
          loading={loading}
        />
        <StatsCard 
          title="Open Access Articles" 
          value={dashboardData.openAccessCount} 
          icon="🔓" 
          color="#8b5cf6" 
          loading={loading}
        />
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* 1. Latest Publications */}
        <DashboardBox title="Recent Publications" loading={loading} className="wide">
          <div className="publications-list">
            {dashboardData.latestPublications.slice(0, 10).map((pub, index) => (
              <PublicationItem key={pub.id || index} publication={pub} index={index} />
            ))}
          </div>
        </DashboardBox>

        {/* 2. Top Contributors */}
        <DashboardBox title="Top Ten Contributor" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.topContributors.map(c => c.count),
                y: dashboardData.topContributors.map(c => c.name),
                type: 'bar',
                orientation: 'h',
                marker: { 
                  color: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
                         '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
                },
                text: dashboardData.topContributors.map(c => c.count),
                textposition: 'auto'
              }]}
              layout={{
                title: 'Top Ten Contributor',
                height: 500,
                margin: { l: 20, r: 35, t: 35, b: 35 },
                xaxis: { title: 'Top author Count' },
                yaxis: { title: 'Author' },
                font: { size: 12 },
                paper_bgcolor: '#54d215'
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '500px' }}
            />
          </div>
        </DashboardBox>

        {/* 3. Research Progress (Yearly Publications) */}
        <DashboardBox title="Research Progress (Last 10 Years)" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.yearlyPublications.map(y => y.year),
                y: dashboardData.yearlyPublications.map(y => y.count),
                type: 'bar',
                marker: { color: '#10b981' },
                text: dashboardData.yearlyPublications.map(y => y.count),
                textposition: 'outside'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 50 },
                xaxis: { title: 'Year' },
                yaxis: { title: 'Number of Publications' },
                font: { size: 12 }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>

        {/* 4. Subject Distribution (Current Year) */}
        <DashboardBox title={`Subject-wise Publications (${new Date().getFullYear()})`} loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                labels: dashboardData.subjectDistribution.map(s => s.subject),
                values: dashboardData.subjectDistribution.map(s => s.count),
                type: 'pie',
                hole: 0.4,
                marker: {
                  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1']
                },
                textinfo: 'label+percent',
                textposition: 'outside'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 50 },
                font: { size: 10 },
                showlegend: false
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>

        {/* 5. Citations by Year */}
        <DashboardBox title="Citations by Year" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.yearlyCitations.map(y => y.year),
                y: dashboardData.yearlyCitations.map(y => y.citations),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#f59e0b', width: 3 },
                marker: { color: '#f59e0b', size: 8 },
                fill: 'tonexty',
                fillcolor: 'rgba(245, 158, 11, 0.1)'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 50 },
                xaxis: { title: 'Year' },
                yaxis: { title: 'Total Citations' },
                font: { size: 12 }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>

        {/* 6. Top Cited Publications */}
        <DashboardBox title="Top 10 Most Cited Publications" loading={loading}>
          <div className="cited-publications-list">
            {dashboardData.topCitedPublications.map((pub, index) => (
              <div key={index} className="cited-publication-item">
                <div className="citation-rank">{index + 1}</div>
                <div>
                  <h4 className="cited-publication-title">{pub.title}</h4>
                  <p className="cited-publication-meta">
                    <strong>Citations:</strong> {pub.citations} | 
                    <strong> Authors:</strong> {pub.authors} | 
                    <strong> Year:</strong> {pub.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashboardBox>

        {/* 8. Collaborator Countries Map */}
        <DashboardBox title="International Collaborations" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.collaboratorCountries.map(c => c.country),
                y: dashboardData.collaboratorCountries.map(c => c.count),
                type: 'bar',
                marker: { color: '#8b5cf6' },
                text: dashboardData.collaboratorCountries.map(c => c.count),
                textposition: 'outside'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 100 },
                xaxis: { 
                  title: 'Country',
                  tickangle: -45
                },
                yaxis: { title: 'Number of Collaborations' },
                font: { size: 12 }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>

        {/* 9. Publication Types */}
        <DashboardBox title="Publications by Type" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                labels: dashboardData.publicationTypes.map(t => t.type),
                values: dashboardData.publicationTypes.map(t => t.count),
                type: 'pie',
                hole: 0.3,
                marker: {
                  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
                },
                textinfo: 'label+percent',
                textposition: 'outside'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 50 },
                font: { size: 10 },
                showlegend: false
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>

        {/* 10. Top Publishers */}
        <DashboardBox title="Top 15 Publishers" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.topPublishers.slice(0, 15).map(p => p.count),
                y: dashboardData.topPublishers.slice(0, 15).map(p => 
                  p.publisher.length > 35 ? p.publisher.substring(0, 35) + '...' : p.publisher
                ),
                type: 'bar',
                orientation: 'h',
                marker: { color: '#06b6d4' },
                text: dashboardData.topPublishers.slice(0, 15).map(p => p.count),
                textposition: 'outside'
              }]}
              layout={{
                height: 400,
                margin: { l: 180, r: 50, t: 20, b: 50 },
                xaxis: { title: 'Number of Publications' },
                yaxis: { title: '' },
                font: { size: 10 }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>

        {/* 11. Top Ten Funding Agencies */}
        <DashboardBox title="Top 10 Funding Agencies" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.fundingAgencies.map(f => 
                  f.name.length > 30 ? f.name.substring(0, 30) + '...' : f.name
                ),
                y: dashboardData.fundingAgencies.map(f => f.count),
                type: 'bar',
                marker: { 
                  color: dashboardData.fundingAgencies.map((_, index) => {
                    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
                                   '#8b5cf6', '#84cc16', '#f97316', '#ec4899', '#6366f1'];
                    return colors[index % colors.length];
                  }),
                  line: { width: 1, color: '#ffffff' }
                },
                text: dashboardData.fundingAgencies.map(f => f.count),
                textposition: 'outside',
                hovertemplate: '<b>%{x}</b><br>Grants: %{y}<extra></extra>'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 120 },
                xaxis: { 
                  title: 'Funding Agency',
                  tickangle: -45,
                  tickfont: { size: 10 }
                },
                yaxis: { 
                  title: 'Number of Grants',
                  gridcolor: '#e2e8f0',
                  showgrid: true
                },
                font: { size: 11 },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff'
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; Knowledge Resource Center, IIT Hyderabad</p>
      </footer>
    </div>
  );
}
