import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html, Text } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, useXR, Interactive } from '@react-three/xr';
import { useSpring, animated } from '@react-spring/three';

const GetRandomString = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Loader Component
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
    <group position={position} frustumCulled={false}>
      <mesh receiveShadow frustumCulled={false}>
        <boxGeometry args={[5, 3, 2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2} 
          depthWrite={false}
        />
      </mesh>
      {children}
    </group>
  );
};

// Disc Item Component
const DiscItem = ({ position, color, index, isEmpty = false, isNew = false, isLeaving = false, isAnyItemLeaving = false }) => {
  // Animation for scaling and opacity
  const { scale, opacity } = useSpring({
    from: {
      scale: isNew ? 0 : 1,
      opacity: isNew ? 0 : 1
    },
    to: {
      scale: isLeaving ? 0.7 : 1,
      opacity: isLeaving ? 0 : 1
    },
    config: { 
      mass: 1.2, 
      tension: 240, 
      friction: 24,
      clamp: isLeaving
    }
  });


  return (
    <group position={position} frustumCulled={false}
    >
      {/* Index Text */}
      <Text
        position={[-0.5, 0, 0]}
        fontSize={0.25}
        color="#D6BCFA"
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
        renderOrder={2}
        material-depthWrite={false}
      >
        {index}
      </Text>

      {/* Disc */}
      {!isEmpty && (
        <animated.mesh 
          castShadow 
          scale={scale}
          position={isLeaving || (isAnyItemLeaving && index!=5 && index!=10)? [0, -0.3, 0] : [0, 0, 0]}
          frustumCulled={false}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
          <animated.meshStandardMaterial color={color} transparent opacity={opacity} />
        </animated.mesh>
      )}
    </group>
  );
};

// VR Button Component
const VRButton3D = ({ position, label, onClick }) => {
  const { isPresenting } = useXR();
  const [hovered, setHovered] = useState(false);

  if (!isPresenting) return null;

  return (
    <Interactive onSelect={onClick}>
      <group position={position}>
        <mesh castShadow onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
          <boxGeometry args={[0.8, 0.3, 0.1]} />
          <meshStandardMaterial
            color={hovered ? "#4c1d95" : "#8B5CF6"}
            emissive={hovered ? "#8B5CF6" : "#4c1d95"}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>
        <Text position={[0, 0, 0.06]} fontSize={0.1} color="#ffffff" anchorX="center" anchorY="middle">
          {label}
        </Text>
      </group>
    </Interactive>
  );
};

// FIFO Scene
const FIFOScene = () => {
  const [queue, setQueue] = useState([]);
  // Track positions separately to ensure smooth transitions
  const [positions, setPositions] = useState([]);

  const MAX_ITEMS_PER_COLUMN = 5;
  const MAX_TOTAL_ITEMS = 15;
  const DISC_SPACING = 0.3; // Increased spacing significantly

  // Calculate all possible positions
  const calculatePositions = (length) => {
    return Array.from({ length }, (_, index) => {
      const columnIndex = Math.floor(index / MAX_ITEMS_PER_COLUMN);
      const positionInColumn = index % MAX_ITEMS_PER_COLUMN;
      return { 
        x: -1.5 + (columnIndex * 1.5), 
        y: -0.5 + (positionInColumn * DISC_SPACING), 
        z: 0,
        index 
      };
    });
  };

  // Initialize positions
  useEffect(() => {
    setPositions(calculatePositions(MAX_TOTAL_ITEMS));
  }, []);

  // Enqueue
  const handleEnqueue = () => {
    if (queue.length >= MAX_TOTAL_ITEMS) return;
    
    // Get the last item's color to avoid using the same color
    const lastItemColor = queue.length > 0 ? queue[queue.length - 1].color : null;
    
    // Filter available colors to exclude the last color used
    const availableColors = DISC_COLORS.filter(color => color !== lastItemColor);
    
    // Select a random color from available colors
    const newColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    setQueue(prev => [...prev, { color: newColor, id: GetRandomString(), isNew: true }]);

    setTimeout(() => {
      setQueue(prev => prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, isNew: false } : item)));
    }, 1000);
  };

  // Dequeue
  const handleDequeue = () => {
    if (queue.length === 0) return;
    setQueue(prev => prev.map((item, idx) => (idx === 0 ? { ...item, isLeaving: true } : item)));
    setTimeout(() => {
      setQueue(prev => prev.slice(1));
    }, 300);
  };

  // Calculate all positions for the current queue
  const allPositions = calculatePositions(MAX_TOTAL_ITEMS);

  // Check if any item is currently leaving
  const isAnyItemLeaving = queue.some(item => item.isLeaving);

  return (
    <>
      {/* Queue Count */}
      <group position={[0, 2.8, -2.5]}>
        <Text position={[-0.5, 0, 0]} fontSize={0.3} color="#8B5CF6" anchorX="center" anchorY="middle" fontWeight="bold">
          Queue:
        </Text>
        <Text position={[0.6, 0, 0]} fontSize={0.3} color="#4c1d95" anchorX="center" anchorY="middle" fontWeight="bold">
          {queue.length.toString()}/{MAX_TOTAL_ITEMS}
        </Text>
      </group>

      {/* Transparent Box */}
      <TransparentBox position={[0, 1.5, -2.5]}>
        {allPositions.map(pos => {
          const queueItem = queue[pos.index];
          return (
            <DiscItem
              key={queueItem ? queueItem.id : `empty-${pos.index}`}
              position={[pos.x, pos.y, pos.z]}
              color={queueItem ? queueItem.color : undefined}
              index={pos.index}
              isEmpty={!queueItem}
              isNew={queueItem?.isNew}
              isLeaving={queueItem?.isLeaving}
              isAnyItemLeaving={isAnyItemLeaving}
            />
          );
        })}
      </TransparentBox>

      {/* VR Buttons */}
      <VRButton3D position={[-0.5, 0.4, -1.2]} label="Enqueue" onClick={handleEnqueue} />
      <VRButton3D position={[0.5, 0.4, -1.2]} label="Dequeue" onClick={handleDequeue} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    </>
  );
};

// Scene 3D Component
const Scene3D = () => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <VRButton className="absolute top-4 right-4 z-10" />
      <Canvas shadows>
        <Suspense fallback={<Loader />}>
          <color attach="background" args={['#f8f9fa']} />
          <XR>
            <Controllers rayMaterial={{ color: "purple" }} hideRaysOnBlur={false} />
            <Hands />
            <FIFOScene />
            <OrbitControls enableZoom enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
          </XR>
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
