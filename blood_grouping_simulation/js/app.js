/**
 * Blood Grouping & Agglutination Immunology Virtual Laboratory
 * Comprehensive ABO and Rh(D) Hemagglutination Simulation
 * Models antigen-antibody lattice crosslinking (Erythrocyte clumping vs smooth colloidal suspension)
 * Zero external runtime dependencies.
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

    playDrop() {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.095);
    }

    playStir() {
      this.init();
      if (!this.ctx) return;
      // High glass ring clink
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 300, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    }

    playChime() {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t0 = this.ctx.currentTime + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.12, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.36);
      });
    }
  }

  // --- Blood Type Database ---
  const BLOOD_TYPES = {
    'A+': {
      label: 'A Positive (A+)',
      antigens: ['A', 'Rh(D)'],
      antibodies: ['Anti-B'],
      agglutinatesWith: { A: true, B: false, D: true },
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
      canDonateTo: ['A+', 'AB+'],
      description: 'Erythrocytes display A antigen and Rh(D) protein on outer membrane.'
    },
    'A-': {
      label: 'A Negative (A-)',
      antigens: ['A'],
      antibodies: ['Anti-B', 'Anti-D (if sensitized)'],
      agglutinatesWith: { A: true, B: false, D: false },
      canReceiveFrom: ['A-', 'O-'],
      canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
      description: 'Contains A antigen; lacks Rh(D) protein.'
    },
    'B+': {
      label: 'B Positive (B+)',
      antigens: ['B', 'Rh(D)'],
      antibodies: ['Anti-A'],
      agglutinatesWith: { A: false, B: true, D: true },
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
      canDonateTo: ['B+', 'AB+'],
      description: 'Erythrocytes express B antigen and Rh(D) polypeptide.'
    },
    'B-': {
      label: 'B Negative (B-)',
      antigens: ['B'],
      antibodies: ['Anti-A'],
      agglutinatesWith: { A: false, B: true, D: false },
      canReceiveFrom: ['B-', 'O-'],
      canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
      description: 'Contains B antigen; lacks Rh(D) antigen.'
    },
    'AB+': {
      label: 'AB Positive (AB+)',
      antigens: ['A', 'B', 'Rh(D)'],
      antibodies: ['None'],
      agglutinatesWith: { A: true, B: true, D: true },
      canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
      canDonateTo: ['AB+'],
      description: 'Universal Red Blood Cell Recipient; possesses all three antigens.'
    },
    'AB-': {
      label: 'AB Negative (AB-)',
      antigens: ['A', 'B'],
      antibodies: ['None'],
      agglutinatesWith: { A: true, B: true, D: false },
      canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
      canDonateTo: ['AB+', 'AB-'],
      description: 'Possesses A and B antigens; lacks Rh(D) protein.'
    },
    'O+': {
      label: 'O Positive (O+)',
      antigens: ['Rh(D)'],
      antibodies: ['Anti-A', 'Anti-B'],
      agglutinatesWith: { A: false, B: false, D: true },
      canReceiveFrom: ['O+', 'O-'],
      canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
      description: 'Lacks A and B oligosaccharide chains; contains Rh(D) factor.'
    },
    'O-': {
      label: 'O Negative (O-)',
      antigens: ['None'],
      antibodies: ['Anti-A', 'Anti-B'],
      agglutinatesWith: { A: false, B: false, D: false },
      canReceiveFrom: ['O-'],
      canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Donor
      canDonateUniversal: true,
      description: 'Universal Red Blood Cell Donor; devoid of A, B, and Rh antigens.'
    }
  };

  // --- Simulation State ---
  const state = {
    patientType: 'A+',
    isUnknown: false,
    selectedTool: 'blood', // 'blood', 'anti-a', 'anti-b', 'anti-d', 'stir'
    microscopeWell: null,  // 'A', 'B', 'D', or null
    wells: {
      A: { hasBlood: false, hasReagent: false, stirred: false, reactionProgress: 0, clumps: [] },
      B: { hasBlood: false, hasReagent: false, stirred: false, reactionProgress: 0, clumps: [] },
      D: { hasBlood: false, hasReagent: false, stirred: false, reactionProgress: 0, clumps: [] }
    }
  };

  const audio = new LabAudioEngine();

  // DOM Elements
  let canvas, ctx;
  let patientSelect, autoTestBtn, resetBtn, helpBtn, helpModal, modalCloseBtn;
  let wellA_Val, wellB_Val, wellD_Val, deducedTypeVal;
  let antigenListEl, antibodyListEl, donorTagsEl, recipientTagsEl;
  let toolButtons = {};

  // Pre-generate random clump particle layouts for each well
  function initClumpParticles(wellKey) {
    const clumps = [];
    const count = 35 + Math.floor(Math.random() * 15);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * 42; // within radius 42
      clumps.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 3 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        density: 0.6 + Math.random() * 0.4
      });
    }
    state.wells[wellKey].clumps = clumps;
  }

  // --- Well Interaction Handlers ---
  function interactWithWell(wellKey) {
    audio.init();
    const well = state.wells[wellKey];

    if (state.selectedTool === 'blood') {
      if (!well.hasBlood) {
        well.hasBlood = true;
        audio.playDrop();
      }
    } else if (state.selectedTool === 'anti-a') {
      if (wellKey === 'A') {
        well.hasReagent = true;
        audio.playDrop();
      }
    } else if (state.selectedTool === 'anti-b') {
      if (wellKey === 'B') {
        well.hasReagent = true;
        audio.playDrop();
      }
    } else if (state.selectedTool === 'anti-d') {
      if (wellKey === 'D') {
        well.hasReagent = true;
        audio.playDrop();
      }
    } else if (state.selectedTool === 'stir') {
      if (well.hasBlood && well.hasReagent && !well.stirred) {
        well.stirred = true;
        audio.playStir();
      }
    }

    checkAllComplete();
  }

  function autoTestAll() {
    audio.init();
    audio.playDrop();
    ['A', 'B', 'D'].forEach((k) => {
      state.wells[k].hasBlood = true;
      state.wells[k].hasReagent = true;
      state.wells[k].stirred = true;
    });
    setTimeout(() => {
      audio.playStir();
    }, 200);
    setTimeout(() => {
      audio.playChime();
    }, 800);
    checkAllComplete();
  }

  function resetPlate() {
    ['A', 'B', 'D'].forEach((k) => {
      state.wells[k].hasBlood = false;
      state.wells[k].hasReagent = false;
      state.wells[k].stirred = false;
      state.wells[k].reactionProgress = 0;
      initClumpParticles(k);
    });
    state.microscopeWell = null;
    audio.playDrop();
    updateTelemetry();
  }

  function checkAllComplete() {
    const allStirred = ['A', 'B', 'D'].every((k) => state.wells[k].stirred);
    if (allStirred) {
      setTimeout(() => {
        audio.playChime();
      }, 600);
    }
  }

  // --- Canvas Rendering Geometry ---
  function getPlateGeometry() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Porcelain Slide dimensions
    const plateW = Math.min(620, w * 0.92);
    const plateH = Math.min(260, h * 0.55);
    const plateX = (w - plateW) / 2;
    const plateY = Math.min(100, (h - plateH) * 0.35);

    const wellRadius = Math.min(54, plateW * 0.12);
    const spacing = plateW / 4;

    const wellPositions = {
      A: { x: plateX + spacing * 1, y: plateY + plateH / 2, r: wellRadius },
      B: { x: plateX + spacing * 2, y: plateY + plateH / 2, r: wellRadius },
      D: { x: plateX + spacing * 3, y: plateY + plateH / 2, r: wellRadius }
    };

    return { w, h, plateX, plateY, plateW, plateH, wellPositions };
  }

  // --- Canvas Drawing Routines ---
  function drawPorcelainPlate(geom) {
    const { plateX, plateY, plateW, plateH } = geom;

    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    // Glazed white porcelain tile
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(plateX, plateY, plateW, plateH, 16);
    ctx.fill();

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Plate top rim glaze gloss
    const glossGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + 25);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = glossGrad;
    ctx.beginPath();
    ctx.roundRect(plateX + 2, plateY + 2, plateW - 4, 25, [14, 14, 0, 0]);
    ctx.fill();

    // Lab Title stamped on plate
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ABO & Rh(D) BLOOD TYPING SLIDE • 3-CAVITY SPOT PLATE', plateX + plateW / 2, plateY + 28);
  }

  function drawWellCavities(geom) {
    const { wellPositions } = geom;
    const currentBlood = BLOOD_TYPES[state.patientType];

    const wellMeta = [
      { key: 'A', title: 'WELL A', reagent: 'Anti-A Reagent (Blue)', labelColor: '#0284C7', reagentColor: 'rgba(2, 132, 199, 0.65)' },
      { key: 'B', title: 'WELL B', reagent: 'Anti-B Reagent (Yellow)', labelColor: '#CA8A04', reagentColor: 'rgba(234, 179, 8, 0.75)' },
      { key: 'D', title: 'WELL D (Rh)', reagent: 'Anti-D Reagent (Clear)', labelColor: '#475569', reagentColor: 'rgba(148, 163, 184, 0.45)' }
    ];

    wellMeta.forEach((meta) => {
      const pos = wellPositions[meta.key];
      const well = state.wells[meta.key];
      const isAgglutinating = currentBlood.agglutinatesWith[meta.key];

      // Reaction animation progress
      if (well.stirred && well.reactionProgress < 1) {
        well.reactionProgress = Math.min(1, well.reactionProgress + 0.02);
      }

      ctx.save();

      // Deep concave well cavity shadow
      const cavityGrad = ctx.createRadialGradient(pos.x - 10, pos.y - 10, 5, pos.x, pos.y, pos.r);
      cavityGrad.addColorStop(0, '#FFFFFF');
      cavityGrad.addColorStop(0.7, '#F1F5F9');
      cavityGrad.addColorStop(1, '#CBD5E1');

      ctx.fillStyle = cavityGrad;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
      ctx.fill();

      // Cavity outer groove border
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Well Header & Subtitle
      ctx.fillStyle = meta.labelColor;
      ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(meta.title, pos.x, pos.y - pos.r - 12);

      ctx.fillStyle = '#64748B';
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(meta.reagent, pos.x, pos.y + pos.r + 18);

      // Render Fluid inside Well
      drawWellContents(pos, well, meta, isAgglutinating);

      // Interactive Click Indicator / Hover Circle
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r + 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  function drawWellContents(pos, well, meta, isAgglutinating) {
    const liquidR = pos.r - 6;

    // Case 1: Empty Well
    if (!well.hasBlood && !well.hasReagent) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty', pos.x, pos.y + 4);
      return;
    }

    // Case 2: Only Blood added
    if (well.hasBlood && !well.hasReagent) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, liquidR * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = '#DC2626';
      ctx.fill();
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('+ Blood', pos.x, pos.y + 3);
      ctx.restore();
      return;
    }

    // Case 3: Only Reagent added
    if (!well.hasBlood && well.hasReagent) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, liquidR * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = meta.reagentColor;
      ctx.fill();
      ctx.strokeStyle = meta.labelColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('+ Reagent', pos.x, pos.y + 3);
      ctx.restore();
      return;
    }

    // Case 4: Both Blood & Reagent present, not yet stirred
    if (well.hasBlood && well.hasReagent && !well.stirred) {
      ctx.save();
      // Combined pool
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, liquidR * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = '#DC2626';
      ctx.fill();

      // Floating unmixed droplet of antiserum
      ctx.beginPath();
      ctx.arc(pos.x + 8, pos.y - 6, liquidR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = meta.reagentColor;
      ctx.fill();
      ctx.strokeStyle = meta.labelColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Stir with Stick', pos.x, pos.y + 16);
      ctx.restore();
      return;
    }

    // Case 5: Stirred — Reaction in progress or complete
    if (well.stirred) {
      ctx.save();
      const p = well.reactionProgress;

      if (isAgglutinating) {
        // Agglutination (Clumping Reaction):
        // Blood fluid clarifies into translucent serum, with granular dark-red RBC agglutinates
        const serumGrad = ctx.createRadialGradient(pos.x, pos.y, 2, pos.x, pos.y, liquidR);
        serumGrad.addColorStop(0, `rgba(254, 226, 226, ${0.4 + 0.3 * p})`);
        serumGrad.addColorStop(1, `rgba(254, 202, 202, ${0.5 + 0.3 * p})`);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, liquidR, 0, Math.PI * 2);
        ctx.fillStyle = serumGrad;
        ctx.fill();
        ctx.strokeStyle = '#B91C1C';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Render Red Clumping Flakes / Floccules
        well.clumps.forEach((clump) => {
          ctx.save();
          ctx.translate(pos.x + clump.x * (0.8 + 0.2 * p), pos.y + clump.y * (0.8 + 0.2 * p));
          ctx.rotate(clump.rotation);

          ctx.fillStyle = clump.density > 0.8 ? '#7F1D1D' : '#991B1B';
          ctx.beginPath();
          ctx.ellipse(0, 0, clump.size * (0.6 + 0.6 * p), clump.size * 0.7 * (0.6 + 0.6 * p), 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Status badge
        ctx.fillStyle = '#991B1B';
        ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('AGGLUTINATION (+)', pos.x, pos.y + liquidR - 8);

      } else {
        // No Reaction (Homogenous colloidal suspension):
        // Smooth uniform pinkish-red colloidal mixture with zero clumping
        const smoothGrad = ctx.createRadialGradient(pos.x - 5, pos.y - 5, 2, pos.x, pos.y, liquidR);
        smoothGrad.addColorStop(0, '#EF4444');
        smoothGrad.addColorStop(0.85, '#DC2626');
        smoothGrad.addColorStop(1, '#B91C1C');

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, liquidR, 0, Math.PI * 2);
        ctx.fillStyle = smoothGrad;
        ctx.fill();
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fluid gloss sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(pos.x - liquidR * 0.3, pos.y - liquidR * 0.3, liquidR * 0.25, liquidR * 0.12, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Status badge
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('NO REACTION (-)', pos.x, pos.y + 4);
      }

      ctx.restore();
    }
  }

  // --- High-Magnification Microscope View (Erythrocyte Cytology) ---
  function drawMicroscopeOverlay(geom) {
    if (!state.microscopeWell) return;

    const wellKey = state.microscopeWell;
    const well = state.wells[wellKey];
    const currentBlood = BLOOD_TYPES[state.patientType];
    const isAgglutinating = currentBlood.agglutinatesWith[wellKey];

    const { w, h } = geom;
    const microR = Math.min(100, w * 0.18);
    const microX = w - microR - 20;
    const microY = h - microR - 20;

    ctx.save();
    // Microscope Bezel
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 14;

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(microX, microY, microR + 6, 0, Math.PI * 2);
    ctx.fill();

    // Objective lens field of view
    const fovGrad = ctx.createRadialGradient(microX, microY, 10, microX, microY, microR);
    fovGrad.addColorStop(0, '#FFFFFF');
    fovGrad.addColorStop(1, '#E2E8F0');

    ctx.fillStyle = fovGrad;
    ctx.beginPath();
    ctx.arc(microX, microY, microR, 0, Math.PI * 2);
    ctx.fill();

    // Reticle crosshair
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(microX - microR, microY);
    ctx.lineTo(microX + microR, microY);
    ctx.moveTo(microX, microY - microR);
    ctx.lineTo(microX, microY + microR);
    ctx.stroke();

    // Erythrocyte Cytology
    if (well.stirred && isAgglutinating) {
      // Clumped erythrocytes locked in lattice
      const clusterCenters = [
        { cx: microX - 30, cy: microY - 20 },
        { cx: microX + 25, cy: microY + 15 },
        { cx: microX + 5, cy: microY - 10 }
      ];

      clusterCenters.forEach((c) => {
        for (let i = 0; i < 12; i++) {
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.random() * 22;
          const rx = c.cx + Math.cos(ang) * rad;
          const ry = c.cy + Math.sin(ang) * rad;

          // Biconcave red disc
          ctx.beginPath();
          ctx.arc(rx, ry, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#DC2626';
          ctx.fill();
          ctx.strokeStyle = '#991B1B';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Central pallor (biconcave depression)
          ctx.beginPath();
          ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#F87171';
          ctx.fill();
        }
      });
    } else if (well.hasBlood) {
      // Dispersed unclumped erythrocytes drifting individually
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2;
        const rad = (0.2 + (i % 5) * 0.16) * microR;
        const rx = microX + Math.cos(ang) * rad;
        const ry = microY + Math.sin(ang) * rad;

        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FCA5A5';
        ctx.fill();
      }
    }

    // Microscope Header Tag
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`400x MICROSCOPE • WELL ${wellKey}`, microX, microY - microR - 10);

    ctx.restore();
  }

  // --- Telemetry & Diagnostics Synchronization ---
  function updateTelemetry() {
    const currentBlood = BLOOD_TYPES[state.patientType];
    const allStirred = ['A', 'B', 'D'].every((k) => state.wells[k].stirred);

    const formatWellStatus = (wellKey) => {
      const well = state.wells[wellKey];
      if (!well.hasBlood || !well.hasReagent) return 'Pending Reagents';
      if (!well.stirred) return 'Ready to Stir';
      return currentBlood.agglutinatesWith[wellKey] ? 'Agglutination (+)' : 'No Reaction (-)';
    };

    if (wellA_Val) {
      wellA_Val.textContent = formatWellStatus('A');
      wellA_Val.style.color = (state.wells.A.stirred && currentBlood.agglutinatesWith.A) ? '#DC2626' : 'var(--text-main)';
    }
    if (wellB_Val) {
      wellB_Val.textContent = formatWellStatus('B');
      wellB_Val.style.color = (state.wells.B.stirred && currentBlood.agglutinatesWith.B) ? '#DC2626' : 'var(--text-main)';
    }
    if (wellD_Val) {
      wellD_Val.textContent = formatWellStatus('D');
      wellD_Val.style.color = (state.wells.D.stirred && currentBlood.agglutinatesWith.D) ? '#DC2626' : 'var(--text-main)';
    }

    if (deducedTypeVal) {
      if (allStirred) {
        deducedTypeVal.textContent = currentBlood.label;
        deducedTypeVal.style.color = '#0284C7';
      } else {
        deducedTypeVal.textContent = 'Pending Completion';
        deducedTypeVal.style.color = 'var(--text-muted)';
      }
    }

    if (antigenListEl) {
      antigenListEl.textContent = allStirred ? currentBlood.antigens.join(', ') : '--';
    }
    if (antibodyListEl) {
      antibodyListEl.textContent = allStirred ? currentBlood.antibodies.join(', ') : '--';
    }

    // Donor & Recipient Compatibility Chips
    if (donorTagsEl && allStirred) {
      donorTagsEl.innerHTML = currentBlood.canReceiveFrom.map((grp) =>
        `<span class="blood-chip compatible">${grp}</span>`
      ).join('');
    } else if (donorTagsEl) {
      donorTagsEl.innerHTML = '<span style="font-size: 12px; color: var(--text-muted);">Perform test to reveal compatibility</span>';
    }

    if (recipientTagsEl && allStirred) {
      recipientTagsEl.innerHTML = currentBlood.canDonateTo.map((grp) =>
        `<span class="blood-chip compatible">${grp}</span>`
      ).join('');
    } else if (recipientTagsEl) {
      recipientTagsEl.innerHTML = '<span style="font-size: 12px; color: var(--text-muted);">Perform test to reveal compatibility</span>';
    }
  }

  // --- Animation Loop ---
  function animate() {
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

    const geom = getPlateGeometry();
    drawPorcelainPlate(geom);
    drawWellCavities(geom);
    drawMicroscopeOverlay(geom);

    ctx.restore();

    updateTelemetry();
    requestAnimationFrame(animate);
  }

  // --- Canvas Pointer / Hit Testing ---
  function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const geom = getPlateGeometry();
    const { wellPositions } = geom;

    // Check hit on Well A, B, or D
    ['A', 'B', 'D'].forEach((key) => {
      const pos = wellPositions[key];
      const dist = Math.hypot(x - pos.x, y - pos.y);
      if (dist <= pos.r + 5) {
        interactWithWell(key);
        state.microscopeWell = key;
      }
    });
  }

  // --- Tool Selection Handlers ---
  function setTool(toolName) {
    audio.init();
    state.selectedTool = toolName;
    audio.playDrop();

    Object.keys(toolButtons).forEach((key) => {
      if (toolButtons[key]) {
        toolButtons[key].classList.toggle('active', key === toolName);
      }
    });
  }

  // --- Initialization & Event Wiring ---
  function initDOM() {
    canvas = document.getElementById('simCanvas');
    ctx = canvas.getContext('2d');

    patientSelect = document.getElementById('patientSelect');
    autoTestBtn = document.getElementById('autoTestBtn');
    resetBtn = document.getElementById('resetBtn');

    wellA_Val = document.getElementById('wellA_Val');
    wellB_Val = document.getElementById('wellB_Val');
    wellD_Val = document.getElementById('wellD_Val');
    deducedTypeVal = document.getElementById('deducedTypeVal');

    antigenListEl = document.getElementById('antigenListEl');
    antibodyListEl = document.getElementById('antibodyListEl');
    donorTagsEl = document.getElementById('donorTagsEl');
    recipientTagsEl = document.getElementById('recipientTagsEl');

    helpBtn = document.getElementById('helpBtn');
    helpModal = document.getElementById('helpModal');
    modalCloseBtn = document.getElementById('modalCloseBtn');

    toolButtons = {
      blood: document.getElementById('toolBlood'),
      'anti-a': document.getElementById('toolAntiA'),
      'anti-b': document.getElementById('toolAntiB'),
      'anti-d': document.getElementById('toolAntiD'),
      stir: document.getElementById('toolStir')
    };

    // Tool click listeners
    Object.keys(toolButtons).forEach((key) => {
      if (toolButtons[key]) {
        toolButtons[key].addEventListener('click', () => setTool(key));
      }
    });

    // Patient Dropdown
    if (patientSelect) {
      patientSelect.addEventListener('change', (e) => {
        state.patientType = e.target.value;
        resetPlate();
      });
    }

    // Auto Test Button
    if (autoTestBtn) {
      autoTestBtn.addEventListener('click', autoTestAll);
    }

    // Reset Button
    if (resetBtn) {
      resetBtn.addEventListener('click', resetPlate);
    }

    // Canvas click
    canvas.addEventListener('click', handleCanvasClick);

    // Modal listeners
    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => {
        helpModal.classList.add('open');
        audio.playDrop();
      });
    }
    if (modalCloseBtn && helpModal) {
      modalCloseBtn.addEventListener('click', () => {
        helpModal.classList.remove('open');
        audio.playDrop();
      });
    }
    if (helpModal) {
      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
          helpModal.classList.remove('open');
        }
      });
    }

    // Initialize clumps
    ['A', 'B', 'D'].forEach(initClumpParticles);

    // Initial render
    setTool('blood');
    requestAnimationFrame(animate);
  }

  window.addEventListener('DOMContentLoaded', initDOM);
})();
