class TerrainService:
    """
    Terrain and Geotechnical telemetry service.
    Handles slope geometry, soil moisture saturation, and structural displacement.
    """
    
    @staticmethod
    def get_stability_status(soil_pct, slope_deg):
        if soil_pct >= 85 and slope_deg >= 28:
            return "Critical / Imminent Slip"
        elif soil_pct >= 65 and slope_deg >= 22:
            return "High Risk of Failure"
        elif soil_pct >= 50:
            return "Moderate Risk"
        else:
            return "Stable"

    @staticmethod
    def simulate_soil_saturation(env_data):
        env_data.soil_saturation_pct = 92.0
        env_data.slope_stability = "Critical / Imminent Slip"
        return env_data
