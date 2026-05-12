// Pacchetti formativi predefiniti per settore (D.Lgs. 81/08 + buone pratiche)
// I prezzi sono indicativi €/dipendente/anno e includono accesso piattaforma,
// moduli, simulazioni 3D, attestati e dashboard aziendale.

export type RiskLevel = "basso" | "medio" | "alto";

export interface SectorPackage {
  id: string;
  name: string;
  icon: string;
  riskLevel: RiskLevel;
  description: string;
  totalHours: number;
  modules: { name: string; hours: number }[];
  pricePerEmployee: number; // €/anno per dipendente (listino)
  recommendedFor: string;
  tradAvgHourCost: number; // costo medio orario formazione tradizionale (aula+docente+ore lavoro)
}

export const SECTOR_PACKAGES: SectorPackage[] = [
  {
    id: "uffici",
    name: "Uffici & Servizi",
    icon: "🏢",
    riskLevel: "basso",
    description: "Personale amministrativo, commerciale, IT. Rischi videoterminali, ergonomia, stress.",
    totalHours: 8,
    modules: [
      { name: "Formazione Generale (4h)", hours: 4 },
      { name: "Specifica Uffici (4h)", hours: 4 },
      { name: "Simulazione 3D Office Hazard Quest", hours: 0.5 },
      { name: "Antincendio Modulo 1", hours: 1 },
      { name: "Primo Soccorso Modulo 1", hours: 1 },
    ],
    pricePerEmployee: 89,
    recommendedFor: "Studi professionali, agenzie, software house, PA",
    tradAvgHourCost: 45,
  },
  {
    id: "ristorazione",
    name: "Ristorazione & Hospitality",
    icon: "🍽️",
    riskLevel: "medio",
    description: "HACCP, taglio, ustioni, scivolamenti, antincendio cucina.",
    totalHours: 12,
    modules: [
      { name: "Formazione Generale (4h)", hours: 4 },
      { name: "Specifica Ristorazione (8h)", hours: 8 },
      { name: "Antincendio Moduli 1-2", hours: 2 },
      { name: "Primo Soccorso Moduli 1-2", hours: 2 },
    ],
    pricePerEmployee: 119,
    recommendedFor: "Ristoranti, bar, mense, hotel, catering",
    tradAvgHourCost: 50,
  },
  {
    id: "logistica",
    name: "Logistica & Magazzino",
    icon: "📦",
    riskLevel: "medio",
    description: "Movimentazione carichi, carrelli elevatori, urti, cadute dall'alto.",
    totalHours: 14,
    modules: [
      { name: "Formazione Generale (4h)", hours: 4 },
      { name: "Specifica Aziende Rischio Medio (8h)", hours: 8 },
      { name: "Simulazione 3D Magazzino", hours: 1 },
      { name: "Antincendio Moduli 1-2", hours: 2 },
      { name: "Primo Soccorso Modulo 1", hours: 1 },
    ],
    pricePerEmployee: 139,
    recommendedFor: "Magazzini, e-commerce, corrieri, distribuzione",
    tradAvgHourCost: 55,
  },
  {
    id: "metalmeccanica",
    name: "Metalmeccanica & Industria",
    icon: "⚙️",
    riskLevel: "alto",
    description: "Macchine utensili, saldatura, rumore, vibrazioni, agenti chimici.",
    totalHours: 16,
    modules: [
      { name: "Formazione Generale (4h)", hours: 4 },
      { name: "Specifica Aziende Rischio Alto (12h)", hours: 12 },
      { name: "Simulazione 3D Safety Run", hours: 1 },
      { name: "Antincendio Moduli 1-2-3", hours: 4 },
      { name: "Primo Soccorso Moduli 1-2-3", hours: 4 },
    ],
    pricePerEmployee: 189,
    recommendedFor: "Officine, fonderie, carpenteria, manifattura pesante",
    tradAvgHourCost: 60,
  },
  {
    id: "cantieri",
    name: "Edilizia & Cantieri",
    icon: "🏗️",
    riskLevel: "alto",
    description: "Lavori in quota, ponteggi, DPI, scavi, MMC, agenti chimici.",
    totalHours: 16,
    modules: [
      { name: "Formazione Generale (4h)", hours: 4 },
      { name: "Specifica Aziende Rischio Alto (12h)", hours: 12 },
      { name: "Simulazione 3D Cantiere", hours: 1 },
      { name: "Antincendio Moduli 1-2-3", hours: 4 },
      { name: "Primo Soccorso Moduli 1-2-3", hours: 4 },
      { name: "Preposto", hours: 8 },
    ],
    pricePerEmployee: 219,
    recommendedFor: "Imprese edili, impiantisti, manutenzione, restauro",
    tradAvgHourCost: 65,
  },
];

export interface PlanTier {
  id: "starter" | "professional" | "enterprise";
  name: string;
  multiplier: number; // moltiplicatore sul prezzo base settoriale
  perks: string[];
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    multiplier: 0.7,
    perks: [
      "Accesso a moduli del pacchetto settoriale",
      "Attestati digitali conformi D.Lgs. 81/08",
      "Dashboard base e report PDF",
      "Supporto via email",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    multiplier: 1.0,
    perks: [
      "Tutto Starter +",
      "Simulazioni 3D illimitate e classifiche",
      "Analytics avanzata e alert scadenze",
      "Branding aziendale su attestati",
      "Supporto prioritario",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    multiplier: 1.4,
    perks: [
      "Tutto Professional +",
      "Ruoli RSPP, RLS, Preposto inclusi",
      "Modulo Cybersecurity Bonus",
      "API e SSO, multi-sede",
      "Customer Success dedicato e SLA",
    ],
  },
];

export const getSector = (id: string) => SECTOR_PACKAGES.find((s) => s.id === id);
export const getTier = (id: string) => PLAN_TIERS.find((t) => t.id === id);
