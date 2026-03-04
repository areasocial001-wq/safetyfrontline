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

    if (quality !== 'low') {
      const pointLight = new BABYLON.PointLight(`whPointLight_${i}`, new BABYLON.Vector3(lx, 6.0, lz), scene);
      pointLight.intensity = 0.5;
      pointLight.range = 14;
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
// OFFICE PROPS (additional details beyond createRealisticOffice)
// ============================================================
function addOfficeProps(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  // Office-specific lighting
  for (let i = 0; i < 6; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const lx = -8 + col * 8;
    const lz = -6 + row * 12;

    if (quality !== 'low') {
      const pointLight = new BABYLON.PointLight(`officeLight_${i}`, new BABYLON.Vector3(lx, 2.8, lz), scene);
      pointLight.intensity = 0.6;
      pointLight.range = 10;
      pointLight.diffuse = new BABYLON.Color3(1, 0.95, 0.9);
    }
  }

  console.log('[Office] Office environment props added');
}
