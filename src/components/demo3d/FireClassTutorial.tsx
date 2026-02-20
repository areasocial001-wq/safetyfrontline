import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Droplets, Package, Wind, FlaskConical, CheckCircle2, ChevronRight, ChevronLeft, GraduationCap } from 'lucide-react';

interface FireClassTutorialProps {
  onComplete: () => void;
  onBack: () => void;
}

const FIRE_CLASSES = [
  {
    class: 'A',
    name: 'Classe A — Solidi',
    description: 'Incendi di materiali solidi combustibili: legno, carta, tessuti, cartone, plastica.',
    icon: Package,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/40',
    examples: ['Scatoloni', 'Mobili in legno', 'Documenti cartacei', 'Tessuti e tappeti'],
    bestExtinguisher: 'water',
    bestLabel: 'Acqua',
    goodExtinguishers: ['powder', 'foam'],
    badExtinguishers: ['co2'],
  },
  {
    class: 'B',
    name: 'Classe B — Liquidi',
    description: 'Incendi di liquidi infiammabili o solidi liquefattibili: benzina, olio, vernici, solventi.',
    icon: Droplets,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/40',
    examples: ['Benzina e gasolio', 'Olio motore', 'Solventi e vernici', 'Alcool'],
    bestExtinguisher: 'foam',
    bestLabel: 'Schiuma',
    goodExtinguishers: ['powder', 'co2'],
    badExtinguishers: ['water'],
  },
  {
    class: 'C',
    name: 'Classe C (Elettrico)',
    description: 'Incendi di apparecchiature elettriche sotto tensione: quadri, server, cavi, prese.',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/40',
    examples: ['Quadri elettrici', 'Computer e server', 'Multiprese sovraccariche', 'Cavi elettrici'],
    bestExtinguisher: 'co2',
    bestLabel: 'CO₂',
    goodExtinguishers: ['powder'],
    badExtinguishers: ['water', 'foam'],
  },
];

const EXTINGUISHER_LABELS: Record<string, string> = {
  co2: 'CO₂',
  powder: 'Polvere',
  foam: 'Schiuma',
  water: 'Acqua',
};

const EXTINGUISHER_ICONS: Record<string, typeof Wind> = {
  co2: Wind,
  powder: FlaskConical,
  foam: Droplets,
  water: Droplets,
};

export const FireClassTutorial = ({ onComplete, onBack }: FireClassTutorialProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = FIRE_CLASSES.length + 1; // classes + summary

  const goNext = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
    else onComplete();
  };
  const goBack = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
    else onBack();
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 overflow-y-auto py-8">
      <div className="max-w-3xl mx-4 w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-semibold">Tutorial Antincendio</span>
          </div>
          <h1 className="text-3xl font-bold">
            Classi di <span className="text-primary">Fuoco</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Impara a riconoscere i diversi tipi di incendio e quale estintore usare per ciascuno.
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        {currentSlide < FIRE_CLASSES.length ? (
          // Fire class slide
          (() => {
            const fc = FIRE_CLASSES[currentSlide];
            const Icon = fc.icon;
            return (
              <Card className={`p-6 border-2 ${fc.borderColor} ${fc.bgColor} animate-fade-in`}>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${fc.bgColor} border-2 ${fc.borderColor} flex items-center justify-center`}>
                      <Icon className={`w-8 h-8 ${fc.color}`} />
                    </div>
                    <div>
                      <Badge className={`${fc.bgColor} ${fc.color} border ${fc.borderColor} text-lg px-3`}>
                        {fc.class}
                      </Badge>
                      <h2 className="text-xl font-bold mt-1">{fc.name}</h2>
                    </div>
                  </div>

                  <p className="text-muted-foreground">{fc.description}</p>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Esempi comuni:</h3>
                    <div className="flex flex-wrap gap-2">
                      {fc.examples.map(ex => (
                        <Badge key={ex} variant="outline" className="text-xs">{ex}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <h3 className="text-sm font-semibold">Estintori consigliati:</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {['co2', 'powder', 'foam', 'water'].map(ext => {
                        const ExtIcon = EXTINGUISHER_ICONS[ext];
                        const isBest = ext === fc.bestExtinguisher;
                        const isGood = fc.goodExtinguishers.includes(ext);
                        const isBad = fc.badExtinguishers.includes(ext);
                        return (
                          <div
                            key={ext}
                            className={`rounded-lg p-3 text-center border-2 transition-all ${
                              isBest ? 'border-green-500 bg-green-500/10' :
                              isGood ? 'border-green-500/30 bg-green-500/5' :
                              isBad ? 'border-destructive/50 bg-destructive/5' :
                              'border-border'
                            }`}
                          >
                            <ExtIcon className={`w-5 h-5 mx-auto mb-1 ${
                              isBest ? 'text-green-500' : isBad ? 'text-destructive' : 'text-muted-foreground'
                            }`} />
                            <p className="text-xs font-semibold">{EXTINGUISHER_LABELS[ext]}</p>
                            <p className={`text-[10px] font-bold mt-1 ${
                              isBest ? 'text-green-500' : isGood ? 'text-green-600/70' : isBad ? 'text-destructive' : 'text-muted-foreground'
                            }`}>
                              {isBest ? '⭐ OTTIMO' : isGood ? '✅ Buono' : isBad ? '❌ Pericoloso' : '➖ Neutro'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })()
        ) : (
          // Summary slide
          <Card className="p-6 border-2 border-primary/30 bg-primary/5 animate-fade-in">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <h2 className="text-xl font-bold">Riepilogo Rapido</h2>
              </div>
              <div className="space-y-3">
                {FIRE_CLASSES.map(fc => {
                  const Icon = fc.icon;
                  return (
                    <div key={fc.class} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                      <Icon className={`w-6 h-6 ${fc.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm">{fc.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Usa:</span>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                          {fc.bestLabel}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground text-center italic">
                Ricorda: usare l'estintore sbagliato può essere inefficace o pericoloso!
              </p>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Button onClick={goBack} variant="outline" size="lg">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentSlide === 0 ? 'Indietro' : 'Precedente'}
          </Button>
          <Button onClick={goNext} variant="hero" size="lg" className="px-8">
            {currentSlide < totalSlides - 1 ? (
              <>Avanti <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>
                <Flame className="w-4 h-4 mr-2" />
                Scegli Estintore
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
