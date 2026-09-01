import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Globe, Check } from 'lucide-react';

export default function LocationSearch({ onSearchComplete = null }) {
  const { locations, selectedLocationId, selectLocation, setActivePage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRegionFilter, setActiveRegionFilter] = useState('ALL');

  const regions = [
    { id: 'ALL', label: 'All Regions' },
    { id: 'Uttarakhand', label: 'Uttarakhand' },
    { id: 'Himachal Pradesh', label: 'Himachal' },
    { id: 'Sikkim', label: 'Sikkim' },
    { id: 'Assam', label: 'Assam' },
    { id: 'Arunachal Pradesh', label: 'Arunachal' },
    { id: 'Meghalaya', label: 'Meghalaya' },
    { id: 'Jammu & Kashmir', label: 'J&K' },
    { id: 'West Bengal', label: 'Darjeeling/WB' },
    { id: 'Nepal', label: 'Nepal' }
  ];

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loc.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loc.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = activeRegionFilter === 'ALL' || loc.state === activeRegionFilter || loc.country === activeRegionFilter;
    return matchesSearch && matchesRegion;
  });

  const handleSelect = (id) => {
    selectLocation(id);
    if (onSearchComplete) onSearchComplete();
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 font-bold';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-5 shadow-lg space-y-4">
      {/* Search Input Bar */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
          Search Your Location / Sector
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vulnerable towns (e.g. Dehradun, Joshimath, Shimla, Gangtok, Chungthang...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => {
              if (filteredLocations.length > 0) {
                handleSelect(filteredLocations[0].id);
                setActivePage('location-risk');
              }
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0"
          >
            Check Risk
          </button>
        </div>
      </div>

      {/* Region Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
        {regions.map((reg) => (
          <button
            key={reg.id}
            onClick={() => setActiveRegionFilter(reg.id)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              activeRegionFilter === reg.id
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700'
            }`}
          >
            {reg.label}
          </button>
        ))}
      </div>

      {/* Grid of Selectable Location Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
        {filteredLocations.map((loc) => {
          const isSelected = loc.id === selectedLocationId;
          const level = loc.current_risk?.overall_level || 'LOW';

          return (
            <button
              key={loc.id}
              onClick={() => handleSelect(loc.id)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="truncate pr-2">
                <div className="font-semibold text-slate-200 truncate">{loc.name}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{loc.state}, {loc.country}</div>
              </div>

              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${getLevelBadgeClass(level)} shrink-0`}>
                {level}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
