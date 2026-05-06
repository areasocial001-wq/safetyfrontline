// 2D cartoon "Spot the Hazard" levels — illustrated style, UPEHS-inspired.
// Includes side-panel risk list, educational modal, lives system.

import constructionImg from "@/assets/cartoon-construction.jpg";
import officeImg from "@/assets/cartoon-office.jpg";
import warehouseImg from "@/assets/cartoon-warehouse.jpg";
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

export const CARTOON_OFFICE: CartoonHazardLevel = {
  level_id: "cartoon_office",
  title: "Caccia ai Rischi 2D: Ufficio",
  description: "Trova tutti i rischi nascosti in questo ufficio illustrato.",
  background_image_url: officeImg,
  total_hazards: 8,
  lives: 3,
  intro_dialogue: { speaker: "RSPP", text: "Anche un ufficio nasconde insidie. Trovale tutte!" },
  hazards: [
    {
      id: "co_cables", name: "Matassa di cavi a terra",
      position: { top: "72%", left: "2%" }, hitbox_size: { width: "30%", height: "26%" }, points: 100,
      feedback: { title: "Inciampo", message: "Cavi sparsi sul pavimento.", type: "warning" },
      educational: { why: "Causa inciampi, cadute e danni ai cavi stessi.", correct_action: "Usare canaline, passacavi e fissare a parete.", regulation: "D.Lgs. 81/08 Art. 64" },
    },
    {
      id: "co_posture", name: "Postura scorretta alla scrivania",
      position: { top: "44%", left: "12%" }, hitbox_size: { width: "20%", height: "32%" }, points: 75,
      feedback: { title: "Ergonomia", message: "Schiena curva, monitor troppo basso.", type: "warning" },
      educational: { why: "Posture errate causano disturbi muscolo-scheletrici cronici.", correct_action: "Monitor all'altezza occhi, schienale ergonomico, pause ogni 2h.", regulation: "D.Lgs. 81/08 Titolo VII" },
    },
    {
      id: "co_exit", name: "Uscita di emergenza ostruita",
      position: { top: "20%", left: "55%" }, hitbox_size: { width: "24%", height: "55%" }, points: 200,
      feedback: { title: "Pericolo grave", message: "Pile di scatole davanti all'uscita.", type: "critical" },
      educational: { why: "In caso di evacuazione l'uscita deve essere libera e immediatamente accessibile.", correct_action: "Mantenere sempre sgombri i percorsi e le porte di emergenza.", regulation: "D.M. 10/03/1998" },
    },
    {
      id: "co_puddle", name: "Pavimento bagnato senza segnaletica",
      position: { top: "70%", left: "45%" }, hitbox_size: { width: "14%", height: "16%" }, points: 75,
      feedback: { title: "Scivolamento", message: "Pozzanghera senza cartello.", type: "warning" },
      educational: { why: "Le superfici bagnate sono la prima causa di cadute negli uffici.", correct_action: "Posizionare il cavalletto giallo e asciugare subito.", regulation: "D.Lgs. 81/08 All. IV" },
    },
    {
      id: "co_powerstrip", name: "Ciabatta elettrica sovraccarica",
      position: { top: "82%", left: "28%" }, hitbox_size: { width: "20%", height: "16%" }, points: 150,
      feedback: { title: "Rischio incendio", message: "Multipresa con troppe spine.", type: "critical" },
      educational: { why: "Il sovraccarico surriscalda la presa fino all'innesco.", correct_action: "Una ciabatta per dispositivo, mai collegate a cascata.", regulation: "CEI 64-8" },
    },
    {
      id: "co_papers", name: "Carta in fiamme vicino lampada",
      position: { top: "55%", left: "60%" }, hitbox_size: { width: "16%", height: "32%" }, points: 200,
      feedback: { title: "Innesco", message: "Pila di carta a contatto con fonte di calore.", type: "critical" },
      educational: { why: "Lampade alogene/incandescenti raggiungono temperature di innesco.", correct_action: "Mantenere distanza minima da materiali combustibili, usare LED.", regulation: "D.M. 10/03/1998" },
    },
    {
      id: "co_box_carry", name: "Trasporto carico con vista ostruita",
      position: { top: "42%", left: "40%" }, hitbox_size: { width: "16%", height: "40%" }, points: 100,
      feedback: { title: "Movimentazione manuale", message: "Scatole che impediscono di vedere il percorso.", type: "warning" },
      educational: { why: "Non vedere dove si cammina porta a urti, cadute e danni alla schiena.", correct_action: "Carichi a misura, percorso libero, usare carrello se possibile.", regulation: "D.Lgs. 81/08 Titolo VI" },
    },
    {
      id: "co_lamp", name: "Apparecchio elettrico fumante",
      position: { top: "16%", left: "16%" }, hitbox_size: { width: "14%", height: "26%" }, points: 150,
      feedback: { title: "Guasto elettrico", message: "Dispositivo che emette fumo.", type: "critical" },
      educational: { why: "Il fumo indica corto circuito imminente o componenti surriscaldati.", correct_action: "Disconnettere subito, non usare acqua, segnalare al manutentore.", regulation: "D.Lgs. 81/08 Art. 80" },
    },
  ],
};

