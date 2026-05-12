import * as BABYLON from '@babylonjs/core';
import { registerAudioContext } from '@/lib/audio-context-unlock';

/**
 * Create particle burst effect at a position (risk found feedback)
 */
export function createParticleEffect(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  isCritical: boolean
) {
  const particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene);
  const emitter = BABYLON.MeshBuilder.CreateSphere('emitter', { diameter: 0.1 }, scene);
  emitter.position = position;
  particleSystem.emitter = emitter;

  particleSystem.particleTexture = new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png', scene);

  particleSystem.color1 = isCritical ? new BABYLON.Color4(1, 0, 0, 1) : new BABYLON.Color4(1, 0.5, 0, 1);
  particleSystem.color2 = isCritical ? new BABYLON.Color4(1, 0.3, 0, 1) : new BABYLON.Color4(1, 1, 0, 1);
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 1.0;
  particleSystem.emitRate = 1000;
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
  particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
  particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
  particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
  particleSystem.minEmitPower = 2;
  particleSystem.maxEmitPower = 4;
  particleSystem.updateSpeed = 0.01;

  particleSystem.start();

  setTimeout(() => {
    particleSystem.stop();
    setTimeout(() => {
      particleSystem.dispose();
      emitter.dispose();
    }, 1000);
  }, isCritical ? 1000 : 500);
}

/**
 * Play a sound when a risk is found
 */
export function playRiskSound(scene: BABYLON.Scene, isCritical: boolean) {
  new BABYLON.Sound(
    'riskSound',
    isCritical
      ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
      : 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    scene,
    null,
    { autoplay: true, volume: 0.5 }
  );
}

/**
 * Haptic feedback for extinguisher usage on mobile
 */
export function triggerHapticFeedback(extType: string) {
  if (!navigator.vibrate) return;
  try {
    switch (extType) {
      case 'co2': navigator.vibrate(120); break;
      case 'powder': navigator.vibrate([30, 15, 30, 15, 40]); break;
      case 'foam': navigator.vibrate([50, 30, 60, 30, 50]); break;
      case 'water': default: navigator.vibrate([20, 10, 40, 10, 60]); break;
    }
  } catch (e) { /* vibrate not available */ }
}

/**
 * Play extinguisher type-specific sound effect
 */
export function playExtinguisherSound(type: string) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    registerAudioContext(ctx);
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'co2': {
        const bufferSize = ctx.sampleRate * 0.6;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(3000, ctx.currentTime);
        hp.frequency.linearRampToValueAtTime(5000, ctx.currentTime + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        noise.connect(hp).connect(gain).connect(masterGain);
        noise.start(); noise.stop(ctx.currentTime + 0.6);
        break;
      }
      case 'powder': {
        const bufLen = ctx.sampleRate * 0.5;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          ch[i] = (Math.random() > 0.6 ? (Math.random() * 2 - 1) * 0.8 : 0) * Math.random();
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 1.5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        src.connect(bp).connect(gain).connect(masterGain);
        src.start(); src.stop(ctx.currentTime + 0.5);
        break;
      }
      case 'foam': {
        const bufLen = ctx.sampleRate * 0.7;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          const t = i / ctx.sampleRate;
          ch[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(t * 25 * Math.PI));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(800, ctx.currentTime);
        lp.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.28, ctx.currentTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        src.connect(lp).connect(gain).connect(masterGain);
        src.start(); src.stop(ctx.currentTime + 0.7);
        break;
      }
      case 'water': default: {
        const bufLen = ctx.sampleRate * 0.5;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) ch[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(600, ctx.currentTime);
        bp.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.2);
        bp.Q.value = 0.8;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 2000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        src.connect(bp).connect(lp).connect(gain).connect(masterGain);
        src.start(); src.stop(ctx.currentTime + 0.5);
        break;
      }
    }
    setTimeout(() => ctx.close(), 1500);
  } catch (e) { /* audio not available */ }
}

/**
 * Fire ambient sound system using spatialized Web Audio
 */
export type FireClass = 'electrical' | 'liquid' | 'solid' | 'gas';

export const FIRE_CLASSES: Record<number, FireClass> = {
  0: 'electrical',
  1: 'solid',
  2: 'electrical',
};

export function getEffectivenessMultiplier(extType: string, fireClass: FireClass): { multiplier: number; isWrong: boolean; message: string } {
  const matrix: Record<string, Record<FireClass, number>> = {
    co2:    { electrical: 0.6, liquid: 0.8, solid: 1.5, gas: 0.9 },
    powder: { electrical: 0.9, liquid: 0.7, solid: 0.8, gas: 0.7 },
    foam:   { electrical: 2.5, liquid: 0.6, solid: 0.7, gas: 1.8 },
    water:  { electrical: 3.0, liquid: 1.8, solid: 0.6, gas: 2.0 },
  };
  const mult = matrix[extType]?.[fireClass] ?? 1;
  const isWrong = mult >= 1.5;
  const classLabels: Record<FireClass, string> = { electrical: 'elettrico', liquid: 'liquido', solid: 'solido', gas: 'gas' };
  const messages: Record<string, string> = { co2: 'CO₂', powder: 'Polvere', foam: 'Schiuma', water: 'Acqua' };
  const message = isWrong
    ? `⚠️ ${messages[extType]} poco efficace su fuoco ${classLabels[fireClass]}!`
    : `✅ ${messages[extType]} efficace su fuoco ${classLabels[fireClass]}`;
  return { multiplier: mult, isWrong, message };
}

