import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Target, Zap, Play, Sparkles, Flame, ShieldAlert, Users, Bot } from "lucide-react";
import heroGameImage from "@/assets/hero-game-corridor.jpg";

export const Demo3DShowcase = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[5%] w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-10 right-[10%] w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary mb-4 shadow-[0_0_20px_rgba(255,103,31,0.2)]">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold">NOVITÀ - Esperienza 3D Immersiva</span>
              <Sparkles className="w-4 h-4 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Simulazioni <span className="bg-gradient-hero bg-clip-text text-transparent drop-shadow-lg">3D First-Person</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Antincendio con estintore reale, cybersecurity in ufficio, evacuazione ed NPC realistici (Ready Player Me + Mixamo). Tutto in browser con Babylon.js.
            </p>
          </div>

          {/* Main Showcase Card */}
          <Card className="overflow-hidden border-2 border-primary/30 shadow-[0_0_50px_rgba(255,103,31,0.2)] hover:shadow-[0_0_80px_rgba(255,103,31,0.3)] transition-all duration-500 animate-scale-in">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="relative overflow-hidden group">
                <img 
                  src={heroGameImage} 
                  alt="Gameplay 3D First Person"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-secondary/40 opacity-80 group-hover:opacity-60 transition-opacity" />
                
                {/* Floating Badges on Image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-primary/90 backdrop-blur-sm border-primary text-primary-foreground shadow-lg animate-pulse">
                    <Flame className="w-3 h-3 mr-1" />
                    Estintore reale
                  </Badge>
                  <Badge className="bg-secondary/90 backdrop-blur-sm border-secondary text-secondary-foreground shadow-lg animate-pulse" style={{ animationDelay: '0.3s' }}>
                    <ShieldAlert className="w-3 h-3 mr-1" />
                    Cybersecurity
                  </Badge>
                  <Badge className="bg-accent/90 backdrop-blur-sm border-accent text-accent-foreground shadow-lg animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <Users className="w-3 h-3 mr-1" />
                    NPC realistici
                  </Badge>
                </div>

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(255,103,31,0.6)] animate-pulse">
                    <Play className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="p-8 md:p-12 bg-gradient-to-br from-card via-primary/5 to-card flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-8 h-8 text-primary animate-pulse" />
                  <h3 className="text-3xl font-bold">Gameplay Immersivo</h3>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 group">
                    <div className="mt-1 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Flame className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Simulatore Antincendio Realistico</p>
                      <p className="text-sm text-muted-foreground">Estintore in prima persona con particelle, classi di fuoco e quiz contestuali</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-1 p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <ShieldAlert className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold">Cybersecurity in Ufficio 3D</p>
                      <p className="text-sm text-muted-foreground">8 rischi nascosti da identificare con feedback educativo immediato</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-1 p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Bot className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">NPC Realistici + AI Tutor</p>
                      <p className="text-sm text-muted-foreground">Avatar Ready Player Me con animazioni Mixamo, dialoghi e tutor conversazionale</p>
                    </div>
                  </li>
                </ul>

                <div className="pt-4 space-y-3">
                  <NavLink to="/demo-3d" className="block">
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full group shadow-[0_0_30px_rgba(255,103,31,0.3)] hover:shadow-[0_0_50px_rgba(255,103,31,0.5)] transition-all"
                    >
                      <Gamepad2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Gioca Ora in 3D
                      <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </NavLink>
                  <p className="text-xs text-center text-muted-foreground">
                    Nessuna installazione richiesta • 100% Browser-Based • Controlli WASD + Mouse
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg hover:border-primary/40 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-lg">Achievement & Classifica</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema badges, leaderboard globale e profilo giocatore con statistiche su tempo, accuratezza e collisioni.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 hover:shadow-lg hover:border-secondary/40 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-bold text-lg">Audio Spaziale Procedurale</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Sintesi sonora Web Audio API: crepitio del fuoco, allarmi e voci NPC posizionate nello spazio 3D.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-lg hover:border-accent/40 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-bold text-lg">Replay & Picture-in-Picture</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Registra, rivedi e confronta fino a due sessioni in split-screen per analizzare gli errori.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};