import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Droplets, Wind, FlaskConical, CheckCircle2 } from 'lucide-react';

export type ExtinguisherType = 'co2' | 'powder' | 'foam' | 'water';

export interface ExtinguisherInfo {
  id: ExtinguisherType;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  effectiveness: {
    electrical: number; // 0-100
    liquid: number;
    solid: number;
    gas: number;
  };
  pros: string[];
  cons: string[];
}

export const EXTINGUISHER_TYPES: ExtinguisherInfo[] = [
  {
    id: 'co2',
    name: 'CO₂',
    description: 'Anidride carbonica — ideale per incendi elettrici e liquidi infiammabili',
    icon: Wind,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/40',
    effectiveness: { electrical: 95, liquid: 70, solid: 30, gas: 60 },
    pros: ['Non lascia residui', 'Sicuro su apparecchiature elettriche', 'Rapido spegnimento'],
    cons: ['Inefficace all\'aperto', 'Rischio asfissia in ambienti chiusi', 'Portata limitata'],
  },
  {
    id: 'powder',
    name: 'Polvere',
    description: 'Polvere chimica ABC — versatile per la maggior parte degli incendi',
    icon: FlaskConical,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    effectiveness: { electrical: 80, liquid: 85, solid: 90, gas: 75 },
    pros: ['Versatile (classe A, B, C)', 'Buona portata', 'Efficace su fiamme grandi'],
    cons: ['Lascia residui corrosivi', 'Riduce visibilità', 'Danni a elettronica'],
  },
  {
    id: 'foam',
    name: 'Schiuma',
    description: 'Schiuma meccanica AFFF — eccellente per liquidi infiammabili',
    icon: Droplets,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    effectiveness: { electrical: 10, liquid: 95, solid: 70, gas: 20 },
    pros: ['Eccellente su liquidi', 'Previene ri-accensione', 'Copre ampie superfici'],
    cons: ['NON usare su quadri elettrici', 'Pesante da trasportare', 'Richiede pulizia'],
  },
  {
    id: 'water',
    name: 'Acqua',
    description: 'Acqua pressurizzata — per incendi di materiali solidi (classe A)',
    icon: Droplets,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/40',
    effectiveness: { electrical: 0, liquid: 20, solid: 95, gas: 5 },
    pros: ['Economico e disponibile', 'Eccellente su solidi', 'Nessun residuo tossico'],
    cons: ['PERICOLOSO su elettricità', 'Inefficace su liquidi', 'Gela sotto 0°C'],
  },
];

interface ExtinguisherSelectionProps {
  onSelect: (type: ExtinguisherType) => void;
  onBack: () => void;
}

export const ExtinguisherSelection = ({ onSelect, onBack }: ExtinguisherSelectionProps) => {
  const [selected, setSelected] = useState<ExtinguisherType | null>(null);
  const selectedInfo = EXTINGUISHER_TYPES.find(e => e.id === selected);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 overflow-y-auto py-8">
      <div className="max-w-4xl mx-4 w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">Simulazione Antincendio</span>
          </div>
          <h1 className="text-3xl font-bold">
            Scegli il tuo <span className="text-primary">Estintore</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ogni tipo di estintore ha vantaggi e svantaggi specifici. 
            Scegli quello più adatto allo scenario che affronterai.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EXTINGUISHER_TYPES.map((ext) => {
            const Icon = ext.icon;
            const isSelected = selected === ext.id;
            return (
              <Card
                key={ext.id}
                onClick={() => setSelected(ext.id)}
                className={`
                  relative p-4 cursor-pointer transition-all duration-300 hover:scale-105
                  ${isSelected 
                    ? `${ext.borderColor} border-2 shadow-lg ${ext.bgColor}` 
                    : 'border border-border hover:border-primary/30'
                  }
                `}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-primary" />
                )}
                <div className="text-center space-y-3">
                  <div className={`w-14 h-14 mx-auto rounded-full ${ext.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${ext.color}`} />
                  </div>
                  <h3 className="font-bold text-lg">{ext.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ext.description}</p>
                </div>

                {/* Effectiveness bars */}
                <div className="mt-4 space-y-1.5">
                  {[
                    { label: 'Elettr.', value: ext.effectiveness.electrical },
                    { label: 'Liquidi', value: ext.effectiveness.liquid },
                    { label: 'Solidi', value: ext.effectiveness.solid },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-10 text-right">{stat.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stat.value >= 70 ? 'bg-emerald-500' :
                            stat.value >= 40 ? 'bg-amber-500' : 'bg-destructive'
                          }`}
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected extinguisher details */}
        {selectedInfo && (
          <Card className={`p-5 ${selectedInfo.bgColor} ${selectedInfo.borderColor} border-2`}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-emerald-400 mb-2">✅ Vantaggi</h4>
                <ul className="space-y-1">
                  {selectedInfo.pros.map((pro, i) => (
                    <li key={i} className="text-sm flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-destructive mb-2">⚠️ Svantaggi</h4>
                <ul className="space-y-1">
                  {selectedInfo.cons.map((con, i) => (
                    <li key={i} className="text-sm flex items-start gap-1.5">
                      <span className="text-destructive mt-0.5">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => selected && onSelect(selected)}
            variant="hero"
            size="lg"
            disabled={!selected}
            className="text-lg px-8"
          >
            <Flame className="w-5 h-5 mr-2" />
            {selected ? `Inizia con ${selectedInfo?.name}` : 'Seleziona un estintore'}
          </Button>
          <Button onClick={onBack} variant="outline" size="lg">
            Indietro
          </Button>
        </div>
      </div>
    </div>
  );
};
