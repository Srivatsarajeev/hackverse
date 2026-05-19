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
            detail="Session expired. Access token is missing."
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired or is invalid. Please log in again."
        )
    return payload

@router.post("/login")
def admin_login(data: AdminLoginSchema):
    """Authenticate system administrators and yield JWT tokens."""
    admin = admins_col.find_one({"username": data.username})
    if not admin or not bcrypt.checkpw(data.password.encode(), admin["password"].encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Denied: Invalid credentials."
        )
        
    # Generate token
    token = create_access_token({"sub": admin["username"], "role": admin.get("role", "admin")})
    return {
        "success": True,
        "token": token,
        "message": "Access authorized. Synchronizing dashboard."
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
            detail=f"Database read failure: {e}"
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
    """Delete a participant registration."""
    try:
        result = registrations_col.delete_one({"participantId": participant_id})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found."
            )
        return {
            "success": True,
            "message": f"Participant {participant_id} successfully deleted."
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete registration: {e}"
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
            "Participant ID", "Team Name", "College Name", "Leader Name", "Leader Phone (WhatsApp)", "Alternate Phone", 
            "Course / Degree", "Team Size", "Member 2 Name", "Member 2 Phone", 
            "Member 3 Name", "Member 3 Phone", "Member 4 Name", "Member 4 Phone",
            "Payment UTR", "ID Card File URL", "Payment Receipt URL", "Registration Time"
        ])
        
        for p in participants:
            writer.writerow([
                p.get("participantId"),
                p.get("teamName", ""),
                p.get("collegeName"),
                p.get("fullName"),
                p.get("whatsapp"),
                p.get("alternatePhone", ""),
                p.get("degree"),
                p.get("teamSize", 1),
                p.get("member2Name", ""),
                p.get("member2Phone", ""),
                p.get("member3Name", ""),
                p.get("member3Phone", ""),
                p.get("member4Name", ""),
                p.get("member4Phone", ""),
                p.get("paymentUtr", ""),
                p.get("idCardFileUrl", ""),
                p.get("paymentReceiptUrl", ""),
                p.get("timestamp")
            ])
            
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=hackverse_registrations.csv"
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
        ws.title = "Hackverse Registrations"
        
        # Header block
        ws.append([
            "Participant ID", "Team Name", "College Name", "Leader Name", "Leader Phone (WhatsApp)", "Alternate Phone", 
            "Course / Degree", "Team Size", "Member 2 Name", "Member 2 Phone", 
            "Member 3 Name", "Member 3 Phone", "Member 4 Name", "Member 4 Phone",
            "Payment UTR", "ID Card File URL", "Payment Receipt URL", "Registration Time"
        ])
        
        # Appends records
        for p in participants:
            ws.append([
                p.get("participantId"),
                p.get("teamName", ""),
                p.get("collegeName"),
                p.get("fullName"),
                p.get("whatsapp"),
                p.get("alternatePhone", ""),
                p.get("degree"),
                p.get("teamSize", 1),
                p.get("member2Name", ""),
                p.get("member2Phone", ""),
                p.get("member3Name", ""),
                p.get("member3Phone", ""),
                p.get("member4Name", ""),
                p.get("member4Phone", ""),
                p.get("paymentUtr", ""),
                p.get("idCardFileUrl", ""),
                p.get("paymentReceiptUrl", ""),
                p.get("timestamp")
            ])
            
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        response = StreamingResponse(
            output, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response.headers["Content-Disposition"] = "attachment; filename=hackverse_registrations.xlsx"
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Excel compilation error: {e}"
        )


