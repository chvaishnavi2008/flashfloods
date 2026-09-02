from flask import Blueprint, jsonify, request
from models import Location, RiskAssessment

locations_bp = Blueprint('locations', __name__)

@locations_bp.route('/api/locations', methods=['GET'])
def get_locations():
    """Returns list of all monitoring locations with coordinates and current risk level."""
    locations = Location.query.all()
    results = []
    
    for loc in locations:
        loc_dict = loc.to_dict()
        latest_risk = RiskAssessment.query.filter_by(location_id=loc.id).order_by(RiskAssessment.calculated_at.desc()).first()
        if latest_risk:
            loc_dict["current_risk"] = {
                "overall_score": round(latest_risk.overall_score, 1),
                "overall_level": latest_risk.overall_level,
                "flash_flood_level": latest_risk.flash_flood_level,
                "landslide_level": latest_risk.landslide_level,
                "flood_level": latest_risk.flood_level,
                "heavy_rainfall_level": latest_risk.heavy_rainfall_level
            }
        else:
            loc_dict["current_risk"] = {
                "overall_score": 20.0,
                "overall_level": "LOW",
                "flash_flood_level": "LOW",
                "landslide_level": "LOW",
                "flood_level": "LOW",
                "heavy_rainfall_level": "LOW"
            }
        loc_dict["latitude"] = loc.lat
        loc_dict["longitude"] = loc.lng
        results.append(loc_dict)
        
    return jsonify({
        "success": True,
        "count": len(results),
        "locations": results
    }), 200

@locations_bp.route('/api/locations/<int:location_id>', methods=['GET'])
def get_location_by_id(location_id):
    location = Location.query.get(location_id)
    if not location:
        return jsonify({"success": False, "error": "Location not found"}), 404
    return jsonify({"success": True, "location": location.to_dict()}), 200
