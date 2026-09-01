import json
from config import Config
from services.pipeline_engine import DisasterIntelligencePipeline
from services.predictors.registry import HazardPredictorRegistry

class PrototypeRiskAssessmentEngine:
    """
    Prototype Risk Assessment Engine for PralayWatch.
    Modular multi-hazard intelligence engine assessing:
    - Flash Flood Risk (Priority 1)
    - Landslide / Land Risk (Priority 2)
    - Extreme / Heavy Rainfall Risk (Priority 3)
    - Riverine Flood Risk
    - Cyclone / Storm Surge Risk (Pluggable)
    
    Delegates to the modular DisasterIntelligencePipeline orchestrator and HazardPredictorRegistry.
    Can be seamlessly upgraded with trained ML/Hydrological models in Phase 2 via predict_ml slots.
    """
    
    @staticmethod
    def get_level(score):
        """Map 0-100 score to configurable categorical risk levels."""
        thresholds = Config.RISK_THRESHOLDS
        if score >= thresholds["CRITICAL"][0]:
            return "CRITICAL"
        elif score >= thresholds["HIGH"][0]:
            return "HIGH"
        elif score >= thresholds["MODERATE"][0]:
            return "MODERATE"
        else:
            return "LOW"

    @classmethod
    def calculate_flash_flood_risk(cls, env_data, location):
        pred = HazardPredictorRegistry.get("flash_flood")
        res = pred.predict(env_data, location)
        return res["score"], res["level"]

    @classmethod
    def calculate_flood_risk(cls, env_data, location):
        pred = HazardPredictorRegistry.get("flood")
        res = pred.predict(env_data, location)
        return res["score"], res["level"]

    @classmethod
    def calculate_landslide_risk(cls, env_data, location):
        pred = HazardPredictorRegistry.get("landslide")
        res = pred.predict(env_data, location)
        return res["score"], res["level"]

    @classmethod
    def calculate_heavy_rainfall_risk(cls, env_data, location):
        pred = HazardPredictorRegistry.get("heavy_rainfall")
        res = pred.predict(env_data, location)
        return res["score"], res["level"]

    @classmethod
    def calculate_cyclone_risk(cls, env_data, location):
        pred = HazardPredictorRegistry.get("cyclone")
        res = pred.predict(env_data, location)
        return res["score"], res["level"]

    @classmethod
    def evaluate_composite_risk(cls, env_data, location):
        """
        Compute full risk assessment profile across all hazards through the 6-stage pipeline.
        """
        pipeline_output = DisasterIntelligencePipeline.execute_pipeline(env_data, location)
        summary = pipeline_output["summary"]
        stage2 = pipeline_output["pipeline_stages"]["stage2_risk_analysis"]
        stage4 = pipeline_output["pipeline_stages"]["stage4_impact_assessment"]["impact_assessment"]

        # Contributing factors
        factors = stage2.get("primary_stress_factors", [])
        if not factors:
            factors = [
                "Environmental metrics within nominal baseline limits",
                "Stable atmospheric and watershed conditions"
            ]

        return {
            "overall_score": summary["overall_score"],
            "overall_level": summary["overall_level"],
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
            "lead_time_minutes": summary["lead_time_minutes"],
            "contributing_factors": json.dumps(factors),
            "recommended_action": summary["recommended_action"],
            # Enriched pipeline metadata
            "impact_assessment": stage4,
            "pipeline_stages": pipeline_output["pipeline_stages"]
        }
