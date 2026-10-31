/**
 * CanvasRenderer - High-DPI 2D Canvas Renderer for Vernier Caliper & Micrometer Screw Gauge
 * Complies with the Soft Light-Blue Study Law: #E6F2FF canvas background, crisp vector apparatus.
 */

export class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 420;

    // Dragging state
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragInitialPos = 0;

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 420;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.render();
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrag = (e) => {
      const p = getPos(e);
      this.isDragging = true;
      this.dragStartX = p.x;
      this.dragInitialPos = this.model.mode === 'vernier'
        ? this.model.vernier.jawPosition
        : this.model.screwGauge.spindlePosition;
    };

    const onDrag = (e) => {
      if (!this.isDragging || this.model.isClamped) return;
      const p = getPos(e);
      const deltaX = p.x - this.dragStartX;
      
      // Conversion from pixels to mm: scale factor varies by mode
      const pxPerMm = this.model.mode === 'vernier' ? (this.width / 150) : (this.width / 35);
      const newPos = this.dragInitialPos + (deltaX / pxPerMm);
      this.model.setPosition(newPos);
      this.render();
    };

    const stopDrag = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);

    this.canvas.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', onDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
  }

  render() {
    const { ctx, width, height } = this;
    
    // Clear with Study Environment Soft Light-Blue canvas backdrop
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid guide
    this.drawSubtleGrid();

    if (this.model.mode === 'vernier') {
      this.drawVernierCaliper();
    } else {
      this.drawScrewGauge();
    }

    if (this.model.magnifierActive) {
      this.drawMagnifierLoupe();
    }
  }

  drawSubtleGrid() {
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
     VERNIER CALIPER RENDERING
     ========================================================================== */
  drawVernierCaliper() {
    const { ctx, width, height } = this;
    const v = this.model.vernier;
    const readings = this.model.getVernierReadings();

    // Scale metric: map mm to canvas pixels
    // Let 0 mm be at originX = 140px, beam extends across width - 40px
    const originX = Math.max(90, width * 0.14);
    const beamY = height * 0.44;
    const beamH = 46;
    const pxPerMm = (width - originX - 60) / 100; // ~100 mm scale view

    const jawPosMm = v.jawPosition;
    const jawPosPx = jawPosMm * pxPerMm;

    // 1. Draw Depth Probe Rod protruding from the right end of the beam
    const probeEndX = originX + (100 * pxPerMm) + jawPosPx;
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(originX + 100 * pxPerMm, beamY + beamH * 0.45, jawPosPx, 5);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(originX + 100 * pxPerMm, beamY + beamH * 0.45, jawPosPx, 5);
    ctx.restore();

    // 2. Draw Fixed Main Beam & Fixed External/Internal Jaws
    this.drawFixedCaliperBody(originX, beamY, beamH, pxPerMm);

    // 3. Draw Test Object clamped between jaws (if any object selected)
    this.drawClampedObject(originX, beamY, jawPosPx, jawPosMm);

    // 4. Draw Sliding Vernier Scale Assembly (Sliding Jaws & Scale Window)
    this.drawSlidingVernierAssembly(originX, beamY, beamH, pxPerMm, jawPosPx, readings);
  }

  drawFixedCaliperBody(originX, beamY, beamH, pxPerMm) {
    const { ctx, width } = this;
    ctx.save();

    // Metallic Stainless Steel Gradient for Beam
    const beamGrad = ctx.createLinearGradient(0, beamY, 0, beamY + beamH);
    beamGrad.addColorStop(0, '#f8fafc');
    beamGrad.addColorStop(0.5, '#e2e8f0');
    beamGrad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = beamGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // Fixed main beam bar
    ctx.fillRect(originX, beamY, width - originX - 40, beamH);
    ctx.strokeRect(originX, beamY, width - originX - 40, beamH);

    // Fixed External Lower Jaw (for outer dimension)
    ctx.beginPath();
    ctx.moveTo(originX, beamY);
    ctx.lineTo(originX - 60, beamY);
    ctx.lineTo(originX - 60, beamY + 140);
    ctx.lineTo(originX - 15, beamY + 140);
    ctx.lineTo(originX, beamY + 45);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.stroke();

    // Fixed Internal Upper Jaw (for inner dimension)
    ctx.beginPath();
    ctx.moveTo(originX, beamY);
    ctx.lineTo(originX - 45, beamY);
    ctx.lineTo(originX - 45, beamY - 70);
    ctx.lineTo(originX - 10, beamY - 70);
    ctx.lineTo(originX, beamY);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.stroke();

    // Main Scale Millimeter Tick Marks along the beam
    ctx.fillStyle = '#0f172a';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (let mm = 0; mm <= 100; mm++) {
      const x = originX + mm * pxPerMm;
      if (x > width - 45) break;

      let tickH = 7;
      if (mm % 10 === 0) {
        tickH = 18;
        ctx.fillText(mm / 10, x, beamY + 34); // Centimeter labels
      } else if (mm % 5 === 0) {
        tickH = 12;
      }

      ctx.beginPath();
      ctx.moveTo(x, beamY);
      ctx.lineTo(x, beamY + tickH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = (mm % 10 === 0) ? 1.5 : 1;
      ctx.stroke();
    }

    // Scale header tag
    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('MAIN SCALE (cm / mm)', originX + 70, beamY + 42);

    ctx.restore();
  }

  drawClampedObject(originX, beamY, jawPosPx, jawPosMm) {
    const { ctx } = this;
    const obj = this.model.currentObject;
    if (obj.size <= 0 || jawPosMm < 0.5) return;

    ctx.save();
    const objectCenterY = beamY + 80;
    const objectLeftX = originX;
    const objectW = Math.min(jawPosPx, obj.size * (this.width / 150));

    if (obj.shape === 'circle') {
      // Ball bearing / sphere
      const radius = Math.min(36, objectW / 2);
      const cx = objectLeftX + radius;
      const cy = objectCenterY;

      const sphereGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 2, cx, cy, radius);
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.5, obj.color);
      sphereGrad.addColorStop(1, '#334155');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
    } else {
      // Cylinder or rectangular plate
      const rectH = 50;
      const rx = objectLeftX;
      const ry = objectCenterY - rectH / 2;

      const objGrad = ctx.createLinearGradient(rx, ry, rx + objectW, ry);
      objGrad.addColorStop(0, obj.color);
      objGrad.addColorStop(0.5, '#ffffff');
      objGrad.addColorStop(1, obj.color);

      ctx.fillStyle = objGrad;
      ctx.fillRect(rx, ry, objectW, rectH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rx, ry, objectW, rectH);
    }

    ctx.restore();
  }

  drawSlidingVernierAssembly(originX, beamY, beamH, pxPerMm, jawPosPx, readings) {
    const { ctx } = this;
    ctx.save();

    const slideX = originX + jawPosPx;
    const slideW = 90;
    const slideH = beamH + 16;
    const slideY = beamY - 8;

    // Metallic Gradient for Slider
    const slideGrad = ctx.createLinearGradient(0, slideY, 0, slideY + slideH);
    slideGrad.addColorStop(0, '#ffffff');
    slideGrad.addColorStop(0.5, '#e2e8f0');
    slideGrad.addColorStop(1, '#94a3b8');

    // 1. Sliding Lower External Jaw
    ctx.beginPath();
    ctx.moveTo(slideX, beamY);
    ctx.lineTo(slideX, beamY + 140);
    ctx.lineTo(slideX + 18, beamY + 140);
    ctx.lineTo(slideX + 45, beamY + 45);
    ctx.lineTo(slideX + slideW, beamY + 45);
    ctx.lineTo(slideX + slideW, slideY);
    ctx.lineTo(slideX, slideY);
    ctx.closePath();
    ctx.fillStyle = slideGrad;
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Sliding Upper Internal Jaw
    ctx.beginPath();
    ctx.moveTo(slideX, beamY);
    ctx.lineTo(slideX, beamY - 70);
    ctx.lineTo(slideX + 12, beamY - 70);
    ctx.lineTo(slideX + 35, slideY);
    ctx.closePath();
    ctx.fillStyle = slideGrad;
    ctx.fill();
    ctx.stroke();

    // 3. Vernier Scale Window Bevel Cutout
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(slideX + 2, beamY - 2, 75, 28);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(slideX + 2, beamY - 2, 75, 28);

    // 4. Vernier Scale Tick Marks (10 divisions spanning 9 MSD = 9 mm)
    // Each Vernier division = 0.9 * pxPerMm
    const vDivPx = 0.9 * pxPerMm;
    const numDivs = this.model.vernier.numDivisions;

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i <= numDivs; i++) {
      const vx = slideX + i * vDivPx;
      const isCoincident = (i === readings.vsr);

      ctx.beginPath();
      ctx.moveTo(vx, beamY);
      ctx.lineTo(vx, beamY + (isCoincident ? 16 : (i % 5 === 0 ? 12 : 7)));

      if (isCoincident) {
        ctx.strokeStyle = '#dc2626'; // Vivid highlight for coincident mark
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      if (i === 0 || i === 5 || i === 10) {
        ctx.fillStyle = isCoincident ? '#dc2626' : '#0f172a';
        ctx.fillText(i, vx, beamY + 24);
      }
    }

    // Thumb Grip Ridges on the right of the slider
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) {
      ctx.beginPath();
      ctx.moveTo(slideX + slideW - 14 + r * 3, beamY + 50);
      ctx.lineTo(slideX + slideW - 14 + r * 3, beamY + 70);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ==========================================================================
     SCREW GAUGE (MICROMETER) RENDERING
     ========================================================================== */
  drawScrewGauge() {
    const { ctx, width, height } = this;
    const sg = this.model.screwGauge;
    const readings = this.model.getScrewGaugeReadings();

    const originX = Math.max(100, width * 0.18);
    const centerY = height * 0.48;
    const maxOpenPx = 180;
    const pxPerMm = maxOpenPx / 25.0; // 25 mm span
    const spindleOpenPx = sg.spindlePosition * pxPerMm;

    // 1. Draw Massive Cast Iron U-Shaped Frame
    ctx.save();
    const frameGrad = ctx.createLinearGradient(originX, centerY - 120, originX + 200, centerY + 140);
    frameGrad.addColorStop(0, '#0284c7');
    frameGrad.addColorStop(0.5, '#0369a1');
    frameGrad.addColorStop(1, '#075985');

    ctx.beginPath();
    // Heavy semicircular curve
    ctx.arc(originX + 80, centerY + 30, 95, Math.PI, 0, true);
    ctx.lineWidth = 26;
    ctx.strokeStyle = frameGrad;
    ctx.stroke();

    // Frame Spec Plate
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0 – 25 mm × 0.01 mm', originX + 80, centerY + 115);
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#bae6fd';
    ctx.fillText('LEAST COUNT = 0.01 mm', originX + 80, centerY + 130);
    ctx.restore();

    // 2. Left Anvil Stud (Fixed)
    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(originX - 15, centerY - 9, 15, 18);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(originX - 15, centerY - 9, 15, 18);
    ctx.restore();

    // 3. Test Object Clamped Between Anvil & Spindle
    if (this.model.currentObject.size > 0 && sg.spindlePosition > 0.05) {
      this.drawMicrometerObject(originX, centerY, spindleOpenPx);
    }

    // 4. Movable Spindle Rod
    ctx.save();
    const spindleX = originX + spindleOpenPx;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(spindleX, centerY - 9, originX + 130 - spindleX, 18);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(spindleX, centerY - 9, originX + 130 - spindleX, 18);
    ctx.restore();

    // 5. Linear Sleeve / Barrel (Main Scale)
    const sleeveX = originX + 130;
    const sleeveW = 120;
    const sleeveH = 34;
    ctx.save();
    const sleeveGrad = ctx.createLinearGradient(0, centerY - sleeveH / 2, 0, centerY + sleeveH / 2);
    sleeveGrad.addColorStop(0, '#f8fafc');
    sleeveGrad.addColorStop(0.5, '#e2e8f0');
    sleeveGrad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = sleeveGrad;
    ctx.fillRect(sleeveX, centerY - sleeveH / 2, sleeveW, sleeveH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(sleeveX, centerY - sleeveH / 2, sleeveW, sleeveH);

    // Datum Reference Baseline
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sleeveX, centerY);
    ctx.lineTo(sleeveX + sleeveW, centerY);
    ctx.stroke();

    // Pitch Scale mm marks along the datum line
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';

    for (let mm = 0; mm <= 25; mm++) {
      const mx = sleeveX + (mm * pxPerMm);
      if (mx > sleeveX + sleeveW - 10) break;

      const isUpper = (mm % 1 === 0);
      ctx.beginPath();
      ctx.moveTo(mx, centerY);
      ctx.lineTo(mx, centerY - (mm % 5 === 0 ? 10 : 6));
      ctx.stroke();

      if (mm % 5 === 0) {
        ctx.fillText(mm, mx, centerY - 12);
      }
    }
    ctx.restore();

    // 6. Rotating Circular Thimble with Beveled Lip & Knurled Ratchet
    const thimbleX = sleeveX + spindleOpenPx;
    this.drawMicrometerThimble(thimbleX, centerY, readings);
  }

  drawMicrometerObject(originX, centerY, spindleOpenPx) {
    const { ctx } = this;
    const obj = this.model.currentObject;
    ctx.save();
    const objW = Math.min(spindleOpenPx, obj.size * (this.width / 35));

    if (obj.shape === 'circle' || obj.shape === 'wire') {
      const radius = Math.min(18, objW / 2);
      ctx.fillStyle = obj.color;
      ctx.beginPath();
      ctx.arc(originX + radius, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
    } else {
      ctx.fillStyle = obj.color;
      ctx.fillRect(originX, centerY - 16, objW, 32);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(originX, centerY - 16, objW, 32);
    }
    ctx.restore();
  }

  drawMicrometerThimble(thimbleX, centerY, readings) {
    const { ctx } = this;
    ctx.save();

    const thimbleW = 85;
    const thimbleH = 46;
    const bevelW = 18;

    // Beveled Collar
    ctx.beginPath();
    ctx.moveTo(thimbleX, centerY - (thimbleH - 12) / 2);
    ctx.lineTo(thimbleX + bevelW, centerY - thimbleH / 2);
    ctx.lineTo(thimbleX + bevelW, centerY + thimbleH / 2);
    ctx.lineTo(thimbleX, centerY + (thimbleH - 12) / 2);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Thimble Cylinder Body
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(thimbleX + bevelW, centerY - thimbleH / 2, thimbleW - bevelW, thimbleH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(thimbleX + bevelW, centerY - thimbleH / 2, thimbleW - bevelW, thimbleH);

    // Circular Scale Divisions on the Beveled Lip
    // Wrap circular scale around centerY
    const hsr = readings.hsr;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let offset = -5; offset <= 5; offset++) {
      let divVal = (hsr + offset) % 100;
      if (divVal < 0) divVal += 100;

      const markY = centerY - offset * 4.2;
      const isCoincident = (offset === 0);

      ctx.beginPath();
      ctx.moveTo(thimbleX, markY);
      ctx.lineTo(thimbleX + (isCoincident ? 12 : 7), markY);

      if (isCoincident) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      if (divVal % 5 === 0 || isCoincident) {
        ctx.fillStyle = isCoincident ? '#dc2626' : '#1e293b';
        ctx.fillText(divVal, thimbleX + 16, markY + 3);
      }
    }

    // Knurled Texture Ridges on Thimble
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let k = thimbleX + bevelW + 15; k < thimbleX + thimbleW - 10; k += 4) {
      ctx.beginPath();
      ctx.moveTo(k, centerY - thimbleH / 2 + 3);
      ctx.lineTo(k, centerY + thimbleH / 2 - 3);
      ctx.stroke();
    }

    // Ratchet Stop Cap (End of Micrometer)
    const ratchetX = thimbleX + thimbleW;
    const ratchetW = 32;
    const ratchetH = 24;
    ctx.fillStyle = '#64748b';
    ctx.fillRect(ratchetX, centerY - ratchetH / 2, ratchetW, ratchetH);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(ratchetX, centerY - ratchetH / 2, ratchetW, ratchetH);

    ctx.restore();
  }

  /* ==========================================================================
     MAGNIFYING LOUPE (High-Zoom Inset Window)
     ========================================================================== */
  drawMagnifierLoupe() {
    const { ctx, width } = this;
    ctx.save();

    const loupeW = 200;
    const loupeH = 100;
    const loupeX = width - loupeW - 20;
    const loupeY = 20;

    // Glass backdrop with border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(loupeX, loupeY, loupeW, loupeH, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header badge
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('3.5× MAGNIFIED COINCIDENCE LOUPE', loupeX + 12, loupeY + 16);

    // Zoomed details
    if (this.model.mode === 'vernier') {
      const r = this.model.getVernierReadings();
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`Main Scale: ${r.msr} mm`, loupeX + 14, loupeY + 38);
      ctx.fillStyle = '#dc2626';
      ctx.fillText(`Vernier Coincidence: #${r.vsr}`, loupeX + 14, loupeY + 56);
      ctx.fillStyle = '#0369a1';
      ctx.fillText(`Fraction: ${r.vsr} × 0.1 = ${r.fractionMm} mm`, loupeX + 14, loupeY + 74);
      ctx.fillStyle = '#16a34a';
      ctx.fillText(`Total: ${r.corrected} mm`, loupeX + 14, loupeY + 92);
    } else {
      const r = this.model.getScrewGaugeReadings();
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`Pitch Scale: ${r.psr} mm`, loupeX + 14, loupeY + 38);
      ctx.fillStyle = '#dc2626';
      ctx.fillText(`Circular Coincidence: #${r.hsr}`, loupeX + 14, loupeY + 56);
      ctx.fillStyle = '#0369a1';
      ctx.fillText(`Fraction: ${r.hsr} × 0.01 = ${r.fractionMm} mm`, loupeX + 14, loupeY + 74);
      ctx.fillStyle = '#16a34a';
      ctx.fillText(`Total: ${r.corrected} mm`, loupeX + 14, loupeY + 92);
    }

    ctx.restore();
  }
}
