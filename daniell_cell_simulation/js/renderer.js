/**
 * Canvas 2D Renderer for Galvanic Daniell Cell
 */

export class DaniellRenderer {
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

    const centerX = width * 0.5;
    const beakerW = Math.min(160, width * 0.32);
    const beakerH = height * 0.44;
    const beakerY = height * 0.42;

    const leftBeakerX = centerX - beakerW - 35;
    const rightBeakerX = centerX + 35;

    // 1. Draw Two Half-Cell Beakers
    this.drawBeaker(leftBeakerX, beakerY, beakerW, beakerH, 'ZnSO₄ (aq)', 'rgba(241, 245, 249, 0.7)');
    this.drawBeaker(rightBeakerX, beakerY, beakerW, beakerH, 'CuSO₄ (aq)', 'rgba(59, 130, 246, 0.42)');

    // 2. Draw Electrodes
    const anodeX = leftBeakerX + beakerW * 0.4;
    const cathodeX = rightBeakerX + beakerW * 0.6;
    const electrodeTop = beakerY - 30;
    const electrodeH = beakerH * 0.85;

    this.drawElectrode(anodeX, electrodeTop, 22, electrodeH, '#94A3B8', 'Zn Anode (-)');
    this.drawElectrode(cathodeX, electrodeTop, 22, electrodeH, '#B45309', 'Cu Cathode (+)');

    // 3. Draw Salt Bridge
    if (this.engine.saltBridgeInserted) {
      this.drawSaltBridge(centerX, beakerY - 20, beakerW * 0.75, beakerH * 0.65);
    }

    // 4. Draw External Circuit with Voltmeter
    this.drawExternalCircuit(anodeX + 11, cathodeX + 11, electrodeTop, centerX, height * 0.12);
  }

  drawBench(w, h) {
    const { ctx } = this;
    const benchY = h * 0.86;
    ctx.fillStyle = '#D9E8F8';
    ctx.fillRect(0, benchY, w, h - benchY);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(w, benchY);
    ctx.stroke();
  }

  drawBeaker(x, y, w, h, label, solColor) {
    const { ctx } = this;

    // Beaker body glass
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(x, y, w, h);

    // Solution level (75% filled)
    const solH = h * 0.75;
    const solTop = y + h - solH;
    ctx.fillStyle = solColor;
    ctx.fillRect(x + 2, solTop, w - 4, solH - 2);

    // Glass walls
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(x, y, w, h);

    // Label
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(label, x + 10, y + h + 18);
  }

  drawElectrode(x, y, w, h, color, label) {
    const { ctx } = this;

    // Metal strip
    ctx.fillStyle = color;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();
    ctx.stroke();

    // Electrode tag
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.fillText(label, x - 12, y - 8);
  }

  drawSaltBridge(cx, topY, halfSpan, legH) {
    const { ctx } = this;
    const tubeR = 12;

    ctx.save();
    ctx.strokeStyle = '#E2E8F0';
    ctx.fillStyle = 'rgba(254, 243, 199, 0.85)'; // agar-agar jelly color
    ctx.lineWidth = tubeR * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Inverted U path
    ctx.beginPath();
    ctx.moveTo(cx - halfSpan, topY + legH);
    ctx.lineTo(cx - halfSpan, topY);
    ctx.lineTo(cx + halfSpan, topY);
    ctx.lineTo(cx + halfSpan, topY + legH);
    ctx.stroke();

    // Glass wall stroke
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cotton plugs at tube ends
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - halfSpan, topY + legH, tubeR - 2, 0, Math.PI * 2);
    ctx.arc(cx + halfSpan, topY + legH, tubeR - 2, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#78350F';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('SALT BRIDGE (KCl in Agar)', cx - 65, topY - 14);

    ctx.restore();
  }

  drawExternalCircuit(anodePinX, cathodePinX, wireBaseY, voltmeterX, voltmeterY) {
    const { ctx } = this;
    const wireY = voltmeterY + 22;

    // Copper wires
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.5;

    // Left wire: Anode up to wireY, then to Voltmeter
    ctx.beginPath();
    ctx.moveTo(anodePinX, wireBaseY);
    ctx.lineTo(anodePinX, wireY);
    ctx.lineTo(voltmeterX - 42, wireY);
    ctx.stroke();

    // Right wire: Cathode up to wireY, then to Voltmeter
    ctx.beginPath();
    ctx.moveTo(cathodePinX, wireBaseY);
    ctx.lineTo(cathodePinX, wireY);
    ctx.lineTo(voltmeterX + 42, wireY);
    ctx.stroke();

    // Animated Electron Particles (Anode -> Cathode)
    if (this.engine.circuitClosed && this.engine.cellCurrentAmps > 0) {
      ctx.fillStyle = '#2563EB';
      this.engine.electronParticles.forEach(p => {
        // Compute position along wire path
        const totalLen = (wireBaseY - wireY) * 2 + (cathodePinX - anodePinX);
        const dist = p.progress * totalLen;

        let px, py;
        const leg1 = wireBaseY - wireY;
        const leg2 = cathodePinX - anodePinX;

        if (dist < leg1) {
          px = anodePinX;
          py = wireBaseY - dist;
        } else if (dist < leg1 + leg2) {
          px = anodePinX + (dist - leg1);
          py = wireY;
        } else {
          px = cathodePinX;
          py = wireY + (dist - leg1 - leg2);
        }

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Digital DC Voltmeter Body
    const vmW = 84;
    const vmH = 44;
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(voltmeterX - vmW / 2, voltmeterY, vmW, vmH, 6);
    ctx.fill();
    ctx.stroke();

    // Glowing LED Screen
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(voltmeterX - vmW / 2 + 8, voltmeterY + 6, vmW - 16, vmH - 12);

    const m = this.engine.getMetrics();
    ctx.fillStyle = this.engine.circuitClosed ? '#22C55E' : '#64748B';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${m.cellPotentialVolts.toFixed(3)} V`, voltmeterX, voltmeterY + 28);
    ctx.textAlign = 'left';
  }
}
