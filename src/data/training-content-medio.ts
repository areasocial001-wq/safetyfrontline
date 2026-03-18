// Formazione Specifica - Rischio MEDIO (8 ore)
// Settori: Agricoltura, Pesca, PA, Trasporti, Magazzinaggio

import { ModuleContent } from './training-content';

export const moduloRM1Content: ModuleContent = {
  moduleId: 'rm_rischi_meccanici',
  sections: [
    {
      id: 'rm1_intro',
      title: 'Rischi Meccanici: Attrezzature e Macchinari',
      type: 'lesson',
      content: `I rischi meccanici derivano dall'uso di macchine, attrezzature e utensili. Sono tra le principali cause di infortunio sul lavoro.

**⚙️ Tipologie di rischio meccanico:**
- **Schiacciamento:** tra parti mobili o tra parte mobile e fissa
- **Taglio/Cesoiamento:** lame, frese, seghe, cesoie
- **Trascinamento/Intrappolamento:** cinghie, ingranaggi, rulli
- **Proiezione di materiali:** schegge, trucioli, polveri
- **Urto/Impatto:** parti mobili, caduta di materiali dall'alto

**🛡️ Dispositivi di protezione delle macchine:**
- **Ripari fissi:** carter, coperture imbullonate
- **Ripari mobili interbloccati:** si aprono ma fermano la macchina
- **Dispositivi di rilevamento:** barriere fotoelettriche, tappeti sensibili
- **Comandi a due mani:** richiedono entrambe le mani lontano dalla zona pericolosa
- **Pulsante di emergenza:** fungo rosso su sfondo giallo, sempre accessibile

**⚠️ Regola d'oro:** MAI rimuovere o modificare le protezioni delle macchine. È un reato (art. 20 D.Lgs 81/08).`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rm1_quiz',
      title: 'Verifica: Rischi Meccanici',
      type: 'quiz',
      questions: [
        {
          id: 'rm1_q1',
          question: 'Un riparo mobile interbloccato ha quale funzione?',
          options: ['Decorativa', 'Ferma la macchina quando viene aperto', 'Velocizza la produzione', 'Riduce il rumore'],
          correctIndex: 1,
          explanation: 'Un riparo interbloccato è collegato a un microinterruttore: quando si apre il riparo, la macchina si ferma automaticamente.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'rm1_q2',
          question: 'Il pulsante di emergenza deve essere:',
          options: ['Nascosto per evitare attivazioni accidentali', 'A fungo rosso su sfondo giallo, sempre accessibile', 'Blu e posizionato in alto', 'Attivabile solo con chiave'],
          correctIndex: 1,
          explanation: 'Il pulsante di emergenza deve essere a fungo rosso su sfondo giallo, ben visibile e sempre raggiungibile dall\'operatore.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rm1_scenario',
      title: '🎮 Ispezione Macchinari 3D',
      type: 'scenario_3d',
      content: 'Ispeziona il reparto produttivo e identifica le macchine con protezioni mancanti o danneggiate.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'rm1_boss_test',
      title: '🏆 Test Finale - Rischi Meccanici',
      type: 'boss_test',
      questions: [
        {
          id: 'rm1_boss1',
          question: 'Un lavoratore rimuove il carter di una pressa per "lavorare più velocemente". Questo è:',
          options: ['Consentito se il preposto è d\'accordo', 'Un reato punibile con sanzioni penali', 'Ammesso in casi di urgenza', 'Corretto se l\'operatore è esperto'],
          correctIndex: 1,
          explanation: 'Rimuovere le protezioni è un reato (art. 20 D.Lgs 81/08). Il lavoratore rischia arresto o ammenda e l\'azienda sanzioni pesanti.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rm1_boss2',
          question: 'Le barriere fotoelettriche proteggono da:',
          options: ['Rumore', 'Accesso alla zona pericolosa fermando la macchina', 'Polveri', 'Vibrazioni'],
          correctIndex: 1,
          explanation: 'Le barriere fotoelettriche rilevano la presenza di un corpo (mano, braccio) nella zona pericolosa e fermano immediatamente la macchina.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rm1_boss3',
          question: 'Prima di effettuare manutenzione su una macchina, bisogna:',
          options: ['Solo avvisare i colleghi', 'Applicare la procedura LOTO (Lock Out/Tag Out)', 'Rallentare la macchina', 'Indossare guanti pesanti'],
          correctIndex: 1,
          explanation: 'La procedura LOTO (blocco e segnalazione) garantisce che la macchina non possa essere riavviata accidentalmente durante la manutenzione.',
          xpReward: 40,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const moduloRM2Content: ModuleContent = {
  moduleId: 'rm_movimentazione',
  sections: [
    {
      id: 'rm2_intro',
      title: 'Movimentazione Manuale dei Carichi',
      type: 'lesson',
      content: `La Movimentazione Manuale dei Carichi (MMC) è una delle cause più frequenti di patologie dorso-lombari.

**📦 Definizione (art. 167 D.Lgs 81/08):**
Operazioni di trasporto o sostegno di un carico, inclusi: sollevamento, deposito, spinta, traino, spostamento.

**🏋️ Limiti di peso raccomandati (ISO 11228):**
- Uomini: max **25 kg** in condizioni ideali
- Donne: max **15 kg** in condizioni ideali
- Adolescenti: limiti inferiori

**📐 Metodo NIOSH per il sollevamento:**
Peso Limite Raccomandato = LC × HM × VM × DM × AM × FM × CM
Dove LC = 23 kg (costante di carico)

**✅ Tecnica corretta di sollevamento:**
1. Piedi alla larghezza delle spalle, vicino al carico
2. Piegare le GINOCCHIA (non la schiena!)
3. Presa salda con entrambe le mani
4. Schiena dritta, utilizzare la forza delle gambe
5. Carico vicino al corpo
6. Evitare torsioni del tronco
7. Movimenti fluidi, mai a scatti`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rm2_interactive',
      title: '🎮 Solleva Correttamente',
      type: 'interactive',
      content: 'Valuta se le tecniche di sollevamento mostrate sono corrette.',
      questions: [
        {
          id: 'rm2_q1',
          question: 'Un magazziniere solleva una scatola da 20 kg piegando la schiena in avanti con le gambe diritte. È corretto?',
          options: ['Sì, è il modo più veloce', 'No, deve piegare le ginocchia e tenere la schiena dritta', 'Sì, se il carico è leggero', 'Solo se ha la cintura lombare'],
          correctIndex: 1,
          explanation: 'Piegare la schiena con gambe diritte carica tutto il peso sulla colonna vertebrale. La tecnica corretta è piegare le ginocchia e usare la forza delle gambe.',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'rm2_q2',
          question: 'Un operaio deve spostare una cassa pesante 35 kg. Cosa deve fare?',
          options: ['Sollevarla da solo con tecnica corretta', 'Chiedere aiuto a un collega o usare un ausilio meccanico', 'Trascinare la cassa sul pavimento', 'Aspettare il turno successivo'],
          correctIndex: 1,
          explanation: 'Il peso massimo raccomandato è 25 kg per uomini. Per 35 kg serve aiuto di un collega o un ausilio meccanico (transpallet, carrello).',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 20,
    },
    {
      id: 'rm2_scenario',
      title: '🎮 Magazzino 3D - Gestisci i Carichi',
      type: 'scenario_3d',
      content: 'Nel magazzino 3D, identifica le situazioni di rischio nella movimentazione dei carichi e scegli le azioni corrette.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'rm2_boss_test',
      title: '🏆 Test Finale - MMC',
      type: 'boss_test',
      questions: [
        {
          id: 'rm2_boss1',
          question: 'Il peso massimo raccomandato per uomini adulti in condizioni ideali è:',
          options: ['15 kg', '25 kg', '35 kg', '50 kg'],
          correctIndex: 1,
          explanation: 'Secondo la norma ISO 11228, il limite è 25 kg per uomini in condizioni ideali. In condizioni non ideali il limite è inferiore.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rm2_boss2',
          question: 'La principale patologia da MMC scorretta è:',
          options: ['Tunnel carpale', 'Ernia del disco lombare', 'Astenopia', 'Ipoacusia'],
          correctIndex: 1,
          explanation: 'L\'ernia del disco lombare è la patologia più frequente da movimentazione scorretta, insieme a lombalgia e discopatia.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rm2_boss3',
          question: 'Durante il sollevamento, il carico deve essere tenuto:',
          options: ['A braccia tese lontano dal corpo', 'Vicino al corpo, all\'altezza del bacino', 'Sopra la testa', 'A lato del corpo con una mano'],
          correctIndex: 1,
          explanation: 'Il carico vicino al corpo riduce enormemente la sollecitazione sulla colonna vertebrale (momento flettente minimo).',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const moduloRM3Content: ModuleContent = {
  moduleId: 'rm_rischio_elettrico',
  sections: [
    {
      id: 'rm3_intro',
      title: 'Rischio Elettrico Avanzato',
      type: 'lesson',
      content: `Nei settori a rischio medio, i lavoratori possono trovarsi a operare in prossimità di impianti elettrici o a utilizzare attrezzature elettriche in condizioni non standard.

**🔌 Figure professionali (CEI 11-27):**
- **PES (Persona Esperta):** conosce la teoria e la pratica elettrica, ha esperienza specifica
- **PAV (Persona Avvertita):** formata e informata sui rischi elettrici, opera sotto supervisione PES
- **PEI (Persona Idonea):** PAV o PES con qualifica per lavori sotto tensione
- **PEC (Persona Comune):** senza formazione specifica - NON può operare su impianti

**⚡ Zone di lavoro elettrico:**
- **Zona di lavoro sotto tensione:** a contatto diretto con parti attive
- **Zona di lavoro in prossimità:** vicino a parti in tensione (distanze minime definite)
- **Zona di lavoro fuori tensione:** impianto sezionato, bloccato e verificato

**🔒 Procedura 5 regole d'oro (lavori fuori tensione):**
1. Sezionare (aprire l'interruttore)
2. Bloccare contro la richiusura (LOTO)
3. Verificare l'assenza di tensione
4. Mettere a terra e in cortocircuito
5. Delimitare la zona di lavoro`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rm3_quiz',
      title: 'Verifica: Sicurezza Elettrica',
      type: 'quiz',
      questions: [
        {
          id: 'rm3_q1',
          question: 'Una PEC (Persona Comune) può effettuare lavori elettrici?',
          options: ['Sì, con guanti isolanti', 'No, solo PES, PAV o PEI possono operare', 'Sì, se autorizzata dal DL', 'Solo in caso di emergenza'],
          correctIndex: 1,
          explanation: 'Una PEC non ha formazione elettrica e NON può operare su impianti. Solo PES, PAV e PEI sono qualificati secondo la CEI 11-27.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 20,
      xpReward: 10,
    },
    {
      id: 'rm3_boss_test',
      title: '🏆 Test Finale - Rischio Elettrico Avanzato',
      type: 'boss_test',
      questions: [
        {
          id: 'rm3_boss1',
          question: 'Qual è la prima delle 5 regole d\'oro per lavori fuori tensione?',
          options: ['Verificare l\'assenza di tensione', 'Sezionare l\'impianto', 'Mettere a terra', 'Delimitare la zona'],
          correctIndex: 1,
          explanation: 'La prima regola è sezionare (aprire l\'interruttore per interrompere l\'alimentazione). Solo dopo si blocca, verifica, mette a terra e delimita.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rm3_boss2',
          question: 'La sigla LOTO significa:',
          options: ['Lock Out/Tag Out', 'Light On/Turn Off', 'Low Output/Test On', 'Label Out/Take Over'],
          correctIndex: 0,
          explanation: 'LOTO = Lock Out/Tag Out, procedura di blocco e segnalazione per impedire il riavvio accidentale durante manutenzione.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rm3_boss3',
          question: 'La differenza tra PES e PAV è:',
          options: ['Non c\'è differenza', 'La PES ha esperienza e conoscenza autonoma, la PAV opera sotto supervisione', 'La PAV è più qualificata della PES', 'La PES è solo teorica'],
          correctIndex: 1,
          explanation: 'La PES ha conoscenza ed esperienza per lavorare autonomamente. La PAV è formata ma opera sotto la supervisione di una PES.',
          xpReward: 35,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const moduloRM4Content: ModuleContent = {
  moduleId: 'rm_agenti_fisici',
  sections: [
    {
      id: 'rm4_intro',
      title: 'Agenti Fisici: Rumore e Vibrazioni',
      type: 'lesson',
      content: `Gli agenti fisici (Titolo VIII D.Lgs 81/08) comprendono rumore, vibrazioni, campi elettromagnetici e radiazioni ottiche artificiali.

**🔊 Rumore:**
Il rumore è un suono indesiderato che può causare danni all'udito.

| Livello | dB(A) | Effetti |
|---------|-------|---------|
| Ufficio silenzioso | 40 | Nessuno |
| Conversazione | 60 | Nessuno |
| Traffico intenso | 80 | Soglia d'azione |
| Martello pneumatico | 100 | Danno se prolungato |
| Motore a reazione | 140 | Danno immediato |

**Valori limite (D.Lgs 81/08):**
- **80 dB(A):** Informazione + DPI a disposizione
- **85 dB(A):** Obbligo DPI + sorveglianza sanitaria
- **87 dB(A):** Valore limite di esposizione (mai superabile)

**📳 Vibrazioni:**
- **Mano-braccio (HAV):** da utensili vibranti → sindrome da vibrazioni, Raynaud
- **Corpo intero (WBV):** da mezzi di trasporto → lombalgie, ernie

La sordità professionale (ipoacusia) è la malattia professionale più diffusa in Italia.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rm4_quiz',
      title: 'Verifica: Agenti Fisici',
      type: 'quiz',
      questions: [
        {
          id: 'rm4_q1',
          question: 'A partire da quale livello di esposizione al rumore sono obbligatori i DPI uditivi?',
          options: ['70 dB(A)', '80 dB(A)', '85 dB(A)', '90 dB(A)'],
          correctIndex: 2,
          explanation: 'A 85 dB(A) i DPI uditivi sono OBBLIGATORI. A 80 dB(A) devono essere messi a disposizione ma non sono obbligatori.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'rm4_q2',
          question: 'La sindrome di Raynaud è causata da:',
          options: ['Esposizione al rumore', 'Vibrazioni mano-braccio', 'Radiazioni UV', 'Stress termico'],
          correctIndex: 1,
          explanation: 'La sindrome di Raynaud (dita bianche) è causata da vibrazioni mano-braccio trasmesse da utensili vibranti come martelli pneumatici.',
          xpReward: 25,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rm4_boss_test',
      title: '🏆 Test Finale - Agenti Fisici',
      type: 'boss_test',
      questions: [
        {
          id: 'rm4_boss1',
          question: 'Il valore limite di esposizione al rumore che non deve MAI essere superato è:',
          options: ['80 dB(A)', '85 dB(A)', '87 dB(A)', '90 dB(A)'],
          correctIndex: 2,
          explanation: '87 dB(A) è il valore limite assoluto che non deve mai essere superato, tenendo conto dell\'attenuazione dei DPI.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rm4_boss2',
          question: 'Le vibrazioni "corpo intero" derivano principalmente da:',
          options: ['Uso del computer', 'Guida di mezzi e veicoli', 'Uso del telefono', 'Lavoro in piedi'],
          correctIndex: 1,
          explanation: 'Le vibrazioni WBV (corpo intero) sono trasmesse attraverso il sedile di mezzi di trasporto (trattori, muletti, autobus).',
          xpReward: 30,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRM5Content: ModuleContent = {
  moduleId: 'rm_sostanze_pericolose',
  sections: [
    {
      id: 'rm5_intro',
      title: 'Sostanze Pericolose e Classificazione CLP',
      type: 'lesson',
      content: `Il Regolamento CLP (CE 1272/2008) armonizza la classificazione, l'etichettatura e l'imballaggio delle sostanze chimiche.

**⚠️ Pittogrammi GHS/CLP (rombo rosso su bianco):**
- 🔥 **GHS02 - Fiamma:** Infiammabile
- 💀 **GHS06 - Teschio:** Tossicità acuta
- ⚠️ **GHS07 - Punto esclamativo:** Irritante, sensibilizzante
- 🫁 **GHS08 - Pericolo per la salute:** Cancerogeno, mutageno
- 🐟 **GHS09 - Ambiente:** Pericoloso per l'ambiente acquatico
- 💣 **GHS01 - Bomba che esplode:** Esplosivo
- 🧪 **GHS05 - Corrosione:** Corrosivo

**📋 Scheda di Sicurezza (SDS):**
Documento obbligatorio con 16 sezioni che descrive:
- Identificazione della sostanza
- Pericoli, composizione
- Misure di primo soccorso
- Misure antincendio
- Manipolazione e stoccaggio
- DPI necessari
- Limiti di esposizione

**Ogni lavoratore che maneggia sostanze chimiche DEVE conoscere la SDS.**`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rm5_quiz',
      title: 'Verifica: Sostanze Pericolose',
      type: 'quiz',
      questions: [
        {
          id: 'rm5_q1',
          question: 'Il pittogramma con il teschio e le ossa incrociate (GHS06) indica:',
          options: ['Sostanza irritante', 'Tossicità acuta grave', 'Infiammabilità', 'Pericolo ambientale'],
          correctIndex: 1,
          explanation: 'Il GHS06 (teschio) indica tossicità acuta di categoria 1-3: la sostanza può causare morte o gravi danni anche in piccole quantità.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 20,
      xpReward: 10,
    },
    {
      id: 'rm5_boss_test',
      title: '🏆 Test Finale - Sostanze Pericolose',
      type: 'boss_test',
      questions: [
        {
          id: 'rm5_boss1',
          question: 'Quante sezioni ha la Scheda di Sicurezza (SDS)?',
          options: ['8', '12', '16', '20'],
          correctIndex: 2,
          explanation: 'La SDS è composta da 16 sezioni obbligatorie, dalla identificazione alla informazioni sul trasporto e regolamentazione.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rm5_boss2',
          question: 'Come devono essere stoccate le sostanze infiammabili?',
          options: ['Vicino a fonti di calore per evitare il congelamento', 'In armadi ventilati e resistenti al fuoco, lontano da fonti di innesco', 'In qualsiasi magazzino chiuso', 'All\'aperto senza protezione'],
          correctIndex: 1,
          explanation: 'Le sostanze infiammabili devono essere stoccate in armadi omologati, ventilati, resistenti al fuoco e lontano da qualsiasi fonte di innesco.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRM6Content: ModuleContent = {
  moduleId: 'rm_cadute_alto',
  sections: [
    {
      id: 'rm6_intro',
      title: 'Cadute dall\'Alto e Lavori in Quota',
      type: 'lesson',
      content: `Le cadute dall'alto sono la prima causa di morte sul lavoro in Italia. Si definisce "lavoro in quota" qualsiasi attività a un'altezza superiore a **2 metri** dal piano stabile.

**🏗️ Sistemi di protezione COLLETTIVA (prioritari):**
- **Parapetti:** altezza min 1 metro, con corrente intermedio e fascia fermapiede
- **Reti di sicurezza:** sotto il piano di lavoro
- **Ponteggi:** strutture temporanee regolamentate
- **Impalcati:** piani di lavoro provvisori

**🧷 Sistemi di protezione INDIVIDUALE (DPI III Cat.):**
- **Imbracatura anticaduta:** distribuzione forze su anche, spalle, torace
- **Cordino con assorbitore di energia:** limita la forza di arresto a max 6 kN
- **Dispositivo retrattile:** cordino automatico che si blocca in caso di caduta
- **Linea vita:** cavo o rotaia a cui ancorare il cordino

**⚠️ Regole fondamentali:**
1. Le protezioni collettive hanno SEMPRE la priorità sui DPI
2. I DPI anticaduta sono di Categoria III: obbligo di addestramento
3. Il tirante d'aria (spazio libero sotto) deve essere verificato
4. Ispezione DPI prima di ogni utilizzo`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rm6_scenario',
      title: '🎮 Cantiere in Quota 3D',
      type: 'scenario_3d',
      content: 'Ispeziona il cantiere e identifica le situazioni di pericolo per cadute dall\'alto. Verifica parapetti, reti e DPI.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'rm6_boss_test',
      title: '🏆 Test Finale - Cadute dall\'Alto',
      type: 'boss_test',
      questions: [
        {
          id: 'rm6_boss1',
          question: 'Si definisce "lavoro in quota" quando l\'altezza supera:',
          options: ['1 metro', '2 metri', '3 metri', '5 metri'],
          correctIndex: 1,
          explanation: 'L\'art. 107 del D.Lgs 81/08 definisce lavoro in quota qualsiasi attività a più di 2 metri di altezza dal piano stabile.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rm6_boss2',
          question: 'I DPI anticaduta sono di quale categoria?',
          options: ['Categoria I', 'Categoria II', 'Categoria III', 'Non sono categorizzati'],
          correctIndex: 2,
          explanation: 'I DPI anticaduta proteggono da rischi mortali, quindi rientrano nella Categoria III. Richiedono addestramento specifico obbligatorio.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rm6_boss3',
          question: 'Nella gerarchia delle protezioni anticaduta, cosa ha priorità?',
          options: ['Imbracatura individuale', 'Protezioni collettive (parapetti, reti)', 'Formazione del lavoratore', 'Segnaletica di pericolo'],
          correctIndex: 1,
          explanation: 'Le protezioni collettive hanno SEMPRE priorità sui DPI individuali, come stabilito dalla gerarchia delle misure di prevenzione.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const moduloRM7Content: ModuleContent = {
  moduleId: 'rm_incendio',
  sections: [
    {
      id: 'rm7_intro',
      title: 'Rischio Incendio e Prevenzione',
      type: 'lesson',
      content: `L'incendio è una combustione che avviene in modo incontrollato. Per bruciare servono 3 elementi (triangolo del fuoco):

**🔺 Triangolo del Fuoco:**
1. **Combustibile:** materiale che brucia (legno, carta, gas, liquidi)
2. **Comburente:** ossigeno dell'aria
3. **Fonte di innesco:** scintilla, fiamma, calore

Eliminando uno dei tre elementi, l'incendio si spegne.

**🔥 Classi di incendio e estinguenti:**
| Classe | Materiale | Estinguente |
|--------|-----------|-------------|
| A | Solidi (legno, carta) | Acqua, schiuma, polvere |
| B | Liquidi (benzina, vernici) | Schiuma, CO₂, polvere |
| C | Gas (metano, GPL) | Polvere, CO₂ |
| D | Metalli (magnesio, alluminio) | Polveri speciali |
| F | Oli da cucina | Schiuma wet chemical |

**⚡ Incendi elettrici:** SEMPRE usare CO₂ o polvere. MAI acqua!

**🧯 Uso dell'estintore (tecnica P.A.S.S.):**
- **P**ull - Tirare la spina di sicurezza
- **A**im - Puntare alla base delle fiamme
- **S**queeze - Premere la leva
- **S**weep - Muovere a ventaglio`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rm7_scenario',
      title: '🎮 Emergenza Incendio 3D',
      type: 'scenario_3d',
      content: 'Un incendio si è sviluppato nel reparto! Identifica la classe di fuoco, scegli l\'estintore giusto e gestisci l\'evacuazione.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'rm7_boss_test',
      title: '🏆 Test Finale - Rischio Incendio',
      type: 'boss_test',
      questions: [
        {
          id: 'rm7_boss1',
          question: 'Per spegnere un incendio di classe B (liquidi) si usa:',
          options: ['Solo acqua a getto pieno', 'Schiuma, CO₂ o polvere', 'Sabbia bagnata', 'Solo coperta antifiamma'],
          correctIndex: 1,
          explanation: 'Per incendi di classe B (liquidi infiammabili) si usano schiuma, CO₂ o polvere. L\'acqua a getto pieno potrebbe spargere il liquido.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rm7_boss2',
          question: 'Su un incendio elettrico, quale estinguente NON si deve MAI usare?',
          options: ['CO₂', 'Polvere ABC', 'Acqua', 'Tutti vanno bene'],
          correctIndex: 2,
          explanation: 'L\'acqua è conduttrice di elettricità: usarla su un incendio elettrico causa rischio di folgorazione. Usare CO₂ o polvere.',
          xpReward: 35,
          difficulty: 'easy',
        },
        {
          id: 'rm7_boss3',
          question: 'L\'estintore va puntato:',
          options: ['Verso la parte alta delle fiamme', 'Alla base delle fiamme', 'Verso il fumo', 'Non importa dove'],
          correctIndex: 1,
          explanation: 'L\'estintore va sempre puntato alla BASE delle fiamme, dove avviene la combustione. Puntare in alto è inutile.',
          xpReward: 30,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const moduloRM8Content: ModuleContent = {
  moduleId: 'rm_primo_soccorso',
  sections: [
    {
      id: 'rm8_intro',
      title: 'Primo Soccorso Aziendale',
      type: 'lesson',
      content: `Il Primo Soccorso aziendale è regolato dal DM 388/2003 che classifica le aziende in tre gruppi (A, B, C) e definisce i requisiti degli addetti.

**🚑 La Catena della Sopravvivenza:**
1. **Riconoscimento** dell'emergenza e chiamata al 118/112
2. **BLS** (Basic Life Support) - RCP precoce
3. **Defibrillazione** precoce (DAE)
4. **Soccorso avanzato** (ambulanza)

**📞 Chiamata al 118 - Cosa comunicare:**
- CHI sei e da DOVE chiami
- COSA è successo
- QUANTE persone sono coinvolte
- CONDIZIONI degli infortunati
- NON riattaccare finché l'operatore non lo autorizza

**🩹 Interventi base (NON medici):**
- **Emorragia esterna:** compressione diretta con garza sterile
- **Frattura:** NON muovere l'arto, immobilizzare
- **Ustione:** raffreddare con acqua corrente per 15-20 minuti
- **Svenimento:** posizione supina con gambe rialzate
- **Shock:** posizione anti-shock (gambe elevate), coprire

**⛔ Cosa NON fare MAI:**
- NON somministrare farmaci
- NON dare da bere a un traumatizzato
- NON rimuovere oggetti conficcati
- NON spostare un traumatizzato spinale`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rm8_interactive',
      title: '🎮 Gestisci l\'Emergenza',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Operatore 118', role: 'Centralino', text: 'Pronto, 118. Mi dica cosa è successo, dove si trova e quante persone sono coinvolte. Resti in linea.' },
        { speaker: 'Addetto PS', role: 'Primo Soccorso', text: 'Sono l\'addetto al primo soccorso. Un collega è caduto dalla scala ed è a terra. Non muove le gambe. NON lo spostiamo finché non arriva il 118. Proteggete la zona.' },
      ],
      questions: [
        {
          id: 'rm8_q1',
          question: 'Un collega ha una profonda ferita al braccio che sanguina copiosamente. Cosa fai PRIMA di tutto?',
          options: ['Cerchi un laccio emostatico', 'Applichi compressione diretta con garza sterile sulla ferita', 'Lo porti al pronto soccorso in auto', 'Metti l\'alcol sulla ferita'],
          correctIndex: 1,
          explanation: 'La compressione diretta è il primo intervento per emorragie esterne. Il laccio emostatico è l\'ultima risorsa e richiede formazione specifica.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 20,
    },
    {
      id: 'rm8_boss_test',
      title: '🏆 Test Finale - Primo Soccorso',
      type: 'boss_test',
      questions: [
        {
          id: 'rm8_boss1',
          question: 'Un infortunato è cosciente ma in stato di shock. La posizione corretta è:',
          options: ['Seduto', 'Supino con gambe rialzate (anti-shock)', 'In piedi per favorire la circolazione', 'A pancia in giù'],
          correctIndex: 1,
          explanation: 'La posizione anti-shock (Trendelenburg) prevede il paziente supino con gambe rialzate per favorire l\'afflusso di sangue agli organi vitali.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rm8_boss2',
          question: 'Un oggetto è conficcato nella gamba di un collega. Cosa fai?',
          options: ['Lo rimuovi delicatamente', 'Lo lasci in sede e stabilizzi la zona intorno', 'Lo spingi più in profondità per fermarlo', 'Metti un laccio sopra la ferita'],
          correctIndex: 1,
          explanation: 'Gli oggetti conficcati NON vanno MAI rimossi: potrebbero tamponare un\'emorragia interna. Si stabilizzano in posizione e si attende il 118.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rm8_boss3',
          question: 'L\'addetto al primo soccorso può somministrare farmaci?',
          options: ['Sì, antidolorifici comuni', 'Sì, se il lavoratore lo chiede', 'No, mai', 'Solo aspirina'],
          correctIndex: 2,
          explanation: 'L\'addetto al primo soccorso NON è un medico e NON può mai somministrare farmaci. Può solo prestare le prime cure e attivare la catena del soccorso.',
          xpReward: 30,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const rischioMedioContents = [
  moduloRM1Content, moduloRM2Content, moduloRM3Content, moduloRM4Content,
  moduloRM5Content, moduloRM6Content, moduloRM7Content, moduloRM8Content,
];
