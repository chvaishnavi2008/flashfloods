import json
from typing import Dict, Any, List, Optional
from config import Config
from risk_config import get_risk_level_from_score
from services.predictors.registry import HazardPredictorRegistry
from services.pipeline_engine import DisasterIntelligencePipeline

class PralayWatchRiskEngine:
    """
    =============================================================================
    PralayWatch Risk Intelligence Engine
    =============================================================================
    
    Modular, deterministic risk-analysis engine for multi-hazard early warning.
    
    Accepts environmental & location inputs:
    - Rainfall intensity (mm/hr)
    - Accumulated rainfall (24h mm)
    - Rainfall forecast / trend (Peaking / Rising / Stable / mm)
    - River / water level (m and capacity %)
    - River level trend (Rising Rapidly / Stable / Receding)
    - Elevation (m)
    - Slope (degrees)
    - Soil susceptibility / saturation (% moisture)
    - Historical hazard risk (flood / landslide susceptibility)
    - Population exposure & infrastructure vulnerability
    
    Generates structured risk payloads:
    - hazard: Hazard type
    - riskScore: 0-100 (0-25: LOW, 26-50: MODERATE, 51-75: HIGH, 76-100: CRITICAL)
    - riskLevel: LOW | MODERATE | HIGH | CRITICAL
    - confidence: 0.0 - 1.0
    - factors: List of identified environmental/geotechnical stress factors
    - recommendedActions: Standardized life-safety directives
    """
    
    @staticmethod
    def get_risk_level(score: float) -> str:
        """Map 0-100 score to standardized risk categories."""
        return get_risk_level_from_score(score)

    @classmethod
    def evaluate_hazard(cls, hazard_key: str, env_data: Any, location: Any) -> Dict[str, Any]:
        """
        Evaluate a single specific hazard (e.g. 'flash_flood', 'landslide', 'heavy_rainfall').
        Returns structured JSON matching the PralayWatch specification.
        """
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
        """
        Executes full multi-hazard risk assessment through the 6-stage Disaster Intelligence Pipeline:
        DATA -> RISK ANALYSIS -> HAZARD PREDICTION -> IMPACT ASSESSMENT -> EARLY WARNING -> ACTION
        """
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
            "pipeline_stages": pipeline_output["pipeline_stages"]
        }

    @classmethod
    def evaluate_custom_payload(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Direct evaluation API accepting arbitrary JSON dictionary inputs:
        {
          "location": "Chamoli",
          "rainfall_intensity": 95.0,
          "accumulated_rainfall": 120.0,
          "river_water_level": 6.2,
          "river_capacity_pct": 88.0,
          "river_trend": "Rising Rapidly",
          "slope": 36.0,
          "elevation": 2100,
          "soil_susceptibility": 84.0,
          "historical_flood_risk": 75.0,
          "historical_landslide_risk": 80.0,
          "population": 25000
        }
        """
        loc_name = payload.get("location", payload.get("location_name", "Custom Sector"))
        
        # Synthetic mock objects to feed predictor registry
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

        # Evaluate across all registered predictors
        predictions = HazardPredictorRegistry.evaluate_all(env_dict, loc_dict)
        
        # Determine dominant primary hazard
        primary_hazard_key = max(predictions.keys(), key=lambda k: predictions[k]["riskScore"])
        primary_hazard = predictions[primary_hazard_key]
        
        # Build composite assessment
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

# Alias for backwards compatibility with existing route imports
PrototypeRiskAssessmentEngine = PralayWatchRiskEngine
