import * as BABYLON from '@babylonjs/core';

/**
 * LOD (Level of Detail) System for Babylon.js scenes.
 * Automatically simplifies or hides meshes based on camera distance.
 */

export interface LODConfig {
  /** Distance thresholds for LOD levels */
  distances: {
    high: number;    // Full detail up to this distance
    medium: number;  // Simplified geometry up to this distance
    low: number;     // Minimal geometry up to this distance
    cull: number;    // Hide mesh beyond this distance
  };
}

const DEFAULT_LOD_CONFIG: Record<string, LODConfig> = {
  low: {
    distances: { high: 8, medium: 15, low: 25, cull: 40 },
  },
  medium: {
    distances: { high: 15, medium: 30, low: 50, cull: 80 },
  },
  high: {
    distances: { high: 25, medium: 50, low: 80, cull: 120 },
  },
  ultra: {
    distances: { high: 40, medium: 70, low: 100, cull: 150 },
  },
};

interface ManagedMesh {
  mesh: BABYLON.AbstractMesh;
  originalVertices: number;
  lodLevels: BABYLON.Mesh[];  // [medium, low] simplified versions
  currentLOD: 'high' | 'medium' | 'low' | 'culled';
  isStatic: boolean;
}

export class LODSystem {
  private managedMeshes: ManagedMesh[] = [];
  private config: LODConfig;
  private scene: BABYLON.Scene;
  private quality: string;
  private frameCounter = 0;
  private updateInterval: number;

  constructor(scene: BABYLON.Scene, quality: 'low' | 'medium' | 'high' | 'ultra') {
    this.scene = scene;
    this.quality = quality;
    this.config = DEFAULT_LOD_CONFIG[quality] || DEFAULT_LOD_CONFIG.medium;
    // Update LOD less frequently on lower quality
    this.updateInterval = quality === 'low' ? 15 : quality === 'medium' ? 10 : 5;
  }

  /**
   * Register a mesh for LOD management using Babylon's built-in LOD system.
   * For Mesh instances, creates decimated LOD levels.
   * For non-Mesh instances, uses simple visibility toggling.
   */
  registerMesh(mesh: BABYLON.AbstractMesh, isStatic = false): void {
    if (!mesh || mesh.isDisposed()) return;

    const entry: ManagedMesh = {
      mesh,
      originalVertices: mesh instanceof BABYLON.Mesh ? mesh.getTotalVertices() : 0,
      lodLevels: [],
      currentLOD: 'high',
      isStatic,
    };

    // Use Babylon's native LOD for Mesh instances with enough geometry
    if (mesh instanceof BABYLON.Mesh && mesh.geometry && entry.originalVertices > 100) {
      this.createNativeLOD(mesh);
    }

    this.managedMeshes.push(entry);
  }

  /**
   * Use Babylon's built-in addLODLevel for native GPU-level LOD switching.
   */
  private createNativeLOD(mesh: BABYLON.Mesh): void {
    const { distances } = this.config;

    try {
      // Medium LOD: simplified box proxy
      const mediumLOD = this.createSimplifiedProxy(mesh, `${mesh.name}_lod_med`, 0.5);
      if (mediumLOD) {
        mesh.addLODLevel(distances.medium, mediumLOD);
      }

      // Low LOD: very simplified proxy
      const lowLOD = this.createSimplifiedProxy(mesh, `${mesh.name}_lod_low`, 0.25);
      if (lowLOD) {
        mesh.addLODLevel(distances.low, lowLOD);
      }

      // Cull distance: null mesh = invisible
      mesh.addLODLevel(distances.cull, null);
    } catch (e) {
      // Silently fail — mesh will just render at full detail always
      console.warn(`[LOD] Could not create LOD for ${mesh.name}:`, e);
    }
  }

  /**
   * Create a simplified bounding-box proxy mesh that shares the same material.
   */
  private createSimplifiedProxy(
    original: BABYLON.Mesh,
    name: string,
    scaleFactor: number
  ): BABYLON.Mesh | null {
    try {
      const bounds = original.getBoundingInfo().boundingBox;
      const size = bounds.extendSize.scale(2);

      // Create a low-poly box matching the bounding box
      const proxy = BABYLON.MeshBuilder.CreateBox(name, {
        width: Math.max(size.x * scaleFactor, 0.1),
        height: Math.max(size.y, 0.1),
        depth: Math.max(size.z * scaleFactor, 0.1),
      }, this.scene);

      proxy.position = original.position.clone();
      proxy.rotation = original.rotation.clone();
      proxy.scaling = original.scaling.clone();
      proxy.material = original.material;
      proxy.isPickable = false;
      // NOTE: do NOT set isVisible = false. Babylon's LOD system swaps in this
      // mesh when the camera is far enough; hiding it here would make the
      // original furniture (desks, shelves, etc.) disappear at distance.
      proxy.checkCollisions = false;

      return proxy;
    } catch {
      return null;
    }
  }

