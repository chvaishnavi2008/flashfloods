import json
from typing import Dict, Any, List, Optional
from config import Config
from risk_config import get_risk_level_from_score
from services.predictors.registry import HazardPredictorRegistry
from services.pipeline_engine import DisasterIntelligencePipeline

# =============================================================================
# 1. MODULAR STANDALONE RISK ENGINE FUNCTIONS
# =============================================================================

def calculate_flash_flood_risk(rainfall: float, soil_moisture: float = 50.0, river_level: float = 50.0, historical_risk: float = 50.0) -> float:
    """
    Calculates Flash Flood risk score (0-100) based on rainfall intensity,
    soil moisture saturation, river level capacity, and historical risk index.
    """
    rain_score = min(100.0, (float(rainfall) / 120.0) * 100.0)
    soil_score = min(100.0, max(0.0, float(soil_moisture)))
    river_score = min(100.0, max(0.0, float(river_level)))
    hist_score = min(100.0, max(0.0, float(historical_risk)))

    # Deterministic multi-factor weighted equation
    score = (0.40 * rain_score) + (0.25 * soil_score) + (0.20 * river_score) + (0.15 * hist_score)
    return round(min(100.0, max(0.0, score)), 2)

def calculate_landslide_risk(rainfall: float, soil_moisture: float = 50.0, slope: float = 30.0, historical_risk: float = 50.0) -> float:
    """
    Calculates Landslide / Slope Geohazard risk score (0-100) based on
    soil moisture saturation, terrain slope gradient, rainfall rate, and historical risk index.
    """
    rain_score = min(100.0, (float(rainfall) / 120.0) * 100.0)
    soil_score = min(100.0, max(0.0, float(soil_moisture)))
    slope_score = min(100.0, (float(slope) / 45.0) * 100.0)
    hist_score = min(100.0, max(0.0, float(historical_risk)))

    # Geotechnical pore-pressure & shear stress equation
    score = (0.35 * soil_score) + (0.30 * slope_score) + (0.20 * rain_score) + (0.15 * hist_score)
    return round(min(100.0, max(0.0, score)), 2)

def calculate_overall_risk(flash_flood_score: float, landslide_score: float, extreme_rainfall_score: float = 0.0) -> float:
    """
    Calculates unified multi-hazard composite risk score (0-100).
    Dominant primary hazard contributes 55%, secondary contributes 35%, auxiliary contributes 10%.
    """
    scores = [float(flash_flood_score), float(landslide_score)]
    if extreme_rainfall_score > 0:
        scores.append(float(extreme_rainfall_score))
    
    scores.sort(reverse=True)
    primary = scores[0]
    secondary = scores[1] if len(scores) > 1 else primary
    auxiliary = scores[2] if len(scores) > 2 else (secondary * 0.5)

    composite = (0.55 * primary) + (0.35 * secondary) + (0.10 * auxiliary)
    return round(min(100.0, max(0.0, composite)), 2)

def determine_risk_level(overall_score: float) -> str:
    """
    Maps 0-100 continuous score to standard disaster threat categories:
    - 0-25: LOW
    - 26-50: MODERATE
    - 51-75: HIGH
    - 76-100: CRITICAL
    """
    score = float(overall_score)
    if score >= 76.0:
        return "CRITICAL"
    elif score >= 51.0:
        return "HIGH"
    elif score >= 26.0:
        return "MODERATE"
    return "LOW"

def determine_dominant_hazard(flash_flood_score: float, landslide_score: float, extreme_rainfall_score: float = 0.0) -> str:
    """
    Identifies the primary dominant hazard driving the composite threat.
    """
    if flash_flood_score >= landslide_score and flash_flood_score >= extreme_rainfall_score:
        return "flash_flood"
    elif landslide_score >= flash_flood_score and landslide_score >= extreme_rainfall_score:
        return "landslide"
    return "heavy_rainfall"

