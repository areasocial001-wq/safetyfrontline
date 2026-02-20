import { cn } from "@/lib/utils";

interface KeyboardIndicatorProps {
  keysPressed: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
}

export const KeyboardIndicator = ({ keysPressed }: KeyboardIndicatorProps) => {
  const KeyButton = ({ 
    label, 
    pressed, 
    className 
  }: { 
    label: string; 
    pressed: boolean; 
    className?: string; 
  }) => (
    <div
      className={cn(
        "w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-100",
        "font-mono text-lg font-bold select-none",
        pressed
          ? "bg-primary/90 text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/50"
          : "bg-background/50 text-muted-foreground border-border/50",
        className
      )}
    >
      {label}
    </div>
  );

  return (
    <div className="fixed bottom-24 left-6 z-10 bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-2xl">
      <div className="flex flex-col gap-2">
        {/* Top row: W key */}
        <div className="flex justify-center">
          <KeyButton label="W" pressed={keysPressed.forward} />
        </div>
        
        {/* Middle row: A, S, D keys */}
        <div className="flex gap-2">
          <KeyButton label="A" pressed={keysPressed.left} />
          <KeyButton label="S" pressed={keysPressed.backward} />
          <KeyButton label="D" pressed={keysPressed.right} />
        </div>
      </div>

      {/* Instructions label */}
      <div className="mt-3 text-center text-xs text-muted-foreground font-medium">
        MOVIMENTO
      </div>
    </div>
  );
};
