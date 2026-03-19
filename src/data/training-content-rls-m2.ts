import { ModuleContent } from './training-content';

export const moduloRLS2Content: ModuleContent = {
  moduleId: 'rls_rischi_valutazione',
  sections: [
    {
      id: 'rls2_rischi',
      title: 'Tipologie di Rischi sul Lavoro',
      type: 'lesson',
      content: `Il RLS deve conoscere le principali tipologie di rischio per poter svolgere efficacemente il proprio ruolo di rappresentanza.

**🔴 Rischi per la Sicurezza:**
- Cadute dall'alto e in piano
- Rischi meccanici (macchine, attrezzature)
- Rischi elettrici
- Incendio e esplosione
- Investimento da veicoli

**🟡 Rischi per la Salute:**
- **Agenti chimici:** polveri, fumi, vapori, solventi
- **Agenti fisici:** rumore, vibrazioni, radiazioni, microclima
- **Agenti biologici:** virus, batteri, funghi
- **Ergonomia:** posture incongrue, movimentazione manuale carichi, VDT

**🔵 Rischi Psicosociali:**
- Stress lavoro-correlato
- Burnout e mobbing
- Lavoro notturno e a turni
- Carico di lavoro eccessivo

**📊 Il RLS e la Lettura del DVR:**
Il RLS deve saper leggere e interpretare il DVR per verificare che tutti i rischi siano stati identificati e che le misure adottate siano adeguate. Attenzione a:
- Completezza della valutazione
- Adeguatezza delle misure
- Coerenza con la realtà lavorativa
- Aggiornamento rispetto ai cambiamenti`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'rls2_quiz_rischi',
      title: 'Verifica: Tipologie di Rischi',
      type: 'quiz',
      questions: [
        {
          id: 'rls2_q1',
          question: 'Lo stress lavoro-correlato è classificato come:',
          options: ['Rischio per la sicurezza', 'Rischio per la salute', 'Rischio psicosociale/trasversale', 'Non è un rischio normato'],
          correctIndex: 2,
          explanation: 'Lo stress lavoro-correlato è un rischio psicosociale/trasversale. La sua valutazione è obbligatoria per tutte le aziende dal 2011.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rls2_q2',
          question: 'Il RLS può consultare il DVR:',
          options: ['Solo con autorizzazione scritta del DL', 'Esclusivamente in azienda', 'Portandolo a casa per studiarlo', 'Solo durante la riunione periodica'],
          correctIndex: 1,
          explanation: 'Il RLS riceve copia del DVR ma può consultarlo esclusivamente in azienda, rispettando il segreto industriale (art. 50, comma 5).',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rls2_sorveglianza',
      title: 'Sorveglianza Sanitaria e MC',
      type: 'lesson',
      content: `Il RLS deve conoscere il sistema di sorveglianza sanitaria per tutelare i lavoratori.

**🏥 Il Medico Competente (MC):**
- Nominato dal DL quando prevista la sorveglianza sanitaria
- Collabora alla valutazione dei rischi
- Effettua le visite mediche (preventive, periodiche, su richiesta)
- Esprime giudizi di idoneità alla mansione

**📋 Giudizi di idoneità:**
- **Idoneo:** può svolgere la mansione senza limitazioni
- **Idoneo con prescrizioni:** può lavorare con limitazioni specifiche
- **Idoneo con limitazioni:** temporanee o permanenti
- **Non idoneo:** temporaneo o permanente alla mansione

**🔍 Ruolo del RLS nella sorveglianza sanitaria:**
- Può richiedere al MC informazioni aggregate (anonime)
- Verifica che le visite siano effettuate nei tempi previsti
- Segnala situazioni che possono richiedere visite anticipate
- Partecipa alla definizione del protocollo sanitario in riunione periodica

**⚠️ Il lavoratore può:**
- Richiedere la visita medica quando ritiene di avere problemi di salute correlati al lavoro
- Fare ricorso contro il giudizio del MC all'organo di vigilanza entro 30 giorni`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rls2_interactive',
      title: '🎮 Analisi del DVR',
      type: 'interactive',
      content: 'Mettiti nei panni del RLS e analizza questi scenari relativi alla valutazione dei rischi.',
      questions: [
        {
          id: 'rls2_int1',
          question: 'Consultando il DVR noti che il rischio rumore non è stato valutato, nonostante in reparto ci siano macchinari rumorosi. Cosa fai?',
          options: ['Non è un mio compito', 'Segnalo formalmente al DL la carenza nella valutazione', 'Compro io i tappi per le orecchie ai colleghi', 'Aspetto la prossima riunione periodica'],
          correctIndex: 1,
          explanation: 'Il RLS deve segnalare formalmente le carenze nella valutazione dei rischi. La mancata valutazione del rumore è una violazione dell\'art. 190.',
          xpReward: 25,
          difficulty: 'medium',
        },
        {
          id: 'rls2_int2',
          question: 'Un collega ti dice che il MC lo ha dichiarato "non idoneo temporaneo" ma non sa cosa fare. Come lo consigli?',
          options: ['Di andare dal medico di base', 'Di informarlo che può fare ricorso all\'organo di vigilanza entro 30 giorni e che il DL deve adibirlo ad altra mansione', 'Di licenziarsi', 'Di ignorare il giudizio e continuare a lavorare'],
          correctIndex: 1,
          explanation: 'Il lavoratore può fare ricorso contro il giudizio del MC entro 30 giorni. Nel frattempo, il DL deve adibirlo a mansioni compatibili.',
          xpReward: 30,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 20,
    },
    {
      id: 'rls2_boss_test',
      title: '🏆 Test Finale - Rischi e Valutazione',
      type: 'boss_test',
      questions: [
        {
          id: 'rls2_boss1',
          question: 'Il giudizio "idoneo con prescrizioni" significa che il lavoratore:',
          options: ['Non può lavorare', 'Può lavorare solo con specifiche limitazioni o condizioni', 'Può lavorare senza limitazioni', 'Deve cambiare mansione'],
          correctIndex: 1,
          explanation: 'L\'idoneità con prescrizioni consente al lavoratore di svolgere la mansione ma con specifiche limitazioni (es. non sollevare carichi >10kg, pause aggiuntive).',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rls2_boss2',
          question: 'Il termine per fare ricorso contro il giudizio del MC è:',
          options: ['10 giorni', '30 giorni', '60 giorni', '90 giorni'],
          correctIndex: 1,
          explanation: 'Il ricorso contro il giudizio del Medico Competente va presentato all\'organo di vigilanza (ASL) entro 30 giorni dalla comunicazione del giudizio.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'rls2_boss3',
          question: 'La valutazione dello stress lavoro-correlato è:',
          options: ['Facoltativa', 'Obbligatoria solo per aziende >50 dipendenti', 'Obbligatoria per tutte le aziende', 'Obbligatoria solo per il settore sanitario'],
          correctIndex: 2,
          explanation: 'La valutazione dello stress lavoro-correlato è obbligatoria per tutte le aziende, indipendentemente dalla dimensione (art. 28, comma 1-bis).',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'rls2_boss4',
          question: 'Il RLS nota che le visite mediche periodiche non vengono effettuate da oltre un anno. Deve:',
          options: ['Non fare nulla, è compito del MC', 'Segnalare al DL e, se necessario, all\'organo di vigilanza', 'Organizzare le visite autonomamente', 'Parlarne solo in riunione periodica'],
          correctIndex: 1,
          explanation: 'Il RLS deve segnalare al DL la mancata effettuazione delle visite mediche. Se il DL non provvede, può rivolgersi all\'organo di vigilanza (art. 50, comma 1, lett. o).',
          xpReward: 35,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
