## Obiettivo
Trasformare il Cantiere Edile 3D da scenario "statico" a esperienza interattiva con macchinari "vivi", rischi specifici contestuali, viste cinematografiche dedicate e performance fluide anche su PC modesti.

## 1. Rischi specifici per macchinario (manuali, contestuali)
Aggiungo a `src/data/scenarios3d.ts` (scenario `construction`) 4 rischi manuali agganciati alle posizioni degli asset appena introdotti:

- **Escavatore (12,−15)** — `risk_excavator_swing`: "Zona di rotazione braccio non delimitata" — area di manovra senza coni/barriere; severity `high`.
- **Bulldozer (8, 8)** — `risk_dozer_blindspot`: "Punto cieco posteriore senza segnalatore" — bulldozer in retromarcia senza moviere; severity `high`.
- **Dump Truck (−6, 12)** — `risk_truck_pedestrian`: "Pista pedonale attraversa percorso dumper" — interferenza tra mezzo e pedoni; severity `critical`.
- **Betoniera (−2, −10)** — `risk_mixer_idle`: "Betoniera con motore acceso e operatore assente" — emissioni/avvio accidentale; severity `medium`.

Tutti `isManual: true` con label/description coerenti col layout, così la generazione procedurale resta intatta.

## 2. Micro-sfide e feedback per ogni macchinario
Estendo il sistema di quiz contestuali già esistente (`CyberRiskQuiz` come riferimento) creando un componente leggero `MachineryRiskQuiz.tsx` riusato per i 4 rischi:

- 1 domanda a 3 opzioni per rischio (azione corretta: arretrare, segnalare, fermare il mezzo, attivare LOTO).
- Feedback immediato (corretto = +50 XP + toast verde, errato = spiegazione e −10 XP).
- Mappa `MACHINERY_QUIZZES` in `src/data/machinery-quizzes.ts` con id rischio → domanda, opzioni, risposta corretta, spiegazione normativa (D.Lgs. 81/08 artt. 71/73).
- Trigger: quando il giocatore clicca sull'indicatore rischio del macchinario, invece dell'auto-conferma si apre il quiz.

## 3. Camera & punti di vista
- Aggiungo in `Demo3D.tsx` un mini-pannello "Vista Cantiere" (visibile solo per scenario `construction`, in basso a destra accanto al joystick) con 4 preset:
  - Panoramica aerea (drone)
  - Vista escavatore
  - Vista dumper
  - Vista pedonale (default first-person)
- Implementazione: nuova funzione `setCameraPreset(name)` in `BabylonScene.tsx` che sposta `UniversalCamera` su posizioni/target predefiniti con `BABYLON.Animation` (fade 600 ms, easing). Il preset "drone" disabilita temporaneamente i controlli WASD e abilita rotazione orbitale.
- Anti-clipping schermo: rendo il mini-pannello `fixed` con `safe-area-inset` e nascondo automaticamente sotto 380 px di altezza.

## 4. Performance — LOD, culling, asset leggeri
Tutto su `environment-props.ts` `addConstructionProps`:

- **LOD per macchinario**: per ogni `TransformNode` (excavator/dozer/truck/mixer) creo un proxy `BoundingBox` low-poly e uso `mesh.addLODLevel(distance, lowMesh)` o, per i `TransformNode`, un controllo manuale via `scene.onBeforeRenderObservable` che `setEnabled(false)` ai figli oltre 35 m dal player.
- **Culling**: abilito `freezeWorldMatrix()` su tutti i mesh statici (cingoli, ruote, bracci, lama, drum, pile materiali). Imposto `alwaysSelectAsActiveMesh = false` e affido frustum culling al motore.
- **Tessellation ridotta**: cilindri ruote/cingoli passano da 14 → 8 segmenti su `quality === 'low' | 'medium'`.
- **Material instancing**: condivido `yellowMat`, `darkMetalMat`, `concreteMat` (già fatto) ed elimino duplicati per drum/pile.
- **Shadow caster opzionale**: su `quality === 'low'` salto `addShadowCaster` per ruote, bracci secondari, finestre cabina.
- **Scene freeze materials**: dopo l'inserimento chiamo `scene.freezeActiveMeshes()` *solo* per i preset statici del cantiere (escluso pivot gru rotante).

### Dettaglio tecnico
```text
File toccati:
- src/data/scenarios3d.ts             (4 nuovi rischi manuali)
- src/data/machinery-quizzes.ts       (NEW — 4 quiz contestuali)
- src/components/demo3d/MachineryRiskQuiz.tsx (NEW — overlay quiz)
- src/pages/Demo3D.tsx                (gestione apertura quiz + pannello viste)
- src/components/demo3d/CameraPresetsPanel.tsx (NEW — UI preset)
- src/components/demo3d/BabylonScene.tsx       (setCameraPreset + animazione)
- src/components/demo3d/scene-modules/environment-props.ts (LOD/culling/freeze)
```

## Fuori scopo (per evitare blowup)
- Nessuna animazione "vera" dei macchinari (cingoli che girano, braccio che scava): solo rotazione gru già esistente.
- Nessun rifacimento del sistema rischi procedurale.
- Nessun nuovo audio specifico per macchinario (riuso ambient `construction`).

Confermi di procedere così, o vuoi che restringa/espanda qualcosa (es. quiz più lunghi, animazione cingoli, rimozione viste preset)?