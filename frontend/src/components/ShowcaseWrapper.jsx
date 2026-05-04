'use client';
import dynamic from 'next/dynamic';

const IncubatorShowcase = dynamic(
  () => import('@/components/IncubatorShowcase'),
  { ssr: false }
);

export default function ShowcaseWrapper() {
  return <IncubatorShowcase />;
}
