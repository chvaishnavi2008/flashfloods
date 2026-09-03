import React from 'react';
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
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function RescueOperationsSummaryCard({
  teams = [],
  missions = [],
  onOpenDispatchModal = () => {},
  onNavigateRescueOps = () => {},
  onUpdateTeamStatus = () => {}
}) {
  const activeTeams = teams.filter(t => ['ASSIGNED', 'EN ROUTE', 'ON SITE', 'EMERGENCY'].includes(t.status));
  const enRouteTeams = teams.filter(t => t.status === 'EN ROUTE');
  const availableTeams = teams.filter(t => t.status === 'AVAILABLE');
  const completedMissions = missions.filter(m => m.status === 'COMPLETED');

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
    <section className="bg-[#0B1120] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600/20 text-red-400 border border-red-500/40 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                STATE SEOC COMMAND & RESCUE FORCES
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO — SIMULATED GPS
              </span>
            </div>
            <h3 className="text-base font-black text-white mt-0.5 flex items-center gap-2">
              <span>🚑 RESCUE OPERATIONS & LIVE TEAM TRACKING</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDispatchModal}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>+ Send Rescue Team</span>
          </button>

          <button
            onClick={onNavigateRescueOps}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Full Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Key Dashboard Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="p-3 bg-slate-900/90 border border-red-500/30 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Teams</span>
          <span className="text-xl font-bold text-red-400 mt-0.5 block">{activeTeams.length}</span>
          <span className="text-[10px] text-slate-500">In Field / Assigned</span>
        </div>

        <div className="p-3 bg-slate-900/90 border border-rose-500/30 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Incidents</span>
          <span className="text-xl font-bold text-rose-300 mt-0.5 block">{missions.length - completedMissions.length}</span>
          <span className="text-[10px] text-slate-500">Target Disasters</span>
        </div>

        <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Teams En Route</span>
          <span className="text-xl font-bold text-amber-300 mt-0.5 block">{enRouteTeams.length}</span>
          <span className="text-[10px] text-slate-500">Transit in progress</span>
        </div>

        <div className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Available Teams</span>
          <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{availableTeams.length}</span>
          <span className="text-[10px] text-slate-500">Ready at base</span>
        </div>

        <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Completed Missions</span>
          <span className="text-xl font-bold text-slate-200 mt-0.5 block">{completedMissions.length}</span>
          <span className="text-[10px] text-slate-500">Successful rescues</span>
        </div>
      </div>

      {/* Active Deployments Mini Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider">Active Deployments Telemetry:</span>
          <span className="text-[11px] text-slate-500">{activeTeams.length} teams deployed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...teams]
            .sort((a, b) => {
              const isAActive = ['EMERGENCY', 'EN ROUTE', 'ON SITE', 'ASSIGNED'].includes(a.status);
              const isBActive = ['EMERGENCY', 'EN ROUTE', 'ON SITE', 'ASSIGNED'].includes(b.status);
              if (isAActive && !isBActive) return -1;
              if (!isAActive && isBActive) return 1;
              return 0;
            })
            .slice(0, 6)
            .map((team) => (
            <div key={team.id || team.team_id} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">{team.name}</span>
                  <span className="text-[10px] text-slate-400">{team.team_type} ({team.members_count} members)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getStatusBadge(team.status)}`}>
                  {team.status}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="text-amber-300 font-bold truncate max-w-[140px]">{team.destination_name || 'Standby at Base'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ETA / Distance:</span>
                  <span className="text-white font-bold">{team.eta_minutes > 0 ? `${team.eta_minutes} min` : (team.status === 'ON SITE' ? 'On Site' : 'Standby')} • {team.distance_km} km</span>
                </div>
              </div>

              {/* Status Action Quick Switcher */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1 text-[10px]">
                {team.status === 'ASSIGNED' && (
                  <button
                    onClick={() => onUpdateTeamStatus(team.id || team.team_id, 'EN ROUTE')}
                    className="w-full py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-all"
                  >
                    🚀 Start Transit (En Route)
                  </button>
                )}
                {team.status === 'EN ROUTE' && (
                  <button
                    onClick={() => onUpdateTeamStatus(team.id || team.team_id, 'ON SITE')}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-all"
                  >
                    📍 Mark On Site
                  </button>
                )}
                {team.status === 'ON SITE' && (
                  <button
                    onClick={() => onUpdateTeamStatus(team.id || team.team_id, 'COMPLETED')}
                    className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-all"
                  >
                    ✅ Mark Completed
                  </button>
                )}
                {team.status === 'COMPLETED' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 mx-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mission Completed
                  </span>
                )}
                {team.status === 'AVAILABLE' && (
                  <span className="text-slate-500 block text-center w-full">Ready for Dispatch</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
