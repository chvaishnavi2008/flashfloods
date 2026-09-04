import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  ShieldAlert, 
  Activity, 
  CloudRain, 
  Waves, 
  Mountain, 
  BellRing, 
  Users, 
  Navigation, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Info,
  Layers,
  Award
} from 'lucide-react';

export default function SihDisasterDemoTheater() {
  const { 
    demoPhase, 
    isScenarioRunning, 
    applyDemoPhase, 
    runDisasterScenario, 
    pauseDisasterScenario, 
    resetDisasterScenario,
    locationRisk,
    selectedLocation,
    isSimulating
  } = useApp();

  const phases = [
    {
      id: 1,
      code: "PHASE_1_NORMAL",
      title: "1. Normal Baseline",
      storyStep: "DATA",
      expectedLevel: "LOW",
      rainfall: "1.0 mm/hr",
      river: "16% Cap",
      slope: "Stable",
      description: "Nominal sensor baseline. Normal atmospheric & river telemetry."
    },
    {
      id: 2,
      code: "PHASE_2_HEAVY_RAINFALL",
      title: "2. Heavy Rainfall",
      storyStep: "EARLY SIGNAL",
      expectedLevel: "MODERATE",
      rainfall: "24.0 mm/hr",
      river: "42% Cap",
      slope: "Moderate Moisture",
      description: "Early hydro-meteorological signal. Infiltration begins saturating soil."
    },
    {
      id: 3,
      code: "PHASE_3_EXTREME_RAINFALL",
      title: "3. Extreme Rainfall",
      storyStep: "RISK PREDICTION",
      expectedLevel: "HIGH",
      rainfall: "68.0 mm/hr",
      river: "68% Cap",
      slope: "High Slope Stress",
      description: "Multi-hazard models signal high flash flood & landslide susceptibility."
    },
    {
      id: 4,
      code: "PHASE_4_RAPID_RIVER_RISE",
      title: "4. Rapid River Rise",
      storyStep: "HAZARD ESCALATION",
      expectedLevel: "CRITICAL",
      rainfall: "110.0 mm/hr",
      river: "92% (Surging)",
      slope: "Critical Slip",
      description: "River surges past 92% capacity. Critical danger mark breached."
    },
    {
      id: 5,
      code: "PHASE_5_EARLY_WARNING",
      title: "5. Early Warning",
      storyStep: "EARLY WARNING",
      expectedLevel: "CRITICAL",
      rainfall: "135.0 mm/hr",
      river: "96% (Overflowing)",
      slope: "Imminent Slip",
      description: "Automated CAP-compliant Red Alert dispatched to In-App HUD and SMS."
    },
    {
      id: 6,
      code: "PHASE_6_IMPACT_ASSESSMENT",
      title: "6. Impact Assessment",
      storyStep: "IMPACT ASSESSMENT",
      expectedLevel: "CRITICAL",
      rainfall: "135.0 mm/hr",
      river: "96% (Overflowing)",
      slope: "Imminent Slip",
      description: "Quantified exposure: ~12,400 citizens, 4 schools, 1 hospital, 7 road links."
    },
    {
      id: 7,
      code: "PHASE_7_ACTION_EVACUATION",
      title: "7. Action Directives",
      storyStep: "ACTION",
      expectedLevel: "CRITICAL",
      rainfall: "135.0 mm/hr",
      river: "96% (Overflowing)",
      slope: "Imminent Slip",
      description: "What should people do now? Evacuation to Chamoli High-Ground Safe Shelter."
    }
  ];

  const currentPhaseData = phases.find(p => p.id === demoPhase) || phases[0];
  const isCritical = locationRisk?.overall_level === 'CRITICAL';
  const isHigh = locationRisk?.overall_level === 'HIGH';

  return (
    <div className="bg-gradient-to-r from-[#18121f] via-[#1a1c29] to-[#121b22] border-2 border-indigo-500/60 rounded-2xl p-5 lg:p-6 shadow-2xl relative overflow-hidden space-y-5">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-500/30 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-widest">
                SIH DEMO MODE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                SIMULATION / DEMO DATA
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                60–90 SECONDS STORYLINE
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-1">
              Disaster Simulation Demo: Extreme Rainfall → Flash Flood + Landslide
            </h2>

            <p className="text-xs text-slate-300 mt-0.5 font-mono">
              Target Sector: <strong className="text-white">Chamoli (Alaknanda Basin), Uttarakhand</strong> • Real-time telemetry recalculation across all 7 disaster pipeline phases.
            </p>
          </div>
        </div>

        {/* Master Control Buttons Group ("Run Disaster Scenario") */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isScenarioRunning ? (
            <button
              onClick={runDisasterScenario}
              disabled={isSimulating}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all animate-pulse"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Disaster Scenario (Auto)</span>
            </button>
          ) : (
            <button
              onClick={pauseDisasterScenario}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Scenario</span>
            </button>
          )}

          <button
            onClick={resetDisasterScenario}
            disabled={isSimulating}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (Phase 1)</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive 7-Phase Timeline Scrubber Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Storyline Progression: DATA → EARLY SIGNAL → RISK PREDICTION → IMPACT → WARNING → ACTION</span>
          </span>
          <span className="text-indigo-300 font-semibold">
            Active: <strong>Phase {demoPhase}/7</strong> ({currentPhaseData.storyStep})
          </span>
        </div>

        {/* Phase Step Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {phases.map((p) => {
            const isActive = demoPhase === p.id;
            const isCompleted = demoPhase > p.id;

            return (
              <button
                key={p.id}
                onClick={() => applyDemoPhase(p.id)}
                disabled={isSimulating}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive 
                    ? 'bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500/50 shadow-lg' 
                    : isCompleted
                      ? 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                }`}
              >
                {/* Active pulse dot */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}

                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className={`font-bold px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-indigo-500 text-white' : (isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400')
                    }`}>
                      {p.storyStep}
                    </span>
                    <span className="font-semibold text-slate-400">P{p.id}</span>
                  </div>

                  <strong className="text-xs block font-bold truncate">
                    {p.title.split('—')[1] || p.title}
                  </strong>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>{p.rainfall}</span>
                  <span className={p.expectedLevel === 'CRITICAL' ? 'text-red-400' : (p.expectedLevel === 'HIGH' ? 'text-orange-400' : 'text-emerald-400')}>
                    {p.expectedLevel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Phase Narrative Card */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg border shrink-0 ${
            demoPhase >= 4 ? 'bg-red-950/80 border-red-500/50 text-red-400' : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-400'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-white text-sm">{currentPhaseData.title}</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                PIPELINE STAGE: {currentPhaseData.storyStep}
              </span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {currentPhaseData.description}
            </p>
          </div>
        </div>

        {/* Real Calculation Guarantee Indicator */}
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 shrink-0 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Real Calculation Guarantee</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Telemetry recalculated live by AapdaSetu engine.
          </p>
        </div>
      </div>
    </div>
  );
}
