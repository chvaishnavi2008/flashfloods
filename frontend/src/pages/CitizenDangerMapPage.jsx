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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                NEIGHBORHOOD HAZARD VIEWER
              </span>
              <h1 className="text-2xl font-black text-white mt-0.5">
                🗺️ Danger Map — {selectedLocation?.name || 'My Area'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              level === 'CRITICAL' ? 'bg-red-600 text-white' : (level === 'HIGH' ? 'bg-orange-500 text-white' : (level === 'MODERATE' ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'))
            }`}>
              {level} RISK LEVEL
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          See which roads, riverbanks, and hillside areas in your sector are at risk of flooding or landslides.
        </p>
      </div>

      {/* Danger Map Canvas */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Simple Layer Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <span>Filter map by:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-900 text-slate-400 hover:text-white'
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
        <div className="bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Map Colors Meaning:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-300"><strong>Safe Area:</strong> Normal conditions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
              <span className="text-slate-300"><strong>Watch:</strong> Rising water</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span className="text-slate-300"><strong>High Risk:</strong> Evacuation likely</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span className="text-slate-300"><strong>Danger:</strong> Stay away</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
