import * as THREE from 'three';
import { Risk3D } from '@/data/scenarios3d';

interface GridCell {
  position: THREE.Vector3;
  meshCount: number;
  vertexCount: number;
  density: number;
  hasObjects: boolean;
}

interface ProceduralRiskConfig {
  gridSize: number; // Size of each grid cell for spatial analysis
  minDensityThreshold: number; // Minimum density to consider for risk placement
  maxRisksPerZone: number; // Maximum risks per high-density zone
  heightOffset: number; // Y offset for risk markers
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const defaultConfig: ProceduralRiskConfig = {
  gridSize: 3, // 3 units per cell
  minDensityThreshold: 0.3,
  maxRisksPerZone: 2,
  heightOffset: 0.5,
  severityDistribution: {
    critical: 0.2,
    high: 0.3,
    medium: 0.3,
    low: 0.2,
  },
};

/**
 * Analyzes a GLTF model and generates risk positions based on mesh/vertex density
 */
export class ProceduralRiskGenerator {
  private config: ProceduralRiskConfig;
  private gridCells: Map<string, GridCell>;
  private boundingBox: THREE.Box3;

  constructor(config: Partial<ProceduralRiskConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.gridCells = new Map();
    this.boundingBox = new THREE.Box3();
  }

  /**
   * Analyze a GLTF scene and generate procedural risk positions
   */
  public analyzeModel(scene: THREE.Object3D): Risk3D[] {
    console.log('[ProceduralRisk] Starting model analysis...');
    const startTime = performance.now();

    // Calculate bounding box
    this.boundingBox.setFromObject(scene);
    const size = new THREE.Vector3();
    this.boundingBox.getSize(size);

    console.log('[ProceduralRisk] Model bounds:', {
      width: size.x.toFixed(2),
      height: size.y.toFixed(2),
      depth: size.z.toFixed(2),
    });

    // Create spatial grid
    this.createSpatialGrid(size);

    // Analyze mesh density
    this.analyzeMeshDensity(scene);

    // Generate risk positions from high-density areas
    const risks = this.generateRisks();

    const analysisTime = performance.now() - startTime;
    console.log('[ProceduralRisk] Analysis complete:', {
      gridCells: this.gridCells.size,
      risksGenerated: risks.length,
      analysisTime: `${analysisTime.toFixed(2)}ms`,
    });

    return risks;
  }

  /**
   * Create a 3D spatial grid for density analysis
   */
  private createSpatialGrid(size: THREE.Vector3): void {
    const min = this.boundingBox.min;
    const gridSize = this.config.gridSize;

    const cellsX = Math.ceil(size.x / gridSize);
    const cellsZ = Math.ceil(size.z / gridSize);

    console.log('[ProceduralRisk] Creating grid:', {
      cellsX,
      cellsZ,
      totalCells: cellsX * cellsZ,
    });

    for (let x = 0; x < cellsX; x++) {
      for (let z = 0; z < cellsZ; z++) {
        const position = new THREE.Vector3(
          min.x + (x + 0.5) * gridSize,
          0,
          min.z + (z + 0.5) * gridSize
        );

        const key = `${x}_${z}`;
        this.gridCells.set(key, {
          position,
          meshCount: 0,
          vertexCount: 0,
          density: 0,
          hasObjects: false,
        });
      }
    }
  }

