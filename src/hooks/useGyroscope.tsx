import { useState, useEffect, useCallback, useRef, useMemo } from "react";

export interface GyroscopeData {
  alpha: number; // Rotation around z-axis (compass direction) 0-360
  beta: number;  // Rotation around x-axis (front-back tilt) -180 to 180
  gamma: number; // Rotation around y-axis (left-right tilt) -90 to 90
}

export const useGyroscope = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeData>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  
  const initialOrientation = useRef<GyroscopeData | null>(null);

  // Check if DeviceOrientation API is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  // Request permission (required for iOS 13+)
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('DeviceOrientation not supported');
      return false;
    }

    try {
      // Check if permission request is needed (iOS 13+)
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
          return true;
        } else {
          setHasPermission(false);
          return false;
        }
      } else {
        // Permission not needed (Android, older iOS)
        setHasPermission(true);
        return true;
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
      setHasPermission(false);
      return false;
    }
  }, [isSupported]);

  // Enable gyroscope
  const enable = useCallback(async () => {
    const permitted = await requestPermission();
    if (permitted) {
      setIsEnabled(true);
      initialOrientation.current = null; // Reset calibration
    }
  }, [requestPermission]);

  // Disable gyroscope
  const disable = useCallback(() => {
    setIsEnabled(false);
    initialOrientation.current = null;
  }, []);

  // Handle device orientation events
  useEffect(() => {
    if (!isEnabled || !hasPermission) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma } = event;

      if (alpha !== null && beta !== null && gamma !== null) {
        // Store initial orientation for calibration on first reading
        if (!initialOrientation.current) {
          initialOrientation.current = {
            alpha,
            beta,
            gamma,
          };
        }

        // Calculate relative orientation from initial position
        const relativeAlpha = alpha - (initialOrientation.current?.alpha || 0);
        const relativeBeta = beta - (initialOrientation.current?.beta || 0);
        const relativeGamma = gamma - (initialOrientation.current?.gamma || 0);

        setGyroscopeData({
          alpha: relativeAlpha,
          beta: relativeBeta,
          gamma: relativeGamma,
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isEnabled, hasPermission]);

  const recalibrate = useCallback(() => {
    initialOrientation.current = null;
  }, []);

  // Memoize gyroscope data to prevent unnecessary re-renders
  const memoizedGyroscopeData = useMemo(
    () => gyroscopeData,
    [gyroscopeData.alpha, gyroscopeData.beta, gyroscopeData.gamma]
  );

  return {
    isSupported,
    isEnabled,
    hasPermission,
    gyroscopeData: memoizedGyroscopeData,
    enable,
    disable,
    recalibrate,
  };
};
