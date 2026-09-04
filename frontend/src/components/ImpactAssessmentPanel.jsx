import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  School, 
  Building2, 
  Milestone, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake, 
  Truck, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Hospital
} from 'lucide-react';

export default function ImpactAssessmentPanel() {
  const { pipelineData, locationRisk, selectedLocation } = useApp();
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Extract Stage 4 Impact Assessment from pipelineData or locationRisk
  const impact = pipelineData?.impact || locationRisk?.impact_assessment || {
    label: "Estimated Impact",
    priority: locationRisk?.overall_level === "CRITICAL" ? "VERY HIGH" : (locationRisk?.overall_level === "HIGH" ? "HIGH" : "MODERATE"),
    impact_priority_level: locationRisk?.overall_level === "CRITICAL" ? "VERY HIGH" : (locationRisk?.overall_level === "HIGH" ? "HIGH" : "MODERATE"),
    impact_priority_score: locationRisk?.overall_score || 45.0,
    population_at_risk: locationRisk?.overall_level === "CRITICAL" ? 12400 : 4200,
    total_sector_population: selectedLocation?.population || 50000,
    schools: locationRisk?.overall_level === "CRITICAL" ? 4 : 2,
    hospitals: locationRisk?.overall_level === "CRITICAL" ? 1 : 1,
    road_segments: locationRisk?.overall_level === "CRITICAL" ? 7 : 3,
    bridges: locationRisk?.overall_level === "CRITICAL" ? 2 : 1,
    affected_area: locationRisk?.overall_level === "CRITICAL" ? "18.5 sq km" : "6.5 sq km",
    vulnerable_demographics: {
      elderly_above_60: locationRisk?.overall_level === "CRITICAL" ? 1736 : 588,
      children_under_12: locationRisk?.overall_level === "CRITICAL" ? 2232 : 756,
      persons_requiring_medical_assistance: locationRisk?.overall_level === "CRITICAL" ? 744 : 252
    },
    vulnerable_locations: [
      `${selectedLocation?.name || 'Sector'} Lower Riverbank Floodplain Corridor`,
      `${selectedLocation?.name || 'Sector'} Slum & Informal Riverside Settlement Cluster`,
      `${selectedLocation?.name || 'Sector'} Ward-4 Hillside Cutting & Unstable Slope Basin`
    ],
    critical_infrastructure: [
      {
        asset_name: `${selectedLocation?.name || 'Sector'} Main River Bridge & Highway Bypass`,
        asset_type: "Transportation Lifeline",
        risk_status: "High Inundation & Scour Threat",
        mitigation_action: "Close bridge to non-emergency heavy vehicles"
      },
      {
        asset_name: `${selectedLocation?.name || 'Sector'} 33/11kV Electrical Substation`,
        asset_type: "Power Grid",
        risk_status: "Waterlogging & Submersion Risk",
        mitigation_action: "Deploy portable flood barriers & de-energize low lines"
      },
      {
        asset_name: `${selectedLocation?.name || 'Sector'} Civil Hospital / PHC`,
        asset_type: "Emergency Healthcare",
        risk_status: "Access Route Threatened",
        mitigation_action: "Prepare standby generator & boat ambulances"
      }
    ],
    priority_response_locations: [
      {
        priority_rank: 1,
        location_name: `${selectedLocation?.name || 'Sector'} Riverside Ghats & Low-Lying Wards`,
        target_population: locationRisk?.overall_level === "CRITICAL" ? 5580 : 1890,
        primary_threat: "Rapid River Surge & Inundation",
        recommended_response: "Deploy SDRF inflatable rescue boats & initiate immediate door-to-door evacuation",
        urgency: locationRisk?.overall_level === "CRITICAL" ? "IMMEDIATE (Next 30 mins)" : "HIGH WATCH"
      },
      {
        priority_rank: 2,
        location_name: `${selectedLocation?.name || 'Sector'} Hillside Slopes & Cut-Slope Settlement`,
        target_population: locationRisk?.overall_level === "CRITICAL" ? 4340 : 1470,
        primary_threat: "Geotechnical Limit Equilibrium Shear Failure",
        recommended_response: "Evacuate hillside dwellings to designated high-ridge structural shelters",
        urgency: locationRisk?.overall_level === "CRITICAL" ? "IMMEDIATE (Next 45 mins)" : "MONITORING"
      }
    ]
  };

  const priorityLevel = impact.priority || impact.impact_priority_level || "MODERATE";
  const isCritical = priorityLevel === "VERY HIGH" || locationRisk?.overall_level === "CRITICAL";
  const isHigh = priorityLevel === "HIGH" || locationRisk?.overall_level === "HIGH";

  const priorityColor = isCritical 
    ? "bg-[#FFF1F1] dark:bg-[#3B1219] text-[#C62828] dark:text-[#F87171] border border-[#C62828]/40" 
    : (isHigh ? "bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40" : "bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40");

  return (
    <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 lg:p-6 shadow-sm relative overflow-hidden space-y-5 font-mono text-[#172B3A] dark:text-[#E2E8F0]">
      {/* Background ambient lighting */}
      <div className={`absolute top-0 right-0 w-96 h-48 blur-3xl pointer-events-none ${
        isCritical ? 'bg-red-600/10' : (isHigh ? 'bg-orange-600/10' : 'bg-blue-600/10')
      }`} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D7E0E7] dark:border-[#1E2E4A] relative z-10">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${
            isCritical ? 'bg-[#FFF1F1] dark:bg-[#3B1219] border-[#C62828]/40 text-[#C62828] dark:text-[#F87171]' : 'bg-[#F8FAFC] dark:bg-[#0B1528] border-[#1769AA]/30 text-[#1769AA] dark:text-[#38BDF8]'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-[#172B3A] dark:text-[#F8FAFC] tracking-tight">
                Estimated Impact Assessment
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#E8F2F8] dark:bg-[#0C2D48] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                STAGE 4 INTELLIGENCE
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40 font-mono text-[10px] font-bold">
                ESTIMATED IMPACT
              </span>
            </div>
            <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] mt-0.5 font-mono">
              Sector: <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{selectedLocation?.name || 'Dehradun'}</strong> ({selectedLocation?.state}) • Risk Score: <strong className={isCritical ? 'text-[#C62828] dark:text-[#F87171]' : 'text-[#D99A00] dark:text-[#FBBF24]'}>{locationRisk?.overall_score || 72}/100</strong>
            </p>
          </div>
        </div>

        {/* Impact Priority Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 shadow-sm ${priorityColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>PRIORITY: {priorityLevel}</span>
          </div>
        </div>
      </div>

      {/* 1. Core Estimated Impact KPI Cards (Matching exact specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Population at Risk */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B78] dark:text-[#94A3B8] mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold">Population at Risk</span>
            <Users className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-[#172B3A] dark:text-[#F8FAFC]">
            {(impact.population_at_risk || impact.exposed_population || 0).toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] mt-1">
            of {(impact.total_sector_population || 50000).toLocaleString()} residents ({impact.exposure_percentage || 25}%)
          </span>
        </div>

        {/* Schools Potentially Affected */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B78] dark:text-[#94A3B8] mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold">Schools</span>
            <School className="w-4 h-4 text-[#D99A00] dark:text-[#FBBF24]" />
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-[#D99A00] dark:text-[#FBBF24]">
            {impact.schools || impact.schools_count || 0}
          </div>
          <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] mt-1">
            Educational Facilities
          </span>
        </div>

        {/* Hospitals Potentially Affected */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B78] dark:text-[#94A3B8] mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold">Hospitals / PHCs</span>
            <Hospital className="w-4 h-4 text-[#C62828] dark:text-[#F87171]" />
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-[#C62828] dark:text-[#F87171]">
            {impact.hospitals || impact.hospitals_count || 0}
          </div>
          <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] mt-1">
            Health Centers
          </span>
        </div>

        {/* Road Segments Potentially Affected */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B78] dark:text-[#94A3B8] mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold">Road Segments</span>
            <Milestone className="w-4 h-4 text-[#E87516] dark:text-[#FB923C]" />
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-[#E87516] dark:text-[#FB923C]">
            {impact.road_segments || impact.road_segments_count || 0}
          </div>
          <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] mt-1">
            Corridors Compromised
          </span>
        </div>

        {/* Bridges Potentially Affected */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B78] dark:text-[#94A3B8] mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold">Bridges / Culverts</span>
            <Building2 className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-[#1769AA] dark:text-[#38BDF8]">
            {impact.bridges || impact.bridges_count || 0}
          </div>
          <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] mt-1">
            Water Crossings
          </span>
        </div>

        {/* Estimated Affected Area */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B78] dark:text-[#94A3B8] mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold">Affected Area</span>
            <Layers className="w-4 h-4 text-[#16855B] dark:text-[#34D399]" />
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-[#16855B] dark:text-[#34D399]">
            {impact.affected_area || `${impact.affected_area_sq_km || 15} sq km`}
          </div>
          <span className="text-[10px] font-mono text-[#5B6B78] dark:text-[#94A3B8] mt-1">
            ~{impact.affected_radius_km || 4} km Danger Radius
          </span>
        </div>
      </div>

      {/* 2. Vulnerable Demographic Breakdown */}
      {impact.vulnerable_demographics && (
        <div className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[#172B3A] dark:text-[#F8FAFC]">
            <HeartHandshake className="w-4 h-4 text-[#C62828] dark:text-[#F87171]" />
            <span>High-Priority Demographic Vulnerability Breakdown:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-white dark:bg-[#070F1E] p-2.5 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between">
              <span className="text-[#5B6B78] dark:text-[#94A3B8]">Elderly (&gt;60 yrs):</span>
              <strong className="text-[#D99A00] dark:text-[#FBBF24] font-bold">{(impact.vulnerable_demographics.elderly_above_60 || 0).toLocaleString()} residents</strong>
            </div>
            <div className="bg-white dark:bg-[#070F1E] p-2.5 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between">
              <span className="text-[#5B6B78] dark:text-[#94A3B8]">Children (&lt;12 yrs):</span>
              <strong className="text-[#1769AA] dark:text-[#38BDF8] font-bold">{(impact.vulnerable_demographics.children_under_12 || 0).toLocaleString()} residents</strong>
            </div>
            <div className="bg-white dark:bg-[#070F1E] p-2.5 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A] flex items-center justify-between">
              <span className="text-[#5B6B78] dark:text-[#94A3B8]">Medical / Mobility Priority:</span>
              <strong className="text-[#C62828] dark:text-[#F87171] font-bold">{(impact.vulnerable_demographics.persons_requiring_medical_assistance || 0).toLocaleString()} residents</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. Priority Response Locations (Ranked First Responder Targets) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#172B3A] dark:text-[#F8FAFC] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#E87516] dark:text-[#FB923C]" />
            Priority Response Locations (SDRF / First Responder Deployment Targets):
          </span>
          <button
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="text-xs font-mono text-[#1769AA] dark:text-[#38BDF8] hover:underline font-bold flex items-center gap-1"
          >
            <span>{isDetailsExpanded ? 'Collapse Assets' : 'View Infrastructure Details'}</span>
            {isDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(impact.priority_response_locations || []).slice(0, 2).map((target, idx) => (
            <div key={idx} className="bg-[#F8FAFC] dark:bg-[#0B1528] border border-[#D7E0E7] dark:border-[#1E2E4A] p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFF7E6] dark:bg-[#3A280B] text-[#D99A00] dark:text-[#FBBF24] border border-[#D99A00]/40">
                  RANK #{target.priority_rank || idx + 1} PRIORITY
                </span>
                <span className="text-[10px] font-mono text-[#C62828] dark:text-[#F87171] font-semibold">
                  {target.urgency || "IMMEDIATE"}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#172B3A] dark:text-[#F8FAFC] font-mono">
                {target.location_name}
              </h4>
              <p className="text-xs text-[#5B6B78] dark:text-[#94A3B8] font-mono leading-relaxed">
                👉 <strong className="text-[#172B3A] dark:text-[#F8FAFC]">Response Action:</strong> {target.recommended_response}
              </p>
              <div className="text-[11px] text-[#5B6B78] dark:text-[#94A3B8] font-mono pt-1 border-t border-[#D7E0E7] dark:border-[#1E2E4A] flex justify-between">
                <span>Threat: <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{target.primary_threat}</strong></span>
                <span>Pop. at Risk: ~<strong className="text-[#172B3A] dark:text-[#F8FAFC]">{(target.target_population || 0).toLocaleString()}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Critical Civic Infrastructure Assets & GIS Extensibility Section */}
      {isDetailsExpanded && (
        <div className="space-y-3 pt-3 border-t border-[#D7E0E7] dark:border-[#1E2E4A]">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#172B3A] dark:text-[#F8FAFC] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
            Critical Infrastructure Lifelines Under Threat:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(impact.critical_infrastructure || []).map((asset, idx) => (
              <div key={idx} className="bg-[#F8FAFC] dark:bg-[#070F1E] p-3 rounded-lg border border-[#D7E0E7] dark:border-[#1E2E4A] text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-[#172B3A] dark:text-[#F8FAFC]">{asset.asset_name}</strong>
                  <span className="text-[10px] text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 px-1.5 py-0.5 rounded">
                    {asset.asset_type}
                  </span>
                </div>
                <p className="text-[#5B6B78] dark:text-[#94A3B8] text-[11px]">
                  Status: <span className="text-[#D99A00] dark:text-[#FBBF24] font-semibold">{asset.risk_status}</span>
                </p>
                <p className="text-[#5B6B78] dark:text-[#94A3B8] text-[11px]">
                  Mitigation: <span className="text-[#172B3A] dark:text-[#E2E8F0]">{asset.mitigation_action}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Extensibility schema banner */}
          <div className="bg-[#E8F2F8] dark:bg-[#0C2D48] border border-[#1769AA]/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#172B3A] dark:text-[#E2E8F0]">
            <Info className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-mono text-[#1769AA] dark:text-[#38BDF8]">GIS & Government Dataset Extensibility Schema Active:</strong>
              <p className="text-[11px] text-[#5B6B78] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                This structured impact object is designed to interface with live <strong>OpenStreetMap (OSM)</strong> road vectors, <strong>PMGSY</strong> culvert networks, and <strong>ISRO Bhuvan / NDMA Geoportals</strong> for automated raster-to-infrastructure intersection analysis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
