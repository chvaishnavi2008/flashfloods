import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  X, 
  Smartphone, 
  Navigation, 
  MapPin, 
  Clock, 
  Users, 
  Info, 
  CheckCircle2, 
  Radio, 
  ArrowRight,
  MessageSquare,
  Bell,
  Send,
  Building2,
  PhoneCall
} from 'lucide-react';

export default function EarlyWarningAlertModal() {
  const { 
    showEmergencyModal, 
    setShowEmergencyModal, 
    activeAlert, 
    isSirenMuted, 
    toggleSirenMute, 
    selectedLocation, 
    safeLocations, 
    setActivePage,
    resolveAlert,
    userRole
  } = useApp();

  const [activeChannelTab, setActiveChannelTab] = useState('in_app'); // in_app, sms, whatsapp, browser
  const [browserPerm, setBrowserPerm] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Trigger Native Browser Notification if permitted
  useEffect(() => {
    if (showEmergencyModal && activeAlert && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(activeAlert.title || "🚨 CRITICAL EMERGENCY WARNING", {
            body: `Location: ${activeAlert.location_name || selectedLocation?.name || 'Sector'}\n${activeAlert.message || 'Evacuate to higher ground immediately.'}`,
            icon: '/favicon.ico',
            requireInteraction: true
          });
        } catch (e) {
          console.log('[BrowserNotification] Notification display notice:', e);
        }
      }
    }
  }, [showEmergencyModal, activeAlert]);

  if (!showEmergencyModal || !activeAlert) return null;

  const handleRequestBrowserPerm = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPerm(perm);
      if (perm === 'granted') {
        new Notification("PralayWatch Notifications Enabled", {
          body: "You will receive instant multi-hazard emergency broadcast warnings on your desktop.",
          icon: '/favicon.ico'
        });
      }
    }
  };

  const isCritical = activeAlert.severity === 'CRITICAL' || activeAlert.severity === 'EMERGENCY WARNING';
  const isHigh = activeAlert.severity === 'HIGH' || activeAlert.severity === 'WARNING';
  const nearestShelter = safeLocations && safeLocations.length > 0 ? safeLocations[0] : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`max-w-2xl w-full rounded-2xl border-2 shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh] ${
        isCritical 
          ? 'bg-[#140b0e] border-red-500 shadow-red-950/60 ring-4 ring-red-500/20' 
          : 'bg-[#14120b] border-orange-500 shadow-orange-950/60 ring-2 ring-orange-500/20'
      }`}>
        
        {/* 1. Modal Top Flash Bar */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          isCritical ? 'bg-red-600' : 'bg-orange-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/30 rounded-lg animate-bounce">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest block opacity-90">
                OFFICIAL EARLY WARNING BROADCAST
              </span>
              <h2 className="text-lg lg:text-xl font-black tracking-tight leading-tight">
                {activeAlert.title || (isCritical ? '🚨 CRITICAL FLASH FLOOD WARNING' : '⚠ HIGH-SEVERITY HAZARD WARNING')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSirenMute}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-xl transition-all text-xs font-mono flex items-center gap-1.5"
              title={isSirenMuted ? "Unmute Emergency Siren" : "Mute Siren"}
            >
              {isSirenMuted ? <VolumeX className="w-4 h-4 text-red-200" /> : <Volume2 className="w-4 h-4 text-white animate-pulse" />}
              <span className="hidden sm:inline">{isSirenMuted ? 'Muted' : 'Siren'}</span>
            </button>
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Channel Switcher Tabs (In-App / SMS / WhatsApp / Browser) */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Channel:</span>
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
                  ? (isCritical ? 'bg-red-600/30 text-red-300 border border-red-500/50' : 'bg-orange-600/30 text-orange-300 border border-orange-500/50')
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-slate-300 font-normal">
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* 2. Modal Body Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto font-mono text-xs">
          
          {/* TAB 1: In-App Core Structured Warning View */}
          {activeChannelTab === 'in_app' && (
            <div className="space-y-4">
              {/* Structured Key-Value Alert Box (Matching User Format) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block font-bold">Affected Location:</span>
                    <strong className="text-white text-sm flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{activeAlert.location_name || `${selectedLocation?.name || 'Chamoli'}, ${selectedLocation?.state || 'Uttarakhand'}`}</span>
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block font-bold">Risk Assessment:</span>
                    <strong className={`text-sm flex items-center gap-1.5 mt-0.5 ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                      <span>87/100 — {activeAlert.severity || 'CRITICAL'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-600/20 rounded border border-red-500/40">
                        {activeAlert.status || 'ACTIVE'}
                      </span>
                    </strong>
                  </div>
                </div>

                {/* Reason for Alert */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-bold block">💡 Reason for Alert:</span>
                  <p className="text-slate-200 text-xs leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {activeAlert.reason || "Extreme rainfall + rapidly rising river level + high terrain susceptibility."}
                  </p>
                </div>

                {/* Immediate Action */}
                <div className="space-y-1">
                  <span className="text-emerald-400 text-[11px] font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>⚡ Immediate Action Directive:</span>
                  </span>
                  <p className="text-emerald-300 text-xs leading-relaxed bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/40 font-semibold">
                    {activeAlert.immediate_action || "Move away from low-lying areas and avoid river crossings immediately."}
                  </p>
                </div>

                {/* Demographics & Next Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase block">Estimated Population at Risk:</span>
                    <strong className="text-blue-400 text-sm mt-0.5 block">
                      ~{(activeAlert.affected_population || 12400).toLocaleString()} residents
                    </strong>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase block">Recommended Next Step:</span>
                    <span className="text-slate-300 text-xs mt-0.5 block">
                      {activeAlert.recommended_next_step || `Evacuate toward ${selectedLocation?.name || 'Sector'} High-Ground Safe Shelter.`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nearest Shelter Quick Navigation Bar */}
              {nearestShelter && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-white text-xs block">{nearestShelter.name}</strong>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {nearestShelter.distance_km} km away • ~{nearestShelter.est_walking_mins} mins walk • {nearestShelter.capacity - nearestShelter.current_occupancy} spots available
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEmergencyModal(false);
                      setActivePage('safe-locations');
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-md"
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
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span>SIMULATED CELL BROADCAST (CDAC / NIC SMS)</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                </span>
              </div>

              {/* Smartphone mockup */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>From: <strong>GOV-SDMA-ALERT</strong></span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                </div>
                <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-3.5 text-white leading-relaxed text-xs">
                  <p className="font-bold text-red-300 mb-1">
                    {activeAlert.title || '🚨 CRITICAL FLASH FLOOD WARNING'}
                  </p>
                  <p>
                    {activeAlert.location_name || 'Chamoli, Uttarakhand'}: Extreme hazard risk detected. Move to higher ground immediately. Avoid all river crossings. Nearest shelter: {nearestShelter?.name || 'Govt High-Ground Shelter'}. Helpline: 112 / 1070.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 text-[11px]">
                <strong>Notification Simulation:</strong> Simulated SMS broadcast interface for prototype evaluation. No commercial telco charges or live SMS credits are consumed.
              </div>
            </div>
          )}

          {/* TAB 3: Simulated WhatsApp Community Alert View */}
          {activeChannelTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span>SIMULATED WHATSAPP DISASTER INTELLIGENCE BOT</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Interactive Session
                </span>
              </div>

              {/* WhatsApp chat mockup */}
              <div className="bg-[#0b141a] border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="bg-[#005c4b] text-white p-3.5 rounded-xl rounded-tl-none text-xs leading-relaxed max-w-lg space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-200">
                    <ShieldAlert className="w-4 h-4" />
                    <span>PralayWatch Verified Citizen Advisory</span>
                  </div>
                  <p>
                    🚨 <strong>{activeAlert.title || 'EMERGENCY RED ALERT'}</strong> in {activeAlert.location_name || 'Chamoli, Uttarakhand'}.
                  </p>
                  <p className="text-emerald-100">
                    👉 <strong>Action:</strong> {activeAlert.immediate_action || 'Move to higher ground immediately.'}
                  </p>
                  <div className="pt-2 border-t border-emerald-600/50 flex gap-2">
                    <button 
                      onClick={() => {
                        setShowEmergencyModal(false);
                        setActivePage('safe-locations');
                      }}
                      className="px-2.5 py-1 bg-white text-[#0b141a] rounded font-bold text-[11px]"
                    >
                      📍 Open Shelter GPS Route
                    </button>
                    <a href="tel:112" className="px-2.5 py-1 bg-red-600 text-white rounded font-bold text-[11px]">
                      🆘 Call 112 SOS
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 text-[11px]">
                <strong>Notification Simulation:</strong> Architecture structured for pluggable Meta WhatsApp Cloud API integration in Phase 2.
              </div>
            </div>
          )}

          {/* TAB 4: Browser Notification Setup */}
          {activeChannelTab === 'browser' && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <strong className="text-white text-sm">HTML5 Web Notification API</strong>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  browserPerm === 'granted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {browserPerm === 'granted' ? 'ENABLED & ACTIVE' : 'PERMISSION REQUIRED'}
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Enable desktop and mobile browser notifications to receive immediate audible warnings even when the PralayWatch tab is running in the background.
              </p>

              {browserPerm !== 'granted' && (
                <button
                  onClick={handleRequestBrowserPerm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Grant Browser Notification Permission</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Modal Bottom Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            Emergency Helpline: <a href="tel:112" className="text-white font-bold underline">112</a> / <a href="tel:1070" className="text-white font-bold underline">1070</a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {userRole === 'authority' && activeAlert.id && (
              <button
                onClick={async () => {
                  await resolveAlert(activeAlert.id);
                  setShowEmergencyModal(false);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold font-mono"
              >
                Mark Alert Resolved
              </button>
            )}

            <button
              onClick={() => {
                setShowEmergencyModal(false);
                setActivePage('safe-locations');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 shadow-md w-full sm:w-auto justify-center"
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
