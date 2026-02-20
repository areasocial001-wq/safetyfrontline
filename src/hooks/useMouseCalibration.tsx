import { useState, useEffect, useRef, useCallback } from 'react';

export interface MouseCalibrationData {
  totalMovement: number;
  movementCount: number;
  averageSpeed: number;
  maxSpeed: number;
  recommendedSensitivity: number;
}

export interface MouseCalibrationResult {
  isCalibrating: boolean;
  progress: number; // 0-100
  data: MouseCalibrationData | null;
  isComplete: boolean;
  startCalibration: () => void;
  resetCalibration: () => void;
  skipCalibration: () => void;
  trackMouseMovement: (deltaX: number, deltaY: number) => void;
}

const CALIBRATION_DURATION = 10000; // 10 seconds
const MIN_SENSITIVITY = 100;
const MAX_SENSITIVITY = 1000;
const DEFAULT_SENSITIVITY = 500;

export const useMouseCalibration = (): MouseCalibrationResult => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<MouseCalibrationData | null>(null);
  const [isComplete, setIsComplete] = useState(() => {
    // Check if calibration was already completed
    return localStorage.getItem('mouse-calibration-completed') === 'true';
  });

  const calibrationStartTime = useRef<number>(0);
  const mouseMovements = useRef<{ deltaX: number; deltaY: number; timestamp: number }[]>([]);
  const animationFrameRef = useRef<number>(0);

  const calculateRecommendedSensitivity = useCallback((movements: typeof mouseMovements.current): number => {
    if (movements.length === 0) return DEFAULT_SENSITIVITY;

    // Calculate total movement magnitude
    const totalMovement = movements.reduce((sum, m) => {
      return sum + Math.sqrt(m.deltaX * m.deltaX + m.deltaY * m.deltaY);
    }, 0);

    // Calculate average speed (pixels per second)
    const duration = (movements[movements.length - 1].timestamp - movements[0].timestamp) / 1000;
    const averageSpeed = totalMovement / Math.max(duration, 1);

    // Determine sensitivity based on movement patterns
    // Higher average speed = user prefers fast movements = need lower sensitivity number
    // Lower average speed = user prefers slow movements = need higher sensitivity number
    
    let recommendedSensitivity: number;
    
    if (averageSpeed > 800) {
      // Very fast movements - user has high DPI or prefers fast look
      recommendedSensitivity = 200; // Very sensitive
    } else if (averageSpeed > 500) {
      // Fast movements
      recommendedSensitivity = 350; // Sensitive
    } else if (averageSpeed > 300) {
      // Moderate movements
      recommendedSensitivity = 500; // Balanced (default)
    } else if (averageSpeed > 150) {
      // Slow movements
      recommendedSensitivity = 700; // Less sensitive
    } else {
      // Very slow movements - user prefers precise control
      recommendedSensitivity = 900; // Least sensitive
    }

    // Clamp to valid range
    return Math.max(MIN_SENSITIVITY, Math.min(MAX_SENSITIVITY, recommendedSensitivity));
  }, []);

  const trackMouseMovement = useCallback((deltaX: number, deltaY: number) => {
    if (!isCalibrating) return;

    mouseMovements.current.push({
      deltaX,
      deltaY,
      timestamp: Date.now(),
    });
  }, [isCalibrating]);

  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setProgress(0);
    setIsComplete(false);
    calibrationStartTime.current = Date.now();
    mouseMovements.current = [];

    console.log('[MouseCalibration] Started calibration - move your mouse naturally for 10 seconds');
  }, []);

  const finishCalibration = useCallback(() => {
    setIsCalibrating(false);
    setProgress(100);

    // Calculate statistics
    const movements = mouseMovements.current;
    const totalMovement = movements.reduce((sum, m) => {
      return sum + Math.sqrt(m.deltaX * m.deltaX + m.deltaY * m.deltaY);
    }, 0);

    const speeds = movements.map((m, i) => {
      if (i === 0) return 0;
      const prev = movements[i - 1];
      const deltaTime = (m.timestamp - prev.timestamp) / 1000;
      const deltaDistance = Math.sqrt(m.deltaX * m.deltaX + m.deltaY * m.deltaY);
      return deltaDistance / Math.max(deltaTime, 0.001);
    });

    const averageSpeed = speeds.reduce((sum, s) => sum + s, 0) / Math.max(speeds.length, 1);
    const maxSpeed = Math.max(...speeds);
    const recommendedSensitivity = calculateRecommendedSensitivity(movements);

    const calibrationData: MouseCalibrationData = {
      totalMovement,
      movementCount: movements.length,
      averageSpeed,
      maxSpeed,
      recommendedSensitivity,
    };

    setData(calibrationData);
    setIsComplete(true);
    localStorage.setItem('mouse-calibration-completed', 'true');

    console.log('[MouseCalibration] Calibration complete:', {
      totalMovement: totalMovement.toFixed(0),
      movementCount: movements.length,
      averageSpeed: averageSpeed.toFixed(0),
      maxSpeed: maxSpeed.toFixed(0),
      recommendedSensitivity,
    });
  }, [calculateRecommendedSensitivity]);

  const resetCalibration = useCallback(() => {
    setIsCalibrating(false);
    setProgress(0);
    setData(null);
    setIsComplete(false);
    mouseMovements.current = [];
    localStorage.removeItem('mouse-calibration-completed');
    console.log('[MouseCalibration] Reset calibration');
  }, []);

  const skipCalibration = useCallback(() => {
    setIsCalibrating(false);
    setProgress(0);
    setData(null);
    setIsComplete(true);
    localStorage.setItem('mouse-calibration-completed', 'true');
    console.log('[MouseCalibration] Skipped calibration');
  }, []);

  // Update progress during calibration
  useEffect(() => {
    if (!isCalibrating) return;

    const updateProgress = () => {
      const elapsed = Date.now() - calibrationStartTime.current;
      const newProgress = Math.min((elapsed / CALIBRATION_DURATION) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= CALIBRATION_DURATION) {
        finishCalibration();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCalibrating, finishCalibration]);

  return {
    isCalibrating,
    progress,
    data,
    isComplete,
    startCalibration,
    resetCalibration,
    skipCalibration,
    trackMouseMovement,
  };
};

// Export tracking function for external use
export const createMouseMovementTracker = (onMouseMove: (deltaX: number, deltaY: number) => void) => {
  return (event: MouseEvent) => {
    if (event.movementX !== 0 || event.movementY !== 0) {
      onMouseMove(event.movementX, event.movementY);
    }
  };
};
