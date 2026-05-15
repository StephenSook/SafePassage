import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
  wireframe?: boolean;
}

export function ShieldOrb({ position = [0, 0, 0], wireframe = true }: Props) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.15;
      ref.current.rotation.x += dt * 0.05;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[1.4, 1]} />
      <meshStandardMaterial
        color="#A4F4FD"
        metalness={0.85}
        roughness={0.2}
        wireframe={wireframe}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
