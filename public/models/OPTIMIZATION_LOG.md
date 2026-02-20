# Log Ottimizzazione Posizioni Rischi - Modelli GLTF

## Data Ottimizzazione
2025-11-28

## Scenario: Warehouse (Magazzino Logistica)

### Configurazione Modello
- **File**: `/models/warehouse.glb`
- **Scala applicata**: 5x
- **Dimensioni stimate**: ~50 unità di gioco (dopo scala)

### Rischi Ottimizzati (8 totali)

#### 1. Bancale instabile
- **Posizione**: `[-8, 0.5, -2]`
- **Zona**: Laterale sinistra, vicino scaffalature
- **Altezza**: Pavimento (0.5m)
- **Rationale**: Posizionato vicino area di stoccaggio pallet tipica

#### 2. Transpallet abbandonato
- **Posizione**: `[0, 0.3, -5]`
- **Zona**: Centro corridoio principale
- **Altezza**: Pavimento (0.3m)
- **Rationale**: Ostruzione in corsia centrale di transito

#### 3. Scaffalatura sovraccarica
- **Posizione**: `[10, 2.8, -6]`
- **Zona**: Laterale destra, scaffali alti
- **Altezza**: Alto (2.8m, terzo ripiano)
- **Rationale**: Scaffali industriali tipicamente 3-4m di altezza

#### 4. Carrello elevatore senza controllo
- **Posizione**: `[-12, 0.5, -8]`
- **Zona**: Zona operativa posteriore sinistra
- **Altezza**: Pavimento (0.5m)
- **Rationale**: Area di lavoro muletti laterale

#### 5. Pavimento scivoloso
- **Posizione**: `[6, 0.3, 3]`
- **Zona**: Corridoio anteriore destro
- **Altezza**: Pavimento (0.3m)
- **Rationale**: Zona di passaggio frequente

#### 6. Materiale infiammabile non protetto
- **Posizione**: `[-5, 1.5, 5]`
- **Zona**: Scaffale medio anteriore sinistro
- **Altezza**: Medio (1.5m, secondo ripiano)
- **Rationale**: Stoccaggio prodotti chimici su scaffalature

#### 7. Corsia di evacuazione ostruita
- **Posizione**: `[15, 0.8, -3]`
- **Zona**: Uscita di emergenza laterale destra
- **Altezza**: Pavimento (0.8m, altezza casse)
- **Rationale**: Porta di emergenza tipicamente su pareti laterali

#### 8. Estintore bloccato
- **Posizione**: `[0, 1.2, -12]`
- **Zona**: Parete posteriore centrale
- **Altezza**: Medio (1.2m, altezza estintore)
- **Rationale**: Estintori montati a parete a 1-1.5m

### Distribuzione Spaziale
- **Anteriore** (Z > 0): 2 rischi
- **Centrale** (Z tra -6 e 0): 3 rischi
- **Posteriore** (Z < -6): 3 rischi
- **Sinistra** (X < 0): 3 rischi
- **Centro** (X tra -3 e 3): 2 rischi
- **Destra** (X > 3): 3 rischi

### Distribuzione Altezza
- **Pavimento** (0-1m): 5 rischi
- **Medio** (1-2m): 2 rischi
- **Alto** (>2m): 1 rischio

---

## Scenario: Construction (Cantiere Edile)

### Configurazione Modello
- **File**: `/models/factory.glb`
- **Scala applicata**: 8x
- **Dimensioni stimate**: ~80 unità di gioco (dopo scala)
- **Uso**: Ambiente industriale/cantiere

### Rischi Ottimizzati (10 totali)

#### 1. Materiali edili sparsi
- **Posizione**: `[-10, 0.3, 4]`
- **Zona**: Anteriore sinistra
- **Altezza**: Pavimento
- **Rationale**: Deposito materiali edili disordinato

#### 2. Attrezzatura sospesa
- **Posizione**: `[8, 2.5, -5]`
- **Zona**: Centro-destra, alto
- **Altezza**: Alto (2.5m)
- **Rationale**: Gru/paranchi per sollevamento carichi

#### 3. Macchinario in funzione incustodito
- **Posizione**: `[0, 0.8, -8]`
- **Zona**: Centro posteriore
- **Altezza**: Pavimento/basamento
- **Rationale**: Betoniera o altri macchinari centrali

#### 4. Cavi elettrici aerei esposti
- **Posizione**: `[-15, 3, -2]`
- **Zona**: Laterale sinistro, alto
- **Altezza**: Alto (3m)
- **Rationale**: Linee elettriche temporanee aeree

#### 5. Operatore senza DPI
- **Posizione**: `[12, 0.5, 3]`
- **Zona**: Anteriore destra
- **Altezza**: Pavimento (altezza persona)
- **Rationale**: Lavoratore in zona operativa

#### 6. Scala danneggiata
- **Posizione**: `[-5, 1.2, -10]`
- **Zona**: Posteriore sinistra
- **Altezza**: Medio (scala appoggiata)
- **Rationale**: Scala in uso per accesso verticale

