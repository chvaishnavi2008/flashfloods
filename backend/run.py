"""
PralayWatch - Backend Server Entrypoint
Run this script to launch the Flask REST API server:
    python run.py
"""
import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print("=" * 66)
    print("  🚀 PralayWatch Multi-Hazard Early Warning Backend Running")
    print(f"  📍 Local API Address: http://127.0.0.1:{port}")
    print("  📖 Endpoints: /api/risk-assessment | /api/locations | /api/alerts")
    print("=" * 66)
    app.run(host='0.0.0.0', port=port, debug=True)
