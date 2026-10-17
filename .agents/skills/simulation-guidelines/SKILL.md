---
name: simulation-guidelines
description: >
  Enforces a single unified responsive layout law, soft light-blue study
  environment palette, cross-device readability (phone, tablet, PC), and
  zero-dependency vanilla web architecture (HTML5, CSS3, ES6+ JS, Canvas 2D,
  Web Audio, Web Speech) for interactive STEM simulations and virtual labs.
  Use whenever creating, styling, refactoring, or debugging simulations,
  physics engines, canvas renderers, or telemetry HUDs.
---

# STEM Simulation Architect

Build and maintain interactive science and math simulations governed by one unified responsive design law, a distraction-free soft light-blue study environment, and a pure vanilla web stack that remains crisp and readable across phones, tablets, and desktop screens.

## When to Use

- Creating a new interactive physics, chemistry, biology, or math simulation (such as Diamond Refraction / Snell's Law, pendulums, circuits, or molecular dynamics)
- Refactoring existing simulation screens to fix layout blowouts, inconsistent breakpoints, or unreadable mobile/tablet text
- Designing or updating Canvas 2D renderers, telemetry strip charts, floating glassmorphic HUDs, or parameter sidebars
- Adding procedural Web Audio SFX or Web Speech Hinglish voice prompts to virtual labs

## Steps

### 1. Enforce the Study Environment and Color Law

Maintain a calm, academic aesthetic across every screen so students can focus on physical phenomena without visual fatigue.

- **Soft Light-Blue Background Only:** Always set the page and canvas backgrounds to a soft light-blue palette (`--bg-page: #F0F7FF`, `--bg-canvas: #E6F2FF`, `--surface: #FFFFFF`, `--border: #CBD5E1`). Never use pure black (`#000000`) or dark-mode canvas backdrops.
- **High-Contrast Creative Accents:** Use creative, vibrant colors for light rays, vectors, wavefronts, and apparatus components, ensuring at least a 4.5:1 contrast ratio for text and 3:1 for graphical vectors against `--bg-canvas`.
- **Minimal Emoticons:** Keep emojis and emoticons to an absolute minimum. Prefer clean geometric glyphs, SVG icons, or standard scientific symbols (θ, λ, Δ, Ω) to preserve a serious study environment.

### 2. Use the Zero-Dependency Vanilla Tech Stack

Build every simulation to run directly in any modern browser without build steps, bundlers, or external libraries.

- **HTML5:** Use semantic structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<canvas>`).
- **Vanilla CSS3:** Use CSS Custom Variables, CSS Grid, Flexbox, glassmorphism (`backdrop-filter: blur(8px)`), and keyframe micro-animations. Never introduce Tailwind, Bootstrap, Sass, or Less.
- **Vanilla ES6+ JavaScript:** Use native ES Modules (`type="module"`) or clean modular namespaces/IIFEs. Never import React, Vue, jQuery, Three.js, or Chart.js.
- **Mathematical Rigor:** Use RK4 (Runge-Kutta 4th Order) numerical integration for nonlinear differential equations, and exact analytical equations for optics (Snell's Law, Fresnel transmission, Cauchy dispersion $n(\lambda) = A + B/\lambda^2$), circuits (nodal and Thévenin analysis), and biophysics.
- **Procedural Audio and Speech:** Synthesize all sound effects dynamically via `AudioContext` (`OscillatorNode`, `GainNode`, `BiquadFilterNode`) with zero external audio files. Use `window.speechSynthesis` for spoken Hinglish mnemonics and guided prompts.
- **Dual-Font System (Google Fonts CDN):**
  - `Plus Jakarta Sans` and `Inter` for all UI navigation, card headers, control labels, and legends.
  - `JetBrains Mono` strictly for numerical readouts, formulas, coordinates, timestamps, and live data tables.

### 3. Apply the Single Unified Workspace Layout Law

Replace varying sidebar widths and inconsistent media queries with one universal CSS Grid architecture across all simulations:

```css
:root {
  --bg-page: #F0F7FF;
  --bg-canvas: #E6F2FF;
  --surface: #FFFFFF;
  --surface-glass: rgba(255, 255, 255, 0.90);
  --text-main: #0F172A;
  --text-muted: #475569;
  --border: #CBD5E1;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  margin: 0;
}

.main-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
}

/* Tablet and below: collapse to a single stacked column */
@media (max-width: 1080px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .control-sidebar,
  .sidebar-panel {
    width: 100%;
    max-width: 100%;
    max-height: none;
  }
}

