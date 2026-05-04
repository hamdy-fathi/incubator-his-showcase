'use client';
import { Thermometer, Droplets, ShieldCheck, CircleAlert, TriangleAlert } from 'lucide-react';

const STATUS_CONFIG = {
  normal:   { Icon: ShieldCheck,  label: 'Normal',   color: 'var(--status-normal)',   bg: 'var(--status-normal-bg)',   border: '#2e5e34' },
  warning:  { Icon: TriangleAlert, label: 'Warning',  color: 'var(--status-warning)',  bg: 'var(--status-warning-bg)',  border: '#5e4a1a' },
  critical: { Icon: CircleAlert,   label: 'Critical', color: 'var(--status-critical)', bg: 'var(--status-critical-bg)', border: '#5e2828' },
};

export default function StatusIndicator({ status, latest }) {
  const s = status?.status || 'normal';
  const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.normal;
  const { Icon: StatusIcon } = cfg;

  return (
    <div className="status-row">

      {/* Temperature card */}
      <div className="card si-card" style={{ borderLeft: `3px solid var(--chart-temp)` }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <span className="card-title">
            <Thermometer size={14} style={{ color: 'var(--chart-temp)' }} />
            Temperature
          </span>
          <span className="card-badge" style={{ background: 'var(--chart-temp-fill)', color: 'var(--chart-temp)' }}>
            LIVE
          </span>
        </div>
        <div className="si-value" style={{ color: 'var(--chart-temp)' }}>
          {latest?.temperature?.toFixed(1) ?? '--.-'}
          <span className="si-unit">°C</span>
        </div>
        <div className="si-sub">Normal range: 36.0 – 38.0 °C</div>
      </div>

      {/* Humidity card */}
      <div className="card si-card" style={{ borderLeft: `3px solid var(--chart-humidity)` }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <span className="card-title">
            <Droplets size={14} style={{ color: 'var(--chart-humidity)' }} />
            Humidity
          </span>
          <span className="card-badge" style={{ background: 'var(--chart-humidity-fill)', color: 'var(--chart-humidity)' }}>
            LIVE
          </span>
        </div>
        <div className="si-value" style={{ color: 'var(--chart-humidity)' }}>
          {latest?.humidity ?? '--'}
          <span className="si-unit">%</span>
        </div>
        <div className="si-sub">Normal range: 40 – 80 %</div>
      </div>

      {/* System status card */}
      <div className="card si-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <span className="card-title">
            <StatusIcon size={14} style={{ color: cfg.color }} />
            System Status
          </span>
          {/* live pulse dot */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.5px',
            color: cfg.color,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: cfg.color,
              animation: s !== 'normal' ? 'pulse 1.4s infinite' : 'none',
              boxShadow: s !== 'normal' ? `0 0 6px ${cfg.color}` : 'none',
            }} />
            {cfg.label.toUpperCase()}
          </span>
        </div>

        {/* Big status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 8,
        }}>
          <StatusIcon size={20} style={{ color: cfg.color, marginRight: 8, flexShrink: 0 }} />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color, letterSpacing: '-0.01em' }}>
            {cfg.label}
          </span>
        </div>

        <div className="si-sub" style={{ textAlign: 'center' }}>
          {status?.message || 'Awaiting data…'}
        </div>
      </div>

    </div>
  );
}
