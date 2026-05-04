'use client';
import { useState, useEffect } from 'react';
import { SlidersHorizontal, Thermometer, Droplets, CheckCheck, Send } from 'lucide-react';

export default function RemoteControl({ settings, onUpdate }) {
  const [targetTemp,     setTargetTemp]     = useState(settings?.targetTemperature ?? 37.0);
  const [targetHumidity, setTargetHumidity] = useState(settings?.targetHumidity    ?? 55);
  const [applied, setApplied] = useState(false);

  // Sync when settings arrive / change from WebSocket
  useEffect(() => {
    if (settings?.targetTemperature !== undefined) setTargetTemp(settings.targetTemperature);
    if (settings?.targetHumidity    !== undefined) setTargetHumidity(settings.targetHumidity);
  }, [settings]);

  const handleApply = () => {
    onUpdate({
      targetTemperature: parseFloat(targetTemp.toFixed(1)),
      targetHumidity: Math.round(targetHumidity),
    });
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  // Compute slider fill % for the progress track
  const tempPct     = ((targetTemp     - 35) / (39.5 - 35)) * 100;
  const humidityPct = ((targetHumidity - 40) / (80   - 40)) * 100;

  const sliderStyle = (pct, color) => ({
    background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--bg-elevated) ${pct}%, var(--bg-elevated) 100%)`,
  });

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <SlidersHorizontal size={14} />
          Remote Control
        </span>
        <span className="card-badge" style={{
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-muted)',
        }}>
          MANUAL
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Temperature slider */}
        <div className="control-row">
          <span className="control-label">
            <Thermometer size={14} style={{ color: 'var(--chart-temp)' }} />
            Target Temp
          </span>
          <input
            type="range"
            className="control-slider slider-temp"
            min="35" max="39.5" step="0.1"
            value={targetTemp}
            onChange={e => setTargetTemp(parseFloat(e.target.value))}
            style={sliderStyle(tempPct, 'var(--chart-temp)')}
          />
          <span className="control-value" style={{ color: 'var(--chart-temp)' }}>
            {targetTemp.toFixed(1)}°C
          </span>
        </div>

        {/* Humidity slider */}
        <div className="control-row">
          <span className="control-label">
            <Droplets size={14} style={{ color: 'var(--chart-humidity)' }} />
            Humidity
          </span>
          <input
            type="range"
            className="control-slider slider-humidity"
            min="40" max="80" step="1"
            value={targetHumidity}
            onChange={e => setTargetHumidity(parseInt(e.target.value))}
            style={sliderStyle(humidityPct, 'var(--chart-humidity)')}
          />
          <span className="control-value" style={{ color: 'var(--chart-humidity)' }}>
            {targetHumidity}%
          </span>
        </div>

        {/* Apply button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <button
            className="control-button"
            onClick={handleApply}
            style={applied ? {
              background: 'var(--status-normal)',
              color: '#111',
              borderColor: 'var(--status-normal)',
              display: 'flex', alignItems: 'center', gap: 6,
            } : {
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {applied
              ? <><CheckCheck size={12} /> Applied</>
              : <><Send size={12} /> Apply Settings</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}
