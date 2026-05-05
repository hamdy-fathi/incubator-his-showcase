'use client';
import { Thermometer, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function stats(data, key) {
  if (!data.length) return { min: null, max: null, avg: null, trend: 0 };
  const vals = data.map(d => d[key]).filter(v => v != null);
  if (!vals.length) return { min: null, max: null, avg: null, trend: 0 };
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const q = Math.max(1, Math.floor(vals.length / 4));
  const recent  = vals.slice(-q).reduce((a, b) => a + b, 0) / q;
  const earlier = vals.slice(0, q).reduce((a, b) => a + b, 0) / q;
  return { min, max, avg, trend: recent - earlier };
}

/* ─── custom cursor (hairline) ────────────────────────────────────────────── */

const HairlineCursor = ({ x, y, height, color }) => (
  <line
    x1={x} y1={0}
    x2={x} y2={height + 10}
    stroke={color}
    strokeWidth={1}
    strokeOpacity={0.35}
    strokeDasharray="3 2"
  />
);

/* ─── custom tooltip ──────────────────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, unit, color }) => {
  if (!active || !payload?.length) return null;
  // incubator uses `time` (ISO), device pages use `ts` (pre-formatted string)
  const rawTs  = payload[0]?.payload?.time;
  const fmtTs  = payload[0]?.payload?.ts;
  const label  = rawTs ? formatTime(rawTs) : (fmtTs ?? '');
  return (
    <div style={{
      background: '#1c1c1c',
      border: `1px solid ${color}33`,
      borderRadius: 'var(--radius-md)',
      padding: '10px 16px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}11`,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.6rem', marginBottom: 5, letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{
        color, fontWeight: 800, fontSize: '1.25rem',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
      }}>
        {payload[0].value?.toFixed(1)}
        <span style={{ fontSize: '0.7rem', opacity: 0.55, marginLeft: 2, fontWeight: 500 }}>{unit}</span>
      </div>
    </div>
  );
};

/* ─── stat chip ───────────────────────────────────────────────────────────── */

const StatChip = ({ label, value, unit, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
    <span style={{
      fontSize: '0.55rem', color: 'var(--text-dim)',
      textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600,
    }}>
      {label}
    </span>
    <span style={{
      fontSize: '0.9rem', fontWeight: 700,
      color, fontVariantNumeric: 'tabular-nums',
    }}>
      {value != null ? `${value.toFixed(1)}${unit}` : '--'}
    </span>
  </div>
);

/* ─── trend icon ──────────────────────────────────────────────────────────── */

// color depends on where current sits relative to safe range, not just direction
function trendColor(trend, current, safeMin, safeMax) {
  if (Math.abs(trend) < 0.05 || current == null) return 'var(--text-dim)';
  const goingUp = trend > 0;
  if (current > safeMax)  return goingUp ? 'var(--status-critical)' : 'var(--status-normal)';
  if (current < safeMin)  return goingUp ? 'var(--status-normal)'   : 'var(--status-critical)';
  // inside range — show direction in muted colour (no alarm)
  return 'var(--text-secondary)';
}

const TrendIcon = ({ trend, current, safeMin, safeMax }) => {
  const color = trendColor(trend, current, safeMin, safeMax);
  if (Math.abs(trend) < 0.05) return <Minus size={11} style={{ color }} />;
  if (trend > 0) return <TrendingUp  size={11} style={{ color }} />;
  return          <TrendingDown size={11} style={{ color }} />;
};

/* ─── shared chart props ──────────────────────────────────────────────────── */

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: '#444', fontSize: 9, fontFamily: 'Inter, sans-serif' },
};

/* ─── Temperature chart ───────────────────────────────────────────────────── */

