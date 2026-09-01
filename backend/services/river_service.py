class RiverService:
    """
    Hydrological and River Gauge monitoring service.
    Handles river water levels, gauge discharge rates, and basin capacity.
    """
    
    @staticmethod
    def get_river_trend_label(capacity_pct):
        if capacity_pct >= 90:
            return "Overflowing / Critical Breach"
        elif capacity_pct >= 75:
            return "Rising Rapidly"
        elif capacity_pct >= 55:
            return "Rising"
        elif capacity_pct >= 35:
            return "Normal"
        else:
            return "Receding"

    @staticmethod
    def simulate_river_surge(env_data):
        env_data.river_level_m = 6.8
        env_data.river_capacity_pct = 94.0
        env_data.river_trend = "Rising Rapidly"
        return env_data
