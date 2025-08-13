import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GenG. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 