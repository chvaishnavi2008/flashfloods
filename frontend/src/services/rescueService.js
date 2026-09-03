/**
 * PralayWatch Rescue Operations & Live Team Tracking Service
 * Supports both real backend API calls and self-healing local reactive simulation store for prototype/demo.
 */

const STORAGE_KEY = 'pralaywatch_rescue_teams_v2';
const STORAGE_MISSIONS_KEY = 'pralaywatch_rescue_missions_v2';

export const INITIAL_RESCUE_TEAMS = [
  {
    id: "NDRF-01",
    team_id: "NDRF-01",
    name: "NDRF Team Alpha (11th Bn)",
    team_type: "Flood & Aquatic Rescue",
    members_count: 18,
    contact_phone: "+91 94120-11001",
    status: "EN ROUTE",
    base_station: "Rishikesh Staging Base",
    latitude: 30.3800,
    longitude: 79.2800,
    assigned_location_id: 1,
    destination_name: "Chamoli (Alaknanda Basin)",
    mission_id: "MSN-2026-001",
    mission_type: "Flood Rescue",
    priority: "HIGH",
    eta_minutes: 18,
    distance_km: 8.4,
    notes: "Deploying 4 Zodiac motorboats & swift-water sonar gear to floodplain sector.",
    is_simulated: true,
    last_updated: "30 sec ago",
    waypoints: [
      [30.3400, 79.2200],
      [30.3650, 79.2550],
      [30.3800, 79.2800],
      [30.4000, 79.3050],
      [30.4124, 79.3198]
    ],
    current_waypoint_idx: 2
  },
  {
    id: "SDRF-02",
    team_id: "SDRF-02",
    name: "SDRF Mountain Strike Bravo",
    team_type: "Landslide Search & Rescue",
    members_count: 14,
    contact_phone: "+91 94120-11002",
    status: "ON SITE",
    base_station: "Helang Forward Post",
    latitude: 30.5539,
    longitude: 79.5658,
    assigned_location_id: 2,
    destination_name: "Joshimath Sunil Ward",
    mission_id: "MSN-2026-002",
    mission_type: "Landslide Rescue",
    priority: "CRITICAL",
    eta_minutes: 0,
    distance_km: 0.0,
    notes: "Extricating residents from cracked residential masonry. Securing slope safety lines.",
    is_simulated: true,
    last_updated: "1 min ago",
    waypoints: [
      [30.5300, 79.5400],
      [30.5420, 79.5520],
      [30.5539, 79.5658]
    ],
    current_waypoint_idx: 2
  },
  {
    id: "ITBP-03",
    team_id: "ITBP-03",
    name: "ITBP Alpine Quick Response Charlie",
    team_type: "Alpine Evacuation & Medical",
    members_count: 16,
    contact_phone: "+91 94120-11003",
    status: "ASSIGNED",
    base_station: "Guptkashi Mountain Depot",
    latitude: 30.5200,
    longitude: 79.0700,
    assigned_location_id: 3,
    destination_name: "Kedarnath Mandakini Corridor",
    mission_id: "MSN-2026-003",
    mission_type: "Evacuation",
    priority: "CRITICAL",
    eta_minutes: 35,
    distance_km: 18.2,
    notes: "Preparing high-altitude stretcher transit and oxygen supply lines for upper ridge.",
    is_simulated: true,
    last_updated: "2 mins ago",
    waypoints: [
      [30.5200, 79.0700],
      [30.5800, 79.0700],
      [30.6600, 79.0680],
      [30.7346, 79.0669]
    ],
    current_waypoint_idx: 0
  },
  {
    id: "NDRF-04",
    team_id: "NDRF-04",
    name: "NDRF Western Ghats Unit Delta",
    team_type: "Heavy Debris & Canine USAR",
    members_count: 22,
    contact_phone: "+91 94120-11004",
    status: "EN ROUTE",
    base_station: "Kalpetta Emergency Depot",
    latitude: 11.5800,
    longitude: 76.1000,
    assigned_location_id: 22,
    destination_name: "Wayanad (Meppadi / Chooralmala)",
    mission_id: "MSN-2026-004",
    mission_type: "Search & Rescue",
    priority: "CRITICAL",
    eta_minutes: 12,
    distance_km: 4.5,
    notes: "Equipped with ground penetrating radar (GPR) and victim location cameras.",
    is_simulated: true,
    last_updated: "45 sec ago",
    waypoints: [
      [11.6050, 76.0800],
      [11.5800, 76.1000],
      [11.5650, 76.1150],
      [11.5534, 76.1264]
    ],
    current_waypoint_idx: 1
  },
  {
    id: "CDC-05",
    team_id: "CDC-05",
    name: "Civil Defence Corps Unit Echo",
    team_type: "Logistics & Relief Supply",
    members_count: 12,
    contact_phone: "+91 94120-11005",
    status: "AVAILABLE",
    base_station: "Dehradun Central Store",
    latitude: 30.3165,
    longitude: 78.0322,
    assigned_location_id: null,
    destination_name: null,
    mission_id: null,
    mission_type: null,
    priority: "LOW",
    eta_minutes: 0,
    distance_km: 0.0,
    notes: "Ready with 500 ration packs, water purification units, and heavy emergency tents.",
    is_simulated: true,
    last_updated: "5 mins ago",
    waypoints: [],
    current_waypoint_idx: 0
  },
  {
    id: "ARMY-06",
    team_id: "ARMY-06",
    name: "Indian Army Disaster Relief Column Foxtrot",
    team_type: "Amphibious Riverine Evacuation",
    members_count: 26,
    contact_phone: "+91 94120-11006",
    status: "AVAILABLE",
    base_station: "Kullu Cantonment",
    latitude: 31.9579,
    longitude: 77.1095,
    assigned_location_id: null,
    destination_name: null,
    mission_id: null,
    mission_type: null,
    priority: "LOW",
    eta_minutes: 0,
    distance_km: 0.0,
    notes: "On standby with 3 BAUT assault boats and combat engineer bridge kits.",
    is_simulated: true,
    last_updated: "10 mins ago",
    waypoints: [],
    current_waypoint_idx: 0
  }
];

