import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Activity, 
  RefreshCw, 
  MapPin, 
  UserCheck, 
  Radio, 
  Clock, 
  Volume2, 
  VolumeX, 
  Server,
  Building,
  Menu,
  X
} from 'lucide-react';

export default function AuthorityHeader() {
  const {
    setUserRole,
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
    toggleMobileMenu
  } = useApp();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="bg-[#123047] border-b border-[#294657] px-3 sm:px-4 lg:px-6 py-2.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-white">
      {/* 1. Official Government Header Left Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg bg-[#0B2233] border border-[#294657] text-[#D7E0E7] hover:text-white shrink-0"
            aria-label="Toggle Authority Navigation"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-[#C62828]" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-[#0B2233] border border-[#294657] flex items-center justify-center text-[#1769AA] font-bold shrink-0">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <h1 className="font-bold text-sm sm:text-base tracking-wider text-white uppercase truncate">
                AAPDASETU
              </h1>
              <span className="text-[#D7E0E7] font-bold hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-[11px] text-[#D7E0E7] font-semibold uppercase tracking-tight hidden sm:inline">
                AI-POWERED MULTI-HAZARD EARLY WARNING & EMERGENCY RESPONSE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] bg-[#C62828] text-white font-bold tracking-wider uppercase">
                AUTHORITY COMMAND CENTRE
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] bg-[#0B2233] text-[#D7E0E7] border border-[#294657] font-medium">
                Prototype / Demonstration
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Quick Refresh on Right */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-1.5 bg-[#0B2233] border border-[#294657] text-[#D7E0E7] rounded hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1769AA]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Center Administrative Telemetry & Status Bar */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3 text-[10px] sm:text-[11px]">
        {/* Sector Selector */}
        <div className="flex items-center gap-1.5 bg-[#0B2233] border border-[#294657] px-2 py-1 rounded">
          <MapPin className="w-3.5 h-3.5 text-[#1769AA] shrink-0" />
          <span className="text-[#D7E0E7] hidden sm:inline">Sector:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => selectLocation(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id} className="bg-[#0B2233] text-white">
                {loc.name} ({loc.state})
              </option>
            ))}
          </select>
        </div>

        {/* Operational Status Tag */}
        <div className="flex items-center gap-1.5 bg-[#0B2233] border border-[#294657] px-2 py-1 rounded">
          <span className="w-2 h-2 rounded-full bg-[#16855B]" />
          <span className="text-[#D7E0E7] font-bold text-[10px] sm:text-[11px]">STATUS: OPERATIONAL</span>
        </div>

        {/* Time Stamp */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#0B2233] border border-[#294657] px-2.5 py-1 rounded text-[#D7E0E7]">
          <Clock className="w-3.5 h-3.5 text-[#D7E0E7]" />
          <span>UPDATED: {currentTime} IST</span>
        </div>

        {/* Simulation / Demo Feed Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#D99A00]/20 border border-[#D99A00]/40 text-[#D99A00] px-2 py-1 rounded font-bold text-[10px]">
          <Server className="w-3.5 h-3.5" />
          <span>LIVE / SIMULATION FEED</span>
        </div>
      </div>

      {/* 3. Right Controls: Siren Toggle, Role Switch to Citizen, Refresh */}
      <div className="flex items-center gap-2">
        {/* Siren Mute Toggle */}
        <button
          onClick={toggleSiren}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] sm:text-[11px] font-bold transition-all ${
            isSirenActive && !isSirenMuted
              ? 'bg-[#C62828] border-[#C62828] text-white'
              : 'bg-[#0B2233] border-[#294657] text-[#D7E0E7] hover:text-white'
          }`}
        >
          {isSirenMuted ? <VolumeX className="w-3.5 h-3.5 text-[#D7E0E7]" /> : <Volume2 className="w-3.5 h-3.5 text-[#C62828]" />}
          <span>{isSirenMuted ? 'Muted' : 'Siren'}</span>
        </button>

        {/* Switch to Citizen Safety Portal Button */}
        <button
          onClick={() => {
            setUserRole('citizen');
            setActivePage('dashboard');
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#1769AA] hover:bg-[#125890] text-white rounded text-[10px] sm:text-[11px] font-bold transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Switch to Citizen Safety</span>
          <span className="sm:hidden">Citizen</span>
        </button>

        {/* Telemetry Refresh Button */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="hidden md:flex p-1.5 bg-[#0B2233] border border-[#294657] hover:bg-[#183D55] text-[#D7E0E7] rounded transition-colors"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1769AA]' : ''}`} />
        </button>
      </div>
    </header>
  );
}
