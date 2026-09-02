import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import CitizenSosModal from '../components/CitizenSosModal';
import LiveWeatherRiskCard from '../components/LiveWeatherRiskCard';
import { 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Users, 
  Navigation, 
  HeartPulse, 
  Building2, 
  Milestone, 
  BellRing, 
  ArrowRight, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Clock, 
  ShieldCheck, 
  Layers,
  PhoneCall,
  Flame,
  Radio
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    selectedLocation, 
    locationRisk, 
    environmentalData, 
    systemRisk, 
    alerts, 
    safeLocations, 
    setActivePage, 
    isSirenMuted, 
    toggleSiren, 
    isSirenActive,
    pipelineData 
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  const isCritical = locationRisk?.overall_level === 'CRITICAL';
  const isHigh = locationRisk?.overall_level === 'HIGH';
  const isEmergency = isCritical || isHigh;

  const impact = pipelineData?.impact || locationRisk?.impact_assessment || {
    population_at_risk: 12400,
    infrastructure_count: 14,
    road_segments: 7,
    bridges: 2
  };

  const recentAlerts = (alerts || []).slice(0, 3);

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* ========================================================================= */}
      {/* A. LIVE OPEN-METEO WEATHER & PRALAYWATCH RISK TELEMETRY ENGINE            */}
      {/* ========================================================================= */}
      <LiveWeatherRiskCard />

      {/* ========================================================================= */}
      {/* B. ACTIVE EMERGENCY BANNER (Only displayed on HIGH / CRITICAL)             */}
      {/* ========================================================================= */}
      {isEmergency && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl transition-all ${
          isCritical 
            ? 'bg-red-950/80 border-red-500/80 text-red-100 ring-2 ring-red-500/40 animate-pulse' 
            : 'bg-orange-950/80 border-orange-500/80 text-orange-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-600/30 text-red-300 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-red-600 text-white">
                  {isCritical ? 'CRITICAL EARLY WARNING' : 'HIGH HAZARD ALERT'}
                </span>
                <span className="text-xs font-semibold opacity-80">
                  {selectedLocation?.name || 'Sector'}, {selectedLocation?.state}
                </span>
              </div>
              <p className="text-sm font-bold mt-0.5">
                {isCritical 
                  ? 'Severe Flash Flood & Landslide Surge Imminent. Move to higher ground immediately.' 
                  : 'Elevated precipitation & rising water levels detected. Prepare for possible evacuation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSiren}
              className="px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-red-500/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all text-red-300"
            >
              {isSirenMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSirenMuted ? 'Unmute Siren' : 'Mute Siren'}</span>
            </button>

            <button
              onClick={() => setActivePage('emergency-response')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Find Safe Location</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* C. RISK OVERVIEW HERO (Main Visual Focus)                                  */}
      {/* ========================================================================= */}
      <section className={`border rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all ${
        isCritical 
          ? 'bg-gradient-to-r from-[#211116] via-[#1E293B] to-[#121927] border-red-500/50' 
          : isHigh 
            ? 'bg-gradient-to-r from-[#221711] via-[#1E293B] to-[#121927] border-orange-500/50' 
            : 'bg-gradient-to-r from-[#111f18] via-[#1E293B] to-[#121927] border-emerald-500/50'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                isCritical ? 'bg-red-600 text-white' : (isHigh ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white')
              }`}>
                {locationRisk?.overall_level || 'LOW'} RISK • {locationRisk?.overall_score || 25} / 100
              </span>

              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedLocation?.name || 'Chamoli'}, {selectedLocation?.state || 'Uttarakhand'}</span>
              </span>

              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Primary Hazard: <strong className="text-white">{locationRisk?.primary_hazard || 'Flash Flood'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isCritical
                ? 'Extreme rainfall and rapidly rising river levels detected.'
                : isHigh
                  ? 'Heavy hydro-meteorological runoff and elevated slope saturation active.'
                  : 'All hydrological and slope telemetry operating within safe baseline limits.'}
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time multi-hazard assessment powered by the PralayWatch early warning intelligence engine. Continuous monitoring across weather stations and river hydrometry.
            </p>
          </div>

          {/* Action Quick-Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setActivePage('emergency-response')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Find Safe Shelter</span>
            </button>

            <button
              onClick={() => setIsSosOpen(true)}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20 transition-all"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Request SOS Rescue</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* D. LIVE RISK MAP (One of the Largest Elements on the Page)                 */}
      {/* ========================================================================= */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Tactical Threat GIS Map — {selectedLocation?.name || 'Sector'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Live Status:</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Active Telemetry
            </span>
          </div>
        </div>

        {/* Full-width Map View */}
        <RiskMap height="460px" showRoute={isEmergency} />
      </section>

      {/* ========================================================================= */}
      {/* E. IMPACT SUMMARY (Compact 4-Metric Bar)                                  */}
      {/* ========================================================================= */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Estimated Sector Impact Summary</span>
          </div>

          <button
            onClick={() => setActivePage('impact-assessment')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-all"
          >
            <span>Full Impact Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Metric 1 */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Population at Risk</span>
            <div className="text-xl font-black text-white mt-1">
              {(impact.population_at_risk || 12400).toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400/80 mt-1">Estimated Impact</span>
          </div>

          {/* Metric 2 */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Civic Infrastructure</span>
            <div className="text-xl font-black text-white mt-1">
              {impact.infrastructure_count || 14}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Substations & Utilities</span>
          </div>

          {/* Metric 3 */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Road Segments</span>
            <div className="text-xl font-black text-white mt-1">
              {impact.road_segments || 7}
            </div>
            <span className="text-[10px] text-red-400 mt-1">Compromised Corridors</span>
          </div>

          {/* Metric 4 */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Bridges at Risk</span>
            <div className="text-xl font-black text-white mt-1">
              {impact.bridges || 2}
            </div>
            <span className="text-[10px] text-orange-400 mt-1">River Crossing Points</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* F & G. TWO-COLUMN SPLIT: IMMEDIATE ACTIONS & RECENT ALERTS (3 max)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* F. IMMEDIATE ACTION ("WHAT SHOULD I DO?") */}
        <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>WHAT SHOULD I DO RIGHT NOW?</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                Action Directives
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Move to higher ground</strong> immediately; avoid staying in valley floors.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Avoid river crossings</strong> and bridges with rising floodwaters.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Avoid steep hillside cuts</strong> where mudslides and falling rocks may occur.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Follow official evacuation orders</strong> and head toward nearest registered shelter.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActivePage('emergency-response')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Safe Locations & Routes</span>
            </button>

            <button
              onClick={() => setIsSosOpen(true)}
              className="px-4 py-2 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/50 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Request SOS</span>
            </button>
          </div>
        </section>

        {/* G. RECENT ALERTS (Latest 3 only) */}
        <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                <BellRing className="w-4 h-4 text-red-400" />
                <span>Recent Early Warnings (Latest 3)</span>
              </div>

              <button
                onClick={() => setActivePage('alerts')}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-all"
              >
                <span>View All Alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((al, idx) => (
                  <div 
                    key={al.id || idx}
                    className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          al.severity === 'CRITICAL' || al.severity?.includes('EMERGENCY') 
                            ? 'bg-red-600 text-white' 
                            : 'bg-orange-500 text-white'
                        }`}>
                          {al.severity}
                        </span>
                        <strong className="text-white text-xs">{al.hazard_type || al.hazard || 'Multi-Hazard'}</strong>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{al.title || al.message}</p>
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {al.created_at ? new Date(al.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  No active emergency alerts in this sector.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SEOC Broadcast Frequency: <strong>VHF Ch 16</strong></span>
            <span className="text-emerald-400 font-bold">CAP-RSS Synchronized</span>
          </div>
        </section>
      </div>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
