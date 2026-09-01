import React from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import LocationSearch from '../components/LocationSearch';
import { MapPin, Navigation, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskMapPage() {
  const { selectedLocation, locationRisk, safeLocations, setActivePage } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E293B] border border-slate-700 rounded-xl p-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Interactive Multi-Hazard GIS Threat Map</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active GIS Layers: Overall Risk, Flash Flood, Riverine Inundation, Landslide Geohazard, Rainfall Radar & Shelters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
            Selected: <strong className="text-blue-400">{selectedLocation?.name}</strong>
          </span>
          <button
            onClick={() => setActivePage('safe-locations')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Shelters ({safeLocations.length})</span>
          </button>
        </div>
      </div>

      {/* Full GIS Canvas */}
      <div className="w-full">
        <RiskMap height="600px" showRoute={true} />
      </div>

      {/* Quick Location Switcher Below Map */}
      <LocationSearch />
    </div>
  );
}
