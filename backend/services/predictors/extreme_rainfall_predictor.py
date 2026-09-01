from typing import Dict, Any, Tuple
from config import Config
from services.predictors.base_predictor import BaseHazardPredictor

class ExtremeRainfallPredictor(BaseHazardPredictor):
    """
    Priority 3: Extreme Rainfall & Cloudburst Predictor.
    Evaluates precipitation rate, nowcast forecast trends,
    and 24-hour cumulative hydrological rainfall volume.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Extreme Rainfall", priority_rank=3)

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        trend = getattr(env_data, 'rainfall_forecast_trend', 'Stable')
        trend_val = 100.0 if trend == "Peaking" else (85.0 if trend == "Rising" else 40.0)
        
        return {
            "rainfall_rate_mm_hr": float(getattr(env_data, 'rainfall_rate', 0.0)),
            "rainfall_24h_mm": float(getattr(env_data, 'rainfall_mm', 0.0)),
            "forecast_trend_val": trend_val
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        
        # 1. Rainfall rate normalization (0 to 100 mm/hr)
        rate_factor = min(100.0, (features["rainfall_rate_mm_hr"] / 100.0) * 100.0)
        
        weights = Config.RISK_WEIGHTS["heavy_rainfall"]
        raw_score = (
            rate_factor * weights["rainfall_rate"] +
            features["forecast_trend_val"] * weights["trend_forecast"]
        )
        
        score = min(100.0, max(0.0, raw_score))
        level = self.get_level(score)
        
        intensity = "Cloudburst / Torrential" if features["rainfall_rate_mm_hr"] >= 100.0 else (
            "Heavy Rainfall" if features["rainfall_rate_mm_hr"] >= 50.0 else "Moderate"
        )
        
        meta = {
            "intensity_classification": intensity,
            "cloudburst_risk": features["rainfall_rate_mm_hr"] >= 80.0,
            "accumulated_24h_mm": features["rainfall_24h_mm"]
        }
        
        return score, level, meta
