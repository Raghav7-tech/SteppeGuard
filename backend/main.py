from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
import random
import os
import requests
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SteppeGuard API", version="1.0.0")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/observations")
def get_observations(response: Response = None, district_id: str = None, limit: int = 50, since_hours: int = 24):
    if response:
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if supabase_url and supabase_key:
        try:
            from supabase import create_client
            from datetime import timedelta
            supabase = create_client(supabase_url, supabase_key)
            time_threshold = (datetime.utcnow() - timedelta(hours=since_hours)).isoformat()
            
            query = supabase.table('observations').select('*').gte('observed_at', time_threshold)
            if district_id:
                query = query.eq('district_id', district_id)
            res = query.limit(limit).execute()
            
            if res.data:
                return {
                    "observations": res.data,
                    "total": len(res.data),
                    "generated_at": datetime.utcnow().isoformat() + "Z",
                    "source": "Supabase"
                }
        except Exception as e:
            print(f"Error fetching observations from Supabase: {e}")

    # Fallback dynamic mock if Supabase is unavailable
    random.seed(datetime.utcnow().hour)
    obs1_fires = random.randint(5, 25)
    obs2_fires = random.randint(1, 10)
    
    return {
        "observations": [
            {
                "id": str(uuid.uuid4()),
                "district_id": "b0e42d71-55e1-4c12-9c44-59e51c88820c",
                "district_name": "Kostanay",
                "observed_at": datetime.utcnow().isoformat() + "Z",
                "fusion_score": round(random.uniform(70.0, 95.0), 1),
                "risk_level": "CRITICAL",
                "ndvi_mean": 0.12,
                "dnbr_mean": 0.35,
                "bai_max": 1450.5,
                "sar_change_mean": 0.28,
                "active_fire_points": obs1_fires,
                "lat": 53.21,
                "lng": 63.63
            },
            {
                "id": str(uuid.uuid4()),
                "district_id": "c1f53e82-66f2-5d23-0d55-60f62d99931d",
                "district_name": "Akmola",
                "observed_at": datetime.utcnow().isoformat() + "Z",
                "fusion_score": round(random.uniform(50.0, 75.0), 1),
                "risk_level": "HIGH" if random.random() > 0.5 else "MODERATE",
                "ndvi_mean": 0.18,
                "dnbr_mean": 0.21,
                "bai_max": 900.0,
                "sar_change_mean": 0.15,
                "active_fire_points": obs2_fires,
                "lat": 51.18,
                "lng": 71.44
            }
        ],
        "total": 2,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "source": "Mock (Dynamic)"
    }

@app.get("/api/predictions")
def get_predictions(district_id: str = None, horizon: int = 48):
    seed = sum(ord(c) for c in (district_id or "default"))
    random.seed(seed)
    
    base_prob = random.uniform(10, 30)
    timeline = [
        {"time": "Now", "prob": int(base_prob)},
        {"time": "+12h", "prob": int(min(100, base_prob + random.uniform(10, 25)))},
        {"time": "+24h", "prob": int(min(100, base_prob + random.uniform(30, 50)))},
        {"time": "+48h", "prob": int(min(100, base_prob + random.uniform(50, 70)))}
    ]
    prob_48 = timeline[-1]["prob"] / 100.0

    return {
        "predictions": [
            {
                "district_id": district_id,
                "district_name": "Dynamic",
                "horizon_hours": horizon,
                "spread_probability": prob_48,
                "risk_level": "CRITICAL" if prob_48 > 0.8 else "HIGH" if prob_48 > 0.5 else "MODERATE",
                "predicted_area_ha": int(random.uniform(500, 5000)),
                "confidence_score": random.uniform(0.7, 0.95),
                "wind_speed_ms": round(random.uniform(5.0, 20.0), 1),
                "wind_dir_deg": random.randint(0, 359),
                "predicted_at": datetime.utcnow().isoformat() + "Z",
                "timeline": timeline
            }
        ]
    }

@app.get("/api/weather/{district_id}")
def get_weather(district_id: str):
    # Try to find the district's lat/lng from our observations
    obs_data = get_observations()
    lat, lng = 51.18, 71.44 # Default to Astana
    for obs in obs_data.get("observations", []):
        if obs.get("district_id") == district_id:
            lat = obs.get("lat", lat)
            lng = obs.get("lng", lng)
            break

    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,wind_speed_10m&forecast_days=2"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        current = data.get("current", {})
        hourly = data.get("hourly", {})
        
        forecast = []
        if hourly:
            temps = hourly.get("temperature_2m", [])
            winds = hourly.get("wind_speed_10m", [])
            for i in range(min(48, len(temps))):
                forecast.append({
                    "hour": i,
                    "temp": temps[i],
                    "wind": winds[i]
                })

        return {
            "wind_speed_ms": current.get("wind_speed_10m", 0),
            "wind_dir_deg": current.get("wind_direction_10m", 0),
            "temperature_c": current.get("temperature_2m", 0),
            "humidity_pct": current.get("relative_humidity_2m", 0),
            "forecast_48h": forecast
        }
    except Exception as e:
        print(f"Error fetching weather from Open-Meteo: {e}")
        # Deterministic mock fallback
        seed = sum(ord(c) for c in district_id)
        random.seed(seed)
        temp = round(random.uniform(20.0, 38.0), 1)
        wind = round(random.uniform(2.0, 25.0), 1)
        humidity = round(random.uniform(10.0, 60.0), 1)
        return {
            "wind_speed_ms": wind,
            "wind_dir_deg": random.randint(0, 359),
            "temperature_c": temp,
            "humidity_pct": humidity,
            "forecast_48h": [
                {"hour": i, "temp": temp - (i % 5), "wind": wind + (i % 3)} for i in range(48)
            ]
        }

