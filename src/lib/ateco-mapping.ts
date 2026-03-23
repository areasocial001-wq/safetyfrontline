// Mapping ATECO codes to Formazione Specifica macro-categories
// Uffici (ls_uffici): office/services/commerce - Risk: Low
// Aziende (ls_aziende): manufacturing/logistics/industry - Risk: Medium-High
// Ristorazione (ls_ristorazione): ATECO 55-56 - Risk: Medium

export type SpecificaCategory = 'ls_uffici' | 'ls_aziende' | 'ls_ristorazione';

export interface SpecificaCategoryInfo {
  id: SpecificaCategory;
  label: string;
  description: string;
  hours: string;
  risk: string;
}

export const SPECIFICA_CATEGORIES: Record<SpecificaCategory, SpecificaCategoryInfo> = {
  ls_uffici: {
    id: 'ls_uffici',
    label: 'Uffici',
    description: 'Attività d\'ufficio, commercio, servizi – Rischio Basso',
    hours: '4 ore',
    risk: 'Basso',
  },
  ls_aziende: {
    id: 'ls_aziende',
    label: 'Aziende / Industria',
    description: 'Manifattura, logistica, magazzino, produzione – Rischio Medio/Alto',
    hours: '8-12 ore',
    risk: 'Medio-Alto',
  },
  ls_ristorazione: {
    id: 'ls_ristorazione',
    label: 'Ristorazione',
    description: 'Alloggio e ristorazione (ATECO 55-56) – Rischio Medio',
    hours: '8 ore',
    risk: 'Medio',
  },
};

/**
 * Maps an ATECO code (2-digit prefix) to the corresponding Specifica module.
 * Returns null if no mapping found.
 */
export function getSpecificaFromAteco(atecoCode: string | null | undefined): SpecificaCategory | null {
  if (!atecoCode) return null;
  
  // Clean the code: take first 2 digits
  const prefix = atecoCode.replace(/\D/g, '').substring(0, 2);
  if (!prefix) return null;
  const code = parseInt(prefix, 10);

  // ATECO 55-56: Alloggio e Ristorazione
  if (code === 55 || code === 56) return 'ls_ristorazione';

  // ATECO codes for office/services/commerce (risk: low)
  // 45-47: Commercio, 58-63: Informazione/comunicazione, 64-66: Finanza/assicurazioni
  // 68: Immobiliare, 69-75: Professionali/scientifiche, 77-82: Noleggio/supporto imprese
  // 84: PA, 85: Istruzione, 86-88: Sanità/assistenza (note: some are medium/high)
  // 90-93: Arte/intrattenimento, 94-96: Servizi, 97-99: Organismi
  const officeServices = [45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 65, 66, 68, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 84, 85, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99];
  if (officeServices.includes(code)) return 'ls_uffici';

  // Everything else: manufacturing/industry/agriculture/construction/mining → Aziende
  // 01-09: Agriculture/mining, 10-33: Manufacturing, 35-39: Utilities/waste
  // 41-43: Construction, 49-53: Transport/logistics, 86-88: Healthcare (medium-high)
  return 'ls_aziende';
}
