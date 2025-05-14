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
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

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

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="Merchant" className="logo" />
          </Link>

          <div className="nav-links">
            <div className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </div>

            <div className="nav-item dropdown">
              <span className="nav-link">Categories</span>
              <div className="dropdown-content categories-dropdown">
                <div className="dropdown-section">
                  <h3>Electronics</h3>
                  <Link to="/category/laptops">Laptops</Link>
                  <Link to="/category/phones">Phones</Link>
                  <Link to="/category/cameras">Cameras</Link>
                  <Link to="/category/gaming">Gaming Consoles</Link>
                </div>
                <div className="dropdown-section">
                  <h3>Home & Appliances</h3>
                  <Link to="/category/kitchenware">Kitchenware</Link>
                  <Link to="/category/furniture">Furniture</Link>
                  <Link to="/category/decor">Home Decor</Link>
                </div>
                <div className="dropdown-section">
                  <h3>Vehicles</h3>
                  <Link to="/category/cars">Cars</Link>
                  <Link to="/category/motorcycles">Motorcycles</Link>
                  <Link to="/category/bicycles">Bicycles</Link>
                </div>
                <div className="dropdown-section">
                  <h3>Fashion</h3>
                  <Link to="/category/men">Men</Link>
                  <Link to="/category/women">Women</Link>
                  <Link to="/category/accessories">Accessories</Link>
                </div>
                <div className="dropdown-section">
                  <h3>Real Estate</h3>
                  <Link to="/category/apartments">Apartments</Link>
                  <Link to="/category/houses">Houses</Link>
                  <Link to="/category/commercial">Commercial Properties</Link>
                </div>
              </div>
            </div>

            <div className="nav-item">
              <Link to="/browse" className="nav-link">Browse Listings</Link>
            </div>

            {isAuthenticated && (
              <div className="nav-item dropdown">
                <span className="nav-link">Notifications</span>
                <div className="dropdown-content notifications-dropdown">
                  <div className="dropdown-section">
                    <h3>Alerts</h3>
                    <Link to="/notifications/price-alerts">Price Alerts</Link>
                    <Link to="/notifications/stock-alerts">Stock Alerts</Link>
                    <Link to="/notifications/deal-alerts">Deal Alerts</Link>
                  </div>
                  <div className="dropdown-section">
                    <h3>Updates</h3>
                    <Link to="/notifications/new-listings">New Listings</Link>
                    <Link to="/notifications/price-drops">Price Drops</Link>
                    <Link to="/notifications/watched-items">Watched Items</Link>
                  </div>
                  <div className="dropdown-section">
                    <h3>Settings</h3>
                    <Link to="/notifications/preferences">Notification Preferences</Link>
                    <Link to="/notifications/email-settings">Email Settings</Link>
                    <Link to="/notifications/mobile-alerts">Mobile Alerts</Link>
                  </div>
                </div>
              </div>
            )}

            <div className="nav-item">
              <Link to="/sell" className="nav-link highlight">Sell with Us</Link>
            </div>
          </div>

          <div className="nav-right">
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search">
                <i className="fas fa-search"></i>
              </button>
            </form>

            {isAuthenticated ? (
              <div className="nav-item dropdown">
                <button className="profile-button">
                  <i className="fas fa-user"></i>
                </button>
                <div className="dropdown-content profile-dropdown">
                  <div className="dropdown-section">
                    <h3>Account</h3>
                    <Link to="/profile">My Profile</Link>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/settings">Account Settings</Link>
                  </div>
                  <div className="dropdown-section">
                    <h3>My Activity</h3>
                    <Link to="/listings">My Listings</Link>
                    <Link to="/saved">Saved Items</Link>
                    <Link to="/history">Browse History</Link>
                  </div>
                  <div className="dropdown-section">
                    <h3>Help & Logout</h3>
                    <Link to="/support">Support</Link>
                    <Link to="/faq">FAQ</Link>
                    <button onClick={handleSignOut} className="signout-button">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button onClick={handleSignIn} className="nav-link auth-button signin">
                  Sign In
                </button>
                <button onClick={handleSignUp} className="nav-link auth-button signup">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};

export default Navbar;
