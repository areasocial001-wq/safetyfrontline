import * as BABYLON from '@babylonjs/core';
import { toast } from 'sonner';
import { AmbientAudioPlayer } from '@/lib/audio-system';
import { getVoiceNarrator } from '@/lib/voice-narrator';
import { NPCAmbientSoundSystem } from '@/lib/npc-ambient-sounds';
import {
  buildUniformFillConfig,
  makeRng,
  type UniformFillConfig,
  type UniformFillKind,
} from './uniform-fill-config';
import { computeDensityMetrics, publishMetrics, publishFillStats, type PlacedProp } from './scene-metrics';

/**
 * Deterministic random for consistent prop placement
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/**
 * Add environmental props and details for all scenario types
 */
export function addEnvironmentalProps(
  scene: BABYLON.Scene,
  type: string,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null,
  risksFoundIds: string[] = [],
  onFirePropagationChange?: (level: number) => void,
  ambientAudioRef?: React.MutableRefObject<AmbientAudioPlayer | null>,
  onSprinklerStatusChange?: (active: boolean) => void,
  cameraRef?: React.RefObject<BABYLON.UniversalCamera | null>,
  npcSoundSystemRef?: React.MutableRefObject<NPCAmbientSoundSystem | null>
) {
  console.log(`[Props] Adding environmental details for ${type}`);

  if (type === 'warehouse') {
    addWarehouseProps(scene, quality, shadowGenerator);
  } else if (type === 'construction') {
    addConstructionProps(scene, quality, shadowGenerator);
  } else if (type === 'laboratory') {
    addLaboratoryProps(scene, quality, shadowGenerator, risksFoundIds, onFirePropagationChange, onSprinklerStatusChange, cameraRef);
  } else if (type === 'office') {
    const isCyber = scene.metadata?.scenarioId === 'cybersecurity';
    if (isCyber) {
      // Build a dedicated SOC / IT operations room instead of the
      // standard administrative office so the two scenarios feel distinct.
      addCyberSecurityOfficeEnvironment(scene, quality, shadowGenerator);
    } else {
      addOfficeProps(scene, quality, shadowGenerator);
    }
  }

  // Add cybersecurity-specific props (risk markers) if scenario ID matches
  const cyberMeta = scene.metadata?.scenarioId;
  if (cyberMeta === 'cybersecurity') {
    addCybersecurityProps(scene, quality, shadowGenerator);
  }
}

// ============================================================
// WAREHOUSE PROPS
// ============================================================
function addWarehouseProps(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  // Industrial lighting array (8 fixtures)
  for (let i = 0; i < 8; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const lx = -14 + col * 9;
    const lz = -10 + row * 14;

    const fixture = BABYLON.MeshBuilder.CreateBox(`industrialLight_${i}`, { width: 1.2, height: 0.15, depth: 0.4 }, scene);
    fixture.position = new BABYLON.Vector3(lx, 6.4, lz);
    const fixMat = new BABYLON.StandardMaterial(`lightFixMat_${i}`, scene);
    fixMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.42);
    fixMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    fixture.material = fixMat;

    const lamp = BABYLON.MeshBuilder.CreateBox(`lightLamp_${i}`, { width: 1.0, height: 0.04, depth: 0.25 }, scene);
    lamp.position = new BABYLON.Vector3(lx, 6.3, lz);
    const lampMat = new BABYLON.StandardMaterial(`lampMat_${i}`, scene);
    lampMat.diffuseColor = new BABYLON.Color3(0.95, 0.92, 0.85);
    lampMat.emissiveColor = new BABYLON.Color3(0.6, 0.55, 0.45);
    lamp.material = lampMat;

    // Only add 2 actual PointLights to avoid WebGL uniform buffer overflow
    if (quality !== 'low' && (i === 1 || i === 6)) {
      const pointLight = new BABYLON.PointLight(`whPointLight_${i}`, new BABYLON.Vector3(lx, 6.0, lz), scene);
      pointLight.intensity = 0.8;
      pointLight.range = 20;
      pointLight.diffuse = new BABYLON.Color3(0.95, 0.9, 0.8);
      pointLight.specular = new BABYLON.Color3(0.4, 0.35, 0.3);
    }
  }

  // Metal shelving racks with pallets and stacked boxes
  const shelfMat = new BABYLON.StandardMaterial('shelfMetal', scene);
  shelfMat.diffuseColor = new BABYLON.Color3(0.5, 0.52, 0.55);
  shelfMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  shelfMat.specularPower = 64;

  const rackConfigs = [
    { x: -16, z: -14, rot: 0 }, { x: -16, z: -4, rot: 0 }, { x: -16, z: 6, rot: 0 },
    { x: -8, z: -14, rot: 0 },  { x: -8, z: -4, rot: 0 },  { x: -8, z: 6, rot: 0 },
    { x: 4, z: -14, rot: 0 },   { x: 4, z: -4, rot: 0 },   { x: 4, z: 6, rot: 0 },
    { x: 14, z: -14, rot: 0 },  { x: 14, z: 6, rot: 0 },
  ];

  const boxColors = [
    new BABYLON.Color3(0.7, 0.5, 0.3),
    new BABYLON.Color3(0.75, 0.55, 0.35),
    new BABYLON.Color3(0.3, 0.45, 0.65),
    new BABYLON.Color3(0.6, 0.25, 0.2),
    new BABYLON.Color3(0.35, 0.55, 0.3),
    new BABYLON.Color3(0.85, 0.82, 0.7),
    new BABYLON.Color3(0.55, 0.55, 0.55),
  ];

  const labelColors = [
    new BABYLON.Color3(1, 0.3, 0.2),
    new BABYLON.Color3(0.2, 0.5, 0.9),
    new BABYLON.Color3(0.1, 0.7, 0.3),
    new BABYLON.Color3(1, 0.75, 0.1),
    new BABYLON.Color3(0.9, 0.9, 0.9),
  ];

  rackConfigs.forEach((rc, ri) => {
    const rackW = 3.5, rackH = 4.5, rackD = 1.2;
    const shelfCount = 4;

    // Vertical uprights (4 posts)
    for (let p = 0; p < 4; p++) {
      const px = (p % 2 === 0 ? -1 : 1) * (rackW / 2 - 0.05);
      const pz = (p < 2 ? -1 : 1) * (rackD / 2 - 0.05);
      const post = BABYLON.MeshBuilder.CreateBox(`rack_post_${ri}_${p}`, { width: 0.08, height: rackH, depth: 0.08 }, scene);
      post.position = new BABYLON.Vector3(rc.x + px, rackH / 2, rc.z + pz);
      post.material = shelfMat;
      post.checkCollisions = true;
      if (shadowGenerator) shadowGenerator.addShadowCaster(post);
    }

    // Horizontal shelves + items
    for (let s = 0; s < shelfCount; s++) {
      const shelfY = 0.5 + s * 1.1;
      const shelf = BABYLON.MeshBuilder.CreateBox(`rack_shelf_${ri}_${s}`, { width: rackW, height: 0.04, depth: rackD }, scene);
      shelf.position = new BABYLON.Vector3(rc.x, shelfY, rc.z);
      shelf.material = shelfMat;
      shelf.receiveShadows = true;
      if (shadowGenerator) shadowGenerator.addShadowCaster(shelf);

      const itemCount = 2 + Math.floor(seededRandom(ri * 100 + s * 17) * 3);
      for (let b = 0; b < itemCount; b++) {
        const bw = 0.4 + seededRandom(ri * 200 + s * 30 + b * 7) * 0.6;
        const bh = 0.3 + seededRandom(ri * 300 + s * 40 + b * 11) * 0.5;
        const bd = 0.35 + seededRandom(ri * 400 + s * 50 + b * 13) * 0.4;
        const bx = -rackW / 2 + 0.3 + b * (rackW / itemCount);
        const colorIdx = Math.floor(seededRandom(ri * 500 + s * 60 + b * 19) * boxColors.length);

        const box = BABYLON.MeshBuilder.CreateBox(`rackBox_${ri}_${s}_${b}`, { width: bw, height: bh, depth: bd }, scene);
        box.position = new BABYLON.Vector3(rc.x + bx, shelfY + 0.02 + bh / 2, rc.z);
        const bMat = new BABYLON.StandardMaterial(`rackBoxMat_${ri}_${s}_${b}`, scene);
        bMat.diffuseColor = boxColors[colorIdx];
        bMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
        box.material = bMat;
        if (shadowGenerator) shadowGenerator.addShadowCaster(box);

        if (seededRandom(ri * 600 + s * 70 + b * 23) > 0.4) {
          const label = BABYLON.MeshBuilder.CreatePlane(`rackLabel_${ri}_${s}_${b}`, { width: bw * 0.5, height: bh * 0.4 }, scene);
          label.position = new BABYLON.Vector3(rc.x + bx, shelfY + 0.02 + bh / 2, rc.z + bd / 2 + 0.01);
          const lMat = new BABYLON.StandardMaterial(`rackLabelMat_${ri}_${s}_${b}`, scene);
          const lci = Math.floor(seededRandom(ri * 700 + s * 80 + b * 29) * labelColors.length);
          lMat.diffuseColor = labelColors[lci];
          lMat.emissiveColor = labelColors[lci].scale(0.15);
          label.material = lMat;
        }
      }
    }

    // Pallet at ground level
    const pallet = BABYLON.MeshBuilder.CreateBox(`pallet_${ri}`, { width: rackW - 0.2, height: 0.12, depth: rackD - 0.1 }, scene);
    pallet.position = new BABYLON.Vector3(rc.x, 0.06, rc.z);
    const palletMat = new BABYLON.StandardMaterial(`palletMat_${ri}`, scene);
    palletMat.diffuseColor = new BABYLON.Color3(0.6, 0.48, 0.3);
    palletMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    pallet.material = palletMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(pallet);
  });

  // Loose cargo boxes
  const loosePositions = [
    { x: -12, z: 0 }, { x: -4, z: -9 }, { x: 0, z: 10 }, { x: 8, z: 0 },
    { x: -12, z: 14 }, { x: 10, z: -10 }, { x: 16, z: 0 },
  ];
  loosePositions.forEach((lp, li) => {
    const stackH = 1 + Math.floor(seededRandom(li * 111) * 3);
    for (let s = 0; s < stackH; s++) {
      const bw = 0.6 + seededRandom(li * 222 + s) * 0.6;
      const bh = 0.4 + seededRandom(li * 333 + s) * 0.3;
      const bd = 0.5 + seededRandom(li * 444 + s) * 0.5;
      const box = BABYLON.MeshBuilder.CreateBox(`looseBox_${li}_${s}`, { width: bw, height: bh, depth: bd }, scene);
      box.position = new BABYLON.Vector3(lp.x, bh / 2 + s * 0.45, lp.z);
      box.rotation.y = seededRandom(li * 555 + s) * 0.4 - 0.2;
      const bMat = new BABYLON.StandardMaterial(`looseBoxMat_${li}_${s}`, scene);
      const ci = Math.floor(seededRandom(li * 666 + s) * boxColors.length);
      bMat.diffuseColor = boxColors[ci];
      bMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      box.material = bMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(box);
    }
  });

  // Safety signs on walls
  const signWallPositions = [
    { x: -19.5, z: -10, ry: Math.PI / 2 }, { x: -19.5, z: 5, ry: Math.PI / 2 },
    { x: 19.5, z: -10, ry: -Math.PI / 2 }, { x: 19.5, z: 5, ry: -Math.PI / 2 },
    { x: -10, z: -19.5, ry: 0 }, { x: 5, z: -19.5, ry: 0 },
    { x: -10, z: 19.5, ry: Math.PI }, { x: 5, z: 19.5, ry: Math.PI },
  ];
  signWallPositions.forEach((sp, si) => {
    const sign = BABYLON.MeshBuilder.CreatePlane(`wallSign_${si}`, { width: 0.8, height: 0.8 }, scene);
    sign.position = new BABYLON.Vector3(sp.x, 2.5, sp.z);
    sign.rotation.y = sp.ry;
    const signMat = new BABYLON.StandardMaterial(`wallSignMat_${si}`, scene);
    signMat.diffuseColor = si % 2 === 0 ? new BABYLON.Color3(1, 0.8, 0) : new BABYLON.Color3(1, 0, 0);
    signMat.emissiveColor = signMat.diffuseColor.scale(0.2);
    sign.material = signMat;
  });

  // Procedural forklift
  addForklift(scene, 0, -9, shadowGenerator);
}

function addForklift(scene: BABYLON.Scene, fkX: number, fkZ: number, shadowGenerator: BABYLON.ShadowGenerator | null) {
  const fkYellowMat = new BABYLON.StandardMaterial('fk_yellow', scene);
  fkYellowMat.diffuseColor = new BABYLON.Color3(0.95, 0.78, 0.1);
  fkYellowMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.3);
  fkYellowMat.specularPower = 32;
  const fkBlackMat = new BABYLON.StandardMaterial('fk_black', scene);
  fkBlackMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.14);
  fkBlackMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  const fkGreyMat = new BABYLON.StandardMaterial('fk_grey', scene);
  fkGreyMat.diffuseColor = new BABYLON.Color3(0.35, 0.35, 0.38);
  fkGreyMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);

  const fkBody = BABYLON.MeshBuilder.CreateBox('fk_body', { width: 1.6, height: 0.8, depth: 2.8 }, scene);
  fkBody.position = new BABYLON.Vector3(fkX, 0.55, fkZ);
  fkBody.material = fkYellowMat;
  fkBody.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(fkBody);

  const fkHood = BABYLON.MeshBuilder.CreateBox('fk_hood', { width: 1.4, height: 0.5, depth: 1.0 }, scene);
  fkHood.position = new BABYLON.Vector3(fkX, 1.2, fkZ - 0.9);
  fkHood.material = fkYellowMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(fkHood);

  const fkCounter = BABYLON.MeshBuilder.CreateBox('fk_counter', { width: 1.5, height: 0.6, depth: 0.4 }, scene);
  fkCounter.position = new BABYLON.Vector3(fkX, 0.45, fkZ - 1.6);
  fkCounter.material = fkBlackMat;

  for (let m = 0; m < 2; m++) {
    const mastSide = m === 0 ? -0.55 : 0.55;
    const mast = BABYLON.MeshBuilder.CreateBox(`fk_mast_${m}`, { width: 0.08, height: 2.8, depth: 0.08 }, scene);
    mast.position = new BABYLON.Vector3(fkX + mastSide, 1.55, fkZ + 1.35);
    mast.material = fkGreyMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(mast);
  }

  const mastBar = BABYLON.MeshBuilder.CreateBox('fk_mastbar', { width: 1.18, height: 0.06, depth: 0.06 }, scene);
  mastBar.position = new BABYLON.Vector3(fkX, 2.9, fkZ + 1.35);
  mastBar.material = fkGreyMat;

  const fkCarriage = BABYLON.MeshBuilder.CreateBox('fk_carriage', { width: 1.0, height: 0.15, depth: 0.1 }, scene);
  fkCarriage.position = new BABYLON.Vector3(fkX, 0.4, fkZ + 1.35);
  fkCarriage.material = fkGreyMat;

  for (let f = 0; f < 2; f++) {
    const forkX = fkX + (f === 0 ? -0.3 : 0.3);
    const fork = BABYLON.MeshBuilder.CreateBox(`fk_fork_${f}`, { width: 0.12, height: 0.05, depth: 1.2 }, scene);
    fork.position = new BABYLON.Vector3(forkX, 0.18, fkZ + 1.95);
    fork.material = fkGreyMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(fork);
  }

  const roofMat = new BABYLON.StandardMaterial('fk_roof', scene);
  roofMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.32);
  roofMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  const fkRoof = BABYLON.MeshBuilder.CreateBox('fk_roof_mesh', { width: 1.5, height: 0.06, depth: 1.4 }, scene);
  fkRoof.position = new BABYLON.Vector3(fkX, 2.3, fkZ - 0.1);
  fkRoof.material = roofMat;

  for (let rp = 0; rp < 4; rp++) {
    const rpx = (rp % 2 === 0 ? -0.65 : 0.65);
    const rpz = (rp < 2 ? 0.55 : -0.7);
    const pillar = BABYLON.MeshBuilder.CreateBox(`fk_pillar_${rp}`, { width: 0.06, height: 1.3, depth: 0.06 }, scene);
    pillar.position = new BABYLON.Vector3(fkX + rpx, 1.65, fkZ + rpz);
    pillar.material = fkGreyMat;
  }

  const fkSeat = BABYLON.MeshBuilder.CreateBox('fk_seat', { width: 0.6, height: 0.15, depth: 0.5 }, scene);
  fkSeat.position = new BABYLON.Vector3(fkX, 1.0, fkZ - 0.2);
  const seatMat = new BABYLON.StandardMaterial('fk_seatMat', scene);
  seatMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.18);
  fkSeat.material = seatMat;

  const fkSeatBack = BABYLON.MeshBuilder.CreateBox('fk_seatBack', { width: 0.6, height: 0.4, depth: 0.08 }, scene);
  fkSeatBack.position = new BABYLON.Vector3(fkX, 1.3, fkZ - 0.45);
  fkSeatBack.material = seatMat;

  const fkWheel = BABYLON.MeshBuilder.CreateTorus('fk_steering', { diameter: 0.3, thickness: 0.025, tessellation: 24 }, scene);
  fkWheel.position = new BABYLON.Vector3(fkX, 1.3, fkZ + 0.15);
  fkWheel.rotation.x = Math.PI * 0.35;
  fkWheel.material = fkBlackMat;

  for (let wh = 0; wh < 4; wh++) {
    const wx = (wh % 2 === 0 ? -0.85 : 0.85);
    const wz = (wh < 2 ? 0.8 : -0.9);
    const wheel = BABYLON.MeshBuilder.CreateCylinder(`fk_wheel_${wh}`, { height: 0.2, diameter: 0.45 }, scene);
    wheel.position = new BABYLON.Vector3(fkX + wx, 0.22, fkZ + wz);
    wheel.rotation.z = Math.PI / 2;
    wheel.material = fkBlackMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(wheel);
  }

  const fkBeacon = BABYLON.MeshBuilder.CreateCylinder('fk_beacon', { height: 0.15, diameter: 0.18 }, scene);
  fkBeacon.position = new BABYLON.Vector3(fkX, 2.4, fkZ - 0.1);
  const beaconMat = new BABYLON.StandardMaterial('fk_beaconMat', scene);
  beaconMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
  beaconMat.emissiveColor = new BABYLON.Color3(0.6, 0.3, 0);
  fkBeacon.material = beaconMat;
}

