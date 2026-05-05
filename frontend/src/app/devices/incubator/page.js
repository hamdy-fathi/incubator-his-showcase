'use client';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GenericDeviceDashboard from '@/components/GenericDeviceDashboard';
import GenericDeviceShowcase from '@/components/GenericDeviceShowcase';
import { TemperatureChart, HumidityChart } from '@/components/Charts';
import RemoteControl from '@/components/RemoteControl';
import { useIncubatorData } from '@/hooks/useIncubatorData';
import {
  HeartPulse, Thermometer, Droplets,
  Eye, Cpu, ShieldCheck, ClipboardList,
} from 'lucide-react';
import { useGLTF } from '@react-three/drei';

/* ─── preload ─── */
useGLTF.preload('/incubator.glb');

/* ─── Showcase sections (same content as old IncubatorShowcase) ─── */
const SECTIONS = [
  {
    id: 'first', side: 'left', icon: Eye,
    title: 'Advanced Neonatal Care',
    description: 'Precision-engineered incubation system providing optimal thermal regulation for premature and critically ill neonates. Continuous monitoring ensures stable microenvironment conditions.',
    stats: [
      { label: 'Temperature Accuracy', value: '±0.1°C' },
      { label: 'Response Time',        value: '<2s'     },
      { label: 'Humidity Range',       value: '40–80%'  },
    ],
  },
  {
    id: 'second', side: 'right', icon: Cpu,
    title: 'IoT-Enabled Technology',
    description: 'Real-time data transmission via WebSocket protocol with encrypted API communication. Seamless integration with hospital information systems and EHR platforms.',
    stats: [
      { label: 'Data Interval', value: '2s'      },
      { label: 'Protocol',      value: 'WSS'     },
      { label: 'Encryption',    value: 'AES-256' },
    ],
  },
  {
    id: 'third', side: 'left', icon: ShieldCheck,
    title: 'Multi-Layer Safety',
    description: 'Intelligent alert system with configurable thresholds. Automated escalation from warning to critical states with visual, audible, and remote notification channels.',
    stats: [
      { label: 'Alert Latency', value: '<500ms' },
      { label: 'Uptime',        value: '99.97%' },
      { label: 'Redundancy',    value: 'Triple' },
    ],
  },
  {
    id: 'fourth', side: 'right', icon: ClipboardList,
    title: 'Clinical Specifications',
    description: 'Medical-grade construction meeting IEC 60601-1 standards. Designed for NICU environments with full remote control capability and comprehensive data logging for clinical analysis.',
    stats: [
      { label: 'Standard',      value: 'IEC 60601' },
      { label: 'Data Retention', value: '90 days'  },
      { label: 'Remote Control', value: 'Full'     },
    ],
  },
];

/* ─── Page ─── */
export default function IncubatorPage() {
  const { user, loading } = useAuth();
  const [showShowcase, setShowShowcase] = useState(false);

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

  const cameraTargets = useRef({ x: 4, y: 3, z: 4 });
  const modelRotation = useRef(0);
  const zoomValue     = useRef(1.0);

  useEffect(() => {
    const onScroll = () => setShowShowcase(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading || !user) return null;

  const metrics = [
    {
      label: 'Temperature', icon: Thermometer,
      color: 'var(--chart-temp)', badgeBg: 'var(--chart-temp-fill)',
      unit: '°C', range: 'Normal range: 36.0 – 38.0 °C',
      getValue: () => latest?.temperature?.toFixed(1) ?? '--.-',
    },
    {
      label: 'Humidity', icon: Droplets,
      color: 'var(--chart-humidity)', badgeBg: 'var(--chart-humidity-fill)',
      unit: '%', range: 'Normal range: 40 – 80 %',
      getValue: () => latest?.humidity ?? '--',
    },
  ];

  const overlayCards = [
    { label: 'Temperature', icon: Thermometer, value: latest?.temperature?.toFixed(1) ?? '--.-', unit: '°C', color: 'var(--chart-temp)' },
    { label: 'Humidity',    icon: Droplets,    value: latest?.humidity ?? '--',                  unit: '%',  color: 'var(--chart-humidity)' },
  ];

  return (
    <>
      <GenericDeviceDashboard
        showCanvas={!showShowcase}
        user={user}
        deviceName="Team #3 Project"
        deviceSubtitle="Neonatal Monitoring"
        deviceIcon={HeartPulse}
        accentColor="#e05555"
        modelPath="/incubator.glb"
        status={status}
        alerts={alerts}
        connected={connected}
        clearAlerts={clearAlerts}
        metrics={metrics}
        overlayCards={overlayCards}
        ChartsComponent={
          <>
            <TemperatureChart data={history} />
            <HumidityChart    data={history} />
          </>
        }
        ControlsComponent={
          <RemoteControl settings={settings} onUpdate={updateSettings} />
        }
      />

      <GenericDeviceShowcase
        active={showShowcase}
        cameraTargets={cameraTargets}
        modelRotation={modelRotation}
        zoomValue={zoomValue}
        modelPath="/incubator.glb"
        sections={SECTIONS}
        deviceLabel="Incubator"
        accentColor="#e05555"
        pointLightColor="#4caf50"
      />
    </>
  );
}
