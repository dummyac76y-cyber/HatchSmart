import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Calendar, Wifi, WifiOff, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';

function StatusBadge({ status }: { status: 'normal' | 'warning' | 'critical' }) {
  const colors = {
    normal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  status,
  range,
  trend,
  delay,
}: {
  title: string;
  value: string;
  unit: string;
  icon: any;
  status: 'normal' | 'warning' | 'critical';
  range: string;
  trend?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[#1a3530] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-400" />
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-lg text-gray-400 ml-1">{unit}</span>
      </div>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-xs text-gray-500">Target: {range}</span>
        {trend && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function DeviceStatusCard({ isOnline, lastUpdate, sensorStatus }: { isOnline: boolean; lastUpdate: string; sensorStatus: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-[#1a3530] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          {isOnline ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
        </div>
        <StatusBadge status={isOnline ? 'normal' : 'critical'} />
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-white">{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      <p className="text-sm text-gray-400 mb-4">Device Status</p>
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Last Update</span>
          <span className="text-xs text-gray-300">{lastUpdate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Sensors</span>
          <span className="text-xs text-emerald-400">{sensorStatus}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function OverviewPage() {
  const { currentData, incubationProgress, isOnline, lastUpdate, isDemo } = useSensorData();

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">Demonstration Mode Active</p>
            <p className="text-xs text-amber-300/70 mt-1">
              Data shown is simulated for development purposes. Connect Firebase and IoT hardware to see real measurements.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          title="Temperature"
          value={currentData.temperature.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          status={currentData.tempStatus}
          range="37.5 – 38.0°C"
          trend="Stable"
          delay={0}
        />
        <MetricCard
          title="Relative Humidity"
          value={currentData.humidity.toFixed(0)}
          unit="%"
          icon={Droplets}
          status={currentData.humidityStatus}
          range="50 – 65%"
          trend="Stable"
          delay={0.1}
        />
        <MetricCard
          title="Incubation Day"
          value={`${incubationProgress.currentDay}`}
          unit={`/ ${incubationProgress.totalDays}`}
          icon={Calendar}
          status="normal"
          range={`Day ${incubationProgress.currentDay} of ${incubationProgress.totalDays}`}
          delay={0.2}
        />
        <DeviceStatusCard
          isOnline={isOnline}
          lastUpdate={lastUpdate}
          sensorStatus="2 sensors connected"
        />
      </div>

      {/* Incubation Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-[#1a3530] border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Incubation Progress</h3>
          <span className="text-sm text-gray-400">{incubationProgress.species}</span>
        </div>
        <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${incubationProgress.percentage}%` }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Started: {incubationProgress.startDate}</span>
          <span className="text-sm text-emerald-400 font-medium">{incubationProgress.percentage.toFixed(0)}% Complete</span>
          <span className="text-sm text-gray-400">Est. Hatch: {incubationProgress.estimatedHatch}</span>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="bg-[#1a3530] border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { time: '2 min ago', event: 'Temperature reading: 37.7°C', type: 'info' },
            { time: '2 min ago', event: 'Humidity reading: 58%', type: 'info' },
            { time: '15 min ago', event: 'Sensor data received from ESP32', type: 'success' },
            { time: '1 hour ago', event: 'System health check passed', type: 'success' },
            { time: '3 hours ago', event: 'Temperature briefly exceeded threshold', type: 'warning' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <div className={`w-2 h-2 rounded-full ${
                item.type === 'success' ? 'bg-emerald-400' :
                item.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
              }`} />
              <span className="text-sm text-gray-300 flex-1">{item.event}</span>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
