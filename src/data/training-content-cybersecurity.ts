// Modulo Cybersecurity - Gamification & Security Awareness
// Ispirato all'approccio micro-learning + gamification per la sicurezza informatica aziendale

import type { ModuleContent } from './training-content';

export const cybersecurityContent: ModuleContent = {
  moduleId: 'cybersecurity-awareness',
  sections: [
    // --- SEZIONE 1: Introduzione alla Cyber Security Awareness ---
    {
      id: 'cyber-intro',
      title: 'Perché la Cybersecurity Riguarda Tutti',
      type: 'lesson',
      content: `## 🛡️ La Sicurezza Informatica Inizia dalle Persone

Nel panorama digitale attuale, le minacce informatiche si moltiplicano ogni giorno. **Phishing, ransomware e social engineering** restano tra i principali pericoli per le aziende italiane.

### Il fattore umano è decisivo

- Il **95% degli attacchi informatici** ha successo grazie a un errore umano
- Un singolo clic su un link malevolo può compromettere un'intera rete aziendale
- La consapevolezza dei collaboratori è l'arma più efficace contro le minacce

### Cosa imparerai in questo modulo

1. **Riconoscere le minacce** più comuni (phishing, social engineering, malware)
2. **Gestire password e credenziali** in modo sicuro
3. **Proteggere dati aziendali** e personali
4. **Reagire correttamente** in caso di incidente informatico

> 💡 Questo modulo utilizza un approccio di **micro-learning gamificato**: sessioni brevi, quiz interattivi e scenari realistici per un apprendimento efficace e duraturo.`,
      minTimeSeconds: 90,
      xpReward: 15,
    },
    {
      id: 'cyber-intro-quiz',
      title: 'Quiz: Consapevolezza Base',
      type: 'quiz',
      questions: [
        {
          id: 'cq1',
          question: 'Qual è la percentuale di attacchi informatici che hanno successo grazie a un errore umano?',
          options: ['50%', '75%', '95%', '30%'],
          correctIndex: 2,
          explanation: 'Il 95% degli attacchi informatici ha successo a causa di errori umani, come cliccare su link malevoli o usare password deboli.',
          xpReward: 10,
          difficulty: 'easy',
        },
        {
          id: 'cq2',
          question: 'Quale di queste NON è una minaccia informatica comune?',
          options: ['Phishing', 'Ransomware', 'Firewall', 'Social Engineering'],
          correctIndex: 2,
          explanation: 'Il firewall è uno strumento di protezione, non una minaccia. Phishing, ransomware e social engineering sono invece tecniche di attacco.',
          xpReward: 10,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 20,
    },

    // --- SEZIONE 2: Phishing e Social Engineering ---
    {
      id: 'cyber-phishing',
      title: 'Phishing: Riconoscere le Email Trappola',
      type: 'lesson',
      content: `## 🎣 Il Phishing: L'Attacco Più Diffuso

Il **phishing** è una tecnica di attacco che utilizza email, messaggi o siti web contraffatti per ingannare le vittime e sottrarre informazioni sensibili.

### Come riconoscere un tentativo di phishing

**🔴 Segnali d'allarme nelle email:**
- **Mittente sospetto**: indirizzi email simili ma non identici a quelli legittimi (es. supporto@banca-italiia.com)
- **Urgenza artificiale**: "Il tuo account verrà bloccato entro 24 ore!"
- **Link mascherati**: il testo del link dice una cosa, ma l'URL reale punta altrove
- **Allegati imprevisti**: file .exe, .zip o documenti con macro
- **Errori grammaticali**: spesso tradotti automaticamente da altre lingue

### Tipologie di phishing

| Tipo | Descrizione | Target |
|------|-------------|--------|
| **Email phishing** | Email massive a migliaia di indirizzi | Chiunque |
| **Spear phishing** | Email personalizzate e mirate | Individui specifici |
| **Whaling** | Attacchi mirati ai dirigenti | C-suite, manager |
| **Smishing** | Phishing via SMS | Utenti mobile |
| **Vishing** | Phishing telefonico | Tutti |

### La regola d'oro
> **Quando hai un dubbio, NON cliccare.** Contatta il mittente tramite un canale alternativo per verificare.`,
      minTimeSeconds: 120,
      xpReward: 20,
    },
    {
      id: 'cyber-phishing-npc',
      title: 'Scenario: Email Sospetta in Arrivo',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Marco', role: 'Collega IT', text: 'Ehi, hai visto l\'email che è arrivata stamattina dalla "direzione"? Dice di aggiornare urgentemente le credenziali...' },
        { speaker: 'Sara', role: 'Responsabile Sicurezza', text: 'Attenzione! Quell\'email NON è della direzione. L\'indirizzo mittente è leggermente diverso. È un tentativo di spear phishing mirato alla nostra azienda.' },
        { speaker: 'Marco', role: 'Collega IT', text: 'Ma sembrava così reale! Aveva il nostro logo e tutto...' },
        { speaker: 'Sara', role: 'Responsabile Sicurezza', text: 'Esatto, i phisher sono sempre più sofisticati. Ricorda: la direzione non chiede MAI le credenziali via email. Nel dubbio, chiama direttamente.' },
      ],
      minTimeSeconds: 60,
      xpReward: 15,
    },
    {
      id: 'cyber-phishing-quiz',
      title: 'Quiz: Sei Immune al Phishing?',
      type: 'quiz',
      questions: [
        {
          id: 'cq3',
          question: 'Ricevi un\'email dalla banca che chiede di "verificare urgentemente" i tuoi dati. Cosa fai?',
          options: [
            'Clicco sul link e inserisco i miei dati',
            'Chiamo la banca al numero ufficiale per verificare',
            'Rispondo all\'email chiedendo conferma',
            'Inoltro l\'email ai colleghi per chiedere consiglio',
          ],
          correctIndex: 1,
          explanation: 'Mai cliccare sui link nelle email sospette. Contatta sempre la banca tramite il numero ufficiale (quello sul sito o sulla carta).',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'cq4',
          question: 'Quale di questi è un segnale di phishing?',
          options: [
            'Email da un indirizzo @azienda.it con firma digitale',
            'Messaggio che chiede un aggiornamento urgente delle credenziali',
            'Newsletter con link di disiscrizione',
            'Comunicazione interna con allegato PDF firmato',
          ],
          correctIndex: 1,
          explanation: 'Le richieste urgenti di aggiornamento credenziali sono il segnale di phishing più comune. Le aziende legittime non chiedono mai le password via email.',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'cq5',
          question: 'Cos\'è lo "spear phishing"?',
          options: [
            'Un attacco phishing via SMS',
            'Un attacco generico a migliaia di utenti',
            'Un attacco personalizzato e mirato a un individuo specifico',
            'Un tipo di malware che si diffonde via email',
          ],
          correctIndex: 2,
          explanation: 'Lo spear phishing è un attacco mirato che utilizza informazioni personali della vittima per rendere il messaggio più credibile e convincente.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 25,
    },

    // --- SEZIONE 3: Password e Autenticazione ---
    {
      id: 'cyber-passwords',
      title: 'Password Sicure e Autenticazione',
      type: 'lesson',
      content: `## 🔐 La Prima Linea di Difesa: Le Password

Le password deboli sono la porta d'ingresso più facile per gli attaccanti. Ecco come proteggerti.

### Regole per una password sicura

✅ **Lunghezza minima 12 caratteri** — più è lunga, più è sicura
✅ **Combinazione di**: maiuscole, minuscole, numeri, simboli
✅ **Unica per ogni servizio** — mai riutilizzare la stessa password
✅ **Nessuna informazione personale** — no date di nascita, nomi familiari, squadre del cuore

### ❌ Password da evitare assolutamente
- \`password123\`, \`12345678\`, \`qwerty\`
- \`NomeCognome2024\`, \`MarioRossi!\`
- Qualsiasi parola presente nel dizionario

### Password Manager: il tuo alleato
Un **password manager** genera e memorizza password complesse per te. Devi ricordare solo una master password.

### Autenticazione a Due Fattori (2FA)
L'**autenticazione a due fattori** aggiunge un livello di sicurezza: anche se qualcuno ruba la tua password, non potrà accedere senza il secondo fattore (SMS, app, token fisico).

| Metodo 2FA | Sicurezza | Praticità |
|------------|-----------|-----------|
| SMS | ⭐⭐ | ⭐⭐⭐ |
| App Authenticator | ⭐⭐⭐ | ⭐⭐⭐ |
| Token hardware | ⭐⭐⭐⭐ | ⭐⭐ |
| Biometria | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |`,
      minTimeSeconds: 120,
      xpReward: 20,
    },
    {
      id: 'cyber-passwords-quiz',
      title: 'Quiz: Gestione Password',
      type: 'quiz',
      questions: [
        {
          id: 'cq6',
          question: 'Quale di queste è la password più sicura?',
          options: [
            'MarioRossi1990!',
            'P@ssw0rd',
            'Kx$9mN#vL2pQ!wZr',
            'IlMioGatto2024',
          ],
          correctIndex: 2,
          explanation: 'Una password casuale con mix di caratteri e lunga almeno 16 caratteri è la più sicura. Le altre contengono parole comuni o dati personali facilmente indovinabili.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'cq7',
          question: 'Perché è importante non riutilizzare le stesse password?',
          options: [
            'Per ricordarle meglio',
            'Perché se un servizio viene violato, tutti gli altri account restano protetti',
            'Per rispettare la policy aziendale',
            'Non è importante, basta che sia complessa',
          ],
          correctIndex: 1,
          explanation: 'Se riusi una password e un servizio subisce un data breach, gli attaccanti proveranno quella password su tutti gli altri tuoi account (credential stuffing).',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'cq8',
          question: 'Qual è il metodo 2FA più sicuro?',
          options: [
            'SMS',
            'Email',
            'App Authenticator o Token hardware',
            'Domanda segreta',
          ],
          correctIndex: 2,
          explanation: 'App Authenticator e token hardware sono i metodi più sicuri. Gli SMS possono essere intercettati (SIM swapping) e le domande segrete sono facilmente indovinabili.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 25,
    },

    // --- SEZIONE 4: Ransomware e Malware ---
    {
      id: 'cyber-malware',
      title: 'Ransomware e Malware: Difendersi',
      type: 'lesson',
      content: `## 🦠 Malware e Ransomware: Minacce in Crescita

### Cos'è il Ransomware?
Il **ransomware** è un tipo di malware che cifra i file del computer della vittima e chiede un **riscatto** (ransom) per restituirli. È una delle minacce più devastanti per le PMI.

### Come si viene infettati

1. **Allegati email malevoli** — file Word/Excel con macro, PDF infetti
2. **Download da siti compromessi** — software "gratuito" che contiene malware
3. **Chiavette USB sconosciute** — mai inserire dispositivi trovati o non verificati
4. **Vulnerabilità software** — sistemi non aggiornati con falle note

### Come proteggersi

**🛡️ Prevenzione:**
- Mantieni **sempre aggiornati** sistema operativo e software
- Non aprire **mai allegati sospetti**
- Esegui **backup regolari** su supporti disconnessi dalla rete
- Usa un **antivirus aggiornato** e attivo

**🚨 Se vieni colpito:**
1. **Disconnetti immediatamente** il computer dalla rete (cavo e WiFi)
2. **Non pagare il riscatto** — non garantisce il recupero dei dati e finanzia i criminali
3. **Avvisa subito il reparto IT** o il responsabile sicurezza
4. **Non spegnere il computer** — potrebbe servire per l'analisi forense

### I numeri del ransomware in Italia
- **+40% di attacchi** nel 2024 rispetto all'anno precedente
- Costo medio di un attacco per una PMI: **€50.000 - €200.000**
- Tempo medio di ripristino: **23 giorni lavorativi**`,
      minTimeSeconds: 120,
      xpReward: 20,
    },
    {
      id: 'cyber-malware-quiz',
      title: 'Quiz: Difesa dal Malware',
      type: 'quiz',
      questions: [
        {
          id: 'cq9',
          question: 'Trovi una chiavetta USB nel parcheggio aziendale. Cosa fai?',
          options: [
            'La inserisco nel mio computer per vedere cosa contiene',
            'La consegno al reparto IT senza inserirla in nessun dispositivo',
            'La butto nella spazzatura',
            'La regalo a un collega',
          ],
          correctIndex: 1,
          explanation: 'Mai inserire dispositivi USB sconosciuti! Potrebbero contenere malware. Consegnali sempre al reparto IT per un\'analisi sicura.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'cq10',
          question: 'Il tuo computer mostra un messaggio che chiede un riscatto in Bitcoin. Qual è la prima cosa da fare?',
          options: [
            'Pagare il riscatto per recuperare i file',
            'Spegnere il computer e riaccenderlo',
            'Disconnettere il computer dalla rete e avvisare il reparto IT',
            'Continuare a lavorare ignorando il messaggio',
          ],
          correctIndex: 2,
          explanation: 'In caso di ransomware: disconnetti subito dalla rete per evitare la propagazione, poi avvisa il reparto IT. Non pagare mai il riscatto e non spegnere il PC.',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'cq11',
          question: 'Quale di queste azioni NON aiuta a prevenire un\'infezione da malware?',
          options: [
            'Aggiornare regolarmente il sistema operativo',
            'Usare la stessa password per semplicità',
            'Eseguire backup regolari',
            'Mantenere l\'antivirus aggiornato',
          ],
          correctIndex: 1,
          explanation: 'Usare la stessa password non previene il malware, anzi aumenta il rischio. Aggiornamenti, backup e antivirus sono le tre difese fondamentali.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 25,
    },

    // --- SEZIONE 5: Protezione dei Dati e Privacy ---
    {
      id: 'cyber-data-protection',
      title: 'Protezione Dati Aziendali e GDPR',
      type: 'lesson',
      content: `## 📊 Proteggere i Dati: Un Obbligo e una Responsabilità

### Classificazione dei dati aziendali

| Livello | Esempio | Protezione |
|---------|---------|------------|
| **Pubblico** | Brochure, sito web | Nessuna restrizione |
| **Interno** | Procedure, organigrammi | Solo dipendenti |
| **Riservato** | Dati clienti, bilanci | Accesso ristretto |
| **Segreto** | Proprietà intellettuale, strategie | Crittografia obbligatoria |

### Buone pratiche quotidiane

**💻 Sul posto di lavoro:**
- **Blocca il PC** quando ti allontani (Win+L o Cmd+Ctrl+Q)
- Non lasciare documenti sensibili sulla scrivania (**clean desk policy**)
- Usa solo **servizi cloud aziendali** approvati, mai account personali

**📱 Fuori dall'ufficio:**
- In smart working usa solo la **VPN aziendale**
- Non lavorare su **WiFi pubbliche** senza VPN
- Non discutere informazioni riservate in luoghi pubblici

**📧 Nella comunicazione:**
- Verifica sempre i destinatari prima di inviare dati sensibili
- Usa la **crittografia email** per informazioni riservate
- Attenzione al **CC e CCN** — un errore può esporre dati a terzi

### GDPR: cosa devi sapere
Il Regolamento Europeo sulla Privacy prevede **sanzioni fino a 20 milioni di euro** o il 4% del fatturato. Ogni dipendente è responsabile della protezione dei dati che tratta.`,
      minTimeSeconds: 120,
      xpReward: 20,
    },
    {
      id: 'cyber-data-quiz',
      title: 'Quiz: Protezione Dati',
      type: 'quiz',
      questions: [
        {
          id: 'cq12',
          question: 'Stai lavorando in un bar in smart working. Quale precauzione è la più importante?',
          options: [
            'Sedersi lontano dalla finestra',
            'Usare la VPN aziendale e non connettersi al WiFi pubblico senza protezione',
            'Alzare la luminosità dello schermo',
            'Lavorare solo per poche ore',
          ],
          correctIndex: 1,
          explanation: 'La VPN cripta tutto il traffico rendendo impossibile l\'intercettazione. Il WiFi pubblico è uno dei vettori di attacco più comuni.',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'cq13',
          question: 'Devi inviare un file con dati sensibili a un collega. Qual è il metodo più sicuro?',
          options: [
            'Allegato email senza protezione',
            'WhatsApp personale',
            'Piattaforma cloud aziendale con link protetto da password',
            'Chiavetta USB lasciata sulla scrivania del collega',
          ],
          correctIndex: 2,
          explanation: 'La piattaforma cloud aziendale con link protetto garantisce tracciabilità, crittografia e controllo degli accessi. Mai usare canali personali per dati aziendali.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 20,
    },

    // --- SEZIONE 6: Incident Response ---
    {
      id: 'cyber-incident',
      title: 'Cosa Fare in Caso di Incidente',
      type: 'lesson',
      content: `## 🚨 Incident Response: Reagire Velocemente

### Quando segnalare un incidente

Devi segnalare **immediatamente** se:
- Ricevi un'email di phishing (anche se non hai cliccato)
- Noti attività insolite sul tuo computer
- Scopri un accesso non autorizzato ai tuoi account
- Perdi un dispositivo aziendale (laptop, telefono, chiavetta)
- Un collega ti chiede credenziali in modo sospetto

### La catena di segnalazione

1. 🛑 **STOP** — Interrompi l'attività sospetta
2. 📞 **SEGNALA** — Contatta il reparto IT / responsabile sicurezza
3. 📝 **DOCUMENTA** — Annota cosa è successo, quando e come
4. 🔒 **CONTIENI** — Se possibile, disconnetti il dispositivo dalla rete
5. ⏳ **ATTENDI** — Non tentare di risolvere da solo, aspetta le istruzioni

### Cosa NON fare
- ❌ Non tentare di "aggiustare" da solo
- ❌ Non cancellare email sospette (servono come prova)
- ❌ Non parlare dell'incidente sui social media
- ❌ Non ignorare segnali sospetti pensando che "non sia niente"`,
      minTimeSeconds: 90,
      xpReward: 20,
    },
    {
      id: 'cyber-incident-npc',
      title: 'Scenario: Incidente in Corso',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Luca', role: 'Dipendente', text: 'Ho cliccato su un link in un\'email e ora il mio computer si comporta in modo strano... Finestre che si aprono da sole, programmi che non rispondono...' },
        { speaker: 'Anna', role: 'IT Security', text: 'Luca, stacca subito il cavo di rete e disattiva il WiFi! Non spegnere il computer, ma non toccare nulla.' },
        { speaker: 'Luca', role: 'Dipendente', text: 'Fatto! Ma ho paura di aver compromesso anche i file del server...' },
        { speaker: 'Anna', role: 'IT Security', text: 'Hai fatto bene a segnalare subito. Disconnettendo rapidamente hai limitato i danni. Ora documenta esattamente cosa hai cliccato e quando. Ci occupiamo noi del resto.' },
        { speaker: 'Anna', role: 'IT Security', text: 'Ricorda: segnalare un incidente non è una colpa. La velocità di reazione fa la differenza tra un problema gestibile e un disastro.' },
      ],
      minTimeSeconds: 60,
      xpReward: 15,
    },

    // --- SEZIONE 7: Boss Test Finale ---
    {
      id: 'cyber-boss-test',
      title: '🏆 Boss Test: Cybersecurity Awareness',
      type: 'boss_test',
      questions: [
        {
          id: 'cb1',
          question: 'Un fornitore ti chiama chiedendo le credenziali VPN per "risolvere un problema urgente". Cosa fai?',
          options: [
            'Gliele fornisco per risolvere il problema velocemente',
            'Rifiuto e verifico con il reparto IT se la richiesta è legittima',
            'Gli invio le credenziali via email crittografata',
            'Lo rimando a domani per verificare',
          ],
          correctIndex: 1,
          explanation: 'Mai fornire credenziali a terzi, anche se sembrano legittimi. Questa è una tecnica di social engineering (vishing). Verifica sempre con l\'IT.',
          xpReward: 20,
          difficulty: 'hard',
        },
        {
          id: 'cb2',
          question: 'Quale combinazione di misure offre la migliore protezione contro gli attacchi informatici?',
          options: [
            'Solo un buon antivirus',
            'Password complesse + 2FA + aggiornamenti + backup + consapevolezza',
            'Firewall aziendale + VPN',
            'Cambiare password ogni settimana',
          ],
          correctIndex: 1,
          explanation: 'La sicurezza informatica richiede un approccio multilivello (defense in depth). Nessuna singola misura è sufficiente da sola.',
          xpReward: 20,
          difficulty: 'hard',
        },
        {
          id: 'cb3',
          question: 'Ricevi un\'email dal CEO che chiede un bonifico urgente a un nuovo fornitore. L\'email sembra autentica. Cosa fai?',
          options: [
            'Eseguo il bonifico — è il CEO',
            'Verifico telefonicamente con il CEO usando il numero che ho in rubrica',
            'Rispondo all\'email chiedendo conferma',
            'Inoltro l\'email al mio responsabile',
          ],
          correctIndex: 1,
          explanation: 'Questo è un classico attacco "CEO Fraud" o BEC (Business Email Compromise). Verifica SEMPRE richieste di pagamento tramite un canale diverso dall\'email.',
          xpReward: 20,
          difficulty: 'hard',
        },
        {
          id: 'cb4',
          question: 'Quale di queste è la conseguenza più grave di un data breach per un\'azienda secondo il GDPR?',
          options: [
            'Obbligo di cambiare tutte le password',
            'Sanzioni fino a 20 milioni di euro o 4% del fatturato globale',
            'Blocco dell\'accesso a Internet per 30 giorni',
            'Obbligo di assumere un consulente esterno',
          ],
          correctIndex: 1,
          explanation: 'Il GDPR prevede sanzioni molto severe: fino a 20 milioni di euro o il 4% del fatturato annuo mondiale, a seconda di quale importo sia maggiore.',
          xpReward: 20,
          difficulty: 'hard',
        },
        {
          id: 'cb5',
          question: 'In smart working, quale di queste azioni rappresenta il rischio maggiore per la sicurezza?',
          options: [
            'Usare il monitor esterno personale',
            'Connettersi al WiFi pubblico di un bar senza VPN per accedere ai sistemi aziendali',
            'Lavorare con la porta dell\'ufficio chiusa',
            'Usare cuffie bluetooth per le call',
          ],
          correctIndex: 1,
          explanation: 'Connettersi a WiFi pubbliche senza VPN espone tutto il traffico a possibili intercettazioni (attacchi man-in-the-middle). Usa sempre la VPN aziendale.',
          xpReward: 20,
          difficulty: 'hard',
        },
        {
          id: 'cb6',
          question: 'Quale tecnica di social engineering sfrutta la "curiosità" della vittima?',
          options: [
            'Baiting (es. chiavetta USB abbandonata)',
            'Pretexting (creare un pretesto falso)',
            'Tailgating (entrare fisicamente dietro qualcuno)',
            'Quid pro quo (offrire qualcosa in cambio)',
          ],
          correctIndex: 0,
          explanation: 'Il baiting sfrutta la curiosità naturale delle persone, come lasciare una chiavetta USB in un luogo dove qualcuno la troverà e la inserirà nel proprio computer.',
          xpReward: 20,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 120,
      xpReward: 50,
    },
  ],
};
