import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CyberQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Map each cyber risk ID to a contextual quiz question
const CYBER_RISK_QUESTIONS: Record<string, CyberQuizQuestion[]> = {
  cyber_1: [
    {
      question: 'Perché è pericoloso scrivere la password su un post-it?',
      options: [
        'Perché il post-it può cadere',
        'Perché chiunque passi può leggerla e accedere al sistema',
        'Perché non è ecologico',
        'Perché la password potrebbe cambiare',
      ],
      correctIndex: 1,
      explanation: 'Una password visibile su un post-it è accessibile a colleghi, visitatori e addetti alle pulizie, compromettendo la sicurezza dell\'account.',
    },
    {
      question: 'Qual è il modo più sicuro per gestire molte password diverse?',
      options: [
        'Scriverle tutte su un foglio',
        'Usare la stessa password ovunque',
        'Utilizzare un password manager',
        'Memorizzarle tutte a mente',
      ],
      correctIndex: 2,
      explanation: 'Un password manager genera e memorizza password complesse e uniche per ogni servizio, riducendo drasticamente il rischio.',
    },
  ],
  cyber_2: [
    {
      question: 'Quanto tempo serve a un malintenzionato per rubare dati da un PC non bloccato?',
      options: [
        'Almeno 30 minuti',
        'Meno di 60 secondi',
        'È impossibile senza password',
        'Solo se ha una chiavetta USB',
      ],
      correctIndex: 1,
      explanation: 'Bastano pochi secondi per copiare file, installare malware o inviare email da una sessione aperta. Blocca sempre il PC con Win+L.',
    },
    {
      question: 'Qual è la scorciatoia per bloccare rapidamente il PC Windows?',
      options: [
        'Ctrl+Alt+Canc',
        'Alt+F4',
        'Win+L',
        'Ctrl+Shift+Esc',
      ],
      correctIndex: 2,
      explanation: 'Win+L blocca istantaneamente il PC Windows. Su Mac usa Cmd+Ctrl+Q. Fallo ogni volta che ti allontani dalla postazione!',
    },
  ],
  cyber_3: [
    {
      question: 'Quale di questi è il segnale più chiaro di un\'email di phishing?',
      options: [
        'Il logo aziendale è presente',
        'L\'email arriva di lunedì mattina',
        'Il mittente chiede di cliccare urgentemente su un link per evitare il blocco dell\'account',
        'L\'email contiene un allegato PDF',
      ],
      correctIndex: 2,
      explanation: 'L\'urgenza artificiale ("clicca subito o il tuo account verrà bloccato") è la tecnica di phishing più comune. Verifica sempre tramite un canale alternativo.',
    },
    {
      question: 'Hai cliccato per errore su un link sospetto. Cosa fai subito?',
      options: [
        'Chiudo la scheda e non dico niente a nessuno',
        'Disconnetto il PC dalla rete e avviso il reparto IT',
        'Cancello la cronologia del browser',
        'Riavvio il computer',
      ],
      correctIndex: 1,
      explanation: 'Disconnettere dalla rete limita eventuali danni. Avvisare l\'IT permette un\'analisi rapida e la protezione di tutta l\'azienda.',
    },
  ],
  cyber_4: [
    {
      question: 'Trovi una chiavetta USB nel parcheggio aziendale. Cosa fai?',
      options: [
        'La inserisco nel PC per vedere di chi è',
        'La consegno al reparto IT senza inserirla',
        'La butto nella spazzatura',
        'La uso per i miei file personali',
      ],
      correctIndex: 1,
      explanation: 'Le chiavette USB abbandonate possono contenere malware che si attiva automaticamente (attacco "baiting"). Consegnale sempre all\'IT.',
    },
    {
      question: 'Come si chiama l\'attacco che sfrutta la curiosità tramite dispositivi USB?',
      options: [
        'Phishing',
        'Baiting',
        'Spoofing',
        'Keylogging',
      ],
      correctIndex: 1,
      explanation: 'Il "baiting" sfrutta la curiosità: si lasciano dispositivi USB infetti in luoghi dove qualcuno li troverà e li collegherà al proprio computer.',
    },
  ],
  cyber_5: [
    {
      question: 'Cosa prevede la "Clean Desk Policy"?',
      options: [
        'Pulire la scrivania ogni venerdì',
        'Non lasciare documenti sensibili visibili sulla scrivania',
        'Avere solo penne e post-it sulla scrivania',
        'Usare solo scrivanie bianche',
      ],
      correctIndex: 1,
      explanation: 'La Clean Desk Policy richiede di riporre documenti riservati in cassetti chiusi a chiave o distruggerli quando non servono più, proteggendo i dati da accessi non autorizzati.',
    },
    {
      question: 'Quale regolamento europeo impone sanzioni per la mancata protezione dei dati personali?',
      options: [
        'ISO 27001',
        'D.Lgs. 81/08',
        'GDPR (Reg. UE 2016/679)',
        'SOX',
      ],
      correctIndex: 2,
      explanation: 'Il GDPR prevede sanzioni fino a 20 milioni di euro o il 4% del fatturato. Ogni dipendente è responsabile dei dati che tratta.',
    },
  ],
  cyber_6: [
    {
      question: 'Quale di queste è la password più sicura?',
      options: [
        'password123',
        'MarioRossi1990!',
        'Kx$9mN#vL2pQ!wZr',
        'qwerty2024',
      ],
      correctIndex: 2,
      explanation: 'Una password casuale di 16+ caratteri con mix di maiuscole, minuscole, numeri e simboli è praticamente inviolabile con attacchi brute force.',
    },
    {
      question: 'La password "123456" è la più usata al mondo. In quanto tempo viene violata?',
      options: [
        '1 ora',
        '10 minuti',
        'Meno di 1 secondo',
        '1 giorno',
      ],
      correctIndex: 2,
      explanation: '"123456" viene violata istantaneamente dai tool automatici. È nella lista delle prime password testate in ogni attacco.',
    },
  ],
  cyber_7: [
    {
      question: 'Perché un hotspot WiFi personale in ufficio è un rischio?',
      options: [
        'Consuma troppa batteria',
        'Può bypassare il firewall aziendale e creare un punto di accesso non protetto',
        'Rallenta la connessione dei colleghi',
        'È vietato dal contratto telefonico',
      ],
      correctIndex: 1,
      explanation: 'Un hotspot personale crea una connessione che bypassa le protezioni aziendali (firewall, IDS, proxy), esponendo la rete a minacce esterne.',
    },
  ],
  cyber_8: [
    {
      question: 'Quale rischio comportano le stampe abbandonate nella stampante?',
      options: [
        'Spreco di carta',
        'Chiunque può leggere dati riservati di clienti o dipendenti',
        'La stampante si potrebbe rompere',
        'I documenti potrebbero ingiallire',
      ],
      correctIndex: 1,
      explanation: 'Documenti con dati personali o aziendali lasciati incustoditi violano il GDPR. Ritira sempre le stampe subito e distruggi i documenti non necessari.',
    },
  ],
};

