import type { ModuleContent } from './training-content';

export const antincendioProtezioneContent: ModuleContent = {
  moduleId: 'antincendio_protezione',
  sections: [
    {
      id: 'ai2_extinguishers',
      title: 'Estintori Portatili e Carrellati',
      type: 'lesson',
      content: `Gli estintori sono i mezzi di primo intervento più diffusi. Si distinguono in:

**Estintori portatili** (≤ 20 kg): utilizzabili da una sola persona
**Estintori carrellati** (> 20 kg): su ruote, per rischi maggiori

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
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ai2_quiz_extinguishers',
      title: 'Verifica: Estintori',
      type: 'quiz',
      questions: [
        {
          id: 'ai2_q1',
          question: 'La regola P.A.S.S. per l\'uso dell\'estintore prevede come primo passo:',
          options: ['Premere la leva', 'Togliere la spina di sicurezza', 'Dirigere il getto', 'Muovere a ventaglio'],
          correctIndex: 1,
          explanation: 'P = Pull, ovvero togliere la spina/sigillo di sicurezza prima dell\'uso.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai2_hydrants',
      title: 'Idranti e Naspi',
      type: 'lesson',
      content: `**Naspi (UNI EN 671-1):**
- Tubo semirigido su tamburo rotante
- Diametro 20-25 mm, lunghezza fino a 30 m
- Utilizzabile anche da una sola persona

**Idranti a muro (UNI EN 671-2):**
- Cassetta con manichetta appiattita
- Diametro 45-70 mm
- Richiedono generalmente due operatori

**Regole d'uso:**
- Srotolare completamente la manichetta
- Aprire gradualmente la valvola
- MAI su incendi di classe B senza apposito frazionatore
- MAI su apparecchiature elettriche sotto tensione`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai2_quiz_hydrants',
      title: 'Verifica: Idranti',
      type: 'quiz',
      questions: [
        {
          id: 'ai2_q2',
          question: 'Qual è la differenza principale tra naspo e idrante a muro?',
          options: ['Il colore', 'Il naspo ha tubo semirigido e si usa da soli, l\'idrante ha manichetta piatta e richiede due persone', 'Nessuna differenza', 'L\'idrante è più piccolo'],
          correctIndex: 1,
          explanation: 'Il naspo ha tubo semirigido utilizzabile da una persona, l\'idrante a muro ha manichetta appiattita e richiede generalmente due operatori.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai2_escape_routes',
      title: 'Vie di Esodo e Segnaletica',
      type: 'lesson',
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
- 🔵 Blu: obbligo`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai2_quiz_routes',
      title: 'Verifica: Vie di Esodo',
      type: 'quiz',
      questions: [
        {
          id: 'ai2_q3',
          question: 'Le porte di sicurezza devono aprirsi:',
          options: ['Verso l\'interno', 'Nel senso dell\'esodo (verso l\'esterno)', 'In entrambe le direzioni', 'Solo con chiave'],
          correctIndex: 1,
          explanation: 'Le porte sulle vie di esodo devono aprirsi nel senso dell\'evacuazione.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai2_emergency_plan',
      title: 'Piano di Emergenza ed Evacuazione',
      type: 'lesson',
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

**Esercitazioni:**
- Almeno una volta all'anno
- Coinvolgono tutti i lavoratori
- Vengono registrate e analizzate`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ai2_quiz_plan',
      title: 'Verifica: Piano di Emergenza',
      type: 'quiz',
      questions: [
        {
          id: 'ai2_q4',
          question: 'Il Piano di Emergenza è obbligatorio per aziende con almeno:',
          options: ['5 lavoratori', '10 lavoratori', '20 lavoratori', '50 lavoratori'],
          correctIndex: 1,
          explanation: 'Il D.M. 2 settembre 2021 prevede l\'obbligo per aziende con 10 o più lavoratori.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai2_procedures',
      title: 'Procedure Operative in Emergenza',
      type: 'lesson',
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
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai2_quiz_procedures',
      title: 'Verifica: Procedure',
      type: 'quiz',
      questions: [
        {
          id: 'ai2_q5',
          question: 'Se trovi una porta calda durante l\'evacuazione, devi:',
          options: ['Aprirla velocemente', 'Non aprirla e cercare un\'altra via', 'Aprirla lentamente', 'Buttarla giù'],
          correctIndex: 1,
          explanation: 'Una porta calda indica fuoco dall\'altra parte. Non aprirla e cercare un percorso alternativo.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai2_npc_scenario',
      title: '💬 Scenario: Evacuazione d\'Emergenza',
      type: 'interactive',
      npcDialogue: [
        { speaker: 'Cap. Moretti', role: 'Coordinatore Emergenza', text: 'Suona l\'allarme antincendio nel tuo reparto. Vedi fumo provenire dal corridoio est. Qual è la prima cosa da fare?' },
      ],
      questions: [
        {
          id: 'ai2_npc1',
          question: 'Qual è la prima cosa da fare?',
          options: [
            'Corro a prendere i miei effetti personali',
            'Guido i colleghi verso l\'uscita di emergenza più vicina evitando il corridoio est',
            'Prendo l\'ascensore per scendere più velocemente',
            'Apro le finestre per far uscire il fumo',
          ],
          correctIndex: 1,
          explanation: 'Evacuare immediatamente utilizzando un percorso alternativo sicuro, lontano dalla fonte di fumo.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 20,
    },
    {
      id: 'ai2_boss_test',
      title: '🏆 Test Finale — Protezione e Procedure',
      type: 'boss_test',
      questions: [
        {
          id: 'ai2_boss1',
          question: 'La regola P.A.S.S. si riferisce a:',
          options: ['Piano di emergenza', 'Uso dell\'estintore', 'Primo soccorso', 'Segnaletica'],
          correctIndex: 1,
          explanation: 'P.A.S.S. = Pull, Aim, Squeeze, Sweep — la sequenza per usare l\'estintore.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ai2_boss2',
          question: 'Le esercitazioni di evacuazione vanno fatte:',
          options: ['Ogni mese', 'Almeno una volta l\'anno', 'Ogni 5 anni', 'Solo all\'inizio'],
          correctIndex: 1,
          explanation: 'Le esercitazioni devono svolgersi almeno una volta all\'anno.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ai2_boss3',
          question: 'In caso di fumo si deve:',
          options: ['Correre in piedi', 'Camminare bassi e coprire naso e bocca', 'Aprire tutte le finestre', 'Restare fermi'],
          correctIndex: 1,
          explanation: 'Il fumo sale verso l\'alto, quindi camminare bassi e proteggere le vie respiratorie.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ai2_boss4',
          question: 'Il naspo antincendio può essere usato da:',
          options: ['Solo VVF', 'Due persone', 'Una sola persona', 'Solo il RSPP'],
          correctIndex: 2,
          explanation: 'Il naspo ha tubo semirigido ed è progettato per essere utilizzato da una sola persona.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ai2_boss5',
          question: 'Il numero dei Vigili del Fuoco è:',
          options: ['112', '115', '118', '113'],
          correctIndex: 1,
          explanation: 'Il 115 è il numero dei Vigili del Fuoco.',
          xpReward: 30,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
