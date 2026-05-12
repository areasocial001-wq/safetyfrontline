// Audio system for 3D game scenarios
// Uses Web Audio API for ambient sounds and Speech Synthesis API for voice-over

// ============= ATMOSPHERIC SOUNDTRACK CLASS =============
export class AtmosphericSoundtrack {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private sources: AudioNode[] = [];
  
  // Layers
  private droneGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private percussionGain: GainNode | null = null;
  private tensionGain: GainNode | null = null;
  
  // Intensity (0.0 = minimo, 1.0 = massimo)
  private currentIntensity = 0.0;
  private targetIntensity = 0.0;
  
  // Oscillators e nodi attivi
  private activeOscillators: OscillatorNode[] = [];
  private intervals: any[] = [];

  async initialize() {
    this.audioContext = new AudioContext();
    import('./audio-context-unlock').then(m => m.registerAudioContext(this.audioContext)).catch(() => {});
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.4; // Volume generale soundtrack
    this.masterGain.connect(this.audioContext.destination);

    // Gain nodes per ogni layer
    this.droneGain = this.audioContext.createGain();
    this.padGain = this.audioContext.createGain();
    this.percussionGain = this.audioContext.createGain();
    this.tensionGain = this.audioContext.createGain();

    this.droneGain.connect(this.masterGain);
    this.padGain.connect(this.masterGain);
    this.percussionGain.connect(this.masterGain);
    this.tensionGain.connect(this.masterGain);
  }

  // Avvia musica di sottofondo
  start() {
    if (!this.audioContext || this.isPlaying) return;
    this.isPlaying = true;

    this.createDroneLayer();
    this.createPadLayer();
    this.createPercussionLayer();
    this.createTensionLayer();
    
    // Sistema di interpolazione intensità
    this.startIntensityInterpolation();
  }

  // Ferma musica
  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    // Fade out graduale
    if (this.masterGain && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 2.0);
    }

    setTimeout(() => {
      this.activeOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      this.activeOscillators = [];
      
      this.intervals.forEach(interval => clearInterval(interval));
      this.intervals = [];
    }, 2100);
  }

  // Imposta intensità (0.0 - 1.0)
  // 0.0 = minimo (solo droni), 1.0 = massimo (tutti i layer attivi)
  setIntensity(value: number) {
    this.targetIntensity = Math.max(0, Math.min(1, value));
  }

  // Interpolazione smooth dell'intensità
  private startIntensityInterpolation() {
    const updateInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(updateInterval);
        return;
      }

      // Smooth interpolation
      const diff = this.targetIntensity - this.currentIntensity;
      this.currentIntensity += diff * 0.05; // Velocità di transizione

      // Aggiorna gain dei layer in base all'intensità
      this.updateLayerVolumes();
    }, 50);
    
    this.intervals.push(updateInterval);
  }

  private updateLayerVolumes() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const intensity = this.currentIntensity;

    // Droni: sempre attivi, aumentano con intensità
    if (this.droneGain) {
      const droneVol = 0.3 + (intensity * 0.4);
      this.droneGain.gain.linearRampToValueAtTime(droneVol, now + 0.5);
    }

    // Pad: si attivano a intensità > 0.2
    if (this.padGain) {
      const padVol = intensity > 0.2 ? (intensity - 0.2) * 0.8 : 0;
      this.padGain.gain.linearRampToValueAtTime(padVol, now + 0.5);
    }

    // Percussioni: si attivano a intensità > 0.4
    if (this.percussionGain) {
      const percVol = intensity > 0.4 ? (intensity - 0.4) * 1.0 : 0;
      this.percussionGain.gain.linearRampToValueAtTime(percVol, now + 0.5);
    }

    // Tensione: si attiva a intensità > 0.6
    if (this.tensionGain) {
      const tensionVol = intensity > 0.6 ? (intensity - 0.6) * 1.2 : 0;
      this.tensionGain.gain.linearRampToValueAtTime(tensionVol, now + 0.5);
    }
  }

  // LAYER 1: Droni profondi (sempre attivi)
  private createDroneLayer() {
    if (!this.audioContext || !this.droneGain) return;

    const ctx = this.audioContext;
    
    // Drone sub-bass profondo
    const subBass = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();
    subFilter.type = "lowpass";
    subFilter.frequency.setValueAtTime(120, ctx.currentTime);
    subBass.type = "sine";
    subBass.frequency.setValueAtTime(40, ctx.currentTime);
    subGain.gain.setValueAtTime(0.5, ctx.currentTime);
    subBass.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.droneGain);
    subBass.start();
    this.activeOscillators.push(subBass);

    // Drone mid oscuro
    const midDrone = ctx.createOscillator();
    const midGain = ctx.createGain();
    const midFilter = ctx.createBiquadFilter();
    midFilter.type = "lowpass";
    midFilter.frequency.setValueAtTime(200, ctx.currentTime);
    midDrone.type = "sawtooth";
    midDrone.frequency.setValueAtTime(65, ctx.currentTime);
    midGain.gain.setValueAtTime(0.3, ctx.currentTime);
    midDrone.connect(midFilter);
    midFilter.connect(midGain);
    midGain.connect(this.droneGain);
    midDrone.start();
    this.activeOscillators.push(midDrone);
    
    // Modulazione lenta del mid drone
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    lfoGain.gain.setValueAtTime(3, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(midDrone.frequency);
    lfo.start();
    this.activeOscillators.push(lfo);
  }

  // LAYER 2: Pad sintetici atmosferici
  private createPadLayer() {
    if (!this.audioContext || !this.padGain) return;

    const ctx = this.audioContext;
    
    // Pad principale (accordo minore oscuro)
    const frequencies = [220, 261.63, 293.66]; // A3, C4, D4 (triste/teso)
    
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800 + (idx * 200), ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      // Modulazione sottile
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.1 + (idx * 0.05), ctx.currentTime);
      lfoGain.gain.setValueAtTime(2, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      this.activeOscillators.push(lfo);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.padGain);
      osc.start();
      this.activeOscillators.push(osc);
    });
  }

  // LAYER 3: Percussioni metalliche industrial
  private createPercussionLayer() {
    if (!this.audioContext || !this.percussionGain) return;

    const ctx = this.audioContext;
    
    // Kick profondo industrial (ogni 2 secondi)
    const kickInterval = setInterval(() => {
      if (!this.isPlaying || !ctx || !this.percussionGain) return;
      
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      const kickFilter = ctx.createBiquadFilter();
      
      kickFilter.type = "lowpass";
      kickFilter.frequency.setValueAtTime(150, ctx.currentTime);
      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(80, ctx.currentTime);
      
      const now = ctx.currentTime;
      kickGain.gain.setValueAtTime(0.6, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      kickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      
      kickOsc.connect(kickFilter);
      kickFilter.connect(kickGain);
      kickGain.connect(this.percussionGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.5);
    }, 2000);
    this.intervals.push(kickInterval);

    // Hi-hat metallico (pattern irregolare)
    const hihatInterval = setInterval(() => {
      if (!this.isPlaying || !ctx || !this.percussionGain) return;
      
      const hihat = ctx.createOscillator();
      const hihatGain = ctx.createGain();
      const hihatFilter = ctx.createBiquadFilter();
      
      hihatFilter.type = "highpass";
      hihatFilter.frequency.setValueAtTime(6000, ctx.currentTime);
      hihat.type = "square";
      hihat.frequency.setValueAtTime(8000, ctx.currentTime);
      
      const now = ctx.currentTime;
      hihatGain.gain.setValueAtTime(0.15, now);
      hihatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      hihat.connect(hihatFilter);
      hihatFilter.connect(hihatGain);
      hihatGain.connect(this.percussionGain);
      hihat.start(now);
      hihat.stop(now + 0.1);
    }, Math.random() * 600 + 400);
    this.intervals.push(hihatInterval);
  }

  // LAYER 4: Tensione crescente (rischio alto)
  private createTensionLayer() {
    if (!this.audioContext || !this.tensionGain) return;

    const ctx = this.audioContext;
    
    // Sweep ascendente drammatico (ogni 8 secondi)
    const sweepInterval = setInterval(() => {
      if (!this.isPlaying || !ctx || !this.tensionGain) return;
      if (this.currentIntensity < 0.6) return; // Attivo solo ad alta intensità
      
      const sweep = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      const sweepFilter = ctx.createBiquadFilter();
      
      sweepFilter.type = "bandpass";
      sweepFilter.Q.setValueAtTime(5, ctx.currentTime);
      sweep.type = "sawtooth";
      
      const now = ctx.currentTime;
      const duration = 3.0;
      
      sweep.frequency.setValueAtTime(100, now);
      sweep.frequency.exponentialRampToValueAtTime(800, now + duration);
      sweepFilter.frequency.setValueAtTime(200, now);
      sweepFilter.frequency.exponentialRampToValueAtTime(1600, now + duration);
      
      sweepGain.gain.setValueAtTime(0, now);
      sweepGain.gain.linearRampToValueAtTime(0.3, now + 0.3);
      sweepGain.gain.linearRampToValueAtTime(0.3, now + duration - 0.5);
      sweepGain.gain.linearRampToValueAtTime(0, now + duration);
      
      sweep.connect(sweepFilter);
      sweepFilter.connect(sweepGain);
      sweepGain.connect(this.tensionGain);
      sweep.start(now);
      sweep.stop(now + duration + 0.1);
    }, 8000);
    this.intervals.push(sweepInterval);

    // Allarme distante industrial
    const alarmInterval = setInterval(() => {
      if (!this.isPlaying || !ctx || !this.tensionGain) return;
      if (this.currentIntensity < 0.7) return;
      
      const alarm = ctx.createOscillator();
      const alarmGain = ctx.createGain();
      const alarmFilter = ctx.createBiquadFilter();
      
      alarmFilter.type = "lowpass";
      alarmFilter.frequency.setValueAtTime(600, ctx.currentTime);
      alarm.type = "sawtooth";
      alarm.frequency.setValueAtTime(180, ctx.currentTime);
      
      const now = ctx.currentTime;
      alarmGain.gain.setValueAtTime(0, now);
      alarmGain.gain.linearRampToValueAtTime(0.25, now + 0.2);
      alarm.frequency.linearRampToValueAtTime(140, now + 0.6);
      alarmGain.gain.linearRampToValueAtTime(0, now + 0.8);
      
      alarm.connect(alarmFilter);
      alarmFilter.connect(alarmGain);
      alarmGain.connect(this.tensionGain);
      alarm.start(now);
      alarm.stop(now + 0.9);
    }, 12000);
    this.intervals.push(alarmInterval);
  }
}

