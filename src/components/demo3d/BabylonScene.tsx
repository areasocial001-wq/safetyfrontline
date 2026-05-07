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
import type { AudioSettings } from '@/hooks/useGraphicsSettings';
import { loadGLTFProps } from '@/lib/babylon-prop-loader';
import { loadProceduralProps } from '@/lib/babylon-procedural-props';
import { SCENARIO_PROPS, SCENARIO_PROCEDURAL_PROPS } from '@/types/prop-config';
import { NPCAmbientSoundSystem } from '@/lib/npc-ambient-sounds';

// Scene modules
import { createScene } from './scene-modules/scene-setup';
import { loadEnvironmentOptimized } from './scene-modules/environment-loader';
import { createParticleEffect, playRiskSound, fireAmbientContexts } from './scene-modules/audio-helpers';
import { createFirstPersonExtinguisher, shootExtinguisherSpray } from './scene-modules/extinguisher-system';
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

  // === MAIN SCENE SETUP ===
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Create engine, scene, camera, lighting, post-processing via module
    const ctx = createScene(canvasRef.current, scenario, quality, audioSettings);
    engineRef.current = ctx.engine;
    sceneRef.current = ctx.scene;
    cameraRef.current = ctx.camera;
    const { engine, scene, camera, shadowGenerator } = ctx;

    // Store scenario ID in scene metadata for conditional props
    scene.metadata = { ...scene.metadata, scenarioId: scenario.id };

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

    // 10. Click detection
    scene.onPointerDown = (evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        const pickedMesh = pickResult.pickedMesh;

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

          pickedMesh.dispose();
          onRiskFound(riskData.risk.id, isCritical);
          toast.success(isCritical ? '🚨 Rischio critico trovato!' : '⚠️ Rischio identificato!');
          return;
        }
      }

      // Extinguisher spray (laboratory)
      if (scenario.type === 'laboratory' && extinguisherType) {
        if (extChargeRef.current.current <= 0) {
          toast.error('🔴 Estintore vuoto! Cercane uno nuovo.');
          return;
        }
        extChargeRef.current.current = Math.max(0, extChargeRef.current.current - 10);
        onChargeChange?.(extChargeRef.current.current, extChargeRef.current.max);
        shootExtinguisherSpray(scene, camera, extinguisherType, fireHitCountRef.current, onFireExtinguished);
      }
    };

    // 11. Prop detection (raycast look-at) — supports metadata.tooltip for hazards
    const LOOK_DISTANCE = 6;
    const detectLookedAtProp = () => {
      if (!camera) return;
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
    if (document.pointerLockElement) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    setIsReady(true);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
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
  }, [scenario.id, quality]);

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
