import { useEffect, useRef, useState, useCallback } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { Scenario3D } from '@/data/scenarios3d';
import { toast } from 'sonner';
import type { ExtinguisherType } from './ExtinguisherSelection';
import { AtmosphericSoundtrack, AmbientAudioPlayer } from '@/lib/audio-system';
import { getVoiceNarrator } from '@/lib/voice-narrator';
import { SubtitlesOverlay } from './SubtitlesOverlay';
import { PropLabel } from './PropLabel';
import { NPCDialogOverlay } from './NPCDialogOverlay';
import { NPCRoleQuiz } from './NPCRoleQuiz';
import { Archive, Drum, Construction, ShieldAlert, Package2, Cog, FlaskConical, Monitor, LucideIcon } from 'lucide-react';
import type { AudioSettings } from '@/hooks/useGraphicsSettings';
import { loadGLTFProps } from '@/lib/babylon-prop-loader';
import { loadProceduralProps } from '@/lib/babylon-procedural-props';
import { SCENARIO_PROPS, SCENARIO_PROCEDURAL_PROPS } from '@/types/prop-config';

interface BabylonSceneProps {
  scenario: Scenario3D;
  onRiskFound: (riskId: string, isCritical: boolean) => void;
  risksFoundIds: string[];
  quality: 'low' | 'medium' | 'high' | 'ultra';
  isActive: boolean;
  audioSettings: AudioSettings;
  onMouseMove?: (deltaX: number, deltaY: number) => void;
  onFirePropagationChange?: (level: number) => void;
  onSprinklerStatusChange?: (active: boolean) => void;
  extinguisherType?: ExtinguisherType;
  onChargeChange?: (charge: number, maxCharge: number) => void;
  onFireExtinguished?: (extinguished: number, total: number) => void;
  onExtinguisherSwap?: (newType: ExtinguisherType) => void;
  onPositionUpdate?: (position: [number, number, number], rotation: number) => void;
}

