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
      className={`w-full border-y px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm transition-all ${
        isCritical
          ? 'bg-[#FFF1F1] dark:bg-red-950/70 border-[#C62828] text-[#172B3A] dark:text-red-100'
          : 'bg-[#FFF7E6] dark:bg-orange-950/70 border-[#E87516] text-[#172B3A] dark:text-orange-100'
      }`}
    >
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className={`p-2 rounded-full ${isCritical ? 'bg-[#C62828] text-white' : 'bg-[#E87516] text-white'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold text-xs uppercase px-2 py-0.5 rounded text-white ${
              isCritical ? 'bg-[#C62828]' : 'bg-[#E87516]'
            }`}>
              {isCritical ? 'CRITICAL EMERGENCY WARNING' : 'HIGH DISASTER THREAT'}
            </span>
            <span className="text-xs font-mono text-[#5B6B78] dark:text-slate-300 hidden sm:inline">
              Sector: {selectedLocation?.name || 'Vulnerable Zone'}
            </span>
          </div>
          <p className="text-xs md:text-sm font-medium mt-0.5 text-[#172B3A] dark:text-white">
            {activeAlert?.title || `Rapid multi-hazard escalation detected. Immediate evacuation recommended to nearest safe zones.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <button
          onClick={toggleSiren}
          className="px-2.5 py-1.5 bg-white dark:bg-[#070F1E] hover:bg-[#F8FAFC] dark:hover:bg-[#123047] border border-[#D7E0E7] dark:border-[#1E2E4A] text-[#172B3A] dark:text-slate-200 rounded text-xs font-mono flex items-center gap-1.5"
        >
          {isSirenMuted ? <VolumeX className="w-3.5 h-3.5 text-[#5B6B78] dark:text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#C62828] dark:text-red-400" />}
          <span className="hidden lg:inline">{isSirenMuted ? 'Unmute Siren' : 'Mute Siren'}</span>
        </button>

        <button
          onClick={() => {
            setActivePage('safe-locations');
          }}
          className="px-3 py-1.5 bg-[#16855B] text-white hover:bg-[#126d4a] rounded text-xs font-bold font-mono flex items-center gap-1 shadow-sm transition-all shrink-0"
        >
          <span>Find Safe Location</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setShowEmergencyModal(true)}
          className="px-3 py-1.5 bg-[#C62828] hover:bg-[#a82222] text-white rounded text-xs font-bold font-mono uppercase tracking-wider shrink-0 shadow-sm"
        >
          Directive
        </button>
      </div>
    </aside>
  );
}
