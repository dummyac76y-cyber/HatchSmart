import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Thermometer, Droplets, Wifi, Activity, CheckCircle, XCircle, Filter, AlertCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low' | 'sensor_malfunction' | 'device_offline' | 'stale_reading';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  deviceId: string;
  measuredValue?: string;
  threshold?: string;
  acknowledged: boolean;
}

// Generate demo alerts
function generateDemoAlerts(): Alert[] {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'temperature_high',
      severity: 'warning',
      message: 'Temperature exceeded upper threshold',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      deviceId: 'ESP32-INCUBATOR-001',
      measuredValue: '38.6°C',
      threshold: '> 38.0°C',
      acknowledged: false,
    },
    {
      id: '2',
      type: 'humidity_low',
      severity: 'info',
      message: 'Humidity dropped below target range',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      deviceId: 'ESP32-INCUBATOR-001',
      measuredValue: '47%',
      threshold: '< 50%',
      acknowledged: true,
    },
    {
      id: '3',
      type: 'stale_reading',
      severity: 'warning',
      message: 'Sensor data not received for 5 minutes',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      deviceId: 'ESP32-INCUBATOR-001',
      acknowledged: true,
    },
    {
      id: '4',
      type: 'temperature_high',
      severity: 'critical',
      message: 'Temperature significantly above safe range',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      deviceId: 'ESP32-INCUBATOR-001',
      measuredValue: '39.2°C',
      threshold: '> 39.0°C',
      acknowledged: true,
    },
    {
      id: '5',
      type: 'device_offline',
      severity: 'critical',
      message: 'Device connection lost',
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      deviceId: 'ESP32-INCUBATOR-001',
      acknowledged: true,
    },
    {
      id: '6',
      type: 'sensor_malfunction',
      severity: 'warning',
      message: 'Secondary sensor reported inconsistent readings',
      timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      deviceId: 'ESP32-INCUBATOR-001',
      measuredValue: 'N/A',
      threshold: 'Deviation > 2°C',
      acknowledged: true,
    },
  ];
}

const alertIcons = {
  temperature_high: Thermometer,
  temperature_low: Thermometer,
  humidity_high: Droplets,
  humidity_low: Droplets,
  sensor_malfunction: Activity,
  device_offline: Wifi,
  stale_reading: AlertCircle,
};

const severityColors = {
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(generateDemoAlerts);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return !a.acknowledged;
    if (filter === 'acknowledged') return a.acknowledged;
    if (severityFilter !== 'all') return a.severity === severityFilter;
    return true;
  });

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const activeCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-2xl font-bold text-white">{alerts.filter(a => a.severity === 'critical').length}</span>
          </div>
          <p className="text-sm text-gray-400">Critical Alerts</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-white">{alerts.filter(a => a.severity === 'warning').length}</span>
          </div>
          <p className="text-sm text-gray-400">Warnings</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-white">{activeCount}</span>
          </div>
          <p className="text-sm text-gray-400">Unacknowledged</p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'active', 'acknowledged'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {activeCount > 0 && (
          <button
            onClick={acknowledgeAll}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 font-medium hover:bg-emerald-500/30 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Acknowledge All
          </button>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert, i) => {
          const Icon = alertIcons[alert.type];
          const colors = severityColors[alert.severity];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-[#1a3530] border rounded-2xl p-5 transition-all ${
                alert.acknowledged ? 'border-white/5 opacity-60' : `${colors.border} border`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.message}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">{alert.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.acknowledged && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-gray-500">Device: <span className="text-gray-300 font-mono">{alert.deviceId}</span></span>
                    {alert.measuredValue && (
                      <span className="text-xs text-gray-500">Value: <span className="text-white font-medium">{alert.measuredValue}</span></span>
                    )}
                    {alert.threshold && (
                      <span className="text-xs text-gray-500">Threshold: <span className="text-gray-300">{alert.threshold}</span></span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 bg-[#1a3530] border border-white/5 rounded-2xl">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-400">No alerts to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
