import { Scenario } from "@/types/demo";
import officeImage from "@/assets/office-module.jpg";
import warehouseImage from "@/assets/warehouse-module.jpg";

export const scenarios: Scenario[] = [
  {
    id: 'office-scenario',
    type: 'office',
    title: 'Office Hazard Quest',
    description: 'Identifica i rischi presenti nell\'ufficio: postura, cavi, illuminazione e attrezzature.',
    imageUrl: officeImage,
    timeLimit: 90,
    risks: [
      {
        id: 'cables-floor',
        x: 45,
        y: 75,
        size: 80,
        description: 'Cavi elettrici sul pavimento - rischio inciampo',
        severity: 'high',
        points: 150
      },
      {
        id: 'posture',
        x: 52,
        y: 55,
        size: 70,
        description: 'Postura scorretta alla scrivania - ergonomia',
        severity: 'medium',
        points: 100
      },
      {
        id: 'clutter',
        x: 72,
        y: 45,
        size: 60,
        description: 'Scaffalature disordinate - rischio caduta oggetti',
        severity: 'medium',
        points: 100
      },
      {
        id: 'warning-signs',
        x: 18,
        y: 30,
        size: 50,
        description: 'Segnali di pericolo visibili - elemento corretto!',
        severity: 'low',
        points: 50
      },
      {
        id: 'exit-blocked',
        x: 85,
        y: 65,
        size: 65,
        description: 'Scatole vicino alle uscite - ostacolo evacuazione',
        severity: 'high',
        points: 150
      }
    ]
  },
  {
    id: 'warehouse-scenario',
    type: 'warehouse',
    title: 'Magazzino 2.5D',
    description: 'Riconosci i pericoli nel magazzino: muletti, carichi, percorsi e segnaletica.',
    imageUrl: warehouseImage,
    timeLimit: 120,
    risks: [
      {
        id: 'forklift-path',
        x: 35,
        y: 60,
        size: 90,
        description: 'Muletto in movimento - zona di pericolo',
        severity: 'high',
        points: 200
      },
      {
        id: 'pallet-stack',
        x: 55,
        y: 35,
        size: 75,
        description: 'Bancali impilati instabili - rischio crollo',
        severity: 'high',
        points: 150
      },
      {
        id: 'no-safety-vest',
        x: 28,
        y: 55,
        size: 60,
        description: 'Operatore senza gilet alta visibilità',
        severity: 'medium',
        points: 100
      },
      {
        id: 'floor-marking',
        x: 50,
        y: 78,
        size: 80,
        description: 'Segnaletica a terra ben visibile - corretto!',
        severity: 'low',
        points: 50
      },
      {
        id: 'exit-signs',
        x: 70,
        y: 25,
        size: 55,
        description: 'Segnalazione di sicurezza presente - corretto!',
        severity: 'low',
        points: 50
      },
      {
        id: 'narrow-passage',
        x: 75,
        y: 55,
        size: 70,
        description: 'Passaggio ristretto con merce - rischio collisione',
        severity: 'medium',
        points: 100
      }
    ]
  }
];
