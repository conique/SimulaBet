import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="homepage-container">
      <h1>Simulador de Jogos de Azar</h1>
      <p>Escolha um jogo para começar a simular:</p>

      <div className="game-options">
        <Link to="/slots" className="game-card">
          <img src="/images/banners/slots-banner.png" alt="Slots Banner" className="game-banner" />
          <div className="game-card-content">
            <h2>Slot Machine</h2>
            <p>Gire os rolos e teste sua sorte!</p>
          </div>
        </Link>

        <Link to="/roulette" className="game-card">
          <img src="/images/banners/roulette-banner.png" alt="Roleta Banner" className="game-banner" />
          <div className="game-card-content">
            <h2>Roleta Americana</h2>
            <p>Faça suas apostas e veja a bola girar!</p>
          </div>
        </Link>

        <Link to="/crash" className="game-card">
          <img src="/images/banners/crash-banner.png" alt="Crash Banner" className="game-banner" />
          <div className="game-card-content">
            <h2>Crash</h2>
            <p>Tente sacar antes que o foguete caia!</p>
          </div>
        </Link>
      </div>

      <p className="footer-note">Este projeto foi desenvolvido para fins de Trabalho de Conclusão de Curso (TCC).</p>
    </div>
  );
}

export default HomePage;