/**
 * PhysicsLab - Main Interactive Wireup & Application Controller
 * Handles student interactions, mode switching, planet selections, and playback.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  function setupModeTabs() {
    const tabSimple = $('tabSimple');
    const tabAdvanced = $('tabAdvanced');
    const simpleLabView = $('simpleLabView');
    const advancedLabView = $('advancedLabView');

    if (tabSimple && tabAdvanced) {
      tabSimple.addEventListener('click', () => {
        tabSimple.classList.add('active');
        tabAdvanced.classList.remove('active');
        if (simpleLabView) simpleLabView.style.display = 'block';
        if (advancedLabView) advancedLabView.classList.remove('active-view');
        setTimeout(() => {
          lab.drawScene();
        }, 50);
      });

      tabAdvanced.addEventListener('click', () => {
        tabAdvanced.classList.add('active');
        tabSimple.classList.remove('active');
        if (advancedLabView) advancedLabView.classList.add('active-view');
        setTimeout(() => {
          lab.drawGraphs();
          lab.drawScene();
        }, 50);
      });
    }
  }

  function setupPlanetSelector() {
    document.querySelectorAll('.planet-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.planet-card-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const gVal = btn.dataset.g;
        if ($('slGravity')) $('slGravity').value = gVal;

        if (!lab.state.running) {
          lab.autoReadyForLaunch();
        } else {
          lab.updateControlBadges();
          lab.updateUI();
          lab.drawScene();
          lab.drawGraphs();
        }
      });
    });
  }

  function setupControls() {
    // Sliders: immediately auto-ready rocket with new setting if not actively flying
    ['slMass', 'slThrust', 'slAngle', 'slSide', 'slFuel', 'slGravity'].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (!lab.state.running) {
          lab.autoReadyForLaunch();
        } else {
          lab.updateControlBadges();
          lab.updateUI();
          lab.drawScene();
          lab.drawGraphs();
        }
      });
    });

    // Quick Thrust Presets
    if ($('btnThrustZero')) {
      $('btnThrustZero').addEventListener('click', () => {
        $('slThrust').value = 0;
        document.querySelectorAll('.preset-button-row .btn-preset').forEach(b => b.classList.remove('active'));
        $('btnThrustZero').classList.add('active');
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    }

    if ($('btnThrustHover')) {
      $('btnThrustHover').addEventListener('click', () => {
        const cfg = lab.getConfig();
        const hoverThrust = Math.round(cfg.mass * cfg.gravity);
        $('slThrust').value = hoverThrust;
        document.querySelectorAll('.preset-button-row .btn-preset').forEach(b => b.classList.remove('active'));
        $('btnThrustHover').classList.add('active');
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    }

    if ($('btnThrustLiftoff')) {
      $('btnThrustLiftoff').addEventListener('click', () => {
        $('slThrust').value = 50000;
        document.querySelectorAll('.preset-button-row .btn-preset').forEach(b => b.classList.remove('active'));
        $('btnThrustLiftoff').classList.add('active');
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    }

    // Quick Mass Presets
    document.querySelectorAll('[data-mass]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-mass]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $('slMass').value = btn.dataset.mass;
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    });

    // Quick Launch Angle Presets
    document.querySelectorAll('[data-angle]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-angle]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if ($('slAngle')) $('slAngle').value = btn.dataset.angle;
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    });

    // Sync angle slider with buttons
    if ($('slAngle')) {
      $('slAngle').addEventListener('input', () => {
        const val = +$('slAngle').value;
        document.querySelectorAll('[data-angle]').forEach(btn => {
          btn.classList.toggle('active', +btn.dataset.angle === val);
        });
      });
    }

    // Quick Fuel Tank Presets
    if ($('btnFuelLow')) {
      $('btnFuelLow').addEventListener('click', () => {
        if ($('btnFuelFull')) $('btnFuelFull').classList.remove('active');
        $('btnFuelLow').classList.add('active');
        if ($('chkInfiniteFuel')) $('chkInfiniteFuel').checked = false;
        if ($('slFuel')) $('slFuel').value = 35;
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    }

    if ($('btnFuelFull')) {
      $('btnFuelFull').addEventListener('click', () => {
        if ($('btnFuelLow')) $('btnFuelLow').classList.remove('active');
        $('btnFuelFull').classList.add('active');
        if ($('chkInfiniteFuel')) $('chkInfiniteFuel').checked = false;
        if ($('slFuel')) $('slFuel').value = 100;
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    }

    // Checkboxes (Force Arrows, Values, Exhaust, Infinite Fuel, Trail)
    ['chkForces', 'chkValues', 'chkReaction', 'chkInfiniteFuel', 'chkTrail'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('change', () => {
        if (!lab.state.running) lab.autoReadyForLaunch();
        else { lab.updateControlBadges(); lab.updateUI(); lab.drawScene(); }
      });
    });

    // Playback Buttons
    if ($('btnPlay')) $('btnPlay').addEventListener('click', lab.playSim);
    if ($('btnPause')) $('btnPause').addEventListener('click', lab.pauseSim);
    if ($('btnStep')) {
      $('btnStep').addEventListener('click', () => {
        if (lab.state.running) lab.pauseSim();
        lab.stepPhysics(0.1);
        lab.updateUI();
        lab.drawScene();
        lab.drawGraphs();
        if ($('simStatus')) {
          $('simStatus').textContent = 'STEPPED';
          $('simStatus').className = 'stage-status-badge';
        }
      });
    }
    if ($('btnReset')) $('btnReset').addEventListener('click', lab.resetSim);

    // Speed Selector
    document.querySelectorAll('.speed-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.speed-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        lab.state.simSpeedMultiplier = parseFloat(pill.dataset.speed);
      });
    });

    // Atmospheric Layer Pills (Advanced View)
    document.querySelectorAll('.atmo-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.atmo-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        lab.state.cameraManualLayer = pill.dataset.layer;
        lab.drawScene();
      });
    });

    // Reset All Defaults Button
    if ($('btnResetDefaults')) {
      $('btnResetDefaults').addEventListener('click', () => {
        if ($('slMass')) $('slMass').value = 3000;
        if ($('slThrust')) $('slThrust').value = 50000;
        if ($('slGravity')) $('slGravity').value = 9.8;
        if ($('slAngle')) $('slAngle').value = 0;
        if ($('slSide')) $('slSide').value = 0;
        if ($('slFuel')) $('slFuel').value = 100;
        if ($('chkInfiniteFuel')) $('chkInfiniteFuel').checked = false;
        if ($('chkForces')) $('chkForces').checked = true;
        if ($('chkValues')) $('chkValues').checked = true;
        if ($('chkReaction')) $('chkReaction').checked = true;
        if ($('chkTrail')) $('chkTrail').checked = true;

        // Reset planet cards active state
        document.querySelectorAll('.planet-card-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.g === '9.8');
        });

        // Reset mass pills active state
        document.querySelectorAll('[data-mass]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.mass === '3000');
        });

        // Reset angle buttons active state
        document.querySelectorAll('[data-angle]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.angle === '0');
        });

        // Reset fuel presets active state
        if ($('btnFuelFull')) $('btnFuelFull').classList.add('active');
        if ($('btnFuelLow')) $('btnFuelLow').classList.remove('active');

        lab.resetSim();
      });
    }

    // Export CSV Data
    if ($('exportCsvBtn')) {
      $('exportCsvBtn').addEventListener('click', () => {
        const historyData = lab.state.historyData;
        if (!historyData.length) {
          alert('Run the simulation first to record flight data!');
          return;
        }
        const rows = ['time_s,height_m,velocity_m_s,acceleration_m_s2,net_force_N,fuel_percent'];
        historyData.forEach(h => {
          rows.push([
            h.t.toFixed(2),
            h.y.toFixed(2),
            h.speed.toFixed(2),
            h.totalAccel.toFixed(2),
            h.netForce.toFixed(1),
            h.fuel.toFixed(1)
          ].join(','));
        });
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `physicslab-data-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Resize Handler
    window.addEventListener('resize', () => {
      lab.drawScene();
      lab.drawGraphs();
    });
  }

  // Application Boot Sequence
  lab.init = function() {
    setupModeTabs();
    setupPlanetSelector();
    setupControls();
    if (lab.initLanding) lab.initLanding();
    lab.updateControlBadges();
    lab.resetSim();
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lab.init);
  } else {
    lab.init();
  }
})(window.PhysicsLab);
