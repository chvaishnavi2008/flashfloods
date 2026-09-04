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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden font-mono flex flex-col max-h-[92vh] text-[#172B3A] dark:text-[#E2E8F0]">
        {/* Modal Header */}
        <div className="bg-[#123047] dark:bg-[#071322] px-5 py-4 border-b border-[#294657] dark:border-[#1E2E4A] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1769AA] text-white rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D7E0E7]">
                  STATE DISASTER MANAGEMENT AUTHORITY (SDMA)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1769AA] text-white">
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
            className="p-1.5 text-[#D7E0E7] hover:text-white bg-[#0B2233] dark:bg-[#0B1528] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {successMessage && (
            <div className="p-3 bg-[#EAF7F1] dark:bg-[#0B3322]/70 border border-[#16855B] text-[#16855B] dark:text-[#34D399] rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#16855B] dark:text-[#34D399] shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* 1. Select Rescue Team */}
          <div className="space-y-1.5">
            <label className="text-[#172B3A] dark:text-[#E2E8F0] font-bold uppercase block flex items-center justify-between">
              <span>1. Select Rescue Team:</span>
              {activeSelectedTeam && (
                <span className="text-[10px] text-[#16855B] dark:text-[#34D399]">
                  Status: <strong>{activeSelectedTeam.status}</strong> • {activeSelectedTeam.members_count} Personnel
                </span>
              )}
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-[#172B3A] dark:text-[#F8FAFC] focus:border-[#1769AA] dark:focus:border-[#38BDF8] focus:outline-none"
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
              <label className="text-[#172B3A] dark:text-[#E2E8F0] font-bold uppercase block">
                2. Target Sector / Risk Area:
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-[#172B3A] dark:text-[#F8FAFC] focus:border-[#1769AA] dark:focus:border-[#38BDF8] focus:outline-none"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.state}) — {loc.current_risk?.overall_level || 'HIGH'} Risk
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#172B3A] dark:text-[#E2E8F0] font-bold uppercase block">
                3. Destination Landmark / Ward:
              </label>
              <input
                type="text"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                placeholder="e.g. Chamoli Ward 4 / Lower Ghats"
                className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-[#172B3A] dark:text-[#F8FAFC] focus:border-[#1769AA] dark:focus:border-[#38BDF8] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Active Sector Hazard Intel Card */}
          {activeSelectedLoc && (
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#C62828] dark:text-[#F87171]" />
                <div>
                  <span className="text-[#5B6B78] dark:text-[#94A3B8] block text-[10px]">Sector Live Hazard:</span>
                  <span className="font-bold text-[#172B3A] dark:text-[#F8FAFC] uppercase">
                    {activeSelectedLoc.current_risk?.dominant_hazard?.replace('_', ' ') || 'Flash Flood'} ({activeSelectedLoc.current_risk?.overall_level || 'HIGH'} RISK)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#5B6B78] dark:text-[#94A3B8] block text-[10px]">Est. Lead Time:</span>
                <span className="font-bold text-[#16855B] dark:text-[#34D399]">~{activeSelectedLoc.current_risk?.lead_time_minutes || 30} mins</span>
              </div>
            </div>
          )}

          {/* 3. Mission Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[#172B3A] dark:text-[#E2E8F0] font-bold uppercase block">
                4. Mission Type:
              </label>
              <select
                value={missionType}
                onChange={(e) => setMissionType(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-[#172B3A] dark:text-[#F8FAFC] focus:border-[#1769AA] dark:focus:border-[#38BDF8] focus:outline-none"
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
              <label className="text-[#172B3A] dark:text-[#E2E8F0] font-bold uppercase block">
                5. Operation Priority:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full bg-[#F8FAFC] dark:bg-[#0B1528] border rounded-xl p-3 font-bold focus:outline-none ${
                  priority === 'CRITICAL' ? 'text-[#C62828] dark:text-[#F87171] border-[#C62828]' :
                  priority === 'HIGH' ? 'text-[#E87516] dark:text-[#FB923C] border-[#E87516]' :
                  priority === 'MEDIUM' ? 'text-[#D99A00] dark:text-[#FBBF24] border-[#D99A00]' :
                  'text-[#16855B] dark:text-[#34D399] border-[#D7E0E7] dark:border-[#1E2E4A]'
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
            <label className="text-[#172B3A] dark:text-[#E2E8F0] font-bold uppercase block">
              6. Tactical Deployment Directives & Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deploy 4 Zodiac motorboats, establish VHF satellite relay on high school ground, coordinate with district magistrate."
              rows={3}
              className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 text-[#172B3A] dark:text-[#F8FAFC] focus:border-[#1769AA] dark:focus:border-[#38BDF8] focus:outline-none resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#5B6B78] dark:text-[#94A3B8] hover:text-[#172B3A] dark:hover:text-white border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#1769AA] hover:bg-[#125890] text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
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
