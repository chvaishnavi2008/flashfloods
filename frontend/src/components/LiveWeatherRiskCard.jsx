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
        return 'bg-[#FFF1F1] border-2 border-[#C62828] text-[#172B3A]';
      case 'HIGH':
        return 'bg-[#FFF7E6] border border-[#E87516] text-[#172B3A]';
      case 'MODERATE':
        return 'bg-[#FFF7E6] border border-[#D99A00] text-[#172B3A]';
      default:
        return 'bg-[#EAF7F1] border border-[#16855B] text-[#172B3A]';
    }
  };

  const getBadgeColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'bg-[#C62828] text-white font-bold';
      case 'HIGH':
        return 'bg-[#E87516] text-white font-bold';
      case 'MODERATE':
        return 'bg-[#D99A00] text-white font-bold';
      default:
        return 'bg-[#16855B] text-white font-bold';
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
    <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-5 font-mono text-[#172B3A] dark:text-[#E2E8F0] transition-colors duration-200">
      {/* ===================================================================== */}
      {/* 1. HEADER STRIP: Location, Mode, Presets & Refresh                    */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1769AA]" />
              MULTI-SOURCE DISASTER INTELLIGENCE PIPELINE
            </span>
            <span className="text-[11px] text-[#5B6B78] dark:text-slate-400">
              Auto-refreshes every 10 mins
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <h2 className="text-lg font-black text-[#172B3A] dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C62828] shrink-0" />
              <span>📍 {locationName}</span>
            </h2>
            <span className="text-xs text-[#172B3A] dark:text-slate-200 bg-[#F8FAFC] dark:bg-[#070F1E] px-2 py-0.5 rounded border border-[#D7E0E7] dark:border-[#1E2E4A] font-mono font-bold">
              Your Location: {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
            </span>
            {locationInputMode === 'gps' && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#E8F2F8] dark:bg-[#1769AA]/30 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] font-bold flex items-center gap-1">
                <Navigation className="w-3 h-3 text-[#1769AA]" />
                Live GPS Active
              </span>
            )}
            {isGpsLoading && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border border-[#D99A00] font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-[#D99A00] animate-spin" />
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
                ? 'bg-[#E8F2F8] dark:bg-[#1769AA]/30 text-[#1769AA] dark:text-[#38BDF8] border-[#1769AA]'
                : 'bg-[#F8FAFC] dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#1769AA]/20 text-[#172B3A] dark:text-slate-200 border-[#D7E0E7] dark:border-[#1E2E4A]'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin text-[#D99A00]' : 'text-[#1769AA]'}`} />
            <span>{isGpsLoading ? 'Getting your location...' : 'Live GPS'}</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#E8F2F8] text-[#172B3A] rounded-lg text-xs font-bold flex items-center gap-1.5 border border-[#D7E0E7] transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-[#D99A00]" />
            <span>Location Presets / Lat-Lng</span>
          </button>

          <button
            onClick={refreshRisk}
            disabled={isLiveWeatherLoading}
            className="px-3.5 py-1.5 bg-[#1769AA] hover:bg-[#125890] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveWeatherLoading ? 'animate-spin' : ''}`} />
            <span>{isLiveWeatherLoading ? 'Fetching...' : 'Refresh Risk'}</span>
          </button>
        </div>
      </div>

      {/* GPS ERROR BANNER */}
      {gpsError && (
        <div className="p-3 bg-[#FFF1F1] border border-[#C62828] rounded-xl text-[#C62828] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. ERROR DISPLAY (If API fails)                                        */}
      {/* ===================================================================== */}
      {liveWeatherError && (
        <div className="p-3.5 bg-[#FFF1F1] border border-[#C62828] rounded-xl text-[#C62828] text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-[#C62828] shrink-0" />
          <div>
            <strong className="block text-[#C62828]">Live weather data temporarily unavailable.</strong>
            <span className="text-[11px] text-[#5B6B78]">
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
              ⚠️ AapdaSetu Risk Assessment: {overallLvl} ({overallScore}/100)
            </span>
            <span className="text-xs px-2 py-0.5 bg-white/80 rounded border border-[#D7E0E7] font-bold text-[#172B3A]">
              🔥 Dominant Hazard: <strong className="text-[#172B3A]">{dominantHazard}</strong>
            </span>
          </div>

          <div className="text-xs text-[#172B3A] space-y-0.5">
            <div className="font-bold text-[#172B3A] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16855B] shrink-0" />
              <span>Recommended Action: {recAction}</span>
            </div>
            <p className="text-[11px] text-[#5B6B78]">
              Evaluated from Live Open-Meteo telemetry, Open-Meteo Elevation slope gradient, IFI-Impacts flood history, and ISRO Landslide Atlas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-right font-mono text-[11px] text-[#5B6B78]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-[#5B6B78]" />
              <span>Updated: <strong className="text-[#172B3A]">{formatTimeAgo(lastWeatherUpdated)}</strong></span>
            </div>
            <span>Estimated Lead Time: <strong className="text-[#172B3A]">~{liveRisk?.lead_time_minutes || 30} mins</strong></span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. LIVE WEATHER TELEMETRY METRIC GRID (Precip, Soil, Runoff, Temp)     */}
      {/* ===================================================================== */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D7E0E7]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1769AA]" />
            <span>Live Weather Telemetry</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF7F1] text-[#16855B] border border-[#16855B]/40">
            🟢 LIVE CONDITIONS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Metric 1: Rainfall Telemetry */}
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#38BDF8]" />
                <span>🌧️ Rainfall Telemetry</span>
              </span>
              {liveWeather?.rainfall_intensity && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] font-bold border border-[#1769AA]/30">
                  {liveWeather.rainfall_intensity}
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xs text-[#5B6B78] dark:text-slate-400 font-semibold">Current:</span>
              <span className="text-lg font-black text-[#172B3A] dark:text-white font-mono">
                {liveWeather ? (liveWeather.rain_mm_hr !== null && liveWeather.rain_mm_hr !== undefined ? `${liveWeather.rain_mm_hr} mm/hr` : (liveWeather.precipitation_mm_hr !== null && liveWeather.precipitation_mm_hr !== undefined ? `${liveWeather.precipitation_mm_hr} mm/hr` : 'Unavailable')) : '--'}
              </span>
            </div>

            <div className="pt-1 border-t border-[#D7E0E7] dark:border-[#1E2E4A] space-y-1 text-[11px]">
              <div className="flex justify-between items-center text-[#5B6B78] dark:text-slate-400">
                <span>Recent:</span>
                <strong className="text-[#172B3A] dark:text-slate-200 font-mono">
                  {liveWeather ? (liveWeather.accum_3h_rain_mm !== null && liveWeather.accum_3h_rain_mm !== undefined ? `${liveWeather.accum_3h_rain_mm} mm (last 3h)` : (liveWeather.accum_3h_precipitation_mm !== null && liveWeather.accum_3h_precipitation_mm !== undefined ? `${liveWeather.accum_3h_precipitation_mm} mm (last 3h)` : 'Unavailable')) : '--'}
                </strong>
              </div>

              <div className="flex justify-between items-center text-[#5B6B78] dark:text-slate-400">
                <span>24h Accumulated:</span>
                <strong className="text-[#172B3A] dark:text-slate-200 font-mono">
                  {liveWeather ? (liveWeather.accum_24h_rain_mm !== null && liveWeather.accum_24h_rain_mm !== undefined ? `${liveWeather.accum_24h_rain_mm} mm` : (liveWeather.accum_24h_precipitation_mm !== null && liveWeather.accum_24h_precipitation_mm !== undefined ? `${liveWeather.accum_24h_precipitation_mm} mm` : 'Unavailable')) : '--'}
                </strong>
              </div>

              <div className="flex justify-between items-center text-[#5B6B78] dark:text-slate-400">
                <span>24h Forecast:</span>
                <strong className="text-[#1769AA] dark:text-[#38BDF8] font-mono">
                  {liveWeather ? (liveWeather.forecast_24h_rain_mm !== null && liveWeather.forecast_24h_rain_mm !== undefined ? `${liveWeather.forecast_24h_rain_mm} mm` : (liveWeather.forecast_24h_precipitation_mm !== null && liveWeather.forecast_24h_precipitation_mm !== undefined ? `${liveWeather.forecast_24h_precipitation_mm} mm` : 'Unavailable')) : '--'}
                </strong>
              </div>
            </div>
          </div>

          {/* Metric 2: Soil Moisture */}
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5 transition-colors">
            <span className="text-[10px] uppercase font-bold text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#38BDF8]" />
              <span>💧 Soil Moisture</span>
            </span>
            <div className="text-lg font-black text-[#172B3A] dark:text-white font-mono">
              {liveWeather ? `${liveWeather.soil_saturation_pct}%` : '--'}
            </div>
            <div className="pt-1 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-[11px] text-[#5B6B78] dark:text-slate-400 flex justify-between">
              <span>Volumetric:</span>
              <strong className="text-[#172B3A] dark:text-slate-200 font-mono">{liveWeather ? `${liveWeather.soil_moisture_m3} m³/m³` : '--'}</strong>
            </div>
          </div>

          {/* Metric 3: Surface Runoff */}
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5 transition-colors">
            <span className="text-[10px] uppercase font-bold text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#D99A00] dark:text-amber-400" />
              <span>Surface Runoff</span>
            </span>
            <div className="text-lg font-black text-[#172B3A] dark:text-white font-mono">
              {liveWeather?.surface_runoff ? `${liveWeather.surface_runoff.value_mm_hr} mm/hr` : '--'}
            </div>
            <div className="pt-1 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-[11px] text-[#5B6B78] dark:text-slate-400 truncate" title="Estimated from Open-Meteo precipitation & soil moisture">
              (Derived runoff)
            </div>
          </div>

          {/* Metric 4: Ambient / Wind */}
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5 transition-colors">
            <span className="text-[10px] uppercase font-bold text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-[#16855B] dark:text-emerald-400" />
              <span>Wind & Temp</span>
            </span>
            <div className="text-lg font-black text-[#172B3A] dark:text-white font-mono">
              {liveWeather ? `${liveWeather.temperature_c}°C` : '--'}
            </div>
            <div className="pt-1 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-[11px] text-[#5B6B78] dark:text-slate-400 flex justify-between">
              <span>Wind:</span>
              <strong className="text-[#172B3A] dark:text-slate-200 font-mono">{liveWeather ? `${liveWeather.wind_speed_kmh} km/h` : '--'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. ENVIRONMENTAL + HISTORICAL RISK                                   */}
      {/* ===================================================================== */}
      <div className="p-4 bg-[#F8FAFC] border border-[#D7E0E7] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7E0E7] pb-2.5">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-[#1769AA]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#172B3A]">
              ENVIRONMENTAL + HISTORICAL RISK
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-[#E8F2F8] text-[#1769AA] border border-[#1769AA]/40 font-bold">
              🔵 TERRAIN DATA
            </span>
            <span className="px-2 py-0.5 rounded bg-[#F8FAFC] text-[#5B6B78] border border-[#D7E0E7] font-bold">
              🟣 HISTORICAL SUSCEPTIBILITY
            </span>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Card 1: Elevation */}
          <div className="p-3.5 bg-white dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
                <span>⛰️ Elevation</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] rounded border border-[#1769AA]/30">
                Copernicus DEM
              </span>
            </div>
            <div className="text-2xl font-black text-[#172B3A] dark:text-white tracking-tight">
              {elevationVal} m
            </div>
            <div className="text-[10px] text-[#5B6B78] dark:text-slate-400 flex items-center justify-between pt-0.5 border-t border-[#D7E0E7] dark:border-[#1E2E4A]">
              <span>Terrain Tier:</span>
              <strong className="text-[#1769AA] dark:text-[#38BDF8] font-bold">
                {elevationVal >= 1200 ? 'High Alpine' : (elevationVal >= 600 ? 'Sub-Himalayan' : 'Lowland / Basin')}
              </strong>
            </div>
          </div>

          {/* Card 2: Estimated Slope */}
          <div className="p-3.5 bg-white dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
                <span>📐 Estimated Slope</span>
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${
                terrainRisk === 'HIGH' ? 'bg-[#FFF7E6] dark:bg-orange-950/40 text-[#E87516] dark:text-orange-300 border-[#E87516]/40' : (terrainRisk === 'MODERATE' ? 'bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border-[#D99A00]/40' : 'bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300 border-[#16855B]/40')
              }`}>
                {terrainRisk} RISK
              </span>
            </div>
            <div className="text-2xl font-black text-[#172B3A] dark:text-white tracking-tight">
              {slopeVal}°
            </div>
            <div className="text-[10px] text-[#5B6B78] dark:text-slate-400 flex items-center justify-between pt-0.5 border-t border-[#D7E0E7] dark:border-[#1E2E4A]">
              <span className="text-[9px] text-[#5B6B78] dark:text-slate-400 italic">Estimated terrain slope</span>
              <strong className="text-[#172B3A] dark:text-slate-200">
                {slopeVal >= 30 ? 'Steep Escarpment' : (slopeVal >= 15 ? 'Moderate Incline' : 'Gentle / Valley')}
              </strong>
            </div>
          </div>

          {/* Card 3: Historical Flood Exposure */}
          <div className="p-3.5 bg-white dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
                <span>📚 Historical Flood Exposure</span>
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                histFloodExposure === 'HIGH' ? 'bg-[#FFF1F1] dark:bg-red-950/40 text-[#C62828] dark:text-red-300 border-[#C62828]/40' : (histFloodExposure === 'MODERATE' ? 'bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border-[#D99A00]/40' : 'bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300 border-[#16855B]/40')
              }`}>
                {histFloodExposure}
              </span>
            </div>
            <div className="text-2xl font-black text-[#172B3A] dark:text-white tracking-tight">
              {histFloodExposure}
            </div>
            <div className="text-[10px] text-[#5B6B78] dark:text-slate-400 flex items-center justify-between pt-0.5 border-t border-[#D7E0E7] dark:border-[#1E2E4A]">
              <span>Historical events nearby:</span>
              <strong className="text-[#1769AA] dark:text-[#38BDF8] font-bold">{histFloodEvents} events</strong>
            </div>
          </div>

          {/* Card 4: Historical Landslide Exposure */}
          <div className="p-3.5 bg-white dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
                <span>📚 Historical Landslide Exposure</span>
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                histLandslideSusceptibility === 'HIGH' ? 'bg-[#FFF1F1] dark:bg-red-950/40 text-[#C62828] dark:text-red-300 border-[#C62828]/40' : (histLandslideSusceptibility === 'MODERATE' ? 'bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border-[#D99A00]/40' : 'bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300 border-[#16855B]/40')
              }`}>
                {histLandslideSusceptibility}
              </span>
            </div>
            <div className="text-2xl font-black text-[#172B3A] dark:text-white tracking-tight">
              {histLandslideSusceptibility}
            </div>
            <div className="text-[10px] text-[#5B6B78] dark:text-slate-400 flex items-center justify-between pt-0.5 border-t border-[#D7E0E7] dark:border-[#1E2E4A]">
              <span>Atlas Density / Rank:</span>
              <strong className="text-[#1769AA] dark:text-[#38BDF8] font-bold">
                {histLandslideRank ? `#${histLandslideRank} in India` : `${histLandslidesCount} cataloged`}
              </strong>
            </div>
          </div>
        </div>

        {/* Historical Occurrence Disclaimer */}
        <p className="text-[10px] text-[#5B6B78] dark:text-slate-400 italic bg-white dark:bg-[#070F1E] p-2 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A]">
          ⚠️ <strong>Note:</strong> Historical flood and landslide occurrences provide empirical baseline susceptibility context and do NOT automatically indicate that a disaster is currently taking place.
        </p>
      </div>

      {/* ===================================================================== */}
      {/* 6. MULTI-SOURCE RISK ASSESSMENT BREAKDOWN                             */}
      {/* ===================================================================== */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D7E0E7]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#E87516]" />
            <span>🧠 MULTI-SOURCE RISK ASSESSMENT</span>
          </span>
          <span className="text-[10px] text-[#5B6B78]">
            Weighted Multi-Parameter Formulation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Flash Flood */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#D7E0E7] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                <span>🌊 Flash Flood Risk</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(liveRisk?.flash_flood_level || 'LOW')}`}>
                {liveRisk?.flash_flood_level || 'LOW'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#172B3A]">{liveRisk?.flash_flood_score ?? 0}</span>
              <span className="text-[10px] text-[#5B6B78]">/ 100</span>
            </div>
            <div className="w-full bg-[#D7E0E7] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  liveRisk?.flash_flood_score >= 76 ? 'bg-[#C62828]' : (liveRisk?.flash_flood_score >= 51 ? 'bg-[#E87516]' : (liveRisk?.flash_flood_score >= 26 ? 'bg-[#D99A00]' : 'bg-[#16855B]'))
                }`} 
                style={{ width: `${Math.min(100, liveRisk?.flash_flood_score || 0)}%` }}
              />
            </div>
            <div className="text-[10px] text-[#5B6B78] flex justify-between pt-1 border-t border-[#D7E0E7]">
              <span>Historical Susceptibility:</span>
              <strong className="text-[#1769AA]">{histFloodExposure}</strong>
            </div>
          </div>

          {/* Landslide */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#D7E0E7] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                <span>⛰️ Landslide Risk</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(liveRisk?.landslide_level || 'LOW')}`}>
                {liveRisk?.landslide_level || 'LOW'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#172B3A]">{liveRisk?.landslide_score ?? 0}</span>
              <span className="text-[10px] text-[#5B6B78]">/ 100</span>
            </div>
            <div className="w-full bg-[#D7E0E7] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  liveRisk?.landslide_score >= 76 ? 'bg-[#C62828]' : (liveRisk?.landslide_score >= 51 ? 'bg-[#E87516]' : (liveRisk?.landslide_score >= 26 ? 'bg-[#D99A00]' : 'bg-[#16855B]'))
                }`} 
                style={{ width: `${Math.min(100, liveRisk?.landslide_score || 0)}%` }}
              />
            </div>
            <div className="text-[10px] text-[#5B6B78] flex justify-between pt-1 border-t border-[#D7E0E7]">
              <span>Estimated Slope:</span>
              <strong className="text-[#1769AA]">{slopeVal}°</strong>
            </div>
          </div>

          {/* Heavy Rainfall */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#D7E0E7] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                <span>🌧️ Heavy Rainfall</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(liveRisk?.heavy_rainfall_level || 'LOW')}`}>
                {liveRisk?.heavy_rainfall_level || 'LOW'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#172B3A]">{liveRisk?.heavy_rainfall_score ?? 0}</span>
              <span className="text-[10px] text-[#5B6B78]">/ 100</span>
            </div>
            <div className="w-full bg-[#D7E0E7] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  liveRisk?.heavy_rainfall_score >= 76 ? 'bg-[#C62828]' : (liveRisk?.heavy_rainfall_score >= 51 ? 'bg-[#E87516]' : (liveRisk?.heavy_rainfall_score >= 26 ? 'bg-[#D99A00]' : 'bg-[#16855B]'))
                }`} 
                style={{ width: `${Math.min(100, liveRisk?.heavy_rainfall_score || 0)}%` }}
              />
            </div>
            <div className="text-[10px] text-[#5B6B78] flex justify-between pt-1 border-t border-[#D7E0E7]">
              <span>Overall Multi-Source Risk:</span>
              <strong className="text-[#172B3A]">{overallScore}/100</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 7. GROUNDED RISK FACTORS & DATA TRANSPARENCY                          */}
      {/* ===================================================================== */}
      <div className="p-4 bg-[#F8FAFC] dark:bg-[#0D162B] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#D7E0E7] dark:border-[#1E2E4A] pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16855B] dark:text-emerald-400" />
            <span>Corroborated Telemetry & Susceptibility Factors</span>
          </span>
          <span className="text-[10px] text-[#5B6B78] dark:text-slate-400">Multi-Layer Grounded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {(liveRisk?.factors || ['Environmental metrics within nominal baseline limits']).map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-white dark:bg-[#070F1E] rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A] text-[#172B3A] dark:text-slate-200">
              <span className="text-[#16855B] dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-snug">{factor}</span>
            </div>
          ))}
        </div>

        {/* Data Sources Transparency Matrix */}
        <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] text-[10px] text-[#5B6B78] dark:text-slate-400 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="p-2 bg-white dark:bg-[#070F1E] rounded border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <strong className="text-[#16855B] dark:text-emerald-400 block mb-0.5">Live Weather:</strong>
            <span>Open-Meteo Live Forecast API</span>
          </div>
          <div className="p-2 bg-white dark:bg-[#070F1E] rounded border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <strong className="text-[#1769AA] dark:text-[#38BDF8] block mb-0.5">Terrain / Slope:</strong>
            <span>Open-Meteo Elevation API / Copernicus DEM (90m)</span>
          </div>
          <div className="p-2 bg-white dark:bg-[#070F1E] rounded border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <strong className="text-[#D99A00] dark:text-amber-400 block mb-0.5">Historical Flood:</strong>
            <span>India Flood Inventory (IFI-Impacts 1967–2023)</span>
          </div>
          <div className="p-2 bg-white dark:bg-[#070F1E] rounded border border-[#D7E0E7] dark:border-[#1E2E4A]">
            <strong className="text-[#E87516] dark:text-orange-400 block mb-0.5">Historical Landslide:</strong>
            <span>ISRO / NRSC Landslide Atlas of India</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 8. MANUAL LATITUDE / LONGITUDE MODAL                                  */}
      {/* ===================================================================== */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl text-[#172B3A] dark:text-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#D7E0E7] dark:border-[#1E2E4A] pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#D99A00]" />
                <h3 className="text-sm font-bold text-[#172B3A] dark:text-white uppercase">
                  ENTER LOCATION COORDINATES
                </h3>
              </div>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="text-[#5B6B78] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5B6B78] dark:text-slate-300">
              Enter custom coordinates to query live Open-Meteo weather, retrieve real Copernicus DEM elevation & slope gradient, and analyze historical flood/landslide exposure.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#172B3A] dark:text-slate-200 mb-1 font-semibold">Location / Sector Label</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Chamoli Sector or Wayanad Hills"
                  className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2.5 text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172B3A] mb-1 font-semibold">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g. 30.4137"
                    className="w-full bg-[#F8FAFC] border border-[#D7E0E7] rounded-lg p-2.5 text-[#172B3A] focus:outline-none focus:border-[#1769AA]"
                  />
                </div>

                <div>
                  <label className="block text-[#172B3A] mb-1 font-semibold">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="e.g. 79.3242"
                    className="w-full bg-[#F8FAFC] border border-[#D7E0E7] rounded-lg p-2.5 text-[#172B3A] focus:outline-none focus:border-[#1769AA]"
                  />
                </div>
              </div>

              {/* Quick Preset Coordinates */}
              <div className="pt-2 border-t border-[#D7E0E7] space-y-1.5">
                <span className="text-[10px] text-[#5B6B78] uppercase font-bold block">Quick Benchmark Test Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setManualLat('30.3165'); setManualLng('78.0322'); setManualName('Dehradun, Uttarakhand'); }}
                    className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#E8F2F8] rounded text-[10px] text-[#172B3A] border border-[#D7E0E7]"
                  >
                    Dehradun (30.32, 78.03)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('30.4137'); setManualLng('79.3242'); setManualName('Chamoli, Uttarakhand'); }}
                    className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#E8F2F8] rounded text-[10px] text-[#172B3A] border border-[#D7E0E7]"
                  >
                    Chamoli (30.41, 79.32)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('11.6854'); setManualLng('76.1320'); setManualName('Wayanad, Kerala'); }}
                    className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#E8F2F8] rounded text-[10px] text-[#172B3A] border border-[#D7E0E7]"
                  >
                    Wayanad (11.69, 76.13)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('27.3389'); setManualLng('88.6065'); setManualName('Gangtok, Sikkim'); }}
                    className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#E8F2F8] rounded text-[10px] text-[#172B3A] border border-[#D7E0E7]"
                  >
                    Gangtok (27.34, 88.61)
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D7E0E7]">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#E8F2F8] text-[#5B6B78] hover:text-[#172B3A] border border-[#D7E0E7] rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1769AA] hover:bg-[#125890] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
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
