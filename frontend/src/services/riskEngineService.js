/**
 * =============================================================================
 * PralayWatch Risk Intelligence Engine (Client-Side Standardized Service)
 * =============================================================================
 * 
 * Preserves the EXACT deterministic scoring logic, weights, normalization bounds,
 * and thresholds from the Python backend PralayWatchRiskEngine (backend/risk_config.py
 * & backend/services/predictors/).
 * 
 * Flow:
 * Open-Meteo -> Real Weather Data -> PralayWatch Risk Engine -> Risk Scores -> Dashboard
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

// 5. Standardized Life-Safety Directives matching backend ACTION_RECOMMENDATIONS
export const ACTION_RECOMMENDATIONS = {
  flash_flood: {
    CRITICAL: [
      'Move away from low-lying areas and riverbanks immediately',
      'Avoid river crossings, bridges, and culverts',
      'Move toward designated high-ground safe zones / shelters',
      'Shut off main electricity and gas supplies before leaving'
    ],
    HIGH: [
      'Prepare emergency go-bags and identify nearest high-ground refuge',
      'Avoid parking vehicles near drainage culverts or riverbeds',
      'Monitor live SDMA / CWC hydro-gauge warning broadcasts'
    ],
    MODERATE: [
      'Inspect perimeter stormwater drainage around residence',
      'Stay alert to upstream cloudburst reports in surrounding hills'
    ],
    LOW: [
      'Maintain routine awareness. No active evacuation required.'
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
      'Follow official IMD Doppler radar nowcast instructions'
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
   * Evaluate multi-hazard risk using real weather data + optional terrain parameters
   * @param {object} weatherData - Parsed Open-Meteo telemetry
   * @param {object} locationMetadata - Optional location context (elevation, terrain, slope if known)
   * @returns {object} Standardized PralayWatch risk assessment payload
   */
  evaluateLiveRisk(weatherData, locationMetadata = {}) {
    if (!weatherData) {
      return null;
    }

    // Extract real weather variables
    const rainfallRate = Number(weatherData.precipitation_mm_hr || weatherData.rain_mm_hr || 0.0);
    const accumulatedRainfall = Number(weatherData.forecast_24h_precipitation_mm || weatherData.forecast_24h_rain_mm || 0.0);
    const forecastRainfall = Number(weatherData.forecast_24h_precipitation_mm || 0.0);
    const soilSaturationPct = Number(weatherData.soil_saturation_pct || 30.0);
    const windSpeed = Number(weatherData.wind_speed_kmh || 5.0);

    // Location & Terrain: Use existing project terrain data if available, otherwise do NOT fabricate slope
    const elevation = Number(locationMetadata.elevation ?? weatherData.elevation ?? 800.0);
    const terrainType = locationMetadata.terrain_type || (elevation >= 1000 ? 'Mountainous / Valley' : 'Plains / Basin');
    const isVulnerable = Boolean(locationMetadata.is_vulnerable ?? (elevation >= 1000));
    
    // Check if real/stored slope exists in existing location database
    const hasExistingSlope = locationMetadata.slope_deg !== undefined && locationMetadata.slope_deg !== null;
    const slopeDeg = hasExistingSlope ? Number(locationMetadata.slope_deg) : null;

    const riverCapacityPct = Number(locationMetadata.river_capacity_pct ?? (rainfallRate > 20 ? Math.min(95, 30 + rainfallRate * 1.5) : 30.0));
    const riverTrendStr = locationMetadata.river_trend || (rainfallRate >= 30 ? 'Rising Rapidly' : (rainfallRate >= 10 ? 'Rising' : 'Normal'));
    const riverTrendScore = RIVER_TREND_SCORES[riverTrendStr] || 15.0;

    const historicalFloodRisk = Number(locationMetadata.historical_flood_risk ?? (isVulnerable ? 65.0 : 20.0));
    const historicalLandslideRisk = Number(locationMetadata.historical_landslide_risk ?? (isVulnerable ? 60.0 : 15.0));

    // -------------------------------------------------------------------------
    // 1. Flash Flood Score Evaluation (Matches FlashFloodPredictor)
    // -------------------------------------------------------------------------
    const ffWeights = HAZARD_WEIGHTS.flash_flood;
    const normRainRate = Math.min(100.0, (rainfallRate / NORMALIZATION_BOUNDS.rainfall_rate_max_mm_hr) * 100.0);
    const normAccumRain = Math.min(100.0, (accumulatedRainfall / NORMALIZATION_BOUNDS.rainfall_accum_max_mm) * 100.0);
    const normRiverLevel = Math.min(100.0, riverCapacityPct);
    const normRiverTrend = Math.min(100.0, riverTrendScore);
    const normElevation = Math.min(100.0, (elevation / 3000.0) * 100.0);
    const normHistFlood = Math.min(100.0, historicalFloodRisk);

    const ffBaseScore = (
      normRainRate * ffWeights.rainfall_intensity +
      normAccumRain * ffWeights.accumulated_rainfall +
      normRiverLevel * ffWeights.river_water_level +
      normRiverTrend * ffWeights.river_trend +
      normElevation * ffWeights.elevation_terrain +
      normHistFlood * ffWeights.historical_susceptibility
    );

    const isMountainValley = terrainType.includes('Mountain') || terrainType.includes('Valley') || elevation >= 1000.0;
    const ffMultiplier = (isMountainValley && (rainfallRate > 5.0 || riverCapacityPct > 30.0)) ? 1.25 : 1.0;
    const flashFloodScore = Math.min(100.0, Math.max(0.0, Math.round(ffBaseScore * ffMultiplier * 10) / 10));
    const flashFloodLevel = getRiskLevelFromScore(flashFloodScore);

    // -------------------------------------------------------------------------
    // 2. Landslide Score Evaluation (Matches LandslidePredictor)
    // -------------------------------------------------------------------------
    const lsWeights = HAZARD_WEIGHTS.landslide;
    const normSoil = Math.min(100.0, soilSaturationPct);
    const normHistLandslide = Math.min(100.0, historicalLandslideRisk);

    let landslideScore = 0;
    if (slopeDeg !== null && !isNaN(slopeDeg)) {
      // Slope angle is known from existing location data
      const normSlope = Math.min(100.0, (slopeDeg / NORMALIZATION_BOUNDS.slope_max_deg) * 100.0);
      const lsBaseScore = (
        normSoil * lsWeights.soil_susceptibility +
        normSlope * lsWeights.slope +
        normRainRate * lsWeights.rainfall_intensity +
        normAccumRain * lsWeights.accumulated_rainfall +
        normElevation * lsWeights.elevation +
        normHistLandslide * lsWeights.historical_susceptibility
      );

      // Geotechnical compound failure threshold (>75% soil saturation on >30° slope)
      let compoundingFactor = 1.0;
      if (soilSaturationPct >= 75.0 && slopeDeg >= 30.0) compoundingFactor = 1.25;
      else if (soilSaturationPct >= 60.0 && slopeDeg >= 25.0) compoundingFactor = 1.10;

      landslideScore = Math.min(100.0, Math.max(0.0, Math.round(lsBaseScore * compoundingFactor * 10) / 10));
    } else {
      // Slope angle unavailable for custom lat/long: do NOT fabricate slope.
      // Score based purely on soil moisture saturation and precipitation trigger.
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
    // 3. Extreme Rainfall Score Evaluation (Matches ExtremeRainfallPredictor)
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
    // 4. Composite / Overall Score Evaluation (Matches DisasterIntelligencePipeline)
    // -------------------------------------------------------------------------
    const scores = [flashFloodScore, landslideScore, heavyRainfallScore];
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const cascadingPenalty = scores.filter(s => s >= 50.0).length * 3.0;

    const overallScore = Math.min(100.0, Math.max(0.0, Math.round((maxScore * 0.70 + avgScore * 0.30 + cascadingPenalty) * 10) / 10));
    const overallLevel = getRiskLevelFromScore(overallScore);

    // -------------------------------------------------------------------------
    // 5. Dominant Hazard Identification
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

    // -------------------------------------------------------------------------
    // 6. Action Directives & Grounded Risk Factors
    // -------------------------------------------------------------------------
    const actionList = (ACTION_RECOMMENDATIONS[dominantHazardKey]?.[overallLevel]) || [
      'Maintain routine environmental monitoring. Check updates if rainfall intensifies.'
    ];
    const recommendedAction = actionList[0] || 'Maintain routine monitoring.';

    // Only factors supported by real Open-Meteo data
    const groundedFactors = [...(weatherData.risk_factors || [])];
    if (slopeDeg !== null && slopeDeg >= 30) {
      groundedFactors.push(`Steep terrain slope (${slopeDeg}°) in sector`);
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
        riskLevel: flashFloodLevel
      },
      flash_flood_score: flashFloodScore,
      flash_flood_level: flashFloodLevel,

      landslide: {
        score: landslideScore,
        level: landslideLevel,
        riskScore: landslideScore,
        riskLevel: landslideLevel,
        slope_status: slopeDeg !== null ? `${slopeDeg}°` : 'Slope angle unavailable (not fabricated)'
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

      // Environmental metrics reflection
      environmental_data: {
        rainfall_rate: rainfallRate,
        rainfall_mm: accumulatedRainfall,
        rainfall_intensity: weatherData.rainfall_intensity,
        soil_saturation_pct: soilSaturationPct,
        wind_speed_kmh: windSpeed,
        temperature_c: weatherData.temperature_c,
        slope_deg: slopeDeg,
        derived_surface_runoff_mm_hr: weatherData.surface_runoff?.value_mm_hr ?? null
      },

      calculated_at: new Date().toISOString(),
      lead_time_minutes: overallLevel === 'CRITICAL' ? 30 : (overallLevel === 'HIGH' ? 60 : 180)
    };
  }
};
