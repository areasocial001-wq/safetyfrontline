// Centralized "Caccia ai Rischi" level definitions per scenario theme.
// Each module maps to a theme; the same level data is reused across modules.

import officeImg from "@/assets/risk-hunt-office.jpg";
import workshopImg from "@/assets/risk-hunt-workshop.jpg";
import kitchenImg from "@/assets/risk-hunt-kitchen.jpg";
import constructionImg from "@/assets/risk-hunt-construction.jpg";
import fireImg from "@/assets/risk-hunt-fire.jpg";
import firstaidImg from "@/assets/risk-hunt-firstaid.jpg";
import warehouseImg from "@/assets/risk-hunt-warehouse.jpg";

export interface RiskHuntHazard {
  id: string;
  name: string;
  position: { top: string; left: string };
  hitbox_size: { width: string; height: string };
  points: number;
  feedback: { title: string; message: string; type: "success" | "critical" | "warning" };
}

export interface RiskHuntLevel {
  level_id: string;
  title: string;
  description: string;
  background_image_url: string;
  total_hazards: number;
  intro_dialogue: { speaker: string; text: string };
  hazards: RiskHuntHazard[];
}

const OFFICE: RiskHuntLevel = {
  level_id: "rh_office",
  title: "Caccia ai Rischi: Ufficio",
  description: "Individua i rischi nascosti in questo ufficio.",
  background_image_url: officeImg,
  total_hazards: 5,
  intro_dialogue: { speaker: "RSPP", text: "Trova i rischi cliccando sulle aree sospette." },
  hazards: [
    { id: "o_cables", name: "Cavi a terra", position: { top: "80%", left: "18%" }, hitbox_size: { width: "18%", height: "15%" }, points: 100, feedback: { title: "Inciampo!", message: "Cavi volanti vanno fissati con canaline.", type: "warning" } },
    { id: "o_exit", name: "Uscita ostruita", position: { top: "55%", left: "45%" }, hitbox_size: { width: "12%", height: "20%" }, points: 150, feedback: { title: "Pericolo grave", message: "Le vie di fuga non vanno mai ostruite.", type: "critical" } },
    { id: "o_extinguisher", name: "Estintore nascosto", position: { top: "70%", left: "75%" }, hitbox_size: { width: "10%", height: "15%" }, points: 100, feedback: { title: "Estintore non visibile", message: "Deve essere segnalato e accessibile.", type: "warning" } },
    { id: "o_posture", name: "Postura scorretta", position: { top: "55%", left: "78%" }, hitbox_size: { width: "12%", height: "15%" }, points: 50, feedback: { title: "Ergonomia", message: "Il monitor va all'altezza degli occhi.", type: "warning" } },
    { id: "o_overload", name: "Multipresa sovraccarica", position: { top: "85%", left: "8%" }, hitbox_size: { width: "10%", height: "12%" }, points: 100, feedback: { title: "Rischio elettrico", message: "Non sovraccaricare le prese multiple.", type: "critical" } },
  ],
};

const WORKSHOP: RiskHuntLevel = {
  level_id: "rh_workshop",
  title: "Caccia ai Rischi: Officina",
  description: "Individua i rischi in questa officina meccanica.",
  background_image_url: workshopImg,
  total_hazards: 5,
  intro_dialogue: { speaker: "RSPP", text: "Cerca i rischi meccanici, elettrici ed ergonomici." },
  hazards: [
    { id: "w_lift", name: "Sollevamento scorretto", position: { top: "60%", left: "60%" }, hitbox_size: { width: "15%", height: "30%" }, points: 100, feedback: { title: "MMC", message: "Schiena dritta e gambe piegate.", type: "warning" } },
    { id: "w_panel", name: "Quadro elettrico aperto", position: { top: "40%", left: "82%" }, hitbox_size: { width: "10%", height: "25%" }, points: 150, feedback: { title: "Rischio elettrico", message: "I quadri devono essere chiusi a chiave.", type: "critical" } },
    { id: "w_helmet", name: "Manca DPI casco", position: { top: "45%", left: "62%" }, hitbox_size: { width: "8%", height: "10%" }, points: 100, feedback: { title: "DPI obbligatori", message: "In officina serve casco di protezione.", type: "critical" } },
    { id: "w_sparks", name: "Saldatura senza protezione", position: { top: "75%", left: "92%" }, hitbox_size: { width: "8%", height: "15%" }, points: 100, feedback: { title: "Scintille", message: "Materiali infiammabili lontani.", type: "warning" } },
    { id: "w_machine", name: "Macchina senza riparo", position: { top: "45%", left: "40%" }, hitbox_size: { width: "12%", height: "15%" }, points: 100, feedback: { title: "Rischio meccanico", message: "Le parti rotanti vanno schermate.", type: "critical" } },
  ],
};

