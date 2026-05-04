'use client';
import { Bell, Trash2, AlertTriangle, AlertOctagon, CheckCircle2, ShieldCheck } from 'lucide-react';

const ALERT_CONFIG = {
  warning:  { Icon: AlertTriangle,  borderColor: 'var(--status-warning)',  bg: 'var(--status-warning-bg)',  color: 'var(--status-warning)'  },
  critical: { Icon: AlertOctagon,   borderColor: 'var(--status-critical)', bg: 'var(--status-critical-bg)', color: 'var(--status-critical)' },
  normal:   { Icon: CheckCircle2,   borderColor: 'var(--status-normal)',   bg: 'var(--status-normal-bg)',   color: 'var(--status-normal)'   },
};

export default function AlertPanel({ alerts, onClear }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Bell size={14} />
          Alerts &amp; Notifications
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {alerts.length > 0 && (
            <span className="card-badge" style={{
              background: 'var(--status-critical-bg)',
              color: 'var(--status-critical)',
              border: '1px solid rgba(239,83,80,0.2)',
              borderRadius: 20,
              padding: '2px 8px',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {alerts.length}
            </span>
          )}
          {alerts.length > 0 && (
            <button
              onClick={onClear}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 10px',
                fontSize: '0.6rem', fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--status-critical)';
                e.currentTarget.style.borderColor = 'rgba(239,83,80,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <Trash2 size={10} />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <ShieldCheck />
            All systems operating normally
          </div>
        ) : (
          alerts.slice(0, 20).map((alert) => {
            const cfg = ALERT_CONFIG[alert.status] || ALERT_CONFIG.warning;
            const { Icon } = cfg;
            return (
              <div
                key={alert.id}
                className="alert-item"
                style={{
                  background: cfg.bg,
                  borderLeft: `3px solid ${cfg.borderColor}`,
                  color: cfg.color,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span className="alert-icon"><Icon /></span>
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
