// src/components/BettingTable.js
import React from 'react';
import './BettingTable.css';

// BetButton como uma div estilizada para ser uma célula da tabela
const BetButton = ({ label, onClick, disabled, color, textColor, className = '', areaType = '', 'data-bet-type': betTypeData, 'data-bet-value': betValueData }) => (
  <div
    className={`bet-cell ${className} ${areaType ? `bet-area-${areaType}` : ''} ${disabled ? 'disabled' : ''}`}
    onClick={!disabled ? onClick : undefined}
    onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onClick(); }} // Para acessibilidade
    role="button"
    tabIndex={disabled ? -1 : 0}
    aria-disabled={disabled}
    aria-label={`Apostar em ${label}`}
    style={{
      backgroundColor: color, // Usado principalmente para números (vermelho/preto/verde)
      color: textColor,
    }}
    data-bet-type={betTypeData} // Para depuração ou estilização avançada
    data-bet-value={betValueData}
  >
    {label}
  </div>
);

function BettingTable({ onBet, disabled, numberColors }) {
  const handleBetClick = (betType, betValue) => {
    if (!disabled && onBet) {
      onBet(betType, betValue);
    }
  };

  const numberRows = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ];
  
  const rowToLogicalColumn = ['col3', 'col2', 'col1'];

  return (
    <div className="betting-table-layout-container">
      <h3 className="betting-table-title visually-hidden">Mesa de Apostas</h3>
      <div className="roulette-table-grid">
        <BetButton 
            label="0" 
            onClick={() => handleBetClick('straight', '0')} 
            disabled={disabled} 
            color={numberColors['0']} 
            textColor="black"
            className="zero-button single-zero" 
            areaType="zero"
        />
        <BetButton 
            label="00" 
            onClick={() => handleBetClick('straight', '00')} 
            disabled={disabled} 
            color={numberColors['00']} 
            textColor="black"
            className="zero-button double-zero"
            areaType="zero"
        />
        {numberRows.map((row, rowIndex) => (
          <React.Fragment key={`num-row-${rowIndex}`}>
            {row.map(num => {
              const numStr = num.toString();
              return (
                <BetButton
                  key={numStr}
                  label={numStr}
                  onClick={() => handleBetClick('straight', numStr)}
                  disabled={disabled}
                  color={numberColors[numStr]}
                  textColor={(numberColors[numStr] === 'red' || numberColors[numStr] === 'black') ? 'white' : 'black'}
                  className="number-button"
                  areaType="number"
                />
              );
            })}
          </React.Fragment>
        ))}

        {rowToLogicalColumn.map((logicalCol, index) => (
             <BetButton
                key={`col-bet-${index}`}
                label="2 to 1"
                onClick={() => handleBetClick('column', logicalCol)}
                disabled={disabled}
                className={`column-bet-button col-bet-${index + 1}`}
                areaType="column"
            />
        ))}
       
        <BetButton 
            label="1st 12" 
            onClick={() => handleBetClick('dozen', 'dozen1')} 
            disabled={disabled} 
            className="dozen-bet-button dozen-1"
            areaType="dozen"
        />
        <BetButton 
            label="2nd 12" 
            onClick={() => handleBetClick('dozen', 'dozen2')} 
            disabled={disabled} 
            className="dozen-bet-button dozen-2"
            areaType="dozen"
        />
        <BetButton 
            label="3rd 12" 
            onClick={() => handleBetClick('dozen', 'dozen3')} 
            disabled={disabled} 
            className="dozen-bet-button dozen-3"
            areaType="dozen"
        />
        <BetButton 
            label="1 to 18" 
            onClick={() => handleBetClick('half', '1-18')} 
            disabled={disabled} 
            className="outside-bet-button low-half"
            areaType="outside"
        />
        <BetButton 
            label="EVEN" 
            onClick={() => handleBetClick('evenodd', 'even')} 
            disabled={disabled} 
            className="outside-bet-button even"
            areaType="outside"
        />
        <BetButton 
            label="RED" 
            onClick={() => handleBetClick('color', 'red')} 
            disabled={disabled} 
            className="outside-bet-button red-bet"
            areaType="outside"
        />
        <BetButton 
            label="BLACK" 
            onClick={() => handleBetClick('color', 'black')} 
            disabled={disabled} 
            className="outside-bet-button black-bet"
            areaType="outside"
        />
        <BetButton 
            label="ODD" 
            onClick={() => handleBetClick('evenodd', 'odd')} 
            disabled={disabled} 
            className="outside-bet-button odd"
            areaType="outside"
        />
        <BetButton 
            label="19 to 36" 
            onClick={() => handleBetClick('half', '19-36')} 
            disabled={disabled} 
            className="outside-bet-button high-half"
            areaType="outside"
        />
      </div>
    </div>
  );
}

export default BettingTable;