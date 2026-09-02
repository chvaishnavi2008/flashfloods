from datetime import datetime, timezone
from .base import db

def utc_now():
    return datetime.now(timezone.utc)

class Sensor(db.Model):
    """
    Sensor model representing real-time telemetry readings from meteorological,
    hydrological, and geotechnical field sensor nodes.
    """
    __tablename__ = 'sensors'

    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False, index=True)
    sensor_type = db.Column(db.String(50), nullable=False, index=True)  # 'rainfall', 'soil_moisture', 'river_level', etc.
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)  # 'mm/h', '%', 'm', 'm3/s', '°C'
    timestamp = db.Column(db.DateTime, default=utc_now, nullable=False, index=True)
    status = db.Column(db.String(20), default='ACTIVE', nullable=False)  # 'ACTIVE', 'WARNING', 'OFFLINE'

    def to_dict(self):
        """Serialize sensor reading to JSON-compatible dictionary."""
        return {
            'id': self.id,
            'location_id': self.location_id,
            'sensor_type': self.sensor_type,
            'value': self.value,
            'unit': self.unit,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'status': self.status
        }

    def __repr__(self):
        return f"<Sensor {self.id}: {self.sensor_type}={self.value}{self.unit} @ Loc {self.location_id}>"
