'use client';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GenericDeviceDashboard from '@/components/GenericDeviceDashboard';
import GenericDeviceShowcase from '@/components/GenericDeviceShowcase';
import { DeviceChart } from '@/components/Charts';
import {
  Activity, Heart, Zap, Gauge,
  Eye, Cpu, ShieldCheck, ClipboardList,
  SlidersHorizontal, CheckCheck, Send,
} from 'lucide-react';
import { useGLTF } from '@react-three/drei';

/* ─── preload ─── */
useGLTF.preload('/ecg.glb');

/* ─── Showcase sections ─── */
const SECTIONS = [
  {
    id: 'first', side: 'left', icon: Eye,
    title: '12-Lead ECG Acquisition',
    description: 'Hospital-grade 12-lead electrocardiography with continuous waveform capture at 1000 Hz sampling rate. Advanced artifact filtering eliminates noise from movement and electrical interference.',
    stats: [
      { label: 'Sampling Rate', value: '1000 Hz' },
      { label: 'Leads',         value: '12-lead'  },
      { label: 'Resolution',    value: '24-bit'   },
    ],
  },
  {
    id: 'second', side: 'right', icon: Cpu,
    title: 'AI-Driven Arrhythmia Detection',
    description: 'On-device neural network classifies 20+ arrhythmia types in real time with sub-second latency. Continuous PR, QRS, and QT interval measurement for comprehensive cardiac analysis.',
    stats: [
      { label: 'Arrhythmia Types', value: '20+'    },
      { label: 'Detection Lag',    value: '<500ms' },
      { label: 'Accuracy',         value: '98.7%'  },
    ],
  },
  {
    id: 'third', side: 'left', icon: ShieldCheck,
    title: 'Patient Safety Alarms',
    description: 'Multi-tier alarm system with configurable HR, ST-segment, and QT thresholds. Silent and audible escalation modes with nurse-call integration and remote mobile notifications.',
    stats: [
      { label: 'Alarm Latency', value: '<300ms'  },
      { label: 'ST Resolution', value: '0.05 mV' },
      { label: 'Isolation',     value: 'CF Type' },
    ],
  },
  {
    id: 'fourth', side: 'right', icon: ClipboardList,
    title: 'Clinical-Grade Specifications',
    description: 'IEC 60601-1 certified with defibrillation protection. Integrated interpretation reports, trending, and one-click PDF export for seamless clinical workflow integration.',
    stats: [
      { label: 'Standard', value: 'IEC 60601'  },
      { label: 'Data Log', value: '72 hours'   },
      { label: 'Report',   value: 'PDF Export' },
    ],
  },
];

/* ─── mock data ─── */
function generateReading() {
  const bpm = Math.round(68 + (Math.random() - 0.5) * 20);
  const qt  = Math.round(380 + (Math.random() - 0.5) * 40);
  const pr  = Math.round(160 + (Math.random() - 0.5) * 20);
  const st  = +(0.05 * (Math.random() - 0.5)).toFixed(3);
  const ts  = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { ts, bpm, qt, pr, st };
}

function getStatus(bpm) {
  if (bpm > 120 || bpm < 40) return { status: 'critical', message: `CRITICAL: Heart rate ${bpm} BPM` };
  if (bpm > 100 || bpm < 50) return { status: 'warning',  message: `WARNING: Abnormal heart rate (${bpm} BPM)` };
  return { status: 'normal', message: 'Cardiac rhythm normal' };
}

