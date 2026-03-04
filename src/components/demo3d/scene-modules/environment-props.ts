import * as BABYLON from '@babylonjs/core';
import { toast } from 'sonner';
import { AmbientAudioPlayer } from '@/lib/audio-system';
import { getVoiceNarrator } from '@/lib/voice-narrator';
import { NPCAmbientSoundSystem } from '@/lib/npc-ambient-sounds';

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
    addOfficeProps(scene, quality, shadowGenerator);
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

  // Fire emitters for fire simulation
  const fireData = [
    { pos: new BABYLON.Vector3(-5, 0.3, -7), nearRiskId: 'lab_risk_1' },
    { pos: new BABYLON.Vector3(3, 0.3, 8), nearRiskId: 'lab_risk_6' },
    { pos: new BABYLON.Vector3(7, 0.3, -3), nearRiskId: 'lab_risk_9' },
  ];

  fireData.forEach((fd, idx) => {
    const fireEmitter = BABYLON.MeshBuilder.CreateBox(`fireEmitter_${idx}`, { size: 0.3 }, scene);
    fireEmitter.position = fd.pos;
    fireEmitter.isVisible = false;

    const fire = new BABYLON.ParticleSystem(`fire_${idx}`, 150, scene);
    fire.emitter = fireEmitter;
    fire.particleTexture = new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png', scene);
    fire.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
    fire.color2 = new BABYLON.Color4(1, 0.2, 0, 0.8);
    fire.colorDead = new BABYLON.Color4(0.3, 0.1, 0, 0);
    fire.minSize = 0.15;
    fire.maxSize = 0.6;
    fire.minLifeTime = 0.3;
    fire.maxLifeTime = 0.8;
    fire.emitRate = 120;
    fire.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    fire.gravity = new BABYLON.Vector3(0, 2, 0);
    fire.direction1 = new BABYLON.Vector3(-0.3, 1, -0.3);
    fire.direction2 = new BABYLON.Vector3(0.3, 2, 0.3);
    fire.minEmitPower = 0.5;
    fire.maxEmitPower = 1.5;
    fire.updateSpeed = 0.008;
    fire.start();

    // Fire light
    const fireLight = new BABYLON.PointLight(`fireLight_${idx}`, fd.pos.add(new BABYLON.Vector3(0, 1, 0)), scene);
    fireLight.diffuse = new BABYLON.Color3(1, 0.5, 0.1);
    fireLight.intensity = 2;
    fireLight.range = 8;

    // Flickering
    scene.registerBeforeRender(() => {
      fireLight.intensity = 1.5 + Math.random() * 1.5;
    });
  });

  // Smoke system
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
  const waterMat = new BABYLON.StandardMaterial('off_waterMat', scene);
  waterMat.diffuseColor = new BABYLON.Color3(0.6, 0.8, 0.95);
  waterMat.alpha = 0.6;
  dispenserBottle.material = waterMat;

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
  const printer = BABYLON.MeshBuilder.CreateBox('off_printer', { width: 0.5, height: 0.35, depth: 0.4 }, scene);
  printer.position = new BABYLON.Vector3(0, 0.93, -8);
  const printerMat = new BABYLON.StandardMaterial('off_printerMat', scene);
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

  console.log('[Office] Full office furnishing complete — desks, chairs, monitors, bookshelves, windows, break area');
}
