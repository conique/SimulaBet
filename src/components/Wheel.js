// src/components/Wheel.js
import React, { useEffect, useRef, useCallback } from 'react';
import './Wheel.css';

const Wheel = ({ spinning, winningNumber, americanNumbers, numberColors }) => {
  const canvasRef = useRef(null);
  const currentAngleRef = useRef(0);
  const animationFrameIdRef = useRef(null); 
  const wheelRadius = 150; 
  const textRadius = wheelRadius * 0.85; 
  const centerX = wheelRadius + 10; 
  const centerY = wheelRadius + 10;
  const SPIN_SPEED = 0.25;

  const drawWheel = useCallback((ctx, angleOffset = 0) => {
    if (!ctx || !ctx.canvas) return;
    if (!americanNumbers || americanNumbers.length === 0 || !numberColors) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }
    const numSections = americanNumbers.length;
    if (numSections === 0) return;
    const arcSize = (2 * Math.PI) / numSections;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < numSections; i++) {
      const angle = angleOffset + i * arcSize;
      const numberValue = americanNumbers[i];
      const color = numberColors[numberValue] || 'grey';

      ctx.beginPath(); ctx.fillStyle = color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, angle, angle + arcSize);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.fillStyle = (color === 'green') ? 'black' : 'white'; 
      ctx.fillText(numberValue, textRadius, 0); 
      ctx.restore();
    }
    ctx.beginPath(); ctx.fillStyle = '#888'; 
    ctx.arc(centerX, centerY, wheelRadius * 0.25, 0, 2 * Math.PI);
    ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.fillStyle = '#bbb'; 
    ctx.arc(centerX, centerY, wheelRadius * 0.15, 0, 2 * Math.PI);
    ctx.fill();
  }, [americanNumbers, numberColors, centerX, centerY, wheelRadius, textRadius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = (wheelRadius + 10) * 2;
    canvas.height = (wheelRadius + 10) * 2;
    drawWheel(ctx, currentAngleRef.current);
  }, [drawWheel]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !americanNumbers || americanNumbers.length === 0) return;
    const ctx = canvas.getContext('2d');
    let isActive = true;

    const spinLoop = () => {
      if (!isActive || !spinning) {
        cancelAnimationFrame(animationFrameIdRef.current);
        return;
      }
      currentAngleRef.current += SPIN_SPEED;
      currentAngleRef.current %= (2 * Math.PI);
      drawWheel(ctx, currentAngleRef.current);
      animationFrameIdRef.current = requestAnimationFrame(spinLoop);
    };

    if (spinning) {
      animationFrameIdRef.current = requestAnimationFrame(spinLoop);
    } else {
      cancelAnimationFrame(animationFrameIdRef.current);

      if (winningNumber !== null && americanNumbers.includes(winningNumber)) {
        const winningIndex = americanNumbers.indexOf(winningNumber);
        const numSections = americanNumbers.length;
        const arcSize = (2 * Math.PI) / numSections;
        
        let finalAngle = (-Math.PI / 2) - (winningIndex * arcSize) - (arcSize / 2);
        finalAngle = (finalAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

        currentAngleRef.current = finalAngle; 
        drawWheel(ctx, currentAngleRef.current);
      } else {
        drawWheel(ctx, currentAngleRef.current);
      }
    }
    
    return () => { 
      isActive = false;
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [spinning, winningNumber, americanNumbers, numberColors, drawWheel, SPIN_SPEED]);

  return (
    <div className="roulette-wheel-container-css"> 
      <div className="roulette-pointer-css"></div> 
      <canvas ref={canvasRef} />
      {(!americanNumbers || americanNumbers.length === 0) && (
          <div className="wheel-error">Carregando Roleta...</div>
      )}
    </div>
  );
};

export default Wheel;