// src/components/SlotReelWeb.js
import React, { useState, useEffect, useRef } from 'react';
import './SlotReelWeb.css'; // Importa os estilos para este componente

// COMPONENTE SlotReelWeb (Rolo de Slot Individual)
const SlotReelWeb = ({ symbols, finalValueIndex, isSpinning, highlightType }) => {
  // Configurações visuais do rolo
  const reelDisplayHeight = 270; // Altura VISÍVEL da "janela" do rolo (3 símbolos cortados)
  const numberOfSymbolsInView = 3; // Quantos símbolos são visíveis por vez na "janela"
  const singleSymbolFullHeight = 90; // Altura REAL de cada símbolo (largura do rolo também será isso)

  const reelRef = useRef(null);

  const animationDuration = 2000; // Duração total da animação em milissegundos (2 segundos)

  // --- REVISÃO DA SEQUÊNCIA DE SÍMBOLOS PARA A ANIMAÇÃO ---
  // A ideia é criar uma longa sequência que rola, e o símbolo final é inserido
  // de forma que ele pare no meio da janela visível.
  
  // O número de "voltas" completas que o rolo dará
  const numFullSpins = 5; 
  
  // O símbolo alvo que queremos que pare no centro
  const targetSymbol = symbols[finalValueIndex % symbols.length];

  // A sequência que o rolo vai percorrer
  let finalSequence = [];

  // 1. Adiciona símbolos aleatórios para a parte "girando rápido"
  // (Pode ser uma mistura de todos os símbolos para maior variedade)
  for (let i = 0; i < (symbols.length * numFullSpins); i++) {
    finalSequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  // 2. Adiciona os símbolos que vão aparecer *logo antes* do símbolo alvo,
  //    para que o símbolo alvo possa parar no centro.
  //    A janela mostra 3 símbolos. O do meio é o segundo (índice 1).
  //    Então, precisamos que o símbolo que aparecerá no topo da janela seja o que
  //    antecede o símbolo alvo na sua sequência de símbolos.
  const symbolAboveTarget = symbols[(finalValueIndex - 1 + symbols.length) % symbols.length];
  
  finalSequence.push(symbolAboveTarget); // Este aparecerá no topo da janela
  finalSequence.push(targetSymbol);      // ESTE É O SÍMBOLO QUE VAI PARAR NO MEIO
  finalSequence.push(symbols[(finalValueIndex + 1) % symbols.length]); // Este aparecerá na parte de baixo da janela

  // NOVO: Definir o índice exato do símbolo que deve parar no centro na `finalSequence`
  // O símbolo alvo é o terceiro a partir do final da finalSequence (contando de trás para frente)
  // [..., symbolAboveTarget, targetSymbol, symbolAfterTarget]
  // Indices: [...   N-3       N-2           N-1        ]
  const centralSymbolIndexInFinalSequence = finalSequence.length - 2; // (length - 1) é o último, (length - 2) é o do meio


  useEffect(() => {
    // console.log(`Rolo: finalValueIndex = ${finalValueIndex}, isSpinning = ${isSpinning}`); // Debugging
    // console.log(`  Símbolo alvo: ${symbols[finalValueIndex]}`); // Debugging
    // console.log(`  Sequência final construída:`, finalSequence.map(s => s.substring(0, s.indexOf('.')))); // Debugging

    if (isSpinning) {
      // --- CÁLCULO DA POSIÇÃO DE PARADA REVISADO ---
      // Queremos que o centro do `targetSymbol` pare no centro da `reelDisplayHeight`.
      
      // Posição vertical do TOPO do símbolo que queremos centralizar
      const targetSymbolTopPositionInReel = centralSymbolIndexInFinalSequence * singleSymbolFullHeight;

      // O quanto o `reelRef` precisa se mover para cima (negativo)
      // para que o centro do símbolo alvo (targetSymbolTopPositionInReel + singleSymbolFullHeight / 2)
      // se alinhe com o centro da janela visível (reelDisplayHeight / 2).
      const targetTranslateY = -(
        targetSymbolTopPositionInReel - 
        (reelDisplayHeight / 2) + 
        (singleSymbolFullHeight / 2)
      );

      // console.log(`  targetSymbolTopPositionInReel: ${targetSymbolTopPositionInReel}`); // Debugging
      // console.log(`  targetTranslateY: ${targetTranslateY}`); // Debugging


      // Reseta a transição para garantir que o giro comece do zero
      if (reelRef.current) {
        reelRef.current.style.transition = 'none';
        // Define uma posição inicial aleatória para a ilusão de um giro "real"
        reelRef.current.style.transform = `translateY(${-Math.random() * (finalSequence.length * singleSymbolFullHeight * 0.5)}px)`;
        const _ = reelRef.current.offsetWidth; // Força o reflow para aplicar o transform antes da transição
      }

      // Aplica a transição de giro para a posição final com desaceleração
      if (reelRef.current) {
        reelRef.current.style.transition = `transform ${animationDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`; // Curva suave
        reelRef.current.style.transform = `translateY(${targetTranslateY}px)`;
      }

    } else {
      // Quando não está girando, garante que o símbolo final esteja no centro da janela.
      // Usa o mesmo cálculo de `targetTranslateY` para a posição de descanso.
      const finalRestingTranslateY = -(
        (centralSymbolIndexInFinalSequence * singleSymbolFullHeight) -
        (reelDisplayHeight / 2) +
        (singleSymbolFullHeight / 2)
      );

      // console.log(`  finalRestingTranslateY: ${finalRestingTranslateY}`); // Debugging

      if (reelRef.current) {
        reelRef.current.style.transition = 'none'; // Sem transição para o reset
        reelRef.current.style.transform = `translateY(${finalRestingTranslateY}px)`;
      }
    }
  }, [isSpinning, finalValueIndex, symbols, animationDuration, singleSymbolFullHeight, reelDisplayHeight, finalSequence, highlightType, numberOfSymbolsInView]); // topOfStopSequenceIndex não é mais necessário aqui


  return (
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
          const isCenteredSymbol = !isSpinning && 
                                   (index === centralSymbolIndexInFinalSequence); // Verifica o índice central exato

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