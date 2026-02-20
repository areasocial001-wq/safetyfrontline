import { useEffect, useRef, useState } from 'react';

interface IntroMusicConfig {
  enabled?: boolean;
  volume?: number;
  autoplay?: boolean;
}

export const useIntroMusic = (config: IntroMusicConfig = {}) => {
  const { enabled = true, volume = 0.15, autoplay = true } = config;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(enabled);

  const playMusic = () => {
    if (audioRef.current && musicEnabled) {
      audioRef.current.play().catch(err => {
        console.log('Audio playback prevented:', err);
      });
      setIsPlaying(true);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  };

  const setVolumeLevel = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && musicEnabled) {
      // Create audio element
      audioRef.current = new Audio('/sounds/homepage-intro.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      
      if (autoplay) {
        // Start music after a short delay
        const timer = setTimeout(() => {
          playMusic();
        }, 500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      stopMusic();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [musicEnabled, autoplay]);

  return {
    isPlaying,
    musicEnabled,
    toggleMusic,
    setVolumeLevel,
    setMusicEnabled,
    audioElement: audioRef.current,
  };
};
