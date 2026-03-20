import type { ModuleContent } from './training-content';

export const antincendioEsercitazioniContent: ModuleContent = {
  moduleId: 'antincendio_esercitazioni',
  sections: [
    {
      id: 'ai3_practical',
      title: 'Uso Pratico dell\'Estintore',
      type: 'lesson',
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
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ai3_quiz_practical',
      title: 'Verifica: Uso Estintore',
      type: 'quiz',
      questions: [
        {
          id: 'ai3_q1',
          question: 'Dove va diretto il getto dell\'estintore?',
          options: ['Sulla parte alta delle fiamme', 'Alla base delle fiamme', 'Sul fumo', 'Sul soffitto'],
          correctIndex: 1,
          explanation: 'Il getto va sempre diretto alla base delle fiamme dove si trova il combustibile.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ai3_q1b',
          question: 'Dove ci si posiziona rispetto al vento quando si usa un estintore?',
          options: ['Sottovento', 'Sopravvento', 'Di lato', 'Non importa'],
          correctIndex: 1,
          explanation: 'Sopravvento = vento alle spalle, porta fumo e fiamme lontano dal soccorritore.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai3_simulation',
      title: 'Simulazione di Incendio',
      type: 'lesson',
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
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai3_quiz_simulation',
      title: 'Verifica: Simulazione',
      type: 'quiz',
      questions: [
        {
          id: 'ai3_q2',
          question: 'In una simulazione, trovi un incendio di olio in cucina. Quale estintore usi?',
          options: ['Acqua', 'CO₂', 'Estintore classe F o coperchio sul recipiente', 'Polvere ABC'],
          correctIndex: 2,
          explanation: 'Gli incendi di oli da cucina (classe F) richiedono estintori specifici o il soffocamento con coperchio.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai3_evacuation',
      title: 'Esercitazione di Evacuazione',
      type: 'lesson',
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
- Rientrare prima dell'autorizzazione`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ai3_quiz_evacuation',
      title: 'Verifica: Evacuazione',
      type: 'quiz',
      questions: [
        {
          id: 'ai3_q3',
          question: 'Chi è il "chiudi-fila" durante l\'evacuazione?',
          options: ['Chi chiude a chiave le porte', 'L\'ultimo che esce verificando che nessuno resti indietro', 'Il vigile del fuoco', 'Chi disattiva l\'allarme'],
          correctIndex: 1,
          explanation: 'Il chiudi-fila è la persona incaricata di uscire per ultima, verificando che tutti abbiano evacuato.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai3_npc_scenario',
      title: '💬 Scenario: Prova Pratica Estintore',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Istr. Bianchi', role: 'Istruttore Antincendio', text: 'Durante l\'esercitazione, ti viene chiesto di spegnere un focolaio in una vasca con liquido infiammabile. Il vento soffia da est. Dove ti posizioni?' },
      ],
      questions: [
        {
          id: 'ai3_npc1',
          question: 'Il vento soffia da est. Dove ti posizioni?',
          options: [
            'A est del focolaio (sottovento)',
            'A ovest del focolaio (sopravvento)',
            'Non importa la posizione',
            'Il più lontano possibile',
          ],
          correctIndex: 1,
          explanation: 'Sopravvento il vento porta fumo e fiamme lontano da te.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 20,
    },
    {
      id: 'ai3_boss_test',
      title: '🏆 Test Finale — Esercitazioni Pratiche',
      type: 'boss_test',
      questions: [
        {
          id: 'ai3_boss1',
          question: 'Dove ci si posiziona rispetto al vento quando si usa un estintore?',
          options: ['Sottovento', 'Sopravvento', 'Di lato', 'Non importa'],
          correctIndex: 1,
          explanation: 'Sopravvento = vento alle spalle.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ai3_boss2',
          question: 'La gittata di un estintore a CO₂ è circa:',
          options: ['10 metri', '5-8 metri', '2-3 metri', '15 metri'],
          correctIndex: 2,
          explanation: 'Gli estintori a CO₂ hanno gittata limitata di 2-3 metri.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'ai3_boss3',
          question: 'Il ruolo dell\'apri-fila è:',
          options: ['Spegnere l\'incendio', 'Guidare il gruppo lungo il percorso di evacuazione', 'Chiamare i VVF', 'Chiudere le porte'],
          correctIndex: 1,
          explanation: 'L\'apri-fila guida il gruppo lungo il percorso di evacuazione stabilito.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ai3_boss4',
          question: 'Dopo aver spento un focolaio con l\'estintore, devi:',
          options: ['Voltare le spalle e andare via', 'Non voltare mai le spalle al focolaio e vigilare', 'Riporre subito l\'estintore', 'Tornare al lavoro'],
          correctIndex: 1,
          explanation: 'Mai voltare le spalle a un focolaio spento: potrebbe riaccendersi.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ai3_boss5',
          question: 'L\'esercitazione di evacuazione si conclude con:',
          options: ['Lo spegnimento dell\'allarme', 'Il debriefing e analisi delle criticità', 'Il pranzo', 'La firma del registro'],
          correctIndex: 1,
          explanation: 'Il debriefing è la fase finale per analizzare criticità e definire miglioramenti.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
