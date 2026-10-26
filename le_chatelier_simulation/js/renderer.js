/**
 * Canvas 2D Renderer for Chemical Equilibrium & Test Tube Rack
 */

export class EquilibriumRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initEvents();
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

  initEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check hit on each of the 4 test tubes
      const rackW = Math.min(380, this.width * 0.7);
      const startX = this.width * 0.5 - rackW / 2;
      const spacing = rackW / 4;

      for (let i = 0; i < 4; i++) {
        const tubeX = startX + i * spacing + spacing / 2 - 14;
        const tubeY = this.height * 0.28;
        if (x >= tubeX - 10 && x <= tubeX + 38 && y >= tubeY && y <= tubeY + 200) {
          this.state.selectTube(i);
          return;
        }
      }
    });
  }

  draw() {
    const { ctx, width, height } = this;
    if (width === 0 || height === 0) return;

    // Academic soft light-blue background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawBench(width, height);

    // Apparatus dimensions
    const rackW = Math.min(420, width * 0.75);
    const rackH = height * 0.52;
    const rackY = height * 0.36;
    const rackX = width * 0.5 - rackW / 2;

    this.drawWoodenRack(rackX, rackY, rackW, rackH);
    this.drawTestTubes(rackX, rackY, rackW);
    this.drawSpectrophotometerBeam(rackX, rackW);
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

  drawWoodenRack(x, y, w, h) {
    const { ctx } = this;
    const woodColor = '#D4A373';
    const darkWood = '#BC6C25';

    // Back support bar
    ctx.fillStyle = woodColor;
    ctx.strokeStyle = darkWood;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y + 50, w, 14);
    ctx.strokeRect(x, y + 50, w, 14);

    // Bottom shelf
    ctx.fillRect(x - 10, y + h - 18, w + 20, 18);
    ctx.strokeRect(x - 10, y + h - 18, w + 20, 18);

    // Side wooden pillars
    ctx.fillRect(x - 10, y + 20, 16, h - 38);
    ctx.strokeRect(x - 10, y + 20, 16, h - 38);
    ctx.fillRect(x + w - 6, y + 20, 16, h - 38);
    ctx.strokeRect(x + w - 6, y + 20, 16, h - 38);
  }

  drawTestTubes(rackX, rackY, rackW) {
    const { ctx } = this;
    const spacing = rackW / 4;
    const tubeW = 26;
    const tubeH = 170;
    const tubeTopY = rackY - 30;

    this.engine.tubes.forEach((tube, idx) => {
      const tubeX = rackX + idx * spacing + spacing / 2 - tubeW / 2;

      // Highlight selected tube
      const isSelected = this.state.selectedTubeIndex === idx;
      if (isSelected) {
        ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
        ctx.beginPath();
        ctx.roundRect(tubeX - 6, tubeTopY - 14, tubeW + 12, tubeH + 28, 8);
        ctx.fill();

        // Selection arrow indicator
        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.moveTo(tubeX + tubeW / 2, tubeTopY - 6);
        ctx.lineTo(tubeX + tubeW / 2 - 6, tubeTopY - 14);
        ctx.lineTo(tubeX + tubeW / 2 + 6, tubeTopY - 14);
        ctx.fill();
      }

      // Glass body
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.roundRect(tubeX, tubeTopY, tubeW, tubeH, [2, 2, 13, 13]);
      ctx.fill();

      // Liquid fill with dynamic color
      const liquidH = tubeH * 0.72;
      const liquidTop = tubeTopY + tubeH - liquidH;
      ctx.fillStyle = this.engine.getColorForExtent(tube.extent);
      ctx.beginPath();
      ctx.roundRect(tubeX + 1.5, liquidTop, tubeW - 3, liquidH - 1.5, [0, 0, 11, 11]);
      ctx.fill();

      // Curved glass rim & walls
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(tubeX, tubeTopY, tubeW, tubeH, [2, 2, 13, 13]);
      ctx.stroke();

      // Lip of test tube
      ctx.strokeRect(tubeX - 3, tubeTopY - 2, tubeW + 6, 4);

      // Label beneath tube
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tube.label, tubeX + tubeW / 2, tubeTopY + tubeH + 34);

      ctx.fillStyle = '#64748B';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${tube.tempC}°C`, tubeX + tubeW / 2, tubeTopY + tubeH + 46);
      ctx.textAlign = 'left';
    });
  }

  drawSpectrophotometerBeam(rackX, rackW) {
    const { ctx } = this;
    const spacing = rackW / 4;
    const tubeW = 26;
    const tubeX = rackX + this.state.selectedTubeIndex * spacing + spacing / 2 - tubeW / 2;
    const beamY = this.height * 0.48;

    // Laser ray passing through the tube
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(tubeX - 45, beamY);
    ctx.lineTo(tubeX + tubeW + 45, beamY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Optical sensor detector box
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(tubeX + tubeW + 45, beamY - 10, 14, 20);
  }
}
