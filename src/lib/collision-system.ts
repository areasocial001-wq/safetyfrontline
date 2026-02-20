import * as THREE from "three";

export interface CollisionBox {
  id: string;
  position: THREE.Vector3;
  size: THREE.Vector3;
  box: THREE.Box3;
}

export class CollisionSystem {
  private collisionBoxes: CollisionBox[] = [];
  private playerRadius: number = 0.5;
  private collisionCount: number = 0;

  getCollisionCount(): number {
    return this.collisionCount;
  }

  resetCollisionCount(): void {
    this.collisionCount = 0;
  }

  addCollisionBox(id: string, position: THREE.Vector3, size: THREE.Vector3) {
    const box = new THREE.Box3();
    const min = new THREE.Vector3(
      position.x - size.x / 2,
      position.y - size.y / 2,
      position.z - size.z / 2
    );
    const max = new THREE.Vector3(
      position.x + size.x / 2,
      position.y + size.y / 2,
      position.z + size.z / 2
    );
    box.set(min, max);

    this.collisionBoxes.push({
      id,
      position,
      size,
      box,
    });
  }

  checkCollision(playerPosition: THREE.Vector3, direction: THREE.Vector3, distance: number): boolean {
    // Create a ray from player position in the movement direction
    const raycaster = new THREE.Raycaster(playerPosition, direction.normalize(), 0, distance);

    // Create a bounding sphere for the player
    const playerSphere = new THREE.Sphere(playerPosition, this.playerRadius);

    for (const collisionBox of this.collisionBoxes) {
      // Check if player sphere intersects with collision box
      if (collisionBox.box.intersectsSphere(playerSphere)) {
        this.collisionCount++;
        return true;
      }

      // Expand the box slightly to account for player radius
      const expandedBox = collisionBox.box.clone();
      expandedBox.expandByScalar(this.playerRadius);

      // Check if the movement ray would intersect the expanded box
      const intersection = raycaster.ray.intersectBox(expandedBox, new THREE.Vector3());
      if (intersection) {
        this.collisionCount++;
        return true;
      }
    }

    return false;
  }

  clear() {
    this.collisionBoxes = [];
  }
}

export class CameraShake {
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTime: number = 0;
  private originalPosition: THREE.Vector3 = new THREE.Vector3();

  triggerShake(intensity: number = 0.1, duration: number = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTime = 0;
  }

  update(camera: THREE.Camera, deltaTime: number): void {
    if (this.shakeTime < this.shakeDuration) {
      // Calculate shake offset
      const progress = this.shakeTime / this.shakeDuration;
      const decay = 1 - progress;
      
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity * decay;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity * decay;
      const offsetZ = (Math.random() - 0.5) * this.shakeIntensity * decay;

      camera.position.x += offsetX;
      camera.position.y += offsetY;
      camera.position.z += offsetZ;

      this.shakeTime += deltaTime;
    }
  }

  isShaking(): boolean {
    return this.shakeTime < this.shakeDuration;
  }
}
