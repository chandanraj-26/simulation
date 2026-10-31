/**
 * CanvasRenderer - Ray Optics Renderer for Spherical Mirrors
 * Follows the Soft Light-Blue Study Law: #E6F2FF canvas background.
 */

export class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 440;

    // Dragging state
    this.isDraggingObject = false;
    this.dragType = 'pos'; // 'pos' (distance) or 'height'

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 440;

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
      const poleX = this.width * 0.62;
      const axisY = this.height * 0.52;
      const pxPerCm = 6.0;

      const objX = poleX - this.model.objectDistance * pxPerCm;
      const objTopY = axisY - this.model.objectHeight * pxPerCm * 2.2;

      // Check if clicked near object top or body
      if (Math.hypot(p.x - objX, p.y - objTopY) < 25) {
        this.isDraggingObject = true;
        this.dragType = 'height';
      } else if (Math.abs(p.x - objX) < 20 && p.y >= objTopY && p.y <= axisY + 15) {
        this.isDraggingObject = true;
        this.dragType = 'pos';
      }
    };

    const onDrag = (e) => {
      if (!this.isDraggingObject) return;
      const p = getPos(e);
      const poleX = this.width * 0.62;
      const axisY = this.height * 0.52;
      const pxPerCm = 6.0;

      if (this.dragType === 'pos') {
        const distPx = poleX - p.x;
        const newDist = Math.max(4.0, Math.min(65.0, distPx / pxPerCm));
        this.model.objectDistance = parseFloat(newDist.toFixed(1));
      } else {
        const heightPx = axisY - p.y;
        const newHeight = Math.max(2.0, Math.min(10.0, heightPx / (pxPerCm * 2.2)));
        this.model.objectHeight = parseFloat(newHeight.toFixed(1));
      }
      this.render();
    };

    const stopDrag = () => {
      this.isDraggingObject = false;
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

    // Soft Light-Blue Study Law Background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawGrid();

    // Geometric benchmark coordinate points
    const poleX = width * 0.62;
    const axisY = height * 0.52;
    const pxPerCm = 6.0; // 1 cm = 6 canvas pixels

    const fMag = this.model.focalDistance;
    const isConcave = (this.model.mirrorType === 'concave');

    // In concave: F and C are in front (to left of pole: x < poleX)
    // In convex: F and C are behind (to right of pole: x > poleX)
    const focalSign = isConcave ? -1 : 1;
    const focusX = poleX + focalSign * fMag * pxPerCm;
    const curvatureX = poleX + focalSign * 2 * fMag * pxPerCm;

    // 1. Draw Principal Axis & Calibration Scale
    this.drawPrincipalAxis(poleX, axisY, focusX, curvatureX, pxPerCm);

    // 2. Draw Spherical Curved Mirror Surface
    this.drawMirrorSurface(poleX, axisY, isConcave, fMag * pxPerCm * 2);

    // 3. Draw Object (Luminous Candle / Arrow)
    const objX = poleX - this.model.objectDistance * pxPerCm;
    const objH = this.model.objectHeight * pxPerCm * 2.2;
    this.drawCandle(objX, axisY, objH, false, 1.0);

    // 4. Calculate Optics & Draw Reflected Image
    const optics = this.model.getRayOptics();
    let imgX = 0;
    let imgH = 0;

    if (!optics.isInfinity) {
      imgX = poleX + optics.v * pxPerCm;
      imgH = optics.h_i * pxPerCm * 2.2;
      this.drawCandle(imgX, axisY, imgH, !optics.isReal, Math.min(1.0, Math.max(0.3, Math.abs(optics.m))));
    }

    // 5. Draw Principal Light Rays
    this.drawLightRays(poleX, axisY, objX, objH, focusX, curvatureX, optics, isConcave, pxPerCm);
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

  drawPrincipalAxis(poleX, axisY, focusX, curvatureX, pxPerCm) {
    const { ctx, width } = this;
    ctx.save();

    // Baseline horizontal axis line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, axisY);
    ctx.lineTo(width - 20, axisY);
    ctx.stroke();

    // Principal optical benchmark dots & labels
    const drawPoint = (x, label, sub) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x, axisY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, axisY + 20);

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(sub, x, axisY + 32);
    };

    drawPoint(poleX, 'P', 'Pole');
    drawPoint(focusX, 'F', 'Focus');
    drawPoint(curvatureX, 'C', 'Center (2F)');

    ctx.restore();
  }

  drawMirrorSurface(poleX, axisY, isConcave, radiusPx) {
    const { ctx } = this;
    ctx.save();

    const mirrorH = 240;
    const curvatureBulge = isConcave ? -18 : 18;

    // Curved mirror glass body
    ctx.beginPath();
    ctx.moveTo(poleX, axisY - mirrorH / 2);
    ctx.quadraticCurveTo(poleX + curvatureBulge, axisY, poleX, axisY + mirrorH / 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Metallic front reflection rim
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();

    // Silvering Hatch Marks on the opaque back surface
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    const hatchDir = isConcave ? 1 : -1;

    for (let y = axisY - mirrorH / 2 + 8; y <= axisY + mirrorH / 2 - 8; y += 12) {
      const normalizedY = (y - axisY) / (mirrorH / 2);
      const arcOffset = curvatureBulge * (1 - normalizedY * normalizedY);
      const startX = poleX + arcOffset;

      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + hatchDir * 8, y - 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCandle(x, axisY, h, isVirtual, opacity) {
    const { ctx } = this;
    ctx.save();

    ctx.globalAlpha = isVirtual ? 0.65 : 1.0;
    const isInverted = (h < 0);
    const candleHeight = Math.abs(h);
    const candleW = 12;

    const waxBottomY = axisY;
    const waxTopY = isInverted ? axisY + candleHeight * 0.7 : axisY - candleHeight * 0.7;
    const flameTipY = isInverted ? axisY + candleHeight : axisY - candleHeight;

    // Candle Wax Body
    const waxGrad = ctx.createLinearGradient(x - candleW / 2, 0, x + candleW / 2, 0);
    waxGrad.addColorStop(0, '#fef08a');
    waxGrad.addColorStop(0.5, '#fef9c3');
    waxGrad.addColorStop(1, '#fde047');

    ctx.fillStyle = waxGrad;
    ctx.fillRect(x - candleW / 2, Math.min(waxBottomY, waxTopY), candleW, Math.abs(waxTopY - waxBottomY));
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - candleW / 2, Math.min(waxBottomY, waxTopY), candleW, Math.abs(waxTopY - waxBottomY));

    // Wick
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, waxTopY);
    ctx.lineTo(x, isInverted ? waxTopY + 5 : waxTopY - 5);
    ctx.stroke();

    // Glowing Tear-Drop Flame
    const flameY = isInverted ? waxTopY + 12 : waxTopY - 12;
    const flameGrad = ctx.createRadialGradient(x, flameY, 1, x, flameY, 12);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#fde047');
    flameGrad.addColorStop(0.8, '#ea580c');
    flameGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.ellipse(x, flameY, 7, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Label tag
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = isVirtual ? '#2563eb' : '#0f172a';
    ctx.fillText(isVirtual ? 'IMAGE (Virtual)' : 'OBJECT', x, isInverted ? waxTopY + 28 : waxBottomY + 16);

    ctx.restore();
  }

  drawLightRays(poleX, axisY, objX, objH, focusX, curvatureX, optics, isConcave, pxPerCm) {
    const { ctx } = this;
    ctx.save();

    const objTopY = axisY - objH;
    const mirrorBulge = isConcave ? -18 : 18;

    // -------------------------------------------------------------
    // RAY 1: Parallel to Principal Axis -> Reflects through Focus
    // -------------------------------------------------------------
    if (this.model.showParallelRay) {
      ctx.strokeStyle = '#ef4444'; // Red
      ctx.lineWidth = 1.8;

      // Incident ray: From object top horizontally to mirror surface
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(poleX, objTopY);
      ctx.stroke();

      // Reflected ray path
      if (isConcave) {
        // Line passes through (poleX, objTopY) and (focusX, axisY)
        const slope = (axisY - objTopY) / (focusX - poleX);
        const exitX = 20;
        const exitY = objTopY + slope * (exitX - poleX);

        ctx.beginPath();
        ctx.moveTo(poleX, objTopY);
        ctx.lineTo(exitX, exitY);
        ctx.stroke();

        // Virtual extension behind mirror if virtual image
        if (!optics.isReal && !optics.isInfinity) {
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(poleX, objTopY);
          ctx.lineTo(poleX + optics.v * pxPerCm, axisY - optics.h_i * pxPerCm * 2.2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        // Convex mirror: appears to diverge from behind-the-mirror focus focusX
        const slope = (axisY - objTopY) / (focusX - poleX);
        const exitX = 20;
        const exitY = objTopY - slope * (poleX - exitX);

        // Real reflected ray diverging outward to the left
        ctx.beginPath();
        ctx.moveTo(poleX, objTopY);
        ctx.lineTo(exitX, exitY);
        ctx.stroke();

        // Virtual backward dashed trace to Focus F
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(poleX, objTopY);
        ctx.lineTo(focusX, axisY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // -------------------------------------------------------------
    // RAY 2: Focal Ray -> Reflects Parallel to Principal Axis
    // -------------------------------------------------------------
    if (this.model.showFocalRay && !optics.isInfinity) {
      ctx.strokeStyle = '#2563eb'; // Blue
      ctx.lineWidth = 1.8;

      if (isConcave) {
        // Passes through focus F to mirror, reflects horizontally
        const slope = (axisY - objTopY) / (focusX - objX);
        const strikeY = objTopY + slope * (poleX - objX);

        ctx.beginPath();
        ctx.moveTo(objX, objTopY);
        ctx.lineTo(poleX, strikeY);
        ctx.lineTo(20, strikeY);
        ctx.stroke();

        // Virtual dashed extension behind mirror
        if (!optics.isReal) {
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(poleX, strikeY);
          ctx.lineTo(poleX + optics.v * pxPerCm, strikeY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        // Directed towards virtual focus F behind convex mirror
        const slope = (axisY - objTopY) / (focusX - objX);
        const strikeY = objTopY + slope * (poleX - objX);

        ctx.beginPath();
        ctx.moveTo(objX, objTopY);
        ctx.lineTo(poleX, strikeY);
        ctx.lineTo(20, strikeY); // Reflects parallel
        ctx.stroke();

        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(poleX, strikeY);
        ctx.lineTo(focusX, axisY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // -------------------------------------------------------------
    // RAY 3: Center of Curvature Ray -> Retraces own path
    // -------------------------------------------------------------
    if (this.model.showCurvatureRay) {
      ctx.strokeStyle = '#059669'; // Emerald Green
      ctx.lineWidth = 1.8;

      if (isConcave) {
        // Straight line from object top through C to mirror
        ctx.beginPath();
        ctx.moveTo(objX, objTopY);
        ctx.lineTo(curvatureX, axisY);
        ctx.lineTo(poleX, axisY - (axisY - objTopY) * 1.4);
        ctx.stroke();
      } else {
        // Directed toward virtual C
        const slope = (axisY - objTopY) / (curvatureX - objX);
        const strikeY = objTopY + slope * (poleX - objX);

        ctx.beginPath();
        ctx.moveTo(objX, objTopY);
        ctx.lineTo(poleX, strikeY);
        ctx.stroke();

        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(poleX, strikeY);
        ctx.lineTo(curvatureX, axisY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }
}
