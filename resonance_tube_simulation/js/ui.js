/**
 * UIController - DOM bindings, tuning fork strike, telemetry & quiz for Resonance Lab
 */
import { sound } from './sound.js';
import { FORK_FREQUENCIES } from './resonance_model.js';

export class UIController {
  constructor(model, renderer) {
    this.model = model;
    this.renderer = renderer;

    this.cacheDOM();
    this.bindEvents();
    this.updateAll();
  }

  cacheDOM() {
    this.selectFrequency = document.getElementById('selectFrequency');
    this.btnStrikeFork = document.getElementById('btnStrikeFork');

    this.sliderAirColumn = document.getElementById('sliderAirColumn');
    this.valAirColumn = document.getElementById('valAirColumn');
    this.sliderTemp = document.getElementById('sliderTemp');
    this.valTemp = document.getElementById('valTemp');

    this.btnSnapL1 = document.getElementById('btnSnapL1');
    this.btnSnapL2 = document.getElementById('btnSnapL2');
    this.chkWaveform = document.getElementById('chkWaveform');

    // Telemetry readouts
    this.readoutAirLength = document.getElementById('readoutAirLength');
    this.readoutL1 = document.getElementById('readoutL1');
    this.readoutL2 = document.getElementById('readoutL2');
    this.readoutSpeed = document.getElementById('readoutSpeed');
    this.readoutResStatus = document.getElementById('readoutResStatus');

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
    this.quizPrompt = document.getElementById('quizPrompt');
    this.inputQuizL1 = document.getElementById('inputQuizL1');
    this.inputQuizSpeed = document.getElementById('inputQuizSpeed');
    this.btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    this.btnNewQuiz = document.getElementById('btnNewQuiz');
    this.quizFeedback = document.getElementById('quizFeedback');

    this.tableLogBody = document.getElementById('tableLogBody');
  }

