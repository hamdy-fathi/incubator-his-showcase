'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Eye, Cpu, ShieldCheck, ClipboardList,
  ChevronDown, ArrowDown
} from 'lucide-react';
import { getModel } from '@/lib/modelCache';

/* ═══════════════ 3D Scene Inner Component ═══════════════ */

function IncubatorScene({ cameraTargets, modelRotation, zoomValue, mouseX }) {
  const groupRef = useRef();
  const modelRef = useRef();
  const { camera } = useThree();
  const [model, setModel] = useState(null);

  // Load from shared cache
  useEffect(() => {
    let cancelled = false;
    getModel()
      .then((src) => {
        if (cancelled) return;
        const clone = src.clone(true);
        // Apply subtle green emissive
        clone.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.emissive = new THREE.Color(0.05, 0.4, 0.25);
            child.material.emissiveIntensity = 0.1;
          }
        });
        setModel(clone);
      })
      .catch((e) => console.error('Showcase model load error:', e));
    return () => { cancelled = true; };
  }, []);

  // Every frame: lerp camera + model rotation
  useFrame(() => {
    if (!groupRef.current) return;

    // Mouse parallax on parent group
    const targetMouseY = mouseX.current * 0.3;
    groupRef.current.rotation.y += (targetMouseY - groupRef.current.rotation.y) * 0.05;

    // GSAP-driven model rotation on child
    if (modelRef.current) {
      modelRef.current.rotation.y += (modelRotation.current - modelRef.current.rotation.y) * 0.08;
    }

    // Camera position lerp
    const ct = cameraTargets.current;
    camera.position.x += (ct.x - camera.position.x) * 0.06;
    camera.position.y += (ct.y - camera.position.y) * 0.06;
    camera.position.z += (ct.z - camera.position.z) * 0.06;

    // Zoom
    camera.zoom += (zoomValue.current - camera.zoom) * 0.06;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  });

  if (!model) {
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

  return (
    <group ref={groupRef}>
      <group ref={modelRef} position={[0, -0.5, 0]}>
        <primitive object={model} />
      </group>
    </group>
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

// Camera poses per section (position xyz + zoom)
const CAMERA_POSES = [
  { x: 4, y: 3, z: 4, zoom: 1.0, rotation: 0 },
  { x: 5, y: 2, z: 2, zoom: 1.4, rotation: Math.PI * 0.25 },
  { x: 0, y: 5, z: 3, zoom: 1.7, rotation: Math.PI * 0.5 },
  { x: -4, y: 2, z: 3, zoom: 1.3, rotation: Math.PI },
  { x: 4, y: 3, z: 4, zoom: 1.0, rotation: Math.PI * 2 },
];

/* ═══════════════ Main Showcase Component ═══════════════ */

export default function IncubatorShowcase() {
  const showcaseRef = useRef(null);
  const cameraTargets = useRef({ x: 4, y: 3, z: 4 });
  const modelRotation = useRef(0);
  const zoomValue = useRef(1.0);
  const mouseX = useRef(0);
  const [mounted, setMounted] = useState(false);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mount flag
  useEffect(() => { setMounted(true); }, []);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!mounted || !showcaseRef.current) return;
    let gsapModule, ScrollTriggerPlugin;

    async function initScrollTrigger() {
      gsapModule = (await import('gsap')).default || (await import('gsap'));
      const gsap = gsapModule.gsap || gsapModule;
      const stMod = await import('gsap/ScrollTrigger');
      ScrollTriggerPlugin = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTriggerPlugin);

      const container = showcaseRef.current;
      if (!container) return;

      // Create timelines for each section
      SECTIONS.forEach((section, i) => {
        const triggerEl = container.querySelector(`.${section.id}-move`);
        if (!triggerEl) return;

        const from = CAMERA_POSES[i];
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

      // Progress bars
      container.querySelectorAll('.showcase-section').forEach((section) => {
        const progressBar = section.querySelector('.sc-progress-bar');
        const progressWrapper = section.querySelector('.sc-progress-wrapper');
        if (!progressBar || !progressWrapper) return;

        gsap.from(progressBar, {
          scaleY: 0,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4,
            pin: progressWrapper,
            pinSpacing: false,
          },
        });
      });

      // Border radius scrubs
      container.querySelectorAll('.showcase-section').forEach((section) => {
        const isRight = section.classList.contains('right');

        gsap.to(section, {
          borderTopLeftRadius: isRight ? '0rem' : '1rem',
          borderBottomLeftRadius: isRight ? '0rem' : '1rem',
          borderTopRightRadius: isRight ? '1rem' : '0rem',
          borderBottomRightRadius: isRight ? '1rem' : '0rem',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top top',
            scrub: 0.6,
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
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div ref={showcaseRef} className="showcase-wrapper">
      {/* Transition Arrow */}
      <div className="showcase-hero">
        <div className="showcase-hero-content">
          <ChevronDown size={20} className="showcase-chevron" />
          <h2 className="showcase-hero-title">Product Showcase</h2>
          <p className="showcase-hero-sub">Scroll to explore the incubator</p>
          <ArrowDown size={16} className="showcase-arrow" />
        </div>
      </div>

      {/* Fixed WebGL Canvas */}
      <div className="showcase-experience">
        <Canvas
          camera={{ position: [4, 3, 4], fov: 35, near: 0.1, far: 100 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <color attach="background" args={['#111111']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow />
          <pointLight position={[-4, 5, -3]} intensity={0.3} color="#42a5f5" />
          <pointLight position={[3, 1, 4]} intensity={0.2} color="#4caf50" />
          <IncubatorScene
            cameraTargets={cameraTargets}
            modelRotation={modelRotation}
            zoomValue={zoomValue}
            mouseX={mouseX}
          />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Scrollable HTML overlay */}
      <div className="showcase-page">
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={section.id}>
              {/* Invisible tall trigger spacer */}
              <div className={`${section.id}-move section-margin`}></div>

              {/* Content section */}
              <section className={`showcase-section ${section.id}-section ${section.side}`}>
                {/* Progress bar */}
                <div className={`sc-progress-wrapper sc-progress-${section.side}`}>
                  <div className="sc-progress-bar"></div>
                </div>

                {/* Content */}
                <div className="sc-content">
                  <div className="sc-section-number">0{i + 1}</div>
                  <div className="sc-icon-wrap">
                    <Icon size={28} />
                  </div>
                  <h2 className="sc-title">{section.title}</h2>
                  <p className="sc-description">{section.description}</p>
                  <div className="sc-stats">
                    {section.stats.map((stat) => (
                      <div key={stat.label} className="sc-stat">
                        <div className="sc-stat-value">{stat.value}</div>
                        <div className="sc-stat-label">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div style={{ height: '50vh' }}></div>
      </div>
    </div>
  );
}
