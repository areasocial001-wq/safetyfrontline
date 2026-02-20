import { useState, useEffect, useMemo } from 'react';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface GraphicsSettings {
  quality: GraphicsQuality;
  shadows: boolean;
  shadowQuality: 'low' | 'medium' | 'high';
  textureQuality: number; // anisotropy level
  antialiasing: boolean;
  maxTriangles: number;
  renderDistance: number;
  frustumCulling: boolean;
  proceduralRisks: boolean;
}

export interface AudioSettings {
  voiceOverEnabled: boolean;
  subtitlesEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  mouseSensitivity: number; // 100-1000, lower = more sensitive
}

const QUALITY_PRESETS: Record<GraphicsQuality, GraphicsSettings> = {
  low: {
    quality: 'low',
    shadows: false,
    shadowQuality: 'low',
    textureQuality: 1,
    antialiasing: false,
    maxTriangles: 50000,
    renderDistance: 50,
    frustumCulling: true,
    proceduralRisks: false,
  },
  medium: {
    quality: 'medium',
    shadows: true,
    shadowQuality: 'low',
    textureQuality: 2,
    antialiasing: false,
    maxTriangles: 150000,
    renderDistance: 75,
    frustumCulling: true,
    proceduralRisks: true,
  },
  high: {
    quality: 'high',
    shadows: true,
    shadowQuality: 'medium',
    textureQuality: 4,
    antialiasing: true,
    maxTriangles: 300000,
    renderDistance: 100,
    frustumCulling: true,
    proceduralRisks: true,
  },
  ultra: {
    quality: 'ultra',
    shadows: true,
    shadowQuality: 'high',
    textureQuality: 8,
    antialiasing: true,
    maxTriangles: Infinity,
    renderDistance: 150,
    frustumCulling: false,
    proceduralRisks: true,
  },
};

const STORAGE_KEY = 'graphics-settings-quality';
const AUDIO_STORAGE_KEY = 'audio-settings';

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  voiceOverEnabled: true,
  subtitlesEnabled: false,
  musicVolume: 0.5,
  effectsVolume: 0.7,
  mouseSensitivity: 500, // Default balanced sensitivity
};

export const useGraphicsSettings = () => {
  const [quality, setQualityState] = useState<GraphicsQuality>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as GraphicsQuality) || 'medium';
  });

  const [audioSettings, setAudioSettingsState] = useState<AudioSettings>(() => {
    const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_AUDIO_SETTINGS;
  });

  // Memoize settings to prevent re-renders
  const settings = useMemo(() => QUALITY_PRESETS[quality], [quality]);

  const setQuality = (newQuality: GraphicsQuality) => {
    setQualityState(newQuality);
    localStorage.setItem(STORAGE_KEY, newQuality);
  };

  const updateAudioSettings = (updates: Partial<AudioSettings>) => {
    const newSettings = { ...audioSettings, ...updates };
    setAudioSettingsState(newSettings);
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Auto-detect optimal quality on first load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Detect device capabilities
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!gl) {
        setQuality('low');
        return;
      }

      // Check for mobile/tablet
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        setQuality('medium');
      } else {
        // Desktop - check memory
        const memory = (performance as any).memory;
        if (memory && memory.jsHeapSizeLimit) {
          const memoryGB = memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
          if (memoryGB > 4) {
            setQuality('high');
          } else {
            setQuality('medium');
          }
        } else {
          setQuality('high');
        }
      }
    }
  }, []);

  return {
    quality,
    settings,
    setQuality,
    presets: QUALITY_PRESETS,
    audioSettings,
    updateAudioSettings,
  };
};
