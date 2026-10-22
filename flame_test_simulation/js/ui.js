/**
 * Flame Test — UI Controller
 * Manages DOM controls, burner sliders, salt sample selection,
 * wire loop actions, cobalt glass filter, quests, and telemetry sync.
 */

class FlameUI {
  constructor(state, engine) {
    this.state = state;
    this.engine = engine;

    this.cacheElements();
    this.bindEvents();
    this.updateTelemetry();
    this.renderQuestsList();
  }

  cacheElements() {
    // Burner controls
    this.sliderGas = document.getElementById('sliderGas');
    this.valGas = document.getElementById('valGas');
    this.sliderAir = document.getElementById('sliderAir');
    this.valAir = document.getElementById('valAir');
    this.btnIgnite = document.getElementById('btnIgnite');
    this.lblFlameType = document.getElementById('lblFlameType');

    // Loop & Optics controls
    this.btnLoopInFlame = document.getElementById('btnLoopInFlame');
    this.btnDipHCl = document.getElementById('btnDipHCl');
    this.btnCobaltGlass = document.getElementById('btnCobaltGlass');
    this.btnSpectroscopeToggle = document.getElementById('btnSpectroscopeToggle');

    // Salt Pill Buttons
    this.saltButtons = Array.from(document.querySelectorAll('.salt-pill-btn'));

    // Mystery Sample Buttons
    this.btnMysteryAlpha = document.getElementById('btnMysteryAlpha');
    this.btnMysteryBeta = document.getElementById('btnMysteryBeta');
    this.btnMysteryGamma = document.getElementById('btnMysteryGamma');
    this.mysteryButtons = [this.btnMysteryAlpha, this.btnMysteryBeta, this.btnMysteryGamma].filter(Boolean);

    // Mystery Deduction Modal
    this.modalMystery = document.getElementById('modalMystery');
    this.btnCloseMystery = document.getElementById('btnCloseMystery');
    this.mysterySubmitSelect = document.getElementById('mysterySubmitSelect');
    this.btnSubmitMysteryGuess = document.getElementById('btnSubmitMysteryGuess');
    this.lblMysteryFeedback = document.getElementById('lblMysteryFeedback');

    // Telemetry Cards
    this.telTemp = document.getElementById('telTemp');
    this.telSalt = document.getElementById('telSalt');
    this.telWavelength = document.getElementById('telWavelength');
    this.telEnergy = document.getElementById('telEnergy');

    // Header buttons & Modals
    this.btnOpenQuests = document.getElementById('btnOpenQuests');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.questBadgeCount = document.getElementById('questBadgeCount');

    this.modalQuests = document.getElementById('modalQuests');
    this.btnCloseQuests = document.getElementById('btnCloseQuests');
    this.questsContainer = document.getElementById('questsContainer');

    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
  }

  bindEvents() {
    // Audio unlock on user touch/click
    const unlockAudio = () => {
      if (window.flameSound) window.flameSound.resume();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // 1. Gas Valve Slider
    if (this.sliderGas) {
      this.sliderGas.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setGasValve(val);
        if (this.valGas) this.valGas.textContent = `${val}%`;
        if (window.flameSound) window.flameSound.updateBurnerSound(this.state.gasValve, this.state.airCollar);
      });
    }

