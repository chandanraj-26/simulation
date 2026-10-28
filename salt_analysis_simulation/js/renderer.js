/**
 * renderer.js
 * Canvas 2D apparatus rendering for Qualitative Salt Analysis.
 */

export class SaltRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const ctx = this.ctx;

    // Soft light-blue canvas background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, w, h);

    // Subtle background grid
    ctx.strokeStyle = '#D5E6F7';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Workbench surface
    const benchY = h * 0.78;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(20, benchY, w - 40, 12);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(20, benchY + 12, w - 40, 6);

    const isFlameMode = this.state.currentReagent === 'flame';

    if (isFlameMode) {
      this.renderFlameApparatus(w / 2, benchY);
    } else {
      this.renderTestTubeApparatus(w / 2, benchY);
    }

    // Watch glass with sample on left
    this.renderWatchGlass(w * 0.18, benchY);
  }

  renderWatchGlass(cx, benchY) {
    const ctx = this.ctx;
    const r = 36;
    const cy = benchY - 8;

    // Curved glass dish
    ctx.strokeStyle = '#94A3B8';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - r + 10, r, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Salt powder in dish
    const salt = this.state.activeSalt;
    let powderColor = '#E2E8F0';
    if (salt.cation === 'Cu') powderColor = '#38BDF8'; // Copper blue
    else if (salt.cation === 'Fe') powderColor = '#D97706'; // Ferric yellow-brown

    ctx.fillStyle = powderColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Salt Sample:', cx, cy - 22);
    ctx.font = '8.5px monospace';
    ctx.fillText(salt.name.split(' ')[0], cx, cy - 11);
  }

  renderTestTubeApparatus(cx, benchY) {
    const ctx = this.ctx;
    const result = this.state.lastResult;

    // Retort Stand
    const standX = cx - 60;
    ctx.fillStyle = '#334155';
    ctx.fillRect(standX - 30, benchY - 8, 60, 8); // base
    ctx.fillRect(standX - 3, benchY - 260, 6, 252); // vertical rod
    // Horizontal Clamp
    ctx.fillStyle = '#475569';
    ctx.fillRect(standX, benchY - 170, 48, 8);

    // Test Tube geometry
    const tubeW = 44;
    const tubeH = 170;
    const tubeX = cx - tubeW / 2;
    const tubeY = benchY - tubeH - 10;
    const r = tubeW / 2;

    // Liquid contents inside tube
    const liquidH = 75;
    const liquidY = tubeY + tubeH - liquidH;

    let liquidColor = 'rgba(224, 242, 254, 0.6)';
    if (result && result.color) liquidColor = result.color;

    ctx.fillStyle = liquidColor;
    ctx.beginPath();
    ctx.moveTo(cx - r + 3, liquidY);
    ctx.lineTo(cx + r - 3, liquidY);
    ctx.lineTo(cx + r - 3, tubeY + tubeH - r);
    ctx.arc(cx, tubeY + tubeH - r, r - 3, 0, Math.PI);
    ctx.lineTo(cx - r + 3, liquidY);
    ctx.closePath();
    ctx.fill();

    // Effervescence bubbles animation if active
    if (result && result.hasBubbles) {
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 18; i++) {
        const bx = cx - r + 8 + ((i * 9 + Date.now() / 80) % (tubeW - 16));
        const by = tubeY + tubeH - 12 - ((i * 12 + Date.now() / 40) % liquidH);
        ctx.beginPath();
        ctx.arc(bx, by, 2 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Precipitate flakes if active
    if (result && result.precipitate) {
      ctx.fillStyle = result.color === '#FFFFFF' ? '#F1F5F9' : result.color;
      for (let i = 0; i < 16; i++) {
        const px = cx - r + 6 + ((i * 6) % (tubeW - 12));
        const py = tubeY + tubeH - 8 - ((i * 3) % 18);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Glass walls
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - r - 3, tubeY);
    ctx.lineTo(cx - r, tubeY);
    ctx.lineTo(cx - r, tubeY + tubeH - r);
    ctx.arc(cx, tubeY + tubeH - r, r, Math.PI, 0, true);
    ctx.lineTo(cx + r, tubeY);
    ctx.lineTo(cx + r + 3, tubeY);
    ctx.stroke();

    // Dropper with reagent if active
    if (this.state.currentReagent && !result?.isFlame) {
      const dropY = tubeY - 40;
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(cx - 5, dropY - 20, 10, 20, 3); // bulb
      ctx.fill();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.fillRect(cx - 3, dropY, 6, 26); // glass stem

      // Falling droplet
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cx, tubeY - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderFlameApparatus(cx, benchY) {
    const ctx = this.ctx;
    const result = this.state.lastResult;

    // Bunsen Burner
    const burnerW = 28;
    const burnerH = 70;
    const burnerX = cx - burnerW / 2;
    const burnerY = benchY - burnerH;

    ctx.fillStyle = '#475569';
    ctx.fillRect(burnerX - 18, benchY - 8, burnerW + 36, 8); // base
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(burnerX, burnerY, burnerW, burnerH); // barrel

    // Bunsen Flame
    const flameColor = result ? result.color : '#3B82F6';
    const flameH = 75;
    const flameY = burnerY - flameH;

    // Outer flame cone
    ctx.fillStyle = flameColor;
    ctx.beginPath();
    ctx.moveTo(cx - 14, burnerY);
    ctx.quadraticCurveTo(cx - 20, burnerY - flameH * 0.6, cx, flameY);
    ctx.quadraticCurveTo(cx + 20, burnerY - flameH * 0.6, cx + 14, burnerY);
    ctx.closePath();
    ctx.fill();

    // Inner hotter core
    ctx.fillStyle = '#67E8F9';
    ctx.beginPath();
    ctx.moveTo(cx - 8, burnerY);
    ctx.quadraticCurveTo(cx - 10, burnerY - flameH * 0.4, cx, burnerY - flameH * 0.6);
    ctx.quadraticCurveTo(cx + 10, burnerY - flameH * 0.4, cx + 8, burnerY);
    ctx.closePath();
    ctx.fill();

    // Platinum Wire Loop entering flame
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 100, burnerY - 30);
    ctx.lineTo(cx + 4, burnerY - 30);
    ctx.arc(cx, burnerY - 30, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Pt Wire Loop', cx + 24, burnerY - 34);
  }
}
