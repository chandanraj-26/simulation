/**
 * MicroscopeSim — Biological Specimens & Cytology Dataset
 * Models realistic cellular morphology for Onion Root Tip Meristem (Allium cepa),
 * Whitefish Blastula (animal mitosis with asters/cleavage furrows), and Stage Micrometer scale.
 */

class CellsData {
  constructor() {
    this.slides = {
      onion: this.generateOnionMeristem(),
      whitefish: this.generateWhitefishBlastula(),
      micrometer: { isCalibration: true }
    };

    // Educational Descriptions for Each Stage of Mitosis
    this.stageDescriptions = {
      interphase: {
        name: 'Interphase (G1, S, G2)',
        desc: 'The cell is metabolically active, replicating nuclear DNA and centrosomes. Chromatin is diffuse and uncoiled. A distinct nucleolus and intact nuclear envelope are clearly visible.',
        keyFeatures: [
          'Intact nuclear membrane',
          'Prominent dark spherical nucleolus',
          'Diffuse, granular chromatin network (uncondensed DNA)',
          'High rates of protein synthesis & organelle duplication'
        ],
        molecularEvents: 'G1/S cyclin-CDK complexes drive DNA polymerase replication; G2 checkpoint monitors DNA integrity before mitotic entry.'
      },
      prophase: {
        name: 'Prophase (Condensation)',
        desc: 'Chromatin fibers supercoil and condense into distinct, visible sister chromatids linked at centromeres. The nucleolus disappears and the mitotic spindle apparatus begins assembling.',
        keyFeatures: [
          'Chromosomes become visible as thick tangled threads',
          'Nucleolus disappears',
          'Nuclear envelope begins breaking down into vesicles',
          'Spindle fibers assemble between microtubule organizing centers'
        ],
        molecularEvents: 'Condensin complexes drive chromosome compaction; phosphorylation of nuclear lamins induces nuclear envelope disassembly.'
      },
      metaphase: {
        name: 'Metaphase (Equatorial Alignment)',
        desc: 'Chromosomes reach their maximum condensation and align precisely along the central equatorial plane (Metaphase Plate). Kinetochore microtubules from opposite poles attach firmly to sister chromatid centromeres.',
        keyFeatures: [
          'Chromosomes arranged in a neat line along the cell equator',
          'No visible nuclear envelope',
          'Kinetochore microtubule attachments under bipolar tension',
          'Spindle poles positioned at opposite ends'
        ],
        molecularEvents: 'Spindle Assembly Checkpoint (SAC) ensures all kinetochores are attached under tension before activating APC/C (Anaphase-Promoting Complex).'
      },
      anaphase: {
        name: 'Anaphase (Chromatid Separation)',
        desc: 'Sister chromatids are cleaved at their centromeres and pulled rapidly towards opposite spindle poles by shortening kinetochore microtubules, adopting characteristic V-shaped or J-shaped configurations.',
        keyFeatures: [
          'Two distinct clusters of separating chromatids',
          'Characteristic V-shaped chromatid arms pointing backward',
          'Non-kinetochore microtubules elongate to push poles apart',
          'Rapid poleward migration'
        ],
        molecularEvents: 'APC/C activates Separase, which cleaves Cohesin rings linking sister chromatids; motor proteins (dynein/kinesin) drive poleward translocation.'
      },
      telophase: {
        name: 'Telophase & Cytokinesis',
        desc: 'Daughter chromosomes reach opposite poles and begin decondensing into chromatin. Nuclear envelopes reassemble. In plant cells, a Phragmoplast guides vesicle fusion to build a new Cellulose Cell Plate; in animal cells, an actin-myosin Contractile Ring pinches a Cleavage Furrow.',
        keyFeatures: [
          'Two newly forming daughter nuclei at opposite cell poles',
          'Chromosomes uncoil into granular chromatin',
          'Plant cells: Form a visible midline cell plate (pectin & cellulose)',
          'Animal cells: Cleavage furrow constricts across the equator'
        ],
        molecularEvents: 'Dephosphorylation of nuclear lamins reforms nuclear envelopes; Golgi vesicles deposit callose and pectin to synthesize the new primary cell wall.'
      }
    };
  }

