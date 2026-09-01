import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthorityHeader from './components/AuthorityHeader';
import AuthoritySidebar from './components/AuthoritySidebar';
import NotificationModal from './components/NotificationModal';
import EarlyWarningAlertModal from './components/EarlyWarningAlertModal';
import AlertHistoryModal from './components/AlertHistoryModal';

// Citizen-First Simple Pages
import CitizenHomePage from './pages/CitizenHomePage';
import CitizenDangerMapPage from './pages/CitizenDangerMapPage';
import CitizenSafePlacesPage from './pages/CitizenSafePlacesPage';
import CitizenEvacuationPage from './pages/CitizenEvacuationPage';
import CitizenEmergencyHelpPage from './pages/CitizenEmergencyHelpPage';

// Authority Command Technical Workspaces
import AuthorityPage from './pages/AuthorityPage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import AlertsPage from './pages/AlertsPage';
import ImpactAssessmentPage from './pages/ImpactAssessmentPage';
import EmergencyResponsePage from './pages/EmergencyResponsePage';
import AiRiskEnginePage from './pages/AiRiskEnginePage';
import SimulationStudioPage from './pages/SimulationStudioPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { activePage, userRole, isAlertHistoryOpen, setIsAlertHistoryOpen } = useApp();

  const isAuthority = userRole === 'authority';

  const renderActivePage = () => {
    // 1. Citizen Experience (Simple, Actionable, High-Contrast)
    if (!isAuthority) {
      switch (activePage) {
        case 'map':
          return <CitizenDangerMapPage />;
        case 'safe-locations':
          return <CitizenSafePlacesPage />;
        case 'evacuation':
          return <CitizenEvacuationPage />;
        case 'emergency-help':
          return <CitizenEmergencyHelpPage />;
        case 'alerts':
          return <AlertsPage />;
        case 'settings':
          return <SettingsPage />;
        case 'dashboard':
        default:
          return <CitizenHomePage />;
      }
    }

    // 2. Authority SEOC Command Experience (Full Technical Multi-Hazard Intelligence)
    switch (activePage) {
      case 'risk-intelligence':
      case 'map':
        return <RiskIntelligencePage />;
      case 'alerts':
        return <AlertsPage />;
      case 'impact-assessment':
        return <ImpactAssessmentPage />;
      case 'emergency-response':
      case 'safe-locations':
        return <EmergencyResponsePage />;
      case 'ai-risk-engine':
        return <AiRiskEnginePage />;
      case 'simulation-studio':
        return <SimulationStudioPage />;
      case 'settings':
        return <SettingsPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'authority':
      default:
        return <AuthorityPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-red-600 selection:text-white ${
      isAuthority ? 'bg-[#070B14] text-slate-200' : 'bg-[#0F172A] text-slate-100'
    }`}>
      {/* Dynamic Header: Institutional AuthorityHeader vs Citizen Navbar */}
      {isAuthority ? <AuthorityHeader /> : <Navbar />}

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Navigation: Institutional AuthoritySidebar vs Citizen Sidebar */}
        {isAuthority ? <AuthoritySidebar /> : <Sidebar />}

        {/* Scrollable Workspace Canvas */}
        <main className={`flex-1 overflow-y-auto ${
          isAuthority ? 'p-3 lg:p-5 bg-[#070B14]' : 'p-4 lg:p-8 bg-[#0F172A]'
        }`}>
          <div className={isAuthority ? 'max-w-full mx-auto' : 'max-w-7xl mx-auto'}>
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Official Early Warning Broadcast Modal (In-App & Multi-Channel Simulation) */}
      <EarlyWarningAlertModal />

      {/* Prototype SMS / Push Notification Popup */}
      <NotificationModal />

      {/* Alert History & Archive Management Drawer */}
      <AlertHistoryModal isOpen={isAlertHistoryOpen} onClose={() => setIsAlertHistoryOpen(false)} />
    </div>
  );
}
