import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Heart, Trophy, CheckCircle2, XCircle, AlertTriangle, BookOpen, RotateCcw, Lightbulb, GraduationCap, Move, Copy, Eye, EyeOff, Crosshair, Layers, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import type { CartoonHazardLevel, CartoonHazard } from "@/data/cartoon-hazard-levels";
import { CARTOON_LEVELS } from "@/data/cartoon-hazard-levels";
import {
  loadOverrides as loadStoredOverrides,
  saveEnvelope,
  clearEnvelope,
  auditAllLevels,
  exportBundle,
  importBundle,
  downloadJSON,
  type HazardOverride,
} from "@/lib/calibration-storage";
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sanitizeHazard = (base: CartoonHazard, override?: HazardOverride | null): CartoonHazard => {
  if (!override) return base;

  const width = clamp(Number.isFinite(pct(override.hitbox_size.width)) ? pct(override.hitbox_size.width) : pct(base.hitbox_size.width), 1, 100);
  const height = clamp(Number.isFinite(pct(override.hitbox_size.height)) ? pct(override.hitbox_size.height) : pct(base.hitbox_size.height), 1, 100);
  const left = clamp(Number.isFinite(pct(override.position.left)) ? pct(override.position.left) : pct(base.position.left), 0, Math.max(0, 100 - width));
  const top = clamp(Number.isFinite(pct(override.position.top)) ? pct(override.position.top) : pct(base.position.top), 0, Math.max(0, 100 - height));

  return {
    ...base,
    position: {
      left: `${left.toFixed(2)}%`,
      top: `${top.toFixed(2)}%`,
    },
    hitbox_size: {
      width: `${width.toFixed(2)}%`,
      height: `${height.toFixed(2)}%`,
    },
  };
};

const applyOverrides = (hazards: CartoonHazard[], overrides: HazardOverride[] | null): CartoonHazard[] => {
  if (!overrides?.length) return hazards;
  const map = new Map(overrides.map(o => [o.id, o]));
  return hazards.map(h => sanitizeHazard(h, map.get(h.id)));
};

// AABB overlap test on two hazards (percentages)
const overlaps = (a: CartoonHazard, b: CartoonHazard) => {
  const ax1 = pct(a.position.left), ay1 = pct(a.position.top);
  const ax2 = ax1 + pct(a.hitbox_size.width), ay2 = ay1 + pct(a.hitbox_size.height);
  const bx1 = pct(b.position.left), by1 = pct(b.position.top);
  const bx2 = bx1 + pct(b.hitbox_size.width), by2 = by1 + pct(b.hitbox_size.height);
  return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
};

