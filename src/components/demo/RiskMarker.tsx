import { Risk } from "@/types/demo";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface RiskMarkerProps {
  risk: Risk;
  isFound: boolean;
  isRevealed: boolean;
  onClick: () => void;
}

export const RiskMarker = ({ risk, isFound, isRevealed, onClick }: RiskMarkerProps) => {
  const getSeverityColor = () => {
    switch (risk.severity) {
      case 'high':
        return 'border-destructive bg-destructive/10 hover:bg-destructive/20';
      case 'medium':
        return 'border-primary bg-primary/10 hover:bg-primary/20';
      case 'low':
        return 'border-accent bg-accent/10 hover:bg-accent/20';
    }
  };

  const getIconColor = () => {
    switch (risk.severity) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-primary';
      case 'low':
        return 'text-accent';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isFound}
      className={cn(
        "absolute rounded-full border-2 transition-all duration-300",
        "flex items-center justify-center cursor-pointer",
        !isFound && !isRevealed && "opacity-0 hover:opacity-60",
        isFound && "opacity-100 animate-scale-in",
        isRevealed && !isFound && "opacity-50",
        isFound ? "border-accent bg-accent/20" : getSeverityColor()
      )}
      style={{
        left: `${risk.x}%`,
        top: `${risk.y}%`,
        width: `${risk.size}px`,
        height: `${risk.size}px`,
        transform: 'translate(-50%, -50%)'
      }}
      aria-label={risk.description}
    >
      {isFound ? (
        <CheckCircle className="w-6 h-6 text-accent" />
      ) : isRevealed ? (
        <AlertTriangle className={cn("w-6 h-6", getIconColor())} />
      ) : null}
    </button>
  );
};
