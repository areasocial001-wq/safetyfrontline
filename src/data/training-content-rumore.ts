// Modulo Rischio Rumore - D.Lgs 81/08 Titolo VIII Capo II + UNI EN ISO 9612
import type { ModuleContent } from './training-content';

export const rischioRumoreContent: ModuleContent = {
  moduleId: 'rischio_rumore',
  sections: [
    {
      id: 'rum_intro',
      title: 'Il Rumore come Agente Fisico',
      type: 'lesson',
      content: `Il **rumore** è regolato dal **D.Lgs 81/08 Titolo VIII Capo II (artt. 187-198)**. È uno degli agenti fisici più diffusi negli ambienti di lavoro e può causare danni uditivi irreversibili (**ipoacusia da rumore**), oltre ad effetti extra-uditivi (stress, ipertensione, disturbi del sonno).

**🔊 Grandezze fondamentali:**
- **L<sub>EX,8h</sub>**: livello di esposizione personale giornaliero (riferito a 8 ore)
- **L<sub>peak</sub>** (C): pressione acustica di picco
- Unità di misura: **dB(A)** per il livello continuo, **dB(C)** per il picco

**⚠️ Valori di azione e limiti (art. 189):**
| Soglia | L<sub>EX,8h</sub> | L<sub>peak</sub> |
|---|---|---|
| Valore inferiore d'azione | 80 dB(A) | 135 dB(C) |
| Valore superiore d'azione | 85 dB(A) | 137 dB(C) |
| Valore limite di esposizione | 87 dB(A) | 140 dB(C) |

**📐 Valutazione:**
La misurazione fonometrica segue la norma **UNI EN ISO 9612:2011** e deve essere ripetuta almeno ogni **4 anni** o ad ogni modifica significativa.`,
      minTimeSeconds: 60, xpReward: 20,
    },
    {
      id: 'rum_quiz_1',
      title: 'Verifica: Valori di Azione',
      type: 'quiz',
      questions: [
        {
          id: 'rum_q1',
          question: 'Il valore superiore di azione per L_EX,8h è:',
          options: ['80 dB(A)', '85 dB(A)', '87 dB(A)', '90 dB(A)'],
          correctIndex: 1,
          explanation: 'Art. 189 D.Lgs 81/08: il valore superiore di azione è 85 dB(A); il valore limite di esposizione è 87 dB(A).',
          xpReward: 15, difficulty: 'medium',
        },
        {
          id: 'rum_q2',
          question: 'La valutazione del rumore va aggiornata almeno ogni:',
          options: ['1 anno', '2 anni', '4 anni', '10 anni'],
          correctIndex: 2,
          explanation: 'Art. 181 D.Lgs 81/08: la valutazione degli agenti fisici va aggiornata almeno ogni 4 anni o al variare delle condizioni.',
          xpReward: 15, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'rum_misure',
      title: 'Misure di Prevenzione e DPI Uditivi',
      type: 'lesson',
      content: `**🛡️ Gerarchia delle misure (art. 192):**
1. **Eliminazione alla fonte** (sostituzione macchine/processi)
2. **Misure tecniche** (incapsulamento, schermi acustici, manutenzione)
3. **Misure organizzative** (rotazione, riduzione tempi di esposizione, aree segregate)
4. **DPI uditivi** (solo come ultima difesa)

**📋 Obblighi al superamento dei valori d'azione:**
| Soglia | Obblighi |
|---|---|
| **> 80 dB(A)** | Informazione e formazione, DPI a disposizione, sorveglianza sanitaria su richiesta |
| **> 85 dB(A)** | DPI obbligatori, sorveglianza sanitaria, piano di riduzione, segnaletica aree |
| **> 87 dB(A)** | Limite NON superabile (considerando l'attenuazione DPI) |

**🎧 DPI uditivi (UNI EN 458):**
- **Inserti auricolari (tappi)** — SNR 15-30 dB
- **Cuffie** — SNR 25-35 dB, ideali per esposizioni intermittenti
- **Otoprotettori attivi** — comunicazione + attenuazione

L'attenuazione effettiva si calcola con il metodo **SNR/HML/Ottava**. Va verificata l'idoneità individuale e la compatibilità con altri DPI (casco, occhiali).

**🩺 Sorveglianza sanitaria:**
- Visita preventiva + audiometria
- Periodicità: almeno **biennale** sopra 85 dB(A), **quinquennale** tra 80-85 dB(A)`,
      minTimeSeconds: 60, xpReward: 25,
    },
    {
      id: 'rum_quiz_2',
      title: 'Verifica: DPI e Sorveglianza',
      type: 'quiz',
      questions: [
        {
          id: 'rum_q3',
          question: 'I DPI uditivi sono obbligatori quando si supera:',
          options: ['80 dB(A)', '85 dB(A)', '87 dB(A)', '90 dB(A)'],
          correctIndex: 1,
          explanation: 'Sopra il valore superiore di azione (85 dB(A)) i DPI sono obbligatori, oltre alla sorveglianza sanitaria e al piano di riduzione.',
          xpReward: 20, difficulty: 'medium',
        },
        {
          id: 'rum_q4',
          question: 'L\'audiometria periodica per esposti >85 dB(A) è:',
          options: ['Annuale', 'Biennale', 'Quinquennale', 'A richiesta'],
          correctIndex: 1,
          explanation: 'La periodicità della sorveglianza sanitaria audiologica è almeno biennale sopra 85 dB(A), quinquennale tra 80 e 85 dB(A).',
          xpReward: 20, difficulty: 'hard',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'rum_boss',
      title: '🏆 Test Finale - Rischio Rumore',
      type: 'boss_test',
      questions: [
        {
          id: 'rum_b1',
          question: 'L_EX,8h è:',
          options: ['Il picco di pressione', 'Il livello di esposizione giornaliero ponderato su 8 ore', 'La frequenza dominante', 'L\'attenuazione DPI'],
          correctIndex: 1,
          explanation: 'L_EX,8h è il livello di esposizione personale al rumore riferito a una giornata lavorativa di 8 ore, espresso in dB(A).',
          xpReward: 35, difficulty: 'medium',
        },
        {
          id: 'rum_b2',
          question: 'La gerarchia delle misure di prevenzione mette al primo posto:',
          options: ['I DPI', 'L\'eliminazione/riduzione alla fonte', 'La formazione', 'La sorveglianza sanitaria'],
          correctIndex: 1,
          explanation: 'Le misure collettive e l\'intervento alla fonte hanno priorità sui DPI, che sono l\'ultima linea di difesa.',
          xpReward: 35, difficulty: 'easy',
        },
        {
          id: 'rum_b3',
          question: 'Il valore limite di esposizione di 87 dB(A):',
          options: ['Si misura senza DPI', 'Considera l\'attenuazione dei DPI indossati', 'È uguale al valore di azione', 'Non esiste'],
          correctIndex: 1,
          explanation: 'Il valore limite di 87 dB(A) tiene conto dell\'attenuazione fornita dai DPI uditivi effettivamente indossati.',
          xpReward: 40, difficulty: 'hard',
        },
        {
          id: 'rum_b4',
          question: 'La norma tecnica per la misurazione del rumore è:',
          options: ['UNI EN ISO 9612', 'UNI EN 397', 'ISO 14001', 'UNI 11697'],
          correctIndex: 0,
          explanation: 'La UNI EN ISO 9612:2011 specifica metodi e strategie per la misurazione dell\'esposizione personale al rumore.',
          xpReward: 35, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90, xpReward: 50,
    },
  ],
};
