import * as BABYLON from '@babylonjs/core';
import { toast } from 'sonner';
import { FIRE_CLASSES, getEffectivenessMultiplier } from './audio-helpers';
import { getSoftParticleTexture } from './particle-textures';

/**
 * Create first-person extinguisher model attached to camera
 */
export function createFirstPersonExtinguisher(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  type: string
) {
  console.log('[BabylonScene] Creating first-person extinguisher:', type);

  const getExtColor = (): { body: BABYLON.Color3; label: BABYLON.Color3; nozzle: BABYLON.Color3 } => {
    switch (type) {
      case 'co2':
        return { body: new BABYLON.Color3(0.15, 0.15, 0.15), label: new BABYLON.Color3(0.3, 0.6, 0.9), nozzle: new BABYLON.Color3(0.5, 0.5, 0.5) };
      case 'powder':
        return { body: new BABYLON.Color3(0.85, 0.1, 0.1), label: new BABYLON.Color3(1, 0.85, 0), nozzle: new BABYLON.Color3(0.3, 0.3, 0.3) };
      case 'foam':
        return { body: new BABYLON.Color3(0.85, 0.1, 0.1), label: new BABYLON.Color3(0.9, 0.8, 0.6), nozzle: new BABYLON.Color3(0.2, 0.2, 0.2) };
      case 'water': default:
        return { body: new BABYLON.Color3(0.85, 0.1, 0.1), label: new BABYLON.Color3(1, 1, 1), nozzle: new BABYLON.Color3(0.4, 0.4, 0.4) };
    }
  };

  const colors = getExtColor();

  const extParent = new BABYLON.TransformNode('extinguisher_parent', scene);
  extParent.parent = camera;
  extParent.position = new BABYLON.Vector3(0.35, -0.35, 0.6);
  extParent.rotation = new BABYLON.Vector3(0.1, -0.3, 0.15);

  const body = BABYLON.MeshBuilder.CreateCylinder('ext_body', { height: 0.45, diameterTop: 0.09, diameterBottom: 0.1, tessellation: 16 }, scene);
  body.parent = extParent;
  const bodyMat = new BABYLON.StandardMaterial('ext_bodyMat', scene);
  bodyMat.diffuseColor = colors.body;
  bodyMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  bodyMat.specularPower = 64;
  body.material = bodyMat;

  const label = BABYLON.MeshBuilder.CreateCylinder('ext_label', { height: 0.12, diameter: 0.105, tessellation: 16 }, scene);
  label.parent = extParent;
  label.position = new BABYLON.Vector3(0, -0.02, 0);
  const labelMat = new BABYLON.StandardMaterial('ext_labelMat', scene);
  labelMat.diffuseColor = colors.label;
  labelMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  label.material = labelMat;

  const valve = BABYLON.MeshBuilder.CreateCylinder('ext_valve', { height: 0.06, diameterTop: 0.04, diameterBottom: 0.07, tessellation: 12 }, scene);
  valve.parent = extParent;
  valve.position = new BABYLON.Vector3(0, 0.25, 0);
  const valveMat = new BABYLON.StandardMaterial('ext_valveMat', scene);
  valveMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  valveMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  valveMat.specularPower = 128;
  valve.material = valveMat;

  const handle = BABYLON.MeshBuilder.CreateBox('ext_handle', { width: 0.015, height: 0.04, depth: 0.1 }, scene);
  handle.parent = extParent;
  handle.position = new BABYLON.Vector3(0, 0.27, 0.04);
  handle.rotation.x = -0.3;
  handle.material = valveMat;

  const nozzle = BABYLON.MeshBuilder.CreateCylinder('ext_nozzle', { height: 0.2, diameterTop: 0.015, diameterBottom: 0.025, tessellation: 8 }, scene);
  nozzle.parent = extParent;
  nozzle.position = new BABYLON.Vector3(0.03, 0.22, 0.1);
  nozzle.rotation.x = Math.PI / 3;
  const nozzleMat = new BABYLON.StandardMaterial('ext_nozzleMat', scene);
  nozzleMat.diffuseColor = colors.nozzle;
  nozzleMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  nozzle.material = nozzleMat;

  const gauge = BABYLON.MeshBuilder.CreateSphere('ext_gauge', { diameter: 0.03, segments: 8 }, scene);
  gauge.parent = extParent;
  gauge.position = new BABYLON.Vector3(-0.04, 0.15, 0.04);
  const gaugeMat = new BABYLON.StandardMaterial('ext_gaugeMat', scene);
  gaugeMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
  gaugeMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.1);
  gauge.material = gaugeMat;

  [body, label, valve, handle, nozzle, gauge].forEach(mesh => {
    mesh.isPickable = false;
    mesh.checkCollisions = false;
  });

  let swayTime = 0;
  scene.registerBeforeRender(() => {
    swayTime += 0.016;
    extParent.position.x = 0.35 + Math.sin(swayTime * 1.2) * 0.003;
    extParent.position.y = -0.35 + Math.cos(swayTime * 0.8) * 0.002;
  });

  console.log('[BabylonScene] ✓ First-person extinguisher created:', type);
}

