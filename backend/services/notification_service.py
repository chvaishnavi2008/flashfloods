from datetime import datetime
from database import db
from models import Notification, User

class NotificationService:
    """
    Prototype Notification Service.
    Dispatches mock emergency SMS and push broadcasts to subscribed citizens.
    Structured to plug into Twilio / Gov SMS Gateway in Phase 2.
    """
    
    @staticmethod
    def dispatch_emergency_broadcast(location, alert):
        """
        Finds all citizens registered in or near the affected location and generates
        a prototype SMS alert notification record.
        """
        users = User.query.filter((User.location_id == location.id) | (User.location_id.is_(None))).all()
        dispatched_notifications = []
        
        # If no users in DB, create for demo phone
        if not users:
            phone = "+91 98765 43210"
            notif = Notification(
                user_id=None,
                phone=phone,
                title=alert.title,
                message=alert.message,
                hazard_type=alert.hazard_type,
                severity=alert.severity,
                status="Dispatched",
                sent_at=datetime.utcnow()
            )
            db.session.add(notif)
            dispatched_notifications.append(notif)
        else:
            for u in users:
                notif = Notification(
                    user_id=u.id,
                    phone=u.phone,
                    title=alert.title,
                    message=alert.message,
                    hazard_type=alert.hazard_type,
                    severity=alert.severity,
                    status="Dispatched",
                    sent_at=datetime.utcnow()
                )
                db.session.add(notif)
                dispatched_notifications.append(notif)
                
        db.session.commit()
        return dispatched_notifications

    @staticmethod
    def get_latest_notifications(limit=10):
        return Notification.query.order_by(Notification.sent_at.desc()).limit(limit).all()
