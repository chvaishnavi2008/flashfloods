import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Volume2, VolumeX, AlertTriangle, UserCheck, ShieldAlert, Activity, RefreshCw, MapPin } from 'lucide-react';

export default function Navbar() {
  const {
    userRole,
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

  const isCritical = systemRisk?.stats?.critical_zones > 0;
  const isHigh = systemRisk?.stats?.high_risk_zones > 0;

  return (
    <header className="sticky top-0 z-50 h-16 bg-[#131315] border-b border-[#334155] flex items-center justify-between px-4 lg:px-6 shadow-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              PralayWatch
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              v1.0 SIH PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-wider hidden md:block">
            AI-POWERED MULTI-HAZARD EARLY WARNING & RISK INTELLIGENCE
          </p>
        </div>
      </div>

      {/* Center Location Selector (Fast Switcher) */}
      <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs shadow-inner">
        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-slate-400 font-mono text-[11px]">Sector:</span>
        <select
          value={selectedLocationId}
          onChange={(e) => selectLocation(e.target.value)}
          className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer pr-1"
        >
          {locations.map(loc => (
            <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
              {loc.name} ({loc.state})
            </option>
          ))}
        </select>
      </div>

      {/* Right Controls: Siren, Status Badge, Role Toggle, Refresh */}
      <div className="flex items-center gap-3">
        {/* Software Emergency Siren Audio Control */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSiren}
            title={isSirenMuted ? "Unmute Emergency Alert Siren" : "Mute Emergency Alert Siren"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-all ${
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

        {/* Live System Status Tag */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono">
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

        {/* Demo Simulated Data Badge */}
        <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          LIVE SIMULATION / DEMO DATA
        </span>

        {/* Role Switcher (Citizen vs Authority) */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs font-medium">
          <button
            onClick={() => {
              setUserRole('citizen');
              setActivePage('dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              userRole === 'citizen'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>
          <button
            onClick={() => {
              setUserRole('authority');
              setActivePage('authority');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              userRole === 'authority'
                ? 'bg-red-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Authority Command</span>
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
  );
}
