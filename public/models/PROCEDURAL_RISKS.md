# Sistema di Generazione Procedurale dei Rischi

## Panoramica

Il sistema di generazione procedurale analizza automaticamente i modelli GLTF/GLB per identificare zone ad alta densità di oggetti e posizionare i rischi di sicurezza in modo intelligente basandosi sulla geometria del modello.

## Come Funziona

### 1. Analisi Spaziale

Il sistema divide il modello in una griglia 3D e analizza ogni cella per:

- **Mesh Count**: Numero di oggetti 3D nella cella
- **Vertex Count**: Numero totale di vertici nella cella
- **Density Score**: Punteggio combinato normalizzato (0-1)

Formula densità:
```
density = (meshDensity * 0.6) + (vertexDensity * 0.4)
```

### 2. Selezione Zone ad Alto Rischio

Le celle vengono ordinate per densità e viene selezionato il **40% delle zone ad alta densità** (sopra soglia minima) per il posizionamento dei rischi.

### 3. Generazione Contestuale dei Rischi

I rischi generati includono:

- **Label**: Descrizione breve del pericolo
- **Description**: Dettaglio del rischio con menzione della densità se elevata
- **Severity**: Livello di gravità influenzato dalla densità della zona
  - `critical`: 20% base + bonus densità
  - `high`: 30% base + bonus densità
  - `medium`: 30% base
  - `low`: 20% base

### 4. Template Rischi per Severità

#### Critical
- Area ad alto rischio
- Sovraccarico strutturale
- Percorso di evacuazione bloccato

#### High
- Disordine pericoloso
- Attrezzatura non messa in sicurezza
- Rischio inciampo

#### Medium
- Area congestionata
- Stoccaggio improprio
- Visibilità ridotta

#### Low
- Disordine lieve
- Housekeeping insufficiente

## Configurazione negli Scenari

### Struttura Dati

```typescript
interface Scenario3D {
  // ... altri campi
  proceduralRisks?: {
    enabled: boolean;
    mode: 'replace' | 'merge';
    config?: {
      gridSize?: number;           // Default: 3 unità
      minDensityThreshold?: number; // Default: 0.3 (30%)
      maxRisksPerZone?: number;     // Default: 2
    };
  };
}
```

### Modalità

#### `replace` (Sostituzione)
Sostituisce completamente i rischi manuali con quelli procedurali.

```typescript
proceduralRisks: {
  enabled: true,
  mode: 'replace',
  config: {
    gridSize: 3,
    minDensityThreshold: 0.3,
  }
}
```

**Uso consigliato**: Test iniziali, scenari senza rischi manuali definiti.

#### `merge` (Combinazione)
Combina i rischi procedurali con quelli manuali predefiniti.

```typescript
proceduralRisks: {
  enabled: true,
  mode: 'merge',
  config: {
    gridSize: 4,
    minDensityThreshold: 0.35,
  }
}
```

**Uso consigliato**: Scenari con rischi manuali specifici + generazione automatica di ulteriori pericoli.

## Parametri di Configurazione

### `gridSize` (Dimensione Griglia)

Dimensione di ogni cella di analisi in unità world.

- **Valore piccolo** (1-2): Analisi più fine, più rischi potenziali
- **Valore medio** (3-4): Bilanciamento qualità/performance
- **Valore grande** (5+): Analisi grossolana, meno rischi

**Raccomandazioni per scala modello**:
- Warehouse (scale=5): `gridSize: 3`
- Construction (scale=8): `gridSize: 4`

### `minDensityThreshold` (Soglia Minima Densità)

Densità minima richiesta per considerare una zona ad alto rischio (0.0 - 1.0).

- **0.2-0.3**: Più rischi, anche in zone medio-dense
- **0.3-0.4**: Bilanciamento (consigliato)
- **0.5+**: Solo zone molto dense, meno rischi

### `maxRisksPerZone` (Rischi Massimi per Zona)

Numero massimo di rischi da generare per singola zona ad alta densità.

- **1**: Un rischio per zona (default consigliato)
- **2+**: Rischi multipli in zone molto dense

## Esempi di Configurazione

### Warehouse con Mode 'merge' (PRODUZIONE) ⭐

