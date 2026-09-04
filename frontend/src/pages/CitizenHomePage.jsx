import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import LocationSearch from '../components/LocationSearch';
import CitizenSosModal from '../components/CitizenSosModal';
import LiveWeatherRiskCard from '../components/LiveWeatherRiskCard';
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
    locations,
    selectedLocation, 
    selectedLocationId, 
    selectedShelter,
    locationRisk, 
    environmentalData, 
    setActivePage,
    alerts 
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  const activeLoc = selectedLocation || locations.find(l => l.id === selectedLocationId) || locations[0];
  const level = activeLoc?.current_risk?.overall_level || locationRisk?.overall_level || 'LOW';

  // 1. Plain-Language Status Definition
  const statusConfig = {
    LOW: {
      badgeColor: 'bg-[#16855B] text-white',
      badgeText: '🟢 YOU ARE SAFE',
      title: 'No immediate danger in your area.',
      explanation: 'Weather and river water levels are normal. It is safe to carry on regular activities.',
      themeBg: 'bg-[#EAF7F1] dark:bg-emerald-950/40 border-[#16855B]/40 dark:border-emerald-600/40 text-[#172B3A] dark:text-emerald-100',
      titleColor: 'text-[#172B3A] dark:text-white',
      textColor: 'text-[#5B6B78] dark:text-emerald-200/80',
      actions: [
        'Keep emergency numbers saved on your phone',
        'Check back for updates if rain becomes heavier',
        'Know your nearest community shelter location'
      ]
    },
    MODERATE: {
      badgeColor: 'bg-[#D99A00] text-white font-bold',
      badgeText: '🟡 STAY ALERT',
      title: 'Water levels and rain are rising.',
      explanation: 'Rainfall is increasing in your sector. Stay watchful near streams and low roads.',
      themeBg: 'bg-[#FFF7E6] dark:bg-amber-950/40 border-[#D99A00]/40 dark:border-amber-600/40 text-[#172B3A] dark:text-amber-100',
      titleColor: 'text-[#172B3A] dark:text-white',
      textColor: 'text-[#5B6B78] dark:text-amber-200/80',
      actions: [
        'Stay away from riverbanks and swollen streams',
        'Avoid driving through water-covered roads',
        'Keep battery torch and phones fully charged',
        'Check warnings before travelling'
      ]
    },
    HIGH: {
      badgeColor: 'bg-[#E87516] text-white font-bold',
      badgeText: '🟠 HIGH RISK — BE READY',
      title: 'Heavy rain is increasing the chance of flooding.',
      explanation: 'Rapid water rise and slope instability detected. Prepare for potential evacuation.',
      themeBg: 'bg-[#FFF7E6] dark:bg-orange-950/40 border-[#E87516]/50 dark:border-orange-600/40 text-[#172B3A] dark:text-orange-100',
      titleColor: 'text-[#172B3A] dark:text-white',
      textColor: 'text-[#5B6B78] dark:text-orange-200/80',
      actions: [
        'Move important belongings to higher floors',
        'Pack emergency bag with medicine, water, and documents',
        'Stay away from steep hillsides and river bridges',
        'Know your evacuation route to the safe shelter'
      ]
    },
    CRITICAL: {
      badgeColor: 'bg-[#C62828] text-white font-bold',
      badgeText: '🔴 TAKE ACTION NOW',
      title: 'Dangerous flood surge and landslides imminent.',
      explanation: 'Extreme deluge has overwhelmed river channels. Immediate evacuation to high ground required.',
      themeBg: 'bg-[#FFF1F1] dark:bg-red-950/50 border-2 border-[#C62828] dark:border-red-500 text-[#172B3A] dark:text-red-100',
      titleColor: 'text-[#C62828] dark:text-red-300',
      textColor: 'text-[#172B3A] dark:text-red-200',
      actions: [
        'Move to higher ground immediately',
        'Stay away from rivers and flooded low areas',
        'Do not attempt to cross moving water or bridges',
        `Head directly to ${selectedShelter?.name || (activeLoc?.name ? `${activeLoc.name} Safe Shelter` : 'Nearest Safe Shelter')}`
      ]
    }
  };

  const currentStatus = statusConfig[level] || statusConfig.LOW;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 text-[#172B3A] dark:text-[#E2E8F0] transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 0. SEARCH & SELECT YOUR LOCATION / SECTOR (Place Selection)               */}
      {/* ========================================================================= */}
      <LocationSearch />

      {/* ========================================================================= */}
      {/* 1. LIVE WEATHER & PRALAYWATCH REAL RISK TELEMETRY CARD                    */}
      {/* ========================================================================= */}
      <LiveWeatherRiskCard />

      {/* ========================================================================= */}
      {/* 2. AM I SAFE? (Current Status Hero Banner)                                */}
      {/* ========================================================================= */}
      <section className={`rounded-2xl p-6 sm:p-8 border shadow-sm transition-all ${currentStatus.themeBg}`}>
        <div className="space-y-4">
          {/* Top Status Pill & Location */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-sm ${currentStatus.badgeColor}`}>
              {currentStatus.badgeText}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-[#172B3A] dark:text-white font-semibold bg-white/80 dark:bg-[#0B192C]/80 px-3 py-1.5 rounded-full border border-[#D7E0E7] dark:border-[#1E2E4A] backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
              <span>{activeLoc?.name || 'Selected Sector'}{activeLoc?.state ? `, ${activeLoc.state}` : ''}</span>
            </div>
          </div>

          {/* Large Plain Headline */}
          <h1 className={`text-2xl sm:text-4xl font-black tracking-tight leading-snug ${currentStatus.titleColor}`}>
            {currentStatus.title}
          </h1>

          {/* Simple Explanation */}
          <p className={`text-sm sm:text-base leading-relaxed max-w-3xl ${currentStatus.textColor}`}>
            {currentStatus.explanation}
          </p>

          {/* Hazard & Simple Risk Level */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#5B6B78] dark:text-slate-400">
            <span>Dominant Hazard: <strong className="text-[#172B3A] dark:text-white">{activeLoc?.current_risk?.dominant_hazard ? activeLoc.current_risk.dominant_hazard.replace('_', ' ').toUpperCase() : (locationRisk?.dominant_hazard ? locationRisk.dominant_hazard.replace('_', ' ').toUpperCase() : 'FLASH FLOOD')}</strong></span>
            <span>•</span>
            <span>Risk Level: <strong className="text-[#172B3A] dark:text-white">{level}</strong></span>
            <span>•</span>
            <span>Score: <strong className="text-[#1769AA] dark:text-[#38BDF8] font-bold">{activeLoc?.current_risk?.overall_score || locationRisk?.overall_score || 20}/100</strong></span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. WHAT SHOULD I DO? (Simple Checkbox Action Directives)                  */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#16855B] dark:text-emerald-400" />
            <h2 className="text-base font-bold text-[#172B3A] dark:text-white uppercase tracking-wider">
              WHAT SHOULD I DO RIGHT NOW?
            </h2>
          </div>
          <span className="text-xs text-[#16855B] dark:text-emerald-400 font-semibold">
            Simple Safety Steps
          </span>
        </div>

        {/* Action Bullet Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentStatus.actions.map((action, idx) => (
            <div key={idx} className="p-3.5 bg-[#F8FAFC] dark:bg-[#0D162B] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#16855B] dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-[#172B3A] dark:text-slate-200 font-medium leading-snug">{action}</span>
            </div>
          ))}
        </div>

        {/* 3 Large Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 sm:pt-3">
          <button
            onClick={() => setActivePage('safe-locations')}
            className="p-3.5 sm:p-4 bg-[#16855B] hover:bg-[#126d4a] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Building2 className="w-5 h-5" />
            <span>FIND SAFE PLACE</span>
          </button>

          <button
            onClick={() => setActivePage('evacuation')}
            className="p-3.5 sm:p-4 bg-[#1769AA] hover:bg-[#125890] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Navigation className="w-5 h-5" />
            <span>EVACUATION ROUTE</span>
          </button>

          <button
            onClick={() => setIsSosOpen(true)}
            className="p-3.5 sm:p-4 bg-[#C62828] hover:bg-[#a82222] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <HeartPulse className="w-5 h-5" />
            <span>EMERGENCY HELP (SOS)</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EMERGENCY CONTACT NUMBERS (Quick Toll-Free Helplines)                  */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 rounded-xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172B3A] dark:text-white">24/7 Disaster Helpline Contacts</h3>
            <p className="text-xs text-[#5B6B78] dark:text-slate-400">Direct connection to National & State Disaster Management Authorities</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="tel:112"
            className="px-4 py-2 bg-[#C62828] hover:bg-[#a82222] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>National Emergency: 112</span>
          </a>
          <a
            href="tel:1070"
            className="px-4 py-2 bg-white dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#123047] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
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
