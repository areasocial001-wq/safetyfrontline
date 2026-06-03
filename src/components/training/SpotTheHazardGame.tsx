import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Heart, Trophy, CheckCircle2, XCircle, AlertTriangle, BookOpen, RotateCcw, Lightbulb, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import type { CartoonHazardLevel, CartoonHazard } from "@/data/cartoon-hazard-levels";
import { toast } from "sonner";

interface Props {
  level: CartoonHazardLevel;
  onExit?: () => void;
}

type Status = "playing" | "won" | "lost";

// Hint balance (kept central for tuning)
const HINTS_PER_GAME = 2;
const HINT_COOLDOWN_MS = 25_000;
const HINT_GLOW_MS = 1_500;

// Parse "12%" -> 12 (numeric percent)
const pct = (v: string) => parseFloat(v) || 0;

const SpotTheHazardGame = ({ level, onExit }: Props) => {
  const [found, setFound] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(level.lives);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [activeHazard, setActiveHazard] = useState<CartoonHazard | null>(null);
  const [status, setStatus] = useState<Status>("playing");
  const [shakeAt, setShakeAt] = useState<{ x: number; y: number; id: number } | null>(null);
  const [hintsLeft, setHintsLeft] = useState(HINTS_PER_GAME);
  const [hintedId, setHintedId] = useState<string | null>(null);
  const [hintCooldownUntil, setHintCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(`sth_tutorial_seen_${level.level_id}`);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Render hazards smallest-area last so the more specific click target sits on top
  // (resolves overlaps and edge clicks deterministically).
  const renderedHazards = useMemo(() => {
    const area = (h: CartoonHazard) => pct(h.hitbox_size.width) * pct(h.hitbox_size.height);
    return [...level.hazards].sort((a, b) => area(b) - area(a));
  }, [level.hazards]);

  useEffect(() => {
    if (!hintedId) return;
    const t = setTimeout(() => setHintedId(null), HINT_GLOW_MS);
    return () => clearTimeout(t);
  }, [hintedId]);

  // Tick for cooldown UI
  useEffect(() => {
    if (hintCooldownUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [hintCooldownUntil]);

  const cooldownLeft = Math.max(0, Math.ceil((hintCooldownUntil - now) / 1000));
  const hintDisabled = status !== "playing" || hintsLeft <= 0 || cooldownLeft > 0;

  const useHint = useCallback(() => {
    if (status !== "playing" || hintsLeft <= 0 || Date.now() < hintCooldownUntil) return;
    const remaining = level.hazards.filter(h => !found.has(h.id));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setHintedId(pick.id);
    setHintsLeft(n => n - 1);
    setHintCooldownUntil(Date.now() + HINT_COOLDOWN_MS);
    setNow(Date.now());
  }, [status, hintsLeft, hintCooldownUntil, level.hazards, found]);

  const dismissTutorial = () => {
    setShowTutorial(false);
    try { sessionStorage.setItem(`sth_tutorial_seen_${level.level_id}`, "1"); } catch {}
  };


  const totalHazards = level.hazards.length;
  const progress = (found.size / totalHazards) * 100;

  const handleHazardClick = useCallback((hazard: CartoonHazard, e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "playing" || found.has(hazard.id)) return;
    const newFound = new Set(found).add(hazard.id);
    const newScore = score + hazard.points;
    setFound(newFound);
    setScore(newScore);
    setActiveHazard(hazard);
    if (newFound.size === totalHazards) setStatus("won");
  }, [found, score, status, totalHazards]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (status !== "playing") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setWrongClicks(c => c + 1);
    setShakeAt({ x, y, id: Date.now() });
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setStatus("lost");
    } else {
      toast.error("Click sbagliato!", { description: `Vite rimaste: ${newLives}`, duration: 1500 });
    }
  }, [lives, status]);

  const reset = () => {
    setFound(new Set()); setScore(0); setLives(level.lives);
    setWrongClicks(0); setActiveHazard(null); setStatus("playing");
    setHintsLeft(HINTS_PER_GAME); setHintedId(null); setHintCooldownUntil(0);
  };

  const finalAccuracy = useMemo(() => {
    const total = found.size + wrongClicks;
    return total === 0 ? 100 : Math.round((found.size / total) * 100);
  }, [found.size, wrongClicks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 w-full">
      {/* Game canvas */}
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className="relative w-full aspect-video overflow-hidden rounded-2xl border-2 border-border shadow-xl select-none cursor-crosshair bg-muted"
      >
        <img
          src={level.background_image_url}
          alt={level.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
          loading="lazy"
        />

        {/* HUD */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 border border-border shadow-md pointer-events-none">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold tabular-nums">{score}</span>
            <span className="text-muted-foreground text-sm">XP</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); useHint(); }}
              disabled={hintDisabled}
              className="rounded-full shadow-md gap-1.5 bg-background/90 backdrop-blur-sm border border-border"
              aria-label="Mostra un indizio"
              title={cooldownLeft > 0 ? `Disponibile fra ${cooldownLeft}s` : `Indizi rimasti: ${hintsLeft}`}
            >
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="hidden sm:inline">Indizio</span>
              <span className="text-xs font-bold tabular-nums">
                {cooldownLeft > 0 ? `${cooldownLeft}s` : hintsLeft}
              </span>
            </Button>
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-3 py-2 border border-border shadow-md pointer-events-none">
              {Array.from({ length: level.lives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 transition-all ${i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/40"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hazard click zones (invisible) */}
        {renderedHazards.map(h => {
          const isFound = found.has(h.id);
          const isHinted = hintedId === h.id;
          return (
            <button
              key={h.id}
              onClick={(e) => handleHazardClick(h, e)}
              disabled={isFound || status !== "playing"}
              aria-label={h.name}
              className="absolute group"
              style={{ top: h.position.top, left: h.position.left, width: h.hitbox_size.width, height: h.hitbox_size.height }}
            >
              {isFound ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-green-500/25 border-4 border-green-500 animate-in zoom-in duration-300" />
                  <CheckCircle2 className="relative h-8 w-8 text-white drop-shadow-lg animate-in zoom-in duration-500" />
                </span>
              ) : isHinted ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-yellow-400/30 border-4 border-yellow-400 animate-ping" />
                  <span className="absolute inset-0 rounded-full border-2 border-yellow-500/80 shadow-[0_0_25px_rgba(250,204,21,0.8)]" />
                </>
              ) : (
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-focus:opacity-100 bg-primary/20 border-2 border-primary/60 transition-opacity" />
              )}
            </button>
          );
        })}

        {/* Wrong click feedback */}
        {shakeAt && (
          <span
            key={shakeAt.id}
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in zoom-in fade-in duration-300"
            style={{ top: `${shakeAt.y}%`, left: `${shakeAt.x}%` }}
            onAnimationEnd={() => setShakeAt(null)}
          >
            <XCircle className="h-10 w-10 text-destructive drop-shadow-lg" />
          </span>
        )}

        {/* End-game overlays */}
        {status !== "playing" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <Card className="max-w-md w-[90%] p-8 text-center space-y-4 animate-in zoom-in-95">
              {status === "won" ? (
                <>
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                  <h2 className="text-3xl font-extrabold">Tutti i rischi trovati!</h2>
                  <p className="text-muted-foreground">Hai dimostrato un occhio attento alla sicurezza.</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
                  <h2 className="text-3xl font-extrabold">Game Over</h2>
                  <p className="text-muted-foreground">Hai esaurito le vite. Riprova con più attenzione!</p>
                </>
              )}
              <div className="grid grid-cols-3 gap-3 py-2">
                <div><div className="text-2xl font-bold text-primary">{score}</div><div className="text-xs text-muted-foreground">XP</div></div>
                <div><div className="text-2xl font-bold text-accent">{found.size}/{totalHazards}</div><div className="text-xs text-muted-foreground">Rischi</div></div>
                <div><div className="text-2xl font-bold">{finalAccuracy}%</div><div className="text-xs text-muted-foreground">Precisione</div></div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={reset} variant="default"><RotateCcw className="h-4 w-4 mr-1" />Riprova</Button>
                {onExit && <Button onClick={onExit} variant="outline">Esci</Button>}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Side panel: hazard checklist */}
      <Card className="p-4 flex flex-col gap-3 lg:max-h-[calc(56.25vw*1)] overflow-hidden">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Rischi da trovare
          </h3>
          <p className="text-sm text-muted-foreground">{found.size} di {totalHazards} identificati</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <ul className="flex-1 overflow-y-auto space-y-2 pr-1">
          {level.hazards.map((h, i) => {
            const isFound = found.has(h.id);
            return (
              <li
                key={h.id}
                className={`flex items-start gap-2 rounded-lg p-2 border text-sm transition-colors ${
                  isFound ? "bg-green-500/10 border-green-500/40" : "bg-muted/40 border-border"
                }`}
              >
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isFound ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {isFound ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <span className={isFound ? "font-medium" : "text-muted-foreground"}>
                  {isFound ? h.name : "???"}
                </span>
              </li>
            );
          })}
        </ul>
        {status === "playing" && (
          <p className="text-xs text-muted-foreground border-t pt-2">
            💡 Click ovunque per cercare. Click sbagliati = vita persa. Usa "Indizio" se non trovi un rischio.
          </p>
        )}
      </Card>

      {/* Educational modal */}
      <Dialog open={!!activeHazard} onOpenChange={(o) => !o && setActiveHazard(null)}>
        <DialogContent className="max-w-lg">
          {activeHazard && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 text-sm font-semibold mb-1 ${
                  activeHazard.feedback.type === "critical" ? "text-destructive"
                  : activeHazard.feedback.type === "warning" ? "text-yellow-600"
                  : "text-green-600"
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  {activeHazard.feedback.title}
                </div>
                <DialogTitle className="text-2xl">{activeHazard.name}</DialogTitle>
                <DialogDescription>{activeHazard.feedback.message}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                {activeHazard.educational?.why && (
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Perché è un rischio</div>
                    <p className="text-sm">{activeHazard.educational.why}</p>
                  </div>
                )}
                {activeHazard.educational?.correct_action && (
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Azione corretta</div>
                    <p className="text-sm">{activeHazard.educational.correct_action}</p>
                  </div>
                )}
                {activeHazard.educational?.regulation && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    📖 {activeHazard.educational.regulation}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">+{activeHazard.points} XP</span>
                  <Button onClick={() => setActiveHazard(null)}>Continua</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpotTheHazardGame;
