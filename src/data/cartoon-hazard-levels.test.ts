import { describe, it, expect } from "vitest";
import { CARTOON_LEVELS } from "./cartoon-hazard-levels";

describe("cartoon hazard levels integrity", () => {
  for (const [id, level] of Object.entries(CARTOON_LEVELS)) {
    describe(id, () => {
      it("declared total_hazards matches the hazard array length", () => {
        expect(level.hazards.length).toBe(level.total_hazards);
      });

      it("every hazard has a unique id", () => {
        const ids = level.hazards.map(h => h.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("every hitbox stays within the 0–100% scene bounds", () => {
        for (const h of level.hazards) {
          const left = parseFloat(h.position.left);
          const top = parseFloat(h.position.top);
          const w = parseFloat(h.hitbox_size.width);
          const hgt = parseFloat(h.hitbox_size.height);
          expect(left).toBeGreaterThanOrEqual(0);
          expect(top).toBeGreaterThanOrEqual(0);
          expect(left + w).toBeLessThanOrEqual(100.01);
          expect(top + hgt).toBeLessThanOrEqual(100.01);
        }
      });
    });
  }

  it("Cantiere has exactly 7 hazards", () => {
    expect(CARTOON_LEVELS.cartoon_construction.hazards).toHaveLength(7);
  });
});
