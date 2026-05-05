'use client';
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import AlertPanel from '@/components/AlertPanel';
import { HeartPulse, Wifi, WifiOff, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ═══════════════ Generic 3D model (GLB, auto-fit, emissive status) ═══════════════ */

function getEmissiveForStatus(status) {
  switch (status) {
    case 'critical': return { color: new THREE.Color(0.95, 0.15, 0.15), intensity: 0.5 };
    case 'warning':  return { color: new THREE.Color(0.95, 0.75, 0.1),  intensity: 0.3 };
    default:         return { color: new THREE.Color(0, 0, 0),           intensity: 0.1 };
  }
}

function DeviceGLB({ modelPath, status }) {
  const groupRef = useRef();
  const { scene } = useGLTF(modelPath);
  const model = useMemo(() => scene.clone(true), [scene]);

  // Auto-fit
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 3 / maxDim : 1;
    return { scale: s, offset: center.multiplyScalar(-s) };
  }, [model]);

  // Shadows
  useEffect(() => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [model]);

  // Emissive based on status
  useEffect(() => {
    const { color, intensity } = getEmissiveForStatus(status);
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = color.clone();
        child.material.emissiveIntensity = intensity;
        child.material.needsUpdate = true;
      }
    });
  }, [model, status]);

  // Slow rotation
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={groupRef}>
      <group scale={scale} position={[offset.x, offset.y, offset.z]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        background: '#222222', padding: '16px 24px', borderRadius: '8px',
        border: '1px solid #333333', color: '#4fc3f7', fontSize: '0.85rem', textAlign: 'center',
      }}>
        Loading 3D Model...
      </div>
    </Html>
  );
}

/* ═══════════════ Default status+metric cards ═══════════════ */

const STATUS_CONFIG = {
  normal:   { label: 'Normal',   color: 'var(--status-normal)',   bg: 'var(--status-normal-bg)',   border: '#2e5e34' },
  warning:  { label: 'Warning',  color: 'var(--status-warning)',  bg: 'var(--status-warning-bg)',  border: '#5e4a1a' },
  critical: { label: 'Critical', color: 'var(--status-critical)', bg: 'var(--status-critical-bg)', border: '#5e2828' },
};

function StatusRow({ status, metrics }) {
  const s = status?.status || 'normal';
  const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.normal;

  return (
    <div className="status-row">
      {metrics.map((m) => {
        const MetricIcon = m.icon;
        return (
          <div key={m.label} className="card si-card" style={{ borderLeft: `3px solid ${m.color}` }}>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <span className="card-title">
                <MetricIcon size={14} style={{ color: m.color }} />
                {m.label}
              </span>
              <span className="card-badge" style={{ background: m.badgeBg, color: m.color }}>LIVE</span>
            </div>
            <div className="si-value" style={{ color: m.color }}>
              {m.getValue(status)}
              <span className="si-unit">{m.unit}</span>
            </div>
            <div className="si-sub">{m.range}</div>
          </div>
        );
      })}

      {/* System status */}
      <div className="card si-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <span className="card-title">System Status</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.5px', color: cfg.color,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: cfg.color,
              animation: s !== 'normal' ? 'pulse 1.4s infinite' : 'none',
              boxShadow: s !== 'normal' ? `0 0 6px ${cfg.color}` : 'none',
            }} />
            {cfg.label.toUpperCase()}
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 8,
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color, letterSpacing: '-0.01em' }}>
            {cfg.label}
          </span>
        </div>
        <div className="si-sub" style={{ textAlign: 'center' }}>
          {status?.message || 'Awaiting data…'}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Main exported dashboard ═══════════════ */

export default function GenericDeviceDashboard({
  showCanvas = true,
  user,
  deviceName,
  deviceSubtitle,
  deviceIcon: DeviceIcon = HeartPulse,
  accentColor = '#4fc3f7',
  modelPath,
  modelPath_preload,
  status,
  alerts,
  connected,
  clearAlerts,
  metrics,           // [{label, icon, color, badgeBg, unit, range, getValue}]
  overlayCards,      // [{label, icon, value, unit, color}] shown on canvas corner
  ChartsComponent,   // JSX element to render charts
  ControlsComponent, // JSX element to render controls
}) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusVal = status?.status || 'normal';
  const pointIntensity = statusVal === 'critical' ? 1.8 : statusVal === 'warning' ? 0.9 : 0.2;
  const pointColor = statusVal === 'critical' ? '#ef5350' : statusVal === 'warning' ? '#ffb300' : accentColor;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: '1px solid #1e1e24',
              borderRadius: 6, padding: '5px 10px', color: '#666',
              cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
              transition: 'all 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.borderColor = '#333'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#1e1e24'; }}
          >
            <ArrowLeft size={12} />
            HIS
          </button>

          <div className="header-logo" style={{ color: accentColor }}>
            <DeviceIcon size={18} strokeWidth={2.5} />
          </div>
          <div className="header-brand">
            <div className="header-title">{deviceName}</div>
            <div className="header-subtitle">{deviceSubtitle}</div>
          </div>
        </div>
        <div className="header-right">
          <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
            <span className="connection-dot" />
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
        {/* Left — 3D Model */}
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
                  <pointLight position={[0, 2, 3]} intensity={pointIntensity} color={pointColor} />
                  <Suspense fallback={<LoadingFallback />}>
                    <DeviceGLB modelPath={modelPath} status={statusVal} />
                    <Environment preset="city" />
                  </Suspense>
                  <ContactShadows position={[0, -2.0, 0]} opacity={0.3} scale={10} blur={2} />
                  <OrbitControls
                    enablePan={false} enableZoom={true}
                    minDistance={3} maxDistance={10}
                    autoRotate={false} maxPolarAngle={Math.PI / 1.8}
                  />
                </Canvas>
              </div>

              {/* Floating overlay cards */}
              {overlayCards && overlayCards.length > 0 && (
                <div className="model-overlay">
                  {overlayCards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div key={card.label} className="overlay-card">
                        <div className="overlay-label">
                          <CardIcon size={10} />
                          {card.label}
                        </div>
                        <div className="overlay-value" style={{ color: card.color }}>
                          {card.value}
                          <span className="overlay-unit">{card.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

        {/* Right — Dashboard */}
        <div className="panel-dashboard">
          <StatusRow status={status} metrics={metrics} />

          {ChartsComponent && (
            <div className="charts-grid">
              {ChartsComponent}
            </div>
          )}

          <AlertPanel alerts={alerts} onClear={clearAlerts} />

          {ControlsComponent}
        </div>
      </div>
    </div>
  );
}
