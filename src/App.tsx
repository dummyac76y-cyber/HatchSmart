import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './components/AuthPages';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewPage } from './components/OverviewPage';
import { IncubatorPage } from './components/IncubatorPage';
import { IncubatorsPage } from './components/IncubatorsPage';
import { HatchJourneyPage } from './components/HatchJourneyPage';
import { SensorHistoryPage } from './components/SensorHistoryPage';
import { AlertsPage } from './components/AlertsPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';

// Auth Router - handles unauthenticated views
function AuthRouter() {
  const [page, setPage] = useState<string>('login');

  switch (page) {
    case 'register':
      return <RegisterPage onNavigate={setPage} />;
    case 'forgot-password':
      return <ForgotPasswordPage onNavigate={setPage} />;
    default:
      return <LoginPage onNavigate={setPage} />;
  }
}

// Dashboard Router - handles authenticated views
function DashboardRouter() {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'incubator':
        return <IncubatorPage />;
      case 'incubators':
        return <IncubatorsPage />;
      case 'journey':
        return <HatchJourneyPage />;
      case 'history':
        return <SensorHistoryPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}

// Main App Content - decides between auth and dashboard
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="12" rx="8" ry="10" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Loading SmartHatch...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthRouter />;
  }

  return <DashboardRouter />;
}

// Root App Component
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
