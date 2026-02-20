import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Map, Target, Brain, Zap, CheckCircle2 } from "lucide-react";

interface LoadingOverlayProps {
  scenarioTitle: string;
}

interface LoadingStep {
  id: string;
  label: string;
  icon: typeof Map;
  duration: number;
}

const loadingSteps: LoadingStep[] = [
  { id: "environment", label: "Caricamento ambiente 3D", icon: Map, duration: 800 },
  { id: "risks", label: "Generazione rischi procedurali", icon: Target, duration: 1000 },
  { id: "ai", label: "Inizializzazione sistemi AI", icon: Brain, duration: 600 },
  { id: "stats", label: "Recupero statistiche giocatore", icon: Zap, duration: 700 },
];

export const LoadingOverlay = ({ scenarioTitle }: LoadingOverlayProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    // Progress bar animation
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    const progressIncrement = 100 / totalDuration * 50; // Update every 50ms
    
    progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return Math.min(prev + progressIncrement, 100);
      });
    }, 50);

    // Step progression
    const progressThroughSteps = () => {
      if (currentStepIndex < loadingSteps.length) {
        const currentStep = loadingSteps[currentStepIndex];
        
        stepTimer = setTimeout(() => {
          setCompletedSteps(prev => new Set(prev).add(currentStep.id));
          setCurrentStepIndex(prev => prev + 1);
        }, currentStep.duration);
      }
    };

    progressThroughSteps();

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, [currentStepIndex]);

  const currentStep = loadingSteps[currentStepIndex];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-xl animate-fade-in">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <Card className="relative p-8 space-y-6 max-w-lg mx-4 animate-scale-in shadow-2xl border-primary/20">
        {/* Header with rotating loader */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
            
            {/* Spinning ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-3 w-14 h-14 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full animate-pulse" />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs px-3 py-1 border-primary/30 bg-primary/5">
              Scenario: {scenarioTitle}
            </Badge>
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              Inizializzazione
            </h3>
            {currentStep && (
              <div className="flex items-center justify-center gap-2 text-primary animate-fade-in">
                <currentStep.icon className="w-4 h-4 animate-pulse" />
                <p className="text-sm font-semibold">
                  {currentStep.label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] transition-all duration-300 ease-out shadow-lg shadow-primary/50"
              style={{ 
                width: `${progress}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-mono">{Math.round(progress)}%</span>
            <span>Preparazione completata</span>
          </div>
        </div>

        {/* Loading steps checklist */}
        <div className="space-y-2 pt-2">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStepIndex === index;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                  isCurrent ? 'bg-primary/5 border border-primary/20' : ''
                } ${isCompleted ? 'opacity-60' : ''}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-primary animate-scale-in" />
                ) : isCurrent ? (
                  <Icon className="w-4 h-4 text-primary animate-pulse" />
                ) : (
                  <Icon className="w-4 h-4 text-muted-foreground/40" />
                )}
                <span className={`text-sm transition-colors ${
                  isCompleted ? 'text-muted-foreground line-through' : 
                  isCurrent ? 'text-foreground font-semibold' : 
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            💡 <span className="font-semibold">Suggerimento:</span> Usa WASD per muoverti e il mouse per guardare intorno
          </p>
        </div>
      </Card>
    </div>
  );
};
