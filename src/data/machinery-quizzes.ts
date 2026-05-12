// Quiz contestuali per i macchinari pesanti del Cantiere Edile
// Riferimenti normativi: D.Lgs. 81/08, Titolo III (Uso delle attrezzature),
// in particolare artt. 71 (requisiti) e 73 (informazione/formazione operatori)
// e Allegato XV (PSC) — interferenze e segregazioni

export interface MachineryQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const MACHINERY_RISK_QUIZZES: Record<string, MachineryQuizQuestion[]> = {
  risk_machine_excavator: [
    {
      question:
        "Hai notato che la zona di rotazione del braccio dell'escavatore non è delimitata. Qual è la prima azione corretta?",
      options: [
        "Avvicinarsi all'operatore per segnalarglielo a voce mentre lavora",
        "Fermare il mezzo, segnalare al preposto e installare cavalletti/nastri di delimitazione del raggio di azione",
        "Aspettare che finisca il turno",
        "Spostarsi rapidamente fuori dall'area senza avvisare nessuno",
      ],
      correctIndex: 1,
      explanation:
        "Il D.Lgs. 81/08 art. 71 e l'Allegato VI prevedono che l'area di azione delle attrezzature mobili sia segregata. L'operatore deve essere fermato in sicurezza prima di entrare nel raggio della macchina.",
    },
    {
      question:
        "Qual è il raggio minimo di sicurezza tipicamente delimitato attorno a un escavatore in rotazione?",
      options: [
        "Almeno 1 metro",
        "Tutta la lunghezza del braccio + corpo macchina (in genere 5–10 m)",
        "Non serve, basta il caschetto",
        "Solo davanti alla benna",
      ],
      correctIndex: 1,
      explanation:
        "Va considerato l'intero raggio di rotazione della torretta + sbraccio massimo, perché il contrappeso posteriore può colpire chiunque entri lateralmente.",
    },
  ],

  risk_machine_dozer: [
    {
      question:
        "Il bulldozer manovra in retromarcia ma non c'è un moviere a terra. Cosa fai?",
      options: [
        "Passo dietro velocemente prima che si muova",
        "Fermo la manovra e richiedo immediatamente un moviere formato con segnali concordati",
        "Suono il clacson dell'auto in passaggio",
        "Lascio fare, l'operatore vede dagli specchietti",
      ],
      correctIndex: 1,
      explanation:
        "Il punto cieco posteriore dei mezzi cingolati è la prima causa di investimenti in cantiere. È obbligatorio un moviere (segnalatore) formato (D.Lgs. 81/08 art. 73) o, in alternativa, sistemi di rilevamento ostacoli.",
    },
    {
      question:
        "Quale DPI/dispositivo riduce il rischio di non essere visti dall'operatore di un mezzo cingolato?",
      options: [
        "Scarpe antinfortunistiche",
        "Indumenti ad alta visibilità classe 2/3 + segnalatore acustico di retromarcia attivo",
        "Mascherina FFP2",
        "Solo il casco bianco",
      ],
      correctIndex: 1,
      explanation:
        "Hi-Vis (UNI EN ISO 20471) e cicalino di retromarcia funzionante sono prescritti per chi opera vicino a mezzi in movimento.",
    },
  ],

  risk_machine_truck: [
    {
      question:
        "La pista del dumper attraversa il percorso pedonale senza separazione. Qual è la soluzione conforme?",
      options: [
        "Mettere un cartello 'attenzione' e basta",
        "Segregare fisicamente i due flussi (barriere/new-jersey) o separare temporalmente con regolatore di traffico",
        "Chiedere ai pedoni di correre per attraversare",
        "Vietare ai pedoni di lavorare",
      ],
      correctIndex: 1,
      explanation:
        "Il PSC (All. XV D.Lgs. 81/08) richiede di eliminare le interferenze tra mezzi e pedoni con separazione fisica o, dove non possibile, regolazione organizzativa con moviere.",
    },
    {
      question:
        "Quando un dumper si avvicina a un attraversamento pedonale in cantiere, deve:",
      options: [
        "Procedere alla velocità massima per liberare il punto",
        "Rallentare, dare precedenza ai pedoni e attivare segnalazione acustica/luminosa",
        "Suonare e proseguire",
        "Procedere in retromarcia per maggiore controllo",
      ],
      correctIndex: 1,
      explanation:
        "I mezzi devono dare precedenza ai pedoni e segnalare la propria presenza. Limite di velocità tipico in cantiere: 10 km/h.",
    },
  ],

  risk_machine_mixer: [
    {
      question:
        "Trovi la betoniera con motore acceso e operatore assente. La condotta corretta è:",
      options: [
        "Salire e provare a guidarla per spostarla",
        "Spegnere il motore in sicurezza (se autorizzato/formato), togliere la chiave e segnalare al preposto",
        "Lasciare tutto com'è, non è un problema",
        "Coprirla con un telo",
      ],
      correctIndex: 1,
      explanation:
        "L'art. 71 c.7 del D.Lgs. 81/08 impone l'uso delle attrezzature solo a personale formato. Lasciare un mezzo acceso e incustodito è violazione: serve isolare l'energia (LOTO) e avvisare il responsabile.",
    },
    {
      question:
        "Perché un mezzo a combustione lasciato acceso fermo è un rischio anche per la salute?",
      options: [
        "Solo perché consuma carburante",
        "Emette monossido di carbonio e particolato, pericolosi in ambienti poco ventilati o aree chiuse del cantiere",
        "Non c'è nessun rischio per la salute",
        "Solo per il rumore",
      ],
      correctIndex: 1,
      explanation:
        "Il CO è inodore e può causare intossicazione anche all'aperto in zone confinate (scavi, intercapedini). È una delle cause di infortunio grave più sottovalutate.",
    },
  ],
};

export const isMachineryRisk = (riskId?: string): boolean =>
  !!riskId && riskId in MACHINERY_RISK_QUIZZES;
