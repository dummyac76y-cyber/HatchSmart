import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Thermometer, Droplets, Activity, AlertTriangle, Wifi, RefreshCw, Calendar } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a3530] border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{new Date(label).toLocaleString()}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name === 'Temperature' ? '°C' : '%'}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function IncubatorPage() {
  const { currentData, historyData, isOnline, lastUpdate, timeRange, setTimeRange, isDemo } = useSensorData();

  const thresholds = {
    tempMin: 36.5,
    tempMax: 39.0,
    tempTargetMin: 37.5,
    tempTargetMax: 38.0,
    humidityMin: 45,
    humidityMax: 70,
    humidityTargetMin: 50,
    humidityTargetMax: 65,
  };

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">Simulated Data</p>
            <p className="text-xs text-amber-300/70 mt-1">
              Charts display simulated sensor readings. Connect actual IoT hardware to see real measurements.
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-medium ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <span className="text-xs text-gray-500">Last update: {lastUpdate}</span>
        </div>
        <div className="flex items-center gap-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === option.value
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a3530] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Temperature</h3>
                <p className="text-2xl font-bold text-white">{currentData.temperature.toFixed(1)}°C</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              currentData.tempStatus === 'normal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              currentData.tempStatus === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {currentData.tempStatus}
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData.slice(-30)}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timestamp" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <YAxis domain={[36, 39]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="temperature" name="Temperature" stroke="#ef4444" fill="url(#tempGradient)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Target: {thresholds.tempTargetMin}–{thresholds.tempTargetMax}°C</span>
            <span>Limits: {thresholds.tempMin}–{thresholds.tempMax}°C</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a3530] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Relative Humidity</h3>
                <p className="text-2xl font-bold text-white">{currentData.humidity.toFixed(0)}%</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              currentData.humidityStatus === 'normal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              currentData.humidityStatus === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {currentData.humidityStatus}
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData.slice(-30)}>
                <defs>
                  <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timestamp" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <YAxis domain={[30, 80]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#3b82f6" fill="url(#humGradient)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Target: {thresholds.humidityTargetMin}–{thresholds.humidityTargetMax}%</span>
            <span>Limits: {thresholds.humidityMin}–{thresholds.humidityMax}%</span>
          </div>
        </motion.div>
      </div>

      {/* Combined Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1a3530] border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Environmental Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
              <YAxis yAxisId="temp" domain={[36, 39]} tick={{ fill: '#ef4444', fontSize: 10 }} label={{ value: '°C', position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
              <YAxis yAxisId="hum" orientation="right" domain={[30, 80]} tick={{ fill: '#3b82f6', fontSize: 10 }} label={{ value: '%', position: 'insideRight', fill: '#3b82f6', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temperature" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line yAxisId="hum" type="monotone" dataKey="humidity" name="Humidity" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Device Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1a3530] border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Device Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Device ID', value: 'ESP32-INCUBATOR-001' },
            { label: 'Primary Sensor', value: 'DHT22-PRIMARY' },
            { label: 'Secondary Sensor', value: 'BME280-AUX' },
            { label: 'Firmware Version', value: 'v1.2.4' },
            { label: 'Connection', value: 'WiFi (2.4 GHz)' },
            { label: 'Data Protocol', value: 'MQTT over TLS' },
            { label: 'Update Interval', value: '30 seconds' },
            { label: 'Last Heartbeat', value: lastUpdate },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
