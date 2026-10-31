/**
 * UIController - DOM bindings, pouring/draining timers, telemetry, quiz for pH Lab
 */
import { sound } from './sound.js';

export class UIController {
  constructor(model, renderer) {
    this.model = model;
    this.renderer = renderer;

    this.pourInterval = null;
    this.drainInterval = null;

    this.cacheDOM();
    this.bindEvents();
    this.updateAll();
  }

  cacheDOM() {
    this.selectSolution = document.getElementById('selectSolution');
    this.btnPourWater = document.getElementById('btnPourWater');
    this.btnDrain = document.getElementById('btnDrain');
    this.chkParticles = document.getElementById('chkParticles');

    // Telemetry readouts
    this.readoutPH = document.getElementById('readoutPH');
    this.readoutPOH = document.getElementById('readoutPOH');
    this.readoutHConc = document.getElementById('readoutHConc');
    this.readoutOHConc = document.getElementById('readoutOHConc');
    this.readoutClassification = document.getElementById('readoutClassification');
    this.readoutVolume = document.getElementById('readoutVolume');

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
    this.inputQuizPH = document.getElementById('inputQuizPH');
    this.selectQuizClass = document.getElementById('selectQuizClass');
    this.btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    this.btnNewQuiz = document.getElementById('btnNewQuiz');
    this.quizFeedback = document.getElementById('quizFeedback');

    this.tableLogBody = document.getElementById('tableLogBody');
  }

  bindEvents() {
    // Solution change
    this.selectSolution.addEventListener('change', (e) => {
      this.model.selectSolution(e.target.value);
      sound.playMeterBeep();
      this.updateAll();
    });

    // Faucet Pour Water (Press & Hold or Click)
    const startPour = () => {
      if (this.pourInterval) return;
      this.renderer.isPouring = true;
      sound.startWaterStream();
      this.pourInterval = setInterval(() => {
        this.model.addWater(0.015);
        this.updateAll();
        if (this.model.volume >= this.model.maxVolume) {
          stopPour();
        }
      }, 50);
    };

    const stopPour = () => {
      if (this.pourInterval) {
        clearInterval(this.pourInterval);
        this.pourInterval = null;
      }
      this.renderer.isPouring = false;
      sound.stopWaterStream();
      this.renderer.render();
    };

    this.btnPourWater.addEventListener('mousedown', startPour);
    this.btnPourWater.addEventListener('mouseup', stopPour);
    this.btnPourWater.addEventListener('mouseleave', stopPour);
    this.btnPourWater.addEventListener('touchstart', (e) => { e.preventDefault(); startPour(); });
    this.btnPourWater.addEventListener('touchend', stopPour);

    // Drain Liquid (Press & Hold or Click)
    const startDrain = () => {
      if (this.drainInterval) return;
      this.renderer.isDraining = true;
      sound.playDrain();
      this.drainInterval = setInterval(() => {
        this.model.drainLiquid(0.02);
        this.updateAll();
        if (this.model.volume <= 0.1) {
          stopDrain();
        }
      }, 50);
    };

    const stopDrain = () => {
      if (this.drainInterval) {
        clearInterval(this.drainInterval);
        this.drainInterval = null;
      }
      this.renderer.isDraining = false;
      this.renderer.render();
    };

    this.btnDrain.addEventListener('mousedown', startDrain);
    this.btnDrain.addEventListener('mouseup', stopDrain);
    this.btnDrain.addEventListener('mouseleave', stopDrain);
    this.btnDrain.addEventListener('touchstart', (e) => { e.preventDefault(); startDrain(); });
    this.btnDrain.addEventListener('touchend', stopDrain);

    // Particles Toggle
    this.chkParticles.addEventListener('change', (e) => {
      this.model.showParticles = e.target.checked;
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
      this.selectSolution.value = 'lemon_juice';
      this.model.selectSolution('lemon_juice');
      this.model.probePos = { x: 340, y: 220 };
      sound.playMeterBeep();
      this.updateAll();
    });

    // Observation Log
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
    const a = this.model.getAnalysis();

    this.readoutPH.textContent = a.pH.toFixed(2);
    this.readoutPOH.textContent = a.pOH.toFixed(2);
    this.readoutHConc.textContent = `${a.hFormatted} M`;
    this.readoutOHConc.textContent = `${a.ohFormatted} M`;
    this.readoutClassification.textContent = a.classification;
    this.readoutVolume.textContent = `${a.volume.toFixed(2)} L`;

    this.renderer.render();
  }

  renderLogTable() {
    this.tableLogBody.innerHTML = '';
    this.model.history.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.time}</td>
        <td><strong>${row.solute}</strong></td>
        <td>${row.volume}</td>
        <td><span class="badge-success">pH ${row.pH}</span></td>
        <td>pOH ${row.pOH}</td>
        <td>${row.hConc}</td>
        <td>${row.classification}</td>
      `;
      this.tableLogBody.appendChild(tr);
    });
  }

  startNewQuiz() {
    const q = this.model.generateQuiz();
    this.quizPrompt.textContent = q.prompt;
    this.inputQuizPH.value = '';
    this.selectQuizClass.value = 'acid';
    this.quizFeedback.className = 'quiz-feedback hidden';
    this.updateAll();
  }

  checkQuizAnswer() {
    const ansPH = parseFloat(this.inputQuizPH.value);
    const ansClass = this.selectQuizClass.value;

    if (isNaN(ansPH)) {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.textContent = 'Please enter a valid numeric pH value!';
      sound.playError();
      return;
    }

    const targetPH = this.model.quiz.targetPH;
    const diff = Math.abs(ansPH - targetPH);

    let isClassCorrect = false;
    if (targetPH < 6.8 && ansClass === 'acid') isClassCorrect = true;
    else if (targetPH > 7.2 && ansClass === 'base') isClassCorrect = true;
    else if (targetPH >= 6.8 && targetPH <= 7.2 && ansClass === 'neutral') isClassCorrect = true;

    if (diff <= 0.25 && isClassCorrect) {
      this.quizFeedback.className = 'quiz-feedback success';
      this.quizFeedback.innerHTML = `🎉 <strong>Exceptional Analysis!</strong><br>True pH = ${targetPH.toFixed(2)}. Your classification and pH estimation matched the solution perfectly!`;
      sound.playSuccess();
    } else {
      this.quizFeedback.className = 'quiz-feedback error';
      this.quizFeedback.innerHTML = `❌ <strong>Recheck!</strong><br>True pH is <strong>${targetPH.toFixed(2)}</strong>. Submerge the sensor wand tip into the solution or reference the indicator color bar!`;
      sound.playError();
    }
  }
}
