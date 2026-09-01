import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "pralaywatch-super-secret-key-sih-2026")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///pralaywatch.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Risk Level Thresholds (0 - 100)
    # Configurable in one central place
    RISK_THRESHOLDS = {
        "LOW": (0, 30),
        "MODERATE": (31, 50),
        "HIGH": (51, 75),
        "CRITICAL": (76, 100)
    }
    
    # Severity Colors for Map and Dashboard
    SEVERITY_COLORS = {
        "LOW": "#10B981",       # Green
        "MODERATE": "#F59E0B",  # Yellow / Amber
        "HIGH": "#F97316",      # Orange
        "CRITICAL": "#EF4444"   # Red
    }
    
    # Weights for Prototype Risk Assessment Engine
    RISK_WEIGHTS = {
        "flash_flood": {
            "rainfall_intensity": 0.40,
            "river_capacity": 0.35,
            "soil_saturation": 0.15,
            "historical_factor": 0.10
        },
        "flood": {
            "river_capacity": 0.45,
            "rainfall_accumulation": 0.30,
            "terrain_lowland": 0.15,
            "historical_factor": 0.10
        },
        "landslide": {
            "soil_saturation": 0.40,
            "slope_steepness": 0.35,
            "rainfall_intensity": 0.15,
            "historical_factor": 0.10
        },
        "heavy_rainfall": {
            "rainfall_rate": 0.70,
            "trend_forecast": 0.30
        }
    }
    
    # Gemini API Key (Optional, falls back to deterministic expert AI reasoning)
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
