import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db
from seed_data import seed_database

# Import Blueprints
from routes.locations import locations_bp
from routes.risk import risk_bp
from routes.hazards import hazards_bp
from routes.alerts import alerts_bp
from routes.safe_locations import safe_locations_bp
from routes.simulate import simulate_bp
from routes.notifications import notifications_bp
from routes.environmental import environmental_bp
from routes.rescue_teams import rescue_teams_bp
from routes.sos import sos_bp

def create_app(config_class=Config):
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    static_exists = os.path.exists(dist_dir)
    
    app = Flask(__name__, static_folder=dist_dir if static_exists else None, static_url_path='')
    app.config.from_object(config_class)
    
    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize SQLAlchemy database
    db.init_app(app)
    
    # Register API Blueprints
    app.register_blueprint(locations_bp)
    app.register_blueprint(risk_bp)
    app.register_blueprint(hazards_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(safe_locations_bp)
    app.register_blueprint(simulate_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(environmental_bp)
    app.register_blueprint(rescue_teams_bp)
    app.register_blueprint(sos_bp)
    
    @app.route('/health')
    def health():
        return jsonify({"status": "HEALTHY", "database": "CONNECTED"}), 200

    # Serve built React frontend if available, else JSON status
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if static_exists and path and os.path.exists(os.path.join(dist_dir, path)):
            return app.send_static_file(path)
        if static_exists and os.path.exists(os.path.join(dist_dir, 'index.html')):
            return app.send_static_file('index.html')
        
        return jsonify({
            "platform": "AapdaSetu - AI-Powered Multi-Hazard Early Warning & Emergency Response",
            "version": "1.0.0-SIH-Phase1",
            "status": "OPERATIONAL",
            "endpoints": [
                "/api/locations",
                "/api/risk",
                "/api/risk/<location_id>",
                "/api/hazards",
                "/api/alerts",
                "/api/safe-locations",
                "/api/simulate",
                "/api/notifications",
                "/api/environmental-data"
            ]
        })

    # Auto create tables and seed initial data
    with app.app_context():
        db.create_all()
        seed_database()
        
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"================================================================")
    print(f"  AapdaSetu - Backend Early Warning API Server Online")
    print(f"  Listening on: http://127.0.0.1:{port}")
    print(f"================================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