export class AmbientAudioPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;
  private isPlaying = false;
  private sources: AudioNode[] = [];
  private intervals: any[] = [];
  
  // Dynamic audio effects
  private dynamicFilter: BiquadFilterNode | null = null;
  private convolver: ConvolverNode | null = null;
  private effectsChain: GainNode | null = null;
  private collisionMuffleTimeout: any = null;

  // Escalating fire alarm
  private fireAlarmOsc: OscillatorNode | null = null;
  private fireAlarmGain: GainNode | null = null;
  private fireAlarmFilter: BiquadFilterNode | null = null;
  private fireAlarmIntensity = 0;

  // Panic audio layer (activated at 70%+ fire)
  private panicOsc1: OscillatorNode | null = null;
  private panicOsc2: OscillatorNode | null = null;
  private panicGain: GainNode | null = null;
  private heartbeatInterval: any = null;
  private panicActive = false;

  async initialize() {
    import('./audio-context-unlock').then(m => m.registerAudioContext(this.audioContext)).catch(() => {});
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    
    // Create dynamic filter for collision effects
    this.dynamicFilter = this.audioContext.createBiquadFilter();
    this.dynamicFilter.type = "lowpass";
    this.dynamicFilter.frequency.value = 8000;
    this.dynamicFilter.Q.value = 1;
    
    // Connect: gainNode -> filter -> destination
    this.gainNode.connect(this.dynamicFilter);
    this.dynamicFilter.connect(this.audioContext.destination);
  }

  // Generate synthetic reverb impulse response
  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * decay * 3);
      
      // Add multiple reflections with decay
      leftChannel[i] = (Math.random() * 2 - 1) * envelope;
      rightChannel[i] = (Math.random() * 2 - 1) * envelope;
      
      // Add early reflections (first 50ms)
      if (t < 0.05) {
        leftChannel[i] *= 2;
        rightChannel[i] *= 2;
      }
    }
    
    return impulse;
  }

  // Apply collision muffling effect (temporary)
  applyCollisionMuffle(duration: number = 0.5) {
    if (!this.audioContext || !this.dynamicFilter) return;
    
    const now = this.audioContext.currentTime;
    
    // Clear previous timeout if exists
    if (this.collisionMuffleTimeout) {
      clearTimeout(this.collisionMuffleTimeout);
    }
    
    // Sudden drop to muffled frequency
    this.dynamicFilter.frequency.cancelScheduledValues(now);
    this.dynamicFilter.frequency.setValueAtTime(this.dynamicFilter.frequency.value, now);
    this.dynamicFilter.frequency.exponentialRampToValueAtTime(300, now + 0.05);
    this.dynamicFilter.Q.setValueAtTime(5, now);
    
    // Gradually restore
    this.collisionMuffleTimeout = setTimeout(() => {
      if (!this.audioContext || !this.dynamicFilter) return;
      const restoreTime = this.audioContext.currentTime;
      this.dynamicFilter.frequency.cancelScheduledValues(restoreTime);
      this.dynamicFilter.frequency.setValueAtTime(300, restoreTime);
      this.dynamicFilter.frequency.exponentialRampToValueAtTime(8000, restoreTime + duration);
      this.dynamicFilter.Q.linearRampToValueAtTime(1, restoreTime + duration);
    }, 50);
  }

  playAmbient(type: "warehouse" | "construction" | "laboratory" | "office", volume: number = 0.3) {
    if (!this.audioContext || !this.gainNode) return;
    
    this.stop();
    this.isPlaying = true;
    this.gainNode.gain.value = volume;

    const ctx = this.audioContext;
    const outputNode = this.gainNode; // Connect directly to gainNode

    switch (type) {
      case "warehouse":
        // === PRESET INDUSTRIALE: Suoni Magazzino ===
        
        // 1. Ronzio profondo macchinari industriali
        const warehouseDrone = ctx.createOscillator();
        const warehouseDroneGain = ctx.createGain();
        const warehouseDroneFilter = ctx.createBiquadFilter();
        warehouseDroneFilter.type = "lowpass";
        warehouseDroneFilter.frequency.setValueAtTime(150, ctx.currentTime);
        warehouseDrone.type = "sawtooth";
        warehouseDrone.frequency.setValueAtTime(55, ctx.currentTime);
        warehouseDroneGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
        warehouseDrone.connect(warehouseDroneFilter);
        warehouseDroneFilter.connect(warehouseDroneGain);
        warehouseDroneGain.connect(outputNode);
        warehouseDrone.start();
        this.sources.push(warehouseDrone);

        // 2. Rombo profondo carrello elevatore (meno ripetitivo)
        const forkliftRumble = ctx.createOscillator();
        const forkliftGain = ctx.createGain();
        const forkliftFilter = ctx.createBiquadFilter();
        forkliftFilter.type = "lowpass";
        forkliftFilter.frequency.setValueAtTime(180, ctx.currentTime);
        forkliftRumble.type = "sawtooth";
        forkliftRumble.frequency.setValueAtTime(45, ctx.currentTime);
        forkliftGain.gain.setValueAtTime(0, ctx.currentTime);
        const forkliftInterval = setInterval(() => {
          const now = ctx.currentTime;
          const duration = Math.random() * 1.5 + 1.0;
          forkliftGain.gain.cancelScheduledValues(now);
          forkliftGain.gain.setValueAtTime(0, now);
          forkliftGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.3);
          forkliftGain.gain.linearRampToValueAtTime(volume * 0.3, now + duration);
          forkliftGain.gain.linearRampToValueAtTime(0, now + duration + 0.4);
        }, Math.random() * 8000 + 6000);
        this.intervals.push(forkliftInterval);
        forkliftRumble.connect(forkliftFilter);
        forkliftFilter.connect(forkliftGain);
        forkliftGain.connect(outputNode);
        forkliftRumble.start();
        this.sources.push(forkliftRumble);

        // 3. Nastri trasportatori
        const conveyor = ctx.createOscillator();
        const conveyorGain = ctx.createGain();
        const conveyorFilter = ctx.createBiquadFilter();
        conveyorFilter.type = "bandpass";
        conveyorFilter.frequency.setValueAtTime(300, ctx.currentTime);
        conveyorFilter.Q.setValueAtTime(2, ctx.currentTime);
        conveyor.type = "square";
        conveyor.frequency.setValueAtTime(150, ctx.currentTime);
        conveyorGain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
        conveyor.connect(conveyorFilter);
        conveyorFilter.connect(conveyorGain);
        conveyorGain.connect(outputNode);
        conveyor.start();
        this.sources.push(conveyor);

        // 4. Sirena industriale profonda (molto rara)
        const sirenOsc = ctx.createOscillator();
        const sirenGain = ctx.createGain();
        const sirenFilter = ctx.createBiquadFilter();
        sirenFilter.type = "lowpass";
        sirenFilter.frequency.setValueAtTime(300, ctx.currentTime);
        sirenOsc.type = "sawtooth";
        sirenOsc.frequency.setValueAtTime(80, ctx.currentTime);
        sirenGain.gain.setValueAtTime(0, ctx.currentTime);
        const sirenInterval = setInterval(() => {
          const now = ctx.currentTime;
          sirenGain.gain.cancelScheduledValues(now);
          sirenOsc.frequency.cancelScheduledValues(now);
          sirenGain.gain.setValueAtTime(0, now);
          sirenOsc.frequency.setValueAtTime(80, now);
          sirenGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.3);
          sirenOsc.frequency.linearRampToValueAtTime(120, now + 0.8);
          sirenGain.gain.linearRampToValueAtTime(0, now + 1.2);
        }, Math.random() * 20000 + 15000);
        this.intervals.push(sirenInterval);
        sirenOsc.connect(sirenFilter);
        sirenFilter.connect(sirenGain);
        sirenGain.connect(outputNode);
        sirenOsc.start();
        this.sources.push(sirenOsc);

        // 5. Catene metalliche (caratteristico warehouse)
        const chainOsc = ctx.createOscillator();
        const chainGain = ctx.createGain();
        const chainFilter = ctx.createBiquadFilter();
        chainFilter.type = "highpass";
        chainFilter.frequency.setValueAtTime(1200, ctx.currentTime);
        chainOsc.type = "square";
        chainOsc.frequency.setValueAtTime(800, ctx.currentTime);
        chainGain.gain.setValueAtTime(0, ctx.currentTime);
        const chainInterval = setInterval(() => {
          const now = ctx.currentTime;
          // Rattling chain sound
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              const rattleTime = ctx.currentTime;
              chainGain.gain.cancelScheduledValues(rattleTime);
              chainGain.gain.setValueAtTime(0, rattleTime);
              chainGain.gain.linearRampToValueAtTime(volume * 0.18, rattleTime + 0.03);
              chainGain.gain.linearRampToValueAtTime(0, rattleTime + 0.08);
            }, i * 80);
          }
        }, Math.random() * 12000 + 8000);
        this.intervals.push(chainInterval);
        chainOsc.connect(chainFilter);
        chainFilter.connect(chainGain);
        chainGain.connect(outputNode);
        chainOsc.start();
        this.sources.push(chainOsc);

        // 6. Impatti metallici pallet (pesanti e risonanti)
        const impactOsc = ctx.createOscillator();
        const impactGain = ctx.createGain();
        const impactFilter = ctx.createBiquadFilter();
        impactFilter.type = "bandpass";
        impactFilter.frequency.setValueAtTime(400, ctx.currentTime);
        impactFilter.Q.setValueAtTime(3, ctx.currentTime);
        impactOsc.type = "triangle";
        impactOsc.frequency.setValueAtTime(120, ctx.currentTime);
        impactGain.gain.setValueAtTime(0, ctx.currentTime);
        const impactInterval = setInterval(() => {
          const now = ctx.currentTime;
          impactGain.gain.cancelScheduledValues(now);
          impactOsc.frequency.cancelScheduledValues(now);
          impactGain.gain.setValueAtTime(0, now);
          impactOsc.frequency.setValueAtTime(120, now);
          impactGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.05);
          impactOsc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
          impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        }, Math.random() * 10000 + 7000);
        this.intervals.push(impactInterval);
        impactOsc.connect(impactFilter);
        impactFilter.connect(impactGain);
        impactGain.connect(outputNode);
        impactOsc.start();
        this.sources.push(impactOsc);
        break;

      case "construction":
        // === PRESET CANTIERE: Suoni Edili ===
        
        // 1. Trapano/martello pneumatico burst irregolari
        const drillOsc = ctx.createOscillator();
        const drillGain = ctx.createGain();
        const drillFilter = ctx.createBiquadFilter();
        drillFilter.type = "bandpass";
        drillFilter.frequency.setValueAtTime(2500, ctx.currentTime);
        drillFilter.Q.setValueAtTime(1.5, ctx.currentTime);
        drillOsc.type = "sawtooth";
        drillOsc.frequency.setValueAtTime(380, ctx.currentTime);
        drillGain.gain.setValueAtTime(0, ctx.currentTime);
        drillOsc.connect(drillFilter);
        drillFilter.connect(drillGain);
        drillGain.connect(outputNode);
        drillOsc.start();
        this.sources.push(drillOsc);

        const drillBurst = () => {
          const now = ctx.currentTime;
          const burstDuration = Math.random() * 1.5 + 0.5;
          drillGain.gain.cancelScheduledValues(now);
          drillGain.gain.setValueAtTime(0, now);
          drillGain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.1);
          drillGain.gain.linearRampToValueAtTime(volume * 0.6, now + burstDuration);
          drillGain.gain.linearRampToValueAtTime(0, now + burstDuration + 0.2);
        };
        const drillInterval = setInterval(drillBurst, Math.random() * 4000 + 2000);
        this.intervals.push(drillInterval);

        // 2. Escavatore motore diesel
        const excavatorOsc = ctx.createOscillator();
        const excavatorGain = ctx.createGain();
        const excavatorFilter = ctx.createBiquadFilter();
        excavatorFilter.type = "lowpass";
        excavatorFilter.frequency.setValueAtTime(200, ctx.currentTime);
        excavatorOsc.type = "sawtooth";
        excavatorOsc.frequency.setValueAtTime(65, ctx.currentTime);
        excavatorGain.gain.setValueAtTime(volume * 0.45, ctx.currentTime);
        excavatorOsc.connect(excavatorFilter);
        excavatorFilter.connect(excavatorGain);
        excavatorGain.connect(outputNode);
        excavatorOsc.start();
        this.sources.push(excavatorOsc);

        // 3. Allarme cantiere drammatico (molto raro)
        const siteAlarm = ctx.createOscillator();
        const siteAlarmGain = ctx.createGain();
        const alarmFilter = ctx.createBiquadFilter();
        alarmFilter.type = "lowpass";
        alarmFilter.frequency.setValueAtTime(600, ctx.currentTime);
        siteAlarm.type = "sawtooth";
        siteAlarm.frequency.setValueAtTime(200, ctx.currentTime);
        siteAlarmGain.gain.setValueAtTime(0, ctx.currentTime);
        const alarmInterval = setInterval(() => {
          const now = ctx.currentTime;
          siteAlarmGain.gain.cancelScheduledValues(now);
          siteAlarm.frequency.cancelScheduledValues(now);
          siteAlarmGain.gain.setValueAtTime(0, now);
          siteAlarm.frequency.setValueAtTime(200, now);
          siteAlarmGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.2);
          siteAlarm.frequency.linearRampToValueAtTime(150, now + 0.5);
          siteAlarmGain.gain.linearRampToValueAtTime(0, now + 0.8);
        }, Math.random() * 25000 + 20000);
        this.intervals.push(alarmInterval);
        siteAlarm.connect(alarmFilter);
        alarmFilter.connect(siteAlarmGain);
        siteAlarmGain.connect(outputNode);
        siteAlarm.start();
        this.sources.push(siteAlarm);

        // 4. Martellate metalliche (variegate)
        const hammerOsc = ctx.createOscillator();
        const hammerGain = ctx.createGain();
        const hammerFilter = ctx.createBiquadFilter();
        hammerFilter.type = "highpass";
        hammerFilter.frequency.setValueAtTime(800, ctx.currentTime);
        hammerOsc.type = "square";
        hammerOsc.frequency.setValueAtTime(200, ctx.currentTime);
        hammerGain.gain.setValueAtTime(0, ctx.currentTime);
        const hammerInterval = setInterval(() => {
          const now = ctx.currentTime;
          hammerGain.gain.cancelScheduledValues(now);
          hammerGain.gain.setValueAtTime(0, now);
          hammerGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.02);
          hammerGain.gain.linearRampToValueAtTime(0, now + 0.1);
        }, Math.random() * 2000 + 1000);
        this.intervals.push(hammerInterval);
        hammerOsc.connect(hammerFilter);
        hammerFilter.connect(hammerGain);
        hammerGain.connect(outputNode);
        hammerOsc.start();
        this.sources.push(hammerOsc);

        // 5. Sega circolare per metallo (distintivo construction)
        const sawOsc = ctx.createOscillator();
        const sawGain = ctx.createGain();
        const sawFilter = ctx.createBiquadFilter();
        sawFilter.type = "bandpass";
        sawFilter.frequency.setValueAtTime(3500, ctx.currentTime);
        sawFilter.Q.setValueAtTime(10, ctx.currentTime);
        sawOsc.type = "sawtooth";
        sawOsc.frequency.setValueAtTime(2800, ctx.currentTime);
        sawGain.gain.setValueAtTime(0, ctx.currentTime);
        const sawInterval = setInterval(() => {
          const now = ctx.currentTime;
          const duration = Math.random() * 3 + 2;
          sawGain.gain.cancelScheduledValues(now);
          sawOsc.frequency.cancelScheduledValues(now);
          sawGain.gain.setValueAtTime(0, now);
          sawOsc.frequency.setValueAtTime(2800, now);
          sawGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.3);
          // Variazione frequenza durante il taglio
          sawOsc.frequency.linearRampToValueAtTime(3200, now + duration * 0.5);
          sawOsc.frequency.linearRampToValueAtTime(2600, now + duration);
          sawGain.gain.linearRampToValueAtTime(0, now + duration + 0.2);
        }, Math.random() * 18000 + 12000);
        this.intervals.push(sawInterval);
        sawOsc.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(outputNode);
        sawOsc.start();
        this.sources.push(sawOsc);

        // 6. Ferro che si piega/deforma (suono drammatico)
        const bendOsc = ctx.createOscillator();
        const bendGain = ctx.createGain();
        const bendFilter = ctx.createBiquadFilter();
        bendFilter.type = "lowpass";
        bendFilter.frequency.setValueAtTime(600, ctx.currentTime);
        bendOsc.type = "triangle";
        bendOsc.frequency.setValueAtTime(150, ctx.currentTime);
        bendGain.gain.setValueAtTime(0, ctx.currentTime);
        const bendInterval = setInterval(() => {
          const now = ctx.currentTime;
          bendGain.gain.cancelScheduledValues(now);
          bendOsc.frequency.cancelScheduledValues(now);
          bendFilter.frequency.cancelScheduledValues(now);
          bendGain.gain.setValueAtTime(0, now);
          bendOsc.frequency.setValueAtTime(150, now);
          bendFilter.frequency.setValueAtTime(600, now);
          bendGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.4);
          bendOsc.frequency.linearRampToValueAtTime(90, now + 1.2);
          bendFilter.frequency.linearRampToValueAtTime(300, now + 1.2);
          bendGain.gain.linearRampToValueAtTime(0, now + 1.5);
        }, Math.random() * 25000 + 20000);
        this.intervals.push(bendInterval);
        bendOsc.connect(bendFilter);
        bendFilter.connect(bendGain);
        bendGain.connect(outputNode);
        bendOsc.start();
        this.sources.push(bendOsc);

        // 7. Betoniera – tamburo rotante basso (rumble continuo)
        const mixerOsc = ctx.createOscillator();
        const mixerOsc2 = ctx.createOscillator();
        const mixerGain = ctx.createGain();
        const mixerFilter = ctx.createBiquadFilter();
        mixerFilter.type = "lowpass";
        mixerFilter.frequency.setValueAtTime(160, ctx.currentTime);
        mixerOsc.type = "sawtooth";
        mixerOsc.frequency.setValueAtTime(42, ctx.currentTime);
        mixerOsc2.type = "triangle";
        mixerOsc2.frequency.setValueAtTime(47, ctx.currentTime); // slight detuning for thickness
        mixerGain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
        mixerOsc.connect(mixerFilter);
        mixerOsc2.connect(mixerFilter);
        mixerFilter.connect(mixerGain);
        mixerGain.connect(outputNode);
        mixerOsc.start();
        mixerOsc2.start();
        this.sources.push(mixerOsc);
        this.sources.push(mixerOsc2);

        // Mixer churn – periodic grinding sound
        const churnOsc = ctx.createOscillator();
        const churnGain = ctx.createGain();
        const churnFilter = ctx.createBiquadFilter();
        churnFilter.type = "bandpass";
        churnFilter.frequency.setValueAtTime(300, ctx.currentTime);
        churnFilter.Q.setValueAtTime(3, ctx.currentTime);
        churnOsc.type = "sawtooth";
        churnOsc.frequency.setValueAtTime(120, ctx.currentTime);
        churnGain.gain.setValueAtTime(0, ctx.currentTime);
        churnOsc.connect(churnFilter);
        churnFilter.connect(churnGain);
        churnGain.connect(outputNode);
        churnOsc.start();
        this.sources.push(churnOsc);
        const churnInterval = setInterval(() => {
          const now = ctx.currentTime;
          churnGain.gain.cancelScheduledValues(now);
          churnOsc.frequency.cancelScheduledValues(now);
          churnGain.gain.setValueAtTime(0, now);
          churnGain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.15);
          churnOsc.frequency.setValueAtTime(120, now);
          churnOsc.frequency.linearRampToValueAtTime(180, now + 0.4);
          churnOsc.frequency.linearRampToValueAtTime(100, now + 0.8);
          churnGain.gain.linearRampToValueAtTime(0, now + 1.0);
        }, 2200);
        this.intervals.push(churnInterval);

        // 8. Gru – motore elettrico + cavi in tensione
        const craneMotorOsc = ctx.createOscillator();
        const craneMotorGain = ctx.createGain();
        const craneMotorFilter = ctx.createBiquadFilter();
        craneMotorFilter.type = "lowpass";
        craneMotorFilter.frequency.setValueAtTime(400, ctx.currentTime);
        craneMotorOsc.type = "sawtooth";
        craneMotorOsc.frequency.setValueAtTime(85, ctx.currentTime);
        craneMotorGain.gain.setValueAtTime(0, ctx.currentTime);
        craneMotorOsc.connect(craneMotorFilter);
        craneMotorFilter.connect(craneMotorGain);
        craneMotorGain.connect(outputNode);
        craneMotorOsc.start();
        this.sources.push(craneMotorOsc);

        // Crane motor activates intermittently
        const craneInterval = setInterval(() => {
          const now = ctx.currentTime;
          const runDur = Math.random() * 4 + 3;
          craneMotorGain.gain.cancelScheduledValues(now);
          craneMotorOsc.frequency.cancelScheduledValues(now);
          craneMotorGain.gain.setValueAtTime(0, now);
          craneMotorGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.8);
          // Motor pitch variation (load changes)
          craneMotorOsc.frequency.setValueAtTime(85, now);
          craneMotorOsc.frequency.linearRampToValueAtTime(110, now + runDur * 0.3);
          craneMotorOsc.frequency.linearRampToValueAtTime(75, now + runDur * 0.7);
          craneMotorOsc.frequency.linearRampToValueAtTime(90, now + runDur);
          craneMotorGain.gain.linearRampToValueAtTime(volume * 0.3, now + runDur - 0.5);
          craneMotorGain.gain.linearRampToValueAtTime(0, now + runDur);
        }, Math.random() * 10000 + 8000);
        this.intervals.push(craneInterval);

        // Crane cable creak (high metallic whine)
        const cableOsc = ctx.createOscillator();
        const cableGain = ctx.createGain();
        const cableFilter = ctx.createBiquadFilter();
        cableFilter.type = "bandpass";
        cableFilter.frequency.setValueAtTime(1800, ctx.currentTime);
        cableFilter.Q.setValueAtTime(15, ctx.currentTime);
        cableOsc.type = "sine";
        cableOsc.frequency.setValueAtTime(1600, ctx.currentTime);
        cableGain.gain.setValueAtTime(0, ctx.currentTime);
        cableOsc.connect(cableFilter);
        cableFilter.connect(cableGain);
        cableGain.connect(outputNode);
        cableOsc.start();
        this.sources.push(cableOsc);
        const cableInterval = setInterval(() => {
          const now = ctx.currentTime;
          cableGain.gain.cancelScheduledValues(now);
          cableOsc.frequency.cancelScheduledValues(now);
          cableGain.gain.setValueAtTime(0, now);
          cableGain.gain.linearRampToValueAtTime(volume * 0.12, now + 0.1);
          cableOsc.frequency.setValueAtTime(1600 + Math.random() * 400, now);
          cableOsc.frequency.linearRampToValueAtTime(1400 + Math.random() * 300, now + 0.6);
          cableGain.gain.linearRampToValueAtTime(0, now + 0.8);
        }, Math.random() * 12000 + 10000);
        this.intervals.push(cableInterval);

        // 9. Beep di retromarcia (classico beep-beep lento e profondo)
        const reverseOsc = ctx.createOscillator();
        const reverseGain = ctx.createGain();
        reverseOsc.type = "square";
        reverseOsc.frequency.setValueAtTime(950, ctx.currentTime);
        reverseGain.gain.setValueAtTime(0, ctx.currentTime);
        reverseOsc.connect(reverseGain);
        reverseGain.connect(outputNode);
        reverseOsc.start();
        this.sources.push(reverseOsc);

        // Intermittent reverse beeping sequences
        const reverseBeepInterval = setInterval(() => {
          const now = ctx.currentTime;
          // Play 4-6 beeps in a row (like a truck reversing)
          const beepCount = Math.floor(Math.random() * 3) + 4;
          for (let b = 0; b < beepCount; b++) {
            const beepStart = now + b * 0.7; // 0.7s between beeps
            reverseGain.gain.setValueAtTime(0, beepStart);
            reverseGain.gain.linearRampToValueAtTime(volume * 0.35, beepStart + 0.02);
            reverseGain.gain.setValueAtTime(volume * 0.35, beepStart + 0.28);
            reverseGain.gain.linearRampToValueAtTime(0, beepStart + 0.3);
          }
        }, Math.random() * 20000 + 15000);
        this.intervals.push(reverseBeepInterval);
        break;

      case "laboratory":
        // === PRESET SIMULAZIONE ANTINCENDIO ===
        // Fire crackling, alarm siren, smoke hiss, structural creaking
        
        // 1. Fuoco crepitante (crackling fire - noise-based)
        const fireNoiseLength = ctx.sampleRate * 2;
        const fireNoiseBuffer = ctx.createBuffer(1, fireNoiseLength, ctx.sampleRate);
        const fireNoiseData = fireNoiseBuffer.getChannelData(0);
        for (let i = 0; i < fireNoiseLength; i++) {
          fireNoiseData[i] = (Math.random() * 2 - 1) * 0.5;
        }
        const fireNoise = ctx.createBufferSource();
        fireNoise.buffer = fireNoiseBuffer;
        fireNoise.loop = true;
        const fireCrackleFilter = ctx.createBiquadFilter();
        fireCrackleFilter.type = "bandpass";
        fireCrackleFilter.frequency.setValueAtTime(800, ctx.currentTime);
        fireCrackleFilter.Q.setValueAtTime(1.5, ctx.currentTime);
        const fireCrackleGain = ctx.createGain();
        fireCrackleGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
        fireNoise.connect(fireCrackleFilter);
        fireCrackleFilter.connect(fireCrackleGain);
        fireCrackleGain.connect(outputNode);
        fireNoise.start();
        this.sources.push(fireNoise as any);
        
        // Crackling intensity modulation (irregular bursts)
        const crackleModInterval = setInterval(() => {
          if (!this.isPlaying) return;
          const now = ctx.currentTime;
          const intensity = 0.25 + Math.random() * 0.35;
          fireCrackleGain.gain.cancelScheduledValues(now);
          fireCrackleGain.gain.setValueAtTime(fireCrackleGain.gain.value, now);
          fireCrackleGain.gain.linearRampToValueAtTime(volume * intensity, now + 0.3);
          fireCrackleFilter.frequency.setValueAtTime(600 + Math.random() * 600, now);
        }, 800 + Math.random() * 400);
        this.intervals.push(crackleModInterval);

        // 2. Ronzio profondo del fuoco (deep fire roar)
        const fireRoarOsc = ctx.createOscillator();
        const fireRoarGain = ctx.createGain();
        const fireRoarFilter = ctx.createBiquadFilter();
        fireRoarFilter.type = "lowpass";
        fireRoarFilter.frequency.setValueAtTime(200, ctx.currentTime);
        fireRoarOsc.type = "sawtooth";
        fireRoarOsc.frequency.setValueAtTime(50, ctx.currentTime);
        fireRoarGain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
        // LFO for roar modulation
        const roarLFO = ctx.createOscillator();
        const roarLFOGain = ctx.createGain();
        roarLFO.type = "sine";
        roarLFO.frequency.setValueAtTime(0.3, ctx.currentTime);
        roarLFOGain.gain.setValueAtTime(8, ctx.currentTime);
        roarLFO.connect(roarLFOGain);
        roarLFOGain.connect(fireRoarOsc.frequency);
        roarLFO.start();
        this.sources.push(roarLFO as any);
        fireRoarOsc.connect(fireRoarFilter);
        fireRoarFilter.connect(fireRoarGain);
        fireRoarGain.connect(outputNode);
        fireRoarOsc.start();
        this.sources.push(fireRoarOsc);

        // 3. Allarme antincendio (two-tone siren cycling)
        const fireSirenOsc = ctx.createOscillator();
        const fireSirenGain = ctx.createGain();
        const fireSirenFilter = ctx.createBiquadFilter();
        fireSirenFilter.type = "lowpass";
        fireSirenFilter.frequency.setValueAtTime(1200, ctx.currentTime);
        fireSirenOsc.type = "sawtooth";
        fireSirenOsc.frequency.setValueAtTime(800, ctx.currentTime);
        fireSirenGain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
        fireSirenOsc.connect(fireSirenFilter);
        fireSirenFilter.connect(fireSirenGain);
        fireSirenGain.connect(outputNode);
        fireSirenOsc.start();
        this.sources.push(fireSirenOsc);
        
        // Two-tone siren cycle (high-low alternation)
        const sirenCycleInterval = setInterval(() => {
          if (!this.isPlaying) return;
          const now = ctx.currentTime;
          fireSirenOsc.frequency.cancelScheduledValues(now);
          fireSirenOsc.frequency.setValueAtTime(800, now);
          fireSirenOsc.frequency.linearRampToValueAtTime(600, now + 0.5);
          fireSirenOsc.frequency.setValueAtTime(600, now + 0.5);
          fireSirenOsc.frequency.linearRampToValueAtTime(800, now + 1.0);
          // Brief pause
          fireSirenGain.gain.cancelScheduledValues(now);
          fireSirenGain.gain.setValueAtTime(volume * 0.2, now);
          fireSirenGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.8);
          fireSirenGain.gain.linearRampToValueAtTime(volume * 0.2, now + 1.0);
        }, 1200);
        this.intervals.push(sirenCycleInterval);

        // 4. Sibilo fumo/vapore (steam hiss from fire suppression)
        const steamOsc = ctx.createOscillator();
        const steamGain = ctx.createGain();
        const steamFilter = ctx.createBiquadFilter();
        steamFilter.type = "highpass";
        steamFilter.frequency.setValueAtTime(3000, ctx.currentTime);
        steamOsc.type = "sawtooth";
        steamOsc.frequency.setValueAtTime(4000, ctx.currentTime);
        steamGain.gain.setValueAtTime(0, ctx.currentTime);
        steamOsc.connect(steamFilter);
        steamFilter.connect(steamGain);
        steamGain.connect(outputNode);
        steamOsc.start();
        this.sources.push(steamOsc);
        
        const steamInterval = setInterval(() => {
          if (!this.isPlaying) return;
          const now = ctx.currentTime;
          const duration = Math.random() * 2 + 1;
          steamGain.gain.cancelScheduledValues(now);
          steamGain.gain.setValueAtTime(0, now);
          steamGain.gain.linearRampToValueAtTime(volume * 0.12, now + 0.2);
          steamGain.gain.linearRampToValueAtTime(volume * 0.12, now + duration);
          steamGain.gain.linearRampToValueAtTime(0, now + duration + 0.5);
        }, Math.random() * 8000 + 6000);
        this.intervals.push(steamInterval);

        // 5. Scricchiolii strutturali (structural creaking)
        const creakOsc = ctx.createOscillator();
        const creakGain = ctx.createGain();
        const creakFilter = ctx.createBiquadFilter();
        creakFilter.type = "bandpass";
        creakFilter.frequency.setValueAtTime(300, ctx.currentTime);
        creakFilter.Q.setValueAtTime(5, ctx.currentTime);
        creakOsc.type = "triangle";
        creakOsc.frequency.setValueAtTime(200, ctx.currentTime);
        creakGain.gain.setValueAtTime(0, ctx.currentTime);
        creakOsc.connect(creakFilter);
        creakFilter.connect(creakGain);
        creakGain.connect(outputNode);
        creakOsc.start();
        this.sources.push(creakOsc);
        
        const creakInterval = setInterval(() => {
          if (!this.isPlaying) return;
          const now = ctx.currentTime;
          creakGain.gain.cancelScheduledValues(now);
          creakOsc.frequency.cancelScheduledValues(now);
          creakGain.gain.setValueAtTime(0, now);
          creakOsc.frequency.setValueAtTime(180 + Math.random() * 100, now);
          creakGain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.1);
          creakOsc.frequency.linearRampToValueAtTime(120 + Math.random() * 60, now + 0.5);
          creakGain.gain.linearRampToValueAtTime(0, now + 0.7);
        }, Math.random() * 15000 + 10000);
        this.intervals.push(creakInterval);

        // 6. Scoppiettio sporadico (pops and cracks from burning material)
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        const popFilter = ctx.createBiquadFilter();
        popFilter.type = "highpass";
        popFilter.frequency.setValueAtTime(1500, ctx.currentTime);
        popOsc.type = "square";
        popOsc.frequency.setValueAtTime(2000, ctx.currentTime);
        popGain.gain.setValueAtTime(0, ctx.currentTime);
        popOsc.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(outputNode);
        popOsc.start();
        this.sources.push(popOsc);
        
        const popInterval = setInterval(() => {
          if (!this.isPlaying) return;
          const burstCount = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
              const now = ctx.currentTime;
              popGain.gain.cancelScheduledValues(now);
              popGain.gain.setValueAtTime(0, now);
              popGain.gain.linearRampToValueAtTime(volume * (0.1 + Math.random() * 0.15), now + 0.01);
              popGain.gain.linearRampToValueAtTime(0, now + 0.06);
              popOsc.frequency.setValueAtTime(1500 + Math.random() * 2000, now);
            }, i * (Math.random() * 200 + 50));
          }
        }, Math.random() * 3000 + 2000);
        this.intervals.push(popInterval);
        break;

      case "office":
        // === PRESET UFFICIO: Suoni Corporate ===
        
        // 1. Aria condizionata
        const hvacOsc = ctx.createOscillator();
        const hvacGain = ctx.createGain();
        const hvacFilter = ctx.createBiquadFilter();
        hvacFilter.type = "lowpass";
        hvacFilter.frequency.setValueAtTime(280, ctx.currentTime);
        hvacOsc.type = "sine";
        hvacOsc.frequency.setValueAtTime(58, ctx.currentTime);
        hvacGain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
        hvacOsc.connect(hvacFilter);
        hvacFilter.connect(hvacGain);
        hvacGain.connect(outputNode);
        hvacOsc.start();
        this.sources.push(hvacOsc);

        // 2. Digitazione tastiera (ridotta e più profonda)
        const keyboardOsc = ctx.createOscillator();
        const keyboardGain = ctx.createGain();
        const keyboardFilter = ctx.createBiquadFilter();
        keyboardFilter.type = "highpass";
        keyboardFilter.frequency.setValueAtTime(1800, ctx.currentTime);
        keyboardOsc.type = "square";
        keyboardOsc.frequency.setValueAtTime(2200, ctx.currentTime);
        keyboardGain.gain.setValueAtTime(0, ctx.currentTime);
        const typingInterval = setInterval(() => {
          const now = ctx.currentTime;
          const burstCount = Math.floor(Math.random() * 3) + 2;
          for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
              const clickTime = ctx.currentTime;
              keyboardGain.gain.cancelScheduledValues(clickTime);
              keyboardGain.gain.setValueAtTime(0, clickTime);
              keyboardGain.gain.linearRampToValueAtTime(volume * 0.08, clickTime + 0.015);
              keyboardGain.gain.linearRampToValueAtTime(0, clickTime + 0.04);
            }, i * (Math.random() * 150 + 80));
          }
        }, Math.random() * 3000 + 2500);
        this.intervals.push(typingInterval);
        keyboardOsc.connect(keyboardFilter);
        keyboardFilter.connect(keyboardGain);
        keyboardGain.connect(outputNode);
        keyboardOsc.start();
        this.sources.push(keyboardOsc);

        // 3. Stampante (molto più rara)
        const printerOsc = ctx.createOscillator();
        const printerGain = ctx.createGain();
        const printerFilter = ctx.createBiquadFilter();
        printerFilter.type = "bandpass";
        printerFilter.frequency.setValueAtTime(600, ctx.currentTime);
        printerOsc.type = "sawtooth";
        printerOsc.frequency.setValueAtTime(180, ctx.currentTime);
        printerGain.gain.setValueAtTime(0, ctx.currentTime);
        const printerInterval = setInterval(() => {
          const now = ctx.currentTime;
          const duration = Math.random() * 2 + 1.5;
          printerGain.gain.cancelScheduledValues(now);
          printerGain.gain.setValueAtTime(0, now);
          printerGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.3);
          printerGain.gain.linearRampToValueAtTime(volume * 0.15, now + duration);
          printerGain.gain.linearRampToValueAtTime(0, now + duration + 0.3);
        }, Math.random() * 40000 + 35000);
        this.intervals.push(printerInterval);
        printerOsc.connect(printerFilter);
        printerFilter.connect(printerGain);
        printerGain.connect(outputNode);
        printerOsc.start();
        this.sources.push(printerOsc);

        // 4. Telefono (molto più raro e profondo)
        const phoneOsc = ctx.createOscillator();
        const phoneGain = ctx.createGain();
        const phoneFilter = ctx.createBiquadFilter();
        phoneFilter.type = "lowpass";
        phoneFilter.frequency.setValueAtTime(900, ctx.currentTime);
        phoneOsc.type = "sine";
        phoneOsc.frequency.setValueAtTime(800, ctx.currentTime);
        phoneGain.gain.setValueAtTime(0, ctx.currentTime);
        const phoneInterval = setInterval(() => {
          const now = ctx.currentTime;
          for (let i = 0; i < 2; i++) {
            setTimeout(() => {
              const ringTime = ctx.currentTime;
              phoneGain.gain.cancelScheduledValues(ringTime);
              phoneGain.gain.setValueAtTime(0, ringTime);
              phoneGain.gain.linearRampToValueAtTime(volume * 0.12, ringTime + 0.2);
              phoneGain.gain.linearRampToValueAtTime(0, ringTime + 0.5);
            }, i * 1200);
          }
        }, Math.random() * 50000 + 40000);
        this.intervals.push(phoneInterval);
        phoneOsc.connect(phoneFilter);
        phoneFilter.connect(phoneGain);
        phoneGain.connect(outputNode);
        phoneOsc.start();
        this.sources.push(phoneOsc);

        // 5. Ronzio neon
        const neonOsc = ctx.createOscillator();
        const neonGain = ctx.createGain();
        neonOsc.type = "sine";
        neonOsc.frequency.setValueAtTime(120, ctx.currentTime);
        neonGain.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
        neonOsc.connect(neonGain);
        neonGain.connect(outputNode);
        neonOsc.start();
        this.sources.push(neonOsc);
        break;
    }
  }

  private createLoopingTone(frequency: number, volume: number) {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscGain.gain.value = volume;
    
    oscillator.connect(oscGain);
    oscGain.connect(this.gainNode);
    
    oscillator.start();
    this.oscillators.push(oscillator);
  }

  private createFilteredNoise(lowFreq: number, highFreq: number, volume: number) {
    if (!this.audioContext || !this.gainNode) return;

    // Create white noise buffer
    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // Create buffer source
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Create bandpass filter to limit frequency range
    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = (lowFreq + highFreq) / 2;
    bandpass.Q.value = (bandpass.frequency.value) / (highFreq - lowFreq);

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    // Connect nodes: noise -> bandpass -> gain -> destination
    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.gainNode);

    noiseSource.start();
    this.noiseNode = noiseSource;
  }

  private createRandomBeeps() {
    if (!this.audioContext || !this.gainNode) return;

    const beepOsc = this.audioContext.createOscillator();
    const beepGain = this.audioContext.createGain();

    beepOsc.type = "square";
    beepOsc.frequency.value = 1000;
    beepGain.gain.value = 0;

    beepOsc.connect(beepGain);
    beepGain.connect(this.gainNode);

    beepOsc.start();

    const beep = () => {
      const now = this.audioContext!.currentTime;
      beepGain.gain.cancelScheduledValues(now);
      beepGain.gain.setValueAtTime(0, now);
      beepGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      beepGain.gain.linearRampToValueAtTime(0, now + 0.15);
    };

    const interval = setInterval(() => {
      beep();
    }, 2000 + Math.random() * 3000);

    this.intervals.push(interval);
    this.sources.push(beepOsc);
  }

  private createPeriodicAlarm() {
    if (!this.audioContext || !this.gainNode) return;

    const alarmOsc = this.audioContext.createOscillator();
    const alarmGain = this.audioContext.createGain();

    alarmOsc.type = "sine";
    alarmOsc.frequency.value = 600;
    alarmGain.gain.value = 0;

    alarmOsc.connect(alarmGain);
    alarmGain.connect(this.gainNode);

    alarmOsc.start();

    const alarm = () => {
      const now = this.audioContext!.currentTime;
      alarmGain.gain.cancelScheduledValues(now);
      alarmGain.gain.setValueAtTime(0, now);
      alarmGain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      alarmGain.gain.linearRampToValueAtTime(0, now + 0.5);
    };

    const interval = setInterval(() => {
      alarm();
    }, 8000);

    this.intervals.push(interval);
    this.sources.push(alarmOsc);
  }

  stop() {
    this.isPlaying = false;
    
    // Clear collision muffle timeout
    if (this.collisionMuffleTimeout) {
      clearTimeout(this.collisionMuffleTimeout);
      this.collisionMuffleTimeout = null;
    }
    
    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators = [];

    // Stop all audio sources
    this.sources.forEach(source => {
      try {
        if ('stop' in source) {
          (source as OscillatorNode).stop();
        }
        source.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    this.sources = [];

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];

    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.noiseNode = null;
    }
  }

  // Set fire alarm intensity (0-1) - escalating alarm that grows with fire propagation
  setFireAlarmIntensity(level: number) {
    if (!this.audioContext || !this.gainNode) return;
    
    this.fireAlarmIntensity = Math.max(0, Math.min(1, level));
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create alarm oscillator on first call
    if (!this.fireAlarmOsc && this.fireAlarmIntensity > 0.05) {
      this.fireAlarmOsc = ctx.createOscillator();
      this.fireAlarmGain = ctx.createGain();
      this.fireAlarmFilter = ctx.createBiquadFilter();

      this.fireAlarmFilter.type = 'bandpass';
      this.fireAlarmFilter.frequency.value = 700;
      this.fireAlarmFilter.Q.value = 2;

      this.fireAlarmOsc.type = 'sawtooth';
      this.fireAlarmOsc.frequency.value = 400;
      this.fireAlarmGain.gain.value = 0;

      this.fireAlarmOsc.connect(this.fireAlarmFilter);
      this.fireAlarmFilter.connect(this.fireAlarmGain);
      this.fireAlarmGain.connect(this.dynamicFilter || this.audioContext.destination);
      this.fireAlarmOsc.start();
      this.sources.push(this.fireAlarmOsc as any);

      // Siren sweep interval - frequency cycles faster with higher intensity
      const sirenInterval = setInterval(() => {
        if (!this.fireAlarmOsc || !this.audioContext || this.fireAlarmIntensity <= 0.05) return;
        const t = this.audioContext.currentTime;
        const intensity = this.fireAlarmIntensity;
        
        // Frequency range widens with intensity
        const baseFreq = 300 + intensity * 200;
        const sweepRange = 200 + intensity * 400;
        const sweepSpeed = 0.4 + intensity * 0.4;
        
        this.fireAlarmOsc.frequency.cancelScheduledValues(t);
        this.fireAlarmOsc.frequency.setValueAtTime(baseFreq, t);
        this.fireAlarmOsc.frequency.linearRampToValueAtTime(baseFreq + sweepRange, t + sweepSpeed);
        this.fireAlarmOsc.frequency.linearRampToValueAtTime(baseFreq, t + sweepSpeed * 2);
      }, 800);
      this.intervals.push(sirenInterval);
    }

    // Update alarm volume based on intensity
    if (this.fireAlarmGain) {
      const targetVolume = this.fireAlarmIntensity > 0.05 
        ? 0.05 + this.fireAlarmIntensity * 0.25 // 0.05 to 0.30 volume range
        : 0;
      this.fireAlarmGain.gain.cancelScheduledValues(now);
      this.fireAlarmGain.gain.setValueAtTime(this.fireAlarmGain.gain.value, now);
      this.fireAlarmGain.gain.linearRampToValueAtTime(targetVolume, now + 0.5);
    }

    // Update filter - more piercing at higher intensity
    if (this.fireAlarmFilter) {
      const filterFreq = 600 + this.fireAlarmIntensity * 800;
      this.fireAlarmFilter.frequency.cancelScheduledValues(now);
      this.fireAlarmFilter.frequency.setValueAtTime(filterFreq, now);
      this.fireAlarmFilter.Q.setValueAtTime(2 + this.fireAlarmIntensity * 4, now);
    }
  }

  // Set panic intensity (0-1) - heartbeat, breathing, escalating dread
  // Activated when fire vignette is visible (>70%)
  setPanicIntensity(level: number) {
    if (!this.audioContext || !this.gainNode) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const intensity = Math.max(0, Math.min(1, level));
    const outputNode = this.dynamicFilter || ctx.destination;

    // Create panic layer on first activation
    if (intensity > 0 && !this.panicActive) {
      this.panicActive = true;
      
      // Low heartbeat oscillator
      this.panicGain = ctx.createGain();
      this.panicGain.gain.value = 0;
      this.panicGain.connect(outputNode);

      // Heartbeat: double-thump pattern
      this.heartbeatInterval = setInterval(() => {
        if (!this.panicActive || !ctx || !this.panicGain) return;
        const t = ctx.currentTime;
        const vol = 0.15 + this.fireAlarmIntensity * 0.25;
        // Speed increases with intensity (120bpm -> 180bpm)
        const bpm = 80 + this.fireAlarmIntensity * 100;
        const beatGap = 60 / bpm * 0.15;

        // First thump
        const thump1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        thump1.type = 'sine';
        thump1.frequency.setValueAtTime(55, t);
        thump1.frequency.exponentialRampToValueAtTime(30, t + 0.15);
        g1.gain.setValueAtTime(vol, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        thump1.connect(g1);
        g1.connect(this.panicGain);
        thump1.start(t);
        thump1.stop(t + 0.25);

        // Second thump (slightly quieter)
        const thump2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        thump2.type = 'sine';
        thump2.frequency.setValueAtTime(50, t + beatGap);
        thump2.frequency.exponentialRampToValueAtTime(28, t + beatGap + 0.12);
        g2.gain.setValueAtTime(vol * 0.7, t + beatGap);
        g2.gain.exponentialRampToValueAtTime(0.001, t + beatGap + 0.18);
        thump2.connect(g2);
        g2.connect(this.panicGain);
        thump2.start(t + beatGap);
        thump2.stop(t + beatGap + 0.25);
      }, Math.max(300, 750 - this.fireAlarmIntensity * 400));
      this.intervals.push(this.heartbeatInterval);

      // Dissonant tension drone
      this.panicOsc1 = ctx.createOscillator();
      const panicFilter1 = ctx.createBiquadFilter();
      panicFilter1.type = 'lowpass';
      panicFilter1.frequency.value = 400;
      this.panicOsc1.type = 'sawtooth';
      this.panicOsc1.frequency.value = 73.42; // D2
      this.panicOsc1.connect(panicFilter1);
      panicFilter1.connect(this.panicGain);
      this.panicOsc1.start();
      this.sources.push(this.panicOsc1 as any);

      this.panicOsc2 = ctx.createOscillator();
      const panicFilter2 = ctx.createBiquadFilter();
      panicFilter2.type = 'lowpass';
      panicFilter2.frequency.value = 350;
      this.panicOsc2.type = 'sawtooth';
      this.panicOsc2.frequency.value = 77.78; // D#2 (dissonant minor 2nd)
      this.panicOsc2.connect(panicFilter2);
      panicFilter2.connect(this.panicGain);
      this.panicOsc2.start();
      this.sources.push(this.panicOsc2 as any);
    }

    // Update panic volume
    if (this.panicGain) {
      const vol = intensity > 0 ? 0.1 + intensity * 0.5 : 0;
      this.panicGain.gain.cancelScheduledValues(now);
      this.panicGain.gain.setValueAtTime(this.panicGain.gain.value, now);
      this.panicGain.gain.linearRampToValueAtTime(vol, now + 0.3);
    }

    // Stop panic when intensity drops to 0
    if (intensity <= 0 && this.panicActive) {
      this.panicActive = false;
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      if (this.panicOsc1) { try { this.panicOsc1.stop(); } catch(e) {} this.panicOsc1 = null; }
      if (this.panicOsc2) { try { this.panicOsc2.stop(); } catch(e) {} this.panicOsc2 = null; }
      if (this.panicGain) { this.panicGain.disconnect(); this.panicGain = null; }
    }
  }

  cleanup() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// VoiceOverPlayer, SpatialAudioManager, etc.

export class VoiceOverPlayer {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      // Voices might load asynchronously
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  speak(text: string, lang: string = "it-IT") {
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Try to find Italian voice
    const italianVoice = this.voices.find(voice => 
      voice.lang.startsWith('it') || voice.lang === lang
    );
    
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }
}

export interface SpatialAudioSource {
  id: string;
  panner: PannerNode;
  oscillator: OscillatorNode;
  gainNode: GainNode;
  baseFrequency: number;
}

export class SpatialAudioManager {
  private audioContext: AudioContext | null = null;
  private listener: AudioListener | null = null;
  private sources: Map<string, SpatialAudioSource> = new Map();
  private masterGain: GainNode | null = null;

  async initialize() {
    this.audioContext = new AudioContext();
    import('./audio-context-unlock').then(m => m.registerAudioContext(this.audioContext)).catch(() => {});
    this.listener = this.audioContext.listener;
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.4;
    this.masterGain.connect(this.audioContext.destination);
  }

  createSpatialSource(
    id: string,
    position: [number, number, number],
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) {
    if (!this.audioContext || !this.masterGain) return;

    // Different frequencies based on severity
    const frequencyMap = {
      low: 200,
      medium: 400,
      high: 600,
      critical: 800,
    };

    const baseFrequency = frequencyMap[severity];

    // Create panner for 3D positioning
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 15;
    panner.rolloffFactor = 2;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.coneOuterGain = 0;

    // Set position
    panner.positionX.value = position[0];
    panner.positionY.value = position[1];
    panner.positionZ.value = position[2];

    // Create oscillator for the warning sound
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = baseFrequency;

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.3;

    // Connect: oscillator -> gain -> panner -> masterGain -> destination
    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.masterGain);

    // Start oscillator
    oscillator.start();

    // Add pulsing effect based on severity
    this.addPulsingEffect(gainNode, severity);

    const source: SpatialAudioSource = {
      id,
      panner,
      oscillator,
      gainNode,
      baseFrequency,
    };

    this.sources.set(id, source);
  }

  private addPulsingEffect(gainNode: GainNode, severity: 'low' | 'medium' | 'high' | 'critical') {
    if (!this.audioContext) return;

    const pulseSpeedMap = {
      low: 2.0,    // Slow pulse
      medium: 1.5,
      high: 1.0,
      critical: 0.5, // Fast pulse
    };

    const pulseSpeed = pulseSpeedMap[severity];
    const now = this.audioContext.currentTime;

    // Create pulsing effect
    const pulse = () => {
      if (!this.audioContext || !this.sources.size) return;

      const currentTime = this.audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(currentTime);
      gainNode.gain.setValueAtTime(0.1, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, currentTime + pulseSpeed / 2);
      gainNode.gain.linearRampToValueAtTime(0.1, currentTime + pulseSpeed);

      setTimeout(pulse, pulseSpeed * 1000);
    };

    pulse();
  }

  updateListenerPosition(position: [number, number, number], forward: [number, number, number], up: [number, number, number]) {
    if (!this.listener) return;

    this.listener.positionX.value = position[0];
    this.listener.positionY.value = position[1];
    this.listener.positionZ.value = position[2];

    this.listener.forwardX.value = forward[0];
    this.listener.forwardY.value = forward[1];
    this.listener.forwardZ.value = forward[2];

    this.listener.upX.value = up[0];
    this.listener.upY.value = up[1];
    this.listener.upZ.value = up[2];
  }

  removeSource(id: string) {
    const source = this.sources.get(id);
    if (!source) return;

    try {
      source.oscillator.stop();
      source.oscillator.disconnect();
      source.gainNode.disconnect();
      source.panner.disconnect();
    } catch (e) {
      // Already disconnected
    }

    this.sources.delete(id);
  }

  playCollisionSound() {
    if (!this.audioContext || !this.masterGain) return;

    // Create a short impact sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'square';
    oscillator.frequency.value = 100;
    
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  stopAll() {
    this.sources.forEach((source) => {
      try {
        source.oscillator.stop();
        source.oscillator.disconnect();
        source.gainNode.disconnect();
        source.panner.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    this.sources.clear();
  }

  cleanup() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
