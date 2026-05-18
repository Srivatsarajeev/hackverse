from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class ParticipantRegisterSchema(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    whatsapp: str = Field(..., min_length=7, max_length=20)
    alternatePhoneSame: bool = Field(True)
    alternatePhone: str = Field("", max_length=20)
    dob: str = Field(..., description="Date of Birth in YYYY-MM-DD")
    gender: str = Field(..., description="Male, Female, Other, Prefer not to say")
    country: str = Field("India")
    state: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    occupation: str = Field("College Student")
    
    # Optional academic details (not required if occupation is Working Professional)
    collegeName: str = Field("", max_length=255)
    collegeCountry: str = Field("India")
    collegeState: str = Field("")
    collegeCity: str = Field("")
    degree: str = Field("", max_length=100)
    stream: str = Field("", max_length=100)
    passoutYear: str = Field("2026", description="Graduation year e.g. 2026")
    
    # Optional socials (removed from UI)
    githubUrl: str = Field("", description="GitHub URL")
    linkedinUrl: str = Field("", description="LinkedIn URL")
    
    termsAccepted: bool = Field(True)
    communicationsAccepted: bool = Field(True)


class AdminLoginSchema(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