export const BabylonScene = ({
  scenario,
  onRiskFound,
  risksFoundIds,
  quality,
  isActive,
  audioSettings,
  onMouseMove,
  onFirePropagationChange,
  onSprinklerStatusChange,
  extinguisherType,
  onChargeChange,
  onFireExtinguished,
  onExtinguisherSwap,
  onPositionUpdate,
}: BabylonSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.UniversalCamera | null>(null);
  const soundtrackRef = useRef<AtmosphericSoundtrack | null>(null);
  const ambientAudioRef = useRef<AmbientAudioPlayer | null>(null);
  const lookedAtMeshRef = useRef<{
    mesh: BABYLON.AbstractMesh;
    originalScale: BABYLON.Vector3;
    originalRotation: BABYLON.Vector3;
    currentScale: number;
    accumulatedRotation: number;
    lightBurst: BABYLON.PointLight | null;
    lightBurstMesh: BABYLON.Mesh | null;
    burstIntensity: number;
  } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const extChargeRef = useRef({ current: 100, max: 100 });
  const fireHitCountRef = useRef<Map<number, number>>(new Map());
  const [currentSubtitle, setCurrentSubtitle] = useState<{
    text: string;
    severity: 'critical' | 'moderate';
  } | null>(null);
  const [lookedAtProp, setLookedAtProp] = useState<{
    name: string;
    type: string;
    distance: number;
    condition: 'good' | 'warning' | 'damaged';
    icon: LucideIcon;
  } | null>(null);
  const [activeNPCRole, setActiveNPCRole] = useState<string | null>(null);
  const [quizRole, setQuizRole] = useState<string | null>(null);

  // Close NPC dialog with ESC key
  useEffect(() => {
    if (!activeNPCRole) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveNPCRole(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeNPCRole]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine
    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: quality === 'high' || quality === 'ultra',
      powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
    });
    engineRef.current = engine;

    // Create scene - Industrial cinematic style (saturated, dramatic, professional)
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    // Scenario-specific atmosphere presets
    const atmospherePresets: Record<string, {
      clearColor: BABYLON.Color4;
      fogDensity: number;
      fogColor: BABYLON.Color3;
    }> = {
      office: {
        clearColor: new BABYLON.Color4(0.88, 0.90, 0.93, 1), // Warm bright
        fogDensity: 0.002,
        fogColor: new BABYLON.Color3(0.88, 0.90, 0.93),
      },
      warehouse: {
        clearColor: new BABYLON.Color4(0.12, 0.15, 0.22, 1), // Cold industrial blue
        fogDensity: 0.006,
        fogColor: new BABYLON.Color3(0.12, 0.15, 0.22),
      },
      construction: {
        clearColor: new BABYLON.Color4(0.18, 0.12, 0.08, 1), // Dramatic warm orange
        fogDensity: 0.010,
        fogColor: new BABYLON.Color3(0.18, 0.12, 0.08),
      },
      laboratory: {
        clearColor: new BABYLON.Color4(0.14, 0.10, 0.08, 1), // Smoky dark
        fogDensity: 0.012,
        fogColor: new BABYLON.Color3(0.14, 0.10, 0.08),
      },
    };
    const atmo = atmospherePresets[scenario.type] || atmospherePresets.warehouse;
    scene.clearColor = atmo.clearColor;

    // Subtle fog for depth
    scene.fogEnabled = true;
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = atmo.fogDensity;
    scene.fogColor = atmo.fogColor;

    // Create camera (First Person)
    const camera = new BABYLON.UniversalCamera(
      'camera',
      new BABYLON.Vector3(0, 1.7, -5),
      scene
    );
    cameraRef.current = camera; // Store reference for dynamic updates
    camera.attachControl(canvasRef.current, true);
    
    // Configure camera controls
    camera.speed = 0.3;
    camera.angularSensibility = audioSettings.mouseSensitivity || 500; // User-configurable with fallback
    camera.keysUp = [87]; // W
    camera.keysDown = [83]; // S
    camera.keysLeft = [65]; // A
    camera.keysRight = [68]; // D
    camera.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5); // Collision volume
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.9, 0); // Offset so ellipsoid is above ground
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.minZ = 0.1; // Near clipping plane

    // Scenario-specific lighting presets
    const lightingPresets: Record<string, {
      ambientIntensity: number;
      ambientDiffuse: BABYLON.Color3;
      ambientGround: BABYLON.Color3;
      dirIntensity: number;
      dirDiffuse: BABYLON.Color3;
    }> = {
      office: {
        ambientIntensity: 0.4,
        ambientDiffuse: new BABYLON.Color3(0.90, 0.88, 0.84),
        ambientGround: new BABYLON.Color3(0.35, 0.32, 0.30),
        dirIntensity: 0.5,
        dirDiffuse: new BABYLON.Color3(0.92, 0.88, 0.82),
      },
      warehouse: {
        ambientIntensity: 0.25,
        ambientDiffuse: new BABYLON.Color3(0.55, 0.65, 0.80),  // Cold blue-white
        ambientGround: new BABYLON.Color3(0.15, 0.18, 0.25),
        dirIntensity: 1.4,
        dirDiffuse: new BABYLON.Color3(0.75, 0.85, 1.0),       // Cold industrial
      },
      construction: {
        ambientIntensity: 0.35,
        ambientDiffuse: new BABYLON.Color3(1.0, 0.75, 0.45),   // Dramatic orange
        ambientGround: new BABYLON.Color3(0.3, 0.15, 0.05),
        dirIntensity: 2.2,
        dirDiffuse: new BABYLON.Color3(1.0, 0.70, 0.35),       // Sunset orange
      },
      laboratory: {
        ambientIntensity: 0.3,
        ambientDiffuse: new BABYLON.Color3(1.0, 0.6, 0.3),     // Fire-warm
        ambientGround: new BABYLON.Color3(0.25, 0.1, 0.05),
        dirIntensity: 1.5,
        dirDiffuse: new BABYLON.Color3(1.0, 0.65, 0.3),
      },
    };
    const lp = lightingPresets[scenario.type] || lightingPresets.warehouse;

    const ambientLight = new BABYLON.HemisphericLight(
      'ambientLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    ambientLight.intensity = lp.ambientIntensity;
    ambientLight.diffuse = lp.ambientDiffuse;
    ambientLight.groundColor = lp.ambientGround;

    const directionalLight = new BABYLON.DirectionalLight(
      'directionalLight',
      new BABYLON.Vector3(-1, -2.5, -1),
      scene
    );
    directionalLight.position = new BABYLON.Vector3(20, 50, 20);
    directionalLight.intensity = lp.dirIntensity;
    directionalLight.diffuse = lp.dirDiffuse;

    // Cinematic sharp shadows for dramatic effect
    let shadowGenerator: BABYLON.ShadowGenerator | null = null;
    if (quality !== 'low') {
      shadowGenerator = new BABYLON.ShadowGenerator(
        2048, // Higher resolution for sharp shadows
        directionalLight
      );
      shadowGenerator.usePercentageCloserFiltering = true;
      shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
      shadowGenerator.darkness = 0.6; // Strong visible shadows
    }

    // === 🎬 SCENARIO-SPECIFIC POST-PROCESSING ===
    console.log(`[BabylonScene] 🎬 Post-processing preset: ${scenario.type}`);
    
    if (quality !== 'low') {
      const pipeline = new BABYLON.DefaultRenderingPipeline(
        'cinematicPipeline',
        true,
        scene,
        [camera]
      );

      // Scenario-specific post-processing presets
      const ppPresets: Record<string, {
        bloomEnabled: boolean; bloomThreshold: number; bloomWeight: number; bloomKernel: number; bloomScale: number;
        chromaticAberration: number;
        contrast: number; exposure: number;
        vignetteEnabled: boolean; vignetteWeight: number; vignetteFov: number;
        saturation: number; globalExposure: number;
        glowIntensity: number;
      }> = {
        office: {
          bloomEnabled: true, bloomThreshold: 0.9, bloomWeight: 0.1, bloomKernel: 32, bloomScale: 0.2,
          chromaticAberration: 1,
          contrast: 1.0, exposure: 0.85,
          vignetteEnabled: false, vignetteWeight: 0, vignetteFov: 0,
          saturation: 5, globalExposure: -0.05,
          glowIntensity: 0.15,
        },
        warehouse: {
          bloomEnabled: true, bloomThreshold: 0.8, bloomWeight: 0.3, bloomKernel: 48, bloomScale: 0.4,
          chromaticAberration: 6,
          contrast: 1.4, exposure: 1.0,
          vignetteEnabled: true, vignetteWeight: 1.2, vignetteFov: 0.9,
          saturation: 15, globalExposure: 0.15,
          glowIntensity: 1.2,
        },
        construction: {
          bloomEnabled: true, bloomThreshold: 0.65, bloomWeight: 0.35, bloomKernel: 64, bloomScale: 0.5,
          chromaticAberration: 10,
          contrast: 1.5, exposure: 1.05,
          vignetteEnabled: true, vignetteWeight: 2.5, vignetteFov: 0.7,
          saturation: 25, globalExposure: 0.25,
          glowIntensity: 1.0,
        },
        laboratory: {
          bloomEnabled: true, bloomThreshold: 0.5, bloomWeight: 0.55, bloomKernel: 80, bloomScale: 0.6,
          chromaticAberration: 5,
          contrast: 1.3, exposure: 1.15,
          vignetteEnabled: true, vignetteWeight: 1.8, vignetteFov: 0.75,
          saturation: 30, globalExposure: 0.2,
          glowIntensity: 2.0,
        },
      };
      const pp = ppPresets[scenario.type] || ppPresets.warehouse;

      // Bloom — strong for office (bright windows), moderate for others
      pipeline.bloomEnabled = pp.bloomEnabled;
      pipeline.bloomThreshold = pp.bloomThreshold;
      pipeline.bloomWeight = pp.bloomWeight;
      pipeline.bloomKernel = pp.bloomKernel;
      pipeline.bloomScale = pp.bloomScale;

      // Chromatic aberration
      pipeline.chromaticAberrationEnabled = true;
      pipeline.chromaticAberration.aberrationAmount = pp.chromaticAberration;

      // Image processing
      pipeline.imageProcessingEnabled = true;
      const imageProcessing = pipeline.imageProcessing;
      imageProcessing.contrast = pp.contrast;
      imageProcessing.exposure = pp.exposure;
      imageProcessing.toneMappingEnabled = true;
      imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

      // Vignette — heavy on construction (dramatic), none on office (bright)
      imageProcessing.vignetteEnabled = pp.vignetteEnabled;
      if (pp.vignetteEnabled) {
        imageProcessing.vignetteWeight = pp.vignetteWeight;
        imageProcessing.vignetteCameraFov = pp.vignetteFov;
      }

      // Color grading
      imageProcessing.colorCurvesEnabled = true;
      const colorCurves = new BABYLON.ColorCurves();
      colorCurves.globalSaturation = pp.saturation;
      colorCurves.globalExposure = pp.globalExposure;
      imageProcessing.colorCurves = colorCurves;
      
      // FXAA
      pipeline.fxaaEnabled = true;

      // Glow layer — strong for laboratory (fire glow), subtle for office
      const glowLayer = new BABYLON.GlowLayer('scenarioGlow', scene);
      glowLayer.intensity = pp.glowIntensity;
    }

    // Create ground - industrial concrete gray
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 50, height: 50 },
      scene
    );
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.35, 0.37, 0.4); // Industrial concrete gray
    groundMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    groundMat.specularPower = 32; // Some reflectivity
    ground.material = groundMat;
    ground.checkCollisions = true;
    ground.receiveShadows = true;

    // === INVISIBLE BOUNDARY WALLS ===
    // Prevent player from walking out of the environment
    const wallHeight = 8;
    const wallThickness = 0.5;
    const arenaSize = 24; // Half-size of play area (total 48x48)
    const wallConfigs = [
      { name: 'wall_north', w: arenaSize * 2, h: wallHeight, d: wallThickness, x: 0, y: wallHeight / 2, z: -arenaSize },
      { name: 'wall_south', w: arenaSize * 2, h: wallHeight, d: wallThickness, x: 0, y: wallHeight / 2, z: arenaSize },
      { name: 'wall_east',  w: wallThickness, h: wallHeight, d: arenaSize * 2, x: arenaSize, y: wallHeight / 2, z: 0 },
      { name: 'wall_west',  w: wallThickness, h: wallHeight, d: arenaSize * 2, x: -arenaSize, y: wallHeight / 2, z: 0 },
    ];
    wallConfigs.forEach(cfg => {
      const wall = BABYLON.MeshBuilder.CreateBox(cfg.name, { width: cfg.w, height: cfg.h, depth: cfg.d }, scene);
      wall.position = new BABYLON.Vector3(cfg.x, cfg.y, cfg.z);
      wall.isVisible = false; // Invisible
      wall.checkCollisions = true;
      wall.isPickable = false;
    });
    // Ceiling to prevent flying up
    const ceiling = BABYLON.MeshBuilder.CreateGround('ceiling', { width: arenaSize * 2, height: arenaSize * 2 }, scene);
    ceiling.position.y = wallHeight;
    ceiling.isVisible = false;
    ceiling.checkCollisions = true;
    ceiling.isPickable = false;

    // === FIRST-PERSON EXTINGUISHER MODEL ===
    if (scenario.type === 'laboratory' && extinguisherType) {
      createFirstPersonExtinguisher(scene, camera, extinguisherType);
      // Initialize charge
      extChargeRef.current = { current: 100, max: 100 };
      onChargeChange?.(100, 100);
    }

    // Load GLTF environment with optimizations
    loadEnvironmentOptimized(scene, scenario.type, quality, shadowGenerator);

    // === ADD ENVIRONMENTAL PROPS ===
    addEnvironmentalProps(scene, scenario.type, quality, shadowGenerator, risksFoundIds, onFirePropagationChange, ambientAudioRef, onSprinklerStatusChange, cameraRef);

    // === LOAD PROCEDURAL PROPS (Low-Poly Industrial Objects) ===
    const proceduralProps = SCENARIO_PROCEDURAL_PROPS[scenario.type] || [];
    if (proceduralProps.length > 0) {
      console.log(`[BabylonScene] Creating ${proceduralProps.length} procedural props for ${scenario.type}`);
      loadProceduralProps(scene, proceduralProps, shadowGenerator)
        .then(() => console.log('[BabylonScene] ✓ Procedural props created successfully'))
        .catch(err => console.error('[BabylonScene] ✗ Procedural props creation failed:', err));
    }

    // === LOAD GLTF PROPS (External Models) ===
    const props = SCENARIO_PROPS[scenario.type] || [];
    if (props.length > 0) {
      console.log(`[BabylonScene] Loading ${props.length} GLTF props for ${scenario.type}`);
      loadGLTFProps(scene, props, quality, shadowGenerator)
        .then(() => console.log('[BabylonScene] ✓ GLTF props loaded successfully'))
        .catch(err => console.error('[BabylonScene] ✗ GLTF props loading failed:', err));
    }

    // Create risk markers - contextual 3D hazard representations
    const riskGlow = new BABYLON.GlowLayer('riskGlow', scene);
    riskGlow.intensity = 1.5;
    
    const riskMeshes = scenario.risks.map((risk) => {
      // Create large, recognizable contextual hazard mesh
      const createContextualHazard = (): BABYLON.Mesh => {
        const label = risk.label.toLowerCase();
        
        // Exposed cable / wire — thick cable on floor with sparks
        if (label.includes('cavo') || label.includes('multipresa') || label.includes('elettric')) {
          const wire = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_wire`, {
            height: 2.5, diameter: 0.12, tessellation: 8
          }, scene);
          wire.rotation.z = Math.PI / 2 + 0.15;
          wire.rotation.y = Math.random() * 0.5;
          // Add visible plug/socket box
          const plug = BABYLON.MeshBuilder.CreateBox(`${risk.id}_plug`, { width: 0.35, height: 0.25, depth: 0.15 }, scene);
          plug.position = new BABYLON.Vector3(risk.position[0] + 1.0, risk.position[1] + 0.12, risk.position[2]);
          const plugMat = new BABYLON.StandardMaterial(`${risk.id}_plugMat`, scene);
          plugMat.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.8);
          plugMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.08);
          plug.material = plugMat;
          plug.isPickable = true;
          plug.metadata = { riskId: risk.id };
          if (shadowGenerator) shadowGenerator.addShadowCaster(plug);
          // Spark light
          const sparkLight = new BABYLON.PointLight(`${risk.id}_spark`, new BABYLON.Vector3(risk.position[0] + 1.0, risk.position[1] + 0.3, risk.position[2]), scene);
          sparkLight.intensity = 0.8; sparkLight.range = 3;
          sparkLight.diffuse = new BABYLON.Color3(1, 0.9, 0.3);
          // Flickering
          scene.registerBeforeRender(() => { sparkLight.intensity = 0.4 + Math.random() * 0.8; });
          return wire;
        }
        // Blocked exit / obstructed path — large stack of boxes
        if (label.includes('uscita') || label.includes('ostrui') || label.includes('via di fuga') || label.includes('bloccata') || label.includes('scatolon')) {
          const parent = BABYLON.MeshBuilder.CreateBox(`${risk.id}_boxes`, { width: 1.8, height: 1.2, depth: 1.0 }, scene);
          const box2 = BABYLON.MeshBuilder.CreateBox(`${risk.id}_box2`, { width: 1.4, height: 0.9, depth: 0.8 }, scene);
          box2.position = new BABYLON.Vector3(risk.position[0] + 0.4, risk.position[1] + 1.05, risk.position[2] - 0.15);
          box2.rotation.y = 0.3;
          const boxMat = new BABYLON.StandardMaterial(`${risk.id}_boxMat`, scene);
          boxMat.diffuseColor = new BABYLON.Color3(0.65, 0.5, 0.3);
          box2.material = boxMat;
          box2.isPickable = true;
          box2.metadata = { riskId: risk.id };
          if (shadowGenerator) { shadowGenerator.addShadowCaster(parent); shadowGenerator.addShadowCaster(box2); }
          // Third box on top, tilted
          const box3 = BABYLON.MeshBuilder.CreateBox(`${risk.id}_box3`, { width: 0.7, height: 0.5, depth: 0.6 }, scene);
          box3.position = new BABYLON.Vector3(risk.position[0] - 0.2, risk.position[1] + 1.65, risk.position[2] + 0.2);
          box3.rotation.z = 0.2; box3.rotation.y = -0.4;
          box3.material = boxMat;
          box3.isPickable = true;
          box3.metadata = { riskId: risk.id };
          return parent;
        }
        // Fire extinguisher
        if (label.includes('estintore') || label.includes('antincendio') || label.includes('🧯')) {
          const ext = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_ext`, {
            height: 0.9, diameter: 0.3, tessellation: 16
          }, scene);
          const nozzle = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_nozzle`, { height: 0.18, diameter: 0.1 }, scene);
          nozzle.position = new BABYLON.Vector3(risk.position[0], risk.position[1] + 0.54, risk.position[2]);
          const nMat = new BABYLON.StandardMaterial(`${risk.id}_nzMat`, scene);
          nMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
          nozzle.material = nMat;
          nozzle.isPickable = true;
          nozzle.metadata = { riskId: risk.id };
          if (shadowGenerator) { shadowGenerator.addShadowCaster(ext); shadowGenerator.addShadowCaster(nozzle); }
          return ext;
        }
        // Spilled liquid / wet floor — large reflective puddle
        if (label.includes('liquido') || label.includes('scivolos') || label.includes('versato') || label.includes('pavimento')) {
          const puddle = BABYLON.MeshBuilder.CreateDisc(`${risk.id}_puddle`, { radius: 1.2, tessellation: 24 }, scene);
          puddle.rotation.x = Math.PI / 2;
          puddle.position.y += 0.02;
          const puddleMat = new BABYLON.StandardMaterial(`${risk.id}_puddleMat`, scene);
          puddleMat.diffuseColor = new BABYLON.Color3(0.35, 0.5, 0.7);
          puddleMat.alpha = 0.65;
          puddleMat.specularColor = new BABYLON.Color3(1, 1, 1);
          puddleMat.specularPower = 256;
          puddle.material = puddleMat;
          if (shadowGenerator) shadowGenerator.addShadowCaster(puddle);
          return puddle;
        }
        // Unstable shelf / storage — large tilted shelving
        if (label.includes('scaffal') || label.includes('instabil') || label.includes('carico') || label.includes('sovraccaric')) {
          const shelf = BABYLON.MeshBuilder.CreateBox(`${risk.id}_shelf`, { width: 2.0, height: 2.5, depth: 0.6 }, scene);
          shelf.rotation.z = 0.12;
          const item = BABYLON.MeshBuilder.CreateBox(`${risk.id}_falling`, { width: 0.5, height: 0.35, depth: 0.4 }, scene);
          item.position = new BABYLON.Vector3(risk.position[0] + 0.9, risk.position[1] - 0.3, risk.position[2] + 0.3);
          item.rotation.z = 0.5; item.rotation.x = 0.2;
          const iMat = new BABYLON.StandardMaterial(`${risk.id}_iMat`, scene);
          iMat.diffuseColor = new BABYLON.Color3(0.6, 0.5, 0.3);
          item.material = iMat;
          item.isPickable = true;
          item.metadata = { riskId: risk.id };
          if (shadowGenerator) { shadowGenerator.addShadowCaster(shelf); shadowGenerator.addShadowCaster(item); }
          return shelf;
        }
        // Poor lighting — broken lamp fixture
        if (label.includes('illumin') || label.includes('luce') || label.includes('buio') || label.includes('💡')) {
          const lamp = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_lamp`, {
            height: 0.15, diameter: 0.7, tessellation: 16
          }, scene);
          const pole = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_pole`, { height: 0.5, diameter: 0.06 }, scene);
          pole.position = new BABYLON.Vector3(risk.position[0], risk.position[1] + 0.32, risk.position[2]);
          const poleMat = new BABYLON.StandardMaterial(`${risk.id}_poleMat`, scene);
          poleMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.42);
          pole.material = poleMat;
          if (shadowGenerator) shadowGenerator.addShadowCaster(lamp);
          return lamp;
        }
        // Fire / flames — barrel with emissive glow
        if (label.includes('incendio') || label.includes('fuoco') || label.includes('🔥') || label.includes('infiammab') || label.includes('focolaio')) {
          const barrel = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_barrel`, {
            height: 1.0, diameter: 0.6, tessellation: 16
          }, scene);
          // Fire glow light
          const fireGlow = new BABYLON.PointLight(`${risk.id}_fireGlow`, new BABYLON.Vector3(risk.position[0], risk.position[1] + 0.8, risk.position[2]), scene);
          fireGlow.intensity = 1.5; fireGlow.range = 5;
          fireGlow.diffuse = new BABYLON.Color3(1, 0.5, 0.1);
          scene.registerBeforeRender(() => { fireGlow.intensity = 1.0 + Math.random() * 1.0; });
          if (shadowGenerator) shadowGenerator.addShadowCaster(barrel);
          return barrel;
        }
        // Door — blocked fire door
        if (label.includes('porta') || label.includes('tagliafuoco')) {
          const door = BABYLON.MeshBuilder.CreateBox(`${risk.id}_door`, { width: 1.0, height: 2.2, depth: 0.1 }, scene);
          door.rotation.y = Math.random() * 0.5;
          // Wedge holding it open
          const wedge = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_wedge`, { height: 0.08, diameterTop: 0, diameterBottom: 0.15, tessellation: 3 }, scene);
          wedge.position = new BABYLON.Vector3(risk.position[0] + 0.5, risk.position[1] + 0.04, risk.position[2]);
          wedge.rotation.x = Math.PI / 2;
          const wMat = new BABYLON.StandardMaterial(`${risk.id}_wMat`, scene);
          wMat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
          wedge.material = wMat;
          if (shadowGenerator) shadowGenerator.addShadowCaster(door);
          return door;
        }
        // Alarm / button
        if (label.includes('pulsante') || label.includes('allarme')) {
          const box = BABYLON.MeshBuilder.CreateBox(`${risk.id}_alarmBox`, { width: 0.25, height: 0.3, depth: 0.08 }, scene);
          const btnMat = new BABYLON.StandardMaterial(`${risk.id}_btnMat`, scene);
          btnMat.diffuseColor = new BABYLON.Color3(0.85, 0.1, 0.1);
          btnMat.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
          box.material = btnMat;
          return box;
        }
        // Evacuation plan
        if (label.includes('planimetria') || label.includes('evacuazione') || label.includes('📋')) {
          const sign = BABYLON.MeshBuilder.CreatePlane(`${risk.id}_sign`, { width: 0.8, height: 0.6 }, scene);
          const sMat = new BABYLON.StandardMaterial(`${risk.id}_signMat`, scene);
          sMat.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3);
          sMat.emissiveColor = new BABYLON.Color3(0.05, 0.15, 0.05);
          sMat.backFaceCulling = false;
          sign.material = sMat;
          return sign;
        }
        // Generic default: large warning cone (traffic cone style)
        const coneBase = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_coneBase`, { height: 0.08, diameter: 0.7, tessellation: 16 }, scene);
        const cone = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_cone`, {
          height: 0.8, diameterTop: 0.08, diameterBottom: 0.35, tessellation: 12
        }, scene);
        cone.position = new BABYLON.Vector3(risk.position[0], risk.position[1] + 0.44, risk.position[2]);
        const coneMat = new BABYLON.StandardMaterial(`${risk.id}_coneMat`, scene);
        coneMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        coneMat.emissiveColor = new BABYLON.Color3(0.3, 0.15, 0);
        cone.material = coneMat;
        cone.isPickable = true;
        cone.metadata = { riskId: risk.id };
        if (shadowGenerator) { shadowGenerator.addShadowCaster(coneBase); shadowGenerator.addShadowCaster(cone); }
        riskGlow.addIncludedOnlyMesh(cone);
        return coneBase;
      };

      const marker = createContextualHazard();
      marker.position = new BABYLON.Vector3(risk.position[0], risk.position[1], risk.position[2]);

      // Color by severity
      const mat = new BABYLON.StandardMaterial(`mat_${risk.id}`, scene);
      const severityColors: Record<string, { emissive: BABYLON.Color3; diffuse: BABYLON.Color3 }> = {
        critical: { emissive: new BABYLON.Color3(0.4, 0, 0), diffuse: new BABYLON.Color3(0.85, 0.1, 0.1) },
        high: { emissive: new BABYLON.Color3(0.3, 0.15, 0), diffuse: new BABYLON.Color3(0.9, 0.5, 0.1) },
        medium: { emissive: new BABYLON.Color3(0.3, 0.25, 0), diffuse: new BABYLON.Color3(0.9, 0.8, 0.2) },
        low: { emissive: new BABYLON.Color3(0, 0.15, 0.05), diffuse: new BABYLON.Color3(0.3, 0.7, 0.4) },
      };
      const colors = severityColors[risk.severity] || severityColors.medium;
      mat.emissiveColor = colors.emissive;
      mat.diffuseColor = colors.diffuse;
      mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      marker.material = mat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(marker);

      // Game-style floating marker above hazard (billboard icon) — LARGE and visible
      const isCritical = risk.severity === 'critical' || risk.severity === 'high';
      const markerSize = isCritical ? 1.2 : 0.9;
      const indicator = BABYLON.MeshBuilder.CreatePlane(`${risk.id}_indicator`, { width: markerSize, height: markerSize }, scene);
      // Clamp indicator height below any ceiling (max 2.8m from ground)
      const indicatorY = Math.min(risk.position[1] + 2.2, 2.8);
      indicator.position = new BABYLON.Vector3(risk.position[0], indicatorY, risk.position[2]);
      indicator.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      indicator.isPickable = true;
      indicator.renderingGroupId = 2; // Render above environment

      // Dynamic texture for game icon
      const texSize = 256;
      const dynTex = new BABYLON.DynamicTexture(`${risk.id}_dynTex`, texSize, scene, true);
      const ctx = dynTex.getContext();

      // Pick icon & colors based on severity
      let icon: string, bgColor: string, iconColor: string, glowColor: BABYLON.Color3;
      switch (risk.severity) {
        case 'critical':
          icon = '❗'; bgColor = 'rgba(220,38,38,0.9)'; iconColor = '#fff'; glowColor = new BABYLON.Color3(1, 0.15, 0.1);
          break;
        case 'high':
          icon = '⚠'; bgColor = 'rgba(234,88,12,0.9)'; iconColor = '#fff'; glowColor = new BABYLON.Color3(1, 0.5, 0.05);
          break;
        case 'medium':
          icon = '❓'; bgColor = 'rgba(202,138,4,0.85)'; iconColor = '#fff'; glowColor = new BABYLON.Color3(1, 0.8, 0.1);
          break;
        default:
          icon = 'ℹ'; bgColor = 'rgba(34,197,94,0.8)'; iconColor = '#fff'; glowColor = new BABYLON.Color3(0.2, 0.8, 0.4);
      }

      // Draw rounded hexagonal/circular badge
      const cx = texSize / 2, cy = texSize / 2, r = texSize * 0.42;
      ctx.clearRect(0, 0, texSize, texSize);
      // Outer glow ring
      ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = bgColor.replace(/[\d.]+\)$/, '0.3)');
      ctx.fill();
      // Main badge
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = iconColor; ctx.lineWidth = 6; ctx.stroke();
      // Icon
      ctx.font = `bold ${Math.round(texSize * 0.55)}px Arial`;
      (ctx as any).textAlign = 'center'; (ctx as any).textBaseline = 'middle';
      ctx.fillStyle = iconColor;
      ctx.fillText(icon, cx, cy + 4);
      dynTex.update();

      const indMat = new BABYLON.StandardMaterial(`${risk.id}_indMat`, scene);
      indMat.diffuseTexture = dynTex;
      indMat.emissiveColor = glowColor.scale(0.5);
      indMat.opacityTexture = dynTex;
      indMat.useAlphaFromDiffuseTexture = true;
      indMat.backFaceCulling = false;
      indMat.disableLighting = true;
      indicator.material = indMat;
      riskGlow.addIncludedOnlyMesh(indicator);

      // === PROXIMITY TEXT LABEL (visible within 5m) ===
      const labelText = risk.label.replace(/^[^\w\s]*\s*/, ''); // Strip leading emoji
      const labelPlaneW = Math.max(2.5, labelText.length * 0.18);
      const labelPlane = BABYLON.MeshBuilder.CreatePlane(`${risk.id}_label`, { width: labelPlaneW, height: 0.45 }, scene);
      const labelY = Math.min(risk.position[1] + 3.2, 3.0);
      labelPlane.position = new BABYLON.Vector3(risk.position[0], labelY, risk.position[2]);
      labelPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      labelPlane.isPickable = false;
      labelPlane.renderingGroupId = 3;

      const lblTexW = Math.max(512, labelText.length * 40);
      const lblTexH = 96;
      const lblTex = new BABYLON.DynamicTexture(`${risk.id}_lblTex`, { width: lblTexW, height: lblTexH }, scene, true);
      const lblCtx = lblTex.getContext() as unknown as CanvasRenderingContext2D;
      // Draw background pill
      lblCtx.clearRect(0, 0, lblTexW, lblTexH);
      const pillR = lblTexH / 2;
      lblCtx.beginPath();
      lblCtx.moveTo(pillR, 4);
      lblCtx.lineTo(lblTexW - pillR, 4);
      lblCtx.arcTo(lblTexW - 4, 4, lblTexW - 4, lblTexH - 4, pillR - 4);
      lblCtx.arcTo(lblTexW - 4, lblTexH - 4, pillR, lblTexH - 4, pillR - 4);
      lblCtx.lineTo(pillR, lblTexH - 4);
      lblCtx.arcTo(4, lblTexH - 4, 4, 4, pillR - 4);
      lblCtx.arcTo(4, 4, pillR, 4, pillR - 4);
      lblCtx.closePath();
      lblCtx.fillStyle = 'rgba(0,0,0,0.75)';
      lblCtx.fill();
      lblCtx.strokeStyle = risk.severity === 'critical' ? '#ef4444' : risk.severity === 'high' ? '#f97316' : risk.severity === 'medium' ? '#eab308' : '#22c55e';
      lblCtx.lineWidth = 3;
      lblCtx.stroke();
      // Draw text
      lblCtx.font = 'bold 38px Arial';
      lblCtx.textAlign = 'center';
      lblCtx.textBaseline = 'middle';
      lblCtx.fillStyle = '#ffffff';
      lblCtx.fillText(labelText, lblTexW / 2, lblTexH / 2 + 2);
      lblTex.update();

      const lblMat = new BABYLON.StandardMaterial(`${risk.id}_lblMat`, scene);
      lblMat.diffuseTexture = lblTex;
      lblMat.opacityTexture = lblTex;
      lblMat.useAlphaFromDiffuseTexture = true;
      lblMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
      lblMat.disableLighting = true;
      lblMat.backFaceCulling = false;
      lblMat.alpha = 0;
      labelPlane.material = lblMat;

      // Proximity sparkle ring (created once, toggled by distance)
      const proximityRing = BABYLON.MeshBuilder.CreateTorus(`${risk.id}_proxRing`, {
        diameter: 2.0, thickness: 0.06, tessellation: 48
      }, scene);
      proximityRing.position = new BABYLON.Vector3(risk.position[0], risk.position[1] + 0.05, risk.position[2]);
      proximityRing.rotation.x = 0; // flat on ground
      const ringMat = new BABYLON.StandardMaterial(`${risk.id}_ringMat`, scene);
      ringMat.emissiveColor = glowColor;
      ringMat.diffuseColor = glowColor;
      ringMat.alpha = 0;
      ringMat.disableLighting = true;
      proximityRing.material = ringMat;

      // Sparkle particles (only visible when nearby)
      const sparkSPS = new BABYLON.SolidParticleSystem(`${risk.id}_sparkSPS`, scene, { isPickable: false });
      const sparkModel = BABYLON.MeshBuilder.CreatePlane(`${risk.id}_sparkModel`, { size: 0.08 }, scene);
      sparkSPS.addShape(sparkModel, 20);
      sparkModel.dispose();
      const sparkMesh = sparkSPS.buildMesh();
      sparkMesh.position = new BABYLON.Vector3(risk.position[0], risk.position[1] + 0.5, risk.position[2]);
      const sparkMat = new BABYLON.StandardMaterial(`${risk.id}_sparkMat`, scene);
      sparkMat.emissiveColor = glowColor;
      sparkMat.disableLighting = true;
      sparkMat.alpha = 0;
      sparkMesh.material = sparkMat;
      sparkSPS.initParticles = () => {
        for (let p = 0; p < sparkSPS.nbParticles; p++) {
          const particle = sparkSPS.particles[p];
          const angle = (p / sparkSPS.nbParticles) * Math.PI * 2;
          const radius = 0.8 + Math.random() * 0.4;
          particle.position.x = Math.cos(angle) * radius;
          particle.position.y = Math.random() * 1.5;
          particle.position.z = Math.sin(angle) * radius;
          particle.props = { angle, radius, speed: 0.5 + Math.random() * 0.5 };
        }
      };
      sparkSPS.initParticles();
      sparkSPS.setParticles();

      // === SPATIAL AUDIO: proximity hum per risk ===
      // Low-frequency oscillator that intensifies as player approaches
      let proxOsc: BABYLON.Nullable<OscillatorNode> = null;
      let proxGain: BABYLON.Nullable<GainNode> = null;
      let proxFilter: BABYLON.Nullable<BiquadFilterNode> = null;
      let audioCtx: AudioContext | null = null;

      const initProximityAudio = () => {
        if (audioCtx) return;
        try {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          proxOsc = audioCtx.createOscillator();
          proxGain = audioCtx.createGain();
          proxFilter = audioCtx.createBiquadFilter();
          
          // Deep industrial hum — different pitch per severity
          const baseFreq = risk.severity === 'critical' ? 55 : risk.severity === 'high' ? 65 : risk.severity === 'medium' ? 75 : 90;
          proxOsc.type = 'sawtooth';
          proxOsc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
          
          proxFilter.type = 'lowpass';
          proxFilter.frequency.setValueAtTime(120, audioCtx.currentTime);
          proxFilter.Q.setValueAtTime(5, audioCtx.currentTime);
          
          proxGain.gain.setValueAtTime(0, audioCtx.currentTime);
          
          proxOsc.connect(proxFilter);
          proxFilter.connect(proxGain);
          proxGain.connect(audioCtx.destination);
          proxOsc.start();
        } catch (e) {
          console.warn('[BabylonScene] Proximity audio init failed:', e);
        }
      };

      // Animate: bob + pulse + proximity effects
      const baseIndY = Math.min(risk.position[1] + 2.2, 2.8);
      const riskPos = new BABYLON.Vector3(risk.position[0], risk.position[1], risk.position[2]);
      let wasNearby = false;
      let audioInitialized = false;

      scene.registerBeforeRender(() => {
        const t = Date.now() * 0.001;
        indicator.position.y = baseIndY + Math.sin(t * 1.8) * 0.15;
        if (isCritical) {
          const pulse = 1.0 + Math.sin(t * 3.5) * 0.15;
          indicator.scaling.setAll(pulse);
        }

        // Proximity check (3m visuals, 5m label, 8m audio)
        if (camera) {
          const dist = BABYLON.Vector3.Distance(camera.position, riskPos);

          // Label fade: visible within 5m, smooth alpha transition
          const labelDist = 5.0;
          if (dist < labelDist) {
            const labelAlpha = Math.min(1, (1.0 - dist / labelDist) * 2.0);
            lblMat.alpha = labelAlpha;
            labelPlane.position.y = Math.min(risk.position[1] + 3.2, 3.0) + Math.sin(t * 1.2) * 0.05;
          } else {
            lblMat.alpha = 0;
          }
          const isNearby = dist < 3.0;
          const isInAudioRange = dist < 8.0;

          // Spatial audio: fade gain based on distance (8m = silent, 0m = max)
          if (isInAudioRange && audioSettings.effectsVolume > 0) {
            if (!audioInitialized) {
              initProximityAudio();
              audioInitialized = true;
            }
            if (proxGain && proxFilter && audioCtx) {
              const intensity = Math.pow(1.0 - dist / 8.0, 2); // Quadratic falloff
              const vol = intensity * 0.12; // Max volume 0.12
              proxGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);
              // Open filter as player gets closer for more menacing sound
              const filterFreq = 120 + intensity * 400;
              proxFilter.frequency.setTargetAtTime(filterFreq, audioCtx.currentTime, 0.1);
            }
          } else if (proxGain && audioCtx) {
            proxGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);
          }

          if (isNearby) {
            // Expanding ring
            const ringScale = 1.0 + Math.sin(t * 3) * 0.2;
            proximityRing.scaling.setAll(ringScale);
            ringMat.alpha = 0.4 + Math.sin(t * 4) * 0.2;

            // Animate sparkles
            sparkMat.alpha = 0.7;
            sparkSPS.updateParticle = (particle) => {
              const props = particle.props as { angle: number; radius: number; speed: number };
              props.angle += 0.02 * props.speed;
              particle.position.x = Math.cos(props.angle) * props.radius;
              particle.position.z = Math.sin(props.angle) * props.radius;
              particle.position.y = (particle.position.y + 0.01 * props.speed) % 1.5;
              particle.rotation.y = props.angle;
              return particle;
            };
            sparkSPS.setParticles();
          } else {
            ringMat.alpha = 0;
            sparkMat.alpha = 0;
          }
          wasNearby = isNearby;
        }
      });

      // Cleanup audio on scene dispose
      scene.onDisposeObservable.addOnce(() => {
        try {
          proxOsc?.stop();
          audioCtx?.close();
        } catch (_) {}
      });

      return { mesh: marker, risk };
    });

    // Click detection for risks + extinguisher spray
    scene.onPointerDown = (evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        const pickedMesh = pickResult.pickedMesh;

        // Check if clicked on an NPC worker
        if (pickedMesh.metadata?.safetyRole) {
          setActiveNPCRole(pickedMesh.metadata.safetyRole);
          return;
        }

        // Match by main mesh, indicator plane, or any child mesh with riskId metadata
        const riskData = riskMeshes.find((r) => {
          if (r.mesh === pickedMesh) return true;
          // Check if clicked indicator or sub-mesh belongs to this risk
          const meshName = pickedMesh.name || '';
          if (meshName.startsWith(r.risk.id + '_')) return true;
          if (pickedMesh.metadata?.riskId === r.risk.id) return true;
          return false;
        });

        if (riskData && !risksFoundIds.includes(riskData.risk.id)) {
          const isCritical = riskData.risk.severity === 'critical' || riskData.risk.severity === 'high';
          
          // Create particle effect
          createParticleEffect(scene, pickResult.pickedPoint!, isCritical);
          
          // Play sound
          playRiskSound(scene, isCritical);
          
          // Voice-over announcement with subtitle support
          const narrator = getVoiceNarrator();
          const severity = (riskData.risk.severity === 'critical' || riskData.risk.severity === 'high') ? 'critical' : 'moderate';
          
          const result = narrator.speak({
            id: riskData.risk.id,
            type: scenario.type,
            description: riskData.risk.description,
            severity
          }, {
            subtitlesOnly: !audioSettings.voiceOverEnabled || audioSettings.subtitlesEnabled
          });
          
          // Display subtitles if enabled or voice-over is disabled
          if (audioSettings.subtitlesEnabled || !audioSettings.voiceOverEnabled) {
            setCurrentSubtitle({
              text: result.text,
              severity
            });
          }
          
          // Hide the risk marker
          pickedMesh.dispose();
          
          // Notify parent
          onRiskFound(riskData.risk.id, isCritical);
          
          toast.success(
            isCritical ? '🚨 Rischio critico trovato!' : '⚠️ Rischio identificato!'
          );
          return;
        }
      }
      
      // If we have an extinguisher in fire simulation, check spare pickup
      if (scenario.type === 'laboratory' && extinguisherType) {
        // Check if picking up a spare extinguisher (different type)
        if (pickResult.hit && pickResult.pickedMesh?.name.startsWith('spareExt_')) {
          const meshName = pickResult.pickedMesh.name;
          const spareType = pickResult.pickedMesh.metadata?.extType as ExtinguisherType | undefined;
          // Refill charge
          extChargeRef.current.current = extChargeRef.current.max;
          onChargeChange?.(extChargeRef.current.current, extChargeRef.current.max);
          pickResult.pickedMesh.dispose();
          
          if (spareType && spareType !== extinguisherType) {
            // Swap extinguisher type
            onExtinguisherSwap?.(spareType);
            const typeLabels: Record<string, string> = { co2: 'CO₂', powder: 'Polvere', foam: 'Schiuma', water: 'Acqua' };
            toast.success(`🧯 Estintore ${typeLabels[spareType]} raccolto! Tipo cambiato + carica piena.`);
            
            // Update the first-person extinguisher visuals
            const extBody = scene.getMeshByName('ext_body');
            if (extBody && extBody.material instanceof BABYLON.StandardMaterial) {
              const colorMap: Record<string, BABYLON.Color3> = {
                co2: new BABYLON.Color3(0.2, 0.2, 0.2),
                powder: new BABYLON.Color3(0.8, 0.6, 0.1),
                foam: new BABYLON.Color3(0.1, 0.6, 0.3),
                water: new BABYLON.Color3(0.1, 0.3, 0.8),
              };
              extBody.material.diffuseColor = colorMap[spareType] || new BABYLON.Color3(0.85, 0.1, 0.1);
            }
          } else {
            toast.success('🧯 Estintore raccolto! Carica piena.');
          }
          return;
        }
        
        if (extChargeRef.current.current <= 0) {
          // Play empty click sound
          try {
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
            setTimeout(() => audioCtx.close(), 500);
          } catch (e) {}
          toast.error('🔴 Estintore vuoto! Cercane uno nuovo nell\'ambiente.');
          return;
        }
        // Consume charge
        extChargeRef.current.current = Math.max(0, extChargeRef.current.current - 10);
        onChargeChange?.(extChargeRef.current.current, extChargeRef.current.max);
        
        // Recoil animation on extinguisher
        const extParent = scene.getTransformNodeByName('extinguisher_parent');
        if (extParent) {
          const origPos = extParent.position.clone();
          const origRot = extParent.rotation.clone();
          // Kick back and up
          extParent.position.z -= 0.08;
          extParent.position.y += 0.03;
          extParent.rotation.x += 0.15;
          // Animate back to original
          let recoilT = 0;
          const recoilObs = scene.onBeforeRenderObservable.add(() => {
            recoilT += 0.06;
            if (recoilT >= 1) {
              extParent.position.copyFrom(origPos);
              extParent.rotation.copyFrom(origRot);
              scene.onBeforeRenderObservable.remove(recoilObs);
            } else {
              // Spring-back with slight overshoot
              const ease = 1 - Math.pow(1 - recoilT, 3);
              extParent.position = BABYLON.Vector3.Lerp(extParent.position, origPos, ease);
              extParent.rotation = BABYLON.Vector3.Lerp(extParent.rotation, origRot, ease);
            }
          });
        }
        
        // Play extinguisher-specific sound effect
        playExtinguisherSound(extinguisherType);
        
        // Haptic feedback on mobile — pattern varies by extinguisher type
        triggerHapticFeedback(extinguisherType);
        
        shootExtinguisherSpray(scene, camera, extinguisherType, fireHitCountRef.current, onFireExtinguished);
      }
    };

    // Ambient audio with procedural Web Audio API
    const initAmbientAudio = async () => {
      const ambientPlayer = new AmbientAudioPlayer();
      await ambientPlayer.initialize();
      
      // Map scenario type to audio type
      const audioType = scenario.type === 'construction' ? 'construction' :
                       scenario.type === 'warehouse' ? 'warehouse' :
                       scenario.type === 'laboratory' ? 'laboratory' :
                       'office';
      
      ambientPlayer.playAmbient(audioType, audioSettings.effectsVolume);
      ambientAudioRef.current = ambientPlayer;
      console.log(`[BabylonScene] Ambient audio initialized for type: ${audioType}`);
    };
    initAmbientAudio();

    // Initialize atmospheric soundtrack
    const initSoundtrack = async () => {
      const soundtrack = new AtmosphericSoundtrack();
      await soundtrack.initialize();
      soundtrack.start();
      soundtrack.setIntensity(0.0); // Inizia con intensità minima
      soundtrackRef.current = soundtrack;
    };
    initSoundtrack();

    // Initialize voice narrator
    const narrator = getVoiceNarrator();
    narrator.initialize().then(() => {
      console.log('[BabylonScene] Voice narrator initialized');
    });

    // === DYNAMIC OCCLUSION SYSTEM ===
    // Track meshes with modified alpha for fade restoration
    const occludedMeshes = new Map<BABYLON.Mesh, {
      originalAlpha: number;
      targetAlpha: number;
      currentAlpha: number;
    }>();
    
    const MIN_OCCLUSION_ALPHA = 0.15; // Minimum alpha for occluded objects
    const FADE_SPEED = 0.08; // Speed of fade transition
    const OCCLUSION_DISTANCE = 3.0; // Maximum distance to check for occlusion

    const updateDynamicOcclusion = () => {
      if (!isActive) return;
      
      const camera = scene.activeCamera as BABYLON.UniversalCamera;
      if (!camera) return;

      // Create ray from camera forward (to detect objects blocking view)
      const forward = camera.getDirection(BABYLON.Vector3.Forward());
      const ray = new BABYLON.Ray(
        camera.position,
        forward,
        OCCLUSION_DISTANCE
      );

      // Get all meshes that intersect the ray
      const hits = scene.multiPickWithRay(ray, (mesh) => {
        // Only check environment props, not risks or ground
        return mesh.checkCollisions && 
               !mesh.name.startsWith('risk_') && 
               mesh.name !== 'ground' &&
               mesh.name !== '__root__' &&
               mesh.isVisible;
      });

      // Track which meshes should be occluded
      const currentlyOccludedMeshes = new Set<BABYLON.Mesh>();

      if (hits) {
        hits.forEach((hit) => {
          if (hit.pickedMesh && hit.pickedMesh instanceof BABYLON.Mesh) {
            const mesh = hit.pickedMesh;
            currentlyOccludedMeshes.add(mesh);

            // Initialize occlusion data if not exists
            if (!occludedMeshes.has(mesh)) {
              const material = mesh.material;
              let originalAlpha = 1.0;
              
              if (material) {
                if (material instanceof BABYLON.StandardMaterial) {
                  originalAlpha = material.alpha;
                } else if (material instanceof BABYLON.PBRMaterial) {
                  originalAlpha = material.alpha;
                }
              }

              occludedMeshes.set(mesh, {
                originalAlpha,
                targetAlpha: MIN_OCCLUSION_ALPHA,
                currentAlpha: originalAlpha
              });

              // Enable alpha blending
              if (material) {
                material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
              }
            }

            // Update target alpha to fade out
            const data = occludedMeshes.get(mesh)!;
            data.targetAlpha = MIN_OCCLUSION_ALPHA;
          }
        });
      }

      // Update all occluded meshes
      occludedMeshes.forEach((data, mesh) => {
        const shouldBeOccluded = currentlyOccludedMeshes.has(mesh);
        
        // If mesh is no longer occluded, restore original alpha
        if (!shouldBeOccluded) {
          data.targetAlpha = data.originalAlpha;
        }

        // Smooth transition
        const alphaDiff = data.targetAlpha - data.currentAlpha;
        if (Math.abs(alphaDiff) > 0.01) {
          data.currentAlpha += alphaDiff * FADE_SPEED;
          
          // Apply alpha to material
          const material = mesh.material;
          if (material) {
            if (material instanceof BABYLON.StandardMaterial) {
              material.alpha = data.currentAlpha;
            } else if (material instanceof BABYLON.PBRMaterial) {
              material.alpha = data.currentAlpha;
            }
          }
        } else {
          // Close enough, snap to target
          data.currentAlpha = data.targetAlpha;
          
          const material = mesh.material;
          if (material) {
            if (material instanceof BABYLON.StandardMaterial) {
              material.alpha = data.currentAlpha;
            } else if (material instanceof BABYLON.PBRMaterial) {
              material.alpha = data.currentAlpha;
            }
          }

          // If fully restored, remove from tracking
          if (data.currentAlpha >= data.originalAlpha) {
            occludedMeshes.delete(mesh);
          }
        }
      });
    };

    // === PROP GAZE DETECTION SYSTEM ===
    // Raycasting from camera center to detect props being looked at
    const detectLookedAtProp = () => {
      if (!scene || !camera) return;

      const LOOK_DISTANCE = 4; // Maximum distance to show label (4 meters)
      const RAY_LENGTH = LOOK_DISTANCE;

      // Create ray from camera center (where player is looking)
      const origin = camera.position.clone();
      const forward = camera.getForwardRay(RAY_LENGTH).direction;
      const ray = new BABYLON.Ray(origin, forward, RAY_LENGTH);

      // Raycast to find mesh being looked at
      const hit = scene.pickWithRay(ray, (mesh) => {
        // Only consider props (not ground, walls, risks, or root nodes)
        return mesh.name.includes('pallet') || 
               mesh.name.includes('barrel') || 
               mesh.name.includes('cone') || 
               mesh.name.includes('barrier') ||
               mesh.name.includes('cargo') ||
               mesh.name.includes('equipment') ||
               mesh.name.includes('bench') ||
               mesh.name.includes('desk') ||
               mesh.name.includes('filing') ||
               mesh.name.includes('waste') ||
               mesh.name.includes('storage') ||
               mesh.name.includes('recycling');
      });

      if (hit && hit.pickedMesh && hit.distance <= LOOK_DISTANCE) {
        const mesh = hit.pickedMesh;
        const distance = hit.distance;

        // Extract prop info from mesh name and metadata with specific icons
        const getPropInfo = (meshName: string): { name: string; type: string; condition: 'good' | 'warning' | 'damaged'; icon: LucideIcon } => {
          if (meshName.includes('pallet') || meshName.includes('filing') || meshName.includes('storage')) {
            return {
              name: 'Pallet / Scaffale',
              type: 'Archiviazione',
              condition: 'good',
              icon: Archive
            };
          } else if (meshName.includes('barrel') || meshName.includes('waste') || meshName.includes('recycling')) {
            return {
              name: 'Contenitore',
              type: 'Stoccaggio rifiuti',
              condition: 'good',
              icon: Drum
            };
          } else if (meshName.includes('cone')) {
            return {
              name: 'Cono segnaletico',
              type: 'Sicurezza',
              condition: 'warning',
              icon: Construction
            };
          } else if (meshName.includes('barrier')) {
            return {
              name: 'Barriera sicurezza',
              type: 'Protezione',
              condition: 'good',
              icon: ShieldAlert
            };
          } else if (meshName.includes('cargo')) {
            return {
              name: 'Scatola merci',
              type: 'Magazzino',
              condition: 'good',
              icon: Package2
            };
          } else if (meshName.includes('equipment')) {
            return {
              name: 'Attrezzatura',
              type: 'Macchinario',
              condition: 'warning',
              icon: Cog
            };
          } else if (meshName.includes('bench')) {
            return {
              name: 'Banco laboratorio',
              type: 'Attrezzatura lab',
              condition: 'good',
              icon: FlaskConical
            };
          } else if (meshName.includes('desk')) {
            return {
              name: 'Scrivania',
              type: 'Postazione lavoro',
              condition: 'good',
              icon: Monitor
            };
          }
          
          return {
            name: 'Oggetto',
            type: 'Generico',
            condition: 'good',
            icon: Package2
          };
        };

        // Track this mesh for scale animation, rotation, and light burst
        if (!lookedAtMeshRef.current || lookedAtMeshRef.current.mesh !== mesh) {
          // Cleanup previous light burst if exists
          if (lookedAtMeshRef.current?.lightBurst) {
            lookedAtMeshRef.current.lightBurst.dispose();
          }
          if (lookedAtMeshRef.current?.lightBurstMesh) {
            lookedAtMeshRef.current.lightBurstMesh.dispose();
          }

          // New mesh being looked at - store original scale and rotation
          // Create light burst effect
          const burstHeight = 2.0; // Position above the prop
          const burstPosition = mesh.position.clone().addInPlace(new BABYLON.Vector3(0, burstHeight, 0));

          // Determine color and intensity based on condition
          const getConditionLightColor = (condition: 'good' | 'warning' | 'damaged'): BABYLON.Color3 => {
            switch (condition) {
              case 'damaged':
                return new BABYLON.Color3(1, 0.2, 0.2); // Red
              case 'warning':
                return new BABYLON.Color3(1, 0.65, 0); // Orange
              case 'good':
              default:
                return new BABYLON.Color3(0.2, 0.8, 1); // Cyan
            }
          };

          const propInfo = getPropInfo(mesh.name);
          const lightColor = getConditionLightColor(propInfo.condition);

          // Create point light for illumination
          const pointLight = new BABYLON.PointLight(`burstLight_${mesh.name}`, burstPosition, scene);
          pointLight.intensity = 0; // Start at 0, will animate up
          pointLight.range = 8;
          pointLight.diffuse = lightColor;
          pointLight.specular = lightColor.scale(0.5);

          // Create emissive sphere mesh for visual burst
          const burstSphere = BABYLON.MeshBuilder.CreateSphere(
            `burstSphere_${mesh.name}`,
            { diameter: 0.4, segments: 16 },
            scene
          );
          burstSphere.position = burstPosition.clone();
          
          const burstMat = new BABYLON.StandardMaterial(`burstMat_${mesh.name}`, scene);
          burstMat.emissiveColor = lightColor;
          burstMat.diffuseColor = lightColor;
          burstMat.alpha = 0.8;
          burstSphere.material = burstMat;

          lookedAtMeshRef.current = {
            mesh: mesh,
            originalScale: mesh.scaling.clone(),
            originalRotation: mesh.rotation.clone(),
            currentScale: 1.0,
            accumulatedRotation: 0,
            lightBurst: pointLight,
            lightBurstMesh: burstSphere,
            burstIntensity: 0
          };
        }

        const propInfo = getPropInfo(mesh.name);
        setLookedAtProp({
          ...propInfo,
          distance
        });
      } else {
        setLookedAtProp(null);
      }
    };

    // === PROP SCALE, ROTATION & LIGHT BURST ANIMATION ===
    // Smooth animations for looked-at props with dynamic light burst
    const updatePropAnimations = () => {
      const SCALE_SPEED = 0.08; // Interpolation speed for smooth scale transition
      const TARGET_SCALE_MULTIPLIER = 1.05; // Scale up to 105%
      const ROTATION_SPEED_DEG_PER_SEC = 5; // 5 degrees per second
      const ROTATION_SPEED_RAD_PER_FRAME = (ROTATION_SPEED_DEG_PER_SEC * Math.PI / 180) / 60; // ~60 FPS
      const ROTATION_RESTORE_SPEED = 0.1; // Speed to return to original rotation
      const BURST_FADE_IN_SPEED = 0.12; // Light burst fade in speed
      const BURST_FADE_OUT_SPEED = 0.08; // Light burst fade out speed
      const BURST_PULSE_SPEED = 0.05; // Pulsation speed for light burst

      if (lookedAtMeshRef.current) {
        const data = lookedAtMeshRef.current;
        const isStillLookedAt = lookedAtProp !== null;

        // === SCALE ANIMATION ===
        const targetScale = isStillLookedAt ? TARGET_SCALE_MULTIPLIER : 1.0;
        data.currentScale += (targetScale - data.currentScale) * SCALE_SPEED;
        data.mesh.scaling = data.originalScale.scale(data.currentScale);

        // === ROTATION ANIMATION ===
        if (isStillLookedAt) {
          data.accumulatedRotation += ROTATION_SPEED_RAD_PER_FRAME;
          data.mesh.rotation.y = data.originalRotation.y + data.accumulatedRotation;
        } else {
          if (Math.abs(data.accumulatedRotation) > 0.01) {
            data.accumulatedRotation *= (1 - ROTATION_RESTORE_SPEED);
            data.mesh.rotation.y = data.originalRotation.y + data.accumulatedRotation;
          } else {
            data.mesh.rotation.y = data.originalRotation.y;
            data.accumulatedRotation = 0;
          }
        }

        // === LIGHT BURST ANIMATION ===
        if (data.lightBurst && data.lightBurstMesh) {
          // Keep light burst positioned above the prop
          const burstHeight = 2.0;
          const burstPosition = data.mesh.position.clone().addInPlace(new BABYLON.Vector3(0, burstHeight, 0));
          data.lightBurst.position = burstPosition;
          data.lightBurstMesh.position = burstPosition;

          // Determine max intensity based on prop condition
          const getMaxIntensity = (): number => {
            if (!lookedAtProp) return 0;
            switch (lookedAtProp.condition) {
              case 'damaged':
                return 4.5; // Highest intensity for damaged
              case 'warning':
                return 3.0; // Medium intensity for warning
              case 'good':
              default:
                return 1.8; // Lower intensity for good condition
            }
          };

          const maxIntensity = getMaxIntensity();

          // Fade in/out
          if (isStillLookedAt) {
            // Fade in and pulse
            if (data.burstIntensity < maxIntensity) {
              data.burstIntensity += BURST_FADE_IN_SPEED;
              data.burstIntensity = Math.min(data.burstIntensity, maxIntensity);
            } else {
              // Pulsate when at max
              const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 1; // Oscillate between 0.8 and 1.2
              data.lightBurst.intensity = data.burstIntensity * pulse;
            }
          } else {
            // Fade out
            data.burstIntensity -= BURST_FADE_OUT_SPEED;
            data.burstIntensity = Math.max(data.burstIntensity, 0);
          }

          // Apply intensity
          if (data.burstIntensity > 0) {
            data.lightBurst.intensity = data.burstIntensity;
            if (data.lightBurstMesh.material instanceof BABYLON.StandardMaterial) {
              data.lightBurstMesh.material.alpha = Math.min(data.burstIntensity / maxIntensity * 0.8, 0.8);
            }
          } else {
            data.lightBurst.intensity = 0;
            if (data.lightBurstMesh.material instanceof BABYLON.StandardMaterial) {
              data.lightBurstMesh.material.alpha = 0;
            }
          }
        }

        // If fully restored, cleanup
        if (!isStillLookedAt && 
            Math.abs(data.currentScale - 1.0) < 0.001 && 
            Math.abs(data.accumulatedRotation) < 0.01 &&
            data.burstIntensity <= 0) {
          data.mesh.scaling = data.originalScale.clone();
          data.mesh.rotation.y = data.originalRotation.y;
          
          // Dispose light burst
          if (data.lightBurst) {
            data.lightBurst.dispose();
          }
          if (data.lightBurstMesh) {
            data.lightBurstMesh.dispose();
          }
          
          lookedAtMeshRef.current = null;
        }
      }
    };

    // Render loop with dynamic occlusion, prop detection, and animations
    let posUpdateCounter = 0;
    engine.runRenderLoop(() => {
      updateDynamicOcclusion();
      detectLookedAtProp();
      updatePropAnimations();
      
      // Send player position/rotation back to parent every 5 frames
      posUpdateCounter++;
      if (posUpdateCounter >= 5 && camera && onPositionUpdate) {
        posUpdateCounter = 0;
        const pos = camera.position;
        onPositionUpdate(
          [pos.x, pos.y, pos.z],
          camera.rotation.y
        );
      }
      
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Track mouse movements for calibration
    const handleMouseMove = (event: MouseEvent) => {
      if (onMouseMove && (event.movementX !== 0 || event.movementY !== 0)) {
        onMouseMove(event.movementX, event.movementY);
      }
    };
    
    // Only track when pointer is locked (during active gameplay)
    if (document.pointerLockElement) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    setIsReady(true);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Stop soundtrack
      if (soundtrackRef.current) {
        soundtrackRef.current.stop();
        soundtrackRef.current = null;
      }
      
      // Stop ambient audio
      if (ambientAudioRef.current) {
        ambientAudioRef.current.stop();
        ambientAudioRef.current = null;
      }
      
      // Stop narrator
      const narrator = getVoiceNarrator();
      narrator.stop();
      
      // Stop fire ambient sounds
      fireAmbientContexts.forEach(ctx => { try { ctx.close(); } catch (e) {} });
      fireAmbientContexts.length = 0;
      
      scene.dispose();
      engine.dispose();
    };
  }, [scenario.id, quality]);

  // Update risk visibility when risksFoundIds changes — hide all sub-meshes and show green checkmark
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    risksFoundIds.forEach((riskId) => {
      // Disable every mesh whose name starts with "riskId" or equals it
      scene.meshes.forEach((m) => {
        if (m.name === riskId || m.name.startsWith(riskId + '_')) {
          m.setEnabled(false);
        }
      });

      // Create a green checkmark billboard if not already present
      const checkName = `${riskId}_check`;
      if (!scene.getMeshByName(checkName)) {
        const risk = scenario.risks.find((r) => r.id === riskId);
        if (risk) {
          const checkPlane = BABYLON.MeshBuilder.CreatePlane(checkName, { width: 1.0, height: 1.0 }, scene);
          checkPlane.position = new BABYLON.Vector3(risk.position[0], Math.min(risk.position[1] + 2.2, 2.8), risk.position[2]);
          checkPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
          checkPlane.isPickable = false;
          checkPlane.renderingGroupId = 3;

          const texSize = 128;
          const tex = new BABYLON.DynamicTexture(`${checkName}_tex`, { width: texSize, height: texSize }, scene, true);
          const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
          // Green circle background
          ctx.clearRect(0, 0, texSize, texSize);
          ctx.beginPath();
          ctx.arc(texSize / 2, texSize / 2, texSize / 2 - 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34,197,94,0.85)';
          ctx.fill();
          // White checkmark
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 12;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(32, 68);
          ctx.lineTo(54, 90);
          ctx.lineTo(96, 40);
          ctx.stroke();
          tex.update();

          const mat = new BABYLON.StandardMaterial(`${checkName}_mat`, scene);
          mat.diffuseTexture = tex;
          mat.opacityTexture = tex;
          mat.useAlphaFromDiffuseTexture = true;
          mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
          mat.disableLighting = true;
          mat.backFaceCulling = false;
          checkPlane.material = mat;
        }
      }
    });

    // Update soundtrack intensity based on progress
    if (soundtrackRef.current && scenario.risks.length > 0) {
      const progress = risksFoundIds.length / scenario.risks.length;
      soundtrackRef.current.setIntensity(progress);
      console.log(`[Soundtrack] Intensity: ${(progress * 100).toFixed(0)}%`);
    }
  }, [risksFoundIds, scenario.risks.length]);

  // Update mouse sensitivity dynamically when settings change
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.angularSensibility = audioSettings.mouseSensitivity || 500;
      console.log(`[BabylonScene] Mouse sensitivity updated to: ${audioSettings.mouseSensitivity || 500}`);
    }
  }, [audioSettings.mouseSensitivity]);

  // Re-attach camera controls when isActive changes (pointer lock regained)
  useEffect(() => {
    const camera = cameraRef.current;
    const canvas = canvasRef.current;
    if (!camera || !canvas) return;

    if (isActive) {
      // Detach and re-attach to reset input state cleanly
      camera.detachControl();
      camera.attachControl(canvas, true);
      // Re-focus canvas so keyboard events work
      canvas.focus();
      console.log('[BabylonScene] Controls re-attached (isActive=true)');
    } else {
      camera.detachControl();
      console.log('[BabylonScene] Controls detached (isActive=false)');
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none"
        tabIndex={1}
      />
      
      {/* Prop Label (contextual on-screen) */}
      {lookedAtProp && (
        <PropLabel
          propName={lookedAtProp.name}
          propType={lookedAtProp.type}
          distance={lookedAtProp.distance}
          condition={lookedAtProp.condition}
          icon={lookedAtProp.icon}
        />
      )}
      
      {/* Subtitles Overlay */}
      {currentSubtitle && (
        <SubtitlesOverlay
          text={currentSubtitle.text}
          severity={currentSubtitle.severity}
          duration={8000}
          onComplete={() => setCurrentSubtitle(null)}
        />
      )}
      
      {/* NPC Role Dialog */}
      <NPCDialogOverlay
        role={activeNPCRole}
        onClose={() => {
          const closedRole = activeNPCRole;
          setActiveNPCRole(null);
          if (closedRole) setQuizRole(closedRole);
        }}
      />

      {/* NPC Role Quiz */}
      {quizRole && (
        <NPCRoleQuiz
          role={quizRole}
          onClose={(bonusPoints) => {
            setQuizRole(null);
            if (bonusPoints > 0) {
              onRiskFound(`npc_quiz_${quizRole}_${Date.now()}`, false);
            }
          }}
        />
      )}
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Caricamento ambiente 3D...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: Load GLTF environment with optimizations
async function loadEnvironmentOptimized(
  scene: BABYLON.Scene,
  type: string,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  let modelPath = '';
  
  if (type === 'warehouse' || type === 'laboratory') {
    modelPath = '/models/warehouse.glb';
  } else if (type === 'factory') {
    modelPath = '/models/factory.glb';
  }

  if (modelPath) {
    const startTime = performance.now();
    
    try {
      // Load GLTF model
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        '',
        '',
        modelPath,
        scene
      );

      console.log('[Babylon] Loaded GLTF model:', modelPath, 'meshes:', result.meshes.length);

      let totalTriangles = 0;
      let optimizedMeshes = 0;
      let texturesOptimized = 0;

      // Optimize each loaded mesh
      result.meshes.forEach((mesh) => {
        if (mesh.name === '__root__') return;
        
        // Enable collisions
        mesh.checkCollisions = true;
        mesh.receiveShadows = quality !== 'low';

        // Cast shadows only for important meshes on higher quality
        if ((quality === 'high' || quality === 'ultra') && shadowGenerator) {
          mesh.checkCollisions = true;
          shadowGenerator.addShadowCaster(mesh);
        }

        // Optimize geometry
        if (mesh instanceof BABYLON.Mesh && mesh.geometry) {
          const vertices = mesh.getTotalVertices();
          totalTriangles += vertices / 3;

          // Optimize for rendering
          mesh.freezeWorldMatrix();
          mesh.doNotSyncBoundingInfo = true;
          
          // Compute normals if needed
          if (quality !== 'low') {
            mesh.createNormals(false);
          }
          
          optimizedMeshes++;
        }

        // Optimize materials and textures
        const material = mesh.material;
        if (material instanceof BABYLON.StandardMaterial || material instanceof BABYLON.PBRMaterial) {
          
          // Reduce texture quality based on settings
          const maxTextureSize = quality === 'low' ? 512 : quality === 'medium' ? 1024 : quality === 'high' ? 2048 : 4096;
          
          const optimizeTexture = (texture: BABYLON.BaseTexture | null) => {
            if (texture && texture instanceof BABYLON.Texture) {
              // Use mipmaps for better performance
              texture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
              
              // Anisotropic filtering based on quality
              texture.anisotropicFilteringLevel = quality === 'low' ? 1 : quality === 'medium' ? 2 : 4;
              
              texturesOptimized++;
            }
          };

          if (material instanceof BABYLON.StandardMaterial) {
            optimizeTexture(material.diffuseTexture);
            optimizeTexture(material.specularTexture);
            optimizeTexture(material.bumpTexture);
            
            // Disable expensive features on low quality
            if (quality === 'low') {
              material.specularPower = 0;
            }
          } else if (material instanceof BABYLON.PBRMaterial) {
            optimizeTexture(material.albedoTexture);
            optimizeTexture(material.metallicTexture);
            optimizeTexture(material.bumpTexture);
            optimizeTexture(material.reflectivityTexture);
            
            // Reduce PBR complexity on lower quality
            if (quality === 'low' || quality === 'medium') {
              material.useRoughnessFromMetallicTextureAlpha = false;
              material.useRoughnessFromMetallicTextureGreen = true;
            }
          }

          // Freeze material to prevent updates
          material.freeze();
        }
      });

      // Scale and position the model
      if (result.meshes[0]) {
        const rootMesh = result.meshes[0];
        rootMesh.scaling = new BABYLON.Vector3(2, 2, 2);
        rootMesh.position = new BABYLON.Vector3(0, 0, 0);
      }

      // Performance logging
      const loadTime = performance.now() - startTime;
      const memoryUsed = (performance as any).memory?.usedJSHeapSize 
        ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB`
        : 'N/A';
      
      console.log(`[Babylon] Model optimization complete:`, {
        meshes: result.meshes.length,
        triangles: Math.round(totalTriangles),
        optimizedMeshes,
        texturesOptimized,
        loadTime: `${loadTime.toFixed(2)}ms`,
        memoryUsed,
        quality
      });

      const performanceEmoji = loadTime < 500 ? '⚡' : loadTime < 1000 ? '✓' : '⏱️';
      toast.success(
        `${performanceEmoji} Ambiente ${type}: ${result.meshes.length} mesh, ` +
        `${Math.round(totalTriangles / 1000)}k tri, ${texturesOptimized} texture ottimizzate (${loadTime.toFixed(0)}ms)`
      );
      return;
    } catch (error) {
      console.error('[Babylon] Failed to load GLTF model:', error);
      toast.error('Errore caricamento modello 3D, uso geometria procedurale');
    }
  }

  // Fallback to procedural geometry for office or if model fails
  createProceduralEnvironment(scene, type, quality, shadowGenerator);
}

