import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Navigation, 
  MapPin, 
  Compass, 
  Ban, 
  CheckCircle2, 
  PhoneCall, 
  ArrowRight, 
  Building2, 
  HeartPulse, 
  Sparkles, 
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame
} from 'lucide-react';

export default function WhatShouldIDoPanel() {
  const { 
    locationRisk, 
    selectedLocation, 
    safeLocations, 
    pipelineData, 
    setActivePage 
  } = useApp();

  const isCritical = locationRisk?.overall_level === 'CRITICAL';
  const isHigh = locationRisk?.overall_level === 'HIGH';
  const isEmergency = isCritical || isHigh;

  // Determine dominant hazard
  let dominantHazard = "Flash Flood";
  if (locationRisk?.landslide?.score > locationRisk?.flash_flood?.score && locationRisk?.landslide?.score > locationRisk?.heavy_rainfall?.score) {
    dominantHazard = "Landslide";
  } else if (locationRisk?.heavy_rainfall?.score > locationRisk?.flash_flood?.score && locationRisk?.heavy_rainfall?.score > locationRisk?.landslide?.score) {
    dominantHazard = "Extreme Rainfall";
  }

  const nearestShelter = safeLocations && safeLocations.length > 0 ? safeLocations[0] : {
    name: `${selectedLocation?.name || 'Sector'} High-Ground Disaster Relief Shelter`,
    distance_km: 1.4,
    est_walking_mins: 18,
    capacity: 850,
    current_occupancy: 120,
    facilities: "Medical Aid, High-Output Generators, Dry Food Rations, Purified Water",
    contact_phone: "+91 1800-180-1104",
    safe_route_instructions: `Follow upper contour ridge road ascending away from river channel in ${selectedLocation?.name || 'Sector'}.`
  };

  // Immediate actions tailored to hazard & risk level
  const getImmediateActions = () => {
    if (dominantHazard === "Landslide") {
      if (isCritical) {
        return [
          "Move away from steep slopes and hillside cut-slopes immediately.",
          "Avoid roads beneath unstable cliffs and active rockfall zones.",
          "Watch and listen for ground cracking, tilting trees, or sudden muddy runoff.",
          "Follow official SDMA/SDRF evacuation orders to designated high-ground shelters.",
          "Help elderly neighbors and children reach stable bedrock ridges."
        ];
      }
      return [
        "Stay alert for signs of slope movement or retention wall bulging.",
        "Avoid unpaved hillside roads and avoid mountain travel during heavy rain.",
        "Prepare emergency go-bags (medicines, torch, water, vital documents).",
        "Monitor local district disaster management slope stability bulletins."
      ];
    } else if (dominantHazard === "Extreme Rainfall") {
      if (isCritical) {
        return [
          "Avoid all non-essential travel during torrential downpours.",
          "Stay indoors in structurally sound buildings away from exterior windows.",
          "Avoid low-lying areas, underground parking structures, and road underpasses.",
          "Monitor official IMD Doppler radar nowcasts and SDMA weather alerts.",
          "Keep mobile phones and battery backup devices fully charged."
        ];
      }
      return [
        "Carry rain gear and exercise caution during daily commute.",
        "Inspect rooftop and driveway drainage for obstructions.",
        "Stay updated on localized cloudburst forecasts."
      ];
    } else {
      // Flash Flood / Riverine Flood
      if (isCritical) {
        return [
          "Move to higher ground immediately — every minute counts.",
          "Avoid rivers, streams, drainage channels, and low-lying valleys.",
          "Do NOT attempt to cross flooded roads, bridges, or culverts.",
          "Follow official SEOC/SDMA evacuation orders to designated safe shelters.",
          "Shut off domestic electricity and gas valves before leaving home."
        ];
      }
      return [
        "Prepare emergency go-bags (drinking water, non-perishable food, first aid).",
        "Identify your nearest safe shelter and verify non-flooded upper road route.",
        "Avoid parking vehicles near drainage culverts or riverbanks.",
        "Monitor live Central Water Commission (CWC) hydro-gauge broadcasts."
      ];
    }
  };

  // Places to avoid
  const getPlacesToAvoid = () => {
    if (dominantHazard === "Landslide") {
      return [
        `Hillside dwellings directly below steep slopes (>30°) in ${selectedLocation?.name || 'Sector'}`,
        "Drainage gullies carrying sudden muddy debris water",
        "Cracked road stretches or retaining walls showing deformation"
      ];
    } else if (dominantHazard === "Extreme Rainfall") {
      return [
        `Low-lying road underpasses and waterlogged intersections in ${selectedLocation?.name || 'Sector'}`,
        "Open grounds, tin sheds, and tall trees during lightning storms",
        "Basements prone to rapid stormwater backflow"
      ];
    } else {
      return [
        `Lower riverbank paths and floodplain settlement roads in ${selectedLocation?.name || 'Sector'}`,
        "Bridges carrying high water discharge or debris accumulation",
        "Basements, underground parking structures, and drainage underpasses",
        "Low culvert water crossings"
      ];
    }
  };

  const immediateActions = getImmediateActions();
  const placesToAvoid = getPlacesToAvoid();

  return (
    <div className={`rounded-2xl border p-5 lg:p-6 shadow-2xl relative overflow-hidden transition-all space-y-6 ${
      isCritical 
        ? 'bg-gradient-to-br from-[#1f0b0e] via-[#16161a] to-slate-900 border-red-500/80 ring-2 ring-red-500/30' 
        : (isHigh 
          ? 'bg-gradient-to-br from-[#241305] via-[#16161a] to-slate-900 border-orange-500/70 ring-1 ring-orange-500/20' 
          : 'bg-[#18181c] border-slate-700/80')
    }`}>
      {/* Background ambient light */}
      <div className={`absolute top-0 right-0 w-96 h-48 blur-3xl pointer-events-none ${
        isCritical ? 'bg-red-500/15' : (isHigh ? 'bg-orange-500/10' : 'bg-blue-500/5')
      }`} />

      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${
            isCritical 
              ? 'bg-red-600/30 border-red-500 text-red-400 animate-pulse' 
              : (isHigh ? 'bg-orange-600/30 border-orange-500 text-orange-400' : 'bg-blue-950 border-blue-500/40 text-blue-400')
          }`}>
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                PralayWatch Life-Safety Action Engine
              </span>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                isCritical 
                  ? 'bg-red-600 text-white animate-bounce' 
                  : (isHigh ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white')
              }`}>
                {isCritical ? 'CRITICAL EVACUATION REQUIRED' : (isHigh ? 'PRE-EVACUATION WARNING' : 'ADVISORY MONITORING')}
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
              WHAT SHOULD I DO RIGHT NOW?
            </h2>

            <p className="text-xs text-slate-300 mt-1 font-mono">
              Immediate action directives for <strong className="text-white">{selectedLocation?.name || 'Dehradun'}</strong> facing <strong className="text-amber-300">{dominantHazard}</strong> threat.
            </p>
          </div>
        </div>

        {/* Action Priority Status Tag */}
        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 shadow-lg ${
            isCritical 
              ? 'bg-red-950/90 border-red-500 text-red-300' 
              : (isHigh ? 'bg-orange-950/90 border-orange-500 text-orange-300' : 'bg-slate-900 border-slate-700 text-slate-300')
          }`}>
            <Radio className={`w-4 h-4 ${isEmergency ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
            <span>ACTIVE DIRECTIVE</span>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Core Action Split (Immediate Action vs Places to Avoid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Immediate Action Steps */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Immediate Actions to Take:</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Step-by-Step Directives</span>
          </div>

          <div className="space-y-2.5">
            {immediateActions.map((action, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${
                  idx === 0 && isEmergency
                    ? 'bg-red-950/40 border-red-500/50 text-white font-semibold shadow-md' 
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                  idx === 0 && isEmergency ? 'bg-red-600 text-white' : 'bg-slate-800 text-emerald-400'
                }`}>
                  {idx + 1}
                </span>
                <p className="text-xs font-mono leading-relaxed pt-0.5">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Places / Areas to Avoid */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                <span>Places & Areas to Avoid:</span>
              </h3>
              <span className="text-[10px] font-mono text-red-400 font-semibold">Danger Zones</span>
            </div>

            <div className="space-y-2.5 mt-4">
              {placesToAvoid.map((dangerArea, idx) => (
                <div key={idx} className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg flex items-start gap-2.5 text-xs font-mono text-red-200">
                  <span className="text-red-400 font-bold text-sm">✕</span>
                  <p className="leading-relaxed">
                    {dangerArea}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Helpline banner */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono mt-4">
            <div className="flex items-center gap-2 text-slate-300">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>National Disaster Helpline:</span>
            </div>
            <a href="tel:112" className="text-emerald-400 font-bold hover:underline">
              112 / 1070
            </a>
          </div>
        </div>
      </div>

      {/* 3. Suggested Safe Direction & Nearest Safe Shelter (Dual Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card A: Suggested Safe Evacuation Direction */}
        <div className="bg-slate-900/90 border border-blue-500/40 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-mono uppercase">
              <Compass className="w-4 h-4" />
              <span>Suggested Safe Evacuation Direction</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Simulated Route
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Ascend North-East to High Ridge Contour</span>
            </h4>
            <p className="text-xs text-slate-300 font-mono mt-1.5 leading-relaxed">
              Ascend away from the river tributary floor (+85m elevation gain). Follow the upper arterial highway directly toward the designated primary structural shelter. Do not take low-lying river bypass paths.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Terrain Elevation: <strong>+85m Safety Clearance</strong></span>
            <span className="text-blue-400 font-semibold">Ridge Corridor Open</span>
          </div>
        </div>

        {/* Card B: Nearest Designated Safe Shelter */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase">
                <Building2 className="w-4 h-4" />
                <span>Nearest Available Safe Shelter</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Demo Safe Location
              </span>
            </div>

            <div className="mt-2">
              <h4 className="text-base font-bold text-white truncate font-mono">
                {nearestShelter.name}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {nearestShelter.distance_km} km away • Est. {nearestShelter.est_walking_mins} mins walk • {nearestShelter.capacity ? `${nearestShelter.capacity - nearestShelter.current_occupancy} spots free` : 'Active'}
              </p>
              <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                👉 <strong>Directions:</strong> {nearestShelter.facilities || nearestShelter.safe_route_instructions || "Follow upper contour ridge road."}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400">
              📞 {nearestShelter.contact_phone || '+91 1800-180-1104'}
            </span>
            <button
              onClick={() => setActivePage('safe-locations')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
            >
              <span>View Route & Navigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Prototype Notice Footer */}
      <div className="text-center pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500">
        Note: Action recommendations are generated by the PralayWatch Decision-Support Engine. In a live emergency, always follow verified State Disaster Management Authority (SDMA) and National Disaster Response Force (NDRF) orders.
      </div>
    </div>
  );
}