export function TemperatureChart({ data }) {
  const chartData = data.map(d => ({ time: d.timestamp, temperature: d.temperature }));
  const latest = chartData.at(-1)?.temperature;
  const { min, max, avg, trend } = stats(data, 'temperature');

  const COLOR = '#ef5350';

  return (
    <div className="card" style={{ borderLeft: '3px solid var(--chart-temp)', padding: '16px 20px' }}>

      {/* Header */}
      <div className="card-header" style={{ marginBottom: 14 }}>
        <span className="card-title">
          <Thermometer size={14} style={{ color: COLOR }} />
          Temperature
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendIcon trend={trend} />
          {latest != null && (
            <span style={{
              fontSize: '1.1rem', fontWeight: 800,
              color: COLOR, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
            }}>
              {latest.toFixed(1)}
              <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: 2, fontWeight: 500 }}>°C</span>
            </span>
          )}
          <span className="card-badge" style={{ background: 'rgba(239,83,80,0.12)', color: COLOR }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <defs>
              {/* Premium 3-stop gradient */}
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={COLOR} stopOpacity={0.35} />
                <stop offset="45%"  stopColor={COLOR} stopOpacity={0.10} />
                <stop offset="100%" stopColor={COLOR} stopOpacity={0.00} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e1e1e" strokeDasharray="0" vertical={false} />

            {/* Normal range band */}
            <ReferenceArea y1={36} y2={38}
              fill={COLOR} fillOpacity={0.04}
              stroke={COLOR} strokeOpacity={0.15} strokeWidth={1}
            />

            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              {...axisProps}
              interval="preserveStartEnd"
              minTickGap={60}
            />
            <YAxis
              domain={[34, 40]}
              tickFormatter={v => `${v}°`}
              ticks={[34, 35, 36, 37, 38, 39, 40]}
              {...axisProps}
            />

            <Tooltip
              content={<CustomTooltip unit="°C" color={COLOR} />}
              cursor={<HairlineCursor color={COLOR} />}
            />

            {/* Glow layer — thick + transparent */}
            <Area
              type="monotoneX"
              dataKey="temperature"
              stroke={COLOR}
              strokeWidth={10}
              strokeOpacity={0.08}
              fill="none"
              dot={false}
              isAnimationActive={false}
              activeDot={false}
            />

            {/* Crisp line + fill */}
            <Area
              type="monotoneX"
              dataKey="temperature"
              stroke={COLOR}
              strokeWidth={2.2}
              fill="url(#tempFill)"
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: COLOR,
                stroke: `${COLOR}55`,
                strokeWidth: 7,
                filter: `drop-shadow(0 0 6px ${COLOR})`,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        borderTop: '1px solid #1e1e1e',
        paddingTop: 12, marginTop: 12,
      }}>
        <StatChip label="Min" value={min} unit="°C" color="var(--chart-humidity)" />
        <StatChip label="Avg" value={avg} unit="°C" color="var(--text-secondary)" />
        <StatChip label="Max" value={max} unit="°C" color={COLOR} />
      </div>
    </div>
  );
}

/* ─── Humidity chart ──────────────────────────────────────────────────────── */

export function HumidityChart({ data }) {
  const chartData = data.map(d => ({ time: d.timestamp, humidity: d.humidity }));
  const latest = chartData.at(-1)?.humidity;
  const { min, max, avg, trend } = stats(data, 'humidity');

  const COLOR = '#42a5f5';

  return (
    <div className="card" style={{ borderLeft: '3px solid var(--chart-humidity)', padding: '16px 20px' }}>

      {/* Header */}
      <div className="card-header" style={{ marginBottom: 14 }}>
        <span className="card-title">
          <Droplets size={14} style={{ color: COLOR }} />
          Humidity
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendIcon trend={trend} />
          {latest != null && (
            <span style={{
              fontSize: '1.1rem', fontWeight: 800,
              color: COLOR, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
            }}>
              {latest}
              <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: 2, fontWeight: 500 }}>%</span>
            </span>
          )}
          <span className="card-badge" style={{ background: 'rgba(66,165,245,0.12)', color: COLOR }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="humidityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={COLOR} stopOpacity={0.35} />
                <stop offset="45%"  stopColor={COLOR} stopOpacity={0.10} />
                <stop offset="100%" stopColor={COLOR} stopOpacity={0.00} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e1e1e" strokeDasharray="0" vertical={false} />

            {/* Normal range band */}
            <ReferenceArea y1={40} y2={80}
              fill={COLOR} fillOpacity={0.03}
              stroke={COLOR} strokeOpacity={0.12} strokeWidth={1}
            />

            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              {...axisProps}
              interval="preserveStartEnd"
              minTickGap={60}
            />
            <YAxis
              domain={[20, 100]}
              tickFormatter={v => `${v}%`}
              ticks={[20, 40, 60, 80, 100]}
              {...axisProps}
            />

            <Tooltip
              content={<CustomTooltip unit="%" color={COLOR} />}
              cursor={<HairlineCursor color={COLOR} />}
            />

            {/* Glow layer */}
            <Area
              type="monotoneX"
              dataKey="humidity"
              stroke={COLOR}
              strokeWidth={10}
              strokeOpacity={0.08}
              fill="none"
              dot={false}
              isAnimationActive={false}
              activeDot={false}
            />

            {/* Crisp line + fill */}
            <Area
              type="monotoneX"
              dataKey="humidity"
              stroke={COLOR}
              strokeWidth={2.2}
              fill="url(#humidityFill)"
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: COLOR,
                stroke: `${COLOR}55`,
                strokeWidth: 7,
                filter: `drop-shadow(0 0 6px ${COLOR})`,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        borderTop: '1px solid #1e1e1e',
        paddingTop: 12, marginTop: 12,
      }}>
        <StatChip label="Min" value={min} unit="%" color="var(--chart-temp)" />
        <StatChip label="Avg" value={avg} unit="%" color="var(--text-secondary)" />
        <StatChip label="Max" value={max} unit="%" color={COLOR} />
      </div>
    </div>
  );
}

