"""
Verification script for PralayWatch Phase 1 Live Server
Tests all REST endpoints against a running Flask test server.
"""

import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import threading
import time
import json
import urllib.request
import urllib.error
from app import create_app
from seed import seed_database

def run_server(app, port):
    app.run(host='127.0.0.1', port=port, debug=False, use_reloader=False)

def verify_endpoints():
    test_port = 5099
    app = create_app('testing')
    seed_database(app, force=True)

    server_thread = threading.Thread(target=run_server, args=(app, test_port), daemon=True)
    server_thread.start()
    time.sleep(1.0)  # Wait for server to start

    base_url = f"http://127.0.0.1:{test_port}"

    print(f"\n[Verification] Testing live endpoints on {base_url}...")

    # 1. Health Endpoint
    print("\n1. Testing GET /api/health...")
    with urllib.request.urlopen(f"{base_url}/api/health") as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   Status: {data['status']}, Database: {data['database']}")
        assert data['status'] == 'healthy'

    # 2. Locations Endpoint
    print("\n2. Testing GET /api/locations...")
    with urllib.request.urlopen(f"{base_url}/api/locations") as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   Locations Count: {data['count']}")
        assert data['count'] >= 14
        sample = data['locations'][0]
        print(f"   Sample Location: {sample['name']} ({sample['state']}) -> Score: {sample.get('latest_risk', {}).get('overall_score')} ({sample.get('latest_risk', {}).get('risk_level')})")

    # 3. Single Location Endpoint
    print("\n3. Testing GET /api/locations/1...")
    with urllib.request.urlopen(f"{base_url}/api/locations/1") as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        loc = data['location']
        print(f"   Location: {loc['village']}, {loc['district']} | Elevation: {loc['elevation']}m | Slope: {loc['slope']}°")
        print(f"   Attached Sensors: {len(loc['sensors'])} sensors")
        assert len(loc['sensors']) > 0

    # 4. Risk Endpoint
    print("\n4. Testing GET /api/risk/1...")
    with urllib.request.urlopen(f"{base_url}/api/risk/1") as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        risk = data['risk_assessment']
        print(f"   Flash Flood Score: {risk['flash_flood_score']}/100")
        print(f"   Landslide Score:   {risk['landslide_score']}/100")
        print(f"   Overall Score:     {risk['overall_score']}/100 -> {risk['risk_level']}")
        print(f"   Lead Time Window:  {risk['lead_time_minutes']} minutes")
        print(f"   Action Guidance:   {risk['recommended_action']}")

    # 5. Live Simulation / Custom Evaluation POST
    print("\n5. Testing POST /api/risk/evaluate/1 (Simulating Torrential Surge)...")
    req = urllib.request.Request(
        f"{base_url}/api/risk/evaluate/1",
        data=json.dumps({'rainfall': 130.0, 'soil_moisture': 95.0, 'river_level': 6.2}).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        sim_risk = data['risk_assessment']
        print(f"   Simulated Overall Score: {sim_risk['overall_score']}/100 ({sim_risk['risk_level']})")
        print(f"   Simulated Lead Time:     {sim_risk['lead_time_minutes']} mins")
        assert sim_risk['risk_level'] == 'CRITICAL'

    print("\n============================================================")
    print(" ALL ENDPOINTS VERIFIED AND PASSED SUCCESSFULLY!")
    print("============================================================\n")

if __name__ == '__main__':
    verify_endpoints()
