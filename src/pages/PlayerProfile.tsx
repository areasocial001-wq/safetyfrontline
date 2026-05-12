import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Award,
  Play,
  Calendar,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/auth/UserMenu";
import { AchievementBadge } from "@/components/demo3d/AchievementBadge";
import { achievements } from "@/lib/achievements";
import {
  loadUserAchievements,
  getAllScenarioStats,
  ScenarioStats,
} from "@/lib/achievements-db";
import { getUserReplays, GameReplay } from "@/lib/replay-db";
import { ALL_SCENARIOS_3D } from "@/data/scenarios3d";
import { toast } from "@/hooks/use-toast";

interface LevelInfo {
  level: number;
  label: string;
  color: string;
  bgColor: string;
  xpProgress: number;
  xpCurrent: number;
  xpRequired: number;
}

// Calculate player level and XP (same logic as PlayerLevelIndicator)
const calculateLevelInfo = (
  allStats: ScenarioStats[],
  achievementCount: number
): LevelInfo => {
  if (allStats.length === 0) {
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

  // Aggregate XP from all scenarios
  allStats.forEach((stats) => {
    xp += Math.min(stats.total_plays * 10, 200);
    xp += Math.min(stats.best_score, 100);

    if (stats.best_time) {
      if (stats.best_time <= 60) xp += 100;
      else if (stats.best_time <= 120) xp += 50;
      else if (stats.best_time <= 180) xp += 25;
    }

    if (stats.max_exploration_percentage) {
      xp += stats.max_exploration_percentage;
    }

    if (stats.min_collisions !== null) {
      if (stats.min_collisions === 0) xp += 50;
      else xp -= Math.min(stats.min_collisions * 2, 20);
    }
  });

  xp += achievementCount * 30;
  xp = Math.max(0, xp);

  const levels = [
    { threshold: 0, label: "Principiante", color: "text-gray-400", bgColor: "bg-gray-400/20" },
    { threshold: 100, label: "Intermedio", color: "text-blue-400", bgColor: "bg-blue-400/20" },
    { threshold: 250, label: "Avanzato", color: "text-purple-400", bgColor: "bg-purple-400/20" },
    { threshold: 450, label: "Pro", color: "text-amber-400", bgColor: "bg-amber-400/20" },
    { threshold: 700, label: "Esperto", color: "text-pink-400", bgColor: "bg-pink-400/20" },
  ];

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }

  const currentThreshold = levels[currentLevel].threshold;
  const nextThreshold =
    currentLevel < levels.length - 1 ? levels[currentLevel + 1].threshold : currentThreshold;

  const xpInCurrentLevel = xp - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progress =
    currentLevel === levels.length - 1 ? 100 : (xpInCurrentLevel / xpNeededForNext) * 100;

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

export default function PlayerProfile() {
  const { user } = useAuth();
  const [allStats, setAllStats] = useState<ScenarioStats[]>([]);
  const [allAchievements, setAllAchievements] = useState<string[]>([]);
  const [bestReplays, setBestReplays] = useState<GameReplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() =>
    calculateLevelInfo([], 0)
  );

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Load all scenario stats
        const stats = await getAllScenarioStats();
        setAllStats(stats);

        // Load all achievements from all scenarios
        const achievementPromises = scenarios3D.map((scenario) =>
          loadUserAchievements(scenario.id)
        );
        const achievementArrays = await Promise.all(achievementPromises);
        const uniqueAchievements = Array.from(new Set(achievementArrays.flat()));
        setAllAchievements(uniqueAchievements);

        // Load best replays from all scenarios
        const replayPromises = scenarios3D.map((scenario) =>
          getUserReplays(scenario.id).catch(() => [])
        );
        const replayArrays = await Promise.all(replayPromises);
        const allReplays = replayArrays.flat().sort((a, b) => b.score - a.score);
        setBestReplays(allReplays.slice(0, 5)); // Top 5 replays

        // Calculate level
        const level = calculateLevelInfo(stats, uniqueAchievements.length);
        setLevelInfo(level);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati del profilo",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Accesso Richiesto</h2>
          <p className="text-muted-foreground mb-6">
            Devi effettuare l'accesso per visualizzare il profilo giocatore
          </p>
          <Button asChild>
            <Link to="/auth">Accedi</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const totalPlays = allStats.reduce((sum, stat) => sum + stat.total_plays, 0);
  const avgScore =
    allStats.length > 0
      ? Math.round(
          allStats.reduce((sum, stat) => sum + stat.best_score, 0) / allStats.length
        )
      : 0;
  const bestTime = allStats.reduce(
    (min, stat) =>
      stat.best_time && stat.best_time < min ? stat.best_time : min,
    Infinity
  );
  const perfectRuns = allStats.filter((stat) => stat.min_collisions === 0).length;

  const isMaxLevel = levelInfo.level === 4;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Profilo Giocatore</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Caricamento profilo...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarFallback className="text-4xl font-bold bg-primary/10">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black mb-2">{user.email}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    <Badge
                      variant="outline"
                      className={`text-sm px-3 py-1 ${levelInfo.bgColor} ${levelInfo.color} border-current`}
                    >
                      <Star className="w-4 h-4 mr-1" fill="currentColor" />
                      {levelInfo.label} • Livello {levelInfo.level}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      <Trophy className="w-4 h-4 mr-1" />
                      {allAchievements.length} Achievements
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      <Target className="w-4 h-4 mr-1" />
                      {totalPlays} Partite
                    </Badge>
                  </div>

                  {/* XP Progress */}
                  <div className="max-w-md mx-auto md:mx-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">
                        {isMaxLevel ? "Livello Massimo" : "Progresso XP"}
                      </span>
                      {!isMaxLevel && (
                        <span className="text-sm text-muted-foreground">
                          {levelInfo.xpCurrent} / {levelInfo.xpRequired} XP
                        </span>
                      )}
                    </div>
                    <Progress value={levelInfo.xpProgress} className="h-3" />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 text-center bg-primary/5">
                    <div className="text-2xl font-black text-primary">{avgScore}</div>
                    <div className="text-xs text-muted-foreground">Punteggio Medio</div>
                  </Card>
                  <Card className="p-4 text-center bg-accent/5">
                    <div className="text-2xl font-black text-accent">{perfectRuns}</div>
                    <div className="text-xs text-muted-foreground">Run Perfette</div>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                <TabsTrigger value="overview">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Panoramica
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <Trophy className="w-4 h-4 mr-2" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="replays">
                  <Play className="w-4 h-4 mr-2" />
                  Replay
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Calendar className="w-4 h-4 mr-2" />
                  Cronologia
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Partite Totali</p>
                        <p className="text-2xl font-black">{totalPlays}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Award className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Punteggio Medio</p>
                        <p className="text-2xl font-black">{avgScore}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Miglior Tempo</p>
                        <p className="text-2xl font-black">
                          {bestTime === Infinity
                            ? "--"
                            : `${Math.floor(bestTime / 60)}:${(bestTime % 60)
                                .toString()
                                .padStart(2, "0")}`}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Run Perfette</p>
                        <p className="text-2xl font-black">{perfectRuns}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Scenario Stats */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Statistiche per Scenario
                  </h3>
                  <div className="space-y-4">
                    {allStats.map((stat) => {
                      const scenario = scenarios3D.find((s) => s.id === stat.scenario_id);
                      if (!scenario) return null;

                      return (
                        <div key={stat.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div>
                            <h4 className="font-bold">{scenario.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stat.total_plays} partite • Miglior: {stat.best_score} punti
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {stat.min_collisions === 0 && (
                              <Badge variant="outline" className="bg-green-500/10">
                                🏆 Perfetto
                              </Badge>
                            )}
                            {stat.max_exploration_percentage === 100 && (
                              <Badge variant="outline" className="bg-blue-500/10">
                                🗺️ 100%
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Tutti gli Achievements</h3>
                    <Badge variant="outline">
                      {allAchievements.length} / {achievements.length}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {achievements.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={allAchievements.includes(achievement.id)}
                      />
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Replays Tab */}
              <TabsContent value="replays" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Top 5 Replay Migliori</h3>
                  {bestReplays.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nessun replay disponibile. Completa alcuni scenari per sbloccare i replay!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {bestReplays.map((replay, index) => {
                        const scenario = scenarios3D.find((s) => s.id === replay.scenario_id);
                        return (
                          <div
                            key={replay.id}
                            className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                          >
                            <div className="text-2xl font-black text-primary w-8">
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold">{scenario?.title || "Scenario Sconosciuto"}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{replay.score} punti</span>
                                <span>
                                  {Math.floor(replay.time_elapsed / 60)}:
                                  {(replay.time_elapsed % 60).toString().padStart(2, "0")}
                                </span>
                                <span>{replay.collisions} collisioni</span>
                              </div>
                            </div>
                            {replay.is_personal_record && (
                              <Badge variant="outline" className="bg-primary/10">
                                🏆 Record Personale
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Cronologia Progressione</h3>
                  <div className="space-y-4">
                    {allAchievements.length === 0 && allStats.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nessuna attività registrata. Inizia a giocare per vedere la tua cronologia!
                      </p>
                    ) : (
                      <div className="relative border-l-2 border-primary/30 pl-6 space-y-6">
                        {/* Recent achievements */}
                        {allAchievements.slice(0, 5).map((achievementId, index) => {
                          const achievement = achievements.find((a) => a.id === achievementId);
                          if (!achievement) return null;
                          const Icon = achievement.icon;

                          return (
                            <div key={index} className="relative">
                              <div className="absolute -left-[1.875rem] w-3 h-3 rounded-full bg-primary border-2 border-background" />
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold">{achievement.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {achievement.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Best scores per scenario */}
                        {allStats.slice(0, 5).map((stat, index) => {
                          const scenario = scenarios3D.find((s) => s.id === stat.scenario_id);
                          if (!scenario) return null;

                          return (
                            <div key={`stat-${index}`} className="relative">
                              <div className="absolute -left-[1.875rem] w-3 h-3 rounded-full bg-accent border-2 border-background" />
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-accent/10 rounded-lg">
                                  <Trophy className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold">{scenario.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Miglior punteggio: {stat.best_score} punti • {stat.total_plays}{" "}
                                    partite
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