/* ─── Generic Device Chart (reusable for any device page) ─────────────────── */

export function DeviceChart({
  data,
  dataKey,
  label,
  color,
  unit = '',
  domain = ['auto', 'auto'],
  ticks,
  tickFormatter,
  safeMin,
  safeMax,
}) {
  const latest    = data.length ? data[data.length - 1]?.[dataKey] : null;
  const { min, max, avg, trend } = stats(data, dataKey);

  const gradId = `devgrad-${dataKey}-${color.replace('#', '')}`;

  return (
    <div className="card" style={{ borderLeft: `3px solid ${color}`, padding: '16px 20px' }}>

      {/* Header */}
      <div className="card-header" style={{ marginBottom: 14 }}>
        <span className="card-title" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendIcon
            trend={trend}
            current={latest}
            safeMin={safeMin ?? -Infinity}
            safeMax={safeMax ??  Infinity}
          />
          {latest != null && (
            <span style={{
              fontSize: '1.1rem', fontWeight: 800,
              color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
            }}>
              {typeof latest === 'number' ? latest.toFixed(1) : latest}
              <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: 2, fontWeight: 500 }}>{unit}</span>
            </span>
          )}
          <span className="card-badge" style={{ background: `${color}18`, color }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
                <stop offset="45%"  stopColor={color} stopOpacity={0.10} />
                <stop offset="100%" stopColor={color} stopOpacity={0.00} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e1e1e" strokeDasharray="0" vertical={false} />

            {/* Normal range band */}
            {safeMin != null && safeMax != null && (
              <ReferenceArea
                y1={safeMin} y2={safeMax}
                fill={color} fillOpacity={0.04}
                stroke={color} strokeOpacity={0.15} strokeWidth={1}
              />
            )}

            <XAxis
              dataKey="ts"
              {...axisProps}
              interval="preserveStartEnd"
              minTickGap={60}
            />
            <YAxis
              domain={domain}
              ticks={ticks}
              tickFormatter={tickFormatter ?? ((v) => `${v}${unit}`)}
              {...axisProps}
            />

            <Tooltip
              content={<CustomTooltip unit={unit} color={color} />}
              cursor={<HairlineCursor color={color} />}
            />

            {/* Glow layer */}
            <Area
              type="monotoneX"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={10}
              strokeOpacity={0.08}
              fill="none"
              dot={false}
              isAnimationActive={false}
              activeDot={false}
            />

            {/* Crisp line + fill */}
            <Area
              type="monotoneX"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.2}
              fill={`url(#${gradId})`}
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: `${color}55`,
                strokeWidth: 7,
                filter: `drop-shadow(0 0 6px ${color})`,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        borderTop: '1px solid #1e1e1e',
        paddingTop: 12, marginTop: 12,
      }}>
        <StatChip label="Min" value={min} unit={unit} color="var(--chart-humidity)" />
        <StatChip label="Avg" value={avg} unit={unit} color="var(--text-secondary)" />
        <StatChip label="Max" value={max} unit={unit} color={color} />
      </div>
    </div>
  );
}
