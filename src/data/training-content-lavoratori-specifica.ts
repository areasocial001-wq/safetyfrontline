// Corso per Lavoratori - Formazione Specifica per Settore
// Conforme all'Accordo Stato-Regioni e D.Lgs 81/2008

import { ModuleContent } from './training-content';

// ============================
// MODULO LS1: RISCHI SPECIFICI DEL SETTORE
// ============================
export const moduloLS1Content: ModuleContent = {
  moduleId: 'ls_rischi_settore',
  sections: [
    {
      id: 'ls1_intro',
      title: 'La Formazione Specifica per Settore',
      type: 'lesson',
      content: `L'Accordo Stato-Regioni prevede che ogni lavoratore riceva una **formazione specifica** calibrata sui rischi reali del proprio settore lavorativo. La durata varia in base alla classificazione di rischio ATECO:

**Durata della formazione specifica:**
- 🟢 **Rischio Basso** (4 ore): Uffici, commercio, turismo, servizi
- 🟡 **Rischio Medio** (8 ore): PA, trasporti, agricoltura, pesca
- 🔴 **Rischio Alto** (12 ore): Edilizia, chimica, industria, sanità

**Contenuti obbligatori:**
- Rischi infortuni specifici della mansione
- Meccanici, elettrici, chimici e biologici
- Attrezzature di lavoro utilizzate
- DPI necessari per la mansione
- Procedure di emergenza specifiche
- Segnaletica di sicurezza

La formazione deve essere **ripetuta** in caso di cambio mansione, introduzione di nuove attrezzature o sostanze pericolose.`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ls1_quiz_intro',
      title: 'Verifica: Formazione Specifica',
      type: 'quiz',
      questions: [
        {
          id: 'ls1_q1',
          question: 'Qual è la durata della formazione specifica per il rischio alto?',
          options: ['4 ore', '8 ore', '12 ore', '16 ore'],
          correctIndex: 2,
          explanation: 'La formazione specifica per lavoratori del settore ad alto rischio ha una durata minima di 12 ore.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ls1_q2',
          question: 'Quando deve essere ripetuta la formazione specifica?',
          options: ['Solo alla scadenza quinquennale', 'In caso di cambio mansione o nuove attrezzature', 'Mai, basta quella iniziale', 'Solo su richiesta del lavoratore'],
          correctIndex: 1,
          explanation: 'La formazione specifica deve essere ripetuta in caso di cambio mansione, introduzione di nuove attrezzature, tecnologie o sostanze pericolose.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ls1_rischi_mansione',
      title: 'Analisi dei Rischi per Mansione',
      type: 'lesson',
      content: `Ogni mansione presenta rischi specifici che devono essere analizzati e comunicati al lavoratore.

**📋 Esempio: Operaio di produzione**
- Rischio meccanico (macchine utensili, organi in movimento)
- Rischio rumore (>80 dB(A) = sorveglianza sanitaria)
- Rischio chimico (oli, solventi, polveri)
- Movimentazione manuale dei carichi
- Rischio elettrico (manutenzione)

**📋 Esempio: Impiegato amministrativo**
- Rischio VDT (videoterminale >20h/settimana)
- Rischio posturale (sedentarietà)
- Stress lavoro-correlato
- Microclima (aria condizionata, illuminazione)
- Rischio elettrico base (apparecchiature d'ufficio)

**📋 Esempio: Magazziniere**
- Movimentazione manuale carichi (NIOSH)
- Rischio da carrello elevatore
- Caduta materiale dall'alto (scaffalature)
- Rischio investimento (traffico interno)
- Scivolamento e inciampo

Il **DVR (Documento di Valutazione dei Rischi)** deve contenere l'analisi specifica per ogni mansione presente in azienda.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ls1_interactive',
      title: '🎮 Associa Rischio e Mansione',
      type: 'interactive',
      content: 'Abbina ogni rischio alla mansione corretta e identifica le misure di prevenzione appropriate.',
      questions: [
        {
          id: 'ls1_int1',
          question: 'Un saldatore è esposto a quale rischio principale?',
          options: ['Stress lavoro-correlato', 'Radiazioni ottiche artificiali e fumi metallici', 'Rischio VDT', 'Rischio biologico'],
          correctIndex: 1,
          explanation: 'Il saldatore è esposto a radiazioni ottiche artificiali (UV e IR), fumi metallici, rischio ustione e rumore. Necessita di DPI specifici: maschera con filtro, guanti, grembiule.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'ls1_int2',
          question: 'Un addetto alle pulizie in ospedale è esposto a quale rischio specifico?',
          options: ['Solo rischio chimico', 'Rischio biologico e chimico', 'Solo rischio posturale', 'Rischio meccanico'],
          correctIndex: 1,
          explanation: 'L\'addetto alle pulizie in ambiente sanitario è esposto sia al rischio biologico (agenti patogeni) sia al rischio chimico (detergenti, disinfettanti). Richiede guanti, mascherina e formazione specifica.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'ls1_int3',
          question: 'Un autista di autobus è soggetto a sorveglianza sanitaria per:',
          options: ['Rischio VDT', 'Vibrazioni al corpo intero e stress', 'Rischio chimico', 'Rischio biologico'],
          correctIndex: 1,
          explanation: 'Gli autisti professionisti sono esposti a vibrazioni trasmesse al corpo intero (WBV), stress, postura prolungata e turni irregolari.',
          xpReward: 25,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ls1_dpi',
      title: 'DPI Specifici per Settore',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Marco', role: 'Responsabile Magazzino', text: 'Nel mio reparto usiamo scarpe antinfortunistiche S3, guanti da movimentazione e gilet ad alta visibilità. Quando usiamo il carrello elevatore, è obbligatorio anche il casco.' },
        { speaker: 'Laura', role: 'Tecnico di Laboratorio', text: 'In laboratorio indosso sempre camice, guanti in nitrile, occhiali protettivi e, quando lavoro sotto cappa, la mascherina FFP2 o FFP3 a seconda delle sostanze.' },
        { speaker: 'Giuseppe', role: 'Operaio Edile', text: 'In cantiere non si entra senza casco, scarpe S3 con puntale e lamina, guanti e imbracatura quando lavoro sopra i 2 metri. D\'estate aggiungo protezione solare e cappello sotto il casco.' },
        { speaker: 'Anna', role: 'Impiegata', text: 'Anche in ufficio ci sono DPI! Uso un poggiapiedi, un supporto per il monitor e lenti con filtro luce blu. La sedia ergonomica è il mio DPI principale.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ls1_quiz_dpi',
      title: 'Verifica: DPI e Rischi Specifici',
      type: 'quiz',
      questions: [
        {
          id: 'ls1_q3',
          question: 'Le scarpe antinfortunistiche di categoria S3 offrono protezione contro:',
          options: ['Solo urti sulla punta', 'Puntale, lamina antiperforazione e suola antiscivolo', 'Solo acqua e umidità', 'Solo rischio elettrico'],
          correctIndex: 1,
          explanation: 'Le S3 includono puntale in acciaio/composito, lamina antiperforazione, suola antiscivolo, impermeabilità e assorbimento energia al tallone.',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'ls1_q4',
          question: 'Chi deve fornire gratuitamente i DPI ai lavoratori?',
          options: ['Il lavoratore li compra', 'Il Datore di Lavoro', 'L\'INAIL', 'Il Medico Competente'],
          correctIndex: 1,
          explanation: 'Il Datore di Lavoro ha l\'obbligo di fornire gratuitamente i DPI adeguati ai rischi specifici della mansione (art. 77 D.Lgs 81/08).',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ls1_emergenze',
      title: 'Procedure di Emergenza Specifiche',
      type: 'lesson',
      content: `Ogni settore ha procedure di emergenza specifiche oltre a quelle generali.

**🏭 Settore Industriale:**
- Procedure di blocco macchine (LOTO - Lockout/Tagout)
- Contenimento sversamenti chimici
- Evacuazione con percorsi alternativi per aree produttive

**🏗️ Settore Edile:**
- Evacuazione da ponteggi e strutture temporanee
- Gestione crolli parziali e cedimenti
- Soccorso in quota con sistemi di recupero

**🏥 Settore Sanitario:**
- Gestione incidenti con agenti biologici
- Procedure post-esposizione (PEP)
- Evacuazione pazienti non deambulanti

**🏢 Settore Terziario:**
- Evacuazione locale aperto al pubblico
- Gestione panico e affollamento
- Procedure per lavoratori isolati

**📌 Regola d'oro:** Conosci SEMPRE le procedure specifiche del TUO luogo di lavoro. Partecipa alle prove di evacuazione e segnala eventuali criticità.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ls1_boss_test',
      title: '🏆 Test Finale - Formazione Specifica Lavoratori',
      type: 'boss_test',
      questions: [
        {
          id: 'ls1_boss1',
          question: 'La formazione specifica dei lavoratori è calibrata su:',
          options: ['L\'anzianità di servizio', 'I rischi reali del settore e della mansione', 'Il titolo di studio', 'La dimensione dell\'azienda'],
          correctIndex: 1,
          explanation: 'La formazione specifica è calibrata sui rischi effettivi presenti nel settore lavorativo e nella mansione del lavoratore.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ls1_boss2',
          question: 'Il sistema LOTO (Lockout/Tagout) serve a:',
          options: ['Chiudere a chiave il magazzino', 'Isolare le fonti di energia durante la manutenzione', 'Bloccare l\'accesso ai visitatori', 'Registrare gli infortuni'],
          correctIndex: 1,
          explanation: 'LOTO è una procedura di sicurezza che isola le fonti di energia (elettrica, meccanica, idraulica) durante la manutenzione per prevenire avviamenti accidentali.',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'ls1_boss3',
          question: 'Un lavoratore cambia mansione passando dall\'ufficio al magazzino. Cosa deve fare?',
          options: ['Nulla, la formazione generale è sufficiente', 'Ricevere formazione specifica sui nuovi rischi', 'Solo una visita medica', 'Aspettare il prossimo aggiornamento quinquennale'],
          correctIndex: 1,
          explanation: 'In caso di cambio mansione il lavoratore deve ricevere formazione specifica sui nuovi rischi a cui sarà esposto, come previsto dall\'art. 37 del D.Lgs 81/08.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ls1_boss4',
          question: 'Le mascherine FFP3 proteggono da:',
          options: ['Solo polveri grossolane', 'Particelle fini, aerosol e agenti biologici', 'Solo cattivi odori', 'Rischio rumore'],
          correctIndex: 1,
          explanation: 'Le FFP3 offrono il massimo livello di filtrazione (99%) e proteggono da polveri fini, aerosol, agenti biologici e particelle tossiche.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ls1_boss5',
          question: 'Il DVR deve contenere la valutazione dei rischi per:',
          options: ['Solo i rischi più gravi', 'Ogni singola mansione presente in azienda', 'Solo le mansioni operative', 'Solo i rischi chimici'],
          correctIndex: 1,
          explanation: 'Il DVR deve analizzare tutti i rischi per la sicurezza e la salute, con riferimento a tutte le mansioni presenti in azienda.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ls1_boss6',
          question: 'L\'aggiornamento della formazione specifica ha periodicità:',
          options: ['Annuale', 'Triennale', 'Quinquennale (6 ore)', 'Decennale'],
          correctIndex: 2,
          explanation: 'L\'aggiornamento della formazione specifica dei lavoratori è quinquennale con durata minima di 6 ore, come previsto dall\'Accordo Stato-Regioni.',
          xpReward: 30,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};

export const lavoratoriSpecificaContents: ModuleContent[] = [
  moduloLS1Content,
];
