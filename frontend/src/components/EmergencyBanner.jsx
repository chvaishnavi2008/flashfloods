import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Siren, ShieldAlert, ArrowRight, Volume2, VolumeX } from 'lucide-react';

export default function EmergencyBanner() {
  const {
    locationRisk,
    selectedLocation,
    activeAlert,
    setShowEmergencyModal,
    isSirenActive,
    isSirenMuted,
    toggleSiren,
    setActivePage
  } = useApp();

  const isCritical = locationRisk?.overall_level === 'CRITICAL' || activeAlert?.severity === 'CRITICAL';
  const isHigh = locationRisk?.overall_level === 'HIGH' || activeAlert?.severity === 'HIGH';

  if (!isCritical && !isHigh) return null;

  return (
    <aside
      aria-label="Emergency Hazard Warning"
      className={`w-full border-y px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl transition-all ${
        isCritical
          ? 'bg-red-950 border-red-500 text-red-100 siren-active'
          : 'bg-orange-950 border-orange-500 text-orange-100'
      }`}
    >
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className={`p-2 rounded-full ${isCritical ? 'bg-red-600 text-white animate-bounce' : 'bg-orange-600 text-white'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-black/40 border border-white/20">
              {isCritical ? 'CRITICAL EMERGENCY WARNING' : 'HIGH DISASTER THREAT'}
            </span>
            <span className="text-xs font-mono opacity-80 hidden sm:inline">
              Sector: {selectedLocation?.name || 'Vulnerable Zone'}
            </span>
          </div>
          <p className="text-xs md:text-sm font-medium mt-0.5">
            {activeAlert?.title || `Rapid multi-hazard escalation detected. Immediate evacuation recommended to nearest safe zones.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <button
          onClick={toggleSiren}
          className="px-2.5 py-1.5 bg-black/50 hover:bg-black/70 border border-white/20 rounded text-xs font-mono flex items-center gap-1.5"
        >
          {isSirenMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
          <span className="hidden lg:inline">{isSirenMuted ? 'Unmute Siren' : 'Mute Siren'}</span>
        </button>

        <button
          onClick={() => {
            setActivePage('safe-locations');
          }}
          className="px-3 py-1.5 bg-white text-red-950 hover:bg-slate-100 rounded text-xs font-bold font-mono flex items-center gap-1 shadow-md transition-all shrink-0"
        >
          <span>Find Safe Location</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setShowEmergencyModal(true)}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold font-mono uppercase tracking-wider shrink-0"
        >
          Directive
        </button>
      </div>
    </aside>
  );
}
