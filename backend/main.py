import os
import sys

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
    description="Futuristic secure registration and control panel mainframe for Neo Tokyo.",
    version="2.0.0"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup routine
@app.on_event("startup")
def startup_event():
    print("[MAINFRAME] Initializing database indexes and security credentials...")
    init_db()

# Mount uploads directory as static route
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(register_router)
app.include_router(admin_router)

# Custom Global Exception Handlers
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    print(f"[MAINFRAME CRITICAL ERROR] {request.method} {request.url.path} - Exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "Mainframe execution breach. Command execution has been suspended."
        }
    )

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "mainframe": "HACKVERSE 2.0 CONTROL CORE",
        "security": "JWT_ENCRYPTED"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
