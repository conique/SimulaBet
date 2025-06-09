// src/pages/SlotsPage.js
import React, { useState, useRef, useEffect } from 'react';
import './SlotsPage.css';
import SlotReelWeb from '../components/SlotReelWeb';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function SlotsPage() {
  const symbols = ['cherry.png', 'lemon.png', 'bell.png', 'diamond.png', 'money.png', 'seven.png'];

  const paytable = {
    0: { payout: 1.5, name: 'Cerejas' },
    1: { payout: 1.75, name: 'Limões' },
    2: { payout: 3, name: 'Sinos' },
    3: { payout: 5, name: 'Diamantes' },
    4: { payout: 7, name: 'Dinheiros' },
    5: { payout: 10, name: 'Setes' },
  };

  useEffect(() => {
    document.title = "Slots";
  }, []);

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
  const [winCount, setWinCount] = useState(0); // Vitórias do JOGADOR
  const [loseCount, setLoseCount] = useState(0); // Derrotas do JOGADOR (lucro da casa)

  // Inicializa o histórico com "Giro 0"
  const [balanceHistory, setBalanceHistory] = useState([
    { name: 'Giro 0', balance: 1000, profit: 0 }
  ]);
  const [houseProfit, setHouseProfit] = useState(0); // Lucro/prejuízo acumulado da casa

  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const autoSpinIntervalId = useRef(null);
  const [shouldStopAutoSpin, setShouldStopAutoSpin] = useState(false);


  useEffect(() => {
    return () => {
      if (spinningTimeout.current) {
        clearTimeout(spinningTimeout.current);
      }
      if (autoSpinIntervalId.current) {
        clearInterval(autoSpinIntervalId.current);
      }
    };
  }, []);

  const spin = () => {
    if (isSpinning) {
      setMessage('Giro anterior ainda em andamento...');
      return;
    }

    if (balance < betAmount) {
      setMessage('Saldo insuficiente! Adicione mais créditos para continuar.');
      if (isAutoSpinning) {
        stopAutoSpin(true); // true = por saldo insuficiente
      }
      return;
    }

    setReelHighlightType('');
    setIsSpinning(true);
    setBalance(prevBalance => prevBalance - betAmount);
    setTotalMoneySpent(prevSpent => prevSpent + betAmount);

    let currentSpinNumber;
    setTotalSpins(prevSpins => {
      currentSpinNumber = prevSpins + 1;
      return currentSpinNumber;
    });

    setMessage('Girando...');

    const newResults = [
      Math.floor(Math.random() * symbols.length),
      Math.floor(Math.random() * symbols.length),
      Math.floor(Math.random() * symbols.length),
    ];

    setResults(newResults);

    clearTimeout(spinningTimeout.current);
    spinningTimeout.current = setTimeout(() => {
      handleSpinResultLogic(currentSpinNumber, newResults[0], newResults[1], newResults[2]);
      setIsSpinning(false);

      // Só chama o próximo spin se não for para parar
      if (isAutoSpinning && balance >= betAmount && !shouldStopAutoSpin) {
        setTimeout(() => {
          spin();
        }, 1000);
      } else if (isAutoSpinning && balance < betAmount) {
        // Parar por saldo insuficiente
        setIsAutoSpinning(false);
        setShouldStopAutoSpin(false);
        setMessage('Auto Spin parado: saldo insuficiente para o próximo giro.');
      } else if (shouldStopAutoSpin) {
        // Parar normalmente após giro completo
        setIsAutoSpinning(false);
        setShouldStopAutoSpin(false);
        setMessage('Auto Spin Parado.');
      }
    }, 2500);
  };

  const handleSpinResultLogic = (spinNumber, res1, res2, res3) => {
    const winAmount = calculateWinAmount(res1, res2, res3);
    const profitLossThisSpin = betAmount - winAmount;

    setBalance(prevBalance => prevBalance + winAmount);
    setTotalMoneyWon(prevWon => prevWon + winAmount);
    setHouseProfit(prevProfit => prevProfit + profitLossThisSpin);

    const isWinResult = winAmount > 0;
    if (isWinResult) {
      setWinCount(prevCount => prevCount + 1);
    } else {
      setLoseCount(prevCount => prevCount + 1);
    }

    setBalanceHistory(prevHistory => {
      const lastEntry = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : { balance: 1000, profit: 0 };
      // Corrigido: saldo do histórico = saldo anterior - aposta + prêmio
      const newBalance = lastEntry.balance - betAmount + winAmount;
      return [
        ...prevHistory,
        {
          name: `Giro ${spinNumber}`,
          balance: newBalance,
          profit: lastEntry.profit + profitLossThisSpin
        }
      ];
    });

    setMessageAndHighlight(winAmount, res1, res2, res3);
  };


  // Funções auxiliares (calculateWinAmount, setMessageAndHighlight)
  const calculateWinAmount = (res1, res2, res3) => {
    if (res1 === res2 && res2 === res3) {
      const winningSymbolIndex = res1;
      const { payout } = paytable[winningSymbolIndex];
      return betAmount * payout;
    }
    return 0;
  };

  const setMessageAndHighlight = (winAmount, res1, res2, res3) => {
    let winMessage = 'Você perdeu! Tente novamente.';
    let highlightType = 'lose';

    if (winAmount > 0) {
      const winningSymbolIndex = res1;
      const { name } = paytable[winningSymbolIndex];
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
    setMessage(winMessage);
    setReelHighlightType(highlightType);
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
            { name: `Giro ${totalSpins} (Ajuste)`, balance: newBalance, profit: lastProfit }
          ];
        });
        return newBalance;
      });
      setMessage(`${amount >= 0 ? 'Adicionado' : 'Removido'} ${Math.abs(amount)} créditos.`);
      setAdjustAmount('');
      setReelHighlightType('');
      if (isAutoSpinning) stopAutoSpin();
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
      if (isAutoSpinning) stopAutoSpin();
    } else {
      setMessage('Digite um valor de aposta válido (maior que zero).');
    }
  };

  const startAutoSpin = () => {
    if (balance < betAmount) {
      setMessage('Saldo insuficiente para iniciar Auto Spin!');
      return;
    }
    if (isAutoSpinning) return;

    setIsAutoSpinning(true);
    spin();

    autoSpinIntervalId.current = setInterval(() => {
      if (!isSpinning && balance >= betAmount) {
        spin();
      } else if (balance < betAmount) {
        stopAutoSpin();
        setMessage('Auto Spin parado: saldo insuficiente.');
      }
    }, 4000);
  };

  const stopAutoSpin = (byInsufficientBalance = false) => {
    if (byInsufficientBalance) {
      setIsAutoSpinning(false);
      if (autoSpinIntervalId.current) {
        clearInterval(autoSpinIntervalId.current);
        autoSpinIntervalId.current = null;
      }
      // Não corta a animação, só para o agendamento
      setMessage('Auto Spin Parado.');
      return;
    }
    // Marca para parar após o giro atual
    setShouldStopAutoSpin(true);
    if (autoSpinIntervalId.current) {
      clearInterval(autoSpinIntervalId.current);
      autoSpinIntervalId.current = null;
    }
  };

  // --- CÁLCULOS DERIVADOS PARA EXIBIÇÃO DAS ESTATÍSTICAS ---
  const winRate = totalSpins > 0 ? ((winCount / totalSpins) * 100).toFixed(2) : 0;
  const netProfitPlayer = totalMoneyWon - totalMoneySpent;
  const houseEdge = totalMoneySpent > 0 ? ((houseProfit / totalMoneySpent) * 100).toFixed(2) : 0;
  const lossRate = totalSpins > 0 ? ((loseCount / totalSpins) * 100).toFixed(2) : 0;


  const pieChartData = [
    ...(winCount > 0 ? [{ name: 'Vitórias', value: winCount, color: '#00C49F' }] : []),
    ...(loseCount > 0 ? [{ name: 'Derrotas', value: loseCount, color: '#FF8042' }] : []),
  ];

  const COLORS = ['#00C49F', '#FF8042'];


  return (
    <div className="slots-page-container">
      <div className="main-game-layout">
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

        <div className="center-column">
          <div className="slot-machine-content">
            <h2 className="section-main-title">Simulador de Slot</h2>

            <div className="slots-display">
              <SlotReelWeb symbols={symbols} finalValueIndex={results[0]} isSpinning={isSpinning} highlightType={reelHighlightType} />
              <SlotReelWeb symbols={symbols} finalValueIndex={results[1]} isSpinning={isSpinning} highlightType={reelHighlightType} />
              <SlotReelWeb symbols={symbols} finalValueIndex={results[2]} isSpinning={isSpinning} highlightType={reelHighlightType} />
            </div>

            <div className="info-panel">
              <span className="info-text">Saldo: ${balance}</span>
              <span className="info-text">Aposta: ${betAmount}</span>
            </div>

            <p className={`messageslot ${reelHighlightType === 'win' ? 'win-text' : reelHighlightType === 'lose' ? 'lose-text' : ''}`}>
              {message}
            </p>

            <div className="controls">
              <button
                className="spin-button"
                onClick={spin}
                disabled={isSpinning || balance < betAmount || isAutoSpinning}
              >
                {isSpinning ? 'GIRANDO...' : 'SPIN'}
              </button>

              <button
                className={`auto-spin-button ${isAutoSpinning ? 'auto-spinning' : ''}`}
                onClick={isAutoSpinning ? stopAutoSpin : startAutoSpin}
                disabled={balance < betAmount}
              >
                {isAutoSpinning ? 'PARAR AUTO' : 'AUTO SPIN'}
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

        <div className="right-column">
          <div className="statistics-panel">
            <h2 className="section-main-title">Estatísticas do Jogo</h2>
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
              <p className="loss-percentage">Porcentagem de Derrotas: <strong>{lossRate}%</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlotsPage;