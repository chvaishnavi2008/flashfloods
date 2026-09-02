from flask import Blueprint, jsonify, request
from models import Alert, Location, Notification
from services.alert_service import AlertService
from services.notification_service import NotificationService

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Returns alerts with optional filtering by status (ACTIVE / RESOLVED) or severity."""
    status = request.args.get('status')
    if status and status.lower() == 'active':
        alerts = AlertService.get_active_alerts()
    else:
        alerts = AlertService.get_all_alerts()
        
    return jsonify({
        "success": True,
        "count": len(alerts),
        "alerts": [a.to_dict() for a in alerts]
    }), 200

@alerts_bp.route('/api/alerts/<int:alert_id>', methods=['GET'])
def get_alert_detail(alert_id):
    """Returns detailed alert record."""
    alert = AlertService.get_alert_by_id(alert_id)
    if not alert:
        return jsonify({"success": False, "error": "Alert not found"}), 404
    return jsonify({"success": True, "alert": alert.to_dict()}), 200

@alerts_bp.route('/api/alerts', methods=['POST'])
def create_alert():
    """Manually broadcasts an official warning from the SDMA Authority console."""
    data = request.get_json() or {}
    
    location_id = data.get('location_id')
    location_input = data.get('location')
    hazard_type = data.get('hazard_type', data.get('hazard', 'Flash Flood'))
    severity = data.get('severity', data.get('alert_level', 'CRITICAL'))
    title = data.get('title', f"🚨 {severity} {hazard_type} WARNING")
    message = data.get('message', data.get('recommended_action', 'Evacuate low-lying areas and seek safe shelter.'))
    radius_km = float(data.get('radius_km', 15.0))
    lead_time_min = int(data.get('lead_time_min', data.get('lead_time_minutes', 35)))
    issued_by = data.get('issued_by', 'State Disaster Management Authority')
    risk_score = float(data.get('risk_score', data.get('overall_score', 80.0)))
    reason = data.get('reason', f"Triggered from risk assessment: {severity} {hazard_type}")
    immediate_action = data.get('immediate_action', data.get('recommended_action', 'Evacuate to nearest shelter.'))
    affected_population = data.get('affected_population')
    recommended_next_step = data.get('recommended_next_step')
    
    # Resolve location
    location = None
    if location_id:
        location = Location.query.get(location_id)
    elif location_input:
        loc_str = location_input.get('name') if isinstance(location_input, dict) else str(location_input)
        location = Location.query.filter(Location.name.ilike(f"%{loc_str}%")).first()
        if not location:
            location = Location.query.first()
        location_id = location.id if location else 1
    else:
        location = Location.query.first()
        location_id = location.id if location else 1
        
    if not location:
        return jsonify({"success": False, "error": "Location not found"}), 404
        
    new_alert = AlertService.create_alert(
        location_id=location_id,
        hazard_type=hazard_type,
        severity=severity,
        title=title,
        message=message,
        radius_km=radius_km,
        lead_time_min=lead_time_min,
        issued_by=issued_by,
        risk_score=risk_score,
        reason=reason,
        immediate_action=immediate_action,
        affected_population=affected_population,
        recommended_next_step=recommended_next_step
    )
    
    # Dispatch multi-channel notifications (in-app, browser, simulated SMS/WhatsApp)
    dispatched_notifs = NotificationService.dispatch_emergency_broadcast(location, new_alert)
    
    return jsonify({
        "success": True,
        "message": "Emergency alert broadcast successfully",
        "alert": new_alert.to_dict(),
        "notifications_dispatched": len(dispatched_notifs),
        "dispatch_details": dispatched_notifs
    }), 201

@alerts_bp.route('/api/alerts/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    """Marks an active alert as RESOLVED."""
    resolved = AlertService.resolve_alert(alert_id)
    if not resolved:
        return jsonify({"success": False, "error": "Alert not found"}), 404
    return jsonify({"success": True, "alert": resolved.to_dict()}), 200

@alerts_bp.route('/api/alerts/<int:alert_id>/reactivate', methods=['POST'])
def reactivate_alert(alert_id):
    """Reactivates an alert."""
    reactivated = AlertService.reactivate_alert(alert_id)
    if not reactivated:
        return jsonify({"success": False, "error": "Alert not found"}), 404
    return jsonify({"success": True, "alert": reactivated.to_dict()}), 200

@alerts_bp.route('/api/notifications/channels', methods=['GET'])
def get_notification_channels():
    """Returns multi-channel status and simulation configurations."""
    channels = NotificationService.get_notification_channels()
    return jsonify({"success": True, "data": channels}), 200

@alerts_bp.route('/api/notifications/history', methods=['GET'])
def get_notification_history():
    """Returns past dispatched notification records."""
    notifs = NotificationService.get_latest_notifications(limit=25)
    return jsonify({
        "success": True,
        "count": len(notifs),
        "notifications": [
            {
                "id": n.id,
                "phone": n.phone,
                "title": n.title,
                "message": n.message,
                "hazard_type": n.hazard_type,
                "severity": n.severity,
                "status": n.status,
                "sent_at": n.sent_at.isoformat() if n.sent_at else None
            } for n in notifs
        ]
    }), 200
