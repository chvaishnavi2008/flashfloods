import React from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Footprints, 
  PhoneCall,
  Building2
} from 'lucide-react';

export default function CitizenEvacuationPage() {
  const { selectedLocation, locationRisk, safeLocations, setActivePage } = useApp();

  const shelter = safeLocations[0] || {
    name: "Chamoli High-Ground Safe Shelter",
    distance_km: 1.4,
    capacity: 800,
    address: "Upper Ridge Hill Road, Sector 3"
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 rounded-xl">
              <Navigation className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1769AA] dark:text-[#38BDF8] font-mono">
                LIFE-SAFETY EVACUATION GUIDANCE
              </span>
              <h1 className="text-2xl font-black text-[#172B3A] dark:text-white mt-0.5">
                🧭 Safest Way to Leave
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border border-[#D99A00]/40 rounded-full text-xs font-bold font-mono">
              Live Logistics Corridor Active
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B6B78] dark:text-slate-300 max-w-3xl leading-relaxed">
          Follow recommended high-ground pathways to stay safe from flash flood surges and landslide runouts.
        </p>
      </div>

      {/* Evacuation Summary Strip (Direction / Destination / Roads to Avoid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Recommended Direction */}
        <div className="bg-white dark:bg-[#111C35] border border-emerald-500/40 dark:border-emerald-500/50 rounded-2xl p-5 shadow-sm space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-[#16855B] dark:text-emerald-400 font-bold text-xs uppercase font-mono">
            <Navigation className="w-4 h-4" />
            <span>Recommended Direction</span>
          </div>
          <div className="text-base font-black text-[#172B3A] dark:text-white">
            Ascend Uphill North-East
          </div>
          <p className="text-xs text-[#5B6B78] dark:text-slate-300">
            Move toward high ridge contours away from valley river channels.
          </p>
        </div>

        {/* 2. Destination Shelter */}
        <div className="bg-white dark:bg-[#111C35] border border-[#1769AA]/40 dark:border-blue-500/50 rounded-2xl p-5 shadow-sm space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-[#1769AA] dark:text-[#38BDF8] font-bold text-xs uppercase font-mono">
            <Building2 className="w-4 h-4" />
            <span>Designated Shelter</span>
          </div>
          <div className="text-base font-black text-[#172B3A] dark:text-white truncate">
            {shelter.name}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5B6B78] dark:text-slate-300 font-mono">
            <span>Distance: <strong className="text-[#172B3A] dark:text-white">~{shelter.distance_km || 1.4} km</strong></span>
            <span>•</span>
            <span>Walk time: <strong className="text-[#172B3A] dark:text-white">~18 mins</strong></span>
          </div>
        </div>

        {/* 3. Roads to Avoid */}
        <div className="bg-white dark:bg-[#111C35] border border-red-500/40 dark:border-red-500/50 rounded-2xl p-5 shadow-sm space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-[#C62828] dark:text-red-400 font-bold text-xs uppercase font-mono">
            <XCircle className="w-4 h-4" />
            <span>Roads to Avoid</span>
          </div>
          <div className="text-base font-black text-[#172B3A] dark:text-white">
            Riverbank Low Road & Bridges
          </div>
          <p className="text-xs text-[#5B6B78] dark:text-slate-300">
            Low-lying culverts are submerged and under high flood risk.
          </p>
        </div>
      </div>

      {/* Evacuation Route Map */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <h3 className="text-xs font-bold text-[#172B3A] dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <MapPin className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
            <span>Visual Evacuation Path — {selectedLocation?.name || 'Sector'}</span>
          </h3>
          <span className="text-xs text-[#16855B] dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safe Route Active</span>
          </span>
        </div>

        <RiskMap height="420px" showRoute={true} />
      </section>

      {/* Step-by-Step Action Directives */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#172B3A] dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A] font-mono">
          <Footprints className="w-4 h-4 text-[#16855B] dark:text-emerald-400" />
          <span>Step-by-Step Walking Instructions</span>
        </h3>

        <div className="space-y-3 font-mono">
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0D162B] rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A] flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1769AA] text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
            <div className="text-xs sm:text-sm">
              <strong className="text-[#172B3A] dark:text-white block font-sans">Step 1: Leave low areas immediately</strong>
              <span className="text-[#5B6B78] dark:text-slate-300 font-sans">Do not wait for water levels to rise inside your home. Take your emergency bag and phone.</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0D162B] rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A] flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1769AA] text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
            <div className="text-xs sm:text-sm">
              <strong className="text-[#172B3A] dark:text-white block font-sans">Step 2: Walk uphill along Ridge Contour Highway</strong>
              <span className="text-[#5B6B78] dark:text-slate-300 font-sans">Stay on elevated paved surfaces. Do not walk along muddy slopes or river walls.</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0D162B] rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A] flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1769AA] text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
            <div className="text-xs sm:text-sm">
              <strong className="text-[#172B3A] dark:text-white block font-sans">Step 3: Arrive at {shelter.name}</strong>
              <span className="text-[#5B6B78] dark:text-slate-300 font-sans">Register with SDRF/community volunteers to receive food, drinking water, and dry blankets.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
