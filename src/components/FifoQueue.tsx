
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Interactive, useXR } from '@react-three/xr';
import { Group, Mesh, MeshStandardMaterial } from 'three';

interface QueueItemProps {
  position: [number, number, number];
  value: string | number;
  color: string;
  isNew?: boolean;
  isLeaving?: boolean;
  index: number;
  onSelect?: () => void;
}

const QueueItem: React.FC<QueueItemProps> = ({ position, value, color, isNew, isLeaving, index, onSelect }) => {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Add subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index * 0.5) * 0.05;
    }
    
    if (materialRef.current) {
      // Pulse highlight effect for new or leaving items
      if (isNew || isLeaving) {
        materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
      }
      
      // Hover effect
      if (hovered) {
        materialRef.current.emissiveIntensity = 0.8;
      }
    }
  });
  
  return (
    <Interactive 
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onSelect={onSelect}
    >
      <group 
        ref={groupRef}
        position={[position[0], position[1], position[2]]}
        scale={isNew || isLeaving ? (isNew ? 0.5 : 0.8) : hovered ? 1.1 : 1}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            ref={materialRef}
            color={color} 
            emissive={color} 
            emissiveIntensity={isNew || isLeaving ? 0.5 : hovered ? 0.8 : 0}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {value.toString()}
        </Text>
      </group>
    </Interactive>
  );
};

interface FifoQueueProps {
  items: Array<{ id: string; value: string | number; color: string; isNew?: boolean; isLeaving?: boolean }>;
}

const FifoQueue: React.FC<FifoQueueProps> = ({ items }) => {
  const { isPresenting } = useXR();
  
  // Log VR status to help debug
  React.useEffect(() => {
    console.log('VR Presenting:', isPresenting);
  }, [isPresenting]);

  return (
    <group position={[0, 0, 0]}>
      {/* Queue container */}
      <mesh position={[0, 0, -1]} receiveShadow>
        <boxGeometry args={[items.length > 0 ? items.length * 1.5 + 1 : 3, 1.5, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" opacity={0.7} transparent />
      </mesh>
      
      {/* Entry point indicator */}
      <Interactive onSelect={() => console.log("Enqueue action")}>
        <group position={[-(items.length > 0 ? items.length * 0.75 : 1.5) - 0.5, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
            <meshStandardMaterial color="#8B5CF6" />
          </mesh>
          <Text
            position={[0, 0.7, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            ENQUEUE
          </Text>
        </group>
      </Interactive>
      
      {/* Exit point indicator */}
      <Interactive onSelect={() => console.log("Dequeue action")}>
        <group position={[(items.length > 0 ? items.length * 0.75 : 1.5) + 0.5, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
            <meshStandardMaterial color="#F97316" />
          </mesh>
          <Text
            position={[0, 0.7, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            DEQUEUE
          </Text>
        </group>
      </Interactive>
      
      {/* Queue items */}
      {items.map((item, index) => (
        <QueueItem
          key={item.id}
          position={[-(items.length * 0.75) + (index * 1.5), 0, 0]}
          value={item.value}
          color={item.color}
          isNew={item.isNew}
          isLeaving={item.isLeaving}
          index={index}
          onSelect={() => console.log(`Selected item: ${item.value}`)}
        />
      ))}
    </group>
  );
};

export default FifoQueue;
