import React from 'react';
import { useApp } from '../context/AppContext';
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
  Users
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
    { id: 'ai-map-studio', label: 'AI Map Studio', tag: 'AI spatial map', icon: Sparkles, highlightCyan: true },
    { id: 'map', label: 'Danger Map', tag: 'Floods & slopes', icon: Map },
    { id: 'alerts', label: 'My Alerts', tag: 'Local warnings', icon: BellRing, badge: activeAlertsCount },
    { id: 'safe-locations', label: 'Safe Places', tag: 'Relief shelters', icon: Building2 },
    { id: 'evacuation', label: 'Evacuation', tag: 'Safest routes', icon: Navigation },
    { id: 'emergency-help', label: 'Emergency Help', tag: 'SOS & contacts', icon: HeartPulse, highlightRed: true }
  ];

  const authorityNavItems = [
    { id: 'authority', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'ai-map-studio', label: 'AI Map Studio', icon: Sparkles },
    { id: 'risk-intelligence', label: 'Risk Intelligence', icon: Map },
    { id: 'alerts', label: 'Alerts & Warnings', icon: BellRing, badge: activeAlertsCount },
    { id: 'impact-assessment', label: 'Impact Assessment', icon: Users },
    { id: 'ai-risk-engine', label: 'AI Risk Engine', icon: ShieldAlert },
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
      <header className="sticky top-0 z-50 h-16 bg-[#131315] border-b border-[#334155] flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-md">
        {/* Left: Hamburger (Mobile) + Brand & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Badge */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* Brand Titles */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 
                onClick={() => setActivePage(userRole === 'authority' ? 'authority' : 'dashboard')}
                className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 cursor-pointer truncate"
              >
                PralayWatch
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 whitespace-nowrap">
                v1.0 SIH PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wider truncate hidden md:block">
              AI-POWERED MULTI-HAZARD EARLY WARNING & RISK INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Center: Desktop Location Selector (Fast Switcher) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs shadow-inner">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-400 font-mono text-[11px]">Sector:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => selectLocation(e.target.value)}
            className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer pr-1 max-w-[180px] truncate"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
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
                  ? 'bg-red-950/80 border-red-500 text-red-300 siren-active animate-pulse'
                  : isSirenMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-900 border-slate-700 text-blue-400 hover:bg-slate-800'
              }`}
            >
              {isSirenMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Audio Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className={`w-4 h-4 ${isSirenActive ? 'text-red-400 animate-bounce' : 'text-blue-400'}`} />
                  <span className="hidden sm:inline">{isSirenActive ? 'Siren Active' : 'Siren Enabled'}</span>
                </>
              )}
            </button>
            
            {isSirenActive && (
              <button
                onClick={stopSiren}
                className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold font-mono"
              >
                STOP
              </button>
            )}
          </div>

          {/* Live System Status Tag (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isCritical
                  ? 'bg-red-500 animate-ping'
                  : isHigh
                  ? 'bg-orange-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-slate-300">
              {systemRisk?.system_status || 'SYS.ONLINE'}
            </span>
          </div>

          {/* Demo Simulated Data Badge (Desktop) */}
          <span className="hidden lg:flex px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold items-center gap-1.5 shadow-sm whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            LIVE SIMULATION / DEMO DATA
          </span>

          {/* Role Switcher (Desktop) */}
          <div className="hidden sm:flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs font-medium">
            <button
              onClick={() => {
                setUserRole('citizen');
                setActivePage('dashboard');
              }}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                userRole === 'citizen'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
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
                  ? 'bg-red-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Authority Command</span>
              <span className="md:hidden">Authority</span>
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={refreshData}
            disabled={loading}
            title="Refresh real-time telemetry"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex flex-col justify-start animate-in fade-in duration-200"
          onClick={closeMobileMenu}
        >
          <div 
            className="w-full max-w-sm bg-[#131315] border-r border-slate-700 h-full p-4 overflow-y-auto space-y-4 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">PralayWatch</h2>
                    <span className="text-[10px] font-mono text-slate-400">Navigation Menu</span>
                  </div>
                </div>
                <button 
                  onClick={closeMobileMenu}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Sector Selector */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Monitored Sector:</span>
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    selectLocation(e.target.value);
                  }}
                  className="w-full bg-slate-950 text-white font-mono font-bold text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                      {loc.name} ({loc.state}) — {loc.current_risk?.overall_level || 'LOW'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Role Switcher */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
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
                        ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
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
                        ? 'bg-red-600 text-white border-red-500 font-bold shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Authority</span>
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block px-1">
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
                            ? userRole === 'authority'
                              ? 'bg-red-600/30 text-red-200 border border-red-500/60 font-bold shadow-sm'
                              : 'bg-blue-600/30 text-blue-200 border border-blue-500/60 font-bold shadow-sm'
                            : item.highlightRed
                              ? 'text-red-300 hover:bg-red-950/40 border border-red-500/20'
                              : item.highlightCyan
                                ? 'text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/20'
                                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${
                            isActive ? (userRole === 'authority' ? 'text-red-400' : 'text-blue-400') : 'text-slate-400'
                          }`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge > 0 && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-red-600 text-white rounded-full">
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
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
                  >
                    <HeartPulse className="w-4 h-4 animate-pulse" />
                    <span>EMERGENCY SOS RESCUE</span>
                  </button>
                </div>
              )}
            </div>

            {/* Institutional / Demo Footer */}
            <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>System Status:</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>Data Feed:</span>
                <span className="text-amber-400 font-bold">SIMULATION / DEMO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
