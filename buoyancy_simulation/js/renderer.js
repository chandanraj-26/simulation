/**
 * CanvasRenderer - High-DPI 2D Canvas Renderer for Buoyancy Lab
 * Complies with the Soft Light-Blue Study Law: #E6F2FF canvas background.
 */

export class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 450;

    this.animTime = 0;
    this.isDragging = false;
    this.dragStartY = 0;
    this.initialModelY = 0;

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 450;

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
      const tankCenterX = this.width * 0.42;
      const waterSurfaceY = this.height * 0.46;
      const pxPerMeter = 240;

      const blockCenterY = waterSurfaceY + this.model.y * pxPerMeter;
      const blockW = 70 + (this.model.volume - 1.0) * 15;
      const blockH = 70 + (this.model.volume - 1.0) * 15;

      if (Math.abs(p.x - tankCenterX) < blockW / 2 + 10 && Math.abs(p.y - blockCenterY) < blockH / 2 + 10) {
        this.isDragging = true;
        this.model.isGrabbed = true;
        this.dragStartY = p.y;
        this.initialModelY = this.model.y;
      }
    };

    const onDrag = (e) => {
      if (!this.isDragging) return;
      const p = getPos(e);
      const pxPerMeter = 240;
      const deltaY = (p.y - this.dragStartY) / pxPerMeter;
      this.model.y = Math.max(-0.35, Math.min(0.45, this.initialModelY + deltaY));
      this.model.vy = 0;
      this.render();
    };

    const stopDrag = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.model.isGrabbed = false;
      }
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
    this.animTime += 0.04;

    // Study Environment Soft Light-Blue Background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawGrid();

    const tankX = width * 0.22;
    const tankW = 320;
    const tankH = 280;
    const tankBottomY = height * 0.88;
    const tankTopY = tankBottomY - tankH;
    const waterSurfaceY = height * 0.46;

    const telemetry = this.model.getTelemetry();

    // 1. Draw Overflow Spout & Secondary Catch Cylinder
    this.drawOverflowCylinder(tankX + tankW, waterSurfaceY, height * 0.88, telemetry.V_displaced);

    // 2. Draw Fluid in Tank
    this.drawTankFluid(tankX, waterSurfaceY, tankW, tankBottomY);

    // 3. Draw Suspended/Floating Material Block
    this.drawBlock(tankX + tankW / 2, waterSurfaceY, telemetry);

    // 4. Draw Glass Tank Walls
    this.drawTankGlass(tankX, tankTopY, tankW, tankH, tankBottomY, waterSurfaceY);

    // 5. Draw Digital Floor Sensor Scale (Normal force when sunk)
    this.drawFloorScale(tankX + 40, tankBottomY, tankW - 80, telemetry);
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

  drawTankFluid(x, waterY, w, bottomY) {
    const { ctx } = this;
    const liq = this.model.liquid;
    ctx.save();

    // Fluid Body
    ctx.fillStyle = liq.color;
    ctx.beginPath();
    ctx.moveTo(x + 4, bottomY - 4);
    ctx.lineTo(x + 4, waterY);

    // Subtle sinusoidal liquid surface
    for (let wx = x + 4; wx <= x + w - 4; wx += 10) {
      const wy = waterY + Math.sin(wx * 0.05 + this.animTime * 2.5) * 1.5;
      ctx.lineTo(wx, wy);
    }

    ctx.lineTo(x + w - 4, bottomY - 4);
    ctx.closePath();
    ctx.fill();

    // Meniscus Highlight
    ctx.strokeStyle = liq.surfaceColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, waterY);
    ctx.lineTo(x + w - 4, waterY);
    ctx.stroke();

    ctx.restore();
  }

  drawTankGlass(x, topY, w, h, bottomY, waterY) {
    const { ctx } = this;
    ctx.save();

    // Overflow spout channel opening
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineTo(x + w, bottomY);
    ctx.lineTo(x + w, waterY + 16);
    // Spout nozzle protruding to the right
    ctx.lineTo(x + w + 35, waterY + 28);
    ctx.moveTo(x + w, waterY - 8);
    ctx.lineTo(x + w + 35, waterY + 4);
    ctx.lineTo(x + w, topY);
    ctx.stroke();

    // Graduation Tick Marks
    ctx.fillStyle = '#64748b';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let i = 1; i <= 8; i++) {
      const gy = bottomY - i * 28;
      ctx.beginPath();
      ctx.moveTo(x + 14, gy);
      ctx.lineTo(x, gy);
      ctx.stroke();
      ctx.fillText(`${i * 0.5} L`, x + 38, gy + 3);
    }

    ctx.restore();
  }

  drawOverflowCylinder(spoutX, waterY, groundY, V_displaced) {
    const { ctx } = this;
    ctx.save();

    const cylX = spoutX + 45;
    const cylW = 55;
    const cylH = 150;
    const cylBottomY = groundY;
    const cylTopY = cylBottomY - cylH;

    // Displaced Fluid Fill
    const fillH = Math.min(cylH - 15, (V_displaced / 3.0) * (cylH - 20));
    if (fillH > 0) {
      ctx.fillStyle = this.model.liquid.color;
      ctx.fillRect(cylX + 2, cylBottomY - fillH, cylW - 4, fillH);
    }

    // Glass Graduated Cylinder
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(cylX, cylTopY, cylW, cylH);

    // Cylinder ticks
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';

    for (let v = 0.5; v <= 3.0; v += 0.5) {
      const vy = cylBottomY - (v / 3.0) * (cylH - 20);
      ctx.beginPath();
      ctx.moveTo(cylX + cylW - 10, vy);
      ctx.lineTo(cylX + cylW, vy);
      ctx.stroke();
      ctx.fillText(`${v.toFixed(1)}L`, cylX + cylW + 4, vy + 3);
    }

    // Label tag
    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.textAlign = 'center';
    ctx.fillText('DISPLACED FLUID', cylX + cylW / 2, cylTopY - 10);
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(`${V_displaced} L`, cylX + cylW / 2, cylTopY + 16);

    ctx.restore();
  }

  drawBlock(cx, waterSurfaceY, telemetry) {
    const { ctx } = this;
    const mat = this.model.material;
    ctx.save();

    const pxPerMeter = 240;
    const blockCenterY = waterSurfaceY + this.model.y * pxPerMeter;

    const blockW = 60 + (this.model.volume - 1.0) * 14;
    const blockH = 60 + (this.model.volume - 1.0) * 14;

    const bx = cx - blockW / 2;
    const by = blockCenterY - blockH / 2;

    // Block Shadow / Fill
    ctx.fillStyle = mat.color;
    ctx.beginPath();
    ctx.roundRect(bx, by, blockW, blockH, 6);
    ctx.fill();
    ctx.strokeStyle = mat.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Material Title & Density Tag
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mat.name, cx, blockCenterY - 6);

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText(`m = ${telemetry.mass} kg`, cx, blockCenterY + 8);
    ctx.fillText(`ρ = ${telemetry.densityObj} kg/L`, cx, blockCenterY + 20);

    // Force Vectors Overlay
    if (this.model.showVectors) {
      this.drawVectorArrows(cx, blockCenterY, telemetry);
    }

    ctx.restore();
  }

  drawVectorArrows(cx, cy, telemetry) {
    const { ctx } = this;
    ctx.save();

    const drawArrow = (x, y, length, color, label) => {
      if (Math.abs(length) < 2) return;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      const targetY = y + length;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, targetY);
      ctx.stroke();

      // Arrowhead
      const dir = length > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x, targetY);
      ctx.lineTo(x - 5, targetY - dir * 8);
      ctx.lineTo(x + 5, targetY - dir * 8);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 8, targetY);
    };

    // Gravity Force Vector (Downward, Red)
    const fgScale = Math.min(80, telemetry.gravityForce * 2.5);
    drawArrow(cx - 15, cy, fgScale, '#ef4444', `Fg: ${telemetry.gravityForce} N`);

    // Buoyant Force Vector (Upward, Emerald Green)
    const fbScale = Math.min(80, telemetry.buoyantForce * 2.5);
    drawArrow(cx + 15, cy, -fbScale, '#10b981', `Fb: ${telemetry.buoyantForce} N`);

    ctx.restore();
  }

  drawFloorScale(x, bottomY, w, telemetry) {
    const { ctx } = this;
    ctx.save();

    // Scale Platter
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, bottomY - 14, w, 12);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, bottomY - 14, w, 12);

    // Center Display
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - 50, bottomY - 12, 100, 18, 4);
    ctx.fill();

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = telemetry.isSinking ? '#f87171' : '#4ade80';
    ctx.textAlign = 'center';
    ctx.fillText(`Scale: ${telemetry.apparentWeight} N`, x + w / 2, bottomY);

    ctx.restore();
  }
}
