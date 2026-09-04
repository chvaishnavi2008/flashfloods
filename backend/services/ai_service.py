import os
import json
import urllib.request
import urllib.error
from config import Config

class AiIntelligenceService:
    """
    AI Risk Explanation & Decision Support Service.
    Produces grounded, factual disaster explanations strictly bounded
    by verified sensor telemetry (Rainfall rate, river capacity, soil moisture, slope).
    
    Supports Gemini API when GEMINI_API_KEY is configured;
    otherwise provides robust deterministic expert hydrological reasoning.
    """
    
    @classmethod
    def generate_explanation(cls, location_name, env_data, risk_data):
        """
        Generate grounded AI explanation for why the area is at risk and recommended action.
        """
        rainfall_rate = env_data.rainfall_rate
        river_cap = env_data.river_capacity_pct
        soil_sat = env_data.soil_saturation_pct
        slope_deg = env_data.slope_deg
        level = risk_data.get("overall_level", "LOW")
        score = risk_data.get("overall_score", 20.0)
        factors = risk_data.get("contributing_factors", [])
        
        # Check for Gemini API Key in config / env
        api_key = os.environ.get("GEMINI_API_KEY") or Config.GEMINI_API_KEY
        if api_key:
            try:
                ai_text = cls._call_gemini_api(api_key, location_name, rainfall_rate, river_cap, soil_sat, slope_deg, level, score, factors)
                if ai_text:
                    return ai_text
            except Exception as e:
                print(f"[AI Service] Gemini API call failed, falling back to expert rule engine: {e}")
                
        # Grounded Deterministic AI Reasoning Fallback
        return cls._generate_grounded_fallback(location_name, rainfall_rate, river_cap, soil_sat, slope_deg, level, score, factors)

    @classmethod
    def _generate_grounded_fallback(cls, location_name, rainfall_rate, river_cap, soil_sat, slope_deg, level, score, factors):
        if level in ["CRITICAL", "HIGH"]:
            primary_drivers = []
            if rainfall_rate >= 50.0:
                primary_drivers.append(f"torrential precipitation rates exceeding {rainfall_rate} mm/hr")
            elif rainfall_rate >= 25.0:
                primary_drivers.append(f"sustained intense rainfall at {rainfall_rate} mm/hr")
                
            if soil_sat >= 75.0:
                primary_drivers.append(f"near-complete soil moisture saturation ({soil_sat}%) eliminating rainwater infiltration")
                
            if river_cap >= 70.0:
                primary_drivers.append(f"river channels running at {river_cap}% of breach threshold")
                
            if slope_deg >= 28.0:
                primary_drivers.append(f"unfavorable slope geometry ({slope_deg}°) susceptible to hydro-mechanical shear failure")
                
            driver_str = ", ".join(primary_drivers) if primary_drivers else "coincident environmental stress thresholds"
            
            explanation = (
                f"In {location_name}, the elevated composite risk index ({score}/100 - {level}) is primarily driven by {driver_str}. "
                f"The combination of saturated upper soil layers and rapid catchment runoff significantly elevates the probability of rapid flash flooding along low-lying drainage channels and rotational slope failures on steep gradients."
            )
        elif level == "MODERATE":
            explanation = (
                f"Hydrological and geotechnical sensors in {location_name} detect moderate environmental stress ({score}/100). "
                f"Precipitation ({rainfall_rate} mm/hr) and soil moisture ({soil_sat}%) are currently within manageable runoff capacity, but sustained rainfall could trigger rapid escalation in vulnerable mountain corridors."
            )
        else:
            explanation = (
                f"Environmental telemetry in {location_name} indicates nominal baseline conditions ({score}/100 - {level}). "
                f"Rainfall ({rainfall_rate} mm/hr), river capacity ({river_cap}%), and slope stability are all currently stable. No active hazard escalation is detected."
            )
            
        return explanation

    @classmethod
    def _call_gemini_api(cls, api_key, location_name, rainfall_rate, river_cap, soil_sat, slope_deg, level, score, factors):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt = (
            f"You are the AI Risk Intelligence Engine for AapdaSetu multi-hazard early warning & emergency response system. "
            f"Write a concise 2-3 sentence grounded explanation for why {location_name} is currently at {level} risk (Score {score}/100). "
            f"Strictly use only these provided telemetry facts without inventing sensor numbers: "
            f"Rainfall: {rainfall_rate} mm/hr, River Gauge: {river_cap}% capacity, Soil Saturation: {soil_sat}%, Slope: {slope_deg} degrees. "
            f"Key factors: {', '.join(factors)}."
        )
        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            return res_json['candidates'][0]['content']['parts'][0]['text'].strip()
