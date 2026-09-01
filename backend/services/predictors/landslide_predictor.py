from typing import Dict, Any, Tuple
from config import Config
from services.predictors.base_predictor import BaseHazardPredictor

class LandslidePredictor(BaseHazardPredictor):
    """
    Priority 2: Landslide / Geohazard Predictor.
    Evaluates geotechnical slope geometry, pore-water pressure saturation,
    hydraulic shear loading, and antecedent precipitation.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Landslide", priority_rank=2)

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        return {
            "soil_saturation_pct": float(getattr(env_data, 'soil_saturation_pct', 0.0)),
            "slope_deg": float(getattr(env_data, 'slope_deg', 25.0)),
            "rainfall_rate_mm_hr": float(getattr(env_data, 'rainfall_rate', 0.0)),
            "rainfall_24h_mm": float(getattr(env_data, 'rainfall_mm', 0.0))
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        
        # 1. Soil saturation (pore-water pressure trigger)
        soil_factor = min(100.0, features["soil_saturation_pct"])
        
        # 2. Slope angle normalization: 0° -> 0, 45°+ -> 100
        slope_factor = min(100.0, (features["slope_deg"] / 45.0) * 100.0)
        
        # 3. Dynamic rainfall intensity trigger
        rain_factor = min(100.0, (features["rainfall_rate_mm_hr"] / 100.0) * 100.0)
        
        weights = Config.RISK_WEIGHTS["landslide"]
        raw_score = (
            soil_factor * weights["soil_saturation"] +
            slope_factor * weights["slope_steepness"] +
            rain_factor * weights["rainfall_intensity"] +
            15.0 * weights["historical_factor"]
        )
        
        # Non-linear geotechnical compounding when saturated & steep (>30° slope and >80% moisture)
        if features["soil_saturation_pct"] > 80.0 and features["slope_deg"] > 30.0:
            raw_score *= 1.25
            
        score = min(100.0, max(0.0, raw_score))
        level = self.get_level(score)
        
        meta = {
            "slope_stability_status": "Critical / Imminent Slip" if score >= 76.0 else ("Unstable" if score >= 51.0 else "Stable"),
            "pore_water_pressure_index": round(features["soil_saturation_pct"] / 100.0, 2),
            "debris_flow_probability": "High" if score >= 65.0 else "Low"
        }
        
        return score, level, meta
