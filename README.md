# 🏥 PHARMA-SIGN v3.0 PRO — Pharmacy LED Sign Simulator

PHARMA-SIGN is an interactive, premium-grade **LED Matrix Simulator** specifically tailored for pharmacy cross-shaped displays. Designed with a sleek, responsive Tailwind UI, this simulator offers dynamic animations, custom drawing capabilities, color themes, real-time power/active-LED diagnostics, and modular JavaScript code under the hood.

👉 **Live Demo (GitHub Pages)**: Once deployed, this app runs instantly in any static environment.

---

## ✨ Features

- **11 Operation Modes**:
  - **Pulsing**: Smooth breathing glow.
  - **Spiral**: Panning radial light beam.
  - **Outer Snake**: Realistic perimeter movement with tail decay.
  - **Checkerboard**: Classic blinking grid.
  - **Smooth Radar**: Angular sweeping beam.
  - **ECG / Heart**: Dual-phase heartbeat impulse.
  - **Water Ripple**: Radial wave propagation.
  - **Sparkling**: Random organic twinkling.
  - **LED Text**: Scrollable, customized sign text.
  - **Clock & Temp**: Real-time clock synchronized with temperature.
  - **Drawing**: Interaktiv paint-brush canvas to design custom layouts.
- **6 Premium Color Profiles**: Green (Emerald), Red (Ruby), Blue (Sapphire), Amber, Cool White, and **Rainbow RGB** (dynamically changes overall UI theme color).
- **Diagnostic Dashboard**: Dynamic display of active LED counts and estimated power draw in watts (calculated based on mode, count, and power state).
- **Environment Modes**:
  - **Low Power Mode**: 65% dimming, disables glow, reduces estimated power draw.
  - **Night Mode**: Jet-black background protect eyes.
- **Modular ES6 Architecture**: Structured modules (`js/`, `css/`) for separation of concerns.

---

## 📂 Project Structure

```text
PHARMA-SIGN/
├── css/
│   └── style.css          # Core CSS variables and keyframe animations
├── js/
│   ├── constants.js       # Matrix font database, modes list, color definitions
│   ├── state.js           # Global application state
│   ├── animations.js      # Core math-heavy animation logic
│   ├── ui.js              # DOM management, grid drawing, and rendering
│   └── app.js             # Entry point initializing listeners & animation loop
├── index.html             # Main HTML5 UI layout
├── server.js              # Lightweight zero-dependency Node.js dev server
└── README.md              # Project documentation
```

---

## 🚀 Quick Start

### Running Locally
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. In the project directory, run:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:8085/
   ```

### Deploying to GitHub Pages
Since the application runs entirely in the browser (static HTML/CSS/JS):
1. Create a new repository on GitHub.
2. Push this folder to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of PHARMA-SIGN modular simulator"
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
3. Go to repository **Settings** -> **Pages**.
4. In the **Build and deployment** section, select **Deploy from a branch** and choose your branch (usually `main`), folder `/ (root)`. Click **Save**.
5. Your application will be live at `https://your-username.github.io/your-repo-name/` within minutes!

---

## 🛡️ License

This project is open-source and licensed under the **MIT License**.
