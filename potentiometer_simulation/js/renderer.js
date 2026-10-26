/**
 * Canvas 2D Apparatus Renderer for Potentiometer Laboratory
 */

export class PotentiometerRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.isDraggingJockey = false;
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
      this.isDraggingJockey = true;
      this.updateJockeyFromPointer(e);
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDraggingJockey) {
        this.updateJockeyFromPointer(e);
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDraggingJockey = false;
    });
  }

  updateJockeyFromPointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const boardX = this.width * 0.08;
    const boardW = this.width * 0.54;
    const fractionX = Math.max(0, Math.min(1, (x - boardX) / boardW));

    // Determine which wire row (0 to 3) based on Y coordinate
    const wireStartY = this.height * 0.32;
    const wireSpacing = 32;
    const rowIndex = Math.max(0, Math.min(3, Math.floor((y - wireStartY + 16) / wireSpacing)));

    let cm = 0;
    if (rowIndex % 2 === 0) {
      // Left to right (0-100 or 200-300)
      cm = rowIndex * 100 + fractionX * 100;
    } else {
      // Right to left (100-200 or 300-400)
      cm = rowIndex * 100 + (1 - fractionX) * 100;
    }

    this.engine.setJockeyPosition(cm);
  }

  draw() {
    const { ctx, width, height } = this;
    if (width === 0 || height === 0) return;

    // Academic soft light-blue background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawBench(width, height);

    const boardX = width * 0.08;
    const boardW = width * 0.54;
    const boardH = 170;
    const boardY = height * 0.28;

    this.drawWoodenBoard(boardX, boardY, boardW, boardH);
    this.drawWiresAndStrips(boardX, boardY, boardW);
    this.drawJockey(boardX, boardY, boardW);

    // Center-Zero Galvanometer Inset Dial
    this.drawGalvanometer(width * 0.78, height * 0.38, 75);
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

  drawWoodenBoard(x, y, w, h) {
    const { ctx } = this;
    ctx.fillStyle = '#D4A373';
    ctx.strokeStyle = '#99582A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x - 14, y - 14, w + 28, h + 28, 8);
    ctx.fill();
    ctx.stroke();

    // Metric ruler strip attached to board
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y + h - 14, w, 16);
    ctx.strokeRect(x, y + h - 14, w, 16);

    ctx.fillStyle = '#78350F';
    ctx.font = '8px "JetBrains Mono", monospace';
    for (let cm = 0; cm <= 100; cm += 10) {
      const rx = x + (cm / 100) * w;
      ctx.beginPath();
      ctx.moveTo(rx, y + h - 14);
      ctx.lineTo(rx, y + h - 8);
      ctx.stroke();
      ctx.fillText(`${cm}`, rx - 4, y + h - 2);
    }
  }

  drawWiresAndStrips(boardX, boardY, boardW) {
    const { ctx } = this;
    const wireStartY = boardY + 18;
    const wireSpacing = 32;

    // 4 Wires
    for (let i = 0; i < 4; i++) {
      const wy = wireStartY + i * wireSpacing;
      ctx.strokeStyle = '#94A3B8'; // Manganin wire
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(boardX, wy);
      ctx.lineTo(boardX + boardW, wy);
      ctx.stroke();
    }

    // Heavy Brass Connecting Strips at ends
    ctx.fillStyle = '#F59E0B'; // Polished Brass
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.5;

    // Right U-bend connecting wire 0 and 1
    ctx.fillRect(boardX + boardW - 2, wireStartY - 4, 12, wireSpacing + 8);
    ctx.strokeRect(boardX + boardW - 2, wireStartY - 4, 12, wireSpacing + 8);

    // Left U-bend connecting wire 1 and 2
    ctx.fillRect(boardX - 10, wireStartY + wireSpacing - 4, 12, wireSpacing + 8);
    ctx.strokeRect(boardX - 10, wireStartY + wireSpacing - 4, 12, wireSpacing + 8);

    // Right U-bend connecting wire 2 and 3
    ctx.fillRect(boardX + boardW - 2, wireStartY + wireSpacing * 2 - 4, 12, wireSpacing + 8);
    ctx.strokeRect(boardX + boardW - 2, wireStartY + wireSpacing * 2 - 4, 12, wireSpacing + 8);
  }

  drawJockey(boardX, boardY, boardW) {
    const { ctx } = this;
    const cm = this.engine.jockeyPositionCm;
    const rowIndex = Math.min(3, Math.floor(cm / 100));
    const segmentCm = cm % 100;

    const fractionX = (rowIndex % 2 === 0) ? (segmentCm / 100) : (1 - segmentCm / 100);
    const jx = boardX + fractionX * boardW;
    const jy = boardY + 18 + rowIndex * 32;

    // Brass knife-edge jockey
    ctx.fillStyle = '#EAB308';
    ctx.strokeStyle = '#854D0E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    ctx.lineTo(jx - 7, jy - 22);
    ctx.lineTo(jx + 7, jy - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Jockey Handle
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(jx - 4, jy - 42, 8, 20);

    // Position Tag
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`${cm.toFixed(1)} cm`, jx - 18, jy - 46);
  }

  drawGalvanometer(cx, cy, r) {
    const { ctx } = this;

    // Outer circular brass casing
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dial scale arc
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, r - 25, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();

    // Ticks: -30 to +30
    for (let d = -30; d <= 30; d += 10) {
      const angle = 1.5 * Math.PI + (d / 30.0) * (0.3 * Math.PI);
      const x1 = cx + Math.cos(angle) * (r - 28);
      const y1 = cy + 20 + Math.sin(angle) * (r - 28);
      const x2 = cx + Math.cos(angle) * (r - 18);
      const y2 = cy + 20 + Math.sin(angle) * (r - 18);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (d === 0) {
        ctx.fillStyle = '#16A34A';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText('0', x1 - 3, y1 - 4);
      }
    }

    // Moving Needle Pointer
    const defl = this.engine.getGalvanometerDeflection();
    const needleAngle = 1.5 * Math.PI + (defl / 30.0) * (0.3 * Math.PI);
    const needleLen = r - 20;

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 20);
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + 20 + Math.sin(needleAngle) * needleLen);
    ctx.stroke();

    // Center pivot
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 5, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.fillText('GALVANOMETER (G)', cx - 50, cy + r - 12);
  }
}
