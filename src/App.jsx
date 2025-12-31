import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardCacheProvider } from './contexts/DashboardCacheContext';

import ScopusDashboard from './pages/Scopus/ScopusDashboard.jsx';
import OpenAlexDashboard from './pages/OpenAlex/OpenAlexDashboard.jsx';
import InstituteStats from './pages/InstituteStats/InstituteStats.jsx';
import Header from './components/header/header.jsx';
import { Footer } from './components/footer/footer.jsx';

function App() {
  return (
    <DashboardCacheProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<OpenAlexDashboard />} />
          <Route path="/scopus-dashboard" element={<ScopusDashboard />} />
          <Route path="/institute-stats" element={<InstituteStats />} />
        </Routes>
      </Router>
      <Footer />
    </DashboardCacheProvider>
  );
}

export default App;
