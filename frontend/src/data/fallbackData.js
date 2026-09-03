/**
 * PralayWatch Phase 1 Fallback Data
 * Provides reliable baseline data for all 31 high-vulnerability sectors across India
 * and neighboring regions, ensuring full operational capability even when deployed on static hosts (Vercel)
 * or when the backend service is unreachable.
 */

export const FALLBACK_LOCATIONS = [
  // --- UTTARAKHAND ---
  {
    id: 1,
    name: "Chamoli",
    region: "Alaknanda Basin",
    state: "Uttarakhand",
    country: "India",
    lat: 30.4124,
    lng: 79.3198,
    elevation: 1300,
    slope: 34,
    population: 22400,
    terrain_type: "Mountain Valley Corridor",
    current_risk: {
      overall_score: 72,
      overall_level: "HIGH",
      dominant_hazard: "flash_flood",
      flash_flood_score: 76,
      landslide_score: 68,
      heavy_rainfall_score: 70,
      lead_time_minutes: 30,
      contributing_factors: "Steep river canyon, saturation 78%, precipitation rate 52mm/h",
      recommended_action: "Immediate evacuation of riverbank floodplains; move uphill to designated relief havens."
    },
    environmental_data: {
      rainfall_mm: 78.0,
      rainfall_rate: 52.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 4.9,
      river_capacity_pct: 76.0,
      river_trend: "Rising",
      soil_saturation_pct: 78.0,
      slope_deg: 34.0,
      slope_stability: "High Shear Stress"
    }
  },
  {
    id: 2,
    name: "Joshimath",
    region: "Garhwal",
    state: "Uttarakhand",
    country: "India",
    lat: 30.5539,
    lng: 79.5658,
    elevation: 1875,
    slope: 36,
    population: 16700,
    terrain_type: "Steep Mountain Slope",
    current_risk: {
      overall_score: 88,
      overall_level: "CRITICAL",
      dominant_hazard: "landslide",
      flash_flood_score: 65,
      landslide_score: 92,
      heavy_rainfall_score: 80,
      lead_time_minutes: 20,
      contributing_factors: "Severe slope subsidence, soil saturation 92%, ongoing heavy precipitation",
      recommended_action: "Immediate structural evacuation; do not stay inside cracked masonry buildings."
    },
    environmental_data: {
      rainfall_mm: 125.0,
      rainfall_rate: 88.0,
      rainfall_intensity: "Torrential Cloudburst",
      river_level_m: 6.1,
      river_capacity_pct: 92.0,
      river_trend: "Rising Rapidly",
      soil_saturation_pct: 92.0,
      slope_deg: 36.0,
      slope_stability: "Critical / Imminent Slip"
    }
  },
  {
    id: 3,
    name: "Kedarnath",
    region: "Mandakini Basin",
    state: "Uttarakhand",
    country: "India",
    lat: 30.7346,
    lng: 79.0669,
    elevation: 3583,
    slope: 38,
    population: 8500,
    terrain_type: "High Himalayan Catchment",
    current_risk: {
      overall_score: 85,
      overall_level: "CRITICAL",
      dominant_hazard: "flash_flood",
      flash_flood_score: 89,
      landslide_score: 78,
      heavy_rainfall_score: 86,
      lead_time_minutes: 25,
      contributing_factors: "Glacial moraine catchment deluge, intense cloudburst rates",
      recommended_action: "Ascend elevated reinforced valley shelter ridges; stay clear of Mandakini riverbed."
    },
    environmental_data: {
      rainfall_mm: 130.0,
      rainfall_rate: 90.0,
      rainfall_intensity: "Torrential Cloudburst",
      river_level_m: 6.3,
      river_capacity_pct: 94.0,
      river_trend: "Rising Rapidly",
      soil_saturation_pct: 88.0,
      slope_deg: 38.0,
      slope_stability: "Critical Slopes"
    }
  },
  {
    id: 4,
    name: "Dehradun",
    region: "Doon Valley",
    state: "Uttarakhand",
    country: "India",
    lat: 30.3165,
    lng: 78.0322,
    elevation: 640,
    slope: 18,
    population: 578000,
    terrain_type: "Valley Basin",
    current_risk: {
      overall_score: 38,
      overall_level: "MODERATE",
      dominant_hazard: "flash_flood",
      flash_flood_score: 42,
      landslide_score: 25,
      heavy_rainfall_score: 45,
      lead_time_minutes: 60,
      contributing_factors: "Urban stream drainage swell near Bindal & Rispana rivers",
      recommended_action: "Avoid driving through water-covered low bridges and subways."
    },
    environmental_data: {
      rainfall_mm: 38.0,
      rainfall_rate: 22.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.2,
      river_capacity_pct: 52.0,
      river_trend: "Stable",
      soil_saturation_pct: 54.0,
      slope_deg: 18.0,
      slope_stability: "Moderate Watch"
    }
  },
  {
    id: 5,
    name: "Uttarkashi",
    region: "Bhagirathi Valley",
    state: "Uttarakhand",
    country: "India",
    lat: 30.7268,
    lng: 78.4354,
    elevation: 1158,
    slope: 32,
    population: 34000,
    terrain_type: "High Vulnerability Valley",
    current_risk: {
      overall_score: 68,
      overall_level: "HIGH",
      dominant_hazard: "landslide",
      flash_flood_score: 62,
      landslide_score: 74,
      heavy_rainfall_score: 66,
      lead_time_minutes: 40,
      contributing_factors: "Bhagirathi gorge water rise combined with active hillside debris runout",
      recommended_action: "Monitor national highway corridors and stay clear of unstable cut slopes."
    },
    environmental_data: {
      rainfall_mm: 72.0,
      rainfall_rate: 48.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 4.6,
      river_capacity_pct: 74.0,
      river_trend: "Rising",
      soil_saturation_pct: 76.0,
      slope_deg: 32.0,
      slope_stability: "High Shear Stress"
    }
  },

  // --- HIMACHAL PRADESH ---
  {
    id: 6,
    name: "Kullu - Manali",
    region: "Beas Basin",
    state: "Himachal Pradesh",
    country: "India",
    lat: 31.9579,
    lng: 77.1095,
    elevation: 1279,
    slope: 32,
    population: 43500,
    terrain_type: "High-Flow River Catchment",
    current_risk: {
      overall_score: 74,
      overall_level: "HIGH",
      dominant_hazard: "flash_flood",
      flash_flood_score: 78,
      landslide_score: 68,
      heavy_rainfall_score: 72,
      lead_time_minutes: 35,
      contributing_factors: "Beas river discharge swelling, catchment deluge",
      recommended_action: "Evacuate riverside campsites, hotels, and low roadways immediately."
    },
    environmental_data: {
      rainfall_mm: 82.0,
      rainfall_rate: 55.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 5.1,
      river_capacity_pct: 80.0,
      river_trend: "Rising",
      soil_saturation_pct: 79.0,
      slope_deg: 32.0,
      slope_stability: "High Shear Stress"
    }
  },
  {
    id: 7,
    name: "Mandi",
    region: "Beas Valley",
    state: "Himachal Pradesh",
    country: "India",
    lat: 31.7087,
    lng: 76.9320,
    elevation: 760,
    slope: 26,
    population: 26000,
    terrain_type: "River Gorge Basin",
    current_risk: {
      overall_score: 46,
      overall_level: "MODERATE",
      dominant_hazard: "flash_flood",
      flash_flood_score: 50,
      landslide_score: 38,
      heavy_rainfall_score: 44,
      lead_time_minutes: 50,
      contributing_factors: "Pandoh dam backwater rise and local tributary inflow",
      recommended_action: "Stay away from riverbanks and low ghats."
    },
    environmental_data: {
      rainfall_mm: 42.0,
      rainfall_rate: 26.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.6,
      river_capacity_pct: 58.0,
      river_trend: "Rising Slowly",
      soil_saturation_pct: 58.0,
      slope_deg: 26.0,
      slope_stability: "Moderate Watch"
    }
  },
  {
    id: 8,
    name: "Shimla (Ward 4)",
    region: "Shimla Ridge",
    state: "Himachal Pradesh",
    country: "India",
    lat: 31.1048,
    lng: 77.1734,
    elevation: 2276,
    slope: 30,
    population: 21000,
    terrain_type: "Steep Urban Ridge",
    current_risk: {
      overall_score: 44,
      overall_level: "MODERATE",
      dominant_hazard: "landslide",
      flash_flood_score: 32,
      landslide_score: 48,
      heavy_rainfall_score: 40,
      lead_time_minutes: 60,
      contributing_factors: "Steep urban slope construction load with rain seepage",
      recommended_action: "Monitor retaining walls and road fissures."
    },
    environmental_data: {
      rainfall_mm: 40.0,
      rainfall_rate: 24.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 2.8,
      river_capacity_pct: 45.0,
      river_trend: "Stable",
      soil_saturation_pct: 55.0,
      slope_deg: 30.0,
      slope_stability: "Moderate Watch"
    }
  },
  {
    id: 9,
    name: "Dharamshala",
    region: "Kangra Valley",
    state: "Himachal Pradesh",
    country: "India",
    lat: 32.2190,
    lng: 76.3234,
    elevation: 1457,
    slope: 34,
    population: 53000,
    terrain_type: "Dhauladhar Slope",
    current_risk: {
      overall_score: 66,
      overall_level: "HIGH",
      dominant_hazard: "landslide",
      flash_flood_score: 58,
      landslide_score: 72,
      heavy_rainfall_score: 64,
      lead_time_minutes: 40,
      contributing_factors: "Bhagsunag stream torrent and steep slope instability",
      recommended_action: "Move away from mountain stream beds and steep slope cuts."
    },
    environmental_data: {
      rainfall_mm: 74.0,
      rainfall_rate: 49.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 4.4,
      river_capacity_pct: 72.0,
      river_trend: "Rising",
      soil_saturation_pct: 75.0,
      slope_deg: 34.0,
      slope_stability: "High Shear Stress"
    }
  },

  // --- SIKKIM ---
  {
    id: 10,
    name: "Chungthang",
    region: "North Sikkim",
    state: "Sikkim",
    country: "India",
    lat: 27.6039,
    lng: 88.6464,
    elevation: 1790,
    slope: 35,
    population: 12000,
    terrain_type: "Glacial Lake Outflow Basin",
    current_risk: {
      overall_score: 86,
      overall_level: "CRITICAL",
      dominant_hazard: "flash_flood",
      flash_flood_score: 90,
      landslide_score: 82,
      heavy_rainfall_score: 84,
      lead_time_minutes: 20,
      contributing_factors: "Teesta basin surge, high glacial runoff, torrential rain",
      recommended_action: "Immediate evacuation of lower Chungthang to elevated community centers."
    },
    environmental_data: {
      rainfall_mm: 132.0,
      rainfall_rate: 91.0,
      rainfall_intensity: "Torrential Cloudburst",
      river_level_m: 6.2,
      river_capacity_pct: 93.0,
      river_trend: "Rising Rapidly",
      soil_saturation_pct: 90.0,
      slope_deg: 35.0,
      slope_stability: "Critical Slopes"
    }
  },
  {
    id: 11,
    name: "Gangtok",
    region: "East Sikkim",
    state: "Sikkim",
    country: "India",
    lat: 27.3389,
    lng: 88.6065,
    elevation: 1650,
    slope: 30,
    population: 100000,
    terrain_type: "Active Slope Geohazard",
    current_risk: {
      overall_score: 48,
      overall_level: "MODERATE",
      dominant_hazard: "landslide",
      flash_flood_score: 36,
      landslide_score: 52,
      heavy_rainfall_score: 46,
      lead_time_minutes: 55,
      contributing_factors: "Hillside drainage saturation along national highway",
      recommended_action: "Exercise caution on NH-10 and keep emergency kit accessible."
    },
    environmental_data: {
      rainfall_mm: 45.0,
      rainfall_rate: 28.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.4,
      river_capacity_pct: 54.0,
      river_trend: "Stable",
      soil_saturation_pct: 60.0,
      slope_deg: 30.0,
      slope_stability: "Moderate Watch"
    }
  },

  // --- ASSAM ---
  {
    id: 12,
    name: "Guwahati (Brahmaputra)",
    region: "Kamrup",
    state: "Assam",
    country: "India",
    lat: 26.1445,
    lng: 91.7362,
    elevation: 55,
    slope: 8,
    population: 960000,
    terrain_type: "Major Floodplain Basin",
    current_risk: {
      overall_score: 22,
      overall_level: "LOW",
      dominant_hazard: "flood",
      flash_flood_score: 18,
      landslide_score: 10,
      heavy_rainfall_score: 24,
      lead_time_minutes: 180,
      contributing_factors: "Brahmaputra river gauge within safe normal limits",
      recommended_action: "Normal daily activities safe. Regular river level monitoring active."
    },
    environmental_data: {
      rainfall_mm: 8.0,
      rainfall_rate: 2.2,
      rainfall_intensity: "Light / Nominal",
      river_level_m: 1.8,
      river_capacity_pct: 28.0,
      river_trend: "Normal",
      soil_saturation_pct: 32.0,
      slope_deg: 8.0,
      slope_stability: "Stable"
    }
  },
  {
    id: 13,
    name: "Silchar",
    region: "Barak Valley",
    state: "Assam",
    country: "India",
    lat: 24.8333,
    lng: 92.7789,
    elevation: 22,
    slope: 6,
    population: 172000,
    terrain_type: "Inundation Floodplain",
    current_risk: {
      overall_score: 42,
      overall_level: "MODERATE",
      dominant_hazard: "flood",
      flash_flood_score: 46,
      landslide_score: 15,
      heavy_rainfall_score: 48,
      lead_time_minutes: 90,
      contributing_factors: "Barak river steady rise with moderate catchment showers",
      recommended_action: "Store essentials on elevated shelves; verify local embankment status."
    },
    environmental_data: {
      rainfall_mm: 36.0,
      rainfall_rate: 20.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.1,
      river_capacity_pct: 50.0,
      river_trend: "Rising Slowly",
      soil_saturation_pct: 52.0,
      slope_deg: 6.0,
      slope_stability: "Stable"
    }
  },
  {
    id: 14,
    name: "Kaziranga",
    region: "Golaghat",
    state: "Assam",
    country: "India",
    lat: 26.5775,
    lng: 93.1711,
    elevation: 64,
    slope: 5,
    population: 48000,
    terrain_type: "Wetland Floodplain",
    current_risk: {
      overall_score: 36,
      overall_level: "MODERATE",
      dominant_hazard: "flood",
      flash_flood_score: 40,
      landslide_score: 12,
      heavy_rainfall_score: 38,
      lead_time_minutes: 120,
      contributing_factors: "Seasonal water spread in wetland sanctuary channels",
      recommended_action: "Maintain wildlife corridor speed limits; watch low bridges."
    },
    environmental_data: {
      rainfall_mm: 32.0,
      rainfall_rate: 18.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 2.9,
      river_capacity_pct: 46.0,
      river_trend: "Stable",
      soil_saturation_pct: 48.0,
      slope_deg: 5.0,
      slope_stability: "Stable"
    }
  },

  // --- ARUNACHAL PRADESH ---
  {
    id: 15,
    name: "Pasighat",
    region: "Siang Catchment",
    state: "Arunachal Pradesh",
    country: "India",
    lat: 28.0664,
    lng: 95.3268,
    elevation: 155,
    slope: 20,
    population: 25000,
    terrain_type: "Riverine Foothills",
    current_risk: {
      overall_score: 44,
      overall_level: "MODERATE",
      dominant_hazard: "flash_flood",
      flash_flood_score: 48,
      landslide_score: 35,
      heavy_rainfall_score: 46,
      lead_time_minutes: 60,
      contributing_factors: "Siang river inflow rise from upstream mountain catchments",
      recommended_action: "Avoid recreational boating and stay off low sandbanks."
    },
    environmental_data: {
      rainfall_mm: 39.0,
      rainfall_rate: 23.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.3,
      river_capacity_pct: 53.0,
      river_trend: "Stable",
      soil_saturation_pct: 55.0,
      slope_deg: 20.0,
      slope_stability: "Moderate Watch"
    }
  },
  {
    id: 16,
    name: "Tawang",
    region: "High Himalayas",
    state: "Arunachal Pradesh",
    country: "India",
    lat: 27.5861,
    lng: 91.8594,
    elevation: 3048,
    slope: 32,
    population: 11200,
    terrain_type: "High Altitude Slopes",
    current_risk: {
      overall_score: 42,
      overall_level: "MODERATE",
      dominant_hazard: "landslide",
      flash_flood_score: 34,
      landslide_score: 46,
      heavy_rainfall_score: 40,
      lead_time_minutes: 70,
      contributing_factors: "High altitude slope seepage and mist condensation",
      recommended_action: "Drive cautiously across mountain passes; watch for loose gravel."
    },
    environmental_data: {
      rainfall_mm: 35.0,
      rainfall_rate: 21.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 2.7,
      river_capacity_pct: 44.0,
      river_trend: "Stable",
      soil_saturation_pct: 51.0,
      slope_deg: 32.0,
      slope_stability: "Moderate Watch"
    }
  },

  // --- MEGHALAYA ---
  {
    id: 17,
    name: "Cherrapunji (Sohra)",
    region: "Khasi Hills",
    state: "Meghalaya",
    country: "India",
    lat: 25.2702,
    lng: 91.7323,
    elevation: 1430,
    slope: 30,
    population: 15000,
    terrain_type: "Extreme Rainfall Plateau",
    current_risk: {
      overall_score: 76,
      overall_level: "HIGH",
      dominant_hazard: "heavy_rainfall",
      flash_flood_score: 72,
      landslide_score: 68,
      heavy_rainfall_score: 82,
      lead_time_minutes: 30,
      contributing_factors: "Convective rainfall surge over 80mm/h and gorge runoff",
      recommended_action: "Stay away from gorge cliff edges and flooded waterfall trails."
    },
    environmental_data: {
      rainfall_mm: 86.0,
      rainfall_rate: 58.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 5.0,
      river_capacity_pct: 78.0,
      river_trend: "Rising",
      soil_saturation_pct: 82.0,
      slope_deg: 30.0,
      slope_stability: "High Shear Stress"
    }
  },
  {
    id: 18,
    name: "Mawsynram",
    region: "East Khasi Hills",
    state: "Meghalaya",
    country: "India",
    lat: 25.2974,
    lng: 91.5824,
    elevation: 1400,
    slope: 28,
    population: 13500,
    terrain_type: "Ultra-High Precipitation Zone",
    current_risk: {
      overall_score: 74,
      overall_level: "HIGH",
      dominant_hazard: "heavy_rainfall",
      flash_flood_score: 70,
      landslide_score: 65,
      heavy_rainfall_score: 80,
      lead_time_minutes: 35,
      contributing_factors: "Heavy orographic precipitation and intense runoff",
      recommended_action: "Avoid travel during peak downpours; stay on concrete high ground."
    },
    environmental_data: {
      rainfall_mm: 84.0,
      rainfall_rate: 56.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 4.8,
      river_capacity_pct: 75.0,
      river_trend: "Rising",
      soil_saturation_pct: 80.0,
      slope_deg: 28.0,
      slope_stability: "High Shear Stress"
    }
  },

  // --- JAMMU & KASHMIR ---
  {
    id: 19,
    name: "Ramban (NH-44)",
    region: "Chenab Basin",
    state: "Jammu & Kashmir",
    country: "India",
    lat: 33.2423,
    lng: 75.2415,
    elevation: 1156,
    slope: 36,
    population: 19000,
    terrain_type: "Active Landslide Corridor",
    current_risk: {
      overall_score: 70,
      overall_level: "HIGH",
      dominant_hazard: "landslide",
      flash_flood_score: 55,
      landslide_score: 78,
      heavy_rainfall_score: 62,
      lead_time_minutes: 30,
      contributing_factors: "Shear stress on Panthyal shooting stone sector; road vulnerable",
      recommended_action: "NH-44 vehicular travel halted near active slip zones; use designated shelter camps."
    },
    environmental_data: {
      rainfall_mm: 75.0,
      rainfall_rate: 50.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 4.7,
      river_capacity_pct: 73.0,
      river_trend: "Rising",
      soil_saturation_pct: 77.0,
      slope_deg: 36.0,
      slope_stability: "High Shear Stress"
    }
  },
  {
    id: 20,
    name: "Srinagar (Jhelum)",
    region: "Kashmir Valley",
    state: "Jammu & Kashmir",
    country: "India",
    lat: 34.0837,
    lng: 74.7973,
    elevation: 1585,
    slope: 12,
    population: 1180000,
    terrain_type: "Riverine Valley Basin",
    current_risk: {
      overall_score: 18,
      overall_level: "LOW",
      dominant_hazard: "flood",
      flash_flood_score: 16,
      landslide_score: 12,
      heavy_rainfall_score: 20,
      lead_time_minutes: 200,
      contributing_factors: "Jhelum river gauge at Ram Munshi Bagh within normal flow range",
      recommended_action: "All sectors normal. Routine water monitoring ongoing."
    },
    environmental_data: {
      rainfall_mm: 6.0,
      rainfall_rate: 1.5,
      rainfall_intensity: "Light / Nominal",
      river_level_m: 1.5,
      river_capacity_pct: 25.0,
      river_trend: "Normal",
      soil_saturation_pct: 28.0,
      slope_deg: 12.0,
      slope_stability: "Stable"
    }
  },
  {
    id: 21,
    name: "Poonch",
    region: "Pir Panjal",
    state: "Jammu & Kashmir",
    country: "India",
    lat: 33.7712,
    lng: 74.0934,
    elevation: 981,
    slope: 24,
    population: 28000,
    terrain_type: "Mountain River Gorge",
    current_risk: {
      overall_score: 24,
      overall_level: "LOW",
      dominant_hazard: "flash_flood",
      flash_flood_score: 26,
      landslide_score: 22,
      heavy_rainfall_score: 20,
      lead_time_minutes: 150,
      contributing_factors: "Mountain river flow within nominal thresholds",
      recommended_action: "Normal conditions. Keep emergency contact 112 saved."
    },
    environmental_data: {
      rainfall_mm: 7.0,
      rainfall_rate: 1.8,
      rainfall_intensity: "Light / Nominal",
      river_level_m: 1.7,
      river_capacity_pct: 27.0,
      river_trend: "Normal",
      soil_saturation_pct: 31.0,
      slope_deg: 24.0,
      slope_stability: "Stable"
    }
  },

  // --- KERALA (WESTERN GHATS) ---
  {
    id: 22,
    name: "Wayanad (Meppadi)",
    region: "Western Ghats",
    state: "Kerala",
    country: "India",
    lat: 11.5534,
    lng: 76.1264,
    elevation: 780,
    slope: 38,
    population: 45000,
    terrain_type: "High Geotechnical Slope Vulnerability",
    current_risk: {
      overall_score: 92,
      overall_level: "CRITICAL",
      dominant_hazard: "landslide",
      flash_flood_score: 84,
      landslide_score: 95,
      heavy_rainfall_score: 90,
      lead_time_minutes: 15,
      contributing_factors: "Severe soil saturation (92%), slope gradient 38°, extreme cloudburst",
      recommended_action: "Immediate life-safety evacuation of Chooralmala & Mundakkai sectors to relief havens."
    },
    environmental_data: {
      rainfall_mm: 142.0,
      rainfall_rate: 96.0,
      rainfall_intensity: "Torrential Cloudburst",
      river_level_m: 6.5,
      river_capacity_pct: 95.0,
      river_trend: "Rising Rapidly",
      soil_saturation_pct: 94.0,
      slope_deg: 38.0,
      slope_stability: "Critical / Imminent Slip"
    }
  },
  {
    id: 23,
    name: "Idukki",
    region: "Periyar Basin",
    state: "Kerala",
    country: "India",
    lat: 9.8494,
    lng: 76.9804,
    elevation: 1200,
    slope: 32,
    population: 52000,
    terrain_type: "Steep Hill Reservoir Basin",
    current_risk: {
      overall_score: 46,
      overall_level: "MODERATE",
      dominant_hazard: "landslide",
      flash_flood_score: 42,
      landslide_score: 50,
      heavy_rainfall_score: 45,
      lead_time_minutes: 60,
      contributing_factors: "Moderate hill reservoir inflow and hillside rain runoff",
      recommended_action: "Avoid night driving in ghat sections; follow dam advisory."
    },
    environmental_data: {
      rainfall_mm: 41.0,
      rainfall_rate: 25.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.5,
      river_capacity_pct: 56.0,
      river_trend: "Stable",
      soil_saturation_pct: 57.0,
      slope_deg: 32.0,
      slope_stability: "Moderate Watch"
    }
  },
  {
    id: 24,
    name: "Munnar",
    region: "Anamalai Hills",
    state: "Kerala",
    country: "India",
    lat: 10.0889,
    lng: 77.0595,
    elevation: 1532,
    slope: 35,
    population: 38000,
    terrain_type: "Tea Plantation Slopes",
    current_risk: {
      overall_score: 80,
      overall_level: "CRITICAL",
      dominant_hazard: "landslide",
      flash_flood_score: 72,
      landslide_score: 84,
      heavy_rainfall_score: 78,
      lead_time_minutes: 25,
      contributing_factors: "Steep tea estate slopes saturated, potential mudslide runout",
      recommended_action: "Relocate from downhill settlement lines to concrete municipal shelters."
    },
    environmental_data: {
      rainfall_mm: 120.0,
      rainfall_rate: 85.0,
      rainfall_intensity: "Torrential Cloudburst",
      river_level_m: 5.9,
      river_capacity_pct: 90.0,
      river_trend: "Rising Rapidly",
      soil_saturation_pct: 90.0,
      slope_deg: 35.0,
      slope_stability: "Critical / Imminent Slip"
    }
  },

  // --- WEST BENGAL ---
  {
    id: 25,
    name: "Darjeeling - Kalimpong",
    region: "Teesta Basin",
    state: "West Bengal",
    country: "India",
    lat: 27.0410,
    lng: 88.2663,
    elevation: 2042,
    slope: 34,
    population: 120000,
    terrain_type: "Steep Hill Slopes",
    current_risk: {
      overall_score: 68,
      overall_level: "HIGH",
      dominant_hazard: "landslide",
      flash_flood_score: 58,
      landslide_score: 75,
      heavy_rainfall_score: 65,
      lead_time_minutes: 35,
      contributing_factors: "Teesta gorge slope saturation and active rockfall warnings",
      recommended_action: "Avoid travel along Teesta river roads and vulnerable hillside bends."
    },
    environmental_data: {
      rainfall_mm: 76.0,
      rainfall_rate: 51.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 4.8,
      river_capacity_pct: 75.0,
      river_trend: "Rising",
      soil_saturation_pct: 78.0,
      slope_deg: 34.0,
      slope_stability: "High Shear Stress"
    }
  },
  {
    id: 26,
    name: "Jalpaiguri",
    region: "Dooars Plains",
    state: "West Bengal",
    country: "India",
    lat: 26.5404,
    lng: 88.7196,
    elevation: 83,
    slope: 10,
    population: 107000,
    terrain_type: "Teesta Floodplain",
    current_risk: {
      overall_score: 38,
      overall_level: "MODERATE",
      dominant_hazard: "flood",
      flash_flood_score: 42,
      landslide_score: 18,
      heavy_rainfall_score: 40,
      lead_time_minutes: 90,
      contributing_factors: "Dooars river runoff and moderate floodplain water rise",
      recommended_action: "Keep cattle and grain on high flood platforms."
    },
    environmental_data: {
      rainfall_mm: 37.0,
      rainfall_rate: 22.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.0,
      river_capacity_pct: 49.0,
      river_trend: "Stable",
      soil_saturation_pct: 53.0,
      slope_deg: 10.0,
      slope_stability: "Stable"
    }
  },

  // --- BIHAR ---
  {
    id: 27,
    name: "Supaul (Kosi)",
    region: "Kosi Basin",
    state: "Bihar",
    country: "India",
    lat: 26.1228,
    lng: 86.5985,
    elevation: 45,
    slope: 6,
    population: 65000,
    terrain_type: "Braided River Inundation Zone",
    current_risk: {
      overall_score: 44,
      overall_level: "MODERATE",
      dominant_hazard: "flood",
      flash_flood_score: 48,
      landslide_score: 10,
      heavy_rainfall_score: 45,
      lead_time_minutes: 80,
      contributing_factors: "Kosi barrage water discharge increase",
      recommended_action: "Stay alert along embankment sectors; know boat evacuation points."
    },
    environmental_data: {
      rainfall_mm: 39.0,
      rainfall_rate: 23.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.3,
      river_capacity_pct: 54.0,
      river_trend: "Rising Slowly",
      soil_saturation_pct: 55.0,
      slope_deg: 6.0,
      slope_stability: "Stable"
    }
  },
  {
    id: 28,
    name: "Patna (Ganges)",
    region: "Gangetic Plain",
    state: "Bihar",
    country: "India",
    lat: 25.5941,
    lng: 85.1376,
    elevation: 53,
    slope: 5,
    population: 2040000,
    terrain_type: "Lowland Confluence",
    current_risk: {
      overall_score: 20,
      overall_level: "LOW",
      dominant_hazard: "flood",
      flash_flood_score: 22,
      landslide_score: 8,
      heavy_rainfall_score: 20,
      lead_time_minutes: 240,
      contributing_factors: "Ganga water levels comfortably below danger mark",
      recommended_action: "Normal activities safe. River cruise operations normal."
    },
    environmental_data: {
      rainfall_mm: 5.0,
      rainfall_rate: 1.4,
      rainfall_intensity: "Light / Nominal",
      river_level_m: 1.6,
      river_capacity_pct: 26.0,
      river_trend: "Normal",
      soil_saturation_pct: 29.0,
      slope_deg: 5.0,
      slope_stability: "Stable"
    }
  },

  // --- NEPAL & BORDER CORRIDORS ---
  {
    id: 29,
    name: "Darchula Border",
    region: "Mahakali Corridor",
    state: "Uttarakhand / Nepal Border",
    country: "India / Nepal",
    lat: 29.8456,
    lng: 80.5369,
    elevation: 915,
    slope: 30,
    population: 21000,
    terrain_type: "Transboundary River Canyon",
    current_risk: {
      overall_score: 48,
      overall_level: "MODERATE",
      dominant_hazard: "flash_flood",
      flash_flood_score: 52,
      landslide_score: 44,
      heavy_rainfall_score: 46,
      lead_time_minutes: 50,
      contributing_factors: "Mahakali river canyon swelling from upstream precipitation",
      recommended_action: "Avoid suspension bridges and river ghats during high flow."
    },
    environmental_data: {
      rainfall_mm: 43.0,
      rainfall_rate: 26.0,
      rainfall_intensity: "Moderate Showers",
      river_level_m: 3.6,
      river_capacity_pct: 57.0,
      river_trend: "Stable",
      soil_saturation_pct: 59.0,
      slope_deg: 30.0,
      slope_stability: "Moderate Watch"
    }
  },
  {
    id: 30,
    name: "Melamchi",
    region: "Sindhupalchok",
    state: "Bagmati Province",
    country: "Nepal",
    lat: 27.8333,
    lng: 85.5833,
    elevation: 870,
    slope: 32,
    population: 45000,
    terrain_type: "Debris Flow & Flash Flood Zone",
    current_risk: {
      overall_score: 70,
      overall_level: "HIGH",
      dominant_hazard: "flash_flood",
      flash_flood_score: 75,
      landslide_score: 66,
      heavy_rainfall_score: 68,
      lead_time_minutes: 35,
      contributing_factors: "Upstream debris flow risk in steep mountain channel",
      recommended_action: "Evacuate lower bazaar settlements to higher ridge terraces."
    },
    environmental_data: {
      rainfall_mm: 79.0,
      rainfall_rate: 53.0,
      rainfall_intensity: "Heavy Downpour",
      river_level_m: 4.9,
      river_capacity_pct: 77.0,
      river_trend: "Rising",
      soil_saturation_pct: 78.0,
      slope_deg: 32.0,
      slope_stability: "High Shear Stress"
    }
  },
  {
    id: 31,
    name: "Pokhara (Seti River)",
    region: "Gandaki",
    state: "Gandaki Province",
    country: "Nepal",
    lat: 28.2096,
    lng: 83.9856,
    elevation: 822,
    slope: 18,
    population: 350000,
    terrain_type: "Gorge Catchment",
    current_risk: {
      overall_score: 22,
      overall_level: "LOW",
      dominant_hazard: "flash_flood",
      flash_flood_score: 25,
      landslide_score: 18,
      heavy_rainfall_score: 20,
      lead_time_minutes: 180,
      contributing_factors: "Seti river canyon within nominal flow range",
      recommended_action: "Normal activities safe. Regular river gorge monitoring active."
    },
    environmental_data: {
      rainfall_mm: 6.0,
      rainfall_rate: 1.6,
      rainfall_intensity: "Light / Nominal",
      river_level_m: 1.6,
      river_capacity_pct: 26.0,
      river_trend: "Normal",
      soil_saturation_pct: 30.0,
      slope_deg: 18.0,
      slope_stability: "Stable"
    }
  }
];

