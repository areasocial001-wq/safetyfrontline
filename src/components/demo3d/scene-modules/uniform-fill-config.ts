/**
 * Configurable uniform-fill system for procedural office props.
 * Supports presets (Aula / Office) × density (Bassa / Media / Alta) × per-wall multipliers,
 * with seeded RNG and localStorage persistence so the same scenario can be re-rolled
 * deterministically without recompiling.
 */

export type UniformFillPreset = 'office' | 'aula';
export type UniformFillDensity = 'low' | 'medium' | 'high';
export type WallId = 'N' | 'S' | 'E' | 'W';

export interface PerWallMultipliers {
  N: number; S: number; E: number; W: number;
  /** Multiplier applied to interior grid quota */
  interior: number;
}

export interface UniformFillConfig {
  preset: UniformFillPreset;
  density: UniformFillDensity;
  seed: number;
  wallSteps: number;
  interiorGrid: number;
  jitter: number;
  disableMicroPropShadows: boolean;
  wallKinds: ReadonlyArray<UniformFillKind>;
  interiorKinds: ReadonlyArray<UniformFillKind>;
  cornerAccents: boolean;
  /** 1.0 = baseline. >1 boost density on that wall, <1 reduce. */
  perWall: PerWallMultipliers;
  /** Radius around scene origin where interior props are heavily skipped (anti-overcrowding) */
  centerExclusionRadius: number;
}

export type UniformFillKind =
  | 'plant' | 'cabinet' | 'bin' | 'cooler' | 'sign' | 'boxes' | 'chair';

const DENSITY_TABLE: Record<UniformFillDensity, { wallSteps: number; interiorGrid: number; jitter: number }> = {
  low:    { wallSteps: 5, interiorGrid: 3, jitter: 0.8 },
  medium: { wallSteps: 8, interiorGrid: 4, jitter: 1.2 },
  high:   { wallSteps: 11, interiorGrid: 5, jitter: 1.5 },
};

const PRESET_KINDS: Record<UniformFillPreset, { wall: UniformFillKind[]; interior: UniformFillKind[]; corners: boolean }> = {
  office: {
    wall:     ['plant', 'cabinet', 'cooler', 'sign', 'boxes', 'plant', 'cabinet'],
    interior: ['plant', 'cabinet', 'bin', 'cooler', 'sign', 'boxes', 'chair'],
    corners: true,
  },
  aula: {
    wall:     ['sign', 'plant', 'cabinet', 'sign', 'plant'],
    interior: ['chair', 'chair', 'bin', 'plant'],
    corners: false,
  },
};

export const DEFAULT_PER_WALL: PerWallMultipliers = {
  N: 1.0, S: 1.0, E: 1.0, W: 1.0, interior: 0.7,
};

export function buildUniformFillConfig(
  partial?: Partial<UniformFillConfig>,
  isMobile = false
): UniformFillConfig {
  const preset: UniformFillPreset = partial?.preset ?? 'office';
  const baseDensity: UniformFillDensity =
    partial?.density ?? (isMobile ? 'low' : 'medium');
  const d = DENSITY_TABLE[baseDensity];
  const kinds = PRESET_KINDS[preset];
  return {
    preset,
    density: baseDensity,
    seed: partial?.seed ?? 1337,
    wallSteps: partial?.wallSteps ?? d.wallSteps,
    interiorGrid: partial?.interiorGrid ?? d.interiorGrid,
    jitter: partial?.jitter ?? d.jitter,
    disableMicroPropShadows: partial?.disableMicroPropShadows ?? isMobile,
    wallKinds: partial?.wallKinds ?? kinds.wall,
    interiorKinds: partial?.interiorKinds ?? kinds.interior,
    cornerAccents: partial?.cornerAccents ?? kinds.corners,
    perWall: { ...DEFAULT_PER_WALL, ...(partial?.perWall ?? {}) },
    centerExclusionRadius: partial?.centerExclusionRadius ?? 5.5,
  };
}

/** Mulberry32 — fast deterministic PRNG */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// PERSISTENCE — per-scenario settings saved to localStorage
// ============================================================

export interface PersistedFillSettings {
  preset: UniformFillPreset;
  density: UniformFillDensity;
  seed: number;
  perWall: PerWallMultipliers;
  centerExclusionRadius: number;
}

const STORAGE_KEY = 'uniform-fill-settings-v2';

export function loadPersistedSettings(scenarioType: string): Partial<PersistedFillSettings> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, PersistedFillSettings>;
    return all[scenarioType] ?? null;
  } catch {
    return null;
  }
}

export function savePersistedSettings(scenarioType: string, settings: PersistedFillSettings): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[scenarioType] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota errors */
  }
}
