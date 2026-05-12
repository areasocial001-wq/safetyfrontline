import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { SkyMaterial } from '@babylonjs/materials/sky';
import { Scenario3D } from '@/data/scenarios3d';
import type { AudioSettings } from '@/hooks/useGraphicsSettings';

export interface SceneContext {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.UniversalCamera;
  shadowGenerator: BABYLON.ShadowGenerator | null;
}

/**
 * Create the Babylon.js engine, scene, camera, lighting, post-processing, ground, and boundaries.
 */
export function createScene(
  canvas: HTMLCanvasElement,
  scenario: Scenario3D,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  audioSettings: AudioSettings
): SceneContext {
  // Create engine
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: quality === 'high' || quality === 'ultra',
    powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
  });

  // Create scene
  const scene = new BABYLON.Scene(engine);

  // Scenario-specific atmosphere presets
  const atmospherePresets: Record<string, {
    clearColor: BABYLON.Color4;
    fogDensity: number;
    fogColor: BABYLON.Color3;
  }> = {
    office: {
      clearColor: new BABYLON.Color4(0.88, 0.90, 0.93, 1),
      fogDensity: 0.002,
      fogColor: new BABYLON.Color3(0.88, 0.90, 0.93),
    },
    warehouse: {
      clearColor: new BABYLON.Color4(0.12, 0.15, 0.22, 1),
      fogDensity: 0.006,
      fogColor: new BABYLON.Color3(0.12, 0.15, 0.22),
    },
    construction: {
      // Open-air sky atmosphere — replaces the old brown haze.
      // The actual sky dome is built below via SkyMaterial.
      clearColor: new BABYLON.Color4(0.55, 0.72, 0.88, 1),
      fogDensity: 0.0035,
      fogColor: new BABYLON.Color3(0.78, 0.84, 0.92),
    },
    laboratory: {
      // Cooler neutral atmosphere — warm brown was hiding floor/wall contrast
      // and merging everything into a brown haze. Fire glow is added per-light.
      clearColor: new BABYLON.Color4(0.42, 0.44, 0.48, 1),
      fogDensity: 0.0015,
      fogColor: new BABYLON.Color3(0.50, 0.52, 0.56),
    },
  };
  const atmo = atmospherePresets[scenario.type] || atmospherePresets.warehouse;
  scene.clearColor = atmo.clearColor;

  // Limit simultaneous lights to prevent GL_MAX_VERTEX_UNIFORM_BUFFERS overflow
  // WebGL has a hard limit of ~12 uniform blocks; each light uses 1-2 blocks
  // HemisphericLight(1) + DirectionalLight(1) + max 2 PointLights = 4 lights total
  // We enforce this by only creating 2 supplementary PointLights in environment-props

  // Subtle fog for depth
  scene.fogEnabled = true;
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = atmo.fogDensity;
  scene.fogColor = atmo.fogColor;

  // Create camera (First Person)
  // For office, spawn near south wall looking north toward the open room
  // (avoids spawning inside a workstation desk).
  const spawnPos = scenario.type === 'office'
    ? new BABYLON.Vector3(0, 1.7, 12)
    : new BABYLON.Vector3(0, 1.7, -5);
  const camera = new BABYLON.UniversalCamera('camera', spawnPos, scene);
  if (scenario.type === 'office') {
    camera.setTarget(new BABYLON.Vector3(0, 1.5, 0));
  }
  camera.attachControl(canvas, true);
  camera.speed = 0.3;
  camera.angularSensibility = audioSettings.mouseSensitivity || 500;
  camera.keysUp = [87]; // W
  camera.keysDown = [83]; // S
  camera.keysLeft = [65]; // A
  camera.keysRight = [68]; // D
  camera.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.9, 0);
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.minZ = 0.1;

  // Setup lighting
  setupLighting(scene, scenario.type, quality);

  // Setup post-processing
  const shadowGenerator = setupShadows(scene, quality);
  if (quality !== 'low') {
    setupPostProcessing(scene, camera, scenario.type);
  }

  // Create ground
  createGround(scene);

  // Open-sky dome for outdoor scenarios (construction)
  if (scenario.type === 'construction') {
    createSkyDome(scene);
  }

  // Create boundary walls
  createBoundaries(scene);

  return { engine, scene, camera, shadowGenerator };
}

