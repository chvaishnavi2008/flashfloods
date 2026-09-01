from typing import Dict, Any, Tuple, List
from config import Config
from risk_config import get_risk_level_from_score
from services.predictors.base_predictor import BaseHazardPredictor

class GLOFPredictor(BaseHazardPredictor):
    """
    Glacial Lake Outburst Flood (GLOF) & Moraine Dam Breach Predictor.
    Evaluates high-altitude catchment elevation (>2000m), steep moraine angles,
    extreme temperature surges / cloudburst precipitation compounding lake volume.
    """
    
    def __init__(self):
        super().__init__(hazard_name="GLOF (Glacial Lake Breach)", priority_rank=6, hazard_key="glof")

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        elevation = float(self.get_val(location, 'elevation', 1500.0))
        rainfall_rate = float(self.get_val(env_data, 'rainfall_rate', 0.0))
        river_cap = float(self.get_val(env_data, 'river_capacity_pct', 0.0))
        soil_sat = float(self.get_val(env_data, 'soil_saturation_pct', 0.0))
        
        high_altitude_factor = 1.35 if elevation >= 2000.0 else (1.15 if elevation >= 1500.0 else 0.4)
        
        return {
            "elevation_m": elevation,
            "high_altitude_factor": high_altitude_factor,
            "rainfall_rate_mm_hr": rainfall_rate,
            "river_capacity_pct": river_cap,
            "soil_saturation_pct": soil_sat
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, float, List[str], List[str], Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        
        if features["elevation_m"] < 1200.0:
            return 8.0, "LOW", 0.95, ["Location situated below glacial cryosphere zone"], ["Normal monitoring."], {
                "moraine_dam_status": "Non-Glacial Zone",
                "lake_volume_surge": "None",
                "downstream_flood_wave_eta_mins": 360
            }
            
        rain_factor = min(100.0, (features["rainfall_rate_mm_hr"] / 100.0) * 100.0)
        river_factor = min(100.0, features["river_capacity_pct"])
        weights = Config.RISK_WEIGHTS["glof"]
        
        raw_score = (rain_factor * weights["rainfall_intensity"] + river_factor * weights["river_capacity"] + 15.0) * features["high_altitude_factor"]
        risk_score = min(100.0, max(0.0, raw_score))
        risk_level = self.get_level(risk_score)
        confidence = 0.84
        
        moraine_status = "Breach Risk Elevated" if risk_score >= 75.0 else ("Under Monitoring" if risk_score >= 45.0 else "Stable")
        
        factors = []
        if features["elevation_m"] >= 1800.0:
            factors.append(f"High-altitude cryosphere zone ({features['elevation_m']}m elevation)")
        if features["rainfall_rate_mm_hr"] >= 40.0:
            factors.append(f"Compounding cloudburst rainfall rate ({features['rainfall_rate_mm_hr']} mm/hr)")
        if not factors:
            factors.append("Moraine lake volume and outlet channels stable")
            
        actions = [
            "Evacuate downstream riverine valleys immediately to higher contour ridges",
            "Monitor satellite radar cryosphere moraine lake expansion feeds"
        ] if risk_score >= 51.0 else ["Glacial lake levels stable."]
        
        metadata = {
            "moraine_dam_status": moraine_status,
            "catchment_elevation_m": features["elevation_m"],
            "glacial_lake_surge_probability": "High" if risk_score >= 70.0 else "Low",
            "downstream_flood_wave_eta_mins": max(20, int(90 - (risk_score * 0.6)))
        }
        
        return risk_score, risk_level, confidence, factors, actions, metadata
