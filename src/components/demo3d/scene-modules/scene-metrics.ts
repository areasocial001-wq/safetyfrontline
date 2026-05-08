/**
 * Density / coverage metrics for the procedural office.
 * Counts micro-props per wall band and per quadrant, then flags holes (too few)
 * and overcrowding (too many). Results are surfaced via scene.metadata so the
 * SceneDebugOverlay HUD can render them without prop drilling.
 */

export interface PlacedProp {
  x: number;
  z: number;
  kind: string;
}

export interface SceneDensityMetrics {
  total: number;
  perWall: Record<'N' | 'S' | 'E' | 'W' | 'interior', number>;
  perQuadrant: Record<'NE' | 'NW' | 'SE' | 'SW', number>;
  warnings: string[];
  thresholds: { min: number; max: number };
}

const ROOM_HALF = 15; // matches arenaSize - boundary inset
const WALL_BAND = 3.5; // distance from wall to count as "wall belt"

export function computeDensityMetrics(
  placed: PlacedProp[],
  thresholds = { min: 2, max: 12 }
): SceneDensityMetrics {
  const perWall = { N: 0, S: 0, E: 0, W: 0, interior: 0 };
  const perQuadrant = { NE: 0, NW: 0, SE: 0, SW: 0 };

  for (const p of placed) {
    // Wall band
    const dN = Math.abs(p.z - -ROOM_HALF);
    const dS = Math.abs(p.z - ROOM_HALF);
    const dW = Math.abs(p.x - -ROOM_HALF);
    const dE = Math.abs(p.x - ROOM_HALF);
    const minWall = Math.min(dN, dS, dW, dE);
    if (minWall < WALL_BAND) {
      if (minWall === dN) perWall.N++;
      else if (minWall === dS) perWall.S++;
      else if (minWall === dE) perWall.E++;
      else perWall.W++;
    } else {
      perWall.interior++;
    }
    // Quadrants
    const ns = p.z < 0 ? 'N' : 'S';
    const ew = p.x < 0 ? 'W' : 'E';
    perQuadrant[(ns + ew) as keyof typeof perQuadrant]++;
  }

  const warnings: string[] = [];
  (['N', 'S', 'E', 'W'] as const).forEach((w) => {
    if (perWall[w] < thresholds.min)
      warnings.push(`Hole on wall ${w}: only ${perWall[w]} props (min ${thresholds.min})`);
    if (perWall[w] > thresholds.max)
      warnings.push(`Overcrowded wall ${w}: ${perWall[w]} props (max ${thresholds.max})`);
  });
  (['NE', 'NW', 'SE', 'SW'] as const).forEach((q) => {
    if (perQuadrant[q] < thresholds.min)
      warnings.push(`Hole in quadrant ${q}: only ${perQuadrant[q]} props`);
  });

  return {
    total: placed.length,
    perWall,
    perQuadrant,
    warnings,
    thresholds,
  };
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
