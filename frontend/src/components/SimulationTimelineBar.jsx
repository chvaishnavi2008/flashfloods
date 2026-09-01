import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  Flame, 
  CloudRain, 
  Mountain, 
  Waves, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';

export default function SimulationTimelineBar() {
  const { 
    simulationState, 
    applyTimelineStep, 
    applySimulationScenario, 
    isSimulating, 
    statusMessage 
  } = useApp();

  const [autoPlay, setAutoPlay] = useState(false);
  const [activeStep, setActiveStep] = useState(simulationState?.timeline_step || 'T0');

  useEffect(() => {
    if (simulationState?.timeline_step) {
      setActiveStep(simulationState.timeline_step);
    }
  }, [simulationState?.timeline_step]);

  // Auto-play progression loop for demo
  useEffect(() => {
    let timer;
    if (autoPlay) {
      timer = setInterval(() => {
        setActiveStep(curr => {
          if (curr === 'T0') {
            applyTimelineStep('T+1');
            return 'T+1';
          } else if (curr === 'T+1') {
            applyTimelineStep('T+2');
            return 'T+2';
          } else {
            applyTimelineStep('T0');
            return 'T0';
          }
        });
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [autoPlay, applyTimelineStep]);

  const timelineSteps = [
    {
      id: 'T0',
      label: 'T0: Early Watch',
      rainfall: '35 mm',
      risk: 'MODERATE (42)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      desc: 'Normal-to-moderate precipitation, river at 42% capacity, stable slopes'
    },
    {
      id: 'T+1',
      label: 'T+1: Severe Escalation',
      rainfall: '88 mm',
      risk: 'HIGH (65)',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      desc: 'Heavy sustained downpour, river surge to 72% capacity, saturated slopes'
    },
    {
      id: 'T+2',
      label: 'T+2: Cloudburst & Surge',
      rainfall: '148 mm',
      risk: 'CRITICAL (88)',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      desc: 'Cloudburst precipitation rate, river at 94% capacity, imminent landslide'
    }
  ];

  const quickScenarios = [
    {
      id: 'flash_flood_himalayas',
      name: 'Himalayan Cloudburst',
      region: 'Uttarakhand / Himachal',
      icon: CloudRain,
      color: 'text-blue-400 border-blue-500/30 hover:bg-blue-950/40'
    },
    {
      id: 'landslide_western_ghats',
      name: 'Western Ghats Landslide',
      region: 'Wayanad / Joshimath',
      icon: Mountain,
      color: 'text-amber-400 border-amber-500/30 hover:bg-amber-950/40'
    },
    {
      id: 'extreme_rainfall_meghalaya',
      name: 'Meghalaya Deluge',
      region: 'Cherrapunji / Mawsynram',
      icon: Zap,
      color: 'text-purple-400 border-purple-500/30 hover:bg-purple-950/40'
    },
    {
      id: 'riverine_brahmaputra_kosi',
      name: 'Brahmaputra / Kosi Inundation',
      region: 'Assam / Bihar Floodplain',
      icon: Waves,
      color: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-950/40'
    },
    {
      id: 'glof_teesta_surge',
      name: 'Sikkim Teesta GLOF',
      region: 'Chungthang Cryosphere',
      icon: AlertTriangle,
      color: 'text-rose-400 border-rose-500/30 hover:bg-rose-950/40'
    }
  ];

  return (
    <div className="bg-[#18181c] border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Top Banner: Clear SIH Demo Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wide">
                Simulated Live Disaster Data Layer
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold tracking-wider animate-pulse">
                SIMULATION / DEMO DATA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive temporal progression (T0 → T+1 → T+2) and reproducible regional multi-hazard scenarios for SIH jury demonstration.
            </p>
          </div>
        </div>

        {/* Auto Play / Step Controller */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            disabled={isSimulating}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
              autoPlay
                ? 'bg-amber-600 border-amber-400 text-white shadow-md animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Play className={`w-3 h-3 ${autoPlay ? 'fill-current' : ''}`} />
            <span>{autoPlay ? 'Auto-Advancing (7s)' : 'Auto-Play Sequence'}</span>
          </button>

          <button
            onClick={() => {
              setAutoPlay(false);
              applySimulationScenario('reset_nominal');
            }}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:text-white transition-all"
            title="Reset telemetry across all monitoring zones to safe nominal baseline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* 1. Time-Series Progression Steps (T0 -> T+1 -> T+2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {timelineSteps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => {
                setAutoPlay(false);
                applyTimelineStep(step.id);
              }}
              disabled={isSimulating}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {/* Active Indicator Strip */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 animate-pulse" />
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {step.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${step.badgeColor}`}>
                  {step.risk}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                {step.desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                <span>Rainfall: <strong className="text-slate-200">{step.rainfall}</strong></span>
                <span className="flex items-center gap-1 text-amber-400 hover:underline">
                  {isActive ? '● Active State' : 'Apply Step'}
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Reproducible SIH Regional Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Reproducible SIH Multi-Hazard Regional Scenarios:
          </span>
          {statusMessage && (
            <span className="text-[11px] font-mono text-amber-400 animate-pulse">
              {statusMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {quickScenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setAutoPlay(false);
                  applySimulationScenario(sc.id);
                }}
                disabled={isSimulating}
                className={`p-2.5 rounded-lg border bg-slate-950/70 flex flex-col gap-1 text-left transition-all ${sc.color}`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 truncate">
                    {sc.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  {sc.region}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
