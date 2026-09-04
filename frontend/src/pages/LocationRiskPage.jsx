import React from 'react';
import { useApp } from '../context/AppContext';
import RiskGauge from '../components/RiskGauge';
import HazardCard from '../components/HazardCard';
import AiExplanationPanel from '../components/AiExplanationPanel';
import SafeLocationList from '../components/SafeLocationList';
import LocationSearch from '../components/LocationSearch';
import PipelineTraceViewer from '../components/PipelineTraceViewer';
import ImpactAssessmentPanel from '../components/ImpactAssessmentPanel';
import WhatShouldIDoPanel from '../components/WhatShouldIDoPanel';
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
      <div className="p-8 text-center text-[#5B6B78] dark:text-[#94A3B8] font-mono">
        Loading location risk telemetry...
      </div>
    );
  }

  const rawFactors = locationRisk?.contributing_factors || [];
  const factors = Array.isArray(rawFactors)
    ? rawFactors
    : typeof rawFactors === 'string'
    ? rawFactors.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'text-[#C62828] dark:text-[#F87171] border-[#C62828]/40 bg-[#FFF1F1] dark:bg-[#3B1219]/60';
      case 'HIGH':
        return 'text-[#E87516] dark:text-[#FB923C] border-[#E87516]/40 bg-[#FFF7E6] dark:bg-[#3A280B]/60';
      case 'MODERATE':
        return 'text-[#D99A00] dark:text-[#FBBF24] border-[#D99A00]/40 bg-[#FFF7E6] dark:bg-[#3A280B]/60';
      default:
        return 'text-[#16855B] dark:text-[#34D399] border-[#16855B]/40 bg-[#EAF7F1] dark:bg-[#0B3322]/60';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
      {/* Back Button & Location Hero */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D7E0E7] dark:border-[#1E2E4A] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('dashboard')}
              className="p-2 bg-[#F8FAFC] dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-[#5B6B78] dark:text-[#94A3B8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] dark:text-[#38BDF8] font-bold">
                LOCATION RISK ASSESSMENT
              </div>
              <h2 className="text-2xl font-black text-[#172B3A] dark:text-[#F8FAFC]">
                {selectedLocation.name}
              </h2>
              <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] font-mono">
                {selectedLocation.state}, {selectedLocation.country} • Elevation: {selectedLocation.elevation}m • Population: {selectedLocation.population?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerSimulation('combined_emergency')}
              disabled={isSimulating}
              className="px-4 py-2 bg-[#C62828] hover:bg-[#a82222] text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Flame className="w-4 h-4" />
              <span>Simulate Emergency</span>
            </button>

            <button
              onClick={() => setActivePage('safe-locations')}
              className="px-4 py-2 bg-[#16855B] hover:bg-[#126d4a] text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Safe Evacuation</span>
            </button>
          </div>
        </div>

        {/* Big Overall Risk Breakdown Header Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Overall Composite Score */}
          <div className="md:col-span-2 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-5 flex items-center justify-around">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#5B6B78] dark:text-[#94A3B8] block font-bold">
                OVERALL COMPOSITE RISK
              </span>
              <div className={`inline-block px-3 py-1 rounded-md text-sm font-mono font-black border ${getLevelColor(locationRisk.overall_level)}`}>
                {locationRisk.overall_level} RISK
              </div>
              <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] font-mono mt-1">
                Estimated Lead Time: <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{locationRisk.lead_time_minutes} mins</strong>
              </p>
            </div>
            <RiskGauge score={locationRisk.overall_score} level={locationRisk.overall_level} size="lg" />
          </div>

          {/* 4 Multi-Hazard Breakdown Summary Tiles */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Flash Flood</span>
              <span className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC] my-1">{locationRisk.flash_flood?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.flash_flood?.level)}`}>
                {locationRisk.flash_flood?.level}
              </span>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">River Flood</span>
              <span className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC] my-1">{locationRisk.flood?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.flood?.level)}`}>
                {locationRisk.flood?.level}
              </span>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Landslide</span>
              <span className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC] my-1">{locationRisk.landslide?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.landslide?.level)}`}>
                {locationRisk.landslide?.level}
              </span>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-[11px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Heavy Rain</span>
              <span className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC] my-1">{locationRisk.heavy_rainfall?.score || 0}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getLevelColor(locationRisk.heavy_rainfall?.level)}`}>
                {locationRisk.heavy_rainfall?.level}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Factors Checklist Box */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#172B3A] dark:text-[#F8FAFC] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16855B] dark:text-[#34D399]" />
            <span>Contributing Environmental Risk Factors:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#172B3A] dark:text-[#E2E8F0] bg-white dark:bg-[#070F1E] px-3 py-2 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
                <span className="text-[#16855B] dark:text-[#34D399] font-bold">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stage 6: Prominent 'WHAT SHOULD I DO RIGHT NOW?' Action Directives */}
      <WhatShouldIDoPanel />

      {/* Environmental Telemetry Raw Metrics Table */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#172B3A] dark:text-[#F8FAFC] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
          <span>Real-Time Environmental Telemetry Readings</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] uppercase">Rainfall Rate</span>
            <div className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC]">{environmentalData?.rainfall_rate} mm/hr</div>
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Intensity: {environmentalData?.rainfall_intensity}</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] uppercase">24h Rainfall</span>
            <div className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC]">{environmentalData?.rainfall_mm} mm</div>
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Accumulated</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] uppercase">River Capacity</span>
            <div className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC]">{environmentalData?.river_capacity_pct}%</div>
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Trend: {environmentalData?.river_trend}</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] uppercase">Soil Saturation</span>
            <div className="text-lg font-bold font-mono text-[#172B3A] dark:text-[#F8FAFC]">{environmentalData?.soil_saturation_pct}%</div>
            <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">Slope: {environmentalData?.slope_deg}°</span>
          </div>
        </div>
      </section>

      {/* Stage 4: Estimated Impact & Exposure Assessment Panel */}
      <ImpactAssessmentPanel />

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
