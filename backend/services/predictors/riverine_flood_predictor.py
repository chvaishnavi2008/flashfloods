from typing import Dict, Any, Tuple, List
from config import Config
from risk_config import (
    NORMALIZATION_BOUNDS, 
    RIVER_TREND_SCORES, 
    ACTION_RECOMMENDATIONS, 
    get_risk_level_from_score
)
from services.predictors.base_predictor import BaseHazardPredictor

class RiverineFloodPredictor(BaseHazardPredictor):
    """
    Riverine Flood & Catchment Inundation Predictor.
    Evaluates sustained river gauge heights, catchment water volumes,
    river trend, and low-lying basin drainage constraints.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Riverine Flood", priority_rank=4, hazard_key="flood")

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        river_capacity_pct = float(self.get_val(env_data, 'river_capacity_pct', 35.0))
        river_level_m = float(self.get_val(env_data, 'river_level_m', 2.1))
        rainfall_24h_mm = float(self.get_val(env_data, 'rainfall_mm', self.get_val(env_data, 'accumulated_rainfall', 25.0)))
        terrain_type = str(self.get_val(location, 'terrain_type', 'Valley Basin'))
        is_valley_basin = 1.0 if ("Valley" in terrain_type or "Basin" in terrain_type) else 0.0
        river_trend_str = str(self.get_val(env_data, 'river_trend', 'Normal'))
        river_trend_score = RIVER_TREND_SCORES.get(river_trend_str, 25.0)

        return {
            "river_capacity_pct": river_capacity_pct,
            "river_level_m": river_level_m,
            "rainfall_24h_mm": rainfall_24h_mm,
            "is_valley_basin": is_valley_basin,
            "river_trend_score": river_trend_score
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, float, List[str], List[str], Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        bounds = NORMALIZATION_BOUNDS
        weights = Config.RISK_WEIGHTS["riverine_flood"]

        norm_river = min(100.0, features["river_capacity_pct"])
        norm_accum = min(100.0, (features["rainfall_24h_mm"] / bounds["rainfall_accum_max_mm"]) * 100.0)
        norm_trend = min(100.0, features["river_trend_score"])
        norm_hist = 20.0

        raw_score = (
            norm_river * weights["river_water_level"] +
            norm_accum * weights["rainfall_accumulation"] +
            norm_trend * weights["river_trend"] +
            norm_hist * weights["historical_susceptibility"]
        )
        if features["is_valley_basin"] > 0:
            raw_score *= 1.15

        risk_score = min(100.0, max(0.0, raw_score))
        risk_level = self.get_level(risk_score)
        confidence = 0.89

        factors = []
        if features["river_capacity_pct"] >= 80.0:
            factors.append(f"River gauge at {features['river_capacity_pct']}% capacity (high inundation threat)")
        if features["rainfall_24h_mm"] >= 80.0:
            factors.append(f"Cumulative 24h basin rainfall {features['rainfall_24h_mm']} mm")
        if features["is_valley_basin"] > 0:
            factors.append("Low-lying floodplain catchment topology")

        if not factors:
            factors.append("River water levels and floodplain buffers within nominal capacity")

        actions = [
            "Monitor riverbank embankment gauge markers",
            "Avoid low-lying floodplains and riverside agricultural parcels",
            "Keep emergency flood barriers and sandbags ready if levels continue rising"
        ] if risk_score >= 51.0 else ["River levels normal. Routine hydrological monitoring."]

        metadata = {
            "river_danger_level_pct": norm_river,
            "embankment_breach_risk": norm_river >= 85.0,
            "inundation_zone_status": "Active Overflow" if norm_river >= 90.0 else "Stable"
        }

        return risk_score, risk_level, confidence, factors, actions, metadata
