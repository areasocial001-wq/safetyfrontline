import { useEffect, useState } from 'react';

interface RippleEffectProps {
  isActive: boolean;
  color?: string;
  intensity?: number;
  delay?: number;
  className?: string;
}

export const RippleEffect = ({ 
  isActive, 
  color = 'primary',
  intensity = 1,
  delay = 0,
  className = '' 
}: RippleEffectProps) => {
  const [ripples, setRipples] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!isActive) {
      setRipples([false, false, false]);
      return;
    }

    // Trigger ripples sequentially with delay
    const timeouts = ripples.map((_, index) =>
      setTimeout(() => {
        setRipples(prev => {
          const newRipples = [...prev];
          newRipples[index] = true;
          return newRipples;
        });
      }, delay + index * 200)
    );

    // Reset ripples after animation completes
    const resetTimeout = setTimeout(() => {
      setRipples([false, false, false]);
    }, delay + 2000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(resetTimeout);
    };
  }, [isActive, delay]);

  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)]';
      case 'accent': return 'border-accent/40 shadow-[0_0_20px_hsl(var(--accent)/0.3)]';
      case 'secondary': return 'border-secondary/40 shadow-[0_0_20px_hsl(var(--secondary)/0.3)]';
      default: return 'border-primary/40';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {ripples.map((active, index) => (
        <div
          key={index}
          className={`absolute inset-0 rounded-full border-2 ${getColorClass()} ${
            active ? 'animate-ripple-expand' : 'opacity-0'
          }`}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: '1.5s',
          }}
        />
      ))}
    </div>
  );
};
