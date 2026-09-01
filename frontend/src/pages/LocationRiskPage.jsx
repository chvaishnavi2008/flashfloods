import React from 'react';
import { useApp } from '../context/AppContext';
import RiskGauge from '../components/RiskGauge';
import HazardCard from '../components/HazardCard';
import AiExplanationPanel from '../components/AiExplanationPanel';
import SafeLocationList from '../components/SafeLocationList';
import LocationSearch from '../components/LocationSearch';
import PipelineTraceViewer from '../components/PipelineTraceViewer';
import { 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  Navigation, 
  Gauge, 
  ArrowLeft,
  Flame
} from 'lucide-react';

export default function LocationRiskPage() {
  const { 
    selectedLocation, 
    locationRisk, 
    environmentalData, 
    triggerSimulation, 
    isSimulating,
    setActivePage 
  } = useApp();

  if (!selectedLocation || !locationRisk) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Loading location risk telemetry...
      </div>
    );
  }

  const factors = locationRisk.contributing_factors || [];

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'text-red-400 border-red-500/40 bg-red-500/10';
      case 'HIGH':
        return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
      case 'MODERATE':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      default:
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Location Hero */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('dashboard')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
                LOCATION RISK ASSESSMENT
              </div>
              <h2 className="text-2xl font-black text-white">
                {selectedLocation.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {selectedLocation.state}, {selectedLocation.country} • Elevation: {selectedLocation.elevation}m • Population: {selectedLocation.population?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerSimulation('combined_emergency')}
              disabled={isSimulating}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
            >
              <Flame className="w-4 h-4" />
              <span>Simulate Emergency</span>
            </button>

            <button
              onClick={() => setActivePage('safe-locations')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Safe Evacuation</span>
            </button>
          </div>
        </div>

        {/* Big Overall Risk Breakdown Header Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Overall Composite Score */}
          <div className="md:col-span-2 bg-slate-900/90 border border-slate-700 rounded-xl p-5 flex items-center justify-around">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-slate-400 block font-bold">
                OVERALL COMPOSITE RISK
              </span>
              <div className={`inline-block px-3 py-1 rounded-md text-sm font-mono font-black border ${getLevelColor(locationRisk.overall_level)}`}>
                {locationRisk.overall_level} RISK
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Estimated Lead Time: <strong className="text-white">{locationRisk.lead_time_minutes} mins</strong>
              </p>
            </div>
            <RiskGauge score={locationRisk.overall_score} level={locationRisk.overall_level} size="lg" />
          </div>

          {/* 4 Multi-Hazard Breakdown Summary Tiles */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400">Flash Flood</span>
              <span className="text-lg font-bold font-mono text-white my-1">{locationRisk.flash_flood?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.flash_flood?.level)}`}>
                {locationRisk.flash_flood?.level}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400">River Flood</span>
              <span className="text-lg font-bold font-mono text-white my-1">{locationRisk.flood?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.flood?.level)}`}>
                {locationRisk.flood?.level}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400">Landslide</span>
              <span className="text-lg font-bold font-mono text-white my-1">{locationRisk.landslide?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.landslide?.level)}`}>
                {locationRisk.landslide?.level}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400">Heavy Rain</span>
              <span className="text-lg font-bold font-mono text-white my-1">{locationRisk.heavy_rainfall?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.heavy_rainfall?.level)}`}>
                {locationRisk.heavy_rainfall?.level}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Factors Checklist Box */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Contributing Environmental Risk Factors:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environmental Telemetry Raw Metrics Table */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Real-Time Environmental Telemetry Readings</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Rainfall Rate</span>
            <div className="text-lg font-bold font-mono text-white">{environmentalData?.rainfall_rate} mm/hr</div>
            <span className="text-[10px] font-mono text-slate-500">Intensity: {environmentalData?.rainfall_intensity}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">24h Rainfall</span>
            <div className="text-lg font-bold font-mono text-white">{environmentalData?.rainfall_mm} mm</div>
            <span className="text-[10px] font-mono text-slate-500">Accumulated</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">River Capacity</span>
            <div className="text-lg font-bold font-mono text-white">{environmentalData?.river_capacity_pct}%</div>
            <span className="text-[10px] font-mono text-slate-500">Trend: {environmentalData?.river_trend}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Soil Saturation</span>
            <div className="text-lg font-bold font-mono text-white">{environmentalData?.soil_saturation_pct}%</div>
            <span className="text-[10px] font-mono text-slate-500">Slope: {environmentalData?.slope_deg}°</span>
          </div>
        </div>
      </section>

      {/* AI Risk Explanation Panel */}
      <AiExplanationPanel />

      {/* Complete 6-Stage Disaster Intelligence Pipeline Trace */}
      <PipelineTraceViewer />

      {/* Safe Locations List */}
      <SafeLocationList />

      {/* Location Switcher */}
      <LocationSearch />
    </div>
  );
}
