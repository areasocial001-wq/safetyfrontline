import { Button } from "@/components/ui/button";
import { Camera, Eye, Truck, Plane, User } from "lucide-react";

export type CameraPresetName = "pedestrian" | "drone" | "excavator" | "truck";

interface CameraPresetsPanelProps {
  active: CameraPresetName;
  onChange: (name: CameraPresetName) => void;
  className?: string;
}

const PRESETS: Array<{
  id: CameraPresetName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "pedestrian", label: "Pedonale", icon: User },
  { id: "drone", label: "Drone", icon: Plane },
  { id: "excavator", label: "Escavatore", icon: Eye },
  { id: "truck", label: "Dumper", icon: Truck },
];

/**
 * Compact camera preset selector for the construction scenario.
 * Hidden automatically on very small viewports via parent CSS.
 */
export const CameraPresetsPanel = ({
  active,
  onChange,
  className = "",
}: CameraPresetsPanelProps) => {
  return (
    <div
      className={`pointer-events-auto bg-background/85 backdrop-blur-md border border-border/60 rounded-xl shadow-xl p-2 ${className}`}
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center gap-1.5 px-1.5 pb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
        <Camera className="w-3 h-3" />
        Vista cantiere
      </div>
      <div className="grid grid-cols-2 gap-1">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const isActive = active === p.id;
          return (
            <Button
              key={p.id}
              size="sm"
              variant={isActive ? "default" : "ghost"}
              onClick={() => onChange(p.id)}
              className="h-9 px-2 text-xs justify-start gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {p.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
