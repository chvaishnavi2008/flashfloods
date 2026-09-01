from datetime import datetime
from typing import Dict, Any, List, Optional
from models import Location, EnvironmentalData, RiskAssessment, Alert
from services.risk_engine import PralayWatchRiskEngine
from services.ai_service import AiIntelligenceService
from services.alert_service import AlertService
from services.notification_service import NotificationService
from database import db

class SimulationEngine:
    """
    =============================================================================
    PralayWatch Simulated Live Disaster Data Layer (SIH Prototype Demo)
    =============================================================================
    
    Provides deterministic, reproducible environmental simulation across:
    - Uttarakhand, Himachal Pradesh, Sikkim, Assam, Arunachal Pradesh,
      Meghalaya, Jammu & Kashmir, Kerala, West Bengal, Bihar, and Nepal Border.
    
    Supports:
    1. Time-series Progressive Evolution (T0 -> T+1 -> T+2):
       - T0:   Rainfall 35-50 mm,  Risk = MODERATE (26-50)
       - T+1:  Rainfall 75-95 mm,  Risk = HIGH (51-75)
       - T+2:  Rainfall 125-165 mm, River Rising Rapidly, Risk = CRITICAL (76-100)
    
    2. Reproducible Hazard Scenarios:
       - 'flash_flood_himalayas': Cloudburst surge in Chamoli / Kedarnath / Kullu
       - 'landslide_western_ghats': Geotechnical slope failure in Wayanad / Joshimath
       - 'extreme_rainfall_meghalaya': Record deluge in Cherrapunji / Mawsynram
       - 'riverine_brahmaputra_kosi': Overflowing basin in Guwahati / Supaul
       - 'glof_teesta_surge': Cryosphere moraine breach in Chungthang / Sikkim
       - 'reset_nominal': Baseline quiet conditions across all regions
    """
    
    # Active simulation state tracking
    CURRENT_STATE = {
        "timeline_step": "T0",
        "active_scenario": "baseline",
        "scenario_title": "Nominal Baseline Monitoring",
        "description": "Baseline regional weather telemetry and hydrological monitoring.",
        "last_updated": datetime.utcnow().isoformat(),
        "is_simulation": True,
        "demo_label": "Simulation / Demo Data"
    }

    TIMELINE_CONFIGS = {
        "T0": {
            "title": "T0 — Baseline / Early Watch",
            "description": "Light-to-moderate seasonal rainfall, river levels at 30-45% capacity, stable slopes.",
            "rainfall_rate": 8.0,
            "rainfall_mm": 35.0,
            "intensity": "Moderate",
            "forecast": "Rising",
            "river_level_m": 2.6,
            "river_capacity_pct": 42.0,
            "river_trend": "Normal",
            "soil_saturation_pct": 48.0,
            "slope_stability": "Stable"
        },
        "T+1": {
            "title": "T+1 — Orange Alert / Severe Escalation",
            "description": "Sustained heavy downpours, river levels surging to 65-75% capacity, saturated slopes.",
            "rainfall_rate": 45.0,
            "rainfall_mm": 88.0,
            "intensity": "Heavy",
            "forecast": "Rising Rapidly",
            "river_level_m": 4.5,
            "river_capacity_pct": 72.0,
            "river_trend": "Rising",
            "soil_saturation_pct": 78.0,
            "slope_stability": "Moderate Risk"
        },
        "T+2": {
            "title": "T+2 — Red Alert / Critical Cloudburst & Surge",
            "description": "Torrential cloudburst precipitation, rivers exceeding 90% capacity, imminent landslide & flash flood.",
            "rainfall_rate": 115.0,
            "rainfall_mm": 148.0,
            "intensity": "Cloudburst / Torrential",
            "forecast": "Peaking",
            "river_level_m": 6.8,
            "river_capacity_pct": 94.0,
            "river_trend": "Rising Rapidly",
            "soil_saturation_pct": 93.0,
            "slope_stability": "Critical / Imminent Slip"
        }
    }

    SCENARIOS = {
        "flash_flood_himalayas": {
            "name": "Himalayan Cloudburst & Flash Flood Surge",
            "primary_regions": ["Uttarakhand", "Himachal Pradesh", "Bagmati Province", "Gandaki Province"],
            "target_locations": ["Chamoli", "Kedarnath", "Kullu - Manali", "Uttarkashi", "Melamchi"],
            "hazard": "Flash Flood",
            "rainfall_rate": 110.0,
            "rainfall_mm": 140.0,
            "river_capacity_pct": 92.0,
            "river_level_m": 6.4,
            "river_trend": "Rising Rapidly",
            "soil_saturation_pct": 82.0,
            "severity": "CRITICAL"
        },
        "landslide_western_ghats": {
            "name": "Western Ghats & Himalayan Geotechnical Slope Failure",
            "primary_regions": ["Kerala", "Uttarakhand", "Jammu & Kashmir", "West Bengal"],
            "target_locations": ["Wayanad (Meppadi)", "Idukki", "Joshimath", "Ramban (NH-44)", "Darjeeling - Kalimpong"],
            "hazard": "Landslide",
            "rainfall_rate": 72.0,
            "rainfall_mm": 115.0,
            "river_capacity_pct": 68.0,
            "river_level_m": 4.2,
            "river_trend": "Rising",
            "soil_saturation_pct": 96.0,
            "severity": "CRITICAL"
        },
        "extreme_rainfall_meghalaya": {
            "name": "Meghalaya Extreme Monsoon Cloudburst Deluge",
            "primary_regions": ["Meghalaya", "Assam"],
            "target_locations": ["Cherrapunji (Sohra)", "Mawsynram", "Guwahati (Brahmaputra)"],
            "hazard": "Extreme Rainfall",
            "rainfall_rate": 145.0,
            "rainfall_mm": 210.0,
            "river_capacity_pct": 88.0,
            "river_level_m": 5.9,
            "river_trend": "Rising Rapidly",
            "soil_saturation_pct": 89.0,
            "severity": "CRITICAL"
        },
        "riverine_brahmaputra_kosi": {
            "name": "Brahmaputra & Kosi River Basin Overbank Inundation",
            "primary_regions": ["Assam", "Bihar", "West Bengal"],
            "target_locations": ["Guwahati (Brahmaputra)", "Silchar", "Kaziranga", "Supaul (Kosi)", "Patna (Ganges)"],
            "hazard": "Riverine Flood",
            "rainfall_rate": 48.0,
            "rainfall_mm": 165.0,
            "river_capacity_pct": 96.0,
            "river_level_m": 7.4,
            "river_trend": "Overflowing / Critical Breach",
            "soil_saturation_pct": 84.0,
            "severity": "CRITICAL"
        },
        "glof_teesta_surge": {
            "name": "Sikkim Teesta South Lhonak GLOF Dam Breach",
            "primary_regions": ["Sikkim", "West Bengal"],
            "target_locations": ["Chungthang", "Gangtok", "Jalpaiguri"],
            "hazard": "GLOF (Glacial Lake Breach)",
            "rainfall_rate": 85.0,
            "rainfall_mm": 95.0,
            "river_capacity_pct": 98.0,
            "river_level_m": 7.8,
            "river_trend": "Rising Rapidly",
            "soil_saturation_pct": 76.0,
            "severity": "CRITICAL"
        },
        "reset_nominal": {
            "name": "Nominal Baseline Normal Conditions",
            "primary_regions": ["All"],
            "target_locations": ["All"],
            "hazard": "Normal",
            "rainfall_rate": 4.0,
            "rainfall_mm": 20.0,
            "river_capacity_pct": 30.0,
            "river_level_m": 1.9,
            "river_trend": "Normal",
            "soil_saturation_pct": 40.0,
            "severity": "LOW"
        }
    }

    @classmethod
    def get_simulation_status(cls) -> Dict[str, Any]:
        """Returns the current simulation metadata and available scenarios."""
        return {
            "status": cls.CURRENT_STATE,
            "timeline_steps": [
                {"step": "T0", "label": "T0 — Watch (Moderate)", "rainfall_approx": "35 mm", "risk_approx": "42 MODERATE"},
                {"step": "T+1", "label": "T+1 — Warning (High)", "rainfall_approx": "88 mm", "risk_approx": "65 HIGH"},
                {"step": "T+2", "label": "T+2 — Red Alert (Critical)", "rainfall_approx": "148 mm", "risk_approx": "88 CRITICAL"}
            ],
            "scenarios": [
                {"id": k, "name": v["name"], "hazard": v["hazard"], "regions": v["primary_regions"]}
                for k, v in cls.SCENARIOS.items()
            ]
        }

    @classmethod
    def apply_timeline_step(cls, step: str, location_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Applies progressive timeline step (T0, T+1, or T+2) to environmental telemetry.
        """
        if step not in cls.TIMELINE_CONFIGS:
            step = "T0"
            
        config = cls.TIMELINE_CONFIGS[step]
        
        cls.CURRENT_STATE["timeline_step"] = step
        cls.CURRENT_STATE["scenario_title"] = config["title"]
        cls.CURRENT_STATE["description"] = config["description"]
        cls.CURRENT_STATE["last_updated"] = datetime.utcnow().isoformat()
        
        # Apply to target locations
        if location_id:
            locations = Location.query.filter_by(id=location_id).all()
        else:
            locations = Location.query.all()
            
        updated_count = 0
        primary_alert = None
        
        for loc in locations:
            env = EnvironmentalData.query.filter_by(location_id=loc.id).first()
            if not env:
                env = EnvironmentalData(location_id=loc.id)
                db.session.add(env)
                
            # Scale slightly per terrain type to create organic, realistic variance
            terrain_factor = 1.15 if ("Mountain" in loc.terrain_type or "Slope" in loc.terrain_type) else 1.0
            
            env.rainfall_rate = round(config["rainfall_rate"] * terrain_factor, 1)
            env.rainfall_mm = round(config["rainfall_mm"] * terrain_factor, 1)
            env.rainfall_intensity = config["intensity"]
            env.rainfall_forecast_trend = config["forecast"]
            env.river_level_m = config["river_level_m"]
            env.river_capacity_pct = min(98.0, config["river_capacity_pct"] * terrain_factor)
            env.river_trend = config["river_trend"]
            env.soil_saturation_pct = min(98.0, config["soil_saturation_pct"] * terrain_factor)
            env.slope_stability = config["slope_stability"]
            env.updated_at = datetime.utcnow()
            
            # Recalculate risk using modular PralayWatch Risk Intelligence Engine
            risk_calc = PralayWatchRiskEngine.evaluate_composite_risk(env, loc)
            ai_exp = AiIntelligenceService.generate_explanation(loc.name, env, risk_calc)
            
            assessment = RiskAssessment.query.filter_by(location_id=loc.id).first()
            if not assessment:
                assessment = RiskAssessment(location_id=loc.id)
                db.session.add(assessment)
                
            assessment.overall_score = risk_calc["overall_score"]
            assessment.overall_level = risk_calc["overall_level"]
            assessment.flash_flood_score = risk_calc["flash_flood_score"]
            assessment.flash_flood_level = risk_calc["flash_flood_level"]
            assessment.flood_score = risk_calc["flood_score"]
            assessment.flood_level = risk_calc["flood_level"]
            assessment.landslide_score = risk_calc["landslide_score"]
            assessment.landslide_level = risk_calc["landslide_level"]
            assessment.heavy_rainfall_score = risk_calc["heavy_rainfall_score"]
            assessment.heavy_rainfall_level = risk_calc["heavy_rainfall_level"]
            assessment.lead_time_minutes = risk_calc["lead_time_minutes"]
            assessment.contributing_factors = risk_calc["contributing_factors"]
            assessment.recommended_action = risk_calc["recommended_action"]
            assessment.ai_explanation = ai_exp
            assessment.calculated_at = datetime.utcnow()
            
            updated_count += 1

        db.session.commit()
        
        # Broadcast alert on T+2
        if step == "T+2" and locations:
            primary_loc = locations[0]
            primary_alert = AlertService.create_alert(
                location_id=primary_loc.id,
                hazard_type="Multi-Hazard Flash Flood & Landslide",
                severity="CRITICAL",
                title=f"LIVE SIMULATION: Critical Escalation T+2 in {primary_loc.name}",
                message=f"[DEMO SIMULATION] Rainfall 148mm and river surge reaching critical threshold in {primary_loc.name}. Evacuate immediately.",
                radius_km=25.0,
                lead_time_min=25,
                issued_by="PralayWatch Real-Time AI Simulation Core"
            )

        return {
            "success": True,
            "timeline_step": step,
            "config": config,
            "updated_locations_count": updated_count,
            "demo_indicator": "Simulation / Demo Data",
            "alert": primary_alert.to_dict() if primary_alert else None
        }

    @classmethod
    def apply_scenario(cls, scenario_id: str) -> Dict[str, Any]:
        """
        Applies a reproducible, realistic multi-hazard scenario across specified target locations.
        """
        scenario = cls.SCENARIOS.get(scenario_id, cls.SCENARIOS["flash_flood_himalayas"])
        cls.CURRENT_STATE["active_scenario"] = scenario_id
        cls.CURRENT_STATE["scenario_title"] = scenario["name"]
        cls.CURRENT_STATE["description"] = f"Simulating {scenario['hazard']} across target sectors."
        cls.CURRENT_STATE["last_updated"] = datetime.utcnow().isoformat()
        
        locations = Location.query.all()
        target_names = scenario.get("target_locations", [])
        
        created_alert = None
        
        for loc in locations:
            env = EnvironmentalData.query.filter_by(location_id=loc.id).first()
            if not env:
                env = EnvironmentalData(location_id=loc.id)
                db.session.add(env)
                
            is_target = ("All" in target_names) or (loc.name in target_names) or any(t in loc.name for t in target_names)
            
            if scenario_id == "reset_nominal":
                env.rainfall_rate = 3.5
                env.rainfall_mm = 18.0
                env.rainfall_intensity = "Light"
                env.rainfall_forecast_trend = "Stable"
                env.river_level_m = 1.8
                env.river_capacity_pct = 28.0
                env.river_trend = "Normal"
                env.soil_saturation_pct = 38.0
                env.slope_stability = "Stable"
            elif is_target:
                env.rainfall_rate = scenario["rainfall_rate"]
                env.rainfall_mm = scenario["rainfall_mm"]
                env.rainfall_intensity = "Cloudburst / Torrential" if scenario["rainfall_rate"] >= 80 else "Heavy"
                env.rainfall_forecast_trend = "Peaking"
                env.river_level_m = scenario["river_level_m"]
                env.river_capacity_pct = scenario["river_capacity_pct"]
                env.river_trend = scenario["river_trend"]
                env.soil_saturation_pct = scenario["soil_saturation_pct"]
                env.slope_stability = "Critical / Imminent Slip"
            else:
                # Adjacent buffer sector moderate elevation
                env.rainfall_rate = 22.0
                env.rainfall_mm = 52.0
                env.rainfall_intensity = "Moderate"
                env.rainfall_forecast_trend = "Rising"
                env.river_level_m = 3.1
                env.river_capacity_pct = 50.0
                env.river_trend = "Rising"
                env.soil_saturation_pct = 60.0
                env.slope_stability = "Moderate Risk"
                
            env.updated_at = datetime.utcnow()
            
            risk_calc = PralayWatchRiskEngine.evaluate_composite_risk(env, loc)
            ai_exp = AiIntelligenceService.generate_explanation(loc.name, env, risk_calc)
            
            assessment = RiskAssessment.query.filter_by(location_id=loc.id).first()
            if not assessment:
                assessment = RiskAssessment(location_id=loc.id)
                db.session.add(assessment)
                
            assessment.overall_score = risk_calc["overall_score"]
            assessment.overall_level = risk_calc["overall_level"]
            assessment.flash_flood_score = risk_calc["flash_flood_score"]
            assessment.flash_flood_level = risk_calc["flash_flood_level"]
            assessment.flood_score = risk_calc["flood_score"]
            assessment.flood_level = risk_calc["flood_level"]
            assessment.landslide_score = risk_calc["landslide_score"]
            assessment.landslide_level = risk_calc["landslide_level"]
            assessment.heavy_rainfall_score = risk_calc["heavy_rainfall_score"]
            assessment.heavy_rainfall_level = risk_calc["heavy_rainfall_level"]
            assessment.lead_time_minutes = risk_calc["lead_time_minutes"]
            assessment.contributing_factors = risk_calc["contributing_factors"]
            assessment.recommended_action = risk_calc["recommended_action"]
            assessment.ai_explanation = ai_exp
            assessment.calculated_at = datetime.utcnow()

        db.session.commit()
        
        # Create broadcast alert for target region
        if scenario_id != "reset_nominal":
            target_loc = Location.query.filter(Location.name.in_(target_names)).first() or locations[0]
            created_alert = AlertService.create_alert(
                location_id=target_loc.id,
                hazard_type=scenario["hazard"],
                severity="CRITICAL",
                title=f"LIVE SIMULATION: {scenario['name']} [{target_loc.name}]",
                message=f"[DEMO SIMULATION] Severe {scenario['hazard']} escalation active in {target_loc.name}, {target_loc.state}. Life-safety measures activated.",
                radius_km=30.0,
                lead_time_min=30,
                issued_by="PralayWatch Real-Time AI Simulation Core"
            )

        return {
            "success": True,
            "scenario": scenario_id,
            "name": scenario["name"],
            "demo_label": "Simulation / Demo Data",
            "alert": created_alert.to_dict() if created_alert else None
        }
