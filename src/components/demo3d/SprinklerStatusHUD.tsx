import { Droplets, ShieldCheck, ShieldOff } from "lucide-react";

interface SprinklerStatusHUDProps {
  active: boolean;
  slowdownPercent: number;
  fireLevel: number;
  visible: boolean;
}

export const SprinklerStatusHUD = ({ active, slowdownPercent, fireLevel, visible }: SprinklerStatusHUDProps) => {
  if (!visible) return null;

  // Estimate time to game over: remaining propagation / rate
  // Fire goes from current level to 1.0, rate ~0.04/s base, slowed by sprinklers
  const baseRate = 0.04;
  const effectiveRate = active ? baseRate * (1 - slowdownPercent / 100) : baseRate;
  const remaining = fireLevel < 1 ? (1 - fireLevel) / effectiveRate : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);

  return (
    <div className="absolute bottom-20 right-4 z-30 pointer-events-none">
      <div className={`
        flex flex-col gap-1.5 px-4 py-3 rounded-lg backdrop-blur-md border-2 transition-all duration-500 min-w-[200px]
        ${active 
          ? 'bg-sky-500/15 border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.3)]' 
          : 'bg-muted/40 border-muted-foreground/20'
        }
      `}>
        {/* Header */}
        <div className="flex items-center gap-2">
          {active ? (
            <Droplets className="w-5 h-5 text-sky-400 animate-pulse" />
          ) : (
            <ShieldOff className="w-5 h-5 text-muted-foreground" />
          )}
          <span className={`font-bold text-sm ${active ? 'text-sky-300' : 'text-muted-foreground'}`}>
            Sprinkler {active ? 'ATTIVO' : 'In Standby'}
          </span>
          {active && (
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse ml-auto" />
          )}
        </div>

        {/* Stats */}
        {active && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-200/70">Rallentamento</span>
              <span className="font-bold text-sky-300">{slowdownPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-sky-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all duration-300"
                style={{ width: `${slowdownPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs mt-0.5">
              <span className="text-sky-200/70">Tempo stimato</span>
              <span className={`font-bold ${remaining < 30 ? 'text-red-400 animate-pulse' : 'text-sky-300'}`}>
                {remaining > 999 ? '> 15:00' : `${minutes}:${seconds.toString().padStart(2, '0')}`}
              </span>
            </div>
          </>
        )}

        {!active && fireLevel > 0.5 && (
          <div className="text-xs text-amber-400/80">
            Attivazione a 90% fuoco ({Math.round(fireLevel * 100)}% attuale)
          </div>
        )}
      </div>
    </div>
  );
};
