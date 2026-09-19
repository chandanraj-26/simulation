/**
 * PhysicsLab - Prism Optics Simulation: State & Mathematical Utilities
 * Designed for Class 9–12 STEM Physics: Snell's Law, Dispersion & Total Internal Reflection.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  // DOM selector shorthand
  lab.$ = function(id) {
    return document.getElementById(id);
  };

  // Number formatting helper
  lab.fmtNum = function(val, decimals = 1) {
    if (isNaN(val) || val === null || val === undefined) return '0';
    return Number(val.toFixed(decimals)).toString();
  };

  // Materials Database with standard Cauchy parameters
  // n(lambda) = n_base + B / (lambda_um^2 - 0.589^2) or n(lambda) = A + B / lambda^2
  lab.materials = {
    crownglass: {
      name: 'Crown Glass',
      n: 1.520,
      cauchyB: 0.0045, // in um^2
      desc: 'Standard optical glass (BK7) used in lab prisms & lenses',
      emoji: '💎'
    },
    flintglass: {
      name: 'Flint Glass',
      n: 1.660,
      cauchyB: 0.0088,
      desc: 'High-dispersion lead glass creating wide, vivid rainbows',
      emoji: '✨'
    },
    water: {
      name: 'Water Prism',
      n: 1.333,
      cauchyB: 0.0033,
      desc: 'Liquid water container prism demonstrating rainbow physics',
      emoji: '💧'
    },
    diamond: {
      name: 'Diamond',
      n: 2.420,
      cauchyB: 0.0120,
      desc: 'Extreme refractive index creating brilliant dispersion & fire',
      emoji: '💠'
    },
    acrylic: {
      name: 'Acrylic (Perspex)',
      n: 1.492,
      cauchyB: 0.0040,
      desc: 'Clear, lightweight classroom polymer prism',
      emoji: '🧊'
    }
  };

  // Wavelength to RGB color conversion (CIE spectral approximation: 380nm - 750nm)
  lab.wavelengthToRGB = function(wl) {
    let r = 0, g = 0, b = 0;

    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      g = 0.0;
      b = 1.0;
    } else if (wl >= 440 && wl < 490) {
      r = 0.0;
      g = (wl - 440) / (490 - 440);
      b = 1.0;
    } else if (wl >= 490 && wl < 510) {
      r = 0.0;
      g = 1.0;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1.0;
      b = 0.0;
    } else if (wl >= 580 && wl < 645) {
      r = 1.0;
      g = -(wl - 645) / (645 - 580);
      b = 0.0;
    } else if (wl >= 645 && wl <= 750) {
      r = 1.0;
      g = 0.0;
      b = 0.0;
    }

    // Intensity falloff at the visual limits
    let factor = 0.0;
    if (wl >= 380 && wl < 420) {
      factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
    } else if (wl >= 420 && wl <= 700) {
      factor = 1.0;
    } else if (wl > 700 && wl <= 750) {
      factor = 0.3 + 0.7 * (750 - wl) / (750 - 700);
    }

    const gamma = 0.80;
    const to255 = val => Math.round(255 * Math.pow(Math.max(0, val * factor), gamma));

    return {
      r: to255(r),
      g: to255(g),
      b: to255(b),
      hex: `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`,
      rgba: (a = 1) => `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${a})`
    };
  };

  // 7 Key Spectral Wavelengths for White Light Dispersion (VIBGYOR)
  lab.spectralBands = [
    { name: 'Violet',  wl: 405, color: '#7e22ce' },
    { name: 'Indigo',  wl: 435, color: '#4338ca' },
    { name: 'Blue',    wl: 470, color: '#2563eb' },
    { name: 'Green',   wl: 532, color: '#059669' },
    { name: 'Yellow',  wl: 589, color: '#eab308' },
    { name: 'Orange',  wl: 615, color: '#ea580c' },
    { name: 'Red',     wl: 685, color: '#dc2626' }
  ];

  // Core Simulation State
  lab.state = {
    running: true,
    rafId: 0,
    lastTimestamp: 0,
    simTime: 0,

    // Optics Properties
    beamActive: true,
    lightType: 'white',        // 'white' or 'laser'
    wavelength: 532,           // Laser wavelength in nm (532 nm = Green)
    incidentAngle: 48.0,       // Angle of incidence i in degrees
    prismAngle: 60.0,          // Apex angle A in degrees
    prismRefractiveIndex: 1.520, // Base refractive index n
    cauchyB: 0.0045,           // Dispersion parameter B in um^2
    dispersionScale: 3.8,      // Visual dispersion scale for clear classroom VIBGYOR
    ambientRefractiveIndex: 1.000, // Ambient medium (Air = 1.00)
    currentMaterialKey: 'crownglass',

    // Display Toggles
    showNormals: true,
    showAngles: true,
    showVirtualRays: true,
    showProtractor: false,
    showScreen: true,
    screenDistanceOffset: 0,

    // Dragging Interaction
    dragging: null,            // 'torch' or 'screen'
    torchUserPos: null,        // Custom dragged torch {x, y}

    // Telemetry & Ray Trace Output
    telemetry: {
      i: 48.0,
      r1: 29.2,
      r2: 30.8,
      e: 51.2,
      delta: 39.2,
      criticalAngle: 41.1,
      isTIR: false,
      isMinDev: false,
      minDeviationAngle: 37.2,
      dispersionAngle: 1.8 // Spread between Red and Violet in degrees
    },

    // Graph Data Cache
    deltaVsICurve: [],
    dispersionCurve: []
  };

  // Config reader from control inputs
  lab.getConfig = function() {
    const s = lab.state;
    return {
      beamActive: s.beamActive,
      lightType: s.lightType,
      wavelength: Number(s.wavelength),
      incidentAngle: Number(s.incidentAngle),
      prismAngle: Number(s.prismAngle),
      n: Number(s.prismRefractiveIndex),
      cauchyB: Number(s.cauchyB),
      dispersionScale: Number(s.dispersionScale || 3.8),
      ambientN: Number(s.ambientRefractiveIndex),
      materialKey: s.currentMaterialKey,
      showNormals: s.showNormals,
      showAngles: s.showAngles,
      showVirtualRays: s.showVirtualRays,
      showProtractor: s.showProtractor,
      showScreen: s.showScreen
    };
  };

})(window.PhysicsLab);
