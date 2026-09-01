from datetime import datetime
import json
from database import db

class Location(db.Model):
    __tablename__ = 'locations'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), default="India")
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    elevation = db.Column(db.Integer, default=1500) # meters
    terrain_type = db.Column(db.String(50), default="Mountainous / Valley")
    population = db.Column(db.Integer, default=10000)
    is_vulnerable = db.Column(db.Boolean, default=True)
    
    # Relationships
    environmental_data = db.relationship('EnvironmentalData', backref='location', uselist=False, cascade="all, delete-orphan")
    risk_assessments = db.relationship('RiskAssessment', backref='location', lazy=True, cascade="all, delete-orphan")
    alerts = db.relationship('Alert', backref='location', lazy=True, cascade="all, delete-orphan")
    safe_locations = db.relationship('SafeLocation', backref='location', lazy=True, cascade="all, delete-orphan")
    users = db.relationship('User', backref='location', lazy=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "region": self.region,
            "state": self.state,
            "country": self.country,
            "display_name": f"{self.name}, {self.state}, {self.country}",
            "lat": self.lat,
            "lng": self.lng,
            "elevation": self.elevation,
            "terrain_type": self.terrain_type,
            "population": self.population,
            "is_vulnerable": self.is_vulnerable
        }

class Hazard(db.Model):
    __tablename__ = 'hazards'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False) # flash_flood, flood, landslide, heavy_rainfall
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50), default="warning")
    description = db.Column(db.Text)
    unit = db.Column(db.String(30), default="")
    
    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "icon": self.icon,
            "description": self.description,
            "unit": self.unit
        }

class EnvironmentalData(db.Model):
    __tablename__ = 'environmental_data'
    
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False, unique=True)
    
    rainfall_mm = db.Column(db.Float, default=25.0) # mm in last 24h
    rainfall_rate = db.Column(db.Float, default=5.0) # mm/hr current
    rainfall_intensity = db.Column(db.String(50), default="Light") # Light, Moderate, Heavy, Torrential / Cloudburst
    rainfall_forecast_trend = db.Column(db.String(50), default="Stable") # Rising, Peaking, Falling, Stable
    
    river_level_m = db.Column(db.Float, default=2.1) # meters
    river_capacity_pct = db.Column(db.Float, default=35.0) # % of danger mark
    river_trend = db.Column(db.String(50), default="Normal") # Rising Rapidly, Rising, Stable, Receding
    
    soil_saturation_pct = db.Column(db.Float, default=45.0) # % moisture
    slope_deg = db.Column(db.Float, default=32.0) # slope angle in degrees
    slope_stability = db.Column(db.String(50), default="Stable") # Stable, Moderate Risk, Critical / Sliding
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "rainfall_mm": self.rainfall_mm,
            "rainfall_rate": self.rainfall_rate,
            "rainfall_intensity": self.rainfall_intensity,
            "rainfall_forecast_trend": self.rainfall_forecast_trend,
            "river_level_m": self.river_level_m,
            "river_capacity_pct": self.river_capacity_pct,
            "river_trend": self.river_trend,
            "soil_saturation_pct": self.soil_saturation_pct,
            "slope_deg": self.slope_deg,
            "slope_stability": self.slope_stability,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class RiskAssessment(db.Model):
    __tablename__ = 'risk_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False)
    
    overall_score = db.Column(db.Float, nullable=False, default=20.0) # 0-100
    overall_level = db.Column(db.String(20), nullable=False, default="LOW") # LOW, MODERATE, HIGH, CRITICAL
    
    flash_flood_score = db.Column(db.Float, default=15.0)
    flash_flood_level = db.Column(db.String(20), default="LOW")
    
    flood_score = db.Column(db.Float, default=10.0)
    flood_level = db.Column(db.String(20), default="LOW")
    
    landslide_score = db.Column(db.Float, default=22.0)
    landslide_level = db.Column(db.String(20), default="LOW")
    
    heavy_rainfall_score = db.Column(db.Float, default=18.0)
    heavy_rainfall_level = db.Column(db.String(20), default="LOW")
    
    lead_time_minutes = db.Column(db.Integer, default=120)
    contributing_factors = db.Column(db.Text, default="[]") # JSON list of string bullets
    ai_explanation = db.Column(db.Text, default="")
    recommended_action = db.Column(db.Text, default="Normal monitoring. No evacuation required.")
    
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        factors = []
        try:
            factors = json.loads(self.contributing_factors) if self.contributing_factors else []
        except Exception:
            factors = []
            
        return {
            "id": self.id,
            "location_id": self.location_id,
            "overall_score": round(self.overall_score, 1),
            "overall_level": self.overall_level,
            "riskScore": round(self.overall_score, 1),
            "riskLevel": self.overall_level,
            "confidence": 0.91,
            "factors": factors,
            "recommendedActions": [self.recommended_action] if self.recommended_action else [],
            "flash_flood": {
                "score": round(self.flash_flood_score, 1),
                "level": self.flash_flood_level,
                "riskScore": round(self.flash_flood_score, 1),
                "riskLevel": self.flash_flood_level
            },
            "flood": {
                "score": round(self.flood_score, 1),
                "level": self.flood_level,
                "riskScore": round(self.flood_score, 1),
                "riskLevel": self.flood_level
            },
            "landslide": {
                "score": round(self.landslide_score, 1),
                "level": self.landslide_level,
                "riskScore": round(self.landslide_score, 1),
                "riskLevel": self.landslide_level
            },
            "heavy_rainfall": {
                "score": round(self.heavy_rainfall_score, 1),
                "level": self.heavy_rainfall_level,
                "riskScore": round(self.heavy_rainfall_score, 1),
                "riskLevel": self.heavy_rainfall_level
            },
            "lead_time_minutes": self.lead_time_minutes,
            "contributing_factors": factors,
            "ai_explanation": self.ai_explanation,
            "recommended_action": self.recommended_action,
            "calculated_at": self.calculated_at.isoformat() if self.calculated_at else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False)
    
    hazard_type = db.Column(db.String(50), nullable=False) # Flash Flood, Landslide, River Flood, Heavy Rainfall, Multi-Hazard
    severity = db.Column(db.String(20), nullable=False) # CRITICAL, HIGH, MODERATE, LOW
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    radius_km = db.Column(db.Float, default=15.0)
    lead_time_min = db.Column(db.Integer, default=35)
    
    status = db.Column(db.String(30), default="Active") # Active, Monitoring, Resolved, Dismissed
    issued_by = db.Column(db.String(100), default="State Disaster Management Authority")
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        loc_name = self.location.name if self.location else "Sector Zone"
        loc_state = self.location.state if self.location else ""
        return {
            "id": self.id,
            "location_id": self.location_id,
            "location_name": f"{loc_name}, {loc_state}" if loc_state else loc_name,
            "hazard_type": self.hazard_type,
            "severity": self.severity,
            "title": self.title,
            "message": self.message,
            "radius_km": self.radius_km,
            "lead_time_min": self.lead_time_min,
            "status": self.status,
            "issued_by": self.issued_by,
            "created_at": self.created_at.strftime("%H:%M IST") if self.created_at else "",
            "timestamp": self.created_at.isoformat() if self.created_at else "",
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None
        }

