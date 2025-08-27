# IIT Hyderabad Knowledge Resource Center - Research Data Visualization Dashboard

A comprehensive and interactive dashboard for visualizing research output data from IIT Hyderabad using the Scopus API. This dashboard provides real-time insights into publications, citations, collaborations, and research trends.

## 🏫 Campus Deployment

This dashboard is optimized for **IIT Hyderabad campus network** with IP-based Scopus subscription access. No additional proxy configuration is required when running on campus infrastructure.

### Quick Start (Campus Network)
```bash
# Windows
start-campus.bat

# Linux/Mac  
./start-campus.sh

# Manual start
npm install
npm run dev
```

The dashboard will automatically access Scopus API through the campus IP-based subscription.

## 🌟 Features

### Header
- **Institution Branding**: IIT Hyderabad logo that links to the library website
- **Knowledge Resource Center** branding with professional design
- **Responsive layout** that adapts to different screen sizes

### Key Metrics Dashboard
- **Total Publications**: Complete count of research output
- **Total Citations**: Aggregate citation metrics
- **H-Index**: Research impact measurement
- **Open Access Publications**: Count of freely accessible articles

### Research Visualization Components

1. **Latest Publications (Top 30)**
   - Real-time feed of recent publications
   - Author, journal, year, and citation information
   - Interactive scrollable list

2. **Top 10 Contributors**
   - Horizontal bar chart of most productive researchers
   - Publication count per author

3. **Research Progress by Year**
   - Bar chart showing publication trends over the last 10 years
   - Temporal analysis of research output

4. **Subject-wise Distribution**
   - Interactive pie chart showing research areas
   - Color-coded subject categories

5. **Citations by Year**
   - Annual citation trends
   - Impact analysis over time

6. **Top 10 Most Cited Publications**
   - Ranked list of highest-impact papers
   - Citation counts and metadata

7. **Publications by Type**
   - Pie chart breakdown of publication types
   - Articles, conference papers, book chapters, etc.

8. **International Collaborations**
   - Bar chart of collaborating countries
   - Global research network visualization

9. **Top 25 Publishers**
   - Horizontal bar chart of preferred publishing venues
   - Publication frequency analysis

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0
- **Charts & Visualization**: 
  - Plotly.js with React integration
  - Chart.js with React Chart.js 2
- **API Integration**: Axios for HTTP requests
- **Styling**: Custom CSS with modern design principles
- **Build Tool**: Vite 7.0.4
- **Package Manager**: npm

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Valid Scopus API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iith-scopus-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API credentials**
   - Open `src/App.jsx`
   - Update the API configuration:
     ```javascript
     const apiKey = 'YOUR_SCOPUS_API_KEY';
     const affId = '60103917'; // IIT Hyderabad
     const openAlexId = 'i65181880'; // OpenAlex ID
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

### Production Build

```bash
npm run build
npm run preview
```

## 🔐 Security Considerations

**Important**: The current implementation includes API keys in the client-side code for demonstration purposes. For production deployment:

1. **Move API calls to backend**: Create a secure backend service to handle Scopus API requests
2. **Environment variables**: Store API keys in secure environment variables
3. **API rate limiting**: Implement proper rate limiting and caching
4. **CORS configuration**: Set up appropriate CORS policies

## 📊 Data Sources

- **Primary**: Scopus API (Elsevier)
- **Institution ID**: 60103917 (IIT Hyderabad)
- **OpenAlex ID**: i65181880
- **Coverage**: Last 10 years of publication data

## 🎨 Design Features

- **Modern UI/UX**: Clean, professional interface
- **Responsive Design**: Mobile and desktop compatible
- **Interactive Elements**: Hover effects and smooth animations
- **Color Scheme**: Professional blue and complementary colors
- **Typography**: Inter font family for readability
- **Accessibility**: Proper contrast ratios and semantic HTML

## 📱 Responsive Design

The dashboard is fully responsive and works across:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile devices (320px - 767px)

## 🔄 Real-time Updates

- Data is fetched on component mount
- Loading states and error handling
- Batch processing for API efficiency
- Automatic retry mechanisms

## 📈 Analytics & Metrics

The dashboard provides insights into:
- Research productivity trends
- Citation impact analysis
- Collaboration patterns
- Subject area distribution
- Publication venue preferences
- International research partnerships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is developed for IIT Hyderabad's Knowledge Resource Center.

## 🆘 Support

For technical support or questions:
- Contact: Knowledge Resource Center, IIT Hyderabad
- Email: library@iith.ac.in
- Website: https://library.iith.ac.in

## 🔮 Future Enhancements

- Advanced filtering and search capabilities
- Export functionality for charts and data
- Integration with additional databases
- Real-time collaboration tracking
- Advanced analytics and predictions
- Multi-language support
- Dark mode theme option

---

**© Knowledge Resource Center, IIT Hyderabad**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
