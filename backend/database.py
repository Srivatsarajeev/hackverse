import os
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables from backend directory
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/hackverse")

# Setup MongoClient
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database() # Auto-extract database name from URI, e.g. "hackverse"
    if not db.name:
        db = client.get_database("hackverse")
except Exception as e:
    print(f"[DATABASE ERROR] Could not connect to MongoDB Atlas: {e}")
    # Fallback to local MongoDB mock client or log warning
    client = MongoClient("mongodb://localhost:27017/hackverse")
    db = client.get_database("hackverse")

# Collections
registrations_col = db["registrations"]
admins_col = db["admins"]
uploads_col = db["uploads"]

def init_db():
    """Ensure indexes and default admin user are configured in the database."""
    try:
        # Create indexes for fast search and unique constraints
        registrations_col.create_index("participantId", unique=True)
        registrations_col.create_index("email", unique=True)
        registrations_col.create_index("whatsapp", unique=True)
        admins_col.create_index("username", unique=True)
        
        # Initialize default admin
        admin_user = os.getenv("ADMIN_USERNAME", "admin")
        admin_pass = os.getenv("ADMIN_PASSWORD", "NeoTokyoControl2026!")
        
        existing = admins_col.find_one({"username": admin_user})
        if not existing:
            hashed_pass = bcrypt.hashpw(admin_pass.encode(), bcrypt.gensalt()).decode()
            admins_col.insert_one({
                "username": admin_user,
                "password": hashed_pass,
                "role": "superadmin"
            })
            print(f"[DATABASE] Default admin '{admin_user}' initialized successfully.")
    except Exception as e:
        print(f"[DATABASE INIT WARNING] Indexes or default admin setup bypassed: {e}")
