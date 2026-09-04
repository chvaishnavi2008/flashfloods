from datetime import datetime
from typing import Dict, Any, List, Optional
from models import Location, EnvironmentalData, RiskAssessment, Alert
from services.risk_engine import PralayWatchRiskEngine
from services.ai_service import AiIntelligenceService
from services.alert_service import AlertService
from services.notification_service import NotificationService
from services.impact_engine import ImpactAssessmentEngine
from services.action_engine import ActionRecommendationEngine
from database import db

class SimulationEngine:
    """
    =============================================================================
    PralayWatch Simulated Live Disaster Data Layer & SIH Judging Demo Engine
    =============================================================================
    
    Demonstrates the complete end-to-end disaster intelligence story:
    DATA -> EARLY SIGNAL -> RISK PREDICTION -> IMPACT ASSESSMENT -> EARLY WARNING -> ACTION
    
    Provides:
    1. Realistic 7-Phase SIH Judging Storyline:
       "Extreme Rainfall -> Flash Flood + Landslide Risk" in Uttarakhand (Chamoli / Kedarnath)
       - Phase 1: NORMAL (Data Ingestion Baseline)
       - Phase 2: HEAVY RAINFALL (Early Hydro-Meteorological Signal)
       - Phase 3: EXTREME RAINFALL (Multi-Hazard Risk Prediction)
       - Phase 4: RAPID RIVER RISE (Critical Threshold Breach)
       - Phase 5: EARLY WARNING (CAP-Compliant Emergency Alert Broadcast)
       - Phase 6: IMPACT ASSESSMENT (Demographic & Infrastructure Quantification)
       - Phase 7: ACTION (Hyper-Local Evacuation & Shelter Directives)
    
    2. Real Calculation Guarantee:
       Updates live DB environmental rows and recalculates composite risk,
       impact models, and action trees rather than running fake UI animations.
    """
    
    # Active simulation state tracking
    CURRENT_STATE = {
        "timeline_step": "T0",
        "demo_phase": 1,
        "active_scenario": "baseline",
        "scenario_title": "Nominal Baseline Monitoring",
        "description": "Baseline regional weather telemetry and hydrological monitoring.",
        "last_updated": datetime.utcnow().isoformat(),
        "is_simulation": True,
        "demo_label": "Simulation / Demo Data"
    }

    # 7-Phase SIH Demonstration Scenario
    SIH_DEMO_SCENARIO = {
        "id": "sih_uttarakhand_deluge",
        "title": "Extreme Rainfall → Flash Flood + Landslide Risk",
        "target_location_name": "Chamoli",
        "target_region": "Uttarakhand (Upper Alaknanda Basin)",
        "duration_seconds": 75,
        "phases": {
            1: {
                "phase": 1,
                "code": "PHASE_1_NORMAL",
                "title": "Phase 1 — Normal Baseline",
                "story_stage": "DATA",
                "story_headline": "1. Multi-Sensor Data Ingestion",
                "story_details": "Automated hydro-meteorological sensors report calm weather, nominal river flow, and stable slopes.",
                "environmental": {
                    "rainfall_rate": 1.0,
                    "rainfall_mm": 4.0,
                    "intensity": "Light",
                    "forecast": "Stable",
                    "river_level_m": 1.5,
                    "river_capacity_pct": 16.0,
                    "river_trend": "Normal",
                    "soil_saturation_pct": 22.0,
                    "slope_stability": "Stable"
                },
                "expected_level": "LOW",
                "alert_status": "NONE",
                "hud_summary": "All sensor telemetry within safe operating baseline."
            },
            2: {
                "phase": 2,
                "code": "PHASE_2_HEAVY_RAINFALL",
                "title": "Phase 2 — Heavy Rainfall Onset",
                "story_stage": "EARLY SIGNAL",
                "story_headline": "2. Early Hydro-Meteorological Signal",
                "story_details": "Sustained monsoon showers cause initial runoff accumulation. Moisture infiltration begins saturating upper soil mantle.",
                "environmental": {
                    "rainfall_rate": 24.0,
                    "rainfall_mm": 45.0,
                    "intensity": "Moderate",
                    "forecast": "Rising",
                    "river_level_m": 2.8,
                    "river_capacity_pct": 42.0,
                    "river_trend": "Rising",
                    "soil_saturation_pct": 52.0,
                    "slope_stability": "Moderate Moisture"
                },
                "expected_level": "MODERATE",
                "alert_status": "ADVISORY",
                "hud_summary": "Advisory signal generated. Hydro-sensors detect elevated runoff inflow."
            },
            3: {
                "phase": 3,
                "code": "PHASE_3_EXTREME_RAINFALL",
                "title": "Phase 3 — Extreme Rainfall & Slope Stress",
                "story_stage": "RISK PREDICTION",
                "story_headline": "3. Multi-Hazard Risk Prediction",
                "story_details": "Cloudburst precipitation rate. Soil pore water pressure increases sharply; geotechnical limit equilibrium models calculate high landslide susceptibility.",
                "environmental": {
                    "rainfall_rate": 68.0,
                    "rainfall_mm": 95.0,
                    "intensity": "Heavy",
                    "forecast": "Peaking",
                    "river_level_m": 4.2,
                    "river_capacity_pct": 68.0,
                    "river_trend": "Rising",
                    "soil_saturation_pct": 74.0,
                    "slope_stability": "High Geotechnical Stress"
                },
                "expected_level": "HIGH",
                "alert_status": "WARNING",
                "hud_summary": "High risk warning issued. Flash flood and slope shear thresholds exceeded."
            },
            4: {
                "phase": 4,
                "code": "PHASE_4_RAPID_RIVER_RISE",
                "title": "Phase 4 — Rapid River Rise & Surge",
                "story_stage": "HAZARD ESCALATION",
                "story_headline": "4. Critical Threshold Breach",
                "story_details": "Alaknanda tributary surges past 92% capacity. Rapid river rise threatens low-lying bridges, culverts, and riverside habitations.",
                "environmental": {
                    "rainfall_rate": 110.0,
                    "rainfall_mm": 160.0,
                    "intensity": "Cloudburst / Torrential",
                    "forecast": "Extreme",
                    "river_level_m": 6.4,
                    "river_capacity_pct": 92.0,
                    "river_trend": "Rising Rapidly",
                    "soil_saturation_pct": 91.0,
                    "slope_stability": "Critical / Imminent Slip"
                },
                "expected_level": "CRITICAL",
                "alert_status": "EMERGENCY WARNING",
                "hud_summary": "Critical danger mark breached. Life-safety hazard imminent."
            },
            5: {
                "phase": 5,
                "code": "PHASE_5_EARLY_WARNING",
                "title": "Phase 5 — Automated Early Warning Broadcast",
                "story_stage": "EARLY WARNING",
                "story_headline": "5. Multi-Channel Early Warning Issuance",
                "story_details": "Automated CAP-compliant Red Alert dispatched to citizen HUD, browser push notifications, and simulated SMS broadcasts.",
                "environmental": {
                    "rainfall_rate": 135.0,
                    "rainfall_mm": 195.0,
                    "intensity": "Cloudburst / Torrential",
                    "forecast": "Extreme",
                    "river_level_m": 6.8,
                    "river_capacity_pct": 96.0,
                    "river_trend": "Rising Rapidly",
                    "soil_saturation_pct": 94.0,
                    "slope_stability": "Critical / Imminent Slip"
                },
                "expected_level": "CRITICAL",
                "alert_status": "EMERGENCY WARNING",
                "hud_summary": "Emergency siren activated. Multi-channel broadcast dispatched."
            },
            6: {
                "phase": 6,
                "code": "PHASE_6_IMPACT_ASSESSMENT",
                "title": "Phase 6 — Quantitative Impact Assessment",
                "story_stage": "IMPACT ASSESSMENT",
                "story_headline": "6. Exposure & Critical Asset Quantification",
                "story_details": "Automated raster-to-infrastructure intersection calculates population at risk (~12,400), 4 schools, 1 hospital, 7 road segments, and 2 bridges.",
                "environmental": {
                    "rainfall_rate": 135.0,
                    "rainfall_mm": 195.0,
                    "intensity": "Cloudburst / Torrential",
                    "forecast": "Extreme",
                    "river_level_m": 6.8,
                    "river_capacity_pct": 96.0,
                    "river_trend": "Rising Rapidly",
                    "soil_saturation_pct": 94.0,
                    "slope_stability": "Critical / Imminent Slip"
                },
                "expected_level": "CRITICAL",
                "alert_status": "EMERGENCY WARNING",
                "hud_summary": "Impact priority: VERY HIGH. 12,400 citizens and 7 road links exposed."
            },
            7: {
                "phase": 7,
                "code": "PHASE_7_ACTION_EVACUATION",
                "title": "Phase 7 — Action Recommendations & Evacuation",
                "story_stage": "ACTION",
                "story_headline": "7. Hyper-Local Action Directives & Evacuation Route",
                "story_details": "Delivers context-specific directives: Move to higher ground, avoid river crossings, ascend North-East to Chamoli High-Ground Safe Shelter.",
                "environmental": {
                    "rainfall_rate": 135.0,
                    "rainfall_mm": 195.0,
                    "intensity": "Cloudburst / Torrential",
                    "forecast": "Extreme",
                    "river_level_m": 6.8,
                    "river_capacity_pct": 96.0,
                    "river_trend": "Rising Rapidly",
                    "soil_saturation_pct": 94.0,
                    "slope_stability": "Critical / Imminent Slip"
                },
                "expected_level": "CRITICAL",
                "alert_status": "EMERGENCY WARNING",
                "hud_summary": "What should people do now? Evacuate along high-ground ridge route."
            }
        }
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
            "primary_regions": ["Uttarakhand", "Himachal Pradesh"],
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
        """Returns the current simulation metadata, timeline step, and SIH Demo Scenario."""
        return {
            "status": cls.CURRENT_STATE,
            "sih_demo_scenario": {
                "id": cls.SIH_DEMO_SCENARIO["id"],
                "title": cls.SIH_DEMO_SCENARIO["title"],
                "target_location": cls.SIH_DEMO_SCENARIO["target_location_name"],
                "target_region": cls.SIH_DEMO_SCENARIO["target_region"],
                "phases": [
                    {
                        "phase": v["phase"],
                        "code": v["code"],
                        "title": v["title"],
                        "story_stage": v["story_stage"],
                        "story_headline": v["story_headline"],
                        "expected_level": v["expected_level"]
                    } for v in cls.SIH_DEMO_SCENARIO["phases"].values()
                ]
            },
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
    def apply_sih_demo_phase(cls, phase_num: int, location_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Executes a discrete phase of the SIH Judging Demo Scenario:
        Updates DB telemetry, executes risk engine, generates impact & action data.
        """
        phase_num = max(1, min(7, int(phase_num)))
        phase_data = cls.SIH_DEMO_SCENARIO["phases"][phase_num]
        env_conf = phase_data["environmental"]

        cls.CURRENT_STATE["demo_phase"] = phase_num
        cls.CURRENT_STATE["timeline_step"] = "T0" if phase_num == 1 else ("T+1" if phase_num == 2 else "T+2")
        cls.CURRENT_STATE["active_scenario"] = "sih_uttarakhand_deluge"
        cls.CURRENT_STATE["scenario_title"] = f"{cls.SIH_DEMO_SCENARIO['title']} ({phase_data['title']})"
        cls.CURRENT_STATE["description"] = phase_data["story_details"]
        cls.CURRENT_STATE["last_updated"] = datetime.utcnow().isoformat()

        # Find target location in Uttarakhand (Chamoli / Kedarnath / or specified)
        target_loc = None
        if location_id:
            target_loc = Location.query.get(location_id)
        if not target_loc:
            target_loc = Location.query.filter(Location.name.ilike('%Chamoli%')).first() or Location.query.first()

        # Update target location environmental telemetry
        env = EnvironmentalData.query.filter_by(location_id=target_loc.id).first()
        if not env:
            env = EnvironmentalData(location_id=target_loc.id)
            db.session.add(env)

        env.rainfall_rate = env_conf["rainfall_rate"]
        env.rainfall_mm = env_conf["rainfall_mm"]
        env.rainfall_intensity = env_conf["intensity"]
        env.rainfall_forecast_trend = env_conf["forecast"]
        env.river_level_m = env_conf["river_level_m"]
        env.river_capacity_pct = env_conf["river_capacity_pct"]
        env.river_trend = env_conf["river_trend"]
        env.soil_saturation_pct = env_conf["soil_saturation_pct"]
        env.slope_stability = env_conf["slope_stability"]
        env.updated_at = datetime.utcnow()

        # Recalculate Risk Engine
        risk_calc = PralayWatchRiskEngine.evaluate_composite_risk(env, target_loc)
        ai_exp = AiIntelligenceService.generate_explanation(target_loc.name, env, risk_calc)

        # Update Risk Assessment row
        assessment = RiskAssessment.query.filter_by(location_id=target_loc.id).first()
        if not assessment:
            assessment = RiskAssessment(location_id=target_loc.id)
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

        # Phase 5+ : Trigger / Ensure Alert creation
        active_alert = None
        if phase_num >= 5:
            active_alert = AlertService.create_alert(
                location_id=target_loc.id,
                hazard_type="Flash Flood",
                severity="CRITICAL",
                title=f"🚨 CRITICAL FLASH FLOOD & LANDSLIDE WARNING [{target_loc.name}]",
                message=f"[DEMO SIMULATION] Extreme rainfall ({env.rainfall_rate} mm/hr) + surging river ({env.river_capacity_pct}% capacity) in {target_loc.name}. Immediate evacuation to high-ground shelters required.",
                radius_km=25.0,
                lead_time_min=30,
                issued_by="State Disaster Management Authority (SDMA / SEOC)"
            )
        elif phase_num >= 2 and phase_num < 5:
            active_alert = AlertService.auto_evaluate_and_generate_alert(
                location=target_loc,
                overall_score=risk_calc["overall_score"],
                overall_level=risk_calc["overall_level"],
                hazard_data=risk_calc,
                env_data=env
            )
        elif phase_num == 1:
            # Resolve existing alerts for clean reset
            existing_alerts = Alert.query.filter_by(location_id=target_loc.id, status="ACTIVE").all()
            for al in existing_alerts:
                al.status = "RESOLVED"
            db.session.commit()

        return {
            "success": True,
            "phase": phase_num,
            "phase_metadata": phase_data,
            "location_id": target_loc.id,
            "location_name": target_loc.name,
            "risk_score": risk_calc["overall_score"],
            "risk_level": risk_calc["overall_level"],
            "environmental": env.to_dict(),
            "impact_assessment": risk_calc.get("impact_assessment", {}),
            "action_recommendations": risk_calc.get("action_recommendations", {}),
            "alert": active_alert.to_dict() if active_alert else None,
            "demo_indicator": "Simulation / Demo Data"
        }

    @classmethod
    def apply_timeline_step(cls, step: str, location_id: Optional[int] = None) -> Dict[str, Any]:
        """Advances or sets the simulation timeline step (T0 -> T+1 -> T+2)."""
        step = step.upper() if step else "T0"
        config = cls.TIMELINE_CONFIGS.get(step, cls.TIMELINE_CONFIGS["T0"])
        
        cls.CURRENT_STATE["timeline_step"] = step
        cls.CURRENT_STATE["active_scenario"] = f"timeline_{step.lower()}"
        cls.CURRENT_STATE["scenario_title"] = config["title"]
        cls.CURRENT_STATE["description"] = config["description"]
        cls.CURRENT_STATE["last_updated"] = datetime.utcnow().isoformat()
        
        locations = Location.query.all()
        updated_count = 0
        primary_alert = None
        
        for loc in locations:
            is_primary = (location_id and loc.id == location_id) or (not location_id and loc.id == 1)
            
            env = EnvironmentalData.query.filter_by(location_id=loc.id).first()
            if not env:
                env = EnvironmentalData(location_id=loc.id)
                db.session.add(env)
                
            env.rainfall_rate = config["rainfall_rate"] if is_primary else round(config["rainfall_rate"] * 0.7, 1)
            env.rainfall_mm = config["rainfall_mm"] if is_primary else round(config["rainfall_mm"] * 0.6, 1)
            env.rainfall_intensity = config["intensity"]
            env.rainfall_forecast_trend = config["forecast"]
            env.river_level_m = config["river_level_m"] if is_primary else round(config["river_level_m"] * 0.8, 1)
            env.river_capacity_pct = config["river_capacity_pct"] if is_primary else round(config["river_capacity_pct"] * 0.75, 1)
            env.river_trend = config["river_trend"]
            env.soil_saturation_pct = config["soil_saturation_pct"]
            env.slope_stability = config["slope_stability"]
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
            
            updated_count += 1
            
        db.session.commit()
        
        target_loc = Location.query.get(location_id) if location_id else locations[0]
        if step == "T+2":
            primary_alert = AlertService.create_alert(
                location_id=target_loc.id,
                hazard_type="Flash Flood",
                severity="CRITICAL",
                title=f"LIVE SIMULATION: Critical Flash Flood Warning [{target_loc.name}]",
                message=f"[DEMO SIMULATION] Torrential cloudburst precipitation detected in {target_loc.name}. Immediate high-ground evacuation ordered.",
                radius_km=25.0,
                lead_time_min=25,
                issued_by="AapdaSetu Real-Time AI Simulation Core"
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
        """Applies a reproducible, realistic multi-hazard scenario across specified target locations."""
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
                issued_by="AapdaSetu Real-Time AI Simulation Core"
            )

        return {
            "success": True,
            "scenario": scenario_id,
            "name": scenario["name"],
            "demo_label": "Simulation / Demo Data",
            "alert": created_alert.to_dict() if created_alert else None
        }
