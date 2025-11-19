# IITH Scopus Dashboard - Concept Note

## Background

The Indian Institute of Technology Hyderabad (IITH) seeks to develop a comprehensive research analytics dashboard that leverages the Scopus bibliographic database to track, analyze, and visualize research output across faculty members and academic departments. The dashboard will enable institutional leadership, department heads, and research administrators to:

- Monitor publication volume and citation impact by individual faculty and department.
- Identify research trends, collaboration patterns, and performance metrics.
- Generate exportable reports for institutional reporting, grant proposals, and strategic planning.
- Support data-driven decision-making for research policy and resource allocation.

The current implementation addresses a critical gap: research data visibility and accessibility across the institution. By providing a centralized, web-based interface to Scopus data, the dashboard reduces manual effort in data collection and reporting while enabling rapid, accurate insights into institutional research performance.

---

## Objectives

1. **Data Accessibility**: Provide authorized users (administrators, faculty, department heads) with a unified, easy-to-use interface to query and analyze Scopus publication data.

2. **Actionable Insights**: Enable faculty and department-level analytics including publication counts, citation metrics, open-access ratios, and individual H-index calculations.

3. **Flexible Reporting**: Support multiple export formats (CSV, JSON, HTML) with complete metadata (DOI, document type, authors, abstracts) for use in institutional reporting, funding applications, and research planning.

4. **Scalability & Robustness**: Design the system to handle repeated queries, API rate limits, and incomplete data gracefully, with clear user feedback and fallback strategies.

5. **User-Centric Design**: Deliver an intuitive dashboard that requires minimal training and clearly displays research metrics, charts, and downloadable reports.

---

## Scope and Features

### Core Features (MVP)

#### 1. Search & Query Interface
- **Search Modes**:
  - **Individual Faculty**: Query publications by a single researcher; compute and display individual H-index.
  - **Department-Level**: Aggregate publications, metrics, and performance charts across all faculty in a department.
- **Search Parameters**: Faculty name, department name, affiliation, and custom date ranges.

#### 2. Publication Data Display
- **Fields Displayed**: Title, authors, journal/conference, publication year, citation count, DOI, document type (Article, Conference Paper, Review, etc.), open-access status, and abstract.
- **Interactive Tables**: Sortable, searchable publication lists with inline DOI links for quick access to full papers.

#### 3. Analytics & Visualization
- **Publication Trends**: Line charts showing publication volume over time (per faculty or department).
- **Citation Metrics**: Bar charts and comparison tables showing citation counts and impact.
- **Department Heatmap**: Matrix visualization of faculty performance metrics (publications, citations, open-access percentage).
- **H-Index**: Individual faculty H-index calculation and historical trend (individual searches only).
- **Open-Access Breakdown**: Pie or bar charts showing open-access vs. closed publications.

#### 4. Export Functionality
- **CSV Export**: Tabular format with columns for title, authors, journal, year, citations, DOI, document type, open-access status, and abstract. DOI links are clickable when opened in spreadsheet applications (via `DOI_URL` column).
- **JSON Export**: Structured format with full metadata, including direct URLs (`doiUrl`, `clickableUrl`), suitable for integration with other systems or programmatic processing.
- **HTML Export**: Human-friendly formatted table with clickable DOI hyperlinks, suitable for email distribution or web viewing.

#### 5. User Interface & Navigation
- **Header & Navigation**: Clear branding (IITH logo), navigation menu, and contextual help.
- **Search Panel**: Intuitive controls for selecting search mode (individual or department), entering search parameters, and triggering data fetch.
- **Statistics Grid**: Key metrics display (total publications, average citations, H-index, etc.).
- **Responsive Charts**: Plotly-based interactive visualizations with zoom, hover tooltips, and download-as-image capability.
- **Export Buttons**: One-click export to CSV, JSON, or HTML.

### Constraints & Limitations (Current Phase)

- **Individual H-Index Only**: H-index is calculated and displayed only for individual faculty searches; department-level H-index is not provided.
- **No Institute-Wide Aggregation**: The dashboard supports individual and department queries; institution-wide aggregates are not in scope (removed per user requirements).
- **API Rate Limits**: Scopus API has query quotas; repeated queries are throttled, and users are notified when limits approach.
- **Data Freshness**: Publication data reflects the Scopus database at query time; no automatic refresh or scheduled updates in MVP.

---

## Technology Stack

### Frontend
- **Framework**: React 18 (JSX)
- **Build Tool**: Vite (fast development and optimized production builds)
- **Visualization**: Plotly.js (interactive charts and graphs)
- **Styling**: CSS modules and inline styles
- **Key Files**:
  - `src/pages/Scopus/ScopusDashboard.jsx` — Main dashboard UI, search controls, export logic.
  - `src/components/` — Reusable UI components (Header, Navigation, Footer).
  - `src/contexts/DashboardCacheContext.jsx` — Context for caching and state management.

