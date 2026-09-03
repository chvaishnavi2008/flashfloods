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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-4xl w-full bg-white border border-[#D7E0E7] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh] text-[#172B3A]">
        {/* Header */}
        <div className="bg-[#123047] px-6 py-4 border-b border-[#294657] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1769AA] text-white rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">
                Official Early Warning Broadcast History & Log
              </h3>
              <p className="text-xs text-[#D7E0E7] font-mono mt-0.5">
                Multi-Hazard CAP-Compliant Emergency Broadcast Archive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#D7E0E7] hover:text-white rounded-lg bg-[#0B2233]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#D7E0E7] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#5B6B78] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by location, hazard, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#D7E0E7] rounded-lg pl-9 pr-3 py-2 text-[#172B3A] placeholder-[#5B6B78] focus:outline-none focus:border-[#1769AA]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#5B6B78] text-[11px]">Status:</span>
            {['ALL', 'ACTIVE', 'RESOLVED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  statusFilter === st 
                    ? 'bg-[#1769AA] text-white' 
                    : 'bg-white text-[#5B6B78] border border-[#D7E0E7] hover:text-[#172B3A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#5B6B78] text-[11px]">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  severityFilter === sev 
                    ? 'bg-[#C62828] text-white' 
                    : 'bg-white text-[#5B6B78] border border-[#D7E0E7] hover:text-[#172B3A]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alert List Body */}
        <div className="p-6 overflow-y-auto space-y-3 font-mono text-xs flex-1 text-[#172B3A]">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-[#5B6B78]">
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
                      ? (isCrit ? 'bg-[#FFF1F1] border-[#C62828]/40' : 'bg-[#FFF7E6] border-[#D99A00]/40')
                      : 'bg-[#F8FAFC] border-[#D7E0E7]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D7E0E7]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCrit ? 'bg-[#C62828] text-white' : (isHi ? 'bg-[#E87516] text-white' : 'bg-[#1769AA] text-white')
                      }`}>
                        {alert.severity || 'WARNING'}
                      </span>
                      <strong className="text-[#172B3A] text-sm">
                        {alert.title || `Warning for ${alert.location_name}`}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAct ? 'bg-[#FFF1F1] text-[#C62828] border border-[#C62828]/30' : 'bg-[#EAF7F1] text-[#16855B] border border-[#16855B]/30'
                      }`}>
                        {isAct ? 'ACTIVE' : 'RESOLVED'}
                      </span>
                      <span className="text-[10px] text-[#5B6B78]">
                        {alert.created_at || 'Recent'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#172B3A] whitespace-pre-line leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="pt-2 border-t border-[#D7E0E7] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#5B6B78]">
                      Issued by: <strong className="text-[#172B3A]">{alert.issued_by || 'SDMA'}</strong> • Radius: {alert.radius_km || 15} km
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveAlert(alert);
                          setShowEmergencyModal(true);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-[#E8F2F8] text-[#1769AA] border border-[#1769AA] rounded text-[10px] font-bold"
                      >
                        View Full Alert HUD
                      </button>

                      {isAct ? (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-2.5 py-1 bg-[#16855B] hover:bg-[#126d4a] text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-white" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateAlert(alert.id)}
                          className="px-2.5 py-1 bg-[#D99A00] hover:bg-[#b88200] text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-white" />
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
        <div className="p-4 bg-[#F8FAFC] border-t border-[#D7E0E7] flex items-center justify-between text-xs font-mono text-[#5B6B78]">
          <span>Total Recorded Alerts: <strong>{alerts.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#F8FAFC] hover:bg-[#E8F2F8] text-[#1769AA] border border-[#1769AA] rounded-lg font-bold"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
}
