# Guida Pratica: Modalità Merge

## Cos'è la Modalità Merge?

La modalità **'merge'** combina:
- ✅ **Rischi manuali critici** - posizionati strategicamente dal designer
- ✅ **Rischi procedurali automatici** - generati dal sistema basandosi sulla geometria

È la configurazione **RACCOMANDATA per produzione** perché garantisce:
1. Controllo totale su obiettivi didattici chiave
2. Variabilità e rigiocabilità
3. Bilanciamento tra prevedibilità e scoperta

---

## Confronto Modalità

### Mode: 'replace' (Solo Procedurali)
```typescript
proceduralRisks: {
  enabled: true,
  mode: 'replace'
}
risks: [] // Vuoto
```

✅ **Pro**:
- Zero configurazione manuale
- Rapido da implementare
- Sempre adattato alla geometria modello

❌ **Contro**:
- Nessun controllo su rischi specifici
- Posizioni non ottimali didatticamente
- Difficile garantire presenza pericoli critici

**Uso**: Test, prototipi, sviluppo rapido

---

### Mode: 'merge' (Ibrido) ⭐ RACCOMANDATO

```typescript
proceduralRisks: {
  enabled: true,
  mode: 'merge',
  config: {
    minDensityThreshold: 0.4 // Alta per evitare overlap
  }
}
risks: [
  // Rischi critici manuali qui
]
```

✅ **Pro**:
- Controllo totale su rischi life-threatening
- Variabilità automatica per rigiocabilità
- Mix ottimale didattica + esplorazione
- Facile aggiungere/modificare rischi critici

❌ **Contro**:
- Richiede configurazione iniziale
- Necessita testing per bilanciamento

**Uso**: Scenari di produzione, training formale

---

## Esempio Completo: Warehouse

### Step 1: Identificare Rischi Critici

Domande da porsi:
- ❓ Quali sono i pericoli **mortali**?
- ❓ Quali rischi sono **obbligatori per legge**?
- ❓ Cosa voglio che il giocatore **trovi sempre**?

**Risposta per Warehouse**:
1. 🚨 Estintore bloccato (obbligatorio legge)
2. 🚨 Uscita emergenza ostruita (obbligatorio legge)
3. 🔥 Materiale infiammabile esposto (life-threatening)
4. ⚠️ Carrello elevatore incustodito (high risk)

### Step 2: Configurazione Scenario

```typescript
{
  id: 'warehouse',
  type: 'warehouse',
  title: 'Magazzino Logistica',
  description: 'Magazzino industriale con movimentazione merci',
  difficulty: 'medium',
  useGLTFModel: true,
  gltfModelPath: '/models/warehouse.glb',
  
  // ⭐ CONFIGURAZIONE MERGE MODE
  proceduralRisks: {
    enabled: true,
    mode: 'merge', // Combina manuale + procedurale
    config: {
      gridSize: 3,
      minDensityThreshold: 0.4, // ⚠️ Alta per ridurre overlap
    },
  },
  
  // 🎯 RISCHI MANUALI CRITICI (4)
  risks: [
    {
      id: 'manual_1',
      position: [0, 1.2, -12],
      found: false,
      label: '🚨 Estintore bloccato',
      description: 'CRITICO: Estintore non accessibile - dispositivo antincendio ostruito da casse',
      severity: 'critical',
    },
    {
      id: 'manual_2',
      position: [15, 0.8, -3],
      found: false,
      label: '🚨 Uscita emergenza ostruita',
      description: 'CRITICO: Via di fuga bloccata - uscita di sicurezza inaccessibile',
      severity: 'critical',
    },
    {
      id: 'manual_3',
      position: [-5, 1.5, 5],
      found: false,
      label: '🔥 Materiale infiammabile esposto',
      description: 'CRITICO: Prodotti chimici pericolosi stoccati senza protezione',
      severity: 'critical',
    },
    {
      id: 'manual_4',
      position: [-12, 0.5, -8],
      found: false,
      label: '⚠️ Carrello elevatore incustodito',
      description: 'ALTO RISCHIO: Muletto operativo con chiavi inserite lasciato senza controllo',
      severity: 'high',
    },
    // 🤖 Il sistema aggiungerà automaticamente ~4 rischi procedurali:
    // - Bancali instabili
    // - Transpallet abbandonati
    // - Pavimento scivoloso
    // - Aree congestionate
    // - Materiali sparsi
  ],
  
  environment: {
    lightingIntensity: 0.6,
    ambientColor: '#fff5e6',
    fogDensity: 0.01,
  },
  audio: {
    ambient: { type: 'warehouse', volume: 0.4 }
  }
}
```

