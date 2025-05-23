// src/pages/SlotsPage.js
import React, { useState, useRef } from 'react';
import './SlotsPage.css'; // Estilos específicos da página de slots
import SlotReelWeb from '../components/SlotReelWeb'; // Importe o componente SlotReelWeb

function SlotsPage() {
  // Símbolos - nomes de arquivo na pasta public/images/symbols/
  const symbols = ['cherry.png', 'lemon.png', 'bell.png', 'diamond.png', 'money.png', 'star.png'];

  // Tabela de Pagamentos (baseada na sua imagem)
  const paytable = {
    0: { payout: 5, name: 'Cerejas' },
    1: { payout: 7, name: 'Limões' },
    2: { payout: 15, name: 'Sinos' },
    3: { payout: 25, name: 'Diamantes' },
    4: { payout: 50, name: 'Dinheiros' },
    5: { payout: 100, name: 'Estrelas' },
  };

  const [results, setResults] = useState([0, 0, 0]);
  const [balance, setBalance] = useState(1000); // Saldo inicial maior para testes
  const [betAmount, setBetAmount] = useState(10); // Agora a aposta também é um estado!
  const [message, setMessage] = useState('Pressione SPIN para jogar!');
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelHighlightType, setReelHighlightType] = useState('');
  const spinningTimeout = useRef(null);

  const [adjustAmount, setAdjustAmount] = useState('');
  // NOVO ESTADO: Para o input de ajuste de aposta
  const [newBetAmount, setNewBetAmount] = useState('');

  const spin = () => {
    if (isSpinning) {
      return;
    }
    if (balance < betAmount) {
      setMessage('Saldo insuficiente! Adicione mais créditos para continuar.');
      return;
    }

    setReelHighlightType('');
    setIsSpinning(true);
    setBalance(prevBalance => prevBalance - betAmount);
    setMessage('Girando...');

    const newResults = [
      Math.floor(Math.random() * symbols.length),
      Math.floor(Math.random() * symbols.length),
      Math.floor(Math.random() * symbols.length),
    ];

    setResults(newResults);

    clearTimeout(spinningTimeout.current);
    spinningTimeout.current = setTimeout(() => {
      checkWin(newResults[0], newResults[1], newResults[2]);
      setIsSpinning(false);
    }, 2500);
  };

  const checkWin = (res1, res2, res3) => {
    let winAmount = 0;
    let winMessage = 'Você perdeu! Tente novamente.';
    let highlightType = 'lose';

    if (res1 === res2 && res2 === res3) {
      const winningSymbolIndex = res1;
      const { payout, name } = paytable[winningSymbolIndex];
      winAmount = betAmount * payout; 
      winMessage = `🎉 PARABÉNS! 3 ${name}s! Você ganhou ${winAmount} créditos! 🎉`;
      highlightType = 'win';
    } else {
      if (
        (res1 === res2 && res1 !== res3) ||
        (res1 === res3 && res1 !== res2) ||
        (res2 === res3 && res2 !== res1)
      ) {
        winMessage = 'Quase lá... Tente novamente!';
        highlightType = 'lose';
      }
    }

    setBalance(prevBalance => prevBalance + winAmount);
    setMessage(winMessage);
    setReelHighlightType(highlightType);
  };

  const handleAdjustBalance = () => {
    const amount = parseInt(adjustAmount);
    if (!isNaN(amount)) {
      setBalance(prevBalance => prevBalance + amount);
      setMessage(`${amount >= 0 ? 'Adicionado' : 'Removido'} ${Math.abs(amount)} créditos.`);
      setAdjustAmount('');
      setReelHighlightType('');
    } else {
      setMessage('Digite um valor numérico para ajustar o saldo.');
    }
  };

  // NOVO: Função para ajustar a aposta
  const handleSetBetAmount = () => {
    const amount = parseInt(newBetAmount);
    if (!isNaN(amount) && amount > 0) {
      setBetAmount(amount);
      setMessage(`Aposta definida para ${amount} créditos.`);
      setNewBetAmount(''); // Limpa o input
    } else {
      setMessage('Digite um valor de aposta válido (maior que zero).');
    }
  };

  return (
    <div className="slots-page-container">
      <div className="slot-machine-content">
        <h1>Simulador de Slots</h1>

        <div className="slots-display">
          <SlotReelWeb symbols={symbols} finalValueIndex={results[0]} isSpinning={isSpinning} highlightType={reelHighlightType} />
          <SlotReelWeb symbols={symbols} finalValueIndex={results[1]} isSpinning={isSpinning} highlightType={reelHighlightType} />
          <SlotReelWeb symbols={symbols} finalValueIndex={results[2]} isSpinning={isSpinning} highlightType={reelHighlightType} />
        </div>

        <div className="info-panel">
          <p className="balance">Saldo: ${balance}</p>
          <p className="bet">Aposta: ${betAmount}</p> {/* Exibe o betAmount atual */}
          <p className={`message ${reelHighlightType === 'win' ? 'win-text' : reelHighlightType === 'lose' ? 'lose-text' : ''}`}>
            {message}
          </p>
        </div>

        <div className="controls">
          <button
            className="spin-button"
            onClick={spin}
            disabled={isSpinning || balance < betAmount}
          >
            {isSpinning ? 'GIRANDO...' : 'SPIN'}
          </button>
          
          {/* Painel de ajuste de saldo */}
          <div className="adjust-balance-panel">
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="Ajustar saldo (+/-)"
              className="adjust-input"
            />
            <button onClick={handleAdjustBalance} className="adjust-button">
              Saldo
            </button>
          </div>

          {/* NOVO: Painel de ajuste de aposta */}
          <div className="adjust-bet-panel">
            <input
              type="number"
              value={newBetAmount}
              onChange={(e) => setNewBetAmount(e.target.value)}
              placeholder="Definir aposta"
              className="adjust-input"
            />
            <button onClick={handleSetBetAmount} className="adjust-button">
              Aposta
            </button>
          </div>
        </div>

        <div className="paytable">
          <h2>Tabela de Pagamento</h2>
          <div className="paytable-grid">
            {symbols.map((symbolFileName, index) => (
              <div key={symbolFileName} className="paytable-item">
                <div className="item-name">{paytable[index].name}</div>
                <div className="item-combination">
                  <img src={process.env.PUBLIC_URL + '/images/symbols/' + symbolFileName} alt="" style={{ width: '30px', height: '30px' }} />
                  <img src={process.env.PUBLIC_URL + '/images/symbols/' + symbolFileName} alt="" style={{ width: '30px', height: '30px' }} />
                  <img src={process.env.PUBLIC_URL + '/images/symbols/' + symbolFileName} alt="" style={{ width: '30px', height: '30px' }} />
                </div>
                <div className="item-payout">{paytable[index].payout}x</div>
              </div>
            ))}
          </div>

          <h3>Regras Simples:</h3>
          <ul>
            <li>Apenas 3 símbolos idênticos na mesma linha pagam.</li>
            <li>Sem linhas diagonais ou mistas (somente linha central).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SlotsPage;