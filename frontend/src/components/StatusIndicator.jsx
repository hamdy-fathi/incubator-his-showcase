'use client';
import { Thermometer, Droplets, MonitorCheck, ShieldCheck, CircleAlert, TriangleAlert } from 'lucide-react';

export default function StatusIndicator({ status, latest }) {
  const statusConfig = {
    normal: { icon: ShieldCheck, label: 'Normal', color: 'var(--status-normal)' },
    warning: { icon: TriangleAlert, label: 'Warning', color: 'var(--status-warning)' },
    critical: { icon: CircleAlert, label: 'Critical', color: 'var(--status-critical)' },
  };

  const config = statusConfig[status?.status] || statusConfig.normal;
  const StatusIcon = config.icon;

  return (
    <div className="status-row">
      <div className={`status-card ${status?.status || 'normal'}`}>
        <div className="status-icon icon-temp">
          <Thermometer />
        </div>
        <div className="status-label">Temperature</div>
        <div className="status-value temp">
          {latest?.temperature?.toFixed(1) || '--.-'}
          <span className="overlay-unit">°C</span>
        </div>
        <div className="status-sub">Range: 36.0 – 38.0°C</div>
      </div>
      <div className={`status-card ${status?.status || 'normal'}`}>
        <div className="status-icon icon-humidity">
          <Droplets />
        </div>
        <div className="status-label">Humidity</div>
        <div className="status-value humidity">
          {latest?.humidity || '--'}
          <span className="overlay-unit">%</span>
        </div>
        <div className="status-sub">Range: 40 – 80%</div>
      </div>
      <div className={`status-card ${status?.status || 'normal'}`}>
        <div className="status-icon icon-status">
          <StatusIcon style={{ color: config.color }} />
        </div>
        <div className="status-label">System Status</div>
        <div style={{ marginTop: '8px' }}>
          <span className={`status-badge ${status?.status || 'normal'}`}>
            <span className="status-badge-dot"></span>
            {config.label}
          </span>
        </div>
        <div className="status-sub" style={{ marginTop: '8px' }}>
          {status?.message || 'Awaiting data...'}
        </div>
      </div>
    </div>
  );
}
