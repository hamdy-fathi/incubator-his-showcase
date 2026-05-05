'use client';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GenericDeviceDashboard from '@/components/GenericDeviceDashboard';
import GenericDeviceShowcase from '@/components/GenericDeviceShowcase';
import { DeviceChart } from '@/components/Charts';
import {
  Wind, Activity, Gauge, Percent,
  Eye, Cpu, ShieldCheck, ClipboardList,
  SlidersHorizontal, CheckCheck, Send,
} from 'lucide-react';
import { useGLTF } from '@react-three/drei';

/* ─── preload ─── */
useGLTF.preload('/ventilator.glb');

/* ─── Showcase sections ─── */
const SECTIONS = [
  {
    id: 'first', side: 'left', icon: Eye,
    title: 'Intelligent Ventilation Control',
    description: 'Adaptive pressure and volume delivery for adult, pediatric, and neonatal patients. Real-time waveform analysis ensures optimal tidal volume and respiratory rate at all times.',
    stats: [
      { label: 'Tidal Volume Range', value: '50–2000 mL' },
      { label: 'Resp. Rate Range',   value: '1–80 BPM'   },
      { label: 'PEEP Range',         value: '0–30 cmH₂O' },
    ],
  },
  {
    id: 'second', side: 'right', icon: Cpu,
    title: 'IoT-Enabled Monitoring',
    description: 'Continuous data streaming via encrypted WebSocket protocol. Full integration with HIS/EHR systems for comprehensive patient respiratory management.',
    stats: [
      { label: 'Data Interval', value: '1s'       },
      { label: 'Protocol',      value: 'WSS'      },
      { label: 'Alarms',        value: 'ISO 9919' },
    ],
  },
  {
    id: 'third', side: 'left', icon: ShieldCheck,
    title: 'Triple-Redundant Safety',
    description: 'Multi-layer apnea detection, high-pressure relief, and disconnection alarms. Backup battery ensures uninterrupted operation during power transitions.',
    stats: [
      { label: 'Alarm Latency',  value: '<200ms'  },
      { label: 'Battery Backup', value: '4 hrs'   },
      { label: 'Uptime',         value: '99.98%'  },
    ],
  },
  {
    id: 'fourth', side: 'right', icon: ClipboardList,
    title: 'Clinical Specifications',
    description: 'Certified to IEC 60601-1 and ISO 80601-2-12. Supports CPAP, BiPAP, A/C, SIMV, and PSV modes with comprehensive trending and reporting tools.',
    stats: [
      { label: 'Standard', value: 'IEC 60601' },
      { label: 'Modes',    value: '7+'         },
      { label: 'Data Log', value: '30 days'   },
    ],
  },
];

/* ─── mock data ─── */
function generateReading() {
  const rate = +(14 + (Math.random() - 0.5) * 4).toFixed(1);
  const vol  = Math.round(480 + (Math.random() - 0.5) * 60);
  const peep = +(5 + (Math.random() - 0.5) * 1).toFixed(1);
  const fio2 = Math.round(40 + (Math.random() - 0.5) * 10);
  const ts   = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { ts, rate, vol, peep, fio2 };
}

function getStatus(rate) {
  if (rate > 24 || rate < 8)  return { status: 'critical', message: `CRITICAL: Respiratory rate ${rate} BPM` };
  if (rate > 20 || rate < 10) return { status: 'warning',  message: `WARNING: Rate slightly abnormal (${rate} BPM)` };
  return { status: 'normal', message: 'Respiratory parameters normal' };
}

