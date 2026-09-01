import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap, Tooltip } from 'react-leaflet';
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
  Eye,
  Radio,
  Building2,
  Droplets,
  Mountain
} from 'lucide-react';

// Custom Map Controller to smoothly fly to center coordinates
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
  return null;
}

// Available High-Definition Basemap Providers
const BASEMAP_PROVIDERS = {
  dark: {
    name: 'Dark Command',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap'
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
  },
  terrain: {
    name: 'Topo Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, DeLorme, NAVTEQ, TomTom, Intermap'
  },
  streets: {
    name: 'Clean Streets',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap'
  }
};

export default function RiskMap({ height = "480px", showRoute = true }) {
  const {
    locations,
    selectedLocationId,
    selectedLocation,
    selectLocation,
    safeLocations,
    selectedShelter,
    setSelectedShelter,
    selectedLayer,
    setSelectedLayer,
    setActivePage
  } = useApp();

  const [basemap, setBasemap] = useState('dark');
  const [zoomLevel, setZoomLevel] = useState(10);

  const activeLoc = selectedLocation || locations.find(l => l.id === selectedLocationId) || locations[0];
  const centerLat = activeLoc ? activeLoc.lat : 30.41;
  const centerLng = activeLoc ? activeLoc.lng : 79.32;

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
        return '#10B981'; // Emerald Green
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
  const routeCoords = (activeLoc && targetShelter) ? [
    [activeLoc.lat, activeLoc.lng],
    [activeLoc.lat + (targetShelter.lat - activeLoc.lat) * 0.35 + 0.0012, activeLoc.lng + (targetShelter.lng - activeLoc.lng) * 0.25 - 0.001],
    [activeLoc.lat + (targetShelter.lat - activeLoc.lat) * 0.68 + 0.0018, activeLoc.lng + (targetShelter.lng - activeLoc.lng) * 0.72 + 0.0006],
    [targetShelter.lat, targetShelter.lng]
  ] : [];

  // Custom Icon Generators
  const createShelterIcon = (isSelected) => new L.DivIcon({
    className: 'custom-shelter-marker',
    html: `
      <div style="
        background: #10B981; 
        color: white; 
        width: 28px; 
        height: 28px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border: 2px solid white; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px rgba(16,185,129,0.8);
        font-size: 13px;
        transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
        transition: transform 0.2s ease;
      ">
        🏥
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const createActiveTargetIcon = (color) => new L.DivIcon({
    className: 'custom-target-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${color}; opacity: 0.8; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const activeColor = getRiskColor(activeLoc?.current_risk?.overall_level || 'LOW');

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col bg-[#0B1120]" style={{ height }}>
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Hazard Layer Filters */}
        <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex flex-wrap gap-1 shadow-2xl pointer-events-auto">
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'flood', label: '🌊 Flash Flood' },
            { id: 'landslide', label: '⛰️ Landslide' },
            { id: 'rainfall', label: '🌧️ Heavy Rain' },
            { id: 'safe_locations', label: '🏥 Safe Shelters' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                selectedLayer === layer.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Right: Basemap Selector & Recenter Button */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-2xl text-xs font-mono">
            {Object.entries(BASEMAP_PROVIDERS).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setBasemap(key)}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  basemap === key
                    ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => selectLocation(activeLoc?.id || 1)}
            title="Recenter on Selected Sector"
            className="p-2 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-blue-400 hover:text-white rounded-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-mono font-bold"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend & Sector Info */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-xs font-mono shadow-2xl hidden sm:block pointer-events-auto space-y-2 max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>THREAT LEVEL INDEX</span>
          </div>
          <span className="text-[10px] text-slate-400">{activeLoc?.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse" />
            <span className="text-slate-300">Critical (76-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
            <span className="text-slate-300">High (51-75)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span className="text-slate-300">Moderate (26-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-slate-300">Normal (0-25)</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white" /> Safe Shelter
          </span>
          <span>Active: <strong>{activeLoc?.name}</strong></span>
        </div>
      </div>

      {/* Main Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', backgroundColor: '#0B1120' }}
        >
          <MapController center={[centerLat, centerLng]} zoom={10} />

          {/* High-Definition Basemap Tile Layer */}
          <TileLayer
            key={basemap}
            url={BASEMAP_PROVIDERS[basemap].url}
            attribution={BASEMAP_PROVIDERS[basemap].attribution}
            maxZoom={18}
          />

          {/* Render Multi-Hazard Risk Zones for all 31 Locations */}
          {selectedLayer !== 'safe_locations' && locations.map((loc) => {
            const level = getLocationHazardLevel(loc);
            const color = getRiskColor(level);
            const isSelected = loc.id === selectedLocationId;
            const radius = level === 'CRITICAL' ? 28 : (level === 'HIGH' ? 22 : 14);

            return (
              <React.Fragment key={loc.id}>
                {/* Threat Buffer Circle */}
                <CircleMarker
                  center={[loc.lat, loc.lng]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.35 : 0.22,
                    weight: isSelected ? 3 : 1.5,
                    dashArray: level === 'CRITICAL' ? '4, 4' : null
                  }}
                  eventHandlers={{
                    click: () => selectLocation(loc.id)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                    <span className="font-mono font-bold text-xs">
                      {loc.name}: <span style={{ color }}>{level}</span>
                    </span>
                  </Tooltip>

                  <Popup>
                    <div className="p-2 min-w-[210px] font-mono text-xs text-slate-100">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
                        <strong className="text-sm text-white font-sans">{loc.name}</strong>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: `${color}30`, color, border: `1px solid ${color}60` }}
                        >
                          {level}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300 mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Region:</span>
                          <span>{loc.state}, {loc.country}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Terrain:</span>
                          <span>{loc.terrain_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Population:</span>
                          <span>{(loc.population || 50000).toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          selectLocation(loc.id);
                          setActivePage('risk-intelligence');
                        }}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs shadow-md transition-all text-center"
                      >
                        Inspect Sector Intelligence
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {/* Active Location Target Radar Icon */}
          {activeLoc && (
            <Marker position={[activeLoc.lat, activeLoc.lng]} icon={createActiveTargetIcon(activeColor)}>
              <Popup>
                <div className="p-2 font-mono text-xs">
                  <div className="font-bold text-white text-sm mb-1">{activeLoc.name}</div>
                  <p className="text-slate-300 text-[11px]">Active monitoring sector selected.</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render Safe Shelters on Map */}
          {safeLocations.map((shelter) => {
            const isSelected = selectedShelter?.id === shelter.id;

            return (
              <Marker
                key={shelter.id}
                position={[shelter.lat, shelter.lng]}
                icon={createShelterIcon(isSelected)}
                eventHandlers={{
                  click: () => setSelectedShelter(shelter)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[220px] font-mono text-xs text-slate-100">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{shelter.name}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300 mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Capacity:</span>
                        <span>{shelter.current_occupancy} / {shelter.capacity} ({shelter.occupancy_pct}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Distance:</span>
                        <span className="text-white font-bold">{shelter.distance_km} km (~{shelter.est_walking_mins} mins)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-emerald-400 font-bold">{shelter.status}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedShelter(shelter);
                        setActivePage('safe-locations');
                      }}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-md transition-all text-center"
                    >
                      Navigate to Safe Shelter
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Animated Evacuation Route Polyline */}
          {showRoute && routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#38BDF8',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.95
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
