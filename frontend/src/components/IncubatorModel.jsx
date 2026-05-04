'use client';
import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Thermometer, Droplets } from 'lucide-react';
import { getModel } from '@/lib/modelCache';

function getStatusColor(status) {
  switch (status) {
    case 'critical': return new THREE.Color(0.95, 0.15, 0.15);
    case 'warning': return new THREE.Color(0.95, 0.75, 0.1);
    default: return new THREE.Color(0.1, 0.75, 0.5);
  }
}

function getEmissiveIntensity(status) {
  switch (status) {
    case 'critical': return 0.5;
    case 'warning': return 0.3;
    default: return 0.1;
  }
}

function IncubatorOBJ({ status }) {
  const groupRef = useRef();
  const [model, setModel] = useState(null);

  // Load from shared cache — model is loaded once globally
  useEffect(() => {
    let cancelled = false;
    getModel()
      .then((src) => {
        if (!cancelled) setModel(src.clone(true));
      })
      .catch((err) => console.error('Model load error:', err));
    return () => { cancelled = true; };
  }, []);

  // Update emissive on status change
  useEffect(() => {
    if (!model) return;
    const emissiveColor = getStatusColor(status);
    const intensity = getEmissiveIntensity(status);

    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = emissiveColor.clone();
        child.material.emissiveIntensity = intensity;
        child.material.needsUpdate = true;
      }
    });
  }, [model, status]);

  // Slow rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <primitive object={model} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        background: '#222222',
        padding: '16px 24px',
        borderRadius: '8px',
        border: '1px solid #333333',
        color: '#4fc3f7',
        fontSize: '0.85rem',
        textAlign: 'center',
      }}>
        Loading 3D Model...
      </div>
    </Html>
  );
}

export default function IncubatorModel({ status, latest }) {
  return (
    <>
      <div className="canvas-container">
        <Canvas
          camera={{ position: [4, 3, 4], fov: 45 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <color attach="background" args={['#111111']} />

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.0}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-4, 5, -3]} intensity={0.4} color="#42a5f5" />
          <pointLight
            position={[0, 2, 3]}
            intensity={status?.status === 'critical' ? 1.8 : status?.status === 'warning' ? 0.9 : 0.2}
            color={status?.status === 'critical' ? '#ef5350' : status?.status === 'warning' ? '#ffb300' : '#4caf50'}
          />

          <Suspense fallback={<LoadingFallback />}>
            <IncubatorOBJ status={status?.status || 'normal'} />
            <Environment preset="city" />
          </Suspense>

          <ContactShadows position={[0, -2.0, 0]} opacity={0.3} scale={10} blur={2} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            autoRotate={false}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
      </div>

      {/* Floating HUD overlays */}
      <div className="model-overlay">
        <div className="overlay-card">
          <div className="overlay-label">
            <Thermometer size={10} />
            Temperature
          </div>
          <div className="overlay-value temp">
            {latest?.temperature?.toFixed(1) || '--.-'}
            <span className="overlay-unit">°C</span>
          </div>
        </div>
        <div className="overlay-card">
          <div className="overlay-label">
            <Droplets size={10} />
            Humidity
          </div>
          <div className="overlay-value humidity">
            {latest?.humidity || '--'}
            <span className="overlay-unit">%</span>
          </div>
        </div>
      </div>
    </>
  );
}
