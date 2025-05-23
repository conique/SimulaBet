// src/components/SlotReelWeb.js
import React, { useState, useEffect, useRef } from 'react';
import './SlotReelWeb.css'; // Importa os estilos para este componente

const SlotReelWeb = ({ symbols, finalValueIndex, isSpinning, highlightType }) => {
  // Configurações visuais do rolo
  const reelDisplayHeight = 210; // Altura VISÍVEL da "janela" do rolo em pixels (3 símbolos cortados)
  const numberOfSymbolsInView = 3;
  const singleSymbolFullHeight = 70; // Altura REAL de cada símbolo (largura do rolo também será isso)

  const reelRef = useRef(null); // Ref para o elemento DOM do rolo para manipulação direta de estilos

  const animationDuration = 2000; // Duração total da animação em milissegundos (2 segundos)

  // --- Sequência de símbolos para a animação ---
  const numRepeatsForSpin = 10;
  let animationContentSymbols = [];
  for (let i = 0; i < numRepeatsForSpin; i++) {
    animationContentSymbols = animationContentSymbols.concat(symbols);
  }

  const targetSymbolIndex = finalValueIndex % symbols.length;

  const finalSequence = [
    ...animationContentSymbols,
    symbols[targetSymbolIndex], // O símbolo que queremos que pare no meio
    symbols[(targetSymbolIndex + 1) % symbols.length], // Símbolo logo abaixo do final
    symbols[(targetSymbolIndex + 2) % symbols.length], // Segundo símbolo abaixo do final
  ];


  useEffect(() => {
    if (isSpinning) {
      const indexOfFinalSymbolInAnimationSequence = finalSequence.length - 3;

      const targetTranslateY = -(
        (indexOfFinalSymbolInAnimationSequence * singleSymbolFullHeight) +
        (singleSymbolFullHeight / 2) -
        (reelDisplayHeight / 2)
      );

      if (reelRef.current) {
        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = `translateY(${-Math.random() * (finalSequence.length * singleSymbolFullHeight * 0.5)}px)`;
        void reelRef.current.offsetWidth;
      }

      if (reelRef.current) {
        reelRef.current.style.transition = `transform ${animationDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        reelRef.current.style.transform = `translateY(${targetTranslateY}px)`;
      }

    } else {
      const indexOfFinalSymbolInAnimationSequence = finalSequence.length - 3;
      const finalRestingTranslateY = -(
        (indexOfFinalSymbolInAnimationSequence * singleSymbolFullHeight) +
        (singleSymbolFullHeight / 2) -
        (reelDisplayHeight / 2)
      );

      if (reelRef.current) {
        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = `translateY(${finalRestingTranslateY}px)`;
      }
    }
  }, [isSpinning, finalValueIndex, symbols, animationDuration, singleSymbolFullHeight, reelDisplayHeight, finalSequence]);

  return (
    // Removido a classe highlightType do wrapper principal.
    // Ela será aplicada ao slot-symbol-web diretamente no CSS.
    <div className="slot-reel-wrapper-web" style={{ height: reelDisplayHeight + 'px', width: singleSymbolFullHeight + 'px' }}>
      {/* Removido o <div className="slot-highlight-bar"> aqui */}
      
      <div
        ref={reelRef}
        className="slot-reel-web"
      >
        {finalSequence.map((symbolFileName, index) => {
          // Calcula qual símbolo estará no meio (visível) quando o rolo parar
          // e aplica a classe de highlight apenas a ele.
          const isCenteredSymbol = !isSpinning && 
                                   (index === (finalSequence.length - 3)); // Ajuste este índice se a lógica de parada mudar
                                   // A lógica de parada faz o símbolo final parar na 3ª posição de cima para baixo
                                   // de uma janela de 3. Então, ele é o do meio.

          return (
            <div
              key={index}
              className={`slot-symbol-web ${isCenteredSymbol ? highlightType : ''}`} // Aplica a classe de destaque aqui
              style={{ height: singleSymbolFullHeight + 'px' }}
            >
              <img
                src={process.env.PUBLIC_URL + '/images/symbols/' + symbolFileName}
                alt={symbolFileName.split('.')[0]}
                style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlotReelWeb;