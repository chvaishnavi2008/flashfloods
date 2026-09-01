import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BellRing, ShieldAlert, CheckCircle2, Clock, Filter, AlertTriangle, Check } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, resolveAlert, userRole, setShowEmergencyModal, setActivePage } = useApp();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-black';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-bold';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-red-950 text-red-400 border-red-500/40';
      case 'Monitoring':
        return 'bg-amber-950 text-amber-400 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Emergency Alerts & Warning Broadcasts</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live broadcast log across all monitored multi-hazard Himalayan sectors.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs font-mono">
          {['ALL', 'Active', 'Monitoring', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterStatus === st
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Active Alerts Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Active Incident Broadcasts ({filteredAlerts.length})</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-[#1E293B] rounded-xl border p-5 transition-all shadow-md ${
                alert.status === 'Active' && alert.severity === 'CRITICAL'
                  ? 'border-red-500/80 bg-red-950/20'
                  : 'border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">{alert.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-0.5">
                      <span className="text-blue-400 font-semibold">{alert.location_name}</span>
                      <span>•</span>
                      <span>Hazard: {alert.hazard_type}</span>
                      <span>•</span>
                      <span>Lead Time: ~{alert.lead_time_min} mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono border ${getStatusBadge(alert.status)}`}>
                    {alert.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{alert.created_at}</span>
                  </span>

                  {userRole === 'authority' && alert.status === 'Active' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-mono font-semibold"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                {alert.message}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs font-mono text-slate-400">
                <span>Issued by: {alert.issued_by}</span>
                <button
                  onClick={() => {
                    setActivePage('safe-locations');
                  }}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  <span>View Evacuation Routes & Shelters</span>
                </button>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="p-8 text-center bg-[#1E293B] rounded-xl border border-slate-700 text-slate-400 font-mono">
              No alerts found for selected filter status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
