import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';
import { weatherService } from '../services/weatherService';
import { terrainService } from '../services/terrainService';
import { historicalRiskService } from '../services/historicalRiskService';
import { riskEngineService } from '../services/riskEngineService';
import { sosService } from '../services/sosService';
import { 
  FALLBACK_LOCATIONS, 
  FALLBACK_SYSTEM_RISK, 
  FALLBACK_ALERTS, 
  getFallbackSafeLocations 
} from '../data/fallbackData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation & Role
  const [activePage, setActivePage] = useState('dashboard');
  const [userRole, setUserRole] = useState('citizen'); // 'citizen' | 'authority'

  // Live Open-Meteo & Real Risk Engine States (Step 1-6 + Phase 2A/2B)
  const [userCoords, setUserCoords] = useState({ lat: 30.4124, lng: 79.3198 }); // Default: Chamoli
  const [userGpsLocation, setUserGpsLocation] = useState(null); // { lat, lng, accuracy, active: boolean, timestamp }
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [locationName, setLocationName] = useState('Chamoli, Uttarakhand');
  const [locationInputMode, setLocationInputMode] = useState('default'); // 'default' | 'gps' | 'manual' | 'preset'
  const [liveWeather, setLiveWeather] = useState(null);
  const [liveTerrain, setLiveTerrain] = useState(null);
  const [historicalRisk, setHistoricalRisk] = useState(null);
  const [liveRisk, setLiveRisk] = useState(null);
  const [isLiveWeatherLoading, setIsLiveWeatherLoading] = useState(false);
  const [liveWeatherError, setLiveWeatherError] = useState(null);
  const [lastWeatherUpdated, setLastWeatherUpdated] = useState(null);

  // Data states - initialized with reliable 31-sector dataset
  const [locations, setLocations] = useState(FALLBACK_LOCATIONS);
  const [selectedLocationId, setSelectedLocationId] = useState(1); // Default to Chamoli
  const [selectedLocation, setSelectedLocation] = useState(FALLBACK_LOCATIONS[0]);
  const [locationRisk, setLocationRisk] = useState(FALLBACK_LOCATIONS[0].current_risk);
  const [environmentalData, setEnvironmentalData] = useState(FALLBACK_LOCATIONS[0].environmental_data);
  const [systemRisk, setSystemRisk] = useState(FALLBACK_SYSTEM_RISK);
  const [alerts, setAlerts] = useState(FALLBACK_ALERTS);
  const [activeAlert, setActiveAlert] = useState(FALLBACK_ALERTS[0]);
  const [safeLocations, setSafeLocations] = useState(getFallbackSafeLocations(1));
  const [selectedShelter, setSelectedShelter] = useState(getFallbackSafeLocations(1)[0]);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  
  // Citizen SOS Rescue Requests Queue (Synchronized with Flask API + Storage)
  const [sosRequests, setSosRequests] = useState(() => sosService.loadLocalRequests());
  const [lastKnownNewSosCount, setLastKnownNewSosCount] = useState(0);

  // Real-time SOS background polling (10s interval)
  const fetchSosRequests = useCallback(async () => {
    try {
      const data = await sosService.getSosRequests();
      if (Array.isArray(data)) {
        setSosRequests(data);
        const newCount = data.filter(s => s.status === 'NEW').length;
        if (newCount > lastKnownNewSosCount && lastKnownNewSosCount > 0) {
          try {
            soundService.playAlertChime();
          } catch (err) {
            // ignore audio autoplay policy
          }
        }
        setLastKnownNewSosCount(newCount);
      }
    } catch (e) {
      console.warn('[AppContext] Failed to sync SOS requests:', e);
    }
  }, [lastKnownNewSosCount]);

  useEffect(() => {
    fetchSosRequests();
    const interval = setInterval(fetchSosRequests, 10000);
    return () => clearInterval(interval);
  }, [fetchSosRequests]);

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
  const [isAlertHistoryOpen, setIsAlertHistoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalSosOpen, setIsGlobalSosOpen] = useState(false);
  const [demoPhase, setDemoPhase] = useState(1);
  const [isScenarioRunning, setIsScenarioRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // 1. Fetch system-wide risk and locations list with robust fallback
  const fetchSystemData = useCallback(async () => {
    try {
      setLoading(true);
      const [locRes, sysRiskRes, alertsRes, notifsRes] = await Promise.allSettled([
        api.getLocations(),
        api.getSystemRisk(),
        api.getAlerts(),
        api.getNotifications()
      ]);

      if (locRes.status === 'fulfilled' && locRes.value?.success && locRes.value.locations?.length > 0) {
        setLocations(locRes.value.locations);
        const initialLoc = locRes.value.locations.find(l => l.id === selectedLocationId) || locRes.value.locations[0];
        if (initialLoc) {
          setSelectedLocation(initialLoc);
          setUserCoords({ lat: initialLoc.lat, lng: initialLoc.lng });
          setLocationName(`${initialLoc.name}, ${initialLoc.state}`);
        }
      } else {
        setLocations(FALLBACK_LOCATIONS);
        const initialLoc = FALLBACK_LOCATIONS.find(l => l.id === selectedLocationId) || FALLBACK_LOCATIONS[0];
        if (initialLoc) {
          setSelectedLocation(initialLoc);
          setUserCoords({ lat: initialLoc.lat, lng: initialLoc.lng });
          setLocationName(`${initialLoc.name}, ${initialLoc.state}`);
        }
      }

      if (sysRiskRes.status === 'fulfilled' && sysRiskRes.value?.success) {
        setSystemRisk(sysRiskRes.value);
      } else {
        setSystemRisk(FALLBACK_SYSTEM_RISK);
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value?.success && alertsRes.value.alerts?.length > 0) {
        setAlerts(alertsRes.value.alerts);
        const criticalOrHigh = alertsRes.value.alerts.find(a => a.status === 'Active' && (a.severity === 'CRITICAL' || a.severity === 'HIGH'));
        if (criticalOrHigh) {
          setActiveAlert(criticalOrHigh);
        }
      } else {
        setAlerts(FALLBACK_ALERTS);
        setActiveAlert(FALLBACK_ALERTS[0]);
      }

      if (notifsRes.status === 'fulfilled' && notifsRes.value?.success) {
        setNotifications(notifsRes.value.notifications);
      }
    } catch (err) {
      console.warn('[AppContext] Network offline or static host, using 31-sector fallback data:', err);
      setLocations(FALLBACK_LOCATIONS);
      setSystemRisk(FALLBACK_SYSTEM_RISK);
      setAlerts(FALLBACK_ALERTS);
    } finally {
      setLoading(false);
    }
  }, [selectedLocationId]);

  // 2. Fetch specific location risk and safe locations with robust fallback
  const fetchLocationData = useCallback(async (locId) => {
    try {
      const [riskRes, safeLocRes] = await Promise.allSettled([
        api.getLocationRisk(locId),
        api.getSafeLocations(locId)
      ]);

      if (riskRes.status === 'fulfilled' && riskRes.value?.success) {
        const val = riskRes.value;
        setSelectedLocation(val.location);
        setLocationRisk(val.risk_assessment);
        setEnvironmentalData(val.environmental_data);
        if (val.pipeline_stages) {
          setPipelineData({
            stages: val.pipeline_stages,
            impact: val.impact_assessment
          });
        }

        if (val.risk_assessment?.overall_level === 'CRITICAL') {
          if (!isSirenMuted) {
            soundService.playEmergencySiren();
            setIsSirenActive(true);
          }
        } else {
          soundService.stopEmergencySiren();
          setIsSirenActive(false);
          setShowEmergencyModal(false);
        }
      } else {
        // Resolve using fallback 31-location database
        const fallbackLoc = FALLBACK_LOCATIONS.find(l => l.id === Number(locId)) || FALLBACK_LOCATIONS[0];
        setSelectedLocation(fallbackLoc);
        setLocationRisk(fallbackLoc.current_risk);
        setEnvironmentalData(fallbackLoc.environmental_data);
      }

      if (safeLocRes.status === 'fulfilled' && safeLocRes.value?.success && safeLocRes.value.safe_locations?.length > 0) {
        setSafeLocations(safeLocRes.value.safe_locations);
        setSelectedShelter(safeLocRes.value.safe_locations[0]);
      } else {
        const fallbackShelters = getFallbackSafeLocations(locId);
        setSafeLocations(fallbackShelters);
        setSelectedShelter(fallbackShelters[0]);
      }
    } catch (err) {
      console.warn('[AppContext] Using fallback location data for locId', locId, err);
      const fallbackLoc = FALLBACK_LOCATIONS.find(l => l.id === Number(locId)) || FALLBACK_LOCATIONS[0];
      setSelectedLocation(fallbackLoc);
      setLocationRisk(fallbackLoc.current_risk);
      setEnvironmentalData(fallbackLoc.environmental_data);
      const fallbackShelters = getFallbackSafeLocations(locId);
      setSafeLocations(fallbackShelters);
      setSelectedShelter(fallbackShelters[0]);
    }
  }, [isSirenMuted]);

  // 3. Fetch Live Open-Meteo Weather Data, Real Terrain & Evaluate Multi-Source Risk
  const fetchLiveWeatherData = useCallback(async (lat, lng, locMetadata = null, forceRefresh = false) => {
    try {
      setIsLiveWeatherLoading(true);
      setLiveWeatherError(null);

      // Concurrent fetch for Live Weather and Real Terrain Elevation Profile
      const [weatherRes, terrainRes] = await Promise.all([
        weatherService.fetchLiveWeather(lat, lng, forceRefresh),
        terrainService.fetchTerrainData(lat, lng, forceRefresh)
      ]);

      const currentLocName = locMetadata?.name || locationName;
      const historicalRes = historicalRiskService.evaluateHistoricalRisk(lat, lng, currentLocName);
      setHistoricalRisk(historicalRes);

      if (terrainRes.success && terrainRes.data) {
        setLiveTerrain(terrainRes.data);
      }

      if (weatherRes.success && weatherRes.data) {
        setLiveWeather(weatherRes.data);
        const evaluated = riskEngineService.evaluateLiveRisk(
          weatherRes.data,
          terrainRes.success ? terrainRes.data : null,
          historicalRes,
          locMetadata || {}
        );
        setLiveRisk(evaluated);
        setLocationRisk(evaluated);
        if (locMetadata && locMetadata.is_gps) {
          const updatedDynamicLoc = {
            ...locMetadata,
            current_risk: evaluated,
            environmental_data: {
              rainfall_rate: weatherRes.data.current_rain || 0,
              soil_saturation_pct: evaluated.factors?.soil_saturation || 35,
              river_capacity_pct: evaluated.factors?.river_capacity || 30
            }
          };
          setSelectedLocation(updatedDynamicLoc);
          setEnvironmentalData(updatedDynamicLoc.environmental_data);
        }
        setLastWeatherUpdated(new Date());
        setLiveWeatherError(null);
      } else {
        setLiveWeatherError(weatherRes.error || 'Live weather data temporarily unavailable.');
      }
    } catch (err) {
      console.error('[AppContext] Error fetching multi-source live telemetry:', err);
      setLiveWeatherError('Live weather data temporarily unavailable.');
    } finally {
      setIsLiveWeatherLoading(false);
    }
  }, [locationName]);

  // Reverse Geocoding & Place Resolution from Coordinates
  const resolvePlaceName = async (lat, lng, locsList = []) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || '';
        const state = data.principalSubdivision || '';
        if (city && state && city !== state) {
          return { fullName: `${city}, ${state} (Live GPS)`, city, state };
        } else if (city || state) {
          return { fullName: `${city || state} (Live GPS)`, city: city || state, state: data.countryName || '' };
        }
      }
    } catch (e) {
      // network timeout/blocked fallback
    }

    // Find closest monitored sector in database
    if (Array.isArray(locsList) && locsList.length > 0) {
      let nearest = null;
      let minDist = Infinity;
      for (const loc of locsList) {
        if (loc.lat && loc.lng) {
          const dLat = (loc.lat - lat) * Math.PI / 180;
          const dLng = (loc.lng - lng) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat * Math.PI / 180) * Math.cos(loc.lat * Math.PI / 180) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const distKm = 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
          if (distKm < minDist) {
            minDist = distKm;
            nearest = loc;
          }
        }
      }
      if (nearest) {
        if (minDist < 25) {
          return { fullName: `${nearest.name}, ${nearest.state} (Live GPS)`, city: nearest.name, state: nearest.state };
        }
        return { fullName: `${nearest.name} Region (${Math.round(minDist)} km away) (Live GPS)`, city: nearest.name, state: nearest.state };
      }
    }

    return { fullName: `Live GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, city: 'Live GPS', state: '' };
  };

  // Fallback IP Geolocation for desktops/browsers with blocked GPS
  const getIpLocationFallback = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const d = await res.json();
        if (typeof d.latitude === 'number' && typeof d.longitude === 'number') {
          return {
            latitude: d.latitude,
            longitude: d.longitude,
            city: d.city || '',
            region: d.region || d.country_name || '',
            country: d.country_name || 'India'
          };
        }
      }
    } catch (err) {
      // ignore
    }
    return null;
  };

  // 4. Request Browser Geolocation (Live GPS) with Reverse Geocoding & Fallback
  const requestUserLocation = useCallback(() => {
    setIsGpsLoading(true);
    setGpsError(null);

    const applyResolvedGps = async (latitude, longitude, accuracy = null, source = 'gps', knownName = null) => {
      try {
        const place = knownName 
          ? { fullName: `${knownName} (Live GPS)`, city: knownName, state: '' }
          : await resolvePlaceName(latitude, longitude, locations);

        setUserCoords({ lat: latitude, lng: longitude });
        setUserGpsLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || null,
          active: true,
          name: place.fullName,
          timestamp: Date.now(),
          source
        });
        setLocationInputMode('gps');
        setLocationName(place.fullName);
        setIsGpsLoading(false);
        setGpsError(null);

        const dynamicLoc = {
          id: 9999,
          name: place.city || place.fullName,
          state: place.state || '',
          lat: latitude,
          lng: longitude,
          is_gps: true,
          current_risk: { overall_level: 'LOW', overall_score: 20, dominant_hazard: 'flash_flood' },
          environmental_data: { rainfall_rate: 0, soil_saturation_pct: 30, river_capacity_pct: 30 }
        };
        setSelectedLocation(dynamicLoc);

        // Populate realistic high-ground safe shelters near the user's GPS coordinates
        const dynamicShelters = [
          {
            id: 99991,
            location_id: 9999,
            name: `${place.city || 'Local Area'} High-Ground Safe Shelter`,
            type: "Primary Concrete Safe Shelter",
            lat: latitude + 0.008,
            lng: longitude + 0.007,
            capacity: 850,
            current_occupancy: 120,
            occupancy_pct: 14,
            status: "OPEN",
            distance_km: 1.2,
            est_walking_mins: 15,
            contact_phone: "+91 1800-180-1104",
            facilities: "Emergency Medical Bay, High-Output Generators, Dry Food Rations, Purified Water"
          },
          {
            id: 99992,
            location_id: 9999,
            name: `${place.city || 'Local Area'} Community Refuge Center`,
            type: "Secondary Emergency Shelter",
            lat: latitude - 0.006,
            lng: longitude - 0.006,
            capacity: 450,
            current_occupancy: 40,
            occupancy_pct: 9,
            status: "OPEN",
            distance_km: 2.1,
            est_walking_mins: 25,
            contact_phone: "+91 94120-00108",
            facilities: "Trauma Care, Helipad Access, Satellite VHF Communication, Relief Supplies"
          }
        ];
        setSafeLocations(dynamicShelters);
        setSelectedShelter(dynamicShelters[0]);

        // Fetch live weather & real terrain directly for the GPS coordinates
        fetchLiveWeatherData(latitude, longitude, dynamicLoc, true);
      } catch (err) {
        console.error('[requestUserLocation] Error applying location:', err);
        setIsGpsLoading(false);
      }
    };

    if (typeof window === 'undefined' || !navigator.geolocation) {
      getIpLocationFallback().then((ipLoc) => {
        if (ipLoc) {
          applyResolvedGps(ipLoc.latitude, ipLoc.longitude, 5000, 'ip', `${ipLoc.city}, ${ipLoc.region}`);
        } else {
          const err = 'Browser Geolocation is not supported by your device.';
          setGpsError(err);
          setLiveWeatherError(err);
          setIsGpsLoading(false);
        }
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log("GPS coordinates received:", latitude, longitude, "accuracy:", accuracy);
        applyResolvedGps(latitude, longitude, accuracy, 'gps');
      },
      async (err) => {
        console.warn("Browser GPS issue:", err.message, "attempting IP location fallback...");
        const ipLoc = await getIpLocationFallback();
        if (ipLoc) {
          applyResolvedGps(ipLoc.latitude, ipLoc.longitude, 5000, 'ip', `${ipLoc.city}, ${ipLoc.region}`);
        } else {
          let errorMsg = "Unable to determine your location. Please allow location permissions in your browser address bar.";
          if (err.code === 1) { // PERMISSION_DENIED
            errorMsg = "Location access was denied. Please allow location permissions in your browser address bar (lock icon).";
          } else if (err.code === 2) { // POSITION_UNAVAILABLE
            errorMsg = "Location coordinates temporarily unavailable from device GPS.";
          } else if (err.code === 3) { // TIMEOUT
            errorMsg = "Location request timed out. Please retry in a few moments.";
          }
          setGpsError(errorMsg);
          setLiveWeatherError(errorMsg);
          setIsGpsLoading(false);
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, [fetchLiveWeatherData, locations]);

  // 5. Set Manual Coordinates (Step 3)
  const setManualCoordinates = useCallback((lat, lng, name = 'Custom Coordinates') => {
    setUserCoords({ lat, lng });
    setLocationName(name);
    setLocationInputMode('manual');
    fetchLiveWeatherData(lat, lng, null, true);
  }, [fetchLiveWeatherData]);

  // 6. Manual Risk Refresh (Step 5)
  const refreshRisk = useCallback(() => {
    fetchLiveWeatherData(userCoords.lat, userCoords.lng, selectedLocation, true);
  }, [userCoords, selectedLocation, fetchLiveWeatherData]);

  // Initial Load & Automatic 10-Minute Refresh Timer (Step 5)
  useEffect(() => {
    fetchSystemData();
    fetchLiveWeatherData(userCoords.lat, userCoords.lng, selectedLocation);
  }, [fetchSystemData]);

  useEffect(() => {
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const timer = setInterval(() => {
      fetchLiveWeatherData(userCoords.lat, userCoords.lng, selectedLocation, true);
    }, TEN_MINUTES_MS);
    return () => clearInterval(timer);
  }, [userCoords, selectedLocation, fetchLiveWeatherData]);

  // Location selection change
  useEffect(() => {
    if (selectedLocationId && selectedLocationId !== 9999) {
      fetchLocationData(selectedLocationId);
    }
  }, [selectedLocationId, fetchLocationData]);

  // Select Location Handler (re-fetches live weather for selected region if coordinates exist)
  const selectLocation = (id) => {
    if (id === 'gps' || id === 9999) {
      requestUserLocation();
      return;
    }
    const numId = Number(id);
    setSelectedLocationId(numId);
    const loc = locations.find(l => l.id === numId);
    if (loc) {
      setSelectedLocation(loc);
      if (loc.lat && loc.lng) {
        setUserCoords({ lat: loc.lat, lng: loc.lng });
        setLocationName(`${loc.name}, ${loc.state}`);
        setLocationInputMode('preset');
        fetchLiveWeatherData(loc.lat, loc.lng, loc, false);
      }
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

  // Apply SIH 7-Phase Disaster Scenario Step
  const applyDemoPhase = async (phaseNum) => {
    try {
      setIsSimulating(true);
      const phaseInt = Math.max(1, Math.min(7, parseInt(phaseNum, 10)));
      setDemoPhase(phaseInt);
      setStatusMessage(`Advancing to Phase ${phaseInt}/7...`);
      
      const res = await api.applyDemoPhase(phaseInt, selectedLocationId);
      await fetchSystemData();
      await fetchLocationData(selectedLocationId);

      setSimulationState(prev => ({
        ...prev,
        demo_phase: phaseInt,
        active_scenario: 'sih_uttarakhand_deluge',
        scenario_title: res.phase_metadata?.title || `Phase ${phaseInt}`,
        description: res.phase_metadata?.story_details || ''
      }));

      if (phaseInt >= 5 && res.alert) {
        setActiveAlert(res.alert);
        setShowEmergencyModal(true);
        if (!isSirenMuted) {
          soundService.playEmergencySiren();
          setIsSirenActive(true);
        }
      } else if (phaseInt === 1) {
        soundService.stopEmergencySiren();
        setIsSirenActive(false);
        setShowEmergencyModal(false);
        setActiveAlert(null);
      }
      return res;
    } catch (err) {
      console.error('[AppContext] Error applying demo phase:', err);
    } finally {
      setIsSimulating(false);
      setStatusMessage('');
    }
  };

  // Automated 60-90s SIH Scenario Progression Runner
  const runDisasterScenario = async () => {
    setIsScenarioRunning(true);
    for (let p = 1; p <= 7; p++) {
      await applyDemoPhase(p);
      // Wait 10-11 seconds per phase so 7 phases complete in ~75 seconds total
      await new Promise(resolve => setTimeout(resolve, 10500));
    }
    setIsScenarioRunning(false);
  };

  const pauseDisasterScenario = () => {
    setIsScenarioRunning(false);
  };

  const resetDisasterScenario = async () => {
    setIsScenarioRunning(false);
    await applyDemoPhase(1);
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

  // Reactivate Alert
  const reactivateAlert = async (alertId) => {
    try {
      const res = await api.reactivateAlert(alertId);
      if (res.success) {
        await fetchSystemData();
      }
    } catch (err) {
      console.error('[AppContext] Reactivate alert error:', err);
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

  // Submit Citizen SOS Request (Calls Backend API + Syncs)
  const submitSosRequest = async (sosData) => {
    try {
      const created = await sosService.createSos(sosData);
      await fetchSosRequests();
      return created;
    } catch (err) {
      console.error('[AppContext] Submit SOS error:', err);
      throw err;
    }
  };

  // Acknowledge SOS
  const acknowledgeSos = async (sosId) => {
    try {
      const res = await sosService.acknowledgeSos(sosId);
      await fetchSosRequests();
      return res;
    } catch (err) {
      console.error('[AppContext] Acknowledge SOS error:', err);
    }
  };

  // Dispatch Rescue Team to SOS
  const dispatchRescueToSos = async (sosId, teamId, teamName) => {
    try {
      const res = await sosService.dispatchTeamToSos(sosId, teamId, teamName);
      await fetchSosRequests();
      return res;
    } catch (err) {
      console.error('[AppContext] Dispatch SOS error:', err);
    }
  };

  // Update SOS status (Authority dispatch / resolve)
  const updateSosStatus = async (sosId, newStatus, extraData = {}) => {
    try {
      const res = await sosService.updateSosStatus(sosId, newStatus, extraData);
      await fetchSosRequests();
      return res;
    } catch (err) {
      console.error('[AppContext] Update SOS status error:', err);
    }
  };

  // Resolve SOS
  const resolveSos = async (sosId) => {
    try {
      const res = await sosService.resolveSos(sosId);
      await fetchSosRequests();
      return res;
    } catch (err) {
      console.error('[AppContext] Resolve SOS error:', err);
    }
  };

  // Create Demo SOS
  const createDemoSos = async (overrideData = {}) => {
    try {
      const res = await sosService.createDemoSos(overrideData);
      await fetchSosRequests();
      return res;
    } catch (err) {
      console.error('[AppContext] Create demo SOS error:', err);
    }
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
        setActiveAlert,
        safeLocations,
        selectedShelter,
        setSelectedShelter,
        sosRequests,
        submitSosRequest,
        acknowledgeSos,
        dispatchRescueToSos,
        updateSosStatus,
        resolveSos,
        createDemoSos,
        fetchSosRequests,
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
        isAlertHistoryOpen,
        setIsAlertHistoryOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        isGlobalSosOpen,
        setIsGlobalSosOpen,
        demoPhase,
        setDemoPhase,
        isScenarioRunning,
        applyDemoPhase,
        runDisasterScenario,
        pauseDisasterScenario,
        resetDisasterScenario,
        loading,
        statusMessage,
        selectLocation,
        userCoords,
        userGpsLocation,
        setUserGpsLocation,
        isGpsLoading,
        gpsError,
        locationName,
        locationInputMode,
        liveWeather,
        liveTerrain,
        historicalRisk,
        liveRisk,
        isLiveWeatherLoading,
        liveWeatherError,
        lastWeatherUpdated,
        requestUserLocation,
        setManualCoordinates,
        refreshRisk,
        toggleSiren,
        stopSiren,
        issueAlert,
        resolveAlert,
        reactivateAlert,
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
