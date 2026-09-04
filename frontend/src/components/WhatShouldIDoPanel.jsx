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
    <div className={`rounded-2xl border p-5 lg:p-6 shadow-sm relative overflow-hidden transition-all space-y-6 font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0] ${
      isCritical 
        ? 'bg-[#FFF1F1] dark:bg-[#1A0A0D] border-[#C62828] dark:border-[#C62828]/80 ring-1 ring-[#C62828]/30' 
        : (isHigh 
          ? 'bg-[#FFF7E6] dark:bg-[#1C1205] border-[#D99A00] dark:border-[#D99A00]/70 ring-1 ring-[#D99A00]/20' 
          : 'bg-white dark:bg-[#111C35] border-[#D7E0E7] dark:border-[#1E2E4A]')
    }`}>
      {/* Background ambient light */}
      <div className={`absolute top-0 right-0 w-96 h-48 blur-3xl pointer-events-none ${
        isCritical ? 'bg-red-500/10' : (isHigh ? 'bg-orange-500/10' : 'bg-blue-500/5')
      }`} />

      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D7E0E7] dark:border-[#1E2E4A] relative z-10">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
            isCritical 
              ? 'bg-[#C62828] border-[#C62828] text-white animate-pulse' 
              : (isHigh ? 'bg-[#D99A00] border-[#D99A00] text-white' : 'bg-[#E8F2F8] dark:bg-[#0C2D48] border-[#1769AA]/30 text-[#1769AA] dark:text-[#38BDF8]')
          }`}>
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#5B6B78] dark:text-[#94A3B8]">
                AapdaSetu Life-Safety Action Engine
              </span>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                isCritical 
                  ? 'bg-[#C62828] text-white animate-bounce' 
                  : (isHigh ? 'bg-[#D99A00] text-white' : 'bg-[#1769AA] text-white')
              }`}>
                {isCritical ? 'CRITICAL EVACUATION REQUIRED' : (isHigh ? 'PRE-EVACUATION WARNING' : 'ADVISORY MONITORING')}
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-[#172B3A] dark:text-[#F8FAFC] tracking-tight mt-1">
              WHAT SHOULD I DO RIGHT NOW?
            </h2>

            <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] mt-1 font-mono">
              Immediate action directives for <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{selectedLocation?.name || 'Dehradun'}</strong> facing <strong className="text-[#D99A00] dark:text-[#FBBF24]">{dominantHazard}</strong> threat.
            </p>
          </div>
        </div>

        {/* Action Priority Status Tag */}
        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 shadow-sm ${
            isCritical 
              ? 'bg-[#FFF1F1] dark:bg-[#3B1219] border-[#C62828] text-[#C62828] dark:text-[#F87171]' 
              : (isHigh ? 'bg-[#FFF7E6] dark:bg-[#3A280B] border-[#D99A00] text-[#D99A00] dark:text-[#FBBF24]' : 'bg-[#F8FAFC] dark:bg-[#0B1528] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-[#94A3B8]')
          }`}>
            <Radio className={`w-4 h-4 ${isEmergency ? 'text-[#C62828] dark:text-[#F87171] animate-pulse' : 'text-[#5B6B78] dark:text-[#94A3B8]'}`} />
            <span>ACTIVE DIRECTIVE</span>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Core Action Split (Immediate Action vs Places to Avoid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Immediate Action Steps */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#16855B] dark:text-[#34D399] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Immediate Actions to Take:</span>
            </h3>
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Step-by-Step Directives</span>
          </div>

          <div className="space-y-2.5">
            {immediateActions.map((action, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${
                  idx === 0 && isEmergency
                    ? 'bg-[#FFF1F1] dark:bg-[#3B1219]/60 border-[#C62828]/50 text-[#172B3A] dark:text-white font-semibold shadow-sm' 
                    : 'bg-[#F8FAFC] dark:bg-[#070F1E] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#172B3A] dark:text-[#E2E8F0] hover:border-[#1769AA] dark:hover:border-[#38BDF8]'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                  idx === 0 && isEmergency ? 'bg-[#C62828] text-white' : 'bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399]'
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
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C62828] dark:text-[#F87171] flex items-center gap-2">
                <Ban className="w-4 h-4" />
                <span>Places & Areas to Avoid:</span>
              </h3>
              <span className="text-[10px] font-mono text-[#C62828] dark:text-[#F87171] font-semibold">Danger Zones</span>
            </div>

            <div className="space-y-2.5 mt-4">
              {placesToAvoid.map((dangerArea, idx) => (
                <div key={idx} className="p-3 bg-[#FFF1F1] dark:bg-[#3B1219]/60 border border-[#C62828]/40 rounded-lg flex items-start gap-2.5 text-xs font-mono text-[#C62828] dark:text-[#FCA5A5]">
                  <span className="text-[#C62828] dark:text-[#F87171] font-bold text-sm">✕</span>
                  <p className="leading-relaxed">
                    {dangerArea}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Helpline banner */}
          <div className="bg-[#F8FAFC] dark:bg-[#070F1E] p-3 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between text-xs font-mono mt-4">
            <div className="flex items-center gap-2 text-[#5B6B78] dark:text-[#94A3B8]">
              <PhoneCall className="w-4 h-4 text-[#16855B] dark:text-[#34D399]" />
              <span>National Disaster Helpline:</span>
            </div>
            <a href="tel:112" className="text-[#16855B] dark:text-[#34D399] font-bold hover:underline">
              112 / 1070
            </a>
          </div>
        </div>
      </div>

      {/* 3. Suggested Safe Direction & Nearest Safe Shelter (Dual Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card A: Suggested Safe Evacuation Direction */}
        <div className="bg-white dark:bg-[#0B1528] border border-[#1769AA]/40 dark:border-[#38BDF8]/40 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1769AA] dark:text-[#38BDF8] font-bold text-xs font-mono uppercase">
              <Compass className="w-4 h-4" />
              <span>Suggested Safe Evacuation Direction</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30">
              Simulated Route
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-[#172B3A] dark:text-[#F8FAFC] font-mono flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8] shrink-0" />
              <span>Ascend North-East to High Ridge Contour</span>
            </h4>
            <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] font-mono mt-1.5 leading-relaxed">
              Ascend away from the river tributary floor (+85m elevation gain). Follow the upper arterial highway directly toward the designated primary structural shelter. Do not take low-lying river bypass paths.
            </p>
          </div>

          <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between text-xs font-mono text-[#5B6B78] dark:text-[#94A3B8]">
            <span>Terrain Elevation: <strong className="text-[#172B3A] dark:text-[#F8FAFC]">+85m Safety Clearance</strong></span>
            <span className="text-[#1769AA] dark:text-[#38BDF8] font-semibold">Ridge Corridor Open</span>
          </div>
        </div>

        {/* Card B: Nearest Designated Safe Shelter */}
        <div className="bg-white dark:bg-[#0B1528] border border-[#16855B]/40 dark:border-[#34D399]/40 rounded-xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#16855B] dark:text-[#34D399] font-bold text-xs font-mono uppercase">
                <Building2 className="w-4 h-4" />
                <span>Nearest Available Safe Shelter</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/30">
                Demo Safe Location
              </span>
            </div>

            <div className="mt-2">
              <h4 className="text-base font-bold text-[#172B3A] dark:text-[#F8FAFC] truncate font-mono">
                {nearestShelter.name}
              </h4>
              <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] font-mono mt-0.5">
                {nearestShelter.distance_km} km away • Est. {nearestShelter.est_walking_mins} mins walk • {nearestShelter.capacity ? `${nearestShelter.capacity - nearestShelter.current_occupancy} spots free` : 'Active'}
              </p>
              <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] font-mono mt-2 leading-relaxed">
                👉 <strong className="text-[#172B3A] dark:text-[#F8FAFC]">Directions:</strong> {nearestShelter.facilities || nearestShelter.safe_route_instructions || "Follow upper contour ridge road."}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#16855B] dark:text-[#34D399]">
              📞 {nearestShelter.contact_phone || '+91 1800-180-1104'}
            </span>
            <button
              onClick={() => setActivePage('safe-locations')}
              className="px-3 py-1.5 bg-[#16855B] hover:bg-[#126d4a] text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>View Route & Navigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Prototype Notice Footer */}
      <div className="text-center pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-[11px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">
        Note: Action recommendations are generated by the AapdaSetu Decision-Support Engine. In a live emergency, always follow verified State Disaster Management Authority (SDMA) and National Disaster Response Force (NDRF) orders.
      </div>
    </div>
  );
}
