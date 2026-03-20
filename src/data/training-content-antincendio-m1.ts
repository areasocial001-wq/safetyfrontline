export const antincendioPrevenzioneContent = {
  moduleId: 'antincendio_prevenzione',
  sections: [
    {
      id: 'fire_chemistry',
      title: 'Il Triangolo del Fuoco',
      content: `La combustione è una reazione chimica di ossidazione sufficientemente rapida da produrre calore e generalmente una fiamma. Per avere un incendio servono tre elementi simultaneamente presenti, rappresentati dal **triangolo del fuoco**:

- **Combustibile**: qualsiasi sostanza in grado di bruciare (legno, carta, liquidi infiammabili, gas)
- **Comburente**: generalmente l'ossigeno dell'aria
- **Energia di innesco**: fonte di calore sufficiente ad avviare la reazione (fiamma, scintilla, surriscaldamento)

Rimuovendo anche solo uno di questi elementi, la combustione si interrompe. Questo principio è alla base di tutte le strategie di spegnimento.`,
      duration_minutes: 8,
      quiz: {
        question: 'Quali sono i tre elementi del triangolo del fuoco?',
        options: ['Combustibile, comburente, energia di innesco', 'Fumo, fiamma, calore', 'Ossigeno, azoto, carbonio', 'Vapore, gas, polvere'],
        correct: 0,
        explanation: 'Il triangolo del fuoco è composto da combustibile, comburente (ossigeno) ed energia di innesco.'
      }
    },
    {
      id: 'fire_classes',
      title: 'Classi di Incendio',
      content: `Gli incendi vengono classificati in base alla natura del combustibile:

| Classe | Combustibile | Esempi |
|--------|-------------|--------|
| **A** | Solidi | Legno, carta, tessuti, gomma |
| **B** | Liquidi | Benzina, alcol, solventi, oli |
| **C** | Gas | Metano, GPL, acetilene, idrogeno |
| **D** | Metalli | Magnesio, alluminio, sodio, potassio |
| **F** | Oli da cucina | Grassi e oli per cottura |

La corretta classificazione è fondamentale per scegliere l'agente estinguente appropriato. Usare l'estinguente sbagliato può essere inefficace o addirittura pericoloso.`,
      duration_minutes: 8,
      quiz: {
        question: 'Un incendio di benzina appartiene alla classe:',
        options: ['Classe A', 'Classe B', 'Classe C', 'Classe D'],
        correct: 1,
        explanation: 'La classe B comprende gli incendi di liquidi infiammabili come benzina, alcol e solventi.'
      }
    },
    {
      id: 'prevention_measures',
      title: 'Misure di Prevenzione Incendi',
      content: `Le misure di prevenzione mirano a **ridurre la probabilità** che si verifichi un incendio:

**Misure tecniche:**
- Impianti elettrici a norma e manutenuti
- Corretta conservazione di sostanze infiammabili
- Impianti di rilevazione e allarme
- Ventilazione adeguata dei locali

**Misure organizzative:**
- Formazione del personale
- Divieto di fumo nelle aree a rischio
- Procedure per lavori a caldo (permessi di lavoro)
- Controlli periodici e manutenzione programmata

**Misure comportamentali:**
- Non sovraccaricare prese elettriche
- Mantenere ordine e pulizia
- Segnalare anomalie e malfunzionamenti
- Rispettare la segnaletica di sicurezza`,
      duration_minutes: 8,
      quiz: {
        question: 'Quale tra queste è una misura di prevenzione incendi?',
        options: ['Usare l\'estintore', 'Attivare l\'allarme durante un incendio', 'Manutenzione programmata degli impianti elettrici', 'Evacuare l\'edificio'],
        correct: 2,
        explanation: 'La manutenzione programmata è una misura preventiva che riduce la probabilità di incendio.'
      }
    },
    {
      id: 'extinguishing_agents',
      title: 'Sostanze Estinguenti',
      content: `Ogni agente estinguente agisce rimuovendo uno o più elementi del triangolo del fuoco:

**Acqua** — Azione di raffreddamento. Adatta per classe A. MAI su impianti elettrici o classe D.

**Schiuma** — Soffocamento e raffreddamento. Efficace su classe A e B.

**Polvere** — Inibizione chimica della combustione. Versatile (ABC), ma lascia residui e riduce la visibilità.

**CO₂ (anidride carbonica)** — Soffocamento e leggero raffreddamento. Ideale per apparecchiature elettriche e ambienti chiusi. Non lascia residui.

**Agenti puliti (gas inerti)** — Soffocamento. Per protezione di server room, archivi, beni di valore.`,
      duration_minutes: 7,
      quiz: {
        question: 'Quale agente estinguente è più adatto per un incendio su apparecchiature elettriche?',
        options: ['Acqua', 'Schiuma', 'CO₂', 'Sabbia'],
        correct: 2,
        explanation: 'Il CO₂ non conduce elettricità e non lascia residui, ideale per apparecchiature elettriche.'
      }
    },
    {
      id: 'fire_dynamics',
      title: 'Dinamica dell\'Incendio',
      content: `Un incendio si sviluppa attraverso fasi caratteristiche:

1. **Fase di innesco** — Il combustibile raggiunge la temperatura di accensione. Fase ancora controllabile.
2. **Fase di propagazione** — L'incendio si estende ai materiali circostanti. La temperatura sale rapidamente.
3. **Incendio generalizzato (flashover)** — Tutti i materiali combustibili sono coinvolti. Temperature oltre 600°C. Impossibile intervenire senza mezzi professionali.
4. **Fase di decadimento** — Il combustibile si esaurisce, la temperatura diminuisce.

Il **flashover** è il punto critico: prima si può tentare lo spegnimento, dopo è necessaria l'evacuazione immediata.

**Prodotti della combustione pericolosi:**
- Fiamme e calore (ustioni)
- Fumo (riduzione visibilità)
- Gas tossici (CO, HCN, acido cloridrico)
- Carenza di ossigeno`,
      duration_minutes: 7,
      quiz: {
        question: 'Cos\'è il flashover?',
        options: ['L\'esplosione iniziale', 'Il momento in cui tutti i materiali prendono fuoco simultaneamente', 'Lo spegnimento dell\'incendio', 'L\'arrivo dei vigili del fuoco'],
        correct: 1,
        explanation: 'Il flashover è il passaggio all\'incendio generalizzato, quando tutti i materiali combustibili si accendono.'
      }
    }
  ],
  bossTest: {
    title: 'Test Finale — L\'Incendio e la Prevenzione',
    questions: [
      { question: 'Qual è il comburente più comune?', options: ['Azoto', 'Ossigeno', 'Idrogeno', 'Carbonio'], correct: 1 },
      { question: 'Un incendio di metano è di classe:', options: ['A', 'B', 'C', 'D'], correct: 2 },
      { question: 'Quale agente estinguente NON si deve usare su impianti elettrici sotto tensione?', options: ['CO₂', 'Polvere', 'Acqua', 'Gas inerti'], correct: 2 },
      { question: 'Il flashover si verifica quando:', options: ['L\'incendio si spegne', 'Tutti i combustibili si accendono', 'Arrivano i soccorsi', 'Si attiva l\'allarme'], correct: 1 },
      { question: 'La polvere estinguente agisce per:', options: ['Solo raffreddamento', 'Inibizione chimica', 'Solo soffocamento', 'Diluizione'], correct: 1 },
    ]
  },
  npcScenarios: [
    {
      id: 'fire_prevention_check',
      title: 'Ispezione Antincendio',
      npcName: 'Ing. Ferrara',
      npcRole: 'Responsabile Prevenzione Incendi',
      situation: 'Stai effettuando un\'ispezione antincendio nel reparto produzione. Noti diverse situazioni potenzialmente pericolose.',
      question: 'Trovi un estintore a polvere posizionato dietro un carrello che ne blocca l\'accesso. Cosa fai?',
      options: [
        { text: 'Ignoro, tanto ce ne sono altri nel corridoio', isCorrect: false, feedback: 'Ogni estintore deve essere sempre accessibile e visibile.' },
        { text: 'Sposto il carrello e verifico che l\'estintore sia accessibile, segnalato e revisionato', isCorrect: true, feedback: 'Corretto! L\'accessibilità degli estintori è un requisito fondamentale della prevenzione incendi.' },
        { text: 'Rimuovo l\'estintore e lo porto in magazzino', isCorrect: false, feedback: 'L\'estintore deve restare nella posizione prevista dal piano antincendio.' },
        { text: 'Metto un cartello "non ostruire"', isCorrect: false, feedback: 'Il cartello è utile ma prima devi ripristinare l\'accessibilità immediata.' }
      ]
    }
  ]
};
