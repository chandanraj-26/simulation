/**
 * OpticsLab — Interactive Lens Simulation
 * Interactive Guided Challenges & Quizzes Module
 */

import { state, setState } from './state.js';
import { calculateOptics } from './optics.js';

export const challenges = [
  {
    id: 1,
    title: 'Challenge 1: The 1:1 Inverted Image (m = -1)',
    badge: 'Beginner',
    lensType: 'convex',
    focalLength: 20,
    description: 'Find the position of the object such that the formed image is **Real, Inverted, and EXACTLY the same size** as the object (|m| = 1.0).',
    hint: 'Think about where the object must be relative to the focal length. What happens at 2F₁?',
    check: (optics) => {
      return (
        optics.lensType === 'convex' &&
        optics.isReal === true &&
        Math.abs(Math.abs(optics.m) - 1.0) <= 0.05
      );
    },
    successMessage: '🎉 Brilliant! When the object is placed at 2F₁ (u = -2f), the image forms at 2F₂ with identical size (m = -1.0) and inverted!'
  },
  {
    id: 2,
    title: 'Challenge 2: The Reading Magnifier (Virtual & 2x+)',
    badge: 'Intermediate',
    lensType: 'convex',
    focalLength: 20,
    description: 'Turn this convex lens into a **magnifying glass**! Form a **Virtual, Upright** image magnified to at least **2.0×** its original size.',
    hint: 'Move the object between the near focal point F₁ and the optical center O (u > -f).',
    check: (optics) => {
      return (
        optics.lensType === 'convex' &&
        optics.isReal === false &&
        optics.m >= 2.0
      );
    },
    successMessage: '🔍 Excellent! When an object is placed inside the focal length (between F₁ and O), rays diverge after refraction, creating a magnified virtual image on the same side!'
  },
  {
    id: 3,
    title: 'Challenge 3: Movie Projector (Real & 2.5x+)',
    badge: 'Intermediate',
    lensType: 'convex',
    focalLength: 20,
    description: 'In a cinema projector, small film frames are magnified onto a massive theater screen. Create a **Real, Inverted** image magnified to at least **2.5×** (|m| ≥ 2.5).',
    hint: 'Position the object between F₁ and 2F₁ (closer to F₁).',
    check: (optics) => {
      return (
        optics.lensType === 'convex' &&
        optics.isReal === true &&
        Math.abs(optics.m) >= 2.45
      );
    },
    successMessage: '🎬 Spot on! Placing the object between F₁ and 2F₁ produces a heavily enlarged real image formed beyond 2F₂—the exact principle of slide and cinema projectors!'
  },
  {
    id: 4,
    title: 'Challenge 4: The Parallel Searchlight (Image at Infinity)',
    badge: 'Advanced',
    lensType: 'convex',
    focalLength: 20,
    description: 'Position the object so that all emergent rays become **completely parallel** to form an image at **Infinity (∞)**.',
    hint: 'Where should a light bulb be placed in a lighthouse or searchlight? Right at the focus!',
    check: (optics) => {
      return (
        optics.lensType === 'convex' &&
        (optics.isAtInfinity || Math.abs(optics.u - (-optics.f)) <= 0.8)
      );
    },
    successMessage: '🔦 Incredible! Placing the source at the principal focus F₁ (u = -f) causes all refracted rays to exit parallel, directing light beams to infinity!'
  },
  {
    id: 5,
    title: 'Challenge 5: The Concave Lens Investigation',
    badge: 'Concept Check',
    lensType: 'concave',
    focalLength: 25,
    description: 'Switch to a **Concave Lens**. Try dragging the object everywhere from -10 cm to -90 cm. Can you ever produce a Real image?',
    hint: 'Observe the diverging rays. Do they ever cross on the other side?',
    check: (optics) => {
      return (
        optics.lensType === 'concave' &&
        optics.isReal === false &&
        optics.isUpright === true &&
        optics.sizeCategory === 'diminished'
      );
    },
    successMessage: '✨ Correct! A concave lens always diverges incident light. For any real object, the image is ALWAYS Virtual, Upright, Diminished, and trapped between O and F₁!'
  }
];

let activeChallengeIndex = null;

export function getChallenges() {
  return challenges;
}

export function getCurrentChallenge() {
  return activeChallengeIndex !== null ? challenges[activeChallengeIndex] : null;
}

export function startChallenge(index) {
  if (index < 0 || index >= challenges.length) return;
  activeChallengeIndex = index;
  const ch = challenges[index];

  setState({
    lensType: ch.lensType,
    focalLength: ch.focalLength,
    objectDistance: -55, // reset to a non-matching default
    objectHeight: 15,
    activeChallenge: ch.id,
    challengeSolved: false
  });
}

export function exitChallenge() {
  activeChallengeIndex = null;
  setState({
    activeChallenge: null,
    challengeSolved: false
  });
}

export function evaluateChallenge() {
  if (activeChallengeIndex === null) return null;
  const ch = challenges[activeChallengeIndex];
  const optics = calculateOptics(state);
  const isSolved = ch.check(optics);

  if (isSolved && !state.challengeSolved) {
    setState({ challengeSolved: true });
  }

  return {
    challenge: ch,
    isSolved,
    successMessage: ch.successMessage
  };
}