/* Phone ergonomics: full-width stacked stage controls */
@media (max-width: 768px) {
  .main-layout {
    padding: 10px;
    gap: 12px;
  }
  .stage-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
```

- **Zero-Blowout Guarantee:** Always keep `minmax(0, 1fr)` on the primary canvas column and `min-width: 0` on grid children so wide canvases or telemetry tables never push the layout wider than the viewport.
- **Touch Targets:** Ensure all interactive buttons, sliders, and toggles have a minimum hit area of 44px × 44px on touch devices.

### 4. Implement Responsive Canvas Sizing and Cross-Device Readability

Ensure the simulation canvas and its internal labels scale cleanly across PC, tablet, and phone screens.

- **Unified Container Heights:**
  - Desktop (> 1080px): `height: 540px; min-height: 480px;`
  - Tablet (769px to 1080px): `height: 460px; min-height: 420px;`
  - Phone (≤ 768px): `height: 360px; min-height: 320px;`
- **Canvas Element Rules:** Set `width: 100%; height: 100%; display: block; background: var(--bg-canvas); touch-action: none;` on `<canvas>` so pointer dragging on mobile does not scroll the page.
- **HiDPI / Retina Auto-Rescaling:** On `window.resize` and after layout/drawer transitions (`setTimeout(..., 320)`), measure the wrapper with `getBoundingClientRect()` and scale by `window.devicePixelRatio`:

```javascript
resize() {
  const rect = this.canvas.parentElement.getBoundingClientRect();
  this.dpr = window.devicePixelRatio || 1;
  this.width = rect.width;
  this.height = rect.height;
  this.canvas.width = Math.round(this.width * this.dpr);
  this.canvas.height = Math.round(this.height * this.dpr);
  this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
}
```

- **Proportional Apparatus Coordinates:** Compute all optical benches, prisms, diamonds, and focal points as fractions of `this.width` and `this.height` (for example, `this.centerX = this.width * 0.5`), never static pixel offsets.
- **Readable In-Canvas Typography:** Never hardcode tiny 8px canvas text. Compute responsive font sizes using `const fontSize = Math.max(11, Math.min(14, Math.round(this.width * 0.018)));` with `JetBrains Mono` for angle/telemetry callouts and `Inter` for annotations so labels remain legible on small phone screens.
- **Contextual Cursors:** Default the canvas to `cursor: crosshair;`, switching dynamically during hit-testing to `ew-resize` (horizontal sliders/jockeys), `ns-resize` (vertical heights), or `grab`/`grabbing` (draggable masses and light sources).

### 5. Standardize Floating HUDs, Legends, and Telemetry Grids

Keep overlays and live data cards clean, non-blocking, and truncation-safe across all breakpoints.

- **Pass-Through Floating HUDs:** Position `.canvas-hud-top` and `.canvas-overlay-hint` with `position: absolute; top: 14px; left: 16px; right: 16px; pointer-events: none;`. Apply `pointer-events: auto;` and `background: var(--surface-glass); backdrop-filter: blur(8px);` only to interactive child pills and buttons.
- **Unified Telemetry Card Grid:**
  - Desktop (> 1080px): `grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;`
  - Tablet and Large Phone (481px to 1080px): `grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;`
  - Compact Phone (≤ 480px): `grid-template-columns: 1fr; gap: 8px;`
- **Micro-Typography and Truncation Guards:**
  - Style `.step-label` and `.telemetry-card-title` with `font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);`.
  - Protect all numerical value containers with `font-family: 'JetBrains Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;`.
- **Controlled Horizontal Scroll for Wide Reference Views:** When a component requires fixed spatial columns (such as an 18-column Periodic Table with `min-width: 950px`), wrap it in an `overflow-x: auto;` container with a 6px custom scrollbar rather than squishing columns on mobile.

## Gotchas

- **Grid Blowout from Canvas or Tables:** Forgetting `minmax(0, 1fr)` on `.main-layout` or `min-width: 0` on telemetry cards will cause the canvas resize loop to expand infinitely on mobile viewports.
- **Unreadable Canvas Legends on Phones:** Drawing in-canvas legends at 8px makes them unreadable on mobile devices. Always clamp canvas font sizes to at least 11px and anchor legend boxes relative to plot bounds (`gx + gw - legendWidth - 12, gy + 16`).
- **Dark Mode Drift:** Do not default to dark slate (`#0F172A`) backgrounds for optics or ray-tracing canvases. Keep the canvas background soft light-blue (`#E6F2FF`) and achieve ray visibility using saturated jewel tones (deep sapphire, ruby, emerald, amber) and subtle outer glow strokes.