  /**
   * Analyze mesh and vertex density in each grid cell
   */
  private analyzeMeshDensity(scene: THREE.Object3D): void {
    let totalMeshes = 0;
    let totalVertices = 0;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        totalMeshes++;

        // Get mesh bounding box
        const meshBox = new THREE.Box3().setFromObject(child);
        const meshCenter = new THREE.Vector3();
        meshBox.getCenter(meshCenter);

        // Count vertices
        const positions = child.geometry.attributes.position;
        const vertexCount = positions ? positions.count : 0;
        totalVertices += vertexCount;

        // Find which grid cell this mesh belongs to
        const cellKey = this.getGridCellKey(meshCenter);
        const cell = this.gridCells.get(cellKey);

        if (cell) {
          cell.meshCount++;
          cell.vertexCount += vertexCount;
          cell.hasObjects = true;
        }
      }
    });

    // Calculate density for each cell
    const maxMeshCount = Math.max(...Array.from(this.gridCells.values()).map(c => c.meshCount));
    const maxVertexCount = Math.max(...Array.from(this.gridCells.values()).map(c => c.vertexCount));

    this.gridCells.forEach((cell) => {
      if (cell.hasObjects) {
        // Normalized density (0-1) based on mesh count and vertex count
        const meshDensity = maxMeshCount > 0 ? cell.meshCount / maxMeshCount : 0;
        const vertexDensity = maxVertexCount > 0 ? cell.vertexCount / maxVertexCount : 0;
        
        // Combined density score
        cell.density = (meshDensity * 0.6 + vertexDensity * 0.4);
      }
    });

    console.log('[ProceduralRisk] Density analysis:', {
      totalMeshes,
      totalVertices,
      maxMeshCount,
      maxVertexCount,
      cellsWithObjects: Array.from(this.gridCells.values()).filter(c => c.hasObjects).length,
    });
  }

  /**
   * Get grid cell key from world position
   */
  private getGridCellKey(position: THREE.Vector3): string {
    const min = this.boundingBox.min;
    const gridSize = this.config.gridSize;

    const x = Math.floor((position.x - min.x) / gridSize);
    const z = Math.floor((position.z - min.z) / gridSize);

    return `${x}_${z}`;
  }

  /**
   * Generate risks in high-density areas
   */
  private generateRisks(): Risk3D[] {
    const risks: Risk3D[] = [];

    // Get cells sorted by density
    const highDensityCells = Array.from(this.gridCells.values())
      .filter(cell => cell.density >= this.config.minDensityThreshold)
      .sort((a, b) => b.density - a.density);

    console.log('[ProceduralRisk] High-density cells found:', highDensityCells.length);

    // Generate risks from high-density zones
    const numRisks = Math.min(
      highDensityCells.length,
      Math.floor(highDensityCells.length * 0.4) // Use 40% of high-density areas
    );

    for (let i = 0; i < numRisks; i++) {
      const cell = highDensityCells[i];
      
      // Add small random offset within cell
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * this.config.gridSize * 0.5,
        this.config.heightOffset,
        (Math.random() - 0.5) * this.config.gridSize * 0.5
      );

      const position: [number, number, number] = [
        cell.position.x + offset.x,
        offset.y,
        cell.position.z + offset.z,
      ];

      const severity = this.selectSeverity(cell.density);
      const riskData = this.generateRiskData(i + 1, severity, cell.density);

      risks.push({
        id: `proc_${i + 1}`,
        position,
        found: false,
        label: riskData.label,
        description: riskData.description,
        severity,
        isManual: false, // Mark as procedurally generated
      });
    }

    return risks;
  }

  /**
   * Select severity based on density and distribution config
   */
  private selectSeverity(density: number): Risk3D['severity'] {
    // Higher density = higher chance of critical/high severity
    const rand = Math.random();
    const densityBonus = density * 0.3; // Boost critical/high for higher density

    if (rand < this.config.severityDistribution.critical + densityBonus) {
      return 'critical';
    } else if (rand < this.config.severityDistribution.critical + this.config.severityDistribution.high + densityBonus) {
      return 'high';
    } else if (rand < 1 - this.config.severityDistribution.low) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate contextual risk data based on severity and density
   */
  private generateRiskData(
    index: number,
    severity: Risk3D['severity'],
    density: number
  ): { label: string; description: string } {
    const highDensity = density > 0.7;

    const riskTemplates = {
      critical: [
        {
          label: 'Area ad alto rischio',
          description: 'Zona con elevata concentrazione di attrezzature e materiali pericolosi',
        },
        {
          label: 'Sovraccarico strutturale',
          description: 'Accumulo eccessivo di materiali in area ristretta',
        },
        {
          label: 'Percorso di evacuazione bloccato',
          description: 'Via di fuga ostruita da materiali e attrezzature',
        },
      ],
      high: [
        {
          label: 'Disordine pericoloso',
          description: 'Materiali non organizzati che ostacolano il movimento sicuro',
        },
        {
          label: 'Attrezzatura non messa in sicurezza',
          description: 'Macchinari e strumenti lasciati in area operativa',
        },
        {
          label: 'Rischio inciampo',
          description: 'Oggetti sparsi sul pavimento in zona di passaggio',
        },
      ],
      medium: [
        {
          label: 'Area congestionata',
          description: 'Spazio di lavoro ridotto dalla presenza di materiali',
        },
        {
          label: 'Stoccaggio improprio',
          description: 'Materiali non posizionati secondo le procedure di sicurezza',
        },
        {
          label: 'Visibilità ridotta',
          description: 'Oggetti che limitano la visuale in area operativa',
        },
      ],
      low: [
        {
          label: 'Disordine lieve',
          description: 'Area di lavoro non perfettamente organizzata',
        },
        {
          label: 'Housekeeping insufficiente',
          description: 'Pulizia e ordine non conformi agli standard',
        },
      ],
    };

    const templates = riskTemplates[severity];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return {
      label: `${template.label} #${index}`,
      description: highDensity
        ? `${template.description} (zona ad alta densità)`
        : template.description,
    };
  }
}

/**
 * Helper function to generate procedural risks from a GLTF scene
 */
export function generateProceduralRisks(
  scene: THREE.Object3D,
  config?: Partial<ProceduralRiskConfig>
): Risk3D[] {
  const generator = new ProceduralRiskGenerator(config);
  return generator.analyzeModel(scene);
}
