/**
 * OpticsLab — Interactive Lens Simulation
 * Canvas 2D High-DPI Rendering Engine & Direct Interaction Handlers
 */

import { state, setState } from './state.js';
import { calculateOptics } from './optics.js';

export class LensRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animFrameId = null;
    this.pulsePhase = 0; // for animated photon pulses

    // Drag interaction tracking
    this.dragType = null;
    this.dragStart = { x: 0, y: 0 };
    this.initialState = {};

    // Preload Student Character Image (converted from man-character.eps)
    this.studentImg = new Image();
    this.studentImg.src = 'man-character.png';
    this.studentImgLoaded = false;
    this.studentImg.onload = () => {
      this.studentImgLoaded = true;
      this.render();
    };

    this.initCanvasSize();
    this.bindEvents();
    this.startAnimationLoop();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;

    // Center optical center in canvas
    state.originX = this.width / 2 + state.panOffset.x;
    state.originY = this.height / 2 + state.panOffset.y;
  }

  resize() {
    this.initCanvasSize();
    this.render();
  }

  // Coordinate transforms: Cartesian (cm) <-> Canvas Screen (px)
  toScreenX(cmX) {
    return state.originX + cmX * state.scale * state.zoom;
  }

  toScreenY(cmY) {
    return state.originY - cmY * state.scale * state.zoom;
  }

  toCartesianX(screenX) {
    return (screenX - state.originX) / (state.scale * state.zoom);
  }

  toCartesianY(screenY) {
    return (state.originY - screenY) / (state.scale * state.zoom);
  }

  startAnimationLoop() {
    const loop = () => {
      this.pulsePhase = (this.pulsePhase + 0.04) % 1;
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  updateDynamicViewport(optics) {
    if (!state.autoFit) {
      state.originX = this.width / 2 + state.panOffset.x;
      state.originY = this.height / 2 + state.panOffset.y;
      return;
    }

    const { u, ho, v, hi, isAtInfinity, absF } = optics;
    const lensH = this.getLensHalfHeightCm(optics);

    // 1. Horizontal bounds in cm (covers object, focal points, and formed image)
    let minX = Math.min(u - 10, -2 * absF - 10);
    let maxX = Math.max(2 * absF + 10, 20);

    if (v !== null && !isAtInfinity) {
      const clampedV = Math.max(-130, Math.min(130, v));
      minX = Math.min(minX, clampedV - 10);
      maxX = Math.max(maxX, clampedV + 10);
    } else {
      maxX = Math.max(maxX, 2 * absF + 35);
    }

    // 2. Vertical bounds in cm (covers object tip, lens top/bottom, and image tip)
    let minY = -lensH - 6;
    let maxY = lensH + 6;

    if (hi !== null && !isAtInfinity) {
      const clampedHi = Math.max(-75, Math.min(75, hi));
      minY = Math.min(minY, clampedHi - 8);
      maxY = Math.max(maxY, clampedHi + 8);
    }

    // Usable canvas dimensions with padding for HUD, ruler, and controls
    const padLeft = 140;
    const padRight = 60;
    const padTop = 50;
    const padBottom = 55;

    const usableW = Math.max(160, this.width - padLeft - padRight);
    const usableH = Math.max(160, this.height - padTop - padBottom);

    const spanX = Math.max(20, maxX - minX);
    const spanY = Math.max(20, maxY - minY);

    let targetScale = Math.min(usableW / spanX, usableH / spanY);
    targetScale = Math.max(3.2, Math.min(11.5, targetScale));

    const boxCenterX = (minX + maxX) / 2;
    const boxCenterY = (minY + maxY) / 2;

    const targetOriginX = (padLeft + (this.width - padRight)) / 2 - boxCenterX * targetScale;
    const targetOriginY = (padTop + (this.height - padBottom)) / 2 + boxCenterY * targetScale;

    // Smooth lerp for fluid dynamic adjustment
    const lerpSpeed = state.isDragging ? 0.35 : 0.14;
    state.scale += (targetScale - state.scale) * lerpSpeed;
    state.originX += (targetOriginX - state.originX) * lerpSpeed;
    state.originY += (targetOriginY - state.originY) * lerpSpeed;
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  render() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    const optics = calculateOptics(state);

    // Dynamic auto-fit and centering so ALL diagram elements are fully plotted
    this.updateDynamicViewport(optics);

    // 1. Draw subtle background coordinate grid
    if (state.showGrid) {
      this.drawGrid();
    }

    // 2. Draw optical bench ruler & principal axis
    this.drawPrincipalAxis(optics);

    // 3. Draw Light Cone (if enabled)
    if (state.showLightCone) {
      this.drawLightCone(optics);
    }

    // 4. Draw Principal Rays
    this.drawRays(optics);

    // 5. Draw the Physical Glass Lens
    this.drawLens(optics);

    // 6. Draw Cardinal Points (O, F1, 2F1, F2, 2F2)
    this.drawCardinalPoints(optics);

    // 7. Draw the Object (Candle or Arrow)
    this.drawObject(optics);

    // 8. Draw the Formed Image (Real solid or Virtual ghostly)
    this.drawImage(optics);

    // 9. Draw interactive hover handles / cursors
    this.drawInteractiveHandles(optics);
  }

  // =========================================================================
  // BACKGROUND GRID & OPTICAL BENCH RULER
  // =========================================================================
  drawGrid() {
    const { ctx, width, height } = this;
    const step = 5 * state.scale * state.zoom; // 5 cm grid lines

    ctx.save();
    ctx.lineWidth = 1;

    // Vertical grid lines
    const startX = state.originX % step;
    for (let x = startX; x < width; x += step) {
      const cm = Math.round(this.toCartesianX(x));
      ctx.strokeStyle = cm === 0 ? 'rgba(59, 130, 246, 0.25)' : cm % 10 === 0 ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.06)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const startY = state.originY % step;
    for (let y = startY; y < height; y += step) {
      const cm = Math.round(this.toCartesianY(y));
      ctx.strokeStyle = cm === 0 ? 'rgba(59, 130, 246, 0.25)' : cm % 10 === 0 ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.06)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPrincipalAxis(optics) {
    const { ctx, width } = this;
    const axisY = state.originY;

    ctx.save();
    // Principal axis line with subtle glow
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    ctx.stroke();

    // Bench ruler tick marks & cm numbers
    if (state.showRuler) {
      const step = 5 * state.scale * state.zoom;
      const startX = state.originX % step;

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';

      for (let x = startX; x < width; x += step) {
        const cm = Math.round(this.toCartesianX(x));
        if (Math.abs(cm) > 150) continue;

        const isMajor = cm % 10 === 0;
        const tickHeight = isMajor ? 12 : 6;

        ctx.strokeStyle = isMajor ? '#64748b' : '#cbd5e1';
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x, axisY - tickHeight / 2);
        ctx.lineTo(x, axisY + tickHeight / 2);
        ctx.stroke();

        if (isMajor && Math.abs(x - state.originX) > 10) {
          ctx.fillText(`${cm > 0 ? '+' : ''}${cm}`, x, axisY + 18);
        }
      }

      // Principal Axis Label
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'right';
      ctx.fillText('Principal Axis (cm)', width - 20, axisY - 10);
    }
    ctx.restore();
  }

  // Calculate dynamic lens half-height in cm to ensure all 3 principal rays always pass through glass
  getLensHalfHeightCm(optics) {
    const maxRayY = Math.max(
      Math.abs(optics.ho),
      optics.hi !== null && !optics.isAtInfinity ? Math.abs(optics.hi) : 0,
      20
    );
    return Math.min(70, maxRayY + 7);
  }

  // =========================================================================
  // PHYSICAL GLASS LENS DRAWING
  // =========================================================================
  drawLens(optics) {
    const { ctx, height } = this;
    const { isConvex } = { isConvex: state.lensType === 'convex' };
    const xCenter = state.originX;
    const yCenter = state.originY;
    const lensHalfHeightCm = this.getLensHalfHeightCm(optics);
    const h = lensHalfHeightCm * state.scale * state.zoom;

    ctx.save();

    // Center optical plane line (dashed) spanning the canvas
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xCenter, 0);
    ctx.lineTo(xCenter, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curvature thickness based on focal length and aperture
    const curvature = Math.max(14, Math.min(36, (h / (state.scale * state.zoom)) * (16 / state.focalLength) * 0.9));

    ctx.beginPath();
    if (isConvex) {
      // Biconvex Lens
      ctx.moveTo(xCenter, yCenter - h);
      ctx.quadraticCurveTo(xCenter + curvature, yCenter, xCenter, yCenter + h);
      ctx.quadraticCurveTo(xCenter - curvature, yCenter, xCenter, yCenter - h);
    } else {
      // Biconcave Lens
      const rimWidth = curvature * 0.9;
      const waist = Math.max(4, rimWidth * 0.25);
      ctx.moveTo(xCenter - rimWidth, yCenter - h);
      ctx.lineTo(xCenter + rimWidth, yCenter - h);
      ctx.quadraticCurveTo(xCenter + waist, yCenter, xCenter + rimWidth, yCenter + h);
      ctx.lineTo(xCenter - rimWidth, yCenter + h);
      ctx.quadraticCurveTo(xCenter - waist, yCenter, xCenter - rimWidth, yCenter - h);
    }
    ctx.closePath();

    // Glass realistic gradient
    const grad = ctx.createLinearGradient(xCenter - curvature, yCenter - h, xCenter + curvature, yCenter + h);
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.5)'); // light sky blue
    grad.addColorStop(0.3, 'rgba(224, 242, 254, 0.65)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)'); // glass specular sheen
    grad.addColorStop(0.7, 'rgba(186, 230, 253, 0.55)');
    grad.addColorStop(1, 'rgba(147, 197, 253, 0.6)');

    ctx.fillStyle = grad;
    ctx.fill();

    // Glass rim border
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lens Type Badge on top
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0284c7';
    ctx.fillText(isConvex ? 'CONVEX (Converging)' : 'CONCAVE (Diverging)', xCenter, Math.max(22, yCenter - h - 14));

    ctx.restore();
  }

  // =========================================================================
  // CARDINAL POINTS (O, F1, 2F1, F2, 2F2)
  // =========================================================================
  drawCardinalPoints(optics) {
    const { ctx } = this;
    const { cardinalPoints, absF } = optics;
    const y = state.originY;

    ctx.save();
    const points = [
      { key: 'O', x: 0, label: 'O', sub: 'Optical Center', color: '#2563eb', draggable: false },
      { key: 'focus1', x: -absF, label: 'F₁', sub: `-${absF}cm`, color: '#e11d48', draggable: true },
      { key: 'twoF1', x: -2 * absF, label: '2F₁', sub: `-${2 * absF}cm`, color: '#9333ea', draggable: false },
      { key: 'focus2', x: absF, label: 'F₂', sub: `+${absF}cm`, color: '#059669', draggable: true },
      { key: 'twoF2', x: 2 * absF, label: '2F₂', sub: `+${2 * absF}cm`, color: '#d97706', draggable: false }
    ];

    points.forEach(pt => {
      const scrX = this.toScreenX(pt.x);
      const isHovered = state.hoveredTarget === pt.key;

      // Outer focus drag halo if draggable
      if (pt.draggable) {
        ctx.beginPath();
        ctx.arc(scrX, y, isHovered ? 11 : 8, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? 'rgba(225, 29, 72, 0.2)' : 'rgba(59, 130, 246, 0.12)';
        ctx.fill();
      }

      // Point node
      ctx.beginPath();
      ctx.arc(scrX, y, pt.draggable ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label badge
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = pt.color;
      ctx.fillText(pt.label, scrX, y - 12);

      // Distance tag
      if (pt.sub && state.showLabels) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(pt.sub, scrX, y + 26);
      }
    });

    ctx.restore();
  }

  // =========================================================================
  // INTERACTIVE OBJECT (CANDLE OR ARROW)
  // =========================================================================
  drawObject(optics) {
    const { ctx } = this;
    const baseScreenX = this.toScreenX(optics.u);
    const baseScreenY = this.toScreenY(0);
    const tipScreenY = this.toScreenY(optics.ho);
    const isHovered = state.hoveredTarget === 'object' || state.hoveredTarget === 'objectTip';

    ctx.save();

    if (state.objectType === 'student') {
      this.drawStudent(baseScreenX, baseScreenY, tipScreenY, isHovered, optics.ho);
    } else if (state.objectType === 'candle') {
      this.drawCandle(baseScreenX, baseScreenY, tipScreenY, isHovered, optics.ho);
    } else {
      this.drawArrow(baseScreenX, baseScreenY, tipScreenY, isHovered, '#3b82f6', 'Object (AB)');
    }

    // Base coordinate indicator tag
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`u = ${optics.u.toFixed(1)} cm`, baseScreenX, baseScreenY + 22);

    ctx.restore();
  }

  drawStudent(x, baseY, tipY, isHovered, ho) {
    const { ctx } = this;
    const charHeight = Math.abs(baseY - tipY);
    const charWidth = charHeight * (324 / 768);
    // Fingertip is located at 35.185% of character width from the left
    const imgX = x - 0.35185 * charWidth;
    const imgY = tipY;

    ctx.save();
    if (isHovered) {
      ctx.shadowColor = 'rgba(59, 130, 246, 0.7)';
      ctx.shadowBlur = 14;
    }

    if (this.studentImgLoaded && this.studentImg.complete) {
      ctx.drawImage(this.studentImg, imgX, imgY, charWidth, charHeight);
    } else {
      this.drawArrow(x, baseY, tipY, isHovered, '#3b82f6', 'Student (AB)');
    }

    // Label
    ctx.shadowBlur = 0;
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isHovered ? '#2563eb' : '#1e293b';
    ctx.fillText('Student Object (AB)', x, tipY - 14);

    ctx.restore();
  }

  drawCandle(x, baseY, tipY, isHovered, ho) {
    const { ctx } = this;
    const candleWidth = Math.max(12, Math.min(22, ho * 0.7 * state.zoom));
    const wickHeight = 8;
    const flameHeight = Math.max(18, Math.min(32, ho * 1.2 * state.zoom));
    const bodyTopY = tipY + flameHeight + wickHeight;

    // Candle Body (Wax)
    const waxGrad = ctx.createLinearGradient(x - candleWidth / 2, baseY, x + candleWidth / 2, baseY);
    waxGrad.addColorStop(0, '#e2e8f0');
    waxGrad.addColorStop(0.4, '#ffffff');
    waxGrad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = waxGrad;
    ctx.strokeStyle = isHovered ? '#3b82f6' : '#94a3b8';
    ctx.lineWidth = isHovered ? 2 : 1.5;
    ctx.beginPath();
    ctx.roundRect(x - candleWidth / 2, bodyTopY, candleWidth, baseY - bodyTopY, [2, 2, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Candle Wick
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, bodyTopY);
    ctx.lineTo(x, bodyTopY - wickHeight);
    ctx.stroke();

    // Animated Flickering Flame
    const flicker = Math.sin(Date.now() * 0.008) * 1.5;
    const flameX = x + flicker * 0.5;
    const flameTipY = tipY;

    // Flame outer glow
    const glowGrad = ctx.createRadialGradient(flameX, tipY + flameHeight * 0.5, 2, flameX, tipY + flameHeight * 0.5, flameHeight * 1.2);
    glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(flameX, tipY + flameHeight * 0.5, flameHeight * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Flame core
    ctx.beginPath();
    ctx.moveTo(x, bodyTopY - wickHeight);
    ctx.bezierCurveTo(x + flameHeight * 0.45, bodyTopY - wickHeight - 4, flameX + 4, flameTipY + 4, flameX, flameTipY);
    ctx.bezierCurveTo(flameX - 4, flameTipY + 4, x - flameHeight * 0.45, bodyTopY - wickHeight - 4, x, bodyTopY - wickHeight);
    ctx.closePath();

    const flameGrad = ctx.createLinearGradient(flameX, bodyTopY - wickHeight, flameX, flameTipY);
    flameGrad.addColorStop(0, '#3b82f6'); // blue flame base
    flameGrad.addColorStop(0.3, '#f97316'); // vibrant orange
    flameGrad.addColorStop(0.7, '#fbbf24'); // warm yellow
    flameGrad.addColorStop(1, '#ffffff'); // bright tip

    ctx.fillStyle = flameGrad;
    ctx.fill();

    // Object label badge
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('Object (AB)', x, flameTipY - 12);
  }

  drawArrow(x, baseY, tipY, isHovered, color, label) {
    const { ctx } = this;
    const arrowWidth = 14;
    const headLen = 16;
    const dir = tipY < baseY ? -1 : 1; // -1 for upward, +1 for downward

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = isHovered ? 4 : 3;

    // Stem
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, tipY - dir * headLen * 0.5);
    ctx.stroke();

    // Arrow Head
    ctx.beginPath();
    ctx.moveTo(x, tipY);
    ctx.lineTo(x - arrowWidth / 2, tipY - dir * headLen);
    ctx.lineTo(x + arrowWidth / 2, tipY - dir * headLen);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(label, x, tipY + (dir === -1 ? -12 : 22));
  }

  // =========================================================================
  // FORMED IMAGE (REAL SOLID OR VIRTUAL GHOSTLY)
  // =========================================================================
  drawImage(optics) {
    const { ctx } = this;
    const { isAtInfinity, v, hi, isReal } = optics;

    if (isAtInfinity) {
      this.drawImageAtInfinity();
      return;
    }

    if (v === null || hi === null) return;

    const baseScreenX = this.toScreenX(v);
    const baseScreenY = this.toScreenY(0);
    const tipScreenY = this.toScreenY(hi);

    ctx.save();

    if (isReal) {
      // REAL IMAGE: Sharp, projected, inverted
      if (state.objectType === 'student') {
        this.drawInvertedStudent(baseScreenX, baseScreenY, tipScreenY, hi);
      } else if (state.objectType === 'candle') {
        this.drawInvertedCandle(baseScreenX, baseScreenY, tipScreenY, hi);
      } else {
        this.drawArrow(baseScreenX, baseScreenY, tipScreenY, false, '#ef4444', "Real Image (A'B')");
      }

      // Projection screen bracket behind image
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(baseScreenX + 16, Math.min(baseScreenY, tipScreenY) - 15);
      ctx.lineTo(baseScreenX + 16, Math.max(baseScreenY, tipScreenY) + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#dc2626';
      ctx.fillText(`v = +${v.toFixed(1)} cm`, baseScreenX, baseScreenY + 22);
    } else {
      // VIRTUAL IMAGE: Ghostly holographic translucent with dashed glow
      ctx.globalAlpha = 0.75;
      if (state.objectType === 'student') {
        this.drawVirtualStudent(baseScreenX, baseScreenY, tipScreenY, hi);
      } else if (state.objectType === 'candle') {
        this.drawVirtualCandle(baseScreenX, baseScreenY, tipScreenY, hi);
      } else {
        this.drawArrow(baseScreenX, baseScreenY, tipScreenY, false, '#8b5cf6', "Virtual Image (A'B')");
      }

      // Virtual holographic shimmer lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(baseScreenX, (baseScreenY + tipScreenY) / 2, Math.abs(tipScreenY - baseScreenY) * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#7c3aed';
      ctx.fillText(`v = ${v.toFixed(1)} cm (Virtual)`, baseScreenX, baseScreenY + 22);
    }

    ctx.restore();
  }

  drawInvertedCandle(x, baseY, tipY, hi) {
    const { ctx } = this;
    const absHi = Math.abs(hi);
    const candleWidth = Math.max(10, Math.min(20, absHi * 0.6 * state.zoom));
    const wickHeight = 6;
    const flameHeight = Math.max(14, Math.min(28, absHi * 0.8 * state.zoom));
    const dir = tipY > baseY ? 1 : -1; // inverted is usually downward (dir = +1)

    const bodyEnd = tipY - dir * (flameHeight + wickHeight);

    // Candle wax body
    const waxGrad = ctx.createLinearGradient(x - candleWidth / 2, baseY, x + candleWidth / 2, baseY);
    waxGrad.addColorStop(0, '#fecaca');
    waxGrad.addColorStop(0.5, '#fee2e2');
    waxGrad.addColorStop(1, '#fca5a5');

    ctx.fillStyle = waxGrad;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - candleWidth / 2, Math.min(baseY, bodyEnd), candleWidth, Math.abs(bodyEnd - baseY), 3);
    ctx.fill();
    ctx.stroke();

    // Wick
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, bodyEnd);
    ctx.lineTo(x, bodyEnd + dir * wickHeight);
    ctx.stroke();

    // Inverted flame
    const flameTipY = tipY;
    ctx.beginPath();
    ctx.moveTo(x, bodyEnd + dir * wickHeight);
    ctx.bezierCurveTo(x + flameHeight * 0.35, bodyEnd + dir * wickHeight + dir * 4, x + 3, flameTipY - dir * 4, x, flameTipY);
    ctx.bezierCurveTo(x - 3, flameTipY - dir * 4, x - flameHeight * 0.35, bodyEnd + dir * wickHeight + dir * 4, x, bodyEnd + dir * wickHeight);
    ctx.closePath();

    const flameGrad = ctx.createLinearGradient(x, bodyEnd, x, flameTipY);
    flameGrad.addColorStop(0, '#3b82f6');
    flameGrad.addColorStop(0.4, '#ef4444');
    flameGrad.addColorStop(0.8, '#f59e0b');
    flameGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = flameGrad;
    ctx.fill();

    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dc2626';
    ctx.fillText("Real Image (A'B')", x, tipY + dir * 16);
  }

  drawVirtualCandle(x, baseY, tipY, hi) {
    const { ctx } = this;
    const absHi = Math.abs(hi);
    const candleWidth = Math.max(12, Math.min(22, absHi * 0.6 * state.zoom));
    const flameHeight = Math.max(16, Math.min(30, absHi * 0.8 * state.zoom));
    const wickHeight = 6;
    const bodyTopY = tipY + flameHeight + wickHeight;

    ctx.strokeStyle = '#8b5cf6';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 2;
    ctx.strokeRect(x - candleWidth / 2, bodyTopY, candleWidth, baseY - bodyTopY);

    // Holographic flame glow
    ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, tipY + flameHeight / 2, flameHeight * 0.35, flameHeight * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7c3aed';
    ctx.fillText("Virtual Image (A'B')", x, tipY - 12);
  }

  drawInvertedStudent(x, baseY, tipY, hi) {
    const { ctx } = this;
    const charHeight = Math.abs(tipY - baseY);
    const charWidth = charHeight * (324 / 768);
    const dir = tipY > baseY ? 1 : -1;

    ctx.save();
    if (this.studentImgLoaded && this.studentImg.complete) {
      // Invert vertically: feet anchor on principal axis baseY, finger points down to tipY
      ctx.translate(x, baseY);
      ctx.scale(1, -1);
      ctx.drawImage(this.studentImg, -0.35185 * charWidth, 0, charWidth, charHeight);
    } else {
      this.drawArrow(x, baseY, tipY, false, '#ef4444', "Real Image (A'B')");
    }
    ctx.restore();

    ctx.save();
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dc2626';
    ctx.fillText("Real Image (A'B') [Inverted]", x, tipY + dir * 16);
    ctx.restore();
  }

  drawVirtualStudent(x, baseY, tipY, hi) {
    const { ctx } = this;
    const charHeight = Math.abs(baseY - tipY);
    const charWidth = charHeight * (324 / 768);
    const imgX = x - 0.35185 * charWidth;
    const imgY = tipY;

    ctx.save();
    ctx.globalAlpha = 0.75;
    if (this.studentImgLoaded && this.studentImg.complete) {
      ctx.shadowColor = 'rgba(139, 92, 246, 0.7)';
      ctx.shadowBlur = 12;
      ctx.drawImage(this.studentImg, imgX, imgY, charWidth, charHeight);
    } else {
      this.drawArrow(x, baseY, tipY, false, '#8b5cf6', "Virtual Image (A'B')");
    }
    ctx.restore();

    ctx.save();
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7c3aed';
    ctx.fillText("Virtual Image (A'B') [Upright]", x, tipY - 14);
    ctx.restore();
  }

  drawImageAtInfinity() {
    const { ctx, width } = this;
    const y = state.originY;

    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('⚡ Emergent Rays Parallel -> Image Formed at Infinity (∞)', width - 25, y - 40);
    ctx.restore();
  }

  // =========================================================================
  // 3 PRINCIPAL RAYS WITH ARROWS & PHOTON PULSES
  // =========================================================================
  drawRays(optics) {
    const { ctx } = this;
    const { rays } = optics;

    rays.forEach(ray => {
      // Check toggles
      if (ray.id === 1 && !state.showRay1) return;
      if (ray.id === 2 && !state.showRay2) return;
      if (ray.id === 3 && !state.showRay3) return;

      ctx.save();

      // Special case: Ray 3 when object is at focus (u = -f)
      if (ray.id === 3 && ray.isVerticalAtFocus) {
        if (ray.focalGuide && ray.focalGuide.length >= 2) {
          this.drawRaySegment(ray.focalGuide[0], ray.focalGuide[1], ray.color, true);
        }
        ctx.restore();
        return;
      }

      // 1. Incident ray segments
      if (ray.incidentSegments && ray.incidentSegments.length > 0) {
        ray.incidentSegments.forEach(seg => {
          this.drawRaySegment(seg[0], seg[1], ray.color, false);
        });
      } else if (ray.incident && ray.incident.length >= 2) {
        this.drawRaySegment(ray.incident[0], ray.incident[1], ray.color, false);
      }

      // 2. Focal Guide (dashed alignment line, e.g. from F1 to tip for magnifying glass)
      if (ray.focalGuide && ray.focalGuide.length >= 2) {
        this.drawRaySegment(ray.focalGuide[0], ray.focalGuide[1], ray.color, true);
      }

      // 3. Refracted ray segments
      if (ray.refractedSegments && ray.refractedSegments.length > 0) {
        ray.refractedSegments.forEach(seg => {
          this.drawRaySegment(seg[0], seg[1], ray.color, false);
        });
      } else if (ray.refracted && ray.refracted.length >= 2) {
        this.drawRaySegment(ray.refracted[0], ray.refracted[1], ray.color, false);
      }

      // 4. Virtual ray back-extension (dashed)
      if (state.showVirtualRays && ray.virtual && ray.virtual.length >= 2) {
        this.drawRaySegment(ray.virtual[0], ray.virtual[1], ray.color, true);
      }

      // 5. Concave Ray 3 target extension to far focus
      if (state.showVirtualRays && ray.incidentTargetVirt && ray.incidentTargetVirt.length >= 2) {
        this.drawRaySegment(ray.incidentTargetVirt[0], ray.incidentTargetVirt[1], ray.color, true);
      }

      ctx.restore();
    });
  }

  drawRaySegment(ptA, ptB, color, isDashed = false) {
    const { ctx } = this;
    const p1 = { x: this.toScreenX(ptA.x), y: this.toScreenY(ptA.y) };
    const p2 = { x: this.toScreenX(ptB.x), y: this.toScreenY(ptB.y) };

    const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (segLen < 1) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = isDashed ? 1.8 : 2.2;

    if (isDashed) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = color + 'cc';
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Direction arrow in middle of segment (for real rays)
    if (!isDashed && segLen >= 20) {
      this.drawRayArrow(p1, p2, color);

      // Flowing photon pulse if animation is active
      if (state.animateRays) {
        const pulseT = (this.pulsePhase + (p1.x % 100) / 100) % 1;
        const pulseX = p1.x + (p2.x - p1.x) * pulseT;
        const pulseY = p1.y + (p2.y - p1.y) * pulseT;

        // Glowing photon packet
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  drawRayArrow(p1, p2, color) {
    const { ctx } = this;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const arrowSize = 8.5;

    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(arrowSize, 0);
    ctx.lineTo(-arrowSize * 0.65, -arrowSize * 0.65);
    ctx.lineTo(-arrowSize * 0.3, 0);
    ctx.lineTo(-arrowSize * 0.65, arrowSize * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // LIGHT CONE / BEAM BUNDLE
  // =========================================================================
  drawLightCone(optics) {
    const { ctx } = this;
    const tip = { x: this.toScreenX(optics.u), y: this.toScreenY(optics.ho) };
    const lensHalfHeightCm = this.getLensHalfHeightCm(optics);
    const h = lensHalfHeightCm * state.scale * state.zoom;
    const lensTop = { x: state.originX, y: state.originY - h };
    const lensBottom = { x: state.originX, y: state.originY + h };

    ctx.save();
    // Incident cone from tip covering whole lens aperture
    const grad1 = ctx.createLinearGradient(tip.x, tip.y, state.originX, state.originY);
    grad1.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    grad1.addColorStop(1, 'rgba(251, 191, 36, 0.1)');

    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(lensTop.x, lensTop.y);
    ctx.lineTo(lensBottom.x, lensBottom.y);
    ctx.closePath();
    ctx.fill();

    // Refracted cone
    if (optics.v !== null && optics.isReal) {
      const imgTip = { x: this.toScreenX(optics.v), y: this.toScreenY(optics.hi) };
      const grad2 = ctx.createLinearGradient(state.originX, state.originY, imgTip.x, imgTip.y);
      grad2.addColorStop(0, 'rgba(239, 68, 68, 0.12)');
      grad2.addColorStop(1, 'rgba(239, 68, 68, 0.38)');

      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.moveTo(lensTop.x, lensTop.y);
      ctx.lineTo(imgTip.x, imgTip.y);
      ctx.lineTo(lensBottom.x, lensBottom.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // INTERACTIVE HANDLES & DRAG FEEDBACK
  // =========================================================================
  drawInteractiveHandles(optics) {
    const { ctx } = this;
    const objTipX = this.toScreenX(optics.u);
    const objTipY = this.toScreenY(optics.ho);

    // Tip resize ring
    ctx.save();
    ctx.strokeStyle = state.hoveredTarget === 'objectTip' ? '#2563eb' : 'rgba(37, 99, 235, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(objTipX, objTipY, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // MOUSE & TOUCH EVENT BINDING
  // =========================================================================
  bindEvents() {
    const { canvas } = this;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const findTarget = (screenX, screenY) => {
      const optics = calculateOptics(state);
      const threshold = 18;

      // 1. Check Object Tip
      const tipX = this.toScreenX(optics.u);
      const tipY = this.toScreenY(optics.ho);
      if (Math.hypot(screenX - tipX, screenY - tipY) < threshold) {
        return 'objectTip';
      }

      // 2. Check Object Body / Base
      const baseX = this.toScreenX(optics.u);
      const baseY = this.toScreenY(0);
      const bodyRadius = state.objectType === 'student' ? 32 : 22;
      if (Math.abs(screenX - baseX) < bodyRadius && screenY >= Math.min(tipY, baseY) - 10 && screenY <= Math.max(tipY, baseY) + 15) {
        return 'object';
      }

      // 3. Check Focus F1
      const f1X = this.toScreenX(-optics.absF);
      const axisY = state.originY;
      if (Math.hypot(screenX - f1X, screenY - axisY) < threshold) {
        return 'focus1';
      }

      // 4. Check Focus F2
      const f2X = this.toScreenX(optics.absF);
      if (Math.hypot(screenX - f2X, screenY - axisY) < threshold) {
        return 'focus2';
      }

      return null;
    };

    canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      const target = findTarget(pos.x, pos.y);

      if (target) {
        this.dragType = target;
        state.isDragging = target;
        this.dragStart = pos;
        this.initialState = {
          u: state.objectDistance,
          ho: state.objectHeight,
          f: state.focalLength
        };
      } else {
        // Pan canvas
        this.dragType = 'bench';
        this.dragStart = pos;
        this.initialState = { panX: state.panOffset.x, panY: state.panOffset.y };
      }
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      if (!this.dragType) {
        // Hover state detection
        const target = findTarget(pos.x, pos.y);
        state.hoveredTarget = target;
        if (target === 'objectTip') canvas.style.cursor = 'ns-resize';
        else if (target === 'object') canvas.style.cursor = 'ew-resize';
        else if (target === 'focus1' || target === 'focus2') canvas.style.cursor = 'ew-resize';
        else canvas.style.cursor = 'default';
        return;
      }

      // Dragging active
      if (this.dragType === 'object') {
        const newCmX = this.toCartesianX(pos.x);
        // Constrain u to be strictly in front of the lens (-120 cm to -2 cm)
        const clampedU = Math.min(-3, Math.max(-110, newCmX));
        setState({ objectDistance: Math.round(clampedU * 10) / 10 });
        canvas.style.cursor = 'grabbing';
      } else if (this.dragType === 'objectTip') {
        const newCmY = this.toCartesianY(pos.y);
        // Constrain ho between 5 cm and 30 cm
        const clampedHo = Math.max(5, Math.min(28, newCmY));
        setState({ objectHeight: Math.round(clampedHo * 10) / 10 });
        canvas.style.cursor = 'ns-resize';
      } else if (this.dragType === 'focus1' || this.dragType === 'focus2') {
        const newCmX = Math.abs(this.toCartesianX(pos.x));
        const clampedF = Math.max(8, Math.min(50, newCmX));
        setState({ focalLength: Math.round(clampedF * 10) / 10 });
        canvas.style.cursor = 'ew-resize';
      } else if (this.dragType === 'bench') {
        if (state.autoFit) {
          setState({ autoFit: false });
        }
        const dx = pos.x - this.dragStart.x;
        const dy = pos.y - this.dragStart.y;
        state.panOffset.x = this.initialState.panX + dx;
        state.panOffset.y = this.initialState.panY + dy;
        canvas.style.cursor = 'grab';
      }
    });

    window.addEventListener('mouseup', () => {
      this.dragType = null;
      state.isDragging = null;
      canvas.style.cursor = 'default';
    });

    // Touch support for tablets/mobile
    canvas.addEventListener('touchstart', (e) => {
      const pos = getPos(e);
      const target = findTarget(pos.x, pos.y);
      if (target) {
        this.dragType = target;
        state.isDragging = target;
        this.dragStart = pos;
        this.initialState = {
          u: state.objectDistance,
          ho: state.objectHeight,
          f: state.focalLength
        };
        e.preventDefault();
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (!this.dragType) return;
      const pos = getPos(e);
      if (this.dragType === 'object') {
        const newCmX = this.toCartesianX(pos.x);
        const clampedU = Math.min(-3, Math.max(-110, newCmX));
        setState({ objectDistance: Math.round(clampedU * 10) / 10 });
      } else if (this.dragType === 'objectTip') {
        const newCmY = this.toCartesianY(pos.y);
        const clampedHo = Math.max(5, Math.min(28, newCmY));
        setState({ objectHeight: Math.round(clampedHo * 10) / 10 });
      } else if (this.dragType === 'focus1' || this.dragType === 'focus2') {
        const newCmX = Math.abs(this.toCartesianX(pos.x));
        const clampedF = Math.max(8, Math.min(50, newCmX));
        setState({ focalLength: Math.round(clampedF * 10) / 10 });
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      this.dragType = null;
      state.isDragging = null;
    });

    // Mouse wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (state.autoFit) {
        setState({ autoFit: false });
      }
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.max(0.5, Math.min(2.5, state.zoom * zoomFactor));
      state.zoom = newZoom;
    }, { passive: false });
  }
}
