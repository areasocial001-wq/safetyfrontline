import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, Move, Search, AlertCircle, Zap, TrendingUp, Award } from "lucide-react";
import { ScenarioStats } from "@/lib/achievements-db";

interface ContextualHintsProps {
  playerPosition: [number, number, number];
  risksFound: number;
  totalRisks: number;
  isActive: boolean;
  timeElapsed: number;
  scenarioStats: ScenarioStats | null;
  unlockedAchievements: string[];
}

interface Hint {
  id: string;
  icon: typeof Lightbulb;
  title: string;
  message: string;
  color: string;
  priority: number;
}

// Calculate player skill level based on stats
const calculatePlayerLevel = (stats: ScenarioStats | null, achievements: string[]): number => {
  if (!stats || stats.total_plays === 0) return 0; // Beginner
  
  let level = 0;
  
  // Level up based on plays (experience)
  if (stats.total_plays >= 3) level++;
  if (stats.total_plays >= 10) level++;
  
  // Level up based on best score
  if (stats.best_score >= 70) level++;
  if (stats.best_score >= 85) level++;
  
  // Level up based on best time (under 3 minutes = 180s)
  if (stats.best_time && stats.best_time <= 180) level++;
  if (stats.best_time && stats.best_time <= 120) level++;
  
  // Level up based on exploration
  if (stats.max_exploration_percentage && stats.max_exploration_percentage >= 80) level++;
  
  // Level up based on achievements
  if (achievements.length >= 2) level++;
  if (achievements.length >= 5) level++;
  
  return Math.min(level, 4); // Max level 4 (Expert)
};

