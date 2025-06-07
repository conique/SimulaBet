// src/pages/RoulettePage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Wheel from '../components/Wheel';
import BettingTable from '../components/BettingTable';
import './RoulettePage.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ROULETTE_NUMBERS_DATA = [
  { val: '0', color: 'green', column: null, dozen: null, half: null, isEven: null, row: 0 },
  { val: '00', color: 'green', column: null, dozen: null, half: null, isEven: null, row: 0 },
  { val: '1', color: 'red', column: 1, dozen: 1, half: '1-18', isEven: false, row: 1 }, { val: '2', color: 'black', column: 2, dozen: 1, half: '1-18', isEven: true, row: 1 }, { val: '3', color: 'red', column: 3, dozen: 1, half: '1-18', isEven: false, row: 1 },
  { val: '4', color: 'black', column: 1, dozen: 1, half: '1-18', isEven: true, row: 2 }, { val: '5', color: 'red', column: 2, dozen: 1, half: '1-18', isEven: false, row: 2 }, { val: '6', color: 'black', column: 3, dozen: 1, half: '1-18', isEven: true, row: 2 },
  { val: '7', color: 'red', column: 1, dozen: 1, half: '1-18', isEven: false, row: 3 }, { val: '8', color: 'black', column: 2, dozen: 1, half: '1-18', isEven: true, row: 3 }, { val: '9', color: 'red', column: 3, dozen: 1, half: '1-18', isEven: false, row: 3 },
  { val: '10', color: 'black', column: 1, dozen: 1, half: '1-18', isEven: true, row: 4 }, { val: '11', color: 'black', column: 2, dozen: 1, half: '1-18', isEven: false, row: 4 }, { val: '12', color: 'red', column: 3, dozen: 1, half: '1-18', isEven: true, row: 4 },
  { val: '13', color: 'black', column: 1, dozen: 2, half: '1-18', isEven: false, row: 5 }, { val: '14', color: 'red', column: 2, dozen: 2, half: '1-18', isEven: true, row: 5 }, { val: '15', color: 'black', column: 3, dozen: 2, half: '1-18', isEven: false, row: 5 },
  { val: '16', color: 'red', column: 1, dozen: 2, half: '1-18', isEven: true, row: 6 }, { val: '17', color: 'black', column: 2, dozen: 2, half: '1-18', isEven: false, row: 6 }, { val: '18', color: 'red', column: 3, dozen: 2, half: '1-18', isEven: true, row: 6 },
  { val: '19', color: 'red', column: 1, dozen: 2, half: '19-36', isEven: false, row: 7 }, { val: '20', color: 'black', column: 2, dozen: 2, half: '19-36', isEven: true, row: 7 }, { val: '21', color: 'red', column: 3, dozen: 2, half: '19-36', isEven: false, row: 7 },
  { val: '22', color: 'black', column: 1, dozen: 2, half: '19-36', isEven: true, row: 8 }, { val: '23', color: 'red', column: 2, dozen: 2, half: '19-36', isEven: false, row: 8 }, { val: '24', color: 'black', column: 3, dozen: 2, half: '19-36', isEven: true, row: 8 },
  { val: '25', color: 'red', column: 1, dozen: 3, half: '19-36', isEven: false, row: 9 }, { val: '26', color: 'black', column: 2, dozen: 3, half: '19-36', isEven: true, row: 9 }, { val: '27', color: 'red', column: 3, dozen: 3, half: '19-36', isEven: false, row: 9 },
  { val: '28', color: 'black', column: 1, dozen: 3, half: '19-36', isEven: true, row: 10 }, { val: '29', color: 'black', column: 2, dozen: 3, half: '19-36', isEven: false, row: 10 }, { val: '30', color: 'red', column: 3, dozen: 3, half: '19-36', isEven: true, row: 10 },
  { val: '31', color: 'black', column: 1, dozen: 3, half: '19-36', isEven: false, row: 11 }, { val: '32', color: 'red', column: 2, dozen: 3, half: '19-36', isEven: true, row: 11 }, { val: '33', color: 'black', column: 3, dozen: 3, half: '19-36', isEven: false, row: 11 },
  { val: '34', color: 'red', column: 1, dozen: 3, half: '19-36', isEven: true, row: 12 }, { val: '35', color: 'black', column: 2, dozen: 3, half: '19-36', isEven: false, row: 12 }, { val: '36', color: 'red', column: 3, dozen: 3, half: '19-36', isEven: true, row: 12 },
];
const PAYOUTS = {
  'straight': 35, 'split': 17, 'street': 11, 'corner': 8, 'sixline': 5,
  'column': 2, 'dozen': 2, 'red': 1, 'black': 1, 'even': 1, 'odd': 1,
  '1-18': 1, '19-36': 1,
};
const CHIP_VALUES = [1, 5, 25, 100];
const SPIN_DURATION = 4000;
const STANDARD_AMERICAN_WHEEL_ORDER = [
  '0', '28', '9', '26', '30', '11', '7', '20', '32', '17', '5', '22', '34',
  '15', '3', '24', '36', '13', '1', '00', '27', '10', '25', '29', '12',
  '8', '19', '31', '18', '6', '21', '33', '16', '4', '23', '35', '14', '2'
];
const WHEEL_NUMBER_COLORS = ROULETTE_NUMBERS_DATA.reduce((acc, num) => {
  acc[num.val] = num.color;
  return acc;
}, {});

