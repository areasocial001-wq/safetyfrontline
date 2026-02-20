import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleEffectsProps {
  position: [number, number, number];
  type: "critical" | "generic";
  onComplete?: () => void;
}

export const ParticleEffects = ({ position, type, onComplete }: ParticleEffectsProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const sparklesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  const lightRef = useRef<THREE.PointLight>(null);
  const completedRef = useRef(false); // Track if onComplete was already called

  const particleCount = type === "critical" ? 200 : 100;
  const duration = type === "critical" ? 2.5 : 1.5;

  useEffect(() => {
    // Main particles (explosion burst)
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const baseColor = type === "critical" 
      ? new THREE.Color(0xff0000) 
      : new THREE.Color(0xff8800);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start at center
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      // Random velocity in all directions (sphere explosion)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = type === "critical" ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
      
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed;

      // Color variation
      const colorVariation = type === "critical" 
        ? new THREE.Color().lerpColors(baseColor, new THREE.Color(0xffff00), Math.random() * 0.5)
        : new THREE.Color().lerpColors(baseColor, new THREE.Color(0xffaa00), Math.random() * 0.3);
      
      colors[i3] = colorVariation.r;
      colors[i3 + 1] = colorVariation.g;
      colors[i3 + 2] = colorVariation.b;

      // Size variation
      sizes[i] = type === "critical" ? 0.15 + Math.random() * 0.2 : 0.1 + Math.random() * 0.15;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    if (particlesRef.current) {
      particlesRef.current.geometry = particleGeometry;
      particlesRef.current.material = particleMaterial;
    }

    // Sparkles (fast bright particles)
    const sparkleCount = type === "critical" ? 50 : 30;
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleVelocities = new Float32Array(sparkleCount * 3);
    const sparkleSizes = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
      const i3 = i * 3;
      sparklePositions[i3] = 0;
      sparklePositions[i3 + 1] = 0;
      sparklePositions[i3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 5 + Math.random() * 5;
      
      sparkleVelocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      sparkleVelocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      sparkleVelocities[i3 + 2] = Math.cos(phi) * speed;

      sparkleSizes[i] = 0.2 + Math.random() * 0.3;
    }

    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    sparkleGeometry.setAttribute('velocity', new THREE.BufferAttribute(sparkleVelocities, 3));
    sparkleGeometry.setAttribute('size', new THREE.BufferAttribute(sparkleSizes, 1));

    const sparkleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      color: type === "critical" ? 0xffff00 : 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    if (sparklesRef.current) {
      sparklesRef.current.geometry = sparkleGeometry;
      sparklesRef.current.material = sparkleMaterial;
    }

    // Smoke particles
    const smokeCount = type === "critical" ? 30 : 20;
    const smokeGeometry = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeVelocities = new Float32Array(smokeCount * 3);
    const smokeSizes = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
      const i3 = i * 3;
      smokePositions[i3] = (Math.random() - 0.5) * 0.5;
      smokePositions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      smokePositions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      smokeVelocities[i3] = (Math.random() - 0.5) * 0.5;
      smokeVelocities[i3 + 1] = 1 + Math.random() * 0.5; // Rising smoke
      smokeVelocities[i3 + 2] = (Math.random() - 0.5) * 0.5;

      smokeSizes[i] = 0.5 + Math.random() * 1;
    }

    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeGeometry.setAttribute('velocity', new THREE.BufferAttribute(smokeVelocities, 3));
    smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));

    const smokeMaterial = new THREE.PointsMaterial({
      size: 1,
      color: 0x555555,
      transparent: true,
      opacity: 0.6,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    if (smokeRef.current) {
      smokeRef.current.geometry = smokeGeometry;
      smokeRef.current.material = smokeMaterial;
    }

    return () => {
      particleGeometry.dispose();
      particleMaterial.dispose();
      sparkleGeometry.dispose();
      sparkleMaterial.dispose();
      smokeGeometry.dispose();
      smokeMaterial.dispose();
    };
  }, [type, particleCount]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    // Animation completed - call onComplete only once
    if (timeRef.current > duration && !completedRef.current) {
      completedRef.current = true;
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    // Skip animation updates after completion
    if (completedRef.current) {
      return;
    }

    const progress = timeRef.current / duration;

    // Animate main particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = particlesRef.current.geometry.attributes.velocity.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Update position based on velocity
        positions[i] += velocities[i] * delta;
        positions[i + 1] += velocities[i + 1] * delta;
        positions[i + 2] += velocities[i + 2] * delta;

        // Apply gravity
        velocities[i + 1] -= 9.8 * delta;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;

      // Fade out
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = 1 - progress;
    }

    // Animate sparkles (faster, brighter)
    if (sparklesRef.current) {
      const positions = sparklesRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = sparklesRef.current.geometry.attributes.velocity.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * delta;
        positions[i + 1] += velocities[i + 1] * delta;
        positions[i + 2] += velocities[i + 2] * delta;
      }

      sparklesRef.current.geometry.attributes.position.needsUpdate = true;

      // Quick fade out for sparkles
      const material = sparklesRef.current.material as THREE.PointsMaterial;
      material.opacity = Math.max(0, 1 - progress * 2);
    }

    // Animate smoke (rising and expanding)
    if (smokeRef.current) {
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = smokeRef.current.geometry.attributes.velocity.array as Float32Array;
      const sizes = smokeRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * delta;
        positions[i + 1] += velocities[i + 1] * delta;
        positions[i + 2] += velocities[i + 2] * delta;

        // Expand smoke particles over time
        const idx = i / 3;
        sizes[idx] += delta * 0.5;
      }

      smokeRef.current.geometry.attributes.position.needsUpdate = true;
      smokeRef.current.geometry.attributes.size.needsUpdate = true;

      // Fade out smoke
      const material = smokeRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.6 * (1 - progress);
    }

    // Animate glow sphere (expanding and fading)
    if (glowRef.current) {
      const scale = 1 + progress * (type === "critical" ? 3 : 2);
      glowRef.current.scale.setScalar(scale);
      
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = (1 - progress) * 0.5;
    }

    // Animate light intensity
    if (lightRef.current) {
      const intensity = (1 - progress) * (type === "critical" ? 5 : 3);
      lightRef.current.intensity = intensity;
    }
  });

  return (
    <group position={position}>
      {/* Main explosion particles */}
      <points ref={particlesRef} />

      {/* Sparkles */}
      <points ref={sparklesRef} />

      {/* Smoke */}
      <points ref={smokeRef} />

      {/* Glowing sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={type === "critical" ? 0xff0000 : 0xff8800}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Dynamic light */}
      <pointLight
        ref={lightRef}
        color={type === "critical" ? 0xff0000 : 0xff8800}
        intensity={type === "critical" ? 5 : 3}
        distance={10}
        decay={2}
      />

      {/* Ring shockwave */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.8, 32]} />
        <meshBasicMaterial
          color={type === "critical" ? 0xff0000 : 0xff8800}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
