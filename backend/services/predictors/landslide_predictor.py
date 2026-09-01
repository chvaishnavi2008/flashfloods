from typing import Dict, Any, Tuple, List
from config import Config
from risk_config import (
    NORMALIZATION_BOUNDS, 
    ACTION_RECOMMENDATIONS, 
    get_risk_level_from_score
)
from services.predictors.base_predictor import BaseHazardPredictor

class LandslidePredictor(BaseHazardPredictor):
    """
    Priority 2: Landslide / Geohazard Risk Predictor.
    
    Evaluates:
    - Rainfall intensity (dynamic infiltration rate trigger in mm/hr)
    - Accumulated rainfall (antecedent moisture soaking over 24h in mm)
    - Slope angle (slope steepness in degrees)
    - Elevation (high mountain freeze-thaw / pore-water elevation factor)
    - Soil susceptibility / saturation (% pore-water moisture)
    - Historical landslide susceptibility (GSI landslide hazard zonation score)
    
    Calculation:
    1. Normalizes all raw geotechnical and rainfall inputs to 0-100 scales.
    2. Computes weighted baseline score based on configured weights.
    3. Applies non-linear compound factor if slope > 30° AND soil saturation > 75%
       (the critical geotechnical limit equilibrium shear failure threshold).
    4. Categorizes into LOW (0-25), MODERATE (26-50), HIGH (51-75), CRITICAL (76-100).
    5. Extracts specific contributing factors and actionable directives.
    """
    
    def __init__(self):
        super().__init__(hazard_name="Landslide", priority_rank=2, hazard_key="landslide")

    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        # 1. Soil susceptibility / Saturation (% moisture)
        soil_susceptibility = float(self.get_val(env_data, 'soil_saturation_pct', self.get_val(env_data, 'soil_susceptibility', 45.0)))
        
        # 2. Slope angle (degrees)
        slope = float(self.get_val(env_data, 'slope_deg', self.get_val(location, 'slope', 32.0)))
        
        # 3. Rainfall intensity (mm/hr)
        rainfall_intensity = float(self.get_val(env_data, 'rainfall_rate', self.get_val(env_data, 'rainfall_intensity_val', 5.0)))
        
        # 4. Accumulated rainfall (mm in 24h)
        accumulated_rainfall = float(self.get_val(env_data, 'rainfall_mm', self.get_val(env_data, 'accumulated_rainfall', 25.0)))
        
        # 5. Elevation (meters)
        elevation = float(self.get_val(location, 'elevation', 1500.0))
        
        # 6. Historical landslide susceptibility
        is_vulnerable = bool(self.get_val(location, 'is_vulnerable', True))
        historical_landslide_risk = float(self.get_val(location, 'historical_landslide_risk', 60.0 if is_vulnerable else 15.0))

        return {
            "soil_susceptibility_pct": soil_susceptibility,
            "slope_deg": slope,
            "rainfall_intensity_mm_hr": rainfall_intensity,
            "accumulated_rainfall_mm": accumulated_rainfall,
            "elevation_m": elevation,
            "historical_landslide_susceptibility": historical_landslide_risk
        }

    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, float, List[str], List[str], Dict[str, Any]]:
        features = self.extract_features(env_data, location)
        bounds = NORMALIZATION_BOUNDS
        weights = Config.RISK_WEIGHTS["landslide"]

        # ---------------------------------------------------------------------
        # STEP 1: Input Normalization (0 to 100)
        # ---------------------------------------------------------------------
        # Soil Susceptibility / Saturation: 0 to 100%
        norm_soil = min(100.0, features["soil_susceptibility_pct"])
        
        # Slope Angle: 0 to 45°+ (45° = 100% normalization)
        norm_slope = min(100.0, (features["slope_deg"] / bounds["slope_max_deg"]) * 100.0)
        
        # Rainfall Intensity: 0 to 120 mm/hr
        norm_rain_rate = min(100.0, (features["rainfall_intensity_mm_hr"] / bounds["rainfall_rate_max_mm_hr"]) * 100.0)
        
        # Accumulated Rainfall: 0 to 250 mm
        norm_accum_rain = min(100.0, (features["accumulated_rainfall_mm"] / bounds["rainfall_accum_max_mm"]) * 100.0)
        
        # Elevation: 0 to 3000m
        norm_elevation = min(100.0, (features["elevation_m"] / 3000.0) * 100.0)
        
        # Historical Landslide Susceptibility: 0 to 100
        norm_hist_landslide = min(100.0, features["historical_landslide_susceptibility"])

        # ---------------------------------------------------------------------
        # STEP 2: Weighted Calculation
        # ---------------------------------------------------------------------
        base_score = (
            norm_soil * weights["soil_susceptibility"] +
            norm_slope * weights["slope"] +
            norm_rain_rate * weights["rainfall_intensity"] +
            norm_accum_rain * weights["accumulated_rainfall"] +
            norm_elevation * weights["elevation"] +
            norm_hist_landslide * weights["historical_susceptibility"]
        )

        # Non-linear geotechnical compound amplification:
        # When soil pore-pressure is saturated (>75%) on steep slopes (>30°), shear strength drops exponentially
        if features["soil_susceptibility_pct"] >= 75.0 and features["slope_deg"] >= 30.0:
            compounding_factor = 1.25
        elif features["soil_susceptibility_pct"] >= 60.0 and features["slope_deg"] >= 25.0:
            compounding_factor = 1.10
        else:
            compounding_factor = 1.0

        raw_score = base_score * compounding_factor
        risk_score = min(100.0, max(0.0, raw_score))
        risk_level = self.get_level(risk_score)

        # ---------------------------------------------------------------------
        # STEP 3: Confidence Score Calculation
        # ---------------------------------------------------------------------
        confidence = 0.86
        if features["soil_susceptibility_pct"] >= 80.0 and features["slope_deg"] >= 30.0 and features["rainfall_intensity_mm_hr"] >= 30.0:
            confidence = 0.93
        elif features["soil_susceptibility_pct"] <= 35.0 and features["slope_deg"] <= 15.0:
            confidence = 0.90

        # ---------------------------------------------------------------------
        # STEP 4: Contributing Factors Derivation
        # ---------------------------------------------------------------------
        factors = []
        if features["soil_susceptibility_pct"] >= 75.0:
            factors.append(f"Near-complete soil moisture saturation ({features['soil_susceptibility_pct']}%) reducing shear resistance")
        elif features["soil_susceptibility_pct"] >= 55.0:
            factors.append(f"Elevated soil pore-water saturation ({features['soil_susceptibility_pct']}%)")
            
        if features["slope_deg"] >= 32.0:
            factors.append(f"Steep terrain slope angle ({features['slope_deg']}°) susceptible to gravitational shear failure")
            
        if features["rainfall_intensity_mm_hr"] >= 40.0:
            factors.append(f"Intense precipitation rate ({features['rainfall_intensity_mm_hr']} mm/hr) accelerating hydraulic loading")
            
        if features["accumulated_rainfall_mm"] >= 70.0:
            factors.append(f"Heavy antecedent rainfall accumulation ({features['accumulated_rainfall_mm']} mm)")
            
        if features["historical_landslide_susceptibility"] >= 50.0:
            factors.append("High historical landslide hazard zonation in sector")

        if not factors:
            factors.append("Geotechnical and hillslope moisture readings within safe baseline ranges")

        # ---------------------------------------------------------------------
        # STEP 5: Recommended Action Selection
        # ---------------------------------------------------------------------
        actions = ACTION_RECOMMENDATIONS["landslide"].get(
            risk_level, ACTION_RECOMMENDATIONS["landslide"]["LOW"]
        )

        metadata = {
            "slope_stability_status": "Critical / Imminent Slip" if risk_score >= 76.0 else ("Unstable" if risk_score >= 51.0 else "Stable"),
            "pore_water_pressure_index": round(features["soil_susceptibility_pct"] / 100.0, 2),
            "debris_flow_probability": "High" if risk_score >= 65.0 else "Low",
            "slope_deg": features["slope_deg"],
            "soil_saturation_pct": features["soil_susceptibility_pct"]
        }

        return risk_score, risk_level, confidence, factors, actions, metadata