export const fireAmbientContexts: AudioContext[] = [];

export function startFireAmbientSound(
  fireClass: string,
  index: number,
  firePos: BABYLON.Vector3,
  cameraRef: React.RefObject<BABYLON.UniversalCamera | null>
) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    registerAudioContext(ctx);
    fireAmbientContexts.push(ctx);

    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 2;
    panner.maxDistance = 25;
    panner.rolloffFactor = 1.5;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.positionX.setValueAtTime(firePos.x, ctx.currentTime);
    panner.positionY.setValueAtTime(firePos.y, ctx.currentTime);
    panner.positionZ.setValueAtTime(firePos.z, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;
    panner.connect(masterGain);
    masterGain.connect(ctx.destination);

    const listenerInterval = setInterval(() => {
      if (ctx.state === 'closed') { clearInterval(listenerInterval); return; }
      const cam = cameraRef.current;
      if (!cam) return;
      try {
        const listener = ctx.listener;
        if (listener.positionX) {
          listener.positionX.setValueAtTime(cam.position.x, ctx.currentTime);
          listener.positionY.setValueAtTime(cam.position.y, ctx.currentTime);
          listener.positionZ.setValueAtTime(cam.position.z, ctx.currentTime);
          const fwd = cam.getDirection(BABYLON.Vector3.Forward());
          listener.forwardX.setValueAtTime(fwd.x, ctx.currentTime);
          listener.forwardY.setValueAtTime(fwd.y, ctx.currentTime);
          listener.forwardZ.setValueAtTime(fwd.z, ctx.currentTime);
          listener.upX.setValueAtTime(0, ctx.currentTime);
          listener.upY.setValueAtTime(1, ctx.currentTime);
          listener.upZ.setValueAtTime(0, ctx.currentTime);
        }
      } catch (e) {}
    }, 100);

    const playLoop = () => {
      if (ctx.state === 'closed') return;

      switch (fireClass) {
        case 'solid': {
          const duration = 2.0;
          const bufLen = Math.floor(ctx.sampleRate * duration);
          const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for (let i = 0; i < bufLen; i++) {
            const t = i / ctx.sampleRate;
            const crackle = Math.random() > 0.92 ? (Math.random() * 2 - 1) * 0.9 : 0;
            const base = Math.sin(t * 80) * 0.05 * Math.random();
            ch[i] = crackle + base;
          }
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass'; bp.frequency.value = 2500 + index * 200; bp.Q.value = 0.8;
          src.connect(bp).connect(panner);
          src.start();
          src.onended = () => setTimeout(playLoop, 100 + Math.random() * 200);
          break;
        }
        case 'liquid': {
          const duration = 2.5;
          const bufLen = Math.floor(ctx.sampleRate * duration);
          const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for (let i = 0; i < bufLen; i++) {
            const t = i / ctx.sampleRate;
            const roar = (Math.random() * 2 - 1) * (0.4 + 0.3 * Math.sin(t * 3));
            const pop = Math.random() > 0.97 ? Math.random() * 0.8 : 0;
            ch[i] = roar + pop;
          }
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass'; lp.frequency.value = 600;
          src.connect(lp).connect(panner);
          src.start();
          src.onended = () => setTimeout(playLoop, 50 + Math.random() * 150);
          break;
        }
        case 'electrical': {
          const duration = 1.8;
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, ctx.currentTime);
          for (let t = 0; t < duration; t += 0.15) {
            const freq = 50 + Math.random() * 30 + (Math.random() > 0.7 ? Math.random() * 200 : 0);
            osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
          }
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass'; bp.frequency.value = 120; bp.Q.value = 2;
          const noiseBufLen = Math.floor(ctx.sampleRate * duration);
          const noiseBuf = ctx.createBuffer(1, noiseBufLen, ctx.sampleRate);
          const noiseCh = noiseBuf.getChannelData(0);
          for (let i = 0; i < noiseBufLen; i++) {
            noiseCh[i] = Math.random() > 0.95 ? (Math.random() * 2 - 1) * 0.6 : 0;
          }
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;
          const noiseHp = ctx.createBiquadFilter();
          noiseHp.type = 'highpass'; noiseHp.frequency.value = 2000;
          const noiseGain = ctx.createGain();
          noiseGain.gain.value = 0.15;
          noiseSrc.connect(noiseHp).connect(noiseGain).connect(panner);
          osc.connect(bp).connect(panner);
          osc.start();
          osc.stop(ctx.currentTime + duration);
          noiseSrc.start();
          noiseSrc.stop(ctx.currentTime + duration);
          osc.onended = () => setTimeout(playLoop, 80 + Math.random() * 200);
          break;
        }
        default: {
          const duration = 2.0;
          const bufLen = Math.floor(ctx.sampleRate * duration);
          const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for (let i = 0; i < bufLen; i++) ch[i] = (Math.random() * 2 - 1) * 0.3;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass'; lp.frequency.value = 1500;
          src.connect(lp).connect(panner);
          src.start();
          src.onended = () => setTimeout(playLoop, 100 + Math.random() * 200);
          break;
        }
      }
    };

    setTimeout(playLoop, 500 + index * 300);
  } catch (e) { /* audio not available */ }
}

