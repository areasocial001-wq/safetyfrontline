import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ChevronRight, Brain, Flame } from 'lucide-react';

interface FireClassQuizProps {
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Un quadro elettrico prende fuoco. Quale estintore è il più sicuro da usare?',
    options: ['Acqua', 'CO₂', 'Schiuma', 'Nessuno, scappo subito'],
    correctIndex: 1,
    explanation: 'Il CO₂ è ideale per incendi elettrici: non conduce elettricità e non lascia residui. L\'acqua è PERICOLOSA su apparecchiature sotto tensione!',
  },
  {
    question: 'Degli scatoloni di carta prendono fuoco in magazzino. Che tipo di incendio è?',
    options: ['Classe B — Liquidi', 'Classe C — Elettrico', 'Classe A — Solidi', 'Classe D — Metalli'],
    correctIndex: 2,
    explanation: 'Carta, legno, tessuti e cartone sono materiali solidi combustibili → Classe A. L\'estintore ad acqua o a polvere è il più indicato.',
  },
  {
    question: 'Quale estintore NON dovresti MAI usare su un fuoco elettrico?',
    options: ['CO₂', 'Polvere', 'Acqua', 'Tutti vanno bene'],
    correctIndex: 2,
    explanation: 'L\'acqua conduce elettricità e può causare folgorazione! Su incendi elettrici si usano CO₂ o polvere.',
  },
];

export const FireClassQuiz = ({ onComplete, onBack }: FireClassQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = QUIZ_QUESTIONS[currentQuestion];
  const isCorrect = selectedAnswer === q.correctIndex;
  const isLastQuestion = currentQuestion === QUIZ_QUESTIONS.length - 1;

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    if (index === q.correctIndex) {
      setCorrectCount(c => c + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = correctCount + (isCorrect ? 0 : 0); // already counted
      onComplete(finalScore, QUIZ_QUESTIONS.length);
    } else {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 overflow-y-auto py-8">
      <div className="max-w-2xl mx-4 w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-semibold">Quiz Antincendio</span>
          </div>
          <h1 className="text-3xl font-bold">
            Verifica le tue <span className="text-primary">Conoscenze</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Rispondi a {QUIZ_QUESTIONS.length} domande prima di iniziare la simulazione.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Domanda {currentQuestion + 1} di {QUIZ_QUESTIONS.length}</span>
          <span>{correctCount} corrette</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((currentQuestion + (hasAnswered ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="p-6 border-2 border-primary/20 animate-fade-in">
          <h2 className="text-lg font-bold mb-5">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, i) => {
              let borderClass = 'border-border hover:border-primary/50';
              let bgClass = 'bg-card hover:bg-primary/5';
              let icon = null;

              if (hasAnswered) {
                if (i === q.correctIndex) {
                  borderClass = 'border-green-500';
                  bgClass = 'bg-green-500/10';
                  icon = <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />;
                } else if (i === selectedAnswer && !isCorrect) {
                  borderClass = 'border-destructive';
                  bgClass = 'bg-destructive/10';
                  icon = <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
                }
              } else if (i === selectedAnswer) {
                borderClass = 'border-primary';
                bgClass = 'bg-primary/10';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={hasAnswered}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${borderClass} ${bgClass} ${!hasAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </Badge>
                  <span className="flex-1 text-sm font-medium">{option}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {hasAnswered && (
            <div className={`mt-5 p-4 rounded-lg border-2 animate-fade-in ${
              isCorrect 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-bold text-sm ${isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                    {isCorrect ? 'Corretto!' : 'Non esattamente...'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{q.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Button onClick={onBack} variant="outline" size="lg">
            Torna al Tutorial
          </Button>
          {hasAnswered && (
            <Button onClick={handleNext} variant="hero" size="lg" className="px-8">
              {isLastQuestion ? (
                <>
                  <Flame className="w-4 h-4 mr-2" />
                  Scegli Estintore
                </>
              ) : (
                <>
                  Prossima <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
