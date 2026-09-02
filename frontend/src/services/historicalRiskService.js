import historicalFloodData from '../data/historicalFloodData.json';
import historicalLandslideData from '../data/historicalLandslideData.json';

/**
 * =============================================================================
 * Historical Disaster Risk & Susceptibility Intelligence Service
 * =============================================================================
 * 
 * Sourced strictly from:
 * 1. India Flood Inventory with Impacts (IFI-Impacts) [1967-2023] (Zenodo 16994648 / IIT Delhi & IMD)
 * 2. ISRO / NRSC Landslide Atlas of India (1998-2022)
 * 
 * IMPORTANT SAFETY RULE:
 * Historical occurrence does NOT automatically mean that an active flood or landslide
 * is happening now. It serves exclusively as a baseline empirical susceptibility factor.
 */

// Haversine geodesic distance in kilometers between two coordinates
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const historicalRiskService = {
  /**
   * Evaluate historical disaster risk, event frequency, and susceptibility
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {string} locationName 
   * @returns {object} Standardized historical intelligence payload
   */
  evaluateHistoricalRisk(latitude, longitude, locationName = '') {
    const lat = Number(latitude);
    const lng = Number(longitude);

    const floodRecords = historicalFloodData.records || [];
    const landslideRecords = historicalLandslideData.records || [];

    // 1. FLOOD ANALYSIS (India Flood Inventory 1967-2023)
    let matchedFlood = null;
    let minFloodDist = Infinity;

    // Check name match or coordinate proximity within ~75 km radius
    for (const rec of floodRecords) {
      const dist = calculateDistanceKm(lat, lng, rec.lat, rec.lng);
      const nameMatch = locationName && (
        rec.district.toLowerCase().includes(locationName.toLowerCase()) ||
        locationName.toLowerCase().includes(rec.district.toLowerCase())
      );

      if (nameMatch || dist < minFloodDist) {
        if (dist < minFloodDist) {
          minFloodDist = dist;
          matchedFlood = { ...rec, distance_km: Math.round(dist * 10) / 10 };
        }
      }
    }

    // Determine flood exposure based on proximity or regional baseline
    let floodEventsNearby = 0;
    let floodExposure = 'LOW';
    let floodScore = 20.0;
    let floodDetails = [];

    if (matchedFlood && minFloodDist <= 85.0) {
      floodEventsNearby = matchedFlood.total_historical_events || (matchedFlood.events?.length || 0);
      floodExposure = matchedFlood.flood_exposure_tier || 'MODERATE';
      floodScore = matchedFlood.exposure_score || (floodEventsNearby >= 8 ? 75.0 : 45.0);
      floodDetails = matchedFlood.events || [];
    } else {
      // General baseline for points outside mapped hazard corridors
      floodEventsNearby = 0;
      floodExposure = 'LOW';
      floodScore = 15.0;
    }

    // 2. LANDSLIDE ANALYSIS (ISRO / NRSC Landslide Atlas of India)
    let matchedLandslide = null;
    let minLandslideDist = Infinity;

    for (const rec of landslideRecords) {
      const dist = calculateDistanceKm(lat, lng, rec.lat, rec.lng);
      const nameMatch = locationName && (
        rec.district.toLowerCase().includes(locationName.toLowerCase()) ||
        locationName.toLowerCase().includes(rec.district.toLowerCase())
      );

      if (nameMatch || dist < minLandslideDist) {
        if (dist < minLandslideDist) {
          minLandslideDist = dist;
          matchedLandslide = { ...rec, distance_km: Math.round(dist * 10) / 10 };
        }
      }
    }

    let landslideEventsNearby = 0;
    let landslideSusceptibility = 'LOW';
    let landslideScore = 15.0;
    let landslideRank = null;
    let landslideDetails = [];

    if (matchedLandslide && minLandslideDist <= 85.0) {
      landslideEventsNearby = matchedLandslide.recorded_landslides_count || 0;
      landslideSusceptibility = matchedLandslide.susceptibility_tier || 'HIGH';
      landslideScore = matchedLandslide.susceptibility_score || 70.0;
      landslideRank = matchedLandslide.national_landslide_rank || null;
      landslideDetails = matchedLandslide.notable_incidents || [];
    } else {
      landslideEventsNearby = 0;
      landslideSusceptibility = 'LOW';
      landslideScore = 15.0;
    }

    return {
      // Historical Flood Exposure
      historical_flood: {
        events_nearby: floodEventsNearby,
        events_count_label: `${floodEventsNearby} recorded`,
        exposure: floodExposure,
        exposure_label: floodExposure,
        score: floodScore,
        matched_district: matchedFlood?.district || null,
        distance_km: matchedFlood ? minFloodDist : null,
        notable_events: floodDetails,
        source: 'India Flood Inventory (IFI-Impacts 1967–2023)',
        doi: '10.5281/zenodo.16994648'
      },

      // Historical Landslide Susceptibility
      historical_landslide: {
        landslides_nearby: landslideEventsNearby,
        landslides_count_label: `${landslideEventsNearby} cataloged`,
        susceptibility: landslideSusceptibility,
        susceptibility_label: landslideSusceptibility,
        score: landslideScore,
        national_rank: landslideRank,
        matched_district: matchedLandslide?.district || null,
        distance_km: matchedLandslide ? minLandslideDist : null,
        notable_incidents: landslideDetails,
        source: 'ISRO / NRSC Landslide Atlas of India (1998–2022)'
      },

      // Context explanation & safety distinction
      nature_of_data: 'HISTORICAL_SUSCEPTIBILITY',
      disclaimer: 'Historical occurrence provides empirical baseline susceptibility and does NOT indicate that an active disaster is currently in progress.'
    };
  }
};