```typescript
{
  id: 'warehouse',
  type: 'warehouse',
  title: 'Magazzino Logistica',
  useGLTFModel: true,
  gltfModelPath: '/models/warehouse.glb',
  proceduralRisks: {
    enabled: true,
    mode: 'merge', // ⭐ Combinazione rischi critici + procedurali
    config: {
      gridSize: 3,
      minDensityThreshold: 0.4, // Soglia alta per evitare overlap
    }
  },
  risks: [
    // Rischi manuali CRITICI - posizioni strategiche fisse
    {
      id: 'manual_1',
      position: [0, 1.2, -12],
      label: '🚨 Estintore bloccato',
      description: 'CRITICO: Estintore inaccessibile - dispositivo antincendio ostruito',
      severity: 'critical',
    },
    {
      id: 'manual_2',
      position: [15, 0.8, -3],
      label: '🚨 Uscita emergenza ostruita',
      description: 'CRITICO: Via di fuga bloccata - uscita di sicurezza inaccessibile',
      severity: 'critical',
    },
    {
      id: 'manual_3',
      position: [-5, 1.5, 5],
      label: '🔥 Materiale infiammabile esposto',
      description: 'CRITICO: Prodotti chimici pericolosi senza protezione',
      severity: 'critical',
    },
    // I rischi procedurali verranno aggiunti automaticamente
    // per pericoli generici come disordine, attrezzature abbandonate, ecc.
  ]
}
```

### Construction con Mode 'merge' (PRODUZIONE) ⭐

```typescript
{
  id: 'construction',
  type: 'construction',
  title: 'Cantiere Edile',
  useGLTFModel: true,
  gltfModelPath: '/models/factory.glb',
  proceduralRisks: {
    enabled: true,
    mode: 'merge', // ⭐ Combinazione rischi life-threatening + procedurali
    config: {
      gridSize: 4,
      minDensityThreshold: 0.4,
    }
  },
  risks: [
    // Rischi manuali CRITICI - pericoli mortali in posizioni specifiche
    {
      id: 'manual_1',
      position: [8, 2.5, -5],
      label: '🚨 Carico sospeso senza delimitazione',
      description: 'CRITICO: Attrezzatura appesa senza area di sicurezza',
      severity: 'critical',
    },
    {
      id: 'manual_2',
      position: [-15, 3, -2],
      label: '⚡ Cavi elettrici esposti',
      description: 'CRITICO: Linee elettriche danneggiate - rischio folgorazione',
      severity: 'critical',
    },
    {
      id: 'manual_3',
      position: [12, 0.5, 3],
      label: '🪖 Operatore senza DPI',
      description: 'CRITICO: Lavoratore senza dispositivi di protezione',
      severity: 'critical',
    },
    {
      id: 'manual_4',
      position: [5, 0.3, -12],
      label: '🕳️ Scavo non protetto',
      description: 'CRITICO: Trincea profonda senza parapetti',
      severity: 'critical',
    },
    // Rischi procedurali aggiungeranno automaticamente:
    // - Materiali sparsi, attrezzature abbandonate
    // - Zone congestionate, stoccaggio improprio
    // - Housekeeping generale, visibilità ridotta
  ]
}
```

### Warehouse Mode 'replace' (TEST/PROTOTIPO)

```typescript
{
  id: 'warehouse-test',
  useGLTFModel: true,
  gltfModelPath: '/models/warehouse.glb',
  proceduralRisks: {
    enabled: true,
    mode: 'replace', // Solo procedurali per test rapido
    config: {
      gridSize: 3,
      minDensityThreshold: 0.3,
    }
  },
  risks: [] // Vuoto - tutto procedurale
}
```

## Filosofia del Design: Merge Mode

### Perché Mode 'merge' è Raccomandato

La modalità **'merge'** rappresenta il miglior compromesso tra:

1. **Controllo Didattico**: Garantisce che rischi critici chiave siano sempre presenti nelle posizioni ottimali per l'apprendimento

2. **Variabilità Dinamica**: Aggiunge rischi procedurali che cambiano ad ogni sessione, aumentando la rigiocabilità

3. **Realismo**: Combina pericoli gravi prevedibili (es: uscita bloccata) con situazioni impreviste (disordine variabile)

4. **Scalabilità**: Facile aggiungere nuovi rischi manuali critici senza riscrivere tutto

### Workflow Raccomandato

#### Fase 1: Identificare Rischi Critici
Domande guida:
- Quali sono i pericoli **life-threatening**?
- Quali rischi sono **obbligatori per legge** (uscite, estintori)?
- Quali situazioni voglio che i giocatori **trovino sempre**?

Esempi:
- Uscite di emergenza bloccate
- Dispositivi antincendio inaccessibili
- Operatori senza DPI obbligatori
- Cavi elettrici scoperti
- Scavi/ponteggi non protetti

#### Fase 2: Posizionare Manualmente
- Usa modalità debug (tasto **'B'**) per visualizzare coordinate
- Posiziona rischi critici in zone visibili ma non ovvie
- Testa navigazione giocatore verso questi punti
- Verifica che siano raggiungibili e identificabili

#### Fase 3: Configurare Procedurali
- Imposta `minDensityThreshold` alto (0.4-0.5) per zone dense
- Usa `gridSize` appropriato alla scala modello
- Lascia che il sistema riempia "gaps" con rischi generici

#### Fase 4: Testing Bilanciamento
- Gioca lo scenario 3-5 volte
- Verifica mix critico/generico sia bilanciato
- Aggiusta soglia se troppi/pochi rischi procedurali
- Conferma rischi manuali sempre visibili