// Helper: Add environmental props and details
function addEnvironmentalProps(
  scene: BABYLON.Scene,
  type: string,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null,
  risksFoundIds: string[] = [],
  onFirePropagationChange?: (level: number) => void,
  ambientAudioRef?: React.MutableRefObject<AmbientAudioPlayer | null>,
  onSprinklerStatusChange?: (active: boolean) => void,
  cameraRef?: React.RefObject<BABYLON.UniversalCamera | null>
) {
  console.log(`[Props] Adding environmental details for ${type}`);

  if (type === 'warehouse') {
    // Dense industrial lighting array (12x suspended lights)
    for (let i = 0; i < 12; i++) {
      const light = BABYLON.MeshBuilder.CreateCylinder(
        `industrialLight_${i}`,
        { height: 2, diameter: 0.6 },
        scene
      );
      light.position = new BABYLON.Vector3(
        -18 + (i % 4) * 12,
        6.5,
        -12 + Math.floor(i / 4) * 12
      );
      light.rotation.x = Math.PI / 2;
      
      const mat = new BABYLON.StandardMaterial(`lightMat_${i}`, scene);
      mat.emissiveColor = new BABYLON.Color3(1, 0.9, 0.7); // Warm industrial light
      mat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
      mat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      mat.specularPower = 64;
      light.material = mat;

      // Dramatic point light from each fixture
      if (quality !== 'low') {
        const pointLight = new BABYLON.PointLight(
          `pointLight_${i}`,
          light.position.clone().addInPlace(new BABYLON.Vector3(0, -0.5, 0)),
          scene
        );
        pointLight.intensity = 1.2; // Stronger lighting
        pointLight.range = 22;
        pointLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
        pointLight.specular = new BABYLON.Color3(0.9, 0.8, 0.6);
        
        // Dramatic light cones (visible light shafts)
        const cone = BABYLON.MeshBuilder.CreateCylinder(
          `lightCone_${i}`,
          { height: 5, diameterTop: 0.6, diameterBottom: 4, tessellation: 16 },
          scene
        );
        cone.position = light.position.clone().addInPlace(new BABYLON.Vector3(0, -2.5, 0));
        const coneMat = new BABYLON.StandardMaterial(`coneMat_${i}`, scene);
        coneMat.alpha = 0.25;
        coneMat.emissiveColor = new BABYLON.Color3(1, 0.9, 0.7);
        cone.material = coneMat;
      }
    }

    // Safety signs and barriers
    for (let i = 0; i < 12; i++) {
      const sign = BABYLON.MeshBuilder.CreatePlane(
        `sign_${i}`,
        { size: 1 },
        scene
      );
      sign.position = new BABYLON.Vector3(
        Math.random() * 40 - 20,
        2 + Math.random(),
        Math.random() * 40 - 20
      );
      sign.rotation.y = Math.random() * Math.PI * 2;
      
      const signMat = new BABYLON.StandardMaterial(`signMat_${i}`, scene);
      signMat.diffuseColor = i % 2 === 0 
        ? new BABYLON.Color3(1, 0.8, 0) // Yellow warning
        : new BABYLON.Color3(1, 0, 0); // Red danger
      signMat.emissiveColor = signMat.diffuseColor.scale(0.3);
      sign.material = signMat;

      if (shadowGenerator) shadowGenerator.addShadowCaster(sign);
    }

    // Pallets and cargo boxes
    for (let i = 0; i < 25; i++) {
      const box = BABYLON.MeshBuilder.CreateBox(
        `cargo_${i}`,
        { width: 1 + Math.random(), height: 0.8 + Math.random() * 0.5, depth: 1 + Math.random() },
        scene
      );
      box.position = new BABYLON.Vector3(
        Math.random() * 35 - 17.5,
        0.4,
        Math.random() * 35 - 17.5
      );
      box.rotation.y = Math.random() * Math.PI;
      box.checkCollisions = false; // Small props — no collision to avoid trapping player
      
      const boxMat = new BABYLON.StandardMaterial(`cargoMat_${i}`, scene);
      boxMat.diffuseColor = new BABYLON.Color3(0.65 + Math.random() * 0.1, 0.45 + Math.random() * 0.1, 0.25 + Math.random() * 0.1); // Vivid cardboard brown
      boxMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      box.material = boxMat;
      
      if (shadowGenerator) shadowGenerator.addShadowCaster(box);
    }

  } else if (type === 'construction' || type === 'factory') {
    // === REALISTIC CONSTRUCTION SITE ===
    const yellowMat = new BABYLON.StandardMaterial('constr_yellow', scene);
    yellowMat.diffuseColor = new BABYLON.Color3(0.92, 0.78, 0.15);
    yellowMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.4);
    yellowMat.specularPower = 24;

    const darkMetalMat = new BABYLON.StandardMaterial('constr_darkMetal', scene);
    darkMetalMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.28);
    darkMetalMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);

    const concreteMat = new BABYLON.StandardMaterial('constr_concrete', scene);
    concreteMat.diffuseColor = new BABYLON.Color3(0.6, 0.58, 0.55);
    concreteMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

    const woodMat = new BABYLON.StandardMaterial('constr_wood', scene);
    woodMat.diffuseColor = new BABYLON.Color3(0.55, 0.4, 0.22);
    woodMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const orangeMat = new BABYLON.StandardMaterial('constr_orange', scene);
    orangeMat.diffuseColor = new BABYLON.Color3(1, 0.45, 0);
    orangeMat.emissiveColor = new BABYLON.Color3(0.15, 0.06, 0);

    const dirtMat = new BABYLON.StandardMaterial('constr_dirt', scene);
    dirtMat.diffuseColor = new BABYLON.Color3(0.52, 0.42, 0.3);
    dirtMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    const blueTarpMat = new BABYLON.StandardMaterial('constr_tarp', scene);
    blueTarpMat.diffuseColor = new BABYLON.Color3(0.15, 0.3, 0.65);
    blueTarpMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // ── TOWER CRANE ──
    const craneBase = BABYLON.MeshBuilder.CreateBox('crane_base', { width: 3, height: 1.5, depth: 3 }, scene);
    craneBase.position = new BABYLON.Vector3(-18, 0.75, -18);
    craneBase.material = concreteMat;
    craneBase.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(craneBase);

    const craneTower = BABYLON.MeshBuilder.CreateBox('crane_tower', { width: 1.2, height: 22, depth: 1.2 }, scene);
    craneTower.position = new BABYLON.Vector3(-18, 12, -18);
    craneTower.material = yellowMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(craneTower);

    // Lattice cross-bracing (visual detail)
    for (let h = 0; h < 10; h++) {
      const brace = BABYLON.MeshBuilder.CreateBox(`crane_brace_${h}`, { width: 1.6, height: 0.08, depth: 0.08 }, scene);
      brace.position = new BABYLON.Vector3(-18, 2.5 + h * 2, -18);
      brace.rotation.y = h % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
      brace.material = yellowMat;
    }

    // Create a pivot node at the tower top for crane rotation
    const cranePivot = new BABYLON.TransformNode('crane_pivot', scene);
    cranePivot.position = new BABYLON.Vector3(-18, 22.5, -18);

    const craneJib = BABYLON.MeshBuilder.CreateBox('crane_jib', { width: 18, height: 0.6, depth: 0.6 }, scene);
    craneJib.position = new BABYLON.Vector3(8, 0, 0); // relative to pivot
    craneJib.material = yellowMat;
    craneJib.parent = cranePivot;
    if (shadowGenerator) shadowGenerator.addShadowCaster(craneJib);

    const craneCounterJib = BABYLON.MeshBuilder.CreateBox('crane_counterjib', { width: 6, height: 0.5, depth: 0.5 }, scene);
    craneCounterJib.position = new BABYLON.Vector3(-4, 0, 0);
    craneCounterJib.material = yellowMat;
    craneCounterJib.parent = cranePivot;

    const counterWeight = BABYLON.MeshBuilder.CreateBox('crane_counterweight', { width: 2.5, height: 1.5, depth: 1.5 }, scene);
    counterWeight.position = new BABYLON.Vector3(-6, -0.5, 0);
    counterWeight.material = concreteMat;
    counterWeight.parent = cranePivot;

    const cable = BABYLON.MeshBuilder.CreateCylinder('crane_cable', { height: 14, diameter: 0.06, tessellation: 6 }, scene);
    cable.position = new BABYLON.Vector3(13, -7, 0);
    cable.material = darkMetalMat;
    cable.parent = cranePivot;

    const hook = BABYLON.MeshBuilder.CreateTorus('crane_hook', { diameter: 0.6, thickness: 0.1, tessellation: 12 }, scene);
    hook.position = new BABYLON.Vector3(13, -14, 0);
    hook.rotation.x = Math.PI / 2;
    hook.material = darkMetalMat;
    hook.parent = cranePivot;

    const suspLoad = BABYLON.MeshBuilder.CreateBox('crane_load', { width: 4, height: 0.4, depth: 0.8 }, scene);
    suspLoad.position = new BABYLON.Vector3(13, -14.7, 0);
    suspLoad.material = darkMetalMat;
    suspLoad.parent = cranePivot;
    if (shadowGenerator) shadowGenerator.addShadowCaster(suspLoad);

    // ── EXCAVATOR ──
    const excBody = BABYLON.MeshBuilder.CreateBox('exc_body', { width: 3, height: 1.5, depth: 2.2 }, scene);
    excBody.position = new BABYLON.Vector3(12, 1.2, -15);
    excBody.rotation.y = -0.4;
    excBody.material = yellowMat;
    excBody.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(excBody);

    const excCab = BABYLON.MeshBuilder.CreateBox('exc_cab', { width: 1.8, height: 1.2, depth: 1.6 }, scene);
    excCab.position = new BABYLON.Vector3(12.3, 2.5, -14.8);
    excCab.rotation.y = -0.4;
    excCab.material = yellowMat;

    // Cab glass
    const excGlass = BABYLON.MeshBuilder.CreateBox('exc_glass', { width: 1.6, height: 0.8, depth: 0.05 }, scene);
    excGlass.position = new BABYLON.Vector3(12.8, 2.6, -14);
    excGlass.rotation.y = -0.4;
    const glassMat = new BABYLON.StandardMaterial('exc_glass_mat', scene);
    glassMat.diffuseColor = new BABYLON.Color3(0.5, 0.7, 0.85);
    glassMat.alpha = 0.5;
    excGlass.material = glassMat;

    // Arm segments
    const excArm1 = BABYLON.MeshBuilder.CreateBox('exc_arm1', { width: 0.4, height: 4, depth: 0.35 }, scene);
    excArm1.position = new BABYLON.Vector3(13.5, 3.5, -15.5);
    excArm1.rotation.z = 0.5;
    excArm1.rotation.y = -0.4;
    excArm1.material = yellowMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(excArm1);

    const excArm2 = BABYLON.MeshBuilder.CreateBox('exc_arm2', { width: 0.35, height: 3.5, depth: 0.3 }, scene);
    excArm2.position = new BABYLON.Vector3(15, 4.5, -16);
    excArm2.rotation.z = -0.8;
    excArm2.rotation.y = -0.4;
    excArm2.material = yellowMat;

    // Bucket
    const excBucket = BABYLON.MeshBuilder.CreateBox('exc_bucket', { width: 1.4, height: 0.8, depth: 1 }, scene);
    excBucket.position = new BABYLON.Vector3(16, 2.2, -16.5);
    excBucket.rotation.z = 0.3;
    excBucket.material = darkMetalMat;

    // Tracks
    [-0.8, 0.8].forEach((offset, i) => {
      const track = BABYLON.MeshBuilder.CreateBox(`exc_track_${i}`, { width: 0.5, height: 0.6, depth: 3.5 }, scene);
      track.position = new BABYLON.Vector3(12 + Math.cos(-0.4) * offset, 0.3, -15 + Math.sin(-0.4) * offset);
      track.rotation.y = -0.4;
      track.material = darkMetalMat;
    });

    // ── CONCRETE MIXER TRUCK ──
    const mixerBody = BABYLON.MeshBuilder.CreateBox('mixer_body', { width: 2.5, height: 1.6, depth: 6 }, scene);
    mixerBody.position = new BABYLON.Vector3(-8, 0.8, 12);
    mixerBody.rotation.y = 0.3;
    mixerBody.material = darkMetalMat;
    mixerBody.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(mixerBody);

    const mixerCab = BABYLON.MeshBuilder.CreateBox('mixer_cab', { width: 2.4, height: 1.8, depth: 2 }, scene);
    mixerCab.position = new BABYLON.Vector3(-7.5, 1.7, 14.5);
    mixerCab.rotation.y = 0.3;
    const mixerCabMat = new BABYLON.StandardMaterial('mixer_cab_mat', scene);
    mixerCabMat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.15);
    mixerCab.material = mixerCabMat;

    const mixerDrum = BABYLON.MeshBuilder.CreateCylinder('mixer_drum', { height: 4, diameterTop: 1.2, diameterBottom: 2, tessellation: 12 }, scene);
    mixerDrum.position = new BABYLON.Vector3(-8.2, 2.5, 11);
    mixerDrum.rotation.z = Math.PI / 2;
    mixerDrum.rotation.y = 0.3;
    const drumMat = new BABYLON.StandardMaterial('mixer_drum_mat', scene);
    drumMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.72);
    drumMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    mixerDrum.material = drumMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(mixerDrum);

    // Wheels
    for (let w = 0; w < 6; w++) {
      const wheel = BABYLON.MeshBuilder.CreateCylinder(`mixer_wheel_${w}`, { height: 0.35, diameter: 0.8, tessellation: 12 }, scene);
      const zOff = 14.5 - (w < 2 ? 0 : w < 4 ? 3 : 5);
      const xOff = w % 2 === 0 ? 1.4 : -1.4;
      wheel.position = new BABYLON.Vector3(-8 + xOff * Math.cos(0.3), 0.4, zOff);
      wheel.rotation.x = Math.PI / 2;
      wheel.material = darkMetalMat;
    }

    // ── SCAFFOLDING (2 structures) ──
    [{ x: 5, z: -6 }, { x: -14, z: 5 }].forEach((sp, si) => {
      const scaffW = 4, scaffH = 8, scaffD = 1.5;
      // Vertical poles
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz], pi) => {
        const pole = BABYLON.MeshBuilder.CreateCylinder(`scaff_${si}_pole_${pi}`, { height: scaffH, diameter: 0.08, tessellation: 6 }, scene);
        pole.position = new BABYLON.Vector3(sp.x + sx * scaffW / 2, scaffH / 2, sp.z + sz * scaffD / 2);
        pole.material = darkMetalMat;
      });
      // Platforms
      for (let lvl = 0; lvl < 3; lvl++) {
        const platform = BABYLON.MeshBuilder.CreateBox(`scaff_${si}_plat_${lvl}`, { width: scaffW + 0.3, height: 0.06, depth: scaffD + 0.1 }, scene);
        platform.position = new BABYLON.Vector3(sp.x, 2.5 + lvl * 2.5, sp.z);
        platform.material = woodMat;
        if (shadowGenerator) shadowGenerator.addShadowCaster(platform);
      }
      // Cross bracing
      for (let lvl = 0; lvl < 3; lvl++) {
        const crossA = BABYLON.MeshBuilder.CreateBox(`scaff_${si}_xA_${lvl}`, { width: Math.sqrt(scaffW * scaffW + 6.25), height: 0.05, depth: 0.05 }, scene);
        crossA.position = new BABYLON.Vector3(sp.x, 1.25 + lvl * 2.5, sp.z + scaffD / 2 + 0.1);
        crossA.rotation.z = Math.atan2(2.5, scaffW);
        crossA.material = darkMetalMat;
      }
    });

    // ── MATERIAL PILES (Sand, Gravel, Dirt) ──
    const pileConfigs = [
      { pos: new BABYLON.Vector3(8, 0, 5), s: 3, mat: dirtMat },
      { pos: new BABYLON.Vector3(10, 0, 8), s: 2.5, mat: concreteMat },
      { pos: new BABYLON.Vector3(-3, 0, -12), s: 3.5, mat: dirtMat },
    ];
    pileConfigs.forEach((p, i) => {
      const pile = BABYLON.MeshBuilder.CreateCylinder(`pile_${i}`, { height: p.s * 0.6, diameterTop: 0.3, diameterBottom: p.s * 1.6, tessellation: 8 }, scene);
      pile.position = p.pos.add(new BABYLON.Vector3(0, p.s * 0.3, 0));
      pile.material = p.mat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(pile);
    });

    // ── CONCRETE PIPES (stacked) ──
    const pipePositions = [
      { x: -6, z: -18 }, { x: -5, z: -18 }, { x: -5.5, z: -17.2 },
    ];
    pipePositions.forEach((pp, i) => {
      const pipe = BABYLON.MeshBuilder.CreateCylinder(`conc_pipe_${i}`, { height: 3, diameter: 1.2, tessellation: 16 }, scene);
      pipe.position = new BABYLON.Vector3(pp.x, i < 2 ? 0.6 : 1.5, pp.z);
      pipe.rotation.z = Math.PI / 2;
      pipe.material = concreteMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(pipe);
      // Hollow inside
      const inner = BABYLON.MeshBuilder.CreateCylinder(`conc_pipe_inner_${i}`, { height: 3.1, diameter: 0.9, tessellation: 16 }, scene);
      inner.position = pipe.position.clone();
      inner.rotation.z = Math.PI / 2;
      const innerMat = new BABYLON.StandardMaterial(`pipe_inner_${i}`, scene);
      innerMat.diffuseColor = new BABYLON.Color3(0.35, 0.33, 0.3);
      inner.material = innerMat;
    });

    // ── REBAR BUNDLES ──
    [{ x: 4, z: -18 }, { x: 15, z: 8 }].forEach((rb, ri) => {
      for (let j = 0; j < 8; j++) {
        const bar = BABYLON.MeshBuilder.CreateCylinder(`rebar_${ri}_${j}`, { height: 5, diameter: 0.03, tessellation: 6 }, scene);
        bar.position = new BABYLON.Vector3(rb.x + (j % 4) * 0.06, 0.15 + Math.floor(j / 4) * 0.06, rb.z);
        bar.rotation.z = Math.PI / 2;
        const rebarMat = new BABYLON.StandardMaterial(`rebar_mat_${ri}_${j}`, scene);
        rebarMat.diffuseColor = new BABYLON.Color3(0.5, 0.35, 0.2);
        bar.material = rebarMat;
      }
    });

    // ── PORTABLE TOILET (blue) ──
    const toilet = BABYLON.MeshBuilder.CreateBox('port_toilet', { width: 1.2, height: 2.3, depth: 1.2 }, scene);
    toilet.position = new BABYLON.Vector3(18, 1.15, -5);
    toilet.material = blueTarpMat;
    toilet.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(toilet);
    const toiletRoof = BABYLON.MeshBuilder.CreateBox('port_toilet_roof', { width: 1.3, height: 0.08, depth: 1.3 }, scene);
    toiletRoof.position = new BABYLON.Vector3(18, 2.35, -5);
    toiletRoof.material = blueTarpMat;
    // Door detail
    const toiletDoor = BABYLON.MeshBuilder.CreateBox('port_toilet_door', { width: 0.7, height: 1.8, depth: 0.05 }, scene);
    toiletDoor.position = new BABYLON.Vector3(18, 1.1, -4.4);
    toiletDoor.material = darkMetalMat;

    // ── CONSTRUCTION BARRIERS (realistic jersey barriers + fence panels) ──
    // Jersey barriers (concrete)
    const jerseyPositions = [
      { x: -20, z: 0 }, { x: -20, z: 3 }, { x: -20, z: 6 }, { x: -20, z: 9 },
      { x: 20, z: -10 }, { x: 20, z: -7 }, { x: 20, z: -4 },
    ];
    jerseyPositions.forEach((jp, i) => {
      const jersey = BABYLON.MeshBuilder.CreateBox(`jersey_${i}`, { width: 0.6, height: 0.8, depth: 2.5 }, scene);
      jersey.position = new BABYLON.Vector3(jp.x, 0.4, jp.z);
      jersey.material = concreteMat;
      jersey.checkCollisions = true;
      if (shadowGenerator) shadowGenerator.addShadowCaster(jersey);
    });

    // Orange mesh fence panels
    for (let i = 0; i < 10; i++) {
      const fence = BABYLON.MeshBuilder.CreatePlane(`fence_${i}`, { width: 3, height: 1.2 }, scene);
      const angle = (i / 10) * Math.PI * 0.6 - 0.3;
      fence.position = new BABYLON.Vector3(-15 + i * 3.5, 0.7, -20);
      const fenceMat = new BABYLON.StandardMaterial(`fence_mat_${i}`, scene);
      fenceMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
      fenceMat.alpha = 0.7;
      fenceMat.backFaceCulling = false;
      fence.material = fenceMat;
    }

    // ── FORMWORK / CASSEFORME ──
    const formwork = BABYLON.MeshBuilder.CreateBox('formwork_1', { width: 6, height: 1.5, depth: 0.2 }, scene);
    formwork.position = new BABYLON.Vector3(0, 0.75, 10);
    formwork.material = woodMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(formwork);
    const formwork2 = BABYLON.MeshBuilder.CreateBox('formwork_2', { width: 0.2, height: 1.5, depth: 6 }, scene);
    formwork2.position = new BABYLON.Vector3(3, 0.75, 13);
    formwork2.material = woodMat;

    // ── TOOL TABLE ──
    const toolTable = BABYLON.MeshBuilder.CreateBox('tool_table', { width: 2, height: 0.8, depth: 1 }, scene);
    toolTable.position = new BABYLON.Vector3(-12, 0.4, 15);
    toolTable.material = woodMat;
    // Tools on table
    const toolPipe = BABYLON.MeshBuilder.CreateCylinder('tool_pipe', { height: 1.5, diameter: 0.05, tessellation: 6 }, scene);
    toolPipe.position = new BABYLON.Vector3(-12.3, 1, 15);
    toolPipe.rotation.z = Math.PI / 2 + 0.1;
    toolPipe.material = darkMetalMat;

    // ── STEEL BEAMS (I-beams stacked) ──
    for (let i = 0; i < 5; i++) {
      const beam = BABYLON.MeshBuilder.CreateBox(`steel_beam_${i}`, { width: 6, height: 0.25, depth: 0.15 }, scene);
      beam.position = new BABYLON.Vector3(15, 0.15 + i * 0.28, 15);
      beam.material = darkMetalMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(beam);
    }

    // ── CEMENT BAGS (stacked on pallet) ──
    const cementPallet = BABYLON.MeshBuilder.CreateBox('cement_pallet', { width: 1.2, height: 0.15, depth: 0.8 }, scene);
    cementPallet.position = new BABYLON.Vector3(-15, 0.075, -10);
    cementPallet.material = woodMat;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const bag = BABYLON.MeshBuilder.CreateBox(`cement_bag_${row}_${col}`, { width: 0.5, height: 0.2, depth: 0.35 }, scene);
        bag.position = new BABYLON.Vector3(-15.2 + col * 0.55, 0.25 + row * 0.22, -10);
        const bagMat = new BABYLON.StandardMaterial(`bag_mat_${row}_${col}`, scene);
        bagMat.diffuseColor = new BABYLON.Color3(0.7, 0.68, 0.6);
        bag.material = bagMat;
      }
    }

    // ── GENERATOR (yellow with vents) ──
    const gen = BABYLON.MeshBuilder.CreateBox('generator', { width: 2, height: 1.5, depth: 1.2 }, scene);
    gen.position = new BABYLON.Vector3(18, 0.75, 10);
    gen.material = yellowMat;
    gen.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(gen);
    const genVent = BABYLON.MeshBuilder.CreateBox('gen_vent', { width: 0.8, height: 0.6, depth: 0.05 }, scene);
    genVent.position = new BABYLON.Vector3(18, 0.9, 10.63);
    genVent.material = darkMetalMat;

    // ── WHEELBARROW ──
    const wbTray = BABYLON.MeshBuilder.CreateBox('wb_tray', { width: 0.6, height: 0.3, depth: 0.8 }, scene);
    wbTray.position = new BABYLON.Vector3(5, 0.5, 12);
    wbTray.rotation.z = -0.15;
    wbTray.material = darkMetalMat;
    const wbWheel = BABYLON.MeshBuilder.CreateCylinder('wb_wheel', { height: 0.1, diameter: 0.35, tessellation: 12 }, scene);
    wbWheel.position = new BABYLON.Vector3(5, 0.18, 12.5);
    wbWheel.rotation.x = Math.PI / 2;
    wbWheel.material = darkMetalMat;

    // ── TRAFFIC CONES (scattered) ──
    const conePositions = [
      { x: 0, z: -5 }, { x: 2, z: -5 }, { x: 4, z: -5 },
      { x: -10, z: 0 }, { x: -10, z: 2 },
      { x: 10, z: -10 }, { x: 12, z: -10 },
    ];
    conePositions.forEach((cp, i) => {
      const coneBody = BABYLON.MeshBuilder.CreateCylinder(`tcone_${i}`, { height: 0.6, diameterTop: 0.04, diameterBottom: 0.3, tessellation: 8 }, scene);
      coneBody.position = new BABYLON.Vector3(cp.x, 0.3, cp.z);
      coneBody.material = orangeMat;
      const coneBase = BABYLON.MeshBuilder.CreateBox(`tcone_base_${i}`, { width: 0.35, height: 0.04, depth: 0.35 }, scene);
      coneBase.position = new BABYLON.Vector3(cp.x, 0.02, cp.z);
      coneBase.material = darkMetalMat;
    });

    // ── PORTABLE SITE OFFICE / CONTAINER ──
    const container = BABYLON.MeshBuilder.CreateBox('site_office', { width: 6, height: 2.8, depth: 2.5 }, scene);
    container.position = new BABYLON.Vector3(15, 1.4, -20);
    const containerMat = new BABYLON.StandardMaterial('container_mat', scene);
    containerMat.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.82);
    container.material = containerMat;
    container.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(container);
    // Container door
    const contDoor = BABYLON.MeshBuilder.CreateBox('cont_door', { width: 0.9, height: 2, depth: 0.05 }, scene);
    contDoor.position = new BABYLON.Vector3(14, 1.2, -18.75);
    contDoor.material = darkMetalMat;
    // Container window
    const contWin = BABYLON.MeshBuilder.CreateBox('cont_win', { width: 1.2, height: 0.6, depth: 0.05 }, scene);
    contWin.position = new BABYLON.Vector3(16, 1.8, -18.75);
    const winMat = new BABYLON.StandardMaterial('cont_win_mat', scene);
    winMat.diffuseColor = new BABYLON.Color3(0.6, 0.75, 0.9);
    winMat.alpha = 0.6;
    contWin.material = winMat;

    // ── WARNING TAPE LINES (on ground) ──
    const tapeConfigs = [
      { x: -5, z: -15, w: 10, rot: 0 },
      { x: 10, z: 0, w: 8, rot: Math.PI / 2 },
    ];
    tapeConfigs.forEach((tc, i) => {
      const tape = BABYLON.MeshBuilder.CreateBox(`warn_tape_${i}`, { width: tc.w, height: 0.02, depth: 0.15 }, scene);
      tape.position = new BABYLON.Vector3(tc.x, 0.01, tc.z);
      tape.rotation.y = tc.rot;
      tape.material = orangeMat;
    });

    // ── CONSTRUCTION LIGHTS (tower lights) ──
    [{ x: -10, z: -15 }, { x: 10, z: 10 }].forEach((lp, i) => {
      const lightPole = BABYLON.MeshBuilder.CreateCylinder(`clight_pole_${i}`, { height: 5, diameter: 0.15, tessellation: 6 }, scene);
      lightPole.position = new BABYLON.Vector3(lp.x, 2.5, lp.z);
      lightPole.material = yellowMat;
      const lightHead = BABYLON.MeshBuilder.CreateBox(`clight_head_${i}`, { width: 0.8, height: 0.3, depth: 0.4 }, scene);
      lightHead.position = new BABYLON.Vector3(lp.x, 5.2, lp.z);
      const lhMat = new BABYLON.StandardMaterial(`clight_mat_${i}`, scene);
      lhMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.85);
      lhMat.emissiveColor = new BABYLON.Color3(0.4, 0.38, 0.3);
      lightHead.material = lhMat;

      const siteLight = new BABYLON.PointLight(`csite_light_${i}`, new BABYLON.Vector3(lp.x, 5, lp.z), scene);
      siteLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
      siteLight.intensity = 0.6;
      siteLight.range = 15;
    });

    // ── CONSTRUCTION SITE ANIMATIONS ──

    // 1. Crane slow rotation around tower axis
    scene.registerBeforeRender(() => {
      cranePivot.rotation.y += 0.0012; // ~0.07°/frame → full rotation ~85s
    });

    // 2. Mixer drum continuous rotation
    scene.registerBeforeRender(() => {
      mixerDrum.rotation.x += 0.02; // spinning around local axis
    });

    // 3. Flashing warning lights on excavator and mixer truck
    const flashLightExc = new BABYLON.PointLight('flash_exc', new BABYLON.Vector3(12.3, 3.5, -14.8), scene);
    flashLightExc.diffuse = new BABYLON.Color3(1, 0.6, 0);
    flashLightExc.intensity = 0;
    flashLightExc.range = 6;
    const flashBeaconExc = BABYLON.MeshBuilder.CreateCylinder('beacon_exc', { height: 0.25, diameter: 0.4, tessellation: 8 }, scene);
    flashBeaconExc.position = new BABYLON.Vector3(12.3, 3.3, -14.8);
    const beaconMatExc = new BABYLON.StandardMaterial('beacon_mat_exc', scene);
    beaconMatExc.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
    beaconMatExc.emissiveColor = new BABYLON.Color3(0.8, 0.4, 0);
    flashBeaconExc.material = beaconMatExc;

    const flashLightMixer = new BABYLON.PointLight('flash_mixer', new BABYLON.Vector3(-7.5, 3.7, 14.5), scene);
    flashLightMixer.diffuse = new BABYLON.Color3(1, 0.6, 0);
    flashLightMixer.intensity = 0;
    flashLightMixer.range = 6;
    const flashBeaconMixer = BABYLON.MeshBuilder.CreateCylinder('beacon_mixer', { height: 0.25, diameter: 0.4, tessellation: 8 }, scene);
    flashBeaconMixer.position = new BABYLON.Vector3(-7.5, 3.5, 14.5);
    const beaconMatMixer = new BABYLON.StandardMaterial('beacon_mat_mixer', scene);
    beaconMatMixer.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
    beaconMatMixer.emissiveColor = new BABYLON.Color3(0.8, 0.4, 0);
    flashBeaconMixer.material = beaconMatMixer;

    scene.registerBeforeRender(() => {
      const t = Date.now() * 0.001;
      // Alternating flash pattern (on 0.3s, off 0.7s)
      const flash1 = Math.sin(t * 6) > 0.3 ? 1.2 : 0;
      const flash2 = Math.sin(t * 6 + Math.PI) > 0.3 ? 1.2 : 0;
      flashLightExc.intensity = flash1;
      beaconMatExc.emissiveColor = new BABYLON.Color3(flash1 * 0.7, flash1 * 0.35, 0);
      flashLightMixer.intensity = flash2;
      beaconMatMixer.emissiveColor = new BABYLON.Color3(flash2 * 0.7, flash2 * 0.35, 0);
    });


    // === FIRE SIMULATION: Warehouse environment with fire emergency props ===

    // Heavy-duty warehouse shelving racks (6x - large, with collision)
    const rackPositions = [
      { x: -12, z: -8 }, { x: -12, z: 4 }, { x: -12, z: 16 },
      { x: 12, z: -8 }, { x: 12, z: 4 }, { x: 12, z: 16 },
    ];
    rackPositions.forEach((rp, i) => {
      const rack = BABYLON.MeshBuilder.CreateBox(`rack_${i}`, { width: 6, height: 4, depth: 1.5 }, scene);
      rack.position = new BABYLON.Vector3(rp.x, 2, rp.z);
      rack.checkCollisions = true; // Large object — keep collision
      const rackMat = new BABYLON.StandardMaterial(`rackMat_${i}`, scene);
      rackMat.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.5);
      rackMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
      rackMat.specularPower = 16;
      rack.material = rackMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(rack);

      // Boxes on shelves (no collision — small)
      for (let b = 0; b < 4; b++) {
        const crate = BABYLON.MeshBuilder.CreateBox(`crate_${i}_${b}`, {
          width: 0.8 + Math.random() * 0.4,
          height: 0.5 + Math.random() * 0.3,
          depth: 0.7 + Math.random() * 0.3,
        }, scene);
        crate.position = new BABYLON.Vector3(
          rp.x - 2 + b * 1.4,
          3.5 + Math.random() * 0.5,
          rp.z + (Math.random() - 0.5) * 0.4
        );
        crate.rotation.y = Math.random() * 0.3;
        const crateMat = new BABYLON.StandardMaterial(`crateMat_${i}_${b}`, scene);
        crateMat.diffuseColor = new BABYLON.Color3(0.6 + Math.random() * 0.1, 0.45 + Math.random() * 0.1, 0.25);
        crate.material = crateMat;
        if (shadowGenerator) shadowGenerator.addShadowCaster(crate);
      }
    });

    // Oil drums / hazardous material containers (scattered, no collision)
    const drumPositions = [
      new BABYLON.Vector3(-6, 0, -4), new BABYLON.Vector3(-4, 0, -5),
      new BABYLON.Vector3(7, 0, 8), new BABYLON.Vector3(8, 0, 7),
      new BABYLON.Vector3(-3, 0, 12), new BABYLON.Vector3(4, 0, -12),
    ];
    const drumColors = [
      new BABYLON.Color3(0.8, 0.2, 0.1), // Red — flammable
      new BABYLON.Color3(0.2, 0.3, 0.8), // Blue — chemical
      new BABYLON.Color3(0.7, 0.7, 0.1), // Yellow — caution
      new BABYLON.Color3(0.3, 0.3, 0.35), // Gray — generic
      new BABYLON.Color3(0.1, 0.6, 0.2), // Green — non-hazardous
      new BABYLON.Color3(0.8, 0.4, 0.1), // Orange — combustible
    ];
    drumPositions.forEach((pos, i) => {
      const drum = BABYLON.MeshBuilder.CreateCylinder(`drum_${i}`, {
        height: 0.85, diameter: 0.55, tessellation: 16,
      }, scene);
      drum.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 0.425, 0));
      const drumMat = new BABYLON.StandardMaterial(`drumMat_${i}`, scene);
      drumMat.diffuseColor = drumColors[i % drumColors.length];
      drumMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      drum.material = drumMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(drum);
    });

    // Fire hose reels on walls (4x)
    const hosePositions = [
      { x: -20, z: 0, ry: Math.PI / 2 }, { x: 20, z: 0, ry: -Math.PI / 2 },
      { x: 0, z: -20, ry: 0 }, { x: 0, z: 15, ry: Math.PI },
    ];
    hosePositions.forEach((hp, i) => {
      // Hose cabinet (red box on wall)
      const cabinet = BABYLON.MeshBuilder.CreateBox(`hoseCabinet_${i}`, { width: 0.8, height: 0.8, depth: 0.3 }, scene);
      cabinet.position = new BABYLON.Vector3(hp.x, 1.5, hp.z);
      cabinet.rotation.y = hp.ry;
      const cabinetMat = new BABYLON.StandardMaterial(`cabinetMat_${i}`, scene);
      cabinetMat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
      cabinetMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      cabinet.material = cabinetMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(cabinet);

      // Hose reel (dark cylinder)
      const reel = BABYLON.MeshBuilder.CreateCylinder(`hoseReel_${i}`, { height: 0.15, diameter: 0.5 }, scene);
      reel.position = cabinet.position.clone().addInPlace(new BABYLON.Vector3(0, 0, 0.16));
      reel.rotation.x = Math.PI / 2;
      const reelMat = new BABYLON.StandardMaterial(`reelMat_${i}`, scene);
      reelMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
      reel.material = reelMat;
    });

    // Emergency lighting (flickering warm/orange tones — fire alarm atmosphere)
    for (let i = 0; i < 10; i++) {
      const emergencyLight = BABYLON.MeshBuilder.CreateBox(
        `emergencyLight_${i}`,
        { width: 1.2, height: 0.15, depth: 0.4 },
        scene
      );
      emergencyLight.position = new BABYLON.Vector3(
        -15 + (i % 5) * 7.5,
        6.5,
        -10 + Math.floor(i / 5) * 18
      );
      
      const elMat = new BABYLON.StandardMaterial(`elMat_${i}`, scene);
      elMat.emissiveColor = new BABYLON.Color3(1, 0.5, 0.1);
      elMat.diffuseColor = new BABYLON.Color3(1, 0.6, 0.2);
      emergencyLight.material = elMat;

      if (quality !== 'low') {
        const elLight = new BABYLON.PointLight(
          `elLight_${i}`,
          emergencyLight.position.clone().addInPlace(new BABYLON.Vector3(0, -0.5, 0)),
          scene
        );
        elLight.intensity = 1.2;
        elLight.range = 20;
        elLight.diffuse = new BABYLON.Color3(1, 0.5, 0.1);
        
        // Flickering fire alarm effect
        scene.registerBeforeRender(() => {
          const t = Date.now() * 0.001;
          const flicker = 0.5 + Math.sin(t * 8 + i * 1.3) * 0.3 + Math.random() * 0.2;
          elLight.intensity = 1.2 * flicker;
          elMat.emissiveColor = new BABYLON.Color3(1 * flicker, 0.5 * flicker, 0.1 * flicker);
        });
      }
    }

    // === SPARE EXTINGUISHER PICKUPS (different types!) ===
    const spareExtConfigs: { pos: BABYLON.Vector3; type: ExtinguisherType; color: BABYLON.Color3; label: string }[] = [
      { pos: new BABYLON.Vector3(-8, 0.35, 2), type: 'powder', color: new BABYLON.Color3(0.8, 0.6, 0.1), label: 'Polvere' },
      { pos: new BABYLON.Vector3(6, 0.35, -8), type: 'foam', color: new BABYLON.Color3(0.1, 0.6, 0.3), label: 'Schiuma' },
      { pos: new BABYLON.Vector3(10, 0.35, 5), type: 'water', color: new BABYLON.Color3(0.1, 0.3, 0.8), label: 'Acqua' },
    ];

    spareExtConfigs.forEach((config, i) => {
      const body = BABYLON.MeshBuilder.CreateCylinder(`spareExt_${i}`, {
        height: 0.5, diameterTop: 0.1, diameterBottom: 0.12, tessellation: 12,
      }, scene);
      body.position = config.pos;
      body.metadata = { extType: config.type };
      
      const mat = new BABYLON.StandardMaterial(`spareExtMat_${i}`, scene);
      mat.diffuseColor = config.color;
      mat.emissiveColor = config.color.scale(0.2);
      mat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      body.material = mat;
      body.isPickable = true;
      body.checkCollisions = false;

      // Type label floating above
      const labelPlane = BABYLON.MeshBuilder.CreatePlane(`spareExtLabel_${i}`, { width: 1.2, height: 0.3 }, scene);
      labelPlane.position = config.pos.clone().addInPlace(new BABYLON.Vector3(0, 0.6, 0));
      labelPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      const labelMat = new BABYLON.StandardMaterial(`spareExtLabelMat_${i}`, scene);
      labelMat.diffuseColor = config.color;
      labelMat.emissiveColor = config.color.scale(0.5);
      labelMat.alpha = 0.85;
      labelMat.disableLighting = true;
      labelPlane.material = labelMat;

      // Glow layer for visibility
      const glow = new BABYLON.GlowLayer(`spareGlow_${i}`, scene);
      glow.addIncludedOnlyMesh(body);
      glow.intensity = 1.5;

      // Floating + rotating animation
      scene.registerBeforeRender(() => {
        const t = Date.now() * 0.001;
        body.position.y = config.pos.y + Math.sin(t * 2 + i) * 0.15;
        body.rotation.y += 0.02;
        labelPlane.position.y = config.pos.y + 0.6 + Math.sin(t * 2 + i) * 0.15;
      });
    });
    // Fire sources at strategic positions (near risk markers)
    const firePositions = [
      { pos: new BABYLON.Vector3(3, 0, -3), nearRiskId: '1' },    // Near risk 1: active fire
      { pos: new BABYLON.Vector3(-3, 0, -10), nearRiskId: '6' },   // Near risk 6: obstructed corridor
      { pos: new BABYLON.Vector3(0, 0, -13), nearRiskId: '9' },    // Near risk 9: overloaded power strip
    ];

    // Track fire systems for propagation
    const fireData: {
      system: BABYLON.ParticleSystem;
      smoke: BABYLON.ParticleSystem;
      light: BABYLON.PointLight;
      haze: BABYLON.Mesh;
      hazeMat: BABYLON.StandardMaterial;
      pos: BABYLON.Vector3;
      nearRiskId: string;
      baseEmitRate: number;
      baseSize: number;
      baseRange: number;
      currentScale: number;
    }[] = [];

    firePositions.forEach((fire, i) => {
      const pos = fire.pos;
      
      // Fire particle system
      const fireSystem = new BABYLON.ParticleSystem(`fire_${i}`, 500, scene);
      const fireEmitter = BABYLON.MeshBuilder.CreateSphere(`fireEmitter_${i}`, { diameter: 0.1 }, scene);
      fireEmitter.position = pos.clone();
      fireEmitter.isVisible = false;
      fireSystem.emitter = fireEmitter;

      fireSystem.particleTexture = new BABYLON.Texture(
        'https://assets.babylonjs.com/textures/flare.png',
        scene
      );

      fireSystem.color1 = new BABYLON.Color4(1, 0.8, 0.2, 1);
      fireSystem.color2 = new BABYLON.Color4(1, 0.3, 0, 1);
      fireSystem.colorDead = new BABYLON.Color4(0.3, 0.1, 0, 0);

      fireSystem.minSize = 0.15;
      fireSystem.maxSize = 0.6;
      fireSystem.minLifeTime = 0.3;
      fireSystem.maxLifeTime = 0.8;
      fireSystem.emitRate = 120;
      fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
      fireSystem.gravity = new BABYLON.Vector3(0, 2, 0);
      fireSystem.direction1 = new BABYLON.Vector3(-0.3, 1, -0.3);
      fireSystem.direction2 = new BABYLON.Vector3(0.3, 2, 0.3);
      fireSystem.minEmitPower = 0.5;
      fireSystem.maxEmitPower = 1.5;
      fireSystem.updateSpeed = 0.008;
      fireSystem.minEmitBox = new BABYLON.Vector3(-0.3, 0, -0.3);
      fireSystem.maxEmitBox = new BABYLON.Vector3(0.3, 0, 0.3);

      fireSystem.start();

      // Fire point light (dynamic flickering)
      const fireLight = new BABYLON.PointLight(`fireLight_${i}`, pos.clone().addInPlace(new BABYLON.Vector3(0, 1, 0)), scene);
      fireLight.diffuse = new BABYLON.Color3(1, 0.5, 0.1);
      fireLight.intensity = 2;
      fireLight.range = 12;
      
      scene.registerBeforeRender(() => {
        const flicker = 1.5 + Math.sin(Date.now() * 0.01 + i * 100) * 0.5 + Math.random() * 0.3;
        fireLight.intensity = flicker * (fireData[i]?.currentScale || 1);
      });

      // Smoke for this fire source
      const smokeSystem = new BABYLON.ParticleSystem(`fireSmoke_${i}`, 150, scene);
      const smokeEmitter = BABYLON.MeshBuilder.CreateSphere(`fireSmokeEmitter_${i}`, { diameter: 0.1 }, scene);
      smokeEmitter.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 1.5, 0));
      smokeEmitter.isVisible = false;
      smokeSystem.emitter = smokeEmitter;

      smokeSystem.particleTexture = new BABYLON.Texture(
        'https://assets.babylonjs.com/textures/flare.png',
        scene
      );

      smokeSystem.color1 = new BABYLON.Color4(0.4, 0.4, 0.4, 0.3);
      smokeSystem.color2 = new BABYLON.Color4(0.3, 0.3, 0.3, 0.15);
      smokeSystem.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0);

      smokeSystem.minSize = 0.8;
      smokeSystem.maxSize = 2.5;
      smokeSystem.minLifeTime = 2;
      smokeSystem.maxLifeTime = 5;
      smokeSystem.emitRate = 25;
      smokeSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
      smokeSystem.gravity = new BABYLON.Vector3(0, 0.3, 0);
      smokeSystem.direction1 = new BABYLON.Vector3(-0.2, 0.5, -0.2);
      smokeSystem.direction2 = new BABYLON.Vector3(0.2, 1, 0.2);
      smokeSystem.minEmitPower = 0.2;
      smokeSystem.maxEmitPower = 0.6;
      smokeSystem.updateSpeed = 0.005;
      smokeSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
      smokeSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);

      smokeSystem.start();

      // === HEAT HAZE DISTORTION PLANE ===
      const hazePlane = BABYLON.MeshBuilder.CreatePlane(
        `heatHaze_${i}`,
        { width: 2.5, height: 4 },
        scene
      );
      hazePlane.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 2, 0));
      hazePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y; // Always face camera horizontally
      
      const hazeMat = new BABYLON.StandardMaterial(`hazeMat_${i}`, scene);
      hazeMat.diffuseColor = new BABYLON.Color3(1, 0.95, 0.85);
      hazeMat.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0);
      hazeMat.alpha = 0.06; // Very subtle
      hazeMat.backFaceCulling = false;
      hazeMat.disableLighting = true;
      hazePlane.material = hazeMat;
      
      // Animate heat haze: wobble, pulse, and shift
      scene.registerBeforeRender(() => {
        const t = Date.now() * 0.001;
        const scale = fireData[i]?.currentScale || 1;
        
        // Oscillating scale creates "shimmering" effect
        const wobbleX = 2.5 * scale + Math.sin(t * 3.5 + i) * 0.3;
        const wobbleY = 4 * scale + Math.cos(t * 2.8 + i * 2) * 0.4;
        hazePlane.scaling = new BABYLON.Vector3(wobbleX, wobbleY, 1);
        
        // Subtle position oscillation
        hazePlane.position.x = pos.x + Math.sin(t * 1.5 + i) * 0.15 * scale;
        hazePlane.position.y = 2 + Math.sin(t * 0.8 + i * 3) * 0.2;
        
        // Pulsing alpha for heat shimmer
        hazeMat.alpha = (0.04 + Math.sin(t * 4 + i) * 0.02) * scale;
        
        // Color shift with heat intensity
        const heatIntensity = 0.05 + Math.sin(t * 2) * 0.03;
        hazeMat.emissiveColor = new BABYLON.Color3(
          heatIntensity * scale,
          heatIntensity * 0.5 * scale,
          0
        );
      });

      fireData.push({
        system: fireSystem,
        smoke: smokeSystem,
        light: fireLight,
        haze: hazePlane,
        hazeMat,
        pos: pos.clone(),
        nearRiskId: fire.nearRiskId,
        baseEmitRate: 120,
        baseSize: 0.6,
        baseRange: 12,
        currentScale: 1,
      });

      // === FIRE-CLASS AMBIENT SOUND (SPATIALIZED 3D) ===
      const fireClass = FIRE_CLASSES[i] || 'solid';
      if (cameraRef) startFireAmbientSound(fireClass, i, pos.clone(), cameraRef);

      // === FIRE-CLASS VISUAL INDICATOR ===
      createFireClassIndicator(scene, pos.clone(), fireClass, i);
    });

    // === GENERAL ATMOSPHERIC SMOKE (corridors) ===
    const atmosphericSmokePositions = [
      new BABYLON.Vector3(-5, 2, -7),
      new BABYLON.Vector3(4, 2, -6),
    ];

    atmosphericSmokePositions.forEach((pos, i) => {
      const smokeSystem = new BABYLON.ParticleSystem(`atmSmoke_${i}`, 80, scene);
      const smokeEmitter = BABYLON.MeshBuilder.CreateSphere(`atmSmokeEmitter_${i}`, { diameter: 0.1 }, scene);
      smokeEmitter.position = pos.clone();
      smokeEmitter.isVisible = false;
      smokeSystem.emitter = smokeEmitter;

      smokeSystem.particleTexture = new BABYLON.Texture(
        'https://assets.babylonjs.com/textures/flare.png',
        scene
      );

      smokeSystem.color1 = new BABYLON.Color4(0.35, 0.35, 0.35, 0.15);
      smokeSystem.color2 = new BABYLON.Color4(0.25, 0.25, 0.25, 0.08);
      smokeSystem.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0);
      smokeSystem.minSize = 1.2;
      smokeSystem.maxSize = 3;
      smokeSystem.minLifeTime = 3;
      smokeSystem.maxLifeTime = 6;
      smokeSystem.emitRate = 8;
      smokeSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
      smokeSystem.gravity = new BABYLON.Vector3(0, 0.2, 0);
      smokeSystem.direction1 = new BABYLON.Vector3(-0.3, 0.3, -0.3);
      smokeSystem.direction2 = new BABYLON.Vector3(0.3, 0.8, 0.3);
      smokeSystem.minEmitPower = 0.1;
      smokeSystem.maxEmitPower = 0.4;
      smokeSystem.updateSpeed = 0.004;
      smokeSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
      smokeSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);

      smokeSystem.start();
    });

    // === EMBER/SPARK PARTICLES ===
    const emberSystem = new BABYLON.ParticleSystem('embers', 80, scene);
    const emberEmitter = BABYLON.MeshBuilder.CreateBox('emberEmitter', { size: 0.1 }, scene);
    emberEmitter.position = new BABYLON.Vector3(0, 0.5, -7);
    emberEmitter.isVisible = false;
    emberSystem.emitter = emberEmitter;

    emberSystem.particleTexture = new BABYLON.Texture(
      'https://assets.babylonjs.com/textures/flare.png',
      scene
    );

    emberSystem.color1 = new BABYLON.Color4(1, 0.6, 0, 1);
    emberSystem.color2 = new BABYLON.Color4(1, 0.3, 0, 0.8);
    emberSystem.colorDead = new BABYLON.Color4(0.5, 0.1, 0, 0);
    emberSystem.minSize = 0.03;
    emberSystem.maxSize = 0.08;
    emberSystem.minLifeTime = 1;
    emberSystem.maxLifeTime = 4;
    emberSystem.emitRate = 15;
    emberSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    emberSystem.gravity = new BABYLON.Vector3(0, 0.5, 0);
    emberSystem.direction1 = new BABYLON.Vector3(-2, 1, -2);
    emberSystem.direction2 = new BABYLON.Vector3(2, 3, 2);
    emberSystem.minEmitPower = 0.3;
    emberSystem.maxEmitPower = 1;
    emberSystem.updateSpeed = 0.005;
    emberSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -8);
    emberSystem.maxEmitBox = new BABYLON.Vector3(8, 0, 8);

    emberSystem.start();

    // === FIRE PROPAGATION SYSTEM ===
    // Fires grow over time if nearby risks are not identified
    const PROPAGATION_START_DELAY = 15; // seconds before fires start growing
    const PROPAGATION_RATE = 0.008; // scale increase per second
    const MAX_SCALE = 3.0; // Maximum fire scale multiplier
    const fireStartTime = Date.now();
    let lastPropagationEmit = 0;

    // === SPRINKLER SYSTEM ===
    let sprinklersActive = false;
    const sprinklerSystems: BABYLON.ParticleSystem[] = [];
    const SPRINKLER_THRESHOLD = 0.9;
    const SPRINKLER_SLOWDOWN = 0.3; // multiplier on propagation rate when active

    // Create sprinkler head positions (ceiling-mounted)
    const sprinklerPositions = [
      new BABYLON.Vector3(-5, 4.5, -5),
      new BABYLON.Vector3(5, 4.5, -5),
      new BABYLON.Vector3(-5, 4.5, 5),
      new BABYLON.Vector3(5, 4.5, 5),
      new BABYLON.Vector3(0, 4.5, 0),
    ];

    // Steam particle systems (created when sprinklers contact fire)
    const steamSystems: BABYLON.ParticleSystem[] = [];

    // Spatial audio for sprinkler water
    let sprinklerAudioCtx: AudioContext | null = null;
    const sprinklerAudioSources: { panner: PannerNode; gain: GainNode; osc: OscillatorNode; noise: AudioBufferSourceNode }[] = [];

    const createSprinklerSpatialAudio = (positions: BABYLON.Vector3[]) => {
      try {
        sprinklerAudioCtx = new AudioContext();
        const masterGain = sprinklerAudioCtx.createGain();
        masterGain.gain.value = 0.35;
        masterGain.connect(sprinklerAudioCtx.destination);

        positions.forEach((pos, idx) => {
          if (!sprinklerAudioCtx) return;
          const ctx = sprinklerAudioCtx;

          // Panner for spatial positioning
          const panner = ctx.createPanner();
          panner.panningModel = 'HRTF';
          panner.distanceModel = 'inverse';
          panner.refDistance = 1;
          panner.maxDistance = 20;
          panner.rolloffFactor = 1.5;
          panner.positionX.value = pos.x;
          panner.positionY.value = pos.y;
          panner.positionZ.value = pos.z;

          // Water hiss - filtered noise
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          noise.loop = true;

          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.value = 3000 + idx * 200;
          noiseFilter.Q.value = 0.8;

          const noiseGain = ctx.createGain();
          noiseGain.gain.value = 0.25;

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(panner);

          // Water drip oscillator (low frequency wobble)
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 180 + idx * 30;
          const oscGain = ctx.createGain();
          oscGain.gain.value = 0.08;

          // LFO for water gurgle
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 2 + idx * 0.5;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 40;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();

          osc.connect(oscGain);
          oscGain.connect(panner);
          panner.connect(masterGain);

          // Fade in
          const now = ctx.currentTime;
          noiseGain.gain.setValueAtTime(0, now);
          noiseGain.gain.linearRampToValueAtTime(0.25, now + 1.5);

          noise.start();
          osc.start();

          sprinklerAudioSources.push({ panner, gain: noiseGain, osc, noise });
        });
      } catch (e) {
        console.warn('[BabylonScene] Sprinkler spatial audio failed:', e);
      }
    };

    // Update sprinkler audio listener position each frame
    const updateSprinklerAudioListener = () => {
      if (!sprinklerAudioCtx) return;
      const cam = scene.activeCamera as BABYLON.UniversalCamera;
      if (!cam) return;
      const listener = sprinklerAudioCtx.listener;
      const pos = cam.position;
      const fwd = cam.getForwardRay(1).direction;
      listener.positionX.value = pos.x;
      listener.positionY.value = pos.y;
      listener.positionZ.value = pos.z;
      listener.forwardX.value = fwd.x;
      listener.forwardY.value = fwd.y;
      listener.forwardZ.value = fwd.z;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    };

    const activateSprinklers = () => {
      if (sprinklersActive) return;
      sprinklersActive = true;
      onSprinklerStatusChange?.(true);

      // Start spatial water audio
      createSprinklerSpatialAudio(sprinklerPositions);

      sprinklerPositions.forEach((pos, idx) => {
        // Sprinkler head mesh
        const head = BABYLON.MeshBuilder.CreateCylinder(`sprinkler_head_${idx}`, {
          diameterTop: 0.3, diameterBottom: 0.15, height: 0.1,
        }, scene);
        head.position = pos;
        const headMat = new BABYLON.StandardMaterial(`sprinkler_mat_${idx}`, scene);
        headMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        headMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        head.material = headMat;

        // Water particle system
        const water = new BABYLON.ParticleSystem(`sprinkler_water_${idx}`, 200, scene);
        water.emitter = head;
        water.particleTexture = new BABYLON.Texture(
          'https://assets.babylonjs.com/textures/flare.png', scene
        );

        water.color1 = new BABYLON.Color4(0.6, 0.8, 1.0, 0.4);
        water.color2 = new BABYLON.Color4(0.4, 0.6, 0.9, 0.3);
        water.colorDead = new BABYLON.Color4(0.3, 0.5, 0.8, 0);
        water.minSize = 0.02;
        water.maxSize = 0.06;
        water.minLifeTime = 0.8;
        water.maxLifeTime = 1.5;
        water.emitRate = 150;
        water.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        water.gravity = new BABYLON.Vector3(0, -9.8, 0);
        water.direction1 = new BABYLON.Vector3(-1.5, -0.5, -1.5);
        water.direction2 = new BABYLON.Vector3(1.5, -0.2, 1.5);
        water.minEmitPower = 0.5;
        water.maxEmitPower = 1.5;
        water.updateSpeed = 0.008;
        water.minEmitBox = new BABYLON.Vector3(-0.1, 0, -0.1);
        water.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0.1);

        water.start();
        sprinklerSystems.push(water);

        // Sprinkler light (blue tint)
        const spLight = new BABYLON.PointLight(`sprinkler_light_${idx}`, pos, scene);
        spLight.diffuse = new BABYLON.Color3(0.4, 0.6, 1.0);
        spLight.intensity = 0.3;
        spLight.range = 4;

        // === FOAM / WATER PUDDLE on ground (PBR reflective) ===
        const puddle = BABYLON.MeshBuilder.CreateDisc(`puddle_${idx}`, {
          radius: 1.8,
          tessellation: 32,
        }, scene);
        puddle.position = new BABYLON.Vector3(pos.x, 0.02, pos.z);
        puddle.rotation.x = Math.PI / 2; // Lay flat on ground

        const puddleMat = new BABYLON.PBRMaterial(`puddleMat_${idx}`, scene);
        puddleMat.albedoColor = new BABYLON.Color3(0.75, 0.82, 0.88); // Light foam white-blue
        puddleMat.metallic = 0.1;
        puddleMat.roughness = 0.15; // Very smooth for reflections
        puddleMat.alpha = 0.0; // Start invisible, will fade in
        puddleMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        puddleMat.subSurface.isRefractionEnabled = true;
        puddleMat.subSurface.refractionIntensity = 0.4;
        puddleMat.subSurface.tintColor = new BABYLON.Color3(0.8, 0.9, 1.0);
        puddle.material = puddleMat;
        puddle.receiveShadows = true;

        // Foam ring (outer edge)
        const foamRing = BABYLON.MeshBuilder.CreateTorus(`foamRing_${idx}`, {
          diameter: 3.2,
          thickness: 0.3,
          tessellation: 24,
        }, scene);
        foamRing.position = new BABYLON.Vector3(pos.x, 0.03, pos.z);
        foamRing.rotation.x = Math.PI / 2;
        foamRing.scaling.y = 0.15; // Flatten

        const foamMat = new BABYLON.StandardMaterial(`foamMat_${idx}`, scene);
        foamMat.diffuseColor = new BABYLON.Color3(0.92, 0.95, 0.98);
        foamMat.emissiveColor = new BABYLON.Color3(0.15, 0.18, 0.22);
        foamMat.alpha = 0.0;
        foamMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        foamRing.material = foamMat;

        // Animate puddle growth + evaporation when fires are extinguished
        let puddleGrowth = 0;
        let evaporating = false;
        let evaporationProgress = 0;
        let evapSteam: BABYLON.ParticleSystem | null = null;

        scene.registerBeforeRender(() => {
          // Check if all fires near this sprinkler are extinguished
          const allFiresOut = fireData.every(fd => risksFoundIds.includes(fd.nearRiskId));

          if (!evaporating && allFiresOut && puddleGrowth >= 0.5) {
            evaporating = true;

            // Create evaporation steam particles above puddle
            evapSteam = new BABYLON.ParticleSystem(`evapSteam_${idx}`, 60, scene);
            const evapEmitter = BABYLON.MeshBuilder.CreateBox(`evapEmit_${idx}`, { size: 0.1 }, scene);
            evapEmitter.position = new BABYLON.Vector3(pos.x, 0.1, pos.z);
            evapEmitter.isVisible = false;
            evapSteam.emitter = evapEmitter;
            evapSteam.particleTexture = new BABYLON.Texture(
              'https://assets.babylonjs.com/textures/flare.png', scene
            );
            evapSteam.color1 = new BABYLON.Color4(0.9, 0.92, 0.96, 0.3);
            evapSteam.color2 = new BABYLON.Color4(0.85, 0.88, 0.93, 0.15);
            evapSteam.colorDead = new BABYLON.Color4(0.95, 0.95, 1.0, 0);
            evapSteam.minSize = 0.2;
            evapSteam.maxSize = 0.8;
            evapSteam.minLifeTime = 1.5;
            evapSteam.maxLifeTime = 3.0;
            evapSteam.emitRate = 30;
            evapSteam.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
            evapSteam.gravity = new BABYLON.Vector3(0, 0.8, 0);
            evapSteam.direction1 = new BABYLON.Vector3(-0.3, 1.5, -0.3);
            evapSteam.direction2 = new BABYLON.Vector3(0.3, 2.5, 0.3);
            evapSteam.minEmitPower = 0.2;
            evapSteam.maxEmitPower = 0.5;
            evapSteam.minEmitBox = new BABYLON.Vector3(-1.2, 0, -1.2);
            evapSteam.maxEmitBox = new BABYLON.Vector3(1.2, 0, 1.2);
            evapSteam.minAngularSpeed = -0.3;
            evapSteam.maxAngularSpeed = 0.3;
            evapSteam.start();
          }

          if (evaporating) {
            // Progressive evaporation
            evaporationProgress += 0.003;
            const t = Math.min(evaporationProgress, 1);
            const remaining = 1 - t;

            puddleMat.alpha = remaining * 0.65;
            foamMat.alpha = remaining * 0.5;
            puddleMat.roughness = 0.15 + t * 0.6; // Gets less reflective

            // Shrink puddle
            const scale = (0.3 + 0.7) * remaining + 0.1;
            puddle.scaling = new BABYLON.Vector3(scale, 1, scale);
            foamRing.scaling = new BABYLON.Vector3(scale, 0.15, scale);

            // Reduce evap steam over time
            if (evapSteam) {
              evapSteam.emitRate = 30 * Math.max(0, remaining);
              evapSteam.maxSize = 0.8 * remaining;
            }

            // Fully evaporated
            if (t >= 1) {
              puddle.dispose();
              foamRing.dispose();
              if (evapSteam) {
                evapSteam.stop();
                setTimeout(() => evapSteam?.dispose(), 3000);
              }
            }
          } else if (puddleGrowth < 1) {
            puddleGrowth += 0.005; // Slow fill
            const t = Math.min(puddleGrowth, 1);
            const eased = t * (2 - t); // ease-out

            puddleMat.alpha = eased * 0.65;
            foamMat.alpha = eased * 0.5;

            const scale = 0.3 + eased * 0.7;
            puddle.scaling = new BABYLON.Vector3(scale, 1, scale);
            foamRing.scaling = new BABYLON.Vector3(scale, 0.15, scale);
          }
        });
      });

      // === STEAM PARTICLES at fire contact points ===
      fireData.forEach((fd, fIdx) => {
        const steamSystem = new BABYLON.ParticleSystem(`steam_${fIdx}`, 80, scene);
        const steamEmitter = BABYLON.MeshBuilder.CreateSphere(`steamEmitter_${fIdx}`, { diameter: 0.1 }, scene);
        steamEmitter.position = fd.pos.clone().addInPlace(new BABYLON.Vector3(0, 0.5, 0));
        steamEmitter.isVisible = false;
        steamSystem.emitter = steamEmitter;

        steamSystem.particleTexture = new BABYLON.Texture(
          'https://assets.babylonjs.com/textures/flare.png', scene
        );

        // White/light gray steam colors
        steamSystem.color1 = new BABYLON.Color4(0.95, 0.95, 1.0, 0.35);
        steamSystem.color2 = new BABYLON.Color4(0.85, 0.88, 0.95, 0.25);
        steamSystem.colorDead = new BABYLON.Color4(0.9, 0.9, 0.95, 0);

        steamSystem.minSize = 0.3;
        steamSystem.maxSize = 1.2;
        steamSystem.minLifeTime = 1.5;
        steamSystem.maxLifeTime = 3.5;
        steamSystem.emitRate = 40;
        steamSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        steamSystem.gravity = new BABYLON.Vector3(0, 1.5, 0); // Steam rises
        steamSystem.direction1 = new BABYLON.Vector3(-0.4, 2, -0.4);
        steamSystem.direction2 = new BABYLON.Vector3(0.4, 4, 0.4);
        steamSystem.minEmitPower = 0.3;
        steamSystem.maxEmitPower = 0.8;
        steamSystem.updateSpeed = 0.006;
        steamSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
        steamSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);

        // Steam expands as it rises
        steamSystem.minAngularSpeed = -0.5;
        steamSystem.maxAngularSpeed = 0.5;

        steamSystem.start();
        steamSystems.push(steamSystem);
      });
    };

    // === EMERGENCY VOICE ANNOUNCEMENTS ===
    const narrator = getVoiceNarrator();
    narrator.initialize();
    let lastVoiceThreshold = 0;

    const voiceThresholds = [
      { level: 0.3, message: "Attenzione. Focolai attivi rilevati nell'area. Procedere con cautela e identificare le fonti di pericolo." },
      { level: 0.5, message: "Allarme. Propagazione del fuoco in corso. Identificare immediatamente tutti i rischi per contenere l'incendio." },
      { level: 0.7, message: "EMERGENZA! Il fuoco si sta espandendo rapidamente. Livello di pericolo critico. Azione immediata richiesta!" },
      { level: 0.85, message: "EVACUAZIONE IMMINENTE! Hai pochi secondi per identificare i rischi rimanenti prima che l'area diventi inagibile!" },
      { level: 0.9, message: "Sistema sprinkler attivato! Propagazione rallentata temporaneamente. Approfitta per trovare i rischi critici!" },
    ];

    const announceEmergency = (normalizedLevel: number) => {
      // Find the highest threshold we've crossed that hasn't been announced
      for (let i = voiceThresholds.length - 1; i >= 0; i--) {
        const threshold = voiceThresholds[i];
        if (normalizedLevel >= threshold.level && lastVoiceThreshold < threshold.level) {
          lastVoiceThreshold = threshold.level;
          
          // Use speech synthesis
          const synth = window.speechSynthesis;
          synth.cancel(); // Stop any ongoing speech
          
          const utterance = new SpeechSynthesisUtterance(threshold.message);
          // Try Italian voice
          const voices = synth.getVoices();
          const italianVoice = voices.find(v => v.lang.startsWith('it')) || voices[0];
          if (italianVoice) utterance.voice = italianVoice;
          
          utterance.rate = normalizedLevel > 0.7 ? 1.15 : 0.95;
          utterance.pitch = normalizedLevel > 0.7 ? 0.75 : 0.85;
          utterance.volume = Math.min(1.0, 0.7 + normalizedLevel * 0.3);
          
          synth.speak(utterance);
          break;
        }
      }
    };

    scene.registerBeforeRender(() => {
      const elapsed = (Date.now() - fireStartTime) / 1000;
      if (elapsed < PROPAGATION_START_DELAY) return;

      const propagationTime = elapsed - PROPAGATION_START_DELAY;
      // Calculate propagation rate modifier (slowed by sprinklers)
      const rateModifier = sprinklersActive ? SPRINKLER_SLOWDOWN : 1.0;

      fireData.forEach((fd) => {
        // Check if the nearby risk has been found (stops propagation)
        const riskFound = risksFoundIds.includes(fd.nearRiskId);
        
        if (riskFound) {
          // Gradually shrink fire when risk is identified
          fd.currentScale = Math.max(0.3, fd.currentScale - PROPAGATION_RATE * 2);
        } else {
          // Fire grows over time (slowed by sprinklers)
          fd.currentScale = Math.min(MAX_SCALE, 1 + propagationTime * PROPAGATION_RATE * rateModifier);
        }

        const scale = fd.currentScale;

        // Update fire particle system
        fd.system.emitRate = fd.baseEmitRate * scale;
        fd.system.maxSize = fd.baseSize * scale;
        fd.system.minEmitBox = new BABYLON.Vector3(-0.3 * scale, 0, -0.3 * scale);
        fd.system.maxEmitBox = new BABYLON.Vector3(0.3 * scale, 0, 0.3 * scale);

        // Update smoke (reduced when sprinklers active - steam instead)
        const smokeMultiplier = sprinklersActive ? 0.6 : 1.0;
        fd.smoke.emitRate = 25 * scale * smokeMultiplier;
        fd.smoke.maxSize = 2.5 * scale;

        // Update light range
        fd.light.range = fd.baseRange * scale;

        // Increase fog density with fire scale (global atmosphere)
        const avgScale = fireData.reduce((sum, f) => sum + f.currentScale, 0) / fireData.length;
        scene.fogDensity = 0.008 + (avgScale - 1) * 0.004;
      });

      // Update ember intensity based on overall fire scale
      const avgScale = fireData.reduce((sum, f) => sum + f.currentScale, 0) / fireData.length;
      emberSystem.emitRate = 15 * avgScale;

      // Emit fire propagation level (normalized 0-1) at ~4Hz
      const now = Date.now();
      if (now - lastPropagationEmit > 250) {
        lastPropagationEmit = now;
        const normalizedLevel = Math.max(0, (avgScale - 1) / (MAX_SCALE - 1));
        onFirePropagationChange?.(normalizedLevel);
        
        // Activate sprinklers at threshold
        if (normalizedLevel >= SPRINKLER_THRESHOLD && !sprinklersActive) {
          activateSprinklers();
        }

        // Emergency voice announcements
        announceEmergency(normalizedLevel);
        
        // Update ambient audio escalating alarm + panic
        if (ambientAudioRef.current) {
          ambientAudioRef.current.setFireAlarmIntensity(normalizedLevel);
          // Panic audio activates above 70% (vignette threshold)
          const panicLevel = normalizedLevel > 0.7 ? (normalizedLevel - 0.7) / 0.3 : 0;
          ambientAudioRef.current.setPanicIntensity(panicLevel);
        }

        // Update sprinkler spatial audio listener position
        if (sprinklersActive) {
          updateSprinklerAudioListener();
          
          // Scale steam intensity based on fire scale
          steamSystems.forEach((steam, sIdx) => {
            const fireScale = fireData[sIdx]?.currentScale || 1;
            steam.emitRate = Math.max(10, 40 * fireScale);
            steam.maxSize = 1.2 * fireScale;
          });
        }
      }
    });

  } else if (type === 'office') {
    // Professional office workstations (12x)
    for (let i = 0; i < 12; i++) {
      const desk = BABYLON.MeshBuilder.CreateBox(
        `desk_${i}`,
        { width: 2, height: 0.75, depth: 1 },
        scene
      );
      desk.position = new BABYLON.Vector3(
        -12 + (i % 4) * 8,
        0.375,
        -6 + Math.floor(i / 4) * 6
      );
      desk.checkCollisions = true;
      
      const deskMat = new BABYLON.StandardMaterial(`deskMat_${i}`, scene);
      deskMat.diffuseColor = new BABYLON.Color3(0.55, 0.4, 0.3); // Warm wood-tone
      deskMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
      deskMat.specularPower = 32;
      desk.material = deskMat;
      
      if (shadowGenerator) shadowGenerator.addShadowCaster(desk);

      // Dual monitors setup
      for (let m = 0; m < 2; m++) {
        const monitor = BABYLON.MeshBuilder.CreateBox(
          `monitor_${i}_${m}`,
          { width: 0.5, height: 0.35, depth: 0.04 },
          scene
        );
        monitor.position = desk.position.clone().addInPlace(
          new BABYLON.Vector3(-0.3 + m * 0.6, 0.575, -0.2)
        );
        monitor.rotation.y = m === 0 ? -0.1 : 0.1;
        
        const monMat = new BABYLON.StandardMaterial(`monMat_${i}_${m}`, scene);
        monMat.emissiveColor = new BABYLON.Color3(0.35, 0.45, 0.6); // Soft blue screen
        monMat.diffuseColor = new BABYLON.Color3(0.25, 0.28, 0.32); // Dark gray frame
        monMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        monitor.material = monMat;
      }
      
      // Keyboard and mouse
      const keyboard = BABYLON.MeshBuilder.CreateBox(
        `keyboard_${i}`,
        { width: 0.4, height: 0.02, depth: 0.15 },
        scene
      );
      keyboard.position = desk.position.clone().addInPlace(new BABYLON.Vector3(0, 0.376, 0.3));
      const kbMat = new BABYLON.StandardMaterial(`kbMat_${i}`, scene);
      kbMat.diffuseColor = new BABYLON.Color3(0.3, 0.32, 0.35); // Soft dark gray
      kbMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
      keyboard.material = kbMat;
    }

    // Ergonomic office chairs (12x)
    for (let i = 0; i < 12; i++) {
      const chair = BABYLON.MeshBuilder.CreateCylinder(
        `chair_${i}`,
        { height: 0.55, diameterTop: 0.5, diameterBottom: 0.45 },
        scene
      );
      chair.position = new BABYLON.Vector3(
        -12 + (i % 4) * 8,
        0.275,
        -6 + Math.floor(i / 4) * 6 + 1.3
      );
      chair.checkCollisions = false; // Small props — no collision
      
      const chairMat = new BABYLON.StandardMaterial(`chairMat_${i}`, scene);
      chairMat.diffuseColor = new BABYLON.Color3(0.3, 0.35, 0.4); // Professional dark gray chairs
      chairMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      chairMat.specularPower = 16;
      chair.material = chairMat;
      
      if (shadowGenerator) shadowGenerator.addShadowCaster(chair);
      
      // Chair backrest
      const backrest = BABYLON.MeshBuilder.CreateBox(
        `backrest_${i}`,
        { width: 0.5, height: 0.6, depth: 0.08 },
        scene
      );
      backrest.position = chair.position.clone().addInPlace(new BABYLON.Vector3(0, 0.6, -0.2));
      backrest.rotation.x = -0.2;
      const brMat = new BABYLON.StandardMaterial(`brMat_${i}`, scene);
      brMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.97); // White backrest
      brMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
      backrest.material = brMat;
    }

    // Modern recessed ceiling lights (6x grid — reduced from 9 to prevent washout)
    for (let i = 0; i < 6; i++) {
      const ceilingLight = BABYLON.MeshBuilder.CreateCylinder(
        `ceilLight_${i}`,
        { height: 0.15, diameter: 0.5 },
        scene
      );
      ceilingLight.position = new BABYLON.Vector3(
        -8 + (i % 3) * 8,
        3.0,
        -5 + Math.floor(i / 3) * 10
      );
      
      const clMat = new BABYLON.StandardMaterial(`clMat_${i}`, scene);
      clMat.emissiveColor = new BABYLON.Color3(0.6, 0.58, 0.52); // Toned down warm white
      clMat.diffuseColor = new BABYLON.Color3(0.9, 0.88, 0.83);
      clMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      clMat.specularPower = 64;
      ceilingLight.material = clMat;

      if (quality !== 'low') {
        const clLight = new BABYLON.PointLight(
          `clLight_${i}`,
          ceilingLight.position.clone().addInPlace(new BABYLON.Vector3(0, -0.5, 0)),
          scene
        );
        clLight.intensity = 0.6; // Much lower to prevent washout
        clLight.range = 8;
        clLight.diffuse = new BABYLON.Color3(1, 0.95, 0.85);
        clLight.specular = new BABYLON.Color3(0.4, 0.38, 0.35);
      }
    }
    
    // Office plants for atmosphere
    for (let i = 0; i < 6; i++) {
      const pot = BABYLON.MeshBuilder.CreateCylinder(
        `pot_${i}`,
        { height: 0.3, diameter: 0.25 },
        scene
      );
      pot.position = new BABYLON.Vector3(
        -15 + Math.random() * 30,
        0.15,
        -10 + Math.random() * 20
      );
      const potMat = new BABYLON.StandardMaterial(`potMat_${i}`, scene);
      potMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.25);
      pot.material = potMat;
      
      const plant = BABYLON.MeshBuilder.CreateSphere(
        `plant_${i}`,
        { diameter: 0.4 },
        scene
      );
      plant.position = pot.position.clone().addInPlace(new BABYLON.Vector3(0, 0.35, 0));
      const plantMat = new BABYLON.StandardMaterial(`plantMat_${i}`, scene);
      plantMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2);
      plant.material = plantMat;
    }
  }

  // === ADD SAFETY SIGNAGE for workplace realism ===
  addSafetySignage(scene, type, quality, shadowGenerator);

  // === ADD WORKER AVATARS for realism ===
  addWorkerAvatars(scene, type, shadowGenerator);

  console.log(`[Props] Environmental props added for ${type}`);
}

