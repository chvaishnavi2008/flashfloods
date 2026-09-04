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
import { useApp } from '../context/AppContext';
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

  let bg = '#2563EB'; // Vibrant OSM Blue
  let icon = '🚚';

  if (isEmergency) {
    bg = '#DC2626';
    icon = '🚨';
  } else if (isOnSite) {
    bg = '#10B981';
    icon = '✅';
  }

  const teamLabel = team.team_id || team.name?.split(' ')[0] || 'TEAM';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%) ${isSelected ? 'scale(1.2)' : ''};">
      ${(isEnRoute || isEmergency) ? `
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: ${bg}40; ${isEmergency ? 'animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;' : 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;'}"></div>
      ` : ''}
      <div style="
        display: flex;
        align-items: center;
        gap: 5px;
        background: ${bg};
        color: white;
        padding: 4px 10px;
        border-radius: 9999px;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
        font-family: 'Inter', system-ui, sans-serif;
      ">
        <span>${icon}</span>
        <span>${teamLabel}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-rescue-team-icon',
    html: html,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
    popupAnchor: [0, -15]
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

// SOS Distress Marker Icon
const createSosMarkerIcon = (sos) => {
  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
      <div class="absolute w-10 h-10 rounded-full bg-red-500/40 animate-ping"></div>
      <div class="w-9 h-9 rounded-xl bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-xs font-black text-white ring-2 ring-red-950">
        🆘
      </div>
      <div class="absolute -bottom-5 px-1.5 py-0.2 bg-red-950 text-[9px] font-mono font-bold text-red-300 border border-red-500 rounded shadow whitespace-nowrap">
        ${sos.sos_id}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-sos-track-icon',
    html: html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// Incident Sector Hazard Warning Badge Icon
const createIncidentWarningIcon = (loc, isCritical, isHigh) => {
  const bg = isCritical ? '#EA580C' : (isHigh ? '#F97316' : '#2563EB');
  return L.divIcon({
    className: 'custom-incident-warning-icon',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transform: translate(-50%, -50%);">
        ${isCritical ? `
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #EF4444; background: rgba(239, 68, 68, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid #EF4444;"></div>
        ` : ''}
        ${isHigh ? `
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #F97316; background: rgba(249, 115, 22, 0.2);"></div>
        ` : ''}
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${bg};
          border: 2px solid #FFFFFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #FFFFFF;
          font-weight: bold;
        ">
          ⚠️
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
  });
};

// 100% Free, Keyless, OpenStreetMap Standard GIS Basemap Providers
const BASEMAPS = {
  osm: {
    name: 'OpenStreetMap',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  osm_hot: {
    name: 'Humanitarian OSM',
    icon: '🧭',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Humanitarian style'
  },
  osm_topo: {
    name: 'OpenTopoMap',
    icon: '🏔️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, OpenTopoMap'
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
  const { sosRequests = [] } = useApp();
  const [mapCenter, setMapCenter] = useState([30.4124, 79.3198]);
  const [mapZoom, setMapZoom] = useState(9);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeBasemap, setActiveBasemap] = useState('osm');

  // Focus on selected team if provided (smoothly framing route & destination)
  useEffect(() => {
    if (selectedTeam) {
      if (selectedTeam.waypoints && selectedTeam.waypoints.length > 1) {
        const lats = selectedTeam.waypoints.map(w => w[0]);
        const lngs = selectedTeam.waypoints.map(w => w[1]);
        const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const midLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const latDiff = Math.max(...lats) - Math.min(...lats);
        const lngDiff = Math.max(...lngs) - Math.min(...lngs);
        const maxDiff = Math.max(latDiff, lngDiff);

        let zoom = 11;
        if (maxDiff > 2.0) zoom = 7;
        else if (maxDiff > 1.0) zoom = 8;
        else if (maxDiff > 0.4) zoom = 9;
        else if (maxDiff > 0.15) zoom = 10;
        else zoom = 11;

        setMapCenter([midLat, midLng]);
        setMapZoom(zoom);
      } else if (selectedTeam.latitude && selectedTeam.longitude) {
        setMapCenter([Number(selectedTeam.latitude), Number(selectedTeam.longitude)]);
        setMapZoom(11);
      }
    }
  }, [selectedTeam]);

  const handleSectorClick = (loc) => {
    setSelectedIncident(loc);
  };

  return (
    <div className={`relative bg-[#E8F2F8] border border-slate-300 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
      {/* Top Tactical Map Floating Header */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Map Title & OpenStreetMap GIS Badge */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-300 shadow-lg flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs font-sans">Live Logistics GIS (NER)</span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-600 font-semibold font-mono">Leaflet + OpenStreetMap</span>
          </div>

          <div className="bg-[#0B1120]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              RESCUE FORCES
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              SIMULATED GPS
            </span>
          </div>
        </div>

        {/* Right: Basemap Switcher & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Basemap Switcher */}
          <div className="bg-slate-950/90 backdrop-blur-md px-1.5 py-1 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-1">
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
          style={{ height: '100%', width: '100%', background: '#E8F2F8' }}
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

            return (
              <React.Fragment key={`loc-${loc.id}`}>
                {/* Outer Danger Ripple */}
                {(isCritical || isHigh) && (
                  <CircleMarker
                    center={[loc.lat, loc.lng]}
                    radius={isCritical ? 26 : 20}
                    pathOptions={{
                      color: isCritical ? '#EF4444' : '#F97316',
                      weight: 1.5,
                      opacity: 0.6,
                      fillColor: isCritical ? '#EF4444' : '#F97316',
                      fillOpacity: 0.2
                    }}
                  />
                )}

                {/* Central Warning Badge */}
                <Marker
                  position={[loc.lat, loc.lng]}
                  icon={createIncidentWarningIcon(loc, isCritical, isHigh)}
                  eventHandlers={{
                    click: () => handleSectorClick(loc)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                    <div className="font-mono text-xs p-1 bg-slate-950 text-white rounded">
                      <strong className="block text-amber-400">{loc.name}</strong>
                      <span>Risk: {riskLevel} ({loc.current_risk?.overall_score || 45}%)</span>
                    </div>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* 2. Rescue Team Route Polylines */}
          {teams.map((team) => {
            if (!team.waypoints || team.waypoints.length < 2) return null;
            const isSelected = selectedTeam && (selectedTeam.id === team.id || selectedTeam.team_id === team.id || selectedTeam.id === team.team_id || selectedTeam.team_id === team.team_id);
            const isEnRoute = team.status === 'EN ROUTE';
            const isActive = ['EN ROUTE', 'ASSIGNED', 'EMERGENCY', 'ON SITE'].includes(team.status);
            if (!isActive && !isSelected) return null;

            return (
              <React.Fragment key={`route-${team.id || team.team_id}`}>
                {/* Outer Glow Halo */}
                <Polyline
                  positions={team.waypoints}
                  pathOptions={{
                    color: '#065F46',
                    weight: isSelected ? 8 : 6,
                    opacity: 0.35
                  }}
                />

                {/* Main Green Logistics Corridor Route */}
                <Polyline
                  positions={team.waypoints}
                  pathOptions={{
                    color: '#10B981',
                    weight: isSelected ? 5 : 4,
                    opacity: 1,
                    dashArray: isEnRoute ? '8, 6' : undefined
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
            const isSelected = selectedTeam && (selectedTeam.id === team.id || selectedTeam.team_id === team.id || selectedTeam.id === team.team_id || selectedTeam.team_id === team.team_id);
            return (
              <Marker
                key={`team-${team.id || team.team_id}`}
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

          {/* Active Citizen SOS Distress Transmissions */}
          {sosRequests
            .filter(s => s.status !== 'RESOLVED' && (s.location_latitude || s.lat) && (s.location_longitude || s.lng))
            .map((sos) => {
              const sLat = Number(sos.location_latitude || sos.lat);
              const sLng = Number(sos.location_longitude || sos.lng);
              return (
                <Marker
                  key={`sos-trackmap-${sos.sos_id || sos.id}`}
                  position={[sLat, sLng]}
                  icon={createSosMarkerIcon(sos)}
                  zIndexOffset={9000}
                >
                  <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                    <div className="font-mono text-xs p-1 bg-red-950 text-white rounded border border-red-500">
                      <strong className="text-red-400 block">🆘 SOS: {sos.sos_id} [{sos.status}]</strong>
                      <span>{sos.location_name} • {sos.hazard}</span>
                    </div>
                  </Tooltip>
                  <Popup className="custom-dark-popup">
                    <div className="p-2.5 font-mono text-xs space-y-2 bg-slate-950 text-white rounded-lg border border-red-500 min-w-[230px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <strong className="text-red-400 font-bold text-sm">🆘 {sos.sos_id}</strong>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          sos.status === 'NEW' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
                        }`}>
                          {sos.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Location:</span>
                          <strong className="text-white truncate max-w-[130px]">{sos.location_name}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Threat:</span>
                          <strong className="text-amber-400">{sos.hazard} ({sos.risk_level})</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Time:</span>
                          <span>{sos.time_ago || 'Recently'}</span>
                        </div>
                        {sos.assigned_team_name && (
                          <div className="flex items-center justify-between text-blue-300 pt-1 border-t border-slate-900 font-bold">
                            <span>Assigned:</span>
                            <span>🚑 {sos.assigned_team_name}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-1.5 bg-red-950/40 border border-red-500/30 rounded text-[10px] text-slate-300 italic">
                        "{sos.message || 'Urgent evacuation required.'}"
                      </div>

                      <button
                        onClick={() => {
                          const matchLoc = locations.find(l => 
                            (sos.location_name && l.name && sos.location_name.toLowerCase().includes(l.name.toLowerCase()))
                          ) || { 
                            id: sos.id || 1, 
                            name: sos.location_name, 
                            lat: sLat, 
                            lng: sLng 
                          };
                          onSelectLocationForRescue(matchLoc);
                        }}
                        className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-[11px] transition-all shadow-md flex items-center justify-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Team to SOS</span>
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