const KITCHEN: RiskHuntLevel = {
  level_id: "rh_kitchen",
  title: "Caccia ai Rischi: Cucina",
  description: "Individua i rischi in questa cucina professionale.",
  background_image_url: kitchenImg,
  total_hazards: 5,
  intro_dialogue: { speaker: "RSPP", text: "Cerca rischi di taglio, ustione, scivolamento, chimico." },
  hazards: [
    { id: "k_knife", name: "Coltello sul bordo", position: { top: "55%", left: "20%" }, hitbox_size: { width: "10%", height: "10%" }, points: 100, feedback: { title: "Rischio taglio", message: "Mai lasciare lame sul bordo.", type: "warning" } },
    { id: "k_fire", name: "Fiamma vicino a panni", position: { top: "40%", left: "50%" }, hitbox_size: { width: "12%", height: "20%" }, points: 150, feedback: { title: "Rischio incendio", message: "Tenere materiali infiammabili lontani.", type: "critical" } },
    { id: "k_chem", name: "Detergenti vicino al cibo", position: { top: "75%", left: "92%" }, hitbox_size: { width: "8%", height: "20%" }, points: 100, feedback: { title: "Rischio chimico", message: "I prodotti chimici vanno separati dagli alimenti.", type: "critical" } },
    { id: "k_spill", name: "Pavimento bagnato", position: { top: "85%", left: "55%" }, hitbox_size: { width: "12%", height: "10%" }, points: 50, feedback: { title: "Scivolamento", message: "Asciugare subito e segnalare.", type: "warning" } },
    { id: "k_cable", name: "Cavo elettrico vicino acqua", position: { top: "30%", left: "55%" }, hitbox_size: { width: "10%", height: "15%" }, points: 100, feedback: { title: "Rischio elettrico", message: "Cavi e acqua = pericolo.", type: "critical" } },
  ],
};

const CONSTRUCTION: RiskHuntLevel = {
  level_id: "rh_construction",
  title: "Caccia ai Rischi: Cantiere",
  description: "Individua i rischi in questo cantiere edile.",
  background_image_url: constructionImg,
  total_hazards: 5,
  intro_dialogue: { speaker: "Coordinatore", text: "Identifica rischi caduta, DPI mancanti, carichi sospesi." },
  hazards: [
    { id: "c_harness", name: "Lavoro in quota senza imbracatura", position: { top: "20%", left: "10%" }, hitbox_size: { width: "12%", height: "20%" }, points: 200, feedback: { title: "Caduta dall'alto", message: "Sopra i 2m serve imbracatura.", type: "critical" } },
    { id: "c_load", name: "Carico sospeso sopra persone", position: { top: "55%", left: "60%" }, hitbox_size: { width: "12%", height: "15%" }, points: 150, feedback: { title: "Caduta materiali", message: "Mai sostare sotto i carichi.", type: "critical" } },
    { id: "c_helmet", name: "Lavoratore senza casco", position: { top: "70%", left: "45%" }, hitbox_size: { width: "10%", height: "20%" }, points: 100, feedback: { title: "DPI", message: "Casco obbligatorio in cantiere.", type: "warning" } },
    { id: "c_debris", name: "Detriti caduti", position: { top: "20%", left: "35%" }, hitbox_size: { width: "12%", height: "15%" }, points: 50, feedback: { title: "Caduta oggetti", message: "Servono parasassi e mantovane.", type: "warning" } },
    { id: "c_signs", name: "Segnaletica assente", position: { top: "65%", left: "8%" }, hitbox_size: { width: "12%", height: "15%" }, points: 50, feedback: { title: "Segnaletica", message: "Cartelli obbligatori in cantiere.", type: "warning" } },
  ],
};

const FIRE: RiskHuntLevel = {
  level_id: "rh_fire",
  title: "Caccia ai Rischi: Antincendio",
  description: "Individua i rischi di incendio nell'ambiente.",
  background_image_url: fireImg,
  total_hazards: 5,
  intro_dialogue: { speaker: "Addetto Antincendio", text: "Trova innesco, ostacoli alla fuga e dispositivi non funzionanti." },
  hazards: [
    { id: "f_overload", name: "Multipresa in fiamme", position: { top: "20%", left: "10%" }, hitbox_size: { width: "12%", height: "25%" }, points: 150, feedback: { title: "Innesco elettrico", message: "Mai sovraccaricare prese multiple.", type: "critical" } },
    { id: "f_door", name: "Porta REI bloccata aperta", position: { top: "45%", left: "40%" }, hitbox_size: { width: "12%", height: "30%" }, points: 200, feedback: { title: "Compartimentazione", message: "Le porte tagliafuoco devono restare chiuse.", type: "critical" } },
    { id: "f_bin", name: "Mozzicone nel cestino", position: { top: "60%", left: "55%" }, hitbox_size: { width: "10%", height: "15%" }, points: 100, feedback: { title: "Innesco", message: "Mai gettare mozziconi accesi.", type: "critical" } },
    { id: "f_solvent", name: "Solventi vicino al calore", position: { top: "10%", left: "85%" }, hitbox_size: { width: "12%", height: "20%" }, points: 150, feedback: { title: "Sostanze infiammabili", message: "Stoccare lontano da fonti di calore.", type: "critical" } },
    { id: "f_sprinkler", name: "Sprinkler ostruito", position: { top: "5%", left: "92%" }, hitbox_size: { width: "8%", height: "15%" }, points: 100, feedback: { title: "Impianto", message: "Nessun oggetto deve schermare gli sprinkler.", type: "warning" } },
  ],
};

