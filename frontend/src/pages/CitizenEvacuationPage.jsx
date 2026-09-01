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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl">
              <Navigation className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                LIFE-SAFETY EVACUATION GUIDANCE
              </span>
              <h1 className="text-2xl font-black text-white mt-0.5">
                🧭 Safest Way to Leave
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold font-mono">
              Simulated Route / Demo Data
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Follow recommended high-ground pathways to stay safe from flash flood surges and landslide runouts.
        </p>
      </div>

      {/* Evacuation Summary Strip (Direction / Destination / Roads to Avoid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Recommended Direction */}
        <div className="bg-[#1E293B] border border-emerald-500/50 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <Navigation className="w-4 h-4" />
            <span>Recommended Direction</span>
          </div>
          <div className="text-base font-black text-white">
            Ascend Uphill North-East
          </div>
          <p className="text-xs text-slate-300">
            Move toward high ridge contours away from valley river channels.
          </p>
        </div>

        {/* 2. Destination Shelter */}
        <div className="bg-[#1E293B] border border-blue-500/50 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
            <Building2 className="w-4 h-4" />
            <span>Designated Shelter</span>
          </div>
          <div className="text-base font-black text-white truncate">
            {shelter.name}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
            <span>Distance: <strong>~{shelter.distance_km || 1.4} km</strong></span>
            <span>•</span>
            <span>Walk time: <strong>~18 mins</strong></span>
          </div>
        </div>

        {/* 3. Roads to Avoid */}
        <div className="bg-[#1E293B] border border-red-500/50 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
            <XCircle className="w-4 h-4" />
            <span>Roads to Avoid</span>
          </div>
          <div className="text-base font-black text-white">
            Riverbank Low Road & Bridges
          </div>
          <p className="text-xs text-slate-300">
            Low-lying culverts are submerged and under high flood risk.
          </p>
        </div>
      </div>

      {/* Evacuation Route Map */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Visual Evacuation Path — {selectedLocation?.name || 'Sector'}</span>
          </h3>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safe Route Active</span>
          </span>
        </div>

        <RiskMap height="420px" showRoute={true} />
      </section>

      {/* Step-by-Step Action Directives */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
          <Footprints className="w-4 h-4 text-emerald-400" />
          <span>Step-by-Step Walking Instructions</span>
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
            <div className="text-xs sm:text-sm">
              <strong className="text-white block">Step 1: Leave low areas immediately</strong>
              <span className="text-slate-300">Do not wait for water levels to rise inside your home. Take your emergency bag and phone.</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
            <div className="text-xs sm:text-sm">
              <strong className="text-white block">Step 2: Walk uphill along Ridge Contour Highway</strong>
              <span className="text-slate-300">Stay on elevated paved surfaces. Do not walk along muddy slopes or river walls.</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
            <div className="text-xs sm:text-sm">
              <strong className="text-white block">Step 3: Arrive at {shelter.name}</strong>
              <span className="text-slate-300">Register with SDRF/community volunteers to receive food, drinking water, and dry blankets.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
