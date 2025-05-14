import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import BrowseListings from './pages/BrowseListings';
import SellWithUs from './pages/SellWithUs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import './styles/global.css';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/browse" element={<BrowseListings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/sell" element={<SellWithUs />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
