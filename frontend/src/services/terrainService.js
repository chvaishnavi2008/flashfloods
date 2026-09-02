// OPEN-METEO ELEVATION API & TERRAIN SLOPE SERVICE
// Documentation: https://open-meteo.com/en/docs/elevation-api
// No API key is required for prototype non-commercial access.

/**
 * =============================================================================
 * Terrain & Geomorphometric Elevation Service
 * =============================================================================
 * Connects directly to the Open-Meteo Elevation API (Copernicus DEM 90m release).
 * 
 * To estimate local terrain slope without fabrication:
 * 1. Retrieves real elevation at the target point (lat, lng)
 * 2. Retrieves real elevations at 4 nearby cardinal points (North, South, East, West ~500m offset)
 * 3. Calculates horizontal geodesic distances
 * 4. Calculates elevation differences (dz/dx, dz/dy)
 * 5. Calculates 2D gradient slope angle in degrees: arctan(sqrt(dz/dx^2 + dz/dy^2)) * (180 / PI)
 * 
 * Result is clearly labeled as: "Estimated terrain slope" (Prototype estimate, not official survey).
 */

const OPEN_METEO_ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation';

// Client-side cache to avoid excessive requests
const terrainCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export const terrainService = {
  /**
   * Fetch real elevation and calculate estimated terrain slope for given coordinates
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {boolean} forceRefresh 
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async fetchTerrainData(latitude, longitude, forceRefresh = false) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return {
        success: false,
        error: 'Invalid coordinates provided for terrain lookup.'
      };
    }

    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = terrainCache.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return {
        success: true,
        data: cached.data,
        fromCache: true
      };
    }

    try {
      // 1. Prepare multi-point grid coordinates for single batch request
      // Delta approx ~0.005 degrees (~555 meters at equator)
      const dLat = 0.005;
      const cosLat = Math.cos((lat * Math.PI) / 180);
      const dLng = Math.abs(cosLat) > 0.01 ? (0.005 / cosLat) : 0.005;

      const queryLats = [
        lat,                  // [0] Center target point
        lat + dLat,           // [1] North
        lat - dLat,           // [2] South
        lat,                  // [3] East
        lat                   // [4] West
      ];

      const queryLngs = [
        lng,                  // [0] Center target point
        lng,                  // [1] North
        lng,                  // [2] South
        lng + dLng,           // [3] East
        lng - dLng            // [4] West
      ];

      const url = new URL(OPEN_METEO_ELEVATION_URL);
      url.searchParams.set('latitude', queryLats.map(v => v.toFixed(5)).join(','));
      url.searchParams.set('longitude', queryLngs.map(v => v.toFixed(5)).join(','));

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.error(`[terrainService] Open-Meteo Elevation API returned status ${response.status}`);
        return {
          success: false,
          error: 'Elevation data temporarily unavailable from Open-Meteo.'
        };
      }

      const json = await response.json();
      const elevations = json.elevation;

      if (!Array.isArray(elevations) || elevations.length < 5) {
        throw new Error('Incomplete elevation profile returned from API.');
      }

      // 2. Parse elevations
      const centerElev = Number(elevations[0]);
      const northElev = Number(elevations[1]);
      const southElev = Number(elevations[2]);
      const eastElev = Number(elevations[3]);
      const westElev = Number(elevations[4]);

      // 3. Compute metric ground distances
      const distLatMeters = dLat * 111139.0;
      const distLngMeters = dLng * 111139.0 * Math.abs(cosLat);

      // 4. Directional slopes
      const slopeN = Math.atan(Math.abs(northElev - centerElev) / distLatMeters) * (180.0 / Math.PI);
      const slopeS = Math.atan(Math.abs(southElev - centerElev) / distLatMeters) * (180.0 / Math.PI);
      const slopeE = Math.atan(Math.abs(eastElev - centerElev) / distLngMeters) * (180.0 / Math.PI);
      const slopeW = Math.atan(Math.abs(westElev - centerElev) / distLngMeters) * (180.0 / Math.PI);

      const maxDirectionalSlope = Math.max(slopeN, slopeS, slopeE, slopeW);

      // 5. 2D Surface Gradient: dz/dx and dz/dy
      const dz_dy = (northElev - southElev) / (2.0 * distLatMeters);
      const dz_dx = (eastElev - westElev) / (2.0 * distLngMeters);
      const gradient = Math.sqrt(dz_dx * dz_dx + dz_dy * dz_dy);
      const gradientSlopeDeg = Math.atan(gradient) * (180.0 / Math.PI);

      // Best estimate combining overall gradient and local directional peak
      const estimatedSlopeDeg = Math.round(Math.max(gradientSlopeDeg, maxDirectionalSlope) * 10) / 10;

      // 6. Terrain Risk Classification
      let terrainRisk = 'LOW';
      let terrainRiskLabel = 'Gentle / Plains (<15°)';
      if (estimatedSlopeDeg >= 30.0) {
        terrainRisk = 'HIGH';
        terrainRiskLabel = 'Steep Escarpment / High Hazard (≥30°)';
      } else if (estimatedSlopeDeg >= 15.0) {
        terrainRisk = 'MODERATE';
        terrainRiskLabel = 'Moderate Hillside Slope (15°–30°)';
      }

      const resultData = {
        source: 'Open-Meteo Elevation API (Copernicus DEM 90m)',
        latitude: lat,
        longitude: lng,
        elevation_m: Math.round(centerElev),
        elevation_label: `${Math.round(centerElev)} m`,
        estimated_slope_deg: estimatedSlopeDeg,
        slope_label: `${estimatedSlopeDeg}°`,
        slope_type: 'Estimated terrain slope',
        terrain_risk: terrainRisk,
        terrain_risk_label: terrainRiskLabel,
        surrounding_profile: {
          north_m: Math.round(northElev),
          south_m: Math.round(southElev),
          east_m: Math.round(eastElev),
          west_m: Math.round(westElev),
          sample_radius_meters: Math.round(distLatMeters)
        },
        fetched_at: new Date().toISOString()
      };

      // Cache validated data
      terrainCache.set(cacheKey, {
        timestamp: now,
        data: resultData
      });

      return {
        success: true,
        data: resultData,
        fromCache: false
      };
    } catch (err) {
      console.error('[terrainService] Error fetching terrain data:', err);
      return {
        success: false,
        error: 'Terrain data temporarily unavailable.'
      };
    }
  }
};
