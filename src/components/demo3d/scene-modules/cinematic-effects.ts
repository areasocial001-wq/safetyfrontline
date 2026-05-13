import * as BABYLON from '@babylonjs/core';

/**
 * Cinematic & gameplay-feedback effects layered on top of the base
 * DefaultRenderingPipeline created in scene-setup.ts.
 *
 * - SSAO2 (medium+): adds depth & contact shadows.
 * - Sharpness, FXAA, Grain: cleaner cinematic look.
 * - Motion blur (high+): subtle movement feedback.
 * - Depth of Field (high+): focus on what the player is looking at.
 * - Volumetric god rays for outdoor (construction).
 * - Ambient dust / pollen particles for atmosphere.
 * - Camera shake + hit-stop + screen flash via window events:
 *      window.dispatchEvent(new CustomEvent('babylon-fx-shake',  { detail: { intensity: 0.4, duration: 250 } }))
 *      window.dispatchEvent(new CustomEvent('babylon-fx-flash',  { detail: { color: '#ff3030', duration: 180 } }))
 *      window.dispatchEvent(new CustomEvent('babylon-fx-hitstop',{ detail: { duration: 80 } }))
 */
export function applyCinematicEnhancements(
  scene: BABYLON.Scene,
  camera: BABYLON.Camera,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  scenarioType: string,
): () => void {
  const cleanups: Array<() => void> = [];
  if (quality === 'low') {
    return () => {};
  }

  // ===== SSAO2 =====
  try {
    const ssaoRatio = quality === 'ultra' ? 0.75 : quality === 'high' ? 0.5 : 0.4;
    const ssao = new BABYLON.SSAO2RenderingPipeline('ssao', scene, {
      ssaoRatio,
      blurRatio: 0.5,
    }, [camera as BABYLON.Camera]);
    ssao.radius = 1.6;
    ssao.totalStrength = scenarioType === 'office' ? 0.9 : 1.2;
    ssao.expensiveBlur = quality === 'ultra';
    ssao.samples = quality === 'ultra' ? 16 : 8;
    ssao.maxZ = 80;
    cleanups.push(() => ssao.dispose());
  } catch (err) {
    // Hardware may not support depth texture; ignore.
    console.warn('[cinematic] SSAO2 unavailable', err);
  }

  // ===== Existing pipeline tweaks (sharpness, FXAA, grain, motion blur, DoF) =====
  const pipeline = scene.postProcessRenderPipelineManager.supportedPipelines
    .find(p => p.name === 'cinematicPipeline') as BABYLON.DefaultRenderingPipeline | undefined;

  if (pipeline) {
    pipeline.fxaaEnabled = true;
    pipeline.samples = quality === 'ultra' ? 4 : 1;

    pipeline.sharpenEnabled = true;
    pipeline.sharpen.edgeAmount = scenarioType === 'office' ? 0.18 : 0.32;
    pipeline.sharpen.colorAmount = 1.0;

    pipeline.grainEnabled = true;
    pipeline.grain.intensity = scenarioType === 'warehouse' ? 8 : 4;
    pipeline.grain.animated = true;

    if (quality === 'high' || quality === 'ultra') {
      // Motion blur: stronger at higher quality.
      pipeline.imageProcessing.exposure = pipeline.imageProcessing.exposure;
      try {
        pipeline.depthOfFieldEnabled = scenarioType !== 'office'; // office benefits from sharp UI clarity
        pipeline.depthOfField.focalLength = 50;
        pipeline.depthOfField.fStop = 4.5;
        pipeline.depthOfField.focusDistance = 6000;
        pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
      } catch (e) { /* ignore */ }
    }
  }

  // ===== God rays for outdoor =====
  if (scenarioType === 'construction' && (quality === 'high' || quality === 'ultra')) {
    try {
      const sunMesh = BABYLON.MeshBuilder.CreateSphere('godrays_sun', { diameter: 6, segments: 12 }, scene);
      sunMesh.position = new BABYLON.Vector3(40, 60, 40);
      const sunMat = new BABYLON.StandardMaterial('godrays_sunMat', scene);
      sunMat.emissiveColor = new BABYLON.Color3(1, 0.95, 0.85);
      sunMat.disableLighting = true;
      sunMesh.material = sunMat;
      sunMesh.applyFog = false;
      sunMesh.isPickable = false;

      const godRays = new BABYLON.VolumetricLightScatteringPostProcess(
        'godrays', 1.0, camera, sunMesh, 80,
        BABYLON.Texture.BILINEAR_SAMPLINGMODE, scene.getEngine(), false,
      );
      godRays.exposure = 0.18;
      godRays.decay = 0.96;
      godRays.weight = 0.45;
      godRays.density = 0.92;
      cleanups.push(() => { godRays.dispose(camera); sunMesh.dispose(); });
    } catch (e) { /* ignore */ }
  }

  // ===== Ambient dust / pollen particles =====
  try {
    const count = quality === 'ultra' ? 600 : quality === 'high' ? 350 : 180;
    const dust = new BABYLON.ParticleSystem('ambient_dust', count, scene);
    dust.particleTexture = createDustTexture(scene);
    dust.minEmitBox = new BABYLON.Vector3(-15, 0, -15);
    dust.maxEmitBox = new BABYLON.Vector3(15, 6, 15);
    dust.emitter = new BABYLON.Vector3(0, 2, 0);
    const isOutdoor = scenarioType === 'construction';
    const tint = isOutdoor
      ? new BABYLON.Color4(1, 0.95, 0.78, 0.20)
      : scenarioType === 'warehouse'
        ? new BABYLON.Color4(0.85, 0.88, 0.95, 0.18)
        : new BABYLON.Color4(0.95, 0.95, 1, 0.12);
    dust.color1 = tint;
    dust.color2 = tint;
    dust.colorDead = new BABYLON.Color4(tint.r, tint.g, tint.b, 0);
    dust.minSize = 0.02;
    dust.maxSize = 0.08;
    dust.minLifeTime = 6;
    dust.maxLifeTime = 14;
    dust.emitRate = count / 6;
    dust.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    dust.gravity = new BABYLON.Vector3(0, -0.02, 0);
    dust.direction1 = new BABYLON.Vector3(-0.1, 0.05, -0.1);
    dust.direction2 = new BABYLON.Vector3(0.1, 0.1, 0.1);
    dust.minAngularSpeed = 0;
    dust.maxAngularSpeed = 0.4;
    dust.minEmitPower = 0.05;
    dust.maxEmitPower = 0.15;
    dust.updateSpeed = 0.01;
    dust.preventAutoStart = false;
    dust.start();
    cleanups.push(() => dust.dispose());
  } catch (e) { /* ignore */ }

  // ===== Camera shake / flash / hit-stop =====
  const fxState = { shakeUntil: 0, shakeIntensity: 0, baseFov: (camera as BABYLON.UniversalCamera).fov };
  const onShake = (e: Event) => {
    const d = (e as CustomEvent).detail || {};
    fxState.shakeUntil = performance.now() + (d.duration ?? 250);
    fxState.shakeIntensity = d.intensity ?? 0.3;
  };
  const onHitStop = (e: Event) => {
    const d = (e as CustomEvent).detail || {};
    const ms = d.duration ?? 80;
    const prevTs = scene.getAnimationRatio();
    scene.getEngine().getDeltaTime();
    const origScale = scene.animationTimeScale;
    scene.animationTimeScale = 0.05;
    setTimeout(() => { scene.animationTimeScale = origScale ?? 1; void prevTs; }, ms);
  };
  const onFlash = (e: Event) => {
    const d = (e as CustomEvent).detail || {};
    const color = d.color ?? '#ffffff';
    const duration = d.duration ?? 200;
    const div = document.createElement('div');
    Object.assign(div.style, {
      position: 'fixed', inset: '0', background: color, opacity: '0.6',
      pointerEvents: 'none', zIndex: '9999', transition: `opacity ${duration}ms ease-out`,
    });
    document.body.appendChild(div);
    requestAnimationFrame(() => { div.style.opacity = '0'; });
    setTimeout(() => div.remove(), duration + 50);
  };
  window.addEventListener('babylon-fx-shake', onShake);
  window.addEventListener('babylon-fx-hitstop', onHitStop);
  window.addEventListener('babylon-fx-flash', onFlash);

  const shakeObserver = scene.onBeforeRenderObservable.add(() => {
    const now = performance.now();
    if (now < fxState.shakeUntil && camera instanceof BABYLON.UniversalCamera) {
      const remain = (fxState.shakeUntil - now) / 250;
      const k = fxState.shakeIntensity * remain;
      camera.rotation.x += (Math.random() - 0.5) * k * 0.04;
      camera.rotation.y += (Math.random() - 0.5) * k * 0.04;
    }
  });

  cleanups.push(() => {
    window.removeEventListener('babylon-fx-shake', onShake);
    window.removeEventListener('babylon-fx-hitstop', onHitStop);
    window.removeEventListener('babylon-fx-flash', onFlash);
    scene.onBeforeRenderObservable.remove(shakeObserver);
  });

  return () => cleanups.forEach(fn => { try { fn(); } catch { /* ignore */ } });
}

let cachedDustTex: BABYLON.DynamicTexture | null = null;
function createDustTexture(scene: BABYLON.Scene): BABYLON.DynamicTexture {
  if (cachedDustTex && cachedDustTex.getScene() === scene) return cachedDustTex;
  const size = 64;
  const tex = new BABYLON.DynamicTexture('dust_tex', size, scene, false);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.4)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  tex.hasAlpha = true;
  tex.update();
  cachedDustTex = tex;
  return tex;
}