  generateOnionMeristem() {
    // Generates ~120 cells arranged in vertical meristematic file columns
    const cells = [];
    const rows = 12;
    const cols = 10;
    const cellW = 52; // micrometers
    const cellH = 34;
    const startX = -(cols * cellW) / 2;
    const startY = -(rows * cellH) / 2;

    // Fixed realistic distribution
    // Interphase ~68%, Prophase ~16%, Metaphase ~7%, Anaphase ~4%, Telophase ~5%
    const stagePattern = [
      'interphase', 'interphase', 'prophase', 'interphase', 'interphase', 'metaphase', 'interphase', 'interphase', 'interphase', 'telophase',
      'interphase', 'prophase', 'interphase', 'interphase', 'anaphase', 'interphase', 'interphase', 'prophase', 'interphase', 'interphase',
      'interphase', 'interphase', 'metaphase', 'interphase', 'interphase', 'telophase', 'interphase', 'interphase', 'prophase', 'interphase',
      'anaphase', 'interphase', 'interphase', 'interphase', 'prophase', 'interphase', 'metaphase', 'interphase', 'interphase', 'interphase',
      'interphase', 'prophase', 'interphase', 'interphase', 'interphase', 'interphase', 'telophase', 'interphase', 'prophase', 'interphase',
      'metaphase', 'interphase', 'interphase', 'anaphase', 'interphase', 'interphase', 'interphase', 'interphase', 'prophase', 'interphase',
      'interphase', 'interphase', 'telophase', 'interphase', 'prophase', 'interphase', 'interphase', 'metaphase', 'interphase', 'interphase',
      'interphase', 'anaphase', 'interphase', 'interphase', 'interphase', 'prophase', 'interphase', 'interphase', 'telophase', 'interphase',
      'prophase', 'interphase', 'interphase', 'metaphase', 'interphase', 'interphase', 'interphase', 'interphase', 'prophase', 'interphase',
      'interphase', 'interphase', 'anaphase', 'interphase', 'interphase', 'telophase', 'interphase', 'prophase', 'interphase', 'interphase',
      'interphase', 'metaphase', 'interphase', 'interphase', 'prophase', 'interphase', 'interphase', 'interphase', 'anaphase', 'interphase',
      'telophase', 'interphase', 'interphase', 'prophase', 'interphase', 'interphase', 'metaphase', 'interphase', 'interphase', 'interphase'
    ];

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = `onion_c_${r}_${c}`;
        const stage = stagePattern[idx % stagePattern.length];
        
        // Slight organic position jitter
        const jitterX = (Math.sin(r * 3 + c * 7) * 4);
        const jitterY = (Math.cos(r * 5 + c * 2) * 3);
        const x = startX + c * cellW + jitterX;
        const y = startY + r * cellH + jitterY;

        cells.push({
          id: id,
          specimen: 'onion',
          r: r,
          c: c,
          x: x,
          y: y,
          w: cellW + (Math.sin(r * 2) * 4),
          h: cellH + (Math.cos(c * 2) * 3),
          stage: stage,
          angle: (Math.sin(idx * 1.7) * 0.25), // Spindle angle tilt
          seed: idx * 1337
        });
        idx++;
      }
    }

    return {
      specimenName: 'Onion Root Tip Squash (Allium cepa)',
      stain: 'Acetocarmine / Feulgen (DNA-specific purple-magenta)',
      cellType: 'Plant Meristematic Cells (Rigid primary cell wall)',
      cells: cells
    };
  }

  generateWhitefishBlastula() {
    // Generates ~60 rounded animal blastomere cells with astral rays & centrioles
    const cells = [];
    const count = 55;
    const radiusSpread = 160;

    const stages = ['interphase', 'interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'interphase'];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.sin(i * 3) * 0.2);
      const dist = Math.sqrt((i + 1) / count) * radiusSpread;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const stage = stages[i % stages.length];

      cells.push({
        id: `whitefish_c_${i}`,
        specimen: 'whitefish',
        x: x,
        y: y,
        w: 52 + (Math.sin(i * 4) * 6),
        h: 52 + (Math.cos(i * 4) * 6),
        stage: stage,
        angle: (Math.sin(i * 2.3) * Math.PI), // Random spindle orientation
        seed: i * 9999
      });
    }

    return {
      specimenName: 'Whitefish Blastula (Coregonus)',
      stain: 'Iron Hematoxylin (Centrosomes, asters, & chromosomes)',
      cellType: 'Animal Embryonic Blastomeres (Cleavage furrow, asters)',
      cells: cells
    };
  }

  getCellById(slideType, id) {
    const slide = this.slides[slideType];
    if (slide && slide.cells) {
      return slide.cells.find(c => c.id === id);
    }
    return null;
  }
}

// Global cells dataset singleton
window.cellsData = new CellsData();
