// src/pages/SlotsPage.js
import React, { useState, useRef, useEffect } from 'react';
import './SlotsPage.css';
import SlotReelWeb from '../components/SlotReelWeb';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function SlotsPage() {
  const symbols = ['cherry.png', 'lemon.png', 'bell.png', 'diamond.png', 'money.png', 'star.png'];

  const paytable = {
    0: { payout: 5, name: 'Cerejas' },
    1: { payout: 7, name: 'Limões' },
    2: { payout: 15, name: 'Sinos' },
    3: { payout: 25, name: 'Diamantes' },
    4: { payout: 50, name: 'Dinheiros' },
    5: { payout: 100, name: 'Estrelas' },
  };

  const [results, setResults] = useState([0, 0, 0]);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [message, setMessage] = useState('Pressione SPIN para jogar!');
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelHighlightType, setReelHighlightType] = useState('');
  const spinningTimeout = useRef(null);

  const [adjustAmount, setAdjustAmount] = useState('');
  const [newBetAmount, setNewBetAmount] = useState('');

  // --- ESTADOS PARA ESTATÍSTICAS ---
  const [totalSpins, setTotalSpins] = useState(0);
  const [totalMoneySpent, setTotalMoneySpent] = useState(0);
  const [totalMoneyWon, setTotalMoneyWon] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [loseCount, setLoseCount] = useState(0);

  const [balanceHistory, setBalanceHistory] = useState([
    { name: 'Início', balance: 1000, profit: 0 }
  ]);
  const [houseProfit, setHouseProfit] = useState(0);


  useEffect(() => {
    // Para iniciar o gráfico com um ponto, se o saldo inicial não for 1000
    // Ou para garantir que o 'Giro 0' seja o ponto inicial.
  }, []);

  const spin = () => {
    if (isSpinning) return;
    if (balance < betAmount) {
      setMessage('Saldo insuficiente! Adicione mais créditos para continuar.');
      return;
    }

    setReelHighlightType('');
    setIsSpinning(true);
    setBalance(prevBalance => prevBalance - betAmount);
    setTotalMoneySpent(prevSpent => prevSpent + betAmount);
    setTotalSpins(prevSpins => prevSpins + 1);

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
    let isWin = false;

    if (res1 === res2 && res2 === res3) {
      const winningSymbolIndex = res1;
      const { payout, name } = paytable[winningSymbolIndex];
      winAmount = betAmount * payout;
      winMessage = `🎉 PARABÉNS! 3 ${name}s! Você ganhou ${winAmount} créditos! 🎉`;
      highlightType = 'win';
      isWin = true;
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

    setBalance(prevBalance => {
      const currentBalanceAfterSpin = prevBalance + winAmount;
      
      setBalanceHistory(prevHistory => [
        ...prevHistory,
        { 
          name: `Giro ${totalSpins}`, 
          balance: currentBalanceAfterSpin,
          profit: totalMoneySpent + betAmount - (totalMoneyWon + winAmount)
        }
      ]);
      return currentBalanceAfterSpin;
    });

    setMessage(winMessage);
    setReelHighlightType(highlightType);

    setTotalMoneyWon(prevWon => prevWon + winAmount);
    if (isWin) {
      setWinCount(prevCount => prevCount + 1);
    } else {
      setLoseCount(prevCount => prevCount + 1);
    }

    setHouseProfit(prevProfit => prevProfit + (betAmount - winAmount));
  };

  const handleAdjustBalance = () => {
    const amount = parseInt(adjustAmount);
    if (!isNaN(amount)) {
      setBalance(prevBalance => {
        const newBalance = prevBalance + amount;
        setBalanceHistory(prevHistory => {
          const lastProfit = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].profit : 0;
          return [
            ...prevHistory,
            { name: `Ajuste (${amount > 0 ? '+' : ''}${amount})`, balance: newBalance, profit: lastProfit }
          ];
        });
        return newBalance;
      });
      setMessage(`${amount >= 0 ? 'Adicionado' : 'Removido'} ${Math.abs(amount)} créditos.`);
      setAdjustAmount('');
      setReelHighlightType('');
    } else {
      setMessage('Digite um valor numérico para ajustar o saldo.');
    }
  };

  const handleSetBetAmount = () => {
    const amount = parseInt(newBetAmount);
    if (!isNaN(amount) && amount > 0) {
      setBetAmount(amount);
      setMessage(`Aposta definida para ${amount} créditos.`);
      setNewBetAmount('');
    } else {
      setMessage('Digite um valor de aposta válido (maior que zero).');
    }
  };

  const winRate = totalSpins > 0 ? ((winCount / totalSpins) * 100).toFixed(2) : 0;
  const netProfitPlayer = totalMoneyWon - totalMoneySpent;
  const houseEdge = totalMoneySpent > 0 ? ((houseProfit / totalMoneySpent) * 100).toFixed(2) : 0;
  
  // NOVO: Cálculo da porcentagem de derrotas
  const lossRate = totalSpins > 0 ? ((loseCount / totalSpins) * 100).toFixed(2) : 0;


  const pieChartData = [
    { name: 'Vitórias', value: winCount, color: '#00C49F' },
    { name: 'Derrotas', value: loseCount, color: '#FF8042' },
  ];

  const COLORS = ['#00C49F', '#FF8042'];


  return (
    <div className="slots-page-container">
      <div className="main-game-layout">
        {/* COLUNA ESQUERDA: Tabela de Pagamento */}
        <div className="left-column">
          <div className="paytable">
            <h2 className="section-main-title">Tabela de Pagamento</h2>
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

        {/* COLUNA DO MEIO: O Jogo de Slot */}
        <div className="center-column">
          <div className="slot-machine-content">
            <h2 className="section-main-title">Simulador de Slot</h2>

            <div className="slots-display">
              <SlotReelWeb symbols={symbols} finalValueIndex={results[0]} isSpinning={isSpinning} highlightType={reelHighlightType} />
              <SlotReelWeb symbols={symbols} finalValueIndex={results[1]} isSpinning={isSpinning} highlightType={reelHighlightType} />
              <SlotReelWeb symbols={symbols} finalValueIndex={results[2]} isSpinning={isSpinning} highlightType={reelHighlightType} />
            </div>

            <div className="info-panel">
              <p className="balance">Saldo: ${balance}</p>
              <p className="bet">Aposta: ${betAmount}</p>
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
          </div>
        </div>

        {/* COLUNA DIREITA: Estatísticas e Gráficos */}
        <div className="right-column">
          <div className="statistics-panel">
            <h2 className="section-main-title">Estatísticas do Jogo</h2>
            {/* Bloco para Resumo de Estatísticas */}
            <div className="stats-block">
                <h3>Resumo</h3>
                <div className="stats-summary">
                    <p><strong>Giros Totais:</strong> {totalSpins}</p>
                    <p><strong>Dinheiro Gasto:</strong> ${totalMoneySpent}</p>
                    <p><strong>Dinheiro Ganho:</strong> ${totalMoneyWon}</p>
                    <p><strong>Lucro Líquido (Jogador):</strong> ${netProfitPlayer}</p>
                    <p><strong>Taxa de Vitória:</strong> {winRate}%</p>
                    <p><strong>Lucro da Casa:</strong> ${houseProfit}</p>
                    <p><strong>Margem da Casa:</strong> {houseEdge}%</p>
                </div>
            </div>

            {/* Bloco para Histórico de Saldo */}
            <div className="stats-block">
                <h3>Histórico de Saldo e Lucro da Casa</h3>
                <div className="charts-container">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={balanceHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#ccc" tick={{ fontSize: 10 }} /> 
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                            <Legend wrapperStyle={{ color: '#fff' }} />
                            <Line type="monotone" dataKey="balance" stroke="#00C49F" name="Saldo" dot={false} />
                            <Line type="monotone" dataKey="profit" stroke="#FFBB28" name="Lucro/Prejuízo Casa" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bloco para Vitórias vs Derrotas */}
            <div className="stats-block">
                <h3>Vitórias vs Derrotas</h3>
                <div className="charts-container">
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                labelLine={false}
                                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                            >
                                {
                                    pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))
                                }
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                            <Legend wrapperStyle={{ color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* NOVO: Porcentagem de Derrotas abaixo do gráfico */}
                <p className="loss-percentage">Porcentagem de Derrotas: <strong>{lossRate}%</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlotsPage;