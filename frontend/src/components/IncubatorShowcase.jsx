'use client';
import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, useGLTF, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import {
  Eye, Cpu, ShieldCheck, ClipboardList,
  ChevronDown, ArrowDown
} from 'lucide-react';

/* ═══════════════ 3D Scene ═══════════════ */

function IncubatorScene({ cameraTargets, modelRotation, zoomValue, mouseX }) {
  const groupRef = useRef();
  const modelRef = useRef();
  const { camera } = useThree();
  const { scene } = useGLTF('/incubator.glb');

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        if (child.material) {
          child.material = child.material.clone();
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Mouse parallax
    const targetMouseY = (mouseX?.current || 0) * 0.3;
    groupRef.current.rotation.y += (targetMouseY - groupRef.current.rotation.y) * 0.05;

    // GSAP-driven model rotation
    if (modelRef.current && modelRotation?.current !== undefined) {
      modelRef.current.rotation.y += (modelRotation.current - modelRef.current.rotation.y) * 0.08;
    }

    // Camera lerp
    const ct = cameraTargets.current;
    camera.position.x += (ct.x - camera.position.x) * 0.06;
    camera.position.y += (ct.y - camera.position.y) * 0.06;
    camera.position.z += (ct.z - camera.position.z) * 0.06;

    // Zoom
    if (zoomValue?.current !== undefined) {
      camera.zoom += (zoomValue.current - camera.zoom) * 0.06;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef} position={[0, -0.5, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        background: '#222', border: '1px solid #333', borderRadius: '8px',
        padding: '16px 24px', color: '#4fc3f7', fontSize: '0.85rem',
      }}>
        Loading 3D Model...
      </div>
    </Html>
  );
}

/* ═══════════════ Section data ═══════════════ */

const SECTIONS = [
  {
    id: 'first',
    title: 'Advanced Neonatal Care',
    description: 'Precision-engineered incubation system providing optimal thermal regulation for premature and critically ill neonates. Continuous monitoring ensures stable microenvironment conditions.',
    icon: Eye,
    side: 'left',
    stats: [
      { label: 'Temperature Accuracy', value: '±0.1°C' },
      { label: 'Response Time', value: '<2s' },
      { label: 'Humidity Range', value: '40–80%' },
    ],
  },
  {
    id: 'second',
    title: 'IoT-Enabled Technology',
    description: 'Real-time data transmission via WebSocket protocol with encrypted API communication. Seamless integration with hospital information systems and EHR platforms.',
    icon: Cpu,
    side: 'right',
    stats: [
      { label: 'Data Interval', value: '2s' },
      { label: 'Protocol', value: 'WSS' },
      { label: 'Encryption', value: 'AES-256' },
    ],
  },
  {
    id: 'third',
    title: 'Multi-Layer Safety',
    description: 'Intelligent alert system with configurable thresholds. Automated escalation from warning to critical states with visual, audible, and remote notification channels.',
    icon: ShieldCheck,
    side: 'left',
    stats: [
      { label: 'Alert Latency', value: '<500ms' },
      { label: 'Uptime', value: '99.97%' },
      { label: 'Redundancy', value: 'Triple' },
    ],
  },
  {
    id: 'fourth',
    title: 'Clinical Specifications',
    description: 'Medical-grade construction meeting IEC 60601-1 standards. Designed for NICU environments with full remote control capability and comprehensive data logging for clinical analysis.',
    icon: ClipboardList,
    side: 'right',
    stats: [
      { label: 'Standard', value: 'IEC 60601' },
      { label: 'Data Retention', value: '90 days' },
      { label: 'Remote Control', value: 'Full' },
    ],
  },
];

const CAMERA_POSES = [
  { x: 4, y: 3, z: 4, zoom: 1.0, rotation: 0 },
  { x: 5, y: 2, z: 2, zoom: 1.4, rotation: Math.PI * 0.25 },
  { x: 0, y: 5, z: 3, zoom: 1.7, rotation: Math.PI * 0.5 },
  { x: -4, y: 2, z: 3, zoom: 1.3, rotation: Math.PI },
  { x: 4, y: 3, z: 4, zoom: 1.0, rotation: Math.PI * 2 },
];

