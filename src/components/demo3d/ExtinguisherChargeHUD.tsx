import { Flame, Battery, BatteryLow, BatteryWarning } from 'lucide-react';

interface ExtinguisherChargeHUDProps {
  charge: number; // 0-100
  maxCharge: number;
  extinguisherType: string;
  visible: boolean;
}

export const ExtinguisherChargeHUD = ({ charge, maxCharge, extinguisherType, visible }: ExtinguisherChargeHUDProps) => {
  if (!visible) return null;

  const percentage = Math.max(0, Math.min(100, (charge / maxCharge) * 100));
  const isLow = percentage <= 25;
  const isEmpty = percentage <= 0;
  const isCritical = percentage <= 10;

  const getTypeLabel = () => {
    switch (extinguisherType) {
      case 'co2': return 'CO₂';
      case 'powder': return 'Polvere';
      case 'foam': return 'Schiuma';
      case 'water': return 'Acqua';
      default: return 'Estintore';
    }
  };

  const getBarColor = () => {
    if (isEmpty) return 'bg-destructive';
    if (isCritical) return 'bg-destructive animate-pulse';
    if (isLow) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const getIcon = () => {
    if (isEmpty) return <BatteryLow className="w-5 h-5 text-destructive" />;
    if (isLow) return <BatteryWarning className="w-5 h-5 text-yellow-500" />;
    return <Battery className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="absolute bottom-20 right-4 z-30 pointer-events-none">
      <div className={`
        flex flex-col items-center gap-2 px-4 py-3 rounded-lg backdrop-blur-md border-2 
        transition-all duration-300 shadow-lg min-w-[140px]
        ${isEmpty 
          ? 'bg-destructive/20 border-destructive animate-pulse' 
          : isLow 
            ? 'bg-yellow-500/20 border-yellow-500' 
            : 'bg-card/80 border-primary/40'
        }
      `}>
        {/* Type label */}
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-bold text-sm">{getTypeLabel()}</span>
        </div>

        {/* Charge bar */}
        <div className="w-full h-3 rounded-full bg-muted/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Charge text */}
        <span className={`text-xs font-semibold ${isEmpty ? 'text-destructive' : 'text-muted-foreground'}`}>
          {isEmpty ? '🔴 VUOTO — Cerca un estintore!' : `${Math.round(percentage)}%`}
        </span>
      </div>
    </div>
  );
};
