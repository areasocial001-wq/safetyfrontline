// Detailed multilingual normative database for occupational safety risks.
// Each category returns: short title, article reference, obligation text, next steps and a contextual tip.

import type { Lang } from './risk-i18n';

export type RiskCategory =
  | 'fire_extinguisher' | 'emergency_exit' | 'electrical' | 'shelf_stability'
  | 'ppe' | 'scaffold' | 'excavation' | 'machinery' | 'slippery_floor'
  | 'cyber_credentials' | 'cyber_screen' | 'cyber_phishing' | 'cyber_usb'
  | 'cyber_documents' | 'cyber_password' | 'cyber_wifi' | 'cyber_print'
  | 'fire_source' | 'fire_door' | 'emergency_alarm' | 'emergency_lighting'
  | 'evacuation_plan' | 'overload' | 'generic_high' | 'generic_low';

export interface NormativeEntry {
  title: string;        // short legal source title
  articles: string;     // concrete article numbers
  obligation: string;   // the duty in clear language
  nextSteps: string[];  // 2-3 concrete actions
  tip: string;          // contextual hint shown during highlight
}

const DB: Record<Lang, Record<RiskCategory, NormativeEntry>> = {
  it: {
    fire_extinguisher: {
      title: 'D.Lgs. 81/08 + D.M. 10/03/1998 + UNI 9994-1',
      articles: 'art. 46 D.Lgs. 81/08; All. V D.M. 10/03/1998',
      obligation: 'Estintori sempre accessibili, segnalati con cartello UNI EN ISO 7010 e sottoposti a manutenzione semestrale. Vietato ostruire, spostare o coprire il dispositivo.',
      nextSteps: [
        'Liberare immediatamente l\'area di accesso (almeno 60 cm liberi)',
        'Verificare il manometro e il cartello di segnalazione',
        'Annotare l\'evento e segnalare al RSPP per controllo straordinario',
      ],
      tip: 'Un estintore inaccessibile equivale a un estintore assente: in caso di principio di incendio si perdono i 30 secondi utili.',
    },
    emergency_exit: {
      title: 'D.Lgs. 81/08 Allegato IV §1.5',
      articles: 'art. 64 D.Lgs. 81/08; All. IV punto 1.5.4 e 1.5.5',
      obligation: 'Le vie e uscite di emergenza devono restare sempre sgombre, apribili dall\'interno senza chiave e di larghezza adeguata al massimo affollamento.',
      nextSteps: [
        'Rimuovere immediatamente qualunque ostacolo dalla via di fuga',
        'Verificare che il maniglione antipanico funzioni',
        'Apporre cartello di divieto deposito materiali (UNI EN ISO 7010 P002)',
      ],
      tip: 'Anche un solo cartone può rallentare un\'evacuazione di 10-15 secondi: in un incendio è la differenza tra fuga e intossicazione.',
    },
    electrical: {
      title: 'D.Lgs. 81/08 Titolo III + CEI 64-8',
      articles: 'artt. 80-86 D.Lgs. 81/08; CEI 64-8 cap. 41',
      obligation: 'Impianti e cavi elettrici devono essere protetti da contatti diretti e indiretti, con interruttori differenziali e messa a terra. Cavi danneggiati vanno fuori servizio immediato.',
      nextSteps: [
        'NON toccare il cavo: togliere tensione dal quadro generale',
        'Delimitare la zona con nastro o cartello "Tensione elettrica pericolosa"',
        'Chiamare un elettricista qualificato (PES/PAV) per la sostituzione',
      ],
      tip: '50 V in alternata bastano per provocare fibrillazione: mai improvvisare riparazioni con nastro adesivo.',
    },
    shelf_stability: {
      title: 'D.Lgs. 81/08 + UNI EN 15635',
      articles: 'art. 64 e All. IV §1.1; UNI EN 15635:2009',
      obligation: 'Scaffalature industriali devono essere ancorate, riportare la portata massima per ripiano ed essere ispezionate annualmente da personale PRSES.',
      nextSteps: [
        'Evacuare immediatamente l\'area sottostante e adiacente',
        'Scaricare gradualmente i ripiani partendo dall\'alto',
        'Bloccare l\'uso fino a verifica strutturale documentata',
      ],
      tip: 'Una scaffalatura sovraccarica può collassare a catena: il rischio non è solo per chi è davanti ma per tutto il magazzino.',
    },
    ppe: {
      title: 'D.Lgs. 81/08 Titolo III Capo II',
      articles: 'artt. 74-79 e All. VIII; Reg. UE 2016/425',
      obligation: 'Il datore di lavoro fornisce DPI conformi al rischio specifico; il lavoratore è obbligato a indossarli e ha responsabilità diretta in caso di omissione.',
      nextSteps: [
        'Fermare l\'attività fino al ripristino dei DPI corretti',
        'Verificare data di scadenza e certificazione CE marcata',
        'Registrare la non conformità nel registro infortuni/quasi-infortuni',
      ],
      tip: 'Il 30% degli infortuni mortali in cantiere è legato al mancato uso di casco o imbracatura: nessun lavoro vale una vita.',
    },
    scaffold: {
      title: 'D.Lgs. 81/08 Titolo IV Capo II',
      articles: 'artt. 122-138 D.Lgs. 81/08; D.I. 22/05/1992 n. 466',
      obligation: 'Ponteggi metallici fissi richiedono Pi.M.U.S., parapetti a 1 m con corrente intermedio e tavola fermapiede, montaggio da parte di personale formato (corso 28 ore).',
      nextSteps: [
        'Vietare l\'accesso al ponteggio con cartello e transenna',
        'Verificare presenza di Pi.M.U.S. firmato dal preposto',
        'Far ripristinare la struttura prima di qualsiasi salita',
      ],
      tip: 'Le cadute dall\'alto sono la prima causa di morte in edilizia: il ponteggio non è un "supporto temporaneo", è un\'opera provvisionale normata.',
    },
    excavation: {
      title: 'D.Lgs. 81/08 Titolo IV Capo II Sez. III',
      articles: 'artt. 118-121 D.Lgs. 81/08',
      obligation: 'Scavi oltre 1,5 m di profondità richiedono armatura delle pareti o scarpa naturale, parapetti a margine e segnalazione perimetrale luminosa di notte.',
      nextSteps: [
        'Allontanare immediatamente i lavoratori dal ciglio',
        'Posizionare parapetti normati o transenne pesanti',
        'Verificare con il CSE le armature previste dal POS',
      ],
      tip: 'Un metro cubo di terra pesa ~1.800 kg: un seppellimento parziale anche di 50 cm è già potenzialmente letale.',
    },
    machinery: {
      title: 'D.Lgs. 81/08 Titolo III + Accordo Stato-Regioni 22/02/2012',
      articles: 'artt. 71-73 e All. VI; Allegato A Accordo SR 22/02/2012',
      obligation: 'Operatore abilitato con patentino specifico, zone di manovra delimitate, moviere a terra obbligatorio per retromarcia in punto cieco e separazione fisica delle vie pedonali.',
      nextSteps: [
        'Fermare il mezzo e disinserire la chiave',
        'Delimitare la zona di rotazione del braccio (raggio +1 m)',
        'Designare un moviere formato per ogni manovra in retromarcia',
      ],
      tip: 'Il 20% degli infortuni mortali in cantiere coinvolge mezzi semoventi: il punto cieco di un escavatore copre fino a 7 m.',
    },
    slippery_floor: {
      title: 'D.Lgs. 81/08 Allegato IV §1.3',
      articles: 'All. IV §1.3.2; UNI EN 13036-4',
      obligation: 'Pavimenti antiscivolo (R10 minimo per zone umide), asciugatura immediata di liquidi versati e segnalazione obbligatoria con cartello "Pavimento bagnato" UNI EN ISO 7010 W015.',
      nextSteps: [
        'Posizionare subito il cartello "Pavimento bagnato"',
        'Asciugare con segatura o panni assorbenti',
        'Verificare la causa della perdita ed eliminarla',
      ],
      tip: 'Le cadute in piano sono la 2ª causa di infortunio in Italia: un cartello costa 5€, una frattura del femore costa mesi di assenza.',
    },
    cyber_credentials: {
      title: 'GDPR Reg. UE 2016/679 + ISO/IEC 27001',
      articles: 'art. 32 GDPR; ISO/IEC 27001:2022 controllo A.5.17',
      obligation: 'Le credenziali sono dati personali e devono essere conservate in modo riservato. La policy aziendale vieta di scrivere password su supporti cartacei o digitali non cifrati.',
      nextSteps: [
        'Distruggere immediatamente il post-it (trita-documenti)',
        'Forzare il cambio password dell\'account compromesso',
        'Usare un password manager aziendale (es. Bitwarden, 1Password)',
      ],
      tip: 'L\'81% dei data breach inizia da credenziali deboli o esposte: una password vale più di una chiave fisica.',
    },
    cyber_screen: {
      title: 'GDPR + Clean Desk Policy aziendale',
      articles: 'art. 32 GDPR; ISO/IEC 27001:2022 A.7.7',
      obligation: 'Obbligo di blocco automatico schermo dopo max 10 minuti di inattività e blocco manuale (Win+L / Cmd+Ctrl+Q) ogni volta che ci si allontana.',
      nextSteps: [
        'Bloccare immediatamente la sessione (Win+L)',
        'Configurare il blocco automatico a 5 minuti',
        'Formare il team sulla clean desk policy',
      ],
      tip: 'In 30 secondi un malintenzionato può installare un keylogger USB: il blocco schermo è il dispositivo di protezione personale digitale.',
    },
    cyber_phishing: {
      title: 'NIS2 + GDPR + Linee guida AgID',
      articles: 'Direttiva UE 2022/2555 (NIS2); art. 32 GDPR',
      obligation: 'Le email sospette non vanno aperte né cliccate. Vanno segnalate al referente sicurezza informatica tramite il pulsante "Report Phishing" o inoltrate a abuse@.',
      nextSteps: [
        'NON cliccare link né scaricare allegati',
        'Inoltrare l\'email al SOC / referente IT',
        'Eliminare l\'email dopo conferma del SOC',
      ],
      tip: 'Il 90% dei ransomware entra via email di phishing: dubita sempre di urgenze, premi e bonifici sospetti.',
    },
    cyber_usb: {
      title: 'GDPR + ISO/IEC 27001 + Policy BYOD aziendale',
      articles: 'art. 32 GDPR; ISO/IEC 27001:2022 A.7.10 e A.8.7',
      obligation: 'Vietato collegare dispositivi USB non autorizzati; le porte USB possono essere disabilitate via GPO. Solo chiavette aziendali cifrate (AES-256) sono ammesse.',
      nextSteps: [
        'Estrarre immediatamente il dispositivo (no eject sicuro)',
        'Avviare scansione antivirus completa',
        'Segnalare al SOC per analisi forense del device',
      ],
      tip: 'Una chiavetta USB lasciata "per caso" nel parcheggio è una tecnica di attacco reale chiamata "USB drop": funziona nel 60% dei casi.',
    },
    cyber_documents: {
      title: 'GDPR + Clean Desk Policy',
      articles: 'artt. 5 e 32 GDPR; ISO/IEC 27001:2022 A.7.7',
      obligation: 'Documenti contenenti dati personali devono essere riposti in armadi chiusi a chiave a fine giornata e durante le pause; vietato lasciarli su scrivanie aperte.',
      nextSteps: [
        'Riporre i documenti in cassettiera con serratura',
        'Distruggere i documenti non più necessari (trita-documenti)',
        'Verificare la classificazione del documento (pubblico/interno/riservato)',
      ],
      tip: 'Il Garante Privacy ha sanzionato aziende fino a 100.000 € per documenti riservati lasciati visibili in uffici condivisi.',
    },
    cyber_password: {
      title: 'GDPR + NIST SP 800-63B',
      articles: 'art. 32 GDPR; NIST SP 800-63B §5.1.1',
      obligation: 'Password con almeno 12 caratteri, mix di maiuscole/minuscole/numeri/simboli, non riutilizzate. Password come "123456" o "password" sono nella top 10 delle credenziali violate dal 2009.',
      nextSteps: [
        'Cambiare immediatamente la password con una robusta',
        'Attivare l\'autenticazione multi-fattore (MFA/2FA)',
        'Usare un password manager per generare password uniche',
      ],
      tip: 'Una password di 8 caratteri viene craccata in <1 ora; una di 14 caratteri richiede secoli con la stessa potenza di calcolo.',
    },
    cyber_wifi: {
      title: 'GDPR + Policy rete aziendale',
      articles: 'art. 32 GDPR; ISO/IEC 27001:2022 A.8.20-A.8.22',
      obligation: 'Vietato creare hotspot personali connessi alla rete aziendale: bypassano firewall, IDS/IPS e controlli di accesso, esponendo dati interni.',
      nextSteps: [
        'Disattivare immediatamente l\'hotspot',
        'Disconnettere lo smartphone dalla rete cablata',
        'Usare la rete WiFi guest aziendale per dispositivi personali',
      ],
      tip: 'Un hotspot non protetto trasmette in chiaro: chiunque nel raggio di 30 m può intercettare il traffico con strumenti gratuiti.',
    },
    cyber_print: {
      title: 'GDPR + Clean Desk Policy',
      articles: 'art. 32 GDPR; ISO/IEC 27001:2022 A.7.10',
      obligation: 'Le stampanti condivise devono usare il "pull-printing" con sblocco tramite badge/PIN; documenti non ritirati vanno distrutti, mai lasciati nel vassoio.',
      nextSteps: [
        'Ritirare immediatamente le stampe',
        'Distruggere documenti non più utili nel trita-documenti',
        'Configurare la stampa sicura con badge sulle stampanti aziendali',
      ],
      tip: 'I dati di clienti lasciati in stampa sono una delle violazioni GDPR più comuni e facilmente evitabili.',
    },
    fire_source: {
      title: 'D.Lgs. 81/08 + D.M. 10/03/1998 + Codice di Prevenzione Incendi',
      articles: 'art. 46 D.Lgs. 81/08; D.M. 03/08/2015 (Cod. Prev. Inc.)',
      obligation: 'Principio di incendio: attivare immediatamente l\'allarme, NON tentare lo spegnimento se il fuoco supera le dimensioni di un cestino, evacuare e chiamare il 115.',
      nextSteps: [
        'Premere il pulsante allarme antincendio più vicino',
        'Allontanare materiali combustibili circostanti se sicuro',
        'Usare estintore appropriato (CO₂ per elettrico, polvere per A-B-C)',
      ],
      tip: 'Un incendio raddoppia di superficie ogni 30 secondi: i primi 2 minuti decidono se è gestibile o catastrofico.',
    },
    fire_door: {
      title: 'D.M. 03/08/2015 + UNI EN 1634-1',
      articles: 'D.M. 03/08/2015 V.6; UNI EN 1634-1:2018',
      obligation: 'Le porte tagliafuoco (REI 60/90/120) devono restare chiuse o agganciate a magneti collegati alla centrale antincendio che le sbloccano in caso di allarme. VIETATO uso di cunei.',
      nextSteps: [
        'Rimuovere immediatamente il cuneo',
        'Verificare che la porta si chiuda completamente',
        'Installare elettromagnete con sblocco automatico se serve apertura',
      ],
      tip: 'Una porta REI 90 trattiene fumo e fiamme per 90 minuti: bloccata aperta vale ZERO.',
    },
    emergency_alarm: {
      title: 'D.Lgs. 81/08 + D.M. 10/03/1998',
      articles: 'art. 43 D.Lgs. 81/08; D.M. 10/03/1998 punto 4',
      obligation: 'I pulsanti di allarme manuale (rossi, infrangibili) devono essere visibili, raggiungibili e segnalati con cartello UNI EN ISO 7010 F005, ad altezza 1,2-1,6 m da terra.',
      nextSteps: [
        'Liberare immediatamente l\'accesso al pulsante',
        'Verificare presenza di cartello segnaletico',
        'Testare il funzionamento durante la prossima prova evacuazione',
      ],
      tip: 'In emergenza ogni secondo conta: un pulsante nascosto può ritardare l\'evacuazione di interi piani.',
    },
    emergency_lighting: {
      title: 'D.Lgs. 81/08 + UNI EN 1838',
      articles: 'art. 63 e All. IV §1.10; UNI EN 1838:2013',
      obligation: 'Illuminazione di sicurezza con autonomia minima 1 ora, intensità minima 1 lux sulle vie di esodo e 5 lux nei punti critici. Test funzionali mensili e prova autonomia annuale.',
      nextSteps: [
        'Sostituire la plafoniera o la batteria difettosa',
        'Effettuare test di autonomia (1h continuativa)',
        'Aggiornare il registro controlli antincendio',
      ],
      tip: 'In un blackout durante un\'evacuazione, le luci di emergenza sono l\'unica differenza tra fuga ordinata e panico.',
    },
    evacuation_plan: {
      title: 'D.Lgs. 81/08 + D.M. 10/03/1998',
      articles: 'art. 43 D.Lgs. 81/08; D.M. 10/03/1998 All. VIII',
      obligation: 'Planimetria di evacuazione affissa in ogni piano vicino alle uscite, con indicazione di "Voi siete qui", percorsi di esodo, punto di raccolta esterno e numeri di emergenza.',
      nextSteps: [
        'Stampare e affiggere la planimetria aggiornata',
        'Verificare visibilità da ogni postazione di lavoro',
        'Includere la planimetria nella formazione di nuovi assunti',
      ],
      tip: 'Senza planimetria visibile, in emergenza i lavoratori tornano per istinto verso l\'ingresso noto, anche se è bloccato.',
    },
    overload: {
      title: 'D.Lgs. 81/08 + CEI 64-8',
      articles: 'art. 80 D.Lgs. 81/08; CEI 64-8 cap. 43',
      obligation: 'Vietato collegare apparecchi la cui somma di potenza superi quella della presa o della ciabatta. Le ciabatte non vanno collegate a cascata ("ciabatta in ciabatta").',
      nextSteps: [
        'Scollegare immediatamente parte dei dispositivi',
        'Calcolare il carico totale (W) vs portata della presa (16A x 230V = 3.680W)',
        'Installare prese aggiuntive certificate da elettricista qualificato',
      ],
      tip: 'Una ciabatta sovraccarica scalda fino a 90°C: è una delle prime cause di incendio negli uffici.',
    },
    generic_high: {
      title: 'D.Lgs. 81/08 art. 15',
      articles: 'art. 15 D.Lgs. 81/08',
      obligation: 'Misure generali di tutela: eliminazione del rischio alla fonte, sostituzione di ciò che è pericoloso, priorità alla protezione collettiva sulla individuale.',
      nextSteps: [
        'Eliminare la fonte del rischio se possibile',
        'Adottare misure di protezione collettiva',
        'Aggiornare il DVR con la nuova valutazione',
      ],
      tip: 'La gerarchia dei controlli mette la protezione individuale come ULTIMA scelta: prima si elimina, poi si sostituisce, poi si protegge.',
    },
    generic_low: {
      title: 'D.Lgs. 81/08 art. 28',
      articles: 'art. 28 D.Lgs. 81/08',
      obligation: 'Il datore di lavoro valuta tutti i rischi e li riporta nel DVR; le misure preventive vanno aggiornate ogni qualvolta cambino le condizioni di lavoro.',
      nextSteps: [
        'Segnalare il rischio nel registro non conformità',
        'Verificare che sia tracciato nel DVR',
        'Proporre misura correttiva al RSPP',
      ],
      tip: 'Anche i rischi "minori" vanno valutati: un quasi-infortunio è il segnale di un infortunio futuro.',
    },
  },
  en: {} as Record<RiskCategory, NormativeEntry>, // populated by mirror below
  ro: {} as Record<RiskCategory, NormativeEntry>,
  ar: {} as Record<RiskCategory, NormativeEntry>,
};

