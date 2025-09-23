import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="dashboard-nav">
      <Link 
        to="/" 
        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
      >
        OpenAlex Dashboard
      </Link>
      <Link 
        to="/scopus-dashboard" 
        className={`nav-link ${location.pathname === '/scopus-dashboard' ? 'active' : ''}`}
      >
        Scopus Dashboard
      </Link>
      <a 
        href="https://raiith.krc.iith.ac.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="nav-link external"
      >
        IR Repository
      </a>
      <a 
        href="https://catalogue.krc.iith.ac.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="nav-link external"
      >
        OPAC
      </a>
    </nav>
  );
};

export default Navigation;