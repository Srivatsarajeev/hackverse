import os
import time
import random
import tempfile
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import EmailStr
from backend.models.schemas import ParticipantRegisterSchema
from backend.database import registrations_col, uploads_col

router = APIRouter(prefix="/api")

# Ensure uploads directory exists
UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(tempfile.gettempdir(), "hackverse_uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/register", status_code=201)
def register_participant(data: ParticipantRegisterSchema):
    """Register a new participant for Hackverse 2.0 with duplicate prevention."""
    # Automatically generate Participant ID in matching format (e.g. H4S-2026-4012)
    random_code = random.randint(1000, 9999)
    participant_id = f"HV-2026-{random_code}"
    
    # Make sure participantId is unique
    while registrations_col.find_one({"participantId": participant_id}):
        random_code = random.randint(1000, 9999)
        participant_id = f"HV-2026-{random_code}"

    # Prepare document
    new_participant = data.model_dump()
    new_participant["participantId"] = participant_id
    new_participant["timestamp"] = datetime.now(timezone.utc).isoformat()

    try:
        registrations_col.insert_one(new_participant)
        return {
            "success": True,
            "message": "Welcome to Hackverse 2.0. Registration completed successfully.",
            "teamId": participant_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database write failure: {e}"
        )

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Securely upload participant documents."""
    # Validate extension
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF, PPT/PPTX, JPG, PNG, or WEBP formats are allowed."
        )

    # Validate size (10MB Max size limit)
    MAX_SIZE = 10 * 1024 * 1024
    try:
        contents = await file.read()
        size = len(contents)
        await file.seek(0)
        
        if size > MAX_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 10MB limit."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read file upload: {e}"
        )

    # Generate secure unique name to prevent collisions
    unique_prefix = f"{int(time.time())}_{random.randint(1000, 9999)}"
    safe_filename = f"{unique_prefix}{ext}"
    destination_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(destination_path, "wb") as buffer:
            buffer.write(contents)
            
        import base64
        file_base64 = base64.b64encode(contents).decode("utf-8")

        # Log to upload database
        upload_record = {
            "original_name": filename,
            "saved_name": safe_filename,
            "file_size": size,
            "mime_type": file.content_type,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "data_base64": file_base64
        }
        uploads_col.insert_one(upload_record)
        
        # In a real setup, return public URL path
        return {
            "success": True,
            "filename": safe_filename,
            "url": f"/uploads/{safe_filename}",
            "message": "File uploaded successfully."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file on server: {e}"
        )