interface CyberRiskQuizProps {
  riskId: string;
  riskLabel: string;
  onClose: (bonusPoints: number, isCorrect: boolean) => void;
}

export const CyberRiskQuiz = ({ riskId, riskLabel, onClose }: CyberRiskQuizProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [question, setQuestion] = useState<CyberQuizQuestion | null>(null);

  useEffect(() => {
    const questions = CYBER_RISK_QUESTIONS[riskId];
    if (!questions || questions.length === 0) return;
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(randomQ);
  }, [riskId]);

  if (!question) {
    // No quiz for this risk, auto-close
    onClose(0, false);
    return null;
  }

  const isCorrect = selectedAnswer === question.correctIndex;

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    if (index === question.correctIndex) {
      toast.success('🛡️ +75 punti bonus Cybersecurity!');
    }
  };

  const handleClose = () => {
    onClose(isCorrect ? 75 : 0, isCorrect);
  };

  // Clean the label from emoji prefixes
  const cleanLabel = riskLabel.replace(/^[📌🖥️📧💾📋🔓📡🖨️]\s*/, '');

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto bg-background/95 backdrop-blur-md border-2 border-primary/40 rounded-2xl shadow-2xl max-w-lg w-[92%] p-6 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">🔐 Quiz Cybersecurity</h3>
            <p className="text-xs text-muted-foreground">
              Rischio trovato: <span className="font-semibold text-foreground">{cleanLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Lock className="w-3 h-3" />
            +75 pts
          </div>
        </div>

        {/* Question */}
        <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">{question.question}</p>

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
            <div className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                {isCorrect ? '🛡️ Corretto! +75 punti bonus' : '❌ Risposta sbagliata'}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
            <Button onClick={handleClose} variant="default" size="sm" className="w-full">
              Continua l'ispezione
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
