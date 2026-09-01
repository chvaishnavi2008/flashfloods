import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import WhatShouldIDoPanel from '../components/WhatShouldIDoPanel';
import SafeLocationList from '../components/SafeLocationList';
import CitizenSosModal from '../components/CitizenSosModal';
import { 
  ShieldCheck, 
  Navigation, 
  MapPin, 
  PhoneCall, 
  HeartPulse, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Plus, 
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function EmergencyResponsePage() {
  const { 
    selectedLocation, 
    safeLocations, 
    locationRisk, 
    userRole,
    sosRequests 
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  STAGE 6 EMERGENCY RESPONSE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/40">
                  LIFE-SAFETY DIRECTIVES
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                Emergency Response & Safe Shelter Logistics
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg animate-pulse"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Request SOS Rescue</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Actionable life-safety directives, safe evacuation routes, designated structural relief shelters, and 24/7 National Disaster Response Helplines for <strong className="text-white">{selectedLocation?.name || 'Chamoli'}</strong>.
        </p>
      </div>

      {/* 1. Primary Action Guidance ("WHAT SHOULD I DO RIGHT NOW?") */}
      <section>
        <WhatShouldIDoPanel />
      </section>

      {/* 2. Safe Shelter List & Evacuation Routes */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <Building2 className="w-4 h-4" />
            <span>Designated Safe Shelters in {selectedLocation?.name || 'Sector'} ({safeLocations.length} Registered)</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Demo Safe Locations
          </span>
        </div>

        <SafeLocationList />
      </section>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
