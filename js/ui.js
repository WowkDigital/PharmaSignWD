import { state } from './state.js';
import { modes, colors } from './constants.js';
import { getLEDIntensity, calculateCrossBorderPath, isInsideCross } from './animations.js';

// SVG CONSTANTS FOR PLAY / PAUSE
const iconPlay = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const iconPause = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

// DOM ELEMENTS
export const els = {
  bodyContainer: document.getElementById('body-container'),
  svgGrid: document.getElementById('svg-grid'),
  svgCirclesGroup: document.getElementById('led-circles'),
  svgWrapper: document.getElementById('svg-wrapper'),
  btnPlay: document.getElementById('btn-play'),
  btnReset: document.getElementById('btn-reset'),
  iconPlayContainer: document.getElementById('icon-play-container'),
  textPlay: document.getElementById('text-play'),
  tabBtnDisplay: document.getElementById('tab-btn-display'),
  tabBtnSettings: document.getElementById('tab-btn-settings'),
  tabDisplay: document.getElementById('tab-display'),
  tabSettings: document.getElementById('tab-settings'),
  inputGridSize: document.getElementById('input-grid-size'),
  valGridSize: document.getElementById('val-grid-size'),
  inputSpeed: document.getElementById('input-speed'),
  valSpeed: document.getElementById('val-speed'),
  btnGlow: document.getElementById('btn-glow'),
  glowIndicator: document.getElementById('glow-indicator'),
  dashActiveCount: document.getElementById('dash-active-count'),
  dashMode: document.getElementById('dash-mode'),
  dashPower: document.getElementById('dash-power'),
  btnLowPower: document.getElementById('btn-low-power'),
  lblLowPower: document.getElementById('lbl-low-power'),
  btnNightMode: document.getElementById('btn-night-mode'),
  lblNightMode: document.getElementById('lbl-night-mode'),
  btnAutoSwitch: document.getElementById('btn-auto-switch'),
  autoSwitchIndicator: document.getElementById('auto-switch-indicator'),
  autoSwitchSettings: document.getElementById('auto-switch-settings'),
  inputSwitchInterval: document.getElementById('input-switch-interval'),
  valSwitchInterval: document.getElementById('val-switch-interval')
};

let circlesRefs = [];
let isDrawingMouseDown = false;

// BUILD LED GRID IN SVG
export function buildGrid() {
  els.svgGrid.setAttribute('viewBox', `0 0 ${state.gridSize * 20} ${state.gridSize * 20}`);
  els.svgCirclesGroup.innerHTML = '';
  circlesRefs = [];
  calculateCrossBorderPath();

  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x * 20 + 10);
      circle.setAttribute('cy', y * 20 + 10);
      circle.setAttribute('class', 'transition-all duration-100');
      circle.setAttribute('data-x', x);
      circle.setAttribute('data-y', y);

      // Click listeners for drawing
      circle.addEventListener('mousedown', (e) => {
        if (state.animation === 'draw') {
          isDrawingMouseDown = true;
          toggleDrawLED(x, y);
          e.preventDefault();
        }
      });

      circle.addEventListener('mouseenter', () => {
        if (state.animation === 'draw' && isDrawingMouseDown) {
          setDrawLED(x, y, true);
        }
      });

      els.svgCirclesGroup.appendChild(circle);
      circlesRefs.push({ x, y, el: circle });
    }
  }
  updateGridColors();
}

// CUSTOM DRAWING
function toggleDrawLED(x, y) {
  if (!isInsideCross(x, y)) return;
  const key = `${x},${y}`;
  if (state.customDesign.has(key)) {
    state.customDesign.delete(key);
  } else {
    state.customDesign.add(key);
  }
  updateGridColors();
}

function setDrawLED(x, y, turnOn) {
  if (!isInsideCross(x, y)) return;
  const key = `${x},${y}`;
  if (turnOn) {
    state.customDesign.add(key);
  } else {
    state.customDesign.delete(key);
  }
  updateGridColors();
}

