
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html, Box, Text, Sky, Plane } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, useXR, Interactive } from '@react-three/xr';
import * as THREE from 'three';

// Loading indicator
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 text-white px-4 py-2 rounded-lg">
        <div className="text-lg font-bold">Loading VR Classroom</div>
        <div className="w-48 h-2 bg-gray-700 rounded-full mt-2">
          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
};

// Define colors for our discs
const DISC_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

// Teacher's Desk Component
const TeachersDesk = ({ position }) => {
  return (
    <group position={position}>
      {/* Desk Top */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#403E43" />
      </mesh>
      
      {/* Desk Legs */}
      <mesh position={[-1, 0.35, -0.5]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#403E43" />
      </mesh>
      <mesh position={[1, 0.35, -0.5]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#403E43" />
      </mesh>
      <mesh position={[-1, 0.35, 0.5]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#403E43" />
      </mesh>
      <mesh position={[1, 0.35, 0.5]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#403E43" />
      </mesh>
    </group>
  );
};

// Interactive Whiteboard Component
const InteractiveWhiteboard = ({ position }) => {
  return (
    <group position={position}>
      {/* Whiteboard Background */}
      <mesh receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[5, 3, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Whiteboard Frame */}
      <mesh receiveShadow position={[0, 1.5, -0.03]}>
        <boxGeometry args={[5.2, 3.2, 0.02]} />
        <meshStandardMaterial color="#8E9196" />
      </mesh>
      
      {/* FIFO Title */}
      <Text
        position={[0, 3, 0.03]}
        fontSize={0.25}
        color="#403E43"
        anchorX="center"
        anchorY="top"
        fontWeight="bold"
      >
        FIFO Queue Visualization
      </Text>
    </group>
  );
};

// Student's Desk Component
const StudentDesk = ({ position, rotation = [0, 0, 0] }) => {
  const eulerRotation = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
  
  return (
    <group position={position} rotation={eulerRotation}>
      {/* Desk Top */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.05, 0.5]} />
        <meshStandardMaterial color="#F1F0FB" />
      </mesh>
      
      {/* Desk Legs */}
      <mesh position={[-0.3, 0.3, -0.2]} castShadow>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#C8C8C9" />
      </mesh>
      <mesh position={[0.3, 0.3, -0.2]} castShadow>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#C8C8C9" />
      </mesh>
      <mesh position={[-0.3, 0.3, 0.2]} castShadow>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#C8C8C9" />
      </mesh>
      <mesh position={[0.3, 0.3, 0.2]} castShadow>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#C8C8C9" />
      </mesh>
    </group>
  );
};

// TransparentBox Component with increased width for FIFO visualization
const TransparentBox = ({ position, children }) => {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[5, 3, 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      {children}
    </group>
  );
};

// Disc Item Component
const DiscItem = ({ position, color, index }) => {
  return (
    <group position={position}>
      {/* Index number placed to the left of the disc */}
      <Text
        position={[-0.5, 0, 0]}
        fontSize={0.25}
        color="#D6BCFA"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {index}
      </Text>
      
      {/* The disc itself - a cylinder with reduced height */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// Enhanced VR Button with better interaction
const VRButton3D = ({ position, label, onClick }) => {
  const { isPresenting } = useXR();
  const [hovered, setHovered] = useState(false);
  
  if (!isPresenting) return null;
  
  return (
    <Interactive onSelect={onClick}>
      <group position={position}>
        <mesh 
          castShadow 
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.8, 0.3, 0.1]} />
          <meshStandardMaterial 
            color={hovered ? "#4c1d95" : "#8B5CF6"} 
            emissive={hovered ? "#8B5CF6" : "#4c1d95"}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
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
    </Interactive>
  );
};

// Controls component to conditionally render orbit controls
const Controls = () => {
  const { isPresenting } = useXR();
  
  // Only render OrbitControls when not in VR mode
  return isPresenting ? null : (
    <OrbitControls 
      enableZoom={true} 
      enablePan={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2}
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  );
};

// Classroom Scene with FIFO visualization
const ClassroomScene = () => {
  const [queue, setQueue] = useState<Array<{ color: string }>>([]);
  const MAX_ITEMS_PER_COLUMN = 10;
  const MAX_TOTAL_ITEMS = 30;
  const DISC_SPACING = 0.25;
  
  const handleEnqueue = () => {
    if (queue.length >= MAX_TOTAL_ITEMS) return;
    
    const newColor = DISC_COLORS[Math.floor(Math.random() * DISC_COLORS.length)];
    setQueue(prev => [...prev, { color: newColor }]);
    
    console.log("Enqueued item, queue size:", queue.length + 1);
  };
  
  const handleDequeue = () => {
    if (queue.length === 0) return;
    
    setQueue(prev => prev.slice(1));
    console.log("Dequeued item, queue size:", queue.length - 1);
  };
  
  return (
    <>
      {/* Use lower-quality sky for better performance */}
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0.49} azimuth={0.25} turbidity={10} rayleigh={0.5} />
      
      <InteractiveWhiteboard position={[0, 0, -3.5]} />
      <TeachersDesk position={[0, 0, -2.5]} />
      
      {/* Reduced number of desks for better performance */}
      <StudentDesk position={[-2.5, 0, -1]} rotation={[0, Math.PI / 6, 0]} />
      <StudentDesk position={[-1.5, 0, 0]} rotation={[0, Math.PI / 10, 0]} />
      <StudentDesk position={[0, 0, 0.7]} />
      <StudentDesk position={[1.5, 0, 0]} rotation={[0, -Math.PI / 10, 0]} />
      <StudentDesk position={[2.5, 0, -1]} rotation={[0, -Math.PI / 6, 0]} />
      
      <TransparentBox position={[0, 2.5, -3]}>
        {queue.map((item, index) => {
          const columnIndex = Math.floor(index / MAX_ITEMS_PER_COLUMN);
          const positionInColumn = index % MAX_ITEMS_PER_COLUMN;
          const x = -1.5 + (columnIndex * 1.5);
          const y = -1 + (positionInColumn * DISC_SPACING);
          
          return (
            <DiscItem 
              key={index} 
              position={[x, y, 0]} 
              color={item.color} 
              index={index} 
            />
          );
        })}
      </TransparentBox>
      
      <VRButton3D position={[-0.5, 1.2, -1.2]} label="Enqueue" onClick={handleEnqueue} />
      <VRButton3D position={[0.5, 1.2, -1.2]} label="Dequeue" onClick={handleDequeue} />
      
      {/* Floor and walls with optimized materials */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#F2FCE2" roughness={0.8} metalness={0.2} />
      </mesh>
      
      <mesh position={[0, 1.5, -5]} receiveShadow>
        <boxGeometry args={[15, 3, 0.1]} />
        <meshStandardMaterial color="#D3E4FD" roughness={0.7} />
      </mesh>
      <mesh position={[-7.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 3, 0.1]} />
        <meshStandardMaterial color="#D3E4FD" roughness={0.7} />
      </mesh>
      <mesh position={[7.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 3, 0.1]} />
        <meshStandardMaterial color="#D3E4FD" roughness={0.7} />
      </mesh>
      
      {/* Optimized lighting setup */}
      <pointLight position={[0, 2.8, -3]} intensity={0.6} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.6} 
        castShadow 
        shadow-mapSize-width={512} 
        shadow-mapSize-height={512}
        shadow-camera-far={15}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
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
      <VRButton className="absolute top-4 right-4 z-10" />
      
      <Canvas shadows gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Suspense fallback={<Loader />}>
          <color attach="background" args={['#f8f9fa']} />
          
          <XR frameRate={72}>
            <Controllers 
              rayMaterial={{ color: "purple" }} 
              hideRaysOnBlur={false}
            />
            <Hands />
            
            <ClassroomScene />
            
            {/* Controls are now moved to a separate component */}
            <Controls />
          </XR>
          
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
