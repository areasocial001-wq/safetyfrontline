import * as BABYLON from '@babylonjs/core';

/**
 * Procedural Low-Poly Industrial Props Generator
 * Creates common industrial objects without external GLTF files
 */

export interface ProceduralPropConfig {
  type: 'pallet' | 'barrel' | 'traffic-cone' | 'safety-barrier' | 'office-printer' | 'office-phone' | 'filing-cabinet' | 'office-plant' | 'office-door' | 'office-window' | 'office-painting' | 'office-poster' | 'desk-lamp' | 'ceiling-lamp' | 'office-sofa' | 'coffee-table' | 'wall-clock' | 'wall-calendar' | 'vending-machine' | 'water-cooler' | 'emergency-exit-sign' | 'fire-extinguisher' | 'reception-desk' | 'visitor-chair' | 'bookshelf' | 'whiteboard' | 'cafeteria-table' | 'cafeteria-chair' | 'decorative-carpet';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  enableCollisions?: boolean;
  castShadows?: boolean;
  receiveShadows?: boolean;
  colorVariant?: number; // 0-2 for color variations
}

/**
 * Creates a procedural industrial pallet (Euro pallet style)
 */
export function createPallet(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const pallet = new BABYLON.Mesh('pallet', scene);
  
  // Pallet dimensions (Euro pallet: 1.2m x 0.8m x 0.144m)
  const width = 1.2 * scale;
  const depth = 0.8 * scale;
  const height = 0.144 * scale;
  const plankThickness = 0.022 * scale;
  const blockHeight = 0.1 * scale;
  
  // Wood material
  const woodMat = new BABYLON.StandardMaterial('palletWood', scene);
  woodMat.diffuseColor = new BABYLON.Color3(0.55, 0.4, 0.25); // Brown wood
  woodMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  woodMat.roughness = 0.8;
  
  // Top planks (5 planks)
  for (let i = 0; i < 5; i++) {
    const plank = BABYLON.MeshBuilder.CreateBox(`topPlank${i}`, {
      width: width,
      height: plankThickness,
      depth: 0.14 * scale
    }, scene);
    plank.position.y = blockHeight + plankThickness / 2;
    plank.position.z = -depth / 2 + (i * 0.2 * scale) + 0.1 * scale;
    plank.material = woodMat;
    plank.parent = pallet;
  }
  
  // Support blocks (9 blocks - 3x3 grid)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const block = BABYLON.MeshBuilder.CreateBox(`block${row}_${col}`, {
        width: 0.145 * scale,
        height: blockHeight,
        depth: 0.145 * scale
      }, scene);
      block.position.y = blockHeight / 2;
      block.position.x = -width / 2 + (col * width / 2) + 0.3 * scale;
      block.position.z = -depth / 2 + (row * depth / 2) + 0.2 * scale;
      block.material = woodMat;
      block.parent = pallet;
    }
  }
  
  // Bottom planks (3 planks)
  for (let i = 0; i < 3; i++) {
    const plank = BABYLON.MeshBuilder.CreateBox(`bottomPlank${i}`, {
      width: width,
      height: plankThickness,
      depth: 0.145 * scale
    }, scene);
    plank.position.y = plankThickness / 2;
    plank.position.z = -depth / 2 + (i * depth / 2) + 0.2 * scale;
    plank.material = woodMat;
    plank.parent = pallet;
  }
  
  pallet.position = position;
  return pallet;
}

/**
 * Creates a procedural industrial barrel (oil drum style)
 */
export function createBarrel(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const barrel = new BABYLON.Mesh('barrel', scene);
  
  const radius = 0.3 * scale;
  const height = 0.85 * scale;
  
  // Barrel body
  const body = BABYLON.MeshBuilder.CreateCylinder('barrelBody', {
    diameter: radius * 2,
    height: height,
    tessellation: 16
  }, scene);
  body.parent = barrel;
  
  // Metal material
  const metalMat = new BABYLON.StandardMaterial('barrelMetal', scene);
  metalMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35); // Dark gray metal
  metalMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  metalMat.roughness = 0.6;
  body.material = metalMat;
  
  // Top rim
  const topRim = BABYLON.MeshBuilder.CreateTorus('topRim', {
    diameter: radius * 2,
    thickness: 0.03 * scale,
    tessellation: 16
  }, scene);
  topRim.position.y = height / 2;
  topRim.parent = barrel;
  topRim.material = metalMat;
  
  // Bottom rim
  const bottomRim = BABYLON.MeshBuilder.CreateTorus('bottomRim', {
    diameter: radius * 2,
    thickness: 0.03 * scale,
    tessellation: 16
  }, scene);
  bottomRim.position.y = -height / 2;
  bottomRim.parent = barrel;
  bottomRim.material = metalMat;
  
  // Middle band
  const middleBand = BABYLON.MeshBuilder.CreateTorus('middleBand', {
    diameter: radius * 2.05,
    thickness: 0.04 * scale,
    tessellation: 16
  }, scene);
  middleBand.parent = barrel;
  middleBand.material = metalMat;
  
  // Top cap
  const topCap = BABYLON.MeshBuilder.CreateCylinder('topCap', {
    diameter: radius * 1.6,
    height: 0.02 * scale,
    tessellation: 16
  }, scene);
  topCap.position.y = height / 2 + 0.01 * scale;
  topCap.parent = barrel;
  topCap.material = metalMat;
  
  barrel.position = position;
  return barrel;
}

/**
 * Creates a procedural traffic cone
 */
export function createTrafficCone(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const cone = new BABYLON.Mesh('trafficCone', scene);
  
  const baseRadius = 0.25 * scale;
  const coneHeight = 0.7 * scale;
  const baseHeight = 0.05 * scale;
  
  // Cone body
  const body = BABYLON.MeshBuilder.CreateCylinder('coneBody', {
    diameterTop: 0.05 * scale,
    diameterBottom: baseRadius * 2 * 0.7,
    height: coneHeight,
    tessellation: 12
  }, scene);
  body.position.y = baseHeight + coneHeight / 2;
  body.parent = cone;
  
  // Orange material
  const orangeMat = new BABYLON.StandardMaterial('coneOrange', scene);
  orangeMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0); // Safety orange
  orangeMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  body.material = orangeMat;
  
  // White reflective stripes
  const whiteMat = new BABYLON.StandardMaterial('coneWhite', scene);
  whiteMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  whiteMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  
  const stripePositions = [0.3, 0.55];
  stripePositions.forEach((relativePos, index) => {
    const stripe = BABYLON.MeshBuilder.CreateTorus(`stripe${index}`, {
      diameter: baseRadius * 2 * (1 - relativePos * 0.5),
      thickness: 0.04 * scale,
      tessellation: 12
    }, scene);
    stripe.position.y = baseHeight + coneHeight * relativePos;
    stripe.parent = cone;
    stripe.material = whiteMat;
  });
  
  // Base
  const base = BABYLON.MeshBuilder.CreateCylinder('coneBase', {
    diameter: baseRadius * 2,
    height: baseHeight,
    tessellation: 12
  }, scene);
  base.position.y = baseHeight / 2;
  base.parent = cone;
  
  // Black base material
  const blackMat = new BABYLON.StandardMaterial('coneBase', scene);
  blackMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  base.material = blackMat;
  
  cone.position = position;
  return cone;
}

/**
 * Creates a procedural safety barrier (construction barrier)
 */
export function createSafetyBarrier(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const barrier = new BABYLON.Mesh('safetyBarrier', scene);
  
  const width = 2.0 * scale;
  const height = 1.0 * scale;
  const depth = 0.4 * scale;
  const legWidth = 0.08 * scale;
  
  // Yellow and black striped material
  const stripedMat = new BABYLON.StandardMaterial('barrierStriped', scene);
  stripedMat.diffuseColor = new BABYLON.Color3(1, 0.85, 0); // Safety yellow
  stripedMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  
  const blackMat = new BABYLON.StandardMaterial('barrierBlack', scene);
  blackMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  
  // Top horizontal bar (striped)
  const topBar = BABYLON.MeshBuilder.CreateBox('topBar', {
    width: width,
    height: 0.15 * scale,
    depth: depth * 0.5
  }, scene);
  topBar.position.y = height * 0.8;
  topBar.parent = barrier;
  topBar.material = stripedMat;
  
  // Create black stripes on top bar
  for (let i = 0; i < 8; i += 2) {
    const stripe = BABYLON.MeshBuilder.CreateBox(`topStripe${i}`, {
      width: width / 8,
      height: 0.16 * scale,
      depth: depth * 0.52
    }, scene);
    stripe.position.y = height * 0.8;
    stripe.position.x = -width / 2 + (i * width / 8) + width / 16;
    stripe.parent = barrier;
    stripe.material = blackMat;
  }
  
  // Middle horizontal bar (striped)
  const midBar = BABYLON.MeshBuilder.CreateBox('midBar', {
    width: width,
    height: 0.15 * scale,
    depth: depth * 0.5
  }, scene);
  midBar.position.y = height * 0.5;
  midBar.parent = barrier;
  midBar.material = stripedMat;
  
  // Create black stripes on middle bar (offset pattern)
  for (let i = 1; i < 8; i += 2) {
    const stripe = BABYLON.MeshBuilder.CreateBox(`midStripe${i}`, {
      width: width / 8,
      height: 0.16 * scale,
      depth: depth * 0.52
    }, scene);
    stripe.position.y = height * 0.5;
    stripe.position.x = -width / 2 + (i * width / 8) + width / 16;
    stripe.parent = barrier;
    stripe.material = blackMat;
  }
  
  // Left leg
  const leftLeg = BABYLON.MeshBuilder.CreateBox('leftLeg', {
    width: legWidth,
    height: height,
    depth: depth
  }, scene);
  leftLeg.position.x = -width / 2 + legWidth / 2;
  leftLeg.position.y = height / 2;
  leftLeg.parent = barrier;
  leftLeg.material = stripedMat;
  
  // Right leg
  const rightLeg = BABYLON.MeshBuilder.CreateBox('rightLeg', {
    width: legWidth,
    height: height,
    depth: depth
  }, scene);
  rightLeg.position.x = width / 2 - legWidth / 2;
  rightLeg.position.y = height / 2;
  rightLeg.parent = barrier;
  rightLeg.material = stripedMat;
  
  // Feet
  const leftFoot = BABYLON.MeshBuilder.CreateBox('leftFoot', {
    width: depth,
    height: legWidth,
    depth: depth
  }, scene);
  leftFoot.position.x = -width / 2 + legWidth / 2;
  leftFoot.position.y = legWidth / 2;
  leftFoot.parent = barrier;
  leftFoot.material = blackMat;
  
  const rightFoot = BABYLON.MeshBuilder.CreateBox('rightFoot', {
    width: depth,
    height: legWidth,
    depth: depth
  }, scene);
  rightFoot.position.x = width / 2 - legWidth / 2;
  rightFoot.position.y = legWidth / 2;
  rightFoot.parent = barrier;
  rightFoot.material = blackMat;
  
  barrier.position = position;
  return barrier;
}

