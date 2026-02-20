import { useState, useEffect } from 'react';
import { Trophy, Zap, Shield, Star, Target, Flame } from 'lucide-react';

interface TrainingAchievementPopupProps {
  type: 'perfect_section' | 'boss_first_try' | 'speed_demon' | 'full_health';
  onClose: () => void;
}

const achievementConfig = {
  perfect_section: {
    icon: Star,
    title: 'Sezione Perfetta!',
    description: 'Hai completato la sezione senza errori',
    xpBonus: 25,
    color: 'text-yellow-400',
    bgGlow: 'from-yellow-400/20 via-yellow-500/10 to-transparent',
    borderColor: 'border-yellow-400/50',
  },
  boss_first_try: {
    icon: Trophy,
    title: 'Boss Sconfitto al Primo Colpo!',
    description: 'Hai superato il Boss Test al primo tentativo',
    xpBonus: 50,
    color: 'text-primary',
    bgGlow: 'from-primary/20 via-primary/10 to-transparent',
    borderColor: 'border-primary/50',
  },
  speed_demon: {
    icon: Zap,
    title: 'Velocità Fulminea!',
    description: 'Hai completato la sezione in tempo record',
    xpBonus: 15,
    color: 'text-blue-400',
    bgGlow: 'from-blue-400/20 via-blue-500/10 to-transparent',
    borderColor: 'border-blue-400/50',
  },
  full_health: {
    icon: Shield,
    title: 'Intoccabile!',
    description: 'Hai completato il modulo con salute al 100%',
    xpBonus: 30,
    color: 'text-green-400',
    bgGlow: 'from-green-400/20 via-green-500/10 to-transparent',
    borderColor: 'border-green-400/50',
  },
};

const TrainingAchievementPopup = ({ type, onClose }: TrainingAchievementPopupProps) => {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const config = achievementConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('show'), 50);
    const exitTimer = setTimeout(() => setPhase('exit'), 3500);
    const closeTimer = setTimeout(onClose, 4000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop glow */}
      <div className={`absolute inset-0 bg-gradient-radial ${config.bgGlow} transition-opacity duration-700 ${
        phase === 'show' ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Achievement card */}
      <div
        className={`relative pointer-events-auto transition-all duration-700 ease-out ${
          phase === 'enter' ? 'scale-50 opacity-0 translate-y-8' :
          phase === 'show' ? 'scale-100 opacity-100 translate-y-0' :
          'scale-95 opacity-0 -translate-y-4'
        }`}
        onClick={onClose}
      >
        <div className={`relative bg-card/95 backdrop-blur-xl border-2 ${config.borderColor} rounded-2xl p-8 shadow-2xl max-w-sm mx-4`}>
          {/* Sparkle particles */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${config.color.replace('text-', 'bg-')} animate-ping`}
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>

          {/* Icon with pulse ring */}
          <div className="relative flex justify-center mb-4">
            <div className={`absolute w-20 h-20 rounded-full ${config.color.replace('text-', 'bg-')}/10 animate-ping`} 
                 style={{ animationDuration: '2s' }} />
            <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${config.bgGlow} flex items-center justify-center border ${config.borderColor}`}>
              <Icon className={`w-8 h-8 ${config.color} drop-shadow-lg`} />
            </div>
          </div>

          {/* Text */}
          <div className="text-center relative">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">🏆 Achievement Sbloccato</p>
            <h3 className="text-xl font-bold mb-1">{config.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.color.replace('text-', 'bg-')}/10 border ${config.borderColor}`}>
              <Flame className={`w-4 h-4 ${config.color}`} />
              <span className={`text-sm font-bold ${config.color}`}>+{config.xpBonus} XP Bonus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingAchievementPopup;
