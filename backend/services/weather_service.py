# OPEN-METEO API
# No API key is required for this prototype.
# Weather data is fetched using latitude and longitude.

import urllib.request
import json
from typing import Dict, Any, Optional

class WeatherService:
    """
    Weather & Precipitation telemetry service.
    Fetches real-time observations and forecasts from Open-Meteo Forecast API.
    """
    
    OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def get_intensity_label(rate_mm_hr: float) -> str:
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

    @classmethod
    def fetch_live_weather(cls, lat: float, lng: float) -> Dict[str, Any]:
        """
        Queries Open-Meteo Forecast API for hourly weather parameters.
        Returns normalized dictionary with real weather telemetry.
        """
        try:
            url = (
                f"{cls.OPEN_METEO_BASE_URL}?latitude={lat}&longitude={lng}"
                "&hourly=temperature_2m,precipitation,rain,showers,soil_moisture_0_to_1cm,wind_speed_10m"
                "&current=temperature_2m,precipitation,rain,showers,wind_speed_10m"
                "&forecast_days=2&timezone=auto"
            )
            req = urllib.request.Request(url, headers={"User-Agent": "PralayWatch/1.0"})
            with urllib.request.urlopen(req, timeout=8) as response:
                data = json.loads(response.read().decode("utf-8"))
                
                current = data.get("current", {})
                hourly = data.get("hourly", {})
                
                precip = float(current.get("precipitation", 0.0))
                rain = float(current.get("rain", 0.0))
                temp = float(current.get("temperature_2m", 20.0))
                wind = float(current.get("wind_speed_10m", 5.0))
                
                # 24h accumulation
                hourly_precip = hourly.get("precipitation", [])[:24]
                accum_24h = sum(float(p) for p in hourly_precip if p is not None)
                
                # Soil moisture m3/m3
                sm_list = hourly.get("soil_moisture_0_to_1cm", [])
                sm_val = float(sm_list[0]) if sm_list and sm_list[0] is not None else 0.30
                soil_sat_pct = min(100.0, max(0.0, (sm_val / 0.48) * 100.0))
                
                return {
                    "success": True,
                    "rainfall_rate": round(precip, 1),
                    "rainfall_mm": round(accum_24h, 1),
                    "rainfall_intensity": cls.get_intensity_label(precip),
                    "soil_saturation_pct": round(soil_sat_pct, 1),
                    "temperature_c": round(temp, 1),
                    "wind_speed_kmh": round(wind, 1),
                    "is_live_data": True
                }
        except Exception as e:
            print(f"[WeatherService] Open-Meteo fetch error: {e}")
            return {
                "success": False,
                "error": "Live weather data temporarily unavailable.",
                "is_live_data": False
            }

    @staticmethod
    def simulate_heavy_downpour(env_data):
        env_data.rainfall_rate = 145.0
        env_data.rainfall_mm += 115.0
        env_data.rainfall_intensity = "Cloudburst / Torrential"
        env_data.rainfall_forecast_trend = "Peaking"
        return env_data
