
import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html, Box, Text } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, useXR } from '@react-three/xr';
import { Group, Vector3 } from 'three';

// Loading indicator
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 text-white px-4 py-2 rounded-lg">
        <div className="text-lg font-bold">Loading VR Experience</div>
        <div className="w-48 h-2 bg-gray-700 rounded-full mt-2">
          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
};

// Define colors for our squares
const SQUARE_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

// Colored Square Component
const ColoredSquare = ({ position, color, onClick }) => {
  const ref = useRef<Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Simple floating animation
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
    }
  });
  
  return (
    <group ref={ref} position={position} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.1} />
      </mesh>
    </group>
  );
};

// Transparent Box Component
const TransparentBox = ({ position, children }) => {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      {children}
    </group>
  );
};

// Queue Item Component
const QueueItem = ({ position, color }) => {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// VR Buttons - Improved and repositioned for better interactivity
const VRButton3D = ({ position, label, onClick }) => {
  const { isPresenting } = useXR();
  const buttonRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  
  if (!isPresenting) return null;
  
  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      ref={buttonRef}
    >
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.3, 0.1]} />
        <meshStandardMaterial color={hovered ? "#4c1d95" : "#8B5CF6"} />
      </mesh>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// FIFO Scene with interactive elements
const FIFOScene = () => {
  const [queue, setQueue] = useState<string[]>([]);
  const MAX_QUEUE_SIZE = 8; // Maximum items in the queue
  
  // Handle enqueue action
  const handleEnqueue = () => {
    if (queue.length >= MAX_QUEUE_SIZE) return;
    
    // Get a random color from our palette
    const newColor = SQUARE_COLORS[Math.floor(Math.random() * SQUARE_COLORS.length)];
    setQueue(prev => [...prev, newColor]);
    
    console.log("Enqueued item, queue size:", queue.length + 1);
  };
  
  // Handle dequeue action
  const handleDequeue = () => {
    if (queue.length === 0) return;
    
    setQueue(prev => prev.slice(1));
    console.log("Dequeued item, queue size:", queue.length - 1);
  };
  
  return (
    <>
      {/* Colored squares around the box */}
      <ColoredSquare position={[-2, 1, -2]} color={SQUARE_COLORS[0]} onClick={handleEnqueue} />
      <ColoredSquare position={[2, 1, -2]} color={SQUARE_COLORS[1]} onClick={handleEnqueue} />
      <ColoredSquare position={[-2, 1, 2]} color={SQUARE_COLORS[2]} onClick={handleEnqueue} />
      <ColoredSquare position={[2, 1, 2]} color={SQUARE_COLORS[3]} onClick={handleEnqueue} />
      
      {/* Transparent box in the center */}
      <TransparentBox position={[0, 1, 0]}>
        {/* Queue items inside the box */}
        {queue.map((color, index) => {
          // Calculate position inside the box
          // We'll arrange them in a grid pattern
          const x = ((index % 4) - 1.5) * 0.5;
          const y = (Math.floor(index / 4) - 0.5) * 0.5;
          return <QueueItem key={index} position={[x, y, 0]} color={color} />;
        })}
      </TransparentBox>
      
      {/* Improved VR Buttons - positioned closer to player for better interaction */}
      <VRButton3D position={[-0.6, 0.5, -0.7]} label="Enqueue" onClick={handleEnqueue} />
      <VRButton3D position={[0.6, 0.5, -0.7]} label="Dequeue" onClick={handleDequeue} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
    </>
  );
};

interface Scene3DProps {
  queueItems?: Array<{ id: string; value: string | number; color: string; isNew?: boolean; isLeaving?: boolean }>;
}

const Scene3D: React.FC<Scene3DProps> = () => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      {/* VR button for entering VR mode */}
      <VRButton className="absolute top-4 right-4 z-10" />
      
      <Canvas shadows>
        <Suspense fallback={<Loader />}>
          <color attach="background" args={['#f8f9fa']} />
          
          {/* Enable XR/VR mode */}
          <XR>
            {/* VR Controllers and hands */}
            <Controllers rayMaterial={{ color: "purple" }} />
            <Hands />
            
            {/* FIFO Queue Visualization Scene */}
            <FIFOScene />
            
            {/* OrbitControls for non-VR mode */}
            <OrbitControls 
              enableZoom={true} 
              enablePan={false}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
              dampingFactor={0.05}
              rotateSpeed={0.5}
            />
          </XR>
          
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
