export const antincendioProtezioneContent = {
  moduleId: 'antincendio_protezione',
  sections: [
    {
      id: 'extinguishers',
      title: 'Estintori Portatili e Carrellati',
      content: `Gli estintori sono i mezzi di primo intervento più diffusi. Si distinguono in:

**Estintori portatili** (≤ 20 kg): utilizzabili da una sola persona
**Estintori carrellati** (> 20 kg): su ruote, per rischi maggiori

**Componenti principali:**
- Bombola contenente l'agente estinguente
- Manichetta con lancia di erogazione
- Dispositivo di sicurezza (spina/sigillo)
- Manometro (per estintori a pressione permanente)

**Come usare un estintore (regola P.A.S.S.):**
1. **P**ull — Togliere la spina di sicurezza
2. **A**im — Dirigere il getto alla base delle fiamme
3. **S**queeze — Premere la leva di erogazione
4. **S**weep — Muovere a ventaglio

**Manutenzione obbligatoria:**
- Sorveglianza: mensile (visiva)
- Controllo: semestrale (tecnico)
- Revisione: secondo tipo (1-3-5 anni)
- Collaudo: secondo normativa ISPESL`,
      duration_minutes: 10,
      quiz: {
        question: 'La regola P.A.S.S. per l\'uso dell\'estintore prevede come primo passo:',
        options: ['Premere la leva', 'Togliere la spina di sicurezza', 'Dirigere il getto', 'Muovere a ventaglio'],
        correct: 1,
        explanation: 'P = Pull, ovvero togliere la spina/sigillo di sicurezza prima dell\'uso.'
      }
    },
    {
      id: 'fire_hydrants',
      title: 'Idranti e Naspi',
      content: `**Naspi (UNI EN 671-1):**
- Tubo semirigido su tamburo rotante
- Diametro 20-25 mm, lunghezza fino a 30 m
- Utilizzabile anche da una sola persona
- Alimentazione dalla rete idrica

**Idranti a muro (UNI EN 671-2):**
- Cassetta con manichetta appiattita
- Diametro 45-70 mm
- Richiedono generalmente due operatori
- Portata e gittata superiori al naspo

**Idranti a colonna (soprasuolo/sottosuolo):**
- Per esterni, alimentati da rete antincendio dedicata
- Utilizzati principalmente dai Vigili del Fuoco

**Regole d'uso:**
- Srotolare completamente la manichetta
- Aprire gradualmente la valvola
- MAI su incendi di classe B senza apposito frazionatore
- MAI su apparecchiature elettriche sotto tensione`,
      duration_minutes: 8,
      quiz: {
        question: 'Qual è la differenza principale tra naspo e idrante a muro?',
        options: ['Il colore', 'Il naspo ha tubo semirigido e si usa da soli, l\'idrante ha manichetta piatta e richiede due persone', 'Nessuna differenza', 'L\'idrante è più piccolo'],
        correct: 1,
        explanation: 'Il naspo ha tubo semirigido utilizzabile da una persona, l\'idrante a muro ha manichetta appiattita e richiede generalmente due operatori.'
      }
    },
    {
      id: 'escape_routes',
      title: 'Vie di Esodo e Segnaletica',
      content: `Le vie di esodo devono garantire l'evacuazione rapida e sicura di tutti gli occupanti:

**Requisiti:**
- Larghezza minima 120 cm (uscite di sicurezza) e 80 cm (porte dei locali)
- Apertura nel senso dell'esodo (verso l'esterno)
- Maniglioni antipanico sulle porte di sicurezza
- Illuminazione di emergenza autonoma
- Assenza di ostacoli e materiali combustibili

**Segnaletica di sicurezza (D.Lgs. 81/08):**
- 🟩 Verde con pittogramma bianco: vie di fuga e uscite
- 🟥 Rosso: attrezzature antincendio
- 🟡 Giallo/Arancione: pericolo
- 🔵 Blu: obbligo

**Illuminazione di emergenza:**
- Si attiva automaticamente in caso di mancanza di corrente
- Autonomia minima 1 ora
- Deve illuminare percorsi, uscite, scale`,
      duration_minutes: 8,
      quiz: {
        question: 'Le porte di sicurezza devono aprirsi:',
        options: ['Verso l\'interno', 'Nel senso dell\'esodo (verso l\'esterno)', 'In entrambe le direzioni', 'Solo con chiave'],
        correct: 1,
        explanation: 'Le porte sulle vie di esodo devono aprirsi nel senso dell\'evacuazione per facilitare l\'uscita.'
      }
    },
    {
      id: 'evacuation_plan',
      title: 'Piano di Emergenza ed Evacuazione',
      content: `Il Piano di Emergenza è obbligatorio per le aziende con 10 o più lavoratori (D.M. 2 settembre 2021):

**Contenuti del piano:**
- Azioni da compiere in caso di emergenza
- Procedure di evacuazione
- Disposizioni per chiamare i soccorsi
- Misure specifiche per persone con disabilità
- Planimetrie con percorsi e punti di raccolta

**Figure dell'emergenza:**
- **Coordinatore dell'emergenza**: dirige le operazioni
- **Addetti antincendio**: primo intervento e supporto evacuazione
- **Addetti primo soccorso**: assistenza sanitaria
- **Addetti all'evacuazione**: guidano verso le uscite

**Punto di raccolta:**
- Area sicura esterna all'edificio
- Tutti devono raggiungerlo e farsi contare
- Non rientrare mai senza autorizzazione

**Esercitazioni:**
- Almeno una volta all'anno
- Coinvolgono tutti i lavoratori
- Vengono registrate e analizzate`,
      duration_minutes: 10,
      quiz: {
        question: 'Il Piano di Emergenza è obbligatorio per aziende con almeno:',
        options: ['5 lavoratori', '10 lavoratori', '20 lavoratori', '50 lavoratori'],
        correct: 1,
        explanation: 'Il D.M. 2 settembre 2021 prevede l\'obbligo del piano di emergenza per aziende con 10 o più lavoratori.'
      }
    },
    {
      id: 'emergency_procedures',
      title: 'Procedure Operative in Emergenza',
      content: `**In caso di incendio, la sequenza corretta è:**

1. **Mantenere la calma** — Il panico è il peggior nemico
2. **Valutare la situazione** — Dimensione dell'incendio, possibilità di intervento
3. **Dare l'allarme** — Pulsante allarme o comunicazione verbale
4. **Tentare lo spegnimento** — Solo se l'incendio è nella fase iniziale e si è formati
5. **Evacuare** — Se non si riesce a controllare, evacuare immediatamente
6. **Chiamare i soccorsi** — 115 (VVF) o 112 (NUE)
7. **Raggiungere il punto di raccolta** — Farsi contare

**Comportamenti in caso di fumo:**
- Camminare bassi (il fumo sale)
- Coprire naso e bocca con panno umido
- Chiudere le porte dietro di sé (rallenta il fuoco)
- Se la porta è calda, NON aprirla

**Mai:**
- Usare ascensori
- Tornare indietro per recuperare oggetti
- Rientrare nell'edificio senza autorizzazione`,
      duration_minutes: 8,
      quiz: {
        question: 'Se trovi una porta calda durante l\'evacuazione, devi:',
        options: ['Aprirla velocemente', 'Non aprirla e cercare un\'altra via', 'Aprirla lentamente', 'Buttarla giù'],
        correct: 1,
        explanation: 'Una porta calda indica fuoco dall\'altra parte. Non aprirla e cercare un percorso alternativo.'
      }
    }
  ],
  bossTest: {
    title: 'Test Finale — Protezione e Procedure',
    questions: [
      { question: 'La regola P.A.S.S. si riferisce a:', options: ['Piano di emergenza', 'Uso dell\'estintore', 'Primo soccorso', 'Segnaletica'], correct: 1 },
      { question: 'Le esercitazioni di evacuazione vanno fatte:', options: ['Ogni mese', 'Almeno una volta l\'anno', 'Ogni 5 anni', 'Solo all\'inizio'], correct: 1 },
      { question: 'In caso di fumo si deve:', options: ['Correre in piedi', 'Camminare bassi e coprire naso e bocca', 'Aprire tutte le finestre', 'Restare fermi'], correct: 1 },
      { question: 'Il naspo antincendio può essere usato da:', options: ['Solo VVF', 'Due persone', 'Una sola persona', 'Solo il RSPP'], correct: 2 },
      { question: 'Il numero dei Vigili del Fuoco è:', options: ['112', '115', '118', '113'], correct: 1 },
    ]
  },
  npcScenarios: [
    {
      id: 'evacuation_drill',
      title: 'Evacuazione d\'Emergenza',
      npcName: 'Cap. Moretti',
      npcRole: 'Coordinatore Emergenza',
      situation: 'Suona l\'allarme antincendio nel tuo reparto. Vedi fumo provenire dal corridoio est.',
      question: 'Qual è la prima cosa da fare?',
      options: [
        { text: 'Corro a prendere i miei effetti personali', isCorrect: false, feedback: 'Mai tornare indietro per oggetti personali durante un\'evacuazione.' },
        { text: 'Guido i colleghi verso l\'uscita di emergenza più vicina evitando il corridoio est', isCorrect: true, feedback: 'Corretto! Evacuare immediatamente utilizzando un percorso alternativo sicuro.' },
        { text: 'Prendo l\'ascensore per scendere più velocemente', isCorrect: false, feedback: 'Mai usare l\'ascensore durante un incendio: potrebbe bloccarsi.' },
        { text: 'Apro le finestre per far uscire il fumo', isCorrect: false, feedback: 'Aprire le finestre può alimentare l\'incendio. Priorità è l\'evacuazione.' }
      ]
    }
  ]
};
