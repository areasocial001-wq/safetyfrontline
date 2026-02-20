# Testing GLTF Models - Guide

Questa guida ti aiuta a testare e verificare i modelli GLTF integrati nel gioco 3D.

## Come Testare

### 1. Avvia il Gioco 3D
- Naviga alla pagina Demo 3D
- Seleziona lo scenario "Magazzino Logistica" o "Cantiere Edile"
- Clicca "Inizia Demo"

### 2. Attiva la Modalità Debug
Una volta iniziata la demo, premi il tasto **B** sulla tastiera per attivare/disattivare la modalità debug.

In modalità debug vedrai:
- **Bounding box verde semi-trasparente** attorno al modello GLTF
- **Griglia di riferimento** sul pavimento
- **Assi di coordinate** all'origine (X=rosso, Y=verde, Z=blu)
- **Marker rossi** con wireframe che mostrano la posizione dei rischi
- **Linee tratteggiate** che collegano i rischi al pavimento
- **Punto spawn blu** dove inizia il giocatore
- **Etichette dimensionali** sopra il modello (Larghezza, Altezza, Profondità)

### 3. Verifica Performance

Controlla la console del browser (F12 → Console) per vedere:

```
[GLTF] Loading model: /models/warehouse.glb
[GLTF] Model dimensions: { width: XX, height: YY, depth: ZZ }
[GLTF] Model loaded successfully: {
  path: "/models/warehouse.glb",
  meshes: XX,
  triangles: XXXX,
  loadTime: "XXms",
  scale: 5
}
```

**Performance Benchmark:**
- ✅ **Ottimo**: < 100ms di caricamento, < 50k triangoli
- ⚠️ **Accettabile**: 100-500ms di caricamento, 50-100k triangoli
- ❌ **Scarso**: > 500ms di caricamento, > 100k triangoli

### 4. Verifica Collisioni

Nella console vedrai anche log sulle collisioni:
- Cammina verso i muri o oggetti
- Dovresti sentire il suono di impatto e vedere un shake della camera
- La console mostrerà `[Collision]` quando avviene una collisione

### 5. Verifica Scala dei Modelli

In modalità debug:
1. Guarda le dimensioni del bounding box (etichetta in alto)
2. Confronta con le dimensioni dello spazio di gioco (30x30 per office, 50x50 per warehouse)
3. Verifica che il giocatore (box blu alto 1.6m) sia proporzionato
4. Controlla che i marker dei rischi siano posizionati dentro il modello

**Scale Consigliate:**
- Warehouse: scale = 5-10 (modello piccolo low-poly)
- Factory/Construction: scale = 8-15 (modello piccolo low-poly)
- Office: geometria programmatica (no GLTF)

### 6. Test sui Rischi

Ogni marker rosso rappresenta un rischio:
- La posizione dovrebbe corrispondere a un elemento pericoloso del modello
- Se il marker è fuori dal modello o nel vuoto, la posizione va corretta
- Verifica che tutti i rischi siano raggiungibili dal giocatore

### 7. Test Notifiche

Quando carichi uno scenario con modello GLTF, dovresti vedere:
- Toast notification con informazioni sul modello caricato
- Numero di mesh, triangoli, e tempo di caricamento

## Problemi Comuni

### Modello Non Appare
**Causa**: File GLB non trovato o scala errata
**Soluzione**: 
- Verifica che il file esista in `public/models/`
- Controlla la console per errori 404
- Aumenta la scala se il modello è troppo piccolo

### Performance Lente
**Causa**: Modello troppo complesso
**Soluzione**:
- Usa modelli low-poly (< 50k triangoli)
- Ottimizza le texture (max 2048x2048)
- Considera la compressione Draco

### Rischi Fuori Posto
**Causa**: Scala del modello non corrisponde alle posizioni dei rischi
**Soluzione**:
- Attiva modalità debug (B)
- Annota le dimensioni del bounding box
- Modifica la scala in `WarehouseEnvironment.tsx` o `IndustrialEnvironment.tsx`
- Riposiziona i rischi in `src/data/scenarios3d.ts`

### Collisioni Non Funzionano
**Causa**: Collision system non aggiornato per il nuovo modello
**Soluzione**:
- Il collision system usa bounding box semplificati
- Potrebbero essere necessari aggiustamenti al `CollisionSystem` in `src/lib/collision-system.ts`

## Comandi Tastiera

Durante il gioco:
- **WASD** o **Frecce**: Movimento
- **Mouse**: Guarda attorno
- **Click**: Identifica rischio
- **B**: Toggle modalità debug

## Logs da Monitorare

Console logs utili per debugging:
```
[GLTF] Loading model: ...
[GLTF] Model dimensions: ...
[GLTF] Model loaded successfully: ...
[ModelDebugger] Bounding box info: ...
[WarehouseEnvironment] Loading GLTF model: ...
[IndustrialEnvironment] Loading GLTF model: ...
[Debug Mode] ENABLED/DISABLED
```

## Next Steps

Dopo aver verificato che tutto funziona:
1. Disattiva modalità debug (premi B)
2. Gioca normalmente e testa l'esperienza utente
3. Ottimizza scala e posizioni rischi se necessario
4. Considera l'aggiunta di più dettagli nei modelli GLTF
5. Testa su dispositivi mobili (touch + gyroscope)

## Performance Monitoring

Usa gli strumenti del browser:
- **Performance tab**: Registra sessione di gioco per analizzare FPS
- **Network tab**: Verifica dimensione e tempo di download dei GLB
- **Memory tab**: Monitora uso memoria durante il gioco

Target FPS: 60 FPS su desktop, 30 FPS su mobile
