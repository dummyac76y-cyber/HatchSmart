import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock3 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSensorData } from '../hooks/useSensorData';

const ranges = [
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
] as const;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const date = new Date(label);
  return (
    <div className="rounded-xl border border-white/10 bg-[#102b25] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs text-slate-400">{date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      {payload.map((item: any) => (
        <p key={item.dataKey} className="text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {Number(item.value).toFixed(1)}{item.dataKey === 'temperature' ? '°C' : '%'}
        </p>
      ))}
    </div>
  );
}

export function DashboardTrends() {
  const { historyData, timeRange, setTimeRange } = useSensorData();
  const chartData = historyData.map((reading) => ({
    ...reading,
    timestamp: reading.timestamp instanceof Date ? reading.timestamp.toISOString() : reading.timestamp,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#17372f] to-[#102820] shadow-[0_18px_60px_rgba(0,0,0,0.12)]"
    >
      <div className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Activity size={19} /></div>
          <div>
            <h3 className="text-base font-semibold text-white">Environmental trends</h3>
            <p className="mt-1 text-xs text-slate-400">Temperature and humidity across your selected window</p>
          </div>
        </div>
        <div className="flex w-fit items-center gap-1 rounded-xl border border-white/[0.08] bg-black/15 p-1" role="group" aria-label="Chart time range">
          {ranges.map((range) => (
            <button key={range.value} type="button" onClick={() => setTimeRange(range.value)} aria-pressed={timeRange === range.value}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${timeRange === range.value ? 'bg-emerald-400 text-[#09251c] shadow-sm' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}>
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 px-3 py-5 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-300" /> Temperature (°C)</span>
            <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sky-300" /> Humidity (%)</span>
          </div>
          <div className="h-[260px] w-full sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardTempFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.26} /><stop offset="100%" stopColor="#6ee7b7" stopOpacity={0} /></linearGradient>
                  <linearGradient id="dashboardHumidityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.18} /><stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="4 5" vertical={false} />
                <XAxis dataKey="timestamp" tick={{ fill: '#81978f', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <YAxis yAxisId="temp" domain={[36, 39]} tick={{ fill: '#81978f', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="humidity" orientation="right" domain={[30, 80]} hide />
                <Tooltip content={<ChartTooltip />} />
                <Area yAxisId="temp" type="monotone" dataKey="temperature" name="Temperature" stroke="#6ee7b7" strokeWidth={2.4} fill="url(#dashboardTempFill)" dot={false} activeDot={{ r: 4, fill: '#6ee7b7', stroke: '#102820', strokeWidth: 2 }} />
                <Area yAxisId="humidity" type="monotone" dataKey="humidity" name="Humidity" stroke="#7dd3fc" strokeWidth={2} fill="url(#dashboardHumidityFill)" dot={false} activeDot={{ r: 4, fill: '#7dd3fc', stroke: '#102820', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-2 px-2 text-[11px] text-slate-500"><Clock3 size={12} /> Chart refreshes with the selected history window. Demo readings are simulated.</p>
        </div>
        <aside className="grid grid-cols-2 gap-3 border-t border-white/[0.07] bg-black/10 p-4 sm:p-5 xl:grid-cols-1 xl:border-l xl:border-t-0">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-xs text-slate-400">Latest temperature</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-200">{chartData.at(-1)?.temperature.toFixed(1) ?? '—'}<span className="ml-1 text-sm font-medium text-slate-400">°C</span></p>
            <p className="mt-2 text-[11px] text-slate-500">Target 37.5–38.0°C</p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-xs text-slate-400">Latest humidity</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-sky-200">{chartData.at(-1)?.humidity.toFixed(0) ?? '—'}<span className="ml-1 text-sm font-medium text-slate-400">%</span></p>
            <p className="mt-2 text-[11px] text-slate-500">Target 50–65%</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-4 xl:col-span-1">
            <p className="text-xs font-medium text-emerald-200">Reading quality</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Use the Incubator page for detailed sensor plots and device information. This overview is optimized for a quick health check.</p>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}
