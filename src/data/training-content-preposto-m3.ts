import { ModuleContent } from './training-content';

export const moduloP3Content: ModuleContent = {
  moduleId: 'preposto_emergenze',
  sections: [
    {
      id: 'p3_gestione_emergenze',
      title: 'Il Preposto nella Gestione delle Emergenze',
      type: 'lesson',
      content: `Il Preposto è spesso il primo a dover gestire una situazione di emergenza nel proprio reparto.

**🚨 Tipologie di emergenza:**
- **Incendio:** attivare allarme, evacuare, usare estintore solo se sicuro
- **Infortunio grave:** attivare catena del soccorso, mettere in sicurezza l'area
- **Sversamento chimico:** evacuare, contenere se possibile, ventilare
- **Emergenza sismica:** ripararsi, evacuare dopo la scossa, punto di raccolta
- **Minaccia/aggressione:** allontanare le persone, chiamare le forze dell'ordine

**📋 Protocollo d'azione del Preposto in emergenza:**
1. **Valutare** rapidamente la situazione (senza esporsi a rischi)
2. **Attivare** l'allarme e i soccorsi (112)
3. **Informare** i lavoratori del pericolo
4. **Coordinare** l'evacuazione del proprio settore
5. **Verificare** che tutti abbiano lasciato l'area (appello al punto di raccolta)
6. **Attendere** i soccorsi senza rientrare nelle zone pericolose
7. **Collaborare** con i soccorritori fornendo informazioni

**⚠️ Il Preposto NON deve MAI:**
- Rientrare in un'area pericolosa per recuperare oggetti
- Tentare interventi per cui non è formato
- Autorizzare la ripresa del lavoro prima del "cessato allarme"`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'p3_quiz_emergenze',
      title: 'Verifica: Gestione Emergenze',
      type: 'quiz',
      questions: [
        {
          id: 'p3_q1',
          question: 'Durante un incendio nel reparto, il Preposto deve come prima cosa:',
          options: ['Cercare di spegnere l\'incendio da solo', 'Attivare l\'allarme e iniziare l\'evacuazione del settore', 'Chiamare il DL per chiedere cosa fare', 'Continuare a lavorare se l\'incendio è piccolo'],
          correctIndex: 1,
          explanation: 'La priorità è attivare l\'allarme e iniziare l\'evacuazione. Solo se l\'incendio è piccolo e si è formati, si può tentare l\'estinzione senza rischio.',
          xpReward: 20,
          difficulty: 'easy',
        },
        {
          id: 'p3_q2',
          question: 'Il Preposto può autorizzare la ripresa del lavoro dopo un\'emergenza?',
          options: ['Sì, appena il pericolo sembra passato', 'No, solo dopo il "cessato allarme" ufficiale', 'Sì, dopo 30 minuti', 'Solo con il permesso del RLS'],
          correctIndex: 1,
          explanation: 'Il Preposto non deve autorizzare la ripresa del lavoro finché non viene comunicato il "cessato allarme" ufficiale da parte dei responsabili dell\'emergenza.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'p3_near_miss',
      title: 'Near Miss e Reporting',
      type: 'lesson',
      content: `Il Preposto è la figura chiave nella segnalazione e gestione dei near miss.

**🔺 Cos'è un Near Miss?**
Un evento che avrebbe potuto causare un infortunio ma che, per circostanze fortuite, non ha prodotto danni a persone.

**📊 Perché segnalare i near miss?**
- Ogni near miss è un **segnale di allarme** per un possibile infortunio futuro
- L'analisi dei near miss costa **molto meno** di un infortunio
- Permette di intervenire **prima** che accada il danno
- Contribuisce alla cultura della sicurezza

**📋 Come segnalare un near miss:**
1. **Cosa** è successo (descrizione dell'evento)
2. **Dove** è successo (luogo esatto)
3. **Quando** è successo (data, ora, turno)
4. **Chi** era coinvolto (senza colpevolizzare)
5. **Perché** è successo (cause possibili)
6. **Come** si può evitare (proposte)

**🏆 Buone pratiche:**
- Sistema di segnalazione **semplice e rapido**
- **Non punire** chi segnala
- **Feedback** tempestivo sulle azioni intraprese
- **Premiare** le segnalazioni (gamification della sicurezza)
- Analisi statistica periodica dei near miss`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'p3_npc_comunicazione',
      title: 'Comunicazione Efficace del Preposto',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Franco', role: 'Preposto Senior', text: 'Il briefing di inizio turno è fondamentale. 5 minuti per ricordare i rischi della giornata, verificare i DPI e raccogliere segnalazioni. Previene più infortuni di qualsiasi procedura scritta.' },
        { speaker: 'Dott.ssa Belli', role: 'Psicologa del Lavoro', text: 'Un Preposto efficace non urla e non minaccia. Spiega il PERCHÉ di ogni regola di sicurezza. Se il lavoratore capisce il motivo, rispetta la regola anche quando nessuno lo guarda.' },
        { speaker: 'Luca', role: 'Preposto Cantiere', text: 'Documenta tutto. Ogni segnalazione, ogni intervento, ogni near miss. Se un giorno succede qualcosa, la tua documentazione dimostrerà che hai fatto il tuo dovere.' },
        { speaker: 'Avv. Neri', role: 'Legale', text: 'La Cassazione ha stabilito che il Preposto "di fatto" è responsabile quanto quello formalmente nominato. Se coordinate e vigilate, siete Preposti anche senza nomina scritta.' },
      ],
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'p3_responsabilita',
      title: 'Responsabilità Penali del Preposto',
      type: 'lesson',
      content: `Il Preposto può incorrere in responsabilità penali significative.

**⚖️ Reati connessi alla sicurezza sul lavoro:**

**In caso di infortunio:**
- **Lesioni colpose** (art. 590 c.p.): se con violazione norme sicurezza, pena aumentata
- **Omicidio colposo** (art. 589 c.p.): in caso di morte del lavoratore
- **Omissione di soccorso** (art. 593 c.p.): se non si presta assistenza

**Violazioni specifiche (art. 56 D.Lgs 81/08):**
- Omessa vigilanza sull'osservanza delle disposizioni: arresto fino a 2 mesi o ammenda
- Mancata segnalazione di condizioni di pericolo: arresto fino a 1 mese o ammenda

**📌 Giurisprudenza consolidata:**
- Il Preposto "di fatto" ha le stesse responsabilità del Preposto nominato
- "Vedere e non intervenire" equivale a una condotta omissiva colpevole
- La delega del DL non esclude la responsabilità propria del Preposto
- La formazione adeguata è una attenuante, non un'esimente

**🛡️ Come tutelarsi:**
- Formazione continua e aggiornata
- Documentazione di tutte le attività di vigilanza
- Segnalazioni scritte e protocollate
- Intervento tempestivo su ogni non conformità`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'p3_boss_test',
      title: '🏆 Test Finale - Emergenze e Comunicazione',
      type: 'boss_test',
      questions: [
        {
          id: 'p3_boss1',
          question: 'Il "near miss" deve essere segnalato:',
          options: ['Solo se ha causato danni', 'Sempre, anche senza danni, per prevenire infortuni futuri', 'Solo se ci sono testimoni', 'Solo in forma verbale'],
          correctIndex: 1,
          explanation: 'I near miss vanno sempre segnalati perché rappresentano opportunità di prevenzione. Ogni near miss è un potenziale infortunio evitato.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'p3_boss2',
          question: 'Il Preposto "di fatto" (non formalmente nominato) è:',
          options: ['Esente da responsabilità', 'Responsabile quanto il Preposto nominato', 'Responsabile solo per dolo', 'Non riconosciuto dalla legge'],
          correctIndex: 1,
          explanation: 'La giurisprudenza riconosce il Preposto di fatto: chi esercita poteri di coordinamento e vigilanza è responsabile anche senza nomina formale.',
          xpReward: 40,
          difficulty: 'hard',
        },
        {
          id: 'p3_boss3',
          question: 'Durante un\'evacuazione, il Preposto deve:',
          options: ['Uscire per primo', 'Coordinare l\'evacuazione del proprio settore e verificare che tutti siano usciti', 'Restare alla postazione finché l\'incendio non è vicino', 'Chiamare solo il DL'],
          correctIndex: 1,
          explanation: 'Il Preposto coordina l\'evacuazione del proprio settore, verifica che tutti abbiano raggiunto il punto di raccolta e non autorizza il rientro fino al cessato allarme.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'p3_boss4',
          question: 'Il briefing di inizio turno sulla sicurezza:',
          options: ['È obbligatorio per legge', 'Non è obbligatorio ma è una best practice molto efficace', 'È richiesto solo nei cantieri', 'È compito del RLS'],
          correctIndex: 1,
          explanation: 'Il briefing di inizio turno non è un obbligo specifico di legge ma è considerato una best practice fondamentale per la prevenzione degli infortuni.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'p3_boss5',
          question: 'In caso di omicidio colposo per violazione delle norme sulla sicurezza, il Preposto che non ha vigilato rischia:',
          options: ['Nessuna conseguenza penale', 'Solo sanzione amministrativa', 'Condanna penale per omessa vigilanza come concausa', 'Solo responsabilità civile'],
          correctIndex: 2,
          explanation: 'In caso di infortunio mortale, il Preposto che ha omesso la vigilanza può essere condannato penalmente per la sua condotta omissiva come concausa dell\'evento.',
          xpReward: 40,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
