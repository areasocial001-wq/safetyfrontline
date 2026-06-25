import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CheckCircle2, RotateCcw, ShieldCheck, AlertTriangle, Trophy, Info, Sun, Snowflake,
  PlayCircle, PauseCircle, FileDown, FileSpreadsheet,
} from 'lucide-react';
import dpiAvatarHuman from '@/assets/dpi-avatar-human.png';
import { useDpiPreferences } from '@/lib/dpi-preferences';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/hooks/useAuth';
import { exportDpiReportCsv, exportDpiReportPdf, downloadBlob, type DPIReportData } from '@/lib/dpi-report';

// ============================================================
// Tipi
// ============================================================
export type DPIKey =
  | 'tuta'
  | 'scarpe'
  | 'gilet'
  | 'guanti'
  | 'occhiali'
  | 'cuffie'
  | 'casco'
  | 'imbracatura'
  | 'cordino'
  | 'maschera';

export type DPISeason = 'estivo' | 'invernale';
export type HiVisColor = 'arancio' | 'giallo' | 'lime';

interface DPIItem {
  key: DPIKey;
  label: string;
  hint: string;
  /** Descrizione estesa in stile cartoon/divulgativo per legenda e tooltip */
  description: string;
  /** Riferimento normativo sintetico */
  normativa?: string;
}

interface DPIScenarioDef {
  id: string;
  title: string;
  intro: string;
  sequence: DPIKey[];
  distractors?: DPIKey[];
}

const ALL_ITEMS: Record<DPIKey, DPIItem> = {
  tuta:        { key: 'tuta',        label: 'Tuta da lavoro',           hint: 'Indossa per prima la tuta o salopette.',
    description: 'Indumento base che protegge la pelle da abrasioni, sporco e schizzi leggeri.', normativa: 'EN ISO 13688' },
  scarpe:      { key: 'scarpe',      label: 'Scarpe antinfortunistiche', hint: 'Calzature S3 con puntale e suola antiperforazione.',
    description: 'Calzature S3 con puntale in acciaio/composito e suola antiperforazione e antiscivolo.', normativa: 'EN ISO 20345 S3' },
  gilet:       { key: 'gilet',       label: 'Gilet alta visibilità',     hint: 'Indispensabile in cantiere e su strada.',
    description: 'Capo ad alta visibilità con bande rifrangenti per essere visti da mezzi e colleghi.', normativa: 'EN ISO 20471' },
  guanti:      { key: 'guanti',      label: 'Guanti da lavoro',          hint: 'Proteggono da tagli e abrasioni.',
    description: 'Proteggono le mani da tagli, abrasioni e rischi meccanici. Scegli la categoria corretta.', normativa: 'EN 388' },
  occhiali:    { key: 'occhiali',    label: 'Occhiali di protezione',    hint: 'Contro schegge, polveri e schizzi.',
    description: 'Schermo trasparente contro schegge, polveri e schizzi chimici. Da indossare prima del casco.', normativa: 'EN 166' },
  cuffie:      { key: 'cuffie',      label: 'Cuffie antirumore',         hint: 'Obbligatorie sopra 85 dB(A).',
    description: 'Riducono il rumore: obbligatorie oltre 85 dB(A). Verifica la classe SNR adatta.', normativa: 'EN 352-1' },
  casco:       { key: 'casco',       label: 'Casco protettivo',          hint: 'Sempre per ultimo, dopo cuffie e occhiali.',
    description: 'Protegge il capo da urti e caduta di oggetti dall\'alto. Sempre l\'ultimo a essere indossato.', normativa: 'EN 397' },
  imbracatura: { key: 'imbracatura', label: 'Imbracatura anticaduta',    hint: 'DPI di III categoria per lavori in quota.',
    description: 'DPI di III categoria: trattiene il corpo in caso di caduta dall\'alto. Va indossata e regolata correttamente.', normativa: 'EN 361' },
  cordino:     { key: 'cordino',     label: 'Cordino con dissipatore',   hint: 'Da agganciare alla linea vita.',
    description: 'Collega l\'imbracatura al punto di ancoraggio; il dissipatore assorbe l\'energia della caduta.', normativa: 'EN 355' },
  maschera:    { key: 'maschera',    label: 'Maschera/Respiratore',      hint: 'Per polveri, fumi o vapori.',
    description: 'Protegge le vie respiratorie da polveri, fumi e vapori. Verifica il filtro idoneo (P2/P3, A, B…).', normativa: 'EN 149 / EN 140' },
};

export const DPI_SCENARIOS: Record<string, DPIScenarioDef> = {
  cantiere: {
    id: 'cantiere',
    title: 'Vestizione DPI — Cantiere edile',
    intro: 'Indossa i DPI nell\'ordine corretto: dal capo più interno (tuta) all\'ultimo (casco).',
    sequence: ['tuta', 'scarpe', 'gilet', 'guanti', 'occhiali', 'cuffie', 'casco'],
    distractors: ['maschera'],
  },
  quota: {
    id: 'quota',
    title: 'Vestizione DPI — Lavori in quota',
    intro: 'Sequenza corretta per lavorare in altezza con sistema anticaduta.',
    sequence: ['tuta', 'scarpe', 'imbracatura', 'cordino', 'guanti', 'casco'],
    distractors: ['cuffie'],
  },
  officina: {
    id: 'officina',
    title: 'Vestizione DPI — Officina meccanica',
    intro: 'DPI per saldatura e lavorazioni meccaniche.',
    sequence: ['tuta', 'scarpe', 'guanti', 'maschera', 'occhiali', 'cuffie'],
    distractors: ['gilet'],
  },
};

