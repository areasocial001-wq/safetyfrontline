import { Flame, AlertTriangle, Skull } from 'lucide-react';

interface FireDangerBarProps {
  /** Normalized fire propagation level: 0 = no danger, 1 = maximum */
  level: number;
  visible: boolean;
}

export const FireDangerBar = ({ level, visible }: FireDangerBarProps) => {
  if (!visible || level <= 0) return null;

  const percentage = Math.min(level * 100, 100);
  const isWarning = level > 0.3;
  const isDanger = level > 0.6;
  const isCritical = level > 0.85;

  const getBarColor = () => {
    if (isCritical) return 'bg-red-600';
    if (isDanger) return 'bg-orange-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-yellow-400';
  };

  const getGlowColor = () => {
    if (isCritical) return 'shadow-[0_0_20px_rgba(220,38,38,0.6)]';
    if (isDanger) return 'shadow-[0_0_15px_rgba(249,115,22,0.5)]';
    if (isWarning) return 'shadow-[0_0_10px_rgba(245,158,11,0.4)]';
    return '';
  };

  const getLabel = () => {
    if (isCritical) return 'CRITICO';
    if (isDanger) return 'ALTO';
    if (isWarning) return 'MEDIO';
    return 'BASSO';
  };

  const Icon = isCritical ? Skull : isDanger ? AlertTriangle : Flame;

  return (
    <div className={`
      absolute left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none
      flex flex-col items-center gap-2
      ${isCritical ? 'animate-pulse' : ''}
    `}>
      {/* Label */}
      <div className={`
        text-xs font-bold tracking-wider px-2 py-1 rounded
        ${isCritical ? 'bg-red-600/90 text-white' : 
          isDanger ? 'bg-orange-500/90 text-white' : 
          isWarning ? 'bg-amber-500/90 text-black' : 
          'bg-yellow-400/90 text-black'}
      `}>
        {getLabel()}
      </div>

      {/* Icon */}
      <Icon className={`w-5 h-5 ${
        isCritical ? 'text-red-500' : 
        isDanger ? 'text-orange-400' : 
        isWarning ? 'text-amber-400' : 
        'text-yellow-400'
      }`} />

      {/* Vertical bar container */}
      <div className={`
        relative w-4 h-48 rounded-full overflow-hidden
        bg-black/60 backdrop-blur-sm border border-white/20
        ${getGlowColor()}
      `}>
        {/* Fill (bottom-up) */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500
            ${getBarColor()}
          `}
          style={{ height: `${percentage}%` }}
        />

        {/* Threshold markers */}
        <div className="absolute left-0 right-0 bottom-[30%] h-px bg-amber-400/50" />
        <div className="absolute left-0 right-0 bottom-[60%] h-px bg-orange-500/50" />
        <div className="absolute left-0 right-0 bottom-[85%] h-px bg-red-600/50" />
      </div>

      {/* Fire icon at bottom */}
      <Flame className={`w-4 h-4 ${
        isCritical ? 'text-red-500 animate-bounce' : 
        isDanger ? 'text-orange-400' : 
        'text-amber-400'
      }`} />

      {/* Percentage */}
      <span className={`text-xs font-mono font-bold ${
        isCritical ? 'text-red-400' : 
        isDanger ? 'text-orange-400' : 
        'text-amber-400'
      }`}>
        {Math.round(percentage)}%
      </span>
    </div>
  );
};
