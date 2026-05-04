'use client';
import { Bell, Trash2, AlertTriangle, AlertOctagon, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AlertPanel({ alerts, onClear }) {
  const alertConfig = {
    warning: { icon: AlertTriangle, label: 'Warning' },
    critical: { icon: AlertOctagon, label: 'Critical' },
    normal: { icon: CheckCircle2, label: 'Normal' },
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Bell size={14} />
          Alerts & Notifications
        </span>
        {alerts.length > 0 && (
          <button
            onClick={onClear}
            className="card-badge"
            style={{
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #2a3344',
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'inherit',
            }}
          >
            <Trash2 size={10} />
            Clear ({alerts.length})
          </button>
        )}
      </div>
      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <ShieldCheck />
            No alerts — all systems operating normally
          </div>
        ) : (
          alerts.slice(0, 20).map((alert) => {
            const config = alertConfig[alert.status] || alertConfig.warning;
            const Icon = config.icon;
            return (
              <div key={alert.id} className={`alert-item ${alert.status}`}>
                <span className="alert-icon">
                  <Icon />
                </span>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
