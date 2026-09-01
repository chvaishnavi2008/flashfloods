"""
=============================================================================
PralayWatch - Risk Intelligence Engine Configuration
=============================================================================
Centralized, modular configuration file defining:
- Risk level thresholds (0-25: LOW, 26-50: MODERATE, 51-75: HIGH, 76-100: CRITICAL)
- Input normalization bounds and parameter baselines
- Configurable weights for Flash Flood, Landslide, Extreme Rainfall, Riverine Flood, Cyclone, GLOF
- Action recommendation templates & dynamic factor rules
"""

# 1. Standardized Risk Level Thresholds (0 - 100)
RISK_LEVEL_THRESHOLDS = {
    "LOW": (0, 25),
    "MODERATE": (26, 50),
    "HIGH": (51, 75),
    "CRITICAL": (76, 100)
}

def get_risk_level_from_score(score: float) -> str:
    """Maps a 0-100 numeric score to standardized risk categories."""
    if score >= 76.0:
        return "CRITICAL"
    elif score >= 51.0:
        return "HIGH"
    elif score >= 26.0:
        return "MODERATE"
    else:
        return "LOW"


# 2. Telemetry Normalization Ranges (Upper Bounds for 100% Saturation)
NORMALIZATION_BOUNDS = {
    # Rainfall
    "rainfall_rate_max_mm_hr": 120.0,       # 120 mm/hr = Cloudburst / extreme rate
    "rainfall_accum_max_mm": 250.0,         # 250 mm in 24h = Severe deluge
    "rainfall_forecast_max_mm": 100.0,      # 100 mm in next 6h
    "duration_max_hours": 12.0,             # 12 hours of continuous rainfall
    
    # Hydrological
    "river_capacity_max_pct": 100.0,        # 100% = At or above danger level
    "river_level_max_m": 8.0,               # 8.0 meters = Severe flood stage
    
    # Geotechnical / Terrain
    "slope_max_deg": 45.0,                  # 45 degrees or steeper
    "soil_saturation_max_pct": 100.0,       # 100% pore-water saturation
    "elevation_baseline_m": 1500.0,         # Himalayan elevation baseline
    
    # Vulnerability & Exposure
    "historical_risk_max": 100.0,
    "population_exposure_max": 100000.0
}


# 3. Modular Hazard Calculation Weights (Sum to 1.0 for each hazard)
HAZARD_WEIGHTS = {
    # -------------------------------------------------------------------------
    # FLASH FLOOD (Priority 1)
    # -------------------------------------------------------------------------
    "flash_flood": {
        "rainfall_intensity": 0.35,          # Sudden cloudburst rainfall rate
        "accumulated_rainfall": 0.20,        # 24h antecedent rainfall volume
        "river_water_level": 0.20,           # River channel saturation / gauge height
        "river_trend": 0.15,                 # Rapid rise bonus factor
        "elevation_terrain": 0.05,           # Valley funnel / elevation factor
        "historical_susceptibility": 0.05    # Historical flash flood vulnerability
    },
    
    # -------------------------------------------------------------------------
    # LANDSLIDE (Priority 2)
    # -------------------------------------------------------------------------
    "landslide": {
        "soil_susceptibility": 0.35,         # Soil moisture pore-water pressure
        "slope": 0.30,                       # Slope steepness angle
        "rainfall_intensity": 0.15,          # Current precipitation trigger
        "accumulated_rainfall": 0.10,        # Antecedent soil soaking
        "elevation": 0.05,                   # High mountain elevation factor
        "historical_susceptibility": 0.05    # GSI historical landslide zonation
    },
    
    # -------------------------------------------------------------------------
    # EXTREME RAINFALL (Priority 3)
    # -------------------------------------------------------------------------
    "extreme_rainfall": {
        "rainfall_intensity": 0.45,          # Instantaneous rainfall rate (mm/hr)
        "rainfall_accumulation": 0.25,       # Cumulative precipitation (mm)
        "forecast_rainfall": 0.20,           # IMD nowcast forecast trend
        "duration": 0.10                     # Duration of heavy storm activity
    },
    
    # -------------------------------------------------------------------------
    # RIVERINE FLOOD
    # -------------------------------------------------------------------------
    "riverine_flood": {
        "river_water_level": 0.45,
        "rainfall_accumulation": 0.30,
        "river_trend": 0.15,
        "historical_susceptibility": 0.10
    },
    
    # -------------------------------------------------------------------------
    # CYCLONE / WINDSTORM
    # -------------------------------------------------------------------------
    "cyclone": {
        "wind_speed": 0.60,
        "rainfall_rate": 0.40
    },
    
    # -------------------------------------------------------------------------
    # GLOF (Glacial Lake Outburst Flood)
    # -------------------------------------------------------------------------
    "glof": {
        "elevation_cryosphere": 0.40,
        "rainfall_intensity": 0.30,
        "river_capacity": 0.30
    }
}


