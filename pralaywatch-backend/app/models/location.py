from datetime import datetime, timezone
from .base import db

def utc_now():
    return datetime.now(timezone.utc)

class Location(db.Model):
    """
    Location model representing vulnerable mountain, valley, or floodplain settlements.
    Stores geospatial, topographic, and baseline susceptibility indices.
    """
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(100), nullable=False, index=True)
    district = db.Column(db.String(100), nullable=False, index=True)
    village = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    elevation = db.Column(db.Float, nullable=False)  # in meters above sea level
    slope = db.Column(db.Float, nullable=False)      # slope gradient in degrees (0-90°)
    flood_susceptibility = db.Column(db.Float, nullable=False, default=0.5)      # 0.0 - 1.0 (or 0-100)
    landslide_susceptibility = db.Column(db.Float, nullable=False, default=0.5)  # 0.0 - 1.0 (or 0-100)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    sensors = db.relationship('Sensor', backref='location', lazy='dynamic', cascade='all, delete-orphan')
    risks = db.relationship('Risk', backref='location', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_latest_risk=True, include_sensors=False):
        """Serialize location model to JSON-compatible dictionary."""
        data = {
            'id': self.id,
            'state': self.state,
            'district': self.district,
            'village': self.village,
            'name': f"{self.village}, {self.district}",
            'latitude': self.latitude,
            'longitude': self.longitude,
            'elevation': self.elevation,
            'slope': self.slope,
            'flood_susceptibility': self.flood_susceptibility,
            'landslide_susceptibility': self.landslide_susceptibility,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_latest_risk:
            latest_risk = self.risks.order_by(db.desc('created_at')).first()
            data['latest_risk'] = latest_risk.to_dict() if latest_risk else None

        if include_sensors:
            data['sensors'] = [s.to_dict() for s in self.sensors.all()]

        return data

    def __repr__(self):
        return f"<Location {self.id}: {self.village}, {self.district}, {self.state}>"
