import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Calendar, Wifi, WifiOff, AlertTriangle, TrendingUp, Activity, Egg, RotateCw, Clock3, CheckCircle2 } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';
import { DashboardTrends } from './DashboardTrends';

function StatusBadge({ status }: { status: 'normal' | 'warning' | 'critical' }) {
  const styles = {
    normal: 'border-emerald-300/15 bg-emerald-300/10 text-emerald-200',
    warning: 'border-amber-300/15 bg-amber-300/10 text-amber-200',
    critical: 'border-rose-300/15 bg-rose-300/10 text-rose-200',
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${styles[status]}`}>{status}</span>;
}

function MetricCard({ title, value, unit, icon: Icon, status, detail, trend, delay = 0 }: {
  title: string; value: string; unit: string; icon: any; status: 'normal' | 'warning' | 'critical'; detail: string; trend?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      className="group rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#193a31] to-[#112a23] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-0.5 hover:border-emerald-200/20 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-emerald-200"><Icon size={20} /></div>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-slate-400">{title}</p>
      <div className="mt-1 flex items-baseline gap-1.5"><span className="text-3xl font-semibold tracking-tight text-white sm:text-[2.1rem]">{value}</span><span className="text-sm font-medium text-slate-400">{unit}</span></div>
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
        <span className="text-xs text-slate-500">{detail}</span>
        {trend && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-200"><TrendingUp size={13} />{trend}</span>}
      </div>
    </motion.div>
  );
}

function DeviceStatusCard({ isOnline, lastUpdate }: { isOnline: boolean; lastUpdate: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35 }}
      className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#193a31] to-[#112a23] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-emerald-200">{isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}</div>
        <StatusBadge status={isOnline ? 'normal' : 'critical'} />
      </div>
      <p className="text-sm text-slate-400">Device status</p>
      <div className="mt-1 flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.6)]' : 'bg-rose-400'}`} /><span className="text-2xl font-semibold tracking-tight text-white">{isOnline ? 'Online' : 'Offline'}</span></div>
      <div className="mt-5 space-y-3 border-t border-white/[0.07] pt-4">
        <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Last update</span><span className="text-slate-300">{lastUpdate}</span></div>
        <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Sensors</span><span className="text-emerald-200">2 connected</span></div>
      </div>
    </motion.div>
  );
}

