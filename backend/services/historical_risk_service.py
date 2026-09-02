import os
import json
import math

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class HistoricalRiskService:
    """
    Historical Flood and Landslide Susceptibility Service.
    Sourced from India Flood Inventory (IFI-Impacts 1967-2023) and ISRO Landslide Atlas.
    """
    _flood_data = None
    _landslide_data = None

    @classmethod
    def _load_data(cls):
        if cls._flood_data is None:
            flood_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'historical_flood_data.json')
            if os.path.exists(flood_path):
                with open(flood_path, 'r', encoding='utf-8') as f:
                    cls._flood_data = json.load(f)
            else:
                cls._flood_data = {"records": []}

        if cls._landslide_data is None:
            ls_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'historical_landslide_data.json')
            if os.path.exists(ls_path):
                with open(ls_path, 'r', encoding='utf-8') as f:
                    cls._landslide_data = json.load(f)
            else:
                cls._landslide_data = {"records": []}

    @classmethod
    def evaluate_historical_risk(cls, lat: float, lng: float, location_name: str = "") -> dict:
        cls._load_data()
        
        # 1. Flood search
        flood_records = cls._flood_data.get('records', [])
        matched_flood = None
        min_flood_dist = float('inf')

        for rec in flood_records:
            dist = haversine_distance_km(lat, lng, rec.get('lat', 0), rec.get('lng', 0))
            name_match = location_name and (
                rec.get('district', '').lower() in location_name.lower() or
                location_name.lower() in rec.get('district', '').lower()
            )
            if name_match or dist < min_flood_dist:
                if dist < min_flood_dist:
                    min_flood_dist = dist
                    matched_flood = rec

        flood_events = 0
        flood_exposure = "LOW"
        flood_score = 15.0

        if matched_flood and min_flood_dist <= 85.0:
            flood_events = matched_flood.get('total_historical_events', len(matched_flood.get('events', [])))
            flood_exposure = matched_flood.get('flood_exposure_tier', 'MODERATE')
            flood_score = matched_flood.get('exposure_score', 65.0)

        # 2. Landslide search
        ls_records = cls._landslide_data.get('records', [])
        matched_ls = None
        min_ls_dist = float('inf')

        for rec in ls_records:
            dist = haversine_distance_km(lat, lng, rec.get('lat', 0), rec.get('lng', 0))
            name_match = location_name and (
                rec.get('district', '').lower() in location_name.lower() or
                location_name.lower() in rec.get('district', '').lower()
            )
            if name_match or dist < min_ls_dist:
                if dist < min_ls_dist:
                    min_ls_dist = dist
                    matched_ls = rec

        ls_events = 0
        ls_susceptibility = "LOW"
        ls_score = 15.0
        ls_rank = None

        if matched_ls and min_ls_dist <= 85.0:
            ls_events = matched_ls.get('recorded_landslides_count', 0)
            ls_susceptibility = matched_ls.get('susceptibility_tier', 'HIGH')
            ls_score = matched_ls.get('susceptibility_score', 75.0)
            ls_rank = matched_ls.get('national_landslide_rank')

        return {
            "historical_flood": {
                "events_nearby": flood_events,
                "exposure": flood_exposure,
                "score": flood_score,
                "source": "India Flood Inventory (IFI-Impacts 1967–2023)"
            },
            "historical_landslide": {
                "landslides_nearby": ls_events,
                "susceptibility": ls_susceptibility,
                "score": ls_score,
                "national_rank": ls_rank,
                "source": "ISRO / NRSC Landslide Atlas of India"
            },
            "nature_of_data": "HISTORICAL_SUSCEPTIBILITY",
            "disclaimer": "Historical occurrence provides empirical baseline susceptibility and does NOT indicate that an active disaster is currently in progress."
        }
