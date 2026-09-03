import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  Polyline, 
  Polygon,
  Circle,
  Marker, 
  useMap, 
  Tooltip 
} from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Navigation, 
  Info, 
  MapPin, 
  Crosshair, 
  Maximize2,
  Minimize2,
  Eye,
  Radio,
  Building2,
  Droplets,
  Mountain,
  Activity,
  Wind,
  Compass,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Footprints,
  Sliders,
  ChevronDown,
  ChevronUp,
  Flame,
  Globe
} from 'lucide-react';

// Custom Map Controller to smoothly fly to center coordinates and handle resize events
function MapController({ center, zoom, bounds }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size to prevent grey tiles on render/resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 11, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

// Available High-Definition Keyless Basemap Providers (100% Free, Zero Watermark, No API Key Required)
const BASEMAP_PROVIDERS = {
  dark: {
    name: 'Tactical Dark',
    icon: '🌒',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, HERE, Garmin, OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
  },
  terrain: {
    name: 'Topo Mountain',
    icon: '🏔️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, DeLorme, NAVTEQ, TomTom, Intermap'
  },
  streets: {
    name: 'Civil Streets',
    icon: '🗺️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, HERE, Garmin, OpenStreetMap contributors'
  }
};

// Static simulated high-risk hazard spatial polygons & river corridors for GIS visualization
const HAZARD_CORRIDORS = [
  {
    id: 'alaknanda_flood_corridor',
    name: 'Alaknanda River Surge Corridor',
    type: 'flood',
    severity: 'CRITICAL',
    coords: [
      [30.435, 79.300],
      [30.422, 79.315],
      [30.405, 79.330],
      [30.395, 79.345],
      [30.400, 79.355],
      [30.415, 79.340],
      [30.430, 79.325],
      [30.445, 79.305]
    ],
    info: 'Peak River Discharge: 2,400 m³/s — Flash Inundation Buffer 450m'
  },
  {
    id: 'mandakini_valley_corridor',
    name: 'Mandakini Valley Debris Channel',
    type: 'flood',
    severity: 'CRITICAL',
    coords: [
      [30.745, 79.055],
      [30.730, 79.065],
      [30.710, 79.080],
      [30.718, 79.095],
      [30.738, 79.078],
      [30.755, 79.060]
    ],
    info: 'Glacial Outflow Surge Path — 5.8m Above Safety Threshold'
  },
  {
    id: 'joshimath_slope_corridor',
    name: 'Joshimath Sunil Ward Subsidence Zone',
    type: 'landslide',
    severity: 'HIGH',
    coords: [
      [30.565, 79.555],
      [30.550, 79.560],
      [30.542, 79.575],
      [30.558, 79.580],
      [30.570, 79.568]
    ],
    info: 'Geotechnical Slope: 36° — Soil Saturation: 85% — High Creep Velocity'
  },
  {
    id: 'wayanad_debris_zone',
    name: 'Meppadi Debris Flow Hazard Cone',
    type: 'landslide',
    severity: 'CRITICAL',
    coords: [
      [11.565, 76.115],
      [11.545, 76.120],
      [11.538, 76.138],
      [11.558, 76.142],
      [11.572, 76.128]
    ],
    info: 'Slope: 38° — Soil Pore Pressure Peak — Active Mudslide Warning'
  },
  {
    id: 'brahmaputra_floodplain',
    name: 'Guwahati Brahmaputra Flood Basin',
    type: 'flood',
    severity: 'HIGH',
    coords: [
      [26.160, 71.710],
      [26.135, 71.725],
      [26.130, 71.755],
      [26.155, 71.765],
      [26.175, 71.735]
    ],
    info: 'River Inundation Depth: 6.8m — 91% Carrying Capacity'
  }
];

// Road Hazard / Checkpoint Markers
const ROAD_CHECKPOINTS = [
  {
    id: 'cp-1',
    name: 'NH-58 Chamoli Bridge',
    status: 'BLOCKED',
    hazard: 'Inundated (Water 1.2m over deck)',
    lat: 30.4180,
    lng: 79.3120,
    icon: '🚫'
  },
  {
    id: 'cp-2',
    name: 'Joshimath Bypass Ridge Highway',
    status: 'CLEAR',
    hazard: 'Designated High-Ground Evacuation Corridor',
    lat: 30.5580,
    lng: 79.5720,
    icon: '✅'
  },
  {
    id: 'cp-3',
    name: 'Kedarnath Valley Trail Chokepoint',
    status: 'CAUTION',
    hazard: 'Rockfall Debris On Shoulder — Passable with SDRF Escort',
    lat: 30.7280,
    lng: 79.0720,
    icon: '⚠️'
  }
];

export default function RiskMap({ height = "520px", showRoute = true, className = "" }) {
  const {
    locations,
    selectedLocationId,
    selectedLocation,
    selectLocation,
    userCoords,
    userGpsLocation,
    isGpsLoading,
    gpsError,
    locationInputMode,
    requestUserLocation,
    safeLocations,
    selectedShelter,
    setSelectedShelter,
    selectedLayer,
    setSelectedLayer,
    setActivePage,
    environmentalData,
    locationRisk,
    submitSosRequest
  } = useApp();

  const [basemap, setBasemap] = useState('dark');
  const [zoomLevel, setZoomLevel] = useState(11);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRadarSweep, setShowRadarSweep] = useState(true);
  const [showIsochrones, setShowIsochrones] = useState(true);
  const [showRoadBlocks, setShowRoadBlocks] = useState(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);
  const [isHudExpanded, setIsHudExpanded] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);

  const containerRef = useRef(null);

  const activeLoc = selectedLocation || locations.find(l => l.id === selectedLocationId) || locations[0];
  const isGpsMode = locationInputMode === 'gps' && userGpsLocation?.lat && userGpsLocation?.lng;
  const effectiveCenterLat = isGpsMode ? userGpsLocation.lat : (activeLoc ? activeLoc.lat : 30.4124);
  const effectiveCenterLng = isGpsMode ? userGpsLocation.lng : (activeLoc ? activeLoc.lng : 79.3198);
  const centerLat = effectiveCenterLat;
  const centerLng = effectiveCenterLng;

  // Toggle Fullscreen View
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Standardized Risk Colors
  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return '#EF4444'; // Red
      case 'HIGH':
        return '#F97316'; // Orange
      case 'MODERATE':
        return '#F59E0B'; // Amber
      default:
        return '#10B981'; // Emerald
    }
  };

  // Get score/level based on active selectedLayer
  const getLocationHazardLevel = (loc) => {
    const risk = loc.current_risk || { overall_level: 'LOW' };
    switch (selectedLayer) {
      case 'flood':
      case 'flash_flood':
        return risk.flash_flood_level || risk.overall_level || 'LOW';
      case 'landslide':
        return risk.landslide_level || 'LOW';
      case 'rainfall':
      case 'heavy_rainfall':
        return risk.heavy_rainfall_level || 'LOW';
      default:
        return risk.overall_level || 'LOW';
    }
  };

  // Target destination shelter coordinates for dynamic evacuation route
  const targetShelter = selectedShelter || (safeLocations && safeLocations.length > 0 ? safeLocations[0] : null);
  
  // Create natural multi-point curved mountain path to shelter
  const routeCoords = useMemo(() => {
    if (!activeLoc || !targetShelter) return [];
    const dLat = targetShelter.lat - activeLoc.lat;
    const dLng = targetShelter.lng - activeLoc.lng;

    return [
      [activeLoc.lat, activeLoc.lng],
      [activeLoc.lat + dLat * 0.28 + 0.0016, activeLoc.lng + dLng * 0.22 - 0.0012],
      [activeLoc.lat + dLat * 0.55 + 0.0024, activeLoc.lng + dLng * 0.50 + 0.0015],
      [activeLoc.lat + dLat * 0.82 + 0.0009, activeLoc.lng + dLng * 0.78 - 0.0006],
      [targetShelter.lat, targetShelter.lng]
    ];
  }, [activeLoc, targetShelter]);

  // Dynamic Waypoints along evacuation path
  const routeWaypoints = useMemo(() => {
    if (routeCoords.length < 4) return [];
    return [
      {
        id: 'wp-start',
        lat: routeCoords[0][0],
        lng: routeCoords[0][1],
        title: 'Start Location (Current Sector)',
        step: 'Start'
      },
      {
        id: 'wp-1',
        lat: routeCoords[1][0],
        lng: routeCoords[1][1],
        title: 'Ascend Uphill along Ridge Highway',
        step: 'Point 1'
      },
      {
        id: 'wp-2',
        lat: routeCoords[2][0],
        lng: routeCoords[2][1],
        title: 'Contour Crest (Clear of Flood Level)',
        step: 'Point 2'
      },
      {
        id: 'wp-end',
        lat: routeCoords[4][0],
        lng: routeCoords[4][1],
        title: targetShelter?.name || 'Safe Relief Haven',
        step: 'Safe Haven'
      }
    ];
  }, [routeCoords, targetShelter]);

  // Fit bounds to show all locations across India / Himalayas
  const handleFitAllBounds = () => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
      setMapBounds(bounds);
      setTimeout(() => setMapBounds(null), 1500);
    }
  };

  // Custom Icon Generators
  const createShelterIcon = (isSelected, shelter) => new L.DivIcon({
    className: 'custom-shelter-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          background: linear-gradient(135deg, #10B981, #059669); 
          color: white; 
          width: 32px; 
          height: 32px; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid #FFFFFF; 
          box-shadow: 0 4px 14px rgba(16,185,129,0.6), 0 0 0 ${isSelected ? '4px rgba(52,211,153,0.5)' : '1px rgba(0,0,0,0.4)'};
          font-size: 15px;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          🏥
        </div>
        <div style="
          margin-top: 3px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid #10B981;
          color: #A7F3D0;
          font-size: 9px;
          font-family: monospace;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        ">
          ${shelter.capacity - shelter.current_occupancy} beds
        </div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 20]
  });

  const createHazardNodeIcon = (loc, isSelected, level, color) => {
    const isCritical = level === 'CRITICAL';
    const isHigh = level === 'HIGH';

    const getHazardSymbol = (type) => {
      switch (type) {
        case 'flash_flood':
        case 'flood':
          return '🌊';
        case 'landslide':
          return '⛰️';
        case 'heavy_rainfall':
        case 'rainfall':
          return '🌧️';
        case 'glof':
          return '❄️';
        default:
          return '⚠️';
      }
    };

    const hazardType = loc.current_risk?.dominant_hazard || (loc.lat > 30 ? 'flash_flood' : 'landslide');
    const symbol = getHazardSymbol(hazardType);

    return new L.DivIcon({
      className: `custom-hazard-node ${isCritical ? 'critical-active' : ''}`,
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${isCritical ? `
            <div class="critical-ping-ring" style="position: absolute; width: 42px; height: 42px; border-radius: 50%; border: 2px solid ${color}; background: ${color}20;"></div>
            <div class="pulse-marker-ring" style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 2px solid ${color};"></div>
          ` : ''}
          ${isHigh ? `
            <div class="pulse-marker-ring" style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid ${color};"></div>
          ` : ''}
          <div style="
            width: ${isSelected ? '28px' : '24px'}; 
            height: ${isSelected ? '28px' : '24px'}; 
            border-radius: 50%; 
            background: radial-gradient(circle, ${color} 40%, #0F172A 100%); 
            border: 2px solid ${isSelected ? '#FFFFFF' : color}; 
            box-shadow: 0 0 14px ${color}, 0 4px 8px rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #FFFFFF;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            ${symbol}
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });
  };

  const createActiveReticleIcon = (color) => new L.DivIcon({
    className: 'custom-active-reticle',
    html: `
      <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <div class="target-reticle-spin" style="position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 1.5px dashed ${color}; opacity: 0.85;"></div>
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #38BDF8; box-shadow: 0 0 15px #38BDF8;"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #38BDF8; box-shadow: 0 0 8px #FFFFFF;"></div>
        <div style="position: absolute; top: 0; left: 24px; width: 2px; height: 8px; background: #38BDF8;"></div>
        <div style="position: absolute; bottom: 0; left: 24px; width: 2px; height: 8px; background: #38BDF8;"></div>
        <div style="position: absolute; left: 0; top: 24px; height: 2px; width: 8px; background: #38BDF8;"></div>
        <div style="position: absolute; right: 0; top: 24px; height: 2px; width: 8px; background: #38BDF8;"></div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25]
  });

  const createUserGpsIcon = () => new L.DivIcon({
    className: 'custom-gps-user-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(6, 182, 212, 0.35); border: 2px solid #06B6D4; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #06B6D4; border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(6, 182, 212, 0.95); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
        </div>
        <div style="position: absolute; bottom: -20px; background: #0284C7; color: white; font-size: 9px; font-weight: 900; font-family: monospace; padding: 2px 6px; border-radius: 6px; border: 1px solid white; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
          YOU ARE HERE
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });

  const createRoadCheckpointIcon = (cp) => new L.DivIcon({
    className: 'custom-checkpoint-marker',
    html: `
      <div style="
        background: ${cp.status === 'BLOCKED' ? '#DC2626' : (cp.status === 'CAUTION' ? '#D97706' : '#059669')};
        color: white;
        padding: 3px 6px;
        border-radius: 8px;
        border: 1.5px solid white;
        font-family: monospace;
        font-size: 10px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 3px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
        white-space: nowrap;
      ">
        <span>${cp.icon}</span>
        <span>${cp.status}</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12]
  });

  const activeColor = getRiskColor(activeLoc?.current_risk?.overall_level || 'LOW');

  // Layer Visibility Booleans (Strict Layer Isolation)
  const isAll = selectedLayer === 'all' || !selectedLayer;
  const isFlood = selectedLayer === 'flood' || selectedLayer === 'flash_flood';
  const isLandslide = selectedLayer === 'landslide';
  const isRainfall = selectedLayer === 'rainfall' || selectedLayer === 'heavy_rainfall';
  const isSafeShelters = selectedLayer === 'safe_locations';

  // 1. Filtered Hazard Polygons / Corridors
  const visibleCorridors = useMemo(() => {
    if (isSafeShelters || isRainfall) return [];
    if (isFlood) return HAZARD_CORRIDORS.filter(c => c.type === 'flood');
    if (isLandslide) return HAZARD_CORRIDORS.filter(c => c.type === 'landslide');
    return HAZARD_CORRIDORS; // 'all'
  }, [isAll, isFlood, isLandslide, isRainfall, isSafeShelters]);

  // 2. Filtered Road Checkpoint Markers
  const visibleRoadBlocks = useMemo(() => {
    if (!showRoadBlocks || isSafeShelters || isRainfall) return [];
    if (isFlood) return ROAD_CHECKPOINTS.filter(cp => cp.hazard.toLowerCase().includes('inundat') || cp.hazard.toLowerCase().includes('flood') || cp.hazard.toLowerCase().includes('water'));
    if (isLandslide) return ROAD_CHECKPOINTS.filter(cp => cp.hazard.toLowerCase().includes('rockfall') || cp.hazard.toLowerCase().includes('debris') || cp.hazard.toLowerCase().includes('slope'));
    return ROAD_CHECKPOINTS; // 'all'
  }, [showRoadBlocks, isAll, isFlood, isLandslide, isRainfall, isSafeShelters]);

  // 3. Filtered Sector Locations
  const filteredLocations = useMemo(() => {
    if (isSafeShelters) return [];
    if (isFlood) {
      return locations.filter(loc => {
        const dom = loc.current_risk?.dominant_hazard;
        const ffLevel = loc.current_risk?.flash_flood_level;
        return dom === 'flash_flood' || dom === 'flood' || (ffLevel && ffLevel !== 'LOW') || (loc.river_proximity_km && loc.river_proximity_km <= 6);
      });
    }
    if (isLandslide) {
      return locations.filter(loc => {
        const dom = loc.current_risk?.dominant_hazard;
        const lsLevel = loc.current_risk?.landslide_level;
        return dom === 'landslide' || (lsLevel && lsLevel !== 'LOW') || (loc.slope_deg && loc.slope_deg >= 18);
      });
    }
    if (isRainfall) {
      return locations.filter(loc => {
        const dom = loc.current_risk?.dominant_hazard;
        const hrLevel = loc.current_risk?.heavy_rainfall_level;
        return dom === 'heavy_rainfall' || (hrLevel && hrLevel !== 'LOW') || (loc.current_risk?.overall_level !== 'LOW');
      });
    }
    return locations;
  }, [locations, isAll, isFlood, isLandslide, isRainfall, isSafeShelters]);

  // 4. Radar Sweep Visibility
  const isRadarVisible = showRadarSweep && (isAll || isRainfall);

  // 5. Shelter & Evacuation Visibility
  const isSheltersVisible = isAll || isSafeShelters;
  const isRouteVisible = showRoute && (isAll || isSafeShelters);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col bg-[#070D18] transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none h-screen w-screen' : ''
      } ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP FLOATING COMMAND CONTROL BAR */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-[400] flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        {/* Left: Hazard Layer Filters */}
        <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-2xl pointer-events-auto overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
          {[
            { id: 'all', label: 'All Hazards', icon: Flame },
            { id: 'flood', label: '🌊 Flash Flood', icon: Droplets },
            { id: 'landslide', label: '⛰️ Landslide', icon: Mountain },
            { id: 'rainfall', label: '🌧️ Rain Radar', icon: Wind },
            { id: 'safe_locations', label: '🏥 Safe Shelters', icon: ShieldCheck }
          ].map((layer) => {
            const isActive = selectedLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Sector Jump, Basemap Selector, Fullscreen & Tactical Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
          {/* Quick Sector Finder Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedLocationId}
              onChange={(e) => selectLocation(Number(e.target.value))}
              className="bg-slate-950/90 backdrop-blur-md text-xs font-mono font-bold text-blue-400 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Jump to Sector...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                  📍 {loc.name} ({loc.state}) — {loc.current_risk?.overall_level || 'LOW'}
                </option>
              ))}
            </select>
          </div>

          {/* Basemap Switcher Buttons */}
          <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-2xl text-xs font-mono">
            {Object.entries(BASEMAP_PROVIDERS).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setBasemap(key)}
                title={`Switch to ${provider.name} basemap`}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 ${
                  basemap === key
                    ? 'bg-slate-800 text-cyan-300 border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{provider.icon}</span>
                <span className="hidden xl:inline">{provider.name}</span>
              </button>
            ))}
          </div>

          {/* Radar Sweep Animation Toggle */}
          <button
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            title="Toggle Live Precipitation Radar Sweep"
            className={`p-2 backdrop-blur-md border rounded-xl shadow-2xl transition-all flex items-center gap-1 text-xs font-mono font-bold ${
              showRadarSweep
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-400'
                : 'bg-slate-950/90 border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Radar</span>
          </button>

          {/* Fit All Bounds */}
          <button
            onClick={handleFitAllBounds}
            title="Fit All Monitored Indian Sectors"
            className="p-2 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white rounded-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-mono font-bold"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">All India</span>
          </button>

          {/* Live GPS Button */}
          <button
            onClick={requestUserLocation}
            disabled={isGpsLoading}
            title="Locate my real-time position via browser GPS"
            className={`p-2 bg-slate-950/90 backdrop-blur-md border rounded-xl shadow-2xl transition-all flex items-center gap-1.5 text-xs font-mono font-bold ${
              locationInputMode === 'gps' && userGpsLocation
                ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 ring-1 ring-cyan-400'
                : 'border-slate-700/80 text-cyan-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isGpsLoading ? 'animate-spin text-amber-400' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">
              {isGpsLoading ? 'Getting location...' : (locationInputMode === 'gps' && userGpsLocation ? 'GPS Active' : 'Live GPS')}
            </span>
          </button>

          {/* Recenter Button */}
          <button
            onClick={() => selectLocation(activeLoc?.id || 1)}
            title="Recenter on Selected Sector"
            className="p-2 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-blue-400 hover:text-white rounded-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-mono font-bold"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Recenter</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
            className="p-2 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-cyan-400 hover:text-white rounded-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-mono font-bold"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM LEFT FLOATING TACTICAL THREAT INDEX LEGEND                     */}
      {/* ========================================================================= */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/92 backdrop-blur-md rounded-xl border border-slate-700/80 text-xs font-mono shadow-2xl pointer-events-auto transition-all max-w-[280px]">
        <div 
          onClick={() => setIsLegendExpanded(!isLegendExpanded)}
          className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-900/60 rounded-xl"
        >
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="tracking-wider">GIS THREAT INDEX</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">
              {locations.length} Sectors
            </span>
            {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {isLegendExpanded && (
          <div className="p-3 pt-0 space-y-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2">
              <div className="flex items-center gap-1.5 bg-red-950/30 p-1.5 rounded border border-red-900/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse shrink-0" />
                <span className="text-red-300 font-semibold">Critical (76-100)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-950/30 p-1.5 rounded border border-orange-900/40">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shrink-0" />
                <span className="text-orange-300 font-semibold">High (51-75)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-950/30 p-1.5 rounded border border-amber-900/40">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shrink-0" />
                <span className="text-amber-300 font-semibold">Moderate (26-50)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-950/30 p-1.5 rounded border border-emerald-900/40">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0" />
                <span className="text-emerald-300 font-semibold">Normal (0-25)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 text-[8px] flex items-center justify-center text-white">🏥</span> 
                  Safe Relief Haven
                </span>
                <span className="text-emerald-400 font-bold">{safeLocations.length} Open</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400 border-t border-dashed border-cyan-300" />
                  Evacuation Safe Path
                </span>
                <span className="text-cyan-400 font-bold">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM RIGHT SECTOR TELEMETRY & ROUTE ACTION HUD                       */}
      {/* ========================================================================= */}
      {activeLoc && (
        <div className="absolute bottom-3 right-3 z-[400] bg-slate-950/92 backdrop-blur-md rounded-xl border border-slate-700/80 text-xs font-mono shadow-2xl pointer-events-auto max-w-sm hidden md:block">
          <div 
            onClick={() => setIsHudExpanded(!isHudExpanded)}
            className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-900/60 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full animate-pulse" 
                style={{ backgroundColor: activeColor }}
              />
              <strong className="text-white text-sm font-sans">{activeLoc.name}</strong>
              <span 
                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                style={{ backgroundColor: `${activeColor}25`, color: activeColor, border: `1px solid ${activeColor}50` }}
              >
                {activeLoc.current_risk?.overall_level || 'MONITORED'}
              </span>
            </div>
            <div className="text-slate-400">
              {isHudExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </div>
          </div>

          {isHudExpanded && (
            <div className="p-3 pt-0 space-y-2.5 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 text-slate-300">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" /> Rainfall Rate
                  </div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {environmentalData?.rainfall_rate || 42.0} mm/h
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" /> River Gauge
                  </div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {environmentalData?.river_level_m || 4.2}m <span className="text-[10px] text-amber-400 font-normal">({environmentalData?.river_trend || 'Rising'})</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Mountain className="w-3 h-3 text-amber-400" /> Slope Saturation
                  </div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {environmentalData?.soil_saturation_pct || 78}% <span className="text-[10px] text-slate-400">({environmentalData?.slope_deg || 34}°)</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Nearest Haven
                  </div>
                  <div className="font-bold text-emerald-400 text-xs mt-0.5 truncate">
                    {targetShelter?.name ? `${targetShelter.distance_km || 1.4} km (~${targetShelter.est_walking_mins || 18}m)` : 'Available'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActivePage('safe-locations')}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate Route</span>
                </button>

                <button
                  onClick={() => setActivePage('risk-intelligence')}
                  className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-lg font-bold text-xs transition-all flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>AI Intel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN LEAFLET MAP CANVAS                                                */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', backgroundColor: '#070D18' }}
        >
          <MapController center={[centerLat, centerLng]} zoom={zoomLevel} bounds={mapBounds} />

          {/* Base Layer */}
          <TileLayer
            key={basemap}
            url={BASEMAP_PROVIDERS[basemap].url}
            attribution={BASEMAP_PROVIDERS[basemap].attribution}
            maxZoom={18}
          />

          {/* 1. Render Filtered Hazard Polygons / Corridors */}
          {visibleCorridors.map((corridor) => {
            const isFlood = corridor.type === 'flood';
            const polyColor = corridor.severity === 'CRITICAL' ? '#EF4444' : '#F97316';

            return (
              <Polygon
                key={corridor.id}
                positions={corridor.coords}
                pathOptions={{
                  color: polyColor,
                  fillColor: isFlood ? '#0284C7' : '#D97706',
                  fillOpacity: 0.35,
                  weight: 2,
                  dashArray: '6, 6'
                }}
              >
                <Tooltip direction="center" opacity={0.95}>
                  <div className="font-mono text-xs">
                    <strong className="text-white block">{corridor.name}</strong>
                    <span className="text-amber-300 text-[10px]">{corridor.info}</span>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-2 min-w-[220px] font-mono text-xs text-slate-100">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>{corridor.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">{corridor.info}</p>
                    <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-300 rounded text-[10px] font-bold uppercase">
                      Active Threat Zone — Avoid Valley Floor
                    </span>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 2. Doppler Precipitation Radar Overlay (Simulated Radar Heat Rings) */}
          {isRadarVisible && (
            <>
              {/* Rain Sweep around active location */}
              <Circle
                center={[centerLat, centerLng]}
                radius={8000}
                pathOptions={{
                  color: '#38BDF8',
                  fillColor: '#0284C7',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
              <Circle
                center={[centerLat, centerLng]}
                radius={16000}
                pathOptions={{
                  color: '#0284C7',
                  fillColor: '#0369A1',
                  fillOpacity: 0.08,
                  weight: 1
                }}
              />
            </>
          )}

          {/* 3. Safe Walking Isochrone Buffers around Target Shelter */}
          {showIsochrones && isSheltersVisible && targetShelter && (
            <>
              <Circle
                center={[targetShelter.lat, targetShelter.lng]}
                radius={500}
                pathOptions={{
                  color: '#10B981',
                  fillColor: '#10B981',
                  fillOpacity: 0.15,
                  weight: 1.5
                }}
              >
                <Tooltip direction="top" opacity={0.9}>
                  <span className="font-mono text-[10px] text-emerald-300 font-bold">5-Min Walking Safety Buffer</span>
                </Tooltip>
              </Circle>
              <Circle
                center={[targetShelter.lat, targetShelter.lng]}
                radius={1200}
                pathOptions={{
                  color: '#059669',
                  fillColor: '#059669',
                  fillOpacity: 0.06,
                  weight: 1,
                  dashArray: '4, 4'
                }}
              />
            </>
          )}

          {/* 4. Road Blockade / Checkpoint Markers */}
          {visibleRoadBlocks.map((cp) => (
            <Marker
              key={cp.id}
              position={[cp.lat, cp.lng]}
              icon={createRoadCheckpointIcon(cp)}
            >
              <Popup>
                <div className="p-2 min-w-[200px] font-mono text-xs">
                  <div className="font-bold text-white text-sm mb-1">{cp.name}</div>
                  <div className="text-slate-300 text-[11px] mb-2">{cp.hazard}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    cp.status === 'BLOCKED' ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'
                  }`}>
                    STATUS: {cp.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 5. Multi-Hazard Risk Nodes (Filtered by Active Layer) */}
          {filteredLocations.map((loc) => {
            const level = getLocationHazardLevel(loc);
            const color = getRiskColor(level);
            const isSelected = loc.id === selectedLocationId;

            return (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lng]}
                icon={createHazardNodeIcon(loc, isSelected, level, color)}
                eventHandlers={{
                  click: () => selectLocation(loc.id)
                }}
              >
                <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
                  <span className="font-mono font-bold text-xs">
                    {loc.name}: <span style={{ color }}>{level} RISK</span>
                  </span>
                </Tooltip>

                <Popup>
                  <div className="p-2 min-w-[240px] font-mono text-xs text-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
                      <div>
                        <strong className="text-base text-white font-sans block">{loc.name}</strong>
                        <span className="text-[10px] text-slate-400">{loc.region || loc.state}, {loc.country}</span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm"
                        style={{ backgroundColor: `${color}35`, color, border: `1px solid ${color}80` }}
                      >
                        {level}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300 mb-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Terrain Elevation:</span>
                        <span className="text-white font-bold">{loc.elevation || 1200} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Geomorphic Type:</span>
                        <span>{loc.terrain_type || 'Mountain Valley'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Population at Risk:</span>
                        <span className="text-amber-400 font-bold">{(loc.population || 45000).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          selectLocation(loc.id);
                          setActivePage('risk-intelligence');
                        }}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-md transition-all text-center"
                      >
                        Inspect AI Model
                      </button>

                      <button
                        onClick={() => {
                          selectLocation(loc.id);
                          setActivePage('safe-locations');
                        }}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition-all text-center"
                      >
                        Safe Route
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 6. Active Target Reticle Overlay */}
          {activeLoc && !isSafeShelters && (
            <Marker 
              position={[activeLoc.lat, activeLoc.lng]} 
              icon={createActiveReticleIcon(activeColor)}
            />
          )}

          {/* 7. Safe Relief Shelters (Visible when All or Safe Shelters selected) */}
          {isSheltersVisible && safeLocations.map((shelter) => {
            const isSelected = selectedShelter?.id === shelter.id;

            return (
              <Marker
                key={shelter.id}
                position={[shelter.lat, shelter.lng]}
                icon={createShelterIcon(isSelected, shelter)}
                eventHandlers={{
                  click: () => setSelectedShelter(shelter)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[240px] font-mono text-xs text-slate-100">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>{shelter.name}</span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300 mb-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Capacity:</span>
                        <span className="text-white font-bold">{shelter.capacity} people</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Occupancy:</span>
                        <span className="text-amber-400 font-bold">{shelter.current_occupancy} ({shelter.occupancy_pct}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Walking Distance:</span>
                        <span className="text-emerald-400 font-bold">{shelter.distance_km} km (~{shelter.est_walking_mins} mins)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Helpline Phone:</span>
                        <span className="text-cyan-300 font-mono">{shelter.contact_phone || '1800-180-1104'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        Facilities: <span className="text-slate-200">{shelter.facilities || 'Medical Aid, Generators, Rations'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedShelter(shelter);
                        setActivePage('safe-locations');
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Engage Evacuation Guidance</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 8. Animated Evacuation Route Polyline (Visible when All or Safe Shelters selected) */}
          {isRouteVisible && routeCoords.length > 0 && (
            <>
              {/* Outer Glow Halo */}
              <Polyline
                positions={routeCoords}
                pathOptions={{
                  color: '#0284C7',
                  weight: 8,
                  opacity: 0.4
                }}
              />
              {/* Primary Animated Dashed Path */}
              <Polyline
                className="leaflet-animated-route"
                positions={routeCoords}
                pathOptions={{
                  color: '#38BDF8',
                  weight: 4,
                  opacity: 1
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="font-mono text-xs text-center">
                    <strong className="text-cyan-300 block">⚡ HIGH-GROUND SAFE CORRIDOR</strong>
                    <span>Distance: {targetShelter?.distance_km || 1.4} km (~{targetShelter?.est_walking_mins || 18} mins)</span>
                  </div>
                </Tooltip>
              </Polyline>
            </>
          )}

          {/* 9. User Live GPS Marker ("YOU ARE HERE") */}
          {userGpsLocation && userGpsLocation.lat && userGpsLocation.lng && (
            <Marker
              position={[userGpsLocation.lat, userGpsLocation.lng]}
              icon={createUserGpsIcon()}
              zIndexOffset={10000}
            >
              <Tooltip direction="top" offset={[0, -22]} opacity={0.95} permanent>
                <span className="font-mono font-bold text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500 shadow-lg">
                  📍 YOU ARE HERE
                </span>
              </Tooltip>
              <Popup>
                <div className="p-2.5 min-w-[220px] font-mono text-xs text-slate-100 bg-slate-950 rounded-xl border border-cyan-500">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-sm mb-1.5 border-b border-slate-800 pb-1">
                    <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Your Current Position</span>
                  </div>
                  <div className="space-y-1 text-slate-300 text-[11px] mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="text-white font-bold">{userGpsLocation.lat.toFixed(4)}°N, {userGpsLocation.lng.toFixed(4)}°E</span>
                    </div>
                    {userGpsLocation.accuracy && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">GPS Accuracy:</span>
                        <span className="text-emerald-400 font-bold">±{Math.round(userGpsLocation.accuracy)} m</span>
                      </div>
                    )}
                  </div>
                  <span className="block text-center py-1 bg-cyan-950/80 border border-cyan-500 text-cyan-300 rounded text-[10px] font-bold uppercase">
                    Live Geolocation Node
                  </span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
