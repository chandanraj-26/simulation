/**
 * renderer.js
 * Canvas 2D apparatus rendering for Candle Flame Zones & Air Supply Chimney.
 */

export class CombustionRenderer {
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

    // Wooden table bench
    const benchY = h * 0.78;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(20, benchY, w - 40, 12);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(20, benchY + 12, w - 40, 6);

    const cx = w * 0.42;

    // Render Chimney setup (Case A, B, C)
    this.renderChimney(cx, benchY);

    // Render Candle
    const candleW = 34;
    const candleH = 110;
    const candleX = cx - candleW / 2;
    const candleY = benchY - candleH;

    this.renderCandle(candleX, candleY, candleW, candleH);

    // Render Flame & Zones if not extinguished
    if (this.state.airMode.flameState !== 'extinguished') {
      this.renderFlame(cx, candleY, this.state.airMode.flameState === 'flicker');
      this.renderZoneAnnotations(cx, candleY - 90);
    } else {
      // Extinguished smoke trail
      this.renderExtinguishedSmoke(cx, candleY - 10);
    }

    // Render Active Probe Tool (Glass slide, Copper wire, Glass tube)
    this.renderProbeTool(cx, candleY - 50);
  }

  renderChimney(cx, benchY) {
    const ctx = this.ctx;
    const mode = this.state.airMode.id;
    const chimneyW = 90;
    const chimneyH = 200;
    const chimneyX = cx - chimneyW / 2;

    let chimneyY = benchY - chimneyH;

    // Wooden blocks under chimney in Case A (free air)
    if (mode === 'open') {
      chimneyY -= 14;
      ctx.fillStyle = '#D97706';
      ctx.fillRect(chimneyX - 4, benchY - 14, 16, 14);
      ctx.fillRect(chimneyX + chimneyW - 12, benchY - 14, 16, 14);

      ctx.fillStyle = '#16A34A';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Air Ingress', cx, benchY - 4);
    }

    // Glass Chimney cylinder
    ctx.fillStyle = 'rgba(241, 245, 249, 0.25)';
    ctx.fillRect(chimneyX, chimneyY, chimneyW, chimneyH);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(chimneyX, chimneyY, chimneyW, chimneyH);

    // Glass Plate covering top in Case C (sealed air)
    if (mode === 'sealed') {
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(chimneyX - 10, chimneyY - 6, chimneyW + 20, 6);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(chimneyX - 10, chimneyY - 6, chimneyW + 20, 6);

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Glass Cover (Air Blocked)', cx, chimneyY - 12);
    }
  }

  renderCandle(x, y, w, h) {
    const ctx = this.ctx;

    // Candle wax body
    ctx.fillStyle = '#FFFBEB';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [2, 2, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Wax melt rim
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y, w / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black wick
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y - 10);
    ctx.stroke();
  }

  renderFlame(cx, wickY, isFlickering) {
    const ctx = this.ctx;
    const baseWickY = wickY - 10;
    const flickerOffset = isFlickering ? (Math.random() * 4 - 2) : 0;
    const flameH = isFlickering ? 60 : 75;

    // 1. Zone 1: Outer Non-Luminous Blue Zone
    ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
    ctx.beginPath();
    ctx.moveTo(cx - 16, baseWickY);
    ctx.quadraticCurveTo(cx - 20, baseWickY - flameH * 0.5, cx + flickerOffset, baseWickY - flameH);
    ctx.quadraticCurveTo(cx + 20, baseWickY - flameH * 0.5, cx + 16, baseWickY);
    ctx.closePath();
    ctx.fill();

    // 2. Zone 2: Middle Luminous Yellow Zone
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(cx - 12, baseWickY);
    ctx.quadraticCurveTo(cx - 15, baseWickY - flameH * 0.45, cx + flickerOffset, baseWickY - flameH + 8);
    ctx.quadraticCurveTo(cx + 15, baseWickY - flameH * 0.45, cx + 12, baseWickY);
    ctx.closePath();
    ctx.fill();

    // 3. Zone 3: Innermost Dark Zone (unburnt wax vapors)
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(cx, baseWickY - 8, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  renderZoneAnnotations(cx, topY) {
    const ctx = this.ctx;
    const annotX = cx + 80;

    // Guidelines from zones to tags
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Outer Zone Tag
    ctx.beginPath();
    ctx.moveTo(cx + 12, topY + 25);
    ctx.lineTo(annotX, topY + 15);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = '#2563EB';
    ctx.font = 'bold 9.5px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1. Outer Zone: Blue, Complete Combustion (~1400°C)', annotX + 4, topY + 18);

    // Middle Zone Tag
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx + 10, topY + 55);
    ctx.lineTo(annotX, topY + 45);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = '#D97706';
    ctx.fillText('2. Middle Zone: Yellow Luminous, Incomplete (~1000°C)', annotX + 4, topY + 48);

    // Inner Dark Zone Tag
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx + 4, topY + 75);
    ctx.lineTo(annotX, topY + 75);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = '#475569';
    ctx.fillText('3. Dark Zone: Unburnt Wax Vapors (~600°C)', annotX + 4, topY + 78);
  }

  renderExtinguishedSmoke(cx, y) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.bezierCurveTo(cx - 10, y - 20, cx + 15, y - 40, cx, y - 60);
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FLAME EXTINGUISHED (O₂ Depleted)', cx, y - 70);
  }

  renderProbeTool(cx, flameCenterY) {
    const ctx = this.ctx;
    const tool = this.state.insertedTool;

    if (tool === 'glass_slide') {
      // Glass Slide inserted horizontally into luminous zone
      const slideW = 90;
      const slideH = 14;
      const slideX = cx - slideW / 2;
      const slideY = flameCenterY - 4;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(slideX, slideY, slideW, slideH);
      ctx.strokeRect(slideX, slideY, slideW, slideH);

      // Black soot ring deposit on slide
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(cx, slideY + slideH / 2, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Black Carbon Soot Ring', cx, slideY - 8);
    } else if (tool === 'copper_wire') {
      // Copper wire held in outer blue zone
      const wireY = flameCenterY - 14;
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 80, wireY);
      ctx.lineTo(cx, wireY);
      ctx.stroke();

      // Glowing red-hot tip in outer zone
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + 12, wireY);
      ctx.lineTo(cx - 12, wireY);
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Red-Hot Glowing Tip', cx - 24, wireY - 8);
    }
  }
}
