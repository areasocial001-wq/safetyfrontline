import * as BABYLON from '@babylonjs/core';
import { toast } from 'sonner';

/**
 * Load GLTF environment model with optimizations, fallback to procedural.
 */
export async function loadEnvironmentOptimized(
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
  // office and construction use procedural geometry — no GLTF model

  if (modelPath) {
    const startTime = performance.now();

    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync('', '', modelPath, scene);
      console.log('[Babylon] Loaded GLTF model:', modelPath, 'meshes:', result.meshes.length);

      let totalTriangles = 0;
      let optimizedMeshes = 0;
      let texturesOptimized = 0;

      result.meshes.forEach((mesh) => {
        if (mesh.name === '__root__') return;

        mesh.checkCollisions = true;
        mesh.receiveShadows = quality !== 'low';

        if ((quality === 'high' || quality === 'ultra') && shadowGenerator) {
          shadowGenerator.addShadowCaster(mesh);
        }

        if (mesh instanceof BABYLON.Mesh && mesh.geometry) {
          const vertices = mesh.getTotalVertices();
          totalTriangles += vertices / 3;
          // NOTE: do NOT freeze world matrix here — must wait until root scaling is applied
          if (quality !== 'low') {
            mesh.createNormals(false);
          }
          optimizedMeshes++;
        }

        // Convert PBR → StandardMaterial to avoid GL_MAX_VERTEX_UNIFORM_BUFFERS overflow
        if (mesh.material instanceof BABYLON.PBRMaterial) {
          const pbrMat = mesh.material as BABYLON.PBRMaterial;
          const baseColor = pbrMat.albedoColor || new BABYLON.Color3(0.6, 0.6, 0.6);
          const stdMat = new BABYLON.StandardMaterial(`${mesh.material.name}_std`, scene);
          stdMat.diffuseColor = baseColor;
          stdMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
          stdMat.specularPower = 16;
          stdMat.emissiveColor = baseColor.scale(0.08);
          stdMat.backFaceCulling = true;

          // Transfer diffuse texture if available
          if (pbrMat.albedoTexture) {
            stdMat.diffuseTexture = pbrMat.albedoTexture;
            if (stdMat.diffuseTexture instanceof BABYLON.Texture) {
              stdMat.diffuseTexture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
              stdMat.diffuseTexture.anisotropicFilteringLevel = quality === 'low' ? 1 : quality === 'medium' ? 2 : 4;
              texturesOptimized++;
            }
          }
          if (pbrMat.bumpTexture && quality !== 'low') {
            stdMat.bumpTexture = pbrMat.bumpTexture;
          }
          stdMat.freeze();
          mesh.material = stdMat;
        } else if (mesh.material instanceof BABYLON.StandardMaterial) {
          const stdMat = mesh.material as BABYLON.StandardMaterial;
          if (stdMat.diffuseTexture instanceof BABYLON.Texture) {
            stdMat.diffuseTexture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            stdMat.diffuseTexture.anisotropicFilteringLevel = quality === 'low' ? 1 : quality === 'medium' ? 2 : 4;
            texturesOptimized++;
          }
          if (quality === 'low') {
            stdMat.specularPower = 0;
          }
          stdMat.freeze();
        }
      });

      // Apply root scaling FIRST, then freeze child world matrices
      if (result.meshes[0]) {
        const rootMesh = result.meshes[0];
        rootMesh.scaling = new BABYLON.Vector3(2, 2, 2);
        rootMesh.position = new BABYLON.Vector3(0, 0, 0);
        // Force world matrix computation for all children before freezing
        rootMesh.computeWorldMatrix(true);
        result.meshes.forEach(mesh => {
          if (mesh.name !== '__root__' && mesh instanceof BABYLON.Mesh) {
            mesh.computeWorldMatrix(true);
            mesh.freezeWorldMatrix();
            mesh.doNotSyncBoundingInfo = true;
          }
        });
      }

      const loadTime = performance.now() - startTime;
      console.log(`[Babylon] Model optimization complete:`, {
        meshes: result.meshes.length,
        triangles: Math.round(totalTriangles),
        optimizedMeshes,
        texturesOptimized,
        loadTime: `${loadTime.toFixed(2)}ms`,
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

  // Fallback to procedural geometry
  createProceduralEnvironment(scene, type, quality, shadowGenerator);
}

function createProceduralEnvironment(
  scene: BABYLON.Scene,
  type: string,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  if (type === 'office') {
    createRealisticOffice(scene, quality, shadowGenerator);
  } else if (type === 'construction') {
    createConstructionSite(scene, quality, shadowGenerator);
  } else {
    createGenericRoom(scene, type, quality, shadowGenerator);
  }
}

function createConstructionSite(
  scene: BABYLON.Scene,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  // Open-air construction site with ground and perimeter fencing
  const siteSize = 30;

  // Dirt/gravel ground
  const siteFloor = BABYLON.MeshBuilder.CreateGround('constructionFloor', { width: siteSize, height: siteSize }, scene);
  siteFloor.position.y = 0.01;
  const floorMat = new BABYLON.StandardMaterial('constrFloorMat', scene);
  floorMat.diffuseColor = new BABYLON.Color3(0.55, 0.45, 0.32);
  floorMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.08);
  siteFloor.material = floorMat;
  siteFloor.receiveShadows = true;

  // Perimeter fencing (mesh-style walls)
  const fenceMat = new BABYLON.StandardMaterial('fenceMat', scene);
  fenceMat.diffuseColor = new BABYLON.Color3(0.55, 0.55, 0.58);
  fenceMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  fenceMat.alpha = 0.85;

  const halfSize = siteSize / 2;
  const fenceH = 2.5;
  const fenceConfigs = [
    { x: 0, z: -halfSize, w: siteSize, d: 0.1 },
    { x: 0, z: halfSize, w: siteSize, d: 0.1 },
    { x: -halfSize, z: 0, w: 0.1, d: siteSize },
    { x: halfSize, z: 0, w: 0.1, d: siteSize },
  ];
  fenceConfigs.forEach((fc, i) => {
    const fence = BABYLON.MeshBuilder.CreateBox(`fence_${i}`, { width: fc.w, height: fenceH, depth: fc.d }, scene);
    fence.position = new BABYLON.Vector3(fc.x, fenceH / 2, fc.z);
    fence.material = fenceMat;
    fence.checkCollisions = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(fence);
  });

  // Concrete foundation blocks
  const concreteMat = new BABYLON.StandardMaterial('constrConcrete', scene);
  concreteMat.diffuseColor = new BABYLON.Color3(0.65, 0.63, 0.6);
  concreteMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const foundations = [
    { x: -6, z: -4, w: 8, h: 0.5, d: 6 },
    { x: 6, z: 5, w: 5, h: 0.3, d: 8 },
  ];
  foundations.forEach((f, i) => {
    const block = BABYLON.MeshBuilder.CreateBox(`foundation_${i}`, { width: f.w, height: f.h, depth: f.d }, scene);
    block.position = new BABYLON.Vector3(f.x, f.h / 2, f.z);
    block.material = concreteMat;
    block.checkCollisions = true;
    block.receiveShadows = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(block);
  });

  console.log('[Construction] Procedural construction site created');
}

function createGenericRoom(
  scene: BABYLON.Scene,
  type: string,
  quality: string,
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
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
      : new BABYLON.Color3(0.65, 0.68, 0.7);
    mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    mat.specularPower = 16;
    wall.material = mat;
    if (shadowGenerator) shadowGenerator.addShadowCaster(wall);
  });
  const ceil = BABYLON.MeshBuilder.CreatePlane('ceiling', { width: roomSize, height: roomSize }, scene);
  ceil.position.y = wallHeight;
  ceil.rotation.x = Math.PI / 2;
  const ceilingMat = new BABYLON.StandardMaterial('ceilingMat', scene);
  ceilingMat.diffuseColor = new BABYLON.Color3(0.25, 0.27, 0.3);
  ceilingMat.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.03);
  ceilingMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  ceil.material = ceilingMat;
  if (type === 'warehouse') createWarehouseObjects(scene);
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


