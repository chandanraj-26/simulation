/**
 * UIController - DOM bindings, environmental controls, telemetry & quiz for Stomata Lab
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
    this.btnViewCellular = document.getElementById('btnViewCellular');
    this.btnViewEpidermal = document.getElementById('btnViewEpidermal');

    this.btnToggleDayNight = document.getElementById('btnToggleDayNight');
    this.sliderLight = document.getElementById('sliderLight');
    this.valLight = document.getElementById('valLight');
    this.sliderHumidity = document.getElementById('sliderHumidity');
    this.valHumidity = document.getElementById('valHumidity');
    this.sliderTemp = document.getElementById('sliderTemp');
    this.valTemp = document.getElementById('valTemp');
    this.selectAba = document.getElementById('selectAba');

    this.chkGasArrows = document.getElementById('chkGasArrows');

    // Telemetry readouts
    this.readoutTurgor = document.getElementById('readoutTurgor');
    this.readoutAperture = document.getElementById('readoutAperture');
    this.readoutKConc = document.getElementById('readoutKConc');
    this.readoutTranspiration = document.getElementById('readoutTranspiration');
    this.readoutStatus = document.getElementById('readoutStatus');

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
    this.selectQuizPrediction = document.getElementById('selectQuizPrediction');
    this.btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    this.btnNewQuiz = document.getElementById('btnNewQuiz');
    this.quizFeedback = document.getElementById('quizFeedback');

    this.tableLogBody = document.getElementById('tableLogBody');
  }

  bindEvents() {
    // View mode switch
    this.btnViewCellular.addEventListener('click', () => {
      this.model.viewMode = 'cellular';
      this.btnViewCellular.classList.add('active');
      this.btnViewEpidermal.classList.remove('active');
      sound.playOsmosisWhoosh();
      this.updateAll();
    });

    this.btnViewEpidermal.addEventListener('click', () => {
      this.model.viewMode = 'epidermal';
      this.btnViewEpidermal.classList.add('active');
      this.btnViewCellular.classList.remove('active');
      sound.playOsmosisWhoosh();
      this.updateAll();
    });

    // Day / Night Toggle
    this.btnToggleDayNight.addEventListener('click', () => {
      this.model.isDay = !this.model.isDay;
      this.btnToggleDayNight.classList.toggle('active', this.model.isDay);
      this.btnToggleDayNight.textContent = this.model.isDay ? '☀️ Daylight: Active' : '🌙 Night: Dark';
      sound.playDayNightChime(this.model.isDay);
      sound.playOsmosisWhoosh();
      this.updateAll();
    });

    // Sliders
    this.sliderLight.addEventListener('input', (e) => {
      this.model.lightIntensity = parseInt(e.target.value);
      this.updateAll();
    });

    this.sliderHumidity.addEventListener('input', (e) => {
      this.model.humidity = parseInt(e.target.value);
      this.updateAll();
    });

    this.sliderTemp.addEventListener('input', (e) => {
      this.model.temperature = parseFloat(e.target.value);
      this.updateAll();
    });

    // ABA dropdown
    this.selectAba.addEventListener('change', (e) => {
      this.model.abaLevel = e.target.value;
      sound.playOsmosisWhoosh();
      this.updateAll();
    });

    // Gas arrows
    this.chkGasArrows.addEventListener('change', (e) => {
      this.model.showGasArrows = e.target.checked;
      this.renderer.render();
    });

    // Audio
    this.btnAudioToggle.addEventListener('click', () => {
      const state = sound.toggle();
      this.btnAudioToggle.classList.toggle('active', state);
      this.btnAudioToggle.textContent = state ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Reset All
    this.btnResetAll.addEventListener('click', () => {
      this.model.isDay = true;
      this.model.lightIntensity = 80;
      this.model.humidity = 50;
      this.model.temperature = 25.0;
      this.model.abaLevel = 'none';
      this.selectAba.value = 'none';
      this.btnToggleDayNight.classList.add('active');
      this.btnToggleDayNight.textContent = '☀️ Daylight: Active';
      sound.playOsmosisWhoosh();
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

  updateAll() {
    const s = this.model.getState();

    this.valLight.textContent = `${this.model.lightIntensity}%`;
    this.sliderLight.value = this.model.lightIntensity;

    this.valHumidity.textContent = `${this.model.humidity}%`;
    this.sliderHumidity.value = this.model.humidity;

    this.valTemp.textContent = `${this.model.temperature.toFixed(1)} °C`;
    this.sliderTemp.value = this.model.temperature;

    this.readoutTurgor.textContent = `${s.turgor} MPa`;
    this.readoutAperture.textContent = `${s.aperture} µm`;
    this.readoutKConc.textContent = `${s.kConc} mM K⁺`;
    this.readoutTranspiration.textContent = `${s.transpirationRate} mmol/m²s`;
    this.readoutStatus.textContent = s.stateLabel;

    this.renderer.render();
  }

  renderLogTable() {
    this.tableLogBody.innerHTML = '';
    this.model.history.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.time}</td>
        <td><strong>${row.light}</strong></td>
        <td>${row.turgor}</td>
        <td>${row.aperture}</td>
        <td>${row.kConc}</td>
        <td>${row.transpiration}</td>
        <td><span class="badge-success">${row.status}</span></td>
      `;
      this.tableLogBody.appendChild(tr);
    });
  }

  startNewQuiz() {
    const q = this.model.generateQuiz();
    this.quizPrompt.textContent = q.prompt;
    this.selectQuizPrediction.value = 'open';
    this.quizFeedback.className = 'quiz-feedback hidden';
    this.updateAll();
  }

  checkQuizAnswer() {
    const userState = this.selectQuizPrediction.value;
    const targetState = this.model.quiz.targetState;

    if (userState === targetState) {
      this.quizFeedback.className = 'quiz-feedback success';
      this.quizFeedback.innerHTML = `🎉 <strong>Stomatal Physiology Mastered!</strong><br>Correct! The stomatal pore will be <strong>${targetState.toUpperCase()}</strong> under these environmental conditions.`;
      sound.playSuccess();
    } else {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.innerHTML = `❌ <strong>Recalculate!</strong><br>The pore will be <strong>${targetState.toUpperCase()}</strong>.<br>Remember: Light drives K⁺ accumulation & water inflow (turgid & open); darkness or ABA drives K⁺ efflux (flaccid & closed).`;
      sound.playError();
    }
  }
}
