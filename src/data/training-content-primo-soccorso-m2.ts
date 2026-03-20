import type { ModuleContent } from './training-content';

export const primoSoccorsoInterventoContent: ModuleContent = {
  moduleId: 'primo_soccorso_intervento',
  sections: [
    {
      id: 'ps2_emergency_recognition',
      title: 'Riconoscere un\'Emergenza Sanitaria',
      type: 'lesson',
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
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps2_quiz_recognition',
      title: 'Verifica: Riconoscere l\'Emergenza',
      type: 'quiz',
      questions: [
        {
          id: 'ps2_q1',
          question: 'La lettera "A" nella valutazione ABCDE sta per:',
          options: ['Assessment', 'Airway (vie aeree)', 'Alert (allarme)', 'Ambulance'],
          correctIndex: 1,
          explanation: 'A = Airway, ovvero la verifica che le vie aeree siano libere e pervie.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps2_bls_procedure',
      title: 'BLS — Supporto Vitale di Base',
      type: 'lesson',
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
      minTimeSeconds: 90,
      xpReward: 25,
    },
    {
      id: 'ps2_quiz_bls',
      title: 'Verifica: BLS',
      type: 'quiz',
      questions: [
        {
          id: 'ps2_q2',
          question: 'Qual è il rapporto compressioni/ventilazioni nel BLS?',
          options: ['15:2', '30:2', '15:1', '5:1'],
          correctIndex: 1,
          explanation: 'Il rapporto standard è 30 compressioni toraciche seguite da 2 ventilazioni.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ps2_q2b',
          question: 'La frequenza delle compressioni nel BLS è:',
          options: ['60-80/min', '80-100/min', '100-120/min', '120-140/min'],
          correctIndex: 2,
          explanation: 'Le compressioni devono essere eseguite a una frequenza di 100-120 al minuto.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps2_dae_usage',
      title: 'Uso del DAE (Defibrillatore)',
      type: 'lesson',
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
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ps2_quiz_dae',
      title: 'Verifica: DAE',
      type: 'quiz',
      questions: [
        {
          id: 'ps2_q3',
          question: 'Il DAE può essere usato da:',
          options: ['Solo medici', 'Solo infermieri', 'Anche personale non sanitario formato', 'Solo i VVF'],
          correctIndex: 2,
          explanation: 'La Legge 116/2021 consente l\'uso del DAE anche a personale non sanitario.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps2_recovery_position',
      title: 'Posizione Laterale di Sicurezza',
      type: 'lesson',
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
- Fratture evidenti degli arti coinvolti`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps2_quiz_pls',
      title: 'Verifica: PLS',
      type: 'quiz',
      questions: [
        {
          id: 'ps2_q4',
          question: 'La PLS si usa quando la vittima è:',
          options: ['Cosciente e sta bene', 'Incosciente ma respira', 'In arresto cardiaco', 'Con trauma spinale'],
          correctIndex: 1,
          explanation: 'La PLS si applica a persone incoscienti che respirano autonomamente.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ps2_q4b',
          question: 'La PLS è controindicata in caso di:',
          options: ['Svenimento', 'Sospetto trauma spinale', 'Persona che russa', 'Crisi epilettica finita'],
          correctIndex: 1,
          explanation: 'In caso di sospetto trauma spinale non si deve muovere la vittima.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps2_choking',
      title: 'Ostruzione delle Vie Aeree',
      type: 'lesson',
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

**Vittima obesa o in gravidanza:**
- Compressioni toraciche anziché addominali`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps2_quiz_choking',
      title: 'Verifica: Ostruzione Vie Aeree',
      type: 'quiz',
      questions: [
        {
          id: 'ps2_q5',
          question: 'Se una persona sta tossendo energicamente per un corpo estraneo, devi:',
          options: ['Fare subito la manovra di Heimlich', 'Dare 5 pacche sulla schiena', 'Incoraggiarla a continuare a tossire', 'Farla sdraiare'],
          correctIndex: 2,
          explanation: 'Se la vittima tossisce efficacemente, il colpo di tosse è il meccanismo più efficace per espellere il corpo estraneo.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ps2_q5b',
          question: 'La manovra di Heimlich si esegue con compressioni:',
          options: ['Sul torace', 'Sull\'addome, sopra l\'ombelico', 'Sulla schiena', 'Sul collo'],
          correctIndex: 1,
          explanation: 'La manovra di Heimlich prevede compressioni addominali sopra l\'ombelico e sotto lo sterno.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps2_npc_scenario',
      title: '💬 Scenario: Arresto Cardiaco in Ufficio',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Dott. Martini', role: 'Medico del Lavoro', text: 'Un collega collassa improvvisamente alla scrivania. Non risponde alla chiamata e allo scuotimento delle spalle. Cosa fai?' },
      ],
      questions: [
        {
          id: 'ps2_npc1',
          question: 'Dopo aver verificato che non è cosciente, cosa fai?',
          options: [
            'Lo metto in posizione laterale di sicurezza',
            'Chiamo aiuto, faccio chiamare il 112 e portare il DAE, poi verifico il respiro',
            'Gli lancio acqua in faccia per svegliarlo',
            'Aspetto qualche minuto per vedere se si riprende',
          ],
          correctIndex: 1,
          explanation: 'Dopo aver verificato l\'incoscienza: chiamata al 112, DAE, e valutazione del respiro (GAS per 10 secondi).',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 20,
    },
    {
      id: 'ps2_boss_test',
      title: '🏆 Test Finale — Riconoscere e Intervenire',
      type: 'boss_test',
      questions: [
        {
          id: 'ps2_boss1',
          question: 'Nel BLS la profondità delle compressioni toraciche deve essere:',
          options: ['2-3 cm', '5-6 cm', '8-10 cm', '1-2 cm'],
          correctIndex: 1,
          explanation: 'Le compressioni devono raggiungere una profondità di 5-6 cm.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ps2_boss2',
          question: 'La PLS è controindicata in caso di:',
          options: ['Svenimento', 'Sospetto trauma spinale', 'Persona che russa', 'Crisi epilettica finita'],
          correctIndex: 1,
          explanation: 'In caso di sospetto trauma spinale la vittima non va mossa.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'ps2_boss3',
          question: 'La frequenza delle compressioni nel BLS è:',
          options: ['60-80/min', '80-100/min', '100-120/min', '120-140/min'],
          correctIndex: 2,
          explanation: 'Frequenza raccomandata: 100-120 compressioni al minuto.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ps2_boss4',
          question: 'La manovra di Heimlich si esegue con compressioni:',
          options: ['Sul torace', 'Sull\'addome, sopra l\'ombelico', 'Sulla schiena', 'Sul collo'],
          correctIndex: 1,
          explanation: 'Le compressioni addominali sub-diaframmatiche permettono di espellere il corpo estraneo.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ps2_boss5',
          question: 'Il DAE analizza il ritmo cardiaco. Durante l\'analisi:',
          options: ['Continuare le compressioni', 'Non toccare il paziente', 'Ventilare', 'Spostare il paziente'],
          correctIndex: 1,
          explanation: 'Durante l\'analisi del ritmo nessuno deve toccare il paziente per non interferire.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
