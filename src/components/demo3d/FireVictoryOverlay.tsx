import { useEffect, useState } from 'react';
import { Flame, Star, Trophy, PartyPopper } from 'lucide-react';

interface FireVictoryOverlayProps {
  bonusPoints: number;
  onComplete: () => void;
}

export const FireVictoryOverlay = ({ bonusPoints, onComplete }: FireVictoryOverlayProps) => {
  const [phase, setPhase] = useState(0); // 0=enter, 1=show, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 4500);
    const t3 = setTimeout(() => onComplete(), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center pointer-events-none
      transition-opacity duration-700
      ${phase === 0 ? 'opacity-0' : phase === 2 ? 'opacity-0' : 'opacity-100'}
    `}>
      {/* Darkened background */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Animated particles/embers background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-yellow-400/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatUp ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`
        relative text-center space-y-6 transition-all duration-700
        ${phase === 1 ? 'scale-100 translate-y-0' : 'scale-75 translate-y-8'}
      `}>
        {/* Trophy icon */}
        <div className="flex justify-center">
          <div className="relative">
            <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
            <Star className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
            <Star className="absolute -bottom-1 -left-3 w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-lg tracking-tight">
            INCENDIO DOMATO!
          </h1>
          <p className="text-xl md:text-2xl text-yellow-200/90 mt-3 font-semibold">
            Tutti i focolai sono stati spenti con successo
          </p>
        </div>

        {/* Bonus score */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-yellow-500/20 border-2 border-yellow-400/50 backdrop-blur-sm">
          <PartyPopper className="w-6 h-6 text-yellow-300" />
          <span className="text-2xl font-bold text-yellow-300">
            +{bonusPoints} Bonus
          </span>
          <Flame className="w-6 h-6 text-orange-400" />
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
