/**
 * UIController - Handles DOM bindings, telemetry readouts, quiz mode, and modal views.
 */
import { sound } from './sound.js';

export class UIController {
  constructor(model, renderer) {
    this.model = model;
    this.renderer = renderer;

    this.cacheDOM();
    this.bindEvents();
    this.updateAll();
  }

  cacheDOM() {
    // Mode switcher buttons
    this.btnModeVernier = document.getElementById('btnModeVernier');
    this.btnModeScrewGauge = document.getElementById('btnModeScrewGauge');

    // Controls
    this.sliderPosition = document.getElementById('sliderPosition');
    this.valPosition = document.getElementById('valPosition');
    this.sliderZeroError = document.getElementById('sliderZeroError');
    this.valZeroError = document.getElementById('valZeroError');
    this.selectObject = document.getElementById('selectObject');
    this.btnClamp = document.getElementById('btnClamp');
    this.btnToggleLoupe = document.getElementById('btnToggleLoupe');

    // Fine adjustment buttons
    this.btnStepMinusBig = document.getElementById('btnStepMinusBig');
    this.btnStepMinusSmall = document.getElementById('btnStepMinusSmall');
    this.btnStepPlusSmall = document.getElementById('btnStepPlusSmall');
    this.btnStepPlusBig = document.getElementById('btnStepPlusBig');

    // Telemetry readouts
    this.readoutMainLabel = document.getElementById('readoutMainLabel');
    this.readoutMainValue = document.getElementById('readoutMainValue');
    this.readoutVernierLabel = document.getElementById('readoutVernierLabel');
    this.readoutVernierValue = document.getElementById('readoutVernierValue');
    this.readoutLC = document.getElementById('readoutLC');
    this.readoutZeroError = document.getElementById('readoutZeroError');
    this.readoutTotal = document.getElementById('readoutTotal');
    this.readoutAltUnit = document.getElementById('readoutAltUnit');

    // Header buttons
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.btnOpenQuiz = document.getElementById('btnOpenQuiz');
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnLogObservation = document.getElementById('btnLogObservation');

    // Modals
    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
    this.modalQuiz = document.getElementById('modalQuiz');
    this.btnCloseQuiz = document.getElementById('btnCloseQuiz');

    // Quiz elements
    this.btnNewQuiz = document.getElementById('btnNewQuiz');
    this.quizPrompt = document.getElementById('quizPrompt');
    this.inputQuizAnswer = document.getElementById('inputQuizAnswer');
    this.btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    this.quizFeedback = document.getElementById('quizFeedback');

    // Log Table
    this.tableLogBody = document.getElementById('tableLogBody');
  }

