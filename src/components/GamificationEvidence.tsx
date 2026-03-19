import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  Brain, TrendingUp, Clock, Users, Zap, Shield,
  Trophy, Target, Gamepad2, BarChart3, Sparkles, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";

const stats = [
  { value: 60, suffix: "%", label: "Memorizzazione in più", sublabel: "vs formazione tradizionale", icon: Brain, color: "primary" },
  { value: 60, suffix: "%", label: "Meno errori", sublabel: "su email sospette e phishing", icon: Shield, color: "accent" },
  { value: 5, suffix: "min", label: "Micro-sessioni", sublabel: "integrate nel flusso di lavoro", icon: Clock, color: "secondary" },
  { value: 3, suffix: "x", label: "Più coinvolgimento", sublabel: "rispetto ai corsi classici", icon: TrendingUp, color: "destructive" },
];

const pillars = [
  {
    icon: Gamepad2,
    title: "Sfide & Competizioni",
    description: "Quiz a tempo, sfide tra colleghi e classifiche aziendali trasformano l'obbligo formativo in una competizione sana e motivante.",
    highlight: "Motivazione intrinseca",
  },
  {
    icon: Trophy,
    title: "Badge, XP & Livelli",
    description: "Ogni modulo completato, ogni boss test superato genera punti esperienza, badge esclusivi e avanzamento di livello visibile nella dashboard.",
    highlight: "Riconoscimento immediato",
  },
  {
    icon: Target,
    title: "Micro-learning Adattivo",
    description: "Sessioni da 5-6 minuti con contenuti che si adattano al settore di rischio e al ruolo. La formazione entra nel flusso di lavoro, non lo interrompe.",
    highlight: "Zero interruzioni",
  },
  {
    icon: Sparkles,
    title: "Simulazioni Immersive",
    description: "Scenari 3D in prima persona dove identificare rischi reali. L'esperienza pratica crea memoria muscolare che nessun PDF può eguagliare.",
    highlight: "Apprendimento esperienziale",
  },
];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 1800;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.round(eased * target);
            setCount(start);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-black tabular-nums">
      {count}
      <span className="text-2xl md:text-3xl">{suffix}</span>
    </div>
  );
};

const comparisonRows = [
  { aspect: "Formato", traditional: "Slide, PDF, video lunghi", gamified: "Quiz interattivi, simulazioni 3D, micro-sessioni" },
  { aspect: "Durata sessione", traditional: "30-60 minuti", gamified: "5-6 minuti" },
  { aspect: "Motivazione", traditional: "Obbligo / compliance", gamified: "XP, badge, classifiche, sfide" },
  { aspect: "Memorizzazione", traditional: "~20% dopo 30 giorni", gamified: "+60% di retention" },
  { aspect: "Comportamento", traditional: "Minimo impatto reale", gamified: "-60% errori su minacce" },
  { aspect: "Frequenza", traditional: "1-2 volte l'anno", gamified: "Continua, nel flusso di lavoro" },
];

export const GamificationEvidence = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <section className="py-20 bg-background relative overflow-hidden" id="gamification">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="container px-4 mx-auto relative">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-5">
              <BarChart3 className="w-4 h-4" />
              Dati alla mano
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-5">
              Perché la <span className="text-primary">Gamification</span> funziona davvero
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              La formazione tradizionale ha un tasso di retention del 20%. 
              Con la gamification, i dati parlano chiaro: più memoria, meno errori, più coinvolgimento.
            </p>
          </div>

          {/* Animated Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const colorMap: Record<string, string> = {
                primary: "text-primary",
                secondary: "text-secondary",
                accent: "text-accent",
                destructive: "text-destructive",
              };
              const bgMap: Record<string, string> = {
                primary: "from-primary/10 to-primary/5 border-primary/20",
                secondary: "from-secondary/10 to-secondary/5 border-secondary/20",
                accent: "from-accent/10 to-accent/5 border-accent/20",
                destructive: "from-destructive/10 to-destructive/5 border-destructive/20",
              };
              return (
                <Card
                  key={i}
                  className={`p-5 md:p-6 text-center bg-gradient-to-br ${bgMap[stat.color]} border hover:shadow-lg transition-all duration-300 animate-scale-in`}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <Icon className={`w-7 h-7 ${colorMap[stat.color]} mx-auto mb-3`} />
                  <div className={colorMap[stat.color]}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm font-bold mt-2">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sublabel}</p>
                </Card>
              );
            })}
          </div>

          {/* Problem Statement + Pillars */}
          <div className="grid lg:grid-cols-2 gap-10 mb-16 items-start">
            {/* Left: The Problem */}
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Il problema della formazione <span className="text-destructive">tradizionale</span>
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Corsi lunghi, generici e percepiti come un obbligo. Il risultato? 
                  <strong className="text-foreground"> Regole ignorate, minacce sottovalutate, comportamenti a rischio.</strong>
                </p>
                <p>
                  La conoscenza da sola non basta: serve un'esperienza che resti impressa, che stimoli la memoria 
                  e renda <strong className="text-foreground">naturale fare la cosa giusta</strong>.
                </p>
              </div>

              {/* Comparison Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider">
                  <div className="p-3 bg-muted/50 border-b border-border" />
                  <div className="p-3 bg-destructive/10 border-b border-border text-destructive text-center">Tradizionale</div>
                  <div className="p-3 bg-accent/10 border-b border-border text-accent text-center">Safety Frontline</div>
                </div>
                {comparisonRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 text-xs border-b border-border last:border-0">
                    <div className="p-3 font-semibold bg-muted/30">{row.aspect}</div>
                    <div className="p-3 text-muted-foreground text-center">{row.traditional}</div>
                    <div className="p-3 text-foreground font-medium text-center">{row.gamified}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 4 Pillars */}
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                I <span className="text-primary">4 pilastri</span> del nostro approccio
              </h3>
              {pillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <Card
                    key={i}
                    className="p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex gap-4">
                      <div className="p-2.5 rounded-lg bg-primary/10 shrink-0 h-fit group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg">{pillar.title}</h4>
                        </div>
                        <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                          {pillar.highlight}
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center p-8 md:p-10 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-border">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-primary" />
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Trasforma la formazione in un vantaggio competitivo
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              I dipendenti formati con la gamification commettono il 60% in meno di errori. 
              Safety Frontline porta questo approccio nella sicurezza sul lavoro delle PMI italiane.
            </p>
            <Button variant="hero" size="lg" onClick={() => setQuoteOpen(true)} className="group">
              Scopri come funziona
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <QuoteRequestDialog open={quoteOpen} onOpenChange={setQuoteOpen} />
        </div>
      </div>
    </section>
  );
};
