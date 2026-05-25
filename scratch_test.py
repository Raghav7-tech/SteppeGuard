import requests

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB-sWnxVoZ3vLSQrrOgV71bSmuGC3ixNFU "
payload = {
    "contents": [{"role": "user", "parts": [{"text": "Hello"}]}]
}
res = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
print(res.status_code)
print(res.json())
