// Formazione Specifica - Settore Ristorazione (ATECO 55-56)
// Alloggio e ristorazione - Rischio Medio
// Conforme all'Accordo Stato-Regioni e D.Lgs 81/2008

import { ModuleContent } from './training-content';

export const specificaRistorazioneContent: ModuleContent = {
  moduleId: 'ls_ristorazione',
  sections: [
    {
      id: 'ri_intro',
      title: 'Rischi Specifici nel Settore Ristorazione',
      type: 'lesson',
      content: `Il settore della ristorazione e dell'alloggio (ATECO 55 e 56) è classificato a **rischio medio** e presenta rischi peculiari legati alla manipolazione alimenti, attrezzature da cucina e contatto con il pubblico.

**⏱️ Durata formazione specifica:** 8 ore (rischio medio)

**Codici ATECO di riferimento:**
- **55** - Alloggio (hotel, B&B, residence, campeggi)
- **56** - Attività dei servizi di ristorazione (ristoranti, bar, catering, mense)

**Principali rischi:**
- 🔥 **Rischio incendio/ustione:** cucine a gas, friggitrici, forni
- 🔪 **Rischio taglio:** coltelli, affettatrici, tritacarne
- 💧 **Scivolamento:** pavimenti bagnati, grassi, vapore
- 🧪 **Rischio chimico:** detergenti, sanificanti, oli esausti
- 🦠 **Rischio biologico:** contaminazione alimentare, zoonosi
- ⚡ **Rischio elettrico:** attrezzature in ambienti umidi
- 🏋️ **Movimentazione carichi:** casse bevande, derrate, sacchi
- 🌡️ **Stress termico:** calore in cucina, celle frigorifere
- 🧠 **Stress lavoro-correlato:** turni prolungati, ritmi elevati

**Normativa specifica:**
- D.Lgs 81/08 + Reg. CE 852/2004 (igiene alimenti)
- Sistema HACCP obbligatorio`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ri_quiz_intro',
      title: 'Verifica: Rischi nella Ristorazione',
      type: 'quiz',
      questions: [
        {
          id: 'ri_q1',
          question: 'Il settore ristorazione (ATECO 56) è classificato come rischio:',
          options: ['Basso', 'Medio', 'Alto', 'Variabile'],
          correctIndex: 1,
          explanation: 'Le attività di ristorazione (codice ATECO 56) sono classificate come rischio medio, con obbligo di formazione specifica di 8 ore.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ri_q2',
          question: 'Il sistema HACCP è obbligatorio per:',
          options: ['Solo i ristoranti con più di 50 coperti', 'Tutte le attività che manipolano alimenti', 'Solo le mense scolastiche', 'Solo il catering'],
          correctIndex: 1,
          explanation: 'Il Reg. CE 852/2004 impone il sistema HACCP a tutte le attività che producono, trasformano, distribuiscono o somministrano alimenti.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ri_cucina',
      title: 'Rischi in Cucina: Ustioni, Tagli e Incendio',
      type: 'lesson',
      content: `La cucina è l'area a maggior rischio infortunistico nel settore ristorazione.

**🔥 Rischio Ustioni:**
- Fornelli, padelle, friggitrici (olio a 180°C+)
- Vapore da pentole e forni (attenzione all'apertura!)
- Superfici calde di forni e piastre
- **Prevenzione:** guanti anticalore, maniglie isolanti, coperchi schermanti

**🔪 Rischio Taglio:**
- Coltelli (causa n.1 di infortunio in cucina)
- Affettatrici, tritacarne, cutter
- Scatolame, vetro rotto
- **Prevenzione:** guanti antitaglio in maglia metallica per affettatrice, coltelli affilati (paradossalmente più sicuri), taglieri stabili

**🔥 Rischio Incendio:**
- Accumulo di grasso nelle cappe e nei condotti di aspirazione
- Fiamme libere vicino a materiali combustibili
- Surriscaldamento olio in friggitrice
- **Prevenzione:** pulizia cappe ogni 6 mesi, coperta antifiamma vicino ai fuochi, estintore a CO2 in cucina

**⚠️ Procedure in caso di incendio da olio:**
- ❌ MAI usare acqua (causa esplosione di vapore!)
- ✅ Coprire con coperchio o coperta antifiamma
- ✅ Spegnere il gas e ventilare
- ✅ Usare estintore a CO2 o a schiuma`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ri_interactive',
      title: '🎮 Sicurezza in Cucina',
      type: 'interactive',
      content: 'Identifica le azioni corrette nelle situazioni di rischio in cucina.',
      questions: [
        {
          id: 'ri_int1',
          question: 'L\'olio nella friggitrice prende fuoco. Cosa fai?',
          options: ['Verso acqua per spegnere', 'Copro con un coperchio o coperta antifiamma', 'Alzo la temperatura del termostato', 'Sposto la friggitrice'],
          correctIndex: 1,
          explanation: 'MAI acqua sull\'olio in fiamme! Si copre con coperchio o coperta antifiamma per soffocare il fuoco, poi si spegne il gas. L\'acqua causa un\'esplosione di vapore estremamente pericolosa.',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'ri_int2',
          question: 'Un collega si ustiona con vapore dall\'apertura del forno. Primo intervento?',
          options: ['Applicare ghiaccio direttamente', 'Raffreddare con acqua corrente a 15-20°C per 10-20 minuti', 'Applicare olio o burro', 'Coprire con cotone'],
          correctIndex: 1,
          explanation: 'Per le ustioni il primo soccorso è raffreddare con acqua corrente tiepida (15-20°C) per 10-20 minuti. Mai ghiaccio diretto, olio, burro o dentifricio.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'ri_int3',
          question: 'Prima di usare l\'affettatrice, il lavoratore deve:',
          options: ['Controllare che la lama sia ferma e indossare il guanto in maglia metallica', 'Usarla senza protezioni per velocizzare', 'Chiedere a un collega di reggere l\'alimento', 'Indossare guanti in lattice'],
          correctIndex: 0,
          explanation: 'L\'affettatrice richiede: verifica lama, guanto antitaglio in maglia metallica sulla mano che regge l\'alimento, uso del pressore, pulizia solo a macchina ferma.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ri_scivolamento',
      title: 'Scivolamento, Movimentazione e Microclima',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Chef Moretti', role: 'Responsabile Cucina', text: 'Il pavimento bagnato e unto è il pericolo più sottovalutato. Obbligo di scarpe antiscivolo con suola in gomma certificata SRC. Ogni sversamento va asciugato SUBITO, non "dopo il servizio".' },
        { speaker: 'Sara', role: 'Cameriera', text: 'Le casse d\'acqua e birra pesano fino a 20 kg. Il magazzino è al piano di sotto. Da quando abbiamo il montacarichi e i carrelli, le lombalgie in sala sono diminuite del 70%.' },
        { speaker: 'Dott. Conti', role: 'Medico del Lavoro', text: 'In cucina la temperatura può superare i 40°C con umidità al 90%. Il rischio di colpo di calore è reale. Servono pause rinfrescanti, accesso ad acqua fresca e ventilazione forzata. Chi lavora in cella frigorifera (-20°C) deve avere abbigliamento termico e tempi di permanenza limitati.' },
        { speaker: 'Luigi', role: 'Barman', text: 'Dietro il bancone i rischi sono i vetri rotti, le superfici bagnate e lo stress dei turni serali. L\'uso di bicchieri infrangibili nelle aree esterne ha ridotto gli infortuni da taglio del 50%.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ri_igiene',
      title: 'Rischio Biologico e Igiene Alimentare',
      type: 'lesson',
      content: `**🦠 Rischio Biologico nella Ristorazione**
Il personale che manipola alimenti è esposto a rischi biologici specifici:

**Contaminazione crociata:**
- Alimenti crudi a contatto con cotti
- Taglieri e utensili non sanificati tra un uso e l'altro
- Mani non lavate tra manipolazione di alimenti diversi

**Principali agenti patogeni:**
| Patogeno | Fonte | Sintomi |
|----------|-------|---------|
| Salmonella | Uova crude, pollame | Febbre, diarrea, vomito |
| Listeria | Formaggi, salumi | Meningite, aborto |
| Staphylococcus | Mani infette | Vomito, crampi addominali |
| Norovirus | Contatto persona-persona | Gastroenterite acuta |

**🧼 Regole igieniche fondamentali:**
- Lavaggio mani: minimo 20 secondi con sapone antibatterico
- Unghie corte, senza smalto, no anelli/bracciali in cucina
- Cuffie/retine per capelli obbligatorie
- Cambio divisa giornaliero
- Temperatura di conservazione: freddi <4°C, caldi >65°C
- Zona di pericolo: 4-65°C (proliferazione batterica)

**📋 HACCP - Punti critici:**
- Ricezione merci (controllo temperatura)
- Conservazione (catena del freddo)
- Cottura (temperatura al cuore > 75°C)
- Somministrazione (tempi di esposizione)`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ri_quiz_igiene',
      title: 'Verifica: Igiene e Sicurezza',
      type: 'quiz',
      questions: [
        {
          id: 'ri_q3',
          question: 'La "zona di pericolo" per la proliferazione batterica negli alimenti è:',
          options: ['0-10°C', '4-65°C', '20-40°C', '65-100°C'],
          correctIndex: 1,
          explanation: 'Tra 4°C e 65°C i batteri si moltiplicano rapidamente. Gli alimenti non devono sostare in questa fascia per più di 2 ore.',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'ri_q4',
          question: 'Le scarpe da lavoro in cucina devono essere:',
          options: ['Qualsiasi tipo purché comode', 'Antiscivolo certificate SRC con punta chiusa', 'Aperte per il calore', 'Solo bianche'],
          correctIndex: 1,
          explanation: 'In cucina sono obbligatorie scarpe antiscivolo certificate SRC (resistenza su piastrelle con soluzione di sapone e acciaio con glicerina), con punta chiusa per proteggere da caduta oggetti.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ri_chimico',
      title: 'Rischio Chimico e Detergenti Professionali',
      type: 'lesson',
      content: `**🧪 Prodotti Chimici nella Ristorazione**
La pulizia e sanificazione richiedono l'uso di prodotti chimici che presentano rischi specifici.

**Categorie di prodotti:**
- **Detergenti alcalini:** sgrassanti industriali (pH 12-14) → rischio ustione chimica
- **Detergenti acidi:** disincrostanti (pH 1-3) → rischio ustione, fumi irritanti
- **Sanificanti cloroattivi:** candeggina, ipoclorito → fumi tossici, irritazione vie respiratorie
- **Sanitizzanti a base di ammoniaca quaternaria:** meno aggressivi ma comunque irritanti

**⚠️ PERICOLO: Mai mescolare prodotti diversi!**
- Candeggina + acido = gas di cloro (TOSSICO, potenzialmente letale)
- Candeggina + ammoniaca = clorammine (TOSSICHE)
- Acido + alcalino = reazione esotermica violenta

**🛡️ DPI per la pulizia:**
- Guanti in nitrile o PVC (lunghi fino all'avambraccio)
- Occhiali protettivi per prodotti spray o acidi
- Grembiule impermeabile
- Ventilazione adeguata durante l'uso di sanificanti

**📋 Buone pratiche:**
- Leggere SEMPRE l'etichetta e la SDS
- Rispettare le diluizioni indicate dal produttore
- Conservare i prodotti nell'imballo originale (mai in bottiglie di bevande!)
- Armadio chiuso e ventilato per lo stoccaggio`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ri_boss_test',
      title: '🏆 Test Finale - Formazione Specifica Ristorazione',
      type: 'boss_test',
      questions: [
        {
          id: 'ri_boss1',
          question: 'In caso di incendio da olio in cucina, si deve:',
          options: ['Versare acqua', 'Coprire con coperchio o coperta antifiamma', 'Soffiare sulla fiamma', 'Aggiungere sale'],
          correctIndex: 1,
          explanation: 'L\'acqua sull\'olio in fiamme causa un\'esplosione di vapore. Si deve soffocare con coperchio, coperta antifiamma o estintore a CO2.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ri_boss2',
          question: 'La temperatura al cuore per una cottura sicura deve superare:',
          options: ['50°C', '65°C', '75°C', '100°C'],
          correctIndex: 2,
          explanation: 'La cottura sicura richiede che la temperatura al cuore dell\'alimento superi i 75°C per eliminare i principali patogeni alimentari.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ri_boss3',
          question: 'Mescolare candeggina con un prodotto acido produce:',
          options: ['Un detergente più efficace', 'Gas di cloro tossico', 'Solo schiuma', 'Nessuna reazione'],
          correctIndex: 1,
          explanation: 'La reazione tra ipoclorito (candeggina) e acidi libera gas di cloro, estremamente tossico. L\'esposizione può causare gravi danni polmonari o morte.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ri_boss4',
          question: 'Il guanto in maglia metallica nell\'uso dell\'affettatrice protegge:',
          options: ['Entrambe le mani', 'La mano che regge l\'alimento', 'La mano che muove il carrello', 'Non serve con l\'affettatrice moderna'],
          correctIndex: 1,
          explanation: 'Il guanto antitaglio in maglia metallica si indossa sulla mano che regge e guida l\'alimento verso la lama. L\'altra mano opera il carrello/pressore.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ri_boss5',
          question: 'Il rischio di colpo di calore in cucina si previene con:',
          options: ['Lavorando più velocemente', 'Pause rinfrescanti, acqua e ventilazione', 'Solo con l\'aria condizionata', 'Non è un rischio reale'],
          correctIndex: 1,
          explanation: 'In cucina le temperature possono superare i 40°C. Pause rinfrescanti programmate, acqua fresca disponibile e ventilazione forzata sono misure obbligatorie.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ri_boss6',
          question: 'Un prodotto chimico non deve MAI essere travasato in:',
          options: ['Un contenitore etichettato', 'Una bottiglia di bevanda riconoscibile', 'Un dispenser con dosatore', 'Un contenitore dedicato'],
          correctIndex: 1,
          explanation: 'Travasare prodotti chimici in bottiglie di bevande è causa frequente di ingestione accidentale, con conseguenze gravi o letali. I prodotti vanno conservati nel contenitore originale.',
          xpReward: 35,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
