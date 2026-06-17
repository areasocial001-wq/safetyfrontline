// Modulo Lavori in Quota e DPI 3ª Categoria - D.Lgs 81/08 Titolo IV Capo II
import type { ModuleContent } from './training-content';

export const lavoriQuotaContent: ModuleContent = {
  moduleId: 'lavori_quota',
  sections: [
    {
      id: 'lq_intro',
      title: 'Definizione e Obblighi',
      type: 'lesson',
      content: `**🏗️ Lavoro in quota (art. 107 D.Lgs 81/08):**
"Attività che espone il lavoratore al rischio di caduta da una **quota posta ad altezza superiore a 2 metri** rispetto a un piano stabile."

**📋 Gerarchia di scelta (art. 111):**
1. **Misure di protezione collettiva** (parapetti, reti anticaduta, ponteggi)
2. **Sistemi di accesso e posizionamento mediante funi**
3. **DPI individuali anticaduta** (solo se 1 e 2 non praticabili)

**⚠️ Statistiche INAIL:**
La caduta dall'alto è la **prima causa di infortunio mortale in edilizia** (oltre il 30% degli incidenti gravi).

**🎓 Formazione obbligatoria:**
- Lavori in quota generici: **8 ore** (4 teoria + 4 pratica)
- Sistemi di accesso e posizionamento mediante funi: **32 ore** + aggiornamento quadriennale 4 ore
- DPI 3ª categoria (anticaduta): formazione e **addestramento pratico obbligatorio** (art. 77 c.5)`,
      minTimeSeconds: 60, xpReward: 20,
    },
    {
      id: 'lq_quiz_1',
      title: 'Verifica: Soglia e Formazione',
      type: 'quiz',
      questions: [
        {
          id: 'lq_q1',
          question: 'Si definisce "lavoro in quota" quando l\'altezza supera:',
          options: ['1 metro', '1,5 metri', '2 metri', '3 metri'],
          correctIndex: 2,
          explanation: 'Art. 107 D.Lgs 81/08: il rischio di caduta è considerato a partire da 2 metri rispetto a un piano stabile.',
          xpReward: 15, difficulty: 'easy',
        },
        {
          id: 'lq_q2',
          question: 'L\'addestramento per i DPI di 3ª categoria è:',
          options: ['Facoltativo', 'Obbligatorio e documentato', 'Sostituibile da un video', 'Non previsto'],
          correctIndex: 1,
          explanation: 'Art. 77 c.5 D.Lgs 81/08: per i DPI di 3ª categoria (e gli otoprotettori) addestramento pratico documentato è obbligatorio.',
          xpReward: 15, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'lq_sistemi',
      title: 'Sistemi Anticaduta e DPI 3ª Categoria',
      type: 'lesson',
      content: `**🔧 Componenti di un sistema anticaduta:**
1. **Imbracatura** (EN 361) — unico DPI con punto di ancoraggio dorsale per arresto caduta
2. **Cordino con assorbitore di energia** (EN 354 + EN 355) — limita la forza di arresto < 6 kN
3. **Dispositivo retrattile** (EN 360) — blocco automatico in caso di caduta
4. **Ancoraggi** (EN 795) — fissi (classe A) o mobili (classe B/C/D)
5. **Connettori** (EN 362) — moschettoni con ghiera

**📏 Tirante d'aria:**
Lo spazio libero sotto i piedi del lavoratore deve essere sufficiente ad arrestare la caduta SENZA impatto:
- Allungamento cordino + assorbitore: ~1,75 m
- Altezza utente + margine: ~2 m
- **Tirante d'aria minimo: ~6 m** con cordino tradizionale (meno con retrattile)

**🚨 Effetto pendolo:**
Se il punto di ancoraggio non è verticale sopra l'operatore, una caduta provoca oscillazione pericolosa. Mantenere l'ancoraggio ALTO e in linea.

**⏱️ Sospensione inerte:**
Dopo una caduta, il lavoratore appeso può sviluppare **sindrome da sospensione** in 10-20 minuti. Servono procedure di **soccorso rapido** (max 15 minuti) e dispositivi di evacuazione.

**🔍 Controlli:**
- Verifica visiva prima di ogni uso
- Controllo periodico documentato da persona competente (almeno **annuale**)
- DPI scaduto o coinvolto in caduta → **fuori servizio immediato**`,
      minTimeSeconds: 60, xpReward: 25,
    },
    {
      id: 'lq_quiz_2',
      title: 'Verifica: Sistemi e Soccorso',
      type: 'quiz',
      questions: [
        {
          id: 'lq_q3',
          question: 'Il tempo massimo per il soccorso in sospensione inerte è:',
          options: ['1 ora', '30 minuti', '15 minuti', 'Indefinito'],
          correctIndex: 2,
          explanation: 'Per evitare la sindrome da sospensione, il soccorso deve avvenire entro 15-20 minuti dall\'arresto della caduta.',
          xpReward: 20, difficulty: 'hard',
        },
        {
          id: 'lq_q4',
          question: 'L\'unico punto d\'attacco corretto per l\'arresto caduta sull\'imbracatura è:',
          options: ['Cintura ventrale', 'Anelli laterali', 'Punto sternale o dorsale (EN 361)', 'Spallaccio'],
          correctIndex: 2,
          explanation: 'Solo i punti sternale (A/2 + A/2) o dorsale (A) certificati EN 361 sono ammessi per l\'arresto caduta.',
          xpReward: 20, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'lq_boss',
      title: '🏆 Test Finale - Lavori in Quota',
      type: 'boss_test',
      questions: [
        {
          id: 'lq_b1',
          question: 'La forza massima di arresto trasmessa dal cordino con assorbitore non deve superare:',
          options: ['2 kN', '6 kN', '10 kN', '20 kN'],
          correctIndex: 1,
          explanation: 'EN 355: l\'assorbitore di energia limita la forza di arresto a 6 kN, soglia di tollerabilità del corpo umano.',
          xpReward: 40, difficulty: 'hard',
        },
        {
          id: 'lq_b2',
          question: 'La gerarchia delle misure (art. 111) mette al primo posto:',
          options: ['I DPI individuali', 'I sistemi di protezione collettiva (parapetti, reti)', 'L\'uso di funi', 'La segnaletica'],
          correctIndex: 1,
          explanation: 'La protezione collettiva (parapetti, ponteggi, reti) ha priorità sull\'uso di DPI individuali.',
          xpReward: 35, difficulty: 'easy',
        },
        {
          id: 'lq_b3',
          question: 'Un cordino coinvolto in una caduta:',
          options: ['Si controlla e si riusa', 'Va messo fuori servizio immediatamente', 'Si lava e si conserva', 'Si trasferisce ad altro operatore'],
          correctIndex: 1,
          explanation: 'Qualsiasi DPI anticaduta che ha subito un arresto caduta va dismesso immediatamente: l\'assorbitore è esauribile.',
          xpReward: 40, difficulty: 'medium',
        },
        {
          id: 'lq_b4',
          question: 'La verifica periodica di un DPI anticaduta da parte di persona competente è almeno:',
          options: ['Mensile', 'Annuale', 'Triennale', 'Solo all\'acquisto'],
          correctIndex: 1,
          explanation: 'I DPI anticaduta vanno verificati periodicamente almeno ogni 12 mesi da persona competente, con registrazione documentata.',
          xpReward: 35, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90, xpReward: 50,
    },
  ],
};
