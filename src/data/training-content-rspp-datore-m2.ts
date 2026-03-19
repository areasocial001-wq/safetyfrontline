import { ModuleContent } from './training-content';

export const moduloRSPP2Content: ModuleContent = {
  moduleId: 'rspp_dl_gestione_rischi',
  sections: [
    {
      id: 'rspp2_dvr_approfondimento',
      title: 'Il DVR: Struttura e Contenuti',
      type: 'lesson',
      content: `Il Documento di Valutazione dei Rischi è il pilastro del sistema di prevenzione aziendale.

**📄 Contenuti obbligatori del DVR (art. 28):**
- Relazione sulla valutazione di **tutti** i rischi
- Indicazione delle **misure di prevenzione e protezione** attuate
- Programma delle misure per garantire il **miglioramento nel tempo**
- Individuazione delle **procedure** per l'attuazione delle misure
- Indicazione del **RSPP, MC e RLS**
- Individuazione delle **mansioni** che espongono a rischi specifici

**🔍 Tipologie di rischio da valutare:**
- Rischi per la sicurezza (meccanici, elettrici, incendio)
- Rischi per la salute (chimici, biologici, fisici)
- Rischi trasversali (stress lavoro-correlato, ergonomia, organizzazione)

**📊 Metodologie di valutazione:**
- Analisi documentale e sopralluogo
- Checklist e matrici di rischio
- Misurazioni strumentali (rumore, vibrazioni, agenti chimici)
- Indici statistici infortunistici`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'rspp2_quiz_dvr',
      title: 'Verifica: DVR e Valutazione',
      type: 'quiz',
      questions: [
        {
          id: 'rspp2_q1',
          question: 'Quale tra questi NON è un contenuto obbligatorio del DVR?',
          options: ['Relazione sulla valutazione dei rischi', 'Bilancio aziendale annuale', 'Programma di miglioramento', 'Indicazione delle mansioni a rischio'],
          correctIndex: 1,
          explanation: 'Il bilancio aziendale non è un contenuto del DVR. Il DVR deve contenere la valutazione dei rischi, le misure adottate, il programma di miglioramento e le mansioni esposte.',
          xpReward: 20,
          difficulty: 'easy',
        },
        {
          id: 'rspp2_q2',
          question: 'Lo stress lavoro-correlato rientra tra i rischi da valutare nel DVR?',
          options: ['No, è facoltativo', 'Sì, è obbligatorio dal 2010', 'Solo per aziende con più di 50 dipendenti', 'Solo se richiesto dai lavoratori'],
          correctIndex: 1,
          explanation: 'La valutazione dello stress lavoro-correlato è obbligatoria per tutte le aziende dal 1° gennaio 2011 (art. 28, comma 1-bis).',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rspp2_pdca',
      title: 'Il Ciclo PDCA e il Miglioramento Continuo',
      type: 'lesson',
      content: `Il Sistema di Gestione della Sicurezza si basa sul ciclo PDCA (Plan-Do-Check-Act).

**📊 PLAN - Pianificare:**
- Identificare i pericoli e valutare i rischi
- Definire obiettivi misurabili di sicurezza
- Pianificare le misure di prevenzione e protezione
- Allocare risorse (budget, personale, tempo)

**🔧 DO - Attuare:**
- Implementare le misure pianificate
- Formare e informare i lavoratori
- Distribuire DPI e verificarne l'uso
- Attivare la sorveglianza sanitaria

**🔍 CHECK - Verificare:**
- Monitorare gli indicatori di performance
- Effettuare audit interni
- Analizzare infortuni e near miss
- Verificare la conformità normativa

**🔄 ACT - Migliorare:**
- Correggere le non conformità
- Aggiornare il DVR
- Rivedere le procedure
- Implementare azioni correttive e preventive

**📈 KPI della Sicurezza:**
- IF = (N° infortuni × 1.000.000) / Ore lavorate
- IG = (Giorni persi × 1.000) / Ore lavorate
- Tasso di near miss segnalati
- Ore di formazione pro-capite`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'rspp2_npc_dvr',
      title: 'Scenari: Gestione del DVR',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Ing. Bianchi', role: 'Consulente HSE', text: 'Il DVR non è un documento statico! Deve essere aggiornato dopo ogni infortunio significativo, cambio di processo, introduzione di nuove attrezzature o sostanze, e comunque in occasione di modifiche organizzative rilevanti.' },
        { speaker: 'Dott.ssa Verdi', role: 'Medico Competente', text: 'Come MC, collaboro alla valutazione dei rischi. Segnalo al DL-RSPP i risultati della sorveglianza sanitaria che possono indicare rischi non adeguatamente valutati.' },
        { speaker: 'Marco', role: 'RLS', text: 'Ho diritto di consultare il DVR in azienda e di essere consultato preventivamente sulla valutazione. Se noto che un rischio non è stato valutato, lo segnalo formalmente.' },
        { speaker: 'Avv. Rossi', role: 'Legale', text: 'Un DVR generico o "copia-incolla" non ha valore legale. L\'Ispettorato verifica che sia specifico per la realtà aziendale. Le sanzioni per DVR inadeguato sono pesanti.' },
      ],
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rspp2_near_miss',
      title: 'Near Miss e Analisi Infortuni',
      type: 'lesson',
      content: `La gestione dei near miss (quasi-infortuni) è fondamentale per la prevenzione.

**🔺 La Piramide di Heinrich:**
Per ogni infortunio grave, ci sono:
- **29** infortuni lievi
- **300** near miss (quasi-infortuni)
- Migliaia di **comportamenti insicuri**

**📋 Sistema di segnalazione near miss:**
1. Modulo di segnalazione semplice e accessibile
2. Garanzia di **non punibilità** per chi segnala
3. Analisi tempestiva delle cause
4. Definizione azioni correttive
5. Feedback al segnalante
6. Monitoraggio dell'efficacia delle azioni

**🔍 Metodo delle 5 WHY (5 Perché):**
Esempio: Un lavoratore scivola su una pozza d'olio
1. Perché è scivolato? → C'era olio sul pavimento
2. Perché c'era olio? → Una guarnizione perdeva
3. Perché la guarnizione perdeva? → Non era stata sostituita
4. Perché non è stata sostituita? → Mancava nel piano di manutenzione
5. Perché mancava? → Il piano non era aggiornato

**Causa radice:** Piano di manutenzione non aggiornato`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rspp2_boss_test',
      title: '🏆 Test Finale - Gestione Rischi',
      type: 'boss_test',
      questions: [
        {
          id: 'rspp2_boss1',
          question: 'Il DVR deve essere aggiornato:',
          options: ['Solo ogni 5 anni', 'Solo dopo un infortunio mortale', 'Dopo modifiche significative del processo produttivo, infortuni o su indicazione della sorveglianza sanitaria', 'Solo su richiesta dell\'ASL'],
          correctIndex: 2,
          explanation: 'Il DVR deve essere rielaborato in occasione di modifiche significative al processo produttivo, dopo infortuni rilevanti o quando i risultati della sorveglianza sanitaria lo rendano necessario.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rspp2_boss2',
          question: 'L\'Indice di Frequenza (IF) degli infortuni si calcola come:',
          options: ['N° infortuni / N° dipendenti', '(N° infortuni × 1.000.000) / Ore lavorate', 'Giorni persi / N° infortuni', 'N° infortuni / Giorni lavorativi'],
          correctIndex: 1,
          explanation: 'L\'IF = (N° infortuni × 1.000.000) / Ore lavorate. È un indicatore standardizzato che permette il confronto tra aziende diverse.',
          xpReward: 30,
          difficulty: 'hard',
        },
        {
          id: 'rspp2_boss3',
          question: 'Secondo la Piramide di Heinrich, per ogni infortunio grave ci sono circa:',
          options: ['10 near miss', '100 near miss', '300 near miss', '1000 near miss'],
          correctIndex: 2,
          explanation: 'La Piramide di Heinrich indica che per ogni infortunio grave ci sono 29 infortuni lievi e 300 near miss. Gestire i near miss previene gli infortuni gravi.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rspp2_boss4',
          question: 'La fase "Check" del ciclo PDCA comprende:',
          options: ['Pianificazione delle misure', 'Attuazione della formazione', 'Monitoraggio, audit e analisi infortuni', 'Correzione delle non conformità'],
          correctIndex: 2,
          explanation: 'La fase Check prevede il monitoraggio degli indicatori, gli audit interni, l\'analisi degli infortuni e la verifica della conformità normativa.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rspp2_boss5',
          question: 'Il metodo delle "5 WHY" serve a:',
          options: ['Contare gli infortuni', 'Identificare la causa radice di un evento', 'Calcolare l\'indice di gravità', 'Pianificare la formazione'],
          correctIndex: 1,
          explanation: 'Il metodo dei 5 Perché è una tecnica di root cause analysis che risale dalle cause immediate alla causa radice di un incidente o near miss.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
