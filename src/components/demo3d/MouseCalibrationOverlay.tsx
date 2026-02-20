import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MousePointer2, TrendingUp, Activity, CheckCircle2, X } from "lucide-react";
import { MouseCalibrationData } from "@/hooks/useMouseCalibration";

interface MouseCalibrationOverlayProps {
  isCalibrating: boolean;
  progress: number;
  data: MouseCalibrationData | null;
  isComplete: boolean;
  onApply?: (sensitivity: number) => void;
  onSkip?: () => void;
  onClose?: () => void;
}

export const MouseCalibrationOverlay = ({
  isCalibrating,
  progress,
  data,
  isComplete,
  onApply,
  onSkip,
  onClose,
}: MouseCalibrationOverlayProps) => {
  // Show nothing if not calibrating and no results
  if (!isCalibrating && !data) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-[500px] p-6 bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl">
        {isCalibrating && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MousePointer2 className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-xl">Calibrazione Mouse</h3>
                  <p className="text-sm text-muted-foreground">
                    Muovi il mouse naturalmente per {Math.ceil((100 - progress) / 10)} secondi
                  </p>
                </div>
              </div>
              {onSkip && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}%</span>
                <span>{(10 - (progress / 10)).toFixed(1)}s rimanenti</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Istruzioni:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Guarda intorno alla scena muovendo il mouse</li>
                    <li>• Muoviti come faresti normalmente durante il gioco</li>
                    <li>• Il sistema analizzerà la tua velocità di movimento</li>
                    <li>• La sensibilità ottimale verrà calcolata automaticamente</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Skip Button */}
            {onSkip && (
              <Button
                onClick={onSkip}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Salta Calibrazione
              </Button>
            )}
          </div>
        )}

        {!isCalibrating && data && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-black text-xl">Calibrazione Completata!</h3>
                  <p className="text-sm text-muted-foreground">
                    Sensibilità ottimale calcolata
                  </p>
                </div>
              </div>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* Recommended Sensitivity */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Sensibilità Consigliata</span>
                  <Badge variant="default" className="text-base px-3 py-1">
                    {data.recommendedSensitivity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Basata sui tuoi {data.movementCount} movimenti analizzati
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-muted-foreground">Velocità Media</span>
                  </div>
                  <p className="text-lg font-bold">{Math.round(data.averageSpeed)} px/s</p>
                </div>
                <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-muted-foreground">Picco Velocità</span>
                  </div>
                  <p className="text-lg font-bold">{Math.round(data.maxSpeed)} px/s</p>
                </div>
              </div>

              {/* Profile Description */}
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                <p className="text-sm">
                  {data.averageSpeed > 500 && (
                    <>
                      <span className="font-semibold text-primary">Profilo: Movimenti Rapidi</span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        Preferisci movimenti veloci e reattivi. Sensibilità alta per massima precisione.
                      </span>
                    </>
                  )}
                  {data.averageSpeed > 200 && data.averageSpeed <= 500 && (
                    <>
                      <span className="font-semibold text-primary">Profilo: Movimenti Bilanciati</span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        Hai un ottimo equilibrio tra velocità e controllo. Sensibilità media ideale.
                      </span>
                    </>
                  )}
                  {data.averageSpeed <= 200 && (
                    <>
                      <span className="font-semibold text-primary">Profilo: Movimenti Precisi</span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        Preferisci movimenti lenti e precisi. Sensibilità bassa per massimo controllo.
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => onApply?.(data.recommendedSensitivity)}
                className="flex-1 font-bold"
              >
                Applica Sensibilità Consigliata
              </Button>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Mantieni Attuale
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
