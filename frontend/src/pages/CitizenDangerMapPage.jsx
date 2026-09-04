import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import { 
  Map, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  Layers, 
  Waves, 
  Mountain, 
  Building2, 
  Navigation
} from 'lucide-react';

export default function CitizenDangerMapPage() {
  const { selectedLocation, locationRisk, selectedLayer, setSelectedLayer } = useApp();

  const level = locationRisk?.overall_level || 'LOW';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 rounded-xl">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1769AA] dark:text-[#38BDF8] font-mono">
                NEIGHBORHOOD HAZARD VIEWER
              </span>
              <h1 className="text-2xl font-black text-[#172B3A] dark:text-white mt-0.5">
                🗺️ Danger Map — {selectedLocation?.name || 'My Area'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm ${
              level === 'CRITICAL' ? 'bg-[#C62828] text-white' : (level === 'HIGH' ? 'bg-[#E87516] text-white' : (level === 'MODERATE' ? 'bg-[#D99A00] text-white' : 'bg-[#16855B] text-white'))
            }`}>
              {level} RISK LEVEL
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B6B78] dark:text-slate-300 max-w-3xl leading-relaxed">
          See which roads, riverbanks, and hillside areas in your sector are at risk of flooding or landslides.
        </p>
      </div>

      {/* Danger Map Canvas */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
        {/* Simple Layer Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="flex items-center gap-2 text-xs text-[#172B3A] dark:text-slate-300 font-semibold font-mono">
            <span>Filter map by:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {[
              { id: 'all', label: 'All Hazards' },
              { id: 'flood', label: '🌊 Rivers & Floods' },
              { id: 'landslide', label: '⛰️ Landslide Slopes' },
              { id: 'rainfall', label: '🌧️ Heavy Rain Zones' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLayer(l.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedLayer === l.id 
                    ? 'bg-[#1769AA] text-white shadow-sm' 
                    : 'bg-[#F8FAFC] dark:bg-[#0D162B] border border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-300 hover:text-[#172B3A] dark:hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <RiskMap height="500px" showRoute={true} />

        {/* Simple Plain-English Legend */}
        <div className="bg-[#F8FAFC] dark:bg-[#0D162B] p-3 sm:p-4 rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A] space-y-2">
          <span className="text-xs font-bold text-[#5B6B78] dark:text-slate-400 uppercase tracking-wider block font-mono">
            Map Colors Meaning:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#16855B] shrink-0" />
              <span className="text-[#172B3A] dark:text-slate-200"><strong>Safe Area:</strong> Normal conditions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D99A00] shrink-0" />
              <span className="text-[#172B3A] dark:text-slate-200"><strong>Watch:</strong> Rising water</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E87516] shrink-0" />
              <span className="text-[#172B3A] dark:text-slate-200"><strong>High Risk:</strong> Evacuation likely</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C62828] shrink-0" />
              <span className="text-[#172B3A] dark:text-slate-200"><strong>Danger:</strong> Stay away</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
