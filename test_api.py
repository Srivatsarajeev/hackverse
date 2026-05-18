import requests

url = "http://localhost:8000/api/admin/login"
data = {"username": "admin", "password": "NeoTokyoControl2026!"}

try:
    response = requests.post(url, json=data)
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
