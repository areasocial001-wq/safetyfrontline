export const primoSoccorsoConoscenzeContent = {
  moduleId: 'primo_soccorso_conoscenze',
  sections: [
    {
      id: 'wounds_hemorrhages',
      title: 'Ferite ed Emorragie',
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
      duration_minutes: 10,
      quiz: {
        question: 'In caso di emorragia esterna, la prima manovra è:',
        options: ['Applicare il laccio emostatico', 'Compressione diretta sulla ferita', 'Lavare con acqua', 'Alzare le gambe'],
        correct: 1,
        explanation: 'La compressione diretta è la prima e più efficace manovra per controllare un\'emorragia esterna.'
      }
    },
    {
      id: 'fractures_trauma',
      title: 'Fratture, Lussazioni e Distorsioni',
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
      duration_minutes: 8,
      quiz: {
        question: 'In caso di frattura esposta, la priorità è:',
        options: ['Riallineare l\'osso', 'Coprire la ferita con garza sterile e immobilizzare', 'Far camminare l\'infortunato', 'Applicare calore'],
        correct: 1,
        explanation: 'Mai riallineare. Coprire la ferita per prevenire infezioni e immobilizzare l\'arto.'
      }
    },
    {
      id: 'burns',
      title: 'Ustioni',
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
- Consultare la scheda di sicurezza del prodotto

**Ustioni elettriche:**
- Disconnettere la corrente PRIMA di toccare la vittima
- Possibili lesioni interne non visibili
- Sempre ospedalizzazione`,
      duration_minutes: 10,
      quiz: {
        question: 'Per quanto tempo va raffreddata un\'ustione con acqua?',
        options: ['1-2 minuti', '5 minuti', '10-20 minuti', '1 ora'],
        correct: 2,
        explanation: 'L\'irrigazione con acqua tiepida per 10-20 minuti riduce il danno tissutale e allevia il dolore.'
      }
    },
    {
      id: 'heat_cold',
      title: 'Colpo di Calore e Ipotermia',
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

**Sintomi progressivi:**
- Brividi intensi → cessazione dei brividi (segno grave)
- Confusione mentale
- Sonnolenza
- Rallentamento cardiaco e respiratorio

**Primo soccorso:**
- Portare in ambiente caldo
- Rimuovere vestiti bagnati
- Riscaldare GRADUALMENTE (coperte, bevande calde)
- MAI immergere in acqua calda (rischio aritmie)
- MAI dare alcolici`,
      duration_minutes: 8,
      quiz: {
        question: 'Nel colpo di calore la pelle è:',
        options: ['Fredda e sudata', 'Calda, rossa e secca', 'Pallida e umida', 'Blu e fredda'],
        correct: 1,
        explanation: 'Nel colpo di calore il meccanismo di sudorazione si blocca, la pelle diventa calda, rossa e secca.'
      }
    },
    {
      id: 'poisoning_allergies',
      title: 'Intossicazioni e Reazioni Allergiche',
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

**Sintomi:**
- Orticaria diffusa, gonfiore (specialmente viso/gola)
- Difficoltà respiratoria, fischio
- Calo pressorio, tachicardia
- Nausea, vomito

**Primo soccorso:**
- Chiamare immediatamente il 112
- Far sdraiare con gambe sollevate (se non ha difficoltà respiratorie)
- Se ha autoiniettore di adrenalina: aiutarlo a usarlo
- Se arresto: BLS`,
      duration_minutes: 8,
      quiz: {
        question: 'In caso di ingestione di sostanza corrosiva, devi:',
        options: ['Provocare il vomito', 'NON provocare il vomito e chiamare il Centro Antiveleni', 'Far bere latte', 'Far bere acqua e sale'],
        correct: 1,
        explanation: 'Con sostanze corrosive il vomito causerebbe un secondo passaggio del prodotto nell\'esofago, aggravando le lesioni.'
      }
    }
  ],
  bossTest: {
    title: 'Test Finale — Conoscenze Generali sui Traumi',
    questions: [
      { question: 'La prima manovra per un\'emorragia esterna è:', options: ['Laccio emostatico', 'Compressione diretta', 'Elevazione dell\'arto', 'Acqua ossigenata'], correct: 1 },
      { question: 'Il protocollo RICE per le distorsioni prevede:', options: ['Run, Ice, Compress, Eat', 'Rest, Ice, Compression, Elevation', 'Rinse, Inspect, Cover, Elevate', 'React, Immobilize, Call, Evacuate'], correct: 1 },
      { question: 'Per raffreddare un\'ustione si usa:', options: ['Ghiaccio direttamente', 'Acqua corrente tiepida 15-20°C', 'Burro o olio', 'Alcol'], correct: 1 },
      { question: 'Nel colpo di calore, la sudorazione è:', options: ['Abbondante', 'Assente (pelle secca)', 'Normale', 'Solo sulle mani'], correct: 1 },
      { question: 'L\'autoiniettore di adrenalina si usa per:', options: ['Arresto cardiaco', 'Fratture', 'Anafilassi grave', 'Ustioni'], correct: 2 },
    ]
  },
  npcScenarios: [
    {
      id: 'chemical_burn_scenario',
      title: 'Ustione Chimica in Laboratorio',
      npcName: 'Dott.ssa Ferretti',
      npcRole: 'Responsabile Laboratorio',
      situation: 'Un tecnico si è versato acido solforico diluito sull\'avambraccio. Urla dal dolore.',
      question: 'Qual è l\'intervento corretto?',
      options: [
        { text: 'Applicare una crema lenitiva sulla zona', isCorrect: false, feedback: 'Mai applicare creme su ustioni chimiche. Bisogna prima rimuovere il prodotto.' },
        { text: 'Rimuovere i vestiti contaminati e lavare con acqua corrente per almeno 20 minuti', isCorrect: true, feedback: 'Corretto! Il lavaggio abbondante e prolungato è la priorità per le ustioni chimiche.' },
        { text: 'Tamponare con un panno asciutto', isCorrect: false, feedback: 'Tamponare non rimuove la sostanza chimica. Serve lavaggio abbondante con acqua.' },
        { text: 'Neutralizzare l\'acido con una base', isCorrect: false, feedback: 'La reazione acido-base genera calore e può peggiorare l\'ustione. Lavare solo con acqua!' }
      ]
    }
  ]
};
