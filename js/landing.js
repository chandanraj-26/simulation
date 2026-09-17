/**
 * PhysicsLab - Video Landing Intro Controller
 * Controls the full-page video landing overlay, unmuted sound policy, and lab transition.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  lab.closeLandingAndEnterLab = function() {
    const introVideo = $('introVideo');
    const landingOverlay = $('videoLandingOverlay');

    if (introVideo) {
      introVideo.pause();
    }
    if (landingOverlay) {
      landingOverlay.classList.add('landing-hidden');
    }
    // Refresh canvas sizing after transition
    setTimeout(() => {
      lab.drawScene();
      lab.drawGraphs();
    }, 450);
  };

  lab.openLandingVideo = function() {
    const landingOverlay = $('videoLandingOverlay');
    const introVideo = $('introVideo');

    if (landingOverlay) {
      landingOverlay.classList.remove('landing-hidden');
      landingOverlay.scrollTop = 0;
    }
    if (introVideo) {
      introVideo.muted = false;
      introVideo.volume = 1.0;
      introVideo.currentTime = 0;
      introVideo.play().catch(() => {});
    }
  };

  lab.initLanding = function() {
    const btnEnterLab = $('btnEnterLab');
    const btnSkipToLab = $('btnSkipToLab');
    const btnOpenIntroVideo = $('btnOpenIntroVideo');
    const btnReplayVideo = $('btnReplayVideo');
    const introVideo = $('introVideo');

    if (btnEnterLab) btnEnterLab.addEventListener('click', lab.closeLandingAndEnterLab);
    if (btnSkipToLab) btnSkipToLab.addEventListener('click', lab.closeLandingAndEnterLab);
    if (btnOpenIntroVideo) btnOpenIntroVideo.addEventListener('click', lab.openLandingVideo);

    if (btnReplayVideo && introVideo) {
      btnReplayVideo.addEventListener('click', () => {
        introVideo.muted = false;
        introVideo.volume = 1.0;
        introVideo.currentTime = 0;
        introVideo.play().catch(() => {});
      });
    }

    if (introVideo) {
      // ALWAYS SOUND ON: Unmuted, full volume
      introVideo.muted = false;
      introVideo.volume = 1.0;

      const playPromise = introVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts unmuted autoplay before first user interaction,
          // trigger sound immediately on the very first touch, keypress, or click
          const startAudio = () => {
            introVideo.muted = false;
            introVideo.volume = 1.0;
            introVideo.play().catch(() => {});
            window.removeEventListener('click', startAudio);
            window.removeEventListener('touchstart', startAudio);
            window.removeEventListener('keydown', startAudio);
          };
          window.addEventListener('click', startAudio, { once: true });
          window.addEventListener('touchstart', startAudio, { once: true });
          window.addEventListener('keydown', startAudio, { once: true });
        });
      }

      introVideo.addEventListener('ended', () => {
        if (btnEnterLab) {
          btnEnterLab.style.boxShadow = '0 0 25px rgba(37, 99, 235, 0.9)';
        }
      });
    }
  };
})(window.PhysicsLab);
