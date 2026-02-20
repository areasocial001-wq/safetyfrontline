import { Box, Plane } from "@react-three/drei";
import * as THREE from "three";
import { GLTFEnvironment } from "./GLTFEnvironment";
import { Risk3D } from "@/data/scenarios3d";
import { GraphicsSettings } from "@/hooks/useGraphicsSettings";

interface WarehouseEnvironmentProps {
  useGLTFModel?: boolean;
  modelPath?: string;
  onModelLoaded?: (boundingBox: THREE.Box3) => void;
  enableProceduralRisks?: boolean;
  onProceduralRisksGenerated?: (risks: Risk3D[]) => void;
  graphicsSettings?: GraphicsSettings;
}

/**
 * Warehouse environment component
 * Can use either programmatic geometry or GLTF model
 */
export const WarehouseEnvironment = ({ 
  useGLTFModel = false,
  modelPath = '/models/warehouse.glb',
  onModelLoaded,
  enableProceduralRisks = false,
  onProceduralRisksGenerated,
  graphicsSettings
}: WarehouseEnvironmentProps) => {
  
  if (useGLTFModel) {
    console.log('[WarehouseEnvironment] Loading GLTF model:', modelPath);
    
    return (
      <>
        {/* Load GLTF warehouse model */}
        <GLTFEnvironment 
          modelPath={modelPath}
          scale={3}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          onLoadComplete={onModelLoaded}
          enableProceduralRisks={enableProceduralRisks}
          onProceduralRisksGenerated={onProceduralRisksGenerated}
          graphicsSettings={graphicsSettings}
        />
        
        {/* Ground plane for shadow */}
        <Plane 
          args={[100, 100]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
          receiveShadow={graphicsSettings?.shadows !== false}
        >
          <meshStandardMaterial color="#2a2a2a" />
        </Plane>
      </>
    );
  }

  // Programmatic warehouse geometry (fallback/default)
  return (
    <>
      {/* Ground */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#404040" />
      </Plane>

      {/* Walls */}
      <Box args={[50, 10, 0.5]} position={[0, 5, -25]} castShadow receiveShadow>
        <meshStandardMaterial color="#555555" />
      </Box>
      <Box args={[50, 10, 0.5]} position={[0, 5, 25]} castShadow receiveShadow>
        <meshStandardMaterial color="#555555" />
      </Box>
      <Box args={[0.5, 10, 50]} position={[-25, 5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#555555" />
      </Box>
      <Box args={[0.5, 10, 50]} position={[25, 5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#555555" />
      </Box>

      {/* Ceiling */}
      <Plane args={[50, 50]} rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <meshStandardMaterial color="#333333" />
      </Plane>

      {/* Warehouse racks */}
      <Box args={[8, 5, 2]} position={[-10, 2.5, -10]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[8, 5, 2]} position={[10, 2.5, -10]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[8, 5, 2]} position={[-10, 2.5, 10]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[8, 5, 2]} position={[10, 2.5, 10]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Yellow safety stripes on floor */}
      <Plane args={[0.3, 40]} rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.01, 0]}>
        <meshStandardMaterial color="#FFD700" />
      </Plane>
      <Plane args={[0.3, 40]} rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.01, 0]}>
        <meshStandardMaterial color="#FFD700" />
      </Plane>

      {/* Pallets and boxes */}
      <Box args={[1.2, 0.2, 1]} position={[-2, 0.1, -5]} castShadow receiveShadow>
        <meshStandardMaterial color="#CD853F" />
      </Box>
      <Box args={[0.8, 0.8, 0.8]} position={[-2, 0.6, -5]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B7355" />
      </Box>

      {/* Fire extinguisher */}
      <Box args={[0.3, 0.8, 0.3]} position={[8, 0.4, -15]} castShadow receiveShadow>
        <meshStandardMaterial color="#ff0000" />
      </Box>

      {/* Warning signs on walls */}
      <Box args={[1, 1, 0.1]} position={[0, 3, -24.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#FFD700" />
      </Box>
      <Box args={[1, 1, 0.1]} position={[-15, 3, -24.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#ff0000" />
      </Box>
    </>
  );
};
