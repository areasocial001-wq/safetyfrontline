import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Eye, 
  Sparkles, 
  Crown, 
  Gauge, 
  Cpu, 
  HardDrive, 
  Smartphone,
  Monitor,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { BenchmarkResults, BenchmarkProgress } from '@/hooks/usePerformanceBenchmark';
import { GraphicsQuality } from '@/hooks/useGraphicsSettings';

interface PerformanceBenchmarkProps {
  isRunning: boolean;
  progress: BenchmarkProgress;
  results: BenchmarkResults | null;
  onStart: () => void;
  onApplyRecommended: () => void;
  onSkip: () => void;
}

const QUALITY_INFO: Record<GraphicsQuality, { icon: React.ReactNode; color: string; label: string }> = {
  low: { icon: <Zap className="w-4 h-4" />, color: 'text-blue-500', label: 'Bassa' },
  medium: { icon: <Eye className="w-4 h-4" />, color: 'text-green-500', label: 'Media' },
  high: { icon: <Sparkles className="w-4 h-4" />, color: 'text-orange-500', label: 'Alta' },
  ultra: { icon: <Crown className="w-4 h-4" />, color: 'text-purple-500', label: 'Ultra' },
};

export const PerformanceBenchmark = ({
  isRunning,
  progress,
  results,
  onStart,
  onApplyRecommended,
  onSkip,
}: PerformanceBenchmarkProps) => {
  // Auto-start benchmark after a short delay
  useEffect(() => {
    if (!isRunning && !results && progress.stage === 'idle') {
      const timer = setTimeout(() => {
        onStart();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRunning, results, progress.stage, onStart]);

  const recommendedInfo = results ? QUALITY_INFO[results.recommendedQuality] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-2xl mx-4 p-8 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Activity className="w-12 h-12 text-primary animate-pulse" />
              {isRunning && (
                <div className="absolute inset-0 animate-ping">
                  <Activity className="w-12 h-12 text-primary opacity-30" />
                </div>
              )}
            </div>
          </div>
          <h2 className="text-3xl font-black text-foreground">
            Benchmark Prestazioni
          </h2>
          <p className="text-sm text-muted-foreground">
            Stiamo testando il tuo dispositivo per ottimizzare la qualità grafica
          </p>
        </div>

        {/* Progress Section */}
        {isRunning && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{progress.message}</span>
                <span className="text-muted-foreground">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className={`p-3 rounded-lg border ${progress.stage === 'preparing' ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border'}`}>
                <Gauge className={`w-5 h-5 mx-auto mb-1 ${progress.stage === 'preparing' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                <p className="text-xs font-semibold">Preparazione</p>
              </div>
              <div className={`p-3 rounded-lg border ${progress.stage === 'testing' ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border'}`}>
                <Activity className={`w-5 h-5 mx-auto mb-1 ${progress.stage === 'testing' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                <p className="text-xs font-semibold">Test Rendering</p>
              </div>
              <div className={`p-3 rounded-lg border ${progress.stage === 'analyzing' || progress.stage === 'complete' ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border'}`}>
                <CheckCircle2 className={`w-5 h-5 mx-auto mb-1 ${progress.stage === 'analyzing' || progress.stage === 'complete' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                <p className="text-xs font-semibold">Analisi</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && !isRunning && (
          <div className="space-y-6">
            {/* Recommended Quality */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {recommendedInfo && (
                    <div className={`p-3 rounded-full bg-background/50 ${recommendedInfo.color}`}>
                      {recommendedInfo.icon}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold uppercase">Qualità Consigliata</p>
                    <h3 className="text-2xl font-black text-foreground">
                      {recommendedInfo?.label}
                    </h3>
                  </div>
                </div>
                <Badge variant="default" className="text-xs font-bold">
                  OTTIMALE
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Basato sulle capacità del tuo dispositivo, questa impostazione offre il miglior bilanciamento tra qualità visiva e prestazioni fluide.
              </p>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">FPS Medi</p>
                </div>
                <p className="text-2xl font-black text-foreground">
                  {Math.round(results.averageFPS)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Range: {Math.round(results.minFPS)}-{Math.round(results.maxFPS)}
                </p>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">GPU Tier</p>
                </div>
                <p className="text-2xl font-black text-foreground capitalize">
                  {results.gpuTier}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Caricamento: {Math.round(results.loadTime)}ms
                </p>
              </div>
            </div>

            {/* Device Info */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Info Dispositivo</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {results.deviceInfo.isMobile ? (
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-foreground font-semibold">
                    {results.deviceInfo.isMobile ? 'Mobile/Tablet' : 'Desktop'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-semibold">
                    {results.deviceInfo.cores} CPU Cores
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-semibold">
                    {results.deviceInfo.memory.toFixed(1)} GB RAM
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-semibold">
                    WebGL {results.deviceInfo.hasWebGL2 ? '2.0' : '1.0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={onApplyRecommended}
                variant="hero"
                size="lg"
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Applica Impostazione Consigliata
              </Button>
              <Button
                onClick={onSkip}
                variant="outline"
                size="lg"
              >
                Salta
              </Button>
            </div>
          </div>
        )}

        {/* Initial State - Manual Start */}
        {!isRunning && !results && progress.stage === 'idle' && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Il benchmark inizierà automaticamente tra un istante...
            </p>
            <Button onClick={onStart} variant="hero" size="lg" className="w-full">
              <Activity className="w-4 h-4 mr-2" />
              Avvia Ora
            </Button>
            <Button onClick={onSkip} variant="ghost" size="sm" className="w-full">
              Salta Benchmark
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
