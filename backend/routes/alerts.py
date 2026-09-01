from flask import Blueprint, jsonify, request
from models import Alert, Location
from services.alert_service import AlertService
from services.notification_service import NotificationService

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/api/alerts', methods=['GET'])
def get_alerts():
    status = request.args.get('status')
    if status == 'active':
        alerts = AlertService.get_active_alerts()
    else:
        alerts = AlertService.get_all_alerts()
        
    return jsonify({
        "success": True,
        "count": len(alerts),
        "alerts": [a.to_dict() for a in alerts]
    }), 200

@alerts_bp.route('/api/alerts', methods=['POST'])
def create_alert():
    data = request.get_json() or {}
    
    location_id = data.get('location_id')
    hazard_type = data.get('hazard_type', 'Flash Flood')
    severity = data.get('severity', 'CRITICAL')
    title = data.get('title', f"Emergency Warning: {hazard_type}")
    message = data.get('message', 'High-risk multi-hazard event detected. Move to higher ground immediately.')
    radius_km = float(data.get('radius_km', 15.0))
    lead_time_min = int(data.get('lead_time_min', 35))
    issued_by = data.get('issued_by', 'State Disaster Management Authority')
    
    if not location_id:
        return jsonify({"success": False, "error": "location_id is required"}), 400
        
    location = Location.query.get(location_id)
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
        issued_by=issued_by
    )
    
    # Automatically trigger mock SMS notifications to citizens
    dispatched_notifs = NotificationService.dispatch_emergency_broadcast(location, new_alert)
    
    return jsonify({
        "success": True,
        "message": "Emergency alert broadcast successfully",
        "alert": new_alert.to_dict(),
        "notifications_dispatched": len(dispatched_notifs)
    }), 201

@alerts_bp.route('/api/alerts/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    resolved = AlertService.resolve_alert(alert_id)
    if not resolved:
        return jsonify({"success": False, "error": "Alert not found"}), 404
    return jsonify({"success": True, "alert": resolved.to_dict()}), 200