// ============================================================
// CONSTRUCTION PROPS
// ============================================================
function addConstructionProps(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  const yellowMat = new BABYLON.StandardMaterial('constr_yellow', scene);
  yellowMat.diffuseColor = new BABYLON.Color3(0.95, 0.78, 0.1);
  yellowMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.3);
  const orangeMat = new BABYLON.StandardMaterial('constr_orange', scene);
  orangeMat.diffuseColor = new BABYLON.Color3(1.0, 0.45, 0.05);
  const concreteMat = new BABYLON.StandardMaterial('constr_concrete', scene);
  concreteMat.diffuseColor = new BABYLON.Color3(0.6, 0.58, 0.55);
  concreteMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
  const darkMetalMat = new BABYLON.StandardMaterial('constr_darkMetal', scene);
  darkMetalMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.28);
  darkMetalMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.55);
  darkMetalMat.specularPower = 64;
  const woodMat = new BABYLON.StandardMaterial('constr_wood', scene);
  woodMat.diffuseColor = new BABYLON.Color3(0.6, 0.45, 0.25);
  woodMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blueTarpMat = new BABYLON.StandardMaterial('constr_tarp', scene);
  blueTarpMat.diffuseColor = new BABYLON.Color3(0.15, 0.3, 0.65);
  blueTarpMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  // Tower crane
  const craneBase = BABYLON.MeshBuilder.CreateBox('crane_base', { width: 3, height: 1.5, depth: 3 }, scene);
  craneBase.position = new BABYLON.Vector3(-18, 0.75, -18);
  craneBase.material = concreteMat;
  craneBase.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(craneBase);

  const craneTower = BABYLON.MeshBuilder.CreateBox('crane_tower', { width: 1.2, height: 22, depth: 1.2 }, scene);
  craneTower.position = new BABYLON.Vector3(-18, 12, -18);
  craneTower.material = yellowMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(craneTower);

  for (let h = 0; h < 10; h++) {
    const brace = BABYLON.MeshBuilder.CreateBox(`crane_brace_${h}`, { width: 1.6, height: 0.08, depth: 0.08 }, scene);
    brace.position = new BABYLON.Vector3(-18, 2.5 + h * 2, -18);
    brace.rotation.y = h % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
    brace.material = yellowMat;
  }

  const cranePivot = new BABYLON.TransformNode('crane_pivot', scene);
  cranePivot.position = new BABYLON.Vector3(-18, 22.5, -18);

  const craneJib = BABYLON.MeshBuilder.CreateBox('crane_jib', { width: 18, height: 0.6, depth: 0.6 }, scene);
  craneJib.position = new BABYLON.Vector3(8, 0, 0);
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

  // Excavator
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

  // Scaffolding
  [{ x: 5, z: -6 }, { x: -14, z: 5 }].forEach((sp, si) => {
    const scaffW = 4, scaffH = 8, scaffD = 1.5;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz], pi) => {
      const pole = BABYLON.MeshBuilder.CreateCylinder(`scaff_${si}_pole_${pi}`, { height: scaffH, diameter: 0.08, tessellation: 6 }, scene);
      pole.position = new BABYLON.Vector3(sp.x + sx * scaffW / 2, scaffH / 2, sp.z + sz * scaffD / 2);
      pole.material = darkMetalMat;
    });
    for (let lvl = 0; lvl < 3; lvl++) {
      const platform = BABYLON.MeshBuilder.CreateBox(`scaff_${si}_plat_${lvl}`, { width: scaffW + 0.3, height: 0.06, depth: scaffD + 0.1 }, scene);
      platform.position = new BABYLON.Vector3(sp.x, 2.5 + lvl * 2.5, sp.z);
      platform.material = woodMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(platform);
    }
  });

  // Traffic cones
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

  // Portable toilet
  const toilet = BABYLON.MeshBuilder.CreateBox('port_toilet', { width: 1.2, height: 2.3, depth: 1.2 }, scene);
  toilet.position = new BABYLON.Vector3(18, 1.15, -5);
  toilet.material = blueTarpMat;
  toilet.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(toilet);

  // Generator
  const gen = BABYLON.MeshBuilder.CreateBox('generator', { width: 2, height: 1.5, depth: 1.2 }, scene);
  gen.position = new BABYLON.Vector3(18, 0.75, 10);
  gen.material = yellowMat;
  gen.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(gen);

  console.log('[Construction] Construction site props added');
}

// ============================================================
// LABORATORY PROPS (Fire simulation)
// ============================================================
function addLaboratoryProps(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null,
  risksFoundIds: string[],
  onFirePropagationChange?: (level: number) => void,
  onSprinklerStatusChange?: (active: boolean) => void,
  cameraRef?: React.RefObject<BABYLON.UniversalCamera | null>
) {
  // Lab benches
  const benchMat = new BABYLON.StandardMaterial('lab_bench', scene);
  benchMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.62);
  benchMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  benchMat.specularPower = 64;

  const benchPositions = [
    { x: -8, z: -5 }, { x: -8, z: 5 }, { x: 8, z: -5 }, { x: 8, z: 5 },
  ];
  benchPositions.forEach((bp, i) => {
    const bench = BABYLON.MeshBuilder.CreateBox(`labBench_${i}`, { width: 3, height: 0.9, depth: 1.2 }, scene);
    bench.position = new BABYLON.Vector3(bp.x, 0.45, bp.z);
    bench.material = benchMat;
    bench.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(bench);
  });

  // ---------- Extra furnishing so the room is not empty ----------
  // Floor-standing storage racks along the walls
  const rackMat = new BABYLON.StandardMaterial('lab_rack', scene);
  rackMat.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.5);
  rackMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.45);
  const rackPositions = [
    { x: -12, z: -10, rot: 0 }, { x: -12, z: 0, rot: 0 }, { x: -12, z: 10, rot: 0 },
    { x: 12, z: -10, rot: Math.PI }, { x: 12, z: 0, rot: Math.PI }, { x: 12, z: 10, rot: Math.PI },
  ];
  rackPositions.forEach((rp, i) => {
    const rack = BABYLON.MeshBuilder.CreateBox(`labRack_${i}`, { width: 1.2, height: 2.4, depth: 0.6 }, scene);
    rack.position = new BABYLON.Vector3(rp.x, 1.2, rp.z);
    rack.rotation.y = rp.rot;
    rack.material = rackMat;
    rack.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(rack);
    // Three shelves (visible plates)
    for (let s = 0; s < 3; s++) {
      const shelf = BABYLON.MeshBuilder.CreateBox(`labRack_${i}_s${s}`, { width: 1.18, height: 0.05, depth: 0.58 }, scene);
      shelf.position = new BABYLON.Vector3(rp.x, 0.5 + s * 0.7, rp.z);
      shelf.material = rackMat;
    }
  });

  // Cardboard boxes scattered (combustible material, story-relevant)
  const boxMat = new BABYLON.StandardMaterial('lab_box', scene);
  boxMat.diffuseColor = new BABYLON.Color3(0.62, 0.45, 0.28);
  boxMat.specularColor = new BABYLON.Color3(0.1, 0.08, 0.05);
  const boxPositions: Array<[number, number, number, number]> = [
    [-4, 0.4, -10, 0.8], [-2, 0.4, -10, 0.8], [-3, 1.2, -10, 0.8],
    [10, 0.4, 6, 0.7], [10, 1.1, 6, 0.7],
    [-9, 0.4, 9, 0.6], [-9, 1.0, 9, 0.6],
    [5, 0.4, -10, 0.7], [6.5, 0.4, -10, 0.7],
  ];
  boxPositions.forEach(([x, y, z, sz], i) => {
    const box = BABYLON.MeshBuilder.CreateBox(`labBox_${i}`, { size: sz }, scene);
    box.position = new BABYLON.Vector3(x, y, z);
    box.material = boxMat;
    box.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(box);
  });

  // Metal drums (chemical hazard)
  const drumMat = new BABYLON.StandardMaterial('lab_drum', scene);
  drumMat.diffuseColor = new BABYLON.Color3(0.75, 0.55, 0.15);
  drumMat.specularColor = new BABYLON.Color3(0.5, 0.4, 0.2);
  drumMat.specularPower = 96;
  const drumPositions: Array<[number, number]> = [[7, -7], [9, -7], [-7, 6], [-9, 6]];
  drumPositions.forEach(([x, z], i) => {
    const drum = BABYLON.MeshBuilder.CreateCylinder(`labDrum_${i}`, { height: 1.0, diameter: 0.6 }, scene);
    drum.position = new BABYLON.Vector3(x, 0.5, z);
    drum.material = drumMat;
    drum.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(drum);
  });

  // Ceiling lamps for visual fill
  const lampMat = new BABYLON.StandardMaterial('lab_lamp', scene);
  lampMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.9);
  lampMat.emissiveColor = new BABYLON.Color3(0.55, 0.5, 0.4);
  for (let i = 0; i < 4; i++) {
    const lx = -8 + (i % 2) * 16;
    const lz = -6 + Math.floor(i / 2) * 12;
    const lamp = BABYLON.MeshBuilder.CreateBox(`labLamp_${i}`, { width: 1.6, height: 0.15, depth: 0.5 }, scene);
    lamp.position = new BABYLON.Vector3(lx, 4.2, lz);
    lamp.material = lampMat;
  }

  // Fire emitters for fire simulation — three distinct fire types
  // Type A: classic orange (Class A – solid combustibles)
  // Type B: dark red / smoldering (Class C – electrical, deeper hue)
  // Type C: white-hot with very heavy smoke (Class D – metal/chemical)
  const fireData: Array<{
    pos: BABYLON.Vector3;
    nearRiskId: string;
    kind: 'orange' | 'darkRed' | 'whiteHot';
  }> = [
    { pos: new BABYLON.Vector3(-5, 0.3, -7), nearRiskId: 'lab_risk_1', kind: 'orange' },
    { pos: new BABYLON.Vector3(3, 0.3, 8), nearRiskId: 'lab_risk_6', kind: 'darkRed' },
    { pos: new BABYLON.Vector3(7, 0.3, -3), nearRiskId: 'lab_risk_9', kind: 'whiteHot' },
  ];

  fireData.forEach((fd, idx) => {
    const fireEmitter = BABYLON.MeshBuilder.CreateBox(`fireEmitter_${idx}`, { size: 0.3 }, scene);
    fireEmitter.position = fd.pos;
    fireEmitter.isVisible = false;

    const fire = new BABYLON.ParticleSystem(`fire_${idx}`, 180, scene);
    fire.emitter = fireEmitter;
    fire.particleTexture = new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png', scene);
    fire.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    fire.gravity = new BABYLON.Vector3(0, 2, 0);
    fire.direction1 = new BABYLON.Vector3(-0.3, 1, -0.3);
    fire.direction2 = new BABYLON.Vector3(0.3, 2, 0.3);
    fire.minEmitPower = 0.5;
    fire.maxEmitPower = 1.5;
    fire.updateSpeed = 0.008;

    // Per-fire visual signature
    let lightColor = new BABYLON.Color3(1, 0.5, 0.1);
    let lightIntensityBase = 1.5;
    let perFireSmokeRate = 12;
    let smokeColor1 = new BABYLON.Color4(0.32, 0.30, 0.32, 0.22);
    let smokeColor2 = new BABYLON.Color4(0.20, 0.18, 0.20, 0.10);

    if (fd.kind === 'orange') {
      // Class A — bright orange flames
      fire.color1 = new BABYLON.Color4(1.4, 0.75, 0.10, 1);
      fire.color2 = new BABYLON.Color4(1.2, 0.40, 0.05, 0.9);
      fire.colorDead = new BABYLON.Color4(0.3, 0.1, 0, 0);
      fire.minSize = 0.20; fire.maxSize = 0.7;
      fire.minLifeTime = 0.3; fire.maxLifeTime = 0.85;
      fire.emitRate = 140;
    } else if (fd.kind === 'darkRed') {
      // Class C — deep red electrical/smoldering fire.
      // Additive blending (BLENDMODE_ONEONE) requires HDR-bright values to
      // actually glow; dark RGB values sum to near-black behind the smoke.
      fire.color1 = new BABYLON.Color4(1.6, 0.18, 0.05, 1);
      fire.color2 = new BABYLON.Color4(1.1, 0.06, 0.02, 0.9);
      fire.colorDead = new BABYLON.Color4(0.25, 0.0, 0.0, 0);
      fire.minSize = 0.22; fire.maxSize = 0.75;
      fire.minLifeTime = 0.45; fire.maxLifeTime = 1.0;
      fire.emitRate = 120;
      // Slower upward draft – smoldering character
      fire.gravity = new BABYLON.Vector3(0, 1.3, 0);
      lightColor = new BABYLON.Color3(1.0, 0.20, 0.08);
      lightIntensityBase = 1.4;
      perFireSmokeRate = 14;
      smokeColor1 = new BABYLON.Color4(0.22, 0.14, 0.14, 0.30);
      smokeColor2 = new BABYLON.Color4(0.12, 0.08, 0.08, 0.15);
    } else {
      // Class D — white-hot metal/chemical fire
      fire.color1 = new BABYLON.Color4(1.6, 1.6, 1.5, 1);
      fire.color2 = new BABYLON.Color4(1.3, 1.25, 1.15, 0.9);
      fire.colorDead = new BABYLON.Color4(0.6, 0.6, 0.55, 0);
      fire.minSize = 0.20; fire.maxSize = 0.6;
      fire.minLifeTime = 0.25; fire.maxLifeTime = 0.7;
      fire.emitRate = 170;
      lightColor = new BABYLON.Color3(0.95, 0.95, 1.0);
      lightIntensityBase = 2.2;
      // Reduced from 55 — heavy smoke was filling the entire scene and
      // visually merging floor/walls/objects into a single fog layer.
      perFireSmokeRate = 24;
      smokeColor1 = new BABYLON.Color4(0.85, 0.85, 0.88, 0.40);
      smokeColor2 = new BABYLON.Color4(0.65, 0.65, 0.70, 0.20);
    }
    fire.start();

    // Per-fire smoke (so each fire has its own smoke signature)
    const perSmokeEmitter = BABYLON.MeshBuilder.CreateBox(`fireSmokeEmitter_${idx}`, { size: 0.1 }, scene);
    perSmokeEmitter.position = fd.pos.add(new BABYLON.Vector3(0, 0.6, 0));
    perSmokeEmitter.isVisible = false;
    const perSmoke = new BABYLON.ParticleSystem(`fireSmoke_${idx}`, 100, scene);
    perSmoke.emitter = perSmokeEmitter;
    perSmoke.particleTexture = new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png', scene);
    perSmoke.color1 = smokeColor1;
    perSmoke.color2 = smokeColor2;
    perSmoke.colorDead = new BABYLON.Color4(0.1, 0.1, 0.1, 0);
    perSmoke.minSize = fd.kind === 'whiteHot' ? 1.2 : 0.8;
    perSmoke.maxSize = fd.kind === 'whiteHot' ? 3.5 : 2.2;
    perSmoke.minLifeTime = fd.kind === 'whiteHot' ? 4 : 2.5;
    perSmoke.maxLifeTime = fd.kind === 'whiteHot' ? 8 : 5;
    perSmoke.emitRate = perFireSmokeRate;
    perSmoke.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    perSmoke.gravity = new BABYLON.Vector3(0, 0.3, 0);
    perSmoke.direction1 = new BABYLON.Vector3(-0.5, 0.4, -0.5);
    perSmoke.direction2 = new BABYLON.Vector3(0.5, 1.2, 0.5);
    perSmoke.minEmitPower = 0.1;
    perSmoke.maxEmitPower = 0.5;
    perSmoke.updateSpeed = 0.005;
    perSmoke.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4);
    perSmoke.maxEmitBox = new BABYLON.Vector3(0.4, 0, 0.4);
    perSmoke.start();

    // Fire light
    const fireLight = new BABYLON.PointLight(`fireLight_${idx}`, fd.pos.add(new BABYLON.Vector3(0, 1, 0)), scene);
    fireLight.diffuse = lightColor;
    fireLight.intensity = lightIntensityBase;
    fireLight.range = 9;

    // Flickering
    scene.registerBeforeRender(() => {
      fireLight.intensity = lightIntensityBase * (0.75 + Math.random() * 0.5);
    });
  });

  // Ambient room smoke (light overall haze)
  const smokeEmitter = BABYLON.MeshBuilder.CreateBox('smokeEmitter', { size: 0.1 }, scene);
  smokeEmitter.position = new BABYLON.Vector3(0, 1, 0);
  smokeEmitter.isVisible = false;

  const smokeSystem = new BABYLON.ParticleSystem('labSmoke', 60, scene);
  smokeSystem.emitter = smokeEmitter;
  smokeSystem.particleTexture = new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png', scene);
  smokeSystem.color1 = new BABYLON.Color4(0.3, 0.3, 0.35, 0.15);
  smokeSystem.color2 = new BABYLON.Color4(0.2, 0.2, 0.25, 0.08);
  smokeSystem.colorDead = new BABYLON.Color4(0.1, 0.1, 0.15, 0);
  smokeSystem.minSize = 0.8;
  smokeSystem.maxSize = 2.5;
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

  // Fire propagation system
  const fireStartTime = Date.now();
  let sprinklersActive = false;

  scene.registerBeforeRender(() => {
    const elapsed = (Date.now() - fireStartTime) / 1000;
    if (elapsed > 15 && onFirePropagationChange) {
      const propagation = Math.min((elapsed - 15) * 0.008, 1.0);
      const effectiveRate = sprinklersActive ? propagation * 0.3 : propagation;
      onFirePropagationChange(effectiveRate);

      // Activate sprinklers at threshold
      if (effectiveRate >= 0.9 && !sprinklersActive) {
        sprinklersActive = true;
        onSprinklerStatusChange?.(true);
        toast.warning('🚿 Sistema sprinkler attivato!');
      }
    }
  });

  console.log('[Laboratory] Fire simulation environment created');
}