// ============================================================
// Design tokens cartoon condivisi (riutilizzabili in altri moduli)
// Esportati per uniformare DPI in tutta la piattaforma.
// ============================================================
export const DPI_TOKENS = {
  yellow: '#F2B233',
  yellowDark: '#C8861E',
  navy: '#2B3A5C',
  navyDark: '#1A2440',
  hivisOrange: '#F26A1F',
  hivisOrangeDark: '#B84A0F',
  hivisYellow: '#EEE53A',
  hivisYellowDark: '#B0A920',
  hivisLime: '#C6F23A',
  hivisLimeDark: '#7AA31E',
  reflect: '#E8EEF2',
  dark: '#0F1722',
  fabricSummer: '#E9D9B6',   // tessuto leggero estivo (canvas chiaro)
  fabricWinter: '#3A4A6E',   // tessuto pesante invernale (più scuro/saturato)
  fabricWinterAccent: '#D24B3A', // dettaglio rosso invernale
} as const;

const STROKE = 2.5;
const STROKE_BIG = 5;

function hivisColor(c: HiVisColor) {
  if (c === 'arancio') return { base: DPI_TOKENS.hivisOrange, dark: DPI_TOKENS.hivisOrangeDark };
  if (c === 'giallo') return { base: DPI_TOKENS.hivisYellow, dark: DPI_TOKENS.hivisYellowDark };
  return { base: DPI_TOKENS.hivisLime, dark: DPI_TOKENS.hivisLimeDark };
}

interface CartoonProps { children: React.ReactNode; big?: boolean }
export function Cartoon({ children, big = false }: CartoonProps) {
  return (
    <g
      stroke={DPI_TOKENS.dark}
      strokeWidth={big ? STROKE_BIG : STROKE}
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    >
      {children}
    </g>
  );
}

interface DpiIconProps {
  k: DPIKey;
  size?: number;
  dimmed?: boolean;
  season?: DPISeason;
  hivis?: HiVisColor;
}

/**
 * Icona DPI cartoon, esportata per riuso in altri moduli (quiz, checklist, badge).
 * Usa la stessa palette e lo stesso outline del mini-gioco.
 */
