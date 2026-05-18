import io
import csv
import bcrypt
from openpyxl import Workbook
from fastapi import APIRouter, Depends, HTTPException, Header, status
from fastapi.responses import StreamingResponse
from backend.models.schemas import AdminLoginSchema
from backend.database import registrations_col, admins_col
from backend.auth.jwt_handler import create_access_token, decode_access_token

router = APIRouter(prefix="/api/admin")

# Security Dependency
def get_current_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session breach detected. Access token is missing."
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access key has expired or is invalid. Please re-authenticate."
        )
    return payload

@router.post("/login")
def admin_login(data: AdminLoginSchema):
    """Authenticate system administrators and yield JWT tokens."""
    admin = admins_col.find_one({"username": data.username})
    if not admin or not bcrypt.checkpw(data.password.encode(), admin["password"].encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ACCESS DENIED: Unauthorized identity signatures."
        )
        
    # Generate token
    token = create_access_token({"sub": admin["username"], "role": admin.get("role", "admin")})
    return {
        "success": True,
        "token": token,
        "message": "Access authorized. Initiating mainframe synchronization."
    }

@router.get("/registrations")
def get_registrations(
    search: str = "",
    gender: str = "",
    passout_year: str = "",
    page: int = 1,
    limit: int = 10,
    admin: dict = Depends(get_current_admin)
):
    """Retrieve filtered, paginated participant registrations for the control dashboard."""
    query = {}
    if search:
        query["$or"] = [
            {"fullName": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"whatsapp": {"$regex": search, "$options": "i"}},
            {"participantId": {"$regex": search, "$options": "i"}},
            {"collegeName": {"$regex": search, "$options": "i"}},
            {"stream": {"$regex": search, "$options": "i"}},
            {"degree": {"$regex": search, "$options": "i"}}
        ]
    if gender:
        query["gender"] = gender
    if passout_year:
        query["passoutYear"] = passout_year

    total = registrations_col.count_documents(query)
    skip = (page - 1) * limit
    
    try:
        participants = list(registrations_col.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit))
        pages_count = (total + limit - 1) // limit if total > 0 else 0
        return {
            "success": True,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages_count,
            "data": participants
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mainframe database read failure: {e}"
        )

@router.get("/stats")
def get_stats(admin: dict = Depends(get_current_admin)):
    """Yield dashboard metrics, gender breakdown, and recent registrations."""
    try:
        total = registrations_col.count_documents({})
        
        # Gender breakdown counts
        genders = ["Male", "Female", "Other", "Prefer not to say"]
        gender_counts = {}
        for g in genders:
            gender_counts[g] = registrations_col.count_documents({"gender": g})
            
        # Passout Year breakdown counts
        years = ["2023", "2024", "2025", "2026", "2027", "2028"]
        passout_counts = {}
        for y in years:
            passout_counts[y] = registrations_col.count_documents({"passoutYear": y})
            
        # Recent registrations (last 5)
        recent = list(registrations_col.find({}, {"_id": 0}).sort("timestamp", -1).limit(5))
        
        return {
            "success": True,
            "total": total,
            "gender_counts": gender_counts,
            "passout_counts": passout_counts,
            "recent": recent
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database aggregation failure: {e}"
        )

@router.delete("/registrations/{participant_id}")
def delete_registration(participant_id: str, admin: dict = Depends(get_current_admin)):
    """De-register and erase a participant from the mainframe."""
    try:
        result = registrations_col.delete_one({"participantId": participant_id})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target participant signature not found."
            )
        return {
            "success": True,
            "message": f"Participant {participant_id} successfully deleted from mainframe database."
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"De-registration database failure: {e}"
        )

@router.get("/export/csv")
def export_csv(admin: dict = Depends(get_current_admin)):
    """Export complete participant roster list in standard CSV format."""
    try:
        participants = list(registrations_col.find({}, {"_id": 0}))
        if not participants:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roster database is currently empty."
            )
        
        stream = io.StringIO()
        writer = csv.writer(stream)
        writer.writerow([
            "Participant ID", "Full Name", "Email", "WhatsApp Number", "Alternate Phone", 
            "Date of Birth", "Gender", "Country", "State", "City", "Occupation",
            "College Name", "Degree", "Stream", "Passout Year", "GitHub URL", "LinkedIn URL", "Registration Time"
        ])
        
        for p in participants:
            alt_phone = p.get("alternatePhone") if not p.get("alternatePhoneSame") else p.get("whatsapp")
            writer.writerow([
                p.get("participantId"),
                p.get("fullName"),
                p.get("email"),
                p.get("whatsapp"),
                alt_phone,
                p.get("dob"),
                p.get("gender"),
                p.get("country"),
                p.get("state"),
                p.get("city"),
                p.get("occupation"),
                p.get("collegeName"),
                p.get("degree"),
                p.get("stream"),
                p.get("passoutYear"),
                p.get("githubUrl"),
                p.get("linkedinUrl"),
                p.get("timestamp")
            ])
            
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=hack4soc_registrations.csv"
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV compile error: {e}"
        )

@router.get("/export/excel")
def export_excel(admin: dict = Depends(get_current_admin)):
    """Export complete participant roster list in Excel (.xlsx) format using pure-python openpyxl."""
    try:
        participants = list(registrations_col.find({}, {"_id": 0}))
        if not participants:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roster database is currently empty."
            )
        
        wb = Workbook()
        ws = wb.active
        ws.title = "Hack4Soc Registrations"
        
        # Header block
        ws.append([
            "Participant ID", "Full Name", "Email", "WhatsApp Number", "Alternate Phone", 
            "Date of Birth", "Gender", "Country", "State", "City", "Occupation",
            "College Name", "Degree", "Stream", "Passout Year", "GitHub URL", "LinkedIn URL", "Registration Time"
        ])
        
        # Appends records
        for p in participants:
            alt_phone = p.get("alternatePhone") if not p.get("alternatePhoneSame") else p.get("whatsapp")
            ws.append([
                p.get("participantId"),
                p.get("fullName"),
                p.get("email"),
                p.get("whatsapp"),
                alt_phone,
                p.get("dob"),
                p.get("gender"),
                p.get("country"),
                p.get("state"),
                p.get("city"),
                p.get("occupation"),
                p.get("collegeName"),
                p.get("degree"),
                p.get("stream"),
                p.get("passoutYear"),
                p.get("githubUrl"),
                p.get("linkedinUrl"),
                p.get("timestamp")
            ])
            
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        response = StreamingResponse(
            output, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response.headers["Content-Disposition"] = "attachment; filename=hack4soc_registrations.xlsx"
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Excel compilation error: {e}"
        )


