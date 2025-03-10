
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html, Box, Text, Sky, Plane } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, useXR, Interactive } from '@react-three/xr';

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
  return (
    <group position={position} rotation={rotation}>
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
        <boxGeometry args={[5, 3, 2]} /> {/* Width for multiple columns */}
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
        color="#D6BCFA" // Light Purple for better visibility
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {index}
      </Text>
      
      {/* The disc itself - a cylinder with reduced height */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} /> {/* Disc shape with reduced height */}
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

// Classroom Scene with FIFO visualization
const ClassroomScene = () => {
  const [queue, setQueue] = useState<Array<{ color: string }>>([]);
  const MAX_ITEMS_PER_COLUMN = 10; // Maximum discs in a column
  const MAX_TOTAL_ITEMS = 30; // Maximum total discs (3 columns of 10)
  const DISC_SPACING = 0.25; // Reduced spacing between discs
  
  // Handle enqueue action
  const handleEnqueue = () => {
    if (queue.length >= MAX_TOTAL_ITEMS) return;
    
    // Get a random color from our palette
    const newColor = DISC_COLORS[Math.floor(Math.random() * DISC_COLORS.length)];
    setQueue(prev => [...prev, { color: newColor }]);
    
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
      {/* Classroom Environment */}
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0.49} azimuth={0.25} />
      
      {/* Classroom Elements */}
      <InteractiveWhiteboard position={[0, 0, -3.5]} />
      <TeachersDesk position={[0, 0, -2.5]} />
      
      {/* Student Desks - arranged in a semi-circle */}
      <StudentDesk position={[-2.5, 0, -1]} rotation={[0, Math.PI / 6, 0]} />
      <StudentDesk position={[-2, 0, 0]} rotation={[0, Math.PI / 8, 0]} />
      <StudentDesk position={[-1, 0, 0.5]} rotation={[0, Math.PI / 12, 0]} />
      <StudentDesk position={[0, 0, 0.7]} />
      <StudentDesk position={[1, 0, 0.5]} rotation={[0, -Math.PI / 12, 0]} />
      <StudentDesk position={[2, 0, 0]} rotation={[0, -Math.PI / 8, 0]} />
      <StudentDesk position={[2.5, 0, -1]} rotation={[0, -Math.PI / 6, 0]} />
      
      {/* FIFO Visualization */}
      <TransparentBox position={[0, 2.5, -3]}>
        {/* Queue items organized in columns of 10 */}
        {queue.map((item, index) => {
          // Calculate column index (0, 1, 2)
          const columnIndex = Math.floor(index / MAX_ITEMS_PER_COLUMN);
          
          // Calculate position within column (0-9)
          const positionInColumn = index % MAX_ITEMS_PER_COLUMN;
          
          // Calculate x position based on column (-1.5, 0, 1.5)
          const x = -1.5 + (columnIndex * 1.5);
          
          // Calculate y position within column, stacking from bottom to top
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
      
      {/* VR Buttons for interaction */}
      <VRButton3D position={[-0.5, 1.2, -1.2]} label="Enqueue" onClick={handleEnqueue} />
      <VRButton3D position={[0.5, 1.2, -1.2]} label="Dequeue" onClick={handleDequeue} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#F2FCE2" />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 1.5, -5]} receiveShadow>
        <boxGeometry args={[15, 3, 0.1]} />
        <meshStandardMaterial color="#D3E4FD" />
      </mesh>
      <mesh position={[-7.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 3, 0.1]} />
        <meshStandardMaterial color="#D3E4FD" />
      </mesh>
      <mesh position={[7.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 3, 0.1]} />
        <meshStandardMaterial color="#D3E4FD" />
      </mesh>
      
      {/* Ceiling Lights */}
      <pointLight position={[0, 2.8, -3]} intensity={0.8} castShadow />
      <pointLight position={[-3, 2.8, 0]} intensity={0.8} castShadow />
      <pointLight position={[3, 2.8, 0]} intensity={0.8} castShadow />
      
      {/* Ambient Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
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
            <Controllers 
              rayMaterial={{ color: "purple" }} 
              hideRaysOnBlur={false}
            />
            <Hands />
            
            {/* Classroom Scene with FIFO Queue Visualization */}
            <ClassroomScene />
            
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
