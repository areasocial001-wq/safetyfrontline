import { ModuleContent } from './training-content';

export const moduloRSPP4Content: ModuleContent = {
  moduleId: 'rspp_dl_relazionale',
  sections: [
    {
      id: 'rspp4_comunicazione',
      title: 'Comunicazione della Sicurezza',
      type: 'lesson',
      content: `Il DL-RSPP deve saper comunicare efficacemente la sicurezza a tutti i livelli aziendali.

**📢 Informazione ai lavoratori (art. 36):**
Il DL deve informare ogni lavoratore su:
- Rischi generali dell'azienda e specifici della mansione
- Procedure di primo soccorso, antincendio, evacuazione
- Nominativi RSPP, MC, addetti emergenze
- Rischi connessi all'uso di sostanze pericolose (SDS)

**📚 Formazione dei lavoratori (art. 37):**
- Deve essere **sufficiente e adeguata**
- In occasione di: assunzione, trasferimento, cambio mansione, nuove attrezzature
- In **orario di lavoro** e senza oneri per il lavoratore
- Con verifica dell'apprendimento

**🤝 Consultazione e partecipazione:**
- Riunione periodica annuale (art. 35) per aziende >15 lavoratori
- Consultazione preventiva del RLS
- Coinvolgimento dei lavoratori nelle decisioni sulla sicurezza

**📊 Strumenti di comunicazione efficace:**
- Riunioni di reparto sulla sicurezza (toolbox meeting)
- Cartellonistica chiara e aggiornata
- Newsletter/comunicazioni interne
- Cassetta delle segnalazioni
- App e strumenti digitali`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'rspp4_quiz_comunicazione',
      title: 'Verifica: Comunicazione e Formazione',
      type: 'quiz',
      questions: [
        {
          id: 'rspp4_q1',
          question: 'La formazione dei lavoratori deve avvenire:',
          options: ['Fuori dall\'orario di lavoro', 'In orario di lavoro e senza oneri per il lavoratore', 'Solo durante le ferie', 'Solo online'],
          correctIndex: 1,
          explanation: 'L\'art. 37 stabilisce che la formazione deve avvenire in orario di lavoro e non può comportare oneri economici a carico dei lavoratori.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rspp4_q2',
          question: 'La riunione periodica annuale è obbligatoria per aziende con:',
          options: ['Qualsiasi dimensione', 'Più di 15 lavoratori', 'Più di 50 lavoratori', 'Più di 200 lavoratori'],
          correctIndex: 1,
          explanation: 'La riunione periodica (art. 35) è obbligatoria almeno una volta l\'anno nelle aziende con più di 15 lavoratori.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rspp4_riunione',
      title: 'La Riunione Periodica (Art. 35)',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'DL Marco', role: 'Datore di Lavoro-RSPP', text: 'Alla riunione periodica partecipo io come DL e RSPP, il Medico Competente e il RLS. L\'ordine del giorno comprende: DVR, andamento infortuni, DPI, formazione effettuata e programmata.' },
        { speaker: 'Dott. Verdi', role: 'Medico Competente', text: 'Presento i risultati anonimi e aggregati della sorveglianza sanitaria. Se emergono tendenze preoccupanti, propongo modifiche alla valutazione dei rischi o alle misure di prevenzione.' },
        { speaker: 'Giovanni', role: 'RLS', text: 'È il momento in cui verifico che le segnalazioni dell\'anno precedente siano state prese in carico. Presento le nuove osservazioni e propongo miglioramenti concreti.' },
        { speaker: 'DL Marco', role: 'Datore di Lavoro-RSPP', text: 'Il verbale della riunione deve essere redatto e firmato da tutti i partecipanti. È un documento importante in caso di ispezione o contenzioso.' },
      ],
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rspp4_gestione_emergenze',
      title: 'Organizzazione delle Emergenze',
      type: 'lesson',
      content: `Il DL-RSPP deve organizzare il sistema di gestione delle emergenze.

**🚨 Piano di Emergenza ed Evacuazione (PEE):**
- Obbligatorio per aziende con ≥10 lavoratori
- Deve prevedere: vie di fuga, punti di raccolta, procedure di evacuazione
- Prove di evacuazione almeno **1 volta l'anno**

**🧯 Addetti Antincendio:**
- Designati dal DL, non possono rifiutare (salvo giustificato motivo)
- Formazione specifica in base al rischio (basso/medio/alto)
- Aggiornamento quinquennale

**🏥 Addetti Primo Soccorso:**
- Corso di 12 o 16 ore (gruppi A, B, C)
- Aggiornamento triennale (4 o 6 ore)
- Cassetta di primo soccorso sempre disponibile e rifornita

**📞 Numeri di emergenza:**
- 112 - Numero Unico Emergenze
- 115 - Vigili del Fuoco
- 118 - Emergenza Sanitaria

**⚠️ Il DL-RSPP deve garantire:**
- Formazione adeguata degli addetti
- Mezzi antincendio efficienti e verificati
- Segnaletica di emergenza visibile
- Aggiornamento periodico del piano`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rspp4_boss_test',
      title: '🏆 Test Finale - Modulo Relazionale',
      type: 'boss_test',
      questions: [
        {
          id: 'rspp4_boss1',
          question: 'Alla riunione periodica annuale partecipano:',
          options: ['Solo DL e RSPP', 'DL, RSPP, MC e RLS', 'Tutti i lavoratori', 'Solo i dirigenti'],
          correctIndex: 1,
          explanation: 'Alla riunione periodica (art. 35) partecipano: Datore di Lavoro (o suo delegato), RSPP, Medico Competente e RLS.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rspp4_boss2',
          question: 'Le prove di evacuazione devono essere effettuate:',
          options: ['Solo alla prima attivazione', 'Almeno una volta l\'anno', 'Ogni 5 anni', 'Solo su richiesta dell\'ASL'],
          correctIndex: 1,
          explanation: 'Le prove di evacuazione devono essere effettuate almeno una volta l\'anno per verificare l\'efficacia del Piano di Emergenza.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rspp4_boss3',
          question: 'Un lavoratore designato come addetto antincendio può rifiutare?',
          options: ['Sì, sempre', 'No, salvo giustificato motivo', 'Sì, se ha meno di un anno di anzianità', 'Solo con il consenso del RLS'],
          correctIndex: 1,
          explanation: 'I lavoratori designati come addetti alle emergenze non possono rifiutare la designazione, se non per giustificato motivo (art. 43, comma 3).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rspp4_boss4',
          question: 'L\'informazione ai lavoratori (art. 36) deve includere:',
          options: ['Solo i rischi generali', 'Rischi specifici, procedure di emergenza, nominativi delle figure della sicurezza', 'Solo l\'organigramma aziendale', 'Solo le istruzioni dei macchinari'],
          correctIndex: 1,
          explanation: 'L\'informazione deve coprire: rischi generali e specifici, procedure di emergenza, nominativi RSPP/MC/addetti, e contenuto delle SDS delle sostanze utilizzate.',
          xpReward: 30,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
