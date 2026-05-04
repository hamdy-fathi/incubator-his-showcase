'use client';
import { Thermometer, Droplets } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const CustomTooltip = ({ active, payload, label, unit, color }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a2130',
        border: '1px solid #2a3344',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '0.78rem',
      }}>
        <div style={{ color: '#64748b', marginBottom: 3, fontSize: '0.65rem' }}>{formatTime(label)}</div>
        <div style={{ color, fontWeight: 700, fontSize: '1rem' }}>
          {payload[0].value?.toFixed(1)}{unit}
        </div>
      </div>
    );
  }
  return null;
};

export function TemperatureChart({ data }) {
  const chartData = data.map(d => ({
    time: d.timestamp,
    temperature: d.temperature,
  }));

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Thermometer size={14} />
          Temperature Over Time
        </span>
        <span className="card-badge" style={{ background: 'var(--chart-temp-fill)', color: 'var(--chart-temp)' }}>
          LIVE
        </span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tickFormatter={formatTime} stroke="#475569" fontSize={9} tick={{ fill: '#475569' }} />
            <YAxis domain={[34, 40]} stroke="#475569" fontSize={9} tick={{ fill: '#475569' }} tickFormatter={v => `${v}°`} />
            <Tooltip content={<CustomTooltip unit="°C" color="#f87171" />} />
            <ReferenceLine y={38} stroke="#fbbf24" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={36} stroke="#fbbf24" strokeDasharray="4 4" strokeWidth={1} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#f87171"
              strokeWidth={1.5}
              fill="url(#tempGradient)"
              dot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HumidityChart({ data }) {
  const chartData = data.map(d => ({
    time: d.timestamp,
    humidity: d.humidity,
  }));

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Droplets size={14} />
          Humidity Over Time
        </span>
        <span className="card-badge" style={{ background: 'var(--chart-humidity-fill)', color: 'var(--chart-humidity)' }}>
          LIVE
        </span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tickFormatter={formatTime} stroke="#475569" fontSize={9} tick={{ fill: '#475569' }} />
            <YAxis domain={[30, 90]} stroke="#475569" fontSize={9} tick={{ fill: '#475569' }} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip unit="%" color="#38bdf8" />} />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#38bdf8"
              strokeWidth={1.5}
              fill="url(#humidityGradient)"
              dot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