  bindEvents() {
    // Tuning fork change
    this.selectFrequency.addEventListener('change', (e) => {
      this.model.frequency = parseInt(e.target.value);
      sound.strikeFork(this.model.frequency);
      this.updateAll();
    });

    // Strike fork button
    this.btnStrikeFork.addEventListener('click', () => {
      sound.strikeFork(this.model.frequency);
    });

    // Air column slider
    this.sliderAirColumn.addEventListener('input', (e) => {
      this.model.airColumnLength = parseFloat(e.target.value);
      this.updateResonanceAudio();
      this.updateAll();
    });

    // Temperature slider
    this.sliderTemp.addEventListener('input', (e) => {
      this.model.temperature = parseFloat(e.target.value);
      this.updateResonanceAudio();
      this.updateAll();
    });

    // Snap buttons
    this.btnSnapL1.addEventListener('click', () => {
      this.model.airColumnLength = parseFloat(this.model.L1.toFixed(1));
      sound.playClick();
      sound.strikeFork(this.model.frequency);
      this.updateAll();
    });

    this.btnSnapL2.addEventListener('click', () => {
      this.model.airColumnLength = parseFloat(this.model.L2.toFixed(1));
      sound.playClick();
      sound.strikeFork(this.model.frequency);
      this.updateAll();
    });

    // Waveform toggle
    this.chkWaveform.addEventListener('change', (e) => {
      this.model.showWaveform = e.target.checked;
      this.renderer.render();
    });

    // Audio toggle
    this.btnAudioToggle.addEventListener('click', () => {
      const state = sound.toggle();
      this.btnAudioToggle.classList.toggle('active', state);
      this.btnAudioToggle.textContent = state ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Reset All
    this.btnResetAll.addEventListener('click', () => {
      this.model.frequency = 512;
      this.selectFrequency.value = '512';
      this.model.temperature = 25.0;
      this.model.airColumnLength = 16.0;
      sound.strikeFork(512);
      this.updateAll();
    });

    // Record observation
    this.btnLogObservation.addEventListener('click', () => {
      this.model.logObservation();
      this.renderLogTable();
      sound.playSuccess();
    });

    // Modals
    this.btnOpenTheory.addEventListener('click', () => {
      this.modalTheory.classList.remove('hidden');
    });
    this.btnCloseTheory.addEventListener('click', () => {
      this.modalTheory.classList.add('hidden');
    });

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

  updateResonanceAudio() {
    const prox = this.model.getResonanceProximity();
    sound.setResonanceFactor(prox.factor);
  }

  updateAll() {
    this.updateResonanceAudio();

    const prox = this.model.getResonanceProximity();
    const l1 = this.model.L1;
    const l2 = this.model.L2;
    const v = this.model.speedOfSound;

    this.valAirColumn.textContent = `${this.model.airColumnLength.toFixed(1)} cm`;
    this.sliderAirColumn.value = this.model.airColumnLength;

    this.valTemp.textContent = `${this.model.temperature.toFixed(1)} °C`;
    this.sliderTemp.value = this.model.temperature;

    this.readoutAirLength.textContent = `${this.model.airColumnLength.toFixed(1)} cm`;
    this.readoutL1.textContent = `${l1.toFixed(1)} cm (λ/4)`;
    this.readoutL2.textContent = `${l2.toFixed(1)} cm (3λ/4)`;
    this.readoutSpeed.textContent = `${v.toFixed(1)} m/s`;

    if (prox.isAtL1) {
      this.readoutResStatus.textContent = '🔊 Resonance Peak 1 (Fundamental λ/4)';
    } else if (prox.isAtL2) {
      this.readoutResStatus.textContent = '🔊 Resonance Peak 2 (1st Overtone 3λ/4)';
    } else if (prox.factor > 0.3) {
      this.readoutResStatus.textContent = 'Approaching Acoustic Resonance...';
    } else {
      this.readoutResStatus.textContent = 'Off-Resonance (Faint Acoustic Node)';
    }

    this.renderer.render();
  }

  renderLogTable() {
    this.tableLogBody.innerHTML = '';
    this.model.history.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.time}</td>
        <td><strong>${row.freq}</strong></td>
        <td>${row.temp}</td>
        <td>${row.L1}</td>
        <td>${row.L2}</td>
        <td>${row.lambda}</td>
        <td><span class="badge-success">${row.speedTrue}</span></td>
      `;
      this.tableLogBody.appendChild(tr);
    });
  }

  startNewQuiz() {
    const q = this.model.generateQuiz();
    this.quizPrompt.textContent = q.prompt;
    this.inputQuizL1.value = '';
    this.inputQuizSpeed.value = '';
    this.quizFeedback.className = 'quiz-feedback hidden';
    this.selectFrequency.value = `${this.model.frequency}`;
    sound.strikeFork(this.model.frequency);
    this.updateAll();
  }

  checkQuizAnswer() {
    const ansL1 = parseFloat(this.inputQuizL1.value);
    const ansSpeed = parseFloat(this.inputQuizSpeed.value);

    if (isNaN(ansL1) || isNaN(ansSpeed)) {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.textContent = 'Please enter numeric values for both fields!';
      sound.playError();
      return;
    }

    const targetL1 = this.model.quiz.targetL1;
    const targetSpeed = this.model.quiz.targetV;

    const l1Match = Math.abs(ansL1 - targetL1) <= 1.2;
    const speedMatch = Math.abs(ansSpeed - targetSpeed) <= 4.0;

    if (l1Match && speedMatch) {
      this.quizFeedback.className = 'quiz-feedback success';
      this.quizFeedback.innerHTML = `🎉 <strong>Acoustics Mastered!</strong><br>Correct! L₁ = ${targetL1.toFixed(1)} cm, Speed of Sound = ${targetSpeed.toFixed(1)} m/s!`;
      sound.playSuccess();
    } else {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.innerHTML = `❌ <strong>Recalculate!</strong><br>Target: L₁ = <strong>${targetL1.toFixed(1)} cm</strong>, Speed = <strong>${targetSpeed.toFixed(1)} m/s</strong>.<br>Formula: v = 331.3 + 0.606&times;T, &lambda; = v/f, L₁ = &lambda;/4 &minus; 0.3d!`;
      sound.playError();
    }
  }
}
