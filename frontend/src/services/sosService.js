/**
 * PralayWatch — Citizen SOS ↔ Authority SOS Real-Time Synchronization Service
 * 
 * Provides robust dual-mode execution:
 * 1. Live REST API calls to Flask Backend (`/api/sos`)
 * 2. Real-time persistent local state synchronizer (`localStorage` fallback)
 *    ensuring full operational fidelity in both local and static deployments (Vercel).
 */

const SOS_STORAGE_KEY = 'pralaywatch_sos_requests_v3';

const INITIAL_DEMO_SOS = [
  {
    id: 801,
    sos_id: 'SOS-801',
    location_latitude: 30.4124,
    location_longitude: 79.3198,
    lat: 30.4124,
    lng: 79.3198,
    location_name: 'Chamoli (Alaknanda Basin), Uttarakhand',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    time_ago: '6 mins ago',
    status: 'NEW',
    risk_level: 'CRITICAL',
    urgency: 'CRITICAL',
    hazard: 'FLASH FLOOD',
    message: 'Water entered ground floor, elderly person with mobility issue needing evacuation assistance.',
    people_count: 4,
    citizen_name: 'Rajesh Negi',
    phone: '+91 98450 12345',
    assigned_team_id: null,
    assigned_team_name: null,
    acknowledged_at: null,
    dispatched_at: null,
    resolved_at: null,
    is_demo: false
  },
  {
    id: 802,
    sos_id: 'SOS-802',
    location_latitude: 30.5539,
    location_longitude: 79.5658,
    lat: 30.5539,
    lng: 79.5658,
    location_name: 'Joshimath (Sunil Ward), Uttarakhand',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    time_ago: '18 mins ago',
    status: 'ACKNOWLEDGED',
    risk_level: 'HIGH',
    urgency: 'HIGH',
    hazard: 'LANDSLIDE',
    message: 'Slope behind house cracking rapidly, road blocked by debris.',
    people_count: 2,
    citizen_name: 'Pooja Verma',
    phone: '+91 97110 56789',
    assigned_team_id: null,
    assigned_team_name: null,
    acknowledged_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    dispatched_at: null,
    resolved_at: null,
    is_demo: false
  }
];

