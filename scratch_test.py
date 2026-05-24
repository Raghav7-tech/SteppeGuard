import requests
import json

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB-sWnxVoZ3vLSQrrOgV71bSmuGC3ixNFU"
data = {
    "contents": [{"role": "user", "parts": [{"text": "Hello"}]}]
}
headers = {"Content-Type": "application/json"}

try:
    r = requests.post(url, headers=headers, json=data)
    r.raise_for_status()
    print("SUCCESS")
    print(r.json())
except Exception as e:
    print("FAILED")
    print(str(e))
    if hasattr(e, 'response') and e.response is not None:
        print(e.response.text)
