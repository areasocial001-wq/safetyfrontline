import { useMemo } from "react";
import { Risk3D } from "@/data/scenarios3d";
import { Card } from "@/components/ui/card";

interface ProximityRadarProps {
  playerPosition: [number, number, number];
  playerRotation: number;
  risks: Risk3D[];
  maxDistance?: number;
}

export const ProximityRadar = ({
  playerPosition,
  playerRotation,
  risks,
  maxDistance = 12,
}: ProximityRadarProps) => {
  const radarSize = 140;
  const radarRadius = radarSize / 2 - 12;

  const nearbyRisks = useMemo(() => {
    return risks
      .filter((r) => !r.found)
      .map((risk) => {
        const dx = risk.position[0] - playerPosition[0];
        const dz = risk.position[2] - playerPosition[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > maxDistance) return null;

        // Angle from player to risk in world space
        const worldAngle = Math.atan2(dx, dz);
        // Relative angle accounting for player rotation
        const relAngle = worldAngle - playerRotation;

        return { risk, dist, relAngle };
      })
      .filter(Boolean) as { risk: Risk3D; dist: number; relAngle: number }[];
  }, [playerPosition, playerRotation, risks, maxDistance]);

  if (nearbyRisks.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "#dc2626";
      case "high": return "#ea580c";
      case "medium": return "#ca8a04";
      default: return "#22c55e";
    }
  };

  return (
    <Card className="fixed top-4 right-4 z-30 p-2 bg-card/90 backdrop-blur-sm border-primary/20">
      <div className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider mb-1">
        Radar Rischi
      </div>
      <div className="relative" style={{ width: radarSize, height: radarSize }}>
        <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
          {/* Background circles */}
          {[1, 0.66, 0.33].map((f, i) => (
            <circle
              key={i}
              cx={radarSize / 2}
              cy={radarSize / 2}
              r={radarRadius * f}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}

          {/* Cross-hair lines */}
          <line x1={radarSize / 2} y1={8} x2={radarSize / 2} y2={radarSize - 8} stroke="currentColor" className="text-border" strokeWidth="0.5" opacity="0.2" />
          <line x1={8} y1={radarSize / 2} x2={radarSize - 8} y2={radarSize / 2} stroke="currentColor" className="text-border" strokeWidth="0.5" opacity="0.2" />

          {/* Sweep effect */}
          <defs>
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <circle
            cx={radarSize / 2}
            cy={radarSize / 2}
            r={radarRadius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0.25"
          >
            <animate attributeName="r" values={`${radarRadius};${radarRadius - 2};${radarRadius}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0.4;0.25" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Player indicator (center) */}
          <polygon
            points={`${radarSize / 2},${radarSize / 2 - 6} ${radarSize / 2 + 4},${radarSize / 2 + 4} ${radarSize / 2 - 4},${radarSize / 2 + 4}`}
            fill="hsl(var(--primary))"
            opacity="0.9"
          />

          {/* Risk blips */}
          {nearbyRisks.map(({ risk, dist, relAngle }) => {
            const normalizedDist = Math.min(dist / maxDistance, 1);
            const r = normalizedDist * radarRadius;
            // Convert: 0 = forward (up on radar), clockwise positive
            const bx = radarSize / 2 + Math.sin(relAngle) * r;
            const by = radarSize / 2 - Math.cos(relAngle) * r;
            const color = getSeverityColor(risk.severity);
            const blipSize = risk.isManual ? 6 : 4;
            const pulseSize = blipSize + 4;

            return (
              <g key={risk.id}>
                {/* Pulse ring */}
                <circle cx={bx} cy={by} r={pulseSize} fill="none" stroke={color} strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values={`${pulseSize};${pulseSize + 3};${pulseSize}`} dur={risk.isManual ? "0.8s" : "1.5s"} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur={risk.isManual ? "0.8s" : "1.5s"} repeatCount="indefinite" />
                </circle>
                {/* Blip */}
                <circle cx={bx} cy={by} r={blipSize} fill={color} opacity="0.85">
                  <animate attributeName="opacity" values="0.85;1;0.85" dur="1s" repeatCount="indefinite" />
                </circle>
                {/* Distance label */}
                {dist < 8 && (
                  <text
                    x={bx}
                    y={by + blipSize + 9}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill={color}
                    opacity="0.9"
                  >
                    {dist.toFixed(1)}m
                  </text>
                )}
                {/* Direction line from center to blip (faint) */}
                <line
                  x1={radarSize / 2}
                  y1={radarSize / 2}
                  x2={bx}
                  y2={by}
                  stroke={color}
                  strokeWidth="0.7"
                  opacity="0.2"
                  strokeDasharray="2,3"
                />
              </g>
            );
          })}
        </svg>

        {/* Distance labels */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground opacity-50">
          {maxDistance}m
        </div>
      </div>
      <div className="text-[9px] text-center text-muted-foreground mt-1">
        {nearbyRisks.length} {nearbyRisks.length === 1 ? "rischio" : "rischi"} nel raggio
      </div>
    </Card>
  );
};
