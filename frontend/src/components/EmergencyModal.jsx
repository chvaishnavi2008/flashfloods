import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, ShieldAlert, PhoneCall, Navigation, ArrowRight, X, Volume2, VolumeX, MapPin } from 'lucide-react';

export default function EmergencyModal() {
  const {
    showEmergencyModal,
    setShowEmergencyModal,
    selectedLocation,
    locationRisk,
    activeAlert,
    safeLocations,
    setActivePage,
    isSirenMuted,
    toggleSiren,
    stopSiren
  } = useApp();

  if (!showEmergencyModal) return null;

  const nearestShelter = safeLocations && safeLocations.length > 0 ? safeLocations[0] : null;

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => {
        stopSiren();
        setShowEmergencyModal(false);
      }}
    >
      <div 
        className="bg-[#131315] border-2 border-red-500 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl siren-active animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Header */}
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/30 rounded-xl animate-bounce">
              <AlertOctagon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest uppercase font-bold text-red-100">
                OFFICIAL DISASTER MANAGEMENT DIRECTIVE
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                ⚠ EMERGENCY WARNING
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopSiren();
              setShowEmergencyModal(false);
            }}
            title="Dismiss Alert Modal"
            className="p-2 bg-black/40 hover:bg-black/60 rounded-lg text-white font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status and Location Pill */}
          <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono text-red-300 uppercase tracking-wider block">
                  Target Sector:
                </span>
                <span className="text-lg font-bold text-white">
                  {selectedLocation?.name}, {selectedLocation?.state}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-600 text-white font-mono font-black text-xs rounded-full uppercase tracking-wider animate-pulse">
                {locationRisk?.overall_level || 'CRITICAL'} RISK
              </span>
              <span className="px-3 py-1 bg-black/50 border border-red-500/50 text-red-300 font-mono text-xs rounded-full">
                Lead Time: ~{locationRisk?.lead_time_minutes || 25} mins
              </span>
            </div>
          </div>

          {/* Alert Message */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase text-red-400 tracking-wider">
              Hazard Assessment & Trigger:
            </h3>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {activeAlert?.message ||
                `Heavy cloudburst rainfall and river tributary runoff have triggered critical flash-flood and slope failure thresholds in ${selectedLocation?.name}. Immediate evacuation protocols are in effect.`}
            </p>
          </div>

          {/* Immediate Action Protocol */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4">
            <h4 className="font-mono text-xs font-bold uppercase text-amber-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Mandatory Life-Safety Actions:</span>
            </h4>
            <ul className="text-xs md:text-sm text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Move immediately toward higher ground or designated shelter structures.</li>
              <li>Avoid river channels, drainage culverts, bridges, and unstable mountain roads.</li>
              <li>Do not drive or walk through moving water or loose debris.</li>
            </ul>
          </div>

          {/* Nearest Safe Shelter Box */}
          {nearestShelter && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                  Nearest Designated Safe Zone:
                </span>
                <span className="font-bold text-white text-base">
                  {nearestShelter.name}
                </span>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  {nearestShelter.distance_km} km away • Est. {nearestShelter.est_walking_mins} mins walk • Status: <span className="text-emerald-400 font-semibold">{nearestShelter.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => {
                setShowEmergencyModal(false);
                setActivePage('safe-locations');
              }}
              className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>FIND SAFE SHELTER</span>
            </button>

            <button
              onClick={() => {
                setShowEmergencyModal(false);
                setActivePage('map');
              }}
              className="py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              <span>VIEW RISK MAP</span>
            </button>

            <a
              href="tel:112"
              className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-red-400" />
              <span>CALL 112 (NDRF)</span>
            </a>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <button
            onClick={toggleSiren}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            {isSirenMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />}
            <span>{isSirenMuted ? 'Alert Siren is Muted' : 'Alert Siren is Playing'}</span>
          </button>
          <button
            onClick={() => {
              stopSiren();
              setShowEmergencyModal(false);
            }}
            className="text-slate-400 hover:text-white underline"
          >
            Acknowledge & Dismiss Modal
          </button>
        </div>
      </div>
    </div>
  );
}
