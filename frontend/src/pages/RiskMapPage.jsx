import React from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import LocationSearch from '../components/LocationSearch';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Layers, 
  Droplets, 
  Mountain, 
  Activity, 
  Compass,
  Wind,
  Flame
} from 'lucide-react';

export default function RiskMapPage() {
  const { 
    locations, 
    selectedLocationId, 
    selectedLocation, 
    selectLocation, 
    locationRisk, 
    safeLocations, 
    setActivePage,
    environmentalData
  } = useApp();

  const criticalCount = locations.filter(l => l.current_risk?.overall_level === 'CRITICAL').length;
  const highCount = locations.filter(l => l.current_risk?.overall_level === 'HIGH').length;

  // Major High-Threat Hotspots for 1-Click Jump Chips
  const HOTSPOT_SECTORS = [
    { id: 1, name: 'Chamoli', region: 'Alaknanda Basin', level: 'CRITICAL', icon: '🌊' },
    { id: 2, name: 'Joshimath', region: 'Garhwal Slope', level: 'HIGH', icon: '⛰️' },
    { id: 3, name: 'Kedarnath', region: 'Mandakini Valley', level: 'HIGH', icon: '❄️' },
    { id: 4, name: 'Dehradun', region: 'Doon Valley', level: 'MODERATE', icon: '🌧️' },
    { id: 22, name: 'Wayanad', region: 'Western Ghats', level: 'CRITICAL', icon: '⛰️' },
    { id: 17, name: 'Cherrapunji', region: 'Khasi Hills', level: 'CRITICAL', icon: '🌧️' },
    { id: 10, name: 'Chungthang', region: 'North Sikkim', level: 'HIGH', icon: '❄️' }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header & Live GIS Command Bar */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>LIVE GIS TELEMETRY ACTIVE</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Coverage: 31 Sectors across Himalayas & Peninsular Hotspots
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Interactive Multi-Hazard Threat & Terrain Map</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time spatial visualization of flash flood surge paths, river gauge levels, geotechnical landslide slopes, and dynamic evacuation safety corridors.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-2 bg-red-950/40 border border-red-800/60 rounded-xl text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">CRITICAL ZONES</span>
              <span className="text-red-400 font-bold text-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                {criticalCount} Sectors
              </span>
            </div>

            <div className="px-3 py-2 bg-orange-950/40 border border-orange-800/60 rounded-xl text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">HIGH THREAT</span>
              <span className="text-orange-400 font-bold text-sm">
                {highCount} Sectors
              </span>
            </div>

            <div className="px-3 py-2 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">OPEN HAVENS</span>
              <span className="text-emerald-400 font-bold text-sm">
                {safeLocations.length} Shelters
              </span>
            </div>
          </div>
        </div>

        {/* 2. Hotspot Quick-Jump Pill Chips */}
        <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Fast Hotspots:</span>
          </span>

          {HOTSPOT_SECTORS.map((hp) => {
            const isSelected = selectedLocationId === hp.id;
            return (
              <button
                key={hp.id}
                onClick={() => selectLocation(hp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  isSelected
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-blue-500/20'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/70'
                }`}
              >
                <span>{hp.icon}</span>
                <span>{hp.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  hp.level === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : (hp.level === 'HIGH' ? 'bg-orange-500/20 text-orange-300' : 'bg-amber-500/20 text-amber-300')
                }`}>
                  {hp.level}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Full High-Definition GIS Canvas */}
      <div className="w-full">
        <RiskMap height="640px" showRoute={true} />
      </div>

      {/* 4. Quick Location Switcher & Detailed Telemetry Below Map */}
      <div className="space-y-4">
        <LocationSearch />
      </div>
    </div>
  );
}