function resolveSprayAnchor(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
): {
  nozzle: BABYLON.AbstractMesh | null;
  sprayOrigin: BABYLON.Vector3;
  forward: BABYLON.Vector3;
} {
  const cameraForward = camera.getDirection(BABYLON.Vector3.Forward()).normalize();

  for (let i = scene.meshes.length - 1; i >= 0; i--) {
    const mesh = scene.meshes[i];
    if (mesh.isDisposed() || mesh.name !== 'ext_nozzle') continue;

    mesh.computeWorldMatrix(true);

    const nozzleForward = mesh.getDirection(BABYLON.Axis.Y).normalize();
    const oppositeForward = nozzleForward.scale(-1);
    const forward = BABYLON.Vector3.Dot(nozzleForward, cameraForward) >= BABYLON.Vector3.Dot(oppositeForward, cameraForward)
      ? nozzleForward
      : oppositeForward;

    return {
      nozzle: mesh,
      sprayOrigin: mesh.getAbsolutePosition().add(forward.scale(0.12)),
      forward,
    };
  }

  const right = camera.getDirection(BABYLON.Vector3.Right()).normalize();
  const up = camera.getDirection(BABYLON.Vector3.Up()).normalize();

  return {
    nozzle: null,
    sprayOrigin: camera.position.clone()
      .addInPlace(cameraForward.scale(0.72))
      .addInPlace(right.scale(0.28))
      .addInPlace(up.scale(-0.18)),
    forward: cameraForward,
  };
}

/**
 * Shoot extinguisher spray particles from camera forward
 */
