from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class ParticipantRegisterSchema(BaseModel):
    # Required Fields
    collegeName: str = Field(..., min_length=2, max_length=255)
    teamName: str = Field(..., min_length=2, max_length=150)
    fullName: str = Field(..., min_length=2, max_length=255, description="Team Leader Name")
    whatsapp: str = Field(..., min_length=7, max_length=20, description="Leader Phone Number")
    alternatePhone: str = Field("", max_length=20, description="Alternative Phone Number of Leader")
    degree: str = Field(..., min_length=2, max_length=100, description="BCA or MCA")
    
    # Team members info
    teamSize: int = Field(1, description="Min 1, Max 2 option")
    member2Name: Optional[str] = Field("", max_length=255)
    member2Phone: Optional[str] = Field("", max_length=20)
    
    # Uploads & UTR
    idCardFileUrl: str = Field(..., min_length=5, max_length=500, description="Merged college IDs URL")
    idCardFileName: str = Field("", max_length=255)
    paymentUtr: str = Field(..., min_length=6, max_length=100, description="Payment ID UTR")
    paymentReceiptUrl: str = Field(..., min_length=5, max_length=500, description="Payment proof receipt screenshot URL")
    paymentReceiptName: str = Field("", max_length=255)
    
    # Optional Legacy Fields (to maintain complete backwards compatibility and prevent crashes)
    email: Optional[EmailStr] = Field(None)
    alternatePhoneSame: bool = Field(False)
    dob: Optional[str] = Field("2000-01-01")
    gender: Optional[str] = Field("Prefer not to say")
    country: Optional[str] = Field("India")
    state: Optional[str] = Field("Karnataka")
    city: Optional[str] = Field("Bangalore")
    occupation: Optional[str] = Field("College Student")
    collegeCountry: Optional[str] = Field("India")
    collegeState: Optional[str] = Field("Karnataka")
    collegeCity: Optional[str] = Field("Bangalore")
    stream: Optional[str] = Field("Computer Applications")
    yearOfStudy: Optional[str] = Field("1st Year")
    passoutYear: Optional[str] = Field("2026")
    domain: Optional[str] = Field("AI")
    projectTitle: Optional[str] = Field("Autonomous Hack")
    problemStatement: Optional[str] = Field("")
    proposedSolution: Optional[str] = Field("")
    technologiesUsed: Optional[str] = Field("")
    githubUrl: Optional[str] = Field("")
    linkedinUrl: Optional[str] = Field("")
    termsAccepted: bool = Field(True)
    communicationsAccepted: bool = Field(True)


class AdminLoginSchema(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
