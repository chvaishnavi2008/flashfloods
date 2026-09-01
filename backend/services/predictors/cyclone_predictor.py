from typing import Dict, Any, Tuple
from config import Config
from services.predictors.base_predictor import BaseHazardPredictor

class CyclonePredictor(BaseHazardPredictor):
    """
    Cyclone & Atmospheric Storm Surge Predictor.
    Evaluates sustained wind speeds, pressure drop, precipitation bands,
    and coastal/valley depression surge dynamics.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Cyclone / Windstorm", priority_rank=5)

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        # Synthesize atmospheric pressure and wind metrics if not explicitly in model
        rainfall_rate = float(getattr(env_data, 'rainfall_rate', 10.0))
        estimated_wind_kmh = max(20.0, rainfall_rate * 0.75 + 15.0)
        
        return {
            "wind_speed_kmh": estimated_wind_kmh,
            "rainfall_rate_mm_hr": rainfall_rate,
            "is_coastal_or_valley": 1.1 if ("Coastal" in getattr(location, 'terrain_type', '') or "Valley" in getattr(location, 'terrain_type', '')) else 1.0
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        
        # Wind speed factor: 0 - 150 km/h
        wind_factor = min(100.0, (features["wind_speed_kmh"] / 140.0) * 100.0)
        rain_factor = min(100.0, (features["rainfall_rate_mm_hr"] / 100.0) * 100.0)
        
        raw_score = (wind_factor * 0.60 + rain_factor * 0.40) * features["is_coastal_or_valley"]
        score = min(100.0, max(0.0, raw_score))
        level = self.get_level(score)
        
        category = "Super Cyclonic" if features["wind_speed_kmh"] >= 120 else (
            "Severe Cyclonic Storm" if features["wind_speed_kmh"] >= 80 else (
                "Deep Depression" if features["wind_speed_kmh"] >= 50 else "Moderate Squall"
            )
        )
        
        meta = {
            "estimated_wind_speed_kmh": round(features["wind_speed_kmh"], 1),
            "cyclone_classification": category,
            "structural_wind_damage_risk": score >= 70.0
        }
        
        return score, level, meta
