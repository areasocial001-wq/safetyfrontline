// Catalogo completo dei moduli formativi disponibili per i pacchetti aziendali
export interface TrainingModuleInfo {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export const ALL_TRAINING_MODULES: TrainingModuleInfo[] = [
  // Simulazioni 3D / Giochi
  { id: "office", name: "Office Hazard Quest - Sicurezza in Ufficio", icon: "🏢", category: "Simulazioni" },
  { id: "warehouse", name: "Magazzino 2.5D - Movimentazione Merci", icon: "📦", category: "Simulazioni" },
  { id: "general", name: "Safety Run - Rischi Generali", icon: "⚠️", category: "Simulazioni" },

  // Formazione Generale
  { id: "formazione_basso", name: "Formazione Generale - Rischio Basso (4h)", icon: "🟢", category: "Formazione Generale" },
  { id: "formazione_medio", name: "Formazione Generale - Rischio Medio (8h)", icon: "🟡", category: "Formazione Generale" },
  { id: "formazione_alto", name: "Formazione Generale - Rischio Alto (12h)", icon: "🔴", category: "Formazione Generale" },

  // Formazione Specifica
  { id: "specifica_uffici", name: "Formazione Specifica - Uffici", icon: "🏢", category: "Formazione Specifica" },
  { id: "specifica_aziende", name: "Formazione Specifica - Aziende", icon: "🏭", category: "Formazione Specifica" },
  { id: "specifica_ristorazione", name: "Formazione Specifica - Ristorazione", icon: "🍽️", category: "Formazione Specifica" },

  // Antincendio
  { id: "antincendio_m1", name: "Antincendio - Modulo 1", icon: "🔥", category: "Antincendio" },
  { id: "antincendio_m2", name: "Antincendio - Modulo 2", icon: "🔥", category: "Antincendio" },
  { id: "antincendio_m3", name: "Antincendio - Modulo 3", icon: "🔥", category: "Antincendio" },

  // Primo Soccorso
  { id: "primo_soccorso_m1", name: "Primo Soccorso - Modulo 1", icon: "🚑", category: "Primo Soccorso" },
  { id: "primo_soccorso_m2", name: "Primo Soccorso - Modulo 2", icon: "🚑", category: "Primo Soccorso" },
  { id: "primo_soccorso_m3", name: "Primo Soccorso - Modulo 3", icon: "🚑", category: "Primo Soccorso" },

  // Ruoli
  { id: "rspp_datore", name: "RSPP Datore di Lavoro - Modulo 1", icon: "👔", category: "Ruoli" },
  { id: "rspp_datore_m2", name: "RSPP Datore di Lavoro - Modulo 2", icon: "👔", category: "Ruoli" },
  { id: "rspp_datore_m3", name: "RSPP Datore di Lavoro - Modulo 3", icon: "👔", category: "Ruoli" },
  { id: "rspp_datore_m4", name: "RSPP Datore di Lavoro - Modulo 4", icon: "👔", category: "Ruoli" },
  { id: "rls", name: "RLS - Modulo 1", icon: "🛡️", category: "Ruoli" },
  { id: "rls_m2", name: "RLS - Modulo 2", icon: "🛡️", category: "Ruoli" },
  { id: "rls_m3", name: "RLS - Modulo 3", icon: "🛡️", category: "Ruoli" },
  { id: "preposto", name: "Preposto - Modulo 1", icon: "📋", category: "Ruoli" },
  { id: "preposto_m2", name: "Preposto - Modulo 2", icon: "📋", category: "Ruoli" },
  { id: "preposto_m3", name: "Preposto - Modulo 3", icon: "📋", category: "Ruoli" },

  // Specialistici
  { id: "cybersecurity", name: "Cybersecurity Office", icon: "💻", category: "Specialistici" },
];

export const getModuleInfo = (id: string): TrainingModuleInfo | undefined =>
  ALL_TRAINING_MODULES.find((m) => m.id === id);
