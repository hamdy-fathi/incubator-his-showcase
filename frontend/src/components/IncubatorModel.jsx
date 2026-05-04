'use client';
import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
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
  const [model, setModel] = useState(null);

  // Load OBJ + MTL + textures manually (no useLoader caching issues)
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        // Dynamic imports to avoid SSR issues
        const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
        const { MTLLoader } = await import('three/examples/jsm/loaders/MTLLoader');

        // Load MTL
        const mtlLoader = new MTLLoader();
        const materials = await new Promise((resolve, reject) => {
          mtlLoader.load('/incubator.mtl', resolve, undefined, reject);
        });
        materials.preload();

        // Load OBJ with materials
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        const obj = await new Promise((resolve, reject) => {
          objLoader.load('/incubator.obj', resolve, undefined, reject);
        });

        if (cancelled) return;

        // Load PBR textures
        const texLoader = new THREE.TextureLoader();
        const loadTex = (path) => new Promise((resolve) => {
          texLoader.load(path, resolve, undefined, () => resolve(null));
        });

        const [baseColor, normalMap, roughnessMap, metallicMap, aoMap] = await Promise.all([
          loadTex('/BaseColor.tga.png'),
          loadTex('/NormalMap.tga.png'),
          loadTex('/Roughness.tga.png'),
          loadTex('/Metallic.tga.png'),
          loadTex('/AO.tga.png'),
        ]);

        if (cancelled) return;

        // Configure color spaces
        if (baseColor) baseColor.colorSpace = THREE.SRGBColorSpace;
        [normalMap, roughnessMap, metallicMap, aoMap].forEach(tex => {
          if (tex) tex.colorSpace = THREE.LinearSRGBColorSpace;
        });

        // Apply PBR materials based on material name
        obj.traverse((child) => {
          if (!child.isMesh) return;
          const matName = child.material?.name || '';

          if (matName === 'blinn2') {
            child.material = new THREE.MeshStandardMaterial({
              map: baseColor,
              normalMap: normalMap,
              roughnessMap: roughnessMap,
              metalnessMap: metallicMap,
              aoMap: aoMap,
              side: THREE.DoubleSide,
            });
          } else if (matName === 'blinn1') {
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0.0, 0.14, 0.92),
              normalMap: normalMap,
              roughness: 0.4,
              metalness: 0.3,
              side: THREE.DoubleSide,
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0.5, 0.5, 0.5),
              roughness: 0.6,
              metalness: 0.2,
              side: THREE.DoubleSide,
            });
          }
          child.castShadow = true;
          child.receiveShadow = true;
        });

        if (!cancelled) setModel(obj);
      } catch (err) {
        console.error('Failed to load incubator model:', err);
      }
    }

    loadModel();
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

  // Auto-scale & center
  const { scale, offset } = useMemo(() => {
    if (!model) return { scale: 1, offset: new THREE.Vector3() };
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

  if (!model) return null;

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
