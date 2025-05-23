import React from 'react';
import { Link } from 'react-router-dom'; // Importe Link para navegação
import './HomePage.css'; // Crie este arquivo CSS para a página inicial

function HomePage() {
  return (
    <div className="homepage-container">
      <h1>Simulador de Jogos de Azar</h1>
      <p>Escolha um jogo para começar a simular:</p>

      <div className="game-options">
        <Link to="/slots" className="game-card">
          <h2>Slot Machine</h2>
          <p>Gire os rolos e teste sua sorte!</p>
        </Link>

        <Link to="/roulette" className="game-card">
          <h2>Roleta</h2>
          <p>Faça suas apostas e veja a bola girar!</p>
          <span className="coming-soon">(Em Breve)</span>
        </Link>

        <Link to="/airplane" className="game-card">
          <h2>Crash</h2>
          <p>Aposte no voo e tente sacar antes que ele caia!</p>
          <span className="coming-soon">(Em Breve)</span>
        </Link>
      </div>

      <p className="footer-note">Este projeto foi desenvolvido para fins de Trabalho de Conclusão de Curso (TCC).</p>
    </div>
  );
}

export default HomePage;