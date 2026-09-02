import os
from flask import Flask, jsonify
from flask_cors import CORS
from .config import config_by_name
from .models.base import db
from .models.location import Location
from .models.sensor import Sensor
from .models.risk import Risk
from .routes import api_bp, locations_bp, sensors_bp, risk_bp

def create_app(config_name=None):
    """
    Flask Application Factory for PralayWatch Backend (Phase 1).
    Initializes database, CORS, route blueprints, and error handlers.
    """
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # 1. Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', '*')}})

    # 2. Initialize SQLAlchemy
    db.init_app(app)

    # 3. Register Route Blueprints
    app.register_blueprint(api_bp)
    app.register_blueprint(locations_bp)
    app.register_blueprint(sensors_bp)
    app.register_blueprint(risk_bp)

    # 4. Standardized Global JSON Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            'message': getattr(error, 'description', 'Invalid request format or missing parameters')
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Resource Not Found',
            'message': getattr(error, 'description', 'The requested endpoint or resource does not exist')
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'error': 'Method Not Allowed',
            'message': 'The HTTP method is not allowed for this endpoint'
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': 'An unexpected server error occurred'
        }), 500

    # 5. Create database tables within application context
    with app.app_context():
        db.create_all()

    return app
