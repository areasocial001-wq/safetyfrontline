interface FireVignetteOverlayProps {
  level: number; // 0-1 normalized
  visible: boolean;
}

export const FireVignetteOverlay = ({ level, visible }: FireVignetteOverlayProps) => {
  if (!visible || level <= 0.7) return null;

  // Intensity scales from 0 (at 70%) to 1 (at 100%)
  const intensity = Math.min((level - 0.7) / 0.3, 1);
  // Pulse speed increases with intensity
  const pulseDuration = 2 - intensity * 1.2; // 2s -> 0.8s

  return (
    <div
      className="absolute inset-0 z-25 pointer-events-none"
      style={{
        animation: `fireVignettePulse ${pulseDuration}s ease-in-out infinite`,
        background: `radial-gradient(ellipse at center, 
          transparent 30%, 
          rgba(220, 38, 38, ${0.15 + intensity * 0.35}) 70%, 
          rgba(153, 27, 27, ${0.3 + intensity * 0.4}) 100%)`,
      }}
    >
      {/* Top/bottom red bars that grow with intensity */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${4 + intensity * 8}%`,
          background: `linear-gradient(to bottom, rgba(220, 38, 38, ${0.4 + intensity * 0.3}), transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: `${4 + intensity * 8}%`,
          background: `linear-gradient(to top, rgba(220, 38, 38, ${0.4 + intensity * 0.3}), transparent)`,
        }}
      />

      <style>{`
        @keyframes fireVignettePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
