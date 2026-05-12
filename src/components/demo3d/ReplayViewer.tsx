import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Trophy, Clock, Target, Shield, Award, Trash2, ArrowLeftRight } from "lucide-react";
import { getUserReplays, downloadReplay, GameReplay, getTopReplays } from "@/lib/replay-db";
import { ALL_SCENARIOS_3D } from "@/data/scenarios3d";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReplayComparison } from "./ReplayComparison";

export const ReplayViewer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<string>(ALL_SCENARIOS_3D[0].id);
  const [replays, setReplays] = useState<GameReplay[]>([]);
  const [topReplays, setTopReplays] = useState<GameReplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReplay, setSelectedReplay] = useState<GameReplay | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonReplay1, setComparisonReplay1] = useState<GameReplay | null>(null);
  const [comparisonReplay2, setComparisonReplay2] = useState<GameReplay | null>(null);

  useEffect(() => {
    loadReplays();
    loadTopReplays();
  }, [selectedScenario, user]);

  const loadReplays = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const data = await getUserReplays(selectedScenario);
    setReplays(data);
    setIsLoading(false);
  };

  const loadTopReplays = async () => {
    setIsLoading(true);
    const data = await getTopReplays(selectedScenario, 10);
    setTopReplays(data);
    setIsLoading(false);
  };

  const handleStartComparison = (replay: GameReplay) => {
    if (!comparisonReplay1) {
      setComparisonReplay1(replay);
      toast({
        title: "Primo replay selezionato",
        description: "Seleziona un secondo replay per confrontare",
      });
    } else if (!comparisonReplay2 && replay.id !== comparisonReplay1.id) {
      setComparisonReplay2(replay);
      setComparisonMode(true);
      toast({
        title: "Confronto pronto",
        description: "Visualizzazione comparativa dei replay",
      });
    } else {
      toast({
        title: "Replay già selezionato",
        description: "Scegli un replay diverso",
        variant: "destructive",
      });
    }
  };

  const handleResetComparison = () => {
    setComparisonMode(false);
    setComparisonReplay1(null);
    setComparisonReplay2(null);
  };

  const handleDownload = async (replay: GameReplay) => {
    try {
      const filename = `replay_${replay.scenario_id}_${replay.score}_${new Date(replay.created_at).toISOString().split('T')[0]}.mp4`;
      await downloadReplay(replay.video_url, filename);
      toast({
        title: "Download avviato",
        description: "Il replay è in download...",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile scaricare il replay",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (replay: GameReplay) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('game_replays')
        .delete()
        .eq('id', replay.id);

      if (error) throw error;

      // Delete from storage
      const filename = replay.video_url.split('/').pop();
      if (filename && user) {
        await supabase.storage
          .from('game-replays')
          .remove([`${user.id}/${filename}`]);
      }

      toast({
        title: "Replay eliminato",
        description: "Il replay è stato rimosso",
      });

      loadReplays();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il replay",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedScenarioData = ALL_SCENARIOS_3D.find(s => s.id === selectedScenario);

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Devi essere autenticato per visualizzare i replay</p>
      </Card>
    );
  }

  // Comparison Mode View
  if (comparisonMode && comparisonReplay1 && comparisonReplay2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
            Confronto Replay
          </h2>
          <Button variant="outline" onClick={handleResetComparison}>
            Chiudi Confronto
          </Button>
        </div>

        <ReplayComparison
          replay1={comparisonReplay1}
          replay2={comparisonReplay2}
          userName1={comparisonReplay1.user_id === user.id ? "Tu" : undefined}
          userName2={comparisonReplay2.user_id === user.id ? "Tu" : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Play className="w-6 h-6 text-primary" />
            I Tuoi Replay
          </h2>
          <p className="text-muted-foreground">
            {comparisonReplay1 ? 'Seleziona un secondo replay per confrontare' : 'Top 5 performance registrate'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {comparisonReplay1 && !comparisonReplay2 && (
            <Button variant="outline" onClick={handleResetComparison}>
              Annulla Confronto
            </Button>
          )}
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

      {selectedReplay && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Visualizzazione Replay</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedReplay(null)}>
                Chiudi
              </Button>
            </div>
            <video 
              src={selectedReplay.video_url} 
              controls 
              className="w-full rounded-lg border"
              style={{ maxHeight: '70vh' }}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <Clock className="w-5 h-5 text-primary mb-1" />
                <p className="text-sm text-muted-foreground">Tempo</p>
                <p className="text-lg font-bold">{formatTime(selectedReplay.time_elapsed)}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <Target className="w-5 h-5 text-primary mb-1" />
                <p className="text-sm text-muted-foreground">Punti</p>
                <p className="text-lg font-bold">{selectedReplay.score}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <Shield className="w-5 h-5 text-primary mb-1" />
                <p className="text-sm text-muted-foreground">Collisioni</p>
                <p className="text-lg font-bold">{selectedReplay.collisions}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <Award className="w-5 h-5 text-primary mb-1" />
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-lg font-bold">{selectedReplay.achievements_unlocked.length}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!selectedReplay && (
        <Tabs defaultValue="yours" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="yours">I Tuoi Replay</TabsTrigger>
            <TabsTrigger value="top">Top Giocatori</TabsTrigger>
          </TabsList>

          <TabsContent value="yours" className="mt-6">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : replays.length === 0 ? (
                <Card className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-muted-foreground mb-2">
                    Nessun replay disponibile
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completa lo scenario battendo il tuo record personale per registrare un replay!
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {replays.map((replay, index) => (
                    <Card 
                      key={replay.id}
                      className={`p-4 transition-all hover:shadow-lg ${
                        replay.is_personal_record ? 'border-primary/40 bg-primary/5' : ''
                      } ${
                        comparisonReplay1?.id === replay.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">#{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Punti</p>
                              <p className="font-bold">{replay.score}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Tempo</p>
                              <p className="font-bold">{formatTime(replay.time_elapsed)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Collisioni</p>
                              <p className="font-bold">{replay.collisions}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Achievements</p>
                              <p className="font-bold">{replay.achievements_unlocked.length}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                          {replay.is_personal_record && (
                            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                              <Trophy className="w-3 h-3 mr-1" />
                              Record
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReplay(replay)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Riproduci
                          </Button>
                          <Button
                            size="sm"
                            variant={comparisonReplay1?.id === replay.id ? "default" : "ghost"}
                            onClick={() => handleStartComparison(replay)}
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(replay)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(replay)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="top" className="mt-6">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : topReplays.length === 0 ? (
                <Card className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-muted-foreground mb-2">
                    Nessun replay top disponibile
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sii il primo a completare questo scenario!
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {topReplays.map((replay, index) => (
                    <Card 
                      key={replay.id}
                      className={`p-4 transition-all hover:shadow-lg ${
                        replay.user_id === user.id ? 'border-primary/40 bg-primary/5' : ''
                      } ${
                        comparisonReplay1?.id === replay.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">#{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Punti</p>
                              <p className="font-bold">{replay.score}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Tempo</p>
                              <p className="font-bold">{formatTime(replay.time_elapsed)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Collisioni</p>
                              <p className="font-bold">{replay.collisions}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Achievements</p>
                              <p className="font-bold">{replay.achievements_unlocked.length}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                          {replay.user_id === user.id && (
                            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                              Tu
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReplay(replay)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Riproduci
                          </Button>
                          <Button
                            size="sm"
                            variant={comparisonReplay1?.id === replay.id ? "default" : "ghost"}
                            onClick={() => handleStartComparison(replay)}
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