/**
 * Creates a procedural office printer
 */
export function createOfficePrinter(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const printer = new BABYLON.Mesh('officePrinter', scene);
  
  const width = 0.45 * scale;
  const depth = 0.35 * scale;
  const height = 0.3 * scale;
  
  // Printer body (light gray)
  const body = BABYLON.MeshBuilder.CreateBox('printerBody', {
    width: width,
    height: height,
    depth: depth
  }, scene);
  body.position.y = height / 2;
  body.parent = printer;
  
  const bodyMat = new BABYLON.StandardMaterial('printerBody', scene);
  bodyMat.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.87); // Light gray
  bodyMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  body.material = bodyMat;
  
  // Paper tray (white)
  const paperTray = BABYLON.MeshBuilder.CreateBox('paperTray', {
    width: width * 0.8,
    height: 0.02 * scale,
    depth: depth * 0.9
  }, scene);
  paperTray.position.y = height + 0.01 * scale;
  paperTray.parent = printer;
  
  const paperMat = new BABYLON.StandardMaterial('printerPaper', scene);
  paperMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
  paperTray.material = paperMat;
  
  // Control panel (dark gray)
  const panel = BABYLON.MeshBuilder.CreateBox('controlPanel', {
    width: width * 0.5,
    height: 0.08 * scale,
    depth: 0.02 * scale
  }, scene);
  panel.position.y = height * 0.7;
  panel.position.z = -depth / 2 + 0.01 * scale;
  panel.rotation.x = -Math.PI / 12;
  panel.parent = printer;
  
  const panelMat = new BABYLON.StandardMaterial('controlPanel', scene);
  panelMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
  panelMat.emissiveColor = new BABYLON.Color3(0, 0.1, 0.2); // Slight blue glow
  panel.material = panelMat;
  
  // Output tray
  const outputTray = BABYLON.MeshBuilder.CreateBox('outputTray', {
    width: width * 0.7,
    height: 0.03 * scale,
    depth: 0.15 * scale
  }, scene);
  outputTray.position.y = height * 0.4;
  outputTray.position.z = depth / 2 + 0.075 * scale;
  outputTray.parent = printer;
  outputTray.material = bodyMat;
  
  printer.position = position;
  return printer;
}

/**
 * Creates a procedural office phone
 */
export function createOfficePhone(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const phone = new BABYLON.Mesh('officePhone', scene);
  
  // Base unit
  const baseWidth = 0.18 * scale;
  const baseDepth = 0.22 * scale;
  const baseHeight = 0.05 * scale;
  
  const base = BABYLON.MeshBuilder.CreateBox('phoneBase', {
    width: baseWidth,
    height: baseHeight,
    depth: baseDepth
  }, scene);
  base.position.y = baseHeight / 2;
  base.parent = phone;
  
  const phoneMat = new BABYLON.StandardMaterial('phoneMaterial', scene);
  phoneMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.18); // Dark gray/black
  phoneMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  base.material = phoneMat;
  
  // Handset body
  const handset = BABYLON.MeshBuilder.CreateCylinder('handset', {
    diameter: 0.04 * scale,
    height: 0.2 * scale,
    tessellation: 8
  }, scene);
  handset.position.x = -baseWidth * 0.2;
  handset.position.y = baseHeight + 0.03 * scale;
  handset.position.z = baseDepth * 0.1;
  handset.rotation.z = Math.PI / 2;
  handset.rotation.y = Math.PI / 8;
  handset.parent = phone;
  handset.material = phoneMat;
  
  // Handset ear piece
  const earPiece = BABYLON.MeshBuilder.CreateBox('earPiece', {
    width: 0.05 * scale,
    height: 0.03 * scale,
    depth: 0.06 * scale
  }, scene);
  earPiece.position.x = -baseWidth * 0.2 - 0.1 * scale;
  earPiece.position.y = baseHeight + 0.03 * scale;
  earPiece.position.z = baseDepth * 0.1;
  earPiece.parent = phone;
  earPiece.material = phoneMat;
  
  // Handset mouth piece
  const mouthPiece = BABYLON.MeshBuilder.CreateBox('mouthPiece', {
    width: 0.05 * scale,
    height: 0.03 * scale,
    depth: 0.06 * scale
  }, scene);
  mouthPiece.position.x = -baseWidth * 0.2 + 0.1 * scale;
  mouthPiece.position.y = baseHeight + 0.03 * scale;
  mouthPiece.position.z = baseDepth * 0.1;
  mouthPiece.parent = phone;
  mouthPiece.material = phoneMat;
  
  // Display screen
  const screen = BABYLON.MeshBuilder.CreateBox('phoneScreen', {
    width: baseWidth * 0.6,
    height: 0.01 * scale,
    depth: baseDepth * 0.25
  }, scene);
  screen.position.y = baseHeight + 0.005 * scale;
  screen.position.z = -baseDepth * 0.25;
  screen.rotation.x = Math.PI / 6;
  screen.parent = phone;
  
  const screenMat = new BABYLON.StandardMaterial('phoneScreen', scene);
  screenMat.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.2);
  screenMat.emissiveColor = new BABYLON.Color3(0, 0.15, 0.1); // Green display glow
  screen.material = screenMat;
  
  // Button grid (4x3)
  const buttonMat = new BABYLON.StandardMaterial('phoneButtons', scene);
  buttonMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const button = BABYLON.MeshBuilder.CreateCylinder(`button_${row}_${col}`, {
        diameter: 0.015 * scale,
        height: 0.005 * scale,
        tessellation: 8
      }, scene);
      button.position.x = -baseWidth * 0.2 + col * 0.025 * scale;
      button.position.y = baseHeight + 0.0025 * scale;
      button.position.z = baseDepth * 0.15 - row * 0.025 * scale;
      button.parent = phone;
      button.material = buttonMat;
    }
  }
  
  phone.position = position;
  return phone;
}

/**
 * Creates a procedural filing cabinet
 */
export function createFilingCabinet(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const cabinet = new BABYLON.Mesh('filingCabinet', scene);
  
  const width = 0.45 * scale;
  const depth = 0.6 * scale;
  const height = 1.3 * scale;
  const drawerHeight = height / 4;
  
  // Cabinet material (beige/gray metal)
  const cabinetMat = new BABYLON.StandardMaterial('cabinetMetal', scene);
  cabinetMat.diffuseColor = new BABYLON.Color3(0.75, 0.72, 0.68); // Beige-gray
  cabinetMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  cabinetMat.roughness = 0.7;
  
  const handleMat = new BABYLON.StandardMaterial('cabinetHandle', scene);
  handleMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Dark gray
  
  // Create 4 drawers
  for (let i = 0; i < 4; i++) {
    const drawer = BABYLON.MeshBuilder.CreateBox(`drawer${i}`, {
      width: width,
      height: drawerHeight - 0.02 * scale,
      depth: depth
    }, scene);
    drawer.position.y = (i * drawerHeight) + drawerHeight / 2;
    drawer.parent = cabinet;
    drawer.material = cabinetMat;
    
    // Drawer handle
    const handle = BABYLON.MeshBuilder.CreateBox(`handle${i}`, {
      width: width * 0.4,
      height: 0.03 * scale,
      depth: 0.02 * scale
    }, scene);
    handle.position.y = (i * drawerHeight) + drawerHeight / 2;
    handle.position.z = depth / 2 + 0.01 * scale;
    handle.parent = cabinet;
    handle.material = handleMat;
    
    // Handle grip (cylindrical)
    const grip = BABYLON.MeshBuilder.CreateCylinder(`grip${i}`, {
      diameter: 0.02 * scale,
      height: width * 0.35,
      tessellation: 8
    }, scene);
    grip.position.y = (i * drawerHeight) + drawerHeight / 2;
    grip.position.z = depth / 2 + 0.02 * scale;
    grip.rotation.x = Math.PI / 2;
    grip.parent = cabinet;
    grip.material = handleMat;
  }
  
  cabinet.position = position;
  return cabinet;
}

/**
 * Creates a procedural office plant (potted plant)
 */
export function createOfficePlant(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const plant = new BABYLON.Mesh('officePlant', scene);
  
  // Pot
  const potRadius = 0.15 * scale;
  const potHeight = 0.2 * scale;
  
  const pot = BABYLON.MeshBuilder.CreateCylinder('pot', {
    diameterTop: potRadius * 2.2,
    diameterBottom: potRadius * 2,
    height: potHeight,
    tessellation: 12
  }, scene);
  pot.position.y = potHeight / 2;
  pot.parent = plant;
  
  const potMat = new BABYLON.StandardMaterial('potMaterial', scene);
  potMat.diffuseColor = new BABYLON.Color3(0.65, 0.45, 0.35); // Terracotta
  pot.material = potMat;
  
  // Soil
  const soil = BABYLON.MeshBuilder.CreateCylinder('soil', {
    diameter: potRadius * 2,
    height: 0.02 * scale,
    tessellation: 12
  }, scene);
  soil.position.y = potHeight + 0.01 * scale;
  soil.parent = plant;
  
  const soilMat = new BABYLON.StandardMaterial('soilMaterial', scene);
  soilMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.15); // Dark brown
  soil.material = soilMat;
  
  // Plant material
  const leafMat = new BABYLON.StandardMaterial('leafMaterial', scene);
  leafMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.3); // Green
  
  // Create leaves (spheres)
  const numLeaves = 8;
  for (let i = 0; i < numLeaves; i++) {
    const angle = (i / numLeaves) * Math.PI * 2;
    const radius = 0.1 * scale + Math.random() * 0.05 * scale;
    const height = potHeight + 0.15 * scale + Math.random() * 0.2 * scale;
    
    const leaf = BABYLON.MeshBuilder.CreateSphere(`leaf${i}`, {
      diameter: 0.12 * scale + Math.random() * 0.05 * scale,
      segments: 8
    }, scene);
    leaf.position.x = Math.cos(angle) * radius;
    leaf.position.y = height;
    leaf.position.z = Math.sin(angle) * radius;
    leaf.parent = plant;
    leaf.material = leafMat;
  }
  
  plant.position = position;
  return plant;
}

/**
 * Creates a procedural office door
 */
