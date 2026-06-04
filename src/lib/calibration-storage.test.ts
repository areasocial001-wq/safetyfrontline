import { describe, it, expect, beforeEach } from "vitest";
import {
  calibKey,
  loadEnvelope,
  saveEnvelope,
  migrateEnvelope,
  auditLevel,
  exportBundle,
  importBundle,
  CALIBRATION_SCHEMA_VERSION,
  type HazardOverride,
} from "./calibration-storage";
import { CARTOON_CONSTRUCTION, CARTOON_LEVELS } from "@/data/cartoon-hazard-levels";

const validOverride: HazardOverride = {
  id: "cc_harness",
  position: { top: "10%", left: "10%" },
  hitbox_size: { width: "20%", height: "20%" },
};

describe("calibration-storage", () => {
  beforeEach(() => { localStorage.clear(); });

  it("migrates legacy bare-array (v0) into the current envelope", () => {
    localStorage.setItem(calibKey("x"), JSON.stringify([validOverride]));
    const env = loadEnvelope("x");
    expect(env).not.toBeNull();
    expect(env!.version).toBe(CALIBRATION_SCHEMA_VERSION);
    expect(env!.hazards).toHaveLength(1);
    // Should have rewritten to the new shape
    const reread = JSON.parse(localStorage.getItem(calibKey("x"))!);
    expect(reread.version).toBe(CALIBRATION_SCHEMA_VERSION);
  });

  it("migrateEnvelope returns null on unusable payloads", () => {
    expect(migrateEnvelope(null, "x")).toBeNull();
    expect(migrateEnvelope({ hazards: [] }, "x")).toBeNull();
    expect(migrateEnvelope({ hazards: [{ id: 1 }] }, "x")).toBeNull();
  });

  it("save/load round-trip preserves data", () => {
    saveEnvelope("foo", [validOverride]);
    const env = loadEnvelope("foo");
    expect(env?.hazards[0].id).toBe("cc_harness");
    expect(env?.levelId).toBe("foo");
  });

  it("auditLevel flags off-scene and corrupt overrides", () => {
    const offScene: HazardOverride = {
      id: "cc_harness",
      position: { top: "90%", left: "90%" },
      hitbox_size: { width: "50%", height: "50%" },
    };
    const corrupt: HazardOverride = {
      id: "cc_load",
      position: { top: "abc", left: "10%" },
      hitbox_size: { width: "20%", height: "20%" },
    };
    const unknown: HazardOverride = {
      ...validOverride, id: "does_not_exist",
    };
    const issues = auditLevel(CARTOON_CONSTRUCTION, [offScene, corrupt, unknown, validOverride]);
    const kinds = issues.map(i => i.kind).sort();
    expect(kinds).toContain("off_scene");
    expect(kinds).toContain("corrupt");
    expect(kinds).toContain("unknown_id");
    // valid override must NOT appear
    expect(issues.find(i => i.hazardId === "cc_harness" && i.kind === "corrupt")).toBeUndefined();
  });

  it("export then import restores all overrides", () => {
    saveEnvelope(CARTOON_CONSTRUCTION.level_id, [validOverride]);
    const bundle = exportBundle(Object.values(CARTOON_LEVELS));
    expect(bundle.levels[CARTOON_CONSTRUCTION.level_id]).toBeDefined();

    localStorage.clear();
    const count = importBundle(bundle);
    expect(count).toBe(1);
    const env = loadEnvelope(CARTOON_CONSTRUCTION.level_id);
    expect(env?.hazards[0].id).toBe("cc_harness");
  });
});