export const FALLBACK_SYSTEM_RISK = {
  success: true,
  stats: {
    total_locations: 31,
    critical_zones: 5,
    high_risk_zones: 9,
    moderate_risk_zones: 12,
    normal_zones: 5,
    active_alerts: 12,
    population_at_risk: 145000
  },
  timestamp: new Date().toISOString()
};

export const FALLBACK_ALERTS = [
  {
    id: 1,
    location_id: 1,
    location_name: "Chamoli (Alaknanda Basin)",
    hazard_type: "Flash Flood",
    severity: "CRITICAL",
    title: "🚨 CRITICAL FLASH FLOOD WARNING: Upper Alaknanda Catchment",
    message: "Rainfall 78mm/hr with rapid river surge. Immediate evacuation of low-lying floodplains in Chamoli activated. Nearest shelter: Chamoli High-Ground Safe Haven.",
    radius_km: 25.0,
    status: "Active",
    lead_time_min: 30,
    issued_by: "PralayWatch Real-Time AI Simulation Core",
    created_at: "15 mins ago"
  },
  {
    id: 2,
    location_id: 22,
    location_name: "Wayanad (Meppadi)",
    hazard_type: "Landslide",
    severity: "CRITICAL",
    title: "🚨 CRITICAL LANDSLIDE RED ALERT: Meppadi Hillslope Sector",
    message: "Soil saturation 94% and slope strain threshold exceeded. Evacuate downstream Chooralmala settlements immediately to high-ground relief havens.",
    radius_km: 18.0,
    status: "Active",
    lead_time_min: 15,
    issued_by: "State Disaster Management Authority (SEOC)",
    created_at: "28 mins ago"
  },
  {
    id: 3,
    location_id: 2,
    location_name: "Joshimath (Garhwal)",
    hazard_type: "Landslide",
    severity: "CRITICAL",
    title: "🚨 LANDSLIDE & SUBSIDENCE WARNING: Sunil Ward Sector",
    message: "Active slope deformation accelerated by heavy rainfall. Vacate cracked residential structures immediately.",
    radius_km: 12.0,
    status: "Active",
    lead_time_min: 20,
    issued_by: "NDRF Mountain Response Command",
    created_at: "45 mins ago"
  },
  {
    id: 4,
    location_id: 10,
    location_name: "Chungthang (North Sikkim)",
    hazard_type: "Flash Flood",
    severity: "CRITICAL",
    title: "🚨 TEESTA BASIN WATER SURGE WARNING",
    message: "Extreme rainfall in upper catchment. Teesta river gauge rising rapidly. Evacuate all riverfront structures.",
    radius_km: 20.0,
    status: "Active",
    lead_time_min: 20,
    issued_by: "Sikkim SDMA Command",
    created_at: "1 hour ago"
  },
  {
    id: 5,
    location_id: 6,
    location_name: "Kullu - Manali (Beas Basin)",
    hazard_type: "Flash Flood",
    severity: "HIGH",
    title: "🟠 HIGH FLOOD RISK: Beas River Swelling",
    message: "Water discharge rising over 1420 m3/s. Stay away from riverbanks, bridges, and temporary camping sites.",
    radius_km: 25.0,
    status: "Active",
    lead_time_min: 35,
    issued_by: "Himachal SDMA",
    created_at: "1 hour ago"
  },
  {
    id: 6,
    location_id: 17,
    location_name: "Cherrapunji (Sohra)",
    hazard_type: "Heavy Rainfall",
    severity: "HIGH",
    title: "🟠 TORRENTIAL CLOUDBURST ADVISORY: Khasi Plateau",
    message: "Precipitation rate 86mm/h with rapid gorge runoff. Stay away from cliff edges and low causeways.",
    radius_km: 15.0,
    status: "Active",
    lead_time_min: 30,
    issued_by: "IMD / Meghalaya SDMA",
    created_at: "2 hours ago"
  }
];

