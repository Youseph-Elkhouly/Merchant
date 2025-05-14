import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';
import klogo from '../assets/klogo.png';
import flogo from '../assets/flogo.png';

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

        {/* Search Section */}
        <div className="search-section">
          <div className="search-row">
            <form onSubmit={handleSearch} className="hero-search-container">
              <motion.div
                className="hero-search-wrapper"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type="text"
                  placeholder="Search for products, categories, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hero-search-input"
                  disabled={isSearching}
                />
                <button 
                  type="submit" 
                  className="hero-search-button"
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </motion.div>
            </form>
          </div>
        </div>

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