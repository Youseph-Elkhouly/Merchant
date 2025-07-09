import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import AuthModal from './Auth/AuthModal';
import '../styles/Navbar.css';
import logo from '../assets/LOGOT.png';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'scraping' | 'success' | 'error'>('idle');
  const [scrapeParams, setScrapeParams] = useState({
    platform: 'facebook',
    city: 'Toronto',
    query: 'laptop',
    maxPrice: 1000 as number | string,
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  // Add this effect to update auth state when modal closes
  useEffect(() => {
    if (!showAuthModal) {
      setIsAuthenticated(AuthService.isAuthenticated());
    }
  }, [showAuthModal]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignOut = () => {
    AuthService.signOut();
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleScrape = async () => {
    setScrapingStatus('scraping');
    try {
      const body: any = {
        platform: scrapeParams.platform,
        city: scrapeParams.city,
        query: scrapeParams.query,
        max_price: typeof scrapeParams.maxPrice === 'string' ? 0 : scrapeParams.maxPrice,
      };
      if (scrapeParams.platform === 'facebook') {
        if (!scrapeParams.email || !scrapeParams.password) {
          alert('Please provide both Facebook email and password to scrape Facebook listings.');
          setScrapingStatus('idle');
          return;
        }
        body.email = scrapeParams.email;
        body.password = scrapeParams.password;
      }
      const response = await fetch('http://127.0.0.1:5001/api/listings/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setScrapingStatus('success');
        setTimeout(() => {
          setShowScrapeModal(false);
          setScrapingStatus('idle');
          setScrapeParams(prev => ({ ...prev, email: '', password: '' }));
          navigate('/browse');
        }, 2000);
      } else {
        throw new Error('Scraping failed');
      }
    } catch (error) {
      setScrapingStatus('error');
      setTimeout(() => setScrapingStatus('idle'), 3000);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="Merchant" className="logo" />
          </Link>

          {/* Hamburger icon for mobile */}
          <button
            className={`hamburger${mobileMenuOpen ? ' open' : ''}`}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
          {/* Overlay for mobile menu */}
          <div className={`mobile-menu-overlay${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

          <div className={`nav-links${mobileMenuOpen ? ' open' : ''}`}>
            <div className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </div>
            <div className="nav-item">
              <button 
                className="nav-link scrape-button"
                onClick={() => { setShowScrapeModal(true); setMobileMenuOpen(false); }}
                disabled={scrapingStatus === 'scraping'}
              >
                {scrapingStatus === 'scraping' ? 'Scraping...' : 'Scrape Listings'}
              </button>
            </div>
            <div className="nav-item">
              <Link to="/browse" className="nav-link highlight" onClick={() => setMobileMenuOpen(false)}>Browse Listings</Link>
            </div>
            <div className="nav-item">
              <Link to="/favourites" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Favourites</Link>
            </div>
          </div>

          <div className="nav-right">
            {isAuthenticated ? (
              <button onClick={handleSignOut} className="signout-button">
                Sign Out
              </button>
            ) :
              <div className="auth-buttons">
                <button onClick={handleSignIn} className="nav-link auth-button signin">
                  Sign In
                </button>
                <button onClick={handleSignUp} className="nav-link auth-button signup">
                  Sign Up
                </button>
              </div>
            }
          </div>
        </div>
      </nav>

      {/* Scrape Modal */}
      {showScrapeModal && (
        <div className="modal-overlay" onClick={() => setShowScrapeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Scrape New Listings</h3>
              <button 
                className="modal-close"
                onClick={() => setShowScrapeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Platform:</label>
                <select
                  value={scrapeParams.platform}
                  onChange={e => setScrapeParams(prev => ({ ...prev, platform: e.target.value }))}
                >
                  <option value="facebook">Facebook Marketplace</option>
                  <option value="kijiji">Kijiji</option>
                </select>
              </div>
              <div className="form-group">
                <label>City:</label>
                <select 
                  value={scrapeParams.city}
                  onChange={(e) => setScrapeParams(prev => ({ ...prev, city: e.target.value }))}
                >
                  <option value="Toronto">Toronto</option>
                  <option value="Vancouver">Vancouver</option>
                  <option value="Montreal">Montreal</option>
                  <option value="Calgary">Calgary</option>
                  <option value="Edmonton">Edmonton</option>
                  <option value="Ottawa">Ottawa</option>
                  <option value="New York">New York</option>
                  <option value="Los Angeles">Los Angeles</option>
                  <option value="Chicago">Chicago</option>
                  <option value="Miami">Miami</option>
                </select>
              </div>
              <div className="form-group">
                <label>Search Query:</label>
                <input
                  type="text"
                  value={scrapeParams.query}
                  onChange={(e) => setScrapeParams(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="e.g., laptop, phone, car"
                />
              </div>
              <div className="form-group">
                <label>Max Price ($):</label>
                <input
                  type="number"
                  value={scrapeParams.maxPrice}
                  onChange={(e) => setScrapeParams(prev => ({ ...prev, maxPrice: e.target.value === '' ? '' : parseInt(e.target.value) || 0 }))}
                  placeholder="Enter any amount"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>
              {scrapeParams.platform === 'facebook' && (
                <>
                  <div className="form-group">
                    <label>Facebook Email:</label>
                    <input
                      type="email"
                      value={scrapeParams.email}
                      onChange={(e) => setScrapeParams(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your Facebook email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Facebook Password:</label>
                    <input
                      type="password"
                      value={scrapeParams.password}
                      onChange={(e) => setScrapeParams(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your Facebook password"
                      required
                    />
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleScrape}
                  disabled={scrapingStatus === 'scraping' || (!scrapeParams.email || !scrapeParams.password) && scrapeParams.platform === 'facebook'}
                >
                  {scrapingStatus === 'scraping' ? '🕷️ Scraping...' : 'Start Scraping'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowScrapeModal(false)}
                  disabled={scrapingStatus === 'scraping'}
                >
                  Cancel
                </button>
              </div>
              {scrapingStatus === 'success' && (
                <div className="success-message">
                  ✅ Scraping completed! Redirecting to browse page...
                </div>
              )}
              {scrapingStatus === 'error' && (
                <div className="error-message">
                  ❌ Scraping failed. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};

export default Navbar;