export function createOfficeDoor(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const door = new BABYLON.Mesh('officeDoor', scene);
  
  const doorWidth = 0.9 * scale;
  const doorHeight = 2.1 * scale;
  const doorThickness = 0.05 * scale;
  
  // Door frame
  const frameMat = new BABYLON.StandardMaterial('doorFrame', scene);
  frameMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.92); // Light gray
  
  // Vertical frames
  const leftFrame = BABYLON.MeshBuilder.CreateBox('leftFrame', {
    width: 0.08 * scale,
    height: doorHeight + 0.1 * scale,
    depth: 0.1 * scale
  }, scene);
  leftFrame.position.x = -doorWidth / 2 - 0.04 * scale;
  leftFrame.position.y = (doorHeight + 0.1 * scale) / 2;
  leftFrame.parent = door;
  leftFrame.material = frameMat;
  
  const rightFrame = BABYLON.MeshBuilder.CreateBox('rightFrame', {
    width: 0.08 * scale,
    height: doorHeight + 0.1 * scale,
    depth: 0.1 * scale
  }, scene);
  rightFrame.position.x = doorWidth / 2 + 0.04 * scale;
  rightFrame.position.y = (doorHeight + 0.1 * scale) / 2;
  rightFrame.parent = door;
  rightFrame.material = frameMat;
  
  // Top frame
  const topFrame = BABYLON.MeshBuilder.CreateBox('topFrame', {
    width: doorWidth + 0.16 * scale,
    height: 0.1 * scale,
    depth: 0.1 * scale
  }, scene);
  topFrame.position.y = doorHeight + 0.05 * scale;
  topFrame.parent = door;
  topFrame.material = frameMat;
  
  // Door panel
  const doorPanel = BABYLON.MeshBuilder.CreateBox('doorPanel', {
    width: doorWidth,
    height: doorHeight,
    depth: doorThickness
  }, scene);
  doorPanel.position.y = doorHeight / 2;
  doorPanel.parent = door;
  
  const doorMat = new BABYLON.StandardMaterial('doorMaterial', scene);
  doorMat.diffuseColor = new BABYLON.Color3(0.55, 0.45, 0.35); // Wood color
  doorPanel.material = doorMat;
  
  // Door handle
  const handle = BABYLON.MeshBuilder.CreateCylinder('handle', {
    diameter: 0.03 * scale,
    height: 0.12 * scale,
    tessellation: 8
  }, scene);
  handle.position.x = doorWidth * 0.35;
  handle.position.y = doorHeight * 0.5;
  handle.position.z = doorThickness / 2 + 0.02 * scale;
  handle.rotation.z = Math.PI / 2;
  handle.parent = door;
  
  const handleMat = new BABYLON.StandardMaterial('handleMaterial', scene);
  handleMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.75); // Silver
  handleMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  handle.material = handleMat;
  
  door.position = position;
  return door;
}

/**
 * Creates a procedural office window (glass panel)
 */
export function createOfficeWindow(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const window = new BABYLON.Mesh('officeWindow', scene);
  
  const windowWidth = 1.2 * scale;
  const windowHeight = 1.5 * scale;
  const frameThickness = 0.05 * scale;
  
  // Window frame (white)
  const frameMat = new BABYLON.StandardMaterial('windowFrame', scene);
  frameMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
  
  // Outer frame
  const outerFrame = BABYLON.MeshBuilder.CreateBox('outerFrame', {
    width: windowWidth + frameThickness * 2,
    height: windowHeight + frameThickness * 2,
    depth: frameThickness
  }, scene);
  outerFrame.position.y = windowHeight / 2;
  outerFrame.parent = window;
  outerFrame.material = frameMat;
  
  // Glass pane (transparent with reflections)
  const glass = BABYLON.MeshBuilder.CreateBox('glass', {
    width: windowWidth,
    height: windowHeight,
    depth: 0.02 * scale
  }, scene);
  glass.position.y = windowHeight / 2;
  glass.position.z = 0.01 * scale;
  glass.parent = window;
  
  const glassMat = new BABYLON.StandardMaterial('glassMaterial', scene);
  glassMat.diffuseColor = new BABYLON.Color3(0.85, 0.95, 1.0); // Light blue tint
  glassMat.alpha = 0.25; // More transparent
  glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
  glassMat.specularPower = 128; // High specular for reflections
  glassMat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
  glassMat.reflectionFresnelParameters.bias = 0.1;
  glassMat.reflectionFresnelParameters.power = 2;
  glassMat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
  glassMat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black();
  glass.material = glassMat;
  
  // Vertical divider
  const vDivider = BABYLON.MeshBuilder.CreateBox('vDivider', {
    width: frameThickness * 0.6,
    height: windowHeight,
    depth: frameThickness
  }, scene);
  vDivider.position.y = windowHeight / 2;
  vDivider.parent = window;
  vDivider.material = frameMat;
  
  // Horizontal divider
  const hDivider = BABYLON.MeshBuilder.CreateBox('hDivider', {
    width: windowWidth,
    height: frameThickness * 0.6,
    depth: frameThickness
  }, scene);
  hDivider.position.y = windowHeight / 2;
  hDivider.parent = window;
  hDivider.material = frameMat;
  
  window.position = position;
  return window;
}

/**
 * Creates a procedural office painting (framed art)
 */
export function createOfficePainting(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const painting = new BABYLON.Mesh('officePainting', scene);
  
  const width = 0.8 * scale;
  const height = 0.6 * scale;
  const frameWidth = 0.05 * scale;
  const depth = 0.03 * scale;
  
  // Frame (dark wood)
  const frameMat = new BABYLON.StandardMaterial('paintingFrame', scene);
  frameMat.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.1); // Dark wood
  
  const frame = BABYLON.MeshBuilder.CreateBox('frame', {
    width: width + frameWidth * 2,
    height: height + frameWidth * 2,
    depth: depth
  }, scene);
  frame.position.y = height / 2;
  frame.parent = painting;
  frame.material = frameMat;
  
  // Canvas (abstract colors)
  const canvas = BABYLON.MeshBuilder.CreateBox('canvas', {
    width: width,
    height: height,
    depth: 0.01 * scale
  }, scene);
  canvas.position.y = height / 2;
  canvas.position.z = depth / 2 + 0.005 * scale;
  canvas.parent = painting;
  
  const canvasMat = new BABYLON.StandardMaterial('canvasMaterial', scene);
  // Random abstract color for each painting
  const colorChoice = Math.random();
  if (colorChoice < 0.33) {
    canvasMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.7); // Blue abstract
  } else if (colorChoice < 0.66) {
    canvasMat.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3); // Orange abstract
  } else {
    canvasMat.diffuseColor = new BABYLON.Color3(0.5, 0.7, 0.4); // Green abstract
  }
  canvas.material = canvasMat;
  
  painting.position = position;
  return painting;
}

/**
 * Creates a procedural office poster
 */
export function createOfficePoster(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const poster = new BABYLON.Mesh('officePoster', scene);
  
  const width = 0.6 * scale;
  const height = 0.85 * scale;
  
  // Poster backing
  const backing = BABYLON.MeshBuilder.CreateBox('posterBacking', {
    width: width,
    height: height,
    depth: 0.01 * scale
  }, scene);
  backing.position.y = height / 2;
  backing.parent = poster;
  
  const backingMat = new BABYLON.StandardMaterial('posterBacking', scene);
  backingMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White
  backing.material = backingMat;
  
  // Colored section (safety poster style)
  const colorSection = BABYLON.MeshBuilder.CreateBox('colorSection', {
    width: width * 0.9,
    height: height * 0.4,
    depth: 0.012 * scale
  }, scene);
  colorSection.position.y = height * 0.7;
  colorSection.position.z = 0.006 * scale;
  colorSection.parent = poster;
  
  const colorMat = new BABYLON.StandardMaterial('posterColor', scene);
  // Random safety poster colors
  const posterType = Math.random();
  if (posterType < 0.33) {
    colorMat.diffuseColor = new BABYLON.Color3(1, 0.3, 0.2); // Red (danger)
  } else if (posterType < 0.66) {
    colorMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0); // Yellow (warning)
  } else {
    colorMat.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3); // Green (safety)
  }
  colorSection.material = colorMat;
  
  // Text area (dark)
  const textArea = BABYLON.MeshBuilder.CreateBox('textArea', {
    width: width * 0.85,
    height: height * 0.35,
    depth: 0.012 * scale
  }, scene);
  textArea.position.y = height * 0.3;
  textArea.position.z = 0.006 * scale;
  textArea.parent = poster;
  
  const textMat = new BABYLON.StandardMaterial('posterText', scene);
  textMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark gray
  textArea.material = textMat;
  
  poster.position = position;
  return poster;
}

/**
 * Creates a procedural desk lamp
 */
export function createDeskLamp(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const lamp = new BABYLON.Mesh('deskLamp', scene);
  
  // Base
  const base = BABYLON.MeshBuilder.CreateCylinder('lampBase', {
    diameter: 0.12 * scale,
    height: 0.02 * scale,
    tessellation: 16
  }, scene);
  base.position.y = 0.01 * scale;
  base.parent = lamp;
  
  const baseMat = new BABYLON.StandardMaterial('lampBase', scene);
  baseMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
  base.material = baseMat;
  
  // Stand
  const stand = BABYLON.MeshBuilder.CreateCylinder('lampStand', {
    diameter: 0.02 * scale,
    height: 0.35 * scale,
    tessellation: 8
  }, scene);
  stand.position.y = 0.175 * scale + 0.02 * scale;
  stand.parent = lamp;
  stand.material = baseMat;
  
  // Arm (horizontal)
  const arm = BABYLON.MeshBuilder.CreateCylinder('lampArm', {
    diameter: 0.018 * scale,
    height: 0.25 * scale,
    tessellation: 8
  }, scene);
  arm.position.x = 0.125 * scale;
  arm.position.y = 0.35 * scale + 0.02 * scale;
  arm.rotation.z = Math.PI / 2;
  arm.parent = lamp;
  arm.material = baseMat;
  
  // Lamp head (cone shade)
  const shade = BABYLON.MeshBuilder.CreateCylinder('lampShade', {
    diameterTop: 0.15 * scale,
    diameterBottom: 0.08 * scale,
    height: 0.12 * scale,
    tessellation: 16
  }, scene);
  shade.position.x = 0.25 * scale;
  shade.position.y = 0.35 * scale + 0.02 * scale;
  shade.rotation.x = Math.PI / 6;
  shade.parent = lamp;
  
  const shadeMat = new BABYLON.StandardMaterial('lampShade', scene);
  shadeMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.85); // Warm white
  shadeMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.2); // Soft glow
  shade.material = shadeMat;
  
  // Light bulb (point light)
  const bulb = new BABYLON.PointLight('lampBulb', new BABYLON.Vector3(0.25 * scale, 0.35 * scale + 0.02 * scale, 0), scene);
  bulb.intensity = 0.3;
  bulb.range = 3 * scale;
  bulb.diffuse = new BABYLON.Color3(1, 0.95, 0.8); // Warm light
  bulb.parent = lamp;
  
  lamp.position = position;
  return lamp;
}

/**
 * Creates a procedural ceiling lamp
 */