  bindEvents() {
    // Mode toggles
    this.btnModeVernier.addEventListener('click', () => {
      this.model.setMode('vernier');
      this.btnModeVernier.classList.add('active');
      this.btnModeScrewGauge.classList.remove('active');
      this.setupControlsForMode();
      sound.playSliderTick();
      this.updateAll();
    });

    this.btnModeScrewGauge.addEventListener('click', () => {
      this.model.setMode('screw_gauge');
      this.btnModeScrewGauge.classList.add('active');
      this.btnModeVernier.classList.remove('active');
      this.setupControlsForMode();
      sound.playRatchetClick();
      this.updateAll();
    });

    // Position slider
    this.sliderPosition.addEventListener('input', (e) => {
      this.model.setPosition(parseFloat(e.target.value));
      if (this.model.mode === 'vernier') {
        sound.playSliderTick();
      } else {
        sound.playRatchetClick();
      }
      this.updateAll();
    });

    // Zero error slider
    this.sliderZeroError.addEventListener('input', (e) => {
      this.model.setZeroError(parseFloat(e.target.value));
      this.updateAll();
    });

    // Object selector
    this.selectObject.addEventListener('change', (e) => {
      this.model.selectedObjectId = e.target.value;
      this.model.clampToObject();
      sound.playClampSnap();
      this.updateAll();
    });

    // Clamp button
    this.btnClamp.addEventListener('click', () => {
      this.model.isClamped = !this.model.isClamped;
      this.btnClamp.classList.toggle('active', this.model.isClamped);
      this.btnClamp.textContent = this.model.isClamped ? '🔒 Locked / Clamped' : '🔓 Unlocked (Free)';
      sound.playClampSnap();
      this.updateAll();
    });

    // Loupe toggle
    this.btnToggleLoupe.addEventListener('click', () => {
      this.model.magnifierActive = !this.model.magnifierActive;
      this.btnToggleLoupe.classList.toggle('active', this.model.magnifierActive);
      this.renderer.render();
    });

    // Fine adjustment steps
    this.btnStepMinusBig.addEventListener('click', () => {
      const step = this.model.mode === 'vernier' ? 1.0 : 0.5;
      this.model.stepPosition(-step);
      sound.playSliderTick();
      this.updateAll();
    });

    this.btnStepMinusSmall.addEventListener('click', () => {
      const step = this.model.mode === 'vernier' ? 0.1 : 0.01;
      this.model.stepPosition(-step);
      sound.playRatchetClick();
      this.updateAll();
    });

    this.btnStepPlusSmall.addEventListener('click', () => {
      const step = this.model.mode === 'vernier' ? 0.1 : 0.01;
      this.model.stepPosition(step);
      sound.playRatchetClick();
      this.updateAll();
    });

    this.btnStepPlusBig.addEventListener('click', () => {
      const step = this.model.mode === 'vernier' ? 1.0 : 0.5;
      this.model.stepPosition(step);
      sound.playSliderTick();
      this.updateAll();
    });

    // Audio toggle
    this.btnAudioToggle.addEventListener('click', () => {
      const state = sound.toggle();
      this.btnAudioToggle.classList.toggle('active', state);
      this.btnAudioToggle.textContent = state ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Reset button
    this.btnResetAll.addEventListener('click', () => {
      this.model.vernier.jawPosition = 0;
      this.model.vernier.zeroError = 0;
      this.model.screwGauge.spindlePosition = 0;
      this.model.screwGauge.zeroError = 0;
      this.model.isClamped = false;
      this.selectObject.value = 'free';
      this.model.selectedObjectId = 'free';
      this.setupControlsForMode();
      sound.playClampSnap();
      this.updateAll();
    });

    // Log observation
    this.btnLogObservation.addEventListener('click', () => {
      this.model.logObservation();
      this.renderLogTable();
      sound.playSuccess();
    });

    // Theory modal
    this.btnOpenTheory.addEventListener('click', () => {
      this.modalTheory.classList.remove('hidden');
    });
    this.btnCloseTheory.addEventListener('click', () => {
      this.modalTheory.classList.add('hidden');
    });

    // Quiz modal
    this.btnOpenQuiz.addEventListener('click', () => {
      this.modalQuiz.classList.remove('hidden');
      this.startNewQuiz();
    });
    this.btnCloseQuiz.addEventListener('click', () => {
      this.modalQuiz.classList.add('hidden');
    });
    this.btnNewQuiz.addEventListener('click', () => {
      this.startNewQuiz();
    });
    this.btnSubmitQuiz.addEventListener('click', () => {
      this.checkQuizAnswer();
    });
  }

  setupControlsForMode() {
    if (this.model.mode === 'vernier') {
      this.sliderPosition.max = '80';
      this.sliderPosition.step = '0.1';
      this.sliderPosition.value = this.model.vernier.jawPosition;
      
      this.sliderZeroError.min = '-0.5';
      this.sliderZeroError.max = '0.5';
      this.sliderZeroError.step = '0.05';
      this.sliderZeroError.value = this.model.vernier.zeroError;

      this.readoutMainLabel.textContent = 'Main Scale Reading (MSR)';
      this.readoutVernierLabel.textContent = 'Vernier Scale Reading (VSR)';
    } else {
      this.sliderPosition.max = '25';
      this.sliderPosition.step = '0.01';
      this.sliderPosition.value = this.model.screwGauge.spindlePosition;

      this.sliderZeroError.min = '-0.08';
      this.sliderZeroError.max = '0.08';
      this.sliderZeroError.step = '0.005';
      this.sliderZeroError.value = this.model.screwGauge.zeroError;

      this.readoutMainLabel.textContent = 'Pitch Scale Reading (PSR)';
      this.readoutVernierLabel.textContent = 'Circular Scale Reading (HSR)';
    }
  }

  updateAll() {
    const isVernier = (this.model.mode === 'vernier');

    if (isVernier) {
      const r = this.model.getVernierReadings();
      this.valPosition.textContent = `${this.model.vernier.jawPosition.toFixed(2)} mm`;
      this.sliderPosition.value = this.model.vernier.jawPosition;

      this.valZeroError.textContent = `${r.zeroError >= 0 ? '+' : ''}${r.zeroError.toFixed(2)} mm`;
      this.sliderZeroError.value = r.zeroError;

      this.readoutMainValue.textContent = `${r.msr.toFixed(1)} mm`;
      this.readoutVernierValue.textContent = `#${r.vsr} (${r.fractionMm} mm)`;
      this.readoutLC.textContent = `${r.lc.toFixed(2)} mm`;
      this.readoutZeroError.textContent = `${r.zeroError >= 0 ? '+' : ''}${r.zeroError.toFixed(2)} mm`;
      this.readoutTotal.textContent = `${r.corrected.toFixed(2)} mm`;
      this.readoutAltUnit.textContent = `${(r.corrected / 10).toFixed(3)} cm`;
    } else {
      const r = this.model.getScrewGaugeReadings();
      this.valPosition.textContent = `${this.model.screwGauge.spindlePosition.toFixed(3)} mm`;
      this.sliderPosition.value = this.model.screwGauge.spindlePosition;

      this.valZeroError.textContent = `${r.zeroError >= 0 ? '+' : ''}${r.zeroError.toFixed(3)} mm`;
      this.sliderZeroError.value = r.zeroError;

      this.readoutMainValue.textContent = `${r.psr.toFixed(2)} mm`;
      this.readoutVernierValue.textContent = `#${r.hsr} (${r.fractionMm} mm)`;
      this.readoutLC.textContent = `${r.lc.toFixed(3)} mm (10 µm)`;
      this.readoutZeroError.textContent = `${r.zeroError >= 0 ? '+' : ''}${r.zeroError.toFixed(3)} mm`;
      this.readoutTotal.textContent = `${r.corrected.toFixed(3)} mm`;
      this.readoutAltUnit.textContent = `${(r.corrected * 1000).toFixed(1)} µm`;
    }

    this.renderer.render();
  }

  renderLogTable() {
    this.tableLogBody.innerHTML = '';
    this.model.history.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.time}</td>
        <td><strong>${row.instrument}</strong></td>
        <td>${row.object}</td>
        <td>${row.mainScale}</td>
        <td>${row.vernierDiv}</td>
        <td>${row.zeroError}</td>
        <td><span class="badge-success">${row.total}</span></td>
      `;
      this.tableLogBody.appendChild(tr);
    });
  }

  startNewQuiz() {
    const quiz = this.model.generateQuiz();
    this.quizPrompt.textContent = quiz.prompt;
    this.inputQuizAnswer.value = '';
    this.quizFeedback.className = 'quiz-feedback hidden';
    this.updateAll();
  }

  checkQuizAnswer() {
    const answer = parseFloat(this.inputQuizAnswer.value);
    if (isNaN(answer)) {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.textContent = 'Please enter a valid numeric dimension in millimeters!';
      sound.playError();
      return;
    }

    const target = this.model.quiz.targetReading;
    const diff = Math.abs(answer - target);
    const tolerance = this.model.mode === 'vernier' ? 0.15 : 0.02;

    if (diff <= tolerance) {
      this.quizFeedback.className = 'quiz-feedback success';
      this.quizFeedback.innerHTML = `🎉 <strong>Spot on!</strong> Correct reading: <strong>${target} mm</strong>. You matched the true dimensions perfectly!`;
      sound.playSuccess();
    } else {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.innerHTML = `❌ <strong>Not quite!</strong> Your reading: ${answer} mm. Correct: <strong>${target} mm</strong> (Tolerance ±${tolerance} mm). Recheck scale alignment and zero error!`;
      sound.playError();
    }
  }
}
