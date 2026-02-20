import { Button } from '@/components/ui/button';
import { AudioPreset } from '@/hooks/useAnimationSounds';
import { Radio, Rocket, Building2 } from 'lucide-react';

interface AudioPresetSelectorProps {
  currentPreset: AudioPreset;
  onPresetChange: (preset: AudioPreset) => void;
  className?: string;
}

const PRESET_CONFIG = {
  'deep-space': {
    label: 'Deep Space',
    icon: Radio,
    description: 'Eco spaziale profondo',
  },
  'industrial-hangar': {
    label: 'Industrial Hangar',
    icon: Building2,
    description: 'Ambiente industriale',
  },
  'cathedral': {
    label: 'Cathedral',
    icon: Rocket,
    description: 'Riverbero sacro',
  },
} as const;

export const AudioPresetSelector = ({ 
  currentPreset, 
  onPresetChange,
  className = '' 
}: AudioPresetSelectorProps) => {
  return (
    <div className={`flex flex-col gap-2 bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50 ${className}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        Audio Theme
      </p>
      <div className="flex flex-col gap-1.5">
        {(Object.entries(PRESET_CONFIG) as [AudioPreset, typeof PRESET_CONFIG[AudioPreset]][]).map(
          ([preset, config]) => {
            const Icon = config.icon;
            const isActive = currentPreset === preset;
            
            return (
              <Button
                key={preset}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPresetChange(preset)}
                className={`justify-start gap-2 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold">{config.label}</span>
                  <span className="text-[10px] opacity-70">{config.description}</span>
                </div>
              </Button>
            );
          }
        )}
      </div>
    </div>
  );
};
