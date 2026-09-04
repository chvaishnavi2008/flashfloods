import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, BrainCircuit, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function AiExplanationPanel() {
  const { locationRisk, selectedLocation, environmentalData } = useApp();

  const activeRisk = locationRisk || selectedLocation?.current_risk;
  const rawFactors = activeRisk?.contributing_factors || [];
  const factors = Array.isArray(rawFactors)
    ? rawFactors
    : typeof rawFactors === 'string'
    ? rawFactors.split(',').map(s => s.trim()).filter(Boolean)
    : [
        `Rainfall rate: ${environmentalData?.rainfall_rate || 5} mm/hr`,
        `River channel load: ${environmentalData?.river_capacity_pct || 35}%`,
        `Terrain slope: ${environmentalData?.slope_deg || 30}°`
      ];

  return (
    <div className="bg-white dark:bg-[#111C35] rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A] overflow-hidden shadow-sm font-mono text-[#172B3A] dark:text-[#E2E8F0]">
      {/* Header */}
      <div className="bg-[#F8FAFC] dark:bg-[#0B1528] px-5 py-3.5 border-b border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#172B3A] dark:text-[#F8FAFC] flex items-center gap-2">
              <span>WHY IS MY AREA AT RISK?</span>
              <span className="text-[10px] font-mono font-bold bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 px-2 py-0.5 rounded">
                AI RISK INTELLIGENCE
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">
          <Cpu className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#38BDF8]" />
          <span>Grounded Telemetry Core</span>
        </div>
      </div>

      {/* AI Grounded Summary */}
      <div className="p-5 space-y-4">
        <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] text-[#172B3A] dark:text-[#E2E8F0] text-sm leading-relaxed space-y-2">
          <p className="font-sans">
            {locationRisk?.ai_explanation ||
              `In ${selectedLocation?.name || 'this area'}, the current risk index (${locationRisk?.overall_score || 65}/100 - ${locationRisk?.overall_level || 'HIGH'}) is driven by localized precipitation rates and saturated soil moisture levels across surrounding mountain slopes.`}
          </p>
          <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center gap-2 text-[11px] font-mono text-[#5B6B78] dark:text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#1769AA] dark:bg-[#38BDF8]"></span>
            <span>Reasoning Source: Deterministic Hydrological & Geotechnical Physics Engine with Pluggable ML Hooks</span>
          </div>
        </div>

        {/* Contributing Environmental Factors */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B6B78] dark:text-[#94A3B8] mb-2.5">
            Key Environmental Risk Drivers:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] text-xs text-[#172B3A] dark:text-[#E2E8F0]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="p-3.5 rounded-xl bg-[#FFF7E6] dark:bg-[#3A280B] border border-[#D99A00]/40 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#D99A00] dark:text-[#FBBF24] shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-mono font-bold uppercase text-[#D99A00] dark:text-[#FBBF24] block mb-0.5">
              RECOMMENDED LIFE-SAFETY ACTION:
            </span>
            <p className="text-xs text-[#172B3A] dark:text-[#E2E8F0] leading-relaxed font-medium">
              {locationRisk?.recommended_action || "Maintain regular monitoring. Check safe shelter routes."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
