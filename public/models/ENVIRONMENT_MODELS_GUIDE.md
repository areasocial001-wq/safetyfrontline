# Guida Scenografie Ambientali Realistiche

## Modelli GLTF Attualmente Implementati

### ✅ Warehouse (Magazzino)
- **File**: `warehouse.glb`
- **Fonte**: Poly Pizza
- **URL**: https://poly.pizza/m/fsxbktzB1zo
- **Stato**: ✅ Attivo con props ambientali

### ✅ Factory/Construction (Cantiere)
- **File**: `factory.glb`
- **Fonte**: Poly Pizza  
- **URL**: https://poly.pizza/m/fCiJW5Qdgbf
- **Stato**: ✅ Attivo con props ambientali

### 🔄 Laboratory (Laboratorio) - Procedurale Enhanced
- **Stato**: Geometria procedurale + props realistici
- **Modelli consigliati da Poly Pizza**:
  - Lab Equipment: https://poly.pizza/m/fSWYfMERNak
  - Lab Desk: https://poly.pizza/m/6KxaD6I6I48
- **Per attivare GLTF**: Scaricare modello → rinominare in `laboratory.glb` → decommentare in `scenarios3d.ts`

### 🔄 Office (Ufficio) - Procedurale Enhanced
- **Stato**: Geometria procedurale + props realistici
- **Modelli consigliati da Poly Pizza**:
  - Computer Desk: https://poly.pizza/m/4U4lI91VbsO
  - Office Pack (bundle): https://poly.pizza/bundle/Office-Pack-UGIy7YcQP9
- **Per attivare GLTF**: Scaricare modello → rinominare in `office.glb` → decommentare in `scenarios3d.ts`

---

## Come Aggiungere Modelli GLTF Personalizzati

### Passo 1: Scaricare il Modello

1. Vai su Poly Pizza: https://poly.pizza/
2. Cerca modelli per:
   - Laboratory: "lab", "laboratory equipment", "science"
   - Office: "office", "desk", "computer desk", "workplace"
3. Clicca sul modello desiderato
4. Clicca "Download" e seleziona formato **GLTF** o **GLB**

### Passo 2: Aggiungere il File al Progetto

1. Rinominare il file scaricato:
   - Per laboratorio: `laboratory.glb`
   - Per ufficio: `office.glb`
2. Copiare il file nella cartella: `public/models/`

### Passo 3: Attivare il Modello nel Codice

Aprire il file `src/data/scenarios3d.ts` e modificare:

```typescript
// Per Laboratory:
{
  id: 'laboratory',
  // ...
  useGLTFModel: true,  // Cambiare da false a true
  gltfModelPath: '/models/laboratory.glb', // Decommentare
  // ...
}

// Per Office:
{
  id: 'office',
  // ...
  useGLTFModel: true,  // Cambiare da false a true
  gltfModelPath: '/models/office.glb', // Decommentare
  // ...
}
```

### Passo 4: Testare

1. Riavviare l'applicazione
2. Selezionare lo scenario Laboratory o Office
3. Il modello GLTF verrà caricato automaticamente!

---

## Sistema di Illuminazione Atmosferica

Il sistema lighting è ora completamente dinamico per ogni scenario:

### Warehouse
- **Luci industriali** sospese con point lights realistiche
- **Tone**: Arancione/giallo caldo
- **Post-processing**: Saturazione aumentata per atmosfera industriale

### Construction/Factory
- **Luci da cantiere** diffuse
- **Tone**: Arancione/beige polveroso
- **Post-processing**: Vignettatura per effetto drammatico, color grading caldo

### Laboratory
- **Luci fluorescenti** a soffitto (6000K bianco freddo)
- **Tone**: Azzurro/bianco clinico
- **Post-processing**: Desaturazione leggera, tinta blu, alta precisione

### Office
- **Luci da soffitto** calde
- **Tone**: Bianco/giallo neutro
- **Post-processing**: Illuminazione bilanciata per ambiente professionale

