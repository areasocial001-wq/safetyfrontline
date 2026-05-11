// 2D cartoon "Spot the Hazard" levels — illustrated style, UPEHS-inspired.
// Includes side-panel risk list, educational modal, lives system.

import constructionImg from "@/assets/cartoon-construction.jpg";
import kitchenImg from "@/assets/cartoon-kitchen.jpg";
import factoryImg from "@/assets/cartoon-factory.jpg";
import type { RiskHuntLevel } from "@/data/risk-hunt-levels";

export interface CartoonHazard {
  id: string;
  name: string;
  position: { top: string; left: string };
  hitbox_size: { width: string; height: string };
  points: number;
  feedback: { title: string; message: string; type: "success" | "critical" | "warning" };
  // Extended educational content shown in post-click modal
  educational?: {
    why: string;          // why it's a hazard
    correct_action: string; // what to do instead
    regulation?: string;    // norm reference (D.Lgs. 81/08 art. ...)
  };
}

export interface CartoonHazardLevel extends Omit<RiskHuntLevel, "hazards"> {
  hazards: CartoonHazard[];
  lives: number; // wrong-click budget before game over
}

export const CARTOON_CONSTRUCTION: CartoonHazardLevel = {
  level_id: "cartoon_construction",
  title: "Caccia ai Rischi 2D: Cantiere",
  description: "Trova tutti i rischi nascosti in questo cantiere illustrato.",
  background_image_url: constructionImg,
  total_hazards: 7,
  lives: 3,
  intro_dialogue: { speaker: "Coordinatore Sicurezza", text: "Esplora la scena e clicca su tutto ciò che vedi di pericoloso." },
  hazards: [
    {
      id: "cc_harness", name: "Lavoro in quota senza imbracatura",
      position: { top: "5%", left: "8%" }, hitbox_size: { width: "14%", height: "42%" }, points: 200,
      feedback: { title: "Caduta dall'alto", message: "Il lavoratore sul ponteggio non indossa imbracatura.", type: "critical" },
      educational: { why: "Sopra i 2 metri di altezza il rischio di caduta è grave e potenzialmente fatale.", correct_action: "Imbracatura agganciata a linea vita o ancoraggio certificato.", regulation: "D.Lgs. 81/08 Art. 115" },
    },
    {
      id: "cc_load", name: "Carico sospeso non controllato",
      position: { top: "10%", left: "42%" }, hitbox_size: { width: "14%", height: "32%" }, points: 150,
      feedback: { title: "Carico sospeso", message: "Mai sostare o passare sotto i carichi sospesi.", type: "critical" },
      educational: { why: "La caduta del carico può causare schiacciamento o lesioni gravi.", correct_action: "Delimitare l'area sotto la gru e usare segnalazione acustica.", regulation: "D.Lgs. 81/08 All. VI" },
    },
    {
      id: "cc_debris", name: "Detriti in caduta",
      position: { top: "30%", left: "28%" }, hitbox_size: { width: "14%", height: "22%" }, points: 100,
      feedback: { title: "Caduta materiali", message: "Detriti che cadono dal ponteggio senza protezioni.", type: "warning" },
      educational: { why: "Materiali in caduta possono colpire chi sta sotto.", correct_action: "Installare mantovane parasassi e reti di contenimento.", regulation: "D.Lgs. 81/08 Art. 122" },
    },
    {
      id: "cc_panel", name: "Quadro elettrico aperto in fiamme",
      position: { top: "55%", left: "85%" }, hitbox_size: { width: "15%", height: "35%" }, points: 200,
      feedback: { title: "Rischio elettrico", message: "Quadro aperto con archi elettrici visibili.", type: "critical" },
      educational: { why: "Esposizione a parti in tensione, rischio folgorazione e incendio.", correct_action: "Disalimentare prima di intervenire, quadri sempre chiusi a chiave.", regulation: "D.Lgs. 81/08 Art. 80-87" },
    },
    {
      id: "cc_ladder", name: "Scala appoggiata male",
      position: { top: "40%", left: "75%" }, hitbox_size: { width: "10%", height: "48%" }, points: 100,
      feedback: { title: "Caduta dall'alto", message: "Scala appoggiata in modo instabile.", type: "warning" },
      educational: { why: "Inclinazione errata e mancato fissaggio causano scivolamento.", correct_action: "Inclinazione 75°, base antiscivolo, sporgenza 1m oltre il piano.", regulation: "D.Lgs. 81/08 Art. 113" },
    },
    {
      id: "cc_signs", name: "Segnaletica danneggiata a terra",
      position: { top: "76%", left: "40%" }, hitbox_size: { width: "16%", height: "20%" }, points: 75,
      feedback: { title: "Segnaletica", message: "Cartelli rotti e non visibili.", type: "warning" },
      educational: { why: "Segnali illeggibili impediscono la corretta identificazione dei rischi.", correct_action: "Sostituire e installare i cartelli all'altezza degli occhi.", regulation: "D.Lgs. 81/08 Titolo V" },
    },
    {
      id: "cc_rebar", name: "Ferri d'armatura non protetti",
      position: { top: "32%", left: "68%" }, hitbox_size: { width: "20%", height: "20%" }, points: 100,
      feedback: { title: "Rischio impalamento", message: "Ferri verticali esposti senza tappi.", type: "critical" },
      educational: { why: "Una caduta sui ferri scoperti causa lesioni gravissime o mortali.", correct_action: "Coprire ogni ferro con tappi protettivi colorati (rebar caps).", regulation: "D.Lgs. 81/08 Art. 148" },
    },
  ],
};