// Helper: Add worker avatars to populate environments
function addWorkerAvatars(
  scene: BABYLON.Scene,
  type: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  console.log(`[Avatars] Adding worker avatars for ${type}`);

  // === NPC VARIATION SYSTEM ===
  // Predefined skin tone palette (realistic range)
  const SKIN_TONES = [
    new BABYLON.Color3(0.96, 0.84, 0.72), // Light
    new BABYLON.Color3(0.87, 0.72, 0.58), // Medium-light
    new BABYLON.Color3(0.76, 0.60, 0.44), // Medium
    new BABYLON.Color3(0.62, 0.45, 0.32), // Medium-dark
    new BABYLON.Color3(0.45, 0.32, 0.22), // Dark
    new BABYLON.Color3(0.35, 0.24, 0.16), // Very dark
  ];

  // Clothing color palettes per category
  const SHIRT_COLORS = [
    new BABYLON.Color3(0.15, 0.25, 0.55), // Navy blue
    new BABYLON.Color3(0.55, 0.12, 0.12), // Dark red
    new BABYLON.Color3(0.18, 0.42, 0.22), // Forest green
    new BABYLON.Color3(0.35, 0.35, 0.40), // Charcoal
    new BABYLON.Color3(0.50, 0.35, 0.15), // Brown
    new BABYLON.Color3(0.10, 0.35, 0.50), // Teal
    new BABYLON.Color3(0.60, 0.45, 0.10), // Mustard
    new BABYLON.Color3(0.40, 0.15, 0.40), // Purple
  ];

  const PANTS_COLORS = [
    new BABYLON.Color3(0.12, 0.12, 0.18), // Dark navy
    new BABYLON.Color3(0.20, 0.20, 0.25), // Dark grey
    new BABYLON.Color3(0.30, 0.25, 0.15), // Khaki dark
    new BABYLON.Color3(0.15, 0.15, 0.15), // Near black
    new BABYLON.Color3(0.25, 0.18, 0.12), // Dark brown
  ];

  // Seeded random for consistent NPC appearance
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  };

  // Generate unique variation for each NPC based on index
  const getNPCVariation = (npcIndex: number) => {
    const s1 = seededRandom(npcIndex * 7 + 13);
    const s2 = seededRandom(npcIndex * 11 + 29);
    const s3 = seededRandom(npcIndex * 17 + 41);
    const s4 = seededRandom(npcIndex * 23 + 53);
    return {
      skinTone: SKIN_TONES[Math.floor(s1 * SKIN_TONES.length)],
      shirtColor: SHIRT_COLORS[Math.floor(s2 * SHIRT_COLORS.length)],
      pantsColor: PANTS_COLORS[Math.floor(s3 * PANTS_COLORS.length)],
      scale: 0.90 + s4 * 0.20, // 0.90 to 1.10 height variation
    };
  };

  // Pool of NPC avatar models — rotated for visual variety
  const NPC_MODELS = [
    'worker-01.glb',
    'avatar-02.glb',
    'avatar-03.glb',
    'avatar-04.glb',
    'avatar-05.glb',
    'avatar-06.glb',
    'avatar-07.glb',
  ];

  // Global NPC counter for unique variations
  let npcVariationCounter = 0;

  // Helper: simplify PBR materials to StandardMaterial with color variation
  // Also brightens NPC avatars with emissive fill light so they're never too dark
  const simplifyMaterials = (meshes: BABYLON.AbstractMesh[], variation?: ReturnType<typeof getNPCVariation>) => {
    meshes.forEach(mesh => {
      if (!mesh.material) return;
      const mat = mesh.material;
      const meshNameLower = mesh.name.toLowerCase();
      const matNameLower = mat.name.toLowerCase();

      // Detect mesh category for color variation
      const isSkin = matNameLower.includes('skin') || matNameLower.includes('body') || matNameLower.includes('head') || matNameLower.includes('face') || matNameLower.includes('hand') || matNameLower.includes('arm');
      const isShirt = matNameLower.includes('shirt') || matNameLower.includes('top') || matNameLower.includes('torso') || matNameLower.includes('jacket') || matNameLower.includes('vest');
      const isPants = matNameLower.includes('pants') || matNameLower.includes('bottom') || matNameLower.includes('leg') || matNameLower.includes('trouser');
      const isHair = matNameLower.includes('hair') || matNameLower.includes('beard');

      // Convert PBRMaterial or PBRMetallicRoughnessMaterial to StandardMaterial
      if (mat instanceof BABYLON.PBRMaterial || mat instanceof BABYLON.PBRMetallicRoughnessMaterial) {
        const stdMat = new BABYLON.StandardMaterial(mat.name + '_std', scene);
        let baseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        if (mat instanceof BABYLON.PBRMaterial) {
          baseColor = mat.albedoColor || baseColor;
          if (mat.albedoTexture) stdMat.diffuseTexture = mat.albedoTexture;
        } else {
          baseColor = mat.baseColor || baseColor;
          if (mat.baseTexture) stdMat.diffuseTexture = mat.baseTexture;
        }

        // Apply variation tint based on mesh category
        if (variation) {
          if (isSkin) baseColor = variation.skinTone;
          else if (isShirt) baseColor = variation.shirtColor;
          else if (isPants) baseColor = variation.pantsColor;
          else if (isHair) {
            // Random hair darkness
            const darkness = 0.1 + seededRandom(npcVariationCounter * 31) * 0.5;
            baseColor = new BABYLON.Color3(darkness * 0.9, darkness * 0.7, darkness * 0.5);
          }
        }

        // Brighten diffuse by 30% (clamped to 1)
        stdMat.diffuseColor = new BABYLON.Color3(
          Math.min(baseColor.r * 1.3, 1),
          Math.min(baseColor.g * 1.3, 1),
          Math.min(baseColor.b * 1.3, 1)
        );
        // Add subtle emissive fill so NPCs are visible even in dark scenarios
        stdMat.emissiveColor = new BABYLON.Color3(
          baseColor.r * 0.15,
          baseColor.g * 0.15,
          baseColor.b * 0.15
        );
        stdMat.specularColor = new BABYLON.Color3(0.25, 0.25, 0.25);
        stdMat.specularPower = 16;
        stdMat.backFaceCulling = true;
        mesh.material = stdMat;
      }
      // Also brighten existing StandardMaterials on NPCs
      if (mesh.material instanceof BABYLON.StandardMaterial) {
        const stdMat = mesh.material as BABYLON.StandardMaterial;

        // Apply variation to existing StandardMaterials too
        if (variation) {
          if (isSkin) stdMat.diffuseColor = variation.skinTone;
          else if (isShirt) stdMat.diffuseColor = variation.shirtColor;
          else if (isPants) stdMat.diffuseColor = variation.pantsColor;
        }

        if (stdMat.emissiveColor.equals(BABYLON.Color3.Black())) {
          stdMat.emissiveColor = new BABYLON.Color3(
            stdMat.diffuseColor.r * 0.12,
            stdMat.diffuseColor.g * 0.12,
            stdMat.diffuseColor.b * 0.12
          );
        }
      }
    });
  };

  // Helper: crea materiale PBR realistico (still used for role labels)
  const makePBRMat = (matName: string, albedo: BABYLON.Color3, roughness = 0.75, metallic = 0.0, emissive?: BABYLON.Color3) => {
    const mat = new BABYLON.PBRMetallicRoughnessMaterial(matName, scene);
    mat.baseColor = albedo;
    mat.roughness = roughness;
    mat.metallic = metallic;
    if (emissive) mat.emissiveColor = emissive;
    return mat;
  };


  // === STATIONARY NPC IDLE BEHAVIOR TYPES ===
  type IdleBehavior = 'idle' | 'lookAround' | 'gesture' | 'phone' | 'writing' | 'stretching';
  const IDLE_BEHAVIORS: IdleBehavior[] = ['idle', 'lookAround', 'gesture', 'phone', 'writing', 'stretching'];

  // Apply procedural idle animation on top of the base idle clip
  const applyIdleBehavior = (root: BABYLON.Mesh | BABYLON.TransformNode, behavior: IdleBehavior, npcSeed: number) => {
    const fps = 30;
    const phaseOffset = seededRandom(npcSeed * 47) * Math.PI * 2;

    switch (behavior) {
      case 'lookAround': {
        // Slowly turn head/body left and right
        const rotAnim = new BABYLON.Animation(`lookAround_${root.name}`, 'rotation.y', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const baseY = root.rotation.y;
        const amplitude = 0.35 + seededRandom(npcSeed * 59) * 0.25;
        const period = 120 + Math.floor(seededRandom(npcSeed * 61) * 80);
        rotAnim.setKeys([
          { frame: 0, value: baseY - amplitude },
          { frame: period * 0.25, value: baseY },
          { frame: period * 0.5, value: baseY + amplitude },
          { frame: period * 0.75, value: baseY },
          { frame: period, value: baseY - amplitude },
        ]);
        rotAnim.setEasingFunction(new BABYLON.SineEase());
        scene.beginDirectAnimation(root, [rotAnim], 0, period, true);
        break;
      }
      case 'gesture': {
        // Subtle body sway + vertical bob (gesticulating effect)
        const swayAnim = new BABYLON.Animation(`gesture_sway_${root.name}`, 'rotation.y', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const baseRot = root.rotation.y;
        const period = 80 + Math.floor(seededRandom(npcSeed * 67) * 60);
        swayAnim.setKeys([
          { frame: 0, value: baseRot - 0.15 },
          { frame: period * 0.2, value: baseRot + 0.2 },
          { frame: period * 0.4, value: baseRot - 0.1 },
          { frame: period * 0.6, value: baseRot + 0.25 },
          { frame: period * 0.8, value: baseRot - 0.05 },
          { frame: period, value: baseRot - 0.15 },
        ]);
        const bobAnim = new BABYLON.Animation(`gesture_bob_${root.name}`, 'position.y', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const baseP = root.position.y;
        bobAnim.setKeys([
          { frame: 0, value: baseP },
          { frame: period * 0.15, value: baseP + 0.04 },
          { frame: period * 0.35, value: baseP - 0.02 },
          { frame: period * 0.55, value: baseP + 0.05 },
          { frame: period * 0.75, value: baseP - 0.01 },
          { frame: period, value: baseP },
        ]);
        scene.beginDirectAnimation(root, [swayAnim, bobAnim], 0, period, true);
        break;
      }
      case 'phone': {
        // Lean forward slightly (looking down at phone) with subtle micro-movements
        const leanAnim = new BABYLON.Animation(`phone_lean_${root.name}`, 'rotation.x', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const period = 150 + Math.floor(seededRandom(npcSeed * 73) * 50);
        leanAnim.setKeys([
          { frame: 0, value: 0.08 },
          { frame: period * 0.3, value: 0.12 },
          { frame: period * 0.5, value: 0.06 },
          { frame: period * 0.7, value: 0.10 },
          { frame: period, value: 0.08 },
        ]);
        const microSway = new BABYLON.Animation(`phone_sway_${root.name}`, 'rotation.y', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const baseY2 = root.rotation.y;
        microSway.setKeys([
          { frame: 0, value: baseY2 },
          { frame: period * 0.5, value: baseY2 + 0.05 },
          { frame: period, value: baseY2 },
        ]);
        scene.beginDirectAnimation(root, [leanAnim, microSway], 0, period, true);
        break;
      }
      case 'writing': {
        // Subtle forward lean + periodic small body shifts (typing/writing)
        const writeAnim = new BABYLON.Animation(`write_lean_${root.name}`, 'rotation.x', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const period = 90 + Math.floor(seededRandom(npcSeed * 79) * 40);
        writeAnim.setKeys([
          { frame: 0, value: 0.05 },
          { frame: period * 0.4, value: 0.09 },
          { frame: period * 0.6, value: 0.04 },
          { frame: period, value: 0.05 },
        ]);
        const shiftAnim = new BABYLON.Animation(`write_shift_${root.name}`, 'position.x', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const baseX = root.position.x;
        shiftAnim.setKeys([
          { frame: 0, value: baseX },
          { frame: period * 0.25, value: baseX + 0.03 },
          { frame: period * 0.5, value: baseX - 0.02 },
          { frame: period * 0.75, value: baseX + 0.01 },
          { frame: period, value: baseX },
        ]);
        scene.beginDirectAnimation(root, [writeAnim, shiftAnim], 0, period, true);
        break;
      }
      case 'stretching': {
        // Periodic vertical stretch + slight backward lean
        const stretchAnim = new BABYLON.Animation(`stretch_y_${root.name}`, 'scaling.y', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const baseScale = root.scaling.y;
        const period = 200 + Math.floor(seededRandom(npcSeed * 83) * 80);
        stretchAnim.setKeys([
          { frame: 0, value: baseScale },
          { frame: period * 0.1, value: baseScale },
          { frame: period * 0.2, value: baseScale * 1.03 },
          { frame: period * 0.3, value: baseScale * 1.04 },
          { frame: period * 0.4, value: baseScale * 1.02 },
          { frame: period * 0.5, value: baseScale },
          { frame: period, value: baseScale },
        ]);
        const leanBack = new BABYLON.Animation(`stretch_lean_${root.name}`, 'rotation.x', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        leanBack.setKeys([
          { frame: 0, value: 0 },
          { frame: period * 0.15, value: 0 },
          { frame: period * 0.25, value: -0.08 },
          { frame: period * 0.35, value: -0.06 },
          { frame: period * 0.45, value: 0 },
          { frame: period, value: 0 },
        ]);
        scene.beginDirectAnimation(root, [stretchAnim, leanBack], 0, period, true);
        break;
      }
      case 'idle':
      default: {
        // Subtle breathing bob
        const breathAnim = new BABYLON.Animation(`breath_${root.name}`, 'position.y', fps,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const baseP2 = root.position.y;
        const period = 100 + Math.floor(seededRandom(npcSeed * 89) * 40);
        breathAnim.setKeys([
          { frame: 0, value: baseP2 },
          { frame: period * 0.5, value: baseP2 + 0.015 },
          { frame: period, value: baseP2 },
        ]);
        breathAnim.setEasingFunction(new BABYLON.SineEase());
        scene.beginDirectAnimation(root, [breathAnim], 0, period, true);
        break;
      }
    }
  };

  const createWorker = (
    name: string,
    position: BABYLON.Vector3,
    helmetColor: BABYLON.Color3,
    uniformColor: BABYLON.Color3,
    hasHelmet: boolean,
    rotation: number = 0,
    safetyRole?: string
  ) => {
    const currentNpcIndex = npcVariationCounter;
    const variation = getNPCVariation(npcVariationCounter++);
    // Assign a behavior based on NPC index for variety
    const behavior = IDLE_BEHAVIORS[currentNpcIndex % IDLE_BEHAVIORS.length];
    const modelFile = NPC_MODELS[currentNpcIndex % NPC_MODELS.length];
    console.log(`[NPC] Creating stationary worker ${name} model=${modelFile} behavior=${behavior} at`, position.toString());
    // Load GLB avatar asynchronously
    BABYLON.SceneLoader.ImportMeshAsync('', '/models/avatars/', modelFile, scene).then((result) => {
      console.log(`[NPC] ✓ GLB loaded for ${name}: ${result.meshes.length} meshes, ${result.animationGroups?.length || 0} animations`);
      const root = result.meshes[0] as BABYLON.Mesh;
      root.name = `${name}_root`;
      root.position = position.clone();
      root.rotation.y = rotation;
      root.scaling.setAll(variation.scale);

      // Play base idle animation if available
      if (result.animationGroups && result.animationGroups.length > 0) {
        const idleAnim = result.animationGroups.find(ag => 
          ag.name.toLowerCase().includes('idle') || ag.name.toLowerCase().includes('stand')
        ) || result.animationGroups[0];
        result.animationGroups.forEach(ag => ag.stop());
        idleAnim.start(true);
      }

      // Layer procedural idle behavior on top
      applyIdleBehavior(root, behavior, currentNpcIndex);

      // Simplify PBR materials with unique color variation
      simplifyMaterials(result.meshes, variation);

      // Setup shadows and pickable for safety roles
      result.meshes.forEach(mesh => {
        if (mesh instanceof BABYLON.Mesh || mesh instanceof BABYLON.AbstractMesh) {
          if (shadowGenerator) shadowGenerator.addShadowCaster(mesh);
          mesh.receiveShadows = true;
          if (safetyRole) {
            mesh.metadata = { safetyRole };
            mesh.isPickable = true;
          }
        }
      });
      toast.success(`NPC ${name} caricato`);
    }).catch(err => {
      console.error(`[NPC] ✗ Failed to load GLB avatar for ${name}:`, err);
      toast.error(`Errore caricamento NPC ${name}: ${err.message || err}`);
    });
  };

  // Helper to create role label billboard above a worker
  const createRoleLabel = (pos: BABYLON.Vector3, role: string, index: number, prefix: string) => {
    const labelTexSize = 256;
    const dt = new BABYLON.DynamicTexture(`roleLabel_${prefix}_${index}`, { width: labelTexSize, height: labelTexSize / 3 }, scene, false);
    const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, labelTexSize, labelTexSize / 3);
    ctx.fillStyle = 'rgba(30, 50, 80, 0.85)';
    ctx.fillRect(4, 4, labelTexSize - 8, labelTexSize / 3 - 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(role, labelTexSize / 2, (labelTexSize / 3) * 0.38);
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(200, 220, 255, 0.9)';
    ctx.fillText('👆 Clicca per info', labelTexSize / 2, (labelTexSize / 3) * 0.75);
    dt.update();

    const labelPlane = BABYLON.MeshBuilder.CreatePlane(`rolePlane_${prefix}_${index}`, { width: 1.2, height: 0.4 }, scene);
    labelPlane.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 2.2, 0));
    labelPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    labelPlane.metadata = { safetyRole: role };
    labelPlane.isPickable = true;
    const labelMat = new BABYLON.StandardMaterial(`rolePlaneMat_${prefix}_${index}`, scene);
    labelMat.diffuseTexture = dt;
    labelMat.emissiveTexture = dt;
    labelMat.opacityTexture = dt;
    labelMat.disableLighting = true;
    labelMat.backFaceCulling = false;
    labelPlane.material = labelMat;
  };

  // Safety roles shared across all scenarios
  const SAFETY_ROLES = ['RSPP', 'RLS', 'Medico', 'Preposto', 'Dirigente', 'Addetto PS'];

  // === SHARED WALKING WORKER SYSTEM (GLB-based) ===
  interface WalkingNPCParts {
    root: BABYLON.TransformNode;
    animGroups: BABYLON.AnimationGroup[];
  }
  interface WalkingWorkerData {
    parts: WalkingNPCParts;
    waypoints: BABYLON.Vector3[];
    currentWP: number;
    speed: number;
    baseY: number;
    scenarioType: string;
    lastVoiceTime: number;
    voiceCooldown: number;
    phase: number;
  }

  const walkingWorkers: WalkingWorkerData[] = [];

  // NPC voice lines per scenario type
  const NPC_VOICE_LINES: Record<string, string[]> = {
    warehouse: [
      "Ehi, attenzione ai muletti in transito!",
      "Buongiorno! Ricordati il caschetto nella zona scaffali.",
      "Le strisce gialle non si attraversano!",
      "Controlla sempre il carico prima di sollevarlo.",
      "Oggi abbiamo un audit sicurezza, occhi aperti!",
      "Segnala subito qualsiasi fuoriuscita di liquidi.",
      "Ciao collega! Tutto bene nella tua zona?",
      "Non ostruire mai le uscite di emergenza.",
    ],
    construction: [
      "Casco sempre in testa, anche per due minuti!",
      "Ehi! Attenzione alla gru che sta ruotando!",
      "Occhio dove metti i piedi, ci sono ferri ovunque.",
      "L'escavatore è in manovra, stai alla larga!",
      "Buongiorno capo! Ponteggi controllati stamattina.",
      "La betoniera sta scaricando, zona off-limits!",
      "Hai controllato l'imbracatura oggi?",
      "Segnala subito le tavole rotte sui ponteggi!",
    ],
    laboratory: [
      "Conosci la posizione degli estintori più vicini?",
      "In caso d'incendio, mantieni la calma e segui il piano.",
      "Attenzione! Mai usare acqua su fuoco elettrico!",
      "L'estintore a CO₂ è per apparecchiature elettriche.",
      "Ricorda: tira, punta, premi, muovi. TPPM!",
      "Le vie di fuga devono essere sempre libere!",
      "Hai partecipato all'ultima esercitazione antincendio?",
      "Controlla sempre la data di scadenza degli estintori.",
    ],
    office: [
      "Buongiorno! Hai fatto la pausa dal monitor?",
      "Attenzione ai cavi sotto la scrivania.",
      "Ricordati di regolare la sedia per la postura.",
      "Le scale si scendono sempre tenendo il corrimano.",
      "Sai dove sono le uscite di emergenza?",
      "Non sovraccaricare le ciabatte elettriche!",
      "Ciao! La cassetta di primo soccorso è al piano.",
      "Ricorda di fare stretching ogni ora!",
    ],
  };

  // Speech bubble tracking
  const speechBubbles = new Map<string, { plane: BABYLON.Mesh; mat: BABYLON.StandardMaterial; timer: number }>();

  const showSpeechBubble = (worker: WalkingWorkerData, text: string) => {
    const bubbleId = worker.parts.root.name;

    // Remove existing bubble
    const existing = speechBubbles.get(bubbleId);
    if (existing) { existing.plane.dispose(); speechBubbles.delete(bubbleId); }

    const texSize = 512;
    const texHeight = 128;
    const dt = new BABYLON.DynamicTexture(`speech_${bubbleId}`, { width: texSize, height: texHeight }, scene, false);
    const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;

    // Bubble background
    ctx.clearRect(0, 0, texSize, texHeight);
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(r, 4); ctx.lineTo(texSize - r, 4);
    ctx.quadraticCurveTo(texSize - 4, 4, texSize - 4, r + 4);
    ctx.lineTo(texSize - 4, texHeight - r - 4);
    ctx.quadraticCurveTo(texSize - 4, texHeight - 4, texSize - r, texHeight - 4);
    ctx.lineTo(texSize * 0.45, texHeight - 4);
    ctx.lineTo(texSize * 0.4, texHeight + 10);
    ctx.lineTo(texSize * 0.35, texHeight - 4);
    ctx.lineTo(r, texHeight - 4);
    ctx.quadraticCurveTo(4, texHeight - 4, 4, texHeight - r - 4);
    ctx.lineTo(4, r + 4); ctx.quadraticCurveTo(4, 4, r, 4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.stroke();

    // Text with word wrap
    ctx.fillStyle = '#1a1a2e'; ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const words = text.split(' ');
    const lines: string[] = []; let curLine = '';
    words.forEach(w => {
      const test = curLine ? curLine + ' ' + w : w;
      if (ctx.measureText(test).width > texSize - 40) { lines.push(curLine); curLine = w; }
      else curLine = test;
    });
    if (curLine) lines.push(curLine);
    const lh = 26; const sy = (texHeight / 2) - ((lines.length - 1) * lh / 2);
    lines.forEach((ln, i) => ctx.fillText(ln, texSize / 2, sy + i * lh));
    dt.update();

    const plane = BABYLON.MeshBuilder.CreatePlane(`speechPlane_${bubbleId}`, { width: 2.5, height: 0.65 }, scene);
    const headWorldPos = worker.parts.root.position.clone().addInPlace(new BABYLON.Vector3(0, 1.66, 0));
    plane.position = headWorldPos.addInPlace(new BABYLON.Vector3(0, 0.8, 0));
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    plane.isPickable = false; plane.renderingGroupId = 3;

    const mat = new BABYLON.StandardMaterial(`speechMat_${bubbleId}`, scene);
    mat.diffuseTexture = dt; mat.emissiveTexture = dt; mat.opacityTexture = dt;
    mat.useAlphaFromDiffuseTexture = true; mat.disableLighting = true;
    mat.backFaceCulling = false; mat.alpha = 1;
    plane.material = mat;

    speechBubbles.set(bubbleId, { plane, mat, timer: 4.0 });

    // Also speak via Web Speech API (soft, casual)
    try {
      const synth = window.speechSynthesis;
      if (!synth.speaking) {
        const voices = synth.getVoices();
        const italianVoice = voices.find(v => v.lang.startsWith('it')) || voices[0];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = italianVoice || null;
        utterance.rate = 1.0; utterance.pitch = 1.0; utterance.volume = 0.55;
        synth.speak(utterance);
      }
    } catch (_e) {}
  };

  const createWalkingWorker = (
    id: string,
    waypoints: BABYLON.Vector3[],
    _headCoverColor: BABYLON.Color3,
    _uniformColor: BABYLON.Color3,
    _vestColor: BABYLON.Color3 | null,
    _pantsColor: BABYLON.Color3,
    speed: number,
    _hasHelmet: boolean,
    _addReflectiveStripes: boolean
  ) => {
    const variation = getNPCVariation(npcVariationCounter++);
    const startPos = waypoints[0].clone();
    const baseY = startPos.y;

    // Create a placeholder root that will be used for walking logic immediately
    const root = new BABYLON.TransformNode(`walk_${id}_root`, scene);
    root.position = startPos.clone();

    const workerData: WalkingWorkerData = {
      parts: { root, animGroups: [] },
      waypoints, currentWP: 0, speed, baseY,
      scenarioType: type,
      lastVoiceTime: 0,
      voiceCooldown: 15 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
    };
    walkingWorkers.push(workerData);

    // Load GLB avatar asynchronously — pick model from pool
    const walkModelFile = NPC_MODELS[(npcVariationCounter - 1) % NPC_MODELS.length];
    console.log(`[NPC] Walking worker ${id} model=${walkModelFile}`);
    BABYLON.SceneLoader.ImportMeshAsync('', '/models/avatars/', walkModelFile, scene).then((result) => {
      const meshRoot = result.meshes[0];
      meshRoot.parent = root;
      meshRoot.position = BABYLON.Vector3.Zero();
      meshRoot.scaling.setAll(variation.scale);

      // Simplify PBR materials with unique color variation
      simplifyMaterials(result.meshes, variation);

      // Setup shadows
      result.meshes.forEach(mesh => {
        if (shadowGenerator) shadowGenerator.addShadowCaster(mesh);
        mesh.receiveShadows = true;
        mesh.checkCollisions = false;
        mesh.isPickable = false;
      });

      // Store animation groups and start walk animation
      workerData.parts.animGroups = result.animationGroups || [];
      if (result.animationGroups && result.animationGroups.length > 0) {
        const walkAnim = result.animationGroups.find(ag =>
          ag.name.toLowerCase().includes('walk') || ag.name.toLowerCase().includes('run')
        ) || result.animationGroups[0];
        result.animationGroups.forEach(ag => ag.stop());

        // Strip ALL root motion: zero position animations on root mesh AND
        // any top-level transform nodes so our waypoint system controls movement
        walkAnim.targetedAnimations.forEach(ta => {
          const anim = ta.animation;
          const prop = anim.targetProperty?.toLowerCase() || '';
          const targetName = (ta.target?.name || '').toLowerCase();
          const isRootTarget = ta.target === meshRoot || ta.target === result.meshes[0]
            || targetName.includes('armature') || targetName.includes('root')
            || targetName === '' || targetName.includes('hips');
          if (isRootTarget && prop.includes('position')) {
            const keys = anim.getKeys();
            const zeroVal = keys[0]?.value;
            if (zeroVal) {
              keys.forEach(k => { k.value = zeroVal; });
              anim.setKeys(keys);
            }
            console.log(`[NPC] Stripped root motion on ${id}: target=${targetName}, prop=${prop}`);
          }
        });

        walkAnim.start(true);
        // Adjust speed ratio to match movement speed
        walkAnim.speedRatio = speed * 60;

        // Force-lock meshRoot position to zero every frame
        // This prevents any residual animation from overriding waypoint movement
        scene.registerBeforeRender(() => {
          if (meshRoot && !meshRoot.isDisposed()) {
            meshRoot.position.setAll(0);
          }
        });
      }

      toast.success(`Walking NPC '${id}' caricato`);
    }).catch(err => {
      console.error(`[NPC] ✗ Failed to load GLB for walking worker ${id}:`, err);
      toast.error(`Errore NPC walking ${id}: ${err.message || err}`);
    });
  };

  // ====== SCENARIO-SPECIFIC STATIONARY + WALKING NPCs ======

  if (type === 'warehouse') {
    const warehouseNPCs = [
      { pos: new BABYLON.Vector3(-15, 0, -8), helmet: new BABYLON.Color3(1, 0.6, 0), uniform: new BABYLON.Color3(1, 0.8, 0), role: 'RSPP' },
      { pos: new BABYLON.Vector3(-8, 0, 12), helmet: new BABYLON.Color3(1, 0.6, 0), uniform: new BABYLON.Color3(1, 0.8, 0), role: 'RLS' },
      { pos: new BABYLON.Vector3(10, 0, -15), helmet: new BABYLON.Color3(0.9, 0.9, 0.9), uniform: new BABYLON.Color3(0.9, 0.95, 0.9), role: 'Medico' },
      { pos: new BABYLON.Vector3(15, 0, 8), helmet: new BABYLON.Color3(1, 0.5, 0), uniform: new BABYLON.Color3(1, 0.6, 0), role: 'Preposto' },
      { pos: new BABYLON.Vector3(-5, 0, 5), helmet: new BABYLON.Color3(0.3, 0.3, 0.4), uniform: new BABYLON.Color3(0.4, 0.4, 0.5), role: 'Dirigente' },
      { pos: new BABYLON.Vector3(8, 0, -5), helmet: new BABYLON.Color3(1, 0.6, 0), uniform: new BABYLON.Color3(1, 0.8, 0), role: 'Addetto PS' },
      { pos: new BABYLON.Vector3(-12, 0, 15), helmet: new BABYLON.Color3(1, 0.6, 0), uniform: new BABYLON.Color3(1, 0.8, 0) },
      { pos: new BABYLON.Vector3(18, 0, -12), helmet: new BABYLON.Color3(1, 0.6, 0), uniform: new BABYLON.Color3(1, 0.8, 0) },
    ];

    warehouseNPCs.forEach((cfg, i) => {
      createWorker(
        `warehouse_worker_${i}`,
        cfg.pos,
        cfg.helmet,
        cfg.uniform,
        true,
        Math.random() * Math.PI * 2,
        cfg.role
      );
      if (cfg.role) createRoleLabel(cfg.pos, cfg.role, i, 'warehouse');
    });

    // Walking warehouse workers — hi-vis vests, helmets, moving between scaffali
    const hiVisOrange = new BABYLON.Color3(1, 0.55, 0.05);
    const hiVisYellow = new BABYLON.Color3(0.9, 0.85, 0.1);
    const darkPants = new BABYLON.Color3(0.2, 0.2, 0.3);

    createWalkingWorker('wh1', [
      new BABYLON.Vector3(-18, 0, -12), new BABYLON.Vector3(-18, 0, 8),
      new BABYLON.Vector3(-12, 0, 8), new BABYLON.Vector3(-12, 0, -12),
    ], new BABYLON.Color3(1, 0.85, 0), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisOrange, darkPants, 0.017, true, true);

    createWalkingWorker('wh2', [
      new BABYLON.Vector3(5, 0, -18), new BABYLON.Vector3(18, 0, -18),
      new BABYLON.Vector3(18, 0, -8), new BABYLON.Vector3(5, 0, -8),
    ], new BABYLON.Color3(0.95, 0.95, 0.95), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisYellow, darkPants, 0.02, true, true);

    createWalkingWorker('wh3', [
      new BABYLON.Vector3(-5, 0, 10), new BABYLON.Vector3(10, 0, 10),
      new BABYLON.Vector3(10, 0, 18), new BABYLON.Vector3(-5, 0, 18),
    ], new BABYLON.Color3(1, 0.5, 0), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisOrange, darkPants, 0.015, true, true);

    createWalkingWorker('wh4', [
      new BABYLON.Vector3(12, 0, -5), new BABYLON.Vector3(12, 0, 12),
      new BABYLON.Vector3(6, 0, 12), new BABYLON.Vector3(6, 0, -5),
    ], new BABYLON.Color3(1, 0.85, 0), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisYellow, darkPants, 0.018, true, true);

  } else if (type === 'construction' || type === 'factory') {
    // Safety role NPCs (stationary, clickable)
    const constructionNPCs = [
      { pos: new BABYLON.Vector3(-10, 0, -10), helmet: new BABYLON.Color3(1, 0.5, 0), uniform: new BABYLON.Color3(1, 0.6, 0), role: 'RSPP' },
      { pos: new BABYLON.Vector3(8, 0, -8), helmet: new BABYLON.Color3(1, 0.5, 0), uniform: new BABYLON.Color3(1, 0.6, 0), role: 'RLS' },
      { pos: new BABYLON.Vector3(-5, 0, 10), helmet: new BABYLON.Color3(0.9, 0.9, 0.9), uniform: new BABYLON.Color3(0.9, 0.95, 0.9), role: 'Medico' },
      { pos: new BABYLON.Vector3(12, 0, 5), helmet: new BABYLON.Color3(1, 0.5, 0), uniform: new BABYLON.Color3(1, 0.6, 0), role: 'Preposto' },
      { pos: new BABYLON.Vector3(-15, 0, 8), helmet: new BABYLON.Color3(0.3, 0.3, 0.4), uniform: new BABYLON.Color3(0.4, 0.4, 0.5), role: 'Dirigente' },
      { pos: new BABYLON.Vector3(5, 0, -12), helmet: new BABYLON.Color3(1, 0.5, 0), uniform: new BABYLON.Color3(1, 0.6, 0), role: 'Addetto PS' },
    ];

    constructionNPCs.forEach((cfg, i) => {
      createWorker(
        `construction_worker_${i}`,
        cfg.pos,
        cfg.helmet,
        cfg.uniform,
        true,
        Math.random() * Math.PI * 2,
        cfg.role
      );
      if (cfg.role) createRoleLabel(cfg.pos, cfg.role, i, 'construction');
    });

    // Walking construction workers — hi-vis vests, helmets
    const hiVisYellow = new BABYLON.Color3(0.9, 0.85, 0.1);
    const hiVisOrange = new BABYLON.Color3(1, 0.55, 0.05);
    const darkPants = new BABYLON.Color3(0.2, 0.2, 0.3);

    createWalkingWorker('cw1', [
      new BABYLON.Vector3(-18, 0, -5), new BABYLON.Vector3(-18, 0, 10),
      new BABYLON.Vector3(-10, 0, 10), new BABYLON.Vector3(-10, 0, -5),
    ], new BABYLON.Color3(1, 0.85, 0), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisYellow, darkPants, 0.018, true, true);

    createWalkingWorker('cw2', [
      new BABYLON.Vector3(5, 0, -15), new BABYLON.Vector3(15, 0, -15),
      new BABYLON.Vector3(15, 0, -5), new BABYLON.Vector3(5, 0, -5),
    ], new BABYLON.Color3(0.95, 0.95, 0.95), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisOrange, darkPants, 0.022, true, true);

    createWalkingWorker('cw3', [
      new BABYLON.Vector3(-5, 0, 15), new BABYLON.Vector3(10, 0, 15),
      new BABYLON.Vector3(10, 0, 8), new BABYLON.Vector3(-5, 0, 8),
    ], new BABYLON.Color3(0.15, 0.3, 0.7), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisYellow, darkPants, 0.015, true, true);

    createWalkingWorker('cw4', [
      new BABYLON.Vector3(18, 0, 0), new BABYLON.Vector3(18, 0, 12),
      new BABYLON.Vector3(8, 0, 12), new BABYLON.Vector3(8, 0, 0),
    ], new BABYLON.Color3(1, 0.85, 0), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisOrange, darkPants, 0.02, true, true);

    createWalkingWorker('cw5', [
      new BABYLON.Vector3(-20, 0, -15), new BABYLON.Vector3(-8, 0, -15),
      new BABYLON.Vector3(-8, 0, -8), new BABYLON.Vector3(-20, 0, -8),
    ], new BABYLON.Color3(0.95, 0.95, 0.95), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisYellow, darkPants, 0.016, true, true);

    createWalkingWorker('cw6', [
      new BABYLON.Vector3(0, 0, -5), new BABYLON.Vector3(0, 0, 5),
      new BABYLON.Vector3(-5, 0, 5), new BABYLON.Vector3(-5, 0, -5),
    ], new BABYLON.Color3(1, 0.85, 0), new BABYLON.Color3(0.25, 0.25, 0.35), hiVisOrange, darkPants, 0.019, true, true);

  } else if (type === 'laboratory') {
    // Stationary safety role NPCs
    const fireNPCs = [
      { pos: new BABYLON.Vector3(-8, 0, -5), helmet: new BABYLON.Color3(1, 0.2, 0.1), uniform: new BABYLON.Color3(0.8, 0.2, 0.1), role: 'RSPP' },
      { pos: new BABYLON.Vector3(6, 0, -5), helmet: new BABYLON.Color3(1, 0.2, 0.1), uniform: new BABYLON.Color3(0.8, 0.2, 0.1), role: 'RLS' },
      { pos: new BABYLON.Vector3(-8, 0, 5), helmet: new BABYLON.Color3(0.9, 0.9, 0.9), uniform: new BABYLON.Color3(0.9, 0.95, 0.9), role: 'Medico' },
      { pos: new BABYLON.Vector3(6, 0, 5), helmet: new BABYLON.Color3(1, 0.6, 0), uniform: new BABYLON.Color3(1, 0.8, 0), role: 'Preposto' },
      { pos: new BABYLON.Vector3(-1, 0, -10), helmet: new BABYLON.Color3(0.9, 0.9, 0), uniform: new BABYLON.Color3(0.7, 0.7, 0.2), role: 'Dirigente' },
      { pos: new BABYLON.Vector3(3, 0, 8), helmet: new BABYLON.Color3(1, 0.6, 0), uniform: new BABYLON.Color3(1, 0.8, 0), role: 'Addetto PS' },
    ];

    fireNPCs.forEach((cfg, i) => {
      createWorker(
        `fire_worker_${i}`,
        cfg.pos,
        cfg.helmet,
        cfg.uniform,
        true,
        Math.random() * Math.PI * 2,
        cfg.role
      );
      if (cfg.role) createRoleLabel(cfg.pos, cfg.role, i, 'fire');
    });

    // Walking firefighters / antincendio personnel — red/orange hi-vis, helmets
    const fireRed = new BABYLON.Color3(0.85, 0.15, 0.1);
    const fireOrange = new BABYLON.Color3(1, 0.45, 0.05);
    const firePants = new BABYLON.Color3(0.2, 0.15, 0.12);

    createWalkingWorker('fire1', [
      new BABYLON.Vector3(-6, 0, -8), new BABYLON.Vector3(-6, 0, 0),
      new BABYLON.Vector3(-2, 0, 0), new BABYLON.Vector3(-2, 0, -8),
    ], new BABYLON.Color3(1, 0.2, 0.1), new BABYLON.Color3(0.2, 0.15, 0.15), fireRed, firePants, 0.014, true, true);

    createWalkingWorker('fire2', [
      new BABYLON.Vector3(2, 0, -6), new BABYLON.Vector3(8, 0, -6),
      new BABYLON.Vector3(8, 0, 2), new BABYLON.Vector3(2, 0, 2),
    ], new BABYLON.Color3(0.95, 0.95, 0.95), new BABYLON.Color3(0.2, 0.15, 0.15), fireOrange, firePants, 0.016, true, true);

    createWalkingWorker('fire3', [
      new BABYLON.Vector3(-4, 0, 4), new BABYLON.Vector3(4, 0, 4),
      new BABYLON.Vector3(4, 0, 10), new BABYLON.Vector3(-4, 0, 10),
    ], new BABYLON.Color3(1, 0.2, 0.1), new BABYLON.Color3(0.2, 0.15, 0.15), fireRed, firePants, 0.012, true, true);

    createWalkingWorker('fire4', [
      new BABYLON.Vector3(-10, 0, -2), new BABYLON.Vector3(-10, 0, 8),
      new BABYLON.Vector3(-6, 0, 8), new BABYLON.Vector3(-6, 0, -2),
    ], new BABYLON.Color3(1, 0.6, 0), new BABYLON.Color3(0.2, 0.15, 0.15), fireOrange, firePants, 0.013, true, true);

  } else if (type === 'office') {
    // Stationary safety role NPCs
    const officeRoles = [
      { pos: new BABYLON.Vector3(-10, 0, -4), shirt: new BABYLON.Color3(0.2, 0.3, 0.6), role: 'RSPP' },
      { pos: new BABYLON.Vector3(-2, 0, -4), shirt: new BABYLON.Color3(0.9, 0.9, 0.95), role: 'RLS' },
      { pos: new BABYLON.Vector3(6, 0, -4), shirt: new BABYLON.Color3(0.15, 0.45, 0.3), role: 'Medico' },
      { pos: new BABYLON.Vector3(-10, 0, 2), shirt: new BABYLON.Color3(0.7, 0.55, 0.4), role: 'Preposto' },
      { pos: new BABYLON.Vector3(-2, 0, 2), shirt: new BABYLON.Color3(0.4, 0.4, 0.5), role: 'Dirigente' },
      { pos: new BABYLON.Vector3(0, 0, 10), shirt: new BABYLON.Color3(0.3, 0.3, 0.55), role: 'Addetto PS' },
    ];

    officeRoles.forEach((cfg, i) => {
      createWorker(
        `office_worker_${i}`,
        cfg.pos,
        new BABYLON.Color3(0, 0, 0),
        cfg.shirt,
        false,
        Math.random() * Math.PI * 2,
        cfg.role
      );
      createRoleLabel(cfg.pos, cfg.role, i, 'office');
    });

    // Walking office employees — shirts, no helmets, formal pants
    const formalPants = new BABYLON.Color3(0.25, 0.25, 0.3);

    createWalkingWorker('of1', [
      new BABYLON.Vector3(-8, 0, -8), new BABYLON.Vector3(-8, 0, 0),
      new BABYLON.Vector3(-3, 0, 0), new BABYLON.Vector3(-3, 0, -8),
    ], new BABYLON.Color3(0.35, 0.25, 0.15), new BABYLON.Color3(0.3, 0.45, 0.7), null, formalPants, 0.013, false, false);

    createWalkingWorker('of2', [
      new BABYLON.Vector3(2, 0, -6), new BABYLON.Vector3(10, 0, -6),
      new BABYLON.Vector3(10, 0, 0), new BABYLON.Vector3(2, 0, 0),
    ], new BABYLON.Color3(0.5, 0.3, 0.15), new BABYLON.Color3(0.85, 0.85, 0.9), null, formalPants, 0.011, false, false);

    createWalkingWorker('of3', [
      new BABYLON.Vector3(-6, 0, 4), new BABYLON.Vector3(4, 0, 4),
      new BABYLON.Vector3(4, 0, 10), new BABYLON.Vector3(-6, 0, 10),
    ], new BABYLON.Color3(0.15, 0.1, 0.05), new BABYLON.Color3(0.6, 0.3, 0.35), null, new BABYLON.Color3(0.15, 0.15, 0.2), 0.012, false, false);

    createWalkingWorker('of4', [
      new BABYLON.Vector3(6, 0, 2), new BABYLON.Vector3(6, 0, 8),
      new BABYLON.Vector3(12, 0, 8), new BABYLON.Vector3(12, 0, 2),
    ], new BABYLON.Color3(0.4, 0.25, 0.1), new BABYLON.Color3(0.2, 0.35, 0.5), null, formalPants, 0.014, false, false);
  }

  // === GLOBAL WALKING ANIMATION LOOP (all scenarios) ===
  if (walkingWorkers.length > 0) {
    const VOICE_PROXIMITY = 4.5;
    const cam = scene.activeCamera as BABYLON.UniversalCamera;

    scene.registerBeforeRender(() => {
      const t = performance.now() * 0.001;
      const frameDt = scene.getEngine().getDeltaTime() * 0.001;

      // Update speech bubbles (fade + follow root)
      speechBubbles.forEach((bubble, id) => {
        bubble.timer -= frameDt;
        if (bubble.timer <= 0.5) {
          bubble.mat.alpha = Math.max(0, bubble.timer / 0.5);
        }
        if (bubble.timer <= 0) {
          bubble.plane.dispose();
          speechBubbles.delete(id);
        } else {
          const wd = walkingWorkers.find(w => w.parts.root.name === id);
          if (wd) {
            const rp = wd.parts.root.position;
            bubble.plane.position.x = rp.x;
            bubble.plane.position.z = rp.z;
            bubble.plane.position.y = rp.y + 2.5; // above head
          }
        }
      });

      walkingWorkers.forEach((w) => {
        const { root } = w.parts;
        const target = w.waypoints[w.currentWP];
        const rootPos = root.position;
        const dir = target.subtract(new BABYLON.Vector3(rootPos.x, w.baseY, rootPos.z));
        const dist = dir.length();

        if (dist < 0.3) {
          w.currentWP = (w.currentWP + 1) % w.waypoints.length;
          return;
        }

        const moveDir = dir.normalize().scale(w.speed);
        const facingAngle = Math.atan2(moveDir.x, moveDir.z);

        // Move root node — all children (GLB meshes) follow automatically
        root.position.x += moveDir.x;
        root.position.z += moveDir.z;
        root.rotation.y = facingAngle;

        // === PROXIMITY VOICE INTERACTION ===
        if (cam) {
          const distToPlayer = BABYLON.Vector3.Distance(
            new BABYLON.Vector3(cam.position.x, 0, cam.position.z),
            new BABYLON.Vector3(root.position.x, 0, root.position.z)
          );

          if (distToPlayer < VOICE_PROXIMITY && t - w.lastVoiceTime > w.voiceCooldown) {
            const lines = NPC_VOICE_LINES[w.scenarioType] || NPC_VOICE_LINES['office'];
            const line = lines[Math.floor(Math.random() * lines.length)];
            showSpeechBubble(w, line);
            w.lastVoiceTime = t;
            w.voiceCooldown = 20 + Math.random() * 25;
          }
        }
      });
    });

    console.log(`[NPC] Created ${walkingWorkers.length} humanoid animated workers for ${type}`);
  }

  console.log(`[Avatars] Worker avatars added for ${type}`);
}

// Helper: Add detailed safety signage and equipment
function addSafetySignage(
  scene: BABYLON.Scene,
  type: string,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  console.log(`[Safety] Adding safety signage for ${type}`);

  // Arrays to store meshes for animation
  const warningSignMeshes: BABYLON.Mesh[] = [];
  const exitLights: BABYLON.PointLight[] = [];
  const exitSignMaterials: BABYLON.StandardMaterial[] = [];
  const firstAidBoxes: BABYLON.Mesh[] = [];

  // === 1. TRIANGULAR WARNING SIGNS (yellow with black border) ===
  const warningPositions: { pos: BABYLON.Vector3, rotation: number }[] = [];
  
  if (type === 'warehouse') {
    warningPositions.push(
      { pos: new BABYLON.Vector3(-15, 2, -18), rotation: 0 },
      { pos: new BABYLON.Vector3(15, 2, -18), rotation: 0 },
      { pos: new BABYLON.Vector3(-18, 2, 12), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 2, -8), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(-8, 2, 18), rotation: Math.PI },
      { pos: new BABYLON.Vector3(10, 2, 18), rotation: Math.PI },
    );
  } else if (type === 'construction' || type === 'factory') {
    warningPositions.push(
      { pos: new BABYLON.Vector3(-12, 2, -15), rotation: 0 },
      { pos: new BABYLON.Vector3(12, 2, -15), rotation: 0 },
      { pos: new BABYLON.Vector3(-15, 2, 8), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2, -6), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(0, 2, 15), rotation: Math.PI },
    );
  } else if (type === 'laboratory') {
    warningPositions.push(
      { pos: new BABYLON.Vector3(-15, 2, -10), rotation: 0 },
      { pos: new BABYLON.Vector3(15, 2, -10), rotation: 0 },
      { pos: new BABYLON.Vector3(-15, 2, 10), rotation: Math.PI },
      { pos: new BABYLON.Vector3(15, 2, 10), rotation: Math.PI },
    );
  } else if (type === 'office') {
    warningPositions.push(
      { pos: new BABYLON.Vector3(-12, 2, -8), rotation: 0 },
      { pos: new BABYLON.Vector3(12, 2, -8), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 2, 12), rotation: Math.PI },
    );
  }

  warningPositions.forEach((data, i) => {
    // Yellow triangular background
    const triangle = BABYLON.MeshBuilder.CreateCylinder(
      `warnSign_${i}`,
      { height: 0.02, diameter: 0.9, tessellation: 3 },
      scene
    );
    triangle.position = data.pos;
    triangle.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const warnMat = new BABYLON.StandardMaterial(`warnMat_${i}`, scene);
    warnMat.diffuseColor = new BABYLON.Color3(1, 0.85, 0); // Vivid yellow
    warnMat.emissiveColor = new BABYLON.Color3(0.3, 0.25, 0);
    warnMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    warnMat.specularPower = 32;
    triangle.material = warnMat;
    
    // Store for animation
    warningSignMeshes.push(triangle);
    
    // Black border
    const border = BABYLON.MeshBuilder.CreateCylinder(
      `warnBorder_${i}`,
      { height: 0.03, diameter: 0.95, tessellation: 3 },
      scene
    );
    border.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, -0.01));
    border.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const borderMat = new BABYLON.StandardMaterial(`borderMat_${i}`, scene);
    borderMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Black
    border.material = borderMat;
    
    // Exclamation mark symbol
    const exclamation = BABYLON.MeshBuilder.CreateBox(
      `exclamation_${i}`,
      { width: 0.08, height: 0.35, depth: 0.02 },
      scene
    );
    exclamation.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0.05, 0.02));
    exclamation.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const exclMat = new BABYLON.StandardMaterial(`exclMat_${i}`, scene);
    exclMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Black
    exclamation.material = exclMat;
    
    // Exclamation dot
    const dot = BABYLON.MeshBuilder.CreateSphere(
      `exclDot_${i}`,
      { diameter: 0.1 },
      scene
    );
    dot.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, -0.22, 0.02));
    dot.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    dot.material = exclMat;
    
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(triangle);
      shadowGenerator.addShadowCaster(border);
    }
  });

  // === 2. FIRE EXTINGUISHERS (red with wall mounts) ===
  const extinguisherPositions: { pos: BABYLON.Vector3, rotation: number }[] = [];
  
  if (type === 'warehouse') {
    extinguisherPositions.push(
      { pos: new BABYLON.Vector3(-18, 0.6, -10), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(-18, 0.6, 10), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 0.6, -10), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 0.6, 10), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(-5, 0.6, 18), rotation: Math.PI },
      { pos: new BABYLON.Vector3(5, 0.6, 18), rotation: Math.PI },
    );
  } else if (type === 'construction' || type === 'factory') {
    extinguisherPositions.push(
      { pos: new BABYLON.Vector3(-15, 0.6, -12), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, -12), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(-15, 0.6, 12), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, 12), rotation: -Math.PI / 2 },
    );
  } else if (type === 'laboratory') {
    extinguisherPositions.push(
      { pos: new BABYLON.Vector3(-15, 0.6, -8), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(-15, 0.6, 8), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, -8), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, 8), rotation: -Math.PI / 2 },
    );
  } else if (type === 'office') {
    extinguisherPositions.push(
      { pos: new BABYLON.Vector3(-15, 0.6, -6), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(-15, 0.6, 6), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, 0), rotation: -Math.PI / 2 },
    );
  }

  extinguisherPositions.forEach((data, i) => {
    // Wall mount bracket
    const bracket = BABYLON.MeshBuilder.CreateBox(
      `bracket_${i}`,
      { width: 0.35, height: 0.8, depth: 0.15 },
      scene
    );
    bracket.position = data.pos;
    bracket.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const bracketMat = new BABYLON.StandardMaterial(`bracketMat_${i}`, scene);
    bracketMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15); // Dark gray
    bracketMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    bracket.material = bracketMat;
    
    // Extinguisher cylinder
    const cylinder = BABYLON.MeshBuilder.CreateCylinder(
      `extinguisher_${i}`,
      { height: 0.7, diameter: 0.22 },
      scene
    );
    cylinder.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, 0.15));
    cylinder.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const extMat = new BABYLON.StandardMaterial(`extMat_${i}`, scene);
    extMat.diffuseColor = new BABYLON.Color3(0.85, 0.1, 0.1); // Bright red
    extMat.emissiveColor = new BABYLON.Color3(0.15, 0.02, 0.02);
    extMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    extMat.specularPower = 64;
    cylinder.material = extMat;
    
    // Top nozzle
    const nozzle = BABYLON.MeshBuilder.CreateCylinder(
      `nozzle_${i}`,
      { height: 0.15, diameter: 0.08 },
      scene
    );
    nozzle.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0.42, 0.15));
    nozzle.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const nozzleMat = new BABYLON.StandardMaterial(`nozzleMat_${i}`, scene);
    nozzleMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark gray
    nozzleMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    nozzleMat.specularPower = 64;
    nozzle.material = nozzleMat;
    
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(bracket);
      shadowGenerator.addShadowCaster(cylinder);
      shadowGenerator.addShadowCaster(nozzle);
    }
  });

  // === 3. EMERGENCY EXIT SIGNS (green illuminated) ===
  const exitPositions: { pos: BABYLON.Vector3, rotation: number }[] = [];
  
  if (type === 'warehouse') {
    exitPositions.push(
      { pos: new BABYLON.Vector3(0, 6, -19.5), rotation: 0 },
      { pos: new BABYLON.Vector3(-10, 6, 19.5), rotation: Math.PI },
      { pos: new BABYLON.Vector3(10, 6, 19.5), rotation: Math.PI },
    );
  } else if (type === 'construction' || type === 'factory') {
    exitPositions.push(
      { pos: new BABYLON.Vector3(0, 5, -14.5), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 5, 14.5), rotation: Math.PI },
    );
  } else if (type === 'laboratory') {
    exitPositions.push(
      { pos: new BABYLON.Vector3(0, 6.5, -14.5), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 6.5, 14.5), rotation: Math.PI },
    );
  } else if (type === 'office') {
    exitPositions.push(
      { pos: new BABYLON.Vector3(0, 6.5, -14.5), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 6.5, 14.5), rotation: Math.PI },
    );
  }

  exitPositions.forEach((data, i) => {
    // Green exit sign box
    const exitSign = BABYLON.MeshBuilder.CreateBox(
      `exitSign_${i}`,
      { width: 1.2, height: 0.4, depth: 0.15 },
      scene
    );
    exitSign.position = data.pos;
    exitSign.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const exitMat = new BABYLON.StandardMaterial(`exitMat_${i}`, scene);
    exitMat.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.2); // Bright green
    exitMat.emissiveColor = new BABYLON.Color3(0.05, 0.4, 0.1); // Glowing green
    exitMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    exitSign.material = exitMat;
    
    // Store material for blinking animation
    exitSignMaterials.push(exitMat);
    
    // White "USCITA" text plane
    const textPlane = BABYLON.MeshBuilder.CreatePlane(
      `exitText_${i}`,
      { width: 1.0, height: 0.3 },
      scene
    );
    textPlane.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, -0.08));
    textPlane.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const textMat = new BABYLON.StandardMaterial(`textMat_${i}`, scene);
    textMat.diffuseColor = new BABYLON.Color3(1, 1, 1); // White
    textMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    textPlane.material = textMat;
    
    // Glowing light effect
    if (quality !== 'low') {
      const exitLight = new BABYLON.PointLight(
        `exitLight_${i}`,
        data.pos,
        scene
      );
      exitLight.intensity = 0.4;
      exitLight.range = 6;
      exitLight.diffuse = new BABYLON.Color3(0.1, 0.8, 0.2);
      
      // Store for blinking animation
      exitLights.push(exitLight);
    }
    
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(exitSign);
    }
  });

  // === 4. FLOOR SAFETY STRIPES (yellow/black) ===
  const stripePositions: { pos: BABYLON.Vector3, rotation: number, width: number }[] = [];
  
  if (type === 'warehouse') {
    stripePositions.push(
      { pos: new BABYLON.Vector3(-10, 0.01, 0), rotation: 0, width: 20 },
      { pos: new BABYLON.Vector3(10, 0.01, 0), rotation: 0, width: 20 },
      { pos: new BABYLON.Vector3(0, 0.01, -10), rotation: Math.PI / 2, width: 20 },
      { pos: new BABYLON.Vector3(0, 0.01, 10), rotation: Math.PI / 2, width: 20 },
    );
  } else if (type === 'construction' || type === 'factory') {
    stripePositions.push(
      { pos: new BABYLON.Vector3(-8, 0.01, 0), rotation: 0, width: 16 },
      { pos: new BABYLON.Vector3(8, 0.01, 0), rotation: 0, width: 16 },
      { pos: new BABYLON.Vector3(0, 0.01, -8), rotation: Math.PI / 2, width: 16 },
    );
  } else if (type === 'laboratory') {
    stripePositions.push(
      { pos: new BABYLON.Vector3(0, 0.01, -5), rotation: Math.PI / 2, width: 12 },
      { pos: new BABYLON.Vector3(0, 0.01, 5), rotation: Math.PI / 2, width: 12 },
    );
  } else if (type === 'office') {
    stripePositions.push(
      { pos: new BABYLON.Vector3(0, 0.01, -2), rotation: Math.PI / 2, width: 10 },
      { pos: new BABYLON.Vector3(0, 0.01, 8), rotation: Math.PI / 2, width: 10 },
    );
  }

  stripePositions.forEach((data, i) => {
    // Create alternating yellow/black stripes
    for (let s = 0; s < 8; s++) {
      const stripe = BABYLON.MeshBuilder.CreateBox(
        `stripe_${i}_${s}`,
        { width: data.width, height: 0.01, depth: 0.15 },
        scene
      );
      stripe.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, (s - 3.5) * 0.3));
      stripe.rotation = new BABYLON.Vector3(0, data.rotation, 0);
      
      const stripeMat = new BABYLON.StandardMaterial(`stripeMat_${i}_${s}`, scene);
      stripeMat.diffuseColor = s % 2 === 0 
        ? new BABYLON.Color3(1, 0.85, 0) // Yellow
        : new BABYLON.Color3(0.1, 0.1, 0.1); // Black
      stripeMat.emissiveColor = s % 2 === 0 
        ? new BABYLON.Color3(0.2, 0.17, 0)
        : new BABYLON.Color3(0, 0, 0);
      stripe.material = stripeMat;
    }
  });

  // === 5. FIRST AID KITS (white box with red cross) ===
  const firstAidPositions: { pos: BABYLON.Vector3, rotation: number }[] = [];
  
  if (type === 'warehouse') {
    firstAidPositions.push(
      { pos: new BABYLON.Vector3(-18, 2.5, 0), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 2.5, 0), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(0, 2.5, 18), rotation: Math.PI },
    );
  } else if (type === 'construction' || type === 'factory') {
    firstAidPositions.push(
      { pos: new BABYLON.Vector3(-15, 2.5, 0), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2.5, 0), rotation: -Math.PI / 2 },
    );
  } else if (type === 'laboratory') {
    firstAidPositions.push(
      { pos: new BABYLON.Vector3(-15, 2.5, 0), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2.5, 0), rotation: -Math.PI / 2 },
    );
  } else if (type === 'office') {
    firstAidPositions.push(
      { pos: new BABYLON.Vector3(-15, 2.5, 3), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2.5, 3), rotation: -Math.PI / 2 },
    );
  }

  firstAidPositions.forEach((data, i) => {
    // White box
    const aidBox = BABYLON.MeshBuilder.CreateBox(
      `aidBox_${i}`,
      { width: 0.5, height: 0.4, depth: 0.2 },
      scene
    );
    aidBox.position = data.pos;
    aidBox.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const aidMat = new BABYLON.StandardMaterial(`aidMat_${i}`, scene);
    aidMat.diffuseColor = new BABYLON.Color3(0.98, 0.98, 0.98); // White
    aidMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    aidMat.specularPower = 64;
    aidBox.material = aidMat;
    
    // Store for pulsing animation
    firstAidBoxes.push(aidBox);
    
    // Red cross - vertical bar
    const crossV = BABYLON.MeshBuilder.CreateBox(
      `crossV_${i}`,
      { width: 0.08, height: 0.25, depth: 0.02 },
      scene
    );
    crossV.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, 0.11));
    crossV.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    
    const crossMat = new BABYLON.StandardMaterial(`crossMat_${i}`, scene);
    crossMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1); // Red
    crossMat.emissiveColor = new BABYLON.Color3(0.2, 0.02, 0.02);
    crossV.material = crossMat;
    
    // Red cross - horizontal bar
    const crossH = BABYLON.MeshBuilder.CreateBox(
      `crossH_${i}`,
      { width: 0.25, height: 0.08, depth: 0.02 },
      scene
    );
    crossH.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, 0.11));
    crossH.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    crossH.material = crossMat;
    
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(aidBox);
      shadowGenerator.addShadowCaster(crossV);
      shadowGenerator.addShadowCaster(crossH);
    }
  });

  // === ANIMATIONS ===
  
  // 1. WARNING SIGNS - Oscillating/swaying motion (like hanging from ceiling)
  scene.registerBeforeRender(() => {
    const time = Date.now() / 1000; // Time in seconds
    
    warningSignMeshes.forEach((sign, i) => {
      // Each sign sways slightly with different phase
      const phase = i * 0.5;
      const swayAmount = Math.sin(time * 1.5 + phase) * 0.015; // Small sway angle (radians)
      const baseRotation = sign.rotation.y;
      
      // Slight rotation oscillation on Z axis (tilt)
      sign.rotation.z = swayAmount;
      
      // Very subtle Y position oscillation
      const originalY = 2; // Base Y position
      sign.position.y = originalY + Math.sin(time * 1.2 + phase) * 0.02;
    });
  });
  
  // 2. EXIT SIGNS - Blinking emergency lights
  scene.registerBeforeRender(() => {
    const time = Date.now() / 1000;
    
    exitLights.forEach((light, i) => {
      // Blink pattern: on for 1.5s, off for 0.5s
      const phase = i * 0.3; // Stagger the blinks
      const blinkCycle = (time + phase) % 2.0;
      
      if (blinkCycle < 1.5) {
        // Light ON
        light.intensity = 0.4;
      } else {
        // Light OFF (blink)
        light.intensity = 0.05;
      }
    });
    
    exitSignMaterials.forEach((mat, i) => {
      const time = Date.now() / 1000;
      const phase = i * 0.3;
      const blinkCycle = (time + phase) % 2.0;
      
      if (blinkCycle < 1.5) {
        // Bright green (light ON)
        mat.emissiveColor = new BABYLON.Color3(0.05, 0.4, 0.1);
      } else {
        // Dim green (blink)
        mat.emissiveColor = new BABYLON.Color3(0.01, 0.1, 0.02);
      }
    });
  });
  
  // 3. FIRST AID KITS - Pulsing scale effect
  scene.registerBeforeRender(() => {
    const time = Date.now() / 1000;
    
    firstAidBoxes.forEach((box, i) => {
      // Each box pulses with different phase
      const phase = i * 0.7;
      const pulse = Math.sin(time * 2.0 + phase) * 0.08 + 1.0; // Scale from 0.92 to 1.08
      
      box.scaling = new BABYLON.Vector3(pulse, pulse, pulse);
      
      // Get the cross elements (they should be children or have related names)
      const crossV = scene.getMeshByName(`crossV_${i}`);
      const crossH = scene.getMeshByName(`crossH_${i}`);
      
      if (crossV && crossH) {
        crossV.scaling = new BABYLON.Vector3(pulse, pulse, pulse);
        crossH.scaling = new BABYLON.Vector3(pulse, pulse, pulse);
      }
    });
  });

  console.log(`[Safety] Safety signage added for ${type}: ${warningPositions.length} warning signs, ${extinguisherPositions.length} extinguishers, ${exitPositions.length} exit signs, ${stripePositions.length} floor stripes, ${firstAidPositions.length} first aid kits`);
  console.log(`[Safety] Animations enabled: ${warningSignMeshes.length} swaying signs, ${exitLights.length} blinking exit lights, ${firstAidBoxes.length} pulsing first aid kits`);
}

