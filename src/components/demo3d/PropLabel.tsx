import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

interface PropLabelProps {
  propName: string;
  propType: string;
  distance: number;
  condition?: 'good' | 'warning' | 'damaged';
  icon: LucideIcon;
}

export const PropLabel = ({ propName, propType, distance, condition = 'good', icon: Icon }: PropLabelProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);
  }, []);

  const getConditionColor = () => {
    switch (condition) {
      case 'damaged':
        return 'text-red-500 border-red-500';
      case 'warning':
        return 'text-orange-500 border-orange-500';
      case 'good':
      default:
        return 'text-cyan-500 border-cyan-500';
    }
  };

  const getConditionText = () => {
    switch (condition) {
      case 'damaged':
        return '🔴 Danneggiato';
      case 'warning':
        return '🟡 Attenzione';
      case 'good':
      default:
        return '🟢 Buono';
    }
  };

  return (
    <div 
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div 
        className={`bg-background/90 backdrop-blur-md rounded-lg px-4 py-2.5 border-2 ${getConditionColor()} shadow-lg`}
        style={{
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`${getConditionColor()} opacity-80`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-bold text-foreground uppercase tracking-wide">
              {propName}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">{propType}</span>
              <span className="text-muted-foreground opacity-60">•</span>
              <span className={`font-semibold ${getConditionColor()}`}>
                {getConditionText()}
              </span>
              <span className="text-muted-foreground opacity-60">•</span>
              <span className="text-muted-foreground font-medium">
                📏 {distance.toFixed(1)}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
