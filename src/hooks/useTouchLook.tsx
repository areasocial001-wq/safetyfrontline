import { useCallback, useRef } from "react";

/**
 * Touch-look hook for 3D scenes.
 *
 * Accumulates yaw/pitch deltas emitted by a touch "look-pad" overlay into a
 * mutable ref, so the 3D render loop can consume and reset them every frame
 * without forcing React re-renders.
 *
 * Usage:
 *   const { lookDeltaRef, onLook, reset } = useTouchLook();
 *   <LookPad onLook={onLook} onEnd={reset} />
 *   <BabylonScene touchLookDeltaRef={lookDeltaRef} ... />
 */
export interface TouchLookDelta {
  dx: number; // accumulated horizontal pixels since last consume (yaw +right)
  dy: number; // accumulated vertical pixels since last consume (pitch +down)
}

export const useTouchLook = () => {
  const lookDeltaRef = useRef<TouchLookDelta>({ dx: 0, dy: 0 });

  const onLook = useCallback((dx: number, dy: number) => {
    lookDeltaRef.current.dx += dx;
    lookDeltaRef.current.dy += dy;
  }, []);

  const reset = useCallback(() => {
    lookDeltaRef.current.dx = 0;
    lookDeltaRef.current.dy = 0;
  }, []);

  return { lookDeltaRef, onLook, reset };
};
