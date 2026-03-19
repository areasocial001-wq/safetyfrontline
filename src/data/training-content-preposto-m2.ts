import { ModuleContent } from './training-content';

export const moduloP2Content: ModuleContent = {
  moduleId: 'preposto_valutazione_dpi',
  sections: [
    {
      id: 'p2_rischi_campo',
      title: 'Individuazione Rischi sul Campo',
      type: 'lesson',
      content: `Il Preposto è la figura che meglio conosce i rischi reali del proprio reparto perché li vive quotidianamente.

**🔍 Cosa deve verificare il Preposto ogni giorno:**

**Ambiente di lavoro:**
- ✅ Pavimenti puliti e non scivolosi
- ✅ Vie di fuga libere e segnalate
- ✅ Illuminazione adeguata
- ✅ Temperatura e ventilazione accettabili
- ✅ Ordine e pulizia generale

**Attrezzature e macchine:**
- ✅ Protezioni e ripari presenti e funzionanti
- ✅ Dispositivi di arresto d'emergenza accessibili
- ✅ Segnaletica di sicurezza visibile
- ✅ Manutenzione regolare effettuata
- ✅ Libretto d'uso disponibile

**Comportamenti dei lavoratori:**
- ✅ DPI indossati correttamente
- ✅ Procedure di lavoro rispettate
- ✅ Assenza di comportamenti a rischio (distrazione, fretta, scorciatoie)
- ✅ Solo personale formato nelle aree a rischio

**📋 La Checklist del Preposto:**
Una checklist giornaliera/settimanale aiuta a non dimenticare nulla e a documentare le verifiche effettuate.`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'p2_quiz_rischi',
      title: 'Verifica: Controlli del Preposto',
      type: 'quiz',
      questions: [
        {
          id: 'p2_q1',
          question: 'Un Preposto nota che un riparo di una macchina è stato rimosso "per lavorare più velocemente". Cosa deve fare?',
          options: ['Lasciare correre se il lavoratore è esperto', 'Fermare la macchina e far ripristinare il riparo prima di continuare', 'Segnalare a fine turno', 'Mettere un cartello di avvertimento'],
          correctIndex: 1,
          explanation: 'Il Preposto deve intervenire immediatamente: fermare la macchina, far ripristinare il riparo e ricordare al lavoratore che le protezioni non vanno mai rimosse.',
          xpReward: 20,
          difficulty: 'medium',
        },
        {
          id: 'p2_q2',
          question: 'Il Preposto deve verificare che solo lavoratori formati accedano alle zone a rischio. Questo obbligo è previsto:',
          options: ['Solo nei cantieri', 'Dall\'art. 19, comma 1, lett. b) per tutti i luoghi di lavoro', 'Solo per il rischio chimico', 'Solo se richiesto dal DL'],
          correctIndex: 1,
          explanation: 'L\'art. 19, comma 1, lett. b) impone al Preposto di verificare che solo i lavoratori che hanno ricevuto adeguate istruzioni accedano alle zone con rischio grave e specifico.',
          xpReward: 20,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'p2_dpi',
      title: 'DPI: Verifica e Gestione',
      type: 'lesson',
      content: `Il Preposto ha un ruolo chiave nella verifica dell'uso corretto dei DPI.

**🛡️ Obblighi del Preposto sui DPI:**
- Vigilare che i lavoratori **indossino** i DPI assegnati
- Verificare che i DPI siano **in buono stato**
- Segnalare al DL se i DPI sono **inadeguati o deteriorati**
- Assicurarsi che i lavoratori sappiano **come utilizzarli correttamente**

**📋 Principali DPI per categoria:**

| Parte del corpo | DPI | Quando |
|-----------------|-----|--------|
| **Testa** | Casco, elmetto | Caduta oggetti, urti |
| **Occhi** | Occhiali, visiera | Schegge, liquidi, radiazioni |
| **Udito** | Tappi, cuffie | Rumore >80 dB(A) |
| **Vie respiratorie** | Maschere, filtri | Polveri, vapori, gas |
| **Mani** | Guanti specifici | Chimico, meccanico, termico |
| **Piedi** | Scarpe S1-S5 | Schiacciamento, scivolamento |
| **Corpo** | Tuta, grembiule | Chimico, termico |
| **Anticaduta** | Imbracatura, cordino | Lavori in quota >2m |

**⚠️ Il Preposto NON deve:**
- Acquistare i DPI (compito del DL)
- Scegliere il tipo di DPI (compito del RSPP/DL)
- Ma DEVE segnalare se quelli forniti non sono adeguati`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'p2_interactive',
      title: '🎮 Ispezione DPI',
      type: 'interactive',
      content: 'Conduci un\'ispezione sui DPI come Preposto.',
      questions: [
        {
          id: 'p2_int1',
          question: 'Un lavoratore indossa guanti da giardinaggio per manipolare solventi chimici. Cosa fai?',
          options: ['Va bene, ha i guanti', 'Fermo il lavoro: servono guanti specifici per rischio chimico. Segnalo al DL la necessità', 'Gli dico di fare attenzione', 'Lo mando a comprare guanti nuovi'],
          correctIndex: 1,
          explanation: 'I DPI devono essere adeguati al rischio specifico. Guanti generici non proteggono dal rischio chimico. Il Preposto deve fermare il lavoro e segnalare al DL.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'p2_int2',
          question: 'Noti che le scarpe antinfortunistiche di un operaio hanno la suola consumata. Cosa fai?',
          options: ['Le scarpe vanno ancora bene', 'Segnalo al DL la necessità di sostituzione e nel frattempo limito le attività a rischio', 'Dico al lavoratore di comprarle lui', 'Aspetto che si rompano completamente'],
          correctIndex: 1,
          explanation: 'DPI deteriorati non garantiscono la protezione. Il Preposto deve segnalare la necessità di sostituzione al DL, che ha l\'obbligo di fornirli a proprie spese.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'p2_segnaletica',
      title: 'Segnaletica di Sicurezza',
      type: 'lesson',
      content: `Il Preposto deve conoscere e verificare la corretta segnaletica di sicurezza.

**🚦 Tipologie di segnaletica (D.Lgs 81/08 Titolo V):**

🔴 **DIVIETO** - Cerchio rosso, fondo bianco
- Vietato fumare, vietato l'accesso, vietato usare acqua su incendi elettrici

🔵 **OBBLIGO** - Cerchio blu, pittogramma bianco
- Obbligo casco, guanti, occhiali, imbracatura

⚠️ **AVVERTIMENTO** - Triangolo giallo, bordo e simbolo nero
- Pericolo generico, tensione elettrica, sostanze infiammabili, caduta carichi

🟩 **SALVATAGGIO** - Rettangolo verde, pittogramma bianco
- Uscita di emergenza, punto di raccolta, primo soccorso, doccia di emergenza

🟥 **ANTINCENDIO** - Rettangolo rosso, pittogramma bianco
- Estintore, idrante, pulsante allarme, lancia antincendio

**✅ Il Preposto deve verificare che:**
- La segnaletica sia visibile e non ostruita
- Sia aggiornata rispetto ai rischi presenti
- I lavoratori ne conoscano il significato
- Sia integra e leggibile`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'p2_boss_test',
      title: '🏆 Test Finale - Rischi e DPI',
      type: 'boss_test',
      questions: [
        {
          id: 'p2_boss1',
          question: 'Un segnale triangolare giallo con bordo nero indica:',
          options: ['Divieto', 'Obbligo', 'Avvertimento/Pericolo', 'Salvataggio'],
          correctIndex: 2,
          explanation: 'I segnali triangolari gialli con bordo e simbolo nero sono segnali di avvertimento che indicano un pericolo (es. tensione elettrica, sostanze infiammabili).',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'p2_boss2',
          question: 'Il Preposto che non vigila sull\'uso dei DPI è:',
          options: ['Non responsabile, è compito del DL', 'Penalmente responsabile per omessa vigilanza', 'Responsabile solo se c\'è un infortunio', 'Esente se ha fatto formazione'],
          correctIndex: 1,
          explanation: 'Il Preposto ha l\'obbligo di vigilare sull\'uso dei DPI (art. 19). L\'omessa vigilanza è sanzionata penalmente e può portare a responsabilità in caso di infortunio.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'p2_boss3',
          question: 'I DPI devono essere forniti:',
          options: ['A spese del lavoratore', 'A spese del Datore di Lavoro', 'A spese condivise', 'Solo ai lavoratori a tempo indeterminato'],
          correctIndex: 1,
          explanation: 'I DPI sono sempre a carico del Datore di Lavoro (art. 77). Il lavoratore non deve sostenere alcun costo per i dispositivi di protezione.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'p2_boss4',
          question: 'L\'imbracatura di sicurezza è obbligatoria per lavori in quota sopra:',
          options: ['1 metro', '2 metri', '3 metri', '5 metri'],
          correctIndex: 1,
          explanation: 'Si considera "lavoro in quota" l\'attività lavorativa che espone al rischio di caduta da un\'altezza superiore a 2 metri rispetto a un piano stabile (art. 107).',
          xpReward: 30,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
