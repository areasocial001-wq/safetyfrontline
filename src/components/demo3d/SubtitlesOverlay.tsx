import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface SubtitlesOverlayProps {
  text: string;
  severity: 'critical' | 'moderate';
  duration?: number; // milliseconds
  onComplete?: () => void;
}

export const SubtitlesOverlay = ({ 
  text, 
  severity, 
  duration = 8000,
  onComplete 
}: SubtitlesOverlayProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [text, duration, onComplete]);

  if (!isVisible) return null;

  const isCritical = severity === 'critical';

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 animate-fade-in">
      <Card 
        className={`
          p-4 backdrop-blur-md shadow-2xl border-2
          ${isCritical 
            ? 'bg-red-950/95 border-red-500/50' 
            : 'bg-amber-950/95 border-amber-500/50'
          }
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon indicator */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
            ${isCritical 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-amber-500 text-black'
            }
          `}>
            {isCritical ? '🚨' : '⚠️'}
          </div>

          {/* Subtitle text */}
          <div className="flex-1">
            <p className={`
              font-bold text-sm uppercase tracking-wider mb-1
              ${isCritical ? 'text-red-300' : 'text-amber-300'}
            `}>
              {isCritical ? 'RISCHIO CRITICO' : 'RISCHIO RILEVATO'}
            </p>
            <p className="text-white text-base leading-relaxed">
              {text}
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 overflow-hidden">
            <div 
              className={`
                h-full 
                ${isCritical ? 'bg-red-500' : 'bg-amber-500'}
              `}
              style={{
                animation: `subtitleProgress ${duration}ms linear`,
              }}
            />
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes subtitleProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};
