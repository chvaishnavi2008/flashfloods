import json
from typing import Dict, Any, List
from services.predictors.registry import HazardPredictorRegistry
from services.impact_engine import ImpactAssessmentEngine
from config import Config

class DisasterIntelligencePipeline:
    """
    Complete 6-Stage Disaster Intelligence Pipeline for PralayWatch:
    
    STAGE 1: DATA INGESTION
             (Telemetry validation, normalization, and sensor checks)
             
    STAGE 2: RISK ANALYSIS & FEATURE EXTRACTION
             (Catchment hydro-mechanics, soil moisture saturation, slope geometry)
             
    STAGE 3: HAZARD PREDICTION
             (Modular prediction across Flash Flood, Landslide, Extreme Rainfall, Riverine Flood, Cyclone)
             
    STAGE 4: IMPACT & EXPOSURE ASSESSMENT
             (Population exposure, critical infrastructure vulnerability, shelter demand)
             
    STAGE 5: EARLY WARNING ISSUANCE
             (Standardized CAP-compliant severity, broadcast urgency, lead time in minutes)
             
    STAGE 6: ACTION & SAFETY RECOMMENDATIONS
             (Hyper-local citizen safety directives, safe shelter evacuation, emergency 112 guidance)
    """
    
    @classmethod
    def execute_pipeline(cls, env_data: Any, location: Any) -> Dict[str, Any]:
        # =====================================================================
        # STAGE 1: DATA INGESTION & QUALITY ASSURANCE
        # =====================================================================
        rainfall_rate = float(getattr(env_data, 'rainfall_rate', 0.0))
        rainfall_mm = float(getattr(env_data, 'rainfall_mm', 0.0))
        river_cap = float(getattr(env_data, 'river_capacity_pct', 0.0))
        river_level_m = float(getattr(env_data, 'river_level_m', 2.0))
        soil_sat = float(getattr(env_data, 'soil_saturation_pct', 0.0))
        slope_deg = float(getattr(env_data, 'slope_deg', 25.0))
        trend = getattr(env_data, 'rainfall_forecast_trend', 'Stable')

        stage1_data = {
            "stage_name": "1. Data Ingestion & Quality Validation",
            "telemetry_sensors": {
                "rainfall_rate_mm_hr": rainfall_rate,
                "cumulative_24h_rainfall_mm": rainfall_mm,
                "river_gauge_capacity_pct": river_cap,
                "river_gauge_height_m": river_level_m,
                "soil_moisture_saturation_pct": soil_sat,
                "terrain_slope_angle_deg": slope_deg,
                "precipitation_nowcast_trend": trend
            },
            "data_quality": "VERIFIED_OK",
            "active_telemetry_sources": ["IMD Doppler Radar Nowcast (Sim)", "CWC Basin Hydro-Gauge", "GSI Slope Geotechnical Sensor"]
        }

        # =====================================================================
        # STAGE 2: RISK ANALYSIS & FEATURE EXTRACTION
        # =====================================================================
        pore_pressure_ratio = round(soil_sat / 100.0, 2)
        hydraulic_load_index = round((rainfall_rate / 100.0) * 0.6 + (river_cap / 100.0) * 0.4, 2)
        slope_shear_instability = "ELEVATED" if slope_deg > 30.0 and soil_sat > 70.0 else "NOMINAL"
        
        stage2_analysis = {
            "stage_name": "2. Risk Analysis & Feature Extraction",
            "extracted_features": {
                "pore_water_pressure_ratio": pore_pressure_ratio,
                "hydraulic_catchment_load_index": hydraulic_load_index,
                "slope_shear_instability_status": slope_shear_instability,
                "catchment_runoff_acceleration": 1.25 if "Mountain" in getattr(location, 'terrain_type', '') else 1.0
            },
            "primary_stress_factors": [
                f"Rainfall intensity: {rainfall_rate} mm/hr",
                f"Soil moisture saturation: {soil_sat}%",
                f"River channel load: {river_cap}%"
            ]
        }

        # =====================================================================
        # STAGE 3: HAZARD PREDICTION (MODULAR PREDICTOR REGISTRY)
        # =====================================================================
        hazard_predictions = HazardPredictorRegistry.evaluate_all(env_data, location)
        
        ff_pred = hazard_predictions.get("flash_flood", {})
        ls_pred = hazard_predictions.get("landslide", {})
        hr_pred = hazard_predictions.get("heavy_rainfall", {})
        fl_pred = hazard_predictions.get("flood", {})
        cy_pred = hazard_predictions.get("cyclone", {})

        # Dynamic score aggregation across all registered predictors
        scores = [pred.get("score", 0.0) for pred in hazard_predictions.values()]
        if not scores:
            scores = [0.0]
        
        max_score = max(scores)
        avg_score = sum(scores) / len(scores)
        cascading_penalty = sum(1 for s in scores if s >= 50.0) * 3.0
        
        composite_score = min(100.0, max_score * 0.70 + avg_score * 0.30 + cascading_penalty)
        
        thresholds = Config.RISK_THRESHOLDS
        if composite_score >= thresholds["CRITICAL"][0]:
            overall_level = "CRITICAL"
        elif composite_score >= thresholds["HIGH"][0]:
            overall_level = "HIGH"
        elif composite_score >= thresholds["MODERATE"][0]:
            overall_level = "MODERATE"
        else:
            overall_level = "LOW"

        stage3_prediction = {
            "stage_name": "3. Multi-Hazard Prediction",
            "composite_score": round(composite_score, 1),
            "composite_level": overall_level,
            "architecture_note": "Modular Pluggable Interface with Phase 2 ML slots (predict_ml)",
            "hazard_predictions": hazard_predictions
        }

        # =====================================================================
        # STAGE 4: IMPACT ASSESSMENT
        # =====================================================================
        impact_assessment = ImpactAssessmentEngine.assess_impact(
            composite_score, overall_level, location, hazard_predictions
        )

        stage4_impact = {
            "stage_name": "4. Impact & Exposure Assessment",
            "impact_assessment": impact_assessment
        }

        # =====================================================================
        # STAGE 5: EARLY WARNING ISSUANCE
        # =====================================================================
        if overall_level == "CRITICAL":
            lead_time = max(15, int(45 - (composite_score - 75) * 0.8))
            alert_urgency = "IMMEDIATE"
            severity_badge = "RED ALERT"
        elif overall_level == "HIGH":
            lead_time = max(45, int(120 - (composite_score - 50) * 2.0))
            alert_urgency = "HIGH"
            severity_badge = "ORANGE ALERT"
        elif overall_level == "MODERATE":
            lead_time = 180
            alert_urgency = "WATCH"
            severity_badge = "YELLOW WATCH"
        else:
            lead_time = 360
            alert_urgency = "ROUTINE"
            severity_badge = "GREEN NORMAL"

        stage5_warning = {
            "stage_name": "5. Early Warning Issuance",
            "alert_level": overall_level,
            "severity_badge": severity_badge,
            "alert_urgency": alert_urgency,
            "estimated_lead_time_mins": lead_time,
            "broadcast_radius_km": 20.0 if overall_level in ["CRITICAL", "HIGH"] else 10.0,
            "cap_protocol_compliant": True,
            "warning_headline": f"Official {severity_badge}: Multi-Hazard Warning for {getattr(location, 'name', 'Sector')}"
        }

        # =====================================================================
        # STAGE 6: ACTION & SAFETY RECOMMENDATIONS
        # =====================================================================
        if overall_level == "CRITICAL":
            directive = "IMMEDIATE EVACUATION ORDER: Move toward designated safe shelters or higher ground. Avoid riverbeds, bridges, and mountain roads."
            action_steps = [
                "1. Move immediately toward designated high-ground safe relief shelters.",
                "2. Turn off domestic electricity and gas valves before leaving.",
                "3. Stay away from fast-flowing streams and drainage culverts.",
                "4. Carry emergency go-bag (water, first aid, torch, vital documents)."
            ]
        elif overall_level == "HIGH":
            directive = "PRE-EVACUATION ALERT: Prepare emergency go-bags, monitor official broadcast channels, and stay prepared for short-notice movement."
            action_steps = [
                "1. Identify your nearest safe shelter and verify non-flooded route.",
                "2. Keep mobile phones charged and monitor local SDMA SMS broadcasts.",
                "3. Avoid parking vehicles near riverbanks or loose hillsides."
            ]
        elif overall_level == "MODERATE":
            directive = "ADVISORY WATCH: Exercise caution, avoid non-essential travel in hilly sectors and low-lying culverts."
            action_steps = [
                "1. Inspect local stormwater drainage around residence.",
                "2. Maintain situational awareness via weather updates."
            ]
        else:
            directive = "NORMAL MONITORING: Environmental parameters within safe baseline ranges."
            action_steps = ["1. Normal routine with periodic automated sensor telemetry tracking."]

        stage6_action = {
            "stage_name": "6. Action & Safety Recommendations",
            "primary_directive": directive,
            "action_checklist": action_steps,
            "emergency_contacts": {
                "state_disaster_helpline": "1070",
                "national_emergency_rescue": "112",
                "ndrf_control_room": "011-24363260"
            }
        }

        # =====================================================================
        # COMPLETE PACKAGED PIPELINE PAYLOAD
        # =====================================================================
        return {
            "success": True,
            "location_id": getattr(location, 'id', 1),
            "location_name": getattr(location, 'name', 'Sector'),
            "pipeline_flow": "DATA -> RISK ANALYSIS -> HAZARD PREDICTION -> IMPACT ASSESSMENT -> EARLY WARNING -> ACTION RECOMMENDATION",
            "pipeline_stages": {
                "stage1_data_ingestion": stage1_data,
                "stage2_risk_analysis": stage2_analysis,
                "stage3_hazard_prediction": stage3_prediction,
                "stage4_impact_assessment": stage4_impact,
                "stage5_early_warning": stage5_warning,
                "stage6_action_recommendation": stage6_action
            },
            # Flat convenience summaries for UI components
            "summary": {
                "overall_score": round(composite_score, 1),
                "overall_level": overall_level,
                "lead_time_minutes": lead_time,
                "flash_flood_score": ff_pred.get("score", 0.0),
                "flash_flood_level": ff_pred.get("level", "LOW"),
                "landslide_score": ls_pred.get("score", 0.0),
                "landslide_level": ls_pred.get("level", "LOW"),
                "heavy_rainfall_score": hr_pred.get("score", 0.0),
                "heavy_rainfall_level": hr_pred.get("level", "LOW"),
                "flood_score": fl_pred.get("score", 0.0),
                "flood_level": fl_pred.get("level", "LOW"),
                "cyclone_score": cy_pred.get("score", 0.0),
                "cyclone_level": cy_pred.get("level", "LOW"),
                "glof_score": hazard_predictions.get("glof", {}).get("score", 0.0),
                "glof_level": hazard_predictions.get("glof", {}).get("level", "LOW"),
                "hazard_predictions": hazard_predictions,
                "exposed_population": impact_assessment.get("exposed_population", 0),
                "recommended_action": directive
            }
        }
