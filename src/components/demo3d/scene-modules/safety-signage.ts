import * as BABYLON from '@babylonjs/core';

/**
 * Add safety signage: warning signs, extinguishers, exit signs, floor stripes, first aid kits
 */
export function addSafetySignage(
  scene: BABYLON.Scene,
  type: string,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  shadowGenerator: BABYLON.ShadowGenerator | null
) {
  console.log(`[Safety] Adding safety signage for ${type}`);

  const exitLights: BABYLON.PointLight[] = [];
  const exitSignMaterials: BABYLON.StandardMaterial[] = [];

  // === 1. WARNING SIGNS ===
  const warningPositions = getWarningPositions(type);
  warningPositions.forEach((data, i) => {
    const triangle = BABYLON.MeshBuilder.CreateCylinder(`warnSign_${i}`, { height: 0.02, diameter: 0.9, tessellation: 3 }, scene);
    triangle.position = data.pos;
    triangle.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const warnMat = new BABYLON.StandardMaterial(`warnMat_${i}`, scene);
    warnMat.diffuseColor = new BABYLON.Color3(1, 0.85, 0);
    warnMat.emissiveColor = new BABYLON.Color3(0.3, 0.25, 0);
    warnMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    warnMat.specularPower = 32;
    triangle.material = warnMat;

    const border = BABYLON.MeshBuilder.CreateCylinder(`warnBorder_${i}`, { height: 0.03, diameter: 0.95, tessellation: 3 }, scene);
    border.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, -0.01));
    border.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const borderMat = new BABYLON.StandardMaterial(`borderMat_${i}`, scene);
    borderMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    border.material = borderMat;

    const exclamation = BABYLON.MeshBuilder.CreateBox(`exclamation_${i}`, { width: 0.08, height: 0.35, depth: 0.02 }, scene);
    exclamation.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0.05, 0.02));
    exclamation.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const exclMat = new BABYLON.StandardMaterial(`exclMat_${i}`, scene);
    exclMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    exclamation.material = exclMat;

    const dot = BABYLON.MeshBuilder.CreateSphere(`exclDot_${i}`, { diameter: 0.1 }, scene);
    dot.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, -0.22, 0.02));
    dot.material = exclMat;

    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(triangle);
      shadowGenerator.addShadowCaster(border);
    }
  });

  // === 2. FIRE EXTINGUISHERS ===
  const extinguisherPositions = getExtinguisherPositions(type);
  extinguisherPositions.forEach((data, i) => {
    const bracket = BABYLON.MeshBuilder.CreateBox(`bracket_${i}`, { width: 0.35, height: 0.8, depth: 0.15 }, scene);
    bracket.position = data.pos;
    bracket.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const bracketMat = new BABYLON.StandardMaterial(`bracketMat_${i}`, scene);
    bracketMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    bracketMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    bracket.material = bracketMat;

    const cylinder = BABYLON.MeshBuilder.CreateCylinder(`extinguisher_${i}`, { height: 0.7, diameter: 0.22 }, scene);
    cylinder.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, 0.15));
    cylinder.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const extMat = new BABYLON.StandardMaterial(`extMat_${i}`, scene);
    extMat.diffuseColor = new BABYLON.Color3(0.85, 0.1, 0.1);
    extMat.emissiveColor = new BABYLON.Color3(0.15, 0.02, 0.02);
    extMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    extMat.specularPower = 64;
    cylinder.material = extMat;

    const nozzle = BABYLON.MeshBuilder.CreateCylinder(`nozzle_${i}`, { height: 0.15, diameter: 0.08 }, scene);
    nozzle.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0.42, 0.15));
    nozzle.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const nozzleMat = new BABYLON.StandardMaterial(`nozzleMat_${i}`, scene);
    nozzleMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    nozzleMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    nozzle.material = nozzleMat;

    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(bracket);
      shadowGenerator.addShadowCaster(cylinder);
      shadowGenerator.addShadowCaster(nozzle);
    }
  });

  // === 3. EXIT SIGNS ===
  const exitPositions = getExitPositions(type);
  exitPositions.forEach((data, i) => {
    const exitSign = BABYLON.MeshBuilder.CreateBox(`exitSign_${i}`, { width: 1.2, height: 0.4, depth: 0.15 }, scene);
    exitSign.position = data.pos;
    exitSign.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const exitMat = new BABYLON.StandardMaterial(`exitMat_${i}`, scene);
    exitMat.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.2);
    exitMat.emissiveColor = new BABYLON.Color3(0.05, 0.4, 0.1);
    exitMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    exitSign.material = exitMat;
    exitSignMaterials.push(exitMat);

    const textPlane = BABYLON.MeshBuilder.CreatePlane(`exitText_${i}`, { width: 1.0, height: 0.3 }, scene);
    textPlane.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, -0.08));
    textPlane.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const textMat = new BABYLON.StandardMaterial(`textMat_${i}`, scene);
    textMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    textMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    textPlane.material = textMat;

    if (quality !== 'low') {
      const exitLight = new BABYLON.PointLight(`exitLight_${i}`, data.pos, scene);
      exitLight.intensity = 0.4;
      exitLight.range = 6;
      exitLight.diffuse = new BABYLON.Color3(0.1, 0.8, 0.2);
      exitLights.push(exitLight);
    }

    if (shadowGenerator) shadowGenerator.addShadowCaster(exitSign);
  });

  // === 4. FLOOR STRIPES ===
  const stripePositions = getStripePositions(type);
  stripePositions.forEach((data, i) => {
    for (let s = 0; s < 8; s++) {
      const stripe = BABYLON.MeshBuilder.CreateBox(`stripe_${i}_${s}`, { width: data.width, height: 0.01, depth: 0.15 }, scene);
      stripe.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, (s - 3.5) * 0.3));
      stripe.rotation = new BABYLON.Vector3(0, data.rotation, 0);
      const stripeMat = new BABYLON.StandardMaterial(`stripeMat_${i}_${s}`, scene);
      stripeMat.diffuseColor = s % 2 === 0 ? new BABYLON.Color3(1, 0.85, 0) : new BABYLON.Color3(0.1, 0.1, 0.1);
      stripeMat.emissiveColor = s % 2 === 0 ? new BABYLON.Color3(0.2, 0.17, 0) : new BABYLON.Color3(0, 0, 0);
      stripe.material = stripeMat;
    }
  });

  // === 5. FIRST AID KITS ===
  const firstAidPositions = getFirstAidPositions(type);
  firstAidPositions.forEach((data, i) => {
    const aidBox = BABYLON.MeshBuilder.CreateBox(`aidBox_${i}`, { width: 0.5, height: 0.4, depth: 0.2 }, scene);
    aidBox.position = data.pos;
    aidBox.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const aidMat = new BABYLON.StandardMaterial(`aidMat_${i}`, scene);
    aidMat.diffuseColor = new BABYLON.Color3(0.98, 0.98, 0.98);
    aidMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    aidBox.material = aidMat;

    // Red cross
    const crossH = BABYLON.MeshBuilder.CreateBox(`crossH_${i}`, { width: 0.2, height: 0.06, depth: 0.01 }, scene);
    crossH.position = data.pos.clone().addInPlace(new BABYLON.Vector3(0, 0, -0.11));
    crossH.rotation = new BABYLON.Vector3(0, data.rotation, 0);
    const crossMat = new BABYLON.StandardMaterial(`crossMat_${i}`, scene);
    crossMat.diffuseColor = new BABYLON.Color3(0.85, 0.1, 0.1);
    crossMat.emissiveColor = new BABYLON.Color3(0.2, 0.02, 0.02);
    crossH.material = crossMat;

    const crossV = BABYLON.MeshBuilder.CreateBox(`crossV_${i}`, { width: 0.06, height: 0.2, depth: 0.01 }, scene);
    crossV.position = crossH.position.clone();
    crossV.rotation = crossH.rotation.clone();
    crossV.material = crossMat;

    if (shadowGenerator) shadowGenerator.addShadowCaster(aidBox);
  });

  // === ANIMATION: Exit sign blinking ===
  scene.registerBeforeRender(() => {
    const t = Date.now() * 0.001;
    const blink = Math.sin(t * 2) > 0 ? 0.4 : 0.15;
    exitSignMaterials.forEach(mat => {
      mat.emissiveColor = new BABYLON.Color3(0.05, blink, 0.1);
    });
    exitLights.forEach(light => {
      light.intensity = 0.2 + blink * 0.5;
    });
  });

  console.log(`[Safety] Safety signage added for ${type}`);
}

