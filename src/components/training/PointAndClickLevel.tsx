import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  description: "Sembra un normale ufficio amministrativo, ma nasconde delle insidie. Trova i 3 rischi per la sicurezza.",
  background_image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
  total_hazards: 3,
  intro_dialogue: {
    speaker: "RSPP Virtuale",
    text: "Benvenuto, Ispettore. Hai 60 secondi per individuare le violazioni in questa stanza. Clicca sui punti sospetti!",
  },
  hazards: [
    {
      id: "h_01_cable",
      name: "Cavo Elettrico Volante",
      position: { top: "85%", left: "40%" },
      hitbox_size: { width: "10%", height: "10%" },
      points: 100,
      feedback: { title: "Ottimo occhio!", message: "I cavi a terra sono la prima causa di inciampo negli uffici. Vanno fissati con canaline.", type: "success" },
    },
    {
      id: "h_02_exit",
      name: "Uscita di Sicurezza Bloccata",
      position: { top: "40%", left: "15%" },
      hitbox_size: { width: "15%", height: "25%" },
      points: 150,
      feedback: { title: "Pericolo Grave!", message: "Le vie di fuga non devono MAI essere ostruite da scatoloni o arredi, nemmeno temporaneamente.", type: "critical" },
    },
    {
      id: "h_03_monitor",
      name: "Postura Scorretta (Monitor)",
      position: { top: "50%", left: "70%" },
      hitbox_size: { width: "12%", height: "12%" },
      points: 50,
      feedback: { title: "Rischio Ergonomico", message: "Il monitor è troppo basso. Il bordo superiore dovrebbe essere all'altezza degli occhi.", type: "warning" },
    },
  ],
};

// Animated XP counter + progress bar modal
const LevelCompleteModal = ({ score, totalHazards }: { score: number; totalHazards: number }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = Math.min(now - start, duration);
      const t = elapsed / duration;
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * score));
      setProgress(eased * 100);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 animate-scale-in">
        <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
          <Trophy className="h-12 w-12 text-yellow-500 animate-fade-in" />
          <Star className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Livello Completato!</h2>
        <p className="text-muted-foreground mb-4">
          Hai trovato tutti i {totalHazards} rischi.
        </p>
        {/* Animated XP counter */}
        <p className="text-4xl font-extrabold text-primary tabular-nums mb-1">
          {displayScore}
        </p>
        <p className="text-sm text-muted-foreground mb-4">punti XP</p>
        {/* Progress bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface PointAndClickLevelProps {
  levelData?: LevelData;
}

const PointAndClickLevel = ({ levelData = DEFAULT_LEVEL }: PointAndClickLevelProps) => {
  const { user } = useAuth();
  const [foundHazards, setFoundHazards] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved progress
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("point_click_progress")
        .select("found_hazards, score")
        .eq("user_id", user.id)
        .eq("level_id", levelData.level_id)
        .maybeSingle();
      if (data) {
        setFoundHazards(new Set(data.found_hazards ?? []));
        setScore(data.score ?? 0);
      }
    };
    load();
  }, [user, levelData.level_id]);

  // Save progress to DB
  const saveProgress = useCallback(async (newFound: Set<string>, newScore: number) => {
    if (!user) return;
    setSaving(true);
    const isCompleted = newFound.size === levelData.total_hazards;
    const { error } = await supabase
      .from("point_click_progress")
      .upsert({
        user_id: user.id,
        level_id: levelData.level_id,
        found_hazards: Array.from(newFound),
        score: newScore,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }, { onConflict: "user_id,level_id" });

    if (error) console.error("Save error:", error);
    setSaving(false);
  }, [user, levelData.level_id, levelData.total_hazards]);

  const handleHazardClick = useCallback((hazard: Hazard) => {
    if (foundHazards.has(hazard.id)) return;

    const newFound = new Set(foundHazards).add(hazard.id);
    const newScore = score + hazard.points;
    setFoundHazards(newFound);
    setScore(newScore);
    saveProgress(newFound, newScore);

    const toastType = hazard.feedback.type === "critical" ? "error" : hazard.feedback.type === "warning" ? "warning" : "success";
    toast[toastType](hazard.feedback.title, {
      description: hazard.feedback.message,
      duration: 5000,
    });
  }, [foundHazards, score, saveProgress]);

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-border shadow-lg select-none">
      <img
        src={levelData.background_image_url}
        alt={levelData.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Score */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <span className="font-bold text-foreground text-lg">{score}</span>
        <span className="text-muted-foreground text-sm">({foundHazards.size}/{levelData.total_hazards})</span>
        {saving && <span className="text-xs text-muted-foreground animate-pulse">💾</span>}
      </div>

      {/* Debug toggle */}
      <div className="absolute top-3 left-3 z-20">
        <Button variant={showHitboxes ? "default" : "outline"} size="sm" onClick={() => setShowHitboxes((v) => !v)} className="bg-background/80 backdrop-blur-sm">
          {showHitboxes ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          {showHitboxes ? "Nascondi Hitbox" : "Mostra Hitbox"}
        </Button>
      </div>

      {/* Hitboxes */}
      {levelData.hazards.map((hazard) => {
        const isFound = foundHazards.has(hazard.id);
        return (
          <div
            key={hazard.id}
            className={`absolute cursor-pointer transition-all duration-200 ${showHitboxes ? "border-2 border-red-500 bg-red-500/20" : ""} ${isFound ? "pointer-events-none" : "hover:bg-white/10"}`}
            style={{ top: hazard.position.top, left: hazard.position.left, width: hazard.hitbox_size.width, height: hazard.hitbox_size.height }}
            onClick={() => handleHazardClick(hazard)}
          >
            {isFound && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300">
                  <Check className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Completion overlay */}
      {foundHazards.size === levelData.total_hazards && (
        <LevelCompleteModal score={score} totalHazards={levelData.total_hazards} />
      )}
    </div>
  );
};

export default PointAndClickLevel;
