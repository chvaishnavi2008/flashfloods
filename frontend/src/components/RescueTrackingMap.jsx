import React, { useEffect, useState, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  Polyline, 
  Marker, 
  useMap, 
  Tooltip,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldAlert, 
  Navigation, 
  MapPin, 
  Crosshair, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Send, 
  Radio, 
  Users, 
  Flag,
  Sparkles,
  Layers,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

// Controller to smoothly animate / pan map
function MapFlyController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 11, { duration: 1.0 });
    }
  }, [center, zoom, map]);

  return null;
}

// Map Click Handler for selecting custom destinations
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

// Create Custom HTML DivIcons for Rescue Teams
const createTeamIcon = (team, isSelected) => {
  const isEnRoute = team.status === 'EN ROUTE';
  const isOnSite = team.status === 'ON SITE';
  const isEmergency = team.status === 'EMERGENCY';
  const isAssigned = team.status === 'ASSIGNED';

  let colorClass = 'bg-blue-600 border-blue-400 text-white';
  let pulseClass = '';
  let badgeText = 'TEAM';

  if (isEmergency) {
    colorClass = 'bg-rose-600 border-rose-400 text-white';
    pulseClass = 'animate-ping';
    badgeText = 'SOS';
  } else if (isOnSite) {
    colorClass = 'bg-emerald-600 border-emerald-400 text-white';
    badgeText = 'ON SITE';
  } else if (isEnRoute) {
    colorClass = 'bg-amber-600 border-amber-300 text-white';
    pulseClass = 'animate-pulse';
    badgeText = 'EN ROUTE';
  } else if (isAssigned) {
    colorClass = 'bg-purple-600 border-purple-400 text-white';
    badgeText = 'ASSIGNED';
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'} transition-transform">
      ${(isEnRoute || isEmergency) ? `<div class="absolute w-10 h-10 rounded-full ${isEmergency ? 'bg-rose-500/40' : 'bg-amber-500/40'} ${pulseClass}"></div>` : ''}
      <div class="w-9 h-9 rounded-xl ${colorClass} border-2 shadow-xl flex items-center justify-center text-sm font-black ring-2 ring-[#0B1120]">
        🚑
      </div>
      <div class="absolute -bottom-5 px-1.5 py-0.2 bg-slate-950/90 text-[9px] font-mono font-bold text-white border border-slate-700 rounded shadow whitespace-nowrap">
        ${team.team_id || team.name.split(' ')[0]}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-rescue-team-icon',
    html: html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// Destination Flag Icon
const createDestinationIcon = (name) => {
  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
      <div class="w-8 h-8 rounded-full bg-red-600/90 border-2 border-red-300 text-white shadow-xl flex items-center justify-center text-xs font-bold ring-2 ring-[#0B1120]">
        🏁
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-dest-icon',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// 100% Free, Keyless, High-Definition Tactical Basemap Providers (Zero Watermark)
const BASEMAPS = {
  dark: {
    name: 'Tactical Dark',
    icon: '🌒',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DigitalGlobe, GeoEye'
  },
  topo: {
    name: 'Mountain Topo',
    icon: '🏔️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, USGS, NOAA'
  }
};

export default function RescueTrackingMap({
  teams = [],
  locations = [],
  selectedTeam = null,
  onSelectTeam = () => {},
  onSelectLocationForRescue = () => {},
  isSimulating = false,
  onToggleSimulation = () => {},
  height = "520px",
  className = ""
}) {
  const [mapCenter, setMapCenter] = useState([30.4124, 79.3198]);
  const [mapZoom, setMapZoom] = useState(9);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeBasemap, setActiveBasemap] = useState('dark');

  // Focus on selected team if provided
  useEffect(() => {
    if (selectedTeam && selectedTeam.latitude && selectedTeam.longitude) {
      setMapCenter([selectedTeam.latitude, selectedTeam.longitude]);
      setMapZoom(12);
    }
  }, [selectedTeam]);

  const handleSectorClick = (loc) => {
    setSelectedIncident(loc);
  };

  return (
    <div className={`relative bg-[#0B1120] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
      {/* Top Tactical Map Floating Header */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Map Title & Disclaimer */}
        <div className="bg-[#0B1120]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 pointer-events-auto">
          <div className="p-1 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                LIVE RESCUE TELEMETRY TRACKER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                DEMO — SIMULATED GPS
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">
              Real-time multi-agent disaster response coordinates
            </span>
          </div>
        </div>

        {/* Right: Basemap Switcher & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Basemap Switcher */}
          <div className="bg-[#0B1120]/95 backdrop-blur-md px-1.5 py-1 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-1">
            {Object.entries(BASEMAPS).map(([key, bm]) => (
              <button
                key={key}
                onClick={() => setActiveBasemap(key)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                  activeBasemap === key
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <span>{bm.icon}</span>
                <span className="hidden sm:inline">{bm.name}</span>
              </button>
            ))}
          </div>

          <div className="bg-[#0B1120]/95 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2">
            <button
              onClick={onToggleSimulation}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isSimulating
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause GPS Sim</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>🧪 Simulate Movement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map Viewport */}
      <div style={{ height: height }} className="w-full relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#090D16' }}
        >
          {/* Free High-Definition Keyless Basemap Layer */}
          <TileLayer
            key={activeBasemap}
            url={BASEMAPS[activeBasemap].url}
            attribution={BASEMAPS[activeBasemap].attribution}
            maxZoom={18}
          />

          <MapFlyController center={mapCenter} zoom={mapZoom} />

          {/* 1. Incident & High-Risk Disaster Sectors */}
          {locations.map((loc) => {
            const riskLevel = loc.current_risk?.overall_level || 'MODERATE';
            const isCritical = riskLevel === 'CRITICAL';
            const isHigh = riskLevel === 'HIGH';

            let fillColor = '#10B981'; // green
            if (isCritical) fillColor = '#EF4444'; // red
            else if (isHigh) fillColor = '#F97316'; // orange
            else if (riskLevel === 'MODERATE') fillColor = '#F59E0B'; // yellow

            return (
              <React.Fragment key={`loc-${loc.id}`}>
                {/* Outer Danger Ripple */}
                {(isCritical || isHigh) && (
                  <CircleMarker
                    center={[loc.lat, loc.lng]}
                    radius={isCritical ? 24 : 18}
                    pathOptions={{
                      color: fillColor,
                      weight: 1,
                      opacity: 0.4,
                      fillColor: fillColor,
                      fillOpacity: 0.15
                    }}
                  />
                )}

                {/* Central Danger Marker */}
                <CircleMarker
                  center={[loc.lat, loc.lng]}
                  radius={isCritical ? 10 : 8}
                  pathOptions={{
                    color: '#FFFFFF',
                    weight: 1.5,
                    fillColor: fillColor,
                    fillOpacity: 0.9
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(loc)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                    <div className="font-mono text-xs p-1 bg-slate-950 text-white rounded">
                      <strong className="block text-amber-400">{loc.name}</strong>
                      <span>Risk: {riskLevel} ({loc.current_risk?.overall_score || 45}%)</span>
                    </div>
                  </Tooltip>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {/* 2. Rescue Team Route Polylines */}
          {teams.map((team) => {
            if (!team.waypoints || team.waypoints.length < 2) return null;
            const isSelected = selectedTeam?.id === team.id;
            const isEnRoute = team.status === 'EN ROUTE';

            return (
              <React.Fragment key={`route-${team.id}`}>
                {/* Glowing Background Polyline */}
                <Polyline
                  positions={team.waypoints}
                  pathOptions={{
                    color: isEnRoute ? '#F59E0B' : '#3B82F6',
                    weight: isSelected ? 5 : 3,
                    opacity: isSelected ? 0.9 : 0.6,
                    dashArray: isEnRoute ? '6, 8' : undefined
                  }}
                />

                {/* Destination Marker Flag */}
                {team.destination_name && team.waypoints.length > 0 && (
                  <Marker
                    position={team.waypoints[team.waypoints.length - 1]}
                    icon={createDestinationIcon(team.destination_name)}
                  >
                    <Tooltip direction="bottom" offset={[0, 10]}>
                      <span className="font-mono text-[10px] text-white">
                        🏁 Destination: {team.destination_name}
                      </span>
                    </Tooltip>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}

          {/* 3. Rescue Team Markers */}
          {teams.map((team) => {
            const isSelected = selectedTeam?.id === team.id;
            return (
              <Marker
                key={`team-${team.id}`}
                position={[team.latitude, team.longitude]}
                icon={createTeamIcon(team, isSelected)}
                eventHandlers={{
                  click: () => onSelectTeam(team)
                }}
              >
                <Popup className="custom-dark-popup">
                  <div className="p-2.5 font-mono text-xs space-y-2 bg-slate-950 text-white rounded-lg border border-slate-700 min-w-[220px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <strong className="text-amber-400 text-sm">{team.name}</strong>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {team.team_id}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Status:</span>
                        <strong className="text-emerald-400">{team.status}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Mission:</span>
                        <span className="text-white font-bold">{team.mission_type || 'None'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Destination:</span>
                        <span className="text-amber-300 truncate max-w-[120px]">{team.destination_name || 'Standby'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ETA / Dist:</span>
                        <span className="text-white font-bold">{team.eta_minutes > 0 ? `${team.eta_minutes} min` : 'On Site'} ({team.distance_km} km)</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>Updated:</span>
                        <span>{team.last_updated}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTeam(team)}
                      className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[11px] transition-all"
                    >
                      View Team Mission
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom Selected Sector Dispatch Quick Card (When clicking on map incident) */}
      {selectedIncident && (
        <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              selectedIncident.current_risk?.overall_level === 'CRITICAL'
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase">{selectedIncident.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                  {selectedIncident.current_risk?.overall_level || 'HIGH'} RISK ({selectedIncident.current_risk?.overall_score || 72}%)
                </span>
                <span className="text-xs text-slate-400">
                  Hazard: <strong className="text-white">{selectedIncident.current_risk?.dominant_hazard?.replace('_', ' ').toUpperCase() || 'FLASH FLOOD'}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {selectedIncident.current_risk?.recommended_action || "Immediate evacuation of riverbank floodplains; move uphill to designated relief havens."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedIncident(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onSelectLocationForRescue(selectedIncident);
                setSelectedIncident(null);
              }}
              className="flex-1 sm:flex-initial px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND RESCUE TEAM</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="bg-[#090D16] px-4 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-500 font-bold uppercase">MAP SYMBOLS:</span>
          <span className="flex items-center gap-1 text-white"><span>🚑</span> Rescue Team</span>
          <span className="flex items-center gap-1 text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical Incident</span>
          <span className="flex items-center gap-1 text-orange-400"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High Risk</span>
          <span className="flex items-center gap-1 text-amber-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate Risk</span>
          <span className="flex items-center gap-1 text-blue-400"><span>🏁</span> Destination</span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span>Click any sector to dispatch rescue units</span>
        </div>
      </div>
    </div>
  );
}
