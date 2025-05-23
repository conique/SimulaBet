import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="main-footer">
      <p>&copy; {currentYear} TCC de Pedro H. Alves Vieira</p>
    </footer>
  );
}

export default Footer;