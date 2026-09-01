from typing import Dict, Any, List
import math

class ImpactAssessmentEngine:
    """
    =============================================================================
    PralayWatch - Stage 4: Impact & Exposure Assessment Engine
    =============================================================================
    
    Translates predicted multi-hazard physical intensities into structured,
    actionable human, infrastructural, and geographic impact estimates.
    
    Architecture Note:
    - Provides a standardized, extensible schema designed to consume future
      GIS layers (OpenStreetMap, PMGSY Road Network, Bhuvan Geoportal, NDMA assets).
    - Prototype estimates are clearly labeled as 'Estimated Impact'
      to prevent conflation with official census/damage surveys.
    """
    
    @classmethod
    def get_priority_level(cls, score: float) -> str:
        """Maps impact priority score (0-100) to standardized priority tiers."""
        if score >= 76.0:
            return "VERY HIGH"
        elif score >= 51.0:
            return "HIGH"
        elif score >= 26.0:
            return "MODERATE"
        else:
            return "LOW"

    @classmethod
    def assess_impact(
        cls, 
        overall_score: float, 
        overall_level: str, 
        location: Any, 
        hazard_results: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates comprehensive impact intelligence for a given monitoring sector:
        - Estimated Population at Risk (with vulnerable demographic breakdown)
        - Vulnerable Micro-Locations / Wards
        - Schools & Health Facilities potentially affected
        - Road segments & Bridges potentially compromised
        - Critical Civic Infrastructure Assets
        - Estimated Affected Area (sq km & radius)
        - Ranked Priority Response Locations for First Responders (SDRF/NDRF)
        - Impact Priority Score & Priority Level (VERY HIGH / HIGH / MODERATE / LOW)
        """
        population = int(getattr(location, 'population', 50000) or 50000)
        loc_name = getattr(location, 'name', 'Monitored Sector')
        terrain = getattr(location, 'terrain_type', 'Mountainous / Valley')
        state = getattr(location, 'state', 'India')
        
        hazard_results = hazard_results or {}
        ff_score = float(hazard_results.get("flash_flood", {}).get("riskScore", hazard_results.get("flash_flood", {}).get("score", overall_score)))
        ls_score = float(hazard_results.get("landslide", {}).get("riskScore", hazard_results.get("landslide", {}).get("score", overall_score)))

        # ---------------------------------------------------------------------
        # 1. Population Exposure Ratios based on Risk Severity Tier
        # ---------------------------------------------------------------------
        if overall_level == "CRITICAL":
            exposure_ratio = min(0.85, 0.45 + (overall_score / 200.0))
            area_sq_km = round(15.0 + (overall_score * 0.2), 1)
            affected_radius_km = round(4.5 + (overall_score * 0.08), 1)
            vulnerability_factor = 90.0
        elif overall_level == "HIGH":
            exposure_ratio = min(0.48, 0.25 + (overall_score / 250.0))
            area_sq_km = round(8.0 + (overall_score * 0.12), 1)
            affected_radius_km = round(2.5 + (overall_score * 0.05), 1)
            vulnerability_factor = 65.0
        elif overall_level == "MODERATE":
            exposure_ratio = min(0.22, 0.10 + (overall_score / 350.0))
            area_sq_km = round(4.0 + (overall_score * 0.08), 1)
            affected_radius_km = round(1.5 + (overall_score * 0.03), 1)
            vulnerability_factor = 35.0
        else:
            exposure_ratio = 0.04
            area_sq_km = 1.5
            affected_radius_km = 0.8
            vulnerability_factor = 10.0
            
        population_at_risk = int(population * exposure_ratio)
        
        # Demographic sub-breakdown
        elderly_count = int(population_at_risk * 0.14)
        children_count = int(population_at_risk * 0.18)
        medical_priority_count = int(population_at_risk * 0.06)

        # ---------------------------------------------------------------------
        # 2. Critical Facilities & Infrastructure Calculations
        # ---------------------------------------------------------------------
        # Heuristic scaling based on sector population density & risk severity
        pop_scale = max(1.0, math.sqrt(population / 10000.0))
        
        if overall_level == "CRITICAL":
            schools_count = max(3, int(pop_scale * 3.5))
            hospitals_count = max(1, int(pop_scale * 1.2))
            road_segments_count = max(5, int(pop_scale * 4.0))
            bridges_count = max(2, int(pop_scale * 1.5)) if ("River" in terrain or "Valley" in terrain) else max(1, int(pop_scale * 0.8))
        elif overall_level == "HIGH":
            schools_count = max(2, int(pop_scale * 2.0))
            hospitals_count = max(1, int(pop_scale * 0.8))
            road_segments_count = max(3, int(pop_scale * 2.5))
            bridges_count = max(1, int(pop_scale * 1.0))
        elif overall_level == "MODERATE":
            schools_count = max(1, int(pop_scale * 0.8))
            hospitals_count = 0 if population < 30000 else 1
            road_segments_count = max(1, int(pop_scale * 1.2))
            bridges_count = 1 if ("River" in terrain or "Valley" in terrain) else 0
        else:
            schools_count = 0
            hospitals_count = 0
            road_segments_count = 0
            bridges_count = 0

        # ---------------------------------------------------------------------
        # 3. Impact Priority Score (0-100) & Priority Level
        # ---------------------------------------------------------------------
        # Weighted combination of Risk Intensity (60%), Population Exposure (25%), Vulnerability (15%)
        raw_priority_score = (
            (overall_score * 0.60) +
            (min(100.0, (population_at_risk / 15000.0) * 100.0) * 0.25) +
            (vulnerability_factor * 0.15)
        )
        impact_priority_score = round(min(100.0, max(0.0, raw_priority_score)), 1)
        impact_priority_level = cls.get_priority_level(impact_priority_score)

        # ---------------------------------------------------------------------
        # 4. Vulnerable Micro-Locations / Sub-Sectors
        # ---------------------------------------------------------------------
        vulnerable_locations = [
            f"{loc_name} Lower Riverbank Floodplain Corridor",
            f"{loc_name} Slum & Informal Riverside Settlement Cluster",
            f"{loc_name} Ward-4 Hillside Cutting & Unstable Slope Basin",
            f"{loc_name} Lowland Main Bazaar & Drainage Underpass"
        ] if overall_level in ["CRITICAL", "HIGH"] else [
            f"{loc_name} Low-lying Stormwater Culvert Zone",
            f"{loc_name} Agricultural Riverside Buffer"
        ]

        # ---------------------------------------------------------------------
        # 5. Critical Infrastructure Assets Breakdown
        # ---------------------------------------------------------------------
        critical_infrastructure = [
            {
                "asset_name": f"{loc_name} Main River Bridge & Highway Bypass",
                "asset_type": "Transportation Lifeline",
                "risk_status": "High Inundation & Debris Impact Threat" if overall_level in ["CRITICAL", "HIGH"] else "Under Observation",
                "mitigation_action": "Close bridge to non-emergency heavy vehicles"
            },
            {
                "asset_name": f"{loc_name} 33/11kV Electrical Distribution Substation",
                "asset_type": "Power Grid",
                "risk_status": "Submersion / Short Circuit Threat" if overall_level == "CRITICAL" else "Active Monitoring",
                "mitigation_action": "Deploy portable flood barriers & de-energize low lines"
            },
            {
                "asset_name": f"{loc_name} Civil Hospital / Community Health Center",
                "asset_type": "Emergency Healthcare",
                "risk_status": "Access Route Threatened" if overall_level in ["CRITICAL", "HIGH"] else "Nominal Operation",
                "mitigation_action": "Prepare standby diesel backup & pre-position ambulance boats"
            },
            {
                "asset_name": f"{loc_name} Municipal Drinking Water Intake Plant",
                "asset_type": "Water & Sanitation",
                "risk_status": "High Turbidity & Silt Clogging" if overall_level in ["CRITICAL", "HIGH"] else "Nominal",
                "mitigation_action": "Activate secondary reservoir bypass valves"
            }
        ]

        # ---------------------------------------------------------------------
        # 6. Priority Response Locations (SDRF / NDRF First Responder Deployment)
        # ---------------------------------------------------------------------
        priority_response_locations = [
            {
                "priority_rank": 1,
                "location_name": f"{loc_name} Riverside Ghats & Low-Lying Wards",
                "target_population": int(population_at_risk * 0.45),
                "primary_threat": "Rapid River Surge & Inundation" if ff_score >= ls_score else "Debris Flow Ingress",
                "recommended_response": "Deploy SDRF inflatable rescue boats & initiate immediate door-to-door evacuation",
                "urgency": "IMMEDIATE (Next 30 mins)" if overall_level == "CRITICAL" else "HIGH WATCH"
            },
            {
                "priority_rank": 2,
                "location_name": f"{loc_name} Hillside Slopes & Cut-Slope Settlement",
                "target_population": int(population_at_risk * 0.35),
                "primary_threat": "Geotechnical Limit Equilibrium Shear Failure",
                "recommended_response": "Evacuate hillside dwellings to designated high-ridge structural shelters",
                "urgency": "IMMEDIATE (Next 45 mins)" if overall_level == "CRITICAL" else "MONITORING"
            },
            {
                "priority_rank": 3,
                "location_name": f"{loc_name} District Arterial Highway & Culvert Choke-Points",
                "target_population": int(population_at_risk * 0.20),
                "primary_threat": "Road Cut-Off & Bridge Scour",
                "recommended_response": "Position heavy earth-moving equipment (JCBs) and emergency traffic diversions",
                "urgency": "STANDBY (Within 2 hours)"
            }
        ]

        # ---------------------------------------------------------------------
        # 7. Complete Structured Impact Intelligence Object
        # ---------------------------------------------------------------------
        return {
            # Metadata & Transparency Labels
            "model_type": "Prototype Demographic & Infrastructure Estimation Model (GIS/OSM Extensible Schema)",
            "label": "Estimated Impact",
            "prototype_notice": "Estimated Impact values are prototype-modeled heuristic indicators for decision-support and emergency planning.",
            "osm_layer_ready": True,
            "bhuvan_geoportal_schema": True,
            
            # Priority Metrics
            "impact_priority_score": impact_priority_score,
            "impact_priority_level": impact_priority_level,
            "priority": impact_priority_level,
            
            # Human Exposure
            "total_sector_population": population,
            "population_at_risk": population_at_risk,
            "exposed_population": population_at_risk,
            "exposure_percentage": round(exposure_ratio * 100, 1),
            "vulnerable_demographics": {
                "elderly_above_60": elderly_count,
                "children_under_12": children_count,
                "persons_requiring_medical_assistance": medical_priority_count
            },
            
            # Facility Counts (Matching example requirement)
            "schools": schools_count,
            "schools_count": schools_count,
            "hospitals": hospitals_count,
            "hospitals_count": hospitals_count,
            "road_segments": road_segments_count,
            "road_segments_count": road_segments_count,
            "bridges": bridges_count,
            "bridges_count": bridges_count,
            
            # Geographic Footprint
            "affected_area_sq_km": area_sq_km,
            "affected_area": f"{area_sq_km} sq km",
            "affected_radius_km": affected_radius_km,
            
            # Specific Named Lists & Structured Assets
            "vulnerable_locations": vulnerable_locations,
            "critical_infrastructure": critical_infrastructure,
            "priority_response_locations": priority_response_locations,
            
            # Logistics & Shelters
            "estimated_shelter_demand": int(population_at_risk * (0.75 if overall_level == "CRITICAL" else 0.40)),
            "evacuation_urgency": "IMMEDIATE (Within 30 mins)" if overall_level == "CRITICAL" else (
                "HIGH (Within 2 hours)" if overall_level == "HIGH" else "STANDBY (Monitor advisories)"
            )
        }
