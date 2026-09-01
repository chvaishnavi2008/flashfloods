from flask import Blueprint, jsonify, request
from models import SafeLocation, Location
from database import db

safe_locations_bp = Blueprint('safe_locations', __name__)

@safe_locations_bp.route('/api/safe-locations', methods=['GET'])
def get_all_safe_locations():
    location_id = request.args.get('location_id')
    if location_id:
        safe_locs = SafeLocation.query.filter_by(location_id=location_id).all()
    else:
        safe_locs = SafeLocation.query.all()
        
    return jsonify({
        "success": True,
        "count": len(safe_locs),
        "safe_locations": [sl.to_dict() for sl in safe_locs]
    }), 200

@safe_locations_bp.route('/api/safe-locations/<int:safe_location_id>', methods=['GET'])
def get_safe_location_by_id(safe_location_id):
    sl = SafeLocation.query.get(safe_location_id)
    if not sl:
        return jsonify({"success": False, "error": "Safe location not found"}), 404
    return jsonify({"success": True, "safe_location": sl.to_dict()}), 200

@safe_locations_bp.route('/api/safe-locations', methods=['POST'])
def add_safe_location():
    data = request.get_json() or {}
    name = data.get('name')
    location_id = data.get('location_id')
    lat = data.get('lat')
    lng = data.get('lng')
    capacity = int(data.get('capacity', 500))
    current_occupancy = int(data.get('current_occupancy', 0))
    status = data.get('status', 'OPEN')
    sl_type = data.get('type', 'Emergency Shelter')
    
    if not name or not location_id or lat is None or lng is None:
        return jsonify({"success": False, "error": "name, location_id, lat, and lng are required"}), 400
        
    new_sl = SafeLocation(
        name=name,
        location_id=location_id,
        lat=float(lat),
        lng=float(lng),
        capacity=capacity,
        current_occupancy=current_occupancy,
        status=status,
        type=sl_type
    )
    db.session.add(new_sl)
    db.session.commit()
    return jsonify({"success": True, "safe_location": new_sl.to_dict()}), 201
