/**
 * AudioContext unlock helper + diagnostics.
 *
 * Browsers (Chrome/Safari/Firefox) block AudioContexts created without an
 * active user gesture — they start in 'suspended' state and produce no sound.
 * This helper:
 *  1. Tracks every AudioContext created in the app
 *  2. Resumes them on the first user gesture (pointerdown / keydown / touchstart)
 *  3. Exposes `registerAudioContext` so newly-created contexts get unlocked too
 *  4. Exposes a snapshot + subscription API for live diagnostics overlays
 */

const tracked = new Set<AudioContext>();
let listenersAttached = false;
let pollInterval: ReturnType<typeof setInterval> | null = null;

export interface AudioCtxStats {
  total: number;
  running: number;
  suspended: number;
  closed: number;
  /** True if at least one context exists and all non-closed are running */
  allRunning: boolean;
  /** Aggregate state label */
  state: 'none' | 'running' | 'suspended' | 'mixed' | 'closed';
}

type Listener = (stats: AudioCtxStats) => void;
const listeners = new Set<Listener>();

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
  notify();
}

export function getAudioStats(): AudioCtxStats {
  let running = 0, suspended = 0, closed = 0;
  tracked.forEach(ctx => {
    switch (ctx.state) {
      case 'running': running++; break;
      case 'suspended': suspended++; break;
      case 'closed': closed++; break;
    }
  });
  const total = tracked.size;
  const live = total - closed;
  let state: AudioCtxStats['state'] = 'none';
  if (total === 0) state = 'none';
  else if (live === 0) state = 'closed';
  else if (running === live) state = 'running';
  else if (suspended === live) state = 'suspended';
  else state = 'mixed';
  return { total, running, suspended, closed, allRunning: live > 0 && running === live, state };
}

function notify() {
  if (listeners.size === 0) return;
  const stats = getAudioStats();
  listeners.forEach(l => { try { l(stats); } catch {} });
}

function ensurePolling() {
  if (pollInterval || typeof window === 'undefined') return;
  // Poll because AudioContext.state has no native change event in all browsers
  pollInterval = setInterval(() => {
    // Sweep closed contexts
    tracked.forEach(ctx => { if (ctx.state === 'closed') tracked.delete(ctx); });
    notify();
  }, 500);
}

export function subscribeAudioStats(listener: Listener): () => void {
  listeners.add(listener);
  ensurePolling();
  // Push initial snapshot
  try { listener(getAudioStats()); } catch {}
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };
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
  tryResume(ctx);
  notify();
}

export function unlockAllAudioContexts() {
  attachListeners();
  unlockAll();
}
