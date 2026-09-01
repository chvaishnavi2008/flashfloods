from flask import Blueprint, jsonify, request
from models import Location, EnvironmentalData, RiskAssessment, Alert
from services.simulation_engine import SimulationEngine
from database import db

simulate_bp = Blueprint('simulate', __name__)

@simulate_bp.route('/api/simulation/status', methods=['GET'])
def get_simulation_status():
    """
    Returns the current simulation metadata, timeline step (T0, T+1, T+2),
    and list of reproducible SIH demonstration scenarios.
    """
    return jsonify({
        "success": True,
        "data": SimulationEngine.get_simulation_status()
    }), 200

@simulate_bp.route('/api/simulation/timeline', methods=['POST'])
def apply_timeline_step():
    """
    Advances or sets the simulation timeline step:
    POST /api/simulation/timeline
    {
      "step": "T0" | "T+1" | "T+2",
      "location_id": Optional[int]
    }
    """
    data = request.get_json() or {}
    step = data.get('step', 'T0')
    location_id = data.get('location_id')
    
    result = SimulationEngine.apply_timeline_step(step, location_id)
    return jsonify(result), 200

@simulate_bp.route('/api/simulation/scenario', methods=['POST'])
def apply_simulation_scenario():
    """
    Applies a pre-configured, reproducible multi-hazard scenario:
    POST /api/simulation/scenario
    {
      "scenario": "flash_flood_himalayas" | "landslide_western_ghats" | "extreme_rainfall_meghalaya" | "riverine_brahmaputra_kosi" | "glof_teesta_surge" | "reset_nominal"
    }
    """
    data = request.get_json() or {}
    scenario_id = data.get('scenario', 'flash_flood_himalayas')
    
    result = SimulationEngine.apply_scenario(scenario_id)
    return jsonify(result), 200

@simulate_bp.route('/api/simulate', methods=['POST'])
def simulate_event():
    """
    Backwards-compatible simulation endpoint.
    Accepts scenario name or timeline step.
    """
    data = request.get_json() or {}
    step = data.get('step')
    scenario = data.get('scenario')
    location_id = data.get('location_id')
    
    if step:
        result = SimulationEngine.apply_timeline_step(step, location_id)
        return jsonify(result), 200
        
    scenario_map = {
        'reset': 'reset_nominal',
        'flash_flood': 'flash_flood_himalayas',
        'landslide': 'landslide_western_ghats',
        'heavy_rainfall': 'extreme_rainfall_meghalaya',
        'cloudburst': 'extreme_rainfall_meghalaya',
        'flood': 'riverine_brahmaputra_kosi',
        'glof': 'glof_teesta_surge',
        'combined_emergency': 'flash_flood_himalayas',
        'multi_hazard': 'flash_flood_himalayas'
    }
    
    mapped_scenario = scenario_map.get(scenario, scenario or 'flash_flood_himalayas')
    result = SimulationEngine.apply_scenario(mapped_scenario)
    return jsonify(result), 200
