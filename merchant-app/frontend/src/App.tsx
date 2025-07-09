import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import BrowseListings from './pages/BrowseListings';
import Favourites from './pages/Favourites';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import './styles/global.css';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Hide splash after 3 seconds if video doesn't end first
    const timeout = setTimeout(() => setLoading(false), 3000);
    // Prevent scrolling while splash is visible
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = '';
    };
  }, [loading]);

  const handleVideoEnd = () => setLoading(false);

  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#111',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <video
            ref={videoRef}
            src={process.env.PUBLIC_URL + '/merchantintro.mp4'}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              background: '#111',
            }}
          />
        </div>
      )}
      {!loading && (
        <Router>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/home" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/browse" element={<BrowseListings />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      )}
    </>
  );
};

export default App;