    // 2. Air Collar Slider
    if (this.sliderAir) {
      this.sliderAir.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setAirCollar(val);
        if (this.valAir) this.valAir.textContent = `${Math.round(val * 100)}%`;
        if (this.lblFlameType) this.lblFlameType.textContent = this.getFlameTypeLabel();
        if (window.flameSound) window.flameSound.updateBurnerSound(this.state.gasValve, this.state.airCollar);
      });
    }

    // 3. Ignite / Extinguish Toggle Button
    if (this.btnIgnite) {
      this.btnIgnite.addEventListener('click', () => {
        const nextLit = !this.state.isLit;
        this.state.setBurnerLit(nextLit);
        this.btnIgnite.innerHTML = nextLit ? '🔥 Burner: LIT' : '⚪ Burner: OFF';
        this.btnIgnite.classList.toggle('active', nextLit);
        if (nextLit) {
          if (window.flameSound) {
            window.flameSound.playIgnitionWhoosh();
            window.flameSound.startBurnerSound(this.state.gasValve, this.state.airCollar);
          }
        } else {
          if (window.flameSound) window.flameSound.stopBurnerSound();
        }
      });
    }

    // 4. Loop in Flame Toggle
    if (this.btnLoopInFlame) {
      this.btnLoopInFlame.addEventListener('click', () => {
        const nextInFlame = !this.state.isLoopInFlame;
        this.state.setLoopInFlame(nextInFlame);
        this.btnLoopInFlame.classList.toggle('active', nextInFlame);
        this.btnLoopInFlame.innerHTML = nextInFlame ? '📍 Loop in Flame' : '🔄 Move Loop to Flame';
        if (nextInFlame && window.flameSound) {
          window.flameSound.playLoopSizzle();
        }
      });
    }

    // 5. Dip Loop in HCl Wash
    if (this.btnDipHCl) {
      this.btnDipHCl.addEventListener('click', () => {
        this.state.cleanLoopInHCl();
        this.btnDipHCl.innerHTML = '💧 Dipping in HCl...';
        if (window.flameSound) window.flameSound.playGlassDishTap();
        setTimeout(() => {
          this.btnDipHCl.innerHTML = '🧪 Dip Loop in HCl Wash';
        }, 500);
      });
    }

    // 6. Cobalt Blue Glass Filter Toggle
    if (this.btnCobaltGlass) {
      this.btnCobaltGlass.addEventListener('click', () => {
        const active = this.state.toggleCobaltGlass();
        this.btnCobaltGlass.classList.toggle('active', active);
        this.btnCobaltGlass.innerHTML = active ? '👓 Cobalt Glass: ON' : '👓 Cobalt Blue Glass';
        if (window.flameSound) window.flameSound.playGlassDishTap();
      });
    }

    // 7. Salt Pill Buttons Selection
    this.saltButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.saltButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const saltId = btn.getAttribute('data-salt');
        this.state.selectSalt(saltId);
        if (window.flameSound) {
          window.flameSound.playGlassDishTap();
          if (this.state.isLoopInFlame) window.flameSound.playLoopSizzle();
        }
      });
    });

    // 8. Mystery Detective Buttons
    const mysteryIds = ['mystery-1', 'mystery-2', 'mystery-3'];
    this.mysteryButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        this.saltButtons.forEach(b => b.classList.remove('active'));
        this.mysteryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.selectMystery(mysteryIds[idx]);
        if (this.modalMystery) this.modalMystery.classList.add('open');
        if (window.flameSound) window.flameSound.playGlassDishTap();
      });
    });

    if (this.btnCloseMystery && this.modalMystery) {
      this.btnCloseMystery.addEventListener('click', () => {
        this.modalMystery.classList.remove('open');
      });
    }

    if (this.btnSubmitMysteryGuess) {
      this.btnSubmitMysteryGuess.addEventListener('click', () => {
        const guess = this.mysterySubmitSelect.value;
        const correct = this.state.submitMysteryGuess(guess);
        if (this.lblMysteryFeedback) {
          if (correct) {
            this.lblMysteryFeedback.innerHTML = `🎉 <strong>Correct!</strong> The mystery sample is indeed <strong>${guess.toUpperCase()}</strong>. Quest completed!`;
            this.lblMysteryFeedback.style.color = '#059669';
          } else {
            this.lblMysteryFeedback.innerHTML = `❌ <strong>Not quite!</strong> Check the flame color and spectroscope wavelength closely.`;
            this.lblMysteryFeedback.style.color = '#E11D48';
          }
        }
      });
    }

    // 9. Modals (Quests & Theory)
    if (this.btnOpenQuests && this.modalQuests) {
      this.btnOpenQuests.addEventListener('click', () => {
        this.renderQuestsList();
        this.modalQuests.classList.add('open');
      });
    }
    if (this.btnCloseQuests && this.modalQuests) {
      this.btnCloseQuests.addEventListener('click', () => {
        this.modalQuests.classList.remove('open');
      });
    }

    if (this.btnOpenTheory && this.modalTheory) {
      this.btnOpenTheory.addEventListener('click', () => {
        this.modalTheory.classList.add('open');
      });
    }
    if (this.btnCloseTheory && this.modalTheory) {
      this.btnCloseTheory.addEventListener('click', () => {
        this.modalTheory.classList.remove('open');
      });
    }

    // 10. Header Actions
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        const enabled = this.state.toggleSound();
        this.btnAudioToggle.innerHTML = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        this.btnAudioToggle.classList.toggle('active', enabled);
        if (!enabled && window.flameSound) {
          window.flameSound.stopBurnerSound();
        }
      });
    }

    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => {
        this.state.resetAll();
        if (this.sliderGas) this.sliderGas.value = this.state.gasValve;
        if (this.valGas) this.valGas.textContent = `${this.state.gasValve}%`;
        if (this.sliderAir) this.sliderAir.value = this.state.airCollar;
        if (this.valAir) this.valAir.textContent = `${Math.round(this.state.airCollar * 100)}%`;
        if (this.btnCobaltGlass) this.btnCobaltGlass.classList.remove('active');
        this.saltButtons.forEach(b => b.classList.remove('active'));
      });
    }

    // State notification listener
    this.state.subscribe((event, payload) => {
      this.updateTelemetry();
      if (event === 'quest_completed') {
        this.renderQuestsList();
        if (window.flameSound) window.flameSound.playQuestChime();
      }
    });
  }

  getFlameTypeLabel() {
    if (!this.state.isLit) return 'Extinguished (Gas Off)';
    if (this.state.airCollar < 0.25) return 'Safety Flame (Luminous Yellow, ~300°C)';
    if (this.state.airCollar < 0.65) return 'Gentle Flame (Medium Blue, ~750°C)';
    return 'Roaring Flame (Non-Luminous Cone, ~1300°C)';
  }

  updateTelemetry() {
    const elem = this.state.getActiveElementData();

    if (this.telTemp) {
      this.telTemp.textContent = `${Math.round(this.state.loopTemp)} °C`;
    }
    if (this.telSalt) {
      this.telSalt.textContent = this.state.mysteryMode ? 'Unknown Sample' : `${elem.name} (${elem.formula})`;
    }
    if (this.telWavelength) {
      this.telWavelength.textContent = elem.dominantWavelength ? `${elem.dominantWavelength} nm` : '—';
    }
    if (this.telEnergy) {
      this.telEnergy.textContent = elem.photonEnergyEV ? `${elem.photonEnergyEV} eV` : '—';
    }

    // Update quest badge counter
    const completedCount = this.state.quests.filter(q => q.completed).length;
    if (this.questBadgeCount) {
      this.questBadgeCount.textContent = `${completedCount}/${this.state.quests.length}`;
    }
  }

  renderQuestsList() {
    if (!this.questsContainer) return;
    this.questsContainer.innerHTML = '';

    this.state.quests.forEach(quest => {
      const item = document.createElement('div');
      item.className = `quest-item ${quest.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="quest-status-icon">${quest.completed ? '✅' : '⚪'}</div>
        <div>
          <div class="quest-title">${quest.title}</div>
          <div class="quest-desc">${quest.desc}</div>
        </div>
      `;
      this.questsContainer.appendChild(item);
    });
  }
}

window.FlameUI = FlameUI;
