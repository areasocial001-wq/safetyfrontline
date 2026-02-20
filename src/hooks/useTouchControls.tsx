import { useState, useCallback, useRef, useEffect, useMemo } from "react";

export interface TouchMovement {
  forward: number;  // 0 to 1
  backward: number; // 0 to 1
  left: number;     // 0 to 1
  right: number;    // 0 to 1
}

export const useTouchControls = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchMovement, setTouchMovement] = useState<TouchMovement>({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
  });

  // Memoize touch movement to prevent unnecessary re-renders
  const memoizedTouchMovement = useMemo(() => touchMovement, [
    touchMovement.forward,
    touchMovement.backward,
    touchMovement.left,
    touchMovement.right,
  ]);

  // Detect if device supports touch
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleJoystickMove = useCallback((deltaX: number, deltaY: number) => {
    // deltaX and deltaY are normalized between -1 and 1
    // Convert to movement directions with intensity
    const movement: TouchMovement = {
      forward: Math.max(0, -deltaY),  // up is negative Y
      backward: Math.max(0, deltaY),  // down is positive Y
      left: Math.max(0, -deltaX),     // left is negative X
      right: Math.max(0, deltaX),     // right is positive X
    };
    
    setTouchMovement(movement);
  }, []);

  const resetMovement = useCallback(() => {
    setTouchMovement({
      forward: 0,
      backward: 0,
      left: 0,
      right: 0,
    });
  }, []);

  return {
    isTouchDevice,
    touchMovement: memoizedTouchMovement,
    handleJoystickMove,
    resetMovement,
  };
};
