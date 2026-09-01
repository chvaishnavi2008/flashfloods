import React from 'react';
import { useApp } from '../context/AppContext';
import SihDisasterDemoTheater from '../components/SihDisasterDemoTheater';
import SimulationTimelineBar from '../components/SimulationTimelineBar';
import RiskGauge from '../components/RiskGauge';
import HazardCard from '../components/HazardCard';
import { 
  Zap, 
  ShieldAlert, 
  Activity, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Info,
  RotateCcw,
  Play
} from 'lucide-react';

export default function SimulationStudioPage() {
  const { 
    selectedLocation, 
    locationRisk, 
    environmentalData, 
    simulationState,
    isSimulating
  } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-[#1E293B] to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 rounded-xl">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                  SIH DEMONSTRATION WORKSPACE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SIMULATION / DEMO DATA
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                PralayWatch Disaster Simulation Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-indigo-500/30 rounded-lg text-xs font-mono text-indigo-300">
            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>REAL-TIME CALCULATION ENGINE ACTIVE</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-mono max-w-3xl leading-relaxed">
          Demonstrates the complete end-to-end multi-hazard disaster intelligence pipeline for the Smart India Hackathon jury: 
          <strong> DATA → EARLY SIGNAL → RISK PREDICTION → HAZARD ESCALATION → EARLY WARNING → IMPACT ASSESSMENT → ACTION</strong>.
        </p>
      </div>

      {/* 1. Primary SIH Judging Demonstration Theater (7-Phase Guided Walkthrough) */}
      <section>
        <SihDisasterDemoTheater />
      </section>

      {/* 2. Temporal Timeline Scrubber & Regional Scenarios */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Time-Series Progression ($T_0 \to T_{+1} \to T_{+2}$) & Regional Demonstrations</span>
          </h3>
        </div>
        <SimulationTimelineBar />
      </section>

      {/* 3. Real-Time Telemetry Inspector Grid (Confirms Live Recalculation) */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Live Environmental Telemetry Engine Verification
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Active Sector: <strong className="text-white">{selectedLocation?.name || 'Chamoli'}</strong> ({selectedLocation?.state})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Rainfall Rate</span>
            <div className="text-lg font-black text-white">{environmentalData?.rainfall_rate || 5} mm/hr</div>
            <span className="text-[10px] text-slate-400">Intensity: {environmentalData?.rainfall_intensity || 'Light'}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">24h Accumulated</span>
            <div className="text-lg font-black text-white">{environmentalData?.rainfall_mm || 25} mm</div>
            <span className="text-[10px] text-slate-400">Trend: {environmentalData?.rainfall_forecast_trend || 'Stable'}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">River Capacity</span>
            <div className={`text-lg font-black ${
              (environmentalData?.river_capacity_pct || 35) > 85 ? 'text-red-400' : 'text-white'
            }`}>
              {environmentalData?.river_capacity_pct || 35}%
            </div>
            <span className="text-[10px] text-slate-400">Level: {environmentalData?.river_level_m || 2.1}m ({environmentalData?.river_trend || 'Normal'})</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Slope Pore Saturation</span>
            <div className={`text-lg font-black ${
              (environmentalData?.soil_saturation_pct || 45) > 80 ? 'text-orange-400' : 'text-white'
            }`}>
              {environmentalData?.soil_saturation_pct || 45}%
            </div>
            <span className="text-[10px] text-slate-400">Slope: {environmentalData?.slope_deg || 32}° ({environmentalData?.slope_stability || 'Stable'})</span>
          </div>
        </div>
      </section>
    </div>
  );
}
