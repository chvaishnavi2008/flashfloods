from typing import Dict, Any, List, Optional
from models import SafeLocation

class ActionRecommendationEngine:
    """
    =============================================================================
    PralayWatch - Stage 6: Action Recommendation Engine
    =============================================================================
    
    Generates context-aware, actionable life-safety recommendations answering:
    "What should people do RIGHT NOW?"
    
    Considers:
    - Dominant hazard type (Flash Flood, Landslide, Extreme Rainfall, River Flood, GLOF)
    - Risk level (CRITICAL, HIGH, MODERATE, LOW) & score
    - Geographic location & terrain orientation
    - Estimated impact intelligence (demographics, damaged roads/bridges)
    - Nearest verified safe shelter (with explicit 'Demo Safe Location' / 'Simulated Route' labels)
    """
    
    @classmethod
    def generate_recommendations(
        cls,
        dominant_hazard: str,
        overall_score: float,
        overall_level: str,
        location: Any,
        impact_assessment: Dict[str, Any] = None,
        safe_locations: List[Any] = None
    ) -> Dict[str, Any]:
        loc_name = getattr(location, 'name', 'Sector Zone')
        terrain = getattr(location, 'terrain_type', 'Mountainous / Valley')
        state = getattr(location, 'state', 'India')
        
        hazard_lower = str(dominant_hazard).lower().replace(' ', '_')
        
        # 1. Determine Nearest Safe Shelter & Simulated Route
        nearest_shelter_dict = None
        if safe_locations and len(safe_locations) > 0:
            s0 = safe_locations[0]
            nearest_shelter_dict = {
                "name": getattr(s0, 'name', f"{loc_name} Primary Safe Shelter"),
                "label": "Demo Safe Location",
                "distance_km": getattr(s0, 'distance_km', 1.5),
                "est_walking_mins": getattr(s0, 'est_walking_mins', 20),
                "capacity": getattr(s0, 'capacity', 800),
                "available_space": max(0, getattr(s0, 'capacity', 800) - getattr(s0, 'current_occupancy', 100)),
                "facilities": getattr(s0, 'facilities', 'Medical Aid, Generators, Purified Water, Food Rations'),
                "contact_phone": getattr(s0, 'contact_phone', '+91 1800-180-1104'),
                "directions": getattr(s0, 'safe_route_instructions', f"Follow upper contour ridge road ascending away from low-lying areas in {loc_name}.")
            }
        else:
            nearest_shelter_dict = {
                "name": f"{loc_name} High-Ground Municipal Disaster Shelter",
                "label": "Demo Safe Location",
                "distance_km": 1.4,
                "est_walking_mins": 18,
                "capacity": 850,
                "available_space": 730,
                "facilities": "Medical Aid, High-Output Generators, Dry Rations, Purified Water",
                "contact_phone": "+91 1800-180-1104",
                "directions": f"Ascend to upper arterial ridge road in {loc_name}. Avoid valley floor and riverbanks."
            }

        # 2. Suggested Safe Direction
        if "landslide" in hazard_lower:
            safe_direction = {
                "heading": "Move away from slope base toward stable ridge plateau",
                "elevation_target": "Stable bedrock ridge / Structural evacuation center",
                "instructions": f"Follow ridge path ascending away from unstable cut-slopes in {loc_name}. Do not stop beneath overhangs.",
                "route_label": "Simulated Route"
            }
        elif "rainfall" in hazard_lower:
            safe_direction = {
                "heading": "Remain inside sturdy masonry structures away from perimeter glass",
                "elevation_target": "Upper floors of structural multi-story building",
                "instructions": "Avoid all non-essential road travel. Stay sheltered until precipitation rate subsides.",
                "route_label": "Simulated Route"
            }
        else: # Flash flood / flood / GLOF
            safe_direction = {
                "heading": "Ascend North-East along upper contour ridge road",
                "elevation_target": "+50 to +100 meters above river catchment floor",
                "instructions": f"Move directly uphill away from {loc_name} river tributary. Use primary arterial bypass on high ground.",
                "route_label": "Simulated Route"
            }

        # 3. Hazard-Specific Immediate Actions & Danger Zones
        if "landslide" in hazard_lower:
            if overall_level == "CRITICAL":
                immediate_actions = [
                    "Move away from steep slopes and cut-slope perimeters immediately",
                    "Avoid mountain highway travel, steep road cuttings, and bridges under cliffs",
                    "Watch and listen for ground cracking, falling pebbles, tilting trees, or sudden muddy runoff",
                    "Follow official SDMA/SDRF evacuation orders and move to designated structural shelters",
                    "Check on vulnerable neighbors (elderly/children) before moving to safe ground"
                ]
                areas_to_avoid = [
                    f"Hillside dwellings and roads directly beneath steep slopes (>30°) in {loc_name}",
                    "Drainage gullies and channels carrying sudden muddy debris water",
                    "Cracked road stretches or retaining walls showing structural deformation"
                ]
                urgency_badge = "IMMEDIATE EVACUATION FROM SLOPES"
            elif overall_level == "HIGH":
                immediate_actions = [
                    "Stay alert for signs of slope movement or retention wall bulging",
                    "Avoid unpaved hillside roads and stay off mountain highway passes",
                    "Prepare emergency essentials (medicines, documents, torch, battery bank)",
                    "Verify nearest high-ground refuge and keep family members together"
                ]
                areas_to_avoid = [
                    "Steep hillsides and loose soil embankments",
                    "Basements and ground-floor rooms facing mountain slopes"
                ]
                urgency_badge = "HIGH ALERT — PREPARE FOR EVACUATION"
            else:
                immediate_actions = [
                    "Monitor hillside stability updates from district disaster management",
                    "Inspect perimeter retaining walls and clear hillside drainage gutters"
                ]
                areas_to_avoid = ["Unstable terrain edges during heavy rain"]
                urgency_badge = "MODERATE WATCH — MONITOR SLOPES"

        elif "rainfall" in hazard_lower or "heavy_rainfall" in hazard_lower or "extreme_rainfall" in hazard_lower:
            if overall_level in ["CRITICAL", "HIGH"]:
                immediate_actions = [
                    "Avoid all non-essential travel during torrential cloudburst downpours",
                    "Stay indoors in structurally sound buildings away from glass windows",
                    "Avoid low-lying areas, underground parking lots, and road underpasses",
                    "Monitor official IMD Doppler radar nowcasts and SDMA weather alerts",
                    "Keep communication devices fully charged and emergency lights ready"
                ]
                areas_to_avoid = [
                    f"Low-lying road underpasses and waterlogged intersections in {loc_name}",
                    "Open fields, electrical poles, and tall trees during lightning storms",
                    "Basements susceptible to rapid storm drain overflow"
                ]
                urgency_badge = "TORRENTIAL CLOUDBURST — STAY INDOORS"
            else:
                immediate_actions = [
                    "Carry rain gear and exercise caution during commute",
                    "Inspect rooftop and driveway drainage for obstructions",
                    "Check local weather forecast updates"
                ]
                areas_to_avoid = ["Known waterlogged low spots"]
                urgency_badge = "WEATHER ADVISORY"

        else: # Default: Flash Flood / Riverine Flood / GLOF
            if overall_level == "CRITICAL":
                immediate_actions = [
                    "Move to higher ground immediately — every minute counts",
                    "Avoid rivers, stream banks, drainage channels, and low-lying valleys",
                    "Do NOT attempt to cross flooded roads, bridges, or culverts on foot or in vehicles",
                    "Follow official SEOC/SDMA evacuation instructions and move toward designated safe shelters",
                    "Shut off main domestic electricity and gas valves before leaving home"
                ]
                areas_to_avoid = [
                    f"Lower riverbank paths and floodplain settlement roads in {loc_name}",
                    "Bridges with high water flow or accumulated debris",
                    "Basements, underground parking structures, and drainage underpasses",
                    "Riverside agricultural parcels and low bridges"
                ]
                urgency_badge = "IMMEDIATE EVACUATION TO HIGH GROUND"
            elif overall_level == "HIGH":
                immediate_actions = [
                    "Prepare emergency go-bags (water, non-perishable food, torch, first aid, ID)",
                    "Identify your nearest safe shelter and verify non-flooded upper road route",
                    "Avoid parking vehicles near drainage culverts or riverbanks",
                    "Keep mobile phones charged and monitor live CWC / SDMA hydro-gauge broadcasts"
                ]
                areas_to_avoid = [
                    "Riverfront ghats, streams, and low-elevation culverts",
                    "Underground parking garages and basements"
                ]
                urgency_badge = "HIGH ALERT — PREPARE EVACUATION ROUTE"
            else:
                immediate_actions = [
                    "Inspect local perimeter stormwater drainage around residence",
                    "Stay alert to upstream cloudburst reports in surrounding hills",
                    "Maintain situational awareness via official weather updates"
                ]
                areas_to_avoid = ["Low-lying riverbeds and drainage ditches"]
                urgency_badge = "ADVISORY WATCH"

        # 4. Return Standardized Action Object
        return {
            "title": "WHAT SHOULD I DO RIGHT NOW?",
            "headline": f"Immediate Action Guidance for {loc_name}",
            "dominant_hazard": dominant_hazard,
            "risk_level": overall_level,
            "risk_score": round(overall_score, 1),
            "urgency_badge": urgency_badge,
            "is_emergency": overall_level in ["CRITICAL", "HIGH"],
            
            # 1. Immediate Actions
            "immediate_actions": immediate_actions,
            
            # 2. Places to Avoid
            "places_to_avoid": areas_to_avoid,
            "areas_to_avoid": areas_to_avoid,
            
            # 3. Suggested Safe Direction
            "suggested_safe_direction": safe_direction,
            
            # 4. Nearest Safe Shelter (with explicit Demo Label)
            "nearest_safe_location": nearest_shelter_dict,
            
            # 5. Emergency Information & Helplines
            "emergency_information": {
                "helpline_toll_free": "112 / 1070 (SDMA 24/7 National Emergency)",
                "state_disaster_helpline": "1070",
                "national_emergency_rescue": "112",
                "ambulance_trauma": "108",
                "ndrf_control_room": "011-24363260",
                "radio_frequency": "All India Radio (AIR) 102.4 MHz Emergency Broadcast"
            },
            
            # Transparency Label
            "prototype_notice": "Action instructions are prototype-generated life-safety directives. In an actual event, always adhere strictly to live SDMA / NDRF emergency broadcast orders."
        }