export const CARTOON_WAREHOUSE: CartoonHazardLevel = {
  level_id: "cartoon_warehouse",
  title: "Caccia ai Rischi 2D: Magazzino",
  description: "Trova tutti i rischi nascosti in questo magazzino illustrato.",
  background_image_url: warehouseImg,
  total_hazards: 8,
  lives: 3,
  intro_dialogue: { speaker: "Capo magazzino", text: "Carrelli, cataste e pavimenti: ogni angolo nasconde un rischio." },
  hazards: [
    {
      id: "cw_forklift", name: "Carrello vicino al pedone",
      position: { top: "35%", left: "12%" }, hitbox_size: { width: "32%", height: "55%" }, points: 200,
      feedback: { title: "Investimento", message: "Pedone in zona di manovra del muletto.", type: "critical" },
      educational: { why: "I carrelli elevatori sono la prima causa di morti in magazzino.", correct_action: "Percorsi pedonali separati, segnalatori acustici e luci blu.", regulation: "D.Lgs. 81/08 Art. 73" },
    },
    {
      id: "cw_pallet", name: "Catasta di pallet instabile",
      position: { top: "14%", left: "36%" }, hitbox_size: { width: "22%", height: "60%" }, points: 150,
      feedback: { title: "Caduta carichi", message: "Pallet impilati troppo in alto.", type: "critical" },
      educational: { why: "Cataste alte e non legate possono crollare addosso ai lavoratori.", correct_action: "Massimo 2,5m, basi piane, cinghie di stabilizzazione.", regulation: "D.Lgs. 81/08 All. IV" },
    },
    {
      id: "cw_lift", name: "Sollevamento manuale errato",
      position: { top: "55%", left: "60%" }, hitbox_size: { width: "14%", height: "35%" }, points: 100,
      feedback: { title: "Schiena", message: "Sollevamento con schiena curva.", type: "warning" },
      educational: { why: "Causa lombalgie, ernie e infortuni cronici.", correct_action: "Schiena dritta, gambe piegate, carico aderente al corpo.", regulation: "D.Lgs. 81/08 Titolo VI" },
    },
    {
      id: "cw_oil", name: "Macchia d'olio non segnalata",
      position: { top: "70%", left: "33%" }, hitbox_size: { width: "24%", height: "20%" }, points: 100,
      feedback: { title: "Scivolamento", message: "Sostanza oleosa sul pavimento.", type: "warning" },
      educational: { why: "L'olio riduce drasticamente l'aderenza, specialmente vicino ai carrelli.", correct_action: "Cospargere assorbente, segnalare e pulire immediatamente.", regulation: "D.Lgs. 81/08 All. IV" },
    },
    {
      id: "cw_exit", name: "Uscita antincendio ostruita",
      position: { top: "16%", left: "2%" }, hitbox_size: { width: "18%", height: "32%" }, points: 200,
      feedback: { title: "Evacuazione", message: "Scatole davanti alla porta REI.", type: "critical" },
      educational: { why: "L'uscita antincendio deve essere sempre libera e apribile in 1 secondo.", correct_action: "Vietato depositare materiali a meno di 2m dall'uscita.", regulation: "D.M. 10/03/1998" },
    },
    {
      id: "cw_cable", name: "Cavo sospeso attraverso il corridoio",
      position: { top: "42%", left: "62%" }, hitbox_size: { width: "10%", height: "30%" }, points: 100,
      feedback: { title: "Rischio elettrico", message: "Cavo volante in corsia.", type: "warning" },
      educational: { why: "Può essere strappato dai carrelli o causare inciampo.", correct_action: "Cablaggi a soffitto in canaline o passaggi protetti.", regulation: "CEI 64-8" },
    },
    {
      id: "cw_shelf", name: "Lavoratore in piedi sullo scaffale",
      position: { top: "8%", left: "85%" }, hitbox_size: { width: "13%", height: "30%" }, points: 200,
      feedback: { title: "Caduta dall'alto", message: "Salita sugli scaffali al posto di una scala.", type: "critical" },
      educational: { why: "Gli scaffali non sono progettati per sostenere persone.", correct_action: "Usare scala a norma o trabattello, mai arrampicarsi.", regulation: "D.Lgs. 81/08 Art. 113" },
    },
    {
      id: "cw_pallet_broken", name: "Pallet rotto a terra",
      position: { top: "78%", left: "75%" }, hitbox_size: { width: "22%", height: "20%" }, points: 75,
      feedback: { title: "Inciampo", message: "Pallet danneggiato lasciato in mezzo al passaggio.", type: "warning" },
      educational: { why: "Le assi rotte e i chiodi sporgenti causano cadute e ferite.", correct_action: "Smaltire subito i pallet danneggiati nell'area dedicata.", regulation: "D.Lgs. 81/08 All. IV" },
    },
  ],
};

export const CARTOON_LEVELS: Record<string, CartoonHazardLevel> = {
  cartoon_construction: CARTOON_CONSTRUCTION,
  cartoon_office: CARTOON_OFFICE,
  cartoon_warehouse: CARTOON_WAREHOUSE,
};
