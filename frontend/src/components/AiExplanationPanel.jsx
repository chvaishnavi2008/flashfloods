import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, BrainCircuit, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function AiExplanationPanel() {
  const { locationRisk, selectedLocation, environmentalData } = useApp();

  if (!locationRisk) return null;

  const factors = locationRisk.contributing_factors || [];

  return (
    <div className="bg-[#1E293B] rounded-xl border border-blue-500/30 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 px-5 py-3.5 border-b border-blue-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>WHY IS MY AREA AT RISK?</span>
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                AI RISK INTELLIGENCE
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Grounded Telemetry Core</span>
        </div>
      </div>

      {/* AI Grounded Summary */}
      <div className="p-5 space-y-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed">
          <p className="font-sans">
            {locationRisk.ai_explanation ||
              `In ${selectedLocation?.name}, the current risk index (${locationRisk.overall_score}/100 - ${locationRisk.overall_level}) is driven by localized precipitation rates and saturated soil moisture levels across surrounding mountain slopes.`}
          </p>
        </div>

        {/* Contributing Environmental Factors */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Key Environmental Risk Drivers:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-mono font-bold uppercase text-amber-400 block mb-0.5">
              RECOMMENDED LIFE-SAFETY ACTION:
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {locationRisk.recommended_action || "Maintain regular monitoring. Check safe shelter routes."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
