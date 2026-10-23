/**
 * MicroscopeSim — Optical Physics & Coordinate Engine
 * Computes depth-of-field, focal plane blur, numerical aperture, immersion oil refraction,
 * magnification scaling, and world-to-screen coordinate hit-testing.
 */

class MicroscopeEngine {
  constructor(state) {
    this.state = state;
  }

  update() {
    // 1. Calculate Optical Focal Quality
    this.state.clarity = this.calculateClarity();
  }

  calculateClarity() {
    const obj = this.state.objective;
    const coarseDelta = Math.abs(this.state.coarseFocus - 50);
    const fineDelta = Math.abs(this.state.fineFocus - 50);

    let dofCoarseWeight = 1.0;
    let dofFineWeight = 1.0;
    let maxTolerance = 15;

    switch (obj) {
      case '4x':
        // Scanning objective: very wide depth of field
        dofCoarseWeight = 0.5;
        dofFineWeight = 0.1;
        maxTolerance = 25;
        break;
      case '10x':
        // Low power: moderate depth of field
        dofCoarseWeight = 1.0;
        dofFineWeight = 0.3;
        maxTolerance = 16;
        break;
      case '40x':
        // High dry: shallow depth of field, fine focus required
        dofCoarseWeight = 2.4;
        dofFineWeight = 1.2;
        maxTolerance = 7;
        break;
      case '100x':
        // Oil immersion: razor-thin focal plane
        dofCoarseWeight = 4.0;
        dofFineWeight = 2.0;
        maxTolerance = 4;
        break;
    }

    const focalError = (coarseDelta * dofCoarseWeight + fineDelta * dofFineWeight);
    let clarity = Math.max(0.05, 1.0 - (focalError / (maxTolerance * 3.5)));

    // Numerical Aperture & Immersion Oil Physics for 100x
    if (obj === '100x' && !this.state.hasImmersionOil) {
      // Without oil, light disperses at the glass-air boundary (n_air = 1.000 vs n_glass = 1.515)
      // Caps clarity at 0.35 and introduces severe optical haze
      clarity = Math.min(0.35, clarity * 0.4);
    }

    return parseFloat(clarity.toFixed(3));
  }

  getMagnificationScale() {
    switch (this.state.objective) {
      case '4x':
        return 0.55;
      case '10x':
        return 1.15;
      case '40x':
        return 3.60;
      case '100x':
        return 8.20;
      default:
        return 1.15;
    }
  }

  getBlurRadius() {
    // Optical blur in screen pixels
    const clarity = this.state.clarity;
    return (1.0 - clarity) * 14.0;
  }

  screenToSlideCoords(screenX, screenY, viewportCenterX, viewportCenterY) {
    const scale = this.getMagnificationScale();
    const slideX = (screenX - viewportCenterX) / scale - this.state.stageX;
    const slideY = (screenY - viewportCenterY) / scale - this.state.stageY;
    return { x: slideX, y: slideY };
  }

  slideToScreenCoords(slideX, slideY, viewportCenterX, viewportCenterY) {
    const scale = this.getMagnificationScale();
    const screenX = viewportCenterX + (slideX + this.state.stageX) * scale;
    const screenY = viewportCenterY + (slideY + this.state.stageY) * scale;
    return { x: screenX, y: screenY };
  }

  hitTestCell(screenX, screenY, viewportCenterX, viewportCenterY, radius) {
    const slide = window.cellsData && window.cellsData.slides[this.state.slide];
    if (!slide || !slide.cells) return null;

    const { x, y } = this.screenToSlideCoords(screenX, screenY, viewportCenterX, viewportCenterY);

    // Find cell within boundary (radial for animal cells, rectangular for plant cells)
    for (const cell of slide.cells) {
      if (cell.specimen === 'whitefish') {
        const r = cell.w * 0.5;
        const dist = Math.hypot(x - cell.x, y - cell.y);
        if (dist <= r) {
          return cell;
        }
      } else {
        const halfW = cell.w * 0.5;
        const halfH = cell.h * 0.5;
        if (x >= cell.x - halfW && x <= cell.x + halfW &&
            y >= cell.y - halfH && y <= cell.y + halfH) {
          return cell;
        }
      }
    }
    return null;
  }
}

// Global engine singleton
window.MicroscopeEngine = MicroscopeEngine;