export const ContextualHints = ({
  playerPosition,
  risksFound,
  totalRisks,
  isActive,
  timeElapsed,
  scenarioStats,
  unlockedAchievements,
}: ContextualHintsProps) => {
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const lastPosition = useRef<[number, number, number]>(playerPosition);
  const lastMovementTime = useRef(Date.now());
  const lastRiskFoundTime = useRef(Date.now());
  const lastRisksFound = useRef(risksFound);
  const shownHints = useRef<Set<string>>(new Set());
  const playerLevel = calculatePlayerLevel(scenarioStats, unlockedAchievements);

  // Basic hints for all levels
  const basicHints: Record<string, Hint> = {
    idle: {
      id: "idle",
      icon: Move,
      title: "Muoviti per esplorare",
      message: "Usa i tasti WASD per muoverti nell'ambiente e cerca i rischi",
      color: "text-blue-400",
      priority: 2,
    },
    noRisksFound: {
      id: "noRisksFound",
      icon: Search,
      title: "Cerca i rischi di sicurezza",
      message: "Guarda intorno con il mouse e clicca sulle sfere colorate per identificare i rischi",
      color: "text-orange-400",
      priority: 3,
    },
    slowProgress: {
      id: "slowProgress",
      icon: Target,
      title: "Usa la mini-mappa",
      message: "Controlla la mini-mappa in basso a destra per individuare i rischi nelle vicinanze",
      color: "text-yellow-400",
      priority: 2,
    },
    criticalRisks: {
      id: "criticalRisks",
      icon: AlertCircle,
      title: "Priorità ai rischi critici",
      message: "I rischi CRITICI (rossi) valgono più punti. Cerca le sfere rosse pulsanti!",
      color: "text-red-400",
      priority: 4,
    },
    nearCompletion: {
      id: "nearCompletion",
      icon: Target,
      title: "Quasi finito!",
      message: `Hai trovato ${risksFound} su ${totalRisks} rischi. Continua così!`,
      color: "text-green-400",
      priority: 1,
    },
  };

  // Progressive advanced hints based on player level
  const advancedHints: Record<string, Hint> = {
    // Level 1: Intermediate strategies
    rapidIdentification: {
      id: "rapidIdentification",
      icon: Zap,
      title: "Combo di Identificazione Rapida",
      message: "Identifica 3+ rischi entro 30 secondi per bonus combo. I rischi vicini danno più punti!",
      color: "text-purple-400",
      priority: 4,
    },
    // Level 2: High score strategies
    scoreOptimization: {
      id: "scoreOptimization",
      icon: TrendingUp,
      title: "Strategia Punteggio Alto",
      message: "Prioritizza rischi CRITICI + Esplora 100% della mappa + Zero collisioni = Punteggio massimo!",
      color: "text-cyan-400",
      priority: 4,
    },
    // Level 3: Speedrun techniques
    speedrunPath: {
      id: "speedrunPath",
      icon: Zap,
      title: "Tecnica Speedrun",
      message: "Percorso ottimale: perimetro esterno → aree centrali. Memorizza posizioni per run future!",
      color: "text-amber-400",
      priority: 4,
    },
    // Level 4: Expert secrets
    expertTechnique: {
      id: "expertTechnique",
      icon: Award,
      title: "Tecnica Esperto",
      message: "Pro tip: guarda la mini-mappa mentre ti muovi. I rischi critici sono sempre in zone pericolose!",
      color: "text-pink-400",
      priority: 5,
    },
  };

  const hints = { ...basicHints };

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceMovement = now - lastMovementTime.current;
      const timeSinceRisk = now - lastRiskFoundTime.current;

      // Check if player moved
      const [x, y, z] = playerPosition;
      const [lastX, lastY, lastZ] = lastPosition.current;
      const distanceMoved = Math.sqrt(
        Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2) + Math.pow(z - lastZ, 2)
      );

      if (distanceMoved > 0.1) {
        lastMovementTime.current = now;
        lastPosition.current = playerPosition;
        // Player is moving, hide hints
        setIsVisible(false);
      }

      // Check if player found a risk
      if (risksFound > lastRisksFound.current) {
        lastRiskFoundTime.current = now;
        lastRisksFound.current = risksFound;
        setIsVisible(false);
      }

      // Determine which hint to show based on context
      let selectedHint: Hint | null = null;
      let maxPriority = 0;

      // Player idle for 10 seconds
      if (timeSinceMovement > 10000 && !shownHints.current.has("idle")) {
        if (hints.idle.priority > maxPriority) {
          selectedHint = hints.idle;
          maxPriority = hints.idle.priority;
        }
      }

      // No risks found in first 20 seconds
      if (timeElapsed > 20 && risksFound === 0 && !shownHints.current.has("noRisksFound")) {
        if (hints.noRisksFound.priority > maxPriority) {
          selectedHint = hints.noRisksFound;
          maxPriority = hints.noRisksFound.priority;
        }
      }

      // Slow progress - more than 30 seconds without finding a risk
      if (timeSinceRisk > 30000 && risksFound < totalRisks && !shownHints.current.has("slowProgress")) {
        if (hints.slowProgress.priority > maxPriority) {
          selectedHint = hints.slowProgress;
          maxPriority = hints.slowProgress.priority;
        }
      }

      // Hint about critical risks after finding 2 risks but none critical
      if (risksFound >= 2 && timeElapsed > 40 && !shownHints.current.has("criticalRisks")) {
        if (hints.criticalRisks.priority > maxPriority) {
          selectedHint = hints.criticalRisks;
          maxPriority = hints.criticalRisks.priority;
        }
      }

      // Near completion
      if (risksFound >= totalRisks * 0.7 && risksFound < totalRisks && !shownHints.current.has("nearCompletion")) {
        if (hints.nearCompletion.priority > maxPriority) {
          selectedHint = {
            ...hints.nearCompletion,
            message: `Hai trovato ${risksFound} su ${totalRisks} rischi. Continua così!`,
          };
          maxPriority = hints.nearCompletion.priority;
        }
      }

      // PROGRESSIVE ADVANCED HINTS (unlock based on player level)
      
      // Level 1+ (Intermediate): Rapid identification combo hint
      if (playerLevel >= 1 && risksFound >= 2 && timeElapsed < 60 && !shownHints.current.has("rapidIdentification")) {
        if (advancedHints.rapidIdentification.priority > maxPriority) {
          selectedHint = advancedHints.rapidIdentification;
          maxPriority = advancedHints.rapidIdentification.priority;
        }
      }

      // Level 2+ (Advanced): Score optimization strategy
      if (playerLevel >= 2 && risksFound >= totalRisks * 0.3 && !shownHints.current.has("scoreOptimization")) {
        if (advancedHints.scoreOptimization.priority > maxPriority) {
          selectedHint = advancedHints.scoreOptimization;
          maxPriority = advancedHints.scoreOptimization.priority;
        }
      }

      // Level 3+ (Pro): Speedrun path technique
      if (playerLevel >= 3 && timeElapsed < 90 && risksFound >= 3 && !shownHints.current.has("speedrunPath")) {
        if (advancedHints.speedrunPath.priority > maxPriority) {
          selectedHint = advancedHints.speedrunPath;
          maxPriority = advancedHints.speedrunPath.priority;
        }
      }

      // Level 4 (Expert): Expert secret technique
      if (playerLevel >= 4 && risksFound >= totalRisks * 0.5 && !shownHints.current.has("expertTechnique")) {
        if (advancedHints.expertTechnique.priority > maxPriority) {
          selectedHint = advancedHints.expertTechnique;
          maxPriority = advancedHints.expertTechnique.priority;
        }
      }

      if (selectedHint) {
        setCurrentHint(selectedHint);
        setIsVisible(true);
        shownHints.current.add(selectedHint.id);

        // Auto-hide after 8 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 8000);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkInterval);
  }, [playerPosition, risksFound, totalRisks, isActive, timeElapsed, playerLevel]);

  if (!currentHint || !isVisible) return null;

  const Icon = currentHint.icon;
  
  // Determine if this is an advanced hint
  const isAdvancedHint = Object.keys(advancedHints).includes(currentHint.id);
  const levelLabels = ["Principiante", "Intermedio", "Avanzato", "Pro", "Esperto"];

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <Card className={`bg-background/95 backdrop-blur-md border-2 p-4 max-w-md shadow-xl ${
        isAdvancedHint ? 'border-primary/80 shadow-primary/20' : 'border-primary/50'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`mt-1 ${currentHint.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2 flex-wrap">
              <Lightbulb className="w-4 h-4 text-yellow-400 animate-pulse" />
              {currentHint.title}
              {isAdvancedHint && playerLevel > 0 && (
                <Badge variant="outline" className="ml-auto text-xs bg-primary/10 border-primary/30">
                  ✨ {levelLabels[playerLevel]}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentHint.message}
            </p>
            {isAdvancedHint && (
              <div className="mt-2 text-xs text-primary/70 flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Suggerimento avanzato sbloccato</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Chiudi suggerimento"
          >
            ✕
          </button>
        </div>
      </Card>
    </div>
  );
};
