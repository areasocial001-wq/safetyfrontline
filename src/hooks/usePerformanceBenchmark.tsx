import { useState, useCallback, useRef } from 'react';
import { GraphicsQuality } from './useGraphicsSettings';

export interface BenchmarkResults {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  loadTime: number;
  memoryUsage: number;
  gpuTier: 'low' | 'medium' | 'high' | 'ultra';
  recommendedQuality: GraphicsQuality;
  deviceInfo: {
    isMobile: boolean;
    cores: number;
    memory: number;
    hasWebGL2: boolean;
  };
}

export interface BenchmarkProgress {
  stage: 'idle' | 'preparing' | 'testing' | 'analyzing' | 'complete';
  progress: number;
  message: string;
}

export const usePerformanceBenchmark = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<BenchmarkProgress>({
    stage: 'idle',
    progress: 0,
    message: 'Pronto per iniziare',
  });
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const runBenchmark = useCallback(async (): Promise<BenchmarkResults> => {
    setIsRunning(true);
    setProgress({ stage: 'preparing', progress: 10, message: 'Preparazione benchmark...' });

    const startTime = performance.now();
    const fpsReadings: number[] = [];
    let frameCount = 0;
    let lastFrameTime = performance.now();

    // Detect device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (performance as any).memory?.jsHeapSizeLimit 
      ? (performance as any).memory.jsHeapSizeLimit / (1024 * 1024 * 1024) 
      : 4;

    // Check WebGL2 support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const hasWebGL2 = !!gl && gl.getParameter(gl.VERSION).includes('WebGL 2');

    setProgress({ stage: 'preparing', progress: 20, message: 'Analisi hardware...' });
    await new Promise(resolve => setTimeout(resolve, 500));

    setProgress({ stage: 'testing', progress: 30, message: 'Test rendering 3D...' });

    // Create a test scene for FPS measurement
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 800;
    testCanvas.height = 600;
    testCanvas.style.position = 'fixed';
    testCanvas.style.top = '-9999px';
    document.body.appendChild(testCanvas);

    const testGl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    
    if (testGl) {
      // Benchmark loop - 3 seconds of rendering
      const benchmarkDuration = 3000;
      const benchmarkStart = performance.now();

      const renderFrame = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastFrameTime;
        
        if (deltaTime > 0) {
          const fps = 1000 / deltaTime;
          fpsReadings.push(fps);
          frameCount++;
        }
        
        lastFrameTime = currentTime;
        
        // Simple rendering test
        testGl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);
        testGl.clear(testGl.COLOR_BUFFER_BIT);
        
        const elapsed = currentTime - benchmarkStart;
        const testProgress = Math.min((elapsed / benchmarkDuration) * 60, 60);
        setProgress({ 
          stage: 'testing', 
          progress: 30 + testProgress, 
          message: `Test rendering... ${Math.round(testProgress)}%`
        });

        if (elapsed < benchmarkDuration) {
          animationFrameId.current = requestAnimationFrame(renderFrame);
        } else {
          // Cleanup
          document.body.removeChild(testCanvas);
          analyzeBenchmark();
        }
      };

      const analyzeBenchmark = () => {
        setProgress({ stage: 'analyzing', progress: 90, message: 'Analisi risultati...' });

        const averageFPS = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;
        const minFPS = Math.min(...fpsReadings);
        const maxFPS = Math.max(...fpsReadings);
        const loadTime = performance.now() - startTime;
        const memoryUsage = memory;

        // Determine GPU tier based on FPS and hardware
        let gpuTier: 'low' | 'medium' | 'high' | 'ultra';
        if (averageFPS > 100 && memory > 6 && cores > 6 && !isMobile) {
          gpuTier = 'ultra';
        } else if (averageFPS > 60 && memory > 4 && cores > 4) {
          gpuTier = 'high';
        } else if (averageFPS > 45 && memory > 2) {
          gpuTier = 'medium';
        } else {
          gpuTier = 'low';
        }

        // Recommend quality based on GPU tier and device type
        let recommendedQuality: GraphicsQuality;
        if (isMobile) {
          // Mobile devices - conservative recommendations
          if (gpuTier === 'ultra' || gpuTier === 'high') {
            recommendedQuality = 'medium';
          } else if (gpuTier === 'medium') {
            recommendedQuality = 'low';
          } else {
            recommendedQuality = 'low';
          }
        } else {
          // Desktop - match GPU tier
          if (gpuTier === 'ultra') {
            recommendedQuality = 'ultra';
          } else if (gpuTier === 'high') {
            recommendedQuality = 'high';
          } else if (gpuTier === 'medium') {
            recommendedQuality = 'medium';
          } else {
            recommendedQuality = 'low';
          }
        }

        const finalResults: BenchmarkResults = {
          averageFPS,
          minFPS,
          maxFPS,
          loadTime,
          memoryUsage,
          gpuTier,
          recommendedQuality,
          deviceInfo: {
            isMobile,
            cores,
            memory,
            hasWebGL2,
          },
        };

        setResults(finalResults);
        setProgress({ stage: 'complete', progress: 100, message: 'Benchmark completato!' });
        setIsRunning(false);
      };

      animationFrameId.current = requestAnimationFrame(renderFrame);
    } else {
      // No WebGL - fallback to basic detection
      document.body.removeChild(testCanvas);
      
      const fallbackResults: BenchmarkResults = {
        averageFPS: 30,
        minFPS: 20,
        maxFPS: 40,
        loadTime: performance.now() - startTime,
        memoryUsage: memory,
        gpuTier: 'low',
        recommendedQuality: 'low',
        deviceInfo: {
          isMobile,
          cores,
          memory,
          hasWebGL2: false,
        },
      };

      setResults(fallbackResults);
      setProgress({ stage: 'complete', progress: 100, message: 'Benchmark completato (modalità fallback)' });
      setIsRunning(false);
    }

    return results!;
  }, []);

  const reset = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsRunning(false);
    setProgress({ stage: 'idle', progress: 0, message: 'Pronto per iniziare' });
    setResults(null);
  }, []);

  return {
    isRunning,
    progress,
    results,
    runBenchmark,
    reset,
  };
};
