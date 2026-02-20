import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface VirtualJoystickProps {
  onMove: (deltaX: number, deltaY: number) => void;
  onEnd: () => void;
  className?: string;
}

export const VirtualJoystick = ({ onMove, onEnd, className }: VirtualJoystickProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const currentTouch = useRef<number | null>(null);

  const maxDistance = 50; // Maximum distance the knob can move from center

  const handleStart = (clientX: number, clientY: number, touchId?: number) => {
    if (!joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    startPos.current = { x: centerX, y: centerY };
    currentTouch.current = touchId ?? null;
    setIsDragging(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    // Calculate distance and clamp to maxDistance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const clampedDistance = Math.min(distance, maxDistance);
    
    // Calculate angle
    const angle = Math.atan2(deltaY, deltaX);
    
    // Calculate clamped position
    const clampedX = Math.cos(angle) * clampedDistance;
    const clampedY = Math.sin(angle) * clampedDistance;
    
    setPosition({ x: clampedX, y: clampedY });
    
    // Normalize to -1 to 1 range for movement
    const normalizedX = clampedX / maxDistance;
    const normalizedY = clampedY / maxDistance;
    
    onMove(normalizedX, normalizedY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    currentTouch.current = null;
    onEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY, touch.identifier);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (currentTouch.current === null) return;
    
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.identifier === currentTouch.current) {
        handleMove(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (currentTouch.current === null) return;
    
    // Check if the touch that ended is ours
    let touchEnded = true;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === currentTouch.current) {
        touchEnded = false;
        break;
      }
    }
    
    if (touchEnded) {
      handleEnd();
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className={cn("fixed bottom-6 left-6 z-30", className)}>
      {/* Joystick Base */}
      <div
        ref={joystickRef}
        className="relative w-32 h-32 rounded-full bg-background/40 backdrop-blur-sm border-2 border-border/50 shadow-2xl flex items-center justify-center touch-none select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Direction indicators */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ChevronUp className="absolute top-2 w-6 h-6 text-muted-foreground/40" />
          <ChevronDown className="absolute bottom-2 w-6 h-6 text-muted-foreground/40" />
          <ChevronLeft className="absolute left-2 w-6 h-6 text-muted-foreground/40" />
          <ChevronRight className="absolute right-2 w-6 h-6 text-muted-foreground/40" />
        </div>

        {/* Center icon */}
        {!isDragging && (
          <Move className="w-8 h-8 text-muted-foreground/50 pointer-events-none" />
        )}

        {/* Draggable Knob */}
        <div
          ref={knobRef}
          className={cn(
            "absolute w-16 h-16 rounded-full bg-primary/90 border-2 border-primary shadow-lg transition-all pointer-events-none",
            isDragging ? "scale-110 shadow-primary/50" : "scale-100"
          )}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <Move className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2 text-center text-xs text-muted-foreground font-medium">
        MOVIMENTO
      </div>
    </div>
  );
};
