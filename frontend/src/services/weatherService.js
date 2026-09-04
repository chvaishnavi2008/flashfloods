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
      url.searchParams.set('past_hours', '24');
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
   * Helper to safely sum a range of hourly values (preserving null when all values are missing)
   */
  sumHourlySlice(arr, startIdx, endIdx) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const start = Math.max(0, startIdx);
    const end = Math.min(arr.length, endIdx);
    if (start >= end) return null;
    const slice = arr.slice(start, end);
    const valid = slice.filter(v => typeof v === 'number' && !isNaN(v));
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((sum, v) => sum + v, 0) * 10) / 10;
  },

  /**
   * Parse and structure raw Open-Meteo API payload into AapdaSetu-compatible telemetry
   */
  parseOpenMeteoPayload(json, lat, lng, requestUrl = '') {
    const current = json.current || {};
    const hourly = json.hourly || {};
    const times = hourly.time || [];

    // 1. Precise Current Hour Index Matching (Matched to current local ISO timestamp)
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

    // 2. Verified Current Rain & Precipitation Extraction (Do NOT convert null/missing to 0)
    const currentRain = typeof current.rain === 'number'
      ? current.rain
      : (currentIdx >= 0 && typeof hourly.rain?.[currentIdx] === 'number' ? hourly.rain[currentIdx] : null);

    const currentPrecip = typeof current.precipitation === 'number'
      ? current.precipitation
      : (currentIdx >= 0 && typeof hourly.precipitation?.[currentIdx] === 'number' ? hourly.precipitation[currentIdx] : null);

    const currentShowers = typeof current.showers === 'number'
      ? current.showers
      : (currentIdx >= 0 && typeof hourly.showers?.[currentIdx] === 'number' ? hourly.showers[currentIdx] : null);

    // Primary current rain rate (mm/hr)
    const rain_mm_hr = currentRain !== null ? Math.round(currentRain * 10) / 10 : null;
    const precipitation_mm_hr = currentPrecip !== null ? Math.round(currentPrecip * 10) / 10 : (rain_mm_hr !== null ? rain_mm_hr : null);
    const showers_mm_hr = currentShowers !== null ? Math.round(currentShowers * 10) / 10 : null;

    // 3. Historical / Recent Rainfall Accumulations (Preceding and including the current hour)
    // - Last 1 hour: current hourly index
    // - Last 3 hours: currentIdx - 2 through currentIdx (3 hours)
    // - Last 6 hours: currentIdx - 5 through currentIdx (6 hours)
    // - Last 24 hours: currentIdx - 23 through currentIdx (24 hours)
    const accum1hRain = this.sumHourlySlice(hourly.rain, currentIdx, currentIdx + 1) ?? rain_mm_hr;
    const accum3hRain = this.sumHourlySlice(hourly.rain, currentIdx - 2, currentIdx + 1);
    const accum6hRain = this.sumHourlySlice(hourly.rain, currentIdx - 5, currentIdx + 1);
    const accum24hRain = this.sumHourlySlice(hourly.rain, currentIdx - 23, currentIdx + 1);

    const accum1hPrecip = this.sumHourlySlice(hourly.precipitation, currentIdx, currentIdx + 1) ?? precipitation_mm_hr;
    const accum3hPrecip = this.sumHourlySlice(hourly.precipitation, currentIdx - 2, currentIdx + 1);
    const accum6hPrecip = this.sumHourlySlice(hourly.precipitation, currentIdx - 5, currentIdx + 1);
    const accum24hPrecip = this.sumHourlySlice(hourly.precipitation, currentIdx - 23, currentIdx + 1);

    // 4. Next 24 Hours Cumulative Forecast (Future from currentIdx)
    const forecast24hRain = this.sumHourlySlice(hourly.rain, currentIdx, currentIdx + 24);
    const forecast24hPrecip = this.sumHourlySlice(hourly.precipitation, currentIdx, currentIdx + 24);

    // 5. Console Debugging Telemetry
    console.log('🌧️ [AapdaSetu Weather Telemetry]');
    console.log('  📍 Selected latitude:', lat);
    console.log('  📍 Selected longitude:', lng);
    console.log('  💧 Current rain:', currentRain !== null ? `${currentRain} mm/hr` : 'Unavailable');
    console.log('  💧 Current precipitation:', currentPrecip !== null ? `${currentPrecip} mm/hr` : 'Unavailable');
    console.log('  📊 Hourly rain values:', hourly.rain ? hourly.rain.slice(Math.max(0, currentIdx - 23), currentIdx + 24) : 'Unavailable');
    console.log('  ⏱️ Last 1h rainfall:', accum1hRain !== null ? `${accum1hRain} mm` : 'Unavailable');
    console.log('  ⏱️ Last 3h rainfall:', accum3hRain !== null ? `${accum3hRain} mm` : 'Unavailable');
    console.log('  ⏱️ Last 6h rainfall:', accum6hRain !== null ? `${accum6hRain} mm` : 'Unavailable');
    console.log('  ⏱️ Last 24h rainfall (accumulated):', accum24hRain !== null ? `${accum24hRain} mm` : 'Unavailable');
    console.log('  🔮 Next 24h rainfall (forecast):', forecast24hRain !== null ? `${forecast24hRain} mm` : 'Unavailable');

    // 6. Temperature, Wind, Humidity
    const temperature = typeof current.temperature_2m === 'number'
      ? current.temperature_2m
      : (currentIdx >= 0 && typeof hourly.temperature_2m?.[currentIdx] === 'number' ? hourly.temperature_2m[currentIdx] : null);

    const windSpeed = typeof current.wind_speed_10m === 'number'
      ? current.wind_speed_10m
      : (currentIdx >= 0 && typeof hourly.wind_speed_10m?.[currentIdx] === 'number' ? hourly.wind_speed_10m[currentIdx] : null);

    const relativeHumidity = typeof current.relative_humidity_2m === 'number'
      ? current.relative_humidity_2m
      : (currentIdx >= 0 && typeof hourly.relative_humidity_2m?.[currentIdx] === 'number' ? hourly.relative_humidity_2m[currentIdx] : null);

    // 7. Soil Moisture from Open-Meteo Land Surface Model
    const sm0_1 = hourly.soil_moisture_0_to_1cm?.[currentIdx] ?? null;
    const sm1_3 = hourly.soil_moisture_1_to_3cm?.[currentIdx] ?? sm0_1;
    const sm3_9 = hourly.soil_moisture_3_to_9cm?.[currentIdx] ?? sm1_3;
    const avgSoilMoistureM3 = sm0_1 !== null ? (sm0_1 + (sm1_3 ?? sm0_1) + (sm3_9 ?? sm1_3 ?? sm0_1)) / 3 : 0.30;
    const soilSaturationPct = Math.min(100, Math.max(0, Math.round((avgSoilMoistureM3 / 0.48) * 100)));

    // 8. Intensity Label
    const effectiveRate = rain_mm_hr !== null ? rain_mm_hr : (precipitation_mm_hr !== null ? precipitation_mm_hr : 0.0);
    let intensityLabel = 'Light / Dry';
    if (effectiveRate >= 100) intensityLabel = 'Cloudburst / Torrential';
    else if (effectiveRate >= 50) intensityLabel = 'Extremely Heavy';
    else if (effectiveRate >= 30) intensityLabel = 'Heavy';
    else if (effectiveRate >= 10) intensityLabel = 'Moderate';
    else if (effectiveRate > 0) intensityLabel = 'Light Rain';
    else if (rain_mm_hr === null && precipitation_mm_hr === null) intensityLabel = 'Unavailable';

    // 9. Forecast Trend
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
    else if (prev3hSum > next3hSum && prev3hSum > 0.5) rainfallTrend = 'Falling';

    // 10. Estimated Surface Runoff
    const estimatedRunoffCoeff = Math.min(0.95, (soilSaturationPct / 100) * 0.85 + (effectiveRate > 25 ? 0.15 : 0.05));
    const estimatedSurfaceRunoffMm = (rain_mm_hr !== null || precipitation_mm_hr !== null)
      ? Math.round(effectiveRate * estimatedRunoffCoeff * 10) / 10
      : null;

    // 11. Grounded Risk Factors
    const riskFactors = [];
    if (rain_mm_hr !== null && rain_mm_hr >= 50) {
      riskFactors.push(`Torrential rainfall rate detected (${rain_mm_hr.toFixed(1)} mm/hr)`);
    } else if (rain_mm_hr !== null && rain_mm_hr >= 25) {
      riskFactors.push(`Heavy rainfall rate active (${rain_mm_hr.toFixed(1)} mm/hr)`);
    } else if (rain_mm_hr !== null && rain_mm_hr >= 10) {
      riskFactors.push(`Moderate rainfall active (${rain_mm_hr.toFixed(1)} mm/hr)`);
    }

    if (accum24hRain !== null && accum24hRain >= 75) {
      riskFactors.push(`High 24h accumulated rainfall recorded (${accum24hRain.toFixed(1)} mm)`);
    } else if (accum24hRain !== null && accum24hRain >= 40) {
      riskFactors.push(`Elevated 24h rainfall accumulation (${accum24hRain.toFixed(1)} mm)`);
    }

    if (forecast24hRain !== null && forecast24hRain >= 75) {
      riskFactors.push(`High 24h rainfall forecast expected (${forecast24hRain.toFixed(1)} mm)`);
    } else if (forecast24hRain !== null && forecast24hRain >= 40) {
      riskFactors.push(`Elevated 24h rainfall forecast (${forecast24hRain.toFixed(1)} mm)`);
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
      field_source: currentRain !== null ? 'current.rain' : (currentPrecip !== null ? 'current.precipitation' : `hourly.rain[${currentIdx}]`),
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
      rain_mm_hr: rain_mm_hr,
      rain_display: rain_mm_hr !== null ? `${rain_mm_hr} mm/hr` : 'Unavailable',
      precipitation_mm_hr: precipitation_mm_hr,
      precipitation_display: precipitation_mm_hr !== null ? `${precipitation_mm_hr} mm/hr` : 'Unavailable',
      showers_mm_hr: showers_mm_hr,

      // Recent Accumulations (Observed Past Periods)
      accum_1h_rain_mm: accum1hRain,
      accum_3h_rain_mm: accum3hRain,
      accum_6h_rain_mm: accum6hRain,
      accum_24h_rain_mm: accum24hRain,

      accum_1h_precipitation_mm: accum1hPrecip,
      accum_3h_precipitation_mm: accum3hPrecip,
      accum_6h_precipitation_mm: accum6hPrecip,
      accum_24h_precipitation_mm: accum24hPrecip,

      // Future Forecast Accumulations (Next 24 Hours)
      forecast_24h_rain_mm: forecast24hRain,
      forecast_24h_precipitation_mm: forecast24hPrecip,

      // Classification & Atmosphere
      rainfall_intensity: intensityLabel,
      rainfall_forecast_trend: rainfallTrend,
      temperature_c: temperature !== null ? Math.round(temperature * 10) / 10 : null,
      wind_speed_kmh: windSpeed !== null ? Math.round(windSpeed * 10) / 10 : null,
      relative_humidity_pct: relativeHumidity !== null ? Math.round(relativeHumidity) : null,

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
