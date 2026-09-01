import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Home, Navigation, Users, Phone, MapPin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function SafeLocationList({ onSelectRoute = null }) {
  const { safeLocations, selectedLocation, selectedShelter, setSelectedShelter, setActivePage } = useApp();
  const activeShelterId = selectedShelter?.id || safeLocations[0]?.id || null;

  const handleShelterSelect = (shelter) => {
    setSelectedShelter(shelter);
    if (onSelectRoute) onSelectRoute(shelter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FULL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">FULL</span>;
      case 'NEAR CAP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">NEAR CAP</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">OPEN</span>;
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              NEAREST SAFE LOCATIONS & SHELTERS
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Designated flood & landslide refuges near {selectedLocation?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('map')}
          className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
        >
          <span>View on Map</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Shelter Cards List */}
      <div className="space-y-3">
        {safeLocations.map((shelter) => {
          const isSelected = activeShelterId === shelter.id;

          return (
            <div
              key={shelter.id}
              onClick={() => handleShelterSelect(shelter)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{shelter.name}</span>
                  {getStatusBadge(shelter.status)}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="text-emerald-400 font-bold">{shelter.distance_km} km</span>
                  <span>•</span>
                  <span>Est. {shelter.est_walking_mins} mins walk</span>
                </div>
              </div>

              {/* Progress Bar for Occupancy */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Capacity Status</span>
                  <span>{shelter.current_occupancy} / {shelter.capacity} Occupied ({shelter.occupancy_pct}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      shelter.occupancy_pct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${shelter.occupancy_pct}%` }}
                  />
                </div>
              </div>

              {/* Facilities & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="text-slate-400">
                  <span className="font-semibold text-slate-300">Amenities:</span> {shelter.facilities}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePage('map');
                      if (onSelectRoute) onSelectRoute(shelter);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </button>

                  <a
                    href={`tel:${shelter.contact_phone.split('/')[0].trim()}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono text-xs flex items-center justify-center gap-1 shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