// Helper: Create procedural environment (fallback)
function createProceduralEnvironment(
  scene: BABYLON.Scene,
  type: string,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  if (type === 'office') {
    createRealisticOffice(scene, quality, shadowGenerator);
  } else {
    const wallHeight = 4;
    const roomSize = 20;
    const wallPositions = [
      { pos: new BABYLON.Vector3(0, wallHeight / 2, roomSize / 2), rot: 0 },
      { pos: new BABYLON.Vector3(0, wallHeight / 2, -roomSize / 2), rot: 0 },
      { pos: new BABYLON.Vector3(roomSize / 2, wallHeight / 2, 0), rot: Math.PI / 2 },
      { pos: new BABYLON.Vector3(-roomSize / 2, wallHeight / 2, 0), rot: Math.PI / 2 },
    ];
    wallPositions.forEach((data, i) => {
      const wall = BABYLON.MeshBuilder.CreateBox(`wall${i}`, { width: roomSize, height: wallHeight, depth: 0.5 }, scene);
      wall.position = data.pos;
      wall.rotation.y = data.rot;
      wall.checkCollisions = true;
      const mat = new BABYLON.StandardMaterial(`wallMat${i}`, scene);
      mat.diffuseColor = type === 'warehouse'
        ? new BABYLON.Color3(0.5, 0.52, 0.55)
        : type === 'factory'
        ? new BABYLON.Color3(0.55, 0.5, 0.45)
        : new BABYLON.Color3(0.65, 0.68, 0.7);
      mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      mat.specularPower = 16;
      wall.material = mat;
    });
    const ceiling = BABYLON.MeshBuilder.CreatePlane('ceiling', { width: roomSize, height: roomSize }, scene);
    ceiling.position.y = wallHeight;
    ceiling.rotation.x = Math.PI / 2;
    const ceilingMat = new BABYLON.StandardMaterial('ceilingMat', scene);
    ceilingMat.diffuseColor = new BABYLON.Color3(0.25, 0.27, 0.3);
    ceilingMat.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.03);
    ceilingMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ceiling.material = ceilingMat;
    if (type === 'warehouse') createWarehouseObjects(scene);
    else if (type === 'factory') createFactoryObjects(scene);
  }
}