export const CARTOON_KITCHEN: CartoonHazardLevel = {
  level_id: "cartoon_kitchen",
  title: "Caccia ai Rischi 2D: Cucina di Ristorante",
  description: "Trova tutti i rischi nascosti nella cucina di un ristorante professionale.",
  background_image_url: kitchenImg,
  total_hazards: 8,
  lives: 3,
  intro_dialogue: { speaker: "Chef Responsabile HACCP", text: "Fuoco, lame, acqua ed elettricità: una cucina è un campo minato. Trovali tutti!" },
  hazards: [
    {
      id: "ck_pot_fire", name: "Pentola in fiamme sul fuoco",
      position: { top: "10%", left: "10%" }, hitbox_size: { width: "22%", height: "32%" }, points: 200,
      feedback: { title: "Incendio da grasso", message: "Pentola sul fornello con fiamme libere fuori controllo.", type: "critical" },
      educational: { why: "I grassi alimentari incendiati non si spengono con l'acqua: l'esplosione di vapore proietta olio bollente.", correct_action: "Spegnere il gas, coprire con coperchio o usare estintore a CO₂ / coperta antifiamma.", regulation: "D.M. 10/03/1998 - DPR 151/2011" },
    },
    {
      id: "ck_wet_floor", name: "Pavimento bagnato e unto",
      position: { top: "55%", left: "20%" }, hitbox_size: { width: "30%", height: "22%" }, points: 100,
      feedback: { title: "Scivolamento", message: "Liquidi e grasso versati senza segnaletica.", type: "warning" },
      educational: { why: "Pavimenti grassi/bagnati sono la prima causa di infortuni in cucina.", correct_action: "Asciugare subito, posizionare cartello giallo, calzature antiscivolo obbligatorie.", regulation: "D.Lgs. 81/08 All. IV" },
    },
    {
      id: "ck_powerstrip", name: "Multipresa sovraccarica vicino al frigo",
      position: { top: "8%", left: "40%" }, hitbox_size: { width: "20%", height: "22%" }, points: 150,
      feedback: { title: "Rischio incendio elettrico", message: "Ciabatta con troppe spine collegate a cascata.", type: "critical" },
      educational: { why: "Il sovraccarico surriscalda i contatti fino all'innesco, soprattutto vicino a frigoriferi e fonti di calore.", correct_action: "Una presa per dispositivo, mai prolunghe in cascata, prese certificate IP a norma.", regulation: "CEI 64-8" },
    },
    {
      id: "ck_oven_towel", name: "Strofinaccio nel forno acceso",
      position: { top: "20%", left: "78%" }, hitbox_size: { width: "20%", height: "26%" }, points: 200,
      feedback: { title: "Innesco tessuto", message: "Canovaccio appoggiato sullo sportello del forno aperto.", type: "critical" },
      educational: { why: "Tessuti vicino a fonti di calore raggiungono in pochi secondi la temperatura di autoaccensione.", correct_action: "Tenere strofinacci e materiali combustibili lontani da forni, fornelli e piastre.", regulation: "D.M. 10/03/1998" },
    },
    {
      id: "ck_slicer", name: "Affettatrice incustodita in funzione",
      position: { top: "62%", left: "1%" }, hitbox_size: { width: "26%", height: "32%" }, points: 200,
      feedback: { title: "Rischio taglio grave", message: "Affettatrice lasciata accesa senza protezione lama.", type: "critical" },
      educational: { why: "Le affettatrici causano amputazioni: la lama continua a girare per inerzia anche dopo lo spegnimento.", correct_action: "Spegnere e mettere a riposo la slitta dopo ogni uso, mai allontanarsi con lama in moto, guanti antitaglio.", regulation: "D.Lgs. 81/08 Art. 71 - DM 17/01/1997" },
    },
    {
      id: "ck_knife_edge", name: "Coltello sul bordo del bancone",
      position: { top: "82%", left: "30%" }, hitbox_size: { width: "16%", height: "16%" }, points: 75,
      feedback: { title: "Caduta lama", message: "Coltello posizionato in modo precario sul bordo.", type: "warning" },
      educational: { why: "Una lama che cade può ferire piedi e gambe; il riflesso di afferrarla provoca tagli profondi.", correct_action: "Riporre i coltelli su tagliere o ceppo, mai sul bordo. Se cade: lasciare cadere, mai afferrare.", regulation: "D.Lgs. 81/08 Titolo III" },
    },
    {
      id: "ck_extinguisher", name: "Estintore bloccato da casse",
      position: { top: "70%", left: "62%" }, hitbox_size: { width: "16%", height: "28%" }, points: 200,
      feedback: { title: "Antincendio inaccessibile", message: "Estintore ostruito da cassette di prodotti.", type: "critical" },
      educational: { why: "In una cucina pochi secondi separano un principio d'incendio da un disastro: l'estintore deve essere raggiungibile in 1-2 passi.", correct_action: "Mantenere libero e segnalato un raggio di 1 metro intorno ai presidi antincendio.", regulation: "D.M. 10/03/1998 Art. 4" },
    },
    {
      id: "ck_frayed_cable", name: "Cavo elettrico danneggiato vicino al lavello",
      position: { top: "60%", left: "78%" }, hitbox_size: { width: "20%", height: "26%" }, points: 150,
      feedback: { title: "Folgorazione", message: "Cavo con guaina rovinata accanto a fonte d'acqua.", type: "critical" },
      educational: { why: "Acqua + cavi danneggiati = rischio elettrocuzione mortale, specialmente con mani bagnate.", correct_action: "Sostituire immediatamente il cavo, mai usare apparecchi elettrici con conduttori scoperti, prese RCD differenziali.", regulation: "CEI 64-8 - D.Lgs. 81/08 Art. 80" },
    },
  ],
};

