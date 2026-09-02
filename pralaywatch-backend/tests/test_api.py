import unittest
import json
from app import create_app
from app.models import db, Location, Sensor, Risk
from app.services.risk_engine import RiskEngine
from seed import seed_database

class PralayWatchPhase1TestCase(unittest.TestCase):
    """
    Automated Unit & Integration Test Suite for PralayWatch Phase 1 Backend.
    """

    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Seed sample data
        seed_database()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # -------------------------------------------------------------------------
    # 1. Health Check Endpoint Tests
    # -------------------------------------------------------------------------
    def test_health_check(self):
        """Test GET /api/health returns 200 and healthy database status."""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['phase'], 1)
        self.assertIn('database', data)
        self.assertGreater(data['database']['locations_count'], 0)

    # -------------------------------------------------------------------------
    # 2. Locations Endpoint Tests
    # -------------------------------------------------------------------------
    def test_get_all_locations(self):
        """Test GET /api/locations returns all seeded locations across 5 states."""
        response = self.client.get('/api/locations')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        self.assertGreaterEqual(data['count'], 14)
        
        # Verify 5 target states exist
        states = {loc['state'] for loc in data['locations']}
        self.assertIn('Himachal Pradesh', states)
        self.assertIn('Uttarakhand', states)
        self.assertIn('Sikkim', states)
        self.assertIn('Assam', states)
        self.assertIn('Meghalaya', states)

    def test_get_single_location(self):
        """Test GET /api/locations/<id> returns specific location details and sensors."""
        response = self.client.get('/api/locations/1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        self.assertEqual(data['location']['id'], 1)
        self.assertIn('sensors', data['location'])
        self.assertIn('latest_risk', data['location'])

    def test_get_invalid_location_404(self):
        """Test GET /api/locations/9999 returns 404 JSON error."""
        response = self.client.get('/api/locations/9999')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data.decode('utf-8'))
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    def test_create_location(self):
        """Test POST /api/locations creates new location."""
        new_loc = {
            'state': 'Uttarakhand',
            'district': 'Uttarkashi',
            'village': 'Harsil Valley',
            'latitude': 31.0378,
            'longitude': 78.7378,
            'elevation': 2620.0,
            'slope': 31.0,
            'flood_susceptibility': 0.70,
            'landslide_susceptibility': 0.65
        }
        response = self.client.post('/api/locations',
                                    data=json.dumps(new_loc),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        self.assertEqual(data['location']['village'], 'Harsil Valley')

    # -------------------------------------------------------------------------
    # 3. Sensors Endpoint Tests
    # -------------------------------------------------------------------------
    def test_get_sensors(self):
        """Test GET /api/sensors returns telemetry readings."""
        response = self.client.get('/api/sensors?location_id=1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        self.assertGreater(data['count'], 0)

    def test_create_sensor_reading(self):
        """Test POST /api/sensors ingests a new sensor reading."""
        new_reading = {
            'location_id': 1,
            'sensor_type': 'rainfall',
            'value': 95.0,
            'unit': 'mm/h',
            'status': 'CRITICAL'
        }
        response = self.client.post('/api/sensors',
                                    data=json.dumps(new_reading),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])

    # -------------------------------------------------------------------------
    # 4. Risk Engine & Risk API Tests
    # -------------------------------------------------------------------------
    def test_get_location_risk(self):
        """Test GET /api/risk/<location_id> returns risk score, risk level, lead time."""
        response = self.client.get('/api/risk/1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        assessment = data['risk_assessment']
        self.assertIn('overall_score', assessment)
        self.assertIn('flash_flood_score', assessment)
        self.assertIn('landslide_score', assessment)
        self.assertIn('risk_level', assessment)
        self.assertIn('lead_time_minutes', assessment)
        self.assertIn('recommended_action', assessment)
        self.assertIn('contributing_factors', assessment)
        self.assertIn(assessment['risk_level'], ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'])

    def test_risk_engine_transparent_math(self):
        """Test transparent mathematical normalization and weighting in RiskEngine."""
        inputs = {
            'rainfall': 100.0,       # Cloudburst threshold -> 100
            'soil_moisture': 90.0,   # High saturation -> 90
            'river_level': 6.0,      # Danger mark -> 100
            'slope': 45.0,           # Max critical slope -> 100
            'flood_susceptibility': 1.0,
            'landslide_susceptibility': 1.0
        }
        res = RiskEngine.evaluate(inputs)
        # With extreme inputs, overall score must be CRITICAL (76-100)
        self.assertEqual(res['risk_level'], 'CRITICAL')
        self.assertGreaterEqual(res['overall_score'], 76.0)
        self.assertLessEqual(res['lead_time_minutes'], 45)

    def test_evaluate_custom_risk_post(self):
        """Test POST /api/risk/evaluate/<location_id> with simulated rainfall surge."""
        surge_payload = {
            'rainfall': 115.0,
            'soil_moisture': 95.0,
            'river_level': 6.5
        }
        response = self.client.post('/api/risk/evaluate/1',
                                    data=json.dumps(surge_payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        assessment = data['risk_assessment']
        self.assertEqual(assessment['risk_level'], 'CRITICAL')

if __name__ == '__main__':
    unittest.main()
