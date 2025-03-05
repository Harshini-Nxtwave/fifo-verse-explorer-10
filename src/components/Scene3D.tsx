
import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stage, PerspectiveCamera, useProgress, Html } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, Interactive, useXR } from '@react-three/xr';
import { Group } from 'three';
import FifoQueue from './FifoQueue';

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

// Checks if VR is supported and initialized
const VRStatus = () => {
  const { isPresenting, isSessionSupported } = useXR();
  
  if (!isSessionSupported) {
    return (
      <Html center>
        <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg">
          <h3 className="text-lg font-bold">VR Not Supported</h3>
          <p>Your browser doesn't support WebXR or VR hardware was not detected.</p>
          <p className="mt-2 text-sm">Try using a different browser or connect a VR headset.</p>
        </div>
      </Html>
    );
  }
  
  return null;
};

interface Scene3DProps {
  queueItems: Array<{ id: string; value: string | number; color: string; isNew?: boolean; isLeaving?: boolean }>;
}

const RotatingStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupRef = useRef<Group>(null);
  const { isPresenting } = useXR();
  
  useFrame((state) => {
    if (groupRef.current && !isPresenting) {
      // Very subtle automatic rotation - only when not in VR
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
};

const Scene3D: React.FC<Scene3DProps> = ({ queueItems }) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      {/* VR button for entering VR mode */}
      <VRButton className="absolute top-4 right-4 z-10" />
      
      <Canvas shadows>
        <Suspense fallback={<Loader />}>
          <color attach="background" args={['#f8f9fa']} />
          
          {/* Enable XR/VR mode */}
          <XR>
            <VRStatus />
            <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={50} />
            
            {/* VR Controllers and hands */}
            <Controllers />
            <Hands />
            
            <Stage environment="city" shadows={{ type: 'contact', opacity: 0.2, blur: 3 }} adjustCamera={false}>
              <RotatingStage>
                <FifoQueue items={queueItems} />
              </RotatingStage>
            </Stage>
            
            {/* OrbitControls for non-VR mode */}
            <OrbitControls 
              enableZoom={true} 
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
              dampingFactor={0.05}
              rotateSpeed={0.5}
            />
          </XR>
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
