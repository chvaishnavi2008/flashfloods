import React from 'react';
import { useApp } from '../context/AppContext';
import SafeLocationList from '../components/SafeLocationList';
import EvacuationDirections from '../components/EvacuationDirections';
import RiskMap from '../components/RiskMap';
import { Home, ShieldCheck, Navigation, Phone, Users, MapPin, Compass } from 'lucide-react';

export default function SafeLocationsPage() {
  const { selectedLocation, safeLocations, selectedShelter, setSelectedShelter, setActivePage } = useApp();

  const totalCapacity = safeLocations.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = safeLocations.reduce((acc, s) => acc + s.current_occupancy, 0);
  const totalAvailable = Math.max(0, totalCapacity - totalOccupancy);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Safe Zones & Evacuation Guidance</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Designated high-ground relief centers & hazard-avoidance routes for {selectedLocation?.name}, {selectedLocation?.state}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('map')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
          >
            <Navigation className="w-4 h-4" />
            <span>Interactive Map Route</span>
          </button>
        </div>

        {/* Shelter KPI Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Shelters</span>
            <span className="text-xl font-bold font-mono text-white">{safeLocations.length}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Capacity</span>
            <span className="text-xl font-bold font-mono text-white">{totalCapacity.toLocaleString()}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Occupancy</span>
            <span className="text-xl font-bold font-mono text-amber-400">{totalOccupancy.toLocaleString()}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Available Spaces</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{totalAvailable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Map & List Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <SafeLocationList onSelectRoute={(s) => setSelectedShelter(s)} />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Live Evacuation Route Map to {selectedShelter?.name || safeLocations[0]?.name || 'Shelter'}</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Clear Elevation Path</span>
            </div>
            <RiskMap height="400px" showRoute={true} />
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Step-by-Step Evacuation Directions */}
      <div className="w-full">
        <EvacuationDirections onShelterChange={(s) => setSelectedShelter(s)} />
      </div>
    </div>
  );
}
