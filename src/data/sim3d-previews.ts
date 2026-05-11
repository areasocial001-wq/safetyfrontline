// Centralized preview metadata for the 5 3D scenarios.
// Each entry exposes both modern (WebP) and fallback (JPG) sources plus
// descriptive alt text optimised for accessibility & SEO.

import sim3dOfficeJpg from "@/assets/sim3d-office.jpg";
import sim3dOfficeWebp from "@/assets/sim3d-office.webp";
import sim3dWarehouseJpg from "@/assets/sim3d-warehouse.jpg";
import sim3dWarehouseWebp from "@/assets/sim3d-warehouse.webp";
import sim3dConstructionJpg from "@/assets/sim3d-construction.jpg";
import sim3dConstructionWebp from "@/assets/sim3d-construction.webp";
import sim3dFireJpg from "@/assets/sim3d-fire.jpg";
import sim3dFireWebp from "@/assets/sim3d-fire.webp";
import sim3dCyberJpg from "@/assets/sim3d-cyber.jpg";
import sim3dCyberWebp from "@/assets/sim3d-cyber.webp";

export interface Sim3dPreviewMeta {
  jpg: string;
  webp: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

// All previews are generated/exported at 1280x… ratio ~16:10
const W = 1280;
const H = 800;

export const SIM3D_PREVIEWS: Record<string, Sim3dPreviewMeta> = {
  office: {
    jpg: sim3dOfficeJpg,
    webp: sim3dOfficeWebp,
    alt: "Anteprima 3D dello scenario Ufficio Amministrativo: postazioni con cavi scoperti, estintore bloccato e uscita di emergenza ostruita",
    caption: "Ufficio · 6 rischi",
    width: W,
    height: H,
  },
  warehouse: {
    jpg: sim3dWarehouseJpg,
    webp: sim3dWarehouseWebp,
    alt: "Anteprima 3D dello scenario Magazzino Logistica con scaffalature industriali, bancali e carrelli elevatori",
    caption: "Magazzino · rischi misti",
    width: W,
    height: H,
  },
  construction: {
    jpg: sim3dConstructionJpg,
    webp: sim3dConstructionWebp,
    alt: "Anteprima 3D dello scenario Cantiere Edile con ponteggi, gru e scavi non protetti",
    caption: "Cantiere · alta difficoltà",
    width: W,
    height: H,
  },
  laboratory: {
    jpg: sim3dFireJpg,
    webp: sim3dFireWebp,
    alt: "Anteprima 3D della Simulazione Antincendio in prima persona con estintore e principio di incendio",
    caption: "Antincendio · first-person",
    width: W,
    height: H,
  },
  cybersecurity: {
    jpg: sim3dCyberJpg,
    webp: sim3dCyberWebp,
    alt: "Anteprima 3D dello scenario Cyber Security Office con post-it password, schermi sbloccati e chiavetta USB sospetta",
    caption: "Cyber Security · 8 rischi",
    width: W,
    height: H,
  },
};

// Map scenario id (from scenarios3D) -> preview key
export const getPreviewByScenarioId = (id: string): Sim3dPreviewMeta | undefined => {
  if (id === "cybersecurity") return SIM3D_PREVIEWS.cybersecurity;
  return SIM3D_PREVIEWS[id];
};
