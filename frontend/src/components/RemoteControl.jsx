'use client';
import { useState } from 'react';
import { SlidersHorizontal, Thermometer, Droplets, Send } from 'lucide-react';

export default function RemoteControl({ settings, onUpdate }) {
  const [targetTemp, setTargetTemp] = useState(settings?.targetTemperature || 37.0);
  const [targetHumidity, setTargetHumidity] = useState(settings?.targetHumidity || 55);

  const handleApply = () => {
    onUpdate({
      targetTemperature: parseFloat(targetTemp.toFixed(1)),
      targetHumidity: Math.round(targetHumidity),
    });
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="control-row">
          <span className="control-label">
            <Thermometer size={14} />
            Target Temp
          </span>
          <input
            type="range"
            className="control-slider"
            min="35"
            max="39.5"
            step="0.1"
            value={targetTemp}
            onChange={e => setTargetTemp(parseFloat(e.target.value))}
          />
          <span className="control-value">{targetTemp.toFixed(1)}°C</span>
        </div>
        <div className="control-row">
          <span className="control-label">
            <Droplets size={14} />
            Target Humidity
          </span>
          <input
            type="range"
            className="control-slider"
            min="40"
            max="80"
            step="1"
            value={targetHumidity}
            onChange={e => setTargetHumidity(parseInt(e.target.value))}
          />
          <span className="control-value">{targetHumidity}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
          <button className="control-button" onClick={handleApply} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={12} />
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
