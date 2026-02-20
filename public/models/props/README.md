# GLTF Props System

Sistema di caricamento Props GLTF aggiuntivi per gli scenari 3D di Safety Frontline.

## Struttura Directory

```
public/models/props/
├── forklift.glb         # Carrello elevatore
├── pallet-rack.glb      # Scaffalatura pallet
├── safety-cone.glb      # Cono di sicurezza
├── machine.glb          # Macchinario industriale
└── ... (altri Props)
```

## Come Aggiungere Nuovi Props

### 1. Scarica Modelli GLTF
Fonti raccomandate:
- **Poly Pizza**: https://poly.pizza (modelli industriali gratuiti)
- **Sketchfab**: https://sketchfab.com (cerca "safety equipment", "industrial")
- **TurboSquid**: https://www.turbosquid.com (modelli professionali)

### 2. Posiziona i File
Copia i file `.glb` o `.gltf` in questa cartella (`public/models/props/`)

### 3. Configura in `src/types/prop-config.ts`

```typescript
export const SCENARIO_PROPS: Record<string, PropConfig[]> = {
  warehouse: [
    {
      id: 'forklift_01',                      // ID univoco
      modelPath: '/models/props/forklift.glb', // Percorso relativo a public/
      position: [-8, 0, -10],                  // [x, y, z] coordinate
      rotation: [0, Math.PI / 4, 0],           // [x, y, z] rotazioni in radianti
      scale: 1.2,                              // Scala uniforme (o [x, y, z])
      enableCollisions: true,                  // Player può collider
      castShadows: true,                       // Proietta ombre
      receiveShadows: true,                    // Riceve ombre
    },
    // Aggiungi altri Props...
  ],
  // Altri scenari...
};
```

## Parametri PropConfig

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|--------------|-------------|
| `id` | string | ✅ | Identificatore univoco del prop |
| `modelPath` | string | ✅ | Percorso al file GLB/GLTF |
| `position` | [number, number, number] | ✅ | Coordinate X, Y, Z |
| `rotation` | [number, number, number] | ❌ | Rotazioni X, Y, Z (radianti) |
| `scale` | number \| [number, number, number] | ❌ | Scala uniforme o [scaleX, scaleY, scaleZ] |
| `enableCollisions` | boolean | ❌ | Abilita collisioni con player (default: false) |
| `castShadows` | boolean | ❌ | Proietta ombre su altre superfici (default: false) |
| `receiveShadows` | boolean | ❌ | Riceve ombre da altre mesh (default: false) |

## Ottimizzazione Performance

Il sistema applica automaticamente ottimizzazioni basate su qualità grafica:

- **Low Quality**: Ombre disabilitate, materiali semplificati
- **Medium Quality**: Ombre attive, ottimizzazioni moderate
- **High Quality**: Tutte le feature attive, dettaglio massimo
- **Ultra Quality**: Dettaglio massimo + effetti avanzati

### Best Practices:
1. **Dimensione File**: Mantieni i modelli sotto 5MB quando possibile
2. **Triangoli**: Preferisci modelli con <50k triangoli per buone performance
3. **Texture**: Usa texture compresse (max 2048x2048 per Props)
4. **Materiali**: Preferisci materiali PBR per realismo

## Gestione Errori

Se un modello non viene caricato:
- Verifica il percorso in `modelPath` (deve iniziare con `/models/props/`)
- Controlla che il file esista in `public/models/props/`
- Verifica la console browser per errori dettagliati
- Toast notification mostrerà quanti Props sono stati caricati/falliti

## Esempi Pronti

### 🎯 Modelli Industriali Consigliati - FONTI VERIFICATE:

#### 1. KENNEY.NL (⭐ RACCOMANDATO - CC0 Public Domain)
**City Kit (Industrial)** - 25 modelli industriali
- URL: https://kenney.nl/assets/city-kit-industrial
- Include: Factory buildings, chimneys, warehouse structures
- Formato: GLB, FBX, OBJ
- Licenza: CC0 (Public Domain)

**Conveyor Kit** - 60 modelli nastri trasportatori
- URL: https://kenney.nl/assets/conveyor-kit
- Include: Conveyor belts, industrial machinery, sorting systems
- Formato: GLB, FBX, OBJ
- Licenza: CC0 (Public Domain)

#### 2. POLY PIZZA (Varie licenze Creative Commons)
**Traffic Cone** (Quaternius)
- URL: https://poly.pizza/m/lAx8JytxGD
- Formato: FBX, GLTF
- Licenza: CC0 (Public Domain)

**Pallet with Boxes** (Colin McKibben)
- URL: https://poly.pizza/m/9TQMjCMu26x
- Formato: OBJ, GLTF
- Licenza: CC-BY (Attribution required)

**Truck** (jeremy)
- URL: https://poly.pizza/m/cPVFA5uTr9l
- Formato: OBJ, GLTF
- Licenza: CC-BY (Attribution required)

#### 3. QUATERNIUS.COM (CC0 Public Domain)
**Free Game Assets**
- URL: https://quaternius.com/
- Include: Buildings, vehicles, props
- Formato: FBX, OBJ, Blend
- Licenza: CC0 (Public Domain)

## Test

1. Aggiungi un Props in `SCENARIO_PROPS`
2. Avvia il gioco 3D
3. Verifica console per log `[PropLoader]`
4. Cerca il toast notification con risultato caricamento

## Supporto

Per problemi o domande sul sistema Props GLTF, consulta:
- Log console browser (`[PropLoader]`, `[BabylonScene]`)
- File `src/lib/babylon-prop-loader.ts` (logica caricamento)
- File `src/types/prop-config.ts` (configurazione Props)
