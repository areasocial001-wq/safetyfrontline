/**
 * Debug visualizer: outlines collision meshes, tints shadow casters, draws a
 * quadrant grid, plus three overlays driven by published fill stats:
 *  - Coverage heatmap (one quad per wall segment, color-coded by density)
 *  - Bounding boxes around every placed micro-prop
 *  - No-go zones (red discs around hazards / desks)
 */
import * as BABYLON from '@babylonjs/core';
import {
  ROOM_HALF_EXPORT as ROOM_HALF,
  WALL_BAND_EXPORT as WALL_BAND,
  WALL_SPAN_EXPORT as WALL_SPAN,
  type SceneFillStats,
  type WallSide,
} from './scene-metrics';

let active = false;
let quadrantGrid: BABYLON.LinesMesh | null = null;
const tinted: Array<{ mat: BABYLON.StandardMaterial; original: BABYLON.Color3 }> = [];
const overlayMeshes: BABYLON.Mesh[] = [];
let overlayScenario: string | null = null;
let statsListener: ((e: Event) => void) | null = null;

export function isDebugActive(): boolean {
  return active;
}

function disposeOverlays() {
  overlayMeshes.forEach((m) => m.dispose());
  overlayMeshes.length = 0;
}

function buildOverlays(scene: BABYLON.Scene, stats: SceneFillStats) {
  disposeOverlays();
  const Y = 0.04;

  // 1. Coverage heatmap — one ground plane per wall segment
  const segmentsPerWall = Math.max(1, stats.metrics.segments.length / 4);
  const segLen = WALL_SPAN / segmentsPerWall;
  const wallOffsetMap: Record<WallSide, { axis: 'x' | 'z'; band: number }> = {
    N: { axis: 'x', band: -ROOM_HALF + WALL_BAND / 2 },
    S: { axis: 'x', band:  ROOM_HALF - WALL_BAND / 2 },
    W: { axis: 'z', band: -ROOM_HALF + WALL_BAND / 2 },
    E: { axis: 'z', band:  ROOM_HALF - WALL_BAND / 2 },
  };
  // Determine "ideal" count per segment from per-wall total / segments
  const idealPerSeg = Math.max(1, Math.round(
    Object.values(stats.metrics.perWall).reduce((a, b) => a + b, 0) / 4 / segmentsPerWall
  ));
  const colorFor = (count: number) => {
    if (count < stats.metrics.segmentMin) return new BABYLON.Color3(0.95, 0.15, 0.15);   // red — empty
    if (count < idealPerSeg) return new BABYLON.Color3(0.95, 0.7, 0.15);                 // amber — low
    if (count > idealPerSeg * 2) return new BABYLON.Color3(0.6, 0.2, 0.85);              // purple — overcrowded
    return new BABYLON.Color3(0.2, 0.85, 0.35);                                          // green — ok
  };
  stats.metrics.segments.forEach((seg) => {
    const offset = wallOffsetMap[seg.wall];
    const tCenter = -WALL_SPAN / 2 + (seg.index + 0.5) * segLen;
    const planeW = offset.axis === 'x' ? segLen * 0.92 : WALL_BAND * 0.85;
    const planeD = offset.axis === 'x' ? WALL_BAND * 0.85 : segLen * 0.92;
    const plane = BABYLON.MeshBuilder.CreateGround(
      `dbg_heat_${seg.wall}_${seg.index}`,
      { width: planeW, height: planeD },
      scene
    );
    plane.position.y = Y;
    if (offset.axis === 'x') { plane.position.x = tCenter; plane.position.z = offset.band; }
    else { plane.position.z = tCenter; plane.position.x = offset.band; }
    const mat = new BABYLON.StandardMaterial(`dbg_heatMat_${seg.wall}_${seg.index}`, scene);
    const c = colorFor(seg.count);
    mat.diffuseColor = c;
    mat.emissiveColor = c.scale(0.6);
    mat.alpha = 0.4;
    mat.disableLighting = true;
    plane.material = mat;
    plane.isPickable = false;
    overlayMeshes.push(plane);
  });

  // 2. Bounding boxes around placed micro-props (cyan)
  stats.placed.forEach((p, i) => {
    const hx = p.bbox?.hx ?? 0.4;
    const hz = p.bbox?.hz ?? 0.4;
    const points = [
      new BABYLON.Vector3(p.x - hx, Y + 0.01, p.z - hz),
      new BABYLON.Vector3(p.x + hx, Y + 0.01, p.z - hz),
      new BABYLON.Vector3(p.x + hx, Y + 0.01, p.z + hz),
      new BABYLON.Vector3(p.x - hx, Y + 0.01, p.z + hz),
      new BABYLON.Vector3(p.x - hx, Y + 0.01, p.z - hz),
    ];
    const line = BABYLON.MeshBuilder.CreateLines(`dbg_bbox_${i}`, { points }, scene);
    line.color = new BABYLON.Color3(0.2, 0.85, 0.95);
    line.isPickable = false;
    overlayMeshes.push(line as unknown as BABYLON.Mesh);
  });

  // 3. No-go zones — red discs
  stats.noGoZones.forEach(([x, z, r], i) => {
    const disc = BABYLON.MeshBuilder.CreateDisc(`dbg_nogo_${i}`,
      { radius: r, tessellation: 32 }, scene);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, Y + 0.005, z);
    const mat = new BABYLON.StandardMaterial(`dbg_nogoMat_${i}`, scene);
    mat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.2);
    mat.emissiveColor = new BABYLON.Color3(0.6, 0.05, 0.1);
    mat.alpha = 0.28;
    mat.disableLighting = true;
    disc.material = mat;
    disc.isPickable = false;
    overlayMeshes.push(disc);
  });
}