@app.get("/api/officials/{district_id}")
def get_officials(district_id: str):
    seed = sum(ord(c) for c in (district_id or "default"))
    random.seed(seed)
    return {
        "officials": [
            {
                "id": f"{district_id}_1",
                "name": f"Fire Station Alpha {district_id[:4]}",
                "type": "Fire Station",
                "distance_km": round(random.uniform(2.0, 30.0), 1),
                "response_time_mins": int(random.uniform(5, 45)),
                "contact": f"+7 (7142) {random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}",
                "personnel_available": int(random.uniform(10, 50)),
                "equipment": ["Fire Engine", "Water Tanker"]
            },
            {
                "id": f"{district_id}_2",
                "name": f"Mobile Response {district_id[-4:]}",
                "type": "Mobile Response Team",
                "distance_km": round(random.uniform(5.0, 50.0), 1),
                "response_time_mins": int(random.uniform(10, 60)),
                "contact": f"+7 (7142) {random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}",
                "personnel_available": int(random.uniform(5, 20)),
                "equipment": ["Fast Response Vehicle"]
            }
        ]
    }

@app.get("/api/fires")
def get_active_fires(response: Response = None, confidence: str = "nominal", timeframe_hours: int = 24):
    if response:
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    # Kazakhstan BBOX: [46.0, 40.0, 88.0, 56.0] (W, S, E, N)
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    firms_key = os.getenv("FIRMS_API_KEY")

    fires = []
    
    try:
        # If FIRMS key exists, try to fetch from NASA FIRMS
        if firms_key:
            # Source: VIIRS_SNPP_NRT, area: 46,40,88,56, days: 3
            days = min(10, max(1, timeframe_hours // 24))
            url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{firms_key}/VIIRS_SNPP_NRT/46,40,88,56/{days}"
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                lines = resp.text.strip().split('\n')
                if len(lines) > 1:
                    headers = lines[0].split(',')
                    for idx, line in enumerate(lines[1:]):
                        cols = line.split(',')
                        if len(cols) > 2:
                            lat = float(cols[0])
                            lng = float(cols[1])
                            conf = cols[8] if len(cols) > 8 else 'n'
                            # Loosen confidence to include nominal
                            if confidence == 'nominal' and conf in ['n', 'h', 'l', 'nominal', 'high']:
                                fires.append({
                                    "id": f"firms_{idx}",
                                    "lat": lat,
                                    "lng": lng,
                                    "intensity": 0.8
                                })
                if fires:
                    return {"fires": fires, "source": "NASA FIRMS", "count": len(fires)}
            else:
                print(f"Error fetching from NASA FIRMS: Status {resp.status_code}, Response: {resp.text}")

        # If Supabase is configured
        if supabase_url and supabase_key:
            supabase = create_client(supabase_url, supabase_key)
            from datetime import timedelta
            time_threshold = (datetime.utcnow() - timedelta(hours=timeframe_hours)).isoformat()
            res = supabase.table('observations').select('lat,lng,id,risk_level').gte('observed_at', time_threshold).execute()
            if res.data:
                for idx, obs in enumerate(res.data):
                    fires.append({
                        "id": f"supa_{idx}",
                        "lat": obs.get('lat'),
                        "lng": obs.get('lng'),
                        "intensity": 1.0 if obs.get('risk_level') == 'CRITICAL' else 0.5
                    })
                if fires:
                    return {"fires": fires, "source": "Supabase", "count": len(fires)}
                
    except Exception as e:
        print(f"Error fetching real fire data: {e}")

    # Fallback to a realistic mock across Kazakhstan BBOX (40N-56N, 46E-88E)
    # Generate ~150 fires to simulate a realistic count across the country
    random.seed(datetime.utcnow().hour) # Change hourly
    for i in range(150):
        lat = random.uniform(41.0, 55.0)
        lng = random.uniform(47.0, 87.0)
        fires.append({
            "id": f"mock_{i}",
            "lat": lat,
            "lng": lng,
            "intensity": random.uniform(0.3, 1.0)
        })
        
    return {"fires": fires, "source": "Mock (Fallback)", "count": len(fires)}

@app.get("/api/wind_grid")
def get_wind_grid():
    # Grid covering Kazakhstan bounding box (approx 40N-56N, 46E-88E)
    # Using a 6x8 grid to keep the request size reasonable for Open-Meteo
    lats = []
    lngs = []
    for lat in range(41, 56, 3):
        for lng in range(47, 88, 5):
            lats.append(str(lat))
            lngs.append(str(lng))
            
    lat_str = ",".join(lats)
    lng_str = ",".join(lngs)
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat_str}&longitude={lng_str}&current=wind_speed_10m,wind_direction_10m"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        grid = []
        # If multiple coordinates were requested, response is an array of objects
        if isinstance(data, list):
            for i, loc_data in enumerate(data):
                current = loc_data.get("current", {})
                grid.append({
                    "lat": float(lats[i]),
                    "lng": float(lngs[i]),
                    "wind_speed": current.get("wind_speed_10m", 0),
                    "wind_dir": current.get("wind_direction_10m", 0)
                })
        else:
            # Fallback if API behaves differently
            pass
            
        return {"grid": grid}
    except Exception as e:
        # Fallback to mock data if API fails
        grid = []
        for i in range(len(lats)):
            grid.append({
                "lat": float(lats[i]),
                "lng": float(lngs[i]),
                "wind_speed": random.uniform(2.0, 15.0),
                "wind_dir": random.uniform(0, 360)
            })
        return {"grid": grid, "error": str(e), "mock": True}

@app.get("/api/factors/{district_id}")
def get_factors(district_id: str):
    # Mock data for Fire Eruption Factors
    seed = sum(ord(c) for c in (district_id or "default"))
    random.seed(seed)
    
    factors = [
        {"name": "Agricultural Burning Activity", "probability": random.uniform(0.1, 0.9), "severity": random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"])},
        {"name": "Dry Thunderstorm (Lightning)", "probability": random.uniform(0.05, 0.6), "severity": random.choice(["LOW", "MEDIUM", "HIGH"])},
        {"name": "Human Activity / Campfires", "probability": random.uniform(0.2, 0.85), "severity": random.choice(["MEDIUM", "HIGH", "CRITICAL"])},
        {"name": "Industrial Heat Anomalies", "probability": random.uniform(0.01, 0.4), "severity": random.choice(["LOW", "MEDIUM"])},
        {"name": "Power Line Fault Risk", "probability": random.uniform(0.05, 0.3), "severity": random.choice(["LOW", "MEDIUM"])}
    ]
    
    # Sort by probability
    factors.sort(key=lambda x: x["probability"], reverse=True)
    
    return {"factors": factors[:3]}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: str = "English"

import json
from supabase import create_client

@app.post("/api/chat")
def chat_with_gemini(req: ChatRequest):
    # Fetch from Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    context_data = {}
    if supabase_url and supabase_key:
        try:
            supabase = create_client(supabase_url, supabase_key)
            obs_res = supabase.table('observations').select('*').execute()
            pred_res = supabase.table('predictions').select('*').execute()
            context_data = {
                "observations": obs_res.data,
                "predictions": pred_res.data
            }
        except Exception as e:
            print(f"Error fetching from Supabase for chat: {e}")
            # Fallback to mock data if connection fails
            context_data = {
                "observations": get_observations().get("observations"),
                "predictions": get_predictions().get("predictions")
            }
    else:
        # Fallback to mock data if credentials are not provided
        context_data = {
            "observations": get_observations().get("observations"),
            "predictions": get_predictions().get("predictions")
        }

    system_prompt = f"You are SteppeGuard AI, an expert at predicting wildfires in Kazakhstan. Use this live DB context to answer questions:\n{json.dumps(context_data)}\n\nCRITICAL INSTRUCTION: The user has selected '{req.language}' as their preferred language. You MUST respond entirely and fluently in {req.language}. Do not use any other language."
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback mock if no API key
        user_msg = req.messages[-1].content.lower()
        if "kostanay" in user_msg:
            resp = "Kostanay is scoring 85.2 (CRITICAL) because it has 12 active fire points and a high dNBR mean of 0.35, indicating severe ongoing burns."
        elif "wind speed doubled" in user_msg:
            resp = "If wind speed doubles, the 48-hour spread probability for Kostanay could exceed 95%, threatening surrounding districts."
        elif "most at risk" in user_msg:
            resp = "Kostanay is currently the most at-risk district with a Fusion Score of 85.2."
        else:
            resp = "I am a SteppeGuard AI assistant. I'm currently running in mock mode because the GEMINI_API_KEY is not set. Please provide a key for real answers."
        return {"response": resp}
        
    # Call Gemini API
    headers = {
        "Content-Type": "application/json"
    }
    
    gemini_messages = []
    for m in req.messages:
        role = "model" if m.role == "assistant" else "user"
        gemini_messages.append({
            "role": role,
            "parts": [{"text": m.content}]
        })
    
    data = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": gemini_messages
    }
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        r = requests.post(url, headers=headers, json=data)
        r.raise_for_status()
        result = r.json()
        
        # Extract response text
        response_text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response generated.")
        return {"response": response_text}
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            err_msg += f" - {e.response.text}"
        return {"response": f"Error communicating with Gemini API: {err_msg}"}
