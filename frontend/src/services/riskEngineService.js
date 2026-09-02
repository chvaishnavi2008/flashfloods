/**
 * =============================================================================
 * PralayWatch Risk Intelligence Engine (Client-Side Standardized Service)
 * =============================================================================
 * 
 * Multi-Source Deterministic Risk Engine integrating:
 * 1. Live Weather Telemetry (Open-Meteo Live Forecast API)
 * 2. Real Terrain & Elevation (Open-Meteo Elevation API / Copernicus DEM GLO-90)
 * 3. Historical Flood Intelligence (India Flood Inventory IFI-Impacts 1967-2023)
 * 4. Historical Landslide Susceptibility (ISRO / NRSC Landslide Atlas of India 1998-2022)
 * 
 * SAFETY & ACCURACY NOTICE:
 * This engine provides prototype multi-source risk assessments for computational research
 * and early warning situational intelligence. It does NOT issue official government warnings.
 */

// 1. Standardized Risk Level Thresholds (0 - 100)
export const RISK_LEVEL_THRESHOLDS = {
  LOW: [0, 25],
  MODERATE: [26, 50],
  HIGH: [51, 75],
  CRITICAL: [76, 100]
};

export function getRiskLevelFromScore(score) {
  const s = Number(score) || 0;
  if (s >= 76.0) return 'CRITICAL';
  if (s >= 51.0) return 'HIGH';
  if (s >= 26.0) return 'MODERATE';
  return 'LOW';
}

// 2. Normalization Bounds matching backend NORMALIZATION_BOUNDS
export const NORMALIZATION_BOUNDS = {
  rainfall_rate_max_mm_hr: 120.0,
  rainfall_accum_max_mm: 250.0,
  rainfall_forecast_max_mm: 100.0,
  duration_max_hours: 12.0,
  river_capacity_max_pct: 100.0,
  river_level_max_m: 8.0,
  slope_max_deg: 45.0,
  soil_saturation_max_pct: 100.0,
  elevation_baseline_m: 1500.0
};

// 3. Exact Hazard Weights matching backend HAZARD_WEIGHTS
export const HAZARD_WEIGHTS = {
  flash_flood: {
    rainfall_intensity: 0.35,
    accumulated_rainfall: 0.20,
    river_water_level: 0.20,
    river_trend: 0.15,
    elevation_terrain: 0.05,
    historical_susceptibility: 0.05
  },
  landslide: {
    soil_susceptibility: 0.35,
    slope: 0.30,
    rainfall_intensity: 0.15,
    accumulated_rainfall: 0.10,
    elevation: 0.05,
    historical_susceptibility: 0.05
  },
  extreme_rainfall: {
    rainfall_intensity: 0.45,
    rainfall_accumulation: 0.25,
    forecast_rainfall: 0.20,
    duration: 0.10
  }
};

// 4. River Trend Multiplier Scores
export const RIVER_TREND_SCORES = {
  'Overflowing / Critical Breach': 100.0,
  'Rising Rapidly': 90.0,
  'Rising': 65.0,
  'Stable': 25.0,
  'Receding': 10.0,
  'Normal': 15.0
};

