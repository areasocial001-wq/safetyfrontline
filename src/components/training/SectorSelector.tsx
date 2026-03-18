import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Building2, HardHat, Factory, CheckCircle } from 'lucide-react';
import { RiskSector, SECTOR_INFO } from '@/hooks/useRiskSector';

interface SectorSelectorProps {
  onSelect: (sector: RiskSector) => void;
  currentSector?: RiskSector | null;
  loading?: boolean;
}

const SECTOR_ICONS: Record<RiskSector, typeof Shield> = {
  basso: Building2,
  medio: Factory,
  alto: HardHat,
};

const SECTOR_COLORS: Record<RiskSector, string> = {
  basso: 'border-green-500/50 bg-green-500/5 hover:bg-green-500/10',
  medio: 'border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10',
  alto: 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10',
};

const SECTOR_BADGE_COLORS: Record<RiskSector, string> = {
  basso: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-red-100 text-red-800',
};

export const SectorSelector = ({ onSelect, currentSector, loading }: SectorSelectorProps) => {
  const sectors: RiskSector[] = ['basso', 'medio', 'alto'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Seleziona il Settore di Rischio</h2>
        <p className="text-muted-foreground">
          Scegli il settore corrispondente alla tua attività lavorativa per accedere alla Formazione Specifica.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sectors.map((sector) => {
          const info = SECTOR_INFO[sector];
          const Icon = SECTOR_ICONS[sector];
          const isSelected = currentSector === sector;

          return (
            <Card
              key={sector}
              className={`relative transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${SECTOR_COLORS[sector]} ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => !loading && onSelect(sector)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-4 rounded-full bg-background/80 mb-3 w-fit">
                  <Icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-lg">{info.label}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="flex justify-center gap-2">
                  <Badge className={SECTOR_BADGE_COLORS[sector]}>{info.hours} ore</Badge>
                  <Badge variant="outline">{info.modules} moduli</Badge>
                </div>
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  className="w-full"
                  disabled={loading}
                  onClick={(e) => { e.stopPropagation(); onSelect(sector); }}
                >
                  {isSelected ? 'Selezionato' : 'Seleziona'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Il settore può essere modificato in seguito o assegnato dall'amministratore aziendale.
      </p>
    </div>
  );
};
