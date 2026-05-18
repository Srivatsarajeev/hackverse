import requests

url = "http://localhost:8000/api/register"
data = {
    "fullName": "Test User",
    "email": "test@example.com",
    "whatsapp": "1234567890",
    "alternatePhone": "0987654321",
    "alternatePhoneSame": False,
    "dob": "2000-01-01",
    "gender": "Male",
    "country": "India",
    "state": "Karnataka",
    "city": "Bangalore",
    "occupation": "Student",
    "collegeName": "BMSIT",
    "collegeState": "Karnataka",
    "collegeCity": "Bangalore",
    "degree": "B.E",
    "stream": "CS",
    "passoutYear": "2024",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "termsAccepted": True,
    "communicationsAccepted": True
}

try:
    response = requests.post(url, json=data)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
