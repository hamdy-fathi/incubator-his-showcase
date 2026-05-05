'use client';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GenericDeviceDashboard from '@/components/GenericDeviceDashboard';
import GenericDeviceShowcase from '@/components/GenericDeviceShowcase';
import { DeviceChart } from '@/components/Charts';
import {
  Activity, Heart, Droplets, Gauge,
  Eye, Cpu, ShieldCheck, ClipboardList,
  SlidersHorizontal, CheckCheck, Send,
} from 'lucide-react';
import { useGLTF } from '@react-three/drei';

/* ─── preload ─── */
useGLTF.preload('/spo2.glb');

/* ─── Showcase sections ─── */
const SECTIONS = [
  {
    id: 'first', side: 'left', icon: Eye,
    title: 'Continuous SpO₂ Monitoring',
    description: 'Medical-grade pulse oximetry using dual-wavelength photoplethysmography for accurate oxygen saturation measurement. Motion-artifact rejection algorithm maintains accuracy even during patient movement.',
    stats: [
      { label: 'SpO₂ Range',  value: '70–100%' },
      { label: 'Accuracy',    value: '±1.5%'   },
      { label: 'Update Rate', value: '1 Hz'    },
    ],
  },
  {
    id: 'second', side: 'right', icon: Cpu,
    title: 'Plethysmographic Waveform',
    description: 'Real-time pleth waveform display with perfusion index and signal quality indicator. Advanced signal processing compensates for motion, ambient light, and low-perfusion states.',
    stats: [
      { label: 'Perfusion Index', value: '0.02–20%'  },
      { label: 'Signal Quality',  value: 'SQI Score' },
      { label: 'Low Perf. Mode',  value: 'Included'  },
    ],
  },
  {
    id: 'third', side: 'left', icon: ShieldCheck,
    title: 'Integrated Pulse Rate & PI',
    description: 'Simultaneous pulse rate measurement from 20–300 BPM with configurable high/low alarms. Perfusion index trending provides early warning of peripheral circulation changes.',
    stats: [
      { label: 'Pulse Rate Range', value: '20–300 BPM' },
      { label: 'Alarm Latency',    value: '<1s'         },
      { label: 'Battery Life',     value: '72 hrs'      },
    ],
  },
  {
    id: 'fourth', side: 'right', icon: ClipboardList,
    title: 'Clinical Certifications',
    description: 'ISO 80601-2-61 compliant with FDA 510(k) clearance. Supports neonatal, pediatric, and adult probes. Full trending, alarm history, and reporting for seamless clinical documentation.',
    stats: [
      { label: 'Standard',    value: 'ISO 80601' },
      { label: 'Probe Types', value: '3 sizes'   },
      { label: 'Data Log',    value: '72 hours'  },
    ],
  },
];

/* ─── mock data ─── */
function generateReading() {
  const spo2 = +(96 + (Math.random() - 0.5) * 6).toFixed(1);
  const pr   = Math.round(72 + (Math.random() - 0.5) * 20);
  const pi   = +(2 + Math.random() * 3).toFixed(2);
  const ts   = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { ts, spo2: Math.min(100, Math.max(70, spo2)), pr, pi };
}

function getStatus(spo2) {
  if (spo2 < 90) return { status: 'critical', message: `CRITICAL: SpO₂ critically low (${spo2}%)` };
  if (spo2 < 94) return { status: 'warning',  message: `WARNING: SpO₂ below normal (${spo2}%)` };
  return { status: 'normal', message: 'Oxygen saturation normal' };
}

/* ─── Remote control ─── */
function Spo2Control() {
  const [spo2Low, setSpo2Low] = useState(94);
  const [prHigh,  setPrHigh]  = useState(100);
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
          { label: 'SpO₂ Low Alarm', value: spo2Low, set: setSpo2Low, min: 80, max: 98,  step: 1, unit: '%',   color: '#26a69a' },
          { label: 'PR High Alarm',  value: prHigh,  set: setPrHigh,  min: 80, max: 180, step: 1, unit: 'BPM', color: '#ef5350' },
        ].map((s) => (
          <div key={s.label} className="control-row">
            <span className="control-label" style={{ minWidth: 110 }}>{s.label}</span>
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
export default function Spo2Page() {
  const { user, loading } = useAuth();
  const [showShowcase, setShowShowcase] = useState(false);
  const [history, setHistory]           = useState(() => Array.from({ length: 30 }, generateReading));
  const [latest,  setLatest]            = useState(() => history[history.length - 1]);
  const [status,  setStatus]            = useState(getStatus(latest.spo2));
  const [alerts,  setAlerts]            = useState([]);
  const [connected]                     = useState(false);

  const cameraTargets = useRef({ x: 4, y: 3, z: 4 });
  const modelRotation = useRef(0);
  const zoomValue     = useRef(1.0);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = generateReading();
      const s = getStatus(r.spo2);
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
    { label: 'SpO₂',       icon: Droplets, color: '#26a69a', badgeBg: 'rgba(38,166,154,0.12)', unit: '%',    range: 'Normal: ≥ 95%',      getValue: () => latest.spo2?.toFixed(1) ?? '--' },
    { label: 'Pulse Rate', icon: Heart,    color: '#ef5350', badgeBg: 'rgba(239,83,80,0.12)',  unit: ' BPM', range: 'Normal: 60–100 BPM', getValue: () => latest.pr  ?? '--' },
  ];

  const overlayCards = [
    { label: 'SpO₂', icon: Droplets, value: latest.spo2?.toFixed(1) ?? '--', unit: '%',    color: '#26a69a' },
    { label: 'PR',   icon: Heart,    value: latest.pr  ?? '--',               unit: ' BPM', color: '#ef5350' },
  ];

  return (
    <>
      <GenericDeviceDashboard
        showCanvas={!showShowcase}
        user={user}
        deviceName="SpO₂ Monitor"
        deviceSubtitle="Pulse Oximetry & Perfusion"
        deviceIcon={Activity}
        accentColor="#26a69a"
        modelPath="/spo2.glb"
        status={status}
        alerts={alerts}
        connected={connected}
        clearAlerts={() => setAlerts([])}
        metrics={metrics}
        overlayCards={overlayCards}
        ChartsComponent={
          <>
            <DeviceChart
              data={history} dataKey="spo2" label="SpO₂" unit="%"
              color="#26a69a" domain={[85, 100]} ticks={[85, 88, 91, 94, 97, 100]}
              safeMin={95} safeMax={100}
            />
            <DeviceChart
              data={history} dataKey="pr" label="Pulse Rate" unit=" BPM"
              color="#ef5350" domain={[40, 140]} ticks={[40, 60, 80, 100, 120, 140]}
              safeMin={60} safeMax={100}
            />
          </>
        }
        ControlsComponent={<Spo2Control />}
      />

      <GenericDeviceShowcase
        active={showShowcase}
        cameraTargets={cameraTargets}
        modelRotation={modelRotation}
        zoomValue={zoomValue}
        modelPath="/spo2.glb"
        sections={SECTIONS}
        deviceLabel="SpO₂ Monitor"
        accentColor="#26a69a"
        pointLightColor="#26a69a"
      />
    </>
  );
}
