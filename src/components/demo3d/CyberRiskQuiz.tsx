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
    {
      question: 'Dove NON dovresti mai annotare le password aziendali?',
      options: [
        'In un password manager criptato',
        'Su un post-it attaccato al monitor o sotto la tastiera',
        'In un file criptato con master password',
        'In un\'app di autenticazione certificata',
      ],
      correctIndex: 1,
      explanation: 'Post-it sul monitor, sotto la tastiera o nel cassetto sono i primi posti dove un attaccante cerca. Usa sempre strumenti digitali criptati.',
    },
    {
      question: 'Un collega ti chiede la tua password per un\'urgenza. Cosa fai?',
      options: [
        'Gliela do, è un collega fidato',
        'Rifiuto e lo aiuto accedendo io stesso o contatto l\'IT',
        'Gliela scrivo su un foglio che poi distruggo',
        'Gliela invio via email interna',
      ],
      correctIndex: 1,
      explanation: 'Le credenziali sono personali e non devono MAI essere condivise. Se un collega ha bisogno di accesso, deve richiederlo tramite i canali ufficiali.',
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
    {
      question: 'Ti alzi per andare alla macchinetta del caffè. Il PC resta sbloccato. Qual è il rischio principale?',
      options: [
        'Il PC potrebbe aggiornarsi automaticamente',
        'Un intruso potrebbe accedere a email, file e sistemi aziendali',
        'Lo screensaver potrebbe consumare energia',
        'Il monitor potrebbe bruciarsi',
      ],
      correctIndex: 1,
      explanation: 'Anche pochi minuti di assenza con il PC sbloccato possono essere sfruttati per accesso non autorizzato a dati sensibili, email o sistemi interni.',
    },
    {
      question: 'Qual è la miglior configurazione per il blocco automatico dello schermo?',
      options: [
        'Mai, è scomodo',
        'Dopo 30 minuti',
        'Dopo 5 minuti di inattività al massimo',
        'Solo quando chiudo il portatile',
      ],
      correctIndex: 2,
      explanation: 'Il blocco automatico dopo 5 minuti (o meno) è una misura di sicurezza base consigliata da tutti i framework di cybersecurity (NIST, ISO 27001).',
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
    {
      question: 'Ricevi un\'email dal "CEO" che ti chiede di effettuare un bonifico urgente. Cosa fai?',
      options: [
        'Eseguo subito, è il capo',
        'Verifico telefonicamente con il CEO prima di procedere',
        'Rispondo all\'email chiedendo conferma',
        'Lo faccio solo se l\'importo è basso',
      ],
      correctIndex: 1,
      explanation: 'La "CEO Fraud" è una truffa molto diffusa. Non fidarti mai solo dell\'email: verifica sempre con una telefonata diretta al mittente usando un numero noto.',
    },
    {
      question: 'Quale tecnica di phishing utilizza messaggi SMS fraudolenti?',
      options: [
        'Vishing',
        'Smishing',
        'Pharming',
        'Whaling',
      ],
      correctIndex: 1,
      explanation: 'Lo "smishing" (SMS + phishing) usa messaggi di testo fraudolenti per indurre la vittima a cliccare link malevoli o fornire dati sensibili.',
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
    {
      question: 'Quale tipo di malware può attivarsi automaticamente quando si inserisce una chiavetta USB?',
      options: [
        'Solo virus manuali',
        'Autorun malware che sfrutta l\'esecuzione automatica',
        'Solo ransomware',
        'Nessuno, le USB sono sempre sicure',
      ],
      correctIndex: 1,
      explanation: 'Gli autorun malware si attivano automaticamente all\'inserimento della USB sfruttando le funzionalità di esecuzione automatica del sistema operativo.',
    },
    {
      question: 'Un fornitore ti consegna una chiavetta USB con i preventivi. Come comportarti?',
      options: [
        'La inserisco direttamente nel mio PC',
        'Chiedo all\'IT di scansionarla prima o chiedo l\'invio via email',
        'La inserisco nel PC di un collega',
        'La uso solo se il fornitore è conosciuto',
      ],
      correctIndex: 1,
      explanation: 'Anche USB da fonti apparentemente fidate possono essere compromesse. L\'IT deve scansionarle con antivirus aggiornato prima dell\'uso.',
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
    {
      question: 'Quali documenti devono essere distrutti con il distruggi-documenti?',
      options: [
        'Solo i contratti scaduti',
        'Tutti i documenti contenenti dati personali o informazioni riservate',
        'Solo le fotocopie',
        'Nessuno, basta gettarli nel cestino',
      ],
      correctIndex: 1,
      explanation: 'Qualsiasi documento con dati personali, finanziari o riservati deve essere distrutto con taglio incrociato (cross-cut) per evitare il "dumpster diving".',
    },
    {
      question: 'Il "dumpster diving" nella cybersecurity è:',
      options: [
        'Un tipo di malware',
        'La ricerca di informazioni sensibili nei rifiuti aziendali',
        'Un attacco DDoS',
        'Una tecnica di crittografia',
      ],
      correctIndex: 1,
      explanation: 'Il dumpster diving consiste nel cercare documenti, appunti o stampe con informazioni utili nei cestini o cassonetti. La Clean Desk Policy lo previene.',
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
    {
      question: 'Cos\'è il "credential stuffing"?',
      options: [
        'Creare password molto lunghe',
        'Usare credenziali rubate da un sito per accedere ad altri servizi',
        'Salvare le password nel browser',
        'Cambiare password troppo spesso',
      ],
      correctIndex: 1,
      explanation: 'Il credential stuffing usa combinazioni email/password rubate da data breach per tentare l\'accesso su altri siti. Per questo ogni servizio deve avere una password unica.',
    },
    {
      question: 'L\'autenticazione a due fattori (2FA) protegge perché:',
      options: [
        'Rende la password più lunga',
        'Richiede un secondo elemento oltre alla password (es. codice SMS o app)',
        'Blocca tutti gli attacchi automaticamente',
        'Cambia la password ogni giorno',
      ],
      correctIndex: 1,
      explanation: 'La 2FA aggiunge un secondo livello: anche se la password viene rubata, serve un codice temporaneo (OTP) generato dal telefono o da un\'app dedicata.',
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
    {
      question: 'Sei in trasferta e devi lavorare. Quale connessione è più sicura?',
      options: [
        'WiFi gratuito dell\'hotel senza password',
        'WiFi del bar con password condivisa',
        'Hotspot del telefono aziendale con VPN attiva',
        'Qualsiasi WiFi purché sia veloce',
      ],
      correctIndex: 2,
      explanation: 'L\'hotspot del telefono aziendale con VPN è la soluzione più sicura. Le WiFi pubbliche sono facilmente intercettabili con attacchi man-in-the-middle.',
    },
    {
      question: 'Cos\'è un attacco "Evil Twin" WiFi?',
      options: [
        'Un virus che si duplica',
        'Un hotspot malevolo che imita una rete WiFi legittima',
        'Un tipo di ransomware',
        'Un errore del router',
      ],
      correctIndex: 1,
      explanation: 'L\'Evil Twin è un access point WiFi creato dall\'attaccante con lo stesso nome di una rete legittima. Gli utenti si connettono pensando sia quella vera, esponendo il loro traffico.',
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
    {
      question: 'Qual è la best practice per stampare documenti riservati in ufficio?',
      options: [
        'Stamparli e ritirarli quando si ha tempo',
        'Usare la funzione "stampa sicura" con PIN di rilascio',
        'Chiedere a un collega di ritirarli',
        'Stampare solo di sera quando non c\'è nessuno',
      ],
      correctIndex: 1,
      explanation: 'La "stampa sicura" (secure print) trattiene il documento in coda fino a quando l\'utente non inserisce il PIN direttamente sulla stampante, evitando che resti incustodito.',
    },
    {
      question: 'Un documento stampato con dati sanitari di un dipendente finisce nel cestino normale. Quale violazione è?',
      options: [
        'Nessuna, è solo carta',
        'Violazione del GDPR per trattamento illecito di dati sensibili',
        'Violazione del D.Lgs 81/08',
        'Solo una mancanza di educazione',
      ],
      correctIndex: 1,
      explanation: 'I dati sanitari sono "dati particolari" ai sensi del GDPR (art. 9). Smaltirli senza distruggerli adeguatamente è una violazione sanzionabile.',
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
