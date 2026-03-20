import type { ModuleContent } from './training-content';

export const primoSoccorsoConoscenzeContent: ModuleContent = {
  moduleId: 'primo_soccorso_conoscenze',
  sections: [
    {
      id: 'ps3_wounds',
      title: 'Ferite ed Emorragie',
      type: 'lesson',
      content: `**Tipi di ferite:**
- **Abrasioni**: lesioni superficiali da sfregamento
- **Ferite da taglio**: bordi netti, sanguinamento variabile
- **Ferite lacero-contuse**: bordi irregolari, da impatto
- **Ferite da punta**: profonde e strette (chiodi, punte)
- **Amputazioni**: distacco parziale o totale di un arto

**Gestione delle emorragie esterne:**
1. **Compressione diretta**: premere sulla ferita con garza sterile o panno pulito
2. **Sollevamento dell'arto**: se possibile, alzare sopra il livello del cuore
3. **Bendaggio compressivo**: mantenere la pressione con fasciatura
4. **Laccio emostatico (tourniquet)**: SOLO in caso di emorragia massiva non controllabile

**Regole:**
- Indossare SEMPRE guanti monouso
- NON rimuovere corpi estranei conficcati (stabilizzarli)
- In caso di amputazione: avvolgere la parte in garza umida, in sacchetto di plastica, poi in ghiaccio
- NON applicare lacci improvvisati (cinture, corde)`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps3_quiz_wounds',
      title: 'Verifica: Ferite ed Emorragie',
      type: 'quiz',
      questions: [
        {
          id: 'ps3_q1',
          question: 'In caso di emorragia esterna, la prima manovra è:',
          options: ['Applicare il laccio emostatico', 'Compressione diretta sulla ferita', 'Lavare con acqua', 'Alzare le gambe'],
          correctIndex: 1,
          explanation: 'La compressione diretta è la prima e più efficace manovra per controllare un\'emorragia esterna.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps3_fractures',
      title: 'Fratture, Lussazioni e Distorsioni',
      type: 'lesson',
      content: `**Fratture:**
Interruzione della continuità dell'osso, causata da trauma diretto o indiretto.

**Segni di frattura:**
- Dolore intenso localizzato
- Gonfiore e deformità
- Impossibilità di muovere l'arto
- Crepitio (scricchiolio osseo)
- Eventuale esposizione dell'osso (frattura esposta)

**Cosa fare:**
- Immobilizzare l'arto nella posizione in cui si trova
- NON tentare di riallineare l'osso
- Applicare ghiaccio avvolto in un panno
- In caso di frattura esposta: coprire la ferita con garza sterile

**Lussazioni:**
- Fuoriuscita di un'articolazione dalla sua sede
- NON tentare di rimettere a posto l'articolazione
- Immobilizzare e trasportare in ospedale

**Distorsioni:**
- Stiramento dei legamenti articolari
- Protocollo RICE: Rest, Ice, Compression, Elevation
- Ghiaccio per 15-20 min ogni ora nelle prime 48 ore`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps3_quiz_fractures',
      title: 'Verifica: Fratture',
      type: 'quiz',
      questions: [
        {
          id: 'ps3_q2',
          question: 'In caso di frattura esposta, la priorità è:',
          options: ['Riallineare l\'osso', 'Coprire la ferita con garza sterile e immobilizzare', 'Far camminare l\'infortunato', 'Applicare calore'],
          correctIndex: 1,
          explanation: 'Mai riallineare. Coprire la ferita per prevenire infezioni e immobilizzare l\'arto.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ps3_q2b',
          question: 'Il protocollo RICE per le distorsioni prevede:',
          options: ['Run, Ice, Compress, Eat', 'Rest, Ice, Compression, Elevation', 'Rinse, Inspect, Cover, Elevate', 'React, Immobilize, Call, Evacuate'],
          correctIndex: 1,
          explanation: 'RICE = Rest (riposo), Ice (ghiaccio), Compression (compressione), Elevation (elevazione).',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps3_burns',
      title: 'Ustioni',
      type: 'lesson',
      content: `**Classificazione per profondità:**

| Grado | Aspetto | Dolore | Guarigione |
|-------|---------|--------|------------|
| **1°** | Arrossamento (eritema) | Moderato | 5-7 giorni |
| **2° superficiale** | Vescicole (bolle) | Intenso | 2-3 settimane |
| **2° profondo** | Bolle rotte, rosso/bianco | Variabile | 3-6 settimane |
| **3°** | Escara bianca/nera | Assente | Richiede chirurgia |

**Primo soccorso per ustioni termiche:**
1. Allontanare dalla fonte di calore
2. Raffreddare con acqua corrente tiepida (15-20°C) per 10-20 minuti
3. Rimuovere vestiti NON aderenti alla cute
4. Coprire con teli sterili o puliti
5. NON applicare ghiaccio direttamente
6. NON applicare creme, olio, burro, dentifricio

**Ustioni chimiche:**
- Rimuovere i vestiti contaminati
- Lavare con abbondante acqua corrente per almeno 20 minuti

**Ustioni elettriche:**
- Disconnettere la corrente PRIMA di toccare la vittima
- Possibili lesioni interne non visibili
- Sempre ospedalizzazione`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps3_quiz_burns',
      title: 'Verifica: Ustioni',
      type: 'quiz',
      questions: [
        {
          id: 'ps3_q3',
          question: 'Per quanto tempo va raffreddata un\'ustione con acqua?',
          options: ['1-2 minuti', '5 minuti', '10-20 minuti', '1 ora'],
          correctIndex: 2,
          explanation: 'L\'irrigazione con acqua tiepida per 10-20 minuti riduce il danno tissutale e allevia il dolore.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps3_heat_cold',
      title: 'Colpo di Calore e Ipotermia',
      type: 'lesson',
      content: `**Colpo di calore:**
Emergenza medica grave — la temperatura corporea supera i 40°C.

**Sintomi:**
- Pelle calda, rossa, SECCA (la sudorazione si blocca)
- Confusione mentale, delirio
- Cefalea intensa, nausea
- Perdita di coscienza, convulsioni

**Primo soccorso:**
- Spostare in ambiente fresco e ombreggiato
- Rimuovere vestiti in eccesso
- Raffreddare con panni bagnati su collo, ascelle, inguine
- Far bere acqua fresca a piccoli sorsi (se cosciente)
- Chiamare il 112

**Ipotermia:**
Temperatura corporea sotto i 35°C.

**Primo soccorso:**
- Portare in ambiente caldo
- Rimuovere vestiti bagnati
- Riscaldare GRADUALMENTE (coperte, bevande calde)
- MAI immergere in acqua calda (rischio aritmie)
- MAI dare alcolici`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps3_quiz_heat',
      title: 'Verifica: Colpo di Calore',
      type: 'quiz',
      questions: [
        {
          id: 'ps3_q4',
          question: 'Nel colpo di calore la pelle è:',
          options: ['Fredda e sudata', 'Calda, rossa e secca', 'Pallida e umida', 'Blu e fredda'],
          correctIndex: 1,
          explanation: 'Nel colpo di calore il meccanismo di sudorazione si blocca, la pelle diventa calda, rossa e secca.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps3_poisoning',
      title: 'Intossicazioni e Reazioni Allergiche',
      type: 'lesson',
      content: `**Intossicazioni sul lavoro:**

**Via inalatoria (la più frequente):**
- Allontanare dalla fonte (in sicurezza!)
- Portare all'aria aperta
- Se incosciente: PLS e chiamare 112
- Se arresto respiratorio: BLS

**Via cutanea:**
- Rimuovere vestiti contaminati
- Lavare abbondantemente con acqua
- NON usare solventi per pulire la pelle

**Via ingestione:**
- NON provocare il vomito (rischio doppio danno con corrosivi)
- Conservare il contenitore del prodotto ingerito
- Chiamare il Centro Antiveleni

**Anafilassi (reazione allergica grave):**
Emergenza potenzialmente letale che può verificarsi in pochi minuti.

**Primo soccorso:**
- Chiamare immediatamente il 112
- Far sdraiare con gambe sollevate (se non ha difficoltà respiratorie)
- Se ha autoiniettore di adrenalina: aiutarlo a usarlo
- Se arresto: BLS`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ps3_quiz_poisoning',
      title: 'Verifica: Intossicazioni',
      type: 'quiz',
      questions: [
        {
          id: 'ps3_q5',
          question: 'In caso di ingestione di sostanza corrosiva, devi:',
          options: ['Provocare il vomito', 'NON provocare il vomito e chiamare il Centro Antiveleni', 'Far bere latte', 'Far bere acqua e sale'],
          correctIndex: 1,
          explanation: 'Con sostanze corrosive il vomito causerebbe un secondo passaggio del prodotto nell\'esofago, aggravando le lesioni.',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'ps3_q5b',
          question: 'L\'autoiniettore di adrenalina si usa per:',
          options: ['Arresto cardiaco', 'Fratture', 'Anafilassi grave', 'Ustioni'],
          correctIndex: 2,
          explanation: 'L\'adrenalina è il farmaco salvavita per le reazioni anafilattiche gravi.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ps3_npc_scenario',
      title: '💬 Scenario: Ustione Chimica in Laboratorio',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Dott.ssa Ferretti', role: 'Responsabile Laboratorio', text: 'Un tecnico si è versato acido solforico diluito sull\'avambraccio. Urla dal dolore. Qual è l\'intervento corretto?' },
      ],
      questions: [
        {
          id: 'ps3_npc1',
          question: 'Qual è l\'intervento corretto?',
          options: [
            'Applicare una crema lenitiva sulla zona',
            'Rimuovere i vestiti contaminati e lavare con acqua corrente per almeno 20 minuti',
            'Tamponare con un panno asciutto',
            'Neutralizzare l\'acido con una base',
          ],
          correctIndex: 1,
          explanation: 'Il lavaggio abbondante e prolungato è la priorità per le ustioni chimiche. Mai neutralizzare con una base.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 20,
    },
    {
      id: 'ps3_boss_test',
      title: '🏆 Test Finale — Conoscenze Generali sui Traumi',
      type: 'boss_test',
      questions: [
        {
          id: 'ps3_boss1',
          question: 'La prima manovra per un\'emorragia esterna è:',
          options: ['Laccio emostatico', 'Compressione diretta', 'Elevazione dell\'arto', 'Acqua ossigenata'],
          correctIndex: 1,
          explanation: 'La compressione diretta è sempre la prima manovra.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ps3_boss2',
          question: 'Il protocollo RICE per le distorsioni prevede:',
          options: ['Run, Ice, Compress, Eat', 'Rest, Ice, Compression, Elevation', 'Rinse, Inspect, Cover, Elevate', 'React, Immobilize, Call, Evacuate'],
          correctIndex: 1,
          explanation: 'RICE = Rest, Ice, Compression, Elevation.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'ps3_boss3',
          question: 'Per raffreddare un\'ustione si usa:',
          options: ['Ghiaccio direttamente', 'Acqua corrente tiepida 15-20°C', 'Burro o olio', 'Alcol'],
          correctIndex: 1,
          explanation: 'Acqua corrente tiepida per 10-20 minuti è il trattamento corretto.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ps3_boss4',
          question: 'Nel colpo di calore, la sudorazione è:',
          options: ['Abbondante', 'Assente (pelle secca)', 'Normale', 'Solo sulle mani'],
          correctIndex: 1,
          explanation: 'Nel colpo di calore la sudorazione si blocca: pelle calda, rossa e secca.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ps3_boss5',
          question: 'L\'autoiniettore di adrenalina si usa per:',
          options: ['Arresto cardiaco', 'Fratture', 'Anafilassi grave', 'Ustioni'],
          correctIndex: 2,
          explanation: 'L\'adrenalina è il trattamento d\'elezione per l\'anafilassi grave.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
