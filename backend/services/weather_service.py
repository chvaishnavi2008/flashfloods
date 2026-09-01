class WeatherService:
    """
    Weather & Precipitation telemetry service.
    Handles simulated real-time rainfall observations and forecasts.
    """
    
    @staticmethod
    def get_intensity_label(rate_mm_hr):
        if rate_mm_hr >= 100:
            return "Cloudburst / Torrential"
        elif rate_mm_hr >= 50:
            return "Extremely Heavy"
        elif rate_mm_hr >= 30:
            return "Heavy"
        elif rate_mm_hr >= 10:
            return "Moderate"
        else:
            return "Light"

    @staticmethod
    def simulate_heavy_downpour(env_data):
        env_data.rainfall_rate = 145.0
        env_data.rainfall_mm += 115.0
        env_data.rainfall_intensity = "Cloudburst / Torrential"
        env_data.rainfall_forecast_trend = "Peaking"
        return env_data
