import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Box, Plane, Text } from "@react-three/drei";
import * as THREE from "three";
import { Scenario3D, Risk3D, getSeverityColor } from "@/data/scenarios3d";
import { AmbientAudioPlayer, VoiceOverPlayer, SpatialAudioManager } from "@/lib/audio-system";
import { CollisionSystem, CameraShake } from "@/lib/collision-system";
import { WarehouseEnvironment } from "./WarehouseEnvironment";
import { IndustrialEnvironment } from "./IndustrialEnvironment";
import { ModelDebugger } from "./ModelDebugger";
import { ParticleEffects } from "./ParticleEffects";
import { GraphicsSettings } from "@/hooks/useGraphicsSettings";

import { TouchMovement } from "@/hooks/useTouchControls";
import { GyroscopeData } from "@/hooks/useGyroscope";

interface FirstPersonSceneProps {
  scenario: Scenario3D;
  isActive: boolean;
  onRiskFound: (riskId: string) => void;
  risksFound: number;
  totalRisks: number;
  onPlayerPositionUpdate?: (position: [number, number, number], rotation: number) => void;
  onCriticalRiskFound?: () => void;
  onExplorationUpdate?: (exploredCells: Set<string>) => void;
  onKeysUpdate?: (keys: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => void;
  touchMovement?: TouchMovement;
  gyroscopeData?: GyroscopeData | null;
  isGyroscopeEnabled?: boolean;
  graphicsSettings?: GraphicsSettings;
}

export const FirstPersonScene = ({
  scenario,
  isActive,
  onRiskFound,
  risksFound,
  totalRisks,
  onPlayerPositionUpdate,
  onCriticalRiskFound,
  onExplorationUpdate,
  onKeysUpdate,
  touchMovement,
  gyroscopeData,
  isGyroscopeEnabled,
  graphicsSettings,
}: FirstPersonSceneProps) => {
  // Log renders to debug infinite loop
  console.log('[FirstPersonScene] Rendering', {
    scenarioId: scenario.id,
    isActive,
    risksFound,
    graphicsQuality: graphicsSettings?.quality,
  });
  
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const [risks, setRisks] = useState<Risk3D[]>(scenario.risks);
  const [proceduralRisksLoaded, setProceduralRisksLoaded] = useState(false);
  
  // Use ref for risks to avoid dependency issues
  const risksRef = useRef<Risk3D[]>(scenario.risks);

  console.log('[FirstPersonScene] Mounted with scenario:', scenario.id, 'isActive:', isActive);
  console.log('[FirstPersonScene] Graphics settings:', graphicsSettings);

  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2(0, 0));
  
  const ambientAudio = useRef<AmbientAudioPlayer | null>(null);
  const voiceOver = useRef<VoiceOverPlayer | null>(null);
  const spatialAudio = useRef<SpatialAudioManager | null>(null);
  const collisionSystem = useRef<CollisionSystem | null>(null);
  const cameraShake = useRef<CameraShake | null>(null);
  const clock = useRef(new THREE.Clock());
  const exploredCells = useRef<Set<string>>(new Set());
  
  // Model debugging state
  const [modelBoundingBox, setModelBoundingBox] = useState<THREE.Box3 | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  
  // Particle effects state
  const [activeEffects, setActiveEffects] = useState<Array<{
    id: string;
    position: [number, number, number];
    type: "critical" | "generic";
  }>>([]);
  
  // Gyroscope rotation state
  const previousGyroRotation = useRef({ alpha: 0, beta: 0, gamma: 0 });

  // Keyboard movement state
  const keysPressed = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Handle procedural risks generation
  const handleProceduralRisksGenerated = (proceduralRisks: Risk3D[]) => {
    console.log('[FirstPersonScene] Procedural risks generated:', proceduralRisks.length);
    
    const proceduralConfig = scenario.proceduralRisks;
    if (!proceduralConfig) return;

    if (proceduralConfig.mode === 'replace') {
      // Replace manual risks with procedural ones
      console.log('[FirstPersonScene] Replacing manual risks with procedural risks');
      setRisks(proceduralRisks);
    } else if (proceduralConfig.mode === 'merge') {
      // Merge procedural risks with manual risks
      console.log('[FirstPersonScene] Merging procedural with manual risks');
      const mergedRisks = [...scenario.risks, ...proceduralRisks];
      setRisks(mergedRisks);
    }

    setProceduralRisksLoaded(true);
  };

