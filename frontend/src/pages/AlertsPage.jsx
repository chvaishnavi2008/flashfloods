import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BellRing, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Filter, 
  AlertTriangle, 
  Check, 
  Search, 
  Radio, 
  RotateCcw, 
  Smartphone, 
  MessageSquare, 
  Bell, 
  Layers, 
  ExternalLink,
  MapPin
} from 'lucide-react';

export default function AlertsPage() {
  const { 
    alerts, 
    resolveAlert, 
    reactivateAlert, 
    userRole, 
    setActiveAlert, 
    setShowEmergencyModal, 
    setActivePage 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, RESOLVED
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // ALL, CRITICAL, HIGH, MODERATE
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = (alerts || []).filter((a) => {
    const isAct = a.status === 'Active' || a.status === 'ACTIVE' || a.status === 'Monitoring';
    const matchesStatus = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'ACTIVE' ? isAct :
      !isAct;

    const matchesSeverity = 
      filterSeverity === 'ALL' ? true :
      (a.severity || '').toUpperCase().includes(filterSeverity);

    const matchesSearch = 
      (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.location_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.hazard_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.message || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity) => {
    const sev = (severity || '').toUpperCase();
    if (sev.includes('CRITICAL') || sev.includes('EMERGENCY')) {
      return 'bg-red-500/20 text-[#C62828] dark:text-red-300 border-red-500/40 animate-pulse font-black';
    } else if (sev.includes('HIGH') || sev.includes('WARNING')) {
      return 'bg-orange-500/20 text-[#E87516] dark:text-orange-300 border-orange-500/40 font-bold';
    } else {
      return 'bg-amber-500/20 text-[#D99A00] dark:text-amber-300 border-amber-500/40 font-semibold';
    }
  };

  return (
    <div className="space-y-6 pb-12 transition-colors duration-200">
      {/* 1. Header & Notification Multi-Channel Status Bar */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 rounded-xl">
              <BellRing className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C62828] dark:text-red-400">
                  STAGE 5 EARLY WARNING ENGINE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1769AA]/10 dark:bg-blue-600/30 text-[#1769AA] dark:text-blue-300 border border-[#1769AA]/30">
                  CAP-COMPLIANT ARCHIVE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#172B3A] dark:text-white mt-0.5">
                Multi-Hazard Early Warning & Alert Broadcasting Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] dark:bg-black/40 border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-mono text-[#5B6B78] dark:text-slate-300">
            <Radio className="w-4 h-4 text-[#16855B] dark:text-emerald-400 animate-pulse" />
            <span>BROADCAST NETWORK ONLINE</span>
          </div>
        </div>

        {/* Multi-Channel Dispatcher Channels Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-xs font-mono">
          <div className="bg-[#F8FAFC] dark:bg-[#070F1E] p-3 rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <div className="flex items-center justify-between text-[#5B6B78] dark:text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold">In-App Alerts</span>
              <Bell className="w-3.5 h-3.5 text-[#1769AA] dark:text-blue-400" />
            </div>
            <strong className="text-[#172B3A] dark:text-white">Active HUD Modal</strong>
            <span className="text-[10px] text-[#16855B] dark:text-emerald-400 block mt-0.5">&lt; 100ms latency</span>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#070F1E] p-3 rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <div className="flex items-center justify-between text-[#5B6B78] dark:text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold">Browser Push</span>
              <BellRing className="w-3.5 h-3.5 text-[#16855B] dark:text-emerald-400" />
            </div>
            <strong className="text-[#172B3A] dark:text-white">HTML5 Web API</strong>
            <span className="text-[10px] text-[#16855B] dark:text-emerald-400 block mt-0.5">Background Active</span>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#070F1E] p-3 rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <div className="flex items-center justify-between text-[#5B6B78] dark:text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold">SMS Dispatch</span>
              <Smartphone className="w-3.5 h-3.5 text-[#D99A00] dark:text-amber-400" />
            </div>
            <strong className="text-[#D99A00] dark:text-amber-300">Notification Sim</strong>
            <span className="text-[10px] text-[#5B6B78] dark:text-slate-400 block mt-0.5">CDAC / NIC Gateway</span>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#070F1E] p-3 rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <div className="flex items-center justify-between text-[#5B6B78] dark:text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold">WhatsApp Alert</span>
              <MessageSquare className="w-3.5 h-3.5 text-[#16855B] dark:text-emerald-400" />
            </div>
            <strong className="text-[#16855B] dark:text-emerald-300">Notification Sim</strong>
            <span className="text-[10px] text-[#5B6B78] dark:text-slate-400 block mt-0.5">Meta Cloud Pluggable</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#5B6B78] dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts by location, hazard, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg pl-9 pr-3 py-2 text-[#172B3A] dark:text-white placeholder-[#5B6B78] dark:placeholder-slate-500 focus:outline-none focus:border-[#1769AA]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#5B6B78] dark:text-slate-400 text-[11px]">Status:</span>
          {['ALL', 'ACTIVE', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                filterStatus === st
                  ? 'bg-[#1769AA] text-white shadow-sm'
                  : 'bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#5B6B78] dark:text-slate-400 text-[11px]">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                filterSeverity === sev
                  ? 'bg-[#C62828] text-white shadow-sm'
                  : 'bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Alerts Archive Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B6B78] dark:text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C62828] dark:text-red-400" />
            <span>Broadcast Alerts & Warnings ({filteredAlerts.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-[#5B6B78] dark:text-slate-500">
            Total Broadcasts in Log: {alerts.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 font-mono">
          {filteredAlerts.map((alert) => {
            const isAct = alert.status === 'Active' || alert.status === 'ACTIVE' || alert.status === 'Monitoring';
            const isCrit = (alert.severity || '').includes('CRITICAL') || (alert.severity || '').includes('EMERGENCY');

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 transition-all shadow-sm space-y-3.5 ${
                  isAct 
                    ? (isCrit ? 'border-[#C62828] bg-red-50/70 dark:bg-gradient-to-r dark:from-[#210c10] dark:to-[#111C35]' : 'border-orange-500/60 bg-amber-50/70 dark:bg-gradient-to-r dark:from-[#21150c] dark:to-[#111C35]')
                    : 'bg-white dark:bg-[#111C35] border-[#D7E0E7] dark:border-[#1E2E4A] opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-xs border uppercase ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity || 'WARNING'}
                    </span>
                    <div>
                      <h4 className="text-base font-black text-[#172B3A] dark:text-white">{alert.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6B78] dark:text-slate-400 mt-0.5">
                        <span className="text-[#1769AA] dark:text-[#38BDF8] font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{alert.location_name}</span>
                        </span>
                        <span>•</span>
                        <span>Hazard: <strong className="text-[#172B3A] dark:text-slate-200">{alert.hazard_type}</strong></span>
                        <span>•</span>
                        <span>Lead Time: ~{alert.lead_time_min} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      isAct ? 'bg-red-500/20 text-[#C62828] dark:text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-[#16855B] dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isAct ? 'ACTIVE' : 'RESOLVED'}
                    </span>
                    <span className="text-xs text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{alert.created_at || 'Just now'}</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="bg-[#F8FAFC] dark:bg-[#070F1E] p-3.5 rounded-xl border border-[#D7E0E7] dark:border-[#1E2E4A] text-xs text-[#172B3A] dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {alert.message}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#5B6B78] dark:text-slate-400">
                  <span>Issued by: <strong className="text-[#172B3A] dark:text-slate-300">{alert.issued_by}</strong></span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveAlert(alert);
                        setShowEmergencyModal(true);
                      }}
                      className="px-3 py-1.5 bg-[#1769AA]/10 dark:bg-blue-600/30 hover:bg-[#1769AA] text-[#1769AA] dark:text-blue-300 hover:text-white rounded-lg border border-[#1769AA]/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>Open Full Warning HUD</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {isAct ? (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#070F1E] hover:bg-[#16855B] text-[#172B3A] dark:text-slate-300 hover:text-white border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-[#16855B] dark:text-emerald-400" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => reactivateAlert(alert.id)}
                        className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#070F1E] hover:bg-[#C62828] text-[#172B3A] dark:text-slate-300 hover:text-white border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#D99A00] dark:text-amber-400" />
                        <span>Reactivate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-[#111C35] rounded-2xl border border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400 font-mono">
              No early warning alerts found for the current search and filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
