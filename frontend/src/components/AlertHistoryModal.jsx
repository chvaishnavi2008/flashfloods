import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  X, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Radio, 
  RotateCcw,
  Check
} from 'lucide-react';

export default function AlertHistoryModal({ isOpen, onClose }) {
  const { alerts, resolveAlert, reactivateAlert, userRole, setActiveAlert, setShowEmergencyModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, RESOLVED
  const [severityFilter, setSeverityFilter] = useState('ALL'); // ALL, CRITICAL, HIGH, MODERATE

  if (!isOpen) return null;

  const filteredAlerts = (alerts || []).filter(alert => {
    const matchesSearch = 
      (alert.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.location_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.hazard_type || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isAct = alert.status === 'Active' || alert.status === 'ACTIVE' || alert.status === 'Monitoring';
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? isAct :
      !isAct;

    const matchesSeverity = 
      severityFilter === 'ALL' ? true :
      (alert.severity || '').toUpperCase().includes(severityFilter);

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-4xl w-full bg-[#18181c] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/40 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">
                Official Early Warning Broadcast History & Log
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Multi-Hazard CAP-Compliant Emergency Broadcast Archive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by location, hazard, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Status:</span>
            {['ALL', 'ACTIVE', 'RESOLVED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  statusFilter === st 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  severityFilter === sev 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alert List Body */}
        <div className="p-6 overflow-y-auto space-y-3 font-mono text-xs flex-1">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No early warning alerts match the selected search and filter criteria.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isAct = alert.status === 'Active' || alert.status === 'ACTIVE' || alert.status === 'Monitoring';
              const isCrit = (alert.severity || '').includes('CRITICAL') || (alert.severity || '').includes('EMERGENCY');
              const isHi = (alert.severity || '').includes('HIGH') || (alert.severity || '').includes('WARNING');

              return (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    isAct 
                      ? (isCrit ? 'bg-red-950/30 border-red-500/60' : 'bg-orange-950/20 border-orange-500/50')
                      : 'bg-slate-900/60 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCrit ? 'bg-red-600 text-white' : (isHi ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white')
                      }`}>
                        {alert.severity || 'WARNING'}
                      </span>
                      <strong className="text-white text-sm">
                        {alert.title || `Warning for ${alert.location_name}`}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAct ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isAct ? 'ACTIVE' : 'RESOLVED'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {alert.created_at || 'Recent'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-500">
                      Issued by: <strong className="text-slate-300">{alert.issued_by || 'SDMA'}</strong> • Radius: {alert.radius_km || 15} km
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveAlert(alert);
                          setShowEmergencyModal(true);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/40 text-[10px] font-bold"
                      >
                        View Full Alert HUD
                      </button>

                      {isAct ? (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-700 text-slate-300 hover:text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateAlert(alert.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-red-700 text-slate-300 hover:text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                          <span>Reactivate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Total Recorded Alerts: <strong>{alerts.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
}
