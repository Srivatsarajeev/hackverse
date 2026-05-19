import os
import json
import bcrypt
import tempfile
import threading
import copy
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables from backend directory
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/hackverse")
MONGO_TIMEOUT_MS = int(os.getenv("MONGO_TIMEOUT_MS", "5000"))


class _FileCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, key, direction):
        reverse = direction == -1
        self.documents.sort(key=lambda doc: doc.get(key, ""), reverse=reverse)
        return self

    def skip(self, count):
        self.documents = self.documents[count:]
        return self

    def limit(self, count):
        self.documents = self.documents[:count]
        return self

    def __iter__(self):
        return iter(self.documents)


class _DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count


class _InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class _FileCollection:
    def __init__(self, database, name):
        self.database = database
        self.name = name

    def create_index(self, *args, **kwargs):
        return None

    def find_one(self, query):
        for document in self.database._read().get(self.name, []):
            if self._matches(document, query):
                return copy.deepcopy(document)
        return None

    def insert_one(self, document):
        with self.database.lock:
            data = self.database._read_unlocked()
            collection = data.setdefault(self.name, [])
            saved = copy.deepcopy(document)
            saved.setdefault("_id", f"{self.name}_{len(collection) + 1}")
            collection.append(saved)
            self.database._write_unlocked(data)
            return _InsertResult(saved["_id"])

    def count_documents(self, query):
        return len([doc for doc in self.database._read().get(self.name, []) if self._matches(doc, query)])

    def find(self, query=None, projection=None):
        query = query or {}
        documents = []
        for document in self.database._read().get(self.name, []):
            if self._matches(document, query):
                documents.append(self._project(document, projection))
        return _FileCursor(documents)

    def delete_one(self, query):
        with self.database.lock:
            data = self.database._read_unlocked()
            collection = data.setdefault(self.name, [])
            for index, document in enumerate(collection):
                if self._matches(document, query):
                    del collection[index]
                    self.database._write_unlocked(data)
                    return _DeleteResult(1)
            return _DeleteResult(0)

    def _project(self, document, projection):
        result = copy.deepcopy(document)
        if projection and projection.get("_id") == 0:
            result.pop("_id", None)
        return result

    def _matches(self, document, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(self._matches(document, option) for option in expected):
                    return False
                continue

            actual = document.get(key)
            if isinstance(expected, dict) and "$regex" in expected:
                import re

                flags = re.IGNORECASE if expected.get("$options") == "i" else 0
                if not re.search(expected["$regex"], str(actual or ""), flags):
                    return False
            elif actual != expected:
                return False
        return True


class _FileDatabase:
    def __init__(self, path):
        self.path = path
        self.name = "hackverse_file_db"
        self.lock = threading.RLock()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if not os.path.exists(path):
            self._write_unlocked({})

    def __getitem__(self, name):
        return _FileCollection(self, name)

    def _read(self):
        with self.lock:
            return self._read_unlocked()

    def _read_unlocked(self):
        try:
            with open(self.path, "r", encoding="utf-8") as handle:
                return json.load(handle)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _write_unlocked(self, data):
        with open(self.path, "w", encoding="utf-8") as handle:
            json.dump(data, handle, indent=2)


def _build_file_database():
    fallback_path = os.getenv(
        "FILE_DB_PATH",
        os.path.join(tempfile.gettempdir(), "hackverse_file_db.json")
    )
    print(f"[DATABASE WARNING] Using file database fallback at {fallback_path}")
    return _FileDatabase(fallback_path)

# Setup MongoClient
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=MONGO_TIMEOUT_MS,
        connectTimeoutMS=MONGO_TIMEOUT_MS,
        socketTimeoutMS=MONGO_TIMEOUT_MS,
    )
    db = client.get_default_database(default="hackverse")
    client.admin.command("ping")
except Exception as e:
    print(f"[DATABASE ERROR] Could not connect to MongoDB: {e}")
    client = None
    db = _build_file_database()

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