// English translations (legal references kept in original Italian as they refer to Italian law,
// but obligations and steps translated)
const TRANSLATIONS: Record<'en' | 'ro' | 'ar', Partial<Record<RiskCategory, Pick<NormativeEntry, 'obligation' | 'nextSteps' | 'tip'>>>> = {
  en: {
    fire_extinguisher: {
      obligation: 'Fire extinguishers must always be accessible, marked with UNI EN ISO 7010 signage and serviced every 6 months. Blocking, moving or covering the device is forbidden.',
      nextSteps: ['Immediately clear the access area (at least 60 cm clearance)', 'Check the pressure gauge and the safety sign', 'Record the event and report to the safety officer for inspection'],
      tip: 'A blocked extinguisher is a missing extinguisher: in case of fire you lose the critical first 30 seconds.',
    },
    emergency_exit: {
      obligation: 'Emergency exits and routes must always be clear, openable from inside without a key, and sized for the maximum occupancy.',
      nextSteps: ['Immediately remove any obstacle from the escape route', 'Check that the panic bar works', 'Add a "no storage" sign (UNI EN ISO 7010 P002)'],
      tip: 'Even a single box can slow evacuation by 10-15 seconds — in a fire that is the difference between escaping and being intoxicated.',
    },
    electrical: {
      obligation: 'Electrical systems and cables must be protected against direct/indirect contact, with RCDs and earthing. Damaged cables must be taken out of service immediately.',
      nextSteps: ['DO NOT touch the cable: cut power at the main panel', 'Mark the area with tape or "Live electricity" sign', 'Call a qualified electrician (PES/PAV) for replacement'],
      tip: '50V AC is enough to cause fibrillation: never improvise repairs with adhesive tape.',
    },
    shelf_stability: {
      obligation: 'Industrial shelving must be anchored, display the maximum load per shelf and be inspected yearly by qualified personnel (PRSES).',
      nextSteps: ['Immediately evacuate the area below and around', 'Gradually unload from the top shelves down', 'Block use until structural verification is documented'],
      tip: 'An overloaded rack can collapse like dominoes: the risk is not just for who stands in front, but the whole warehouse.',
    },
    ppe: {
      obligation: 'The employer provides PPE matching the specific risk; the worker must wear it and is directly liable in case of omission.',
      nextSteps: ['Stop the activity until proper PPE is restored', 'Check expiry date and CE certification mark', 'Log the non-conformity in the near-miss register'],
      tip: '30% of fatal construction accidents involve missing helmets or harnesses: no job is worth a life.',
    },
    scaffold: {
      obligation: 'Fixed metal scaffolding requires Pi.M.U.S., 1m guardrails with mid-rail and toe-board, mounted by trained personnel (28-hour course).',
      nextSteps: ['Forbid scaffold access with sign and barrier', 'Check that Pi.M.U.S. is signed by the supervisor', 'Have the structure restored before any climbing'],
      tip: 'Falls from height are the #1 cause of death in construction: scaffolding is not a "temporary support", it\'s a regulated provisional work.',
    },
    excavation: {
      obligation: 'Excavations deeper than 1.5m require shoring or natural slope, edge guardrails and lighted perimeter signage at night.',
      nextSteps: ['Immediately move workers away from the edge', 'Place compliant guardrails or heavy barriers', 'Verify the shoring planned in the POS with the CSE'],
      tip: 'One cubic meter of soil weighs ~1,800 kg: even a 50 cm partial burial is potentially lethal.',
    },
    machinery: {
      obligation: 'Qualified operator with specific licence, marked manoeuvring zones, mandatory ground signaller for blind-spot reverse and physical separation of pedestrian routes.',
      nextSteps: ['Stop the machine and remove the key', 'Mark the boom rotation zone (radius +1m)', 'Assign a trained signaller for every reverse manoeuvre'],
      tip: '20% of fatal site accidents involve self-propelled machines: an excavator\'s blind spot extends up to 7m.',
    },
    slippery_floor: {
      obligation: 'Anti-slip floors (R10 minimum in wet areas), immediate drying of spills, and mandatory "wet floor" sign (UNI EN ISO 7010 W015).',
      nextSteps: ['Immediately place the "wet floor" sign', 'Dry with sawdust or absorbent cloths', 'Find the leak source and fix it'],
      tip: 'Slips are the 2nd cause of injury in Italy: a sign costs €5, a femur fracture costs months off work.',
    },
    cyber_credentials: {
      obligation: 'Credentials are personal data and must be kept confidential. Company policy forbids writing passwords on paper or unencrypted digital media.',
      nextSteps: ['Immediately destroy the post-it (shredder)', 'Force a password change for the compromised account', 'Use a corporate password manager (e.g. Bitwarden, 1Password)'],
      tip: '81% of data breaches start with weak or exposed credentials: a password is worth more than a physical key.',
    },
    cyber_screen: {
      obligation: 'Auto screen-lock max 10 min idle, plus manual lock (Win+L / Cmd+Ctrl+Q) every time you leave the desk.',
      nextSteps: ['Immediately lock the session (Win+L)', 'Set auto-lock to 5 minutes', 'Train the team on the clean desk policy'],
      tip: 'A malicious actor can install a USB keylogger in 30 seconds: the screen lock is your digital PPE.',
    },
    cyber_phishing: {
      obligation: 'Suspicious emails must NOT be opened or clicked. Report them via the "Report Phishing" button or forward to abuse@.',
      nextSteps: ['DO NOT click links or download attachments', 'Forward the email to the SOC / IT lead', 'Delete after SOC confirmation'],
      tip: '90% of ransomware enters via phishing email: always doubt urgency, prizes and suspicious wire transfers.',
    },
    cyber_usb: {
      obligation: 'Forbidden to plug unauthorised USB devices; USB ports may be disabled by GPO. Only encrypted (AES-256) corporate sticks are allowed.',
      nextSteps: ['Immediately remove the device (no safe-eject)', 'Run a full antivirus scan', 'Report to SOC for forensic device analysis'],
      tip: 'A USB stick "accidentally" left in the parking lot is a real attack technique called "USB drop": it works in 60% of cases.',
    },
    cyber_documents: {
      obligation: 'Documents with personal data must be stored in locked cabinets at end of day and during breaks; never leave them on open desks.',
      nextSteps: ['Store documents in a lockable drawer', 'Shred documents no longer needed', 'Check the document classification (public/internal/confidential)'],
      tip: 'The Italian Privacy Authority has fined companies up to €100,000 for confidential documents left visible in shared offices.',
    },
    cyber_password: {
      obligation: 'Passwords with at least 12 characters, mix of upper/lower/numbers/symbols, never reused. Passwords like "123456" or "password" have been in the top 10 leaked credentials since 2009.',
      nextSteps: ['Immediately change to a strong password', 'Enable multi-factor authentication (MFA/2FA)', 'Use a password manager to generate unique passwords'],
      tip: 'An 8-char password is cracked in <1h; a 14-char password takes centuries with the same compute.',
    },
    cyber_wifi: {
      obligation: 'Forbidden to create personal hotspots connected to the corporate network: they bypass firewalls, IDS/IPS and access controls, exposing internal data.',
      nextSteps: ['Immediately turn off the hotspot', 'Disconnect the smartphone from the wired network', 'Use the corporate guest WiFi for personal devices'],
      tip: 'An unprotected hotspot transmits in clear: anyone within 30m can intercept traffic with free tools.',
    },
    cyber_print: {
      obligation: 'Shared printers must use "pull-printing" unlocked by badge/PIN; documents not collected must be shredded, never left on the tray.',
      nextSteps: ['Immediately collect the prints', 'Shred documents no longer needed', 'Configure secure print with badge on company printers'],
      tip: 'Customer data left at the printer is one of the most common and easily preventable GDPR breaches.',
    },
    fire_source: {
      obligation: 'Incipient fire: immediately trigger the alarm, do NOT attempt to extinguish if larger than a wastebasket, evacuate and call 115.',
      nextSteps: ['Press the nearest fire alarm button', 'Move surrounding combustibles away if safe', 'Use the right extinguisher (CO₂ for electrical, powder for A-B-C)'],
      tip: 'A fire doubles in size every 30 seconds: the first 2 minutes decide whether it\'s manageable or catastrophic.',
    },
    fire_door: {
      obligation: 'Fire doors (REI 60/90/120) must stay closed or held by magnets connected to the fire panel that release on alarm. NEVER use wedges.',
      nextSteps: ['Immediately remove the wedge', 'Verify the door fully closes', 'Install an electromagnet with auto-release if hold-open is needed'],
      tip: 'A REI 90 door blocks smoke and flames for 90 minutes: held open it is worth ZERO.',
    },
    emergency_alarm: {
      obligation: 'Manual alarm push-buttons (red, frangible) must be visible, reachable and signed with UNI EN ISO 7010 F005, at 1.2-1.6 m height.',
      nextSteps: ['Immediately clear access to the button', 'Check the signage is present', 'Test it during the next evacuation drill'],
      tip: 'In an emergency every second counts: a hidden button can delay evacuation of entire floors.',
    },
    emergency_lighting: {
      obligation: 'Emergency lighting with min 1h autonomy, min 1 lux on escape routes and 5 lux at critical points. Monthly functional tests and annual autonomy test.',
      nextSteps: ['Replace the faulty fixture or battery', 'Run an autonomy test (1 continuous hour)', 'Update the fire safety log book'],
      tip: 'In a blackout during evacuation, emergency lights are the only difference between an orderly escape and panic.',
    },
    evacuation_plan: {
      obligation: 'Evacuation plan posted on every floor near exits, with "You are here", escape routes, external assembly point and emergency numbers.',
      nextSteps: ['Print and post the up-to-date plan', 'Verify visibility from every workstation', 'Include the plan in new-hire training'],
      tip: 'Without a visible plan, in emergency workers instinctively run back to the known entrance, even if it\'s blocked.',
    },
    overload: {
      obligation: 'Forbidden to plug devices whose total power exceeds the socket or strip capacity. Power strips must NEVER be daisy-chained.',
      nextSteps: ['Immediately unplug some devices', 'Calculate total load (W) vs socket capacity (16A x 230V = 3,680W)', 'Have a qualified electrician install extra sockets'],
      tip: 'An overloaded power strip heats up to 90°C: it\'s one of the leading causes of office fires.',
    },
    generic_high: {
      obligation: 'General protection measures: eliminate the risk at the source, replace what is dangerous, prioritise collective over individual protection.',
      nextSteps: ['Eliminate the source of risk if possible', 'Adopt collective protection measures', 'Update the risk assessment document (DVR)'],
      tip: 'The hierarchy of controls puts PPE as the LAST option: first eliminate, then substitute, then protect.',
    },
    generic_low: {
      obligation: 'The employer assesses all risks and records them in the DVR; preventive measures must be updated whenever working conditions change.',
      nextSteps: ['Log the risk in the non-conformity register', 'Verify it\'s tracked in the DVR', 'Propose a corrective measure to the safety officer'],
      tip: 'Even "minor" risks must be assessed: a near-miss is the warning of a future accident.',
    },
  },
  ro: {
    fire_extinguisher: {
      obligation: 'Stingătoarele trebuie să fie mereu accesibile, semnalizate (UNI EN ISO 7010) și verificate la fiecare 6 luni. Este interzis să fie blocate, mutate sau acoperite.',
      nextSteps: ['Eliberează imediat zona de acces (cel puțin 60 cm)', 'Verifică manometrul și panoul de semnalizare', 'Notează evenimentul și anunță responsabilul SSM'],
      tip: 'Un stingător blocat e ca unul absent: în caz de incendiu se pierd primele 30 de secunde critice.',
    },
    emergency_exit: {
      obligation: 'Căile și ieșirile de urgență trebuie să rămână mereu libere, deschise dinăuntru fără cheie și suficient de largi pentru numărul maxim de persoane.',
      nextSteps: ['Înlătură imediat orice obstacol de pe ruta de evacuare', 'Verifică funcționarea barei antipanică', 'Pune un panou „interzis depozitare" (P002)'],
      tip: 'Chiar și o singură cutie poate încetini evacuarea cu 10-15 secunde: într-un incendiu e diferența între scăpare și intoxicare.',
    },
    electrical: {
      obligation: 'Instalațiile și cablurile electrice trebuie protejate împotriva contactelor directe/indirecte, cu disjunctoare diferențiale și împământare. Cablurile defecte se scot imediat din uz.',
      nextSteps: ['NU atinge cablul: oprește tensiunea de la tabloul general', 'Delimitează zona cu bandă sau panou „Pericol electric"', 'Cheamă un electrician calificat pentru înlocuire'],
      tip: '50 V curent alternativ pot provoca fibrilație: nu improviza reparații cu bandă adezivă.',
    },
    shelf_stability: {
      obligation: 'Rafturile industriale trebuie ancorate, să indice sarcina maximă pe poliță și să fie inspectate anual de personal calificat (PRSES).',
      nextSteps: ['Evacuează imediat zona de dedesubt și din jur', 'Descarcă treptat de sus în jos', 'Blochează utilizarea până la verificare structurală documentată'],
      tip: 'Un raft supraîncărcat se poate prăbuși în lanț: riscul nu e doar pentru cine stă în față, ci pentru tot depozitul.',
    },
    ppe: {
      obligation: 'Angajatorul furnizează EIP corespunzător riscului specific; lucrătorul este obligat să-l poarte și răspunde direct în caz de neutilizare.',
      nextSteps: ['Oprește activitatea până la restabilirea EIP corect', 'Verifică data de expirare și marcajul CE', 'Înregistrează neconformitatea în registrul accidentelor'],
      tip: '30% din accidentele mortale în construcții sunt legate de lipsa căștii sau hamului: nicio muncă nu valorează o viață.',
    },
    scaffold: {
      obligation: 'Schelele metalice fixe necesită Pi.M.U.S., balustrade la 1 m cu rigle intermediare și plinte, montate de personal instruit (curs 28 ore).',
      nextSteps: ['Interzice accesul pe schelă cu panou și barieră', 'Verifică Pi.M.U.S. semnat de șeful de echipă', 'Reabilitează structura înainte de orice urcare'],
      tip: 'Căderile de la înălțime sunt prima cauză de deces în construcții: schela nu e un „suport temporar", e o lucrare provizorie reglementată.',
    },
    excavation: {
      obligation: 'Săpăturile peste 1,5 m necesită sprijinire sau taluz natural, balustrade la margine și semnalizare luminoasă perimetrală noaptea.',
      nextSteps: ['Îndepărtează imediat lucrătorii de margine', 'Pune balustrade conforme sau bariere grele', 'Verifică sprijinirile prevăzute în POS cu CSE'],
      tip: 'Un metru cub de pământ cântărește ~1.800 kg: chiar și o îngropare parțială de 50 cm poate fi letală.',
    },
    machinery: {
      obligation: 'Operator autorizat, zone de manevră delimitate, semnalizator obligatoriu pentru mers înapoi în unghi mort și separare fizică a căilor pietonale.',
      nextSteps: ['Oprește utilajul și scoate cheia', 'Delimitează zona de rotație a brațului (rază +1 m)', 'Desemnează un semnalizator instruit pentru fiecare manevră'],
      tip: '20% din accidentele mortale pe șantier implică utilaje: unghiul mort al unui excavator ajunge până la 7 m.',
    },
    slippery_floor: {
      obligation: 'Pardoseli antiderapante (minim R10 în zone umede), uscare imediată a lichidelor și panou obligatoriu „Pardoseală udă" (W015).',
      nextSteps: ['Pune imediat panoul „Pardoseală udă"', 'Usucă cu rumeguș sau lavete absorbante', 'Identifică și elimină cauza scurgerii'],
      tip: 'Căderile pe același nivel sunt a 2-a cauză de accident: un panou costă 5€, o fractură de femur costă luni de absență.',
    },
    cyber_credentials: {
      obligation: 'Datele de autentificare sunt date personale și trebuie păstrate confidențial. Politica firmei interzice scrierea parolelor pe hârtie sau pe suporturi digitale necriptate.',
      nextSteps: ['Distruge imediat post-it-ul (mărunțitor)', 'Forțează schimbarea parolei contului compromis', 'Folosește un manager de parole corporativ'],
      tip: '81% din breșele de date încep cu parole slabe sau expuse: o parolă valorează mai mult decât o cheie fizică.',
    },
    cyber_screen: {
      obligation: 'Blocare automată a ecranului maxim 10 min de inactivitate și blocare manuală (Win+L) de fiecare dată când pleci de la birou.',
      nextSteps: ['Blochează imediat sesiunea (Win+L)', 'Setează blocare automată la 5 min', 'Instruiește echipa pe clean desk policy'],
      tip: 'În 30 de secunde un atacator poate instala un keylogger USB: blocarea ecranului este EIP-ul digital.',
    },
    cyber_phishing: {
      obligation: 'Email-urile suspecte NU se deschid și NU se dau click. Se raportează cu butonul „Report Phishing" sau pe abuse@.',
      nextSteps: ['NU da click pe linkuri și NU descărca atașamente', 'Trimite emailul către SOC / IT', 'Șterge după confirmarea SOC'],
      tip: '90% din ransomware intră prin phishing: dubitează mereu de urgențe, premii și transferuri suspecte.',
    },
    cyber_usb: {
      obligation: 'Interzis conectarea de dispozitive USB neautorizate; porturile USB pot fi dezactivate prin GPO. Doar stick-urile companiei criptate AES-256 sunt permise.',
      nextSteps: ['Scoate imediat dispozitivul (fără eject sigur)', 'Pornește scanare antivirus completă', 'Anunță SOC pentru analiză forensică'],
      tip: 'Un stick USB lăsat „din întâmplare" în parcare e o tehnică reală de atac numită „USB drop": funcționează în 60% din cazuri.',
    },
    cyber_documents: {
      obligation: 'Documentele cu date personale se păstrează în dulapuri încuiate la sfârșitul zilei și pe pauze; interzis să fie lăsate pe birouri deschise.',
      nextSteps: ['Pune documentele într-un sertar cu cheie', 'Mărunțește documentele care nu mai sunt necesare', 'Verifică clasificarea documentului'],
      tip: 'Autoritatea pentru Protecția Datelor a aplicat amenzi până la 100.000 € pentru documente lăsate la vedere în birouri comune.',
    },
    cyber_password: {
      obligation: 'Parole de minim 12 caractere, mix de majuscule/minuscule/cifre/simboluri, niciodată reutilizate. Parole ca „123456" sunt în top 10 cele mai sparte din 2009.',
      nextSteps: ['Schimbă imediat cu o parolă puternică', 'Activează autentificarea multi-factor (MFA)', 'Folosește un manager de parole'],
      tip: 'O parolă de 8 caractere se sparge în <1 oră; una de 14 caractere durează secole cu aceeași putere de calcul.',
    },
    cyber_wifi: {
      obligation: 'Interzis să creezi hotspot personal conectat la rețeaua firmei: ocolește firewall-ul, IDS/IPS și controalele de acces, expunând date interne.',
      nextSteps: ['Dezactivează imediat hotspot-ul', 'Deconectează telefonul de la rețeaua cablată', 'Folosește WiFi guest pentru dispozitive personale'],
      tip: 'Un hotspot neprotejat transmite în clar: oricine în raza de 30 m poate intercepta traficul cu unelte gratuite.',
    },
    cyber_print: {
      obligation: 'Imprimantele partajate trebuie să folosească „pull-printing" cu deblocare prin badge/PIN; documentele neridicate se mărunțesc.',
      nextSteps: ['Ridică imediat printurile', 'Mărunțește documentele care nu mai sunt utile', 'Configurează printarea sigură cu badge'],
      tip: 'Datele clienților lăsate la imprimantă sunt una dintre cele mai comune încălcări GDPR și ușor de evitat.',
    },
    fire_source: {
      obligation: 'Început de incendiu: activează imediat alarma, NU încerca stingerea dacă focul depășește dimensiunile unui coș de hârtii, evacuează și sună la 112.',
      nextSteps: ['Apasă cel mai apropiat buton de alarmă', 'Îndepărtează materialele combustibile dacă e sigur', 'Folosește stingătorul potrivit (CO₂ pentru electric, pulbere ABC)'],
      tip: 'Un incendiu își dublează suprafața la fiecare 30 de secunde: primele 2 minute decid dacă e gestionabil sau catastrofic.',
    },
    fire_door: {
      obligation: 'Ușile antifoc (REI 60/90/120) trebuie să rămână închise sau ținute de magneți conectați la centrala de incendiu care le eliberează la alarmă. INTERZIS folosirea de pene.',
      nextSteps: ['Înlătură imediat pana', 'Verifică închiderea completă a ușii', 'Instalează electromagnet cu eliberare automată dacă e nevoie'],
      tip: 'O ușă REI 90 oprește fumul și flăcările 90 de minute: blocată deschisă valorează ZERO.',
    },
    emergency_alarm: {
      obligation: 'Butoanele de alarmă manuală (roșii, fragile) trebuie să fie vizibile, accesibile și marcate cu panou F005, la înălțime de 1,2-1,6 m.',
      nextSteps: ['Eliberează imediat accesul la buton', 'Verifică prezența panoului de semnalizare', 'Testează la următorul exercițiu de evacuare'],
      tip: 'În urgență fiecare secundă contează: un buton ascuns poate întârzia evacuarea unor etaje întregi.',
    },
    emergency_lighting: {
      obligation: 'Iluminat de siguranță cu autonomie minimă 1 oră, intensitate min. 1 lux pe căile de evacuare și 5 lux în puncte critice. Test funcțional lunar și autonomie anuală.',
      nextSteps: ['Înlocuiește lampa sau bateria defectă', 'Efectuează test de autonomie (1 oră continuu)', 'Actualizează registrul de control PSI'],
      tip: 'Într-un blackout în timpul evacuării, luminile de siguranță sunt diferența între evacuare ordonată și panică.',
    },
    evacuation_plan: {
      obligation: 'Planul de evacuare afișat la fiecare etaj lângă ieșiri, cu „Sunteți aici", rute de evacuare, punct de adunare exterior și numere de urgență.',
      nextSteps: ['Tipărește și afișează planul actualizat', 'Verifică vizibilitatea de la fiecare post de muncă', 'Include planul în instructajul noilor angajați'],
      tip: 'Fără plan vizibil, în urgență lucrătorii se întorc instinctiv spre intrarea cunoscută, chiar dacă e blocată.',
    },
    overload: {
      obligation: 'Interzis să conectezi aparate a căror putere totală depășește priza sau prelungitorul. Prelungitoarele NU se înseriază („cascadă").',
      nextSteps: ['Deconectează imediat o parte din dispozitive', 'Calculează încărcarea (W) vs capacitatea prizei (16A x 230V = 3.680W)', 'Cheamă electrician pentru prize suplimentare'],
      tip: 'Un prelungitor supraîncărcat se încălzește până la 90°C: e una dintre principalele cauze de incendiu în birouri.',
    },
    generic_high: {
      obligation: 'Măsuri generale de protecție: eliminarea riscului la sursă, înlocuirea a ceea ce e periculos, prioritate protecției colective față de cea individuală.',
      nextSteps: ['Elimină sursa riscului dacă e posibil', 'Adoptă măsuri de protecție colectivă', 'Actualizează evaluarea riscurilor (DVR)'],
      tip: 'Ierarhia controalelor pune EIP ca ULTIMA opțiune: întâi elimini, apoi înlocuiești, apoi protejezi.',
    },
    generic_low: {
      obligation: 'Angajatorul evaluează toate riscurile și le înregistrează în DVR; măsurile preventive se actualizează ori de câte ori se schimbă condițiile de muncă.',
      nextSteps: ['Înregistrează riscul în registrul de neconformități', 'Verifică prezența în DVR', 'Propune măsuri corective responsabilului SSM'],
      tip: 'Și riscurile „minore" trebuie evaluate: un quasi-accident e semnalul unui accident viitor.',
    },
  },
  ar: {
    fire_extinguisher: {
      obligation: 'يجب أن تكون طفايات الحريق متاحة دائماً، مُعَلَّمة بإشارات (UNI EN ISO 7010) وتُصان كل 6 أشهر. يُمنع منعاً باتاً إعاقتها أو تحريكها أو تغطيتها.',
      nextSteps: ['أَخْلِ منطقة الوصول فوراً (60 سم على الأقل)', 'تحقق من مقياس الضغط ولوحة الإشارة', 'سَجِّل الحدث وأبلغ مسؤول السلامة'],
      tip: 'الطفاية المعاقة كأنها غير موجودة: في حالة الحريق تخسر أول 30 ثانية حاسمة.',
    },
    emergency_exit: {
      obligation: 'يجب أن تظل مخارج وممرات الطوارئ خالية دائماً، تُفتح من الداخل بدون مفتاح وبعرض كافٍ للحد الأقصى من الإشغال.',
      nextSteps: ['أَزِل أي عائق فوراً من ممر الإخلاء', 'تحقق من عمل قضيب الأمان', 'أَضِف لوحة "ممنوع التخزين" (P002)'],
      tip: 'حتى صندوق واحد قد يبطئ الإخلاء 10-15 ثانية — في الحريق هذا الفرق بين النجاة والاختناق.',
    },
    electrical: {
      obligation: 'يجب حماية التركيبات والكابلات الكهربائية من اللمس المباشر وغير المباشر، مع قواطع تفاضلية وتأريض. الكابلات التالفة تُسحب فوراً من الخدمة.',
      nextSteps: ['لا تلمس الكابل: اقطع التيار من اللوحة الرئيسية', 'حدد المنطقة بشريط أو لوحة "خطر كهرباء"', 'استدعِ كهربائياً مؤهلاً للاستبدال'],
      tip: '50 فولت متناوب كافية لإحداث رجفان قلبي: لا تُصلح أبداً بشريط لاصق.',
    },
    shelf_stability: {
      obligation: 'الرفوف الصناعية يجب أن تكون مثبتة، تحمل ملصق الحمل الأقصى لكل رف، وتُفحص سنوياً من قبل مختصين (PRSES).',
      nextSteps: ['أَخْلِ المنطقة أسفل وحول الرف فوراً', 'فرّغ الحمولة تدريجياً من الأعلى', 'امنع الاستخدام حتى التحقق الإنشائي الموثق'],
      tip: 'الرف المُحمل بشكل زائد قد ينهار كأحجار الدومينو: الخطر ليس فقط على من أمامه بل على المستودع كله.',
    },
    ppe: {
      obligation: 'صاحب العمل يوفر معدات الحماية المناسبة للخطر؛ والعامل ملزم بارتدائها ويتحمل مسؤولية مباشرة عند الإهمال.',
      nextSteps: ['أوقف النشاط حتى استعادة معدات الحماية الصحيحة', 'تحقق من تاريخ الانتهاء وعلامة CE', 'سجل عدم المطابقة في سجل الحوادث'],
      tip: '30% من الحوادث القاتلة في البناء مرتبطة بعدم استخدام الخوذة أو الحزام: لا توجد وظيفة تستحق الحياة.',
    },
    scaffold: {
      obligation: 'السقالات المعدنية الثابتة تتطلب Pi.M.U.S.، حواجز بارتفاع متر مع قضيب أوسط ولوح قدم، تركيب من قِبل عمال مدربين (دورة 28 ساعة).',
      nextSteps: ['امنع الوصول للسقالة بلوحة وحاجز', 'تحقق من Pi.M.U.S. موقعاً من المشرف', 'أصلح الهيكل قبل أي صعود'],
      tip: 'السقوط من علو هو السبب الأول للوفاة في البناء: السقالة ليست "دعم مؤقت" بل عمل مؤقت منظم بالقانون.',
    },
    excavation: {
      obligation: 'الحفريات بعمق أكثر من 1.5 م تتطلب تدعيم الجدران أو ميل طبيعي، حواجز عند الحافة وإشارة محيطية مضيئة ليلاً.',
      nextSteps: ['أبعد العمال فوراً عن الحافة', 'ضع حواجز مطابقة أو حواجز ثقيلة', 'تحقق مع CSE من التدعيمات في POS'],
      tip: 'متر مكعب من التراب يزن ~1800 كغ: حتى دفن جزئي بعمق 50 سم قد يكون قاتلاً.',
    },
    machinery: {
      obligation: 'مشغل مرخص، مناطق مناورة محددة، مرشد أرضي إلزامي للرجوع للخلف في النقطة العمياء وفصل فيزيائي لممرات المشاة.',
      nextSteps: ['أوقف الآلة وانزع المفتاح', 'حدد منطقة دوران الذراع (نصف قطر +1 م)', 'عيّن مرشداً مدرباً لكل مناورة رجوع'],
      tip: '20% من الحوادث القاتلة في المواقع تشمل آلات ذاتية الحركة: النقطة العمياء للحفار تمتد حتى 7 أمتار.',
    },
    slippery_floor: {
      obligation: 'أرضيات مانعة للانزلاق (R10 كحد أدنى للمناطق الرطبة)، تجفيف فوري للسوائل المنسكبة ولوحة "أرضية مبللة" إلزامية (W015).',
      nextSteps: ['ضع لوحة "أرضية مبللة" فوراً', 'جفف بنشارة أو قطع ماصة', 'حدد سبب التسرب وأصلحه'],
      tip: 'السقوط على نفس المستوى هو السبب الثاني للإصابات في إيطاليا: لوحة بـ 5€، كسر الفخذ يكلف أشهراً من الغياب.',
    },
    cyber_credentials: {
      obligation: 'بيانات الاعتماد بيانات شخصية ويجب حفظها بسرية. سياسة الشركة تمنع كتابة كلمات المرور على ورق أو وسائط رقمية غير مشفرة.',
      nextSteps: ['أتلف الورقة فوراً (آلة تمزيق)', 'أجبر تغيير كلمة مرور الحساب المخترق', 'استخدم مدير كلمات مرور مؤسسي'],
      tip: '81% من اختراقات البيانات تبدأ بكلمات مرور ضعيفة أو مكشوفة: كلمة المرور أثمن من المفتاح المادي.',
    },
    cyber_screen: {
      obligation: 'قفل تلقائي للشاشة بعد 10 دقائق خمول كحد أقصى وقفل يدوي (Win+L) كل مرة تترك فيها المكتب.',
      nextSteps: ['اقفل الجلسة فوراً (Win+L)', 'اضبط القفل التلقائي على 5 دقائق', 'درّب الفريق على سياسة المكتب النظيف'],
      tip: 'في 30 ثانية يمكن لمهاجم تثبيت keylogger USB: قفل الشاشة هو معدات الحماية الرقمية.',
    },
    cyber_phishing: {
      obligation: 'الرسائل المشبوهة لا تُفتح ولا يُنقر عليها. تُبَلَّغ عبر زر "Report Phishing" أو إعادة التوجيه إلى abuse@.',
      nextSteps: ['لا تنقر روابط ولا تحمّل مرفقات', 'أعِد توجيه الرسالة إلى SOC / IT', 'احذف بعد تأكيد SOC'],
      tip: '90% من رانسوم وير تدخل عبر التصيد: شَكِّك دائماً في العاجل والجوائز والتحويلات المشبوهة.',
    },
    cyber_usb: {
      obligation: 'يُمنع توصيل أجهزة USB غير مصرح بها؛ يمكن تعطيل منافذ USB عبر GPO. فقط ذواكر الشركة المشفرة (AES-256) مسموحة.',
      nextSteps: ['انزع الجهاز فوراً (بدون إخراج آمن)', 'شَغِّل فحص مكافح فيروسات كاملاً', 'بَلِّغ SOC للتحليل الجنائي'],
      tip: 'ذاكرة USB متروكة "بالصدفة" في الموقف هي تقنية هجوم حقيقية تسمى "USB drop": تنجح في 60% من الحالات.',
    },
    cyber_documents: {
      obligation: 'الوثائق التي تحتوي بيانات شخصية تُحفظ في خزائن مغلقة بمفتاح في نهاية اليوم وأثناء الاستراحات؛ يُمنع تركها على مكاتب مفتوحة.',
      nextSteps: ['ضع الوثائق في درج بقفل', 'أتلف الوثائق غير الضرورية', 'تحقق من تصنيف الوثيقة'],
      tip: 'هيئة حماية البيانات الإيطالية فرضت غرامات تصل إلى 100,000 € على وثائق سرية مرئية في مكاتب مشتركة.',
    },
    cyber_password: {
      obligation: 'كلمات مرور بحد أدنى 12 حرفاً، خليط من حروف كبيرة/صغيرة/أرقام/رموز، لا تُعاد. كلمات مثل "123456" في قائمة أكثر 10 كلمات مرور مخترقة منذ 2009.',
      nextSteps: ['غَيِّر فوراً إلى كلمة مرور قوية', 'فَعِّل المصادقة متعددة العوامل (MFA)', 'استخدم مدير كلمات مرور لتوليد كلمات فريدة'],
      tip: 'كلمة مرور 8 أحرف تُكسر في أقل من ساعة؛ كلمة 14 حرفاً تستغرق قروناً بنفس قدرة الحساب.',
    },
    cyber_wifi: {
      obligation: 'يُمنع إنشاء نقطة اتصال شخصية موصولة بشبكة الشركة: تتجاوز الجدار الناري وأنظمة الكشف وضوابط الوصول، مما يكشف البيانات الداخلية.',
      nextSteps: ['عَطِّل نقطة الاتصال فوراً', 'افصل الهاتف عن الشبكة السلكية', 'استخدم WiFi الضيوف للأجهزة الشخصية'],
      tip: 'نقطة اتصال غير محمية تبث بدون تشفير: أي شخص في نطاق 30 م يمكنه اعتراض البيانات بأدوات مجانية.',
    },
    cyber_print: {
      obligation: 'الطابعات المشتركة يجب أن تستخدم "pull-printing" بفك القفل عبر بطاقة/PIN؛ الوثائق غير المستلمة تُتلف ولا تُترك في الدرج.',
      nextSteps: ['استلم المطبوعات فوراً', 'أتلف الوثائق غير الضرورية', 'إعداد الطباعة الآمنة بالبطاقة على طابعات الشركة'],
      tip: 'بيانات العملاء المتروكة في الطابعة من أكثر انتهاكات GDPR شيوعاً وأسهلها للتجنب.',
    },
    fire_source: {
      obligation: 'بداية حريق: فَعِّل الإنذار فوراً، لا تحاول الإطفاء إذا تجاوز حجم سلة المهملات، أَخْلِ واتصل بالطوارئ.',
      nextSteps: ['اضغط أقرب زر إنذار حريق', 'أبعد المواد القابلة للاشتعال إذا كان آمناً', 'استخدم الطفاية المناسبة (CO₂ للكهرباء، مسحوق ABC)'],
      tip: 'الحريق يضاعف مساحته كل 30 ثانية: أول دقيقتين تحدد إن كان قابلاً للسيطرة أم كارثياً.',
    },
    fire_door: {
      obligation: 'الأبواب المقاومة للحريق (REI 60/90/120) يجب أن تظل مغلقة أو مثبتة بمغناطيس متصل بلوحة الإنذار يحررها عند الإنذار. ممنوع منعاً باتاً استخدام الأسافين.',
      nextSteps: ['أَزِل الإسفين فوراً', 'تحقق من إغلاق الباب كاملاً', 'رَكِّب كهرومغناطيس بتحرير تلقائي إن لزم الإبقاء مفتوحاً'],
      tip: 'باب REI 90 يحجز الدخان واللهب 90 دقيقة: مفتوحاً يساوي صفراً.',
    },
    emergency_alarm: {
      obligation: 'أزرار الإنذار اليدوي (حمراء، قابلة للكسر) يجب أن تكون مرئية ومتاحة وعليها لوحة F005، بارتفاع 1.2-1.6 م.',
      nextSteps: ['أَخْلِ الوصول للزر فوراً', 'تحقق من وجود لوحة الإشارة', 'اختبره في تمرين الإخلاء التالي'],
      tip: 'في الطوارئ كل ثانية مهمة: زر مخفي قد يؤخر إخلاء طوابق كاملة.',
    },
    emergency_lighting: {
      obligation: 'إضاءة طوارئ بحد أدنى ساعة استقلالية، شدة 1 لوكس على ممرات الإخلاء و5 لوكس في النقاط الحرجة. اختبار وظيفي شهري واستقلالية سنوي.',
      nextSteps: ['استبدل المصباح أو البطارية المعطوبة', 'نفّذ اختبار استقلالية (ساعة متواصلة)', 'حدّث سجل ضوابط الحريق'],
      tip: 'في انقطاع التيار أثناء الإخلاء، أضواء الطوارئ هي الفرق بين الهروب المنظم والذعر.',
    },
    evacuation_plan: {
      obligation: 'خطة إخلاء معلقة في كل طابق قرب المخارج، مع "أنت هنا"، طرق الإخلاء، نقطة التجمع الخارجية وأرقام الطوارئ.',
      nextSteps: ['اطبع وعَلِّق الخطة المحدثة', 'تحقق من الرؤية من كل محطة عمل', 'ضمّن الخطة في تدريب الموظفين الجدد'],
      tip: 'بدون خطة مرئية، في الطوارئ يعود العمال غريزياً إلى المدخل المعروف، حتى لو كان مغلقاً.',
    },
    overload: {
      obligation: 'يُمنع توصيل أجهزة مجموع قدرتها يتجاوز قدرة المقبس أو الموزع. الموزعات لا توصل بالتسلسل ("شريط في شريط").',
      nextSteps: ['افصل بعض الأجهزة فوراً', 'احسب الحمل الكلي (W) مقابل سعة المقبس (16A x 230V = 3680W)', 'ركّب مقابس إضافية بكهربائي مؤهل'],
      tip: 'موزع كهربائي محمل يسخن حتى 90°C: من أهم أسباب الحرائق في المكاتب.',
    },
    generic_high: {
      obligation: 'تدابير الحماية العامة: إزالة الخطر من المصدر، استبدال ما هو خطير، أولوية للحماية الجماعية على الفردية.',
      nextSteps: ['أَزِل مصدر الخطر إن أمكن', 'تَبَنَّى تدابير حماية جماعية', 'حدّث وثيقة تقييم المخاطر (DVR)'],
      tip: 'تسلسل الضوابط يضع معدات الحماية كخيار أخير: أولاً تُزيل، ثم تستبدل، ثم تحمي.',
    },
    generic_low: {
      obligation: 'صاحب العمل يقيّم كل المخاطر ويسجلها في DVR؛ التدابير الوقائية تُحدَّث كلما تغيرت ظروف العمل.',
      nextSteps: ['سجل الخطر في سجل عدم المطابقة', 'تحقق من وجوده في DVR', 'اقترح إجراءً تصحيحياً لمسؤول السلامة'],
      tip: 'حتى المخاطر "البسيطة" يجب تقييمها: شبه الحادث هو إشارة لحادث مستقبلي.',
    },
  },
};