// ============================================================
// POSITION HELPERS
// ============================================================

function getWarningPositions(type: string): { pos: BABYLON.Vector3; rotation: number }[] {
  switch (type) {
    case 'warehouse': return [
      { pos: new BABYLON.Vector3(-15, 2, -18), rotation: 0 },
      { pos: new BABYLON.Vector3(15, 2, -18), rotation: 0 },
      { pos: new BABYLON.Vector3(-18, 2, 12), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 2, -8), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(-8, 2, 18), rotation: Math.PI },
      { pos: new BABYLON.Vector3(10, 2, 18), rotation: Math.PI },
    ];
    case 'construction': case 'factory': return [
      { pos: new BABYLON.Vector3(-12, 2, -15), rotation: 0 },
      { pos: new BABYLON.Vector3(12, 2, -15), rotation: 0 },
      { pos: new BABYLON.Vector3(-15, 2, 8), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2, -6), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(0, 2, 15), rotation: Math.PI },
    ];
    case 'laboratory': return [
      { pos: new BABYLON.Vector3(-15, 2, -10), rotation: 0 },
      { pos: new BABYLON.Vector3(15, 2, -10), rotation: 0 },
      { pos: new BABYLON.Vector3(-15, 2, 10), rotation: Math.PI },
      { pos: new BABYLON.Vector3(15, 2, 10), rotation: Math.PI },
    ];
    case 'office': return [
      { pos: new BABYLON.Vector3(-12, 2, -8), rotation: 0 },
      { pos: new BABYLON.Vector3(12, 2, -8), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 2, 12), rotation: Math.PI },
    ];
    default: return [];
  }
}

