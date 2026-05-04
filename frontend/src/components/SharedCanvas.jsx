'use client';
import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Shared 3D incubator model — loaded ONCE, rendered in a single
 * global Canvas that both the dashboard and showcase sections use.
 */

/* ═══════ Internal scene that switches behaviour based on mode ═══════ */

function IncubatorScene({ mode, status, showcaseCamera, showcaseRotation, showcaseZoom, mouseX }) {
  const groupRef = useRef();
  const modelRef = useRef();
  const orbitRef = useRef();
  const { camera } = useThree();
  const { scene } = useGLTF('/incubator.glb');

  const model = useMemo(() => scene.clone(true), [scene]);

  // Shadows
  useEffect(() => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [model]);

  // Status-based emissive (dashboard mode)
  useEffect(() => {
    if (mode !== 'dashboard') return;
    const statusVal = status?.status || 'normal';
    let color, intensity;
    switch (statusVal) {
      case 'critical':
        color = new THREE.Color(0.95, 0.15, 0.15);
        intensity = 0.5;
        break;
      case 'warning':
        color = new THREE.Color(0.95, 0.75, 0.1);
        intensity = 0.3;
        break;
      default:
        color = new THREE.Color(0, 0, 0);
        intensity = 0.1;
    }
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = color.clone();
        child.material.emissiveIntensity = intensity;
        child.material.needsUpdate = true;
      }
    });
  }, [model, status, mode]);

  // Showcase emissive override
  useEffect(() => {
    if (mode !== 'showcase') return;
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = new THREE.Color(0.05, 0.4, 0.25);
        child.material.emissiveIntensity = 0.1;
        child.material.needsUpdate = true;
      }
    });
  }, [model, mode]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (mode === 'dashboard') {
      // Slow auto-rotation in dashboard
      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.15;
      }
    } else {
      // Showcase: mouse parallax
      const targetMouseY = (mouseX?.current || 0) * 0.3;
      groupRef.current.rotation.y += (targetMouseY - groupRef.current.rotation.y) * 0.05;

      // GSAP-driven model rotation
      if (modelRef.current && showcaseRotation?.current !== undefined) {
        modelRef.current.rotation.y += (showcaseRotation.current - modelRef.current.rotation.y) * 0.08;
      }

      // Camera lerp
      if (showcaseCamera?.current) {
        const ct = showcaseCamera.current;
        camera.position.x += (ct.x - camera.position.x) * 0.06;
        camera.position.y += (ct.y - camera.position.y) * 0.06;
        camera.position.z += (ct.z - camera.position.z) * 0.06;
      }

      // Zoom
      if (showcaseZoom?.current !== undefined) {
        camera.zoom += (showcaseZoom.current - camera.zoom) * 0.06;
        camera.updateProjectionMatrix();
      }

      camera.lookAt(0, 0, 0);
    }

    // Toggle orbit controls
    if (orbitRef.current) {
      orbitRef.current.enabled = mode === 'dashboard';
    }
  });

  return (
    <>
      <group ref={groupRef} position={[0, -0.5, 0]}>
        <group ref={modelRef}>
          <primitive object={model} />
        </group>
      </group>
      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate={false}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
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

/* ═══════ Exported shared canvas ═══════ */

export default function SharedCanvas({ mode, status, showcaseCamera, showcaseRotation, showcaseZoom, mouseX }) {
  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 40, near: 0.1, far: 100 }}
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        powerPreference: 'high-performance',
      }}
    >
      <color attach="background" args={['#111111']} />

      <ambientLight intensity={mode === 'showcase' ? 0.4 : 0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 5, -3]} intensity={0.4} color="#42a5f5" />
      {mode === 'dashboard' && (
        <pointLight
          position={[0, 2, 3]}
          intensity={status?.status === 'critical' ? 1.8 : status?.status === 'warning' ? 0.9 : 0.2}
          color={status?.status === 'critical' ? '#ef5350' : status?.status === 'warning' ? '#ffb300' : '#4caf50'}
        />
      )}
      {mode === 'showcase' && (
        <pointLight position={[3, 1, 4]} intensity={0.2} color="#4caf50" />
      )}

      <Suspense fallback={<LoadingFallback />}>
        <IncubatorScene
          mode={mode}
          status={status}
          showcaseCamera={showcaseCamera}
          showcaseRotation={showcaseRotation}
          showcaseZoom={showcaseZoom}
          mouseX={mouseX}
        />
        <Environment preset="city" />
      </Suspense>

      <ContactShadows position={[0, -2.0, 0]} opacity={0.3} scale={10} blur={2} />
    </Canvas>
  );
}

useGLTF.preload('/incubator.glb');
