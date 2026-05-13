import * as BABYLON from '@babylonjs/core';

/**
 * Soft radial puff with a true alpha channel.
 *
 * Why: the bundled `https://assets.babylonjs.com/textures/flare.png`
 * is a white-on-black flare with NO alpha channel. It works fine with
 * additive blending (BLENDMODE_ONEONE / BLENDMODE_ADD) because black
 * sums to zero — but with BLENDMODE_STANDARD the surrounding black
 * pixels are drawn opaquely, producing a black square around every
 * smoke / spray particle.
 *
 * This helper builds (and caches per-scene) a soft DynamicTexture with
 * proper RGBA, so STANDARD-blended particles (smoke, water, foam,
 * powder) composite cleanly over the scene.
 */
const cache = new WeakMap<BABYLON.Scene, BABYLON.DynamicTexture>();

export function getSoftParticleTexture(scene: BABYLON.Scene): BABYLON.DynamicTexture {
  const cached = cache.get(scene);
  if (cached) return cached;

  const size = 128;
  const tex = new BABYLON.DynamicTexture('soft_particle_tex', size, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.75, 'rgba(255,255,255,0.15)');
  grad.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  tex.hasAlpha = true;
  tex.update(false);

  cache.set(scene, tex);
  return tex;
}
