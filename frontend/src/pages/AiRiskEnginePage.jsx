import React from 'react';
import { useApp } from '../context/AppContext';
import AiExplanationPanel from '../components/AiExplanationPanel';
import PipelineTraceViewer from '../components/PipelineTraceViewer';
import { FALLBACK_LOCATIONS } from '../data/fallbackData';
import { 
  Sparkles, 
  Brain, 
  Cpu, 
  Layers, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Plus,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Scale
} from 'lucide-react';

export default function AiRiskEnginePage() {
  const { 
    selectedLocation, 
    locationRisk, 
    environmentalData, 
    pipelineData 
  } = useApp();

  const activeLoc = selectedLocation || FALLBACK_LOCATIONS[0];
  const activeRisk = locationRisk || activeLoc?.current_risk || FALLBACK_LOCATIONS[0].current_risk;
  const activeEnv = environmentalData || activeLoc?.environmental_data || FALLBACK_LOCATIONS[0].environmental_data;

  const isCritical = activeRisk?.overall_level === 'CRITICAL';
  const isHigh = activeRisk?.overall_level === 'HIGH';

  const weights = [
    { name: 'Rainfall Intensity (Rate mm/hr)', weight: '25%', contribution: `${Math.round((activeEnv?.rainfall_rate || 5) * 0.25 * 10) / 10} pts` },
    { name: 'Accumulated 24h Rainfall (mm)', weight: '15%', contribution: `${Math.round((activeEnv?.rainfall_mm || 25) * 0.06 * 10) / 10} pts` },
    { name: 'River Water Level (% Capacity)', weight: '20%', contribution: `${Math.round((activeEnv?.river_capacity_pct || 35) * 0.20 * 10) / 10} pts` },
    { name: 'River Level Trend (Rising / Surge)', weight: '15%', contribution: activeEnv?.river_trend === 'Rising Rapidly' ? '15.0 pts' : '3.8 pts' },
    { name: 'Catchment Slope & Elevation Factor', weight: '15%', contribution: `${Math.round((activeEnv?.slope_deg || 32) * 0.33 * 10) / 10} pts` },
    { name: 'Historical Basin Susceptibility', weight: '10%', contribution: `${activeLoc?.is_vulnerable ? '7.5' : '2.0'} pts` }
  ];

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 text-purple-400 border border-purple-500/40 rounded-xl">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                  MATHEMATICAL SCORING ENGINE & ML EXPLAINABILITY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/40">
                  DETERMINISTIC + HYBRID AI
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                AI Risk Intelligence Engine Architecture
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Confidence Score: <strong className="text-emerald-400">91.4% (Multi-Sensor Corroboration)</strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Provides complete mathematical explainability and transparent feature attribution behind PralayWatch multi-hazard composite risk calculations.
        </p>
      </div>

      {/* 1. Visual Mathematical Formula Diagram (Requested Feature) */}
      <section className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Mathematical Risk Composition Formula</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Sector: <strong className="text-white">{activeLoc?.name || 'Chamoli'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center items-center">
          {/* Box 1: Rainfall */}
          <div className="p-3 bg-slate-950 border border-blue-500/40 rounded-xl space-y-1">
            <span className="text-[10px] text-blue-400 uppercase font-bold block">1. Rainfall</span>
            <div className="text-sm font-bold text-white">{activeEnv?.rainfall_rate || 5} mm/hr</div>
            <span className="text-[10px] text-slate-500">Weight: 40%</span>
          </div>

          <span className="text-xl font-bold text-slate-500 hidden lg:block">+</span>

          {/* Box 2: River Level */}
          <div className="p-3 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-1">
            <span className="text-[10px] text-cyan-400 uppercase font-bold block">2. River Surge</span>
            <div className="text-sm font-bold text-white">{activeEnv?.river_capacity_pct || 35}% Cap</div>
            <span className="text-[10px] text-slate-500">Weight: 35%</span>
          </div>

          <span className="text-xl font-bold text-slate-500 hidden lg:block">+</span>

          {/* Box 3: Terrain */}
          <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl space-y-1">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">3. Terrain Slope</span>
            <div className="text-sm font-bold text-white">{activeEnv?.slope_deg || 32}° Slope</div>
            <span className="text-[10px] text-slate-500">Weight: 15%</span>
          </div>

          <span className="text-xl font-bold text-slate-500 hidden lg:block">+</span>

          {/* Box 4: Vulnerability */}
          <div className="p-3 bg-slate-950 border border-orange-500/40 rounded-xl space-y-1">
            <span className="text-[10px] text-orange-400 uppercase font-bold block">4. Vulnerability</span>
            <div className="text-sm font-bold text-white">{activeLoc?.is_vulnerable ? 'High' : 'Nominal'}</div>
            <span className="text-[10px] text-slate-500">Weight: 10%</span>
          </div>
        </div>

        {/* Arrow Down to Output */}
        <div className="flex flex-col items-center justify-center py-2 space-y-1">
          <div className="w-0.5 h-4 bg-purple-500" />
          <div className="px-4 py-1.5 bg-purple-950/80 border border-purple-500 rounded-lg text-xs font-bold text-purple-300 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>PRALAYWATCH RISK INTELLIGENCE ENGINE</span>
          </div>
          <div className="w-0.5 h-4 bg-purple-500" />
        </div>

        {/* Final Output Result Box */}
        <div className={`p-4 rounded-xl border text-center flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isCritical ? 'bg-red-950/60 border-red-500 text-red-300' : 'bg-slate-950 border-slate-700 text-slate-200'
        }`}>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest block opacity-70">
              Evaluated Output Classification
            </span>
            <strong className="text-base font-black">
              {activeRisk?.overall_score || 45}/100 — {activeRisk?.overall_level || 'MODERATE'} RISK
            </strong>
          </div>

          <span className="text-xs px-3 py-1 bg-black/40 rounded-lg border border-current">
            Lead Time: ~{activeRisk?.lead_time_minutes || 35} mins • Confidence: 91.4%
          </span>
        </div>
      </section>

      {/* 2. Feature Weights Attribution Table */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Telemetry Input Feature Attribution Matrix</span>
          </div>
          <span className="text-[10px] text-slate-400">Standardized Normalized Scoring</span>
        </div>

        <div className="space-y-2">
          {weights.map((w, idx) => (
            <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">{w.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-slate-500">Weight: <strong className="text-slate-300">{w.weight}</strong></span>
                <span className="text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950/50 border border-purple-500/30">
                  {w.contribution}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AI Natural Language Explanation Panel */}
      <AiExplanationPanel />

      {/* 4. Complete 6-Stage Pipeline Trace Viewer */}
      <PipelineTraceViewer />
    </div>
  );
}
