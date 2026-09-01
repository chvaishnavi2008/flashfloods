from typing import Dict, Any, Tuple, List
from config import Config
from risk_config import (
    NORMALIZATION_BOUNDS, 
    RAINFALL_TREND_SCORES, 
    ACTION_RECOMMENDATIONS, 
    get_risk_level_from_score
)
from services.predictors.base_predictor import BaseHazardPredictor

class ExtremeRainfallPredictor(BaseHazardPredictor):
    """
    Priority 3: Extreme Rainfall & Cloudburst Risk Predictor.
    
    Evaluates:
    - Rainfall intensity (current precipitation rate in mm/hr)
    - Rainfall accumulation (24h antecedent rainfall volume in mm)
    - Forecast rainfall (IMD Doppler nowcast trend & 6h forecast volume in mm)
    - Duration (estimated/observed storm duration in hours)
    
    Calculation:
    1. Normalizes all raw meteorological inputs to 0-100 scales.
    2. Computes weighted composite score based on configured weights.
    3. Categorizes into LOW (0-25), MODERATE (26-50), HIGH (51-75), CRITICAL (76-100).
    4. Extracts specific contributing factors and actionable directives.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Extreme Rainfall", priority_rank=3, hazard_key="heavy_rainfall")

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        # 1. Rainfall intensity (mm/hr)
        rainfall_intensity = float(self.get_val(env_data, 'rainfall_rate', self.get_val(env_data, 'rainfall_intensity_val', 5.0)))
        
        # 2. Rainfall accumulation (mm in 24h)
        rainfall_accumulation = float(self.get_val(env_data, 'rainfall_mm', self.get_val(env_data, 'accumulated_rainfall', 25.0)))
        
        # 3. Forecast rainfall & Trend
        trend_str = str(self.get_val(env_data, 'rainfall_forecast_trend', 'Stable'))
        forecast_trend_score = RAINFALL_TREND_SCORES.get(trend_str, 35.0)
        forecast_rainfall_mm = float(self.get_val(env_data, 'forecast_rainfall_mm', 0.0))
        if forecast_rainfall_mm > 0:
            forecast_score = min(100.0, (forecast_rainfall_mm / NORMALIZATION_BOUNDS["rainfall_forecast_max_mm"]) * 100.0)
        else:
            forecast_score = forecast_trend_score
            
        # 4. Duration (hours)
        duration_hours = float(self.get_val(env_data, 'duration_hours', self.get_val(env_data, 'storm_duration_hours', 2.0)))

        return {
            "rainfall_intensity_mm_hr": rainfall_intensity,
            "rainfall_accumulation_mm": rainfall_accumulation,
            "forecast_rainfall_score": forecast_score,
            "duration_hours": duration_hours,
            "forecast_trend_str": trend_str
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, float, List[str], List[str], Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        bounds = NORMALIZATION_BOUNDS
        weights = Config.RISK_WEIGHTS["extreme_rainfall"]

        # ---------------------------------------------------------------------
        # STEP 1: Input Normalization (0 to 100)
        # ---------------------------------------------------------------------
        # Rainfall Intensity: 0 to 120 mm/hr (120+ mm/hr = 100 Cloudburst scale)
        norm_rain_intensity = min(100.0, (features["rainfall_intensity_mm_hr"] / bounds["rainfall_rate_max_mm_hr"]) * 100.0)
        
        # Rainfall Accumulation: 0 to 250 mm in 24h
        norm_rain_accum = min(100.0, (features["rainfall_accumulation_mm"] / bounds["rainfall_accum_max_mm"]) * 100.0)
        
        # Forecast Rainfall / Trend: 0 to 100
        norm_forecast = min(100.0, features["forecast_rainfall_score"])
        
        # Duration: 0 to 12 hours
        norm_duration = min(100.0, (features["duration_hours"] / bounds["duration_max_hours"]) * 100.0)

        # ---------------------------------------------------------------------
        # STEP 2: Weighted Calculation
        # ---------------------------------------------------------------------
        raw_score = (
            norm_rain_intensity * weights["rainfall_intensity"] +
            norm_rain_accum * weights["rainfall_accumulation"] +
            norm_forecast * weights["forecast_rainfall"] +
            norm_duration * weights["duration"]
        )

        risk_score = min(100.0, max(0.0, raw_score))
        risk_level = self.get_level(risk_score)

        # ---------------------------------------------------------------------
        # STEP 3: Confidence Score Calculation
        # ---------------------------------------------------------------------
        confidence = 0.90
        if features["rainfall_intensity_mm_hr"] >= 80.0:
            confidence = 0.95
        elif features["rainfall_intensity_mm_hr"] <= 5.0:
            confidence = 0.92

        # ---------------------------------------------------------------------
        # STEP 4: Contributing Factors Derivation
        # ---------------------------------------------------------------------
        factors = []
        if features["rainfall_intensity_mm_hr"] >= 80.0:
            factors.append(f"Cloudburst / Torrential precipitation rate ({features['rainfall_intensity_mm_hr']} mm/hr)")
        elif features["rainfall_intensity_mm_hr"] >= 35.0:
            factors.append(f"Heavy rainfall intensity ({features['rainfall_intensity_mm_hr']} mm/hr)")
            
        if features["rainfall_accumulation_mm"] >= 100.0:
            factors.append(f"Extreme 24-hour rainfall accumulation ({features['rainfall_accumulation_mm']} mm)")
            
        if features["forecast_trend_str"] in ["Peaking", "Rising", "Rising Rapidly"]:
            factors.append(f"Doppler nowcast forecast trend: {features['forecast_trend_str']}")
            
        if features["duration_hours"] >= 4.0:
            factors.append(f"Sustained heavy downpour duration ({features['duration_hours']} hours)")

        if not factors:
            factors.append("Atmospheric and rainfall measurements within normal seasonal baseline")

        # ---------------------------------------------------------------------
        # STEP 5: Recommended Action Selection
        # ---------------------------------------------------------------------
        actions = ACTION_RECOMMENDATIONS["extreme_rainfall"].get(
            risk_level, ACTION_RECOMMENDATIONS["extreme_rainfall"]["LOW"]
        )

        metadata = {
            "intensity_classification": "Cloudburst" if features["rainfall_intensity_mm_hr"] >= 100.0 else (
                "Heavy Rainfall" if features["rainfall_intensity_mm_hr"] >= 50.0 else "Moderate"
            ),
            "cloudburst_risk": features["rainfall_intensity_mm_hr"] >= 80.0,
            "accumulated_24h_mm": features["rainfall_accumulation_mm"],
            "current_rate_mm_hr": features["rainfall_intensity_mm_hr"]
        }

        return risk_score, risk_level, confidence, factors, actions, metadata
