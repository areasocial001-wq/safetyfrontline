import { ModuleContent } from './training-content';

export const moduloRSPP3Content: ModuleContent = {
  moduleId: 'rspp_dl_tecnico',
  sections: [
    {
      id: 'rspp3_rischi_specifici',
      title: 'Individuazione dei Rischi Specifici',
      type: 'lesson',
      content: `Il DL-RSPP deve saper individuare e classificare tutti i rischi presenti in azienda.

**🔴 Rischi per la Sicurezza (infortuni):**
- Meccanici: macchine, attrezzature, cadute
- Elettrici: contatti diretti/indiretti, arco elettrico
- Incendio/esplosione: sostanze infiammabili, ATEX

**🟡 Rischi per la Salute (malattie professionali):**
- Agenti chimici: polveri, fumi, solventi
- Agenti fisici: rumore, vibrazioni, radiazioni
- Agenti biologici: virus, batteri, muffe
- Ergonomici: posture, movimentazione, VDT

**🔵 Rischi Trasversali (organizzativi):**
- Stress lavoro-correlato
- Lavoro notturno/turni
- Differenze di genere, età, provenienza
- Lavoratrici in gravidanza

**📋 Strumenti di individuazione:**
- Sopralluogo sistematico
- Checklist per tipologia di rischio
- Schede di sicurezza (SDS) per agenti chimici
- Misurazioni strumentali certificate`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'rspp3_quiz_rischi',
      title: 'Verifica: Classificazione Rischi',
      type: 'quiz',
      questions: [
        {
          id: 'rspp3_q1',
          question: 'Il rumore sul luogo di lavoro è classificato come:',
          options: ['Rischio per la sicurezza', 'Rischio per la salute (agente fisico)', 'Rischio trasversale', 'Non è un rischio normato'],
          correctIndex: 1,
          explanation: 'Il rumore è un agente fisico che rientra tra i rischi per la salute. È normato dal Titolo VIII del D.Lgs 81/08.',
          xpReward: 15,
          difficulty: 'easy',
        },
        {
          id: 'rspp3_q2',
          question: 'Le Schede di Sicurezza (SDS) contengono informazioni su:',
          options: ['Solo le proprietà fisiche', 'Pericoli, misure di primo soccorso, stoccaggio e smaltimento del prodotto chimico', 'Solo le modalità di smaltimento', 'Solo il prezzo del prodotto'],
          correctIndex: 1,
          explanation: 'Le SDS (16 sezioni secondo Regolamento REACH) contengono tutte le informazioni necessarie per la gestione sicura di sostanze e miscele chimiche.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 30,
      xpReward: 10,
    },
    {
      id: 'rspp3_misure',
      title: 'Misure di Prevenzione e Protezione',
      type: 'lesson',
      content: `Le misure di prevenzione e protezione seguono una gerarchia precisa.

**📐 Gerarchia delle misure (art. 15):**
1. **Eliminazione** del rischio alla fonte
2. **Sostituzione** con qualcosa di meno pericoloso
3. **Misure tecniche** (protezioni, barriere, aspirazione)
4. **Misure organizzative** (procedure, rotazione, formazione)
5. **DPI** come ultima risorsa

**🛡️ Dispositivi di Protezione Individuale:**
- Il DL deve fornire DPI adeguati e conformi (marcatura CE)
- Obbligo di formazione sull'uso corretto
- Manutenzione e sostituzione a carico del DL
- Il lavoratore ha l'obbligo di utilizzarli

**📋 Procedure di sicurezza:**
- Procedure operative standard (SOP)
- Istruzioni per l'uso delle attrezzature
- Procedure di emergenza
- Permessi di lavoro per attività a rischio elevato

**⚠️ Segnaletica di sicurezza (D.Lgs 81/08 Titolo V):**
- 🔴 Divieto: cerchio rosso su fondo bianco
- 🔵 Obbligo: cerchio blu con pittogramma bianco
- ⚠️ Avvertimento: triangolo giallo con bordo nero
- 🟩 Salvataggio: rettangolo verde con pittogramma bianco`,
      minTimeSeconds: 90,
      xpReward: 30,
    },
    {
      id: 'rspp3_npc_pratico',
      title: 'Casi Pratici: Rischi e Soluzioni',
      type: 'lesson',
      npcDialogue: [
        { speaker: 'Ing. Neri', role: 'Tecnico della Prevenzione', text: 'In un\'officina meccanica ho trovato una pressa senza riparo mobile. Prima azione: fermare la macchina. Seconda: installare il riparo con interblocco. Terza: formare gli operatori. La gerarchia delle misure va sempre rispettata.' },
        { speaker: 'Dott.ssa Russo', role: 'Igienista Industriale', text: 'Per il rischio chimico, prima cerco di eliminare o sostituire la sostanza pericolosa. Se non è possibile, installo aspirazione localizzata. I DPI respiratori sono l\'ultima linea di difesa, mai la prima.' },
        { speaker: 'Marco', role: 'DL-RSPP', text: 'Ho dovuto scegliere i DPI per i miei 15 operai. Ho consultato le SDS dei prodotti chimici, ho verificato le marcature CE e ho fatto provare diversi modelli. Il DPI deve essere adeguato E confortevole.' },
      ],
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'rspp3_boss_test',
      title: '🏆 Test Finale - Modulo Tecnico',
      type: 'boss_test',
      questions: [
        {
          id: 'rspp3_boss1',
          question: 'Nella gerarchia delle misure di prevenzione, i DPI sono:',
          options: ['La prima misura da adottare', 'L\'ultima misura, dopo eliminazione, sostituzione, misure tecniche e organizzative', 'Equivalenti alle misure tecniche', 'Obbligatori solo per rischio alto'],
          correctIndex: 1,
          explanation: 'I DPI sono l\'ultima linea di difesa nella gerarchia delle misure di prevenzione (art. 15). Si adottano solo quando le altre misure non sono sufficienti.',
          xpReward: 30,
          difficulty: 'easy',
        },
        {
          id: 'rspp3_boss2',
          question: 'Un segnale di sicurezza rotondo blu indica:',
          options: ['Divieto', 'Obbligo', 'Avvertimento', 'Salvataggio'],
          correctIndex: 1,
          explanation: 'I segnali rotondi blu con pittogramma bianco indicano un obbligo (es. obbligo di indossare il casco, i guanti, ecc.).',
          xpReward: 25,
          difficulty: 'easy',
        },
        {
          id: 'rspp3_boss3',
          question: 'Le Schede di Sicurezza (SDS) sono composte da:',
          options: ['8 sezioni', '12 sezioni', '16 sezioni', '20 sezioni'],
          correctIndex: 2,
          explanation: 'Le SDS secondo il Regolamento REACH sono composte da 16 sezioni standardizzate che coprono tutti gli aspetti della gestione sicura del prodotto.',
          xpReward: 30,
          difficulty: 'hard',
        },
        {
          id: 'rspp3_boss4',
          question: 'Il DL che non fornisce DPI adeguati ai lavoratori rischia:',
          options: ['Nessuna sanzione', 'Solo una diffida', 'Arresto da 2 a 4 mesi o ammenda', 'Solo sanzione amministrativa'],
          correctIndex: 2,
          explanation: 'La mancata fornitura di DPI adeguati è sanzionata penalmente con arresto da 2 a 4 mesi o ammenda (art. 18, comma 1, lett. d).',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 90,
      xpReward: 50,
    },
  ],
};
