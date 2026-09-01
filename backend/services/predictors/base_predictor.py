from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
from config import Config

class BaseHazardPredictor(ABC):
    """
    Abstract Base Class for all Hazard Predictors in PralayWatch.
    
    Architecture Note:
    - Provides a standard interface for rule-based physics models (Phase 1)
      and Machine Learning / Deep Learning models (Phase 2).
    - Subclasses implement `predict_rules(env_data, location)` for prototype scoring
      and provide a `predict_ml(features)` slot for future ML models (XGBoost/LSTM/PyTorch).
    """
    
    def __init__(self, hazard_name: str, priority_rank: int):
        self.hazard_name = hazard_name
        self.priority_rank = priority_rank

    @staticmethod
    def get_level(score: float) -> str:
        """Map 0-100 score to standardized risk thresholds."""
        thresholds = Config.RISK_THRESHOLDS
        if score >= thresholds["CRITICAL"][0]:
            return "CRITICAL"
        elif score >= thresholds["HIGH"][0]:
            return "HIGH"
        elif score >= thresholds["MODERATE"][0]:
            return "MODERATE"
        else:
            return "LOW"

    @abstractmethod
    def extract_features(self, env_data: Any, location: Any) -> Dict[str, float]:
        """Extract and normalize numerical feature vector for prediction."""
        pass

    @abstractmethod
    def predict_rules(self, env_data: Any, location: Any) -> Tuple[float, str, Dict[str, Any]]:
        """
        Physics-grounded deterministic scoring rule.
        Returns: (score [0-100], level ['LOW'|'MODERATE'|'HIGH'|'CRITICAL'], metadata)
        """
        pass

    def predict_ml(self, features: Dict[str, float]) -> Tuple[float, str, float]:
        """
        Slot for Phase 2 ML Model Inference.
        Returns: (score, level, confidence_score)
        In Phase 1, delegates to rule-based logic with prototype confidence flag.
        """
        # Placeholder for trained PyTorch/XGBoost model pipeline
        return None

    def predict(self, env_data: Any, location: Any, use_ml: bool = False) -> Dict[str, Any]:
        """
        Public prediction interface.
        Executes prediction and returns standardized assessment payload.
        """
        features = self.extract_features(env_data, location)
        
        if use_ml:
            ml_res = self.predict_ml(features)
            if ml_res is not None:
                score, level, conf = ml_res
                return {
                    "hazard": self.hazard_name,
                    "score": round(score, 1),
                    "level": level,
                    "model_type": "Machine Learning (Phase 2)",
                    "confidence": conf,
                    "features": features
                }

        # Default: Grounded Rule-Based Engine
        score, level, meta = self.predict_rules(env_data, location)
        return {
            "hazard": self.hazard_name,
            "score": round(score, 1),
            "level": level,
            "model_type": "Grounded Hydrological/Geotechnical Rule Engine (Prototype)",
            "confidence": 0.92,
            "features": features,
            "metadata": meta
        }
