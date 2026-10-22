/**
 * Reactivity Series — Canvas 2D Laboratory Apparatus Renderer
 * Renders Polished Wooden Test Tube Rack, 4 Borosilicate Tubes,
 * Dynamic Color Interpolation, Submerged Metal Samples, Silver Dendrites,
 * Digital Thermometer, and Reactivity Ladder HUD.
 */

class ReactivityRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 540;

    this.tubeBounds = [];
    this.resize();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = rect.height || 540;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Soft study environment & lab bench
    this.drawLabEnvironment(ctx);

    // 2. Wooden Test Tube Rack
    this.drawTestTubeRack(ctx);

    // 3. Render the 4 Test Tubes and Chemical Reactions
    this.drawTestTubes(ctx);

    // 4. Digital Thermometer in selected active tube
    this.drawThermometer(ctx);

    // 5. Reactivity Series Mini-Ladder Overlay
    this.drawReactivityLadderHUD(ctx);
  }

  drawLabEnvironment(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#F4F9FF');
    bgGrad.addColorStop(1, '#E6F2FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Bench surface
    const benchY = this.height * 0.85;
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(0, benchY, this.width, this.height - benchY);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(this.width, benchY);
    ctx.stroke();
  }

  drawTestTubeRack(ctx) {
    const rackW = Math.min(540, this.width * 0.74);
    const rackL = this.width * 0.42 - rackW / 2;
    const rackR = rackL + rackW;
    const rackY = this.height * 0.52;
    const benchY = this.height * 0.85;

    // Rich teak wood rack
    ctx.fillStyle = '#D97706'; // Warm amber wood
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 3;

    // Top shelf with holes
    ctx.beginPath();
    ctx.roundRect(rackL - 15, rackY, rackW + 30, 22, 6);
    ctx.fill();
    ctx.stroke();

    // Bottom shelf
    ctx.beginPath();
    ctx.roundRect(rackL - 15, benchY - 24, rackW + 30, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Side support uprights
    ctx.fillStyle = '#B45309';
    ctx.fillRect(rackL - 10, rackY + 22, 20, benchY - 24 - (rackY + 22));
    ctx.fillRect(rackR - 10, rackY + 22, 20, benchY - 24 - (rackY + 22));
  }

  drawTestTubes(ctx) {
    this.tubeBounds = [];
    const rackW = Math.min(540, this.width * 0.74);
    const rackL = this.width * 0.42 - rackW / 2;
    const numTubes = this.state.tubes.length;
    const colSpacing = rackW / (numTubes + 1);

    const tubeW = Math.min(48, this.width * 0.065);
    const tubeH = this.height * 0.48;
    const tubeTopY = this.height * 0.30;
    const tubeBottomY = tubeTopY + tubeH;

    for (let i = 0; i < numTubes; i++) {
      const tube = this.state.tubes[i];
      const cx = rackL + (i + 1) * colSpacing;
      const x = cx - tubeW / 2;

      // Save bounding box for click interaction
      this.tubeBounds.push({
        id: tube.id,
        x: x - 8,
        y: tubeTopY - 20,
        w: tubeW + 16,
        h: tubeH + 40
      });

      const isSelected = tube.id === this.state.selectedTubeId;

      // Draw Selected Tube Halo
      if (isSelected) {
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x - 6, tubeTopY - 14, tubeW + 12, tubeH + 28);
        ctx.setLineDash([]);
      }

      // Draw Tube Content (Liquid & Metal)
      this.drawSingleTube(ctx, tube, x, tubeTopY, tubeW, tubeH, isSelected);
    }
  }

  drawSingleTube(ctx, tube, x, topY, w, h, isSelected) {
    const halfW = w / 2;
    const cx = x + halfW;
    const bottomY = topY + h;
    const liquidTopY = topY + h * 0.38;
    const liquidH = bottomY - liquidTopY;

    // 1. Solution Color with Interpolation
    const solData = REACTIVITY_DATA.solutions[tube.solutionId];
    let liquidColor = solData.baseColor;

    if (tube.metalId) {
      const key = `${tube.metalId}+${tube.solutionId}`;
      const rxn = REACTIVITY_DATA.reactions[key];
      if (rxn && rxn.occurs && tube.reactionProgress > 0) {
        liquidColor = this.interpolateColor(rxn.colorTransition.from, rxn.colorTransition.to, tube.reactionProgress);
      }
    }

    // Liquid fill inside tube (with rounded hemispherical bottom)
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, liquidTopY, w - 4, liquidH - halfW);
    ctx.arc(cx, bottomY - halfW, halfW - 2, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = liquidColor;
    ctx.fill();

    // Curved Meniscus
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, liquidTopY, halfW - 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Submerged Metal Sample (if present)
    if (tube.isSubmerged && tube.metalId) {
      this.drawSubmergedMetal(ctx, tube, cx, liquidTopY, bottomY);
    }

    // 3. Draw Effervescent Bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const b of tube.bubbles) {
      const bx = x + b.xNorm * w + Math.sin(b.wobble) * 2;
      const by = topY + b.yNorm * h;
      ctx.beginPath();
      ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 4. Borosilicate Glass Outer Outline & Specular Highlight
    ctx.strokeStyle = 'rgba(70, 130, 190, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Glass lip flare
    ctx.moveTo(x - 4, topY);
    ctx.lineTo(x + w + 4, topY);
    // Tube walls
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY - halfW);
    ctx.arc(cx, bottomY - halfW, halfW, Math.PI, 0, true);
    ctx.lineTo(x + w, topY);
    ctx.stroke();

    // Specular glass shine streak
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, topY + 10);
    ctx.lineTo(x + 4, bottomY - halfW - 10);
    ctx.stroke();

    // Tube Tag / Label at the bottom
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isSelected ? '#0284C7' : '#475569';
    ctx.fillText(tube.name, cx, bottomY + 22);

    // Solution Pill Tag
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(tube.solutionId, cx, bottomY + 36);
  }

  drawSubmergedMetal(ctx, tube, cx, liquidTopY, bottomY) {
    const metal = REACTIVITY_DATA.metals[tube.metalId];
    if (!metal) return;

    const sampleTopY = liquidTopY - 25; // hangs above liquid slightly
    const sampleH = (bottomY - liquidTopY) * 0.72;

    // Thread hanging the sample
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, sampleTopY - 20);
    ctx.lineTo(cx, sampleTopY);
    ctx.stroke();

    // Sample Body
    ctx.save();
    if (metal.shape === 'nail') {
      // Iron Nail
      ctx.fillStyle = metal.color;
      ctx.beginPath();
      // Nail head
      ctx.fillRect(cx - 8, sampleTopY, 16, 4);
      // Shaft
      ctx.fillRect(cx - 3, sampleTopY + 4, 6, sampleH - 12);
      // Point
      ctx.moveTo(cx - 3, sampleTopY + sampleH - 8);
      ctx.lineTo(cx + 3, sampleTopY + sampleH - 8);
      ctx.lineTo(cx, sampleTopY + sampleH);
      ctx.closePath();
      ctx.fill();

      // Reddish copper coating if reaction occurred
      if (tube.reactionProgress > 0.05) {
        ctx.fillStyle = `rgba(180, 83, 9, ${Math.min(0.9, tube.reactionProgress)})`;
        ctx.fillRect(cx - 4, liquidTopY + 6, 8, sampleH - (liquidTopY - sampleTopY) - 10);
      }
    } else if (metal.shape === 'strip' || metal.shape === 'ribbon') {
      // Zinc strip or Magnesium ribbon
      ctx.fillStyle = metal.color;
      ctx.fillRect(cx - 6, sampleTopY, 12, sampleH);
      ctx.strokeStyle = metal.highlight;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 6, sampleTopY, 12, sampleH);

      // Dark spongy copper deposit if Zn in CuSO4
      if (tube.reactionProgress > 0.05 && tube.solutionId === 'CuSO4') {
        ctx.fillStyle = `rgba(124, 45, 18, ${Math.min(0.95, tube.reactionProgress)})`;
        ctx.fillRect(cx - 7, liquidTopY + 4, 14, sampleH - (liquidTopY - sampleTopY) - 6);
      }
    } else if (metal.shape === 'coil' || metal.shape === 'wire') {
      // Copper coil or Silver wire
      ctx.strokeStyle = metal.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, sampleTopY);
      // Spiral turns
      const turns = 6;
      for (let t = 0; t <= turns; t++) {
        const sy = sampleTopY + (t / turns) * sampleH;
        const sx = cx + (t % 2 === 0 ? 8 : -8);
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Sparkling dendritic silver crystals if Cu in AgNO3!
      if (tube.crystals.length > 0) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        for (const c of tube.crystals) {
          const cy = sampleTopY + c.yNorm * sampleH;
          const endX = cx + Math.cos(c.angle) * c.len;
          const endY = cy + Math.sin(c.angle) * c.len;

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Star twinkle on tip
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.arc(endX, endY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  drawThermometer(ctx) {
    const selTube = this.state.tubes.find(t => t.id === this.state.selectedTubeId);
    if (!selTube) return;

    const bound = this.tubeBounds.find(b => b.id === selTube.id);
    if (!bound) return;

    const tx = bound.x + bound.w - 4;
    const ty = bound.y + 10;
    const th = bound.h * 0.75;

    // Glass thermometer stem
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tx - 3, ty, 6, th, 3);
    ctx.fill();
    ctx.stroke();

    // Red liquid bulb
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(tx, ty + th + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Red liquid height proportional to temp (20°C to 45°C)
    const tempRatio = Math.max(0, Math.min(1, (selTube.temperatureC - 20) / 25));
    const liquidStemH = th * tempRatio;
    ctx.fillRect(tx - 1.5, ty + th - liquidStemH, 3, liquidStemH);

    // Live Digital Temperature Tag
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tx - 32, ty - 24, 64, 20, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.fillText(`${selTube.temperatureC.toFixed(1)}°C`, tx, ty - 10);
  }

  drawReactivityLadderHUD(ctx) {
    const rx = Math.max(16, this.width - 240);
    const ry = 16;
    const rw = 220;
    const rh = 175;

    // Glassmorphic panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 8);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'left';
    ctx.fillText('REACTIVITY SERIES LADDER', rx + 12, ry + 18);

    // Ladder steps (Mg, Al, Zn, Fe, Cu, Ag)
    const keyMetals = [
      { sym: 'Mg', e0: '-2.37 V', color: '#16A34A', rank: 'High' },
      { sym: 'Zn', e0: '-0.76 V', color: '#059669', rank: 'Active' },
      { sym: 'Fe', e0: '-0.44 V', color: '#2563EB', rank: 'Moderate' },
      { sym: 'Cu', e0: '+0.34 V', color: '#D97706', rank: 'Low' },
      { sym: 'Ag', e0: '+0.80 V', color: '#64748B', rank: 'Noble' }
    ];

    ctx.font = '600 10px "JetBrains Mono", monospace';
    let lineY = ry + 42;
    for (const m of keyMetals) {
      // Step dot
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(rx + 16, lineY - 3, 4, 0, Math.PI * 2);
      ctx.fill();

      // Symbol
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText(`${m.sym}`, rx + 28, lineY);

      // Potential E0
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'right';
      ctx.fillText(`${m.e0} (${m.rank})`, rx + rw - 12, lineY);

      lineY += 24;
    }
  }

  interpolateColor(c1, c2, factor) {
    const parse = (c) => {
      const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) return [14, 165, 233, 0.7];
      return [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        match[4] !== undefined ? parseFloat(match[4]) : 1.0
      ];
    };

    const [r1, g1, b1, a1] = parse(c1);
    const [r2, g2, b2, a2] = parse(c2);

    const f = Math.max(0, Math.min(1, factor));
    const r = Math.round(r1 + (r2 - r1) * f);
    const g = Math.round(g1 + (g2 - g1) * f);
    const b = Math.round(b1 + (b2 - b1) * f);
    const a = (a1 + (a2 - a1) * f).toFixed(2);

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

window.ReactivityRenderer = ReactivityRenderer;
