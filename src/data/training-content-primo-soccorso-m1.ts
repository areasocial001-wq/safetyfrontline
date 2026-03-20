export const primoSoccorsoAllertareContent = {
  moduleId: 'primo_soccorso_allertare',
  sections: [
    {
      id: 'emergency_system',
      title: 'Il Sistema di Emergenza Sanitaria',
      content: `Il sistema di emergenza sanitaria italiano è organizzato su base regionale con il **Numero Unico di Emergenza 112 (NUE)** che smista le chiamate ai servizi competenti.

**Numeri utili:**
- **112** — Numero Unico Europeo (NUE)
- **118** — Emergenza Sanitaria (ancora attivo in alcune regioni)
- **115** — Vigili del Fuoco
- **113** — Polizia di Stato

**La catena del soccorso:**
1. Riconoscimento dell'emergenza
2. Allertamento del sistema (chiamata)
3. Primo soccorso (da parte di chi è presente)
4. Arrivo dei soccorsi avanzati (ambulanza)
5. Trasporto in ospedale
6. Trattamento definitivo

Ogni anello della catena è fondamentale: un ritardo in uno qualsiasi compromette l'esito finale.`,
      duration_minutes: 8,
      quiz: {
        question: 'Qual è il Numero Unico di Emergenza europeo?',
        options: ['118', '115', '112', '113'],
        correct: 2,
        explanation: 'Il 112 è il Numero Unico di Emergenza (NUE) valido in tutta Europa.'
      }
    },
    {
      id: 'emergency_call',
      title: 'Come Effettuare una Chiamata di Emergenza',
      content: `Una chiamata efficace ai soccorsi può salvare una vita. Ecco le informazioni da comunicare:

**Informazioni essenziali (regola delle 5 W):**
- **WHO** (Chi): nome del chiamante e numero di telefono
- **WHERE** (Dove): indirizzo preciso, piano, riferimenti
- **WHAT** (Cosa): tipo di emergenza (malore, trauma, incendio)
- **WHEN** (Quando): da quanto tempo è successo
- **HOW MANY** (Quanti): numero di persone coinvolte

**Informazioni aggiuntive:**
- Stato di coscienza della vittima
- Se respira o meno
- Se ci sono pericoli in corso (incendio, crollo, sostanze chimiche)
- Se sono già state effettuate manovre di primo soccorso

**Regole fondamentali:**
- Parlare con calma e chiarezza
- NON riattaccare per primi — attendere istruzioni dell'operatore
- Seguire le indicazioni telefoniche
- Inviare qualcuno ad accogliere l'ambulanza
- Tenere libero il telefono per eventuali richiami`,
      duration_minutes: 8,
      quiz: {
        question: 'Durante una chiamata al 112, chi deve riattaccare per primo?',
        options: ['Il chiamante, dopo aver dato le informazioni', 'L\'operatore della centrale', 'Non importa', 'Bisogna riattaccare subito per non occupare la linea'],
        correct: 1,
        explanation: 'NON si deve mai riattaccare per primi. È l\'operatore della centrale a chiudere la comunicazione dopo aver raccolto tutte le informazioni.'
      }
    },
    {
      id: 'scene_protection',
      title: 'Protezione della Scena e Autoprotezione',
      content: `Prima di intervenire su un infortunato, è fondamentale garantire la sicurezza propria e degli astanti.

**Valutazione della scena (SSS: Sicurezza, Scena, Situazione):**

**Sicurezza:**
- Verificare che non ci siano pericoli per il soccorritore
- Corrente elettrica, gas, sostanze chimiche, traffico
- Indossare DPI se disponibili (guanti monouso!)
- Se la scena non è sicura, NON avvicinarsi

**Scena:**
- Cosa è successo? Meccanismo dell'infortunio
- Quante persone sono coinvolte?
- Ci sono testimoni?

**Situazione:**
- Condizioni della/e vittima/e
- Necessità di risorse aggiuntive

**Autoprotezione:**
- Guanti monouso (SEMPRE)
- Mascherina per ventilazione (pocket mask)
- Evitare contatto con sangue e fluidi corporei
- Lavarsi le mani dopo ogni intervento`,
      duration_minutes: 8,
      quiz: {
        question: 'Qual è la prima cosa da fare prima di soccorrere un infortunato?',
        options: ['Chiamare il 112', 'Verificare che la scena sia sicura', 'Iniziare la rianimazione', 'Spostare l\'infortunato'],
        correct: 1,
        explanation: 'La sicurezza del soccorritore viene sempre prima: se il soccorritore diventa vittima, peggiora la situazione.'
      }
    },
    {
      id: 'accident_causes',
      title: 'Cause e Circostanze dell\'Infortunio',
      content: `Comprendere le cause dell'infortunio è essenziale per fornire informazioni corrette ai soccorsi e per attuare interventi appropriati.

**Tipologie di infortunio sul lavoro:**

**Traumi meccanici:**
- Cadute dall'alto o in piano
- Schiacciamento da carichi
- Taglio o amputazione da macchinari
- Urto contro oggetti

**Traumi termici:**
- Ustioni da contatto, fiamma, liquidi caldi
- Ustioni chimiche da acidi o basi
- Congelamento/ipotermia

**Traumi chimici:**
- Inalazione di gas/vapori tossici
- Contatto cutaneo con sostanze corrosive
- Ingestione accidentale

**Traumi elettrici:**
- Elettrocuzione
- Folgorazione
- Arco elettrico

**Emergenze mediche:**
- Malori cardiaci
- Crisi epilettiche
- Reazioni allergiche (anafilassi)
- Colpo di calore/ipotermia

Per ogni tipo di infortunio, le informazioni da comunicare ai soccorsi cambiano.`,
      duration_minutes: 7,
      quiz: {
        question: 'Un collega sviene dopo aver inalato vapori in un locale chiuso. Qual è la causa più probabile?',
        options: ['Trauma meccanico', 'Trauma termico', 'Intossicazione da inalazione', 'Colpo di calore'],
        correct: 2,
        explanation: 'L\'inalazione di gas o vapori tossici in ambiente chiuso è una causa frequente di malore sul lavoro.'
      }
    }
  ],
  bossTest: {
    title: 'Test Finale — Allertare il Sistema di Soccorso',
    questions: [
      { question: 'Il primo anello della catena del soccorso è:', options: ['Chiamare l\'ambulanza', 'Riconoscere l\'emergenza', 'Trasportare in ospedale', 'Fare il massaggio cardiaco'], correct: 1 },
      { question: 'La regola SSS sta per:', options: ['Soccorso, Sicurezza, Sanità', 'Sicurezza, Scena, Situazione', 'Sangue, Shock, Svenimento', 'Sirena, Soccorso, Stabilizzazione'], correct: 1 },
      { question: 'Quale DPI è SEMPRE necessario nel primo soccorso?', options: ['Casco', 'Guanti monouso', 'Scarpe antinfortunistiche', 'Occhiali'], correct: 1 },
      { question: 'Se la scena non è sicura, il soccorritore deve:', options: ['Intervenire comunque', 'NON avvicinarsi e chiamare i soccorsi', 'Chiedere aiuto ai colleghi', 'Aspettare che il pericolo passi'], correct: 1 },
      { question: 'Quante informazioni servono nella regola delle 5W?', options: ['3', '4', '5', '7'], correct: 2 },
    ]
  },
  npcScenarios: [
    {
      id: 'emergency_call_scenario',
      title: 'Chiamata di Emergenza',
      npcName: 'Dott.ssa Landi',
      npcRole: 'Operatrice 112',
      situation: 'Un collega è caduto da una scala ed è a terra dolorante, cosciente ma con una gamba in posizione innaturale.',
      question: 'Qual è la prima cosa da comunicare al 112?',
      options: [
        { text: 'Il mio nome e dove mi trovo con indirizzo preciso', isCorrect: true, feedback: 'Corretto! Localizzazione e identificazione sono le prime informazioni vitali.' },
        { text: 'Che servono i vigili del fuoco', isCorrect: false, feedback: 'In questo caso serve un\'ambulanza, non i vigili del fuoco.' },
        { text: 'Che il collega ha la gamba rotta', isCorrect: false, feedback: 'Prima di descrivere le lesioni, devi dare la localizzazione precisa.' },
        { text: 'Riattacco e richiamo quando ho più informazioni', isCorrect: false, feedback: 'Mai riattaccare! L\'operatore ti guiderà passo dopo passo.' }
      ]
    }
  ]
};