// ============================================================
// OFFICE PROPS — Full procedural furnishing
// ============================================================
function addOfficeProps(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  // ---------- Shared Materials ----------
  const whiteMat = new BABYLON.StandardMaterial('off_white', scene);
  whiteMat.diffuseColor = new BABYLON.Color3(0.92, 0.92, 0.92);
  whiteMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

  const deskMat = new BABYLON.StandardMaterial('off_desk', scene);
  deskMat.diffuseColor = new BABYLON.Color3(0.82, 0.75, 0.62);
  deskMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.18);
  deskMat.specularPower = 32;

  const darkWoodMat = new BABYLON.StandardMaterial('off_darkWood', scene);
  darkWoodMat.diffuseColor = new BABYLON.Color3(0.35, 0.25, 0.15);
  darkWoodMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.1);

  const metalMat = new BABYLON.StandardMaterial('off_metal', scene);
  metalMat.diffuseColor = new BABYLON.Color3(0.55, 0.55, 0.58);
  metalMat.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  metalMat.specularPower = 64;

  const blackMat = new BABYLON.StandardMaterial('off_black', scene);
  blackMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.12);
  blackMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);

  const screenMat = new BABYLON.StandardMaterial('off_screen', scene);
  screenMat.diffuseColor = new BABYLON.Color3(0.12, 0.15, 0.22);
  screenMat.emissiveColor = new BABYLON.Color3(0.08, 0.12, 0.2);

  const chairFabricMat = new BABYLON.StandardMaterial('off_fabric', scene);
  chairFabricMat.diffuseColor = new BABYLON.Color3(0.18, 0.22, 0.35);
  chairFabricMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const glassMat = new BABYLON.StandardMaterial('off_glass', scene);
  glassMat.diffuseColor = new BABYLON.Color3(0.7, 0.85, 0.95);
  glassMat.alpha = 0.3;
  glassMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
  glassMat.specularPower = 128;

  const greenMat = new BABYLON.StandardMaterial('off_green', scene);
  greenMat.diffuseColor = new BABYLON.Color3(0.25, 0.55, 0.2);

  // ---------- Interior architecture (visible floor, walls, ceiling) ----------
  // Carpet/floor finish (overlays the gray ground)
  const carpet = BABYLON.MeshBuilder.CreateGround('off_carpet', { width: 47.5, height: 47.5 }, scene);
  carpet.position.y = 0.005;
  const carpetMat = new BABYLON.StandardMaterial('off_carpetMat', scene);
  // Procedural carpet texture (warm beige with noise)
  const carpetTex = new BABYLON.DynamicTexture('off_carpetTex', { width: 512, height: 512 }, scene, false);
  const cctx = carpetTex.getContext() as CanvasRenderingContext2D;
  cctx.fillStyle = '#8a7d6c';
  cctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    const v = 90 + Math.floor(Math.random() * 60);
    cctx.fillStyle = `rgb(${v + 20},${v + 5},${v - 10})`;
    cctx.fillRect(x, y, 1.5, 1.5);
  }
  carpetTex.update();
  carpetTex.uScale = 8; carpetTex.vScale = 8;
  carpetMat.diffuseTexture = carpetTex;
  carpetMat.specularColor = new BABYLON.Color3(0.04, 0.04, 0.04);
  carpet.material = carpetMat;
  carpet.receiveShadows = true;
  carpet.isPickable = false;

  // Interior wall material with subtle plaster texture
  const interiorWallMat = new BABYLON.StandardMaterial('off_interiorWall', scene);
  const wallTex = new BABYLON.DynamicTexture('off_wallTex', { width: 512, height: 512 }, scene, false);
  const wctx = wallTex.getContext() as CanvasRenderingContext2D;
  // Cooler off-white with a faint blue tint, clearly distinct from the warm beige carpet
  wctx.fillStyle = '#d8dde2';
  wctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) {
    wctx.fillStyle = `rgba(80,90,110,${0.05 + Math.random() * 0.07})`;
    wctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  wallTex.update();
  wallTex.uScale = 4; wallTex.vScale = 2;
  interiorWallMat.diffuseTexture = wallTex;
  interiorWallMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  interiorWallMat.backFaceCulling = false;

  // Skirting board material — darker wood for clear floor/wall contrast
  const skirtingMat = new BABYLON.StandardMaterial('off_skirting', scene);
  skirtingMat.diffuseColor = new BABYLON.Color3(0.28, 0.20, 0.14);

  const wallY = 1.5; // wall center height (3m walls)
  const wallH = 3.0;
  const wallSpan = 30;
  const wallConfigs = [
    { name: 'off_wall_n', w: wallSpan, h: wallH, d: 0.15, x: 0, y: wallY, z: -15 },
    { name: 'off_wall_s', w: wallSpan, h: wallH, d: 0.15, x: 0, y: wallY, z: 15 },
    { name: 'off_wall_e', w: 0.15, h: wallH, d: wallSpan, x: 15, y: wallY, z: 0 },
    { name: 'off_wall_w', w: 0.15, h: wallH, d: wallSpan, x: -15, y: wallY, z: 0 },
  ];
  // Lighter accent strip just above the skirting — adds a discreet edge so
  // walls visually separate from the carpet even with low/odd lighting.
  const accentMat = new BABYLON.StandardMaterial('off_wallAccent', scene);
  accentMat.diffuseColor = new BABYLON.Color3(0.85, 0.86, 0.9);
  accentMat.emissiveColor = new BABYLON.Color3(0.18, 0.19, 0.22);
  accentMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

  wallConfigs.forEach(cfg => {
    const wall = BABYLON.MeshBuilder.CreateBox(cfg.name, { width: cfg.w, height: cfg.h, depth: cfg.d }, scene);
    wall.position = new BABYLON.Vector3(cfg.x, cfg.y, cfg.z);
    wall.material = interiorWallMat;
    wall.receiveShadows = true;
    wall.checkCollisions = true;
    wall.isPickable = false;

    const skirt = BABYLON.MeshBuilder.CreateBox(`${cfg.name}_skirt`, {
      width: cfg.w === 0.15 ? 0.18 : cfg.w,
      height: 0.12,
      depth: cfg.d === 0.15 ? 0.18 : cfg.d,
    }, scene);
    skirt.position = new BABYLON.Vector3(cfg.x, 0.06, cfg.z);
    skirt.material = skirtingMat;
    skirt.isPickable = false;

    // Thin perimeter accent line right above the skirting
    const accent = BABYLON.MeshBuilder.CreateBox(`${cfg.name}_accent`, {
      width: cfg.w === 0.15 ? 0.16 : cfg.w,
      height: 0.025,
      depth: cfg.d === 0.15 ? 0.16 : cfg.d,
    }, scene);
    accent.position = new BABYLON.Vector3(cfg.x, 0.135, cfg.z);
    accent.material = accentMat;
    accent.isPickable = false;
  });

  // Drop ceiling with acoustic-tile texture (slightly emissive for soft fill)
  const ceiling = BABYLON.MeshBuilder.CreateGround('off_ceiling', { width: 30, height: 30 }, scene);
  ceiling.position.y = 3.0;
  ceiling.rotation.x = Math.PI;
  const ceilingMat = new BABYLON.StandardMaterial('off_ceilingMat', scene);
  const ceilTex = new BABYLON.DynamicTexture('off_ceilTex', { width: 512, height: 512 }, scene, false);
  const cectx = ceilTex.getContext() as CanvasRenderingContext2D;
  cectx.fillStyle = '#eeeae0';
  cectx.fillRect(0, 0, 512, 512);
  cectx.strokeStyle = '#bdb6a6';
  cectx.lineWidth = 4;
  for (let i = 0; i <= 512; i += 128) {
    cectx.beginPath(); cectx.moveTo(i, 0); cectx.lineTo(i, 512); cectx.stroke();
    cectx.beginPath(); cectx.moveTo(0, i); cectx.lineTo(512, i); cectx.stroke();
  }
  for (let i = 0; i < 1500; i++) {
    cectx.fillStyle = 'rgba(140,130,110,0.08)';
    cectx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  ceilTex.update();
  ceilTex.uScale = 5; ceilTex.vScale = 5;
  ceilingMat.diffuseTexture = ceilTex;
  ceilingMat.emissiveColor = new BABYLON.Color3(0.08, 0.08, 0.07);
  ceilingMat.specularColor = new BABYLON.Color3(0.04, 0.04, 0.04);
  ceiling.material = ceilingMat;
  ceiling.isPickable = false;

  // ---------- Ceiling lights (panels) ----------
  for (let i = 0; i < 6; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const lx = -8 + col * 8;
    const lz = -6 + row * 12;

    const panel = BABYLON.MeshBuilder.CreateBox(`offLightPanel_${i}`, { width: 1.2, height: 0.06, depth: 0.6 }, scene);
    panel.position = new BABYLON.Vector3(lx, 2.94, lz);
    const panelMat = new BABYLON.StandardMaterial(`offLightPanelMat_${i}`, scene);
    panelMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
    panelMat.emissiveColor = new BABYLON.Color3(0.65, 0.6, 0.55);
    panel.material = panelMat;

    // Only 2 actual PointLights to stay within WebGL uniform buffer limits
    if (quality !== 'low' && (i === 1 || i === 4)) {
      const pl = new BABYLON.PointLight(`officeLight_${i}`, new BABYLON.Vector3(lx, 2.8, lz), scene);
      pl.intensity = 0.9;
      pl.range = 14;
      pl.diffuse = new BABYLON.Color3(1, 0.95, 0.9);
    }
  }

  // ---------- Workstation desks (2 rows of 3) ----------
  const deskPositions = [
    { x: -7, z: -5 }, { x: 0, z: -5 }, { x: 7, z: -5 },
    { x: -7, z: 5 },  { x: 0, z: 5 },  { x: 7, z: 5 },
  ];

  deskPositions.forEach((dp, di) => {
    // Desk top
    const top = BABYLON.MeshBuilder.CreateBox(`desk_top_${di}`, { width: 2.4, height: 0.05, depth: 1.2 }, scene);
    top.position = new BABYLON.Vector3(dp.x, 0.75, dp.z);
    top.material = deskMat;
    top.receiveShadows = true;
    top.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(top);

    // Legs (4)
    for (let l = 0; l < 4; l++) {
      const lx = (l % 2 === 0 ? -1.05 : 1.05);
      const lz = (l < 2 ? -0.5 : 0.5);
      const leg = BABYLON.MeshBuilder.CreateBox(`desk_leg_${di}_${l}`, { width: 0.05, height: 0.75, depth: 0.05 }, scene);
      leg.position = new BABYLON.Vector3(dp.x + lx, 0.375, dp.z + lz);
      leg.material = metalMat;
    }

    // Monitor
    const monitorStand = BABYLON.MeshBuilder.CreateBox(`monitor_stand_${di}`, { width: 0.15, height: 0.25, depth: 0.1 }, scene);
    monitorStand.position = new BABYLON.Vector3(dp.x, 0.9, dp.z - 0.3);
    monitorStand.material = blackMat;

    const monitorScreen = BABYLON.MeshBuilder.CreateBox(`monitor_screen_${di}`, { width: 0.9, height: 0.55, depth: 0.03 }, scene);
    monitorScreen.position = new BABYLON.Vector3(dp.x, 1.25, dp.z - 0.35);
    monitorScreen.material = screenMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(monitorScreen);

    // Keyboard
    const kb = BABYLON.MeshBuilder.CreateBox(`keyboard_${di}`, { width: 0.45, height: 0.015, depth: 0.15 }, scene);
    kb.position = new BABYLON.Vector3(dp.x - 0.15, 0.785, dp.z + 0.15);
    kb.material = blackMat;

    // Mouse
    const mouse = BABYLON.MeshBuilder.CreateBox(`mouse_${di}`, { width: 0.06, height: 0.02, depth: 0.1 }, scene);
    mouse.position = new BABYLON.Vector3(dp.x + 0.35, 0.785, dp.z + 0.15);
    mouse.material = blackMat;

    // Coffee mug (cylinder)
    if (seededRandom(di * 77) > 0.3) {
      const mug = BABYLON.MeshBuilder.CreateCylinder(`mug_${di}`, { height: 0.1, diameter: 0.06, tessellation: 12 }, scene);
      mug.position = new BABYLON.Vector3(dp.x + 0.8, 0.83, dp.z + 0.3);
      const mugMat = new BABYLON.StandardMaterial(`mugMat_${di}`, scene);
      const mugColors = [
        new BABYLON.Color3(0.9, 0.9, 0.9),
        new BABYLON.Color3(0.2, 0.35, 0.7),
        new BABYLON.Color3(0.8, 0.2, 0.2),
      ];
      mugMat.diffuseColor = mugColors[Math.floor(seededRandom(di * 99) * mugColors.length)];
      mug.material = mugMat;
    }

    // Office chair
    const chairBase = BABYLON.MeshBuilder.CreateCylinder(`chair_base_${di}`, { height: 0.04, diameter: 0.5, tessellation: 16 }, scene);
    chairBase.position = new BABYLON.Vector3(dp.x, 0.02, dp.z + 0.7);
    chairBase.material = blackMat;

    const chairPole = BABYLON.MeshBuilder.CreateCylinder(`chair_pole_${di}`, { height: 0.42, diameter: 0.05, tessellation: 8 }, scene);
    chairPole.position = new BABYLON.Vector3(dp.x, 0.23, dp.z + 0.7);
    chairPole.material = metalMat;

    const chairSeat = BABYLON.MeshBuilder.CreateBox(`chair_seat_${di}`, { width: 0.45, height: 0.06, depth: 0.45 }, scene);
    chairSeat.position = new BABYLON.Vector3(dp.x, 0.46, dp.z + 0.7);
    chairSeat.material = chairFabricMat;
    chairSeat.checkCollisions = true;

    const chairBack = BABYLON.MeshBuilder.CreateBox(`chair_back_${di}`, { width: 0.45, height: 0.5, depth: 0.04 }, scene);
    chairBack.position = new BABYLON.Vector3(dp.x, 0.75, dp.z + 0.93);
    chairBack.material = chairFabricMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(chairSeat);

    // Armrests
    for (let a = 0; a < 2; a++) {
      const ax = a === 0 ? -0.22 : 0.22;
      const armrest = BABYLON.MeshBuilder.CreateBox(`chair_arm_${di}_${a}`, { width: 0.04, height: 0.04, depth: 0.25 }, scene);
      armrest.position = new BABYLON.Vector3(dp.x + ax, 0.58, dp.z + 0.75);
      armrest.material = blackMat;
    }

    // Chair casters (5 wheels)
    for (let c = 0; c < 5; c++) {
      const angle = (c / 5) * Math.PI * 2;
      const cx = Math.cos(angle) * 0.22;
      const cz = Math.sin(angle) * 0.22;
      const caster = BABYLON.MeshBuilder.CreateSphere(`chair_caster_${di}_${c}`, { diameter: 0.04, segments: 6 }, scene);
      caster.position = new BABYLON.Vector3(dp.x + cx, 0.02, dp.z + 0.7 + cz);
      caster.material = blackMat;
    }
  });

  // ---------- Bookshelves along back wall ----------
  const shelfPositions = [{ x: -12, z: -9 }, { x: -6, z: -9 }, { x: 6, z: -9 }, { x: 12, z: -9 }];
  const bookColors = [
    new BABYLON.Color3(0.6, 0.15, 0.15),
    new BABYLON.Color3(0.15, 0.25, 0.55),
    new BABYLON.Color3(0.12, 0.45, 0.2),
    new BABYLON.Color3(0.7, 0.55, 0.1),
    new BABYLON.Color3(0.5, 0.2, 0.5),
    new BABYLON.Color3(0.3, 0.3, 0.3),
    new BABYLON.Color3(0.8, 0.45, 0.1),
  ];

  shelfPositions.forEach((sp, si) => {
    // Shelf frame
    const frame = BABYLON.MeshBuilder.CreateBox(`bookshelf_${si}`, { width: 1.8, height: 2.2, depth: 0.4 }, scene);
    frame.position = new BABYLON.Vector3(sp.x, 1.1, sp.z);
    frame.material = darkWoodMat;
    frame.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(frame);

    // Shelves (4 levels)
    for (let s = 0; s < 4; s++) {
      const shelfY = 0.35 + s * 0.5;
      // Books
      const bookCount = 4 + Math.floor(seededRandom(si * 111 + s * 7) * 4);
      let bx = -0.7;
      for (let b = 0; b < bookCount; b++) {
        const bw = 0.04 + seededRandom(si * 200 + s * 30 + b) * 0.06;
        const bh = 0.22 + seededRandom(si * 300 + s * 40 + b) * 0.12;
        const book = BABYLON.MeshBuilder.CreateBox(`book_${si}_${s}_${b}`, { width: bw, height: bh, depth: 0.28 }, scene);
        book.position = new BABYLON.Vector3(sp.x + bx, shelfY + bh / 2, sp.z);
        const bMat = new BABYLON.StandardMaterial(`bookMat_${si}_${s}_${b}`, scene);
        bMat.diffuseColor = bookColors[Math.floor(seededRandom(si * 400 + s * 50 + b * 3) * bookColors.length)];
        book.material = bMat;
        bx += bw + 0.01;
        if (bx > 0.7) break;
      }
    }
  });

  // ---------- Additional office islands to fill the empty half of the room ----------
  const annexDeskClusters = [
    { x: -10.5, z: 1.5, rotation: 0 },
    { x: 9.5, z: 2.5, rotation: 0 },
  ];

  annexDeskClusters.forEach((cluster, ci) => {
    const deskOffsets = [-1.45, 1.45];

    deskOffsets.forEach((offset, di) => {
      const deskX = cluster.x + offset;
      const deskZ = cluster.z;
      const suffix = `annex_${ci}_${di}`;

      const top = BABYLON.MeshBuilder.CreateBox(`desk_top_${suffix}`, { width: 2.1, height: 0.05, depth: 1.1 }, scene);
      top.position = new BABYLON.Vector3(deskX, 0.75, deskZ);
      top.material = deskMat;
      top.receiveShadows = true;
      top.checkCollisions = true;
      if (shadowGenerator) shadowGenerator.addShadowCaster(top);

      for (let l = 0; l < 4; l++) {
        const lx = l % 2 === 0 ? -0.9 : 0.9;
        const lz = l < 2 ? -0.45 : 0.45;
        const leg = BABYLON.MeshBuilder.CreateBox(`desk_leg_${suffix}_${l}`, { width: 0.05, height: 0.75, depth: 0.05 }, scene);
        leg.position = new BABYLON.Vector3(deskX + lx, 0.375, deskZ + lz);
        leg.material = metalMat;
      }

      const monitorStand = BABYLON.MeshBuilder.CreateBox(`monitor_stand_${suffix}`, { width: 0.12, height: 0.22, depth: 0.08 }, scene);
      monitorStand.position = new BABYLON.Vector3(deskX, 0.88, deskZ - 0.22);
      monitorStand.material = blackMat;

      const monitorScreen = BABYLON.MeshBuilder.CreateBox(`monitor_screen_${suffix}`, { width: 0.82, height: 0.48, depth: 0.03 }, scene);
      monitorScreen.position = new BABYLON.Vector3(deskX, 1.18, deskZ - 0.26);
      monitorScreen.material = screenMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(monitorScreen);

      const keyboard = BABYLON.MeshBuilder.CreateBox(`keyboard_${suffix}`, { width: 0.42, height: 0.015, depth: 0.14 }, scene);
      keyboard.position = new BABYLON.Vector3(deskX - 0.12, 0.785, deskZ + 0.12);
      keyboard.material = blackMat;

      const chairBase = BABYLON.MeshBuilder.CreateCylinder(`chair_base_${suffix}`, { height: 0.04, diameter: 0.45, tessellation: 14 }, scene);
      chairBase.position = new BABYLON.Vector3(deskX, 0.02, deskZ + 0.62);
      chairBase.material = blackMat;

      const chairPole = BABYLON.MeshBuilder.CreateCylinder(`chair_pole_${suffix}`, { height: 0.38, diameter: 0.05, tessellation: 8 }, scene);
      chairPole.position = new BABYLON.Vector3(deskX, 0.21, deskZ + 0.62);
      chairPole.material = metalMat;

      const chairSeat = BABYLON.MeshBuilder.CreateBox(`chair_seat_${suffix}`, { width: 0.42, height: 0.06, depth: 0.42 }, scene);
      chairSeat.position = new BABYLON.Vector3(deskX, 0.42, deskZ + 0.62);
      chairSeat.material = chairFabricMat;
      chairSeat.checkCollisions = true;

      const chairBack = BABYLON.MeshBuilder.CreateBox(`chair_back_${suffix}`, { width: 0.42, height: 0.42, depth: 0.04 }, scene);
      chairBack.position = new BABYLON.Vector3(deskX, 0.68, deskZ + 0.84);
      chairBack.material = chairFabricMat;
      if (shadowGenerator) shadowGenerator.addShadowCaster(chairSeat);
    });

    const islandDivider = BABYLON.MeshBuilder.CreateBox(`annex_divider_${ci}`, { width: 0.12, height: 1.15, depth: 2.5 }, scene);
    islandDivider.position = new BABYLON.Vector3(cluster.x, 1.08, cluster.z + 0.05);
    islandDivider.material = whiteMat;
    islandDivider.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(islandDivider);

    const planter = BABYLON.MeshBuilder.CreateBox(`annex_planter_${ci}`, { width: 0.42, height: 0.4, depth: 1.6 }, scene);
    planter.position = new BABYLON.Vector3(cluster.x, 0.2, cluster.z - 0.95);
    planter.material = darkWoodMat;
    planter.checkCollisions = true;

    for (let p = 0; p < 3; p++) {
      const plant = BABYLON.MeshBuilder.CreateSphere(`annex_plant_${ci}_${p}`, { diameter: 0.34, segments: 8 }, scene);
      plant.position = new BABYLON.Vector3(cluster.x, 0.55 + (p % 2) * 0.08, cluster.z - 1.42 + p * 0.45);
      plant.scaling = new BABYLON.Vector3(0.9, 1.2, 0.9);
      plant.material = greenMat;
    }
  });

  const sideStorageBanks = [
    { x: -9.5, z: 10.8, count: 3 },
    { x: 9.5, z: 10.8, count: 2 },
  ];

  sideStorageBanks.forEach((bank, bi) => {
    for (let i = 0; i < bank.count; i++) {
      const shelfX = bank.x + i * 1.3;
      const shelf = BABYLON.MeshBuilder.CreateBox(`side_storage_${bi}_${i}`, { width: 1.0, height: 1.95, depth: 0.42 }, scene);
      shelf.position = new BABYLON.Vector3(shelfX, 0.975, bank.z);
      shelf.material = darkWoodMat;
      shelf.checkCollisions = true;
      if (shadowGenerator) shadowGenerator.addShadowCaster(shelf);

      for (let level = 0; level < 3; level++) {
        const levelY = 0.35 + level * 0.52;
        for (let b = 0; b < 4; b++) {
          const binder = BABYLON.MeshBuilder.CreateBox(`side_binder_${bi}_${i}_${level}_${b}`, {
            width: 0.12,
            height: 0.26 + seededRandom((bi + 1) * 200 + i * 20 + level * 5 + b) * 0.08,
            depth: 0.26,
          }, scene);
          binder.position = new BABYLON.Vector3(shelfX - 0.3 + b * 0.18, levelY, bank.z);
          const binderMat = new BABYLON.StandardMaterial(`side_binder_mat_${bi}_${i}_${level}_${b}`, scene);
          binderMat.diffuseColor = bookColors[(bi + i + level + b) % bookColors.length];
          binder.material = binderMat;
        }
      }
    }
  });

  const collaborationTable = BABYLON.MeshBuilder.CreateBox('off_collabTable', { width: 2.8, height: 0.06, depth: 1.4 }, scene);
  collaborationTable.position = new BABYLON.Vector3(0, 0.76, 1.8);
  collaborationTable.material = deskMat;
  collaborationTable.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(collaborationTable);

  for (let l = 0; l < 4; l++) {
    const lx = l % 2 === 0 ? -1.2 : 1.2;
    const lz = l < 2 ? -0.55 : 0.55;
    const leg = BABYLON.MeshBuilder.CreateBox(`off_collabLeg_${l}`, { width: 0.05, height: 0.75, depth: 0.05 }, scene);
    leg.position = new BABYLON.Vector3(lx, 0.375, 1.8 + lz);
    leg.material = metalMat;
  }

  const collaborationChairPositions = [
    { x: -1.1, z: 3.0 },
    { x: 0, z: 3.0 },
    { x: 1.1, z: 3.0 },
    { x: -1.1, z: 0.62 },
    { x: 1.1, z: 0.62 },
  ];

  collaborationChairPositions.forEach((cp, ci) => {
    const chairSeat = BABYLON.MeshBuilder.CreateBox(`off_collabSeat_${ci}`, { width: 0.42, height: 0.06, depth: 0.42 }, scene);
    chairSeat.position = new BABYLON.Vector3(cp.x, 0.46, cp.z);
    chairSeat.material = ci % 2 === 0 ? chairFabricMat : whiteMat;
    chairSeat.checkCollisions = true;

    const chairBack = BABYLON.MeshBuilder.CreateBox(`off_collabBack_${ci}`, { width: 0.42, height: 0.42, depth: 0.04 }, scene);
    const backOffset = cp.z > 1.8 ? 0.23 : -0.23;
    chairBack.position = new BABYLON.Vector3(cp.x, 0.74, cp.z + backOffset);
    chairBack.material = ci % 2 === 0 ? chairFabricMat : whiteMat;

    for (let l = 0; l < 4; l++) {
      const lx = l % 2 === 0 ? -0.16 : 0.16;
      const lz = l < 2 ? -0.16 : 0.16;
      const leg = BABYLON.MeshBuilder.CreateBox(`off_collabChairLeg_${ci}_${l}`, { width: 0.035, height: 0.44, depth: 0.035 }, scene);
      leg.position = new BABYLON.Vector3(cp.x + lx, 0.22, cp.z + lz);
      leg.material = metalMat;
    }
  });

  // ---------- Filing cabinets distributed along walls ----------
  const filingCabinetPositions = [
    // West wall
    { x: -14.2, z: -11, ry: Math.PI / 2 },
    { x: -14.2, z: -7, ry: Math.PI / 2 },
    { x: -14.2, z: 6, ry: Math.PI / 2 },
    { x: -14.2, z: 13, ry: Math.PI / 2 },
    // East wall
    { x: 14.2, z: -11, ry: -Math.PI / 2 },
    { x: 14.2, z: -7, ry: -Math.PI / 2 },
    { x: 14.2, z: 6, ry: -Math.PI / 2 },
    { x: 14.2, z: 13, ry: -Math.PI / 2 },
    // South wall
    { x: -10, z: 14.2, ry: Math.PI },
    { x: -3, z: 14.2, ry: Math.PI },
    { x: 4, z: 14.2, ry: Math.PI },
  ];

  filingCabinetPositions.forEach((fc, fi) => {
    const cabinet = BABYLON.MeshBuilder.CreateBox(`off_filing_${fi}`, { width: 1.2, height: 1.4, depth: 0.55 }, scene);
    cabinet.position = new BABYLON.Vector3(fc.x, 0.7, fc.z);
    cabinet.rotation.y = fc.ry;
    cabinet.material = fi % 2 === 0 ? metalMat : darkWoodMat;
    cabinet.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(cabinet);

    // 3 drawer fronts
    for (let d = 0; d < 3; d++) {
      const drawer = BABYLON.MeshBuilder.CreateBox(`off_filing_drawer_${fi}_${d}`, { width: 1.05, height: 0.38, depth: 0.04 }, scene);
      const dy = 0.2 + d * 0.42;
      // place drawer on the front face according to rotation
      const dirX = Math.sin(fc.ry);
      const dirZ = Math.cos(fc.ry);
      drawer.position = new BABYLON.Vector3(fc.x + dirX * 0.28, dy, fc.z + dirZ * 0.28);
      drawer.rotation.y = fc.ry;
      drawer.material = fi % 2 === 0 ? blackMat : metalMat;

      // handle
      const handle = BABYLON.MeshBuilder.CreateBox(`off_filing_handle_${fi}_${d}`, { width: 0.18, height: 0.03, depth: 0.04 }, scene);
      handle.position = new BABYLON.Vector3(fc.x + dirX * 0.31, dy, fc.z + dirZ * 0.31);
      handle.rotation.y = fc.ry;
      handle.material = metalMat;
    }

    // small decoration on top (folder stack or plant) - varies by index
    if (fi % 3 === 0) {
      const plant = BABYLON.MeshBuilder.CreateSphere(`off_filing_plant_${fi}`, { diameter: 0.34, segments: 8 }, scene);
      plant.position = new BABYLON.Vector3(fc.x, 1.55, fc.z);
      plant.scaling = new BABYLON.Vector3(1, 1.2, 1);
      plant.material = greenMat;
    } else if (fi % 3 === 1) {
      const folderStack = BABYLON.MeshBuilder.CreateBox(`off_filing_folders_${fi}`, { width: 0.7, height: 0.18, depth: 0.32 }, scene);
      folderStack.position = new BABYLON.Vector3(fc.x, 1.49, fc.z);
      const folderMat = new BABYLON.StandardMaterial(`off_filing_foldersMat_${fi}`, scene);
      folderMat.diffuseColor = bookColors[fi % bookColors.length];
      folderStack.material = folderMat;
    } else {
      const lamp = BABYLON.MeshBuilder.CreateCylinder(`off_filing_lamp_${fi}`, { height: 0.28, diameterTop: 0.18, diameterBottom: 0.12, tessellation: 12 }, scene);
      lamp.position = new BABYLON.Vector3(fc.x, 1.54, fc.z);
      const lampMat = new BABYLON.StandardMaterial(`off_filing_lampMat_${fi}`, scene);
      lampMat.diffuseColor = new BABYLON.Color3(0.9, 0.85, 0.6);
      lampMat.emissiveColor = new BABYLON.Color3(0.4, 0.35, 0.2);
      lamp.material = lampMat;
    }
  });

  // ---------- Corner pieces: water cooler, printer station, plants ----------
  // Water cooler — front-left corner
  const waterBase = BABYLON.MeshBuilder.CreateBox('off_waterBase', { width: 0.4, height: 0.9, depth: 0.4 }, scene);
  waterBase.position = new BABYLON.Vector3(-12.5, 0.45, -12.5);
  waterBase.material = whiteMat;
  waterBase.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(waterBase);

  const waterTank = BABYLON.MeshBuilder.CreateCylinder('off_waterTank', { height: 0.5, diameter: 0.32, tessellation: 16 }, scene);
  waterTank.position = new BABYLON.Vector3(-12.5, 1.15, -12.5);
  const waterMat2 = new BABYLON.StandardMaterial('off_waterMat22', scene);
  waterMat2.diffuseColor = new BABYLON.Color3(0.55, 0.75, 0.85);
  waterMat2.alpha = 0.7;
  waterTank.material = waterMat2;

  // Printer station — front-right corner
  const printerCounterB = BABYLON.MeshBuilder.CreateBox('off_printerCounterB', { width: 1.8, height: 0.05, depth: 0.7 }, scene);
  printerCounterB.position = new BABYLON.Vector3(12.5, 0.75, -12.5);
  printerCounterB.material = deskMat;
  printerCounterB.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(printerCounterB);

  for (let l = 0; l < 4; l++) {
    const lx = l % 2 === 0 ? -0.8 : 0.8;
    const lz = l < 2 ? -0.3 : 0.3;
    const leg = BABYLON.MeshBuilder.CreateBox(`off_printerBLeg_${l}`, { width: 0.05, height: 0.75, depth: 0.05 }, scene);
    leg.position = new BABYLON.Vector3(12.5 + lx, 0.375, -12.5 + lz);
    leg.material = metalMat;
  }

  const printerB = BABYLON.MeshBuilder.CreateBox('off_printerB', { width: 0.7, height: 0.45, depth: 0.55 }, scene);
  printerB.position = new BABYLON.Vector3(12.5, 1.025, -12.5);
  const printerMatB = new BABYLON.StandardMaterial('off_printerMatB', scene);
  printerMatB.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.88);
  printerB.material = printerMatB;
  if (shadowGenerator) shadowGenerator.addShadowCaster(printerB);

  const printerTrayB = BABYLON.MeshBuilder.CreateBox('off_printerTrayB', { width: 0.55, height: 0.05, depth: 0.35 }, scene);
  printerTrayB.position = new BABYLON.Vector3(12.5, 1.28, -12.3);
  printerTrayB.material = whiteMat;

  // Tall plant — between desk rows on west side
  const tallPlantPot = BABYLON.MeshBuilder.CreateCylinder('off_tallPlantPot', { height: 0.5, diameterTop: 0.45, diameterBottom: 0.32, tessellation: 14 }, scene);
  tallPlantPot.position = new BABYLON.Vector3(-12, 0.25, 0);
  tallPlantPot.material = darkWoodMat;
  tallPlantPot.checkCollisions = true;

  const tallPlantTrunk = BABYLON.MeshBuilder.CreateCylinder('off_tallPlantTrunk', { height: 1.4, diameter: 0.08, tessellation: 8 }, scene);
  tallPlantTrunk.position = new BABYLON.Vector3(-12, 1.2, 0);
  tallPlantTrunk.material = darkWoodMat;

  for (let f = 0; f < 4; f++) {
    const foliage = BABYLON.MeshBuilder.CreateSphere(`off_tallPlantFoliage_${f}`, { diameter: 0.55 + f * 0.05, segments: 8 }, scene);
    foliage.position = new BABYLON.Vector3(-12 + (f - 1.5) * 0.2, 1.7 + f * 0.18, (f % 2 === 0 ? 0.15 : -0.15));
    foliage.scaling = new BABYLON.Vector3(1, 0.7, 1);
    foliage.material = greenMat;
  }

  // Tall plant — east side mirror
  const tallPlantPot2 = BABYLON.MeshBuilder.CreateCylinder('off_tallPlantPot2', { height: 0.5, diameterTop: 0.45, diameterBottom: 0.32, tessellation: 14 }, scene);
  tallPlantPot2.position = new BABYLON.Vector3(12, 0.25, 0);
  tallPlantPot2.material = darkWoodMat;
  tallPlantPot2.checkCollisions = true;

  const tallPlantTrunk2 = BABYLON.MeshBuilder.CreateCylinder('off_tallPlantTrunk2', { height: 1.4, diameter: 0.08, tessellation: 8 }, scene);
  tallPlantTrunk2.position = new BABYLON.Vector3(12, 1.2, 0);
  tallPlantTrunk2.material = darkWoodMat;

  for (let f = 0; f < 4; f++) {
    const foliage = BABYLON.MeshBuilder.CreateSphere(`off_tallPlantFoliage2_${f}`, { diameter: 0.55 + f * 0.05, segments: 8 }, scene);
    foliage.position = new BABYLON.Vector3(12 + (f - 1.5) * 0.2, 1.7 + f * 0.18, (f % 2 === 0 ? 0.15 : -0.15));
    foliage.scaling = new BABYLON.Vector3(1, 0.7, 1);
    foliage.material = greenMat;
  }

  // ---------- Sofa lounge area — front of room (between spawn and back wall) ----------
  const sofa = BABYLON.MeshBuilder.CreateBox('off_sofa', { width: 2.4, height: 0.55, depth: 0.9 }, scene);
  sofa.position = new BABYLON.Vector3(0, 0.275, -11);
  sofa.material = chairFabricMat;
  sofa.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(sofa);

  const sofaBack = BABYLON.MeshBuilder.CreateBox('off_sofaBack', { width: 2.4, height: 0.7, depth: 0.2 }, scene);
  sofaBack.position = new BABYLON.Vector3(0, 0.9, -11.4);
  sofaBack.material = chairFabricMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(sofaBack);

  for (let a = 0; a < 2; a++) {
    const arm = BABYLON.MeshBuilder.CreateBox(`off_sofaArm_${a}`, { width: 0.18, height: 0.7, depth: 0.9 }, scene);
    arm.position = new BABYLON.Vector3(a === 0 ? -1.2 : 1.2, 0.45, -11);
    arm.material = chairFabricMat;
  }

  // Coffee table in front of sofa
  const coffeeTable = BABYLON.MeshBuilder.CreateBox('off_coffeeTable', { width: 1.4, height: 0.04, depth: 0.7 }, scene);
  coffeeTable.position = new BABYLON.Vector3(0, 0.4, -9.5);
  coffeeTable.material = darkWoodMat;
  coffeeTable.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(coffeeTable);

  for (let l = 0; l < 4; l++) {
    const lx = l % 2 === 0 ? -0.6 : 0.6;
    const lz = l < 2 ? -0.28 : 0.28;
    const leg = BABYLON.MeshBuilder.CreateCylinder(`off_coffeeTableLeg_${l}`, { height: 0.4, diameter: 0.04, tessellation: 8 }, scene);
    leg.position = new BABYLON.Vector3(lx, 0.2, -9.5 + lz);
    leg.material = metalMat;
  }

  // Magazines on coffee table
  const magazine = BABYLON.MeshBuilder.CreateBox('off_magazine', { width: 0.32, height: 0.01, depth: 0.22 }, scene);
  magazine.position = new BABYLON.Vector3(0.2, 0.425, -9.5);
  const magMat = new BABYLON.StandardMaterial('off_magMat', scene);
  magMat.diffuseColor = bookColors[1];
  magazine.material = magMat;

  // ---------- Windows on side walls ----------
  const windowPositions = [
    { x: -14.9, z: -6, ry: Math.PI / 2 },
    { x: -14.9, z: 2, ry: Math.PI / 2 },
    { x: -14.9, z: 10, ry: Math.PI / 2 },
    { x: 14.9, z: -6, ry: -Math.PI / 2 },
    { x: 14.9, z: 2, ry: -Math.PI / 2 },
    { x: 14.9, z: 10, ry: -Math.PI / 2 },
  ];

  windowPositions.forEach((wp, wi) => {
    // Window frame
    const wFrame = BABYLON.MeshBuilder.CreateBox(`winFrame_${wi}`, { width: 2.0, height: 1.8, depth: 0.08 }, scene);
    wFrame.position = new BABYLON.Vector3(wp.x, 1.8, wp.z);
    wFrame.rotation.y = wp.ry;
    wFrame.material = whiteMat;

    // Glass pane
    const glass = BABYLON.MeshBuilder.CreatePlane(`winGlass_${wi}`, { width: 1.8, height: 1.6 }, scene);
    glass.position = new BABYLON.Vector3(wp.x, 1.8, wp.z);
    glass.rotation.y = wp.ry;
    glass.material = glassMat;

    // Sill
    const sill = BABYLON.MeshBuilder.CreateBox(`winSill_${wi}`, { width: 2.1, height: 0.04, depth: 0.15 }, scene);
    sill.position = new BABYLON.Vector3(wp.x, 0.88, wp.z);
    sill.rotation.y = wp.ry;
    sill.material = whiteMat;

    // Potted plant on some windowsills
    if (seededRandom(wi * 55) > 0.5) {
      const pot = BABYLON.MeshBuilder.CreateCylinder(`pot_${wi}`, { height: 0.12, diameterTop: 0.12, diameterBottom: 0.08, tessellation: 10 }, scene);
      pot.position = new BABYLON.Vector3(wp.x + (wp.ry > 0 ? 0.08 : -0.08), 0.96, wp.z);
      const potMat = new BABYLON.StandardMaterial(`potMat_${wi}`, scene);
      potMat.diffuseColor = new BABYLON.Color3(0.65, 0.35, 0.2);
      pot.material = potMat;

      const plant = BABYLON.MeshBuilder.CreateSphere(`plant_${wi}`, { diameter: 0.2, segments: 8 }, scene);
      plant.position = new BABYLON.Vector3(pot.position.x, 1.1, wp.z);
      plant.scaling = new BABYLON.Vector3(1, 1.3, 1);
      plant.material = greenMat;
    }
  });

  // ---------- Posters / wall art ----------
  const posterColors = [
    new BABYLON.Color3(0.2, 0.45, 0.7),
    new BABYLON.Color3(0.8, 0.3, 0.2),
    new BABYLON.Color3(0.15, 0.6, 0.35),
    new BABYLON.Color3(0.7, 0.55, 0.15),
  ];
  const posterWallPositions = [
    { x: -4, z: -9.9, ry: 0 },
    { x: 4, z: -9.9, ry: 0 },
    { x: -4, z: 9.9, ry: Math.PI },
    { x: 4, z: 9.9, ry: Math.PI },
  ];
  posterWallPositions.forEach((pp, pi) => {
    const poster = BABYLON.MeshBuilder.CreatePlane(`poster_${pi}`, { width: 0.8, height: 1.1 }, scene);
    poster.position = new BABYLON.Vector3(pp.x, 2.0, pp.z);
    poster.rotation.y = pp.ry;
    const pMat = new BABYLON.StandardMaterial(`posterMat_${pi}`, scene);
    pMat.diffuseColor = posterColors[pi % posterColors.length];
    pMat.emissiveColor = posterColors[pi % posterColors.length].scale(0.08);
    poster.material = pMat;

    // Frame border
    const frame = BABYLON.MeshBuilder.CreateBox(`posterFrame_${pi}`, { width: 0.88, height: 1.18, depth: 0.02 }, scene);
    frame.position = new BABYLON.Vector3(pp.x, 2.0, pp.z + (pp.ry === 0 ? 0.01 : -0.01));
    frame.rotation.y = pp.ry;
    frame.material = blackMat;
  });

  // ---------- Break Area (back-right corner) ----------
  const breakX = 10, breakZ = 10;

  // Coffee machine
  const coffeeMachine = BABYLON.MeshBuilder.CreateBox('off_coffee', { width: 0.4, height: 0.5, depth: 0.35 }, scene);
  coffeeMachine.position = new BABYLON.Vector3(breakX, 1.0, breakZ - 0.5);
  const coffeeMat = new BABYLON.StandardMaterial('off_coffeeMat', scene);
  coffeeMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.18);
  coffeeMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  coffeeMachine.material = coffeeMat;
  coffeeMachine.checkCollisions = true;

  // Counter for coffee machine
  const counter = BABYLON.MeshBuilder.CreateBox('off_counter', { width: 2.5, height: 0.05, depth: 0.6 }, scene);
  counter.position = new BABYLON.Vector3(breakX, 0.75, breakZ - 0.5);
  counter.material = deskMat;
  counter.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(counter);

  // Counter legs
  for (let cl = 0; cl < 4; cl++) {
    const clx = (cl % 2 === 0 ? -1.1 : 1.1);
    const clz = (cl < 2 ? -0.2 : 0.2);
    const cleg = BABYLON.MeshBuilder.CreateBox(`off_counterLeg_${cl}`, { width: 0.04, height: 0.75, depth: 0.04 }, scene);
    cleg.position = new BABYLON.Vector3(breakX + clx, 0.375, breakZ - 0.5 + clz);
    cleg.material = metalMat;
  }

  // Fridge
  const fridge = BABYLON.MeshBuilder.CreateBox('off_fridge', { width: 0.6, height: 1.7, depth: 0.6 }, scene);
  fridge.position = new BABYLON.Vector3(breakX + 2, 0.85, breakZ - 0.5);
  const fridgeMat = new BABYLON.StandardMaterial('off_fridgeMat', scene);
  fridgeMat.diffuseColor = new BABYLON.Color3(0.88, 0.88, 0.9);
  fridgeMat.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  fridgeMat.specularPower = 64;
  fridge.material = fridgeMat;
  fridge.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(fridge);

  // Fridge handle
  const fridgeHandle = BABYLON.MeshBuilder.CreateBox('off_fridgeHandle', { width: 0.03, height: 0.4, depth: 0.04 }, scene);
  fridgeHandle.position = new BABYLON.Vector3(breakX + 2.28, 1.2, breakZ - 0.22);
  fridgeHandle.material = metalMat;

  // Lounge chairs (2)
  for (let lc = 0; lc < 2; lc++) {
    const lcx = breakX - 1.5 + lc * 2;
    const lcz = breakZ + 1.5;

    const loungeSeat = BABYLON.MeshBuilder.CreateBox(`off_lounge_${lc}`, { width: 0.7, height: 0.35, depth: 0.7 }, scene);
    loungeSeat.position = new BABYLON.Vector3(lcx, 0.35, lcz);
    const loungeMat = new BABYLON.StandardMaterial(`off_loungeMat_${lc}`, scene);
    loungeMat.diffuseColor = lc === 0 ? new BABYLON.Color3(0.6, 0.15, 0.1) : new BABYLON.Color3(0.15, 0.3, 0.55);
    loungeMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    loungeSeat.material = loungeMat;
    loungeSeat.checkCollisions = true;

    const loungeBack = BABYLON.MeshBuilder.CreateBox(`off_loungeBack_${lc}`, { width: 0.7, height: 0.4, depth: 0.08 }, scene);
    loungeBack.position = new BABYLON.Vector3(lcx, 0.7, lcz + 0.32);
    loungeBack.material = loungeMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(loungeSeat);
  }

  // Small round table between lounge chairs
  const roundTable = BABYLON.MeshBuilder.CreateCylinder('off_roundTable', { height: 0.04, diameter: 0.6, tessellation: 24 }, scene);
  roundTable.position = new BABYLON.Vector3(breakX, 0.52, breakZ + 1.5);
  roundTable.material = deskMat;

  const roundTableLeg = BABYLON.MeshBuilder.CreateCylinder('off_roundTableLeg', { height: 0.5, diameter: 0.06, tessellation: 8 }, scene);
  roundTableLeg.position = new BABYLON.Vector3(breakX, 0.25, breakZ + 1.5);
  roundTableLeg.material = metalMat;

  // ---------- Water dispenser ----------
  const dispenser = BABYLON.MeshBuilder.CreateBox('off_water', { width: 0.35, height: 1.1, depth: 0.35 }, scene);
  dispenser.position = new BABYLON.Vector3(-12, 0.55, 9);
  dispenser.material = whiteMat;
  dispenser.checkCollisions = true;

  const dispenserBottle = BABYLON.MeshBuilder.CreateCylinder('off_waterBottle', { height: 0.45, diameter: 0.25, tessellation: 12 }, scene);
  dispenserBottle.position = new BABYLON.Vector3(-12, 1.35, 9);
  const waterBottleMat = new BABYLON.StandardMaterial('off_waterBottleMat', scene);
  waterBottleMat.diffuseColor = new BABYLON.Color3(0.6, 0.8, 0.95);
  waterBottleMat.alpha = 0.6;
  dispenserBottle.material = waterBottleMat;

  // ---------- Filing cabinets ----------
  const cabinetPositions = [{ x: -13, z: -8 }, { x: -13, z: -5 }, { x: 13, z: -8 }, { x: 13, z: -5 }];
  cabinetPositions.forEach((cp, ci) => {
    const cabinet = BABYLON.MeshBuilder.CreateBox(`off_cabinet_${ci}`, { width: 0.5, height: 1.3, depth: 0.6 }, scene);
    cabinet.position = new BABYLON.Vector3(cp.x, 0.65, cp.z);
    cabinet.material = metalMat;
    cabinet.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(cabinet);

    // Drawer handles (3 drawers)
    for (let d = 0; d < 3; d++) {
      const handle = BABYLON.MeshBuilder.CreateBox(`off_cabHandle_${ci}_${d}`, { width: 0.15, height: 0.02, depth: 0.03 }, scene);
      handle.position = new BABYLON.Vector3(cp.x, 0.25 + d * 0.4, cp.z - 0.31);
      handle.material = blackMat;
    }
  });

  // ---------- Printer ----------
  const printer = BABYLON.MeshBuilder.CreateBox('off_printerB', { width: 0.5, height: 0.35, depth: 0.4 }, scene);
  printer.position = new BABYLON.Vector3(0, 0.93, -8);
  const printerMat = new BABYLON.StandardMaterial('off_printerMatB', scene);
  printerMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.28);
  printerMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  printer.material = printerMat;
  printer.checkCollisions = true;

  // Printer stand
  const printerStand = BABYLON.MeshBuilder.CreateBox('off_printerStand', { width: 0.6, height: 0.75, depth: 0.5 }, scene);
  printerStand.position = new BABYLON.Vector3(0, 0.375, -8);
  printerStand.material = whiteMat;
  printerStand.checkCollisions = true;

  // ---------- Coat rack near entrance ----------
  const coatRackPole = BABYLON.MeshBuilder.CreateCylinder('off_coatRack', { height: 1.8, diameter: 0.04, tessellation: 8 }, scene);
  coatRackPole.position = new BABYLON.Vector3(-13, 0.9, 8);
  coatRackPole.material = darkWoodMat;

  const coatRackBase = BABYLON.MeshBuilder.CreateCylinder('off_coatRackBase', { height: 0.04, diameter: 0.4, tessellation: 16 }, scene);
  coatRackBase.position = new BABYLON.Vector3(-13, 0.02, 8);
  coatRackBase.material = darkWoodMat;

  // Hooks
  for (let h = 0; h < 4; h++) {
    const angle = (h / 4) * Math.PI * 2;
    const hook = BABYLON.MeshBuilder.CreateBox(`off_hook_${h}`, { width: 0.12, height: 0.02, depth: 0.02 }, scene);
    hook.position = new BABYLON.Vector3(
      -13 + Math.cos(angle) * 0.08,
      1.75,
      8 + Math.sin(angle) * 0.08
    );
    hook.rotation.y = angle;
    hook.material = metalMat;
  }

  // ---------- Floor rug (meeting area) ----------
  const rug = BABYLON.MeshBuilder.CreateGround('off_rug', { width: 4, height: 3 }, scene);
  rug.position = new BABYLON.Vector3(breakX, 0.01, breakZ + 1.5);
  const rugMat = new BABYLON.StandardMaterial('off_rugMat', scene);
  rugMat.diffuseColor = new BABYLON.Color3(0.45, 0.12, 0.1);
  rugMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  rug.material = rugMat;

  // ---------- NORTH WALL: reception + lockers + bookshelves ----------
  // Reception desk (long, against north wall)
  const receptionDesk = BABYLON.MeshBuilder.CreateBox('off_receptionDesk', { width: 4.5, height: 1.1, depth: 0.85 }, scene);
  receptionDesk.position = new BABYLON.Vector3(-6, 0.55, -14.2);
  receptionDesk.material = darkWoodMat;
  receptionDesk.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(receptionDesk);

  // Reception desk top (lighter)
  const receptionTop = BABYLON.MeshBuilder.CreateBox('off_receptionTop', { width: 4.7, height: 0.06, depth: 0.95 }, scene);
  receptionTop.position = new BABYLON.Vector3(-6, 1.13, -14.2);
  receptionTop.material = whiteMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(receptionTop);

  // Reception desk monitor + items
  const recMonitorStand = BABYLON.MeshBuilder.CreateBox('off_recMonStand', { width: 0.12, height: 0.22, depth: 0.08 }, scene);
  recMonitorStand.position = new BABYLON.Vector3(-7, 1.27, -14.0);
  recMonitorStand.material = blackMat;
  const recMonitor = BABYLON.MeshBuilder.CreateBox('off_recMonitor', { width: 0.85, height: 0.5, depth: 0.04 }, scene);
  recMonitor.position = new BABYLON.Vector3(-7, 1.6, -14.05);
  recMonitor.material = screenMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(recMonitor);

  // Reception phone
  const recPhone = BABYLON.MeshBuilder.CreateBox('off_recPhone', { width: 0.22, height: 0.06, depth: 0.18 }, scene);
  recPhone.position = new BABYLON.Vector3(-5, 1.19, -14.0);
  recPhone.material = blackMat;

  // Reception logo plaque on wall behind desk
  const recPlaque = BABYLON.MeshBuilder.CreatePlane('off_recPlaque', { width: 2.5, height: 0.8 }, scene);
  recPlaque.position = new BABYLON.Vector3(-6, 2.2, -14.85);
  const recPlaqueMat = new BABYLON.StandardMaterial('off_recPlaqueMat', scene);
  recPlaqueMat.diffuseColor = new BABYLON.Color3(0.25, 0.4, 0.6);
  recPlaqueMat.emissiveColor = new BABYLON.Color3(0.05, 0.08, 0.12);
  recPlaque.material = recPlaqueMat;

  // Lockers row against north wall (right side)
  const lockerColors = [
    new BABYLON.Color3(0.35, 0.5, 0.7),
    new BABYLON.Color3(0.55, 0.35, 0.3),
    new BABYLON.Color3(0.4, 0.55, 0.4),
    new BABYLON.Color3(0.5, 0.5, 0.55),
  ];
  for (let lk = 0; lk < 6; lk++) {
    const lockerX = 2 + lk * 0.85;
    const locker = BABYLON.MeshBuilder.CreateBox(`off_locker_${lk}`, { width: 0.8, height: 1.85, depth: 0.5 }, scene);
    locker.position = new BABYLON.Vector3(lockerX, 0.925, -14.45);
    const lockerMat = new BABYLON.StandardMaterial(`off_lockerMat_${lk}`, scene);
    lockerMat.diffuseColor = lockerColors[lk % lockerColors.length];
    lockerMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    locker.material = lockerMat;
    locker.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(locker);

    // Locker handle
    const lockerHandle = BABYLON.MeshBuilder.CreateBox(`off_lockerHandle_${lk}`, { width: 0.04, height: 0.12, depth: 0.04 }, scene);
    lockerHandle.position = new BABYLON.Vector3(lockerX + 0.25, 1.0, -14.18);
    lockerHandle.material = metalMat;

    // Locker number plate
    const lockerNum = BABYLON.MeshBuilder.CreatePlane(`off_lockerNum_${lk}`, { width: 0.18, height: 0.12 }, scene);
    lockerNum.position = new BABYLON.Vector3(lockerX, 1.55, -14.19);
    lockerNum.rotation.y = Math.PI;
    const lockerNumMat = new BABYLON.StandardMaterial(`off_lockerNumMat_${lk}`, scene);
    lockerNumMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
    lockerNumMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    lockerNum.material = lockerNumMat;
  }

  // Reception waiting chairs (in front of reception desk)
  for (let wc = 0; wc < 3; wc++) {
    const wcx = -8.5 + wc * 1.2;
    const waitSeat = BABYLON.MeshBuilder.CreateBox(`off_waitSeat_${wc}`, { width: 0.55, height: 0.08, depth: 0.55 }, scene);
    waitSeat.position = new BABYLON.Vector3(wcx, 0.45, -12.5);
    waitSeat.material = chairFabricMat;
    waitSeat.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(waitSeat);

    const waitBack = BABYLON.MeshBuilder.CreateBox(`off_waitBack_${wc}`, { width: 0.55, height: 0.55, depth: 0.06 }, scene);
    waitBack.position = new BABYLON.Vector3(wcx, 0.77, -12.78);
    waitBack.material = chairFabricMat;

    for (let l = 0; l < 4; l++) {
      const lx = l % 2 === 0 ? -0.22 : 0.22;
      const lz = l < 2 ? -0.22 : 0.22;
      const leg = BABYLON.MeshBuilder.CreateBox(`off_waitLeg_${wc}_${l}`, { width: 0.04, height: 0.45, depth: 0.04 }, scene);
      leg.position = new BABYLON.Vector3(wcx + lx, 0.22, -12.5 + lz);
      leg.material = metalMat;
    }
  }

  // Tall bookshelves against North wall (far left and far right)
  const northBookshelfPositions = [
    { x: -13, z: -14.4 },
    { x: 13, z: -14.4 },
  ];
  northBookshelfPositions.forEach((bp, bi) => {
    const bookshelf = BABYLON.MeshBuilder.CreateBox(`off_nBookshelf_${bi}`, { width: 1.6, height: 2.6, depth: 0.45 }, scene);
    bookshelf.position = new BABYLON.Vector3(bp.x, 1.3, bp.z);
    bookshelf.material = darkWoodMat;
    bookshelf.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(bookshelf);

    // Books on each shelf level
    for (let lvl = 0; lvl < 5; lvl++) {
      const yLvl = 0.3 + lvl * 0.5;
      for (let b = 0; b < 8; b++) {
        const book = BABYLON.MeshBuilder.CreateBox(`off_nBook_${bi}_${lvl}_${b}`, {
          width: 0.13,
          height: 0.32 + seededRandom(bi * 50 + lvl * 8 + b) * 0.1,
          depth: 0.28,
        }, scene);
        book.position = new BABYLON.Vector3(bp.x - 0.65 + b * 0.18, yLvl, bp.z + 0.05);
        const bookMat = new BABYLON.StandardMaterial(`off_nBookMat_${bi}_${lvl}_${b}`, scene);
        bookMat.diffuseColor = bookColors[(bi + lvl + b) % bookColors.length];
        book.material = bookMat;
      }
    }
  });

  // ---------- WHITEBOARDS on East and West walls (between window groups) ----------
  const whiteboardPositions = [
    { x: -14.85, z: -1, ry: Math.PI / 2 },
    { x: 14.85, z: -1, ry: -Math.PI / 2 },
  ];
  whiteboardPositions.forEach((wb, wi) => {
    const board = BABYLON.MeshBuilder.CreateBox(`off_whiteboard_${wi}`, { width: 0.04, height: 1.2, depth: 2.2 }, scene);
    board.position = new BABYLON.Vector3(wb.x, 1.7, wb.z);
    const boardMat = new BABYLON.StandardMaterial(`off_whiteboardMat_${wi}`, scene);
    boardMat.diffuseColor = new BABYLON.Color3(0.96, 0.96, 0.96);
    boardMat.emissiveColor = new BABYLON.Color3(0.12, 0.12, 0.12);
    board.material = boardMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(board);

    // Frame
    const frame = BABYLON.MeshBuilder.CreateBox(`off_wbFrame_${wi}`, { width: 0.06, height: 1.32, depth: 2.32 }, scene);
    frame.position = new BABYLON.Vector3(wb.x + (wb.x < 0 ? 0.01 : -0.01), 1.7, wb.z);
    frame.material = darkWoodMat;

    // Marker tray
    const tray = BABYLON.MeshBuilder.CreateBox(`off_wbTray_${wi}`, { width: 0.08, height: 0.04, depth: 2.2 }, scene);
    tray.position = new BABYLON.Vector3(wb.x + (wb.x < 0 ? 0.05 : -0.05), 1.06, wb.z);
    tray.material = metalMat;
  });

  // ---------- Tall bookshelves against East and West walls (mid-room) ----------
  const sideBookshelves = [
    { x: -14.3, z: -3, ry: Math.PI / 2 },
    { x: -14.3, z: 4, ry: Math.PI / 2 },
    { x: 14.3, z: -3, ry: -Math.PI / 2 },
    { x: 14.3, z: 4, ry: -Math.PI / 2 },
  ];
  sideBookshelves.forEach((sb, si) => {
    const sbMesh = BABYLON.MeshBuilder.CreateBox(`off_sideBook_${si}`, { width: 0.45, height: 2.3, depth: 1.4 }, scene);
    sbMesh.position = new BABYLON.Vector3(sb.x, 1.15, sb.z);
    sbMesh.material = darkWoodMat;
    sbMesh.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(sbMesh);

    // Books on shelves
    for (let lvl = 0; lvl < 4; lvl++) {
      const yLvl = 0.35 + lvl * 0.55;
      for (let b = 0; b < 6; b++) {
        const book = BABYLON.MeshBuilder.CreateBox(`off_sideBookItem_${si}_${lvl}_${b}`, {
          width: 0.28,
          height: 0.32 + seededRandom(si * 100 + lvl * 10 + b) * 0.1,
          depth: 0.13,
        }, scene);
        book.position = new BABYLON.Vector3(
          sb.x + (sb.x < 0 ? 0.05 : -0.05),
          yLvl,
          sb.z - 0.5 + b * 0.18
        );
        const bookMat = new BABYLON.StandardMaterial(`off_sideBookMat_${si}_${lvl}_${b}`, scene);
        bookMat.diffuseColor = bookColors[(si + lvl + b) % bookColors.length];
        book.material = bookMat;
      }
    }
  });

  // ---------- SOUTH WALL: large pinboard + extra cabinets between filing cabinets ----------
  // Big pinboard
  const pinboard = BABYLON.MeshBuilder.CreateBox('off_pinboard', { width: 3.5, height: 1.4, depth: 0.05 }, scene);
  pinboard.position = new BABYLON.Vector3(9, 1.9, 14.85);
  pinboard.rotation.y = Math.PI;
  const pinboardMat = new BABYLON.StandardMaterial('off_pinboardMat', scene);
  pinboardMat.diffuseColor = new BABYLON.Color3(0.45, 0.32, 0.22);
  pinboard.material = pinboardMat;

  // Notes pinned on it
  for (let n = 0; n < 8; n++) {
    const note = BABYLON.MeshBuilder.CreatePlane(`off_note_${n}`, {
      width: 0.28 + seededRandom(n * 7) * 0.1,
      height: 0.28 + seededRandom(n * 11) * 0.1,
    }, scene);
    note.position = new BABYLON.Vector3(
      7.6 + (n % 4) * 0.85,
      1.55 + Math.floor(n / 4) * 0.55,
      14.82,
    );
    note.rotation.y = Math.PI;
    const noteMat = new BABYLON.StandardMaterial(`off_noteMat_${n}`, scene);
    const colors = [[0.95, 0.9, 0.4], [0.9, 0.55, 0.55], [0.55, 0.85, 0.95], [0.85, 0.95, 0.6]];
    const c = colors[n % colors.length];
    noteMat.diffuseColor = new BABYLON.Color3(c[0], c[1], c[2]);
    noteMat.emissiveColor = new BABYLON.Color3(c[0] * 0.15, c[1] * 0.15, c[2] * 0.15);
    note.material = noteMat;
  }

  // ---------- Additional perimeter clusters to populate the other three sides ----------
  const perimeterClusters = [
    { name: 'westArchive', x: -11.2, z: 9.2, width: 4.4, depth: 1.8, rot: Math.PI / 2 },
    { name: 'eastMeeting', x: 11.1, z: 8.8, width: 3.8, depth: 2.2, rot: -Math.PI / 2 },
    { name: 'southArchive', x: 0.5, z: 12.1, width: 5.2, depth: 1.6, rot: Math.PI },
  ];

  perimeterClusters.forEach((cluster, ci) => {
    const credenza = BABYLON.MeshBuilder.CreateBox(`off_clusterCredenza_${cluster.name}`, {
      width: cluster.width,
      height: 1.15,
      depth: cluster.depth,
    }, scene);
    credenza.position = new BABYLON.Vector3(cluster.x, 0.575, cluster.z);
    credenza.rotation.y = cluster.rot;
    credenza.material = ci === 1 ? deskMat : darkWoodMat;
    credenza.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(credenza);

    const top = BABYLON.MeshBuilder.CreateBox(`off_clusterTop_${cluster.name}`, {
      width: cluster.width + 0.08,
      height: 0.05,
      depth: cluster.depth + 0.08,
    }, scene);
    top.position = new BABYLON.Vector3(cluster.x, 1.17, cluster.z);
    top.rotation.y = cluster.rot;
    top.material = whiteMat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(top);

    for (let d = 0; d < 3; d++) {
      const drawerOffset = -cluster.width / 3 + d * (cluster.width / 3);
      const dirX = Math.sin(cluster.rot);
      const dirZ = Math.cos(cluster.rot);

      const drawer = BABYLON.MeshBuilder.CreateBox(`off_clusterDrawer_${cluster.name}_${d}`, {
        width: cluster.width / 3 - 0.18,
        height: 0.28,
        depth: 0.05,
      }, scene);
      drawer.position = new BABYLON.Vector3(
        cluster.x + Math.cos(cluster.rot) * drawerOffset + dirX * (cluster.depth / 2 - 0.05),
        0.62,
        cluster.z - Math.sin(cluster.rot) * drawerOffset + dirZ * (cluster.depth / 2 - 0.05)
      );
      drawer.rotation.y = cluster.rot;
      drawer.material = ci === 1 ? whiteMat : metalMat;
    }
  });

  const westArchiveBoxes = [
    { x: -9.8, y: 1.38, z: 9.1, w: 0.75, h: 0.18, d: 0.42 },
    { x: -11.6, y: 1.38, z: 9.35, w: 0.62, h: 0.14, d: 0.34 },
    { x: -12.0, y: 1.36, z: 8.75, w: 0.42, h: 0.28, d: 0.42 },
  ];
  westArchiveBoxes.forEach((box, bi) => {
    const mesh = BABYLON.MeshBuilder.CreateBox(`off_clusterBox_${bi}`, {
      width: box.w,
      height: box.h,
      depth: box.d,
    }, scene);
    mesh.position = new BABYLON.Vector3(box.x, box.y, box.z);
    const boxMat = new BABYLON.StandardMaterial(`off_clusterBoxMat_${bi}`, scene);
    boxMat.diffuseColor = bookColors[(bi + 2) % bookColors.length];
    mesh.material = boxMat;
  });

  const eastMeetingTable = BABYLON.MeshBuilder.CreateBox('off_eastMeetingTable', { width: 2.6, height: 0.06, depth: 1.4 }, scene);
  eastMeetingTable.position = new BABYLON.Vector3(10.9, 0.76, 8.9);
  eastMeetingTable.rotation.y = Math.PI / 2;
  eastMeetingTable.material = deskMat;
  eastMeetingTable.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(eastMeetingTable);

  for (let l = 0; l < 4; l++) {
    const lx = l % 2 === 0 ? -0.52 : 0.52;
    const lz = l < 2 ? -1.05 : 1.05;
    const leg = BABYLON.MeshBuilder.CreateBox(`off_eastMeetingLeg_${l}`, { width: 0.05, height: 0.74, depth: 0.05 }, scene);
    leg.position = new BABYLON.Vector3(10.9 + lx, 0.37, 8.9 + lz);
    leg.material = metalMat;
  }

  [
    { x: 9.6, z: 8.9 },
    { x: 12.2, z: 8.9 },
    { x: 10.9, z: 7.7 },
    { x: 10.9, z: 10.1 },
  ].forEach((seat, si) => {
    const chairSeat = BABYLON.MeshBuilder.CreateBox(`off_eastMeetingSeat_${si}`, { width: 0.44, height: 0.06, depth: 0.44 }, scene);
    chairSeat.position = new BABYLON.Vector3(seat.x, 0.46, seat.z);
    chairSeat.material = si % 2 === 0 ? chairFabricMat : whiteMat;
    chairSeat.checkCollisions = true;

    const chairBack = BABYLON.MeshBuilder.CreateBox(`off_eastMeetingBack_${si}`, { width: 0.44, height: 0.44, depth: 0.05 }, scene);
    const isSide = si < 2;
    chairBack.position = new BABYLON.Vector3(
      seat.x + (isSide ? (si === 0 ? -0.22 : 0.22) : 0),
      0.74,
      seat.z + (!isSide ? (si === 2 ? -0.22 : 0.22) : 0)
    );
    chairBack.material = si % 2 === 0 ? chairFabricMat : whiteMat;
  });

  const southPlanterPositions = [
    { x: -6.6, z: 12.2 },
    { x: 6.8, z: 12.15 },
  ];
  southPlanterPositions.forEach((pp, pi) => {
    const pot = BABYLON.MeshBuilder.CreateCylinder(`off_southPot_${pi}`, { height: 0.55, diameterTop: 0.58, diameterBottom: 0.42, tessellation: 14 }, scene);
    pot.position = new BABYLON.Vector3(pp.x, 0.275, pp.z);
    pot.material = darkWoodMat;
    pot.checkCollisions = true;

    const trunk = BABYLON.MeshBuilder.CreateCylinder(`off_southPlantTrunk_${pi}`, { height: 1.1, diameter: 0.09, tessellation: 8 }, scene);
    trunk.position = new BABYLON.Vector3(pp.x, 1.0, pp.z);
    trunk.material = darkWoodMat;

    for (let f = 0; f < 5; f++) {
      const foliage = BABYLON.MeshBuilder.CreateSphere(`off_southPlantLeaf_${pi}_${f}`, { diameter: 0.42 + f * 0.08, segments: 8 }, scene);
      foliage.position = new BABYLON.Vector3(pp.x + (f - 2) * 0.1, 1.45 + f * 0.14, pp.z + (f % 2 === 0 ? 0.12 : -0.12));
      foliage.scaling = new BABYLON.Vector3(1, 0.75, 1);
      foliage.material = greenMat;
    }
  });

  console.log('[Office] Added North/South/East/West wall furniture (reception, lockers, bookshelves, whiteboards, pinboard)');

  // ============================================================
  // OFFICE HAZARD PROPS — visual anchors for the 6 office risks
  // Each hazard mesh carries metadata: riskId (links click → risk found)
  // and tooltip { name, type, condition } for the look-at PropLabel.
  // ============================================================
  const hazardRedMat = new BABYLON.StandardMaterial('off_hazardRed', scene);
  hazardRedMat.diffuseColor = new BABYLON.Color3(0.85, 0.15, 0.15);
  hazardRedMat.emissiveColor = new BABYLON.Color3(0.25, 0.04, 0.04);

  const tagHazard = (
    mesh: BABYLON.AbstractMesh,
    riskId: string,
    tooltip: { name: string; type: string; condition: 'good' | 'warning' | 'damaged'; iconKey: string }
  ) => {
    mesh.metadata = { ...(mesh.metadata || {}), riskId, tooltip };
    mesh.isPickable = true;
  };

  // Risk 1 — Cavo elettrico scoperto sul pavimento [-8, 0.1, -3]
  const cableTip = { name: 'Cavo a terra', type: 'Pericolo inciampo', condition: 'damaged' as const, iconKey: 'cable' };
  const cableSegments = 6;
  for (let s = 0; s < cableSegments; s++) {
    const seg = BABYLON.MeshBuilder.CreateCylinder(`off_cable_${s}`, { height: 0.45, diameter: 0.04, tessellation: 8 }, scene);
    seg.rotation.z = Math.PI / 2;
    seg.position = new BABYLON.Vector3(-8 + (s - cableSegments / 2) * 0.42, 0.04, -3 + Math.sin(s * 0.9) * 0.25);
    seg.material = hazardRedMat;
    tagHazard(seg, '1', cableTip);
  }
  const plug = BABYLON.MeshBuilder.CreateBox('off_cable_plug', { width: 0.12, height: 0.06, depth: 0.08 }, scene);
  plug.position = new BABYLON.Vector3(-8 - 1.4, 0.06, -3);
  plug.material = blackMat;
  tagHazard(plug, '1', cableTip);

  // Risk 2 — Estintore bloccato da archivi [-14, 0.5, -1]
  const extTip = { name: 'Estintore bloccato', type: 'Antincendio non accessibile', condition: 'warning' as const, iconKey: 'extinguisher' };
  const extBody = BABYLON.MeshBuilder.CreateCylinder('off_ext_body', { height: 0.55, diameter: 0.18, tessellation: 16 }, scene);
  extBody.position = new BABYLON.Vector3(-14.7, 0.35, -1);
  extBody.material = hazardRedMat;
  tagHazard(extBody, '2', extTip);
  const extHandle = BABYLON.MeshBuilder.CreateBox('off_ext_handle', { width: 0.12, height: 0.05, depth: 0.06 }, scene);
  extHandle.position = new BABYLON.Vector3(-14.7, 0.68, -1);
  extHandle.material = blackMat;
  tagHazard(extHandle, '2', extTip);
  const cardboardMat = new BABYLON.StandardMaterial('off_cardboard', scene);
  cardboardMat.diffuseColor = new BABYLON.Color3(0.72, 0.55, 0.35);
  for (let b = 0; b < 4; b++) {
    const box = BABYLON.MeshBuilder.CreateBox(`off_extBlock_${b}`, { width: 0.55, height: 0.4, depth: 0.5 }, scene);
    box.position = new BABYLON.Vector3(-14.2 + (b % 2) * 0.05, 0.2 + Math.floor(b / 2) * 0.42, -1.3 + (b % 2) * 0.6);
    box.material = cardboardMat;
    box.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(box);
    tagHazard(box, '2', extTip);
  }

  // Risk 3 — Uscita di emergenza ostruita [0, 0.5, 11]
  const exitTip = { name: 'Uscita bloccata', type: 'Via di fuga ostruita', condition: 'damaged' as const, iconKey: 'exit' };
  const exitDoor = BABYLON.MeshBuilder.CreateBox('off_exitDoor', { width: 1.6, height: 2.2, depth: 0.06 }, scene);
  exitDoor.position = new BABYLON.Vector3(0, 1.1, 14.85);
  const exitDoorMat = new BABYLON.StandardMaterial('off_exitDoorMat', scene);
  exitDoorMat.diffuseColor = new BABYLON.Color3(0.15, 0.5, 0.25);
  exitDoor.material = exitDoorMat;
  tagHazard(exitDoor, '3', exitTip);
  const exitSign = BABYLON.MeshBuilder.CreateBox('off_exitSign', { width: 0.7, height: 0.25, depth: 0.04 }, scene);
  exitSign.position = new BABYLON.Vector3(0, 2.55, 14.83);
  const exitSignMat = new BABYLON.StandardMaterial('off_exitSignMat', scene);
  exitSignMat.diffuseColor = new BABYLON.Color3(0.1, 0.7, 0.3);
  exitSignMat.emissiveColor = new BABYLON.Color3(0.15, 0.6, 0.25);
  exitSign.material = exitSignMat;
  tagHazard(exitSign, '3', exitTip);
  for (let b = 0; b < 5; b++) {
    const obs = BABYLON.MeshBuilder.CreateBox(`off_exitBlock_${b}`, { width: 0.55, height: 0.45, depth: 0.5 }, scene);
    obs.position = new BABYLON.Vector3(-0.6 + (b % 3) * 0.6, 0.22 + Math.floor(b / 3) * 0.46, 11 + (b % 2) * 0.4);
    obs.material = cardboardMat;
    obs.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(obs);
    tagHazard(obs, '3', exitTip);
  }

  // Risk 4 — Pavimento bagnato non segnalato [-5, 0.02, 6]
  const puddleTip = { name: 'Pavimento bagnato', type: 'Pericolo scivolamento', condition: 'warning' as const, iconKey: 'puddle' };
  const puddle = BABYLON.MeshBuilder.CreateDisc('off_puddle', { radius: 0.7, tessellation: 24 }, scene);
  puddle.rotation.x = Math.PI / 2;
  puddle.position = new BABYLON.Vector3(-5, 0.012, 6);
  const puddleMat = new BABYLON.StandardMaterial('off_puddleMat', scene);
  puddleMat.diffuseColor = new BABYLON.Color3(0.35, 0.5, 0.65);
  puddleMat.specularColor = new BABYLON.Color3(0.95, 0.95, 1.0);
  puddleMat.specularPower = 256;
  puddleMat.alpha = 0.75;
  puddle.material = puddleMat;
  tagHazard(puddle, '4', puddleTip);
  // Larger invisible click hitbox above the puddle (puddle disc is thin)
  const puddleHit = BABYLON.MeshBuilder.CreateBox('off_puddle_hit', { width: 1.6, height: 0.4, depth: 1.6 }, scene);
  puddleHit.position = new BABYLON.Vector3(-5, 0.2, 6);
  puddleHit.visibility = 0;
  tagHazard(puddleHit, '4', puddleTip);

  // Risk 5 — Scaffalatura instabile sovraccarica [-13, 0.5, -6]
  const shelfTip = { name: 'Scaffale instabile', type: 'Rischio ribaltamento', condition: 'damaged' as const, iconKey: 'shelf' };
  const tiltedShelf = BABYLON.MeshBuilder.CreateBox('off_tiltedShelf', { width: 1.0, height: 1.8, depth: 0.45 }, scene);
  tiltedShelf.position = new BABYLON.Vector3(-13, 0.9, -6);
  tiltedShelf.rotation.z = 0.12;
  tiltedShelf.material = darkWoodMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(tiltedShelf);
  tagHazard(tiltedShelf, '5', shelfTip);
  const folderColors = [
    new BABYLON.Color3(0.7, 0.2, 0.2),
    new BABYLON.Color3(0.2, 0.4, 0.7),
    new BABYLON.Color3(0.6, 0.55, 0.15),
  ];
  for (let f = 0; f < 5; f++) {
    const folder = BABYLON.MeshBuilder.CreateBox(`off_folder_${f}`, { width: 0.18, height: 0.28, depth: 0.32 }, scene);
    folder.position = new BABYLON.Vector3(-13 - 0.4 + f * 0.18, 1.95, -6);
    folder.rotation.z = 0.12;
    const fMat = new BABYLON.StandardMaterial(`off_folderMat_${f}`, scene);
    fMat.diffuseColor = folderColors[f % folderColors.length];
    folder.material = fMat;
    tagHazard(folder, '5', shelfTip);
  }

  // Risk 6 — Luce di emergenza non funzionante [10, 0.5, -9]
  const emTip = { name: 'Luce emergenza guasta', type: 'Sicurezza blackout', condition: 'damaged' as const, iconKey: 'emlight' };
  const emLightHousing = BABYLON.MeshBuilder.CreateBox('off_emLight', { width: 0.35, height: 0.16, depth: 0.1 }, scene);
  emLightHousing.position = new BABYLON.Vector3(10, 2.55, -9.85);
  const emLightMat = new BABYLON.StandardMaterial('off_emLightMat', scene);
  emLightMat.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.85);
  emLightHousing.material = emLightMat;
  tagHazard(emLightHousing, '6', emTip);
  const emLens = BABYLON.MeshBuilder.CreateBox('off_emLens', { width: 0.28, height: 0.1, depth: 0.02 }, scene);
  emLens.position = new BABYLON.Vector3(10, 2.55, -9.79);
  const emLensMat = new BABYLON.StandardMaterial('off_emLensMat', scene);
  emLensMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.22);
  emLens.material = emLensMat;
  tagHazard(emLens, '6', emTip);

  // ============================================================
  // UNIFORM FILL PASS — configurable (preset / density / seed) + metrics
  // ============================================================
  const sceneAny = scene as unknown as {
    metadata?: { uniformFillConfig?: Partial<UniformFillConfig> };
  };
  const fillCfg = buildUniformFillConfig(
    sceneAny.metadata?.uniformFillConfig,
    typeof window !== 'undefined' && window.matchMedia('(pointer:coarse), (max-width: 767px)').matches
  );
  const rng = makeRng(fillCfg.seed);
  // Mobile / low-quality auto-skip of micro-prop shadow casters
  const noShadowOnFill = fillCfg.disableMicroPropShadows || quality === 'low';
  const effShadow = noShadowOnFill ? null : shadowGenerator;

  const noGoZones: Array<[number, number, number]> = [
    [-7, -5, 1.8], [0, -5, 1.8], [7, -5, 1.8],
    [-7, 5, 1.8], [0, 5, 1.8], [7, 5, 1.8],
    [0, -13.5, 3.5], [-11.2, 9.2, 2.6], [11, 8.9, 2.8], [0.5, 12.1, 3.0],
    [-8, -3, 1.0], [-14, -1, 1.5], [0, 11, 1.5], [-5, 6, 1.0],
    [-13, -6, 1.5], [10, -9, 1.5], [0, 12, 1.5],
  ];
  const isClear = (x: number, z: number, propRadius = 0.6) => {
    for (const [nx, nz, nr] of noGoZones) {
      const dx = x - nx, dz = z - nz;
      if (dx * dx + dz * dz < (nr + propRadius) * (nr + propRadius)) return false;
    }
    return true;
  };

  const placedProps: Array<[number, number, number]> = [];
  const placedMeta: PlacedProp[] = [];
  type OfficeWall = 'N' | 'S' | 'E' | 'W';
  const wallPlacementCounts: Record<OfficeWall, number> = { N: 0, S: 0, E: 0, W: 0 };
  const isFarFromPlaced = (x: number, z: number, minDist = 1.4) => {
    for (const [px, pz, pr] of placedProps) {
      const dx = x - px, dz = z - pz;
      if (dx * dx + dz * dz < (minDist + pr) * (minDist + pr)) return false;
    }
    return true;
  };
  const clampWallAxis = (value: number) => Math.max(-12.8, Math.min(12.8, value));
  const compactWallKinds: UniformFillKind[] = ['plant', 'sign', 'bin', 'chair', 'boxes', 'cabinet'];
  const getKindRadius = (kind: UniformFillKind) => {
    switch (kind) {
      case 'cabinet': return 0.6;
      case 'cooler': return 0.55;
      case 'boxes': return 0.5;
      case 'chair': return 0.42;
      case 'plant': return 0.45;
      case 'sign': return 0.38;
      case 'bin':
      default:
        return 0.34;
    }
  };

  // ---- Materials (shared) ----
  const planterMat = new BABYLON.StandardMaterial('off_fillPlanterMat', scene);
  planterMat.diffuseColor = new BABYLON.Color3(0.32, 0.22, 0.14);
  const leafMat = new BABYLON.StandardMaterial('off_fillLeafMat', scene);
  leafMat.diffuseColor = new BABYLON.Color3(0.22, 0.5, 0.22);
  const binMat = new BABYLON.StandardMaterial('off_fillBinMat', scene);
  binMat.diffuseColor = new BABYLON.Color3(0.18, 0.18, 0.2);
  const cabinetMat = new BABYLON.StandardMaterial('off_fillCabMat', scene);
  cabinetMat.diffuseColor = new BABYLON.Color3(0.78, 0.78, 0.8);
  const coolerBodyMat = new BABYLON.StandardMaterial('off_fillCoolerMat', scene);
  coolerBodyMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.97);
  const bottleMat = new BABYLON.StandardMaterial('off_fillBottleMat', scene);
  bottleMat.diffuseColor = new BABYLON.Color3(0.55, 0.78, 0.95);
  bottleMat.alpha = 0.7;
  const signPostMat = new BABYLON.StandardMaterial('off_fillSignPostMat', scene);
  signPostMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.22);
  const signBoardMat = new BABYLON.StandardMaterial('off_fillSignBoardMat', scene);
  signBoardMat.diffuseColor = new BABYLON.Color3(0.95, 0.78, 0.18);
  signBoardMat.emissiveColor = new BABYLON.Color3(0.18, 0.14, 0.04);

  const reg = (m: BABYLON.Mesh) => {
    m.checkCollisions = true;
    m.isPickable = false;
    m.receiveShadows = true;
    if (effShadow) effShadow.addShadowCaster(m);
  };

  let propId = 0;
  const placePlant = (x: number, z: number, scale = 1) => {
    const pot = BABYLON.MeshBuilder.CreateCylinder(`fill_pot_${propId}`,
      { height: 0.45 * scale, diameterTop: 0.5 * scale, diameterBottom: 0.36 * scale, tessellation: 12 }, scene);
    pot.position.set(x, 0.225 * scale, z);
    pot.material = planterMat; reg(pot);
    for (let f = 0; f < 4; f++) {
      const leaf = BABYLON.MeshBuilder.CreateSphere(`fill_leaf_${propId}_${f}`,
        { diameter: (0.36 + f * 0.06) * scale, segments: 6 }, scene);
      leaf.position.set(x + (f - 1.5) * 0.08 * scale, (0.7 + f * 0.1) * scale, z + (f % 2 ? 0.08 : -0.08) * scale);
      leaf.scaling = new BABYLON.Vector3(1, 0.7, 1);
      leaf.material = leafMat; leaf.isPickable = false;
      if (effShadow) effShadow.addShadowCaster(leaf);
    }
    placedProps.push([x, z, 0.35 * scale]);
    placedMeta.push({ x, z, kind: 'plant', bbox: { hx: 0.35 * scale, hz: 0.35 * scale } });
    propId++;
  };
  const placeFileCabinet = (x: number, z: number, rotY: number) => {
    const body = BABYLON.MeshBuilder.CreateBox(`fill_cab_${propId}`,
      { width: 0.55, height: 1.35, depth: 0.5 }, scene);
    body.position.set(x, 0.675, z); body.rotation.y = rotY;
    body.material = cabinetMat; reg(body);
    for (let d = 0; d < 4; d++) {
      const drawer = BABYLON.MeshBuilder.CreateBox(`fill_cabDrw_${propId}_${d}`,
        { width: 0.5, height: 0.28, depth: 0.02 }, scene);
      drawer.position.set(x + Math.sin(rotY) * 0.26, 0.18 + d * 0.32, z + Math.cos(rotY) * 0.26);
      drawer.rotation.y = rotY; drawer.material = metalMat; drawer.isPickable = false;
    }
    placedProps.push([x, z, 0.45]); placedMeta.push({ x, z, kind: 'cabinet', bbox: { hx: 0.3, hz: 0.28 } }); propId++;
  };
  const placeBin = (x: number, z: number) => {
    const bin = BABYLON.MeshBuilder.CreateCylinder(`fill_bin_${propId}`,
      { height: 0.55, diameter: 0.34, tessellation: 12 }, scene);
    bin.position.set(x, 0.275, z); bin.material = binMat; reg(bin);
    placedProps.push([x, z, 0.2]); placedMeta.push({ x, z, kind: 'bin', bbox: { hx: 0.18, hz: 0.18 } }); propId++;
  };
  const placeWaterCooler = (x: number, z: number, rotY: number) => {
    const body = BABYLON.MeshBuilder.CreateBox(`fill_cooler_${propId}`,
      { width: 0.45, height: 1.05, depth: 0.45 }, scene);
    body.position.set(x, 0.525, z); body.rotation.y = rotY; body.material = coolerBodyMat; reg(body);
    const bottle = BABYLON.MeshBuilder.CreateCylinder(`fill_coolerBottle_${propId}`,
      { height: 0.5, diameterTop: 0.32, diameterBottom: 0.4, tessellation: 14 }, scene);
    bottle.position.set(x, 1.3, z); bottle.material = bottleMat; bottle.isPickable = false;
    if (effShadow) effShadow.addShadowCaster(bottle);
    placedProps.push([x, z, 0.35]); placedMeta.push({ x, z, kind: 'cooler', bbox: { hx: 0.24, hz: 0.24 } }); propId++;
  };
  const placeSafetySign = (x: number, z: number, rotY: number) => {
    const post = BABYLON.MeshBuilder.CreateCylinder(`fill_signPost_${propId}`,
      { height: 1.4, diameter: 0.06, tessellation: 8 }, scene);
    post.position.set(x, 0.7, z); post.material = signPostMat; reg(post);
    const board = BABYLON.MeshBuilder.CreateBox(`fill_signBoard_${propId}`,
      { width: 0.5, height: 0.5, depth: 0.04 }, scene);
    board.position.set(x, 1.55, z); board.rotation.y = rotY;
    board.material = signBoardMat; board.isPickable = false;
    if (effShadow) effShadow.addShadowCaster(board);
    placedProps.push([x, z, 0.3]); placedMeta.push({ x, z, kind: 'sign', bbox: { hx: 0.27, hz: 0.07 } }); propId++;
  };
  const placeBoxesStack = (x: number, z: number) => {
    for (let s = 0; s < 3; s++) {
      const box = BABYLON.MeshBuilder.CreateBox(`fill_stack_${propId}_${s}`,
        { width: 0.55 - s * 0.05, height: 0.32, depth: 0.45 - s * 0.05 }, scene);
      box.position.set(x + (s % 2 ? 0.04 : -0.04), 0.16 + s * 0.32, z);
      box.rotation.y = (s - 1) * 0.18;
      const m = new BABYLON.StandardMaterial(`fill_stackMat_${propId}_${s}`, scene);
      const tones = [[0.72, 0.55, 0.32], [0.65, 0.5, 0.3], [0.78, 0.6, 0.36]];
      const t = tones[s];
      m.diffuseColor = new BABYLON.Color3(t[0], t[1], t[2]);
      box.material = m; reg(box);
    }
    placedProps.push([x, z, 0.4]); placedMeta.push({ x, z, kind: 'boxes', bbox: { hx: 0.3, hz: 0.25 } }); propId++;
  };
  const placeSideChair = (x: number, z: number, rotY: number) => {
    const seat = BABYLON.MeshBuilder.CreateBox(`fill_chair_${propId}`,
      { width: 0.5, height: 0.06, depth: 0.5 }, scene);
    seat.position.set(x, 0.46, z); seat.rotation.y = rotY;
    seat.material = chairFabricMat; reg(seat);
    const back = BABYLON.MeshBuilder.CreateBox(`fill_chairBack_${propId}`,
      { width: 0.5, height: 0.55, depth: 0.05 }, scene);
    back.position.set(x - Math.cos(rotY) * 0.22, 0.78, z + Math.sin(rotY) * 0.22);
    back.rotation.y = rotY; back.material = chairFabricMat; back.isPickable = false;
    if (effShadow) effShadow.addShadowCaster(back);
    for (let l = 0; l < 4; l++) {
      const lx = (l % 2 === 0 ? -0.22 : 0.22);
      const lz = (l < 2 ? -0.22 : 0.22);
      const leg = BABYLON.MeshBuilder.CreateBox(`fill_chairLeg_${propId}_${l}`,
        { width: 0.04, height: 0.42, depth: 0.04 }, scene);
      leg.position.set(x + lx, 0.21, z + lz);
      leg.material = metalMat; leg.isPickable = false;
    }
    placedProps.push([x, z, 0.3]); placedMeta.push({ x, z, kind: 'chair', bbox: { hx: 0.27, hz: 0.27 } }); propId++;
  };

  const placeByKind = (
    kind: UniformFillKind,
    x: number, z: number, rotY: number
  ) => {
    switch (kind) {
      case 'plant': placePlant(x, z, 0.85 + rng() * 0.3); break;
      case 'cabinet': placeFileCabinet(x, z, rotY); break;
      case 'bin': placeBin(x, z); break;
      case 'cooler': placeWaterCooler(x, z, rotY); break;
      case 'sign': placeSafetySign(x, z, rotY); break;
      case 'boxes': placeBoxesStack(x, z); break;
      case 'chair': placeSideChair(x, z, rotY); break;
    }
  };

  // ---- Wall-edge belt — balanced per wall with fallback slots ----
  const wallInset = 1.05;
  const wallOrder: OfficeWall[] = ['W', 'E', 'N', 'S'];
  const wallFillSpan = 23.6;
  const minWallTarget = Math.max(4, Math.min(fillCfg.wallSteps, Math.ceil(fillCfg.wallSteps * 0.75)));
  const getWallPose = (wall: OfficeWall, anchor: number, depth: number, along: number) => {
    switch (wall) {
      case 'N':
        return { x: clampWallAxis(anchor + along), z: -15 + wallInset + depth, rot: 0 };
      case 'S':
        return { x: clampWallAxis(anchor + along), z: 15 - wallInset - depth, rot: Math.PI };
      case 'W':
        return { x: -15 + wallInset + depth, z: clampWallAxis(anchor + along), rot: Math.PI / 2 };
      case 'E':
      default:
        return { x: 15 - wallInset - depth, z: clampWallAxis(anchor + along), rot: -Math.PI / 2 };
    }
  };
  const placeWallProp = (wall: OfficeWall, anchor: number, preferredKind?: UniformFillKind) => {
    const attempts = [
      { along: 0, depth: 0 },
      { along: 0.8, depth: 0 },
      { along: -0.8, depth: 0 },
      { along: 0, depth: 0.55 },
      { along: 1.45, depth: 0.4 },
      { along: -1.45, depth: 0.4 },
      { along: 0, depth: 1.0 },
    ];

    for (const attempt of attempts) {
      const pose = getWallPose(wall, anchor, attempt.depth, attempt.along);
      const pool = attempt.depth >= 0.55 ? compactWallKinds : fillCfg.wallKinds;
      const choices = preferredKind
        ? [preferredKind, ...pool.filter((kind) => kind !== preferredKind)]
        : [...pool];

      while (choices.length > 0) {
        const nextIndex = Math.floor(rng() * choices.length);
        const kind = choices.splice(nextIndex, 1)[0];
        const radius = getKindRadius(kind);
        if (!isClear(pose.x, pose.z, radius)) continue;
        if (!isFarFromPlaced(pose.x, pose.z, radius + 0.95)) continue;
        placeByKind(kind, pose.x, pose.z, pose.rot);
        wallPlacementCounts[wall] += 1;
        return true;
      }
    }

    return false;
  };

  // Per-wall step counts (multiplier-driven), processed independently so lateral walls
  // are no longer starved by the front/back placement order.
  const wallStepsByWall: Record<OfficeWall, number> = {
    N: Math.max(2, Math.round(fillCfg.wallSteps * (fillCfg.perWall.N ?? 1))),
    S: Math.max(2, Math.round(fillCfg.wallSteps * (fillCfg.perWall.S ?? 1))),
    E: Math.max(2, Math.round(fillCfg.wallSteps * (fillCfg.perWall.E ?? 1))),
    W: Math.max(2, Math.round(fillCfg.wallSteps * (fillCfg.perWall.W ?? 1))),
  };
  wallOrder.forEach((wall) => {
    const steps = wallStepsByWall[wall];
    for (let i = 0; i < steps; i++) {
      const anchor = -wallFillSpan / 2 + (i + 0.5) * (wallFillSpan / steps);
      placeWallProp(wall, anchor + (rng() - 0.5) * 0.35);
    }
  });

  wallOrder.forEach((wall) => {
    const target = Math.max(4, Math.round(wallStepsByWall[wall] * 0.75));
    const repairAttempts = wallStepsByWall[wall] * 4;
    for (let pass = 0; pass < repairAttempts && wallPlacementCounts[wall] < target; pass++) {
      const anchor = -11.8 + ((pass + 0.5) / repairAttempts) * 23.6 + (rng() - 0.5) * 1.1;
      const preferredKind = compactWallKinds[Math.floor(rng() * compactWallKinds.length)];
      placeWallProp(wall, anchor, preferredKind);
    }
  });

  // ---- Interior NxN grid (density-driven, anti-center bias) ----
  const grid = fillCfg.interiorGrid;
  const interiorSpan = 22;
  const interiorMult = Math.max(0, Math.min(2, fillCfg.perWall.interior ?? 0.7));
  const baseRatio = fillCfg.density === 'high' ? 0.6 : fillCfg.density === 'medium' ? 0.45 : 0.32;
  const interiorQuota = Math.max(
    2,
    Math.min(grid * grid, Math.round(grid * grid * baseRatio * interiorMult))
  );
  const exclusion = fillCfg.centerExclusionRadius;
  let interiorPlaced = 0;
  for (let ix = 0; ix < grid; ix++) {
    for (let iz = 0; iz < grid; iz++) {
      if (interiorPlaced >= interiorQuota) continue;
      const baseX = -interiorSpan / 2 + ix * (interiorSpan / Math.max(1, grid - 1));
      const baseZ = -interiorSpan / 2 + iz * (interiorSpan / Math.max(1, grid - 1));
      const distFromCenter = Math.hypot(baseX, baseZ);
      // Hard exclusion in the inner radius; soft skip just outside it
      if (distFromCenter < exclusion) continue;
      if (distFromCenter < exclusion + 1.5 && rng() < 0.55) continue;
      const x = baseX + (rng() - 0.5) * fillCfg.jitter;
      const z = baseZ + (rng() - 0.5) * fillCfg.jitter;
      if (!isClear(x, z, 0.6)) continue;
      if (!isFarFromPlaced(x, z, 2.0)) continue;
      const idx = Math.floor(rng() * fillCfg.interiorKinds.length);
      const rot = Math.floor(rng() * 4) * (Math.PI / 2);
      placeByKind(fillCfg.interiorKinds[idx], x, z, rot);
      interiorPlaced += 1;
    }
  }

  // ---- Corner accents (preset opt-in) ----
  if (fillCfg.cornerAccents) {
    const corners: Array<[number, number]> = [
      [-13.2, -13.2], [13.2, -13.2], [-13.2, 13.2], [13.2, 13.2],
    ];
    corners.forEach(([cx, cz]) => {
      if (isClear(cx, cz, 0.6) && isFarFromPlaced(cx, cz, 1.0)) {
        placePlant(cx, cz, 1.25);
      }
    });
  }

  // ---- Density metrics + warnings ----
  const avgWallTarget = (wallStepsByWall.N + wallStepsByWall.S + wallStepsByWall.E + wallStepsByWall.W) / 4;
  const metrics = computeDensityMetrics(placedMeta, {
    min: Math.max(3, Math.ceil(avgWallTarget * 0.55)),
    max: Math.max(fillCfg.wallSteps + 4, Math.ceil(avgWallTarget * 1.4)),
  });
  publishMetrics('office', metrics);
  publishFillStats('office', { placed: placedMeta, noGoZones, metrics });

  console.log(
    `[Office] Uniform fill (preset=${fillCfg.preset}, density=${fillCfg.density}, seed=${fillCfg.seed}, perWall=${JSON.stringify(fillCfg.perWall)}) placed ${placedProps.length} props`
  );
  console.log('[Office] Full office furnishing complete — props + hazards');
}