export function createCeilingLamp(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const lamp = new BABYLON.Mesh('ceilingLamp', scene);
  
  // Ceiling mount
  const mount = BABYLON.MeshBuilder.CreateCylinder('ceilingMount', {
    diameter: 0.15 * scale,
    height: 0.05 * scale,
    tessellation: 16
  }, scene);
  mount.parent = lamp;
  
  const mountMat = new BABYLON.StandardMaterial('mountMaterial', scene);
  mountMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.92); // Light gray
  mount.material = mountMat;
  
  // Lamp shade (cylindrical)
  const shade = BABYLON.MeshBuilder.CreateCylinder('lampShade', {
    diameter: 0.4 * scale,
    height: 0.25 * scale,
    tessellation: 16
  }, scene);
  shade.position.y = -0.15 * scale;
  shade.parent = lamp;
  
  const shadeMat = new BABYLON.StandardMaterial('shadeMaterial', scene);
  shadeMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White
  shadeMat.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.35); // Warm glow
  shade.material = shadeMat;
  
  // Light (point light)
  const light = new BABYLON.PointLight('ceilingLight', new BABYLON.Vector3(0, -0.15 * scale, 0), scene);
  light.intensity = 0.8;
  light.range = 8 * scale;
  light.diffuse = new BABYLON.Color3(1, 0.98, 0.9); // Warm white
  light.parent = lamp;
  
  lamp.position = position;
  return lamp;
}

/**
 * Creates a procedural office sofa
 */
export function createOfficeSofa(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1,
  colorVariant: number = 0
): BABYLON.Mesh {
  const sofa = new BABYLON.Mesh('officeSofa', scene);
  
  const width = 1.8 * scale;
  const depth = 0.8 * scale;
  const seatHeight = 0.45 * scale;
  const backHeight = 0.75 * scale;
  
  // Sofa material with color variations
  const sofaMat = new BABYLON.StandardMaterial('sofaMaterial', scene);
  
  // Color variants: 0 = gray-blue, 1 = warm brown, 2 = dark green
  if (colorVariant === 1) {
    sofaMat.diffuseColor = new BABYLON.Color3(0.6, 0.45, 0.35); // Warm brown
  } else if (colorVariant === 2) {
    sofaMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.4); // Dark green
  } else {
    sofaMat.diffuseColor = new BABYLON.Color3(0.45, 0.5, 0.6); // Gray-blue (default)
  }
  sofaMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  
  // Seat
  const seat = BABYLON.MeshBuilder.CreateBox('sofaSeat', {
    width: width,
    height: seatHeight,
    depth: depth
  }, scene);
  seat.position.y = seatHeight / 2;
  seat.parent = sofa;
  seat.material = sofaMat;
  
  // Backrest
  const back = BABYLON.MeshBuilder.CreateBox('sofaBack', {
    width: width,
    height: backHeight,
    depth: 0.15 * scale
  }, scene);
  back.position.y = seatHeight + backHeight / 2;
  back.position.z = -depth / 2 + 0.075 * scale;
  back.parent = sofa;
  back.material = sofaMat;
  
  // Left armrest
  const leftArm = BABYLON.MeshBuilder.CreateBox('leftArm', {
    width: 0.15 * scale,
    height: backHeight * 0.7,
    depth: depth
  }, scene);
  leftArm.position.x = -width / 2 + 0.075 * scale;
  leftArm.position.y = seatHeight + (backHeight * 0.7) / 2;
  leftArm.parent = sofa;
  leftArm.material = sofaMat;
  
  // Right armrest
  const rightArm = BABYLON.MeshBuilder.CreateBox('rightArm', {
    width: 0.15 * scale,
    height: backHeight * 0.7,
    depth: depth
  }, scene);
  rightArm.position.x = width / 2 - 0.075 * scale;
  rightArm.position.y = seatHeight + (backHeight * 0.7) / 2;
  rightArm.parent = sofa;
  rightArm.material = sofaMat;
  
  // Cushions
  const cushionMat = new BABYLON.StandardMaterial('cushionMaterial', scene);
  
  // Lighter version of sofa color for cushions
  if (colorVariant === 1) {
    cushionMat.diffuseColor = new BABYLON.Color3(0.65, 0.5, 0.4); // Lighter brown
  } else if (colorVariant === 2) {
    cushionMat.diffuseColor = new BABYLON.Color3(0.35, 0.55, 0.45); // Lighter green
  } else {
    cushionMat.diffuseColor = new BABYLON.Color3(0.5, 0.55, 0.65); // Lighter gray-blue
  }
  
  for (let i = 0; i < 3; i++) {
    const cushion = BABYLON.MeshBuilder.CreateBox(`cushion${i}`, {
      width: width / 3.5,
      height: 0.12 * scale,
      depth: depth * 0.7
    }, scene);
    cushion.position.x = -width / 3 + (i * width / 3);
    cushion.position.y = seatHeight + 0.06 * scale;
    cushion.position.z = 0.05 * scale;
    cushion.parent = sofa;
    cushion.material = cushionMat;
  }
  
  sofa.position = position;
  return sofa;
}

/**
 * Creates a procedural coffee table
 */
export function createCoffeeTable(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const table = new BABYLON.Mesh('coffeeTable', scene);
  
  const tableWidth = 1.0 * scale;
  const tableDepth = 0.6 * scale;
  const tableHeight = 0.4 * scale;
  const topThickness = 0.04 * scale;
  const legSize = 0.05 * scale;
  
  // Table top material (light wood)
  const woodMat = new BABYLON.StandardMaterial('tableWood', scene);
  woodMat.diffuseColor = new BABYLON.Color3(0.75, 0.65, 0.5); // Light wood
  woodMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  
  // Table top
  const top = BABYLON.MeshBuilder.CreateBox('tableTop', {
    width: tableWidth,
    height: topThickness,
    depth: tableDepth
  }, scene);
  top.position.y = tableHeight - topThickness / 2;
  top.parent = table;
  top.material = woodMat;
  
  // Legs (4 corners)
  const legPositions = [
    [-tableWidth / 2 + legSize, tableDepth / 2 - legSize],
    [tableWidth / 2 - legSize, tableDepth / 2 - legSize],
    [-tableWidth / 2 + legSize, -tableDepth / 2 + legSize],
    [tableWidth / 2 - legSize, -tableDepth / 2 + legSize],
  ];
  
  legPositions.forEach((pos, index) => {
    const leg = BABYLON.MeshBuilder.CreateBox(`leg${index}`, {
      width: legSize,
      height: tableHeight - topThickness,
      depth: legSize
    }, scene);
    leg.position.x = pos[0];
    leg.position.y = (tableHeight - topThickness) / 2;
    leg.position.z = pos[1];
    leg.parent = table;
    leg.material = woodMat;
  });
  
  // Shelf under table
  const shelf = BABYLON.MeshBuilder.CreateBox('shelf', {
    width: tableWidth * 0.9,
    height: 0.02 * scale,
    depth: tableDepth * 0.9
  }, scene);
  shelf.position.y = tableHeight * 0.3;
  shelf.parent = table;
  shelf.material = woodMat;
  
  table.position = position;
  return table;
}

/**
 * Creates a procedural wall clock
 */
export function createWallClock(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const clock = new BABYLON.Mesh('wallClock', scene);
  
  const radius = 0.2 * scale;
  const depth = 0.05 * scale;
  
  // Clock frame
  const frame = BABYLON.MeshBuilder.CreateCylinder('clockFrame', {
    diameter: radius * 2,
    height: depth,
    tessellation: 32
  }, scene);
  frame.rotation.x = Math.PI / 2;
  frame.parent = clock;
  
  const frameMat = new BABYLON.StandardMaterial('clockFrame', scene);
  frameMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15); // Dark frame
  frame.material = frameMat;
  
  // Clock face
  const face = BABYLON.MeshBuilder.CreateCylinder('clockFace', {
    diameter: radius * 1.9,
    height: 0.01 * scale,
    tessellation: 32
  }, scene);
  face.position.z = depth / 2 + 0.005 * scale;
  face.rotation.x = Math.PI / 2;
  face.parent = clock;
  
  const faceMat = new BABYLON.StandardMaterial('clockFace', scene);
  faceMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White
  face.material = faceMat;
  
  // Hour hand
  const hourHand = BABYLON.MeshBuilder.CreateBox('hourHand', {
    width: 0.02 * scale,
    height: radius * 0.6,
    depth: 0.01 * scale
  }, scene);
  hourHand.position.z = depth / 2 + 0.01 * scale;
  hourHand.position.y = radius * 0.3;
  hourHand.rotation.x = Math.PI / 2;
  hourHand.rotation.z = Math.PI / 4; // 3 o'clock position
  hourHand.parent = clock;
  
  const handMat = new BABYLON.StandardMaterial('clockHand', scene);
  handMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Black
  hourHand.material = handMat;
  
  // Minute hand
  const minuteHand = BABYLON.MeshBuilder.CreateBox('minuteHand', {
    width: 0.015 * scale,
    height: radius * 0.85,
    depth: 0.01 * scale
  }, scene);
  minuteHand.position.z = depth / 2 + 0.012 * scale;
  minuteHand.position.y = radius * 0.425;
  minuteHand.rotation.x = Math.PI / 2;
  minuteHand.rotation.z = -Math.PI / 6; // 10 o'clock position
  minuteHand.parent = clock;
  minuteHand.material = handMat;
  
  // Center dot
  const center = BABYLON.MeshBuilder.CreateSphere('clockCenter', {
    diameter: 0.03 * scale,
    segments: 8
  }, scene);
  center.position.z = depth / 2 + 0.013 * scale;
  center.parent = clock;
  center.material = handMat;
  
  clock.position = position;
  return clock;
}

/**
 * Creates a procedural wall calendar
 */
