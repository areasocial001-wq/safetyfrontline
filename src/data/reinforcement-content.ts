// Adaptive Learning - Reinforcement content for topics where students struggle

export interface ReinforcementTopic {
  topicId: string;
  title: string;
  relatedQuestionIds: string[];
  content: string;
}

export const reinforcementContent: ReinforcementTopic[] = [
  {
    topicId: 'normativa_base',
    title: 'Quadro Normativo',
    relatedQuestionIds: ['q1_1', 'q1_2', 'boss_1'],
    content: `**Ricorda i punti chiave del D.Lgs 81/2008:**

🔑 Il Testo Unico sulla Sicurezza (TUS) è la norma PRINCIPALE. Prima esistevano tante leggi separate (626/94, 494/96...), ora è tutto in UN solo decreto.

📌 Si applica a **TUTTI**: grandi e piccole aziende, settore pubblico e privato, qualsiasi contratto (tempo determinato, interinale, stage...).

💡 **Trucco per ricordare:** 81/08 → "8-1-0-8" → pensalo come un numero di emergenza per la sicurezza!`,
  },
  {
    topicId: 'rischio_pericolo',
    title: 'Rischio, Pericolo e Danno',
    relatedQuestionIds: ['int_1', 'int_2', 'int_3', 'boss_2', 'boss_6'],
    content: `**Non confondere Pericolo e Rischio!**

🎯 **PERICOLO** = la "cosa" pericolosa (esiste sempre, è oggettivo)
→ Es: un coltello È un pericolo

⚖️ **RISCHIO** = quanto è probabile che il pericolo ti faccia male
→ Es: un coltello nel cassetto = rischio BASSO; un coltello in mano a un bambino = rischio ALTO

📐 **Formula: R = P × D**
- P (Probabilità): da 1 (improbabile) a 4 (quasi certo)
- D (Danno): da 1 (lieve) a 4 (gravissimo/mortale)
- R > 8 = intervento URGENTE

💡 **Trucco:** Pensa a P×D come a un termometro della sicurezza!`,
  },
  {
    topicId: 'figure_prevenzione',
    title: 'Figure della Prevenzione',
    relatedQuestionIds: ['q2_1', 'q2_2', 'q2_3', 'q2_4', 'boss_3', 'boss_4'],
    content: `**Chi fa cosa nella sicurezza aziendale:**

👔 **Datore di Lavoro** → CAPO della sicurezza
- 2 obblighi NON delegabili: DVR + nomina RSPP

🛡️ **RSPP** → NOMINATO dal Datore di Lavoro
- È il tecnico, coordina la prevenzione

✊ **RLS** → ELETTO dai lavoratori  
- È la voce dei lavoratori

🩺 **Medico Competente** → visite + giudizi idoneità

👷 **Preposto** → il "caposquadra" che vigila sul campo

💡 **Trucco:** RSPP = Nominato (N come il datore), RLS = Eletto (E come i lavoratori)`,
  },
  {
    topicId: 'diritti_doveri',
    title: 'Diritti e Doveri del Lavoratore',
    relatedQuestionIds: ['q3_1', 'q3_2', 'q3_4', 'q3_5', 'boss_5', 'boss_7'],
    content: `**Il lavoratore NON è solo un soggetto passivo!**

✅ **DIRITTI** (cosa puoi pretendere):
- Formazione GRATUITA
- DPI GRATUITI
- Allontanarti se c'è pericolo GRAVE

⚠️ **DOVERI** (cosa DEVI fare):
- Usare i DPI → NON è opzionale!
- Segnalare i pericoli → SUBITO, non "dopo"
- Partecipare alla formazione → è OBBLIGATORIO

🚨 **Se violi i doveri:** rischi sanzioni PENALI (arresto o ammenda)

💡 **Trucco:** I DPI sono come la cintura di sicurezza: OBBLIGATORIA, non opzionale!`,
  },
  {
    topicId: 'organigramma',
    title: 'Organigramma della Sicurezza',
    relatedQuestionIds: ['q4_1', 'q4_2', 'q4_3', 'q4_4'],
    content: `**La catena di comando della sicurezza:**

📊 Datore di Lavoro → Dirigente → Preposto → Lavoratore

🔑 **Punti chiave:**
- Il **Dirigente** ATTUA le direttive (non le decide)
- Il **Preposto** VIGILA sul campo (è il supervisore diretto)
- La **Riunione Periodica** è OBBLIGATORIA nelle aziende con 15+ lavoratori
- Il SPP è composto da RSPP + ASPP

💡 **Trucco:** Pensa alla sicurezza come a una squadra di calcio: il DL è l'allenatore, il dirigente il capitano, il preposto l'arbitro in campo!`,
  },
  {
    topicId: 'valutazione_rischi',
    title: 'Valutazione dei Rischi',
    relatedQuestionIds: ['q5_1', 'q5_2', 'q5_3', 'q5_4', 'q5_5'],
    content: `**La Valutazione dei Rischi è il CUORE della prevenzione!**

📋 **DVR** = Documento di Valutazione dei Rischi
- Chi lo fa? Il **Datore di Lavoro** (NON delegabile!)
- Con chi? RSPP + Medico Competente + consultazione RLS

📊 **Matrice del Rischio:**
|  | D=1 | D=2 | D=3 | D=4 |
|P=1| 1 | 2 | 3 | 4 |
|P=2| 2 | 4 | 6 | 8 |
|P=3| 3 | 6 | 9 | 12|
|P=4| 4 | 8 | 12| 16|

🟢 1-2: Accettabile | 🟡 3-4: Attenzione | 🟠 6-9: Intervento | 🔴 12-16: URGENTE

💡 Le misure di prevenzione riducono P, quelle di protezione riducono D!`,
  },
  {
    topicId: 'dpi',
    title: 'Dispositivi di Protezione Individuale',
    relatedQuestionIds: ['q7_1', 'q7_2', 'q7_3', 'q7_4', 'q7_5'],
    content: `**I DPI sono l'ULTIMA linea di difesa!**

📌 **Gerarchia delle misure:**
1. ELIMINARE il rischio alla fonte
2. SOSTITUIRE con qualcosa di meno pericoloso
3. ISOLARE il rischio (barriere, protezioni)
4. PROCEDURE organizzative
5. DPI → solo se le precedenti NON bastano!

🏷️ **Categorie DPI:**
- **Cat. I** → rischi minimi (guanti da giardinaggio)
- **Cat. II** → rischi significativi (caschi, occhiali)
- **Cat. III** → rischi gravissimi/mortali (imbracature, maschere)

⚠️ Il lavoratore DEVE usarli, il datore DEVE fornirli GRATIS e in buono stato!

💡 **Trucco:** Pensa ai DPI come all'ultimo scudo in un videogioco: utile ma meglio non arrivarci!`,
  },
];

export function getReinforcementForQuestion(questionId: string): ReinforcementTopic | undefined {
  return reinforcementContent.find(r => r.relatedQuestionIds.includes(questionId));
}
