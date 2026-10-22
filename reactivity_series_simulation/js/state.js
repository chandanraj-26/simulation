/**
 * Reactivity Series & Metal Displacement Reactions — Central Simulation State
 * Reactive state container managing test tube contents, submersions, reaction progress,
 * live solution color interpolation, and NCERT curriculum quests.
 */

class ReactivityState {
  constructor() {
    this.tubes = [
      {
        id: 1,
        name: 'Test Tube A',
        solutionId: 'CuSO4',
        metalId: null,
        isSubmerged: false,
        reactionProgress: 0.0,
        temperatureC: 25.0,
        bubbles: [],
        crystals: [],
        completed: false
      },
      {
        id: 2,
        name: 'Test Tube B',
        solutionId: 'FeSO4',
        metalId: null,
        isSubmerged: false,
        reactionProgress: 0.0,
        temperatureC: 25.0,
        bubbles: [],
        crystals: [],
        completed: false
      },
      {
        id: 3,
        name: 'Test Tube C',
        solutionId: 'ZnSO4',
        metalId: null,
        isSubmerged: false,
        reactionProgress: 0.0,
        temperatureC: 25.0,
        bubbles: [],
        crystals: [],
        completed: false
      },
      {
        id: 4,
        name: 'Test Tube D',
        solutionId: 'AgNO3',
        metalId: null,
        isSubmerged: false,
        reactionProgress: 0.0,
        temperatureC: 25.0,
        bubbles: [],
        crystals: [],
        completed: false
      }
    ];

    this.selectedMetal = 'Fe'; // 'Fe' | 'Zn' | 'Cu' | 'Mg' | 'Ag'
    this.selectedTubeId = 1;
    this.soundEnabled = true;
    this.atomicZoomActive = false; // Zoom into atomic electron exchange

    this.quests = [
      {
        id: 'q1',
        title: 'Iron in Copper Sulfate',
        desc: 'Submerge an Iron Nail into Tube A (CuSO₄) and observe the pale green Fe²⁺ color and brown Cu deposit.',
        completed: false
      },
      {
        id: 'q2',
        title: 'Exothermic Zinc Displacement',
        desc: 'Dip a Zinc Strip into CuSO₄ solution, bleach the blue color completely, and observe the temperature rise.',
        completed: false
      },
      {
        id: 'q3',
        title: 'Silver Tree Crystal Growth',
        desc: 'Dip Copper Wire into Tube D (AgNO₃) to witness lustrous dendritic silver needles growing on copper.',
        completed: false
      },
      {
        id: 'q4',
        title: 'Control Trial (No Reaction)',
        desc: 'Dip Copper Wire into Tube B (FeSO₄) or Tube C (ZnSO₄) to confirm that copper cannot displace more reactive metals.',
        completed: false
      },
      {
        id: 'q5',
        title: 'Electrochemical Ladder Law',
        desc: 'Successfully observe 3 reactions and deduce the decreasing reactivity order: Mg > Zn > Fe > Cu > Ag.',
        completed: false
      }
    ];

    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, data) {
    for (const listener of this.listeners) {
      try {
        listener(eventType, data, this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  selectMetal(metalId) {
    this.selectedMetal = metalId;
    this.notify('metal_select', { metalId });
  }

  selectTube(tubeId) {
    this.selectedTubeId = tubeId;
    this.notify('tube_select', { tubeId });
  }

  submergeMetalIntoTube(tubeId, metalId) {
    const tube = this.tubes.find(t => t.id === tubeId);
    if (!tube) return;

    tube.metalId = metalId || this.selectedMetal;
    tube.isSubmerged = true;
    tube.reactionProgress = 0.0;
    tube.temperatureC = 25.0;
    tube.bubbles = [];
    tube.crystals = [];

    this.notify('metal_submerged', { tubeId, metalId: tube.metalId });
  }

  removeMetalFromTube(tubeId) {
    const tube = this.tubes.find(t => t.id === tubeId);
    if (!tube) return;

    tube.isSubmerged = false;
    this.notify('metal_removed', { tubeId });
  }

  changeTubeSolution(tubeId, solutionId) {
    const tube = this.tubes.find(t => t.id === tubeId);
    if (!tube) return;

    tube.solutionId = solutionId;
    tube.metalId = null;
    tube.isSubmerged = false;
    tube.reactionProgress = 0.0;
    tube.temperatureC = 25.0;
    tube.bubbles = [];
    tube.crystals = [];
    this.notify('solution_change', { tubeId, solutionId });
  }

  resetAllTubes() {
    this.tubes.forEach(t => {
      t.metalId = null;
      t.isSubmerged = false;
      t.reactionProgress = 0.0;
      t.temperatureC = 25.0;
      t.bubbles = [];
      t.crystals = [];
    });
    this.notify('reset', {});
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  checkQuests() {
    // Quest 1: Iron in CuSO4
    const tFeCu = this.tubes.find(t => t.metalId === 'Fe' && t.solutionId === 'CuSO4' && t.reactionProgress > 0.45);
    if (tFeCu) this.completeQuest('q1');

    // Quest 2: Zn in CuSO4 with temp rise
    const tZnCu = this.tubes.find(t => t.metalId === 'Zn' && t.solutionId === 'CuSO4' && t.temperatureC >= 29.5);
    if (tZnCu) this.completeQuest('q2');

    // Quest 3: Cu in AgNO3 with silver crystals
    const tCuAg = this.tubes.find(t => t.metalId === 'Cu' && t.solutionId === 'AgNO3' && t.reactionProgress > 0.35);
    if (tCuAg) this.completeQuest('q3');

    // Quest 4: No reaction control
    const tControl = this.tubes.find(t => t.metalId === 'Cu' && (t.solutionId === 'FeSO4' || t.solutionId === 'ZnSO4') && t.isSubmerged);
    if (tControl) this.completeQuest('q4');

    // Quest 5: All 3 core reactions observed
    if (this.quests[0].completed && this.quests[1].completed && this.quests[2].completed) {
      this.completeQuest('q5');
    }
  }
}

window.ReactivityState = ReactivityState;