const MAX_BET_PER_TYPE = {
  'straight': 50, 'color': 500, 'evenodd': 500, 'half': 500,
  'dozen': 250, 'column': 250,
};
const DEFAULT_MAX_BET_SPOT = 50;
const MAX_TOTAL_TABLE_BET = 2000;
const MIN_TOTAL_TABLE_BET = 5;

function RoulettePage() {
  const [balance, setBalance] = useState(1000);
  const [selectedChip, setSelectedChip] = useState(CHIP_VALUES[0]);
  const [currentBets, setCurrentBets] = useState({});
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [winningNumberData, setWinningNumberData] = useState(null);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState('Selecione uma ficha e faça suas apostas!');
  const [adjustAmountInput, setAdjustAmountInput] = useState('');
  const [newChipValueInput, setNewChipValueInput] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const spinNumberRef = useRef(0);

  const [totalSpins, setTotalSpins] = useState(0);
  const [totalMoneySpent, setTotalMoneySpent] = useState(0);
  const [totalMoneyWon, setTotalMoneyWon] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [loseCount, setLoseCount] = useState(0);
  const [balanceHistory, setBalanceHistory] = useState([
    { name: 'Giro 0', balance: 1000, profit: 0 }
  ]);
  const [houseProfit, setHouseProfit] = useState(0);

  const COLORS_PIE_CHART = ['#00C49F', '#FF8042'];

  useEffect(() => {
    document.title = "Roleta Americana";
  }, []);

  const updateTotalBetAmount = useCallback(() => {
    const total = Object.values(currentBets).reduce((sum, betDetail) => sum + betDetail.amount, 0);
    setTotalBetAmount(total);
  }, [currentBets]);

  useEffect(() => {
    updateTotalBetAmount();
  }, [currentBets, updateTotalBetAmount]);

  const placeBet = (betType, betValue) => {
    if (isSpinning) {
      setMessage("Aguarde a roleta parar.");
      return;
    }
    if (balance < selectedChip) {
      setMessage("Saldo insuficiente para esta ficha.");
      return;
    }

    const betKey = `${betType}-${betValue}`;
    const currentAmountOnThisSpot = currentBets[betKey]?.amount || 0;
    const newAmountOnThisSpot = currentAmountOnThisSpot + selectedChip;
    const maxBetForThisType = MAX_BET_PER_TYPE[betType] || DEFAULT_MAX_BET_SPOT;

    if (newAmountOnThisSpot > maxBetForThisType) {
      setMessage(`Limite de $${maxBetForThisType} para "${betValue}" (${betType}) atingido.`);
      return;
    }

    if ((totalBetAmount + selectedChip) > MAX_TOTAL_TABLE_BET) {
      setMessage(`Aposta total na mesa excederia o limite de $${MAX_TOTAL_TABLE_BET}.`);
      return;
    }

    setBalance(prev => prev - selectedChip);
    setCurrentBets(prevBets => {
      const newBets = { ...prevBets };
      const existingBet = newBets[betKey];
      if (existingBet) {
        newBets[betKey] = { ...existingBet, amount: newAmountOnThisSpot };
      } else {
        newBets[betKey] = { type: betType, value: betValue, amount: selectedChip };
      }
      return newBets;
    });
    setMessage(`Aposta de $${selectedChip} em ${betValue} (${betType}) adicionada.`);
  };

  const removeBet = useCallback((betKeyToRemove) => {
    if (isSpinning) {
      setMessage("Não é possível remover apostas durante o giro.");
      return;
    }
    const betToRemove = currentBets[betKeyToRemove];
    if (betToRemove) {
      setBalance(prevBalance => prevBalance + betToRemove.amount);
      setCurrentBets(prevBets => {
        const newBets = { ...prevBets };
        delete newBets[betKeyToRemove];
        return newBets;
      });
      setMessage(`Aposta em ${betToRemove.value} (${betToRemove.type}) removida. $${betToRemove.amount} retornados.`);
    }
  }, [isSpinning, currentBets]);

  const clearBets = () => {
    if (isSpinning) return;
    const refundAmount = totalBetAmount;
    setBalance(prev => prev + refundAmount);
    setCurrentBets({});
    setMessage("Todas as apostas foram limpas e valores retornados ao saldo.");
  };

  const spinRoulette = () => {
    if (isSpinning) return;
    if (Object.keys(currentBets).length === 0) {
      setMessage("Por favor, faça uma aposta antes de girar.");
      return;
    }
    if (totalBetAmount < MIN_TOTAL_TABLE_BET) {
      setMessage(`Aposta total mínima de $${MIN_TOTAL_TABLE_BET} não atingida. Apostas atuais: $${totalBetAmount}.`);
      return;
    }

    const currentSpin = totalSpins + 1;
    spinNumberRef.current = currentSpin;
    setTotalSpins(currentSpin);
    setTotalMoneySpent(prevSpent => prevSpent + totalBetAmount);
    setIsSpinning(true);
    setWinningNumberData(null);
    setLastWin(0);
    setMessage("Girando...");
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS_DATA.length);
      const actualWinner = ROULETTE_NUMBERS_DATA[randomIndex];
      setWinningNumberData(actualWinner);
    }, 100);
  };

  const handleAdjustBalance = () => {
    if (isSpinning) return;
    const amount = parseInt(adjustAmountInput);
    if (!isNaN(amount)) {
      setBalance(prevBalance => {
        const newBalance = prevBalance + amount;
        setBalanceHistory(prevHistory => {
          const lastEntry = prevHistory[prevHistory.length - 1];
          const lastKnownHouseProfit = lastEntry ? lastEntry.profit : 0;
          return [
            ...prevHistory,
            {
              name: `Ajuste ${totalSpins > 0 ? `(Pós Giro ${totalSpins})` : '(Inicial)'}`,
              balance: newBalance,
              profit: lastKnownHouseProfit
            }
          ];
        });
        return newBalance;
      });
      setMessage(`${amount >= 0 ? 'Adicionado' : 'Removido'} $${Math.abs(amount)} ao saldo.`);
      setAdjustAmountInput('');
    } else {
      setMessage('Por favor, insira um valor numérico válido para ajustar o saldo.');
    }
  };

  const handleSetSelectedChipValue = () => {
    if (isSpinning) return;
    const amount = parseInt(newChipValueInput);
    if (!isNaN(amount) && CHIP_VALUES.includes(amount)) {
      setSelectedChip(amount);
      setMessage(`Ficha selecionada definida para $${amount}.`);
      setNewChipValueInput('');
    } else if (!isNaN(amount) && !CHIP_VALUES.includes(amount)) {
      setMessage(`Valor de ficha $${amount} inválido. Valores permitidos: ${CHIP_VALUES.join(', ')}.`);
    } else {
      setMessage('Por favor, insira um valor numérico válido para a ficha.');
    }
  };

  const calculateWinnings = useCallback((theWinner, currentSpinNumber) => {
    if (!theWinner) {
      console.error("calculateWinnings: Informação do número vencedor ausente.");
      setCurrentBets({});
      return;
    }

    let roundPayout = 0;
    let stakeReturnedOnWins = 0;

    for (const betKey in currentBets) {
      const bet = currentBets[betKey];
      let winMultiplier = 0;
      switch (bet.type) {
        case 'straight': if (bet.value === theWinner.val) winMultiplier = PAYOUTS.straight; break;
        case 'color':
          if (bet.value === 'red' && theWinner.color === 'red') { winMultiplier = PAYOUTS.red; }
          else if (bet.value === 'black' && theWinner.color === 'black') { winMultiplier = PAYOUTS.black; }
          break;
        case 'evenodd':
          if (theWinner.val !== '0' && theWinner.val !== '00') {
            if (bet.value === 'even' && theWinner.isEven) { winMultiplier = PAYOUTS.even; }
            else if (bet.value === 'odd' && !theWinner.isEven) { winMultiplier = PAYOUTS.odd; }
          }
          break;
        case 'half':
          if ((bet.value === '1-18' && theWinner.half === '1-18') ||
            (bet.value === '19-36' && theWinner.half === '19-36')) { winMultiplier = PAYOUTS['1-18']; }
          break;
        case 'dozen':
          if ((bet.value === 'dozen1' && theWinner.dozen === 1) ||
            (bet.value === 'dozen2' && theWinner.dozen === 2) ||
            (bet.value === 'dozen3' && theWinner.dozen === 3)) { winMultiplier = PAYOUTS.dozen; }
          break;
        case 'column':
          if ((bet.value === 'col1' && theWinner.column === 1) ||
            (bet.value === 'col2' && theWinner.column === 2) ||
            (bet.value === 'col3' && theWinner.column === 3)) { winMultiplier = PAYOUTS.column; }
          break;
        default: break;
      }
      if (winMultiplier > 0) {
        roundPayout += (bet.amount * winMultiplier);
        stakeReturnedOnWins += bet.amount;
      }
    }

    const totalReturnedToPlayerThisRound = roundPayout + stakeReturnedOnWins;
    const playerNetGainOrLossThisRound = totalReturnedToPlayerThisRound - totalBetAmount;

    if (roundPayout > 0) {
      setWinCount(prev => prev + 1);
      setTotalMoneyWon(prevWon => prevWon + roundPayout);
    } else {
      if (totalBetAmount > 0) {
        setLoseCount(prev => prev + 1);
      }
    }

    const houseGainThisRound = totalBetAmount - totalReturnedToPlayerThisRound;
    setHouseProfit(prevProfit => prevProfit + houseGainThisRound);

    const newBalanceAfterSpin = balance + playerNetGainOrLossThisRound;
    setBalanceHistory(prevHistory => {
      const lastEntry = prevHistory[prevHistory.length - 1];
      const lastCumulativeHouseProfit = lastEntry ? lastEntry.profit : 0;
      return [
        ...prevHistory,
        {
          name: `Giro ${currentSpinNumber}`,
          balance: newBalanceAfterSpin,
          profit: lastCumulativeHouseProfit + houseGainThisRound
        }
      ];
    });

    setBalance(prevBalance => prevBalance + playerNetGainOrLossThisRound);
    setLastWin(playerNetGainOrLossThisRound);

    if (totalReturnedToPlayerThisRound > 0) {
      setMessage(`🎉 Ganhou! Número: ${theWinner.val} (${theWinner.color}). Retorno: $${totalReturnedToPlayerThisRound} (Lucro/Prejuízo Jogador: $${playerNetGainOrLossThisRound})`);
    } else {
      setMessage(`Não foi desta vez. Número: ${theWinner.val} (${theWinner.color}).`);
    }

    setCurrentBets({});
  }, [currentBets, totalBetAmount, balance]);

  useEffect(() => {
    if (isSpinning && winningNumberData) {
      const animationTimer = setTimeout(() => {
        calculateWinnings(winningNumberData, spinNumberRef.current);
        setIsSpinning(false);
      }, SPIN_DURATION);
      return () => clearTimeout(animationTimer);
    }
  }, [isSpinning, winningNumberData, calculateWinnings]);

  const formatBetForDisplay = (bet) => {
    let betText = `Aposta em ${bet.value}`;
    if (bet.type === 'straight') betText = `Número ${bet.value}`;
    else if (bet.type === 'color') betText = bet.value === 'red' ? 'Vermelho' : 'Preto';
    else if (bet.type === 'evenodd') betText = bet.value === 'even' ? 'Par' : 'Ímpar';
    else if (bet.type === 'half') betText = bet.value;
    else if (bet.type === 'dozen') {
      if (bet.value === 'dozen1') betText = '1ª Dúzia';
      else if (bet.value === 'dozen2') betText = '2ª Dúzia';
      else if (bet.value === 'dozen3') betText = '3ª Dúzia';
    } else if (bet.type === 'column') {
      if (bet.value === 'col1') betText = 'Coluna 1';
      else if (bet.value === 'col2') betText = 'Coluna 2';
      else if (bet.value === 'col3') betText = 'Coluna 3';
    }
    return `${betText}: $${bet.amount}`;
  };

  const winRate = totalSpins > 0 ? ((winCount / totalSpins) * 100).toFixed(2) : "0.00";
  const netProfitPlayer = totalMoneyWon - totalMoneySpent;
  const houseEdge = totalMoneySpent > 0 ? ((houseProfit / totalMoneySpent) * 100).toFixed(2) : "0.00";
  const lossRate = totalSpins > 0 ? ((loseCount / totalSpins) * 100).toFixed(2) : "0.00";

  const pieChartData = [];
  if (winCount > 0) pieChartData.push({ name: 'Vitórias', value: winCount });
  if (loseCount > 0) pieChartData.push({ name: 'Derrotas', value: loseCount });


  return (
    <div className="roulette-page-container">
      <div className="main-game-layout">
        <div className="left-column">

          <div className="wheel-area">
            <h2 className="section-main-title">Roleta Americana</h2>
            <Wheel
              spinning={isSpinning}
              winningNumber={winningNumberData ? winningNumberData.val : null}
              americanNumbers={STANDARD_AMERICAN_WHEEL_ORDER}
              numberColors={WHEEL_NUMBER_COLORS}
            />
          </div>

          <div class="bet-category">
            <h2>Inside Bets</h2>
            <ul class="bet-list">
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Straight Up</strong> - Single Number
                </div>
                <span class="bet-payout">35 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Split</strong> - Two Numbers
                </div>
                <span class="bet-payout">17 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Street</strong> - Three Numbers
                </div>
                <span class="bet-payout">11 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Corner</strong> - Four Numbers
                </div>
                <span class="bet-payout">8 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>0/00/1/2/3</strong> - Five Numbers
                </div>
                <span class="bet-payout">6 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Six line</strong> - Six Numbers
                </div>
                <span class="bet-payout">5 to 1</span>
              </li>
            </ul>
          </div>

          <div class="bet-category">
            <h2>Outside Bets</h2>
            <ul class="bet-list">
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Dozen</strong> - Twelve Numbers
                </div>
                <span class="bet-payout">2 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Column</strong> - Twelve Numbers
                </div>
                <span class="bet-payout">2 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Low (1-18) or High (19-36)</strong>
                </div>
                <span class="bet-payout">1 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Red or Black</strong> Numbers
                </div>
                <span class="bet-payout">1 to 1</span>
              </li>
              <li class="bet-item">
                <div class="bet-info">
                  <strong>Odd or Even</strong> Numbers
                </div>
                <span class="bet-payout">1 to 1</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="center-column">
          <h2 className="section-main-title">Mesa de Aposta</h2>
          <BettingTable
            onBet={placeBet}
            disabled={isSpinning}
            numberColors={WHEEL_NUMBER_COLORS}
          />

          <div className="info-panel">
            <span className="info-text">Saldo: ${balance.toLocaleString()}</span>
            <span className="info-text">Aposta Total: ${totalBetAmount.toLocaleString()}</span>
          </div>

          <div className="chips-and-controls">
            <div className="chips-selector">
              {CHIP_VALUES.map(value => (
                <button
                  key={value}
                  className={`chip-button chip-${value} ${selectedChip === value ? 'selected' : ''}`}
                  onClick={() => setSelectedChip(value)}
                  disabled={isSpinning}
                >
                  {value}
                </button>
              ))}

              <div className="messageroulette">
                {message}
              </div>

            </div>
            <div className="action-buttons">
              <button
                onClick={spinRoulette}
                disabled={isSpinning || Object.keys(currentBets).length === 0}
                className="control-button spin"
              >
                {isSpinning ? 'Girando...' : 'Girar'}
              </button>
              <button
                onClick={clearBets}
                disabled={isSpinning || Object.keys(currentBets).length === 0}
                className="control-button clear"
              >
                Limpar Apostas
              </button>
            </div>
            <div className="adjust-balance-panel">
              <input
                type="number"
                value={adjustAmountInput}
                onChange={(e) => setAdjustAmountInput(e.target.value)}
                placeholder="Ajustar saldo (+/-)"
                className="adjust-input"
                disabled={isSpinning}
              />
              <button onClick={handleAdjustBalance} className="adjust-button" disabled={isSpinning}>
                Saldo
              </button>
            </div>
          </div>

          {Object.keys(currentBets).length > 0 && (
            <div className="current-bets-box">
              <div className="current-bets-display-area">
                <h4>Suas Apostas Atuais:</h4>
                <ul className="current-bets-list">
                  {Object.entries(currentBets).map(([betKey, betData]) => (
                    <li key={betKey} className="bet-list-item">
                      <span>{formatBetForDisplay(betData)}</span>
                      <button
                        onClick={() => removeBet(betKey)}
                        className="remove-bet-button"
                        aria-label={`Remover aposta ${formatBetForDisplay(betData)}`}
                        disabled={isSpinning}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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
                          <Cell key={`cell-${index}`} fill={COLORS_PIE_CHART[index % COLORS_PIE_CHART.length]} />
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

export default RoulettePage;