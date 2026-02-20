import { Box, Line, Text } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";

interface ModelDebuggerProps {
  enabled?: boolean;
  boundingBox?: THREE.Box3;
  risks?: Array<{ id: string; position: [number, number, number]; label: string }>;
}

/**
 * Debug component to visualize model dimensions, bounding boxes, and risk positions
 * Useful for testing GLTF model scale and collision detection
 */
export const ModelDebugger = ({ 
  enabled = false, 
  boundingBox,
  risks = []
}: ModelDebuggerProps) => {
  const [dimensions, setDimensions] = useState<THREE.Vector3 | null>(null);
  const [center, setCenter] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (boundingBox) {
      const size = new THREE.Vector3();
      const centerPoint = new THREE.Vector3();
      
      boundingBox.getSize(size);
      boundingBox.getCenter(centerPoint);
      
      setDimensions(size);
      setCenter(centerPoint);
      
      console.log('[ModelDebugger] Bounding box info:', {
        center: { x: centerPoint.x.toFixed(2), y: centerPoint.y.toFixed(2), z: centerPoint.z.toFixed(2) },
        size: { width: size.x.toFixed(2), height: size.y.toFixed(2), depth: size.z.toFixed(2) }
      });
    }
  }, [boundingBox]);

  if (!enabled) return null;

  return (
    <>
      {/* Bounding box visualization */}
      {boundingBox && dimensions && center && (
        <>
          {/* Semi-transparent box showing model bounds */}
          <Box 
            args={[dimensions.x, dimensions.y, dimensions.z]} 
            position={[center.x, center.y, center.z]}
          >
            <meshBasicMaterial color="#00ff00" wireframe transparent opacity={0.3} />
          </Box>
          
          {/* Ground grid reference */}
          <gridHelper args={[50, 50, '#444444', '#222222']} position={[0, 0.01, 0]} />
          
          {/* Axis helpers at origin */}
          <axesHelper args={[5]} />
          
          {/* Center point marker */}
          <Box args={[0.5, 0.5, 0.5]} position={[center.x, center.y, center.z]}>
            <meshBasicMaterial color="#ffff00" />
          </Box>
          
          {/* Dimension labels */}
          <Text
            position={[center.x, dimensions.y + 1, center.z]}
            fontSize={0.5}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
          >
            {`W:${dimensions.x.toFixed(1)} H:${dimensions.y.toFixed(1)} D:${dimensions.z.toFixed(1)}`}
          </Text>
        </>
      )}

      {/* Risk positions visualization */}
      {risks.map((risk) => (
        <group key={risk.id}>
          {/* Risk sphere marker */}
          <Box args={[0.3, 0.3, 0.3]} position={risk.position}>
            <meshBasicMaterial color="#ff0000" wireframe />
          </Box>
          
          {/* Risk label */}
          <Text
            position={[risk.position[0], risk.position[1] + 0.5, risk.position[2]]}
            fontSize={0.25}
            color="#ff0000"
            anchorX="center"
            anchorY="bottom"
          >
            {risk.label}
          </Text>
          
          {/* Line from ground to risk */}
          <Line
            points={[
              [risk.position[0], 0, risk.position[2]],
              [risk.position[0], risk.position[1], risk.position[2]]
            ]}
            color="#ff0000"
            lineWidth={2}
            dashed
          />
        </group>
      ))}

      {/* Player spawn point */}
      <Box args={[0.5, 1.6, 0.5]} position={[0, 0.8, 0]}>
        <meshBasicMaterial color="#0000ff" wireframe transparent opacity={0.5} />
      </Box>
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#0000ff"
        anchorX="center"
        anchorY="bottom"
      >
        SPAWN
      </Text>
    </>
  );
};
