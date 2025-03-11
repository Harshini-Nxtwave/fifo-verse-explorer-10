import React, { Suspense, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html, Text, useGLTF, Box } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, useXR, Interactive, useXREvent } from '@react-three/xr';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

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

// Professional Room Component - Optimized for performance
const ProfessionalRoom = () => {
  // Reference to floor material for updating it when texture loads
  const floorMaterialRef = useRef(null);
  
  // Use useMemo to create geometries and materials only once
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(20, 20), []);
  const ceilingGeometry = useMemo(() => new THREE.PlaneGeometry(20, 20), []);
  const wallGeometry = useMemo(() => new THREE.BoxGeometry(20, 6, 0.2), []);
  const sideWallGeometry = useMemo(() => new THREE.BoxGeometry(12, 6, 0.2), []);
  const smallWallGeometry = useMemo(() => new THREE.BoxGeometry(6, 6, 0.2), []);
  const topWallGeometry = useMemo(() => new THREE.BoxGeometry(8, 1, 0.2), []);
  const lightGeometry = useMemo(() => new THREE.CircleGeometry(0.4, 16), []); // Reduced segments for better performance
  const lightPanelGeometry = useMemo(() => new THREE.PlaneGeometry(3, 1), []);
  
  // Function to create a procedural wood texture as fallback
  const createProceduralWoodTexture = useCallback(() => {
    // Create a canvas for the procedural texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a warm brown wood color gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#d9b38c');   // Light wood tone
      gradient.addColorStop(0.5, '#c19a6b'); // Medium wood tone
      gradient.addColorStop(1, '#d9b38c');   // Light wood tone
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add wood grain texture
      ctx.strokeStyle = 'rgba(160, 120, 80, 0.1)';
      
      // Add horizontal wood grain lines
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.beginPath();
        ctx.lineWidth = 1 + Math.random() * 2;
        
        // Wavy lines for natural wood look
        ctx.moveTo(0, y);
        for (let x = 0; x < canvas.width; x += 20) {
          const yOffset = y + (Math.random() * 6 - 3);
          ctx.lineTo(x, yOffset);
        }
        ctx.stroke();
      }
      
      // Add some wood planks
      const plankHeight = canvas.height / 6;
      ctx.strokeStyle = 'rgba(100, 70, 40, 0.3)';
      ctx.lineWidth = 2;
      
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * plankHeight);
        ctx.lineTo(canvas.width, i * plankHeight);
        ctx.stroke();
      }
    }
    
    // Create a Three.js texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    return texture;
  }, []);
  
  // Load the specific wood texture requested
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const woodTexture = useMemo(() => {
    const texture = textureLoader.load('/fifo-verse-explorer-10/textures/floor/wood_planks.jpg', 
      // Success callback
      (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(3, 3); // Adjusted repeat to show more wood grain detail
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.anisotropy = 16; // Improve texture sharpness at angles
        
        // Make sure material updates when texture loads
        if (floorMaterialRef.current) {
          floorMaterialRef.current.needsUpdate = true;
        }
      },
      // Progress callback
      undefined,
      // Error callback
      (error) => {
        console.error('Error loading wood texture:', error);
        // If loading fails, create a fallback procedural texture
        return createProceduralWoodTexture();
      }
    );
    
    // Set initial parameters
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    
    return texture;
  }, [createProceduralWoodTexture]);
  
  // Create optimized materials with the texture
  const floorMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({ 
      map: woodTexture,
      roughness: 0.65, // Slightly reduced for more natural appearance
      metalness: 0.0,  // No metalness to avoid nausea
      color: '#ffffff',
      bumpScale: 0.005, // Very subtle bump effect
    });
    
    // Store reference to the material
    floorMaterialRef.current = material;
    
    return material;
  }, [woodTexture]);
  
  const ceilingMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: "#ffffff",
      roughness: 0.1, 
      metalness: 0.1,
    }), []);
  
  const wallMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: "#e2e8f0",
      roughness: 0.2, 
      metalness: 0.1,
    }), []);
  
  const sideWallMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: "#f8fafc",
      roughness: 0.2, 
      metalness: 0.1,
    }), []);
  
  const lightMaterial = useMemo(() => 
    new THREE.MeshBasicMaterial({ 
      color: "#ffffff" 
    }), []);
  
  const lightPanelMaterial = useMemo(() => 
    new THREE.MeshBasicMaterial({ 
      color: "#ffffff",
      transparent: true,
      opacity: 0.8
    }), []);

  return (
    <group>
      {/* Floor */}
      <mesh 
        name="floor-mesh"
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
        geometry={floorGeometry}
        material={floorMaterial}
        frustumCulled={true}
      />

      {/* Ceiling */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 6, 0]} 
        receiveShadow
        geometry={ceilingGeometry}
        material={ceilingMaterial}
        frustumCulled={true}
      />

      {/* Walls */}
      {/* Back Wall */}
      <mesh 
        position={[0, 3, -6]} 
        receiveShadow
        geometry={wallGeometry}
        material={wallMaterial}
        frustumCulled={true}
      />

      {/* Left Wall */}
      <mesh 
        position={[-10, 3, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        receiveShadow
        geometry={sideWallGeometry}
        material={sideWallMaterial}
        frustumCulled={true}
      />

      {/* Right Wall */}
      <mesh 
        position={[10, 3, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        receiveShadow
        geometry={sideWallGeometry}
        material={sideWallMaterial}
        frustumCulled={true}
      />

      {/* Front Wall with opening/door */}
      <mesh 
        position={[-7, 3, 6]} 
        receiveShadow
        geometry={smallWallGeometry}
        material={wallMaterial}
        frustumCulled={true}
      />
      <mesh 
        position={[7, 3, 6]} 
        receiveShadow
        geometry={smallWallGeometry}
        material={wallMaterial}
        frustumCulled={true}
      />
      <mesh 
        position={[0, 5.5, 6]} 
        receiveShadow
        geometry={topWallGeometry}
        material={wallMaterial}
        frustumCulled={true}
      />

      {/* Modern Light Fixtures - ceiling recessed lights */}
      <mesh 
        position={[0, 5.95, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
        geometry={lightGeometry}
        material={lightMaterial}
      />
      <mesh 
        position={[5, 5.95, -4]} 
        rotation={[Math.PI / 2, 0, 0]}
        geometry={lightGeometry}
        material={lightMaterial}
      />
      <mesh 
        position={[-5, 5.95, -4]} 
        rotation={[Math.PI / 2, 0, 0]}
        geometry={lightGeometry}
        material={lightMaterial}
      />
      
      {/* Ambient lighting panels on ceiling */}
      <mesh 
        position={[0, 5.95, -3]} 
        rotation={[Math.PI / 2, 0, 0]}
        geometry={lightPanelGeometry}
        material={lightPanelMaterial}
      />
    </group>
  );
};

// Office Chair Component
const Office3DChair = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Chair Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial 
          color="#334155" 
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
      
      {/* Chair Stem */}
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
        <meshStandardMaterial 
          color="#94a3b8" 
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      {/* Chair Seat */}
      <mesh position={[0, 0.8, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial 
          color="#334155" 
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      
      {/* Chair Back */}
      <mesh position={[0, 1.2, -0.25]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 0.7, 0.1]} />
        <meshStandardMaterial 
          color="#334155" 
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
};

// Decorative Plant
const DecorativePlant = ({ position }) => {
  return (
    <group position={position}>
      {/* Plant Base */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#15803d" 
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      {/* Plant Leaves */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            0.1 * Math.sin(i * Math.PI * 0.4), 
            0.1 + 0.05 * i, 
            0.1 * Math.cos(i * Math.PI * 0.4)
          ]} 
          rotation={[0.2 * i, i * 0.7, 0]}
          receiveShadow 
          castShadow
        >
          <coneGeometry args={[0.1, 0.3, 4, 1]} />
          <meshStandardMaterial 
            color="#16a34a" 
            roughness={0.7}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
};

// Transparent Box Component with increased width to accommodate multiple columns
const TransparentBox = ({ position, children }) => {
  return (
    <group position={position} frustumCulled={false}>
      <mesh receiveShadow frustumCulled={false}>
        <boxGeometry args={[5, 3, 2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.0} 
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
  const { scale, opacity, rotation } = useSpring({
    from: {
      scale: isNew ? 0 : 1,
      opacity: isNew ? 0 : 1,
      rotation: isNew ? -Math.PI / 4 : 0
    },
    to: {
      scale: isLeaving ? 0.7 : 1,
      opacity: isLeaving ? 0 : 1,
      rotation: isLeaving ? Math.PI / 4 : 0
    },
    config: { 
      mass: 1.2, 
      tension: 240, 
      friction: 24,
      clamp: isLeaving
    }
  });

  return (
    <group position={position} frustumCulled={false}>
      {/* Index Text */}
      <Text
        position={[-0.5, 0, 0]}
        fontSize={0.25}
        color="#FFFFFF"
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
          receiveShadow
          scale={scale}
          rotation-y={rotation}
          position={isLeaving || (isAnyItemLeaving && index!=5 && index!=10)? [0, -0.3, 0] : [0, 0, 0]}
          frustumCulled={false}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
          <animated.meshStandardMaterial 
            color={color}
            transparent 
            opacity={opacity}
            roughness={0.2}
            envMapIntensity={1.0}
          />
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

// Fixed Camera Component to prevent head movement issues
const FixedCamera = () => {
  const { camera } = useThree();
  
  // Reset position of camera to avoid drift
  useEffect(() => {
    camera.position.set(0, 1.6, 0);
    camera.rotation.set(0, 0, 0);
    camera.updateMatrixWorld();
  }, [camera]);
  
  return null;
};

// FIFO Scene
const FIFOScene = () => {
  const [queue, setQueue] = useState([]);
  // Track positions separately to ensure smooth transitions
  const [positions, setPositions] = useState([]);
  
  // Audio refs for sound effects
  const enqueueSound = useRef(null);
  const dequeueSound = useRef(null);

  const MAX_ITEMS_PER_COLUMN = 5;
  const MAX_TOTAL_ITEMS = 15;
  const DISC_SPACING = 0.3; // Increased spacing significantly

  // Initialize audio elements
  useEffect(() => {
    enqueueSound.current = new Audio("/fifo-verse-explorer-10/sounds/enque-sound.mp3");
    dequeueSound.current = new Audio("/fifo-verse-explorer-10/sounds/deque-sound.mp3");
    
    // Preload the sounds
    enqueueSound.current.load();
    dequeueSound.current.load();
    
    return () => {
      // Cleanup
      enqueueSound.current = null;
      dequeueSound.current = null;
    };
  }, []);

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
    
    // Play enqueue sound
    if (enqueueSound.current) {
      enqueueSound.current.currentTime = 0; // Reset to start
      enqueueSound.current.play().catch(e => console.error("Error playing enqueue sound:", e));
    }
    
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
    
    // Play dequeue sound
    if (dequeueSound.current) {
      dequeueSound.current.currentTime = 0; // Reset to start
      dequeueSound.current.play().catch(e => console.error("Error playing dequeue sound:", e));
    }
    
    setQueue(prev => prev.map((item, idx) => (idx === 0 ? { ...item, isLeaving: true } : item)));
    setTimeout(() => {
      setQueue(prev => prev.slice(1));
    }, 300);
  };

  // Optimize performance by creating memoized position calculations
  const allPositions = useMemo(() => calculatePositions(MAX_TOTAL_ITEMS), []);

  // Check if any item is currently leaving
  const isAnyItemLeaving = queue.some(item => item.isLeaving);

  return (
    <>
      <ProfessionalRoom />
      
      {/* Queue Count */}
      <group position={[0, 2.8, -4.5]}>
        <Text position={[-0.5, 0, 0]} fontSize={0.3} color="#8B5CF6" anchorX="center" anchorY="middle" fontWeight="bold">
          Queue:
        </Text>
        <Text position={[0.6, 0, 0]} fontSize={0.3} color="#4c1d95" anchorX="center" anchorY="middle" fontWeight="bold">
          {queue.length.toString()}/{MAX_TOTAL_ITEMS}
        </Text>
      </group>

      {/* Transparent Box */}
      <TransparentBox position={[0, 1.5, -4.5]}>
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

      {/* Enhanced Lighting - Optimized for performance */}
      <ambientLight intensity={0.3} />
      <pointLight 
        position={[0, 5.8, 0]} 
        intensity={0.7} 
        castShadow 
        shadow-mapSize-width={512} 
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />
      <spotLight 
        position={[0, 5.5, -2]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={0.8} 
        target-position={[0, 1.5, -2.5]} 
        castShadow 
        shadow-mapSize-width={512} 
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />
      
      {/* Additional light for the FIFO queue at new position */}
      <spotLight 
        position={[0, 5.5, -3.5]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={0.9} 
        target-position={[0, 1.5, -4.5]} 
        castShadow 
        shadow-mapSize-width={512} 
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />
    </>
  );
};

// Start Scene Component
const StartScene = ({ onStart }) => {
  const [hovered, setHovered] = useState(false);
  const { isPresenting } = useXR();
  
  return (
    <>
      <ProfessionalRoom />
      
      {/* Instructions Panel */}
      <group position={[0, 2, -3]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[4, 2.5, 0.05]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        
        <Text
          position={[0, 0.9, 0.03]}
          fontSize={0.2}
          color="#4c1d95"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          FIFO Queue Visualizer
        </Text>
        
        <Text
          position={[0, 0.5, 0.03]}
          fontSize={0.1}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.5}
          textAlign="center"
        >
          Welcome to the FIFO (First In, First Out) Queue Visualizer.
        </Text>
        
        <Text
          position={[0, 0.2, 0.03]}
          fontSize={0.1}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.5}
          textAlign="center"
        >
          • Click 'Enqueue' to add a new item to the queue
        </Text>
        
        <Text
          position={[0, -0.1, 0.03]}
          fontSize={0.1}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.5}
          textAlign="center"
        >
          • Click 'Dequeue' to remove the first item that entered
        </Text>
        
        <Text
          position={[0, -0.4, 0.03]}
          fontSize={0.1}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.5}
          textAlign="center"
        >
          • The animation shows how FIFO queues process items in order
        </Text>
        
        {/* Start Button */}
        {isPresenting ? (
          <Interactive onSelect={onStart}>
            <group 
              position={[0, -1, 0.1]} 
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
            >
              <mesh castShadow>
                <boxGeometry args={[1.5, 0.4, 0.1]} />
                <meshStandardMaterial color={hovered ? "#8B5CF6" : "#a78bfa"} />
              </mesh>
              <Text
                position={[0, 0, 0.06]}
                fontSize={0.15}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                Start Exploring
              </Text>
            </group>
          </Interactive>
        ) : (
          <group 
            position={[0, -1, 0.1]} 
            onClick={onStart}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <mesh castShadow>
              <boxGeometry args={[1.5, 0.4, 0.1]} />
              <meshStandardMaterial color={hovered ? "#8B5CF6" : "#a78bfa"} />
            </mesh>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.15}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              Start Exploring
            </Text>
          </group>
        )}
      </group>
      
      {/* Additional ambient light for better visibility */}
      <ambientLight intensity={0.4} />
      <spotLight 
        position={[0, 5, -2]} 
        angle={0.7} 
        penumbra={0.5} 
        intensity={1} 
        castShadow 
      />
    </>
  );
};

// Scene 3D Component
const Scene3D = () => {
  const [showStartScene, setShowStartScene] = useState(true);
  
  const handleStart = () => {
    setShowStartScene(false);
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <VRButton className="absolute top-4 right-4 z-10" />
      <Canvas 
        shadows={{ 
          enabled: true, 
          type: THREE.PCFSoftShadowMap, 
          autoUpdate: true, 
          needsUpdate: false 
        }}
        dpr={[1, 1.5]} // Limit pixel ratio for better performance
        gl={{ 
          antialias: true, 
          alpha: true, // Enable transparency
          powerPreference: 'high-performance',
          outputEncoding: THREE.sRGBEncoding,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        performance={{ min: 0.5 }} // Allow throttling for consistent framerate
      >
        <Suspense fallback={<Loader />}>
          <XR
            referenceSpace="local-floor"
          >
            <FixedCamera />
            <Controllers rayMaterial={{ color: "purple" }} hideRaysOnBlur={false} />
            <Hands />
            {showStartScene ? (
              <StartScene onStart={handleStart} />
            ) : (
              <FIFOScene />
            )}
            <OrbitControls 
              enableZoom 
              enablePan={false} 
              minPolarAngle={Math.PI / 6} 
              maxPolarAngle={Math.PI / 2}
              makeDefault 
              enableDamping={false}  // Disable damping for better stability
              target={[0, 1.5, -4.5]}  // Updated target point to match new FIFO position
              keyEvents={false}      // Disable keyboard for stability
            />
          </XR>
          <Environment preset="warehouse" background={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