  // Reset risks when scenario changes
  useEffect(() => {
    setRisks(scenario.risks);
    setProceduralRisksLoaded(false);
  }, [scenario.id]); // Remove scenario.risks from deps to prevent infinite loop

  // Keyboard event handlers
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle debug mode with 'B' key
      if (event.code === 'KeyB') {
        setDebugMode(prev => {
          const newValue = !prev;
          console.log('[Debug Mode]', newValue ? 'ENABLED' : 'DISABLED');
          return newValue;
        });
        return;
      }

      let updated = false;
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          if (!keysPressed.current.forward) {
            keysPressed.current.forward = true;
            updated = true;
          }
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (!keysPressed.current.backward) {
            keysPressed.current.backward = true;
            updated = true;
          }
          break;
        case 'KeyA':
        case 'ArrowLeft':
          if (!keysPressed.current.left) {
            keysPressed.current.left = true;
            updated = true;
          }
          break;
        case 'KeyD':
        case 'ArrowRight':
          if (!keysPressed.current.right) {
            keysPressed.current.right = true;
            updated = true;
          }
          break;
      }
      if (updated && onKeysUpdate) {
        onKeysUpdate({ ...keysPressed.current });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      let updated = false;
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          if (keysPressed.current.forward) {
            keysPressed.current.forward = false;
            updated = true;
          }
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (keysPressed.current.backward) {
            keysPressed.current.backward = false;
            updated = true;
          }
          break;
        case 'KeyA':
        case 'ArrowLeft':
          if (keysPressed.current.left) {
            keysPressed.current.left = false;
            updated = true;
          }
          break;
        case 'KeyD':
        case 'ArrowRight':
          if (keysPressed.current.right) {
            keysPressed.current.right = false;
            updated = true;
          }
          break;
      }
      if (updated && onKeysUpdate) {
        onKeysUpdate({ ...keysPressed.current });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, onKeysUpdate]);

  useEffect(() => {
    const newRisks = scenario.risks.map(r => ({ ...r, found: false }));
    setRisks(newRisks);
    risksRef.current = newRisks;
    
    // Initialize audio systems
    if (!ambientAudio.current) {
      ambientAudio.current = new AmbientAudioPlayer();
      ambientAudio.current.initialize();
    }
    
    if (!voiceOver.current) {
      voiceOver.current = new VoiceOverPlayer();
    }

    if (!spatialAudio.current) {
      spatialAudio.current = new SpatialAudioManager();
      spatialAudio.current.initialize();
    }

    // Initialize collision system
    if (!collisionSystem.current) {
      collisionSystem.current = new CollisionSystem();
    }

    if (!cameraShake.current) {
      cameraShake.current = new CameraShake();
    }

    // Clear and rebuild collision boxes for this scenario
    collisionSystem.current.clear();

    // Add collision boxes for walls
    collisionSystem.current.addCollisionBox(
      'back-wall',
      new THREE.Vector3(0, 2.5, -15),
      new THREE.Vector3(30, 5, 0.2)
    );
    collisionSystem.current.addCollisionBox(
      'left-wall',
      new THREE.Vector3(-15, 2.5, 0),
      new THREE.Vector3(0.2, 5, 30)
    );
    collisionSystem.current.addCollisionBox(
      'right-wall',
      new THREE.Vector3(15, 2.5, 0),
      new THREE.Vector3(0.2, 5, 30)
    );

    // Add collision boxes for furniture/obstacles
    collisionSystem.current.addCollisionBox(
      'desk',
      new THREE.Vector3(3, 0.4, -3),
      new THREE.Vector3(2, 0.8, 1)
    );
    collisionSystem.current.addCollisionBox(
      'cabinet',
      new THREE.Vector3(-4, 1, -1),
      new THREE.Vector3(1, 2, 0.5)
    );
    collisionSystem.current.addCollisionBox(
      'shelf-1',
      new THREE.Vector3(5, 2, -4),
      new THREE.Vector3(3, 0.2, 0.8)
    );
    collisionSystem.current.addCollisionBox(
      'shelf-2',
      new THREE.Vector3(5, 1.5, -4),
      new THREE.Vector3(3, 0.2, 0.8)
    );
    collisionSystem.current.addCollisionBox(
      'box-1',
      new THREE.Vector3(-2, 0.4, -5),
      new THREE.Vector3(0.8, 0.8, 0.8)
    );
    collisionSystem.current.addCollisionBox(
      'box-2',
      new THREE.Vector3(2, 0.3, -8),
      new THREE.Vector3(0.6, 0.6, 0.6)
    );
    
    // Play ambient audio for this scenario
    if (isActive && ambientAudio.current) {
      ambientAudio.current.playAmbient(scenario.audio.ambient.type, scenario.audio.ambient.volume);
    }

    // Create spatial audio sources for each risk
    if (isActive && spatialAudio.current) {
      newRisks.forEach(risk => {
        spatialAudio.current?.createSpatialSource(risk.id, risk.position, risk.severity);
      });
    }
    
    return () => {
      if (ambientAudio.current) {
        ambientAudio.current.stop();
      }
      if (voiceOver.current) {
        voiceOver.current.stop();
      }
      if (spatialAudio.current) {
        spatialAudio.current.stopAll();
      }
    };
  }, [scenario.id, isActive]); // Use scenario.id instead of scenario object to prevent infinite loop

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isActive || !controlsRef.current?.isLocked) return;

      // Set raycaster from camera center
      raycaster.current.setFromCamera(pointer.current, camera);

      // Check for intersections with risks using ref
      risksRef.current.forEach((risk, index) => {
        if (risk.found) return;

        const riskPosition = new THREE.Vector3(...risk.position);
        const distance = raycaster.current.ray.origin.distanceTo(riskPosition);
        const direction = new THREE.Vector3()
          .subVectors(riskPosition, raycaster.current.ray.origin)
          .normalize();

        const angle = raycaster.current.ray.direction.angleTo(direction);

        // If looking at risk (within 30 degrees and reasonable distance)
        if (angle < 0.5 && distance < 10) {
          const updatedRisks = [...risksRef.current];
          updatedRisks[index].found = true;
          setRisks(updatedRisks);
          risksRef.current = updatedRisks;
          onRiskFound(risk.id);
          
          // Add dramatic particle effect at risk position
          const effectType = risk.severity === 'critical' ? 'critical' : 'generic';
          setActiveEffects(prev => [...prev, {
            id: `effect-${risk.id}-${Date.now()}`,
            position: risk.position,
            type: effectType
          }]);
          
          // Play dramatic sound effect based on severity
          const audioContext = new AudioContext();
          import('@/lib/audio-context-unlock').then(m => m.registerAudioContext(audioContext)).catch(() => {});
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          if (risk.severity === 'critical') {
            // Critical: dramatic low rumble explosion
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
          } else {
            // Generic: bright chime/sparkle sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          }
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 1);
          
          // Notify if critical risk found
          if (risk.severity === 'critical' && onCriticalRiskFound) {
            onCriticalRiskFound();
          }
          
          // Remove spatial audio for found risk
          if (spatialAudio.current) {
            spatialAudio.current.removeSource(risk.id);
          }
          
          // Play voice-over describing the risk
          if (voiceOver.current) {
            const voiceText = `Rischio identificato: ${risk.label}. ${risk.description}. Livello di gravità: ${risk.severity}.`;
            voiceOver.current.speak(voiceText);
          }
        }
      });
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isActive, camera, onRiskFound, onCriticalRiskFound]); // Removed risks from dependencies

  useFrame(() => {
    if (!isActive || !controlsRef.current) return;

    const deltaTime = clock.current.getDelta();

    // Update camera shake
    if (cameraShake.current && cameraShake.current.isShaking()) {
      cameraShake.current.update(camera, deltaTime);
    }

    // Gyroscope camera rotation (if enabled)
    if (isGyroscopeEnabled && gyroscopeData && !controlsRef.current.isLocked) {
      const sensitivity = 0.002; // Adjust rotation sensitivity
      
      // Calculate rotation deltas
      const deltaAlpha = (gyroscopeData.alpha - previousGyroRotation.current.alpha) * sensitivity;
      const deltaGamma = (gyroscopeData.gamma - previousGyroRotation.current.gamma) * sensitivity;
      
      // Apply rotation to camera (alpha controls yaw, gamma controls pitch)
      camera.rotation.y -= deltaAlpha; // Yaw (left-right rotation)
      
      // Pitch rotation with limits to prevent camera flip
      const newPitch = camera.rotation.x - deltaGamma;
      camera.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, newPitch));
      
      // Store current rotation for next frame
      previousGyroRotation.current = {
        alpha: gyroscopeData.alpha,
        beta: gyroscopeData.beta,
        gamma: gyroscopeData.gamma,
      };
    }

    // Movement controls (WASD + Touch) with collision detection
    const speed = 0.1;
    
    // Combine keyboard and touch inputs
    const moveForward = keysPressed.current.forward || (touchMovement?.forward ?? 0) > 0.1;
    const moveBackward = keysPressed.current.backward || (touchMovement?.backward ?? 0) > 0.1;
    const moveLeft = keysPressed.current.left || (touchMovement?.left ?? 0) > 0.1;
    const moveRight = keysPressed.current.right || (touchMovement?.right ?? 0) > 0.1;
    
    // Get touch intensity for variable speed (0 to 1)
    const forwardIntensity = Math.max(keysPressed.current.forward ? 1 : 0, touchMovement?.forward ?? 0);
    const backwardIntensity = Math.max(keysPressed.current.backward ? 1 : 0, touchMovement?.backward ?? 0);
    const leftIntensity = Math.max(keysPressed.current.left ? 1 : 0, touchMovement?.left ?? 0);
    const rightIntensity = Math.max(keysPressed.current.right ? 1 : 0, touchMovement?.right ?? 0);

    const previousPosition = camera.position.clone();

    // Check each movement direction for collisions
    if (moveForward) {
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;
      direction.normalize();

      const moveSpeed = speed * forwardIntensity;
      if (!collisionSystem.current?.checkCollision(camera.position, direction, moveSpeed * 2)) {
        camera.translateZ(-moveSpeed);
      } else {
        // Collision detected
        if (spatialAudio.current && !cameraShake.current?.isShaking()) {
          spatialAudio.current.playCollisionSound();
          cameraShake.current?.triggerShake(0.05, 0.2);
          // Apply collision muffle effect
          if (ambientAudio.current) {
            ambientAudio.current.applyCollisionMuffle(0.5);
          }
        }
      }
    }

    if (moveBackward) {
      const direction = new THREE.Vector3(0, 0, 1);
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;
      direction.normalize();

      const moveSpeed = speed * backwardIntensity;
      if (!collisionSystem.current?.checkCollision(camera.position, direction, moveSpeed * 2)) {
        camera.translateZ(moveSpeed);
      } else {
        if (spatialAudio.current && !cameraShake.current?.isShaking()) {
          spatialAudio.current.playCollisionSound();
          cameraShake.current?.triggerShake(0.05, 0.2);
          if (ambientAudio.current) {
            ambientAudio.current.applyCollisionMuffle(0.5);
          }
        }
      }
    }

    if (moveLeft) {
      const direction = new THREE.Vector3(-1, 0, 0);
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;
      direction.normalize();

      const moveSpeed = speed * leftIntensity;
      if (!collisionSystem.current?.checkCollision(camera.position, direction, moveSpeed * 2)) {
        camera.translateX(-moveSpeed);
      } else {
        if (spatialAudio.current && !cameraShake.current?.isShaking()) {
          spatialAudio.current.playCollisionSound();
          cameraShake.current?.triggerShake(0.05, 0.2);
          if (ambientAudio.current) {
            ambientAudio.current.applyCollisionMuffle(0.5);
          }
        }
      }
    }

    if (moveRight) {
      const direction = new THREE.Vector3(1, 0, 0);
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;
      direction.normalize();

      const moveSpeed = speed * rightIntensity;
      if (!collisionSystem.current?.checkCollision(camera.position, direction, moveSpeed * 2)) {
        camera.translateX(moveSpeed);
      } else {
        if (spatialAudio.current && !cameraShake.current?.isShaking()) {
          spatialAudio.current.playCollisionSound();
          cameraShake.current?.triggerShake(0.05, 0.2);
          if (ambientAudio.current) {
            ambientAudio.current.applyCollisionMuffle(0.5);
          }
        }
      }
    }

    // Keep camera at standing height
    camera.position.y = 1.6;

    // Track exploration (divide map into grid cells)
    const cellSize = 2; // 2x2 world units per cell
    const cellX = Math.floor(camera.position.x / cellSize);
    const cellZ = Math.floor(camera.position.z / cellSize);
    const cellKey = `${cellX},${cellZ}`;
    
    if (!exploredCells.current.has(cellKey)) {
      exploredCells.current.add(cellKey);
      if (onExplorationUpdate) {
        onExplorationUpdate(new Set(exploredCells.current));
      }
    }

    // Update spatial audio listener position and notify parent
    if (spatialAudio.current) {
      const position: [number, number, number] = [
        camera.position.x,
        camera.position.y,
        camera.position.z,
      ];

      // Get camera forward direction
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const forwardArray: [number, number, number] = [forward.x, forward.y, forward.z];

      // Get camera up direction
      const up = new THREE.Vector3(0, 1, 0);
      const upArray: [number, number, number] = [up.x, up.y, up.z];

      spatialAudio.current.updateListenerPosition(position, forwardArray, upArray);

      // Calculate camera rotation (yaw) for the indicator
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const rotation = Math.atan2(direction.x, direction.z);

      // Notify parent component of position and rotation for HUD
      if (onPlayerPositionUpdate) {
        onPlayerPositionUpdate(position, rotation);
      }
    }
  });

  // Render environment based on scenario type
  const renderEnvironment = () => {
    const enableProcedural = graphicsSettings?.proceduralRisks !== false && (scenario.proceduralRisks?.enabled || false);
    
    if (scenario.type === 'warehouse') {
      return (
        <WarehouseEnvironment 
          useGLTFModel={scenario.useGLTFModel}
          modelPath={scenario.gltfModelPath}
          onModelLoaded={setModelBoundingBox}
          enableProceduralRisks={enableProcedural}
          onProceduralRisksGenerated={handleProceduralRisksGenerated}
          graphicsSettings={graphicsSettings}
        />
      );
    } else if (scenario.type === 'construction' || scenario.type === 'laboratory') {
      return (
        <IndustrialEnvironment 
          useGLTFModel={scenario.useGLTFModel}
          modelPath={scenario.gltfModelPath}
          type={scenario.type}
          onModelLoaded={setModelBoundingBox}
          enableProceduralRisks={enableProcedural}
          onProceduralRisksGenerated={handleProceduralRisksGenerated}
          graphicsSettings={graphicsSettings}
        />
      );
    }
    
    // Default office environment (programmatic geometry)
    console.log('[FirstPersonScene] Rendering OFFICE environment (programmatic)');
    return (
      <>
        {/* SIMPLIFIED DEBUG ENVIRONMENT - Maximum visibility */}
        
        {/* MASSIVE bright floor right under camera */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00" 
            emissiveIntensity={1.0}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* HUGE reference cubes - impossible to miss */}
        <mesh position={[0, 2, -2]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={1.0}
          />
        </mesh>
        
        <mesh position={[-4, 2, -5]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color="#0000ff" 
            emissive="#0000ff" 
            emissiveIntensity={1.0}
          />
        </mesh>
        
        <mesh position={[3, 0.5, -5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color="#ffff00" 
            emissive="#ffff00" 
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Back wall */}
        <mesh position={[0, 2.5, -10]}>
          <boxGeometry args={[20, 5, 0.2]} />
          <meshStandardMaterial 
            color="#ff00ff" 
            emissive="#ff00ff" 
            emissiveIntensity={0.3}
          />
        </mesh>
      </>
    );
  };

  console.log('[FirstPersonScene] Rendering with scenario:', scenario.id, 'type:', scenario.type);

  return (
    <>
      {/* DEBUG: Always visible test cube right in front */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00"
          emissiveIntensity={1.0}
        />
      </mesh>
      
      {/* MAXIMUM LIGHTING - Make everything visible */}
      <ambientLight intensity={2.0} color="#ffffff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={3.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 5, 0]} intensity={3.0} color="#ffffff" />
      <pointLight position={[-10, 5, 0]} intensity={2.0} color="#ffffff" />
      <pointLight position={[10, 5, 0]} intensity={2.0} color="#ffffff" />

      {/* Fog - based on scenario - TEMPORARILY DISABLED FOR DEBUG */}
      {false && scenario.environment.fogDensity > 0 && (
        <fog attach="fog" args={['#666666', 1, 20 / scenario.environment.fogDensity]} />
      )}

      {/* Render environment based on scenario type */}
      {renderEnvironment()}

      {/* Risk markers - Visual distinction between manual and procedural */}
      {risks.map((risk) => {
        const severityColor = getSeverityColor(risk.severity);
        const isManualRisk = risk.isManual === true;
        
        return (
          <group key={risk.id} position={risk.position}>
            {!risk.found ? (
              <>
                {/* Outer glow ring - different for manual vs procedural */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.4, 0.6, 32]} />
                  <meshBasicMaterial
                    color={isManualRisk ? '#dc2626' : '#f97316'}
                    transparent
                    opacity={isManualRisk ? 0.7 : 0.5}
                    side={2}
                  />
                </mesh>

                {/* Inner pulsating sphere with severity color */}
                <mesh>
                  <sphereGeometry args={isManualRisk ? [0.35, 24, 24] : [0.3, 16, 16]} />
                  <meshStandardMaterial
                    color={severityColor}
                    emissive={severityColor}
                    emissiveIntensity={isManualRisk ? 0.8 : 0.5}
                    transparent
                    opacity={isManualRisk ? 0.9 : 0.8}
                  />
                </mesh>

                {/* Critical marker icon for manual risks */}
                {isManualRisk && (
                  <>
                    {/* Warning stripes */}
                    <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
                      <boxGeometry args={[0.6, 0.05, 0.05]} />
                      <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
                      <boxGeometry args={[0.6, 0.05, 0.05]} />
                      <meshBasicMaterial color="#ffffff" />
                    </mesh>
                  </>
                )}
                
                {/* Label with type indicator */}
                <Text
                  position={[0, 0.8, 0]}
                  fontSize={isManualRisk ? 0.18 : 0.15}
                  color={isManualRisk ? '#ff0000' : '#ffffff'}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.03}
                  outlineColor="#000000"
                  font="/fonts/inter-bold.woff"
                  fontWeight={900}
                >
                  {risk.label}
                </Text>

                {/* Type badge */}
                <Text
                  position={[0, -0.5, 0]}
                  fontSize={0.1}
                  color={isManualRisk ? '#ff0000' : '#ff8800'}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="#000000"
                  fontWeight={700}
                >
                  {isManualRisk ? '🚨 CRITICO' : '⚠️ GENERICO'}
                </Text>
              </>
            ) : (
              <>
                {/* Found marker - remains green */}
                <mesh>
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshStandardMaterial
                    color="#00ff00"
                    emissive="#00ff00"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
                
                <Text
                  position={[0, 0.6, 0]}
                  fontSize={0.15}
                  color="#00ff00"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="#000000"
                >
                  ✓ Trovato!
                </Text>
              </>
            )}
          </group>
        );
      })}

      {/* Particle effects for found risks */}
      {activeEffects.map((effect) => (
        <ParticleEffects
          key={effect.id}
          position={effect.position}
          type={effect.type}
          onComplete={() => {
            setActiveEffects(prev => prev.filter(e => e.id !== effect.id));
          }}
        />
      ))}

      {/* Crosshair indicator (always at screen center) */}
      <mesh position={[0, 0, -1]}>
        <ringGeometry args={[0.01, 0.015, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>

      {/* First Person Controls */}
      {isActive && (
        <PointerLockControls
          ref={controlsRef}
        />
      )}
      
      {/* Model debugger - Toggle with 'B' key */}
      <ModelDebugger 
        enabled={debugMode}
        boundingBox={modelBoundingBox}
        risks={risks}
      />
    </>
  );
};
