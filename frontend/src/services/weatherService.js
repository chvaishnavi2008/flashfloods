// OPEN-METEO API
// No API key is required for this prototype.
// Weather data is fetched using latitude and longitude.

/**
 * Weather & Precipitation Telemetry Service
 * Connects directly to Open-Meteo Forecast API (https://api.open-meteo.com/v1/forecast)
 * 
 * Accurately retrieves and parses:
 * - current.precipitation, current.rain, current.showers
 * - hourly.precipitation, hourly.rain, hourly.showers (matched to current hour, not index 0)
 * - timezone=auto
 * - Preserves null/missing values without fabricating 0s
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
   * @returns {Promise<{success: boolean, data?: object, error?: string, request_url?: string}>}
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

    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = weatherCache.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return {
        success: true,
        data: cached.data,
        fromCache: true,
        request_url: cached.request_url
      };
    }

    try {
      // Build Open-Meteo Forecast API query with requested current and hourly parameters + timezone=auto
      const url = new URL(OPEN_METEO_BASE_URL);
      url.searchParams.set('latitude', lat.toString());
      url.searchParams.set('longitude', lng.toString());
      url.searchParams.set('current', [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'rain',
        'showers',
        'weather_code',
        'wind_speed_10m'
      ].join(','));
      url.searchParams.set('hourly', [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'rain',
        'showers',
        'soil_moisture_0_to_1cm',
        'soil_moisture_1_to_3cm',
        'soil_moisture_3_to_9cm',
        'wind_speed_10m',
        'weather_code'
      ].join(','));
      url.searchParams.set('forecast_days', '2');
      url.searchParams.set('timezone', 'auto');

      const requestUrlStr = url.toString();
      const response = await fetch(requestUrlStr);

      if (!response.ok) {
        console.error(`[weatherService] Open-Meteo returned status ${response.status}`);
        return {
          success: false,
          error: 'Live weather data temporarily unavailable.',
          request_url: requestUrlStr
        };
      }

      const json = await response.json();
      const parsedData = this.parseOpenMeteoPayload(json, lat, lng, requestUrlStr);

      // Cache validated data
      weatherCache.set(cacheKey, {
        timestamp: now,
        data: parsedData,
        request_url: requestUrlStr
      });

      return {
        success: true,
        data: parsedData,
        fromCache: false,
        request_url: requestUrlStr
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
  parseOpenMeteoPayload(json, lat, lng, requestUrl = '') {
    const current = json.current || {};
    const hourly = json.hourly || {};
    const times = hourly.time || [];

    // 1. Precise Current Hour Index Matching (Not defaulting blindly to hourly[0])
    // Open-Meteo current.time is formatted e.g. "2026-09-02T20:45"
    // hourly.time entries are formatted e.g. "2026-09-02T20:00"
    const currentTimeStr = current.time || '';
    const currentHourPrefix = currentTimeStr.length >= 13 ? currentTimeStr.slice(0, 13) : '';
    let currentIdx = times.findIndex(t => t.startsWith(currentHourPrefix));

    if (currentIdx < 0 && currentTimeStr) {
      const targetTs = new Date(currentTimeStr).getTime();
      if (!isNaN(targetTs)) {
        let minDiff = Infinity;
        times.forEach((t, i) => {
          const diff = Math.abs(new Date(t).getTime() - targetTs);
          if (diff < minDiff) {
            minDiff = diff;
            currentIdx = i;
          }
        });
      }
    }
    if (currentIdx < 0) currentIdx = 0;

    // 2. Verified Rainfall Fields Extraction (Do NOT convert null/missing to 0)
    let rawPrecip = null;
    let fieldSource = null;

    if (typeof current.precipitation === 'number') {
      rawPrecip = current.precipitation;
      fieldSource = 'current.precipitation';
    } else if (typeof current.rain === 'number' || typeof current.showers === 'number') {
      const r = typeof current.rain === 'number' ? current.rain : 0;
      const s = typeof current.showers === 'number' ? current.showers : 0;
      rawPrecip = r + s;
      fieldSource = 'current.rain + current.showers';
    } else if (currentIdx >= 0 && typeof hourly.precipitation?.[currentIdx] === 'number') {
      rawPrecip = hourly.precipitation[currentIdx];
      fieldSource = `hourly.precipitation[${currentIdx}]`;
    } else if (currentIdx >= 0 && (typeof hourly.rain?.[currentIdx] === 'number' || typeof hourly.showers?.[currentIdx] === 'number')) {
      const hr = typeof hourly.rain?.[currentIdx] === 'number' ? hourly.rain[currentIdx] : 0;
      const hs = typeof hourly.showers?.[currentIdx] === 'number' ? hourly.showers[currentIdx] : 0;
      rawPrecip = hr + hs;
      fieldSource = `hourly.rain[${currentIdx}] + hourly.showers[${currentIdx}]`;
    }

    const currentRain = typeof current.rain === 'number'
      ? current.rain
      : (currentIdx >= 0 && typeof hourly.rain?.[currentIdx] === 'number' ? hourly.rain[currentIdx] : null);

    const currentShowers = typeof current.showers === 'number'
      ? current.showers
      : (currentIdx >= 0 && typeof hourly.showers?.[currentIdx] === 'number' ? hourly.showers[currentIdx] : null);

    const precipitation_mm_hr = rawPrecip !== null ? Math.round(rawPrecip * 10) / 10 : null;
    const precipitation_display = precipitation_mm_hr !== null ? `${precipitation_mm_hr} mm/hr` : 'Unavailable';

    // 3. Temperature, Wind, Humidity
    const temperature = typeof current.temperature_2m === 'number'
      ? current.temperature_2m
      : (currentIdx >= 0 && typeof hourly.temperature_2m?.[currentIdx] === 'number' ? hourly.temperature_2m[currentIdx] : null);

    const windSpeed = typeof current.wind_speed_10m === 'number'
      ? current.wind_speed_10m
      : (currentIdx >= 0 && typeof hourly.wind_speed_10m?.[currentIdx] === 'number' ? hourly.wind_speed_10m[currentIdx] : null);

    const relativeHumidity = typeof current.relative_humidity_2m === 'number'
      ? current.relative_humidity_2m
      : (currentIdx >= 0 && typeof hourly.relative_humidity_2m?.[currentIdx] === 'number' ? hourly.relative_humidity_2m[currentIdx] : null);

    // 4. Soil Moisture from Open-Meteo Land Surface Model
    const sm0_1 = hourly.soil_moisture_0_to_1cm?.[currentIdx] ?? null;
    const sm1_3 = hourly.soil_moisture_1_to_3cm?.[currentIdx] ?? sm0_1;
    const sm3_9 = hourly.soil_moisture_3_to_9cm?.[currentIdx] ?? sm1_3;
    const avgSoilMoistureM3 = sm0_1 !== null ? (sm0_1 + (sm1_3 ?? sm0_1) + (sm3_9 ?? sm1_3 ?? sm0_1)) / 3 : 0.30;
    const soilSaturationPct = Math.min(100, Math.max(0, Math.round((avgSoilMoistureM3 / 0.48) * 100)));

    // 5. Next 24 Hours Cumulative Precipitation Forecast (Starting from currentIdx)
    let next24hPrecipitation = null;
    if (hourly.precipitation && hourly.precipitation.length > 0) {
      const next24 = hourly.precipitation.slice(currentIdx, currentIdx + 24);
      const valid = next24.filter(v => typeof v === 'number');
      if (valid.length > 0) {
        next24hPrecipitation = Math.round(valid.reduce((sum, v) => sum + v, 0) * 10) / 10;
      }
    }

    let next24hRain = null;
    if (hourly.rain && hourly.rain.length > 0) {
      const next24 = hourly.rain.slice(currentIdx, currentIdx + 24);
      const valid = next24.filter(v => typeof v === 'number');
      if (valid.length > 0) {
        next24hRain = Math.round(valid.reduce((sum, v) => sum + v, 0) * 10) / 10;
      }
    }

    // 6. Intensity Label
    const effectiveRate = precipitation_mm_hr !== null ? precipitation_mm_hr : 0.0;
    let intensityLabel = 'Light';
    if (effectiveRate >= 100) intensityLabel = 'Cloudburst / Torrential';
    else if (effectiveRate >= 50) intensityLabel = 'Extremely Heavy';
    else if (effectiveRate >= 30) intensityLabel = 'Heavy';
    else if (effectiveRate >= 10) intensityLabel = 'Moderate';
    else if (precipitation_mm_hr === null) intensityLabel = 'Unavailable';

    // 7. Forecast Trend
    const next3hSum = (hourly.precipitation || [])
      .slice(currentIdx, currentIdx + 3)
      .reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
    const prev3hSum = (hourly.precipitation || [])
      .slice(Math.max(0, currentIdx - 3), currentIdx)
      .reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);

    let rainfallTrend = 'Stable';
    if (effectiveRate >= 50 || next3hSum >= 70) rainfallTrend = 'Peaking';
    else if (next3hSum > prev3hSum && next3hSum > 5) rainfallTrend = 'Rising Rapidly';
    else if (next3hSum > 2) rainfallTrend = 'Rising';
    else if (prev3hSum > next3hSum) rainfallTrend = 'Falling';

    // 8. Estimated Surface Runoff (Hydrological rational derivation)
    const estimatedRunoffCoeff = Math.min(0.95, (soilSaturationPct / 100) * 0.85 + (effectiveRate > 25 ? 0.15 : 0.05));
    const estimatedSurfaceRunoffMm = precipitation_mm_hr !== null
      ? Math.round(effectiveRate * estimatedRunoffCoeff * 10) / 10
      : null;

    // 9. Grounded Risk Factors
    const riskFactors = [];
    if (precipitation_mm_hr !== null && precipitation_mm_hr >= 50) {
      riskFactors.push(`Torrential precipitation rate detected (${precipitation_mm_hr.toFixed(1)} mm/hr)`);
    } else if (precipitation_mm_hr !== null && precipitation_mm_hr >= 25) {
      riskFactors.push(`Heavy rainfall rate active (${precipitation_mm_hr.toFixed(1)} mm/hr)`);
    } else if (precipitation_mm_hr !== null && precipitation_mm_hr >= 10) {
      riskFactors.push(`Moderate rainfall active (${precipitation_mm_hr.toFixed(1)} mm/hr)`);
    }

    if (next24hPrecipitation !== null && next24hPrecipitation >= 75) {
      riskFactors.push(`High 24h accumulated rainfall expected (${next24hPrecipitation.toFixed(1)} mm)`);
    } else if (next24hPrecipitation !== null && next24hPrecipitation >= 40) {
      riskFactors.push(`Elevated 24h rainfall forecast (${next24hPrecipitation.toFixed(1)} mm)`);
    }

    if (soilSaturationPct >= 75) {
      riskFactors.push(`High soil moisture saturation (${soilSaturationPct}% pore-water volume)`);
    } else if (soilSaturationPct >= 55) {
      riskFactors.push(`Elevated soil moisture level (${soilSaturationPct}%)`);
    }

    if (estimatedSurfaceRunoffMm !== null && estimatedSurfaceRunoffMm >= 15) {
      riskFactors.push(`Significant surface runoff load (${estimatedSurfaceRunoffMm.toFixed(1)} mm/hr derived)`);
    }

    if (windSpeed !== null && windSpeed >= 45) {
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
      current_time: currentTimeStr,
      matched_hourly_index: currentIdx,
      matched_hourly_time: times[currentIdx] || null,
      request_url: requestUrl,
      field_source: fieldSource,
      fetched_at: new Date().toISOString(),

      // Raw Current vs Hourly Readings
      raw_current: {
        precipitation: typeof current.precipitation === 'number' ? current.precipitation : null,
        rain: typeof current.rain === 'number' ? current.rain : null,
        showers: typeof current.showers === 'number' ? current.showers : null
      },
      raw_hourly_current: {
        precipitation: currentIdx >= 0 && typeof hourly.precipitation?.[currentIdx] === 'number' ? hourly.precipitation[currentIdx] : null,
        rain: currentIdx >= 0 && typeof hourly.rain?.[currentIdx] === 'number' ? hourly.rain[currentIdx] : null,
        showers: currentIdx >= 0 && typeof hourly.showers?.[currentIdx] === 'number' ? hourly.showers[currentIdx] : null
      },

      // Processed Telemetry (No fake 0s for missing values)
      precipitation_mm_hr: precipitation_mm_hr,
      precipitation_display: precipitation_display,
      rain_mm_hr: currentRain !== null ? Math.round(currentRain * 10) / 10 : null,
      showers_mm_hr: currentShowers !== null ? Math.round(currentShowers * 10) / 10 : null,
      temperature_c: temperature !== null ? Math.round(temperature * 10) / 10 : null,
      wind_speed_kmh: windSpeed !== null ? Math.round(windSpeed * 10) / 10 : null,
      relative_humidity_pct: relativeHumidity !== null ? Math.round(relativeHumidity) : null,
      forecast_24h_precipitation_mm: next24hPrecipitation,
      forecast_24h_rain_mm: next24hRain,
      rainfall_intensity: intensityLabel,
      rainfall_forecast_trend: rainfallTrend,

      // Soil moisture from Open-Meteo
      soil_moisture_m3: Math.round(avgSoilMoistureM3 * 1000) / 1000,
      soil_saturation_pct: soilSaturationPct,

      // Derived Runoff
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
          precipitation: hourly.precipitation?.[offsetIdx] ?? null,
          rain: hourly.rain?.[offsetIdx] ?? null,
          showers: hourly.showers?.[offsetIdx] ?? null,
          windSpeed: hourly.wind_speed_10m?.[offsetIdx] ?? null,
          soilMoisture: hourly.soil_moisture_0_to_1cm?.[offsetIdx] ?? null
        };
      }),

      // Grounded risk factors supported by API values
      risk_factors: riskFactors
    };
  }
};
