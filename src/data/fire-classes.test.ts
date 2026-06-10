import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FIRE_CLASS_INFO, LAB_FIRE_INDEX_TO_CLASS, getLabFireClass } from './fire-classes';

const read = (p: string) => readFileSync(resolve(__dirname, '..', '..', p), 'utf8');

describe('Fire class labels (C gas, D metalli, E batterie, F cucina)', () => {
  it('FIRE_CLASS_INFO defines all six classes A–F', () => {
    expect(Object.keys(FIRE_CLASS_INFO).sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('Class C is Gas infiammabili', () => {
    expect(FIRE_CLASS_INFO.C.fullLabel.toLowerCase()).toMatch(/gas/);
    expect(FIRE_CLASS_INFO.C.examples.toLowerCase()).toMatch(/metano|gpl|idrogeno|acetilene/);
  });

  it('Class D is Metalli combustibili', () => {
    expect(FIRE_CLASS_INFO.D.fullLabel.toLowerCase()).toMatch(/metalli/);
    expect(FIRE_CLASS_INFO.D.avoid).toContain('water');
  });

  it('Class E is Batterie al litio (not "elettrico")', () => {
    expect(FIRE_CLASS_INFO.E.fullLabel.toLowerCase()).toMatch(/batterie|litio/);
    expect(FIRE_CLASS_INFO.E.fullLabel.toLowerCase()).not.toMatch(/elettric/);
  });

  it('Class F is Oli/grassi da cottura', () => {
    expect(FIRE_CLASS_INFO.F.fullLabel.toLowerCase()).toMatch(/oli|grassi|cottura/);
    expect(FIRE_CLASS_INFO.F.avoid).toContain('water');
  });
});

describe('Lab fire emitter → class mapping', () => {
  it('maps index 0→A, 1→E, 2→D', () => {
    expect(LAB_FIRE_INDEX_TO_CLASS[0]).toBe('A');
    expect(LAB_FIRE_INDEX_TO_CLASS[1]).toBe('E');
    expect(LAB_FIRE_INDEX_TO_CLASS[2]).toBe('D');
  });

  it('getLabFireClass returns the new "Batterie al litio" for emitter index 1', () => {
    const info = getLabFireClass(1);
    expect(info).not.toBeNull();
    expect(info!.fullLabel.toLowerCase()).toMatch(/batterie|litio/);
  });

  it('getLabFireClass returns null for unmapped or null input', () => {
    expect(getLabFireClass(null)).toBeNull();
    expect(getLabFireClass(99)).toBeNull();
  });
});

describe('FireClassTutorial source consistency', () => {
  const src = read('src/components/demo3d/FireClassTutorial.tsx');

  it('Classe C tile uses the Gas label, not Elettrico', () => {
    expect(src).toMatch(/Classe C \(Gas\)/);
    expect(src).not.toMatch(/Classe C \(Elettrico\)/);
  });

  it('Classe C examples include gas-related items', () => {
    expect(src.toLowerCase()).toMatch(/gpl|metano|acetilene/);
  });
});

describe('FireClassQuiz source consistency', () => {
  const src = read('src/components/demo3d/FireClassQuiz.tsx');

  it('Quiz options label Classe C as Gas, never Elettrico', () => {
    expect(src).toMatch(/Classe C — Gas/);
    expect(src).not.toMatch(/Classe C — Elettrico/);
  });
});

describe('FireClassHUD source consistency', () => {
  const src = read('src/components/demo3d/FireClassHUD.tsx');

  it('HUD reads label from FIRE_CLASS_INFO (single source of truth)', () => {
    expect(src).toMatch(/FIRE_CLASS_INFO/);
    expect(src).toMatch(/getLabFireClass/);
    // The HUD must NOT hardcode the obsolete electrical label.
    expect(src).not.toMatch(/[Ee]lettric/);
  });
});

describe('Antincendio (laboratory) scene avatars', () => {
  const src = read('src/components/demo3d/scene-modules/worker-avatars.ts');

  it('Laboratory NPC roles do not include "Medico"', () => {
    // Extract the laboratory branch block.
    const labBlock = src.match(/type === 'laboratory'[\s\S]*?type === 'office'/);
    expect(labBlock).not.toBeNull();
    expect(labBlock![0]).not.toMatch(/'Medico'/);
    expect(labBlock![0]).toMatch(/Addetto Antincendio/);
  });

  it('Laboratory voice lines reference new C-F class labels', () => {
    const voiceBlock = src.match(/laboratory:\s*\[[\s\S]*?\],/);
    expect(voiceBlock).not.toBeNull();
    const block = voiceBlock![0];
    expect(block).toMatch(/Classe C: gas/i);
    expect(block).toMatch(/Classe D: metalli/i);
    expect(block).toMatch(/Classe E: batterie/i);
    expect(block).toMatch(/Classe F: oli/i);
  });
});

describe('Reading-timer residues across the platform', () => {
  const files = [
    'src/pages/TrainingModule.tsx',
    'src/components/training/SpotTheHazardGame.tsx',
    'src/components/training/PointAndClickLevel.tsx',
  ];

  for (const f of files) {
    it(`${f} has no QUESTION_READ_SECONDS / questionTimeLeft / isReadingPaused`, () => {
      const src = read(f);
      expect(src).not.toMatch(/QUESTION_READ_SECONDS/);
      expect(src).not.toMatch(/questionTimeLeft/);
      expect(src).not.toMatch(/isReadingPaused/);
      expect(src).not.toMatch(/FastForward/);
    });
  }
});
