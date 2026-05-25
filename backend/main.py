import os
import sys
import tempfile

# Ensure parent directory is in system path to support relative imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from backend.database import init_db
from backend.routes.register import router as register_router
from backend.routes.admin import router as admin_router

app = FastAPI(
    title="HACKVERSE 2.0 Backend Core",
    description="Secure registration and admin control panel backend for Hack4Soc.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup routine
@app.on_event("startup")
def startup_event():
    print("[SYSTEM] Initializing database indexes and admin credentials...")
    init_db()

# Persistent persistent route for uploads to support serverless environment
UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(tempfile.gettempdir(), "hackverse_uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

from backend.database import uploads_col
import base64
import io
from fastapi.responses import StreamingResponse, FileResponse
from fastapi import HTTPException

@app.get("/uploads/{filename}")
@app.get("/api/uploads/{filename}")
def get_upload_file(filename: str):
    """Retrieve uploaded documents from MongoDB or local ephemeral fallback."""
    # 1. Search in MongoDB (persistent database storage)
    record = uploads_col.find_one({"saved_name": filename})
    if record and "data_base64" in record:
        try:
            file_data = base64.b64decode(record["data_base64"].encode("utf-8"))
            mime_type = record.get("mime_type", "application/octet-stream")
            return StreamingResponse(io.BytesIO(file_data), media_type=mime_type)
        except Exception as e:
            print(f"[SYSTEM WARNING] Base64 decode failed for {filename}: {e}")
            
    # 2. Ephemeral disk fallback (useful for local development or fast local reads)
    local_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(local_path):
        return FileResponse(local_path)
        
    raise HTTPException(status_code=404, detail="File not found or has expired on serverless instance.")

# Include Routers
app.include_router(register_router)
app.include_router(admin_router)

# Custom Global Exception Handlers
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "detail": exc.detail
            }
        )
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "detail": exc.errors()
            }
        )
    print(f"[SYSTEM CRITICAL ERROR] {request.method} {request.url.path} - Exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "An unexpected error occurred on the server."
        }
    )

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "HACK4SOC 3.0 CONTROL CORE",
        "security": "JWT_ENCRYPTED"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
