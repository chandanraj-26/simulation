/**
 * DopplerLab — Physics & Acoustic Wave Mechanics Engine
 * Mathematical foundation for 2D Doppler effect, wavefront expansions,
 * Mach cone envelopes, acoustic medium properties, and wavelength shifts.
 */

const Physics = {
  // Acoustic mediums and sound speeds (m/s at 1 atm)
  mediums: {
    'air_20c': { name: 'Air (20°C / Sea Level)', speed: 343, desc: 'Standard room temperature acoustic medium (v = 343 m/s).' },
    'air_cold': { name: 'Cold Air (-10°C)', speed: 325, desc: 'Sub-zero winter air with lower molecular speed (v = 325 m/s).' },
    'air_hot': { name: 'Hot Air (40°C)', speed: 355, desc: 'Warm desert air with accelerated acoustic velocity (v = 355 m/s).' },
    'helium': { name: 'Helium Gas', speed: 965, desc: 'Low-density noble gas producing ultra-fast propagation (v = 965 m/s).' },
    'water': { name: 'Fresh Water (20°C)', speed: 1482, desc: 'Dense liquid medium (~4.3x faster than air, v = 1482 m/s).' }
  },

  /**
   * Classical 1D Doppler Observed Frequency
   * f_obs = f_src * (v_sound + v_obs) / (v_sound - v_src)
   * Signs: v_src > 0 when moving towards observer, v_obs > 0 when observer moves towards source
   */
  calculate1DDoppler(fSrc, vSound, vSrcTowardsObs, vObsTowardsSrc) {
    if (fSrc <= 0 || vSound <= 0) return 0;
    const denom = vSound - vSrcTowardsObs;
    if (Math.abs(denom) < 0.001) {
      // Sonic barrier singularity
      return Infinity;
    }
    const numer = vSound + vObsTowardsSrc;
    const fObs = fSrc * (numer / denom);
    return Math.max(0, fObs);
  },

  /**
   * 2D Doppler Effect for Arbitrary Source & Observer Vectors
   * Computes radial velocity components along the line connecting source to observer
   */
  calculate2DDoppler(fSrc, vSound, srcPos, srcVel, obsPos, obsVel) {
    const dx = obsPos.x - srcPos.x;
    const dy = obsPos.y - srcPos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.0001) {
      return {
        fObs: fSrc,
        lambdaObs: vSound / fSrc,
        machNumber: Math.hypot(srcVel.x, srcVel.y) / vSound,
        ratio: 1.0,
        radialSrcVel: 0,
        radialObsVel: 0,
        distance: 0,
        angleDeg: 0
      };
    }

    // Unit vector from Source to Observer: n_so = (dx/dist, dy/dist)
    const nx = dx / dist;
    const ny = dy / dist;

    // Source velocity component along line toward observer:
    // v_s_parallel = v_src • n_so
    const vSrcParallel = srcVel.x * nx + srcVel.y * ny;

    // Observer velocity component along line toward source:
    // Observer moves toward source if v_obs • (-n_so) > 0 => - (v_obs • n_so)
    const vObsParallel = -(obsVel.x * nx + obsVel.y * ny);

    const denom = vSound - vSrcParallel;
    let fObs;
    if (denom <= 0.001) {
      // Shock / supersonic envelope
      fObs = fSrc * 5.0; // clamp representation
    } else {
      fObs = fSrc * ((vSound + vObsParallel) / denom);
    }

    const speedSrc = Math.hypot(srcVel.x, srcVel.y);
    const machNumber = speedSrc / vSound;
    const lambdaObs = fObs > 0 ? vSound / fObs : Infinity;
    const lambda0 = vSound / fSrc;

    return {
      fObs: Math.max(1, fObs),
      lambdaObs: lambdaObs,
      lambda0: lambda0,
      machNumber: machNumber,
      ratio: fObs / fSrc,
      radialSrcVel: vSrcParallel,
      radialObsVel: vObsParallel,
      distance: dist,
      angleDeg: Math.atan2(dy, dx) * 180 / Math.PI
    };
  },

  /**
   * Mach Cone Half-Angle (mu) in radians for supersonic speeds (M >= 1)
   * sin(mu) = 1 / M = v_sound / v_src => mu = arcsin(1 / M)
   */
  getMachAngle(machNumber) {
    if (machNumber < 1.0) return null;
    return Math.asin(1.0 / machNumber);
  },

  /**
   * Calculate Wavelength: lambda = v / f
   */
  getWavelength(speed, freq) {
    if (freq <= 0) return 0;
    return speed / freq;
  },

  /**
   * Calculate Sound Intensity / Attenuation with distance
   * Inverse square law in 3D, 1/r in 2D cylindrical wavefronts
   */
  getIntensity(distance, referenceDist = 1.0) {
    const d = Math.max(referenceDist, distance);
    return referenceDist / d;
  }
};

window.Physics = Physics;
