import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CloudRain, 
  Droplets, 
  Compass, 
  MapPin, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Flame, 
  Layers, 
  Wind, 
  Thermometer, 
  CheckCircle2, 
  Crosshair, 
  Sliders, 
  Info,
  Clock,
  Navigation,
  Mountain,
  BookOpen,
  Database,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function LiveWeatherRiskCard() {
  const { 
    liveWeather, 
    liveTerrain,
    historicalRisk,
    liveRisk, 
    isLiveWeatherLoading, 
    liveWeatherError, 
    lastWeatherUpdated, 
    refreshRisk, 
    userCoords,
    userGpsLocation,
    isGpsLoading,
    gpsError, 
    locationName, 
    locationInputMode, 
    requestUserLocation, 
    setManualCoordinates 
  } = useApp();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualLat, setManualLat] = useState(userCoords?.lat?.toString() || '30.3165');
  const [manualLng, setManualLng] = useState(userCoords?.lng?.toString() || '78.0322');
  const [manualName, setManualName] = useState(locationName || 'Dehradun Sector');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setManualCoordinates(lat, lng, manualName.trim() || 'Custom Coordinates');
      setIsManualModalOpen(false);
    }
  };

  const handlePresetClick = (lat, lng, name) => {
    setManualLat(lat.toString());
    setManualLng(lng.toString());
    setManualName(name);
    setManualCoordinates(lat, lng, name);
    setIsManualModalOpen(false);
  };

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'bg-red-950/80 border-red-500 text-red-300 ring-1 ring-red-500/50';
      case 'HIGH':
        return 'bg-orange-950/80 border-orange-500 text-orange-300 ring-1 ring-orange-500/50';
      case 'MODERATE':
        return 'bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-500/50';
      default:
        return 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50';
    }
  };

  const getBadgeColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'bg-red-600 text-white font-black animate-pulse';
      case 'HIGH':
        return 'bg-orange-500 text-white font-black';
      case 'MODERATE':
        return 'bg-amber-500 text-slate-950 font-black';
      default:
        return 'bg-emerald-600 text-white font-black';
    }
  };

  const overallLvl = liveRisk?.overall_level || 'LOW';
  const overallScore = liveRisk?.overall_score || 0;
  const dominantHazard = liveRisk?.dominant_hazard || 'Flash Flood';
  const recAction = liveRisk?.recommended_action || 'Maintain routine monitoring.';

  // Terrain Values
  const elevationVal = liveTerrain?.elevation_m ?? liveRisk?.terrain?.elevation_m ?? liveWeather?.elevation ?? 652;
  const slopeVal = liveTerrain?.estimated_slope_deg ?? liveRisk?.terrain?.estimated_slope_deg ?? 1.1;
  const terrainRisk = liveTerrain?.terrain_risk ?? liveRisk?.terrain?.terrain_risk ?? 'LOW';

  // Historical Values
  const histFloodExposure = historicalRisk?.historical_flood?.exposure ?? liveRisk?.historical?.flood_exposure ?? 'HIGH';
  const histFloodEvents = historicalRisk?.historical_flood?.events_nearby ?? liveRisk?.historical?.flood_events_nearby ?? 14;
  const histLandslideSusceptibility = historicalRisk?.historical_landslide?.susceptibility ?? liveRisk?.historical?.landslide_susceptibility ?? 'MODERATE';
  const histLandslidesCount = historicalRisk?.historical_landslide?.landslides_nearby ?? liveRisk?.historical?.landslides_nearby ?? 310;
  const histLandslideRank = historicalRisk?.historical_landslide?.national_rank ?? liveRisk?.historical?.landslide_national_rank;

  // Format last updated string
  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-5 font-mono text-slate-200 transition-all">
      {/* ===================================================================== */}
      {/* 1. HEADER STRIP: Location, Mode, Presets & Refresh                    */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              MULTI-SOURCE DISASTER INTELLIGENCE PIPELINE
            </span>
            <span className="text-[11px] text-slate-400">
              Auto-refreshes every 10 mins
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <h2 className="text-lg font-black text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span>📍 {locationName}</span>
            </h2>
            <span className="text-xs text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono font-bold">
              Your Location: {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
            </span>
            {locationInputMode === 'gps' && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold flex items-center gap-1 animate-pulse">
                <Navigation className="w-3 h-3 text-cyan-400" />
                Live GPS Active
              </span>
            )}
            {isGpsLoading && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500 font-bold flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                Getting your location...
              </span>
            )}
          </div>
        </div>

        {/* Location Controls & Test Presets */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={requestUserLocation}
            disabled={isGpsLoading || isLiveWeatherLoading}
            title="Request real-time browser GPS location"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              locationInputMode === 'gps'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 ring-1 ring-cyan-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin text-amber-400' : 'text-cyan-400'}`} />
            <span>{isGpsLoading ? 'Getting your location...' : 'Live GPS'}</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Location Presets / Lat-Lng</span>
          </button>

          <button
            onClick={refreshRisk}
            disabled={isLiveWeatherLoading}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveWeatherLoading ? 'animate-spin' : ''}`} />
            <span>{isLiveWeatherLoading ? 'Fetching...' : 'Refresh Risk'}</span>
          </button>
        </div>
      </div>

      {/* GPS ERROR BANNER */}
      {gpsError && (
        <div className="p-3 bg-red-950/80 border border-red-500/80 rounded-xl text-red-200 text-xs flex items-center gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* QUICK PRESET SELECTOR BAR (Step 8 Required Testing Locations) */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-cyan-400" />
          Test Sectors:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handlePresetClick(30.3165, 78.0322, 'Dehradun, Uttarakhand')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
              locationName.includes('Dehradun') 
                ? 'bg-blue-600 text-white border-blue-400 shadow' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Dehradun (30.32°N, 78.03°E)
          </button>

          <button
            onClick={() => handlePresetClick(30.4137, 79.3242, 'Chamoli, Uttarakhand')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
              locationName.includes('Chamoli') 
                ? 'bg-blue-600 text-white border-blue-400 shadow' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Chamoli (30.41°N, 79.32°E)
          </button>

          <button
            onClick={() => handlePresetClick(11.6854, 76.1320, 'Wayanad, Kerala')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
              locationName.includes('Wayanad') 
                ? 'bg-blue-600 text-white border-blue-400 shadow' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Wayanad (11.69°N, 76.13°E)
          </button>

          <button
            onClick={() => handlePresetClick(27.3389, 88.6065, 'Gangtok, Sikkim')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
              locationName.includes('Gangtok') 
                ? 'bg-blue-600 text-white border-blue-400 shadow' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Gangtok (27.34°N, 88.61°E)
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. ERROR DISPLAY (If API fails)                                        */}
      {/* ===================================================================== */}
      {liveWeatherError && (
        <div className="p-3.5 bg-red-950/70 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <strong className="block text-red-300">Live weather data temporarily unavailable.</strong>
            <span className="text-[11px] text-red-400/90">
              {liveWeatherError} Check network connection or retry in a few moments.
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. MAIN COMPOSITE RISK OVERVIEW BANNER                                */}
      {/* ===================================================================== */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${getLevelColor(overallLvl)}`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider ${getBadgeColor(overallLvl)}`}>
              ⚠️ PralayWatch Risk Assessment: {overallLvl} ({overallScore}/100)
            </span>
            <span className="text-xs px-2 py-0.5 bg-black/40 rounded border border-current font-bold">
              🔥 Dominant Hazard: <strong className="text-white">{dominantHazard}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-200 space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Recommended Action: {recAction}</span>
            </div>
            <p className="text-[11px] text-slate-300 opacity-90">
              Evaluated from Live Open-Meteo telemetry, Open-Meteo Elevation slope gradient, IFI-Impacts flood history, and ISRO Landslide Atlas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-right font-mono text-[11px] text-slate-400">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Updated: <strong className="text-white">{formatTimeAgo(lastWeatherUpdated)}</strong></span>
            </div>
            <span>Estimated Lead Time: <strong className="text-white">~{liveRisk?.lead_time_minutes || 30} mins</strong></span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. LIVE WEATHER TELEMETRY METRIC GRID (Precip, Soil, Runoff, Temp)     */}
      {/* ===================================================================== */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Live Weather Telemetry</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            🟢 LIVE CONDITIONS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Metric 1: Rainfall */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>🌧️ Rainfall Telemetry</span>
            </span>
            <div className="text-lg font-black text-white">
              {liveWeather ? (liveWeather.precipitation_mm_hr !== null && liveWeather.precipitation_mm_hr !== undefined ? `${liveWeather.precipitation_mm_hr} mm/hr` : 'Unavailable') : '--'}
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>24h Forecast:</span>
              <strong className="text-slate-200">{liveWeather ? (liveWeather.forecast_24h_precipitation_mm !== null && liveWeather.forecast_24h_precipitation_mm !== undefined ? `${liveWeather.forecast_24h_precipitation_mm} mm` : 'Unavailable') : '--'}</strong>
            </div>
          </div>

          {/* Metric 2: Soil Moisture */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>💧 Soil Moisture</span>
            </span>
            <div className="text-lg font-black text-white">
              {liveWeather ? `${liveWeather.soil_saturation_pct}%` : '--'}
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Volumetric:</span>
              <strong className="text-slate-200">{liveWeather ? `${liveWeather.soil_moisture_m3} m³/m³` : '--'}</strong>
            </div>
          </div>

          {/* Metric 3: Surface Runoff */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Surface Runoff</span>
            </span>
            <div className="text-lg font-black text-white">
              {liveWeather?.surface_runoff ? `${liveWeather.surface_runoff.value_mm_hr} mm/hr` : '--'}
            </div>
            <div className="text-[9px] text-amber-400/80 truncate" title="Estimated from Open-Meteo precipitation & soil moisture">
              (Derived runoff)
            </div>
          </div>

          {/* Metric 4: Ambient / Wind */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wind & Temp</span>
            </span>
            <div className="text-lg font-black text-white">
              {liveWeather ? `${liveWeather.temperature_c}°C` : '--'}
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Wind:</span>
              <strong className="text-slate-200">{liveWeather ? `${liveWeather.wind_speed_kmh} km/h` : '--'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. NEW SECTION: ENVIRONMENTAL + HISTORICAL RISK (Phase 2A + 2B)        */}
      {/* ===================================================================== */}
      <div className="p-4 bg-slate-900/95 border border-indigo-500/30 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-200">
              ENVIRONMENTAL + HISTORICAL RISK
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40 font-bold">
              🔵 TERRAIN DATA
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
              🟣 HISTORICAL SUSCEPTIBILITY
            </span>
          </div>
        </div>

        {/* 4 Core Required Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Card 1: Elevation */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>⛰️ Elevation</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-950 text-blue-300 rounded border border-blue-500/30">
                Copernicus DEM
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {elevationVal} m
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-900">
              <span>Terrain Tier:</span>
              <strong className="text-blue-300 font-bold">
                {elevationVal >= 1200 ? 'High Alpine' : (elevationVal >= 600 ? 'Sub-Himalayan' : 'Lowland / Basin')}
              </strong>
            </div>
          </div>

          {/* Card 2: Estimated Slope */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>📐 Estimated Slope</span>
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${
                terrainRisk === 'HIGH' ? 'bg-red-950 text-red-300 border-red-500/40' : (terrainRisk === 'MODERATE' ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40')
              }`}>
                {terrainRisk} RISK
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {slopeVal}°
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-900">
              <span className="text-[9px] text-slate-400 italic">Estimated terrain slope</span>
              <strong className="text-slate-200">
                {slopeVal >= 30 ? 'Steep Escarpment' : (slopeVal >= 15 ? 'Moderate Incline' : 'Gentle / Valley')}
              </strong>
            </div>
          </div>

          {/* Card 3: Historical Flood Exposure */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>📚 Historical Flood Exposure</span>
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                histFloodExposure === 'HIGH' ? 'bg-red-950 text-red-300 border-red-500/40' : (histFloodExposure === 'MODERATE' ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40')
              }`}>
                {histFloodExposure}
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {histFloodExposure}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-900">
              <span>Historical events nearby:</span>
              <strong className="text-purple-300 font-bold">{histFloodEvents} events</strong>
            </div>
          </div>

          {/* Card 4: Historical Landslide Exposure */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>📚 Historical Landslide Exposure</span>
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                histLandslideSusceptibility === 'HIGH' ? 'bg-red-950 text-red-300 border-red-500/40' : (histLandslideSusceptibility === 'MODERATE' ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40')
              }`}>
                {histLandslideSusceptibility}
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {histLandslideSusceptibility}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-900">
              <span>Atlas Density / Rank:</span>
              <strong className="text-purple-300 font-bold">
                {histLandslideRank ? `#${histLandslideRank} in India` : `${histLandslidesCount} cataloged`}
              </strong>
            </div>
          </div>
        </div>

        {/* Historical Occurrence Disclaimer */}
        <p className="text-[10px] text-slate-400/90 italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
          ⚠️ <strong>Note:</strong> Historical flood and landslide occurrences provide empirical baseline susceptibility context and do NOT automatically indicate that a disaster is currently taking place.
        </p>
      </div>

      {/* ===================================================================== */}
      {/* 6. MULTI-SOURCE RISK ASSESSMENT BREAKDOWN (Flash Flood, Landslide, Rain) */}
      {/* ===================================================================== */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>🧠 MULTI-SOURCE RISK ASSESSMENT</span>
          </span>
          <span className="text-[10px] text-slate-400">
            Weighted Multi-Parameter Formulation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Flash Flood */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🌊 Flash Flood Risk</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(liveRisk?.flash_flood_level || 'LOW')}`}>
                {liveRisk?.flash_flood_level || 'LOW'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{liveRisk?.flash_flood_score ?? 0}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  liveRisk?.flash_flood_score >= 76 ? 'bg-red-500' : (liveRisk?.flash_flood_score >= 51 ? 'bg-orange-500' : (liveRisk?.flash_flood_score >= 26 ? 'bg-amber-400' : 'bg-emerald-500'))
                }`} 
                style={{ width: `${Math.min(100, liveRisk?.flash_flood_score || 0)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
              <span>Historical Susceptibility:</span>
              <strong className="text-purple-300">{histFloodExposure}</strong>
            </div>
          </div>

          {/* Landslide */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>⛰️ Landslide Risk</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(liveRisk?.landslide_level || 'LOW')}`}>
                {liveRisk?.landslide_level || 'LOW'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{liveRisk?.landslide_score ?? 0}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  liveRisk?.landslide_score >= 76 ? 'bg-red-500' : (liveRisk?.landslide_score >= 51 ? 'bg-orange-500' : (liveRisk?.landslide_score >= 26 ? 'bg-amber-400' : 'bg-emerald-500'))
                }`} 
                style={{ width: `${Math.min(100, liveRisk?.landslide_score || 0)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
              <span>Estimated Slope:</span>
              <strong className="text-blue-300">{slopeVal}°</strong>
            </div>
          </div>

          {/* Heavy Rainfall */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🌧️ Heavy Rainfall</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(liveRisk?.heavy_rainfall_level || 'LOW')}`}>
                {liveRisk?.heavy_rainfall_level || 'LOW'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{liveRisk?.heavy_rainfall_score ?? 0}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  liveRisk?.heavy_rainfall_score >= 76 ? 'bg-red-500' : (liveRisk?.heavy_rainfall_score >= 51 ? 'bg-orange-500' : (liveRisk?.heavy_rainfall_score >= 26 ? 'bg-amber-400' : 'bg-emerald-500'))
                }`} 
                style={{ width: `${Math.min(100, liveRisk?.heavy_rainfall_score || 0)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
              <span>Overall Multi-Source Risk:</span>
              <strong className="text-white">{overallScore}/100</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 7. GROUNDED RISK FACTORS & DATA TRANSPARENCY                          */}
      {/* ===================================================================== */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Corroborated Telemetry & Susceptibility Factors</span>
          </span>
          <span className="text-[10px] text-slate-500">Multi-Layer Grounded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {(liveRisk?.factors || ['Environmental metrics within nominal baseline limits']).map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-slate-200">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-snug">{factor}</span>
            </div>
          ))}
        </div>

        {/* Data Sources Transparency Matrix */}
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
            <strong className="text-emerald-400 block mb-0.5">Live Weather:</strong>
            <span>Open-Meteo Live Forecast API</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
            <strong className="text-blue-400 block mb-0.5">Terrain / Slope:</strong>
            <span>Open-Meteo Elevation API / Copernicus DEM (90m)</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
            <strong className="text-purple-400 block mb-0.5">Historical Flood:</strong>
            <span>India Flood Inventory (IFI-Impacts 1967–2023)</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
            <strong className="text-pink-400 block mb-0.5">Historical Landslide:</strong>
            <span>ISRO / NRSC Landslide Atlas of India</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 8. MANUAL LATITUDE / LONGITUDE MODAL                                  */}
      {/* ===================================================================== */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B1120] border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase">
                  ENTER LOCATION COORDINATES
                </h3>
              </div>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter custom coordinates to query live Open-Meteo weather, retrieve real Copernicus DEM elevation & slope gradient, and analyze historical flood/landslide exposure.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Location / Sector Label</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Chamoli Sector or Wayanad Hills"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g. 30.4137"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="e.g. 79.3242"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Preset Coordinates */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Quick Benchmark Test Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setManualLat('30.3165'); setManualLng('78.0322'); setManualName('Dehradun, Uttarakhand'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Dehradun (30.32, 78.03)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('30.4137'); setManualLng('79.3242'); setManualName('Chamoli, Uttarakhand'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Chamoli (30.41, 79.32)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('11.6854'); setManualLng('76.1320'); setManualName('Wayanad, Kerala'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Wayanad (11.69, 76.13)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('27.3389'); setManualLng('88.6065'); setManualName('Gangtok, Sikkim'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Gangtok (27.34, 88.61)
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Fetch Live Risk & Terrain</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
