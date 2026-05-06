import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Crosshair, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { CARTOON_LEVELS } from "@/data/cartoon-hazard-levels";

export const SpotTheHazardShowcase = () => {
  const levels = Object.values(CARTOON_LEVELS);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeLevel = levels[activeIndex];

  const next = () => setActiveIndex((i) => (i + 1) % levels.length);
  const prev = () => setActiveIndex((i) => (i - 1 + levels.length) % levels.length);

  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-accent/5 to-background overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[8%] w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-10 right-[12%] w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }} />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent mb-4 shadow-[0_0_20px_rgba(255,103,31,0.15)]">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold">NOVITÀ - Mini-Game 2D Illustrato</span>
              <Sparkles className="w-4 h-4 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Spot the <span className="bg-gradient-hero bg-clip-text text-transparent drop-shadow-lg">Hazard</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Esplora scene illustrate, trova i pericoli nascosti e leggi la spiegazione educativa.
              Un'esperienza visiva coinvolgente per riconoscere i rischi sul lavoro.
            </p>
          </div>

          {/* Main Showcase Card */}
          <Card className="overflow-hidden border-2 border-accent/30 shadow-[0_0_50px_rgba(255,103,31,0.15)] hover:shadow-[0_0_80px_rgba(255,103,31,0.25)] transition-all duration-500 animate-scale-in">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="relative overflow-hidden group bg-muted">
                <img
                  src={activeLevel.background_image_url}
                  alt={activeLevel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[320px]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 via-transparent to-primary/30 opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Level badges on image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-accent/90 backdrop-blur-sm border-accent text-accent-foreground shadow-lg animate-pulse">
                    <Eye className="w-3 h-3 mr-1" />
                    {activeLevel.total_hazards} rischi
                  </Badge>
                  <Badge className="bg-destructive/90 backdrop-blur-sm border-destructive text-destructive-foreground shadow-lg animate-pulse" style={{ animationDelay: '0.3s' }}>
                    <Heart className="w-3 h-3 mr-1" />
                    {activeLevel.lives} vite
                  </Badge>
                </div>

                {/* Carousel arrows */}
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {levels.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === activeIndex ? 'bg-accent w-6' : 'bg-background/60 hover:bg-background'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content Side */}
              <div className="p-8 md:p-12 bg-gradient-to-br from-card via-accent/5 to-card flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-8 h-8 text-accent animate-pulse" />
                  <h3 className="text-3xl font-bold">{activeLevel.title}</h3>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  "{activeLevel.intro_dialogue.text}" — {activeLevel.intro_dialogue.speaker}
                </p>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 group">
                    <div className="mt-1 p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Eye className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">Lista laterale rischi + checkmark</p>
                      <p className="text-sm text-muted-foreground">Tutti i pericoli da trovare in un pannello laterale che si spunta man mano</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-1 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Crosshair className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Punteggio + tentativi limitati</p>
                      <p className="text-sm text-muted-foreground">Sistema di vite: un click sbagliato costa una vita. Precisione tracciata in tempo reale</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-1 p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold">Spiegazione educativa post-click</p>
                      <p className="text-sm text-muted-foreground">Per ogni rischio trovato: perché è pericoloso, azione corretta e normativa di riferimento</p>
                    </div>
                  </li>
                </ul>

                <div className="pt-4 space-y-3">
                  <Link to="/spot-the-hazard" className="block">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full group shadow-[0_0_30px_rgba(255,103,31,0.3)] hover:shadow-[0_0_50px_rgba(255,103,31,0.5)] transition-all"
                    >
                      <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Gioca a Spot the Hazard
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground">
                    Nessuna installazione · Scene illustrate cartoon · 3 ambienti diversi
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Level thumbnails */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {levels.map((level, i) => (
              <button
                key={level.level_id}
                onClick={() => setActiveIndex(i)}
                className={`text-left rounded-xl overflow-hidden border-2 transition-all group relative ${
                  i === activeIndex
                    ? 'border-accent shadow-[0_0_25px_rgba(255,103,31,0.2)] ring-1 ring-accent/50'
                    : 'border-border hover:border-accent/40 hover:shadow-lg'
                }`}
              >
                <div className="relative aspect-video">
                  <img
                    src={level.background_image_url}
                    alt={level.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="font-bold text-sm">{level.title}</p>
                    <div className="flex items-center gap-2 text-xs opacity-80">
                      <span>{level.total_hazards} rischi</span>
                      <span>·</span>
                      <span>{level.lives} vite</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
