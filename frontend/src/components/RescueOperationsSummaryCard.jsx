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
        return 'bg-[#C62828] text-white font-black animate-pulse';
      case 'ON SITE':
        return 'bg-[#16855B] text-white font-bold';
      case 'EN ROUTE':
        return 'bg-[#D99A00] text-white font-bold';
      case 'ASSIGNED':
        return 'bg-[#1769AA] text-white font-bold';
      case 'COMPLETED':
        return 'bg-[#5B6B78] text-white';
      default:
        return 'bg-[#1769AA] text-white font-bold';
    }
  };

  return (
    <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 font-mono text-[#172B3A] dark:text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1769AA] dark:text-[#38BDF8]">
                STATE SEOC COMMAND & RESCUE FORCES
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40">
                DEMO — SIMULATED GPS
              </span>
            </div>
            <h3 className="text-base font-black text-[#172B3A] dark:text-[#F8FAFC] mt-0.5 flex items-center gap-2">
              <span>🚑 RESCUE OPERATIONS & LIVE TEAM TRACKING</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDispatchModal}
            className="px-3.5 py-1.5 bg-[#1769AA] hover:bg-[#125890] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>+ Send Rescue Team</span>
          </button>

          <button
            onClick={onNavigateRescueOps}
            className="px-3.5 py-1.5 bg-white dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] dark:border-[#38BDF8] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Full Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Key Dashboard Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase tracking-wider block">Active Teams</span>
          <span className="text-xl font-bold text-[#C62828] dark:text-[#F87171] mt-0.5 block">{activeTeams.length}</span>
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">In Field / Assigned</span>
        </div>

        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase tracking-wider block">Active Incidents</span>
          <span className="text-xl font-bold text-[#E87516] dark:text-[#FB923C] mt-0.5 block">{missions.length - completedMissions.length}</span>
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">Target Disasters</span>
        </div>

        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase tracking-wider block">Teams En Route</span>
          <span className="text-xl font-bold text-[#D99A00] dark:text-[#FBBF24] mt-0.5 block">{enRouteTeams.length}</span>
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">Transit in progress</span>
        </div>

        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase tracking-wider block">Available Teams</span>
          <span className="text-xl font-bold text-[#16855B] dark:text-[#34D399] mt-0.5 block">{availableTeams.length}</span>
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">Ready at base</span>
        </div>

        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase tracking-wider block">Completed Missions</span>
          <span className="text-xl font-bold text-[#172B3A] dark:text-[#F8FAFC] mt-0.5 block">{completedMissions.length}</span>
          <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">Successful rescues</span>
        </div>
      </div>

      {/* Active Deployments Mini Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#5B6B78] dark:text-[#94A3B8]">
          <span className="font-bold uppercase tracking-wider">Active Deployments Telemetry:</span>
          <span className="text-[11px] text-[#5B6B78] dark:text-[#94A3B8]">{activeTeams.length} teams deployed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...teams]
            .sort((a, b) => {
              const priorityMap = { EMERGENCY: 1, 'EN ROUTE': 2, 'ON SITE': 3, ASSIGNED: 4, AVAILABLE: 5, COMPLETED: 6 };
              return (priorityMap[a.status] || 9) - (priorityMap[b.status] || 9);
            })
            .map((team) => (
            <div key={team.id || team.team_id} className="p-3.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172B3A] dark:text-[#F8FAFC] text-xs block">{team.name}</span>
                  <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">{team.team_type} ({team.members_count} members)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getStatusBadge(team.status)}`}>
                  {team.status}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-[#172B3A] dark:text-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8]">Destination:</span>
                  <span className="text-[#1769AA] dark:text-[#38BDF8] font-bold truncate max-w-[140px]">{team.destination_name || 'Standby at Base'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5B6B78] dark:text-[#94A3B8]">ETA / Distance:</span>
                  <span className="text-[#172B3A] dark:text-[#F8FAFC] font-bold">{team.eta_minutes > 0 ? `${team.eta_minutes} min` : (team.status === 'ON SITE' ? 'On Site' : 'Standby')} • {team.distance_km} km</span>
                </div>
              </div>

              {/* Status Action Quick Switcher */}
              <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between gap-1 text-[10px]">
                {team.status === 'ASSIGNED' && (
                  <button
                    onClick={() => onUpdateTeamStatus(team.id || team.team_id, 'EN ROUTE')}
                    className="w-full py-1 bg-[#D99A00] hover:bg-[#b88200] text-white font-bold rounded transition-all"
                  >
                    🚀 Start Transit (En Route)
                  </button>
                )}
                {team.status === 'EN ROUTE' && (
                  <button
                    onClick={() => onUpdateTeamStatus(team.id || team.team_id, 'ON SITE')}
                    className="w-full py-1 bg-[#16855B] hover:bg-[#126d4a] text-white font-bold rounded transition-all"
                  >
                    📍 Mark On Site
                  </button>
                )}
                {team.status === 'ON SITE' && (
                  <button
                    onClick={() => onUpdateTeamStatus(team.id || team.team_id, 'COMPLETED')}
                    className="w-full py-1 bg-[#1769AA] hover:bg-[#125890] text-white font-bold rounded transition-all"
                  >
                    ✅ Mark Completed
                  </button>
                )}
                {team.status === 'COMPLETED' && (
                  <span className="text-[#16855B] dark:text-[#34D399] font-bold flex items-center gap-1 mx-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mission Completed
                  </span>
                )}
                {team.status === 'AVAILABLE' && (
                  <span className="text-[#5B6B78] dark:text-[#94A3B8] block text-center w-full">Ready for Dispatch</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
