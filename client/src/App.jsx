import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import QuizArena from './pages/QuizArena';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <div className="app-shell">
      {/* 1. Header & Navigation: Sticky semi-opaque blurred navbar */}
      <header className="site-header">
        <div className="container header-container">
          <Link to="/" className="brand">
            <span className="brand-icon">⚡</span>
            BRAIN<span className="gradient-text">SNAP</span>
          </Link>
          
          <nav className="nav-links">
            <Link to="/" className="nav-link">
              <span className="nav-bullet">▪</span> Arena Hub
            </Link>
            <Link to="/results" className="nav-link">
              <span className="nav-bullet">▪</span> Latest Results
            </Link>
          </nav>

          <div className="header-actions">
            <Link to="/" className="btn btn-primary btn-sm">
              <span className="btn-glow-pulse"></span>
              LAUNCH CHIP
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main content routes */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:topicSlug" element={<QuizArena />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
              <div className="card" style={{ maxWidth: '500px', margin: '0 auto', border: '1.5px solid var(--secondary)' }}>
                <h2 style={{ color: 'var(--secondary)' }}>[ SYSTEM ERROR 404 ]</h2>
                <p style={{ margin: '20px 0', color: 'var(--muted)' }}>You have strayed into an unmapped node in the synapse network.</p>
                <Link to="/" className="btn btn-primary">Return to Base Sector</Link>
              </div>
            </div>
          } />
        </Routes>
      </main>

      {/* 3. Immersive Interactive Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand-column">
              <Link to="/" className="brand">
                <span>⚡</span> BRAIN<span className="gradient-text">SNAP</span>
              </Link>
              <p className="footer-tagline">
                Spark your synapses. Outrun the clock. A high-velocity cyber-arcade trivia platform where intellectual speed meets electric competition.
              </p>
              <div className="system-status">
                <span className="status-indicator-dot"></span>
                <span className="status-text">GRID STATUS: ONLINE | COGNITIVE SYNAPSE ENGAGED</span>
              </div>
            </div>

            <div className="footer-nav-column">
              <h4>System Sectors</h4>
              <ul className="footer-links-list">
                <li><Link to="/">Arena Selector</Link></li>
                <li><Link to="/results">Hall of Synapses</Link></li>
              </ul>
            </div>

            <div className="footer-nav-column">
              <h4>Active Protocols</h4>
              <ul className="footer-links-list">
                <li><span className="footer-metric">⚡ 15s</span> Rapid Countdown</li>
                <li><span className="footer-metric">🎯 100%</span> Anti-Cheat Verification</li>
                <li><span className="footer-metric">🏆 Global</span> Live Score Ledger</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p className="copyright-notice">
              &copy; {new Date().getFullYear()} BRAINSNAP Inc. All privileges allocated. Cyber-Grid Terminal v4.8.2
            </p>
            <div className="system-telemetry">
              <span>LATENCY: 14ms</span>
              <span className="divider">|</span>
              <span>SECURE PROTOCOL SHA-256</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}