// UPDATE GRID COLORS
export function updateGridColors() {
  let activeCount = 0;
  const tickForColors = state.tick;

  circlesRefs.forEach(({ x, y, el }) => {
    let intensity = getLEDIntensity(x, y);
    
    // Reduce intensity in Low Power Mode
    if (state.lowPower) {
      intensity *= 0.35;
    }

    const isActive = intensity > 0.05;
    if (isActive) activeCount++;

    el.setAttribute('r', isActive ? 6 : 4);
    
    let fillColor = '#171717';
    if (isActive) {
      if (state.color === 'emerald') {
        fillColor = `rgba(16, 185, 129, ${intensity})`;
      } else if (state.color === 'ruby') {
        fillColor = `rgba(239, 68, 68, ${intensity})`;
      } else if (state.color === 'sapphire') {
        fillColor = `rgba(59, 130, 246, ${intensity})`;
      } else if (state.color === 'amber') {
        fillColor = `rgba(245, 158, 11, ${intensity})`;
      } else if (state.color === 'coolwhite') {
        fillColor = `rgba(244, 244, 245, ${intensity})`;
      } else if (state.color === 'rainbow') {
        const hue = (x * 12 + y * 12 + tickForColors * 2.5) % 360;
        fillColor = `hsla(${hue}, 90%, 60%, ${intensity})`;
      }
    }
    el.setAttribute('fill', fillColor);

    // Apply glow effect
    if (state.glow && isActive && !state.lowPower) {
      el.setAttribute('filter', 'url(#ledGlow)');
    } else {
      el.removeAttribute('filter');
    }
  });

  // Update diagnostic dashboard
  els.dashActiveCount.textContent = activeCount;
  const calculatedPower = Math.round(2 + activeCount * (state.lowPower ? 0.03 : 0.09) * (state.gridSize / 15));
  els.dashPower.textContent = `${calculatedPower} W`;

  updateThemeColors();
}

// DYNAMICALLY WRITE THEME COLOR TO CSS VARIABLES
export function updateThemeColors() {
  let colorVal = '#10b981';
  let bgOpacityVal = 'rgba(16, 185, 129, 0.1)';
  let borderOpacityVal = 'rgba(16, 185, 129, 0.35)';
  let glowShadow = 'rgba(16, 185, 129, 0.25)';
  
  if (state.color === 'ruby') {
    colorVal = '#ef4444';
    bgOpacityVal = 'rgba(239, 68, 68, 0.1)';
    borderOpacityVal = 'rgba(239, 68, 68, 0.35)';
    glowShadow = 'rgba(239, 68, 68, 0.25)';
  } else if (state.color === 'sapphire') {
    colorVal = '#3b82f6';
    bgOpacityVal = 'rgba(59, 130, 246, 0.1)';
    borderOpacityVal = 'rgba(59, 130, 246, 0.35)';
    glowShadow = 'rgba(59, 130, 246, 0.25)';
  } else if (state.color === 'amber') {
    colorVal = '#f59e0b';
    bgOpacityVal = 'rgba(245, 158, 11, 0.1)';
    borderOpacityVal = 'rgba(245, 158, 11, 0.35)';
    glowShadow = 'rgba(245, 158, 11, 0.25)';
  } else if (state.color === 'coolwhite') {
    colorVal = '#f4f4f5';
    bgOpacityVal = 'rgba(244, 244, 245, 0.08)';
    borderOpacityVal = 'rgba(244, 244, 245, 0.25)';
    glowShadow = 'rgba(244, 244, 245, 0.18)';
  } else if (state.color === 'rainbow') {
    const hue = (state.tick * 2) % 360;
    colorVal = `hsl(${hue}, 90%, 60%)`;
    bgOpacityVal = `hsla(${hue}, 90%, 60%, 0.1)`;
    borderOpacityVal = `hsla(${hue}, 90%, 60%, 0.35)`;
    glowShadow = `hsla(${hue}, 90%, 60%, 0.25)`;
  }

  document.documentElement.style.setProperty('--primary-color', colorVal);
  document.documentElement.style.setProperty('--primary-bg-opacity', bgOpacityVal);
  document.documentElement.style.setProperty('--primary-border-opacity', borderOpacityVal);
  
  const logoIcon = document.getElementById('header-logo-icon');
  if (logoIcon) {
    logoIcon.style.color = colorVal;
  }

  // Update glow shadow for SVG container
  if (state.glow && !state.lowPower) {
    els.svgWrapper.style.boxShadow = `0 0 80px ${glowShadow}`;
  } else {
    els.svgWrapper.style.boxShadow = 'none';
  }
}

