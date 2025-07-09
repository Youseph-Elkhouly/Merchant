import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';
import klogo from '../assets/klogo.png';
import flogo from '../assets/flogo.png';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Alert } from '@mui/material';

const headingTexts = [
  "Find the Best Deals Across All Marketplaces",
  "Discover Local & Global Listings Instantly",
  "Search. Discover. Save. All in One Place."
];

const floatingIcons = [
  { icon: '📱', delay: 0 },
  { icon: '💻', delay: 0.5 },
  { icon: '🚗', delay: 1 },
  { icon: '🛋️', delay: 1.5 },
  { icon: '📷', delay: 2 },
  { icon: '🏠', delay: 2.5 },
];

const platforms = [
  { 
    name: 'Kijiji',
    url: 'https://www.kijiji.ca',
    logo: klogo
  },
  { 
    name: 'Facebook Marketplace',
    url: 'https://www.facebook.com/marketplace',
    logo: flogo
  }
];

const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % headingTexts.length);
    }, 5000); // Increased to 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 800));
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      } finally {
        setIsSearching(false);
      }
    }
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
    <div className="hero-container">
      {/* Background Animation */}
      <div className="floating-background">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="floating-icon"
            initial={{ y: 0 }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 6,
              delay: item.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      <div className="hero-content">
        {/* Animated Heading */}
        <AnimatePresence mode='wait'>
          <motion.h1
            key={currentTextIndex}
            className="hero-heading"
            initial={{ opacity: 0, x: -100 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              transition: {
                duration: 1.2,
                ease: "easeOut",
                x: { type: "spring", stiffness: 100 }
              }
            }}
            exit={{ 
              opacity: 0, 
              x: 100,
              transition: {
                duration: 0.8,
                ease: "easeIn"
              }
            }}
          >
            {headingTexts[currentTextIndex]}
          </motion.h1>
        </AnimatePresence>

        {/* Scrape Section */}
        <div className="search-section">
          <div className="search-row">
            <div className="hero-search-container">
              <motion.div
                className="hero-search-wrapper"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <button
                  type="button"
                  className="hero-search-button"
                  onClick={() => setShowScrapeModal(true)}
                  style={{ width: '100%' }}
                >
                  Scrape Listings
                </button>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Scrape Modal */}
        <Dialog 
          open={showScrapeModal} 
          onClose={() => setShowScrapeModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#262626', color: '#ffffff' }}>
            🕷️ Scrape New Listings
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#262626', pt: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextField
                select
                label="Platform"
                value={scrapeParams.platform}
                onChange={e => setScrapeParams(prev => ({ ...prev, platform: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF4500' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              >
                <MenuItem value="facebook">Facebook Marketplace</MenuItem>
                <MenuItem value="kijiji">Kijiji</MenuItem>
              </TextField>
              <TextField
                select
                label="City"
                value={scrapeParams.city}
                onChange={(e) => setScrapeParams(prev => ({ ...prev, city: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF4500' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              >
                <MenuItem value="Toronto">Toronto</MenuItem>
                <MenuItem value="Vancouver">Vancouver</MenuItem>
                <MenuItem value="Montreal">Montreal</MenuItem>
                <MenuItem value="Calgary">Calgary</MenuItem>
                <MenuItem value="Edmonton">Edmonton</MenuItem>
                <MenuItem value="Ottawa">Ottawa</MenuItem>
                <MenuItem value="New York">New York</MenuItem>
                <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                <MenuItem value="Chicago">Chicago</MenuItem>
                <MenuItem value="Miami">Miami</MenuItem>
              </TextField>
              <TextField
                label="Search Query"
                value={scrapeParams.query}
                onChange={(e) => setScrapeParams(prev => ({ ...prev, query: e.target.value }))}
                placeholder="e.g., laptop, phone, car"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF4500' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
              <TextField
                label="Max Price ($)"
                type="number"
                value={scrapeParams.maxPrice}
                onChange={(e) => setScrapeParams(prev => ({ ...prev, maxPrice: e.target.value === '' ? '' : parseInt(e.target.value) || 0 }))}
                placeholder="Enter any amount"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF4500' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
              {scrapeParams.platform === 'facebook' && (
                <>
                  <TextField
                    label="Facebook Email"
                    type="email"
                    value={scrapeParams.email}
                    onChange={(e) => setScrapeParams(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your Facebook email"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.5)' },
                        '&.Mui-focused fieldset': { borderColor: '#FF4500' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                  />
                  <TextField
                    label="Facebook Password"
                    type="password"
                    value={scrapeParams.password}
                    onChange={(e) => setScrapeParams(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your Facebook password"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.5)' },
                        '&.Mui-focused fieldset': { borderColor: '#FF4500' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                  />
                </>
              )}
              {scrapingStatus === 'success' && (
                <Alert severity="success">
                  ✅ Scraping completed! Listings updated.
                </Alert>
              )}
              {scrapingStatus === 'error' && (
                <Alert severity="error">
                  ❌ Scraping failed. Please try again.
                </Alert>
              )}
            </div>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#262626', p: 2 }}>
            <Button 
              onClick={() => setShowScrapeModal(false)}
              disabled={scrapingStatus === 'scraping'}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleScrape}
              disabled={scrapingStatus === 'scraping' || (!scrapeParams.email && scrapeParams.platform === 'facebook')}
              variant="contained"
              sx={{
                bgcolor: '#FF4500',
                '&:hover': { bgcolor: '#ff5722' },
                '&:disabled': { bgcolor: 'rgba(255, 69, 0, 0.5)' },
              }}
            >
              {scrapingStatus === 'scraping' ? '🕷️ Scraping...' : 'Start Scraping'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Platform Logos */}
        <div className="platform-slider-container">
          <p className="powered-by">Powered by</p>
          <div className="platform-logos">
            {platforms.map((platform, index) => (
              <motion.a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="platform-logo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src={platform.logo}
                  alt={platform.name}
                  className="platform-img"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;