class SafeLocation(db.Model):
    __tablename__ = 'safe_locations'
    
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False)
    
    name = db.Column(db.String(150), nullable=False)
    type = db.Column(db.String(80), default="Emergency Shelter") # Emergency Shelter, Relief Centre, Community Hall, Stadium Complex, High Ground Refuge
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    
    capacity = db.Column(db.Integer, default=500)
    current_occupancy = db.Column(db.Integer, default=150)
    status = db.Column(db.String(30), default="OPEN") # OPEN, NEAR CAP, FULL
    distance_km = db.Column(db.Float, default=1.5)
    est_walking_mins = db.Column(db.Integer, default=20)
    contact_phone = db.Column(db.String(30), default="112 / +91-135-2710334")
    facilities = db.Column(db.String(255), default="Medical Aid, Drinking Water, Power Backup, Sanitation")
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        occupancy_pct = round((self.current_occupancy / max(self.capacity, 1)) * 100, 1)
        return {
            "id": self.id,
            "location_id": self.location_id,
            "name": self.name,
            "type": self.type,
            "lat": self.lat,
            "lng": self.lng,
            "capacity": self.capacity,
            "current_occupancy": self.current_occupancy,
            "available_space": max(0, self.capacity - self.current_occupancy),
            "occupancy_pct": occupancy_pct,
            "status": self.status,
            "distance_km": self.distance_km,
            "est_walking_mins": self.est_walking_mins,
            "contact_phone": self.contact_phone,
            "facilities": self.facilities
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=True)
    
    hazard_flash_flood = db.Column(db.Boolean, default=True)
    hazard_flood = db.Column(db.Boolean, default=True)
    hazard_landslide = db.Column(db.Boolean, default=True)
    hazard_heavy_rainfall = db.Column(db.Boolean, default=True)
    
    preferred_language = db.Column(db.String(20), default="English")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "location_id": self.location_id,
            "hazard_preferences": {
                "flash_flood": self.hazard_flash_flood,
                "flood": self.hazard_flood,
                "landslide": self.hazard_landslide,
                "heavy_rainfall": self.hazard_heavy_rainfall
            },
            "preferred_language": self.preferred_language
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    phone = db.Column(db.String(30), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    hazard_type = db.Column(db.String(50), default="Multi-Hazard")
    severity = db.Column(db.String(20), default="CRITICAL")
    status = db.Column(db.String(30), default="Dispatched") # Dispatched, Delivered, Read
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "phone": self.phone,
            "title": self.title,
            "message": self.message,
            "hazard_type": self.hazard_type,
            "severity": self.severity,
            "status": self.status,
            "sent_at": self.sent_at.strftime("%H:%M:%S IST") if self.sent_at else ""
        }
