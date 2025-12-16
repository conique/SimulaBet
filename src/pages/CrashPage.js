import React, { useState, useEffect, useRef } from 'react';
import './CrashPage.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GAME_SPEED = 100;
const MAX_MULTIPLIER = 100.00;
const MIN_CRASH_POINT = 1.05;

function CrashPage() {
    const [balance, setBalance] = useState(1000);
    const [message, setMessage] = useState('Faça sua aposta e prepare-se!');
    const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
    const [isGameRunning, setIsGameRunning] = useState(false);

    const [betSlot, setBetSlot] = useState({
        isPlaced: false,
        hasCashedOut: false,
        betAmount: 10,
        winAmount: 0,
        cashOutMultiplier: null,
        autoStopMultiplier: '',
        isAutoStopEnabled: false
    });

    const [resultMultiplier, setResultMultiplier] = useState(null);
    const [highlightResult, setHighlightResult] = useState('');

    const multiplierIntervalRef = useRef(null);
    const crashPointTimeoutRef = useRef(null);

    const [adjustAmount, setAdjustAmount] = useState('');

    // --- ESTATÍSTICAS ---
    const [totalRounds, setTotalRounds] = useState(0);
    const [totalMoneySpent, setTotalMoneySpent] = useState(0);
    const [totalMoneyWon, setTotalMoneyWon] = useState(0);
    const [winCount, setWinCount] = useState(0);
    const [loseCount, setLoseCount] = useState(0);
    
    // Inicializa com Lucro 0 para a casa
    const [balanceHistory, setBalanceHistory] = useState([
        { name: 'Rodada 0', balance: 1000, profit: 0 }
    ]);
    const [houseProfit, setHouseProfit] = useState(0);

    // Refs para acesso dentro do setInterval
    const latestMultiplierRef = useRef(currentMultiplier);
    const latestBetSlotRef = useRef(betSlot);
    const latestGameRunningRef = useRef(isGameRunning);
    const latestBalanceRef = useRef(balance);
    const latestTotalRoundsRef = useRef(totalRounds);
    const latestWinCountRef = useRef(winCount);
    const latestLoseCountRef = useRef(loseCount);

    // Atualiza Refs
    useEffect(() => {
        latestMultiplierRef.current = currentMultiplier;
        latestBetSlotRef.current = betSlot;
        latestGameRunningRef.current = isGameRunning;
        latestBalanceRef.current = balance;
        latestTotalRoundsRef.current = totalRounds;
        latestWinCountRef.current = winCount;
        latestLoseCountRef.current = loseCount;
    });

    useEffect(() => {
        return () => {
            if (multiplierIntervalRef.current) clearInterval(multiplierIntervalRef.current);
            if (crashPointTimeoutRef.current) clearTimeout(crashPointTimeoutRef.current);
        };
    }, []);

    const startGame = () => {
        if (isGameRunning) return;

        if (!betSlot.isPlaced) {
            setMessage('Faça sua aposta para começar!');
            return;
        }

        let currentBetAmount = betSlot.betAmount;

        if (balance < currentBetAmount) {
            setMessage('Saldo insuficiente para sua aposta atual!');
            resetGameForNextRound();
            return;
        }

        if (betSlot.isPlaced && betSlot.isAutoStopEnabled && (betSlot.autoStopMultiplier === '' || parseFloat(betSlot.autoStopMultiplier) <= 1.00 || isNaN(parseFloat(betSlot.autoStopMultiplier)))) {
            setMessage('Auto Stop: Valor inválido. Desative ou corrija.');
            return;
        }

        // Deduz a aposta
        setBalance(prevBalance => prevBalance - currentBetAmount);
        setTotalMoneySpent(prevSpent => prevSpent + currentBetAmount);

        let currentRoundNumber;
        setTotalRounds(prevRounds => {
            currentRoundNumber = prevRounds + 1;
            return currentRoundNumber;
        });

        setMessage('Jogo começando... Multiplicador subindo!');
        setCurrentMultiplier(1.00);
        setIsGameRunning(true);
        setResultMultiplier(null);
        setHighlightResult('');

        setBetSlot(s => ({ ...s, hasCashedOut: false, winAmount: 0, cashOutMultiplier: null }));

        const calculateRandomCrashPoint = () => {
            let randomValue = Math.random();
            let crashPoint;
            if (randomValue < 0.40) {
                crashPoint = Math.random() * (2.00 - MIN_CRASH_POINT) + MIN_CRASH_POINT;
            } else if (randomValue < 0.70) {
                crashPoint = Math.random() * (5.00 - 2.00) + 2.00;
            } else if (randomValue < 0.90) {
                crashPoint = Math.random() * (10.00 - 5.00) + 5.00;
            } else if (randomValue < 0.98) {
                crashPoint = Math.random() * (30.00 - 10.00) + 10.00;
            } else {
                crashPoint = Math.random() * (MAX_MULTIPLIER - 30.00) + 30.00;
            }
            return parseFloat(crashPoint.toFixed(2));
        };
        const randomCrashMultiplier = calculateRandomCrashPoint();

        multiplierIntervalRef.current = setInterval(() => {
            const currentMultiplierValue = latestMultiplierRef.current;
            const currentBetSlot = latestBetSlotRef.current;
            const gameIsStillRunning = latestGameRunningRef.current;
            const currentTotalRoundsLocal = latestTotalRoundsRef.current;

            if (!gameIsStillRunning) {
                clearInterval(multiplierIntervalRef.current);
                return;
            }

            const nextMultiplier = parseFloat((currentMultiplierValue + 0.01).toFixed(2));

            // Lógica de Auto Stop
            if (currentBetSlot.isPlaced && !currentBetSlot.hasCashedOut && currentBetSlot.isAutoStopEnabled && currentBetSlot.autoStopMultiplier !== '') {
                if (nextMultiplier >= parseFloat(currentBetSlot.autoStopMultiplier)) {
                    cashOut();
                }
            }

            setCurrentMultiplier(nextMultiplier);

            // --- CRASH! ---
            if (nextMultiplier >= randomCrashMultiplier) {
                clearInterval(multiplierIntervalRef.current);
                setIsGameRunning(false);
                setResultMultiplier(randomCrashMultiplier);

                const finalBetSlotState = latestBetSlotRef.current;
                
                // Cálculos de resultado
                let hasAnyBetPlaced = finalBetSlotState.isPlaced;
                let wasCashedOut = finalBetSlotState.hasCashedOut;
                
                // Lucro do JOGADOR nesta rodada (positivo = ganhou, negativo = perdeu aposta)
                let playerProfitThisRound = -finalBetSlotState.betAmount; 

                if (hasAnyBetPlaced && wasCashedOut) {
                    setMessage(`Saque concluído! Explodiu em ${randomCrashMultiplier.toFixed(2)}x.`);
                    setHighlightResult('win');
                    // Se sacou, o lucro é (Valor Ganho - Valor Apostado)
                    playerProfitThisRound = finalBetSlotState.winAmount - finalBetSlotState.betAmount;
                } else if (hasAnyBetPlaced && !wasCashedOut) {
                    setMessage(`Explodiu em ${randomCrashMultiplier.toFixed(2)}x! Aposta perdida.`);
                    setHighlightResult('lose');
                    setLoseCount(latestLoseCountRef.current + 1);
                    // Se não sacou, perdeu o valor da aposta (já definido em -betAmount)
                } else {
                    setMessage(`Rodada finalizada em ${randomCrashMultiplier.toFixed(2)}x.`);
                    setHighlightResult('');
                    playerProfitThisRound = 0;
                }

                // Lucro da CASA é o inverso do lucro do jogador
                const houseProfitChange = -playerProfitThisRound;

                // Atualiza estatísticas globais da casa
                setHouseProfit(prev => prev + houseProfitChange);

                // --- CORREÇÃO DO HISTÓRICO ---
                setBalanceHistory(prevHistory => {
                    // Pega o último registro para saber o lucro acumulado anterior
                    const lastEntry = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : { balance: 1000, profit: 0 };
                    const lastAccumulatedHouseProfit = lastEntry.profit || 0;
                    
                    const newEntry = {
                        name: `Rodada ${currentTotalRoundsLocal}`,
                        balance: latestBalanceRef.current, // Saldo atual do jogador
                        profit: lastAccumulatedHouseProfit + houseProfitChange // Acumula o lucro da casa
                    };

                    const newHistory = [...prevHistory, newEntry];
                    
                    if (newHistory.length > 50) {
                        return newHistory.slice(newHistory.length - 50);
                    }
                    return newHistory;
                });

                if (finalBetSlotState.isPlaced && !finalBetSlotState.hasCashedOut) {
                    setBetSlot(s => ({ ...s, isPlaced: false, hasCashedOut: false, winAmount: 0, cashOutMultiplier: null }));
                }
            }
        }, GAME_SPEED);
    };

    const cashOut = () => {
        const currentMultiplierValue = latestMultiplierRef.current;
        const currentBetSlot = latestBetSlotRef.current;

        if (!latestGameRunningRef.current || currentBetSlot.hasCashedOut || !currentBetSlot.isPlaced) return;

        const win = parseFloat((currentBetSlot.betAmount * currentMultiplierValue).toFixed(2));
        
        setBalance(prevBalance => prevBalance + win);
        setTotalMoneyWon(prevWon => prevWon + win);
        setBetSlot(s => ({ ...s, hasCashedOut: true, winAmount: win, cashOutMultiplier: currentMultiplierValue }));

        setMessage(`Você sacou em ${currentMultiplierValue.toFixed(2)}x! Ganhou $${win}!`);
        setHighlightResult('win');
        setWinCount(prevCount => prevCount + 1);
    };

    const resetGameForNextRound = () => {
        if (multiplierIntervalRef.current) clearInterval(multiplierIntervalRef.current);
        setIsGameRunning(false);
        setBetSlot(s => ({ ...s, isPlaced: false, hasCashedOut: false, winAmount: 0, cashOutMultiplier: null }));
        setMessage('Faça sua aposta para a próxima rodada!');
        setCurrentMultiplier(1.00);
        setResultMultiplier(null);
        setHighlightResult('');
    };

    const handleAdjustBalance = () => {
        const amount = parseFloat(adjustAmount);
        if (isNaN(amount) || amount === 0) {
            setMessage('Por favor, digite um valor válido e diferente de zero.');
            return;
        }

        setBalance(prevBalance => {
            const newBalance = prevBalance + amount;
            if (newBalance < 0) {
                setMessage('Saldo não pode ser negativo!');
                return prevBalance;
            }
            
            // Ajusta o histórico visualmente sem alterar o lucro da casa
            setBalanceHistory(prevHistory => {
                const lastEntry = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : { profit: 0 };
                const newHistory = [
                    ...prevHistory,
                    {
                        name: `Rodada ${latestTotalRoundsRef.current} (Ajuste)`,
                        balance: newBalance,
                        profit: lastEntry.profit // Mantém o lucro da casa inalterado
                    }
                ];
                return newHistory.length > 50 ? newHistory.slice(newHistory.length - 50) : newHistory;
            });
            return newBalance;
        });

        setMessage(`${Math.abs(amount).toFixed(2)} créditos ${amount > 0 ? 'adicionados' : 'removidos'}.`);
        setAdjustAmount('');
    };

    const placeBet = () => {
        if (isGameRunning || betSlot.isPlaced) return;
        if (betSlot.betAmount <= 0 || isNaN(betSlot.betAmount)) {
            setMessage(`Aposta: Valor inválido.`);
            return;
        }
        if (balance < betSlot.betAmount) {
            setMessage(`Saldo insuficiente!`);
            return;
        }
        setBetSlot(s => ({ ...s, isPlaced: true }));
        setMessage(`Sua aposta de $${betSlot.betAmount.toFixed(2)} foi colocada.`);
    };

    const clearBet = () => {
        if (isGameRunning) return;
        if (!betSlot.isPlaced) return;
        // Se cancelar a aposta, não reembolsa imediatamente pois o saldo só é descontado no StartGame neste código?
        // Ah, verifiquei o StartGame: "setBalance(prevBalance => prevBalance - currentBetAmount);"
        // Então ao colocar a aposta (PlaceBet), você NÃO descontou ainda. Só desconta no Start.
        // Logo, ClearBet apenas reseta o estado visual, sem mexer no saldo.
        setBetSlot(s => ({ ...s, isPlaced: false, hasCashedOut: false, winAmount: 0, cashOutMultiplier: null }));
        setMessage(`Sua aposta foi removida.`);
    };

    const setBetAmountVal = (amount) => {
        setBetSlot(s => ({ ...s, betAmount: parseFloat(amount) || 0 }));
    }

    const setAutoStop = (amount) => {
        setBetSlot(s => ({ ...s, autoStopMultiplier: amount }));
    }

    const toggleAutoStopEnabled = () => {
        if (isGameRunning) {
            setMessage('Não pode mudar Auto Stop durante o jogo.');
            return;
        }
        setBetSlot(s => ({ ...s, isAutoStopEnabled: !s.isAutoStopEnabled }));
        setMessage(`Auto Stop: ${!betSlot.isAutoStopEnabled ? 'Ativado' : 'Desativado'}.`);
    };

    const isAnyBetPlaced = betSlot.isPlaced;
    const winRate = totalRounds > 0 ? ((winCount / totalRounds) * 100).toFixed(2) : 0;
    const netProfitPlayer = totalMoneyWon - totalMoneySpent;
    const houseEdge = totalMoneySpent > 0 ? ((houseProfit / totalMoneySpent) * 100).toFixed(2) : 0;
    const lossRate = totalRounds > 0 ? ((loseCount / totalRounds) * 100).toFixed(2) : 0;

    const pieChartData = [
        ...(winCount > 0 ? [{ name: 'Vitórias', value: winCount, color: '#00C49F' }] : []),
        ...(loseCount > 0 ? [{ name: 'Derrotas', value: loseCount, color: '#FF8042' }] : []),
    ];

    const COLORS = ['#00C49F', '#FF8042'];

    return (
        <div className="crash-page-container">
            <div className="main-game-layout">
                {/* ESQUERDA: REGRAS */}
               <div className="left-column-crash">
                    <div className="crash-rules-panel panel-style">
                        <h2 className="section-main-title">Regras do Jogo</h2>
                        <h3>Como Jogar:</h3>
                        <ul>
                            <li>Faça sua aposta antes da rodada começar.</li>
                            <li>O multiplicador começará a subir.</li>
                            <li>Clique em "Sacar" antes que o <b>crash</b> aconteça para multiplicar sua aposta.</li>
                            <li>Se o crash acontecer antes de você sacar, você perde a aposta.</li>
                            <li>O valor do saque é sua aposta multiplicada pelo valor atual no momento do clique.</li>
                        </ul>
                        <h3>Exemplo:</h3>
                        <ul>
                            <li>Aposta: $10</li>
                            <li>Você saca em 1.50x: Você ganha $15 ($10 * 1.50).</li>
                            <li>Crash acontece em 1.20x e você não sacou: Você perde $10.</li>
                        </ul>
                        <h3>Atenção:</h3>
                        <ul>
                            <li>O ponto de crash é aleatório e imprevisível.</li>
                            <li>Quanto mais alto o multiplicador, maior o risco de crash!</li>
                        </ul>
                    </div>
                </div>

                {/* CENTRO: JOGO */}
                <div className="center-column-crash">
                    <h2 className="section-main-title">Crash</h2>
                    <div className="crash-content panel-style">
                        <div className="game-display-area">
                            <div className={`multiplier-display ${highlightResult}`}>
                                {currentMultiplier.toFixed(2)}x
                                {isGameRunning && !betSlot.hasCashedOut && <div className="multiplier-animation-indicator"></div>}
                            </div>
                            <p className="game-message">{message}</p>
                        </div>

                        <div className="game-controls">
                            <div className="balance-info">
                                <p>Saldo: ${balance.toFixed(2)}</p>
                            </div>

                            <div className="bet-slots-container">
                                <div className="bet-slot-box single-slot">
                                    <h3>Sua Aposta</h3>
                                    <input
                                        type="number"
                                        value={betSlot.betAmount}
                                        onChange={(e) => setBetAmountVal(e.target.value)}
                                        disabled={isGameRunning || betSlot.isPlaced}
                                        className="bet-amount-input"
                                        placeholder="Valor"
                                    />
                                    <input
                                        type="text"
                                        value={betSlot.autoStopMultiplier}
                                        onChange={(e) => setAutoStop(e.target.value)}
                                        disabled={isGameRunning}
                                        className="auto-stop-input"
                                        placeholder="Auto Stop (ex: 2.00)"
                                    />
                                    <button
                                        onClick={toggleAutoStopEnabled}
                                        disabled={isGameRunning}
                                        className={`auto-stop-toggle-button ${betSlot.isAutoStopEnabled ? 'active' : ''}`}
                                    >
                                        Auto Stop {betSlot.isAutoStopEnabled ? 'ON' : 'OFF'}
                                    </button>

                                    {!isGameRunning ? (
                                        betSlot.isPlaced ? (
                                            <button className="clear-bet-button" onClick={clearBet} disabled={isGameRunning}>
                                                Cancelar Aposta
                                            </button>
                                        ) : (
                                            <button className="place-bet-button" onClick={placeBet} disabled={balance < betSlot.betAmount || isGameRunning || betSlot.betAmount <= 0}>
                                                Apostar
                                            </button>
                                        )
                                    ) : (
                                        betSlot.isPlaced && (
                                            !betSlot.hasCashedOut ? (
                                                <button className="cash-out-button" onClick={cashOut}>
                                                    Sacar {currentMultiplier.toFixed(2)}x
                                                </button>
                                            ) : (
                                                <button className="cashed-out-display-button" disabled>
                                                    Sacado {betSlot.cashOutMultiplier?.toFixed(2)}x (${betSlot.winAmount.toFixed(2)})
                                                </button>
                                            )
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="global-action-buttons">
                                {!isGameRunning && resultMultiplier === null && (
                                    <button className="start-game-button" onClick={startGame} disabled={!isAnyBetPlaced || balance < betSlot.betAmount}>
                                        Iniciar Jogo
                                    </button>
                                )}
                                {!isGameRunning && resultMultiplier !== null && (
                                    <button className="next-round-button" onClick={resetGameForNextRound}>
                                        Próxima Rodada
                                    </button>
                                )}
                                <div className="adjust-balance-panel">
                                    <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Ajustar saldo" className="adjust-input"/>
                                    <button onClick={handleAdjustBalance} className="adjust-button">Saldo</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DIREITA: ESTATÍSTICAS */}
                <div className="right-column-crash">
                    <h2 className="section-main-title">Estatísticas</h2>
                    <div className="stats-block">
                        <h3>Resumo</h3>
                        <div className="stats-summary">
                            <p><strong>Rodadas:</strong> {totalRounds}</p>
                            <p><strong>Gasto:</strong> ${totalMoneySpent.toFixed(2)}</p>
                            <p><strong>Ganho:</strong> ${totalMoneyWon.toFixed(2)}</p>
                            <p><strong>Lucro Jogador:</strong> ${netProfitPlayer.toFixed(2)}</p>
                            <p><strong>Lucro Casa:</strong> ${houseProfit.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="stats-block">
                        <h3>Histórico de Saldo e Lucro da Casa</h3>
                        <div className="charts-container">
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={balanceHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDashArray="3 3" stroke="#444" />
                                    <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#ccc" tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                    <Legend wrapperStyle={{ color: '#fff' }} />
                                    <Line type="monotone" dataKey="balance" stroke="#00C49F" name="Saldo Jogador" dot={false} />
                                    <Line type="monotone" dataKey="profit" stroke="#FFBB28" name="Lucro Casa" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="stats-block">
                        <h3>Vitórias vs Derrotas</h3>
                        <div className="charts-container">
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" labelLine={false}>
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                                    <Legend wrapperStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="loss-percentage">Derrotas: <strong>{lossRate}%</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CrashPage;