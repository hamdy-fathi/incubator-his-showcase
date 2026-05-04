'use client';
import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import StatusIndicator from '@/components/StatusIndicator';
import { TemperatureChart, HumidityChart } from '@/components/Charts';
import AlertPanel from '@/components/AlertPanel';
import RemoteControl from '@/components/RemoteControl';
import { useState } from 'react';
import { HeartPulse, Wifi, WifiOff, Clock, Thermometer, Droplets } from 'lucide-react';
import { useIncubatorData } from '@/hooks/useIncubatorData';

/* ═══════ 3D Model (uses useGLTF — cached globally) ═══════ */

function getStatusColor(status) {
  switch (status) {
    case 'critical': return new THREE.Color(0.95, 0.15, 0.15);
    case 'warning': return new THREE.Color(0.95, 0.75, 0.1);
    default: return new THREE.Color(0, 0, 0);
  }
}

function getEmissiveIntensity(status) {
  switch (status) {
    case 'critical': return 0.5;
    case 'warning': return 0.3;
    default: return 0.1;
  }
}

function IncubatorGLB({ status }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/incubator.glb');

  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [model]);

  useEffect(() => {
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

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

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

/* ═══════ Dashboard Component ═══════ */

export default function Dashboard({ showCanvas = true }) {
  const {
    latest,
    history,
    status,
    alerts,
    connected,
    settings,
    updateSettings,
    clearAlerts,
  } = useIncubatorData();

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <HeartPulse size={18} strokeWidth={2.5} />
          </div>
          <div className="header-brand">
            <div className="header-title">Team #3 Project</div>
            <div className="header-subtitle">Neonatal Monitoring</div>
          </div>
        </div>
        <div className="header-right">
          <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
            <span className="connection-dot"></span>
            {connected ? 'Live' : 'Offline'}
          </div>
          <div className="header-time">
            <Clock size={12} />
            {currentTime}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - 3D Model */}
        <div className="panel-3d">
          {showCanvas && (
            <>
              <div className="canvas-container">
                <Canvas
                  camera={{ position: [4, 3, 4], fov: 45 }}
                  shadows
                  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
                >
                  <color attach="background" args={['#111111']} />
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
                  <pointLight position={[-4, 5, -3]} intensity={0.4} color="#42a5f5" />
                  <pointLight
                    position={[0, 2, 3]}
                    intensity={status?.status === 'critical' ? 1.8 : status?.status === 'warning' ? 0.9 : 0.2}
                    color={status?.status === 'critical' ? '#ef5350' : status?.status === 'warning' ? '#ffb300' : '#4caf50'}
                  />
                  <Suspense fallback={<LoadingFallback />}>
                    <IncubatorGLB status={status?.status || 'normal'} />
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
          )}

          {!showCanvas && (
            <div className="loading-container">
              <div className="loading-text" style={{ color: 'var(--text-dim)' }}>
                3D view active in showcase below ↓
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Dashboard */}
        <div className="panel-dashboard">
          <StatusIndicator status={status} latest={latest} />

          <div className="charts-grid">
            <TemperatureChart data={history} />
            <HumidityChart data={history} />
          </div>

          <AlertPanel alerts={alerts} onClear={clearAlerts} />

          <RemoteControl settings={settings} onUpdate={updateSettings} />
        </div>
      </div>
    </div>
  );
}

useGLTF.preload('/incubator.glb');
