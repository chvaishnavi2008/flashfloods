import os

from risk_config import RISK_LEVEL_THRESHOLDS, HAZARD_WEIGHTS, NORMALIZATION_BOUNDS

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "pralaywatch-super-secret-key-sih-2026")
    
    # Serverless SQLite compatibility: On Vercel, use writable /tmp directory
    _is_vercel = bool(os.environ.get("VERCEL"))
    _default_db = "sqlite:////tmp/pralaywatch.db" if _is_vercel else "sqlite:///pralaywatch.db"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", _default_db)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Standardized Risk Level Thresholds (0 - 100)
    # 0-25 -> LOW, 26-50 -> MODERATE, 51-75 -> HIGH, 76-100 -> CRITICAL
    RISK_THRESHOLDS = RISK_LEVEL_THRESHOLDS
    
    # Severity Colors for Map and Dashboard
    SEVERITY_COLORS = {
        "LOW": "#10B981",       # Green
        "MODERATE": "#F59E0B",  # Yellow / Amber
        "HIGH": "#F97316",      # Orange
        "CRITICAL": "#EF4444"   # Red
    }
    
    # Weights for Risk Assessment Engine
    RISK_WEIGHTS = HAZARD_WEIGHTS
    
    # Gemini API Key (Optional, falls back to deterministic expert AI reasoning)
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
