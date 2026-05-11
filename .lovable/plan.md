## Obiettivo

Riallineare la struttura della **Piattaforma Safety Frontline** (sezione `/training` — `TrainingHub.tsx`) alla "Cartellina Rev04". Esporre tutto il contenuto già implementato (oggi nascosto) come percorsi navigabili e mostrare le voci ancora da produrre come **card "In rilascio"** (badge dedicato, non cliccabili, ma visibili agli utenti e ai prospect).

Tutta la modifica resta **lato frontend**: nessun cambio DB, nessun cambio Edge Function, nessun cambio a contenuti `training-content-*.ts`.

---

## Cosa è già implementato (da esporre come percorsi attivi)

I moduli con contenuto completo ma oggi non raggiungibili da `TrainingHub`:

- **Rischio Specifico Basso (4h)** — `rb_videoterminali`, `rb_stress_lavoro`, `rb_rischio_elettrico`, `rb_microclima_ergonomia`
- **Rischio Specifico Medio (8h)** — `rm_rischi_meccanici`, `rm_movimentazione`, `rm_rischio_elettrico`, `rm_agenti_fisici`, `rm_sostanze_pericolose`, `rm_cadute_alto`, `rm_incendio`, `rm_primo_soccorso`
- **Rischio Specifico Alto (12h)** — `ra_rischi_meccanici_avanzati`, `ra_rischio_chimico`, `ra_rischio_biologico`, `ra_amianto`, `ra_spazi_confinati`, `ra_lavori_quota`, `ra_movimentazione_avanzata`, `ra_atmosfere_esplosive`, `ra_rumore_vibrazioni`, `ra_radiazioni`, `ra_emergenze_complesse`, `ra_cantiere`

Già attivi e mantenuti: Lavoratori (Generale + Specifica settoriale), RSPP DL, RLS, Preposto, Antincendio, Primo Soccorso, Cyber Security.

---

## Cosa è nuovo (da mostrare come "In rilascio")

Voci della Cartellina Rev04 non ancora prodotte. Card visibili nell'hub ma con badge **"In rilascio"**, pulsante disabilitato e tooltip "Disponibile a breve":

**Figure della Sicurezza**
- ASPP Mod. A-B-C
- Dirigente per la Sicurezza
- Lavoratrici Gestanti (focus mansioni / lavoro notturno)

**Attrezzature di lavoro (abilitazioni Accordo S-R)**
- Carrelli Elevatori
- Carroponte
- PLE — Piattaforme di Lavoro Elevabili
- Gru (a torre / mobile)
- Scale e Trabattelli
- Trattori Agricoli e Forestali
- Escavatori e MMT (Macchine Movimento Terra)
- Pompe per Calcestruzzo

---

## Riorganizzazione dell'hub

Le card dei percorsi vengono raggruppate in **3 macro-sezioni**, riprendendo la pagina 4 del documento:

```text
1. FORMAZIONE GENERALE & SPECIFICA (Art. 37 D.Lgs 81/08)
   - Formazione Lavoratori (Generale + Specifica settoriale)
   - Rischio Specifico Basso 4h           [NUOVO percorso, contenuto pronto]
   - Rischio Specifico Medio 8h           [NUOVO percorso, contenuto pronto]
   - Rischio Specifico Alto 12h           [NUOVO percorso, contenuto pronto]

2. FIGURE DELLA SICUREZZA SUL LAVORO
   - RSPP Datore di Lavoro
   - RLS
   - Preposto
   - Addetto Antincendio
   - Addetto Primo Soccorso
   - ASPP Mod. A-B-C                      [In rilascio]
   - Dirigente per la Sicurezza           [In rilascio]
   - Lavoratrici Gestanti                 [In rilascio]

3. ATTREZZATURE & ABILITAZIONI
   - Cyber Security (mantenuto qui come modulo trasversale)
   - 8 abilitazioni attrezzature          [tutte In rilascio]
```

---

## Dettaglio tecnico

**File toccati**

- `src/pages/TrainingHub.tsx`
  - Estendere `TrainingPath` con `comingSoon?: boolean` e `category: 'generale' | 'figure' | 'attrezzature'`
  - Aggiungere i 3 percorsi "Rischio Specifico Basso/Medio/Alto" con i `moduleIds` già esistenti
  - Aggiungere le 11 voci "In rilascio" (3 figure + 8 attrezzature) con `comingSoon: true` e `moduleIds: []`
  - Renderizzare le card raggruppate per `category` con un titolo di sezione per ognuna
  - Per le card `comingSoon`: badge giallo "🚧 In rilascio", overlay leggermente desaturato, button "Disponibile a breve" disabilitato, nessuna espansione moduli
  - I percorsi `comingSoon` non concorrono al calcolo "moduli completati / certificato"

- `src/components/Modules.tsx` (landing) e `src/components/Hero.tsx` se citano numeri di moduli/percorsi → aggiornare i conteggi alla nuova struttura (8 percorsi attivi + 11 in rilascio).

**Cosa NON cambia**
- Nessuna nuova tabella, nessuna RLS, nessuna migration
- Nessun nuovo file `training-content-*.ts`
- `SECTION_COUNTS` resta invariato (le voci `rb_*`, `rm_*`, `ra_*` ci sono già)
- I generatori di certificati e i progress hook restano identici

**QA**
- Verifica visuale dell'hub (1336×859) per controllare allineamento delle 3 sezioni
- Click su una card di rilascio → nessuna navigazione, mostra solo tooltip
- Click su "Rischio Specifico Medio" → si espande e mostra gli 8 moduli con stato corretto
- Build pulita (no TS errors)

