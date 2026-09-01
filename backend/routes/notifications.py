from flask import Blueprint, jsonify, request
from models import Notification, User
from database import db
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    notifs = Notification.query.order_by(Notification.sent_at.desc()).limit(20).all()
    return jsonify({
        "success": True,
        "notifications": [n.to_dict() for n in notifs]
    }), 200

@notifications_bp.route('/api/notifications', methods=['POST'])
def send_notification():
    """
    Subscribes a user or triggers a test prototype notification.
    """
    data = request.get_json() or {}
    name = data.get('name', 'Citizen User')
    phone = data.get('phone', '+91 98765 43210')
    location_id = data.get('location_id')
    hazard_prefs = data.get('hazard_preferences', {})
    
    # Save or update User
    user = User.query.filter_by(phone=phone).first()
    if not user:
        user = User(name=name, phone=phone, location_id=location_id)
        db.session.add(user)
    else:
        user.name = name
        user.location_id = location_id
        
    user.hazard_flash_flood = hazard_prefs.get('flash_flood', True)
    user.hazard_flood = hazard_prefs.get('flood', True)
    user.hazard_landslide = hazard_prefs.get('landslide', True)
    user.hazard_heavy_rainfall = hazard_prefs.get('heavy_rainfall', True)
    
    # Create confirmation notification
    notif = Notification(
        user_id=user.id,
        phone=phone,
        title="Subscription Confirmed: PralayWatch Early Warning",
        message=f"You are now subscribed to automated multi-hazard alerts for your sector. Stay safe.",
        hazard_type="System",
        severity="LOW",
        status="Dispatched",
        sent_at=datetime.utcnow()
    )
    db.session.add(notif)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Citizen alert settings saved successfully.",
        "user": user.to_dict(),
        "mock_notification": notif.to_dict()
    }), 201