---

## Props Ambientali Procedurali

Ogni scenario include ora props realistici generati automaticamente:

### Warehouse
- 8x Lampade industriali sospese con point lights
- 12x Cartelli di sicurezza (gialli/rossi)
- 25x Casse e pallet cargo con collisioni
- Illuminazione puntiforme realistica

### Construction
- 15x Barriere di sicurezza arancioni
- 8x Attrezzature da cantiere (cilindri metallici)
- Collisioni complete su tutti gli oggetti

### Laboratory
- 6x Banchi da laboratorio bianchi
- 20x Becher e cilindri trasparenti
- 6x Luci fluorescenti a soffitto con emissione
- Point lights per illuminazione scientifica

### Office
- 8x Scrivanie con monitor emissivi
- 8x Sedie da ufficio
- 4x Luci da soffitto sferiche con point lights
- Layout a griglia professionale

---

## Post-Processing Effects

Attivi automaticamente in base alla qualità grafica:

### Medium/High/Ultra Quality
- ✅ **Bloom**: Glow su elementi luminosi
- ✅ **Chromatic Aberration**: Effetto cinematico
- ✅ **Color Grading**: Specifico per scenario
- ✅ **Contrast & Exposure**: Ottimizzazione automatica
- ✅ **Vignette**: Su construction per drammaticità

### Ultra Quality Only
- ✅ **SSAO (Ambient Occlusion)**: Profondità e ombre realistiche
- ✅ **High-res shadows**: 2048x2048 shadow maps
- ✅ **Advanced bloom**: 64-kernel blur

---

## Ottimizzazioni Runtime

Il sistema include ottimizzazioni automatiche:

1. **Texture Scaling**: Risoluzione adattiva (512px → 4096px)
2. **Anisotropic Filtering**: Qualità texture basata su settings
3. **Shadow Quality**: Da 512x512 (low) a 2048x2048 (ultra)
4. **Mesh Freezing**: worldMatrix congelata per performance
5. **LOD System**: Dettagli scalano con qualità grafica

---

## Modelli Poly Pizza Alternativi Consigliati

### Per Laboratory:
- Beaker: https://poly.pizza/m/a6fAmpBmWHM
- Microscope: https://poly.pizza/search/microscope
- Chemical bottles: https://poly.pizza/search/bottle%20lab

### Per Office:
- Office Chair: https://poly.pizza/m/UfKvrZBK6C
- File Cabinet: https://poly.pizza/search/cabinet
- Coffee Machine: https://poly.pizza/search/coffee

### Per Warehouse (upgrades):
- Forklift: https://poly.pizza/search/forklift
- Pallet Jack: https://poly.pizza/search/pallet
- Industrial Shelving: https://poly.pizza/search/shelf

### Per Construction (upgrades):
- Excavator: https://poly.pizza/search/excavator
- Concrete Mixer: https://poly.pizza/search/mixer
- Scaffolding: https://poly.pizza/search/scaffold

---

## Troubleshooting

### Modello non carica
- Verificare che il file sia in formato `.glb` o `.gltf`
- Controllare che il percorso in `scenarios3d.ts` sia corretto
- Verificare console browser per errori di caricamento

### Performance basse
- Ridurre qualità grafica da impostazioni
- Disabilitare post-processing per modelli molto pesanti
- Usare modelli "low poly" da Poly Pizza

### Collisioni non funzionano
- Assicurarsi che `mesh.checkCollisions = true` sia impostato
- Verificare che il modello GLTF abbia geometria valida

---

## Risorse Utili

- **Poly Pizza**: https://poly.pizza/ (10,400+ modelli gratuiti)
- **Babylon.js Docs**: https://doc.babylonjs.com/
- **GLTF Validator**: https://github.khronos.org/glTF-Validator/
- **Blender** (per modificare modelli): https://www.blender.org/

---

**Creato per Safety Frontline - Sistema di Training VR Workplace Safety**