function createSkyDome(scene: BABYLON.Scene) {
  const skyMaterial = new SkyMaterial('skyMaterial', scene);
  skyMaterial.backFaceCulling = false;
  // Mid-morning sun, clear sky
  skyMaterial.turbidity = 8;
  skyMaterial.luminance = 0.4;
  skyMaterial.rayleigh = 2;
  skyMaterial.mieDirectionalG = 0.85;
  skyMaterial.mieCoefficient = 0.005;
  skyMaterial.useSunPosition = false;
  skyMaterial.inclination = 0.35;
  skyMaterial.azimuth = 0.25;

  const skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 800 }, scene);
  skybox.material = skyMaterial;
  skybox.infiniteDistance = true;
  skybox.isPickable = false;
  skybox.checkCollisions = false;
  skybox.applyFog = false;
}

function setupLighting(scene: BABYLON.Scene, scenarioType: string, quality: string) {
  const lightingPresets: Record<string, {
    ambientIntensity: number;
    ambientDiffuse: BABYLON.Color3;
    ambientGround: BABYLON.Color3;
    dirIntensity: number;
    dirDiffuse: BABYLON.Color3;
  }> = {
    office: {
      ambientIntensity: 0.95,
      ambientDiffuse: new BABYLON.Color3(0.97, 0.95, 0.90),
      ambientGround: new BABYLON.Color3(0.42, 0.40, 0.36),
      dirIntensity: 0.75,
      dirDiffuse: new BABYLON.Color3(1.0, 0.96, 0.88),
    },
    warehouse: {
      ambientIntensity: 0.55,
      ambientDiffuse: new BABYLON.Color3(0.65, 0.7, 0.8),
      ambientGround: new BABYLON.Color3(0.25, 0.27, 0.32),
      dirIntensity: 0.9,
      dirDiffuse: new BABYLON.Color3(0.85, 0.88, 0.95),
    },
    construction: {
      ambientIntensity: 0.35,
      ambientDiffuse: new BABYLON.Color3(1.0, 0.75, 0.45),
      ambientGround: new BABYLON.Color3(0.3, 0.15, 0.05),
      dirIntensity: 2.2,
      dirDiffuse: new BABYLON.Color3(1.0, 0.70, 0.35),
    },
    laboratory: {
      // Bright neutral fill so floor, walls, racks and boxes are clearly readable.
      // The warm fire glow is added per-light by individual fire emitters.
      ambientIntensity: 1.05,
      ambientDiffuse: new BABYLON.Color3(0.92, 0.94, 1.0),
      ambientGround: new BABYLON.Color3(0.40, 0.42, 0.46),
      dirIntensity: 1.4,
      dirDiffuse: new BABYLON.Color3(1.0, 0.96, 0.88),
    },
  };
  const lp = lightingPresets[scenarioType] || lightingPresets.warehouse;

  const ambientLight = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), scene);
  ambientLight.intensity = lp.ambientIntensity;
  ambientLight.diffuse = lp.ambientDiffuse;
  ambientLight.groundColor = lp.ambientGround;

  const directionalLight = new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(-1, -2.5, -1), scene);
  directionalLight.position = new BABYLON.Vector3(20, 50, 20);
  directionalLight.intensity = lp.dirIntensity;
  directionalLight.diffuse = lp.dirDiffuse;
}

function setupShadows(scene: BABYLON.Scene, quality: string): BABYLON.ShadowGenerator | null {
  if (quality === 'low') return null;

  const dirLight = scene.getLightByName('directionalLight') as BABYLON.DirectionalLight;
  if (!dirLight) return null;

  const mapSize = quality === 'ultra' ? 2048 : 1024;
  const shadowGenerator = new BABYLON.ShadowGenerator(mapSize, dirLight);
  shadowGenerator.usePercentageCloserFiltering = true;
  shadowGenerator.filteringQuality = quality === 'ultra'
    ? BABYLON.ShadowGenerator.QUALITY_HIGH
    : BABYLON.ShadowGenerator.QUALITY_MEDIUM;
  shadowGenerator.darkness = 0.6;
  return shadowGenerator;
}

