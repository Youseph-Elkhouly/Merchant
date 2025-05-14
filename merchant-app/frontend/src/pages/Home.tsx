import React, { useEffect, useState } from 'react';
import ListingCard from '../components/ListingCard';
import ApiService, { Listing } from '../services/ApiService';
import '../styles/Home.css';

const Home: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await ApiService.getListings();
        setListings(data);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              <span>Capture</span>
              <span>meaningful</span>
              <span>moments</span>
            </h1>
            <p>
              Discover our collection of premium cameras, printers, and
              accessories. Create lasting memories with professional-grade
              equipment.
            </p>
            <form className="email-form">
              <input
                type="email"
                placeholder="Enter email to get a promo code"
                aria-label="Email for promo code"
              />
              <button type="submit">Send</button>
            </form>
          </div>
          <div className="hero-image">
            <img src="/hero-camera.jpg" alt="Professional camera" />
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="section-header">
          <h2>Featured Products</h2>
          <button className="view-all">View All</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                title={listing.title}
                description={listing.description}
                price={listing.price}
                image={listing.image}
                merchant={listing.merchant}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
