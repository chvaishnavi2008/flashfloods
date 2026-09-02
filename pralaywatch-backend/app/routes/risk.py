from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from ..models import db, Location, Sensor, Risk
from ..services.risk_engine import RiskEngine

risk_bp = Blueprint('risk', __name__, url_prefix='/api/risk')

def utc_now():
    return datetime.now(timezone.utc)

def _extract_sensor_values(location):
    """
    Helper to extract latest sensor readings for a location into a clean dictionary.
    """
    sensors = location.sensors.order_by(db.desc('timestamp')).all()
    latest = {}
    for s in sensors:
        if s.sensor_type not in latest:
            latest[s.sensor_type] = s.value

    return {
        'rainfall': latest.get('rainfall', 0.0),
        'soil_moisture': latest.get('soil_moisture', 30.0),
        'river_level': latest.get('river_level', 1.0),
        'water_discharge': latest.get('water_discharge', 100.0),
        'slope': location.slope,
        'flood_susceptibility': location.flood_susceptibility,
        'landslide_susceptibility': location.landslide_susceptibility
    }

@risk_bp.route('', methods=['GET'])
def get_system_risk_overview():
    """
    GET /api/risk
    Returns a system-wide multi-hazard risk overview across all monitored sectors.
    """
    try:
        locations = Location.query.all()
        risk_summary = {
            'total_monitored_locations': len(locations),
            'risk_level_counts': {'CRITICAL': 0, 'HIGH': 0, 'MODERATE': 0, 'LOW': 0},
            'critical_locations': [],
            'high_locations': []
        }

        for loc in locations:
            latest_risk = loc.risks.order_by(db.desc('created_at')).first()
            if latest_risk:
                level = latest_risk.risk_level
                if level in risk_summary['risk_level_counts']:
                    risk_summary['risk_level_counts'][level] += 1

                item = {
                    'location_id': loc.id,
                    'location_name': f"{loc.village}, {loc.district}",
                    'state': loc.state,
                    'overall_score': latest_risk.overall_score,
                    'risk_level': latest_risk.risk_level,
                    'lead_time_minutes': latest_risk.lead_time_minutes
                }

                if level == 'CRITICAL':
                    risk_summary['critical_locations'].append(item)
                elif level == 'HIGH':
                    risk_summary['high_locations'].append(item)

        return jsonify({
            'success': True,
            'summary': risk_summary
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Error generating system risk overview',
            'details': str(e)
        }), 500

@risk_bp.route('/<int:location_id>', methods=['GET'])
def get_location_risk(location_id):
    """
    GET /api/risk/<location_id>
    Returns the latest risk assessment and explanation for a specific location.
    If ?recalculate=true, runs live evaluation from current sensor telemetry.
    """
    try:
        loc = db.session.get(Location, location_id)
        if not loc:
            return jsonify({
                'success': False,
                'error': f'Location with ID {location_id} not found'
            }), 404

        recalculate = request.args.get('recalculate', 'false').lower() == 'true'
        latest_risk = loc.risks.order_by(db.desc('created_at')).first()

        # If recalculate requested or no risk record exists yet, evaluate on the fly
        if recalculate or not latest_risk:
            raw_inputs = _extract_sensor_values(loc)
            assessment = RiskEngine.evaluate(raw_inputs, loc)

            # Persist evaluation
            new_risk = Risk(
                location_id=loc.id,
                flash_flood_score=assessment['flash_flood_score'],
                landslide_score=assessment['landslide_score'],
                overall_score=assessment['overall_score'],
                risk_level=assessment['risk_level'],
                lead_time_minutes=assessment['lead_time_minutes'],
                created_at=utc_now()
            )
            db.session.add(new_risk)
            db.session.commit()
            latest_risk = new_risk

            response_data = assessment
            response_data['risk_id'] = new_risk.id
            response_data['created_at'] = new_risk.created_at.isoformat()
        else:
            # Reconstruct assessment payload from latest record
            raw_inputs = _extract_sensor_values(loc)
            assessment = RiskEngine.evaluate(raw_inputs, loc)
            response_data = assessment
            response_data['risk_id'] = latest_risk.id
            response_data['created_at'] = latest_risk.created_at.isoformat()

        response_data['location'] = {
            'id': loc.id,
            'state': loc.state,
            'district': loc.district,
            'village': loc.village,
            'name': f"{loc.village}, {loc.district}",
            'latitude': loc.latitude,
            'longitude': loc.longitude,
            'elevation': loc.elevation,
            'slope': loc.slope
        }

        return jsonify({
            'success': True,
            'risk_assessment': response_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error computing risk for location {location_id}',
            'details': str(e)
        }), 500

@risk_bp.route('/evaluate/<int:location_id>', methods=['POST'])
def evaluate_custom_risk(location_id):
    """
    POST /api/risk/evaluate/<location_id>
    Evaluates multi-hazard risk with optional simulated sensor inputs provided in JSON body.
    Persists evaluation to database.
    """
    try:
        loc = db.session.get(Location, location_id)
        if not loc:
            return jsonify({
                'success': False,
                'error': f'Location with ID {location_id} not found'
            }), 404

        custom_body = request.get_json() or {}
        
        # Start with current live sensor baseline
        inputs = _extract_sensor_values(loc)

        # Override with any custom values passed in request body
        for key in ('rainfall', 'soil_moisture', 'river_level', 'water_discharge', 'slope'):
            if key in custom_body:
                inputs[key] = float(custom_body[key])

        # Evaluate using transparent risk engine
        assessment = RiskEngine.evaluate(inputs, loc)

        # Persist new risk record
        new_risk = Risk(
            location_id=loc.id,
            flash_flood_score=assessment['flash_flood_score'],
            landslide_score=assessment['landslide_score'],
            overall_score=assessment['overall_score'],
            risk_level=assessment['risk_level'],
            lead_time_minutes=assessment['lead_time_minutes'],
            created_at=utc_now()
        )
        db.session.add(new_risk)
        db.session.commit()

        assessment['risk_id'] = new_risk.id
        assessment['created_at'] = new_risk.created_at.isoformat()
        assessment['location'] = {
            'id': loc.id,
            'state': loc.state,
            'district': loc.district,
            'village': loc.village,
            'name': f"{loc.village}, {loc.district}"
        }

        return jsonify({
            'success': True,
            'message': 'Risk evaluation completed and saved successfully',
            'risk_assessment': assessment
        }), 200

    except ValueError as ve:
        return jsonify({'success': False, 'error': f'Invalid numeric format: {str(ve)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Evaluation failed', 'details': str(e)}), 500