/* ─── Remote control ─── */
function VentControl({ reading }) {
  const [rate, setRate] = useState(reading?.rate ?? 16);
  const [vol,  setVol]  = useState(reading?.vol  ?? 480);
  const [peep, setPeep] = useState(reading?.peep ?? 5);
  const [applied, setApplied] = useState(false);

  const sliderStyle = (val, min, max, color) => {
    const pct = ((val - min) / (max - min)) * 100;
    return { background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--bg-elevated) ${pct}%, var(--bg-elevated) 100%)` };
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title"><SlidersHorizontal size={14} />Remote Control</span>
        <span className="card-badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-muted)' }}>MANUAL</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Resp. Rate', value: rate, set: setRate, min: 8,   max: 30,  step: 1,   unit: 'BPM',   color: '#42a5f5' },
          { label: 'Tidal Vol',  value: vol,  set: setVol,  min: 200, max: 800, step: 10,  unit: 'mL',    color: '#4caf50' },
          { label: 'PEEP',       value: peep, set: setPeep, min: 0,   max: 20,  step: 0.5, unit: 'cmH₂O', color: '#ab47bc' },
        ].map((s) => (
          <div key={s.label} className="control-row">
            <span className="control-label" style={{ minWidth: 80 }}>{s.label}</span>
            <input type="range" className="control-slider"
              min={s.min} max={s.max} step={s.step} value={s.value}
              onChange={(e) => s.set(parseFloat(e.target.value))}
              style={sliderStyle(s.value, s.min, s.max, s.color)} />
            <span className="control-value" style={{ color: s.color, minWidth: 70, textAlign: 'right' }}>
              {Number.isInteger(s.step) ? s.value : s.value.toFixed(1)} {s.unit}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <button className="control-button" onClick={() => { setApplied(true); setTimeout(() => setApplied(false), 2000); }}
            style={applied ? { background: 'var(--status-normal)', color: '#111', borderColor: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: 6 } : { display: 'flex', alignItems: 'center', gap: 6 }}>
            {applied ? <><CheckCheck size={12} />Applied</> : <><Send size={12} />Apply Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function VentilatorPage() {
  const { user, loading } = useAuth();
  const [showShowcase, setShowShowcase] = useState(false);
  const [history, setHistory]           = useState(() => Array.from({ length: 30 }, generateReading));
  const [latest,  setLatest]            = useState(() => history[history.length - 1]);
  const [status,  setStatus]            = useState(getStatus(latest.rate));
  const [alerts,  setAlerts]            = useState([]);
  const [connected]                     = useState(false);

  const cameraTargets = useRef({ x: 4, y: 3, z: 4 });
  const modelRotation = useRef(0);
  const zoomValue     = useRef(1.0);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = generateReading();
      const s = getStatus(r.rate);
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
    { label: 'Resp. Rate',   icon: Activity, color: '#42a5f5', badgeBg: 'rgba(66,165,245,0.12)',  unit: ' BPM', range: 'Normal: 12–20 BPM', getValue: () => latest.rate?.toFixed(1) ?? '--' },
    { label: 'Tidal Volume', icon: Wind,     color: '#4caf50', badgeBg: 'rgba(76,175,80,0.12)',   unit: ' mL',  range: 'Target: 480 mL',    getValue: () => latest.vol  ?? '--' },
  ];

  const overlayCards = [
    { label: 'Rate', icon: Activity, value: latest.rate?.toFixed(1) ?? '--', unit: ' BPM',   color: '#42a5f5' },
    { label: 'PEEP', icon: Gauge,    value: latest.peep?.toFixed(1) ?? '--', unit: ' cmH₂O', color: '#ab47bc' },
  ];

  return (
    <>
      <GenericDeviceDashboard
        showCanvas={!showShowcase}
        user={user}
        deviceName="Ventilator"
        deviceSubtitle="Mechanical Ventilation Control"
        deviceIcon={Wind}
        accentColor="#42a5f5"
        modelPath="/ventilator.glb"
        status={status}
        alerts={alerts}
        connected={connected}
        clearAlerts={() => setAlerts([])}
        metrics={metrics}
        overlayCards={overlayCards}
        ChartsComponent={
          <>
            <DeviceChart
              data={history} dataKey="rate" label="Respiratory Rate" unit=" BPM"
              color="#42a5f5" domain={[6, 30]} ticks={[6, 10, 14, 18, 22, 26, 30]}
              safeMin={12} safeMax={20}
            />
            <DeviceChart
              data={history} dataKey="vol" label="Tidal Volume" unit=" mL"
              color="#4caf50" domain={[300, 700]} ticks={[300, 400, 480, 600, 700]}
              safeMin={400} safeMax={550}
            />
          </>
        }
        ControlsComponent={<VentControl reading={latest} />}
      />

      <GenericDeviceShowcase
        active={showShowcase}
        cameraTargets={cameraTargets}
        modelRotation={modelRotation}
        zoomValue={zoomValue}
        modelPath="/ventilator.glb"
        sections={SECTIONS}
        deviceLabel="Ventilator"
        accentColor="#42a5f5"
        pointLightColor="#42a5f5"
      />
    </>
  );
}
