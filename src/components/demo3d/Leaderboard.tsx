import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Clock, Target, Shield, TrendingUp } from "lucide-react";
import { getLeaderboard, getUserRank, LeaderboardEntry, LeaderboardCategory } from "@/lib/leaderboard-db";
import { ALL_SCENARIOS_3D } from "@/data/scenarios3d";
import { useAuth } from "@/hooks/useAuth";

export const Leaderboard = () => {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<string>(ALL_SCENARIOS_3D[0].id);
  const [timeLeaderboard, setTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [scoreLeaderboard, setScoreLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [collisionsLeaderboard, setCollisionsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRanks, setUserRanks] = useState<{ time: number | null; score: number | null; collisions: number | null }>({
    time: null,
    score: null,
    collisions: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLeaderboards();
  }, [selectedScenario, user]);

  const loadLeaderboards = async () => {
    setIsLoading(true);
    
    const [time, score, collisions] = await Promise.all([
      getLeaderboard(selectedScenario, 'time'),
      getLeaderboard(selectedScenario, 'score'),
      getLeaderboard(selectedScenario, 'collisions'),
    ]);

    setTimeLeaderboard(time);
    setScoreLeaderboard(score);
    setCollisionsLeaderboard(collisions);

    if (user) {
      const [timeRank, scoreRank, collisionsRank] = await Promise.all([
        getUserRank(selectedScenario, 'time'),
        getUserRank(selectedScenario, 'score'),
        getUserRank(selectedScenario, 'collisions'),
      ]);

      setUserRanks({
        time: timeRank,
        score: scoreRank,
        collisions: collisionsRank,
      });
    }

    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  const renderLeaderboardTable = (
    entries: LeaderboardEntry[],
    category: LeaderboardCategory,
    icon: React.ReactNode,
    valueFormatter: (value: number) => string,
    userRank: number | null
  ) => {
    return (
      <div className="space-y-4">
        {user && userRank && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">La Tua Posizione</p>
                  <p className="text-lg font-bold">#{userRank}</p>
                </div>
              </div>
              {icon}
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessun dato disponibile per questo scenario</p>
            <p className="text-sm text-muted-foreground mt-2">Sii il primo a completarlo!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card 
                key={`${entry.user_id}-${entry.rank}`}
                className={`p-4 transition-all ${
                  entry.is_current_user 
                    ? 'bg-primary/10 border-primary/40 shadow-md' 
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 flex items-center justify-center">
                      {getRankBadge(entry.rank)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${entry.is_current_user ? 'text-primary' : ''}`}>
                        {entry.user_name}
                        {entry.is_current_user && (
                          <Badge variant="outline" className="ml-2 text-xs">Tu</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{valueFormatter(entry.value)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const selectedScenarioData = ALL_SCENARIOS_3D.find(s => s.id === selectedScenario);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Classifica Globale
          </h2>
          <p className="text-muted-foreground">Top 10 giocatori per scenario</p>
        </div>
        
        <Select value={selectedScenario} onValueChange={setSelectedScenario}>
          <SelectTrigger className="w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_SCENARIOS_3D.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {scenario.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedScenarioData && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">
              {selectedScenarioData.difficulty === 'easy' && 'Facile'}
              {selectedScenarioData.difficulty === 'medium' && 'Medio'}
              {selectedScenarioData.difficulty === 'hard' && 'Difficile'}
            </Badge>
            <span className="text-muted-foreground">
              {selectedScenarioData.risks.length} rischi
            </span>
          </div>
        </Card>
      )}

      <Tabs defaultValue="score" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="score" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Punteggio
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tempo
          </TabsTrigger>
          <TabsTrigger value="collisions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Zero Collisioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="mt-6">
          {renderLeaderboardTable(
            scoreLeaderboard,
            'score',
            <Target className="w-6 h-6 text-primary" />,
            (value) => value.toString(),
            userRanks.score
          )}
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          {renderLeaderboardTable(
            timeLeaderboard,
            'time',
            <Clock className="w-6 h-6 text-primary" />,
            formatTime,
            userRanks.time
          )}
        </TabsContent>

        <TabsContent value="collisions" className="mt-6">
          {renderLeaderboardTable(
            collisionsLeaderboard,
            'collisions',
            <Shield className="w-6 h-6 text-primary" />,
            (value) => value.toString(),
            userRanks.collisions
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
