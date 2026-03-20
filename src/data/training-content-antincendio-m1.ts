import type { ModuleContent } from './training-content';

export const antincendioPrevenzioneContent: ModuleContent = {
  moduleId: 'antincendio_prevenzione',
  sections: [
    {
      id: 'ai1_fire_chemistry',
      title: 'Il Triangolo del Fuoco',
      type: 'lesson',
      content: `La combustione è una reazione chimica di ossidazione sufficientemente rapida da produrre calore e generalmente una fiamma. Per avere un incendio servono tre elementi simultaneamente presenti, rappresentati dal **triangolo del fuoco**:

- **Combustibile**: qualsiasi sostanza in grado di bruciare (legno, carta, liquidi infiammabili, gas)
- **Comburente**: generalmente l'ossigeno dell'aria
- **Energia di innesco**: fonte di calore sufficiente ad avviare la reazione (fiamma, scintilla, surriscaldamento)

Rimuovendo anche solo uno di questi elementi, la combustione si interrompe. Questo principio è alla base di tutte le strategie di spegnimento.`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai1_quiz_chemistry',
      title: 'Verifica: Triangolo del Fuoco',
      type: 'quiz',
      questions: [
        {
          id: 'ai1_q1',
          question: 'Quali sono i tre elementi del triangolo del fuoco?',
          options: ['Combustibile, comburente, energia di innesco', 'Fumo, fiamma, calore', 'Ossigeno, azoto, carbonio', 'Vapore, gas, polvere'],
          correctIndex: 0,
          explanation: 'Il triangolo del fuoco è composto da combustibile, comburente (ossigeno) ed energia di innesco.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai1_fire_classes',
      title: 'Classi di Incendio',
      type: 'lesson',
      content: `Gli incendi vengono classificati in base alla natura del combustibile:

| Classe | Combustibile | Esempi |
|--------|-------------|--------|
| **A** | Solidi | Legno, carta, tessuti, gomma |
| **B** | Liquidi | Benzina, alcol, solventi, oli |
| **C** | Gas | Metano, GPL, acetilene, idrogeno |
| **D** | Metalli | Magnesio, alluminio, sodio, potassio |
| **F** | Oli da cucina | Grassi e oli per cottura |

La corretta classificazione è fondamentale per scegliere l'agente estinguente appropriato. Usare l'estinguente sbagliato può essere inefficace o addirittura pericoloso.`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai1_quiz_classes',
      title: 'Verifica: Classi di Incendio',
      type: 'quiz',
      questions: [
        {
          id: 'ai1_q2',
          question: 'Un incendio di benzina appartiene alla classe:',
          options: ['Classe A', 'Classe B', 'Classe C', 'Classe D'],
          correctIndex: 1,
          explanation: 'La classe B comprende gli incendi di liquidi infiammabili come benzina, alcol e solventi.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai1_prevention',
      title: 'Misure di Prevenzione Incendi',
      type: 'lesson',
      content: `Le misure di prevenzione mirano a **ridurre la probabilità** che si verifichi un incendio:

**Misure tecniche:**
- Impianti elettrici a norma e manutenuti
- Corretta classificazione delle aree a rischio
- Ventilazione adeguata dei locali
- Separazione e isolamento delle aree a rischio

**Misure organizzative:**
- Divieto di fumo nelle aree a rischio
- Corretta gestione dei rifiuti combustibili
- Manutenzione programmata degli impianti
- Permessi di lavoro a caldo (hot work permit)
- Ordine e pulizia dei luoghi di lavoro

**Misure comportamentali:**
- Non sovraccaricare le prese elettriche
- Non ostruire le vie di fuga
- Segnalare immediatamente anomalie
- Non lasciare incustodite fiamme libere`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai1_quiz_prevention',
      title: 'Verifica: Prevenzione',
      type: 'quiz',
      questions: [
        {
          id: 'ai1_q3',
          question: 'Quale delle seguenti NON è una misura di prevenzione incendi?',
          options: ['Manutenzione degli impianti elettrici', 'Installazione di estintori', 'Divieto di fumo in aree a rischio', 'Corretta gestione dei rifiuti'],
          correctIndex: 1,
          explanation: 'L\'installazione di estintori è una misura di PROTEZIONE (intervento), non di prevenzione (riduzione della probabilità).',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai1_products_combustion',
      title: 'Prodotti della Combustione',
      type: 'lesson',
      content: `La combustione produce sostanze pericolose per la salute:

**Fumi:**
- Particelle solide e liquide sospese nell'aria
- Riducono la visibilità (disorientamento)
- Irritano le vie respiratorie

**Gas tossici:**
- **CO (monossido di carbonio)**: inodore, incolore, LETALE — si lega all'emoglobina impedendo il trasporto di ossigeno
- **CO₂ (anidride carbonica)**: in alte concentrazioni causa asfissia
- **HCN (acido cianidrico)**: prodotto dalla combustione di materiali plastici, tessuti sintetici
- **HCl (acido cloridrico)**: dalla combustione del PVC

**Calore:**
- Ustioni dirette e da irraggiamento
- Colpo di calore
- Disidratazione

**Il fumo è la prima causa di morte negli incendi**, non le fiamme dirette. Per questo è fondamentale evacuare rapidamente e stare bassi.`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'ai1_quiz_combustion',
      title: 'Verifica: Prodotti della Combustione',
      type: 'quiz',
      questions: [
        {
          id: 'ai1_q4',
          question: 'Qual è la prima causa di morte negli incendi?',
          options: ['Le fiamme dirette', 'Il crollo delle strutture', 'Il fumo e i gas tossici', 'Le ustioni'],
          correctIndex: 2,
          explanation: 'Il fumo e i gas tossici (soprattutto il CO) sono la prima causa di morte negli incendi.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'ai1_q4b',
          question: 'Il monossido di carbonio (CO) è pericoloso perché:',
          options: ['Ha un odore forte', 'È visibile e irritante', 'È inodore e si lega all\'emoglobina impedendo il trasporto di ossigeno', 'Provoca ustioni'],
          correctIndex: 2,
          explanation: 'Il CO è inodore e incolore, si lega all\'emoglobina con affinità 200 volte superiore all\'ossigeno.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'ai1_boss_test',
      title: '🏆 Test Finale — Prevenzione Incendi',
      type: 'boss_test',
      questions: [
        {
          id: 'ai1_boss1',
          question: 'Il triangolo del fuoco è composto da:',
          options: ['Fumo, fiamme, calore', 'Combustibile, comburente, innesco', 'Acqua, polvere, CO₂', 'Ossigeno, azoto, idrogeno'],
          correctIndex: 1,
          explanation: 'Combustibile, comburente (ossigeno) ed energia di innesco.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ai1_boss2',
          question: 'Gli incendi di gas appartengono alla classe:',
          options: ['A', 'B', 'C', 'D'],
          correctIndex: 2,
          explanation: 'La classe C comprende gli incendi di gas (metano, GPL, acetilene).',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'ai1_boss3',
          question: 'Per spegnere un incendio è sufficiente:',
          options: ['Rimuovere tutti e tre gli elementi del triangolo', 'Rimuovere anche solo uno dei tre elementi', 'Aggiungere acqua', 'Soffiare sulle fiamme'],
          correctIndex: 1,
          explanation: 'Basta rimuovere uno solo dei tre elementi del triangolo del fuoco per interrompere la combustione.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ai1_boss4',
          question: 'Il monossido di carbonio è pericoloso perché:',
          options: ['Ha un forte odore', 'È visibile', 'È inodore e impedisce il trasporto di ossigeno nel sangue', 'Causa ustioni'],
          correctIndex: 2,
          explanation: 'Il CO è inodore, incolore e si lega all\'emoglobina impedendo il trasporto di ossigeno.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ai1_boss5',
          question: 'La differenza tra prevenzione e protezione antincendio è:',
          options: ['Sono la stessa cosa', 'La prevenzione riduce la probabilità, la protezione limita le conseguenze', 'La protezione è obbligatoria, la prevenzione no', 'La prevenzione è più costosa'],
          correctIndex: 1,
          explanation: 'La prevenzione agisce sulla probabilità di incendio, la protezione sulle conseguenze.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
