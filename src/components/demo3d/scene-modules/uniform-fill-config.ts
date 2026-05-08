/**
 * Configurable uniform-fill system for procedural office props.
 * Supports presets (Aula / Office) × density (Bassa / Media / Alta) and seeded RNG
 * so the same scenario can be re-rolled deterministically without recompiling.
 */

export type UniformFillPreset = 'office' | 'aula';
export type UniformFillDensity = 'low' | 'medium' | 'high';

export interface UniformFillConfig {
  preset: UniformFillPreset;
  density: UniformFillDensity;
  seed: number;
  /** Number of props along each wall (auto-derived from density) */
  wallSteps: number;
  /** Interior NxN grid resolution (auto-derived) */
  interiorGrid: number;
  /** Multiplier on jitter for organic placement */
  jitter: number;
  /** When true, micro-props will NOT be added as shadow casters (mobile FPS) */
  disableMicroPropShadows: boolean;
  /** Allowed prop kinds (presets pick a different mix) */
  wallKinds: ReadonlyArray<UniformFillKind>;
  interiorKinds: ReadonlyArray<UniformFillKind>;
  /** Skip corner accents (used for empty Aula preset) */
  cornerAccents: boolean;
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
    // Classroom-like: more chairs/signs along walls, sparser interior
    wall:     ['sign', 'plant', 'cabinet', 'sign', 'plant'],
    interior: ['chair', 'chair', 'bin', 'plant'],
    corners: false,
  },
};

export function buildUniformFillConfig(
  partial?: Partial<UniformFillConfig>,
  isMobile = false
): UniformFillConfig {
  const preset: UniformFillPreset = partial?.preset ?? 'office';
  // Mobile auto-downgrades density unless explicitly set
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
    disableMicroPropShadows:
      partial?.disableMicroPropShadows ?? isMobile,
    wallKinds: partial?.wallKinds ?? kinds.wall,
    interiorKinds: partial?.interiorKinds ?? kinds.interior,
    cornerAccents: partial?.cornerAccents ?? kinds.corners,
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
