import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation & Role
  const [activePage, setActivePage] = useState('dashboard');
  const [userRole, setUserRole] = useState('citizen'); // 'citizen' | 'authority'

  // Data states
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(1); // Default to Dehradun
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationRisk, setLocationRisk] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [systemRisk, setSystemRisk] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [safeLocations, setSafeLocations] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  
  // Citizen SOS Rescue Requests Queue
  const [sosRequests, setSosRequests] = useState([
    {
      id: 'SOS-801',
      citizen_name: 'Rajesh Negi',
      phone: '+91 98450 12345',
      location_name: 'Dehradun (Rispana River Bank)',
      people_count: 4,
      urgency: 'HIGH',
      status: 'PENDING',
      message: 'Water entered ground floor, elderly person with mobility issue needing evacuation assistance.',
      timestamp: '10 mins ago'
    },
    {
      id: 'SOS-802',
      citizen_name: 'Pooja Verma',
      phone: '+91 97110 56789',
      location_name: 'Joshimath (Sunil Ward)',
      people_count: 2,
      urgency: 'CRITICAL',
      status: 'DISPATCHED',
      message: 'Slope behind house cracking rapidly, road blocked by debris.',
      timestamp: '25 mins ago'
    }
  ]);

  // Map & Simulation states
  const [selectedLayer, setSelectedLayer] = useState('overall'); // 'overall' | 'flash_flood' | 'flood' | 'landslide' | 'heavy_rainfall' | 'safe_locations'
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationState, setSimulationState] = useState({
    timeline_step: 'T0',
    active_scenario: 'baseline',
    scenario_title: 'Nominal Baseline Monitoring',
    description: 'Baseline regional weather telemetry and hydrological monitoring.',
    is_simulation: true,
    demo_label: 'Simulation / Demo Data'
  });
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // 1. Fetch system-wide risk and locations list
  const fetchSystemData = useCallback(async () => {
    try {
      setLoading(true);
      const [locRes, sysRiskRes, alertsRes, notifsRes] = await Promise.all([
        api.getLocations(),
        api.getSystemRisk(),
        api.getAlerts(),
        api.getNotifications()
      ]);

      if (locRes.success) setLocations(locRes.locations);
      if (sysRiskRes.success) setSystemRisk(sysRiskRes);
      if (alertsRes.success) {
        setAlerts(alertsRes.alerts);
        const criticalOrHigh = alertsRes.alerts.find(a => a.status === 'Active' && (a.severity === 'CRITICAL' || a.severity === 'HIGH'));
        if (criticalOrHigh) {
          setActiveAlert(criticalOrHigh);
        }
      }
      if (notifsRes.success) setNotifications(notifsRes.notifications);
    } catch (err) {
      console.error('[AppContext] Error fetching initial system data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch specific location risk and safe locations
  const fetchLocationData = useCallback(async (locId) => {
    try {
      const [riskRes, safeLocRes] = await Promise.all([
        api.getLocationRisk(locId),
        api.getSafeLocations(locId)
      ]);

      if (riskRes.success) {
        setSelectedLocation(riskRes.location);
        setLocationRisk(riskRes.risk_assessment);
        setEnvironmentalData(riskRes.environmental_data);
        if (riskRes.pipeline_stages) {
          setPipelineData({
            stages: riskRes.pipeline_stages,
            impact: riskRes.impact_assessment
          });
        }

        // Check if critical/high risk triggers emergency alert state
        if (riskRes.risk_assessment.overall_level === 'CRITICAL') {
          if (!isSirenMuted) {
            soundService.playEmergencySiren();
            setIsSirenActive(true);
          }
        } else {
          // If the newly selected location is safe / not critical, turn off siren and close modal
          soundService.stopEmergencySiren();
          setIsSirenActive(false);
          setShowEmergencyModal(false);
        }
      }

      if (safeLocRes.success) {
        setSafeLocations(safeLocRes.safe_locations);
        if (safeLocRes.safe_locations.length > 0) {
          setSelectedShelter(safeLocRes.safe_locations[0]);
        } else {
          setSelectedShelter(null);
        }
      }
    } catch (err) {
      console.error('[AppContext] Error fetching location data:', err);
    }
  }, [isSirenMuted]);

  // Initial Load
  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  // Location selection change
  useEffect(() => {
    if (selectedLocationId) {
      fetchLocationData(selectedLocationId);
    }
  }, [selectedLocationId, fetchLocationData]);

  // Select Location Handler
  const selectLocation = (id) => {
    const numId = Number(id);
    setSelectedLocationId(numId);
    const loc = locations.find(l => l.id === numId);
    if (loc) {
      setSelectedLocation(loc);
    }
    fetchLocationData(numId);
  };

  // Trigger Disaster Simulation (The core SIH demo flow)
  const triggerSimulation = async (scenario = 'combined_emergency') => {
    try {
      setIsSimulating(true);
      setStatusMessage(`Triggering simulation: ${scenario}...`);
      
      const res = await api.simulateEvent(scenario, selectedLocationId);
      if (res.success) {
        // Refresh all data
        await fetchSystemData();
        await fetchLocationData(selectedLocationId);

        if (scenario !== 'reset') {
          // Trigger emergency alert state & popup
          setShowEmergencyModal(true);
          
          if (!isSirenMuted) {
            soundService.playEmergencySiren();
            setIsSirenActive(true);
          }

          // Trigger prototype mock notification popup
          if (res.alert_created) {
            setActiveAlert(res.alert_created);
            setLatestNotification({
              title: res.alert_created.title,
              message: res.alert_created.message,
              phone: "+91 98765 43210",
              hazard_type: res.alert_created.hazard_type,
              severity: res.alert_created.severity
            });
            setShowNotificationModal(true);
          }
        } else {
          // Reset sound & alert modal
          soundService.stopEmergencySiren();
          setIsSirenActive(false);
          setShowEmergencyModal(false);
          setShowNotificationModal(false);
          setActiveAlert(null);
        }
      }
    } catch (err) {
      console.error('[AppContext] Simulation error:', err);
    } finally {
      setIsSimulating(false);
      setStatusMessage('');
    }
  };

  // Apply Progressive Timeline Step (T0 -> T+1 -> T+2)
  const applyTimelineStep = async (step) => {
    try {
      setIsSimulating(true);
      setStatusMessage(`Advancing simulation to ${step}...`);
      const res = await api.applyTimelineStep(step, selectedLocationId);
      await fetchSystemData();
      await fetchLocationData(selectedLocationId);
      
      setSimulationState(prev => ({
        ...prev,
        timeline_step: step,
        scenario_title: res.config?.title || step,
        description: res.config?.description || ''
      }));

      if (step === 'T+2' && res.alert) {
        setActiveAlert(res.alert);
        setShowEmergencyModal(true);
        if (!isSirenMuted) {
          soundService.playEmergencySiren();
          setIsSirenActive(true);
        }
      } else if (step === 'T0') {
        soundService.stopEmergencySiren();
        setIsSirenActive(false);
        setShowEmergencyModal(false);
      }
      return res;
    } catch (err) {
      console.error('[AppContext] Error applying timeline step:', err);
    } finally {
      setIsSimulating(false);
      setStatusMessage('');
    }
  };

  // Apply Multi-Hazard Scenario Preset
  const applySimulationScenario = async (scenarioId) => {
    try {
      setIsSimulating(true);
      setStatusMessage(`Applying scenario: ${scenarioId}...`);
      const res = await api.applySimulationScenario(scenarioId);
      await fetchSystemData();
      await fetchLocationData(selectedLocationId);
      
      setSimulationState(prev => ({
        ...prev,
        active_scenario: scenarioId,
        scenario_title: res.name || scenarioId
      }));

      if (scenarioId !== 'reset_nominal' && res.alert) {
        setActiveAlert(res.alert);
        setShowEmergencyModal(true);
        if (!isSirenMuted) {
          soundService.playEmergencySiren();
          setIsSirenActive(true);
        }
      } else if (scenarioId === 'reset_nominal') {
        soundService.stopEmergencySiren();
        setIsSirenActive(false);
        setShowEmergencyModal(false);
        setActiveAlert(null);
      }
      return res;
    } catch (err) {
      console.error('[AppContext] Error applying simulation scenario:', err);
    } finally {
      setIsSimulating(false);
      setStatusMessage('');
    }
  };

  // Toggle Siren Audio Mute
  const toggleSiren = () => {
    const muted = soundService.toggleMute();
    setIsSirenMuted(muted);
    if (muted) {
      soundService.stopEmergencySiren();
      setIsSirenActive(false);
    } else if (locationRisk?.overall_level === 'CRITICAL') {
      soundService.playEmergencySiren();
      setIsSirenActive(true);
    }
  };

  const stopSiren = () => {
    soundService.stopEmergencySiren();
    setIsSirenActive(false);
  };

  // Issue Alert by Authority
  const issueAlert = async (alertData) => {
    try {
      const res = await api.createAlert(alertData);
      if (res.success) {
        await fetchSystemData();
        setActiveAlert(res.alert);
        setShowEmergencyModal(true);
        if (!isSirenMuted) {
          soundService.playEmergencySiren();
          setIsSirenActive(true);
        }
        return res;
      }
    } catch (err) {
      console.error('[AppContext] Issue alert error:', err);
      throw err;
    }
  };

  // Resolve Alert
  const resolveAlert = async (alertId) => {
    try {
      const res = await api.resolveAlert(alertId);
      if (res.success) {
        await fetchSystemData();
        if (activeAlert?.id === alertId) {
          setActiveAlert(null);
          soundService.stopEmergencySiren();
          setIsSirenActive(false);
        }
      }
    } catch (err) {
      console.error('[AppContext] Resolve alert error:', err);
    }
  };

  // Subscribe Citizen
  const subscribeCitizen = async (userData) => {
    try {
      const res = await api.subscribeCitizen(userData);
      if (res.success) {
        setLatestNotification(res.mock_notification);
        setShowNotificationModal(true);
        await fetchSystemData();
        return res;
      }
    } catch (err) {
      console.error('[AppContext] Citizen subscription error:', err);
      throw err;
    }
  };

  // Submit Citizen SOS Request
  const submitSosRequest = (sosData) => {
    const newSos = {
      id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
      citizen_name: sosData.citizen_name || 'Citizen in Distress',
      phone: sosData.phone || '+91 98765 43210',
      location_name: selectedLocation ? `${selectedLocation.name} (${selectedLocation.state})` : 'Monitored Sector',
      people_count: sosData.people_count || 1,
      urgency: sosData.urgency || 'HIGH',
      status: 'PENDING',
      message: sosData.message || 'Immediate flood/landslide rescue required.',
      timestamp: 'Just now'
    };
    setSosRequests(prev => [newSos, ...prev]);
    return newSos;
  };

  // Update SOS status (Authority dispatch / resolve)
  const updateSosStatus = (sosId, newStatus) => {
    setSosRequests(prev => prev.map(s => s.id === sosId ? { ...s, status: newStatus } : s));
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        userRole,
        setUserRole,
        locations,
        selectedLocationId,
        selectedLocation,
        locationRisk,
        environmentalData,
        systemRisk,
        alerts,
        activeAlert,
        safeLocations,
        selectedShelter,
        setSelectedShelter,
        sosRequests,
        submitSosRequest,
        updateSosStatus,
        notifications,
        latestNotification,
        pipelineData,
        selectedLayer,
        setSelectedLayer,
        isSimulating,
        simulationState,
        applyTimelineStep,
        applySimulationScenario,
        isSirenActive,
        isSirenMuted,
        showEmergencyModal,
        setShowEmergencyModal,
        showNotificationModal,
        setShowNotificationModal,
        loading,
        statusMessage,
        selectLocation,
        triggerSimulation,
        toggleSiren,
        stopSiren,
        issueAlert,
        resolveAlert,
        subscribeCitizen,
        refreshData: fetchSystemData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
