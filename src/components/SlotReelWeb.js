// src/components/SlotReelWeb.js
import React, { useState, useEffect, useRef } from 'react';
import './SlotReelWeb.css'; 

const SlotReelWeb = ({ symbols, finalValueIndex, isSpinning, highlightType }) => {
  const reelDisplayHeight = 270; 
  const numberOfSymbolsInView = 3; 
  const singleSymbolFullHeight = 90; 

  const reelRef = useRef(null);

  const animationDuration = 2000; 


  const numFullSpins = 5; 
  
  const targetSymbol = symbols[finalValueIndex % symbols.length];

  let finalSequence = [];

  for (let i = 0; i < (symbols.length * numFullSpins); i++) {
    finalSequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  const symbolAboveTarget = symbols[(finalValueIndex - 1 + symbols.length) % symbols.length];
  
  finalSequence.push(symbolAboveTarget); 
  finalSequence.push(targetSymbol);       
  finalSequence.push(symbols[(finalValueIndex + 1) % symbols.length]); 

  const centralSymbolIndexInFinalSequence = finalSequence.length - 2; 


  useEffect(() => {
    if (isSpinning) {
      const targetSymbolTopPositionInReel = centralSymbolIndexInFinalSequence * singleSymbolFullHeight;

      const targetTranslateY = -(
        targetSymbolTopPositionInReel - 
        (reelDisplayHeight / 2) + 
        (singleSymbolFullHeight / 2)
      );

      if (reelRef.current) {
        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = `translateY(${-Math.random() * (finalSequence.length * singleSymbolFullHeight * 0.5)}px)`;
        const _ = reelRef.current.offsetWidth; 
      }

      if (reelRef.current) {
        reelRef.current.style.transition = `transform ${animationDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`; 
        reelRef.current.style.transform = `translateY(${targetTranslateY}px)`;
      }

    } else {
      const finalRestingTranslateY = -(
        (centralSymbolIndexInFinalSequence * singleSymbolFullHeight) -
        (reelDisplayHeight / 2) +
        (singleSymbolFullHeight / 2)
      );

      if (reelRef.current) {
        reelRef.current.style.transition = 'none'; 
        reelRef.current.style.transform = `translateY(${finalRestingTranslateY}px)`;
      }
    }
  }, [isSpinning, finalValueIndex, symbols, animationDuration, singleSymbolFullHeight, reelDisplayHeight, finalSequence, highlightType, numberOfSymbolsInView]); 


  return (
    <div className={`slot-reel-wrapper-web ${highlightType}`} style={{ height: reelDisplayHeight + 'px', width: singleSymbolFullHeight + 'px' }}>
      
      <div
        ref={reelRef}
        className="slot-reel-web"
      >
        {finalSequence.map((symbolFileName, index) => {
          const isCenteredSymbol = !isSpinning && 
                                  (index === centralSymbolIndexInFinalSequence); 

          return (
            <div
              key={index}
              className={`slot-symbol-web ${isCenteredSymbol ? highlightType : ''}`} 
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