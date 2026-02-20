import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { scenarios } from "@/data/scenarios";
import { GameSession, Scenario } from "@/types/demo";
import { GameScene } from "@/components/demo/GameScene";
import { GameResults } from "@/components/demo/GameResults";
import { ArrowLeft, Play, Shield, Home, ChevronRight, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { UserMenu } from "@/components/auth/UserMenu";

const Demo = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<'select' | 'playing' | 'results'>('select');
  const [completionTime, setCompletionTime] = useState(0);

  const startGame = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setGameSession({
      scenario,
      startTime: Date.now(),
      risksFound: [],
      score: 0,
      completed: false
    });
    setGameState('playing');
  }, []);

  const handleRiskFound = useCallback((riskId: string) => {
    setGameSession(prev => {
      if (!prev) return null;
      
      const risk = prev.scenario.risks.find(r => r.id === riskId);
      if (!risk || prev.risksFound.includes(riskId)) return prev;

      return {
        ...prev,
        risksFound: [...prev.risksFound, riskId],
        score: prev.score + risk.points
      };
    });
  }, []);

  const handleGameComplete = useCallback(() => {
    if (!gameSession) return;
    
    const elapsed = Math.floor((Date.now() - gameSession.startTime) / 1000);
    setCompletionTime(elapsed);
    setGameState('results');
  }, [gameSession]);

  const handleRestart = useCallback(() => {
    if (selectedScenario) {
      startGame(selectedScenario);
    }
  }, [selectedScenario, startGame]);

  const handleChangeScenario = useCallback(() => {
    setSelectedScenario(null);
    setGameSession(null);
    setGameState('select');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">SicurAzienda</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4" />
                  Torna alla Home
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
          
          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1.5 font-semibold text-primary">
                  <Target className="w-4 h-4" />
                  <span>Demo Interattiva</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {gameState === 'select' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                <Play className="w-4 h-4" />
                <span className="text-sm font-semibold">Demo Interattiva</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Prova <span className="text-primary">Safety Frontline</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Metti alla prova le tue capacità di identificare rischi sul lavoro. 
                Scegli uno scenario e inizia a giocare!
              </p>
            </div>

            {/* Scenario Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              {scenarios.map((scenario, index) => (
                <Card 
                  key={scenario.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={scenario.imageUrl}
                      alt={scenario.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-foreground mb-1">{scenario.title}</h3>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        ⏱️ Tempo limite: <strong>{scenario.timeLimit}s</strong>
                      </span>
                      <span className="text-muted-foreground">
                        🎯 Rischi: <strong>{scenario.risks.length}</strong>
                      </span>
                    </div>
                    <Button
                      onClick={() => startGame(scenario)}
                      variant="hero"
                      size="lg"
                      className="w-full"
                    >
                      <Play className="w-5 h-5" />
                      Inizia Scenario
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <Card className="mt-12 p-6 bg-muted/30">
              <h3 className="text-xl font-bold mb-4">Come Giocare</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Osserva la Scena</h4>
                  <p className="text-sm text-muted-foreground">
                    Analizza attentamente l'ambiente di lavoro alla ricerca di pericoli
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-secondary">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Clicca sui Rischi</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifica e clicca sui rischi presenti per guadagnare punti
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-accent">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Completa in Tempo</h4>
                  <p className="text-sm text-muted-foreground">
                    Trova tutti i rischi prima che scada il tempo per il massimo punteggio
                  </p>
                </div>
              </div>
              
              {/* 3D Demo Link */}
              <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">🎮 Prova la Demo 3D in Prima Persona!</h4>
                    <p className="text-sm text-muted-foreground">
                      Esplora un ambiente 3D immersivo stile Doom con controlli FPS
                    </p>
                  </div>
                  <Link to="/demo-3d">
                    <Button variant="hero" size="lg">
                      Demo 3D
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {gameState === 'playing' && gameSession && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 text-center animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">{gameSession.scenario.title}</h2>
              <p className="text-muted-foreground">{gameSession.scenario.description}</p>
            </div>
            <GameScene
              session={gameSession}
              onRiskFound={handleRiskFound}
              onComplete={handleGameComplete}
              onTimeUp={handleGameComplete}
            />
          </div>
        )}

        {gameState === 'results' && gameSession && (
          <GameResults
            session={gameSession}
            completionTime={completionTime}
            onRestart={handleRestart}
            onChangeScenario={handleChangeScenario}
          />
        )}
      </main>
    </div>
  );
};

export default Demo;
