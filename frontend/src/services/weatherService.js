// OPEN-METEO API
// No API key is required for this prototype.
// Weather data is fetched using latitude and longitude.

/**
 * Weather & Precipitation Telemetry Service
 * Connects directly to Open-Meteo Forecast API (https://api.open-meteo.com/v1/forecast)
 * Fetches real hourly forecast metrics:
 * - Precipitation (mm)
 * - Rain (mm)
 * - Showers (mm)
 * - Soil Moisture (0-1cm, 1-3cm, 3-9cm in m³/m³)
 * - Wind Speed (km/h)
 * - Temperature (°C)
 * 
 * Note: Surface runoff is not a native hourly parameter in the default Open-Meteo
 * forecast endpoint; it is explicitly computed as an estimated hydrological derivation
 * from precipitation rate and soil saturation, and clearly labeled as such.
 */

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Client-side cache to avoid excessive API requests
const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export const weatherService = {
  /**
   * Fetch live weather and hourly forecast from Open-Meteo
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {boolean} forceRefresh 
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async fetchLiveWeather(latitude, longitude, forceRefresh = false) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return {
        success: false,
        error: 'Invalid coordinates provided.'
      };
    }

    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = weatherCache.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return {
        success: true,
        data: cached.data,
        fromCache: true
      };
    }

    try {
      // Build Open-Meteo Forecast API query with requested hourly parameters
      const url = new URL(OPEN_METEO_BASE_URL);
      url.searchParams.set('latitude', lat.toString());
      url.searchParams.set('longitude', lng.toString());
      url.searchParams.set('hourly', [
        'temperature_2m',
        'precipitation',
        'rain',
        'showers',
        'soil_moisture_0_to_1cm',
        'soil_moisture_1_to_3cm',
        'soil_moisture_3_to_9cm',
        'wind_speed_10m',
        'relative_humidity_2m',
        'weather_code'
      ].join(','));
      url.searchParams.set('current', [
        'temperature_2m',
        'precipitation',
        'rain',
        'showers',
        'wind_speed_10m',
        'relative_humidity_2m',
        'weather_code'
      ].join(','));
      url.searchParams.set('forecast_days', '2');
      url.searchParams.set('timezone', 'auto');

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.error(`[weatherService] Open-Meteo returned status ${response.status}`);
        return {
          success: false,
          error: 'Live weather data temporarily unavailable.'
        };
      }

      const json = await response.json();
      const parsedData = this.parseOpenMeteoPayload(json, lat, lng);

      // Cache validated data
      weatherCache.set(cacheKey, {
        timestamp: now,
        data: parsedData
      });

      return {
        success: true,
        data: parsedData,
        fromCache: false
      };
    } catch (err) {
      console.error('[weatherService] Network / Fetch error querying Open-Meteo:', err);
      return {
        success: false,
        error: 'Live weather data temporarily unavailable.'
      };
    }
  },

  /**
   * Parse and structure raw Open-Meteo API payload into PralayWatch-compatible telemetry
   */
  parseOpenMeteoPayload(json, lat, lng) {
    const current = json.current || {};
    const hourly = json.hourly || {};
    const times = hourly.time || [];

    // Find current hour index or default to first
    const currentTimeStr = current.time || new Date().toISOString().slice(0, 13);
    let currentIdx = times.findIndex(t => t.startsWith(currentTimeStr.slice(0, 13)));
    if (currentIdx < 0) currentIdx = 0;

    // 1. Current / Instantaneous telemetry
    const temperature = typeof current.temperature_2m === 'number' 
      ? current.temperature_2m 
      : (hourly.temperature_2m?.[currentIdx] ?? 20.0);

    const precipitation = typeof current.precipitation === 'number'
      ? current.precipitation
      : (hourly.precipitation?.[currentIdx] ?? 0.0);

    const rain = typeof current.rain === 'number'
      ? current.rain
      : (hourly.rain?.[currentIdx] ?? 0.0);

    const showers = typeof current.showers === 'number'
      ? current.showers
      : (hourly.showers?.[currentIdx] ?? 0.0);

    const windSpeed = typeof current.wind_speed_10m === 'number'
      ? current.wind_speed_10m
      : (hourly.wind_speed_10m?.[currentIdx] ?? 5.0);

    const relativeHumidity = typeof current.relative_humidity_2m === 'number'
      ? current.relative_humidity_2m
      : (hourly.relative_humidity_2m?.[currentIdx] ?? 60.0);

    // 2. Soil moisture (m³/m³) from Open-Meteo land surface model
    const sm0_1 = hourly.soil_moisture_0_to_1cm?.[currentIdx] ?? 0.30;
    const sm1_3 = hourly.soil_moisture_1_to_3cm?.[currentIdx] ?? sm0_1;
    const sm3_9 = hourly.soil_moisture_3_to_9cm?.[currentIdx] ?? sm1_3;
    const avgSoilMoistureM3 = (sm0_1 + sm1_3 + sm3_9) / 3;

    // Volumetric soil moisture typical saturation capacity is ~0.45 - 0.50 m³/m³
    const soilSaturationPct = Math.min(100, Math.max(0, Math.round((avgSoilMoistureM3 / 0.48) * 100)));

    // 3. Next 24 hours cumulative precipitation forecast
    const next24hPrecipitation = (hourly.precipitation || [])
      .slice(currentIdx, currentIdx + 24)
      .reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);

    const next24hRain = (hourly.rain || [])
      .slice(currentIdx, currentIdx + 24)
      .reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);

    // 4. Intensity label mapping matching backend WeatherService
    let intensityLabel = 'Light';
    if (precipitation >= 100) intensityLabel = 'Cloudburst / Torrential';
    else if (precipitation >= 50) intensityLabel = 'Extremely Heavy';
    else if (precipitation >= 30) intensityLabel = 'Heavy';
    else if (precipitation >= 10) intensityLabel = 'Moderate';

    // 5. Forecast Trend
    const next3hSum = (hourly.precipitation || [])
      .slice(currentIdx, currentIdx + 3)
      .reduce((s, v) => s + (v || 0), 0);
    const prev3hSum = (hourly.precipitation || [])
      .slice(Math.max(0, currentIdx - 3), currentIdx)
      .reduce((s, v) => s + (v || 0), 0);

    let rainfallTrend = 'Stable';
    if (precipitation >= 50 || next3hSum >= 70) rainfallTrend = 'Peaking';
    else if (next3hSum > prev3hSum && next3hSum > 5) rainfallTrend = 'Rising Rapidly';
    else if (next3hSum > 2) rainfallTrend = 'Rising';
    else if (prev3hSum > next3hSum) rainfallTrend = 'Falling';

    // 6. Estimated / Derived Surface Runoff (explicitly labeled as derived)
    // Runoff occurs when precipitation rate exceeds soil infiltration capacity
    // Hydrological rational formula: Runoff = Precip * Runoff_Coeff
    const estimatedRunoffCoeff = Math.min(0.95, (soilSaturationPct / 100) * 0.85 + (precipitation > 25 ? 0.15 : 0.05));
    const estimatedSurfaceRunoffMm = Math.round(precipitation * estimatedRunoffCoeff * 10) / 10;

    // 7. Grounded Risk Factors (ONLY supported by actual API values)
    const riskFactors = [];
    if (precipitation >= 50) {
      riskFactors.push(`Torrential precipitation rate detected (${precipitation.toFixed(1)} mm/hr)`);
    } else if (precipitation >= 25) {
      riskFactors.push(`Heavy rainfall rate active (${precipitation.toFixed(1)} mm/hr)`);
    } else if (precipitation >= 10) {
      riskFactors.push(`Moderate rainfall active (${precipitation.toFixed(1)} mm/hr)`);
    }

    if (next24hPrecipitation >= 75) {
      riskFactors.push(`High 24h accumulated rainfall expected (${next24hPrecipitation.toFixed(1)} mm)`);
    } else if (next24hPrecipitation >= 40) {
      riskFactors.push(`Elevated 24h rainfall forecast (${next24hPrecipitation.toFixed(1)} mm)`);
    }

    if (soilSaturationPct >= 75) {
      riskFactors.push(`High soil moisture saturation (${soilSaturationPct}% pore-water volume)`);
    } else if (soilSaturationPct >= 55) {
      riskFactors.push(`Elevated soil moisture level (${soilSaturationPct}%)`);
    }

    if (estimatedSurfaceRunoffMm >= 15) {
      riskFactors.push(`Significant surface runoff load (${estimatedSurfaceRunoffMm.toFixed(1)} mm/hr derived)`);
    }

    if (windSpeed >= 45) {
      riskFactors.push(`High wind gusts (${windSpeed.toFixed(1)} km/h)`);
    }

    if (riskFactors.length === 0) {
      riskFactors.push('Atmospheric and precipitation readings within safe baseline limits');
    }

    return {
      source: 'Open-Meteo Live Forecast API',
      latitude: lat,
      longitude: lng,
      elevation: json.elevation || null,
      timezone: json.timezone || 'UTC',
      fetched_at: new Date().toISOString(),
      
      // Real API Telemetry
      temperature_c: Math.round(temperature * 10) / 10,
      precipitation_mm_hr: Math.round(precipitation * 10) / 10,
      rain_mm_hr: Math.round(rain * 10) / 10,
      showers_mm_hr: Math.round(showers * 10) / 10,
      forecast_24h_precipitation_mm: Math.round(next24hPrecipitation * 10) / 10,
      forecast_24h_rain_mm: Math.round(next24hRain * 10) / 10,
      rainfall_intensity: intensityLabel,
      rainfall_forecast_trend: rainfallTrend,
      wind_speed_kmh: Math.round(windSpeed * 10) / 10,
      relative_humidity_pct: Math.round(relativeHumidity),
      
      // Soil moisture from Open-Meteo
      soil_moisture_m3: Math.round(avgSoilMoistureM3 * 1000) / 1000,
      soil_saturation_pct: soilSaturationPct,
      
      // Derived Runoff (clearly tagged as derived, not raw API field)
      surface_runoff: {
        value_mm_hr: estimatedSurfaceRunoffMm,
        is_derived: true,
        derivation_basis: 'Calculated from Open-Meteo precipitation rate & soil moisture saturation'
      },

      // Hourly preview (next 12 hours)
      hourly_forecast: times.slice(currentIdx, currentIdx + 12).map((timeStr, idx) => {
        const offsetIdx = currentIdx + idx;
        return {
          time: timeStr,
          temperature: hourly.temperature_2m?.[offsetIdx] ?? null,
          precipitation: hourly.precipitation?.[offsetIdx] ?? 0,
          rain: hourly.rain?.[offsetIdx] ?? 0,
          showers: hourly.showers?.[offsetIdx] ?? 0,
          windSpeed: hourly.wind_speed_10m?.[offsetIdx] ?? 0,
          soilMoisture: hourly.soil_moisture_0_to_1cm?.[offsetIdx] ?? null
        };
      }),

      // Grounded risk factors supported by API values
      risk_factors: riskFactors
    };
  }
};
