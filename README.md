# 🛡️ Safety Frontline

**Piattaforma di formazione sulla sicurezza sul lavoro per PMI italiane** — simulazioni 3D, gamification e conformità normativa D.Lgs 81/08.

🌐 **Live**: [safetyfrontline.lovable.app](https://safetyfrontline.lovable.app)

---

## 📋 Indice

- [Panoramica](#panoramica)
- [Stack Tecnologico](#stack-tecnologico)
- [Architettura](#architettura)
- [Moduli Formativi](#moduli-formativi)
- [Simulazioni 3D](#simulazioni-3d)
- [Sistema Cybersecurity](#sistema-cybersecurity)
- [Gamification](#gamification)
- [Dashboard e Ruoli](#dashboard-e-ruoli)
- [Backend e Database](#backend-e-database)
- [Funzionalità Piattaforma](#funzionalità-piattaforma)
- [Setup Locale](#setup-locale)

---

## Panoramica

Safety Frontline è una piattaforma completa per la formazione obbligatoria sulla sicurezza nelle PMI italiane, conforme al **D.Lgs 81/08** e all'**Accordo Stato-Regioni**.

### Caratteristiche principali

- **29+ moduli formativi** organizzati per livello di rischio (basso, medio, alto)
- **4 simulazioni 3D** in prima persona con motore Babylon.js
- **Quiz cybersecurity** con 30 varianti per massima rigiocabilità
- **Certificati digitali** con QR code verificabile pubblicamente
- **AI Tutor** integrato per assistenza formativa
- **Gamification completa**: XP, badge, leaderboard, sfide multiplayer
- **Dashboard multi-ruolo**: Admin, Azienda, Dipendente

---

## Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Lucide Icons |
| 3D Engine | Babylon.js (simulazioni FPS), Three.js/R3F (showcase) |
| State | TanStack React Query |
| Backend | Lovable Cloud (Supabase) |
| Auth | Email + password con verifica |
| PDF | jsPDF (certificati, report) |
| Charts | Recharts |
| Routing | React Router v6 |

---

## Architettura

```
src/
├── pages/              # Route principali (17 pagine)
├── components/
│   ├── demo3d/         # Simulazioni 3D Babylon.js
│   ├── admin/          # Dashboard amministratore
│   ├── company/        # Dashboard azienda
│   ├── employee/       # Dashboard dipendente
│   ├── training/       # Hub formazione e moduli
│   ├── auth/           # Autenticazione
│   └── ui/             # Componenti shadcn/ui
├── data/               # Contenuti formativi e scenari
├── hooks/              # Custom hooks (auth, audio, gyroscope, ecc.)
├── lib/                # Utility (certificati, audio, cache, collisioni)
└── integrations/       # Client Supabase auto-generato

public/
├── models/             # Modelli 3D GLB (warehouse, factory, avatars)
│   ├── avatars/        # 7 avatar NPC
│   └── props/          # Prop ambientali
└── sounds/             # Audio (musica intro, effetti)

supabase/
└── functions/          # Edge Functions (AI tutor, notifiche, promemoria)
```

---

## Moduli Formativi

### Formazione Generale (5 moduli)
| Modulo | Contenuto |
|--------|-----------|
| Concetti Base | D.Lgs 81/08, diritti/doveri, organigramma sicurezza |
| Rischi e Prevenzione | Valutazione rischi, misure di prevenzione |
| Emergenze | Piano emergenza, evacuazione, primo soccorso base |
| Test Finale | Boss test avanzato, punteggio min. 70%, certificato QR |
| Lavoratori Specifica | Formazione obbligatoria art. 37 D.Lgs 81/08 e Accordo Stato-Regioni. Contenuti calibrati per rischio: basso 4h, medio 8h, alto 12h. Rischi specifici, DPI, procedure operative, aggiornamento quinquennale 6h |

### Rischio Basso (4 moduli)
Videoterminali e postura, stress lavoro-correlato, rischio elettrico base, microclima.

### Rischio Medio (8 moduli)
Rischi meccanici, movimentazione manuale (NIOSH), rischio elettrico avanzato, agenti fisici, sostanze pericolose (CLP), cadute dall'alto, rischio incendio, primo soccorso (BLS).

### Rischio Alto (8 moduli)
Macchine industriali (Direttiva Macchine), rischio chimico/cancerogeni (REACH/CLP), rischio biologico, amianto, spazi confinati, lavori in quota (PiMUS), movimentazione meccanica (carrelli/gru), primo soccorso avanzato (triage/DAE).

### Corsi di Ruolo (3 corsi)
| Corso | Dettaglio |
|-------|-----------|
| RSPP Datore di Lavoro | Art. 34 D.Lgs 81/08, DVR, PDCA, 16-48h per livello rischio |
| RLS | 32h, art. 50, consultazione preventiva, accesso DVR |
| Preposto | L. 215/2021, vigilanza, intervento diretto, aggiornamento biennale |

---

## Simulazioni 3D

4 scenari in prima persona con motore **Babylon.js**:

| Scenario | Tipo | Descrizione |
|----------|------|-------------|
| Safety Run | Rischi Generali | Cadute, inciampi, ordine & pulizia, valutazione rischi real-time |
| Office Hazard Quest | Uffici & VDT | Postura, videoterminale, micro-ergonomia per PMI terziario |
| Magazzino 2.5D | Carrelli & Movimentazione | Muletti, segnaletica, interazione pedoni/mezzi |
| Cyber Security Office | Rischi Informatici | Post-it con password, schermi non bloccati, phishing, USB sospette |

### Funzionalità 3D
- **Controlli**: Tastiera WASD + mouse, joystick virtuale touch, giroscopio mobile
- **NPC interattivi** con dialoghi e quiz contestuali
- **Sistema anti-incendio**: selezione estintori per classe fuoco, quiz classi incendio
- **HUD avanzato**: minimap, radar prossimità, barra pericolo, contatore evacuazione
- **Sistema replay**: registrazione, confronto sessioni, picture-in-picture
- **Achievement e badge**: sistema di traguardi per scenario
- **Leaderboard**: classifiche globali e per scenario
- **Generazione procedurale rischi**: analisi spaziale dei modelli GLTF per posizionamento automatico
- **LOD system**: livelli di dettaglio adattivi per performance
- **Calibrazione mouse** e impostazioni grafiche personalizzabili

---

## Sistema Cybersecurity

### Modulo Formativo (6 sezioni)
1. **Phishing & Social Engineering** — Email fraudolente, spear phishing, vishing
2. **Password & Autenticazione** — Password manager, 2FA, best practice
3. **Ransomware & Malware** — Prevenzione, procedure emergenza, impatto PMI
4. **Protezione Dati & GDPR** — Classificazione dati, VPN, WiFi, sanzioni
5. **Incident Response** — Catena segnalazione, scenari con NPC realistici
6. **Boss Test Finale** — 6 domande avanzate, scenari reali (CEO Fraud, baiting, data breach)

### Quiz 3D Cybersecurity (30 varianti)
Il sistema di quiz integrato nella simulazione 3D dispone di **30 domande varianti** distribuite su 8 categorie di rischio per massimizzare la rigiocabilità:

- **Social Engineering**: CEO Fraud, smishing, baiting via USB
- **Sicurezza Tecnica**: Credential stuffing, 2FA, Autorun malware
- **Sicurezza di Rete**: Evil Twin WiFi, VPN
- **Conformità Fisica**: Dumpster diving, Clean Desk Policy, stampa sicura (GDPR)

Ogni partita seleziona casualmente tra 3-4 varianti per rischio, garantendo sessioni sempre diverse.

---

## Gamification

- **XP e Livelli**: punti esperienza per completamento moduli e simulazioni
- **Badge**: traguardi per categorie (completamento, velocità, punteggio perfetto)
- **Leaderboard**: classifiche tra colleghi della stessa azienda
- **Sfide Multiplayer**: confronta punteggi su moduli specifici
- **Percorsi Adattivi**: contenuti personalizzati per settore di rischio e ruolo
- **Achievement Popup**: notifiche in-app per traguardi sbloccati

---

## Dashboard e Ruoli

### Ruoli utente
| Ruolo | Accesso |
|-------|---------|
| `admin` | Dashboard completa, gestione utenti, statistiche globali, configurazione |
| `company_client` | Dashboard aziendale, gestione dipendenti, certificati batch, report compliance |
| `employee` | Dashboard personale, moduli assegnati, certificati, notifiche |

### Dashboard Admin (`/admin`)
- Statistiche globali (utenti, sessioni demo, richieste preventivo)
- Grafici: richieste per stato, sessioni per scenario, utenti per ruolo
- Gestione ruoli utente
- Configurazione tempi sezione (`/admin/training-config`)
- Analytics formazione (`/admin/training-analytics`)
- Controllo promemoria formativi

### Dashboard Azienda (`/company`)
- Statistiche aziendali (dipendenti, completamenti, punteggio medio)
- Tabella dipendenti con stato formazione
- Assegnazione settori di rischio ai dipendenti
- Report compliance e scadenze
- Grafico completamenti per modulo e trend punteggi
- Certificati: editor personalizzato, esportazione batch, logo aziendale
- Export dashboard in PDF

### Dashboard Dipendente (`/employee`)
- Statistiche personali (XP, livello, moduli completati)
- Progresso moduli con barra avanzamento
- Sessioni recenti
- Certificati ottenuti
- Notifiche (assegnazioni, scadenze, completamenti)

---

## Backend e Database

### Tabelle principali (20+)
- `profiles` — Dati utente (nome, email, telefono, azienda)
- `user_roles` — Ruoli separati (admin, company_client, employee)
- `companies` — Aziende con logo, settore, personalizzazione certificati
- `company_users` — Associazione utente-azienda
- `training_modules` — Moduli formativi con settore, durata, punteggio
- `training_progress` — Progresso per utente/modulo (sezione, score, XP)
- `boss_test_results` — Risultati test finali con tentativi
- `certificates` — Certificati con QR code e hash verifica
- `demo_sessions` — Sessioni demo 3D
- `scenario_stats` — Statistiche per scenario (best score, tempo, esplorazione)
- `user_xp` — XP totali e livello utente
- `training_badges` / `user_training_badges` — Sistema badge
- `training_challenges` — Sfide multiplayer
- `game_replays` — Registrazioni sessioni di gioco
- `user_achievements` — Traguardi sbloccati
- `employee_notifications` / `admin_notifications` — Notifiche
- `user_risk_sectors` — Settore di rischio assegnato
- `company_mandatory_modules` — Moduli obbligatori per azienda
- `training_time_config` / `training_timer_logs` — Configurazione e log tempi
- `point_click_progress` — Progresso livelli point & click
- `quote_requests` — Richieste preventivo

### Edge Functions
| Funzione | Scopo |
|----------|-------|
| `ai-tutor` | Tutor AI per assistenza formativa |
| `generate-sound-effect` | Generazione effetti sonori |
| `notify-module-completion` | Notifica completamento modulo |
| `notify-sector-assignment` | Notifica assegnazione settore |
| `send-certificate-notification` | Notifica emissione certificato |
| `send-deadline-reminders` | Promemoria scadenze |
| `send-training-reminders` | Promemoria formazione |

### RLS (Row-Level Security)
Tutte le tabelle hanno policy RLS attive. I ruoli sono gestiti tramite tabella separata `user_roles` con funzione `has_role()` security definer per evitare ricorsioni.

---

## Funzionalità Piattaforma

- **Notifiche Smart**: in-app ed email per completamenti, scadenze, assegnazioni
- **AI Tutor**: assistente intelligente per domande sulla sicurezza
- **Certificati Digitali**: QR code univoco, verifica pubblica su `/verify-certificate`
- **Richiesta Preventivo**: dialog multi-step con salvataggio su database
- **Sound Studio**: generazione e test effetti sonori (`/sound-studio`)
- **Scheda Tecnica**: documentazione tecnica della piattaforma (`/scheda-tecnica`)
- **Profilo Giocatore**: statistiche 3D, achievement, replay (`/player-profile`)
- **Reset Password**: flusso completo con email di recupero
- **Musica Intro**: audio ambientale nella homepage con controllo utente

---

## Pagine e Route

| Route | Pagina |
|-------|--------|
| `/` | Homepage (Hero, Moduli, Pricing, ecc.) |
| `/demo` | Demo 2D (point & click) |
| `/demo-3d` | Simulazioni 3D Babylon.js |
| `/auth` | Login |
| `/register` | Registrazione |
| `/reset-password` | Reset password |
| `/admin` | Dashboard Admin |
| `/admin/training-config` | Configurazione tempi formazione |
| `/admin/training-analytics` | Analytics formazione |
| `/company` | Dashboard Azienda |
| `/employee` | Dashboard Dipendente |
| `/profile` | Profilo utente |
| `/player-profile` | Profilo giocatore 3D |
| `/formazione` | Hub formazione |
| `/formazione/:moduleId` | Modulo formativo specifico |
| `/verify-certificate` | Verifica certificato QR |
| `/scheda-tecnica` | Scheda tecnica piattaforma |
| `/sound-studio` | Studio effetti sonori |

---

## Setup Locale

```bash
# Clona il repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev
```

Requisiti: Node.js 18+ e npm.

---

## Licenze Modelli 3D

- `warehouse.glb` — Poly Pizza (CC0)
- `factory.glb` — Poly Pizza (CC0)
- Avatar NPC — Vedi `public/models/avatars/`

Per aggiungere modelli personalizzati, consulta `public/models/README.md`.

---

**Safety Frontline** — Formazione sulla sicurezza intelligente per le PMI italiane. 🇮🇹
