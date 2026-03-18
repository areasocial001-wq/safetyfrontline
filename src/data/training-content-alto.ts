// Formazione Specifica - Rischio ALTO (12 ore)
// Settori: Costruzioni, Industria, Chimica, Sanità, Rifiuti

import { ModuleContent } from './training-content';

export const moduloRA1Content: ModuleContent = {
  moduleId: 'ra_rischi_meccanici_avanzati',
  sections: [
    {
      id: 'ra1_intro',
      title: 'Macchine Industriali e Direttiva Macchine',
      type: 'lesson',
      content: `La Direttiva Macchine 2006/42/CE (recepita dal D.Lgs 17/2010) stabilisce i requisiti essenziali di sicurezza per le macchine immesse sul mercato UE.

**📋 Marcatura CE:**
Ogni macchina deve avere la marcatura CE che attesta la conformità ai requisiti essenziali. Il fabbricante deve fornire:
- Dichiarazione CE di conformità
- Manuale d'uso e manutenzione nella lingua del paese
- Targhetta identificativa

**⚙️ Rischi specifici delle macchine industriali:**
- **Presse:** schiacciamento, cesoiamento (comandi a due mani obbligatori)
- **Torni:** trascinamento, proiezione di trucioli (carter + occhiali)
- **Seghe circolari:** taglio, proiezione (cuffia protettiva + spingitoi)
- **Robot industriali:** area segregata con barriere interbloccate
- **Linee automatizzate:** intrappolamento, schiacciamento durante manutenzione

**🔒 Procedure di manutenzione sicura:**
- **LOTO (Lock Out/Tag Out):** blocco energetico prima di qualsiasi intervento
- **Permesso di Lavoro:** autorizzazione scritta per manutenzioni straordinarie
- **Bonifica:** svuotamento di fluidi pericolosi prima dell'intervento
- **Prova a vuoto:** verifica funzionamento dopo manutenzione, senza carico`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra1_quiz',
      title: 'Verifica: Direttiva Macchine',
      type: 'quiz',
      questions: [
        {
          id: 'ra1_q1',
          question: 'La marcatura CE su una macchina garantisce:',
          options: ['La qualità del prodotto', 'La conformità ai requisiti essenziali di sicurezza UE', 'L\'origine europea del prodotto', 'La garanzia del fabbricante'],
          correctIndex: 1,
          explanation: 'La CE attesta che la macchina è conforme ai requisiti essenziali di sicurezza della Direttiva Macchine. Non è un marchio di qualità.',
          xpReward: 20,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 20,
      xpReward: 10,
    },
    {
      id: 'ra1_scenario',
      title: '🎮 Reparto Produttivo 3D',
      type: 'scenario_3d',
      content: 'Ispeziona il reparto industriale, verifica le protezioni delle macchine e identifica le violazioni alla sicurezza.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'ra1_boss_test',
      title: '🏆 Test Finale - Macchine Industriali',
      type: 'boss_test',
      questions: [
        {
          id: 'ra1_boss1',
          question: 'La procedura LOTO è necessaria quando:',
          options: ['Si pulisce l\'esterno della macchina', 'Si effettua qualsiasi manutenzione che richiede accesso a zone pericolose', 'Solo durante ispezioni programmate', 'Mai, è facoltativa'],
          correctIndex: 1,
          explanation: 'La LOTO è obbligatoria per qualsiasi intervento che richiede accesso alle zone pericolose della macchina, per prevenire avviamenti accidentali.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra1_boss2',
          question: 'Un robot industriale deve operare in:',
          options: ['Area libera con segnaletica', 'Area segregata con barriere interbloccate', 'Solo durante l\'orario notturno', 'Con un operatore che lo controlla a vista'],
          correctIndex: 1,
          explanation: 'I robot industriali devono operare in aree segregate con protezioni perimetrali interbloccate che fermano il robot se vengono aperte.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra1_boss3',
          question: 'Una macchina priva di marcatura CE:',
          options: ['Può essere usata con cautela', 'Non può essere messa in servizio', 'Può essere usata solo per formazione', 'Necessita solo di manutenzione extra'],
          correctIndex: 1,
          explanation: 'Una macchina senza marcatura CE non è conforme e NON può essere messa in servizio. Il datore di lavoro ne risponde penalmente.',
          xpReward: 40,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const moduloRA2Content: ModuleContent = {
  moduleId: 'ra_rischio_chimico',
  sections: [
    {
      id: 'ra2_intro',
      title: 'Rischio Chimico Avanzato',
      type: 'lesson',
      content: `Nei settori ad alto rischio, l'esposizione ad agenti chimici pericolosi è significativa e richiede misure rigorose.

**☠️ Agenti Cancerogeni e Mutageni (Titolo IX, Capo II):**
Sostanze che possono provocare cancro (C) o alterazioni genetiche (M). Classificazione:
- **Cat. 1A:** Accertato effetto sull'uomo
- **Cat. 1B:** Presunto effetto sull'uomo
- **Cat. 2:** Sospetto effetto sull'uomo

**Obblighi specifici per cancerogeni:**
- Sostituzione con sostanze meno pericolose (quando possibile)
- Sistema chiuso di lavorazione
- Riduzione al minimo dell'esposizione
- Registro degli esposti (conservato per 40 anni!)
- Sorveglianza sanitaria specifica
- Misurazioni ambientali periodiche

**🔬 Monitoraggio Biologico:**
Analisi su sangue/urine del lavoratore per verificare l'assorbimento di sostanze.
- TLV-BEI (Biological Exposure Indices): limiti di riferimento
- Risultati comunicati al lavoratore e al MC

**📊 Valori Limite di Esposizione Professionale (VLEP/OEL):**
Concentrazioni massime ammissibili nell'aria dell'ambiente di lavoro.
- TLV-TWA: media ponderata su 8 ore
- TLV-STEL: limite per esposizioni brevi (15 min)
- TLV-C: valore tetto (mai superabile)`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra2_quiz',
      title: 'Verifica: Rischio Chimico',
      type: 'quiz',
      questions: [
        {
          id: 'ra2_q1',
          question: 'Il registro degli esposti a cancerogeni deve essere conservato per:',
          options: ['5 anni', '10 anni', '20 anni', '40 anni'],
          correctIndex: 3,
          explanation: 'Il registro degli esposti a cancerogeni e mutageni deve essere conservato per 40 anni dall\'ultima esposizione, data la latenza delle patologie.',
          xpReward: 25,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 20,
      xpReward: 10,
    },
    {
      id: 'ra2_boss_test',
      title: '🏆 Test Finale - Rischio Chimico',
      type: 'boss_test',
      questions: [
        {
          id: 'ra2_boss1',
          question: 'La prima misura di prevenzione per agenti cancerogeni è:',
          options: ['Fornire DPI respiratori', 'Sostituire con sostanze meno pericolose', 'Ridurre l\'orario di lavoro', 'Aumentare la ventilazione'],
          correctIndex: 1,
          explanation: 'La sostituzione è la prima misura nella gerarchia. Se impossibile, si procede con sistema chiuso, aspirazione, DPI.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra2_boss2',
          question: 'TLV-C significa:',
          options: ['Valore medio su 8 ore', 'Valore per esposizioni brevi', 'Valore tetto mai superabile', 'Valore consigliato'],
          correctIndex: 2,
          explanation: 'TLV-C (Ceiling) è il valore tetto che non deve MAI essere superato nemmeno istantaneamente.',
          xpReward: 35,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA3Content: ModuleContent = {
  moduleId: 'ra_rischio_biologico',
  sections: [
    {
      id: 'ra3_intro',
      title: 'Agenti Biologici e Biosicurezza',
      type: 'lesson',
      content: `Gli agenti biologici (Titolo X D.Lgs 81/08) comprendono batteri, virus, funghi, parassiti che possono causare infezioni, allergie o intossicazioni.

**🦠 Classificazione (art. 268):**
| Gruppo | Rischio | Trattamento | Esempio |
|--------|---------|-------------|---------|
| 1 | Improbabile malattia | - | E. coli non patogeno |
| 2 | Può causare malattia | Disponibile | Salmonella, Legionella |
| 3 | Malattia grave | Disponibile | HIV, HBV, Tubercolosi |
| 4 | Malattia grave | Non disponibile | Ebola, Marburg |

**🔬 Livelli di Contenimento (BSL):**
- **BSL-1:** Pratiche base, banchi aperti
- **BSL-2:** Cappa biologica, DPI, accesso limitato
- **BSL-3:** Laboratorio separato, pressione negativa, HEPA
- **BSL-4:** Tuta pressurizzata, decontaminazione totale

**🧤 DPI per rischio biologico:**
- Guanti monouso (nitrile > lattice per allergie)
- Maschere FFP2/FFP3
- Occhiali a mascherina / visiera
- Camici impermeabili monouso
- Calzari monouso

**💉 Vaccinazioni:**
Il DL deve mettere a disposizione vaccini per i lavoratori esposti (es. HBV per sanitari).`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra3_scenario',
      title: '🎮 Laboratorio Biosicurezza 3D',
      type: 'scenario_3d',
      content: 'Entra nel laboratorio e verifica che tutte le procedure di biosicurezza siano rispettate. Identifica le violazioni.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'ra3_boss_test',
      title: '🏆 Test Finale - Rischio Biologico',
      type: 'boss_test',
      questions: [
        {
          id: 'ra3_boss1',
          question: 'Un agente biologico di gruppo 3:',
          options: ['Non causa mai malattia', 'Causa malattia grave ma esistono trattamenti', 'Causa malattia grave senza trattamento possibile', 'È solo un allergene'],
          correctIndex: 1,
          explanation: 'Il gruppo 3 comprende agenti che causano malattie gravi ma per le quali esistono misure profilattiche o terapeutiche efficaci.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra3_boss2',
          question: 'In un laboratorio BSL-3, la pressione dell\'aria è:',
          options: ['Positiva rispetto all\'esterno', 'Negativa rispetto all\'esterno', 'Uguale all\'esterno', 'Variabile'],
          correctIndex: 1,
          explanation: 'La pressione negativa impedisce la fuoriuscita di agenti biologici: l\'aria entra nel laboratorio ma non esce se non attraverso filtri HEPA.',
          xpReward: 40,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA4Content: ModuleContent = {
  moduleId: 'ra_amianto',
  sections: [
    {
      id: 'ra4_intro',
      title: 'Amianto: Riconoscimento e Bonifica',
      type: 'lesson',
      content: `L'amianto (asbesto) è un minerale fibroso vietato in Italia dal 1992 (L. 257/92), ma è ancora presente in moltissimi edifici costruiti prima di tale data.

**⚠️ Perché è pericoloso:**
Le fibre di amianto sono microscopiche e, se inalate, penetrano in profondità nei polmoni causando:
- **Asbestosi:** fibrosi polmonare progressiva
- **Mesotelioma pleurico:** tumore maligno (latenza 20-40 anni!)
- **Carcinoma polmonare:** rischio moltiplicato nei fumatori

**🏗️ Dove si trova (materiali contenenti amianto - MCA):**
- Coperture in eternit (fibrocemento)
- Coibentazioni di tubature e caldaie
- Pannelli isolanti e controsoffitti
- Guarnizioni e freni (veicoli vecchi)
- Pavimenti in vinil-amianto

**🚫 Cosa NON fare MAI:**
- Rompere, forare, tagliare materiali sospetti
- Utilizzare scope o aspirapolveri normali
- Gettare materiali con amianto nei rifiuti normali

**✅ Procedure corrette:**
- Segnalare materiali sospetti al DL
- Solo ditte specializzate e iscritte all'Albo per la rimozione
- Piano di lavoro approvato dalla ASL
- DPI: facciale filtrante FFP3, tuta monouso, guanti`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra4_boss_test',
      title: '🏆 Test Finale - Amianto',
      type: 'boss_test',
      questions: [
        {
          id: 'ra4_boss1',
          question: 'L\'amianto è stato vietato in Italia dal:',
          options: ['1972', '1982', '1992', '2002'],
          correctIndex: 2,
          explanation: 'La Legge 257/1992 ha vietato l\'estrazione, produzione e commercializzazione dell\'amianto in Italia.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'ra4_boss2',
          question: 'Il mesotelioma pleurico ha un periodo di latenza di:',
          options: ['1-5 anni', '5-10 anni', '20-40 anni', 'Si manifesta subito'],
          correctIndex: 2,
          explanation: 'Il mesotelioma ha una latenza molto lunga (20-40 anni). Anche esposizioni brevi decenni prima possono causare la malattia.',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'ra4_boss3',
          question: 'Chi può rimuovere materiali contenenti amianto?',
          options: ['Qualsiasi lavoratore con DPI', 'Solo ditte iscritte all\'Albo Gestori Ambientali', 'Il datore di lavoro personalmente', 'Chiunque con autorizzazione ASL'],
          correctIndex: 1,
          explanation: 'Solo ditte specializzate iscritte all\'Albo Gestori Ambientali (cat. 10) possono effettuare bonifica amianto, con piano di lavoro approvato dalla ASL.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA5Content: ModuleContent = {
  moduleId: 'ra_spazi_confinati',
  sections: [
    {
      id: 'ra5_intro',
      title: 'Spazi Confinati: Procedure di Accesso',
      type: 'lesson',
      content: `Gli spazi confinati sono tra gli ambienti di lavoro più pericolosi. Il DPR 177/2011 regola i lavori in ambienti sospetti di inquinamento o confinati.

**📋 Definizione:**
Ambienti con aperture limitate di ingresso/uscita, ventilazione naturale insufficiente, non progettati per l'occupazione continua.

**Esempi:** cisterne, silos, fogne, serbatoi, pozzi, vasche, gallerie, stive di navi.

**☠️ Pericoli principali:**
- **Atmosfera tossica:** H₂S, CO, vapori chimici
- **Carenza di ossigeno:** < 19,5% O₂ (normale 20,9%)
- **Eccesso di ossigeno:** > 23,5% → rischio incendio
- **Atmosfera esplosiva:** gas/vapori infiammabili
- **Annegamento:** liquidi residui
- **Seppellimento:** materiali sfusi (granaglie, polveri)

**✅ Procedure obbligatorie (DPR 177/2011):**
1. Permesso di lavoro specifico
2. Rilevazione atmosfera (O₂, LEL, tossici) PRIMA dell'ingresso
3. Ventilazione forzata
4. Squadra di soccorso pronta all'esterno
5. Comunicazione continua con l'esterno
6. DPI: autorespiratore, imbracatura con cordino di recupero
7. MAI entrare da soli
8. Il soccorritore NON entra senza DPI respiratori

**⚠️ Ogni anno in Italia muoiono 10-15 lavoratori in spazi confinati, spesso perché i soccorritori entrano senza DPI.`,
      minTimeSeconds: 60,
      xpReward: 35,
    },
    {
      id: 'ra5_scenario',
      title: '🎮 Accesso in Spazio Confinato 3D',
      type: 'scenario_3d',
      content: 'Prepara e gestisci l\'accesso in sicurezza a una cisterna. Verifica atmosfera, DPI e procedure.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'ra5_boss_test',
      title: '🏆 Test Finale - Spazi Confinati',
      type: 'boss_test',
      questions: [
        {
          id: 'ra5_boss1',
          question: 'Prima di entrare in uno spazio confinato, la PRIMA cosa da fare è:',
          options: ['Indossare i DPI', 'Rilevare l\'atmosfera (O₂, gas tossici, LEL)', 'Ventilare lo spazio', 'Avvisare il preposto'],
          correctIndex: 1,
          explanation: 'La rilevazione strumentale dell\'atmosfera è il PRIMO passo. Senza conoscere la composizione dell\'aria, non si può nemmeno scegliere i DPI corretti.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra5_boss2',
          question: 'Un collega sviene dentro una cisterna. Cosa fai?',
          options: ['Entri subito a soccorrerlo', 'Attivi la squadra di soccorso e NON entri senza DPI respiratori', 'Chiami un altro collega e entrate insieme', 'Aspetti che si riprenda'],
          correctIndex: 1,
          explanation: 'MAI entrare senza DPI. Molti incidenti mortali in spazi confinati coinvolgono soccorritori che entrano impulsivamente senza protezione.',
          xpReward: 40,
          difficulty: 'hard',
        },
        {
          id: 'ra5_boss3',
          question: 'La concentrazione normale di ossigeno nell\'aria è:',
          options: ['15%', '20,9%', '25%', '30%'],
          correctIndex: 1,
          explanation: 'L\'aria normale contiene il 20,9% di ossigeno. Sotto il 19,5% si parla di atmosfera carente, sotto il 16% si rischia la perdita di coscienza.',
          xpReward: 30,
          difficulty: 'easy',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const moduloRA6Content: ModuleContent = {
  moduleId: 'ra_lavori_quota',
  sections: [
    {
      id: 'ra6_intro',
      title: 'Lavori in Quota Avanzato: Ponteggi e Funi',
      type: 'lesson',
      content: `I lavori in quota nel settore ad alto rischio richiedono competenze specifiche su ponteggi, funi e sistemi anticaduta avanzati.

**🏗️ Ponteggi Metallici Fissi (Titolo IV, Capo II):**
- Montaggio/smontaggio: solo lavoratori con formazione specifica
- **PiMUS:** Piano di Montaggio, Uso e Smontaggio (obbligatorio)
- Progetto del ponteggio: obbligatorio se > 20 m di altezza o configurazione non standard
- Verifiche: prima del montaggio, periodiche e dopo eventi eccezionali

**🧗 Lavori su Fune (art. 116):**
Consentiti SOLO quando la valutazione dei rischi dimostra che non è possibile usare protezioni collettive.
Requisiti:
- Due funi: una di lavoro, una di sicurezza (backup)
- Lavoratore agganciato a entrambe le funi
- Formazione specifica di 32 ore
- Sorveglianza sanitaria

**📐 Tirante d'aria:**
Lo spazio libero sotto il lavoratore necessario per arrestare la caduta SENZA che il lavoratore urti il suolo o strutture.
Formula: H = lunghezza cordino + allungamento assorbitore + altezza lavoratore + margine sicurezza`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra6_scenario',
      title: '🎮 Ponteggio 3D - Verifica Sicurezza',
      type: 'scenario_3d',
      content: 'Ispeziona il ponteggio e verifica che tutti gli elementi di sicurezza siano conformi: basette, diagonali, parapetti, accessi.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'ra6_boss_test',
      title: '🏆 Test Finale - Lavori in Quota',
      type: 'boss_test',
      questions: [
        {
          id: 'ra6_boss1',
          question: 'Il PiMUS è:',
          options: ['Piano di Manutenzione Urgente Straordinaria', 'Piano di Montaggio, Uso e Smontaggio del ponteggio', 'Permesso di Intervento in Modalità di Urgenza', 'Piano di Ispezione e Manutenzione Uniforme'],
          correctIndex: 1,
          explanation: 'Il PiMUS (Piano di Montaggio, Uso e Smontaggio) è il documento obbligatorio che descrive le procedure per il ponteggio.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'ra6_boss2',
          question: 'Nei lavori su fune, quante funi sono obbligatorie per lavoratore?',
          options: ['Una', 'Due (lavoro + sicurezza)', 'Tre', 'Dipende dall\'altezza'],
          correctIndex: 1,
          explanation: 'Sono obbligatorie DUE funi: una di lavoro (operativa) e una di sicurezza (backup). Il lavoratore deve essere agganciato a entrambe.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA7Content: ModuleContent = {
  moduleId: 'ra_movimentazione_avanzata',
  sections: [
    {
      id: 'ra7_intro',
      title: 'Movimentazione Meccanica: Carrelli e Gru',
      type: 'lesson',
      content: `L'uso di mezzi di sollevamento e trasporto richiede formazione specifica (Accordo Stato-Regioni 22/02/2012).

**🚜 Carrelli Elevatori (Muletti):**
Abilitazione specifica obbligatoria (12 ore teoria + pratica). Regole:
- Velocità max 10 km/h nei reparti
- Forche abbassate durante il trasporto
- Carico in avanti in salita, indietro in discesa
- Cintura di sicurezza SEMPRE allacciata
- MAI trasportare persone sulle forche
- Attenzione alla stabilità (triangolo di stabilità)

**🏗️ Gru (a torre, mobili, su autocarro):**
- Gruista: abilitazione specifica (14-22 ore)
- Segnalista: persona formata per comunicazioni con il gruista
- Tabella di portata: peso max in funzione dello sbraccio
- MAI superare la portata massima
- Vento: sospendere le operazioni oltre i limiti indicati

**🔷 Piattaforme di Lavoro Elevabili (PLE):**
- Abilitazione specifica (8-12 ore)
- Imbracatura anticaduta SEMPRE agganciata
- Verifiche giornaliere prima dell'uso
- Terreno stabile e livellato per gli stabilizzatori`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra7_scenario',
      title: '🎮 Magazzino Industriale 3D',
      type: 'scenario_3d',
      content: 'Gestisci la movimentazione meccanica nel magazzino: verifica i percorsi del muletto, le aree di carico e la segnaletica.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'ra7_boss_test',
      title: '🏆 Test Finale - Movimentazione Meccanica',
      type: 'boss_test',
      questions: [
        {
          id: 'ra7_boss1',
          question: 'Un carrellista deve trasportare un carico in discesa. Le forche devono essere:',
          options: ['In avanti (a monte)', 'Indietro (a valle)', 'Laterali', 'Non importa'],
          correctIndex: 1,
          explanation: 'In discesa il carico va posizionato a monte (dietro) per mantenere la stabilità e la visibilità. Il contrario in salita.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra7_boss2',
          question: 'La tabella di portata di una gru indica:',
          options: ['Il peso della gru', 'Il peso massimo sollevabile in funzione dello sbraccio', 'La velocità di rotazione', 'L\'altezza massima di sollevamento'],
          correctIndex: 1,
          explanation: 'La tabella di portata mostra il peso max che la gru può sollevare a diverse distanze (sbraccio). Più lontano = meno peso.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA8Content: ModuleContent = {
  moduleId: 'ra_atmosfere_esplosive',
  sections: [
    {
      id: 'ra8_intro',
      title: 'Atmosfere Esplosive - Direttiva ATEX',
      type: 'lesson',
      content: `Un'atmosfera esplosiva (ATEX) è una miscela di aria con sostanze infiammabili (gas, vapori, polveri) che, in determinate concentrazioni, può esplodere in presenza di una fonte di innesco.

**📋 Direttive ATEX:**
- **ATEX 114 (2014/34/UE):** apparecchiature per zone ATEX
- **ATEX 153 (1999/92/CE):** protezione dei lavoratori (recepita D.Lgs 81/08 Titolo XI)

**🗺️ Classificazione delle Zone:**

| Zona | Gas/Vapori | Polveri | Frequenza |
|------|-----------|---------|-----------|
| 0 / 20 | Continua o frequente | Continua o frequente | Permanente |
| 1 / 21 | Occasionale | Occasionale | In funzionamento normale |
| 2 / 22 | Improbabile e breve | Improbabile e breve | Solo in caso di anomalia |

**💥 Pentagono dell'esplosione:**
1. Combustibile (gas, vapore, polvere)
2. Comburente (ossigeno)
3. Fonte di innesco (scintilla, calore, elettricità statica)
4. Concentrazione nel range esplosivo (LEL-UEL)
5. Confinamento (ambiente chiuso)

**🛡️ Misure di prevenzione:**
- Ventilazione adeguata per diluire le concentrazioni
- Apparecchiature certificate ATEX per la zona
- Eliminazione fonti di innesco (utensili antiscintilla, messa a terra)
- Rilevatori di gas con allarme
- Permesso di lavoro a caldo per operazioni con fiamme/scintille`,
      minTimeSeconds: 60,
      xpReward: 35,
    },
    {
      id: 'ra8_boss_test',
      title: '🏆 Test Finale - ATEX',
      type: 'boss_test',
      questions: [
        {
          id: 'ra8_boss1',
          question: 'In una Zona 1 ATEX, le apparecchiature devono essere:',
          options: ['Standard con protezione IP44', 'Certificate ATEX per almeno Zona 1', 'Solo antistatiche', 'Non ci sono requisiti speciali'],
          correctIndex: 1,
          explanation: 'In Zona 1 tutti gli apparecchi devono essere certificati ATEX per uso in Zona 1 o superiore (Zona 0).',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'ra8_boss2',
          question: 'Il LEL (Lower Explosive Limit) è:',
          options: ['La concentrazione massima prima dell\'esplosione', 'La concentrazione minima perché la miscela sia esplosiva', 'La velocità di propagazione della fiamma', 'La temperatura di autoaccensione'],
          correctIndex: 1,
          explanation: 'Il LEL è la concentrazione minima di combustibile nell\'aria necessaria perché la miscela diventi esplosiva. Sotto il LEL, non può esplodere.',
          xpReward: 40,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA9Content: ModuleContent = {
  moduleId: 'ra_rumore_vibrazioni',
  sections: [
    {
      id: 'ra9_intro',
      title: 'Rumore e Vibrazioni: Esposizione Prolungata',
      type: 'lesson',
      content: `Nei settori ad alto rischio, l'esposizione a rumore e vibrazioni è spesso elevata e prolungata, richiedendo misure rigorose.

**🔊 Ipoacusia da rumore (sordità professionale):**
È la malattia professionale più diffusa in Italia. Caratteristiche:
- Progressiva e irreversibile
- Inizia con le frequenze alte (4000 Hz)
- Il lavoratore non se ne accorge subito
- Aggravata da: esposizione prolungata, intensità, impulsività del rumore

**🎧 DPI Uditivi:**
| Tipo | Attenuazione | Uso |
|------|-------------|-----|
| Inserti monouso | 15-25 dB | Esposizioni brevi |
| Inserti riutilizzabili | 20-30 dB | Uso regolare |
| Cuffie circumaurali | 25-35 dB | Esposizioni elevate |
| Cuffie + inserti | 30-40 dB | Esposizioni estreme |

**Audiometria:** esame obbligatorio nella sorveglianza sanitaria per esposti a >85 dB(A).

**📳 Vibrazioni nel settore industriale:**
Valori d'azione e limiti (giornalieri, 8h):
- **HAV (mano-braccio):** azione 2,5 m/s², limite 5 m/s²
- **WBV (corpo intero):** azione 0,5 m/s², limite 1,15 m/s²`,
      minTimeSeconds: 60,
      xpReward: 25,
    },
    {
      id: 'ra9_boss_test',
      title: '🏆 Test Finale - Rumore e Vibrazioni',
      type: 'boss_test',
      questions: [
        {
          id: 'ra9_boss1',
          question: 'L\'ipoacusia da rumore professionale è:',
          options: ['Reversibile con cure', 'Progressiva e irreversibile', 'Solo temporanea', 'Curabile con intervento chirurgico'],
          correctIndex: 1,
          explanation: 'L\'ipoacusia da rumore è progressiva e irreversibile. Le cellule ciliate dell\'orecchio interno, una volta danneggiate, non si rigenerano.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'ra9_boss2',
          question: 'Il valore d\'azione per vibrazioni mano-braccio (HAV) è:',
          options: ['1,0 m/s²', '2,5 m/s²', '5,0 m/s²', '10 m/s²'],
          correctIndex: 1,
          explanation: 'A 2,5 m/s² scattano gli obblighi di informazione, formazione, sorveglianza sanitaria e misure di riduzione.',
          xpReward: 35,
          difficulty: 'hard',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA10Content: ModuleContent = {
  moduleId: 'ra_radiazioni',
  sections: [
    {
      id: 'ra10_intro',
      title: 'Radiazioni Ionizzanti e Non Ionizzanti',
      type: 'lesson',
      content: `**☢️ Radiazioni Ionizzanti (D.Lgs 101/2020):**
Hanno energia sufficiente per ionizzare la materia. Fonti: raggi X, raggi gamma, particelle alfa/beta, neutroni.

**Settori esposti:** sanità (radiologia), industria (controlli non distruttivi), nucleare, ricerca.

**Principi di radioprotezione (ALARA):**
- **Tempo:** minimizzare la durata dell'esposizione
- **Distanza:** massimizzare la distanza dalla sorgente (legge inverso del quadrato)
- **Schermatura:** interporre materiali schermanti (piombo, cemento)

**Dosimetria:** ogni lavoratore esposto porta un dosimetro personale che misura la dose assorbita.

**🔆 Radiazioni Non Ionizzanti (ROA):**
Radiazioni ottiche artificiali (Titolo VIII, Capo V):
- Ultravioletto (UV): saldatura, sterilizzazione → danni a occhi e pelle
- Infrarosso (IR): forni, fonderie → cataratta, ustioni
- Laser: industria, medicina → danni oculari gravi

**Campi Elettromagnetici (CEM, Titolo VIII, Capo IV):**
- Basse frequenze: linee elettriche, saldatrici → correnti indotte nel corpo
- Radiofrequenze: antenne, forni a microonde → riscaldamento tessuti`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra10_boss_test',
      title: '🏆 Test Finale - Radiazioni',
      type: 'boss_test',
      questions: [
        {
          id: 'ra10_boss1',
          question: 'Il principio ALARA nella radioprotezione significa:',
          options: ['Aumentare la dose per ridurre il tempo', 'Ridurre l\'esposizione al livello più basso ragionevolmente ottenibile', 'Utilizzare solo schermi in piombo', 'Lavorare solo di notte'],
          correctIndex: 1,
          explanation: 'ALARA = As Low As Reasonably Achievable. L\'esposizione deve essere ridotta al minimo ragionevolmente ottenibile, considerando tempo, distanza e schermatura.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra10_boss2',
          question: 'La radiazione UV da saldatura può causare:',
          options: ['Solo abbronzatura', 'Cheratocongiuntivite (colpo d\'arco) e eritema cutaneo', 'Ipoacusia', 'Nessun danno con occhiali normali'],
          correctIndex: 1,
          explanation: 'La radiazione UV della saldatura causa "colpo d\'arco" (cheratocongiuntivite) agli occhi e eritema/ustioni alla pelle esposta.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA11Content: ModuleContent = {
  moduleId: 'ra_emergenze_complesse',
  sections: [
    {
      id: 'ra11_intro',
      title: 'Emergenze Complesse e Direttiva Seveso',
      type: 'lesson',
      content: `La Direttiva Seveso III (2012/18/UE, recepita dal D.Lgs 105/2015) disciplina la prevenzione degli incidenti rilevanti connessi a sostanze pericolose.

**🏭 Stabilimenti a Rischio di Incidente Rilevante (RIR):**
Aziende che detengono sostanze pericolose oltre determinate soglie (Allegato 1):
- **Soglia inferiore:** obblighi base (notifica, MAPP, SGS)
- **Soglia superiore:** obblighi estesi (Rapporto di Sicurezza, PEE)

**📋 Documenti obbligatori:**
- **MAPP:** Documento di Politica di Prevenzione
- **SGS-PIR:** Sistema di Gestione della Sicurezza
- **Rapporto di Sicurezza:** analisi dettagliata dei rischi
- **PEI:** Piano di Emergenza Interno (a cura del gestore)
- **PEE:** Piano di Emergenza Esterno (a cura della Prefettura)

**🚨 Tipi di emergenze complesse:**
- Esplosioni di nubi di vapore (UVCE)
- Rilascio di sostanze tossiche
- Incendi di serbatoio (pool fire, jet fire, BLEVE)
- Effetto domino tra stabilimenti vicini

**🔔 Sistema di allerta:**
I lavoratori devono conoscere:
- Significato delle sirene (preallarme, allarme, cessato allarme)
- Procedure di riparo in loco (shelter-in-place)
- Percorsi di evacuazione verso zone sicure
- Punti di raccolta e decontaminazione`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra11_scenario',
      title: '🎮 Emergenza Industriale 3D',
      type: 'scenario_3d',
      content: 'Gestisci un\'emergenza in uno stabilimento industriale: rilascio chimico, attiva le procedure di emergenza e guida l\'evacuazione.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'ra11_boss_test',
      title: '🏆 Test Finale - Emergenze Complesse',
      type: 'boss_test',
      questions: [
        {
          id: 'ra11_boss1',
          question: 'Il PEE (Piano di Emergenza Esterno) è redatto da:',
          options: ['Il datore di lavoro', 'La Prefettura', 'I Vigili del Fuoco', 'L\'INAIL'],
          correctIndex: 1,
          explanation: 'Il PEE è redatto dalla Prefettura per gli stabilimenti a soglia superiore, e riguarda la protezione della popolazione e del territorio circostante.',
          xpReward: 35,
          difficulty: 'hard',
        },
        {
          id: 'ra11_boss2',
          question: 'L\'effetto domino si verifica quando:',
          options: ['I lavoratori cadono uno dopo l\'altro', 'Un incidente in uno stabilimento ne provoca altri in stabilimenti vicini', 'Si verifica un blackout a catena', 'Le macchine si fermano in sequenza'],
          correctIndex: 1,
          explanation: 'L\'effetto domino è la propagazione di un incidente da uno stabilimento agli stabilimenti vicini, amplificando le conseguenze.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 45,
      xpReward: 50,
    },
  ],
};

export const moduloRA12Content: ModuleContent = {
  moduleId: 'ra_cantiere',
  sections: [
    {
      id: 'ra12_intro',
      title: 'Sicurezza nei Cantieri - Titolo IV',
      type: 'lesson',
      content: `Il Titolo IV del D.Lgs 81/08 regola la sicurezza nei cantieri temporanei o mobili (edilizia, infrastrutture, restauro).

**👷 Figure specifiche del cantiere:**
- **Committente:** chi commissiona l'opera
- **Responsabile dei Lavori:** incaricato dal committente per la progettazione/esecuzione
- **CSP (Coord. Sicurezza Progettazione):** redige il PSC in fase di progetto
- **CSE (Coord. Sicurezza Esecuzione):** verifica l'applicazione del PSC in cantiere
- **Impresa affidataria:** responsabile dell'organizzazione del cantiere
- **Impresa esecutrice:** esegue i lavori

**📋 Documenti di cantiere:**
- **PSC (Piano di Sicurezza e Coordinamento):** documento del CSP che analizza rischi e interferenze
- **POS (Piano Operativo di Sicurezza):** documento di ogni impresa esecutrice
- **Notifica preliminare:** comunicazione alla ASL e Ispettorato prima dell'inizio lavori

**🏗️ Rischi specifici del cantiere:**
- Cadute dall'alto (1ª causa di morte)
- Seppellimento (scavi)
- Investimento da mezzi
- Elettrocuzione
- Rumore e vibrazioni
- Polveri (silice, cemento)
- Interferenze tra imprese diverse

**⚠️ Il cantiere è obbligatorio quando:**
- Presenza di più imprese (anche non contemporanee)
- Lavori che espongono a rischi particolari (Allegato XI)`,
      minTimeSeconds: 60,
      xpReward: 30,
    },
    {
      id: 'ra12_scenario',
      title: '🎮 Cantiere Edile 3D',
      type: 'scenario_3d',
      content: 'Ispeziona il cantiere edile completo: verifica scavi, ponteggi, mezzi, segnaletica e coordinamento tra imprese.',
      minTimeSeconds: 150,
      xpReward: 100,
    },
    {
      id: 'ra12_boss_test',
      title: '🏆 Test Finale - Cantieri',
      type: 'boss_test',
      questions: [
        {
          id: 'ra12_boss1',
          question: 'Il PSC (Piano di Sicurezza e Coordinamento) è redatto da:',
          options: ['L\'impresa esecutrice', 'Il CSP (Coordinatore per la Sicurezza in Progettazione)', 'Il direttore dei lavori', 'Il committente'],
          correctIndex: 1,
          explanation: 'Il PSC è redatto dal CSP durante la fase di progettazione dell\'opera. Analizza i rischi e le interferenze tra le diverse imprese.',
          xpReward: 35,
          difficulty: 'medium',
        },
        {
          id: 'ra12_boss2',
          question: 'La notifica preliminare deve essere inviata a:',
          options: ['Solo al Comune', 'ASL e Ispettorato del Lavoro', 'Solo all\'INAIL', 'Ai Vigili del Fuoco'],
          correctIndex: 1,
          explanation: 'La notifica preliminare va inviata alla ASL e all\'Ispettorato del Lavoro competente per territorio, prima dell\'inizio dei lavori.',
          xpReward: 30,
          difficulty: 'medium',
        },
        {
          id: 'ra12_boss3',
          question: 'Il POS è redatto da:',
          options: ['Il CSE', 'Ogni impresa esecutrice', 'Il committente', 'L\'INAIL'],
          correctIndex: 1,
          explanation: 'Il POS (Piano Operativo di Sicurezza) è redatto da ogni impresa esecutrice e descrive le proprie procedure operative di sicurezza.',
          xpReward: 35,
          difficulty: 'medium',
        },
      ],
      minTimeSeconds: 60,
      xpReward: 50,
    },
  ],
};

export const rischioAltoContents = [
  moduloRA1Content, moduloRA2Content, moduloRA3Content, moduloRA4Content,
  moduloRA5Content, moduloRA6Content, moduloRA7Content, moduloRA8Content,
  moduloRA9Content, moduloRA10Content, moduloRA11Content, moduloRA12Content,
];