export function DpiIcon({ k, size = 56, dimmed = false, season = 'estivo', hivis = 'arancio' }: DpiIconProps) {
  const op = dimmed ? 0.3 : 1;
  const common = { width: size, height: size, viewBox: '0 0 64 64', style: { opacity: op } } as const;
  const T = DPI_TOKENS;
  const hv = hivisColor(hivis);
  const fabric = season === 'invernale' ? T.fabricWinter : T.navy;
  const fabricAccent = season === 'invernale' ? T.fabricWinterAccent : T.yellow;

  switch (k) {
    case 'casco':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* calotta */}
            <path d="M8 42 Q12 10 32 8 Q52 10 56 42 Z" fill={T.yellow} />
            {/* shading */}
            <path d="M10 42 Q14 14 32 12 Q34 12 36 12 L36 42 Z" fill={T.yellowDark} opacity=".35" stroke="none" />
            {/* highlight */}
            <path d="M16 22 Q22 14 30 13" stroke="#FFF6D6" strokeWidth="2.5" opacity=".9" fill="none" />
            {/* cresta */}
            <path d="M32 8 L32 42" stroke={T.yellowDark} strokeWidth="2" opacity=".55" />
            {/* visiera */}
            <path d="M4 42 Q32 50 60 42 L58 48 Q32 54 6 48 Z" fill={T.yellowDark} />
            {/* sottogola */}
            <rect x="6" y="46" width="52" height="5" rx="2" fill={T.navy} />
            {season === 'invernale' && (
              <path d="M6 51 L58 51 L55 60 L11 60 Z" fill={T.fabricWinter} />
            )}
          </Cartoon>
        </svg>
      );
    case 'occhiali':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* ponte */}
            <path d="M28 32 Q32 28 36 32" />
            {/* lenti */}
            <path d="M6 28 Q6 22 12 22 L26 22 Q30 22 30 28 L30 36 Q30 40 26 40 L12 40 Q6 40 6 36 Z" fill="#9FE3FF" />
            <path d="M34 28 Q34 22 38 22 L52 22 Q58 22 58 28 L58 36 Q58 40 52 40 L38 40 Q34 40 34 36 Z" fill="#9FE3FF" />
            {/* riflessi */}
            <path d="M10 26 Q14 24 18 26" stroke="#fff" strokeWidth="2" opacity=".95" />
            <path d="M38 26 Q42 24 46 26" stroke="#fff" strokeWidth="2" opacity=".95" />
            {/* stanghette */}
            <path d="M6 30 L2 32 M58 30 L62 32" />
          </Cartoon>
        </svg>
      );
    case 'cuffie':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* archetto */}
            <path d="M12 38 Q32 4 52 38" strokeWidth="3" />
            {/* coppe */}
            <path d="M6 34 Q4 34 4 38 L4 54 Q4 58 8 58 L16 58 Q20 58 20 54 L20 38 Q20 34 16 34 Z" fill={T.navy} />
            <path d="M48 34 Q44 34 44 38 L44 54 Q44 58 48 58 L56 58 Q60 58 60 54 L60 38 Q60 34 56 34 Z" fill={T.navy} />
            {/* pad gialli */}
            <rect x="6" y="40" width="12" height="14" rx="3" fill={T.yellow} />
            <rect x="46" y="40" width="12" height="14" rx="3" fill={T.yellow} />
            {/* highlight */}
            <path d="M14 40 Q16 36 18 36" stroke="#FFF6D6" strokeWidth="1.5" opacity=".9" />
          </Cartoon>
        </svg>
      );
    case 'maschera':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* corpo */}
            <path d="M14 22 Q32 14 50 22 L52 42 Q48 50 32 52 Q16 50 12 42 Z" fill={T.navy} />
            {/* filtri */}
            <circle cx="22" cy="36" r="7" fill={T.yellow} />
            <circle cx="42" cy="36" r="7" fill={T.yellow} />
            <circle cx="22" cy="36" r="3" fill={T.yellowDark} stroke="none" />
            <circle cx="42" cy="36" r="3" fill={T.yellowDark} stroke="none" />
            {/* cinturini */}
            <path d="M14 24 Q4 20 4 30 M50 24 Q60 20 60 30" />
            {/* valvola centrale */}
            <ellipse cx="32" cy="44" rx="5" ry="3" fill={T.navyDark} />
          </Cartoon>
        </svg>
      );
    case 'guanti':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* mano sinistra cartoon (palmo + 4 dita arrotondate + pollice) */}
            <path d="M14 56 L14 28 Q14 22 18 22 Q22 22 22 28 L22 32 Q23 18 28 18 Q33 18 33 30 Q34 14 38 14 Q43 14 43 28 Q44 22 48 22 Q52 22 52 28 L52 34 Q52 24 56 24 Q60 24 60 32 L60 56 Z"
              fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
            {/* polsino */}
            <rect x="14" y="48" width="46" height="8" fill={season === 'invernale' ? T.navy : T.yellowDark} />
            {/* cuciture */}
            <path d="M22 32 L22 48 M33 30 L33 48 M43 30 L43 48 M52 34 L52 48" stroke={T.yellowDark} strokeWidth="1.2" opacity=".7" />
          </Cartoon>
        </svg>
      );
    case 'gilet':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* corpo */}
            <path d="M10 14 L24 12 L32 22 L40 12 L54 14 L54 56 Q54 58 52 58 L12 58 Q10 58 10 56 Z" fill={hv.base} />
            {/* zip */}
            <path d="M32 22 L32 58" stroke={T.dark} strokeWidth="1.5" />
            {/* bande rifrangenti */}
            <rect x="11" y="28" width="42" height="5" fill={T.reflect} />
            <rect x="11" y="34" width="42" height="2" fill={T.dark} opacity=".4" />
            <rect x="11" y="44" width="42" height="5" fill={T.reflect} />
            <rect x="11" y="50" width="42" height="2" fill={T.dark} opacity=".4" />
            {season === 'invernale' && (
              <path d="M10 14 L24 12 L32 22 L40 12 L54 14 L54 22 L10 22 Z" fill={hv.dark} opacity=".55" stroke="none" />
            )}
          </Cartoon>
        </svg>
      );
    case 'tuta':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* corpo + braccia + gambe */}
            <path d="M22 10 L42 10 L50 16 L52 28 L48 32 L46 22 L46 56 L36 56 L34 36 L30 36 L28 56 L18 56 L18 22 L16 32 L12 28 L14 16 Z" fill={fabric} />
            {/* zip */}
            <path d="M32 14 L32 36" stroke={T.dark} strokeWidth="1.5" />
            {/* tasca pettorale */}
            <rect x="34" y="18" width="10" height="8" rx="1.5" fill={fabricAccent} />
            {/* cintura */}
            <rect x="18" y="34" width="28" height="3" fill={T.dark} opacity=".5" stroke="none" />
            {season === 'estivo' && (
              <path d="M19 22 L17 18 M45 22 L47 18" stroke={T.fabricSummer} strokeWidth="2" opacity=".9" />
            )}
          </Cartoon>
        </svg>
      );
    case 'scarpe':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* tomaia */}
            <path d="M6 44 L6 32 Q6 28 12 28 L24 28 L30 24 L42 24 Q56 24 58 38 L58 44 Z" fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
            {/* punta rinforzata acciaio */}
            <path d="M40 24 Q56 24 58 38 L58 44 L40 44 Z" fill="#C9D2DA" stroke={T.dark} strokeWidth="1.5" />
            {/* lacci */}
            <path d="M14 32 L24 32 M14 36 L24 36 M14 40 L24 40" stroke={T.dark} strokeWidth="1.2" />
            {/* suola */}
            <path d="M4 44 L60 44 L58 52 Q56 54 52 54 L10 54 Q6 54 4 50 Z" fill={T.navyDark} />
            {/* tasselli */}
            <path d="M10 50 L14 50 M20 50 L24 50 M30 50 L34 50 M40 50 L44 50 M50 50 L54 50" stroke="#fff" strokeWidth="1.2" opacity=".7" />
          </Cartoon>
        </svg>
      );
    case 'imbracatura':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* spalline a X */}
            <path d="M20 8 L44 36 M44 8 L20 36" stroke={T.dark} strokeWidth="6" />
            <path d="M20 8 L44 36 M44 8 L20 36" stroke={T.yellow} strokeWidth="4" />
            {/* cintura */}
            <rect x="10" y="34" width="44" height="8" rx="2" fill={T.yellow} stroke={T.dark} />
            {/* fibbia D-ring */}
            <circle cx="32" cy="38" r="5" fill={T.navy} />
            <circle cx="32" cy="38" r="2" fill={T.yellow} stroke="none" />
            {/* cosciali */}
            <path d="M16 42 Q14 50 22 56 M48 42 Q50 50 42 56" />
          </Cartoon>
        </svg>
      );
    case 'cordino':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            {/* fune con anima nera + sopra colore */}
            <path d="M10 12 Q32 40 54 12" stroke={T.dark} strokeWidth="5" />
            <path d="M10 12 Q32 40 54 12" stroke={T.yellow} strokeWidth="3" />
            {/* moschettone */}
            <path d="M48 4 Q60 4 60 14 L60 22 Q60 26 56 26 L52 26 Q48 26 48 22 Z" fill={T.navy} />
            <circle cx="54" cy="14" r="2.5" fill={T.yellow} stroke="none" />
            {/* assorbitore (sacchetto) */}
            <rect x="24" y="36" width="16" height="20" rx="3" fill={T.yellow} />
            <path d="M24 42 L40 42" stroke={T.yellowDark} strokeWidth="1.5" />
          </Cartoon>
        </svg>
      );
  }
}

