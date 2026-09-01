import React from 'react';
import { useApp } from '../../context/AppContext';
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
  Building
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
    loading
  } = useApp();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="bg-[#0B1120] border-b border-slate-700/80 px-4 lg:px-6 py-2.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
      {/* 1. Official Government Header Left Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-slate-900 border border-slate-600 flex items-center justify-center text-red-400 font-bold shrink-0">
          <Building className="w-5 h-5 text-slate-200" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-sm lg:text-base tracking-wider text-white uppercase">
              PRALAYWATCH
            </h1>
            <span className="text-slate-500 font-bold hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-tight">
              MULTI-HAZARD EARLY WARNING & RISK INTELLIGENCE PLATFORM
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-950 text-red-300 border border-red-600/60 font-bold tracking-wider uppercase">
              AUTHORITY COMMAND CENTRE
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-medium">
              Prototype / Demonstration
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center Administrative Telemetry & Status Bar */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-[11px]">
        {/* Sector Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-400">Sector:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => selectLocation(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                {loc.name} ({loc.state})
              </option>
            ))}
          </select>
        </div>

        {/* Operational Status Tag */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-300 font-bold">SYSTEM STATUS: OPERATIONAL</span>
        </div>

        {/* Time Stamp */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>LAST UPDATED: {currentTime} IST</span>
        </div>

        {/* Simulation / Demo Feed Indicator */}
        <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded font-bold">
          <Server className="w-3.5 h-3.5" />
          <span>DATA SOURCE: LIVE / SIMULATION FEED</span>
        </div>
      </div>

      {/* 3. Right Controls: Siren Toggle, Role Switch to Citizen, Refresh */}
      <div className="flex items-center gap-2">
        {/* Siren Mute Toggle */}
        <button
          onClick={toggleSiren}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-bold transition-all ${
            isSirenActive && !isSirenMuted
              ? 'bg-red-900/80 border-red-500 text-white animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          {isSirenMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-red-400" />}
          <span>{isSirenMuted ? 'Muted' : 'Siren'}</span>
        </button>

        {/* Switch to Citizen Safety Portal Button */}
        <button
          onClick={() => {
            setUserRole('citizen');
            setActivePage('dashboard');
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-300 border border-blue-500/40 rounded text-[11px] font-bold transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Switch to Citizen Safety</span>
        </button>

        {/* Telemetry Refresh Button */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="p-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded transition-colors"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
