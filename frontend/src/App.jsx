import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmergencyBanner from './components/EmergencyBanner';
import EmergencyModal from './components/EmergencyModal';
import NotificationModal from './components/NotificationModal';

// Pages
import DashboardPage from './pages/DashboardPage';
import RiskMapPage from './pages/RiskMapPage';
import LocationRiskPage from './pages/LocationRiskPage';
import AlertsPage from './pages/AlertsPage';
import SafeLocationsPage from './pages/SafeLocationsPage';
import AuthorityPage from './pages/AuthorityPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { activePage, userRole } = useApp();

  const renderActivePage = () => {
    switch (activePage) {
      case 'map':
        return <RiskMapPage />;
      case 'location-risk':
        return <LocationRiskPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'safe-locations':
        return <SafeLocationsPage />;
      case 'authority':
        return <AuthorityPage />;
      case 'settings':
        return <SettingsPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Persistent Emergency Warning Banner if Critical / High Hazard Detected */}
      <EmergencyBanner />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Side Navigation */}
        <Sidebar />

        {/* Scrollable Page Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#0F172A]">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Urgent Emergency Directive Modal */}
      <EmergencyModal />

      {/* Prototype SMS / Push Notification Popup */}
      <NotificationModal />
    </div>
  );
}
