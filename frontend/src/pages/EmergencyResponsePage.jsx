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
    <div className="space-y-6 pb-12 font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/30 rounded-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#16855B] dark:text-[#34D399]">
                  STAGE 6 EMERGENCY RESPONSE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30">
                  LIFE-SAFETY DIRECTIVES
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#172B3A] dark:text-[#F8FAFC] mt-0.5">
                Emergency Response & Safe Shelter Logistics
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-4 py-2.5 bg-[#C62828] hover:bg-[#a82222] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm animate-pulse"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Request SOS Rescue</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] max-w-3xl leading-relaxed">
          Actionable life-safety directives, safe evacuation routes, designated structural relief shelters, and 24/7 National Disaster Response Helplines for <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{selectedLocation?.name || 'Chamoli'}</strong>.
        </p>
      </div>

      {/* 1. Primary Action Guidance ("WHAT SHOULD I DO RIGHT NOW?") */}
      <section>
        <WhatShouldIDoPanel />
      </section>

      {/* 2. Safe Shelter List & Evacuation Routes */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="flex items-center gap-2 text-[#16855B] dark:text-[#34D399] font-bold text-xs uppercase">
            <Building2 className="w-4 h-4" />
            <span>Designated Safe Shelters in {selectedLocation?.name || 'Sector'} ({safeLocations.length} Registered)</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/40 font-bold">
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
