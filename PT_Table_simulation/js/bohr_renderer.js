/**
 * PeriodicLab — High-Performance 2D Bohr Atom Visualizer
 * Zero-lag 60 FPS HTML5 Canvas engine rendering concentric electron shells
 * (K, L, M, N, O, P, Q) with smooth orbiting electrons and nucleus telemetry.
 */

class BohrAtomRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true }) : null;
    this.currentElement = null;
    this.animFrameId = null;
    this.startTime = performance.now();
    this.shellLabels = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

    // Shell color palette (RGB string for fast alpha blending)
    this.shellColors = [
      { r: 56, g: 189, b: 248, hex: '#38bdf8' },  // K - Cyan
      { r: 129, g: 140, b: 248, hex: '#818cf8' }, // L - Indigo
      { r: 192, g: 132, b: 252, hex: '#c084fc' }, // M - Purple
      { r: 244, g: 114, b: 182, hex: '#f472b6' }, // N - Pink
      { r: 251, g: 146, b: 60, hex: '#fb923c' },  // O - Orange
      { r: 250, g: 204, b: 21, hex: '#facc15' },  // P - Yellow
      { r: 74, g: 222, b: 128, hex: '#4ade80' }   // Q - Emerald
    ];

    if (this.canvas) {
      this.setupCanvas();
      window.addEventListener('resize', () => this.setupCanvas());
    }
  }

  setupCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rect.width || 300;
    const height = rect.height || 250;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    if (this.ctx) {
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    }
    this.displayWidth = width;
    this.displayHeight = height;
  }

  setElement(element) {
    if (this.currentElement && this.currentElement.z === element.z) return;
    this.currentElement = element;
    if (!this.animFrameId) {
      this.start();
    }
  }

  start() {
    if (this.animFrameId) return;
    const loop = (timestamp) => {
      this.render(timestamp);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  render(timestamp) {
    if (!this.ctx || !this.currentElement) return;

    const width = this.displayWidth;
    const height = this.displayHeight;
    const ctx = this.ctx;
    const el = this.currentElement;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.44;

    const shells = el.shells || [1];
    const numShells = shells.length;
    const nucleusRadius = Math.max(14, 23 - numShells * 1.2);
    const shellStep = (maxRadius - nucleusRadius) / (numShells + 0.2);

    const elapsed = (timestamp - this.startTime) * 0.001;

    // 1. Draw concentric orbital paths
    for (let i = 0; i < numShells; i++) {
      const radius = nucleusRadius + (i + 1) * shellStep;
      const isValence = i === numShells - 1;
      const color = this.shellColors[i % this.shellColors.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 6.28318);
      ctx.strokeStyle = isValence ? 'rgba(2, 132, 199, 0.7)' : 'rgba(2, 132, 199, 0.25)';
      ctx.lineWidth = isValence ? 1.5 : 0.9;
      if (isValence) {
        ctx.setLineDash([3, 3]);
      } else {
        ctx.setLineDash([2, 4]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Orbital label
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = isValence ? '#0284c7' : '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${this.shellLabels[i]}: ${shells[i]}e⁻`, centerX + radius - 4, centerY - 6);

      // 2. Draw Orbiting Electrons (Optimized two-pass, zero shadowBlur)
      const count = shells[i];
      const speed = (0.7 / (i + 1)) * (i % 2 === 0 ? 1 : -1);
      const angleOffset = elapsed * speed;
      const step = 6.28318 / count;

      const glowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;

      for (let j = 0; j < count; j++) {
        const theta = angleOffset + j * step;
        const ex = centerX + radius * Math.cos(theta);
        const ey = centerY + radius * Math.sin(theta);

        // Soft outer glow ring
        ctx.beginPath();
        ctx.arc(ex, ey, 5.5, 0, 6.28318);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // High-contrast electron core
        ctx.beginPath();
        ctx.arc(ex, ey, 2.6, 0, 6.28318);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
      }
    }

    // 3. Central Nucleus (Clean gradient, zero shadowBlur overhead)
    const nucleusGrad = ctx.createRadialGradient(
      centerX - 3, centerY - 3, 2,
      centerX, centerY, nucleusRadius
    );
    nucleusGrad.addColorStop(0, '#f97316');
    nucleusGrad.addColorStop(0.6, '#ef4444');
    nucleusGrad.addColorStop(1, '#991b1b');

    // Outer subtle pulse aura
    const pulse = Math.sin(elapsed * 2.5) * 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius + 3 + pulse, 0, 6.28318);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
    ctx.fill();

    // Nucleus body
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius, 0, 6.28318);
    ctx.fillStyle = nucleusGrad;
    ctx.fill();

    // Nucleus text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.symbol, centerX, centerY - 3);

    const protons = el.z;
    const neutrons = Math.round(el.atomicMass - el.z);
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`${protons}p⁺ ${neutrons}n⁰`, centerX, centerY + 8);
  }
}

window.BohrAtomRenderer = BohrAtomRenderer;
