import os
import sys
import base64
import tempfile
from dotenv import load_dotenv

# Add parent directory to path so we can import database
parent_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, parent_dir)

# Load environment variables
env_path = os.path.join(parent_dir, "backend", ".env")
load_dotenv(env_path)

from backend.database import uploads_col

def migrate_existing_uploads():
    # Identify local uploads directory
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(tempfile.gettempdir(), "hackverse_uploads"))
    print(f"[*] Scanning local uploads directory: {UPLOAD_DIR}")
    
    if not os.path.exists(UPLOAD_DIR):
        print("[!] Local uploads directory does not exist. Nothing to migrate locally.")
        return

    # Find records in MongoDB that don't have base64 data yet
    records = list(uploads_col.find({"data_base64": {"$exists": False}}))
    print(f"[*] Found {len(records)} upload records in MongoDB lacking Base64 content.")

    if not records:
        print("[+] All upload records in MongoDB are already migrated!")
        return

    success_count = 0
    missing_count = 0

    for idx, record in enumerate(records):
        filename = record.get("saved_name")
        if not filename:
            continue

        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            try:
                with open(file_path, "rb") as f:
                    file_bytes = f.read()
                
                file_base64 = base64.b64encode(file_bytes).decode("utf-8")
                
                # Update document in MongoDB
                uploads_col.update_one(
                    {"_id": record["_id"]},
                    {"$set": {"data_base64": file_base64}}
                )
                print(f"[{idx+1}/{len(records)}] Successfully migrated '{filename}' to MongoDB.")
                success_count += 1
            except Exception as e:
                print(f"[!] Error migrating '{filename}': {e}")
        else:
            print(f"[!] Warning: File '{filename}' was not found in the local uploads directory.")
            missing_count += 1

    print(f"\n[+] Migration finished! Success: {success_count}, Missing/Expired: {missing_count}")

if __name__ == "__main__":
    migrate_existing_uploads()
