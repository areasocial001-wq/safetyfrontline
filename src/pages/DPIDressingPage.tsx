import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shirt, HardHat, ShieldCheck } from 'lucide-react';
import DPIDressingGame, { DPI_SCENARIOS } from '@/components/training/DPIDressingGame';
import { toast } from '@/hooks/use-toast';

const SCENARIO_META: { id: keyof typeof DPI_SCENARIOS; label: string; icon: any; desc: string }[] = [
  { id: 'cantiere', label: 'Cantiere edile', icon: HardHat, desc: 'DPI standard da cantiere: tuta, scarpe, gilet, guanti, occhiali, cuffie e casco.' },
  { id: 'quota', label: 'Lavori in quota', icon: ShieldCheck, desc: 'DPI anticaduta: tuta, scarpe, imbracatura, cordino, guanti e casco.' },
  { id: 'officina', label: 'Officina meccanica', icon: Shirt, desc: 'DPI per saldatura e lavorazioni meccaniche.' },
];

export default function DPIDressingPage() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<keyof typeof DPI_SCENARIOS | null>(null);

  const handleComplete = (score: { correct: number; mistakes: number }) => {
    toast({
      title: '🎉 Vestizione completata!',
      description: `Hai indossato ${score.correct} DPI con ${score.mistakes} ${score.mistakes === 1 ? 'errore' : 'errori'}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/formazione')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Torna al Piano Formativo
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-3xl">🦺</span> Vestizione DPI
              </h1>
              <p className="text-muted-foreground mt-1">
                Allenati a indossare i Dispositivi di Protezione Individuale nell&apos;ordine corretto.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!scenario ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Scegli lo scenario</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {SCENARIO_META.map((s) => {
                const Icon = s.icon;
                return (
                  <Card
                    key={s.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-border hover:border-primary/40 rounded-2xl overflow-hidden"
                    onClick={() => setScenario(s.id)}
                  >
                    <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">{s.label}</h3>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                      <Badge variant="secondary" className="mt-1 rounded-full">
                        {DPI_SCENARIOS[s.id].sequence.length} DPI
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setScenario(null)} className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Cambia scenario
                </Button>
                <Badge variant="default" className="rounded-full">
                  {DPI_SCENARIOS[scenario].title}
                </Badge>
              </div>
            </div>
            <DPIDressingGame scenarioId={scenario} onComplete={handleComplete} />
          </div>
        )}
      </div>
    </div>
  );
}
