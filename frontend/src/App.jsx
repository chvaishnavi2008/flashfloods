import React from 'react';
import { useApp } from './context/AppContext';

// 1. Citizen Portal Components (LOCKED & APPROVED)
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import CitizenHomePage from './pages/CitizenHomePage';
import CitizenDangerMapPage from './pages/CitizenDangerMapPage';
import CitizenSafePlacesPage from './pages/CitizenSafePlacesPage';
import CitizenEvacuationPage from './pages/CitizenEvacuationPage';
import CitizenEmergencyHelpPage from './pages/CitizenEmergencyHelpPage';

// 2. Authority SEOC Command Components (DEDICATED INSTITUTIONAL SUITE)
import AuthorityHeader from './components/authority/AuthorityHeader';
import AuthoritySidebar from './components/authority/AuthoritySidebar';
import AuthorityDashboardPage from './pages/authority/AuthorityDashboardPage';

import RescueOperationsPage from './pages/RescueOperationsPage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import AlertsPage from './pages/AlertsPage';
import ImpactAssessmentPage from './pages/ImpactAssessmentPage';
import EmergencyResponsePage from './pages/EmergencyResponsePage';
import AiRiskEnginePage from './pages/AiRiskEnginePage';
import LocationRiskPage from './pages/LocationRiskPage';
import SimulationStudioPage from './pages/SimulationStudioPage';
import SettingsPage from './pages/SettingsPage';
import AiMapStudioPage from './pages/AiMapStudioPage';

// Modals
import NotificationModal from './components/NotificationModal';
import EarlyWarningAlertModal from './components/EarlyWarningAlertModal';
import AlertHistoryModal from './components/AlertHistoryModal';
import CitizenSosModal from './components/CitizenSosModal';

export default function App() {
  const { 
    activePage, 
    userRole, 
    isAlertHistoryOpen, 
    setIsAlertHistoryOpen,
    isGlobalSosOpen,
    setIsGlobalSosOpen 
  } = useApp();

  const isAuthority = userRole === 'authority';

  const renderActivePage = () => {
    // 1. Citizen Safety Experience (100% Focused & Simplified)
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
        case 'location-risk':
          return <LocationRiskPage />;
        case 'settings':
          return <SettingsPage />;
        case 'dashboard':
        default:
          return <CitizenHomePage />;
      }
    }

    // 2. Authority SEOC Command Experience (Dedicated Government Command Dashboard)
    switch (activePage) {
      case 'rescue-operations':
        return <RescueOperationsPage />;
      case 'ai-map-studio':
        return <AiMapStudioPage />;
      case 'risk-intelligence':
      case 'map':
        return <RiskIntelligencePage />;
      case 'location-risk':
        return <LocationRiskPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'impact-assessment':
        return <ImpactAssessmentPage />;
      case 'emergency-response':
        return <EmergencyResponsePage />;
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
    <div className="min-h-screen flex flex-col bg-[#F5F7F9] text-[#172B3A] selection:bg-[#1769AA] selection:text-white">
      {/* Dynamic Header: Institutional AuthorityHeader vs Approved Citizen Navbar */}
      {isAuthority ? <AuthorityHeader /> : <Navbar />}

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Navigation: Institutional AuthoritySidebar vs Approved Citizen Sidebar */}
        {isAuthority ? <AuthoritySidebar /> : <Sidebar />}

        {/* Scrollable Workspace Canvas */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden ${
          isAuthority ? 'p-3 sm:p-4 lg:p-4 bg-[#F5F7F9]' : 'p-3 sm:p-4 lg:p-8 bg-[#F5F7F9]'
        } pb-24 lg:pb-8`}>
          <div className={isAuthority ? 'max-w-full mx-auto' : 'max-w-7xl mx-auto'}>
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Official Early Warning Broadcast Modal */}
      <EarlyWarningAlertModal />

      {/* Prototype SMS / Push Notification Popup */}
      <NotificationModal />

      {/* Alert History & Archive Management Drawer */}
      <AlertHistoryModal isOpen={isAlertHistoryOpen} onClose={() => setIsAlertHistoryOpen(false)} />

      {/* Global Citizen SOS Modal Triggered by Bottom Nav or Any Header */}
      <CitizenSosModal isOpen={isGlobalSosOpen} onClose={() => setIsGlobalSosOpen(false)} />
    </div>
  );
}
