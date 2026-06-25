import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RotateCcw, ShieldCheck, AlertTriangle, Trophy } from 'lucide-react';

// ---------- Tipi ----------
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

interface DPIItem {
  key: DPIKey;
  label: string;
  hint: string;
}

interface DPIScenarioDef {
  id: string;
  title: string;
  intro: string;
  sequence: DPIKey[]; // ordine corretto
  distractors?: DPIKey[]; // DPI non pertinenti
}

const ALL_ITEMS: Record<DPIKey, DPIItem> = {
  tuta:        { key: 'tuta',        label: 'Tuta da lavoro',           hint: 'Indossa per prima la tuta o salopette.' },
  scarpe:      { key: 'scarpe',      label: 'Scarpe antinfortunistiche', hint: 'Calzature S3 con puntale e suola antiperforazione.' },
  gilet:       { key: 'gilet',       label: 'Gilet alta visibilità',     hint: 'Indispensabile in cantiere e su strada.' },
  guanti:      { key: 'guanti',      label: 'Guanti da lavoro',          hint: 'Proteggono da tagli e abrasioni.' },
  occhiali:    { key: 'occhiali',    label: 'Occhiali di protezione',    hint: 'Contro schegge, polveri e schizzi.' },
  cuffie:      { key: 'cuffie',      label: 'Cuffie antirumore',         hint: 'Obbligatorie sopra 85 dB(A).' },
  casco:       { key: 'casco',       label: 'Casco protettivo',          hint: 'Sempre per ultimo, dopo cuffie e occhiali.' },
  imbracatura: { key: 'imbracatura', label: 'Imbracatura anticaduta',    hint: 'DPI di III categoria per lavori in quota.' },
  cordino:     { key: 'cordino',     label: 'Cordino con dissipatore',   hint: 'Da agganciare alla linea vita.' },
  maschera:    { key: 'maschera',    label: 'Maschera/Respiratore',      hint: 'Per polveri, fumi o vapori.' },
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

// ---------- Pittogrammi SVG (stile cartoon coerente coi giochi 2D) ----------
const C_YELLOW = '#F2A33A';
const C_NAVY = '#26365A';
const C_SKIN = '#C9A07A';
const C_DARK = '#1a2440';

function DpiIcon({ k, size = 56, dimmed = false }: { k: DPIKey; size?: number; dimmed?: boolean }) {
  const op = dimmed ? 0.25 : 1;
  const common = { width: size, height: size, viewBox: '0 0 64 64', style: { opacity: op } } as const;
  switch (k) {
    case 'casco':
      return (
        <svg {...common}>
          <path d="M8 44 Q32 8 56 44 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2.5" />
          <rect x="6" y="44" width="52" height="6" rx="2" fill={C_NAVY} />
          <rect x="28" y="14" width="8" height="30" fill={C_NAVY} opacity=".25" />
        </svg>
      );
    case 'occhiali':
      return (
        <svg {...common}>
          <path d="M4 30 Q32 16 60 30 L60 40 Q32 50 4 40 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2.5" />
          <rect x="10" y="28" width="18" height="12" rx="3" fill="#fff" stroke={C_NAVY} strokeWidth="2" />
          <rect x="36" y="28" width="18" height="12" rx="3" fill="#fff" stroke={C_NAVY} strokeWidth="2" />
        </svg>
      );
    case 'cuffie':
      return (
        <svg {...common}>
          <path d="M10 38 Q32 6 54 38" stroke={C_NAVY} strokeWidth="4" fill="none" />
          <rect x="4" y="34" width="14" height="20" rx="4" fill={C_NAVY} />
          <rect x="46" y="34" width="14" height="20" rx="4" fill={C_NAVY} />
          <rect x="2" y="40" width="6" height="8" fill={C_YELLOW} />
          <rect x="56" y="40" width="6" height="8" fill={C_YELLOW} />
        </svg>
      );
    case 'maschera':
      return (
        <svg {...common}>
          <path d="M10 22 Q32 12 54 22 L52 46 Q32 56 12 46 Z" fill={C_NAVY} />
          <circle cx="22" cy="36" r="7" fill={C_YELLOW} stroke={C_DARK} strokeWidth="2" />
          <circle cx="42" cy="36" r="7" fill={C_YELLOW} stroke={C_DARK} strokeWidth="2" />
        </svg>
      );
    case 'guanti':
      return (
        <svg {...common}>
          <path d="M14 56 L14 24 Q14 16 22 16 L22 30 L28 30 L28 12 Q28 4 36 4 Q44 4 44 12 L44 30 L50 30 L50 22 Q50 18 54 18 L54 56 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2.5" />
          <path d="M14 40 L54 40" stroke={C_NAVY} strokeWidth="2" />
        </svg>
      );
    case 'gilet':
      return (
        <svg {...common}>
          <path d="M10 14 L26 14 L32 22 L38 14 L54 14 L54 56 L10 56 Z" fill={C_NAVY} stroke={C_DARK} strokeWidth="2" />
          <rect x="14" y="30" width="36" height="6" fill={C_YELLOW} />
          <rect x="14" y="44" width="36" height="6" fill={C_YELLOW} />
        </svg>
      );
    case 'tuta':
      return (
        <svg {...common}>
          <path d="M18 8 L46 8 L50 30 L46 56 L36 56 L34 36 L30 36 L28 56 L18 56 L14 30 Z" fill={C_NAVY} stroke={C_DARK} strokeWidth="2" />
          <rect x="28" y="18" width="8" height="10" fill={C_YELLOW} opacity=".7" />
        </svg>
      );
    case 'scarpe':
      return (
        <svg {...common}>
          <path d="M6 42 L26 42 L36 30 L48 30 Q58 30 58 40 L58 50 L6 50 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2.5" />
          <rect x="6" y="48" width="52" height="6" fill={C_DARK} />
        </svg>
      );
    case 'imbracatura':
      return (
        <svg {...common}>
          <path d="M22 8 L42 8 L36 24 L42 56 L22 56 L28 24 Z" fill="none" stroke={C_YELLOW} strokeWidth="4" />
          <circle cx="32" cy="32" r="5" fill={C_NAVY} />
          <rect x="14" y="30" width="36" height="6" fill="none" stroke={C_YELLOW} strokeWidth="3" />
        </svg>
      );
    case 'cordino':
      return (
        <svg {...common}>
          <path d="M10 12 Q32 36 54 12" stroke={C_YELLOW} strokeWidth="4" fill="none" />
          <rect x="48" y="6" width="10" height="14" rx="3" fill={C_NAVY} />
          <rect x="24" y="38" width="16" height="18" rx="4" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2" />
        </svg>
      );
  }
}

// Avatar cartoon (silhouette) con DPI "indossati"
function Avatar({ worn }: { worn: Set<DPIKey> }) {
  return (
    <svg viewBox="0 0 240 380" className="w-full h-full max-h-[440px]">
      {/* corpo base */}
      {/* gambe */}
      <rect x="92" y="240" width="22" height="110" fill={worn.has('tuta') ? C_NAVY : C_SKIN} />
      <rect x="126" y="240" width="22" height="110" fill={worn.has('tuta') ? C_NAVY : C_SKIN} />
      {/* busto */}
      <rect x="84" y="120" width="72" height="130" rx="10" fill={worn.has('tuta') ? C_NAVY : '#F2C9A0'} stroke={C_DARK} strokeWidth="2" />
      {/* braccia */}
      <rect x="60" y="125" width="22" height="110" rx="8" fill={worn.has('tuta') ? C_NAVY : C_SKIN} />
      <rect x="158" y="125" width="22" height="110" rx="8" fill={worn.has('tuta') ? C_NAVY : C_SKIN} />
      {/* mani */}
      <circle cx="71" cy="245" r="13" fill={worn.has('guanti') ? C_YELLOW : C_SKIN} stroke={C_DARK} strokeWidth="2" />
      <circle cx="169" cy="245" r="13" fill={worn.has('guanti') ? C_YELLOW : C_SKIN} stroke={C_DARK} strokeWidth="2" />
      {/* testa */}
      <circle cx="120" cy="90" r="36" fill={C_SKIN} stroke={C_DARK} strokeWidth="2" />

      {/* DPI sovrapposti */}
      {worn.has('scarpe') && (
        <>
          <path d="M82 348 L120 348 L130 338 L150 338 Q162 338 162 352 L162 360 L82 360 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2" />
          <path d="M110 348 L156 348 L156 360 L82 360 L82 352 Q82 348 90 348 Z M158 338 Q170 338 170 352 L170 360 L90 360 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2" transform="translate(-6,0)" />
        </>
      )}
      {worn.has('gilet') && (
        <path d="M84 120 L156 120 L152 240 L88 240 Z" fill={C_NAVY} opacity=".85" stroke={C_DARK} strokeWidth="2" />
      )}
      {worn.has('gilet') && (
        <>
          <rect x="86" y="160" width="68" height="10" fill={C_YELLOW} />
          <rect x="86" y="200" width="68" height="10" fill={C_YELLOW} />
        </>
      )}
      {worn.has('imbracatura') && (
        <>
          <path d="M96 122 L120 200 L144 122" fill="none" stroke={C_YELLOW} strokeWidth="5" />
          <rect x="86" y="200" width="68" height="8" fill="none" stroke={C_YELLOW} strokeWidth="4" />
          <circle cx="120" cy="205" r="6" fill={C_NAVY} />
        </>
      )}
      {worn.has('cordino') && (
        <path d="M120 205 Q170 170 200 110" stroke={C_YELLOW} strokeWidth="5" fill="none" />
      )}
      {worn.has('maschera') && (
        <>
          <path d="M92 92 Q120 84 148 92 L144 116 Q120 124 96 116 Z" fill={C_NAVY} />
          <circle cx="106" cy="108" r="6" fill={C_YELLOW} stroke={C_DARK} strokeWidth="1.5" />
          <circle cx="134" cy="108" r="6" fill={C_YELLOW} stroke={C_DARK} strokeWidth="1.5" />
        </>
      )}
      {worn.has('occhiali') && (
        <>
          <path d="M86 84 Q120 74 154 84 L154 92 Q120 100 86 92 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2" />
          <rect x="92" y="80" width="22" height="14" rx="3" fill="#fff" stroke={C_NAVY} strokeWidth="1.5" />
          <rect x="126" y="80" width="22" height="14" rx="3" fill="#fff" stroke={C_NAVY} strokeWidth="1.5" />
        </>
      )}
      {worn.has('cuffie') && (
        <>
          <path d="M86 70 Q120 40 154 70" stroke={C_NAVY} strokeWidth="4" fill="none" />
          <rect x="78" y="62" width="14" height="22" rx="4" fill={C_NAVY} />
          <rect x="148" y="62" width="14" height="22" rx="4" fill={C_NAVY} />
        </>
      )}
      {worn.has('casco') && (
        <>
          <path d="M78 70 Q120 22 162 70 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2.5" />
          <rect x="76" y="68" width="88" height="8" rx="2" fill={C_NAVY} />
        </>
      )}
    </svg>
  );
}

// ---------- Componente principale ----------
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

  const allKeys = useMemo(() => {
    const set = [...scenario.sequence, ...(scenario.distractors || [])];
    // shuffle stabile per render
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
    <Card className="border-none shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#6B1622] to-[#1F7A3A] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-bold">{scenario.title}</h3>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          {step}/{scenario.sequence.length}
        </Badge>
      </div>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground mb-4">{scenario.intro}</p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1fr] gap-4 items-start">
          {/* Colonna SX: prime metà DPI */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {allKeys.slice(0, Math.ceil(allKeys.length / 2)).map(k => (
              <DpiCard key={k} k={k} worn={worn.has(k)} shake={shakeKey === k} onPick={() => handlePick(k)} />
            ))}
          </div>

          {/* Avatar centrale */}
          <div className="bg-gradient-to-b from-sky-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-3 flex flex-col items-center">
            <Avatar worn={worn} />
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

          {/* Colonna DX: seconda metà DPI */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {allKeys.slice(Math.ceil(allKeys.length / 2)).map(k => (
              <DpiCard key={k} k={k} worn={worn.has(k)} shake={shakeKey === k} onPick={() => handlePick(k)} />
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

        {/* Completamento */}
        {completed && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-3">
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
  );
}

function DpiCard({
  k,
  worn,
  shake,
  onPick,
}: {
  k: DPIKey;
  worn: boolean;
  shake: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={worn}
      className={`group flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
        worn
          ? 'bg-emerald-50 border-emerald-300 cursor-default'
          : 'bg-white border-slate-200 hover:border-[#6B1622] hover:shadow-md active:scale-95'
      } ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
      style={{
        animation: shake ? 'dpi-shake 0.4s ease-in-out' : undefined,
      }}
    >
      <DpiIcon k={k} dimmed={worn} />
      <span className="text-[11px] font-medium text-center leading-tight text-foreground/80">
        {ALL_ITEMS[k].label}
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
  );
}
