from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models import SOSRequest, Location

sos_bp = Blueprint('sos', __name__)

@sos_bp.route('/api/sos', methods=['GET'], strict_slashes=False)
def get_sos_requests():
    """
    Returns list of all SOS distress requests, sorted newest first.
    Supports optional ?status= filter or ?active_only=true
    """
    try:
        status_filter = request.args.get('status')
        active_only = request.args.get('active_only', '').lower() == 'true'

        query = SOSRequest.query
        if status_filter and status_filter.upper() != 'ALL':
            query = query.filter_by(status=status_filter.upper())
        elif active_only:
            query = query.filter(SOSRequest.status != 'RESOLVED')

        sos_list = query.order_by(SOSRequest.timestamp.desc()).all()
        
        active_count = SOSRequest.query.filter(SOSRequest.status != 'RESOLVED').count()
        new_count = SOSRequest.query.filter_by(status='NEW').count()

        return jsonify({
            "success": True,
            "count": len(sos_list),
            "active_count": active_count,
            "new_count": new_count,
            "sos_requests": [s.to_dict() for s in sos_list]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@sos_bp.route('/api/sos/<sos_id>', methods=['GET'], strict_slashes=False)
def get_sos_detail(sos_id):
    """
    Get single SOS request by sos_id (e.g. SOS-123) or integer ID.
    """
    try:
        sos = None
        if sos_id.isdigit():
            sos = SOSRequest.query.get(int(sos_id))
        if not sos:
            sos = SOSRequest.query.filter_by(sos_id=sos_id).first()

        if not sos:
            return jsonify({"success": False, "error": "SOS record not found"}), 404

        return jsonify({"success": True, "sos": sos.to_dict()}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@sos_bp.route('/api/sos', methods=['POST'], strict_slashes=False)
def create_sos():
    """
    Creates a new SOS distress record from Citizen Portal.
    """
    try:
        data = request.get_json() or {}

        # Generate unique SOS ticket ID
        sos_id = data.get('sos_id') or f"SOS-{int(datetime.utcnow().timestamp() * 1000) % 100000}"

        # Resolve location coordinates
        lat = data.get('location_latitude') or data.get('lat')
        lng = data.get('location_longitude') or data.get('lng')
        location_name = data.get('location_name') or 'Monitored Sector, Uttarakhand'

        if not lat or not lng:
            location_id = data.get('location_id')
            if location_id:
                loc = Location.query.get(location_id)
                if loc:
                    lat = loc.lat
                    lng = loc.lng
                    location_name = f"{loc.name}, {loc.state}"
            if not lat or not lng:
                lat = 30.4124
                lng = 79.3198

        new_sos = SOSRequest(
            sos_id=sos_id,
            location_latitude=float(lat),
            location_longitude=float(lng),
            location_name=location_name,
            timestamp=datetime.utcnow(),
            status='NEW',
            risk_level=data.get('risk_level') or data.get('urgency') or 'HIGH',
            hazard=data.get('hazard') or 'FLASH FLOOD',
            message=data.get('message') or 'Emergency rescue required. Water rapidly rising.',
            people_count=int(data.get('people_count') or 1),
            citizen_name=data.get('citizen_name') or 'Citizen in Distress',
            phone=data.get('phone') or '',
            is_demo=bool(data.get('is_demo', False))
        )

        db.session.add(new_sos)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "SOS distress record registered successfully",
            "sos": new_sos.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@sos_bp.route('/api/sos/<sos_id>/acknowledge', methods=['POST'], strict_slashes=False)
def acknowledge_sos(sos_id):
    """
    Authority acknowledges the SOS request. Sets status: ACKNOWLEDGED.
    """
    try:
        sos = None
        if sos_id.isdigit():
            sos = SOSRequest.query.get(int(sos_id))
        if not sos:
            sos = SOSRequest.query.filter_by(sos_id=sos_id).first()

        if not sos:
            return jsonify({"success": False, "error": "SOS record not found"}), 404

        sos.status = 'ACKNOWLEDGED'
        sos.acknowledged_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"SOS {sos.sos_id} acknowledged by Authority",
            "sos": sos.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@sos_bp.route('/api/sos/<sos_id>/dispatch', methods=['POST'], strict_slashes=False)
def dispatch_sos(sos_id):
    """
    Assigns a rescue team and sets status: TEAM DISPATCHED.
    """
    try:
        data = request.get_json() or {}
        sos = None
        if sos_id.isdigit():
            sos = SOSRequest.query.get(int(sos_id))
        if not sos:
            sos = SOSRequest.query.filter_by(sos_id=sos_id).first()

        if not sos:
            return jsonify({"success": False, "error": "SOS record not found"}), 404

        team_id = data.get('team_id') or 'NDRF-01'
        team_name = data.get('team_name') or 'NDRF Team Alpha'

        sos.status = 'TEAM DISPATCHED'
        sos.assigned_team_id = team_id
        sos.assigned_team_name = team_name
        sos.dispatched_at = datetime.utcnow()
        if not sos.acknowledged_at:
            sos.acknowledged_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Rescue Team {team_name} assigned and dispatched to SOS {sos.sos_id}",
            "sos": sos.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@sos_bp.route('/api/sos/<sos_id>/status', methods=['POST', 'PATCH'], strict_slashes=False)
def update_sos_status(sos_id):
    """
    Updates the status of an SOS request across the lifecycle:
    NEW -> ACKNOWLEDGED -> TEAM DISPATCHED -> RESCUE IN PROGRESS -> RESOLVED
    """
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        if not new_status:
            return jsonify({"success": False, "error": "Missing status field"}), 400

        sos = None
        if sos_id.isdigit():
            sos = SOSRequest.query.get(int(sos_id))
        if not sos:
            sos = SOSRequest.query.filter_by(sos_id=sos_id).first()

        if not sos:
            return jsonify({"success": False, "error": "SOS record not found"}), 404

        sos.status = new_status.upper()
        if sos.status == 'ACKNOWLEDGED' and not sos.acknowledged_at:
            sos.acknowledged_at = datetime.utcnow()
        elif sos.status == 'TEAM DISPATCHED' and not sos.dispatched_at:
            sos.dispatched_at = datetime.utcnow()
        elif sos.status == 'RESOLVED':
            sos.resolved_at = datetime.utcnow()

        if data.get('assigned_team_id'):
            sos.assigned_team_id = data.get('assigned_team_id')
        if data.get('assigned_team_name'):
            sos.assigned_team_name = data.get('assigned_team_name')

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"SOS status updated to {sos.status}",
            "sos": sos.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@sos_bp.route('/api/sos/<sos_id>/resolve', methods=['POST'], strict_slashes=False)
def resolve_sos(sos_id):
    """
    Marks SOS as RESOLVED.
    """
    try:
        sos = None
        if sos_id.isdigit():
            sos = SOSRequest.query.get(int(sos_id))
        if not sos:
            sos = SOSRequest.query.filter_by(sos_id=sos_id).first()

        if not sos:
            return jsonify({"success": False, "error": "SOS record not found"}), 404

        sos.status = 'RESOLVED'
        sos.resolved_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"SOS {sos.sos_id} marked as RESOLVED",
            "sos": sos.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@sos_bp.route('/api/sos/demo', methods=['POST'], strict_slashes=False)
def create_demo_sos():
    """
    Creates a clearly marked [DEMO] SOS record for evaluation and testing.
    """
    try:
        data = request.get_json() or {}
        demo_num = int(datetime.utcnow().timestamp()) % 1000
        sos_id = f"SOS-DEMO-{demo_num}"

        lat = data.get('lat') or 30.4124
        lng = data.get('lng') or 79.3198
        loc_name = data.get('location_name') or 'Chamoli (Alaknanda Basin), Uttarakhand'

        demo_sos = SOSRequest(
            sos_id=sos_id,
            location_latitude=float(lat),
            location_longitude=float(lng),
            location_name=loc_name,
            timestamp=datetime.utcnow(),
            status='NEW',
            risk_level=data.get('risk_level') or 'CRITICAL',
            hazard=data.get('hazard') or 'FLASH FLOOD',
            message='[DEMO SIMULATION] Rapid flash flood surge in lower ward. 4 citizens trapped on rooftop.',
            people_count=4,
            citizen_name='[DEMO CITIZEN] Test Coordinator',
            phone='+91 99999 00000',
            is_demo=True
        )

        db.session.add(demo_sos)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Demo SOS {sos_id} created successfully",
            "sos": demo_sos.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
