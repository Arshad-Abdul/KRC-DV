import React from 'react';
import Dashboard from './Dashboard.jsx';
import ScopusDashboard from './ScopusDashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './Dashboard.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scopus-dashboard" element={<ScopusDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
