// Formazione Specifica - Rischio BASSO (4 ore)
// Settori: Uffici, Commercio, Turismo, Servizi, Artigianato non esposto

import { ModuleContent } from './training-content';

// ============================
// MODULO RB1: VIDEOTERMINALI E POSTURA
// ============================
export const moduloRB1Content: ModuleContent = {
  moduleId: 'rb_videoterminali',
  sections: [
    {
      id: 'rb1_intro',
      title: 'Il Lavoro al Videoterminale',
      type: 'lesson',
      content: `Il D.Lgs 81/08, Titolo VII, disciplina l'uso di attrezzature munite di videoterminali (VDT). Si applica ai lavoratori che utilizzano il VDT in modo sistematico o abituale per **20 ore settimanali** o più.

**Rischi principali:**
👁️ **Affaticamento visivo (astenopia):**
- Secchezza oculare, bruciore, lacrimazione
- Difficoltà di messa a fuoco
- Causato da: riflessi sullo schermo, luminosità inadeguata, mancanza di pause

🦴 **Disturbi muscoloscheletrici:**
- Dolori a collo, spalle, schiena, polsi
- Sindrome del tunnel carpale
- Causati da: postura scorretta, postazione non ergonomica, movimenti ripetitivi

🧠 **Stress e affaticamento mentale:**
- Monotonia, sovraccarico informativo
- Ansia da prestazione con software complessi

⚖️ **La Sorveglianza Sanitaria** è obbligatoria per i videoterminalisti. Include il controllo della vista e dell'apparato muscoloscheletrico.`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'rb1_postazione',
      title: 'La Postazione di Lavoro Ergonomica',
      type: 'lesson',
      content: `Una postazione ergonomica previene il 90% dei disturbi legati al VDT.

**🪑 Sedia:**
- Altezza regolabile (piedi ben appoggiati a terra)
- Schienale reclinabile con supporto lombare
- Braccioli regolabili in altezza
- Base a 5 razze con ruote

**🖥️ Monitor:**
- Distanza: 50-70 cm dagli occhi
- Bordo superiore all'altezza degli occhi o leggermente sotto
- Inclinazione 10-20° verso l'alto
- Nessun riflesso diretto di finestre/luci sullo schermo

**⌨️ Tastiera e Mouse:**
- Tastiera inclinabile, spazio per appoggio polsi
- Mouse alla stessa altezza della tastiera
- Avambracci appoggiati sul piano, angolo gomito ~90°

**💡 Illuminazione:**
- Luce naturale laterale (mai frontale o alle spalle)
- 300-500 lux per il lavoro al VDT
- Tende/veneziane per controllare la luce esterna

**⏸️ Pause obbligatorie:**
Ogni **2 ore** di lavoro continuativo al VDT → pausa di almeno **15 minuti** (non cumulabili). Non è possibile rinunciarvi.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rb1_quiz_postura',
      title: 'Verifica: Ergonomia e VDT',
      type: 'quiz',
      questions: [
        {
          id: 'rb1_q1',
          question: 'A quale distanza deve essere posizionato il monitor dagli occhi?',
          options: ['20-30 cm', '50-70 cm', '100-120 cm', 'Non importa'],
          correctIndex: 1,
          explanation: 'La distanza ottimale è 50-70 cm. Troppo vicino causa affaticamento, troppo lontano costringe a posture scorrette.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rb1_q2',
          question: 'Ogni quante ore di lavoro al VDT è obbligatoria la pausa?',
          options: ['Ogni ora', 'Ogni 2 ore', 'Ogni 4 ore', 'A discrezione del lavoratore'],
          correctIndex: 1,
          explanation: 'La pausa è obbligatoria ogni 2 ore di lavoro continuativo al VDT, con una durata minima di 15 minuti.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rb1_q3',
          question: 'Da dove deve provenire la luce naturale rispetto al monitor?',
          options: ['Frontalmente', 'Alle spalle', 'Lateralmente', 'Dall\'alto'],
          correctIndex: 2,
          explanation: 'La luce naturale deve provenire lateralmente al monitor per evitare abbagliamento diretto e riflessi sullo schermo.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rb1_interactive_postazione',
      title: '🎮 Correggi la Postazione',
      type: 'interactive',
      content: 'Identifica gli errori nella postazione di lavoro e seleziona la correzione giusta.',
      questions: [
        {
          id: 'rb1_int1',
          question: 'Il collega Mario ha il monitor posizionato con il bordo superiore 20 cm sopra la linea degli occhi. Cosa succede?',
          options: ['Nessun problema', 'Affaticamento al collo per continua estensione', 'Miglior visibilità', 'Protegge gli occhi'],
          correctIndex: 1,
          explanation: 'Un monitor troppo alto costringe ad estendere il collo all\'indietro, causando tensione cervicale e dolori al collo/spalle.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'rb1_int2',
          question: 'Sara lavora con la finestra direttamente alle spalle. Il monitor mostra riflessi. Come risolvere?',
          options: ['Aumentare la luminosità del monitor', 'Spostare la postazione perpendicolare alla finestra', 'Mettere occhiali da sole', 'Chiudere le tende e usare solo luce artificiale'],
          correctIndex: 1,
          explanation: 'La soluzione migliore è posizionare la postazione perpendicolare alla finestra (luce laterale), eliminando sia riflessi che abbagliamento.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 20,
    },
    {
      id: 'rb1_point_click',
      title: '🔍 Caccia ai Rischi: L\'Ufficio Moderno',
      type: 'point_and_click',
      content: 'Trova tutti i rischi ergonomici nascosti in questo ufficio open space.',
      minTimeSeconds: 5,
      xpReward: 30,
    },
    {
      id: 'rb1_boss_test',
      title: '🏆 Test Finale - Videoterminali',
      type: 'boss_test',
      questions: [
        {
          id: 'rb1_boss1',
          question: 'La sorveglianza sanitaria per i videoterminalisti è obbligatoria quando si usa il VDT per:',
          options: ['Più di 10 ore/settimana', 'Più di 20 ore/settimana', 'Più di 30 ore/settimana', 'Sempre, indipendentemente dalle ore'],
          correctIndex: 1,
          explanation: 'La sorveglianza sanitaria è obbligatoria per chi utilizza il VDT in modo sistematico per almeno 20 ore settimanali.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rb1_boss2',
          question: 'L\'angolo corretto tra avambraccio e braccio durante la digitazione è:',
          options: ['45°', '90°', '120°', '180° (braccio disteso)'],
          correctIndex: 1,
          explanation: 'L\'angolo ideale è circa 90° per evitare tensioni muscolari su spalle e polsi.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rb1_boss3',
          question: 'Quale dei seguenti NON è un sintomo dell\'astenopia?',
          options: ['Bruciore oculare', 'Visione offuscata', 'Mal di schiena', 'Lacrimazione eccessiva'],
          correctIndex: 2,
          explanation: 'Il mal di schiena è un disturbo muscoloscheletrico, non un sintomo dell\'astenopia (affaticamento visivo). L\'astenopia causa sintomi oculari.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rb1_boss4',
          question: 'Le pause dal VDT possono essere cumulate a fine giornata?',
          options: ['Sì, se il lavoratore è d\'accordo', 'No, non sono cumulabili', 'Solo con autorizzazione del DL', 'Solo se inferiori a 30 minuti totali'],
          correctIndex: 1,
          explanation: 'Le pause dal VDT NON sono cumulabili. Devono essere distribuite durante la giornata lavorativa per essere efficaci.',
          xpReward: 35,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

// ============================
// MODULO RB2: STRESS LAVORO-CORRELATO
// ============================
export const moduloRB2Content: ModuleContent = {
  moduleId: 'rb_stress_lavoro',
  sections: [
    {
      id: 'rb2_intro',
      title: 'Cos\'è lo Stress Lavoro-Correlato',
      type: 'lesson',
      content: `Lo stress lavoro-correlato (SLC) è definito dall'Accordo Europeo del 2004 come:

> *"Uno stato che si accompagna a malessere e disfunzioni fisiche, psicologiche o sociali, derivante dal fatto che le persone non si sentono in grado di rispondere alle richieste o alle aspettative riposte in loro."*

**⚠️ Il D.Lgs 81/08 (art. 28) lo include obbligatoriamente nella Valutazione dei Rischi.**

**Fattori di rischio:**
📋 **Contenuto del lavoro:**
- Carico di lavoro eccessivo o insufficiente
- Monotonia e ripetitività
- Orari prolungati o turni
- Mancanza di autonomia decisionale

👥 **Contesto lavorativo:**
- Ruolo ambiguo o conflittuale
- Scarsa comunicazione
- Mancanza di supporto da colleghi/superiori
- Insicurezza lavorativa
- Conflitti interpersonali

**Conseguenze sulla salute:**
🔴 Fisiche: cefalea, disturbi gastrointestinali, ipertensione, disturbi del sonno
🟡 Psicologiche: ansia, irritabilità, depressione, burnout
🔵 Comportamentali: assenteismo, errori, abuso di sostanze`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rb2_quiz_stress',
      title: 'Verifica: Stress e Rischi Psicosociali',
      type: 'quiz',
      questions: [
        {
          id: 'rb2_q1',
          question: 'Lo stress lavoro-correlato è incluso nella Valutazione dei Rischi?',
          options: ['No, è una questione personale', 'Sì, è obbligatorio per legge (art. 28)', 'Solo per aziende con >50 dipendenti', 'Solo su richiesta del RLS'],
          correctIndex: 1,
          explanation: 'Il D.Lgs 81/08 art. 28 stabilisce che la valutazione dei rischi deve comprendere anche i rischi collegati allo stress lavoro-correlato.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'rb2_q2',
          question: 'Il burnout è:',
          options: ['Una malattia infettiva', 'Un esaurimento psicofisico dovuto a stress cronico lavorativo', 'Una forma di infortunio', 'Un tipo di mobbing'],
          correctIndex: 1,
          explanation: 'Il burnout è una sindrome di esaurimento emotivo, depersonalizzazione e ridotta realizzazione personale, causata da stress lavorativo cronico.',
          xpReward: 20,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rb2_mobbing',
      title: 'Mobbing e Rischi Psicosociali',
      type: 'lesson',
      content: `**Il Mobbing** consiste in azioni ostili, ripetute e sistematiche contro un lavoratore:

**Tipi di mobbing:**
- **Verticale (bossing):** dal superiore verso il subordinato
- **Orizzontale:** tra colleghi dello stesso livello
- **Dal basso:** dal subordinato verso il superiore (raro)

**Indicatori di mobbing:**
⚠️ Isolamento sistematico dal gruppo
⚠️ Assegnazione di compiti dequalificanti o eccessivi
⚠️ Critiche continue e ingiustificate
⚠️ Diffusione di pettegolezzi
⚠️ Negazione di permessi/ferie senza motivo

**Cosa fare:**
✅ Documentare gli episodi (date, testimoni, fatti)
✅ Segnalare al RLS, al Medico Competente o al DL
✅ Rivolgersi al sindacato o a un legale
✅ In caso grave, denuncia all'Ispettorato del Lavoro

**Prevenzione aziendale:**
- Codice etico e politiche anti-mobbing
- Sportello di ascolto
- Formazione dei dirigenti sulla gestione dei conflitti`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rb2_interactive_scenario',
      title: '🎮 Riconosci lo Stress',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Luca', role: 'Impiegato', text: 'Non dormo bene da settimane. Il mio capo mi ha assegnato il lavoro di tre persone dopo i licenziamenti, e non riesco a stare al passo. Ho mal di testa continui.' },
        { speaker: 'Giulia', role: 'Segretaria', text: 'Da quando è arrivato il nuovo responsabile, nessuno mi rivolge più la parola. Mi hanno spostata in un ufficio isolato senza spiegazioni. Non mi invitano alle riunioni del team.' },
        { speaker: 'Marco', role: 'Cassiere', text: 'Faccio lo stesso identico gesto 8 ore al giorno. Non ho mai una pausa vera. Il turno cambia ogni settimana senza preavviso. Mi sento come un robot.' },
      ],
      questions: [
        {
          id: 'rb2_int1',
          question: 'Nel caso di Luca, quale fattore di rischio è predominante?',
          options: ['Monotonia del lavoro', 'Carico di lavoro eccessivo', 'Mobbing', 'Rischio fisico'],
          correctIndex: 1,
          explanation: 'Luca subisce un carico di lavoro eccessivo (overload). I sintomi fisici (insonnia, cefalea) sono tipiche conseguenze dello stress da sovraccarico.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'rb2_int2',
          question: 'La situazione di Giulia descrive:',
          options: ['Stress da VDT', 'Mobbing verticale (bossing)', 'Burnout', 'Rischio ergonomico'],
          correctIndex: 1,
          explanation: 'Giulia subisce mobbing verticale: isolamento sistematico, esclusione dalle riunioni e spostamento ingiustificato, tutti da parte del superiore.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'rb2_int3',
          question: 'Per Marco, la combinazione di rischi include:',
          options: ['Solo rischio posturale', 'Monotonia + turni irregolari + movimenti ripetitivi', 'Solo stress psicologico', 'Rischio chimico'],
          correctIndex: 1,
          explanation: 'Marco è esposto a multipli fattori: monotonia (stesse operazioni), turni variabili senza preavviso e movimenti ripetitivi. Una combinazione molto rischiosa.',
          xpReward: 30,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 25,
    },
    {
      id: 'rb2_boss_test',
      title: '🏆 Test Finale - Stress Lavoro-Correlato',
      type: 'boss_test',
      questions: [
        {
          id: 'rb2_boss1',
          question: 'L\'obbligo di valutare lo stress lavoro-correlato deriva da:',
          options: ['Un accordo aziendale volontario', 'L\'art. 28 del D.Lgs 81/08', 'Una circolare INAIL', 'Una raccomandazione europea non vincolante'],
          correctIndex: 1,
          explanation: 'L\'art. 28 del D.Lgs 81/08 stabilisce esplicitamente l\'obbligo di valutare i rischi da stress lavoro-correlato.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rb2_boss2',
          question: 'Il mobbing orizzontale avviene tra:',
          options: ['Datore di lavoro e lavoratore', 'Colleghi dello stesso livello', 'Lavoratore e cliente', 'Azienda e sindacato'],
          correctIndex: 1,
          explanation: 'Il mobbing orizzontale avviene tra colleghi di pari grado. Quello verticale (bossing) coinvolge il rapporto gerarchico.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rb2_boss3',
          question: 'Un lavoratore vittima di mobbing dovrebbe:',
          options: ['Ignorare la situazione', 'Documentare gli episodi e segnalare al RLS o MC', 'Vendicarsi con il mobber', 'Dimettersi immediatamente'],
          correctIndex: 1,
          explanation: 'La prima azione è documentare (date, fatti, testimoni) e segnalare attraverso i canali aziendali (RLS, MC, DL) o esterni (sindacato, Ispettorato).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rb2_boss4',
          question: 'Quale tra questi NON è un sintomo tipico dello stress lavoro-correlato?',
          options: ['Insonnia', 'Irritabilità cronica', 'Frattura ossea', 'Disturbi gastrointestinali'],
          correctIndex: 2,
          explanation: 'La frattura è un infortunio traumatico, non una conseguenza dello stress. Lo stress causa disturbi funzionali (sonno, digestione, umore).',
          xpReward: 30,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

// ============================
// MODULO RB3: RISCHIO ELETTRICO BASE
// ============================
export const moduloRB3Content: ModuleContent = {
  moduleId: 'rb_rischio_elettrico',
  sections: [
    {
      id: 'rb3_intro',
      title: 'Il Rischio Elettrico in Ufficio',
      type: 'lesson',
      content: `L'elettricità è presente ovunque negli ambienti di lavoro, anche in quelli a rischio basso. I pericoli derivano da contatti diretti e indiretti.

**⚡ Effetti della corrente elettrica sul corpo:**
- **1 mA:** Soglia di percezione (formicolio)
- **10-15 mA:** Contrazione muscolare involontaria (non si riesce a lasciare la presa)
- **30 mA:** Soglia di fibrillazione ventricolare (potenzialmente mortale)
- **>100 mA:** Arresto cardiaco, ustioni gravi

**Tipi di contatto:**
🔴 **Contatto diretto:** toccare un conduttore in tensione (cavo scoperto, presa rotta)
🟡 **Contatto indiretto:** toccare una parte metallica che è diventata in tensione per un guasto

**Dispositivi di protezione:**
- **Interruttore differenziale (salvavita):** interviene a 30 mA
- **Impianto di messa a terra:** devia la corrente di guasto a terra
- **Isolamento dei conduttori:** rivestimento protettivo dei cavi`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rb3_quiz_elettrico',
      title: 'Verifica: Rischio Elettrico',
      type: 'quiz',
      questions: [
        {
          id: 'rb3_q1',
          question: 'A quale intensità di corrente si verifica il rischio di fibrillazione ventricolare?',
          options: ['1 mA', '10 mA', '30 mA', '1000 mA'],
          correctIndex: 2,
          explanation: 'A partire da 30 mA la corrente può provocare fibrillazione ventricolare, per questo il salvavita interviene a questa soglia.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'rb3_q2',
          question: 'Cosa si deve fare se si nota un cavo elettrico danneggiato in ufficio?',
          options: ['Ripararlo con nastro isolante', 'Segnalarlo immediatamente e non toccarlo', 'Ignorarlo se non ci si avvicina', 'Staccare la spina tirando il cavo'],
          correctIndex: 1,
          explanation: 'Un cavo danneggiato è un pericolo di contatto diretto. Va segnalato immediatamente senza toccarlo, e solo personale qualificato può intervenire.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rb3_scenario',
      title: '🎮 Ispezione Elettrica 3D',
      type: 'scenario_3d',
      content: 'Esplora l\'ufficio in 3D e individua tutte le situazioni di pericolo elettrico: prese sovraccariche, cavi danneggiati, apparecchiature vicino all\'acqua.',
      minTimeSeconds: 120,
      xpReward: 80,
    },
    {
      id: 'rb3_boss_test',
      title: '🏆 Test Finale - Rischio Elettrico',
      type: 'boss_test',
      questions: [
        {
          id: 'rb3_boss1',
          question: 'L\'interruttore differenziale (salvavita) protegge da:',
          options: ['Sovratensioni', 'Cortocircuiti', 'Contatti indiretti e dispersioni a terra', 'Sbalzi di corrente'],
          correctIndex: 2,
          explanation: 'Il differenziale protegge dalle dispersioni a terra e dai contatti indiretti, intervenendo quando rileva una differenza di corrente (tipicamente 30 mA).',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rb3_boss2',
          question: 'L\'uso di ciabatte multiple collegate in serie (a cascata) è:',
          options: ['Consentito se le ciabatte sono certificate', 'Vietato: rischio di sovraccarico e incendio', 'Permesso solo in ufficio', 'Obbligatorio per risparmiare prese'],
          correctIndex: 1,
          explanation: 'Il collegamento a cascata di ciabatte multiple è vietato perché provoca sovraccarico della linea, surriscaldamento e rischio di incendio.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rb3_boss3',
          question: 'Un collega prende la scossa da un apparecchio metallico. La prima cosa da fare è:',
          options: ['Afferrarlo e tirarlo via', 'Staccare l\'alimentazione elettrica o usare un materiale isolante per separarlo', 'Bagnarlo con acqua per disperdere la corrente', 'Chiamare i Vigili del Fuoco'],
          correctIndex: 1,
          explanation: 'MAI toccare direttamente la persona (rischio di folgorazione). Primo: staccare la corrente. Se impossibile, usare materiale isolante (legno secco, gomma) per separare la persona.',
          xpReward: 40,
          difficulty: 'hard',
        },
        {
          id: 'rb3_boss4',
          question: 'Chi può effettuare interventi sugli impianti elettrici?',
          options: ['Qualsiasi lavoratore formato', 'Solo personale qualificato PES o PAV', 'Il preposto del reparto', 'Chiunque con guanti isolanti'],
          correctIndex: 1,
          explanation: 'Solo personale qualificato (PES - Persona Esperta, PAV - Persona Avvertita) può intervenire sugli impianti elettrici, secondo la norma CEI 11-27.',
          xpReward: 35,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

// ============================
// MODULO RB4: MICROCLIMA ED EMERGENZE
// ============================
export const moduloRB4Content: ModuleContent = {
  moduleId: 'rb_microclima_ergonomia',
  sections: [
    {
      id: 'rb4_intro',
      title: 'Microclima e Comfort Ambientale',
      type: 'lesson',
      content: `Il microclima influenza direttamente il benessere e la produttività dei lavoratori. In ambienti a rischio basso (uffici), i parametri da controllare sono:

**🌡️ Temperatura:**
- Inverno: 18-22°C
- Estate: 24-26°C
- Differenza interno/esterno: max 7°C

**💧 Umidità relativa:**
- Ideale: 40-60%
- Sotto il 30%: secchezza mucose, irritazione occhi
- Sopra il 70%: disagio, muffe

**🌬️ Velocità dell'aria:**
- Max 0,15 m/s in inverno
- Max 0,25 m/s in estate
- Correnti d'aria dirette → dolori muscolari

**💡 Illuminazione:**
- Lavoro d'ufficio: 300-500 lux
- Lettura documenti: 500 lux
- Aree di passaggio: 100 lux
- Evitare abbagliamento e contrasti eccessivi

**🔊 Rumore:**
- Uffici: <65 dB(A) raccomandati
- Sopra 80 dB(A): obbligatoria valutazione e DPI`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'rb4_emergenze',
      title: 'Procedure di Emergenza e Evacuazione',
      type: 'lesson',
      content: `Ogni lavoratore deve conoscere le procedure di emergenza del proprio luogo di lavoro.

**🚨 Piano di Emergenza (obbligatorio per aziende >10 lavoratori):**
Include:
- Planimetrie con percorsi di evacuazione
- Punti di raccolta
- Numeri di emergenza interni
- Procedure per incendio, terremoto, allagamento

**🏃 Procedura di Evacuazione:**
1. Mantenere la calma
2. Seguire le indicazioni degli addetti all'emergenza
3. NON usare ascensori
4. Percorrere le vie di fuga indicate dalla segnaletica verde
5. Raggiungere il punto di raccolta
6. NON rientrare finché non autorizzati
7. Segnalare eventuali assenti

**🧯 Antincendio Base:**
- Conoscere la posizione degli estintori
- Conoscere la posizione dei pulsanti di allarme
- NON tentare di spegnere un incendio se non addestrati
- In caso di fumo: abbassarsi (il fumo sale) e coprire naso/bocca

**🩹 Primo Soccorso Base:**
- Conoscere dove si trova la cassetta di primo soccorso
- Conoscere chi sono gli Addetti al Primo Soccorso
- In caso di malore: chiamare l'addetto PS → 118 se necessario
- NON spostare un infortunato (rischio lesioni spinali)`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rb4_quiz_emergenze',
      title: 'Verifica: Emergenze',
      type: 'quiz',
      questions: [
        {
          id: 'rb4_q1',
          question: 'Durante un\'evacuazione per incendio, si possono usare gli ascensori?',
          options: ['Sì, per evacuare più velocemente', 'No, mai', 'Solo se l\'incendio è ai piani bassi', 'Solo le persone con disabilità'],
          correctIndex: 1,
          explanation: 'Durante un\'evacuazione gli ascensori NON devono mai essere usati: possono bloccarsi, riempirsi di fumo o aprirsi su piani in fiamme.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rb4_q2',
          question: 'Se trovi un collega svenuto a terra, cosa fai per primo?',
          options: ['Lo scuoti vigorosamente', 'Chiami l\'Addetto al Primo Soccorso e il 118', 'Gli butti dell\'acqua in faccia', 'Lo sollevi e lo metti seduto'],
          correctIndex: 1,
          explanation: 'La prima azione è allertare l\'Addetto al Primo Soccorso aziendale e chiamare il 118. Non spostare la persona se non necessario.',
          xpReward: 20,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rb4_scenario_evacuazione',
      title: '🎮 Simulazione Evacuazione 3D',
      type: 'scenario_3d',
      content: 'Suona l\'allarme! Trova la via di fuga corretta, segui la segnaletica e raggiungi il punto di raccolta nel minor tempo possibile.',
      minTimeSeconds: 120,
      xpReward: 80,
    },
    {
      id: 'rb4_boss_test',
      title: '🏆 Test Finale - Microclima ed Emergenze',
      type: 'boss_test',
      questions: [
        {
          id: 'rb4_boss1',
          question: 'La temperatura ideale in ufficio in inverno è:',
          options: ['14-16°C', '18-22°C', '25-28°C', '28-30°C'],
          correctIndex: 1,
          explanation: 'In inverno la temperatura ottimale per il lavoro d\'ufficio è 18-22°C, con umidità relativa tra 40-60%.',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'rb4_boss2',
          question: 'Il Piano di Emergenza è obbligatorio per aziende con:',
          options: ['Più di 5 lavoratori', 'Più di 10 lavoratori', 'Più di 50 lavoratori', 'Tutte le aziende'],
          correctIndex: 1,
          explanation: 'Il Piano di Emergenza è obbligatorio per le aziende con più di 10 lavoratori (art. 46 e DM 10/03/1998).',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rb4_boss3',
          question: 'In caso di fumo denso durante un incendio, come ci si deve muovere?',
          options: ['In piedi, correndo', 'Abbassati, vicino al pavimento', 'Non ci si deve muovere', 'Sulla schiena strisciando'],
          correctIndex: 1,
          explanation: 'Il fumo tende a salire. Muoversi abbassati (anche carponi) permette di respirare aria più pulita e mantenere la visibilità.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rb4_boss4',
          question: 'Dopo un\'evacuazione, quando si può rientrare nell\'edificio?',
          options: ['Dopo 10 minuti', 'Quando il fumo si dirada', 'Solo dopo autorizzazione del responsabile dell\'emergenza', 'Quando si vuole'],
          correctIndex: 2,
          explanation: 'Si può rientrare SOLO dopo il via libera del coordinatore dell\'emergenza, che verifica la sicurezza dell\'edificio.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const rischioBassContents = [moduloRB1Content, moduloRB2Content, moduloRB3Content, moduloRB4Content];
