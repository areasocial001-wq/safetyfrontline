import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp } from "lucide-react";
import { ScenarioStats } from "@/lib/achievements-db";

interface PlayerLevelIndicatorProps {
  scenarioStats: ScenarioStats | null;
  unlockedAchievements: string[];
}

interface LevelInfo {
  level: number;
  label: string;
  color: string;
  bgColor: string;
  xpProgress: number; // 0-100 percentage to next level
  xpCurrent: number;
  xpRequired: number;
}

// Calculate player level and XP progress
const calculateLevelInfo = (
  stats: ScenarioStats | null,
  achievements: string[]
): LevelInfo => {
  if (!stats || stats.total_plays === 0) {
    return {
      level: 0,
      label: "Principiante",
      color: "text-gray-400",
      bgColor: "bg-gray-400/20",
      xpProgress: 0,
      xpCurrent: 0,
      xpRequired: 100,
    };
  }

  let xp = 0;

  // XP from plays (10 XP per play, max 200 XP)
  xp += Math.min(stats.total_plays * 10, 200);

  // XP from best score (score directly as XP, max 100 XP)
  xp += Math.min(stats.best_score, 100);

  // XP from time (bonus for fast completion)
  if (stats.best_time) {
    if (stats.best_time <= 60) xp += 100; // Under 1 minute
    else if (stats.best_time <= 120) xp += 50; // Under 2 minutes
    else if (stats.best_time <= 180) xp += 25; // Under 3 minutes
  }

  // XP from exploration (max 100 XP)
  if (stats.max_exploration_percentage) {
    xp += stats.max_exploration_percentage;
  }

  // XP from collisions (penalty and bonus)
  if (stats.min_collisions !== null) {
    if (stats.min_collisions === 0) xp += 50; // Perfect run bonus
    else xp -= Math.min(stats.min_collisions * 2, 20); // Penalty
  }

  // XP from achievements (30 XP per achievement)
  xp += achievements.length * 30;

  // Ensure XP is not negative
  xp = Math.max(0, xp);

  // Level thresholds
  const levels = [
    { threshold: 0, label: "Principiante", color: "text-gray-400", bgColor: "bg-gray-400/20" },
    { threshold: 100, label: "Intermedio", color: "text-blue-400", bgColor: "bg-blue-400/20" },
    { threshold: 250, label: "Avanzato", color: "text-purple-400", bgColor: "bg-purple-400/20" },
    { threshold: 450, label: "Pro", color: "text-amber-400", bgColor: "bg-amber-400/20" },
    { threshold: 700, label: "Esperto", color: "text-pink-400", bgColor: "bg-pink-400/20" },
  ];

  // Determine current level
  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }

  const currentThreshold = levels[currentLevel].threshold;
  const nextThreshold = currentLevel < levels.length - 1 
    ? levels[currentLevel + 1].threshold 
    : currentThreshold;

  const xpInCurrentLevel = xp - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progress = currentLevel === levels.length - 1 
    ? 100 // Max level
    : (xpInCurrentLevel / xpNeededForNext) * 100;

  return {
    level: currentLevel,
    label: levels[currentLevel].label,
    color: levels[currentLevel].color,
    bgColor: levels[currentLevel].bgColor,
    xpProgress: Math.min(progress, 100),
    xpCurrent: xp,
    xpRequired: nextThreshold,
  };
};

export const PlayerLevelIndicator = ({
  scenarioStats,
  unlockedAchievements,
}: PlayerLevelIndicatorProps) => {
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() =>
    calculateLevelInfo(scenarioStats, unlockedAchievements)
  );
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const newLevelInfo = calculateLevelInfo(scenarioStats, unlockedAchievements);
    
    // Check for level up
    if (newLevelInfo.level > levelInfo.level) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    
    setLevelInfo(newLevelInfo);
  }, [scenarioStats, unlockedAchievements]);

  const isMaxLevel = levelInfo.level === 4;

  return (
    <>
      {/* Level indicator */}
      <div className="absolute top-4 left-4 z-30">
        <Card className="bg-background/90 backdrop-blur-sm border border-primary/30 p-3 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className={`relative ${levelInfo.bgColor} rounded-full p-2`}>
              <Star className={`w-5 h-5 ${levelInfo.color}`} fill="currentColor" />
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {levelInfo.level}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${levelInfo.color}`}>
                  {levelInfo.label}
                </span>
                {!isMaxLevel && (
                  <span className="text-xs text-muted-foreground">
                    {levelInfo.xpCurrent} / {levelInfo.xpRequired} XP
                  </span>
                )}
              </div>
              
              {!isMaxLevel ? (
                <Progress value={levelInfo.xpProgress} className="h-2" />
              ) : (
                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/50">
                  <Star className="w-3 h-3 mr-1" />
                  Livello Massimo
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Level up animation */}
      {showLevelUp && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in-50 fade-in duration-500">
          <Card className="bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-md border-2 border-primary p-6 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                <Star className="w-16 h-16 text-primary-foreground animate-pulse" fill="currentColor" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-primary-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  LEVEL UP!
                </h3>
                <p className="text-lg font-bold text-primary-foreground/90">
                  {levelInfo.label}
                </p>
                <p className="text-sm text-primary-foreground/70 mt-1">
                  Livello {levelInfo.level} raggiunto!
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
