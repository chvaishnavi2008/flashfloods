import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiskMap from '../../components/RiskMap';
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
  Filter,
  Milestone,
  Hospital,
  School
} from 'lucide-react';

export default function AuthorityDashboardPage() {
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
    validity_hours: 12,
    issued_by: 'State Disaster Management Authority (SEOC)'
  });

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
        lead_time_min: 30
      });

      setSuccessMsg('Official emergency broadcast dispatched to CAP feeds, SMS simulation queue, and in-app HUD.');
      setTimeout(() => setSuccessMsg(''), 5000);
      setIsBroadcastModalOpen(false);
      setIsPreviewModalOpen(false);
      setFormData(prev => ({ ...prev, title: '', message: '' }));
    } catch (err) {
      console.error('Failed to issue alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingSosCount = (sosRequests || []).filter(s => s.status === 'PENDING').length;
  const criticalCount = systemRisk?.stats?.critical_zones || 5;
  const highCount = systemRisk?.stats?.high_risk_zones || 7;

  // Official Priority Incidents Matrix
  const priorityIncidents = [
    {
      id: 'INC-01',
      location: 'Chamoli',
      state: 'Uttarakhand',
      locationId: 1,
      hazard: 'Flash Flood',
      riskScore: 87,
      severity: 'CRITICAL',
      populationAtRisk: '12,400',
      status: 'ACTIVE'
    },
    {
      id: 'INC-02',
      location: 'Kullu',
      state: 'Himachal Pradesh',
      locationId: 2,
      hazard: 'Landslide',
      riskScore: 78,
      severity: 'HIGH',
      populationAtRisk: '8,200',
      status: 'ACTIVE'
    },
    {
      id: 'INC-03',
      location: 'Sikkim (Chungthang)',
      state: 'Sikkim',
      locationId: 3,
      hazard: 'Flood',
      riskScore: 82,
      severity: 'CRITICAL',
      populationAtRisk: '5,600',
      status: 'ACTIVE'
    },
    {
      id: 'INC-04',
      location: 'Wayanad',
      state: 'Kerala',
      locationId: 8,
      hazard: 'Landslide',
      riskScore: 76,
      severity: 'HIGH',
      populationAtRisk: '4,300',
      status: 'MONITORING'
    }
  ];

  // Operational Field Response Units
  const responseUnits = [
    { id: 'SDRF-UK-01', name: 'SDRF 1st Bn Platoon A', location: 'Chamoli', status: 'DEPLOYED', tasks: 'Riverbank Evacuation', strength: '24 Personnel' },
    { id: 'NDRF-14-BN', name: '14th NDRF Urban Rescue', location: 'Joshimath', status: 'DEPLOYED', tasks: 'Landslide Clearance', strength: '32 Personnel' },
    { id: 'SDRF-HP-04', name: 'SDRF Mountain Rescue', location: 'Kullu', status: 'AVAILABLE', tasks: 'Standby at Base', strength: '18 Personnel' },
    { id: 'MED-AIR-02', name: 'State Disaster Medical Unit', location: 'Dehradun', status: 'AVAILABLE', tasks: 'Air Ambulance Standby', strength: '8 Doctors' }
  ];

  return (
    <div className="space-y-4 pb-12 font-mono text-xs text-slate-200">
      {/* ========================================================================= */}
      {/* 1. OPERATIONAL STATISTICS STRIP (Government-Dashboard KPIs)                */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1120] border border-slate-700/80 rounded p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
          <div className="p-2 bg-slate-900/90 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">MONITORED SECTORS</span>
            <span className="text-base font-bold text-white mt-0.5 block">31</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-red-500/40 rounded">
            <span className="text-[10px] text-red-400 uppercase tracking-wider block">CRITICAL ZONES</span>
            <span className="text-base font-bold text-red-400 mt-0.5 block">5</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-amber-500/40 rounded">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block">ACTIVE ALERTS</span>
            <span className="text-base font-bold text-amber-300 mt-0.5 block">12</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-rose-500/40 rounded">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block">URGENT SOS</span>
            <span className="text-base font-bold text-rose-300 mt-0.5 block">3</span>
          </div>

          <div className="p-2 bg-slate-900/90 border border-emerald-500/40 rounded">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">RESPONSE UNITS</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">8 AVAILABLE</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-2.5 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN REGIONAL MULTI-HAZARD RISK MAP (Central Operational Workspace)    */}
      {/* ========================================================================= */}
      <section className="bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              REGIONAL MULTI-HAZARD RISK MAP
            </h2>
          </div>

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
        <RiskMap height="460px" showRoute={true} />

        {/* Clear Professional Legend */}
        <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-bold uppercase">SECTOR THREAT INDEX:</span>
            <span className="flex items-center gap-1.5 text-red-400 font-bold"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Critical</span>
            <span className="flex items-center gap-1.5 text-orange-400 font-bold"><span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> High</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full" /> Moderate</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Normal</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Projection: <strong>WGS84 / EPSG:4326</strong></span>
            <span>•</span>
            <span>Update Interval: <strong>Real-time Telemetry</strong></span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PRIORITY INCIDENTS TABLE (Government-Style Operational Grid)            */}
      {/* ========================================================================= */}
      <section className="bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              PRIORITY INCIDENTS
            </h2>
          </div>
          <span className="text-slate-400 text-[11px]">Sorted by Composite Severity Index</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-2.5">Location</th>
                <th className="p-2.5">Hazard</th>
                <th className="p-2.5 text-center">Risk Score</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5 text-right">Population at Risk</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {priorityIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>{inc.location}, {inc.state}</span>
                  </td>
                  <td className="p-2.5 text-slate-300">{inc.hazard}</td>
                  <td className="p-2.5 text-center font-bold">
                    <span className={inc.riskScore >= 76 ? 'text-red-400' : 'text-orange-400'}>
                      {inc.riskScore}
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
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ACTIVE ALERTS OPERATIONAL QUEUE                                         */}
      {/* ========================================================================= */}
      <section className="bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              ACTIVE ALERTS QUEUE
            </h2>
          </div>
          <button
            onClick={() => setActivePage('alerts')}
            className="text-[11px] text-blue-400 hover:underline"
          >
            Inspect All Alerts
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-2">Alert ID</th>
                <th className="p-2">Location</th>
                <th className="p-2">Hazard</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Time</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2">Broadcast</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {alerts.slice(0, 4).map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/50">
                  <td className="p-2 font-mono text-slate-400">ALT-{a.id}</td>
                  <td className="p-2 font-bold text-white">{a.location_name || 'Chamoli'}</td>
                  <td className="p-2 text-slate-300">{a.hazard_type || 'Flash Flood'}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      a.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/50' : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-2 text-slate-400 font-mono text-[10px]">
                    {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                  </td>
                  <td className="p-2 text-center">
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-2 text-slate-400 text-[10px]">CAP-RSS + SMS Feed</td>
                  <td className="p-2 text-right">
                    {a.status === 'Active' || a.status === 'ACTIVE' ? (
                      <button
                        onClick={() => resolveAlert(a.id)}
                        className="px-2 py-0.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px]"
                      >
                        Resolve
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

      {/* ========================================================================= */}
      {/* 5. TWO-COLUMN SPLIT: IMPACT ASSESSMENT & EMERGENCY RESPONSE LOGISTICS     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Impact Assessment Matrix (6 cols) */}
        <section className="lg:col-span-6 bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                IMPACT ASSESSMENT
              </h2>
            </div>
            <button
              onClick={() => setActivePage('impact-assessment')}
              className="text-[11px] text-blue-400 hover:underline"
            >
              Detailed Breakdown
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">Population at Risk</span>
              <strong className="text-sm font-bold text-white">12,400</strong>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">Roads Affected</span>
              <strong className="text-sm font-bold text-white">7 Segments</strong>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">Bridges at Risk</span>
              <strong className="text-sm font-bold text-white">2 Bridges</strong>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">Schools & Hospitals</span>
              <strong className="text-sm font-bold text-white">4 Schools, 1 Hospital</strong>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">Critical Infrastructure</span>
              <strong className="text-sm font-bold text-white">14 Key Utilities</strong>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">Shelter Capacity</span>
              <strong className="text-sm font-bold text-emerald-400">18 Active (3,400 spots)</strong>
            </div>
          </div>
        </section>

        {/* Field Rescue & Response Units Allocation (6 cols) */}
        <section className="lg:col-span-6 bg-[#0B1120] border border-slate-700/80 rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                FIELD RESCUE & UNIT DEPLOYMENTS
              </h2>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">4 TEAMS ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pb-1">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">URGENT SOS</span>
              <strong className="text-sm font-bold text-rose-400">3 Pending</strong>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">RESCUE TEAMS</span>
              <strong className="text-sm font-bold text-emerald-400">6 AVAILABLE</strong>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="space-y-1.5">
            {responseUnits.slice(0, 2).map((u) => (
              <div key={u.id} className="p-2 bg-slate-900/90 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                <div>
                  <strong className="text-white block">{u.name}</strong>
                  <span className="text-slate-400 text-[10px]">Sector: {u.location} • {u.tasks}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  u.status === 'DEPLOYED' ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Rescue Command Frequency: <strong>VHF Ch 16</strong></span>
            <span className="text-emerald-400 font-bold">NDRF / SDRF Linked</span>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 6. ADMINISTRATIVE WARNING WORKFLOW MODAL                                  */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#0B1120] border border-slate-700 rounded-lg max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase">
                  ISSUE EMERGENCY WARNING
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
                <label className="block text-slate-400 mb-1">Target Area</label>
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
                  <label className="block text-slate-400 mb-1">Hazard</label>
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
                  <label className="block text-slate-400 mb-1">Severity</label>
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
                <label className="block text-slate-400 mb-1">Warning Directive Title</label>
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
                <label className="block text-slate-400 mb-1">Message</label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Official instructions for citizen evacuation and emergency teams..."
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Validity Period</label>
                <input
                  type="number"
                  name="validity_hours"
                  value={formData.validity_hours}
                  onChange={handleInputChange}
                  placeholder="12 Hours"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded text-amber-300 text-[10px] font-bold">
                SIMULATION / DEMO: Dispatches to prototype alert feeds and citizen in-app notification system.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                >
                  PREVIEW WARNING
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Broadcasting...' : 'BROADCAST WARNING'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#0B1120] border border-slate-700 rounded-lg max-w-lg w-full p-5 space-y-3 shadow-2xl">
            <h4 className="text-sm font-bold text-white uppercase border-b border-slate-700 pb-2">
              PREVIEW: OFFICIAL EMERGENCY DIRECTIVE
            </h4>
            <div className="p-3 bg-red-950/80 border border-red-500 rounded text-xs space-y-2">
              <strong className="text-white block text-sm">{formData.title || '🚨 EMERGENCY FLASH FLOOD WARNING'}</strong>
              <p className="text-slate-200">{formData.message || 'Evacuate low-lying river areas immediately. Head toward designated safe shelters.'}</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-red-500/40 flex justify-between">
                <span>Issued by: {formData.issued_by}</span>
                <span>Validity: {formData.validity_hours}h</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded font-bold"
              >
                Back to Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