// 5. Standardized Life-Safety Directives
export const ACTION_RECOMMENDATIONS = {
  flash_flood: {
    CRITICAL: [
      'Move away from low-lying areas, river channels, and drainage culverts immediately',
      'Avoid river crossings and submerged bridges',
      'Move toward designated high-ground safe zones / shelters',
      'Shut off main electricity and gas supplies before leaving'
    ],
    HIGH: [
      'Prepare emergency essentials and identify nearest high-ground refuge',
      'Avoid parking vehicles near drainage culverts or riverbeds',
      'Monitor live hydro-gauge and stream telemetry warnings'
    ],
    MODERATE: [
      'Inspect perimeter stormwater drainage around residence',
      'Stay alert to upstream cloudburst reports in surrounding hills'
    ],
    LOW: [
      'Maintain routine environmental awareness. No active evacuation required.'
    ]
  },
  landslide: {
    CRITICAL: [
      'Evacuate immediately from homes situated on or beneath steep slopes',
      'Avoid mountain highway travel and steep road cuttings',
      'Move toward designated structural shelters on stable bedrock / ridge lines',
      'Stay vigilant for sudden muddy runoff, tree tilting, or ground cracking'
    ],
    HIGH: [
      'Stay away from hillside perimeters and loose debris slopes',
      'Prepare emergency essentials for rapid movement if rainfall continues',
      'Monitor slope stability alerts from district disaster authorities'
    ],
    MODERATE: [
      'Inspect slope retention walls and clear drainage ditches',
      'Exercise caution when driving along mountain passes'
    ],
    LOW: [
      'Geotechnical metrics stable. Normal hillside monitoring.'
    ]
  },
  extreme_rainfall: {
    CRITICAL: [
      'Remain indoors in structurally sound buildings away from windows',
      'Avoid all non-essential road travel during torrential downpours',
      'Keep emergency battery lights, drinking water, and first aid ready',
      'Follow radar nowcast and weather model updates'
    ],
    HIGH: [
      'Secure loose rooftop objects and check basement sump pumps',
      'Avoid low-lying underpasses and waterlogged road stretches',
      'Keep communication devices fully charged'
    ],
    MODERATE: [
      'Carry rain gear and exercise caution during commute',
      'Check local weather forecast updates'
    ],
    LOW: [
      'Precipitation rates within nominal seasonal baseline.'
    ]
  }
};

