# Sistema di Occlusione Dinamica

## Panoramica
Il sistema di occlusione dinamica migliora l'esperienza di gioco in ambienti 3D rendendo trasparenti automaticamente gli oggetti che ostruiscono la visuale del giocatore.

## Come Funziona

### 1. Rilevamento Ray-Casting
Il sistema esegue un **raycast dalla camera** in direzione dello sguardo del giocatore:
- **Distanza massima**: 3.0 unità (OCCLUSION_DISTANCE)
- **Direzione**: Forward vector della camera
- **Target**: Oggetti con collisioni abilitate

### 2. Identificazione Oggetti Ostruenti
Gli oggetti vengono rilevati se:
- ✅ Hanno `checkCollisions = true`
- ✅ Sono visibili (`isVisible = true`)
- ❌ NON sono marker di rischi (`risk_*`)
- ❌ NON sono terreno (`ground`)
- ❌ NON sono root nodes (`__root__`)

### 3. Fade-Out Automatico
Quando un oggetto ostruisce la vista:
1. Il sistema salva l'**alpha originale** del materiale
2. Riduce gradualmente l'alpha a **0.15** (MIN_OCCLUSION_ALPHA)
3. Abilita **alpha blending** sul materiale
4. Applica transizione smooth con velocità **0.08** (FADE_SPEED)

### 4. Ripristino Automatico
Quando l'oggetto non ostruisce più:
1. Il target alpha torna al valore **originale**
2. L'oggetto gradualmente **riappare**
3. Quando completamente ripristinato, viene rimosso dal tracking

## Parametri Configurabili

```typescript
const MIN_OCCLUSION_ALPHA = 0.15;  // Alpha minimo (0 = invisibile, 1 = opaco)
const FADE_SPEED = 0.08;            // Velocità transizione (0.01-0.2)
const OCCLUSION_DISTANCE = 3.0;     // Distanza massima rilevamento
```

### Regolazioni Consigliate

**Per Occlusione Più Aggressiva:**
- ⬇️ Ridurre `MIN_OCCLUSION_ALPHA` a `0.05` (quasi invisibile)
- ⬆️ Aumentare `OCCLUSION_DISTANCE` a `5.0`
- ⬆️ Aumentare `FADE_SPEED` a `0.15` (transizione più rapida)

**Per Occlusione Più Delicata:**
- ⬆️ Aumentare `MIN_OCCLUSION_ALPHA` a `0.3` (più visibile)
- ⬇️ Ridurre `OCCLUSION_DISTANCE` a `2.0`
- ⬇️ Ridurre `FADE_SPEED` a `0.04` (transizione più lenta)

## Vantaggi

✅ **Nessun Blocco Visivo**: Props non ostruiscono mai la visuale
✅ **Transizione Smooth**: Fade graduale senza salti bruschi
✅ **Performance Ottimizzata**: Tracking solo oggetti necessari
✅ **Ripristino Automatico**: Alpha originale sempre preservato
✅ **Compatibile con Tutti i Materiali**: StandardMaterial e PBRMaterial

## Casi d'Uso

### Spazi Ristretti
Negli ambienti con corridoi stretti o aree dense di props:
- I barili, pallet e barriere si rendono trasparenti automaticamente
- Il giocatore mantiene sempre visibilità completa
- Non serve ruotare camera manualmente per evitare ostruzioni

### Ambienti Densi
In scenari warehouse/factory con molti oggetti:
- Props vicini alla camera fadeano immediatamente
- Il giocatore può identificare rischi dietro scaffali/macchinari
- Migliora gameplay e riduce frustrazione

### Navigazione
Durante spostamento del giocatore:
- Fade-out anticipa movimento (distanza 3.0 unità)
- Transizione smooth evita flickering
- Ripristino graduale dopo passaggio

## Implementazione Tecnica

Il sistema è integrato nel **render loop** di BabylonScene.tsx:

```typescript
// Render loop con occlusione dinamica
engine.runRenderLoop(() => {
  updateDynamicOcclusion();  // ← Sistema occlusione
  scene.render();
});
```

### Struttura Dati
```typescript
// Map che traccia mesh con alpha modificato
occludedMeshes: Map<BABYLON.Mesh, {
  originalAlpha: number;   // Alpha iniziale (ripristino)
  targetAlpha: number;     // Alpha desiderato (fade target)
  currentAlpha: number;    // Alpha corrente (smooth transition)
}>
```

## Performance

Il sistema è **altamente ottimizzato**:
- Ray-casting eseguito una sola volta per frame
- Tracking solo di mesh effettivamente occlusi
- Rimozione automatica da tracking quando ripristinati
- Nessun impatto su FPS anche con 50+ props

## Debug

Per verificare il funzionamento:
1. Avvicinati a un barrel/pallet/barriera
2. Osserva fade-out graduale quando entra nel raggio (3 unità)
3. Allontanati e verifica ripristino automatico
4. Console logs: `[Occlusion] Fading mesh: [nome]` (se abilitati)

## Limitazioni

❌ **Non applica a:**
- Marker rischi (devono rimanere sempre visibili)
- Terreno (ground plane)
- Root nodes (strutture principali)

⚠️ **Note:**
- Materiali senza supporto alpha non verranno modificati
- Oggetti fuori dal cono di visuale non vengono processati
- Alpha blending richiede ordine di rendering corretto (già gestito)
