import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadabilityToggleProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
}

/**
 * Top-right toggle to switch the antincendio scene between
 * "cinematic" (default) and "best readability" rendering modes.
 *
 * Best readability reduces fog, vignette and chromatic aberration and
 * slightly raises exposure so the smoke does not visually merge with the
 * environment during the micro-challenge.
 */
export const ReadabilityToggle = ({ enabled, onToggle }: ReadabilityToggleProps) => {
  return (
    <div className="absolute top-20 right-4 z-40 pointer-events-auto">
      <Button
        size="sm"
        variant={enabled ? "default" : "secondary"}
        onClick={() => onToggle(!enabled)}
        className="gap-2 shadow-lg backdrop-blur-md bg-background/90 hover:bg-background border border-border"
        aria-pressed={enabled}
        title={enabled ? "Disattiva modalità leggibilità" : "Attiva miglior leggibilità"}
      >
        {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        <span className="text-xs font-semibold">
          {enabled ? "Leggibilità ON" : "Miglior leggibilità"}
        </span>
      </Button>
    </div>
  );
};
