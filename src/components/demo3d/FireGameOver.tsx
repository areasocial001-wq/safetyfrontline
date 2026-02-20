import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, RotateCcw, AlertTriangle } from "lucide-react";

interface FireGameOverProps {
  score: number;
  risksFound: number;
  totalRisks: number;
  timeElapsed: number;
  onRestart: () => void;
  onChangeScenario: () => void;
}

export const FireGameOver = ({
  score,
  risksFound,
  totalRisks,
  timeElapsed,
  onRestart,
  onChangeScenario,
}: FireGameOverProps) => {
  const penaltyScore = Math.max(0, Math.floor(score * 0.5));
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Full-screen red overlay */}
      <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm" />

      <Card className="relative z-10 max-w-lg mx-4 p-8 bg-red-950/95 border-2 border-red-500 shadow-[0_0_60px_rgba(220,38,38,0.5)]">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24">
            <Flame className="w-24 h-24 text-red-500 animate-pulse" />
            <AlertTriangle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-yellow-400" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-red-400 mb-2">
              INCENDIO FUORI CONTROLLO
            </h2>
            <p className="text-red-300/80 text-sm">
              Il fuoco si è propagato al livello massimo. L'evacuazione d'emergenza è stata attivata.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-red-900/50 rounded-lg p-3">
              <p className="text-2xl font-black text-red-300">{risksFound}/{totalRisks}</p>
              <p className="text-xs text-red-400/70">Rischi trovati</p>
            </div>
            <div className="bg-red-900/50 rounded-lg p-3">
              <p className="text-2xl font-black text-red-300">{formatTime(timeElapsed)}</p>
              <p className="text-xs text-red-400/70">Tempo</p>
            </div>
            <div className="bg-red-900/50 rounded-lg p-3">
              <p className="text-2xl font-black text-yellow-400">{penaltyScore}</p>
              <p className="text-xs text-red-400/70">Punti (−50%)</p>
            </div>
          </div>

          {/* Penalty notice */}
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs text-red-300/80">
              <span className="font-bold text-red-400">⚠️ Penalità applicata:</span>{' '}
              il punteggio è stato dimezzato per mancata gestione dell'emergenza. 
              Identifica i rischi più rapidamente per evitare la propagazione.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onRestart}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Riprova Simulazione
            </Button>
            <Button
              onClick={onChangeScenario}
              variant="outline"
              size="lg"
              className="w-full border-red-500/50 text-red-300 hover:bg-red-900/30"
            >
              Cambia Scenario
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
