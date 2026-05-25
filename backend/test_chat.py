import requests

url = "http://localhost:8000/api/chat"
payload = {
    "messages": [
        {"role": "user", "content": "Hello"}
    ],
    "language": "English"
}
try:
    res = requests.post(url, json=payload)
    print(res.status_code)
    print(res.json())
except Exception as e:
    print("Error:", e)
