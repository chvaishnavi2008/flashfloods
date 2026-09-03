import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  ShieldAlert, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio,
  FileText,
  Navigation,
  Flame,
  HeartPulse,
  Truck,
  Building2
} from 'lucide-react';

export default function SendRescueTeamModal({
  isOpen = false,
  onClose = () => {},
  teams = [],
  locations = [],
  initialLocation = null,
  initialTeam = null,
  onDispatch = () => {}
}) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [missionType, setMissionType] = useState('Flood Rescue');
  const [priority, setPriority] = useState('HIGH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Pre-fill fields when modal opens with context
  useEffect(() => {
    if (isOpen) {
      setSuccessMessage('');
      if (initialTeam) {
        setSelectedTeamId(initialTeam.id || initialTeam.team_id);
      } else {
        const available = teams.find(t => t.status === 'AVAILABLE') || teams[0];
        if (available) setSelectedTeamId(available.id || available.team_id);
      }

      if (initialLocation) {
        setSelectedLocationId(String(initialLocation.id));
        setDestinationName(initialLocation.name);
        // Auto-suggest mission type based on dominant hazard
        const dominant = initialLocation.current_risk?.dominant_hazard || 'flash_flood';
        if (dominant === 'landslide') setMissionType('Landslide Rescue');
        else if (dominant === 'heavy_rainfall') setMissionType('Evacuation');
        else setMissionType('Flood Rescue');

        // Auto-suggest priority based on risk level
        const level = initialLocation.current_risk?.overall_level || 'HIGH';
        if (level === 'CRITICAL') setPriority('CRITICAL');
        else if (level === 'HIGH') setPriority('HIGH');
        else setPriority('MEDIUM');
      } else if (locations.length > 0) {
        setSelectedLocationId(String(locations[0].id));
        setDestinationName(locations[0].name);
      }
    }
  }, [isOpen, initialLocation, initialTeam, teams, locations]);

  const handleLocationChange = (locId) => {
    setSelectedLocationId(locId);
    const loc = locations.find(l => String(l.id) === String(locId));
    if (loc) {
      setDestinationName(loc.name);
      const level = loc.current_risk?.overall_level || 'HIGH';
      if (level === 'CRITICAL') setPriority('CRITICAL');
      else if (level === 'HIGH') setPriority('HIGH');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert("Please select a rescue team.");
      return;
    }

    const loc = locations.find(l => String(l.id) === String(selectedLocationId));
    const team = teams.find(t => t.id === selectedTeamId || t.team_id === selectedTeamId);

    setIsSubmitting(true);
    try {
      await onDispatch({
        teamId: selectedTeamId,
        locationId: loc ? loc.id : Number(selectedLocationId),
        destinationName: destinationName || (loc ? loc.name : "Target Sector"),
        destinationLat: loc ? loc.lat : 30.4124,
        destinationLng: loc ? loc.lng : 79.3198,
        missionType,
        priority,
        notes
      });

      setSuccessMessage(`Rescue Mission Dispatched: Team ${team?.name || selectedTeamId} assigned to ${destinationName || 'Target Sector'}!`);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Dispatch failed", err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeSelectedTeam = teams.find(t => t.id === selectedTeamId || t.team_id === selectedTeamId);
  const activeSelectedLoc = locations.find(l => String(l.id) === String(selectedLocationId));

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B1120] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/80 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/40 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                  STATE DISASTER MANAGEMENT AUTHORITY (SDMA)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  MISSION DISPATCH
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                Dispatch Rescue & Evacuation Team
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* 1. Select Rescue Team */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase block flex items-center justify-between">
              <span>1. Select Rescue Team:</span>
              {activeSelectedTeam && (
                <span className="text-[10px] text-emerald-400">
                  Status: <strong>{activeSelectedTeam.status}</strong> • {activeSelectedTeam.members_count} Personnel
                </span>
              )}
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
            >
              {teams.map(t => (
                <option key={t.id || t.team_id} value={t.id || t.team_id}>
                  {t.name} [{t.id || t.team_id}] — {t.team_type} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Incident Location & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase block">
                2. Target Sector / Risk Area:
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.state}) — {loc.current_risk?.overall_level || 'HIGH'} Risk
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase block">
                3. Destination Landmark / Ward:
              </label>
              <input
                type="text"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                placeholder="e.g. Chamoli Ward 4 / Lower Ghats"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Active Sector Hazard Intel Card */}
          {activeSelectedLoc && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Sector Live Hazard:</span>
                  <span className="font-bold text-white uppercase">
                    {activeSelectedLoc.current_risk?.dominant_hazard?.replace('_', ' ') || 'Flash Flood'} ({activeSelectedLoc.current_risk?.overall_level || 'HIGH'} RISK)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Est. Lead Time:</span>
                <span className="font-bold text-emerald-400">~{activeSelectedLoc.current_risk?.lead_time_minutes || 30} mins</span>
              </div>
            </div>
          )}

          {/* 3. Mission Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase block">
                4. Mission Type:
              </label>
              <select
                value={missionType}
                onChange={(e) => setMissionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
              >
                <option value="Flood Rescue">Flood Rescue & Boat Extraction</option>
                <option value="Landslide Rescue">Landslide & Debris Search & Rescue</option>
                <option value="Evacuation">High-Ground Evacuation Transit</option>
                <option value="Medical Assistance">Critical Medical & Trauma Triage</option>
                <option value="Search & Rescue">Search & Rescue (USAR + Canine)</option>
                <option value="Supply/Relief">Emergency Rations & Water Relief</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase block">
                5. Operation Priority:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full bg-slate-950 border rounded-xl p-3 font-bold focus:outline-none ${
                  priority === 'CRITICAL' ? 'text-red-400 border-red-500' :
                  priority === 'HIGH' ? 'text-orange-400 border-orange-500' :
                  priority === 'MEDIUM' ? 'text-amber-300 border-amber-500' :
                  'text-emerald-400 border-slate-700'
                }`}
              >
                <option value="CRITICAL">🔴 CRITICAL (Immediate Life-Threatening Surge)</option>
                <option value="HIGH">🟠 HIGH (Rapid Pre-emptive Evacuation)</option>
                <option value="MEDIUM">🟡 MEDIUM (Standby & Perimeter Patrol)</option>
                <option value="LOW">🟢 LOW (Routine Relief Distribution)</option>
              </select>
            </div>
          </div>

          {/* 4. Operational Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase block">
              6. Tactical Deployment Directives & Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deploy 4 Zodiac motorboats, establish VHF satellite relay on high school ground, coordinate with district magistrate."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Dispatching Team..." : "CONFIRM & DISPATCH TEAM"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