const FIRSTAID: RiskHuntLevel = {
  level_id: "rh_firstaid",
  title: "Caccia ai Rischi: Primo Soccorso",
  description: "Individua le criticità nella gestione del primo soccorso.",
  background_image_url: firstaidImg,
  total_hazards: 5,
  intro_dialogue: { speaker: "Addetto PS", text: "Verifica presidi, formazione e accessibilità." },
  hazards: [
    { id: "p_kit", name: "Cassetta vuota", position: { top: "15%", left: "8%" }, hitbox_size: { width: "15%", height: "30%" }, points: 150, feedback: { title: "Presidio mancante", message: "Pacchetto di medicazione sempre completo.", type: "critical" } },
    { id: "p_aed", name: "DAE mancante", position: { top: "20%", left: "30%" }, hitbox_size: { width: "12%", height: "25%" }, points: 200, feedback: { title: "Defibrillatore", message: "Il DAE deve essere sempre presente e segnalato.", type: "critical" } },
    { id: "p_victim", name: "Infortunato a terra", position: { top: "70%", left: "55%" }, hitbox_size: { width: "20%", height: "25%" }, points: 100, feedback: { title: "Allertare 112", message: "Chiamare subito i soccorsi.", type: "critical" } },
    { id: "p_cpr", name: "BLS scorretto", position: { top: "30%", left: "60%" }, hitbox_size: { width: "15%", height: "20%" }, points: 100, feedback: { title: "Formazione", message: "Solo personale formato esegue il BLS.", type: "warning" } },
    { id: "p_numbers", name: "Numeri emergenza assenti", position: { top: "30%", left: "80%" }, hitbox_size: { width: "12%", height: "20%" }, points: 50, feedback: { title: "Comunicazione", message: "Numeri di emergenza sempre visibili.", type: "warning" } },
  ],
};

const WAREHOUSE: RiskHuntLevel = {
  level_id: "rh_warehouse",
  title: "Caccia ai Rischi: Magazzino",
  description: "Individua i rischi in questo magazzino logistico.",
  background_image_url: warehouseImg,
  total_hazards: 5,
  intro_dialogue: { speaker: "RSPP", text: "Attenzione a movimentazione, traffico interno e cataste." },
  hazards: [
    { id: "wh_forklift", name: "Carrello vicino a pedone", position: { top: "55%", left: "20%" }, hitbox_size: { width: "20%", height: "30%" }, points: 200, feedback: { title: "Investimento", message: "Separare percorsi pedoni e carrelli.", type: "critical" } },
    { id: "wh_pallet", name: "Pallet instabili", position: { top: "30%", left: "50%" }, hitbox_size: { width: "15%", height: "25%" }, points: 150, feedback: { title: "Caduta carichi", message: "Cataste sempre in equilibrio.", type: "critical" } },
    { id: "wh_lift", name: "MMC scorretta", position: { top: "55%", left: "55%" }, hitbox_size: { width: "12%", height: "30%" }, points: 100, feedback: { title: "Schiena", message: "Sollevare con le gambe.", type: "warning" } },
    { id: "wh_oil", name: "Macchia d'olio", position: { top: "85%", left: "50%" }, hitbox_size: { width: "10%", height: "10%" }, points: 50, feedback: { title: "Scivolamento", message: "Pulire e segnalare subito.", type: "warning" } },
    { id: "wh_overhang", name: "Carico sporgente", position: { top: "30%", left: "85%" }, hitbox_size: { width: "12%", height: "15%" }, points: 100, feedback: { title: "Caduta", message: "Niente deve sporgere dagli scaffali.", type: "warning" } },
  ],
};

export const RISK_HUNT_LEVELS: Record<string, RiskHuntLevel> = {
  rh_office: OFFICE,
  rh_workshop: WORKSHOP,
  rh_kitchen: KITCHEN,
  rh_construction: CONSTRUCTION,
  rh_fire: FIRE,
  rh_firstaid: FIRSTAID,
  rh_warehouse: WAREHOUSE,
};

// Map every moduleId to a thematic level
export function getRiskHuntLevelForModule(moduleId: string): RiskHuntLevel {
  if (moduleId.startsWith("antincendio_") || moduleId === "rm_incendio") return FIRE;
  if (moduleId.startsWith("primo_soccorso_") || moduleId === "rm_primo_soccorso") return FIRSTAID;
  if (moduleId === "ls_ristorazione") return KITCHEN;
  if (moduleId === "ls_aziende" || moduleId.startsWith("rm_") || moduleId === "ra_rischi_meccanici_avanzati") return WORKSHOP;
  if (moduleId === "ra_cantiere" || moduleId === "ra_lavori_quota" || moduleId === "ra_spazi_confinati") return CONSTRUCTION;
  if (moduleId === "rm_movimentazione" || moduleId === "ra_movimentazione_avanzata") return WAREHOUSE;
  // default: office (covers ls_uffici, rb_*, generale, rspp, rls, preposto, cybersecurity, ra_* residui)
  return OFFICE;
}
