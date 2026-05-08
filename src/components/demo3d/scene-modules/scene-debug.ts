/**
 * Debug visualizer: outlines collision meshes, tints shadow casters, and
 * draws a quadrant grid on the floor. Toggleable at runtime via window API.
 */
import * as BABYLON from '@babylonjs/core';

let active = false;
let quadrantGrid: BABYLON.LinesMesh | null = null;
const tinted: Array<{ mat: BABYLON.StandardMaterial; original: BABYLON.Color3 }> = [];

export function isDebugActive(): boolean {
  return active;
}

export function enableSceneDebug(scene: BABYLON.Scene) {
  if (active) return;
  active = true;

  // 1. Outline all collision meshes (green) and shadow casters (orange tint)
  const shadowCasterNames = new Set<string>();
  scene.lights.forEach((l) => {
    const sg = l.getShadowGenerator();
    if (sg) {
      const map = sg.getShadowMap();
      map?.renderList?.forEach((m) => shadowCasterNames.add(m.name));
    }
  });

  scene.meshes.forEach((m) => {
    if (!(m instanceof BABYLON.Mesh)) return;
    if (m.checkCollisions) {
      try {
        m.enableEdgesRendering();
        m.edgesWidth = 4;
        m.edgesColor = new BABYLON.Color4(0.2, 1.0, 0.3, 1);
      } catch {
        /* some meshes don't support edges */
      }
    }
    if (shadowCasterNames.has(m.name) && m.material instanceof BABYLON.StandardMaterial) {
      const orig = m.material.emissiveColor.clone();
      tinted.push({ mat: m.material, original: orig });
      m.material.emissiveColor = orig.add(new BABYLON.Color3(0.25, 0.12, 0.0));
    }
  });

  // 2. Quadrant grid on floor
  const Y = 0.02;
  const H = 15;
  const lines: BABYLON.Vector3[][] = [
    [new BABYLON.Vector3(-H, Y, 0), new BABYLON.Vector3(H, Y, 0)],
    [new BABYLON.Vector3(0, Y, -H), new BABYLON.Vector3(0, Y, H)],
    // wall band markers
    [new BABYLON.Vector3(-H, Y, -H + 3.5), new BABYLON.Vector3(H, Y, -H + 3.5)],
    [new BABYLON.Vector3(-H, Y, H - 3.5), new BABYLON.Vector3(H, Y, H - 3.5)],
    [new BABYLON.Vector3(-H + 3.5, Y, -H), new BABYLON.Vector3(-H + 3.5, Y, H)],
    [new BABYLON.Vector3(H - 3.5, Y, -H), new BABYLON.Vector3(H - 3.5, Y, H)],
  ];
  quadrantGrid = BABYLON.MeshBuilder.CreateLineSystem('debug_quadrants', { lines }, scene);
  quadrantGrid.color = new BABYLON.Color3(1, 0.4, 0.9);
  quadrantGrid.isPickable = false;

  console.log('[SceneDebug] ENABLED — collision edges + shadow caster tint + quadrant grid');
}

export function disableSceneDebug(scene: BABYLON.Scene) {
  if (!active) return;
  active = false;
  scene.meshes.forEach((m) => {
    if (m instanceof BABYLON.Mesh && m.checkCollisions) {
      try { m.disableEdgesRendering(); } catch { /* noop */ }
    }
  });
  tinted.forEach(({ mat, original }) => { mat.emissiveColor = original; });
  tinted.length = 0;
  quadrantGrid?.dispose();
  quadrantGrid = null;
  console.log('[SceneDebug] DISABLED');
}

export function toggleSceneDebug(scene: BABYLON.Scene) {
  if (active) disableSceneDebug(scene);
  else enableSceneDebug(scene);
}
