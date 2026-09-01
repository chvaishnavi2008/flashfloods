import React from 'react';
import RiskGauge from './RiskGauge';
import { Droplets, Waves, Mountain, CloudRain, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function HazardCard({
  type, // 'flash_flood' | 'flood' | 'landslide' | 'heavy_rainfall'
  title,
  level = 'LOW',
  score = 20,
  metrics = [],
  trend = 'Stable'
}) {
  const getHazardMeta = () => {
    switch (type) {
      case 'flash_flood':
        return {
          icon: Droplets,
          color: 'text-blue-400',
          borderColor: level === 'CRITICAL' ? 'border-red-500' : 'border-slate-700',
          bgHeader: 'bg-blue-950/40'
        };
      case 'flood':
        return {
          icon: Waves,
          color: 'text-cyan-400',
          borderColor: level === 'CRITICAL' ? 'border-red-500' : 'border-slate-700',
          bgHeader: 'bg-cyan-950/40'
        };
      case 'landslide':
        return {
          icon: Mountain,
          color: 'text-amber-400',
          borderColor: level === 'CRITICAL' ? 'border-red-500' : 'border-slate-700',
          bgHeader: 'bg-amber-950/40'
        };
      case 'heavy_rainfall':
      default:
        return {
          icon: CloudRain,
          color: 'text-indigo-400',
          borderColor: level === 'CRITICAL' ? 'border-red-500' : 'border-slate-700',
          bgHeader: 'bg-indigo-950/40'
        };
    }
  };

  const meta = getHazardMeta();
  const Icon = meta.icon;

  const getLevelBadgeClass = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-bold';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className={`bg-[#1E293B] rounded-xl border ${meta.borderColor} flex flex-col justify-between overflow-hidden shadow-md transition-all hover:border-slate-500`}>
      {/* Header */}
      <div className={`p-4 border-b border-[#334155] flex items-center justify-between ${meta.bgHeader}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700">
            <Icon className={`w-5 h-5 ${meta.color}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">{title}</h3>
            <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-mono border ${getLevelBadgeClass(level)}`}>
              {level} RISK
            </span>
          </div>
        </div>

        <RiskGauge score={score} level={level} size="sm" />
      </div>

      {/* Metrics Body */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-center">
        {metrics.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80 last:border-0">
            <span className="text-slate-400">{m.label}</span>
            <span className={`font-mono font-semibold ${m.highlight ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Trend Footer */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Forecast Trend:</span>
        <span className="flex items-center gap-1 font-semibold text-slate-300">
          {trend.includes('Rising') && <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />}
          {trend.includes('Receding') && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />}
          {trend.includes('Stable') && <Minus className="w-3.5 h-3.5 text-slate-400" />}
          {trend}
        </span>
      </div>
    </div>
  );
}
