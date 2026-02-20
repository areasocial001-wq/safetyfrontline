import { Flame, Droplets, Wind, CloudRain } from 'lucide-react';
import type { ExtinguisherType } from '@/components/demo3d/ExtinguisherSelection';

interface ExtinguisherTypeHUDProps {
  type: ExtinguisherType;
  visible: boolean;
}

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
    icon: CloudRain,
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

  const cfg = CONFIG[type];
  const Icon = cfg.icon;

  return (
    <div className="absolute bottom-36 right-4 z-30 pointer-events-none">
      <div className={`
        flex items-center gap-2.5 px-4 py-2.5 rounded-lg backdrop-blur-md border-2 
        shadow-lg transition-all duration-500 animate-fade-in
        ${cfg.bgColor} ${cfg.borderColor}
      `}>
        <div className={`p-1.5 rounded-md ${cfg.bgColor}`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Estintore</span>
          <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <Flame className={`w-3.5 h-3.5 ${cfg.color} opacity-60`} />
      </div>
    </div>
  );
};
