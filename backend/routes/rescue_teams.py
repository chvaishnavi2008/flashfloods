from flask import Blueprint, jsonify, request
from datetime import datetime
from database import db
from models import Location

rescue_teams_bp = Blueprint('rescue_teams', __name__, url_prefix='/api')

# Initial in-memory / database seed for prototype rescue teams
DEFAULT_TEAMS = [
    {
        "id": "NDRF-01",
        "team_id": "NDRF-01",
        "name": "NDRF Team Alpha (11th Bn)",
        "team_type": "Flood & Aquatic Rescue",
        "members_count": 18,
        "contact_phone": "+91 94120-11001",
        "status": "EN_ROUTE",
        "base_station": "Rishikesh Staging Base",
        "latitude": 30.3800,
        "longitude": 79.2800,
        "assigned_location_id": 1,
        "destination_name": "Chamoli (Alaknanda Basin)",
        "mission_id": "MSN-2026-001",
        "mission_type": "Flood Rescue",
        "priority": "HIGH",
        "eta_minutes": 18,
        "distance_km": 8.4,
        "notes": "Deploying 4 Zodiac inflatable motorboats and swift-water sonar gear to floodplain sector.",
        "is_simulated": True,
        "last_updated": datetime.utcnow().isoformat(),
        "waypoints": [
            [30.3400, 79.2200],
            [30.3650, 79.2550],
            [30.3800, 79.2800],
            [30.4000, 79.3050],
            [30.4124, 79.3198]
        ],
        "current_waypoint_idx": 2
    },
    {
        "id": "SDRF-02",
        "team_id": "SDRF-02",
        "name": "SDRF Mountain Strike Bravo",
        "team_type": "Landslide Search & Rescue",
        "members_count": 14,
        "contact_phone": "+91 94120-11002",
        "status": "ON_SITE",
        "base_station": "Helang Forward Post",
        "latitude": 30.5539,
        "longitude": 79.5658,
        "assigned_location_id": 2,
        "destination_name": "Joshimath Sunil Ward",
        "mission_id": "MSN-2026-002",
        "mission_type": "Landslide Rescue",
        "priority": "CRITICAL",
        "eta_minutes": 0,
        "distance_km": 0.0,
        "notes": "Extricating residents from cracked residential masonry. Setting up slope perimeter safety lines.",
        "is_simulated": True,
        "last_updated": datetime.utcnow().isoformat(),
        "waypoints": [
            [30.5300, 79.5400],
            [30.5420, 79.5520],
            [30.5539, 79.5658]
        ],
        "current_waypoint_idx": 2
    },
    {
        "id": "ITBP-03",
        "team_id": "ITBP-03",
        "name": "ITBP Alpine Quick Response Charlie",
        "team_type": "Alpine Evacuation & High-Altitude Medical",
        "members_count": 16,
        "contact_phone": "+91 94120-11003",
        "status": "ASSIGNED",
        "base_station": "Guptkashi Mountain Depot",
        "latitude": 30.5200,
        "longitude": 79.0700,
        "assigned_location_id": 3,
        "destination_name": "Kedarnath Mandakini Corridor",
        "mission_id": "MSN-2026-003",
        "mission_type": "Evacuation",
        "priority": "CRITICAL",
        "eta_minutes": 35,
        "distance_km": 18.2,
        "notes": "Preparing high-altitude stretcher transit and oxygen supply lines for upper ridge.",
        "is_simulated": True,
        "last_updated": datetime.utcnow().isoformat(),
        "waypoints": [
            [30.5200, 79.0700],
            [30.5800, 79.0700],
            [30.6600, 79.0680],
            [30.7346, 79.0669]
        ],
        "current_waypoint_idx": 0
    },
    {
        "id": "NDRF-04",
        "team_id": "NDRF-04",
        "name": "NDRF Western Ghats Unit Delta",
        "team_type": "Heavy Debris & Canine USAR",
        "members_count": 22,
        "contact_phone": "+91 94120-11004",
        "status": "EN_ROUTE",
        "base_station": "Kalpetta Emergency Depot",
        "latitude": 11.5800,
        "longitude": 76.1000,
        "assigned_location_id": 22,
        "destination_name": "Wayanad (Meppadi / Chooralmala)",
        "mission_id": "MSN-2026-004",
        "mission_type": "Search & Rescue",
        "priority": "CRITICAL",
        "eta_minutes": 12,
        "distance_km": 4.5,
        "notes": "Equipped with ground penetrating radar (GPR) and victim location cameras for mudslide zone.",
        "is_simulated": True,
        "last_updated": datetime.utcnow().isoformat(),
        "waypoints": [
            [11.6050, 76.0800],
            [11.5800, 76.1000],
            [11.5650, 76.1150],
            [11.5534, 76.1264]
        ],
        "current_waypoint_idx": 1
    },
    {
        "id": "CDC-05",
        "team_id": "CDC-05",
        "name": "Civil Defence Corps Unit Echo",
        "team_type": "Logistics & Relief Supply Distribution",
        "members_count": 12,
        "contact_phone": "+91 94120-11005",
        "status": "AVAILABLE",
        "base_station": "Dehradun Central Store",
        "latitude": 30.3165,
        "longitude": 78.0322,
        "assigned_location_id": None,
        "destination_name": None,
        "mission_id": None,
        "mission_type": None,
        "priority": "LOW",
        "eta_minutes": 0,
        "distance_km": 0.0,
        "notes": "Ready with 500 ration packs, portable water purification units, and heavy tarpaulins.",
        "is_simulated": True,
        "last_updated": datetime.utcnow().isoformat(),
        "waypoints": [],
        "current_waypoint_idx": 0
    },
    {
        "id": "ARMY-06",
        "team_id": "ARMY-06",
        "name": "Indian Army Disaster Relief Column Foxtrot",
        "team_type": "Amphibious Riverine Evacuation",
        "members_count": 26,
        "contact_phone": "+91 94120-11006",
        "status": "AVAILABLE",
        "base_station": "Kullu Military Cantonment",
        "latitude": 31.9579,
        "longitude": 77.1095,
        "assigned_location_id": None,
        "destination_name": None,
        "mission_id": None,
        "mission_type": None,
        "priority": "LOW",
        "eta_minutes": 0,
        "distance_km": 0.0,
        "notes": "On standby with 3 BAUT boats, Bailey bridge components, and combat medical team.",
        "is_simulated": True,
        "last_updated": datetime.utcnow().isoformat(),
        "waypoints": [],
        "current_waypoint_idx": 0
    }
]

