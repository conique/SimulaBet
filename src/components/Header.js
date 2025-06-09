// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="main-header">
      <div className="logo-container">
        <Link to="/">
          <img src={process.env.PUBLIC_URL + '/images/simulabet_logo.svg'} alt="Simulabet Logo" className="header-logo" />
        </Link>
      </div>
      <nav>
        <ul className="main-nav-list">
          <li className="main-nav-item"><Link to="/" className="main-nav-link">INÍCIO</Link></li>
          <li className="main-nav-item"><Link to="/about" className="main-nav-link">SOBRE</Link></li>
          <li className="main-nav-item"><Link to="/tcc-info" className="main-nav-link">TCC</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;