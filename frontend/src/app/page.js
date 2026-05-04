'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HeartPulse, LayoutDashboard, Box, Wrench,
  LogOut, Clock, ChevronRight, Circle,
  Activity, Wind, Monitor, Syringe, Stethoscope,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  Thermometer, Droplets, Zap, BarChart3, Calendar,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

/* ══════════════ DATA ══════════════ */

const DEVICES = [
  {
    id: 'incubator', name: 'Smart Incubator',
    description: 'Neonatal temperature & humidity monitoring with 3D visualization',
    icon: HeartPulse, href: '/devices/incubator', status: 'online', accent: '#e05555',
    stats: [{ label: 'Temp', value: '36.8°C' }, { label: 'Humidity', value: '62%' }],
    active: true, location: 'NICU — Bay 3', serial: 'INC-2024-0031',
    lastMaintenance: '2026-04-15', nextMaintenance: '2026-07-15',
  },
  {
    id: 'ventilator', name: 'Ventilator',
    description: 'Mechanical ventilation control & respiratory monitoring',
    icon: Wind, href: null, status: 'offline', accent: '#42a5f5',
    stats: [{ label: 'Mode', value: '—' }, { label: 'Rate', value: '—' }],
    active: false, location: 'ICU — Room 12', serial: 'VNT-2024-0087',
    lastMaintenance: '2026-03-20', nextMaintenance: '2026-06-20',
  },
  {
    id: 'patient-monitor', name: 'Patient Monitor',
    description: 'Vitals tracking — ECG, SpO₂, blood pressure, heart rate',
    icon: Monitor, href: null, status: 'offline', accent: '#4caf50',
    stats: [{ label: 'HR', value: '—' }, { label: 'SpO₂', value: '—' }],
    active: false, location: 'ICU — Room 8', serial: 'PMN-2024-0142',
    lastMaintenance: '2026-04-01', nextMaintenance: '2026-07-01',
  },
  {
    id: 'infusion-pump', name: 'Infusion Pump',
    description: 'IV fluid delivery management & dosage tracking',
    icon: Syringe, href: null, status: 'offline', accent: '#ffb300',
    stats: [{ label: 'Rate', value: '—' }, { label: 'Vol', value: '—' }],
    active: false, location: 'Ward B — Bed 5', serial: 'INF-2024-0215',
    lastMaintenance: '2026-02-10', nextMaintenance: '2026-05-10',
  },
  {
    id: 'ecg', name: 'ECG Monitor',
    description: '12-lead electrocardiogram with real-time waveform display',
    icon: Activity, href: null, status: 'offline', accent: '#ab47bc',
    stats: [{ label: 'Lead', value: '—' }, { label: 'BPM', value: '—' }],
    active: false, location: 'Cardiology — Lab 2', serial: 'ECG-2024-0064',
    lastMaintenance: '2026-04-22', nextMaintenance: '2026-07-22',
  },
  {
    id: 'diagnostic', name: 'Diagnostic Suite',
    description: 'Lab results integration & clinical decision support',
    icon: Stethoscope, href: null, status: 'offline', accent: '#26a69a',
    stats: [{ label: 'Tests', value: '—' }, { label: 'Alerts', value: '—' }],
    active: false, location: 'Lab — Floor 2', serial: 'DGN-2024-0008',
    lastMaintenance: '2026-03-05', nextMaintenance: '2026-06-05',
  },
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'equipment', label: 'Equipment', icon: Box },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
];

const MAINTENANCE_LOG = [
  { id: 1, device: 'Smart Incubator', type: 'Preventive', date: '2026-04-15', status: 'completed', tech: 'Ahmed Hassan', notes: 'Sensor calibration, filter replacement' },
  { id: 2, device: 'Ventilator', type: 'Corrective', date: '2026-03-20', status: 'completed', tech: 'Sara Ali', notes: 'Pressure valve repair' },
  { id: 3, device: 'Patient Monitor', type: 'Preventive', date: '2026-04-01', status: 'completed', tech: 'Omar Khaled', notes: 'Software update, cable inspection' },
  { id: 4, device: 'Infusion Pump', type: 'Preventive', date: '2026-05-10', status: 'scheduled', tech: 'Ahmed Hassan', notes: 'Flow rate calibration' },
  { id: 5, device: 'Smart Incubator', type: 'Inspection', date: '2026-05-20', status: 'scheduled', tech: 'Sara Ali', notes: 'Quarterly safety inspection' },
  { id: 6, device: 'ECG Monitor', type: 'Corrective', date: '2026-05-02', status: 'in-progress', tech: 'Omar Khaled', notes: 'Lead connector replacement' },
];

