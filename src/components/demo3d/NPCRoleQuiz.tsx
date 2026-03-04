import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ScenarioType = 'office' | 'warehouse' | 'construction' | 'laboratory';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  scenarios?: ScenarioType[]; // if set, question only shows for these scenarios
}

const ROLE_QUESTIONS: Record<string, QuizQuestion[]> = {
  RSPP: [
    {
      question: "Chi nomina l'RSPP?",
      options: ['I lavoratori', 'Il Datore di Lavoro', 'Il Medico Competente', "L'Ispettorato del Lavoro"],
      correctIndex: 1,
    },
    {
      question: "Qual è il compito principale dell'RSPP?",
      options: ['Curare i lavoratori', 'Coordinare il servizio di prevenzione e protezione', 'Controllare le buste paga', 'Gestire le assunzioni'],
      correctIndex: 1,
    },
  ],
  RLS: [
    {
      question: "Come viene scelto l'RLS?",
      options: ['Nominato dal Datore di Lavoro', 'Eletto o designato dai lavoratori', "Scelto dall'RSPP", 'Nominato dal Prefetto'],
      correctIndex: 1,
    },
    {
      question: "A quale documento ha diritto di accesso l'RLS?",
      options: ['Bilancio aziendale', 'Valutazione dei rischi (DVR)', 'Contratti dei fornitori', 'Piano marketing'],
      correctIndex: 1,
    },
  ],
  Medico: [
    {
      question: 'Cosa esprime il Medico Competente per ogni lavoratore?',
      options: ['Il livello di stipendio', "Il giudizio di idoneità alla mansione", "La valutazione delle competenze", "Il piano ferie"],
      correctIndex: 1,
    },
    {
      question: 'Ogni quanto effettua le visite periodiche il Medico Competente?',
      options: ['Ogni mese', 'Secondo il protocollo sanitario (di norma annualmente)', 'Solo alla prima assunzione', 'Mai, è facoltativo'],
      correctIndex: 1,
    },
  ],
  Preposto: [
    {
      question: 'Qual è il dovere principale del Preposto?',
      options: ['Assumere nuovi dipendenti', 'Vigilare sull\'osservanza delle norme di sicurezza', 'Gestire il magazzino', 'Approvare i bilanci'],
      correctIndex: 1,
    },
    {
      question: 'Cosa deve fare il Preposto in caso di pericolo grave e immediato?',
      options: ['Aspettare istruzioni dal direttore', 'Intervenire per limitare il rischio', 'Chiamare solo i vigili del fuoco', 'Non fare nulla'],
      correctIndex: 1,
    },
  ],
  Dirigente: [
    {
      question: 'Quale obbligo ha il Dirigente per la Sicurezza?',
      options: ['Vendere i prodotti aziendali', 'Fornire ai lavoratori i DPI necessari', 'Gestire la contabilità', 'Organizzare le feste aziendali'],
      correctIndex: 1,
    },
    {
      question: 'In base a quale articolo del D.Lgs. 81/08 opera il Dirigente?',
      options: ['Art. 47', 'Art. 18', 'Art. 38', 'Art. 50'],
      correctIndex: 1,
    },
  ],
  'Addetto PS': [
    {
      question: "Ogni quanti anni l'Addetto al Primo Soccorso deve aggiornarsi?",
      options: ['Ogni anno', 'Ogni 3 anni', 'Ogni 5 anni', 'Mai'],
      correctIndex: 1,
    },
    {
      question: "Qual è la prima azione dell'Addetto PS in caso di infortunio?",
      options: ['Spostare l\'infortunato', 'Attivare la catena del soccorso (118)', 'Somministrare farmaci', 'Compilare un rapporto'],
      correctIndex: 1,
    },
  ],
};

interface NPCRoleQuizProps {
  role: string;
  scenarioType?: ScenarioType;
  onClose: (bonusPoints: number) => void;
}

export const NPCRoleQuiz = ({ role, scenarioType, onClose }: NPCRoleQuizProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    let questions = ROLE_QUESTIONS[role];
    if (!questions || questions.length === 0) return;
    // Filter by scenario if specified
    if (scenarioType) {
      const filtered = questions.filter(q => !q.scenarios || q.scenarios.includes(scenarioType));
      if (filtered.length > 0) questions = filtered;
    }
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(randomQ);
  }, [role, scenarioType]);

  if (!question) return null;

  const isCorrect = selectedAnswer === question.correctIndex;

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    if (index === question.correctIndex) {
      toast.success('🌟 +50 punti bonus!');
    }
  };

  const handleClose = () => {
    onClose(isCorrect ? 50 : 0);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto bg-background/95 backdrop-blur-md border border-primary/30 rounded-2xl shadow-2xl max-w-md w-[90%] p-5 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-primary/15 text-primary">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Quiz Rapido — {role}</h3>
            <p className="text-xs text-muted-foreground">Rispondi e guadagna punti bonus!</p>
          </div>
        </div>

        {/* Question */}
        <p className="text-sm font-semibold text-foreground mb-3">{question.question}</p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option, i) => {
            let borderClass = 'border-border hover:border-primary/50';
            let bgClass = 'bg-card hover:bg-primary/5';
            let icon = null;

            if (hasAnswered) {
              if (i === question.correctIndex) {
                borderClass = 'border-green-500';
                bgClass = 'bg-green-500/10';
                icon = <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
              } else if (i === selectedAnswer && !isCorrect) {
                borderClass = 'border-destructive';
                bgClass = 'bg-destructive/10';
                icon = <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={hasAnswered}
                className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all text-left text-sm ${borderClass} ${bgClass} ${!hasAnswered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="flex-1">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Result + Close */}
        {hasAnswered && (
          <div className="mt-4 space-y-3 animate-in fade-in duration-300">
            <div className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <p className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                {isCorrect ? '🌟 Corretto! +50 punti bonus' : '❌ Risposta sbagliata — nessun bonus'}
              </p>
            </div>
            <Button onClick={handleClose} variant="default" size="sm" className="w-full">
              Continua
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
