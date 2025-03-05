
import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stage, PerspectiveCamera } from '@react-three/drei';
import { Group } from 'three';
import FifoQueue from './FifoQueue';

interface Scene3DProps {
  queueItems: Array<{ id: string; value: string | number; color: string; isNew?: boolean; isLeaving?: boolean }>;
}

const RotatingStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Very subtle automatic rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
};

const Scene3D: React.FC<Scene3DProps> = ({ queueItems }) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas shadows>
        <Suspense fallback={null}>
          <color attach="background" args={['#f8f9fa']} />
          
          <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={50} />
          
          <Stage environment="city" shadows={{ type: 'contact', opacity: 0.2, blur: 3 }} adjustCamera={false}>
            <RotatingStage>
              <FifoQueue items={queueItems} />
            </RotatingStage>
          </Stage>
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            dampingFactor={0.05}
            rotateSpeed={0.5}
          />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
