import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { rescueService, INITIAL_RESCUE_TEAMS } from '../services/rescueService';
import RescueTrackingMap from '../components/RescueTrackingMap';
import SendRescueTeamModal from '../components/SendRescueTeamModal';
import { 
  Truck, 
  Send, 
  ShieldAlert, 
  Users, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  Radio, 
  Filter, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  Play, 
  Pause, 
  Flame, 
  Layers,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';

export default function RescueOperationsPage() {
  const { locations, systemRisk } = useApp();

  const [teams, setTeams] = useState(() => rescueService.loadTeams());
  const [missions, setMissions] = useState(() => rescueService.loadMissions());
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchLocation, setDispatchLocation] = useState(null);
  const [dispatchTeam, setDispatchTeam] = useState(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef(null);

  // Initial load
  useEffect(() => {
    const load = async () => {
      const t = await rescueService.getRescueTeams();
      const m = await rescueService.getRescueMissions();
      setTeams(t);
      setMissions(m);
    };
    load();
  }, []);

  // GPS Simulation Interval
  useEffect(() => {
    if (isSimulating) {
      simulationIntervalRef.current = setInterval(() => {
        const updatedTeams = rescueService.stepSimulatedMovement();
        setTeams([...updatedTeams]);
      }, 3000);
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulating]);

  const handleToggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  const handleOpenDispatch = (team = null, loc = null) => {
    setDispatchTeam(team);
    setDispatchLocation(loc);
    setIsDispatchModalOpen(true);
  };

  const handleDispatchConfirm = async (data) => {
    const res = await rescueService.dispatchRescueTeam(data);
    setTeams([...rescueService.teams]);
    setMissions([...rescueService.missions]);
    setSelectedTeam(res.team);
    // Automatically turn on live telemetry GPS simulation so movement is immediately visible
    setIsSimulating(true);
  };

  const handleUpdateStatus = async (teamId, newStatus) => {
    const updated = await rescueService.updateTeamStatus(teamId, newStatus);
    setTeams([...rescueService.teams]);
    setMissions([...rescueService.missions]);
    if (selectedTeam && (selectedTeam.id === teamId || selectedTeam.team_id === teamId)) {
      setSelectedTeam(updated);
    }
  };

  const handleResetToAvailable = async (teamId) => {
    await handleUpdateStatus(teamId, 'AVAILABLE');
  };

  // KPIs
  const summary = rescueService.getSummaryStats(teams, missions);

  // Filtered Teams with Active / Dispatched teams prioritized at the top
  const filteredTeams = [...teams]
    .sort((a, b) => {
      const getPriority = (st) => {
        if (st === 'EMERGENCY') return 1;
        if (st === 'EN ROUTE') return 2;
        if (st === 'ON SITE') return 3;
        if (st === 'ASSIGNED') return 4;
        if (st === 'AVAILABLE') return 5;
        return 6;
      };
      return getPriority(a.status) - getPriority(b.status);
    })
    .filter(team => {
      if (statusFilter !== 'ALL' && team.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          team.name.toLowerCase().includes(q) ||
          team.team_id.toLowerCase().includes(q) ||
          team.team_type.toLowerCase().includes(q) ||
          (team.destination_name && team.destination_name.toLowerCase().includes(q))
        );
      }
      return true;
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EMERGENCY':
        return 'bg-rose-600 text-white font-black animate-pulse';
      case 'ON SITE':
        return 'bg-emerald-600 text-white font-bold';
      case 'EN ROUTE':
        return 'bg-amber-600 text-white font-bold';
      case 'ASSIGNED':
        return 'bg-purple-600 text-white font-bold';
      case 'COMPLETED':
        return 'bg-slate-700 text-slate-300';
      default:
        return 'bg-blue-600 text-white font-bold';
    }
  };

  return (
    <div className="space-y-6 pb-16 font-mono">
      {/* 1. Header Banner */}
      <div className="bg-[#0B1120] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-600/20 text-red-400 border border-red-500/40 rounded-2xl">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                  STATE DISASTER MANAGEMENT AUTHORITY (SDMA)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEMO — SIMULATED GPS
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                🚑 Rescue Operations & Live Team Tracking
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Central command dispatch & real-time telemetry coordination across NDRF, SDRF, and Civil Defence columns.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleToggleSimulation}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isSimulating
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse ring-2 ring-amber-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause GPS Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>🧪 Simulate Team Movement</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOpenDispatch()}
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>+ Send Rescue Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Dashboard */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-[#0B1120] border border-red-500/30 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Active Rescue Teams</span>
            <Truck className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-2xl font-black text-red-400 mt-1 block">{summary.active_teams}</span>
          <span className="text-[10px] text-slate-500">In Field / Assigned</span>
        </div>

        <div className="p-4 bg-[#0B1120] border border-rose-500/30 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Active Incidents</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-300 mt-1 block">{summary.active_incidents}</span>
          <span className="text-[10px] text-slate-500">Target Disasters</span>
        </div>

        <div className="p-4 bg-[#0B1120] border border-amber-500/30 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Teams En Route</span>
            <Navigation className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-300 mt-1 block">{summary.teams_en_route}</span>
          <span className="text-[10px] text-slate-500">Transit in progress</span>
        </div>

        <div className="p-4 bg-[#0B1120] border border-emerald-500/30 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Available Teams</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{summary.available_teams}</span>
          <span className="text-[10px] text-slate-500">Standby at bases</span>
        </div>

        <div className="p-4 bg-[#0B1120] border border-slate-700/80 rounded-2xl shadow-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Completed Missions</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white mt-1 block">{summary.completed_missions}</span>
          <span className="text-[10px] text-slate-500">Successful rescues</span>
        </div>
      </section>

      {/* 3. Main Workspace: Map + Team Table Side-by-Side (Desktop) / Stacked (Mobile) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (xl:7): Live GPS Tracking Map */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                LIVE RESCUE TELEMETRY TRACKING MAP
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Click any team marker or sector to interact</span>
          </div>

          <RescueTrackingMap
            teams={teams}
            locations={locations}
            selectedTeam={selectedTeam}
            onSelectTeam={(t) => setSelectedTeam(t)}
            onSelectLocationForRescue={(loc) => handleOpenDispatch(null, loc)}
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
            height="560px"
          />
        </div>

        {/* Right Column (xl:5): Rescue Teams Management & Lifecycle Controls */}
        <div className="xl:col-span-5 space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 bg-[#0B1120] border border-slate-700/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Rescue Forces ({filteredTeams.length})</span>
              </span>

              <button
                onClick={() => handleOpenDispatch()}
                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg text-[11px] font-bold transition-all"
              >
                + Dispatch
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              {['ALL', 'AVAILABLE', 'ASSIGNED', 'EN ROUTE', 'ON SITE', 'COMPLETED', 'EMERGENCY'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded-md font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team name, ID, sector, or mission..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Teams List (Cards / Table) */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredTeams.map((team) => {
              const isSelected = selectedTeam?.id === team.id || selectedTeam?.team_id === team.id;
              return (
                <div
                  key={team.id || team.team_id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 shadow-lg ring-1 ring-blue-500/50'
                      : 'bg-[#0B1120] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">{team.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {team.team_id}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {team.team_type} • <strong>{team.members_count} Personnel</strong>
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(team.status)}`}>
                      {team.status}
                    </span>
                  </div>

                  {/* Mission & Telemetry Data */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/80 rounded-xl text-[11px] text-slate-300 border border-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Destination:</span>
                      <strong className="text-amber-300 truncate block">{team.destination_name || 'Standby at Base'}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Mission:</span>
                      <span className="text-white font-bold block">{team.mission_type || 'None Assigned'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">ETA / Dist:</span>
                      <span className="font-bold text-emerald-400">
                        {team.eta_minutes > 0 ? `${team.eta_minutes} min` : (team.status === 'ON SITE' ? 'On Site' : 'Standby')} ({team.distance_km} km)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Base Station:</span>
                      <span className="text-slate-400 truncate block">{team.base_station}</span>
                    </div>
                  </div>

                  {team.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-2">
                      "{team.notes}"
                    </p>
                  )}

                  {/* Mission Lifecycle Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                    {team.status === 'AVAILABLE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDispatch(team);
                        }}
                        className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch on Mission</span>
                      </button>
                    )}

                    {team.status === 'ASSIGNED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(team.id || team.team_id, 'EN ROUTE');
                        }}
                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Start Transit (En Route)</span>
                      </button>
                    )}

                    {team.status === 'EN ROUTE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(team.id || team.team_id, 'ON SITE');
                        }}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Mark On Site</span>
                      </button>
                    )}

                    {team.status === 'ON SITE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(team.id || team.team_id, 'COMPLETED');
                        }}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Mission Completed</span>
                      </button>
                    )}

                    {team.status === 'COMPLETED' && (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mission Completed
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetToAvailable(team.id || team.team_id);
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-all flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Available</span>
                        </button>
                      </div>
                    )}

                    {/* Emergency Escalation Button (for active missions) */}
                    {['ASSIGNED', 'EN ROUTE', 'ON SITE'].includes(team.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(team.id || team.team_id, 'EMERGENCY');
                        }}
                        className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 rounded-lg font-bold"
                        title="Escalate to Emergency SOS Status"
                      >
                        🚨 SOS Alert
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Dispatched Missions Operational Log */}
      <section className="bg-[#0B1120] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              DISPATCHED RESCUE MISSIONS AUDIT TRAIL
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">{missions.length} Missions Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Mission ID</th>
                <th className="p-3">Assigned Team</th>
                <th className="p-3">Target Sector</th>
                <th className="p-3">Mission Type</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Dispatched</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {missions.map((m) => (
                <tr key={m.id || m.mission_id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono font-bold text-white">{m.mission_id || m.id}</td>
                  <td className="p-3 font-bold text-amber-300">{m.team_name}</td>
                  <td className="p-3">{m.destination_name}</td>
                  <td className="p-3">{m.mission_type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.priority === 'CRITICAL' ? 'bg-red-600/20 text-red-400 border border-red-500/30' :
                      m.priority === 'HIGH' ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {m.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(m.status)}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{m.dispatched_at}</td>
                  <td className="p-3">
                    {m.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleUpdateStatus(m.team_id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px] transition-all"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[10px] font-bold">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Send Rescue Team Dispatch Modal */}
      <SendRescueTeamModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        teams={teams}
        locations={locations}
        initialLocation={dispatchLocation}
        initialTeam={dispatchTeam}
        onDispatch={handleDispatchConfirm}
      />
    </div>
  );
}
