import React from 'react';
import { useApp } from '../context/AppContext';
import ImpactAssessmentPanel from '../components/ImpactAssessmentPanel';
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
    <div className="space-y-6 pb-12 font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 rounded-xl">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1769AA] dark:text-[#38BDF8]">
                  STAGE 4 DISASTER INTELLIGENCE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40">
                  ESTIMATED IMPACT / SIMULATION DATA
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#172B3A] dark:text-[#F8FAFC] mt-0.5">
                Impact & Demographic Exposure Intelligence
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5B6B78] dark:text-[#94A3B8]">
              Sector: <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{selectedLocation?.name || 'Chamoli'}</strong> ({selectedLocation?.state})
            </span>
          </div>
        </div>

        <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] max-w-3xl leading-relaxed">
          Quantifies human exposure, vulnerable sub-groups, compromised transportation corridors, and essential civic infrastructure to prioritize emergency first-responder deployments (SDRF / NDRF).
        </p>
      </div>

      {/* 1. Main Impact Assessment Core Panel */}
      <ImpactAssessmentPanel />
    </div>
  );
}
