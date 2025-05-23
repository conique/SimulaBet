// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Importe todas as suas páginas
import HomePage from './pages/HomePage'; // Página Inicial
import SlotsPage from './pages/SlotsPage'; // Página do Simulador de Slots
// import RoulettePage from './pages/RoulettePage'; // Futura página de Roleta
// import AirplanePage from './pages/AirplanePage'; // Futura página de Aviãozinho
// import AboutPage from './pages/AboutPage'; // Página Sobre
// import TCCInfoPage from './pages/TCCInfoPage'; // Página TCC

import './App.css'; // Estilos gerais para o layout

function App() {
  return (
    <Router>
      <div className="app-layout-container">
        <Header /> {/* O Header está fora das rotas para ser fixo */}

        <main className="main-content"> {/* Aqui as páginas serão renderizadas */}
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* Rota raiz: mostra a HomePage */}
            <Route path="/slots" element={<SlotsPage />} /> {/* Rota para o Simulador de Slots */}
            {/* Adicione as rotas para suas futuras páginas aqui */}
            {/* <Route path="/roulette" element={<RoulettePage />} /> */}
            {/* <Route path="/airplane" element={<AirplanePage />} /> */}
            {/* <Route path="/about" element={<AboutPage />} /> */}
            {/* <Route path="/tcc-info" element={<TCCInfoPage />} /> */}

            {/* Opcional: Rota para páginas não encontradas (404) */}
            <Route path="*" element={<div><h1>404 - Página não encontrada</h1><p>Verifique o endereço.</p></div>} />
          </Routes>
        </main>

        <Footer /> {/* O Footer também está fora das rotas para ser fixo */}
      </div>
    </Router>
  );
}

export default App;