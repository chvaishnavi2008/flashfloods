from typing import Dict, Any, List

class ImpactAssessmentEngine:
    """
    Stage 4: Impact & Exposure Assessment Engine.
    Translates predicted multi-hazard physical intensities into real-world human,
    infrastructural, and socioeconomic impact intelligence.
    """
    
    @classmethod
    def assess_impact(cls, overall_score: float, overall_level: str, location: Any, hazard_results: Dict[str, Any]) -> Dict[str, Any]:
        population = int(getattr(location, 'population', 50000) or 50000)
        loc_name = getattr(location, 'name', 'Monitored Sector')
        terrain = getattr(location, 'terrain_type', 'Valley Basin')
        
        # 1. Human Exposure Ratio based on risk severity
        if overall_level == "CRITICAL":
            exposure_ratio = 0.85
            severity_index = "EXTREME VULNERABILITY"
        elif overall_level == "HIGH":
            exposure_ratio = 0.45
            severity_index = "HIGH VULNERABILITY"
        elif overall_level == "MODERATE":
            exposure_ratio = 0.20
            severity_index = "MODERATE EXPOSURE"
        else:
            exposure_ratio = 0.05
            severity_index = "LOW RISK EXPOSURE"
            
        exposed_population = int(population * exposure_ratio)
        
        # Vulnerable subgroups breakdown (demographic models)
        elderly_count = int(exposed_population * 0.14)
        children_count = int(exposed_population * 0.18)
        medical_priority_count = int(exposed_population * 0.06)
        
        # 2. Critical Infrastructure at Risk
        infrastructure: List[Dict[str, str]] = []
        
        if overall_level in ["CRITICAL", "HIGH"]:
            infrastructure.append({
                "type": "Transportation Corridor",
                "name": f"{loc_name} Riverbank Bypass & Bridges",
                "risk_status": "High Inundation & Debris Risk"
            })
            infrastructure.append({
                "type": "Power & Grid",
                "name": "Sub-district 33kV Electrical Substation",
                "risk_status": "Waterlogging Threat"
            })
            infrastructure.append({
                "type": "Healthcare",
                "name": f"{loc_name} Civil Dispensary / Primary Health Center",
                "risk_status": "Access Route Threatened"
            })
            infrastructure.append({
                "type": "Water Supply",
                "name": "Municipal Water Intake Plant",
                "risk_status": "High Turbidity & Silt Clogging"
            })
        elif overall_level == "MODERATE":
            infrastructure.append({
                "type": "Transportation",
                "name": "Low-lying Culverts & Unpaved Slopes",
                "risk_status": "Advisory Speed Limits"
            })
            infrastructure.append({
                "type": "Drainage",
                "name": "Stormwater Drainage Canals",
                "risk_status": "Capacity Monitoring"
            })
        else:
            infrastructure.append({
                "type": "All Utilities",
                "name": "Civic Infrastructure & Lifelines",
                "risk_status": "Nominal Operational State"
            })

        # 3. Socioeconomic & Agricultural Damage Estimate
        if overall_level == "CRITICAL":
            economic_loss_risk = "Severe (Major structural & crop inundation damage expected)"
            shelter_demand_pct = 75
        elif overall_level == "HIGH":
            economic_loss_risk = "Elevated (Basement water ingress, local road washouts, slope erosion)"
            shelter_demand_pct = 40
        elif overall_level == "MODERATE":
            economic_loss_risk = "Localized (Minor runoff disruptions, farm perimeter waterlogging)"
            shelter_demand_pct = 15
        else:
            economic_loss_risk = "Minimal (No significant structural damage forecast)"
            shelter_demand_pct = 0

        required_shelter_capacity = int(exposed_population * (shelter_demand_pct / 100.0))

        return {
            "severity_index": severity_index,
            "total_sector_population": population,
            "exposed_population": exposed_population,
            "exposure_percentage": round(exposure_ratio * 100, 1),
            "vulnerable_demographics": {
                "elderly_above_60": elderly_count,
                "children_under_12": children_count,
                "persons_requiring_medical_assistance": medical_priority_count
            },
            "infrastructure_at_risk": infrastructure,
            "economic_damage_risk": economic_loss_risk,
            "estimated_shelter_demand": required_shelter_capacity,
            "evacuation_urgency": "IMMEDIATE (Within 30 mins)" if overall_level == "CRITICAL" else (
                "HIGH (Within 2 hours)" if overall_level == "HIGH" else "STANDBY (Monitor advisories)"
            )
        }
