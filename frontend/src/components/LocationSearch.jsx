import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Globe, Check, ShieldAlert, AlertTriangle, ShieldCheck, Activity, Filter } from 'lucide-react';

export default function LocationSearch({ onSearchComplete = null }) {
  const { locations, selectedLocationId, selectLocation, setActivePage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRiskFilter, setActiveRiskFilter] = useState('ALL');
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
    { id: 'Kerala', label: 'Kerala' },
    { id: 'West Bengal', label: 'Darjeeling/WB' },
    { id: 'Bihar', label: 'Bihar' },
    { id: 'Nepal', label: 'Nepal' }
  ];

  // Dynamic counts for risk levels
  const riskCounts = useMemo(() => {
    return {
      ALL: locations.length,
      CRITICAL: locations.filter(l => (l.current_risk?.overall_level || 'LOW') === 'CRITICAL').length,
      HIGH: locations.filter(l => (l.current_risk?.overall_level || 'LOW') === 'HIGH').length,
      MODERATE: locations.filter(l => (l.current_risk?.overall_level || 'LOW') === 'MODERATE').length,
      LOW: locations.filter(l => (l.current_risk?.overall_level || 'LOW') === 'LOW').length
    };
  }, [locations]);

  const riskFilters = [
    { id: 'ALL', label: 'All Threats', count: riskCounts.ALL, badge: 'border-slate-700 bg-slate-900 text-slate-300' },
    { id: 'CRITICAL', label: '🔴 Critical', count: riskCounts.CRITICAL, badge: 'border-red-500/60 bg-red-950/60 text-red-300' },
    { id: 'HIGH', label: '🟠 High', count: riskCounts.HIGH, badge: 'border-orange-500/60 bg-orange-950/60 text-orange-300' },
    { id: 'MODERATE', label: '🟡 Moderate', count: riskCounts.MODERATE, badge: 'border-amber-500/60 bg-amber-950/60 text-amber-300' },
    { id: 'LOW', label: '🟢 Low / Normal', count: riskCounts.LOW, badge: 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300' }
  ];

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const level = loc.current_risk?.overall_level || 'LOW';
      const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (loc.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (loc.country || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = activeRiskFilter === 'ALL' || level === activeRiskFilter;
      const matchesRegion = activeRegionFilter === 'ALL' || loc.state === activeRegionFilter || loc.country === activeRegionFilter;
      
      return matchesSearch && matchesRisk && matchesRegion;
    });
  }, [locations, searchTerm, activeRiskFilter, activeRegionFilter]);

  const handleSelect = (id) => {
    selectLocation(id);
    if (onSearchComplete) onSearchComplete();
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 font-bold shadow-sm animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-semibold';
      case 'LOW':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold';
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-5 shadow-lg space-y-4 font-sans">
      {/* Search Input Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            SEARCH YOUR LOCATION / SECTOR ({filteredLocations.length} Matched)
          </label>
          <span className="text-[11px] font-mono text-cyan-400">
            31 Multi-Hazard Monitored Sectors
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vulnerable towns (e.g. Dehradun, Joshimath, Wayanad, Shimla, Gangtok, Chungthang...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <button
            onClick={() => {
              if (filteredLocations.length > 0) {
                handleSelect(filteredLocations[0].id);
                setActivePage('location-risk');
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0 text-center"
          >
            Check Risk
          </button>
        </div>
      </div>

      {/* 1. FOUR THREAT LEVEL FILTER BUTTONS (Primary Multi-Hazard Filter) */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter by Threat Level:</span>
          </span>
          <span className="text-[10px] text-slate-500">
            Select a risk level to isolate sectors
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {riskFilters.map((rf) => {
            const isActive = activeRiskFilter === rf.id;
            return (
              <button
                key={rf.id}
                onClick={() => setActiveRiskFilter(rf.id)}
                className={`px-3 py-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isActive
                    ? `${rf.badge} ring-2 ring-cyan-400 font-bold shadow-lg transform scale-[1.02]`
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{rf.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isActive ? 'bg-black/40 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {rf.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. REGION FILTER PILLS */}
      <div className="space-y-1.5 font-mono">
        <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
          Filter by Region:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
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
      </div>

      {/* 3. GRID OF SELECTABLE LOCATION CHIPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
        {filteredLocations.map((loc) => {
          const isSelected = loc.id === selectedLocationId;
          const level = loc.current_risk?.overall_level || 'LOW';

          return (
            <button
              key={loc.id}
              onClick={() => handleSelect(loc.id)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 text-white shadow-sm ring-1 ring-blue-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="truncate pr-2">
                <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="truncate">{loc.name}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate pl-4.5">{loc.state}, {loc.country}</div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getLevelBadgeClass(level)} shrink-0`}>
                {level}
              </span>
            </button>
          );
        })}

        {filteredLocations.length === 0 && (
          <div className="col-span-full p-6 text-center text-slate-400 font-mono text-xs bg-slate-900/50 rounded-xl border border-slate-800">
            No monitored sectors match the active search and filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
