import React from 'react';
import { useApp } from '../context/AppContext';
import ImpactAssessmentPanel from '../components/ImpactAssessmentPanel';
import LocationSearch from '../components/LocationSearch';
import { 
  Users, 
  School, 
  Building2, 
  Milestone, 
  MapPin, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Info, 
  HeartHandshake, 
  Truck,
  Hospital,
  AlertTriangle
} from 'lucide-react';

export default function ImpactAssessmentPage() {
  const { selectedLocation, locationRisk, pipelineData } = useApp();

  const impact = pipelineData?.impact || locationRisk?.impact_assessment || {
    population_at_risk: 12400,
    total_sector_population: selectedLocation?.population || 50000,
    schools: 4,
    hospitals: 1,
    road_segments: 7,
    bridges: 2,
    affected_area: "18.5 sq km",
    priority: "VERY HIGH"
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  STAGE 4 DISASTER INTELLIGENCE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ESTIMATED IMPACT / SIMULATION DATA
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                Impact & Demographic Exposure Intelligence
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
          Quantifies human exposure, vulnerable sub-groups, compromised transportation corridors, and essential civic infrastructure to prioritize emergency first-responder deployments (SDRF / NDRF).
        </p>
      </div>

      {/* 1. Main Impact Assessment Core Panel */}
      <ImpactAssessmentPanel />

      {/* 2. Location Switcher */}
      <section>
        <LocationSearch />
      </section>
    </div>
  );
}