export const INITIAL_MISSIONS = [
  {
    id: "MSN-2026-001",
    mission_id: "MSN-2026-001",
    team_id: "NDRF-01",
    team_name: "NDRF Team Alpha (11th Bn)",
    location_id: 1,
    destination_name: "Chamoli (Alaknanda Basin)",
    mission_type: "Flood Rescue",
    priority: "HIGH",
    status: "EN ROUTE",
    notes: "Deploying 4 Zodiac motorboats & swift-water sonar gear to floodplain sector.",
    dispatched_at: "35 mins ago",
    completed_at: null
  },
  {
    id: "MSN-2026-002",
    mission_id: "MSN-2026-002",
    team_id: "SDRF-02",
    team_name: "SDRF Mountain Strike Bravo",
    location_id: 2,
    destination_name: "Joshimath Sunil Ward",
    mission_type: "Landslide Rescue",
    priority: "CRITICAL",
    status: "ON SITE",
    notes: "Extricating residents from cracked residential masonry. Securing slope safety lines.",
    dispatched_at: "1 hour ago",
    completed_at: null
  },
  {
    id: "MSN-2026-003",
    mission_id: "MSN-2026-003",
    team_id: "ITBP-03",
    team_name: "ITBP Alpine Quick Response Charlie",
    location_id: 3,
    destination_name: "Kedarnath Mandakini Corridor",
    mission_type: "Evacuation",
    priority: "CRITICAL",
    status: "ASSIGNED",
    notes: "Preparing high-altitude stretcher transit and oxygen supply lines for upper ridge.",
    dispatched_at: "15 mins ago",
    completed_at: null
  },
  {
    id: "MSN-2026-004",
    mission_id: "MSN-2026-004",
    team_id: "NDRF-04",
    team_name: "NDRF Western Ghats Unit Delta",
    location_id: 22,
    destination_name: "Wayanad (Meppadi / Chooralmala)",
    mission_type: "Search & Rescue",
    priority: "CRITICAL",
    status: "EN ROUTE",
    notes: "Equipped with ground penetrating radar (GPR) and victim location cameras.",
    dispatched_at: "45 mins ago",
    completed_at: null
  }
];