// ============================================================
// Avatar — sovrapposizioni DPI con z-order coerente
// L'ordine di rendering rispetta la sequenza anatomica corretta
// (tuta sotto, casco sopra) indipendentemente dall'ordine d'uso.
// ============================================================
const LAYER_ORDER: DPIKey[] = [
  'tuta', 'scarpe', 'gilet', 'imbracatura', 'cordino',
  'guanti', 'maschera', 'occhiali', 'cuffie', 'casco',
];

// Anatomia: posizione approssimativa per evidenziare l'area del DPI atteso
const ANATOMY: Record<DPIKey, { cx: number; cy: number; r: number; label: string }> = {
  casco:       { cx: 384, cy: 80,  r: 130, label: 'testa' },
  cuffie:      { cx: 384, cy: 130, r: 150, label: 'orecchie' },
  occhiali:    { cx: 384, cy: 160, r: 115, label: 'occhi' },
  maschera:    { cx: 384, cy: 210, r: 105, label: 'volto / vie respiratorie' },
  gilet:       { cx: 384, cy: 420, r: 175, label: 'torso (alta visibilità)' },
  imbracatura: { cx: 384, cy: 400, r: 190, label: 'busto e bacino' },
  cordino:     { cx: 540, cy: 330, r: 110, label: 'aggancio dorsale / linea vita' },
  guanti:      { cx: 384, cy: 555, r: 250, label: 'mani' },
  tuta:        { cx: 384, cy: 620, r: 220, label: 'corpo (capo base)' },
  scarpe:      { cx: 384, cy: 950, r: 170, label: 'piedi' },
};

