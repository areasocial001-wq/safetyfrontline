interface CrosshairProps {
  visible: boolean;
  aimingAtFire: boolean;
  empty?: boolean;
}

/**
 * Center-screen crosshair for precision aiming the extinguisher.
 * Turns red+pulse when aiming at a fire, dim grey when extinguisher is empty.
 */
export const Crosshair = ({ visible, aimingAtFire, empty = false }: CrosshairProps) => {
  if (!visible) return null;

  const color = empty
    ? 'hsl(var(--muted-foreground))'
    : aimingAtFire
      ? 'hsl(var(--destructive))'
      : 'hsl(var(--foreground))';

  const glow = aimingAtFire
    ? '0 0 8px hsl(var(--destructive)), 0 0 16px hsl(var(--destructive) / 0.6)'
    : '0 0 4px hsl(0 0% 0% / 0.8)';

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div
        className={`relative ${aimingAtFire ? 'animate-pulse' : ''}`}
        style={{ width: 32, height: 32 }}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color, boxShadow: glow, opacity: aimingAtFire ? 1 : 0.7 }}
        />
        {/* Center dot */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 4, height: 4, backgroundColor: color, boxShadow: glow }}
        />
        {/* Cross lines */}
        <div className="absolute left-1/2 top-0 h-[6px] w-[2px] -translate-x-1/2" style={{ backgroundColor: color }} />
        <div className="absolute left-1/2 bottom-0 h-[6px] w-[2px] -translate-x-1/2" style={{ backgroundColor: color }} />
        <div className="absolute top-1/2 left-0 h-[2px] w-[6px] -translate-y-1/2" style={{ backgroundColor: color }} />
        <div className="absolute top-1/2 right-0 h-[2px] w-[6px] -translate-y-1/2" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
};
