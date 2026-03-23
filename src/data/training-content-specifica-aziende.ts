// Formazione Specifica - Settore Aziende/Industria (Rischio Medio-Alto)
// ATECO: Manifattura, logistica, magazzino, produzione
// Conforme all'Accordo Stato-Regioni e D.Lgs 81/2008

import { ModuleContent } from './training-content';

export const specificaAziendeContent: ModuleContent = {
  moduleId: 'ls_aziende',
  sections: [
    {
      id: 'az_intro',
      title: 'Rischi Specifici nel Settore Aziendale/Industriale',
      type: 'lesson',
      content: `Il settore aziendale e industriale comprende attività manifatturiere, logistiche e produttive classificate a **rischio medio o alto** secondo i codici ATECO.

**⏱️ Durata formazione specifica:** 8 ore (medio) / 12 ore (alto)

**Principali categorie di rischio:**
- 🔧 **Rischio meccanico:** macchine utensili, organi in movimento, punti di schiacciamento
- ⚡ **Rischio elettrico:** impianti industriali, quadri elettrici, manutenzione
- 🧪 **Rischio chimico:** solventi, oli, polveri, fumi di saldatura
- 📦 **Movimentazione carichi:** manuale (NIOSH) e meccanica (carrelli elevatori)
- 🔊 **Rumore e vibrazioni:** macchinari, utensili pneumatici
- 🏗️ **Cadute dall'alto:** scaffalature, soppalchi, scale

**Obblighi specifici:**
- DVR con analisi per ogni mansione
- Formazione e addestramento su macchine specifiche
- DPI adeguati al rischio
- Segnaletica di sicurezza nelle aree operative`,
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'az_quiz_intro',
      title: 'Verifica: Rischi Aziendali',
      type: 'quiz',
      questions: [
        {
          id: 'az_q1',
          question: 'Un\'azienda manifatturiera è classificata generalmente come rischio:',
          options: ['Basso', 'Medio o Alto', 'Nullo', 'Dipende dal fatturato'],
          correctIndex: 1,
          explanation: 'Le attività manifatturiere e industriali sono classificate come rischio medio o alto in base al codice ATECO specifico.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'az_q2',
          question: 'Il DVR di un\'azienda deve contenere:',
          options: ['Solo i rischi chimici', 'L\'analisi dei rischi per ogni mansione', 'Solo l\'elenco dei DPI', 'Solo le procedure di emergenza'],
          correctIndex: 1,
          explanation: 'Il DVR deve contenere la valutazione di tutti i rischi per ogni mansione, le misure di prevenzione, i DPI e le procedure operative.',
          xpReward: 15,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'az_meccanico',
      title: 'Rischio Meccanico e Macchine',
      type: 'lesson',
      content: `Le macchine rappresentano una delle principali fonti di infortunio in ambito industriale.

**⚙️ Pericoli delle macchine:**
- **Schiacciamento:** tra organi in movimento o tra macchina e struttura fissa
- **Cesoiamento:** lame, rulli controrotanti, ingranaggi
- **Trascinamento:** parti rotanti, nastri trasportatori, mandrini
- **Proiezione:** schegge, trucioli, frammenti
- **Urto:** bracci meccanici, sportelli automatici

**🛡️ Protezioni obbligatorie (D.Lgs 81/08 Titolo III):**
- Ripari fissi e mobili con interblocco
- Barriere fotoelettriche e sensori di prossimità
- Comandi a due mani (prevengono intrappolamento)
- Dispositivi di arresto di emergenza (fungo rosso)
- Cartelli di avvertimento e divieto

**🔒 Procedura LOTO (Lockout/Tagout):**
1. Comunicare l'intervento a tutto il personale
2. Spegnere la macchina con i comandi normali
3. Isolare TUTTE le fonti di energia (elettrica, pneumatica, idraulica)
4. Applicare lucchetto personale + cartellino identificativo
5. Verificare l'assenza di energia residua
6. Eseguire la manutenzione
7. Rimuovere il lucchetto SOLO da chi l'ha applicato`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'az_interactive_meccanico',
      title: '🎮 Sicurezza Macchine',
      type: 'interactive',
      content: 'Identifica le misure di sicurezza corrette per le macchine.',
      questions: [
        {
          id: 'az_int1',
          question: 'Un operaio deve fare manutenzione a un nastro trasportatore. Qual è la prima azione?',
          options: ['Iniziare subito il lavoro', 'Applicare la procedura LOTO', 'Chiedere a un collega di sorvegliare', 'Abbassare la velocità del nastro'],
          correctIndex: 1,
          explanation: 'Prima di qualsiasi intervento di manutenzione è obbligatorio applicare la procedura LOTO: isolare tutte le fonti di energia e applicare il lucchetto personale.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'az_int2',
          question: 'Il riparo mobile con interblocco serve a:',
          options: ['Decorare la macchina', 'Fermare la macchina quando il riparo viene aperto', 'Rallentare la produzione', 'Proteggere la macchina dalla polvere'],
          correctIndex: 1,
          explanation: 'Il riparo con interblocco è collegato a un interruttore che arresta la macchina quando il riparo viene aperto, impedendo l\'accesso a organi in movimento.',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'az_int3',
          question: 'Chi può rimuovere il lucchetto LOTO?',
          options: ['Il capoturno', 'Solo chi l\'ha applicato', 'Qualsiasi collega', 'Il responsabile sicurezza'],
          correctIndex: 1,
          explanation: 'Il lucchetto LOTO può essere rimosso SOLO dal lavoratore che l\'ha applicato. Questa regola è fondamentale per prevenire avviamenti accidentali durante la manutenzione.',
          xpReward: 25,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'az_movimentazione',
      title: 'Movimentazione Carichi e Carrello Elevatore',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Roberto', role: 'Capo Magazzino', text: 'Il carrello elevatore è la causa numero uno di incidenti gravi in magazzino. Servono patentino, cintura di sicurezza e rispetto delle velocità. Mai dare passaggi sulle forche a nessuno!' },
        { speaker: 'Luca', role: 'Addetto Logistica', text: 'Per il sollevamento manuale, la regola d\'oro è: schiena dritta, gambe piegate, carico vicino al corpo. Il limite NIOSH per maschi adulti è 25 kg in condizioni ideali, ma va sempre ricalcolato con l\'indice di rischio.' },
        { speaker: 'Dott. Rossi', role: 'Medico Competente', text: 'Il 30% delle malattie professionali nel settore è legato alla movimentazione carichi: ernie discali, lombalgie, lesioni muscolari. La prevenzione passa dalla formazione e dalla meccanizzazione.' },
        { speaker: 'Ing. Verdi', role: 'RSPP', text: 'Le scaffalature devono avere protezioni antiurto alla base, essere ancorate al muro e avere cartelli con portata massima per ripiano. I corridoi per i muletti devono essere larghi almeno 3,5 metri per il doppio senso.' },
      ],
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'az_chimico',
      title: 'Rischio Chimico e DPI',
      type: 'lesson',
      content: `**🧪 Rischio Chimico in Azienda**
Molte attività industriali espongono a sostanze pericolose:

**Classificazione CLP (pittogrammi GHS):**
- 💀 **Tossico/Mortale:** solventi organici, metalli pesanti
- 🔥 **Infiammabile:** acetone, diluenti, vernici
- ⚠️ **Irritante/Nocivo:** detergenti industriali, polveri
- 🌊 **Pericoloso per l'ambiente:** oli esausti, solventi
- 💥 **Comburente/Esplosivo:** perossidi, polveri metalliche

**📋 Scheda Dati di Sicurezza (SDS):**
Ogni sostanza chimica deve avere la SDS disponibile e accessibile. Contiene:
- Identificazione pericoli (sezione 2)
- Misure di primo soccorso (sezione 4)
- Misure antincendio (sezione 5)
- DPI richiesti (sezione 8)

**🛡️ DPI per Rischio Chimico:**
| Rischio | DPI |
|---------|-----|
| Schizzi | Occhiali a tenuta, guanti chimici |
| Vapori | Maschera con filtri specifici (A, B, E, K) |
| Polveri | FFP2/FFP3 |
| Contatto pelle | Tuta in Tyvek, grembiule chimico |
| Sversamento | Stivali in PVC, kit assorbente |`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'az_quiz_chimico',
      title: 'Verifica: Rischio Chimico e Movimentazione',
      type: 'quiz',
      questions: [
        {
          id: 'az_q3',
          question: 'Il limite NIOSH per il sollevamento manuale in condizioni ideali è:',
          options: ['15 kg', '25 kg', '30 kg', '50 kg'],
          correctIndex: 1,
          explanation: 'Il limite NIOSH per maschi adulti in condizioni ideali è 25 kg (15 kg per le donne). Va sempre ricalcolato con i fattori correttivi.',
          xpReward: 15,
          difficulty: 'medium',
        },
        {
          id: 'az_q4',
          question: 'La Scheda Dati di Sicurezza (SDS) deve essere:',
          options: ['Conservata solo in direzione', 'Disponibile e accessibile a tutti i lavoratori esposti', 'Inviata solo all\'INAIL', 'Consultabile solo dal medico'],
          correctIndex: 1,
          explanation: 'La SDS deve essere disponibile e facilmente accessibile a tutti i lavoratori che utilizzano o possono venire in contatto con la sostanza pericolosa.',
          xpReward: 15,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'az_emergenze',
      title: 'Emergenze nel Settore Industriale',
      type: 'lesson',
      content: `**🚨 Procedure di Emergenza Specifiche**

**Sversamento chimico:**
1. Allontanare il personale dall'area
2. Indossare DPI adeguati (consultare SDS)
3. Contenere lo sversamento con materiale assorbente
4. NON utilizzare acqua su sostanze reattive
5. Ventilare l'area, segnalare e bonificare

**Incendio in area produttiva:**
1. Attivare allarme e allontanare il personale
2. Se possibile, isolare le fonti di energia (LOTO d'emergenza)
3. Utilizzare estintore adeguato alla classe di fuoco
4. NON usare acqua su incendi elettrici o di metalli

**Infortunio con macchine:**
1. Premere il FUNGO ROSSO di emergenza
2. NON rimuovere l'infortunato dalla macchina (rischio aggravamento)
3. Chiamare il 112 e l'addetto primo soccorso
4. Prestare solo le cure di primo soccorso di competenza

**📋 Regola fondamentale:** 
Non improvvisare! Segui SEMPRE le procedure scritte nel Piano di Emergenza aziendale. Partecipa alle esercitazioni e conosci i ruoli degli addetti.`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'az_boss_test',
      title: '🏆 Test Finale - Formazione Specifica Aziende',
      type: 'boss_test',
      questions: [
        {
          id: 'az_boss1',
          question: 'La procedura LOTO prevede come primo passo:',
          options: ['Applicare il lucchetto', 'Comunicare l\'intervento al personale', 'Verificare l\'assenza di energia', 'Iniziare la manutenzione'],
          correctIndex: 1,
          explanation: 'Il primo passo della procedura LOTO è comunicare a tutto il personale che verrà eseguito un intervento di manutenzione sulla macchina.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'az_boss2',
          question: 'Il patentino per il carrello elevatore è:',
          options: ['Facoltativo', 'Obbligatorio con formazione e addestramento pratico', 'Necessario solo per i muletti a gas', 'Rilasciato dalla Motorizzazione'],
          correctIndex: 1,
          explanation: 'L\'Accordo Stato-Regioni prevede formazione obbligatoria (teoria + pratica) per tutti gli operatori di carrelli elevatori, con rinnovo quinquennale.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'az_boss3',
          question: 'In caso di sversamento chimico, la prima azione è:',
          options: ['Pulire con acqua', 'Allontanare il personale dall\'area', 'Chiamare il datore di lavoro', 'Continuare a lavorare'],
          correctIndex: 1,
          explanation: 'La priorità assoluta è la sicurezza delle persone: allontanare il personale dall\'area contaminata prima di qualsiasi altra azione.',
          xpReward: 35,
          difficulty: 'easy',
        },
        {
          id: 'az_boss4',
          question: 'I filtri delle maschere per vapori organici sono di tipo:',
          options: ['P1', 'A (marrone)', 'K (verde)', 'B (grigio)'],
          correctIndex: 1,
          explanation: 'I filtri di tipo A (colore marrone) sono specifici per vapori organici (solventi, diluenti, vernici). Il tipo corretto dipende dalla sostanza indicata nella SDS.',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'az_boss5',
          question: 'Le scaffalature industriali devono avere:',
          options: ['Solo il cartello con il nome dell\'azienda', 'Protezioni antiurto, ancoraggio e cartelli portata massima', 'Solo le protezioni antiurto', 'Nessun requisito specifico'],
          correctIndex: 1,
          explanation: 'Le scaffalature devono avere protezioni antiurto alla base, essere ancorate alla struttura, e riportare i cartelli con la portata massima per ripiano.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'az_boss6',
          question: 'In caso di infortunio con una macchina, è corretto:',
          options: ['Estrarre subito l\'infortunato', 'Premere l\'arresto di emergenza e NON muovere l\'infortunato', 'Riavviare la macchina per liberarlo', 'Aspettare il capoturno'],
          correctIndex: 1,
          explanation: 'Si deve premere il fungo rosso di emergenza, NON muovere l\'infortunato dalla macchina (rischio di aggravamento) e chiamare immediatamente il 112.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
