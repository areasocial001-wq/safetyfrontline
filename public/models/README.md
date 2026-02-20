# 3D Models per Safety Frontline

Questa cartella contiene i modelli 3D in formato GLTF/GLB utilizzati negli scenari di gioco.

## Modelli Disponibili

### Modelli Integrati
- `warehouse.glb` - Magazzino logistica (Poly Pizza, CC0)
- `factory.glb` - Fabbrica/cantiere industriale (Poly Pizza, CC0)
- `box-sample.glb` - Modello di esempio

## Sistema di Generazione Procedurale dei Rischi

La piattaforma include un **sistema automatico di generazione dei rischi** che analizza i modelli GLTF per posizionare intelligentemente i pericoli basandosi sulla densità degli oggetti.

**Caratteristiche**:
- Analisi spaziale grid-based
- Calcolo densità mesh e vertici
- Generazione contestuale rischi con livelli di gravità
- Due modalità: `replace` (solo procedurali) o `merge` (procedurali + manuali)

📖 **Documentazione completa**: Vedi [PROCEDURAL_RISKS.md](./PROCEDURAL_RISKS.md)

## Come Aggiungere Modelli Personalizzati

### 1. Scaricare modelli GLTF/GLB da:
- [Poly Pizza](https://poly.pizza/) - Collezione low-poly gratuiti
- [Sketchfab](https://sketchfab.com/features/gltf) - Licenza Creative Commons
- [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)
- [CGTrader Free Models](https://www.cgtrader.com/free-3d-models)

### 2. Salvare i file in `public/models/`
- Formato consigliato: `.glb` (più efficiente)
- Formato alternativo: `.gltf` (con texture separate)

### 3. Configurare in `src/data/scenarios3d.ts`

```typescript
{
  id: 'warehouse',
  type: 'warehouse',
  useGLTFModel: true,
  gltfModelPath: '/models/warehouse.glb',
  
  // Abilita generazione procedurale rischi
  proceduralRisks: {
    enabled: true,
    mode: 'replace', // o 'merge'
    config: {
      gridSize: 3,
      minDensityThreshold: 0.3,
    }
  },
  
  risks: [], // Vuoto se mode='replace'
  // ... altre configurazioni
}
```

### 4. Testing e Debug

Usa la modalità debug (tasto **'B'** durante il gioco) per:
- Verificare bounds e scala del modello
- Controllare posizioni rischi procedurali
- Monitorare performance caricamento
- Visualizzare distribuzione rischi

Vedi [TEST.md](./TEST.md) per istruzioni dettagliate.

## Requisiti dei Modelli

- **Formato**: GLTF 2.0 (.glb o .gltf)
- **Poligoni**: < 50k triangoli per compatibilità mobile
- **Scala**: unità reali (metri)
- **Origine**: centrato a (0,0,0) piano terra
- **Ottimizzazione**: rimuovere geometria nascosta, comprimere texture
- **Licenza**: compatibile con uso commerciale

## Ottimizzazione

### Strumenti Consigliati
- **gltf-pipeline**: https://github.com/CesiumGS/gltf-pipeline
- **glTF Transform**: https://gltf-transform.donmccurdy.com/
- **Blender**: per editing manuale e export ottimizzato

### Performance Target
- Tempo caricamento: < 2 secondi su 4G
- FPS: 60fps su dispositivi mid-range
- Memoria: < 100MB per modello
- Triangoli: < 50k per mobile

## Licenze

Licenze consigliate:
- Creative Commons Attribution (CC-BY)
- Creative Commons Zero (CC0)
- Public Domain

Verificare sempre i termini di licenza prima di utilizzare modelli di terze parti.

## Documentazione

- [PROCEDURAL_RISKS.md](./PROCEDURAL_RISKS.md) - Sistema generazione automatica rischi
- [OPTIMIZATION_LOG.md](./OPTIMIZATION_LOG.md) - Log ottimizzazioni modelli
- [TEST.md](./TEST.md) - Guida testing modelli GLTF
