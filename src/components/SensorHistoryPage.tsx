import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Calendar, AlertTriangle } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';

export function SensorHistoryPage() {
  const { historyData, isDemo } = useSensorData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredData = useMemo(() => {
    let data = [...historyData].reverse(); // Most recent first

    if (searchTerm) {
      data = data.filter(d =>
        d.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.sensorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.temperature.toString().includes(searchTerm) ||
        d.humidity.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(d => d.status === statusFilter);
    }

    if (deviceFilter !== 'all') {
      data = data.filter(d => d.deviceId === deviceFilter);
    }

    if (dateFrom) {
      data = data.filter(d => d.timestamp >= new Date(dateFrom));
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      data = data.filter(d => d.timestamp <= to);
    }

    return data;
  }, [historyData, searchTerm, statusFilter, deviceFilter, dateFrom, dateTo]);

  const exportCSV = () => {
    const headers = ['Timestamp', 'Device ID', 'Sensor ID', 'Temperature (°C)', 'Humidity (%)', 'Status'];
    const rows = filteredData.map(d => [
      d.timestamp.toISOString(),
      d.deviceId,
      d.sensorId,
      d.temperature.toFixed(2),
      d.humidity.toFixed(1),
      d.status,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `smarthatch_sensor_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const uniqueDevices = useMemo(() => {
    const devices = new Set(historyData.map(d => d.deviceId));
    return Array.from(devices);
  }, [historyData]);

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">Simulated Data</p>
            <p className="text-xs text-amber-300/70 mt-1">
              History data is generated for demonstration. Connect IoT hardware and Firestore for real readings.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a3530] border border-white/5 rounded-2xl p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by device, sensor, or value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">All Status</option>
            <option value="normal">Normal</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          {/* Device Filter */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">All Devices</option>
            {uniqueDevices.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 font-medium hover:bg-emerald-500/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Showing {filteredData.length} of {historyData.length} readings
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1a3530] border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Device ID</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Sensor</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Temperature</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Humidity</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.slice(0, 50).map((reading, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-300 whitespace-nowrap">
                    {reading.timestamp.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-300 font-mono text-xs">
                    {reading.deviceId}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-300 font-mono text-xs">
                    {reading.sensorId}
                  </td>
                  <td className="px-6 py-3 text-sm text-white font-medium">
                    {reading.temperature.toFixed(1)}°C
                  </td>
                  <td className="px-6 py-3 text-sm text-white font-medium">
                    {reading.humidity.toFixed(1)}%
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reading.status === 'normal' ? 'bg-emerald-500/10 text-emerald-400' :
                      reading.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {reading.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {isDemo ? 'Simulated' : 'IoT'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400">No readings match your filters.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
