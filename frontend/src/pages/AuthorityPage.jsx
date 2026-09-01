import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import SimulationTimelineBar from '../components/SimulationTimelineBar';
import { 
  ShieldAlert, 
  Send, 
  AlertTriangle, 
  Users, 
  Activity, 
  Home, 
  Plus, 
  CheckCircle2,
  Clock,
  Radio,
  Truck,
  HeartPulse,
  PhoneCall,
  Check,
  Flame,
  RotateCcw
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
    triggerSimulation,
    isSimulating
  } = useApp();

  const [formData, setFormData] = useState({
    location_id: selectedLocationId || (locations[0]?.id || 1),
    hazard_type: 'Flash Flood',
    severity: 'CRITICAL',
    title: '',
    message: '',
    radius_km: 15,
    lead_time_min: 35,
    issued_by: 'State Disaster Management Authority'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'sos' | 'shelters' | 'map'

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

      setSuccessMsg('Emergency alert broadcast successfully to all citizen portals and prototype notification dispatchers!');
      setTimeout(() => setSuccessMsg(''), 5000);
      
      // Reset form
      setFormData(prev => ({ ...prev, title: '', message: '' }));
    } catch (err) {
      console.error('Failed to issue alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPopulation = locations.reduce((acc, l) => acc + (l.population || 0), 0);
  const pendingSosCount = sosRequests.filter(s => s.status === 'PENDING').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Authority Hero Banner */}
      <div className="bg-gradient-to-r from-red-950 via-[#1E293B] to-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/30 text-red-400 border border-red-500/50 rounded-xl">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">
                  STATE DISASTER MANAGEMENT AUTHORITY (SDMA / SEOC)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white">
                  GOVERNMENT COMMAND CONSOLE
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                Multi-Hazard Emergency Operations & Dispatch Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-red-500/40 rounded-lg text-xs font-mono text-red-300">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>DISPATCH CHANNELS ACTIVE</span>
          </div>
        </div>

        {/* Command Center KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Monitored Sectors</span>
            <span className="text-xl font-bold font-mono text-white">{locations.length}</span>
          </div>

          <div className="bg-slate-900/90 border border-red-500/40 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-red-400 block">Critical Risk Zones</span>
            <span className="text-xl font-bold font-mono text-red-400">{systemRisk?.stats?.critical_zones || 0}</span>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/40 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-amber-400 block">Citizen SOS Queue</span>
            <span className="text-xl font-bold font-mono text-amber-400">{pendingSosCount} Urgent</span>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/40 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block">Active Safe Shelters</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{safeLocations.length} Shelters</span>
          </div>
        </div>
      </div>

      {/* SIH Live Disaster Simulation Layer Controller */}
      <SimulationTimelineBar />

      {/* Authority Control Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'dispatch', label: '🚨 Issue Emergency Broadcast' },
          { id: 'sos', label: `🆘 Citizen SOS Rescue Queue (${pendingSosCount})` },
          { id: 'shelters', label: '🏢 Safe Shelter Logistics Manager' },
          { id: 'map', label: '🗺️ Tactical Threat GIS Matrix' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Issue Emergency Broadcast Form & Map */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Issue Alert Form Panel */}
          <div className="lg:col-span-5 bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
              <Send className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                Broadcast Official Warning to Citizens
              </h3>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleIssueAlert} className="space-y-4 text-xs font-mono">
              {/* Target Location */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Sector / Location</label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.state}, {loc.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hazard Type & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Hazard Category</label>
                  <select
                    name="hazard_type"
                    value={formData.hazard_type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Flash Flood">Flash Flood</option>
                    <option value="Riverine Flood">Riverine Flood</option>
                    <option value="Landslide">Landslide / Land Risk</option>
                    <option value="Heavy Rainfall">Heavy Rainfall / Cloudburst</option>
                    <option value="Multi-Hazard (Flood + Landslide)">Multi-Hazard Combined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Threat Severity</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-red-500"
                  >
                    <option value="CRITICAL">CRITICAL (Red Alert)</option>
                    <option value="HIGH">HIGH (Orange Alert)</option>
                    <option value="MODERATE">MODERATE (Yellow Watch)</option>
                    <option value="LOW">LOW (Advisory)</option>
                  </select>
                </div>
              </div>

              {/* Alert Title */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Broadcast Alert Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. FLASH FLOOD EVACUATION ORDER: Rispana Basin"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 placeholder-slate-600"
                />
              </div>

              {/* Alert Message */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Emergency Directive Message</label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Detailed guidance for citizens in affected sectors..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 placeholder-slate-600"
                />
              </div>

              {/* Radius & Lead Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Affected Radius (km)</label>
                  <input
                    type="number"
                    name="radius_km"
                    value={formData.radius_km}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Lead Time (mins)</label>
                  <input
                    type="number"
                    name="lead_time_min"
                    value={formData.lead_time_min}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Broadcasting...' : 'Issue Emergency Alert to Citizens'}</span>
              </button>
            </form>
          </div>

          {/* Tactical GIS Map Preview */}
          <div className="lg:col-span-7 bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                Active Tactical Threat GIS
              </h3>
              <span className="text-xs font-mono text-slate-400">SEOC Live GIS Stream</span>
            </div>

            <div className="flex-1 min-h-[420px]">
              <RiskMap height="450px" showRoute={true} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Citizen SOS Rescue Queue */}
      {activeTab === 'sos' && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">
                  Incoming Citizen Distress Signals & SOS Queue
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Live distress signals transmitted by citizens requiring immediate NDRF / SDRF team dispatch
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sosRequests.map((sos) => (
              <div
                key={sos.id}
                className={`p-5 rounded-xl border transition-all ${
                  sos.status === 'PENDING'
                    ? 'bg-red-950/30 border-red-500/80 shadow-md'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-red-600 text-white font-mono font-bold text-xs rounded">
                      {sos.id}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white">{sos.citizen_name}</h4>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                        <span>📞 {sos.phone}</span>
                        <span>•</span>
                        <span>📍 {sos.location_name}</span>
                        <span>•</span>
                        <span>👥 {sos.people_count} Persons Trapped</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      sos.status === 'PENDING' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-600 text-white'
                    }`}>
                      {sos.status}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{sos.timestamp}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 mt-3 font-sans leading-relaxed">
                  "{sos.message}"
                </p>

                {/* Dispatch Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="text-amber-400 flex items-center gap-1 font-bold">
                    <span>Priority: {sos.urgency}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sos.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => updateSosStatus(sos.id, 'DISPATCHED')}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch NDRF Boat / Team</span>
                        </button>
                        <button
                          onClick={() => updateSosStatus(sos.id, 'RESCUED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                        >
                          Mark Rescued
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Rescue Mission Active / Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Safe Shelter Logistics Manager */}
      {activeTab === 'shelters' && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wide">
                Shelter Resource & Capacity Management
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time shelter capacity allocation, medical supplies, and relief inventory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeLocations.map((s) => (
              <div key={s.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{s.name}</h4>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>Occupancy:</span>
                    <span>{s.current_occupancy} / {s.capacity} ({s.occupancy_pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full ${s.occupancy_pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${s.occupancy_pct}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                  Amenities: {s.facilities}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Tactical Threat GIS Matrix */}
      {activeTab === 'map' && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            Full-Spectrum GIS Threat Matrix
          </h3>
          <RiskMap height="550px" showRoute={true} />
        </div>
      )}

      {/* Broadcast History Log Table */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Official Alert Broadcast Logs ({alerts.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-700">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Location</th>
                <th className="p-3">Hazard</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-semibold text-slate-400">{a.created_at}</td>
                  <td className="p-3 font-bold text-white">{a.location_name}</td>
                  <td className="p-3">{a.hazard_type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${
                      a.status === 'Active' ? 'text-red-400 border-red-500/40' : 'text-slate-400 border-slate-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {a.status === 'Active' && (
                      <button
                        onClick={() => resolveAlert(a.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
