/**
 * UIController - DOM bindings, sliders, telemetry, and quizzes for Buoyancy Lab
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
    this.selectMaterial = document.getElementById('selectMaterial');
    this.selectLiquid = document.getElementById('selectLiquid');

    this.sliderMass = document.getElementById('sliderMass');
    this.valMass = document.getElementById('valMass');
    this.sliderVolume = document.getElementById('sliderVolume');
    this.valVolume = document.getElementById('valVolume');
    this.sliderGravity = document.getElementById('sliderGravity');
    this.valGravity = document.getElementById('valGravity');

    this.chkForceVectors = document.getElementById('chkForceVectors');

    // Telemetry readouts
    this.readoutDensityObj = document.getElementById('readoutDensityObj');
    this.readoutDensityFluid = document.getElementById('readoutDensityFluid');
    this.readoutGravityForce = document.getElementById('readoutGravityForce');
    this.readoutBuoyantForce = document.getElementById('readoutBuoyantForce');
    this.readoutState = document.getElementById('readoutState');
    this.readoutSubmerged = document.getElementById('readoutSubmerged');

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
    this.inputQuizSubmerged = document.getElementById('inputQuizSubmerged');
    this.btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    this.btnNewQuiz = document.getElementById('btnNewQuiz');
    this.quizFeedback = document.getElementById('quizFeedback');

    this.tableLogBody = document.getElementById('tableLogBody');
  }

  bindEvents() {
    // Material change
    this.selectMaterial.addEventListener('change', (e) => {
      this.model.selectedMaterialId = e.target.value;
      this.model.recalcMaterial();
      this.model.vy = 0;
      sound.playSplash();
      this.updateAll();
    });

    // Liquid change
    this.selectLiquid.addEventListener('change', (e) => {
      this.model.selectedLiquidId = e.target.value;
      this.model.vy = 0;
      sound.playSplash();
      this.updateAll();
    });

    // Sliders
    this.sliderMass.addEventListener('input', (e) => {
      this.model.mass = parseFloat(e.target.value);
      this.model.selectedMaterialId = 'custom';
      this.selectMaterial.value = 'custom';
      this.updateAll();
    });

    this.sliderVolume.addEventListener('input', (e) => {
      this.model.volume = parseFloat(e.target.value);
      this.model.recalcMaterial();
      this.updateAll();
    });

    this.sliderGravity.addEventListener('input', (e) => {
      this.model.g = parseFloat(e.target.value);
      this.updateAll();
    });

    // Vector Toggle
    this.chkForceVectors.addEventListener('change', (e) => {
      this.model.showVectors = e.target.checked;
      this.renderer.render();
    });

    // Audio Toggle
    this.btnAudioToggle.addEventListener('click', () => {
      const state = sound.toggle();
      this.btnAudioToggle.classList.toggle('active', state);
      this.btnAudioToggle.textContent = state ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Reset All
    this.btnResetAll.addEventListener('click', () => {
      this.selectMaterial.value = 'wood_pine';
      this.selectLiquid.value = 'water';
      this.model.selectedMaterialId = 'wood_pine';
      this.model.selectedLiquidId = 'water';
      this.model.volume = 2.0;
      this.model.g = 9.80;
      this.model.recalcMaterial();
      this.model.y = 0;
      this.model.vy = 0;
      sound.playSplash();
      this.updateAll();
    });

    // Record Observation
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
    const t = this.model.getTelemetry();

    this.valMass.textContent = `${t.mass} kg`;
    this.sliderMass.value = t.mass;

    this.valVolume.textContent = `${t.volume} L`;
    this.sliderVolume.value = t.volume;

    this.valGravity.textContent = `${this.model.g.toFixed(1)} m/s²`;
    this.sliderGravity.value = this.model.g;

    this.readoutDensityObj.textContent = `${t.densityObj} kg/L`;
    this.readoutDensityFluid.textContent = `${t.densityFluid} kg/L`;
    this.readoutGravityForce.textContent = `${t.gravityForce} N`;
    this.readoutBuoyantForce.textContent = `${t.buoyantForce} N`;
    this.readoutState.textContent = t.stateLabel;
    this.readoutSubmerged.textContent = `${t.submergedFraction}% Submerged (${t.V_displaced} L)`;

    this.renderer.render();
  }

  renderLogTable() {
    this.tableLogBody.innerHTML = '';
    this.model.history.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.time}</td>
        <td><strong>${row.material}</strong></td>
        <td>${row.liquid}</td>
        <td>${row.densityObj}</td>
        <td>${row.densityFluid}</td>
        <td>${row.buoyantForce}</td>
        <td><span class="badge-success">${row.state}</span></td>
      `;
      this.tableLogBody.appendChild(tr);
    });
  }

  startNewQuiz() {
    const q = this.model.generateQuiz();
    this.quizPrompt.textContent = q.prompt;
    this.selectQuizPrediction.value = 'float';
    this.inputQuizSubmerged.value = '';
    this.quizFeedback.className = 'quiz-feedback hidden';
    this.updateAll();
  }

  checkQuizAnswer() {
    const userState = this.selectQuizPrediction.value;
    const userSubmerged = parseFloat(this.inputQuizSubmerged.value);

    if (isNaN(userSubmerged)) {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.textContent = 'Please enter a numeric value for submerged percentage!';
      sound.playError();
      return;
    }

    const targetState = this.model.quiz.targetState;
    const targetSubmerged = this.model.quiz.targetSubmerged;

    const stateMatch = (userState === targetState);
    const subMatch = Math.abs(userSubmerged - targetSubmerged) <= 5.0;

    if (stateMatch && subMatch) {
      this.quizFeedback.className = 'quiz-feedback success';
      this.quizFeedback.innerHTML = `🎉 <strong>Flotation Law Mastered!</strong><br>Correct! The block will ${targetState.toUpperCase()} with ${targetSubmerged}% submerged volume!`;
      sound.playSuccess();
    } else {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.innerHTML = `❌ <strong>Recalculate!</strong><br>Correct: It will <strong>${targetState.toUpperCase()}</strong> with <strong>${targetSubmerged}%</strong> submerged volume.<br>Condition: Submerged fraction = ρ_object / ρ_fluid!`;
      sound.playError();
    }
  }
}