#### 7. Area senza delimitazione
- **Posizione**: `[18, 0.5, -6]`
- **Zona**: Estremo laterale destro
- **Altezza**: Pavimento
- **Rationale**: Zona pericolosa ai margini del cantiere

#### 8. Scavo non protetto
- **Posizione**: `[5, 0.3, -12]`
- **Zona**: Posteriore centro-destra
- **Altezza**: Pavimento (bordo scavo)
- **Rationale**: Trincea o buca nel terreno

#### 9. Ponteggio instabile
- **Posizione**: `[-8, 3.5, 5]`
- **Zona**: Anteriore sinistra, molto alto
- **Altezza**: Alto (3.5m, piano ponteggio)
- **Rationale**: Struttura temporanea per lavori in altezza

#### 10. Contenitori non etichettati
- **Posizione**: `[3, 1, 8]`
- **Zona**: Anteriore centro-destra
- **Altezza**: Medio (fusti su pallet)
- **Rationale**: Deposito temporaneo sostanze chimiche

### Distribuzione Spaziale
- **Anteriore** (Z > 0): 4 rischi
- **Centrale** (Z tra -8 e 0): 3 rischi
- **Posteriore** (Z < -8): 3 rischi
- **Sinistra** (X < 0): 4 rischi
- **Centro** (X tra -5 e 5): 3 rischi
- **Destra** (X > 5): 3 rischi

### Distribuzione Altezza
- **Pavimento** (0-1m): 5 rischi
- **Medio** (1-2.5m): 3 rischi
- **Alto** (>2.5m): 2 rischi

---

## Criteri di Ottimizzazione Applicati

### 1. Realismo Industriale
- Posizioni basate su scenari reali di magazzino/cantiere
- Rischi distribuiti in zone tipiche di pericolo
- Altezze coerenti con elementi fisici (scaffali, macchinari, ponteggi)

### 2. Giocabilità
- Distribuzione equilibrata su tutto lo spazio di gioco
- Varietà di altezze per coinvolgere esplorazione verticale
- Nessun rischio troppo vicino allo spawn (0,0,0)
- Distanza minima tra rischi: ~3-5 unità

### 3. Accessibilità
- Tutti i rischi raggiungibili senza attraversare muri
- Posizioni chiare e visibili (non nascoste)
- Compatibili con sistema di collision detection

### 4. Bilanciamento Difficoltà
**Warehouse (Medium)**:
- 8 rischi totali
- 4 critical, 2 high, 2 medium
- Spazio più contenuto (~50 unità)

**Construction (Hard)**:
- 10 rischi totali
- 5 critical, 4 high, 1 medium
- Spazio più ampio (~80 unità)
- Maggiore varietà di pericoli

---

## Note per Futuri Aggiustamenti

### Se i modelli GLTF risultano più grandi/piccoli del previsto:
1. Attiva modalità debug (premi B in-game)
2. Osserva bounding box verde e dimensioni visualizzate
3. Confronta con posizioni rischi (marker rossi)
4. Scala i valori X, Y, Z proporzionalmente

### Formula di conversione scala:
```
nuova_scala = scala_attuale * (dimensione_desiderata / dimensione_attuale)
```

### Formula posizione dopo cambio scala:
```
nuova_posizione = posizione_attuale * (nuova_scala / scala_attuale)
```

### Esempio pratico:
Se il warehouse è troppo piccolo e vuoi raddoppiare la scala da 5 a 10:
```
Rischio 1: [-8, 0.5, -2] diventa [-16, 1, -4]
Rischio 2: [0, 0.3, -5] diventa [0, 0.6, -10]
...etc
```

---

## Testing Checklist

- [ ] Tutti i rischi sono visibili nel modello
- [ ] Nessun rischio è fuori dal modello o nel vuoto
- [ ] I rischi sono distribuiti uniformemente
- [ ] Le altezze corrispondono a elementi fisici realistici
- [ ] Non ci sono sovrapposizioni tra rischi
- [ ] Tutti i rischi sono raggiungibili dal giocatore
- [ ] La difficoltà è bilanciata rispetto al tempo disponibile
- [ ] Audio spaziale funziona correttamente per ogni rischio

---

## Performance Report (da completare dopo test)

### Warehouse
- **Tempo caricamento modello**: ___ ms
- **Triangoli**: ___ k
- **Mesh count**: ___
- **FPS medio**: ___
- **Tempo medio completamento**: ___ secondi

### Construction
- **Tempo caricamento modello**: ___ ms
- **Triangoli**: ___ k
- **Mesh count**: ___
- **FPS medio**: ___
- **Tempo medio completamento**: ___ secondi

---

## Versioning

- **v1.0** (2025-11-28): Ottimizzazione iniziale basata su layout industriali standard
- **v1.1** (da definire): Aggiustamenti dopo test visivi con modalità debug
- **v2.0** (da definire): Ottimizzazione finale basata su feedback gameplay reale