export function OverviewPage() {
  const { currentData, incubationProgress, isOnline, lastUpdate, isDemo } = useSensorData();
  const [turnLog, setTurnLog] = useState<{ date: string; count: number; lastAt: string | null }>(() => {
    try {
      const saved = localStorage.getItem('hatchsmart-egg-turn-log');
      const parsed = saved ? JSON.parse(saved) : null;
      const today = new Date().toISOString().slice(0, 10);
      return parsed?.date === today ? parsed : { date: today, count: 0, lastAt: null };
    } catch {
      return { date: new Date().toISOString().slice(0, 10), count: 0, lastAt: null };
    }
  });
  useEffect(() => {
    localStorage.setItem('hatchsmart-egg-turn-log', JSON.stringify(turnLog));
  }, [turnLog]);
  const logEggTurn = () => {
    const today = new Date().toISOString().slice(0, 10);
    setTurnLog(previous => ({
      date: today,
      count: previous.date === today ? previous.count + 1 : 1,
      lastAt: new Date().toISOString(),
    }));
  };
  const resetTurnLog = () => setTurnLog({ date: new Date().toISOString().slice(0, 10), count: 0, lastAt: null });
  const activities = [
    { time: '2 min ago', event: 'Temperature reading received', type: 'info' },
    { time: '2 min ago', event: 'Humidity reading received', type: 'info' },
    { time: '15 min ago', event: 'Sensor data received from ESP32', type: 'success' },
    { time: '1 hour ago', event: 'System health check passed', type: 'success' },
    { time: '3 hours ago', event: 'Temperature briefly exceeded threshold', type: 'warning' },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200/10 bg-emerald-200/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200"><Activity size={13} /> Incubator overview</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Good to see you.</h1>
          <p className="mt-1.5 text-sm text-slate-400">Here’s your incubator’s environmental health at a glance.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Live demo feed <span className="text-slate-600">•</span> Updates every 5 sec</div>
      </div>

      {isDemo && <div className="flex items-start gap-3 rounded-2xl border border-amber-200/10 bg-amber-300/[0.06] p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-200" />
        <div><p className="text-sm font-semibold text-amber-100">Demonstration mode is active</p><p className="mt-1 text-xs leading-relaxed text-amber-100/65">These readings are simulated for preview purposes. Connect Firebase and your IoT hardware before using this dashboard for real incubation decisions.</p></div>
      </div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard title="Temperature" value={currentData.temperature.toFixed(1)} unit="°C" icon={Thermometer} status={currentData.tempStatus} detail="Target: 37.5–38.0°C" trend="Stable" />
        <MetricCard title="Relative humidity" value={currentData.humidity.toFixed(0)} unit="%" icon={Droplets} status={currentData.humidityStatus} detail="Target: 50–65%" delay={0.08} />
        <MetricCard title="Incubation day" value={String(incubationProgress.currentDay)} unit={`/ ${incubationProgress.totalDays} days`} icon={Calendar} status="normal" detail={`${incubationProgress.percentage.toFixed(0)}% completed`} delay={0.16} />
        <DeviceStatusCard isOnline={isOnline} lastUpdate={lastUpdate} />
      </div>

      <DashboardTrends />

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#193a31] to-[#112a23] p-5 sm:p-7">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200"><Egg size={19} /></div><div><h3 className="font-semibold text-white">Incubation timeline</h3><p className="mt-1 text-xs text-slate-400">{incubationProgress.species}</p></div></div>
          <span className="w-fit rounded-full border border-emerald-200/10 bg-emerald-200/[0.05] px-3 py-1.5 text-xs font-medium text-emerald-100">{incubationProgress.currentDay} of {incubationProgress.totalDays} days</span>
        </div>
        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-black/20"><motion.div initial={{ width: 0 }} animate={{ width: `${incubationProgress.percentage}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" /></div>
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3"><div><p className="text-slate-500">Start date</p><p className="mt-1 font-medium text-slate-200">{incubationProgress.startDate}</p></div><div className="sm:text-center"><p className="text-slate-500">Progress</p><p className="mt-1 font-medium text-emerald-200">{incubationProgress.percentage.toFixed(0)}% complete</p></div><div className="sm:text-right"><p className="text-slate-500">Estimated hatch</p><p className="mt-1 font-medium text-slate-200">{incubationProgress.estimatedHatch}</p></div></div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.23 }}
        className="relative overflow-hidden rounded-3xl border border-emerald-100/10 bg-gradient-to-br from-[#163c31]/85 via-[#123128]/85 to-[#102a35]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,.15)] backdrop-blur-xl sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-emerald-100"><RotateCw size={13} /> Research log</div>
            <h3 className="text-lg font-semibold text-white">Egg-turning checkpoint</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300/70">Record each manual egg turn during your incubation trial. This is a local research note only—it does not activate a motor or confirm that the eggs physically turned.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Clock3 size={14} /> {turnLog.lastAt ? `Last logged ${new Date(turnLog.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No turns logged today yet'}</div>
          </div>
          <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 sm:p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-200/10 text-emerald-100"><Egg size={27} /></div>
            <div className="min-w-20"><p className="text-xs text-slate-400">Today's entries</p><p className="mt-1 text-3xl font-semibold text-white">{turnLog.count}</p><p className="mt-1 text-[10px] text-slate-500">Saved in this browser</p></div>
            <div className="flex flex-col gap-2">
              <button onClick={logEggTurn} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-100"><CheckCircle2 size={15} /> Log egg turn</button>
              <button onClick={resetTurnLog} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[.06]">Reset today's log</button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }}
        className="rounded-3xl border border-white/[0.08] bg-[#15342b]/80 p-5 sm:p-7">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-white">Recent activity</h3><p className="mt-1 text-xs text-slate-400">Latest device and environment events</p></div><span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">Last 3 hours</span></div>
        <div className="divide-y divide-white/[0.06]">{activities.map((item) => <div key={item.event} className="flex items-center gap-3 py-3.5"><span className={`h-2 w-2 shrink-0 rounded-full ${item.type === 'success' ? 'bg-emerald-300' : item.type === 'warning' ? 'bg-amber-300' : 'bg-sky-300'}`} /><span className="min-w-0 flex-1 text-sm text-slate-300">{item.event}</span><span className="shrink-0 text-xs text-slate-500">{item.time}</span></div>)}</div>
      </motion.section>
    </div>
  );
}
