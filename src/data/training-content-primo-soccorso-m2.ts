export const primoSoccorsoInterventoContent = {
  moduleId: 'primo_soccorso_intervento',
  sections: [
    {
      id: 'emergency_recognition',
      title: 'Riconoscere un\'Emergenza Sanitaria',
      content: `Riconoscere rapidamente un'emergenza è il primo passo per un intervento efficace.

**Segnali di allarme:**
- Persona a terra immobile
- Difficoltà respiratorie (affanno, cianosi, rumori respiratori)
- Dolore toracico con sudorazione
- Alterazione dello stato di coscienza
- Sanguinamento abbondante
- Convulsioni
- Reazione allergica grave (gonfiore, orticaria, difficoltà a respirare)

**Valutazione primaria (ABCDE):**
- **A** (Airway): vie aeree pervie?
- **B** (Breathing): respira?
- **C** (Circulation): polso presente? Emorragie?
- **D** (Disability): stato di coscienza?
- **E** (Exposure): esposizione e esame rapido

**Come valutare la coscienza:**
- Chiamare ad alta voce
- Scuotere delicatamente le spalle
- Stimolo doloroso (pizzicotto sul trapezio)`,
      duration_minutes: 10,
      quiz: {
        question: 'La lettera "A" nella valutazione ABCDE sta per:',
        options: ['Assessment', 'Airway (vie aeree)', 'Alert (allarme)', 'Ambulance'],
        correct: 1,
        explanation: 'A = Airway, ovvero la verifica che le vie aeree siano libere e pervie.'
      }
    },
    {
      id: 'bls_procedure',
      title: 'BLS — Supporto Vitale di Base',
      content: `Il BLS (Basic Life Support) è l'insieme delle manovre da attuare in caso di arresto cardiaco.

**Sequenza BLS per laici (linee guida ERC/IRC):**

1. **Sicurezza** — Verificare che la scena sia sicura
2. **Valutare la coscienza** — "Signore, mi sente?" + scuotere le spalle
3. **Chiamare aiuto** — Gridare aiuto, far chiamare il 112 e portare il DAE
4. **Aprire le vie aeree** — Iperestensione del capo + sollevamento del mento
5. **Valutare il respiro** — GAS (Guardo, Ascolto, Sento) per max 10 secondi
6. **Se non respira: 30 compressioni toraciche**
   - Centro del torace (metà inferiore dello sterno)
   - Profondità 5-6 cm
   - Frequenza 100-120/min
   - Rilascio completo del torace
7. **2 ventilazioni** — Bocca a bocca o con pocket mask
8. **Continuare 30:2** fino all'arrivo dei soccorsi o del DAE

**Se non si vuole/può ventilare:**
- Solo compressioni continue (Hands-Only CPR)
- Meglio compressioni senza ventilazioni che nessun intervento!`,
      duration_minutes: 12,
      quiz: {
        question: 'Qual è il rapporto compressioni/ventilazioni nel BLS?',
        options: ['15:2', '30:2', '15:1', '5:1'],
        correct: 1,
        explanation: 'Il rapporto standard è 30 compressioni toraciche seguite da 2 ventilazioni.'
      }
    },
    {
      id: 'dae_usage',
      title: 'Uso del DAE (Defibrillatore)',
      content: `Il DAE (Defibrillatore Automatico Esterno) è un dispositivo salvavita che può essere usato anche da personale non sanitario (L. 116/2021).

**Come si usa il DAE:**
1. **Accendere** il dispositivo (tasto ON o apertura coperchio)
2. **Applicare le piastre** sul torace nudo:
   - Una sotto la clavicola destra
   - Una sotto l'ascella sinistra
3. **Seguire le istruzioni vocali** del dispositivo
4. **Non toccare il paziente** durante l'analisi del ritmo
5. **Se indicato lo shock**: assicurarsi che nessuno tocchi il paziente, premere il pulsante
6. **Riprendere immediatamente le compressioni** dopo lo shock

**Situazioni particolari:**
- Torace bagnato: asciugare prima di applicare le piastre
- Torace peloso: radere l'area (kit incluso nel DAE)
- Pacemaker: posizionare la piastra ad almeno 8 cm dal dispositivo
- Cerotti transdermici: rimuoverli prima

**Dove si trova il DAE:**
- Obbligo in impianti sportivi, scuole, uffici pubblici
- Segnalato con cartello verde con cuore bianco`,
      duration_minutes: 10,
      quiz: {
        question: 'Il DAE può essere usato da:',
        options: ['Solo medici', 'Solo infermieri', 'Anche personale non sanitario formato', 'Solo i VVF'],
        correct: 2,
        explanation: 'La Legge 116/2021 consente l\'uso del DAE anche a personale non sanitario, anche senza formazione specifica in caso di emergenza.'
      }
    },
    {
      id: 'recovery_position',
      title: 'Posizione Laterale di Sicurezza',
      content: `La Posizione Laterale di Sicurezza (PLS) si utilizza quando una persona è **incosciente ma respira**.

**Quando usarla:**
- Persona priva di coscienza
- Respiro presente e regolare
- Nessun sospetto di trauma spinale

**Come eseguirla:**
1. Inginocchiarsi accanto alla vittima
2. Posizionare il braccio più vicino a 90° rispetto al corpo
3. Portare il braccio più lontano sul torace, mano sulla guancia opposta
4. Piegare il ginocchio più lontano
5. Ruotare la vittima verso di sé tirando il ginocchio
6. Stabilizzare la posizione: ginocchio a 90°, testa leggermente estesa
7. Bocca rivolta verso il basso (per drenare eventuali liquidi)

**Controindicazioni:**
- Sospetto trauma vertebrale (non muovere!)
- Arresto respiratorio (serve BLS)
- Fratture evidenti degli arti coinvolti

**Monitoraggio:**
- Controllare continuamente il respiro
- Se smette di respirare → BLS immediato
- Cambiare lato ogni 30 minuti se l'attesa è lunga`,
      duration_minutes: 8,
      quiz: {
        question: 'La PLS si usa quando la vittima è:',
        options: ['Cosciente e sta bene', 'Incosciente ma respira', 'In arresto cardiaco', 'Con trauma spinale'],
        correct: 1,
        explanation: 'La PLS si applica a persone incoscienti che respirano autonomamente, per mantenere pervie le vie aeree.'
      }
    },
    {
      id: 'choking',
      title: 'Ostruzione delle Vie Aeree',
      content: `L'ostruzione delle vie aeree da corpo estraneo è un'emergenza che richiede intervento immediato.

**Ostruzione parziale (la vittima tossisce):**
- Incoraggiare a tossire con forza
- NON dare pacche sulla schiena se tossisce efficacemente
- Monitorare attentamente

**Ostruzione completa (la vittima non riesce a parlare/tossire/respirare):**

**Manovra di Heimlich (vittima cosciente in piedi):**
1. Posizionarsi dietro la vittima
2. Pugno chiuso sopra l'ombelico, sotto lo sterno
3. Afferrare il pugno con l'altra mano
4. Comprimere con movimenti rapidi dal basso verso l'alto e all'indietro
5. Ripetere fino all'espulsione del corpo estraneo

**Se la vittima perde coscienza:**
- Adagiarla a terra
- Chiamare il 112
- Iniziare le compressioni toraciche del BLS
- Prima di ogni ventilazione, controllare se il corpo estraneo è visibile in bocca

**Vittima obesa o in gravidanza:**
- Compressioni toraciche anziché addominali`,
      duration_minutes: 8,
      quiz: {
        question: 'Se una persona sta tossendo energicamente per un corpo estraneo, devi:',
        options: ['Fare subito la manovra di Heimlich', 'Dare 5 pacche sulla schiena', 'Incoraggiarla a continuare a tossire', 'Farla sdraiare'],
        correct: 2,
        explanation: 'Se la vittima tossisce efficacemente, il colpo di tosse è il meccanismo più efficace per espellere il corpo estraneo.'
      }
    }
  ],
  bossTest: {
    title: 'Test Finale — Riconoscere e Intervenire',
    questions: [
      { question: 'Nel BLS la profondità delle compressioni toraciche deve essere:', options: ['2-3 cm', '5-6 cm', '8-10 cm', '1-2 cm'], correct: 1 },
      { question: 'La PLS è controindicata in caso di:', options: ['Svenimento', 'Sospetto trauma spinale', 'Persona che russa', 'Crisi epilettica finita'], correct: 1 },
      { question: 'La frequenza delle compressioni nel BLS è:', options: ['60-80/min', '80-100/min', '100-120/min', '120-140/min'], correct: 2 },
      { question: 'La manovra di Heimlich si esegue con compressioni:', options: ['Sul torace', 'Sull\'addome, sopra l\'ombelico', 'Sulla schiena', 'Sul collo'], correct: 1 },
      { question: 'Il DAE analizza il ritmo cardiaco. Durante l\'analisi:', options: ['Continuare le compressioni', 'Non toccare il paziente', 'Ventilare', 'Spostare il paziente'], correct: 1 },
    ]
  },
  npcScenarios: [
    {
      id: 'cardiac_arrest_scenario',
      title: 'Arresto Cardiaco in Ufficio',
      npcName: 'Dott. Martini',
      npcRole: 'Medico del Lavoro',
      situation: 'Un collega collassa improvvisamente alla scrivania. Non risponde alla chiamata e allo scuotimento delle spalle.',
      question: 'Dopo aver verificato che non è cosciente, cosa fai?',
      options: [
        { text: 'Lo metto in posizione laterale di sicurezza', isCorrect: false, feedback: 'Prima devi verificare se respira. La PLS è per chi è incosciente MA respira.' },
        { text: 'Chiamo aiuto, faccio chiamare il 112 e portare il DAE, poi verifico il respiro', isCorrect: true, feedback: 'Corretto! Dopo aver verificato l\'incoscienza: chiamata al 112, DAE, e valutazione del respiro (GAS per 10 secondi).' },
        { text: 'Gli lancio acqua in faccia per svegliarlo', isCorrect: false, feedback: 'Non è il modo corretto di gestire un\'emergenza. Segui il protocollo BLS.' },
        { text: 'Aspetto qualche minuto per vedere se si riprende', isCorrect: false, feedback: 'Ogni secondo conta in un arresto cardiaco. L\'intervento deve essere immediato.' }
      ]
    }
  ]
};