/**
 * Create fire class visual indicator billboard
 */
export function createFireClassIndicator(
  scene: BABYLON.Scene,
  firePos: BABYLON.Vector3,
  fireClass: string,
  index: number
) {
  const classConfig: Record<string, { icon: string; label: string; color: BABYLON.Color3; glowColor: BABYLON.Color3 }> = {
    electrical: { icon: '⚡', label: 'ELETTRICO', color: new BABYLON.Color3(0.2, 0.6, 1), glowColor: new BABYLON.Color3(0.1, 0.4, 1) },
    solid: { icon: '🪵', label: 'SOLIDO', color: new BABYLON.Color3(0.9, 0.5, 0.1), glowColor: new BABYLON.Color3(0.8, 0.4, 0) },
    liquid: { icon: '💧', label: 'LIQUIDO', color: new BABYLON.Color3(0.1, 0.8, 0.9), glowColor: new BABYLON.Color3(0, 0.6, 0.8) },
    gas: { icon: '💨', label: 'GAS', color: new BABYLON.Color3(0.6, 0.6, 0.6), glowColor: new BABYLON.Color3(0.4, 0.4, 0.4) },
  };

  const cfg = classConfig[fireClass] || classConfig.solid;

  const texSize = 256;
  const dt = new BABYLON.DynamicTexture(`fireClassTex_${index}`, { width: texSize, height: texSize / 2 }, scene, false);
  const dtCtx = dt.getContext();

  dtCtx.clearRect(0, 0, texSize, texSize / 2);
  dtCtx.fillStyle = `rgba(0, 0, 0, 0.6)`;
  dtCtx.beginPath();
  const pillH = texSize / 2 - 20;
  const pillW = texSize - 20;
  const radius = 20;
  dtCtx.moveTo(10 + radius, 10);
  dtCtx.lineTo(10 + pillW - radius, 10);
  dtCtx.quadraticCurveTo(10 + pillW, 10, 10 + pillW, 10 + radius);
  dtCtx.lineTo(10 + pillW, 10 + pillH - radius);
  dtCtx.quadraticCurveTo(10 + pillW, 10 + pillH, 10 + pillW - radius, 10 + pillH);
  dtCtx.lineTo(10 + radius, 10 + pillH);
  dtCtx.quadraticCurveTo(10, 10 + pillH, 10, 10 + pillH - radius);
  dtCtx.lineTo(10, 10 + radius);
  dtCtx.quadraticCurveTo(10, 10, 10 + radius, 10);
  dtCtx.closePath();
  dtCtx.fill();

  const r = Math.round(cfg.color.r * 255);
  const g = Math.round(cfg.color.g * 255);
  const b = Math.round(cfg.color.b * 255);
  dtCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
  dtCtx.lineWidth = 3;
  dtCtx.stroke();

  dtCtx.font = 'bold 48px Arial';
  (dtCtx as any).textAlign = 'center';
  dtCtx.fillStyle = 'white';
  dtCtx.fillText(cfg.icon, 55, 85);

  dtCtx.font = 'bold 28px Arial';
  dtCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  (dtCtx as any).textAlign = 'center';
  dtCtx.fillText(cfg.label, 165, 85);

  dt.update();

  const plane = BABYLON.MeshBuilder.CreatePlane(`fireClassIndicator_${index}`, { width: 1.6, height: 0.8 }, scene);
  plane.position = firePos.addInPlace(new BABYLON.Vector3(0, 3.2, 0));
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  const mat = new BABYLON.StandardMaterial(`fireClassMat_${index}`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = cfg.color.scale(0.4);
  mat.opacityTexture = dt;
  mat.backFaceCulling = false;
  mat.disableLighting = true;
  mat.useAlphaFromDiffuseTexture = true;
  plane.material = mat;

  const indicatorLight = new BABYLON.PointLight(`fireClassLight_${index}`, plane.position.clone(), scene);
  indicatorLight.diffuse = cfg.glowColor;
  indicatorLight.intensity = 0.5;
  indicatorLight.range = 3;

  const baseY = plane.position.y;
  scene.registerBeforeRender(() => {
    const t = Date.now() * 0.001;
    plane.position.y = baseY + Math.sin(t * 1.5 + index * 2) * 0.15;
    const pulse = 1 + Math.sin(t * 3 + index) * 0.08;
    plane.scaling = new BABYLON.Vector3(pulse, pulse, 1);
    indicatorLight.intensity = 0.4 + Math.sin(t * 2.5 + index) * 0.15;
  });
}
