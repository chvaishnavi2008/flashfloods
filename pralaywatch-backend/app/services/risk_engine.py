"""
PralayWatch Baseline Transparent Risk Engine (Phase 1)
-------------------------------------------------------
A deterministic, rule-based, and weighted mathematical model for multi-hazard
early warning (Flash Floods, Riverine Inundations, and Landslides).

IMPORTANT:
This is a transparent weighted mathematical baseline model, NOT machine learning.
All inputs are normalized to a 0–100 scale before applying domain-specific hazard weights.
"""

class RiskEngine:
    """
    Transparent Multi-Hazard Risk Evaluation Engine.
    Computes Flash Flood Risk, Landslide Risk, Overall Composite Risk, and Warning Lead Times.
    """

    # Flash Flood Weights (Must sum to 1.0)
    FLASH_FLOOD_WEIGHTS = {
        'rainfall': 0.35,
        'soil_moisture': 0.25,
        'river_level': 0.20,
        'slope': 0.10,
        'historical_risk': 0.10
    }

    # Landslide Geohazard Weights (Must sum to 1.0)
    LANDSLIDE_WEIGHTS = {
        'soil_moisture': 0.35,
        'rainfall': 0.25,
        'slope': 0.25,
        'historical_risk': 0.15
    }

    @staticmethod
    def normalize_rainfall(rainfall_val):
        """
        Normalize rainfall rate (mm/h) or 24h accumulated rainfall (mm) to 0-100 scale.
        - 0 mm/h -> 0
        - 15 mm/h (IMD Moderate) -> 25
        - 64.5 mm/h (IMD Heavy) -> 60
        - 100+ mm/h (Cloudburst threshold) -> 100
        """
        if rainfall_val is None:
            return 20.0
        val = float(rainfall_val)
        if val <= 0:
            return 0.0
        elif val >= 100.0:
            return 100.0
        elif val < 15.0:
            return (val / 15.0) * 25.0
        elif val < 65.0:
            return 25.0 + ((val - 15.0) / (65.0 - 15.0)) * 35.0
        else:
            return 60.0 + ((val - 65.0) / (100.0 - 65.0)) * 40.0

    @staticmethod
    def normalize_soil_moisture(moisture_val):
        """
        Normalize soil moisture percentage (0-100%) to 0-100 scale.
        Field saturation threshold typically begins at >75-80%.
        """
        if moisture_val is None:
            return 35.0
        val = float(moisture_val)
        return max(0.0, min(100.0, val))

    @staticmethod
    def normalize_river_level(river_level_m):
        """
        Normalize river gauge level (m) to 0-100 scale.
        - 0.0m - 1.5m (Normal seasonal flow) -> 0 - 25
        - 1.5m - 3.5m (Elevated flow) -> 25 - 50
        - 3.5m - 5.0m (Warning stage) -> 50 - 75
        - >= 6.0m (Danger / Overflow stage) -> 75 - 100
        """
        if river_level_m is None:
            return 25.0
        val = float(river_level_m)
        if val <= 0:
            return 0.0
        elif val >= 6.0:
            return 100.0
        elif val < 1.5:
            return (val / 1.5) * 25.0
        elif val < 3.5:
            return 25.0 + ((val - 1.5) / 2.0) * 25.0
        elif val < 5.0:
            return 50.0 + ((val - 3.5) / 1.5) * 25.0
        else:
            return 75.0 + ((val - 5.0) / 1.0) * 25.0

    @staticmethod
    def normalize_slope(slope_deg):
        """
        Normalize terrain slope angle in degrees (0-90°) to 0-100 scale.
        - Slopes > 25° have heightened landslide potential.
        - Slopes > 35°-45° are high to critical shear stress zones.
        """
        if slope_deg is None:
            return 30.0
        val = float(slope_deg)
        if val <= 0:
            return 0.0
        elif val >= 45.0:
            return 100.0
        elif val < 15.0:
            return (val / 15.0) * 20.0
        elif val < 30.0:
            return 20.0 + ((val - 15.0) / 15.0) * 40.0
        else:
            return 60.0 + ((val - 30.0) / 15.0) * 40.0

    @staticmethod
    def normalize_historical_risk(susceptibility_val):
        """
        Normalize location baseline susceptibility (stored as 0.0-1.0 or 0-100) to 0-100 scale.
        """
        if susceptibility_val is None:
            return 40.0
        val = float(susceptibility_val)
        if val <= 1.0:
            return val * 100.0
        return max(0.0, min(100.0, val))

    @classmethod
    def get_risk_level(cls, score):
        """
        Classify continuous numerical risk score (0-100) into standardized risk level.
        - 0–25   : LOW
        - 26–50  : MODERATE
        - 51–75  : HIGH
        - 76–100 : CRITICAL
        """
        if score <= 25.0:
            return 'LOW'
        elif score <= 50.0:
            return 'MODERATE'
        elif score <= 75.0:
            return 'HIGH'
        else:
            return 'CRITICAL'

    @classmethod
    def calculate_lead_time_minutes(cls, overall_score, risk_level):
        """
        Estimate available actionable lead time in minutes before severe impact.
        - CRITICAL : 15 - 45 minutes (Urgent immediate evacuation)
        - HIGH     : 45 - 120 minutes (Evacuate low areas, stage response)
        - MODERATE : 120 - 360 minutes (Monitor channels, prepare alert)
        - LOW      : > 360 minutes (Routine baseline monitoring)
        """
        if risk_level == 'CRITICAL':
            # Score 76 -> 45 mins, Score 100 -> 15 mins
            ratio = (overall_score - 76.0) / 24.0
            return max(15, int(45 - (ratio * 30)))
        elif risk_level == 'HIGH':
            # Score 51 -> 120 mins, Score 75 -> 45 mins
            ratio = (overall_score - 51.0) / 24.0
            return max(45, int(120 - (ratio * 75)))
        elif risk_level == 'MODERATE':
            # Score 26 -> 360 mins, Score 50 -> 120 mins
            ratio = (overall_score - 26.0) / 24.0
            return max(120, int(360 - (ratio * 240)))
        else:
            return 720  # 12 hours nominal horizon

    @classmethod
    def get_recommended_action(cls, risk_level, flash_flood_score, landslide_score):
        """
        Provide clear, actionable, life-safety guidance based on evaluated risk.
        """
        if risk_level == 'CRITICAL':
            if flash_flood_score >= landslide_score:
                return "IMMEDIATE EVACUATION: Move to designated high-ground shelters. Avoid river banks, culverts, and bridges."
            else:
                return "IMMEDIATE EVACUATION: Active slope failure hazard. Move perpendicular to slope runout away from steep hillsides."
        elif risk_level == 'HIGH':
            if flash_flood_score >= landslide_score:
                return "HIGH ALERT: Prepare for rapid evacuation. Relocate vulnerable family members to higher ground. Secure livestock."
            else:
                return "HIGH ALERT: Saturated slopes showing distress. Restrict travel on mountain roads and avoid hillside bases."
        elif risk_level == 'MODERATE':
            return "WATCH & PREPARE: Monitor local river gauges and weather telemetry. Keep emergency bags ready."
        else:
            return "NOMINAL MONITORING: All hydrological and geotechnical parameters within baseline safety limits."

    @classmethod
    def evaluate(cls, raw_inputs, location_meta=None):
        """
        Core evaluation method.
        
        Args:
            raw_inputs (dict):
                - rainfall (float, mm/h or mm)
                - soil_moisture (float, %)
                - river_level (float, m)
                - slope (float, optional deg)
                - flood_susceptibility (float, optional 0-1)
                - landslide_susceptibility (float, optional 0-1)
            location_meta (dict or Location object, optional):
                Fallback for slope and susceptibility indices.

        Returns:
            dict: Comprehensive structured risk assessment payload.
        """
        # Extract and fallback values
        slope_raw = raw_inputs.get('slope')
        if slope_raw is None and location_meta:
            slope_raw = getattr(location_meta, 'slope', None) if not isinstance(location_meta, dict) else location_meta.get('slope')
        
        flood_susc_raw = raw_inputs.get('flood_susceptibility')
        if flood_susc_raw is None and location_meta:
            flood_susc_raw = getattr(location_meta, 'flood_susceptibility', None) if not isinstance(location_meta, dict) else location_meta.get('flood_susceptibility')

        landslide_susc_raw = raw_inputs.get('landslide_susceptibility')
        if landslide_susc_raw is None and location_meta:
            landslide_susc_raw = getattr(location_meta, 'landslide_susceptibility', None) if not isinstance(location_meta, dict) else location_meta.get('landslide_susceptibility')

        # 1. Normalize All Inputs to 0–100 scale
        norm_rainfall = cls.normalize_rainfall(raw_inputs.get('rainfall'))
        norm_soil = cls.normalize_soil_moisture(raw_inputs.get('soil_moisture'))
        norm_river = cls.normalize_river_level(raw_inputs.get('river_level'))
        norm_slope = cls.normalize_slope(slope_raw)
        norm_flood_susc = cls.normalize_historical_risk(flood_susc_raw)
        norm_landslide_susc = cls.normalize_historical_risk(landslide_susc_raw)

        # 2. Compute Flash Flood Score (Weighted Sum)
        w_ff = cls.FLASH_FLOOD_WEIGHTS
        flash_flood_score = (
            norm_rainfall * w_ff['rainfall'] +
            norm_soil * w_ff['soil_moisture'] +
            norm_river * w_ff['river_level'] +
            norm_slope * w_ff['slope'] +
            norm_flood_susc * w_ff['historical_risk']
        )
        flash_flood_score = max(0.0, min(100.0, flash_flood_score))

        # 3. Compute Landslide Score (Weighted Sum)
        w_ls = cls.LANDSLIDE_WEIGHTS
        landslide_score = (
            norm_soil * w_ls['soil_moisture'] +
            norm_rainfall * w_ls['rainfall'] +
            norm_slope * w_ls['slope'] +
            norm_landslide_susc * w_ls['historical_risk']
        )
        landslide_score = max(0.0, min(100.0, landslide_score))

        # 4. Compute Composite Overall Score (Peak hazard weighted at 75%, secondary at 25%)
        peak_score = max(flash_flood_score, landslide_score)
        secondary_score = min(flash_flood_score, landslide_score)
        overall_score = (peak_score * 0.75) + (secondary_score * 0.25)
        overall_score = max(0.0, min(100.0, overall_score))

        # 5. Determine Severity Level & Lead Time
        risk_level = cls.get_risk_level(overall_score)
        lead_time = cls.calculate_lead_time_minutes(overall_score, risk_level)
        action_text = cls.get_recommended_action(risk_level, flash_flood_score, landslide_score)

        # 6. Extract Top Contributing Factors
        factors = []
        if norm_rainfall >= 60.0:
            factors.append(f"Torrential Rainfall Intensity ({raw_inputs.get('rainfall', 0)} mm/h, Norm: {round(norm_rainfall, 1)})")
        if norm_soil >= 75.0:
            factors.append(f"Severe Soil Pore Pressure Saturation ({raw_inputs.get('soil_moisture', 0)}%, Norm: {round(norm_soil, 1)})")
        if norm_river >= 65.0:
            factors.append(f"High River Stage ({raw_inputs.get('river_level', 0)}m, Norm: {round(norm_river, 1)})")
        if norm_slope >= 65.0:
            factors.append(f"Steep Unstable Terrain Gradient ({slope_raw or 0}°, Norm: {round(norm_slope, 1)})")
        if not factors:
            factors.append("Nominal environmental conditions across all sensor parameters.")

        return {
            'flash_flood_score': round(flash_flood_score, 2),
            'landslide_score': round(landslide_score, 2),
            'overall_score': round(overall_score, 2),
            'risk_level': risk_level,
            'lead_time_minutes': lead_time,
            'dominant_hazard': 'flash_flood' if flash_flood_score >= landslide_score else 'landslide',
            'recommended_action': action_text,
            'contributing_factors': factors,
            'normalized_inputs': {
                'rainfall': round(norm_rainfall, 2),
                'soil_moisture': round(norm_soil, 2),
                'river_level': round(norm_river, 2),
                'slope': round(norm_slope, 2),
                'flood_susceptibility': round(norm_flood_susc, 2),
                'landslide_susceptibility': round(norm_landslide_susc, 2)
            },
            'raw_inputs': {
                'rainfall': raw_inputs.get('rainfall'),
                'soil_moisture': raw_inputs.get('soil_moisture'),
                'river_level': raw_inputs.get('river_level'),
                'slope': slope_raw,
                'flood_susceptibility': flood_susc_raw,
                'landslide_susceptibility': landslide_susc_raw
            },
            'model_info': {
                'type': 'Weighted Baseline Multi-Hazard Formula',
                'phase': 1,
                'is_demo_seed': True
            }
        }