// ============================================================
// CYBERSECURITY OFFICE PROPS — Visual cyber risk indicators
// ============================================================
export function addCybersecurityProps(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  // --- Post-it notes with "passwords" on desks ---
  const postItPositions = [
    { x: -7, z: -4.5, color: new BABYLON.Color3(1, 0.95, 0.3) },   // yellow post-it desk 0
    { x: 7, z: 5.5, color: new BABYLON.Color3(1, 0.6, 0.8) },      // pink post-it desk 5
  ];

  postItPositions.forEach((p, i) => {
    const postIt = BABYLON.MeshBuilder.CreatePlane(`cyber_postit_${i}`, { width: 0.12, height: 0.12 }, scene);
    postIt.position = new BABYLON.Vector3(p.x + 0.6, 0.79, p.z);
    postIt.rotation.x = Math.PI / 2;
    postIt.rotation.y = seededRandom(i * 37) * 0.5 - 0.25;
    const postItMat = new BABYLON.StandardMaterial(`cyber_postitMat_${i}`, scene);
    postItMat.diffuseColor = p.color;
    postItMat.emissiveColor = p.color.scale(0.15);
    postItMat.specularColor = BABYLON.Color3.Black();
    postIt.material = postItMat;
  });

  // --- Unlocked screen glow (emissive screens showing "desktop") ---
  const unlockedScreenPositions = [
    { x: 0, z: -5 },    // desk 1 - unlocked
    { x: 7, z: 5 },     // desk 5 - showing weak password
  ];

  unlockedScreenPositions.forEach((p, i) => {
    // Bright screen overlay to show it's "active/unlocked"
    const screenGlow = BABYLON.MeshBuilder.CreatePlane(`cyber_screenGlow_${i}`, { width: 0.85, height: 0.5 }, scene);
    screenGlow.position = new BABYLON.Vector3(p.x, 1.25, p.z - 0.33);
    const glowMat = new BABYLON.StandardMaterial(`cyber_screenGlowMat_${i}`, scene);
    glowMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.9);
    glowMat.emissiveColor = new BABYLON.Color3(0.3, 0.6, 1.0);
    glowMat.alpha = 0.7;
    glowMat.specularColor = BABYLON.Color3.Black();
    screenGlow.material = glowMat;
  });

  // --- Phishing email screen (red-tinted warning screen) ---
  const phishScreen = BABYLON.MeshBuilder.CreatePlane('cyber_phishScreen', { width: 0.85, height: 0.5 }, scene);
  phishScreen.position = new BABYLON.Vector3(7, 1.25, -5 - 0.33);
  const phishMat = new BABYLON.StandardMaterial('cyber_phishMat', scene);
  phishMat.diffuseColor = new BABYLON.Color3(0.9, 0.15, 0.1);
  phishMat.emissiveColor = new BABYLON.Color3(0.8, 0.1, 0.05);
  phishMat.alpha = 0.6;
  phishMat.specularColor = BABYLON.Color3.Black();
  phishScreen.material = phishMat;

  // --- USB stick on desk ---
  const usbBody = BABYLON.MeshBuilder.CreateBox('cyber_usb_body', { width: 0.06, height: 0.015, depth: 0.025 }, scene);
  usbBody.position = new BABYLON.Vector3(-7 + 0.3, 0.785, 5 + 0.3);
  const usbMat = new BABYLON.StandardMaterial('cyber_usbMat', scene);
  usbMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
  usbBody.material = usbMat;

  const usbConnector = BABYLON.MeshBuilder.CreateBox('cyber_usb_conn', { width: 0.025, height: 0.008, depth: 0.015 }, scene);
  usbConnector.position = new BABYLON.Vector3(-7 + 0.26, 0.785, 5 + 0.3);
  const usbConnMat = new BABYLON.StandardMaterial('cyber_usbConnMat', scene);
  usbConnMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  usbConnMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
  usbConnector.material = usbConnMat;

  // --- Confidential documents scattered on desk ---
  const docPositions = [
    { x: 0, z: 5 },
  ];
  docPositions.forEach((dp, i) => {
    for (let d = 0; d < 3; d++) {
      const doc = BABYLON.MeshBuilder.CreatePlane(`cyber_doc_${i}_${d}`, { width: 0.21, height: 0.29 }, scene);
      doc.position = new BABYLON.Vector3(
        dp.x - 0.5 + d * 0.25,
        0.79 + d * 0.002,
        dp.z + 0.2
      );
      doc.rotation.x = Math.PI / 2;
      doc.rotation.y = seededRandom(d * 53 + i) * 0.3 - 0.15;
      const docMat = new BABYLON.StandardMaterial(`cyber_docMat_${i}_${d}`, scene);
      docMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.92);
      docMat.specularColor = BABYLON.Color3.Black();
      doc.material = docMat;
    }
    // Red "CONFIDENZIALE" stamp overlay
    const stamp = BABYLON.MeshBuilder.CreatePlane(`cyber_stamp_${i}`, { width: 0.15, height: 0.04 }, scene);
    stamp.position = new BABYLON.Vector3(dp.x - 0.25, 0.80, dp.z + 0.2);
    stamp.rotation.x = Math.PI / 2;
    stamp.rotation.z = -0.15;
    const stampMat = new BABYLON.StandardMaterial(`cyber_stampMat_${i}`, scene);
    stampMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
    stampMat.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
    stampMat.alpha = 0.8;
    stamp.material = stampMat;
  });

  // --- Smartphone with hotspot (glowing phone on side table) ---
  const phone = BABYLON.MeshBuilder.CreateBox('cyber_phone', { width: 0.04, height: 0.008, depth: 0.08 }, scene);
  phone.position = new BABYLON.Vector3(10, 0.79, -9);
  const phoneMat = new BABYLON.StandardMaterial('cyber_phoneMat', scene);
  phoneMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.12);
  phoneMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  phone.material = phoneMat;

  // Phone screen glow (WiFi indicator)
  const phoneScreen = BABYLON.MeshBuilder.CreatePlane('cyber_phoneScreen', { width: 0.035, height: 0.06 }, scene);
  phoneScreen.position = new BABYLON.Vector3(10, 0.795, -9);
  phoneScreen.rotation.x = Math.PI / 2;
  const phoneScreenMat = new BABYLON.StandardMaterial('cyber_phoneScreenMat', scene);
  phoneScreenMat.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.3);
  phoneScreenMat.emissiveColor = new BABYLON.Color3(0.05, 0.4, 0.15);
  phoneScreen.material = phoneScreenMat;

  // --- Printed documents at printer area ---
  const printerX = -13;
  const printerZ = -6;
  for (let p = 0; p < 4; p++) {
    const printDoc = BABYLON.MeshBuilder.CreatePlane(`cyber_print_${p}`, { width: 0.21, height: 0.29 }, scene);
    printDoc.position = new BABYLON.Vector3(
      printerX + seededRandom(p * 71) * 0.3 - 0.15,
      0.79 + p * 0.002,
      printerZ + seededRandom(p * 43) * 0.2
    );
    printDoc.rotation.x = Math.PI / 2;
    printDoc.rotation.y = seededRandom(p * 29) * 0.5;
    const printMat = new BABYLON.StandardMaterial(`cyber_printMat_${p}`, scene);
    printMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.92);
    printMat.specularColor = BABYLON.Color3.Black();
    printDoc.material = printMat;
  }

  // --- Pulsing warning light for phishing screen ---
  if (quality !== 'low') {
    const warnLight = new BABYLON.PointLight('cyber_warnLight', new BABYLON.Vector3(7, 1.5, -5.5), scene);
    warnLight.diffuse = new BABYLON.Color3(1, 0.2, 0.1);
    warnLight.intensity = 0.3;
    warnLight.range = 3;

    // Animate pulsing
    scene.registerBeforeRender(() => {
      warnLight.intensity = 0.15 + Math.sin(performance.now() * 0.003) * 0.15;
    });
  }

  console.log('[Cybersecurity] Cyber risk visual props added — post-its, unlocked screens, phishing, USB, docs');
}


