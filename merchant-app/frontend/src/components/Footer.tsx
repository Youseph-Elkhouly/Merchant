import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul>
            <li>Email: work.youseph@gmail.com</li>
            <li>Phone: 647-554-1348</li>
            <li>Address: Toronto, ON, Canada</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Merchant App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
