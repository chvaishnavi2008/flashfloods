from datetime import datetime, timezone
from .base import db

def utc_now():
    return datetime.now(timezone.utc)

class Risk(db.Model):
    """
    Risk model representing multi-hazard early warning evaluation scores,
    threat levels, and actionable lead-time windows computed by the risk engine.
    """
    __tablename__ = 'risks'

    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False, index=True)
    flash_flood_score = db.Column(db.Float, nullable=False)   # 0 - 100
    landslide_score = db.Column(db.Float, nullable=False)     # 0 - 100
    overall_score = db.Column(db.Float, nullable=False)       # 0 - 100
    risk_level = db.Column(db.String(20), nullable=False, index=True)  # 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    lead_time_minutes = db.Column(db.Integer, nullable=False) # Estimated evacuation lead time in minutes
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False, index=True)

    def to_dict(self):
        """Serialize risk assessment to JSON-compatible dictionary."""
        return {
            'id': self.id,
            'location_id': self.location_id,
            'flash_flood_score': round(self.flash_flood_score, 2),
            'landslide_score': round(self.landslide_score, 2),
            'overall_score': round(self.overall_score, 2),
            'risk_level': self.risk_level,
            'lead_time_minutes': self.lead_time_minutes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<Risk {self.id}: Loc {self.location_id} -> Overall {self.overall_score} ({self.risk_level})>"
