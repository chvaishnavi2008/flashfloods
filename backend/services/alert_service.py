from datetime import datetime
from database import db
from models import Alert

class AlertService:
    """
    Emergency Alert creation, broadcasting, and status tracking service.
    """
    
    @staticmethod
    def get_active_alerts():
        return Alert.query.filter(Alert.status.in_(["Active", "Monitoring"])).order_by(Alert.created_at.desc()).all()
        
    @staticmethod
    def get_all_alerts():
        return Alert.query.order_by(Alert.created_at.desc()).all()
        
    @staticmethod
    def create_alert(location_id, hazard_type, severity, title, message, radius_km=15.0, lead_time_min=35, issued_by="Disaster Management Authority"):
        new_alert = Alert(
            location_id=location_id,
            hazard_type=hazard_type,
            severity=severity,
            title=title,
            message=message,
            radius_km=radius_km,
            lead_time_min=lead_time_min,
            status="Active",
            issued_by=issued_by,
            created_at=datetime.utcnow()
        )
        db.session.add(new_alert)
        db.session.commit()
        return new_alert

    @staticmethod
    def resolve_alert(alert_id):
        alert = Alert.query.get(alert_id)
        if alert:
            alert.status = "Resolved"
            alert.resolved_at = datetime.utcnow()
            db.session.commit()
        return alert
