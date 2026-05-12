import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, HardHat, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  MACHINERY_RISK_QUIZZES,
  type MachineryQuizQuestion,
} from "@/data/machinery-quizzes";

interface MachineryRiskQuizProps {
  riskId: string;
  riskLabel: string;
  onClose: (bonusPoints: number, isCorrect: boolean) => void;
}

const BONUS_CORRECT = 75;
const PENALTY_WRONG = -10;

export const MachineryRiskQuiz = ({
  riskId,
  riskLabel,
  onClose,
}: MachineryRiskQuizProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [question, setQuestion] = useState<MachineryQuizQuestion | null>(null);

  useEffect(() => {
    const list = MACHINERY_RISK_QUIZZES[riskId];
    if (!list || list.length === 0) {
      onClose(0, false);
      return;
    }
    setQuestion(list[Math.floor(Math.random() * list.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskId]);

  if (!question) return null;

  const isCorrect = selectedAnswer === question.correctIndex;

  const handleAnswer = (idx: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(idx);
    setHasAnswered(true);
    if (idx === question.correctIndex) {
      toast.success(`🦺 +${BONUS_CORRECT} pts — azione corretta in cantiere!`);
    } else {
      toast.error(`⚠️ Procedura errata (${PENALTY_WRONG} pts)`);
    }
  };

  const handleClose = () => {
    onClose(isCorrect ? BONUS_CORRECT : PENALTY_WRONG, isCorrect);
  };

  const cleanLabel = riskLabel.replace(
    /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s*/u,
    ""
  );

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto bg-background/95 backdrop-blur-md border-2 border-primary/40 rounded-2xl shadow-2xl max-w-lg w-[92%] p-6 animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600">
            <Construction className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground">
              🏗️ Quiz Macchinari di Cantiere
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              Rischio:{" "}
              <span className="font-semibold text-foreground">
                {cleanLabel}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold whitespace-nowrap">
            <HardHat className="w-3 h-3" />
            +{BONUS_CORRECT} pts
          </div>
        </div>

        {/* Question */}
        <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option, i) => {
            let borderClass = "border-border hover:border-primary/50";
            let bgClass = "bg-card hover:bg-primary/5";
            let icon: React.ReactNode = null;

            if (hasAnswered) {
              if (i === question.correctIndex) {
                borderClass = "border-green-500";
                bgClass = "bg-green-500/10";
                icon = (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                );
              } else if (i === selectedAnswer && !isCorrect) {
                borderClass = "border-destructive";
                bgClass = "bg-destructive/10";
                icon = (
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                );
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={hasAnswered}
                className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all text-left text-sm ${borderClass} ${bgClass} ${
                  !hasAnswered ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Result + Explanation */}
        {hasAnswered && (
          <div className="mt-4 space-y-3 animate-in fade-in duration-300">
            <div
              className={`p-3 rounded-lg border ${
                isCorrect
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
              }`}
            >
              <p
                className={`text-sm font-bold mb-1 ${
                  isCorrect ? "text-green-600" : "text-amber-600"
                }`}
              >
                {isCorrect
                  ? `🦺 Corretto! +${BONUS_CORRECT} punti bonus`
                  : `❌ Risposta errata (${PENALTY_WRONG} pts)`}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
            <Button
              onClick={handleClose}
              variant="default"
              size="sm"
              className="w-full"
            >
              Continua l'ispezione
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
