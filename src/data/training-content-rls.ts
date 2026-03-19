// Corso RLS - Rappresentante dei Lavoratori per la Sicurezza
// Conforme all'art. 37 comma 11 D.Lgs 81/2008 (32 ore)

import { ModuleContent } from './training-content';

// ============================
// MODULO RLS1: RUOLO E COMPITI DEL RLS
// ============================
export const moduloRLS1Content: ModuleContent = {
  moduleId: 'rls_ruolo_compiti',
  sections: [
    {
      id: 'rls1_intro',
      title: 'Chi è il RLS',
      type: 'lesson',
      content: `Il **Rappresentante dei Lavoratori per la Sicurezza (RLS)** è la persona eletta o designata per rappresentare i lavoratori sugli aspetti della salute e della sicurezza durante il lavoro (art. 2, comma 1, lett. i).

**📋 Elezione e Designazione:**
- Nelle aziende fino a **15 lavoratori**: eletto direttamente dai lavoratori al loro interno
- Nelle aziende con più di **15 lavoratori**: eletto nell'ambito delle rappresentanze sindacali (RSU/RSA)
- Il numero minimo di RLS è: 1 (fino a 200 dipendenti), 3 (201-1000), 6 (oltre 1000)

**⏰ Formazione obbligatoria:**
- Corso iniziale: **32 ore** (di cui 12 su rischi specifici)
- Aggiornamento annuale: **4 ore** (<50 dipendenti) o **8 ore** (>50 dipendenti)

**🛡️ Tutele del RLS:**
- Non può subire pregiudizio per il suo ruolo
- Ha diritto a permessi retribuiti per svolgere le sue funzioni
- Ha accesso ai luoghi di lavoro
- Riceve copia del DVR
- È consultato preventivamente sulla valutazione dei rischi`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rls1_quiz_intro',
      title: 'Verifica: Ruolo del RLS',
      type: 'quiz',
      questions: [
        {
          id: 'rls1_q1',
          question: 'Come viene scelto il RLS in un\'azienda con 10 dipendenti?',
          options: ['Nominato dal DL', 'Eletto direttamente dai lavoratori', 'Nominato dall\'INAIL', 'Scelto dal sindacato territoriale'],
          correctIndex: 1,
          explanation: 'Nelle aziende fino a 15 lavoratori, il RLS è eletto direttamente dai lavoratori al loro interno (art. 47, comma 3).',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rls1_q2',
          question: 'L\'aggiornamento annuale del RLS in un\'azienda con 80 dipendenti è di:',
          options: ['4 ore', '8 ore', '12 ore', 'Non serve aggiornamento'],
          correctIndex: 1,
          explanation: 'Nelle aziende con più di 50 dipendenti, l\'aggiornamento annuale del RLS è di 8 ore.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rls1_attribuzioni',
      title: 'Attribuzioni del RLS (Art. 50)',
      type: 'lesson',
      content: `L'art. 50 del D.Lgs 81/08 definisce le attribuzioni specifiche del RLS:

**📖 ACCESSO e INFORMAZIONE:**
✅ Accede ai luoghi di lavoro per verifiche
✅ Riceve copia del DVR (può consultarlo solo in azienda)
✅ Riceve informazioni dagli organi di vigilanza
✅ È informato sulla valutazione dei rischi
✅ Riceve le informazioni provenienti dai servizi di vigilanza

**🗣️ CONSULTAZIONE:**
✅ È consultato preventivamente sulla valutazione dei rischi
✅ È consultato sulla designazione di RSPP, addetti antincendio e PS
✅ È consultato sulla organizzazione della formazione
✅ Partecipa alla riunione periodica (art. 35)

**📢 PROPOSTE e SEGNALAZIONI:**
✅ Formula osservazioni in occasione di visite e verifiche
✅ Promuove l'elaborazione e l'attuazione delle misure di prevenzione
✅ Fa proposte in merito all'attività di prevenzione
✅ Può fare ricorso alle autorità competenti se le misure adottate non sono idonee

**🔒 RISERVATEZZA:**
Il RLS è tenuto al segreto industriale per le informazioni contenute nel DVR.`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rls1_npc_scenario',
      title: 'Scenari Pratici per il RLS',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Giovanni', role: 'RLS Esperto', text: 'Quando faccio il sopralluogo, uso una checklist. Verifico: vie di fuga libere, estintori accessibili, DPI indossati, segnaletica visibile, macchine con protezioni. Ogni criticità la annoto e la comunico formalmente al DL.' },
        { speaker: 'Maria', role: 'Lavoratrice', text: 'Ho segnalato al RLS che il mio collega non usa i guanti. Il RLS ha parlato con il Preposto che ha richiamato il collega. Se il problema persiste, il RLS può segnalarlo al DL per iscritto.' },
        { speaker: 'Dott. Verdi', role: 'Ispettore ASL', text: 'Durante un\'ispezione, chiedo sempre se il RLS è stato consultato. Se il DL non lo ha consultato sulla valutazione dei rischi, è una violazione dell\'art. 50 e può essere sanzionato.' },
        { speaker: 'Giovanni', role: 'RLS Esperto', text: 'Alla riunione periodica annuale, presento le osservazioni raccolte, propongo miglioramenti e verifico che il DL abbia dato seguito alle segnalazioni precedenti. È il momento più importante del mio ruolo.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'rls1_interactive',
      title: '🎮 Il RLS in Azione',
      type: 'interactive',
      content: 'Mettiti nei panni del RLS e prendi le decisioni corrette in questi scenari.',
      questions: [
        {
          id: 'rls1_int1',
          question: 'Un lavoratore ti segnala che un macchinario ha la protezione rotta. Cosa fai come RLS?',
          options: ['Riparo la protezione personalmente', 'Segnalo formalmente al DL/Preposto e verifico l\'intervento', 'Ignoro perché non è di mia competenza', 'Chiamo direttamente l\'ASL'],
          correctIndex: 1,
          explanation: 'Il RLS deve segnalare formalmente al DL o al Preposto, verificare che l\'intervento venga eseguito e, se necessario, formalizzare per iscritto.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'rls1_int2',
          question: 'Il DL ti informa che domani arriva un nuovo macchinario. Cosa fai?',
          options: ['Non mi riguarda', 'Chiedo di essere consultato sulla valutazione dei rischi del nuovo macchinario', 'Aspetto che si verifichi un problema', 'Chiedo solo le istruzioni d\'uso'],
          correctIndex: 1,
          explanation: 'Il RLS deve essere consultato preventivamente sulla valutazione dei rischi, inclusi quelli derivanti da nuove attrezzature (art. 50, comma 1, lett. b).',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'rls1_int3',
          question: 'Nonostante le tue segnalazioni, il DL non interviene su un rischio grave. Cosa puoi fare?',
          options: ['Nulla, il DL decide', 'Fare ricorso alle autorità competenti (ASL/Ispettorato)', 'Organizzare uno sciopero', 'Dimettermi dal ruolo'],
          correctIndex: 1,
          explanation: 'L\'art. 50, comma 1, lett. o) prevede che il RLS possa fare ricorso alle autorità competenti se ritiene che le misure adottate non siano idonee a garantire la sicurezza.',
          xpReward: 30,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'rls1_boss_test',
      title: '🏆 Test Finale - Corso RLS',
      type: 'boss_test',
      questions: [
        {
          id: 'rls1_boss1',
          question: 'Il RLS ha diritto di accesso:',
          options: ['Solo agli uffici', 'A tutti i luoghi di lavoro', 'Solo con autorizzazione del DL', 'Solo durante l\'orario di lavoro'],
          correctIndex: 1,
          explanation: 'Il RLS accede ai luoghi in cui si svolgono le lavorazioni per verificare le condizioni di sicurezza (art. 50, comma 1, lett. a).',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rls1_boss2',
          question: 'La consultazione preventiva del RLS è obbligatoria per:',
          options: ['Solo per l\'acquisto dei DPI', 'Valutazione dei rischi, designazione figure sicurezza e organizzazione formazione', 'Solo per la riunione periodica', 'Solo per le visite mediche'],
          correctIndex: 1,
          explanation: 'Il RLS è consultato preventivamente su: valutazione dei rischi, designazione RSPP/addetti, organizzazione della formazione (art. 50).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rls1_boss3',
          question: 'Il RLS può portare copia del DVR fuori dall\'azienda?',
          options: ['Sì, sempre', 'No, può consultarlo solo in azienda', 'Sì, ma solo per mostrarlo al sindacato', 'Solo con autorizzazione scritta'],
          correctIndex: 1,
          explanation: 'Il RLS riceve copia del DVR ma può consultarlo esclusivamente in azienda. È tenuto al rispetto del segreto industriale (art. 50, comma 6).',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'rls1_boss4',
          question: 'Il corso iniziale per RLS ha una durata di:',
          options: ['8 ore', '16 ore', '32 ore', '48 ore'],
          correctIndex: 2,
          explanation: 'La formazione iniziale del RLS è di 32 ore, di cui 12 dedicate ai rischi specifici presenti in azienda (art. 37, comma 11).',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rls1_boss5',
          question: 'Se il DL non consulta il RLS sulla valutazione dei rischi, è soggetto a:',
          options: ['Nessuna conseguenza', 'Sanzione amministrativa pecuniaria', 'Arresto da 2 a 4 mesi o ammenda', 'Solo un richiamo verbale'],
          correctIndex: 2,
          explanation: 'La mancata consultazione del RLS sulla valutazione dei rischi è una violazione sanzionata penalmente (art. 18, comma 1, lett. s).',
          xpReward: 40,
          difficulty: 'hard',
        },
        {
          id: 'rls1_boss6',
          question: 'Quanti RLS sono previsti in un\'azienda con 500 dipendenti?',
          options: ['1', '3', '6', '10'],
          correctIndex: 1,
          explanation: 'Nelle aziende da 201 a 1000 lavoratori sono previsti almeno 3 RLS (art. 47, comma 7).',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};

export const rlsContents: ModuleContent[] = [
  moduloRLS1Content,
];
