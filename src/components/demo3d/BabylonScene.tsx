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
import { Archive, Drum, Construction, ShieldAlert, Package2, Cog, FlaskConical, Monitor, Cable, Flame, DoorOpen, Droplets, Library, Lightbulb, LucideIcon } from 'lucide-react';

// Friendly tooltip icon mapping for hazard meshes (multilingual-friendly: icons + simple words)
const TOOLTIP_ICONS: Record<string, LucideIcon> = {
  cable: Cable,
  extinguisher: Flame,
  exit: DoorOpen,
  puddle: Droplets,
  shelf: Library,
  emlight: Lightbulb,
};
import type { AudioSettings, VisualSettings } from '@/hooks/useGraphicsSettings';
import { loadGLTFProps } from '@/lib/babylon-prop-loader';
import { loadProceduralProps } from '@/lib/babylon-procedural-props';
import { SCENARIO_PROPS, SCENARIO_PROCEDURAL_PROPS } from '@/types/prop-config';
import { NPCAmbientSoundSystem } from '@/lib/npc-ambient-sounds';

// Scene modules
import { createScene } from './scene-modules/scene-setup';
import { loadEnvironmentOptimized } from './scene-modules/environment-loader';
import { createParticleEffect, playRiskSound, fireAmbientContexts } from './scene-modules/audio-helpers';
import { createFirstPersonExtinguisher, shootExtinguisherSpray, aimHasFire } from './scene-modules/extinguisher-system';
import { addEnvironmentalProps } from './scene-modules/environment-props';
import { addWorkerAvatars } from './scene-modules/worker-avatars';
import { addSafetySignage } from './scene-modules/safety-signage';
import { LODSystem } from './scene-modules/lod-system';

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
  visualSettings?: VisualSettings;
  briefingActive?: boolean;
  onBriefingStep?: (index: number, total: number) => void;
  onBriefingComplete?: () => void;
  uniformFillConfig?: Partial<import('./scene-modules/uniform-fill-config').UniformFillConfig>;
  onAimAtFire?: (aiming: boolean) => void;
  onAimAtFireIndex?: (index: number | null) => void;
  /** "readable" boosts visibility (less fog, less bloom, neutral exposure) */
  readabilityMode?: boolean;
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
  visualSettings,
  briefingActive = false,
  onBriefingStep,
  onBriefingComplete,
  uniformFillConfig,
  onAimAtFire,
  onAimAtFireIndex,
  readabilityMode = false,
}: BabylonSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.UniversalCamera | null>(null);
  const soundtrackRef = useRef<AtmosphericSoundtrack | null>(null);
  const ambientAudioRef = useRef<AmbientAudioPlayer | null>(null);
  const npcSoundSystemRef = useRef<NPCAmbientSoundSystem | null>(null);
  const lodSystemRef = useRef<LODSystem | null>(null);
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
  const highlightLayerRef = useRef<BABYLON.HighlightLayer | null>(null);
  const riskMeshMapRef = useRef<Map<string, BABYLON.Mesh[]>>(new Map());
  const hoveredRiskRef = useRef<string | null>(null);
  const baseImageProcRef = useRef<{ exposure: number; contrast: number } | null>(null);
  const originalMatColorsRef = useRef<Map<string, BABYLON.Color3>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const extChargeRef = useRef({ current: 100, max: 100 });
  const fireHitCountRef = useRef<Map<number, number>>(new Map());
  const extinguisherTypeRef = useRef<ExtinguisherType | undefined>(extinguisherType);
  useEffect(() => { extinguisherTypeRef.current = extinguisherType; }, [extinguisherType]);
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
  const [hoverLabel, setHoverLabel] = useState<{ label: string; severity: string; x: number; y: number } | null>(null);
  const [guideOverlay, setGuideOverlay] = useState<{ label: string; description: string; normative: string; severity: string } | null>(null);
  const [guideMode, setGuideMode] = useState(true);
  const guideModeRef = useRef(true);
  const guideOverlayActiveRef = useRef(false);
  useEffect(() => { guideModeRef.current = guideMode; }, [guideMode]);

  // Derive normative reference from risk content
  const deriveNormative = (label: string, description: string, severity: string): string => {
    const text = (label + ' ' + description).toLowerCase();
    if (text.includes('estintore') || text.includes('antincend') || text.includes('incendio') || text.includes('fuoco')) {
      return 'D.M. 10/03/1998 e D.Lgs. 81/08 art. 46 — gli estintori devono essere accessibili, segnalati, controllati periodicamente e mai ostruiti.';
    }
    if (text.includes('uscita') || text.includes('via di fuga') || text.includes('evacuaz') || text.includes('emergenza')) {
      return 'D.Lgs. 81/08 Allegato IV §1.5 — le vie e uscite di emergenza devono restare sgombre e consentire l\'evacuazione rapida e sicura.';
    }
    if (text.includes('cavo') || text.includes('elettric') || text.includes('multipresa') || text.includes('folgoraz')) {
      return 'D.Lgs. 81/08 Titolo III Capo III + CEI 64-8 — impianti e cavi devono essere protetti da contatti diretti/indiretti e mantenuti in efficienza.';
    }
    if (text.includes('scaffal') || text.includes('instabil') || text.includes('ribalt') || text.includes('crollo')) {
      return 'D.Lgs. 81/08 art. 64 e Allegato IV — strutture e scaffalature devono essere stabili, ancorate e di portata adeguata al carico.';
    }
    if (text.includes('dpi') || text.includes('casco') || text.includes('protezione individuale')) {
      return 'D.Lgs. 81/08 Titolo III Capo II artt. 74-79 — obbligo di uso dei DPI conformi al rischio specifico della mansione.';
    }
    if (text.includes('ponteggio') || text.includes('lavoro in quota') || text.includes('quota')) {
      return 'D.Lgs. 81/08 Titolo IV Capo II — ponteggi e lavori in quota richiedono progetto, montaggio Pi.M.U.S. e parapetti normati.';
    }
    if (text.includes('scavo') || text.includes('trincea')) {
      return 'D.Lgs. 81/08 artt. 118-121 — scavi e trincee oltre 1,5 m devono avere armature/parapetti e segnalazione perimetrale.';
    }
    if (text.includes('carrello') || text.includes('mulett') || text.includes('escavator') || text.includes('bulldozer') || text.includes('dumper') || text.includes('betoniera') || text.includes('macchin')) {
      return 'D.Lgs. 81/08 artt. 71-73 + Allegato VI — attrezzature di lavoro: abilitazione operatore, segnalazione zone di manovra e moviere a terra.';
    }
    if (text.includes('pavimento') || text.includes('scivol') || text.includes('liquido') || text.includes('bagnat')) {
      return 'D.Lgs. 81/08 Allegato IV §1.3 — i pavimenti devono essere asciutti, antiscivolo e segnalati se temporaneamente pericolosi.';
    }
    if (text.includes('password') || text.includes('phishing') || text.includes('usb') || text.includes('schermo') || text.includes('cyber') || text.includes('gdpr')) {
      return 'GDPR Reg. UE 2016/679 art. 32 + ISO/IEC 27001 — misure tecniche e organizzative per proteggere dati e credenziali da accessi non autorizzati.';
    }
    return severity === 'critical'
      ? 'D.Lgs. 81/08 art. 15 — misure generali di tutela: eliminazione del rischio alla fonte e priorità alla protezione collettiva.'
      : 'D.Lgs. 81/08 art. 28 — il rischio va valutato e ridotto attraverso il DVR e procedure operative aggiornate.';
  };

  // Close NPC dialog with ESC key
  useEffect(() => {
    if (!activeNPCRole) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveNPCRole(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeNPCRole]);

  // === MAIN SCENE SETUP ===
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Create engine, scene, camera, lighting, post-processing via module
    const ctx = createScene(canvasRef.current, scenario, quality, audioSettings);
    engineRef.current = ctx.engine;
    sceneRef.current = ctx.scene;
    cameraRef.current = ctx.camera;
    const { engine, scene, camera, shadowGenerator } = ctx;

    // Store scenario ID + uniform-fill config in scene metadata
    scene.metadata = { ...scene.metadata, scenarioId: scenario.id, uniformFillConfig };
    // Expose live refs for the SceneDebugOverlay
    (window as unknown as { __activeBabylon?: unknown }).__activeBabylon = { scene, camera, engine };

    // Camera presets listener (used by CameraPresetsPanel for the construction scenario)
    const PRESETS: Record<string, { pos: BABYLON.Vector3; target: BABYLON.Vector3 }> = {
      pedestrian: { pos: new BABYLON.Vector3(0, 1.7, 0), target: new BABYLON.Vector3(0, 1.7, 5) },
      drone: { pos: new BABYLON.Vector3(0, 28, -22), target: new BABYLON.Vector3(0, 0, 0) },
      excavator: { pos: new BABYLON.Vector3(18, 6, -8), target: new BABYLON.Vector3(12, 2, -15) },
      truck: { pos: new BABYLON.Vector3(-2, 5, 18), target: new BABYLON.Vector3(-6, 1.5, 12) },
    };
    const handleCamPreset = (e: Event) => {
      const detail = (e as CustomEvent).detail as { name?: string };
      const cam = cameraRef.current;
      if (!cam || !detail?.name) return;
      const preset = PRESETS[detail.name];
      if (!preset) return;
      const ease = new BABYLON.CubicEase();
      ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      BABYLON.Animation.CreateAndStartAnimation(
        'camPos', cam, 'position', 60, 36, cam.position.clone(), preset.pos.clone(),
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, ease
      );
      cam.setTarget(preset.target.clone());
    };
    window.addEventListener('babylon-camera-preset', handleCamPreset);
    const cleanupCamPresetRef = handleCamPreset;
    (scene as unknown as { __camPresetCleanup?: () => void }).__camPresetCleanup = () => {
      window.removeEventListener('babylon-camera-preset', cleanupCamPresetRef);
    };

    // 2. First-person extinguisher (laboratory only)
    if (scenario.type === 'laboratory' && extinguisherType) {
      createFirstPersonExtinguisher(scene, camera, extinguisherType);
      extChargeRef.current = { current: 100, max: 100 };
      onChargeChange?.(100, 100);
    }

    // 3. Load GLTF environment
    loadEnvironmentOptimized(scene, scenario.type, quality, shadowGenerator);

    // 4. Initialize NPC ambient sound system
    const npcSounds = new NPCAmbientSoundSystem();
    npcSounds.init(() => {
      const cam = cameraRef.current;
      return cam ? { x: cam.position.x, y: cam.position.y, z: cam.position.z } : { x: 0, y: 0, z: 0 };
    });
    npcSoundSystemRef.current = npcSounds;

    // 5. Add environmental props (shelving, forklifts, construction, lab fire sim)
    addEnvironmentalProps(scene, scenario.type, quality, shadowGenerator, risksFoundIds, onFirePropagationChange, ambientAudioRef, onSprinklerStatusChange, cameraRef, npcSoundSystemRef);

    // 6. Add worker avatars (NPCs with GLB models, idle behaviors, walking)
    addWorkerAvatars(scene, scenario.type, quality, shadowGenerator, npcSounds);

    // 7. Add safety signage (warning signs, extinguishers, exits, stripes, first aid)
    addSafetySignage(scene, scenario.type, quality, shadowGenerator);

    // 8. Load procedural + GLTF props from config
    const proceduralProps = SCENARIO_PROCEDURAL_PROPS[scenario.type] || [];
    if (proceduralProps.length > 0) {
      loadProceduralProps(scene, proceduralProps, shadowGenerator)
        .then(() => console.log('[BabylonScene] ✓ Procedural props created'))
        .catch(err => console.error('[BabylonScene] ✗ Procedural props failed:', err));
    }
    const props = SCENARIO_PROPS[scenario.type] || [];
    if (props.length > 0) {
      loadGLTFProps(scene, props, quality, shadowGenerator)
        .then(() => console.log('[BabylonScene] ✓ GLTF props loaded'))
        .catch(err => console.error('[BabylonScene] ✗ GLTF props failed:', err));
    }

    // 9. Initialize LOD system after a short delay to catch all loaded meshes
    const lodSystem = new LODSystem(scene, quality);
    lodSystemRef.current = lodSystem;
    setTimeout(() => {
      const count = lodSystem.registerSceneMeshes();
      console.log(`[BabylonScene] LOD system active: ${count} meshes managed`);
    }, 2000);

    // 10. Create risk markers
    const riskGlow = new BABYLON.GlowLayer('riskGlow', scene);
    riskGlow.intensity = 1.5;

    // Highlight layer for hover/click feedback on risk meshes
    const highlightLayer = new BABYLON.HighlightLayer('riskHighlight', scene, {
      blurHorizontalSize: 1.5,
      blurVerticalSize: 1.5,
    });
    highlightLayer.innerGlow = false;
    highlightLayer.outerGlow = true;
    highlightLayerRef.current = highlightLayer;
    riskMeshMapRef.current = new Map();

    const riskMeshes = scenario.risks.map((risk) => {
      const createContextualHazard = (): BABYLON.Mesh => {
        const label = risk.label.toLowerCase();
        if (label.includes('cavo') || label.includes('multipresa') || label.includes('elettric')) {
          const wire = BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_wire`, { height: 2.5, diameter: 0.12, tessellation: 8 }, scene);
          wire.rotation.z = Math.PI / 2 + 0.15;
          return wire;
        }
        if (label.includes('uscita') || label.includes('ostrui') || label.includes('via di fuga') || label.includes('bloccata') || label.includes('scatolon')) {
          return BABYLON.MeshBuilder.CreateBox(`${risk.id}_boxes`, { width: 1.8, height: 1.2, depth: 1.0 }, scene);
        }
        if (label.includes('estintore') || label.includes('antincendio')) {
          return BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_ext`, { height: 0.9, diameter: 0.3, tessellation: 16 }, scene);
        }
        if (label.includes('liquido') || label.includes('scivolos') || label.includes('versato') || label.includes('pavimento')) {
          const puddle = BABYLON.MeshBuilder.CreateDisc(`${risk.id}_puddle`, { radius: 1.2, tessellation: 24 }, scene);
          puddle.rotation.x = Math.PI / 2;
          puddle.position.y += 0.02;
          const puddleMat = new BABYLON.StandardMaterial(`${risk.id}_puddleMat`, scene);
          puddleMat.diffuseColor = new BABYLON.Color3(0.35, 0.5, 0.7);
          puddleMat.alpha = 0.65;
          puddle.material = puddleMat;
          return puddle;
        }
        if (label.includes('scaffal') || label.includes('instabil') || label.includes('carico')) {
          const shelf = BABYLON.MeshBuilder.CreateBox(`${risk.id}_shelf`, { width: 2.0, height: 2.5, depth: 0.6 }, scene);
          shelf.rotation.z = 0.12;
          return shelf;
        }
        if (label.includes('incendio') || label.includes('fuoco') || label.includes('infiammab') || label.includes('focolaio')) {
          return BABYLON.MeshBuilder.CreateCylinder(`${risk.id}_barrel`, { height: 1.0, diameter: 0.6, tessellation: 16 }, scene);
        }
        return BABYLON.MeshBuilder.CreateBox(risk.id, { width: 0.8, height: 0.8, depth: 0.8 }, scene);
      };

      const marker = createContextualHazard();
      marker.position = new BABYLON.Vector3(risk.position[0], risk.position[1], risk.position[2]);
      marker.isPickable = true;
      marker.metadata = { riskId: risk.id };

      const severityColors: Record<string, { emissive: BABYLON.Color3; diffuse: BABYLON.Color3 }> = {
        critical: { emissive: new BABYLON.Color3(0.7, 0.05, 0), diffuse: new BABYLON.Color3(0.85, 0.15, 0.1) },
        high: { emissive: new BABYLON.Color3(0.6, 0.25, 0), diffuse: new BABYLON.Color3(0.9, 0.45, 0.1) },
        medium: { emissive: new BABYLON.Color3(0.5, 0.4, 0), diffuse: new BABYLON.Color3(0.9, 0.75, 0.15) },
        low: { emissive: new BABYLON.Color3(0.05, 0.35, 0.1), diffuse: new BABYLON.Color3(0.2, 0.7, 0.3) },
      };
      const colors = severityColors[risk.severity] || severityColors.medium;
      const mat = new BABYLON.StandardMaterial(`${risk.id}_mat`, scene);
      mat.emissiveColor = colors.emissive;
      mat.diffuseColor = colors.diffuse;
      marker.material = mat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(marker);

      // Floating indicator
      const isCritical = risk.severity === 'critical' || risk.severity === 'high';
      const markerSize = isCritical ? 1.2 : 0.9;
      const indicator = BABYLON.MeshBuilder.CreatePlane(`${risk.id}_indicator`, { width: markerSize, height: markerSize }, scene);
      const indicatorY = Math.min(risk.position[1] + 2.2, 2.8);
      indicator.position = new BABYLON.Vector3(risk.position[0], indicatorY, risk.position[2]);
      indicator.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      indicator.isPickable = true;
      indicator.renderingGroupId = 2;

      const texSize = 256;
      const dynTex = new BABYLON.DynamicTexture(`${risk.id}_dynTex`, texSize, scene, true);
      dynTex.hasAlpha = true;
      const dtCtx = dynTex.getContext();
      let icon: string, bgColor: string, glowColor: BABYLON.Color3;
      switch (risk.severity) {
        case 'critical': icon = '❗'; bgColor = 'rgba(220,38,38,0.9)'; glowColor = new BABYLON.Color3(1, 0.15, 0.1); break;
        case 'high': icon = '⚠'; bgColor = 'rgba(234,88,12,0.9)'; glowColor = new BABYLON.Color3(1, 0.5, 0.05); break;
        case 'medium': icon = '❓'; bgColor = 'rgba(202,138,4,0.85)'; glowColor = new BABYLON.Color3(1, 0.8, 0.1); break;
        default: icon = 'ℹ'; bgColor = 'rgba(34,197,94,0.8)'; glowColor = new BABYLON.Color3(0.2, 0.8, 0.4);
      }
      const cx = texSize / 2, cy = texSize / 2, r = texSize * 0.42;
      dtCtx.clearRect(0, 0, texSize, texSize);
      dtCtx.beginPath(); dtCtx.arc(cx, cy, r, 0, Math.PI * 2); dtCtx.closePath();
      dtCtx.fillStyle = bgColor; dtCtx.fill();
      dtCtx.strokeStyle = '#fff'; dtCtx.lineWidth = 6; dtCtx.stroke();
      dtCtx.font = `bold ${Math.round(texSize * 0.55)}px Arial`;
      (dtCtx as any).textAlign = 'center'; (dtCtx as any).textBaseline = 'middle';
      dtCtx.fillStyle = '#fff';
      dtCtx.fillText(icon, cx, cy + 4);
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

      // Animate indicator
      const baseIndY = indicatorY;
      scene.registerBeforeRender(() => {
        const t = Date.now() * 0.001;
        indicator.position.y = baseIndY + Math.sin(t * 1.8) * 0.15;
        if (isCritical) {
          const pulse = 1.0 + Math.sin(t * 3.5) * 0.15;
          indicator.scaling.setAll(pulse);
        }
      });

      return { mesh: marker, risk };
    });

    // Track risk meshes for hover-highlight (include marker + indicator)
    riskMeshes.forEach(({ mesh, risk }) => {
      const list: BABYLON.Mesh[] = [mesh as BABYLON.Mesh];
      const ind = scene.getMeshByName(`${risk.id}_indicator`);
      if (ind) list.push(ind as BABYLON.Mesh);
      riskMeshMapRef.current.set(risk.id, list);
    });

    // 10. Click detection
    // Helper: pick up a spare extinguisher (refill charge + dispose pickup visuals)
    const pickupSpareExtinguisher = (pickupRootName: string) => {
      const root = scene.getTransformNodeByName(pickupRootName);
      if (!root) return false;
      // Already at full charge → no-op with friendly hint
      if (extChargeRef.current.current >= extChargeRef.current.max) {
        toast.info('🧯 Estintore già carico!');
        return false;
      }
      extChargeRef.current.current = extChargeRef.current.max;
      onChargeChange?.(extChargeRef.current.current, extChargeRef.current.max);
      const meta = root.metadata as { halo?: BABYLON.Mesh; beam?: BABYLON.Mesh; pulseLight?: BABYLON.PointLight; labelPlane?: BABYLON.Mesh; pulseObserver?: BABYLON.Observer<BABYLON.Scene> } | null;
      if (meta?.pulseObserver) scene.onBeforeRenderObservable.remove(meta.pulseObserver);
      // Dispose all child meshes + the root itself
      root.getChildMeshes().forEach(m => m.dispose());
      meta?.pulseLight?.dispose();
      root.dispose();
      toast.success('🧯 Estintore ricaricato al 100%!');
      return true;
    };

    scene.onPointerDown = (evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        const pickedMesh = pickResult.pickedMesh;

        // Spare extinguisher pickup (click)
        if (pickedMesh.metadata?.extinguisherPickup && pickResult.distance < 4) {
          pickupSpareExtinguisher(pickedMesh.metadata.pickupRoot);
          return;
        }

        if (pickedMesh.metadata?.safetyRole) {
          setActiveNPCRole(pickedMesh.metadata.safetyRole);
          return;
        }

        const riskData = riskMeshes.find((r) => {
          if (r.mesh === pickedMesh) return true;
          const meshName = pickedMesh.name || '';
          if (meshName.startsWith(r.risk.id + '_')) return true;
          if (pickedMesh.metadata?.riskId === r.risk.id) return true;
          return false;
        });

        if (riskData && !risksFoundIds.includes(riskData.risk.id)) {
          const isCritical = riskData.risk.severity === 'critical' || riskData.risk.severity === 'high';
          createParticleEffect(scene, pickResult.pickedPoint!, isCritical);
          playRiskSound(scene, isCritical);

          const narrator = getVoiceNarrator();
          const severity = isCritical ? 'critical' : 'moderate';
          const result = narrator.speak({
            id: riskData.risk.id, type: scenario.type,
            description: riskData.risk.description, severity
          }, { subtitlesOnly: !audioSettings.voiceOverEnabled || audioSettings.subtitlesEnabled });

          if (audioSettings.subtitlesEnabled || !audioSettings.voiceOverEnabled) {
            setCurrentSubtitle({ text: result.text, severity });
          }

          // === Blinking outline + semi-transparent zone (3s guida highlight) ===
          const sevColor = riskData.risk.severity === 'critical' ? new BABYLON.Color3(1, 0.15, 0.1)
            : riskData.risk.severity === 'high' ? new BABYLON.Color3(1, 0.55, 0.05)
            : riskData.risk.severity === 'medium' ? new BABYLON.Color3(1, 0.85, 0.1)
            : new BABYLON.Color3(0.2, 0.85, 0.4);

          // Disable picking but keep visible during 3s highlight
          pickedMesh.isPickable = false;
          const groupMeshes = riskMeshMapRef.current.get(riskData.risk.id) || [pickedMesh as BABYLON.Mesh];
          const hl = highlightLayerRef.current;
          groupMeshes.forEach(m => { try { hl?.addMesh(m, sevColor); } catch {} });

          // Transparent highlight zone (sphere) around the picked point
          const anchor = pickedMesh.getAbsolutePosition().clone();
          const bRadius = (pickedMesh.getBoundingInfo()?.boundingSphere.radiusWorld) || 0.8;
          const zone = BABYLON.MeshBuilder.CreateSphere(`${riskData.risk.id}_zone`, { diameter: Math.max(2.2, bRadius * 2.6), segments: 16 }, scene);
          zone.position = anchor.clone();
          zone.isPickable = false;
          const zoneMat = new BABYLON.StandardMaterial(`${riskData.risk.id}_zoneMat`, scene);
          zoneMat.emissiveColor = sevColor;
          zoneMat.diffuseColor = sevColor;
          zoneMat.alpha = 0.22;
          zoneMat.backFaceCulling = false;
          zone.material = zoneMat;
          zone.renderingGroupId = 1;

          // Pulsing animation
          const pulseObs = scene.onBeforeRenderObservable.add(() => {
            const t = performance.now() * 0.006;
            const p = 0.5 + 0.5 * Math.sin(t);
            zoneMat.alpha = 0.15 + p * 0.30;
            const s = 1 + p * 0.18;
            zone.scaling.setAll(s);
            // Blink highlight color brightness
            const k = 0.55 + p * 0.45;
            zoneMat.emissiveColor = sevColor.scale(k);
          });

          onRiskFound(riskData.risk.id, isCritical);

          // Anchored 2D label (briefly) before the popup
          const cam = cameraRef.current;
          const cnv = canvasRef.current;
          if (cam && cnv) {
            const rect = cnv.getBoundingClientRect();
            const w = scene.getEngine().getRenderWidth();
            const h = scene.getEngine().getRenderHeight();
            const proj = BABYLON.Vector3.Project(
              anchor.add(new BABYLON.Vector3(0, bRadius + 0.6, 0)),
              BABYLON.Matrix.Identity(),
              scene.getTransformMatrix(),
              new BABYLON.Viewport(0, 0, w, h)
            );
            setHoverLabel({
              label: riskData.risk.label,
              severity: riskData.risk.severity,
              x: rect.left + (proj.x / w) * rect.width,
              y: rect.top + (proj.y / h) * rect.height,
            });
            setTimeout(() => setHoverLabel(null), 1400);
          }

          // Guida overlay with normative reference
          if (guideModeRef.current) {
            setGuideOverlay({
              label: riskData.risk.label,
              description: riskData.risk.description,
              normative: deriveNormative(riskData.risk.label, riskData.risk.description, riskData.risk.severity),
              severity: riskData.risk.severity,
            });
            setTimeout(() => setGuideOverlay(null), 6000);
          } else {
            toast.success(
              `${isCritical ? '🚨' : '⚠️'} ${riskData.risk.label}`,
              { description: riskData.risk.description, duration: 6000 }
            );
          }

          // Cleanup after 3s highlight
          setTimeout(() => {
            try { scene.onBeforeRenderObservable.remove(pulseObs); } catch {}
            groupMeshes.forEach(m => { try { hl?.removeMesh(m); } catch {} });
            try { zone.dispose(); zoneMat.dispose(); } catch {}
            try { pickedMesh.dispose(); } catch {}
          }, 3000);
          return;
        }
      }

      // Extinguisher spray (laboratory) — with aim-check, fallback retry, and miss feedback
      if (scenario.type === 'laboratory') {
        const tryFire = (attempt = 0) => {
          const activeExt = extinguisherTypeRef.current;
          if (!activeExt) {
            // Fallback: extinguisher prop not yet propagated — retry once after a short delay
            if (attempt === 0) {
              setTimeout(() => tryFire(1), 120);
            } else {
              toast.warning('⚠️ Nessun estintore selezionato. Scegline uno per attivare lo spray.');
            }
            return;
          }
          if (extChargeRef.current.current <= 0) {
            toast.error('🔴 Estintore vuoto! Cercane uno nuovo.');
            return;
          }
          // Aim check: don't consume charge if not pointing at any fire
          const aim = aimHasFire(scene, camera);
          if (!aim.hit) {
            toast.info('🎯 Mira verso il fuoco — nessuna carica consumata.');
            return;
          }
          extChargeRef.current.current = Math.max(0, extChargeRef.current.current - 10);
          onChargeChange?.(extChargeRef.current.current, extChargeRef.current.max);
          shootExtinguisherSpray(scene, camera, activeExt, fireHitCountRef.current, onFireExtinguished);
        };
        tryFire();
      }
    };

    // Expose automated test hook (dev/QA): simulates extinguisher click & verifies spray
    (window as unknown as { __extinguisherTest?: () => Promise<{ ok: boolean; reason: string; chargeBefore: number; chargeAfter: number; sprayCreated: boolean }> }).__extinguisherTest = async () => {
      const chargeBefore = extChargeRef.current.current;
      const activeExt = extinguisherTypeRef.current;
      if (!activeExt) return { ok: false, reason: 'no-extinguisher-selected', chargeBefore, chargeAfter: chargeBefore, sprayCreated: false };
      const aim = aimHasFire(scene, camera);
      if (!aim.hit) return { ok: false, reason: 'aim-missed-fire', chargeBefore, chargeAfter: chargeBefore, sprayCreated: false };
      shootExtinguisherSpray(scene, camera, activeExt, fireHitCountRef.current, onFireExtinguished);
      extChargeRef.current.current = Math.max(0, extChargeRef.current.current - 10);
      onChargeChange?.(extChargeRef.current.current, extChargeRef.current.max);
      const sprayCreated = scene.particleSystems.some(p => p.name === 'extSpray');
      return { ok: sprayCreated, reason: sprayCreated ? 'spray-fired' : 'spray-not-created', chargeBefore, chargeAfter: extChargeRef.current.current, sprayCreated };
    };

    // 11. Prop detection (raycast look-at) — supports metadata.tooltip for hazards
    const LOOK_DISTANCE = 6;
    const RISK_HOVER_DISTANCE = 8;
    const detectLookedAtProp = () => {
      if (!camera) return;

      // --- Risk hover highlight (longer distance) ---
      const riskRay = camera.getForwardRay(RISK_HOVER_DISTANCE);
      const riskHit = scene.pickWithRay(riskRay, (mesh) => !!mesh.metadata?.riskId);
      const newHoverId = (riskHit && riskHit.pickedMesh && riskHit.distance <= RISK_HOVER_DISTANCE)
        ? (riskHit.pickedMesh.metadata?.riskId as string)
        : null;
      if (newHoverId !== hoveredRiskRef.current) {
        const hl = highlightLayerRef.current;
        if (hl) {
          // Clear previous
          if (hoveredRiskRef.current) {
            const prev = riskMeshMapRef.current.get(hoveredRiskRef.current) || [];
            prev.forEach(m => { try { hl.removeMesh(m); } catch {} });
          }
          if (newHoverId) {
            const next = riskMeshMapRef.current.get(newHoverId) || [];
            const sev = scenario.risks.find(r => r.id === newHoverId)?.severity;
            const color = sev === 'critical' ? new BABYLON.Color3(1, 0.15, 0.1)
              : sev === 'high' ? new BABYLON.Color3(1, 0.55, 0.05)
              : sev === 'medium' ? new BABYLON.Color3(1, 0.85, 0.1)
              : new BABYLON.Color3(0.2, 0.85, 0.4);
            next.forEach(m => { try { hl.addMesh(m, color); } catch {} });
          }
        }
        hoveredRiskRef.current = newHoverId;
      }

      // Update anchored 2D label for the currently-hovered risk (skip if a click-guide label is showing)
      if (newHoverId && riskHit?.pickedMesh) {
        const cnv = canvasRef.current;
        if (cnv) {
          const sev = scenario.risks.find(r => r.id === newHoverId);
          const anchorPos = riskHit.pickedMesh.getAbsolutePosition().clone();
          anchorPos.y += 1.0;
          const rect = cnv.getBoundingClientRect();
          const w = scene.getEngine().getRenderWidth();
          const h = scene.getEngine().getRenderHeight();
          const proj = BABYLON.Vector3.Project(
            anchorPos,
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            new BABYLON.Viewport(0, 0, w, h)
          );
          if (sev) {
            setHoverLabel({
              label: sev.label,
              severity: sev.severity,
              x: rect.left + (proj.x / w) * rect.width,
              y: rect.top + (proj.y / h) * rect.height,
            });
          }
        }
      } else if (!guideOverlay) {
        setHoverLabel((prev) => (prev ? null : prev));
      }

      const ray = camera.getForwardRay(LOOK_DISTANCE);
      const hit = scene.pickWithRay(ray, (mesh) => {
        if (mesh.metadata?.tooltip) return true;
        return mesh.name.includes('pallet') || mesh.name.includes('barrel') ||
          mesh.name.includes('cone') || mesh.name.includes('barrier') ||
          mesh.name.includes('cargo') || mesh.name.includes('equipment') ||
          mesh.name.includes('bench') || mesh.name.includes('desk') ||
          mesh.name.includes('filing') || mesh.name.includes('waste') ||
          mesh.name.includes('storage') || mesh.name.includes('recycling');
      });

      if (hit && hit.pickedMesh && hit.distance <= LOOK_DISTANCE) {
        const meshName = hit.pickedMesh.name;
        const tt = hit.pickedMesh.metadata?.tooltip;
        let info: { name: string; type: string; condition: 'good' | 'warning' | 'damaged'; icon: LucideIcon };
        if (tt) {
          info = {
            name: tt.name,
            type: tt.type,
            condition: tt.condition,
            icon: TOOLTIP_ICONS[tt.iconKey] || Package2,
          };
        } else {
          info = { name: 'Oggetto', type: 'Generico', condition: 'good', icon: Package2 };
          if (meshName.includes('pallet') || meshName.includes('filing') || meshName.includes('storage'))
            info = { name: 'Pallet / Scaffale', type: 'Archiviazione', condition: 'good', icon: Archive };
          else if (meshName.includes('barrel') || meshName.includes('waste') || meshName.includes('recycling'))
            info = { name: 'Contenitore', type: 'Stoccaggio rifiuti', condition: 'good', icon: Drum };
          else if (meshName.includes('cone'))
            info = { name: 'Cono segnaletico', type: 'Sicurezza', condition: 'warning', icon: Construction };
          else if (meshName.includes('barrier'))
            info = { name: 'Barriera sicurezza', type: 'Protezione', condition: 'good', icon: ShieldAlert };
          else if (meshName.includes('cargo'))
            info = { name: 'Scatola merci', type: 'Magazzino', condition: 'good', icon: Package2 };
          else if (meshName.includes('equipment'))
            info = { name: 'Attrezzatura', type: 'Macchinario', condition: 'warning', icon: Cog };
          else if (meshName.includes('bench'))
            info = { name: 'Banco laboratorio', type: 'Attrezzatura lab', condition: 'good', icon: FlaskConical };
          else if (meshName.includes('desk'))
            info = { name: 'Scrivania', type: 'Postazione lavoro', condition: 'good', icon: Monitor };
        }

        setLookedAtProp({ ...info, distance: hit.distance });
      } else {
        setLookedAtProp(null);
      }
    };

    // 12. Dynamic occlusion
    const updateDynamicOcclusion = () => {
      if (!camera) return;
      // Legacy occlusion now handled by LOD system
      if (!lodSystemRef.current) {
        scene.meshes.forEach(mesh => {
          if (mesh.name.startsWith('rack_') || mesh.name.startsWith('looseBox_')) {
            const dist = BABYLON.Vector3.Distance(camera.position, mesh.position);
            mesh.setEnabled(dist < 60);
          }
        });
      }
    };

    // 14. Render loop
    let posUpdateCounter = 0;
    let pickupCheckCounter = 0;
    let aimCheckCounter = 0;
    let lastAimState = false;
    let lastAimIndex: number | null = null;
    engine.runRenderLoop(() => {
      updateDynamicOcclusion();
      detectLookedAtProp();
      // LOD update
      if (lodSystemRef.current && camera) {
        lodSystemRef.current.update(camera.position);
      }
      posUpdateCounter++;
      if (posUpdateCounter >= 5 && camera && onPositionUpdate) {
        posUpdateCounter = 0;
        const pos = camera.position;
        onPositionUpdate([pos.x, pos.y, pos.z], camera.rotation.y);
      }
      // Auto-pickup spare extinguisher when within 1.6m & charge not full
      pickupCheckCounter++;
      if (pickupCheckCounter >= 12 && scenario.type === 'laboratory' && camera && extChargeRef.current.current < extChargeRef.current.max) {
        pickupCheckCounter = 0;
        for (const m of scene.meshes) {
          if (m.metadata?.extinguisherPickup && m.isEnabled() && BABYLON.Vector3.Distance(camera.position, m.absolutePosition) < 1.6) {
            pickupSpareExtinguisher(m.metadata.pickupRoot);
            break;
          }
        }
      }
      // Aim-at-fire detection (throttled)
      aimCheckCounter++;
      if (aimCheckCounter >= 6 && scenario.type === 'laboratory' && camera) {
        aimCheckCounter = 0;
        const aim = aimHasFire(scene, camera);
        if (onAimAtFire && aim.hit !== lastAimState) {
          lastAimState = aim.hit;
          onAimAtFire(aim.hit);
        }
        const idx = aim.hit ? aim.nearestIndex : null;
        if (onAimAtFireIndex && idx !== lastAimIndex) {
          lastAimIndex = idx;
          onAimAtFireIndex(idx);
        }
      }
      scene.render();
    });

    // 14. Event listeners
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event: MouseEvent) => {
      if (onMouseMove && (event.movementX !== 0 || event.movementY !== 0)) {
        onMouseMove(event.movementX, event.movementY);
      }
    };
    // Always listen for mouse movement so calibration can record samples
    // even before the user enters pointer lock. movementX/Y is supported
    // by all modern browsers regardless of pointer lock state.
    window.addEventListener('mousemove', handleMouseMove);

    // Capture base imageProcessing values for visual settings to scale from
    const ipc = scene.imageProcessingConfiguration;
    baseImageProcRef.current = { exposure: ipc.exposure, contrast: ipc.contrast };

    setIsReady(true);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      try { (scene as unknown as { __camPresetCleanup?: () => void }).__camPresetCleanup?.(); } catch (e) {}
      if (soundtrackRef.current) { soundtrackRef.current.stop(); soundtrackRef.current = null; }
      if (ambientAudioRef.current) { ambientAudioRef.current.stop(); ambientAudioRef.current = null; }
      if (npcSoundSystemRef.current) { npcSoundSystemRef.current.dispose(); npcSoundSystemRef.current = null; }
      if (lodSystemRef.current) { lodSystemRef.current.dispose(); lodSystemRef.current = null; }
      const narrator = getVoiceNarrator();
      narrator.stop();
      fireAmbientContexts.forEach(ctx => { try { ctx.close(); } catch (e) {} });
      fireAmbientContexts.length = 0;
      scene.dispose();
      engine.dispose();
    };
  }, [scenario.id, quality, uniformFillConfig?.preset, uniformFillConfig?.density, uniformFillConfig?.seed, JSON.stringify(uniformFillConfig?.perWall ?? {})]);

  // Create first-person extinguisher with swap animation
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    if (scenario.type !== 'laboratory' || !extinguisherType) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const existing = scene.getTransformNodeByName('extinguisher_parent');

    // Metallic swap sound effect using Web Audio API
    const playSwapSound = () => {
      try {
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        // Layer 1: metallic clank (short high-freq burst)
        const osc1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        const f1 = ctx.createBiquadFilter();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        f1.type = 'bandpass';
        f1.frequency.value = 800;
        f1.Q.value = 5;
        g1.gain.setValueAtTime(0.35, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc1.connect(f1).connect(g1).connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.12);

        // Layer 2: deep thud (low resonance)
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(90, now);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        g2.gain.setValueAtTime(0.25, now);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.15);

        // Layer 3: metallic rattle (noise burst through resonant filter)
        const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const nd = noiseBuf.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const nf = ctx.createBiquadFilter();
        nf.type = 'bandpass';
        nf.frequency.value = 3500;
        nf.Q.value = 8;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.15, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        noise.connect(nf).connect(ng).connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.1);

        setTimeout(() => ctx.close(), 500);
      } catch (e) { /* audio not available */ }
    };

    // Second metallic click when new extinguisher locks in
    const playLockSound = () => {
      try {
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
        f.type = 'highpass';
        f.frequency.value = 400;
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(f).connect(g).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        setTimeout(() => ctx.close(), 300);
      } catch (e) { /* audio not available */ }
    };

    // Metallic sparks particle effect at extinguisher position
    const emitSwapSparks = () => {
      const extNode = scene.getTransformNodeByName('extinguisher_parent');
      if (!extNode) return;

      const sparkEmitter = BABYLON.MeshBuilder.CreateSphere('sparkEmitter', { diameter: 0.02 }, scene);
      sparkEmitter.parent = camera;
      sparkEmitter.position = extNode.position.clone();
      sparkEmitter.isVisible = false;

      const sparks = new BABYLON.ParticleSystem('swapSparks', 80, scene);
      sparks.emitter = sparkEmitter;
      sparks.particleTexture = new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png', scene);

      // Bright orange-yellow metallic spark colors
      sparks.color1 = new BABYLON.Color4(1.0, 0.85, 0.3, 1.0);
      sparks.color2 = new BABYLON.Color4(1.0, 0.5, 0.1, 0.9);
      sparks.colorDead = new BABYLON.Color4(0.8, 0.2, 0.0, 0.0);

      sparks.minSize = 0.008;
      sparks.maxSize = 0.03;
      sparks.minLifeTime = 0.15;
      sparks.maxLifeTime = 0.4;
      sparks.emitRate = 200;
      sparks.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

      // Scatter in all directions from swap point
      sparks.direction1 = new BABYLON.Vector3(-1.5, -1.5, -1.5);
      sparks.direction2 = new BABYLON.Vector3(1.5, 2.0, 1.5);
      sparks.minEmitPower = 1.5;
      sparks.maxEmitPower = 4.0;
      sparks.updateSpeed = 0.008;
      sparks.gravity = new BABYLON.Vector3(0, -6, 0);

      sparks.minEmitBox = new BABYLON.Vector3(-0.03, -0.03, -0.03);
      sparks.maxEmitBox = new BABYLON.Vector3(0.03, 0.03, 0.03);

      // Sparks shrink as they die
      sparks.addSizeGradient(0, 0.03);
      sparks.addSizeGradient(1.0, 0.003);

      sparks.start();

      // Point light flash accompanying sparks
      const flashLight = new BABYLON.PointLight('swapFlash', extNode.position.clone(), scene);
      flashLight.parent = camera;
      flashLight.diffuse = new BABYLON.Color3(1.0, 0.7, 0.2);
      flashLight.specular = new BABYLON.Color3(1.0, 0.85, 0.4);
      flashLight.intensity = 8;
      flashLight.range = 3;

      // Rapid fade-out for the flash
      let flashTime = 0;
      const flashObs = scene.onBeforeRenderObservable.add(() => {
        flashTime += scene.getEngine().getDeltaTime() / 1000;
        flashLight.intensity = Math.max(0, 8 * (1 - flashTime / 0.35));
        if (flashTime >= 0.35) {
          scene.onBeforeRenderObservable.remove(flashObs);
          flashLight.dispose();
        }
      });

      // Stop after short burst
      setTimeout(() => {
        sparks.stop();
        setTimeout(() => { sparks.dispose(); sparkEmitter.dispose(); }, 600);
      }, 250);
    };

    if (existing) {
      // Play metallic clank + sparks on swap start
      playSwapSound();
      emitSwapSparks();

      // Animate old extinguisher DOWN then swap
      const restY = existing.position.y;
      const anim = new BABYLON.Animation(
        'ext_swapOut', 'position.y', 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      anim.setKeys([
        { frame: 0, value: restY },
        { frame: 8, value: restY - 0.6 },
      ]);
      const ease = new BABYLON.CubicEase();
      ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
      anim.setEasingFunction(ease);
      existing.animations = [anim];

      scene.beginAnimation(existing, 0, 8, false, 1, () => {
        // Dispose old
        existing.getChildMeshes().forEach(m => m.dispose());
        existing.dispose();

        // Play lock-in click
        playLockSound();

        // Create new & animate UP
        createFirstPersonExtinguisher(scene, camera, extinguisherType);
        const newNode = scene.getTransformNodeByName('extinguisher_parent');
        if (newNode) {
          const targetY = newNode.position.y;
          newNode.position.y = targetY - 0.6;
          const animIn = new BABYLON.Animation(
            'ext_swapIn', 'position.y', 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );
          animIn.setKeys([
            { frame: 0, value: targetY - 0.6 },
            { frame: 10, value: targetY },
          ]);
          const easeIn = new BABYLON.CubicEase();
          easeIn.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
          animIn.setEasingFunction(easeIn);
          newNode.animations = [animIn];
          scene.beginAnimation(newNode, 0, 10, false);
        }
      });
    } else {
      // First time — just create directly
      createFirstPersonExtinguisher(scene, camera, extinguisherType);
    }

    extChargeRef.current = { current: 100, max: 100 };
    onChargeChange?.(100, 100);
    console.log('[BabylonScene] ✓ Extinguisher swap:', extinguisherType);
  }, [extinguisherType, scenario.type]);

  // Update risk visibility when risksFoundIds changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    risksFoundIds.forEach((riskId) => {
      scene.meshes.forEach((m) => {
        if (m.name === riskId || m.name.startsWith(riskId + '_')) {
          m.setEnabled(false);
        }
      });

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
          ctx.clearRect(0, 0, texSize, texSize);
          ctx.beginPath();
          ctx.arc(texSize / 2, texSize / 2, texSize / 2 - 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34,197,94,0.85)';
          ctx.fill();
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

    if (soundtrackRef.current && scenario.risks.length > 0) {
      const progress = risksFoundIds.length / scenario.risks.length;
      soundtrackRef.current.setIntensity(progress);
    }
  }, [risksFoundIds, scenario.risks.length]);

  // Update mouse sensitivity dynamically
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.angularSensibility = audioSettings.mouseSensitivity || 500;
    }
  }, [audioSettings.mouseSensitivity]);

  // Re-attach camera controls when isActive changes
  useEffect(() => {
    const camera = cameraRef.current;
    const canvas = canvasRef.current;
    if (!camera || !canvas) return;

    if (isActive) {
      camera.detachControl();
      camera.attachControl(canvas, true);
      canvas.focus();
    } else {
      camera.detachControl();
    }
  }, [isActive]);

  // Robust WASD: forward window keys to the Babylon camera even when
  // the canvas loses focus (clicks on overlays, HUDs, dialogs, etc.)
  useEffect(() => {
    if (!isActive) return;
    const camera = cameraRef.current;
    const canvas = canvasRef.current;
    if (!camera || !canvas) return;

    const MOVE_KEYS = new Set([
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    ]);

    const isTypingTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (node as HTMLElement).isContentEditable
      );
    };

    // Internal state shared by keydown/keyup
    const state = { w: false, a: false, s: false, d: false };

    const setKey = (code: string, value: boolean) => {
      switch (code) {
        case 'KeyW': case 'ArrowUp': state.w = value; break;
        case 'KeyS': case 'ArrowDown': state.s = value; break;
        case 'KeyA': case 'ArrowLeft': state.a = value; break;
        case 'KeyD': case 'ArrowRight': state.d = value; break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!MOVE_KEYS.has(e.code)) return;
      if (isTypingTarget(e.target)) return;
      setKey(e.code, true);
      // Refocus canvas so Babylon's own pipeline also keeps working
      if (document.activeElement !== canvas) canvas.focus({ preventScroll: true });
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!MOVE_KEYS.has(e.code)) return;
      setKey(e.code, false);
    };
    const clearKeys = () => { state.w = state.a = state.s = state.d = false; };
    const onVisibility = () => { if (document.hidden) clearKeys(); };
    const onPointerLockChange = () => {
      // When pointer lock is released (modal opened, ESC, alt-tab) keys can
      // get "stuck" because keyup may be swallowed by overlays. Reset state.
      if (!document.pointerLockElement) clearKeys();
    };
    // Listen in CAPTURE phase so overlays that stopPropagation() in bubble
    // phase can no longer prevent us from clearing the key state.
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', clearKeys);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Drive camera each frame from our own state so movement works even if
    // Babylon's keyboard input lost the canvas focus.
    const scene = sceneRef.current;
    const obs = scene?.onBeforeRenderObservable.add(() => {
      if (!state.w && !state.a && !state.s && !state.d) return;
      const speed = camera.speed ?? 0.3;
      // UniversalCamera: translate in local space
      if (state.w) camera.position.addInPlace(camera.getDirection(BABYLON.Vector3.Forward()).scale(speed));
      if (state.s) camera.position.addInPlace(camera.getDirection(BABYLON.Vector3.Backward()).scale(speed));
      if (state.a) camera.position.addInPlace(camera.getDirection(BABYLON.Vector3.Left()).scale(speed));
      if (state.d) camera.position.addInPlace(camera.getDirection(BABYLON.Vector3.Right()).scale(speed));
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', clearKeys);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (obs && scene) scene.onBeforeRenderObservable.remove(obs);
    };
  }, [isActive]);

  // === BRIEFING MODE: cinematic flythrough of all risks with annotations ===
  useEffect(() => {
    if (!briefingActive) return;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!camera || !scene || !scenario.risks.length) return;

    let cancelled = false;
    let activeAnim: BABYLON.Animatable | null = null;
    const savedPos = camera.position.clone();
    const savedRot = camera.rotation.clone();
    const savedCheckCollisions = camera.checkCollisions;
    const savedApplyGravity = camera.applyGravity;

    // Disable controls/collisions during cinematic
    camera.detachControl();
    camera.checkCollisions = false;
    camera.applyGravity = false;

    const flyTo = (target: BABYLON.Vector3, lookAt: BABYLON.Vector3, durationMs: number) =>
      new Promise<void>((resolve) => {
        const fps = 60;
        const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));

        const posAnim = new BABYLON.Animation(
          'briefingPos', 'position', fps,
          BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
        posAnim.setKeys([
          { frame: 0, value: camera.position.clone() },
          { frame: totalFrames, value: target.clone() },
        ]);
        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        posAnim.setEasingFunction(ease);

        // Compute target rotation from lookAt
        const tmpCam = new BABYLON.UniversalCamera('tmp', target, scene);
        tmpCam.setTarget(lookAt);
        const targetRot = tmpCam.rotation.clone();
        tmpCam.dispose();

        const rotAnim = new BABYLON.Animation(
          'briefingRot', 'rotation', fps,
          BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
        rotAnim.setKeys([
          { frame: 0, value: camera.rotation.clone() },
          { frame: totalFrames, value: targetRot },
        ]);
        rotAnim.setEasingFunction(ease);

        camera.animations = [posAnim, rotAnim];
        activeAnim = scene.beginAnimation(camera, 0, totalFrames, false, 1, () => resolve());
      });

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        // Track for cancellation
        (wait as any)._id = id;
      });

    (async () => {
      const risks = scenario.risks;
      for (let i = 0; i < risks.length; i++) {
        if (cancelled) return;
        const risk = risks[i];
        const [rx, ry, rz] = risk.position;
        const riskPos = new BABYLON.Vector3(rx, Math.max(ry, 0.5), rz);

        // Camera offset: 3.5m back from origin direction, 1.7m height
        const fromOrigin = riskPos.clone();
        fromOrigin.y = 0;
        const dir = fromOrigin.length() > 0.01
          ? fromOrigin.normalize()
          : new BABYLON.Vector3(0, 0, 1);
        const camTarget = riskPos.add(dir.scale(3.5));
        camTarget.y = 1.7;

        onBriefingStep?.(i, risks.length);
        await flyTo(camTarget, riskPos, 1800);
        if (cancelled) return;
        await wait(4500);
      }
      if (!cancelled) onBriefingComplete?.();
    })();

    return () => {
      cancelled = true;
      if (activeAnim) activeAnim.stop();
      const pendingId = (wait as any)._id;
      if (pendingId) window.clearTimeout(pendingId);
      // Restore camera state
      camera.position.copyFrom(savedPos);
      camera.rotation.copyFrom(savedRot);
      camera.checkCollisions = savedCheckCollisions;
      camera.applyGravity = savedApplyGravity;
      if (canvasRef.current && isActive) {
        camera.attachControl(canvasRef.current, true);
      }
    };
  }, [briefingActive, scenario, isActive, onBriefingStep, onBriefingComplete]);

  // Apply brightness / contrast live to image processing pipeline
  useEffect(() => {
    const scene = sceneRef.current;
    const base = baseImageProcRef.current;
    if (!scene || !base || !visualSettings) return;
    const ipc = scene.imageProcessingConfiguration;
    ipc.exposure = base.exposure * visualSettings.brightness;
    ipc.contrast = base.contrast * visualSettings.contrast;
  }, [visualSettings?.brightness, visualSettings?.contrast, isReady]);

  // Readability mode: dynamically reduces fog & post-FX so smoke does not
  // visually merge with the environment during the antincendio micro-challenge.
  useEffect(() => {
    const scene = sceneRef.current;
    const base = baseImageProcRef.current;
    if (!scene || !base) return;

    // Cache scenario baseline fog values lazily on first run
    const meta = scene.metadata || (scene.metadata = {});
    if (meta.__readability_base === undefined) {
      meta.__readability_base = {
        fogDensity: scene.fogDensity,
        fogColor: scene.fogColor.clone(),
      };
    }
    const baseFog = meta.__readability_base as { fogDensity: number; fogColor: BABYLON.Color3 };

    const pipeline = scene.postProcessRenderPipelineManager?.supportedPipelines?.find(
      p => p.name === 'cinematicPipeline'
    ) as BABYLON.DefaultRenderingPipeline | undefined;

    if (readabilityMode) {
      // Heavy reduction of fog + cooler/lighter fog tint so smoke stays distinct
      scene.fogDensity = baseFog.fogDensity * 0.25;
      scene.fogColor = new BABYLON.Color3(
        Math.min(1, baseFog.fogColor.r + 0.25),
        Math.min(1, baseFog.fogColor.g + 0.25),
        Math.min(1, baseFog.fogColor.b + 0.25),
      );
      const ipc = scene.imageProcessingConfiguration;
      ipc.exposure = base.exposure * 1.2;
      ipc.contrast = base.contrast * 0.9;
      if (pipeline) {
        pipeline.bloomWeight = Math.min(pipeline.bloomWeight, 0.15);
        pipeline.chromaticAberrationEnabled = false;
        if (pipeline.imageProcessing) {
          pipeline.imageProcessing.vignetteEnabled = false;
        }
      }
    } else {
      // Restore baseline
      scene.fogDensity = baseFog.fogDensity;
      scene.fogColor = baseFog.fogColor.clone();
      const ipc = scene.imageProcessingConfiguration;
      ipc.exposure = base.exposure * (visualSettings?.brightness ?? 1);
      ipc.contrast = base.contrast * (visualSettings?.contrast ?? 1);
      if (pipeline) {
        pipeline.chromaticAberrationEnabled = true;
        if (pipeline.imageProcessing) {
          pipeline.imageProcessing.vignetteEnabled = true;
        }
      }
    }
  }, [readabilityMode, isReady, visualSettings?.brightness, visualSettings?.contrast]);

  // Toggle high-contrast mode for office walls vs floor (and other scenarios)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !visualSettings) return;
    const targets: Array<{ name: string; hc: BABYLON.Color3 }> = [
      { name: 'off_carpetMat',     hc: new BABYLON.Color3(0.18, 0.16, 0.14) },
      { name: 'off_interiorWall',  hc: new BABYLON.Color3(0.97, 0.97, 0.99) },
      { name: 'off_skirting',      hc: new BABYLON.Color3(0.05, 0.05, 0.05) },
      { name: 'groundMat',         hc: new BABYLON.Color3(0.18, 0.18, 0.20) },
    ];
    targets.forEach(({ name, hc }) => {
      const mat = scene.getMaterialByName(name) as BABYLON.StandardMaterial | null;
      if (!mat) return;
      if (visualSettings.highContrast) {
        if (!originalMatColorsRef.current.has(name)) {
          originalMatColorsRef.current.set(name, mat.diffuseColor.clone());
        }
        // Reduce texture influence by tinting via diffuse
        mat.diffuseColor = hc;
      } else {
        const orig = originalMatColorsRef.current.get(name);
        if (orig) mat.diffuseColor = orig.clone();
      }
    });
  }, [visualSettings?.highContrast, isReady]);

  // Auto-exposure: recalibrate when scene ready, on nonce change, or autoExposure toggled on
  useEffect(() => {
    const scene = sceneRef.current;
    const engine = engineRef.current;
    const base = baseImageProcRef.current;
    if (!scene || !engine || !base || !visualSettings) return;
    if (!visualSettings.autoExposure && visualSettings.recalibrateNonce === 0) return;

    const t = setTimeout(() => {
      try {
        const canvas = engine.getRenderingCanvas();
        if (!canvas) return;
        const w = 64, h = 64;
        const cx = Math.floor(canvas.width / 2 - w / 2);
        const cy = Math.floor(canvas.height / 2 - h / 2);
        const pixels = engine.readPixels(cx, cy, w, h) as ArrayBufferView | Promise<ArrayBufferView>;
        const apply = (buf: ArrayBufferView) => {
          const arr = buf as unknown as Uint8Array;
          let lum = 0;
          let n = 0;
          for (let i = 0; i < arr.length; i += 4) {
            // Rec. 709 luminance
            lum += (0.2126 * arr[i] + 0.7152 * arr[i + 1] + 0.0722 * arr[i + 2]) / 255;
            n++;
          }
          if (n === 0) return;
          const avg = lum / n; // 0..1
          const target = 0.45;
          // Clamp adjustment to a sensible range
          const factor = Math.max(0.6, Math.min(1.6, target / Math.max(0.05, avg)));
          const ipc = scene.imageProcessingConfiguration;
          ipc.exposure = base.exposure * visualSettings.brightness * factor;
          console.log('[AutoExposure] avg luminance', avg.toFixed(3), '→ factor', factor.toFixed(2));
        };
        if (pixels instanceof Promise) pixels.then(apply); else apply(pixels);
      } catch (e) {
        console.warn('[AutoExposure] failed', e);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [visualSettings?.autoExposure, visualSettings?.recalibrateNonce, isReady]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none"
        tabIndex={1}
      />

      {lookedAtProp && (
        <PropLabel
          propName={lookedAtProp.name}
          propType={lookedAtProp.type}
          distance={lookedAtProp.distance}
          condition={lookedAtProp.condition}
          icon={lookedAtProp.icon}
        />
      )}

      {currentSubtitle && (
        <SubtitlesOverlay
          text={currentSubtitle.text}
          severity={currentSubtitle.severity}
          onComplete={() => setCurrentSubtitle(null)}
        />
      )}

      {activeNPCRole && (
        <NPCDialogOverlay
          role={activeNPCRole}
          scenarioType={scenario.type}
          onClose={() => {
            setQuizRole(activeNPCRole);
            setActiveNPCRole(null);
          }}
        />
      )}

      {quizRole && (
        <NPCRoleQuiz
          role={quizRole}
          scenarioType={scenario.type}
          onClose={() => setQuizRole(null)}
        />
      )}
    </div>
  );
};
