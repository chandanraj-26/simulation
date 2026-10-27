/**
 * Canvas 2D Renderer for Colloids & Tyndall Effect
 */

import { SOLS } from './colloid_data.js';

export class ColloidRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  draw() {
    const { ctx, width, height } = this;
    if (width === 0 || height === 0) return;

    // Academic soft light-blue background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawBench(width, height);

    const cx = width * 0.5;
    const cellW = 140;
    const cellH = 150;
    const cellY = height * 0.44;

    this.drawOpticalCell(cx, cellY, cellW, cellH);

    if (this.engine.showTyndall) {
      this.drawTyndallLaser(cx, cellY, cellW, cellH);
    }
  }

  drawBench(w, h) {
    const { ctx } = this;
    const benchY = h * 0.88;
    ctx.fillStyle = '#D9E8F8';
    ctx.fillRect(0, benchY, w, h - benchY);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(w, benchY);
    ctx.stroke();
  }

  drawOpticalCell(cx, y, w, h) {
    const { ctx } = this;
    const x = cx - w / 2;
    const sol = SOLS[this.engine.solId];

    // Glass cuvette body
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x, y, w, h);

    // Liquid colloidal sol
    ctx.fillStyle = sol.solColor;
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    // Settled coagulated precipitate at bottom
    if (this.engine.coagulationProgress > 0.1) {
      const precipH = 16 * this.engine.coagulationProgress;
      ctx.fillStyle = this.engine.solId === 'ferric_hydroxide' ? '#7F1D1D' : '#CBD5E1';
      ctx.fillRect(x + 2, y + h - precipH, w - 4, precipH);
    }

    // Brownian motion colloidal particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.engine.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(cx + p.x, y + p.y + 20, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Outer glass stroke
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(x, y, w, h);
  }

  drawTyndallLaser(cx, y, w, h) {
    const { ctx } = this;
    const laserX = cx - w / 2 - 110;
    const laserY = y + h * 0.48;

    // Laser Diode casing
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(laserX, laserY - 10, 65, 20, 4);
    ctx.fill();
    ctx.stroke();

    // Laser aperture
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(laserX + 60, laserY - 6, 6, 12);

    // Incident green beam
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(laserX + 66, laserY);
    ctx.lineTo(cx - w / 2, laserY);
    ctx.stroke();

    // Illuminated Tyndall scattering cone inside sol
    const coneGrad = ctx.createLinearGradient(cx - w / 2, laserY, cx + w / 2, laserY);
    coneGrad.addColorStop(0, 'rgba(34, 197, 94, 0.7)');
    coneGrad.addColorStop(1, 'rgba(34, 197, 94, 0.25)');

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, laserY - 6);
    ctx.lineTo(cx + w / 2, laserY - 24);
    ctx.lineTo(cx + w / 2, laserY + 24);
    ctx.lineTo(cx - w / 2, laserY + 6);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = '#15803D';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText('TYNDALL CONE (532 nm)', cx - 55, laserY - 32);
  }
}
