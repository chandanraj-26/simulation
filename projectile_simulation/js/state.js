/**
 * ProjectileLab — State Management & Reactive Store
 */

class SimulationState {
  constructor() {
    this.mode = 'free_range'; // 'free_range' | 'target_challenge' | 'multi_angle'

    // Launch parameters
    this.angle = 45.0; // degrees
    this.velocity = 20.0; // m/s
    this.launchHeight = 0.0; // meters (cliff/elevation)
    this.gravityKey = 'earth';
    this.customG = 9.81;
    this.projectileKey = 'cannonball';
    this.airResistance = false;

    // Visual options
    this.showVelocityVectors = true;
    this.showAccelerationVector = false;
    this.showTrail = true;
    this.showPeakIndicator = true;
    this.simSpeed = 1.0; // 1.0x, 0.5x, 0.25x
    this.isPaused = false;

    // Active projectile in flight
    this.activeShot = null;
    // History of past trajectories
    this.pastTrajectories = [];

    // Target (in Bullseye mode)
    this.target = {
      x: 38.0, // meters from cannon
      y: 0.0,
      radius: 2.2, // meters
      isHit: false,
      score: 0,
      hits: 0
    };

    // Cannon visual state
    this.cannonRecoil = 0; // recoil offset
    this.muzzleParticles = [];
    this.impactParticles = [];
    this.confetti = [];

    // Audio
    this.soundEnabled = true;

    // Student Quests / Missions
    this.quests = [
      {
        id: 1,
        title: "The 45° Sweet Spot",
        desc: "Launch at 45° with 20 m/s on Earth (y0 = 0) to achieve maximum horizontal range (~40.8 m)!",
        stars: 1,
        completed: false,
        check: (lastShot) => {
          if (!lastShot) return false;
          return Math.abs(this.angle - 45.0) <= 1.0 &&
                 Math.abs(this.velocity - 20.0) <= 0.5 &&
                 this.launchHeight <= 0.5 &&
                 !this.airResistance &&
                 lastShot.landedX >= 40.0 && lastShot.landedX <= 41.5;
        }
      },
      {
        id: 2,
        title: "Cliffhanger (Horizontal Shot)",
        desc: "Set launch platform height to 15 m, launch horizontally at 0°, and hit a target placed at x = 30–35 m!",
        stars: 2,
        completed: false,
        check: (lastShot) => {
          if (!lastShot) return false;
          return this.launchHeight >= 14.0 &&
                 this.angle <= 2.0 &&
                 lastShot.landedX >= 30.0 && lastShot.landedX <= 36.0;
        }
      },
      {
        id: 3,
        title: "Twin Angles Paradox",
        desc: "Prove that complementary angles (θ and 90° - θ) land at the exact same distance! Launch with both 30° and 60° (or 25° and 65°) at 20 m/s.",
        stars: 3,
        completed: false,
        state: { angle1: null, angle2: null },
        check: (lastShot) => {
          if (this.quests[2].state.angle1 && this.quests[2].state.angle2) {
            return true;
          }
          return false;
        }
      },
      {
        id: 4,
        title: "Lunar Artillery",
        desc: "Switch environment to The Moon (g = 1.62 m/s²). Launch at 45° with 20 m/s and observe the immense flight time & range (>240 m)!",
        stars: 4,
        completed: false,
        check: (lastShot) => {
          if (!lastShot) return false;
          return this.gravityKey === 'moon' &&
                 Math.abs(this.angle - 45.0) <= 2.0 &&
                 lastShot.landedX > 200.0;
        }
      },
      {
        id: 5,
        title: "Aerodynamic Drag Master",
        desc: "Turn on Air Resistance, launch a baseball at 25 m/s, and hit the bullseye target by compensating for velocity loss!",
        stars: 5,
        completed: false,
        check: (lastShot) => {
          if (!lastShot) return false;
          return this.airResistance &&
                 lastShot.isTargetHit;
        }
      }
    ];

    // Multi-angle comparison list (15, 30, 45, 60, 75 deg)
    this.multiAngles = [15, 30, 45, 60, 75];
  }

  getGravity() {
    if (this.gravityKey === 'custom') return this.customG;
    const env = Physics.environments[this.gravityKey];
    return env ? env.g : 9.81;
  }