# 4. River Trend Modifier Multipliers
RIVER_TREND_SCORES = {
    "Overflowing / Critical Breach": 100.0,
    "Rising Rapidly": 90.0,
    "Rising": 65.0,
    "Stable": 25.0,
    "Receding": 10.0,
    "Normal": 15.0
}


# 5. Rainfall Trend Modifier Multipliers
RAINFALL_TREND_SCORES = {
    "Peaking": 100.0,
    "Rising Rapidly": 90.0,
    "Rising": 75.0,
    "Torrential": 95.0,
    "Stable": 35.0,
    "Falling": 15.0
}


# 6. Action Recommendation Library
ACTION_RECOMMENDATIONS = {
    "flash_flood": {
        "CRITICAL": [
            "Move away from low-lying areas and riverbanks immediately",
            "Avoid river crossings, bridges, and culverts",
            "Move toward designated high-ground safe zones / shelters",
            "Shut off main electricity and gas supplies before leaving"
        ],
        "HIGH": [
            "Prepare emergency go-bags and identify nearest high-ground refuge",
            "Avoid parking vehicles near drainage culverts or riverbeds",
            "Monitor live SDMA / CWC hydro-gauge warning broadcasts"
        ],
        "MODERATE": [
            "Inspect perimeter stormwater drainage around residence",
            "Stay alert to upstream cloudburst reports in surrounding hills"
        ],
        "LOW": [
            "Maintain routine awareness. No active evacuation required."
        ]
    },
    
    "landslide": {
        "CRITICAL": [
            "Evacuate immediately from homes situated on or beneath steep slopes",
            "Avoid mountain highway travel and steep road cuttings",
            "Move toward designated structural shelters on stable bedrock / ridge lines",
            "Stay vigilant for sudden muddy runoff, tree tilting, or ground cracking"
        ],
        "HIGH": [
            "Stay away from hillside perimeters and loose debris slopes",
            "Prepare emergency essentials for rapid movement if rainfall continues",
            "Monitor slope stability alerts from district disaster authorities"
        ],
        "MODERATE": [
            "Inspect slope retention walls and clear drainage ditches",
            "Exercise caution when driving along mountain passes"
        ],
        "LOW": [
            "Geotechnical metrics stable. Normal hillside monitoring."
        ]
    },
    
    "extreme_rainfall": {
        "CRITICAL": [
            "Remain indoors in structurally sound buildings away from windows",
            "Avoid all non-essential road travel during torrential downpours",
            "Keep emergency battery lights, drinking water, and first aid ready",
            "Follow official IMD Doppler radar nowcast instructions"
        ],
        "HIGH": [
            "Secure loose rooftop objects and check basement sump pumps",
            "Avoid low-lying underpasses and waterlogged road stretches",
            "Keep communication devices fully charged"
        ],
        "MODERATE": [
            "Carry rain gear and exercise caution during commute",
            "Check local weather forecast updates"
        ],
        "LOW": [
            "Precipitation rates within nominal seasonal baseline."
        ]
    }
}
