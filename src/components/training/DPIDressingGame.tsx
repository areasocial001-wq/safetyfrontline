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

function hivisColor(c: HiVisColor) {
  if (c === 'arancio') return { base: DPI_TOKENS.hivisOrange, dark: DPI_TOKENS.hivisOrangeDark };
  if (c === 'giallo') return { base: DPI_TOKENS.hivisYellow, dark: DPI_TOKENS.hivisYellowDark };
  return { base: DPI_TOKENS.hivisLime, dark: DPI_TOKENS.hivisLimeDark };
}

// ============================================================
// Assets DPI realistici (render 3D / product shot, PNG trasparenti)
// ============================================================
import dpiCasco from '@/assets/dpi/casco.png';
import dpiOcchiali from '@/assets/dpi/occhiali.png';
import dpiCuffie from '@/assets/dpi/cuffie.png';
import dpiMaschera from '@/assets/dpi/maschera.png';
import dpiGuanti from '@/assets/dpi/guanti.png';
import dpiGilet from '@/assets/dpi/gilet.png';
import dpiTuta from '@/assets/dpi/tuta.png';
import dpiScarpe from '@/assets/dpi/scarpe.png';
import dpiImbracatura from '@/assets/dpi/imbracatura.png';
import dpiCordino from '@/assets/dpi/cordino.png';

const DPI_IMAGES: Record<DPIKey, string> = {
  casco: dpiCasco,
  occhiali: dpiOcchiali,
  cuffie: dpiCuffie,
  maschera: dpiMaschera,
  guanti: dpiGuanti,
  gilet: dpiGilet,
  tuta: dpiTuta,
  scarpe: dpiScarpe,
  imbracatura: dpiImbracatura,
  cordino: dpiCordino,
};

// Hue-rotate approssimativo per variare il colore hi-vis del gilet arancio base
function hivisFilter(c: HiVisColor): string | undefined {
  if (c === 'arancio') return undefined;
  if (c === 'giallo') return 'hue-rotate(25deg) saturate(1.15)';
  return 'hue-rotate(55deg) saturate(1.05)';
}

interface DpiIconProps {
  k: DPIKey;
  size?: number;
  dimmed?: boolean;
  season?: DPISeason;
  hivis?: HiVisColor;
}

/**
 * Icona DPI realistica. Usa render 3D/product-shot al posto delle sagome cartoon.
 */
export function DpiIcon({ k, size = 56, dimmed = false, hivis = 'arancio' }: DpiIconProps) {
  const filter = k === 'gilet' ? hivisFilter(hivis) : undefined;
  return (
    <img
      src={DPI_IMAGES[k]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        opacity: dimmed ? 0.35 : 1,
        filter,
        userSelect: 'none',
      }}
    />
  );
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

// Anatomia: cerchio evidenziato per feedback (già usato)
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

// Bounding box (viewBox 768x1024) per collocare i PNG realistici sull'avatar
const LAYER_BOX: Record<DPIKey, { x: number; y: number; w: number; h: number }> = {
  tuta:        { x: 210, y: 240, w: 348, h: 780 },
  scarpe:      { x: 235, y: 918, w: 298, h: 110 },
  gilet:       { x: 235, y: 260, w: 298, h: 360 },
  imbracatura: { x: 240, y: 250, w: 288, h: 430 },
  cordino:     { x: 380, y: 200, w: 340, h: 280 },
  guanti:      { x:  90, y: 470, w: 588, h: 190 },
  maschera:    { x: 285, y: 155, w: 198, h: 150 },
  occhiali:    { x: 280, y: 125, w: 208, h:  80 },
  cuffie:      { x: 235, y:  90, w: 298, h: 170 },
  casco:       { x: 225, y:   0, w: 318, h: 205 },
};

function Avatar({
  worn, hivis, highlight,
}: { worn: Set<DPIKey>; season: DPISeason; hivis: HiVisColor; highlight?: { key: DPIKey; kind: 'ok' | 'ko' } | null }) {
  const T = DPI_TOKENS;

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
        {LAYER_ORDER.map((k) => {
          if (!worn.has(k)) return null;
          const b = LAYER_BOX[k];
          const filter = k === 'gilet' ? hivisFilter(hivis) : undefined;
          return (
            <image
              key={k}
              href={DPI_IMAGES[k]}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              preserveAspectRatio="xMidYMid meet"
              style={filter ? { filter } : undefined}
            />
          );
        })}
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
