from typing import Dict, List, Any
from services.predictors.base_predictor import BaseHazardPredictor
from services.predictors.flash_flood_predictor import FlashFloodPredictor
from services.predictors.landslide_predictor import LandslidePredictor
from services.predictors.extreme_rainfall_predictor import ExtremeRainfallPredictor
from services.predictors.riverine_flood_predictor import RiverineFloodPredictor
from services.predictors.cyclone_predictor import CyclonePredictor
from services.predictors.glof_predictor import GLOFPredictor

class HazardPredictorRegistry:
    """
    Registry pattern for multi-hazard models in PralayWatch.
    Enables dynamic plug-and-play addition of new hazard predictors
    (e.g., GLOF, Wildfire, Urban Flood, Avalanches) without modifying core orchestration.
    """
    
    _predictors: Dict[str, BaseHazardPredictor] = {}

    @classmethod
    def initialize_defaults(cls):
        """Register default core multi-hazard predictors."""
        cls._predictors.clear()
        cls.register("flash_flood", FlashFloodPredictor())
        cls.register("landslide", LandslidePredictor())
        cls.register("heavy_rainfall", ExtremeRainfallPredictor())
        cls.register("flood", RiverineFloodPredictor())
        cls.register("cyclone", CyclonePredictor())
        cls.register("glof", GLOFPredictor())

    @classmethod
    def register(cls, key: str, predictor: BaseHazardPredictor):
        """Register a new hazard predictor module."""
        cls._predictors[key] = predictor

    @classmethod
    def get(cls, key: str) -> BaseHazardPredictor:
        """Retrieve predictor by key."""
        if not cls._predictors:
            cls.initialize_defaults()
        return cls._predictors.get(key)

    @classmethod
    def list_all(cls) -> List[BaseHazardPredictor]:
        """List all active hazard predictors sorted by priority rank."""
        if not cls._predictors:
            cls.initialize_defaults()
        return sorted(cls._predictors.values(), key=lambda p: p.priority_rank)

    @classmethod
    def evaluate_all(cls, env_data: Any, location: Any) -> Dict[str, Any]:
        """Execute prediction across all registered hazard models."""
        if not cls._predictors:
            cls.initialize_defaults()
            
        results = {}
        for key, predictor in cls._predictors.items():
            results[key] = predictor.predict(env_data, location)
        return results

# Initialize registry at import time
HazardPredictorRegistry.initialize_defaults()
