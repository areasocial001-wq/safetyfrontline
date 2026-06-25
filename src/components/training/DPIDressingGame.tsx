import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RotateCcw, ShieldCheck, AlertTriangle, Trophy } from 'lucide-react';
import dpiAvatarHuman from '@/assets/dpi-avatar-human.png';


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

// Avatar cartoon "umano": immagine PNG di base + DPI sovrapposti in SVG
function Avatar({ worn }: { worn: Set<DPIKey> }) {
  // viewBox 768x1024 — coordinate calibrate sull'immagine dpi-avatar-human.png
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
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Tuta da lavoro: copre busto + gambe con tono navy */}
        {worn.has('tuta') && (
          <>
            <path
              d="M250 250 L300 240 L384 260 L468 240 L518 250 L520 600 L495 980 L420 980 L400 700 L368 700 L348 980 L273 980 L248 600 Z"
              fill={C_NAVY}
              stroke={C_DARK}
              strokeWidth="3"
              opacity="0.92"
            />
            <rect x="358" y="320" width="52" height="80" fill={C_YELLOW} opacity="0.55" rx="4" />
          </>
        )}

        {/* Scarpe antinfortunistiche */}
        {worn.has('scarpe') && (
          <>
            <path d="M250 935 L355 935 L375 920 L410 920 Q445 920 445 955 L445 985 L245 985 Z"
              fill={C_YELLOW} stroke={C_NAVY} strokeWidth="3" />
            <path d="M325 935 L430 935 L450 920 L490 920 Q525 920 525 955 L525 985 L320 985 Z"
              fill={C_YELLOW} stroke={C_NAVY} strokeWidth="3" />
            <rect x="245" y="975" width="285" height="12" fill={C_DARK} rx="2" />
          </>
        )}

        {/* Gilet alta visibilità */}
        {worn.has('gilet') && (
          <>
            <path d="M260 270 L350 260 L384 290 L418 260 L508 270 L500 580 L268 580 Z"
              fill="#F2A33A" stroke={C_DARK} strokeWidth="3" opacity="0.95" />
            <rect x="275" y="380" width="220" height="22" fill="#C9D6DF" />
            <rect x="275" y="470" width="220" height="22" fill="#C9D6DF" />
          </>
        )}

        {/* Imbracatura anticaduta */}
        {worn.has('imbracatura') && (
          <>
            <path d="M310 270 L384 470 L458 270" fill="none" stroke={C_YELLOW} strokeWidth="14" />
            <rect x="270" y="470" width="228" height="22" fill="none" stroke={C_YELLOW} strokeWidth="12" />
            <circle cx="384" cy="481" r="18" fill={C_NAVY} stroke={C_DARK} strokeWidth="3" />
          </>
        )}

        {/* Cordino con dissipatore */}
        {worn.has('cordino') && (
          <>
            <path d="M384 481 Q560 400 680 200" stroke={C_YELLOW} strokeWidth="14" fill="none" strokeLinecap="round" />
            <rect x="660" y="170" width="34" height="50" rx="8" fill={C_NAVY} stroke={C_DARK} strokeWidth="3" />
          </>
        )}

        {/* Guanti — mani sinistra e destra */}
        {worn.has('guanti') && (
          <>
            <ellipse cx="170" cy="555" rx="55" ry="62" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="3" />
            <ellipse cx="600" cy="555" rx="55" ry="62" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="3" />
            <path d="M125 555 L215 555 M555 555 L645 555" stroke={C_NAVY} strokeWidth="2.5" />
          </>
        )}

        {/* Maschera/Respiratore */}
        {worn.has('maschera') && (
          <>
            <path d="M295 175 Q384 155 473 175 L460 245 Q384 270 308 245 Z"
              fill={C_NAVY} stroke={C_DARK} strokeWidth="3" />
            <circle cx="340" cy="220" r="22" fill={C_YELLOW} stroke={C_DARK} strokeWidth="2.5" />
            <circle cx="428" cy="220" r="22" fill={C_YELLOW} stroke={C_DARK} strokeWidth="2.5" />
            <path d="M295 195 Q260 180 250 200 M473 195 Q508 180 518 200" stroke={C_DARK} strokeWidth="3" fill="none" />
          </>
        )}

        {/* Occhiali di protezione */}
        {worn.has('occhiali') && (
          <>
            <path d="M280 145 Q384 122 488 145 L488 175 Q384 200 280 175 Z"
              fill={C_YELLOW} stroke={C_NAVY} strokeWidth="2.5" opacity="0.95" />
            <rect x="295" y="138" width="78" height="42" rx="8" fill="#ffffff" stroke={C_NAVY} strokeWidth="2.5" opacity="0.85" />
            <rect x="395" y="138" width="78" height="42" rx="8" fill="#ffffff" stroke={C_NAVY} strokeWidth="2.5" opacity="0.85" />
          </>
        )}

        {/* Cuffie antirumore */}
        {worn.has('cuffie') && (
          <>
            <path d="M270 110 Q384 30 498 110" stroke={C_NAVY} strokeWidth="12" fill="none" />
            <rect x="240" y="105" width="48" height="80" rx="14" fill={C_NAVY} stroke={C_DARK} strokeWidth="3" />
            <rect x="480" y="105" width="48" height="80" rx="14" fill={C_NAVY} stroke={C_DARK} strokeWidth="3" />
            <rect x="232" y="130" width="14" height="30" fill={C_YELLOW} />
            <rect x="522" y="130" width="14" height="30" fill={C_YELLOW} />
          </>
        )}

        {/* Casco protettivo — sempre per ultimo */}
        {worn.has('casco') && (
          <>
            <path d="M250 130 Q384 -10 518 130 Z" fill={C_YELLOW} stroke={C_NAVY} strokeWidth="4" />
            <rect x="240" y="125" width="288" height="20" rx="4" fill={C_NAVY} stroke={C_DARK} strokeWidth="2" />
            <path d="M384 0 Q384 80 384 130" stroke={C_DARK} strokeWidth="3" opacity="0.25" />
          </>
        )}
      </svg>
    </div>
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
