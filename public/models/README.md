# 🏗️ Modelli 3D — Safety Frontline

Questa cartella contiene i modelli 3D in formato GLTF/GLB utilizzati nelle simulazioni di sicurezza.

---

## Modelli Disponibili

### Ambienti
| File | Descrizione | Licenza |
|------|-------------|---------|
| `warehouse.glb` | Magazzino logistica | Poly Pizza, CC0 |
| `factory.glb` | Fabbrica/cantiere industriale | Poly Pizza, CC0 |
| `box-sample.glb` | Modello di esempio | — |

### Avatar NPC (`avatars/`)
| File | Descrizione |
|------|-------------|
| `avatar-02.glb` — `avatar-07.glb` | Personaggi NPC con animazioni (walk, idle, run) |
| `worker-01.glb` | Operaio industriale |

I modelli supportano animazioni integrate da Ready Player Me. Il sistema neutralizza il root motion dei GLB e sincronizza la velocità dell'animazione con il movimento del personaggio lungo i waypoint.

---

## Architettura Modulare della Scena

Il rendering 3D segue un'architettura modulare centralizzata in `src/components/demo3d/scene-modules/`:

```
BabylonScene.tsx (orchestratore)
├── scene-setup.ts         — Motore Babylon.js, luci, camera
├── environment-loader.ts  — Caricamento GLTF ottimizzato
├── environment-props.ts   — Arredi procedurali (ufficio/industriale)
├── worker-avatars.ts      — NPC, varianti, animazioni waypoint
├── safety-signage.ts      — Segnaletica di sicurezza
├── extinguisher-system.ts — Simulazione antincendio
├── lod-system.ts          — Level of Detail adattivo
└── audio-helpers.ts       — Audio spaziale 3D
```

---

## Motore 3D e Ottimizzazioni

### Babylon.js — Configurazione
- **Materiali**: i materiali GLTF/GLB vengono convertiti automaticamente in `StandardMaterial` per evitare il superamento dei limiti WebGL (`GL_MAX_VERTEX_UNIFORM_BUFFERS`)
- **Luci**: massimo **4 luci simultanee** per scena per compatibilità GPU
- **NPC**: luminosità +30%, emissivo al 15% per risaltare in ogni ambiente

### Level of Detail (LOD)
Il modulo `lod-system.ts` ottimizza il rendering in tempo reale:

| Livello | Distanza | Dettaglio |
|---------|----------|-----------|
| High | Vicino | Mesh originale completa |
| Medium | Medio | Geometria semplificata |
| Low | Lontano | Proxy bounding-box |
| Cull | Fuori range | Non renderizzato |

Riduce le draw call utilizzando proxy semplificati per oggetti distanti e gestisce automaticamente tutte le mesh della scena.

### Post-Processing Pipeline
Ogni scenario utilizza preset dinamici di illuminazione e atmosfera:

| Scenario | Stile | Effetti |
|----------|-------|---------|
| **Ufficio** | Caldo, bilanciato | Anti-washout, toni warm |
| **Magazzino** | Industriale, freddo | Look metallico |
| **Cantiere** | Arancione saturo | Atmosfera polvere/terra |
| **Laboratorio** | Fumoso, intenso | Bagliori, nebbia densa |

Effetti configurabili: **Bloom**, **Chromatic Aberration**, **Vignette**, **Color Curves**.

---

## Generazione Procedurale

### Rischi Automatici
Il sistema analizza i modelli GLTF per posizionare intelligentemente i pericoli basandosi sulla densità degli oggetti:

- Analisi spaziale grid-based
- Calcolo densità mesh e vertici
- Generazione contestuale rischi con livelli di gravità
- Due modalità: `replace` (solo procedurali) o `merge` (procedurali + manuali)

📖 Documentazione completa: [PROCEDURAL_RISKS.md](./PROCEDURAL_RISKS.md)

### Arredi Procedurali

**Ufficio**: finestre, poster, librerie, zona break (macchina caffè, frigorifero, sedie lounge).

**Cantiere**: terreno ghiaia/terra, recinzioni perimetrali con trasparenza alpha, blocchi fondazione in cemento.

### NPC con Fallback
Se il caricamento dei modelli GLB fallisce, il sistema genera automaticamente **NPC procedurali a capsula** per garantire la funzionalità dello scenario.

---

## Come Aggiungere Modelli Personalizzati

### 1. Scaricare modelli GLTF/GLB da:
- [Poly Pizza](https://poly.pizza/) — Collezione low-poly gratuiti
- [Sketchfab](https://sketchfab.com/features/gltf) — Creative Commons
- [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)
- [CGTrader Free Models](https://www.cgtrader.com/free-3d-models)

### 2. Salvare in `public/models/`
- Formato consigliato: `.glb` (più efficiente)
- Formato alternativo: `.gltf` (con texture separate)

### 3. Configurare in `src/data/scenarios3d.ts`

```typescript
{
  id: 'warehouse',
  type: 'warehouse',
  useGLTFModel: true,
  gltfModelPath: '/models/warehouse.glb',
  
  // Generazione procedurale rischi
  proceduralRisks: {
    enabled: true,
    mode: 'replace', // o 'merge'
    config: {
      gridSize: 3,
      minDensityThreshold: 0.3,
    }
  },
  
  risks: [],
}
```

### 4. Testing e Debug

Premi **'B'** durante il gioco per la modalità debug:
- Verifica bounds e scala del modello
- Controlla posizioni rischi procedurali
- Monitora performance e caricamento
- Visualizza distribuzione rischi

Vedi [TEST.md](./TEST.md) per istruzioni dettagliate.

---

## Requisiti dei Modelli

| Parametro | Valore |
|-----------|--------|
| Formato | GLTF 2.0 (.glb o .gltf) |
| Poligoni | < 50k triangoli (mobile) |
| Scala | Unità reali (metri) |
| Origine | Centrato a (0,0,0) piano terra |
| Ottimizzazione | Rimuovere geometria nascosta, comprimere texture |
| Licenza | Compatibile con uso commerciale |

### Performance Target
| Metrica | Target |
|---------|--------|
| Caricamento | < 2 secondi su 4G |
| FPS | 60fps su dispositivi mid-range |
| Memoria | < 100MB per modello |
| Triangoli | < 50k per mobile |

---

## Strumenti di Ottimizzazione

- **gltf-pipeline**: https://github.com/CesiumGS/gltf-pipeline
- **glTF Transform**: https://gltf-transform.donmccurdy.com/
- **Blender**: editing manuale e export ottimizzato

---

## Documentazione Correlata

- [PROCEDURAL_RISKS.md](./PROCEDURAL_RISKS.md) — Sistema generazione automatica rischi
- [MERGE_MODE_GUIDE.md](./MERGE_MODE_GUIDE.md) — Guida modalità merge rischi
- [ENVIRONMENT_MODELS_GUIDE.md](./ENVIRONMENT_MODELS_GUIDE.md) — Guida modelli ambiente
- [OCCLUSION_SYSTEM.md](./OCCLUSION_SYSTEM.md) — Sistema occlusione
- [OPTIMIZATION_LOG.md](./OPTIMIZATION_LOG.md) — Log ottimizzazioni modelli
- [TEST.md](./TEST.md) — Guida testing modelli GLTF