### Step 3: Testing e Bilanciamento

#### 3.1 Attivare Debug Mode
Premi **'B'** durante il gioco per visualizzare:
- Box giallo = bounding box modello
- Sfere rosse = rischi (manuali + procedurali)
- Label = identificativo rischio

#### 3.2 Verificare Distribuzione

**Target per Warehouse Medium**:
- 4 rischi manuali critici ✅
- 3-5 rischi procedurali generici ✅
- Totale: 7-9 rischi

**Se troppi rischi procedurali**:
```typescript
minDensityThreshold: 0.5, // Aumenta soglia (era 0.4)
```

**Se troppo pochi rischi procedurali**:
```typescript
minDensityThreshold: 0.3, // Abbassa soglia (era 0.4)
```

#### 3.3 Controllare Overlap

Verifica che rischi procedurali NON si sovrappongano a quelli manuali.

**Se c'è overlap**:
1. Aumenta `minDensityThreshold` → meno rischi procedurali
2. Aumenta `gridSize` → griglia più larga, meno densa
3. Sposta rischi manuali in posizioni più isolate

---

## Esempio Avanzato: Construction

```typescript
{
  id: 'construction',
  type: 'construction',
  title: 'Cantiere Edile',
  difficulty: 'hard',
  useGLTFModel: true,
  gltfModelPath: '/models/factory.glb',
  
  proceduralRisks: {
    enabled: true,
    mode: 'merge',
    config: {
      gridSize: 4,              // Griglia più larga (modello scale=8)
      minDensityThreshold: 0.4, // Soglia standard per hard scenario
    },
  },
  
  // 🎯 6 RISCHI MANUALI CRITICI (life-threatening)
  risks: [
    {
      id: 'manual_1',
      position: [8, 2.5, -5],
      label: '🚨 Carico sospeso senza delimitazione',
      description: 'CRITICO: Attrezzatura appesa senza area di sicurezza - rischio caduta oggetti',
      severity: 'critical',
    },
    {
      id: 'manual_2',
      position: [-15, 3, -2],
      label: '⚡ Cavi elettrici esposti',
      description: 'CRITICO: Linee elettriche di cantiere danneggiate - rischio folgorazione',
      severity: 'critical',
    },
    {
      id: 'manual_3',
      position: [12, 0.5, 3],
      label: '🪖 Operatore senza DPI obbligatori',
      description: 'CRITICO: Lavoratore in zona ad alto rischio senza dispositivi di protezione',
      severity: 'critical',
    },
    {
      id: 'manual_4',
      position: [5, 0.3, -12],
      label: '🕳️ Scavo profondo non protetto',
      description: 'CRITICO: Trincea senza parapetti di sicurezza - rischio caduta',
      severity: 'critical',
    },
    {
      id: 'manual_5',
      position: [-8, 3.5, 5],
      label: '🏗️ Ponteggio instabile',
      description: 'CRITICO: Struttura temporanea non ancorata - rischio crollo',
      severity: 'critical',
    },
    {
      id: 'manual_6',
      position: [-5, 1.2, -10],
      label: '⚠️ Scala danneggiata in uso',
      description: 'ALTO RISCHIO: Attrezzatura di accesso con gradini rotti',
      severity: 'high',
    },
    // 🤖 Il sistema aggiungerà automaticamente ~6 rischi procedurali:
    // - Materiali edili sparsi
    // - Betoniera incustodita
    // - Contenitori non etichettati
    // - Aree senza delimitazione
    // - Zone congestionate
    // - Stoccaggio improprio
  ]
}
```

**Target per Construction Hard**:
- 6 rischi manuali critici ✅
- 5-7 rischi procedurali generici ✅
- Totale: 11-13 rischi

---

## Best Practices

### 1. Emoji nei Label Manuali

Usa emoji per evidenziare visivamente i rischi critici:

```typescript
'🚨 Uscita emergenza ostruita'  // Critical - emergenza
'⚡ Cavi elettrici esposti'      // Critical - elettrico
'🔥 Materiale infiammabile'      // Critical - incendio
'🪖 Operatore senza DPI'         // Critical - protezioni
'🕳️ Scavo non protetto'          // Critical - caduta
'⚠️ Attrezzatura abbandonata'    // High risk
```

