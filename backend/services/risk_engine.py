import json
from config import Config

class PrototypeRiskAssessmentEngine:
    """
    Prototype Risk Assessment Engine for PralayWatch.
    Modular multi-hazard intelligence engine assessing:
    - Flash Flood Risk
    - Riverine Flood Risk
    - Landslide / Land Risk
    - Heavy Rainfall Risk
    
    Uses multi-criteria environmental telemetry weighting.
    Can be seamlessly swapped with an operational ML/Hydrological model in Phase 2.
    """
    
    @staticmethod
    def get_level(score):
        """Map 0-100 score to configurable categorical risk levels."""
        thresholds = Config.RISK_THRESHOLDS
        if score >= thresholds["CRITICAL"][0]:
            return "CRITICAL"
        elif score >= thresholds["HIGH"][0]:
            return "HIGH"
        elif score >= thresholds["MODERATE"][0]:
            return "MODERATE"
        else:
            return "LOW"
            
    @classmethod
    def calculate_flash_flood_risk(cls, env_data, location):
        """
        Flash flood risk is sensitive to sudden rainfall intensity,
        river gauge capacity %, soil saturation, and steep catchment basins.
        """
        # Rainfall rate factor (0 - 150 mm/hr) -> normalized to 0 - 100
        rain_rate_factor = min(100.0, (env_data.rainfall_rate / 120.0) * 100.0)
        
        # River capacity (0 - 100%)
        river_factor = min(100.0, env_data.river_capacity_pct)
        
        # Soil saturation (0 - 100%)
        soil_factor = min(100.0, env_data.soil_saturation_pct)
        
        # Mountainous terrain runoff acceleration (higher in steep valleys)
        terrain_multiplier = 1.15 if "Mountain" in location.terrain_type or "Valley" in location.terrain_type else 1.0
        
        weights = Config.RISK_WEIGHTS["flash_flood"]
        raw_score = (
            rain_rate_factor * weights["rainfall_intensity"] +
            river_factor * weights["river_capacity"] +
            soil_factor * weights["soil_saturation"] +
            20.0 * weights["historical_factor"]
        ) * terrain_multiplier
        
        score = min(100.0, max(0.0, raw_score))
        return round(score, 1), cls.get_level(score)

    @classmethod
    def calculate_flood_risk(cls, env_data, location):
        """
        Riverine flood risk is governed by accumulated rainfall,
        sustained river levels, and low drainage catchment.
        """
        accum_factor = min(100.0, (env_data.rainfall_mm / 250.0) * 100.0)
        river_factor = min(100.0, env_data.river_capacity_pct)
        
        weights = Config.RISK_WEIGHTS["flood"]
        raw_score = (
            river_factor * weights["river_capacity"] +
            accum_factor * weights["rainfall_accumulation"] +
            (10.0 if "Valley" in location.terrain_type else 5.0) +
            15.0 * weights["historical_factor"]
        )
        
        score = min(100.0, max(0.0, raw_score))
        return round(score, 1), cls.get_level(score)

    @classmethod
    def calculate_landslide_risk(cls, env_data, location):
        """
        Landslide risk depends heavily on soil moisture saturation,
        slope angle (> 25° has elevated risk), and ongoing rainfall.
        """
        soil_factor = min(100.0, env_data.soil_saturation_pct)
        
        # Slope factor: 0° -> 0, 45°+ -> 100
        slope_factor = min(100.0, (env_data.slope_deg / 45.0) * 100.0)
        
        rain_rate_factor = min(100.0, (env_data.rainfall_rate / 100.0) * 100.0)
        
        weights = Config.RISK_WEIGHTS["landslide"]
        raw_score = (
            soil_factor * weights["soil_saturation"] +
            slope_factor * weights["slope_steepness"] +
            rain_rate_factor * weights["rainfall_intensity"] +
            15.0 * weights["historical_factor"]
        )
        
        # If soil is nearly saturated (>85%) and slope is steep (>30°), compound risk
        if env_data.soil_saturation_pct > 80.0 and env_data.slope_deg > 30.0:
            raw_score *= 1.2
            
        score = min(100.0, max(0.0, raw_score))
        return round(score, 1), cls.get_level(score)

    @classmethod
    def calculate_heavy_rainfall_risk(cls, env_data, location):
        """
        Heavy rainfall risk assessment based on precipitation intensity
        and short-term forecast trend.
        """
        # 0 to 150 mm/hr
        rain_rate_factor = min(100.0, (env_data.rainfall_rate / 100.0) * 100.0)
        
        trend_factor = 90.0 if env_data.rainfall_forecast_trend == "Rising" else (
            100.0 if env_data.rainfall_forecast_trend == "Peaking" else 40.0
        )
        
        weights = Config.RISK_WEIGHTS["heavy_rainfall"]
        raw_score = (
            rain_rate_factor * weights["rainfall_rate"] +
            trend_factor * weights["trend_forecast"]
        )
        
        score = min(100.0, max(0.0, raw_score))
        return round(score, 1), cls.get_level(score)

    @classmethod
    def evaluate_composite_risk(cls, env_data, location):
        """
        Compute full risk assessment profile across all 4 hazards,
        identify contributing factors, estimate lead time, and formulate advice.
        """
        ff_score, ff_lvl = cls.calculate_flash_flood_risk(env_data, location)
        fl_score, fl_lvl = cls.calculate_flood_risk(env_data, location)
        ls_score, ls_lvl = cls.calculate_landslide_risk(env_data, location)
        hr_score, hr_lvl = cls.calculate_heavy_rainfall_risk(env_data, location)
        
        # Composite score takes the peak severity with weighted support from co-occurring hazards
        scores = [ff_score, fl_score, ls_score, hr_score]
        max_score = max(scores)
        avg_score = sum(scores) / len(scores)
        
        # Multi-hazard cascading penalty if multiple hazards are elevated
        elevated_count = sum(1 for s in scores if s >= 50.0)
        cascading_penalty = elevated_count * 4.0
        
        overall_score = min(100.0, max_score * 0.70 + avg_score * 0.30 + cascading_penalty)
        overall_level = cls.get_level(overall_score)
        
        # Contributing factors list
        factors = []
        if env_data.rainfall_rate >= 50.0:
            factors.append(f"Heavy precipitation rate ({env_data.rainfall_rate} mm/hr)")
        elif env_data.rainfall_rate >= 20.0:
            factors.append(f"Moderate rainfall ({env_data.rainfall_rate} mm/hr)")
            
        if env_data.soil_saturation_pct >= 75.0:
            factors.append(f"Severely saturated soil ({env_data.soil_saturation_pct}%) reducing absorption")
        elif env_data.soil_saturation_pct >= 55.0:
            factors.append(f"Elevated soil moisture ({env_data.soil_saturation_pct}%)")
            
        if env_data.river_capacity_pct >= 75.0:
            factors.append(f"River gauge exceeding danger mark ({env_data.river_capacity_pct}% capacity)")
        elif env_data.river_capacity_pct >= 50.0:
            factors.append(f"Rising river tributary water levels ({env_data.river_capacity_pct}%)")
            
        if env_data.slope_deg >= 30.0 and env_data.soil_saturation_pct >= 65.0:
            factors.append(f"Steep slope geometry ({env_data.slope_deg}°) under high hydraulic load")
            
        if not factors:
            factors.append("Environmental metrics within nominal baseline limits")
            factors.append("Stable atmospheric and watershed conditions")
            
        # Lead time calculation (minutes)
        if overall_level == "CRITICAL":
            lead_time = max(15, int(45 - (overall_score - 75) * 0.8))
        elif overall_level == "HIGH":
            lead_time = max(45, int(120 - (overall_score - 50) * 2.0))
        elif overall_level == "MODERATE":
            lead_time = 180
        else:
            lead_time = 360
            
        # Recommended action
        if overall_level == "CRITICAL":
            recommended_action = "IMMEDIATE EVACUATION: Move toward designated safe zones or high ground. Avoid river banks and steep slopes."
        elif overall_level == "HIGH":
            recommended_action = "HIGH ALERT: Prepare emergency go-bags, monitor local alerts, and stay ready to evacuate to nearby shelters."
        elif overall_level == "MODERATE":
            recommended_action = "WATCH STATUS: Stay informed, avoid low-lying culverts and vulnerable mountain roads."
        else:
            recommended_action = "NORMAL MONITORING: Weather and environmental conditions are within safe operational limits."

        return {
            "overall_score": round(overall_score, 1),
            "overall_level": overall_level,
            "flash_flood_score": ff_score,
            "flash_flood_level": ff_lvl,
            "flood_score": fl_score,
            "flood_level": fl_lvl,
            "landslide_score": ls_score,
            "landslide_level": ls_lvl,
            "heavy_rainfall_score": hr_score,
            "heavy_rainfall_level": hr_lvl,
            "lead_time_minutes": lead_time,
            "contributing_factors": json.dumps(factors),
            "recommended_action": recommended_action
        }
