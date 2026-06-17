// Modulo Addetto Segnaletica Stradale - D.I. 22 gennaio 2019 (art. 161 D.Lgs 81/08)
import type { ModuleContent } from './training-content';

export const segnaleticaStradaleContent: ModuleContent = {
  moduleId: 'segnaletica_stradale',
  sections: [
    {
      id: 'seg_intro',
      title: 'Cantieri Stradali e Quadro Normativo',
      type: 'lesson',
      content: `Il lavoro sulle strade con traffico veicolare in transito è uno dei più pericolosi: ogni anno in Italia decine di operatori vengono investiti durante installazione/rimozione di segnaletica temporanea.

**📜 Normativa di riferimento:**
- **D.Lgs 81/08 art. 161** — segnaletica di sicurezza e salute
- **Codice della Strada (D.Lgs 285/92) artt. 21 e 38** — segnaletica temporanea
- **D.M. Trasporti 10 luglio 2002** — Disciplinare tecnico cantieri stradali
- **D.I. 22 gennaio 2019** — formazione obbligatoria per gli addetti

**🎓 Formazione obbligatoria (D.I. 22/01/2019):**
| Tipologia | Durata |
|---|---|
| Corso base addetti | **8 ore** (4 teoria + 4 pratica) |
| Corso preposti | **12 ore** |
| Aggiornamento (sia addetti che preposti) | **3 ore ogni 4 anni** |

Senza attestato l'operatore NON può operare sulle strade aperte al traffico.

**⚠️ Rischi principali:**
- **Investimento** da veicoli in transito (rischio mortale)
- Caduta in piano, urti, MMC
- Esposizione a polveri, fumi di scarico
- Lavoro notturno e in condizioni meteo avverse`,
      minTimeSeconds: 60, xpReward: 20,
    },
    {
      id: 'seg_quiz_1',
      title: 'Verifica: Formazione',
      type: 'quiz',
      questions: [
        {
          id: 'seg_q1',
          question: 'La durata del corso base per addetti alla segnaletica stradale è:',
          options: ['4 ore', '8 ore', '16 ore', '32 ore'],
          correctIndex: 1,
          explanation: 'D.I. 22/01/2019: corso base 8 ore (4 teoria + 4 pratica). I preposti 12 ore. Aggiornamento 3 ore ogni 4 anni.',
          xpReward: 15, difficulty: 'easy',
        },
        {
          id: 'seg_q2',
          question: 'L\'aggiornamento per gli addetti segnaletica stradale è:',
          options: ['Annuale', '3 ore ogni 4 anni', '8 ore ogni 5 anni', 'Non previsto'],
          correctIndex: 1,
          explanation: 'L\'aggiornamento previsto dal D.I. 22/01/2019 è di 3 ore ogni 4 anni, sia per addetti che per preposti.',
          xpReward: 15, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'seg_schemi',
      title: 'Schemi di Posa e DPI',
      type: 'lesson',
      content: `**🚧 Schemi di posa (D.M. 10/07/2002):**
La segnaletica temporanea deve essere posata seguendo schemi tipo (allegati al DM) in funzione di:
- **Tipo di strada** (autostrada, extraurbana, urbana)
- **Velocità consentita**
- **Numero di corsie occupate**
- **Durata del cantiere** (puntuale, breve, lunga durata)

**📏 Distanze minime di preavviso:**
| Strada | Distanza primo segnale |
|---|---|
| Autostrada | 250 m + 150 m + 100 m (tripla segnalazione) |
| Extraurbana principale | 150 m |
| Urbana | 50 m |

**🛡️ DPI obbligatori per addetti:**
- **Indumenti alta visibilità classe 3** (EN ISO 20471) — sempre, giorno e notte
- **Calzature di sicurezza** S3 antiscivolo
- **Casco** (EN 397) se rischio caduta oggetti dall'alto
- **Guanti** (EN 388) per movimentazione coni e cartelli
- **Otoprotettori** se vicino a macchine operatrici

**📋 Sequenza di posa in sicurezza:**
1. Avvicinarsi al cantiere SEMPRE da monte (mai dal lato del traffico)
2. Posare i segnali nell'**ordine di marcia** del traffico (preavviso → restringimento → fine cantiere)
3. Rimozione in ordine **INVERSO** alla posa
4. Mantenere sempre un veicolo "moviere" con lampeggiante visibile
5. Mai sostare nella zona attiva senza protezione fisica`,
      minTimeSeconds: 60, xpReward: 25,
    },
    {
      id: 'seg_quiz_2',
      title: 'Verifica: Posa e DPI',
      type: 'quiz',
      questions: [
        {
          id: 'seg_q3',
          question: 'Gli indumenti alta visibilità per addetti su strada devono essere:',
          options: ['Classe 1', 'Classe 2', 'Classe 3', 'A piacere'],
          correctIndex: 2,
          explanation: 'EN ISO 20471: per strade aperte al traffico è obbligatoria la classe 3 (maggiore superficie di materiale retroriflettente).',
          xpReward: 20, difficulty: 'medium',
        },
        {
          id: 'seg_q4',
          question: 'In autostrada, la posa della segnaletica temporanea richiede preavviso a:',
          options: ['50 m', '150 m', 'Triplice segnalazione a 250+150+100 m', '500 m'],
          correctIndex: 2,
          explanation: 'D.M. 10/07/2002: in autostrada è prevista triplice segnalazione a 250 m, 150 m e 100 m prima del cantiere.',
          xpReward: 20, difficulty: 'hard',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'seg_boss',
      title: '🏆 Test Finale - Segnaletica Stradale',
      type: 'boss_test',
      questions: [
        {
          id: 'seg_b1',
          question: 'La rimozione della segnaletica temporanea va effettuata:',
          options: ['Nello stesso ordine della posa', 'In ordine INVERSO rispetto alla posa', 'Solo di notte', 'Indifferentemente'],
          correctIndex: 1,
          explanation: 'La rimozione avviene in ordine inverso: si parte dal cantiere e si arretra verso il preavviso, mantenendo la protezione fino all\'ultimo.',
          xpReward: 40, difficulty: 'medium',
        },
        {
          id: 'seg_b2',
          question: 'L\'avvicinamento al cantiere stradale si effettua:',
          options: ['Dal lato del traffico', 'Sempre da monte rispetto al senso di marcia', 'A piedi attraversando la strada', 'Indifferente'],
          correctIndex: 1,
          explanation: 'Avvicinarsi sempre da monte (controsenso rispetto al traffico) per essere visibili e non esporsi a investimento.',
          xpReward: 40, difficulty: 'medium',
        },
        {
          id: 'seg_b3',
          question: 'Un operatore senza attestato D.I. 22/01/2019:',
          options: ['Può operare sotto supervisione', 'NON può operare su strade aperte al traffico', 'Può operare solo di giorno', 'Può operare in zona urbana'],
          correctIndex: 1,
          explanation: 'L\'attestato è condizione necessaria per qualsiasi operatore impiegato in installazione, manutenzione o rimozione di segnaletica stradale temporanea.',
          xpReward: 35, difficulty: 'easy',
        },
        {
          id: 'seg_b4',
          question: 'La normativa principale per gli schemi di posa segnaletica temporanea è:',
          options: ['D.Lgs 81/08', 'D.M. 10 luglio 2002', 'Reg. UE 2016/679', 'CEI 11-27'],
          correctIndex: 1,
          explanation: 'Il D.M. Trasporti 10/07/2002 è il "Disciplinare tecnico" che definisce schemi e modalità di posa per i cantieri stradali.',
          xpReward: 35, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90, xpReward: 50,
    },
  ],
};
