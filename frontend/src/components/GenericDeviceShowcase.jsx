'use client';
import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, useGLTF, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronDown, ArrowDown } from 'lucide-react';

/* ═══════════════ 3D Scene ═══════════════ */

function DeviceScene({ modelPath, cameraTargets, modelRotation, zoomValue, mouseX, accentColor }) {
  const groupRef = useRef();
  const modelRef = useRef();
  const { camera } = useThree();
  const { scene } = useGLTF(modelPath);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        if (child.material) child.material = child.material.clone();
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Auto-fit
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 3;
    const s = maxDim > 0 ? targetSize / maxDim : 1;
    return { scale: s, offset: center.multiplyScalar(-s) };
  }, [model]);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetMouseY = (mouseX?.current || 0) * 0.3;
    groupRef.current.rotation.y += (targetMouseY - groupRef.current.rotation.y) * 0.05;

    if (modelRef.current && modelRotation?.current !== undefined) {
      modelRef.current.rotation.y += (modelRotation.current - modelRef.current.rotation.y) * 0.08;
    }

    const ct = cameraTargets.current;
    camera.position.x += (ct.x - camera.position.x) * 0.06;
    camera.position.y += (ct.y - camera.position.y) * 0.06;
    camera.position.z += (ct.z - camera.position.z) * 0.06;

    if (zoomValue?.current !== undefined) {
      camera.zoom += (zoomValue.current - camera.zoom) * 0.06;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef} scale={scale} position={[offset.x, offset.y, offset.z]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px',
        padding: '16px 24px', color: 'var(--accent)', fontSize: '0.85rem',
      }}>
        Loading 3D Model...
      </div>
    </Html>
  );
}

/* ═══════════════ Camera poses ═══════════════ */

const CAMERA_POSES = [
  { x: 4, y: 3, z: 4, zoom: 1.0, rotation: 0 },
  { x: 5, y: 2, z: 2, zoom: 1.8, rotation: Math.PI * 0.25 },
  { x: 0, y: 5, z: 3, zoom: 1.7, rotation: Math.PI * 0.5 },
  { x: -4, y: 2, z: 3, zoom: 1.2, rotation: Math.PI },
  { x: 4, y: 3, z: 4, zoom: 2, rotation: Math.PI * 2 },
  { x: 4, y: 3, z: 4, zoom: 1.0, rotation: Math.PI * 2.25 },
];

/* ═══════════════ Main Component ═══════════════ */

export default function GenericDeviceShowcase({
  active,
  cameraTargets,
  modelRotation,
  zoomValue,
  modelPath,
  sections,
  deviceLabel,
  teamNumber = '6',
  accentColor = '#4fc3f7',
  pointLightColor = '#4caf50',
}) {
  const showcaseRef = useRef(null);
  const mouseX = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [showBg, setShowBg] = useState('#111111');

  useEffect(() => {
    function updateShowBg() {
      setShowBg(document.documentElement.getAttribute('data-theme') === 'light' ? '#f0f2f5' : '#111111');
    }
    updateShowBg();
    const observer = new MutationObserver(updateShowBg);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

      sections.forEach((section, i) => {
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

      container.querySelectorAll('.sc-sticky-card').forEach((card) => {
        const runway = card.closest('.sc-scroll-runway');
        if (!runway) return;
        ScrollTriggerPlugin.create({
          trigger: card,
          start: 'top top',
          end: () => `+=${runway.offsetHeight}`,
          pin: true,
          pinSpacing: false,
        });
      });

      const finaleEl = container.querySelector('.sc-finale-runway');
      const finaleSticky = container.querySelector('.sc-finale-sticky');
      if (finaleEl && finaleSticky) {
        const finalPose = CAMERA_POSES[CAMERA_POSES.length - 1];
        gsap.timeline({
          scrollTrigger: {
            trigger: finaleEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
          .to(cameraTargets.current, { x: finalPose.x, y: finalPose.y, z: finalPose.z }, 'same')
          .to(zoomValue, { current: finalPose.zoom }, 'same')
          .to(modelRotation, { current: finalPose.rotation }, 'same');

        ScrollTriggerPlugin.create({
          trigger: finaleSticky,
          start: 'top top',
          end: () => `+=${finaleEl.offsetHeight}`,
          pin: true,
          pinSpacing: false,
        });
      }

      ScrollTriggerPlugin.refresh();
    }

    initScrollTrigger();

    return () => {
      if (ScrollTriggerPlugin) {
        ScrollTriggerPlugin.getAll().forEach((st) => st.kill());
      }
    };
  }, [mounted, cameraTargets, modelRotation, zoomValue, sections]);

  if (!mounted) return null;

  return (
    <div ref={showcaseRef} className="showcase-wrapper">
      {/* Transition hero */}
      <div className="showcase-hero">
        <div className="showcase-hero-content">
          <ChevronDown size={20} className="showcase-chevron" />
          <h2 className="showcase-hero-title">Product Showcase</h2>
          <p className="showcase-hero-sub">Scroll to explore the {deviceLabel}</p>
          <ArrowDown size={16} className="showcase-arrow" />
        </div>
      </div>

      {/* Fixed 3D Canvas */}
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
            <color attach="background" args={[showBg]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
            <pointLight position={[-4, 5, -3]} intensity={0.4} color="#42a5f5" />
            <pointLight position={[3, 1, 4]} intensity={0.2} color={pointLightColor} />
            <Suspense fallback={<LoadingFallback />}>
              <DeviceScene
                modelPath={modelPath}
                cameraTargets={cameraTargets}
                modelRotation={modelRotation}
                zoomValue={zoomValue}
                mouseX={mouseX}
                accentColor={accentColor}
              />
              <Environment preset="city" />
            </Suspense>
            <ContactShadows position={[0, -2.0, 0]} opacity={0.3} scale={10} blur={2} />
          </Canvas>
        </div>
      )}

      {/* Scrollable overlay */}
      <div className="showcase-page">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className={`sc-scroll-runway ${section.id}-move`}>
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
                    {section.stats.map((stat) => (
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

        {/* Finale */}
        <div className="sc-finale-runway">
          <div className="sc-finale-sticky">
            <div className="finale-text-left">
              <span className="finale-title">TEAM</span>
              <span className="finale-num">{teamNumber}</span>
            </div>
            <div className="finale-text-right">
              <span className="finale-title">THE</span>
              <span className="finale-title">{deviceLabel.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div style={{ height: '30vh' }} />
      </div>
    </div>
  );
}
