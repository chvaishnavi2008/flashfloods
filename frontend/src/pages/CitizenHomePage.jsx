import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import CitizenSosModal from '../components/CitizenSosModal';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  HeartPulse, 
  Building2, 
  CheckCircle2, 
  PhoneCall, 
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';

export default function CitizenHomePage() {
  const { 
    selectedLocation, 
    locationRisk, 
    environmentalData, 
    setActivePage,
    alerts 
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  const level = locationRisk?.overall_level || 'LOW';
  const isCritical = level === 'CRITICAL';
  const isHigh = level === 'HIGH';
  const isModerate = level === 'MODERATE';
  const isLow = level === 'LOW';

  // 1. Plain-Language Status Definition
  const statusConfig = {
    LOW: {
      badgeColor: 'bg-emerald-600 text-white',
      badgeText: '🟢 YOU ARE SAFE',
      title: 'No immediate danger in your area.',
      explanation: 'Weather and river water levels are normal. It is safe to carry on regular activities.',
      themeBg: 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40',
      actions: [
        'Keep emergency numbers saved on your phone',
        'Check back for updates if rain becomes heavier',
        'Know your nearest community shelter location'
      ]
    },
    MODERATE: {
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
      badgeText: '🟡 STAY ALERT',
      title: 'Water levels and rain are rising.',
      explanation: 'Rainfall is increasing in your sector. Stay watchful near streams and low roads.',
      themeBg: 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40',
      actions: [
        'Stay away from riverbanks and swollen streams',
        'Avoid driving through water-covered roads',
        'Keep battery torch and phones fully charged',
        'Check warnings before travelling'
      ]
    },
    HIGH: {
      badgeColor: 'bg-orange-500 text-white font-black',
      badgeText: '🟠 HIGH RISK — BE READY',
      title: 'Heavy rain is increasing the chance of flooding.',
      explanation: 'Rapid water rise and slope instability detected. Prepare for potential evacuation.',
      themeBg: 'bg-gradient-to-r from-orange-950/50 via-slate-900 to-slate-900 border-orange-500/50',
      actions: [
        'Move important belongings to higher floors',
        'Pack emergency bag with medicine, water, and documents',
        'Stay away from steep hillsides and river bridges',
        'Know your evacuation route to the safe shelter'
      ]
    },
    CRITICAL: {
      badgeColor: 'bg-red-600 text-white font-black animate-pulse',
      badgeText: '🔴 TAKE ACTION NOW',
      title: 'Dangerous flood surge and landslides imminent.',
      explanation: 'Extreme deluge has overwhelmed river channels. Immediate evacuation to high ground required.',
      themeBg: 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-500/80 ring-2 ring-red-500/40',
      actions: [
        'Move to higher ground immediately',
        'Stay away from rivers and flooded low areas',
        'Do not attempt to cross moving water or bridges',
        'Head directly to Chamoli Safe Shelter'
      ]
    }
  };

  const currentStatus = statusConfig[level] || statusConfig.LOW;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. AM I SAFE? (Current Status Hero Banner)                                */}
      {/* ========================================================================= */}
      <section className={`rounded-2xl p-6 sm:p-8 border shadow-2xl transition-all ${currentStatus.themeBg}`}>
        <div className="space-y-4">
          {/* Top Status Pill & Location */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-md ${currentStatus.badgeColor}`}>
              {currentStatus.badgeText}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-700">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>{selectedLocation?.name || 'Chamoli'}, {selectedLocation?.state || 'Uttarakhand'}</span>
            </div>
          </div>

          {/* Large Plain Headline */}
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
            {currentStatus.title}
          </h1>

          {/* Simple Explanation */}
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
            {currentStatus.explanation}
          </p>

          {/* Hazard & Simple Risk Level */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>Current Hazard: <strong className="text-white">{locationRisk?.primary_hazard || 'Flash Flood'}</strong></span>
            <span>•</span>
            <span>Risk Level: <strong className="text-white">{level}</strong></span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. WHAT SHOULD I DO? (Simple Checkbox Action Directives)                  */}
      {/* ========================================================================= */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              WHAT SHOULD I DO RIGHT NOW?
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">
            Simple Safety Steps
          </span>
        </div>

        {/* 2-4 Action Bullet Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentStatus.actions.map((action, idx) => (
            <div key={idx} className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">{action}</span>
            </div>
          ))}
        </div>

        {/* 3 Large Action Buttons (Unmissable Citizen CTAs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <button
            onClick={() => setActivePage('safe-locations')}
            className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all"
          >
            <Building2 className="w-5 h-5" />
            <span>FIND SAFE PLACE</span>
          </button>

          <button
            onClick={() => setActivePage('evacuation')}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <Navigation className="w-5 h-5" />
            <span>EVACUATION ROUTE</span>
          </button>

          <button
            onClick={() => setIsSosOpen(true)}
            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20 transition-all"
          >
            <HeartPulse className="w-5 h-5 animate-pulse" />
            <span>EMERGENCY HELP (SOS)</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHERE IS THE DANGER? (Simple Danger Map with Clean Legend)              */}
      {/* ========================================================================= */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              🗺️ DANGER MAP
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Shows flooded zones, safe shelters, and high-risk slopes in your neighborhood.
            </p>
          </div>

          {/* Simple Legend */}
          <div className="flex items-center gap-3 text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Watch</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Danger Zone</span>
          </div>
        </div>

        {/* Map View */}
        <RiskMap height="400px" showRoute={isCritical || isHigh} />

        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>Tap on any colored area to see simple safety instructions.</span>
          <button
            onClick={() => setActivePage('map')}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <span>Open Full Danger Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EMERGENCY CONTACT NUMBERS (Quick Toll-Free Helplines)                  */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">24/7 Disaster Helpline Contacts</h3>
            <p className="text-xs text-slate-400">Direct connection to National & State Disaster Management Authorities</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="tel:112"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <span>National Emergency: 112</span>
          </a>
          <a
            href="tel:1070"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
          >
            <span>State Disaster SDMA: 1070</span>
          </a>
        </div>
      </section>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
