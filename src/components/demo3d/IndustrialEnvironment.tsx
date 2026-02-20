import { Box, Plane, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { GLTFEnvironment } from "./GLTFEnvironment";
import { Risk3D } from "@/data/scenarios3d";
import { GraphicsSettings } from "@/hooks/useGraphicsSettings";

interface IndustrialEnvironmentProps {
  useGLTFModel?: boolean;
  modelPath?: string;
  type?: 'factory' | 'construction' | 'laboratory';
  onModelLoaded?: (boundingBox: THREE.Box3) => void;
  enableProceduralRisks?: boolean;
  onProceduralRisksGenerated?: (risks: Risk3D[]) => void;
  graphicsSettings?: GraphicsSettings;
}

/**
 * Industrial environment component for factory, construction, and laboratory scenarios
 * Can use either programmatic geometry or GLTF models
 */
export const IndustrialEnvironment = ({ 
  useGLTFModel = false,
  modelPath = '/models/factory.glb',
  type = 'factory',
  onModelLoaded,
  enableProceduralRisks = false,
  onProceduralRisksGenerated,
  graphicsSettings
}: IndustrialEnvironmentProps) => {
  
  if (useGLTFModel) {
    console.log('[IndustrialEnvironment] Loading GLTF model:', modelPath, 'for type:', type);
    
    return (
      <>
        {/* Load GLTF industrial model */}
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
          args={[120, 120]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
          receiveShadow={graphicsSettings?.shadows !== false}
        >
          <meshStandardMaterial color="#2a2a2a" />
        </Plane>
      </>
    );
  }

  // Programmatic industrial geometry (fallback/default)
  const getEnvironmentColor = () => {
    switch(type) {
      case 'factory': return '#4a5560';
      case 'construction': return '#6b5d4f';
      case 'laboratory': return '#e8e8e8';
      default: return '#4a5560';
    }
  };

  const getFloorColor = () => {
    switch(type) {
      case 'factory': return '#3a3a3a';
      case 'construction': return '#8b7355';
      case 'laboratory': return '#f0f0f0';
      default: return '#3a3a3a';
    }
  };

  return (
    <>
      {/* Ground/Floor */}
      <Plane args={[60, 60]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color={getFloorColor()} />
      </Plane>

      {/* Walls */}
      <Box args={[60, 12, 0.5]} position={[0, 6, -30]} castShadow receiveShadow>
        <meshStandardMaterial color={getEnvironmentColor()} />
      </Box>
      <Box args={[60, 12, 0.5]} position={[0, 6, 30]} castShadow receiveShadow>
        <meshStandardMaterial color={getEnvironmentColor()} />
      </Box>
      <Box args={[0.5, 12, 60]} position={[-30, 6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={getEnvironmentColor()} />
      </Box>
      <Box args={[0.5, 12, 60]} position={[30, 6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={getEnvironmentColor()} />
      </Box>

      {/* Ceiling with exposed pipes */}
      <Plane args={[60, 60]} rotation={[Math.PI / 2, 0, 0]} position={[0, 12, 0]} receiveShadow>
        <meshStandardMaterial color="#2a2a2a" />
      </Plane>

      {/* Industrial pipes along ceiling */}
      <Cylinder args={[0.2, 0.2, 50]} position={[-5, 11, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#708090" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 50]} position={[5, 11, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#708090" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Yellow and black safety stripes on floor */}
      <Plane args={[0.4, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.01, 0]}>
        <meshStandardMaterial color="#FFD700" />
      </Plane>
      <Plane args={[0.4, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[8, 0.01, 0]}>
        <meshStandardMaterial color="#FFD700" />
      </Plane>

      {/* Machinery/Equipment */}
      <Box args={[3, 2, 2]} position={[-15, 1, -15]} castShadow receiveShadow>
        <meshStandardMaterial color="#708090" metalness={0.6} roughness={0.4} />
      </Box>
      <Box args={[2, 3, 2]} position={[15, 1.5, -15]} castShadow receiveShadow>
        <meshStandardMaterial color="#556b2f" />
      </Box>
      <Cylinder args={[1, 1, 2.5]} position={[-15, 1.25, 15]} castShadow receiveShadow>
        <meshStandardMaterial color="#b8860b" metalness={0.5} roughness={0.5} />
      </Cylinder>

      {/* Industrial crates and containers */}
      <Box args={[1.5, 1.5, 1.5]} position={[-5, 0.75, -10]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B7355" />
      </Box>
      <Box args={[1.2, 1.8, 1.2]} position={[5, 0.9, -10]} castShadow receiveShadow>
        <meshStandardMaterial color="#CD853F" />
      </Box>

      {/* Fire extinguisher on wall */}
      <Box args={[0.3, 0.9, 0.3]} position={[-12, 0.5, -29.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#ff0000" />
      </Box>

      {/* Emergency exit sign */}
      <Box args={[1.5, 0.5, 0.1]} position={[0, 8, -29.8]} castShadow>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </Box>

      {/* Warning/Safety signs on walls */}
      <Box args={[1, 1, 0.1]} position={[-20, 4, -29.8]} castShadow>
        <meshStandardMaterial color="#FFD700" />
      </Box>
      <Box args={[1, 1, 0.1]} position={[20, 4, -29.8]} castShadow>
        <meshStandardMaterial color="#ff6600" />
      </Box>
      <Box args={[1, 1, 0.1]} position={[-29.8, 4, -10]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <meshStandardMaterial color="#ff0000" />
      </Box>

      {/* Industrial lighting fixtures */}
      <Box args={[2, 0.3, 0.8]} position={[-10, 11.5, -10]} castShadow>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </Box>
      <Box args={[2, 0.3, 0.8]} position={[10, 11.5, -10]} castShadow>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </Box>
      <Box args={[2, 0.3, 0.8]} position={[-10, 11.5, 10]} castShadow>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </Box>
      <Box args={[2, 0.3, 0.8]} position={[10, 11.5, 10]} castShadow>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </Box>

      {/* Gas cylinders (laboratory/construction) */}
      {(type === 'laboratory' || type === 'construction') && (
        <>
          <Cylinder args={[0.3, 0.3, 1.5]} position={[12, 0.75, 18]} castShadow receiveShadow>
            <meshStandardMaterial color="#ff4500" metalness={0.7} roughness={0.3} />
          </Cylinder>
          <Cylinder args={[0.3, 0.3, 1.5]} position={[13, 0.75, 18]} castShadow receiveShadow>
            <meshStandardMaterial color="#1e90ff" metalness={0.7} roughness={0.3} />
          </Cylinder>
        </>
      )}

      {/* Construction equipment (construction type only) */}
      {type === 'construction' && (
        <>
          <Box args={[2, 0.8, 2]} position={[8, 0.4, 8]} castShadow receiveShadow>
            <meshStandardMaterial color="#ff8c00" />
          </Box>
          <Cylinder args={[0.5, 0.5, 0.3]} position={[7, 0.15, 9]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <meshStandardMaterial color="#000000" />
          </Cylinder>
          <Cylinder args={[0.5, 0.5, 0.3]} position={[9, 0.15, 9]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <meshStandardMaterial color="#000000" />
          </Cylinder>
        </>
      )}

      {/* Laboratory tables and equipment (laboratory type only) */}
      {type === 'laboratory' && (
        <>
          <Box args={[4, 0.1, 2]} position={[-8, 0.9, 5]} castShadow receiveShadow>
            <meshStandardMaterial color="#ffffff" />
          </Box>
          <Box args={[0.1, 0.9, 0.1]} position={[-9.5, 0.45, 4]} castShadow receiveShadow>
            <meshStandardMaterial color="#c0c0c0" />
          </Box>
          <Box args={[0.1, 0.9, 0.1]} position={[-6.5, 0.45, 4]} castShadow receiveShadow>
            <meshStandardMaterial color="#c0c0c0" />
          </Box>
          <Box args={[0.1, 0.9, 0.1]} position={[-9.5, 0.45, 6]} castShadow receiveShadow>
            <meshStandardMaterial color="#c0c0c0" />
          </Box>
          <Box args={[0.1, 0.9, 0.1]} position={[-6.5, 0.45, 6]} castShadow receiveShadow>
            <meshStandardMaterial color="#c0c0c0" />
          </Box>
        </>
      )}
    </>
  );
};
