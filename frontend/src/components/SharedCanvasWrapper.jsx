'use client';
import dynamic from 'next/dynamic';

const SharedCanvas = dynamic(() => import('@/components/SharedCanvas'), {
  ssr: false,
  loading: () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading 3D Incubator Model...</div>
    </div>
  ),
});

export default SharedCanvas;
