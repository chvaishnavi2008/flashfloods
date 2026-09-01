import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Cpu, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Home, 
  CheckCircle2, 
  ArrowRight, 
  Radio, 
  Layers, 
  Database, 
  BarChart3, 
  Flame, 
  Waves, 
  Mountain, 
  CloudRain, 
  Wind,
  Info,
  ChevronRight,
  Zap
} from 'lucide-react';

export default function PipelineTraceViewer() {
  const { pipelineData, locationRisk, selectedLocation, environmentalData } = useApp();
  const [activeStage, setActiveStage] = useState('all'); // 'all' | 1 | 2 | 3 | 4 | 5 | 6

  const stages = pipelineData?.stages || null;
  const stage1 = stages?.stage1_data_ingestion;
  const stage2 = stages?.stage2_risk_analysis;
  const stage3 = stages?.stage3_hazard_prediction;
  const stage4 = stages?.stage4_impact_assessment?.impact_assessment || pipelineData?.impact;
  const stage5 = stages?.stage5_early_warning;
  const stage6 = stages?.stage6_action_recommendation;

  const stageTabs = [
    { num: 1, id: 'data', title: 'Data Ingestion', sub: 'Telemetry', icon: Database },
    { num: 2, id: 'analysis', title: 'Risk Analysis', sub: 'Features', icon: BarChart3 },
    { num: 3, id: 'prediction', title: 'Hazard Prediction', sub: 'Multi-Hazard', icon: Cpu },
    { num: 4, id: 'impact', title: 'Impact Assessment', sub: 'Exposure', icon: Users },
    { num: 5, id: 'warning', title: 'Early Warning', sub: 'CAP Alert', icon: Radio },
    { num: 6, id: 'action', title: 'Action Directive', sub: 'Life-Safety', icon: ShieldAlert },
  ];

  const getHazardIcon = (hazardKey) => {
    switch (hazardKey) {
      case 'flash_flood':
        return Waves;
      case 'landslide':
        return Mountain;
      case 'heavy_rainfall':
        return CloudRain;
      case 'flood':
        return Waves;
      case 'cyclone':
        return Wind;
      case 'glof':
        return Mountain;
      default:
        return AlertTriangle;
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-600 text-white font-black animate-pulse';
      case 'HIGH':
        return 'bg-orange-500 text-white font-bold';
      case 'MODERATE':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl space-y-0">
      {/* Pipeline Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 px-6 py-4 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              DISASTER INTELLIGENCE PIPELINE
            </span>
            <span className="text-xs font-mono text-slate-400">
              End-to-End Orchestration Architecture
            </span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>DATA</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span>RISK ANALYSIS</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span>HAZARD PREDICTION</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span>IMPACT</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span>EARLY WARNING</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span>ACTION</span>
          </h3>
        </div>

        {/* Model Transparency Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-blue-500/30 rounded-xl text-xs font-mono text-blue-300 shrink-0">
          <Cpu className="w-4 h-4 text-blue-400" />
          <div>
            <span className="block text-[10px] text-slate-400 font-bold">MODEL ARCHITECTURE</span>
            <span>Modular Rule Engine + ML Slots</span>
          </div>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveStage('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeStage === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          View Full Pipeline (All 6 Stages)
        </button>

        {stageTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeStage === tab.num;
          return (
            <button
              key={tab.num}
              onClick={() => setActiveStage(tab.num)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-800 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
                {tab.num}
              </span>
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Pipeline Stage Content Cards */}
      <div className="p-6 space-y-6">
        {/* STAGE 1: DATA INGESTION */}
        {(activeStage === 'all' || activeStage === 1) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">STAGE 1</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Data Ingestion & Telemetry Validation</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {stage1?.data_quality || 'VERIFIED_OK'}
              </span>
            </div>

            {/* Sensor Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Rainfall Rate</span>
                <span className="text-base font-mono font-bold text-white">
                  {stage1?.telemetry_sensors?.rainfall_rate_mm_hr ?? environmentalData?.rainfall_rate ?? 5} mm/hr
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Doppler Nowcast</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">24h Accumulated</span>
                <span className="text-base font-mono font-bold text-white">
                  {stage1?.telemetry_sensors?.cumulative_24h_rainfall_mm ?? environmentalData?.rainfall_mm ?? 25} mm
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Hydro Gauge</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">River Channel Load</span>
                <span className="text-base font-mono font-bold text-white">
                  {stage1?.telemetry_sensors?.river_gauge_capacity_pct ?? environmentalData?.river_capacity_pct ?? 35}%
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Level: {stage1?.telemetry_sensors?.river_gauge_height_m ?? environmentalData?.river_level_m ?? 2.1}m
                </span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Soil Saturation & Slope</span>
                <span className="text-base font-mono font-bold text-white">
                  {stage1?.telemetry_sensors?.soil_moisture_saturation_pct ?? environmentalData?.soil_saturation_pct ?? 45}%
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Slope: {stage1?.telemetry_sensors?.terrain_slope_angle_deg ?? environmentalData?.slope_deg ?? 32}°
                </span>
              </div>
            </div>

            {/* Active Sensor Networks */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Ingestion Sources:</span>
              {(stage1?.active_telemetry_sources || ["IMD Doppler Radar Nowcast", "CWC Basin Hydro-Gauge", "GSI Slope Geotechnical Sensor"]).map((src, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded border border-slate-700">
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 2: RISK ANALYSIS & FEATURE EXTRACTION */}
        {(activeStage === 'all' || activeStage === 2) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">STAGE 2</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Risk Analysis & Catchment Feature Extraction</h4>
                </div>
              </div>
              <span className="text-xs font-mono text-indigo-300">Hydro-Mechanic Features</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Pore-Water Ratio</span>
                <span className="text-base font-mono font-bold text-white">
                  {stage2?.extracted_features?.pore_water_pressure_ratio ?? 0.45}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Soil saturation ratio</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Hydraulic Load Index</span>
                <span className="text-base font-mono font-bold text-white">
                  {stage2?.extracted_features?.hydraulic_catchment_load_index ?? 0.32}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Runoff + Basin pressure</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Slope Shear Status</span>
                <span className={`text-base font-mono font-bold ${stage2?.extracted_features?.slope_shear_instability_status === 'ELEVATED' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {stage2?.extracted_features?.slope_shear_instability_status ?? 'NOMINAL'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Geotechnical stability</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Runoff Acceleration</span>
                <span className="text-base font-mono font-bold text-white">
                  {stage2?.extracted_features?.catchment_runoff_acceleration ?? 1.25}x
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Mountain valley gradient</span>
              </div>
            </div>

            {/* Primary Stress Factors */}
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1.5">
                Identified Stress Drivers:
              </span>
              <div className="flex flex-wrap gap-2">
                {(stage2?.primary_stress_factors || [
                  `Rainfall intensity: ${environmentalData?.rainfall_rate || 5} mm/hr`,
                  `Soil moisture saturation: ${environmentalData?.soil_saturation_pct || 45}%`,
                  `River channel load: ${environmentalData?.river_capacity_pct || 35}%`
                ]).map((f, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded">
                    • {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: MULTI-HAZARD PREDICTION */}
        {(activeStage === 'all' || activeStage === 3) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">STAGE 3</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Multi-Hazard Prediction Engine</h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Composite Risk:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getLevelBadge(stage3?.composite_level || locationRisk?.overall_level || 'LOW')}`}>
                  {stage3?.composite_score || locationRisk?.overall_score || 20}% ({stage3?.composite_level || locationRisk?.overall_level || 'LOW'})
                </span>
              </div>
            </div>

            {/* Multi-Hazard Predictors Grid (Flash Flood, Landslide, Extreme Rainfall, Riverine Flood, Cyclone, GLOF) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'flash_flood', name: '1. Flash Flood (P1)', pred: stage3?.hazard_predictions?.flash_flood || { score: locationRisk?.flash_flood?.score || 15, level: locationRisk?.flash_flood?.level || 'LOW' } },
                { key: 'landslide', name: '2. Landslide (P2)', pred: stage3?.hazard_predictions?.landslide || { score: locationRisk?.landslide?.score || 22, level: locationRisk?.landslide?.level || 'LOW' } },
                { key: 'heavy_rainfall', name: '3. Extreme Rainfall (P3)', pred: stage3?.hazard_predictions?.heavy_rainfall || { score: locationRisk?.heavy_rainfall?.score || 18, level: locationRisk?.heavy_rainfall?.level || 'LOW' } },
                { key: 'flood', name: '4. Riverine Inundation', pred: stage3?.hazard_predictions?.flood || { score: locationRisk?.flood?.score || 12, level: locationRisk?.flood?.level || 'LOW' } },
                { key: 'cyclone', name: '5. Cyclone / Windstorm', pred: stage3?.hazard_predictions?.cyclone || { score: 10, level: 'LOW' } },
                { key: 'glof', name: '6. GLOF Cryosphere Surge', pred: stage3?.hazard_predictions?.glof || { score: 8, level: 'LOW' } },
              ].map(({ key, name, pred }) => {
                const Icon = getHazardIcon(key);
                return (
                  <div key={key} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                        <span>{name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${getLevelBadge(pred.level)}`}>
                        {pred.level}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Calculated Score:</span>
                      <span className="font-bold text-white">{pred.score}%</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${pred.score >= 76 ? 'bg-red-500' : (pred.score >= 51 ? 'bg-orange-500' : (pred.score >= 31 ? 'bg-amber-500' : 'bg-emerald-500'))}`}
                        style={{ width: `${pred.score}%` }}
                      />
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      Model: {pred.model_type || "Deterministic Hydro/Geotech Engine"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 4: IMPACT & EXPOSURE ASSESSMENT */}
        {(activeStage === 'all' || activeStage === 4) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">STAGE 4</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Impact & Exposure Assessment</h4>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-300">
                {stage4?.severity_index || 'DEMOGRAPHIC EXPOSURE'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Exposed Population</span>
                <span className="text-base font-mono font-bold text-white">
                  {(stage4?.exposed_population || 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  {stage4?.exposure_percentage || 5}% of sector
                </span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Elderly & Children</span>
                <span className="text-base font-mono font-bold text-amber-300">
                  {((stage4?.vulnerable_demographics?.elderly_above_60 || 0) + (stage4?.vulnerable_demographics?.children_under_12 || 0)).toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Priority rescue cohort</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Shelter Demand</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {(stage4?.estimated_shelter_demand || 0).toLocaleString()} beds
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">Required capacity</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Evacuation Urgency</span>
                <span className={`text-xs font-mono font-bold block mt-1 ${stage4?.evacuation_urgency?.includes('IMMEDIATE') ? 'text-red-400' : 'text-slate-300'}`}>
                  {stage4?.evacuation_urgency || 'STANDBY'}
                </span>
              </div>
            </div>

            {/* Critical Infrastructure at Risk */}
            {stage4?.infrastructure_at_risk && stage4.infrastructure_at_risk.length > 0 && (
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-2">
                  Critical Infrastructure Vulnerability:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {stage4.infrastructure_at_risk.map((infra, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                      <span className="text-slate-200">{infra.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">{infra.risk_status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE 5: EARLY WARNING ISSUANCE */}
        {(activeStage === 'all' || activeStage === 5) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">STAGE 5</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Standardized Early Warning Issuance</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                CAP PROTOCOL COMPLIANT
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Headline:</span>
                <span className="font-bold text-white">
                  {stage5?.warning_headline || `Official Multi-Hazard Warning for ${selectedLocation?.name || 'Sector'}`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Severity Badge:</span>
                  <span className="font-bold text-red-400">{stage5?.severity_badge || 'RED ALERT'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Broadcast Urgency:</span>
                  <span className="font-bold text-white">{stage5?.alert_urgency || 'IMMEDIATE'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Lead Time Window:</span>
                  <span className="font-bold text-emerald-400">~{stage5?.estimated_lead_time_mins || locationRisk?.lead_time_minutes || 35} mins</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Broadcast Radius:</span>
                  <span className="font-bold text-white">{stage5?.broadcast_radius_km || 20} km</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 6: ACTION & SAFETY RECOMMENDATION */}
        {(activeStage === 'all' || activeStage === 6) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">STAGE 6</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Action Directives & Life-Safety Guidance</h4>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400">24/7 Helplines: 112 / 1070</span>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs space-y-2 font-mono">
              <span className="text-emerald-400 font-bold uppercase block text-[11px]">Primary Citizen Directive:</span>
              <p className="text-white text-sm font-sans leading-relaxed">
                {stage6?.primary_directive || locationRisk?.recommended_action || "Maintain regular monitoring. Check safe shelter routes."}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Citizen Safety Action Checklist:
              </span>
              {(stage6?.action_checklist || [
                "1. Move immediately toward designated high-ground safe relief shelters.",
                "2. Turn off domestic electricity and gas valves before leaving.",
                "3. Stay away from fast-flowing streams and drainage culverts.",
                "4. Carry emergency go-bag (water, first aid, torch, vital documents)."
              ]).map((act, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