export function createWallCalendar(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const calendar = new BABYLON.Mesh('wallCalendar', scene);
  
  const width = 0.4 * scale;
  const height = 0.5 * scale;
  
  // Calendar backing (white)
  const backing = BABYLON.MeshBuilder.CreateBox('calendarBacking', {
    width: width,
    height: height,
    depth: 0.01 * scale
  }, scene);
  backing.position.y = height / 2;
  backing.parent = calendar;
  
  const backingMat = new BABYLON.StandardMaterial('calendarBacking', scene);
  backingMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White
  backing.material = backingMat;
  
  // Header (month name - red)
  const header = BABYLON.MeshBuilder.CreateBox('calendarHeader', {
    width: width * 0.95,
    height: height * 0.15,
    depth: 0.012 * scale
  }, scene);
  header.position.y = height * 0.925;
  header.position.z = 0.006 * scale;
  header.parent = calendar;
  
  const headerMat = new BABYLON.StandardMaterial('calendarHeader', scene);
  headerMat.diffuseColor = new BABYLON.Color3(0.85, 0.2, 0.2); // Red
  header.material = headerMat;
  
  // Calendar grid (days)
  const gridMat = new BABYLON.StandardMaterial('calendarGrid', scene);
  gridMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3); // Dark gray
  
  const cellWidth = width * 0.12;
  const cellHeight = height * 0.1;
  
  // Create 5 rows x 7 columns grid
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = BABYLON.MeshBuilder.CreateBox(`cell_${row}_${col}`, {
        width: cellWidth,
        height: cellHeight,
        depth: 0.012 * scale
      }, scene);
      cell.position.x = -width * 0.4 + col * cellWidth;
      cell.position.y = height * 0.65 - row * cellHeight;
      cell.position.z = 0.006 * scale;
      cell.parent = calendar;
      
      // Random day highlighting
      if (Math.random() > 0.8) {
        const highlightMat = new BABYLON.StandardMaterial(`highlight_${row}_${col}`, scene);
        highlightMat.diffuseColor = new BABYLON.Color3(1, 0.9, 0.6); // Yellow highlight
        cell.material = highlightMat;
      } else {
        cell.material = backingMat;
      }
    }
  }
  
  // Binding rings (top)
  const ringMat = new BABYLON.StandardMaterial('calendarRing', scene);
  ringMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  
  for (let i = 0; i < 2; i++) {
    const ring = BABYLON.MeshBuilder.CreateTorus(`ring${i}`, {
      diameter: 0.03 * scale,
      thickness: 0.008 * scale,
      tessellation: 16
    }, scene);
    ring.position.x = (i === 0 ? -width * 0.3 : width * 0.3);
    ring.position.y = height + 0.015 * scale;
    ring.rotation.x = Math.PI / 2;
    ring.parent = calendar;
    ring.material = ringMat;
  }
  
  calendar.position = position;
  return calendar;
}

/**
 * Creates a procedural vending machine (snacks/drinks)
 */
export function createVendingMachine(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const machine = new BABYLON.Mesh('vendingMachine', scene);
  
  const width = 0.9 * scale;
  const depth = 0.8 * scale;
  const height = 1.8 * scale;
  
  // Machine body (metallic)
  const body = BABYLON.MeshBuilder.CreateBox('machineBody', {
    width: width,
    height: height,
    depth: depth
  }, scene);
  body.position.y = height / 2;
  body.parent = machine;
  
  const bodyMat = new BABYLON.StandardMaterial('machineBody', scene);
  bodyMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.28); // Dark metallic
  bodyMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  body.material = bodyMat;
  
  // Glass display window
  const displayWindow = BABYLON.MeshBuilder.CreateBox('displayWindow', {
    width: width * 0.85,
    height: height * 0.6,
    depth: 0.02 * scale
  }, scene);
  displayWindow.position.y = height * 0.6;
  displayWindow.position.z = depth / 2 + 0.01 * scale;
  displayWindow.parent = machine;
  
  const glassMat = new BABYLON.StandardMaterial('vendingGlass', scene);
  glassMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.4);
  glassMat.alpha = 0.4;
  glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
  glassMat.specularPower = 64;
  displayWindow.material = glassMat;
  
  // Illuminated display sections (product slots)
  const slotMat = new BABYLON.StandardMaterial('vendingSlot', scene);
  slotMat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2); // Red product
  slotMat.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0.05);
  
  const slotMat2 = new BABYLON.StandardMaterial('vendingSlot2', scene);
  slotMat2.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.8); // Blue product
  slotMat2.emissiveColor = new BABYLON.Color3(0.05, 0.15, 0.2);
  
  // Create product slots (3x4 grid)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const slot = BABYLON.MeshBuilder.CreateBox(`slot_${row}_${col}`, {
        width: width * 0.18,
        height: height * 0.15,
        depth: 0.01 * scale
      }, scene);
      slot.position.x = -width * 0.3 + col * width * 0.2;
      slot.position.y = height * 0.8 - row * height * 0.2;
      slot.position.z = depth / 2 + 0.015 * scale;
      slot.parent = machine;
      slot.material = (row + col) % 2 === 0 ? slotMat : slotMat2;
    }
  }
  
  // Payment/selection panel
  const panel = BABYLON.MeshBuilder.CreateBox('paymentPanel', {
    width: width * 0.4,
    height: height * 0.15,
    depth: 0.05 * scale
  }, scene);
  panel.position.y = height * 0.25;
  panel.position.z = depth / 2 + 0.025 * scale;
  panel.parent = machine;
  
  const panelMat = new BABYLON.StandardMaterial('paymentPanel', scene);
  panelMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.18);
  panelMat.emissiveColor = new BABYLON.Color3(0, 0.1, 0.15); // Blue glow
  panel.material = panelMat;
  
  // Dispenser tray
  const tray = BABYLON.MeshBuilder.CreateBox('dispenserTray', {
    width: width * 0.5,
    height: 0.15 * scale,
    depth: depth * 0.3
  }, scene);
  tray.position.y = 0.075 * scale;
  tray.position.z = depth / 2 - depth * 0.15;
  tray.parent = machine;
  
  const trayMat = new BABYLON.StandardMaterial('dispenserTray', scene);
  trayMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  tray.material = trayMat;
  
  // Branding strip (top)
  const brandStrip = BABYLON.MeshBuilder.CreateBox('brandStrip', {
    width: width,
    height: height * 0.08,
    depth: 0.02 * scale
  }, scene);
  brandStrip.position.y = height * 0.96;
  brandStrip.position.z = depth / 2 + 0.01 * scale;
  brandStrip.parent = machine;
  
  const brandMat = new BABYLON.StandardMaterial('brandStrip', scene);
  brandMat.diffuseColor = new BABYLON.Color3(0.9, 0.2, 0.2); // Red branding
  brandMat.emissiveColor = new BABYLON.Color3(0.3, 0.05, 0.05);
  brandStrip.material = brandMat;
  
  machine.position = position;
  return machine;
}

/**
 * Creates a procedural water cooler
 */
export function createWaterCooler(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const cooler = new BABYLON.Mesh('waterCooler', scene);
  
  const width = 0.35 * scale;
  const depth = 0.35 * scale;
  const bodyHeight = 1.0 * scale;
  
  // Cooler body (white/beige)
  const body = BABYLON.MeshBuilder.CreateBox('coolerBody', {
    width: width,
    height: bodyHeight,
    depth: depth
  }, scene);
  body.position.y = bodyHeight / 2;
  body.parent = cooler;
  
  const bodyMat = new BABYLON.StandardMaterial('coolerBody', scene);
  bodyMat.diffuseColor = new BABYLON.Color3(0.92, 0.92, 0.88); // Off-white
  bodyMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  body.material = bodyMat;
  
  // Water bottle (top - transparent blue)
  const bottle = BABYLON.MeshBuilder.CreateCylinder('waterBottle', {
    diameter: width * 0.9,
    height: 0.5 * scale,
    tessellation: 16
  }, scene);
  bottle.position.y = bodyHeight + 0.25 * scale;
  bottle.parent = cooler;
  
  const bottleMat = new BABYLON.StandardMaterial('waterBottle', scene);
  bottleMat.diffuseColor = new BABYLON.Color3(0.4, 0.7, 1.0); // Light blue
  bottleMat.alpha = 0.4;
  bottleMat.specularColor = new BABYLON.Color3(1, 1, 1);
  bottleMat.specularPower = 64;
  bottle.material = bottleMat;
  
  // Bottle cap (blue)
  const cap = BABYLON.MeshBuilder.CreateCylinder('bottleCap', {
    diameter: width * 0.5,
    height: 0.08 * scale,
    tessellation: 16
  }, scene);
  cap.position.y = bodyHeight + 0.54 * scale;
  cap.parent = cooler;
  
  const capMat = new BABYLON.StandardMaterial('bottleCap', scene);
  capMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8); // Blue
  cap.material = capMat;
  
  // Dispensing panel (front)
  const panel = BABYLON.MeshBuilder.CreateBox('dispensingPanel', {
    width: width * 0.6,
    height: bodyHeight * 0.4,
    depth: 0.02 * scale
  }, scene);
  panel.position.y = bodyHeight * 0.6;
  panel.position.z = depth / 2 + 0.01 * scale;
  panel.parent = cooler;
  
  const panelMat = new BABYLON.StandardMaterial('dispensingPanel', scene);
  panelMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7); // Light gray
  panel.material = panelMat;
  
  // Hot/cold buttons (blue and red)
  const coldButton = BABYLON.MeshBuilder.CreateCylinder('coldButton', {
    diameter: 0.08 * scale,
    height: 0.03 * scale,
    tessellation: 12
  }, scene);
  coldButton.position.x = -width * 0.15;
  coldButton.position.y = bodyHeight * 0.7;
  coldButton.position.z = depth / 2 + 0.03 * scale;
  coldButton.parent = cooler;
  
  const coldMat = new BABYLON.StandardMaterial('coldButton', scene);
  coldMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 1.0); // Blue
  coldMat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
  coldButton.material = coldMat;
  
  const hotButton = BABYLON.MeshBuilder.CreateCylinder('hotButton', {
    diameter: 0.08 * scale,
    height: 0.03 * scale,
    tessellation: 12
  }, scene);
  hotButton.position.x = width * 0.15;
  hotButton.position.y = bodyHeight * 0.7;
  hotButton.position.z = depth / 2 + 0.03 * scale;
  hotButton.parent = cooler;
  
  const hotMat = new BABYLON.StandardMaterial('hotButton', scene);
  hotMat.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.2); // Red
  hotMat.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0.05);
  hotButton.material = hotMat;
  
  // Drip tray
  const dripTray = BABYLON.MeshBuilder.CreateBox('dripTray', {
    width: width * 0.7,
    height: 0.03 * scale,
    depth: depth * 0.4
  }, scene);
  dripTray.position.y = bodyHeight * 0.35;
  dripTray.position.z = depth / 2 - depth * 0.2;
  dripTray.parent = cooler;
  
  const trayMat = new BABYLON.StandardMaterial('dripTray', scene);
  trayMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
  dripTray.material = trayMat;
  
  // Cup storage compartment (bottom door)
  const cupDoor = BABYLON.MeshBuilder.CreateBox('cupDoor', {
    width: width * 0.8,
    height: bodyHeight * 0.25,
    depth: 0.02 * scale
  }, scene);
  cupDoor.position.y = bodyHeight * 0.15;
  cupDoor.position.z = depth / 2 + 0.01 * scale;
  cupDoor.parent = cooler;
  cupDoor.material = bodyMat;
  
  cooler.position = position;
  return cooler;
}

/**
 * Creates a procedural emergency exit sign (illuminated)
 */