def estimate_lead_time(overall_score: float, rainfall: float = 0.0, river_level: float = 0.0) -> int:
    """
    Estimates actionable evacuation lead time (in minutes) based on disaster severity.
    """
    score = float(overall_score)
    if score >= 85.0:
        return 32
    elif score >= 75.0:
        return 54
    elif score >= 50.0:
        return 75
    elif score >= 25.0:
        return 120
    return 180

def generate_recommended_action(risk_level: str, dominant_hazard: str = "flash_flood") -> str:
    """
    Generates unambiguous, actionable life-safety advisory based on risk tier.
    """
    level = str(risk_level).upper()
    hazard_label = dominant_hazard.replace("_", " ").title()

    if level == "CRITICAL":
        return f"CRITICAL EMERGENCY: Evacuate low-lying riverbanks and unstable hillsides immediately. Move to designated high-ground safe havens."
    elif level == "HIGH":
        return f"HIGH ALERT: Prepare for immediate evacuation to a safe location. Avoid mountain stream crossings and flood corridors."
    elif level == "MODERATE":
        return f"ADVISORY: Elevated {hazard_label} watch. Secure outdoor equipment and verify nearest safe haven routes."
    return "NORMAL: Baseline monitoring active. No protective evacuation required."

# =============================================================================
# 2. CLASS-BASED RISK ENGINE WRAPPER
# =============================================================================