export const getFallbackSafeLocations = (locId) => {
  const loc = FALLBACK_LOCATIONS.find(l => l.id === Number(locId)) || FALLBACK_LOCATIONS[0];
  return [
    {
      id: loc.id * 10 + 1,
      location_id: loc.id,
      name: `${loc.name} High-Ground Disaster Relief Shelter`,
      type: "Primary Concrete Safe Shelter",
      lat: loc.lat + 0.008,
      lng: loc.lng + 0.007,
      capacity: 850,
      current_occupancy: 120,
      occupancy_pct: 14,
      status: "OPEN",
      distance_km: 1.4,
      est_walking_mins: 18,
      contact_phone: "+91 1800-180-1104",
      facilities: "Emergency Medical Bay, High-Output Generators, Dry Food Rations, Purified Water"
    },
    {
      id: loc.id * 10 + 2,
      location_id: loc.id,
      name: `${loc.name} Community Hall & Helipad Refuge`,
      type: "Secondary Emergency Shelter",
      lat: loc.lat - 0.006,
      lng: loc.lng - 0.006,
      capacity: 450,
      current_occupancy: 40,
      occupancy_pct: 9,
      status: "OPEN",
      distance_km: 2.2,
      est_walking_mins: 26,
      contact_phone: "+91 94120-00108",
      facilities: "Trauma Care, Helipad Access, Satellite VHF Communication, Relief Supplies"
    }
  ];
};
