import { state } from './state.js';
import { 
  els, 
  buildGrid, 
  updateGridColors, 
  updateUI, 
  renderModes, 
  renderColors, 
  setTab 
} from './ui.js';

let intervalId = null;

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

  // Initial UI components render
  renderModes();
  renderColors();
  buildGrid();
  updateUI();
  startAnimationLoop();
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
