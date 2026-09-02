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
  Navigation
} from 'lucide-react';

export default function LiveWeatherRiskCard() {
  const { 
    liveWeather, 
    liveRisk, 
    isLiveWeatherLoading, 
    liveWeatherError, 
    lastWeatherUpdated, 
    refreshRisk, 
    userCoords, 
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
      {/* 1. HEADER STRIP: Real API Indicator, Location & Refresh Controls       */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              LIVE OPEN-METEO WEATHER ENGINE
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
            <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
              ({userCoords.lat.toFixed(4)}°N, {userCoords.lng.toFixed(4)}°E)
            </span>
            {locationInputMode === 'gps' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                GPS Live
              </span>
            )}
          </div>
        </div>

        {/* Location Switchers & Refresh Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={requestUserLocation}
            disabled={isLiveWeatherLoading}
            title="Use browser Geolocation API"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-400" />
            <span>Use GPS</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Manual Lat/Lng</span>
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

      {/* ===================================================================== */}
      {/* 2. ERROR DISPLAY: If Open-Meteo API fails (Step 6)                     */}
      {/* ===================================================================== */}
      {liveWeatherError && (
        <div className="p-3.5 bg-red-950/70 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <strong className="block text-red-300">Live weather data temporarily unavailable.</strong>
            <span className="text-[11px] text-red-400/90">
              Unable to reach Open-Meteo endpoint. Check network connection or retry in a few moments.
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
              ⚠️ OVERALL RISK: {overallLvl} ({overallScore}/100)
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
              Calculated using live Open-Meteo hourly metrics connected to the PralayWatch deterministic risk engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-right font-mono text-[11px] text-slate-400">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Updated: <strong className="text-white">{formatTimeAgo(lastWeatherUpdated)}</strong></span>
            </div>
            <span>Lead Time: <strong className="text-white">~{liveRisk?.lead_time_minutes || 30} mins</strong></span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. REAL WEATHER TELEMETRY METRIC GRID (Precip, Soil, Wind, Temp)       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Metric 1: Rainfall */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>🌧️ Rainfall Telemetry</span>
          </span>
          <div className="text-lg font-black text-white">
            {liveWeather ? `${liveWeather.precipitation_mm_hr} mm/hr` : '--'}
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>24h Forecast:</span>
            <strong className="text-slate-200">{liveWeather ? `${liveWeather.forecast_24h_precipitation_mm} mm` : '--'}</strong>
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

        {/* Metric 3: Surface Runoff (Derived from precip & soil) */}
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

      {/* ===================================================================== */}
      {/* 5. MULTI-HAZARD RISK BREAKDOWN TILES (Flash Flood, Landslide, Rain)     */}
      {/* ===================================================================== */}
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
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. RISK FACTORS SECTION (Only Supported by API Data)                  */}
      {/* ===================================================================== */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Active Environmental Risk Factors (Telemetry Corroborated)</span>
          </span>
          <span className="text-[10px] text-slate-500">Open-Meteo Grounded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {(liveRisk?.factors || ['Environmental metrics within nominal baseline limits']).map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-slate-200">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-snug">{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 7. MANUAL LATITUDE / LONGITUDE MODAL (Step 3)                          */}
      {/* ===================================================================== */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
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
              Enter any custom latitude and longitude to fetch live Open-Meteo weather and evaluate localized multi-hazard risk.
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
                    placeholder="e.g. 30.4124"
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
                    placeholder="e.g. 79.3198"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Preset Coordinates */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Quick Vulnerable Region Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setManualLat('30.4124'); setManualLng('79.3198'); setManualName('Chamoli, Uttarakhand'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Chamoli (30.41, 79.31)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('31.9579'); setManualLng('77.1095'); setManualName('Kullu, HP'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Kullu (31.95, 77.10)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('27.6039'); setManualLng('88.6464'); setManualName('Chungthang, Sikkim'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Sikkim (27.60, 88.64)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat('11.6854'); setManualLng('76.1320'); setManualName('Wayanad, Kerala'); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                  >
                    Wayanad (11.68, 76.13)
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
                  <span>Fetch Live Weather & Risk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
