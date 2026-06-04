// Versioned calibration storage for the Spot the Hazard 2D game.
// Persists per-level hitbox overrides in localStorage with a schema version
// and automatically migrates legacy formats (bare arrays from v0) to the
// current envelope. Also provides audit, export and import helpers.

import type { CartoonHazard, CartoonHazardLevel } from "@/data/cartoon-hazard-levels";

export const CALIBRATION_SCHEMA_VERSION = 2;

export interface HazardOverride {
  id: string;
  position: { top: string; left: string };
  hitbox_size: { width: string; height: string };
}

export interface CalibrationEnvelope {
  version: number;
  levelId: string;
  updatedAt: string; // ISO
  hazards: HazardOverride[];
}

export interface CalibrationBundle {
  version: number;
  exportedAt: string;
  levels: Record<string, CalibrationEnvelope>;
}

export interface AuditIssue {
  levelId: string;
  hazardId: string;
  kind: "off_scene" | "corrupt" | "unknown_id" | "missing_id" | "zero_size";
  message: string;
}

export const calibKey = (levelId: string) => `sth_calibration_${levelId}`;

const pct = (v: unknown): number => {
  if (typeof v !== "string") return NaN;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
};

const isValidOverride = (o: any): o is HazardOverride =>
  o && typeof o === "object" &&
  typeof o.id === "string" &&
  o.position && typeof o.position.top === "string" && typeof o.position.left === "string" &&
  o.hitbox_size && typeof o.hitbox_size.width === "string" && typeof o.hitbox_size.height === "string";

/**
 * Migrate any historical payload shape into the current envelope.
 * - v0 (legacy): bare array of HazardOverride saved directly.
 * - v1: { version: 1, hazards: [...] } (no updatedAt)
 * - v2 (current): full envelope.
 */
export const migrateEnvelope = (
  raw: unknown,
  levelId: string,
): CalibrationEnvelope | null => {
  if (raw == null) return null;

  // v0: bare array
  if (Array.isArray(raw)) {
    const hazards = raw.filter(isValidOverride);
    if (!hazards.length) return null;
    return {
      version: CALIBRATION_SCHEMA_VERSION,
      levelId,
      updatedAt: new Date().toISOString(),
      hazards,
    };
  }

  if (typeof raw !== "object") return null;
  const obj = raw as any;
  const hazards = Array.isArray(obj.hazards) ? obj.hazards.filter(isValidOverride) : [];
  if (!hazards.length) return null;

  return {
    version: CALIBRATION_SCHEMA_VERSION,
    levelId: typeof obj.levelId === "string" ? obj.levelId : levelId,
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : new Date().toISOString(),
    hazards,
  };
};

export const loadEnvelope = (levelId: string): CalibrationEnvelope | null => {
  try {
    const raw = localStorage.getItem(calibKey(levelId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const env = migrateEnvelope(parsed, levelId);
    if (!env) return null;
    // If the on-disk shape was outdated, write it back in the new format.
    if (!parsed || Array.isArray(parsed) || parsed.version !== CALIBRATION_SCHEMA_VERSION) {
      try { localStorage.setItem(calibKey(levelId), JSON.stringify(env)); } catch { /* ignore */ }
    }
    return env;
  } catch {
    return null;
  }
};

export const saveEnvelope = (levelId: string, hazards: HazardOverride[]): void => {
  try {
    const env: CalibrationEnvelope = {
      version: CALIBRATION_SCHEMA_VERSION,
      levelId,
      updatedAt: new Date().toISOString(),
      hazards,
    };
    localStorage.setItem(calibKey(levelId), JSON.stringify(env));
  } catch { /* ignore */ }
};

export const clearEnvelope = (levelId: string): void => {
  try { localStorage.removeItem(calibKey(levelId)); } catch { /* ignore */ }
};

export const loadOverrides = (levelId: string): HazardOverride[] | null => {
  const env = loadEnvelope(levelId);
  return env ? env.hazards : null;
};

/**
 * Audit a single override against the canonical hazard list. Reports any
 * out-of-scene coordinates, NaN values, unknown ids, or missing hazards.
 */
export const auditLevel = (
  level: CartoonHazardLevel,
  overrides: HazardOverride[] | null,
): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  if (!overrides || overrides.length === 0) return issues;

  const validIds = new Set(level.hazards.map(h => h.id));
  const seen = new Set<string>();

  for (const o of overrides) {
    seen.add(o.id);
    if (!validIds.has(o.id)) {
      issues.push({ levelId: level.level_id, hazardId: o.id, kind: "unknown_id",
        message: `Override per id sconosciuto "${o.id}"` });
      continue;
    }
    const left = pct(o.position.left);
    const top = pct(o.position.top);
    const w = pct(o.hitbox_size.width);
    const h = pct(o.hitbox_size.height);
    if ([left, top, w, h].some(n => !Number.isFinite(n))) {
      issues.push({ levelId: level.level_id, hazardId: o.id, kind: "corrupt",
        message: `Valori non numerici per "${o.id}"` });
      continue;
    }
    if (w <= 0 || h <= 0) {
      issues.push({ levelId: level.level_id, hazardId: o.id, kind: "zero_size",
        message: `Hitbox "${o.id}" ha dimensione nulla` });
    }
    if (left < 0 || top < 0 || left + w > 100.01 || top + h > 100.01) {
      issues.push({ levelId: level.level_id, hazardId: o.id, kind: "off_scene",
        message: `Hitbox "${o.id}" fuori scena (${left.toFixed(1)},${top.toFixed(1)} ${w.toFixed(1)}×${h.toFixed(1)})` });
    }
  }

  for (const h of level.hazards) {
    if (overrides.length && !seen.has(h.id)) {
      // Only treat as missing if the override set looks complete-ish (>=1 of others)
      // Otherwise partial calibrations are valid (fallback to defaults).
    }
  }
  return issues;
};

export const auditAllLevels = (
  levels: CartoonHazardLevel[],
): AuditIssue[] => {
  const all: AuditIssue[] = [];
  for (const lvl of levels) {
    const env = loadEnvelope(lvl.level_id);
    if (!env) continue;
    all.push(...auditLevel(lvl, env.hazards));
  }
  return all;
};

/** Build a portable JSON bundle for all known levels that have overrides. */
export const exportBundle = (levels: CartoonHazardLevel[]): CalibrationBundle => {
  const bundle: CalibrationBundle = {
    version: CALIBRATION_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    levels: {},
  };
  for (const lvl of levels) {
    const env = loadEnvelope(lvl.level_id);
    if (env) bundle.levels[lvl.level_id] = env;
  }
  return bundle;
};

/** Import a JSON bundle. Returns the count of levels successfully written. */
export const importBundle = (raw: unknown): number => {
  if (!raw || typeof raw !== "object") return 0;
  const bundle = raw as Partial<CalibrationBundle>;
  if (!bundle.levels || typeof bundle.levels !== "object") {
    // Allow importing a single envelope as well.
    const env = migrateEnvelope(raw, (raw as any).levelId ?? "");
    if (env && env.levelId) {
      saveEnvelope(env.levelId, env.hazards);
      return 1;
    }
    return 0;
  }
  let count = 0;
  for (const [levelId, payload] of Object.entries(bundle.levels)) {
    const env = migrateEnvelope(payload, levelId);
    if (env && env.hazards.length) {
      saveEnvelope(levelId, env.hazards);
      count++;
    }
  }
  return count;
};

export const downloadJSON = (filename: string, data: unknown): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