  /**
   * Batch-register all qualifying meshes in the scene.
   * Call after all meshes are loaded.
   */
  registerSceneMeshes(excludePatterns: string[] = []): number {
    const defaultExcludes = [
      '__root__', 'ground', 'skybox', 'ceiling', 'floor', 'wall',
      'boundary', 'BackgroundPlane', 'BackgroundSkybox',
      '_indicator', '_check', '_lod_',
    ];
    const allExcludes = [...defaultExcludes, ...excludePatterns];

    let registered = 0;

    this.scene.meshes.forEach(mesh => {
      if (mesh.isDisposed()) return;
      // Skip already managed meshes
      if (this.managedMeshes.some(m => m.mesh === mesh)) return;
      // Skip excluded patterns
      if (allExcludes.some(p => mesh.name.includes(p))) return;
      // Skip very small meshes (UI elements, indicators)
      if (mesh instanceof BABYLON.Mesh && mesh.getTotalVertices() < 20) return;

      const isStatic = mesh.name.startsWith('rack_') ||
        mesh.name.startsWith('shelf_') ||
        mesh.name.includes('wall') ||
        mesh.name.includes('fence');

      this.registerMesh(mesh, isStatic);
      registered++;
    });

    console.log(`[LOD] Registered ${registered} meshes for LOD management (quality: ${this.quality})`);
    return registered;
  }

  /**
   * Update LOD for all managed meshes based on camera distance.
   * Call this from the render loop — it self-throttles.
   */
  update(cameraPosition: BABYLON.Vector3): void {
    this.frameCounter++;
    if (this.frameCounter % this.updateInterval !== 0) return;

    const { distances } = this.config;

    for (const entry of this.managedMeshes) {
      const { mesh } = entry;
      if (mesh.isDisposed()) continue;

      // Use absolute (world) position so parented meshes (e.g. machinery
      // children of a TransformNode at the construction site) are evaluated
      // against their actual world location, not their local offset.
      const worldPos = mesh.getAbsolutePosition();
      const dist = BABYLON.Vector3.Distance(cameraPosition, worldPos);

      // For meshes without native LOD, use simple enable/disable
      if (!(mesh instanceof BABYLON.Mesh) || entry.lodLevels.length === 0) {
        let newLOD: 'high' | 'medium' | 'low' | 'culled';
        if (dist <= distances.high) newLOD = 'high';
        else if (dist <= distances.medium) newLOD = 'medium';
        else if (dist <= distances.low) newLOD = 'low';
        else newLOD = 'culled';

        if (newLOD !== entry.currentLOD) {
          mesh.setEnabled(newLOD !== 'culled');
          entry.currentLOD = newLOD;
        }
      }
      // Native LOD meshes are handled automatically by Babylon
    }
  }

  /**
   * Get current LOD statistics for debugging/HUD.
   */
  getStats(): { total: number; high: number; medium: number; low: number; culled: number } {
    const stats = { total: this.managedMeshes.length, high: 0, medium: 0, low: 0, culled: 0 };
    for (const entry of this.managedMeshes) {
      stats[entry.currentLOD === 'culled' ? 'culled' : entry.currentLOD]++;
    }
    return stats;
  }

  /**
   * Cleanup all LOD resources.
   */
  dispose(): void {
    for (const entry of this.managedMeshes) {
      for (const lod of entry.lodLevels) {
        if (!lod.isDisposed()) lod.dispose();
      }
      // Remove LOD levels from original mesh
      if (entry.mesh instanceof BABYLON.Mesh && !entry.mesh.isDisposed()) {
        try {
          // Clear native LOD levels
          const lodLevels = (entry.mesh as any).getLODLevels?.();
          if (lodLevels) {
            for (const level of [...lodLevels]) {
              entry.mesh.removeLODLevel(level.mesh);
              if (level.mesh && !level.mesh.isDisposed()) level.mesh.dispose();
            }
          }
        } catch { /* ignore */ }
      }
    }
    this.managedMeshes = [];
    console.log('[LOD] System disposed');
  }
}
