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
    def get_intensity_label(rate_mm_hr: Optional[float]) -> str:
        if rate_mm_hr is None:
            return "Unavailable"
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
        Queries Open-Meteo Forecast API for current and hourly weather parameters.
        Returns normalized dictionary with real weather telemetry.
        """
        try:
            url = (
                f"{cls.OPEN_METEO_BASE_URL}?latitude={lat}&longitude={lng}"
                "&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,weather_code,wind_speed_10m"
                "&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,showers,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,wind_speed_10m,weather_code"
                "&forecast_days=2&timezone=auto"
            )
            req = urllib.request.Request(url, headers={"User-Agent": "PralayWatch/1.0"})
            with urllib.request.urlopen(req, timeout=8) as response:
                data = json.loads(response.read().decode("utf-8"))
                
                current = data.get("current", {})
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])
                
                curr_time = current.get("time", "")
                curr_prefix = curr_time[:13]
                curr_idx = -1
                for i, t in enumerate(times):
                    if t.startswith(curr_prefix):
                        curr_idx = i
                        break
                if curr_idx < 0:
                    curr_idx = 0
                    
                # Read current precipitation, rain, showers (Do NOT convert null to 0)
                raw_precip = current.get("precipitation")
                raw_rain = current.get("rain")
                raw_showers = current.get("showers")
                
                field_read = None
                if raw_precip is not None:
                    precip_val = float(raw_precip)
                    field_read = "current.precipitation"
                elif raw_rain is not None or raw_showers is not None:
                    precip_val = float(raw_rain or 0.0) + float(raw_showers or 0.0)
                    field_read = "current.rain + current.showers"
                elif curr_idx >= 0 and curr_idx < len(hourly.get("precipitation", [])) and hourly.get("precipitation")[curr_idx] is not None:
                    precip_val = float(hourly.get("precipitation")[curr_idx])
                    field_read = f"hourly.precipitation[{curr_idx}]"
                elif curr_idx >= 0 and (hourly.get("rain", [None])[curr_idx] is not None or hourly.get("showers", [None])[curr_idx] is not None):
                    precip_val = float(hourly.get("rain", [0])[curr_idx] or 0.0) + float(hourly.get("showers", [0])[curr_idx] or 0.0)
                    field_read = f"hourly.rain[{curr_idx}] + hourly.showers[{curr_idx}]"
                else:
                    precip_val = None
                    field_read = "None (Unavailable)"
                    
                # 24h accumulation starting from matched current hour
                hourly_precip = hourly.get("precipitation", [])[curr_idx:curr_idx+24]
                valid_precip = [float(p) for p in hourly_precip if p is not None]
                accum_24h = round(sum(valid_precip), 1) if valid_precip else None
                
                # Soil moisture
                sm_list = hourly.get("soil_moisture_0_to_1cm", [])
                sm_val = float(sm_list[curr_idx]) if sm_list and curr_idx < len(sm_list) and sm_list[curr_idx] is not None else 0.30
                soil_sat_pct = min(100.0, max(0.0, (sm_val / 0.48) * 100.0))
                
                temp = float(current.get("temperature_2m", 20.0)) if current.get("temperature_2m") is not None else None
                wind = float(current.get("wind_speed_10m", 5.0)) if current.get("wind_speed_10m") is not None else None
                
                return {
                    "success": True,
                    "rainfall_rate": round(precip_val, 1) if precip_val is not None else None,
                    "rainfall_display": f"{round(precip_val, 1)} mm/hr" if precip_val is not None else "Unavailable",
                    "rainfall_mm": accum_24h,
                    "rainfall_intensity": cls.get_intensity_label(precip_val),
                    "soil_saturation_pct": round(soil_sat_pct, 1),
                    "temperature_c": round(temp, 1) if temp is not None else None,
                    "wind_speed_kmh": round(wind, 1) if wind is not None else None,
                    "is_live_data": True,
                    "request_url": url,
                    "field_read": field_read,
                    "matched_hourly_index": curr_idx,
                    "matched_hourly_time": times[curr_idx] if curr_idx < len(times) else None
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