/* ═══════════════ Main Showcase Component ═══════════════ */

export default function IncubatorShowcase({ active, cameraTargets, modelRotation, zoomValue }) {
  const showcaseRef = useRef(null);
  const mouseX = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!mounted || !showcaseRef.current) return;
    let ScrollTriggerPlugin;

    async function initScrollTrigger() {
      const gsapModule = (await import('gsap')).default || (await import('gsap'));
      const gsap = gsapModule.gsap || gsapModule;
      const stMod = await import('gsap/ScrollTrigger');
      ScrollTriggerPlugin = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTriggerPlugin);

      const container = showcaseRef.current;
      if (!container) return;

      SECTIONS.forEach((section, i) => {
        const triggerEl = container.querySelector(`.${section.id}-move`);
        if (!triggerEl) return;
        const to = CAMERA_POSES[i + 1];

        gsap.timeline({
          scrollTrigger: {
            trigger: triggerEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
          .to(cameraTargets.current, { x: to.x, y: to.y, z: to.z }, 'same')
          .to(zoomValue, { current: to.zoom }, 'same')
          .to(modelRotation, { current: to.rotation }, 'same');
      });

      // Card entrance animation
      container.querySelectorAll('.sc-card').forEach((card) => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          scrollTrigger: {
            trigger: card.closest('.sc-scroll-runway'),
            start: 'top 80%',
            end: 'top 30%',
            scrub: 0.4,
          },
        });
      });

      ScrollTriggerPlugin.refresh();
    }

    initScrollTrigger();

    return () => {
      if (ScrollTriggerPlugin) {
        ScrollTriggerPlugin.getAll().forEach(st => st.kill());
      }
    };
  }, [mounted, cameraTargets, modelRotation, zoomValue]);

  if (!mounted) return null;

  return (
    <div ref={showcaseRef} className="showcase-wrapper">
      {/* Transition */}
      <div className="showcase-hero">
        <div className="showcase-hero-content">
          <ChevronDown size={20} className="showcase-chevron" />
          <h2 className="showcase-hero-title">Product Showcase</h2>
          <p className="showcase-hero-sub">Scroll to explore the incubator</p>
          <ArrowDown size={16} className="showcase-arrow" />
        </div>
      </div>

      {/* Fixed WebGL Canvas — only mounts when showcase is in view */}
      {active && (
        <div className="showcase-experience">
          <Canvas
            camera={{ position: [4, 3, 4], fov: 35, near: 0.1, far: 100 }}
            shadows
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
              powerPreference: 'high-performance',
            }}
          >
            <color attach="background" args={['#111111']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
            <pointLight position={[-4, 5, -3]} intensity={0.4} color="#42a5f5" />
            <pointLight position={[3, 1, 4]} intensity={0.2} color="#4caf50" />
            <Suspense fallback={<LoadingFallback />}>
              <IncubatorScene
                cameraTargets={cameraTargets}
                modelRotation={modelRotation}
                zoomValue={zoomValue}
                mouseX={mouseX}
              />
              <Environment preset="city" />
            </Suspense>
            <ContactShadows position={[0, -2.0, 0]} opacity={0.3} scale={10} blur={2} />
          </Canvas>
        </div>
      )}

      {/* Scrollable HTML overlay — sticky stacking cards */}
      <div className="showcase-page">
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className={`sc-scroll-runway ${section.id}-move`}
            >
              <div className={`sc-sticky-card ${section.side}`} style={{ top: `${80 + i * 14}px` }}>
                <div className={`sc-card sc-card-${i}`}>
                  <div className="sc-card-top">
                    <div className="sc-card-badge">
                      <Icon size={16} />
                      <span>0{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="sc-card-title">{section.title}</h3>
                  <p className="sc-card-desc">{section.description}</p>
                  <div className="sc-card-metrics">
                    {section.stats.map((stat, si) => (
                      <div key={stat.label} className="sc-metric">
                        <span className="sc-metric-val">{stat.value}</span>
                        <span className="sc-metric-lbl">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: '60vh' }}></div>
      </div>
    </div>
  );
}
