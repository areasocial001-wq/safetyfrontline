import { Smartphone, SmartphoneNfc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GyroscopeToggleProps {
  isSupported: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

export const GyroscopeToggle = ({
  isSupported,
  isEnabled,
  onToggle,
  className,
}: GyroscopeToggleProps) => {
  if (!isSupported) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="icon"
            onClick={onToggle}
            className={cn(
              "fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full shadow-2xl transition-all",
              isEnabled && "bg-primary shadow-primary/50 scale-110",
              className
            )}
          >
            {isEnabled ? (
              <SmartphoneNfc className="w-6 h-6 animate-pulse" />
            ) : (
              <Smartphone className="w-6 h-6" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="font-semibold mb-1">
            {isEnabled ? "Giroscopio Attivo" : "Attiva Giroscopio"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isEnabled
              ? "Muovi il dispositivo per ruotare la telecamera"
              : "Usa l'accelerometro del telefono per controllare la telecamera"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
