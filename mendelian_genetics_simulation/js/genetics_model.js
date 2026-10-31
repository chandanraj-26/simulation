/**
 * GeneticsModel - Punnett Square Combinatorics & Monte Carlo Sampling
 * NCERT Class 10/12:
 *  - Law of Segregation: 3:1 phenotypic, 1:2:1 genotypic
 *  - Law of Independent Assortment: 9:3:3:1 phenotypic
 */

export class GeneticsModel {
  constructor() {
    this.mode = 'monohybrid'; // 'monohybrid' or 'dihybrid'

    // Monohybrid settings (Plant Height: T = Tall, t = Dwarf)
    this.monoP1 = 'Tt';
    this.monoP2 = 'Tt';

    // Dihybrid settings (R = Round, r = Wrinkled; Y = Yellow, y = Green)
    this.diP1 = 'RrYy';
    this.diP2 = 'RrYy';

    // Monte Carlo empirical sample counts
    this.sampleCounts = {};
    this.totalSamples = 0;

    this.history = [];
    this.quiz = null;

    this.resetSamples();
  }

  resetSamples() {
    this.sampleCounts = {};
    this.totalSamples = 0;
  }

  // Calculate analytical Punnett square for Monohybrid
  getMonohybridGrid() {
    const g1 = [this.monoP1[0], this.monoP1[1]];
    const g2 = [this.monoP2[0], this.monoP2[1]];

    const cells = [];
    const genoCounts = { 'TT': 0, 'Tt': 0, 'tt': 0 };
    const phenoCounts = { 'Tall': 0, 'Dwarf': 0 };

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        // Standardize: T always before t
        const alleles = [g1[r], g2[c]].sort((a, b) => a === 'T' ? -1 : 1).join('');
        cells.push({
          rowGamete: g1[r],
          colGamete: g2[c],
          genotype: alleles,
          phenotype: alleles.includes('T') ? 'Tall' : 'Dwarf'
        });
        genoCounts[alleles] = (genoCounts[alleles] || 0) + 1;
        if (alleles.includes('T')) phenoCounts['Tall']++;
        else phenoCounts['Dwarf']++;
      }
    }

    return {
      gametes1: g1,
      gametes2: g2,
      cells,
      genoCounts,
      phenoCounts,
      phenoRatio: `${phenoCounts['Tall']} Tall : ${phenoCounts['Dwarf']} Dwarf`,
      genoRatio: `${genoCounts['TT']} TT : ${genoCounts['Tt']} Tt : ${genoCounts['tt']} tt`
    };
  }

  // Calculate analytical Punnett square for Dihybrid (4x4)
  getDihybridGrid() {
    const getGametes = (geno) => {
      const shapeAlleles = [geno[0], geno[1]];
      const colorAlleles = [geno[2], geno[3]];
      const list = [];
      for (let s of shapeAlleles) {
        for (let c of colorAlleles) {
          list.push(s + c);
        }
      }
      return list;
    };

    const g1 = getGametes(this.diP1);
    const g2 = getGametes(this.diP2);

    const cells = [];
    const phenoCounts = {
      'Round Yellow': 0,
      'Round Green': 0,
      'Wrinkled Yellow': 0,
      'Wrinkled Green': 0
    };

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const gam1 = g1[r];
        const gam2 = g2[c];

        const shapes = [gam1[0], gam2[0]].sort((a, b) => a === 'R' ? -1 : 1).join('');
        const colors = [gam1[1], gam2[1]].sort((a, b) => a === 'Y' ? -1 : 1).join('');
        const fullGeno = shapes + colors;

        const isRound = shapes.includes('R');
        const isYellow = colors.includes('Y');

        let pheno = '';
        if (isRound && isYellow) pheno = 'Round Yellow';
        else if (isRound && !isYellow) pheno = 'Round Green';
        else if (!isRound && isYellow) pheno = 'Wrinkled Yellow';
        else pheno = 'Wrinkled Green';

        cells.push({
          rowGamete: gam1,
          colGamete: gam2,
          genotype: fullGeno,
          phenotype: pheno
        });
        phenoCounts[pheno]++;
      }
    }

    return {
      gametes1: g1,
      gametes2: g2,
      cells,
      phenoCounts,
      phenoRatio: `${phenoCounts['Round Yellow']} : ${phenoCounts['Round Green']} : ${phenoCounts['Wrinkled Yellow']} : ${phenoCounts['Wrinkled Green']}`
    };
  }

  // Simulate Monte Carlo batch offspring sampling
  sampleOffspring(count) {
    if (this.mode === 'monohybrid') {
      const g1 = [this.monoP1[0], this.monoP1[1]];
      const g2 = [this.monoP2[0], this.monoP2[1]];

      for (let i = 0; i < count; i++) {
        const a1 = g1[Math.floor(Math.random() * 2)];
        const a2 = g2[Math.floor(Math.random() * 2)];
        const pheno = (a1 === 'T' || a2 === 'T') ? 'Tall' : 'Dwarf';
        this.sampleCounts[pheno] = (this.sampleCounts[pheno] || 0) + 1;
        this.totalSamples++;
      }
    } else {
      const grid = this.getDihybridGrid();
      for (let i = 0; i < count; i++) {
        const randomCell = grid.cells[Math.floor(Math.random() * 16)];
        const pheno = randomCell.phenotype;
        this.sampleCounts[pheno] = (this.sampleCounts[pheno] || 0) + 1;
        this.totalSamples++;
      }
    }
  }

  logObservation() {
    const time = new Date().toLocaleTimeString();
    if (this.mode === 'monohybrid') {
      const g = this.getMonohybridGrid();
      this.history.unshift({
        time,
        cross: `Monohybrid (${this.monoP1} × ${this.monoP2})`,
        samples: this.totalSamples > 0 ? `${this.totalSamples} trials` : 'Theoretical 4',
        phenoRatio: g.phenoRatio,
        genoRatio: g.genoRatio
      });
    } else {
      const g = this.getDihybridGrid();
      this.history.unshift({
        time,
        cross: `Dihybrid (${this.diP1} × ${this.diP2})`,
        samples: this.totalSamples > 0 ? `${this.totalSamples} trials` : 'Theoretical 16',
        phenoRatio: g.phenoRatio,
        genoRatio: '16 Combinations'
      });
    }
    if (this.history.length > 20) this.history.pop();
  }

  generateQuiz() {
    // Generate random monohybrid cross question
    const options = ['TT', 'Tt', 'tt'];
    this.monoP1 = options[Math.floor(Math.random() * 3)];
    this.monoP2 = options[Math.floor(Math.random() * 3)];
    this.mode = 'monohybrid';

    const grid = this.getMonohybridGrid();
    const tallPercent = (grid.phenoCounts['Tall'] / 4) * 100;
    const heteroPercent = (grid.genoCounts['Tt'] / 4) * 100;

    this.quiz = {
      targetTall: tallPercent,
      targetHetero: heteroPercent,
      prompt: `In a monohybrid cross between parents ${this.monoP1} and ${this.monoP2}: What percentage of offspring will be phenotypically Tall, and what percentage will be heterozygous (Tt)?`
    };
    return this.quiz;
  }
}
