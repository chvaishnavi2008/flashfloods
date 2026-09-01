import React from 'react';
import { useApp } from './context/AppContext';

// 1. Citizen Portal Components (LOCKED & APPROVED)
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CitizenHomePage from './pages/CitizenHomePage';
import CitizenDangerMapPage from './pages/CitizenDangerMapPage';
import CitizenSafePlacesPage from './pages/CitizenSafePlacesPage';
import CitizenEvacuationPage from './pages/CitizenEvacuationPage';
import CitizenEmergencyHelpPage from './pages/CitizenEmergencyHelpPage';

// 2. Authority SEOC Command Components (DEDICATED INSTITUTIONAL SUITE)
import AuthorityHeader from './components/authority/AuthorityHeader';
import AuthoritySidebar from './components/authority/AuthoritySidebar';
import AuthorityDashboardPage from './pages/authority/AuthorityDashboardPage';

// Shared Technical Intelligence Workspaces (For Authority & Deep Inspection)
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import AlertsPage from './pages/AlertsPage';
import ImpactAssessmentPage from './pages/ImpactAssessmentPage';
import EmergencyResponsePage from './pages/EmergencyResponsePage';
import AiRiskEnginePage from './pages/AiRiskEnginePage';
import SimulationStudioPage from './pages/SimulationStudioPage';
import SettingsPage from './pages/SettingsPage';

// Modals
import NotificationModal from './components/NotificationModal';
import EarlyWarningAlertModal from './components/EarlyWarningAlertModal';
import AlertHistoryModal from './components/AlertHistoryModal';

export default function App() {
  const { activePage, userRole, isAlertHistoryOpen, setIsAlertHistoryOpen } = useApp();

  const isAuthority = userRole === 'authority';

  const renderActivePage = () => {
    // 1. Citizen Safety Experience (100% Locked & Approved)
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

    // 2. Authority SEOC Command Experience (Dedicated Government Command Dashboard)
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
      case 'authority':
      default:
        return <AuthorityDashboardPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-red-600 selection:text-white ${
      isAuthority ? 'bg-[#070B14] text-slate-200' : 'bg-[#0F172A] text-slate-100'
    }`}>
      {/* Dynamic Header: Institutional AuthorityHeader vs Approved Citizen Navbar */}
      {isAuthority ? <AuthorityHeader /> : <Navbar />}

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Navigation: Institutional AuthoritySidebar vs Approved Citizen Sidebar */}
        {isAuthority ? <AuthoritySidebar /> : <Sidebar />}

        {/* Scrollable Workspace Canvas */}
        <main className={`flex-1 overflow-y-auto ${
          isAuthority ? 'p-3 lg:p-4 bg-[#070B14]' : 'p-4 lg:p-8 bg-[#0F172A]'
        }`}>
          <div className={isAuthority ? 'max-w-full mx-auto' : 'max-w-7xl mx-auto'}>
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Official Early Warning Broadcast Modal */}
      <EarlyWarningAlertModal />

      {/* Prototype SMS / Push Notification Popup */}
      <NotificationModal />

      {/* Alert History & Archive Management Drawer */}
      <AlertHistoryModal isOpen={isAlertHistoryOpen} onClose={() => setIsAlertHistoryOpen(false)} />
    </div>
  );
}
