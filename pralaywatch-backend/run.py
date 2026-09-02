import os
import sys
from app import create_app
from app.models import db, Location
from seed import seed_database

app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Auto-seed if database is empty or if --seed argument is passed
    with app.app_context():
        if '--seed' in sys.argv or Location.query.count() == 0:
            print("[Startup] Initializing and seeding PralayWatch Phase 1 database...")
            seed_database(force=('--force' in sys.argv))

    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', '1') == '1'

    print(f"\n========================================================")
    print(f" PralayWatch Backend (Phase 1) Active")
    print(f" Multi-Hazard Early Warning & Risk Intelligence System")
    print(f" Running on http://{host}:{port}")
    print(f" Health Check: http://localhost:{port}/api/health")
    print(f" Locations API: http://localhost:{port}/api/locations")
    print(f" Risk API:      http://localhost:{port}/api/risk/1")
    print(f"========================================================\n")

    app.run(host=host, port=port, debug=debug)
