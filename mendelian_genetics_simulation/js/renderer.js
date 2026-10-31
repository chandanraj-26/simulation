/**
 * CanvasRenderer - Visualizes Punnett Squares, Pea Plants, Seeds & Monte Carlo Histograms
 * Study Environment Law: #E6F2FF canvas background.
 */

export class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 460;

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 460;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.render();
  }

  initEvents() {
    // Canvas click events could toggle cell highlights
  }

  render() {
    const { ctx, width, height } = this;

    // Study Environment Soft Light-Blue Background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawGrid();

    if (this.model.mode === 'monohybrid') {
      this.drawMonohybridView();
    } else {
      this.drawDihybridView();
    }
  }

  drawGrid() {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ==========================================================================
     MONOHYBRID PUNNETT SQUARE & PLANT ILLUSTRATION
     ========================================================================== */
  drawMonohybridView() {
    const { ctx, width, height } = this;
    const gridData = this.model.getMonohybridGrid();

    // 1. Draw Punnett Square Box (Left Half)
    const squareX = width * 0.12;
    const squareY = height * 0.22;
    const cellSize = 110;

    this.drawPunnettSquare2x2(squareX, squareY, cellSize, gridData);

    // 2. Draw Botanical Pea Plant Illustrations (Center)
    this.drawPeaPlant(width * 0.52, height * 0.68, true);  // Tall plant
    this.drawPeaPlant(width * 0.65, height * 0.68, false); // Dwarf plant

    // 3. Draw Monte Carlo Sample Histogram (Right Half)
    this.drawMonohybridHistogram(width * 0.76, height * 0.18, 150, 240, gridData);
  }

  drawPunnettSquare2x2(x, y, cellSize, gridData) {
    const { ctx } = this;
    ctx.save();

    // Header labels: Parent 1 (left side) and Parent 2 (top)
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.textAlign = 'center';
    ctx.fillText(`Parent 1 (${this.model.monoP1}) ♀`, x + cellSize, y - 40);
    ctx.fillText(`Parent 2 (${this.model.monoP2}) ♂`, x - 40, y + cellSize);

    // Gamete labels
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(gridData.gametes2[0], x + cellSize * 0.5, y - 14);
    ctx.fillText(gridData.gametes2[1], x + cellSize * 1.5, y - 14);

    ctx.fillText(gridData.gametes1[0], x - 18, y + cellSize * 0.5 + 5);
    ctx.fillText(gridData.gametes1[1], x - 18, y + cellSize * 1.5 + 5);

    // Cells
    gridData.cells.forEach((cell, idx) => {
      const r = Math.floor(idx / 2);
      const c = idx % 2;
      const cx = x + c * cellSize;
      const cy = y + r * cellSize;

      const isTall = cell.phenotype === 'Tall';

      // Cell background
      ctx.fillStyle = isTall ? '#DCFCE7' : '#FEF3C7';
      ctx.fillRect(cx, cy, cellSize, cellSize);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx, cy, cellSize, cellSize);

      // Genotype text
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(cell.genotype, cx + cellSize / 2, cy + cellSize / 2 - 4);

      // Phenotype text
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isTall ? '#15803D' : '#B45309';
      ctx.fillText(cell.phenotype, cx + cellSize / 2, cy + cellSize / 2 + 18);
    });

    ctx.restore();
  }

  drawPeaPlant(x, groundY, isTall) {
    const { ctx } = this;
    ctx.save();

    const stemH = isTall ? 170 : 80;
    const stemTopY = groundY - stemH;

    // Stem vine
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.quadraticCurveTo(x - 10, groundY - stemH * 0.5, x, stemTopY);
    ctx.stroke();

    // Leaves
    const numLeaves = isTall ? 6 : 3;
    for (let i = 1; i <= numLeaves; i++) {
      const ly = groundY - (i / (numLeaves + 1)) * stemH;
      const dir = (i % 2 === 0 ? 1 : -1);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(x + dir * 14, ly, 12, 6, dir * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Pea pod on tall vine
    if (isTall) {
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.ellipse(x + 12, stemTopY + 40, 16, 5, 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.stroke();
    }

    // Ground line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 25, groundY);
    ctx.lineTo(x + 25, groundY);
    ctx.stroke();

    // Label
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isTall ? '#15803d' : '#b45309';
    ctx.textAlign = 'center';
    ctx.fillText(isTall ? 'Tall Vine (T-)' : 'Dwarf Vine (tt)', x, groundY + 16);

    ctx.restore();
  }

  drawMonohybridHistogram(x, y, w, h, gridData) {
    const { ctx } = this;
    ctx.save();

    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('OFFSPRING FREQUENCY', x + w / 2, y - 8);

    const total = this.model.totalSamples;
    const tallCount = this.model.sampleCounts['Tall'] || 0;
    const dwarfCount = this.model.sampleCounts['Dwarf'] || 0;

    const tallFrac = total > 0 ? tallCount / total : gridData.phenoCounts['Tall'] / 4;
    const dwarfFrac = total > 0 ? dwarfCount / total : gridData.phenoCounts['Dwarf'] / 4;

    const barW = 45;
    const maxBarH = 150;

    // Tall Bar
    const tallH = tallFrac * maxBarH;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 15, y + h - tallH - 30, barW, tallH);
    ctx.strokeStyle = '#15803d';
    ctx.strokeRect(x + 15, y + h - tallH - 30, barW, tallH);

    // Dwarf Bar
    const dwarfH = dwarfFrac * maxBarH;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 85, y + h - dwarfH - 30, barW, dwarfH);
    ctx.strokeStyle = '#b45309';
    ctx.strokeRect(x + 85, y + h - dwarfH - 30, barW, dwarfH);

    // Labels & percentages
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${(tallFrac * 100).toFixed(1)}%`, x + 15 + barW / 2, y + h - tallH - 36);
    ctx.fillText(`${(dwarfFrac * 100).toFixed(1)}%`, x + 85 + barW / 2, y + h - dwarfH - 36);

    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Tall', x + 15 + barW / 2, y + h - 14);
    ctx.fillText('Dwarf', x + 85 + barW / 2, y + h - 14);

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(total > 0 ? `N = ${total} Trials` : 'Theoretical 3:1', x + w / 2, y + h);

    ctx.restore();
  }

  /* ==========================================================================
     DIHYBRID 4X4 PUNNETT SQUARE & SEED PHENOTYPES
     ========================================================================== */
  drawDihybridView() {
    const { ctx, width, height } = this;
    const gridData = this.model.getDihybridGrid();

    const squareX = width * 0.08;
    const squareY = height * 0.16;
    const cellSize = 68;

    this.drawPunnettSquare4x4(squareX, squareY, cellSize, gridData);
    this.drawDihybridHistogram(width * 0.65, height * 0.16, 230, 280, gridData);
  }

  drawPunnettSquare4x4(x, y, cellSize, gridData) {
    const { ctx } = this;
    ctx.save();

    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.textAlign = 'center';
    ctx.fillText(`Parent 1 (${this.model.diP1}) ♀ × Parent 2 (${this.model.diP2}) ♂`, x + cellSize * 2, y - 28);

    // Gametes top and left
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';

    for (let i = 0; i < 4; i++) {
      ctx.fillText(gridData.gametes2[i], x + i * cellSize + cellSize / 2, y - 10);
      ctx.fillText(gridData.gametes1[i], x - 18, y + i * cellSize + cellSize / 2 + 4);
    }

    gridData.cells.forEach((cell, idx) => {
      const r = Math.floor(idx / 4);
      const c = idx % 4;
      const cx = x + c * cellSize;
      const cy = y + r * cellSize;

      // Color coding based on seed phenotype
      let cellBg = '#fef08a'; // Round Yellow
      if (cell.phenotype === 'Round Green') cellBg = '#bbf7d0';
      else if (cell.phenotype === 'Wrinkled Yellow') cellBg = '#fed7aa';
      else if (cell.phenotype === 'Wrinkled Green') cellBg = '#dcfce7';

      ctx.fillStyle = cellBg;
      ctx.fillRect(cx, cy, cellSize, cellSize);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, cellSize, cellSize);

      // Draw Mini Seed Icon in cell
      this.drawSeedIcon(cx + cellSize / 2, cy + cellSize / 2 - 8, cell.phenotype, 8);

      // Genotype label
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(cell.genotype, cx + cellSize / 2, cy + cellSize - 8);
    });

    ctx.restore();
  }

  drawSeedIcon(cx, cy, pheno, radius) {
    const { ctx } = this;
    ctx.save();

    const isYellow = pheno.includes('Yellow');
    const isRound = pheno.includes('Round');

    ctx.fillStyle = isYellow ? '#eab308' : '#22c55e';
    ctx.strokeStyle = isYellow ? '#ca8a04' : '#15803d';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    if (isRound) {
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    } else {
      // Wrinkled angular shape
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const rad = radius + (Math.sin(a * 4) * 2.5);
        const px = cx + Math.cos(a) * rad;
        const py = cy + Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawDihybridHistogram(x, y, w, h, gridData) {
    const { ctx } = this;
    ctx.save();

    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('DIHYBRID PHENOTYPIC RATIO (9:3:3:1)', x + w / 2, y - 8);

    const categories = [
      { name: 'Round Yellow', color: '#eab308', ideal: 9 / 16 },
      { name: 'Round Green', color: '#22c55e', ideal: 3 / 16 },
      { name: 'Wrinkled Yellow', color: '#f97316', ideal: 3 / 16 },
      { name: 'Wrinkled Green', color: '#16a34a', ideal: 1 / 16 }
    ];

    const total = this.model.totalSamples;
    const barW = 40;
    const maxBarH = 160;

    categories.forEach((cat, idx) => {
      const bx = x + 10 + idx * 52;
      const count = this.model.sampleCounts[cat.name] || 0;
      const frac = total > 0 ? count / total : cat.ideal;
      const barH = frac * maxBarH;

      ctx.fillStyle = cat.color;
      ctx.fillRect(bx, y + h - barH - 45, barW, barH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(bx, y + h - barH - 45, barW, barH);

      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`${(frac * 100).toFixed(0)}%`, bx + barW / 2, y + h - barH - 50);

      this.drawSeedIcon(bx + barW / 2, y + h - 30, cat.name, 6);
    });

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(total > 0 ? `N = ${total} Simulated Seeds` : 'Theoretical 9:3:3:1', x + w / 2, y + h - 5);

    ctx.restore();
  }
}
