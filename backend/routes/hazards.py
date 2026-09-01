from flask import Blueprint, jsonify
from models import Hazard

hazards_bp = Blueprint('hazards', __name__)

@hazards_bp.route('/api/hazards', methods=['GET'])
def get_hazards():
    hazards = Hazard.query.all()
    return jsonify({
        "success": True,
        "hazards": [h.to_dict() for h in hazards]
    }), 200