### Distribuzione Tipica (Mode 'merge')

**Scenario Warehouse Medium (8 rischi totali)**:
- 4 rischi manuali critici (50%)
- 4 rischi procedurali generici (50%)

**Scenario Construction Hard (12 rischi totali)**:
- 6 rischi manuali critici (50%)
- 6 rischi procedurali generici (50%)

Questa distribuzione 50/50 garantisce:
- Focus su pericoli chiave
- Sufficiente variabilità
- Difficoltà progressiva equilibrata

## Debugging e Testing

### Visualizzazione Debug (Tasto B)

Premere **'B'** durante il gameplay per attivare la modalità debug che visualizza:

1. **Bounding box modello** (wireframe giallo)
2. **Posizioni rischi** (sfere rosse + label)
3. **Dimensioni modello** (width, height, depth)
4. **Spawn point giocatore** (box blu wireframe)

### Console Logs

Il sistema emette log dettagliati per l'analisi:

```
[ProceduralRisk] Starting model analysis...
[ProceduralRisk] Model bounds: { width: X, height: Y, depth: Z }
[ProceduralRisk] Creating grid: { cellsX: X, cellsZ: Z, totalCells: N }
[ProceduralRisk] Density analysis: { totalMeshes: N, totalVertices: M }
[ProceduralRisk] High-density cells found: N
[ProceduralRisk] Analysis complete: { gridCells: N, risksGenerated: M, analysisTime: Xms }
[GLTF] Generated procedural risks: N
```

### Toast Notifications

Il sistema mostra notifiche toast per:

- Caricamento modello completato (mesh count, triangoli, tempo)
- Generazione rischi procedurali completata (numero rischi)

## Performance

### Ottimizzazioni Implementate

1. **Analisi una tantum**: L'analisi avviene solo al caricamento del modello
2. **Grid-based**: Divide lo spazio per evitare calcoli O(n²)
3. **Normalizzazione**: Densità normalizzata per confronto efficiente

### Performance Tipiche

- **Warehouse (5k triangoli)**: ~10-20ms analisi
- **Factory (15k triangoli)**: ~30-50ms analisi

## Limitazioni Note

1. **Solo oggetti statici**: Analizza solo la geometria statica del modello
2. **Altezza fissa**: Rischi posizionati a `heightOffset` configurabile (default: 0.5)
3. **Griglia 2D**: Analisi su piano XZ, non considera variazioni verticali complesse
4. **Template limitati**: Usa template predefiniti per label/description

## Sviluppi Futuri

### Possibili Miglioramenti

1. **Machine Learning**: Classificazione automatica tipo rischio basata su geometria
2. **Analisi semantica**: Riconoscimento oggetti specifici (estintori, uscite)
3. **Clustering 3D**: Analisi densità anche su asse Y per edifici multi-piano
4. **Weighted Zones**: Priorità diverse per zone critiche (uscite, passaggi)
5. **Temporal Variation**: Generazione dinamica rischi durante sessione

## API Reference

### ProceduralRiskGenerator Class

```typescript
class ProceduralRiskGenerator {
  constructor(config?: Partial<ProceduralRiskConfig>)
  
  analyzeModel(scene: THREE.Object3D): Risk3D[]
}
```

### generateProceduralRisks Function

```typescript
function generateProceduralRisks(
  scene: THREE.Object3D,
  config?: Partial<ProceduralRiskConfig>
): Risk3D[]
```

**Esempio d'uso**:

```typescript
import { generateProceduralRisks } from '@/lib/procedural-risk-generator';

const risks = generateProceduralRisks(gltfScene, {
  gridSize: 3,
  minDensityThreshold: 0.3,
  heightOffset: 0.8,
});
```

## Troubleshooting

### Problema: Nessun rischio generato

**Causa**: Soglia densità troppo alta o modello con pochi oggetti.

**Soluzione**: Ridurre `minDensityThreshold` a 0.2-0.25.

### Problema: Troppi rischi generati

**Causa**: Soglia densità troppo bassa o `gridSize` troppo piccolo.

**Soluzione**: 
- Aumentare `minDensityThreshold` a 0.4-0.5
- Aumentare `gridSize` a 4-5

### Problema: Rischi posizionati male

**Causa**: Scala modello non corrispondente a `gridSize`.

**Soluzione**: Adattare `gridSize` alla scala del modello:
```
gridSize_consigliato = 3 * model_scale / 5
```

### Problema: Performance lente

**Causa**: Modello molto complesso o `gridSize` troppo piccolo.

**Soluzione**:
- Aumentare `gridSize` per ridurre numero celle
- Ottimizzare modello GLTF (ridurre triangoli)

## Credits

Sistema sviluppato per Safety Frontline - Piattaforma di formazione gamificata sulla sicurezza sul lavoro.

**Versione**: 1.0.0  
**Data**: 2025-01-28