export function createEmergencyExitSign(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const sign = new BABYLON.Mesh('emergencyExitSign', scene);
  
  const width = 0.45 * scale;
  const height = 0.25 * scale;
  const depth = 0.05 * scale;
  
  // Sign backing (green)
  const backing = BABYLON.MeshBuilder.CreateBox('signBacking', {
    width: width,
    height: height,
    depth: depth
  }, scene);
  backing.parent = sign;
  
  const backingMat = new BABYLON.StandardMaterial('exitSignBacking', scene);
  backingMat.diffuseColor = new BABYLON.Color3(0.1, 0.7, 0.2); // Bright green
  backingMat.emissiveColor = new BABYLON.Color3(0.05, 0.4, 0.1); // Glowing green
  backing.material = backingMat;
  
  // "USCITA" text panel (white)
  const textPanel = BABYLON.MeshBuilder.CreateBox('textPanel', {
    width: width * 0.85,
    height: height * 0.6,
    depth: 0.01 * scale
  }, scene);
  textPanel.position.z = depth / 2 + 0.005 * scale;
  textPanel.parent = sign;
  
  const textMat = new BABYLON.StandardMaterial('exitSignText', scene);
  textMat.diffuseColor = new BABYLON.Color3(1, 1, 1); // White
  textMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3); // Glowing
  textPanel.material = textMat;
  
  // Running person icon (simplified stick figure)
  const personBody = BABYLON.MeshBuilder.CreateBox('personBody', {
    width: 0.02 * scale,
    height: 0.08 * scale,
    depth: 0.01 * scale
  }, scene);
  personBody.position.x = -width * 0.25;
  personBody.position.z = depth / 2 + 0.01 * scale;
  personBody.parent = sign;
  personBody.material = textMat;
  
  const personHead = BABYLON.MeshBuilder.CreateSphere('personHead', {
    diameter: 0.04 * scale,
    segments: 8
  }, scene);
  personHead.position.x = -width * 0.25;
  personHead.position.y = height * 0.25;
  personHead.position.z = depth / 2 + 0.01 * scale;
  personHead.parent = sign;
  personHead.material = textMat;
  
  // Arrow pointing to exit
  const arrow = BABYLON.MeshBuilder.CreateBox('arrow', {
    width: 0.15 * scale,
    height: 0.03 * scale,
    depth: 0.01 * scale
  }, scene);
  arrow.position.x = width * 0.2;
  arrow.position.z = depth / 2 + 0.01 * scale;
  arrow.parent = sign;
  arrow.material = textMat;
  
  const arrowHead = BABYLON.MeshBuilder.CreateBox('arrowHead', {
    width: 0.04 * scale,
    height: 0.06 * scale,
    depth: 0.01 * scale
  }, scene);
  arrowHead.position.x = width * 0.35;
  arrowHead.position.z = depth / 2 + 0.01 * scale;
  arrowHead.rotation.z = Math.PI / 4;
  arrowHead.parent = sign;
  arrowHead.material = textMat;
  
  // Point light (green glow)
  const light = new BABYLON.PointLight('exitSignLight', new BABYLON.Vector3(0, 0, depth / 2), scene);
  light.intensity = 0.5;
  light.range = 2 * scale;
  light.diffuse = new BABYLON.Color3(0.2, 1, 0.3); // Green
  light.parent = sign;
  
  sign.position = position;
  return sign;
}

/**
 * Creates a procedural fire extinguisher
 */
export function createFireExtinguisher(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const extinguisher = new BABYLON.Mesh('fireExtinguisher', scene);
  
  const radius = 0.12 * scale;
  const bodyHeight = 0.55 * scale;
  
  // Main cylinder body (red)
  const body = BABYLON.MeshBuilder.CreateCylinder('extinguisherBody', {
    diameter: radius * 2,
    height: bodyHeight,
    tessellation: 16
  }, scene);
  body.position.y = bodyHeight / 2;
  body.parent = extinguisher;
  
  const bodyMat = new BABYLON.StandardMaterial('extinguisherBody', scene);
  bodyMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1); // Bright red
  bodyMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  body.material = bodyMat;
  
  // Top cap (black)
  const cap = BABYLON.MeshBuilder.CreateCylinder('extinguisherCap', {
    diameter: radius * 1.2,
    height: 0.08 * scale,
    tessellation: 16
  }, scene);
  cap.position.y = bodyHeight + 0.04 * scale;
  cap.parent = extinguisher;
  
  const capMat = new BABYLON.StandardMaterial('extinguisherCap', scene);
  capMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Black
  cap.material = capMat;
  
  // Nozzle assembly
  const nozzleBase = BABYLON.MeshBuilder.CreateCylinder('nozzleBase', {
    diameter: 0.03 * scale,
    height: 0.15 * scale,
    tessellation: 8
  }, scene);
  nozzleBase.position.y = bodyHeight + 0.08 * scale + 0.075 * scale;
  nozzleBase.parent = extinguisher;
  nozzleBase.material = capMat;
  
  // Hose (flexible tube)
  const hose = BABYLON.MeshBuilder.CreateCylinder('hose', {
    diameter: 0.02 * scale,
    height: 0.3 * scale,
    tessellation: 8
  }, scene);
  hose.position.x = radius * 0.7;
  hose.position.y = bodyHeight * 0.7;
  hose.rotation.z = Math.PI / 4;
  hose.parent = extinguisher;
  hose.material = capMat;
  
  // Nozzle handle
  const handle = BABYLON.MeshBuilder.CreateBox('handle', {
    width: 0.15 * scale,
    height: 0.02 * scale,
    depth: 0.04 * scale
  }, scene);
  handle.position.y = bodyHeight + 0.12 * scale;
  handle.parent = extinguisher;
  
  const handleMat = new BABYLON.StandardMaterial('handleMaterial', scene);
  handleMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark gray
  handle.material = handleMat;
  
  // Safety pin (yellow)
  const pin = BABYLON.MeshBuilder.CreateCylinder('safetyPin', {
    diameter: 0.015 * scale,
    height: 0.08 * scale,
    tessellation: 8
  }, scene);
  pin.position.y = bodyHeight + 0.1 * scale;
  pin.rotation.z = Math.PI / 2;
  pin.parent = extinguisher;
  
  const pinMat = new BABYLON.StandardMaterial('pinMaterial', scene);
  pinMat.diffuseColor = new BABYLON.Color3(1, 0.9, 0.1); // Yellow
  pin.material = pinMat;
  
  // Instruction label (white)
  const label = BABYLON.MeshBuilder.CreateBox('instructionLabel', {
    width: radius * 1.8,
    height: bodyHeight * 0.4,
    depth: 0.01 * scale
  }, scene);
  label.position.y = bodyHeight * 0.5;
  label.position.z = radius + 0.005 * scale;
  label.parent = extinguisher;
  
  const labelMat = new BABYLON.StandardMaterial('labelMaterial', scene);
  labelMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White
  label.material = labelMat;
  
  extinguisher.position = position;
  return extinguisher;
}

/**
 * Creates a procedural reception desk
 */
export function createReceptionDesk(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const desk = new BABYLON.Mesh('receptionDesk', scene);
  
  const width = 2.5 * scale;
  const depth = 1.2 * scale;
  const height = 1.1 * scale;
  const topThickness = 0.05 * scale;
  
  // Desk material (modern white/gray)
  const deskMat = new BABYLON.StandardMaterial('receptionDeskMat', scene);
  deskMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.97); // White
  deskMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  
  const accentMat = new BABYLON.StandardMaterial('receptionAccent', scene);
  accentMat.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.5); // Blue-gray accent
  
  // Desktop
  const top = BABYLON.MeshBuilder.CreateBox('deskTop', {
    width: width,
    height: topThickness,
    depth: depth
  }, scene);
  top.position.y = height - topThickness / 2;
  top.parent = desk;
  top.material = deskMat;
  
  // Front panel (solid)
  const frontPanel = BABYLON.MeshBuilder.CreateBox('frontPanel', {
    width: width,
    height: height - topThickness,
    depth: 0.05 * scale
  }, scene);
  frontPanel.position.y = (height - topThickness) / 2;
  frontPanel.position.z = depth / 2 - 0.025 * scale;
  frontPanel.parent = desk;
  frontPanel.material = accentMat;
  
  // Side panels
  const leftPanel = BABYLON.MeshBuilder.CreateBox('leftPanel', {
    width: 0.05 * scale,
    height: height - topThickness,
    depth: depth
  }, scene);
  leftPanel.position.x = -width / 2 + 0.025 * scale;
  leftPanel.position.y = (height - topThickness) / 2;
  leftPanel.parent = desk;
  leftPanel.material = deskMat;
  
  const rightPanel = BABYLON.MeshBuilder.CreateBox('rightPanel', {
    width: 0.05 * scale,
    height: height - topThickness,
    depth: depth
  }, scene);
  rightPanel.position.x = width / 2 - 0.025 * scale;
  rightPanel.position.y = (height - topThickness) / 2;
  rightPanel.parent = desk;
  rightPanel.material = deskMat;
  
  // Back panel
  const backPanel = BABYLON.MeshBuilder.CreateBox('backPanel', {
    width: width,
    height: height - topThickness,
    depth: 0.05 * scale
  }, scene);
  backPanel.position.y = (height - topThickness) / 2;
  backPanel.position.z = -depth / 2 + 0.025 * scale;
  backPanel.parent = desk;
  backPanel.material = deskMat;
  
  // Company logo panel (elevated on front)
  const logoPanel = BABYLON.MeshBuilder.CreateBox('logoPanel', {
    width: width * 0.4,
    height: 0.25 * scale,
    depth: 0.02 * scale
  }, scene);
  logoPanel.position.y = height * 0.8;
  logoPanel.position.z = depth / 2 + 0.01 * scale;
  logoPanel.parent = desk;
  
  const logoMat = new BABYLON.StandardMaterial('logoMat', scene);
  logoMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.5); // Dark blue
  logoMat.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.15); // Subtle glow
  logoPanel.material = logoMat;
  
  // LED accent strip (bottom)
  const ledStrip = BABYLON.MeshBuilder.CreateBox('ledStrip', {
    width: width * 0.95,
    height: 0.02 * scale,
    depth: 0.02 * scale
  }, scene);
  ledStrip.position.y = 0.01 * scale;
  ledStrip.position.z = depth / 2;
  ledStrip.parent = desk;
  
  const ledMat = new BABYLON.StandardMaterial('ledMat', scene);
  ledMat.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1.0); // Blue LED
  ledMat.emissiveColor = new BABYLON.Color3(0.2, 0.3, 0.5);
  ledStrip.material = ledMat;
  
  desk.position = position;
  return desk;
}

/**
 * Creates a procedural visitor chair
 */
