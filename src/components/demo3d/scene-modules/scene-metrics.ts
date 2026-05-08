/**
 * Density / coverage metrics for the procedural office.
 * Counts micro-props per wall band, per quadrant, and per wall-segment so empty
 * sub-zones are flagged automatically. Results are surfaced via window globals
 * so the SceneDebugOverlay HUD and the visual-regression runner can react.
 */

export interface PlacedProp {
  x: number;
  z: number;
  kind: string;
  /** Optional bbox half-extents for debug bounding box rendering */
  bbox?: { hx: number; hz: number };
}

export type WallSide = 'N' | 'S' | 'E' | 'W';

export interface WallSegmentReport {
  wall: WallSide;
  /** segment index 0..segments-1 along the wall */
  index: number;
  /** prop count inside this segment band */
  count: number;
  /** flagged true when count < min */
  empty: boolean;
}

export interface SceneDensityMetrics {
  total: number;
  perWall: Record<WallSide | 'interior', number>;
  perQuadrant: Record<'NE' | 'NW' | 'SE' | 'SW', number>;
  /** Per-wall sub-segment coverage (default 6 segments / wall) */
  segments: WallSegmentReport[];
  /** Minimum count per segment expected (auto-derived from thresholds) */
  segmentMin: number;
  warnings: string[];
  thresholds: { min: number; max: number };
}

const ROOM_HALF = 15;
const WALL_BAND = 3.5;
const WALL_SPAN = 23.6;
const DEFAULT_SEGMENTS_PER_WALL = 6;

export function computeDensityMetrics(
  placed: PlacedProp[],
  thresholds = { min: 2, max: 12 },
  segmentsPerWall = DEFAULT_SEGMENTS_PER_WALL
): SceneDensityMetrics {
  const perWall = { N: 0, S: 0, E: 0, W: 0, interior: 0 };
  const perQuadrant = { NE: 0, NW: 0, SE: 0, SW: 0 };
  const segCounts: Record<WallSide, number[]> = {
    N: new Array(segmentsPerWall).fill(0),
    S: new Array(segmentsPerWall).fill(0),
    E: new Array(segmentsPerWall).fill(0),
    W: new Array(segmentsPerWall).fill(0),
  };

  const segIndex = (axisValue: number) => {
    const t = (axisValue + WALL_SPAN / 2) / WALL_SPAN;
    return Math.max(0, Math.min(segmentsPerWall - 1, Math.floor(t * segmentsPerWall)));
  };

  for (const p of placed) {
    const dN = Math.abs(p.z - -ROOM_HALF);
    const dS = Math.abs(p.z - ROOM_HALF);
    const dW = Math.abs(p.x - -ROOM_HALF);
    const dE = Math.abs(p.x - ROOM_HALF);
    const minWall = Math.min(dN, dS, dW, dE);
    if (minWall < WALL_BAND) {
      let side: WallSide;
      if (minWall === dN) side = 'N';
      else if (minWall === dS) side = 'S';
      else if (minWall === dE) side = 'E';
      else side = 'W';
      perWall[side]++;
      const axis = side === 'N' || side === 'S' ? p.x : p.z;
      segCounts[side][segIndex(axis)]++;
    } else {
      perWall.interior++;
    }
    const ns = p.z < 0 ? 'N' : 'S';
    const ew = p.x < 0 ? 'W' : 'E';
    perQuadrant[(ns + ew) as keyof typeof perQuadrant]++;
  }

  const segmentMin = Math.max(1, Math.floor(thresholds.min / 2));
  const segments: WallSegmentReport[] = [];
  (['N', 'E', 'S', 'W'] as const).forEach((wall) => {
    segCounts[wall].forEach((count, index) =>
      segments.push({ wall, index, count, empty: count < segmentMin })
    );
  });

  const warnings: string[] = [];
  (['N', 'S', 'E', 'W'] as const).forEach((w) => {
    if (perWall[w] < thresholds.min)
      warnings.push(`Hole on wall ${w}: only ${perWall[w]} props (min ${thresholds.min})`);
    if (perWall[w] > thresholds.max)
      warnings.push(`Overcrowded wall ${w}: ${perWall[w]} props (max ${thresholds.max})`);
    const empties = segments.filter((s) => s.wall === w && s.empty);
    if (empties.length >= 2) {
      warnings.push(`Wall ${w} has ${empties.length}/${segmentsPerWall} empty segments`);
    }
  });
  (['NE', 'NW', 'SE', 'SW'] as const).forEach((q) => {
    if (perQuadrant[q] < thresholds.min)
      warnings.push(`Hole in quadrant ${q}: only ${perQuadrant[q]} props`);
  });

  return { total: placed.length, perWall, perQuadrant, segments, segmentMin, warnings, thresholds };
}

/** Publish metrics on a global so the React HUD can subscribe without imports */
export function publishMetrics(scenarioType: string, metrics: SceneDensityMetrics) {
  const w = window as unknown as {
    __sceneMetrics?: Record<string, SceneDensityMetrics>;
    __sceneMetricsBump?: number;
  };
  w.__sceneMetrics = w.__sceneMetrics || {};
  w.__sceneMetrics[scenarioType] = metrics;
  w.__sceneMetricsBump = (w.__sceneMetricsBump || 0) + 1;
  window.dispatchEvent(new CustomEvent('scene-metrics-updated', { detail: { scenarioType, metrics } }));
  if (metrics.warnings.length) {
    console.warn(`[SceneMetrics:${scenarioType}]`, metrics.warnings);
  } else {
    console.log(`[SceneMetrics:${scenarioType}] ✓ Uniform`, metrics);
  }
}

export interface SceneFillStats {
  placed: PlacedProp[];
  noGoZones: Array<[number, number, number]>;
  metrics: SceneDensityMetrics;
}

/** Publish full stats (placement + no-go) so debug overlay can render bbox/heatmap */
export function publishFillStats(scenarioType: string, stats: SceneFillStats) {
  const w = window as unknown as { __sceneFillStats?: Record<string, SceneFillStats> };
  w.__sceneFillStats = w.__sceneFillStats || {};
  w.__sceneFillStats[scenarioType] = stats;
  window.dispatchEvent(new CustomEvent('scene-fill-stats-updated', { detail: { scenarioType } }));
}

export const ROOM_HALF_EXPORT = ROOM_HALF;
export const WALL_BAND_EXPORT = WALL_BAND;
export const WALL_SPAN_EXPORT = WALL_SPAN;