/* ─── Remote control ─── */
function EcgControl() {
  const [hrHigh, setHrHigh] = useState(100);
  const [hrLow,  setHrLow]  = useState(50);
  const [applied, setApplied] = useState(false);

  const sliderStyle = (val, min, max, color) => {
    const pct = ((val - min) / (max - min)) * 100;
    return { background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--bg-elevated) ${pct}%, var(--bg-elevated) 100%)` };
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title"><SlidersHorizontal size={14} />Alarm Thresholds</span>
        <span className="card-badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-muted)' }}>MANUAL</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'HR High Alarm', value: hrHigh, set: setHrHigh, min: 80,  max: 180, step: 1, unit: 'BPM', color: '#ef5350' },
          { label: 'HR Low Alarm',  value: hrLow,  set: setHrLow,  min: 30,  max: 70,  step: 1, unit: 'BPM', color: '#42a5f5' },
        ].map((s) => (
          <div key={s.label} className="control-row">
            <span className="control-label" style={{ minWidth: 100 }}>{s.label}</span>
            <input type="range" className="control-slider"
              min={s.min} max={s.max} step={s.step} value={s.value}
              onChange={(e) => s.set(parseInt(e.target.value))}
              style={sliderStyle(s.value, s.min, s.max, s.color)} />
            <span className="control-value" style={{ color: s.color, minWidth: 60, textAlign: 'right' }}>
              {s.value} {s.unit}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <button className="control-button"
            onClick={() => { setApplied(true); setTimeout(() => setApplied(false), 2000); }}
            style={applied ? { background: 'var(--status-normal)', color: '#111', borderColor: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: 6 } : { display: 'flex', alignItems: 'center', gap: 6 }}>
            {applied ? <><CheckCheck size={12} />Applied</> : <><Send size={12} />Apply Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function EcgPage() {
  const { user, loading } = useAuth();
  const [showShowcase, setShowShowcase] = useState(false);
  const [history, setHistory]           = useState(() => Array.from({ length: 30 }, generateReading));
  const [latest,  setLatest]            = useState(() => history[history.length - 1]);
  const [status,  setStatus]            = useState(getStatus(latest.bpm));
  const [alerts,  setAlerts]            = useState([]);
  const [connected]                     = useState(false);

  const cameraTargets = useRef({ x: 4, y: 3, z: 4 });
  const modelRotation = useRef(0);
  const zoomValue     = useRef(1.0);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = generateReading();
      const s = getStatus(r.bpm);
      setLatest(r);
      setStatus(s);
      setHistory((prev) => [...prev.slice(-99), r]);
      if (s.status !== 'normal') {
        setAlerts((prev) => [{ id: Date.now(), ...s, timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowShowcase(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading || !user) return null;

  const metrics = [
    { label: 'Heart Rate',  icon: Heart,    color: '#ef5350', badgeBg: 'rgba(239,83,80,0.12)',   unit: ' BPM', range: 'Normal: 60–100 BPM', getValue: () => latest.bpm ?? '--' },
    { label: 'QT Interval', icon: Zap,      color: '#ab47bc', badgeBg: 'rgba(171,71,188,0.12)',  unit: ' ms',  range: 'Normal: 350–450 ms',  getValue: () => latest.qt  ?? '--' },
  ];

  const overlayCards = [
    { label: 'HR', icon: Heart, value: latest.bpm ?? '--', unit: ' BPM', color: '#ef5350' },
    { label: 'QT', icon: Zap,   value: latest.qt  ?? '--', unit: ' ms',  color: '#ab47bc' },
  ];

  return (
    <>
      <GenericDeviceDashboard
        showCanvas={!showShowcase}
        user={user}
        deviceName="ECG Monitor"
        deviceSubtitle="12-Lead Electrocardiography"
        deviceIcon={Activity}
        accentColor="#ab47bc"
        modelPath="/ecg.glb"
        status={status}
        alerts={alerts}
        connected={connected}
        clearAlerts={() => setAlerts([])}
        metrics={metrics}
        overlayCards={overlayCards}
        ChartsComponent={
          <>
            <DeviceChart
              data={history} dataKey="bpm" label="Heart Rate" unit=" BPM"
              color="#ef5350" domain={[30, 150]} ticks={[40, 60, 80, 100, 120, 140]}
              safeMin={60} safeMax={100}
            />
            <DeviceChart
              data={history} dataKey="qt" label="QT Interval" unit=" ms"
              color="#ab47bc" domain={[300, 500]} ticks={[300, 350, 400, 450, 500]}
              safeMin={350} safeMax={450}
            />
          </>
        }
        ControlsComponent={<EcgControl />}
      />

      <GenericDeviceShowcase
        active={showShowcase}
        cameraTargets={cameraTargets}
        modelRotation={modelRotation}
        zoomValue={zoomValue}
        modelPath="/ecg.glb"
        sections={SECTIONS}
        deviceLabel="ECG Monitor"
        accentColor="#ab47bc"
        pointLightColor="#ab47bc"
      />
    </>
  );
}
