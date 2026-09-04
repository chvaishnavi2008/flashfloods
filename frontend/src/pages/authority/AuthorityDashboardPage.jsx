import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import RiskMap from '../../components/RiskMap';
import RescueOperationsSummaryCard from '../../components/RescueOperationsSummaryCard';
import SendRescueTeamModal from '../../components/SendRescueTeamModal';
import AuthoritySosPanel from '../../components/authority/AuthoritySosPanel';
import { rescueService } from '../../services/rescueService';
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
    acknowledgeSos,
    dispatchRescueToSos,
    updateSosStatus,
    resolveSos,
    createDemoSos,
    setActivePage,
    pipelineData,
    environmentalData
  } = useApp();

  const [rescueTeams, setRescueTeams] = useState(() => rescueService.loadTeams());
  const [rescueMissions, setRescueMissions] = useState(() => rescueService.loadMissions());
  const [isRescueDispatchOpen, setIsRescueDispatchOpen] = useState(false);
  const [dispatchLocation, setDispatchLocation] = useState(null);
  const [dispatchTeam, setDispatchTeam] = useState(null);
  const [activeSosForDispatch, setActiveSosForDispatch] = useState(null);

  useEffect(() => {
    const loadRescue = async () => {
      const t = await rescueService.getRescueTeams();
      const m = await rescueService.getRescueMissions();
      setRescueTeams(t);
      setRescueMissions(m);
    };
    loadRescue();
  }, []);

  const handleRescueDispatch = async (data) => {
    const res = await rescueService.dispatchRescueTeam(data);
    setRescueTeams([...rescueService.teams]);
    setRescueMissions([...rescueService.missions]);

    // If this dispatch was triggered for an active SOS ticket, update SOS record and assign team
    if (activeSosForDispatch) {
      await dispatchRescueToSos(
        activeSosForDispatch.sos_id,
        res.team?.id || res.team?.team_id || 'NDRF-01',
        res.team?.name || 'NDRF Team Alpha'
      );
      setActiveSosForDispatch(null);
    }

    setSuccessMsg(`Rescue Team ${res.team?.name || 'Unit'} assigned & dispatched to ${res.team?.destination_name || 'Target Sector'}!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleOpenDispatchForSos = (sos) => {
    setActiveSosForDispatch(sos);
    const matchLoc = locations.find(l => 
      l.id === sos.id || 
      (sos.location_name && l.name && sos.location_name.toLowerCase().includes(l.name.toLowerCase()))
    ) || { 
      id: sos.id || 1, 
      name: sos.location_name, 
      lat: sos.location_latitude || sos.lat || 30.4124, 
      lng: sos.location_longitude || sos.lng || 79.3198 
    };
    setDispatchLocation(matchLoc);
    setIsRescueDispatchOpen(true);
  };

  const handleUpdateRescueTeamStatus = async (teamId, newStatus) => {
    await rescueService.updateTeamStatus(teamId, newStatus);
    setRescueTeams([...rescueService.teams]);
    setRescueMissions([...rescueService.missions]);
  };

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

  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null);

  // Dynamic Priority Incidents sorted by Composite Severity Score & Critical Thresholds
  const priorityIncidents = useMemo(() => {
    if (!locations || locations.length === 0) return [];

    return locations
      .filter(loc => {
        const level = loc.current_risk?.overall_level;
        const score = loc.current_risk?.overall_score || 0;
        return level === 'CRITICAL' || level === 'HIGH' || score >= 50;
      })
      .sort((a, b) => {
        const scoreA = a.current_risk?.overall_score || 0;
        const scoreB = b.current_risk?.overall_score || 0;
        return scoreB - scoreA;
      })
      .map((loc) => {
        const risk = loc.current_risk || {};
        const score = risk.overall_score || 50;
        const level = risk.overall_level || (score >= 76 ? 'CRITICAL' : 'HIGH');
        const dominant = (risk.dominant_hazard || 'flash_flood')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        return {
          id: `INC-${loc.id}`,
          location: loc.name,
          state: loc.state,
          locationId: loc.id,
          hazard: dominant,
          riskScore: score,
          severity: level,
          populationAtRisk: (loc.population || 12000).toLocaleString(),
          status: level === 'CRITICAL' ? 'ACTIVE' : 'MONITORING',
          rawLoc: loc
        };
      });
  }, [locations]);

  const handleViewIncident = (inc) => {
    selectLocation(inc.locationId);
    const fullLoc = locations.find(l => l.id === inc.locationId) || inc.rawLoc;
    setSelectedIncidentModal({ ...inc, fullLoc });
  };

  // Operational Field Response Units
  const responseUnits = [
    { id: 'SDRF-UK-01', name: 'SDRF 1st Bn Platoon A', location: 'Chamoli', status: 'DEPLOYED', tasks: 'Riverbank Evacuation', strength: '24 Personnel' },
    { id: 'NDRF-14-BN', name: '14th NDRF Urban Rescue', location: 'Joshimath', status: 'DEPLOYED', tasks: 'Landslide Clearance', strength: '32 Personnel' },
    { id: 'SDRF-HP-04', name: 'SDRF Mountain Rescue', location: 'Kullu', status: 'AVAILABLE', tasks: 'Standby at Base', strength: '18 Personnel' },
    { id: 'MED-AIR-02', name: 'State Disaster Medical Unit', location: 'Dehradun', status: 'AVAILABLE', tasks: 'Air Ambulance Standby', strength: '8 Doctors' }
  ];

  return (
    <div className="space-y-4 pb-12 font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
      {/* ========================================================================= */}
      {/* 1. OPERATIONAL STATISTICS STRIP (Government-Dashboard KPIs)                */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-center">
          <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
            <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase tracking-wider block">MONITORED SECTORS</span>
            <span className="text-base font-bold text-[#172B3A] dark:text-[#F8FAFC] mt-0.5 block">31</span>
          </div>

          <div className="p-2 bg-[#FFF1F1] dark:bg-[#3B1219]/60 border border-[#C62828]/40 dark:border-[#C62828]/60 rounded">
            <span className="text-[10px] text-[#C62828] dark:text-[#F87171] uppercase tracking-wider block">CRITICAL ZONES</span>
            <span className="text-base font-bold text-[#C62828] dark:text-[#F87171] mt-0.5 block">5</span>
          </div>

          <div className="p-2 bg-[#FFF7E6] dark:bg-[#3A280B]/60 border border-[#D99A00]/40 dark:border-[#D99A00]/60 rounded">
            <span className="text-[10px] text-[#D99A00] dark:text-[#FBBF24] uppercase tracking-wider block">ACTIVE MISSIONS</span>
            <span className="text-base font-bold text-[#D99A00] dark:text-[#FBBF24] mt-0.5 block">
              {rescueTeams.filter(t => ['EN ROUTE', 'ON SITE', 'ASSIGNED', 'EMERGENCY'].includes(t.status)).length} IN FIELD
            </span>
          </div>

          <div className="p-2 bg-[#FFF1F1] dark:bg-[#3B1219]/60 border border-[#C62828]/40 dark:border-[#C62828]/60 rounded">
            <span className="text-[10px] text-[#C62828] dark:text-[#F87171] uppercase tracking-wider block">URGENT SOS</span>
            <span className="text-base font-bold text-[#C62828] dark:text-[#F87171] mt-0.5 block">{pendingSosCount}</span>
          </div>

          <div className="p-2 bg-[#EAF7F1] dark:bg-[#0B3322]/60 border border-[#16855B]/40 dark:border-[#16855B]/60 rounded">
            <span className="text-[10px] text-[#16855B] dark:text-[#34D399] uppercase tracking-wider block">RESPONSE UNITS</span>
            <span className="text-base font-bold text-[#16855B] dark:text-[#34D399] mt-0.5 block">
              {rescueTeams.filter(t => t.status === 'AVAILABLE').length} AVAILABLE
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-2.5 bg-[#EAF7F1] dark:bg-[#0B3322]/70 border border-[#16855B] dark:border-[#16855B]/80 text-[#16855B] dark:text-[#34D399] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16855B] dark:text-[#34D399]" />
            <span className="font-bold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-[#5B6B78] dark:text-[#94A3B8] hover:text-[#172B3A] dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Command Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl shadow-sm text-[#172B3A] dark:text-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
          <span className="text-xs font-bold text-[#172B3A] dark:text-[#F8FAFC] uppercase tracking-wider">STATE EMERGENCY OPERATION CENTER ACTIONS</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('risk-intelligence')}
            className="px-3 py-1.5 bg-white dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] border border-[#1769AA] dark:border-[#38BDF8] text-[#1769AA] dark:text-[#38BDF8] rounded font-bold flex items-center gap-1.5 shadow-sm transition-all text-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Risk Intelligence Map</span>
          </button>
          <button
            onClick={() => setIsRescueDispatchOpen(true)}
            className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#125890] text-white rounded font-bold flex items-center gap-1.5 shadow-sm transition-all text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>+ Dispatch Rescue Team</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME CITIZEN SOS DISTRESS QUEUE PANEL */}
      <AuthoritySosPanel
        sosRequests={sosRequests}
        onAcknowledge={acknowledgeSos}
        onOpenDispatch={handleOpenDispatchForSos}
        onResolve={resolveSos}
        onCreateDemoSos={createDemoSos}
        onSelectSosLocation={(sos) => {
          const matchLoc = locations.find(l => 
            (sos.location_name && l.name && sos.location_name.toLowerCase().includes(l.name.toLowerCase()))
          );
          if (matchLoc) selectLocation(matchLoc.id);
          setActivePage('risk-intelligence');
        }}
      />

      {/* RESCUE OPERATIONS & LIVE TEAM TRACKING WORKSPACE CARD */}
      <RescueOperationsSummaryCard
        teams={rescueTeams}
        missions={rescueMissions}
        onOpenDispatchModal={() => setIsRescueDispatchOpen(true)}
        onNavigateRescueOps={() => setActivePage('rescue-operations')}
        onUpdateTeamStatus={handleUpdateRescueTeamStatus}
      />

      {/* ========================================================================= */}
      {/* 3. PRIORITY INCIDENTS TABLE (Government-Style Operational Grid)            */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-4 shadow-sm space-y-3 text-[#172B3A] dark:text-[#E2E8F0]">
        <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C62828] dark:text-[#F87171]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B3A] dark:text-[#F8FAFC]">
              PRIORITY INCIDENTS
            </h2>
          </div>
          <span className="text-[#5B6B78] dark:text-[#94A3B8] text-[11px]">Sorted by Composite Severity Index</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAFC] dark:bg-[#0B1528] text-[#5B6B78] dark:text-[#94A3B8] uppercase text-[10px] border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <tr>
                <th className="p-2.5">Location</th>
                <th className="p-2.5">Hazard</th>
                <th className="p-2.5 text-center">Risk Score</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5 text-right">Population at Risk</th>
                <th className="p-2.5 text-center">Assigned Rescue Unit</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E0E7] dark:divide-[#1E2E4A] text-[11px]">
              {priorityIncidents.map((inc) => {
                const assignedTeam = rescueTeams.find(t => 
                  (t.assigned_location_id && Number(t.assigned_location_id) === Number(inc.locationId)) || 
                  (t.destination_name && t.destination_name.toLowerCase().includes(inc.location.toLowerCase()))
                );

                return (
                  <tr key={inc.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#172B4D]/30 transition-colors">
                    <td className="p-2.5 font-bold text-[#172B3A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C62828]" />
                      <span>{inc.location}, {inc.state}</span>
                    </td>
                    <td className="p-2.5 text-[#5B6B78] dark:text-[#94A3B8]">{inc.hazard}</td>
                    <td className="p-2.5 text-center font-bold">
                      <span className={inc.riskScore >= 76 ? 'text-[#C62828] dark:text-[#F87171]' : 'text-[#E87516] dark:text-[#FB923C]'}>
                        {inc.riskScore}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40' : 'bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-[#172B3A] dark:text-[#F8FAFC]">{inc.populationAtRisk}</td>

                    {/* Assigned Rescue Unit */}
                    <td className="p-2.5 text-center">
                      {assignedTeam ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            assignedTeam.status === 'EN ROUTE' ? 'bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40' :
                            assignedTeam.status === 'ON SITE' ? 'bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/40' :
                            assignedTeam.status === 'EMERGENCY' ? 'bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40' :
                            'bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/40'
                          }`}>
                            <span>🚑 {assignedTeam.name.split(' (')[0]}</span>
                            <span className="font-mono text-[9px] opacity-80">[{assignedTeam.status}]</span>
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const loc = locations.find(l => l.id === inc.locationId) || { id: inc.locationId, name: inc.location };
                            setDispatchLocation(loc);
                            setIsRescueDispatchOpen(true);
                          }}
                          className="px-2 py-0.5 bg-[#FFF1F1] dark:bg-[#3B1219] hover:bg-[#C62828] hover:text-white text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40 rounded text-[10px] font-bold flex items-center gap-1 mx-auto transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>Assign Team</span>
                        </button>
                      )}
                    </td>

                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        assignedTeam ? 'bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/40' : 'bg-[#F8FAFC] dark:bg-[#0B1528] text-[#5B6B78] dark:text-[#94A3B8] border border-[#D7E0E7] dark:border-[#1E2E4A]'
                      }`}>
                        {assignedTeam ? (assignedTeam.status === 'ON SITE' ? 'ON SITE' : 'DEPLOYED') : inc.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleViewIncident(inc)}
                        className="px-2.5 py-1 bg-white dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] dark:border-[#38BDF8] rounded text-[10px] font-bold transition-all flex items-center gap-1 ml-auto shadow-sm"
                        title="Inspect Live Threat Dossier & Telemetry"
                      >
                        <Eye className="w-3 h-3" />
                        <span>VIEW</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TWO-COLUMN SPLIT: IMPACT ASSESSMENT & EMERGENCY RESPONSE LOGISTICS     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Impact Assessment Matrix (6 cols) */}
        <section className="lg:col-span-6 bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-4 shadow-sm space-y-3 text-[#172B3A] dark:text-[#E2E8F0]">
          <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B3A] dark:text-[#F8FAFC]">
                IMPACT ASSESSMENT
              </h2>
            </div>
            <button
              onClick={() => setActivePage('impact-assessment')}
              className="text-[11px] text-[#1769AA] dark:text-[#38BDF8] font-bold hover:underline"
            >
              Detailed Breakdown
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[#172B3A] dark:text-[#E2E8F0] text-[11px]">
            <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">Population at Risk</span>
              <strong className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC]">12,400</strong>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">Roads Affected</span>
              <strong className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC]">7 Segments</strong>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">Bridges at Risk</span>
              <strong className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC]">2 Bridges</strong>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">Schools & Hospitals</span>
              <strong className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC]">4 Schools, 1 Hospital</strong>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">Critical Infrastructure</span>
              <strong className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC]">14 Key Utilities</strong>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">Shelter Capacity</span>
              <strong className="text-sm font-bold text-[#16855B] dark:text-[#34D399]">18 Active (3,400 spots)</strong>
            </div>
          </div>
        </section>

        {/* Field Rescue & Response Units Allocation (6 cols) */}
        <section className="lg:col-span-6 bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl p-4 shadow-sm space-y-3 text-[#172B3A] dark:text-[#E2E8F0]">
          <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#16855B] dark:text-[#34D399]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B3A] dark:text-[#F8FAFC]">
                FIELD RESCUE & UNIT DEPLOYMENTS
              </h2>
            </div>
            <button
              onClick={() => {
                setDispatchLocation(null);
                setDispatchTeam(null);
                setIsRescueDispatchOpen(true);
              }}
              className="text-[11px] text-[#1769AA] dark:text-[#38BDF8] hover:underline font-bold"
            >
              + Dispatch Team
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pb-1">
            <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">ACTIVE DEPLOYMENTS</span>
              <strong className="text-sm font-bold text-[#D99A00] dark:text-[#FBBF24]">
                {rescueTeams.filter(t => ['EN ROUTE', 'ASSIGNED', 'EMERGENCY', 'ON SITE'].includes(t.status)).length} In Field
              </strong>
            </div>
            <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded">
              <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] block uppercase">AVAILABLE UNITS</span>
              <strong className="text-sm font-bold text-[#16855B] dark:text-[#34D399]">
                {rescueTeams.filter(t => t.status === 'AVAILABLE').length} Ready at Base
              </strong>
            </div>
          </div>

          {/* Dynamic Units List */}
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {[...rescueTeams]
              .sort((a, b) => (a.status !== 'AVAILABLE' ? -1 : 1))
              .map((u) => (
                <div key={u.id || u.team_id} className="p-2 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded flex items-center justify-between text-[11px]">
                  <div>
                    <strong className="text-[#172B3A] dark:text-[#F8FAFC] block">{u.name}</strong>
                    <span className="text-[#5B6B78] dark:text-[#94A3B8] text-[10px]">
                      Sector: <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{u.destination_name || u.base_station}</strong> • {u.team_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'EMERGENCY' ? 'bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40' :
                      u.status === 'ON SITE' ? 'bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/40' :
                      u.status === 'EN ROUTE' ? 'bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40' :
                      u.status === 'ASSIGNED' ? 'bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/40' :
                      'bg-[#F8FAFC] dark:bg-[#0B1528] text-[#5B6B78] dark:text-[#94A3B8] border border-[#D7E0E7] dark:border-[#1E2E4A]'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-[11px] text-[#5B6B78] dark:text-[#94A3B8] flex items-center justify-between">
            <span>Rescue Command Frequency: <strong>VHF Ch 16</strong></span>
            <span className="text-[#16855B] dark:text-[#34D399] font-bold">Live GPS Synchronized</span>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 6. ADMINISTRATIVE WARNING WORKFLOW MODAL                                  */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5 space-y-4 shadow-xl text-[#172B3A] dark:text-[#E2E8F0]">
            <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C62828] dark:text-[#F87171]" />
                <h3 className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC] uppercase">
                  ISSUE EMERGENCY WARNING
                </h3>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-[#5B6B78] dark:text-[#94A3B8] hover:text-[#172B3A] dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#172B3A] dark:text-[#E2E8F0] mb-1 font-semibold">Target Area</label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2 text-[#172B3A] dark:text-[#F8FAFC] font-bold"
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
                  <label className="block text-[#172B3A] dark:text-[#E2E8F0] mb-1 font-semibold">Hazard</label>
                  <select
                    name="hazard_type"
                    value={formData.hazard_type}
                    onChange={handleInputChange}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2 text-[#172B3A] dark:text-[#F8FAFC]"
                  >
                    <option value="Flash Flood">Flash Flood</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Heavy Rainfall">Heavy Rainfall</option>
                    <option value="Riverine Flood">Riverine Flood</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#172B3A] dark:text-[#E2E8F0] mb-1 font-semibold">Severity</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2 text-[#C62828] dark:text-[#F87171] font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (Emergency Warning)</option>
                    <option value="HIGH">HIGH (Warning)</option>
                    <option value="MODERATE">MODERATE (Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#172B3A] dark:text-[#E2E8F0] mb-1 font-semibold">Warning Directive Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. 🚨 CRITICAL FLASH FLOOD WARNING: Alaknanda Basin"
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2 text-[#172B3A] dark:text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#172B3A] dark:text-[#E2E8F0] mb-1 font-semibold">Message</label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Official instructions for citizen evacuation and emergency teams..."
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2 text-[#172B3A] dark:text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#172B3A] dark:text-[#E2E8F0] mb-1 font-semibold">Validity Period</label>
                <input
                  type="number"
                  name="validity_hours"
                  value={formData.validity_hours}
                  onChange={handleInputChange}
                  placeholder="12 Hours"
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2 text-[#172B3A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="p-2 bg-[#FFF7E6] dark:bg-[#3A280B] border border-[#D99A00]/40 rounded text-[#D99A00] dark:text-[#FBBF24] text-[10px] font-bold">
                SIMULATION / DEMO: Dispatches to prototype alert feeds and citizen in-app notification system.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A]">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] dark:border-[#38BDF8] rounded-lg font-bold"
                >
                  PREVIEW WARNING
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#C62828] hover:bg-[#a82222] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl max-w-lg w-full p-5 space-y-3 shadow-xl text-[#172B3A] dark:text-[#E2E8F0]">
            <h4 className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC] uppercase border-b border-[#D7E0E7] dark:border-[#1E2E4A] pb-2">
              PREVIEW: OFFICIAL EMERGENCY DIRECTIVE
            </h4>
            <div className="p-3 bg-[#FFF1F1] dark:bg-[#3B1219] border border-[#C62828] rounded-xl text-xs space-y-2">
              <strong className="text-[#C62828] dark:text-[#F87171] block text-sm">{formData.title || '🚨 EMERGENCY FLASH FLOOD WARNING'}</strong>
              <p className="text-[#172B3A] dark:text-[#E2E8F0]">{formData.message || 'Evacuate low-lying river areas immediately. Head toward designated safe shelters.'}</p>
              <div className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] pt-2 border-t border-[#C62828]/20 flex justify-between">
                <span>Issued by: {formData.issued_by}</span>
                <span>Validity: {formData.validity_hours}h</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3 py-1 bg-[#F8FAFC] dark:bg-[#0B1528] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] dark:border-[#38BDF8] rounded font-bold"
              >
                Back to Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Rescue Team Dispatch Modal */}
      <SendRescueTeamModal
        isOpen={isRescueDispatchOpen}
        onClose={() => {
          setIsRescueDispatchOpen(false);
          setDispatchLocation(null);
          setDispatchTeam(null);
        }}
        teams={rescueTeams}
        locations={locations}
        initialLocation={dispatchLocation}
        initialTeam={dispatchTeam}
        onDispatch={handleRescueDispatch}
      />

      {/* ========================================================================= */}
      {/* 7. INCIDENT DOSSIER INSPECTOR MODAL (When VIEW button is clicked)          */}
      {/* ========================================================================= */}
      {selectedIncidentModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  selectedIncidentModal.severity === 'CRITICAL' ? 'bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border-[#C62828]/40' : 'bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border-[#D99A00]/40'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#C62828] dark:text-[#F87171] uppercase tracking-widest">
                      SEOC INCIDENT DOSSIER: {selectedIncidentModal.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedIncidentModal.severity === 'CRITICAL' ? 'bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/50' : 'bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/50'
                    }`}>
                      {selectedIncidentModal.severity} ({selectedIncidentModal.riskScore}/100)
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#172B3A] dark:text-[#F8FAFC] mt-0.5">
                    {selectedIncidentModal.location}, {selectedIncidentModal.state}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedIncidentModal(null)}
                className="p-1.5 text-[#5B6B78] dark:text-[#94A3B8] hover:text-[#172B3A] dark:hover:text-white bg-[#F8FAFC] dark:bg-[#0B1528] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A] transition-all"
              >
                ✕
              </button>
            </div>

            {/* 4 Environmental Telemetry Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
                <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase block">Threat Hazard</span>
                <strong className="text-[#172B3A] dark:text-[#F8FAFC] text-xs block mt-0.5">{selectedIncidentModal.hazard}</strong>
                <span className="text-[10px] text-[#C62828] dark:text-[#F87171] font-bold">Score: {selectedIncidentModal.riskScore}%</span>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
                <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase block">Rainfall Rate</span>
                <strong className="text-[#1769AA] dark:text-[#38BDF8] text-xs block mt-0.5">
                  {selectedIncidentModal.fullLoc?.environmental_data?.rainfall_mm || 78.0} mm
                </strong>
                <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">
                  {selectedIncidentModal.fullLoc?.environmental_data?.rainfall_intensity || 'Heavy Downpour'}
                </span>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
                <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase block">River Stage</span>
                <strong className="text-[#D99A00] dark:text-[#FBBF24] text-xs block mt-0.5">
                  {selectedIncidentModal.fullLoc?.environmental_data?.river_level_m || 4.9} m
                </strong>
                <span className="text-[10px] text-[#D99A00] dark:text-[#FBBF24]">
                  {selectedIncidentModal.fullLoc?.environmental_data?.river_trend || 'Rising'}
                </span>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl">
                <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase block">Soil Saturation</span>
                <strong className="text-[#16855B] dark:text-[#34D399] text-xs block mt-0.5">
                  {selectedIncidentModal.fullLoc?.environmental_data?.soil_saturation_pct || 78}%
                </strong>
                <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8]">
                  Slope: {selectedIncidentModal.fullLoc?.environmental_data?.slope_deg || 34}°
                </span>
              </div>
            </div>

            {/* AI Warning Analysis & Contributing Factors */}
            <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#D99A00] dark:text-[#FBBF24] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>AI Early Warning Directive:</span>
                </span>
                <span className="text-[10px] text-[#16855B] dark:text-[#34D399] font-bold">
                  Est. Lead Time: ~{selectedIncidentModal.fullLoc?.current_risk?.lead_time_minutes || 30} mins
                </span>
              </div>
              <p className="text-xs text-[#172B3A] dark:text-[#E2E8F0] leading-relaxed font-sans">
                {selectedIncidentModal.fullLoc?.current_risk?.recommended_action || "Immediate evacuation of riverbank floodplains; move uphill to designated relief havens."}
              </p>
              {selectedIncidentModal.fullLoc?.current_risk?.ai_explanation && (
                <p className="text-[11px] text-[#5B6B78] dark:text-[#94A3B8] italic">
                  "{selectedIncidentModal.fullLoc.current_risk.ai_explanation}"
                </p>
              )}
            </div>

            {/* Assigned Rescue Column Information */}
            {(() => {
              const assignedTeam = rescueTeams.find(t => 
                (t.assigned_location_id && Number(t.assigned_location_id) === Number(selectedIncidentModal.locationId)) || 
                (t.destination_name && t.destination_name.toLowerCase().includes(selectedIncidentModal.location.toLowerCase()))
              );

              return (
                <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#5B6B78] dark:text-[#94A3B8] uppercase block">Assigned Rescue Force:</span>
                    {assignedTeam ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC]">🚑 {assignedTeam.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          assignedTeam.status === 'EN ROUTE' ? 'bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40' :
                          assignedTeam.status === 'ON SITE' ? 'bg-[#EAF7F1] dark:bg-[#0B3322] text-[#16855B] dark:text-[#34D399] border border-[#16855B]/40' :
                          'bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/40'
                        }`}>
                          {assignedTeam.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#D99A00] dark:text-[#FBBF24] font-bold text-xs mt-0.5 block">
                        ⚠️ No Column Dispatched Yet
                      </span>
                    )}
                  </div>

                  {assignedTeam ? (
                    <div className="text-right text-[11px] text-[#5B6B78] dark:text-[#94A3B8]">
                      <span>ETA: <strong className="text-[#16855B] dark:text-[#34D399]">{assignedTeam.eta_minutes > 0 ? `${assignedTeam.eta_minutes} min` : 'On Site'}</strong></span>
                      <span className="block text-[#5B6B78] dark:text-[#94A3B8]">{assignedTeam.members_count} Personnel • {assignedTeam.team_type}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setDispatchLocation(selectedIncidentModal.fullLoc || { id: selectedIncidentModal.locationId, name: selectedIncidentModal.location });
                        setSelectedIncidentModal(null);
                        setIsRescueDispatchOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#C62828] hover:bg-[#a82222] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Rescue Team</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Quick Command Actions */}
            <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const loc = selectedIncidentModal.fullLoc || locations.find(l => l.id === selectedIncidentModal.locationId);
                    setFormData(prev => ({
                      ...prev,
                      location_id: loc?.id || 1,
                      hazard_type: loc?.current_risk?.dominant_hazard?.replace('_', ' ') || 'Flash Flood',
                      title: `EMERGENCY ALERT: Severe ${loc?.name || selectedIncidentModal.location} Threat Warning`
                    }));
                    setSelectedIncidentModal(null);
                    setIsBroadcastModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#C62828] hover:bg-[#a82222] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Issue Official Alert</span>
                </button>

                <button
                  onClick={() => {
                    selectLocation(selectedIncidentModal.locationId);
                    setSelectedIncidentModal(null);
                    setActivePage('risk-intelligence');
                  }}
                  className="px-3.5 py-2 bg-white dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#1769AA] dark:text-[#38BDF8] font-bold rounded-xl text-xs flex items-center gap-1.5 border border-[#1769AA] dark:border-[#38BDF8] transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inspect on Map</span>
                </button>

                <button
                  onClick={() => {
                    selectLocation(selectedIncidentModal.locationId);
                    setSelectedIncidentModal(null);
                    setActivePage('safe-locations');
                  }}
                  className="px-3.5 py-2 bg-[#16855B] hover:bg-[#126d4a] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Evacuation Routes</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedIncidentModal(null)}
                className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#0B1528] hover:bg-[#E8F2F8] dark:hover:bg-[#172B4D] text-[#5B6B78] dark:text-[#94A3B8] hover:text-[#172B3A] dark:hover:text-white border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
