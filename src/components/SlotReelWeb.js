// src/components/SlotReelWeb.js
import React, { useState, useEffect, useRef } from 'react';
import './SlotReelWeb.css'; // Importa os estilos para este componente

// COMPONENTE SlotReelWeb (Rolo de Slot Individual)
const SlotReelWeb = ({ symbols, finalValueIndex, isSpinning, highlightType }) => { // highlightType AQUI!
  // Configurações visuais do rolo
  const reelDisplayHeight = 270; // Altura VISÍVEL da "janela" do rolo em pixels (3 símbolos cortados)
  const numberOfSymbolsInView = 3; // Quantos símbolos são visíveis por vez na "janela"
  const singleSymbolFullHeight = 90; // Altura REAL de cada símbolo (largura do rolo também será isso)

  const reelRef = useRef(null); // Ref para o elemento DOM do rolo para manipulação direta de estilos

  const animationDuration = 2000; // Duração total da animação em milissegundos (2 segundos)

  // --- Sequência de símbolos para a animação ---
  const numRepeatsForSpin = 10;
  let animationContentSymbols = [];
  for (let i = 0; i < numRepeatsForSpin; i++) {
    animationContentSymbols = animationContentSymbols.concat(symbols);
  }

  // O índice do símbolo que queremos que pare, dentro da sequência ORIGINAL de 'symbols'.
  const targetSymbolIndex = finalValueIndex % symbols.length;

  // Adicionamos o símbolo final desejado no final da sequência de rolagem.
  // E também adicionamos alguns símbolos de "buffer" no final para que a animação
  // possa desacelerar suavemente e o símbolo final se posicione corretamente no centro.
  const finalSequence = [
    ...animationContentSymbols,
    symbols[targetSymbolIndex], // O símbolo que queremos que pare no meio
    symbols[(targetSymbolIndex + 1) % symbols.length], // Símbolo logo abaixo do final
    symbols[(targetSymbolIndex + 2) % symbols.length], // Segundo símbolo abaixo do final
  ];


  useEffect(() => {
    if (isSpinning) {
      // --- CÁLCULO DA POSIÇÃO DE PARADA ---
      const indexOfFinalSymbolInAnimationSequence = finalSequence.length - 3; // Posição do targetSymbolIndex antes dos 2 últimos buffers

      const targetTranslateY = -(
        (indexOfFinalSymbolInAnimationSequence * singleSymbolFullHeight) + // Posição do topo do símbolo final
        (singleSymbolFullHeight / 2) -                                    // Adiciona metade da altura do símbolo para pegar seu centro
        (reelDisplayHeight / 2)                                           // Subtrai metade da altura da janela para alinhar ao centro
      );

      // Reseta a transição para garantir que o giro comece do zero
      if (reelRef.current) {
        reelRef.current.style.transition = 'none';
        // Opcional: define uma posição inicial aleatória para a ilusão de um giro "real"
        reelRef.current.style.transform = `translateY(${-Math.random() * (finalSequence.length * singleSymbolFullHeight * 0.5)}px)`;
        
        // CORREÇÃO ESLINT: Atribua a uma variável para forçar o reflow
        const _ = reelRef.current.offsetWidth; 
      }

      // Aplica a transição de giro para a posição final com desaceleração
      if (reelRef.current) {
        reelRef.current.style.transition = `transform ${animationDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`; // Curva suave
        reelRef.current.style.transform = `translateY(${targetTranslateY}px)`;
      }

    } else {
      // Quando não está girando, garante que o símbolo final esteja no centro da janela.
      const indexOfFinalSymbolInAnimationSequence = finalSequence.length - 3;
      const finalRestingTranslateY = -(
        (indexOfFinalSymbolInAnimationSequence * singleSymbolFullHeight) +
        (singleSymbolFullHeight / 2) -
        (reelDisplayHeight / 2)
      );

      if (reelRef.current) {
        reelRef.current.style.transition = 'none'; // Sem transição para o reset
        reelRef.current.style.transform = `translateY(${finalRestingTranslateY}px)`;
      }
    }
    // Adicionado finalSequence à lista de dependências do useEffect
  }, [isSpinning, finalValueIndex, symbols, animationDuration, singleSymbolFullHeight, reelDisplayHeight, finalSequence, highlightType]); // Adicionado highlightType como dependência

  return (
    // Adiciona a classe highlightType ao wrapper principal do rolo
    <div className={`slot-reel-wrapper-web ${highlightType}`} style={{ height: reelDisplayHeight + 'px', width: singleSymbolFullHeight + 'px' }}>
      {/* NOVO: Pseudo-elemento para a linha de fundo da payline já está sendo tratado no CSS :before */}
      
      <div
        ref={reelRef}
        className="slot-reel-web"
        // 'transform' e 'transition' são controladas pelo useEffect
      >
        {finalSequence.map((symbolFileName, index) => {
          // Calcula qual símbolo estará no meio (visível) quando o rolo parar
          // e aplica a classe de highlight apenas a ele.
          // O símbolo que para no meio é o que está 3 posições antes do final da sequence
          const isCenteredSymbol = !isSpinning && 
                                   (index === (finalSequence.length - 3)); 

          return (
            <div
              key={index}
              className={`slot-symbol-web ${isCenteredSymbol ? highlightType : ''}`} // Aplica a classe de destaque aqui
              style={{ height: singleSymbolFullHeight + 'px' }}
            >
              <img
                src={process.env.PUBLIC_URL + '/images/symbols/' + symbolFileName}
                alt={symbolFileName.split('.')[0]} // Texto alternativo (ex: "cherry")
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