import React from 'react';
import { Link } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { useOpenAlexData } from '../../hooks/useOpenAlexData';
import Navigation from '../../components/Navigation/Navigation';

import './OpenAlexDashboard.css';

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
      <h4 className="publication-title">
        {publication.url ? (
          <a href={publication.url} target="_blank" rel="noopener noreferrer" className="publication-link">
            {publication.title}
          </a>
        ) : (
          publication.title
        )}
      </h4>
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
export default function OpenAlexDashboard() {
  const { dashboardData, loading, error, retryFetch } = useOpenAlexData();

  return (
    <div className="dashboard-container">
      <div className="nav-container">
        <Navigation />
      </div>

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
                margin: { l: 100, r: 20, t: 35, b: 35 },
                xaxis: { title: 'Top author Count' },
                yaxis: { title: 'Author' },
                font: { size: 10 },
                paper_bgcolor: '#54d215'
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '500px' }}
            />
          </div>
        </DashboardBox>

        {/* 3. Research Progress (Yearly Publications) */}
        <DashboardBox title="Research Progress (2008 - Present)" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.yearlyPublications.map(y => y.year),
                y: dashboardData.yearlyPublications.map(y => y.count),
                type: 'bar',
                name: 'Publications',
                marker: { color: '#10b981' },
                text: dashboardData.yearlyPublications.map(y => y.count),
                textposition: 'outside',
                yaxis: 'y'
              }, {
                x: dashboardData.yearlyPublications.map(y => y.year),
                y: dashboardData.yearlyPublications.map(y => y.citations),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Citations',
                line: { color: '#ef4444', width: 3 },
                marker: { color: '#ef4444', size: 6 },
                yaxis: 'y2'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 50 },
                xaxis: { title: 'Year' },
                yaxis: { title: 'Number of Publications', side: 'left' },
                yaxis2: {
                  title: 'Number of Citations',
                  overlaying: 'y',
                  side: 'right'
                },
                font: { size: 12 },
                legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.02 }
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
        <DashboardBox title="Citations and Publications by Year" loading={loading}>
          <div className="chart-container">
            <Plot
              data={[{
                x: dashboardData.yearlyPublications.map(y => y.year),
                y: dashboardData.yearlyPublications.map(y => y.citations),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Citations',
                line: { color: '#f59e0b', width: 3 },
                marker: { color: '#f59e0b', size: 8 },
                fill: 'tonexty',
                fillcolor: 'rgba(245, 158, 11, 0.1)',
                yaxis: 'y'
              }, {
                x: dashboardData.yearlyPublications.map(y => y.year),
                y: dashboardData.yearlyPublications.map(y => y.count),
                type: 'bar',
                name: 'Publications',
                marker: { color: '#10b981', opacity: 0.7 },
                yaxis: 'y2'
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 20, b: 50 },
                xaxis: { title: 'Year' },
                yaxis: { title: 'Total Citations', side: 'left' },
                yaxis2: {
                  title: 'Publications',
                  overlaying: 'y',
                  side: 'right'
                },
                font: { size: 12 },
                legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.02 }
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
                  <h4 className="cited-publication-title">
                    {pub.url ? (
                      <a href={pub.url} target="_blank" rel="noopener noreferrer" className="publication-link">
                        {pub.title}
                      </a>
                    ) : (
                      pub.title
                    )}
                  </h4>
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
                marker: { color: '#5631abff' },
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
                font: { size: 11 }
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
                hole: 0.1,
                marker: {
                  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
                },
                textinfo: 'label+percent',
                textposition: ''
              }]}
              layout={{
                height: 400,
                margin: { l: 50, r: 50, t: 100, b: 50 },
                font: { size: 10 },
                showlegend: true
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </DashboardBox>

        {/* 10. Top Publishers */}
        <DashboardBox title="Top 10 Publishers" loading={loading}>
          <div className="chart-container">
            {dashboardData.topPublishers && dashboardData.topPublishers.length > 0 ? (
              <Plot
                data={[{
                  x: dashboardData.topPublishers.slice(0, 10).map(p => p.count),
                  y: dashboardData.topPublishers.slice(0, 10).map(p => 
                    p.publisher.length > 40 ? p.publisher.substring(0, 40) + '...' : p.publisher
                  ),
                  type: 'bar',
                  orientation: 'h',
                  marker: { color: '#06b6d4' },
                  text: dashboardData.topPublishers.slice(0, 10).map(p => p.count),
                  textposition: 'inside'
                }]}
                layout={{
                  height: 400,
                  margin: { l: 200, r: 50, t: 20, b: 50 },
                  font: { size: 10 }
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '400px' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No publisher data available</p>
              </div>
            )}
          </div>
        </DashboardBox>

        {/* 11. Top Ten Funding Agencies */}
        <DashboardBox title="Top 10 Funding Agencies" loading={loading}>
          <div className="chart-container">
            {dashboardData.fundingAgencies && dashboardData.fundingAgencies.length > 0 ? (
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
                  textposition: 'inside',
                  hovertemplate: '<b>%{x}</b><br>Grants: %{y}<extra></extra>'
                }]}
                layout={{
                  height: 400,
                  margin: { l: 50, r: 50, t: 20, b: 150 },
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
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No funding agency data available</p>
              </div>
            )}
          </div>
        </DashboardBox>
      </div>

      
    </div>
  );
}
