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
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40">FULL</span>;
      case 'NEAR CAP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40">NEAR CAP</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/40">OPEN</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111C35] rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A] p-4 sm:p-5 shadow-sm space-y-4 font-mono text-[#172B3A] dark:text-[#E2E8F0]">
      <div className="flex items-center justify-between border-b border-[#D7E0E7] dark:border-[#1E2E4A] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/30">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#172B3A] dark:text-[#F8FAFC] uppercase tracking-wide">
              NEAREST SAFE LOCATIONS & SHELTERS
            </h3>
            <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8]">
              Designated flood & landslide refuges near {selectedLocation?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('map')}
          className="text-xs text-[#1769AA] dark:text-[#38BDF8] hover:underline font-bold flex items-center gap-1"
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
                  ? 'bg-[#EAF7F1]/30 dark:bg-[#0B3322]/40 border-[#16855B] shadow-md ring-1 ring-[#16855B]/50'
                  : 'bg-[#F8FAFC] dark:bg-[#0B1528] border-[#D7E0E7] dark:border-[#1E2E4A] hover:border-[#1769AA] dark:hover:border-[#38BDF8]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC]">{shelter.name}</span>
                  {getStatusBadge(shelter.status)}
                </div>

                <div className="flex items-center gap-2 text-xs text-[#5B6B78] dark:text-[#94A3B8]">
                  <span className="text-[#16855B] dark:text-[#34D399] font-bold">{shelter.distance_km} km</span>
                  <span>•</span>
                  <span>Est. {shelter.est_walking_mins} mins walk</span>
                </div>
              </div>

              {/* Progress Bar for Occupancy */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] text-[#5B6B78] dark:text-[#94A3B8]">
                  <span>Capacity Status</span>
                  <span>{shelter.current_occupancy} / {shelter.capacity} Occupied ({shelter.occupancy_pct}%)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] dark:bg-[#1E2E4A] rounded-full h-2 overflow-hidden border border-[#D7E0E7] dark:border-[#1E2E4A]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      shelter.occupancy_pct > 85 ? 'bg-[#D99A00]' : 'bg-[#16855B]'
                    }`}
                    style={{ width: `${shelter.occupancy_pct}%` }}
                  />
                </div>
              </div>

              {/* Facilities & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-xs">
                <div className="text-[#5B6B78] dark:text-[#94A3B8]">
                  <span className="font-semibold text-[#172B3A] dark:text-[#F8FAFC]">Amenities:</span> {shelter.facilities}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePage('map');
                      if (onSelectRoute) onSelectRoute(shelter);
                    }}
                    className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#125890] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto transition-all shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </button>

                  <a
                    href={`tel:${shelter.contact_phone.split('/')[0].trim()}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs flex items-center justify-center gap-1 shrink-0"
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