// === REALISTIC OFFICE ENVIRONMENT ===
function createRealisticOffice(
  scene: BABYLON.Scene,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  const wallH = 3.2;
  const wallMat = new BABYLON.StandardMaterial('officeWallMat', scene);
  wallMat.diffuseColor = new BABYLON.Color3(0.92, 0.91, 0.88); // Warm white walls
  wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const accentWallMat = new BABYLON.StandardMaterial('accentWallMat', scene);
  accentWallMat.diffuseColor = new BABYLON.Color3(0.25, 0.4, 0.6); // Corporate blue accent
  accentWallMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const glassMat = new BABYLON.StandardMaterial('glassMat', scene);
  glassMat.diffuseColor = new BABYLON.Color3(0.7, 0.85, 0.95);
  glassMat.alpha = 0.3;
  glassMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  glassMat.specularPower = 128;

  const floorMat = new BABYLON.StandardMaterial('officeFloorMat', scene);
  floorMat.diffuseColor = new BABYLON.Color3(0.75, 0.72, 0.68); // Warm beige floor tiles
  floorMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  floorMat.specularPower = 16;

  // Custom floor overlay for office area
  const officeFloor = BABYLON.MeshBuilder.CreateGround('officeFloor', { width: 30, height: 24 }, scene);
  officeFloor.position.y = 0.01;
  officeFloor.material = floorMat;
  officeFloor.receiveShadows = true;

  // Carpet area in meeting room
  const carpet = BABYLON.MeshBuilder.CreateGround('carpet', { width: 6, height: 5 }, scene);
  carpet.position = new BABYLON.Vector3(10, 0.02, -6);
  const carpetMat = new BABYLON.StandardMaterial('carpetMat', scene);
  carpetMat.diffuseColor = new BABYLON.Color3(0.3, 0.35, 0.5); // Dark blue carpet
  carpetMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  carpet.material = carpetMat;

  const makeWall = (name: string, w: number, h: number, d: number, pos: BABYLON.Vector3, mat: BABYLON.StandardMaterial, collision = true) => {
    const wall = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    wall.position = pos;
    wall.checkCollisions = collision;
    wall.material = mat;
    wall.receiveShadows = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(wall);
    return wall;
  };

  // === PERIMETER WALLS ===
  makeWall('wall_N', 30, wallH, 0.3, new BABYLON.Vector3(0, wallH / 2, -12), wallMat);
  makeWall('wall_S', 30, wallH, 0.3, new BABYLON.Vector3(0, wallH / 2, 12), accentWallMat); // Accent wall (reception side)
  makeWall('wall_E', 0.3, wallH, 24, new BABYLON.Vector3(15, wallH / 2, 0), wallMat);
  makeWall('wall_W', 0.3, wallH, 24, new BABYLON.Vector3(-15, wallH / 2, 0), wallMat);

  // Ceiling
  const ceil = BABYLON.MeshBuilder.CreatePlane('officeCeiling', { width: 30, height: 24 }, scene);
  ceil.position.y = wallH;
  ceil.rotation.x = Math.PI / 2;
  const ceilMat = new BABYLON.StandardMaterial('ceilMat', scene);
  ceilMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
  ceilMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  ceil.material = ceilMat;

  // === MEETING ROOM (right side, glass partition) ===
  makeWall('meetingWall', 0.15, wallH, 8, new BABYLON.Vector3(6.5, wallH / 2, -6), wallMat);
  // Glass partition
  const glass = BABYLON.MeshBuilder.CreateBox('glassPartition', { width: 0.08, height: 2.2, depth: 5 }, scene);
  glass.position = new BABYLON.Vector3(6.5, 1.6, -2);
  glass.material = glassMat;
  glass.checkCollisions = true;

  // Meeting table
  const meetTable = BABYLON.MeshBuilder.CreateBox('meetingTable', { width: 3.5, height: 0.08, depth: 1.5 }, scene);
  meetTable.position = new BABYLON.Vector3(10, 0.75, -6);
  const tableMat = new BABYLON.StandardMaterial('meetTableMat', scene);
  tableMat.diffuseColor = new BABYLON.Color3(0.45, 0.35, 0.25); // Dark wood
  tableMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  tableMat.specularPower = 32;
  meetTable.material = tableMat;
  meetTable.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(meetTable);
  // Table legs
  for (let c = 0; c < 4; c++) {
    const leg = BABYLON.MeshBuilder.CreateCylinder(`meetLeg_${c}`, { height: 0.75, diameter: 0.06 }, scene);
    leg.position = new BABYLON.Vector3(
      10 + (c % 2 === 0 ? -1.5 : 1.5),
      0.375,
      -6 + (c < 2 ? -0.6 : 0.6)
    );
    const legMat = new BABYLON.StandardMaterial(`meetLegMat_${c}`, scene);
    legMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);
    legMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    leg.material = legMat;
  }
  // Meeting chairs (6)
  for (let c = 0; c < 6; c++) {
    const mChair = BABYLON.MeshBuilder.CreateBox(`meetChair_${c}`, { width: 0.5, height: 0.45, depth: 0.5 }, scene);
    const side = c < 3 ? -1 : 1;
    mChair.position = new BABYLON.Vector3(8.5 + (c % 3) * 1.1, 0.225, -6 + side * 1.2);
    const mcMat = new BABYLON.StandardMaterial(`mcMat_${c}`, scene);
    mcMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.3);
    mChair.material = mcMat;
    // Backrest
    const mBack = BABYLON.MeshBuilder.CreateBox(`meetBack_${c}`, { width: 0.5, height: 0.4, depth: 0.06 }, scene);
    mBack.position = new BABYLON.Vector3(mChair.position.x, 0.65, mChair.position.z - side * 0.22);
    mBack.material = mcMat;
  }
  // Whiteboard on meeting room wall
  const wb = BABYLON.MeshBuilder.CreateBox('whiteboard', { width: 2.5, height: 1.2, depth: 0.05 }, scene);
  wb.position = new BABYLON.Vector3(14.7, 1.8, -6);
  wb.rotation.y = Math.PI / 2;
  const wbMat = new BABYLON.StandardMaterial('wbMat', scene);
  wbMat.diffuseColor = new BABYLON.Color3(0.98, 0.98, 0.98);
  wbMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  wb.material = wbMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(wb);

  // === BREAK AREA (left-back corner) ===
  // Vending machine
  const vending = BABYLON.MeshBuilder.CreateBox('vendingMachine', { width: 0.8, height: 1.8, depth: 0.7 }, scene);
  vending.position = new BABYLON.Vector3(-14, 0.9, 8);
  const vendMat = new BABYLON.StandardMaterial('vendMat', scene);
  vendMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
  vendMat.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.15);
  vendMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  vending.material = vendMat;
  vending.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(vending);
  // Water cooler
  const cooler = BABYLON.MeshBuilder.CreateCylinder('waterCooler', { height: 1.1, diameter: 0.35 }, scene);
  cooler.position = new BABYLON.Vector3(-12.5, 0.55, 8);
  const coolerMat = new BABYLON.StandardMaterial('coolerMat', scene);
  coolerMat.diffuseColor = new BABYLON.Color3(0.85, 0.88, 0.92);
  coolerMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  cooler.material = coolerMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(cooler);
  // Water bottle on top
  const bottle = BABYLON.MeshBuilder.CreateCylinder('waterBottle', { height: 0.5, diameter: 0.25 }, scene);
  bottle.position = new BABYLON.Vector3(-12.5, 1.35, 8);
  const bottleMat = new BABYLON.StandardMaterial('bottleMat', scene);
  bottleMat.diffuseColor = new BABYLON.Color3(0.6, 0.75, 0.9);
  bottleMat.alpha = 0.6;
  bottle.material = bottleMat;
  // Small break table
  const breakTable = BABYLON.MeshBuilder.CreateCylinder('breakTable', { height: 0.06, diameter: 1.2 }, scene);
  breakTable.position = new BABYLON.Vector3(-11, 0.72, 10);
  const btMat = new BABYLON.StandardMaterial('btMat', scene);
  btMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
  btMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  breakTable.material = btMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(breakTable);

  // === WINDOWS (on north wall — fake depth with subtle sky tint) ===
  for (let w = 0; w < 4; w++) {
    const windowFrame = BABYLON.MeshBuilder.CreateBox(`windowFrame_${w}`, { width: 2.5, height: 1.8, depth: 0.1 }, scene);
    windowFrame.position = new BABYLON.Vector3(-10 + w * 6.5, 2, -11.8);
    const winMat = new BABYLON.StandardMaterial(`winMat_${w}`, scene);
    winMat.diffuseColor = new BABYLON.Color3(0.55, 0.68, 0.82);
    winMat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.28); // Much dimmer sky glow
    winMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    winMat.specularPower = 128;
    winMat.alpha = 0.85;
    windowFrame.material = winMat;
    // Window frame border
    const frameBorder = BABYLON.MeshBuilder.CreateBox(`frameBorder_${w}`, { width: 2.7, height: 2, depth: 0.05 }, scene);
    frameBorder.position = new BABYLON.Vector3(-10 + w * 6.5, 2, -11.9);
    const fMat = new BABYLON.StandardMaterial(`fMat_${w}`, scene);
    fMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.72);
    fMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    frameBorder.material = fMat;
  }

  // === WINDOWS on EAST wall ===
  for (let w = 0; w < 3; w++) {
    const ewFrame = BABYLON.MeshBuilder.CreateBox(`eastWindow_${w}`, { width: 1.8, height: 1.5, depth: 0.1 }, scene);
    ewFrame.position = new BABYLON.Vector3(14.8, 2, -8 + w * 6);
    ewFrame.rotation.y = Math.PI / 2;
    const ewMat = new BABYLON.StandardMaterial(`ewMat_${w}`, scene);
    ewMat.diffuseColor = new BABYLON.Color3(0.55, 0.68, 0.82);
    ewMat.emissiveColor = new BABYLON.Color3(0.10, 0.15, 0.22);
    ewMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    ewMat.alpha = 0.85;
    ewFrame.material = ewMat;
    const ewBorder = BABYLON.MeshBuilder.CreateBox(`eastBorder_${w}`, { width: 2, height: 1.7, depth: 0.05 }, scene);
    ewBorder.position = new BABYLON.Vector3(14.85, 2, -8 + w * 6);
    ewBorder.rotation.y = Math.PI / 2;
    const ebMat = new BABYLON.StandardMaterial(`ebMat_${w}`, scene);
    ebMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.72);
    ewBorder.material = ebMat;
  }

  // === RECEPTION DESK (near south wall) ===
  const recDesk = BABYLON.MeshBuilder.CreateBox('receptionDesk', { width: 3, height: 1.1, depth: 0.8 }, scene);
  recDesk.position = new BABYLON.Vector3(0, 0.55, 10);
  const recMat = new BABYLON.StandardMaterial('recMat', scene);
  recMat.diffuseColor = new BABYLON.Color3(0.35, 0.3, 0.25); // Dark walnut
  recMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  recMat.specularPower = 16;
  recDesk.material = recMat;
  recDesk.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(recDesk);
  // Reception screen
  const recScreen = BABYLON.MeshBuilder.CreateBox('recScreen', { width: 0.5, height: 0.35, depth: 0.04 }, scene);
  recScreen.position = new BABYLON.Vector3(0, 1.25, 10.2);
  const rsMat = new BABYLON.StandardMaterial('rsMat', scene);
  rsMat.emissiveColor = new BABYLON.Color3(0.3, 0.4, 0.55);
  rsMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.22);
  recScreen.material = rsMat;

  // === PRINTER/COPIER (common area) ===
  const printer = BABYLON.MeshBuilder.CreateBox('printer', { width: 0.8, height: 0.5, depth: 0.6 }, scene);
  printer.position = new BABYLON.Vector3(-5, 0.8, 4);
  const printerMat = new BABYLON.StandardMaterial('printerMat', scene);
  printerMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.32);
  printerMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  printer.material = printerMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(printer);
  // Printer stand
  const printerStand = BABYLON.MeshBuilder.CreateBox('printerStand', { width: 0.9, height: 0.8, depth: 0.7 }, scene);
  printerStand.position = new BABYLON.Vector3(-5, 0.4, 4);
  const psMat = new BABYLON.StandardMaterial('psMat', scene);
  psMat.diffuseColor = new BABYLON.Color3(0.7, 0.68, 0.65);
  printerStand.material = psMat;
  printerStand.checkCollisions = true;

  // === FILING CABINETS (along west wall) ===
  for (let f = 0; f < 3; f++) {
    const cabinet = BABYLON.MeshBuilder.CreateBox(`filingCab_${f}`, { width: 0.5, height: 1.3, depth: 0.6 }, scene);
    cabinet.position = new BABYLON.Vector3(-14.2, 0.65, -4 + f * 1.2);
    const cabMat = new BABYLON.StandardMaterial(`cabMat_${f}`, scene);
    cabMat.diffuseColor = new BABYLON.Color3(0.55, 0.55, 0.58);
    cabMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    cabMat.specularPower = 32;
    cabinet.material = cabMat;
    cabinet.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(cabinet);
    // Drawer handles
    for (let d = 0; d < 3; d++) {
      const handle = BABYLON.MeshBuilder.CreateBox(`handle_${f}_${d}`, { width: 0.15, height: 0.02, depth: 0.03 }, scene);
      handle.position = new BABYLON.Vector3(-13.9, 0.3 + d * 0.4, -4 + f * 1.2);
      const hMat = new BABYLON.StandardMaterial(`hMat_${f}_${d}`, scene);
      hMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.72);
      hMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
      handle.material = hMat;
    }
  }

  // === POTTED PLANTS ===
  const plantPositions = [
    new BABYLON.Vector3(-14, 0, -10), new BABYLON.Vector3(14, 0, -10),
    new BABYLON.Vector3(-14, 0, 4), new BABYLON.Vector3(6, 0, 0),
  ];
  plantPositions.forEach((pos, i) => {
    const pot = BABYLON.MeshBuilder.CreateCylinder(`officePot_${i}`, {
      height: 0.4, diameterTop: 0.35, diameterBottom: 0.25
    }, scene);
    pot.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 0.2, 0));
    const potMat = new BABYLON.StandardMaterial(`oPotMat_${i}`, scene);
    potMat.diffuseColor = new BABYLON.Color3(0.55, 0.35, 0.2);
    pot.material = potMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(pot);
    // Foliage (cone shape for tall plant)
    const foliage = BABYLON.MeshBuilder.CreateCylinder(`foliage_${i}`, {
      height: 0.8, diameterTop: 0.1, diameterBottom: 0.6, tessellation: 8
    }, scene);
    foliage.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 0.8, 0));
    const fMat = new BABYLON.StandardMaterial(`foliageMat_${i}`, scene);
    fMat.diffuseColor = new BABYLON.Color3(0.15, 0.45, 0.15);
    foliage.material = fMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(foliage);
  });

  // === WALL CLOCK ===
  const clock = BABYLON.MeshBuilder.CreateCylinder('wallClock', { height: 0.04, diameter: 0.5 }, scene);
  clock.position = new BABYLON.Vector3(0, 2.5, -11.7);
  clock.rotation.x = Math.PI / 2;
  const clockMat = new BABYLON.StandardMaterial('clockMat', scene);
  clockMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.92);
  clockMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  clock.material = clockMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(clock);

  // === WALL POSTERS / FRAMED ART ===
  const posterData = [
    { pos: new BABYLON.Vector3(-14.7, 2, -7), rot: Math.PI / 2, color: new BABYLON.Color3(0.15, 0.35, 0.6), w: 1.2, h: 0.8 },
    { pos: new BABYLON.Vector3(-14.7, 2, 0), rot: Math.PI / 2, color: new BABYLON.Color3(0.6, 0.25, 0.15), w: 0.9, h: 1.2 },
    { pos: new BABYLON.Vector3(-14.7, 2, 5), rot: Math.PI / 2, color: new BABYLON.Color3(0.2, 0.5, 0.3), w: 1.0, h: 0.7 },
    { pos: new BABYLON.Vector3(5, 2.2, 11.7), rot: Math.PI, color: new BABYLON.Color3(0.5, 0.3, 0.1), w: 1.5, h: 1.0 },
    { pos: new BABYLON.Vector3(-6, 2.2, 11.7), rot: Math.PI, color: new BABYLON.Color3(0.2, 0.25, 0.5), w: 1.0, h: 0.7 },
    { pos: new BABYLON.Vector3(8, 2.2, -11.7), rot: 0, color: new BABYLON.Color3(0.55, 0.2, 0.2), w: 0.8, h: 1.1 },
  ];
  posterData.forEach((p, i) => {
    // Frame
    const frame = BABYLON.MeshBuilder.CreateBox(`posterFrame_${i}`, { width: p.w + 0.1, height: p.h + 0.1, depth: 0.04 }, scene);
    frame.position = p.pos.clone();
    frame.rotation.y = p.rot;
    const frameMat = new BABYLON.StandardMaterial(`posterFrameMat_${i}`, scene);
    frameMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.22);
    frameMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    frame.material = frameMat;
    // Poster surface
    const poster = BABYLON.MeshBuilder.CreateBox(`poster_${i}`, { width: p.w, height: p.h, depth: 0.02 }, scene);
    poster.position = p.pos.clone();
    poster.rotation.y = p.rot;
    // Offset slightly in front of frame
    const fwd = new BABYLON.Vector3(Math.sin(p.rot) * 0.03, 0, Math.cos(p.rot) * 0.03);
    poster.position.addInPlace(fwd);
    const pMat = new BABYLON.StandardMaterial(`posterMat_${i}`, scene);
    pMat.diffuseColor = p.color;
    pMat.emissiveColor = p.color.scale(0.08);
    pMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    poster.material = pMat;
  });

  // === BOOKSHELF (along west wall, near filing cabinets) ===
  const shelfY = [0.5, 1.0, 1.5, 2.0];
  const shelfX = -14.2;
  const shelfZ = 2;
  // Vertical sides
  for (let s = 0; s < 2; s++) {
    const side = BABYLON.MeshBuilder.CreateBox(`shelfSide_${s}`, { width: 0.04, height: 2.2, depth: 0.35 }, scene);
    side.position = new BABYLON.Vector3(shelfX, 1.1, shelfZ + (s === 0 ? -0.6 : 0.6));
    const sideMat = new BABYLON.StandardMaterial(`shelfSideMat_${s}`, scene);
    sideMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    side.material = sideMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(side);
  }
  // Shelves + books
  shelfY.forEach((y, si) => {
    const shelf = BABYLON.MeshBuilder.CreateBox(`shelf_${si}`, { width: 0.35, height: 0.03, depth: 1.2 }, scene);
    shelf.position = new BABYLON.Vector3(shelfX, y, shelfZ);
    const shMat = new BABYLON.StandardMaterial(`shMat_${si}`, scene);
    shMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    shelf.material = shMat;
    // Books on each shelf
    const bookCount = 3 + Math.floor(Math.random() * 4);
    for (let b = 0; b < bookCount; b++) {
      const bh = 0.15 + Math.random() * 0.12;
      const bw = 0.03 + Math.random() * 0.03;
      const book = BABYLON.MeshBuilder.CreateBox(`book_${si}_${b}`, { width: 0.2, height: bh, depth: bw }, scene);
      book.position = new BABYLON.Vector3(shelfX + 0.05, y + bh / 2 + 0.02, shelfZ - 0.45 + b * 0.18);
      const bkMat = new BABYLON.StandardMaterial(`bkMat_${si}_${b}`, scene);
      const hue = Math.random();
      bkMat.diffuseColor = new BABYLON.Color3(
        0.2 + hue * 0.6,
        0.15 + (1 - hue) * 0.4,
        0.2 + Math.random() * 0.4
      );
      book.material = bkMat;
    }
  });

  // === COAT RACK near entrance ===
  const coatPole = BABYLON.MeshBuilder.CreateCylinder('coatRack', { height: 1.7, diameter: 0.06 }, scene);
  coatPole.position = new BABYLON.Vector3(13, 0.85, 10.5);
  const coatMat = new BABYLON.StandardMaterial('coatRackMat', scene);
  coatMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.32);
  coatMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  coatPole.material = coatMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(coatPole);
  // Base
  const coatBase = BABYLON.MeshBuilder.CreateCylinder('coatBase', { height: 0.05, diameter: 0.5 }, scene);
  coatBase.position = new BABYLON.Vector3(13, 0.025, 10.5);
  coatBase.material = coatMat;
  // Arms
  for (let a = 0; a < 4; a++) {
    const arm = BABYLON.MeshBuilder.CreateCylinder(`coatArm_${a}`, { height: 0.2, diameter: 0.025 }, scene);
    arm.position = new BABYLON.Vector3(13, 1.65, 10.5);
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = (a / 4) * Math.PI * 2;
    arm.material = coatMat;
  }

  // === TRASH BINS ===
  const binPositions = [
    new BABYLON.Vector3(-5, 0, 6),
    new BABYLON.Vector3(4, 0, -2),
    new BABYLON.Vector3(12, 0, 4),
  ];
  binPositions.forEach((pos, i) => {
    const bin = BABYLON.MeshBuilder.CreateCylinder(`trashBin_${i}`, {
      height: 0.5, diameterTop: 0.3, diameterBottom: 0.25, tessellation: 12
    }, scene);
    bin.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 0.25, 0));
    const binMat = new BABYLON.StandardMaterial(`binMat_${i}`, scene);
    binMat.diffuseColor = new BABYLON.Color3(0.35, 0.35, 0.38);
    bin.material = binMat;
  });

  console.log('[Office] Realistic office environment created with meeting room, reception, break area, windows, posters, bookshelf');
}