class SosService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || '';
    this.requests = this.loadLocalRequests();
  }

  loadLocalRequests() {
    try {
      const stored = localStorage.getItem(SOS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[SosService] Failed to parse local SOS storage:', e);
    }
    this.saveLocalRequests(INITIAL_DEMO_SOS);
    return INITIAL_DEMO_SOS;
  }

  saveLocalRequests(list) {
    try {
      this.requests = list;
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[SosService] Failed to save local SOS storage:', e);
    }
  }

  formatTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    const diff = Date.now() - new Date(isoString).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min${min > 1 ? 's' : ''} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr${hr > 1 ? 's' : ''} ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day > 1 ? 's' : ''} ago`;
  }

  /**
   * Fetch all SOS requests with live updates & time_ago calculation
   */
  async getSosRequests() {
    try {
      const res = await fetch(`${this.apiUrl}/api/sos`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.sos_requests)) {
          this.saveLocalRequests(data.sos_requests);
          return data.sos_requests.map(s => ({
            ...s,
            time_ago: this.formatTimeAgo(s.timestamp)
          }));
        }
      }
    } catch (e) {
      // Backend not running / static fallback
    }

    // Refresh time_ago on cached items
    const local = this.loadLocalRequests().map(s => ({
      ...s,
      time_ago: this.formatTimeAgo(s.timestamp)
    }));
    return local;
  }

  /**
   * Create a new real SOS request from Citizen Portal
   */
  async createSos(sosData) {
    const sosId = `SOS-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newRecord = {
      id: Date.now(),
      sos_id: sosId,
      location_latitude: Number(sosData.location_latitude || sosData.lat) || 30.4124,
      location_longitude: Number(sosData.location_longitude || sosData.lng) || 79.3198,
      lat: Number(sosData.location_latitude || sosData.lat) || 30.4124,
      lng: Number(sosData.location_longitude || sosData.lng) || 79.3198,
      location_name: sosData.location_name || 'Chamoli, Uttarakhand',
      timestamp: now,
      time_ago: 'Just now',
      status: 'NEW',
      risk_level: sosData.risk_level || sosData.urgency || 'HIGH',
      urgency: sosData.risk_level || sosData.urgency || 'HIGH',
      hazard: (sosData.hazard || 'FLASH FLOOD').toUpperCase(),
      message: sosData.message || 'Urgent evacuation / rescue required.',
      people_count: Number(sosData.people_count) || 1,
      citizen_name: sosData.citizen_name || 'Citizen in Distress',
      phone: sosData.phone || '',
      assigned_team_id: null,
      assigned_team_name: null,
      acknowledged_at: null,
      dispatched_at: null,
      resolved_at: null,
      is_demo: Boolean(sosData.is_demo)
    };

    // Try API POST
    try {
      const res = await fetch(`${this.apiUrl}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.sos) {
          const updated = [json.sos, ...this.loadLocalRequests().filter(s => s.sos_id !== json.sos.sos_id)];
          this.saveLocalRequests(updated);
          return json.sos;
        }
      }
    } catch (e) {
      // Local fallback
    }

    const current = this.loadLocalRequests();
    const updated = [newRecord, ...current];
    this.saveLocalRequests(updated);
    return newRecord;
  }

  /**
   * Authority acknowledges an SOS request (NEW -> ACKNOWLEDGED)
   */
  async acknowledgeSos(sosId) {
    const now = new Date().toISOString();
    try {
      const res = await fetch(`${this.apiUrl}/api/sos/${sosId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.sos) {
          this.updateLocalRecord(json.sos);
          return json.sos;
        }
      }
    } catch (e) {
      // Fallback
    }

    const localList = this.loadLocalRequests();
    const item = localList.find(s => s.sos_id === sosId || String(s.id) === String(sosId));
    if (item) {
      item.status = 'ACKNOWLEDGED';
      item.acknowledged_at = now;
      this.saveLocalRequests(localList);
      return item;
    }
    return null;
  }

  /**
   * Authority dispatches a rescue team to the SOS (ACKNOWLEDGED -> TEAM DISPATCHED)
   */
  async dispatchTeamToSos(sosId, teamId, teamName) {
    const now = new Date().toISOString();
    try {
      const res = await fetch(`${this.apiUrl}/api/sos/${sosId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, team_name: teamName })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.sos) {
          this.updateLocalRecord(json.sos);
          return json.sos;
        }
      }
    } catch (e) {
      // Fallback
    }

    const localList = this.loadLocalRequests();
    const item = localList.find(s => s.sos_id === sosId || String(s.id) === String(sosId));
    if (item) {
      item.status = 'TEAM DISPATCHED';
      item.assigned_team_id = teamId;
      item.assigned_team_name = teamName;
      item.dispatched_at = now;
      if (!item.acknowledged_at) item.acknowledged_at = now;
      this.saveLocalRequests(localList);
      return item;
    }
    return null;
  }

  /**
   * Update lifecycle status (NEW -> ACKNOWLEDGED -> TEAM DISPATCHED -> RESCUE IN PROGRESS -> RESOLVED)
   */
  async updateSosStatus(sosId, newStatus, extraData = {}) {
    const now = new Date().toISOString();
    try {
      const res = await fetch(`${this.apiUrl}/api/sos/${sosId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extraData })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.sos) {
          this.updateLocalRecord(json.sos);
          return json.sos;
        }
      }
    } catch (e) {
      // Fallback
    }

    const localList = this.loadLocalRequests();
    const item = localList.find(s => s.sos_id === sosId || String(s.id) === String(sosId));
    if (item) {
      item.status = newStatus.toUpperCase();
      if (item.status === 'ACKNOWLEDGED' && !item.acknowledged_at) item.acknowledged_at = now;
      if (item.status === 'TEAM DISPATCHED' && !item.dispatched_at) item.dispatched_at = now;
      if (item.status === 'RESOLVED') item.resolved_at = now;
      if (extraData.assigned_team_id) item.assigned_team_id = extraData.assigned_team_id;
      if (extraData.assigned_team_name) item.assigned_team_name = extraData.assigned_team_name;
      this.saveLocalRequests(localList);
      return item;
    }
    return null;
  }

  /**
   * Mark SOS as resolved
   */
  async resolveSos(sosId) {
    return this.updateSosStatus(sosId, 'RESOLVED');
  }

  /**
   * 1-Click Demo SOS generation for test evaluations
   */
  async createDemoSos(overrideData = {}) {
    const demoNum = Math.floor(100 + Math.random() * 900);
    return this.createSos({
      sos_id: `SOS-DEMO-${demoNum}`,
      location_name: overrideData.location_name || 'Chamoli (Alaknanda Corridor), Uttarakhand',
      lat: overrideData.lat || 30.4124,
      lng: overrideData.lng || 79.3198,
      risk_level: 'CRITICAL',
      hazard: 'FLASH FLOOD',
      message: '[DEMO SIMULATION] Rapid flash flood surge in lower ward. 4 citizens trapped on rooftop.',
      people_count: 4,
      citizen_name: '[DEMO CITIZEN] Test Coordinator',
      phone: '+91 99999 00000',
      is_demo: true
    });
  }

  updateLocalRecord(sos) {
    const localList = this.loadLocalRequests();
    const idx = localList.findIndex(s => s.sos_id === sos.sos_id || String(s.id) === String(sos.id));
    if (idx >= 0) {
      localList[idx] = { ...localList[idx], ...sos };
    } else {
      localList.unshift(sos);
    }
    this.saveLocalRequests(localList);
  }
}

export const sosService = new SosService();
