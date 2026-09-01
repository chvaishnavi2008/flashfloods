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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                EMERGENCY RELIEF SHELTERS
              </span>
              <h1 className="text-2xl font-black text-white mt-0.5">
                🛟 Safe Places Near You
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
              {safeLocations.length} Shelters Registered
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Designated concrete community centers, high-ground schools, and government relief camps located above flood danger levels in <strong className="text-white">{selectedLocation?.name || 'your sector'}</strong>.
        </p>
      </div>

      {/* Main Shelter List */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Open High-Ground Shelters</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
            Demo Safe Locations
          </span>
        </div>

        <SafeLocationList />
      </section>

      {/* Quick Evacuation CTA */}
      <section className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Need step-by-step walking directions?</h3>
            <p className="text-xs text-slate-300">View safest uphill roads and avoid flooded riverbanks</p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('evacuation')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
        >
          <span>Show Evacuation Route</span>
          <Navigation className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