export function shootExtinguisherSpray(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  extinguisherType: string,
  fireHitCount: Map<number, number>,
  onFireExtinguished?: (extinguished: number, total: number) => void
) {
  const getSprayColors = () => {
    switch (extinguisherType) {
      case 'co2':
        return { color1: new BABYLON.Color4(0.9, 0.95, 1.0, 0.6), color2: new BABYLON.Color4(0.8, 0.85, 0.95, 0.4), colorDead: new BABYLON.Color4(0.95, 0.97, 1.0, 0), size: { min: 0.08, max: 0.25 } };
      case 'powder':
        // Saturated warm yellow/orange with full alpha so the dense cloud
        // reads clearly against bright office/lab backgrounds.
        return { color1: new BABYLON.Color4(1.0, 0.88, 0.35, 1.0), color2: new BABYLON.Color4(1.0, 0.78, 0.2, 0.95), colorDead: new BABYLON.Color4(0.85, 0.75, 0.5, 0), size: { min: 0.18, max: 0.55 } };
      case 'foam':
        return { color1: new BABYLON.Color4(1.0, 1.0, 1.0, 0.7), color2: new BABYLON.Color4(0.95, 0.97, 1.0, 0.5), colorDead: new BABYLON.Color4(1.0, 1.0, 1.0, 0), size: { min: 0.12, max: 0.4 } };
      case 'water': default:
        return { color1: new BABYLON.Color4(0.5, 0.7, 1.0, 0.5), color2: new BABYLON.Color4(0.4, 0.6, 0.9, 0.3), colorDead: new BABYLON.Color4(0.6, 0.8, 1.0, 0), size: { min: 0.04, max: 0.12 } };
    }
  };

  const colors = getSprayColors();
  const { nozzle, sprayOrigin, forward } = resolveSprayAnchor(scene, camera);

  const capacity = extinguisherType === 'powder' ? 600 : 300;
  const spray = new BABYLON.ParticleSystem('extSpray', capacity, scene);
  const emitter = BABYLON.MeshBuilder.CreateSphere('sprayEmitter', { diameter: 0.05 }, scene);
  if (nozzle) {
    emitter.parent = nozzle;
    emitter.position = new BABYLON.Vector3(0, 0.12, 0);
  } else {
    emitter.position = sprayOrigin;
  }
  emitter.isVisible = false;
  emitter.isPickable = false;
  emitter.checkCollisions = false;
  emitter.computeWorldMatrix(true);
  spray.emitter = emitter;

  // Use a true-alpha radial puff. The flare.png has no alpha channel, so
  // BLENDMODE_STANDARD (water/foam/powder) was rendering each particle as a
  // black square around the white flare.
  spray.particleTexture = getSoftParticleTexture(scene);
  spray.color1 = colors.color1;
  spray.color2 = colors.color2;
  spray.colorDead = colors.colorDead;
  spray.minSize = colors.size.min;
  spray.maxSize = colors.size.max;
  spray.minLifeTime = 0.3;
  spray.maxLifeTime = 0.8;
  spray.emitRate = extinguisherType === 'powder' ? 500 : 250;
  spray.blendMode = extinguisherType === 'co2' ? BABYLON.ParticleSystem.BLENDMODE_ONEONE : BABYLON.ParticleSystem.BLENDMODE_STANDARD;
  spray.renderingGroupId = 2;

  const spreadAmount = extinguisherType === 'powder' ? 0.6 : 0.3;
  spray.direction1 = forward.scale(3).add(new BABYLON.Vector3(-spreadAmount, -spreadAmount, -spreadAmount));
  spray.direction2 = forward.scale(5).add(new BABYLON.Vector3(spreadAmount, spreadAmount, spreadAmount));
  spray.minEmitPower = 3;
  spray.maxEmitPower = 6;
  spray.updateSpeed = 0.01;
  spray.gravity = extinguisherType === 'water' ? new BABYLON.Vector3(0, -4, 0) : new BABYLON.Vector3(0, -0.5, 0);
  spray.minEmitBox = new BABYLON.Vector3(-0.05, -0.05, -0.05);
  spray.maxEmitBox = new BABYLON.Vector3(0.05, 0.05, 0.05);

  if (extinguisherType === 'foam' || extinguisherType === 'powder') {
    spray.minAngularSpeed = -1;
    spray.maxAngularSpeed = 1;
  }

  spray.start();

  // Spray sound
  try {
    const audioCtx = new AudioContext();
    import('@/lib/audio-context-unlock').then(m => m.registerAudioContext(audioCtx)).catch(() => {});
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = extinguisherType === 'co2' ? 4000 : 2500;
    filter.Q.value = 0.5;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
    noise.connect(filter).connect(gain).connect(audioCtx.destination);
    noise.start();
    noise.stop(audioCtx.currentTime + 0.8);
    setTimeout(() => audioCtx.close(), 1500);
  } catch (e) {}

  // Check fire hits
  const sprayHitPoint = sprayOrigin.add(forward.scale(5));
  const fireEmitters = scene.meshes.filter(m => m.name.startsWith('fireEmitter_'));

  fireEmitters.forEach((emitterMesh, fireIndex) => {
    const dist = BABYLON.Vector3.Distance(sprayHitPoint, emitterMesh.position);
    if (dist < 3.0) {
      const fireClass = FIRE_CLASSES[fireIndex] || 'solid';
      const { multiplier, isWrong, message } = getEffectivenessMultiplier(extinguisherType, fireClass);

      const currentHits = (fireHitCount.get(fireIndex) || 0) + 1;
      fireHitCount.set(fireIndex, currentHits);

      const hitsNeeded = Math.ceil(5 * multiplier);

      if (currentHits === 1) {
        toast.info(message);
      }

      if (currentHits >= hitsNeeded) {
        const fireSystem = scene.getParticleSystemByID(`fire_${fireIndex}`);
        const smokeSystem = scene.getParticleSystemByID(`fireSmoke_${fireIndex}`);
        if (fireSystem) { fireSystem.stop(); setTimeout(() => fireSystem.dispose(), 2000); }
        if (smokeSystem) { smokeSystem.stop(); setTimeout(() => smokeSystem.dispose(), 2000); }

        const fireLight = scene.getLightByName(`fireLight_${fireIndex}`);
        if (fireLight) { fireLight.dispose(); }

        const extinguished = Array.from(fireHitCount.values()).filter(h => h >= hitsNeeded).length;
        onFireExtinguished?.(extinguished, fireEmitters.length);

        toast.success(`🧯 Focolaio ${fireIndex + 1} spento! (${extinguished}/${fireEmitters.length})`);
      }
    }
  });

  setTimeout(() => {
    spray.stop();
    setTimeout(() => { spray.dispose(); emitter.dispose(); }, 1500);
  }, 600);

  const hits = fireEmitters.filter(em => BABYLON.Vector3.Distance(sprayHitPoint, em.position) < 3.0).length;
  return { hitFire: hits > 0, hitsCount: hits };
}

/**
 * Aim check: returns true if the camera forward ray points at (or near) any active fire emitter.
 * Used BEFORE consuming charge so misses don't waste the extinguisher.
 */
export function aimHasFire(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  maxDistance = 8,
  tolerance = 2.5
): { hit: boolean; nearestDistance: number; nearestIndex: number | null } {
  const fireEmitters = scene.meshes.filter(m => m.name.startsWith('fireEmitter_'));
  if (fireEmitters.length === 0) return { hit: false, nearestDistance: Infinity, nearestIndex: null };

  const origin = camera.position;
  const forward = camera.getDirection(BABYLON.Vector3.Forward()).normalize();
  let nearest = Infinity;
  let nearestIndex: number | null = null;
  let hit = false;

  for (const em of fireEmitters) {
    const toFire = em.position.subtract(origin);
    const projLen = BABYLON.Vector3.Dot(toFire, forward);
    if (projLen < 0 || projLen > maxDistance) continue;
    const closestPoint = origin.add(forward.scale(projLen));
    const perpDist = BABYLON.Vector3.Distance(closestPoint, em.position);
    if (perpDist < tolerance && perpDist < nearest) {
      hit = true;
      nearest = perpDist;
      // Parse the trailing index from "fireEmitter_<n>"
      const m = em.name.match(/fireEmitter_(\d+)/);
      nearestIndex = m ? parseInt(m[1], 10) : null;
    }
  }
  return { hit, nearestDistance: nearest, nearestIndex };
}
