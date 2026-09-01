from typing import Dict, Any, Tuple
from config import Config
from services.predictors.base_predictor import BaseHazardPredictor

class RiverineFloodPredictor(BaseHazardPredictor):
    """
    Riverine Flood & Catchment Inundation Predictor.
    Evaluates sustained river gauge heights, catchment water volumes,
    and low-lying basin drainage constraints.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Riverine Flood", priority_rank=4)

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        return {
            "river_capacity_pct": float(getattr(env_data, 'river_capacity_pct', 0.0)),
            "river_level_m": float(getattr(env_data, 'river_level_m', 2.0)),
            "rainfall_24h_mm": float(getattr(env_data, 'rainfall_mm', 0.0)),
            "is_valley_basin": 1.0 if "Valley" in getattr(location, 'terrain_type', '') else 0.0
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        
        river_factor = min(100.0, features["river_capacity_pct"])
        accum_factor = min(100.0, (features["rainfall_24h_mm"] / 250.0) * 100.0)
        
        weights = Config.RISK_WEIGHTS["flood"]
        raw_score = (
            river_factor * weights["river_capacity"] +
            accum_factor * weights["rainfall_accumulation"] +
            (10.0 if features["is_valley_basin"] > 0 else 5.0) +
            15.0 * weights["historical_factor"]
        )
        
        score = min(100.0, max(0.0, raw_score))
        level = self.get_level(score)
        
        meta = {
            "river_danger_level_pct": river_factor,
            "embankment_breach_risk": river_factor >= 85.0,
            "inundation_zone_status": "Active Overflow" if river_factor >= 90.0 else "Stable"
        }
        
        return score, level, meta