### 2. Descrizioni Esplicite

Struttura descrizioni manuali:
```
[LIVELLO]: [Pericolo specifico] - [Conseguenza]
```

Esempi:
- ✅ `CRITICO: Estintore bloccato - impossibile spegnere incendio`
- ✅ `ALTO RISCHIO: Scala rotta - rischio caduta da 3 metri`
- ❌ `Problema con scala` (troppo vago)

### 3. Distribuzione Severità

**Rischi Manuali** (controllati):
- 70% `critical` - pericoli mortali/obbligatori legge
- 30% `high` - rischi gravi ma non immediati

**Rischi Procedurali** (automatici):
- 20% `critical` - zone molto dense
- 30% `high` - zone dense
- 30% `medium` - zone medio-dense
- 20% `low` - housekeeping generale

### 4. Testing Checklist

Dopo configurazione merge mode:

- [ ] Giocare scenario 3 volte per verificare variabilità procedurali
- [ ] Verificare tutti i rischi manuali sono sempre presenti
- [ ] Controllare totale rischi rientra in target (7-9 medium, 11-13 hard)
- [ ] Verificare nessun overlap visibile tra manuali e procedurali
- [ ] Testare bilanciamento difficoltà (troppo facile/difficile?)
- [ ] Confermare rischi procedurali sono contestualmente appropriati

---

## Troubleshooting Merge Mode

### Problema: Troppi rischi procedurali che coprono i manuali

**Causa**: `minDensityThreshold` troppo basso

**Soluzione**:
```typescript
minDensityThreshold: 0.5, // Era 0.3 → aumenta
```

---

### Problema: Nessun rischio procedurale generato

**Causa**: `minDensityThreshold` troppo alto o modello poco denso

**Soluzione**:
```typescript
minDensityThreshold: 0.25, // Era 0.4 → abbassa
gridSize: 2.5,              // Era 3 → riduci per analisi più fine
```

---

### Problema: Rischi procedurali in posizioni identiche ai manuali

**Causa**: Rischi manuali posizionati in zone ad altissima densità

**Soluzione**:
1. Sposta rischi manuali leggermente (±2 unità)
2. Aumenta `minDensityThreshold` per ridurre candidati procedurali
3. Usa `gridSize` più grande per griglia meno fitta

---

### Problema: Difficoltà scenario troppo alta/bassa

**Causa**: Bilanciamento rischi non ottimale

**Soluzione per ridurre difficoltà**:
```typescript
minDensityThreshold: 0.5, // Meno rischi procedurali
risks: [
  // Ridurre rischi manuali a solo i più critici (3-4)
]
```

**Soluzione per aumentare difficoltà**:
```typescript
minDensityThreshold: 0.3, // Più rischi procedurali
risks: [
  // Aggiungere più rischi manuali (6-8)
]
```

---

## Workflow Completo

### 1. Design (30 min)
- Studia normativa sicurezza per scenario
- Identifica 4-6 rischi critici obbligatori
- Scegli posizioni strategiche (non ovvie, ma raggiungibili)

### 2. Implementazione (15 min)
- Copia template merge mode
- Configura `proceduralRisks` con soglia iniziale 0.4
- Inserisci rischi manuali con emoji e descrizioni

### 3. Testing (45 min)
- Gioca scenario 5 volte
- Attiva debug mode per visualizzare distribuzione
- Annota numero rischi procedurali generati
- Verifica bilanciamento e overlap

### 4. Tuning (30 min)
- Aggiusta `minDensityThreshold` per target rischi
- Sposta rischi manuali se necessario
- Rigioca per conferma finale
- Documenta configurazione finale

**Tempo totale**: ~2 ore per scenario production-ready

---

## Risorse

- [PROCEDURAL_RISKS.md](./PROCEDURAL_RISKS.md) - Documentazione completa sistema
- [TEST.md](./TEST.md) - Guida testing e debug mode
- [OPTIMIZATION_LOG.md](./OPTIMIZATION_LOG.md) - Log ottimizzazioni

---

## Supporto

Per domande su merge mode o configurazione scenari:
- Consulta esempi in `src/data/scenarios3d.ts`
- Usa debug mode (tasto 'B') per analisi visiva
- Controlla console logs per metriche generazione
