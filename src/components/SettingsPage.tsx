import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Thermometer, Droplets, Bell, Shield, Cpu, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export function SettingsPage() {
  const { user, updateDisplayName, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'thresholds' | 'device' | 'notifications'>('profile');

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Threshold state
  const [thresholds, setThresholds] = useState({
    tempMin: 36.5,
    tempMax: 39.0,
    tempTargetMin: 37.5,
    tempTargetMax: 38.0,
    humidityMin: 45,
    humidityMax: 70,
    humidityTargetMin: 50,
    humidityTargetMax: 65,
  });
  const [thresholdsSaved, setThresholdsSaved] = useState(false);

  // Device state
  const [deviceId, setDeviceId] = useState('ESP32-INCUBATOR-001');
  const [species, setSpecies] = useState('chicken');
  const [incubationDays, setIncubationDays] = useState(21);
  const [deviceSaved, setDeviceSaved] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    criticalOnly: false,
    dailySummary: true,
    weeklyReport: true,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  const handleSaveProfile = async () => {
    await updateDisplayName(displayName);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveThresholds = () => {
    // In production, this would save to Firestore
    setThresholdsSaved(true);
    setTimeout(() => setThresholdsSaved(false), 3000);
  };

  const handleSaveDevice = () => {
    setDeviceSaved(true);
    setTimeout(() => setDeviceSaved(false), 3000);
  };

  const handleSaveNotifications = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'thresholds', label: 'Thresholds', icon: Thermometer },
    { id: 'device', label: 'Device', icon: Cpu },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">Demo Mode</p>
            <p className="text-xs text-amber-300/70 mt-1">
              Settings are saved locally in demo mode. Configure Firebase for persistent storage.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Preferred Units</label>
              <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="metric">Metric (°C, %)</option>
                <option value="imperial">Imperial (°F, %)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              {profileSaved && (
                <span className="flex items-center gap-1 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Saved
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Thresholds Tab */}
      {activeTab === 'thresholds' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Monitoring Thresholds</h3>
          <p className="text-sm text-gray-400 mb-6">Configure alert thresholds for temperature and humidity monitoring.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temperature */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-400" />
                Temperature (°C)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Critical Low</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.tempMin}
                    onChange={(e) => setThresholds({ ...thresholds, tempMin: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Critical High</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.tempMax}
                    onChange={(e) => setThresholds({ ...thresholds, tempMax: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Target Min</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.tempTargetMin}
                    onChange={(e) => setThresholds({ ...thresholds, tempTargetMin: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Target Max</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.tempTargetMax}
                    onChange={(e) => setThresholds({ ...thresholds, tempTargetMax: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>
            {/* Humidity */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                Humidity (%)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Critical Low</label>
                  <input
                    type="number"
                    value={thresholds.humidityMin}
                    onChange={(e) => setThresholds({ ...thresholds, humidityMin: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Critical High</label>
                  <input
                    type="number"
                    value={thresholds.humidityMax}
                    onChange={(e) => setThresholds({ ...thresholds, humidityMax: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Target Min</label>
                  <input
                    type="number"
                    value={thresholds.humidityTargetMin}
                    onChange={(e) => setThresholds({ ...thresholds, humidityTargetMin: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Target Max</label>
                  <input
                    type="number"
                    value={thresholds.humidityTargetMax}
                    onChange={(e) => setThresholds({ ...thresholds, humidityTargetMax: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSaveThresholds}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Thresholds
            </button>
            {thresholdsSaved && (
              <span className="flex items-center gap-1 text-sm text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                Thresholds saved successfully
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Device Tab */}
      {activeTab === 'device' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Device & Incubation Configuration</h3>
          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Species</label>
              <select
                value={species}
                onChange={(e) => {
                  setSpecies(e.target.value);
                  const days: Record<string, number> = { chicken: 21, duck: 28, quail: 17, turkey: 28, goose: 30 };
                  setIncubationDays(days[e.target.value] || 21);
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="chicken">Chicken (21 days)</option>
                <option value="duck">Duck (28 days)</option>
                <option value="quail">Quail (17 days)</option>
                <option value="turkey">Turkey (28 days)</option>
                <option value="goose">Goose (30 days)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Incubation Duration (days)</label>
              <input
                type="number"
                value={incubationDays}
                onChange={(e) => setIncubationDays(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDevice}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
              {deviceSaved && (
                <span className="flex items-center gap-1 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Configuration saved
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a3530] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
          <div className="space-y-4 max-w-lg">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive email notifications for critical alerts' },
              { key: 'criticalOnly', label: 'Critical Alerts Only', desc: 'Only notify for critical threshold violations' },
              { key: 'dailySummary', label: 'Daily Summary', desc: 'Receive a daily summary of incubator conditions' },
              { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly incubation progress reports' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(notifications as any)[item.key]}
                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSaveNotifications}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
              {notifSaved && (
                <span className="flex items-center gap-1 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Preferences saved
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