function getExtinguisherPositions(type: string): { pos: BABYLON.Vector3; rotation: number }[] {
  switch (type) {
    case 'warehouse': return [
      { pos: new BABYLON.Vector3(-18, 0.6, -10), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(-18, 0.6, 10), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 0.6, -10), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 0.6, 10), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(-5, 0.6, 18), rotation: Math.PI },
      { pos: new BABYLON.Vector3(5, 0.6, 18), rotation: Math.PI },
    ];
    case 'construction': case 'factory': return [
      { pos: new BABYLON.Vector3(-15, 0.6, -12), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, -12), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(-15, 0.6, 12), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, 12), rotation: -Math.PI / 2 },
    ];
    case 'laboratory': return [
      { pos: new BABYLON.Vector3(-15, 0.6, -8), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(-15, 0.6, 8), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, -8), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, 8), rotation: -Math.PI / 2 },
    ];
    case 'office': return [
      { pos: new BABYLON.Vector3(-15, 0.6, -6), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(-15, 0.6, 6), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 0.6, 0), rotation: -Math.PI / 2 },
    ];
    default: return [];
  }
}

function getExitPositions(type: string): { pos: BABYLON.Vector3; rotation: number }[] {
  switch (type) {
    case 'warehouse': return [
      { pos: new BABYLON.Vector3(0, 6, -19.5), rotation: 0 },
      { pos: new BABYLON.Vector3(-10, 6, 19.5), rotation: Math.PI },
      { pos: new BABYLON.Vector3(10, 6, 19.5), rotation: Math.PI },
    ];
    case 'construction': case 'factory': return [
      { pos: new BABYLON.Vector3(0, 5, -14.5), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 5, 14.5), rotation: Math.PI },
    ];
    case 'laboratory': return [
      { pos: new BABYLON.Vector3(0, 6.5, -14.5), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 6.5, 14.5), rotation: Math.PI },
    ];
    case 'office': return [
      { pos: new BABYLON.Vector3(0, 6.5, -14.5), rotation: 0 },
      { pos: new BABYLON.Vector3(0, 6.5, 14.5), rotation: Math.PI },
    ];
    default: return [];
  }
}

function getStripePositions(type: string): { pos: BABYLON.Vector3; rotation: number; width: number }[] {
  switch (type) {
    case 'warehouse': return [
      { pos: new BABYLON.Vector3(-10, 0.01, 0), rotation: 0, width: 20 },
      { pos: new BABYLON.Vector3(10, 0.01, 0), rotation: 0, width: 20 },
      { pos: new BABYLON.Vector3(0, 0.01, -10), rotation: Math.PI / 2, width: 20 },
      { pos: new BABYLON.Vector3(0, 0.01, 10), rotation: Math.PI / 2, width: 20 },
    ];
    case 'construction': case 'factory': return [
      { pos: new BABYLON.Vector3(-8, 0.01, 0), rotation: 0, width: 16 },
      { pos: new BABYLON.Vector3(8, 0.01, 0), rotation: 0, width: 16 },
      { pos: new BABYLON.Vector3(0, 0.01, -8), rotation: Math.PI / 2, width: 16 },
    ];
    case 'laboratory': return [
      { pos: new BABYLON.Vector3(0, 0.01, -5), rotation: Math.PI / 2, width: 12 },
      { pos: new BABYLON.Vector3(0, 0.01, 5), rotation: Math.PI / 2, width: 12 },
    ];
    case 'office': return [
      { pos: new BABYLON.Vector3(0, 0.01, -2), rotation: Math.PI / 2, width: 10 },
      { pos: new BABYLON.Vector3(0, 0.01, 8), rotation: Math.PI / 2, width: 10 },
    ];
    default: return [];
  }
}

function getFirstAidPositions(type: string): { pos: BABYLON.Vector3; rotation: number }[] {
  switch (type) {
    case 'warehouse': return [
      { pos: new BABYLON.Vector3(-18, 2.5, 0), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(18, 2.5, 0), rotation: -Math.PI / 2 },
      { pos: new BABYLON.Vector3(0, 2.5, 18), rotation: Math.PI },
    ];
    case 'construction': case 'factory': return [
      { pos: new BABYLON.Vector3(-15, 2.5, 0), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2.5, 0), rotation: -Math.PI / 2 },
    ];
    case 'laboratory': return [
      { pos: new BABYLON.Vector3(-15, 2.5, 0), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2.5, 0), rotation: -Math.PI / 2 },
    ];
    case 'office': return [
      { pos: new BABYLON.Vector3(-15, 2.5, 3), rotation: Math.PI / 2 },
      { pos: new BABYLON.Vector3(15, 2.5, 3), rotation: -Math.PI / 2 },
    ];
    default: return [];
  }
}
