import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

interface LookPadProps {
  /** Called with raw pixel deltas (dx, dy) on each touch move. */
  onLook: (dx: number, dy: number) => void;
  /** Called when the look gesture ends. */
  onEnd?: () => void;
  /**
   * Called once when the user taps the pad without dragging more than ~10px.
   * Used to forward a "tap to interact" event (equivalent to a left click)
   * when the underlying 3D canvas is covered by this transparent overlay.
   */
  onTap?: (clientX: number, clientY: number) => void;
  className?: string;
}

/**
 * Invisible touch zone covering (by default) the right half of the screen,
 * used to rotate the first-person camera on mobile. Sits above the 3D canvas
 * with `pointer-events: auto` and `touch-action: none` so the browser does
 * not steal the gesture for native scrolling/zooming.
 *
 * Multi-touch safe: only the first finger that lands on the pad is tracked,
 * so the user can simultaneously operate the VirtualJoystick on the left.
 */
export const LookPad = ({ onLook, onEnd, onTap, className }: LookPadProps) => {
  const padRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const movedDistance = useRef(0);

  useEffect(() => {
    const el = padRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (activeTouchId.current !== null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      activeTouchId.current = touch.identifier;
      lastPos.current = { x: touch.clientX, y: touch.clientY };
      startPos.current = { x: touch.clientX, y: touch.clientY };
      movedDistance.current = 0;
      // Prevent native scroll/zoom while looking around
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== activeTouchId.current) continue;
        const dx = t.clientX - lastPos.current.x;
        const dy = t.clientY - lastPos.current.y;
        lastPos.current = { x: t.clientX, y: t.clientY };
        movedDistance.current += Math.abs(dx) + Math.abs(dy);
        onLook(dx, dy);
        e.preventDefault();
        break;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== activeTouchId.current) continue;
        activeTouchId.current = null;
        // Treat short, low-movement touches as a tap (interact)
        if (movedDistance.current < 10 && onTap) {
          onTap(startPos.current.x, startPos.current.y);
        }
        onEnd?.();
        e.preventDefault();
        break;
      }
    };

    // passive:false is required so preventDefault() actually blocks scroll
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onLook, onEnd, onTap]);

  return (
    <div
      ref={padRef}
      className={cn(
        // Right half of the screen, above the 3D canvas but below HUD popovers
        "fixed top-0 right-0 h-full w-1/2 z-20",
        "touch-none select-none",
        className
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
      aria-hidden="true"
    >
      {/* Subtle hint badge in the corner — only opacity, no layout */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/40 backdrop-blur-sm border border-border/40 text-[10px] text-muted-foreground/70 pointer-events-none">
        <Eye className="w-3 h-3" />
        <span className="font-medium">GUARDA</span>
      </div>
    </div>
  );
};
