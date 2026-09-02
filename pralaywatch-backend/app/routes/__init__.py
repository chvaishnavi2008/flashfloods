from datetime import datetime, timezone
from flask import Blueprint, jsonify
from .locations import locations_bp
from .sensors import sensors_bp
from .risk import risk_bp
from ..models import db, Location, Sensor, Risk

api_bp = Blueprint('api', __name__, url_prefix='/api')

def utc_now():
    return datetime.now(timezone.utc)

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /api/health
    System health status endpoint for PralayWatch Phase 1 backend.
    """
    try:
        # Check database connectivity
        location_count = Location.query.count()
        sensor_count = Sensor.query.count()
        risk_count = Risk.query.count()

        return jsonify({
            'status': 'healthy',
            'service': 'PralayWatch Multi-Hazard Early Warning Backend',
            'phase': 1,
            'version': '1.0.0',
            'timestamp': utc_now().isoformat(),
            'database': {
                'status': 'connected',
                'locations_count': location_count,
                'sensors_count': sensor_count,
                'risks_count': risk_count
            },
            'risk_engine': {
                'type': 'Deterministic Weighted Formula (Phase 1 Baseline)',
                'ml_status': 'Disabled (Planned Phase 2)',
                'active_hazard_models': ['flash_flood', 'landslide', 'composite_overall']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'degraded',
            'service': 'PralayWatch Backend',
            'error': str(e),
            'timestamp': utc_now().isoformat()
        }), 500

__all__ = ['api_bp', 'locations_bp', 'sensors_bp', 'risk_bp']
