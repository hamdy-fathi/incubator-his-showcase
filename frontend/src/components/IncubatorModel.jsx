'use client';
import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';
import { Thermometer, Droplets } from 'lucide-react';

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

  // Load materials then OBJ
  const materials = useLoader(MTLLoader, '/incubator.mtl');
  const obj = useLoader(OBJLoader, '/incubator.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  // Clone the object so we don't mutate the cached version
  const model = useMemo(() => obj.clone(true), [obj]);

  // Apply emissive coloring based on status
  useEffect(() => {
    const emissiveColor = getStatusColor(status);
    const intensity = getEmissiveIntensity(status);

    model.traverse((child) => {
      if (child.isMesh && child.material) {
        // Handle both single materials and material arrays
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          // Upgrade Phong materials to StandardMaterial for emissive support
          if (!mat.isMeshStandardMaterial) {
            const upgraded = new THREE.MeshStandardMaterial({
              map: mat.map || null,
              normalMap: mat.normalMap || mat.bumpMap || null,
              color: mat.color ? mat.color.clone() : new THREE.Color(0.7, 0.7, 0.7),
              roughness: 0.55,
              metalness: 0.25,
              side: THREE.DoubleSide,
            });
            if (Array.isArray(child.material)) {
              const idx = child.material.indexOf(mat);
              child.material[idx] = upgraded;
            } else {
              child.material = upgraded;
            }
            upgraded.emissive = emissiveColor.clone();
            upgraded.emissiveIntensity = intensity;
            upgraded.needsUpdate = true;
          } else {
            mat.emissive = emissiveColor.clone();
            mat.emissiveIntensity = intensity;
            mat.needsUpdate = true;
          }
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [model, status]);

  // Slow rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  // Auto-scale & center
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 3.2 / maxDim;
    return {
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s),
    };
  }, [model]);

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      <primitive
        object={model}
        scale={[scale, scale, scale]}
        position={[offset.x, offset.y, offset.z]}
      />
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        background: '#1a2130',
        padding: '16px 24px',
        borderRadius: '8px',
        border: '1px solid #2a3344',
        color: '#22d3ee',
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
          <color attach="background" args={['#0b0f19']} />

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.0}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-4, 5, -3]} intensity={0.4} color="#38bdf8" />
          <pointLight
            position={[0, 2, 3]}
            intensity={status?.status === 'critical' ? 1.8 : status?.status === 'warning' ? 0.9 : 0.2}
            color={status?.status === 'critical' ? '#f87171' : status?.status === 'warning' ? '#fbbf24' : '#34d399'}
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
