/**
 * renderer.js
 * Adaptive Canvas 2D apparatus rendering for scalable Meter Bridge experiment.
 * Accurately connects the Wheatstone bridge circuit across gaps and to galvanometer.
 */

export class MeterBridgeRenderer {
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

    // Adaptive Board dimensions fitting within canvas
    const padX = 20;
    const padY = 14;
    const boardX = padX;
    const boardY = padY;
    const boardW = w - padX * 2;
    const boardH = h - padY * 2;

    // Wooden bridge board base
    ctx.fillStyle = '#FDFBF7';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 12);
    ctx.fill();
    ctx.stroke();

    // Geometric layout
    const stripY = boardY + 24;
    const stripH = 14;
    const wireY = boardY + boardH - 72;
    const wireStartX = boardX + 65;
    const wireEndX = boardX + boardW - 65;
    const wireLenPx = wireEndX - wireStartX;

    // Brass strip bounds
    const leftStripRight = boardX + boardW * 0.28;
    const centerStripLeft = boardX + boardW * 0.38;
    const centerStripRight = boardX + boardW * 0.62;
    const rightStripLeft = boardX + boardW * 0.72;

    const galvCx = (centerStripLeft + centerStripRight) / 2;
    const galvCy = stripY + 80;
    const galvR = Math.min(38, Math.max(30, (wireY - stripY) * 0.20));

    // Render components in circuit order
    this.renderBrassStrips(boardX, stripY, stripH, wireY, wireStartX, wireEndX, leftStripRight, centerStripLeft, centerStripRight, rightStripLeft);
    this.renderLeftGapCircuit(leftStripRight, centerStripLeft, stripY, stripH);
    this.renderRightGapCircuit(centerStripRight, rightStripLeft, stripY, stripH);
    this.renderGalvanometerCircuit(galvCx, stripY + stripH, galvCy, galvR);
    this.renderMeterScaleAndWire(wireStartX, wireEndX, wireY, wireLenPx);
    this.renderJockey(wireStartX, wireLenPx, wireY, galvCx, galvCy + galvR);
    this.renderDriverCircuit(wireStartX, wireEndX, wireY, boardY + boardH - 22);
  }

  renderBrassStrips(bx, stripY, stripH, wireY, startX, endX, leftRight, centerLeft, centerRight, rightLeft) {
    const ctx = this.ctx;
    ctx.fillStyle = '#D97706'; // Polished Brass
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.5;

    // 1. Left L-Strip (from terminal A up to top left, then horizontal to left gap)
    ctx.beginPath();
    ctx.rect(startX - 18, stripY, leftRight - (startX - 18), stripH);
    ctx.rect(startX - 18, stripY, 18, wireY - stripY);
    ctx.fill();
    ctx.stroke();

    // 2. Center Strip (spanning between left gap and right gap)
    ctx.beginPath();
    ctx.rect(centerLeft, stripY, centerRight - centerLeft, stripH);
    ctx.fill();
    ctx.stroke();

    // 3. Right L-Strip (horizontal from right gap, then down to terminal B)
    ctx.beginPath();
    ctx.rect(rightLeft, stripY, endX + 18 - rightLeft, stripH);
    ctx.rect(endX, stripY, 18, wireY - stripY);
    ctx.fill();
    ctx.stroke();

    // Brass binding screw posts
    const posts = [
      { x: startX, y: wireY }, // Terminal A
      { x: leftRight - 16, y: stripY + stripH / 2 }, // Left Gap Left Terminal
      { x: centerLeft + 16, y: stripY + stripH / 2 }, // Left Gap Right Terminal
      { x: (centerLeft + centerRight) / 2, y: stripY + stripH / 2 }, // Center Terminal to Galvanometer
      { x: centerRight - 16, y: stripY + stripH / 2 }, // Right Gap Left Terminal
      { x: rightLeft + 16, y: stripY + stripH / 2 }, // Right Gap Right Terminal
      { x: endX, y: wireY } // Terminal B
    ];

    posts.forEach(p => {
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderLeftGapCircuit(leftRight, centerLeft, stripY, stripH) {
    const ctx = this.ctx;
    // Gap center
    const gapX = (leftRight + centerLeft) / 2;
    const boxW = 84;
    const boxH = 42;
    const boxX = gapX - boxW / 2;
    const boxY = stripY + 22;

    // Resistance Box
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RESISTANCE BOX', gapX, boxY + 16);
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`R = ${this.state.knownR.toFixed(1)} Ω`, gapX, boxY + 32);

    // Connecting wires bridging across the left gap:
    // Left lead: from Left Strip post to Resistance Box left terminal
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(leftRight - 16, stripY + stripH / 2);
    ctx.lineTo(leftRight - 16, boxY + 12);
    ctx.lineTo(boxX, boxY + 12);
    ctx.stroke();

    // Right lead: from Resistance Box right terminal to Center Strip left post
    ctx.beginPath();
    ctx.moveTo(boxX + boxW, boxY + 12);
    ctx.lineTo(centerLeft + 16, boxY + 12);
    ctx.lineTo(centerLeft + 16, stripY + stripH / 2);
    ctx.stroke();
  }

  renderRightGapCircuit(centerRight, rightLeft, stripY, stripH) {
    const ctx = this.ctx;
    const gapX = (centerRight + rightLeft) / 2;
    const coilW = 84;
    const coilH = 42;
    const coilX = gapX - coilW / 2;
    const coilY = stripY + 22;

    // Unknown Coil
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(coilX, coilY, coilW, coilH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UNKNOWN COIL', gapX, coilY + 16);
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`${this.state.unknownWire.name.split(' ')[0]} (X)`, gapX, coilY + 32);

    // Connecting wires bridging across the right gap:
    // Left lead: from Center Strip right post to Unknown Coil left terminal
    ctx.strokeStyle = '#16A34A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerRight - 16, stripY + stripH / 2);
    ctx.lineTo(centerRight - 16, coilY + 12);
    ctx.lineTo(coilX, coilY + 12);
    ctx.stroke();

    // Right lead: from Unknown Coil right terminal to Right Strip post
    ctx.beginPath();
    ctx.moveTo(coilX + coilW, coilY + 12);
    ctx.lineTo(rightLeft + 16, coilY + 12);
    ctx.lineTo(rightLeft + 16, stripY + stripH / 2);
    ctx.stroke();
  }

  renderGalvanometerCircuit(cx, stripBottomY, cy, r) {
    const ctx = this.ctx;

    // Direct wire connecting Center Strip Post down to Galvanometer Top
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, stripBottomY - 7);
    ctx.lineTo(cx, cy - r);
    ctx.stroke();

    // Galvanometer outer casing
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fill();

    // Galvanometer white dial face
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Scale ticks (-30 to +30)
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    for (let deg = -60; deg <= 60; deg += 10) {
      const rad = (deg - 90) * (Math.PI / 180);
      const inner = (deg % 30 === 0) ? r - 10 : r - 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
      ctx.lineTo(cx + Math.cos(rad) * (r - 2), cy + Math.sin(rad) * (r - 2));
      ctx.stroke();
    }

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G', cx, cy - r * 0.35);
    ctx.font = '7px monospace';
    ctx.fillText('-30', cx - r * 0.58, cy + 2);
    ctx.fillText('0', cx, cy - r * 0.6);
    ctx.fillText('+30', cx + r * 0.58, cy + 2);

    // Deflection needle
    const deflection = this.engine.getGalvanometerDeflection(this.state.jockeyPosCm);
    const needleDeg = (deflection / 30) * 55;
    const needleRad = (needleDeg - 90) * (Math.PI / 180);

    ctx.strokeStyle = Math.abs(deflection) < 0.4 ? '#16A34A' : '#DC2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleRad) * (r - 5), cy + Math.sin(needleRad) * (r - 5));
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  renderMeterScaleAndWire(startX, endX, wireY, lenPx) {
    const ctx = this.ctx;
    const totalCm = this.state.totalWireLengthCm;

    // Wooden meter scale ruler behind wire
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1;
    ctx.fillRect(startX, wireY - 18, lenPx, 22);
    ctx.strokeRect(startX, wireY - 18, lenPx, 22);

    const stepCm = totalCm <= 100 ? 1 : (totalCm <= 200 ? 2 : (totalCm <= 400 ? 5 : 10));
    const majorStepCm = totalCm <= 100 ? 10 : (totalCm <= 200 ? 20 : (totalCm <= 400 ? 50 : 100));

    ctx.fillStyle = '#451A03';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';

    for (let cm = 0; cm <= totalCm; cm += stepCm) {
      const px = startX + (cm / totalCm) * lenPx;
      const isMajor = cm % majorStepCm === 0;
      const tickH = isMajor ? 11 : 4;

      ctx.beginPath();
      ctx.moveTo(px, wireY - 18);
      ctx.lineTo(px, wireY - 18 + tickH);
      ctx.stroke();

      if (isMajor && cm > 0 && cm < totalCm) {
        ctx.fillText(`${cm}`, px, wireY);
      }
    }

    // 1-Meter Resistance Wire
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, wireY);
    ctx.lineTo(endX, wireY);
    ctx.stroke();

    // Terminal labels
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('A (0 cm)', startX - 6, wireY + 4);
    ctx.textAlign = 'left';
    ctx.fillText(`B (${totalCm} cm)`, endX + 6, wireY + 4);
  }

  renderJockey(startX, lenPx, wireY, galvBottomX, galvBottomY) {
    const ctx = this.ctx;
    const totalCm = this.state.totalWireLengthCm;
    const jockeyCm = this.state.jockeyPosCm;
    const jockeyPx = startX + (jockeyCm / totalCm) * lenPx;

    // Flexible wire lead from bottom of galvanometer to jockey
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(galvBottomX, galvBottomY);
    ctx.bezierCurveTo(galvBottomX, wireY - 50, jockeyPx, wireY - 40, jockeyPx, wireY - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Jockey handle
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(jockeyPx - 5, wireY - 28, 10, 20);

    // Knife-Edge Contact point
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(jockeyPx - 4, wireY - 8);
    ctx.lineTo(jockeyPx + 4, wireY - 8);
    ctx.lineTo(jockeyPx, wireY);
    ctx.closePath();
    ctx.fill();

    // Tooltip badge
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(jockeyPx - 32, wireY - 48, 64, 16, 4);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`l = ${jockeyCm.toFixed(1)} cm`, jockeyPx, wireY - 37);
  }

  renderDriverCircuit(startX, endX, wireY, batteryY) {
    const ctx = this.ctx;
    const centerX = (startX + endX) / 2;

    // Driver Battery and Plug Key connected between A and B
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // From Terminal A down to battery line
    ctx.moveTo(startX, wireY);
    ctx.lineTo(startX, batteryY);
    ctx.lineTo(centerX - 45, batteryY);

    // Battery symbol
    ctx.moveTo(centerX + 45, batteryY);
    ctx.lineTo(endX, batteryY);
    ctx.lineTo(endX, wireY);
    ctx.stroke();

    // Battery cell plates
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 25, batteryY - 8);
    ctx.lineTo(centerX - 25, batteryY + 8);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, batteryY - 5);
    ctx.lineTo(centerX - 15, batteryY + 5);
    ctx.stroke();

    // Plug Key
    ctx.fillStyle = '#D97706';
    ctx.fillRect(centerX + 10, batteryY - 4, 18, 8);
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(centerX + 19, batteryY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Battery (2V)', centerX - 20, batteryY + 14);
    ctx.fillText('Plug Key (K)', centerX + 20, batteryY + 14);
  }
}
