import { ModuleContent } from './training-content';

export const moduloRLS3Content: ModuleContent = {
  moduleId: 'rls_comunicazione',
  sections: [
    {
      id: 'rls3_tecniche',
      title: 'Tecniche di Comunicazione per il RLS',
      type: 'lesson',
      content: `La comunicazione efficace è la competenza chiave del RLS per svolgere il proprio ruolo.

**🗣️ Comunicazione con i lavoratori:**
- **Ascolto attivo:** dedicare tempo alle segnalazioni dei colleghi
- **Linguaggio chiaro:** evitare tecnicismi, usare esempi concreti
- **Feedback:** informare i colleghi sugli esiti delle segnalazioni
- **Riservatezza:** proteggere l'identità di chi segnala

**📋 Comunicazione con il DL/Dirigente:**
- Segnalazioni **scritte** e protocollate (tracciabilità)
- Riferimenti normativi precisi
- Proposte concrete di miglioramento
- Tono collaborativo, non accusatorio

**🤝 Negoziazione e Gestione Conflitti:**
- Il RLS non è un "avversario" del DL, ma un **collaboratore** per la sicurezza
- Approccio win-win: sicurezza E produttività
- Uso dei dati (infortuni, near miss) per supportare le richieste
- Escalation graduale: segnalazione → sollecito → organo di vigilanza

**📧 Strumenti di comunicazione formale:**
- Verbali delle riunioni
- Lettere di segnalazione protocollate
- Email con ricevuta di lettura
- Registro delle segnalazioni del RLS`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'rls3_quiz_comunicazione',
      title: 'Verifica: Comunicazione',
      type: 'quiz',
      questions: [
        {
          id: 'rls3_q1',
          question: 'Perché le segnalazioni del RLS dovrebbero essere scritte?',
          options: ['Per burocrazia', 'Per garantire la tracciabilità e avere prova documentale', 'Non è necessario che siano scritte', 'Solo per segnalazioni gravi'],
          correctIndex: 1,
          explanation: 'Le segnalazioni scritte garantiscono tracciabilità, costituiscono prova documentale e permettono di verificare se il DL ha dato seguito.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rls3_q2',
          question: 'L\'approccio corretto del RLS verso il DL è:',
          options: ['Conflittuale e accusatorio', 'Collaborativo, orientato alla soluzione', 'Passivo e remissivo', 'Indifferente'],
          correctIndex: 1,
          explanation: 'Il RLS deve adottare un approccio collaborativo, proponendo soluzioni concrete. Il confronto costruttivo è più efficace dell\'antagonismo.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rls3_organi_vigilanza',
      title: 'Rapporti con gli Organi di Vigilanza',
      type: 'lesson',
      content: `Il RLS ha un rapporto diretto con gli organi di vigilanza.

**🏛️ Organi di vigilanza in Italia:**
- **ASL/ATS:** principale organo di controllo sulla sicurezza sul lavoro
- **Ispettorato Nazionale del Lavoro (INL):** verifiche su rapporti di lavoro e sicurezza
- **INAIL:** prevenzione, assicurazione e riabilitazione
- **VVF:** prevenzione incendi e verifiche antincendio

**📋 Diritti del RLS verso gli organi di vigilanza:**
- Ricevere informazioni dagli organi di vigilanza (art. 50, comma 1, lett. e)
- Fare ricorso alle autorità competenti (art. 50, comma 1, lett. o)
- Formulare osservazioni durante le visite ispettive (art. 50, comma 1, lett. h)
- Essere consultato durante le verifiche

**🔍 Quando rivolgersi all'organo di vigilanza:**
1. Quando le segnalazioni al DL non producono risultati
2. In caso di pericolo grave e imminente non gestito
3. Per contestare il giudizio del Medico Competente
4. Per segnalare violazioni gravi e reiterate

**⚠️ Importante:** Il ricorso all'organo di vigilanza è un diritto del RLS e non può comportare ritorsioni. Il RLS è tutelato contro qualsiasi pregiudizio derivante dal suo ruolo.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rls3_interactive',
      title: '🎮 Scenari di Comunicazione',
      type: 'interactive',
      content: 'Gestisci queste situazioni comunicative come RLS.',
      questions: [
        {
          id: 'rls3_int1',
          question: 'Un collega ti segnala un rischio ma ti chiede di non fare il suo nome. Come gestisci la situazione?',
          options: ['Faccio il nome del collega al DL', 'Segnalo il rischio senza rivelare la fonte, garantendo la riservatezza', 'Ignoro la segnalazione perché anonima', 'Dico al collega di segnalare direttamente'],
          correctIndex: 1,
          explanation: 'Il RLS deve proteggere la riservatezza di chi segnala. Può segnalare il rischio al DL senza rivelare la fonte, concentrandosi sul problema e non sulla persona.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'rls3_int2',
          question: 'Hai segnalato un rischio al DL 3 mesi fa ma non è stato fatto nulla. Qual è il passo successivo?',
          options: ['Rinuncio', 'Invio un sollecito scritto formale con termine; se persiste, valuto il ricorso all\'organo di vigilanza', 'Organizzo uno sciopero', 'Ne parlo solo alla riunione periodica tra 9 mesi'],
          correctIndex: 1,
          explanation: 'L\'escalation è graduale: sollecito scritto formale con indicazione di un termine ragionevole. Se il DL non provvede, il RLS può fare ricorso all\'organo di vigilanza.',
          xpReward: 30,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'rls3_boss_test',
      title: '🏆 Test Finale - Comunicazione e Relazioni',
      type: 'boss_test',
      questions: [
        {
          id: 'rls3_boss1',
          question: 'Il RLS che fa ricorso all\'organo di vigilanza:',
          options: ['Può essere licenziato', 'È tutelato contro qualsiasi ritorsione', 'Deve prima avere l\'autorizzazione del DL', 'Perde il diritto ai permessi retribuiti'],
          correctIndex: 1,
          explanation: 'Il RLS è tutelato contro qualsiasi pregiudizio derivante dall\'esercizio delle sue funzioni, incluso il ricorso alle autorità (art. 50).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rls3_boss2',
          question: 'L\'organo di vigilanza principale per la sicurezza sul lavoro è:',
          options: ['INPS', 'ASL/ATS', 'Comune', 'Camera di Commercio'],
          correctIndex: 1,
          explanation: 'L\'ASL (o ATS in alcune regioni) è il principale organo di vigilanza sulla sicurezza e salute nei luoghi di lavoro.',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'rls3_boss3',
          question: 'Il modo migliore per il RLS di documentare una segnalazione è:',
          options: ['Comunicazione verbale informale', 'Segnalazione scritta protocollata con riferimenti normativi', 'Post-it sulla scrivania del DL', 'Messaggio WhatsApp al DL'],
          correctIndex: 1,
          explanation: 'La segnalazione scritta, protocollata e con riferimenti normativi garantisce tracciabilità, formalità e valore probatorio.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rls3_boss4',
          question: 'Il RLS può formulare osservazioni durante una visita ispettiva dell\'ASL?',
          options: ['No, deve restare in silenzio', 'Sì, è un suo diritto specifico (art. 50)', 'Solo se invitato dall\'ispettore', 'Solo con il permesso del DL'],
          correctIndex: 1,
          explanation: 'L\'art. 50, comma 1, lett. h) prevede espressamente che il RLS possa formulare osservazioni in occasione di visite e verifiche effettuate dalle autorità competenti.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
