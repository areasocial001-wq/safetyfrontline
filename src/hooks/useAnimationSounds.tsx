import { useEffect, useRef, useState } from 'react';

export type AudioPreset = 'deep-space' | 'industrial-hangar' | 'cathedral';

interface AnimationSoundsConfig {
  enabled?: boolean;
  volume?: number;
  preset?: AudioPreset;
}

interface ReverbConfig {
  delays: number[];
  feedbacks: number[];
  wetGain: number;
  dryGain: number;
}

const AUDIO_PRESETS: Record<AudioPreset, ReverbConfig> = {
  'deep-space': {
    delays: [0.043, 0.071, 0.097, 0.131, 0.179, 0.227],
    feedbacks: [0.5, 0.48, 0.45, 0.42, 0.38, 0.33],
    wetGain: 0.6,
    dryGain: 0.5,
  },
  'industrial-hangar': {
    delays: [0.019, 0.031, 0.047, 0.067, 0.089, 0.113],
    feedbacks: [0.4, 0.37, 0.34, 0.31, 0.27, 0.23],
    wetGain: 0.45,
    dryGain: 0.7,
  },
  'cathedral': {
    delays: [0.061, 0.097, 0.139, 0.181, 0.229, 0.283],
    feedbacks: [0.65, 0.63, 0.6, 0.57, 0.53, 0.48],
    wetGain: 0.75,
    dryGain: 0.4,
  },
};

export const useAnimationSounds = (config: AnimationSoundsConfig = {}) => {
  const { enabled = true, volume = 0.3, preset: initialPreset = 'industrial-hangar' } = config;
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundsEnabled, setSoundsEnabled] = useState(enabled);
  const [currentPreset, setCurrentPreset] = useState<AudioPreset>(initialPreset);

  useEffect(() => {
    // Initialize Web Audio API context
    if (typeof window !== 'undefined' && soundsEnabled) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [soundsEnabled]);

  // Create reverb effect using multiple delays with preset configurations
  const createReverb = (ctx: AudioContext, input: AudioNode, output: AudioNode) => {
    const presetConfig = AUDIO_PRESETS[currentPreset];
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = presetConfig.wetGain;

    // Create multiple delay lines for complex reverb using preset parameters
    presetConfig.delays.forEach((delayTime, index) => {
      const delay = ctx.createDelay(1);
      const delayGain = ctx.createGain();
      const feedback = ctx.createGain();

      delay.delayTime.value = delayTime;
      delayGain.gain.value = 0.6 / presetConfig.delays.length; // Distribute energy
      feedback.gain.value = presetConfig.feedbacks[index];

      // Create feedback loop
      input.connect(delay);
      delay.connect(delayGain);
      delay.connect(feedback);
      feedback.connect(delay);
      delayGain.connect(reverbGain);
    });

    // Mix dry and wet signals using preset balance
    const dryGain = ctx.createGain();
    dryGain.gain.value = presetConfig.dryGain;

    input.connect(dryGain);
    dryGain.connect(output);
    reverbGain.connect(output);

    return { input, output };
  };

  const playWhooshSound = () => {
    if (!soundsEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    
    // Add reverb effect
    createReverb(ctx, gainNode, ctx.destination);

    // Deep spaceship whoosh: low frequency sweep
    oscillator.frequency.setValueAtTime(120, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);

    // Low-pass filter for darker sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);

    // Volume envelope - more dramatic
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    oscillator.type = 'sawtooth';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const playPopSound = () => {
    if (!soundsEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    
    // Add reverb effect
    createReverb(ctx, gainNode, ctx.destination);

    // Industrial pop: deep mechanical sound
    oscillator.frequency.setValueAtTime(180, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    // Punchy volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    oscillator.type = 'square';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  };

  const playSparkleSound = () => {
    if (!soundsEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    
    // Add reverb effect
    createReverb(ctx, gainNode, ctx.destination);

    // Energy charge sound: mid-range metallic
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.45, ctx.currentTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    oscillator.type = 'triangle';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const playImpactSound = () => {
    if (!soundsEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    
    // Add reverb effect for cavernous impact
    createReverb(ctx, gainNode, ctx.destination);

    // Heavy impact: ultra-deep bass like Doom door opening
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    oscillator.type = 'square';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.35);
  };

  const playRiseSound = () => {
    if (!soundsEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    
    // Add reverb for spaceship engine echo
    createReverb(ctx, gainNode, ctx.destination);

    // Spaceship engine startup: powerful ascending growl
    oscillator.frequency.setValueAtTime(60, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.7);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.7);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.15);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    oscillator.type = 'sawtooth';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.7);
  };

  const toggleSounds = () => {
    setSoundsEnabled(prev => !prev);
  };

  const changePreset = (preset: AudioPreset) => {
    setCurrentPreset(preset);
  };

  return {
    playWhooshSound,
    playPopSound,
    playSparkleSound,
    playImpactSound,
    playRiseSound,
    toggleSounds,
    changePreset,
    soundsEnabled,
    currentPreset,
  };
};
