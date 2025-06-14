// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import SlotsPage from './pages/SlotsPage';
import RoulettePage from './pages/RoulettePage';
// import CrashPage from './pages/CrashPage';
// import AboutPage from './pages/AboutPage';
// import TCCInfoPage from './pages/TCCInfoPage';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/slots" element={<SlotsPage />} />
            <Route path="/roulette" element={<RoulettePage />} />
            {/* <Route path="/airplane" element={<CrashPage />} /> */}
            {/* <Route path="/about" element={<AboutPage />} /> */}
            {/* <Route path="/tcc-info" element={<TCCInfoPage />} /> */}

            <Route path="*" element={<div><h1>404 - Página não encontrada</h1><p>Verifique o endereço.</p></div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;