const SpotTheHazardGame = ({ level, onExit }: Props) => {
  const [found, setFound] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(level.lives);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [imgAspect, setImgAspect] = useState("16 / 9");
  const [imgMaxWidth, setImgMaxWidth] = useState("142.22vh");
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

  // ─── Calibration mode (?calibrate=1) ──────────────────────────────
  const [calibrate, setCalibrate] = useState(false);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [verifyMode, setVerifyMode] = useState(true); // hover highlight + overlap detection
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Effective hazards: original + any persisted overrides from localStorage (applied even during play)
  const effectiveBase = useMemo(
    () => applyOverrides(level.hazards, loadStoredOverrides(level.level_id)),
    [level.hazards, level.level_id]
  );
  const [editable, setEditable] = useState<CartoonHazard[]>(effectiveBase);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => { setEditable(effectiveBase); }, [effectiveBase]);
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("calibrate")) {
      setCalibrate(true); setShowHitboxes(true);
    }
  }, []);

  // Audit all stored calibrations once per session and warn about anomalies.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "sth_audit_session_seen";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const issues = auditAllLevels(Object.values(CARTOON_LEVELS));
    if (issues.length) {
      const head = issues.slice(0, 3).map(i => `• [${i.levelId}] ${i.message}`).join("\n");
      const more = issues.length > 3 ? `\n…e altri ${issues.length - 3}` : "";
      toast.warning(`Calibrazioni: ${issues.length} anomalie rilevate`, {
        description: head + more,
        duration: 6000,
      });
    }
  }, []);

  // Persist calibration to localStorage (debounced) using the versioned envelope
  const persistOverrides = useCallback((hazards: CartoonHazard[]) => {
    const out: HazardOverride[] = hazards.map(h => ({
      id: h.id, position: h.position, hitbox_size: h.hitbox_size,
    }));
    saveEnvelope(level.level_id, out);
  }, [level.level_id]);
  useEffect(() => {
    const t = setTimeout(() => persistOverrides(editable), 250);
    return () => clearTimeout(t);
  }, [editable, persistOverrides]);

  // ─── Overlap detection (calibrate + verify) ───────────────────────
  const overlapIds = useMemo(() => {
    if (!calibrate || !verifyMode) return new Set<string>();
    const ids = new Set<string>();
    for (let i = 0; i < editable.length; i++) {
      for (let j = i + 1; j < editable.length; j++) {
        if (overlaps(editable[i], editable[j])) { ids.add(editable[i].id); ids.add(editable[j].id); }
      }
    }
    return ids;
  }, [editable, calibrate, verifyMode]);

  // Render hazards smallest-area last so the more specific click target sits on top
  // (resolves overlaps and edge clicks deterministically).
  // Always use `editable` as the single source of truth so saved calibrations are
  // immediately visible when exiting calibration mode (no reload required).
  const renderedHazards = useMemo(() => {
    const area = (h: CartoonHazard) => pct(h.hitbox_size.width) * pct(h.hitbox_size.height);
    return [...editable].sort((a, b) => area(b) - area(a));
  }, [editable]);

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
    if (calibrate) { setSelectedId(hazard.id); return; }
    if (status !== "playing" || found.has(hazard.id)) return;
    const newFound = new Set(found).add(hazard.id);
    const newScore = score + hazard.points;
    setFound(newFound);
    setScore(newScore);
    setActiveHazard(hazard);
    if (newFound.size === totalHazards) setStatus("won");
  }, [found, score, status, totalHazards, calibrate]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (calibrate) return;
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
  }, [lives, status, calibrate]);

  // ─── Drag / resize for calibration ────────────────────────────────
  const dragRef = useRef<{ id: string; mode: "move" | "resize"; startX: number; startY: number; orig: CartoonHazard } | null>(null);
  const onHazardPointerDown = (e: React.PointerEvent, hazard: CartoonHazard, mode: "move" | "resize") => {
    if (!calibrate) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id: hazard.id, mode, startX: e.clientX, startY: e.clientY, orig: hazard };
    setSelectedId(hazard.id);
  };
  const onContainerPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - d.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - d.startY) / rect.height) * 100;
    setEditable(prev => prev.map(h => {
      if (h.id !== d.id) return h;
      if (d.mode === "move") {
        const width = pct(d.orig.hitbox_size.width);
        const height = pct(d.orig.hitbox_size.height);
        const left = clamp(pct(d.orig.position.left) + dxPct, 0, Math.max(0, 100 - width));
        const top = clamp(pct(d.orig.position.top) + dyPct, 0, Math.max(0, 100 - height));
        return { ...h, position: {
          left: `${left.toFixed(2)}%`,
          top: `${top.toFixed(2)}%`,
        }};
      }
      const width = clamp(pct(d.orig.hitbox_size.width) + dxPct, 1, Math.max(1, 100 - pct(d.orig.position.left)));
      const height = clamp(pct(d.orig.hitbox_size.height) + dyPct, 1, Math.max(1, 100 - pct(d.orig.position.top)));
      return { ...h, hitbox_size: {
        width: `${width.toFixed(2)}%`,
        height: `${height.toFixed(2)}%`,
      }};
    }));
  };
  const onContainerPointerUp = () => { dragRef.current = null; };

  const copyJSON = () => {
    const out = editable.map(h => ({ id: h.id, position: h.position, hitbox_size: h.hitbox_size }));
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    toast.success("Coordinate copiate negli appunti");
  };
  const resetCalibration = () => {
    setEditable(level.hazards);
    clearEnvelope(level.level_id);
    toast.success("Calibrazione ripristinata ai valori originali");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportCalibrations = () => {
    const bundle = exportBundle(Object.values(CARTOON_LEVELS));
    const count = Object.keys(bundle.levels).length;
    if (!count) { toast.info("Nessuna calibrazione salvata da esportare"); return; }
    const date = new Date().toISOString().slice(0, 10);
    downloadJSON(`spot-the-hazard-calibrations-${date}.json`, bundle);
    toast.success(`Esportate calibrazioni per ${count} liv.`);
  };
  const importCalibrations = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const count = importBundle(data);
      if (count === 0) { toast.error("Nessuna calibrazione valida nel file"); return; }
      toast.success(`Importate ${count} calibrazion${count === 1 ? "e" : "i"}. Ricarico…`);
      // Reapply current level overrides immediately
      const fresh = applyOverrides(level.hazards, loadStoredOverrides(level.level_id));
      setEditable(fresh);
    } catch {
      toast.error("File JSON non valido");
    }
  };

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
      {/* Game column (canvas + calibration toolbar below) */}
      <div className="flex flex-col gap-2 min-w-0">
      {/* Game canvas */}
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        onPointerMove={onContainerPointerMove}
        onPointerUp={onContainerPointerUp}
        style={{ aspectRatio: imgAspect, maxWidth: `min(100%, ${imgMaxWidth})` }}
        className={`relative w-full mx-auto overflow-hidden rounded-2xl border-2 border-border shadow-xl select-none bg-muted ${calibrate ? "cursor-default touch-none" : "cursor-crosshair"}`}
      >
        <img
          src={level.background_image_url}
          alt={level.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
          loading="lazy"
          onLoad={(e) => {
            const im = e.currentTarget;
            if (im.naturalWidth && im.naturalHeight) {
              setImgAspect(`${im.naturalWidth} / ${im.naturalHeight}`);
              setImgMaxWidth(`${((im.naturalWidth / im.naturalHeight) * 80).toFixed(2)}vh`);
            }
          }}
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




        {/* Hazard click zones */}
        {renderedHazards.map(h => {
          const isFound = found.has(h.id);
          const isHinted = hintedId === h.id;
          const isSelected = calibrate && selectedId === h.id;
          const isHovered = calibrate && verifyMode && hoveredId === h.id;
          const isOverlap = overlapIds.has(h.id);
          return (
            <button
              key={h.id}
              onClick={(e) => handleHazardClick(h, e)}
              onPointerDown={(e) => onHazardPointerDown(e, h, "move")}
              onMouseEnter={() => calibrate && verifyMode && setHoveredId(h.id)}
              onMouseLeave={() => calibrate && verifyMode && setHoveredId(prev => prev === h.id ? null : prev)}
              disabled={!calibrate && (isFound || status !== "playing")}
              aria-label={h.name}
              className={`absolute group ${calibrate ? "cursor-move" : ""} ${
                calibrate && showHitboxes
                  ? isOverlap ? "border-2 border-yellow-400 bg-yellow-400/25"
                  : isHovered ? "border-2 border-emerald-400 bg-emerald-400/30 shadow-[0_0_0_2px_rgba(52,211,153,0.4)]"
                  : isSelected ? "border-2 border-primary bg-primary/30"
                  : "border-2 border-red-500 bg-red-500/20"
                  : ""
              }`}
              style={{ top: h.position.top, left: h.position.left, width: h.hitbox_size.width, height: h.hitbox_size.height }}
            >
              {calibrate && showHitboxes && (
                <span className="absolute -top-5 left-0 text-[10px] bg-background/90 px-1 rounded whitespace-nowrap font-mono pointer-events-none flex items-center gap-1">
                  {h.id}
                  {isOverlap && <Layers className="h-2.5 w-2.5 text-yellow-600" />}
                </span>
              )}
              {!calibrate && isFound ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-green-500/25 border-4 border-green-500 animate-in zoom-in duration-300" />
                  <CheckCircle2 className="relative h-8 w-8 text-white drop-shadow-lg animate-in zoom-in duration-500" />
                </span>
              ) : !calibrate && isHinted ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-yellow-400/30 border-4 border-yellow-400 animate-ping" />
                  <span className="absolute inset-0 rounded-full border-2 border-yellow-500/80 shadow-[0_0_25px_rgba(250,204,21,0.8)]" />
                </>
              ) : !calibrate ? (
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-focus:opacity-100 bg-primary/20 border-2 border-primary/60 transition-opacity" />
              ) : null}
              {calibrate && (
                <span
                  onPointerDown={(e) => { e.stopPropagation(); onHazardPointerDown(e, h, "resize"); }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-0 right-0 w-4 h-4 bg-primary border border-background cursor-nwse-resize"
                />
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

      {/* Calibration toolbar (below the canvas so it never blocks hitboxes) */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={calibrate ? "default" : "outline"}
          size="sm"
          onClick={() => { setCalibrate(v => !v); setShowHitboxes(true); }}
          title="Modalità calibrazione (?calibrate=1)"
        >
          <Move className="h-4 w-4 mr-1" />{calibrate ? "Esci calibrazione" : "Calibra"}
        </Button>
        {calibrate && (
          <>
            <Button variant="outline" size="sm" onClick={() => setShowHitboxes(v => !v)}>
              {showHitboxes ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showHitboxes ? "Nascondi" : "Mostra"} hitbox
            </Button>
            <Button
              variant={verifyMode ? "default" : "outline"}
              size="sm"
              onClick={() => setVerifyMode(v => !v)}
              title="Evidenzia area cliccabile al passaggio del mouse e segnala sovrapposizioni"
            >
              <Crosshair className="h-4 w-4 mr-1" />Verifica
            </Button>
            <Button variant="outline" size="sm" onClick={copyJSON}>
              <Copy className="h-4 w-4 mr-1" />Copia JSON
            </Button>
            <Button variant="outline" size="sm" onClick={exportCalibrations} title="Esporta tutte le calibrazioni in un file JSON">
              <Download className="h-4 w-4 mr-1" />Esporta
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} title="Importa calibrazioni da un file JSON">
              <Upload className="h-4 w-4 mr-1" />Importa
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importCalibrations(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" size="sm" onClick={resetCalibration}>
              Reset
            </Button>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground">
              💾 autosalvataggio attivo
            </span>
            {verifyMode && overlapIds.size > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-yellow-500/90 text-yellow-950 border border-yellow-700 font-semibold">
                <Layers className="h-3.5 w-3.5" />
                {overlapIds.size / 2 | 0 || 1} sovrapposizion{overlapIds.size > 2 ? "i" : "e"}
              </span>
            )}
          </>
        )}
      </div>
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
          <div className="border-t pt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              💡 Click ovunque per cercare. Click sbagliati = vita persa.
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              onClick={() => setShowTutorial(true)}
            >
              <GraduationCap className="h-3.5 w-3.5 mr-1" /> Rivedi tutorial
            </Button>
          </div>
        )}
      </Card>

      {/* Tutorial intro */}
      <Dialog open={showTutorial} onOpenChange={(o) => { if (!o) dismissTutorial(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" /> Come si gioca
            </DialogTitle>
            <DialogDescription>
              {level.intro_dialogue.text} <span className="italic">— {level.intro_dialogue.speaker}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border bg-muted/40 p-3">
              <div className="font-semibold mb-1">🎯 Riconoscere gli hazard</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Cerca <b>fonti di calore vicino a materiali combustibili</b> (strofinacci, carta, grassi).</li>
                <li>Osserva <b>cavi danneggiati, multiprese sovraccariche</b> o liquidi vicino all'elettricità.</li>
                <li>Controlla <b>DPI mancanti</b> (guanti, mascherine, occhiali) e <b>posture scorrette</b>.</li>
                <li>Verifica <b>pavimenti scivolosi, ostacoli</b> e <b>uscite ostruite</b>.</li>
                <li>Macchine in funzione <b>senza protezioni</b> o lame esposte sono critiche.</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-yellow-500/10 border-yellow-500/30 p-3">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" /> Sistema Indizi
              </div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><b>{HINTS_PER_GAME} indizi</b> per partita, con <b>cooldown di {HINT_COOLDOWN_MS / 1000}s</b> tra uno e l'altro.</li>
                <li>Un alone giallo lampeggia per <b>{HINT_GLOW_MS / 1000}s</b> su un rischio non ancora trovato.</li>
                <li>Usali con parsimonia: trovare gli hazard da soli vale più XP e abilità.</li>
              </ul>
            </div>
            <div className="text-xs text-muted-foreground">
              ⚠️ Hai <b>{level.lives} vite</b>. Ogni click su zona vuota ne costa una.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={dismissTutorial} className="w-full sm:w-auto">Ho capito, iniziamo!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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