export const CARTOON_FACTORY: CartoonHazardLevel = {
  level_id: "cartoon_factory",
  title: "Caccia ai Rischi 2D: Officina Meccanica",
  description: "Trova tutti i rischi nascosti in questa fabbrica meccanica con macchine utensili e carroponte.",
  background_image_url: factoryImg,
  total_hazards: 8,
  lives: 3,
  intro_dialogue: { speaker: "Capo Officina", text: "Macchine utensili, carichi sospesi e saldature: in officina la sicurezza non ammette distrazioni." },
  hazards: [
    {
      id: "cf_crane_load", name: "Carico sospeso sopra i lavoratori",
      position: { top: "8%", left: "45%" }, hitbox_size: { width: "30%", height: "40%" }, points: 200,
      feedback: { title: "Caduta carico", message: "Carroponte che movimenta carico sopra zona di lavoro presidiata.", type: "critical" },
      educational: { why: "I carichi sospesi possono cadere per cedimento di brache, aggancio errato o oscillazioni; il passaggio sotto è vietato.", correct_action: "Delimitare l'area di manovra, segnalatore acustico, vietare il transito sotto al carico.", regulation: "D.Lgs. 81/08 All. VI - Art. 71" },
    },
    {
      id: "cf_welder_no_ppe", name: "Saldatore senza maschera",
      position: { top: "22%", left: "70%" }, hitbox_size: { width: "20%", height: "30%" }, points: 200,
      feedback: { title: "Radiazioni e ustioni", message: "Operatore che salda senza maschera né schermo facciale.", type: "critical" },
      educational: { why: "L'arco di saldatura emette UV/IR che causano cheratocongiuntivite ('colpo d'arco'), ustioni e cecità temporanea.", correct_action: "Maschera autoscurante, guanti, grembiule in cuoio, paravento e aspirazione fumi.", regulation: "D.Lgs. 81/08 Titolo VIII Capo V" },
    },
    {
      id: "cf_oil_spill", name: "Pozza d'olio sul pavimento",
      position: { top: "75%", left: "38%" }, hitbox_size: { width: "20%", height: "20%" }, points: 100,
      feedback: { title: "Scivolamento", message: "Macchia di olio non segnalata in zona di passaggio.", type: "warning" },
      educational: { why: "Gli oli da macchine utensili rendono il pavimento estremamente scivoloso e infiammabile.", correct_action: "Cospargere materiale assorbente, segnalare con cartello, smaltire come rifiuto pericoloso.", regulation: "D.Lgs. 81/08 All. IV" },
    },
    {
      id: "cf_unstable_stool", name: "Lavoratore in piedi su sgabello instabile",
      position: { top: "44%", left: "78%" }, hitbox_size: { width: "14%", height: "44%" }, points: 150,
      feedback: { title: "Caduta dall'alto", message: "Operatore in equilibrio su sgabello al posto di una scala.", type: "critical" },
      educational: { why: "Lavorare in altezza su attrezzature non idonee è la prima causa di cadute in officina, anche da basse quote.", correct_action: "Utilizzare scale a norma, trabattelli o piattaforme con parapetto, mai improvvisare appoggi.", regulation: "D.Lgs. 81/08 Art. 113" },
    },
    {
      id: "cf_long_bars", name: "Trasporto manuale di barre metalliche",
      position: { top: "62%", left: "32%" }, hitbox_size: { width: "26%", height: "32%" }, points: 100,
      feedback: { title: "Movimentazione errata", message: "Barre lunghe trasportate da un solo operatore con vista ostruita.", type: "warning" },
      educational: { why: "Carichi lunghi causano urti, distorsioni e schiacciamento di terzi; il peso mal distribuito danneggia la schiena.", correct_action: "Trasporto in due, percorso libero, carrelli porta-barre, segnalazione acustica nelle curve.", regulation: "D.Lgs. 81/08 Titolo VI" },
    },
    {
      id: "cf_cables_floor", name: "Cavi elettrici attraverso il passaggio",
      position: { top: "82%", left: "60%" }, hitbox_size: { width: "30%", height: "16%" }, points: 100,
      feedback: { title: "Inciampo e rischio elettrico", message: "Cavi volanti stesi attraverso una corsia pedonale.", type: "warning" },
      educational: { why: "Cavi a terra causano inciampi, rotture della guaina e cortocircuiti, soprattutto con passaggio di muletti.", correct_action: "Cablaggi a soffitto in canaline, passacavi a terra rinforzati nelle attraversate temporanee.", regulation: "CEI 64-8" },
    },
    {
      id: "cf_lathe_no_guard", name: "Tornio senza protezione truciolo",
      position: { top: "32%", left: "2%" }, hitbox_size: { width: "20%", height: "32%" }, points: 200,
      feedback: { title: "Proiezione truciolo", message: "Tornio operativo con schermo di protezione rimosso.", type: "critical" },
      educational: { why: "I trucioli proiettati a velocità possono ferire occhi e viso; le mani vicino al mandrino rischiano l'impigliamento.", correct_action: "Schermo paratruciolo sempre montato, occhiali di sicurezza, vietato l'uso di guanti larghi.", regulation: "D.Lgs. 81/08 Art. 70-71 - DM 17/01/1997" },
    },
    {
      id: "cf_faded_markings", name: "Segnaletica pavimento usurata",
      position: { top: "70%", left: "8%" }, hitbox_size: { width: "20%", height: "20%" }, points: 75,
      feedback: { title: "Percorsi non visibili", message: "Strisce gialle dei percorsi pedonali consumate e illeggibili.", type: "warning" },
      educational: { why: "Quando i percorsi non sono distinguibili, pedoni e mezzi condividono lo stesso spazio aumentando il rischio investimento.", correct_action: "Ripristinare la segnaletica orizzontale, separare fisicamente percorsi pedoni/mezzi quando possibile.", regulation: "D.Lgs. 81/08 Titolo V - All. XXV" },
    },
  ],
};

export const CARTOON_LEVELS: Record<string, CartoonHazardLevel> = {
  cartoon_construction: CARTOON_CONSTRUCTION,
  cartoon_kitchen: CARTOON_KITCHEN,
  cartoon_factory: CARTOON_FACTORY,
};
