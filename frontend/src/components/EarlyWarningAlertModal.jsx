import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { soundService } from '../services/soundService';
import { 
  ShieldAlert, 
  X, 
  Volume2, 
  VolumeX, 
  Navigation, 
  Building2, 
  PhoneCall, 
  Bell, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MapPin
} from 'lucide-react';

export default function EarlyWarningAlertModal() {
  const { 
    showEmergencyModal, 
    setShowEmergencyModal, 
    activeAlert, 
    selectedLocation, 
    safeLocations,
    isSirenMuted,
    toggleSiren,
    setActivePage,
    userRole,
    resolveAlert
  } = useApp();

  const [activeChannelTab, setActiveChannelTab] = useState('in_app'); // in_app, sms, whatsapp, browser
  const [browserPerm, setBrowserPerm] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  const handleRequestBrowserPerm = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPerm(perm);
      if (perm === 'granted') {
        new Notification("AapdaSetu Multi-Hazard Alert", {
          body: activeAlert ? activeAlert.message : "Immediate multi-hazard alert triggered.",
          icon: "/favicon.ico"
        });
      }
    }
  };

  const toggleSirenMute = () => {
    toggleSiren();
  };

  if (!showEmergencyModal || !activeAlert) return null;

  const isCritical = activeAlert.severity === 'CRITICAL' || activeAlert.severity === 'EMERGENCY';
  const nearestShelter = safeLocations && safeLocations.length > 0 ? safeLocations[0] : null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
      <div className={`max-w-2xl w-full rounded-2xl border-2 shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh] bg-white dark:bg-[#111C35] transition-colors ${
        isCritical ? 'border-[#C62828]' : 'border-[#E87516]'
      }`}>
        
        {/* 1. Modal Top Flash Bar */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          isCritical ? 'bg-[#C62828]' : 'bg-[#E87516]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/20 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest block opacity-90">
                OFFICIAL EARLY WARNING BROADCAST
              </span>
              <h2 className="text-lg lg:text-xl font-black tracking-tight leading-tight font-sans">
                {activeAlert.title || (isCritical ? '🚨 CRITICAL FLASH FLOOD WARNING' : '⚠ HIGH-SEVERITY HAZARD WARNING')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSirenMute}
              className="p-2 bg-black/20 hover:bg-black/30 rounded-xl transition-all text-xs font-mono flex items-center gap-1.5"
              title={isSirenMuted ? "Unmute Emergency Siren" : "Mute Siren"}
            >
              {isSirenMuted ? <VolumeX className="w-4 h-4 text-red-100" /> : <Volume2 className="w-4 h-4 text-white" />}
              <span className="hidden sm:inline">{isSirenMuted ? 'Muted' : 'Siren'}</span>
            </button>
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="p-2 bg-black/20 hover:bg-black/30 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Channel Switcher Tabs */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1527] px-6 py-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-[#5B6B78] dark:text-slate-400 text-[10px] uppercase font-bold mr-1">Channel:</span>
          {[
            { id: 'in_app', label: '🚨 In-App Alert', badge: 'Active' },
            { id: 'sms', label: '📱 Simulated SMS', badge: 'Simulation' },
            { id: 'whatsapp', label: '💬 Simulated WhatsApp', badge: 'Simulation' },
            { id: 'browser', label: '🔔 Browser Push', badge: browserPerm === 'granted' ? 'Enabled' : 'Setup' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChannelTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeChannelTab === tab.id
                  ? (isCritical ? 'bg-[#FFF1F1] dark:bg-red-950/40 text-[#C62828] dark:text-red-300 border border-[#C62828]/50' : 'bg-[#FFF7E6] dark:bg-amber-950/40 text-[#E87516] dark:text-orange-300 border border-[#E87516]/50')
                  : 'text-[#5B6B78] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white hover:bg-white dark:hover:bg-[#111C35]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-white dark:bg-[#070F1E] text-[#5B6B78] dark:text-slate-400 border border-[#D7E0E7] dark:border-[#1E2E4A] font-normal">
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* 2. Modal Body Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
          
          {/* TAB 1: In-App Core Structured Warning View */}
          {activeChannelTab === 'in_app' && (
            <div className="space-y-4">
              {/* Structured Key-Value Alert Box */}
              <div className="bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
                  <div>
                    <span className="text-[#5B6B78] dark:text-slate-400 text-[10px] uppercase block font-bold">Affected Location:</span>
                    <strong className="text-[#172B3A] dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#C62828] shrink-0" />
                      <span>{activeAlert.location_name || `${selectedLocation?.name || 'Chamoli'}, ${selectedLocation?.state || 'Uttarakhand'}`}</span>
                    </strong>
                  </div>

                  <div>
                    <span className="text-[#5B6B78] dark:text-slate-400 text-[10px] uppercase block font-bold">Risk Assessment:</span>
                    <strong className={`text-sm flex items-center gap-1.5 mt-0.5 ${isCritical ? 'text-[#C62828] dark:text-red-400' : 'text-[#E87516] dark:text-orange-400'}`}>
                      <span>87/100 — {activeAlert.severity || 'CRITICAL'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#FFF1F1] dark:bg-red-950/40 rounded border border-[#C62828]/40">
                        {activeAlert.status || 'ACTIVE'}
                      </span>
                    </strong>
                  </div>
                </div>

                {/* Reason for Alert */}
                <div className="space-y-1">
                  <span className="text-[#172B3A] dark:text-slate-200 text-[11px] font-bold block">💡 Reason for Alert:</span>
                  <p className="text-[#172B3A] dark:text-slate-200 text-xs leading-relaxed bg-white dark:bg-[#111C35] p-2.5 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
                    {activeAlert.reason || "Extreme rainfall + rapidly rising river level + high terrain susceptibility."}
                  </p>
                </div>

                {/* Immediate Action */}
                <div className="space-y-1">
                  <span className="text-[#16855B] dark:text-emerald-400 text-[11px] font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>⚡ Immediate Action Directive:</span>
                  </span>
                  <p className="text-[#16855B] dark:text-emerald-300 text-xs leading-relaxed bg-[#EAF7F1] dark:bg-emerald-950/40 p-2.5 rounded-lg border border-[#16855B]/40 font-semibold">
                    {activeAlert.immediate_action || "Move away from low-lying areas and avoid river crossings immediately."}
                  </p>
                </div>

                {/* Demographics & Next Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white dark:bg-[#111C35] p-2.5 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
                    <span className="text-[#5B6B78] dark:text-slate-400 text-[10px] uppercase block">Estimated Population at Risk:</span>
                    <strong className="text-[#1769AA] dark:text-[#38BDF8] text-sm mt-0.5 block">
                      ~{(activeAlert.affected_population || 12400).toLocaleString()} residents
                    </strong>
                  </div>

                  <div className="bg-white dark:bg-[#111C35] p-2.5 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
                    <span className="text-[#5B6B78] dark:text-slate-400 text-[10px] uppercase block">Recommended Next Step:</span>
                    <span className="text-[#172B3A] dark:text-slate-200 text-xs mt-0.5 block">
                      {activeAlert.recommended_next_step || `Evacuate toward ${selectedLocation?.name || 'Sector'} High-Ground Safe Shelter.`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nearest Shelter Quick Navigation Bar */}
              {nearestShelter && (
                <div className="bg-[#EAF7F1] dark:bg-emerald-950/40 border border-[#16855B]/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-[#16855B] dark:text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-[#172B3A] dark:text-white text-xs block">{nearestShelter.name}</strong>
                      <span className="text-[#5B6B78] dark:text-slate-300 text-[11px] font-mono">
                        {nearestShelter.distance_km} km away • ~{nearestShelter.est_walking_mins} mins walk • {nearestShelter.capacity - nearestShelter.current_occupancy} spots available
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEmergencyModal(false);
                      setActivePage('safe-locations');
                    }}
                    className="px-3 py-2 bg-[#16855B] hover:bg-[#126d4a] text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <span>Evacuate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Simulated SMS Dispatch View */}
          {activeChannelTab === 'sms' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[#5B6B78] dark:text-slate-400 text-[11px] pb-1 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
                <span>SIMULATED CELL BROADCAST (CDAC / NIC SMS)</span>
                <span className="text-[#16855B] dark:text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                </span>
              </div>

              {/* Smartphone mockup */}
              <div className="bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-[#5B6B78] dark:text-slate-400">
                  <span>From: <strong>GOV-SDMA-ALERT</strong></span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                </div>
                <div className="bg-[#FFF1F1] dark:bg-red-950/40 border border-[#C62828]/40 rounded-xl p-3.5 text-[#172B3A] dark:text-slate-200 leading-relaxed text-xs">
                  <p className="font-bold text-[#C62828] dark:text-red-400 mb-1">
                    {activeAlert.title || '🚨 CRITICAL FLASH FLOOD WARNING'}
                  </p>
                  <p>
                    {activeAlert.location_name || 'Chamoli, Uttarakhand'}: Extreme hazard risk detected. Move to higher ground immediately. Avoid all river crossings. Nearest shelter: {nearestShelter?.name || 'Govt High-Ground Shelter'}. Helpline: 112 / 1070.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#FFF7E6] dark:bg-amber-950/40 border border-[#D99A00]/30 rounded-lg text-[#D99A00] dark:text-amber-300 text-[11px]">
                <strong>Notification Simulation:</strong> Simulated SMS broadcast interface for prototype evaluation. No commercial telco charges or live SMS credits are consumed.
              </div>
            </div>
          )}

          {/* TAB 3: Simulated WhatsApp Community Alert View */}
          {activeChannelTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[#5B6B78] dark:text-slate-400 text-[11px] pb-1 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
                <span>SIMULATED WHATSAPP DISASTER INTELLIGENCE BOT</span>
                <span className="text-[#16855B] dark:text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Interactive Session
                </span>
              </div>

              {/* WhatsApp chat mockup */}
              <div className="bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-4 space-y-2">
                <div className="bg-[#123047] dark:bg-[#0B2233] text-white p-3.5 rounded-xl rounded-tl-none text-xs leading-relaxed max-w-lg space-y-2 border border-[#294657]">
                  <div className="flex items-center gap-2 font-bold text-[#D7E0E7]">
                    <ShieldAlert className="w-4 h-4 text-[#E87516]" />
                    <span>AapdaSetu Verified Citizen Advisory</span>
                  </div>
                  <p>
                    🚨 <strong>{activeAlert.title || 'EMERGENCY RED ALERT'}</strong> in {activeAlert.location_name || 'Chamoli, Uttarakhand'}.
                  </p>
                  <p className="text-[#D7E0E7]">
                    👉 <strong>Action:</strong> {activeAlert.immediate_action || 'Move to higher ground immediately.'}
                  </p>
                  <div className="pt-2 border-t border-white/20 flex gap-2">
                    <button 
                      onClick={() => {
                        setShowEmergencyModal(false);
                        setActivePage('safe-locations');
                      }}
                      className="px-2.5 py-1 bg-white text-[#123047] rounded font-bold text-[11px]"
                    >
                      📍 Open Shelter GPS Route
                    </button>
                    <a href="tel:112" className="px-2.5 py-1 bg-[#C62828] text-white rounded font-bold text-[11px]">
                      🆘 Call 112 SOS
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-[#FFF7E6] dark:bg-amber-950/40 border border-[#D99A00]/30 rounded-lg text-[#D99A00] dark:text-amber-300 text-[11px]">
                <strong>Notification Simulation:</strong> Architecture structured for pluggable Meta WhatsApp Cloud API integration in Phase 2.
              </div>
            </div>
          )}

          {/* TAB 4: Browser Notification Setup */}
          {activeChannelTab === 'browser' && (
            <div className="space-y-3 bg-[#F8FAFC] dark:bg-[#070F1E] p-4 rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#1769AA] dark:text-[#38BDF8]" />
                  <strong className="text-[#172B3A] dark:text-white text-sm">HTML5 Web Notification API</strong>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  browserPerm === 'granted' ? 'bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-400 border border-[#16855B]/40' : 'bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border border-[#D99A00]/40'
                }`}>
                  {browserPerm === 'granted' ? 'ENABLED & ACTIVE' : 'PERMISSION REQUIRED'}
                </span>
              </div>

              <p className="text-[#5B6B78] dark:text-slate-300 text-xs leading-relaxed font-sans">
                Enable desktop and mobile browser notifications to receive immediate audible warnings even when the AapdaSetu tab is running in the background.
              </p>

              {browserPerm !== 'granted' && (
                <button
                  onClick={handleRequestBrowserPerm}
                  className="px-4 py-2 bg-[#1769AA] hover:bg-[#125890] text-white rounded-lg font-bold text-xs flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Grant Browser Notification Permission</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Modal Bottom Action Footer */}
        <div className="p-4 bg-[#F8FAFC] dark:bg-[#0B1527] border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-[#5B6B78] dark:text-slate-400">
            Emergency Helpline: <a href="tel:112" className="text-[#C62828] dark:text-red-400 font-bold underline">112</a> / <a href="tel:1070" className="text-[#1769AA] dark:text-[#38BDF8] font-bold underline">1070</a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {userRole === 'authority' && activeAlert.id && (
              <button
                onClick={async () => {
                  await resolveAlert(activeAlert.id);
                  setShowEmergencyModal(false);
                }}
                className="px-3 py-2 bg-white dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#123047] text-[#5B6B78] dark:text-slate-300 hover:text-[#172B3A] dark:hover:text-white border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-bold font-mono"
              >
                Mark Alert Resolved
              </button>
            )}

            <button
              onClick={() => {
                setShowEmergencyModal(false);
                setActivePage('safe-locations');
              }}
              className="px-4 py-2 bg-[#16855B] hover:bg-[#126d4a] text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm w-full sm:w-auto justify-center"
            >
              <Navigation className="w-4 h-4" />
              <span>Acknowledge & Evacuate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
