# IIT Hyderabad Scopus Research Dashboard

## 🎓 Overview
This dashboard provides comprehensive research analytics for IIT Hyderabad faculty using both OpenAlex and Scopus APIs. The Scopus integration offers real-time publication data, H-index calculations, and journal impact analysis.

## 🚀 Features

### OpenAlex Dashboard
- ✅ Institutional research overview
- ✅ Publication trends and citations
- ✅ Funding agency analysis
- ✅ Author collaboration networks

### Scopus Dashboard
- 🆕 **Department-wise filtering** with 16 departments
- 🆕 **Date range selection** (month to month within current year)
- 🆕 **Real-time publication data** from Scopus API
- 🆕 **Complete bibliographic information** with clickable titles
- 🆕 **H-index calculations** for faculty members
- 🆕 **Open access statistics** with accurate percentages
- 🆕 **Top journals analysis** based on publication data
- 🆕 **Citation counts** and keyword extraction

## 🔧 Scopus API Setup

### API Configuration
- **API Key:** `45ffcd08728def3545ed81fd42148ba3`
- **Institution ID:** `60103917` (IIT Hyderabad)
- **Rate Limits:** 10,000 requests/week, 9 requests/second
- **Documentation:** [Scopus Search API](https://dev.elsevier.com/documentation/ScopusSearchAPI.wadl)

### CORS Configuration

## 🏫 Campus Network Access

The dashboard is optimized for IIT Hyderabad's campus network with IP-based Scopus subscription. No additional configuration is required when accessing from the campus network.

### Direct API Access
- Campus IP automatically authenticates with Scopus
- No CORS issues on campus infrastructure  
- Seamless access to full Scopus database

### For Off-Campus Access
Contact the Knowledge Resource Center for VPN access to use the campus subscription remotely.

## 📊 Department Data Coverage

Currently configured departments and faculty:
- **AI** (4 faculty members)
- **BME** (12 faculty members) 
- **BT** (17 faculty members)
- **CC** (2 faculty members)
- **CE** (30 faculty members)
- **CSE** (26 faculty members)
- More departments can be added to `scopusFacultyData.js`

## 🔍 API Queries

The Scopus integration performs these types of queries:

### Publication Search
```
(AU-ID(faculty_scopus_ids)) AND 
AFFILORG(60103917) AND 
PUBYEAR = 2025 AND 
PUBDATETXT(20250101-20250831)
```

### Author Details
```
/author/author_id/{scopus_id}?field=h-index,document-count,cited-by-count
```

## 📱 Features

### Real-time Data Display
- **Publications Count:** Total publications in selected date range
- **Articles List:** Complete bibliographic information with:
  - Clickable titles linking to DOI/Scopus
  - Author names from department faculty
  - Journal names and publication dates
  - Open access indicators
  - Citation counts
  - Keywords and abstracts

### Smart Analytics
- **H-Index Calculation:** Average H-index for department faculty
- **Open Access Statistics:** Accurate percentage calculations
- **Journal Impact:** Top journals ranked by publication count
- **Date Filtering:** Flexible month-to-month selection within current year

### Responsive Design
- Mobile-friendly interface
- Consistent design with OpenAlex dashboard
- Professional IIT Hyderabad branding
- Touch-optimized controls

## 🛠️ Development

### File Structure
```
src/
├── services/
│   ├── api.js              # OpenAlex API service
│   └── scopusApi.js        # Scopus API service
├── scopusFacultyData.js    # Faculty Scopus IDs
├── Dashboard.jsx           # OpenAlex dashboard
├── ScopusDashboard.jsx     # Scopus dashboard
└── App.jsx                 # Router configuration
```

### Adding New Faculty
1. Update `scopusFacultyData.js`
2. Add faculty with Scopus IDs to appropriate departments
3. The dashboard will automatically include them in queries

### Customizing API Queries
1. Modify search parameters in `scopusApi.js`
2. Adjust rate limiting and field selections
3. Update data processing functions as needed

## 🔐 Security Notes

- API key is currently hardcoded for development
- For production, use environment variables
- Implement proper authentication and rate limiting
- Consider caching strategies for API responses

## 📈 Performance

- Rate limiting respects Scopus API constraints
- Batch processing for multiple author queries
- Efficient data processing and visualization
- Loading states and error handling

## 🎯 Future Enhancements

- [ ] Backend API implementation
- [ ] Data caching and persistence
- [ ] Additional visualization types
- [ ] Export functionality
- [ ] Email alerts for new publications
- [ ] Collaboration network analysis
