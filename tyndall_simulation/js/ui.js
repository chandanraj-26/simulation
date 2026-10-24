/**
 * Tyndall Effect, Colloids & Suspensions — UI Controller & Telemetry Binder
 * Handles DOM event bindings, state synchronization, quest rendering,
 * and real-time Rayleigh-Tyndall optical readouts.
 */

class TyndallUI {
  constructor(state, soundEngine, renderer) {
    this.state = state;
    this.sound = soundEngine;
    this.renderer = renderer;

    this.initDOMReferences();
    this.bindEvents();
    this.bindCanvasInteractions();
    this.renderQuests();
    this.updateAll();

    // Subscribe to state changes
    this.state.subscribe((event, data) => this.handleStateChange(event, data));
  }

  initDOMReferences() {
    // Mode tabs
    this.tabBtns = document.querySelectorAll('.tab-btn');

    // Laser controls
    this.btnToggleLaser = document.getElementById('btn-toggle-laser');
    this.laserPills = document.querySelectorAll('.pill-laser');

    // Beaker cards
    this.beakerCards = document.querySelectorAll('.beaker-card');
    this.btnStir = document.getElementById('btn-stir');

    // Utility buttons
    this.btnSound = document.getElementById('btn-sound');
    this.btnReset = document.getElementById('btn-reset');

    // Telemetry display elements
    this.txtMixtureName = document.getElementById('telemetry-mixture-name');
    this.txtParticleSize = document.getElementById('telemetry-particle-size');
    this.txtScatteringIntensity = document.getElementById('telemetry-scattering-intensity');
    this.txtTyndallStatus = document.getElementById('telemetry-tyndall-status');
    this.txtStability = document.getElementById('telemetry-stability');
    this.txtLaserInfo = document.getElementById('telemetry-laser-info');

    // Quest list container
    this.questListContainer = document.getElementById('quest-list');

    // Table rows
    this.tableRows = document.querySelectorAll('.comparison-table tbody tr');
  }

  bindEvents() {
    // View mode tabs
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.state.setViewMode(mode);
        this.sound.playLaserClick();
      });
    });

    // Laser toggle
    if (this.btnToggleLaser) {
      this.btnToggleLaser.addEventListener('click', () => {
        this.state.setLaserActive(!this.state.laserActive);
        this.sound.playLaserClick();
      });
    }

    // Laser color pills
    this.laserPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const color = pill.dataset.color;
        this.state.setLaserColor(color);
        this.sound.playLaserClick();
      });
    });

    // Beaker selection cards
    this.beakerCards.forEach(card => {
      card.addEventListener('click', () => {
        const beakerId = card.dataset.beaker;
        this.state.selectBeaker(beakerId);
        this.sound.playLiquidDrop();
      });
    });

    // Stir button
    if (this.btnStir) {
      this.btnStir.addEventListener('click', () => {
        this.state.stirSuspension();
        this.sound.playStir();
      });
    }

    // Sound toggle
    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        const enabled = this.sound.toggle();
        this.btnSound.innerHTML = enabled ? '<span>🔊</span> Sound: ON' : '<span>🔇</span> Sound: OFF';
      });
    }

    // Reset button
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.state.resetAll();
        this.sound.playLaserClick();
        this.updateAll();
      });
    }
  }

  bindCanvasInteractions() {
    const canvas = this.renderer.canvas;
    if (!canvas) return;

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (this.state.viewMode === 'bench' && this.renderer.beakerBounds) {
        for (const b of this.renderer.beakerBounds) {
          if (clickX >= b.x && clickX <= b.x + b.w && clickY >= b.y && clickY <= b.y + b.h) {
            this.state.selectBeaker(b.id);
            this.sound.playLiquidDrop();
            break;
          }
        }
      }
    });
  }

  handleStateChange(event, data) {
    if (event === 'quest_completed') {
      this.sound.playQuestComplete();
      this.renderQuests();
    }
    this.updateAll();
  }

  updateAll() {
    // 1. Update Mode Tabs
    this.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.state.viewMode);
    });

    // 2. Update Laser Toggle
    if (this.btnToggleLaser) {
      this.btnToggleLaser.classList.toggle('active', this.state.laserActive);
      this.btnToggleLaser.textContent = this.state.laserActive ? '⚡ LASER EMITTER: ON' : '⭕ LASER EMITTER: OFF';
    }

    // 3. Update Laser Color Pills
    this.laserPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.color === this.state.laserColor);
    });

    // 4. Update Beaker Cards
    this.beakerCards.forEach(card => {
      card.classList.toggle('active', card.dataset.beaker === this.state.selectedBeaker);
    });

    // 5. Update Telemetry
    const beaker = TYNDALL_DATA.beakers[this.state.selectedBeaker];
    const laser = TYNDALL_DATA.lasers[this.state.laserColor];

    if (this.txtMixtureName) this.txtMixtureName.textContent = beaker.name;
    if (this.txtParticleSize) this.txtParticleSize.textContent = beaker.particleSize;

    const intensity = this.state.getScatteringIntensity(this.state.selectedBeaker);
    if (this.txtScatteringIntensity) {
      this.txtScatteringIntensity.textContent = this.state.laserActive
        ? `${(intensity * 100).toFixed(1)}% (rel. ${laser.scatteringFactor.toFixed(2)}×)`
        : '0.0% (Laser Off)';
    }

    if (this.txtTyndallStatus) {
      if (!this.state.laserActive) {
        this.txtTyndallStatus.innerHTML = '<span class="badge-false">Inactive (Laser Off)</span>';
      } else if (this.state.selectedBeaker === 'true_solution') {
        this.txtTyndallStatus.innerHTML = '<span class="badge-false">None (Invisible Beam)</span>';
      } else {
        this.txtTyndallStatus.innerHTML = '<span class="badge-true">Luminous Tyndall Cone</span>';
      }
    }

    if (this.txtStability) {
      if (this.state.selectedBeaker === 'suspension') {
        const pct = Math.round(this.state.suspensionSettled * 100);
        this.txtStability.textContent = `Unstable (${pct}% settled)`;
      } else {
        this.txtStability.textContent = beaker.stability;
      }
    }

    if (this.txtLaserInfo) {
      this.txtLaserInfo.textContent = `${laser.name} (${laser.wavelengthNm} nm)`;
    }

    // 6. Highlight active row in comparison table
    this.tableRows.forEach(row => {
      const type = row.dataset.type;
      row.classList.toggle('highlighted', type === this.state.selectedBeaker);
    });

    // 7. Stir button enable/disable
    if (this.btnStir) {
      this.btnStir.disabled = (this.state.selectedBeaker !== 'suspension');
      this.btnStir.style.opacity = (this.state.selectedBeaker === 'suspension') ? '1' : '0.6';
    }
  }

  renderQuests() {
    if (!this.questListContainer) return;
    this.questListContainer.innerHTML = '';

    this.state.quests.forEach(q => {
      const item = document.createElement('div');
      item.className = `quest-item ${q.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="quest-checkbox">${q.completed ? '✓' : ''}</div>
        <div class="quest-content">
          <div class="quest-title">${q.title}</div>
          <div class="quest-desc">${q.desc}</div>
        </div>
      `;
      this.questListContainer.appendChild(item);
    });
  }
}

window.TyndallUI = TyndallUI;
