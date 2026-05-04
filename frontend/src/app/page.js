'use client';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import IncubatorShowcase from '@/components/IncubatorShowcase';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [showShowcase, setShowShowcase] = useState(false);

  // Camera refs driven by GSAP in IncubatorShowcase
  const cameraTargets = useRef({ x: 4, y: 3, z: 4 });
  const modelRotation = useRef(0);
  const zoomValue = useRef(1.0);

  // Simple scroll-based mode switch — dashboard canvas until scrolled past it
  useEffect(() => {
    function onScroll() {
      const threshold = window.innerHeight * 0.7;
      setShowShowcase(window.scrollY > threshold);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Show nothing while auth is loading or if not authenticated
  if (loading || !user) return null;

  return (
    <>
      <Dashboard showCanvas={!showShowcase} user={user} />

      <IncubatorShowcase
        active={showShowcase}
        cameraTargets={cameraTargets}
        modelRotation={modelRotation}
        zoomValue={zoomValue}
      />
    </>
  );
}
