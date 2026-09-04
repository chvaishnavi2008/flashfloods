import React from 'react';
import { useApp } from '../context/AppContext';
import SafeLocationList from '../components/SafeLocationList';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function CitizenSafePlacesPage() {
  const { selectedLocation, safeLocations, setActivePage } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-400 border border-[#16855B]/30 rounded-xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#16855B] dark:text-emerald-400 font-mono">
                EMERGENCY RELIEF SHELTERS
              </span>
              <h1 className="text-2xl font-black text-[#172B3A] dark:text-white mt-0.5">
                🛟 Safe Places Near You
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300 border border-[#16855B]/40 rounded-full text-xs font-bold font-mono">
              {safeLocations.length} Shelters Registered
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B6B78] dark:text-slate-300 max-w-3xl leading-relaxed">
          Designated concrete community centers, high-ground schools, and government relief camps located above flood danger levels in <strong className="text-[#172B3A] dark:text-white">{selectedLocation?.name || 'your sector'}</strong>.
        </p>
      </div>

      {/* Main Shelter List */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="flex items-center gap-2 text-[#16855B] dark:text-emerald-400 font-bold text-xs uppercase font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Open High-Ground Shelters</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300 border border-[#16855B]/40 font-mono">
            Verified Safe Locations
          </span>
        </div>

        <SafeLocationList />
      </section>

      {/* Quick Evacuation CTA */}
      <section className="bg-gradient-to-r from-[#E8F2F8] to-[#F8FAFC] dark:from-[#111C35] dark:to-[#0D162B] border border-[#1769AA]/40 dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1769AA]/10 dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] rounded-xl border border-[#1769AA]/20">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172B3A] dark:text-white">Need step-by-step walking directions?</h3>
            <p className="text-xs text-[#5B6B78] dark:text-slate-300">View safest uphill roads and avoid flooded riverbanks</p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('evacuation')}
          className="px-5 py-2.5 bg-[#1769AA] hover:bg-[#125890] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          <span>Show Evacuation Route</span>
          <Navigation className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