function createRealisticOffice(
  scene: BABYLON.Scene,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  const wallH = 3.2;
  const wallMat = new BABYLON.StandardMaterial('officeWallMat', scene);
  wallMat.diffuseColor = new BABYLON.Color3(0.92, 0.91, 0.88);
  wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const accentWallMat = new BABYLON.StandardMaterial('accentWallMat', scene);
  accentWallMat.diffuseColor = new BABYLON.Color3(0.25, 0.4, 0.6);
  accentWallMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const glassMat = new BABYLON.StandardMaterial('glassMat', scene);
  glassMat.diffuseColor = new BABYLON.Color3(0.7, 0.85, 0.95);
  glassMat.alpha = 0.3;
  glassMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  glassMat.specularPower = 128;

  const floorMat = new BABYLON.StandardMaterial('officeFloorMat', scene);
  floorMat.diffuseColor = new BABYLON.Color3(0.75, 0.72, 0.68);
  floorMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  floorMat.specularPower = 16;

  const officeFloor = BABYLON.MeshBuilder.CreateGround('officeFloor', { width: 30, height: 24 }, scene);
  officeFloor.position.y = 0.01;
  officeFloor.material = floorMat;
  officeFloor.receiveShadows = true;

  const carpet = BABYLON.MeshBuilder.CreateGround('carpet', { width: 6, height: 5 }, scene);
  carpet.position = new BABYLON.Vector3(10, 0.02, -6);
  const carpetMat = new BABYLON.StandardMaterial('carpetMat', scene);
  carpetMat.diffuseColor = new BABYLON.Color3(0.3, 0.35, 0.5);
  carpetMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  carpet.material = carpetMat;

  const makeWall = (name: string, w: number, h: number, d: number, pos: BABYLON.Vector3, mat: BABYLON.StandardMaterial) => {
    const wall = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    wall.position = pos;
    wall.checkCollisions = true;
    wall.material = mat;
    wall.receiveShadows = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(wall);
    return wall;
  };

  // Perimeter walls
  makeWall('wall_N', 30, wallH, 0.3, new BABYLON.Vector3(0, wallH / 2, -12), wallMat);
  makeWall('wall_S', 30, wallH, 0.3, new BABYLON.Vector3(0, wallH / 2, 12), accentWallMat);
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

  // Meeting room
  makeWall('meetingWall', 0.15, wallH, 8, new BABYLON.Vector3(6.5, wallH / 2, -6), wallMat);
  const glass = BABYLON.MeshBuilder.CreateBox('glassPartition', { width: 0.08, height: 2.2, depth: 5 }, scene);
  glass.position = new BABYLON.Vector3(6.5, 1.6, -2);
  glass.material = glassMat;
  glass.checkCollisions = true;

  // Meeting table
  const meetTable = BABYLON.MeshBuilder.CreateBox('meetingTable', { width: 3.5, height: 0.08, depth: 1.5 }, scene);
  meetTable.position = new BABYLON.Vector3(10, 0.75, -6);
  const tableMat = new BABYLON.StandardMaterial('meetTableMat', scene);
  tableMat.diffuseColor = new BABYLON.Color3(0.45, 0.35, 0.25);
  tableMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  tableMat.specularPower = 32;
  meetTable.material = tableMat;
  meetTable.checkCollisions = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(meetTable);

  // Table legs
  for (let c = 0; c < 4; c++) {
    const leg = BABYLON.MeshBuilder.CreateCylinder(`meetLeg_${c}`, { height: 0.75, diameter: 0.06 }, scene);
    leg.position = new BABYLON.Vector3(10 + (c % 2 === 0 ? -1.5 : 1.5), 0.375, -6 + (c < 2 ? -0.6 : 0.6));
    const legMat = new BABYLON.StandardMaterial(`meetLegMat_${c}`, scene);
    legMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);
    legMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    leg.material = legMat;
  }

  // Meeting chairs
  for (let c = 0; c < 6; c++) {
    const mChair = BABYLON.MeshBuilder.CreateBox(`meetChair_${c}`, { width: 0.5, height: 0.45, depth: 0.5 }, scene);
    const side = c < 3 ? -1 : 1;
    mChair.position = new BABYLON.Vector3(8.5 + (c % 3) * 1.1, 0.225, -6 + side * 1.2);
    const mcMat = new BABYLON.StandardMaterial(`mcMat_${c}`, scene);
    mcMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.3);
    mChair.material = mcMat;
    const mBack = BABYLON.MeshBuilder.CreateBox(`meetBack_${c}`, { width: 0.5, height: 0.4, depth: 0.06 }, scene);
    mBack.position = new BABYLON.Vector3(mChair.position.x, 0.65, mChair.position.z - side * 0.22);
    mBack.material = mcMat;
  }

  // Whiteboard
  const wb = BABYLON.MeshBuilder.CreateBox('whiteboard', { width: 2.5, height: 1.2, depth: 0.05 }, scene);
  wb.position = new BABYLON.Vector3(14.7, 1.8, -6);
  wb.rotation.y = Math.PI / 2;
  const wbMat = new BABYLON.StandardMaterial('wbMat', scene);
  wbMat.diffuseColor = new BABYLON.Color3(0.98, 0.98, 0.98);
  wbMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  wb.material = wbMat;
  if (shadowGenerator) shadowGenerator.addShadowCaster(wb);

  // Break area (simplified - key furniture items)
  const baCX = -10, baCZ = 5;

  // Coffee machine
  const coffeeBase = BABYLON.MeshBuilder.CreateBox('coffeeBase', { width: 0.5, height: 0.65, depth: 0.45 }, scene);
  coffeeBase.position = new BABYLON.Vector3(baCX - 2.5, 0.325, baCZ + 1);
  const coffeeMat = new BABYLON.StandardMaterial('coffeeMat', scene);
  coffeeMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.14);
  coffeeMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  coffeeMat.specularPower = 64;
  coffeeBase.material = coffeeMat;
  coffeeBase.checkCollisions = true;

  // Refrigerator
  const fridgeBody = BABYLON.MeshBuilder.CreateBox('fridgeBody', { width: 0.7, height: 1.75, depth: 0.65 }, scene);
  fridgeBody.position = new BABYLON.Vector3(baCX - 2.5, 0.875, baCZ - 0.5);
  const fridgeMat = new BABYLON.StandardMaterial('fridgeMat', scene);
  fridgeMat.diffuseColor = new BABYLON.Color3(0.88, 0.9, 0.92);
  fridgeMat.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  fridgeMat.specularPower = 128;
  fridgeBody.material = fridgeMat;
  fridgeBody.checkCollisions = true;

  // Vending machine
  const vending = BABYLON.MeshBuilder.CreateBox('vendingMachine', { width: 0.8, height: 1.8, depth: 0.7 }, scene);
  vending.position = new BABYLON.Vector3(baCX - 2.5, 0.9, baCZ + 2.5);
  const vendMat = new BABYLON.StandardMaterial('vendMat', scene);
  vendMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
  vendMat.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.15);
  vending.material = vendMat;
  vending.checkCollisions = true;

  // Break table
  const breakTableLeg = BABYLON.MeshBuilder.CreateCylinder('breakTableLeg', { height: 0.7, diameter: 0.08 }, scene);
  breakTableLeg.position = new BABYLON.Vector3(baCX, 0.35, baCZ);
  const legMat2 = new BABYLON.StandardMaterial('breakLegMat', scene);
  legMat2.diffuseColor = new BABYLON.Color3(0.55, 0.55, 0.58);
  breakTableLeg.material = legMat2;
  const breakTable = BABYLON.MeshBuilder.CreateCylinder('breakTable', { height: 0.05, diameter: 1.0 }, scene);
  breakTable.position = new BABYLON.Vector3(baCX, 0.73, baCZ);
  const btMat = new BABYLON.StandardMaterial('btMat', scene);
  btMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
  breakTable.material = btMat;

  // Trash bins
  [new BABYLON.Vector3(-5, 0, 6), new BABYLON.Vector3(4, 0, -2), new BABYLON.Vector3(12, 0, 4)].forEach((pos, i) => {
    const bin = BABYLON.MeshBuilder.CreateCylinder(`trashBin_${i}`, {
      height: 0.5, diameterTop: 0.3, diameterBottom: 0.25, tessellation: 12
    }, scene);
    bin.position = pos.clone().addInPlace(new BABYLON.Vector3(0, 0.25, 0));
    const binMat = new BABYLON.StandardMaterial(`binMat_${i}`, scene);
    binMat.diffuseColor = new BABYLON.Color3(0.35, 0.35, 0.38);
    bin.material = binMat;
  });

  console.log('[Office] Realistic office environment created');
}
