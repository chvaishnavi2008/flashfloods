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

class AssessmentRecord(db.Model):
    __tablename__ = 'assessment_records'
    
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(150), nullable=False, default="Sector")
    latitude = db.Column(db.Float, default=0.0)
    longitude = db.Column(db.Float, default=0.0)
    rainfall = db.Column(db.Float, default=0.0)
    soil_moisture = db.Column(db.Float, default=0.0)
    slope = db.Column(db.Float, default=0.0)
    historical_risk = db.Column(db.Float, default=0.0)
    flash_flood_score = db.Column(db.Float, default=0.0)
    landslide_score = db.Column(db.Float, default=0.0)
    overall_score = db.Column(db.Float, default=0.0)
    risk_level = db.Column(db.String(30), default="LOW")
    dominant_hazard = db.Column(db.String(50), default="flash_flood")
    lead_time_minutes = db.Column(db.Integer, default=60)
    recommended_action = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "risk_id": self.id,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "rainfall": self.rainfall,
            "soil_moisture": self.soil_moisture,
            "slope": self.slope,
            "historical_risk": self.historical_risk,
            "flash_flood_score": round(self.flash_flood_score, 2),
            "landslide_score": round(self.landslide_score, 2),
            "overall_score": round(self.overall_score, 2),
            "risk_level": self.risk_level,
            "dominant_hazard": self.dominant_hazard,
            "lead_time_minutes": self.lead_time_minutes,
            "recommended_action": self.recommended_action,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class SOSRequest(db.Model):
    __tablename__ = 'sos_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    sos_id = db.Column(db.String(50), unique=True, nullable=False, index=True) # e.g. SOS-123
    
    location_latitude = db.Column(db.Float, nullable=False, default=30.4124)
    location_longitude = db.Column(db.Float, nullable=False, default=79.3198)
    location_name = db.Column(db.String(150), nullable=False, default="Chamoli, Uttarakhand")
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(50), default="NEW", nullable=False) # NEW, ACKNOWLEDGED, TEAM DISPATCHED, RESCUE IN PROGRESS, RESOLVED
    
    risk_level = db.Column(db.String(30), default="HIGH", nullable=False) # CRITICAL, HIGH, MODERATE, LOW
    hazard = db.Column(db.String(50), default="FLASH FLOOD", nullable=False)
    message = db.Column(db.Text, default="")
    
    people_count = db.Column(db.Integer, default=1)
    citizen_name = db.Column(db.String(100), default="Citizen in Distress")
    phone = db.Column(db.String(30), default="")
    
    assigned_team_id = db.Column(db.String(50), nullable=True)
    assigned_team_name = db.Column(db.String(100), nullable=True)
    
    acknowledged_at = db.Column(db.DateTime, nullable=True)
    dispatched_at = db.Column(db.DateTime, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    is_demo = db.Column(db.Boolean, default=False)
    
    def time_ago(self):
        if not self.timestamp:
            return "Just now"
        diff = datetime.utcnow() - self.timestamp
        seconds = int(diff.total_seconds())
        if seconds < 60:
            return "Just now"
        minutes = seconds // 60
        if minutes < 60:
            return f"{minutes} min{'s' if minutes > 1 else ''} ago"
        hours = minutes // 60
        if hours < 24:
            return f"{hours} hr{'s' if hours > 1 else ''} ago"
        days = hours // 24
        return f"{days} day{'s' if days > 1 else ''} ago"

    def to_dict(self):
        return {
            "id": self.id,
            "sos_id": self.sos_id,
            "location_latitude": self.location_latitude,
            "location_longitude": self.location_longitude,
            "lat": self.location_latitude,
            "lng": self.location_longitude,
            "location_name": self.location_name,
            "timestamp": self.timestamp.isoformat() if self.timestamp else datetime.utcnow().isoformat(),
            "time_ago": self.time_ago(),
            "status": self.status,
            "risk_level": self.risk_level,
            "urgency": self.risk_level,
            "hazard": self.hazard,
            "message": self.message or "Immediate evacuation / rescue assistance required.",
            "people_count": self.people_count,
            "citizen_name": self.citizen_name,
            "phone": self.phone,
            "assigned_team_id": self.assigned_team_id,
            "assigned_team_name": self.assigned_team_name,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "dispatched_at": self.dispatched_at.isoformat() if self.dispatched_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "is_demo": self.is_demo
        }