// ============================================================
// CYBER SECURITY OFFICE — Dedicated SOC/IT operations room.
// Built when scenarioId === 'cybersecurity' so it does NOT
// reuse the warm administrative office geometry.
// ============================================================
export function addCyberSecurityOfficeEnvironment(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  const ROOM_W = 30;
  const ROOM_D = 24;
  const ROOM_H = 4.2;

  // ---------- Materials ----------
  const floorMat = new BABYLON.StandardMaterial('cyo_floorMat', scene);
  const floorTex = new BABYLON.DynamicTexture('cyo_floorTex', { width: 512, height: 512 }, scene, false);
  const fctx = floorTex.getContext() as CanvasRenderingContext2D;
  fctx.fillStyle = '#2a2f38';
  fctx.fillRect(0, 0, 512, 512);
  // Raised access floor tile grid (datacenter look)
  fctx.strokeStyle = '#4a525e';
  fctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    fctx.beginPath(); fctx.moveTo(i, 0); fctx.lineTo(i, 512); fctx.stroke();
    fctx.beginPath(); fctx.moveTo(0, i); fctx.lineTo(512, i); fctx.stroke();
  }
  // Subtle perforation dots
  fctx.fillStyle = '#1a1d24';
  for (let x = 16; x < 512; x += 64) {
    for (let y = 16; y < 512; y += 64) {
      fctx.beginPath(); fctx.arc(x, y, 1.2, 0, Math.PI * 2); fctx.fill();
      fctx.beginPath(); fctx.arc(x + 32, y + 32, 1.2, 0, Math.PI * 2); fctx.fill();
    }
  }
  floorTex.update();
  floorTex.uScale = 8; floorTex.vScale = 8;
  floorMat.diffuseTexture = floorTex;
  floorMat.specularColor = new BABYLON.Color3(0.25, 0.3, 0.4);
  floorMat.specularPower = 96;
  floorMat.emissiveColor = new BABYLON.Color3(0.10, 0.12, 0.16);

  const wallMat = new BABYLON.StandardMaterial('cyo_wallMat', scene);
  wallMat.diffuseColor = new BABYLON.Color3(0.32, 0.36, 0.44);
  wallMat.specularColor = new BABYLON.Color3(0.08, 0.10, 0.14);
  wallMat.emissiveColor = new BABYLON.Color3(0.10, 0.12, 0.18);
  wallMat.backFaceCulling = false;

  const accentMat = new BABYLON.StandardMaterial('cyo_accentMat', scene);
  accentMat.diffuseColor = new BABYLON.Color3(0.05, 0.4, 0.8);
  accentMat.emissiveColor = new BABYLON.Color3(0.1, 0.5, 1.0);
  accentMat.specularColor = BABYLON.Color3.Black();

  const ceilingMat = new BABYLON.StandardMaterial('cyo_ceilMat', scene);
  ceilingMat.diffuseColor = new BABYLON.Color3(0.18, 0.20, 0.24);
  ceilingMat.emissiveColor = new BABYLON.Color3(0.08, 0.09, 0.11);
  ceilingMat.specularColor = BABYLON.Color3.Black();
  ceilingMat.backFaceCulling = false;

  const metalMat = new BABYLON.StandardMaterial('cyo_metalMat', scene);
  metalMat.diffuseColor = new BABYLON.Color3(0.22, 0.24, 0.28);
  metalMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.7);
  metalMat.specularPower = 96;

  const blackMat = new BABYLON.StandardMaterial('cyo_blackMat', scene);
  blackMat.diffuseColor = new BABYLON.Color3(0.06, 0.06, 0.08);
  blackMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.35);

  const deskMat = new BABYLON.StandardMaterial('cyo_deskMat', scene);
  deskMat.diffuseColor = new BABYLON.Color3(0.12, 0.13, 0.16);
  deskMat.specularColor = new BABYLON.Color3(0.25, 0.25, 0.3);

  // ---------- Floor ----------
  const floor = BABYLON.MeshBuilder.CreateGround('cyo_floor', { width: ROOM_W, height: ROOM_D }, scene);
  floor.position.y = 0.01;
  floor.material = floorMat;
  floor.receiveShadows = true;
  floor.isPickable = false;

  // ---------- Walls ----------
  const makeWall = (name: string, w: number, h: number, pos: BABYLON.Vector3, rotY: number) => {
    const wall = BABYLON.MeshBuilder.CreatePlane(name, { width: w, height: h }, scene);
    wall.position = pos;
    wall.rotation.y = rotY;
    wall.material = wallMat;
    wall.checkCollisions = true;
    wall.receiveShadows = true;
    return wall;
  };
  makeWall('cyo_wallN', ROOM_W, ROOM_H, new BABYLON.Vector3(0, ROOM_H / 2, ROOM_D / 2), Math.PI);
  makeWall('cyo_wallS', ROOM_W, ROOM_H, new BABYLON.Vector3(0, ROOM_H / 2, -ROOM_D / 2), 0);
  makeWall('cyo_wallE', ROOM_D, ROOM_H, new BABYLON.Vector3(ROOM_W / 2, ROOM_H / 2, 0), -Math.PI / 2);
  makeWall('cyo_wallW', ROOM_D, ROOM_H, new BABYLON.Vector3(-ROOM_W / 2, ROOM_H / 2, 0), Math.PI / 2);

  // ---------- Ceiling ----------
  const ceil = BABYLON.MeshBuilder.CreatePlane('cyo_ceiling', { width: ROOM_W, height: ROOM_D }, scene);
  ceil.position = new BABYLON.Vector3(0, ROOM_H, 0);
  ceil.rotation.x = -Math.PI / 2;
  ceil.material = ceilingMat;
  ceil.isPickable = false;

  // Cyan LED ceiling strips (3 long bars across the room)
  for (let i = -1; i <= 1; i++) {
    const strip = BABYLON.MeshBuilder.CreateBox(`cyo_ledStrip_${i}`, { width: ROOM_W - 2, height: 0.05, depth: 0.18 }, scene);
    strip.position = new BABYLON.Vector3(0, ROOM_H - 0.06, i * 7);
    strip.material = accentMat;
    strip.isPickable = false;
  }

  // Cyan accent skirting along the long walls
  const skirtN = BABYLON.MeshBuilder.CreateBox('cyo_skirtN', { width: ROOM_W, height: 0.04, depth: 0.05 }, scene);
  skirtN.position = new BABYLON.Vector3(0, 0.04, ROOM_D / 2 - 0.06);
  skirtN.material = accentMat;
  const skirtS = skirtN.clone('cyo_skirtS');
  skirtS.position.z = -ROOM_D / 2 + 0.06;

  // ---------- Server rack wall (south wall) ----------
  const rackCount = 7;
  const rackSpacing = 1.2;
  const rackStartX = -((rackCount - 1) * rackSpacing) / 2;
  for (let r = 0; r < rackCount; r++) {
    const rx = rackStartX + r * rackSpacing;
    const rz = -ROOM_D / 2 + 0.55;

    // Rack chassis
    const rack = BABYLON.MeshBuilder.CreateBox(`cyo_rack_${r}`, { width: 1.0, height: 2.6, depth: 0.9 }, scene);
    rack.position = new BABYLON.Vector3(rx, 1.3, rz);
    rack.material = blackMat;
    rack.checkCollisions = true;
    if (shadowGenerator && quality !== 'low') shadowGenerator.addShadowCaster(rack);

    // Front face with blinking LEDs
    const front = BABYLON.MeshBuilder.CreatePlane(`cyo_rackFront_${r}`, { width: 0.95, height: 2.55 }, scene);
    front.position = new BABYLON.Vector3(rx, 1.3, rz + 0.46);
    const frontTex = new BABYLON.DynamicTexture(`cyo_rackTex_${r}`, { width: 256, height: 512 }, scene, false);
    const rctx = frontTex.getContext() as CanvasRenderingContext2D;
    rctx.fillStyle = '#0c0d10';
    rctx.fillRect(0, 0, 256, 512);
    // Server units (1U slots)
    for (let u = 0; u < 16; u++) {
      const yy = 20 + u * 30;
      rctx.fillStyle = '#1a1c22';
      rctx.fillRect(10, yy, 236, 24);
      rctx.strokeStyle = '#2a2d35';
      rctx.lineWidth = 1;
      rctx.strokeRect(10, yy, 236, 24);
      // Status LEDs
      const colors = ['#22c55e', '#22c55e', '#0ea5e9', '#22c55e', '#f59e0b', '#22c55e'];
      for (let l = 0; l < 6; l++) {
        rctx.fillStyle = colors[(u + l + r) % colors.length];
        rctx.fillRect(20 + l * 8, yy + 9, 4, 6);
      }
      // Drive bay slits
      rctx.fillStyle = '#000';
      rctx.fillRect(70, yy + 6, 160, 12);
    }
    frontTex.update();
    const frontMat = new BABYLON.StandardMaterial(`cyo_rackFrontMat_${r}`, scene);
    frontMat.diffuseTexture = frontTex;
    frontMat.emissiveTexture = frontTex;
    frontMat.emissiveColor = new BABYLON.Color3(0.4, 0.45, 0.5);
    frontMat.specularColor = BABYLON.Color3.Black();
    front.material = frontMat;
    front.isPickable = false;
  }

  // Soft cyan light bathing the rack wall
  if (quality !== 'low') {
    const rackLight = new BABYLON.PointLight('cyo_rackLight', new BABYLON.Vector3(0, 1.6, -ROOM_D / 2 + 2.5), scene);
    rackLight.diffuse = new BABYLON.Color3(0.2, 0.55, 1.0);
    rackLight.intensity = 0.45;
    rackLight.range = 14;
  }

  // ---------- Operator desks (2 rows of 3 = 6 stations) ----------
  // Match risk positions used in addCybersecurityProps (x in {-7,0,7}, z in {-5,5})
  const stations: { x: number; z: number; facing: number }[] = [
    { x: -7, z: -5, facing: 1 },
    { x:  0, z: -5, facing: 1 },
    { x:  7, z: -5, facing: 1 },
    { x: -7, z:  5, facing: -1 },
    { x:  0, z:  5, facing: -1 },
    { x:  7, z:  5, facing: -1 },
  ];

  stations.forEach((s, idx) => {
    // Desk surface (dark, glass-like)
    const desk = BABYLON.MeshBuilder.CreateBox(`cyo_desk_${idx}`, { width: 2.2, height: 0.06, depth: 1.1 }, scene);
    desk.position = new BABYLON.Vector3(s.x, 0.75, s.z);
    desk.material = deskMat;
    desk.checkCollisions = true;
    desk.receiveShadows = true;

    // Desk legs
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dz], li) => {
      const leg = BABYLON.MeshBuilder.CreateBox(`cyo_leg_${idx}_${li}`, { width: 0.05, height: 0.74, depth: 0.05 }, scene);
      leg.position = new BABYLON.Vector3(s.x + dx * 1.0, 0.37, s.z + dz * 0.5);
      leg.material = metalMat;
    });

    // Triple curved monitor setup (3 monitors per station)
    for (let m = -1; m <= 1; m++) {
      const monX = s.x + m * 0.75;
      const monZ = s.z + s.facing * 0.40;
      const yaw = m * 0.25 * -s.facing;

      const stand = BABYLON.MeshBuilder.CreateBox(`cyo_monStand_${idx}_${m}`, { width: 0.06, height: 0.35, depth: 0.06 }, scene);
      stand.position = new BABYLON.Vector3(monX, 0.95, monZ);
      stand.material = metalMat;

      const monitor = BABYLON.MeshBuilder.CreateBox(`cyo_mon_${idx}_${m}`, { width: 0.72, height: 0.45, depth: 0.04 }, scene);
      monitor.position = new BABYLON.Vector3(monX, 1.30, monZ);
      monitor.rotation.y = yaw;
      monitor.material = blackMat;
      if (shadowGenerator && quality !== 'low' && quality !== 'medium') shadowGenerator.addShadowCaster(monitor);

      // Emissive screen with terminal/code look
      const screen = BABYLON.MeshBuilder.CreatePlane(`cyo_screen_${idx}_${m}`, { width: 0.68, height: 0.41 }, scene);
      screen.position = new BABYLON.Vector3(
        monX + s.facing * 0.022 * Math.cos(yaw),
        1.30,
        monZ + s.facing * 0.022 * Math.sin(yaw) + s.facing * 0.022 * (Math.cos(yaw) - 1) * 0
      );
      // Place screen slightly in front of monitor along facing direction with yaw
      screen.position.x = monX + Math.sin(yaw) * 0.022 + s.facing * 0 ;
      screen.position.z = monZ + s.facing * 0.022;
      screen.rotation.y = yaw + (s.facing > 0 ? Math.PI : 0);

      const screenTex = new BABYLON.DynamicTexture(`cyo_screenTex_${idx}_${m}`, { width: 256, height: 160 }, scene, false);
      const sctx = screenTex.getContext() as CanvasRenderingContext2D;
      // Variation: terminal green / dashboard blue / log amber
      const variant = (idx + m + 3) % 3;
      const bg = variant === 0 ? '#020a06' : variant === 1 ? '#04101e' : '#100a02';
      const fg = variant === 0 ? '#22ff88' : variant === 1 ? '#5eb8ff' : '#ffb14a';
      sctx.fillStyle = bg;
      sctx.fillRect(0, 0, 256, 160);
      sctx.font = '10px monospace';
      sctx.fillStyle = fg;
      const lines = variant === 0
        ? ['$ ssh ops@srv-12', 'last login: ok', '> tail -f /var/log/auth', 'sshd: accepted', 'sshd: accepted', 'sshd: failed (3)', 'fail2ban: ban 10.0.', '> netstat -tlnp', 'tcp 0 *:22 LISTEN', 'tcp 0 *:443 LIST', '> _']
        : variant === 1
        ? ['SOC DASHBOARD', 'CPU  ████████ 78%', 'NET  ▆▇▆▆▇▅▆▇ 4.2G', 'IDS  alerts: 12', 'FW   blocks: 487', 'SIEM events: 9.2k', '────────────────', 'ALERT  HIGH', '  brute-force', '  src 45.12.0.0', 'STATUS  OK']
        : ['LOG STREAM', '[WARN] cert expiring', '[INFO] backup done', '[INFO] sync 0/132', '[ERR ] tls handshake', '[INFO] user login', '[WARN] disk 82%', '[INFO] patch ready', '[INFO] vpn up', '[ERR ] db slow query', '[INFO] sync OK'];
      lines.forEach((ln, li) => sctx.fillText(ln, 8, 14 + li * 12));
      screenTex.update();

      const screenMat = new BABYLON.StandardMaterial(`cyo_screenMat_${idx}_${m}`, scene);
      screenMat.diffuseTexture = screenTex;
      screenMat.emissiveTexture = screenTex;
      screenMat.emissiveColor = new BABYLON.Color3(0.7, 0.85, 1.0);
      screenMat.specularColor = BABYLON.Color3.Black();
      screen.material = screenMat;
      screen.isPickable = false;
    }

    // Mechanical keyboard
    const kb = BABYLON.MeshBuilder.CreateBox(`cyo_kb_${idx}`, { width: 0.5, height: 0.025, depth: 0.16 }, scene);
    kb.position = new BABYLON.Vector3(s.x, 0.79, s.z + s.facing * 0.05);
    kb.material = blackMat;

    // Gaming chair (simple)
    const chairBase = BABYLON.MeshBuilder.CreateCylinder(`cyo_chairBase_${idx}`, { height: 0.05, diameter: 0.55 }, scene);
    chairBase.position = new BABYLON.Vector3(s.x, 0.05, s.z - s.facing * 0.95);
    chairBase.material = metalMat;
    const chairSeat = BABYLON.MeshBuilder.CreateBox(`cyo_chairSeat_${idx}`, { width: 0.55, height: 0.1, depth: 0.55 }, scene);
    chairSeat.position = new BABYLON.Vector3(s.x, 0.50, s.z - s.facing * 0.95);
    chairSeat.material = blackMat;
    const chairBack = BABYLON.MeshBuilder.CreateBox(`cyo_chairBack_${idx}`, { width: 0.55, height: 0.85, depth: 0.08 }, scene);
    chairBack.position = new BABYLON.Vector3(s.x, 0.95, s.z - s.facing * 1.20);
    chairBack.material = blackMat;

    // Subtle blue desk under-glow
    if (quality !== 'low' && idx % 2 === 0) {
      const underGlow = new BABYLON.PointLight(`cyo_glow_${idx}`, new BABYLON.Vector3(s.x, 0.7, s.z), scene);
      underGlow.diffuse = new BABYLON.Color3(0.1, 0.4, 0.9);
      underGlow.intensity = 0.18;
      underGlow.range = 3.5;
    }
  });

  // ---------- NOC video wall (north wall) ----------
  const wallScreenW = 8.5;
  const wallScreenH = 2.4;
  const wallScreen = BABYLON.MeshBuilder.CreatePlane('cyo_wallScreen', { width: wallScreenW, height: wallScreenH }, scene);
  wallScreen.position = new BABYLON.Vector3(0, 2.0, ROOM_D / 2 - 0.05);
  wallScreen.rotation.y = Math.PI;
  const wsTex = new BABYLON.DynamicTexture('cyo_wallScreenTex', { width: 1024, height: 320 }, scene, false);
  const wctx2 = wsTex.getContext() as CanvasRenderingContext2D;
  wctx2.fillStyle = '#030814';
  wctx2.fillRect(0, 0, 1024, 320);
  // World map dots
  wctx2.fillStyle = '#1e3a5f';
  for (let i = 0; i < 600; i++) {
    wctx2.fillRect(Math.random() * 1024, 40 + Math.random() * 220, 2, 2);
  }
  // Threat lines
  wctx2.strokeStyle = '#ef4444';
  wctx2.lineWidth = 1.5;
  for (let i = 0; i < 18; i++) {
    wctx2.beginPath();
    wctx2.moveTo(Math.random() * 1024, 40 + Math.random() * 220);
    wctx2.lineTo(Math.random() * 1024, 40 + Math.random() * 220);
    wctx2.stroke();
  }
  // Header
  wctx2.fillStyle = '#5eb8ff';
  wctx2.font = 'bold 22px monospace';
  wctx2.fillText('GLOBAL THREAT MAP — LIVE', 20, 28);
  wctx2.fillStyle = '#22c55e';
  wctx2.font = '14px monospace';
  wctx2.fillText('ACTIVE: 12   BLOCKED: 487   ALERTS: 3', 20, 300);
  wsTex.update();
  const wsMat = new BABYLON.StandardMaterial('cyo_wallScreenMat', scene);
  wsMat.diffuseTexture = wsTex;
  wsMat.emissiveTexture = wsTex;
  wsMat.emissiveColor = new BABYLON.Color3(0.6, 0.8, 1.0);
  wsMat.specularColor = BABYLON.Color3.Black();
  wallScreen.material = wsMat;

  // Bezel around video wall
  const bezel = BABYLON.MeshBuilder.CreateBox('cyo_bezel', { width: wallScreenW + 0.3, height: wallScreenH + 0.3, depth: 0.08 }, scene);
  bezel.position = new BABYLON.Vector3(0, 2.0, ROOM_D / 2 - 0.02);
  bezel.material = blackMat;

  // ---------- Cable trays on ceiling ----------
  for (let i = 0; i < 4; i++) {
    const tray = BABYLON.MeshBuilder.CreateBox(`cyo_tray_${i}`, { width: 0.3, height: 0.08, depth: ROOM_D - 2 }, scene);
    tray.position = new BABYLON.Vector3(-9 + i * 6, ROOM_H - 0.25, 0);
    tray.material = metalMat;
  }

  // ---------- Lighting tweaks ----------
  // Brighter cool fill so risk markers (post-its, documents, USB) remain readable
  const hemi = scene.getLightByName('ambientLight') as BABYLON.HemisphericLight | null;
  if (hemi) {
    hemi.diffuse = new BABYLON.Color3(0.85, 0.92, 1.0);
    hemi.groundColor = new BABYLON.Color3(0.25, 0.30, 0.38);
    hemi.intensity = 1.15;
  }
  const dir = scene.getLightByName('directionalLight') as BABYLON.DirectionalLight | null;
  if (dir) {
    dir.intensity = 0.9;
    dir.diffuse = new BABYLON.Color3(0.85, 0.92, 1.0);
  }
  // Add overhead fill lights along the ceiling for even illumination
  if (quality !== 'low') {
    [-8, 0, 8].forEach((zx, ix) => {
      const fill = new BABYLON.PointLight(`cyo_fill_${ix}`, new BABYLON.Vector3(zx, ROOM_H - 0.4, 0), scene);
      fill.diffuse = new BABYLON.Color3(0.75, 0.85, 1.0);
      fill.intensity = 0.55;
      fill.range = 14;
    });
  }
  // Lift the clear color for less crushed blacks at the edges
  scene.clearColor = new BABYLON.Color4(0.14, 0.17, 0.22, 1);

  console.log('[CyberSecurityOffice] SOC environment built — racks, NOC wall, triple-monitor desks');
}
