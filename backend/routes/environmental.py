from flask import Blueprint, jsonify, request
from models import EnvironmentalData, Location

environmental_bp = Blueprint('environmental', __name__)

@environmental_bp.route('/api/environmental-data', methods=['GET'])
def get_environmental_data():
    location_id = request.args.get('location_id')
    if location_id:
        data = EnvironmentalData.query.filter_by(location_id=location_id).first()
        if not data:
            return jsonify({"success": False, "error": "Environmental data not found"}), 404
        return jsonify({"success": True, "environmental_data": data.to_dict()}), 200
        
    all_data = EnvironmentalData.query.all()
    results = []
    for d in all_data:
        loc = Location.query.get(d.location_id)
        d_dict = d.to_dict()
        d_dict["location_name"] = loc.name if loc else "Unknown"
        d_dict["state"] = loc.state if loc else ""
        results.append(d_dict)
        
    return jsonify({
        "success": True,
        "count": len(results),
        "environmental_data": results
    }), 200