export function enableSceneDebug(scene: BABYLON.Scene, scenarioType = 'office') {
  if (active) return;
  active = true;
  overlayScenario = scenarioType;

  // Outline collision meshes + tint shadow casters
  const shadowCasterNames = new Set<string>();
  scene.lights.forEach((l) => {
    const sg = l.getShadowGenerator();
    if (sg) sg.getShadowMap()?.renderList?.forEach((m) => shadowCasterNames.add(m.name));
  });

  scene.meshes.forEach((m) => {
    if (!(m instanceof BABYLON.Mesh)) return;
    if (m.checkCollisions) {
      try {
        m.enableEdgesRendering();
        m.edgesWidth = 4;
        m.edgesColor = new BABYLON.Color4(0.2, 1.0, 0.3, 1);
      } catch { /* noop */ }
    }
    if (shadowCasterNames.has(m.name) && m.material instanceof BABYLON.StandardMaterial) {
      const orig = m.material.emissiveColor.clone();
      tinted.push({ mat: m.material, original: orig });
      m.material.emissiveColor = orig.add(new BABYLON.Color3(0.25, 0.12, 0.0));
    }
  });

  // Quadrant grid
  const Y = 0.02;
  const H = 15;
  const lines: BABYLON.Vector3[][] = [
    [new BABYLON.Vector3(-H, Y, 0), new BABYLON.Vector3(H, Y, 0)],
    [new BABYLON.Vector3(0, Y, -H), new BABYLON.Vector3(0, Y, H)],
    [new BABYLON.Vector3(-H, Y, -H + 3.5), new BABYLON.Vector3(H, Y, -H + 3.5)],
    [new BABYLON.Vector3(-H, Y, H - 3.5), new BABYLON.Vector3(H, Y, H - 3.5)],
    [new BABYLON.Vector3(-H + 3.5, Y, -H), new BABYLON.Vector3(-H + 3.5, Y, H)],
    [new BABYLON.Vector3(H - 3.5, Y, -H), new BABYLON.Vector3(H - 3.5, Y, H)],
  ];
  quadrantGrid = BABYLON.MeshBuilder.CreateLineSystem('debug_quadrants', { lines }, scene);
  quadrantGrid.color = new BABYLON.Color3(1, 0.4, 0.9);
  quadrantGrid.isPickable = false;

  // Heatmap + bbox + no-go from published stats
  const w = window as unknown as { __sceneFillStats?: Record<string, SceneFillStats> };
  const stats = w.__sceneFillStats?.[scenarioType];
  if (stats) buildOverlays(scene, stats);

  // Auto-refresh overlays when stats are republished (e.g. after reseed)
  statsListener = (e: Event) => {
    const detail = (e as CustomEvent).detail as { scenarioType?: string };
    if (!active || detail?.scenarioType !== overlayScenario) return;
    const s = (window as unknown as { __sceneFillStats?: Record<string, SceneFillStats> })
      .__sceneFillStats?.[overlayScenario!];
    if (s) buildOverlays(scene, s);
  };
  window.addEventListener('scene-fill-stats-updated', statsListener);

  console.log('[SceneDebug] ENABLED — collisions, heatmap, bbox, no-go zones');
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
  disposeOverlays();
  if (statsListener) {
    window.removeEventListener('scene-fill-stats-updated', statsListener);
    statsListener = null;
  }
  overlayScenario = null;
  console.log('[SceneDebug] DISABLED');
}

export function toggleSceneDebug(scene: BABYLON.Scene, scenarioType = 'office') {
  if (active) disableSceneDebug(scene);
  else enableSceneDebug(scene, scenarioType);
}
