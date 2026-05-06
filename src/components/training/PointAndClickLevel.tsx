import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Trophy, Star, Move, Copy, AlertTriangle, Save, Smartphone, Monitor, Tv, Projector } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ───────────────────── Device presets ─────────────────────
type DevicePreset = "mobile" | "desktop" | "tv" | "projector";
const PRESET_ICONS: Record<DevicePreset, typeof Smartphone> = {
  mobile: Smartphone, desktop: Monitor, tv: Tv, projector: Projector,
};
const PRESET_LABELS: Record<DevicePreset, string> = {
  mobile: "Mobile", desktop: "Desktop", tv: "TV", projector: "Proiettore",
};
const detectPreset = (): DevicePreset => {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (w < 768 && isTouch) return "mobile";
  if (w >= 2400) return "projector";
  if (w >= 1800) return "tv";
  return "desktop";
};
const presetStorageKey = (levelId: string, preset: DevicePreset) =>
  `risk-hunt:hotspots:${levelId}:${preset}`;
type HazardOverride = { id: string; position: { top: string; left: string }; hitbox_size: { width: string; height: string } };
const loadOverrides = (levelId: string, preset: DevicePreset): HazardOverride[] | null => {
  try {
    const raw = localStorage.getItem(presetStorageKey(levelId, preset));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const applyOverrides = (base: Hazard[], overrides: HazardOverride[] | null): Hazard[] => {
  if (!overrides?.length) return base;
  const map = new Map(overrides.map(o => [o.id, o]));
  return base.map(h => {
    const o = map.get(h.id);
    return o ? { ...h, position: o.position, hitbox_size: o.hitbox_size } : h;
  });
};

interface Hazard {
  id: string;
  name: string;
  position: { top: string; left: string };
  hitbox_size: { width: string; height: string };
  points: number;
  feedback: {
    title: string;
    message: string;
    type: "success" | "critical" | "warning";
  };
}

interface LevelData {
  level_id: string;
  title: string;
  description: string;
  background_image_url: string;
  total_hazards: number;
  intro_dialogue: { speaker: string; text: string };
  hazards: Hazard[];
}

const DEFAULT_LEVEL: LevelData = {
  level_id: "mod_01_office",
  title: "Caccia ai Rischi: L'Ufficio",
  description: "Sembra un normale ufficio amministrativo, ma nasconde delle insidie.",
  background_image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
  total_hazards: 3,
  intro_dialogue: { speaker: "RSPP Virtuale", text: "Trova i rischi cliccando sui punti sospetti." },
  hazards: [
    { id: "h_01_cable", name: "Cavo Elettrico Volante", position: { top: "85%", left: "40%" }, hitbox_size: { width: "10%", height: "10%" }, points: 100, feedback: { title: "Ottimo occhio!", message: "I cavi a terra causano inciampo.", type: "success" } },
    { id: "h_02_exit", name: "Uscita di Sicurezza Bloccata", position: { top: "40%", left: "15%" }, hitbox_size: { width: "15%", height: "25%" }, points: 150, feedback: { title: "Pericolo Grave!", message: "Le vie di fuga non vanno ostruite.", type: "critical" } },
    { id: "h_03_monitor", name: "Postura Scorretta", position: { top: "50%", left: "70%" }, hitbox_size: { width: "12%", height: "12%" }, points: 50, feedback: { title: "Ergonomia", message: "Il monitor va all'altezza degli occhi.", type: "warning" } },
  ],
};

// ───────────────────── Helpers ─────────────────────
const parsePct = (v: string) => parseFloat(v.replace("%", "")) || 0;
const fmtPct = (n: number) => `${Math.max(0, Math.min(100, Math.round(n * 10) / 10))}%`;

interface Anomaly { id: string; reason: string }
const validateHazards = (hazards: Hazard[]): Anomaly[] => {
  const out: Anomaly[] = [];
  for (const h of hazards) {
    const t = parsePct(h.position.top), l = parsePct(h.position.left);
    const w = parsePct(h.hitbox_size.width), hh = parsePct(h.hitbox_size.height);
    if (l < 0 || t < 0 || l + w > 100.5 || t + hh > 100.5)
      out.push({ id: h.id, reason: `Fuori dai bordi (${l}+${w}%, ${t}+${hh}%)` });
    if (w < 4 || hh < 4) out.push({ id: h.id, reason: `Hitbox troppo piccola (${w}×${hh}%)` });
    if (w > 60 || hh > 70) out.push({ id: h.id, reason: `Hitbox troppo grande (${w}×${hh}%)` });
  }
  return out;
};

// ───────────────────── Modal ─────────────────────
const LevelCompleteModal = ({ score, totalHazards }: { score: number; totalHazards: number }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const duration = 2000, start = performance.now();
    const animate = (now: number) => {
      const t = Math.min(now - start, duration) / duration;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * score));
      setProgress(eased * 100);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 animate-scale-in">
        <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
          <Trophy className="h-12 w-12 text-yellow-500" />
          <Star className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Livello Completato!</h2>
        <p className="text-muted-foreground mb-4">Hai trovato tutti i {totalHazards} rischi.</p>
        <p className="text-4xl font-extrabold text-primary tabular-nums mb-1">{displayScore}</p>
        <p className="text-sm text-muted-foreground mb-4">punti XP</p>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

interface PointAndClickLevelProps { levelData?: LevelData }

const PointAndClickLevel = ({ levelData = DEFAULT_LEVEL }: PointAndClickLevelProps) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [foundHazards, setFoundHazards] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [calibrate, setCalibrate] = useState(false);
  const [preset, setPreset] = useState<DevicePreset>(() => detectPreset());
  const [autoPreset, setAutoPreset] = useState(true);
  const baseHazards = useMemo(
    () => applyOverrides(levelData.hazards, loadOverrides(levelData.level_id, preset)),
    [levelData.hazards, levelData.level_id, preset]
  );
  const [editable, setEditable] = useState<Hazard[]>(baseHazards);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastClicked, setLastClicked] = useState<{ name: string; type: string } | null>(null);

  // Reset editable copy when level or preset changes (loads preset overrides)
  useEffect(() => { setEditable(baseHazards); }, [baseHazards]);

  // Auto-switch preset on resize
  useEffect(() => {
    if (!autoPreset) return;
    const onResize = () => setPreset(detectPreset());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [autoPreset]);

  // Enable calibration via ?calibrate=1
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("calibrate")) {
      setCalibrate(true);
      setShowHitboxes(true);
    }
  }, []);

  const anomalies = useMemo(() => validateHazards(editable), [editable]);

  // Load saved progress
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("point_click_progress")
        .select("found_hazards, score")
        .eq("user_id", user.id).eq("level_id", levelData.level_id).maybeSingle();
      if (data) {
        setFoundHazards(new Set(data.found_hazards ?? []));
        setScore(data.score ?? 0);
      }
    })();
  }, [user, levelData.level_id]);

  const saveProgress = useCallback(async (newFound: Set<string>, newScore: number) => {
    if (!user) return;
    setSaving(true);
    const isCompleted = newFound.size === levelData.total_hazards;
    const { error } = await supabase.from("point_click_progress").upsert({
      user_id: user.id, level_id: levelData.level_id,
      found_hazards: Array.from(newFound), score: newScore,
      completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null,
    }, { onConflict: "user_id,level_id" });
    if (error) console.error("Save error:", error);
    setSaving(false);
  }, [user, levelData.level_id, levelData.total_hazards]);

  const handleHazardClick = useCallback((hazard: Hazard) => {
    if (calibrate) { setSelectedId(hazard.id); return; }
    if (foundHazards.has(hazard.id)) return;
    const newFound = new Set(foundHazards).add(hazard.id);
    const newScore = score + hazard.points;
    setFoundHazards(newFound); setScore(newScore); saveProgress(newFound, newScore);
    setLastClicked({ name: hazard.name, type: hazard.feedback.type });
    const t = hazard.feedback.type === "critical" ? "error" : hazard.feedback.type === "warning" ? "warning" : "success";
    toast[t](`✅ ${hazard.name}`, { description: `${hazard.feedback.title} — ${hazard.feedback.message}`, duration: 5000 });
  }, [foundHazards, score, saveProgress, calibrate]);

  // ───────────────────── Calibration drag/resize ─────────────────────
  const dragRef = useRef<{ id: string; mode: "move" | "resize"; startX: number; startY: number; orig: Hazard } | null>(null);

  const onPointerDown = (e: React.PointerEvent, hazard: Hazard, mode: "move" | "resize") => {
    if (!calibrate) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id: hazard.id, mode, startX: e.clientX, startY: e.clientY, orig: hazard };
    setSelectedId(hazard.id);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - d.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - d.startY) / rect.height) * 100;
    setEditable(prev => prev.map(h => {
      if (h.id !== d.id) return h;
      if (d.mode === "move") {
        return { ...h, position: { left: fmtPct(parsePct(d.orig.position.left) + dxPct), top: fmtPct(parsePct(d.orig.position.top) + dyPct) } };
      }
      return { ...h, hitbox_size: { width: fmtPct(parsePct(d.orig.hitbox_size.width) + dxPct), height: fmtPct(parsePct(d.orig.hitbox_size.height) + dyPct) } };
    }));
  };
  const onPointerUp = () => { dragRef.current = null; };

  const copyJSON = () => {
    const out = editable.map(h => ({ id: h.id, position: h.position, hitbox_size: h.hitbox_size }));
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    toast.success("Coordinate copiate negli appunti");
  };

  const activeHazards = calibrate ? editable : levelData.hazards;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video overflow-hidden rounded-xl border border-border shadow-lg select-none touch-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <img src={levelData.background_image_url} alt={levelData.title} className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* Score */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <span className="font-bold text-foreground text-lg">{score}</span>
        <span className="text-muted-foreground text-sm">({foundHazards.size}/{levelData.total_hazards})</span>
        {saving && <span className="text-xs text-muted-foreground animate-pulse">💾</span>}
      </div>

      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
        <Button variant={showHitboxes ? "default" : "outline"} size="sm" onClick={() => setShowHitboxes(v => !v)} className="bg-background/80 backdrop-blur-sm">
          {showHitboxes ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          {showHitboxes ? "Nascondi" : "Hitbox"}
        </Button>
        <Button variant={calibrate ? "default" : "outline"} size="sm" onClick={() => { setCalibrate(v => !v); setShowHitboxes(true); }} className="bg-background/80 backdrop-blur-sm">
          <Move className="h-4 w-4 mr-1" />{calibrate ? "Esci" : "Calibra"}
        </Button>
        {calibrate && (
          <Button variant="outline" size="sm" onClick={copyJSON} className="bg-background/80 backdrop-blur-sm">
            <Copy className="h-4 w-4 mr-1" />Copia JSON
          </Button>
        )}
      </div>

      {/* Last clicked label */}
      {lastClicked && !calibrate && (
        <div className="absolute bottom-3 left-3 z-20 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border text-sm animate-in fade-in slide-in-from-bottom-2">
          <span className="text-muted-foreground">Ultimo: </span>
          <span className="font-semibold text-foreground">{lastClicked.name}</span>
        </div>
      )}

      {/* Anomalies banner */}
      {calibrate && anomalies.length > 0 && (
        <div className="absolute bottom-3 right-3 z-20 max-w-xs bg-destructive/90 text-destructive-foreground rounded-lg px-3 py-2 text-xs space-y-1 shadow-lg">
          <div className="flex items-center gap-1 font-semibold"><AlertTriangle className="h-3 w-3" />{anomalies.length} anomalie</div>
          {anomalies.slice(0, 3).map(a => (<div key={a.id}>• <b>{a.id}</b>: {a.reason}</div>))}
        </div>
      )}

      {/* Hitboxes */}
      {activeHazards.map((hazard) => {
        const isFound = foundHazards.has(hazard.id);
        const isSelected = calibrate && selectedId === hazard.id;
        const hasAnomaly = anomalies.some(a => a.id === hazard.id);
        return (
          <div
            key={hazard.id}
            onPointerDown={(e) => onPointerDown(e, hazard, "move")}
            className={`absolute transition-colors ${calibrate ? "cursor-move" : "cursor-pointer"} ${
              showHitboxes
                ? hasAnomaly ? "border-2 border-yellow-400 bg-yellow-400/20"
                : isSelected ? "border-2 border-primary bg-primary/30"
                : "border-2 border-red-500 bg-red-500/20"
                : ""
            } ${isFound && !calibrate ? "pointer-events-none" : "hover:bg-white/10"}`}
            style={{ top: hazard.position.top, left: hazard.position.left, width: hazard.hitbox_size.width, height: hazard.hitbox_size.height }}
            onClick={() => handleHazardClick(hazard)}
          >
            {showHitboxes && (
              <div className="absolute -top-5 left-0 text-[10px] bg-background/90 px-1 rounded whitespace-nowrap font-mono">
                {hazard.id}
              </div>
            )}
            {isFound && !calibrate && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300">
                  <Check className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
            {calibrate && (
              <div
                onPointerDown={(e) => onPointerDown(e, hazard, "resize")}
                className="absolute bottom-0 right-0 w-4 h-4 bg-primary border border-background cursor-nwse-resize"
              />
            )}
          </div>
        );
      })}

      {foundHazards.size === levelData.total_hazards && !calibrate && (
        <LevelCompleteModal score={score} totalHazards={levelData.total_hazards} />
      )}
    </div>
  );
};

export default PointAndClickLevel;