/* ══════════════ OVERVIEW VIEW ══════════════ */

function OverviewView({ router }) {
  const kpis = [
    { label: 'Total Devices', value: '6', sub: 'Registered', icon: Box, color: '#42a5f5' },
    { label: 'Online', value: '1', sub: '16.7%', icon: CheckCircle2, color: '#4caf50' },
    { label: 'Alerts', value: '3', sub: 'Active', icon: AlertTriangle, color: '#ffb300' },
    { label: 'Uptime', value: '99.2%', sub: 'This month', icon: TrendingUp, color: '#ab47bc' },
  ];

  return (
    <div className="ov-view">
      {/* KPI Row */}
      <div className="ov-kpi-row">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="ov-kpi">
              <div className="ov-kpi-icon" style={{ color: k.color, background: k.color + '12' }}>
                <Icon size={18} />
              </div>
              <div className="ov-kpi-data">
                <span className="ov-kpi-value">{k.value}</span>
                <span className="ov-kpi-label">{k.label}</span>
              </div>
              <span className="ov-kpi-sub">{k.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="ov-charts-row">
        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <h3>Temperature Trend</h3>
            <span className="ov-chart-badge up"><ArrowUpRight size={12} /> 0.3°C</span>
          </div>
          <div className="ov-chart-body">
            <div className="ov-sparkline">
              {[36.2, 36.5, 36.8, 36.6, 36.9, 37.0, 36.8, 36.7, 36.8].map((v, i) => (
                <div key={i} className="ov-spark-bar" style={{ height: `${((v - 35.5) / 2) * 100}%` }}>
                  <span className="ov-spark-tip">{v}°C</span>
                </div>
              ))}
            </div>
            <div className="ov-chart-labels">
              <span>8h ago</span><span>Now</span>
            </div>
          </div>
        </div>

        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <h3>Humidity Trend</h3>
            <span className="ov-chart-badge down"><ArrowDownRight size={12} /> 2%</span>
          </div>
          <div className="ov-chart-body">
            <div className="ov-sparkline">
              {[65, 64, 63, 62, 61, 62, 63, 62, 62].map((v, i) => (
                <div key={i} className="ov-spark-bar humidity" style={{ height: `${((v - 50) / 20) * 100}%` }}>
                  <span className="ov-spark-tip">{v}%</span>
                </div>
              ))}
            </div>
            <div className="ov-chart-labels">
              <span>8h ago</span><span>Now</span>
            </div>
          </div>
        </div>

        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <h3>Device Status</h3>
          </div>
          <div className="ov-chart-body">
            <div className="ov-donut-row">
              <div className="ov-donut">
                <svg viewBox="0 0 36 36" className="ov-donut-svg">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#1e1e24" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#4caf50" strokeWidth="3" strokeDasharray="16.7, 100" />
                </svg>
                <span className="ov-donut-label">1/6</span>
              </div>
              <div className="ov-donut-legend">
                <div><Circle size={8} fill="#4caf50" stroke="none" /> Online (1)</div>
                <div><Circle size={8} fill="#555" stroke="none" /> Offline (5)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status */}
      <div className="ov-section">
        <h3 className="ov-section-title">Device Indicators</h3>
        <div className="ov-indicators">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                className={`ov-indicator ${d.active ? 'active' : ''}`}
                onClick={() => d.href && router.push(d.href)}
                role={d.active ? 'button' : undefined}
              >
                <div className="ov-ind-icon" style={{ color: d.accent }}><Icon size={16} /></div>
                <div className="ov-ind-info">
                  <span className="ov-ind-name">{d.name}</span>
                  <span className="ov-ind-loc">{d.location}</span>
                </div>
                <div className={`ov-ind-status ${d.status}`}>
                  <Circle size={6} fill="currentColor" />
                  {d.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════ EQUIPMENT VIEW ══════════════ */

function EquipmentView({ router }) {
  return (
    <div className="eq-view">
      <div className="eq-header-row">
        <h3 className="ov-section-title">Equipment Inventory</h3>
        <span className="eq-count">{DEVICES.length} devices</span>
      </div>
      <div className="eq-grid">
        {DEVICES.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              className={`hub-card ${d.active ? 'active' : 'inactive'}`}
              onClick={() => d.href && router.push(d.href)}
              disabled={!d.active}
            >
              <div className="hub-card-accent" style={{ background: d.accent }} />
              <div className="hub-card-top">
                <div className="hub-card-icon" style={{ color: d.accent }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className={`hub-card-status ${d.status}`}>
                  <Circle size={6} fill="currentColor" />
                  {d.status === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="hub-card-body">
                <h3 className="hub-card-name">{d.name}</h3>
                <p className="hub-card-desc">{d.description}</p>
              </div>
              <div className="eq-meta">
                <span>{d.location}</span>
                <span>SN: {d.serial}</span>
              </div>
              <div className="hub-card-stats">
                {d.stats.map((s, i) => (
                  <div key={i} className="hub-card-stat">
                    <span className="hub-stat-label">{s.label}</span>
                    <span className="hub-stat-value">{s.value}</span>
                  </div>
                ))}
              </div>
              {d.active && (
                <div className="hub-card-action">Open Dashboard <ChevronRight size={14} /></div>
              )}
              {!d.active && (
                <div className="hub-card-coming">Coming Soon</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════ MAINTENANCE VIEW ══════════════ */

function MaintenanceView() {
  return (
    <div className="mt-view">
      {/* Summary cards */}
      <div className="mt-summary">
        <div className="mt-sum-card">
          <CheckCircle2 size={18} className="mt-sum-icon completed" />
          <div>
            <span className="mt-sum-value">{MAINTENANCE_LOG.filter(m => m.status === 'completed').length}</span>
            <span className="mt-sum-label">Completed</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <Calendar size={18} className="mt-sum-icon scheduled" />
          <div>
            <span className="mt-sum-value">{MAINTENANCE_LOG.filter(m => m.status === 'scheduled').length}</span>
            <span className="mt-sum-label">Scheduled</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <Wrench size={18} className="mt-sum-icon in-progress" />
          <div>
            <span className="mt-sum-value">{MAINTENANCE_LOG.filter(m => m.status === 'in-progress').length}</span>
            <span className="mt-sum-label">In Progress</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-table-wrap">
        <h3 className="ov-section-title">Maintenance Log</h3>
        <table className="mt-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Type</th>
              <th>Date</th>
              <th>Technician</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MAINTENANCE_LOG.map((m) => (
              <tr key={m.id}>
                <td className="mt-device">{m.device}</td>
                <td><span className={`mt-type-badge ${m.type.toLowerCase()}`}>{m.type}</span></td>
                <td className="mt-date">{m.date}</td>
                <td>{m.tech}</td>
                <td className="mt-notes">{m.notes}</td>
                <td>
                  <span className={`mt-status-badge ${m.status}`}>
                    {m.status === 'completed' && <CheckCircle2 size={11} />}
                    {m.status === 'scheduled' && <Calendar size={11} />}
                    {m.status === 'in-progress' && <Wrench size={11} />}
                    {m.status.replace('-', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════ MAIN PAGE ══════════════ */

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [view, setView] = useState('overview');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (loading || !user) return null;

  return (
    <div className="his-layout">
      {/* ── Sidebar ── */}
      <aside className="his-sidebar">
        <div className="his-sb-top">
          <div className="his-sb-logo">
            <HeartPulse size={20} strokeWidth={2.5} />
          </div>
          <div className="his-sb-brand">
            <span className="his-sb-name">HIS</span>
            <span className="his-sb-sub">Team #3</span>
          </div>
        </div>

        <nav className="his-sb-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`his-sb-item ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="his-sb-bottom">
          <div className="his-sb-user">
            <div className="his-sb-avatar">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="his-sb-user-info">
              <span className="his-sb-user-name">{user.fullName}</span>
              <span className="his-sb-user-role">{user.role}</span>
            </div>
          </div>
          <button className="his-sb-logout" onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="his-main">
        <header className="his-topbar">
          <h2 className="his-topbar-title">
            {NAV_ITEMS.find(n => n.id === view)?.label}
          </h2>
          <div className="his-topbar-right">
            <div className="his-topbar-time">
              <Clock size={13} />
              {currentTime}
            </div>
          </div>
        </header>

        <div className="his-content">
          {view === 'overview' && <OverviewView router={router} />}
          {view === 'equipment' && <EquipmentView router={router} />}
          {view === 'maintenance' && <MaintenanceView />}
        </div>
      </main>
    </div>
  );
}
