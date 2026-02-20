import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Risk3D } from "@/data/scenarios3d";

interface RiskIndicatorProps {
  playerPosition: [number, number, number];
  playerRotation: number; // Camera rotation in radians
  risks: Risk3D[];
  maxDistance?: number;
}

export const RiskIndicator = ({
  playerPosition,
  playerRotation,
  risks,
  maxDistance = 8,
}: RiskIndicatorProps) => {
  const [nearestRisk, setNearestRisk] = useState<Risk3D | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastRiskId, setLastRiskId] = useState<string | null>(null);

  useEffect(() => {
    // Find the nearest unfound risk within maxDistance
    const unfoundRisks = risks.filter(r => !r.found);
    
    if (unfoundRisks.length === 0) {
      setNearestRisk(null);
      return;
    }

    let nearest: Risk3D | null = null;
    let minDist = Infinity;

    unfoundRisks.forEach(risk => {
      const dx = risk.position[0] - playerPosition[0];
      const dz = risk.position[2] - playerPosition[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= maxDistance && dist < minDist) {
        minDist = dist;
        nearest = risk;
      }
    });

    if (nearest) {
      // If this is a new risk, reset visibility
      if (lastRiskId !== nearest.id) {
        setIsVisible(true);
        setLastRiskId(nearest.id);
      }
      
      setNearestRisk(nearest);
      setDistance(minDist);

      // Calculate angle to risk relative to player facing direction
      const dx = nearest.position[0] - playerPosition[0];
      const dz = nearest.position[2] - playerPosition[2];
      
      // Angle from player to risk (in world space)
      const angleToRisk = Math.atan2(dx, dz);
      
      // Relative angle (accounting for player rotation)
      const relativeAngle = angleToRisk - playerRotation;
      
      // Convert to degrees
      setAngle(relativeAngle * (180 / Math.PI));
    } else {
      setNearestRisk(null);
    }
  }, [playerPosition, playerRotation, risks, maxDistance, lastRiskId]);

  // Auto-hide after 6 seconds for each new risk
  useEffect(() => {
    if (!nearestRisk) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000); // Hide after 6 seconds

    return () => clearTimeout(timer);
  }, [nearestRisk?.id]);

  if (!nearestRisk || !isVisible) {
    return null;
  }

  // Determine if risk is manual (critical) or procedural (generic)
  const isManualRisk = nearestRisk.isManual === true;

  // Visual styling based on risk type
  const getRiskTypeStyles = () => {
    if (isManualRisk) {
      // Manual critical risks: RED with intense pulsing glow animation
      return {
        color: 'text-red-600',
        border: 'border-red-600',
        shadow: 'shadow-[0_0_25px_rgba(220,38,38,0.7)]',
        glowAnimation: 'animate-pulse-glow-red',
        badge: '🚨 CRITICO',
        badgeBg: 'bg-red-600',
      };
    } else {
      // Procedural generic risks: ORANGE with subtle glow
      return {
        color: 'text-orange-500',
        border: 'border-orange-500',
        shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]',
        glowAnimation: 'animate-pulse-glow-orange',
        badge: '⚠️ GENERICO',
        badgeBg: 'bg-orange-500',
      };
    }
  };

  const riskStyles = getRiskTypeStyles();

  // Determine color based on severity
  const getSeverityColor = () => {
    switch (nearestRisk.severity) {
      case 'critical':
        return 'text-red-600 border-red-600';
      case 'high':
        return 'text-orange-500 border-orange-500';
      case 'medium':
        return 'text-amber-500 border-amber-500';
      case 'low':
        return 'text-green-500 border-green-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  // Calculate pulse speed based on distance (closer = faster)
  const getPulseSpeed = () => {
    const normalized = distance / maxDistance; // 0 to 1
    if (normalized < 0.25) return 'animate-pulse-fast';
    if (normalized < 0.5) return 'animate-pulse';
    if (normalized < 0.75) return 'animate-pulse-slow';
    return 'animate-pulse-slower';
  };

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex flex-col items-center gap-3">
        {/* Risk Type Badge */}
        <div 
          className={`${riskStyles.badgeBg} text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide ${riskStyles.glowAnimation}`}
          style={{
            boxShadow: isManualRisk 
              ? '0 0 25px rgba(220, 38, 38, 0.7)' 
              : '0 0 15px rgba(249, 115, 22, 0.5)'
          }}
        >
          {riskStyles.badge}
        </div>

        {/* Arrow indicator */}
        <div
          className={`relative ${riskStyles.color} ${riskStyles.shadow} ${riskStyles.glowAnimation}`}
          style={{
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          <ChevronUp size={isManualRisk ? 64 : 56} strokeWidth={isManualRisk ? 5 : 3} />
        </div>

        {/* Distance and risk info */}
        <div 
          className={`bg-background/95 backdrop-blur-sm rounded-xl px-5 py-3 ${riskStyles.border} ${riskStyles.shadow} ${riskStyles.glowAnimation}`}
          style={{
            borderWidth: isManualRisk ? '4px' : '2px',
          }}
        >
          <div className="text-center space-y-1">
            <div className={`text-base font-black ${riskStyles.color} uppercase tracking-tight`}>
              {nearestRisk.label}
            </div>
            <div className={`text-sm font-bold mt-1 ${riskStyles.color} opacity-90`}>
              📍 Distanza: {distance.toFixed(1)}m
            </div>
            {isManualRisk && (
              <div className="text-xs text-red-600 font-black mt-2 animate-pulse-fast bg-red-100 dark:bg-red-950 px-3 py-1 rounded-full">
                ⚡ PRIORITÀ MASSIMA
              </div>
            )}
          </div>
        </div>

        {/* Visual ring indicator */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth={isManualRisk ? "8" : "5"}
              className={`opacity-20 ${riskStyles.color}`}
            />
            {/* Progress circle based on distance */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth={isManualRisk ? "8" : "5"}
              strokeDasharray={`${(1 - distance / maxDistance) * 251} 251`}
              className={`${riskStyles.color} ${riskStyles.glowAnimation}`}
              style={{
                filter: isManualRisk 
                  ? 'drop-shadow(0 0 10px currentColor)' 
                  : 'drop-shadow(0 0 5px currentColor)',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-black ${riskStyles.color}`}>
              {Math.round((1 - distance / maxDistance) * 100)}%
            </span>
            <span className={`text-[10px] font-bold ${riskStyles.color} opacity-70 uppercase tracking-wider`}>
              Vicinanza
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
