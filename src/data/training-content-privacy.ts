// Modulo Privacy & GDPR - Reg. UE 2016/679 + D.Lgs 196/2003 e s.m.i.
import type { ModuleContent } from './training-content';

export const privacyGdprContent: ModuleContent = {
  moduleId: 'privacy_gdpr',
  sections: [
    {
      id: 'priv_intro',
      title: 'Quadro Normativo Privacy',
      type: 'lesson',
      content: `Il **Regolamento (UE) 2016/679 (GDPR)** e il **D.Lgs 196/2003** (Codice Privacy, aggiornato dal D.Lgs 101/2018) disciplinano il trattamento dei dati personali in Italia e in UE.

**🎯 Principi fondamentali (art. 5 GDPR):**
- **Liceità, correttezza e trasparenza**
- **Limitazione delle finalità** — dati raccolti per scopi determinati
- **Minimizzazione** — solo dati necessari
- **Esattezza** — dati aggiornati
- **Limitazione della conservazione** — tempi definiti
- **Integrità e riservatezza** — sicurezza adeguata
- **Responsabilizzazione (accountability)** — il titolare deve dimostrare la conformità

**👥 Soggetti:**
- **Titolare del trattamento**: decide finalità e mezzi
- **Responsabile**: tratta dati per conto del titolare (es. fornitore IT)
- **Incaricato/autorizzato**: dipendente che tratta dati su istruzione
- **DPO/RPD**: figura di controllo (obbligatorio in alcuni casi, art. 37)
- **Interessato**: la persona fisica cui si riferiscono i dati`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'priv_quiz_intro',
      title: 'Verifica: Principi Privacy',
      type: 'quiz',
      questions: [
        {
          id: 'priv_q1',
          question: 'Il principio di "minimizzazione" prevede che:',
          options: ['Si raccolgano più dati possibili', 'Si raccolgano solo i dati strettamente necessari alla finalità', 'I dati siano cancellati ogni mese', 'Non si raccolgano dati'],
          correctIndex: 1,
          explanation: 'La minimizzazione (art. 5.1.c GDPR) impone di trattare solo i dati adeguati, pertinenti e limitati a quanto necessario.',
          xpReward: 15, difficulty: 'easy',
        },
        {
          id: 'priv_q2',
          question: 'Chi decide finalità e mezzi del trattamento?',
          options: ['Il DPO', 'Il responsabile esterno', 'Il titolare del trattamento', 'Il Garante'],
          correctIndex: 2,
          explanation: 'Il titolare (art. 4.7 GDPR) determina finalità e mezzi ed è il primo responsabile della conformità.',
          xpReward: 15, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'priv_diritti',
      title: 'Diritti degli Interessati e Data Breach',
      type: 'lesson',
      content: `**📋 Diritti dell'interessato (artt. 15-22 GDPR):**
- Accesso, rettifica, cancellazione (oblio)
- Limitazione del trattamento e portabilità
- Opposizione e revoca del consenso
- Diritto a non essere sottoposto a decisioni automatizzate

**🚨 Data Breach (art. 33-34 GDPR):**
Una violazione di dati personali (perdita, accesso non autorizzato, distruzione) va:
1. **Notificata al Garante entro 72 ore** dalla conoscenza
2. **Comunicata agli interessati** se vi è rischio elevato per i loro diritti

**🔐 Misure di sicurezza obbligatorie (art. 32):**
- Pseudonimizzazione e cifratura
- Riservatezza, integrità, disponibilità dei sistemi
- Backup e procedure di ripristino
- Test periodici di efficacia

**⚖️ Sanzioni:**
Fino a **20 milioni di euro o 4% del fatturato mondiale annuo** (il maggiore).`,
      minTimeSeconds: 60, xpReward: 25,
    },
    {
      id: 'priv_quiz_2',
      title: 'Verifica: Data Breach e Diritti',
      type: 'quiz',
      questions: [
        {
          id: 'priv_q3',
          question: 'Entro quanto tempo va notificato un data breach al Garante?',
          options: ['24 ore', '72 ore', '7 giorni', '30 giorni'],
          correctIndex: 1,
          explanation: 'L\'art. 33 GDPR impone la notifica entro 72 ore dalla conoscenza della violazione, salvo improbabile rischio per i diritti delle persone.',
          xpReward: 20, difficulty: 'medium',
        },
        {
          id: 'priv_q4',
          question: 'La sanzione massima del GDPR è:',
          options: ['100.000 €', '1 milione di €', '20 milioni di € o 4% del fatturato', '50 milioni di €'],
          correctIndex: 2,
          explanation: 'Le sanzioni più gravi (art. 83.5) arrivano a 20 mln € o 4% del fatturato mondiale annuo, scegliendo l\'importo maggiore.',
          xpReward: 20, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'priv_boss',
      title: '🏆 Test Finale - Privacy & GDPR',
      type: 'boss_test',
      questions: [
        {
          id: 'priv_b1',
          question: 'Il consenso al trattamento deve essere:',
          options: ['Implicito', 'Libero, specifico, informato e inequivocabile', 'Solo verbale', 'Solo scritto'],
          correctIndex: 1,
          explanation: 'Art. 4.11 e 7 GDPR: il consenso deve essere libero, specifico, informato e manifestato con dichiarazione o azione positiva inequivocabile.',
          xpReward: 35, difficulty: 'medium',
        },
        {
          id: 'priv_b2',
          question: 'I dati relativi alla salute sono:',
          options: ['Dati comuni', 'Categorie particolari di dati (art. 9)', 'Dati anonimi', 'Dati pubblici'],
          correctIndex: 1,
          explanation: 'L\'art. 9 GDPR classifica i dati sanitari come "categorie particolari", il cui trattamento richiede basi giuridiche rafforzate.',
          xpReward: 35, difficulty: 'medium',
        },
        {
          id: 'priv_b3',
          question: 'Il DPO è obbligatorio quando:',
          options: ['Sempre', 'Mai', 'L\'attività core comporta monitoraggio sistematico su larga scala o tratta categorie particolari', 'Solo nel settore pubblico'],
          correctIndex: 2,
          explanation: 'Art. 37 GDPR: il DPO è obbligatorio per enti pubblici, per chi svolge monitoraggio sistematico su larga scala o tratta categorie particolari come attività principale.',
          xpReward: 40, difficulty: 'hard',
        },
        {
          id: 'priv_b4',
          question: 'Il diritto all\'oblio consente di:',
          options: ['Modificare i dati', 'Ottenere la cancellazione dei propri dati', 'Accedere ai dati', 'Trasferire i dati'],
          correctIndex: 1,
          explanation: 'Art. 17 GDPR (diritto alla cancellazione/oblio): l\'interessato può ottenere la cancellazione dei propri dati nei casi previsti.',
          xpReward: 35, difficulty: 'easy',
        },
      ],
      minTimeSeconds: 90, xpReward: 50,
    },
  ],
};
