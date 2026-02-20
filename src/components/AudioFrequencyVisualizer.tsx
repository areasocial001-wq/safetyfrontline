import { useEffect, useRef } from 'react';

interface AudioFrequencyVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const AudioFrequencyVisualizer = ({ audioElement, isPlaying }: AudioFrequencyVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastIntensityRef = useRef<number>(0);
  const peakThresholdRef = useRef<number>(0.05); // Abbassata da 0.15 per più sensibilità
  const currentColorRef = useRef({ h: 24, s: 100, l: 58 }); // Start with orange

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Only create AudioContext and source once
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        try {
          const source = audioContext.createMediaElementSource(audioElement);
          sourceRef.current = source;
          
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          
          analyserRef.current = analyser;
        } catch (err) {
          console.log('Audio element already connected, this is OK');
          // If already connected, we still need an analyser
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
        }
      }
      
      if (!analyserRef.current) return;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength) as Uint8Array;
      dataArrayRef.current = dataArray;

      // Set canvas size
      const setCanvasSize = () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };
      setCanvasSize();
      window.addEventListener('resize', setCanvasSize);

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        animationRef.current = requestAnimationFrame(draw);

        // @ts-ignore - TypeScript strict types for Uint8Array
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        // Calculate average intensity from frequency data
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const avgIntensity = Math.min(1, (sum / dataArrayRef.current.length / 255) * 1.8); // Amplificato per maggiore sensibilità

        // Smooth color interpolation based on intensity
        const lerpColor = (t: number) => {
          // Soglie abbassate: orange (0-0.2), cyan (0.2-0.5), purple (0.5-1.0)
          let targetColor = { h: 24, s: 100, l: 58 }; // Orange
          
          if (t < 0.2) {
            // Low intensity - Stay orange
            targetColor = { h: 24, s: 100, l: 58 };
          } else if (t < 0.5) {
            // Interpolate from orange to cyan
            const localT = (t - 0.2) / 0.3; // Normalize to 0-1
            targetColor = {
              h: 24 + (180 - 24) * localT, // 24 (orange) -> 180 (cyan)
              s: 100,
              l: 58 + (60 - 58) * localT // 58 -> 60
            };
          } else {
            // Interpolate from cyan to purple
            const localT = (t - 0.5) / 0.5; // Normalize to 0-1
            targetColor = {
              h: 180 + (280 - 180) * localT, // 180 (cyan) -> 280 (purple)
              s: 100,
              l: 60 + (70 - 60) * localT // 60 -> 70
            };
          }
          
          // Interpolazione più veloce per transizioni più evidenti
          const lerpFactor = 0.25; // Aumentato da 0.15
          currentColorRef.current = {
            h: currentColorRef.current.h + (targetColor.h - currentColorRef.current.h) * lerpFactor,
            s: currentColorRef.current.s + (targetColor.s - currentColorRef.current.s) * lerpFactor,
            l: currentColorRef.current.l + (targetColor.l - currentColorRef.current.l) * lerpFactor
          };
          
          return currentColorRef.current;
        };

        const smoothColor = lerpColor(avgIntensity);
        
        // Generate color variations for gradients
        const colors = {
          color1: `hsl(${smoothColor.h}, ${smoothColor.s}%, ${smoothColor.l}%)`,
          color2: `hsl(${smoothColor.h + 10}, ${smoothColor.s - 5}%, ${smoothColor.l - 8}%)`,
          color3: `hsl(${smoothColor.h - 10}, ${smoothColor.s}%, ${smoothColor.l + 5}%)`,
          glow: `hsl(${smoothColor.h}, ${smoothColor.s}%, ${smoothColor.l + 10}%)`
        };

        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);

        // Draw pulsating background glow layer
        const centerX = width / 2;
        const centerYBg = height / 2;
        const maxRadius = Math.max(width, height) * 0.8;
        const pulseRadius = maxRadius * (0.6 + avgIntensity * 0.4); // Pulse based on intensity
        
        // Create radial gradient for atmospheric glow
        const bgGradient = ctx.createRadialGradient(centerX, centerYBg, 0, centerX, centerYBg, pulseRadius);
        
        // Color stops based on music intensity
        const glowAlpha = avgIntensity * 0.4; // Max 40% opacity
        const bgColor = colors.color2.replace('hsl', 'hsla').replace(')', `, ${glowAlpha})`);
        const bgColor2 = colors.color1.replace('hsl', 'hsla').replace(')', `, ${glowAlpha * 0.5})`);
        
        bgGradient.addColorStop(0, bgColor);
        bgGradient.addColorStop(0.4, bgColor2);
        bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        const barCount = 64;
        const barWidth = width / barCount;
        const centerY = height / 2;

        // Detect peaks and spawn particles
        const intensityDelta = avgIntensity - lastIntensityRef.current;
        if (intensityDelta > peakThresholdRef.current && avgIntensity > 0.15) {
          // Peak detected! Spawn particle burst
          const numParticles = Math.floor(15 + avgIntensity * 30);
          for (let i = 0; i < numParticles; i++) {
            // Find random high bar positions for particle spawn
            const randomBar = Math.floor(Math.random() * barCount);
            const dataIndex = Math.floor((randomBar / barCount) * dataArrayRef.current.length);
            const value = dataArrayRef.current[dataIndex];
            
            if (value > 80) { // Abbassata da 150 per più particelle
              const barHeight = (value / 255) * (height * 0.8);
              const x = randomBar * barWidth + barWidth / 2;
              const y = centerY - barHeight / 2;
              
              particlesRef.current.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 5,
                vy: -Math.random() * 4 - 2,
                life: 0,
                maxLife: 50 + Math.random() * 30,
                color: avgIntensity > 0.6 ? colors.color3 : avgIntensity > 0.3 ? colors.color2 : colors.color1,
                size: 3 + Math.random() * 4 // Particelle più grandi
              });
            }
          }
        }
        lastIntensityRef.current = avgIntensity;

        // Draw frequency bars with dynamic colors
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
          const value = dataArrayRef.current[dataIndex];
          const barHeight = (value / 255) * (height * 0.8);

          // Create gradient for bars with dynamic colors
          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, colors.color1);
          gradient.addColorStop(0.5, colors.color2);
          gradient.addColorStop(1, colors.color3);

          ctx.fillStyle = gradient;
          
          // Draw symmetric bars (top and bottom)
          const x = i * barWidth;
          
          // Top bar
          ctx.fillRect(x, centerY - barHeight / 2, barWidth - 2, barHeight / 2);
          
          // Bottom bar (mirror)
          ctx.fillRect(x, centerY, barWidth - 2, barHeight / 2);

          // Add glow effect for high frequencies with dynamic color
          if (value > 200) {
            ctx.shadowBlur = 15 + (avgIntensity * 10);
            ctx.shadowColor = colors.glow;
          } else {
            ctx.shadowBlur = 0;
          }
        }

        // Draw center line with dynamic color
        ctx.strokeStyle = colors.color1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Update and draw particles
        ctx.shadowBlur = 0;
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          
          // Update physics
          p.vy += 0.15; // Gravity
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          
          // Remove dead particles
          if (p.life > p.maxLife || p.y > height) {
            particlesRef.current.splice(i, 1);
            continue;
          }
          
          // Draw particle with fade
          const alpha = 1 - (p.life / p.maxLife);
          ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
          ctx.shadowBlur = 12 * alpha;
          ctx.shadowColor = p.color;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      if (isPlaying) {
        draw();
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        window.removeEventListener('resize', setCanvasSize);
        // Don't close the audio context to avoid reconnection issues
      };
    } catch (error) {
      console.error('Error setting up audio visualizer:', error);
    }
  }, [audioElement, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg bg-background/20 backdrop-blur-sm border border-primary/20"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};
