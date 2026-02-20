import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Target, Lightbulb, Trophy } from "lucide-react";

interface GameHUDProps {
  score: number;
  timeLeft: number;
  risksFound: number;
  totalRisks: number;
  onHintRequest: () => void;
}

export const GameHUD = ({ score, timeLeft, risksFound, totalRisks, onHintRequest }: GameHUDProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor = timeLeft <= 10 ? 'text-destructive' : timeLeft <= 30 ? 'text-primary' : 'text-foreground';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Score */}
      <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Punteggio</p>
            <p className="text-xl font-bold text-primary">{score}</p>
          </div>
        </div>
      </Card>

      {/* Time */}
      <Card className={`p-3 ${timeLeft <= 10 ? 'bg-destructive/10 border-destructive/30 animate-pulse' : 'bg-card'}`}>
        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${timeColor}`} />
          <div>
            <p className="text-xs text-muted-foreground">Tempo</p>
            <p className={`text-xl font-bold ${timeColor}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </Card>

      {/* Risks Found */}
      <Card className="p-3 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Rischi</p>
            <p className="text-xl font-bold text-accent">{risksFound}/{totalRisks}</p>
          </div>
        </div>
      </Card>

      {/* Hint Button */}
      <Card className="p-3 flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onHintRequest}
          className="w-full h-full flex flex-col gap-1 py-2"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="text-xs">Suggerimento</span>
        </Button>
      </Card>
    </div>
  );
};
