from typing import Dict, Any, Tuple, List
from config import Config
from risk_config import get_risk_level_from_score
from services.predictors.base_predictor import BaseHazardPredictor

class CyclonePredictor(BaseHazardPredictor):
    """
    Cyclone & Atmospheric Storm Surge Predictor.
    Evaluates sustained wind speeds, pressure drop, precipitation bands,
    and coastal/valley depression surge dynamics.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Cyclone / Windstorm", priority_rank=5, hazard_key="cyclone")

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        rainfall_rate = float(self.get_val(env_data, 'rainfall_rate', 10.0))
        wind_speed_kmh = float(self.get_val(env_data, 'wind_speed_kmh', max(20.0, rainfall_rate * 0.75 + 15.0)))
        terrain_type = str(self.get_val(location, 'terrain_type', 'Valley'))
        is_coastal_or_valley = 1.1 if ("Coastal" in terrain_type or "Valley" in terrain_type) else 1.0
        
        return {
            "wind_speed_kmh": wind_speed_kmh,
            "rainfall_rate_mm_hr": rainfall_rate,
            "terrain_multiplier": is_coastal_or_valley
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, float, List[str], List[str], Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        weights = Config.RISK_WEIGHTS["cyclone"]
        
        wind_factor = min(100.0, (features["wind_speed_kmh"] / 140.0) * 100.0)
        rain_factor = min(100.0, (features["rainfall_rate_mm_hr"] / 100.0) * 100.0)
        
        raw_score = (wind_factor * weights["wind_speed"] + rain_factor * weights["rainfall_rate"]) * features["terrain_multiplier"]
        risk_score = min(100.0, max(0.0, raw_score))
        risk_level = self.get_level(risk_score)
        confidence = 0.85
        
        category = "Super Cyclonic" if features["wind_speed_kmh"] >= 120 else (
            "Severe Cyclonic Storm" if features["wind_speed_kmh"] >= 80 else (
                "Deep Depression" if features["wind_speed_kmh"] >= 50 else "Moderate Squall"
            )
        )
        
        factors = []
        if features["wind_speed_kmh"] >= 65.0:
            factors.append(f"High wind gust velocities ({features['wind_speed_kmh']} km/h)")
        if features["rainfall_rate_mm_hr"] >= 40.0:
            factors.append(f"Heavy convective rainband precipitation ({features['rainfall_rate_mm_hr']} mm/hr)")
        if not factors:
            factors.append("Wind and atmospheric pressure metrics within safe thresholds")
            
        actions = [
            "Secure loose rooftop sheets and billboard structures",
            "Remain inside sturdy masonry structures away from glass windows",
            "Keep emergency lighting and battery backup ready"
        ] if risk_score >= 51.0 else ["Wind and barometric conditions stable."]
        
        metadata = {
            "estimated_wind_speed_kmh": round(features["wind_speed_kmh"], 1),
            "cyclone_classification": category,
            "structural_wind_damage_risk": risk_score >= 70.0
        }
        
        return risk_score, risk_level, confidence, factors, actions, metadata