### Backend / API Integration
- **Primary Data Source**: Scopus Search API (Elsevier) via REST API calls.
- **Secondary Data Source**: OpenAlex API (optional fallback for missing fields, e.g., DOI).
- **API Service**:
  - `src/services/scopusApi.js` — Scopus API wrapper, publication processing, H-index calculation.
  - `src/services/api.js` — OpenAlex integration (currently referenced, may be enhanced).
- **Request/Response Format**: JSON; fields requested include `prism:doi`, `dc:identifier`, `dc:title`, `dc:creator`, `prism:publicationName`, `prism:coverDate`, `citedby-count`, `openaccess`, `subtypeDescription`, `prism:aggregationType`, `authkeywords`, and `dc:description`.

### Development & Deployment
- **Package Manager**: npm
- **Node.js Version**: v14+ (recommended)
- **Environment Configuration**: `.env` file for Scopus API credentials (not committed to version control).
- **Local Development**: `npm install && npm start` or `npm run dev` (runs Vite dev server on `http://localhost:5173` by default).
- **Production Build**: `npm run build` (outputs optimized bundle to `dist/`).
- **Deployment Target**: Static hosting (GitHub Pages, Vercel, Netlify) or lightweight Node.js backend for API key protection.

### Key Dependencies
- React 18
- Vite
- Plotly.js
- Axios (for HTTP requests, if used)
- ESLint & Prettier (for code quality)

---

## Expected Outcome

### Deliverables

1. **Functional Web Dashboard**
   - Fully operational React-based Scopus dashboard deployable on local machine or cloud hosting.
   - Supports individual and department-level publication queries.
   - Real-time charts, metrics, and export functionality.

2. **Export Formats**
   - CSV files with DOI links and complete metadata for use in spreadsheets.
   - JSON files with structured data for programmatic integration.
   - HTML reports with formatted tables and clickable DOI hyperlinks.

3. **API Service Layer**
   - Robust `scopusApi.js` module with field selection, error handling, rate-limit management, and retry logic.
   - Clean abstraction for querying and processing Scopus responses.

4. **Documentation**
   - Updated `README.md` with setup instructions, environment variable configuration, and usage examples.
   - Inline code comments and JSDoc annotations for maintainability.
   - Quick-start guide for end-users (how to search, interpret charts, export data).

5. **Test Coverage**
   - Unit tests for publication processing, DOI extraction, and export formatting.
   - Integration tests for Scopus API mocking and error scenarios.
   - Manual E2E validation of export workflows.

### Success Metrics

1. **Functionality**
   - ✓ 100% of searches return accurate publication lists with DOI and document type present.
   - ✓ CSV/JSON/HTML exports are valid and open correctly in standard applications (Excel, Google Sheets, browsers).
   - ✓ All DOI links are clickable and resolve to correct papers.

2. **User Experience**
   - ✓ Dashboard UI is intuitive; new users can perform a search within 2 minutes.
   - ✓ Charts render within 3 seconds; exports complete within 5 seconds.
   - ✓ Clear error messages guide users when API limits or data issues occur.

3. **Robustness**
   - ✓ No unhandled runtime exceptions in common workflows.
   - ✓ Graceful degradation: partial data or missing fields are handled without crashing.
   - ✓ Rate-limit detection and user-friendly backoff notifications.

4. **Data Quality**
   - ✓ DOI present in >95% of exported publications (fallback to abstract or identifier if missing).
   - ✓ Document type correctly classified for >98% of entries.
   - ✓ H-index calculation validated against published faculty metrics (where available).

5. **Adoption & Impact**
   - ✓ Dashboard deployed and made available to IITH faculty and administration.
   - ✓ Initial user feedback confirms utility for grant proposals and institutional reporting.
   - ✓ Reduced manual data entry and reporting time by >50% for targeted use cases.

---

## Next Steps

1. **Immediate Validation**
   - Start local dev server and confirm Scopus API connectivity.
   - Validate DOI and document-type fields are returned correctly; review debug logs.
   - Test CSV/JSON/HTML export functionality with sample data.

2. **User Testing**
   - Engage 2–3 faculty members or administrators for usability feedback.
   - Refine UI based on feedback (search interface, chart readability, export clarity).

3. **Hardening & Optimization**
   - Add retry/backoff logic for rate-limited API requests.
   - Implement lightweight caching (localStorage) to minimize repeated queries.
   - Add unit and integration tests for critical functions.

4. **Documentation & Handoff**
   - Finalize README with setup, configuration, and troubleshooting steps.
   - Create a quick-reference guide for end-users.
   - Prepare runbook for operations and API key rotation.

5. **Deployment Preparation**
   - Choose hosting platform (static or backend-enabled).
   - Configure environment variables and API key management.
   - Perform final staging/production validation.

---

**Document Version**: 1.0  
**Date**: November 12, 2025  
**Prepared For**: IITH Research Administration & Faculty
