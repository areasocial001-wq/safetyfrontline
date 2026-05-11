/**
 * Centralized fire class metadata for the antincendio simulation.
 *
 * Italian fire classification (DM 10/03/1998 + ISO 3941):
 *   A — Materiali solidi (legno, carta, tessuti, plastica)
 *   B — Liquidi infiammabili (benzina, oli, solventi)
 *   C — Gas infiammabili (metano, GPL, idrogeno)
 *   D — Metalli combustibili (sodio, magnesio, alluminio in polvere)
 *   E — Apparecchiature elettriche sotto tensione (convenzionale, non standard ISO)
 *   F — Oli e grassi vegetali/animali da cottura
 *
 * The 3 visual fires in `addLaboratoryProps` are mapped here by index:
 *   index 0 = orange   → Class A (solidi)
 *   index 1 = dark red → Class E (elettrico - rosso scuro tipico delle braci)
 *   index 2 = white    → Class D (metalli - fiamma bianco-incandescente)
 */

export type FireClassKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface FireClassInfo {
  key: FireClassKey;
  label: string;          // Short label e.g. "Classe A"
  fullLabel: string;      // Long descriptive label
  examples: string;       // Real-world examples
  hint: string;           // Memory hint for the micro-challenge
  /** HSL color used by HUD chips, glows, etc. — must match visual flame */
  colorHsl: string;
  /** Tailwind className helpers for chip background */
  chipBg: string;
  chipText: string;
  ringClass: string;
  /** Recommended extinguishers (matches keys in extinguisher-system) */
  recommended: string[];
  /** Extinguishers to AVOID (dangerous combinations) */
  avoid: string[];
}

export const FIRE_CLASS_INFO: Record<FireClassKey, FireClassInfo> = {
  A: {
    key: 'A',
    label: 'Classe A',
    fullLabel: 'Materiali solidi combustibili',
    examples: 'Legno, carta, cartone, tessuti, plastica',
    hint: 'Estintori ad acqua o polvere — raffreddare la brace.',
    colorHsl: '24 95% 53%',
    chipBg: 'bg-orange-500',
    chipText: 'text-white',
    ringClass: 'ring-orange-500/60',
    recommended: ['water', 'foam', 'powder'],
    avoid: [],
  },
  B: {
    key: 'B',
    label: 'Classe B',
    fullLabel: 'Liquidi infiammabili',
    examples: 'Benzina, oli, solventi, alcoli',
    hint: 'Schiuma o polvere — mai acqua a getto pieno.',
    colorHsl: '210 90% 55%',
    chipBg: 'bg-blue-500',
    chipText: 'text-white',
    ringClass: 'ring-blue-500/60',
    recommended: ['foam', 'powder', 'co2'],
    avoid: ['water'],
  },
  C: {
    key: 'C',
    label: 'Classe C',
    fullLabel: 'Gas infiammabili',
    examples: 'Metano, GPL, idrogeno, acetilene',
    hint: 'Polvere e chiusura della valvola — evita acqua e schiuma.',
    colorHsl: '48 96% 53%',
    chipBg: 'bg-yellow-500',
    chipText: 'text-black',
    ringClass: 'ring-yellow-500/60',
    recommended: ['powder'],
    avoid: ['water', 'foam'],
  },
  D: {
    key: 'D',
    label: 'Classe D',
    fullLabel: 'Metalli combustibili',
    examples: 'Sodio, magnesio, alluminio in polvere, litio',
    hint: 'SOLO polveri speciali D — acqua e CO₂ esplodono!',
    colorHsl: '0 0% 100%',
    chipBg: 'bg-zinc-100 border border-zinc-300',
    chipText: 'text-zinc-900',
    ringClass: 'ring-zinc-300/80',
    recommended: ['powder'],
    avoid: ['water', 'co2', 'foam'],
  },
  E: {
    key: 'E',
    label: 'Classe E',
    fullLabel: 'Apparecchiature elettriche in tensione',
    examples: 'Quadri elettrici, server, motori, cabine MT',
    hint: 'CO₂ o polvere — MAI acqua o schiuma su parti in tensione.',
    colorHsl: '0 75% 35%',
    chipBg: 'bg-red-700',
    chipText: 'text-white',
    ringClass: 'ring-red-700/60',
    recommended: ['co2', 'powder'],
    avoid: ['water', 'foam'],
  },
  F: {
    key: 'F',
    label: 'Classe F',
    fullLabel: 'Oli e grassi da cottura',
    examples: 'Frittura, oli vegetali/animali in cucina',
    hint: 'Coperta antifiamma o estintore F — mai acqua.',
    colorHsl: '14 80% 45%',
    chipBg: 'bg-amber-700',
    chipText: 'text-white',
    ringClass: 'ring-amber-700/60',
    recommended: ['powder'],
    avoid: ['water'],
  },
};

/**
 * Maps the 3 lab fire emitter indexes (0,1,2) to their fire class.
 * Must stay in sync with the visual fires created in addLaboratoryProps.
 */
export const LAB_FIRE_INDEX_TO_CLASS: Record<number, FireClassKey> = {
  0: 'A', // orange flame
  1: 'E', // dark red — electrical
  2: 'D', // white-hot — metal
};

export const getLabFireClass = (index: number | null | undefined): FireClassInfo | null => {
  if (index === null || index === undefined) return null;
  const key = LAB_FIRE_INDEX_TO_CLASS[index];
  return key ? FIRE_CLASS_INFO[key] : null;
};
