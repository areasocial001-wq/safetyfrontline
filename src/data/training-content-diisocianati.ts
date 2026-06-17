// Modulo Diisocianati - Reg. UE 2020/1149 (restrizione REACH)
import type { ModuleContent } from './training-content';

export const diisocianatiContent: ModuleContent = {
  moduleId: 'diisocianati',
  sections: [
    {
      id: 'dii_intro',
      title: 'Cosa Sono i Diisocianati e Perché Sono Pericolosi',
      type: 'lesson',
      content: `I **diisocianati** sono composti chimici contenenti due gruppi isocianato (-N=C=O), largamente utilizzati nella produzione di **poliuretani**: schiume, vernici, adesivi, sigillanti, isolanti, suole di scarpe.

**🧪 Diisocianati più comuni:**
- **MDI** (difenilmetano diisocianato)
- **TDI** (toluene diisocianato)
- **HDI** (esametilene diisocianato)
- **IPDI** (isoforone diisocianato)

**⚠️ Effetti sulla salute:**
- **Asma occupazionale** — i diisocianati sono la **prima causa di asma professionale in Europa**
- Irritazione di occhi, naso, gola
- Dermatiti e sensibilizzazione cutanea
- Sospetti effetti cancerogeni (categoria 2 per alcune sostanze)

Una volta sensibilizzato, il lavoratore reagisce anche a concentrazioni minime: la prevenzione è l'unica difesa efficace.

**📜 Quadro normativo — Regolamento (UE) 2020/1149:**
Dal **24 agosto 2023** è vietato l'uso industriale e professionale di diisocianati (sopra lo 0,1% in peso) **senza formazione specifica documentata**.

L'obbligo si applica a chi:
- Maneggia diisocianati o miscele
- Supervisiona tali attività
- Acquista/distribuisce diisocianati a uso professionale`,
      minTimeSeconds: 60, xpReward: 20,
    },
    {
      id: 'dii_quiz_1',
      title: 'Verifica: Sostanze e Rischi',
      type: 'quiz',
      questions: [
        {
          id: 'dii_q1',
          question: 'La principale patologia professionale legata ai diisocianati è:',
          options: ['Dermatite', 'Asma occupazionale', 'Sordità', 'Lombalgia'],
          correctIndex: 1,
          explanation: 'I diisocianati sono la principale causa di asma occupazionale in Europa: anche basse esposizioni possono indurre sensibilizzazione permanente.',
          xpReward: 15, difficulty: 'easy',
        },
        {
          id: 'dii_q2',
          question: 'L\'obbligo di formazione UE 2020/1149 scatta sopra una concentrazione di:',
          options: ['0,01%', '0,1%', '1%', '10%'],
          correctIndex: 1,
          explanation: 'Il Regolamento (UE) 2020/1149 impone formazione obbligatoria per uso di diisocianati o miscele con concentrazione superiore allo 0,1% in peso.',
          xpReward: 15, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'dii_formazione',
      title: 'Livelli di Formazione e Misure di Prevenzione',
      type: 'lesson',
      content: `**🎓 Tre livelli di formazione (Allegato XVII REACH, voce 74):**

| Livello | Destinatari | Contenuti |
|---|---|---|
| **Generale** | Tutti gli utilizzatori | Proprietà, rischi, primi soccorsi, DPI base |
| **Intermedio** | Operazioni con rischio aumentato (spruzzo a bassa pressione, miscelazione manuale, applicazioni a temperatura > 45°C) | Procedure specifiche, ventilazione, monitoraggio |
| **Avanzato** | Spruzzo, schiume, applicazioni in spazi confinati, alta temperatura/pressione | Valutazione approfondita, DPI specifici, gestione emergenze |

La formazione va **rinnovata almeno ogni 5 anni** e documentata con attestato.

**🛡️ Misure di prevenzione:**
1. **Sostituzione** — quando possibile, con isocianati a minor volatilità o sistemi pre-polimerizzati
2. **Aspirazione localizzata** alla fonte (LEV)
3. **Sistemi chiusi** o automatizzati per la miscelazione
4. **Ventilazione generale** dei locali
5. **DPI obbligatori:**
   - Maschera con filtri **A2-P3** o respiratore ad aria assistita
   - Guanti in **butile o nitrile spessore ≥0,4 mm** (NON lattice)
   - Occhiali a tenuta o visiera
   - Tuta in Tyvek monouso

**🩺 Sorveglianza sanitaria:**
- Visita preventiva con **spirometria**
- Periodicità almeno annuale
- Allontanamento immediato in caso di sensibilizzazione`,
      minTimeSeconds: 60, xpReward: 25,
    },
    {
      id: 'dii_quiz_2',
      title: 'Verifica: Formazione e DPI',
      type: 'quiz',
      questions: [
        {
          id: 'dii_q3',
          question: 'L\'aggiornamento della formazione diisocianati è richiesto almeno ogni:',
          options: ['1 anno', '3 anni', '5 anni', '10 anni'],
          correctIndex: 2,
          explanation: 'Il Regolamento prevede rinnovo quinquennale della formazione, con attestato documentato disponibile al datore di lavoro.',
          xpReward: 20, difficulty: 'medium',
        },
        {
          id: 'dii_q4',
          question: 'I guanti idonei per i diisocianati sono in:',
          options: ['Lattice', 'Butile o nitrile spessi', 'Cotone', 'Pelle'],
          correctIndex: 1,
          explanation: 'Il lattice non offre protezione adeguata: servono guanti in butile o nitrile spessore minimo 0,4 mm, con tempo di permeazione verificato.',
          xpReward: 20, difficulty: 'hard',
        },
      ],
      minTimeSeconds: 30, xpReward: 10,
    },
    {
      id: 'dii_boss',
      title: '🏆 Test Finale - Diisocianati',
      type: 'boss_test',
      questions: [
        {
          id: 'dii_b1',
          question: 'Lo spruzzo a bassa pressione di prodotti con diisocianati richiede formazione di livello:',
          options: ['Generale', 'Intermedio', 'Avanzato', 'Nessuno'],
          correctIndex: 1,
          explanation: 'Operazioni come spruzzo a bassa pressione, miscelazione manuale o applicazioni > 45°C richiedono almeno il livello Intermedio.',
          xpReward: 40, difficulty: 'hard',
        },
        {
          id: 'dii_b2',
          question: 'La protezione respiratoria minima per uso di diisocianati è:',
          options: ['Mascherina chirurgica', 'Filtro P2', 'Maschera con filtri A2-P3 o aria assistita', 'Solo ventilazione'],
          correctIndex: 2,
          explanation: 'I diisocianati hanno bassa tensione di vapore ma alta tossicità: serve maschera con filtri A2-P3 o sistemi ad aria assistita.',
          xpReward: 40, difficulty: 'medium',
        },
        {
          id: 'dii_b3',
          question: 'Una volta sensibilizzato, il lavoratore:',
          options: ['Può continuare a lavorarci con più DPI', 'Va allontanato dall\'esposizione', 'Deve solo aumentare la ventilazione', 'Può riprendere dopo terapia'],
          correctIndex: 1,
          explanation: 'La sensibilizzazione ai diisocianati è permanente: il giudizio del medico competente impone l\'allontanamento dall\'esposizione.',
          xpReward: 40, difficulty: 'medium',
        },
        {
          id: 'dii_b4',
          question: 'Il Regolamento UE 2020/1149 è in vigore dal:',
          options: ['1° gennaio 2020', '24 agosto 2023', '1° gennaio 2025', 'Non è ancora in vigore'],
          correctIndex: 1,
          explanation: 'L\'obbligo di formazione è entrato pienamente in vigore il 24 agosto 2023 per tutti gli utilizzatori industriali e professionali.',
          xpReward: 30, difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90, xpReward: 50,
    },
  ],
};
