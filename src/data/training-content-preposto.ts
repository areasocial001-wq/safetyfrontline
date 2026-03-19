// Corso Preposto per la Sicurezza
// Conforme all'art. 37 comma 7 D.Lgs 81/2008 e Accordo Stato-Regioni (8 ore)

import { ModuleContent } from './training-content';

// ============================
// MODULO P1: RUOLO E OBBLIGHI DEL PREPOSTO
// ============================
export const moduloP1Content: ModuleContent = {
  moduleId: 'preposto_ruolo_obblighi',
  sections: [
    {
      id: 'p1_intro',
      title: 'Chi è il Preposto',
      type: 'lesson',
      content: `Il **Preposto** è la persona che, in ragione delle competenze professionali e nei limiti dei poteri gerarchici e funzionali, sovrintende all'attività lavorativa e garantisce l'attuazione delle direttive ricevute, controllandone la corretta esecuzione.

**📋 Definizione (art. 2, comma 1, lett. e):**
Il Preposto è il "caposquadra", il "caporeparto", il "capocantiere" — chiunque coordini e vigili sull'attività di altri lavoratori.

**⚠️ Novità Legge 215/2021:**
La legge di conversione del DL 146/2021 ha **rafforzato** il ruolo del Preposto:
- Obbligo di **intervento diretto** per far cessare comportamenti pericolosi
- Obbligo di **segnalazione tempestiva** al DL/Dirigente
- Se le disposizioni non vengono attuate, deve **interrompere l'attività**
- **Aggiornamento biennale** (non più quinquennale)

**⏰ Formazione obbligatoria:**
- Corso iniziale: **8 ore** (aggiuntive alla formazione lavoratori)
- Aggiornamento: **6 ore ogni 2 anni** (dal 2022)
- La formazione deve essere svolta **in presenza** (no e-learning per la parte pratica)`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'p1_quiz_intro',
      title: 'Verifica: Ruolo del Preposto',
      type: 'quiz',
      questions: [
        {
          id: 'p1_q1',
          question: 'Ogni quanto deve essere aggiornata la formazione del Preposto dopo la Legge 215/2021?',
          options: ['Ogni anno', 'Ogni 2 anni', 'Ogni 5 anni', 'Mai'],
          correctIndex: 1,
          explanation: 'La Legge 215/2021 ha introdotto l\'aggiornamento biennale per il Preposto, riducendo la periodicità da 5 a 2 anni.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'p1_q2',
          question: 'Il Preposto è definito come colui che:',
          options: ['Redige il DVR', 'Sovrintende e vigila sull\'attività lavorativa', 'Nomina il RSPP', 'Effettua le visite mediche'],
          correctIndex: 1,
          explanation: 'Il Preposto sovrintende all\'attività lavorativa e garantisce l\'attuazione delle direttive ricevute (art. 2, comma 1, lett. e).',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'p1_obblighi',
      title: 'Gli Obblighi del Preposto (Art. 19)',
      type: 'lesson',
      content: `L'art. 19 del D.Lgs 81/08 definisce gli obblighi specifici del Preposto:

**🔍 VIGILANZA:**
a) Sovrintendere e vigilare sull'osservanza degli obblighi di legge, delle disposizioni aziendali e dell'uso dei DPI
b) Verificare che solo i lavoratori adeguatamente formati accedano alle zone a rischio specifico

**🚨 INTERVENTO (rafforzato dalla L. 215/2021):**
c) In caso di **comportamenti non conformi**: intervenire per modificare il comportamento → se non basta, **interrompere l'attività** del lavoratore
d) In caso di **deficienza dei mezzi/attrezzature** o di ogni altra **condizione di pericolo**: interrompere temporaneamente l'attività e segnalare tempestivamente al DL/Dirigente

**📢 SEGNALAZIONE:**
e) Segnalare tempestivamente al DL/Dirigente le deficienze dei mezzi, delle attrezzature e dei DPI, e qualsiasi condizione di pericolo
f) Richiedere l'osservanza delle misure per il controllo delle situazioni di rischio in emergenza

**📋 INFORMAZIONE:**
g) Informare i lavoratori esposti a pericolo grave e immediato circa il rischio e le disposizioni prese in materia di protezione
h) Frequentare appositi corsi di formazione

**⚖️ Sanzioni per il Preposto:**
Arresto fino a 2 mesi o ammenda da 491,40€ a 1.474,21€`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'p1_scenari_pratici',
      title: 'Il Preposto nella Pratica Quotidiana',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Franco', role: 'Preposto Officina', text: 'Ogni mattina faccio un giro rapido: verifico che tutti indossino i DPI, che le macchine abbiano le protezioni, che le vie di fuga siano libere. Se trovo qualcosa che non va, intervengo SUBITO.' },
        { speaker: 'Sara', role: 'Preposta Uffici', text: 'Anche in ufficio il Preposto è importante! Verifico che le postazioni VDT siano ergonomiche, che le prese multiple non siano sovraccariche e che i corridoi siano liberi da ostacoli.' },
        { speaker: 'Luca', role: 'Preposto Cantiere', text: 'In cantiere non si scherza. Se vedo un operaio senza imbracatura in quota, FERMO TUTTO. Non mi importa se il lavoro si ritarda: la sicurezza viene prima. La Legge 215 me lo impone esplicitamente.' },
        { speaker: 'Avv. Neri', role: 'Legale', text: 'Attenzione: il Preposto che "vede e non interviene" è penalmente responsabile quanto chi commette la violazione. La giurisprudenza è severissima su questo punto.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'p1_interactive',
      title: '🎮 Decisioni del Preposto',
      type: 'interactive',
      content: 'Sei il Preposto. Prendi la decisione corretta in ogni scenario.',
      questions: [
        {
          id: 'p1_int1',
          question: 'Vedi un lavoratore che usa il muletto senza cintura. Ha fretta perché deve finire. Cosa fai?',
          options: ['Lo lascio finire, è quasi terminato', 'Gli dico di metterla e verifico che lo faccia', 'Glielo dico a fine turno', 'Lo segnalo direttamente al DL senza intervenire'],
          correctIndex: 1,
          explanation: 'Il Preposto deve intervenire immediatamente per far cessare il comportamento non conforme. Se il lavoratore non ottempera, deve interrompere l\'attività.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'p1_int2',
          question: 'Noti che un\'attrezzatura ha un\'anomalia potenzialmente pericolosa. Cosa fai?',
          options: ['Continuo a usarla con cautela', 'Interrompo l\'attività, segrego l\'attrezzatura e segnalo al DL', 'Metto un cartello "fuori uso" e basta', 'Aspetto la prossima manutenzione programmata'],
          correctIndex: 1,
          explanation: 'In caso di deficienza di mezzi o condizioni di pericolo, il Preposto deve interrompere temporaneamente l\'attività e segnalare tempestivamente (art. 19, comma 1, lett. f).',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'p1_int3',
          question: 'Un lavoratore neoassunto chiede di accedere a un\'area con rischio chimico. Non ha ancora fatto la formazione specifica. Cosa fai?',
          options: ['Lo faccio entrare ma gli dico di stare attento', 'Gli nego l\'accesso finché non avrà completato la formazione', 'Lo faccio accompagnare da un collega', 'Non è un mio problema'],
          correctIndex: 1,
          explanation: 'Il Preposto deve verificare che solo i lavoratori adeguatamente formati accedano alle zone a rischio specifico (art. 19, comma 1, lett. b).',
          xpReward: 30,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'p1_emergenze',
      title: 'Il Preposto nelle Emergenze',
      type: 'lesson',
      content: `In caso di emergenza, il Preposto ha un ruolo cruciale nel coordinamento.

**🚨 Cosa deve fare il Preposto in emergenza:**

1. **Pericolo grave e immediato:**
   - Interrompere IMMEDIATAMENTE l'attività
   - Informare i lavoratori del pericolo
   - Dare istruzioni per l'evacuazione/messa in sicurezza
   - NON disporre la ripresa del lavoro fino a che il pericolo non è cessato

2. **Infortunio sul lavoro:**
   - Attivare la catena del soccorso (112/118)
   - Mettere in sicurezza l'area
   - Preservare la scena per le indagini
   - Segnalare immediatamente al DL/Dirigente
   - Collaborare alla compilazione del registro infortuni

3. **Near miss (mancato infortunio):**
   - Segnalare SEMPRE, anche se non ci sono stati danni
   - Analizzare le cause con il RSPP
   - Proporre azioni correttive
   - Verificare l'attuazione delle misure

**📌 Ricorda:** Il Preposto NON è responsabile della valutazione dei rischi (è compito del DL), ma è responsabile della VIGILANZA sulla loro applicazione quotidiana.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'p1_boss_test',
      title: '🏆 Test Finale - Corso Preposto',
      type: 'boss_test',
      questions: [
        {
          id: 'p1_boss1',
          question: 'La Legge 215/2021 ha introdotto per il Preposto:',
          options: ['L\'obbligo di redigere il DVR', 'L\'obbligo di interrompere l\'attività in caso di pericolo', 'La nomina del Medico Competente', 'La formazione e-learning obbligatoria'],
          correctIndex: 1,
          explanation: 'La L. 215/2021 ha rafforzato l\'obbligo del Preposto di intervenire direttamente fino a interrompere l\'attività in caso di comportamenti non conformi o pericolo.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'p1_boss2',
          question: 'Il Preposto che "vede e non interviene" su una violazione è:',
          options: ['Esente da responsabilità', 'Penalmente responsabile per omessa vigilanza', 'Responsabile solo civilmente', 'Responsabile solo se c\'è un infortunio'],
          correctIndex: 1,
          explanation: 'Il Preposto è penalmente responsabile per omessa vigilanza. La giurisprudenza è costante: chi ha il dovere di vigilare e non interviene risponde delle conseguenze.',
          xpReward: 40,
          difficulty: 'hard',
        },
        {
          id: 'p1_boss3',
          question: 'La formazione del Preposto deve essere svolta:',
          options: ['Interamente in e-learning', 'In presenza per la parte pratica', 'Solo sul posto di lavoro', 'Solo in aula esterna'],
          correctIndex: 1,
          explanation: 'L\'Accordo Stato-Regioni prevede che la formazione del Preposto includa una parte pratica che deve essere svolta in presenza.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'p1_boss4',
          question: 'Un lavoratore rifiuta di indossare il casco in cantiere. Il Preposto deve:',
          options: ['Lasciarlo lavorare e segnalare a fine giornata', 'Intervenire subito; se persiste, interrompere l\'attività del lavoratore', 'Fornirgli un casco diverso', 'Chiamare la polizia'],
          correctIndex: 1,
          explanation: 'Il Preposto deve intervenire per modificare il comportamento non conforme. Se il lavoratore persiste, deve interrompere l\'attività (art. 19, come modificato dalla L. 215/2021).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'p1_boss5',
          question: 'La sanzione per il Preposto che non adempie ai propri obblighi è:',
          options: ['Nessuna sanzione', 'Solo ammenda pecuniaria', 'Arresto fino a 2 mesi o ammenda', 'Licenziamento'],
          correctIndex: 2,
          explanation: 'L\'art. 56 del D.Lgs 81/08 prevede per il Preposto l\'arresto fino a 2 mesi o ammenda da 491,40€ a 1.474,21€.',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'p1_boss6',
          question: 'Il Preposto deve segnalare un "near miss" (quasi-infortunio)?',
          options: ['No, solo gli infortuni effettivi', 'Sì, sempre, per prevenire infortuni futuri', 'Solo se il DL lo richiede', 'Solo se ci sono testimoni'],
          correctIndex: 1,
          explanation: 'I near miss devono essere sempre segnalati perché permettono di identificare e correggere situazioni pericolose prima che causino infortuni reali.',
          xpReward: 30,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};

export const prepostoContents: ModuleContent[] = [
  moduloP1Content,
];
