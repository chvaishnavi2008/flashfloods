from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List
from config import Config
from risk_config import get_risk_level_from_score, ACTION_RECOMMENDATIONS

class BaseHazardPredictor(ABC):
    """
    Abstract Base Class for all Hazard Predictors in PralayWatch.
    
    Architecture Note:
    - Provides a standard interface for rule-based physics models (Phase 1)
      and Machine Learning / Deep Learning models (Phase 2).
    - Subclasses implement:
      * `extract_features(env_data, location)`
      * `predict_rules(env_data, location)` -> (score, level, confidence, factors, actions, metadata)
      * `predict_ml(features)` -> Optional slot for trained ML models (XGBoost/LSTM/PyTorch).
    """
    
    def __init__(self, hazard_name: str, priority_rank: int = 1, hazard_key: str = ""):
        self.hazard_name = hazard_name
        self.priority_rank = priority_rank
        self.hazard_key = hazard_key or hazard_name.lower().replace(" ", "_").replace("/", "_")

    @staticmethod
    def get_level(score: float) -> str:
        """Map 0-100 score to standardized risk thresholds (0-25: LOW, 26-50: MODERATE, 51-75: HIGH, 76-100: CRITICAL)."""
        return get_risk_level_from_score(score)

    @staticmethod
    def get_val(source: Any, key: str, default: Any = 0.0) -> Any:
        """Helper to extract a property whether source is a dict, model instance, or None."""
        if source is None:
            return default
        if isinstance(source, dict):
            return source.get(key, default)
        return getattr(source, key, default)

    @abstractmethod
    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        """Extract and normalize numerical feature vector for prediction."""
        pass

    @abstractmethod
    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, float, List[str], List[str], Dict[str, Any]]:
        """
        Physics-grounded deterministic scoring rule.
        Returns:
            (riskScore [0-100], riskLevel, confidence [0.0-1.0], factors, recommendedActions, metadata)
        """
        pass

    def predict_ml(self, features: Dict[str, float]) -> Tuple[float, str, float, List[str], List[str]]:
        """
        Slot for Phase 2 ML Model Inference.
        Returns: (riskScore, riskLevel, confidence, factors, recommendedActions)
        In Phase 1, delegates to rule-based logic.
        """
        return None

    def predict(self, env_data: Any, location: Any, use_ml: bool = False) -> Dict[str, Any]:
        """
        Public prediction interface returning structured JSON matching PralayWatch specification:
        {
          "location": "Chamoli",
          "hazard": "Flash Flood",
          "riskScore": 84,
          "riskLevel": "CRITICAL",
          "confidence": 0.87,
          "factors": [...],
          "recommendedActions": [...]
        }
        """
        loc_name = self.get_val(location, 'name', 'Monitored Sector')
        features = self.extract_features(env_data, location)
        
        if use_ml:
            ml_res = self.predict_ml(features)
            if ml_res is not None:
                score, level, conf, factors, actions = ml_res
                return {
                    "location": loc_name,
                    "hazard": self.hazard_name,
                    "hazardKey": self.hazard_key,
                    "riskScore": round(score, 1),
                    "score": round(score, 1),
                    "riskLevel": level,
                    "level": level,
                    "confidence": round(conf, 2),
                    "factors": factors,
                    "recommendedActions": actions,
                    "model_type": "Machine Learning (Phase 2)",
                    "features": features
                }

        # Grounded Deterministic Rule-Based Engine
        score, level, conf, factors, actions, meta = self.predict_rules(env_data, location)
        
        return {
            "location": loc_name,
            "hazard": self.hazard_name,
            "hazardKey": self.hazard_key,
            "riskScore": round(score, 1),
            "score": round(score, 1),
            "riskLevel": level,
            "level": level,
            "confidence": round(conf, 2),
            "factors": factors,
            "recommendedActions": actions,
            "model_type": "Grounded Hydrological/Geotechnical Rule Engine (Prototype)",
            "features": features,
            "metadata": meta
        }
