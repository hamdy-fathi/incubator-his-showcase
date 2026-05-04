'use client';
import { useRef, useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import IncubatorShowcase from '@/components/IncubatorShowcase';

export default function HomePage() {
  const [showShowcase, setShowShowcase] = useState(false);
  const showcaseRef = useRef(null);

  // Camera refs driven by GSAP in IncubatorShowcase
  const cameraTargets = useRef({ x: 4, y: 3, z: 4 });
  const modelRotation = useRef(0);
  const zoomValue = useRef(1.0);

  // Detect when showcase section enters viewport
  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowShowcase(entry.isIntersecting);
      },
      { threshold: 0.01, rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Dashboard showCanvas={!showShowcase} />

      <div ref={showcaseRef}>
        <IncubatorShowcase
          active={showShowcase}
          cameraTargets={cameraTargets}
          modelRotation={modelRotation}
          zoomValue={zoomValue}
        />
      </div>
    </>
  );
}
