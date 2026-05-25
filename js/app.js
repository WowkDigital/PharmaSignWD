import { state } from './state.js';
import { modes } from './constants.js';
import { 
  els, 
  buildGrid, 
  updateGridColors, 
  updateUI, 
  renderModes, 
  renderColors, 
  setTab,
  updateModeSpecificPanel
} from './ui.js';

let intervalId = null;
let autoSwitchIntervalId = null;
const cycleModes = ['pulse', 'spiral', 'snake', 'checker', 'radar', 'heartbeat', 'ripple', 'sparkle', 'text', 'clock'];

function startAutoSwitch() {
  if (autoSwitchIntervalId) {
    clearInterval(autoSwitchIntervalId);
    autoSwitchIntervalId = null;
  }
  if (state.autoSwitch) {
    autoSwitchIntervalId = setInterval(() => {
      if (!state.isPlaying) return;
      
      const currentIdx = cycleModes.indexOf(state.animation);
      const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % cycleModes.length;
      state.animation = cycleModes[nextIdx];
      
      const modeObj = modes.find(m => m.id === state.animation);
      if (els.dashMode && modeObj) {
        els.dashMode.textContent = modeObj.name;
      }
      renderModes();
      updateModeSpecificPanel();
      updateGridColors();
    }, state.switchInterval * 1000);
  }
}

// ANIMATION LOOP
function loop() {
  if (state.isPlaying) {
    state.tick++;
    updateGridColors();
  }
}

function startAnimationLoop() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(loop, 45 / state.speed);
}

// APPLICATION INITIALIZATION
function init() {
  // Tabs
  els.tabBtnDisplay.addEventListener('click', () => setTab('display'));
  els.tabBtnSettings.addEventListener('click', () => setTab('settings'));

  // Play / Pause / Reset
  els.btnPlay.addEventListener('click', () => {
    state.isPlaying = !state.isPlaying;
    updateUI();
  });
  els.btnReset.addEventListener('click', () => {
    state.tick = 0;
    updateGridColors();
  });

  // Settings sliders
  els.inputGridSize.addEventListener('input', (e) => {
    state.gridSize = parseInt(e.target.value);
    buildGrid();
    updateUI();
  });

  els.inputSpeed.addEventListener('input', (e) => {
    state.speed = parseFloat(e.target.value);
    updateUI();
    startAnimationLoop();
  });

  // Glow toggle
  els.btnGlow.addEventListener('click', () => {
    state.glow = !state.glow;
    updateUI();
    updateGridColors();
  });

  // Low power toggle
  els.btnLowPower.addEventListener('click', () => {
    state.lowPower = !state.lowPower;
    updateUI();
    updateGridColors();
  });

  // Night mode toggle
  els.btnNightMode.addEventListener('click', () => {
    state.nightMode = !state.nightMode;
    updateUI();
    updateGridColors();
  });

  // Auto switch toggles
  if (els.btnAutoSwitch) {
    els.btnAutoSwitch.addEventListener('click', () => {
      state.autoSwitch = !state.autoSwitch;
      updateUI();
      startAutoSwitch();
    });
  }

  if (els.inputSwitchInterval) {
    els.inputSwitchInterval.addEventListener('input', (e) => {
      state.switchInterval = parseInt(e.target.value);
      updateUI();
      startAutoSwitch();
    });
  }

  // Listening to manual mode changes to reset timer
  window.addEventListener('mode-changed', () => {
    startAutoSwitch();
  });

  // Initial UI components render
  renderModes();
  renderColors();
  buildGrid();
  updateUI();
  startAnimationLoop();
  startAutoSwitch();
  // Initialize WowkDigitalFooter
  if (typeof WowkDigitalFooter !== 'undefined') {
    WowkDigitalFooter.init({
      siteName: 'PHARMA-SIGN',
      container: 'body',
      brandName: 'Wowk Digital',
      brandUrl: 'https://github.com/WowkDigital',
      showHubLink: true,
      hubUrl: 'https://wowkdigital.github.io/WD_HUB/'
    });
  }
}

// Start application!
init();