# In-memory storage for prototype session state
teams_cache = {t["id"]: dict(t) for t in DEFAULT_TEAMS}
missions_cache = {}

# Initialize missions from active teams
for t in DEFAULT_TEAMS:
    if t.get("mission_id"):
        missions_cache[t["mission_id"]] = {
            "id": t["mission_id"],
            "mission_id": t["mission_id"],
            "team_id": t["id"],
            "team_name": t["name"],
            "location_id": t["assigned_location_id"],
            "destination_name": t["destination_name"],
            "mission_type": t["mission_type"],
            "priority": t["priority"],
            "status": t["status"],
            "notes": t["notes"],
            "dispatched_at": datetime.utcnow().isoformat(),
            "completed_at": None
        }

@rescue_teams_bp.route('/rescue-teams', methods=['GET'])
def get_rescue_teams():
    """
    Returns all rescue teams with real-time (or simulated demo) status and coordinates.
    """
    return jsonify({
        "success": True,
        "total_teams": len(teams_cache),
        "teams": list(teams_cache.values()),
        "summary": {
            "active_teams": sum(1 for t in teams_cache.values() if t["status"] in ["ASSIGNED", "EN_ROUTE", "ON_SITE", "EMERGENCY"]),
            "en_route": sum(1 for t in teams_cache.values() if t["status"] == "EN_ROUTE"),
            "on_site": sum(1 for t in teams_cache.values() if t["status"] == "ON_SITE"),
            "available": sum(1 for t in teams_cache.values() if t["status"] == "AVAILABLE"),
            "completed": sum(1 for t in teams_cache.values() if t["status"] == "COMPLETED")
        },
        "mode": "DEMO_SIMULATED_GPS",
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@rescue_teams_bp.route('/rescue-teams/<team_id>', methods=['GET'])
def get_rescue_team(team_id):
    """
    Returns details for a single rescue team.
    """
    team = teams_cache.get(team_id)
    if not team:
        return jsonify({"success": False, "error": f"Rescue team '{team_id}' not found"}), 404
    return jsonify({"success": True, "team": team}), 200

@rescue_teams_bp.route('/rescue-teams/<team_id>/location', methods=['POST'])
def update_team_location(team_id):
    """
    Backend-ready endpoint for GPS updates (supports both hardware IoT ingest & simulation).
    Payload: { "latitude": float, "longitude": float, "status": str, "timestamp": str }
    """
    team = teams_cache.get(team_id)
    if not team:
        return jsonify({"success": False, "error": f"Rescue team '{team_id}' not found"}), 404
        
    data = request.get_json() or {}
    if "latitude" in data:
        team["latitude"] = float(data["latitude"])
    if "longitude" in data:
        team["longitude"] = float(data["longitude"])
    if "status" in data:
        team["status"] = data["status"]
    if "eta_minutes" in data:
        team["eta_minutes"] = int(data["eta_minutes"])
    if "distance_km" in data:
        team["distance_km"] = float(data["distance_km"])
        
    team["last_updated"] = data.get("timestamp", datetime.utcnow().isoformat())
    return jsonify({"success": True, "team": team, "message": "Location updated successfully"}), 200

@rescue_teams_bp.route('/rescue-missions', methods=['GET'])
def get_rescue_missions():
    """
    Lists all rescue missions and status.
    """
    return jsonify({
        "success": True,
        "total_missions": len(missions_cache),
        "missions": list(missions_cache.values())
    }), 200

@rescue_teams_bp.route('/rescue-missions', methods=['POST'])
def create_rescue_mission():
    """
    Creates and dispatches a new rescue mission to a team.
    """
    data = request.get_json() or {}
    team_id = data.get("team_id")
    destination_name = data.get("destination_name", "Designated Sector")
    location_id = data.get("location_id")
    mission_type = data.get("mission_type", "Flood Rescue")
    priority = data.get("priority", "HIGH")
    notes = data.get("notes", "")

    if not team_id or team_id not in teams_cache:
        return jsonify({"success": False, "error": "Valid team_id is required"}), 400

    mission_id = f"MSN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    team = teams_cache[team_id]
    
    # Update team state
    team["status"] = "ASSIGNED"
    team["mission_id"] = mission_id
    team["mission_type"] = mission_type
    team["priority"] = priority
    team["destination_name"] = destination_name
    team["assigned_location_id"] = location_id
    team["notes"] = notes
    team["eta_minutes"] = data.get("eta_minutes", 30)
    team["distance_km"] = data.get("distance_km", 12.0)
    team["last_updated"] = datetime.utcnow().isoformat()

    # Create mission record
    mission = {
        "id": mission_id,
        "mission_id": mission_id,
        "team_id": team_id,
        "team_name": team["name"],
        "location_id": location_id,
        "destination_name": destination_name,
        "mission_type": mission_type,
        "priority": priority,
        "status": "ASSIGNED",
        "notes": notes,
        "dispatched_at": datetime.utcnow().isoformat(),
        "completed_at": None
    }
    missions_cache[mission_id] = mission

    return jsonify({
        "success": True,
        "mission": mission,
        "team": team,
        "message": f"Rescue Team {team['name']} successfully dispatched to {destination_name}."
    }), 201

@rescue_teams_bp.route('/rescue-missions/<mission_id>', methods=['PATCH'])
def update_rescue_mission(mission_id):
    """
    Updates the lifecycle status of a rescue mission (e.g. ASSIGNED -> EN_ROUTE -> ON_SITE -> COMPLETED).
    """
    mission = missions_cache.get(mission_id)
    if not mission:
        return jsonify({"success": False, "error": f"Mission '{mission_id}' not found"}), 404
        
    data = request.get_json() or {}
    new_status = data.get("status")
    
    if new_status:
        mission["status"] = new_status
        # Update associated team
        team_id = mission.get("team_id")
        if team_id and team_id in teams_cache:
            team = teams_cache[team_id]
            team["status"] = new_status
            team["last_updated"] = datetime.utcnow().isoformat()
            if new_status == "COMPLETED":
                mission["completed_at"] = datetime.utcnow().isoformat()
                team["status"] = "COMPLETED"
                team["eta_minutes"] = 0
                team["distance_km"] = 0.0

    return jsonify({"success": True, "mission": mission}), 200
