// Modulo PEI PES PAV - Lavori Elettrici secondo CEI 11-27 e CEI EN 50110-1
import type { ModuleContent } from './training-content';

export const peiPesPavContent: ModuleContent = {
  moduleId: 'pei_pes_pav',
  sections: [
    {
      id: 'pei_intro',
      title: 'Le Figure PES, PAV, PEI',
      type: 'lesson',
      content: `Lavorare su impianti elettrici richiede competenze formalmente attribuite secondo la **Norma CEI 11-27:2021** e la **CEI EN 50110-1**.

**👷 Le tre figure principali:**

| Sigla | Definizione | Attività ammesse |
|---|---|---|
| **PES** | Persona Esperta | Lavori elettrici di qualsiasi tipologia, su impianti in BT e AT |
| **PAV** | Persona Avvertita | Lavori elettrici **sotto la supervisione di un PES** |
| **PEI** | Persona Idonea | Solo PES o PAV che, tramite ulteriore formazione/addestramento, è abilitata a **lavori sotto tensione (BT)** |

**📋 Chi nomina:**
Il **Datore di Lavoro** rilascia per iscritto la qualifica PES/PAV/PEI dopo:
1. Verifica della formazione (corso CEI 11-27 livello 1A+1B per PES/PAV, 2A+2B per PEI)
2. Verifica dell'esperienza pratica
3. Idoneità psico-fisica (sorveglianza sanitaria)

**⚡ Tipologie di lavoro elettrico (CEI EN 50110):**
- **Fuori tensione** — l'impianto è scollegato e messo in sicurezza (regola dei 5 punti)
- **In prossimità** — vicino a parti attive (zona prossima DV)
- **Sotto tensione** — su parti attive accessibili (solo PEI con DPI specifici)`,
      minTimeSeconds: 60, xpReward: 20,
    },
    {
      id: 'pei_quiz_1',
      title: 'Verifica: Ruoli e Qualifiche',
      type: 'quiz',
      questions: [
        {
          id: 'pei_q1',
          question: 'Chi può eseguire lavori SOTTO TENSIONE in BT?',
          options: ['Solo PES', 'Solo PAV', 'Solo PEI', 'Qualunque elettricista'],
          correctIndex: 2,
          explanation: 'Solo la Persona Idonea (PEI), formalmente nominata dal Datore di Lavoro, può eseguire lavori sotto tensione in bassa tensione.',
          xpReward: 15, difficulty: 'medium',
        },
        {
          id: 'pei_q2',
          question: 'La PAV può lavorare da sola su impianti elettrici?',
          options: ['Sì, sempre', 'Solo sotto supervisione di un PES', 'Solo in alta tensione', 'Solo su impianti domestici'],
          correctIndex: 1,
          explanation: 'La Persona Avvertita opera con limitazioni e sempre sotto la supervisione del Preposto ai Lavori (di norma un PES).',
          xpReward: 15, difficulty: 'easy',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'pei_5regole',
      title: 'Le 5 Regole d\'Oro e DPI Elettrici',
      type: 'lesson',
      content: `**🔐 Le 5 Regole d'Oro (CEI EN 50110-1) — per lavori fuori tensione:**

1. **SEZIONARE** — aprire l'interruttore di sezionamento a monte
2. **BLOCCARE** — applicare lucchetti e cartelli (procedura **LOTO** — Lockout/Tagout)
3. **VERIFICARE** assenza di tensione con strumento idoneo (verificato prima e dopo)
4. **MESSA A TERRA E IN CORTOCIRCUITO** (obbligatoria in MT/AT, raccomandata in BT)
5. **DELIMITARE** e segnalare la zona di lavoro

**🛡️ DPI per lavori elettrici (3ª categoria — art. 77):**
- **Guanti isolanti** (CEI EN 60903) — classe in base alla tensione (00-4)
- **Calzature isolanti** o tappeti dielettrici (EN 61111)
- **Casco isolante** (EN 50365)
- **Visiera anti-arco** (EN 166 + EN 170)
- **Indumenti antifiamma** anti-arco elettrico (EN 61482)
- **Attrezzi isolati** 1000 V (EN 60900)

**⚠️ Zone di lavoro (CEI 11-27):**
- **DL** (distanza di lavoro sotto tensione) — accesso solo con DPI
- **DV** (zona prossima) — accesso con misure aggiuntive
- Oltre DV: zona libera

**📅 Aggiornamento formazione:**
Il corso CEI 11-27 deve essere **aggiornato ogni 5 anni** (raccomandazione CEI). La nomina PES/PAV/PEI deve essere riconfermata periodicamente dal DL.`,
      minTimeSeconds: 60, xpReward: 25,
    },
    {
      id: 'pei_quiz_2',
      title: 'Verifica: 5 Regole e DPI',
      type: 'quiz',
      questions: [
        {
          id: 'pei_q3',
          question: 'Quale è la SECONDA delle 5 regole d\'oro?',
          options: ['Verificare assenza di tensione', 'Bloccare in posizione aperta (LOTO)', 'Messa a terra', 'Delimitare la zona'],
          correctIndex: 1,
          explanation: 'Ordine: 1) Sezionare, 2) Bloccare/LOTO, 3) Verificare assenza tensione, 4) Messa a terra/CC, 5) Delimitare.',
          xpReward: 20, difficulty: 'medium',
        },
        {
          id: 'pei_q4',
          question: 'I guanti isolanti per lavori elettrici seguono la norma:',
          options: ['EN 388', 'CEI EN 60903', 'EN 374', 'EN 511'],
          correctIndex: 1,
          explanation: 'CEI EN 60903 classifica i guanti dielettrici per classe di tensione (00, 0, 1, 2, 3, 4) e li impone come DPI di 3ª categoria.',
          xpReward: 20, difficulty: 'hard',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'pei_boss',
      title: '🏆 Test Finale - PES PAV PEI',
      type: 'boss_test',
      questions: [
        {
          id: 'pei_b1',
          question: 'L\'attribuzione formale della qualifica PES/PAV/PEI spetta a:',
          options: ['L\'RSPP', 'Il medico competente', 'Il Datore di Lavoro', 'Il preposto'],
          correctIndex: 2,
          explanation: 'Il Datore di Lavoro nomina per iscritto le figure PES/PAV/PEI dopo valutazione di formazione, esperienza e idoneità.',
          xpReward: 40, difficulty: 'medium',
        },
        {
          id: 'pei_b2',
          question: 'La verifica di assenza di tensione si effettua:',
          options: ['Solo prima del lavoro', 'Solo dopo', 'Prima E dopo, con strumento verificato', 'Solo se richiesto'],
          correctIndex: 2,
          explanation: 'Lo strumento di misura va testato prima e dopo l\'uso su una fonte nota, per garantire l\'affidabilità della verifica.',
          xpReward: 40, difficulty: 'hard',
        },
        {
          id: 'pei_b3',
          question: 'I lavori "fuori tensione" sono quelli su:',
          options: ['Parti attive scoperte', 'Impianto sezionato, bloccato e messo a terra', 'Parti vicine a conduttori in tensione', 'Quadri in bassa tensione'],
          correctIndex: 1,
          explanation: 'Un lavoro fuori tensione richiede tutte le 5 regole d\'oro applicate: sezionamento, blocco, verifica, MT/CC, delimitazione.',
          xpReward: 35, difficulty: 'medium',
        },
        {
          id: 'pei_b4',
          question: 'La formazione CEI 11-27 va aggiornata ogni:',
          options: ['1 anno', '3 anni', '5 anni', 'Mai'],
          correctIndex: 2,
          explanation: 'L\'aggiornamento raccomandato della CEI 11-27 è quinquennale, in coerenza con le norme tecniche internazionali.',
          xpReward: 35, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90, xpReward: 50,
    },
  ],
};
