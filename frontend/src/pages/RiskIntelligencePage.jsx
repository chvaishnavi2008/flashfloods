import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RiskMap from '../components/RiskMap';
import HazardCard from '../components/HazardCard';
import LocationSearch from '../components/LocationSearch';
import RiskGauge from '../components/RiskGauge';
import { 
  Map, 
  MapPin, 
  Layers, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  Droplets, 
  Mountain, 
  Waves, 
  CloudRain,
  Sliders,
  Filter
} from 'lucide-react';

export default function RiskIntelligencePage() {
  const { 
    selectedLocation, 
    locationRisk, 
    environmentalData, 
    selectedLayer, 
    setSelectedLayer 
  } = useApp();

  const [activeTab, setActiveTab] = useState('gis'); // 'gis' or 'telemetry'

  const factors = locationRisk?.contributing_factors || [
    "High rainfall intensity detected in upper catchment",
    "Saturated soil mantle with elevated pore-water pressure",
    "Rapidly rising hydro-gauge river capacity"
  ];

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  TACTICAL GIS & ENVIRONMENTAL INTELLIGENCE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  REAL-TIME SENSOR NETWORK
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                Multi-Hazard Risk Intelligence & Spatial Analysis
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Sector: <strong className="text-white">{selectedLocation?.name || 'Chamoli'}</strong> ({selectedLocation?.state})
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Spatial GIS threat modeling, hazard intensity rasters, geotechnical slope stability indices, and telemetry readings across all monitored Himalayan sectors.
        </p>
      </div>

      {/* 1. Tactical Leaflet GIS Threat Map Canvas */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Interactive Multi-Hazard Threat Matrix & Spatial GIS Map</span>
          </div>

          {/* Layer Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {[
              { id: 'all', label: 'All Hazards' },
              { id: 'flood', label: '🌊 Flash Flood' },
              { id: 'landslide', label: '⛰️ Landslide' },
              { id: 'rainfall', label: '🌧️ Heavy Rain' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLayer(l.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedLayer === l.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <RiskMap height="520px" showRoute={true} />
      </section>

      {/* 2. The Four Core Hazard Breakdown Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Physical Hazard Breakdown & Sensor Gauges</span>
          </h3>
          <span className="text-[11px] text-slate-500">Automated Scoring Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HazardCard
            type="flash_flood"
            title="Flash Flood"
            level={locationRisk?.flash_flood?.level || 'LOW'}
            score={locationRisk?.flash_flood?.score || 20}
            metrics={[
              { label: 'River Water Level', value: `${environmentalData?.river_level_m || 2.1} m`, highlight: environmentalData?.river_level_m > 4.5 },
              { label: 'Capacity Mark', value: `${environmentalData?.river_capacity_pct || 35}%`, highlight: environmentalData?.river_capacity_pct > 75 },
              { label: 'River Trend', value: environmentalData?.river_trend || 'Normal' }
            ]}
            trend={environmentalData?.river_trend || 'Normal'}
          />

          <HazardCard
            type="landslide"
            title="Landslide Risk"
            level={locationRisk?.landslide?.level || 'LOW'}
            score={locationRisk?.landslide?.score || 25}
            metrics={[
              { label: 'Terrain Slope', value: `${environmentalData?.slope_deg || 32}°`, highlight: environmentalData?.slope_deg > 35 },
              { label: 'Soil Saturation', value: `${environmentalData?.soil_saturation_pct || 45}%`, highlight: environmentalData?.soil_saturation_pct > 75 },
              { label: 'Stability Index', value: environmentalData?.slope_stability || 'Stable' }
            ]}
            trend={environmentalData?.slope_stability || 'Stable'}
          />

          <HazardCard
            type="heavy_rainfall"
            title="Heavy Rainfall"
            level={locationRisk?.heavy_rainfall?.level || 'LOW'}
            score={locationRisk?.heavy_rainfall?.score || 18}
            metrics={[
              { label: 'Rainfall Intensity', value: environmentalData?.rainfall_intensity || 'Light', highlight: environmentalData?.rainfall_intensity?.includes('Heavy') || environmentalData?.rainfall_intensity?.includes('Cloudburst') },
              { label: 'Current Rate', value: `${environmentalData?.rainfall_rate || 5} mm/hr`, highlight: environmentalData?.rainfall_rate > 50 },
              { label: 'Forecast Trend', value: environmentalData?.rainfall_forecast_trend || 'Stable' }
            ]}
            trend={environmentalData?.rainfall_forecast_trend || 'Stable'}
          />

          <HazardCard
            type="river_flood"
            title="Riverine Inundation"
            level={locationRisk?.flood?.level || 'LOW'}
            score={locationRisk?.flood?.score || 15}
            metrics={[
              { label: 'Catchment Flow', value: 'Alaknanda Sub-basin' },
              { label: 'Discharge Rate', value: 'Nominal Cusecs' },
              { label: 'Buffer Floodplain', value: 'Clear' }
            ]}
            trend="Stable"
          />
        </div>
      </section>

      {/* 3. Raw Environmental Telemetry Metrics Table */}
      <section className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Environmental Sensor Telemetry Readings</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Rainfall Rate</span>
            <div className="text-lg font-bold text-white">{environmentalData?.rainfall_rate} mm/hr</div>
            <span className="text-[10px] text-slate-400">Intensity: {environmentalData?.rainfall_intensity}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">24h Accumulated</span>
            <div className="text-lg font-bold text-white">{environmentalData?.rainfall_mm} mm</div>
            <span className="text-[10px] text-slate-400">Forecast: {environmentalData?.rainfall_forecast_trend}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">River Capacity</span>
            <div className="text-lg font-bold text-white">{environmentalData?.river_capacity_pct}%</div>
            <span className="text-[10px] text-slate-400">Trend: {environmentalData?.river_trend}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Soil Saturation</span>
            <div className="text-lg font-bold text-white">{environmentalData?.soil_saturation_pct}%</div>
            <span className="text-[10px] text-slate-400">Slope: {environmentalData?.slope_deg}°</span>
          </div>
        </div>
      </section>

      {/* 4. Sector Search & Switcher */}
      <section>
        <LocationSearch />
      </section>
    </div>
  );
}
