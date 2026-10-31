/**
 * UIController - DOM events, telemetry bindings, presets and challenge quiz for Mirror Lab
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
    this.btnTypeConcave = document.getElementById('btnTypeConcave');
    this.btnTypeConvex = document.getElementById('btnTypeConvex');

    this.sliderObjectDist = document.getElementById('sliderObjectDist');
    this.valObjectDist = document.getElementById('valObjectDist');
    this.sliderFocalDist = document.getElementById('sliderFocalDist');
    this.valFocalDist = document.getElementById('valFocalDist');
    this.sliderObjectHeight = document.getElementById('sliderObjectHeight');
    this.valObjectHeight = document.getElementById('valObjectHeight');

    this.selectPreset = document.getElementById('selectPreset');

    this.chkRayParallel = document.getElementById('chkRayParallel');
    this.chkRayFocal = document.getElementById('chkRayFocal');
    this.chkRayCurvature = document.getElementById('chkRayCurvature');

    // Telemetry
    this.readoutFocal = document.getElementById('readoutFocal');
    this.readoutObjectDist = document.getElementById('readoutObjectDist');
    this.readoutImageDist = document.getElementById('readoutImageDist');
    this.readoutMag = document.getElementById('readoutMag');
    this.readoutNature = document.getElementById('readoutNature');

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
    this.inputQuizV = document.getElementById('inputQuizV');
    this.inputQuizM = document.getElementById('inputQuizM');
    this.btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    this.btnNewQuiz = document.getElementById('btnNewQuiz');
    this.quizFeedback = document.getElementById('quizFeedback');

    this.tableLogBody = document.getElementById('tableLogBody');
  }

  bindEvents() {
    // Mirror Type
    this.btnTypeConcave.addEventListener('click', () => {
      this.model.mirrorType = 'concave';
      this.btnTypeConcave.classList.add('active');
      this.btnTypeConvex.classList.remove('active');
      sound.playSnap();
      this.updateAll();
    });

    this.btnTypeConvex.addEventListener('click', () => {
      this.model.mirrorType = 'convex';
      this.btnTypeConvex.classList.add('active');
      this.btnTypeConcave.classList.remove('active');
      sound.playSnap();
      this.updateAll();
    });

    // Sliders
    this.sliderObjectDist.addEventListener('input', (e) => {
      this.model.objectDistance = parseFloat(e.target.value);
      sound.playRayTick();
      this.updateAll();
    });

    this.sliderFocalDist.addEventListener('input', (e) => {
      this.model.focalDistance = parseFloat(e.target.value);
      sound.playRayTick();
      this.updateAll();
    });

    this.sliderObjectHeight.addEventListener('input', (e) => {
      this.model.objectHeight = parseFloat(e.target.value);
      this.updateAll();
    });

    // Presets
    this.selectPreset.addEventListener('change', (e) => {
      this.model.setPreset(e.target.value);
      if (this.model.mirrorType === 'concave') {
        this.btnTypeConcave.classList.add('active');
        this.btnTypeConvex.classList.remove('active');
      } else {
        this.btnTypeConvex.classList.add('active');
        this.btnTypeConcave.classList.remove('active');
      }
      sound.playSnap();
      this.updateAll();
    });

    // Ray Toggles
    this.chkRayParallel.addEventListener('change', (e) => {
      this.model.showParallelRay = e.target.checked;
      this.renderer.render();
    });
    this.chkRayFocal.addEventListener('change', (e) => {
      this.model.showFocalRay = e.target.checked;
      this.renderer.render();
    });
    this.chkRayCurvature.addEventListener('change', (e) => {
      this.model.showCurvatureRay = e.target.checked;
      this.renderer.render();
    });

    // Audio
    this.btnAudioToggle.addEventListener('click', () => {
      const state = sound.toggle();
      this.btnAudioToggle.classList.toggle('active', state);
      this.btnAudioToggle.textContent = state ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Reset
    this.btnResetAll.addEventListener('click', () => {
      this.model.mirrorType = 'concave';
      this.model.focalDistance = 15.0;
      this.model.objectDistance = 30.0;
      this.model.objectHeight = 5.0;
      this.selectPreset.value = 'at_c';
      this.btnTypeConcave.classList.add('active');
      this.btnTypeConvex.classList.remove('active');
      sound.playSnap();
      this.updateAll();
    });

    // Log
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
    const r = this.model.getRayOptics();

    this.valObjectDist.textContent = `${this.model.objectDistance.toFixed(1)} cm`;
    this.sliderObjectDist.value = this.model.objectDistance;

    this.valFocalDist.textContent = `${this.model.focalDistance.toFixed(1)} cm`;
    this.sliderFocalDist.value = this.model.focalDistance;

    this.valObjectHeight.textContent = `${this.model.objectHeight.toFixed(1)} cm`;
    this.sliderObjectHeight.value = this.model.objectHeight;

    this.readoutFocal.textContent = `${r.f >= 0 ? '+' : ''}${r.f} cm`;
    this.readoutObjectDist.textContent = `${r.u} cm`;
    this.readoutImageDist.textContent = r.isInfinity ? '∞ (Infinity)' : `${r.v >= 0 ? '+' : ''}${r.v} cm`;
    this.readoutMag.textContent = r.isInfinity ? '∞' : `${r.m}×`;
    this.readoutNature.textContent = r.natureText;

    this.renderer.render();
  }

  renderLogTable() {
    this.tableLogBody.innerHTML = '';
    this.model.history.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.time}</td>
        <td><strong>${row.type}</strong></td>
        <td>${row.f}</td>
        <td>${row.u}</td>
        <td>${row.v}</td>
        <td>${row.m}</td>
        <td><span class="badge-success">${row.nature}</span></td>
      `;
      this.tableLogBody.appendChild(tr);
    });
  }

  startNewQuiz() {
    const q = this.model.generateQuiz();
    this.quizPrompt.textContent = q.prompt;
    this.inputQuizV.value = '';
    this.inputQuizM.value = '';
    this.quizFeedback.className = 'quiz-feedback hidden';
    this.updateAll();
  }

  checkQuizAnswer() {
    const ansV = parseFloat(this.inputQuizV.value);
    const ansM = parseFloat(this.inputQuizM.value);

    if (isNaN(ansV) || isNaN(ansM)) {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.textContent = 'Please enter numeric values for both image distance (v) and magnification (m)!';
      sound.playError();
      return;
    }

    const targetV = this.model.quiz.targetV;
    const targetM = this.model.quiz.targetM;

    const diffV = Math.abs(ansV - targetV);
    const diffM = Math.abs(ansM - targetM);

    if (diffV < 0.8 && diffM < 0.1) {
      this.quizFeedback.className = 'quiz-feedback success';
      this.quizFeedback.innerHTML = `🎉 <strong>Brilliant Optics Calculation!</strong><br>Target v = ${targetV} cm, m = ${targetM}×. Your answers matched the mirror formula precisely!`;
      sound.playSuccess();
    } else {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.innerHTML = `❌ <strong>Recalculate!</strong><br>Correct Image Distance: <strong>${targetV} cm</strong>, Magnification: <strong>${targetM}×</strong>.<br>Remember: 1/v = 1/f &minus; 1/u and m = &minus;v/u!`;
      sound.playError();
    }
  }
}
