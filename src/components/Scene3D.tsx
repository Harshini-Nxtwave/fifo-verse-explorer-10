
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html, Box, Text } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, useXR, Interactive } from '@react-three/xr';
import { Group, Vector3, MeshStandardMaterial } from 'three';
import { motion } from 'framer-motion-3d';

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

// Define colors for our discs
const DISC_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

// Transparent Box Component with increased width to accommodate multiple columns
const TransparentBox = ({ position, children }) => {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[5, 3, 2]} /> {/* Increased width from 2.5 to 5 */}
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      {children}
    </group>
  );
};

// Disc Item Component with animation and glow effect
const DiscItem = ({ position, color, index, isNew = false, isLeaving = false }) => {
  // Fix: Specify the correct type for the ref to work with framer-motion-3d
  const discRef = useRef<THREE.Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [glowing, setGlowing] = useState(isNew || isLeaving);
  
  // Animation for new or leaving items
  useEffect(() => {
    if (isNew || isLeaving) {
      setGlowing(true);
      const timer = setTimeout(() => {
        setGlowing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isNew, isLeaving]);
  
  // Glow effect animation
  useFrame((state) => {
    if (materialRef.current && glowing) {
      // Pulsating emissive intensity for glow effect
      const intensity = Math.sin(state.clock.elapsedTime * 5) * 0.2 + 0.3;
      materialRef.current.emissiveIntensity = intensity;
    }
  });
  
  return (
    <motion.group 
      ref={discRef} 
      position={position}
      initial={isNew ? { scale: 0, y: position[1] + 1 } : undefined}
      animate={{ scale: 1, y: position[1] }}
      exit={isLeaving ? { scale: 0, x: position[0] - 2 } : undefined}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
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
      
      {/* The disc itself - now a cylinder with reduced height */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} /> {/* Disc shape with reduced height */}
        <meshStandardMaterial 
          ref={materialRef}
          color={color} 
          emissive={color}
          emissiveIntensity={glowing ? 0.5 : 0}
        />
      </mesh>
    </motion.group>
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

// FIFO Scene with interactive elements and multi-column layout
const FIFOScene = () => {
  const [queue, setQueue] = useState<Array<{ color: string, isNew?: boolean, isLeaving?: boolean }>>([]);
  const MAX_ITEMS_PER_COLUMN = 10; // Maximum discs in a column
  const MAX_TOTAL_ITEMS = 30; // Maximum total discs (3 columns of 10)
  const DISC_SPACING = 0.4; // Reduced spacing between discs
  
  // Handle enqueue action
  const handleEnqueue = () => {
    if (queue.length >= MAX_TOTAL_ITEMS) return;
    
    // Get a random color from our palette
    const newColor = DISC_COLORS[Math.floor(Math.random() * DISC_COLORS.length)];
    setQueue(prev => [...prev, { color: newColor, isNew: true }]);
    
    // Remove isNew flag after animation completes
    setTimeout(() => {
      setQueue(prev => prev.map((item, idx) => 
        idx === prev.length - 1 ? { ...item, isNew: false } : item
      ));
    }, 2500);
    
    console.log("Enqueued item, queue size:", queue.length + 1);
  };
  
  // Handle dequeue action
  const handleDequeue = () => {
    if (queue.length === 0) return;
    
    // Mark the first item as leaving (for animation)
    setQueue(prev => [
      { ...prev[0], isLeaving: true },
      ...prev.slice(1)
    ]);
    
    // Remove the item after animation completes
    setTimeout(() => {
      setQueue(prev => prev.slice(1));
    }, 2000);
    
    console.log("Dequeued item, queue size:", queue.length - 1);
  };
  
  return (
    <>
      {/* Transparent box positioned behind the buttons for better visibility */}
      <TransparentBox position={[0, 1.5, -2.5]}>
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
              isNew={item.isNew}
              isLeaving={item.isLeaving}
            />
          );
        })}
      </TransparentBox>
      
      {/* VR Buttons for interaction */}
      <VRButton3D position={[-0.5, 1.2, -1.2]} label="Enqueue" onClick={handleEnqueue} />
      <VRButton3D position={[0.5, 1.2, -1.2]} label="Dequeue" onClick={handleDequeue} />
      
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
            <Controllers 
              rayMaterial={{ color: "purple" }} 
              hideRaysOnBlur={false}
            />
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
