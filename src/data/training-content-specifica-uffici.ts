// Formazione Specifica - Settore Uffici (Rischio Basso)
// ATECO: Attività d'ufficio, commercio, servizi - 4 ore
// Conforme all'Accordo Stato-Regioni e D.Lgs 81/2008

import { ModuleContent } from './training-content';

export const specificaUfficiContent: ModuleContent = {
  moduleId: 'ls_uffici',
  sections: [
    {
      id: 'uf_intro',
      title: 'Rischi Specifici nell\'Ambiente d\'Ufficio',
      type: 'lesson',
      content: `L'ambiente d'ufficio è classificato a **rischio basso** secondo i codici ATECO, ma presenta comunque rischi specifici che ogni lavoratore deve conoscere.

**⏱️ Durata formazione specifica:** 4 ore (rischio basso)

**Principali rischi in ufficio:**
- 🖥️ **Videoterminale (VDT):** affaticamento visivo, disturbi muscolo-scheletrici
- 🪑 **Postura e ergonomia:** mal di schiena, sindrome del tunnel carpale
- ⚡ **Rischio elettrico:** apparecchiature, multiprese, cavi
- 🌡️ **Microclima:** aria condizionata, illuminazione, umidità
- 🧠 **Stress lavoro-correlato:** carichi di lavoro, relazioni, organizzazione
- 🔥 **Rischio incendio:** archivi cartacei, apparecchi elettrici

**Riferimenti normativi:**
- D.Lgs 81/2008 Titolo VII (VDT)
- Allegato XXXIV (requisiti postazioni VDT)
- Art. 28 (valutazione stress lavoro-correlato)`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'uf_quiz_intro',
      title: 'Verifica: Rischi in Ufficio',
      type: 'quiz',
      questions: [
        {
          id: 'uf_q1',
          question: 'Il lavoro d\'ufficio è classificato come rischio:',
          options: ['Alto', 'Medio', 'Basso', 'Nullo'],
          correctIndex: 2,
          explanation: 'Le attività d\'ufficio rientrano nella classificazione di rischio basso secondo i codici ATECO, con formazione specifica di 4 ore.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'uf_q2',
          question: 'Quale titolo del D.Lgs 81/08 disciplina il lavoro al videoterminale?',
          options: ['Titolo III', 'Titolo V', 'Titolo VII', 'Titolo IX'],
          correctIndex: 2,
          explanation: 'Il Titolo VII del D.Lgs 81/08 disciplina l\'uso di attrezzature munite di videoterminale, definendo obblighi e tutele per i lavoratori.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'uf_vdt',
      title: 'Lavoro al Videoterminale',
      type: 'lesson',
      content: `Il **videoterminalista** è il lavoratore che utilizza il VDT per almeno **20 ore settimanali**. La normativa prevede tutele specifiche.

**👁️ Affaticamento visivo (astenopia):**
- Distanza monitor: 50-70 cm dagli occhi
- Bordo superiore dello schermo all'altezza degli occhi
- Illuminazione indiretta, senza riflessi sullo schermo
- Regola del **20-20-20**: ogni 20 min, guarda a 20 piedi (6m) per 20 secondi

**⏸️ Pause obbligatorie:**
- 15 minuti di pausa ogni 2 ore di lavoro continuativo al VDT
- Le pause NON sono cumulabili a fine giornata
- Devono prevedere cambio di attività (non altro schermo!)

**🏥 Sorveglianza sanitaria:**
- Visita oculistica prima dell'assunzione
- Controlli periodici: ogni 5 anni (sotto 50 anni), ogni 2 anni (sopra 50 anni)
- Il datore deve fornire occhiali correttivi se necessari per il VDT

**🪑 Postazione ergonomica:**
- Sedia regolabile in altezza con supporto lombare
- Tastiera separata dal monitor, con spazio per appoggio polsi
- Piano di lavoro profondo almeno 80 cm
- Poggiapiedi se necessario`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'uf_quiz_vdt',
      title: 'Verifica: Videoterminale',
      type: 'quiz',
      questions: [
        {
          id: 'uf_q3',
          question: 'Ogni quante ore di lavoro al VDT è prevista una pausa?',
          options: ['Ogni ora', 'Ogni 2 ore', 'Ogni 3 ore', 'Ogni 4 ore'],
          correctIndex: 1,
          explanation: 'La pausa è di 15 minuti ogni 2 ore di lavoro continuativo al VDT, come previsto dall\'art. 175 del D.Lgs 81/08.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'uf_q4',
          question: 'Chi è considerato "videoterminalista"?',
          options: ['Chi usa il PC almeno 10 ore/settimana', 'Chi usa il VDT almeno 20 ore/settimana', 'Tutti gli impiegati', 'Solo chi fa data entry'],
          correctIndex: 1,
          explanation: 'È videoterminalista chi utilizza un\'attrezzatura munita di videoterminale in modo sistematico e abituale per almeno 20 ore settimanali.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'uf_ergonomia',
      title: 'Ergonomia e Postura Corretta',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Dott.ssa Bianchi', role: 'Medico Competente', text: 'Il 60% dei disturbi che tratto tra gli impiegati riguarda la schiena e il collo. Una postazione ben regolata previene il 90% di questi problemi. Controllate sempre altezza sedia, distanza monitor e posizione dei polsi.' },
        { speaker: 'Paolo', role: 'Impiegato Amministrativo', text: 'Da quando ho regolato la sedia con supporto lombare e uso il poggiapiedi, il mal di schiena è sparito. La pausa attiva ogni 2 ore fa davvero la differenza: mi alzo, cammino e faccio stretching.' },
        { speaker: 'Giulia', role: 'RSPP', text: 'Ricordate: la scrivania deve essere alta 72 cm, il monitor a distanza di un braccio. I gomiti devono formare un angolo di 90° quando digitiamo. Se il sole batte sullo schermo, usate le tende o spostate il monitor.' },
        { speaker: 'Marco', role: 'Tecnico IT', text: 'Le multiprese a cascata sono vietate! Un incendio su tre in ufficio parte da un sovraccarico elettrico. Segnalate sempre cavi danneggiati e non ostruite mai le prese con i mobili.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'uf_interactive',
      title: '🎮 Identifica i Rischi in Ufficio',
      type: 'interactive',
      content: 'Analizza le situazioni e identifica il rischio corretto.',
      questions: [
        {
          id: 'uf_int1',
          question: 'Un collega lavora 6 ore consecutive al PC senza pause. Qual è il rischio principale?',
          options: ['Rischio chimico', 'Affaticamento visivo e disturbi muscolo-scheletrici', 'Rischio biologico', 'Rischio meccanico'],
          correctIndex: 1,
          explanation: 'Lavorare al VDT senza le pause previste causa affaticamento visivo (astenopia), cefalea, dolori cervicali e disturbi muscolo-scheletrici. Le pause ogni 2 ore sono obbligatorie.',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'uf_int2',
          question: 'In ufficio la temperatura è di 30°C e l\'umidità è al 25%. Quale norma viene violata?',
          options: ['Nessuna, è nella norma', 'Allegato IV D.Lgs 81/08 - microclima', 'Titolo X - agenti biologici', 'Titolo VIII - agenti fisici'],
          correctIndex: 1,
          explanation: 'L\'Allegato IV prescrive temperature di 18-26°C e umidità del 40-60% negli ambienti di lavoro. 30°C con 25% di umidità sono fuori range e vanno segnalati.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'uf_int3',
          question: 'Un impiegato segnala ansia persistente, insonnia e calo di concentrazione. Di quale rischio potrebbe trattarsi?',
          options: ['Rischio chimico', 'Rischio rumore', 'Stress lavoro-correlato', 'Rischio VDT'],
          correctIndex: 2,
          explanation: 'I sintomi descritti sono tipici dello stress lavoro-correlato, che il datore deve valutare ai sensi dell\'art. 28 D.Lgs 81/08. È un rischio specifico riconosciuto anche negli uffici.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'uf_stress',
      title: 'Stress Lavoro-Correlato e Microclima',
      type: 'lesson',
      content: `**🧠 Stress Lavoro-Correlato**
Il D.Lgs 81/08 (art. 28) obbliga il datore a valutare lo stress lavoro-correlato. Fattori di rischio in ufficio:
- Carichi di lavoro eccessivi o monotoni
- Conflitti interpersonali e mobbing
- Mancanza di autonomia decisionale
- Orari rigidi e scarsa conciliazione vita-lavoro
- Incertezza del ruolo

**Segnali d'allarme:** assenteismo, calo produttività, conflitti frequenti, disturbi psicosomatici.

**🌡️ Microclima in Ufficio**
Parametri ottimali (Allegato IV):
| Parametro | Valore ottimale |
|-----------|----------------|
| Temperatura invernale | 19-22°C |
| Temperatura estiva | 24-26°C |
| Umidità relativa | 40-60% |
| Velocità aria | < 0.15 m/s |
| Illuminamento | 300-500 lux |

**💡 Illuminazione:**
- Luce naturale preferibile, integrata con artificiale
- Monitor perpendicolare alla finestra (mai di fronte o di spalle)
- Evitare riflessi e abbagliamento diretto
- Lampade a norma con frequenza > 300 Hz (no sfarfallio)`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'uf_emergenze',
      title: 'Emergenze e Rischio Elettrico in Ufficio',
      type: 'lesson',
      content: `**⚡ Rischio Elettrico in Ufficio**
Anche se il rischio è basso, le regole sono fondamentali:
- ❌ Mai multiprese a cascata (ciabatte su ciabatte)
- ❌ Mai cavi sotto tappeti o passaggi
- ❌ Mai tirare il cavo per scollegare un apparecchio
- ✅ Segnalare immediatamente prese danneggiate o annerite
- ✅ Spegnere le apparecchiature a fine giornata
- ✅ Usare solo apparecchi con marchio CE

**🔥 Rischio Incendio in Ufficio**
Cause principali: cortocircuiti, accumulo carta vicino a fonti di calore, mozziconi.
- Conoscere le uscite di emergenza e i punti di raccolta
- Non ostruire mai le vie di fuga con scatoloni, sedie, arredi
- Sapere dove sono gli estintori più vicini
- Partecipare alle prove di evacuazione annuali

**🚶 Scivolamento e Inciampo (rischio sottovalutato)**
- Pavimenti bagnati → segnaletica di pericolo
- Cavi a terra → canalizzazione obbligatoria
- Cassetti aperti → rischio urto e inciampo
- Scale interne → tenere il corrimano, no tacchi instabili`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'uf_boss_test',
      title: '🏆 Test Finale - Formazione Specifica Uffici',
      type: 'boss_test',
      questions: [
        {
          id: 'uf_boss1',
          question: 'La distanza corretta tra occhi e monitor è:',
          options: ['30-40 cm', '50-70 cm', '80-100 cm', 'Non importa'],
          correctIndex: 1,
          explanation: 'La distanza ottimale tra gli occhi e il monitor è di 50-70 cm, con il bordo superiore dello schermo all\'altezza degli occhi.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'uf_boss2',
          question: 'Le pause VDT di 15 minuti ogni 2 ore possono essere cumulate a fine giornata?',
          options: ['Sì, se il lavoratore preferisce', 'No, devono essere fruite durante il turno', 'Sì, con accordo sindacale', 'Solo il venerdì'],
          correctIndex: 1,
          explanation: 'Le pause VDT NON sono cumulabili. Devono essere fruite durante l\'orario di lavoro per garantire il riposo visivo e posturale.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'uf_boss3',
          question: 'L\'uso di multiprese a cascata in ufficio è:',
          options: ['Permesso se la potenza è adeguata', 'Vietato per rischio sovraccarico elettrico', 'Permesso solo con multiprese con interruttore', 'A discrezione dell\'impiegato'],
          correctIndex: 1,
          explanation: 'Le multiprese a cascata (ciabatte collegate ad altre ciabatte) sono vietate perché causano sovraccarico elettrico e rischio incendio.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'uf_boss4',
          question: 'La sorveglianza sanitaria per videoterminalisti over 50 ha cadenza:',
          options: ['Annuale', 'Biennale', 'Triennale', 'Quinquennale'],
          correctIndex: 1,
          explanation: 'Per i videoterminalisti con più di 50 anni, la visita oculistica periodica ha cadenza biennale (ogni 2 anni) anziché quinquennale.',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'uf_boss5',
          question: 'La temperatura ottimale in ufficio in estate deve essere:',
          options: ['18-20°C', '20-22°C', '24-26°C', '28-30°C'],
          correctIndex: 2,
          explanation: 'In estate la temperatura ottimale è 24-26°C secondo l\'Allegato IV. Scendere sotto i 20°C causa shock termico rispetto all\'esterno.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'uf_boss6',
          question: 'Lo stress lavoro-correlato è un rischio che il datore di lavoro:',
          options: ['Non è obbligato a valutare', 'Deve valutare ai sensi dell\'art. 28 D.Lgs 81/08', 'Valuta solo su richiesta del lavoratore', 'È valutato solo dall\'INAIL'],
          correctIndex: 1,
          explanation: 'L\'art. 28 D.Lgs 81/08 obbliga il datore di lavoro a valutare tutti i rischi, incluso lo stress lavoro-correlato, e a inserirlo nel DVR.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
