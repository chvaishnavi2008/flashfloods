import React, { useState } from 'react';
import { formatSosTime, formatSosDateTime } from '../../services/sosService';
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
        return 'bg-[#C62828] text-white font-black';
      case 'ACKNOWLEDGED':
        return 'bg-[#D99A00] text-white font-bold';
      case 'TEAM DISPATCHED':
        return 'bg-[#1769AA] text-white font-bold';
      case 'RESCUE IN PROGRESS':
        return 'bg-[#123047] text-white font-bold';
      case 'RESOLVED':
        return 'bg-[#16855B] text-white font-bold';
      default:
        return 'bg-[#5B6B78] text-white';
    }
  };

  const getRiskBadge = (level) => {
    if (level === 'CRITICAL') return 'text-[#C62828] font-bold';
    if (level === 'HIGH') return 'text-[#E87516] font-bold';
    return 'text-[#D99A00] font-bold';
  };

  return (
    <>
      <section className="bg-white dark:bg-[#111C35] border-2 border-[#C62828] rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3 font-mono text-[#172B3A] dark:text-[#E2E8F0]">
        {/* Panel Header */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#C62828] text-white rounded-xl shadow-sm">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-[#172B3A] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🆘 SOS REQUESTS</span>
                  <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${
                    activeCount > 0 ? 'bg-[#C62828] text-white' : 'bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8]'
                  }`}>
                    {activeCount}
                  </span>
                </h3>
                {newCount > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
                    {newCount} NEW
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">Live citizen distress transmissions</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onCreateDemoSos}
              className="px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
              title="Generate a safe [DEMO] SOS signal for evaluation"
            >
              <FlaskConical className="w-3 h-3 text-[#1769AA] dark:text-[#38BDF8]" />
              <span>🧪 Create Demo SOS</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-[#5B6B78] dark:text-[#94A3B8] hover:text-[#172B3A] dark:hover:text-white bg-[#F8FAFC] dark:bg-[#0B1528] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* SOS Requests List */}
        {isExpanded && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {sosRequests.length === 0 ? (
              <div className="p-4 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl text-center text-xs text-[#5B6B78] dark:text-[#94A3B8]">
                <span>No active SOS distress signals. System monitoring...</span>
              </div>
            ) : (
              sosRequests.map((sos) => (
                <div 
                  key={sos.sos_id || sos.id}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    sos.status === 'NEW'
                      ? 'bg-[#FFF1F1] dark:bg-[#3B1219]/70 border-[#C62828]/50'
                      : sos.status === 'RESOLVED'
                      ? 'bg-[#F8FAFC] dark:bg-[#0B1528] border-[#D7E0E7] dark:border-[#1E2E4A] opacity-60'
                      : 'bg-[#F8FAFC] dark:bg-[#0B1528] border-[#D7E0E7] dark:border-[#1E2E4A]'
                  }`}
                >
                  {/* Left info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadge(sos.status)}`}>
                        {sos.status === 'NEW' ? '🔴 NEW' : sos.status}
                      </span>
                      {sos.is_demo && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/40 font-bold">
                          DEMO
                        </span>
                      )}
                      <strong className="text-[#172B3A] dark:text-[#F8FAFC] text-xs truncate">{sos.sos_id}</strong>
                      <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#5B6B78] dark:text-[#94A3B8]" />
                        <span>{formatSosTime(sos.timestamp)} ({sos.time_ago || 'Just now'})</span>
                      </span>
                    </div>

                    <div className="text-xs text-[#172B3A] dark:text-[#F8FAFC] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C62828] dark:text-[#F87171] shrink-0" />
                      <span className="font-bold truncate">{sos.location_name}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">
                      <span>Risk: <strong className={getRiskBadge(sos.risk_level)}>{sos.risk_level}</strong></span>
                      <span>Hazard: <strong className="text-[#E87516] dark:text-[#FB923C]">{sos.hazard}</strong></span>
                      {sos.assigned_team_name && (
                        <span className="text-[#1769AA] dark:text-[#38BDF8] font-bold truncate">Assigned: {sos.assigned_team_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {sos.status === 'NEW' && (
                      <button
                        onClick={() => onAcknowledge(sos.sos_id)}
                        className="px-2.5 py-1 bg-[#D99A00] hover:bg-[#b88200] text-white font-bold rounded text-[11px] flex items-center gap-1 transition-all"
                        title="Acknowledge receipt of SOS"
                      >
                        <Check className="w-3 h-3" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedSos(sos)}
                      className="px-2.5 py-1 bg-white dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] dark:border-[#38BDF8] font-bold rounded text-[11px] flex items-center gap-1 transition-all"
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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
          <div className="bg-white dark:bg-[#111C35] border-2 border-[#C62828] rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40 rounded-xl">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#172B3A] dark:text-[#F8FAFC]">
                      🆘 SOS #{selectedSos.sos_id}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadge(selectedSos.status)}`}>
                      {selectedSos.status}
                    </span>
                    {selectedSos.is_demo && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/40 font-bold">
                        DEMO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">Emergency Distress Incident Briefing</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSos(null)}
                className="p-1.5 text-[#5B6B78] dark:text-[#94A3B8] hover:text-[#172B3A] dark:hover:text-white bg-[#F8FAFC] dark:bg-[#0B1528] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Incident Details Grid */}
            <div className="space-y-3">
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8]">Location:</span>
                  <strong className="text-[#172B3A] dark:text-[#F8FAFC] text-right">{selectedSos.location_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8]">GPS Coordinates:</span>
                  <span className="text-[#1769AA] dark:text-[#38BDF8] font-bold font-mono">
                    {Number(selectedSos.location_latitude || selectedSos.lat).toFixed(4)}°N, {Number(selectedSos.location_longitude || selectedSos.lng).toFixed(4)}°E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C62828] dark:text-[#F87171]" />
                    <span>Time Received:</span>
                  </span>
                  <strong className="text-[#172B3A] dark:text-[#F8FAFC] font-mono">{formatSosDateTime(selectedSos.timestamp)} ({selectedSos.time_ago || 'Just now'})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8]">Threat Risk Level:</span>
                  <strong className={getRiskBadge(selectedSos.risk_level)}>{selectedSos.risk_level}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8]">Primary Hazard:</span>
                  <strong className="text-[#E87516] dark:text-[#FB923C]">{selectedSos.hazard}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8]">People Trapped / Affected:</span>
                  <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{selectedSos.people_count || 1} Person(s)</strong>
                </div>
                {selectedSos.phone && (
                  <div className="flex justify-between">
                    <span className="text-[#5B6B78] dark:text-[#94A3B8]">Contact Number:</span>
                    <strong className="text-[#16855B] dark:text-[#34D399]">{selectedSos.phone}</strong>
                  </div>
                )}
              </div>

              {/* Citizen Message */}
              <div className="p-3 bg-[#FFF1F1] dark:bg-[#3B1219]/60 border border-[#C62828]/30 rounded-xl space-y-1">
                <span className="text-[10px] text-[#C62828] dark:text-[#F87171] font-bold uppercase tracking-wider block">
                  Citizen Distress Message:
                </span>
                <p className="text-xs text-[#172B3A] dark:text-[#E2E8F0] leading-relaxed italic">
                  "{selectedSos.message || 'No additional message provided. Urgent evacuation required.'}"
                </p>
              </div>

              {/* Assigned Team Status */}
              {selectedSos.assigned_team_name && (
                <div className="p-3 bg-[#E8F2F8] dark:bg-[#0C2D48] border border-[#1769AA]/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">Assigned Rescue Force:</span>
                    <strong className="text-[#1769AA] dark:text-[#38BDF8] text-sm">🚑 {selectedSos.assigned_team_name}</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#1769AA] text-white font-bold">
                    DISPATCHED
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedSos.status === 'NEW' && (
                  <button
                    onClick={() => {
                      onAcknowledge(selectedSos.sos_id);
                      setSelectedSos(prev => ({ ...prev, status: 'ACKNOWLEDGED' }));
                    }}
                    className="w-full py-2 bg-[#D99A00] hover:bg-[#b88200] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
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
                  className="w-full py-2 bg-[#C62828] hover:bg-[#a82222] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  <span>DISPATCH RESCUE TEAM</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSosLocation(selectedSos);
                    setSelectedSos(null);
                  }}
                  className="w-full py-2 bg-white dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] dark:border-[#38BDF8] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
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
                    className="w-full py-2 bg-[#16855B] hover:bg-[#126d4a] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
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