function createWarehouseObjects(scene: BABYLON.Scene) {
  for (let i = 0; i < 8; i++) {
    const box = BABYLON.MeshBuilder.CreateBox(`box${i}`, { width: 1.5, height: 1.2, depth: 1.5 }, scene);
    box.position = new BABYLON.Vector3((Math.random() - 0.5) * 15, 0.6, (Math.random() - 0.5) * 15);
    box.checkCollisions = true;
    const mat = new BABYLON.StandardMaterial(`boxMat${i}`, scene);
    mat.diffuseColor = new BABYLON.Color3(0.65, 0.45, 0.25);
    mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    box.material = mat;
  }
}

function createFactoryObjects(scene: BABYLON.Scene) {
  for (let i = 0; i < 6; i++) {
    const cylinder = BABYLON.MeshBuilder.CreateCylinder(`pipe${i}`, { height: 2, diameter: 0.3 }, scene);
    cylinder.position = new BABYLON.Vector3((Math.random() - 0.5) * 15, 1, (Math.random() - 0.5) * 15);
    cylinder.rotation.z = Math.PI / 2;
    cylinder.checkCollisions = true;
    const mat = new BABYLON.StandardMaterial(`pipeMat${i}`, scene);
    mat.diffuseColor = new BABYLON.Color3(0.45, 0.48, 0.52);
    mat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.65);
    mat.specularPower = 64;
    cylinder.material = mat;
  }
}

