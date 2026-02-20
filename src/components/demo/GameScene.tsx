import { useState, useEffect, useCallback } from "react";
import { GameSession, Risk } from "@/types/demo";
import { RiskMarker } from "./RiskMarker";
import { GameHUD } from "./GameHUD";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface GameSceneProps {
  session: GameSession;
  onRiskFound: (riskId: string) => void;
  onComplete: () => void;
  onTimeUp: () => void;
}

export const GameScene = ({ session, onRiskFound, onComplete, onTimeUp }: GameSceneProps) => {
  const [timeLeft, setTimeLeft] = useState(session.scenario.timeLimit);
  const [showHint, setShowHint] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  useEffect(() => {
    if (session.risksFound.length === session.scenario.risks.length) {
      onComplete();
    }
  }, [session.risksFound, session.scenario.risks.length, onComplete]);

  const handleRiskClick = useCallback((risk: Risk) => {
    if (!session.risksFound.includes(risk.id)) {
      setSelectedRisk(risk);
      onRiskFound(risk.id);
      
      setTimeout(() => {
        setSelectedRisk(null);
      }, 2000);
    }
  }, [session.risksFound, onRiskFound]);

  const risksFoundCount = session.risksFound.length;
  const totalRisks = session.scenario.risks.length;
  const progress = (risksFoundCount / totalRisks) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* HUD */}
      <GameHUD
        score={session.score}
        timeLeft={timeLeft}
        risksFound={risksFoundCount}
        totalRisks={totalRisks}
        onHintRequest={() => setShowHint(true)}
      />

      {/* Game Scene */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border shadow-lg">
        <img
          src={session.scenario.imageUrl}
          alt={session.scenario.title}
          className="w-full h-full object-cover"
        />
        
        {/* Risk Markers */}
        {session.scenario.risks.map(risk => (
          <RiskMarker
            key={risk.id}
            risk={risk}
            isFound={session.risksFound.includes(risk.id)}
            isRevealed={showHint || timeLeft <= 10}
            onClick={() => handleRiskClick(risk)}
          />
        ))}

        {/* Progress Overlay */}
        {risksFoundCount > 0 && (
          <div className="absolute top-4 right-4 animate-fade-in">
            <Card className="px-4 py-2 bg-background/90 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span className="font-semibold">
                  {risksFoundCount}/{totalRisks} Rischi
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-hero transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Risk Feedback */}
      {selectedRisk && (
        <Card className="p-4 bg-accent/10 border-accent animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-lg mb-1">Rischio Identificato!</h4>
              <p className="text-muted-foreground">{selectedRisk.description}</p>
              <p className="text-accent font-semibold mt-2">+{selectedRisk.points} punti</p>
            </div>
          </div>
        </Card>
      )}

      {/* Hint Message */}
      {showHint && (
        <Card className="p-4 bg-primary/10 border-primary animate-fade-in">
          <p className="text-sm">
            💡 <span className="font-semibold">Suggerimento attivo:</span> Ora puoi vedere tutti i rischi evidenziati sulla scena!
          </p>
        </Card>
      )}

      {/* Low Time Warning */}
      {timeLeft <= 10 && timeLeft > 0 && (
        <Card className="p-4 bg-destructive/10 border-destructive animate-pulse">
          <p className="text-sm font-semibold text-destructive">
            ⚠️ Tempo quasi scaduto! Affrettati a trovare i rischi rimanenti!
          </p>
        </Card>
      )}
    </div>
  );
};