export function createVisitorChair(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const chair = new BABYLON.Mesh('visitorChair', scene);
  
  const seatWidth = 0.5 * scale;
  const seatDepth = 0.5 * scale;
  const seatHeight = 0.45 * scale;
  const backHeight = 0.4 * scale;
  
  // Chair material (modern fabric - gray)
  const chairMat = new BABYLON.StandardMaterial('chairMaterial', scene);
  chairMat.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.5); // Gray
  chairMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  
  const legMat = new BABYLON.StandardMaterial('chairLegMaterial', scene);
  legMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35); // Dark gray metal
  legMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  
  // Seat
  const seat = BABYLON.MeshBuilder.CreateBox('chairSeat', {
    width: seatWidth,
    height: 0.08 * scale,
    depth: seatDepth
  }, scene);
  seat.position.y = seatHeight;
  seat.parent = chair;
  seat.material = chairMat;
  
  // Backrest
  const backrest = BABYLON.MeshBuilder.CreateBox('chairBackrest', {
    width: seatWidth,
    height: backHeight,
    depth: 0.08 * scale
  }, scene);
  backrest.position.y = seatHeight + 0.04 * scale + backHeight / 2;
  backrest.position.z = -seatDepth / 2 + 0.04 * scale;
  backrest.parent = chair;
  backrest.material = chairMat;
  
  // Legs (4 metal legs)
  const legPositions = [
    [-seatWidth / 2 + 0.05 * scale, seatDepth / 2 - 0.05 * scale],
    [seatWidth / 2 - 0.05 * scale, seatDepth / 2 - 0.05 * scale],
    [-seatWidth / 2 + 0.05 * scale, -seatDepth / 2 + 0.05 * scale],
    [seatWidth / 2 - 0.05 * scale, -seatDepth / 2 + 0.05 * scale],
  ];
  
  legPositions.forEach((pos, index) => {
    const leg = BABYLON.MeshBuilder.CreateCylinder(`chairLeg${index}`, {
      diameter: 0.025 * scale,
      height: seatHeight,
      tessellation: 8
    }, scene);
    leg.position.x = pos[0];
    leg.position.y = seatHeight / 2;
    leg.position.z = pos[1];
    leg.parent = chair;
    leg.material = legMat;
  });
  
  // Armrests
  const leftArmrest = BABYLON.MeshBuilder.CreateBox('leftArmrest', {
    width: 0.08 * scale,
    height: 0.05 * scale,
    depth: seatDepth * 0.7
  }, scene);
  leftArmrest.position.x = -seatWidth / 2 - 0.04 * scale;
  leftArmrest.position.y = seatHeight + 0.15 * scale;
  leftArmrest.position.z = -0.05 * scale;
  leftArmrest.parent = chair;
  leftArmrest.material = legMat;
  
  const rightArmrest = BABYLON.MeshBuilder.CreateBox('rightArmrest', {
    width: 0.08 * scale,
    height: 0.05 * scale,
    depth: seatDepth * 0.7
  }, scene);
  rightArmrest.position.x = seatWidth / 2 + 0.04 * scale;
  rightArmrest.position.y = seatHeight + 0.15 * scale;
  rightArmrest.position.z = -0.05 * scale;
  rightArmrest.parent = chair;
  rightArmrest.material = legMat;
  
  chair.position = position;
  return chair;
}

/**
 * Creates a procedural bookshelf
 */
export function createBookshelf(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const bookshelf = new BABYLON.Mesh('bookshelf', scene);
  
  const width = 1.2 * scale;
  const depth = 0.35 * scale;
  const height = 2.0 * scale;
  const shelfThickness = 0.03 * scale;
  const numShelves = 5;
  
  // Bookshelf material (wood)
  const woodMat = new BABYLON.StandardMaterial('bookshelfWood', scene);
  woodMat.diffuseColor = new BABYLON.Color3(0.6, 0.45, 0.3); // Medium wood
  woodMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  
  // Side panels
  const leftPanel = BABYLON.MeshBuilder.CreateBox('leftPanel', {
    width: 0.04 * scale,
    height: height,
    depth: depth
  }, scene);
  leftPanel.position.x = -width / 2 + 0.02 * scale;
  leftPanel.position.y = height / 2;
  leftPanel.parent = bookshelf;
  leftPanel.material = woodMat;
  
  const rightPanel = BABYLON.MeshBuilder.CreateBox('rightPanel', {
    width: 0.04 * scale,
    height: height,
    depth: depth
  }, scene);
  rightPanel.position.x = width / 2 - 0.02 * scale;
  rightPanel.position.y = height / 2;
  rightPanel.parent = bookshelf;
  rightPanel.material = woodMat;
  
  // Back panel
  const backPanel = BABYLON.MeshBuilder.CreateBox('backPanel', {
    width: width,
    height: height,
    depth: 0.01 * scale
  }, scene);
  backPanel.position.y = height / 2;
  backPanel.position.z = -depth / 2 + 0.005 * scale;
  backPanel.parent = bookshelf;
  backPanel.material = woodMat;
  
  // Shelves
  for (let i = 0; i < numShelves; i++) {
    const shelf = BABYLON.MeshBuilder.CreateBox(`shelf${i}`, {
      width: width - 0.08 * scale,
      height: shelfThickness,
      depth: depth
    }, scene);
    shelf.position.y = (i * height / numShelves) + shelfThickness / 2;
    shelf.parent = bookshelf;
    shelf.material = woodMat;
    
    // Add books on shelves (except top shelf)
    if (i < numShelves - 1) {
      const numBooks = Math.floor(Math.random() * 5) + 8; // 8-12 books per shelf
      for (let j = 0; j < numBooks; j++) {
        const bookWidth = 0.04 * scale + Math.random() * 0.03 * scale;
        const bookHeight = 0.15 * scale + Math.random() * 0.08 * scale;
        const bookDepth = depth * 0.8;
        
        const book = BABYLON.MeshBuilder.CreateBox(`book_${i}_${j}`, {
          width: bookWidth,
          height: bookHeight,
          depth: bookDepth
        }, scene);
        
        const xOffset = -width / 2 + 0.1 * scale + (j * (width - 0.2 * scale) / numBooks);
        book.position.x = xOffset;
        book.position.y = (i * height / numShelves) + shelfThickness + bookHeight / 2;
        book.position.z = Math.random() * 0.05 * scale - 0.025 * scale;
        book.rotation.y = (Math.random() - 0.5) * 0.1;
        book.parent = bookshelf;
        
        // Random book colors
        const bookMat = new BABYLON.StandardMaterial(`bookMat_${i}_${j}`, scene);
        const colorChoice = Math.random();
        if (colorChoice < 0.25) {
          bookMat.diffuseColor = new BABYLON.Color3(0.7, 0.2, 0.2); // Red
        } else if (colorChoice < 0.5) {
          bookMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.6); // Blue
        } else if (colorChoice < 0.75) {
          bookMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.3); // Green
        } else {
          bookMat.diffuseColor = new BABYLON.Color3(0.5, 0.4, 0.3); // Brown
        }
        book.material = bookMat;
      }
    }
  }
  
  bookshelf.position = position;
  return bookshelf;
}

/**
 * Creates a procedural whiteboard for presentations
 */
export function createWhiteboard(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const whiteboard = new BABYLON.Mesh('whiteboard', scene);
  
  const width = 2.4 * scale;
  const height = 1.5 * scale;
  const depth = 0.05 * scale;
  
  // Frame (aluminum)
  const frameMat = new BABYLON.StandardMaterial('whiteboardFrame', scene);
  frameMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.75); // Silver
  frameMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  
  const frame = BABYLON.MeshBuilder.CreateBox('frame', {
    width: width,
    height: height,
    depth: depth
  }, scene);
  frame.position.y = height / 2;
  frame.parent = whiteboard;
  frame.material = frameMat;
  
  // White surface
  const surface = BABYLON.MeshBuilder.CreateBox('surface', {
    width: width - 0.08 * scale,
    height: height - 0.08 * scale,
    depth: 0.01 * scale
  }, scene);
  surface.position.y = height / 2;
  surface.position.z = depth / 2 + 0.005 * scale;
  surface.parent = whiteboard;
  
  const surfaceMat = new BABYLON.StandardMaterial('whiteboardSurface', scene);
  surfaceMat.diffuseColor = new BABYLON.Color3(0.98, 0.98, 0.98); // Pure white
  surfaceMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  surface.material = surfaceMat;
  
  // Marker tray
  const tray = BABYLON.MeshBuilder.CreateBox('markerTray', {
    width: width - 0.2 * scale,
    height: 0.06 * scale,
    depth: 0.1 * scale
  }, scene);
  tray.position.y = 0.03 * scale;
  tray.position.z = depth / 2 + 0.05 * scale;
  tray.parent = whiteboard;
  tray.material = frameMat;
  
  // Markers in tray
  const markerColors = [
    new BABYLON.Color3(0.1, 0.1, 0.9), // Blue
    new BABYLON.Color3(0.9, 0.1, 0.1), // Red
    new BABYLON.Color3(0.1, 0.7, 0.1), // Green
    new BABYLON.Color3(0.1, 0.1, 0.1)  // Black
  ];
  
  markerColors.forEach((color, index) => {
    const marker = BABYLON.MeshBuilder.CreateCylinder(`marker${index}`, {
      diameter: 0.02 * scale,
      height: 0.12 * scale,
      tessellation: 8
    }, scene);
    marker.position.x = -width / 2 + 0.3 * scale + index * 0.15 * scale;
    marker.position.y = 0.06 * scale;
    marker.position.z = depth / 2 + 0.05 * scale;
    marker.rotation.z = Math.PI / 2;
    marker.parent = whiteboard;
    
    const markerMat = new BABYLON.StandardMaterial(`markerMat${index}`, scene);
    markerMat.diffuseColor = color;
    marker.material = markerMat;
  });
  
  whiteboard.position = position;
  return whiteboard;
}

/**
 * Creates a procedural cafeteria table
 */
export function createCafeteriaTable(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const table = new BABYLON.Mesh('cafeteriaTable', scene);
  
  const width = 1.6 * scale;
  const depth = 0.8 * scale;
  const height = 0.75 * scale;
  const topThickness = 0.04 * scale;
  
  // Table material (light wood)
  const tableMat = new BABYLON.StandardMaterial('cafeteriaTableMat', scene);
  tableMat.diffuseColor = new BABYLON.Color3(0.85, 0.78, 0.65); // Light wood
  tableMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  
  const legMat = new BABYLON.StandardMaterial('tableLegMat', scene);
  legMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35); // Dark metal
  legMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  
  // Table top
  const top = BABYLON.MeshBuilder.CreateBox('tableTop', {
    width: width,
    height: topThickness,
    depth: depth
  }, scene);
  top.position.y = height - topThickness / 2;
  top.parent = table;
  top.material = tableMat;
  
  // Legs (4 cylindrical legs)
  const legPositions = [
    [-width / 2 + 0.1 * scale, -depth / 2 + 0.1 * scale],
    [width / 2 - 0.1 * scale, -depth / 2 + 0.1 * scale],
    [-width / 2 + 0.1 * scale, depth / 2 - 0.1 * scale],
    [width / 2 - 0.1 * scale, depth / 2 - 0.1 * scale],
  ];
  
  legPositions.forEach((pos, index) => {
    const leg = BABYLON.MeshBuilder.CreateCylinder(`tableLeg${index}`, {
      diameter: 0.06 * scale,
      height: height - topThickness,
      tessellation: 12
    }, scene);
    leg.position.x = pos[0];
    leg.position.y = (height - topThickness) / 2;
    leg.position.z = pos[1];
    leg.parent = table;
    leg.material = legMat;
  });
  
  table.position = position;
  return table;
}