function setupPostProcessing(scene: BABYLON.Scene, camera: BABYLON.UniversalCamera, scenarioType: string) {
  const pipeline = new BABYLON.DefaultRenderingPipeline('cinematicPipeline', true, scene, [camera]);

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
      bloomEnabled: true, bloomThreshold: 0.85, bloomWeight: 0.15, bloomKernel: 32, bloomScale: 0.3,
      chromaticAberration: 4,
      contrast: 1.3, exposure: 0.95,
      vignetteEnabled: true, vignetteWeight: 1.0, vignetteFov: 0.9,
      saturation: 10, globalExposure: 0.1,
      glowIntensity: 0.3,
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
      // Disabled vignette + reduced bloom: floor/walls were merging into a brown blob
      bloomEnabled: true, bloomThreshold: 0.95, bloomWeight: 0.18, bloomKernel: 32, bloomScale: 0.4,
      chromaticAberration: 0,
      contrast: 1.05, exposure: 1.05,
      vignetteEnabled: false, vignetteWeight: 0, vignetteFov: 0,
      saturation: 8, globalExposure: 0.05,
      glowIntensity: 1.0,
    },
  };
  const pp = ppPresets[scenarioType] || ppPresets.warehouse;

  pipeline.bloomEnabled = pp.bloomEnabled;
  pipeline.bloomThreshold = pp.bloomThreshold;
  pipeline.bloomWeight = pp.bloomWeight;
  pipeline.bloomKernel = pp.bloomKernel;
  pipeline.bloomScale = pp.bloomScale;

  pipeline.chromaticAberrationEnabled = true;
  pipeline.chromaticAberration.aberrationAmount = pp.chromaticAberration;

  pipeline.imageProcessingEnabled = true;
  const imageProcessing = pipeline.imageProcessing;
  imageProcessing.contrast = pp.contrast;
  imageProcessing.exposure = pp.exposure;
  imageProcessing.toneMappingEnabled = true;
  imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

  imageProcessing.vignetteEnabled = pp.vignetteEnabled;
  if (pp.vignetteEnabled) {
    imageProcessing.vignetteWeight = pp.vignetteWeight;
    imageProcessing.vignetteCameraFov = pp.vignetteFov;
  }

  imageProcessing.colorCurvesEnabled = true;
  const colorCurves = new BABYLON.ColorCurves();
  colorCurves.globalSaturation = pp.saturation;
  colorCurves.globalExposure = pp.globalExposure;
  imageProcessing.colorCurves = colorCurves;

  // NOTE: GlowLayer removed from here — single glow layer is created in BabylonScene.tsx
  // Having multiple GlowLayers contributes to GL_MAX_VERTEX_UNIFORM_BUFFERS overflow
}

function createGround(scene: BABYLON.Scene) {
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.35, 0.37, 0.4);
  groundMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  groundMat.specularPower = 32;
  ground.material = groundMat;
  ground.checkCollisions = true;
  ground.receiveShadows = true;
}

function createBoundaries(scene: BABYLON.Scene) {
  const wallHeight = 8;
  const wallThickness = 0.5;
  const arenaSize = 24;
  const wallConfigs = [
    { name: 'wall_north', w: arenaSize * 2, h: wallHeight, d: wallThickness, x: 0, y: wallHeight / 2, z: -arenaSize },
    { name: 'wall_south', w: arenaSize * 2, h: wallHeight, d: wallThickness, x: 0, y: wallHeight / 2, z: arenaSize },
    { name: 'wall_east', w: wallThickness, h: wallHeight, d: arenaSize * 2, x: arenaSize, y: wallHeight / 2, z: 0 },
    { name: 'wall_west', w: wallThickness, h: wallHeight, d: arenaSize * 2, x: -arenaSize, y: wallHeight / 2, z: 0 },
  ];
  wallConfigs.forEach(cfg => {
    const wall = BABYLON.MeshBuilder.CreateBox(cfg.name, { width: cfg.w, height: cfg.h, depth: cfg.d }, scene);
    wall.position = new BABYLON.Vector3(cfg.x, cfg.y, cfg.z);
    wall.isVisible = false;
    wall.checkCollisions = true;
    wall.isPickable = false;
  });
  const ceiling = BABYLON.MeshBuilder.CreateGround('ceiling', { width: arenaSize * 2, height: arenaSize * 2 }, scene);
  ceiling.position.y = wallHeight;
  ceiling.isVisible = false;
  ceiling.checkCollisions = true;
  ceiling.isPickable = false;
}