class PralayWatchRiskEngine:
    """
    Modular, deterministic risk-analysis engine for multi-hazard early warning.
    """
    
    @staticmethod
    def get_risk_level(score: float) -> str:
        return determine_risk_level(score)

    @classmethod
    def evaluate_hazard(cls, hazard_key: str, env_data: Any, location: Any) -> Dict[str, Any]:
        predictor = HazardPredictorRegistry.get(hazard_key)
        if not predictor:
            raise ValueError(f"Unknown hazard key: '{hazard_key}'")
        return predictor.predict(env_data, location)

    @classmethod
    def evaluate_flash_flood(cls, env_data: Any, location: Any) -> Dict[str, Any]:
        return cls.evaluate_hazard("flash_flood", env_data, location)

    @classmethod
    def evaluate_landslide(cls, env_data: Any, location: Any) -> Dict[str, Any]:
        return cls.evaluate_hazard("landslide", env_data, location)

    @classmethod
    def evaluate_extreme_rainfall(cls, env_data: Any, location: Any) -> Dict[str, Any]:
        return cls.evaluate_hazard("heavy_rainfall", env_data, location)

    @classmethod
    def evaluate_composite_risk(cls, env_data: Any, location: Any) -> Dict[str, Any]:
        pipeline_output = DisasterIntelligencePipeline.execute_pipeline(env_data, location)
        summary = pipeline_output["summary"]
        stage2 = pipeline_output["pipeline_stages"]["stage2_risk_analysis"]
        stage4 = pipeline_output["pipeline_stages"]["stage4_impact_assessment"]["impact_assessment"]

        factors = stage2.get("primary_stress_factors", [])
        if not factors:
            factors = [
                "Environmental metrics within nominal baseline limits",
                "Stable atmospheric and watershed conditions"
            ]

        loc_name = getattr(location, 'name', 'Monitored Sector') if location else 'Monitored Sector'

        return {
            "location": loc_name,
            "overall_score": summary["overall_score"],
            "overall_level": summary["overall_level"],
            "riskScore": summary["overall_score"],
            "riskLevel": summary["overall_level"],
            "confidence": 0.91,
            "factors": factors,
            "recommendedActions": [summary["recommended_action"]],
            "flash_flood": summary.get("hazard_predictions", {}).get("flash_flood", {}),
            "landslide": summary.get("hazard_predictions", {}).get("landslide", {}),
            "extreme_rainfall": summary.get("hazard_predictions", {}).get("heavy_rainfall", {}),
            "flash_flood_score": summary["flash_flood_score"],
            "flash_flood_level": summary["flash_flood_level"],
            "flood_score": summary["flood_score"],
            "flood_level": summary["flood_level"],
            "landslide_score": summary["landslide_score"],
            "landslide_level": summary["landslide_level"],
            "heavy_rainfall_score": summary["heavy_rainfall_score"],
            "heavy_rainfall_level": summary["heavy_rainfall_level"],
            "cyclone_score": summary.get("cyclone_score", 0.0),
            "cyclone_level": summary.get("cyclone_level", "LOW"),
            "glof_score": summary.get("glof_score", 0.0),
            "glof_level": summary.get("glof_level", "LOW"),
            "lead_time_minutes": summary["lead_time_minutes"],
            "contributing_factors": json.dumps(factors),
            "recommended_action": summary["recommended_action"],
            "impact_assessment": stage4,
            "action_recommendations": pipeline_output["pipeline_stages"]["stage6_action_recommendation"].get("action_guidance", {}),
            "pipeline_stages": pipeline_output["pipeline_stages"]
        }

    @classmethod
    def evaluate_custom_payload(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        loc_name = payload.get("location", payload.get("location_name", "Custom Sector"))
        
        env_dict = {
            "rainfall_rate": float(payload.get("rainfall_intensity", payload.get("rainfall_rate", 5.0))),
            "rainfall_mm": float(payload.get("accumulated_rainfall", payload.get("rainfall_mm", 25.0))),
            "rainfall_forecast_trend": str(payload.get("rainfall_forecast", payload.get("rainfall_forecast_trend", "Stable"))),
            "forecast_rainfall_mm": float(payload.get("forecast_rainfall_mm", 0.0)),
            "duration_hours": float(payload.get("duration", payload.get("duration_hours", 2.0))),
            "river_level_m": float(payload.get("river_water_level", payload.get("river_level_m", 2.1))),
            "river_capacity_pct": float(payload.get("river_capacity_pct", 35.0)),
            "river_trend": str(payload.get("river_trend", "Normal")),
            "soil_saturation_pct": float(payload.get("soil_susceptibility", payload.get("soil_saturation_pct", 45.0))),
            "slope_deg": float(payload.get("slope", payload.get("slope_deg", 30.0))),
            "wind_speed_kmh": float(payload.get("wind_speed_kmh", 25.0))
        }
        
        loc_dict = {
            "name": loc_name,
            "elevation": float(payload.get("elevation", 1500.0)),
            "terrain_type": str(payload.get("terrain_type", "Mountainous / Valley")),
            "population": int(payload.get("population", 50000)),
            "is_vulnerable": bool(payload.get("is_vulnerable", True)),
            "historical_flood_risk": float(payload.get("historical_flood_risk", 60.0)),
            "historical_landslide_risk": float(payload.get("historical_landslide_risk", 65.0))
        }

        predictions = HazardPredictorRegistry.evaluate_all(env_dict, loc_dict)
        primary_hazard_key = max(predictions.keys(), key=lambda k: predictions[k]["riskScore"])
        primary_hazard = predictions[primary_hazard_key]
        composite = cls.evaluate_composite_risk(env_dict, loc_dict)

        return {
            "location": loc_name,
            "primaryHazard": primary_hazard["hazard"],
            "riskScore": primary_hazard["riskScore"],
            "riskLevel": primary_hazard["riskLevel"],
            "confidence": primary_hazard["confidence"],
            "factors": primary_hazard["factors"],
            "recommendedActions": primary_hazard["recommendedActions"],
            "multiHazardBreakdown": {
                "flash_flood": predictions.get("flash_flood"),
                "landslide": predictions.get("landslide"),
                "extreme_rainfall": predictions.get("heavy_rainfall"),
                "riverine_flood": predictions.get("flood"),
                "cyclone": predictions.get("cyclone"),
                "glof": predictions.get("glof")
            },
            "compositeAssessment": {
                "compositeScore": composite["overall_score"],
                "compositeLevel": composite["overall_level"],
                "leadTimeMinutes": composite["lead_time_minutes"],
                "impact": composite.get("impact_assessment", {})
            }
        }

PrototypeRiskAssessmentEngine = PralayWatchRiskEngine