/**
 * Creates a procedural cafeteria chair
 */
export function createCafeteriaChair(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1
): BABYLON.Mesh {
  const chair = new BABYLON.Mesh('cafeteriaChair', scene);
  
  const seatWidth = 0.45 * scale;
  const seatDepth = 0.45 * scale;
  const seatHeight = 0.45 * scale;
  const backHeight = 0.5 * scale;
  
  // Chair material (colorful plastic)
  const seatMat = new BABYLON.StandardMaterial('cafeteriaSeatMat', scene);
  seatMat.diffuseColor = new BABYLON.Color3(0.9, 0.3, 0.3); // Red
  seatMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  
  const legMat = new BABYLON.StandardMaterial('cafeteriaLegMat', scene);
  legMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35); // Metal
  legMat.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  
  // Seat
  const seat = BABYLON.MeshBuilder.CreateBox('cafeteriaSeat', {
    width: seatWidth,
    height: 0.06 * scale,
    depth: seatDepth
  }, scene);
  seat.position.y = seatHeight;
  seat.parent = chair;
  seat.material = seatMat;
  
  // Backrest
  const backrest = BABYLON.MeshBuilder.CreateBox('cafeteriaBackrest', {
    width: seatWidth,
    height: backHeight,
    depth: 0.05 * scale
  }, scene);
  backrest.position.y = seatHeight + 0.03 * scale + backHeight / 2;
  backrest.position.z = -seatDepth / 2 + 0.025 * scale;
  backrest.parent = chair;
  backrest.material = seatMat;
  
  // Legs (4 metal legs)
  const legPositions = [
    [-seatWidth / 2 + 0.05 * scale, seatDepth / 2 - 0.05 * scale],
    [seatWidth / 2 - 0.05 * scale, seatDepth / 2 - 0.05 * scale],
    [-seatWidth / 2 + 0.05 * scale, -seatDepth / 2 + 0.05 * scale],
    [seatWidth / 2 - 0.05 * scale, -seatDepth / 2 + 0.05 * scale],
  ];
  
  legPositions.forEach((pos, index) => {
    const leg = BABYLON.MeshBuilder.CreateCylinder(`cafeteriaLeg${index}`, {
      diameter: 0.03 * scale,
      height: seatHeight,
      tessellation: 8
    }, scene);
    leg.position.x = pos[0];
    leg.position.y = seatHeight / 2;
    leg.position.z = pos[1];
    leg.parent = chair;
    leg.material = legMat;
  });
  
  chair.position = position;
  return chair;
}

/**
 * Creates a procedural decorative carpet
 */
export function createDecorativeCarpet(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  scale: number = 1,
  colorVariant: number = 0
): BABYLON.Mesh {
  const carpet = new BABYLON.Mesh('decorativeCarpet', scene);
  
  const width = 2.5 * scale;
  const depth = 1.8 * scale;
  const height = 0.015 * scale;
  
  // Carpet base
  const base = BABYLON.MeshBuilder.CreateBox('carpetBase', {
    width: width,
    height: height,
    depth: depth
  }, scene);
  base.position.y = height / 2;
  base.parent = carpet;
  
  // Color variants for different areas
  const carpetColors = [
    new BABYLON.Color3(0.65, 0.35, 0.35), // Warm red-brown for relaxation
    new BABYLON.Color3(0.35, 0.45, 0.65), // Cool blue-gray for reception
    new BABYLON.Color3(0.55, 0.55, 0.35)  // Olive green for neutral areas
  ];
  
  const carpetMat = new BABYLON.StandardMaterial('carpetMat', scene);
  carpetMat.diffuseColor = carpetColors[colorVariant % carpetColors.length];
  carpetMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05); // Matte finish
  base.material = carpetMat;
  
  // Decorative border
  const borderMat = new BABYLON.StandardMaterial('carpetBorder', scene);
  borderMat.diffuseColor = carpetColors[colorVariant % carpetColors.length].scale(0.7); // Darker border
  
  // Create border strips
  const borderWidth = 0.08 * scale;
  
  // Top border
  const topBorder = BABYLON.MeshBuilder.CreateBox('topBorder', {
    width: width,
    height: height + 0.002 * scale,
    depth: borderWidth
  }, scene);
  topBorder.position.y = (height + 0.002 * scale) / 2;
  topBorder.position.z = depth / 2 - borderWidth / 2;
  topBorder.parent = carpet;
  topBorder.material = borderMat;
  
  // Bottom border
  const bottomBorder = BABYLON.MeshBuilder.CreateBox('bottomBorder', {
    width: width,
    height: height + 0.002 * scale,
    depth: borderWidth
  }, scene);
  bottomBorder.position.y = (height + 0.002 * scale) / 2;
  bottomBorder.position.z = -depth / 2 + borderWidth / 2;
  bottomBorder.parent = carpet;
  bottomBorder.material = borderMat;
  
  // Left border
  const leftBorder = BABYLON.MeshBuilder.CreateBox('leftBorder', {
    width: borderWidth,
    height: height + 0.002 * scale,
    depth: depth - borderWidth * 2
  }, scene);
  leftBorder.position.y = (height + 0.002 * scale) / 2;
  leftBorder.position.x = -width / 2 + borderWidth / 2;
  leftBorder.parent = carpet;
  leftBorder.material = borderMat;
  
  // Right border
  const rightBorder = BABYLON.MeshBuilder.CreateBox('rightBorder', {
    width: borderWidth,
    height: height + 0.002 * scale,
    depth: depth - borderWidth * 2
  }, scene);
  rightBorder.position.y = (height + 0.002 * scale) / 2;
  rightBorder.position.x = width / 2 - borderWidth / 2;
  rightBorder.parent = carpet;
  rightBorder.material = borderMat;
  
  carpet.position = position;
  return carpet;
}

/**
 * Load all procedural props from configuration
 */
export async function loadProceduralProps(
  scene: BABYLON.Scene,
  props: ProceduralPropConfig[],
  shadowGenerator: BABYLON.ShadowGenerator | null
): Promise<void> {
  if (!props || props.length === 0) return;
  
  console.log(`[ProceduralProps] Creating ${props.length} procedural props...`);
  const startTime = performance.now();
  
  props.forEach(config => {
    const position = new BABYLON.Vector3(
      config.position[0],
      config.position[1],
      config.position[2]
    );
    
    const scale = config.scale || 1;
    let mesh: BABYLON.Mesh;
    
    // Create the appropriate procedural prop
    switch (config.type) {
      case 'pallet':
        mesh = createPallet(scene, position, scale);
        break;
      case 'barrel':
        mesh = createBarrel(scene, position, scale);
        break;
      case 'traffic-cone':
        mesh = createTrafficCone(scene, position, scale);
        break;
      case 'safety-barrier':
        mesh = createSafetyBarrier(scene, position, scale);
        break;
      case 'office-printer':
        mesh = createOfficePrinter(scene, position, scale);
        break;
      case 'office-phone':
        mesh = createOfficePhone(scene, position, scale);
        break;
      case 'filing-cabinet':
        mesh = createFilingCabinet(scene, position, scale);
        break;
      case 'office-plant':
        mesh = createOfficePlant(scene, position, scale);
        break;
      case 'office-door':
        mesh = createOfficeDoor(scene, position, scale);
        break;
      case 'office-window':
        mesh = createOfficeWindow(scene, position, scale);
        break;
      case 'office-painting':
        mesh = createOfficePainting(scene, position, scale);
        break;
      case 'office-poster':
        mesh = createOfficePoster(scene, position, scale);
        break;
      case 'desk-lamp':
        mesh = createDeskLamp(scene, position, scale);
        break;
      case 'ceiling-lamp':
        mesh = createCeilingLamp(scene, position, scale);
        break;
      case 'office-sofa':
        mesh = createOfficeSofa(scene, position, scale, config.colorVariant || 0);
        break;
      case 'coffee-table':
        mesh = createCoffeeTable(scene, position, scale);
        break;
      case 'wall-clock':
        mesh = createWallClock(scene, position, scale);
        break;
      case 'wall-calendar':
        mesh = createWallCalendar(scene, position, scale);
        break;
      case 'vending-machine':
        mesh = createVendingMachine(scene, position, scale);
        break;
      case 'water-cooler':
        mesh = createWaterCooler(scene, position, scale);
        break;
      case 'emergency-exit-sign':
        mesh = createEmergencyExitSign(scene, position, scale);
        break;
      case 'fire-extinguisher':
        mesh = createFireExtinguisher(scene, position, scale);
        break;
      case 'reception-desk':
        mesh = createReceptionDesk(scene, position, scale);
        break;
      case 'visitor-chair':
        mesh = createVisitorChair(scene, position, scale);
        break;
      case 'bookshelf':
        mesh = createBookshelf(scene, position, scale);
        break;
      case 'whiteboard':
        mesh = createWhiteboard(scene, position, scale);
        break;
      case 'cafeteria-table':
        mesh = createCafeteriaTable(scene, position, scale);
        break;
      case 'cafeteria-chair':
        mesh = createCafeteriaChair(scene, position, scale);
        break;
      case 'decorative-carpet':
        mesh = createDecorativeCarpet(scene, position, scale, config.colorVariant || 0);
        break;
      default:
        console.warn(`[ProceduralProps] Unknown type: ${config.type}`);
        return;
    }
    
    // Apply rotation if specified
    if (config.rotation) {
      mesh.rotation = new BABYLON.Vector3(
        config.rotation[0],
        config.rotation[1],
        config.rotation[2]
      );
    }
    
    // Apply properties to all child meshes
    mesh.getChildMeshes().forEach(child => {
      if (config.enableCollisions) {
        child.checkCollisions = true;
      }
      if (config.receiveShadows) {
        child.receiveShadows = true;
      }
      if (config.castShadows && shadowGenerator) {
        shadowGenerator.addShadowCaster(child);
      }
    });
    
    // Optimize
    mesh.freezeWorldMatrix();
  });
  
  const loadTime = performance.now() - startTime;
  console.log(`[ProceduralProps] Created ${props.length} props (${loadTime.toFixed(0)}ms)`);
}
