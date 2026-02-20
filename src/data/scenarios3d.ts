export interface Risk3D {
  id: string;
  position: [number, number, number];
  found: boolean;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isManual?: boolean; // True for manually placed critical risks, false for procedural
}

export interface Scenario3D {
  id: string;
  type: 'warehouse' | 'construction' | 'laboratory' | 'office';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  risks: Risk3D[];
  environment: {
    lightingIntensity: number;
    ambientColor: string;
    fogDensity: number;
  };
  audio: {
    ambient: {
      type: 'warehouse' | 'construction' | 'laboratory' | 'office';
      volume: number;
    };
  };
  useGLTFModel?: boolean;
  gltfModelPath?: string;
  proceduralRisks?: {
    enabled: boolean;
    mode: 'replace' | 'merge'; // 'replace' = only procedural, 'merge' = combine with manual
    config?: {
      gridSize?: number;
      minDensityThreshold?: number;
      maxRisksPerZone?: number;
    };
  };
}

export const scenarios3D: Scenario3D[] = [
  {
    id: 'office',
    type: 'office',
    title: 'Ufficio Amministrativo',
    description: 'Ambiente d\'ufficio con rischi comuni di sicurezza sul lavoro',
    difficulty: 'easy',
    useGLTFModel: false, // Può essere true se si scarica un modello da Poly Pizza
    // gltfModelPath: '/models/office.glb', // Decommentare se si aggiunge il modello
    environment: {
      lightingIntensity: 0.8,
      ambientColor: '#ffffff',
      fogDensity: 0,
    },
    audio: {
      ambient: {
        type: 'office',
        volume: 0.3,
      },
    },
    risks: [
      {
        id: '1',
        position: [-8, 0.1, -3],
        found: false,
        label: 'Cavo elettrico scoperto',
        description: 'Cavo di alimentazione non protetto sul pavimento vicino alla postazione lavoro — rischio inciampo e folgorazione',
        severity: 'high',
        isManual: true,
      },
      {
        id: '2',
        position: [-14, 0.5, -1],
        found: false,
        label: 'Estintore bloccato da archivi',
        description: 'Estintore a muro non accessibile, ostruito da armadi e faldoni — viola il D.Lgs. 81/08',
        severity: 'critical',
        isManual: true,
      },
      {
        id: '3',
        position: [0, 0.5, 11],
        found: false,
        label: 'Uscita di emergenza ostruita',
        description: 'Porta di uscita bloccata da scatole e arredi in disuso — impedisce l\'evacuazione',
        severity: 'critical',
        isManual: true,
      },
      {
        id: '4',
        position: [-5, 0.02, 6],
        found: false,
        label: 'Pavimento bagnato non segnalato',
        description: 'Liquido versato vicino al distributore d\'acqua senza cartello di pericolo — rischio scivolamento',
        severity: 'medium',
        isManual: true,
      },
      {
        id: '5',
        position: [-13, 0.5, -6],
        found: false,
        label: 'Scaffalatura instabile sovraccarica',
        description: 'Armadio archivio non ancorato al muro e sovraccaricato di faldoni — rischio ribaltamento',
        severity: 'high',
        isManual: true,
      },
      {
        id: '6',
        position: [10, 0.5, -9],
        found: false,
        label: 'Luce di emergenza non funzionante',
        description: 'Plafoniera di sicurezza nella sala riunioni guasta — in caso di blackout l\'area è al buio totale',
        severity: 'low',
        isManual: true,
      },
    ],
  },
  {
    id: 'warehouse',
    type: 'warehouse',
    title: 'Magazzino Logistica',
    description: 'Magazzino industriale con movimentazione merci e bancali',
    difficulty: 'medium',
    useGLTFModel: true,
    gltfModelPath: '/models/warehouse.glb',
    proceduralRisks: {
      enabled: true,
      mode: 'merge', // Combine manual critical risks + procedural generation
      config: {
        gridSize: 3,
        minDensityThreshold: 0.4, // Higher threshold to avoid overlap with manual risks
      },
    },
    environment: {
      lightingIntensity: 0.6,
      ambientColor: '#fff5e6',
      fogDensity: 0.01,
    },
    audio: {
      ambient: {
        type: 'warehouse',
        volume: 0.4,
      },
    },
    risks: [
      // Manual critical risks - strategic positions that MUST be in specific locations
      {
        id: 'manual_1',
        position: [0, 1.2, -12],
        found: false,
        label: '🚨 Estintore bloccato',
        description: 'CRITICO: Estintore non accessibile - dispositivo antincendio ostruito da casse',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_2',
        position: [15, 0.8, -3],
        found: false,
        label: '🚨 Uscita emergenza ostruita',
        description: 'CRITICO: Via di fuga bloccata - uscita di sicurezza inaccessibile',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_3',
        position: [-5, 1.5, 5],
        found: false,
        label: '🔥 Materiale infiammabile esposto',
        description: 'CRITICO: Prodotti chimici pericolosi stoccati impropriamente senza protezione',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_4',
        position: [-12, 0.5, -8],
        found: false,
        label: '⚠️ Carrello elevatore incustodito',
        description: 'ALTO RISCHIO: Muletto operativo con chiavi inserite lasciato senza controllo',
        severity: 'high',
        isManual: true,
      },
      // Procedural risks will be automatically added by the system (isManual: false)
    ],
  },
  {
    id: 'construction',
    type: 'construction',
    title: 'Cantiere Edile',
    description: 'Area di costruzione con lavori in corso e macchinari pesanti',
    difficulty: 'hard',
    useGLTFModel: true,
    gltfModelPath: '/models/factory.glb',
    proceduralRisks: {
      enabled: true,
      mode: 'merge', // Combine manual critical risks + procedural generation
      config: {
        gridSize: 4,
        minDensityThreshold: 0.4, // Higher threshold for more selective procedural placement
      },
    },
    environment: {
      lightingIntensity: 0.7,
      ambientColor: '#ffe6cc',
      fogDensity: 0.02,
    },
    audio: {
      ambient: {
        type: 'construction',
        volume: 0.5,
      },
    },
    risks: [
      // Manual critical risks - life-threatening hazards in specific locations
      {
        id: 'manual_1',
        position: [8, 2.5, -5],
        found: false,
        label: '🚨 Carico sospeso senza delimitazione',
        description: 'CRITICO: Attrezzatura appesa senza area di sicurezza - rischio caduta oggetti',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_2',
        position: [-15, 3, -2],
        found: false,
        label: '⚡ Cavi elettrici esposti',
        description: 'CRITICO: Linee elettriche di cantiere danneggiate - rischio folgorazione',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_3',
        position: [12, 0.5, 3],
        found: false,
        label: '🪖 Operatore senza DPI obbligatori',
        description: 'CRITICO: Lavoratore in zona ad alto rischio senza dispositivi di protezione',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_4',
        position: [5, 0.3, -12],
        found: false,
        label: '🕳️ Scavo profondo non protetto',
        description: 'CRITICO: Trincea senza parapetti di sicurezza - rischio caduta',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_5',
        position: [-8, 3.5, 5],
        found: false,
        label: '🏗️ Ponteggio instabile',
        description: 'CRITICO: Struttura temporanea non ancorata - rischio crollo',
        severity: 'critical',
        isManual: true,
      },
      {
        id: 'manual_6',
        position: [-5, 1.2, -10],
        found: false,
        label: '⚠️ Scala danneggiata in uso',
        description: 'ALTO RISCHIO: Attrezzatura di accesso con gradini rotti',
        severity: 'high',
        isManual: true,
      },
      // Procedural risks will be added automatically (isManual: false)
    ],
  },
  {
    id: 'laboratory',
    type: 'laboratory',
    title: 'Simulazione Antincendio',
    description: 'Esercitazione sulle procedure di evacuazione e sull\'uso corretto degli estintori in un magazzino realistico',
    difficulty: 'hard',
    useGLTFModel: true,
    gltfModelPath: '/models/warehouse.glb',
    environment: {
      lightingIntensity: 0.7,
      ambientColor: '#ffe0cc',
      fogDensity: 0.015,
    },
    audio: {
      ambient: {
        type: 'laboratory',
        volume: 0.45,
      },
    },
    risks: [
      {
        id: '1',
        position: [3, 1, -3],
        found: false,
        label: '🔥 Principio di incendio non segnalato',
        description: 'Focolaio attivo vicino a materiale combustibile — attivare immediatamente l\'allarme',
        severity: 'critical',
        isManual: true,
      },
      {
        id: '2',
        position: [-4, 0.8, -4],
        found: false,
        label: '🧯 Estintore con sigillo rotto',
        description: 'Estintore manomesso o già utilizzato — non idoneo all\'uso in emergenza',
        severity: 'critical',
        isManual: true,
      },
      {
        id: '3',
        position: [5, 1.2, -6],
        found: false,
        label: '🚪 Porta tagliafuoco bloccata aperta',
        description: 'Porta REI tenuta aperta con un cuneo — impedisce il contenimento fumi e fiamme',
        severity: 'critical',
        isManual: true,
      },
      {
        id: '4',
        position: [-5, 1.5, -7],
        found: false,
        label: '🚨 Pulsante allarme ostruito',
        description: 'Punto di attivazione manuale dell\'allarme coperto da scaffalatura',
        severity: 'critical',
        isManual: true,
      },
      {
        id: '5',
        position: [6, 0.5, -9],
        found: false,
        label: '📋 Planimetria di evacuazione mancante',
        description: 'Piano di evacuazione non affisso — gli occupanti non conoscono le vie di fuga',
        severity: 'high',
        isManual: true,
      },
      {
        id: '6',
        position: [-3, 1, -10],
        found: false,
        label: '🚧 Via di fuga ostruita da scatoloni',
        description: 'Corridoio di evacuazione bloccato da materiale accatastato',
        severity: 'critical',
        isManual: true,
      },
      {
        id: '7',
        position: [4, 1.3, -11],
        found: false,
        label: '💡 Luce di emergenza non funzionante',
        description: 'Illuminazione di sicurezza guasta — in caso di blackout la via di fuga è al buio',
        severity: 'high',
        isManual: true,
      },
      {
        id: '8',
        position: [-6, 0.7, -8],
        found: false,
        label: '🧯 Estintore di tipo errato',
        description: 'Estintore ad acqua posizionato vicino a quadri elettrici — rischio elettrocuzione',
        severity: 'high',
        isManual: true,
      },
      {
        id: '9',
        position: [0, 1, -13],
        found: false,
        label: '🔌 Multipresa sovraccarica',
        description: 'Presa elettrica con troppi dispositivi collegati — rischio surriscaldamento e incendio',
        severity: 'high',
        isManual: true,
      },
    ],
  },
];

export const getDifficultyColor = (difficulty: Scenario3D['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600';
    case 'medium':
      return 'text-amber-600';
    case 'hard':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getDifficultyLabel = (difficulty: Scenario3D['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return 'Facile';
    case 'medium':
      return 'Medio';
    case 'hard':
      return 'Difficile';
    default:
      return 'Sconosciuto';
  }
};

export const getSeverityColor = (severity: Risk3D['severity']) => {
  switch (severity) {
    case 'low':
      return '#10b981';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    case 'critical':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};
