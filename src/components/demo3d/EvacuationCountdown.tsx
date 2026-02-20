import { useState, useEffect, useRef } from 'react';
import { Flame, AlertTriangle } from 'lucide-react';

interface EvacuationCountdownProps {
  /** Fire propagation level (0-1). Countdown starts at 0.85 */
  fireLevel: number;
  /** Total seconds allowed from 85% to game over */
  totalSeconds?: number;
  visible: boolean;
  onCountdownEnd: () => void;
}

export const EvacuationCountdown = ({
  fireLevel,
  totalSeconds = 30,
  visible,
  onCountdownEnd,
}: EvacuationCountdownProps) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredEnd = useRef(false);

  // Activate countdown when fire exceeds 85%
  useEffect(() => {
    if (visible && fireLevel >= 0.85 && !isActive && !hasTriggeredEnd.current) {
      setIsActive(true);
      setSecondsLeft(totalSeconds);
    }
    // Deactivate if fire drops below threshold (player found risks)
    if (isActive && fireLevel < 0.85) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [fireLevel, visible, isActive, totalSeconds]);

  // Countdown timer
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (!hasTriggeredEnd.current) {
            hasTriggeredEnd.current = true;
            onCountdownEnd();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, onCountdownEnd]);

  // Reset when not visible
  useEffect(() => {
    if (!visible) {
      setIsActive(false);
      setSecondsLeft(totalSeconds);
      hasTriggeredEnd.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [visible, totalSeconds]);

  if (!isActive || !visible) return null;

  const progress = secondsLeft / totalSeconds;
  const isCritical = secondsLeft <= 10;
  const isUrgent = secondsLeft <= 5;

  return (
    <div className={`
      absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none
      animate-fade-in
    `}>
      <div className={`
        flex flex-col items-center gap-2 px-8 py-4 rounded-xl
        backdrop-blur-md border-2 shadow-2xl
        ${isUrgent 
          ? 'bg-red-950/95 border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse' 
          : isCritical 
            ? 'bg-red-950/90 border-red-500/70 shadow-[0_0_25px_rgba(220,38,38,0.4)]' 
            : 'bg-amber-950/90 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
        }
      `}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${isUrgent ? 'text-red-400 animate-bounce' : isCritical ? 'text-red-400' : 'text-amber-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${isUrgent ? 'text-red-300' : isCritical ? 'text-red-300' : 'text-amber-300'}`}>
            Evacuazione d'emergenza
          </span>
          <Flame className={`w-5 h-5 ${isUrgent ? 'text-red-400 animate-bounce' : isCritical ? 'text-red-400' : 'text-amber-400'}`} />
        </div>

        {/* Timer */}
        <div className={`
          text-6xl font-black tabular-nums
          ${isUrgent ? 'text-red-400' : isCritical ? 'text-red-300' : 'text-amber-300'}
        `}>
          {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUrgent ? 'bg-red-500' : isCritical ? 'bg-red-400' : 'bg-amber-500'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Message */}
        <p className={`text-xs text-center max-w-xs ${isUrgent ? 'text-red-300/80' : 'text-amber-300/70'}`}>
          {isUrgent
            ? 'TROVA I RISCHI ORA O IL FUOCO DISTRUGGERÀ TUTTO!'
            : isCritical
              ? 'Identifica rapidamente i rischi rimanenti!'
              : 'Il fuoco si sta espandendo. Trova i rischi per fermarlo.'}
        </p>
      </div>
    </div>
  );
};