  getAirDensity() {
    if (!this.airResistance) return 0.0;
    const env = Physics.environments[this.gravityKey];
    return env ? env.airDensity : 1.225;
  }

  fire() {
    const g = this.getGravity();
    const rho = this.getAirDensity();

    // Calculate full theoretical trajectory
    const trajectoryData = Physics.generateTrajectoryPath({
      v0: this.velocity,
      angleDeg: this.angle,
      y0: this.launchHeight,
      g: g,
      useAirDrag: this.airResistance,
      airDensity: rho,
      projectileKey: this.projectileKey
    });

    const v0x = this.velocity * Math.cos(Physics.degToRad(this.angle));
    const v0y = this.velocity * Math.sin(Physics.degToRad(this.angle));

    // Active in-flight projectile
    this.activeShot = {
      x: 0,
      y: this.launchHeight,
      y0: this.launchHeight,
      v0: this.velocity,
      angle: this.angle,
      v0x: v0x,
      v0y: v0y,
      vx: v0x,
      vy: v0y,
      t: 0,
      maxHeightReached: this.launchHeight,
      trail: [{ x: 0, y: this.launchHeight }],
      trajectoryData: trajectoryData,
      isTargetHit: false,
      landedX: null
    };

    // Cannon recoil animation
    this.cannonRecoil = 14;

    // Muzzle blast particles
    this.spawnMuzzleBlast();

    if (window.soundEngine) {
      try {
        window.soundEngine.playLaunchSound();
      } catch (err) {
        console.warn('Audio launch sound error:', err);
      }
    }
  }

  spawnMuzzleBlast() {
    const rad = Physics.degToRad(this.angle);
    const ppm = (window.projectileRenderer && window.projectileRenderer.scalePPM) || 10.0;
    const barrelMeters = 34 / ppm;
    const mx = Math.cos(rad) * barrelMeters;
    const my = this.launchHeight + Math.sin(rad) * barrelMeters;

    const blastColors = ['#ffedd5', '#fed7aa', '#f97316', '#ef4444', '#facc15', '#ffffff'];
    for (let i = 0; i < 28; i++) {
      const spread = (Math.random() - 0.5) * 0.9;
      const speed = Math.random() * 14 + 6;
      this.muzzleParticles.push({
        x: mx,
        y: my,
        vx: Math.cos(rad + spread) * speed,
        vy: Math.sin(rad + spread) * speed,
        color: blastColors[Math.floor(Math.random() * blastColors.length)],
        size: Math.random() * 6 + 3,
        life: 0.45
      });
    }
  }

  triggerImpact(x, y) {
    if (window.soundEngine) window.soundEngine.playImpactSound();

    for (let i = 0; i < 15; i++) {
      this.impactParticles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 20,
        vy: Math.random() * 15 + 5,
        color: '#78350f', // dirt / dust
        size: Math.random() * 4 + 2,
        life: 0.4
      });
    }
  }

  triggerTargetHit(x, y) {
    this.target.isHit = true;
    this.target.hits += 1;
    this.target.score += 100;

    if (window.soundEngine) {
      window.soundEngine.playTargetHitSound();
      window.soundEngine.playSuccessFanfare();
    }

    this.triggerConfetti(x, y);

    if (window.projectileUI && window.projectileUI.showToast) {
      window.projectileUI.showToast('🎯 DIRECT HIT ON BULLSEYE! (+100 PTS)', 'success');
    }
  }

  triggerConfetti(cx, cy) {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#eab308'];
    for (let i = 0; i < 60; i++) {
      this.confetti.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 1.0
      });
    }
  }

  checkQuests(lastShot) {
    // Check Twin Angles quest
    if (Math.abs(this.velocity - 20.0) <= 0.5 && this.launchHeight <= 0.5 && !this.airResistance) {
      if (Math.abs(this.angle - 30.0) <= 1.0) this.quests[2].state.angle1 = 30;
      if (Math.abs(this.angle - 60.0) <= 1.0) this.quests[2].state.angle2 = 60;
    }

    this.quests.forEach(q => {
      if (!q.completed && q.check(lastShot)) {
        q.completed = true;
        this.triggerConfetti(lastShot.landedX, 0);
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.projectileUI && window.projectileUI.showToast) {
          window.projectileUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }

  clearTrajectories() {
    this.pastTrajectories = [];
    this.activeShot = null;
  }
}

window.simState = new SimulationState();
