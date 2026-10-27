/**
 * Canvas 2D Apparatus Renderer for Organic Functional Group Tests
 */

import { COMPOUNDS } from './organic_data.js';

export class OrganicRenderer {
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
    const tubeW = 44;
    const tubeH = height * 0.52;
    const tubeTop = height * 0.28;
    const tubeBottom = tubeTop + tubeH;

    this.drawStandAndClamp(cx, height, tubeTop);
    this.drawTestTube(cx, tubeTop, tubeW, tubeH);
    this.drawDropperPipette(cx, tubeTop - 45);
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

  drawStandAndClamp(cx, h, tubeTop) {
    const { ctx } = this;
    const standX = cx - 90;
    const standY = h * 0.88;

    // Cast iron base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(standX - 25, standY - 14, 150, 14, 4);
    ctx.fill();

    // Rod
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(standX, h * 0.12, 10, standY - h * 0.12 - 14);

    // Clamp holding upper tube
    ctx.fillStyle = '#475569';
    ctx.fillRect(standX - 4, tubeTop + 25, cx - standX + 15, 12);
  }

  drawTestTube(cx, topY, w, h) {
    const { ctx } = this;
    const x = cx - w / 2;

    // Tube glass body
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x, topY, w, h, [0, 0, w / 2, w / 2]);
    ctx.fill();

    // Liquid column (55% fill)
    const liquidH = h * 0.55;
    const liquidTop = topY + h - liquidH;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, topY, w, h, [0, 0, w / 2, w / 2]);
    ctx.clip();

    // Compute liquid visual state
    this.drawReactionLiquid(cx, liquidTop, w, liquidH);

    ctx.restore();

    // Glass wall stroke
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(x, topY, w, h, [0, 0, w / 2, w / 2]);
    ctx.stroke();

    // Tube lip
    ctx.strokeRect(x - 4, topY - 2, w + 8, 4);
  }

  drawReactionLiquid(cx, topY, w, h) {
    const { ctx } = this;
    const reagentId = this.engine.activeReagentId;
    const progress = this.engine.reactionProgress;
    const comp = COMPOUNDS[this.engine.compoundId];
    const res = reagentId ? comp.responses[reagentId] : null;

    let baseColor = 'rgba(241, 245, 249, 0.6)';

    if (reagentId === 'bromine_water') {
      if (res && res.positive) {
        // Reddish-orange de-colorizes to clear
        const alpha = Math.max(0.1, 0.8 * (1 - progress));
        baseColor = `rgba(217, 119, 6, ${alpha})`;
      } else {
        baseColor = 'rgba(217, 119, 6, 0.85)';
      }
    } else if (reagentId === 'baeyers') {
      if (res && res.positive) {
        // Purple KMnO4 turns into muddy brown MnO2 precipitate
        baseColor = progress > 0.4 ? 'rgba(120, 53, 15, 0.85)' : 'rgba(124, 58, 237, 0.85)';
      } else {
        baseColor = 'rgba(124, 58, 237, 0.85)';
      }
    } else if (reagentId === 'tollens' && res && res.positive) {
      // Silver mirror coating
      baseColor = 'rgba(203, 213, 225, 0.9)';
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(cx - w / 2, topY, w, h);

    // If Silver mirror is positive: draw gleaming metallic coating on walls
    if (reagentId === 'tollens' && res && res.positive && progress > 0.3) {
      const grad = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.3, 'rgba(148, 163, 184, 0.85)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(1, 'rgba(148, 163, 184, 0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - w / 2 + 2, topY, w - 4, h - 2);

      // Silver mirror reflection sparkles
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - 8, topY + 30, 3, 0, Math.PI * 2);
      ctx.arc(cx + 10, topY + 55, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sodium metal floating piece
    if (reagentId === 'sodium' && res && res.positive) {
      ctx.fillStyle = '#CBD5E1';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx - 7, topY - 3, 14, 8, 2);
      ctx.fill();
      ctx.stroke();
    }

    // Rising gas bubbles (H2 or CO2)
    if (this.engine.bubbles.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      this.engine.bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(cx + b.x, topY + b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Froth head at meniscus
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(cx - w / 2 + 2, topY - 4, w - 4, 8);
    }
  }

  drawDropperPipette(cx, tipY) {
    const { ctx } = this;
    if (!this.engine.activeReagentId) return;

    // Glass pipette tip
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(cx - 4, tipY - 35);
    ctx.lineTo(cx - 2, tipY);
    ctx.lineTo(cx + 2, tipY);
    ctx.lineTo(cx + 4, tipY - 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Falling droplet
    if (this.engine.isReacting && this.engine.reactionProgress < 0.3) {
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.ellipse(cx, tipY + 15, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
