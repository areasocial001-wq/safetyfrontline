export const antincendioEsercitazioniContent = {
  moduleId: 'antincendio_esercitazioni',
  sections: [
    {
      id: 'practical_extinguisher',
      title: 'Uso Pratico dell\'Estintore',
      content: `Le esercitazioni pratiche sono fondamentali per acquisire sicurezza nell'uso dei mezzi di estinzione.

**Preparazione:**
- Verificare il tipo di estintore (polvere, CO₂, schiuma)
- Controllare il manometro (zona verde = OK)
- Posizionarsi sopravvento (il vento alle spalle)
- Mantenere distanza di sicurezza (2-3 metri per polvere, 1-2 per CO₂)

**Tecnica di spegnimento:**
1. Avvicinarsi con cautela, tenendo l'estintore in posizione verticale
2. Togliere la spina di sicurezza con un movimento deciso
3. Impugnare la manichetta con una mano, la leva con l'altra
4. Dirigere il getto alla BASE delle fiamme, non sulla fiamma
5. Erogare con movimenti a ventaglio, da destra a sinistra
6. Avanzare gradualmente man mano che le fiamme si riducono
7. Non voltare mai le spalle al focolaio spento

**Attenzione con CO₂:**
- La bombola diventa molto fredda (rischio ustioni da freddo)
- In ambienti chiusi può ridurre l'ossigeno
- Gittata limitata (2-3 metri)`,
      duration_minutes: 10,
      quiz: {
        question: 'Dove va diretto il getto dell\'estintore?',
        options: ['Sulla parte alta delle fiamme', 'Alla base delle fiamme', 'Sul fumo', 'Sul soffitto'],
        correct: 1,
        explanation: 'Il getto va sempre diretto alla base delle fiamme dove si trova il combustibile che alimenta l\'incendio.'
      }
    },
    {
      id: 'fire_simulation',
      title: 'Simulazione di Incendio',
      content: `Le simulazioni riproducono scenari realistici per addestrare il personale:

**Scenari tipici:**
- Incendio di cestino/contenitore (classe A)
- Incendio di liquido in vasca (classe B)
- Incendio di quadro elettrico (simulato)
- Incendio in cucina (classe F)

**Obiettivi della simulazione:**
- Valutare rapidamente il tipo di incendio
- Scegliere l'estintore corretto
- Applicare la tecnica di spegnimento appropriata
- Gestire lo stress e mantenere la lucidità
- Decidere quando è il momento di evacuare

**Criteri di successo:**
- Scelta corretta dell'agente estinguente
- Posizionamento sopravvento
- Getto alla base delle fiamme
- Spegnimento completo senza riaccensione
- Tempo di intervento ragionevole`,
      duration_minutes: 8,
      quiz: {
        question: 'In una simulazione, trovi un incendio di olio in cucina. Quale estintore usi?',
        options: ['Acqua', 'CO₂', 'Estintore classe F o coperchio sul recipiente', 'Polvere ABC'],
        correct: 2,
        explanation: 'Gli incendi di oli da cucina (classe F) richiedono estintori specifici o il soffocamento con coperchio.'
      }
    },
    {
      id: 'evacuation_exercise',
      title: 'Esercitazione di Evacuazione',
      content: `L'esercitazione di evacuazione coinvolge tutto il personale e simula un'emergenza reale:

**Fasi dell'esercitazione:**
1. **Attivazione allarme** — Segnale acustico riconoscibile
2. **Comunicazione** — Gli addetti informano del tipo di emergenza
3. **Evacuazione ordinata** — Seguire le vie di fuga indicate
4. **Assistenza** — Supporto a persone con difficoltà motorie
5. **Raggiungimento punto di raccolta** — Tutti devono presentarsi
6. **Appello** — Verifica che tutti siano usciti
7. **Debriefing** — Analisi di criticità e miglioramenti

**Ruoli durante l'evacuazione:**
- **Apri-fila**: guida il gruppo lungo il percorso
- **Chiudi-fila**: verifica che nessuno resti indietro
- **Addetto disabili**: assiste le persone con mobilità ridotta
- **Coordinatore al punto di raccolta**: effettua l'appello

**Errori comuni da evitare:**
- Correre e spingersi
- Usare ascensori
- Fermarsi a raccogliere oggetti
- Rientrare prima dell'autorizzazione
- Non raggiungere il punto di raccolta`,
      duration_minutes: 8,
      quiz: {
        question: 'Chi è il "chiudi-fila" durante l\'evacuazione?',
        options: ['Chi chiude a chiave le porte', 'L\'ultimo che esce verificando che nessuno resti indietro', 'Il vigile del fuoco', 'Chi disattiva l\'allarme'],
        correct: 1,
        explanation: 'Il chiudi-fila è la persona incaricata di uscire per ultima, verificando che tutti abbiano evacuato il locale.'
      }
    }
  ],
  bossTest: {
    title: 'Test Finale — Esercitazioni Pratiche',
    questions: [
      { question: 'Dove ci si posiziona rispetto al vento quando si usa un estintore?', options: ['Sottovento', 'Sopravvento', 'Di lato', 'Non importa'], correct: 1 },
      { question: 'La gittata di un estintore a CO₂ è circa:', options: ['10 metri', '5-8 metri', '2-3 metri', '15 metri'], correct: 2 },
      { question: 'Il ruolo dell\'apri-fila è:', options: ['Spegnere l\'incendio', 'Guidare il gruppo lungo il percorso di evacuazione', 'Chiamare i VVF', 'Chiudere le porte'], correct: 1 },
      { question: 'Dopo aver spento un focolaio con l\'estintore, devi:', options: ['Voltare le spalle e andare via', 'Non voltare mai le spalle al focolaio e vigilare', 'Riporre subito l\'estintore', 'Tornare al lavoro'], correct: 1 },
      { question: 'L\'esercitazione di evacuazione si conclude con:', options: ['Lo spegnimento dell\'allarme', 'Il debriefing e analisi delle criticità', 'Il pranzo', 'La firma del registro'], correct: 1 },
    ]
  },
  npcScenarios: [
    {
      id: 'extinguisher_practice',
      title: 'Prova Pratica Estintore',
      npcName: 'Istr. Bianchi',
      npcRole: 'Istruttore Antincendio',
      situation: 'Durante l\'esercitazione, ti viene chiesto di spegnere un focolaio in una vasca con liquido infiammabile.',
      question: 'Il vento soffia da est. Dove ti posizioni?',
      options: [
        { text: 'A est del focolaio (sottovento)', isCorrect: false, feedback: 'Sottovento il fumo e le fiamme vengono verso di te!' },
        { text: 'A ovest del focolaio (sopravvento)', isCorrect: true, feedback: 'Corretto! Sopravvento il vento porta fumo e fiamme lontano da te.' },
        { text: 'Non importa la posizione', isCorrect: false, feedback: 'La posizione rispetto al vento è fondamentale per la sicurezza.' },
        { text: 'Il più lontano possibile', isCorrect: false, feedback: 'Troppo lontano il getto non raggiunge il focolaio efficacemente.' }
      ]
    }
  ]
};
