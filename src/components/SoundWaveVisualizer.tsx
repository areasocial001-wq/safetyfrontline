import { useEffect, useState } from 'react';

interface SoundWaveVisualizerProps {
  isActive: boolean;
  intensity?: number;
  className?: string;
}

export const SoundWaveVisualizer = ({ 
  isActive, 
  intensity = 1,
  className = '' 
}: SoundWaveVisualizerProps) => {
  const [waves, setWaves] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!isActive) {
      setWaves([0, 0, 0, 0, 0]);
      return;
    }

    // Generate random wave heights when active
    const interval = setInterval(() => {
      setWaves(prev => prev.map(() => Math.random() * intensity));
    }, 80);

    return () => clearInterval(interval);
  }, [isActive, intensity]);

  return (
    <div className={`flex items-center gap-1 h-8 ${className}`}>
      {waves.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-100 ease-out"
          style={{
            height: `${12 + height * 20}px`,
            opacity: isActive ? 0.6 + height * 0.4 : 0.2,
            boxShadow: isActive ? `0 0 8px hsl(var(--primary) / ${height * 0.6})` : 'none',
            transformOrigin: 'bottom',
            transform: `scaleY(${0.5 + height * 0.5})`,
          }}
        />
      ))}
    </div>
  );
};
