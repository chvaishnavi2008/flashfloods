import React, { useState } from 'react';
import { 
  HeartPulse, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Truck, 
  ShieldAlert, 
  Check, 
  FlaskConical, 
  ChevronDown, 
  ChevronUp,
  X,
  Navigation
} from 'lucide-react';

export default function AuthoritySosPanel({
  sosRequests = [],
  onAcknowledge = () => {},
  onOpenDispatch = () => {},
  onResolve = () => {},
  onCreateDemoSos = () => {},
  onSelectSosLocation = () => {}
}) {
  const [selectedSos, setSelectedSos] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const activeRequests = sosRequests.filter(s => s.status !== 'RESOLVED');
  const activeCount = activeRequests.length;
  const newCount = sosRequests.filter(s => s.status === 'NEW').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-red-600 text-white font-black animate-pulse border border-red-400';
      case 'ACKNOWLEDGED':
        return 'bg-amber-600 text-white font-bold border border-amber-400';
      case 'TEAM DISPATCHED':
        return 'bg-blue-600 text-white font-bold border border-blue-400';
      case 'RESCUE IN PROGRESS':
        return 'bg-purple-600 text-white font-bold border border-purple-400';
      case 'RESOLVED':
        return 'bg-emerald-700 text-emerald-100 font-bold border border-emerald-500';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getRiskBadge = (level) => {
    if (level === 'CRITICAL') return 'text-red-400 font-bold';
    if (level === 'HIGH') return 'text-orange-400 font-bold';
    return 'text-amber-400 font-bold';
  };

  return (
    <>
      <section className="bg-[#0B1120] border-2 border-red-500/80 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3 font-mono">
        {/* Panel Header */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-md shadow-red-600/40 animate-pulse">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>🆘 SOS REQUESTS</span>
                  <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${
                    activeCount > 0 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeCount}
                  </span>
                </h3>
                {newCount > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    {newCount} NEW
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">Live citizen distress transmissions</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onCreateDemoSos}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
              title="Generate a safe [DEMO] SOS signal for evaluation"
            >
              <FlaskConical className="w-3 h-3 text-cyan-400" />
              <span>🧪 Create Demo SOS</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* SOS Requests List (Compact & Prominent) */}
        {isExpanded && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {sosRequests.length === 0 ? (
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                <span>No active SOS distress signals. System monitoring...</span>
              </div>
            ) : (
              sosRequests.map((sos) => (
                <div 
                  key={sos.sos_id || sos.id}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    sos.status === 'NEW'
                      ? 'bg-red-950/40 border-red-500/60 shadow-md shadow-red-950/50'
                      : sos.status === 'RESOLVED'
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  {/* Left info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadge(sos.status)}`}>
                        {sos.status === 'NEW' ? '🔴 NEW' : sos.status}
                      </span>
                      {sos.is_demo && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                          DEMO
                        </span>
                      )}
                      <strong className="text-white text-xs truncate">{sos.sos_id}</strong>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {sos.time_ago || 'Recently'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="font-bold truncate">{sos.location_name}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Risk: <strong className={getRiskBadge(sos.risk_level)}>{sos.risk_level}</strong></span>
                      <span>Hazard: <strong className="text-amber-300">{sos.hazard}</strong></span>
                      {sos.assigned_team_name && (
                        <span className="text-blue-300 font-bold truncate">Assigned: {sos.assigned_team_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {sos.status === 'NEW' && (
                      <button
                        onClick={() => onAcknowledge(sos.sos_id)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[11px] flex items-center gap-1 transition-all"
                        title="Acknowledge receipt of SOS"
                      >
                        <Check className="w-3 h-3" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedSos(sos)}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-bold rounded text-[11px] flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      <span>VIEW</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SOS DETAILS MODAL                                                          */}
      {/* ========================================================================= */}
      {selectedSos && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono text-xs text-slate-200">
          <div className="bg-[#0B1120] border-2 border-red-500 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/40 rounded-xl animate-pulse">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      🆘 SOS #{selectedSos.sos_id}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadge(selectedSos.status)}`}>
                      {selectedSos.status}
                    </span>
                    {selectedSos.is_demo && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                        DEMO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Emergency Distress Incident Briefing</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSos(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Incident Details Grid */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <strong className="text-white text-right">{selectedSos.location_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Coordinates:</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    {Number(selectedSos.location_latitude || selectedSos.lat).toFixed(4)}°N, {Number(selectedSos.location_longitude || selectedSos.lng).toFixed(4)}°E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Received Time:</span>
                  <span className="text-slate-200">{selectedSos.time_ago} ({new Date(selectedSos.timestamp).toLocaleTimeString()})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Threat Risk Level:</span>
                  <strong className={getRiskBadge(selectedSos.risk_level)}>{selectedSos.risk_level}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Hazard:</span>
                  <strong className="text-amber-300">{selectedSos.hazard}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">People Trapped / Affected:</span>
                  <strong className="text-white">{selectedSos.people_count || 1} Person(s)</strong>
                </div>
                {selectedSos.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Number:</span>
                    <strong className="text-emerald-400">{selectedSos.phone}</strong>
                  </div>
                )}
              </div>

              {/* Citizen Message */}
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl space-y-1">
                <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">
                  Citizen Distress Message:
                </span>
                <p className="text-xs text-white leading-relaxed italic">
                  "{selectedSos.message || 'No additional message provided. Urgent evacuation required.'}"
                </p>
              </div>

              {/* Assigned Team Status */}
              {selectedSos.assigned_team_name && (
                <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Assigned Rescue Force:</span>
                    <strong className="text-blue-300 text-sm">🚑 {selectedSos.assigned_team_name}</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-600 text-white font-bold">
                    DISPATCHED
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedSos.status === 'NEW' && (
                  <button
                    onClick={() => {
                      onAcknowledge(selectedSos.sos_id);
                      setSelectedSos(prev => ({ ...prev, status: 'ACKNOWLEDGED' }));
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>ACKNOWLEDGE SOS</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const sosToDispatch = selectedSos;
                    setSelectedSos(null);
                    onOpenDispatch(sosToDispatch);
                  }}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Truck className="w-4 h-4" />
                  <span>DISPATCH RESCUE TEAM</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSosLocation(selectedSos);
                    setSelectedSos(null);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>SHOW ON MAP</span>
                </button>

                {selectedSos.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      onResolve(selectedSos.sos_id);
                      setSelectedSos(null);
                    }}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>RESOLVE SOS</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
