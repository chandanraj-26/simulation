/**
 * DiamondCutSim — Canvas 2D Precision Optical Renderer
 * Visualizes faceted diamond crystals, Snell's law refraction,
 * Cauchy chromatic dispersion fan, Total Internal Reflection (TIR),
 * critical angle cones, normal vectors, and emergent rainbow fire.
 */

class DiamondRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    // Viewport & Pan
    this.view = {
      zoom: 1.0,
      panX: 0,
      panY: 0
    };

    // Animation / Photon Pulses
    this.photonOffset = 0;

    // Hit-testing / Dragging state
    this.hoverFacet = -1;
    this.isDraggingEmitter = false;
    this.isDraggingDiamond = false;
    this.lastMouse = { x: 0, y: 0 };

    this.initCanvas();
    this.setupInteractivity();
  }

  initCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 620;

    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.width = w;
    this.height = h;
  }

  setupInteractivity() {
    const canvas = this.canvas;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      const emitterPos = this.getEmitterPosition();
      const distToEmitter = Math.hypot(pos.x - emitterPos.x, pos.y - emitterPos.y);

      if (distToEmitter < 35) {
        this.isDraggingEmitter = true;
        canvas.style.cursor = 'grabbing';
      } else {
        this.isDraggingDiamond = true;
        this.lastMouse = pos;
        canvas.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      const pos = getPos(e);

      if (this.isDraggingEmitter) {
        // Calculate new incident angle or source X
        const state = window.simState;
        const gemCenter = this.getGemCenter();
        const dx = pos.x - gemCenter.x;
        const dy = (gemCenter.y - 100 * this.view.zoom) - pos.y;

        // Calculate angle relative to vertical normal (straight down)
        let angleDeg = Math.atan2(dx, dy) * 180 / Math.PI;
        angleDeg = Math.max(-35, Math.min(35, angleDeg));
        state.incidentAngleDeg = Math.round(angleDeg * 10) / 10;

        if (window.diamondUI) {
          window.diamondUI.syncControlsFromState();
        }
      } else if (this.isDraggingDiamond) {
        const dx = pos.x - this.lastMouse.x;
        const dy = pos.y - this.lastMouse.y;
        this.view.panX += dx;
        this.view.panY += dy;
        this.lastMouse = pos;
      } else {
        const emitterPos = this.getEmitterPosition();
        const distToEmitter = Math.hypot(pos.x - emitterPos.x, pos.y - emitterPos.y);
        if (distToEmitter < 35) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDraggingEmitter || this.isDraggingDiamond) {
        this.isDraggingEmitter = false;
        this.isDraggingDiamond = false;
        canvas.style.cursor = 'default';
      }
    });

    // Zoom on wheel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.view.zoom = Math.max(0.5, Math.min(2.5, this.view.zoom * zoomFactor));
      if (window.diamondUI) {
        window.diamondUI.updateZoomDisplay();
      }
    }, { passive: false });
  }

  getGemCenter() {
    const cx = this.width / 2 + this.view.panX;
    const cy = this.height / 2 + 15 + this.view.panY;
    return { x: cx, y: cy };
  }

  getEmitterPosition(gemGeom) {
    const center = this.getGemCenter();
    const state = window.simState;
    const angleRad = (state.incidentAngleDeg || 0) * Math.PI / 180;
    const rayDir = Optics.vec.norm({
      x: Math.sin(angleRad),
      y: Math.cos(angleRad)
    });
    const rayLen = 200 * this.view.zoom;

    let targetX, targetY;
    if (gemGeom && gemGeom.vertices && gemGeom.vertices.length >= 2) {
      const tableLeft = gemGeom.vertices[0];
      const tableRight = gemGeom.vertices[1];
      targetX = tableLeft.x + (tableRight.x - tableLeft.x) * state.lightSourceX;
      targetY = tableLeft.y;
    } else {
      const diamondWidth = state.diamondWidth * this.view.zoom;
      const tableRatio = (state.cutParams && state.cutParams.tableRatio) || 0.57;
      const tableHalfW = (diamondWidth / 2) * tableRatio;
      const crownAngle = ((state.cutParams && state.cutParams.crownAngleDeg) || 34.5) * Math.PI / 180;
      const crownH = (diamondWidth / 2 - tableHalfW) * Math.tan(crownAngle);
      targetX = center.x + (state.lightSourceX - 0.5) * (tableHalfW * 2);
      targetY = center.y - 4 - crownH;
    }

    return {
      x: targetX - rayDir.x * rayLen,
      y: targetY - rayDir.y * rayLen
    };
  }

  /**
   * Main render loop called every frame
   */
  render() {
    const ctx = this.ctx;
    const state = window.simState;

    // Photon pulse animation clock
    if (!state.isPaused) {
      this.photonOffset = (this.photonOffset + 1.8 * state.simSpeed) % 40;
    }

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // 1. Dark obsidian background
    this.drawBackground();

    // 2. Optical Grid
    if (state.showGrid) {
      this.drawOpticalGrid();
    }

    // 3. Obtain Diamond Geometry based on cut type and parameters
    const center = this.getGemCenter();
    const diamondWidth = state.diamondWidth * this.view.zoom;

    let gemGeom;
    if (state.cutType === 'princess') {
      gemGeom = Optics.getPrincessCutGeometry(center.x, center.y, diamondWidth, state.cutParams);
    } else if (state.cutType === 'emerald') {
      gemGeom = Optics.getEmeraldCutGeometry(center.x, center.y, diamondWidth, state.cutParams);
    } else {
      gemGeom = Optics.getBrilliantCutGeometry(center.x, center.y, diamondWidth, state.cutParams);
    }

    // 4. Trace light rays
    const traces = this.traceRays(gemGeom);
    state.traces = traces;

    // Update telemetry from traces
    this.updateTelemetry(traces, gemGeom);

    // 5. Draw Diamond Crystalline Body & Glow
    this.drawDiamondBody(gemGeom);

    // 6. Draw Facet Normals & Labels if enabled
    if (state.showNormals) {
      this.drawFacetNormals(gemGeom);
    }
    if (state.showFacetLabels) {
      this.drawFacetLabels(gemGeom);
    }

    // 7. Draw Critical Angle Cones at internal bounce points
    if (state.showCriticalCone) {
      this.drawCriticalCones(traces);
    }

    // 8. Draw Traced Light Rays (Incident, Internal TIR, Emergent Fire)
    if (state.showRays) {
      this.drawRays(traces);
    }

    // 9. Draw Emergent Fire Rainbow Arc / Screen
    if (state.showFireRainbow && state.lightType === 'white') {
      this.drawSpectralProjection(traces, gemGeom);
    }

    // 10. Draw Light Source / Torch
    this.drawLightSource(gemGeom);

    // 11. Draw Angle Protractors & Annotations
    if (state.showAngles) {
      this.drawAngleAnnotations(traces, gemGeom);
    }

    ctx.restore();
  }

  /**
   * Draw high-contrast laboratory background
   */
  drawBackground() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Luxury deep gradient background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, '#0c1322');
    bgGrad.addColorStop(0.5, '#070b14');
    bgGrad.addColorStop(1, '#030509');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Subtle laboratory coordinate grid
   */
  drawOpticalGrid() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const step = 40 * this.view.zoom;
    const offsetX = (this.width / 2 + this.view.panX) % step;
    const offsetY = (this.height / 2 + this.view.panY) % step;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
    ctx.lineWidth = 1;

    for (let x = offsetX; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let y = offsetY; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center optical axis dashed line
    const cx = this.width / 2 + this.view.panX;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  /**
   * Draw the faceted diamond polygon with crystal shading and facet lines
   */
  drawDiamondBody(geom) {
    const ctx = this.ctx;
    const verts = geom.vertices;
    if (!verts || verts.length < 3) return;

    ctx.save();

    // 1. Outer Diamond Path
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();

    // Crystal body gradient fill (cyan to violet sapphire glow)
    const gemGrad = ctx.createLinearGradient(geom.cx - geom.halfWidth, geom.cy - geom.crownHeight,
                                             geom.cx + geom.halfWidth, geom.cy + geom.pavilionDepth);
    gemGrad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    gemGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.06)');
    gemGrad.addColorStop(0.8, 'rgba(0, 240, 255, 0.10)');
    gemGrad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');

    ctx.fillStyle = gemGrad;
    ctx.fill();

    // Internal facet reflection lines (give 3D gemstone brilliance look)
    this.drawInternalFacetLines(geom);

    // Glowing border outline
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Highlight table facet (the flat top where light enters)
    ctx.shadowBlur = 0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    ctx.lineTo(verts[1].x, verts[1].y);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw internal facet lines that give realistic 2D brilliant gem appearance
   */
  drawInternalFacetLines(geom) {
    const ctx = this.ctx;
    const v = geom.vertices;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;

    if (v.length >= 8) {
      ctx.beginPath();
      // Table left to girdle top left
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[7].x, v[7].y);
      // Table right to girdle top right
      ctx.moveTo(v[1].x, v[1].y);
      ctx.lineTo(v[2].x, v[2].y);
      // Girdle top line
      ctx.moveTo(v[7].x, v[7].y);
      ctx.lineTo(v[2].x, v[2].y);
      // Girdle bottom line
      ctx.moveTo(v[6].x, v[6].y);
      ctx.lineTo(v[3].x, v[3].y);
      // Pavilion diagonals to culet
      ctx.moveTo(v[6].x, v[6].y);
      ctx.lineTo(v[5].x, v[5].y);
      ctx.moveTo(v[3].x, v[3].y);
      ctx.lineTo(v[4].x, v[4].y);
      // Star facet lines: table corners down to culet
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[5].x, v[5].y);
      ctx.moveTo(v[1].x, v[1].y);
      ctx.lineTo(v[4].x, v[4].y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw facet normals (dashed vectors perpendicular to each facet)
   */
  drawFacetNormals(geom) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
    ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);

    geom.facets.forEach((f) => {
      const mid = { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 };
      const len = 32 * this.view.zoom;
      const end = { x: mid.x + f.normal.x * len, y: mid.y + f.normal.y * len };

      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Small normal arrow head
      ctx.beginPath();
      ctx.arc(end.x, end.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draw facet names (Table, Crown, Girdle, Pavilion, Culet)
   */
  drawFacetLabels(geom) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.textAlign = 'center';

    geom.facets.forEach((f) => {
      const mid = { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 };
      const offset = 18 * this.view.zoom;
      const labelX = mid.x + f.normal.x * offset;
      const labelY = mid.y + f.normal.y * offset;

      ctx.fillText(f.name, labelX, labelY);
    });

    ctx.restore();
  }

  /**
   * Trace incident light rays through diamond crystal
   */
  traceRays(gemGeom) {
    const state = window.simState;
    const material = state.getMaterial();
    const baseN = material.n;
    const cauchyB = material.cauchyB;
    const nAir = 1.0;
    const maxBounces = state.maxBounces || 12;

    const traces = [];

    // Ray origin and direction
    const angleRad = (state.incidentAngleDeg || 0) * Math.PI / 180;
    // Incident ray points downwards into diamond at angle
    const rayDir = Optics.vec.norm({
      x: Math.sin(angleRad),
      y: Math.cos(angleRad)
    });

    // Table span where ray lands
    const tableLeft = gemGeom.vertices[0];
    const tableRight = gemGeom.vertices[1];

    // Helper to generate ray origin from normalized position
    const getOriginForX = (normX) => {
      const targetX = tableLeft.x + (tableRight.x - tableLeft.x) * normX;
      const targetY = tableLeft.y;
      const rayLen = 200 * this.view.zoom;
      return {
        x: targetX - rayDir.x * rayLen,
        y: targetY - rayDir.y * rayLen
      };
    };

    const rayOffsets = state.beamMode === 'multi'
      ? [0.22, 0.36, 0.50, 0.64, 0.78]
      : [state.lightSourceX];

    rayOffsets.forEach(normX => {
      const rayOrigin = getOriginForX(normX);

      if (state.lightType === 'white') {
        // Trace 7 spectral wavelengths (VIBGYOR)
        Optics.spectralBands.forEach(band => {
          const nGem = Optics.getRefractiveIndex(baseN, cauchyB * state.dispersionScale, band.wl);
          const result = Optics.traceRayThroughGem(rayOrigin, rayDir, gemGeom.facets, nGem, nAir, maxBounces);
          traces.push({
            band,
            wl: band.wl,
            color: band.color,
            nGem,
            ...result
          });
        });
      } else {
        // Tunable monochromatic laser
        const wl = state.laserWavelength || 589;
        const color = Optics.wavelengthToCSS(wl);
        const nGem = Optics.getRefractiveIndex(baseN, cauchyB, wl);
        const result = Optics.traceRayThroughGem(rayOrigin, rayDir, gemGeom.facets, nGem, nAir, maxBounces);
        traces.push({
          band: { name: `${wl} nm`, wl, color },
          wl,
          color,
          nGem,
          ...result
        });
      }
    });

    return traces;
  }

  /**
   * Render traced rays with glowing lines, TIR bounce stars, and emergent fire
   */
  drawRays(traces) {
    const ctx = this.ctx;
    const state = window.simState;

    traces.forEach(trace => {
      const color = trace.color;
      const segs = trace.segments;

      segs.forEach(seg => {
        ctx.save();

        if (seg.type === 'incident') {
          // Incident beam: white or laser color
          ctx.strokeStyle = state.lightType === 'white' ? 'rgba(255, 255, 255, 0.75)' : color;
          ctx.lineWidth = state.lightType === 'white' ? 2.5 : 2.8;
          ctx.shadowColor = state.lightType === 'white' ? 'rgba(255, 255, 255, 0.8)' : color;
          ctx.shadowBlur = 8;
        } else if (seg.type === 'internal') {
          // Internal refracted & TIR bouncing rays
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.0;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
        } else if (seg.type === 'emergent') {
          // Emergent fire ray escaping the gem
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.4;
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
        }

        ctx.beginPath();
        ctx.moveTo(seg.start.x, seg.start.y);
        ctx.lineTo(seg.end.x, seg.end.y);
        ctx.stroke();

        // Animated photon pulses along ray paths
        if (state.showPhotons && !state.isPaused) {
          this.drawPhotonPulses(seg, color);
        }

        ctx.restore();
      });

      // Draw sparkle pings at TIR bounce vertices
      trace.bouncePoints.forEach(pt => {
        const p = pt.point || pt;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });
  }

  /**
   * Draw moving photon pulses along light paths
   */
  drawPhotonPulses(seg, color) {
    const ctx = this.ctx;
    const v = Optics.vec;
    const dir = v.sub(seg.end, seg.start);
    const len = v.mag(dir);
    if (len < 5) return;

    const uDir = v.norm(dir);
    const spacing = 35;
    const offset = this.photonOffset % spacing;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

    for (let d = offset; d < len; d += spacing) {
      const p = v.add(seg.start, v.mul(uDir, d));
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw critical angle escape cone at internal reflection points,
   * centered precisely on the facet's surface normal.
   */
  drawCriticalCones(traces) {
    const ctx = this.ctx;
    const state = window.simState;
    if (traces.length === 0) return;

    // Pick first representative trace
    const repTrace = traces[0];
    if (!repTrace || !repTrace.bouncePoints || repTrace.bouncePoints.length === 0) return;

    const critDeg = repTrace.critDeg || 24.4;
    const critRad = critDeg * Math.PI / 180;

    ctx.save();
    repTrace.bouncePoints.forEach(bp => {
      const pt = bp.point || bp;
      const normal = bp.normal || { x: 0, y: 1 };
      const normAngle = Math.atan2(normal.y, normal.x);

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.10)';
      ctx.lineWidth = 1.2;

      // Small cone sector visualizing the critical escape zone centered on facet normal
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.arc(pt.x, pt.y, 26, normAngle - critRad, normAngle + critRad);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dashed normal vector
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + normal.x * 28, pt.y + normal.y * 28);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    ctx.restore();
  }

  /**
   * Draw spectral projection rainbow arc above the diamond
   */
  drawSpectralProjection(traces, gemGeom) {
    const ctx = this.ctx;
    const emergentTraces = traces.filter(t => t.exitDir && t.exitPoint);
    if (emergentTraces.length < 2) return;

    // Check if emergent rays point upward (brilliance)
    const upwardTraces = emergentTraces.filter(t => t.exitDir.y < 0);
    if (upwardTraces.length === 0) return;

    ctx.save();
    // Spectral Fire Band HUD overlay
    const tableTop = gemGeom.vertices[0].y;
    const bandY = tableTop - 70 * this.view.zoom;

    // Draw projection screen label
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('🌈 SPECTRUM FAN (FIRE DISPLAY)', gemGeom.cx, bandY - 14);

    // Draw colorful rainbow bar
    const barWidth = 260 * this.view.zoom;
    const barHeight = 8;
    const barX = gemGeom.cx - barWidth / 2;

    const rainGrad = ctx.createLinearGradient(barX, bandY, barX + barWidth, bandY);
    rainGrad.addColorStop(0.00, '#8b00ff');
    rainGrad.addColorStop(0.16, '#4b0082');
    rainGrad.addColorStop(0.33, '#0060ff');
    rainGrad.addColorStop(0.50, '#00c853');
    rainGrad.addColorStop(0.66, '#ffd600');
    rainGrad.addColorStop(0.83, '#ff6d00');
    rainGrad.addColorStop(1.00, '#ff1744');

    ctx.fillStyle = rainGrad;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(barX, bandY, barWidth, barHeight, 4);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw the Light Source / Draggable Flashlight emitter
   */
  drawLightSource(gemGeom) {
    const ctx = this.ctx;
    const state = window.simState;
    const emitter = this.getEmitterPosition(gemGeom);
    const angleRad = (state.incidentAngleDeg || 0) * Math.PI / 180;

    ctx.save();
    ctx.translate(emitter.x, emitter.y);
    ctx.rotate(angleRad);

    // Flashlight body / emitter housing
    ctx.shadowColor = state.lightType === 'white' ? '#00f0ff' : Optics.wavelengthToCSS(state.laserWavelength);
    ctx.shadowBlur = 14;

    const emitterGrad = ctx.createLinearGradient(-18, -35, 18, 0);
    emitterGrad.addColorStop(0, '#1e293b');
    emitterGrad.addColorStop(0.5, '#334155');
    emitterGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = emitterGrad;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;

    // Torch barrel
    ctx.beginPath();
    ctx.roundRect(-14, -40, 28, 40, [6, 6, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Lens aperture
    const beamColor = state.lightType === 'white' ? '#ffffff' : Optics.wavelengthToCSS(state.laserWavelength);
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle drag indicator handle ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.arc(0, -20, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw incident and refraction angle arcs with degree labels,
   * aligning dynamically with the entry facet normal and light vectors.
   */
  drawAngleAnnotations(traces, gemGeom) {
    const ctx = this.ctx;
    if (traces.length === 0) return;

    const rep = traces[0];
    if (!rep || !rep.segments || rep.segments.length < 2) return;

    const seg0 = rep.segments[0];
    const seg1 = rep.segments[1];
    const entryPt = seg0.end;
    const iDeg = Math.round(rep.iDeg * 10) / 10;
    const r1Deg = Math.round((rep.r1Deg || 0) * 10) / 10;

    // Normal at entry facet (outward, points into air)
    const norm = rep.entryNormal || { x: 0, y: -1 };
    const normAngle = Math.atan2(norm.y, norm.x);

    // Incoming ray vector from entryPt back to source
    const backAngle = Math.atan2(seg0.start.y - entryPt.y, seg0.start.x - entryPt.x);

    // Refracted ray vector going into the gem
    const refrAngle = Math.atan2(seg1.end.y - entryPt.y, seg1.end.x - entryPt.x);
    // Inward normal (opposite of outward normal)
    const inNormAngle = Math.atan2(-norm.y, -norm.x);

    ctx.save();

    // Normal line at entry point (dashed line perpendicular to facet)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(entryPt.x - norm.x * 45, entryPt.y - norm.y * 45);
    ctx.lineTo(entryPt.x + norm.x * 45, entryPt.y + norm.y * 45);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arc for angle of incidence θ₁ (between outward normal and incoming ray vector)
    if (iDeg > 0.5) {
      let diff = backAngle - normAngle;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      while (diff > Math.PI) diff -= 2 * Math.PI;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(entryPt.x, entryPt.y, 26, normAngle, normAngle + diff, diff < 0);
      ctx.stroke();

      // Label θ₁
      const midA = normAngle + diff / 2;
      const lblX = entryPt.x + Math.cos(midA) * 44;
      const lblY = entryPt.y + Math.sin(midA) * 44;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`θ₁ = ${iDeg}°`, lblX, lblY);
    }

    // Arc for angle of refraction θ₂ (between inward normal and refracted ray)
    if (r1Deg > 0.5) {
      let diffR = refrAngle - inNormAngle;
      while (diffR < -Math.PI) diffR += 2 * Math.PI;
      while (diffR > Math.PI) diffR -= 2 * Math.PI;

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(entryPt.x, entryPt.y, 26, inNormAngle, inNormAngle + diffR, diffR < 0);
      ctx.stroke();

      // Label θ₂
      const midB = inNormAngle + diffR / 2;
      const lblRX = entryPt.x + Math.cos(midB) * 44;
      const lblRY = entryPt.y + Math.sin(midB) * 44;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#a855f7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`θ₂ = ${r1Deg}°`, lblRX, lblRY);
    }

    ctx.restore();
  }

  /**
   * Update live state telemetry based on traced rays and gem cut
   */
  updateTelemetry(traces, gemGeom) {
    const state = window.simState;
    if (traces.length === 0) return;

    const rep = traces[0];
    const totalTIR = traces.reduce((acc, t) => acc + (t.bounceCount || 0), 0);
    const avgTIR = Math.round((totalTIR / traces.length) * 10) / 10;

    // Count emergent rays returning through crown (brilliance)
    const returnedUpward = traces.filter(t => t.exitDir && t.exitDir.y < 0).length;
    const brilliancePct = Math.round((returnedUpward / traces.length) * 100);

    // Fire dispersion calculation (spread in exit angles)
    let fireSpreadDeg = 0;
    const exitAngles = traces
      .filter(t => t.exitDir)
      .map(t => Math.atan2(t.exitDir.y, t.exitDir.x) * 180 / Math.PI);

    if (exitAngles.length >= 2) {
      const minA = Math.min(...exitAngles);
      const maxA = Math.max(...exitAngles);
      fireSpreadDeg = Math.round(Math.abs(maxA - minA) * 10) / 10;
    }

    // Cut Quality Rating
    let cutGrade = 'Ideal / Excellent (Tolkowsky)';
    const pavDeg = state.cutParams.pavilionAngleDeg;
    if (pavDeg < 39.0) {
      cutGrade = 'Shallow Cut (Fish-Eye Leakage)';
    } else if (pavDeg > 42.5) {
      cutGrade = 'Deep Cut (Nail-Head Extinction)';
    } else if (brilliancePct >= 85) {
      cutGrade = 'Tolkowsky Ideal Cut ⭐';
    } else {
      cutGrade = 'Very Good Cut';
    }

    state.telemetry = {
      iDeg: Math.round(rep.iDeg * 10) / 10,
      r1Deg: Math.round((rep.r1Deg || 0) * 10) / 10,
      critDeg: Math.round((rep.critDeg || 24.4) * 10) / 10,
      nGem: Math.round(rep.nGem * 1000) / 1000,
      bounceCount: rep.bounceCount,
      totalInternalReflections: totalTIR,
      dispersedColors: traces.length,
      brilliance: brilliancePct,
      fire: fireSpreadDeg,
      cutGrade
    };

    // Check laboratory quests
    state.checkQuests();
  }

  resetView() {
    this.view.zoom = 1.0;
    this.view.panX = 0;
    this.view.panY = 0;
  }
}

window.DiamondRenderer = DiamondRenderer;