// Helper: Create particle effect
function createParticleEffect(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  isCritical: boolean
) {
  const particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene);
  
  const emitter = BABYLON.MeshBuilder.CreateSphere('emitter', { diameter: 0.1 }, scene);
  emitter.position = position;
  particleSystem.emitter = emitter;

  particleSystem.particleTexture = new BABYLON.Texture(
    'https://assets.babylonjs.com/textures/flare.png',
    scene
  );

  particleSystem.color1 = isCritical
    ? new BABYLON.Color4(1, 0, 0, 1)
    : new BABYLON.Color4(1, 0.5, 0, 1);
  particleSystem.color2 = isCritical
    ? new BABYLON.Color4(1, 0.3, 0, 1)
    : new BABYLON.Color4(1, 1, 0, 1);
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 1.0;
  particleSystem.emitRate = 1000;
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
  particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
  particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
  particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
  particleSystem.minEmitPower = 2;
  particleSystem.maxEmitPower = 4;
  particleSystem.updateSpeed = 0.01;

  particleSystem.start();

  // Stop after duration
  setTimeout(() => {
    particleSystem.stop();
    setTimeout(() => {
      particleSystem.dispose();
      emitter.dispose();
    }, 1000);
  }, isCritical ? 1000 : 500);
}

// Helper: Play risk sound
function playRiskSound(scene: BABYLON.Scene, isCritical: boolean) {
  const sound = new BABYLON.Sound(
    'riskSound',
    isCritical
      ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
      : 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    scene,
    null,
    { autoplay: true, volume: 0.5 }
  );
}

// Helper: Create ambient audio
function createAmbientAudio(scene: BABYLON.Scene, type: string) {
  let soundUrl = '';
  
  if (type === 'warehouse') {
    soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3';
  } else if (type === 'factory') {
    soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2398/2398-preview.mp3';
  } else {
    soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3';
  }

  const ambientSound = new BABYLON.Sound(
    'ambient',
    soundUrl,
    scene,
    null,
    {
      loop: true,
      autoplay: true,
      volume: 0.2,
    }
  );
}

// Helper: Create first-person extinguisher model attached to camera
function createFirstPersonExtinguisher(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  type: string
) {
  console.log('[BabylonScene] Creating first-person extinguisher:', type);

  // Color based on extinguisher type
  const getExtColor = (): { body: BABYLON.Color3; label: BABYLON.Color3; nozzle: BABYLON.Color3 } => {
    switch (type) {
      case 'co2':
        return {
          body: new BABYLON.Color3(0.15, 0.15, 0.15), // Black/dark gray
          label: new BABYLON.Color3(0.3, 0.6, 0.9),   // Blue label
          nozzle: new BABYLON.Color3(0.5, 0.5, 0.5),
        };
      case 'powder':
        return {
          body: new BABYLON.Color3(0.85, 0.1, 0.1),   // Red
          label: new BABYLON.Color3(1, 0.85, 0),       // Yellow label
          nozzle: new BABYLON.Color3(0.3, 0.3, 0.3),
        };
      case 'foam':
        return {
          body: new BABYLON.Color3(0.85, 0.1, 0.1),   // Red
          label: new BABYLON.Color3(0.9, 0.8, 0.6),    // Cream label
          nozzle: new BABYLON.Color3(0.2, 0.2, 0.2),
        };
      case 'water':
        return {
          body: new BABYLON.Color3(0.85, 0.1, 0.1),   // Red
          label: new BABYLON.Color3(1, 1, 1),           // White label
          nozzle: new BABYLON.Color3(0.4, 0.4, 0.4),
        };
      default:
        return {
          body: new BABYLON.Color3(0.85, 0.1, 0.1),
          label: new BABYLON.Color3(1, 1, 1),
          nozzle: new BABYLON.Color3(0.3, 0.3, 0.3),
        };
    }
  };

  const colors = getExtColor();

  // Parent node to attach to camera
  const extParent = new BABYLON.TransformNode('extinguisher_parent', scene);
  extParent.parent = camera;
  // Position: lower-right of view (like FPS weapon)
  extParent.position = new BABYLON.Vector3(0.35, -0.35, 0.6);
  extParent.rotation = new BABYLON.Vector3(0.1, -0.3, 0.15); // Slight tilt

  // Main cylinder body
  const body = BABYLON.MeshBuilder.CreateCylinder('ext_body', {
    height: 0.45,
    diameterTop: 0.09,
    diameterBottom: 0.1,
    tessellation: 16,
  }, scene);
  body.parent = extParent;
  body.position = new BABYLON.Vector3(0, 0, 0);

  const bodyMat = new BABYLON.StandardMaterial('ext_bodyMat', scene);
  bodyMat.diffuseColor = colors.body;
  bodyMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  bodyMat.specularPower = 64;
  body.material = bodyMat;

  // Label band around the middle
  const label = BABYLON.MeshBuilder.CreateCylinder('ext_label', {
    height: 0.12,
    diameter: 0.105,
    tessellation: 16,
  }, scene);
  label.parent = extParent;
  label.position = new BABYLON.Vector3(0, -0.02, 0);

  const labelMat = new BABYLON.StandardMaterial('ext_labelMat', scene);
  labelMat.diffuseColor = colors.label;
  labelMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  label.material = labelMat;

  // Top valve/handle
  const valve = BABYLON.MeshBuilder.CreateCylinder('ext_valve', {
    height: 0.06,
    diameterTop: 0.04,
    diameterBottom: 0.07,
    tessellation: 12,
  }, scene);
  valve.parent = extParent;
  valve.position = new BABYLON.Vector3(0, 0.25, 0);

  const valveMat = new BABYLON.StandardMaterial('ext_valveMat', scene);
  valveMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  valveMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  valveMat.specularPower = 128;
  valve.material = valveMat;

  // Handle (lever)
  const handle = BABYLON.MeshBuilder.CreateBox('ext_handle', {
    width: 0.015,
    height: 0.04,
    depth: 0.1,
  }, scene);
  handle.parent = extParent;
  handle.position = new BABYLON.Vector3(0, 0.27, 0.04);
  handle.rotation.x = -0.3;
  handle.material = valveMat;

  // Nozzle/hose
  const nozzle = BABYLON.MeshBuilder.CreateCylinder('ext_nozzle', {
    height: 0.2,
    diameterTop: 0.015,
    diameterBottom: 0.025,
    tessellation: 8,
  }, scene);
  nozzle.parent = extParent;
  nozzle.position = new BABYLON.Vector3(0.03, 0.22, 0.1);
  nozzle.rotation.x = Math.PI / 3;

  const nozzleMat = new BABYLON.StandardMaterial('ext_nozzleMat', scene);
  nozzleMat.diffuseColor = colors.nozzle;
  nozzleMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  nozzle.material = nozzleMat;

  // Pressure gauge (small sphere)
  const gauge = BABYLON.MeshBuilder.CreateSphere('ext_gauge', {
    diameter: 0.03,
    segments: 8,
  }, scene);
  gauge.parent = extParent;
  gauge.position = new BABYLON.Vector3(-0.04, 0.15, 0.04);

  const gaugeMat = new BABYLON.StandardMaterial('ext_gaugeMat', scene);
  gaugeMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
  gaugeMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.1); // Slight green glow
  gauge.material = gaugeMat;

  // Disable all extinguisher meshes from picking/collisions
  [body, label, valve, handle, nozzle, gauge].forEach(mesh => {
    mesh.isPickable = false;
    mesh.checkCollisions = false;
  });

  // Subtle idle sway animation
  let swayTime = 0;
  scene.registerBeforeRender(() => {
    swayTime += 0.016;
    const swayX = Math.sin(swayTime * 1.2) * 0.003;
    const swayY = Math.cos(swayTime * 0.8) * 0.002;
    extParent.position.x = 0.35 + swayX;
    extParent.position.y = -0.35 + swayY;
  });

  console.log('[BabylonScene] ✓ First-person extinguisher created:', type);
}

// Fire class types for each fire emitter position
// Fire 0 (near risk 1 - principio di incendio): electrical origin
// Fire 1 (near risk 6 - scatoloni): solid materials 
// Fire 2 (near risk 9 - multipresa sovraccarica): electrical
type FireClass = 'electrical' | 'liquid' | 'solid' | 'gas';
const FIRE_CLASSES: Record<number, FireClass> = {
  0: 'electrical',
  1: 'solid',
  2: 'electrical',
};

// Effectiveness multiplier: how many hits an extinguisher type needs on a fire class
// Lower = more effective (fewer hits needed)
function getEffectivenessMultiplier(extType: string, fireClass: FireClass): { multiplier: number; isWrong: boolean; message: string } {
  const matrix: Record<string, Record<FireClass, number>> = {
    co2:    { electrical: 0.6, liquid: 0.8, solid: 1.5, gas: 0.9 },
    powder: { electrical: 0.9, liquid: 0.7, solid: 0.8, gas: 0.7 },
    foam:   { electrical: 2.5, liquid: 0.6, solid: 0.7, gas: 1.8 },
    water:  { electrical: 3.0, liquid: 1.8, solid: 0.6, gas: 2.0 },
  };
  const mult = matrix[extType]?.[fireClass] ?? 1;
  const isWrong = mult >= 1.5;
  const classLabels: Record<FireClass, string> = {
    electrical: 'elettrico', liquid: 'liquido', solid: 'solido', gas: 'gas'
  };
  const messages: Record<string, string> = {
    co2: 'CO₂', powder: 'Polvere', foam: 'Schiuma', water: 'Acqua'
  };
  const message = isWrong 
    ? `⚠️ ${messages[extType]} poco efficace su fuoco ${classLabels[fireClass]}!`
    : `✅ ${messages[extType]} efficace su fuoco ${classLabels[fireClass]}`;
  return { multiplier: mult, isWrong, message };
}

// Helper: Shoot extinguisher spray particles from camera forward
function shootExtinguisherSpray(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  extinguisherType: string,
  fireHitCount: Map<number, number>,
  onFireExtinguished?: (extinguished: number, total: number) => void
) {
  // Get spray colors based on extinguisher type
  const getSprayColors = () => {
    switch (extinguisherType) {
      case 'co2':
        return {
          color1: new BABYLON.Color4(0.9, 0.95, 1.0, 0.6),
          color2: new BABYLON.Color4(0.8, 0.85, 0.95, 0.4),
          colorDead: new BABYLON.Color4(0.95, 0.97, 1.0, 0),
          size: { min: 0.08, max: 0.25 },
        };
      case 'powder':
        return {
          color1: new BABYLON.Color4(1.0, 0.95, 0.7, 0.8),
          color2: new BABYLON.Color4(0.95, 0.85, 0.5, 0.6),
          colorDead: new BABYLON.Color4(0.9, 0.85, 0.6, 0),
          size: { min: 0.1, max: 0.35 },
        };
      case 'foam':
        return {
          color1: new BABYLON.Color4(1.0, 1.0, 1.0, 0.7),
          color2: new BABYLON.Color4(0.95, 0.97, 1.0, 0.5),
          colorDead: new BABYLON.Color4(1.0, 1.0, 1.0, 0),
          size: { min: 0.12, max: 0.4 },
        };
      case 'water':
      default:
        return {
          color1: new BABYLON.Color4(0.5, 0.7, 1.0, 0.5),
          color2: new BABYLON.Color4(0.4, 0.6, 0.9, 0.3),
          colorDead: new BABYLON.Color4(0.6, 0.8, 1.0, 0),
          size: { min: 0.04, max: 0.12 },
        };
    }
  };

  const colors = getSprayColors();
  const forward = camera.getDirection(BABYLON.Vector3.Forward());

  // Spray origin: slightly in front of camera (nozzle tip position)
  const sprayOrigin = camera.position.clone()
    .addInPlace(forward.scale(0.8))
    .addInPlace(new BABYLON.Vector3(0.3, -0.2, 0));

  // Create spray particle system
  const spray = new BABYLON.ParticleSystem('extSpray', 300, scene);
  const emitter = BABYLON.MeshBuilder.CreateSphere('sprayEmitter', { diameter: 0.05 }, scene);
  emitter.position = sprayOrigin;
  emitter.isVisible = false;
  spray.emitter = emitter;

  spray.particleTexture = new BABYLON.Texture(
    'https://assets.babylonjs.com/textures/flare.png', scene
  );

  spray.color1 = colors.color1;
  spray.color2 = colors.color2;
  spray.colorDead = colors.colorDead;
  spray.minSize = colors.size.min;
  spray.maxSize = colors.size.max;
  spray.minLifeTime = 0.3;
  spray.maxLifeTime = 0.8;
  spray.emitRate = 250;
  spray.blendMode = extinguisherType === 'co2' 
    ? BABYLON.ParticleSystem.BLENDMODE_ONEONE 
    : BABYLON.ParticleSystem.BLENDMODE_STANDARD;
  
  // Spray direction: forward from camera with slight spread
  const spreadAmount = extinguisherType === 'powder' ? 0.6 : 0.3;
  spray.direction1 = forward.scale(3).add(new BABYLON.Vector3(-spreadAmount, -spreadAmount, -spreadAmount));
  spray.direction2 = forward.scale(5).add(new BABYLON.Vector3(spreadAmount, spreadAmount, spreadAmount));
  spray.minEmitPower = 3;
  spray.maxEmitPower = 6;
  spray.updateSpeed = 0.01;
  spray.gravity = extinguisherType === 'water' 
    ? new BABYLON.Vector3(0, -4, 0) 
    : new BABYLON.Vector3(0, -0.5, 0);
  spray.minEmitBox = new BABYLON.Vector3(-0.05, -0.05, -0.05);
  spray.maxEmitBox = new BABYLON.Vector3(0.05, 0.05, 0.05);

  // Add angular spin for foam/powder
  if (extinguisherType === 'foam' || extinguisherType === 'powder') {
    spray.minAngularSpeed = -1;
    spray.maxAngularSpeed = 1;
  }

  spray.start();

  // Play spray sound effect
  try {
    const audioCtx = new AudioContext();
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = extinguisherType === 'co2' ? 4000 : 2500;
    filter.Q.value = 0.5;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
    noise.stop(audioCtx.currentTime + 0.8);
    setTimeout(() => audioCtx.close(), 1500);
  } catch (e) {
    // Audio not critical
  }

  // Check if spray hits any fire emitters and reduce them
  const sprayHitPoint = sprayOrigin.add(forward.scale(5));
  const fireEmitters = scene.meshes.filter(m => m.name.startsWith('fireEmitter_'));
  
  fireEmitters.forEach(fireEmitter => {
    const dist = BABYLON.Vector3.Distance(sprayHitPoint, fireEmitter.position);
    if (dist < 4) {
      // Find the fire particle system index
      const idx = parseInt(fireEmitter.name.replace('fireEmitter_', ''));
      const fireSystem = scene.particleSystems.find(ps => ps.name === `fire_${idx}`);
      const smokeSystem = scene.particleSystems.find(ps => ps.name === `fireSmoke_${idx}`);
      
      // Get fire class and effectiveness
      const fireClass = FIRE_CLASSES[idx] || 'solid';
      const { multiplier, isWrong, message } = getEffectivenessMultiplier(extinguisherType, fireClass);
      
      // Effective hit value: good extinguisher = more progress per hit
      const effectiveHitValue = 1 / multiplier;
      const prevHits = fireHitCount.get(idx) || 0;
      const newHits = prevHits + effectiveHitValue;
      fireHitCount.set(idx, newHits);
      
      const HITS_TO_EXTINGUISH = 5;
      const progress = Math.min(newHits / HITS_TO_EXTINGUISH, 1);
      
      // Show wrong-type visual feedback
      if (isWrong) {
        // Red flash on the fire emitter area
        const wrongFlash = BABYLON.MeshBuilder.CreatePlane('wrongFlash', { size: 2 }, scene);
        wrongFlash.position = fireEmitter.position.clone().addInPlace(new BABYLON.Vector3(0, 1.5, 0));
        wrongFlash.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        const wrongMat = new BABYLON.StandardMaterial('wrongFlashMat', scene);
        wrongMat.emissiveColor = new BABYLON.Color3(1, 0.2, 0);
        wrongMat.alpha = 0.6;
        wrongMat.disableLighting = true;
        wrongFlash.material = wrongMat;
        // Fade out
        let flashAlpha = 0.6;
        const flashObs = scene.onBeforeRenderObservable.add(() => {
          flashAlpha -= 0.03;
          if (flashAlpha <= 0) {
            wrongFlash.dispose();
            wrongMat.dispose();
            scene.onBeforeRenderObservable.remove(flashObs);
          } else {
            wrongMat.alpha = flashAlpha;
          }
        });
        toast.warning(message);
      }
      
      if (newHits >= HITS_TO_EXTINGUISH && fireSystem) {
        // PERMANENTLY extinguish this fire
        fireSystem.emitRate = 0;
        fireSystem.stop();
        if (smokeSystem) {
          smokeSystem.emitRate = 0;
          smokeSystem.stop();
        }
        // Dim the fire light
        const fireLight = scene.getLightByName(`fireLight_${idx}`);
        if (fireLight) fireLight.intensity = 0;
        // Remove heat haze
        const haze = scene.getMeshByName(`heatHaze_${idx}`);
        if (haze) haze.dispose();
        
        toast.success(`🔥➡️✅ Focolaio #${idx + 1} spento definitivamente!`);
        
        // Notify parent of extinguished fire count
        if (onFireExtinguished) {
          const totalFires = scene.meshes.filter(m => m.name.startsWith('fireEmitter_')).length;
          let extinguishedCount = 0;
          fireHitCount.forEach((h) => { if (h >= HITS_TO_EXTINGUISH) extinguishedCount++; });
          onFireExtinguished(extinguishedCount, totalFires);
        }
      } else if (fireSystem) {
        // Progressive reduction based on cumulative hits
        const reductionFactor = 1 - progress * 0.7; // Up to 70% reduction
        fireSystem.emitRate = Math.max(10, 120 * reductionFactor);
        fireSystem.maxSize = Math.max(0.15, 0.6 * reductionFactor);
        
        if (smokeSystem) {
          smokeSystem.emitRate = Math.max(3, 25 * reductionFactor);
        }
        
        // Fire light dims progressively
        const fireLight = scene.getLightByName(`fireLight_${idx}`);
        if (fireLight) {
          fireLight.intensity = 2 * reductionFactor;
        }
        
        // Show progress toast (only for correct/neutral type)
        if (!isWrong) {
          const effectiveRemaining = Math.ceil((HITS_TO_EXTINGUISH - newHits) * multiplier);
          toast.info(`🧯 Focolaio #${idx + 1}: ${Math.round(progress * 100)}% spento (~${effectiveRemaining} spruzzi rimasti)`);
        }
      }
      
      // Create impact steam at hit point
      const impactSteam = new BABYLON.ParticleSystem('impactSteam', 60, scene);
      const impactEmitter = BABYLON.MeshBuilder.CreateSphere('impactEmit', { diameter: 0.05 }, scene);
      impactEmitter.position = fireEmitter.position.clone().addInPlace(new BABYLON.Vector3(0, 0.3, 0));
      impactEmitter.isVisible = false;
      impactSteam.emitter = impactEmitter;
      impactSteam.particleTexture = new BABYLON.Texture(
        'https://assets.babylonjs.com/textures/flare.png', scene
      );
      impactSteam.color1 = new BABYLON.Color4(0.95, 0.95, 1.0, 0.4);
      impactSteam.color2 = new BABYLON.Color4(0.9, 0.9, 0.95, 0.2);
      impactSteam.colorDead = new BABYLON.Color4(1, 1, 1, 0);
      impactSteam.minSize = 0.2;
      impactSteam.maxSize = 0.8;
      impactSteam.minLifeTime = 0.5;
      impactSteam.maxLifeTime = 1.5;
      impactSteam.emitRate = 40;
      impactSteam.gravity = new BABYLON.Vector3(0, 1.5, 0);
      impactSteam.direction1 = new BABYLON.Vector3(-0.3, 1, -0.3);
      impactSteam.direction2 = new BABYLON.Vector3(0.3, 2, 0.3);
      impactSteam.minEmitPower = 0.3;
      impactSteam.maxEmitPower = 0.8;
      impactSteam.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
      impactSteam.start();
      
      setTimeout(() => {
        impactSteam.stop();
        setTimeout(() => {
          impactSteam.dispose();
          impactEmitter.dispose();
        }, 2000);
      }, 800);
    }
  });

  // Stop spray after a short burst
  setTimeout(() => {
    spray.stop();
    setTimeout(() => {
      spray.dispose();
      emitter.dispose();
    }, 1500);
  }, 600);
}

// === HAPTIC FEEDBACK (MOBILE) ===
// Vibration pattern differentiated by extinguisher type
function triggerHapticFeedback(extType: string) {
  if (!navigator.vibrate) return;
  try {
    switch (extType) {
      case 'co2':
        // Smooth sustained hiss — single long pulse
        navigator.vibrate(120);
        break;
      case 'powder':
        // Crackling bursts — rapid short pulses
        navigator.vibrate([30, 15, 30, 15, 40]);
        break;
      case 'foam':
        // Gurgling — medium pulsing pattern
        navigator.vibrate([50, 30, 60, 30, 50]);
        break;
      case 'water':
      default:
        // Pressurized jet — ramp pattern
        navigator.vibrate([20, 10, 40, 10, 60]);
        break;
    }
  } catch (e) { /* vibrate not available */ }
}

// === FIRE-CLASS AMBIENT SOUND SYSTEM (SPATIALIZED 3D) ===
// Looping ambient sounds with Web Audio PannerNode for 3D positioning
const fireAmbientContexts: AudioContext[] = [];

function startFireAmbientSound(
  fireClass: string,
  index: number,
  firePos: BABYLON.Vector3,
  cameraRef: React.RefObject<BABYLON.UniversalCamera | null>
) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    fireAmbientContexts.push(ctx);

    // Spatial panner for 3D positioning
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 2;
    panner.maxDistance = 25;
    panner.rolloffFactor = 1.5;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.positionX.setValueAtTime(firePos.x, ctx.currentTime);
    panner.positionY.setValueAtTime(firePos.y, ctx.currentTime);
    panner.positionZ.setValueAtTime(firePos.z, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;
    panner.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Update listener position from camera every 100ms
    const listenerInterval = setInterval(() => {
      if (ctx.state === 'closed') { clearInterval(listenerInterval); return; }
      const cam = cameraRef.current;
      if (!cam) return;
      try {
        const listener = ctx.listener;
        if (listener.positionX) {
          listener.positionX.setValueAtTime(cam.position.x, ctx.currentTime);
          listener.positionY.setValueAtTime(cam.position.y, ctx.currentTime);
          listener.positionZ.setValueAtTime(cam.position.z, ctx.currentTime);
          const fwd = cam.getDirection(BABYLON.Vector3.Forward());
          listener.forwardX.setValueAtTime(fwd.x, ctx.currentTime);
          listener.forwardY.setValueAtTime(fwd.y, ctx.currentTime);
          listener.forwardZ.setValueAtTime(fwd.z, ctx.currentTime);
          listener.upX.setValueAtTime(0, ctx.currentTime);
          listener.upY.setValueAtTime(1, ctx.currentTime);
          listener.upZ.setValueAtTime(0, ctx.currentTime);
        }
      } catch (e) {}
    }, 100);

    const playLoop = () => {
      if (ctx.state === 'closed') return;

      switch (fireClass) {
        case 'solid': {
          const duration = 2.0;
          const bufLen = Math.floor(ctx.sampleRate * duration);
          const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for (let i = 0; i < bufLen; i++) {
            const t = i / ctx.sampleRate;
            const crackle = Math.random() > 0.92 ? (Math.random() * 2 - 1) * 0.9 : 0;
            const base = Math.sin(t * 80) * 0.05 * Math.random();
            ch[i] = crackle + base;
          }
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 2500 + index * 200;
          bp.Q.value = 0.8;
          src.connect(bp).connect(panner);
          src.start();
          src.onended = () => setTimeout(playLoop, 100 + Math.random() * 200);
          break;
        }
        case 'liquid': {
          const duration = 2.5;
          const bufLen = Math.floor(ctx.sampleRate * duration);
          const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for (let i = 0; i < bufLen; i++) {
            const t = i / ctx.sampleRate;
            const roar = (Math.random() * 2 - 1) * (0.4 + 0.3 * Math.sin(t * 3));
            const pop = Math.random() > 0.97 ? Math.random() * 0.8 : 0;
            ch[i] = roar + pop;
          }
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 600;
          src.connect(lp).connect(panner);
          src.start();
          src.onended = () => setTimeout(playLoop, 50 + Math.random() * 150);
          break;
        }
        case 'electrical': {
          const duration = 1.8;
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, ctx.currentTime);
          for (let t = 0; t < duration; t += 0.15) {
            const freq = 50 + Math.random() * 30 + (Math.random() > 0.7 ? Math.random() * 200 : 0);
            osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
          }
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 120;
          bp.Q.value = 2;
          const noiseBufLen = Math.floor(ctx.sampleRate * duration);
          const noiseBuf = ctx.createBuffer(1, noiseBufLen, ctx.sampleRate);
          const noiseCh = noiseBuf.getChannelData(0);
          for (let i = 0; i < noiseBufLen; i++) {
            noiseCh[i] = Math.random() > 0.95 ? (Math.random() * 2 - 1) * 0.6 : 0;
          }
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;
          const noiseHp = ctx.createBiquadFilter();
          noiseHp.type = 'highpass';
          noiseHp.frequency.value = 2000;
          const noiseGain = ctx.createGain();
          noiseGain.gain.value = 0.15;
          noiseSrc.connect(noiseHp).connect(noiseGain).connect(panner);
          osc.connect(bp).connect(panner);
          osc.start();
          osc.stop(ctx.currentTime + duration);
          noiseSrc.start();
          noiseSrc.stop(ctx.currentTime + duration);
          osc.onended = () => setTimeout(playLoop, 80 + Math.random() * 200);
          break;
        }
        default: {
          const duration = 2.0;
          const bufLen = Math.floor(ctx.sampleRate * duration);
          const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for (let i = 0; i < bufLen; i++) ch[i] = (Math.random() * 2 - 1) * 0.3;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 1500;
          src.connect(lp).connect(panner);
          src.start();
          src.onended = () => setTimeout(playLoop, 100 + Math.random() * 200);
          break;
        }
      }
    };

    setTimeout(playLoop, 500 + index * 300);
  } catch (e) { /* audio not available */ }
}

// === FIRE-CLASS VISUAL INDICATOR ===
// Floating icon+label billboard above each fire source
function createFireClassIndicator(
  scene: BABYLON.Scene,
  firePos: BABYLON.Vector3,
  fireClass: string,
  index: number
) {
  const classConfig: Record<string, { icon: string; label: string; color: BABYLON.Color3; glowColor: BABYLON.Color3 }> = {
    electrical: {
      icon: '⚡',
      label: 'ELETTRICO',
      color: new BABYLON.Color3(0.2, 0.6, 1),      // Electric blue
      glowColor: new BABYLON.Color3(0.1, 0.4, 1),
    },
    solid: {
      icon: '🪵',
      label: 'SOLIDO',
      color: new BABYLON.Color3(0.9, 0.5, 0.1),     // Wood orange
      glowColor: new BABYLON.Color3(0.8, 0.4, 0),
    },
    liquid: {
      icon: '💧',
      label: 'LIQUIDO',
      color: new BABYLON.Color3(0.1, 0.8, 0.9),     // Fluid cyan
      glowColor: new BABYLON.Color3(0, 0.6, 0.8),
    },
    gas: {
      icon: '💨',
      label: 'GAS',
      color: new BABYLON.Color3(0.6, 0.6, 0.6),     // Gray
      glowColor: new BABYLON.Color3(0.4, 0.4, 0.4),
    },
  };

  const cfg = classConfig[fireClass] || classConfig.solid;

  // Dynamic texture for the indicator
  const texSize = 256;
  const dt = new BABYLON.DynamicTexture(`fireClassTex_${index}`, { width: texSize, height: texSize / 2 }, scene, false);
  const dtCtx = dt.getContext();

  // Draw icon + label
  dtCtx.clearRect(0, 0, texSize, texSize / 2);
  // Background pill
  dtCtx.fillStyle = `rgba(0, 0, 0, 0.6)`;
  dtCtx.beginPath();
  const pillH = texSize / 2 - 20;
  const pillW = texSize - 20;
  const radius = 20;
  dtCtx.moveTo(10 + radius, 10);
  dtCtx.lineTo(10 + pillW - radius, 10);
  dtCtx.quadraticCurveTo(10 + pillW, 10, 10 + pillW, 10 + radius);
  dtCtx.lineTo(10 + pillW, 10 + pillH - radius);
  dtCtx.quadraticCurveTo(10 + pillW, 10 + pillH, 10 + pillW - radius, 10 + pillH);
  dtCtx.lineTo(10 + radius, 10 + pillH);
  dtCtx.quadraticCurveTo(10, 10 + pillH, 10, 10 + pillH - radius);
  dtCtx.lineTo(10, 10 + radius);
  dtCtx.quadraticCurveTo(10, 10, 10 + radius, 10);
  dtCtx.closePath();
  dtCtx.fill();

  // Border glow
  const r = Math.round(cfg.color.r * 255);
  const g = Math.round(cfg.color.g * 255);
  const b = Math.round(cfg.color.b * 255);
  dtCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
  dtCtx.lineWidth = 3;
  dtCtx.stroke();

  // Icon
  dtCtx.font = 'bold 48px Arial';
  (dtCtx as any).textAlign = 'center';
  dtCtx.fillStyle = 'white';
  dtCtx.fillText(cfg.icon, 55, 85);

  // Label
  dtCtx.font = 'bold 28px Arial';
  dtCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  (dtCtx as any).textAlign = 'center';
  dtCtx.fillText(cfg.label, 165, 85);

  dt.update();

  // Billboard plane
  const plane = BABYLON.MeshBuilder.CreatePlane(`fireClassIndicator_${index}`, {
    width: 1.6,
    height: 0.8,
  }, scene);
  plane.position = firePos.addInPlace(new BABYLON.Vector3(0, 3.2, 0));
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  const mat = new BABYLON.StandardMaterial(`fireClassMat_${index}`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = cfg.color.scale(0.4);
  mat.opacityTexture = dt;
  mat.backFaceCulling = false;
  mat.disableLighting = true;
  mat.useAlphaFromDiffuseTexture = true;
  plane.material = mat;

  // Small colored point light for glow
  const indicatorLight = new BABYLON.PointLight(`fireClassLight_${index}`, plane.position.clone(), scene);
  indicatorLight.diffuse = cfg.glowColor;
  indicatorLight.intensity = 0.5;
  indicatorLight.range = 3;

  // Floating + pulsing animation
  const baseY = plane.position.y;
  scene.registerBeforeRender(() => {
    const t = Date.now() * 0.001;
    plane.position.y = baseY + Math.sin(t * 1.5 + index * 2) * 0.15;
    // Pulse scale
    const pulse = 1 + Math.sin(t * 3 + index) * 0.08;
    plane.scaling = new BABYLON.Vector3(pulse, pulse, 1);
    indicatorLight.intensity = 0.4 + Math.sin(t * 2.5 + index) * 0.15;
  });
}

// === EXTINGUISHER SOUND EFFECTS ===
// Each type has a unique sound synthesized via Web Audio API
function playExtinguisherSound(type: string) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'co2': {
        // Hissing gas release — white noise through high-pass filter
        const bufferSize = ctx.sampleRate * 0.6;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(3000, ctx.currentTime);
        hp.frequency.linearRampToValueAtTime(5000, ctx.currentTime + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        noise.connect(hp).connect(gain).connect(masterGain);
        noise.start(); noise.stop(ctx.currentTime + 0.6);
        break;
      }
      case 'powder': {
        // Crackling bursts — rapid noise pulses with bandpass
        const bufLen = ctx.sampleRate * 0.5;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          // Crackling: random bursts with gaps
          ch[i] = (Math.random() > 0.6 ? (Math.random() * 2 - 1) * 0.8 : 0) * Math.random();
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1200;
        bp.Q.value = 1.5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        src.connect(bp).connect(gain).connect(masterGain);
        src.start(); src.stop(ctx.currentTime + 0.5);
        break;
      }
      case 'foam': {
        // Gurgling/bubbling — low-freq modulated noise
        const bufLen = ctx.sampleRate * 0.7;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          const t = i / ctx.sampleRate;
          // Bubbling: noise modulated by low-freq sine
          ch[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(t * 25 * Math.PI));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(800, ctx.currentTime);
        lp.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.28, ctx.currentTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        src.connect(lp).connect(gain).connect(masterGain);
        src.start(); src.stop(ctx.currentTime + 0.7);
        break;
      }
      case 'water':
      default: {
        // Pressurized water jet — shaped noise with resonant filter
        const bufLen = ctx.sampleRate * 0.5;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) ch[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(600, ctx.currentTime);
        bp.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.2);
        bp.Q.value = 0.8;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        src.connect(bp).connect(lp).connect(gain).connect(masterGain);
        src.start(); src.stop(ctx.currentTime + 0.5);
        break;
      }
    }
    setTimeout(() => ctx.close(), 1500);
  } catch (e) { /* audio not available */ }
}
