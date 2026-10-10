import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, BarChart3, Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useSensorData } from '../hooks/useSensorData';

export function ReportsPage() {
  const { historyData, incubationProgress, isDemo } = useSensorData();
  const [reportType, setReportType] = useState<'summary' | 'daily' | 'incidents'>('summary');

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    if (historyData.length === 0) return null;
    const temps = historyData.map(d => d.temperature);
    const hums = historyData.map(d => d.humidity);
    return {
      tempAvg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2),
      tempMin: Math.min(...temps).toFixed(1),
      tempMax: Math.max(...temps).toFixed(1),
      tempStdDev: Math.sqrt(temps.reduce((sum, t) => sum + Math.pow(t - temps.reduce((a, b) => a + b, 0) / temps.length, 2), 0) / temps.length).toFixed(3),
      humAvg: (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1),
      humMin: Math.min(...hums).toFixed(1),
      humMax: Math.max(...hums).toFixed(1),
      totalReadings: historyData.length,
      violations: historyData.filter(d => d.status !== 'normal').length,
    };
  }, [historyData]);

  // Daily averages for bar chart
  const dailyData = React.useMemo(() => {
    const days: Record<string, { temps: number[]; hums: number[] }> = {};
    historyData.forEach(d => {
      const day = d.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!days[day]) days[day] = { temps: [], hums: [] };
      days[day].temps.push(d.temperature);
      days[day].hums.push(d.humidity);
    });
    return Object.entries(days).map(([day, data]) => ({
      day,
      temp: data.temps.reduce((a, b) => a + b, 0) / data.temps.length,
      humidity: data.hums.reduce((a, b) => a + b, 0) / data.hums.length,
    }));
  }, [historyData]);

  const incidents = historyData.filter(d => d.status !== 'normal');

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">Research Documentation</p>
            <p className="text-xs text-amber-300/70 mt-1">
              Reports are generated from available data. Measured results are distinguished from calculated summaries.
            </p>
          </div>
        </div>
      )}

      {/* Report Type Selector */}
      <div className="flex items-center gap-2">
        {[
          { id: 'summary', label: 'Summary Report', icon: BarChart3 },
          { id: 'daily', label: 'Daily Trends', icon: TrendingUp },
          { id: 'incidents', label: 'Incident Log', icon: AlertTriangle },
        ].map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                reportType === type.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{type.label}</span>
            </button>
          );
        })}
      </div>

      {reportType === 'summary' && stats && (
        <>
          {/* Summary Statistics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Incubation Summary</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <Printer className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Avg Temperature</p>
                <p className="text-xl font-bold text-white">{stats.tempAvg}°C</p>
                <p className="text-xs text-gray-500 mt-1">σ = {stats.tempStdDev}°C</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Temp Range</p>
                <p className="text-xl font-bold text-white">{stats.tempMin}–{stats.tempMax}°C</p>
                <p className="text-xs text-gray-500 mt-1">Target: 37.5–38.0°C</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Avg Humidity</p>
                <p className="text-xl font-bold text-white">{stats.humAvg}%</p>
                <p className="text-xs text-gray-500 mt-1">Range: {stats.humMin}–{stats.humMax}%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Data Points</p>
                <p className="text-xl font-bold text-white">{stats.totalReadings}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.violations} violations</p>
              </div>
            </div>

            {/* Incubation Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <h4 className="text-sm font-medium text-white mb-3">Incubation Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500">Species:</span> <span className="text-gray-300">{incubationProgress.species}</span></div>
                <div><span className="text-gray-500">Current Day:</span> <span className="text-gray-300">{incubationProgress.currentDay} of {incubationProgress.totalDays}</span></div>
                <div><span className="text-gray-500">Start Date:</span> <span className="text-gray-300">{incubationProgress.startDate}</span></div>
                <div><span className="text-gray-500">Est. Hatch:</span> <span className="text-gray-300">{incubationProgress.estimatedHatch}</span></div>
                <div><span className="text-gray-500">Progress:</span> <span className="text-emerald-400">{incubationProgress.percentage.toFixed(0)}%</span></div>
                <div><span className="text-gray-500">Data Source:</span> <span className="text-amber-400">{isDemo ? 'Simulated' : 'IoT Sensors'}</span></div>
              </div>
            </div>
          </motion.div>

          {/* Temperature Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Temperature Trend</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis domain={[36.5, 39]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a3530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="temp" name="Avg Temp (°C)" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </>
      )}

      {reportType === 'daily' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Environmental Averages</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a3530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="temp" name="Avg Temp (°C)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="humidity" name="Avg Humidity (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {reportType === 'incidents' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Threshold Violations & Incidents</h3>
          {incidents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No threshold violations recorded in this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Value</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {incidents.slice(0, 20).map((incident, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-gray-300">{incident.timestamp.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {incident.temperature > 38.5 ? 'Temp High' : incident.temperature < 37.0 ? 'Temp Low' :
                         incident.humidity > 70 ? 'Humidity High' : 'Humidity Low'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{incident.temperature.toFixed(1)}°C / {incident.humidity.toFixed(0)}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.status === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {incident.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
