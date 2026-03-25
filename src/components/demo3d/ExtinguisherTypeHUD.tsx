import { Flame, Droplets, Wind, CloudRain, FlaskConical } from 'lucide-react';
import type { ExtinguisherType } from '@/components/demo3d/ExtinguisherSelection';

interface ExtinguisherTypeHUDProps {
  type: ExtinguisherType;
  visible: boolean;
}

const TYPES_ORDER: ExtinguisherType[] = ['co2', 'powder', 'foam', 'water'];

const CONFIG: Record<ExtinguisherType, { label: string; icon: typeof Flame; color: string; bgColor: string; borderColor: string }> = {
  co2: {
    label: 'CO₂',
    icon: Wind,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/40',
  },
  powder: {
    label: 'Polvere',
    icon: FlaskConical,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/15',
    borderColor: 'border-yellow-500/40',
  },
  foam: {
    label: 'Schiuma',
    icon: Droplets,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/40',
  },
  water: {
    label: 'Acqua',
    icon: Droplets,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/40',
  },
};

export const ExtinguisherTypeHUD = ({ type, visible }: ExtinguisherTypeHUDProps) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-36 right-4 z-30 pointer-events-none">
      <div className="flex flex-col items-end gap-1.5">
        {/* Quick-swap slots */}
        <div className="flex gap-1.5">
          {TYPES_ORDER.map((t, i) => {
            const cfg = CONFIG[t];
            const Icon = cfg.icon;
            const isActive = t === type;
            return (
              <div
                key={t}
                className={`
                  relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg backdrop-blur-md border transition-all duration-300
                  ${isActive
                    ? `${cfg.bgColor} ${cfg.borderColor} border-2 shadow-lg scale-110`
                    : 'bg-background/40 border-border/30 opacity-50'
                  }
                `}
              >
                {/* Key number badge */}
                <span className={`
                  absolute -top-2 -left-1 w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center
                  ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {i + 1}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? cfg.color : 'text-muted-foreground'}`} />
                <span className={`text-[9px] font-semibold ${isActive ? cfg.color : 'text-muted-foreground'}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Hint */}
        <span className="text-[9px] text-muted-foreground/60 mr-1">
          Premi 1-4 per cambiare
        </span>
      </div>
    </div>
  );
};
