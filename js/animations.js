import { state } from './state.js';
import { FONT_5X7 } from './constants.js';

// GENERATE OUTER PATH FOR SNAKE ANIMATION
export function calculateCrossBorderPath() {
  const center = Math.floor(state.gridSize / 2);
  const thickness = Math.floor(state.gridSize / 3);
  const halfThick = Math.floor(thickness / 2);
  const minVal = center - halfThick;
  const maxVal = center + halfThick;
  const N = state.gridSize;

  const path = [];

  // 1. Go down from (minVal, 0) to (minVal, minVal - 1)
  for (let y = 0; y < minVal; y++) path.push({ x: minVal, y });
  // 2. Go left from (minVal, minVal) to (1, minVal)
  for (let x = minVal; x > 0; x--) path.push({ x, y: minVal });
  // 3. Go down from (0, minVal) to (0, maxVal - 1)
  for (let y = minVal; y < maxVal; y++) path.push({ x: 0, y });
  // 4. Go right from (0, maxVal) to (minVal - 1, maxVal)
  for (let x = 0; x < minVal; x++) path.push({ x, y: maxVal });
  // 5. Go down from (minVal, maxVal) to (minVal, N - 2)
  for (let y = maxVal; y < N - 1; y++) path.push({ x: minVal, y });
  // 6. Go right from (minVal, N - 1) to (maxVal - 1, N - 1)
  for (let x = minVal; x < maxVal; x++) path.push({ x, y: N - 1 });
  // 7. Go up from (maxVal, N - 1) to (maxVal, maxVal + 1)
  for (let y = N - 1; y > maxVal; y--) path.push({ x: maxVal, y });
  // 8. Go right from (maxVal, maxVal) to (N - 2, maxVal)
  for (let x = maxVal; x < N - 1; x++) path.push({ x, y: maxVal });
  // 9. Go up from (N - 1, maxVal) to (N - 1, minVal + 1)
  for (let y = maxVal; y > minVal; y--) path.push({ x: N - 1, y });
  // 10. Go left from (N - 1, minVal) to (maxVal + 1, minVal)
  for (let x = N - 1; x > maxVal; x--) path.push({ x, y: minVal });
  // 11. Go up from (maxVal, minVal) to (maxVal, 1)
  for (let y = minVal; y > 0; y--) path.push({ x: maxVal, y });
  // 12. Go left from (maxVal, 0) to (minVal + 1, 0)
  for (let x = maxVal; x > minVal; x--) path.push({ x, y: 0 });

  state.borderPath = path;
}

// CHECK IF PIXEL IS INSIDE THE CROSS BOUNDARY
export function isInsideCross(x, y) {
  const center = Math.floor(state.gridSize / 2);
  const thickness = Math.floor(state.gridSize / 3);
  const halfThick = Math.floor(thickness / 2);

  const inVerticalBar = x >= center - halfThick && x <= center + halfThick;
  const inHorizontalBar = y >= center - halfThick && y <= center + halfThick;

  return inVerticalBar || inHorizontalBar;
}

// GET DYNAMIC TEMPERATURE
export function getDynamicTemperature() {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const baseTemp = 17.5 + 5.5 * Math.sin((hour - 6) / 24 * Math.PI * 2);
  const finalTemp = (baseTemp + Math.sin(minute * 0.5) * 0.3).toFixed(1);
  return `${finalTemp > 0 ? '+' : ''}${finalTemp}°C`;
}

// CALCULATE LED INTENSITY (0.05 to 1.0)
export function getLEDIntensity(x, y) {
  if (!isInsideCross(x, y)) return 0;

  const center = Math.floor(state.gridSize / 2);
  const dist = Math.sqrt(Math.pow(x - center, 2) + Math.pow(y - center, 2));
  const angle = Math.atan2(y - center, x - center);

  switch (state.animation) {
    case 'pulse':
      return 0.45 + 0.55 * Math.sin(state.tick * 0.08);

    case 'spiral':
      const spiralWave = (angle + (state.tick * 0.15) + (dist * 0.45)) % (Math.PI * 2);
      return Math.max(0.1, Math.abs(Math.sin(spiralWave)));

    case 'snake':
      const borderIdx = state.borderPath.findIndex(p => p.x === x && p.y === y);
      if (borderIdx !== -1) {
        const snakeLength = Math.max(6, Math.floor(state.gridSize * 0.5));
        const headIdx = Math.floor(state.tick * 0.75) % state.borderPath.length;
        const snakeDist = (headIdx - borderIdx + state.borderPath.length) % state.borderPath.length;
        if (snakeDist < snakeLength) {
          return 1.0 - (snakeDist / snakeLength) * 0.85;
        }
      }
      return 0.05;

    case 'checker':
      return (x + y + Math.floor(state.tick / 6)) % 2 === 0 ? 0.95 : 0.15;

    case 'radar':
      const scanAngle = (state.tick * 0.07) % (Math.PI * 2);
      let angleDiff = angle - scanAngle;
      while (angleDiff < 0) angleDiff += Math.PI * 2;
      while (angleDiff >= Math.PI * 2) angleDiff -= Math.PI * 2;
      const radarIntensity = angleDiff / (Math.PI * 2);
      return Math.max(0.08, Math.pow(radarIntensity, 2.5));

    case 'heartbeat':
      const hbCycle = state.tick % 24;
      let hbInt = 0.05;
      if (hbCycle < 3) {
        hbInt = Math.sin((hbCycle / 3) * Math.PI) * 0.8 + 0.2;
      } else if (hbCycle >= 5 && hbCycle < 9) {
        hbInt = Math.sin(((hbCycle - 5) / 4) * Math.PI) * 1.0 + 0.1;
      } else {
        const decay = hbCycle - 9;
        hbInt = 0.1 * Math.exp(-decay * 0.18);
      }
      return Math.max(0.05, hbInt);

    case 'ripple':
      const ripplePhase = state.tick * 0.22;
      const rWave = Math.sin(dist * 0.75 - ripplePhase);
      const rNorm = Math.max(0, (rWave + 1) / 2);
      return 0.05 + 0.95 * Math.pow(rNorm, 3.5);

    case 'sparkle':
      const noise = Math.sin(x * 12.9898 + y * 78.233 + state.tick * 0.6) * 43758.5453;
      const rnd = noise - Math.floor(noise);
      return rnd > 0.88 ? 1.0 : 0.05;

    case 'text':
    case 'clock':
      const rawText = state.animation === 'clock' 
        ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + "   " + getDynamicTemperature()
        : state.text;
      const paddedText = rawText + "       ";
      
      const fontY = y - (center - 3);
      if (fontY >= 0 && fontY < 7) {
        const colScroll = Math.floor(state.tick * 0.45);
        const colPos = x + colScroll;
        
        const charIndex = Math.floor(colPos / 6) % paddedText.length;
        const colIndex = colPos % 6;
        
        if (colIndex < 5) {
          const char = paddedText[charIndex].toUpperCase();
          const colByte = FONT_5X7[char] || FONT_5X7[' '];
          const isPixelOn = (colByte[colIndex] >> fontY) & 1;
          if (isPixelOn) {
            return 1.0;
          }
        }
      }
      return 0.05;

    case 'draw':
      return state.customDesign.has(`${x},${y}`) ? 1.0 : 0.05;

    default:
      return 1.0;
  }
}
