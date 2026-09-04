"""
AapdaSetu - Root Launch Script
Run this script to start the backend Flask API:
    python run.py
"""
import os
import sys

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print("=" * 66)
    print("  🚀 AapdaSetu Multi-Hazard Early Warning Backend Running")
    print(f"  📍 Local API Address: http://127.0.0.1:{port}")
    print("=" * 66)
    app.run(host='0.0.0.0', port=port, debug=True)
