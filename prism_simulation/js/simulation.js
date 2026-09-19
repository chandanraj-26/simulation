/**
 * PhysicsLab - Simulation Lifecycle & Interactive Drag Controller
 * Manages tactile torch manipulation, canvas drag events, and the animation loop.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);
  const vec = lab.vec;

  let canvas;
  let isDragging = false;
  let dragTarget = null; // 'torch' or 'screen'

  lab.initSimulation = function() {
    canvas = $('simCanvas');
    if (!canvas) return;

    // Mouse & Touch Drag Handlers
    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    // Start continuous animation loop
    lab.state.lastTimestamp = performance.now();
    lab.state.rafId = requestAnimationFrame(lab.simLoop);
  };

  // Convert client coordinates to canvas internal coordinates
  function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handlePointerDown(e) {
    const pt = getCanvasCoords(e.clientX, e.clientY);
    checkDragStart(pt);
  }

  function handleTouchStart(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const pt = getCanvasCoords(touch.clientX, touch.clientY);
      if (checkDragStart(pt)) {
        e.preventDefault();
      }
    }
  }

  function checkDragStart(pt) {
    const rect = canvas.getBoundingClientRect();
    const optics = lab.solveOptics(rect.width, rect.height);

    // Check hit on torch lens or torch body/handle
    const distTorch = Math.hypot(pt.x - optics.torchPos.x, pt.y - optics.torchPos.y);
    const bodyCenter = lab.vec.sub(optics.torchPos, lab.vec.mul(optics.actualDir, 58));
    const distBody = Math.hypot(pt.x - bodyCenter.x, pt.y - bodyCenter.y);
    if (distTorch < 42 || distBody < 42) {
      isDragging = true;
      dragTarget = 'torch';
      canvas.style.cursor = 'grabbing';
      return true;
    }

    // Check hit on observation screen (x +/- 18px)
    if (Math.abs(pt.x - optics.screenX) < 22 && pt.y >= optics.screenTop.y && pt.y <= optics.screenBottom.y) {
      isDragging = true;
      dragTarget = 'screen';
      canvas.style.cursor = 'ew-resize';
      return true;
    }

    return false;
  }

  function handlePointerMove(e) {
    if (!isDragging) {
      // Hover cursor check
      if (!canvas) return;
      const pt = getCanvasCoords(e.clientX, e.clientY);
      const rect = canvas.getBoundingClientRect();
      const optics = lab.solveOptics(rect.width, rect.height);

      const distTorch = Math.hypot(pt.x - optics.torchPos.x, pt.y - optics.torchPos.y);
      const bodyCenter = lab.vec.sub(optics.torchPos, lab.vec.mul(optics.actualDir, 58));
      const distBody = Math.hypot(pt.x - bodyCenter.x, pt.y - bodyCenter.y);
      if (distTorch < 42 || distBody < 42) {
        canvas.style.cursor = 'grab';
      } else if (Math.abs(pt.x - optics.screenX) < 22 && pt.y >= optics.screenTop.y && pt.y <= optics.screenBottom.y) {
        canvas.style.cursor = 'ew-resize';
      } else {
        canvas.style.cursor = 'crosshair';
      }
      return;
    }

    const pt = getCanvasCoords(e.clientX, e.clientY);
    updateDrag(pt);
  }

  function handleTouchMove(e) {
    if (isDragging && e.touches.length > 0) {
      const touch = e.touches[0];
      const pt = getCanvasCoords(touch.clientX, touch.clientY);
      updateDrag(pt);
      e.preventDefault();
    }
  }

  function updateDrag(pt) {
    const rect = canvas.getBoundingClientRect();
    const optics = lab.solveOptics(rect.width, rect.height);

    if (dragTarget === 'torch') {
      // Calculate angle between torch position and Face 1 normal N1
      const targetPt = optics.targetPt;
      const dir = vec.norm(vec.sub(targetPt, pt));
      const N1 = optics.prism.norm1;

      // Incident angle i: angle between -dir and N1
      const dot = Math.max(-1, Math.min(1, -vec.dot(dir, N1)));
      let iDeg = (Math.acos(dot) * 180.0) / Math.PI;

      // Clamp i between 5° and 85°
      iDeg = Math.max(5, Math.min(85, iDeg));

      lab.state.incidentAngle = Number(iDeg.toFixed(1));
      lab.state.torchUserPos = null; // keep radius aligned

      if ($('slAngle')) $('slAngle').value = lab.state.incidentAngle;

      lab.drawScene();
      lab.drawGraphs();
      lab.updateUI();

    } else if (dragTarget === 'screen') {
      const baseScreenX = rect.width * 0.88;
      const offset = pt.x - baseScreenX;
      lab.state.screenDistanceOffset = Math.max(-120, Math.min(60, offset));
      lab.drawScene();
    }
  }

  function handlePointerUp() {
    isDragging = false;
    dragTarget = null;
    if (canvas) canvas.style.cursor = 'crosshair';
  }

  // Continuous animation loop
  lab.simLoop = function(now) {
    const deltaMs = now - lab.state.lastTimestamp;
    lab.state.lastTimestamp = now;

    lab.state.simTime += deltaMs / 1000.0;

    // Draw scene
    lab.drawScene();

    lab.state.rafId = requestAnimationFrame(lab.simLoop);
  };

  // Reset simulation to factory default settings
  lab.resetSim = function() {
    lab.state.beamActive = true;
    lab.state.lightType = 'white';
    lab.state.wavelength = 532;
    lab.state.incidentAngle = 48.0;
    lab.state.prismAngle = 60.0;
    lab.state.prismRefractiveIndex = 1.520;
    lab.state.cauchyB = 0.0045;
    lab.state.currentMaterialKey = 'crownglass';
    lab.state.torchUserPos = null;
    lab.state.screenDistanceOffset = 0;

    // Reset UI Inputs
    if ($('slAngle')) $('slAngle').value = 48.0;
    if ($('slPrismAngle')) $('slPrismAngle').value = 60.0;
    if ($('slN')) $('slN').value = 1.520;
    if ($('slWavelength')) $('slWavelength').value = 532;

    const tabWhite = $('tabLightWhite');
    if (tabWhite) tabWhite.click();

    const btnCrownglass = document.querySelector('[data-material="crownglass"]');
    if (btnCrownglass) btnCrownglass.click();

    const btnEquilateral = document.querySelector('[data-apex="60"]');
    if (btnEquilateral) btnEquilateral.click();

    const btnPlay = $('btnPlay');
    if (btnPlay) {
      btnPlay.textContent = '⚡ Light Beam ON';
      btnPlay.classList.add('active-beam');
    }

    lab.drawScene();
    lab.drawGraphs();
    lab.updateUI();
  };

})(window.PhysicsLab);