// Mirror IT structure into other langs preserving title and articles
(['en', 'ro', 'ar'] as const).forEach((lang) => {
  (Object.keys(DB.it) as RiskCategory[]).forEach((cat) => {
    const base = DB.it[cat];
    const tr = TRANSLATIONS[lang][cat];
    DB[lang][cat] = {
      title: base.title,
      articles: base.articles,
      obligation: tr?.obligation ?? base.obligation,
      nextSteps: tr?.nextSteps ?? base.nextSteps,
      tip: tr?.tip ?? base.tip,
    };
  });
});

export const classifyRisk = (label: string, description: string): RiskCategory => {
  const text = (label + ' ' + description).toLowerCase();
  if (text.includes('estintore') || text.includes('extinguisher') || text.includes('stingător') || text.includes('طفاي')) return 'fire_extinguisher';
  if (text.includes('uscita') || text.includes('via di fuga') || text.includes('exit') || text.includes('evacuaz') || text.includes('ieșire') || text.includes('مخرج')) return 'emergency_exit';
  if (text.includes('cavo') || text.includes('elettric') || text.includes('cable') || text.includes('electric') || text.includes('folgoraz')) return 'electrical';
  if (text.includes('multipresa') || text.includes('overload') || text.includes('sovraccaric')) return 'overload';
  if (text.includes('scaffal') || text.includes('shelf') || text.includes('raft')) return 'shelf_stability';
  if (text.includes('dpi') || text.includes('ppe') || text.includes('casco') || text.includes('helmet') || text.includes('imbracatura')) return 'ppe';
  if (text.includes('ponteggio') || text.includes('scaffold') || text.includes('schela') || text.includes('quota') || text.includes('caduta')) return 'scaffold';
  if (text.includes('scavo') || text.includes('trincea') || text.includes('excavation') || text.includes('săpăt')) return 'excavation';
  if (text.includes('escavator') || text.includes('bulldozer') || text.includes('dumper') || text.includes('betoniera') || text.includes('mulett') || text.includes('carrello') || text.includes('macchin') || text.includes('machinery')) return 'machinery';
  if (text.includes('pavimento') || text.includes('scivol') || text.includes('liquido') || text.includes('bagnat') || text.includes('floor') || text.includes('slip')) return 'slippery_floor';
  if (text.includes('post-it') || text.includes('credential') || text.includes('password') && text.includes('post')) return 'cyber_credentials';
  if (text.includes('schermo') || text.includes('screen') && text.includes('lock') || text.includes('non bloccat')) return 'cyber_screen';
  if (text.includes('phishing') || text.includes('email')) return 'cyber_phishing';
  if (text.includes('usb') || text.includes('chiavetta')) return 'cyber_usb';
  if (text.includes('documenti riservati') || text.includes('clean desk') || text.includes('documenti sulla scrivania')) return 'cyber_documents';
  if (text.includes('password') || text.includes('123456')) return 'cyber_password';
  if (text.includes('wifi') || text.includes('hotspot')) return 'cyber_wifi';
  if (text.includes('stamp') || text.includes('print')) return 'cyber_print';
  if (text.includes('focolaio') || text.includes('incendio') || text.includes('fuoco') || text.includes('fire') && !text.includes('extinguisher')) return 'fire_source';
  if (text.includes('porta tagliafuoco') || text.includes('fire door') || text.includes('rei')) return 'fire_door';
  if (text.includes('pulsante allarme') || text.includes('alarm') && text.includes('button')) return 'emergency_alarm';
  if (text.includes('luce di emergenza') || text.includes('emergency light') || text.includes('illuminaz')) return 'emergency_lighting';
  if (text.includes('planimetria') || text.includes('evacuation plan') || text.includes('piano di evacuaz')) return 'evacuation_plan';
  return 'generic_high';
};

export const getNormative = (lang: Lang, label: string, description: string, severity?: string): NormativeEntry => {
  const cat = classifyRisk(label, description);
  const entry = DB[lang][cat];
  if (cat === 'generic_high' && severity && severity !== 'critical' && severity !== 'high') {
    return DB[lang].generic_low;
  }
  return entry;
};
