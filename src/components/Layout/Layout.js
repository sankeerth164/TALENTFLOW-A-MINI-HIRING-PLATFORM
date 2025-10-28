import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { seedDatabase } from '../../data/seed';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Seed database on app start
    seedDatabase();
  }, []);

  const navigation = [
    { path: '/jobs', label: 'Jobs' },
    { path: '/candidates', label: 'Candidates' },
    { path: '/assessments', label: 'Assessments' },
  ];

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <span className="logo-text">TalentFlow</span>
            </Link>
            {/* Dev reseed button removed per request */}
            <nav className="nav">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${
                    location.pathname.startsWith(item.path) ? 'active' : ''
                  }`}
                >
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
