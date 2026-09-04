import React from 'react';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  UserCheck, 
  ShieldAlert, 
  Activity, 
  RefreshCw, 
  MapPin,
  Menu,
  X,
  HeartPulse,
  Home,
  Map,
  Building2,
  Navigation,
  BellRing,
  Sparkles,
  Settings,
  Zap,
  LayoutDashboard,
  Users,
  Truck,
  Radio
} from 'lucide-react';

export default function Navbar() {
  const {
    userRole,
    setUserRole,
    activePage,
    setActivePage,
    locations,
    selectedLocationId,
    selectLocation,
    isSirenActive,
    isSirenMuted,
    toggleSiren,
    stopSiren,
    systemRisk,
    refreshData,
    loading,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    setIsGlobalSosOpen
  } = useApp();

  const isCritical = systemRisk?.stats?.critical_zones > 0;
  const isHigh = systemRisk?.stats?.high_risk_zones > 0;
  const activeAlertsCount = systemRisk?.stats?.active_alerts || 0;

  const citizenNavItems = [
    { id: 'dashboard', label: 'Home', tag: 'Am I safe?', icon: Home },
    { id: 'map', label: 'Danger Map', tag: 'Floods & slopes', icon: Map },
    { id: 'alerts', label: 'My Alerts', tag: 'Local warnings', icon: BellRing, badge: activeAlertsCount },
    { id: 'safe-locations', label: 'Safe Places', tag: 'Relief shelters', icon: Building2 },
    { id: 'evacuation', label: 'Evacuation', tag: 'Safest routes', icon: Navigation },
    { id: 'emergency-help', label: 'Emergency Help', tag: 'SOS & contacts', icon: HeartPulse, highlightRed: true }
  ];

  const authorityNavItems = [
    { id: 'authority', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'rescue-operations', label: 'Rescue Operations', icon: Truck, highlightRed: true },
    { id: 'last-mile-alert', label: 'Last-Mile Alert Demo', icon: Radio },
    { id: 'ai-map-studio', label: 'AI Map Studio', icon: Sparkles },
    { id: 'risk-intelligence', label: 'Risk Intelligence Map', icon: Map },
    { id: 'impact-assessment', label: 'Impact Assessment', icon: Users },
    { id: 'simulation-studio', label: 'Simulation Studio', icon: Zap, highlightIndigo: true },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const currentNavItems = userRole === 'authority' ? authorityNavItems : citizenNavItems;

  const handleMobileNav = (pageId) => {
    setActivePage(pageId);
    closeMobileMenu();
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 bg-[#123047] border-b border-[#294657] flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-md text-white">
        {/* Left: Hamburger (Mobile) + Brand & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-[#D7E0E7] hover:text-white bg-[#0B2233] border border-[#294657] rounded-lg hover:bg-[#183D55] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#C62828]" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Badge */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0B2233] border border-[#294657] flex items-center justify-center text-white shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#1769AA]" />
          </div>

          {/* Brand Titles */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 
                onClick={() => setActivePage(userRole === 'authority' ? 'authority' : 'dashboard')}
                className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 cursor-pointer truncate"
              >
                AapdaSetu
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1769AA]/20 text-[#D7E0E7] border border-[#1769AA]/40 whitespace-nowrap">
                v1.0 SIH PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#D7E0E7] font-mono tracking-wider truncate hidden md:block">
              AI-POWERED MULTI-HAZARD EARLY WARNING & EMERGENCY RESPONSE
            </p>
          </div>
        </div>

        {/* Center: Desktop Location Selector (Fast Switcher) */}
        <div className="hidden md:flex items-center gap-2 bg-[#0B2233] border border-[#294657] rounded-lg px-3 py-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#1769AA] shrink-0" />
          <span className="text-[#D7E0E7] font-mono text-[11px]">Sector:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => selectLocation(Number(e.target.value))}
            className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer pr-1 max-w-[180px] truncate"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id} className="bg-[#0B2233] text-white">
                {loc.name} ({loc.state})
              </option>
            ))}
          </select>
        </div>

        {/* Right Controls: Siren, Status Badge, Role Toggle, Refresh */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Software Emergency Siren Audio Control */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSiren}
              title={isSirenMuted ? "Unmute Emergency Alert Siren" : "Mute Emergency Alert Siren"}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded text-xs font-mono border transition-all ${
                isSirenActive && !isSirenMuted
                  ? 'bg-[#C62828] border-[#C62828] text-white siren-active'
                  : isSirenMuted
                  ? 'bg-[#0B2233] border-[#294657] text-[#D7E0E7] hover:text-white'
                  : 'bg-[#0B2233] border-[#294657] text-[#D7E0E7] hover:bg-[#183D55]'
              }`}
            >
              {isSirenMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-[#D7E0E7]" />
                  <span className="hidden sm:inline">Audio Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className={`w-4 h-4 ${isSirenActive ? 'text-white' : 'text-[#1769AA]'}`} />
                  <span className="hidden sm:inline">{isSirenActive ? 'Siren Active' : 'Siren Enabled'}</span>
                </>
              )}
            </button>
            
            {isSirenActive && (
              <button
                onClick={stopSiren}
                className="px-2 py-1.5 bg-[#C62828] hover:bg-[#a82222] text-white rounded text-xs font-bold font-mono"
              >
                STOP
              </button>
            )}
          </div>

          {/* Demo Simulated Data Badge (Desktop) */}
          <span className="hidden lg:flex px-2.5 py-1 rounded bg-[#D99A00]/20 border border-[#D99A00]/40 text-[#D99A00] font-mono text-[10px] font-bold items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D99A00]"></span>
            LIVE SIMULATION / DEMO DATA
          </span>

          {/* Role Switcher (Desktop) */}
          <div className="hidden sm:flex bg-[#0B2233] p-0.5 rounded-lg border border-[#294657] text-xs font-medium">
            <button
              onClick={() => {
                setUserRole('citizen');
                setActivePage('dashboard');
              }}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                userRole === 'citizen'
                  ? 'bg-[#1769AA] text-white shadow-sm font-semibold'
                  : 'text-[#D7E0E7] hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Citizen Portal</span>
              <span className="md:hidden">Citizen</span>
            </button>
            <button
              onClick={() => {
                setUserRole('authority');
                setActivePage('authority');
              }}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                userRole === 'authority'
                  ? 'bg-[#1769AA] text-white shadow-sm font-semibold'
                  : 'text-[#D7E0E7] hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Authority Command</span>
              <span className="md:hidden">Authority</span>
            </button>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle variant="icon" />

          {/* Refresh button */}
          <button
            onClick={refreshData}
            disabled={loading}
            title="Refresh real-time telemetry"
            className="p-2 text-[#D7E0E7] hover:text-white bg-[#0B2233] border border-[#294657] rounded-lg hover:bg-[#183D55] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1769AA]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[999] bg-[#0B2233]/80 backdrop-blur-sm flex flex-col justify-start animate-in fade-in duration-200"
          onClick={closeMobileMenu}
        >
          <div 
            className="w-full max-w-sm bg-[#0B2233] border-r border-[#294657] h-full p-4 overflow-y-auto space-y-4 shadow-2xl flex flex-col justify-between text-[#D7E0E7]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#294657]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#123047] border border-[#294657] flex items-center justify-center text-[#1769AA]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">AapdaSetu</h2>
                    <span className="text-[10px] font-mono text-[#D7E0E7]">Navigation Menu</span>
                  </div>
                </div>
                <button 
                  onClick={closeMobileMenu}
                  className="p-1.5 rounded-lg bg-[#123047] border border-[#294657] text-[#D7E0E7] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Sector Selector */}
              <div className="bg-[#123047] border border-[#294657] rounded-xl p-3 space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#D7E0E7] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1769AA]" />
                  <span>Monitored Sector:</span>
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    selectLocation(Number(e.target.value));
                  }}
                  className="w-full bg-[#0B2233] text-white font-mono font-bold text-xs p-2 rounded-lg border border-[#294657] focus:outline-none cursor-pointer"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id} className="bg-[#0B2233] text-white">
                      {loc.name} ({loc.state}) — {loc.current_risk?.overall_level || 'LOW'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Role Switcher */}
              <div className="bg-[#123047] border border-[#294657] rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase text-[#D7E0E7] block">
                  Select User Interface Mode:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <button
                    onClick={() => {
                      setUserRole('citizen');
                      handleMobileNav('dashboard');
                    }}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                      userRole === 'citizen'
                        ? 'bg-[#1769AA] text-white border-[#1769AA] font-bold shadow-md'
                        : 'bg-[#0B2233] text-[#D7E0E7] border-[#294657]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Citizen</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('authority');
                      handleMobileNav('authority');
                    }}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                      userRole === 'authority'
                        ? 'bg-[#1769AA] text-white border-[#1769AA] font-bold shadow-md'
                        : 'bg-[#0B2233] text-[#D7E0E7] border-[#294657]'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Authority</span>
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D7E0E7] block px-1">
                  {userRole === 'authority' ? 'SEOC Workspaces' : 'Citizen Safety Links'}
                </span>
                <nav className="space-y-1 font-mono">
                  {currentNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id || 
                      (item.id === 'authority' && activePage === 'dashboard') ||
                      (item.id === 'risk-intelligence' && activePage === 'map');

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMobileNav(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#1769AA] text-white font-bold'
                            : 'text-[#D7E0E7] hover:bg-[#183D55] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-[#D7E0E7]'
                          }`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge > 0 && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#C62828] text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Emergency SOS Button in Drawer (Citizen Mode) */}
              {userRole === 'citizen' && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      setIsGlobalSosOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-[#C62828] hover:bg-[#a82222] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>EMERGENCY SOS RESCUE</span>
                  </button>
                </div>
              )}

              {/* Mobile Drawer Theme Switcher */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D7E0E7] block px-1">
                  Color Theme:
                </span>
                <ThemeToggle variant="segmented" className="w-full" />
              </div>
            </div>

            {/* Institutional / Demo Footer */}
            <div className="pt-3 border-t border-[#294657] text-[10px] font-mono text-[#D7E0E7] space-y-1">
              <div className="flex justify-between">
                <span>System Status:</span>
                <span className="text-[#16855B] font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>Data Feed:</span>
                <span className="text-[#D99A00] font-bold">SIMULATION / DEMO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
