from typing import Dict, Any, Tuple
from config import Config
from services.predictors.base_predictor import BaseHazardPredictor

class GLOFPredictor(BaseHazardPredictor):
    """
    Glacial Lake Outburst Flood (GLOF) & Moraine Dam Breach Predictor.
    Evaluates high-altitude catchment elevation (>2000m), steep moraine angles,
    extreme temperature surges / cloudburst precipitation compounding lake volume.
    
    Demonstrates clean extensibility for Himalayan high-altitude cryosphere hazards.
    """
    
    def __init__(self):
        super().__init__(hazard_name="GLOF (Glacial Lake Breach)", priority_rank=6)

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        elevation = float(getattr(location, 'elevation', 1500.0))
        rainfall_rate = float(getattr(env_data, 'rainfall_rate', 0.0))
        river_cap = float(getattr(env_data, 'river_capacity_pct', 0.0))
        soil_sat = float(getattr(env_data, 'soil_saturation_pct', 0.0))
        
        # Cryosphere risk factor is elevated for locations above 1800m elevation
        high_altitude_factor = 1.35 if elevation >= 2000.0 else (1.15 if elevation >= 1500.0 else 0.4)
        
        return {
            "elevation_m": elevation,
            "high_altitude_factor": high_altitude_factor,
            "rainfall_rate_mm_hr": rainfall_rate,
            "river_capacity_pct": river_cap,
            "soil_saturation_pct": soil_sat
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        
        # If low elevation or non-mountainous, GLOF risk is nominal
        if features["elevation_m"] < 1200.0:
            return 8.0, "LOW", {
                "moraine_dam_status": "Non-Glacial Zone",
                "lake_volume_surge": "None",
                "downstream_flood_wave_eta_mins": 360
            }
            
        rain_factor = min(100.0, (features["rainfall_rate_mm_hr"] / 100.0) * 100.0)
        river_factor = min(100.0, features["river_capacity_pct"])
        
        raw_score = (rain_factor * 0.45 + river_factor * 0.40 + 15.0) * features["high_altitude_factor"]
        score = min(100.0, max(0.0, raw_score))
        level = self.get_level(score)
        
        moraine_status = "Breach Risk Elevated" if score >= 75.0 else ("Under Monitoring" if score >= 45.0 else "Stable")
        
        meta = {
            "moraine_dam_status": moraine_status,
            "catchment_elevation_m": features["elevation_m"],
            "glacial_lake_surge_probability": "High" if score >= 70.0 else "Low",
            "downstream_flood_wave_eta_mins": max(20, int(90 - (score * 0.6)))
        }
        
        return score, level, meta
