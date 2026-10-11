import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Thermometer, History, Bell, FileText, Settings,
  User, LogOut, Menu, X, Egg, ChevronDown, Wifi, WifiOff, Clock, Sprout, Layers3
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'incubators', label: 'Incubators', icon: Layers3 },
  { id: 'incubator', label: 'Sensor Monitor', icon: Thermometer },
  { id: 'journey', label: 'Hatch Journey', icon: Sprout },
  { id: 'history', label: 'Sensor History', icon: History },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children, currentPage, onNavigate }: DashboardLayoutProps) {
  const { user, logout, isDemo } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userName = user?.displayName || 'User';
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[17rem] shrink-0 bg-gradient-to-b from-[#0a2922]/95 via-[#09221f]/90 to-[#091923]/95 backdrop-blur-2xl border-r border-emerald-200/10 min-h-screen shadow-[18px_0_60px_rgba(0,0,0,.18)]">
        <div className="p-6 border-b border-white/[.08] bg-gradient-to-br from-emerald-300/[.08] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-300 via-teal-500 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 ring-1 ring-white/20">
              <Egg className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SmartHatch</h1>
              <p className="text-xs text-emerald-300/60">IoT Monitor</p>
            </div>
          </div>
        </div>
        <div className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[.22em] text-emerald-100/40">Incubator workspace</div>\n        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'relative bg-gradient-to-r from-emerald-300/15 via-teal-300/[.08] to-transparent text-emerald-100 border border-emerald-200/15 shadow-[inset_3px_0_0_#6ee7b7,0_8px_22px_rgba(0,0,0,.12)]'
                    : 'text-slate-400 border border-transparent hover:text-white hover:bg-white/[.055] hover:border-white/[.06]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mx-3 mb-3 rounded-2xl border border-emerald-200/10 bg-gradient-to-br from-emerald-300/[.09] to-cyan-400/[.025] p-3">\n          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.85)]" /> Monitoring workspace</div>\n          <p className="mt-1.5 pl-4 text-[10px] leading-relaxed text-slate-500">Sensor trends, hatch conditions and research logs</p>\n        </div>\n        <div className="p-3 border-t border-white/[.08]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-[min(88vw,21rem)] bg-gradient-to-b from-[#0b2c24]/[.98] via-[#091f1e]/[.98] to-[#081923]/[.98] backdrop-blur-2xl border-r border-emerald-200/15 shadow-[24px_0_80px_rgba(0,0,0,.42)] z-50 lg:hidden flex flex-col"
            >
              <div className="p-5 pt-[max(1.25rem,env(safe-area-inset-top))] border-b border-white/[.08] bg-gradient-to-br from-emerald-300/[.09] to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    <Egg className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-white">SmartHatch</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => { logout(); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0a211c]/65 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-xl border border-white/10 bg-white/[.04] p-2.5 text-gray-300 shadow-lg shadow-black/10 hover:border-emerald-200/20 hover:bg-emerald-300/10 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-white capitalize">{currentPage === 'overview' ? 'Dashboard Overview' : navItems.find(n => n.id === currentPage)?.label || currentPage}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Device Status */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-300">Device Online</span>
              </div>
              {/* Time */}
              <div className="hidden sm:flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs">{currentTime.toLocaleTimeString()}</span>
              </div>
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-300">{userName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#1a3530] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/5">
                        <p className="text-sm font-medium text-white">{userName}</p>
                        <p className="text-xs text-gray-400">{userEmail}</p>
                        {isDemo && <p className="text-xs text-amber-400 mt-1">Demo Account</p>}
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { onNavigate('settings'); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto px-3 py-4 sm:px-5 lg:p-8">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
