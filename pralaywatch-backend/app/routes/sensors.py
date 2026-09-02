from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from ..models import db, Location, Sensor

sensors_bp = Blueprint('sensors', __name__, url_prefix='/api/sensors')

def utc_now():
    return datetime.now(timezone.utc)

@sensors_bp.route('', methods=['GET'])
def get_sensors():
    """
    GET /api/sensors
    Returns list of sensor telemetry readings.
    Supports filtering by ?location_id=..., ?sensor_type=..., ?limit=...
    """
    try:
        query = Sensor.query

        location_id = request.args.get('location_id', type=int)
        if location_id:
            query = query.filter(Sensor.location_id == location_id)

        sensor_type = request.args.get('sensor_type')
        if sensor_type:
            query = query.filter(Sensor.sensor_type == sensor_type.lower())

        limit = request.args.get('limit', default=100, type=int)
        sensors = query.order_by(db.desc('timestamp')).limit(limit).all()

        return jsonify({
            'success': True,
            'count': len(sensors),
            'sensors': [s.to_dict() for s in sensors]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Error fetching sensor data',
            'details': str(e)
        }), 500

@sensors_bp.route('/location/<int:location_id>', methods=['GET'])
def get_location_sensors(location_id):
    """
    GET /api/sensors/location/<location_id>
    Returns the latest sensor telemetry readings for a specific location.
    """
    try:
        loc = db.session.get(Location, location_id)
        if not loc:
            return jsonify({
                'success': False,
                'error': f'Location with ID {location_id} not found'
            }), 404

        sensors = loc.sensors.order_by(db.desc('timestamp')).all()

        # Group by sensor_type to get latest reading per type
        latest_readings = {}
        for s in sensors:
            if s.sensor_type not in latest_readings:
                latest_readings[s.sensor_type] = s.to_dict()

        return jsonify({
            'success': True,
            'location_id': location_id,
            'location_name': f"{loc.village}, {loc.district}",
            'latest_telemetry': latest_readings,
            'all_sensors': [s.to_dict() for s in sensors]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error fetching sensors for location {location_id}',
            'details': str(e)
        }), 500

@sensors_bp.route('', methods=['POST'])
def create_sensor_reading():
    """
    POST /api/sensors
    Ingests a new sensor telemetry reading.
    Supports single reading object or list of readings.
    """
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({'success': False, 'error': 'No input data provided'}), 400

        readings = payload if isinstance(payload, list) else [payload]
        created = []

        for item in readings:
            if not all(k in item for k in ('location_id', 'sensor_type', 'value', 'unit')):
                return jsonify({
                    'success': False,
                    'error': 'Each sensor reading requires location_id, sensor_type, value, and unit'
                }), 400

            # Verify location exists
            loc = db.session.get(Location, item['location_id'])
            if not loc:
                return jsonify({
                    'success': False,
                    'error': f"Location ID {item['location_id']} does not exist"
                }), 404

            sensor = Sensor(
                location_id=item['location_id'],
                sensor_type=item['sensor_type'].lower().strip(),
                value=float(item['value']),
                unit=item['unit'].strip(),
                status=item.get('status', 'ACTIVE'),
                timestamp=utc_now()
            )
            db.session.add(sensor)
            created.append(sensor)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': f"Successfully ingested {len(created)} sensor reading(s)",
            'sensors': [s.to_dict() for s in created]
        }), 201

    except ValueError as ve:
        return jsonify({'success': False, 'error': f'Invalid value: {str(ve)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Failed to save sensor reading', 'details': str(e)}), 500
