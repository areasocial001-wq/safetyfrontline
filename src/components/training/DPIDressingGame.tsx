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
            <path d="M8 44 Q32 6 56 44 Z" fill={T.yellow} />
            <path d="M10 44 Q32 18 54 44" fill={T.yellowDark} opacity=".35" stroke="none" />
            <rect x="6" y="44" width="52" height="7" rx="2" fill={T.navy} />
            <rect x="28" y="14" width="8" height="30" fill={T.yellowDark} opacity=".55" stroke="none" />
            {season === 'invernale' && (
              <path d="M6 51 L58 51 L56 58 L8 58 Z" fill={T.fabricWinter} />
            )}
          </Cartoon>
        </svg>
      );
    case 'occhiali':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M4 30 Q32 16 60 30 L60 40 Q32 50 4 40 Z" fill={T.yellow} />
            <rect x="10" y="28" width="18" height="13" rx="3" fill="#F4FAFF" />
            <rect x="36" y="28" width="18" height="13" rx="3" fill="#F4FAFF" />
            <path d="M14 32 L20 32 M40 32 L46 32" stroke="#fff" strokeWidth="2" opacity=".9" />
          </Cartoon>
        </svg>
      );
    case 'cuffie':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M10 40 Q32 4 54 40" />
            <rect x="3" y="34" width="15" height="22" rx="4" fill={T.navy} />
            <rect x="46" y="34" width="15" height="22" rx="4" fill={T.navy} />
            <rect x="1" y="40" width="6" height="10" rx="1" fill={T.yellow} />
            <rect x="57" y="40" width="6" height="10" rx="1" fill={T.yellow} />
          </Cartoon>
        </svg>
      );
    case 'maschera':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M10 22 Q32 12 54 22 L52 46 Q32 56 12 46 Z" fill={T.navy} />
            <circle cx="22" cy="36" r="7" fill={T.yellow} />
            <circle cx="42" cy="36" r="7" fill={T.yellow} />
            <path d="M10 22 Q4 18 4 28 M54 22 Q60 18 60 28" />
          </Cartoon>
        </svg>
      );
    case 'guanti':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M14 56 L14 24 Q14 16 22 16 L22 30 L28 30 L28 12 Q28 4 36 4 Q44 4 44 12 L44 30 L50 30 L50 22 Q50 18 54 18 L54 56 Z" fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
            <path d="M14 40 L54 40" />
          </Cartoon>
        </svg>
      );
    case 'gilet':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M10 14 L26 14 L32 22 L38 14 L54 14 L54 56 L10 56 Z" fill={hv.base} />
            <rect x="14" y="30" width="36" height="6" fill={T.reflect} />
            <rect x="14" y="44" width="36" height="6" fill={T.reflect} />
            {season === 'invernale' && (
              <path d="M10 14 L54 14 L54 22 L10 22 Z" fill={hv.dark} opacity="0.5" stroke="none" />
            )}
          </Cartoon>
        </svg>
      );
    case 'tuta':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M18 8 L46 8 L50 30 L46 56 L36 56 L34 36 L30 36 L28 56 L18 56 L14 30 Z" fill={fabric} />
            <rect x="28" y="18" width="8" height="10" fill={fabricAccent} />
            {season === 'estivo' && (
              <path d="M18 8 L20 22 M46 8 L44 22" stroke={T.fabricSummer} strokeWidth="3" opacity="0.8" />
            )}
          </Cartoon>
        </svg>
      );
    case 'scarpe':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M6 42 L26 42 L36 30 L48 30 Q58 30 58 40 L58 50 L6 50 Z" fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
            <rect x="6" y="48" width="52" height="6" fill={T.navyDark} />
          </Cartoon>
        </svg>
      );
    case 'imbracatura':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M22 8 L42 8 L36 24 L42 56 L22 56 L28 24 Z" fill={T.yellow} />
            <rect x="14" y="30" width="36" height="7" fill={T.yellow} />
            <circle cx="32" cy="33" r="4" fill={T.navy} />
          </Cartoon>
        </svg>
      );
    case 'cordino':
      return (
        <svg {...common} aria-hidden="true">
          <Cartoon>
            <path d="M10 12 Q32 36 54 12" stroke={T.dark} />
            <path d="M10 12 Q32 36 54 12" stroke={T.yellow} strokeWidth="3" fill="none" />
            <rect x="48" y="5" width="11" height="15" rx="3" fill={T.navy} />
            <rect x="24" y="38" width="16" height="18" rx="3" fill={T.yellow} />
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

function Avatar({ worn, season, hivis }: { worn: Set<DPIKey>; season: DPISeason; hivis: HiVisColor }) {
  const T = DPI_TOKENS;
  const hv = hivisColor(hivis);
  const tutaFill = season === 'invernale' ? T.fabricWinter : T.navy;
  const tutaAccent = season === 'invernale' ? T.fabricWinterAccent : T.yellow;
  const glovesFill = season === 'invernale' ? T.fabricWinter : T.yellow;

  const layers: Record<DPIKey, React.ReactNode> = {
    tuta: (
      <Cartoon big>
        <path
          d="M250 250 L300 240 L384 260 L468 240 L518 250 L520 600 L495 980 L420 980 L400 700 L368 700 L348 980 L273 980 L248 600 Z"
          fill={tutaFill}
        />
        <path d="M384 260 L384 980" stroke={T.navyDark} strokeWidth="6" opacity="0.6" />
        <rect x="356" y="320" width="56" height="80" rx="6" fill={tutaAccent} />
      </Cartoon>
    ),
    scarpe: (
      <Cartoon big>
        <path d="M250 935 L355 935 L375 920 L410 920 Q445 920 445 955 L445 985 L245 985 Z" fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
        <path d="M325 935 L430 935 L450 920 L490 920 Q525 920 525 955 L525 985 L320 985 Z" fill={season === 'invernale' ? T.fabricWinter : T.yellow} />
        <rect x="245" y="975" width="285" height="14" rx="3" fill={T.navyDark} />
      </Cartoon>
    ),
    gilet: (
      <Cartoon big>
        <path d="M260 270 L350 260 L384 290 L418 260 L508 270 L500 580 L268 580 Z" fill={hv.base} />
        <rect x="275" y="380" width="220" height="24" fill={T.reflect} />
        <rect x="275" y="470" width="220" height="24" fill={T.reflect} />
        <path d="M384 290 L384 580" stroke={hv.dark} strokeWidth="4" opacity="0.6" />
      </Cartoon>
    ),
    imbracatura: (
      <Cartoon big>
        <path d="M310 270 L384 470 L458 270" stroke={T.dark} strokeWidth="18" />
        <path d="M310 270 L384 470 L458 270" stroke={T.yellow} strokeWidth="12" />
        <rect x="270" y="466" width="228" height="26" rx="4" fill={T.yellow} />
        <circle cx="384" cy="479" r="20" fill={T.navy} />
        <circle cx="384" cy="479" r="6" fill={T.yellow} stroke="none" />
      </Cartoon>
    ),
    cordino: (
      <Cartoon big>
        <path d="M384 481 Q560 400 680 200" stroke={T.dark} strokeWidth="18" />
        <path d="M384 481 Q560 400 680 200" stroke={T.yellow} strokeWidth="11" />
        <rect x="658" y="168" width="38" height="56" rx="8" fill={T.navy} />
      </Cartoon>
    ),
    guanti: (
      <Cartoon big>
        <ellipse cx="170" cy="555" rx="58" ry="64" fill={glovesFill} />
        <ellipse cx="600" cy="555" rx="58" ry="64" fill={glovesFill} />
        <path d="M125 555 L215 555 M555 555 L645 555" stroke={season === 'invernale' ? T.navyDark : T.yellowDark} strokeWidth="4" />
      </Cartoon>
    ),
    maschera: (
      <Cartoon big>
        <path d="M295 175 Q384 155 473 175 L460 245 Q384 270 308 245 Z" fill={T.navy} />
        <circle cx="340" cy="220" r="24" fill={T.yellow} />
        <circle cx="428" cy="220" r="24" fill={T.yellow} />
        <path d="M295 195 Q258 178 250 205 M473 195 Q510 178 518 205" />
      </Cartoon>
    ),
    occhiali: (
      <Cartoon big>
        <path d="M280 145 Q384 122 488 145 L488 178 Q384 200 280 178 Z" fill={T.yellow} />
        <rect x="295" y="140" width="78" height="42" rx="8" fill="#F4FAFF" />
        <rect x="395" y="140" width="78" height="42" rx="8" fill="#F4FAFF" />
        <path d="M308 152 L350 152 M408 152 L450 152" stroke="#fff" strokeWidth="4" opacity=".9" />
      </Cartoon>
    ),
    cuffie: (
      <Cartoon big>
        <path d="M270 110 Q384 22 498 110" stroke={T.dark} strokeWidth="16" />
        <path d="M270 110 Q384 22 498 110" stroke={T.navy} strokeWidth="10" />
        <rect x="238" y="105" width="52" height="84" rx="14" fill={T.navy} />
        <rect x="478" y="105" width="52" height="84" rx="14" fill={T.navy} />
        <rect x="230" y="130" width="14" height="34" rx="2" fill={T.yellow} />
        <rect x="524" y="130" width="14" height="34" rx="2" fill={T.yellow} />
      </Cartoon>
    ),
    casco: (
      <Cartoon big>
        <path d="M250 135 Q384 -5 518 135 Z" fill={T.yellow} />
        <path d="M260 135 Q384 35 508 135" fill={T.yellowDark} opacity="0.4" stroke="none" />
        <rect x="240" y="128" width="288" height="22" rx="5" fill={T.navy} />
        <path d="M384 5 L384 130" stroke={T.yellowDark} strokeWidth="6" opacity="0.6" />
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
      >
        <ellipse cx="384" cy="990" rx="180" ry="14" fill={T.dark} opacity="0.18" />
        {LAYER_ORDER.map((k) => (worn.has(k) ? <g key={k}>{layers[k]}</g> : null))}
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
  const [worn, setWorn] = useState<Set<DPIKey>>(new Set());
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [shakeKey, setShakeKey] = useState<DPIKey | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'ko'; text: string } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [season, setSeason] = useState<DPISeason>('estivo');
  const [hivis, setHivis] = useState<HiVisColor>('arancio');
  const [legendOpen, setLegendOpen] = useState(false);

  const allKeys = useMemo(() => {
    const set = [...scenario.sequence, ...(scenario.distractors || [])];
    return set
      .map((k, i) => ({ k, r: ((i + 1) * 9301 + 49297) % 233280 }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.k);
  }, [scenario]);

  function handlePick(k: DPIKey) {
    if (completed || worn.has(k)) return;
    const expected = scenario.sequence[step];
    if (k === expected) {
      const newWorn = new Set(worn);
      newWorn.add(k);
      setWorn(newWorn);
      setStep(step + 1);
      setFeedback({ kind: 'ok', text: `✓ ${ALL_ITEMS[k].label} — ${ALL_ITEMS[k].hint}` });
      if (step + 1 >= scenario.sequence.length) {
        setCompleted(true);
        onComplete?.({ correct: scenario.sequence.length, mistakes });
      }
    } else {
      setMistakes(m => m + 1);
      setShakeKey(k);
      const isDistractor = !scenario.sequence.includes(k);
      setFeedback({
        kind: 'ko',
        text: isDistractor
          ? `✗ ${ALL_ITEMS[k].label} non è necessario in questo scenario.`
          : `✗ Non è il momento giusto. Indossa prima: ${ALL_ITEMS[expected].label}.`,
      });
      setTimeout(() => setShakeKey(null), 450);
    }
  }

  function handleReset() {
    setWorn(new Set());
    setStep(0);
    setMistakes(0);
    setFeedback(null);
    setCompleted(false);
  }

  const progress = Math.round((step / scenario.sequence.length) * 100);

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
                  className={`w-7 h-7 border-l first:border-l-0 ${hivis === c ? 'ring-2 ring-offset-1 ring-[#0F1722]' : ''}`}
                  style={{ background: col.base }}
                  aria-label={`Hi-vis ${c}`}
                  aria-pressed={hivis === c}
                />
              );
            })}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-2 text-xs"
            onClick={() => setLegendOpen(o => !o)}
          >
            <Info className="w-3.5 h-3.5 mr-1" />
            {legendOpen ? 'Nascondi legenda' : 'Legenda DPI'}
          </Button>
        </div>

        <CardContent className="p-4 sm:p-5">
          <p className="text-sm text-muted-foreground mb-4">{scenario.intro}</p>

          {legendOpen && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
              {scenario.sequence.concat(scenario.distractors || []).map((k) => (
                <div key={k} className="flex items-start gap-2 text-xs">
                  <div className="shrink-0">
                    <DpiIcon k={k} size={36} season={season} hivis={hivis} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{ALL_ITEMS[k].label}</div>
                    <div className="text-muted-foreground leading-snug">{ALL_ITEMS[k].description}</div>
                    {ALL_ITEMS[k].normativa && (
                      <div className="text-[10px] text-slate-500 mt-0.5">📘 {ALL_ITEMS[k].normativa}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Layout responsive: mobile = stack verticale; desktop = 3 colonne */}
          <div className="grid grid-cols-2 md:grid-cols-[1fr_1.4fr_1fr] gap-3 md:gap-4 items-start">
            {/* Colonna SX DPI */}
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
                />
              ))}
            </div>

            {/* Avatar centrale */}
            <div className="bg-gradient-to-b from-sky-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-3 flex flex-col items-center order-1 md:order-2 col-span-2 md:col-span-1">
              <Avatar worn={worn} season={season} hivis={hivis} />
              <div className="w-full mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1F7A3A] to-[#6B1622] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Errori: <span className="font-semibold text-foreground">{mistakes}</span>
              </div>
            </div>

            {/* Colonna DX DPI */}
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
                />
              ))}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-4 p-3 rounded-lg border text-sm flex items-start gap-2 ${
                feedback.kind === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {feedback.kind === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {completed && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <div>
                  <div className="font-bold text-emerald-900">Vestizione completata!</div>
                  <div className="text-xs text-emerald-700">
                    Sequenza corretta con {mistakes} {mistakes === 1 ? 'errore' : 'errori'}.
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Ripeti
              </Button>
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
}: {
  k: DPIKey;
  worn: boolean;
  shake: boolean;
  onPick: () => void;
  season: DPISeason;
  hivis: HiVisColor;
}) {
  const item = ALL_ITEMS[k];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onPick}
          disabled={worn}
          aria-label={`${item.label}: ${item.description}`}
          className={`group flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all min-h-[96px] ${
            worn
              ? 'bg-emerald-50 border-emerald-300 cursor-default'
              : 'bg-white border-slate-200 hover:border-[#6B1622] hover:shadow-md active:scale-95'
          } ${shake ? 'animate-[dpi-shake_0.4s_ease-in-out]' : ''}`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            <DpiIcon k={k} size={56} dimmed={worn} season={season} hivis={hivis} />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-center leading-tight text-foreground/80 line-clamp-2">
            {item.label}
          </span>
          {worn && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
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
