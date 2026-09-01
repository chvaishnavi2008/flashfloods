from typing import Dict, Any, Tuple, List
from config import Config
from risk_config import (
    NORMALIZATION_BOUNDS, 
    RIVER_TREND_SCORES, 
    ACTION_RECOMMENDATIONS, 
    get_risk_level_from_score
)
from services.predictors.base_predictor import BaseHazardPredictor

class FlashFloodPredictor(BaseHazardPredictor):
    """
    Priority 1: Flash Flood Risk Predictor.
    
    Evaluates:
    - Rainfall intensity (instantaneous cloudburst rate in mm/hr)
    - Accumulated rainfall (24h antecedent rainfall in mm)
    - River / water level (channel capacity % / gauge height in m)
    - River level trend (Rising Rapidly / Rising / Stable / Receding)
    - Elevation & terrain steepness (mountain valley runoff acceleration)
    - Historical flood susceptibility (past cloudburst & flood recurrence)
    
    Calculation:
    1. Normalizes all raw sensor inputs to 0-100 scales.
    2. Computes weighted composite score based on configured weights.
    3. Applies mountain catchment runoff multiplier for valley/mountain terrain.
    4. Categorizes into LOW (0-25), MODERATE (26-50), HIGH (51-75), CRITICAL (76-100).
    5. Extracts specific contributing factors and actionable directives.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Flash Flood", priority_rank=1, hazard_key="flash_flood")

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        # 1. Rainfall intensity (mm/hr)
        rainfall_intensity = float(self.get_val(env_data, 'rainfall_rate', self.get_val(env_data, 'rainfall_intensity_val', 5.0)))
        
        # 2. Accumulated rainfall (mm in 24h)
        accumulated_rainfall = float(self.get_val(env_data, 'rainfall_mm', self.get_val(env_data, 'accumulated_rainfall', 25.0)))
        
        # 3. River / Water level (capacity % & height)
        river_capacity_pct = float(self.get_val(env_data, 'river_capacity_pct', 35.0))
        river_level_m = float(self.get_val(env_data, 'river_level_m', 2.1))
        
        # 4. River trend
        river_trend_str = str(self.get_val(env_data, 'river_trend', 'Normal'))
        river_trend_score = RIVER_TREND_SCORES.get(river_trend_str, 25.0)
        
        # 5. Elevation & Terrain
        elevation = float(self.get_val(location, 'elevation', 1500.0))
        terrain_type = str(self.get_val(location, 'terrain_type', 'Mountainous / Valley'))
        is_mountain_valley = 1.25 if ("Mountain" in terrain_type or "Valley" in terrain_type or elevation >= 1000.0) else 1.0
        
        # 6. Historical flood susceptibility
        is_vulnerable = bool(self.get_val(location, 'is_vulnerable', True))
        historical_flood_risk = float(self.get_val(location, 'historical_flood_risk', 65.0 if is_vulnerable else 20.0))

        return {
            "rainfall_intensity_mm_hr": rainfall_intensity,
            "accumulated_rainfall_mm": accumulated_rainfall,
            "river_capacity_pct": river_capacity_pct,
            "river_level_m": river_level_m,
            "river_trend_score": river_trend_score,
            "elevation_m": elevation,
            "terrain_multiplier": is_mountain_valley,
            "historical_flood_susceptibility": historical_flood_risk
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, float, List[str], List[str], Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        bounds = NORMALIZATION_BOUNDS
        weights = Config.RISK_WEIGHTS["flash_flood"]

        # ---------------------------------------------------------------------
        # STEP 1: Input Normalization (0 to 100)
        # ---------------------------------------------------------------------
        # Rainfall Intensity: 0 to 120 mm/hr
        norm_rain_rate = min(100.0, (features["rainfall_intensity_mm_hr"] / bounds["rainfall_rate_max_mm_hr"]) * 100.0)
        
        # Accumulated Rainfall: 0 to 250 mm
        norm_accum_rain = min(100.0, (features["accumulated_rainfall_mm"] / bounds["rainfall_accum_max_mm"]) * 100.0)
        
        # River / Water Level: 0 to 100% capacity
        norm_river_level = min(100.0, features["river_capacity_pct"])
        
        # River Level Trend: Pre-mapped score 0 to 100
        norm_river_trend = min(100.0, features["river_trend_score"])
        
        # Elevation / Valley Factor: Normalized relative to 3000m max
        norm_elevation = min(100.0, (features["elevation_m"] / 3000.0) * 100.0)
        
        # Historical Flood Susceptibility: 0 to 100
        norm_hist_flood = min(100.0, features["historical_flood_susceptibility"])

        # ---------------------------------------------------------------------
        # STEP 2: Weighted Calculation
        # ---------------------------------------------------------------------
        base_score = (
            norm_rain_rate * weights["rainfall_intensity"] +
            norm_accum_rain * weights["accumulated_rainfall"] +
            norm_river_level * weights["river_water_level"] +
            norm_river_trend * weights["river_trend"] +
            norm_elevation * weights["elevation_terrain"] +
            norm_hist_flood * weights["historical_susceptibility"]
        )

        # Apply catchment terrain slope multiplier (steeper slopes accelerate flash floods)
        raw_score = base_score * features["terrain_multiplier"]
        risk_score = min(100.0, max(0.0, raw_score))
        risk_level = self.get_level(risk_score)

        # ---------------------------------------------------------------------
        # STEP 3: Confidence Score Calculation
        # ---------------------------------------------------------------------
        # High confidence (0.85-0.95) when multiple telemetry sources corroborate
        confidence = 0.88
        if features["rainfall_intensity_mm_hr"] > 50.0 and features["river_capacity_pct"] > 70.0:
            confidence = 0.94
        elif features["rainfall_intensity_mm_hr"] < 5.0 and features["river_capacity_pct"] < 40.0:
            confidence = 0.91

        # ---------------------------------------------------------------------
        # STEP 4: Contributing Factors Derivation
        # ---------------------------------------------------------------------
        factors = []
        if features["rainfall_intensity_mm_hr"] >= 60.0:
            factors.append(f"Torrential / Cloudburst rainfall intensity ({features['rainfall_intensity_mm_hr']} mm/hr)")
        elif features["rainfall_intensity_mm_hr"] >= 25.0:
            factors.append(f"Heavy rainfall intensity ({features['rainfall_intensity_mm_hr']} mm/hr)")
            
        if features["river_capacity_pct"] >= 75.0:
            factors.append(f"River channel running near critical capacity ({features['river_capacity_pct']}%)")
            
        if features["river_trend_score"] >= 75.0:
            factors.append("Rapid river-level surge detected in catchment")
            
        if features["accumulated_rainfall_mm"] >= 80.0:
            factors.append(f"High 24h rainfall accumulation ({features['accumulated_rainfall_mm']} mm)")
            
        if features["terrain_multiplier"] > 1.0:
            factors.append("Steep mountain valley terrain accelerating surface runoff")
            
        if features["historical_flood_susceptibility"] >= 50.0:
            factors.append("High historical flash flood vulnerability in sector")

        if not factors:
            factors.append("All hydrological and rainfall metrics within safe baseline parameters")

        # ---------------------------------------------------------------------
        # STEP 5: Recommended Action Selection
        # ---------------------------------------------------------------------
        actions = ACTION_RECOMMENDATIONS["flash_flood"].get(
            risk_level, ACTION_RECOMMENDATIONS["flash_flood"]["LOW"]
        )

        metadata = {
            "primary_driver": "Rainfall Intensity & Catchment Runoff" if norm_rain_rate > norm_river_level else "River Channel Saturation",
            "runoff_velocity": "High" if features["terrain_multiplier"] > 1.0 else "Moderate",
            "river_capacity_pct": features["river_capacity_pct"],
            "rainfall_rate_mm_hr": features["rainfall_intensity_mm_hr"],
            "elevation_m": features["elevation_m"]
        }

        return risk_score, risk_level, confidence, factors, actions, metadata
