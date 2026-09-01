const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:5000/api'
    : '/api');

export const api = {
  // 1. Locations
  async getLocations() {
    const res = await fetch(`${API_BASE_URL}/locations`);
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
  },

  async getLocationById(id) {
    const res = await fetch(`${API_BASE_URL}/locations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch location');
    return res.json();
  },

  // 2. Risk Assessments
  async getSystemRisk() {
    const res = await fetch(`${API_BASE_URL}/risk`);
    if (!res.ok) throw new Error('Failed to fetch system risk');
    return res.json();
  },

  async getLocationRisk(locationId) {
    const res = await fetch(`${API_BASE_URL}/risk/${locationId}`);
    if (!res.ok) throw new Error('Failed to fetch location risk');
    return res.json();
  },

  // 3. Hazards
  async getHazards() {
    const res = await fetch(`${API_BASE_URL}/hazards`);
    if (!res.ok) throw new Error('Failed to fetch hazards');
    return res.json();
  },

  // 4. Alerts
  async getAlerts(status = '') {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE_URL}/alerts${query}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async createAlert(alertData) {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return res.json();
  },

  async resolveAlert(alertId) {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  async reactivateAlert(alertId) {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/reactivate`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reactivate alert');
    return res.json();
  },

  async getNotificationChannels() {
    const res = await fetch(`${API_BASE_URL}/notifications/channels`);
    if (!res.ok) throw new Error('Failed to fetch notification channels');
    return res.json();
  },

  // 5. Safe Locations / Shelters
  async getSafeLocations(locationId = null) {
    const query = locationId ? `?location_id=${locationId}` : '';
    const res = await fetch(`${API_BASE_URL}/safe-locations${query}`);
    if (!res.ok) throw new Error('Failed to fetch safe locations');
    return res.json();
  },

  async addSafeLocation(shelterData) {
    const res = await fetch(`${API_BASE_URL}/safe-locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shelterData)
    });
    if (!res.ok) throw new Error('Failed to add safe shelter');
    return res.json();
  },

  // 6. Simulation Trigger
  async simulateEvent(scenario, locationId = null) {
    const res = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, location_id: locationId })
    });
    if (!res.ok) throw new Error('Failed to trigger simulation');
    return res.json();
  },

  // 7. Notifications / Subscriptions
  async getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async subscribeCitizen(userData) {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to save citizen preferences');
    return res.json();
  },

  // 8. Environmental Telemetry
  async getEnvironmentalData(locationId = null) {
    const query = locationId ? `?location_id=${locationId}` : '';
    const res = await fetch(`${API_BASE_URL}/environmental-data${query}`);
    if (!res.ok) throw new Error('Failed to fetch environmental data');
    return res.json();
  },

  // 9. Complete 6-Stage Disaster Intelligence Pipeline Trace
  async getPipelineTrace(locationId) {
    const res = await fetch(`${API_BASE_URL}/pipeline/${locationId}`);
    if (!res.ok) throw new Error('Failed to fetch pipeline trace');
    return res.json();
  },

  // 10. Direct Risk Intelligence Engine Evaluation
  async evaluateCustomRisk(payload) {
    const res = await fetch(`${API_BASE_URL}/risk/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to evaluate risk payload');
    return res.json();
  },

  async getHazardRisk(locationId, hazardKey) {
    const res = await fetch(`${API_BASE_URL}/risk/${locationId}/hazard/${hazardKey}`);
    if (!res.ok) throw new Error(`Failed to fetch hazard risk for ${hazardKey}`);
    return res.json();
  },

  // 11. Simulated Live Disaster Data Layer
  async getSimulationStatus() {
    const res = await fetch(`${API_BASE_URL}/simulation/status`);
    if (!res.ok) throw new Error('Failed to fetch simulation status');
    return res.json();
  },

  async applyTimelineStep(step, locationId = null) {
    const res = await fetch(`${API_BASE_URL}/simulation/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, location_id: locationId })
    });
    if (!res.ok) throw new Error('Failed to apply timeline step');
    return res.json();
  },

  async applySimulationScenario(scenarioId) {
    const res = await fetch(`${API_BASE_URL}/simulation/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: scenarioId })
    });
    if (!res.ok) throw new Error('Failed to apply simulation scenario');
    return res.json();
  },

  async applyDemoPhase(phase, locationId = null) {
    const res = await fetch(`${API_BASE_URL}/simulation/demo-phase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase, location_id: locationId })
    });
    if (!res.ok) throw new Error('Failed to apply demo phase');
    return res.json();
  }
};
