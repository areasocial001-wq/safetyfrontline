/**
 * NPC Ambient Sound System
 * Procedural spatial audio for NPCs: breathing, keyboard typing, footsteps.
 * Uses Web Audio API with distance-based attenuation.
 */

export type NPCSoundType = 'breathing' | 'typing' | 'footsteps';

interface NPCSoundSource {
  id: string;
  type: NPCSoundType;
  getPosition: () => { x: number; y: number; z: number };
  gainNode: GainNode;
  nodes: AudioNode[];
  intervalId?: ReturnType<typeof setInterval>;
  isActive: boolean;
}

export class NPCAmbientSoundSystem {
  private ctx: AudioContext | null = null;
  private sources: Map<string, NPCSoundSource> = new Map();
  private masterGain: GainNode | null = null;
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private getCameraPosition: (() => { x: number; y: number; z: number }) | null = null;
  private maxDistance = 12;
  private disposed = false;

  constructor() {}

  init(getCameraPosition: () => { x: number; y: number; z: number }) {
    if (this.disposed) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Register for unlock-on-gesture (Chrome/Safari autoplay policy)
    import('./audio-context-unlock').then(m => m.registerAudioContext(this.ctx)).catch(() => {});
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.4;
    this.masterGain.connect(this.ctx.destination);
    this.getCameraPosition = getCameraPosition;

    // Update spatial volumes at ~15fps
    this.updateInterval = setInterval(() => this.updateVolumes(), 66);
  }

  private distanceTo(pos: { x: number; y: number; z: number }): number {
    if (!this.getCameraPosition) return Infinity;
    const cam = this.getCameraPosition();
    const dx = cam.x - pos.x;
    const dz = cam.z - pos.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  private updateVolumes() {
    if (!this.ctx || this.disposed) return;
    this.sources.forEach(source => {
      if (!source.isActive) return;
      const dist = this.distanceTo(source.getPosition());
      // Inverse distance with rolloff
      const vol = dist < 1 ? 1 : Math.max(0, 1 - dist / this.maxDistance);
      const smoothVol = vol * vol; // Quadratic rolloff for natural feel
      source.gainNode.gain.linearRampToValueAtTime(smoothVol, this.ctx!.currentTime + 0.1);
    });
  }

  /** Add breathing sound for stationary idle NPCs */
  addBreathingSound(id: string, getPosition: () => { x: number; y: number; z: number }) {
    if (!this.ctx || !this.masterGain || this.disposed) return;
    const ctx = this.ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(this.masterGain);

    // Breathing: filtered noise bursts in a cycle
    const bufferSize = ctx.sampleRate * 2; // 2-second loop
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    // Shape noise as inhale/exhale cycle
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const cycle = t % 3.5; // 3.5s breath cycle
      let envelope = 0;
      if (cycle < 1.2) {
        // Inhale
        envelope = Math.sin((cycle / 1.2) * Math.PI) * 0.15;
      } else if (cycle > 1.8 && cycle < 3.0) {
        // Exhale
        envelope = Math.sin(((cycle - 1.8) / 1.2) * Math.PI) * 0.2;
      }
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400 + Math.random() * 200;
    filter.Q.value = 1.5;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    noiseSource.start(ctx.currentTime + Math.random() * 2);

    this.sources.set(id, {
      id, type: 'breathing', getPosition, gainNode,
      nodes: [noiseSource, filter], isActive: true,
    });
  }

  /** Add keyboard typing sound for office NPCs with 'writing' behavior */
  addTypingSound(id: string, getPosition: () => { x: number; y: number; z: number }) {
    if (!this.ctx || !this.masterGain || this.disposed) return;
    const ctx = this.ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(this.masterGain);

    const nodes: AudioNode[] = [];

    // Generate rapid click bursts using oscillator pings at random intervals
    const playClick = () => {
      if (ctx.state === 'closed' || this.disposed) return;
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.frequency.value = 2000 + Math.random() * 3000;
      osc.type = 'square';

      filter.type = 'highpass';
      filter.frequency.value = 1500;

      const now = ctx.currentTime;
      clickGain.gain.setValueAtTime(0.3 + Math.random() * 0.4, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02 + Math.random() * 0.015);

      osc.connect(filter);
      filter.connect(clickGain);
      clickGain.connect(gainNode);

      osc.start(now);
      osc.stop(now + 0.04);
    };

    // Type in bursts: rapid clicks, then pause
    const typeLoop = () => {
      if (this.disposed) return;
      // Burst of 3-8 keystrokes
      const burstCount = 3 + Math.floor(Math.random() * 6);
      for (let i = 0; i < burstCount; i++) {
        setTimeout(() => playClick(), i * (40 + Math.random() * 80));
      }
    };

    const intervalId = setInterval(typeLoop, 800 + Math.random() * 1500);
    typeLoop(); // Start immediately

    this.sources.set(id, {
      id, type: 'typing', getPosition, gainNode,
      nodes, intervalId, isActive: true,
    });
  }

  /** Add footstep sounds for walking NPCs */
  addFootstepSound(id: string, getPosition: () => { x: number; y: number; z: number }, stepInterval = 500) {
    if (!this.ctx || !this.masterGain || this.disposed) return;
    const ctx = this.ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(this.masterGain);

    const playStep = () => {
      if (ctx.state === 'closed' || this.disposed) return;
      const osc = ctx.createOscillator();
      const stepGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Low thud for footstep
      osc.frequency.value = 60 + Math.random() * 40;
      osc.type = 'sine';

      filter.type = 'lowpass';
      filter.frequency.value = 200 + Math.random() * 100;

      const now = ctx.currentTime;
      const vol = 0.5 + Math.random() * 0.3;
      stepGain.gain.setValueAtTime(vol, now);
      stepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + Math.random() * 0.04);

      osc.connect(filter);
      filter.connect(stepGain);
      stepGain.connect(gainNode);

      osc.start(now);
      osc.stop(now + 0.12);

      // Add slight shoe scuff noise on some steps
      if (Math.random() > 0.5) {
        const bufLen = Math.floor(ctx.sampleRate * 0.05);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          ch[i] = (Math.random() * 2 - 1) * (1 - i / bufLen) * 0.1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const nf = ctx.createBiquadFilter();
        nf.type = 'bandpass';
        nf.frequency.value = 3000 + Math.random() * 2000;
        nf.Q.value = 0.5;
        noise.connect(nf);
        nf.connect(gainNode);
        noise.start(now + 0.01);
      }
    };

    // Vary step timing slightly
    const jitteredInterval = stepInterval + (Math.random() - 0.5) * 100;
    const intervalId = setInterval(playStep, jitteredInterval);

    this.sources.set(id, {
      id, type: 'footsteps', getPosition, gainNode,
      nodes: [], intervalId, isActive: true,
    });
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  removeSource(id: string) {
    const source = this.sources.get(id);
    if (!source) return;
    if (source.intervalId) clearInterval(source.intervalId);
    source.nodes.forEach(n => { try { (n as any).stop?.(); (n as any).disconnect?.(); } catch {} });
    try { source.gainNode.disconnect(); } catch {}
    this.sources.delete(id);
  }

  dispose() {
    this.disposed = true;
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.sources.forEach((_, id) => this.removeSource(id));
    this.sources.clear();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
    this.masterGain = null;
  }
}
