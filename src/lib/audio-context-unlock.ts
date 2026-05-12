/**
 * AudioContext unlock helper.
 *
 * Browsers (Chrome/Safari/Firefox) block AudioContexts created without an
 * active user gesture — they start in 'suspended' state and produce no sound.
 * This helper:
 *  1. Tracks every AudioContext created in the app
 *  2. Resumes them on the first user gesture (pointerdown / keydown / touchstart)
 *  3. Exposes `registerAudioContext` so newly-created contexts get unlocked too
 */

const tracked = new Set<AudioContext>();
let listenersAttached = false;

function tryResume(ctx: AudioContext) {
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch {
    // ignore
  }
}

function unlockAll() {
  tracked.forEach(ctx => {
    if (ctx.state === 'closed') {
      tracked.delete(ctx);
      return;
    }
    tryResume(ctx);
  });
}

function attachListeners() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  const handler = () => unlockAll();
  const opts: AddEventListenerOptions = { capture: true, passive: true };
  window.addEventListener('pointerdown', handler, opts);
  window.addEventListener('keydown', handler, opts);
  window.addEventListener('touchstart', handler, opts);
  window.addEventListener('click', handler, opts);
}

export function registerAudioContext(ctx: AudioContext | null | undefined) {
  if (!ctx) return;
  attachListeners();
  tracked.add(ctx);
  // Try immediately in case we're already inside a user gesture
  tryResume(ctx);
}

export function unlockAllAudioContexts() {
  attachListeners();
  unlockAll();
}
