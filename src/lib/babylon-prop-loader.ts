import * as BABYLON from '@babylonjs/core';
import { PropConfig } from '@/types/prop-config';
import { toast } from 'sonner';

/**
 * Load multiple GLTF props into a Babylon.js scene with optimizations
 */
export async function loadGLTFProps(
  scene: BABYLON.Scene,
  props: PropConfig[],
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
): Promise<void> {
  if (!props || props.length === 0) {
    console.log('[PropLoader] No props to load');
    return;
  }

  console.log(`[PropLoader] Loading ${props.length} GLTF props...`);
  const startTime = performance.now();

  const loadPromises = props.map(prop => 
    loadSingleProp(scene, prop, quality, shadowGenerator)
  );

  const results = await Promise.allSettled(loadPromises);
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  const loadTime = performance.now() - startTime;
  console.log(`[PropLoader] Loaded ${succeeded}/${props.length} props in ${loadTime.toFixed(0)}ms`);
  
  if (succeeded > 0) {
    toast.success(`✅ ${succeeded} Props caricati (${loadTime.toFixed(0)}ms)`);
  }
  if (failed > 0) {
    console.warn(`[PropLoader] ${failed} props failed to load`);
    toast.warning(`⚠️ ${failed} Props non disponibili`);
  }
}

/**
 * Load a single GLTF prop with position, rotation, scale, and optimization
 */
async function loadSingleProp(
  scene: BABYLON.Scene,
  prop: PropConfig,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
): Promise<void> {
  try {
    console.log(`[PropLoader] Loading prop: ${prop.id} from ${prop.modelPath}`);
    
    const result = await BABYLON.SceneLoader.ImportMeshAsync('', '', prop.modelPath, scene);

    if (!result.meshes || result.meshes.length === 0) {
      throw new Error(`No meshes found in ${prop.modelPath}`);
    }

    const rootMesh = result.meshes[0];
    rootMesh.name = prop.id;

    // Apply scale
    if (prop.scale) {
      rootMesh.scaling = typeof prop.scale === 'number' 
        ? new BABYLON.Vector3(prop.scale, prop.scale, prop.scale)
        : new BABYLON.Vector3(prop.scale[0], prop.scale[1], prop.scale[2]);
    }

    // Apply position
    rootMesh.position = new BABYLON.Vector3(
      prop.position[0], 
      prop.position[1], 
      prop.position[2]
    );

    // Apply rotation
    if (prop.rotation) {
      rootMesh.rotation = new BABYLON.Vector3(
        prop.rotation[0], 
        prop.rotation[1], 
        prop.rotation[2]
      );
    }

    // Optimize and configure all child meshes
    result.meshes.forEach(mesh => {
      if (mesh.name === '__root__') return;

      // Collision detection
      if (prop.enableCollisions) {
        mesh.checkCollisions = true;
      }

      // Shadows (skip on low quality)
      if (quality !== 'low') {
        if (prop.receiveShadows) {
          mesh.receiveShadows = true;
        }
        if (prop.castShadows && shadowGenerator) {
          shadowGenerator.addShadowCaster(mesh);
        }
      }

      // Performance optimizations
      if (mesh instanceof BABYLON.Mesh) {
        mesh.freezeWorldMatrix();
        mesh.doNotSyncBoundingInfo = true;
      }

      // Freeze materials for better performance
      if (mesh.material) {
        mesh.material.freeze();
      }
    });

    console.log(`[PropLoader] ✓ Loaded prop: ${prop.id} (${result.meshes.length} meshes)`);
  } catch (error) {
    console.error(`[PropLoader] ✗ Failed to load prop: ${prop.id}`, error);
    throw error;
  }
}
