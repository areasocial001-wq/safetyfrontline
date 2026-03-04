import * as BABYLON from '@babylonjs/core';
import { toast } from 'sonner';
import { NPCAmbientSoundSystem } from '@/lib/npc-ambient-sounds';

// ============================================================
// NPC MODELS & VARIATION SYSTEM
// ============================================================

const NPC_MODELS = [
  'worker-01.glb',
  'avatar-02.glb',
  'avatar-03.glb',
  'avatar-04.glb',
  'avatar-05.glb',
  'avatar-06.glb',
  'avatar-07.glb',
];

interface NPCVariation {
  skinTone: BABYLON.Color3;
  shirtColor: BABYLON.Color3;
  pantsColor: BABYLON.Color3;
  scale: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function getNPCVariation(index: number): NPCVariation {
  const skinTones = [
    new BABYLON.Color3(0.92, 0.78, 0.65),
    new BABYLON.Color3(0.85, 0.68, 0.52),
    new BABYLON.Color3(0.72, 0.55, 0.40),
    new BABYLON.Color3(0.58, 0.42, 0.30),
    new BABYLON.Color3(0.45, 0.32, 0.22),
    new BABYLON.Color3(0.35, 0.25, 0.18),
  ];
  const shirtColors = [
    new BABYLON.Color3(0.2, 0.35, 0.6),
    new BABYLON.Color3(0.5, 0.2, 0.15),
    new BABYLON.Color3(0.15, 0.45, 0.25),
    new BABYLON.Color3(0.6, 0.55, 0.2),
    new BABYLON.Color3(0.3, 0.3, 0.35),
    new BABYLON.Color3(0.55, 0.15, 0.35),
    new BABYLON.Color3(0.7, 0.4, 0.15),
    new BABYLON.Color3(0.1, 0.3, 0.5),
  ];
  const pantsColors = [
    new BABYLON.Color3(0.18, 0.2, 0.28),
    new BABYLON.Color3(0.25, 0.25, 0.3),
    new BABYLON.Color3(0.3, 0.28, 0.22),
    new BABYLON.Color3(0.2, 0.22, 0.25),
    new BABYLON.Color3(0.15, 0.15, 0.2),
  ];

  return {
    skinTone: skinTones[index % skinTones.length],
    shirtColor: shirtColors[index % shirtColors.length],
    pantsColor: pantsColors[index % pantsColors.length],
    scale: 0.95 + seededRandom(index * 37) * 0.15,
  };
}

// ============================================================
// MATERIAL SIMPLIFICATION
// ============================================================

function simplifyMaterials(meshes: BABYLON.AbstractMesh[], variation?: NPCVariation) {
  meshes.forEach(mesh => {
    if (!mesh.material) return;

    const isSkin = mesh.name.toLowerCase().includes('skin') || mesh.name.toLowerCase().includes('head') || mesh.name.toLowerCase().includes('hand');
    const isShirt = mesh.name.toLowerCase().includes('top') || mesh.name.toLowerCase().includes('shirt') || mesh.name.toLowerCase().includes('torso');
    const isPants = mesh.name.toLowerCase().includes('bottom') || mesh.name.toLowerCase().includes('pants') || mesh.name.toLowerCase().includes('leg');

    if (mesh.material instanceof BABYLON.PBRMaterial) {
      const pbrMat = mesh.material as BABYLON.PBRMaterial;
      const baseColor = pbrMat.albedoColor || new BABYLON.Color3(0.6, 0.6, 0.6);

      const stdMat = new BABYLON.StandardMaterial(`${mesh.material.name}_std`, mesh.getScene());
      if (variation) {
        if (isSkin) stdMat.diffuseColor = variation.skinTone;
        else if (isShirt) stdMat.diffuseColor = variation.shirtColor;
        else if (isPants) stdMat.diffuseColor = variation.pantsColor;
        else stdMat.diffuseColor = baseColor;
      } else {
        stdMat.diffuseColor = baseColor;
      }

      stdMat.emissiveColor = new BABYLON.Color3(
        stdMat.diffuseColor.r * 0.15,
        stdMat.diffuseColor.g * 0.15,
        stdMat.diffuseColor.b * 0.15
      );
      stdMat.specularColor = new BABYLON.Color3(0.25, 0.25, 0.25);
      stdMat.specularPower = 16;
      stdMat.backFaceCulling = true;
      mesh.material = stdMat;
    }

    if (mesh.material instanceof BABYLON.StandardMaterial) {
      const stdMat = mesh.material as BABYLON.StandardMaterial;
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
}

// ============================================================
// IDLE BEHAVIORS
// ============================================================

type IdleBehavior = 'idle' | 'lookAround' | 'gesture' | 'phone' | 'writing' | 'stretching';
const IDLE_BEHAVIORS: IdleBehavior[] = ['idle', 'lookAround', 'gesture', 'phone', 'writing', 'stretching'];

function applyIdleBehavior(scene: BABYLON.Scene, root: BABYLON.Mesh | BABYLON.TransformNode, behavior: IdleBehavior, npcSeed: number) {
  const fps = 30;

  switch (behavior) {
    case 'lookAround': {
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
}

// ============================================================
// ROLE LABEL BILLBOARD
// ============================================================

function createRoleLabel(
  scene: BABYLON.Scene,
  pos: BABYLON.Vector3,
  role: string,
  index: number,
  prefix: string
) {
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
}

// ============================================================
// NPC VOICE LINES
// ============================================================

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

// ============================================================
// WALKING WORKER SYSTEM
// ============================================================

interface WalkingWorkerData {
  root: BABYLON.TransformNode;
  waypoints: BABYLON.Vector3[];
  currentWP: number;
  speed: number;
  baseY: number;
  scenarioType: string;
  lastVoiceTime: number;
  voiceCooldown: number;
}

// Speech bubble tracking
const speechBubbles = new Map<string, { plane: BABYLON.Mesh; mat: BABYLON.StandardMaterial; timer: number }>();

function showSpeechBubble(scene: BABYLON.Scene, worker: WalkingWorkerData, text: string) {
  const bubbleId = worker.root.name;
  const existing = speechBubbles.get(bubbleId);
  if (existing) { existing.plane.dispose(); speechBubbles.delete(bubbleId); }

  const texSize = 512;
  const texHeight = 128;
  const dt = new BABYLON.DynamicTexture(`bubble_${bubbleId}`, { width: texSize, height: texHeight }, scene, false);
  const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, texSize, texHeight);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  const r = 16;
  ctx.beginPath();
  ctx.moveTo(r, 4);
  ctx.lineTo(texSize - r, 4);
  ctx.arcTo(texSize - 4, 4, texSize - 4, texHeight - 4, r);
  ctx.arcTo(texSize - 4, texHeight - 4, r, texHeight - 4, r);
  ctx.lineTo(r, texHeight - 4);
  ctx.arcTo(4, texHeight - 4, 4, 4, r);
  ctx.arcTo(4, 4, r, 4, r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1e3a5f';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#1a2a40';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const maxWidth = texSize - 40;
  const words = text.split(' ');
  let line = '';
  let lineY = texHeight * 0.35;
  words.forEach(word => {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, texSize / 2, lineY);
      line = word;
      lineY += 28;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, texSize / 2, lineY);
  dt.update();

  const plane = BABYLON.MeshBuilder.CreatePlane(`bubblePlane_${bubbleId}`, { width: 2, height: 0.5 }, scene);
  plane.position = new BABYLON.Vector3(worker.root.position.x, worker.root.position.y + 2.5, worker.root.position.z);
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  plane.isPickable = false;
  plane.renderingGroupId = 3;

  const mat = new BABYLON.StandardMaterial(`bubbleMat_${bubbleId}`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveTexture = dt;
  mat.opacityTexture = dt;
  mat.useAlphaFromDiffuseTexture = true;
  mat.disableLighting = true;
  mat.backFaceCulling = false;
  mat.alpha = 1;
  plane.material = mat;

  speechBubbles.set(bubbleId, { plane, mat, timer: 5.0 });
}

// ============================================================
// MAIN EXPORT: Add worker avatars to scene
// ============================================================

export function addWorkerAvatars(
  scene: BABYLON.Scene,
  type: string,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null,
  npcSoundSystem: NPCAmbientSoundSystem | null
) {
  console.log(`[Avatars] Adding worker avatars for ${type}`);

  let npcVariationCounter = 0;
  const SAFETY_ROLES = ['RSPP', 'RLS', 'Medico', 'Preposto', 'Dirigente', 'Addetto PS'];

  const walkingWorkers: WalkingWorkerData[] = [];

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
    const behavior = IDLE_BEHAVIORS[currentNpcIndex % IDLE_BEHAVIORS.length];
    const modelFile = NPC_MODELS[currentNpcIndex % NPC_MODELS.length];
    console.log(`[NPC] Creating stationary worker ${name} model=${modelFile} behavior=${behavior}`);

    BABYLON.SceneLoader.ImportMeshAsync('', '/models/avatars/', modelFile, scene).then((result) => {
      console.log(`[NPC] ✓ GLB loaded for ${name}: ${result.meshes.length} meshes`);
      const root = result.meshes[0] as BABYLON.Mesh;
      root.name = `${name}_root`;
      root.position = position.clone();
      root.rotation.y = rotation;
      root.scaling.setAll(variation.scale);

      if (result.animationGroups && result.animationGroups.length > 0) {
        const idleAnim = result.animationGroups.find(ag =>
          ag.name.toLowerCase().includes('idle') || ag.name.toLowerCase().includes('stand')
        ) || result.animationGroups[0];
        result.animationGroups.forEach(ag => ag.stop());
        idleAnim.start(true);
      }

      applyIdleBehavior(scene, root, behavior, currentNpcIndex);
      simplifyMaterials(result.meshes, variation);

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

      if (npcSoundSystem) {
        const soundId = `npc_${name}`;
        const getPos = () => ({ x: root.position.x, y: root.position.y, z: root.position.z });
        if (behavior === 'writing') {
          npcSoundSystem.addTypingSound(soundId, getPos);
        } else {
          npcSoundSystem.addBreathingSound(soundId, getPos);
        }
      }
      toast.success(`NPC ${name} caricato`);
    }).catch(err => {
      console.error(`[NPC] ✗ Failed to load GLB avatar for ${name}:`, err);
      console.log(`[NPC] Creating procedural fallback for ${name}`);
      const body = BABYLON.MeshBuilder.CreateCapsule(`${name}_fallback`, { height: 1.7, radius: 0.25 }, scene);
      body.position = position.clone();
      body.position.y = 0.85;
      const fbMat = new BABYLON.StandardMaterial(`${name}_fbMat`, scene);
      fbMat.diffuseColor = uniformColor.clone();
      fbMat.emissiveColor = uniformColor.scale(0.15);
      fbMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      body.material = fbMat;
      body.checkCollisions = true;
      if (safetyRole) {
        body.metadata = { safetyRole };
        body.isPickable = true;
      }
      if (shadowGenerator) shadowGenerator.addShadowCaster(body);
      const head = BABYLON.MeshBuilder.CreateSphere(`${name}_head`, { diameter: 0.3 }, scene);
      head.position = position.clone();
      head.position.y = 1.85;
      const headMat = new BABYLON.StandardMaterial(`${name}_headMat`, scene);
      headMat.diffuseColor = new BABYLON.Color3(0.85, 0.72, 0.58);
      headMat.emissiveColor = new BABYLON.Color3(0.12, 0.1, 0.08);
      head.material = headMat;
      toast.warning(`NPC ${name} (fallback procedurale)`);
    });
  };

  const createWalkingWorker = (
    name: string,
    waypoints: BABYLON.Vector3[],
    speed: number
  ) => {
    const currentNpcIndex = npcVariationCounter;
    const variation = getNPCVariation(npcVariationCounter++);
    const modelFile = NPC_MODELS[currentNpcIndex % NPC_MODELS.length];

    BABYLON.SceneLoader.ImportMeshAsync('', '/models/avatars/', modelFile, scene).then((result) => {
      const root = result.meshes[0] as BABYLON.Mesh;
      root.name = name;
      root.position = waypoints[0].clone();
      root.scaling.setAll(variation.scale);

      if (result.animationGroups && result.animationGroups.length > 0) {
        const walkAnim = result.animationGroups.find(ag =>
          ag.name.toLowerCase().includes('walk') || ag.name.toLowerCase().includes('run')
        ) || result.animationGroups[0];
        result.animationGroups.forEach(ag => ag.stop());
        walkAnim.start(true);
        walkAnim.speedRatio = speed * 3;
      }

      simplifyMaterials(result.meshes, variation);

      result.meshes.forEach(mesh => {
        if (shadowGenerator) shadowGenerator.addShadowCaster(mesh);
        mesh.receiveShadows = true;
      });

      walkingWorkers.push({
        root,
        waypoints,
        currentWP: 1,
        speed,
        baseY: waypoints[0].y,
        scenarioType: type,
        lastVoiceTime: 0,
        voiceCooldown: 15 + Math.random() * 20,
      });

      console.log(`[NPC] ✓ Walking worker ${name} created`);
    }).catch(err => {
      console.warn(`[NPC] Walking worker ${name} fallback:`, err);
    });
  };

  // === SCENARIO-SPECIFIC NPC PLACEMENT ===
  if (type === 'warehouse') {
    const whRoles = SAFETY_ROLES.slice(0, 4);
    const whPositions = [
      new BABYLON.Vector3(-12, 0, -8),
      new BABYLON.Vector3(12, 0, 8),
      new BABYLON.Vector3(-6, 0, 12),
      new BABYLON.Vector3(10, 0, -12),
    ];
    whPositions.forEach((pos, i) => {
      createWorker(`wh_worker_${i}`, pos, new BABYLON.Color3(1, 0.8, 0), new BABYLON.Color3(0.2, 0.35, 0.6), true, Math.random() * Math.PI * 2, whRoles[i]);
      createRoleLabel(scene, pos, whRoles[i], i, 'wh');
    });

    createWalkingWorker('wh_patrol_1', [
      new BABYLON.Vector3(-15, 0, -10), new BABYLON.Vector3(-15, 0, 10),
      new BABYLON.Vector3(15, 0, 10), new BABYLON.Vector3(15, 0, -10),
    ], 0.06);
    createWalkingWorker('wh_patrol_2', [
      new BABYLON.Vector3(0, 0, -15), new BABYLON.Vector3(0, 0, 15),
    ], 0.05);

  } else if (type === 'construction') {
    const csRoles = SAFETY_ROLES.slice(0, 4);
    const csPositions = [
      new BABYLON.Vector3(-10, 0, -10),
      new BABYLON.Vector3(8, 0, 5),
      new BABYLON.Vector3(-5, 0, 10),
      new BABYLON.Vector3(15, 0, -8),
    ];
    csPositions.forEach((pos, i) => {
      createWorker(`cs_worker_${i}`, pos, new BABYLON.Color3(1, 0.85, 0), new BABYLON.Color3(1, 0.5, 0), true, Math.random() * Math.PI * 2, csRoles[i]);
      createRoleLabel(scene, pos, csRoles[i], i, 'cs');
    });

    createWalkingWorker('cs_patrol_1', [
      new BABYLON.Vector3(-12, 0, 0), new BABYLON.Vector3(12, 0, 0),
    ], 0.04);

  } else if (type === 'laboratory') {
    const labRoles = SAFETY_ROLES.slice(0, 3);
    const labPositions = [
      new BABYLON.Vector3(-10, 0, 0),
      new BABYLON.Vector3(10, 0, -5),
      new BABYLON.Vector3(0, 0, 10),
    ];
    labPositions.forEach((pos, i) => {
      createWorker(`lab_worker_${i}`, pos, new BABYLON.Color3(1, 1, 1), new BABYLON.Color3(0.9, 0.9, 0.92), false, Math.random() * Math.PI * 2, labRoles[i]);
      createRoleLabel(scene, pos, labRoles[i], i, 'lab');
    });

  } else if (type === 'office') {
    const offRoles = SAFETY_ROLES.slice(0, 4);
    const offPositions = [
      new BABYLON.Vector3(-8, 0, -4),
      new BABYLON.Vector3(8, 0, -8),
      new BABYLON.Vector3(-6, 0, 6),
      new BABYLON.Vector3(10, 0, 4),
    ];
    offPositions.forEach((pos, i) => {
      createWorker(`off_worker_${i}`, pos, new BABYLON.Color3(0.3, 0.3, 0.35), new BABYLON.Color3(0.3, 0.4, 0.55), false, Math.random() * Math.PI * 2, offRoles[i]);
      createRoleLabel(scene, pos, offRoles[i], i, 'off');
    });

    createWalkingWorker('off_patrol_1', [
      new BABYLON.Vector3(-10, 0, 0), new BABYLON.Vector3(10, 0, 0),
      new BABYLON.Vector3(10, 0, 8), new BABYLON.Vector3(-10, 0, 8),
    ], 0.04);
  }

  // Walking animation loop
  if (walkingWorkers.length > 0 || true) { // Register even if workers load async
    const VOICE_PROXIMITY = 4.5;

    scene.registerBeforeRender(() => {
      const t = performance.now() * 0.001;
      const frameDt = scene.getEngine().getDeltaTime() * 0.001;
      const cam = scene.activeCamera as BABYLON.UniversalCamera;

      // Update speech bubbles
      speechBubbles.forEach((bubble, id) => {
        bubble.timer -= frameDt;
        if (bubble.timer <= 0.5) {
          bubble.mat.alpha = Math.max(0, bubble.timer / 0.5);
        }
        if (bubble.timer <= 0) {
          bubble.plane.dispose();
          speechBubbles.delete(id);
        } else {
          const wd = walkingWorkers.find(w => w.root.name === id);
          if (wd) {
            bubble.plane.position.x = wd.root.position.x;
            bubble.plane.position.z = wd.root.position.z;
            bubble.plane.position.y = wd.root.position.y + 2.5;
          }
        }
      });

      walkingWorkers.forEach((w) => {
        const target = w.waypoints[w.currentWP];
        const rootPos = w.root.position;
        const dir = target.subtract(new BABYLON.Vector3(rootPos.x, w.baseY, rootPos.z));
        const dist = dir.length();

        if (dist < 0.3) {
          w.currentWP = (w.currentWP + 1) % w.waypoints.length;
          return;
        }

        const moveDir = dir.normalize().scale(w.speed);
        const facingAngle = Math.atan2(moveDir.x, moveDir.z);

        w.root.position.x += moveDir.x;
        w.root.position.z += moveDir.z;
        w.root.rotation.y = facingAngle;

        if (cam) {
          const distToPlayer = BABYLON.Vector3.Distance(
            new BABYLON.Vector3(cam.position.x, 0, cam.position.z),
            new BABYLON.Vector3(w.root.position.x, 0, w.root.position.z)
          );

          if (distToPlayer < VOICE_PROXIMITY && t - w.lastVoiceTime > w.voiceCooldown) {
            const lines = NPC_VOICE_LINES[w.scenarioType] || NPC_VOICE_LINES['office'];
            const line = lines[Math.floor(Math.random() * lines.length)];
            showSpeechBubble(scene, w, line);
            w.lastVoiceTime = t;
            w.voiceCooldown = 20 + Math.random() * 25;
          }
        }
      });
    });
  }

  console.log(`[Avatars] Worker avatars added for ${type}`);
}