function Avatar({ worn, season, hivis, highlight }: { worn: Set<DPIKey>; season: DPISeason; hivis: HiVisColor; highlight?: { key: DPIKey; kind: 'ok' | 'ko' } | null }) {
  const T = DPI_TOKENS;
  const hv = hivisColor(hivis);
  const tutaFill = season === 'invernale' ? T.fabricWinter : T.navy;
  const tutaAccent = season === 'invernale' ? T.fabricWinterAccent : T.yellow;
  const glovesFill = season === 'invernale' ? T.fabricWinter : T.yellow;

  const layers: Record<DPIKey, React.ReactNode> = {
    tuta: (
      <Cartoon big>
        {/* corpo + maniche + gambe arrotondate */}
        <path
          d="M250 250 Q260 240 300 235 L330 250 Q384 262 438 250 L468 235 Q508 240 518 250
             L530 360 Q524 380 506 376 L500 360 L505 600 L495 980 L420 980 L400 700 L368 700 L348 980 L273 980 L263 600 L268 360 L262 376 Q244 380 238 360 Z"
          fill={tutaFill}
        />
        {/* zip */}
        <path d="M384 260 L384 470" stroke={T.dark} strokeWidth="4" />
        {/* tasca pettorale */}
        <rect x="396" y="310" width="56" height="64" rx="6" fill={tutaAccent} />
        <path d="M396 320 L452 320" stroke={T.dark} strokeWidth="3" opacity=".6" />
        {/* cintura */}
        <rect x="268" y="468" width="232" height="14" rx="3" fill={T.dark} opacity=".55" stroke="none" />
        {/* cuciture gambe */}
        <path d="M340 500 L340 970 M428 500 L428 970" stroke={T.dark} strokeWidth="2" opacity=".4" />
        {season === 'estivo' && (
          <path d="M275 270 L268 320 M493 270 L500 320" stroke={T.fabricSummer} strokeWidth="6" opacity=".85" />
        )}
      </Cartoon>
    ),
    scarpe: (
      <Cartoon big>
        {/* tomaia sx */}
        <path d="M255 920 L255 950 Q255 985 295 985 L375 985 L405 960 L405 940 L378 925 L335 925 Q300 920 295 905 Z" fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
        {/* tomaia dx */}
        <path d="M395 920 L395 950 Q395 985 435 985 L515 985 L515 940 L488 925 L445 925 Q410 920 405 905 Z" fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
        {/* punte rinforzate */}
        <path d="M375 985 L405 960 L405 940 L378 925 Q360 925 360 945 L360 985 Z" fill="#C9D2DA" />
        <path d="M515 985 L515 940 L488 925 Q470 925 470 945 L470 985 Z" fill="#C9D2DA" />
        {/* lacci */}
        <path d="M275 930 L295 930 M275 945 L295 945 M275 960 L295 960" stroke={T.dark} strokeWidth="3" />
        <path d="M415 930 L435 930 M415 945 L435 945 M415 960 L435 960" stroke={T.dark} strokeWidth="3" />
        {/* suola */}
        <path d="M245 980 L530 980 L525 1000 Q520 1006 510 1006 L260 1006 Q252 1006 248 1000 Z" fill={T.navyDark} />
      </Cartoon>
    ),
    gilet: (
      <Cartoon big>
        <path d="M260 270 Q280 258 350 260 L384 290 L418 260 Q488 258 508 270 L512 580 Q508 590 498 590 L270 590 Q260 590 258 580 Z" fill={hv.base} />
        {/* zip */}
        <path d="M384 290 L384 590" stroke={T.dark} strokeWidth="4" />
        {/* bande rifrangenti con bordino scuro */}
        <rect x="270" y="374" width="228" height="22" fill={T.reflect} />
        <rect x="270" y="370" width="228" height="4" fill={T.dark} opacity=".5" />
        <rect x="270" y="396" width="228" height="4" fill={T.dark} opacity=".5" />
        <rect x="270" y="466" width="228" height="22" fill={T.reflect} />
        <rect x="270" y="462" width="228" height="4" fill={T.dark} opacity=".5" />
        <rect x="270" y="488" width="228" height="4" fill={T.dark} opacity=".5" />
        {season === 'invernale' && (
          <path d="M260 270 L350 260 L384 290 L418 260 L508 270 L508 320 L260 320 Z" fill={hv.dark} opacity=".55" stroke="none" />
        )}
      </Cartoon>
    ),
    imbracatura: (
      <Cartoon big>
        {/* spalline a X */}
        <path d="M300 260 L468 480 M468 260 L300 480" stroke={T.dark} strokeWidth="20" />
        <path d="M300 260 L468 480 M468 260 L300 480" stroke={T.yellow} strokeWidth="12" />
        {/* cintura */}
        <rect x="266" y="466" width="236" height="30" rx="5" fill={T.yellow} />
        <path d="M266 478 L502 478" stroke={T.dark} strokeWidth="2" opacity=".5" />
        {/* fibbia D-ring centrale */}
        <circle cx="384" cy="481" r="22" fill={T.navy} />
        <circle cx="384" cy="481" r="8" fill={T.yellow} stroke="none" />
        {/* cosciali */}
        <path d="M315 496 Q300 580 340 620 M453 496 Q468 580 428 620" strokeWidth="14" stroke={T.dark} />
        <path d="M315 496 Q300 580 340 620 M453 496 Q468 580 428 620" strokeWidth="8" stroke={T.yellow} />
      </Cartoon>
    ),
    cordino: (
      <Cartoon big>
        <path d="M384 481 Q560 380 690 200" stroke={T.dark} strokeWidth="20" />
        <path d="M384 481 Q560 380 690 200" stroke={T.yellow} strokeWidth="12" />
        {/* assorbitore di energia */}
        <rect x="495" y="350" width="44" height="70" rx="6" fill={T.yellow} stroke={T.dark} strokeWidth="4" />
        <path d="M499 372 L535 372 M499 388 L535 388 M499 404 L535 404" stroke={T.yellowDark} strokeWidth="3" />
        {/* moschettone */}
        <path d="M660 160 Q706 160 706 210 L706 246 Q706 262 692 262 L678 262 Q664 262 664 246 Z" fill={T.navy} stroke={T.dark} strokeWidth="4" />
        <circle cx="685" cy="200" r="6" fill={T.yellow} stroke="none" />
      </Cartoon>
    ),
    guanti: (
      <Cartoon big>
        {/* sx */}
        <path d="M120 510 Q120 488 140 488 Q160 488 160 510 L160 528 Q165 480 188 480 Q210 482 210 526 Q214 488 232 488 Q250 488 250 528 L250 600 Q250 624 224 624 L150 624 Q120 624 120 600 Z" fill={glovesFill} />
        <rect x="118" y="600" width="134" height="22" fill={season === 'invernale' ? T.navy : T.yellowDark} />
        {/* dx */}
        <path d="M518 510 Q518 488 538 488 Q558 488 558 528 Q562 488 580 480 Q602 482 602 526 Q608 488 626 488 Q646 488 646 510 L646 600 Q646 624 616 624 L548 624 Q518 624 518 600 Z" fill={glovesFill} />
        <rect x="516" y="600" width="132" height="22" fill={season === 'invernale' ? T.navy : T.yellowDark} />
      </Cartoon>
    ),
    maschera: (
      <Cartoon big>
        <path d="M295 175 Q384 158 473 175 L468 240 Q448 268 384 272 Q320 268 300 240 Z" fill={T.navy} />
        {/* filtri */}
        <circle cx="335" cy="222" r="26" fill={T.yellow} />
        <circle cx="433" cy="222" r="26" fill={T.yellow} />
        <circle cx="335" cy="222" r="11" fill={T.yellowDark} stroke="none" />
        <circle cx="433" cy="222" r="11" fill={T.yellowDark} stroke="none" />
        {/* valvola */}
        <ellipse cx="384" cy="252" rx="18" ry="10" fill={T.navyDark} />
        {/* cinturini */}
        <path d="M295 195 Q254 178 248 210 M473 195 Q514 178 520 210" strokeWidth="5" />
      </Cartoon>
    ),
    occhiali: (
      <Cartoon big>
        {/* ponte */}
        <path d="M370 152 Q384 144 398 152" />
        {/* lenti */}
        <path d="M290 144 Q290 130 304 130 L354 130 Q368 130 368 144 L368 178 Q368 192 354 192 L304 192 Q290 192 290 178 Z" fill="#9FE3FF" />
        <path d="M400 144 Q400 130 414 130 L464 130 Q478 130 478 144 L478 178 Q478 192 464 192 L414 192 Q400 192 400 178 Z" fill="#9FE3FF" />
        {/* riflessi */}
        <path d="M300 148 Q314 138 332 140" stroke="#fff" strokeWidth="4" opacity=".95" />
        <path d="M410 148 Q424 138 442 140" stroke="#fff" strokeWidth="4" opacity=".95" />
        {/* stanghette */}
        <path d="M290 158 L268 168 M478 158 L500 168" />
      </Cartoon>
    ),
    cuffie: (
      <Cartoon big>
        <path d="M270 110 Q384 18 498 110" stroke={T.dark} strokeWidth="18" />
        <path d="M270 110 Q384 28 498 110" stroke={T.navy} strokeWidth="10" />
        {/* coppe */}
        <path d="M234 108 Q224 108 224 122 L224 200 Q224 216 240 216 L278 216 Q294 216 294 200 L294 122 Q294 108 284 108 Z" fill={T.navy} />
        <path d="M474 108 Q484 108 484 122 L484 200 Q484 216 500 216 L538 216 Q554 216 554 200 L554 122 Q554 108 544 108 Z" fill={T.navy} />
        {/* pad gialli */}
        <rect x="230" y="130" width="48" height="60" rx="8" fill={T.yellow} />
        <rect x="490" y="130" width="48" height="60" rx="8" fill={T.yellow} />
      </Cartoon>
    ),
    casco: (
      <Cartoon big>
        {/* calotta */}
        <path d="M242 140 Q252 8 384 4 Q516 8 526 140 Z" fill={T.yellow} />
        {/* shading metà */}
        <path d="M384 4 Q516 8 526 140 L384 140 Z" fill={T.yellowDark} opacity=".3" stroke="none" />
        {/* cresta */}
        <path d="M384 8 L384 140" stroke={T.yellowDark} strokeWidth="6" opacity=".55" />
        {/* highlight */}
        <path d="M270 100 Q300 40 360 28" stroke="#FFF6D6" strokeWidth="7" opacity=".9" />
        {/* visiera */}
        <path d="M232 138 Q384 168 536 138 L528 162 Q384 188 240 162 Z" fill={T.yellowDark} />
        {/* sottogola */}
        <rect x="240" y="158" width="288" height="14" rx="3" fill={T.navy} />
      </Cartoon>
    ),
  };

  return (
    <div className="relative w-full max-w-[340px] aspect-[3/4] mx-auto">
      <img
        src={dpiAvatarHuman}
        alt="Avatar da vestire con i DPI"
        loading="lazy"
        width={768}
        height={1024}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />
      <svg
        viewBox="0 0 768 1024"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full pointer-events-none"
        role="img"
        aria-label="Avatar con DPI indossati"
      >
        <ellipse cx="384" cy="990" rx="180" ry="14" fill={T.dark} opacity="0.18" />
        {LAYER_ORDER.map((k) => (worn.has(k) ? <g key={k}>{layers[k]}</g> : null))}
        {highlight && ANATOMY[highlight.key] && (
          <g aria-hidden="true">
            <circle
              cx={ANATOMY[highlight.key].cx}
              cy={ANATOMY[highlight.key].cy}
              r={ANATOMY[highlight.key].r}
              fill="none"
              stroke={highlight.kind === 'ok' ? '#1F7A3A' : '#D24B3A'}
              strokeWidth={10}
              strokeDasharray="14 10"
              opacity={0.85}
            >
              <animate attributeName="r" values={`${ANATOMY[highlight.key].r};${ANATOMY[highlight.key].r + 20};${ANATOMY[highlight.key].r}`} dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;0.35;0.85" dur="1.4s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
}

// ============================================================
// Componente principale
// ============================================================
interface DPIDressingGameProps {
  scenarioId?: keyof typeof DPI_SCENARIOS;
  onComplete?: (score: { correct: number; mistakes: number }) => void;
}

export default function DPIDressingGame({ scenarioId = 'cantiere', onComplete }: DPIDressingGameProps) {
  const scenario = DPI_SCENARIOS[scenarioId];
  const { user } = useAuth();
  const { company } = useCompany();
  const { prefs, update: updatePrefs } = useDpiPreferences(company?.id);

  const [worn, setWorn] = useState<Set<DPIKey>>(new Set());
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [shakeKey, setShakeKey] = useState<DPIKey | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'ko'; text: string; cartoon?: string } | null>(null);
  const [highlight, setHighlight] = useState<{ key: DPIKey; kind: 'ok' | 'ko' } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [guided, setGuided] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const season = prefs.season;
  const hivis = prefs.hivis;
  const setSeason = (s: DPISeason) => updatePrefs({ season: s });
  const setHivis = (c: HiVisColor) => updatePrefs({ hivis: c });

  // Tracciamento per report finale
  const startedAtRef = useRef<number>(Date.now());
  const eventsRef = useRef<DPIReportData['events']>([]);

  const addEvent = (type: 'ok' | 'ko', label: string, note?: string) => {
    const ts = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
    eventsRef.current.push({ tsSeconds: ts, type, label, note });
  };

  const allKeys = useMemo(() => {
    const set = [...scenario.sequence, ...(scenario.distractors || [])];
    return set
      .map((k, i) => ({ k, r: ((i + 1) * 9301 + 49297) % 233280 }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.k);
  }, [scenario]);

  function handlePick(k: DPIKey, opts?: { fromAutoplay?: boolean }) {
    if (completed || worn.has(k)) return;
    const expected = scenario.sequence[step];
    if (k === expected) {
      const newWorn = new Set(worn);
      newWorn.add(k);
      setWorn(newWorn);
      setStep(step + 1);
      setHighlight({ key: k, kind: 'ok' });
      setFeedback({
        kind: 'ok',
        text: `✓ ${ALL_ITEMS[k].label} — ${ALL_ITEMS[k].hint}`,
      });
      addEvent('ok', ALL_ITEMS[k].label, opts?.fromAutoplay ? 'autoplay' : undefined);
      window.setTimeout(() => setHighlight(null), 1600);
      if (step + 1 >= scenario.sequence.length) {
        setCompleted(true);
        onComplete?.({ correct: scenario.sequence.length, mistakes });
      }
    } else {
      setMistakes(m => m + 1);
      setShakeKey(k);
      const isDistractor = !scenario.sequence.includes(k);
      const cartoon = isDistractor
        ? `Oh no! 🤔 ${ALL_ITEMS[k].label} non c'entra in questo scenario: serve quando ${ALL_ITEMS[k].description.toLowerCase()}`
        : `Stop! 🛑 ${ALL_ITEMS[k].label} si indossa più avanti. Prima va: ${ALL_ITEMS[expected].label} — ${ALL_ITEMS[expected].description.toLowerCase()}`;
      setFeedback({
        kind: 'ko',
        text: isDistractor
          ? `✗ ${ALL_ITEMS[k].label} non è necessario in questo scenario.`
          : `✗ Non è il momento giusto. Indossa prima: ${ALL_ITEMS[expected].label}.`,
        cartoon,
      });
      // Evidenzia sull'avatar l'area anatomica corretta del prossimo DPI atteso
      setHighlight({ key: expected, kind: 'ko' });
      addEvent('ko', ALL_ITEMS[k].label, `atteso: ${ALL_ITEMS[expected].label}`);
      window.setTimeout(() => setShakeKey(null), 450);
      window.setTimeout(() => setHighlight(null), 2200);
    }
  }

  // Modalità guidata con autoplay: indossa automaticamente il prossimo DPI ogni ~2.2s
  useEffect(() => {
    if (!guided || autoplayPaused || completed) return;
    const expected = scenario.sequence[step];
    if (!expected) return;
    const id = window.setTimeout(() => {
      handlePick(expected, { fromAutoplay: true });
    }, 2200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guided, autoplayPaused, step, completed]);

  function handleReset() {
    setWorn(new Set());
    setStep(0);
    setMistakes(0);
    setFeedback(null);
    setHighlight(null);
    setCompleted(false);
    startedAtRef.current = Date.now();
    eventsRef.current = [];
  }

  const totalSeconds = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
  const score = Math.max(0, 100 - mistakes * 10);

  function buildReport(): DPIReportData {
    return {
      scenarioTitle: scenario.title,
      scenarioId: scenario.id,
      userName: user?.email || undefined,
      companyName: company?.name || undefined,
      season,
      hivis,
      totalSeconds,
      mistakes,
      score,
      sequence: scenario.sequence.map(k => ({ key: k, label: ALL_ITEMS[k].label, normativa: ALL_ITEMS[k].normativa })),
      events: eventsRef.current,
    };
  }

  function handleExportPdf() {
    const blob = exportDpiReportPdf(buildReport());
    downloadBlob(blob, `report-vestizione-dpi-${scenario.id}.pdf`);
  }
  function handleExportCsv() {
    const blob = exportDpiReportCsv(buildReport());
    downloadBlob(blob, `report-vestizione-dpi-${scenario.id}.csv`);
  }

  const progress = Math.round((step / scenario.sequence.length) * 100);
  const expectedKey = scenario.sequence[step];

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#6B1622] to-[#1F7A3A] text-white px-4 py-3 sm:px-5 sm:py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base truncate">{scenario.title}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {step}/{scenario.sequence.length}
          </Badge>
        </div>

        {/* Varianti grafiche cartoon */}
        <div className="px-4 sm:px-5 pt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Variante:</span>
          <div className="inline-flex rounded-md border bg-background overflow-hidden">
            <button
              type="button"
              onClick={() => setSeason('estivo')}
              className={`px-2 py-1 flex items-center gap-1 ${season === 'estivo' ? 'bg-[#1F7A3A] text-white' : 'hover:bg-muted'}`}
              aria-pressed={season === 'estivo'}
            >
              <Sun className="w-3.5 h-3.5" /> Estivo
            </button>
            <button
              type="button"
              onClick={() => setSeason('invernale')}
              className={`px-2 py-1 flex items-center gap-1 ${season === 'invernale' ? 'bg-[#6B1622] text-white' : 'hover:bg-muted'}`}
              aria-pressed={season === 'invernale'}
            >
              <Snowflake className="w-3.5 h-3.5" /> Invernale
            </button>
          </div>
          <span className="text-muted-foreground ml-2">Hi-vis:</span>
          <div className="inline-flex rounded-md border bg-background overflow-hidden">
            {(['arancio', 'giallo', 'lime'] as HiVisColor[]).map((c) => {
              const col = hivisColor(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setHivis(c)}
                  className={`w-8 h-8 min-w-[32px] min-h-[32px] border-l first:border-l-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0F1722] ${hivis === c ? 'ring-2 ring-offset-1 ring-[#0F1722]' : ''}`}
                  style={{ background: col.base }}
                  aria-label={`Variante hi-vis ${c}${hivis === c ? ' (selezionata)' : ''}`}
                  aria-pressed={hivis === c}
                  title={`Hi-vis ${c}`}
                />
              );
            })}
          </div>

          <Button
            type="button"
            variant={guided ? 'default' : 'outline'}
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => { setGuided(g => !g); setAutoplayPaused(false); }}
            aria-pressed={guided}
            aria-label={guided ? 'Disattiva modalità guidata' : 'Attiva modalità guidata con autoplay'}
          >
            <PlayCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            {guided ? 'Guida attiva' : 'Modalità guidata'}
          </Button>
          {guided && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setAutoplayPaused(p => !p)}
              aria-label={autoplayPaused ? 'Riprendi autoplay' : 'Metti in pausa autoplay'}
            >
              {autoplayPaused ? <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" /> : <PauseCircle className="w-3.5 h-3.5" aria-hidden="true" />}
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-8 px-2 text-xs"
            onClick={() => setLegendOpen(o => !o)}
            aria-expanded={legendOpen}
            aria-controls="dpi-legend"
          >
            <Info className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            {legendOpen ? 'Nascondi legenda' : 'Legenda DPI'}
          </Button>
        </div>

        <CardContent className="p-4 sm:p-5">
          <p className="text-sm text-muted-foreground mb-4">{scenario.intro}</p>

          {legendOpen && (
            <div id="dpi-legend" className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
              {scenario.sequence.concat(scenario.distractors || []).map((k) => (
                <div key={k} className="flex items-start gap-2 text-xs">
                  <div className="shrink-0">
                    <DpiIcon k={k} size={36} season={season} hivis={hivis} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{ALL_ITEMS[k].label}</div>
                    <div className="text-muted-foreground leading-snug">{ALL_ITEMS[k].description}</div>
                    {ALL_ITEMS[k].normativa && (
                      <div className="text-[10px] text-slate-600 mt-0.5">📘 {ALL_ITEMS[k].normativa}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hint del prossimo DPI atteso (utile in modalità guidata e per screen reader) */}
          {!completed && expectedKey && (
            <div className="mb-3 text-xs text-muted-foreground" aria-live="polite">
              Prossimo DPI: <span className="font-semibold text-foreground">{ALL_ITEMS[expectedKey].label}</span>
              {' '}— area: <span className="italic">{ANATOMY[expectedKey].label}</span>
            </div>
          )}

          {/* Layout responsive */}
          <div className="grid grid-cols-2 md:grid-cols-[1fr_1.4fr_1fr] gap-3 md:gap-4 items-start">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3 order-2 md:order-1 col-span-2 md:col-span-1">
              {allKeys.slice(0, Math.ceil(allKeys.length / 2)).map(k => (
                <DpiCard
                  key={k}
                  k={k}
                  worn={worn.has(k)}
                  shake={shakeKey === k}
                  onPick={() => handlePick(k)}
                  season={season}
                  hivis={hivis}
                  isNext={k === expectedKey && !worn.has(k)}
                />
              ))}
            </div>

            <div className="bg-gradient-to-b from-sky-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-3 flex flex-col items-center order-1 md:order-2 col-span-2 md:col-span-1">
              <Avatar worn={worn} season={season} hivis={hivis} highlight={highlight} />
              <div
                className="w-full mt-2 h-2 bg-slate-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Avanzamento vestizione DPI"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#1F7A3A] to-[#6B1622] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Errori: <span className="font-semibold text-foreground">{mistakes}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3 order-3 col-span-2 md:col-span-1">
              {allKeys.slice(Math.ceil(allKeys.length / 2)).map(k => (
                <DpiCard
                  key={k}
                  k={k}
                  worn={worn.has(k)}
                  shake={shakeKey === k}
                  onPick={() => handlePick(k)}
                  season={season}
                  hivis={hivis}
                  isNext={k === expectedKey && !worn.has(k)}
                />
              ))}
            </div>
          </div>

          {/* Feedback con spiegazione cartoon */}
          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-4 p-3 rounded-lg border text-sm flex items-start gap-2 ${
                feedback.kind === 'ok'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {feedback.kind === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              )}
              <div className="space-y-1">
                <div className="font-medium">{feedback.text}</div>
                {feedback.cartoon && (
                  <div className="text-xs opacity-90">💬 {feedback.cartoon}</div>
                )}
              </div>
            </div>
          )}

          {completed && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" aria-hidden="true" />
                  <div>
                    <div className="font-bold text-emerald-900">Vestizione completata!</div>
                    <div className="text-xs text-emerald-800">
                      Punteggio <strong>{score}/100</strong> · {mistakes} {mistakes === 1 ? 'errore' : 'errori'} · Tempo {Math.floor(totalSeconds/60)}m {totalSeconds%60}s
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleReset} aria-label="Ripeti la vestizione">
                  <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" /> Ripeti
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleExportPdf} className="bg-[#6B1622] hover:bg-[#54101a] text-white" aria-label="Esporta report PDF">
                  <FileDown className="w-4 h-4 mr-2" aria-hidden="true" /> Esporta report PDF
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportCsv} aria-label="Esporta report CSV">
                  <FileSpreadsheet className="w-4 h-4 mr-2" aria-hidden="true" /> Esporta CSV
                </Button>
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-2">
                Conserva il report per gli audit del DVR e per la documentazione di formazione (D.Lgs. 81/08).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function DpiCard({
  k,
  worn,
  shake,
  onPick,
  season,
  hivis,
  isNext = false,
}: {
  k: DPIKey;
  worn: boolean;
  shake: boolean;
  onPick: () => void;
  season: DPISeason;
  hivis: HiVisColor;
  isNext?: boolean;
}) {
  const item = ALL_ITEMS[k];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onPick}
          disabled={worn}
          aria-label={`${item.label}: ${item.description}${isNext ? '. Prossimo DPI da indossare.' : ''}${worn ? '. Già indossato.' : ''}`}
          aria-current={isNext ? 'step' : undefined}
          className={`group flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all min-h-[96px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1622] focus-visible:ring-offset-2 ${
            worn
              ? 'bg-emerald-50 border-emerald-400 cursor-default'
              : isNext
                ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-200 hover:shadow-lg active:scale-95'
                : 'bg-white border-slate-300 hover:border-[#6B1622] hover:shadow-md active:scale-95'
          } ${shake ? 'animate-[dpi-shake_0.4s_ease-in-out]' : ''}`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            <DpiIcon k={k} size={56} dimmed={worn} season={season} hivis={hivis} />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-center leading-tight text-foreground line-clamp-2">
            {item.label}
          </span>
          {worn && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />}
          <style>{`
            @keyframes dpi-shake {
              0%,100% { transform: translateX(0); }
              25% { transform: translateX(-6px); }
              75% { transform: translateX(6px); }
            }
          `}</style>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px]">
        <div className="space-y-1">
          <div className="font-semibold text-sm">{item.label}</div>
          <div className="text-xs opacity-90">{item.description}</div>
          {item.normativa && <div className="text-[10px] opacity-70">📘 {item.normativa}</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
