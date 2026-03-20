// Adaptive Learning - Reinforcement content for topics where students struggle

export interface ReinforcementTopic {
  topicId: string;
  title: string;
  relatedQuestionIds: string[];
  content: string;
}

export const reinforcementContent: ReinforcementTopic[] = [
  {
    topicId: 'normativa_base',
    title: 'Quadro Normativo',
    relatedQuestionIds: ['q1_1', 'q1_2', 'boss_1'],
    content: `**Ricorda i punti chiave del D.Lgs 81/2008:**

🔑 Il Testo Unico sulla Sicurezza (TUS) è la norma PRINCIPALE. Prima esistevano tante leggi separate (626/94, 494/96...), ora è tutto in UN solo decreto.

📌 Si applica a **TUTTI**: grandi e piccole aziende, settore pubblico e privato, qualsiasi contratto (tempo determinato, interinale, stage...).

💡 **Trucco per ricordare:** 81/08 → "8-1-0-8" → pensalo come un numero di emergenza per la sicurezza!`,
  },
  {
    topicId: 'rischio_pericolo',
    title: 'Rischio, Pericolo e Danno',
    relatedQuestionIds: ['int_1', 'int_2', 'int_3', 'boss_2', 'boss_6'],
    content: `**Non confondere Pericolo e Rischio!**

🎯 **PERICOLO** = la "cosa" pericolosa (esiste sempre, è oggettivo)
→ Es: un coltello È un pericolo

⚖️ **RISCHIO** = quanto è probabile che il pericolo ti faccia male
→ Es: un coltello nel cassetto = rischio BASSO; un coltello in mano a un bambino = rischio ALTO

📐 **Formula: R = P × D**
- P (Probabilità): da 1 (improbabile) a 4 (quasi certo)
- D (Danno): da 1 (lieve) a 4 (gravissimo/mortale)
- R > 8 = intervento URGENTE

💡 **Trucco:** Pensa a P×D come a un termometro della sicurezza!`,
  },
  {
    topicId: 'figure_prevenzione',
    title: 'Figure della Prevenzione',
    relatedQuestionIds: ['q2_1', 'q2_2', 'q2_3', 'q2_4', 'boss_3', 'boss_4'],
    content: `**Chi fa cosa nella sicurezza aziendale:**

👔 **Datore di Lavoro** → CAPO della sicurezza
- 2 obblighi NON delegabili: DVR + nomina RSPP

🛡️ **RSPP** → NOMINATO dal Datore di Lavoro
- È il tecnico, coordina la prevenzione

✊ **RLS** → ELETTO dai lavoratori  
- È la voce dei lavoratori

🩺 **Medico Competente** → visite + giudizi idoneità

👷 **Preposto** → il "caposquadra" che vigila sul campo

💡 **Trucco:** RSPP = Nominato (N come il datore), RLS = Eletto (E come i lavoratori)`,
  },
  {
    topicId: 'diritti_doveri',
    title: 'Diritti e Doveri del Lavoratore',
    relatedQuestionIds: ['q3_1', 'q3_2', 'q3_4', 'q3_5', 'boss_5', 'boss_7'],
    content: `**Il lavoratore NON è solo un soggetto passivo!**

✅ **DIRITTI** (cosa puoi pretendere):
- Formazione GRATUITA
- DPI GRATUITI
- Allontanarti se c'è pericolo GRAVE

⚠️ **DOVERI** (cosa DEVI fare):
- Usare i DPI → NON è opzionale!
- Segnalare i pericoli → SUBITO, non "dopo"
- Partecipare alla formazione → è OBBLIGATORIO

🚨 **Se violi i doveri:** rischi sanzioni PENALI (arresto o ammenda)

💡 **Trucco:** I DPI sono come la cintura di sicurezza: OBBLIGATORIA, non opzionale!`,
  },
  {
    topicId: 'organigramma',
    title: 'Organigramma della Sicurezza',
    relatedQuestionIds: ['q4_1', 'q4_2', 'q4_3', 'q4_4'],
    content: `**La catena di comando della sicurezza:**

📊 Datore di Lavoro → Dirigente → Preposto → Lavoratore

🔑 **Punti chiave:**
- Il **Dirigente** ATTUA le direttive (non le decide)
- Il **Preposto** VIGILA sul campo (è il supervisore diretto)
- La **Riunione Periodica** è OBBLIGATORIA nelle aziende con 15+ lavoratori
- Il SPP è composto da RSPP + ASPP

💡 **Trucco:** Pensa alla sicurezza come a una squadra di calcio: il DL è l'allenatore, il dirigente il capitano, il preposto l'arbitro in campo!`,
  },
  {
    topicId: 'valutazione_rischi',
    title: 'Valutazione dei Rischi',
    relatedQuestionIds: ['q5_1', 'q5_2', 'q5_3', 'q5_4', 'q5_5'],
    content: `**La Valutazione dei Rischi è il CUORE della prevenzione!**

📋 **DVR** = Documento di Valutazione dei Rischi
- Chi lo fa? Il **Datore di Lavoro** (NON delegabile!)
- Con chi? RSPP + Medico Competente + consultazione RLS

📊 **Matrice del Rischio:**
|  | D=1 | D=2 | D=3 | D=4 |
|P=1| 1 | 2 | 3 | 4 |
|P=2| 2 | 4 | 6 | 8 |
|P=3| 3 | 6 | 9 | 12|
|P=4| 4 | 8 | 12| 16|

🟢 1-2: Accettabile | 🟡 3-4: Attenzione | 🟠 6-9: Intervento | 🔴 12-16: URGENTE

💡 Le misure di prevenzione riducono P, quelle di protezione riducono D!`,
  },
  {
    topicId: 'dpi',
    title: 'Dispositivi di Protezione Individuale',
    relatedQuestionIds: ['q7_1', 'q7_2', 'q7_3', 'q7_4', 'q7_5'],
    content: `**I DPI sono l'ULTIMA linea di difesa!**

📌 **Gerarchia delle misure:**
1. ELIMINARE il rischio alla fonte
2. SOSTITUIRE con qualcosa di meno pericoloso
3. ISOLARE il rischio (barriere, protezioni)
4. PROCEDURE organizzative
5. DPI → solo se le precedenti NON bastano!

🏷️ **Categorie DPI:**
- **Cat. I** → rischi minimi (guanti da giardinaggio)
- **Cat. II** → rischi significativi (caschi, occhiali)
- **Cat. III** → rischi gravissimi/mortali (imbracature, maschere)

⚠️ Il lavoratore DEVE usarli, il datore DEVE fornirli GRATIS e in buono stato!

💡 **Trucco:** Pensa ai DPI come all'ultimo scudo in un videogioco: utile ma meglio non arrivarci!`,
  },
  // ============================
  // RSPP DATORE DI LAVORO
  // ============================
  {
    topicId: 'rspp_responsabilita',
    title: 'Responsabilità del DL-RSPP',
    relatedQuestionIds: ['rspp_q1', 'rspp_q2', 'rspp_boss_1'],
    content: `**Il DL che assume il ruolo di RSPP (Art. 34):**

👔 **Quando è possibile?** Solo in aziende fino a determinati limiti dimensionali:
- 30 lavoratori (aziende industriali/artigianali)
- 200 lavoratori (altre tipologie)

📋 **Obblighi NON delegabili del DL:**
1. Valutazione dei rischi e DVR
2. Designazione del RSPP

⚠️ **Attenzione:** Anche se il DL è RSPP, il DVR resta sua responsabilità esclusiva!

💡 **Trucco:** Il DL-RSPP è come il capitano-allenatore: gioca E dirige, ma la responsabilità finale è SEMPRE sua.`,
  },
  {
    topicId: 'rspp_dvr_ciclo',
    title: 'DVR e Ciclo PDCA',
    relatedQuestionIds: ['rspp_q3', 'rspp_q4', 'rspp_boss_2'],
    content: `**Il DVR non è un documento statico!**

🔄 **Ciclo PDCA (Plan-Do-Check-Act):**
- **Plan**: identificare pericoli, valutare rischi, pianificare misure
- **Do**: implementare le misure preventive e protettive
- **Check**: verificare l'efficacia (audit, monitoraggio, near miss)
- **Act**: correggere e migliorare continuamente

📊 **Near Miss Reporting:**
Un near miss è un evento che POTEVA causare un danno ma non l'ha fatto. Segnalarli è fondamentale perché per ogni incidente grave ci sono circa 300 near miss (piramide di Heinrich).

💡 **Trucco:** PDCA = Pianifica-Fai-Controlla-Agisci. Come una spirale che migliora ad ogni giro!`,
  },
  {
    topicId: 'rspp_tecnico_pratico',
    title: 'Aspetti Tecnico-Pratici',
    relatedQuestionIds: ['rspp_q5', 'rspp_q6', 'rspp_boss_3'],
    content: `**Il RSPP deve conoscere gli aspetti tecnici specifici:**

🔧 **Rischi principali da valutare:**
- Rischi fisici (rumore, vibrazioni, microclima)
- Rischi chimici (sostanze pericolose, SDS)
- Rischi biologici (agenti patogeni)
- Rischi ergonomici (movimentazione carichi, VDT)
- Rischi psicosociali (stress lavoro-correlato)

📐 **Strumenti di valutazione:**
- Misurazioni strumentali (fonometro, luxmetro)
- Checklist e matrici di rischio
- Analisi degli infortuni e near miss
- Indagini sul clima aziendale

💡 **Trucco:** Ogni rischio ha un metodo di valutazione specifico. Non esiste un approccio "taglia unica"!`,
  },
  {
    topicId: 'rspp_comunicazione',
    title: 'Comunicazione e Formazione',
    relatedQuestionIds: ['rspp_q7', 'rspp_q8', 'rspp_boss_4'],
    content: `**La comunicazione è la chiave della prevenzione!**

🗣️ **Il RSPP deve saper comunicare con:**
- Datore di lavoro (consulenza tecnica)
- Lavoratori (informazione e formazione)
- RLS (consultazione obbligatoria)
- Medico competente (sorveglianza sanitaria)
- Organi di vigilanza (ispezioni)

📚 **Formazione efficace:**
- Deve essere SPECIFICA per mansione
- Deve usare linguaggio comprensibile
- Deve includere esercitazioni pratiche
- Deve essere DOCUMENTATA (registro presenze)

💡 **Trucco:** Un buon RSPP non è solo un tecnico, è un comunicatore. La sicurezza si "vende" con l'esempio e la chiarezza!`,
  },

  // ============================
  // RLS
  // ============================
  {
    topicId: 'rls_ruolo',
    title: 'Ruolo e Attribuzioni del RLS',
    relatedQuestionIds: ['rls_q1', 'rls_q2', 'rls_boss_1'],
    content: `**Il RLS è la voce dei lavoratori per la sicurezza:**

✊ **Come viene designato:**
- ELETTO dai lavoratori (non nominato dal DL!)
- Nelle aziende fino a 15 dipendenti: eletto tra i lavoratori
- Oltre 15: eletto nell'ambito delle RSU/RSA

📋 **Attribuzioni principali (Art. 50):**
1. Accesso ai luoghi di lavoro
2. Consultazione preventiva sulla valutazione dei rischi
3. Accesso al DVR
4. Formulare osservazioni durante le ispezioni
5. Partecipare alla riunione periodica
6. Promuovere misure di prevenzione

⚠️ **Il RLS NON può subire pregiudizio** per l'esercizio delle sue funzioni!

💡 **Trucco:** RLS = Rappresentante → ELETTO. RSPP = Responsabile → NOMINATO. La differenza è nella legittimazione!`,
  },
  {
    topicId: 'rls_rischi',
    title: 'RLS e Valutazione Rischi',
    relatedQuestionIds: ['rls_q3', 'rls_q4', 'rls_boss_2'],
    content: `**Il RLS ha un ruolo attivo nella valutazione dei rischi:**

🔍 **Diritto di accesso al DVR:**
- Il RLS può consultare il DVR in QUALSIASI momento
- Deve ricevere copia su richiesta
- Ha diritto a informazioni comprensibili

📊 **Consultazione obbligatoria:**
Il DL DEVE consultare il RLS su:
- Valutazione dei rischi
- Designazione degli addetti emergenza
- Organizzazione della formazione
- Introduzione di nuove tecnologie

🛡️ **Segnalazione rischi:**
Il RLS può segnalare rischi e proporre soluzioni. Se inascoltato, può rivolgersi agli organi di vigilanza (ASL/INAIL).

💡 **Trucco:** Il RLS è come un "ispettore interno" eletto dai colleghi: vede, segnala, propone!`,
  },
  {
    topicId: 'rls_comunicazione',
    title: 'RLS e Comunicazione',
    relatedQuestionIds: ['rls_q5', 'rls_q6', 'rls_boss_3'],
    content: `**La comunicazione efficace è l'arma più potente del RLS:**

🗣️ **Con i lavoratori:**
- Raccogliere segnalazioni e preoccupazioni
- Informare sui diritti in materia di sicurezza
- Motivare alla partecipazione attiva

📝 **Con il DL e il RSPP:**
- Presentare le istanze dei lavoratori in modo costruttivo
- Proporre soluzioni, non solo problemi
- Documentare le richieste per iscritto

⚖️ **Nella riunione periodica (Art. 35):**
- Obbligatoria nelle aziende con 15+ lavoratori
- Almeno una volta all'anno
- Partecipano: DL, RSPP, MC, RLS

💡 **Trucco:** Un buon RLS ascolta il doppio di quanto parla. La mediazione è più efficace dello scontro!`,
  },

  // ============================
  // PREPOSTO
  // ============================
  {
    topicId: 'preposto_obblighi',
    title: 'Obblighi del Preposto',
    relatedQuestionIds: ['preposto_q1', 'preposto_q2', 'preposto_boss_1'],
    content: `**Il Preposto è il "supervisore della sicurezza" sul campo:**

👷 **Chi è il Preposto?**
- La persona che sovraintende all'attività lavorativa
- Ha potere di iniziativa funzionale (può interrompere il lavoro!)
- Dopo la L. 215/2021: obblighi rafforzati

📋 **Obblighi principali (Art. 19):**
1. **Sovrintendere e vigilare** sull'osservanza delle norme
2. **Verificare** che solo lavoratori formati accedano a zone a rischio
3. **Richiedere** l'osservanza delle misure di sicurezza
4. **Segnalare** al DL le deficienze dei mezzi e delle condizioni
5. **Interrompere** l'attività in caso di pericolo grave e immediato

⚠️ **Novità L. 215/2021:** Il preposto deve **intervenire direttamente** per modificare comportamenti non conformi!

💡 **Trucco:** Il preposto è l'unico che può fermare il lavoro sul campo. È il semaforo rosso della sicurezza!`,
  },
  {
    topicId: 'preposto_vigilanza',
    title: 'Vigilanza e DPI',
    relatedQuestionIds: ['preposto_q3', 'preposto_q4', 'preposto_boss_2'],
    content: `**La vigilanza del Preposto è continua e attiva:**

👀 **Cosa vigilare:**
- Uso corretto dei DPI
- Rispetto delle procedure operative
- Condizioni di sicurezza dell'ambiente
- Comportamenti a rischio dei lavoratori

🛡️ **Gestione DPI:**
- Verificare che i lavoratori li indossino
- Segnalare DPI danneggiati o inadeguati
- Controllare la conformità (marchio CE)
- Formare sull'uso corretto

📝 **Documentare:**
- Ogni segnalazione va fatta per iscritto
- Conservare evidenza delle azioni intraprese
- In caso di rifiuto del lavoratore: segnalare al DL

💡 **Trucco:** Il preposto che "chiude un occhio" diventa CORRESPONSABILE dell'infortunio!`,
  },
  {
    topicId: 'preposto_emergenze',
    title: 'Preposto e Gestione Emergenze',
    relatedQuestionIds: ['preposto_q5', 'preposto_q6', 'preposto_boss_3'],
    content: `**In emergenza, il Preposto è il primo punto di riferimento:**

🚨 **Compiti in emergenza:**
1. Valutare la gravità della situazione
2. Dare l'allarme e allertare i soccorsi
3. Guidare i lavoratori nell'evacuazione
4. Verificare la presenza di tutti al punto di raccolta
5. Relazionare al DL sull'accaduto

📋 **Near miss e infortuni:**
- Registrare OGNI evento (anche quelli senza conseguenze)
- Analizzare le cause con metodo (5 perché, diagramma di Ishikawa)
- Proporre azioni correttive
- Verificare l'efficacia delle azioni intraprese

⚠️ **Il potere di interruzione (Art. 19 comma 1-bis):**
Il preposto DEVE interrompere l'attività se rileva condizioni di pericolo. Non è un'opzione, è un OBBLIGO!

💡 **Trucco:** Meglio fermare il lavoro 10 minuti che l'ospedale per 10 giorni!`,
  },

  // ============================
  // ADDETTO ANTINCENDIO
  // ============================
  {
    topicId: 'antincendio_triangolo',
    title: 'Triangolo del Fuoco e Classi',
    relatedQuestionIds: ['anti_q1', 'anti_q2', 'anti_boss_1'],
    content: `**I fondamenti della prevenzione incendi:**

🔥 **Triangolo del fuoco:**
- **Combustibile** (legno, carta, benzina)
- **Comburente** (ossigeno nell'aria)
- **Innesco** (fiamma, scintilla, calore)

Togli UNO dei tre → l'incendio si spegne!

📊 **Classi di incendio:**
- **A** = Solidi (legno, carta) → acqua, schiuma, polvere
- **B** = Liquidi (benzina, olio) → schiuma, polvere, CO₂
- **C** = Gas (metano, GPL) → polvere, CO₂
- **D** = Metalli (magnesio) → polveri speciali
- **F** = Oli da cucina → estintori specifici classe F

⚠️ **MAI acqua su:** impianti elettrici, classe B (schizza!), classe D (esplosione!)

💡 **Trucco:** "ABCDF" → pensa "A come Albero, B come Benzina, C come Casa (gas), D come Diamante (metallo), F come Frittura"!`,
  },
  {
    topicId: 'antincendio_estintori',
    title: 'Uso degli Estintori',
    relatedQuestionIds: ['anti_q3', 'anti_q4', 'anti_boss_2'],
    content: `**La regola P.A.S.S. per non dimenticare:**

🧯 **P** = Pull → Togli la spina di sicurezza
**A** = Aim → Punta alla BASE delle fiamme
**S** = Squeeze → Premi la leva
**S** = Sweep → Muovi a ventaglio

📐 **Posizionamento:**
- SOPRAVVENTO (vento alle spalle)
- Distanza: 2-3 m (polvere), 1-2 m (CO₂)
- Mai voltare le spalle al focolaio spento

🔧 **Manutenzione:**
- Sorveglianza: ogni mese (visiva)
- Controllo: ogni 6 mesi (tecnico)
- Revisione: 1-3-5 anni (secondo tipo)

💡 **Trucco:** PASS = come in un gioco di carte: Prendi, Punta, Spremi, Spazza!`,
  },
  {
    topicId: 'antincendio_evacuazione',
    title: 'Piano di Evacuazione',
    relatedQuestionIds: ['anti_q5', 'anti_q6', 'anti_boss_3'],
    content: `**In caso di incendio, l'evacuazione salva vite:**

🚪 **Regole d'oro:**
1. Mantenere la CALMA
2. Dare l'ALLARME (pulsante o voce)
3. Se possibile, tentare lo spegnimento (solo fase iniziale!)
4. EVACUARE seguendo le vie di fuga
5. MAI usare l'ascensore
6. Raggiungere il punto di raccolta
7. NON rientrare senza autorizzazione

🏃 **Se c'è fumo:**
- Camminare BASSI (il fumo sale)
- Coprire naso e bocca con panno UMIDO
- Chiudere le porte dietro di sé (rallenta il fuoco)
- Porta calda? NON aprirla!

👥 **Figure dell'evacuazione:**
- Apri-fila: guida il gruppo
- Chiudi-fila: verifica che tutti siano usciti
- Addetto disabili: assiste le persone con mobilità ridotta

💡 **Trucco:** L'ascensore in caso di incendio è una trappola mortale. Scale, sempre scale!`,
  },

  // ============================
  // ADDETTO PRIMO SOCCORSO
  // ============================
  {
    topicId: 'ps_allertare',
    title: 'Allertare i Soccorsi',
    relatedQuestionIds: ['ps_q1', 'ps_q2', 'ps_boss_1'],
    content: `**La chiamata al 112 può salvare una vita:**

📞 **Regola delle 5W:**
- **WHO**: chi sei e il tuo numero
- **WHERE**: indirizzo PRECISO (piano, scala, riferimenti)
- **WHAT**: cosa è successo
- **WHEN**: da quanto tempo
- **HOW MANY**: quante persone coinvolte

🔒 **SSS prima di tutto:**
- **Sicurezza**: la scena è sicura per te?
- **Scena**: cosa è successo? Quanti coinvolti?
- **Situazione**: come sta la vittima?

⚠️ **Regole:**
- NON riattaccare per primo (attendi l'operatore)
- Guanti monouso SEMPRE
- Se la scena non è sicura → NON avvicinarti
- Invia qualcuno ad accogliere l'ambulanza

💡 **Trucco:** 5W = Chi, Dove, Cosa, Quando, Quanti. Ripetile come un mantra prima di chiamare!`,
  },
  {
    topicId: 'ps_bls',
    title: 'BLS e Defibrillatore',
    relatedQuestionIds: ['ps_q3', 'ps_q4', 'ps_boss_2'],
    content: `**Il BLS (Basic Life Support) in sintesi:**

💓 **Sequenza:**
1. Sicurezza → scena sicura?
2. Coscienza → "Signore, mi sente?" + scuotere spalle
3. Aiuto → far chiamare 112 + portare DAE
4. Vie aeree → iperestensione del capo
5. Respiro → GAS (Guardo-Ascolto-Sento) per 10 sec
6. Se non respira → 30 compressioni + 2 ventilazioni

📐 **Compressioni:**
- Centro del torace (metà inferiore sterno)
- Profondità: 5-6 cm
- Frequenza: 100-120/min
- Rilascio completo

🔋 **DAE (Defibrillatore):**
- Usabile anche da NON sanitari (L. 116/2021)
- Segui le istruzioni vocali
- NESSUNO tocchi il paziente durante analisi e shock

💡 **Trucco:** 30:2 al ritmo di "Stayin' Alive" dei Bee Gees (100-120 bpm)!`,
  },
  {
    topicId: 'ps_traumi',
    title: 'Gestione Traumi ed Emorragie',
    relatedQuestionIds: ['ps_q5', 'ps_q6', 'ps_boss_3'],
    content: `**I traumi più comuni sul lavoro:**

🩸 **Emorragie:**
1. Compressione diretta (garza sulla ferita)
2. Sollevamento arto
3. Bendaggio compressivo
4. Laccio emostatico → SOLO se emorragia massiva!

🦴 **Fratture:**
- Immobilizzare nella posizione in cui si trova
- MAI riallineare l'osso
- Ghiaccio avvolto in panno
- Frattura esposta → coprire con garza sterile

🔥 **Ustioni:**
- Raffreddare con acqua 15-20°C per 10-20 min
- MAI ghiaccio direttamente
- MAI burro, olio, dentifricio
- Ustione chimica → lavare 20+ minuti

🌡️ **Colpo di calore:**
- Pelle calda, rossa, SECCA
- Portare al fresco, raffreddare con panni umidi
- Far bere a piccoli sorsi se cosciente

💡 **Trucco:** Per le emorragie pensa "CPB" → Comprimi, Premi, Benda!`,
  },
];

export function getReinforcementForQuestion(questionId: string): ReinforcementTopic | undefined {
  return reinforcementContent.find(r => r.relatedQuestionIds.includes(questionId));
}
