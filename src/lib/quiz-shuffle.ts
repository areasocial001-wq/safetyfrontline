/**
 * Quiz shuffling utilities.
 *
 * Goals (from verbale 26/05/2026):
 * - Randomize question order to avoid memorization.
 * - Randomize option order to avoid bias (correct answer was often "B").
 * - Re-map correctIndex so the underlying logic stays consistent.
 *
 * Deterministic seeding (per quiz attempt) means that within the same render
 * session the shuffle is stable — so the user doesn't see options jumping
 * around after selecting one. The seed is regenerated per section mount.
 */

import type { QuizQuestion } from '@/data/training-content';

/** Mulberry32 PRNG — small, fast, deterministic. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffle a single question's options and remap `correctIndex`.
 * Returns a NEW object — does not mutate the input.
 */
export function shuffleQuestionOptions(q: QuizQuestion, rand: () => number): QuizQuestion {
  // Pair each option with its original index, then shuffle pairs.
  const paired = q.options.map((opt, i) => ({ opt, i }));
  shuffleInPlace(paired, rand);
  const newOptions = paired.map(p => p.opt);
  const newCorrectIndex = paired.findIndex(p => p.i === q.correctIndex);
  return { ...q, options: newOptions, correctIndex: newCorrectIndex };
}

/**
 * Shuffle both questions order AND each question's options.
 * `seed` allows reproducibility within a session.
 */
export function shuffleQuestions(questions: QuizQuestion[], seed: number): QuizQuestion[] {
  const rand = mulberry32(seed);
  const shuffled = questions.map(q => shuffleQuestionOptions(q, rand));
  shuffleInPlace(shuffled, rand);
  return shuffled;
}

/** Generates a fresh seed per attempt. */
export function makeQuizSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