// UPDATE MODE SELECTION BUTTONS
export function renderModes() {
  const grid = document.getElementById('modes-grid');
  if (!grid) return;

  grid.innerHTML = modes.map(mode => {
    const isActive = state.animation === mode.id;
    const activeClass = isActive
      ? 'theme-bg-opacity theme-border-opacity theme-text border-2'
      : 'bg-neutral-800/40 border-transparent text-neutral-400 hover:bg-neutral-800/80 border-2';

    return `
      <button data-mode="${mode.id}" id="mode-btn-${mode.id}" class="mode-btn p-3 rounded-2xl text-left transition-all capitalize ${activeClass}">
        <div class="text-[9px] font-bold opacity-50 mb-1 uppercase tracking-wide">MODE</div>
        <div class="font-bold text-xs truncate">${mode.name}</div>
      </button>
    `;
  }).join('');

  // Button events
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.animation = e.currentTarget.dataset.mode;
      els.dashMode.textContent = modes.find(m => m.id === state.animation).name;
      renderModes();
      updateModeSpecificPanel();
      updateGridColors();
      window.dispatchEvent(new CustomEvent('mode-changed'));
    });
  });
}

// DYNAMIC PANEL STRUCTURE FOR SPECIFIC MODES (DRAW / TEXT / CLOCK)
export function updateModeSpecificPanel() {
  const container = document.getElementById('mode-specific-container');
  if (!container) return;

  if (state.animation === 'text') {
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="space-y-2">
        <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Custom LED Text</label>
        <div class="flex gap-2">
          <input id="input-custom-text" type="text" value="${state.text}" 
            class="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 font-semibold"
            placeholder="Type something..." maxlength="30" />
          <button id="btn-text-update" class="px-4 py-2 theme-bg hover:brightness-110 text-neutral-950 rounded-xl text-xs font-bold transition-all">
            OK
          </button>
        </div>
      </div>
    `;

    const input = document.getElementById('input-custom-text');
    const btn = document.getElementById('btn-text-update');
    const applyText = () => {
      const val = input.value.trim();
      state.text = val ? val : "PHARMACY";
    };

    btn.addEventListener('click', applyText);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyText();
    });
  } else if (state.animation === 'draw') {
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Drawing Editor</span>
          <p class="text-[9px] text-neutral-500 mt-1">Click or drag cursor on LEDs to draw.</p>
        </div>
        <button id="btn-clear-draw" class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-red-400 border border-neutral-700 rounded-lg text-[10px] font-bold transition-colors">
          CLEAR
        </button>
      </div>
    `;

    document.getElementById('btn-clear-draw').addEventListener('click', () => {
      state.customDesign.clear();
      updateGridColors();
    });
  } else if (state.animation === 'clock') {
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="theme-text">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <div class="text-[10px] text-neutral-400">
          <span class="font-bold block uppercase tracking-wider">Local Clock & Temperature</span>
          <p class="text-neutral-500 mt-0.5">Automatic time & temperature sync.</p>
        </div>
      </div>
    `;
  } else {
    container.classList.add('hidden');
  }
}

// UPDATE COLOR PICKER BUTTONS
export function renderColors() {
  const container = document.getElementById('color-picker');
  if (!container) return;

  container.innerHTML = colors.map(col => {
    const isActive = state.color === col.id;
    const activeStyle = isActive 
      ? 'border-white scale-110 shadow-lg shadow-black/60' 
      : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105';
    
    let bgStyle = `background: ${col.primary};`;
    if (col.id === 'rainbow') {
      bgStyle = `background: linear-gradient(135deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6);`;
    }

    return `
      <button data-color="${col.id}" title="${col.name}" id="color-btn-${col.id}"
        style="${bgStyle}" 
        class="color-picker-btn w-8 h-8 rounded-full border-2 transition-all ${activeStyle}">
      </button>
    `;
  }).join('');

  document.querySelectorAll('.color-picker-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.color = e.currentTarget.dataset.color;
      renderColors();
      updateUI();
      updateGridColors();
    });
  });
}

// UPDATE UI CONTROLS & LABELS
export function updateUI() {
  // Glow toggle
  if (state.glow) {
    els.btnGlow.className = "w-12 h-6 rounded-full transition-colors relative theme-bg";
    els.glowIndicator.className = "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-6";
  } else {
    els.btnGlow.className = "w-12 h-6 rounded-full transition-colors relative bg-neutral-700";
    els.glowIndicator.className = "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform";
  }

  // Play / Pause state
  els.iconPlayContainer.innerHTML = state.isPlaying ? iconPause : iconPlay;
  els.textPlay.textContent = state.isPlaying ? 'PAUSE' : 'PLAY';

  // Slider values
  els.valGridSize.textContent = `${state.gridSize}x${state.gridSize}`;
  els.valSpeed.textContent = `${Number(state.speed).toFixed(1)}x`;

  // Auto switch toggle state
  if (els.btnAutoSwitch && els.autoSwitchIndicator && els.autoSwitchSettings) {
    if (state.autoSwitch) {
      els.btnAutoSwitch.className = "w-12 h-6 rounded-full transition-colors relative theme-bg";
      els.autoSwitchIndicator.className = "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-6";
      els.autoSwitchSettings.classList.remove('hidden');
    } else {
      els.btnAutoSwitch.className = "w-12 h-6 rounded-full transition-colors relative bg-neutral-700";
      els.autoSwitchIndicator.className = "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform";
      els.autoSwitchSettings.classList.add('hidden');
    }
  }

  if (els.valSwitchInterval) {
    els.valSwitchInterval.textContent = `${state.switchInterval}s`;
  }

  // Low power mode label
  if (state.lowPower) {
    els.btnLowPower.classList.add('theme-text');
    els.lblLowPower.textContent = "Low Power: ON";
  } else {
    els.btnLowPower.classList.remove('theme-text');
    els.lblLowPower.textContent = "Low Power: OFF";
  }

  // Night mode label
  if (state.nightMode) {
    els.btnNightMode.classList.add('theme-text');
    els.lblNightMode.textContent = "Night Mode: ON";
    els.bodyContainer.className = "min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-emerald-500/30 transition-colors duration-500";
  } else {
    els.btnNightMode.classList.remove('theme-text');
    els.lblNightMode.textContent = "Night Mode: OFF";
    els.bodyContainer.className = "min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-neutral-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-emerald-500/30 transition-colors duration-500";
  }
}

// SWITCH TABS
export function setTab(tabName) {
  state.activeTab = tabName;
  const isDisplay = tabName === 'display';

  // Button styles
  els.tabBtnDisplay.className = `pb-3 px-4 text-sm font-semibold transition-all ${isDisplay ? 'theme-text border-b-2 theme-border' : 'text-neutral-500 hover:text-neutral-300'}`;
  els.tabBtnSettings.className = `pb-3 px-4 text-sm font-semibold transition-all ${!isDisplay ? 'theme-text border-b-2 theme-border' : 'text-neutral-500 hover:text-neutral-300'}`;

  // Tab visibility
  if (isDisplay) {
    els.tabDisplay.classList.remove('hidden');
    els.tabSettings.classList.add('hidden');
  } else {
    els.tabDisplay.classList.add('hidden');
    els.tabSettings.classList.remove('hidden');
  }
}

// Mouse down event for drawing
els.svgGrid.addEventListener('mousedown', (e) => {
  if (state.animation === 'draw') {
    isDrawingMouseDown = true;
    e.preventDefault();
  }
});

// MOUSE UP EVENT FOR DRAWING
window.addEventListener('mouseup', () => {
  isDrawingMouseDown = false;
});
