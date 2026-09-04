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
                "&past_hours=24&forecast_days=2&timezone=auto"
            )
            req = urllib.request.Request(url, headers={"User-Agent": "AapdaSetu/1.0"})
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
                    
                # Read current rain and precipitation (Do NOT convert null to 0)
                raw_precip = current.get("precipitation")
                raw_rain = current.get("rain")
                raw_showers = current.get("showers")
                
                rain_val = float(raw_rain) if raw_rain is not None else (float(hourly.get("rain", [None])[curr_idx]) if curr_idx < len(hourly.get("rain", [])) and hourly.get("rain", [])[curr_idx] is not None else None)
                precip_val = float(raw_precip) if raw_precip is not None else (float(hourly.get("precipitation", [None])[curr_idx]) if curr_idx < len(hourly.get("precipitation", [])) and hourly.get("precipitation", [])[curr_idx] is not None else (rain_val if rain_val is not None else None))
                
                # Helper for slicing & summing hourly metrics safely
                def sum_hourly(arr_key, start_offset, end_offset):
                    arr = hourly.get(arr_key, [])
                    s = max(0, curr_idx + start_offset)
                    e = min(len(arr), curr_idx + end_offset)
                    if s >= e:
                        return None
                    valid = [float(v) for v in arr[s:e] if v is not None]
                    return round(sum(valid), 1) if valid else None

                # Recent hourly accumulations
                accum_1h_rain = sum_hourly("rain", 0, 1) or rain_val
                accum_3h_rain = sum_hourly("rain", -2, 1)
                accum_6h_rain = sum_hourly("rain", -5, 1)
                accum_24h_rain = sum_hourly("rain", -23, 1)

                accum_3h_precip = sum_hourly("precipitation", -2, 1)
                accum_24h_precip = sum_hourly("precipitation", -23, 1)

                # Next 24h forecasts
                forecast_24h_rain = sum_hourly("rain", 0, 24)
                forecast_24h_precip = sum_hourly("precipitation", 0, 24)

                # Soil moisture
                sm_list = hourly.get("soil_moisture_0_to_1cm", [])
                sm_val = float(sm_list[curr_idx]) if sm_list and curr_idx < len(sm_list) and sm_list[curr_idx] is not None else 0.30
                soil_sat_pct = min(100.0, max(0.0, (sm_val / 0.48) * 100.0))
                
                temp = float(current.get("temperature_2m", 20.0)) if current.get("temperature_2m") is not None else None
                wind = float(current.get("wind_speed_10m", 5.0)) if current.get("wind_speed_10m") is not None else None
                
                return {
                    "success": True,
                    "rainfall_rate": round(rain_val, 1) if rain_val is not None else (round(precip_val, 1) if precip_val is not None else None),
                    "rainfall_display": f"{round(rain_val if rain_val is not None else precip_val, 1)} mm/hr" if (rain_val is not None or precip_val is not None) else "Unavailable",
                    "rain_mm_hr": round(rain_val, 1) if rain_val is not None else None,
                    "precipitation_mm_hr": round(precip_val, 1) if precip_val is not None else None,
                    "accum_1h_rain_mm": accum_1h_rain,
                    "accum_3h_rain_mm": accum_3h_rain,
                    "accum_6h_rain_mm": accum_6h_rain,
                    "accum_24h_rain_mm": accum_24h_rain,
                    "accum_24h_precipitation_mm": accum_24h_precip,
                    "forecast_24h_rain_mm": forecast_24h_rain,
                    "forecast_24h_precipitation_mm": forecast_24h_precip,
                    "rainfall_mm": accum_24h_rain or forecast_24h_precip,
                    "rainfall_intensity": cls.get_intensity_label(rain_val if rain_val is not None else precip_val),
                    "soil_saturation_pct": round(soil_sat_pct, 1),
                    "temperature_c": round(temp, 1) if temp is not None else None,
                    "wind_speed_kmh": round(wind, 1) if wind is not None else None,
                    "is_live_data": True,
                    "request_url": url,
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
