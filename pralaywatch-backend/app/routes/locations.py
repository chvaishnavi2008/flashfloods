from flask import Blueprint, jsonify, request
from ..models import db, Location, Sensor, Risk

locations_bp = Blueprint('locations', __name__, url_prefix='/api/locations')

@locations_bp.route('', methods=['GET'])
def get_locations():
    """
    GET /api/locations
    Returns list of all monitored locations with latest risk summary.
    Supports filtering by ?state=..., ?district=..., ?risk_level=...
    """
    try:
        query = Location.query

        # Filter by state
        state = request.args.get('state')
        if state:
            query = query.filter(Location.state.ilike(f"%{state}%"))

        # Filter by district
        district = request.args.get('district')
        if district:
            query = query.filter(Location.district.ilike(f"%{district}%"))

        locations = query.all()
        
        # Include sensors if requested ?include_sensors=true
        include_sensors = request.args.get('include_sensors', 'false').lower() == 'true'

        result = [loc.to_dict(include_latest_risk=True, include_sensors=include_sensors) for loc in locations]

        # Optional filter by risk_level
        risk_level = request.args.get('risk_level')
        if risk_level:
            result = [loc for loc in result if loc.get('latest_risk', {}).get('risk_level') == risk_level.upper()]

        return jsonify({
            'success': True,
            'count': len(result),
            'locations': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Internal server error fetching locations',
            'details': str(e)
        }), 500

@locations_bp.route('/<int:location_id>', methods=['GET'])
def get_location(location_id):
    """
    GET /api/locations/<id>
    Returns detailed location record including latest sensor telemetry and risk history.
    """
    try:
        loc = db.session.get(Location, location_id)
        if not loc:
            return jsonify({
                'success': False,
                'error': f'Location with ID {location_id} not found'
            }), 404

        data = loc.to_dict(include_latest_risk=True, include_sensors=True)

        # Also attach recent risk history (up to 5 records)
        recent_risks = loc.risks.order_by(db.desc('created_at')).limit(5).all()
        data['risk_history'] = [r.to_dict() for r in recent_risks]

        return jsonify({
            'success': True,
            'location': data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error fetching location {location_id}',
            'details': str(e)
        }), 500

@locations_bp.route('', methods=['POST'])
def create_location():
    """
    POST /api/locations
    Creates a new monitored location record.
    """
    try:
        data = request.get_json() or {}

        # Required fields validation
        required_fields = ['state', 'district', 'village', 'latitude', 'longitude', 'elevation', 'slope']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'success': False,
                'error': f"Missing required fields: {', '.join(missing)}"
            }), 400

        new_loc = Location(
            state=data['state'].strip(),
            district=data['district'].strip(),
            village=data['village'].strip(),
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            elevation=float(data['elevation']),
            slope=float(data['slope']),
            flood_susceptibility=float(data.get('flood_susceptibility', 0.5)),
            landslide_susceptibility=float(data.get('landslide_susceptibility', 0.5))
        )

        db.session.add(new_loc)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Location created successfully',
            'location': new_loc.to_dict(include_latest_risk=False)
        }), 201

    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': f'Invalid numerical field format: {str(ve)}'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Error creating location',
            'details': str(e)
        }), 500