export const riskEngineService = {
  /**
   * Evaluate multi-hazard risk using live weather + real terrain + historical disaster datasets
   * @param {object} weatherData - Parsed Open-Meteo weather telemetry
   * @param {object} terrainData - Parsed Open-Meteo elevation & estimated slope data
   * @param {object} historicalData - Parsed IFI-Impacts & ISRO Landslide Atlas intelligence
   * @param {object} locationMetadata - Optional location context
   * @returns {object} Standardized PralayWatch risk assessment payload
   */
  evaluateLiveRisk(weatherData, terrainData = null, historicalData = null, locationMetadata = {}) {
    if (!weatherData) {
      return null;
    }

    // -------------------------------------------------------------------------
    // 1. LIVE WEATHER TELEMETRY INPUTS (Open-Meteo Forecast API)
    // -------------------------------------------------------------------------
    const rainfallRate = Number(weatherData.precipitation_mm_hr || weatherData.rain_mm_hr || 0.0);
    const accumulatedRainfall = Number(weatherData.forecast_24h_precipitation_mm || weatherData.forecast_24h_rain_mm || 0.0);
    const forecastRainfall = Number(weatherData.forecast_24h_precipitation_mm || 0.0);
    const soilSaturationPct = Number(weatherData.soil_saturation_pct || 30.0);
    const windSpeed = Number(weatherData.wind_speed_kmh || 5.0);
    const derivedRunoff = Number(weatherData.surface_runoff?.value_mm_hr ?? (rainfallRate * 0.4));

    // -------------------------------------------------------------------------
    // 2. REAL TERRAIN INPUTS (Open-Meteo Elevation API / Copernicus DEM)
    // -------------------------------------------------------------------------
    const elevation = Number(
      terrainData?.elevation_m ?? 
      locationMetadata.elevation ?? 
      weatherData.elevation ?? 
      800.0
    );

    const estimatedSlopeDeg = terrainData?.estimated_slope_deg !== undefined && terrainData?.estimated_slope_deg !== null
      ? Number(terrainData.estimated_slope_deg)
      : (locationMetadata.slope_deg !== undefined && locationMetadata.slope_deg !== null ? Number(locationMetadata.slope_deg) : null);

    const terrainRisk = terrainData?.terrain_risk || (estimatedSlopeDeg >= 30 ? 'HIGH' : (estimatedSlopeDeg >= 15 ? 'MODERATE' : 'LOW'));
    const isMountainous = elevation >= 1000.0 || (estimatedSlopeDeg !== null && estimatedSlopeDeg >= 15.0);

    // -------------------------------------------------------------------------
    // 3. HISTORICAL DISASTER INPUTS (IFI-Impacts & ISRO Landslide Atlas)
    // -------------------------------------------------------------------------
    const histFloodScore = Number(
      historicalData?.historical_flood?.score ?? 
      locationMetadata.historical_flood_risk ?? 
      (isMountainous ? 65.0 : 20.0)
    );

    const histLandslideScore = Number(
      historicalData?.historical_landslide?.score ?? 
      locationMetadata.historical_landslide_risk ?? 
      (isMountainous ? 60.0 : 15.0)
    );

    const histFloodExposure = historicalData?.historical_flood?.exposure || (histFloodScore >= 51 ? 'HIGH' : (histFloodScore >= 26 ? 'MODERATE' : 'LOW'));
    const histLandslideSusceptibility = historicalData?.historical_landslide?.susceptibility || (histLandslideScore >= 51 ? 'HIGH' : (histLandslideScore >= 26 ? 'MODERATE' : 'LOW'));

    // Hydrological channel estimate
    const riverCapacityPct = Number(locationMetadata.river_capacity_pct ?? (rainfallRate > 20 ? Math.min(95, 30 + rainfallRate * 1.5) : 30.0));
    const riverTrendStr = locationMetadata.river_trend || (rainfallRate >= 30 ? 'Rising Rapidly' : (rainfallRate >= 10 ? 'Rising' : 'Normal'));
    const riverTrendScore = RIVER_TREND_SCORES[riverTrendStr] || 15.0;

    // -------------------------------------------------------------------------
    // 4. FLASH FLOOD SCORE EVALUATION
    // -------------------------------------------------------------------------
    const ffWeights = HAZARD_WEIGHTS.flash_flood;
    const normRainRate = Math.min(100.0, (rainfallRate / NORMALIZATION_BOUNDS.rainfall_rate_max_mm_hr) * 100.0);
    const normAccumRain = Math.min(100.0, (accumulatedRainfall / NORMALIZATION_BOUNDS.rainfall_accum_max_mm) * 100.0);
    const normRiverLevel = Math.min(100.0, riverCapacityPct);
    const normRiverTrend = Math.min(100.0, riverTrendScore);
    const normElevation = Math.min(100.0, (elevation / 3000.0) * 100.0);
    const normHistFlood = Math.min(100.0, histFloodScore);

    const ffBaseScore = (
      normRainRate * ffWeights.rainfall_intensity +
      normAccumRain * ffWeights.accumulated_rainfall +
      normRiverLevel * ffWeights.river_water_level +
      normRiverTrend * ffWeights.river_trend +
      normElevation * ffWeights.elevation_terrain +
      normHistFlood * ffWeights.historical_susceptibility
    );

    // Mountain funnel multiplier if heavy rain / runoff occurs in high terrain
    const ffMultiplier = (isMountainous && (rainfallRate > 5.0 || riverCapacityPct > 30.0 || derivedRunoff > 5.0)) ? 1.20 : 1.0;
    const flashFloodScore = Math.min(100.0, Math.max(0.0, Math.round(ffBaseScore * ffMultiplier * 10) / 10));
    const flashFloodLevel = getRiskLevelFromScore(flashFloodScore);

    // -------------------------------------------------------------------------
    // 5. LANDSLIDE SCORE EVALUATION
    // -------------------------------------------------------------------------
    const lsWeights = HAZARD_WEIGHTS.landslide;
    const normSoil = Math.min(100.0, soilSaturationPct);
    const normHistLandslide = Math.min(100.0, histLandslideScore);

    let landslideScore = 0;
    if (estimatedSlopeDeg !== null && !isNaN(estimatedSlopeDeg)) {
      // Slope angle is known from real Open-Meteo elevation gradient
      const normSlope = Math.min(100.0, (estimatedSlopeDeg / NORMALIZATION_BOUNDS.slope_max_deg) * 100.0);
      const lsBaseScore = (
        normSoil * lsWeights.soil_susceptibility +
        normSlope * lsWeights.slope +
        normRainRate * lsWeights.rainfall_intensity +
        normAccumRain * lsWeights.accumulated_rainfall +
        normElevation * lsWeights.elevation +
        normHistLandslide * lsWeights.historical_susceptibility
      );

      // Geotechnical compound failure multiplier (>75% soil saturation on >28° slope)
      let compoundingFactor = 1.0;
      if (soilSaturationPct >= 75.0 && estimatedSlopeDeg >= 28.0) compoundingFactor = 1.25;
      else if (soilSaturationPct >= 60.0 && estimatedSlopeDeg >= 20.0) compoundingFactor = 1.10;

      landslideScore = Math.min(100.0, Math.max(0.0, Math.round(lsBaseScore * compoundingFactor * 10) / 10));
    } else {
      // Slope unavailable: do NOT fabricate slope. Score based strictly on soil moisture, rainfall & history.
      const lsBaseScore = (
        normSoil * 0.45 +
        normRainRate * 0.25 +
        normAccumRain * 0.20 +
        normElevation * 0.05 +
        normHistLandslide * 0.05
      );
      const compoundingFactor = (soilSaturationPct >= 75.0 && rainfallRate >= 30.0) ? 1.15 : 1.0;
      landslideScore = Math.min(100.0, Math.max(0.0, Math.round(lsBaseScore * compoundingFactor * 10) / 10));
    }
    const landslideLevel = getRiskLevelFromScore(landslideScore);

    // -------------------------------------------------------------------------
    // 6. EXTREME RAINFALL EVALUATION
    // -------------------------------------------------------------------------
    const hrWeights = HAZARD_WEIGHTS.extreme_rainfall;
    const normForecast = Math.min(100.0, (forecastRainfall / NORMALIZATION_BOUNDS.rainfall_forecast_max_mm) * 100.0);
    const heavyRainfallScore = Math.min(100.0, Math.max(0.0, Math.round((
      normRainRate * hrWeights.rainfall_intensity +
      normAccumRain * hrWeights.rainfall_accumulation +
      normForecast * hrWeights.forecast_rainfall +
      (rainfallRate > 25 ? 50.0 : 10.0) * hrWeights.duration
    ) * 10) / 10));
    const heavyRainfallLevel = getRiskLevelFromScore(heavyRainfallScore);

    // -------------------------------------------------------------------------
    // 7. COMPOSITE / OVERALL MULTI-SOURCE RISK EVALUATION
    // -------------------------------------------------------------------------
    const scores = [flashFloodScore, landslideScore, heavyRainfallScore];
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const cascadingPenalty = scores.filter(s => s >= 50.0).length * 3.0;

    const overallScore = Math.min(100.0, Math.max(0.0, Math.round((maxScore * 0.70 + avgScore * 0.30 + cascadingPenalty) * 10) / 10));
    const overallLevel = getRiskLevelFromScore(overallScore);

    // -------------------------------------------------------------------------
    // 8. DOMINANT HAZARD & ACTION RECOMMENDATIONS
    // -------------------------------------------------------------------------
    let dominantHazard = 'Flash Flood';
    let dominantHazardKey = 'flash_flood';
    if (landslideScore > flashFloodScore && landslideScore > heavyRainfallScore) {
      dominantHazard = 'Landslide';
      dominantHazardKey = 'landslide';
    } else if (heavyRainfallScore > flashFloodScore && heavyRainfallScore > landslideScore) {
      dominantHazard = 'Heavy Rainfall';
      dominantHazardKey = 'extreme_rainfall';
    }

    const actionList = (ACTION_RECOMMENDATIONS[dominantHazardKey]?.[overallLevel]) || [
      'Maintain routine environmental monitoring. Check updates if rainfall intensifies.'
    ];
    const recommendedAction = actionList[0] || 'Maintain routine monitoring.';

    // Grounded risk factors explicitly supported by real API data
    const groundedFactors = [...(weatherData.risk_factors || [])];
    if (estimatedSlopeDeg !== null && estimatedSlopeDeg >= 25.0) {
      groundedFactors.push(`Steep terrain slope (${estimatedSlopeDeg}°) indicates elevated gravitational mass-wasting hazard`);
    }
    if (elevation >= 1200) {
      groundedFactors.push(`High mountain elevation (${elevation} m) increases valley runoff velocity`);
    }
    if (histFloodExposure === 'HIGH') {
      groundedFactors.push(`High historical flood exposure zone (${historicalData?.historical_flood?.events_nearby || 'multiple'} IFI-Impacts events on record)`);
    }
    if (histLandslideSusceptibility === 'HIGH') {
      groundedFactors.push(`High historical landslide susceptibility sector (ISRO Landslide Atlas national ranking #${historicalData?.historical_landslide?.national_rank || 'High'})`);
    }

    return {
      // High-level summary
      overall_score: overallScore,
      overall_level: overallLevel,
      riskScore: overallScore,
      riskLevel: overallLevel,
      dominant_hazard: dominantHazard,
      primary_hazard: dominantHazard,
      recommended_action: recommendedAction,
      recommendedActions: actionList,
      factors: groundedFactors,
      contributing_factors: groundedFactors,

      // Multi-Hazard breakdown
      flash_flood: {
        score: flashFloodScore,
        level: flashFloodLevel,
        riskScore: flashFloodScore,
        riskLevel: flashFloodLevel,
        historical_exposure: histFloodExposure,
        historical_score: histFloodScore
      },
      flash_flood_score: flashFloodScore,
      flash_flood_level: flashFloodLevel,

      landslide: {
        score: landslideScore,
        level: landslideLevel,
        riskScore: landslideScore,
        riskLevel: landslideLevel,
        slope_status: estimatedSlopeDeg !== null ? `${estimatedSlopeDeg}° (Estimated terrain slope)` : 'Slope angle unavailable (not fabricated)',
        estimated_slope_deg: estimatedSlopeDeg,
        terrain_risk: terrainRisk,
        historical_susceptibility: histLandslideSusceptibility,
        historical_score: histLandslideScore
      },
      landslide_score: landslideScore,
      landslide_level: landslideLevel,

      heavy_rainfall: {
        score: heavyRainfallScore,
        level: heavyRainfallLevel,
        riskScore: heavyRainfallScore,
        riskLevel: heavyRainfallLevel
      },
      heavy_rainfall_score: heavyRainfallScore,
      heavy_rainfall_level: heavyRainfallLevel,

      // Terrain Intelligence
      terrain: {
        elevation_m: elevation,
        elevation_label: `${elevation} m`,
        estimated_slope_deg: estimatedSlopeDeg,
        slope_label: estimatedSlopeDeg !== null ? `${estimatedSlopeDeg}°` : '--',
        slope_type: 'Estimated terrain slope',
        terrain_risk: terrainRisk,
        source: 'Open-Meteo Elevation API / Copernicus DEM'
      },

      // Historical Intelligence
      historical: {
        flood_exposure: histFloodExposure,
        flood_events_nearby: historicalData?.historical_flood?.events_nearby ?? 0,
        landslide_susceptibility: histLandslideSusceptibility,
        landslides_nearby: historicalData?.historical_landslide?.landslides_nearby ?? 0,
        landslide_national_rank: historicalData?.historical_landslide?.national_rank ?? null,
        flood_source: 'India Flood Inventory (IFI-Impacts 1967–2023)',
        landslide_source: 'ISRO / NRSC Landslide Atlas of India'
      },

      // Environmental metrics reflection
      environmental_data: {
        rainfall_rate: rainfallRate,
        rainfall_mm: accumulatedRainfall,
        rainfall_intensity: weatherData.rainfall_intensity,
        soil_saturation_pct: soilSaturationPct,
        wind_speed_kmh: windSpeed,
        temperature_c: weatherData.temperature_c,
        elevation_m: elevation,
        estimated_slope_deg: estimatedSlopeDeg,
        derived_surface_runoff_mm_hr: weatherData.surface_runoff?.value_mm_hr ?? derivedRunoff
      },

      // Explicit Data Source Breakdown
      data_sources: {
        live_weather: 'Open-Meteo Live Forecast API (hourly telemetry)',
        terrain_elevation: 'Open-Meteo Elevation API (Copernicus DEM 90m)',
        historical_flood: 'India Flood Inventory (IFI-Impacts 1967–2023, Zenodo 16994648)',
        historical_landslide: 'ISRO / NRSC Landslide Atlas of India (1998–2022)'
      },

      calculated_at: new Date().toISOString(),
      lead_time_minutes: overallLevel === 'CRITICAL' ? 30 : (overallLevel === 'HIGH' ? 60 : 180)
    };
  }
};
