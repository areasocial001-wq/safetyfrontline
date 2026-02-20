import { useGLTF } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { toast } from "sonner";
import { generateProceduralRisks } from "@/lib/procedural-risk-generator";
import { Risk3D } from "@/data/scenarios3d";
import { GraphicsSettings } from "@/hooks/useGraphicsSettings";

interface GLTFEnvironmentProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onLoadComplete?: (boundingBox: THREE.Box3) => void;
  enableProceduralRisks?: boolean;
  onProceduralRisksGenerated?: (risks: Risk3D[]) => void;
  graphicsSettings?: GraphicsSettings;
}

/**
 * Component to load and render GLTF/GLB 3D models in the scene
 * Supports warehouse, factory, and other industrial environments
 */
export const GLTFEnvironment = ({ 
  modelPath, 
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onLoadComplete,
  enableProceduralRisks = false,
  onProceduralRisksGenerated,
  graphicsSettings
}: GLTFEnvironmentProps) => {
  console.log('[GLTFEnvironment] Component mounting with path:', modelPath);
  
  // Load GLTF model directly (hooks must be at top level)
  let gltfData;
  try {
    gltfData = useGLTF(modelPath);
    console.log('[GLTFEnvironment] useGLTF returned:', gltfData ? 'data' : 'null');
  } catch (error) {
    console.error('[GLTFEnvironment] Error loading GLTF:', error);
    toast.error(`Errore caricamento modello 3D: ${modelPath}`);
  }
  
  const scene = gltfData?.scene;
  const [isLoaded, setIsLoaded] = useState(false);
  const processedRef = useRef(false);
  
  console.log('[GLTFEnvironment] Scene object:', scene ? 'exists' : 'null');

  useEffect(() => {
    // Check if scene exists
    if (!scene) {
      console.error('[GLTF] Scene object is null! Model path:', modelPath);
      toast.error(`Impossibile caricare il modello: ${modelPath}`);
      return;
    }
    
    // Prevent multiple processing of the same model
    if (processedRef.current) {
      console.log('[GLTF] Model already processed, skipping');
      return;
    }
    processedRef.current = true;

    console.log(`[GLTF] Processing model: ${modelPath}`);
    const startTime = performance.now();

    // Calculate model bounding box
    const boundingBox = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    console.log(`[GLTF] Model dimensions:`, {
      width: size.x.toFixed(2),
      height: size.y.toFixed(2),
      depth: size.z.toFixed(2)
    });
    
    let meshCount = 0;
    let triangleCount = 0;
    let optimizedMeshes = 0;
    
    // Apply graphics settings
    const settings = graphicsSettings || {
      shadows: true,
      shadowQuality: 'medium',
      textureQuality: 4,
      maxTriangles: 150000,
      frustumCulling: true,
    };

    // Traverse the model and optimize
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        
        // Count triangles
        if (child.geometry) {
          const positions = child.geometry.attributes.position;
          if (positions) {
            const originalTriangles = positions.count / 3;
            triangleCount += originalTriangles;
            
            // Optimize geometry for large meshes
            if (originalTriangles > 1000) {
              child.geometry.computeBoundingSphere();
              child.geometry.computeBoundingBox();
              optimizedMeshes++;
            }
          }
        }
        
        // Apply shadow settings based on graphics quality
        if (settings.shadows && triangleCount < settings.maxTriangles) {
          child.castShadow = true;
          child.receiveShadow = true;
        } else {
          child.castShadow = false;
          child.receiveShadow = false;
        }
        
        // Optimize materials with quality settings
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.needsUpdate = true;
              if (mat.map) {
                mat.map.anisotropy = settings.textureQuality;
              }
            });
          } else {
            child.material.needsUpdate = true;
            if (child.material.map) {
              child.material.map.anisotropy = settings.textureQuality;
            }
          }
        }
        
        // Apply frustum culling setting
        child.frustumCulled = settings.frustumCulling;
      }
    });
    
    const loadTime = performance.now() - startTime;
    
    console.log(`[GLTF] Model optimized:`, {
      path: modelPath,
      meshes: meshCount,
      optimizedMeshes: optimizedMeshes,
      triangles: Math.round(triangleCount),
      trianglesPerMesh: Math.round(triangleCount / meshCount),
      loadTime: `${loadTime.toFixed(2)}ms`,
      scale: scale
    });
    
    const complexityWarning = triangleCount > 100000 ? " ⚠️ Modello complesso" : "";
    toast.success(`Modello 3D caricato: ${meshCount} mesh, ${Math.round(triangleCount / 1000)}k triangoli${complexityWarning} (${loadTime.toFixed(0)}ms)`);
    
    setIsLoaded(true);
    
    if (onLoadComplete) {
      onLoadComplete(boundingBox);
    }

    // Generate procedural risks if enabled (with delay for complex models)
    if (enableProceduralRisks && onProceduralRisksGenerated) {
      const delay = triangleCount > 50000 ? 1000 : 0;
      
      setTimeout(() => {
        console.log('[GLTF] Generating procedural risks...');
        try {
          const proceduralRisks = generateProceduralRisks(scene, {
            gridSize: 3 * scale,
            minDensityThreshold: 0.3,
            heightOffset: 0.5,
          });
          
          console.log('[GLTF] Generated procedural risks:', proceduralRisks.length);
          toast.info(`Generati ${proceduralRisks.length} rischi procedurali da analisi modello`);
          
          onProceduralRisksGenerated(proceduralRisks);
        } catch (error) {
          console.error('[GLTF] Error generating procedural risks:', error);
          toast.error('Errore generazione rischi procedurali');
          onProceduralRisksGenerated([]);
        }
      }, delay);
    }
  }, [scene, modelPath, scale]);

  // Show fallback cube if scene fails to load
  if (!scene) {
    console.error('[GLTF] Rendering fallback - scene is null');
    return (
      <group position={position}>
        <mesh position={[0, 2, -5]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#404040" />
        </mesh>
      </group>
    );
  }
  
  console.log('[GLTF] Rendering primitive with scene');
  return (
    <primitive 
      object={scene} 
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
};

// Preload models for better performance
useGLTF.preload('/models/factory.glb');
useGLTF.preload('/models/warehouse.glb');
