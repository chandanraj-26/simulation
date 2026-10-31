/**
 * UIController - DOM bindings, Monte Carlo simulation batches, telemetry & quiz
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
    this.btnModeMono = document.getElementById('btnModeMono');
    this.btnModeDi = document.getElementById('btnModeDi');

    this.selectMonoP1 = document.getElementById('selectMonoP1');
    this.selectMonoP2 = document.getElementById('selectMonoP2');
    this.selectDiP1 = document.getElementById('selectDiP1');
    this.selectDiP2 = document.getElementById('selectDiP2');

    this.containerMonoParents = document.getElementById('containerMonoParents');
    this.containerDiParents = document.getElementById('containerDiParents');

    // Batch buttons
    this.btnSample10 = document.getElementById('btnSample10');
    this.btnSample50 = document.getElementById('btnSample50');
    this.btnSample200 = document.getElementById('btnSample200');
    this.btnSample1000 = document.getElementById('btnSample1000');
    this.btnResetSamples = document.getElementById('btnResetSamples');

    // Telemetry
    this.readoutTotalSamples = document.getElementById('readoutTotalSamples');
    this.readoutPhenoRatio = document.getElementById('readoutPhenoRatio');
    this.readoutGenoRatio = document.getElementById('readoutGenoRatio');
    this.readoutDominant = document.getElementById('readoutDominant');
    this.readoutRecessive = document.getElementById('readoutRecessive');

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
    this.inputQuizTall = document.getElementById('inputQuizTall');
    this.inputQuizHetero = document.getElementById('inputQuizHetero');
    this.btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    this.btnNewQuiz = document.getElementById('btnNewQuiz');
    this.quizFeedback = document.getElementById('quizFeedback');

    this.tableLogBody = document.getElementById('tableLogBody');
  }

  bindEvents() {
    // Cross Mode
    this.btnModeMono.addEventListener('click', () => {
      this.model.mode = 'monohybrid';
      this.btnModeMono.classList.add('active');
      this.btnModeDi.classList.remove('active');
      this.containerMonoParents.style.display = 'block';
      this.containerDiParents.style.display = 'none';
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });

    this.btnModeDi.addEventListener('click', () => {
      this.model.mode = 'dihybrid';
      this.btnModeDi.classList.add('active');
      this.btnModeMono.classList.remove('active');
      this.containerMonoParents.style.display = 'none';
      this.containerDiParents.style.display = 'block';
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });

    // Parent selection
    this.selectMonoP1.addEventListener('change', (e) => {
      this.model.monoP1 = e.target.value;
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });
    this.selectMonoP2.addEventListener('change', (e) => {
      this.model.monoP2 = e.target.value;
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });

    this.selectDiP1.addEventListener('change', (e) => {
      this.model.diP1 = e.target.value;
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });
    this.selectDiP2.addEventListener('change', (e) => {
      this.model.diP2 = e.target.value;
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });

    // Monte Carlo Batch buttons
    const handleSample = (n) => {
      this.model.sampleOffspring(n);
      sound.playBatchShuffle();
      this.updateAll();
    };

    this.btnSample10.addEventListener('click', () => handleSample(10));
    this.btnSample50.addEventListener('click', () => handleSample(50));
    this.btnSample200.addEventListener('click', () => handleSample(200));
    this.btnSample1000.addEventListener('click', () => handleSample(1000));

    this.btnResetSamples.addEventListener('click', () => {
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });

    // Audio
    this.btnAudioToggle.addEventListener('click', () => {
      const state = sound.toggle();
      this.btnAudioToggle.classList.toggle('active', state);
      this.btnAudioToggle.textContent = state ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Reset All
    this.btnResetAll.addEventListener('click', () => {
      this.model.mode = 'monohybrid';
      this.model.monoP1 = 'Tt';
      this.model.monoP2 = 'Tt';
      this.selectMonoP1.value = 'Tt';
      this.selectMonoP2.value = 'Tt';
      this.btnModeMono.classList.add('active');
      this.btnModeDi.classList.remove('active');
      this.containerMonoParents.style.display = 'block';
      this.containerDiParents.style.display = 'none';
      this.model.resetSamples();
      sound.playPop();
      this.updateAll();
    });

    // Record Log
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
    this.readoutTotalSamples.textContent = `${this.model.totalSamples} Offspring`;

    if (this.model.mode === 'monohybrid') {
      const grid = this.model.getMonohybridGrid();
      this.readoutPhenoRatio.textContent = grid.phenoRatio;
      this.readoutGenoRatio.textContent = grid.genoRatio;

      const tall = this.model.sampleCounts['Tall'] || 0;
      const dwarf = this.model.sampleCounts['Dwarf'] || 0;
      this.readoutDominant.textContent = `${tall} Tall`;
      this.readoutRecessive.textContent = `${dwarf} Dwarf`;
    } else {
      const grid = this.model.getDihybridGrid();
      this.readoutPhenoRatio.textContent = grid.phenoRatio;
      this.readoutGenoRatio.textContent = '16 Combinations';

      const ry = this.model.sampleCounts['Round Yellow'] || 0;
      const wg = this.model.sampleCounts['Wrinkled Green'] || 0;
      this.readoutDominant.textContent = `${ry} R-Y-`;
      this.readoutRecessive.textContent = `${wg} rryy`;
    }

    this.renderer.render();
  }

  renderLogTable() {
    this.tableLogBody.innerHTML = '';
    this.model.history.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.time}</td>
        <td><strong>${row.cross}</strong></td>
        <td>${row.samples}</td>
        <td><span class="badge-success">${row.phenoRatio}</span></td>
        <td>${row.genoRatio}</td>
      `;
      this.tableLogBody.appendChild(tr);
    });
  }

  startNewQuiz() {
    const q = this.model.generateQuiz();
    this.quizPrompt.textContent = q.prompt;
    this.inputQuizTall.value = '';
    this.inputQuizHetero.value = '';
    this.quizFeedback.className = 'quiz-feedback hidden';
    this.selectMonoP1.value = this.model.monoP1;
    this.selectMonoP2.value = this.model.monoP2;
    this.updateAll();
  }

  checkQuizAnswer() {
    const userTall = parseFloat(this.inputQuizTall.value);
    const userHetero = parseFloat(this.inputQuizHetero.value);

    if (isNaN(userTall) || isNaN(userHetero)) {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.textContent = 'Please enter numeric percentage values for both fields!';
      sound.playError();
      return;
    }

    const targetTall = this.model.quiz.targetTall;
    const targetHetero = this.model.quiz.targetHetero;

    const tallMatch = Math.abs(userTall - targetTall) <= 2.0;
    const heteroMatch = Math.abs(userHetero - targetHetero) <= 2.0;

    if (tallMatch && heteroMatch) {
      this.quizFeedback.className = 'quiz-feedback success';
      this.quizFeedback.innerHTML = `🎉 <strong>Mendelian Genetics Mastered!</strong><br>Correct! ${targetTall}% Tall and ${targetHetero}% Heterozygous (Tt) offspring!`;
      sound.playSuccess();
    } else {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.innerHTML = `❌ <strong>Recalculate!</strong><br>True values: <strong>${targetTall}%</strong> Tall and <strong>${targetHetero}%</strong> Heterozygous.<br>Review the 2×2 Punnett cells!`;
      sound.playError();
    }
  }
}
