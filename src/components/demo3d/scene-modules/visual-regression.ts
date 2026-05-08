/**
 * Visual regression utility: renders the scene from N camera angles at multiple
 * resolutions, computes a low-res perceptual hash per frame, and either saves
 * the result as a baseline or compares against a previous baseline (kept in
 * localStorage). PNGs are downloaded so the user can eyeball-diff if needed.
 */
import * as BABYLON from '@babylonjs/core';
import type { SceneDensityMetrics, WallSide } from './scene-metrics';

export interface RegressionShot {
  label: string;
  width: number;
  height: number;
  yaw: number;
  pitch: number;
  position: [number, number, number];
  hash: string;        // 16x16 grayscale fingerprint, base64
  dataUrl: string;     // PNG dataURL
}

export interface RegressionReport {
  scenarioType: string;
  timestamp: string;
  shots: RegressionShot[];
  diff?: { label: string; distance: number }[];
}

const ANGLES = [
  { label: 'spawn-front',  position: [0, 1.7, 12] as [number, number, number],  yaw: Math.PI, pitch: 0 },
  { label: 'spawn-back',   position: [0, 1.7, 12] as [number, number, number],  yaw: 0, pitch: 0 },
  { label: 'center-N',     position: [0, 1.7, 0] as [number, number, number],   yaw: Math.PI, pitch: -0.05 },
  { label: 'center-E',     position: [0, 1.7, 0] as [number, number, number],   yaw: -Math.PI / 2, pitch: -0.05 },
  { label: 'center-S',     position: [0, 1.7, 0] as [number, number, number],   yaw: 0, pitch: -0.05 },
  { label: 'center-W',     position: [0, 1.7, 0] as [number, number, number],   yaw: Math.PI / 2, pitch: -0.05 },
  { label: 'overhead',     position: [0, 8, 0] as [number, number, number],     yaw: 0, pitch: -1.2 },
];

const RESOLUTIONS: Array<[number, number, string]> = [
  [1920, 1080, '1080p'],
  [1280, 720, '720p'],
  [414, 896, 'mobile'],
];

function computeHash(canvas: HTMLCanvasElement): string {
  const small = document.createElement('canvas');
  small.width = 16;
  small.height = 16;
  const ctx = small.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, 16, 16);
  const data = ctx.getImageData(0, 0, 16, 16).data;
  const out = new Uint8Array(16 * 16);
  for (let i = 0; i < 16 * 16; i++) {
    out[i] = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
  }
  return btoa(String.fromCharCode(...out));
}

function hashDistance(a: string, b: string): number {
  if (!a || !b || a.length !== b.length) return Infinity;
  const A = atob(a);
  const B = atob(b);
  let sum = 0;
  for (let i = 0; i < A.length; i++) sum += Math.abs(A.charCodeAt(i) - B.charCodeAt(i));
  return sum / A.length;
}

export async function runVisualRegression(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  engine: BABYLON.Engine,
  scenarioType: string,
  options: { saveBaseline?: boolean; download?: boolean } = {}
): Promise<RegressionReport> {
  const canvas = engine.getRenderingCanvas() as HTMLCanvasElement;
  const originalSize = { w: engine.getRenderWidth(), h: engine.getRenderHeight() };
  const originalPos = camera.position.clone();
  const originalRot = camera.rotation.clone();
  const collisionsBackup = camera.checkCollisions;
  const gravityBackup = camera.applyGravity;
  camera.checkCollisions = false;
  camera.applyGravity = false;

  const shots: RegressionShot[] = [];

  try {
    for (const [w, h, label] of RESOLUTIONS) {
      engine.setSize(w, h);
      for (const a of ANGLES) {
        camera.position.set(...a.position);
        camera.rotation.set(a.pitch, a.yaw, 0);
        scene.render();
        await new Promise((r) => requestAnimationFrame(r));
        const dataUrl = canvas.toDataURL('image/png');
        const hash = computeHash(canvas);
        shots.push({
          label: `${label}__${a.label}`,
          width: w, height: h,
          yaw: a.yaw, pitch: a.pitch,
          position: a.position,
          hash, dataUrl,
        });
      }
    }
  } finally {
    engine.setSize(originalSize.w, originalSize.h);
    camera.position.copyFrom(originalPos);
    camera.rotation.copyFrom(originalRot);
    camera.checkCollisions = collisionsBackup;
    camera.applyGravity = gravityBackup;
    scene.render();
  }

  const baselineKey = `vr-baseline-${scenarioType}`;
  let diff: { label: string; distance: number }[] | undefined;
  if (options.saveBaseline) {
    const lite = shots.map(({ dataUrl, ...rest }) => rest);
    localStorage.setItem(baselineKey, JSON.stringify(lite));
    console.log(`[VisualRegression] Baseline saved (${shots.length} shots) for ${scenarioType}`);
  } else {
    const raw = localStorage.getItem(baselineKey);
    if (raw) {
      const baseline: RegressionShot[] = JSON.parse(raw);
      diff = shots.map((s) => {
        const b = baseline.find((x) => x.label === s.label);
        return { label: s.label, distance: b ? hashDistance(s.hash, b.hash) : Infinity };
      });
      const failures = diff.filter((d) => d.distance > 12);
      console.log(`[VisualRegression] Compared ${shots.length} shots — ${failures.length} mismatches > threshold`, failures);
    } else {
      console.warn(`[VisualRegression] No baseline for ${scenarioType}; run with saveBaseline first.`);
    }
  }

  if (options.download) {
    shots.forEach((s) => {
      const a = document.createElement('a');
      a.href = s.dataUrl;
      a.download = `vr-${scenarioType}-${s.label}.png`;
      a.click();
    });
  }

  return { scenarioType, timestamp: new Date().toISOString(), shots, diff };
}
