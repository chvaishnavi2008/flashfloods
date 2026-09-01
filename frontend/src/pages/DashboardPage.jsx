import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import HazardCard from '../components/HazardCard';
import RiskMap from '../components/RiskMap';
import AiExplanationPanel from '../components/AiExplanationPanel';
import SafeLocationList from '../components/SafeLocationList';
import LocationSearch from '../components/LocationSearch';
import CitizenSosModal from '../components/CitizenSosModal';
import PipelineTraceViewer from '../components/PipelineTraceViewer';
import SimulationTimelineBar from '../components/SimulationTimelineBar';
import { 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Users, 
  Flame, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Droplets,
  Navigation,
  HeartPulse,
  PhoneCall,
  Home,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    selectedLocation, 
    locationRisk, 
    environmentalData, 
    systemRisk, 
    safeLocations,
    triggerSimulation, 
    isSimulating,
    setActivePage,
    userRole
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  const isCritical = locationRisk?.overall_level === 'CRITICAL';
  const isHigh = locationRisk?.overall_level === 'HIGH';
  const nearestShelter = safeLocations[0] || null;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Citizen Portal Hero Status Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 rounded-2xl border border-slate-700 p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                CITIZEN SAFETY PORTAL
              </span>
              <span className="text-xs font-mono text-slate-400">
                Hyper-Local Disaster Advisory for Communities
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{isCritical ? '🚨 CRITICAL RISK IN YOUR SECTOR' : (isHigh ? '⚠ HIGH RISK WARNING' : '✔ NORMAL MONITORING CONDITIONS')}</span>
            </h2>

            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Real-time multi-hazard guidance for **Flash Floods**, **River Floods**, **Landslides**, and **Heavy Rainfall**. Follow safe evacuation routes and shelter recommendations.
            </p>
          </div>

          {/* Quick Citizen Action Group */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setIsSosOpen(true)}
              className="w-full sm:w-auto px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Request SOS Rescue</span>
            </button>

            <button
              onClick={() => setActivePage('safe-locations')}
              className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Navigation className="w-4 h-4" />
              <span>Evacuate to Shelter</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. SIH Live Disaster Simulation Layer Controller */}
      <SimulationTimelineBar />

      {/* 3. Citizen Safety Fast-Action Cards (Am I in Danger? / Nearest Shelter / SOS Helpline) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: My Neighborhood Safety Status */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-mono uppercase">
              <MapPin className="w-4 h-4" />
              <span>Current Sector Status</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              isCritical ? 'bg-red-600 text-white' : (isHigh ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white')
            }`}>
              {locationRisk?.overall_level || 'LOW'} RISK
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{selectedLocation?.name || 'Dehradun'}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedLocation?.state}, {selectedLocation?.country}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Lead Time: ~{locationRisk?.lead_time_minutes || 35} mins</span>
            <button
              onClick={() => setActivePage('location-risk')}
              className="text-blue-400 hover:text-blue-300 font-mono font-semibold flex items-center gap-1"
            >
              <span>View Factors</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Nearest Safe Shelter */}
        <div className="bg-[#1E293B] border border-emerald-500/40 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Nearest Open Shelter</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {nearestShelter?.status || 'OPEN'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white truncate">{nearestShelter?.name || 'Govt Higher Secondary School'}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {nearestShelter?.distance_km} km away • Est. {nearestShelter?.est_walking_mins} mins walk
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-mono font-semibold">
              {nearestShelter ? `${nearestShelter.capacity - nearestShelter.current_occupancy} spots available` : 'Active'}
            </span>
            <button
              onClick={() => setActivePage('safe-locations')}
              className="text-emerald-400 hover:text-emerald-300 font-mono font-semibold flex items-center gap-1"
            >
              <span>Directions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Emergency SOS & Helpline */}
        <div className="bg-[#1E293B] border border-red-500/30 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs font-mono uppercase">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency SOS Helpline</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-500/30">
              24/7 TOLL FREE
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-mono">112 / 1070 (SDMA)</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              State Disaster Management & NDRF Control Room
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsSosOpen(true)}
              className="text-red-400 hover:text-red-300 font-mono font-bold flex items-center gap-1"
            >
              <span>Request Rescue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <a
              href="tel:112"
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-mono font-bold text-xs"
            >
              CALL 112
            </a>
          </div>
        </div>
      </section>

      {/* 3. The Four Core Hazard Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Multi-Hazard Risk Breakdown</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Real-time automated scoring
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HazardCard
            type="flash_flood"
            title="Flash Flood"
            level={locationRisk?.flash_flood?.level || 'LOW'}
            score={locationRisk?.flash_flood?.score || 20}
            metrics={[
              { label: 'Rainfall Intensity', value: `${environmentalData?.rainfall_rate || 5} mm/hr`, highlight: environmentalData?.rainfall_rate > 50 },
              { label: 'River Condition', value: environmentalData?.river_trend || 'Normal', highlight: environmentalData?.river_trend.includes('Rising') },
              { label: 'Basin Capacity', value: `${environmentalData?.river_capacity_pct || 35}%`, highlight: environmentalData?.river_capacity_pct > 75 }
            ]}
            trend={environmentalData?.river_trend || 'Normal'}
          />

          <HazardCard
            type="flood"
            title="Riverine Flood"
            level={locationRisk?.flood?.level || 'LOW'}
            score={locationRisk?.flood?.score || 15}
            metrics={[
              { label: 'Water Level (m)', value: `${environmentalData?.river_level_m || 2.1} m`, highlight: environmentalData?.river_level_m > 5.0 },
              { label: '24h Rainfall Accum.', value: `${environmentalData?.rainfall_mm || 25} mm`, highlight: environmentalData?.rainfall_mm > 100 },
              { label: 'Catchment Buffer', value: `${environmentalData?.river_capacity_pct || 35}%`, highlight: environmentalData?.river_capacity_pct > 75 }
            ]}
            trend={environmentalData?.rainfall_forecast_trend || 'Stable'}
          />

          <HazardCard
            type="landslide"
            title="Landslide / Land Risk"
            level={locationRisk?.landslide?.level || 'LOW'}
            score={locationRisk?.landslide?.score || 25}
            metrics={[
              { label: 'Soil Saturation', value: `${environmentalData?.soil_saturation_pct || 45}%`, highlight: environmentalData?.soil_saturation_pct > 75 },
              { label: 'Slope Geometry', value: `${environmentalData?.slope_deg || 32}°`, highlight: environmentalData?.slope_deg > 30 },
              { label: 'Slope Stability', value: environmentalData?.slope_stability || 'Stable', highlight: environmentalData?.slope_stability.includes('Risk') }
            ]}
            trend={environmentalData?.slope_stability || 'Stable'}
          />

          <HazardCard
            type="heavy_rainfall"
            title="Heavy Rainfall"
            level={locationRisk?.heavy_rainfall?.level || 'LOW'}
            score={locationRisk?.heavy_rainfall?.score || 18}
            metrics={[
              { label: 'Rainfall Intensity', value: environmentalData?.rainfall_intensity || 'Light', highlight: environmentalData?.rainfall_intensity.includes('Heavy') || environmentalData?.rainfall_intensity.includes('Cloudburst') },
              { label: 'Current Rate', value: `${environmentalData?.rainfall_rate || 5} mm/hr`, highlight: environmentalData?.rainfall_rate > 50 },
              { label: 'Forecast Trend', value: environmentalData?.rainfall_forecast_trend || 'Stable' }
            ]}
            trend={environmentalData?.rainfall_forecast_trend || 'Stable'}
          />
        </div>
      </section>

      {/* 4. Interactive Tactical Risk Map Canvas */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Interactive Multi-Hazard Threat Map & Evacuation Path</span>
          </h3>
          <button
            onClick={() => setActivePage('map')}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Full Screen Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <RiskMap height="460px" showRoute={true} />
      </section>

      {/* 5. Complete 6-Stage Disaster Intelligence Pipeline Trace */}
      <section>
        <PipelineTraceViewer />
      </section>

      {/* 6. AI Risk Explanation & Nearest Safe Shelters Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AiExplanationPanel />
        </div>
        <div className="lg:col-span-6">
          <SafeLocationList onSelectRoute={() => setActivePage('safe-locations')} />
        </div>
      </section>

      {/* 6. Comprehensive Location Search Module */}
      <section>
        <LocationSearch onSearchComplete={() => {}} />
      </section>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
