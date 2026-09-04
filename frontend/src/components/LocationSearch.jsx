import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Globe, Check, ShieldAlert, AlertTriangle, ShieldCheck, Activity, Filter, Navigation, Crosshair, RefreshCw } from 'lucide-react';

export default function LocationSearch({ onSearchComplete = null }) {
  const { 
    locations, 
    selectedLocationId, 
    selectLocation, 
    setActivePage,
    requestUserLocation,
    userGpsLocation,
    locationInputMode,
    isGpsLoading,
    gpsError,
    locationName
  } = useApp();

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
    { id: 'ALL', label: 'All Threats', count: riskCounts.ALL, badge: 'border-[#1769AA] bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8]' },
    { id: 'CRITICAL', label: '🔴 Critical', count: riskCounts.CRITICAL, badge: 'border-[#C62828] bg-[#FFF1F1] dark:bg-red-950/40 text-[#C62828] dark:text-red-300' },
    { id: 'HIGH', label: '🟠 High', count: riskCounts.HIGH, badge: 'border-[#E87516] bg-[#FFF7E6] dark:bg-orange-950/40 text-[#E87516] dark:text-orange-300' },
    { id: 'MODERATE', label: '🟡 Moderate', count: riskCounts.MODERATE, badge: 'border-[#D99A00] bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300' },
    { id: 'LOW', label: '🟢 Low / Safe', count: riskCounts.LOW, badge: 'border-[#16855B] bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300' }
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

  const handleGpsClick = () => {
    requestUserLocation();
    if (onSearchComplete) onSearchComplete();
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-[#FFF1F1] dark:bg-red-950/40 text-[#C62828] dark:text-red-300 border-[#C62828]/40 font-bold';
      case 'HIGH':
        return 'bg-[#FFF7E6] dark:bg-orange-950/40 text-[#E87516] dark:text-orange-300 border-[#E87516]/40 font-semibold';
      case 'MODERATE':
        return 'bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border-[#D99A00]/40 font-semibold';
      case 'LOW':
      default:
        return 'bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300 border-[#16855B]/40 font-semibold';
    }
  };

  const isGpsActive = locationInputMode === 'gps' || (userGpsLocation && userGpsLocation.active);

  return (
    <div className="bg-white dark:bg-[#111C35] rounded-2xl border border-[#D7E0E7] dark:border-[#1E2E4A] p-5 shadow-sm space-y-4 font-sans text-[#172B3A] dark:text-[#E2E8F0] transition-colors duration-200">
      {/* Search Input Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#5B6B78] dark:text-slate-400">
            SEARCH YOUR LOCATION / SECTOR ({filteredLocations.length} Matched)
          </label>
          <span className="text-[11px] font-mono text-[#1769AA] dark:text-[#38BDF8] font-bold">
            31 Multi-Hazard Monitored Sectors
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#5B6B78] dark:text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vulnerable towns (e.g. Dehradun, Chamoli, Joshimath, Wayanad, Shimla, Gangtok...)"
              className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#172B3A] dark:text-white placeholder-[#5B6B78] dark:placeholder-slate-500 focus:outline-none focus:border-[#1769AA] font-mono"
            />
          </div>
          
          {/* Live GPS Button */}
          <button
            onClick={handleGpsClick}
            disabled={isGpsLoading}
            title="Locate my exact position using device GPS"
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all shrink-0 flex items-center justify-center gap-1.5 border ${
              isGpsActive
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500 shadow-cyan-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin text-amber-200' : ''}`} />
            <span>{isGpsLoading ? 'Getting GPS...' : (isGpsActive ? '📍 GPS Active' : '📍 Use Live GPS')}</span>
          </button>

          <button
            onClick={() => {
              if (filteredLocations.length > 0) {
                handleSelect(filteredLocations[0].id);
                setActivePage('location-risk');
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1769AA] hover:bg-[#125890] text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all shrink-0 text-center"
          >
            Check Risk
          </button>
        </div>

        {/* GPS Active Status Banner if GPS is chosen */}
        {isGpsActive && (
          <div className="flex items-center justify-between p-2.5 bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-xs font-mono text-cyan-800 dark:text-cyan-200">
            <div className="flex items-center gap-2 truncate">
              <Navigation className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 animate-pulse" />
              <span className="truncate">
                <strong>Current Live Location:</strong> {locationName || userGpsLocation?.name || 'Live GPS Active'}
              </span>
            </div>
            <button
              onClick={handleGpsClick}
              className="text-[10px] bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-2 py-0.5 rounded ml-2 shrink-0"
            >
              Re-scan GPS
            </button>
          </div>
        )}

        {/* Quick Select Place Dropdown */}
        <div className="bg-[#F8FAFC] dark:bg-[#0D162B] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#172B3A] dark:text-white">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[#1769AA] dark:text-[#38BDF8]">
              <MapPin className="w-3.5 h-3.5 text-[#C62828] dark:text-red-400" />
              <span>SELECT PLACE / SECTOR DROPDOWN:</span>
            </span>
            <span className="text-[10px] text-[#5B6B78] dark:text-slate-400">Jump directly to any sector</span>
          </div>
          <select
            value={isGpsActive ? 'gps' : selectedLocationId}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'gps') {
                handleGpsClick();
              } else {
                handleSelect(Number(val));
              }
            }}
            className="w-full bg-white dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg px-3 py-2 text-sm text-[#172B3A] dark:text-white font-mono font-bold focus:outline-none focus:border-[#1769AA] cursor-pointer shadow-sm"
          >
            <option value="gps" className="bg-cyan-900 text-white font-bold">
              📍 [LIVE GPS] {isGpsActive ? `${locationName} (Active)` : 'Detect My Real-Time Device Location'}
            </option>
            <option value="" disabled>-- Or choose a monitored sector below --</option>
            {locations.map((loc) => {
              const hazardIcon = loc.current_risk?.dominant_hazard === 'landslide' ? '⛰️ Landslide' : (loc.current_risk?.dominant_hazard === 'heavy_rainfall' ? '🌧️ Heavy Rain' : '🌊 Flash Flood');
              const levelBadge = loc.current_risk?.overall_level === 'CRITICAL' ? '🔴 CRITICAL' : (loc.current_risk?.overall_level === 'HIGH' ? '🟠 HIGH' : (loc.current_risk?.overall_level === 'MODERATE' ? '🟡 MODERATE' : '🟢 LOW'));
              return (
                <option key={loc.id} value={loc.id} className="bg-white dark:bg-[#070F1E] text-[#172B3A] dark:text-white py-1">
                  📍 {loc.name} ({loc.state}) — {levelBadge} — {hazardIcon} ({loc.current_risk?.overall_score || 50}/100)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 1. FOUR THREAT LEVEL FILTER BUTTONS */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[11px] text-[#5B6B78] dark:text-slate-400">
          <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[#172B3A] dark:text-white">
            <Filter className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#38BDF8]" />
            <span>Filter by Threat Level:</span>
          </span>
          <span className="text-[10px] text-[#5B6B78] dark:text-slate-400">
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
                    ? `${rf.badge} font-bold shadow-sm`
                    : 'bg-[#F8FAFC] dark:bg-[#0D162B] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-300 hover:bg-white dark:hover:bg-[#111C35] hover:text-[#172B3A] dark:hover:text-white'
                }`}
              >
                <span>{rf.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isActive ? 'bg-white dark:bg-[#070F1E] text-[#172B3A] dark:text-white border border-[#D7E0E7] dark:border-[#1E2E4A]' : 'bg-white dark:bg-[#070F1E] text-[#5B6B78] dark:text-slate-400 border border-[#D7E0E7] dark:border-[#1E2E4A]'
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
        <span className="text-[11px] text-[#5B6B78] dark:text-slate-400 block font-bold uppercase tracking-wider">
          Filter by Region:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setActiveRegionFilter(reg.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                activeRegionFilter === reg.id
                  ? 'bg-[#1769AA] text-white font-semibold shadow-sm'
                  : 'bg-[#F8FAFC] dark:bg-[#0D162B] text-[#5B6B78] dark:text-slate-300 hover:bg-white dark:hover:bg-[#111C35] hover:text-[#172B3A] dark:hover:text-white border border-[#D7E0E7] dark:border-[#1E2E4A]'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID OF SELECTABLE LOCATION CHIPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {/* Special Live GPS Tile */}
        <button
          onClick={handleGpsClick}
          disabled={isGpsLoading}
          className={`flex flex-col justify-between p-3 rounded-xl border text-left text-xs transition-all ${
            isGpsActive
              ? 'bg-cyan-500/15 dark:bg-cyan-950/50 border-2 border-cyan-500 text-[#172B3A] dark:text-white shadow-sm ring-1 ring-cyan-400/50'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-dashed border-2 border-emerald-500/60 text-[#172B3A] dark:text-[#E2E8F0] hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40'
          }`}
        >
          <div className="flex items-start justify-between gap-1 w-full mb-1.5">
            <div className="font-bold text-cyan-800 dark:text-cyan-300 truncate flex items-center gap-1.5 text-xs">
              <Navigation className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 ${isGpsLoading ? 'animate-spin' : 'animate-pulse'}`} />
              <span className="truncate font-mono">{isGpsActive ? (locationName || 'Live GPS Active') : '📍 Use Live GPS'}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-cyan-600 text-white font-bold shrink-0">
              {isGpsLoading ? 'SCANNING' : (isGpsActive ? 'ACTIVE' : 'DETECT')}
            </span>
          </div>

          <div className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 truncate mb-2">
            {isGpsActive && userGpsLocation ? `Lat: ${userGpsLocation.lat.toFixed(3)}, Lng: ${userGpsLocation.lng.toFixed(3)}` : 'Auto-pinpoint your device coordinates'}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-cyan-500/30 w-full text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-cyan-600/20 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-500/30">
              🛰️ Real-Time Telemetry
            </span>
          </div>
        </button>

        {filteredLocations.map((loc) => {
          const isSelected = !isGpsActive && loc.id === selectedLocationId;
          const level = loc.current_risk?.overall_level || 'LOW';
          const dominantHazard = loc.current_risk?.dominant_hazard || 'flash_flood';
          const hazardLabel = dominantHazard === 'landslide' ? '⛰️ Landslide' : (dominantHazard === 'heavy_rainfall' ? '🌧️ Heavy Rain' : '🌊 Flash Flood');

          return (
            <button
              key={loc.id}
              onClick={() => handleSelect(loc.id)}
              className={`flex flex-col justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                isSelected
                  ? 'bg-[#E8F2F8] dark:bg-[#1769AA]/30 border-2 border-[#1769AA] text-[#172B3A] dark:text-white shadow-sm'
                  : 'bg-[#F8FAFC] dark:bg-[#0D162B] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#172B3A] dark:text-[#E2E8F0] hover:bg-white dark:hover:bg-[#111C35] hover:border-[#1769AA]'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full mb-1.5">
                <div className="font-bold text-[#172B3A] dark:text-white truncate flex items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#C62828] dark:text-red-400 shrink-0" />
                  <span className="truncate">{loc.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getLevelBadgeClass(level)} shrink-0`}>
                  {level}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#5B6B78] dark:text-slate-400 truncate mb-2">
                {loc.state}, {loc.country}
              </div>

              {/* Hazard Components Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#D7E0E7] dark:border-[#1E2E4A] w-full text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-[#070F1E] text-[#1769AA] dark:text-[#38BDF8] border border-[#D7E0E7] dark:border-[#1E2E4A]">
                  {hazardLabel}
                </span>
                <span className="text-[#5B6B78] dark:text-slate-400">
                  Risk: <strong className="text-[#1769AA] dark:text-[#38BDF8] font-bold">{loc.current_risk?.overall_score || 50}/100</strong>
                </span>
              </div>
            </button>
          );
        })}

        {filteredLocations.length === 0 && (
          <div className="col-span-full p-6 text-center text-[#5B6B78] dark:text-slate-400 font-mono text-xs bg-[#F8FAFC] dark:bg-[#0D162B] rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A]">
            No monitored sectors match the active search and filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