class RescueService {
  constructor() {
    this.teams = this.loadTeams();
    this.missions = this.loadMissions();
  }

  loadTeams() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read stored rescue teams", e);
    }
    return INITIAL_RESCUE_TEAMS.map(t => ({ ...t }));
  }

  saveTeams(teams) {
    this.teams = teams;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch (e) {
      console.warn("Could not save rescue teams to storage", e);
    }
  }

  loadMissions() {
    try {
      const stored = localStorage.getItem(STORAGE_MISSIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read stored missions", e);
    }
    return INITIAL_MISSIONS.map(m => ({ ...m }));
  }

  saveMissions(missions) {
    this.missions = missions;
    try {
      localStorage.setItem(STORAGE_MISSIONS_KEY, JSON.stringify(missions));
    } catch (e) {
      console.warn("Could not save missions to storage", e);
    }
  }

  async getRescueTeams() {
    try {
      const res = await fetch('/api/rescue-teams', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.teams && data.teams.length > 0) {
          // Normalize statuses to match UI constants
          const normalized = data.teams.map(t => ({
            ...t,
            status: t.status.replace('_', ' ')
          }));
          this.saveTeams(normalized);
          return normalized;
        }
      }
    } catch (e) {
      // Offline / static host fallback
    }
    return this.teams;
  }

  async getRescueMissions() {
    try {
      const res = await fetch('/api/rescue-missions', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.missions && data.missions.length > 0) {
          this.saveMissions(data.missions);
          return data.missions;
        }
      }
    } catch (e) {
      // Offline / static host fallback
    }
    return this.missions;
  }

  async dispatchRescueTeam({ teamId, locationId, destinationName, destinationLat, destinationLng, missionType, priority, notes }) {
    const teams = [...this.teams];
    const teamIdx = teams.findIndex(t => t.id === teamId || t.team_id === teamId);
    if (teamIdx === -1) throw new Error("Team not found");

    const team = teams[teamIdx];
    const missionId = `MSN-${Date.now()}`;

    // Create waypoints from current team position to target destination
    const startLat = team.latitude;
    const startLng = team.longitude;
    const targetLat = destinationLat || startLat + 0.05;
    const targetLng = destinationLng || startLng + 0.05;

    const mid1 = [startLat + (targetLat - startLat) * 0.33, startLng + (targetLng - startLng) * 0.33];
    const mid2 = [startLat + (targetLat - startLat) * 0.66, startLng + (targetLng - startLng) * 0.66];
    const waypoints = [[startLat, startLng], mid1, mid2, [targetLat, targetLng]];

    // Approx distance in km
    const distKm = Math.round(Math.sqrt(Math.pow((targetLat - startLat) * 111, 2) + Math.pow((targetLng - startLng) * 111, 2)) * 10) / 10 || 8.5;
    const etaMins = Math.max(10, Math.round(distKm * 2.5));

    const updatedTeam = {
      ...team,
      status: "ASSIGNED",
      mission_id: missionId,
      assigned_location_id: locationId,
      destination_name: destinationName,
      mission_type: missionType || "Flood Rescue",
      priority: priority || "HIGH",
      notes: notes || "",
      distance_km: distKm,
      eta_minutes: etaMins,
      waypoints: waypoints,
      current_waypoint_idx: 0,
      last_updated: "Just now"
    };

    teams[teamIdx] = updatedTeam;
    this.saveTeams(teams);

    const newMission = {
      id: missionId,
      mission_id: missionId,
      team_id: team.id,
      team_name: team.name,
      location_id: locationId,
      destination_name: destinationName,
      mission_type: missionType || "Flood Rescue",
      priority: priority || "HIGH",
      status: "ASSIGNED",
      notes: notes || "",
      dispatched_at: "Just now",
      completed_at: null
    };

    const missions = [newMission, ...this.missions];
    this.saveMissions(missions);

    // Sync to backend if reachable
    try {
      fetch('/api/rescue-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission)
      }).catch(() => {});
    } catch (e) {}

    return { team: updatedTeam, mission: newMission };
  }

  async updateTeamStatus(teamId, newStatus) {
    const teams = [...this.teams];
    const teamIdx = teams.findIndex(t => t.id === teamId || t.team_id === teamId);
    if (teamIdx === -1) return;

    const team = teams[teamIdx];
    const updatedTeam = {
      ...team,
      status: newStatus,
      last_updated: "Just now"
    };

    if (newStatus === 'ON SITE') {
      updatedTeam.eta_minutes = 0;
      updatedTeam.distance_km = 0.0;
    } else if (newStatus === 'COMPLETED') {
      updatedTeam.status = 'COMPLETED';
      updatedTeam.eta_minutes = 0;
      updatedTeam.distance_km = 0.0;
    } else if (newStatus === 'AVAILABLE') {
      updatedTeam.destination_name = null;
      updatedTeam.assigned_location_id = null;
      updatedTeam.mission_id = null;
      updatedTeam.mission_type = null;
      updatedTeam.priority = "LOW";
      updatedTeam.eta_minutes = 0;
      updatedTeam.distance_km = 0.0;
    }

    teams[teamIdx] = updatedTeam;
    this.saveTeams(teams);

    // Update mission status
    if (team.mission_id) {
      const missions = this.missions.map(m => {
        if (m.id === team.mission_id || m.mission_id === team.mission_id) {
          return {
            ...m,
            status: newStatus,
            completed_at: newStatus === 'COMPLETED' ? new Date().toLocaleTimeString() : m.completed_at
          };
        }
        return m;
      });
      this.saveMissions(missions);

      try {
        fetch(`/api/rescue-missions/${team.mission_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }).catch(() => {});
      } catch (e) {}
    }

    return updatedTeam;
  }

  stepSimulatedMovement() {
    let changed = false;
    const teams = this.teams.map(team => {
      // Only advance teams that are EN ROUTE and have waypoints
      if (team.status === 'EN ROUTE' && team.waypoints && team.waypoints.length > 1) {
        changed = true;
        const totalWps = team.waypoints.length;
        const currentIdx = team.current_waypoint_idx || 0;
        const nextIdx = (currentIdx + 1) % totalWps;

        const nextCoord = team.waypoints[nextIdx];
        const isArrived = nextIdx === totalWps - 1;

        const remainingKm = Math.max(0, Math.round((team.distance_km - 1.2) * 10) / 10);
        const remainingEta = Math.max(1, Math.round(team.eta_minutes - 3));

        return {
          ...team,
          latitude: nextCoord[0],
          longitude: nextCoord[1],
          current_waypoint_idx: nextIdx,
          distance_km: isArrived ? 0 : remainingKm,
          eta_minutes: isArrived ? 0 : remainingEta,
          status: isArrived ? 'ON SITE' : 'EN ROUTE',
          last_updated: "Simulated GPS just now"
        };
      }
      return team;
    });

    if (changed) {
      this.saveTeams(teams);
    }
    return teams;
  }

  getSummaryStats(teams = this.teams, missions = this.missions) {
    return {
      active_teams: teams.filter(t => ['ASSIGNED', 'EN ROUTE', 'ON SITE', 'EMERGENCY'].includes(t.status)).length,
      active_incidents: missions.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED').length,
      teams_en_route: teams.filter(t => t.status === 'EN ROUTE').length,
      available_teams: teams.filter(t => t.status === 'AVAILABLE').length,
      completed_missions: missions.filter(m => m.status === 'COMPLETED').length
    };
  }
}

export const rescueService = new RescueService();
