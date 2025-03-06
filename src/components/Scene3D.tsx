
import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import { Group } from 'three';

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

// Basic 3D ball/sphere
const VRBall = () => {
  const ballRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (ballRef.current) {
      // Simple floating animation
      ballRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      // Slow rotation
      ballRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group ref={ballRef} position={[0, 1, -1]}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

interface Scene3DProps {
  queueItems: Array<{ id: string; value: string | number; color: string; isNew?: boolean; isLeaving?: boolean }>;
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
            <Controllers />
            <Hands />
            
            {/* Simple VR scene with just a ball */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize-width={1024} 
              shadow-mapSize-height={1024}
            />
            
            <VRBall />
            
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <meshStandardMaterial color="#e0e0e0" />
            </mesh>
            
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
