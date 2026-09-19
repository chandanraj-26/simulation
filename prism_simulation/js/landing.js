/**
 * PhysicsLab - Introductory Lesson & Animated Optics Theater Controller
 * Manages the frosted-glass dissolve overlay, interactive visual lesson, and audio narration.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  let theaterCanvas, theaterCtx;
  let theaterRafId = 0;
  let theaterStartTime = 0;
  let isNarrating = false;

  const landingTorchImg = new Image();
  landingTorchImg.src = 'torch.png';

  lab.closeLandingAndEnterLab = function() {
    const landingOverlay = $('videoLandingOverlay');
    if (landingOverlay) {
      landingOverlay.classList.add('landing-hidden');
    }
    cancelAnimationFrame(theaterRafId);

    // Stop speech narration if playing
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Refresh canvas sizing after transition
    setTimeout(() => {
      lab.resizeCanvas();
      lab.drawScene();
      lab.resizeGraphs();
      lab.drawGraphs();
    }, 460);
  };

  lab.openLandingVideo = function() {
    const landingOverlay = $('videoLandingOverlay');
    if (landingOverlay) {
      landingOverlay.classList.remove('landing-hidden');
      landingOverlay.scrollTop = 0;
    }
    lab.startTheaterAnimation();
    lab.playLessonAudio();
  };

  // Web Speech API Voice Narration
  lab.playLessonAudio = function() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const lessonText = "Welcome to PhysicsLab. When white light passes through a glass prism, different colors travel at different speeds. Violet light slows down the most and bends the most, while red light bends the least, splitting light into the visible VIBGYOR rainbow spectrum.";
    const utterance = new SpeechSynthesisUtterance(lessonText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (engVoice) utterance.voice = engVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Interactive Animated Optics Theater inside the Modal
  lab.startTheaterAnimation = function() {
    theaterCanvas = $('theaterCanvas');
    if (!theaterCanvas) return;
    theaterCtx = theaterCanvas.getContext('2d');

    const rect = theaterCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    theaterCanvas.width = Math.round(rect.width * dpr);
    theaterCanvas.height = Math.round(rect.height * dpr);

    theaterStartTime = performance.now();
    cancelAnimationFrame(theaterRafId);
    theaterRafId = requestAnimationFrame(renderTheaterLoop);
  };

  function renderTheaterLoop(now) {
    if (!theaterCanvas || !theaterCtx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = theaterCanvas.width / dpr;
    const h = theaterCanvas.height / dpr;

    theaterCtx.setTransform(1, 0, 0, 1, 0, 0);
    theaterCtx.clearRect(0, 0, theaterCanvas.width, theaterCanvas.height);
    theaterCtx.scale(dpr, dpr);

    const elapsed = (now - theaterStartTime) / 1000.0;

    // Dark cinematic laboratory background
    const bgGrad = theaterCtx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, w * 0.7);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#090d16');
    theaterCtx.fillStyle = bgGrad;
    theaterCtx.fillRect(0, 0, w, h);

    // Prism coordinates
    const px = w * 0.48;
    const py = h * 0.52;
    const pSize = Math.min(w * 0.28, h * 0.65);
    const top = { x: px, y: py - pSize * 0.5 };
    const left = { x: px - pSize * 0.55, y: py + pSize * 0.45 };
    const right = { x: px + pSize * 0.55, y: py + pSize * 0.45 };

    // Draw Glass Prism with Caustic Reflections
    theaterCtx.save();
    theaterCtx.shadowColor = 'rgba(147, 197, 253, 0.4)';
    theaterCtx.shadowBlur = 30;

    const prismGrad = theaterCtx.createLinearGradient(left.x, left.y, right.x, top.y);
    prismGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    prismGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.22)');
    prismGrad.addColorStop(1, 'rgba(255, 255, 255, 0.28)');

    theaterCtx.fillStyle = prismGrad;
    theaterCtx.strokeStyle = 'rgba(147, 197, 253, 0.8)';
    theaterCtx.lineWidth = 2.5;

    theaterCtx.beginPath();
    theaterCtx.moveTo(top.x, top.y);
    theaterCtx.lineTo(right.x, right.y);
    theaterCtx.lineTo(left.x, left.y);
    theaterCtx.closePath();
    theaterCtx.fill();
    theaterCtx.stroke();
    theaterCtx.restore();

    // Incident White Light Beam shooting in from left
    const torchPos = { x: w * 0.12, y: h * 0.62 };
    const hitP1 = { x: (left.x + top.x) / 2 + 10, y: (left.y + top.y) / 2 + 8 };

    theaterCtx.save();
    theaterCtx.shadowColor = '#ffffff';
    theaterCtx.shadowBlur = 18;
    theaterCtx.strokeStyle = '#ffffff';
    theaterCtx.lineWidth = 4;
    theaterCtx.beginPath();
    theaterCtx.moveTo(torchPos.x, torchPos.y);
    theaterCtx.lineTo(hitP1.x, hitP1.y);
    theaterCtx.stroke();
    theaterCtx.restore();

    // Draw torch light source in theater
    if (landingTorchImg.complete && landingTorchImg.naturalWidth > 0) {
      theaterCtx.save();
      const tDir = { x: hitP1.x - torchPos.x, y: hitP1.y - torchPos.y };
      const tAngle = Math.atan2(tDir.y, tDir.x);
      theaterCtx.translate(torchPos.x, torchPos.y);
      theaterCtx.rotate(tAngle);
      const tW = 92;
      const tScale = tW / landingTorchImg.naturalWidth;
      const tH = landingTorchImg.naturalHeight * tScale;
      theaterCtx.drawImage(landingTorchImg, -825 * tScale, -444 * tScale, tW, tH);

      // Glowing lens aperture
      theaterCtx.fillStyle = '#ffffff';
      theaterCtx.shadowColor = '#ffffff';
      theaterCtx.shadowBlur = 16;
      theaterCtx.beginPath();
      theaterCtx.ellipse(0, 0, 3, 12, 0, 0, Math.PI * 2);
      theaterCtx.fill();
      theaterCtx.restore();
    }

    // Internal Refracted Rainbow & Emergent Dispersion Fan
    const colors = [
      { name: 'Red',    color: '#ef4444', devY: -28 },
      { name: 'Orange', color: '#f97316', devY: -16 },
      { name: 'Yellow', color: '#eab308', devY: -4 },
      { name: 'Green',  color: '#10b981', devY: 8 },
      { name: 'Blue',   color: '#3b82f6', devY: 20 },
      { name: 'Indigo', color: '#6366f1', devY: 32 },
      { name: 'Violet', color: '#a855f7', devY: 45 }
    ];

    const screenX = w * 0.86;

    // Draw fan polygon on right
    theaterCtx.save();
    const fanGrad = theaterCtx.createLinearGradient(hitP1.x, hitP1.y, screenX, h * 0.5);
    fanGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    fanGrad.addColorStop(1, 'rgba(168, 85, 247, 0.35)');

    theaterCtx.fillStyle = fanGrad;
    theaterCtx.beginPath();
    theaterCtx.moveTo(hitP1.x, hitP1.y);
    theaterCtx.lineTo(screenX, (right.y + top.y) / 2 + colors[0].devY * 2.2);
    theaterCtx.lineTo(screenX, (right.y + top.y) / 2 + colors[colors.length - 1].devY * 2.2);
    theaterCtx.closePath();
    theaterCtx.fill();

    // Individual glowing spectral rays
    colors.forEach(c => {
      const p2 = { x: (right.x + top.x) / 2 + c.devY * 0.25, y: (right.y + top.y) / 2 + c.devY * 0.4 };
      const screenPt = { x: screenX, y: (right.y + top.y) / 2 + c.devY * 2.2 };

      theaterCtx.strokeStyle = c.color;
      theaterCtx.shadowColor = c.color;
      theaterCtx.shadowBlur = 10;
      theaterCtx.lineWidth = 2.4;

      // Inside prism
      theaterCtx.beginPath();
      theaterCtx.moveTo(hitP1.x, hitP1.y);
      theaterCtx.lineTo(p2.x, p2.y);
      theaterCtx.stroke();

      // Emergent ray
      theaterCtx.beginPath();
      theaterCtx.moveTo(p2.x, p2.y);
      theaterCtx.lineTo(screenPt.x, screenPt.y);
      theaterCtx.stroke();
    });

    // Observation Screen on the right
    theaterCtx.fillStyle = '#f8fafc';
    theaterCtx.shadowColor = 'transparent';
    theaterCtx.fillRect(screenX, h * 0.15, 8, h * 0.7);

    // Spectrum on the screen
    const screenGrad = theaterCtx.createLinearGradient(0, (right.y + top.y) / 2 + colors[0].devY * 2.2 - 6, 0, (right.y + top.y) / 2 + colors[colors.length - 1].devY * 2.2 + 6);
    colors.forEach((c, idx) => {
      screenGrad.addColorStop(idx / (colors.length - 1), c.color);
    });
    theaterCtx.fillStyle = screenGrad;
    theaterCtx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    theaterCtx.shadowBlur = 14;
    theaterCtx.fillRect(screenX - 4, (right.y + top.y) / 2 + colors[0].devY * 2.2 - 4, 12, (colors[colors.length - 1].devY - colors[0].devY) * 2.2 + 8);

    // Labels
    theaterCtx.font = '700 12px Plus Jakarta Sans, sans-serif';
    theaterCtx.fillStyle = '#ffffff';
    theaterCtx.textAlign = 'left';
    theaterCtx.fillText('White Light (Polychromatic)', torchPos.x, torchPos.y - 14);
    theaterCtx.fillText('VIBGYOR Rainbow Spectrum', screenX - 60, h * 0.12);

    theaterCtx.restore();

    theaterRafId = requestAnimationFrame(renderTheaterLoop);
  }

  lab.initLanding = function() {
    const btnEnterLab = $('btnEnterLab');
    const btnSkipToLab = $('btnSkipToLab');
    const btnOpenIntroVideo = $('btnOpenIntroVideo');
    const btnReplayVideo = $('btnReplayVideo');

    if (btnEnterLab) btnEnterLab.addEventListener('click', lab.closeLandingAndEnterLab);
    if (btnSkipToLab) btnSkipToLab.addEventListener('click', lab.closeLandingAndEnterLab);
    if (btnOpenIntroVideo) btnOpenIntroVideo.addEventListener('click', lab.openLandingVideo);

    if (btnReplayVideo) {
      btnReplayVideo.addEventListener('click', () => {
        lab.startTheaterAnimation();
        lab.playLessonAudio();
      });
    }

    // Start theater animation & voice narration on load
    lab.startTheaterAnimation();

    // Trigger audio on first interaction if browser blocks auto-speech
    const triggerAudioOnce = () => {
      lab.playLessonAudio();
      window.removeEventListener('click', triggerAudioOnce);
      window.removeEventListener('touchstart', triggerAudioOnce);
      window.removeEventListener('keydown', triggerAudioOnce);
    };

    window.addEventListener('click', triggerAudioOnce, { once: true });
    window.addEventListener('touchstart', triggerAudioOnce, { once: true });
    window.addEventListener('keydown', triggerAudioOnce, { once: true });
  };

})(window.PhysicsLab);
