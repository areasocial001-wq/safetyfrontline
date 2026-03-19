// Corso RSPP Datore di Lavoro
// Conforme all'art. 34 D.Lgs 81/2008 e Accordo Stato-Regioni

import { ModuleContent } from './training-content';

// ============================
// MODULO RSPP1: GIURIDICO-NORMATIVO
// ============================
export const moduloRSPP1Content: ModuleContent = {
  moduleId: 'rspp_dl_giuridico',
  sections: [
    {
      id: 'rspp1_intro',
      title: 'Il Datore di Lavoro come RSPP',
      type: 'lesson',
      content: `L'art. 34 del D.Lgs 81/2008 consente al **Datore di Lavoro** di svolgere direttamente i compiti del Servizio di Prevenzione e Protezione (RSPP) in determinate condizioni:

**Quando è possibile:**
- 🏢 Aziende artigiane e industriali fino a **30 lavoratori**
- 🌾 Aziende agricole/zootecniche fino a **30 lavoratori**
- 🐟 Aziende della pesca fino a **20 lavoratori**
- 🏪 Altre aziende fino a **200 lavoratori**

**Obblighi formativi:**
La durata del corso varia in base al livello di rischio:
- 🟢 Rischio Basso: **16 ore**
- 🟡 Rischio Medio: **32 ore**
- 🔴 Rischio Alto: **48 ore**

**Aggiornamento quinquennale:**
- Rischio Basso: 6 ore
- Rischio Medio: 10 ore
- Rischio Alto: 14 ore

**⚠️ IMPORTANTE:** Il DL-RSPP NON può delegare la valutazione dei rischi e la redazione del DVR. Questi restano obblighi personali e non delegabili.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rspp1_quiz_intro',
      title: 'Verifica: Ruolo DL-RSPP',
      type: 'quiz',
      questions: [
        {
          id: 'rspp1_q1',
          question: 'In un\'azienda industriale con 25 dipendenti, il DL può fare da RSPP?',
          options: ['No, mai', 'Sì, perché ha meno di 30 lavoratori', 'Solo con autorizzazione ASL', 'Solo se è ingegnere'],
          correctIndex: 1,
          explanation: 'Nelle aziende artigiane e industriali fino a 30 lavoratori, il Datore di Lavoro può svolgere direttamente i compiti di RSPP (art. 34).',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rspp1_q2',
          question: 'Qual è la durata del corso RSPP-DL per rischio medio?',
          options: ['16 ore', '32 ore', '48 ore', '8 ore'],
          correctIndex: 1,
          explanation: 'Il corso RSPP per Datore di Lavoro a rischio medio ha una durata di 32 ore, suddivise in 4 moduli.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rspp1_responsabilita',
      title: 'Responsabilità del DL-RSPP',
      type: 'lesson',
      content: `Il Datore di Lavoro che assume il ruolo di RSPP cumula le responsabilità di entrambe le figure.

**Obblighi NON delegabili del DL (art. 17):**
🔒 Valutazione di TUTTI i rischi ed elaborazione del DVR
🔒 Designazione del RSPP (in questo caso, se stesso)

**Obblighi delegabili ma comunque del DL (art. 18):**
📋 Nominare il Medico Competente
📋 Designare addetti antincendio e primo soccorso
📋 Fornire DPI adeguati
📋 Garantire formazione e informazione
📋 Consentire la sorveglianza sanitaria
📋 Consultare il RLS
📋 Aggiornare le misure di prevenzione

**Compiti aggiuntivi come RSPP (art. 33):**
🔍 Individuazione dei fattori di rischio
🔍 Elaborazione delle misure preventive e protettive
🔍 Elaborazione delle procedure di sicurezza
🔍 Proposte di programmi di informazione e formazione
🔍 Partecipazione alla riunione periodica (art. 35)

**⚖️ Sanzioni:** Il DL che non adempie agli obblighi di RSPP rischia l'arresto da 3 a 6 mesi o ammenda da 3.071€ a 7.862€.`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rspp1_dvr',
      title: 'Il DVR: Documento di Valutazione dei Rischi',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Dott. Bianchi', role: 'Consulente Sicurezza', text: 'Il DVR è il documento fondamentale. Deve contenere: l\'analisi di TUTTI i rischi, le misure adottate, il programma di miglioramento, le procedure organizzative e i nominativi delle figure della sicurezza.' },
        { speaker: 'Ing. Rossi', role: 'RSPP Esterno', text: 'Attenzione: il DVR deve avere DATA CERTA. Può essere attestata tramite PEC, marca temporale, firma digitale o sottoscrizione congiunta del DL, RSPP, RLS e MC.' },
        { speaker: 'Avv. Neri', role: 'Legale del Lavoro', text: 'Un DVR inadeguato o generico NON è sufficiente. L\'Ispettorato verifica che la valutazione sia specifica per ogni mansione, ambiente e attrezzatura realmente presenti.' },
        { speaker: 'Marco', role: 'Datore di Lavoro PMI', text: 'Come piccola impresa, posso usare le procedure standardizzate (art. 29 comma 5) se ho meno di 10 lavoratori. Ma il DVR completo resta la scelta migliore per la tutela di tutti.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rspp1_quiz_dvr',
      title: 'Verifica: DVR e Responsabilità',
      type: 'quiz',
      questions: [
        {
          id: 'rspp1_q3',
          question: 'Il DVR deve avere:',
          options: ['Solo la firma del DL', 'Data certa attestabile', 'L\'approvazione dell\'INAIL', 'Il timbro del Comune'],
          correctIndex: 1,
          explanation: 'Il DVR deve avere data certa, attestabile tramite PEC, firma digitale, marca temporale o sottoscrizione congiunta delle figure della sicurezza.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'rspp1_q4',
          question: 'La riunione periodica di cui all\'art. 35 è obbligatoria nelle aziende con:',
          options: ['Più di 5 lavoratori', 'Più di 15 lavoratori', 'Più di 50 lavoratori', 'Qualsiasi dimensione'],
          correctIndex: 1,
          explanation: 'La riunione periodica annuale è obbligatoria nelle aziende con più di 15 lavoratori. Vi partecipano DL, RSPP, MC e RLS.',
          xpReward: 20,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rspp1_gestione_rischi',
      title: 'Gestione e Comunicazione dei Rischi',
      type: 'lesson',
      content: `Il DL-RSPP deve saper gestire la comunicazione sulla sicurezza in azienda.

**📊 Il Ciclo PDCA della Sicurezza:**
1. **PLAN** - Pianificare: Valutare i rischi, definire obiettivi e misure
2. **DO** - Fare: Attuare le misure, formare i lavoratori
3. **CHECK** - Verificare: Monitorare, audit interni, analisi infortuni
4. **ACT** - Agire: Correggere, migliorare, aggiornare il DVR

**📢 Comunicazione efficace:**
- Riunioni periodiche di sicurezza
- Cartellonistica chiara e aggiornata
- Procedure scritte e accessibili
- Cassetta delle segnalazioni anonime
- Near miss reporting (mancati infortuni)

**📈 Indicatori di Performance:**
- Indice di frequenza infortuni (IF)
- Indice di gravità (IG)
- Ore di formazione pro-capite
- Tasso di conformità DVR
- Near miss segnalati vs risolti`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rspp1_boss_test',
      title: '🏆 Test Finale - Corso RSPP Datore di Lavoro',
      type: 'boss_test',
      questions: [
        {
          id: 'rspp1_boss1',
          question: 'L\'art. 34 del D.Lgs 81/08 consente al DL di fare da RSPP in aziende industriali fino a:',
          options: ['10 lavoratori', '30 lavoratori', '50 lavoratori', '200 lavoratori'],
          correctIndex: 1,
          explanation: 'Nelle aziende artigiane e industriali, il limite è 30 lavoratori. Per le "altre aziende" il limite sale a 200.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rspp1_boss2',
          question: 'Quale tra questi è un obbligo NON delegabile del Datore di Lavoro?',
          options: ['Nomina del Medico Competente', 'Fornitura dei DPI', 'Valutazione dei rischi e redazione del DVR', 'Organizzazione della formazione'],
          correctIndex: 2,
          explanation: 'La valutazione dei rischi e la designazione del RSPP sono i due obblighi non delegabili del DL (art. 17).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rspp1_boss3',
          question: 'L\'aggiornamento RSPP-DL per rischio alto è di:',
          options: ['6 ore ogni 5 anni', '10 ore ogni 5 anni', '14 ore ogni 5 anni', '8 ore ogni 3 anni'],
          correctIndex: 2,
          explanation: 'L\'aggiornamento per DL-RSPP a rischio alto è di 14 ore con periodicità quinquennale.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rspp1_boss4',
          question: 'Il ciclo PDCA applicato alla sicurezza prevede come prima fase:',
          options: ['Do (Fare)', 'Check (Verificare)', 'Plan (Pianificare)', 'Act (Agire)'],
          correctIndex: 2,
          explanation: 'Il ciclo PDCA inizia con Plan: pianificazione delle attività di prevenzione basata sulla valutazione dei rischi.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rspp1_boss5',
          question: 'Un DL-RSPP che non aggiorna il DVR dopo un infortunio grave rischia:',
          options: ['Nessuna sanzione', 'Solo una diffida', 'Arresto da 2 a 4 mesi o ammenda', 'Solo sanzione amministrativa'],
          correctIndex: 2,
          explanation: 'La mancata revisione del DVR a seguito di infortuni significativi è sanzionata penalmente con arresto o ammenda.',
          xpReward: 40,
          difficulty: 'hard',
        },
        {
          id: 'rspp1_boss6',
          question: 'La "near miss" è:',
          options: ['Un infortunio lieve', 'Un evento che avrebbe potuto causare un infortunio', 'Una malattia professionale', 'Un guasto meccanico'],
          correctIndex: 1,
          explanation: 'Il "near miss" (quasi-infortunio) è un evento che, per circostanze fortuite, non ha causato danni ma che avrebbe potuto provocare un infortunio.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};

export const rsppDatoreContents: ModuleContent[] = [
  moduloRSPP1Content,
];
