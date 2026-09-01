import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { Layers, ShieldCheck, AlertTriangle, Navigation, Info } from 'lucide-react';

// Custom icons for shelters and origin
const shelterIcon = new L.DivIcon({
  className: 'custom-shelter-marker',
  html: `<div style="background-color: #10B981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px rgba(16,185,129,0.8); font-size: 14px; font-weight: bold;">🏥</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const userLocationIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(59,130,246,0.9);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Map Controller Component for Pan/Zoom synchronization
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function RiskMap({ height = "450px", showRoute = true }) {
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

  const activeLoc = selectedLocation || locations.find(l => l.id === selectedLocationId) || locations[0];
  const centerLat = activeLoc ? activeLoc.lat : 30.3165;
  const centerLng = activeLoc ? activeLoc.lng : 78.0322;

  // Colors according to risk level
  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return '#EF4444'; // Red
      case 'HIGH':
        return '#F97316'; // Orange
      case 'MODERATE':
        return '#F59E0B'; // Amber
      default:
        return '#10B981'; // Green
    }
  };

  // Get score/level based on active selectedLayer
  const getLocationHazardLevel = (loc) => {
    const risk = loc.current_risk || { overall_level: 'LOW' };
    switch (selectedLayer) {
      case 'flash_flood':
        return risk.flash_flood_level || 'LOW';
      case 'flood':
        return risk.flood_level || 'LOW';
      case 'landslide':
        return risk.landslide_level || 'LOW';
      case 'heavy_rainfall':
        return risk.heavy_rainfall_level || 'LOW';
      case 'overall':
      default:
        return risk.overall_level || 'LOW';
    }
  };

  // Target destination shelter coordinates for dynamic evacuation route
  const targetShelter = selectedShelter || (safeLocations && safeLocations.length > 0 ? safeLocations[0] : null);
  const routeCoords = (activeLoc && targetShelter) ? [
    [activeLoc.lat, activeLoc.lng],
    [activeLoc.lat + (targetShelter.lat - activeLoc.lat) * 0.35 + 0.001, activeLoc.lng + (targetShelter.lng - activeLoc.lng) * 0.25 - 0.001],
    [activeLoc.lat + (targetShelter.lat - activeLoc.lat) * 0.65 + 0.0015, activeLoc.lng + (targetShelter.lng - activeLoc.lng) * 0.75 + 0.0005],
    [targetShelter.lat, targetShelter.lng]
  ] : [];

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#334155] shadow-lg flex flex-col" style={{ height }}>
      {/* Map Layer Switcher Toolbar */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 flex flex-wrap gap-1 shadow-lg max-w-[calc(100%-24px)]">
        {[
          { id: 'overall', label: 'Overall Risk' },
          { id: 'flash_flood', label: 'Flash Flood' },
          { id: 'flood', label: 'River Flood' },
          { id: 'landslide', label: 'Landslide' },
          { id: 'heavy_rainfall', label: 'Heavy Rainfall' },
          { id: 'safe_locations', label: 'Safe Shelters' }
        ].map((layer) => (
          <button
            key={layer.id}
            onClick={() => setSelectedLayer(layer.id)}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
              selectedLayer === layer.id
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-xs font-mono shadow-xl hidden sm:block">
        <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5 border-b border-slate-800 pb-1">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Layer: {selectedLayer.toUpperCase().replace('_', ' ')}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm animate-pulse"></span>
            <span className="text-slate-300">CRITICAL (76-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></span>
            <span className="text-slate-300">HIGH (51-75)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
            <span className="text-slate-300">MODERATE (31-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span>
            <span className="text-slate-300">LOW (0-30)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-white"></span>
            <span className="text-slate-300">Safe Zone / Shelter</span>
          </div>
        </div>
      </div>

      {/* Main Leaflet Canvas */}
      <div className="flex-1 w-full h-full">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={[centerLat, centerLng]} zoom={11} />

          {/* OpenStreetMap Tile Layer with Tactical Inverted Styling via CSS */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Multi-Hazard Risk Zones & Location Markers */}
          {selectedLayer !== 'safe_locations' && locations.map((loc) => {
            const level = getLocationHazardLevel(loc);
            const color = getRiskColor(level);
            const isSelected = loc.id === selectedLocationId;
            const radius = level === 'CRITICAL' ? 32 : (level === 'HIGH' ? 24 : 16);

            return (
              <React.Fragment key={loc.id}>
                {/* Danger buffer zone circle */}
                <CircleMarker
                  center={[loc.lat, loc.lng]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.35 : 0.20,
                    weight: isSelected ? 3 : 1.5,
                    dashArray: level === 'CRITICAL' ? '4, 4' : null
                  }}
                  eventHandlers={{
                    click: () => selectLocation(loc.id)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
                        <span className="font-bold text-slate-100">{loc.name}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                          style={{ backgroundColor: `${color}25`, color }}
                        >
                          {level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mb-1">
                        State: {loc.state}, {loc.country}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mb-2">
                        Terrain: {loc.terrain_type}
                      </p>
                      <button
                        onClick={() => {
                          selectLocation(loc.id);
                          setActivePage('location-risk');
                        }}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold font-mono transition-colors"
                      >
                        View Full Risk Assessment
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {/* Active Location User Marker */}
          {activeLoc && (
            <Marker position={[activeLoc.lat, activeLoc.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="p-1 font-mono text-xs">
                  <strong>Selected Sector:</strong> {activeLoc.name}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render Safe Shelters on Map */}
          {safeLocations.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.lat, shelter.lng]}
              icon={shelterIcon}
              eventHandlers={{
                click: () => {
                  setSelectedShelter(shelter);
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{shelter.name}</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">Type: {shelter.type}</p>
                  <div className="text-xs font-mono text-slate-300 space-y-1 mb-2">
                    <div>Capacity: {shelter.current_occupancy} / {shelter.capacity} ({shelter.occupancy_pct}%)</div>
                    <div>Distance: {shelter.distance_km} km (Est. {shelter.est_walking_mins} mins)</div>
                    <div className="text-emerald-400 font-semibold">Status: {shelter.status}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedShelter(shelter);
                      setActivePage('safe-locations');
                    }}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-mono font-semibold"
                  >
                    View Safe Evacuation Route
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Animated Safe Evacuation Route Polyline */}
          {showRoute && routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#60A5FA',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.9
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
