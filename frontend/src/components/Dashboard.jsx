'use client';
import dynamic from 'next/dynamic';
import { useIncubatorData } from '@/hooks/useIncubatorData';
import StatusIndicator from '@/components/StatusIndicator';
import { TemperatureChart, HumidityChart } from '@/components/Charts';
import AlertPanel from '@/components/AlertPanel';
import RemoteControl from '@/components/RemoteControl';
import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react';

const IncubatorModel = dynamic(() => import('@/components/IncubatorModel'), {
  ssr: false,
  loading: () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading 3D Incubator Model...</div>
    </div>
  ),
});

export default function Dashboard() {
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

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="header-title">Smart Neonatal Incubator</div>
            <div className="header-subtitle">Real-Time Monitoring System</div>
          </div>
        </div>
        <div className="header-right">
          <div className="connection-status">
            <span className={`connection-dot ${connected ? '' : 'disconnected'}`}></span>
            {connected ? (
              <>
                <Wifi size={12} />
                WebSocket Connected
              </>
            ) : (
              <>
                <WifiOff size={12} />
                Polling Mode
              </>
            )}
          </div>
          <div className="header-time">
            <Clock size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
            {currentTime}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - 3D Model */}
        <div className="panel-3d">
          <IncubatorModel status={status} latest={latest} />
        </div>

        {/* Right Panel - Dashboard */}
        <div className="panel-dashboard">
          <StatusIndicator status={status} latest={latest} />

          <div className="charts-grid">
            <TemperatureChart data={history} />
            <HumidityChart data={history} />
          </div>

          <AlertPanel alerts={alerts} onClear={clearAlerts} />

          <RemoteControl settings={settings} onUpdate={updateSettings} />
        </div>
      </div>
    </div>
  );
}
