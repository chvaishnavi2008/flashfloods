from typing import Dict, Any, Tuple
from config import Config
from services.predictors.base_predictor import BaseHazardPredictor

class FlashFloodPredictor(BaseHazardPredictor):
    """
    Priority 1: Flash Flood Risk Predictor.
    Evaluates sudden cloudburst precipitation, catchment slope,
    river channel capacity, and soil moisture infiltration deficiency.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Flash Flood", priority_rank=1)

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        return {
            "rainfall_rate_mm_hr": float(getattr(env_data, 'rainfall_rate', 0.0)),
            "river_capacity_pct": float(getattr(env_data, 'river_capacity_pct', 0.0)),
            "soil_saturation_pct": float(getattr(env_data, 'soil_saturation_pct', 0.0)),
            "elevation_m": float(getattr(location, 'elevation', 500.0)),
            "terrain_steepness_factor": 1.2 if ("Mountain" in getattr(location, 'terrain_type', '') or "Valley" in getattr(location, 'terrain_type', '')) else 1.0
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        
        # 1. Rainfall rate factor (0 to 120 mm/hr -> normalized 0-100)
        rain_factor = min(100.0, (features["rainfall_rate_mm_hr"] / 120.0) * 100.0)
        
        # 2. River channel saturation (0-100%)
        river_factor = min(100.0, features["river_capacity_pct"])
        
        # 3. Soil absorption resistance (0-100%)
        soil_factor = min(100.0, features["soil_saturation_pct"])
        
        weights = Config.RISK_WEIGHTS["flash_flood"]
        raw_score = (
            rain_factor * weights["rainfall_intensity"] +
            river_factor * weights["river_capacity"] +
            soil_factor * weights["soil_saturation"] +
            20.0 * weights["historical_factor"]
        ) * features["terrain_steepness_factor"]
        
        score = min(100.0, max(0.0, raw_score))
        level = self.get_level(score)
        
        meta = {
            "primary_driver": "Rainfall Intensity & Catchment Runoff" if rain_factor > river_factor else "River Channel Overcapacity",
            "runoff_velocity": "High" if features["terrain_steepness_factor"] > 1.0 else "Moderate",
            "critical_threshold_exceeded": score >= 76.0
        }
        
        return score, level, meta
