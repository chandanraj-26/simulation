/**
 * CoasterLab — Main Application Entry Point & 60 FPS Kinematics Loop
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('coasterCanvas');
  if (!canvas) {
    console.error('Coaster canvas element not found!');
    return;
  }

  // 1. Initialize Renderer
  window.coasterRenderer = new CoasterRenderer(canvas);
  window.coasterRenderer.resize();

  // 2. Initialize UI Controller
  window.coasterUI = new CoasterUI();

  // Initial cart position
  window.simState.resetToTop(window.coasterRenderer.track);
  window.coasterUI.updateTelemetry();

  // 3. Window Resize Handler
  window.addEventListener('resize', () => {
    if (window.coasterRenderer) {
      window.coasterRenderer.resize();
    }
  });

  // 4. Audio Unlock on First User Gesture
  const unlockAudio = () => {
    if (window.soundEngine) window.soundEngine.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // 5. Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      const s = window.simState;
      if (s.status === 'IDLE' || s.status === 'FINISHED' || s.status === 'CRASHED') {
        window.coasterUI.dom.btnLaunch?.click();
      } else {
        window.coasterUI.dom.btnPause?.click();
      }
    } else if (e.code === 'KeyR') {
      window.coasterUI.dom.btnReset?.click();
    }
  });

  // Track loop entry audio flag
  let hasPlayedLoopEntrySound = false;

  // 6. Protected 60 FPS Numerical Kinematics & Animation Loop
  let lastTime = performance.now();

  function loop(currentTime) {
    try {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      // Clamp dt to [0.001, 0.05] s for numerical stability
      const dt = Math.max(0.001, Math.min(0.05, rawDt));

      const s = window.simState;
      const r = window.coasterRenderer;
      const track = r?.track;

      if (track) {
        const effectiveDt = dt * s.simSpeed;

        // --- STATE: RUNNING (On-Track Constrained Motion) ---
        if (s.status === 'RUNNING') {
          const sample = track.sampleAt(s.s);

          // Friction dissipation work increment
          if (s.isFrictionEnabled && s.friction > 0) {
            const dsEstimate = Math.max(0.1, s.v * effectiveDt);
            const dWf = Physics.getFrictionWorkIncrement(s.mass, s.friction, sample.angle, dsEstimate);
            s.frictionLoss += dWf;
            s.totalEnergy = Math.max(Physics.getPotentialEnergy(s.mass, sample.y), s.initialEnergy - s.frictionLoss);
          } else {
            s.totalEnergy = s.initialEnergy;
          }

          // Kinematics: calculate speed from energy
          s.v = Physics.getVelocity(s.totalEnergy, s.mass, sample.y);
          s.pe = Physics.getPotentialEnergy(s.mass, sample.y);
          s.ke = Physics.getKineticEnergy(s.mass, s.v);

          // Forces: Centripetal + Gravity normal
          s.normalForce = Physics.calculateNormalForce(s.mass, s.v, sample.curvature, sample.tx);
          s.gForce = Physics.calculateGForce(s.normalForce, s.mass);
          if (s.gForce > s.maxGForce) s.maxGForce = s.gForce;

          // Sound: update wind rushing
          const maxExpectedSpeed = Math.sqrt(2 * Physics.G * s.h0) || 1;
          if (window.soundEngine) {
            window.soundEngine.updateWind(s.v / maxExpectedSpeed);
          }

          // Trigger loop entry audio once when entering loop
          if (sample.segment === 'loop' && !hasPlayedLoopEntrySound) {
            hasPlayedLoopEntrySound = true;
            if (window.soundEngine) window.soundEngine.playLoopEntry();
          } else if (sample.segment !== 'loop') {
            hasPlayedLoopEntrySound = false;
          }

          // DETACHMENT CHECK: Did Normal Force drop to <= 0 inside the loop?
          if (sample.segment === 'loop' && s.normalForce <= 0 && s.s > track.loopStartS + 2) {
            // DETACHMENT OCCURS!
            s.status = 'FALLING';
            s.detachPoint = { x: sample.x, y: sample.y, s: s.s, v: s.v, angle: sample.angle };
            s.x = sample.x;
            s.y = sample.y;
            s.vx = s.v * sample.tx;
            s.vy = s.v * sample.ty;
            s.angle = sample.angle;
            s.tumbleSpeed = 4.5; // rad/s
            s.fallTrail = [{ x: s.x, y: s.y }];

            if (r) r.triggerDetachAnimation();
            if (window.soundEngine) {
              window.soundEngine.stopWind();
              window.soundEngine.playDetachClank();
            }
            if (window.coasterUI) {
              window.coasterUI.showToast('⚠ CART DETACHED: Normal Force N ≤ 0! Transitioned to projectile free-fall arc.', 'fail');
            }
          } else {
            // Advance along track
            const ds = s.v * effectiveDt;
            s.s += ds;

            const nextSample = track.sampleAt(s.s);
            s.x = nextSample.x;
            s.y = nextSample.y;
            s.angle = nextSample.angle;

            // Trail history
            s.trail.push({ x: s.x, y: s.y });
            if (s.trail.length > s.maxTrailPoints) s.trail.shift();

            // Finish line check
            if (s.s >= track.totalLength - 1.0) {
              s.status = 'FINISHED';
              s.v = 0;
              if (window.soundEngine) {
                window.soundEngine.stopWind();
                window.soundEngine.playSuccessFanfare();
              }
              if (r) r.spawnParticles(s.x, s.y + 2, 24, 'finish');
              if (window.coasterUI) {
                window.coasterUI.showToast('🏁 Run Complete! The cart cleared the loop and safely reached the brake run!', 'success');
              }
            }
          }
        }

        // --- STATE: FALLING (Ballistic Free-Fall Projectile Motion) ---
        else if (s.status === 'FALLING') {
          const hasImpacted = Physics.projectileStep(s, effectiveDt);
          s.fallTrail.push({ x: s.x, y: s.y });
          s.normalForce = 0;
          s.gForce = 0;
          s.pe = Physics.getPotentialEnergy(s.mass, s.y);
          s.ke = Physics.getKineticEnergy(s.mass, Math.hypot(s.vx, s.vy));

          if (hasImpacted) {
            s.status = 'CRASHED';
            s.crashTime = performance.now();
            if (window.soundEngine) window.soundEngine.playGroundCrash();
            if (r) r.spawnParticles(s.x, 0.5, 30, 'crash');

            // Show crash banner after short delay
            setTimeout(() => {
              if (window.coasterUI && s.status === 'CRASHED') {
                window.coasterUI.showCrashOverlay();
              }
            }, 350);
          }
        }
      }

      // Check Quests
      s.checkQuests();

      // Update UI Telemetry
      if (window.coasterUI) {
        window.coasterUI.updateTelemetry();
      }

      // Update Particles & Render
      if (r) {
        r.updateParticles(dt);
        r.render(s, dt);
      }
    } catch (err) {
      console.error('CoasterLab Loop Error:', err);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
  console.log('🎢 CoasterLab Initialized Successfully.');
});
