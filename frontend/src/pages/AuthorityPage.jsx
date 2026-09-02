import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import { 
  ShieldAlert, 
  Send, 
  AlertTriangle, 
  Users, 
  Activity, 
  Building2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Truck, 
  HeartPulse, 
  PhoneCall, 
  Check, 
  Layers, 
  Navigation,
  FileText,
  Eye,
  Server,
  Filter
} from 'lucide-react';

export default function AuthorityPage() {
  const { 
    locations, 
    systemRisk, 
    alerts, 
    issueAlert, 
    resolveAlert, 
    safeLocations, 
    selectedLocationId, 
    selectLocation, 
    sosRequests, 
    updateSosStatus,
    setActivePage,
    pipelineData,
    environmentalData
  } = useApp();

  const [formData, setFormData] = useState({
    location_id: selectedLocationId || (locations[0]?.id || 1),
    hazard_type: 'Flash Flood',
    severity: 'CRITICAL',
    title: '',
    message: '',
    radius_km: 25,
    lead_time_min: 30,
    issued_by: 'State Disaster Management Authority (SEOC)'
  });

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIssueAlert = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const title = formData.title || `EMERGENCY ALERT: Severe ${formData.hazard_type} Warning`;
      const message = formData.message || `Severe ${formData.hazard_type.toLowerCase()} threat detected. Immediate evacuation protocols in effect. Avoid riverbeds and unstable slopes.`;
      
      await issueAlert({
        ...formData,
        title,
        message,
        location_id: Number(formData.location_id),
        radius_km: Number(formData.radius_km),
        lead_time_min: Number(formData.lead_time_min)
      });

      setSuccessMsg('Official emergency broadcast dispatched to CAP feeds, SMS simulation queue, and in-app HUD.');
      setTimeout(() => setSuccessMsg(''), 5000);
      setIsBroadcastModalOpen(false);
      setFormData(prev => ({ ...prev, title: '', message: '' }));
    } catch (err) {
      console.error('Failed to issue alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingSosCount = (sosRequests || []).filter(s => s.status === 'PENDING').length;
  const criticalCount = systemRisk?.stats?.critical_zones || 0;
  const highCount = systemRisk?.stats?.high_risk_zones || 0;

  // Mock institutional priority incidents derived from live locations
  const priorityIncidents = [
    {
      id: 'INC-01',
      location: 'Chamoli, Uttarakhand',
      locationId: 1,
      hazard: 'Flash Flood & Landslide',
      riskScore: 87,
      severity: 'CRITICAL',
      populationAtRisk: '12,400',
      status: 'ACTIVE',
      leadTime: '30 mins'
    },
    {
      id: 'INC-02',
      location: 'Kullu - Manali, Himachal Pradesh',
      locationId: 2,
      hazard: 'Flash Flood',
      riskScore: 78,
      severity: 'HIGH',
      populationAtRisk: '8,200',
      status: 'ACTIVE',
      leadTime: '45 mins'
    },
    {
      id: 'INC-03',
      location: 'Wayanad (Meppadi), Kerala',
      locationId: 8,
      hazard: 'Debris Flow Landslide',
      riskScore: 82,
      severity: 'CRITICAL',
      populationAtRisk: '5,600',
      status: 'ACTIVE',
      leadTime: '20 mins'
    },
    {
      id: 'INC-04',
      location: 'Chungthang (Teesta), Sikkim',
      locationId: 3,
      hazard: 'GLOF Moraine Breach',
      riskScore: 74,
      severity: 'HIGH',
      populationAtRisk: '3,800',
      status: 'MONITORING',
      leadTime: '60 mins'
    }
  ];

  // Field response unit platoon data
  const responseUnits = [
    { id: 'SDRF-UK-01', name: 'SDRF 1st Battalion Platoon A', location: 'Chamoli', status: 'DEPLOYED', tasks: 'Riverbank Evacuation' },
    { id: 'NDRF-14-BN', name: '14th NDRF Urban Search & Rescue', location: 'Joshimath', status: 'DEPLOYED', tasks: 'Landslide Clearance' },
    { id: 'SDRF-HP-04', name: 'SDRF Mountain Rescue Team', location: 'Kullu', status: 'AVAILABLE', tasks: 'Standby at Base' },
    { id: 'MED-AIR-02', name: 'State Disaster Medical Response Unit', location: 'Dehradun', status: 'AVAILABLE', tasks: 'Air Ambulance Standby' }
  ];

  return (
    <div className="space-y-4 pb-12 font-mono text-xs text-slate-200">
      {/* ========================================================================= */}
      {/* 1. TOP OPERATIONAL STATUS & STATISTICS STRIP                              */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1120] border border-slate-700/80 rounded p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
          <div className="p-2 bg-slate-900/90 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">MONITORED SECTORS</span>
            <span className="text-base font-bold text-white mt-0.5 block">{locations.length} SECTORS</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-red-500/40 rounded">
            <span className="text-[10px] text-red-400 uppercase tracking-wider block">CRITICAL ZONES</span>
            <span className="text-base font-bold text-red-400 mt-0.5 block">{criticalCount} CRITICAL</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-amber-500/40 rounded">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block">ACTIVE ALERTS</span>
            <span className="text-base font-bold text-amber-300 mt-0.5 block">{alerts.length} ISSUED</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-rose-500/40 rounded">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block">URGENT SOS QUEUE</span>
            <span className="text-base font-bold text-rose-300 mt-0.5 block">{pendingSosCount} PENDING</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-emerald-500/40 rounded">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">RESPONSE UNITS</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">8 PLATOONS READY</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CENTRAL GIS COMMAND CANVAS                                             */}
      {/* ========================================================================= */}
      <section className="bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              REGIONAL MULTI-HAZARD RISK MAP — TACTICAL GIS COMMAND
            </h2>
          </div>

          {/* Quick Action to Issue Warning */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold flex items-center gap-1.5 shadow-sm transition-all text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Official Warning</span>
            </button>
          </div>
        </div>

        {/* Tactical Map */}
        <RiskMap height="480px" showRoute={true} />

        {/* Professional Legend */}
        <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-bold uppercase">SECTOR THREAT INDEX:</span>
            <span className="flex items-center gap-1.5 text-red-400 font-bold"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> CRITICAL (76-100)</span>
            <span className="flex items-center gap-1.5 text-orange-400 font-bold"><span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> HIGH (51-75)</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full" /> MODERATE (26-50)</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> LOW (0-25)</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Projection: <strong>WGS84 / EPSG:4326</strong></span>
            <span>•</span>
            <span>Update Interval: <strong>Real-time Telemetry</strong></span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PRIORITY CRITICAL INCIDENTS TABLE                                      */}
      {/* ========================================================================= */}
      <section className="bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              PRIORITY INCIDENTS & CRITICAL RESPONSE QUEUE
            </h2>
          </div>
          <span className="text-slate-400 text-[11px]">Ranked by Composite Risk & Population Exposure</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-2.5">SECTOR / LOCATION</th>
                <th className="p-2.5">PRIMARY HAZARD</th>
                <th className="p-2.5 text-center">RISK SCORE</th>
                <th className="p-2.5">SEVERITY</th>
                <th className="p-2.5 text-right">POP. AT RISK</th>
                <th className="p-2.5 text-center">STATUS</th>
                <th className="p-2.5 text-right">OPERATIONAL ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {priorityIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>{inc.location}</span>
                  </td>
                  <td className="p-2.5 text-slate-300">{inc.hazard}</td>
                  <td className="p-2.5 text-center font-bold font-mono">
                    <span className={inc.riskScore >= 76 ? 'text-red-400' : 'text-orange-400'}>
                      {inc.riskScore} / 100
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/50' : 'bg-orange-950 text-orange-300 border border-orange-500/50'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-bold text-white">{inc.populationAtRisk}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {inc.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => selectLocation(inc.locationId)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 text-[10px] font-bold"
                    >
                      INSPECT SECTOR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TWO-COLUMN SPLIT: ACTIVE WARNINGS QUEUE & RESPONSE UNITS STATUS         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Active Alerts Queue Table (7 cols) */}
        <section className="lg:col-span-7 bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                ACTIVE OPERATIONAL WARNINGS QUEUE ({alerts.length})
              </h2>
            </div>
            <button
              onClick={() => setActivePage('alerts')}
              className="text-[11px] text-blue-400 hover:underline"
            >
              Full Archive
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                <tr>
                  <th className="p-2">SECTOR</th>
                  <th className="p-2">HAZARD</th>
                  <th className="p-2">SEVERITY</th>
                  <th className="p-2">ISSUED</th>
                  <th className="p-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {alerts.slice(0, 5).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/50">
                    <td className="p-2 font-bold text-white truncate max-w-[120px]">{a.location_name || 'Chamoli'}</td>
                    <td className="p-2 text-slate-300">{a.hazard_type || 'Flash Flood'}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        a.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/50' : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-2 text-slate-400 font-mono text-[10px]">{a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</td>
                    <td className="p-2 text-right">
                      {a.status === 'Active' || a.status === 'ACTIVE' ? (
                        <button
                          onClick={() => resolveAlert(a.id)}
                          className="px-2 py-0.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px]"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Field Response Units Allocation (5 cols) */}
        <section className="lg:col-span-5 bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                FIELD RESPONSE UNITS ALLOCATION
              </h2>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">4 TEAMS ACTIVE</span>
          </div>

          <div className="space-y-2">
            {responseUnits.map((u) => (
              <div key={u.id} className="p-2 bg-slate-900/90 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                <div>
                  <strong className="text-white block">{u.name}</strong>
                  <span className="text-slate-400 text-[10px]">Assigned: {u.location} • Task: {u.tasks}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  u.status === 'DEPLOYED' ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 5. INCOMING CITIZEN SOS DISTRESS QUEUE TABLE                              */}
      {/* ========================================================================= */}
      <section className="bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              INCOMING CITIZEN SOS DISTRESS QUEUE ({pendingSosCount} PENDING DISPATCH)
            </h2>
          </div>
          <span className="text-slate-400 text-[11px]">Direct telemetry from Citizen Safety Portal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-2.5">SIGNAL ID</th>
                <th className="p-2.5">CITIZEN</th>
                <th className="p-2.5">SECTOR</th>
                <th className="p-2.5">MESSAGE / DETAILS</th>
                <th className="p-2.5 text-center">TRAPPED</th>
                <th className="p-2.5 text-center">STATUS</th>
                <th className="p-2.5 text-right">DISPATCH ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {sosRequests.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-bold text-red-400 font-mono">{s.id}</td>
                  <td className="p-2.5 text-white font-bold">{s.citizen_name} ({s.phone})</td>
                  <td className="p-2.5 text-slate-300">{s.location_name}</td>
                  <td className="p-2.5 text-slate-300 max-w-xs truncate">"{s.message}"</td>
                  <td className="p-2.5 text-center font-bold text-white">{s.people_count || 1} Persons</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'PENDING' ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-700 text-white'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    {s.status === 'PENDING' ? (
                      <button
                        onClick={() => updateSosStatus(s.id, 'DISPATCHED')}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold flex items-center gap-1 ml-auto"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Dispatch Rescue</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[10px] font-bold">Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ADMINISTRATIVE WARNING BROADCAST MODAL                                 */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B1120] border border-slate-700 rounded-lg max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase">
                  ISSUE ADMINISTRATIVE EMERGENCY BROADCAST (CAP v1.2)
                </h3>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Sector</label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Hazard Type</label>
                  <select
                    name="hazard_type"
                    value={formData.hazard_type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="Flash Flood">Flash Flood</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Heavy Rainfall">Heavy Rainfall</option>
                    <option value="Riverine Flood">Riverine Flood</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Severity Tier</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold text-red-400"
                  >
                    <option value="CRITICAL">CRITICAL (Emergency Warning)</option>
                    <option value="HIGH">HIGH (Warning)</option>
                    <option value="MODERATE">MODERATE (Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Directive Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. 🚨 CRITICAL FLASH FLOOD WARNING: Alaknanda Basin"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Directive Message</label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Official instructions for citizen evacuation and emergency teams..."
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded text-amber-300 text-[10px]">
                Notice: Dispatches via prototype notification dispatcher to simulated SMS and In-App citizen HUD.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Warning'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
