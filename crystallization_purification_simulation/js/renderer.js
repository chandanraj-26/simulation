/**
 * renderer.js
 * Canvas 2D apparatus rendering for 5-stage Copper Sulfate Crystallization.
 */

export class CrystallizationRenderer {
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

    // Academic soft light-blue canvas background
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

    // Laboratory workbench surface
    const benchY = h * 0.78;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(20, benchY, w - 40, 12);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(20, benchY + 12, w - 40, 6);

    const cx = w / 2;
    const stage = this.state.stageIndex;

    if (stage === 0) {
      this.renderStage1Dissolution(cx, benchY);
    } else if (stage === 1) {
      this.renderStage2Filtration(cx, benchY);
    } else if (stage === 2) {
      this.renderStage3Evaporation(cx, benchY);
    } else if (stage === 3) {
      this.renderStage4Cooling(cx, benchY);
    } else {
      this.renderStage5Harvest(cx, benchY);
    }
  }

  renderStage1Dissolution(cx, benchY) {
    const ctx = this.ctx;
    const beakerW = 90;
    const beakerH = 120;
    const bx = cx - beakerW / 2;
    const by = benchY - beakerH;

    // Beaker body
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(bx, by, beakerW, beakerH);
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx, by, beakerW, beakerH);

    // Blue turbid liquid with suspended impurities
    const liquidH = 75;
    const ly = by + beakerH - liquidH;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.75)'; // Rich blue CuSO4 solution
    ctx.fillRect(bx + 3, ly, beakerW - 6, liquidH - 3);

    // Insoluble sand sediment at bottom
    ctx.fillStyle = '#78350F';
    for (let i = 0; i < 22; i++) {
      const sx = bx + 6 + ((i * 7) % (beakerW - 12));
      const sy = by + beakerH - 4 - ((i * 3) % 10);
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glass stirring rod
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 25, by - 30);
    ctx.lineTo(cx - 10, by + beakerH - 15);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stage 1: Crude CuSO₄ Dissolved in Dilute H₂SO₄', cx, by - 40);
  }

  renderStage2Filtration(cx, benchY) {
    const ctx = this.ctx;
    const funnelY = benchY - 170;

    // Retort stand clamp
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx - 80, benchY - 220, 6, 220); // stand rod
    ctx.fillRect(cx - 80, funnelY + 40, 50, 8); // clamp arm

    // Conical glass funnel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 45, funnelY);
    ctx.lineTo(cx + 45, funnelY);
    ctx.lineTo(cx + 5, funnelY + 65);
    ctx.lineTo(cx + 4, funnelY + 115); // stem
    ctx.lineTo(cx - 4, funnelY + 115);
    ctx.lineTo(cx - 5, funnelY + 65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fluted filter paper inside funnel
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.moveTo(cx - 40, funnelY + 4);
    ctx.lineTo(cx + 40, funnelY + 4);
    ctx.lineTo(cx, funnelY + 55);
    ctx.closePath();
    ctx.fill();

    // Sand residue trapped on filter paper
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.ellipse(cx, funnelY + 28, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 8.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sand Residue', cx, funnelY + 20);

    // Evaporating dish receiving clear blue filtrate
    const dishW = 90;
    const dishH = 28;
    const dishX = cx - dishW / 2;
    const dishY = benchY - dishH;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, dishY + 6, dishW / 2, dishH / 2, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Clear blue filtrate liquid inside dish
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.ellipse(cx, dishY + 10, dishW / 2 - 6, dishH / 2 - 4, 0, 0, Math.PI);
    ctx.fill();

    // Dripping droplets from funnel stem
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(cx, funnelY + 128, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stage 2: Hot Filtration (Insoluble Sand Separated)', cx, funnelY - 18);
  }

  renderStage3Evaporation(cx, benchY) {
    const ctx = this.ctx;
    const tripodH = 90;
    const tripodY = benchY - tripodH;

    // Cast iron tripod legs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 40, benchY);
    ctx.lineTo(cx - 30, tripodY);
    ctx.moveTo(cx + 40, benchY);
    ctx.lineTo(cx + 30, tripodY);
    ctx.stroke();

    // Wire gauze
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 45, tripodY);
    ctx.lineTo(cx + 45, tripodY);
    ctx.stroke();

    // China dish on wire gauze
    const dishW = 86;
    const dishH = 26;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, tripodY - 10, dishW / 2, dishH / 2, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Concentrating deep blue solution
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.ellipse(cx, tripodY - 6, dishW / 2 - 6, dishH / 2 - 4, 0, 0, Math.PI);
    ctx.fill();

    // Bunsen burner flame beneath tripod
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(cx - 12, benchY);
    ctx.quadraticCurveTo(cx - 15, benchY - 30, cx, tripodY + 6);
    ctx.quadraticCurveTo(cx + 15, benchY - 30, cx + 12, benchY);
    ctx.closePath();
    ctx.fill();

    // Steam vapors rising
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 2;
    for (let i = -15; i <= 15; i += 15) {
      ctx.beginPath();
      ctx.moveTo(cx + i, tripodY - 24);
      ctx.bezierCurveTo(cx + i - 8, tripodY - 40, cx + i + 8, tripodY - 60, cx + i, tripodY - 75);
      ctx.stroke();
    }

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stage 3: Evaporating to Crystallization Point', cx, tripodY - 85);
  }

  renderStage4Cooling(cx, benchY) {
    const ctx = this.ctx;
    const dishW = 90;
    const dishH = 30;
    const dishY = benchY - dishH;

    // China dish resting on bench
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, dishY + 8, dishW / 2, dishH / 2, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Saturated solution
    ctx.fillStyle = '#1E40AF';
    ctx.beginPath();
    ctx.ellipse(cx, dishY + 12, dishW / 2 - 6, dishH / 2 - 4, 0, 0, Math.PI);
    ctx.fill();

    // Nucleating triclinic crystal prisms
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < 7; i++) {
      const kx = cx - 25 + i * 8;
      const ky = dishY + 16 - (i % 3) * 3;
      ctx.beginPath();
      ctx.moveTo(kx, ky);
      ctx.lineTo(kx + 7, ky - 5);
      ctx.lineTo(kx + 11, ky);
      ctx.lineTo(kx + 4, ky + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Watch glass covering dish
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, dishY - 14, dishW / 2 + 2, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stage 4: Slow Undisturbed Cooling & Crystal Growth', cx, dishY - 35);
  }

  renderStage5Harvest(cx, benchY) {
    const ctx = this.ctx;

    // Circular white filter paper sheet
    const paperR = 55;
    const paperY = benchY - 18;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, paperY, paperR, paperR * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cluster of sparkling deep-blue triclinic crystals
    ctx.fillStyle = '#2563EB';
    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 1;

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dist = 6 + (i * 5) % 32;
      const kx = cx + Math.cos(angle) * dist;
      const ky = paperY + Math.sin(angle) * (dist * 0.45);

      ctx.beginPath();
      ctx.moveTo(kx, ky - 5);
      ctx.lineTo(kx + 6, ky - 2);
      ctx.lineTo(kx + 4, ky + 4);
      ctx.lineTo(kx - 3, ky + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stage 5: Pure CuSO₄·5H₂O Blue Triclinic Crystals Harvested', cx, paperY - 35);
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(`Yield: ${this.engine.pureYieldG.toFixed(2)} g (${this.engine.getYieldMetrics().percentYield}%)`, cx, paperY - 20);
  }
}
