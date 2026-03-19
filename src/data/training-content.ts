// Formazione Generale Lavoratori - Content Data
// 4 Moduli conformi all'Accordo Stato-Regioni

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TrainingSection {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'interactive' | 'boss_test' | 'scenario_3d' | 'point_and_click';
  content?: string;
  npcDialogue?: { speaker: string; role: string; text: string }[];
  questions?: QuizQuestion[];
  minTimeSeconds: number; // Anti-cheat: minimum time before proceeding
  xpReward: number;
}

export interface ModuleContent {
  moduleId: string;
  sections: TrainingSection[];
}

// ============================
// MODULO 1: GIURIDICO E NORMATIVO
// ============================
export const modulo1Content: ModuleContent = {
  moduleId: 'giuridico_normativo',
  sections: [
    {
      id: 'gn_intro',
      title: 'La Sicurezza sul Lavoro in Italia',
      type: 'lesson',
      content: `Il Decreto Legislativo 81/2008 (Testo Unico sulla Sicurezza) è la principale norma italiana che regola la salute e la sicurezza nei luoghi di lavoro. Questo decreto ha unificato e semplificato le precedenti normative, creando un quadro organico di tutela per tutti i lavoratori.

**Punti chiave:**
- Si applica a TUTTI i settori di attività, privati e pubblici
- Coinvolge TUTTI i lavoratori, indipendentemente dal contratto
- Definisce obblighi precisi per datori di lavoro, dirigenti, preposti e lavoratori
- Prevede sanzioni penali e amministrative per le violazioni

L'Accordo Stato-Regioni del 2025 ha introdotto la **gamification** come metodologia didattica riconosciuta per la formazione obbligatoria.`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'gn_quiz_intro',
      title: 'Verifica: Quadro Normativo',
      type: 'quiz',
      questions: [
        {
          id: 'q1_1',
          question: 'Qual è il principale decreto legislativo che regola la sicurezza sul lavoro in Italia?',
          options: ['D.Lgs 626/94', 'D.Lgs 81/2008', 'D.Lgs 196/2003', 'D.Lgs 231/2001'],
          correctIndex: 1,
          explanation: 'Il D.Lgs 81/2008 (Testo Unico sulla Sicurezza) è la norma principale. Il D.Lgs 626/94 è stato abrogato e sostituito dal TU.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'q1_2',
          question: 'A chi si applica il D.Lgs 81/2008?',
          options: ['Solo alle grandi aziende', 'Solo al settore edile', 'A tutti i settori di attività, privati e pubblici', 'Solo alle aziende con più di 15 dipendenti'],
          correctIndex: 2,
          explanation: 'Il Testo Unico si applica a TUTTI i settori di attività, sia privati che pubblici, e a tutti i lavoratori indipendentemente dalla tipologia contrattuale.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'gn_rischio_danno',
      title: 'Concetti di Rischio, Pericolo e Danno',
      type: 'lesson',
      content: `Tre concetti fondamentali da non confondere:

🔴 **PERICOLO** (Hazard): Proprietà intrinseca di un agente, una situazione o un'azione che può causare un danno. È una caratteristica oggettiva.
_Esempio: Un cavo elettrico scoperto È un pericolo._

🟡 **RISCHIO** (Risk): Probabilità che il pericolo si trasformi in danno, in determinate condizioni di esposizione. Si calcola con la formula:
**R = P × D** (Rischio = Probabilità × Danno/Magnitudo)

🟠 **DANNO**: La conseguenza negativa che deriva dall'esposizione al pericolo. Può essere:
- **Infortunio**: evento traumatico improvviso (caduta, taglio, ustione)
- **Malattia professionale**: patologia che si sviluppa nel tempo (ipoacusia, tunnel carpale)

⚖️ **La Valutazione dei Rischi** è l'obbligo NON delegabile del Datore di Lavoro.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'gn_interactive_rischio',
      title: '🎮 Bilancia il Rischio',
      type: 'interactive',
      content: 'Associa ogni scenario alla corretta combinazione di Probabilità e Magnitudo per calcolare il livello di rischio.',
      questions: [
        {
          id: 'int_1',
          question: 'Un operaio lavora su un ponteggio a 10 metri senza imbracatura. Qual è il livello di rischio?',
          options: ['Basso (P=1, D=1)', 'Medio (P=2, D=2)', 'Alto (P=3, D=3)', 'Altissimo (P=4, D=4)'],
          correctIndex: 3,
          explanation: 'La probabilità di caduta senza DPI è altissima (P=4) e il danno da caduta a 10m è gravissimo/mortale (D=4). R = 4×4 = 16 → Rischio ALTISSIMO.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'int_2',
          question: 'Un impiegato usa il videoterminale per 6 ore senza pause. Qual è il livello di rischio?',
          options: ['Basso (P=1, D=1)', 'Medio (P=2, D=2)', 'Alto (P=3, D=3)', 'Altissimo (P=4, D=4)'],
          correctIndex: 1,
          explanation: 'La probabilità di problemi visivi/posturali è media (P=2) e il danno è moderato e reversibile (D=2). R = 2×2 = 4 → Rischio MEDIO.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'int_3',
          question: 'Un magazziniere solleva carichi pesanti senza formazione sulla movimentazione manuale. Qual è il livello di rischio?',
          options: ['Basso (P=1, D=1)', 'Medio (P=2, D=2)', 'Alto (P=3, D=3)', 'Altissimo (P=4, D=4)'],
          correctIndex: 2,
          explanation: 'La probabilità di infortunio è alta (P=3) e il danno può essere grave (ernia, lesioni alla schiena, D=3). R = 3×3 = 9 → Rischio ALTO.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'gn_figure',
      title: 'Le Figure della Prevenzione',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Marco Rossi', role: 'Datore di Lavoro', text: 'Sono il responsabile ultimo della sicurezza in azienda. Ho due obblighi che NON posso delegare a nessuno: la valutazione dei rischi e la nomina del RSPP.' },
        { speaker: 'Ing. Laura Bianchi', role: 'RSPP', text: 'Sono il Responsabile del Servizio di Prevenzione e Protezione. Coordino le misure di sicurezza, formo i lavoratori e aggiorno il DVR. Sono nominata dal Datore di Lavoro.' },
        { speaker: 'Giuseppe Verdi', role: 'RLS', text: 'Sono il Rappresentante dei Lavoratori per la Sicurezza. Vengo ELETTO dai lavoratori per rappresentare i loro interessi in materia di sicurezza. Ho diritto di accesso al DVR e ai luoghi di lavoro.' },
        { speaker: 'Dr.ssa Anna Neri', role: 'Medico Competente', text: 'Mi occupo della sorveglianza sanitaria. Visito i lavoratori esposti a rischi specifici, esprimo giudizi di idoneità e collaboro alla valutazione dei rischi.' },
        { speaker: 'Carlo Russo', role: 'Preposto', text: 'Sono il "caposquadra". Sovrintendo all\'attività lavorativa e vigilo sul rispetto delle norme di sicurezza. Devo intervenire se vedo comportamenti pericolosi.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'gn_quiz_figure',
      title: 'Verifica: Figure della Prevenzione',
      type: 'quiz',
      questions: [
        {
          id: 'q2_1',
          question: 'Chi nomina il RSPP?',
          options: ['I lavoratori', 'Il Datore di Lavoro', 'Il Medico Competente', 'L\'Ispettorato del Lavoro'],
          correctIndex: 1,
          explanation: 'Il RSPP è nominato dal Datore di Lavoro. È uno dei suoi obblighi non delegabili (art. 17 D.Lgs 81/08).',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'q2_2',
          question: 'Come viene scelto il RLS (Rappresentante dei Lavoratori per la Sicurezza)?',
          options: ['Nominato dal Datore di Lavoro', 'Eletto o designato dai lavoratori', 'Nominato dall\'INAIL', 'Nominato dal Prefetto'],
          correctIndex: 1,
          explanation: 'Il RLS è ELETTO o designato dai lavoratori stessi (art. 47 D.Lgs 81/08). Rappresenta i loro interessi in materia di sicurezza.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'q2_3',
          question: 'Qual è l\'obbligo principale del Preposto?',
          options: ['Redigere il DVR', 'Sovrintendere e vigilare sull\'osservanza delle norme di sicurezza', 'Effettuare le visite mediche', 'Acquistare i DPI'],
          correctIndex: 1,
          explanation: 'Il Preposto sovrintende all\'attività lavorativa e vigila sull\'osservanza delle norme e delle disposizioni aziendali in materia di sicurezza (art. 19).',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'q2_4',
          question: 'Quale di questi è un obbligo NON delegabile del Datore di Lavoro?',
          options: ['Fornire i DPI', 'Nominare il Medico Competente', 'Valutazione dei rischi e redazione del DVR', 'Organizzare le prove di evacuazione'],
          correctIndex: 2,
          explanation: 'La valutazione dei rischi e la nomina del RSPP sono i due obblighi non delegabili del Datore di Lavoro (art. 17 D.Lgs 81/08).',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 15,
    },
    {
      id: 'gn_diritti_doveri',
      title: 'Diritti e Doveri dei Lavoratori',
      type: 'lesson',
      content: `**DIRITTI del Lavoratore:**
✅ Ricevere informazione e formazione sulla sicurezza
✅ Ricevere i DPI adeguati gratuitamente
✅ Essere sottoposto a sorveglianza sanitaria
✅ Eleggere il proprio RLS
✅ Allontanarsi dal posto di lavoro in caso di pericolo grave e immediato
✅ Essere consultato sulla valutazione dei rischi

**DOVERI del Lavoratore (art. 20):**
⚠️ Prendersi cura della propria salute e sicurezza E di quella delle altre persone
⚠️ Utilizzare correttamente attrezzature, sostanze, DPI
⚠️ Segnalare immediatamente condizioni di pericolo
⚠️ Non rimuovere o modificare i dispositivi di sicurezza
⚠️ Partecipare alla formazione obbligatoria
⚠️ Sottoporsi ai controlli sanitari previsti

**ATTENZIONE:** Il lavoratore che viola i propri obblighi è soggetto a sanzioni (arresto fino a 1 mese o ammenda).`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'gn_sanzioni',
      title: '⏱️ L\'Ispettore è Arrivato!',
      type: 'quiz',
      questions: [
        {
          id: 'q3_1',
          question: '🚨 L\'ispettore chiede: Il lavoratore può rifiutarsi di indossare i DPI forniti?',
          options: ['Sì, è una scelta personale', 'No, è un obbligo di legge', 'Solo se il preposto è d\'accordo', 'Solo se non sono comodi'],
          correctIndex: 1,
          explanation: 'L\'utilizzo dei DPI è un OBBLIGO del lavoratore (art. 20 D.Lgs 81/08). Il rifiuto può comportare sanzioni disciplinari e penali.',
          xpReward: 20,
          difficulty: 'easy',
        },
        {
          id: 'q3_2',
          question: '🚨 L\'ispettore chiede: Chi è l\'organo di vigilanza principale in materia di sicurezza sul lavoro?',
          options: ['Carabinieri', 'ASL / ATS (Azienda Sanitaria Locale)', 'Polizia Municipale', 'Guardia di Finanza'],
          correctIndex: 1,
          explanation: 'La ASL (o ATS in alcune regioni) è l\'organo di vigilanza principale. Anche l\'Ispettorato del Lavoro ha competenze specifiche.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'q3_3',
          question: '🚨 L\'ispettore chiede: Qual è la sanzione massima per il Datore di Lavoro che non effettua la valutazione dei rischi?',
          options: ['Multa di 500€', 'Nessuna sanzione', 'Arresto da 3 a 6 mesi o ammenda da 3.071 a 7.862€', 'Solo una diffida'],
          correctIndex: 2,
          explanation: 'La mancata valutazione dei rischi è una delle violazioni più gravi, punita con arresto da 3 a 6 mesi o ammenda da 3.071 a 7.862€ (art. 55).',
          xpReward: 25,
          difficulty: 'hard',
        },
        {
          id: 'q3_4',
          question: '🚨 L\'ispettore chiede: Un lavoratore nota un pericolo. Cosa deve fare?',
          options: ['Risolvere il problema da solo', 'Segnalare immediatamente al datore di lavoro/preposto', 'Aspettare la prossima riunione di sicurezza', 'Chiamare i Vigili del Fuoco'],
          correctIndex: 1,
          explanation: 'Il lavoratore ha l\'obbligo di segnalare immediatamente le condizioni di pericolo al datore di lavoro, al dirigente o al preposto (art. 20).',
          xpReward: 20,
          difficulty: 'easy',
        },
        {
          id: 'q3_5',
          question: '🚨 L\'ispettore chiede: Ogni quanto deve essere aggiornata la formazione generale dei lavoratori?',
          options: ['Ogni anno', 'Ogni 3 anni', 'Ogni 5 anni', 'Non necessita di aggiornamento'],
          correctIndex: 2,
          explanation: 'L\'aggiornamento della formazione dei lavoratori è previsto con periodicità quinquennale (ogni 5 anni), con durata minima di 6 ore.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'gn_point_click',
      title: '🔍 Caccia ai Rischi: L\'Ufficio',
      type: 'point_and_click',
      content: 'Trova i rischi nascosti nell\'ufficio cliccando sulle aree sospette.',
      minTimeSeconds: 5,
      xpReward: 30,
    },
    {
      id: 'gn_boss_test',
      title: '🏆 Test Finale - Modulo Giuridico',
      type: 'boss_test',
      questions: [
        {
          id: 'boss_1',
          question: 'Il D.Lgs 81/2008 è noto come:',
          options: ['Statuto dei Lavoratori', 'Testo Unico sulla Sicurezza', 'Codice della Prevenzione', 'Legge Quadro sulla Salute'],
          correctIndex: 1,
          explanation: 'Il D.Lgs 81/2008 è comunemente chiamato "Testo Unico sulla Sicurezza sul Lavoro" (TUS o TUSL).',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'boss_2',
          question: 'La formula per calcolare il rischio è:',
          options: ['R = P + D', 'R = P × D', 'R = P / D', 'R = P - D'],
          correctIndex: 1,
          explanation: 'Rischio = Probabilità × Danno (Magnitudo). Questa è la formula base della valutazione dei rischi.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'boss_3',
          question: 'Chi redige il DVR (Documento di Valutazione dei Rischi)?',
          options: ['Il RSPP da solo', 'Il Datore di Lavoro in collaborazione con RSPP e Medico Competente', 'Il RLS', 'L\'Ispettorato del Lavoro'],
          correctIndex: 1,
          explanation: 'Il DVR è redatto dal Datore di Lavoro (obbligo non delegabile) in collaborazione con il RSPP, il Medico Competente e previa consultazione del RLS.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'boss_4',
          question: 'Quale tra queste NON è una figura della prevenzione aziendale?',
          options: ['RSPP', 'RLS', 'Ispettore ASL', 'Medico Competente'],
          correctIndex: 2,
          explanation: 'L\'Ispettore ASL è un organo di vigilanza ESTERNO all\'azienda, non una figura della prevenzione aziendale interna.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'boss_5',
          question: 'Il lavoratore che rimuove i dispositivi di sicurezza dalle macchine è soggetto a:',
          options: ['Nessuna sanzione', 'Solo richiamo verbale', 'Sanzioni penali (arresto o ammenda)', 'Solo formazione aggiuntiva'],
          correctIndex: 2,
          explanation: 'L\'art. 59 del D.Lgs 81/08 prevede sanzioni penali (arresto fino a 1 mese o ammenda da 245,70 a 737,10€) per i lavoratori che violano i propri obblighi.',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'boss_6',
          question: 'La differenza tra "pericolo" e "rischio" è:',
          options: [
            'Sono sinonimi',
            'Il pericolo è la proprietà intrinseca, il rischio è la probabilità che causi danno',
            'Il rischio è più grave del pericolo',
            'Il pericolo riguarda solo le macchine'
          ],
          correctIndex: 1,
          explanation: 'Il PERICOLO è una proprietà intrinseca (es. un cavo scoperto). Il RISCHIO è la probabilità che quel pericolo causi effettivamente un danno.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'boss_7',
          question: 'In caso di pericolo grave e immediato, il lavoratore:',
          options: [
            'Deve restare al proprio posto',
            'Deve chiedere il permesso al datore di lavoro per allontanarsi',
            'Può allontanarsi dal posto di lavoro senza subire conseguenze negative',
            'Deve chiamare i Vigili del Fuoco e aspettare'
          ],
          correctIndex: 2,
          explanation: 'L\'art. 44 del D.Lgs 81/08 prevede che il lavoratore possa allontanarsi dal posto di lavoro in caso di pericolo grave e immediato, senza subire pregiudizio.',
          xpReward: 40,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};

// ============================
// MODULO 2: GESTIONE ED ORGANIZZAZIONE
// ============================
export const modulo2Content: ModuleContent = {
  moduleId: 'gestione_organizzazione',
  sections: [
    {
      id: 'go_organigramma',
      title: 'L\'Organigramma della Sicurezza',
      type: 'lesson',
      content: `Ogni azienda deve avere un'organizzazione chiara per la gestione della sicurezza. L'organigramma della sicurezza definisce chi fa cosa:

📊 **Struttura Gerarchica:**
1. **Datore di Lavoro** → Responsabilità ultima
2. **Dirigente** → Attua le direttive del DL
3. **Preposto** → Vigila sull'esecuzione
4. **Lavoratore** → Esegue in sicurezza

📋 **Servizio di Prevenzione e Protezione (SPP):**
- RSPP (Responsabile) - obbligatorio
- ASPP (Addetti) - in supporto al RSPP
- Medico Competente - per la sorveglianza sanitaria

🔔 **Figure Emergenza:**
- Addetti Primo Soccorso
- Addetti Antincendio ed Evacuazione

💡 La **Riunione Periodica** (obbligatoria per aziende >15 dipendenti) riunisce DL, RSPP, MC e RLS almeno una volta l'anno.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'go_rpg_dialoghi',
      title: '🎮 Dialogo con le Figure Aziendali',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Il Preposto', role: 'Preposto', text: 'Un operaio sta usando il trapano senza occhiali protettivi. Come Preposto, DEVO intervenire immediatamente e segnalare al datore di lavoro. Non posso far finta di niente!' },
        { speaker: 'L\'Addetto Antincendio', role: 'Addetto Emergenze', text: 'Suona l\'allarme! Il mio compito è guidare l\'evacuazione verso il punto di raccolta. Devo verificare che tutti abbiano lasciato il reparto e segnalare eventuali dispersi al coordinatore.' },
        { speaker: 'L\'Addetto Primo Soccorso', role: 'Addetto PS', text: 'Un collega si è tagliato con la taglierina. Per prima cosa valuto la gravità: se il taglio è profondo chiamo il 118, altrimenti uso il kit di primo soccorso. MAI somministrare farmaci!' },
      ],
      questions: [
        {
          id: 'go_q1',
          question: 'Il Preposto nota un lavoratore senza casco in cantiere. Cosa deve fare?',
          options: ['Ignorare, non è il suo compito', 'Intervenire immediatamente e segnalare', 'Aspettare la fine del turno', 'Chiamare la polizia'],
          correctIndex: 1,
          explanation: 'Il Preposto ha l\'obbligo di intervenire immediatamente quando rileva comportamenti non conformi e di segnalare la situazione al datore di lavoro.',
          xpReward: 20,
          difficulty: 'easy',
        },
        {
          id: 'go_q2',
          question: 'Durante un\'evacuazione, l\'addetto antincendio deve:',
          options: ['Spegnere l\'incendio da solo', 'Guidare i colleghi al punto di raccolta e verificare le presenze', 'Tornare a prendere i propri effetti personali', 'Restare nel proprio ufficio'],
          correctIndex: 1,
          explanation: 'L\'addetto antincendio deve guidare l\'evacuazione ordinata, accompagnare i colleghi al punto di raccolta e verificare che tutti siano usciti.',
          xpReward: 20,
          difficulty: 'easy',
        },
        {
          id: 'go_q3',
          question: 'L\'Addetto al Primo Soccorso può somministrare farmaci?',
          options: ['Sì, qualsiasi farmaco', 'Sì, solo antidolorifici', 'No, mai', 'Solo con il permesso del dirigente'],
          correctIndex: 2,
          explanation: 'L\'Addetto al Primo Soccorso NON è autorizzato a somministrare farmaci. Può solo prestare le prime cure e attivare il 118 se necessario.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 25,
    },
    {
      id: 'go_comunicazione',
      title: 'Comunicazione e Segnalazione',
      type: 'lesson',
      content: `La comunicazione efficace salva vite. Ecco i canali e le procedure:

📢 **Segnaletica di Sicurezza** (D.Lgs 81/08, Titolo V):
- 🔴 **Rosso/Cerchio**: DIVIETO (es. vietato fumare)
- 🟡 **Giallo/Triangolo**: AVVERTIMENTO (es. pericolo elettrico)  
- 🔵 **Blu/Cerchio**: OBBLIGO (es. indossare il casco)
- 🟢 **Verde/Rettangolo**: SALVATAGGIO (es. uscita di emergenza)

📞 **Numeri di Emergenza:**
- **112**: Numero Unico Europeo di Emergenza
- **115**: Vigili del Fuoco
- **118**: Emergenza Sanitaria

📝 **Near Miss (Quasi Incidente):**
Un near miss è un evento che avrebbe potuto causare un infortunio ma non l'ha fatto. Segnalare i near miss è FONDAMENTALE per prevenire incidenti futuri.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'go_quiz_comunicazione',
      title: 'Verifica: Segnaletica e Comunicazione',
      type: 'quiz',
      questions: [
        {
          id: 'go_q4',
          question: 'Un cartello triangolare giallo con bordo nero indica:',
          options: ['Divieto', 'Obbligo', 'Avvertimento/Pericolo', 'Via di fuga'],
          correctIndex: 2,
          explanation: 'I cartelli triangolari gialli con bordo nero sono segnali di AVVERTIMENTO che indicano un pericolo (es. pericolo elettrico, sostanze infiammabili).',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'go_q5',
          question: 'Cos\'è un "near miss"?',
          options: ['Un infortunio lieve', 'Un evento che avrebbe potuto causare un danno ma non l\'ha fatto', 'Un guasto alla macchina', 'Una pausa non autorizzata'],
          correctIndex: 1,
          explanation: 'Un near miss (quasi incidente) è un evento che, pur non avendo causato danni, avrebbe potuto farlo. La segnalazione è cruciale per la prevenzione.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'go_tribunale',
      title: '⚖️ Scenario Tribunale',
      type: 'interactive',
      content: `**CASO:** Un operaio è caduto da una scala mentre dipingeva una parete. Non indossava l'imbracatura. La scala era vecchia e traballante. Il preposto era in pausa caffè. L'operaio si è fratturato un braccio.

Analizza il caso e determina le responsabilità:`,
      questions: [
        {
          id: 'trib_1',
          question: 'Chi ha la responsabilità PRINCIPALE in questo incidente?',
          options: ['Solo il lavoratore', 'Solo il preposto', 'Il datore di lavoro, per non aver fornito attrezzature adeguate', 'Nessuno, è stata sfortuna'],
          correctIndex: 2,
          explanation: 'Il Datore di Lavoro ha l\'obbligo di fornire attrezzature adeguate e sicure (art. 18). Una scala vecchia e traballante è un\'attrezzatura non idonea.',
          xpReward: 30,
          difficulty: 'hard',
        },
        {
          id: 'trib_2',
          question: 'Il Preposto ha responsabilità in questo caso?',
          options: ['No, era in pausa', 'Sì, avrebbe dovuto verificare l\'uso dei DPI prima di assentarsi', 'Solo se il DL gli ha dato l\'incarico', 'No, non è compito suo'],
          correctIndex: 1,
          explanation: 'Il Preposto ha l\'obbligo di vigilare sull\'uso dei DPI e sulle procedure di sicurezza. Avrebbe dovuto verificare la situazione prima di allontanarsi.',
          xpReward: 30,
          difficulty: 'hard',
        },
        {
          id: 'trib_3',
          question: 'Il lavoratore ha delle responsabilità?',
          options: ['No, è solo una vittima', 'Sì, avrebbe dovuto rifiutarsi di lavorare con attrezzature inadeguate', 'No, il lavoratore non ha mai responsabilità', 'Solo se ha firmato un documento'],
          correctIndex: 1,
          explanation: 'Il lavoratore ha il diritto/dovere di segnalare condizioni pericolose e di non utilizzare attrezzature inadeguate (art. 20). Ha anche il dovere di usare i DPI.',
          xpReward: 30,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'go_boss_test',
      title: '🏆 Test Finale - Gestione e Organizzazione',
      type: 'boss_test',
      questions: [
        {
          id: 'go_boss_1',
          question: 'La riunione periodica sulla sicurezza è obbligatoria per:',
          options: ['Tutte le aziende', 'Aziende con più di 15 lavoratori', 'Solo aziende edili', 'Solo aziende chimiche'],
          correctIndex: 1,
          explanation: 'La riunione periodica è obbligatoria per aziende con più di 15 lavoratori (art. 35). Nelle aziende più piccole il RLS può richiederla.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'go_boss_2',
          question: 'Il cartello rotondo blu indica:',
          options: ['Divieto', 'Pericolo', 'Obbligo', 'Informazione'],
          correctIndex: 2,
          explanation: 'I cartelli rotondi blu indicano un OBBLIGO (es. obbligo di indossare i DPI). Rosso = divieto, Giallo = avvertimento, Verde = salvataggio.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'go_boss_3',
          question: 'Chi partecipa alla riunione periodica?',
          options: ['Solo il DL e il RSPP', 'DL, RSPP, MC e RLS', 'Tutti i lavoratori', 'Solo il dirigente e il preposto'],
          correctIndex: 1,
          explanation: 'Alla riunione periodica partecipano: Datore di Lavoro (o suo rappresentante), RSPP, Medico Competente e RLS (art. 35).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'go_boss_4',
          question: 'Un ASPP (Addetto al SPP) risponde a:',
          options: ['Direttamente al DL', 'Al RSPP', 'Al RLS', 'Al Medico Competente'],
          correctIndex: 1,
          explanation: 'L\'ASPP (Addetto al Servizio di Prevenzione e Protezione) opera sotto la direzione del RSPP, supportandolo nelle attività di prevenzione.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'go_boss_5',
          question: 'Un near miss deve essere:',
          options: ['Ignorato se non ci sono stati danni', 'Segnalato e registrato per analisi', 'Comunicato solo al RLS', 'Denunciato all\'INAIL'],
          correctIndex: 1,
          explanation: 'I near miss devono essere segnalati e registrati per analisi. Sono indicatori preziosi per prevenire futuri incidenti reali.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 75,
      xpReward: 50,
    },
  ],
};

// ============================
// MODULO 3: VALUTAZIONE DEI RISCHI (3D)
// ============================
export const modulo3Content: ModuleContent = {
  moduleId: 'valutazione_rischi',
  sections: [
    {
      id: 'vr_intro',
      title: 'Il Processo di Valutazione dei Rischi',
      type: 'lesson',
      content: `La Valutazione dei Rischi è il cuore della prevenzione. Si articola in 5 fasi:

**1️⃣ IDENTIFICAZIONE dei Pericoli**
Riconoscere tutte le fonti potenziali di danno presenti nell'ambiente di lavoro.

**2️⃣ VALUTAZIONE dei Rischi**
Per ogni pericolo, stimare: R = P × D
- P (Probabilità): da 1 (improbabile) a 4 (molto probabile)
- D (Danno/Magnitudo): da 1 (lieve) a 4 (gravissimo)

**3️⃣ INDIVIDUAZIONE delle Misure**
Seguire la gerarchia delle misure di prevenzione:
1. Eliminare il pericolo alla fonte
2. Sostituire con qualcosa di meno pericoloso
3. Misure tecniche (barriere, aspirazione)
4. Misure organizzative (procedure, turnazione)
5. DPI come ULTIMA risorsa

**4️⃣ ATTUAZIONE delle Misure**
Mettere in pratica le azioni previste con tempistiche e responsabili.

**5️⃣ MONITORAGGIO e REVISIONE**
Verificare l'efficacia e aggiornare periodicamente il DVR.`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'vr_quiz_processo',
      title: 'Verifica: Processo di Valutazione',
      type: 'quiz',
      questions: [
        {
          id: 'vr_q1',
          question: 'Nella gerarchia delle misure di prevenzione, i DPI sono:',
          options: ['La prima scelta', 'L\'ultima risorsa', 'Mai necessari', 'Solo per il settore edile'],
          correctIndex: 1,
          explanation: 'I DPI sono l\'ULTIMA risorsa nella gerarchia delle misure. Prima si devono eliminare/ridurre i pericoli con misure tecniche e organizzative.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'vr_q2',
          question: 'Un rischio con R=16 (P=4, D=4) è classificato come:',
          options: ['Basso', 'Medio', 'Alto', 'Molto alto / Inaccettabile'],
          correctIndex: 3,
          explanation: 'Con R=16 il rischio è al massimo livello (inaccettabile). Richiede intervento immediato, eventualmente la sospensione dell\'attività.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'vr_scenario_3d',
      title: '🎮 Ispezione 3D - Trova i Rischi!',
      type: 'scenario_3d',
      content: 'Esplora l\'ambiente 3D e identifica tutti i pericoli nascosti. Clicca sulle situazioni anomale e seleziona l\'azione corretta.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'vr_boss_test',
      title: '🏆 Test Finale - Valutazione Rischi',
      type: 'boss_test',
      questions: [
        {
          id: 'vr_boss_1',
          question: 'Il DVR deve essere:',
          options: ['Solo cartaceo', 'Con data certa', 'Opzionale per le piccole aziende', 'Redatto dal RLS'],
          correctIndex: 1,
          explanation: 'Il DVR deve avere data certa e deve essere custodito presso l\'unità produttiva (art. 28 D.Lgs 81/08).',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'vr_boss_2',
          question: 'Quale misura ha PRIORITÀ nella prevenzione?',
          options: ['Fornire DPI', 'Eliminare il pericolo alla fonte', 'Formare i lavoratori', 'Mettere cartelli di avvertimento'],
          correctIndex: 1,
          explanation: 'Nella gerarchia delle misure, l\'eliminazione del pericolo alla fonte ha sempre la priorità massima.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'vr_boss_3',
          question: 'Il DVR deve essere aggiornato quando:',
          options: ['Solo ogni 5 anni', 'Mai, è definitivo', 'In occasione di modifiche significative al processo produttivo o dopo infortuni gravi', 'Solo su richiesta dell\'ASL'],
          correctIndex: 2,
          explanation: 'Il DVR va aggiornato in caso di modifiche al processo produttivo, infortuni significativi, risultati della sorveglianza sanitaria (art. 29).',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'vr_boss_4',
          question: 'Un "rischio residuo" è:',
          options: ['Un rischio che non esiste', 'Il rischio che rimane dopo l\'applicazione delle misure di prevenzione', 'Un rischio solo per i nuovi assunti', 'Un rischio che riguarda solo i DPI'],
          correctIndex: 1,
          explanation: 'Il rischio residuo è quello che persiste nonostante l\'applicazione di tutte le misure di prevenzione e protezione ragionevolmente praticabili.',
          xpReward: 35,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 75,
      xpReward: 50,
    },
  ],
};

// ============================
// MODULO 4: DPI E PROTEZIONE
// ============================
export const modulo4Content: ModuleContent = {
  moduleId: 'dpi_protezione',
  sections: [
    {
      id: 'dpi_intro',
      title: 'I Dispositivi di Protezione Individuale',
      type: 'lesson',
      content: `I DPI sono attrezzature destinate a essere indossate dal lavoratore per proteggerlo contro rischi che non possono essere eliminati con altre misure.

**📋 Le 3 Categorie di DPI:**

**Categoria I** - Rischi minimi
Protezione da: rischi meccanici superficiali, agenti atmosferici non estremi, piccoli urti
_Esempi: guanti da giardinaggio, occhiali da sole per lavoro all'aperto_

**Categoria II** - Rischi significativi
Protezione da: rischi che non rientrano nella I né nella III categoria
_Esempi: caschi protettivi, occhiali di protezione, guanti antitaglio, scarpe antinfortunistiche_

**Categoria III** - Rischi gravi o mortali
Protezione da: rischi che possono causare morte o danni alla salute irreversibili
_Esempi: imbracature anticaduta, respiratori, tute NBC, DPI per lavori in tensione_

⚠️ **Obblighi del Datore di Lavoro:**
- Fornire DPI adeguati e gratuiti
- Assicurare la formazione sull'uso
- Provvedere alla manutenzione e sostituzione

⚠️ **Obblighi del Lavoratore:**
- Utilizzare i DPI forniti
- Avere cura dei DPI
- Segnalare difetti o deterioramento`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'dpi_interattivo',
      title: '🎮 Scegli il DPI Giusto!',
      type: 'interactive',
      content: 'Per ogni situazione lavorativa, seleziona il DPI corretto che il lavoratore dovrebbe indossare.',
      questions: [
        {
          id: 'dpi_q1',
          question: '👷 Un operaio deve lavorare su un\'impalcatura a 8 metri di altezza. Quale DPI è INDISPENSABILE?',
          options: ['Guanti antitaglio', 'Imbracatura anticaduta con cordino', 'Occhiali protettivi', 'Cuffie antirumore'],
          correctIndex: 1,
          explanation: 'Per lavori in quota (oltre 2 metri) l\'imbracatura anticaduta è il DPI fondamentale. È un DPI di Categoria III (rischio mortale).',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'dpi_q2',
          question: '🔬 Un tecnico di laboratorio maneggia acido cloridrico concentrato. Quali DPI servono?',
          options: ['Solo guanti in lattice', 'Guanti chimici, occhiali a mascherina, camice e cappa aspirante', 'Casco e scarpe antinfortunistiche', 'Solo mascherina FFP2'],
          correctIndex: 1,
          explanation: 'L\'acido cloridrico concentrato richiede protezione completa: guanti chimici resistenti, occhiali a mascherina, camice protettivo e lavoro sotto cappa.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'dpi_q3',
          question: '🏗️ In un cantiere edile con demolizioni in corso, quale combinazione di DPI è obbligatoria?',
          options: [
            'Solo il casco',
            'Casco, scarpe antinfortunistiche, guanti e occhiali',
            'Solo le scarpe antinfortunistiche',
            'Tuta e stivali'
          ],
          correctIndex: 1,
          explanation: 'In cantiere con demolizioni servono: casco (caduta oggetti), scarpe S3 (perforazioni), guanti (tagli), occhiali (schegge). Eventualmente anche cuffie antirumore.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'dpi_q4',
          question: '🔊 Un lavoratore è esposto a rumore di 90 dB(A) per 8 ore. Quale DPI è obbligatorio?',
          options: ['Nessuno, 90 dB è sicuro', 'Cuffie o inserti auricolari', 'Mascherina', 'Guanti antivibranti'],
          correctIndex: 1,
          explanation: 'Oltre gli 85 dB(A) l\'uso dei DPI uditivi è obbligatorio. A 90 dB(A) per 8 ore il rischio di ipoacusia è concreto.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'dpi_manutenzione',
      title: 'Manutenzione e Controllo dei DPI',
      type: 'lesson',
      content: `Un DPI difettoso è peggio di nessun DPI: dà una falsa sensazione di sicurezza!

🔧 **Controlli da effettuare PRIMA dell'uso:**
- Verificare l'integrità (nessuna crepa, taglio, usura)
- Controllare la data di scadenza (es. filtri maschere, caschi)
- Verificare la corretta taglia/misura
- Assicurarsi che sia il DPI adatto al rischio specifico

📅 **Scadenze importanti:**
- **Caschi**: sostituire dopo un urto significativo o secondo le indicazioni del fabbricante (generalmente 3-5 anni)
- **Imbracature**: revisione annuale da personale competente
- **Filtri respiratori**: secondo le indicazioni del fabbricante e l'ambiente di utilizzo
- **Guanti chimici**: controllare prima di ogni utilizzo (test di gonfiaggio)

🚫 **Cosa NON fare con i DPI:**
- Non modificarli o ripararli da soli
- Non prestare DPI personali (calzature, otoprotettori modellati)
- Non utilizzarli oltre la data di scadenza
- Non conservarli in ambienti inadeguati (calore, umidità, solventi)`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'dpi_boss_test',
      title: '🏆 Test Finale - DPI e Protezione',
      type: 'boss_test',
      questions: [
        {
          id: 'dpi_boss_1',
          question: 'I DPI di Categoria III proteggono da:',
          options: ['Rischi minimi', 'Rischi significativi', 'Rischi gravi o mortali', 'Rischi estetici'],
          correctIndex: 2,
          explanation: 'I DPI di Categoria III proteggono da rischi che possono causare morte o lesioni irreversibili (es. imbracature anticaduta, autorespiratori).',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'dpi_boss_2',
          question: 'Chi deve fornire i DPI ai lavoratori?',
          options: ['I lavoratori li acquistano da soli', 'Il Datore di Lavoro, gratuitamente', 'Il RLS', 'L\'INAIL'],
          correctIndex: 1,
          explanation: 'È obbligo del Datore di Lavoro fornire i DPI gratuitamente, adeguati ai rischi e conformi alle norme CE/UE (art. 77).',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'dpi_boss_3',
          question: 'Un casco protettivo dopo un urto significativo deve essere:',
          options: ['Controllato visivamente e riutilizzato', 'Sostituito', 'Riparato con nastro adesivo', 'Utilizzato come casco di riserva'],
          correctIndex: 1,
          explanation: 'Dopo un urto significativo il casco potrebbe aver subito micro-fratture invisibili che ne compromettono la capacità protettiva. Va SEMPRE sostituito.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'dpi_boss_4',
          question: 'La marcatura CE sui DPI indica che:',
          options: ['È un prodotto di buona qualità', 'È conforme ai requisiti essenziali di sicurezza delle direttive europee', 'È prodotto in Europa', 'È approvato dal RSPP'],
          correctIndex: 1,
          explanation: 'La marcatura CE certifica la conformità ai requisiti essenziali di salute e sicurezza previsti dalle direttive/regolamenti europei.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'dpi_boss_5',
          question: 'Per lavori in quota (oltre 2 metri), quale DPI è obbligatorio?',
          options: ['Casco protettivo', 'Sistema di protezione anticaduta (imbracatura + cordino)', 'Guanti', 'Giubbotto alta visibilità'],
          correctIndex: 1,
          explanation: 'Per lavori in quota (altezza superiore a 2 metri) è obbligatorio l\'uso di sistemi di protezione anticaduta conformi alla norma EN 361.',
          xpReward: 40,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 75,
      xpReward: 50,
    },
  ],
};

import { rischioBassContents } from './training-content-basso';
import { rischioMedioContents } from './training-content-medio';
import { rischioAltoContents } from './training-content-alto';
import { cybersecurityContent } from './training-content-cybersecurity';
import { lavoratoriSpecificaContents } from './training-content-lavoratori-specifica';
import { rsppDatoreContents } from './training-content-rspp-datore';
import { moduloRSPP2Content } from './training-content-rspp-datore-m2';
import { moduloRSPP3Content } from './training-content-rspp-datore-m3';
import { moduloRSPP4Content } from './training-content-rspp-datore-m4';
import { rlsContents } from './training-content-rls';
import { moduloRLS2Content } from './training-content-rls-m2';
import { moduloRLS3Content } from './training-content-rls-m3';
import { prepostoContents } from './training-content-preposto';
import { moduloP2Content } from './training-content-preposto-m2';
import { moduloP3Content } from './training-content-preposto-m3';

export const allModulesContent: ModuleContent[] = [
  modulo1Content,
  modulo2Content,
  modulo3Content,
  modulo4Content,
  ...rischioBassContents,
  ...rischioMedioContents,
  ...rischioAltoContents,
  cybersecurityContent,
  ...lavoratoriSpecificaContents,
  ...rsppDatoreContents,
  moduloRSPP2Content,
  moduloRSPP3Content,
  moduloRSPP4Content,
  ...rlsContents,
  moduloRLS2Content,
  moduloRLS3Content,
  ...prepostoContents,
  moduloP2Content,
  moduloP3Content,
];

export const getModuleContent = (moduleId: string): ModuleContent | undefined => {
  return allModulesContent.find(m => m.moduleId === moduleId);
};

// XP Leveling thresholds
export const XP_LEVELS = [
  { level: 1, minXp: 0, title: 'Apprendista' },
  { level: 2, minXp: 100, title: 'Osservatore' },
  { level: 3, minXp: 250, title: 'Vigilante' },
  { level: 4, minXp: 500, title: 'Ispettore' },
  { level: 5, minXp: 800, title: 'Esperto' },
  { level: 6, minXp: 1200, title: 'Maestro della Sicurezza' },
];

export const getLevelFromXp = (xp: number) => {
  const level = [...XP_LEVELS].reverse().find(l => xp >= l.minXp);
  return level || XP_LEVELS[0];
};

export const getNextLevel = (xp: number) => {
  const currentLevel = getLevelFromXp(xp);
  return XP_LEVELS.find(l => l.level === currentLevel.level + 1);
};
