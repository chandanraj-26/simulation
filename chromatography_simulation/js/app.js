/**
 * Chromatography Virtual Laboratory (Paper & Thin-Layer Chromatography)
 * Biophysical capillary migration engine based on Washburn dynamics:
 * h(t) = sqrt((gamma * r * cos(theta) / (2 * eta)) * t)
 * Solute band migration: d_i = Rf_i * d_solvent with Gaussian dispersion.
 * Zero external dependencies.
 */

(function () {
  'use strict';

  // --- Audio Synthesis via Web Audio API ---
  class LabAudioEngine {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playClick() {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    }

    playChime() {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t0 = this.ctx.currentTime + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.15, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.36);
      });
    }

    playWick(active) {
      this.init();
      if (!this.ctx) return;
      if (active && !this.wickOsc) {
        // Soft white-noise / flutter for capillary wicking
        const bufferSize = this.ctx.sampleRate * 1;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.02;
        }
        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = noiseBuffer;
        this.noiseNode.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        this.wickGain = this.ctx.createGain();
        this.wickGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

        this.noiseNode.connect(filter);
        filter.connect(this.wickGain);
        this.wickGain.connect(this.ctx.destination);
        this.noiseNode.start();
        this.wickOsc = true;
      } else if (!active && this.wickOsc) {
        if (this.wickGain) {
          this.wickGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
        }
        setTimeout(() => {
          if (this.noiseNode) {
            try { this.noiseNode.stop(); } catch(e) {}
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
          this.wickOsc = false;
        }, 120);
      }
    }
  }

  // --- Sample Pigment / Solute Database ---
  const SAMPLES = {
    spinach: {
      name: "Spinach Chloroplast Extract",
      recommendedSolvent: "pet_acetone",
      description: "Natural photosynthetic pigments from Spinacia oleracea leaves.",
      components: [
        { name: "β-Carotene", color: "#F59E0B", darkColor: "#D97706", rf: 0.94, width: 7, desc: "Hydrocarbon carotenoid; least polar, travels fastest with mobile phase." },
        { name: "Xanthophyll", color: "#EAB308", darkColor: "#CA8A04", rf: 0.72, width: 9, desc: "Oxygenated carotenoid with polar -OH groups." },
        { name: "Chlorophyll a", color: "#10B981", darkColor: "#059669", rf: 0.58, width: 12, desc: "Primary blue-green pigment with Mg-porphyrin ring." },
        { name: "Chlorophyll b", color: "#65A30D", darkColor: "#4D7C0F", rf: 0.42, width: 11, desc: "Accessory yellow-green pigment; -CHO aldehyde group makes it more polar." }
      ]
    },
    ink: {
      name: "Black Marker Ink (Water-Soluble)",
      recommendedSolvent: "ethanol_water",
      description: "Synthetic dye mixture formulated in felt-tip markers.",
      components: [
        { name: "Fast Cyan Dye", color: "#06B6D4", darkColor: "#0891B2", rf: 0.83, width: 8, desc: "High solubility in aqueous ethanol." },
        { name: "Magenta Dye", color: "#EC4899", darkColor: "#DB2777", rf: 0.54, width: 10, desc: "Intermediate affinity for cellulose fibers." },
        { name: "Tartrazine Yellow", color: "#FBBF24", darkColor: "#D97706", rf: 0.28, width: 9, desc: "High adsorption affinity to paper hydroxyl groups." }
      ]
    },
    amino: {
      name: "Amino Acid Mixture",
      recommendedSolvent: "baw",
      description: "Hydrated standard amino acid residues. Requires Ninhydrin development to visualize purple Ruhemann complexes.",
      requiresNinhydrin: true,
      components: [
        { name: "Leucine", color: "#8B5CF6", darkColor: "#7C3AED", rf: 0.74, width: 9, desc: "Hydrophobic branched alkyl side chain." },
        { name: "Alanine", color: "#A855F7", darkColor: "#9333EA", rf: 0.39, width: 8, desc: "Small neutral non-polar residue." },
        { name: "Glycine", color: "#C084FC", darkColor: "#A855F7", rf: 0.26, width: 7, desc: "Simplest amino acid; high polarity and cellulose retention." }
      ]
    }
  };

  const SOLVENTS = {
    pet_acetone: {
      name: "Petroleum Ether : Acetone (9:1)",
      polarity: "Non-polar mobile phase",
      speedFactor: 1.0,
      description: "Standard organic developer for lipid-soluble chloroplast pigments."
    },
    ethanol_water: {
      name: "Ethanol : Water (7:3)",
      polarity: "Polar mobile phase",
      speedFactor: 0.85,
      description: "Ideal polar solvent for water-soluble inks and food colorings."
    },
    baw: {
      name: "n-Butanol : Acetic Acid : Water (4:1:5)",
      polarity: "Partitioning mixture",
      speedFactor: 0.70,
      description: "Standard solvent for partition chromatography of amino acids."
    }
  };

  // --- Simulation State ---
  const state = {
    sampleKey: "spinach",
    solventKey: "pet_acetone",
    running: false,
    completed: false,
    elapsedSeconds: 0,
    speedMultiplier: 1.0,
    ninhydrinDeveloped: false,
    showRuler: true,
    showLabels: true,
    rulerPos: { x: 0, y: 0, dragging: false, startX: 0, startY: 0 },
    // Physical dimensions (in mm on paper strip):
    stripTotalHeightMm: 120, // 120 mm tall paper strip
    stripWidthMm: 40,        // 40 mm wide
    originBaselineMm: 15,    // Origin baseline 15 mm from bottom
    maxSolventHeightMm: 100, // 100 mm migration above baseline
    solventFrontMm: 0,       // Live solvent height above baseline in mm
    flowRateMmSec: 0,
    targetFrontMm: 95        // Automatic stop when front reaches 95 mm
  };

  const audio = new LabAudioEngine();

  // Canvas & DOM elements
  let canvas, ctx;
  let sampleSelect, solventSelect, runBtn, resetBtn, speedSlider, speedVal;
  let rulerToggle, labelsToggle, ninhydrinBtn;
  let solventFrontVal, elapsedTimeVal, flowRateVal, rfTableBody;
  let helpBtn, helpModal, modalCloseBtn;

  // --- Physical Engine: Washburn Capillary Rise ---
  // h(t) = H_max * sqrt(1 - exp(-k * t)) or simplified Washburn: h = k_w * sqrt(t)
  function computeWashburnStep(dt) {
    if (!state.running || state.completed) return;

    const solventInfo = SOLVENTS[state.solventKey];
    const baseWickingRate = 4.2 * solventInfo.speedFactor * state.speedMultiplier;

    state.elapsedSeconds += dt * state.speedMultiplier;

    // Washburn rate slows down as column rises against viscous drag
    // dh/dt = A / (h + h0)
    const effectiveH = Math.max(state.solventFrontMm, 2);
    const dh = (baseWickingRate / (effectiveH * 0.12 + 1.2)) * dt;

    const prevFront = state.solventFrontMm;
    state.solventFrontMm += dh;
    state.flowRateMmSec = (state.solventFrontMm - prevFront) / (dt || 0.016);

    if (state.solventFrontMm >= state.targetFrontMm) {
      state.solventFrontMm = state.targetFrontMm;
      state.running = false;
      state.completed = true;
      state.flowRateMmSec = 0;
      audio.playWick(false);
      audio.playChime();
      updateRunButtonUI();
    }
  }

  // --- Rendering Dimensions & Coordinate System ---
  function getPaperGeometry() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Chamber dimensions
    const chamberW = Math.min(320, w * 0.55);
    const chamberH = Math.min(460, h * 0.88);
    const chamberX = (w - chamberW) * 0.42;
    const chamberY = (h - chamberH) * 0.5;

    // Paper strip inside chamber
    const paperW = chamberW * 0.52;
    const paperH = chamberH * 0.78;
    const paperX = chamberX + (chamberW - paperW) / 2;
    const paperY = chamberY + 45;

    // Baseline Y in canvas coordinates (from paper bottom)
    const pxPerMm = paperH / state.stripTotalHeightMm;
    const baselineY = (paperY + paperH) - (state.originBaselineMm * pxPerMm);
    const maxSolventY = baselineY - (state.targetFrontMm * pxPerMm);

    return {
      w, h,
      chamberX, chamberY, chamberW, chamberH,
      paperX, paperY, paperW, paperH,
      pxPerMm, baselineY, maxSolventY
    };
  }

  // --- Canvas Drawing Routines ---
  function drawChamber(geom) {
    const { chamberX, chamberY, chamberW, chamberH } = geom;

    // Bench / Table Surface
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(chamberX - 40, chamberY + chamberH + 1, chamberW + 80, 14);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(chamberX - 40, chamberY + chamberH + 15, chamberW + 80, 2);

    // Glass Chamber Body
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(chamberX, chamberY, chamberW, chamberH, 12);
    ctx.fillStyle = 'rgba(235, 248, 255, 0.45)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#94A3B8';
    ctx.stroke();

    // Glass reflection highlights
    const gradGlass = ctx.createLinearGradient(chamberX, 0, chamberX + 35, 0);
    gradGlass.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
    gradGlass.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = gradGlass;
    ctx.fillRect(chamberX + 4, chamberY + 8, 30, chamberH - 16);

    // Chamber Lid (Rubber stopper / ground glass cover)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(chamberX - 6, chamberY - 10, chamberW + 12, 14, 4);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Top Suspender Hook / Clip
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(chamberX + chamberW / 2, chamberY + 4);
    ctx.lineTo(chamberX + chamberW / 2, geom.paperY + 6);
    ctx.stroke();

    // Metal Clip holding paper
    ctx.fillStyle = '#64748B';
    ctx.fillRect(chamberX + chamberW / 2 - 16, geom.paperY - 2, 32, 10);

    // Solvent Reservoir Pool at Chamber Bottom
    const poolH = 22;
    const poolY = chamberY + chamberH - poolH;
    ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
    ctx.fillRect(chamberX + 3, poolY, chamberW - 6, poolH - 3);

    // Solvent meniscus wave
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chamberX + 3, poolY);
    ctx.bezierCurveTo(
      chamberX + chamberW * 0.3, poolY - 3,
      chamberX + chamberW * 0.7, poolY + 2,
      chamberX + chamberW - 3, poolY
    );
    ctx.stroke();

    ctx.restore();
  }

  function drawPaperStrip(geom) {
    const { paperX, paperY, paperW, paperH, pxPerMm, baselineY } = geom;

    ctx.save();
    // Drop shadow under paper
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // Chromatography Paper (Whatman #1 texture & fibrous white-cream)
    ctx.fillStyle = '#FDFDFD';
    ctx.fillRect(paperX, paperY, paperW, paperH);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(paperX, paperY, paperW, paperH);
    ctx.restore();

    // Submerged bottom zone
    const submergedH = (paperY + paperH) - (baselineY + 6);
    if (submergedH > 0) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.fillRect(paperX, paperY + paperH - submergedH, paperW, submergedH);
    }

    // Wet Solvent Zone (capillary wicking front)
    const solventH_px = state.solventFrontMm * pxPerMm;
    const solventFrontY = baselineY - solventH_px;

    if (state.solventFrontMm > 0) {
      ctx.save();
      const wetGrad = ctx.createLinearGradient(0, baselineY, 0, solventFrontY);
      wetGrad.addColorStop(0, 'rgba(224, 242, 254, 0.55)');
      wetGrad.addColorStop(0.9, 'rgba(224, 242, 254, 0.4)');
      wetGrad.addColorStop(1, 'rgba(186, 230, 253, 0.65)');
      ctx.fillStyle = wetGrad;
      ctx.fillRect(paperX, solventFrontY, paperW, baselineY - solventFrontY);

      // Solvent Front Meniscus Line
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(paperX, solventFrontY);
      // Slight capillary curvature
      ctx.quadraticCurveTo(paperX + paperW / 2, solventFrontY - 2, paperX + paperW, solventFrontY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label Solvent Front
      ctx.fillStyle = '#0369A1';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Solvent Front: ${(state.solventFrontMm / 10).toFixed(2)} cm`, paperX + paperW + 10, solventFrontY + 4);
      ctx.restore();
    }

    // Pencil Baseline (Origin Line)
    ctx.save();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(paperX, baselineY);
    ctx.lineTo(paperX + paperW, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Baseline marker label
    ctx.fillStyle = '#64748B';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Origin (Baseline)', paperX + paperW + 10, baselineY + 3);

    // Initial Spot circle at origin if before migration
    const spotX = paperX + paperW / 2;
    if (state.solventFrontMm === 0) {
      ctx.beginPath();
      ctx.arc(spotX, baselineY, 5, 0, Math.PI * 2);
      ctx.fillStyle = state.sampleKey === 'spinach' ? '#166534' : (state.sampleKey === 'ink' ? '#1E293B' : '#7C3AED');
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Solute / Pigment Bands Migration
    drawPigmentBands(geom, spotX, baselineY, pxPerMm);
  }

  function drawPigmentBands(geom, spotX, baselineY, pxPerMm) {
    const sample = SAMPLES[state.sampleKey];
    if (!sample) return;

    const { paperX, paperW } = geom;
    const isAmino = sample.requiresNinhydrin;

    // Check if invisible without ninhydrin development
    if (isAmino && !state.ninhydrinDeveloped) {
      // Invisible latent spots
      return;
    }

    sample.components.forEach((comp) => {
      // Solute distance d = Rf * solventFrontMm
      const soluteMm = state.solventFrontMm * comp.rf;
      const soluteY = baselineY - (soluteMm * pxPerMm);

      // Gaussian band width spreads slightly as it migrates
      const dispersion = 1 + (soluteMm / 100) * 0.8;
      const radiusY = Math.max(3, (comp.width / 2) * dispersion);
      const radiusX = Math.min(paperW * 0.35, 14 * dispersion);

      ctx.save();
      // Band ellipse
      ctx.beginPath();
      ctx.ellipse(spotX, soluteY, radiusX, radiusY, 0, 0, Math.PI * 2);

      const gradBand = ctx.createRadialGradient(spotX, soluteY, 1, spotX, soluteY, radiusX);
      gradBand.addColorStop(0, comp.color);
      gradBand.addColorStop(0.7, comp.color);
      gradBand.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradBand;
      ctx.fill();

      // Band center mark
      ctx.strokeStyle = comp.darkColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(spotX - radiusX * 0.6, soluteY);
      ctx.lineTo(spotX + radiusX * 0.6, soluteY);
      ctx.stroke();

      // Band Label & Callout
      if (state.showLabels && state.solventFrontMm > 5) {
        ctx.fillStyle = '#0F172A';
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'right';

        const labelX = paperX - 12;
        ctx.fillText(comp.name, labelX, soluteY + 4);

        // Leader pointer line
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(labelX + 4, soluteY);
        ctx.lineTo(spotX - radiusX, soluteY);
        ctx.stroke();

        // Small Rf badge
        ctx.fillStyle = '#64748B';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillText(`Rf = ${comp.rf.toFixed(2)}`, labelX, soluteY + 16);
      }

      ctx.restore();
    });
  }

  // --- Transparent Draggable Metric Ruler ---
  function drawRuler(geom) {
    if (!state.showRuler) return;

    const { baselineY, pxPerMm } = geom;

    // Default ruler position if not dragged: aligned on right side of paper
    if (state.rulerPos.x === 0 && state.rulerPos.y === 0) {
      state.rulerPos.x = geom.paperX + geom.paperW + 70;
      state.rulerPos.y = baselineY - (110 * pxPerMm); // 0 mm aligned with baseline
    }

    const rulerW = 46;
    const rulerH = 120 * pxPerMm; // 12 cm ruler
    const rx = state.rulerPos.x;
    const ry = state.rulerPos.y;

    ctx.save();
    // Glassy transparent acrylic ruler body
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rulerW, rulerH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Ruler Millimeter & Centimeter Markings
    // 0 is at bottom (baseline alignment), goes up to 11 cm
    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.fillStyle = '#0F172A';
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    const totalMm = 110;
    for (let mm = 0; mm <= totalMm; mm++) {
      const lineY = (ry + rulerH) - (mm * pxPerMm);
      const isCm = mm % 10 === 0;
      const isHalfCm = mm % 5 === 0;

      let tickLen = 7;
      if (isCm) tickLen = 18;
      else if (isHalfCm) tickLen = 12;

      ctx.lineWidth = isCm ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(rx, lineY);
      ctx.lineTo(rx + tickLen, lineY);
      ctx.stroke();

      if (isCm) {
        ctx.fillText(`${mm / 10}`, rx + rulerW - 6, lineY + 3);
      }
    }

    // Ruler Header / Draggable indicator
    ctx.fillStyle = '#0284C7';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('cm (DRAG)', rx + rulerW / 2, ry - 6);

    ctx.restore();
  }

  // --- Telemetry & UI Synchronization ---
  function updateTelemetry() {
    if (solventFrontVal) {
      solventFrontVal.textContent = `${(state.solventFrontMm / 10).toFixed(2)} cm (${state.solventFrontMm.toFixed(1)} mm)`;
    }
    if (elapsedTimeVal) {
      const mins = Math.floor(state.elapsedSeconds / 60);
      const secs = (state.elapsedSeconds % 60).toFixed(1);
      elapsedTimeVal.textContent = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    if (flowRateVal) {
      flowRateVal.textContent = `${state.flowRateMmSec.toFixed(2)} mm/s`;
    }

    // Update Rf Table
    if (rfTableBody) {
      const sample = SAMPLES[state.sampleKey];
      if (!sample) return;

      const isAmino = sample.requiresNinhydrin;
      let html = '';

      sample.components.forEach((comp) => {
        const soluteMm = state.solventFrontMm * comp.rf;
        const soluteCm = (soluteMm / 10).toFixed(2);
        const solventCm = (state.solventFrontMm / 10).toFixed(2);
        const experimentalRf = state.solventFrontMm > 5 ? (soluteMm / state.solventFrontMm).toFixed(2) : '--';

        const displayDist = (isAmino && !state.ninhydrinDeveloped) ? 'Hidden (Spray Ninhydrin)' : `${soluteCm} cm`;
        const displayRf = (isAmino && !state.ninhydrinDeveloped) ? '--' : comp.rf.toFixed(2);

        html += `
          <tr>
            <td>
              <span class="color-dot" style="background:${comp.color}; border: 1px solid ${comp.darkColor};"></span>
              <strong>${comp.name}</strong>
            </td>
            <td class="mono-text">${displayDist}</td>
            <td class="mono-text">${solventCm} cm</td>
            <td class="mono-text font-bold" style="color: #0284C7;">${displayRf}</td>
          </tr>
        `;
      });
      rfTableBody.innerHTML = html;
    }
  }

  function updateRunButtonUI() {
    if (!runBtn) return;
    if (state.completed) {
      runBtn.textContent = 'Development Complete';
      runBtn.classList.remove('running');
      runBtn.disabled = true;
    } else if (state.running) {
      runBtn.textContent = 'Pause Migration';
      runBtn.classList.add('running');
      runBtn.disabled = false;
    } else {
      runBtn.textContent = state.solventFrontMm > 0 ? 'Resume Migration' : 'Start Chromatography';
      runBtn.classList.remove('running');
      runBtn.disabled = false;
    }
  }

  // --- Mouse / Touch Dragging for Ruler ---
  function handlePointerDown(e) {
    if (!state.showRuler) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const geom = getPaperGeometry();
    const rulerW = 46;
    const rulerH = 120 * geom.pxPerMm;

    // Check hit test on ruler
    if (
      x >= state.rulerPos.x - 10 &&
      x <= state.rulerPos.x + rulerW + 10 &&
      y >= state.rulerPos.y - 15 &&
      y <= state.rulerPos.y + rulerH + 15
    ) {
      state.rulerPos.dragging = true;
      state.rulerPos.startX = x - state.rulerPos.x;
      state.rulerPos.startY = y - state.rulerPos.y;
      audio.playClick();
    }
  }

  function handlePointerMove(e) {
    if (!state.rulerPos.dragging) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    state.rulerPos.x = x - state.rulerPos.startX;
    state.rulerPos.y = y - state.rulerPos.startY;
  }

  function handlePointerUp() {
    if (state.rulerPos.dragging) {
      state.rulerPos.dragging = false;
    }
  }

  // --- Reset & Control Handlers ---
  function resetSimulation() {
    state.running = false;
    state.completed = false;
    state.elapsedSeconds = 0;
    state.solventFrontMm = 0;
    state.flowRateMmSec = 0;
    state.ninhydrinDeveloped = false;
    state.rulerPos.x = 0;
    state.rulerPos.y = 0;
    audio.playWick(false);
    audio.playClick();
    updateRunButtonUI();
    if (ninhydrinBtn) {
      ninhydrinBtn.textContent = 'Spray Ninhydrin Reagent';
    }
  }

  function toggleRun() {
    audio.init();
    if (state.completed) return;
    state.running = !state.running;
    audio.playClick();
    audio.playWick(state.running);
    updateRunButtonUI();
  }

  // --- Animation Loop ---
  let lastTime = 0;
  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    computeWashburnStep(dt);

    // Canvas Rendering
    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;

    if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayW, displayH);

    const geom = getPaperGeometry();
    drawChamber(geom);
    drawPaperStrip(geom);
    drawRuler(geom);

    ctx.restore();

    updateTelemetry();
    requestAnimationFrame(animate);
  }

  // --- DOM Setup & Event Binding ---
  function initDOM() {
    canvas = document.getElementById('simCanvas');
    ctx = canvas.getContext('2d');

    sampleSelect = document.getElementById('sampleSelect');
    solventSelect = document.getElementById('solventSelect');
    runBtn = document.getElementById('runBtn');
    resetBtn = document.getElementById('resetBtn');
    speedSlider = document.getElementById('speedSlider');
    speedVal = document.getElementById('speedVal');
    rulerToggle = document.getElementById('rulerToggle');
    labelsToggle = document.getElementById('labelsToggle');
    ninhydrinBtn = document.getElementById('ninhydrinBtn');

    solventFrontVal = document.getElementById('solventFrontVal');
    elapsedTimeVal = document.getElementById('elapsedTimeVal');
    flowRateVal = document.getElementById('flowRateVal');
    rfTableBody = document.getElementById('rfTableBody');

    helpBtn = document.getElementById('helpBtn');
    helpModal = document.getElementById('helpModal');
    modalCloseBtn = document.getElementById('modalCloseBtn');

    // Sample Selection
    if (sampleSelect) {
      sampleSelect.addEventListener('change', (e) => {
        state.sampleKey = e.target.value;
        const sample = SAMPLES[state.sampleKey];
        if (sample && solventSelect) {
          solventSelect.value = sample.recommendedSolvent;
          state.solventKey = sample.recommendedSolvent;
        }
        if (ninhydrinBtn) {
          ninhydrinBtn.style.display = sample.requiresNinhydrin ? 'block' : 'none';
        }
        resetSimulation();
      });
    }

    // Solvent Selection
    if (solventSelect) {
      solventSelect.addEventListener('change', (e) => {
        state.solventKey = e.target.value;
        resetSimulation();
      });
    }

    // Run / Pause Button
    if (runBtn) {
      runBtn.addEventListener('click', toggleRun);
    }

    // Reset Button
    if (resetBtn) {
      resetBtn.addEventListener('click', resetSimulation);
    }

    // Speed Slider
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        state.speedMultiplier = parseFloat(e.target.value);
        if (speedVal) speedVal.textContent = `${state.speedMultiplier.toFixed(1)}x`;
      });
    }

    // Ruler Toggle
    if (rulerToggle) {
      rulerToggle.addEventListener('change', (e) => {
        state.showRuler = e.target.checked;
        audio.playClick();
      });
    }

    // Labels Toggle
    if (labelsToggle) {
      labelsToggle.addEventListener('change', (e) => {
        state.showLabels = e.target.checked;
        audio.playClick();
      });
    }

    // Ninhydrin Spray Reagent Button
    if (ninhydrinBtn) {
      ninhydrinBtn.addEventListener('click', () => {
        state.ninhydrinDeveloped = true;
        ninhydrinBtn.textContent = 'Developed (Ruhemann\'s Purple)';
        audio.playChime();
      });
    }

    // Modal Handlers
    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => {
        helpModal.classList.add('open');
        audio.playClick();
      });
    }
    if (modalCloseBtn && helpModal) {
      modalCloseBtn.addEventListener('click', () => {
        helpModal.classList.remove('open');
        audio.playClick();
      });
    }
    if (helpModal) {
      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
          helpModal.classList.remove('open');
        }
      });
    }

    // Pointer listeners on canvas for dragging ruler
    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Initial update
    updateRunButtonUI();
    requestAnimationFrame(animate);
  }

  window.addEventListener('DOMContentLoaded', initDOM);
})();
