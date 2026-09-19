/**
 * PhysicsLab - UI Synchronization, Pedagogical Inspector & Control Handlers
 * Tailored for Class 9–12 STEM Physics: conversational, step-by-step, and intuitive.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  // Sync control badges with slider values
  lab.updateControlBadges = function() {
    const s = lab.state;
    const cfg = lab.getConfig();

    // Incident Angle
    if ($('outAngle')) $('outAngle').textContent = `${cfg.incidentAngle.toFixed(1)}°`;

    // Prism Apex Angle
    if ($('outPrismAngle')) $('outPrismAngle').textContent = `${Math.round(cfg.prismAngle)}°`;

    // Refractive Index n
    if ($('outN')) $('outN').textContent = cfg.n.toFixed(3);

    // Laser Wavelength
    if ($('outWavelength')) {
      $('outWavelength').textContent = `${cfg.wavelength} nm`;
      $('outWavelength').style.color = lab.wavelengthToRGB(cfg.wavelength).hex;
    }

    // Material formula / note
    if ($('opticsFormulaNote')) {
      const crit = (Math.asin(1.0 / cfg.n) * 180.0 / Math.PI).toFixed(1);
      $('opticsFormulaNote').innerHTML = `💡 <b>${cfg.materialKey.toUpperCase()}</b>: Refractive Index n = <b>${cfg.n.toFixed(3)}</b> | Critical Angle θ<sub>c</sub> = <b>${crit}°</b>`;
    }
  };

  // Update Live Teacher Card & Student Telemetry Gauges
  lab.updateUI = function() {
    lab.updateControlBadges();

    const s = lab.state;
    const tel = s.telemetry;
    const cfg = lab.getConfig();

    // 1. Update Telemetry Gauges
    if ($('gaugeIncidence')) $('gaugeIncidence').textContent = `${tel.i.toFixed(1)}°`;
    if ($('gaugeRefraction')) $('gaugeRefraction').textContent = `${tel.r1.toFixed(1)}°`;
    if ($('gaugeInternal')) $('gaugeInternal').textContent = `${tel.r2.toFixed(1)}°`;

    if ($('gaugeEmergence')) {
      $('gaugeEmergence').textContent = tel.isTIR ? 'TIR (None)' : `${tel.e.toFixed(1)}°`;
      $('gaugeEmergence').style.color = tel.isTIR ? '#dc2626' : '#d97706';
    }

    if ($('gaugeDeviation')) {
      $('gaugeDeviation').textContent = tel.isTIR ? 'TIR (None)' : `${tel.delta.toFixed(1)}°`;
      $('gaugeDeviation').style.color = tel.isTIR ? '#dc2626' : '#7c3aed';
    }

    if ($('gaugeCritical')) $('gaugeCritical').textContent = `${tel.criticalAngle.toFixed(1)}°`;

    // 2. Update Teacher Card Concept Badge & Plain English Pedagogical Summary
    if (tel.isTIR) {
      if ($('teacherBadge')) {
        $('teacherBadge').textContent = '🪞 Total Internal Reflection (TIR)';
        $('teacherBadge').className = 'teacher-badge red';
        $('teacherBadge').style.background = '#fef2f2';
        $('teacherBadge').style.color = '#dc2626';
        $('teacherBadge').style.borderColor = '#fecaca';
      }
      if ($('teacherExplanation')) {
        $('teacherExplanation').innerHTML = `Light hit Face 2 at an internal angle <b>r₂ = ${tel.r2.toFixed(1)}°</b>, which is <b>greater than the critical angle θ<sub>c</sub> = ${tel.criticalAngle.toFixed(1)}°</b>! Instead of refracting outside into air, the ray reflects 100% internally back into the glass.`;
      }
    } else if (tel.isMinDev) {
      if ($('teacherBadge')) {
        $('teacherBadge').textContent = '🎯 Minimum Deviation Position (i = e)';
        $('teacherBadge').className = 'teacher-badge green';
        $('teacherBadge').style.background = '#ecfdf5';
        $('teacherBadge').style.color = '#059669';
        $('teacherBadge').style.borderColor = '#a7f3d0';
      }
      if ($('teacherExplanation')) {
        $('teacherExplanation').innerHTML = `<b>Minimum Deviation (D<sub>min</sub> = ${tel.minDeviationAngle.toFixed(1)}°) achieved!</b> The light travels perfectly horizontally and symmetrically inside the prism. Angle of incidence equals angle of emergence (<i>i</i> = <i>e</i> = ${tel.i.toFixed(1)}°) and <i>r</i>₁ = <i>r</i>₂ = ${tel.r1.toFixed(1)}°.`;
      }
    } else if (cfg.lightType === 'white') {
      if ($('teacherBadge')) {
        $('teacherBadge').textContent = '🌈 Chromatic Dispersion of White Light';
        $('teacherBadge').className = 'teacher-badge purple';
        $('teacherBadge').style.background = '#f5f3ff';
        $('teacherBadge').style.color = '#7c3aed';
        $('teacherBadge').style.borderColor = '#ddd6fe';
      }
      if ($('teacherExplanation')) {
        $('teacherExplanation').innerHTML = `White light is made of all colors. In glass, <b>Violet light travels slower</b> (speed <i>v</i> = <i>c</i> / <i>n</i>) and has a higher refractive index (<i>n</i> &approx; ${(cfg.n + 0.015).toFixed(3)}), so it <b>bends the most</b>. <b>Red light travels faster</b> and bends the least, fanning out into the beautiful VIBGYOR rainbow spectrum!`;
      }
    } else {
      if ($('teacherBadge')) {
        $('teacherBadge').textContent = "⚡ Snell's Law & Refraction of Light";
        $('teacherBadge').className = 'teacher-badge blue';
        $('teacherBadge').style.background = '#eff6ff';
        $('teacherBadge').style.color = '#2563eb';
        $('teacherBadge').style.borderColor = '#bfdbfe';
      }
      if ($('teacherExplanation')) {
        $('teacherExplanation').innerHTML = `A monochromatic laser beam bends toward the normal at Face 1 as it enters the denser glass (<i>n</i> = ${cfg.n.toFixed(3)}), then bends away from the normal at Face 2 as it emerges back into air, producing total deviation <b>&delta; = ${tel.delta.toFixed(1)}°</b>.`;
      }
    }

    // 3. Step Breakdown Boxes
    if ($('stepIncidence')) $('stepIncidence').textContent = `${tel.i.toFixed(1)}°`;
    if ($('stepRefraction')) $('stepRefraction').textContent = `${tel.r1.toFixed(1)}°`;
    if ($('stepRefractionSub')) $('stepRefractionSub').textContent = `sin r₁ = sin(${Math.round(tel.i)}°) / ${cfg.n.toFixed(2)}`;

    if ($('stepInternal')) $('stepInternal').textContent = `${tel.r2.toFixed(1)}°`;
    if ($('stepInternalSub')) $('stepInternalSub').textContent = tel.isTIR ? `r₂ > θ_c (${tel.criticalAngle.toFixed(1)}°)` : `r₂ < θ_c (${tel.criticalAngle.toFixed(1)}°)`;

    if ($('stepDeviation')) $('stepDeviation').textContent = tel.isTIR ? 'TIR' : `${tel.delta.toFixed(1)}°`;
    if ($('stepDeviationSub')) $('stepDeviationSub').textContent = tel.isTIR ? 'Reflected Internally' : `δ = i + e - A`;
  };

  // Wire up all UI Event Listeners
  lab.initUIListeners = function() {
    // Mode Switcher Tabs
    const tabSimple = $('tabSimple');
    const tabAdvanced = $('tabAdvanced');
    const simpleView = $('simpleLabView');
    const advancedView = $('advancedLabView');

    if (tabSimple && tabAdvanced) {
      tabSimple.addEventListener('click', () => {
        tabSimple.classList.add('active');
        tabAdvanced.classList.remove('active');
        if (simpleView) simpleView.style.display = 'block';
        if (advancedView) advancedView.style.display = 'none';
        lab.resizeCanvas();
        lab.drawScene();
      });

      tabAdvanced.addEventListener('click', () => {
        tabAdvanced.classList.add('active');
        tabSimple.classList.remove('active');
        if (simpleView) simpleView.style.display = 'none';
        if (advancedView) advancedView.style.display = 'flex';
        requestAnimationFrame(() => {
          lab.resizeGraphs();
          lab.drawGraphs();
        });
        setTimeout(() => {
          lab.resizeGraphs();
          lab.drawGraphs();
        }, 60);
      });
    }

    // Playback Controls
    const btnPlay = $('btnPlay');
    const btnPause = $('btnPause');
    const btnReset = $('btnReset');
    const btnStep = $('btnStep');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        lab.state.beamActive = !lab.state.beamActive;
        btnPlay.textContent = lab.state.beamActive ? '⚡ Light Beam ON' : '⚪ Light Beam OFF';
        btnPlay.classList.toggle('active-beam', lab.state.beamActive);
        lab.drawScene();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', lab.resetSim);
    }

    const btnResetDefaults = $('btnResetDefaults');
    if (btnResetDefaults) {
      btnResetDefaults.addEventListener('click', lab.resetSim);
    }

    if (btnStep) {
      btnStep.addEventListener('click', () => {
        // Step incident angle by +2 degrees
        let cur = Number(lab.state.incidentAngle);
        cur = (cur + 2 > 80) ? 15 : cur + 2;
        lab.state.incidentAngle = cur;
        if ($('slAngle')) $('slAngle').value = cur;
        lab.state.torchUserPos = null;
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    }

    // Stage Toolbar Toggles
    const toggles = [
      { id: 'chkNormals', key: 'showNormals' },
      { id: 'chkAngles', key: 'showAngles' },
      { id: 'chkVirtualRays', key: 'showVirtualRays' },
      { id: 'chkProtractor', key: 'showProtractor' },
      { id: 'chkScreen', key: 'showScreen' }
    ];

    toggles.forEach(t => {
      const el = $(t.id);
      if (el) {
        el.addEventListener('change', e => {
          lab.state[t.key] = e.target.checked;
          lab.drawScene();
        });
      }
    });

    // Light Type Tabs (White Light vs Laser)
    const tabWhite = $('tabLightWhite');
    const tabLaser = $('tabLightLaser');
    const laserControls = $('laserWavelengthControl');

    if (tabWhite && tabLaser) {
      tabWhite.addEventListener('click', () => {
        tabWhite.classList.add('active');
        tabLaser.classList.remove('active');
        lab.state.lightType = 'white';
        if (laserControls) laserControls.style.display = 'none';
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });

      tabLaser.addEventListener('click', () => {
        tabLaser.classList.add('active');
        tabWhite.classList.remove('active');
        lab.state.lightType = 'laser';
        if (laserControls) laserControls.style.display = 'block';
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    }

    // Incident Angle Slider
    const slAngle = $('slAngle');
    if (slAngle) {
      slAngle.addEventListener('input', e => {
        lab.state.incidentAngle = Number(e.target.value);
        lab.state.torchUserPos = null; // reset custom drag position
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    }

    // Incident Angle Presets
    document.querySelectorAll('[data-angle]').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('[data-angle]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const ang = Number(btn.getAttribute('data-angle'));
        lab.state.incidentAngle = ang;
        if (slAngle) slAngle.value = ang;
        lab.state.torchUserPos = null;
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    });

    // Auto-Align to Minimum Deviation
    const btnMinDev = $('btnAngleMinDev');
    if (btnMinDev) {
      btnMinDev.addEventListener('click', () => {
        const cfg = lab.getConfig();
        const sinHalfA = Math.sin((cfg.prismAngle * Math.PI) / 360.0);
        const sinTerm = cfg.n * sinHalfA;
        if (sinTerm <= 1.0) {
          const dMin = (2.0 * Math.asin(sinTerm) - (cfg.prismAngle * Math.PI) / 180.0) * (180.0 / Math.PI);
          const iMin = (cfg.prismAngle + dMin) / 2.0;
          lab.state.incidentAngle = Number(iMin.toFixed(1));
          if (slAngle) slAngle.value = lab.state.incidentAngle;
          lab.state.torchUserPos = null;
          lab.drawScene();
          lab.drawGraphs();
          lab.updateUI();
        }
      });
    }

    // Wavelength Slider
    const slWavelength = $('slWavelength');
    if (slWavelength) {
      slWavelength.addEventListener('input', e => {
        lab.state.wavelength = Number(e.target.value);
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    }

    // Wavelength Color Presets
    document.querySelectorAll('[data-wl]').forEach(btn => {
      btn.addEventListener('click', () => {
        const wl = Number(btn.getAttribute('data-wl'));
        lab.state.wavelength = wl;
        if (slWavelength) slWavelength.value = wl;
        if (tabLaser) tabLaser.click();
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    });

    // Material Selection Cards
    document.querySelectorAll('.material-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.material-card-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const matKey = btn.getAttribute('data-material');
        const mat = lab.materials[matKey];
        if (mat) {
          lab.state.currentMaterialKey = matKey;
          lab.state.prismRefractiveIndex = mat.n;
          lab.state.cauchyB = mat.cauchyB;

          if ($('slN')) $('slN').value = mat.n;
          lab.drawScene();
          lab.drawGraphs();
          lab.updateUI();
        }
      });
    });

    // Refractive Index Slider
    const slN = $('slN');
    if (slN) {
      slN.addEventListener('input', e => {
        lab.state.prismRefractiveIndex = Number(e.target.value);
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    }

    // Prism Apex Angle Slider & Presets
    const slApex = $('slPrismAngle');
    if (slApex) {
      slApex.addEventListener('input', e => {
        lab.state.prismAngle = Number(e.target.value);
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    }

    document.querySelectorAll('[data-apex]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-apex]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const apex = Number(btn.getAttribute('data-apex'));
        lab.state.prismAngle = apex;
        if (slApex) slApex.value = apex;
        lab.drawScene();
        lab.drawGraphs();
        lab.updateUI();
      });
    });

    // Export CSV Button
    const btnExport = $('exportCsvBtn');
    if (btnExport) {
      btnExport.addEventListener('click', lab.exportToCsv);
    }
  };

})(window.PhysicsLab);
